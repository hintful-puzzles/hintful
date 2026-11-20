import { signal } from "@lit-labs/signals";
import { DEAL_DEADLINE_MS } from "../engine/retry-limit.ts";
import { SLOW_DEAL_MS } from "./deal-ahead.ts";

/**
 * How long a New game may go unanswered before the app says what it is doing
 * (`DealWait.pending`). Most types deal in well under this, and a kept board
 * (`DealAhead`) is played at once, so the words are seen where a type's boards
 * are rare and none is kept: the first deal of it, or a run of them pressed
 * faster than boards are found. A deal this long is also what makes a type
 * slow, which has more boards kept for it.
 */
export const DEAL_PENDING_MS = SLOW_DEAL_MS;

/** The chrome's wording for a pending deal (`DealWait.message`). */
const DEAL_PENDING_MESSAGE = "Looking for a board…";

/** `ms` as minutes and seconds, `2:05`. */
function clock(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** One New game's wait, as {@link DealWait.begin} hands it out. */
export interface DealTurn {
  /** How long the last board of the type asked for took, if this is still
   * the New game the chrome speaks of. */
  lastTook(ms: number | null): void;
  /** The New game ended, however it did. */
  end(): void;
}

/**
 * What the chrome says while a New game waits for its board. It says so in a
 * place of its own and not in `Puzzle.helpMessage`: the board in play goes on
 * answering input through the wait, so a hint asked for meanwhile would write
 * over the words and take the way out with them.
 */
export class DealWait {
  /** Whether the New game asked for last has gone `DEAL_PENDING_MS` without a
   * board. */
  private readonly _pending = signal(false);
  /** How long the pending deal has run, in whole seconds. */
  private readonly _waited = signal(0);
  /** Counts the New games asked for, so that each knows whether it is still
   * the one the chrome is speaking of. */
  private asked = 0;
  private stoppable = false;
  /** How long the last board of the type waited for took, this visit. */
  private lastMs: number | null = null;

  public get pending(): boolean {
    return this._pending.get();
  }

  /** What the chrome says of a pending deal, and empty when there is none. */
  public get message(): string {
    return this._pending.get() ? DEAL_PENDING_MESSAGE : "";
  }

  /**
   * The pending deal's wait so far, with what is known of how long it will
   * be, and empty when there is none. Nothing is known of a type before its
   * first board here, which is the wait that matters, so the estimate is the
   * last board's time where there is one and the deadline where not.
   */
  public get wait(): string {
    if (!this._pending.get()) return "";
    const waited = clock(this._waited.get() * 1000);
    return this.lastMs === null
      ? `${waited} so far, ${clock(DEAL_DEADLINE_MS)} at most`
      : `${waited} so far; the last took ${clock(this.lastMs)}`;
  }

  /** Whether the pending deal has a way out. */
  public get canStop(): boolean {
    return this._pending.get() && this.stoppable;
  }

  /** A New game was asked for; one asked for since supersedes it. */
  public begin(stoppable: boolean): DealTurn {
    const turn = ++this.asked;
    this.stoppable = stoppable;
    const pendingTimer = setTimeout(() => this._pending.set(true), DEAL_PENDING_MS);
    this._waited.set(0);
    const tick = (): ReturnType<typeof setTimeout> =>
      setTimeout(() => {
        if (turn === this.asked) this._waited.set(this._waited.get() + 1);
        clockTimer = tick();
      }, 1000);
    let clockTimer = tick();
    return {
      lastTook: (ms) => {
        if (turn === this.asked) this.lastMs = ms;
      },
      end: () => {
        clearTimeout(pendingTimer);
        clearTimeout(clockTimer);
        // A New game asked for since has its own wait to speak of.
        if (turn === this.asked) this._pending.set(false);
      },
    };
  }
}
