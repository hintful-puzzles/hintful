import { provide } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { puzzleContext } from "../contexts.ts";
import { Puzzle } from "../puzzle.ts";

interface PuzzleEventDetail {
  puzzle: Puzzle;
}
export type PuzzleEvent = CustomEvent<PuzzleEventDetail>;

@customElement("puzzle-context")
export class PuzzleContext extends SignalWatcher(LitElement) {
  @property({ type: String, attribute: "puzzleid" })
  puzzleId?: string;

  @property({ type: String, reflect: true, attribute: "gameid" })
  gameId?: string;

  @property({ type: String, reflect: true })
  params?: string;

  @provide({ context: puzzleContext })
  @state()
  private _puzzle?: Puzzle;

  get puzzle(): Puzzle | null {
    return this._puzzle ?? null;
  }

  // For dispatching puzzle-game-state-change
  @state()
  protected currentMove?: number;
  @state()
  protected checkpoints?: ReadonlySet<number>;
  /** The solve timer's seconds, so the autosave keeps up with a running clock
   * and not only with moves; `null` while the timer is off, which costs a game
   * without it no dispatches. */
  @state()
  protected timerSeconds?: number | null;
  /** The saveable `Ui`, for a game that has one. A row composed in Guess is a
   * `Ui` edit and not a move, so none of the three above moves and the autosave
   * would never be refreshed — the encoding was right and nothing asked for it.
   * Empty for every game with no `encodeUi`, so it costs them no dispatches. */
  @state()
  protected uiState?: string;

  override async connectedCallback() {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    if (!this._puzzle) {
      await this._loadPuzzle();
    }
  }

  override async disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    await this._unloadPuzzle();
  }

  /** Nobody is solving a puzzle they cannot see, so the solve timer holds
   * while the page is hidden. */
  private handleVisibilityChange = async () => {
    await this._puzzle?.setTimerPaused(document.visibilityState === "hidden");
  };

  protected override render() {
    return html`<slot></slot>`;
  }

  protected override async willUpdate(changedProps: Map<string, unknown>) {
    if (
      changedProps.has("puzzleId") &&
      this._puzzle &&
      this._puzzle.puzzleId !== this.puzzleId
    ) {
      await this._unloadPuzzle();
      await this._loadPuzzle();
    }
    // Observe several properties for dispatching puzzle-game-state-change
    if (this.puzzle) {
      if (this.puzzle.currentGameId) {
        this.gameId = this.puzzle.currentGameId;
      }
      if (this.puzzle.currentParams) {
        this.params = this.puzzle.currentParams;
      }
      this.checkpoints = this.puzzle.checkpoints;
      this.timerSeconds = this.puzzle.timer?.seconds ?? null;
      this.uiState = this.puzzle.uiState;
    }
    this.currentMove = this.puzzle?.currentMove;
  }

  protected override async updated(changedProps: Map<string, unknown>) {
    if (this.puzzle?.currentParams && changedProps.has("params")) {
      this.dispatchPuzzleEvent("puzzle-params-change");
    }
    if (
      this.puzzle?.currentGameId &&
      (changedProps.has("gameId") ||
        changedProps.has("currentMove") ||
        changedProps.has("checkpoints") ||
        changedProps.has("timerSeconds") ||
        changedProps.has("uiState"))
    ) {
      this.dispatchPuzzleEvent("puzzle-game-state-change");
    }
  }

  private async _loadPuzzle() {
    if (!this.puzzleId) {
      throw new Error("puzzle-context requires puzzleid");
    }
    this._puzzle = await Puzzle.create(this.puzzleId);
    await this.handleVisibilityChange();

    // Notify puzzle-loaded. Listeners can preventDefault() to disable further setup.
    const event = this.dispatchPuzzleEvent("puzzle-loaded");
    if (!event.defaultPrevented) {
      // Set up the game based on attributes
      if (this.params) {
        const error = await this._puzzle.setParams(this.params);
        if (error) {
          throw new Error(`Invalid puzzle-view params="${this.params}": ${error}`);
        }
      }

      if (this.gameId === "none") {
        // Just set up the midend but don't create a new game
      } else if (this.gameId) {
        const error = await this._puzzle.newGameFromId(this.gameId);
        if (error) {
          throw new Error(`Invalid puzzle-view gameid="${this.gameId}": ${error}`);
        }
      } else {
        await this._puzzle.newGame();
      }
    }
  }

  private async _unloadPuzzle() {
    await this._puzzle?.delete();
    this._puzzle = undefined;
  }

  private dispatchPuzzleEvent(type: string): PuzzleEvent {
    if (!this.puzzle) {
      throw new Error(
        `puzzle-context dispatchEvent("${type}") before puzzle initialized`,
      );
    }
    const event = new CustomEvent<PuzzleEventDetail>(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        puzzle: this.puzzle,
      },
    });
    this.dispatchEvent(event);
    return event;
  }

  static override styles = css`
    :host {
      display: contents;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-context": PuzzleContext;
  }

  interface HTMLElementEventMap {
    "puzzle-loaded": PuzzleEvent;
    "puzzle-game-state-change": PuzzleEvent;
    "puzzle-params-change": PuzzleEvent;
  }
}
