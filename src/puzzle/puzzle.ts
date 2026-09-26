import { computed, type Signal, signal } from "@lit-labs/signals";
import * as Sentry from "@sentry/browser";
import { proxy, releaseProxy, transfer, wrap } from "comlink";
import { assertNever } from "../engine/assert-never.ts";
import type {
  ChangeNotification,
  Color,
  ConfigDescription,
  ConfigValues,
  CustomParamsEncoding,
  FontInfo,
  GameStatus,
  KeyLabel,
  Point,
  PresetMenuEntry,
  PuzzleStaticAttributes,
  ReferenceModel,
  Size,
  TimerReadout,
} from "../engine/types.ts";
import {
  installWorkerErrorReceivers,
  uninstallWorkerErrorReceivers,
} from "../utils/errors.ts";
import { nextAnimationFrame } from "../utils/timing.ts";
import { type ChoiceNames, puzzleAugmentations } from "./augmentation.ts";
import { puzzleDataMap } from "./catalog.ts";
import { sameTimer } from "./timer.ts";
import type { RemoteWorkerPuzzle, RemoteWorkerPuzzleFactory } from "./worker.ts";

const sentryWebWorkerIntegration = import.meta.env.VITE_SENTRY_DSN
  ? Sentry.webWorkerIntegration({ worker: [] })
  : null;
if (sentryWebWorkerIntegration) {
  Sentry.addIntegration(sentryWebWorkerIntegration);
}

/**
 * Uniform dwell per auto-hint step (ms). Every game's auto-play paces at
 * this rate. The engine stretches each animated hint move to the *same*
 * duration (`HINT_ANIM_S` in `midend.ts` — keep the two equal), so an
 * animated step is continuous motion with no frozen gap before the next;
 * a non-animated game has no animation to stretch and is paced purely by
 * this dwell. One place tunes the feel of auto-hint across the collection.
 */
const AUTO_HINT_STEP_MS = 1000;

/**
 * How long a Hint press may go unanswered before the app says it is thinking
 * (`Puzzle.hintPending`). Short enough that a slow search is labeled for
 * nearly all of its length, long enough that an ordinary hint never flickers.
 */
export const HINT_PENDING_MS = 300;

/** The banner's wording for a pending hint; the Hint control says it too. */
export const HINT_PENDING_MESSAGE = "Thinking…";

/**
 * Public API to the puzzle engine running in a worker.
 *
 * Exposes reactive properties for puzzle state, and async methods that proxy
 * (over Comlink) to the worker-side `PuzzleEngineSurface`.
 */
export class Puzzle {
  public static async create(puzzleId: string): Promise<Puzzle> {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.setTag("puzzleId", puzzleId);
    }
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
      name: `puzzle-worker-${puzzleId}`,
    });
    if (sentryWebWorkerIntegration) {
      sentryWebWorkerIntegration.addWorker(worker);
      // Handle forwarded event enrichment data from worker
      worker.addEventListener("message", (event: MessageEvent<unknown>) => {
        if (
          typeof event.data === "object" &&
          event.data !== null &&
          "type" in event.data &&
          event.data.type === "sentry-breadcrumb" &&
          "breadcrumb" in event.data &&
          typeof event.data.breadcrumb === "object" &&
          event.data.breadcrumb !== null
        ) {
          Sentry.addBreadcrumb(event.data.breadcrumb);
        }
      });
    }
    installWorkerErrorReceivers(worker);
    const workerFactory = wrap<RemoteWorkerPuzzleFactory>(worker);
    const workerPuzzle = await workerFactory.create(puzzleId);

    const staticProps = await workerPuzzle.getStaticProperties();
    const puzzle = new Puzzle(puzzleId, worker, workerPuzzle, staticProps);
    await puzzle.initialize();
    return puzzle;
  }

  // Private constructor; use Puzzle.create(puzzleId) to instantiate a Puzzle.
  private constructor(
    public readonly puzzleId: string,
    private readonly worker: Worker,
    private readonly workerPuzzle: RemoteWorkerPuzzle,
    {
      canSolve,
      canHint,
      canFindMistakes,
      hasReference,
      canMarkAll,
      ignoresSecondaryButton,
      wantsStatusbar,
    }: PuzzleStaticAttributes,
  ) {
    // The catalog is the only place a display name lives.
    // `catalog-registry.test.ts` holds the catalog and the registry equal in both
    // directions, so `?? puzzleId` is unreachable for any puzzle the app can
    // route to.
    this.displayName = puzzleDataMap[puzzleId]?.name ?? puzzleId;
    this.canSolve = canSolve;
    this.canHint = canHint;
    this.canFindMistakes = canFindMistakes;
    this.hasReference = hasReference;
    this.canMarkAll = canMarkAll;
    this.ignoresSecondaryButton = ignoresSecondaryButton;
    this.wantsStatusbar = wantsStatusbar;
  }

  private async initialize(): Promise<void> {
    await this.workerPuzzle.setCallbacks(
      proxy(this.notifyChange),
      proxy(this.notifyTimerState),
    );
  }

  public async delete(): Promise<void> {
    this.stopAutoHint();
    await this.detachCanvas();
    await this.workerPuzzle.delete();
    this.workerPuzzle[releaseProxy]();
    uninstallWorkerErrorReceivers(this.worker);
    this.worker.terminate();
  }

  private _size = "<unknown>";

  private captureSentryContext() {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.setContext("Puzzle", {
        "Puzzle ID": this.puzzleId,
        Params: this.params,
        "Game ID": this.currentGameId,
        "Random Seed": this.randomSeed,
        "Current Move": this.currentMove,
        "Total Moves": this.totalMoves,
        Size: this._size,
      });
    }
  }

  private notifyChange = async (message: ChangeNotification) => {
    // Callback from the worker's midend: mirror the notification into signals.
    function update<T>(signal: Signal.State<T>, newValue: T) {
      if (signal.get() !== newValue) {
        signal.set(newValue);
      }
    }

    switch (message.type) {
      case "game-id-change": {
        update(this._currentGameId, message.currentGameId);
        update(this._randomSeed, message.randomSeed ?? null);
        update(this._restoreGameId, message.restoreGameId);
        break;
      }
      case "game-state-change":
        this.purgeInvalidCheckpoints(message.totalMoves);
        update(this._status, message.status);
        update(this._currentMove, message.currentMove);
        update(this._totalMoves, message.totalMoves);
        update(this._canUndo, message.canUndo);
        update(this._canRedo, message.canRedo);
        update(this._hasPencilMarks, message.hasPencilMarks);
        update(this._uiState, message.uiState ?? "");
        break;
      case "params-change":
        update(this._params, message.params);
        break;
      case "status-bar-change":
        update(this._statusbarText, message.statusBarText);
        update(this._activeHintExplanation, message.activeHintExplanation ?? "");
        // Rendered as "Step 2 of 3" beside a multi-leg hint; empty for a
        // single-leg one, which is most of them.
        update(
          this._hintJourney,
          message.hintJourney && message.hintJourney.length > 1
            ? `Step ${message.hintJourney.index} of ${message.hintJourney.length}`
            : "",
        );
        break;
      case "timer-change":
        // Compared by value: the engine sends a fresh object each second.
        if (!sameTimer(this._timer.get(), message.timer))
          this._timer.set(message.timer);
        break;
      default:
        assertNever(message, "Puzzle: notifyChange");
    }

    this.captureSentryContext();
  };

  private inputQueue: Promise<void> = Promise.resolve();

  /** Keep input that reaches the midend strictly ordered. */
  protected enqueueInput<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.inputQueue.then(fn);
    this.inputQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  // Static properties (no reactivity needed)
  public readonly displayName: string;
  public readonly canSolve: boolean;
  public readonly canHint: boolean;
  public readonly canFindMistakes: boolean;
  public readonly hasReference: boolean;
  public readonly canMarkAll: boolean;
  public readonly ignoresSecondaryButton: boolean;
  public readonly wantsStatusbar: boolean;

  // Reactive properties
  private _status = signal<GameStatus>("ongoing");
  private _currentMove = signal<number>(0);
  private _totalMoves = signal<number>(0);
  private _canUndo = signal(false);
  private _canRedo = signal(false);
  /** Whether the board carries any pencil marks — what makes the Mark-all
   * control say `Fill` on a bare board and `Update` once there is something to
   * narrow. Always false for a game without the press. */
  private _hasPencilMarks = signal(false);
  /** This game's saveable `Ui`, as the midend encodes it; empty for a game with
   * no `encodeUi`. Watched so that composing a Guess row — a `Ui` edit and not
   * a move — refreshes the autosave. See {@link NotifyGameStateChange.uiState}. */
  private _uiState = signal<string>("");
  /**
   * The board's resolved palette, as CSS colors — what the canvas is actually
   * painted with, after dark-mode authoring and the background's hue tint
   * (`components/view.ts` computes it and hands it to the drawing).
   *
   * A signal because the key panel reads it too: a `KeyLabel.swatch` names a
   * palette index, and a key painted from anywhere but *this* array would
   * disagree with the board the moment the color scheme flips.
   */
  private _palette = signal<readonly string[]>([]);
  private _params = signal<string>("");
  private _currentParams = computed<string | null>(
    () =>
      // The **full** params of the board on screen — difficulty included, which
      // is what every consumer wants: the type-menu label, the share dialog's
      // type description, and the keypad/view re-render keys. Only
      // `restoreGameId` carries them unconditionally: `currentGameId`'s params
      // are lossy, and a board restored from a descriptive id has no `randomSeed`.
      this.restoreGameId?.split(":", 1).at(0) ?? null,
  );
  private _currentGameId = signal<string | null>(null);
  private _randomSeed = signal<string | null>(null);
  private _restoreGameId = signal<string | null>(null);
  private _canFormatAsText = signal(false);
  private _statusbarText = signal<string>("");
  /** The solve timer, or `null` while the player has it switched off for this
   * game. */
  private _timer = signal<TimerReadout | null>(null);
  private _generatingGame = signal<boolean>(false);
  private _autoHintActive = signal<boolean>(false);
  private _helpMessage = signal<string>("");
  private _activeHintExplanation = signal<string>("");
  /** "Step 2 of 3" while one deduction plays out over several legs; empty for a
   * single-leg hint and when no hint is displayed. Formatted here rather than
   * in the chrome so the two surfaces that show it (the rail and the phone's
   * hint strip) cannot word it differently. */
  private _hintJourney = signal<string>("");
  private _helpMessageTimeoutId?: ReturnType<typeof setTimeout>;
  /** A `processHover` round trip is outstanding. */
  private hoverInFlight = false;
  /** The hover to send once the outstanding one returns, or `null` for none.
   * Wrapped, because the position may itself be `null` (the pointer left). */
  private hoverPending: { at: Point | null } | null = null;
  /**
   * Stepper state for the Hint button. A press that *shows* a step arms this;
   * the next press (with nothing else done in between) *applies* that one step
   * via `executeHint`, then re-arms so repeated presses walk the plan one move
   * per press — a manual, self-paced version of Auto-Hint. Any intervening user
   * action disarms it via `disarmHintApply()`, so the next press shows the
   * now-relevant step rather than applying a stale one.
   *
   * A **signal**, because the chrome reads it: the hint control says
   * `Next hint` while a press would show one and `Apply the hint` while a press
   * would play it, and a label that only changed on the *next* unrelated
   * re-render would be wrong for exactly the moment it matters.
   */
  private _hintArmedToApply = signal(false);

  /**
   * True while a Hint press is being answered by the worker. A further press
   * meanwhile is **dropped**, not queued: `hint()` does not go through
   * `enqueueInput`, so a queued press is another worker round-trip, and on a
   * Sixteen 5×5 endgame, where one hint costs ~3–4 s, a burst of presses left
   * the app looking frozen for minutes. Dropping is right in both beats: during a
   * *show* nothing is armed yet, and during an *apply* the step was disarmed
   * on the way in, so the press after the answer lands does what the player
   * would expect from a fresh press.
   */
  private _hintInFlight = false;

  /**
   * True once a Hint press has been in flight for `HINT_PENDING_MS` and is
   * still unanswered. The chrome reads it — the Hint control says "Thinking…"
   * and the banner says the same — so a slow hint reads as work in progress
   * rather than a dead button. A **signal** for the same reason
   * `_hintArmedToApply` is one: the label has to change at the moment it
   * matters, not on the next unrelated re-render.
   *
   * Delayed, so an ordinary hint (tens of milliseconds) never flickers; the
   * delay is short enough that a Sixteen endgame search (~3–4 s) is labeled
   * for nearly all of its length. Not cancellable, deliberately: the search
   * runs synchronously inside the worker, so interrupting it would need every
   * game's search to poll a flag, and the longest case is a few seconds once or
   * twice a game — making the wait legible is the whole fix.
   */
  private _hintPending = signal(false);

  /** Whether the next Hint press applies the step on display rather than
   * showing a new one — the stepper's second beat. */
  public get hintArmedToApply(): boolean {
    return this._hintArmedToApply.get();
  }

  /** Whether a Hint press has been waiting on the worker long enough to say so. */
  public get hintPending(): boolean {
    return this._hintPending.get();
  }

  /** Called by every intervening user action so a subsequent Hint press shows
   * rather than applies. The stepper's own `executeHint` deliberately does not
   * route through here. */
  private disarmHintApply(): void {
    this._hintArmedToApply.set(false);
  }

  private setHelpMessage(msg: string, temp = false): void {
    if (this._helpMessageTimeoutId !== undefined) {
      clearTimeout(this._helpMessageTimeoutId);
      this._helpMessageTimeoutId = undefined;
    }
    this._helpMessage.set(msg);
    if (temp && msg !== "") {
      this._helpMessageTimeoutId = setTimeout(() => {
        if (this._helpMessage.get() === msg) {
          this._helpMessage.set("");
        }
        this._helpMessageTimeoutId = undefined;
      }, 3000);
    }
  }

  public get autoHintActive(): boolean {
    return this._autoHintActive.get();
  }

  public get helpMessage(): string {
    return this._helpMessage.get();
  }

  public get hintJourney(): string {
    return this._hintJourney.get();
  }

  public get activeHintExplanation(): string {
    return this._activeHintExplanation.get();
  }

  public get status(): GameStatus {
    return this._status.get();
  }

  public get isSolved(): boolean {
    return this.status === "solved" || this.status === "solved-with-help";
  }

  public get currentMove(): number {
    return this._currentMove.get();
  }

  public get totalMoves(): number {
    return this._totalMoves.get();
  }

  public get canUndo(): boolean {
    return this._canUndo.get();
  }

  public get hasPencilMarks(): boolean {
    return this._hasPencilMarks.get();
  }

  public get uiState(): string {
    return this._uiState.get();
  }

  public get canRedo(): boolean {
    return this._canRedo.get();
  }

  // The encoded game params that will be used for the next "new game".
  public get params(): string {
    return this._params.get();
  }

  // The encoded game params in effect for the current game.
  public get currentParams(): string | null {
    return this._currentParams.get();
  }

  public get currentGameId(): string | null {
    return this._currentGameId.get();
  }

  /**
   * The current board addressed for **re-dealing it here** — `params:desc` with
   * the full params, difficulty included. Use this to remember a board;
   * {@link currentGameId} is the one to *show or share*, and its params are
   * deliberately lossy (see `NotifyGameIdChange`).
   */
  public get restoreGameId(): string | null {
    return this._restoreGameId.get();
  }

  public get randomSeed(): string | null {
    return this._randomSeed.get();
  }

  public get canFormatAsText(): boolean {
    return this._canFormatAsText.get();
  }

  public get statusbarText(): string | null {
    return this._statusbarText.get();
  }

  public get timer(): TimerReadout | null {
    return this._timer.get();
  }

  public async setTimerPaused(paused: boolean): Promise<void> {
    await this.workerPuzzle.setTimerPaused(paused);
  }

  public get generatingGame(): boolean {
    return this._generatingGame.get();
  }

  // Methods
  public async newGame(): Promise<void> {
    this.stopAutoHint("");
    this.setHelpMessage("");
    this._activeHintExplanation.set("");
    this._generatingGame.set(true);
    await this.workerPuzzle.newGame(this.boardArea ?? undefined);
    this._generatingGame.set(false);
  }

  /** The space the board is drawn in, as `<puzzle-view>` last measured it.
   * Only a new deal reads it, to choose which way round to deal the board; a
   * board already on screen is never turned. */
  private boardArea: Size | null = null;

  public setBoardArea(area: Size): void {
    this.boardArea = area;
  }

  public async newGameFromId(id: string): Promise<string | null> {
    this.stopAutoHint("");
    this.setHelpMessage("");
    this._activeHintExplanation.set("");
    return this.workerPuzzle.newGameFromId(id);
  }

  public async restartGame(): Promise<void> {
    this.stopAutoHint("");
    this.setHelpMessage("");
    this._activeHintExplanation.set("");
    await this.workerPuzzle.restartGame();
  }

  public undo(): Promise<void> {
    this.stopAutoHint("Canceled by manual move");
    return this.enqueueInput(() => this.workerPuzzle.undo());
  }

  public redo(): Promise<void> {
    this.stopAutoHint("Canceled by manual move");
    return this.enqueueInput(() => this.workerPuzzle.redo());
  }

  public async solve(): Promise<string | null> {
    this.stopAutoHint("Canceled by manual move");
    // Solve applies a move, so it queues behind any step Auto-Hint has in
    // flight. A refusal is the only answer the press gets ("Game has not been
    // started yet"), so it goes where a refused hint goes.
    const err = await this.enqueueInput(() => this.workerPuzzle.solve());
    if (err) this.setHelpMessage(err, true);
    return err;
  }

  public async hint(): Promise<string | null> {
    if (this._hintInFlight) return null;
    this._hintInFlight = true;
    const pendingTimer = setTimeout(() => {
      this._hintPending.set(true);
      this.setHelpMessage(HINT_PENDING_MESSAGE);
    }, HINT_PENDING_MS);
    try {
      return await this.hintOnce();
    } finally {
      clearTimeout(pendingTimer);
      this._hintInFlight = false;
      if (this._hintPending.get()) {
        this._hintPending.set(false);
        // A refusal or "Hint applied" has replaced the message by now; a
        // successful show has not, so take it down rather than let it sit
        // under the explanation and reappear when that is hidden.
        if (this._helpMessage.get() === HINT_PENDING_MESSAGE) {
          this.setHelpMessage("");
        }
      }
    }
  }

  private async hintOnce(): Promise<string | null> {
    if (this.hintArmedToApply) {
      // Second press with nothing done in between: apply this one step in slow
      // motion and stop — `executeHint(true)` hides the plan on settle rather
      // than previewing the next step, and we disarm so the player gets a clean
      // show/apply/show/apply rhythm (one applied hint per request, ask again
      // for the next). An error (e.g. solved) just surfaces in the banner.
      this.disarmHintApply();
      const err = await this.executeHint(true);
      if (err) {
        this.setHelpMessage(err, true);
      } else if (!this.isSolved) {
        // Confirm the apply; the midend has hidden the (advanced) plan, so this
        // transient message is what the banner shows until the next request.
        this.setHelpMessage("Hint applied", true);
      }
      return err;
    }
    // First press: show the current step. `stopAutoHint` disarms (and cancels
    // any running Auto-Hint); we arm only if the show succeeds, so the *next*
    // press applies. A refusal ("fix the highlighted mistakes first", "already
    // solved", …) is surfaced in the same transient banner the auto-hint flow
    // uses (the midend also lights up any mistakes behind the message) and
    // never arms.
    this.stopAutoHint("Canceled by manual move");
    const err = await this.workerPuzzle.hint();
    if (err) {
      this.setHelpMessage(err, true);
      return err;
    }
    // Auto-Hint may have been started while the show was computing; it owns
    // the plan now, and arming behind it would make the next manual press
    // apply a step Auto-Hint is already applying.
    if (!this._autoHintActive.get()) this._hintArmedToApply.set(true);
    return null;
  }

  public async executeHint(hideAfter = false): Promise<string | null> {
    return this.enqueueInput(() => this.workerPuzzle.executeHint(hideAfter));
  }

  /** Check the board for mistakes: display them and return how many.
   * 0 for games without mistake-checking. */
  public async findMistakes(): Promise<number> {
    return this.workerPuzzle.findMistakes();
  }

  /** The active game's reference-aid model (inventory checklist with found
   * status), or null when the game has no reference aid. */
  public async getReference(): Promise<ReferenceModel | null> {
    return this.workerPuzzle.getReference();
  }

  /** Spotlight a reference item on the board (or clear it with null). A
   * `UI_UPDATE`-shaped change: the board repaints but no move is recorded. */
  public async selectReference(key: string | null): Promise<void> {
    return this.workerPuzzle.selectReference(key);
  }

  public startAutoHint(): void {
    if (!this.canHint) return;
    // Handing the whole plan to Auto-Hint is its own action; a Hint press after
    // pausing should show, not resume applying.
    this.disarmHintApply();
    if (this.isSolved) {
      this.setHelpMessage("Already solved!", true);
      return;
    }
    this.setHelpMessage("");
    this._autoHintActive.set(true);
    void this.runAutoHintLoop();
  }

  public stopAutoHint(reason?: string): void {
    // Every intervening user action funnels through here (undo/redo/solve/key/
    // pointer/new/restart/delete all call it), making it the single chokepoint
    // that also disarms the Hint stepper.
    this.disarmHintApply();
    if (this._autoHintActive.get()) {
      this._autoHintActive.set(false);
      if (reason !== "") {
        this.setHelpMessage(reason ?? "Paused", true);
      }
    }
  }

  private async runAutoHintLoop(): Promise<void> {
    while (this._autoHintActive.get() && !this.isSolved) {
      let err: string | null;
      try {
        err = await this.executeHint();
      } catch (error) {
        // A hint that throws has broken a promise the engine keeps, and the
        // error goes on to the crash dialog and Sentry; left running, the loop
        // would sit "active" with nothing driving it.
        this.stopAutoHint("");
        throw error;
      }
      if (err) {
        this.stopAutoHint(err);
        return;
      }
      // Dwell a uniform AUTO_HINT_STEP_MS on each step so every game's
      // auto-hint reads at the same comfortable pace — but never shorter
      // than the move's own slow-motion animation (stretched to
      // HINT_ANIM_S, which equals this dwell for animated games), so an
      // animated move plays out fully and flows straight into the next.
      const animMs = await this.workerPuzzle.currentAnimationMs();
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(animMs, AUTO_HINT_STEP_MS)),
      );
    }
    const solved = this.isSolved;
    this.stopAutoHint("");
    if (solved) {
      this.setHelpMessage("Solved!", true);
    }
  }

  /**
   * Send a key to the game, and report whether the game took it.
   *
   * **A key the game declines is not a manual move**, so it must not cancel
   * Auto-Hint or disarm the Hint stepper. The bare-letter shortcuts depend on
   * it: `h` reaches the game, is declined, comes back as `puzzle-key-unhandled`
   * and runs the `hint` command, and a disarm on the way in would keep the
   * stepper from ever reaching its second beat.
   *
   * Ordering is safe because both this and `executeHint` go through the same
   * `enqueueInput` queue: the auto-hint loop cannot slip a step in between.
   */
  public async processKey(key: number): Promise<boolean> {
    const consumed = await this.enqueueInput(() => this.workerPuzzle.processKey(key));
    if (consumed) this.stopAutoHint("Canceled by manual move");
    return consumed;
  }

  /** As {@link processKey}: a press the game declines — the gutter, a dead
   * corner — is not a move, and canceling on it would make Auto-Hint stop for
   * a click that did nothing. */
  public async processMouse({ x, y }: Point, button: number): Promise<boolean> {
    const consumed = await this.enqueueInput(() =>
      this.workerPuzzle.processMouse({ x, y }, button),
    );
    if (consumed) this.stopAutoHint("Canceled by manual move");
    return consumed;
  }

  /** Whether the running game tracks the pointer between presses. The view
   * asks once per game and sends no hover at all when it is false, so a game
   * without one costs nothing on a pointer sweep. */
  public async tracksHover(): Promise<boolean> {
    return this.workerPuzzle.tracksHover();
  }

  /**
   * The pointer moved over the board with no button down, or left it
   * (`null`).
   *
   * **Not queued through `enqueueInput`.** That queue exists to keep real
   * moves in order; a hover carries no history and the only interesting
   * hover is the latest one, so queueing them would make a fast sweep
   * arrive late rather than arrive less. The view coalesces to one per
   * animation frame, and this drops a hover while one is still in flight,
   * so a sweep costs at most one round trip at a time.
   */
  public async processHover(p: Point | null): Promise<void> {
    if (this.hoverInFlight) {
      this.hoverPending = { at: p };
      return;
    }
    this.hoverInFlight = true;
    try {
      await this.workerPuzzle.processHover(p);
      // `{ at: null }` is a queued "the pointer left", which is a real hover to
      // deliver; `null` is nothing queued. Two kinds of nothing, two states
      // (`docs/games/mechanics.md` § "Absence is `null`").
      while (this.hoverPending !== null) {
        const next = this.hoverPending.at;
        this.hoverPending = null;
        await this.workerPuzzle.processHover(next);
      }
    } finally {
      this.hoverInFlight = false;
    }
  }

  public async requestKeys(): Promise<KeyLabel[]> {
    return this.workerPuzzle.requestKeys();
  }

  public async getParams(): Promise<string> {
    return this.workerPuzzle.getParams();
  }

  public async setParams(params: string): Promise<string | null> {
    return this.workerPuzzle.setParams(params);
  }

  public async getParamsDescription(params: string): Promise<string> {
    const presets = await this.getPresets(true);
    // A board dealt turned on its side keeps its preset's title, which names
    // the kind of board chosen; the Custom dialog shows the size as dealt.
    const turned = await this.workerPuzzle.turnParams(params);
    const preset =
      presets.find((preset) => preset.params === params) ??
      presets.find((preset) => preset.params === turned);
    if (preset) {
      return preset.title;
    }

    const augmentation = puzzleAugmentations[this.puzzleId];
    if (augmentation?.describeConfig) {
      const config = await this.decodeCustomParams(params);
      if (typeof config === "string") {
        return `ERROR: '${params}': ${config}`;
      }
      // The declared option names, from the same `ConfigDescription` the
      // "Custom type…" dialog is built from — so the header and the dialog
      // beside it name a tier from one source instead of two.
      return augmentation.describeConfig(config, await this.getChoiceNames());
    }

    return "Custom type";
  }

  public async getPresets(flat = false): Promise<PresetMenuEntry[]> {
    const flatten = (items: PresetMenuEntry[]): PresetMenuEntry[] =>
      items.flatMap((item) => [item, ...(item.submenu ? flatten(item.submenu) : [])]);
    const presets = await this.workerPuzzle.getPresets();
    return flat ? flatten(presets) : presets;
  }

  public async getCustomParamsConfig(): Promise<ConfigDescription> {
    return this.workerPuzzle.getCustomParamsConfig();
  }

  public async getCustomParams(): Promise<ConfigValues> {
    return this.workerPuzzle.getCustomParams();
  }

  public async setCustomParams(values: ConfigValues): Promise<string | null> {
    return this.workerPuzzle.setCustomParams(values);
  }

  public async decodeCustomParams(params: string): Promise<ConfigValues | string> {
    return this.workerPuzzle.decodeCustomParams(params);
  }

  /**
   * Each `choices` field's declared option names, keyed by field id — read off
   * the custom-params `ConfigDescription`, which the midend builds from the
   * game's own `paramConfig`.
   *
   * It is what lets the type header name a difficulty tier without a second,
   * hand-typed copy of the tier list.
   */
  private async getChoiceNames(): Promise<ChoiceNames> {
    const config = await this.workerPuzzle.getCustomParamsConfig();
    const names: ChoiceNames = {};
    for (const [id, item] of Object.entries(config.items)) {
      if (item.type === "choices") {
        names[id] = item.choicenames;
      }
    }
    return names;
  }

  public async encodeCustomParams(values: ConfigValues): Promise<CustomParamsEncoding> {
    return this.workerPuzzle.encodeCustomParams(values);
  }

  public async getPreferencesConfig(): Promise<ConfigDescription> {
    return this.workerPuzzle.getPreferencesConfig();
  }

  public async getPreferences(): Promise<ConfigValues> {
    return this.workerPuzzle.getPreferences();
  }

  public async setPreferences(values: ConfigValues): Promise<void> {
    return this.workerPuzzle.setPreferences(values);
  }

  public async redraw(): Promise<void> {
    if (!this.hasSize) {
      // "Some back ends require that midend_size() is called before midend_redraw()."
      console.error("Ignoring Puzzle.redraw() called before Puzzle.size()");
      return;
    }
    await this.workerPuzzle.redraw();
  }

  public async getColorPalette(defaultBackground: Color): Promise<Color[]> {
    return this.workerPuzzle.getColorPalette(defaultBackground);
  }

  /** The authored dark-mode value (sRGB) of each palette index whose token
   * states one. An absent index is adapted by calculation instead. */
  public async darkPalette(defaultBackground: Color): Promise<Record<number, Color>> {
    return this.workerPuzzle.darkPalette(defaultBackground);
  }

  // Whether size() has been successfully called yet.
  private hasSize = false;

  public async size(maxSize: Size): Promise<Size> {
    if (!this.currentGameId) {
      // "The midend relies on the frontend calling midend_new_game() before calling
      // midend_size()." (Or otherwise having a game, e.g., midend_deserialise().)
      console.error("Ignoring Puzzle.size() called before game initialized");
      return maxSize;
    }
    const result = await this.workerPuzzle.size(maxSize);
    this.hasSize = true;
    return result;
  }

  public async preferredSize(): Promise<Size> {
    return this.workerPuzzle.preferredSize();
  }

  public async formatAsText(): Promise<string | null> {
    return this.workerPuzzle.formatAsText();
  }

  public async loadGame(data: Uint8Array<ArrayBuffer>): Promise<string | null> {
    // Loading a saved game (e.g. quick-load) replaces the board; a Hint press
    // after it must show against the loaded state, not apply a stale step.
    this.disarmHintApply();
    return this.workerPuzzle.loadGame(transfer(data, [data.buffer]));
  }

  public async saveGame(): Promise<Uint8Array<ArrayBuffer>> {
    // Deliberately not attached to crash reports: the privacy notes promise a
    // report carries nothing the player has saved. `captureSentryContext` sends
    // the game ID and move count, which is enough to reproduce.
    return this.workerPuzzle.saveGame();
  }

  //
  // Checkpoints
  //

  // TODO: use reactive set (from signal-utils) rather than replacing value
  private _checkpoints = signal<ReadonlySet<number>>(new Set());

  /**
   * A set of move numbers that have been set as checkpoints.
   */
  get checkpoints(): ReadonlySet<number> {
    return this._checkpoints.get();
  }

  set checkpoints(value: Iterable<number>) {
    this._checkpoints.set(new Set(value));
  }

  /**
   * Set a checkpoint at move (default the current move).
   */
  public addCheckpoint(move?: number) {
    const checkpoint = move ?? this.currentMove;
    if (!this.checkpoints.has(checkpoint)) {
      const newCheckpoints = new Set(this.checkpoints);
      newCheckpoints.add(checkpoint);
      this._checkpoints.set(newCheckpoints);
    }
  }

  /**
   * Remove checkpoint if it exists
   */
  public removeCheckpoint(checkpoint: number) {
    if (this.checkpoints.has(checkpoint)) {
      const newCheckpoints = new Set(this.checkpoints);
      newCheckpoints.delete(checkpoint);
      this._checkpoints.set(newCheckpoints);
    }
  }

  /**
   * Wind the game forward/backward to move number checkpoint.
   * (Checkpoint can actually be any valid move number,
   * and does not have to have been saved as a checkpoint.)
   */
  public async goToCheckpoint(checkpoint: number): Promise<void> {
    if (checkpoint < 0 || checkpoint > this.totalMoves) {
      throw new RangeError(`Move ${checkpoint} out of bounds`);
    }
    const delta = checkpoint - this.currentMove;
    for (let i = 0; i < Math.abs(delta); i++) {
      await (delta < 0 ? this.undo() : this.redo());
    }
  }

  private purgeInvalidCheckpoints(totalMoves: number) {
    // Called before updating this.currentMove and this.totalMoves.
    // Prune any checkpoints past new totalMoves.
    if (totalMoves < this.totalMoves && this.checkpoints.size > 0) {
      // BUG: this can't distinguish these two cases:
      //   - set checkpoint; undo; redo (shouldn't purge checkpoint == totalMoves)
      //   - set checkpoint; undo; move (_should_ purge checkpoint >= totalMoves)
      // To avoid unexpected purging, keep a checkpoint at totalMoves:
      const kept = [...this.checkpoints].filter((c) => c <= totalMoves);
      if (kept.length < this.checkpoints.size) {
        this._checkpoints.set(new Set(kept));
      }
    }
  }

  //
  // Public API to Drawing
  //

  public async attachCanvas(
    canvas: OffscreenCanvas,
    fontInfo: FontInfo,
  ): Promise<void> {
    // Transfer the canvas to the worker
    await this.workerPuzzle.attachCanvas(transfer(canvas, [canvas]), fontInfo);
    // Delay one frame to avoid a problem in Safari and Firefox where the
    // onscreen canvas initially (and somewhat randomly) appears solid black
    // or solid background color. (Seems like drawing to the offscreen canvas
    // immediately after transfer to the worker doesn't make it back onscreen.)
    await nextAnimationFrame();
  }

  /** Only `delete()` calls this: `view.ts`'s `destroyCanvas` would need the
   * `Puzzle` that was live during `createCanvas`, which is not necessarily the
   * current one. */
  private async detachCanvas(): Promise<void> {
    await this.workerPuzzle.detachCanvas();
  }

  public async resizeDrawing({ w, h }: Size, dpr: number): Promise<void> {
    if (import.meta.env.VITE_SENTRY_DSN) {
      this._size = `${w}x${h} @ ${dpr}x`;
      this.captureSentryContext();
    }
    await this.workerPuzzle.resizeDrawing({ w, h }, dpr);
  }

  public async setDrawingPalette(colors: string[]): Promise<void> {
    this._palette.set(colors);
    await this.workerPuzzle.setDrawingPalette(colors);
  }

  /** @see _palette */
  public get palette(): readonly string[] {
    return this._palette.get();
  }

  public async getImage(options?: ImageEncodeOptions): Promise<Blob> {
    return this.workerPuzzle.getImage(options);
  }

  /**
   * Place an image of the current puzzle on the clipboard.
   * This must be called from within a user event handler.
   * (And in Safari, there can't be any intervening async calls in that handler.)
   */
  public copyImage(type: string = "image/png") {
    // For Safari's "transient user activation" security policy, the call to
    // clipboard.write must be synchronous (but the data can be a promise).
    const blobPromise = this.getImage({ type });
    return navigator.clipboard.write([new ClipboardItem({ [type]: blobPromise })]);
  }

  //
  // Timer state
  //

  // Pending while timer active; resolves when deactivated
  public timerComplete: Promise<void> = Promise.resolve();
  private timerCompleteResolve?: () => void;

  private notifyTimerState = (isActive: boolean) => {
    // Resolve the current activation (if any)
    this.timerCompleteResolve?.();
    this.timerCompleteResolve = undefined;
    if (isActive) {
      // Start a new activation cycle
      this.timerComplete = new Promise<void>((resolve) => {
        this.timerCompleteResolve = resolve;
      });
    }
  };
}
