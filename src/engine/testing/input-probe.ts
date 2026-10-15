/**
 * **Shared behavioral input probes** — the questions the collection-wide input
 * guards ask of a game, asked in one place so every guard asks them the same
 * way and a new guard inherits the answers rather than re-deriving them.
 *
 * These are *behavioral*: each drives a real `Midend` over a real board through
 * the same code path the frontend uses. None reads a game's source, and none
 * reads a declaration about a game — a game joins a population by **having** the
 * behavior, which is the enrollment rule the whole collection runs on
 * (docs/doctrine.md § "One source of truth").
 */

import type { Game } from "../game.ts";
import { Midend } from "../midend.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  DELETE,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../pointer.ts";
import { type RandomState, randomNew, randomUpto } from "../random/index.ts";
import { sweepOpen } from "../target-verb.ts";
import type { Color, ConfigValues, Point, Size } from "../types.ts";
import { copyUi, restoreUi } from "../ui-snapshot.ts";
import { NO_FLASH } from "../win-wave.ts";
import { RecordingDrawing } from "./recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./render-scenario.ts";
import { sameState } from "./same-state.ts";

export type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;
export type AnyMidend = Midend<unknown, unknown, unknown, unknown, unknown>;

export interface ProbeBoard {
  readonly params: unknown;
  readonly tileSize: number;
  readonly size: Size;
  readonly m: AnyMidend;
  /** Return the board to its opening position, with a fresh `Ui`. */
  readonly reset: () => void;
  /** The `Ui` the midend is holding, as of a frame painted now. */
  readonly ui: () => unknown;
  /** The midend's current move number, as its last notification reported it. */
  readonly moves: () => number;
  /** How many moves the game has been asked to execute on this board, by
   * whether the state each returned holds the values of the one it was given
   * (`sameState`). Counted where the midend calls `executeMove`,
   * so a move the midend then keeps out of the history is counted too. */
  readonly executions: () => { readonly changed: number; readonly unchanged: number };
  /** How many times the midend has asked for a repaint. */
  readonly redraws: () => number;
  /** How many times the game has answered an input with a move or a UI-only
   * change, and not that nothing happened. */
  readonly answers: () => number;
  /** A digest of the state the midend holds. Two moves spelled differently
   * that leave the same board read the same. */
  readonly board: () => string;
  /** A digest of the state together with the `Ui` — where the player is, and
   * not only what the board says. Read without painting a frame. */
  readonly where: () => string;
  /** The `Ui` together with the midend's own save: the board, the whole move
   * log and the place in it. Dearer than {@link where}, and the one to read
   * across a `cancelPress`, which takes moves back without a word to the
   * game, so that the state behind {@link board} is not told. */
  readonly held: () => string;
  /** The state and `Ui` behind {@link where}, live — the midend's own objects,
   * to be read and never written. */
  readonly live: () => { readonly state: unknown; readonly ui: unknown };
  /** {@link board}'s digest of any state this board has held, memoized. */
  readonly digestOf: (state: unknown) => string;
  /** The whole frame of `state` under `ui`, painted on a fresh draw state. */
  readonly paint: (state: unknown, ui: unknown) => string;
}

export interface ProbeOptions {
  /** Player preferences, applied before the board is dealt and kept across
   * every `reset`. */
  readonly preferences?: ConfigValues;
}

/**
 * One board per game, built once — the generators are the expensive part.
 *
 * The board comes from a fixed seed, so a failure names the same board every
 * run. `reset` deals the same id again rather than calling `restartGame`,
 * which replaces the board but keeps the `Ui`: a highlight or mode left by one
 * probe point would otherwise answer for the next.
 *
 * `ui` reads the `Ui` where the engine already hands it out — to `redraw` —
 * rather than opening the midend up, so it is the state the frontend would
 * have painted from. It paints only when called, because the sweeps that never
 * read a `Ui` visit hundreds of points.
 */
export function probeBoard(
  game: AnyGame,
  id: string,
  options: ProbeOptions = {},
): ProbeBoard {
  const params = game.defaultParams();
  const desc = game.newDesc(params, randomNew(`parity-${id}`)).desc;
  const tileSize = game.preferredTileSize ?? 32;
  let seen: unknown = null;
  let painted = false;
  // The state the midend holds and the `Ui` it mutates, as the game's own
  // constructors and moves hand them over, so reading them costs no frame.
  let current: unknown = null;
  let liveUi: unknown = null;
  // A state is immutable once built (docs/mechanics.md), so its digest is
  // too: memoized by identity, a walk that revisits one board hundreds of times
  // serializes it once. Loopy's state holds its whole cyclic grid, which made
  // the target-verb guard's walk over it cost ~18 s unmemoized.
  const stateDigests = new WeakMap<object, string>();
  const digestOf = (state: unknown) => {
    if (typeof state !== "object" || state === null) return digest(state);
    let d = stateDigests.get(state);
    if (d === undefined) {
      d = digest(state);
      stateDigests.set(state, d);
    }
    return d;
  };
  let changed = 0;
  let unchanged = 0;
  let redraws = 0;
  let answers = 0;
  // What the game says of a board as dealt, asked once a board. The midend
  // holds every board it loads to the game's solver (`loadDesc`, and the tier
  // it then labels the board with), and `reset` loads the one board again for
  // every probe point: unremembered, a walk solved Pattern's board some
  // thirty thousand times, and a reset cost a hundred times a click. A fresh
  // state is known by the params and desc it was built from; a state a move
  // made is not one, and is always asked afresh.
  const dealtAs = new WeakMap<object, string>();
  const deals = new Map<string, unknown>();
  const verdicts = new Map<string, unknown>();
  const asDealt = <T>(question: string, state: unknown, ask: () => T): T => {
    const board = typeof state === "object" && state ? dealtAs.get(state) : undefined;
    if (board === undefined) return ask();
    const key = `${question}|${board}`;
    if (!verdicts.has(key)) verdicts.set(key, ask());
    return verdicts.get(key) as T;
  };
  const { difficulty, solve, finishesByDeduction, hasNoSolution } = game;
  const spy: AnyGame = {
    ...game,
    interpretMove: (...args) => {
      const answer = game.interpretMove(...args);
      if (answer !== null) answers++;
      return answer;
    },
    // A state is immutable (docs/mechanics.md), so a board dealt again is
    // handed out as the one object it was the first time. Every move from it
    // then shares what it did not change, and `sameState` compares two boards
    // a walk reached from separate resets without walking Loopy's grid.
    newState: (p, desc) => {
      const board = `${game.encodeParams(p, true)}:${desc}`;
      let state = deals.get(board);
      if (state === undefined) {
        state = game.newState(p, desc);
        deals.set(board, state);
        if (typeof state === "object" && state) dealtAs.set(state, board);
      }
      current = state;
      return state;
    },
    ...(difficulty && {
      difficulty: {
        solveAtCap: (p, desc, cap) => {
          const key = `cap ${cap}|${game.encodeParams(p, true)}:${desc}`;
          if (!verdicts.has(key))
            verdicts.set(key, difficulty.solveAtCap(p, desc, cap));
          return verdicts.get(key) as ReturnType<typeof difficulty.solveAtCap>;
        },
      },
    }),
    ...(solve && {
      solve: (orig, curr, aux) =>
        orig === curr && aux === undefined
          ? asDealt("solve", orig, () => solve(orig, curr, aux))
          : solve(orig, curr, aux),
    }),
    ...(finishesByDeduction && {
      finishesByDeduction: (s) => asDealt("finishes", s, () => finishesByDeduction(s)),
    }),
    ...(hasNoSolution && {
      hasNoSolution: (s) => asDealt("no solution", s, () => hasNoSolution(s)),
    }),
    newUi: (...args) => {
      liveUi = game.newUi(...args);
      return liveUi;
    },
    executeMove: (...args) => {
      current = game.executeMove(...args);
      if (sameState(current, args[0])) unchanged++;
      else changed++;
      return current;
    },
    // Undo, Redo and a restart make no move: this is where they are heard.
    changedState: (ui, prev, next) => {
      current = next;
      game.changedState?.(ui, prev, next);
    },
    redraw: (dr, ds, prev, s, dir, ui, ...rest) => {
      seen = ui;
      painted = true;
      return game.redraw(dr, ds, prev, s, dir, ui, ...rest);
    },
  };
  const m = new Midend(spy);
  let moveCount = 0;
  m.setCallbacks(
    (n) => {
      if (n.type === "game-state-change") moveCount = n.currentMove;
    },
    () => {},
    () => {
      redraws++;
    },
  );
  if (options.preferences) m.setPreferences(options.preferences);
  const gameId = `${game.encodeParams(params, true)}:${desc}`;
  const reset = () => {
    m.newGameFromId(gameId);
  };
  reset();
  const ui = () => {
    painted = false;
    m.redraw(new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND)));
    if (!painted) throw new Error(`${id} painted no frame`);
    return seen;
  };
  const stateDigest = () => digestOf(current);
  const palette = m.getColorPalette(DEFAULT_BACKGROUND);
  const paint = (state: unknown, ui: unknown) => {
    const dr = new RecordingDrawing(palette);
    game.redraw(
      dr,
      game.newDrawState(state, tileSize),
      null,
      state,
      1,
      ui,
      0,
      NO_FLASH,
    );
    return JSON.stringify(dr.ops);
  };
  return {
    params,
    tileSize,
    size: game.computeSize(params, tileSize),
    m,
    reset,
    ui,
    moves: () => moveCount,
    executions: () => ({ changed, unchanged }),
    redraws: () => redraws,
    answers: () => answers,
    board: stateDigest,
    where: () => `${digest(liveUi)}|${stateDigest()}`,
    held: () => `${digest(liveUi)}|${fingerprint(m)}`,
    live: () => ({ state: current, ui: liveUi }),
    digestOf,
    paint,
  };
}

/** A deterministic text for a state or `Ui`: maps and sets as their entries, a
 * typed array as its values, and an object met a second time as `~`, which is
 * what lets a state holding a cyclic grid be read at all. */
function digest(value: unknown): string {
  const met = new WeakSet<object>();
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v instanceof Map) return [...v];
    if (v instanceof Set) return [...v];
    if (typeof v === "object" && v !== null) {
      if (met.has(v)) return "~";
      met.add(v);
    }
    return v;
  });
}

/** A cursor position a key is pressed at, and the point a press pairs with. */
export interface KeyPosition {
  /** The arrow presses that walk the cursor here from the opening position. */
  readonly path: readonly number[];
  /** Where a press addresses what the cursor rests on. */
  readonly at: Point;
  /** The state here, before anything is pressed. */
  readonly board: unknown;
}

/** What a key and a press each leave at one cursor position. */
export interface BoardsReached {
  /** Every position a key is pressed at, in the order the walk met them. */
  readonly positions: readonly KeyPosition[];
  /** At each of {@link positions}, the state `code` left, which is the
   * position's own where it changed nothing. */
  readonly key: (code: number) => readonly unknown[];
  /** At each of {@link positions}, the states left by pressing and releasing
   * `buttons` in turn at its point, after pressing the keys `before` — the
   * Marks key, for a route in notes mode. `every` keeps the state before the
   * first press and after each, which is what a cycle passes through;
   * otherwise only the last is kept. */
  readonly pressed: (
    buttons: readonly number[],
    options?: { readonly before?: readonly number[]; readonly every?: boolean },
  ) => readonly (readonly unknown[])[];
  /** Whether two of those states are one board: the same values, or with
   * `bySight` the same frame. */
  readonly same: (a: unknown, b: unknown) => boolean;
  /** How many cursor positions the arrows reached — the walk's power. */
  readonly cursorPositions: number;
}

/**
 * **What a key does at the cursor, beside what a press does at the same
 * target** — the instrument the target-verb guard reads.
 *
 * The arrows walk the cursor to every position they reach. At each, `pairAt`
 * names the point a press addresses what the cursor rests on, or `null` where
 * no key is pressed: a position resting on no target (Subsets' tally band)
 * belongs to an arm of the game's own. The walk still passes through such
 * positions. A key and a press are then each played from that one position,
 * so a key that acts on the square beside the cursor leaves a board the press
 * does not, though a press on the neighbor would leave it too.
 *
 * `prime` is played first on every attempt, because a verb that empties a square
 * has nothing to do on a fresh board. `pairAt` is handed a draw state for the
 * position, built at the probe's tile size as the midend builds its own.
 *
 * Boards are compared as states (`sameState`), and every attempt starts from
 * the one dealt state, so what two boards share is never walked. With
 * `bySight`, two states that differ are compared again by their frames,
 * painted with a fresh `Ui` and draw state so neither a cursor nor an
 * animation tells them apart. Two moves that leave one picture are one move to
 * a player whatever bookkeeping the state keeps: Net records which way its last
 * turn went, so a half turn and two quarter turns differ in the state and not
 * on screen.
 */
export function boardsReached(
  game: AnyGame,
  id: string,
  prime: (b: ProbeBoard) => void,
  pairAt: (state: unknown, ui: unknown, ds: unknown) => Point | null,
  options: { readonly bySight?: boolean } = {},
): BoardsReached {
  const b = probeBoard(game, id);
  const { m, tileSize } = b;
  let startMoves = 0;
  const start = () => {
    b.reset();
    prime(b);
    startMoves = b.moves();
  };
  const stateNow = () => b.live().state;

  const frames = new WeakMap<object, string>();
  const frameOf = (state: unknown) => {
    if (typeof state !== "object" || state === null)
      return b.paint(state, game.newUi(state));
    let frame = frames.get(state);
    if (frame === undefined) {
      frame = b.paint(state, game.newUi(state));
      frames.set(state, frame);
    }
    return frame;
  };
  const same = (x: unknown, y: unknown) =>
    sameState(x, y) || (options.bySight === true && frameOf(x) === frameOf(y));

  // Every cursor position the arrows reach, as the key presses that reach it.
  // A position is the `Ui` together with the board, since an arrow that moves
  // the board (a sliding puzzle) is a different position too. A board changes
  // only through a committed move, so while the move count stands where the
  // deal left it, the board is the deal's and is not written out.
  const arrows = [CURSOR_UP, CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT];
  const replay = (path: readonly number[]) => {
    start();
    for (const k of path) m.processInput(0, 0, k);
  };
  // The `Ui` is mutated in place, so it is serialized afresh every time.
  const where = () =>
    `${digest(b.live().ui)}|${b.moves() === startMoves ? "" : b.board()}`;
  const positions: KeyPosition[] = [];
  // The position just replayed, kept when a key is pressed there: asked during
  // the walk so no path is replayed again only to ask it.
  const keep = (path: number[]) => {
    const { state, ui } = b.live();
    const at = pairAt(state, ui, game.newDrawState(state, tileSize));
    if (at !== null) positions.push({ path, at, board: state });
  };
  replay([]);
  const met = new Set([where()]);
  const paths: number[][] = [[]];
  keep([]);
  for (let i = 0; i < paths.length && paths.length < CURSOR_CAP; i++)
    for (const a of arrows) {
      const path = [...paths[i], a];
      replay(path);
      const at = where();
      if (met.has(at)) continue;
      met.add(at);
      paths.push(path);
      keep(path);
    }

  const key = (code: number) =>
    positions.map(({ path }) => {
      replay(path);
      m.processInput(0, 0, code);
      return stateNow();
    });

  const press = ({ x, y }: Point, button: number) => {
    m.processInput(x, y, button);
    m.processInput(x, y, button + (LEFT_RELEASE - LEFT_BUTTON));
  };
  const pressed: BoardsReached["pressed"] = (buttons, options = {}) =>
    positions.map(({ path, at }) => {
      replay(path);
      for (const k of options.before ?? []) m.processInput(0, 0, k);
      const out: unknown[] = [];
      if (options.every) out.push(stateNow());
      for (const button of buttons) {
        press(at, button);
        if (options.every) out.push(stateNow());
      }
      if (!options.every) out.push(stateNow());
      return out;
    });

  return { positions, key, pressed, same, cursorPositions: paths.length };
}

/** Past this many cursor positions the walk stops; a guard reading the walk
 * asserts it stayed under, so a cursor that never repeats cannot pass by
 * running out of budget. */
export const CURSOR_CAP = 2000;

/** A stable digest of everything a save carries — board, history and whatever
 * UI state the game chooses to persist. */
export function fingerprint(m: AnyMidend): string {
  const bytes = m.saveGame();
  let h = 0;
  for (const b of bytes) h = (h * 31 + b) | 0;
  return String(h);
}

/**
 * **What the player can perceive** — the painted frame plus the save.
 *
 * A save alone is not the player's view of the game, and treating it as one
 * under-reports: Signpost's backward grab is held in its `Ui` and never
 * serialized, so the drag highlight a secondary press puts on screen is
 * invisible to {@link fingerprint}. A pencil-mode press held in the `Ui` is
 * the same shape. Scoring those "no secondary meaning" would demand
 * `ignoresSecondaryButton` from games that have one, turning off the promotion
 * they handle — the exact defect the flag exists to prevent, arrived at from
 * the other direction.
 *
 * A `Ui` field is frame-only until the game decides to persist it with an
 * `encodeUi`, which is exactly why the population here is an observation
 * rather than a list.
 *
 * So the observation is the union: a change the *save* records, or a change the
 * *frame* shows. That is the honest reading of "did anything happen", and it
 * needs nothing from the game beyond the `redraw` every game already has.
 */
function observable(m: AnyMidend, background: Color): string {
  const recording = new RecordingDrawing(m.getColorPalette(background));
  m.redraw(recording);
  return `${fingerprint(m)}|${JSON.stringify(recording.ops)}`;
}

/**
 * Probe points across the whole board, dense enough to hit Untangle's vertices,
 * which sit at arbitrary points: a coarse grid sails past them and reports
 * health.
 */
export function probePoints(size: Size): Point[] {
  const step = Math.max(4, Math.floor(Math.min(size.w, size.h) / 12));
  const pts: Point[] = [];
  for (let x = 2; x < size.w; x += step)
    for (let y = 2; y < size.h; y += step) pts.push({ x, y });
  return pts;
}

/** The ways {@link randomGesture} plays one. */
export const GESTURE_KINDS = ["click", "drag", "keys"] as const;
export type GestureKind = (typeof GESTURE_KINDS)[number];

/**
 * **One thing a player might do, chosen blind**: a click at a random point, a
 * drag between two, or a walk of the cursor ending on a select key, with either
 * button and half the time a digit or letter after it. It reads nothing of the
 * game, so what it reaches is what a game's input reaches from anywhere: a
 * click enters a cell where one click does, a drag draws a bridge or a path, and
 * the keys reach the games that want a cursor first. Half the drags run along a
 * row or a column, because most games that drag take no other kind, and half
 * the walks select twice, for a game that picks a thing up and puts it down.
 */
export function randomGesture(
  m: AnyMidend,
  size: Size,
  rs: RandomState,
  kind: GestureKind,
): void {
  const point = (): Point => ({ x: randomUpto(rs, size.w), y: randomUpto(rs, size.h) });
  const right = randomUpto(rs, 3) === 0;
  const select = right ? CURSOR_SELECT2 : CURSOR_SELECT;
  const walk = (steps: number): void => {
    const arrows = [CURSOR_UP, CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT];
    for (let k = 0; k < steps; k++) m.processInput(0, 0, arrows[randomUpto(rs, 4)]);
  };
  if (kind === "click") {
    const p = point();
    m.processInput(p.x, p.y, right ? RIGHT_BUTTON : LEFT_BUTTON);
    m.processInput(p.x, p.y, right ? RIGHT_RELEASE : LEFT_RELEASE);
  } else if (kind === "drag") {
    const from = point();
    const to = point();
    if (randomUpto(rs, 2) === 0) {
      if (randomUpto(rs, 2) === 0) to.x = from.x;
      else to.y = from.y;
    }
    m.processInput(from.x, from.y, right ? RIGHT_BUTTON : LEFT_BUTTON);
    m.processInput(to.x, to.y, right ? RIGHT_DRAG : LEFT_DRAG);
    m.processInput(to.x, to.y, right ? RIGHT_RELEASE : LEFT_RELEASE);
  } else {
    walk(randomUpto(rs, 8));
    m.processInput(0, 0, select);
    if (randomUpto(rs, 2) === 0) {
      walk(1 + randomUpto(rs, 3));
      m.processInput(0, 0, select);
    }
  }
  if (randomUpto(rs, 2) === 0) {
    const keys = "123456789abcd";
    m.processInput(0, 0, keys.charCodeAt(randomUpto(rs, keys.length)));
  }
}

/**
 * **Codes no game can act on.**
 *
 * The obvious choice — Unicode's private-use area, `0xE000`+ — is **wrong
 * here**: button codes are not Unicode. `MOD_MASK` is `0x7000`, so `0xE000`
 * decodes as `MOD_NUM_KEYPAD | MOD_SHFT | 0x8000` and carries two live modifier
 * bits (Sixteen reads the keypad bit and rightly answers it). `0x0300`–`0x0302`
 * sit in the gap above `CURSOR_SELECT2` and below every modifier bit; `0x10000`
 * sits above them all.
 *
 * Every reason these are safe is asserted from the vocabulary in
 * `input-parity.test.ts`, never taken on trust from this comment.
 */
export const UNACTIONABLE: readonly number[] = [0x0300, 0x0301, 0x0302, 0x10000];

/** True for a pointer press, drag or release. */
function isPointerButton(button: number): boolean {
  return isMouseDown(button) || isMouseDrag(button) || isMouseRelease(button);
}

export interface UnactionableResult {
  /** Every unactionable code the game answered, with where it answered. */
  readonly claims: string[];
  /** Whether any of them reached the board. A code with no meaning cannot have
   * moved anything, so this is the one direction "did the board change" is safe
   * to ask in — there is no innocent reading of it. */
  readonly boardChanged: boolean;
}

/** What a game does with codes nothing in the vocabulary can express. */
export function unactionableClaims(game: AnyGame, id: string): UnactionableResult {
  const { size, m } = probeBoard(game, id);
  const before = fingerprint(m);
  const claims: string[] = [];
  // The origin as well as the board, because a keyboard event arrives at (0, 0)
  // and a game gating on pointer *coordinates* alone answers every key that
  // lands there — a board-only sweep scores it healthy.
  const points = [{ x: 0, y: 0 }, ...probePoints(size)];
  for (const code of UNACTIONABLE)
    for (const p of points)
      if (m.processInput(p.x, p.y, code))
        claims.push(`0x${code.toString(16)} at (${p.x},${p.y})`);
  return { claims, boardChanged: fingerprint(m) !== before };
}

/** What a game did with the secondary button, and the evidence for it. */
export interface SecondaryMeaning {
  /** Whether `RIGHT_BUTTON` means anything at all in this game. */
  readonly used: boolean;
  /** How it showed itself — for the failure message, and for a reader who
   * wants to know *which* of the three shapes this game has. */
  readonly evidence: string | null;
}

/**
 * **Does the secondary button mean anything in this game?**
 *
 * `Game.ignoresSecondaryButton` exists because the promotion is pure loss for a
 * game with no secondary meaning: `detectSecondaryButton` turns a held press
 * into `RIGHT_BUTTON`, the game tests no such button, and the whole gesture
 * disappears — only on touch, and only for the player who paused to aim. The
 * guard asserts the biconditional, so the answer here decides whether a game
 * *must* declare the flag, and a wrong answer either drops every long press a
 * player makes or turns off a promotion the game handles.
 *
 * The collection has exactly three legitimate answers, all observable and none
 * of them a declaration:
 *
 *  1. **It commits a move** — the press is the whole interaction.
 *  2. **It changes what the next input does** — the pencil-mode press (through
 *     the shared `pressNoteTakingCell`), Guess's peg hold, Samegame's selection
 *     clear, Rome's pencil drag, Signpost's backward grab, Ascent's candidate
 *     cycle. The press commits nothing by itself, so asking only "did the board
 *     change" scores every one of them meaningless.
 *  3. **It folds onto the primary button** (Slide's `asPrimary`) — the
 *     documented alternative to the flag, which makes the gesture work whichever
 *     way the long-press detector resolved it.
 *
 * So the question is *did it change anything observable, now or next*, and the
 * three shapes are one question rather than three special cases.
 *
 * **On not reopening "did the board change".** Its **negation as a conviction**
 * is banned — "the board did not change, therefore this input is dead" falsely
 * convicts a game whose eraser, on a fresh board, correctly changes nothing. Used the other way, as one of several *sufficient* signs that the
 * button does mean something, it cannot convict anyone: a game is only ever
 * reported meaningless when it is invisible under **every** observation below.
 */
export function secondaryMeaning(game: AnyGame, id: string): SecondaryMeaning {
  const { params, tileSize, size, m, reset } = probeBoard(game, id);
  const panel = game.requestKeys?.(params) ?? [];

  /** Where a step acts. A pointer step acts on the board; a key arrives at the
   * origin, which is where `worker-adapter.ts` delivers one. */
  type Step = { button: number; at: "p" | "q" };
  const at = (button: number): Step => ({ button, at: "p" });
  const to = (button: number): Step => ({ button, at: "q" });

  /**
   * The secondary gestures to try. A press alone is not enough: Rome's
   * secondary button starts a **pencil drag** and Signpost's grabs a chain
   * backwards, so both are invisible until the drag happens — and scoring them
   * meaningless would demand a flag that turns off the very gesture they have.
   */
  const gestures: { label: string; steps: Step[] }[] = [
    { label: "a secondary press", steps: [at(RIGHT_BUTTON), at(RIGHT_RELEASE)] },
    {
      label: "a secondary drag",
      steps: [at(RIGHT_BUTTON), to(RIGHT_DRAG), to(RIGHT_RELEASE)],
    },
  ];

  /**
   * What might reveal a gesture that changed the game's *future* rather than
   * its board. Deliberately generous, and the generosity is not free
   * politeness: an under-detection demands the flag from a game that has a
   * secondary meaning, which turns off a promotion it handles — so a missing
   * follow-up here is itself a defect. The neighbor cases exist because
   * Ascent's secondary press clears a selection, which is invisible until the
   * *next* cell is pressed.
   */
  const followUps: { label: string; steps: Step[] }[] = [
    { label: "on its own", steps: [] },
    { label: "then a primary press", steps: [at(LEFT_BUTTON), at(LEFT_RELEASE)] },
    {
      label: "then a primary press on the next cell",
      steps: [to(LEFT_BUTTON), to(LEFT_RELEASE)],
    },
    {
      label: "then a primary drag onto the next cell",
      steps: [at(LEFT_BUTTON), to(LEFT_DRAG), to(LEFT_RELEASE)],
    },
    {
      label: "then a second secondary press",
      steps: [at(RIGHT_BUTTON), at(RIGHT_RELEASE)],
    },
    { label: "then Enter", steps: [at(CURSOR_SELECT)] },
    { label: "then the secondary select", steps: [at(CURSOR_SELECT2)] },
    { label: "then '1'", steps: [at(0x31)] },
    ...(panel[0]
      ? [{ label: `then the ${panel[0].label} key`, steps: [at(panel[0].button)] }]
      : []),
  ];

  /**
   * How the board is set up before the secondary gesture. A secondary meaning
   * is very often "undo what the primary one did", so it has nothing to act on
   * until something is there — and *how much* setup it needs varies: Ascent
   * places a number with two presses (pick a placed number, then an adjacent
   * empty cell), and its right-click erase is invisible until one is on the
   * board. With a one-press prime Ascent is credited only by an incidental
   * cursor hide it shares with the primary press, which is the right verdict
   * reached on evidence that would not survive the game changing.
   */
  const primes: { label: string; steps: Step[] }[] = [
    { label: "", steps: [] },
    { label: " after a primary press", steps: [at(LEFT_BUTTON), at(LEFT_RELEASE)] },
    {
      label: " after two primary presses",
      steps: [at(LEFT_BUTTON), at(LEFT_RELEASE), to(LEFT_BUTTON), to(LEFT_RELEASE)],
    },
    {
      label: " after a primary drag",
      steps: [at(LEFT_BUTTON), to(LEFT_DRAG), to(LEFT_RELEASE)],
    },
  ];

  /** Replay `steps` from the opening position. */
  const send = (p: Point, q: Point, steps: Step[]) => {
    reset();
    for (const s of steps) {
      const target = s.at === "q" ? q : p;
      if (isPointerButton(s.button)) m.processInput(target.x, target.y, s.button);
      else m.processInput(0, 0, s.button);
    }
  };
  const play = (p: Point, q: Point, steps: Step[]) => {
    send(p, q, steps);
    return observable(m, DEFAULT_BACKGROUND);
  };

  /** Where a drag or a neighbor press lands. More than one direction, because a
   * game may accept a gesture along one axis and not another: Signpost links a
   * cell to the neighbor its *arrow* points at, so a single "one tile right"
   * target round-trips to nothing on every cell whose arrow points elsewhere,
   * and the game reads as having no secondary meaning at all. */
  const targets = (p: Point) =>
    [
      { x: p.x + tileSize, y: p.y },
      { x: p.x, y: p.y + tileSize },
      { x: p.x + tileSize, y: p.y + tileSize },
      { x: p.x - tileSize, y: p.y },
      { x: p.x, y: p.y - tileSize },
    ].filter((q) => q.x >= 0 && q.y >= 0 && q.x < size.w && q.y < size.h);

  for (const p of probePoints(size)) {
    for (const q of targets(p)) {
      for (const prime of primes) {
        // A press the game did not even consume cannot have changed anything,
        // so there is nothing to compare — and this is what keeps the sweep
        // cheap for the games that genuinely ignore the button, which are the
        // only ones that ever reach the end of this loop.
        send(p, q, prime.steps);
        const consumed = m.processInput(p.x, p.y, RIGHT_BUTTON);
        m.processInput(p.x, p.y, RIGHT_RELEASE);
        if (!consumed) continue;

        for (const g of gestures)
          for (const f of followUps)
            if (
              play(p, q, [...prime.steps, ...f.steps]) !==
              play(p, q, [...prime.steps, ...g.steps, ...f.steps])
            )
              return {
                used: true,
                evidence:
                  `${g.label} at (${p.x},${p.y})${prime.label} ${f.label} ` +
                  "leaves a different game than the same sequence without it",
              };
      }
    }
  }
  return { used: false, evidence: null };
}

/** What became of the presses a game claimed and then had canceled. */
export interface CanceledPresses {
  /** How many presses the game claimed, each then canceled: the sweep's
   * power. A press the game declines has no gesture to cancel. */
  readonly canceled: number;
  /** How many of those had moved a tile before the cancel. */
  readonly moved: number;
  /** Each canceled press after which the board or the `Ui` was not what it
   * had been before the press. */
  readonly left: string[];
}

/**
 * **Does a canceled press leave anything behind?**
 *
 * Every probe point is pressed with each button and canceled: once where it
 * was pressed, and once after a drag to each neighboring tile, since a game
 * that has seen a drag holds more than one that has seen only a press. What
 * is compared is what the midend held just before that press, so the board
 * needs no fixed starting position, and between rounds it is played on
 * (`play`), because what a press picks up depends on what is there: on the
 * opening board no Galaxies tile has an arrow to lift.
 */
export function canceledPresses(game: AnyGame, id: string): CanceledPresses {
  const b = probeBoard(game, id);
  const { m, size, tileSize } = b;
  const points = probePoints(size);
  const neighbors = (p: Point) =>
    [
      { x: p.x + tileSize, y: p.y },
      { x: p.x, y: p.y + tileSize },
      { x: p.x - tileSize, y: p.y },
      { x: p.x, y: p.y - tileSize },
    ].filter((q) => q.x >= 0 && q.y >= 0 && q.x < size.w && q.y < size.h);
  const buttons = [
    { name: "left", press: LEFT_BUTTON, drag: LEFT_DRAG, release: LEFT_RELEASE },
    { name: "right", press: RIGHT_BUTTON, drag: RIGHT_DRAG, release: RIGHT_RELEASE },
  ];

  let canceled = 0;
  let moved = 0;
  const left: string[] = [];
  const round = (label: string) => {
    for (const p of points)
      for (const button of buttons)
        for (const q of [null, ...neighbors(p)]) {
          const before = { held: b.held(), moves: b.moves() };
          if (!m.processInput(p.x, p.y, button.press)) {
            // Declined: the view sends the release at once and tracks nothing.
            m.processInput(p.x, p.y, button.release);
            continue;
          }
          if (q !== null) m.processInput(q.x, q.y, button.drag);
          m.cancelPress();
          canceled++;
          if (q !== null) moved++;
          const what =
            b.moves() !== before.moves
              ? "a move was made"
              : b.held() !== before.held
                ? "the Ui or the history was left changed"
                : sweepOpen(b.live().ui)
                  ? "a sweep was left open"
                  : null;
          if (what !== null)
            left.push(
              `${label}: ${button.name} press at (${p.x},${p.y})` +
                `${q === null ? "" : ` dragged to (${q.x},${q.y})`}, canceled: ${what}`,
            );
        }
  };
  /** Clicks and drags across the board, completed, so that the next round
   * presses on what a game in play has on it. */
  const play = () => {
    points.forEach((p, i) => {
      const button = buttons[i % 3 === 2 ? 1 : 0];
      const to = i % 2 === 1 ? (neighbors(p)[i % neighbors(p).length] ?? p) : p;
      if (m.processInput(p.x, p.y, button.press) && to !== p)
        m.processInput(to.x, to.y, button.drag);
      m.processInput(to.x, to.y, button.release);
    });
  };
  round("on the opening board");
  play();
  round("on a board played on");
  return { canceled, moved, left };
}

/** What became of the gestures a board change landed under. */
export interface ChangedUnder {
  /** How many gestures the game claimed and then had the board changed
   * under: the sweep's power. */
  readonly gestures: number;
  /** How many of those had dragged before the change. */
  readonly dragged: number;
  /** How many had made a move of their own before the change. */
  readonly moved: number;
  /** Each gesture that carried on: its drag or release, arriving after the
   * change, made a move, changed the board or threw, or its declared sweep
   * was still open. */
  readonly carriedOn: string[];
  /** Each gesture after which the frame was not the one a `Ui` that had never
   * met the gesture paints of that board: a preview left behind. */
  readonly painted: string[];
  /** Each gesture that left the `Ui` other than one that had never met it,
   * where the frame does not show it. */
  readonly left: string[];
}

/**
 * **Does a gesture carry on after the board changed under it?**
 *
 * Every probe point is pressed with each button, as a held press and as a
 * drag to each neighboring tile. Then the board is changed from outside the
 * gesture: by an Undo, which takes back a move made before the press or the
 * gesture's own, or by a Redo of a move undone before the press. Then the
 * rest of the gesture arrives, a drag a tile further on and the release.
 *
 * It asks that nothing after the change made a move, and that the `Ui` is the
 * one from before the press, told of the same boards: so no preview of the
 * gesture can be in the frame, whatever fields a game keeps one in. That is
 * read once when the change lands and once after the release.
 *
 * The board is played on between rounds as {@link canceledPresses} plays it,
 * lightly first, since a board played all over is in several games one that
 * takes no more presses.
 */
export function changedUnder(game: AnyGame, id: string): ChangedUnder {
  const b = probeBoard(game, id);
  const { m, size, tileSize } = b;
  const points = probePoints(size);
  const inside = (q: Point) => q.x >= 0 && q.y >= 0 && q.x < size.w && q.y < size.h;
  const neighbors = (p: Point) =>
    [
      { x: p.x + tileSize, y: p.y },
      { x: p.x, y: p.y + tileSize },
      { x: p.x - tileSize, y: p.y },
      { x: p.x, y: p.y - tileSize },
    ].filter(inside);
  const buttons = [
    { name: "left", press: LEFT_BUTTON, drag: LEFT_DRAG, release: LEFT_RELEASE },
    { name: "right", press: RIGHT_BUTTON, drag: RIGHT_DRAG, release: RIGHT_RELEASE },
  ];
  type Button = (typeof buttons)[number];

  let gestures = 0;
  let dragged = 0;
  let moved = 0;
  const carriedOn: string[] = [];
  const painted: string[] = [];
  const left: string[] = [];

  /** Step the history toward `target` moves, as far as one direction goes: a
   * drag's moves are crossed together, so a step can pass it. */
  const stepTo = (target: number) => {
    const back = b.moves() > target;
    for (let at = b.moves(); back ? at > target : at < target; at = b.moves()) {
      if (back) m.undo();
      else m.redo();
      if (b.moves() === at) return;
    }
  };

  const trial = (
    label: string,
    p: Point,
    button: Button,
    q: Point | null,
    change: "an Undo" | "a Redo",
  ) => {
    const start = b.moves();
    if (start === 0) return;
    if (change === "a Redo") m.undo();
    const pressedOn = b.live().state;
    const never = copyUi(b.live().ui);
    const before = b.moves();
    if (!m.processInput(p.x, p.y, button.press)) {
      // Declined: the view sends the release at once and tracks nothing.
      m.processInput(p.x, p.y, button.release);
      stepTo(start);
      return;
    }
    if (q !== null) m.processInput(q.x, q.y, button.drag);
    const madeMoves = b.moves() !== before;
    const under = b.live().state;
    const held = b.moves();
    if (change === "an Undo") m.undo();
    else m.redo();
    const now = b.live().state;
    const changedAt = b.moves();
    const what = `${label}: ${button.name} press at (${p.x},${p.y})${
      q === null ? "" : ` dragged to (${q.x},${q.y})`
    }, then ${change}`;
    // A press that made a move has dropped what a Redo would have brought back.
    if (changedAt !== held) {
      gestures++;
      if (q !== null) dragged++;
      if (madeMoves) moved++;
      // The `Ui` of a player who never made the gesture: told of its moves,
      // as theirs would have been, and of the change.
      if (under !== pressedOn) game.changedState?.(never, pressedOn, under);
      game.changedState?.(never, under, now);
      // A game may write the step's animation to the `Ui` it is asked with.
      const dir = change === "an Undo" ? -1 : 1;
      game.animLength?.(under, now, dir, never);
      game.flashLength?.(under, now, dir, never);
      const neverDigest = digest(never);
      const check = (when: string) => {
        if (sweepOpen(b.live().ui)) carriedOn.push(`${what}: a sweep was open ${when}`);
        if (digest(b.live().ui) === neverDigest) return;
        if (b.paint(b.live().state, b.live().ui) !== b.paint(b.live().state, never))
          painted.push(`${what}: the frame ${when} shows the gesture`);
        else
          left.push(
            `${what}: the Ui ${when} is ${digest(b.live().ui)}, and one that ` +
              `never met the gesture is ${neverDigest}`,
          );
      };
      check("at the change");
      const end = q ?? p;
      // A move aimed at a board that is gone can be one its game refuses.
      let threw: string | null = null;
      try {
        if (q !== null) {
          const on = { x: 2 * q.x - p.x, y: 2 * q.y - p.y };
          const further = inside(on) ? on : p;
          m.processInput(further.x, further.y, button.drag);
          m.processInput(q.x, q.y, button.drag);
        }
        m.processInput(end.x, end.y, button.release);
      } catch (e) {
        threw = e instanceof Error ? e.message : String(e);
      }
      if (threw !== null)
        carriedOn.push(`${what}: the rest of the gesture threw "${threw}"`);
      else if (b.moves() !== changedAt || b.board() !== b.digestOf(now))
        carriedOn.push(`${what}: the rest of the gesture made a move`);
      else check("after the release");
      // Take a move it made back off, so the next gesture starts from here.
      stepTo(changedAt);
    } else m.processInput((q ?? p).x, (q ?? p).y, button.release);
    stepTo(start);
  };

  const round = (label: string) => {
    for (const p of points)
      for (const button of buttons)
        for (const q of [null, ...neighbors(p)])
          for (const change of ["an Undo", "a Redo"] as const)
            trial(label, p, button, q, change);
  };
  // A game that takes its entries from the keypad makes no move by pointer.
  const typed = m
    .requestKeys()
    .map((k) => k.button)
    .filter((k) => k !== PENCIL_MODE_BUTTON);
  const arrows = [CURSOR_UP, CURSOR_RIGHT, CURSOR_DOWN, CURSOR_LEFT];
  /** Clicks and drags of one tile and of two, completed, from every `every`th
   * probe point, with an arrow key and a typed key after each, so that there
   * is a move to take back and the next round presses on a board in play.
   * A jump is a drag of two tiles, and a game played from the keyboard moves
   * by an arrow or takes its entries from the keypad. */
  const play = (every: number) => {
    points.forEach((p, i) => {
      if (i % every !== 0) return;
      const button = buttons[i % 3 === 2 ? 1 : 0];
      const near = neighbors(p)[i % neighbors(p).length] ?? p;
      const far = { x: 2 * near.x - p.x, y: 2 * near.y - p.y };
      const to = i % 2 === 0 ? p : i % 4 === 1 || !inside(far) ? near : far;
      if (m.processInput(p.x, p.y, button.press) && to !== p)
        m.processInput(to.x, to.y, button.drag);
      m.processInput(to.x, to.y, button.release);
      m.processInput(0, 0, arrows[i % arrows.length]);
      if (typed.length > 0) m.processInput(0, 0, typed[i % typed.length]);
    });
  };
  play(7);
  round("on a board barely played on");
  play(1);
  round("on a board played all over");
  return { gestures, dragged, moved, carriedOn, painted, left };
}

/** One input of a script: a key arrives at the origin, as the app sends it. */
interface ProbeInput {
  readonly name: string;
  readonly at: Point;
  readonly button: number;
}

/** What a game's answers to a sweep of inputs came to. */
export interface InputAnswers {
  /** How many inputs were sent: the sweep's reach. */
  readonly inputs: number;
  /** How many moves entered the history. */
  readonly recorded: number;
  /** How many moves the game made that left its board as it was. */
  readonly unchanged: number;
  /** Each input after which the history grew by a move that left the board
   * as it was, as the script that reaches it from the deal. */
  readonly recordedUnchanged: string[];
  /** Each input that changed the board and added no step to the history. */
  readonly droppedChanged: string[];
  /** How many inputs that changed the frame the game answered "nothing
   * happened" to, and the midend claimed for it. */
  readonly claimedForGame: number;
  /** Each input that changed the frame and was left unclaimed. */
  readonly silent: string[];
  /** Each unclaimed input that changed the `Ui`, seen or not, after which
   * the midend asked for no repaint. */
  readonly unpainted: string[];
}

/**
 * **What does each input's answer leave behind?**
 *
 * `interpretMove` has three answers, and each promises something this sweep
 * can read: a move is a step of the history exactly when it changed the
 * board, and an input left unclaimed leaves the frame as it was. Every input
 * of every script is asked both, so a script needs no expectation of its own.
 *
 * The scripts are the shapes that have made a move for nothing: a click
 * repeated, a drag out and back, a drag that lands one and two tiles off (a
 * jump or a slide makes no move without one), a key pressed again where the
 * cursor or a click left the selection, each with notes mode on as well as
 * off, and a random walk over all of them on a board in play.
 */
export function inputAnswers(game: AnyGame, id: string): InputAnswers {
  const b = probeBoard(game, id);
  const { m, size, tileSize } = b;
  const out: InputAnswers = {
    inputs: 0,
    recorded: 0,
    unchanged: 0,
    recordedUnchanged: [],
    droppedChanged: [],
    claimedForGame: 0,
    silent: [],
    unpainted: [],
  };
  let claimedForGame = 0;
  let inputs = 0;
  let recorded = 0;
  const sent: string[] = [];
  // The opening position again, by a restart and the deal's `Ui` put back. A
  // fresh deal of the same id costs milliseconds in the games that prove their
  // board at load, and this is asked several hundred times a game.
  const dealt = copyUi(b.live().ui);
  const rewind = () => {
    m.restartGame();
    restoreUi(b.live().ui, copyUi(dealt));
    sent.length = 0;
  };
  // A `Ui` holds more than is painted (a hidden cursor is parked where a press
  // fell), so the frame is what convicts, and the `Ui` only says when to look.
  const frames = new Map<string, string>();
  const frame = (state: unknown, ui: unknown, uiDigest: string) => {
    const k = `${uiDigest}|${b.digestOf(state)}`;
    let f = frames.get(k);
    if (f === undefined) {
      f = b.paint(state, ui);
      frames.set(k, f);
    }
    return f;
  };
  const run = (script: readonly ProbeInput[], fresh = true) => {
    if (fresh) rewind();
    for (const input of script) {
      const moves = b.moves();
      const before = b.executions();
      const was = b.live();
      const ui = digest(was.ui);
      const kept = copyUi(was.ui);
      const redraws = b.redraws();
      const answers = b.answers();
      const consumed = m.processInput(input.at.x, input.at.y, input.button);
      inputs++;
      sent.push(input.name);
      const rose = b.moves() - moves;
      const changed = b.executions().changed - before.changed;
      recorded += rose;
      const how = () => sent.slice(-8).join(", ");
      if (rose > changed) out.recordedUnchanged.push(how());
      if (rose < changed) out.droppedChanged.push(how());
      // A claimed input is painted by the midend's own transition.
      // So only one the game answered nothing to is looked at.
      if (consumed && b.answers() > answers) continue;
      const now = b.live();
      const uiNow = digest(now.ui);
      if (uiNow === ui) continue;
      const seen = frame(now.state, now.ui, uiNow) !== frame(was.state, kept, ui);
      if (consumed) {
        if (seen) claimedForGame++;
        continue;
      }
      if (b.redraws() === redraws) out.unpainted.push(how());
      if (seen) out.silent.push(how());
    }
  };

  const origin = { x: 0, y: 0 };
  const key = (button: number): ProbeInput => ({
    name: keyName(button),
    at: origin,
    button,
  });
  const pointer = (what: string, at: Point, button: number): ProbeInput => ({
    name: `${what} (${at.x},${at.y})`,
    at,
    button,
  });
  const buttons = [
    { name: "left", press: LEFT_BUTTON, drag: LEFT_DRAG, release: LEFT_RELEASE },
    { name: "right", press: RIGHT_BUTTON, drag: RIGHT_DRAG, release: RIGHT_RELEASE },
  ];
  type Button = (typeof buttons)[number];
  const click = (bt: Button, p: Point) => [
    pointer(`${bt.name} press`, p, bt.press),
    pointer(`${bt.name} release`, p, bt.release),
  ];
  const drag = (bt: Button, p: Point, via: readonly Point[], end: Point) => [
    pointer(`${bt.name} press`, p, bt.press),
    ...via.map((q) => pointer(`${bt.name} drag`, q, bt.drag)),
    pointer(`${bt.name} release`, end, bt.release),
  ];
  const inside = (q: Point) => q.x >= 0 && q.y >= 0 && q.x < size.w && q.y < size.h;
  const off = (p: Point, tiles: number) =>
    [
      { x: p.x + tiles * tileSize, y: p.y },
      { x: p.x, y: p.y + tiles * tileSize },
      { x: p.x - tiles * tileSize, y: p.y },
      { x: p.x, y: p.y - tiles * tileSize },
    ].filter(inside);

  const points = probePoints(size);
  // A key after a click is pressed at every third point: with a dozen keys
  // and two modes that round is otherwise most of the sweep.
  const sparse = points.filter((_, i) => i % 3 === 0);
  const arrows = [CURSOR_UP, CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT];
  const panel = m.requestKeys().map((k) => k.button);
  const modes = panel.includes(PENCIL_MODE_BUTTON)
    ? [[], [key(PENCIL_MODE_BUTTON)]]
    : [[]];
  const keys = [
    ...new Set([
      ...panel.filter((k) => k !== PENCIL_MODE_BUTTON),
      CURSOR_SELECT,
      CURSOR_SELECT2,
      DELETE,
    ]),
  ];

  for (const p of points)
    for (const bt of buttons) {
      run([...click(bt, p), ...click(bt, p)]);
      for (const q of off(p, 1)) {
        run(drag(bt, p, [q, p], p));
        run(drag(bt, p, [q], q));
      }
      for (const q of off(p, 2)) run(drag(bt, p, [q], q));
    }
  for (const mode of modes) {
    for (const k of keys) {
      for (const prefix of [[], ...arrows.map((a) => [key(a)])])
        run([...mode, ...prefix, key(k), key(k), key(k)]);
      for (const p of sparse) run([...mode, ...click(buttons[0], p), key(k), key(k)]);
    }
    for (const a of arrows) run([...mode, key(a), key(a)]);
  }
  const random = randomNew(`answers-${id}`);
  const pick = <T>(from: readonly T[]) => from[randomUpto(random, from.length)];
  for (const mode of modes)
    for (let walk = 0; walk < WALKS; walk++) {
      run(mode);
      for (let step = 0; step < WALK_STEPS; step++) {
        const kind = randomUpto(random, 10);
        if (kind < 2) run([key(pick(arrows))], false);
        else if (kind < 5) run(click(pick(buttons), pick(points)), false);
        else if (kind < 7) {
          const p = pick(points);
          const q = pick([...off(p, 1), ...off(p, 2), p]);
          run(drag(pick(buttons), p, [q], q), false);
        } else {
          const k = pick(keys);
          run([key(k), key(k)], false);
        }
      }
    }
  return {
    ...out,
    inputs,
    recorded,
    claimedForGame,
    unchanged: b.executions().unchanged,
  };
}

/** What a game's answers to Shift and Ctrl with an arrow came to. */
export interface ModifierArrows {
  /** How many cursor positions the plain arrows reached: the sweep's reach,
   * which stops at {@link CURSOR_CAP}. */
  readonly positions: number;
  /** How many pairs of a modified arrow and its opposite were pressed. */
  readonly pairs: number;
  /** How many of those pairs had a press that changed the board. A game with
   * any is one that takes a modified arrow, whatever it does with it. */
  readonly acted: number;
  /** Each pair whose two presses changed the board and left the same board
   * and the same `Ui`, as the script that reaches it from the deal. */
  readonly alike: string[];
}

/**
 * **Does the key decide which way a modified arrow acts?**
 *
 * Shift or Ctrl with an arrow is a gesture in the games that take it: it
 * slides a line, paints as the cursor passes, drags a fill. What each does is
 * its own, so no direction is read off a board here. What every one of them
 * owes is that an arrow and its opposite, pressed from one place, do not do
 * the same thing. A game that works the direction out from where the cursor
 * ended up fails that where the cursor has nowhere to go: at the board's far
 * edge, where Sixteen slid a row left for Right and for Left alike.
 *
 * So each pair is pressed from every position the plain arrows walk the
 * cursor to, the edges and corners among them. Only a pair that *changed the
 * board* is held to it: the first modified arrow shows a hidden cursor
 * whichever arrow it is, and that is a rule of its own (`engine-input`, "One
 * arrow press reveals the cursor and moves it").
 */
export function modifierArrows(game: AnyGame, id: string): ModifierArrows {
  const b = probeBoard(game, id);
  const { m } = b;
  const arrows = [CURSOR_UP, CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT];
  const dealt = b.board();
  // A position is a `Ui` over the dealt board, put back between presses.
  const at = (ui: unknown) => {
    if (b.board() !== dealt) m.restartGame();
    restoreUi(b.live().ui, copyUi(ui));
  };
  const positions = [{ ui: copyUi(b.live().ui), path: [] as number[] }];
  const met = new Set([digest(b.live().ui)]);
  for (let i = 0; i < positions.length; i++)
    for (const a of arrows) {
      at(positions[i].ui);
      m.processInput(0, 0, a);
      // An arrow that moves the board (a sliding puzzle) leads to no position.
      if (b.board() !== dealt) continue;
      const d = digest(b.live().ui);
      if (met.has(d) || positions.length >= CURSOR_CAP) continue;
      met.add(d);
      positions.push({ ui: copyUi(b.live().ui), path: [...positions[i].path, a] });
    }

  const alike: string[] = [];
  let pairs = 0;
  let acted = 0;
  const press = (i: number, button: number) => {
    at(positions[i].ui);
    m.processInput(0, 0, button);
    return { board: b.board(), where: b.where() };
  };
  const modifiers = [MOD_SHFT, MOD_CTRL, MOD_SHFT | MOD_CTRL];
  for (let i = 0; i < positions.length; i++)
    for (const mod of modifiers)
      for (const [k, back] of [
        [0, 1],
        [2, 3],
      ]) {
        const one = press(i, mod | arrows[k]);
        const other = press(i, mod | arrows[back]);
        pairs++;
        if (one.board === dealt && other.board === dealt) continue;
        acted++;
        if (one.where !== other.where) continue;
        const keys = [...positions[i].path, mod | arrows[k]].map(keyName);
        alike.push(
          `${keys.join(", ")}, and the same for ${keyName(mod | arrows[back])}`,
        );
      }
  return { positions: positions.length, pairs, acted, alike };
}

const WALKS = 4;
const WALK_STEPS = 100;

/** A key as a failure names it. */
function keyName(button: number): string {
  const held = [
    button & MOD_CTRL ? "Ctrl+" : "",
    button & MOD_SHFT ? "Shift+" : "",
  ].join("");
  if (held !== "") return held + keyName(button & ~(MOD_CTRL | MOD_SHFT));
  const named: Record<number, string> = {
    [CURSOR_UP]: "Up",
    [CURSOR_DOWN]: "Down",
    [CURSOR_LEFT]: "Left",
    [CURSOR_RIGHT]: "Right",
    [CURSOR_SELECT]: "Enter",
    [CURSOR_SELECT2]: "Space",
    [DELETE]: "Backspace",
    [PENCIL_MODE_BUTTON]: "Marks",
  };
  if (named[button] !== undefined) return named[button];
  return button > 0x20 && button < 0x7f
    ? `'${String.fromCharCode(button)}'`
    : `key 0x${button.toString(16)}`;
}
