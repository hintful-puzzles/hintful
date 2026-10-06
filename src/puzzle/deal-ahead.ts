/**
 * The next board, dealt before it is asked for.
 *
 * A deal is slow once a board and some types take seconds to find one (Group's
 * 6x6 at Tricky is ten seconds on average), so the page deals the board after
 * this one while the player is busy with this one, and keeps it. New game then
 * plays the kept board and the wait is paid once a type.
 *
 * **Every type is dealt ahead, and a slow one further ahead.** One board kept
 * covers a player who finishes a board and asks for the next. It does not cover
 * New game pressed twice running, which is how a board is passed over, so a
 * type whose deal was seen to be slow keeps `SLOW_TYPE_BOARDS`. A quick type
 * keeps one: a press that finds none kept there waits milliseconds.
 *
 * **The deal runs in a second worker.** A generator owns its thread until it
 * returns, and the board in play needs the first one to answer input.
 */

import type { DealtBoard, EncodedParams, PuzzleId } from "../engine/types.ts";
import type { KeptBoards } from "../store/kept-boards.ts";
import { spawnPuzzleWorker, unlessWorkerFailsToStart } from "./spawn-worker.ts";
import type { TimedDeal } from "./worker.ts";

/**
 * The deal that makes a type slow, which is the wait a player is told about:
 * `Puzzle` takes from here how long a New game goes unanswered before it says
 * it is looking for a board.
 */
export const SLOW_DEAL_MS = 1000;

/**
 * How many boards a slow type keeps. Each is seconds of one core, spent again
 * at every deploy and wasted on a type the player only passed through, so the
 * number is small: it covers two boards passed over and one played.
 */
export const SLOW_TYPE_BOARDS = 3;

/** A deal under way off the page's thread. */
export interface RunningDeal {
  /** Never settles once the deal is stopped. */
  readonly dealt: Promise<TimedDeal>;
  stop(): void;
}

export type StartDeal = (puzzleId: PuzzleId, params: EncodedParams) => RunningDeal;

/** Deal one board in a worker of its own, which ends with the deal. */
const dealInWorker: StartDeal = (puzzleId, params) => {
  const { worker, factory, terminate } = spawnPuzzleWorker(`deal-worker-${puzzleId}`);
  return {
    dealt: unlessWorkerFailsToStart(worker, factory.deal(puzzleId, params)).finally(
      terminate,
    ),
    stop: terminate,
  };
};

export class DealAhead {
  /** The type the next New game deals, as last heard. */
  private wanted: EncodedParams | null = null;
  /** The deal under way, and the type it is for. */
  private dealing: { params: EncodedParams; deal: RunningDeal } | null = null;
  /** The type whose last deal here found no board. It is not dealt again
   * until a board of it has been asked for, or a resize would start another
   * search of seconds each time it reported. */
  private fruitless: EncodedParams | null = null;
  /**
   * The types a kept board was slow to find. One deal says little about the next,
   * since a search for a rare board ends at the first one it meets (Group's
   * 6x6 Tricky was found in under a second and in 35), so a type seen slow
   * once stays slow for the visit.
   */
  private readonly slow = new Set<EncodedParams>();
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly puzzleId: PuzzleId,
    private readonly boards: Pick<KeptBoards, "take" | "dealTimes" | "keep">,
    private readonly startDeal: StartDeal = dealInWorker,
  ) {}

  /** The board kept for `params`, for the deal that is about to be made. */
  async take(params: EncodedParams): Promise<DealtBoard | null> {
    this.fruitless = null;
    return this.boards.take(this.puzzleId, params);
  }

  /**
   * See that the boards `params` should have are kept or on their way: it is
   * the type the next New game deals. A deal under way for any other type is
   * one the player has left, and is stopped.
   */
  prepare(params: EncodedParams): Promise<void> {
    this.wanted = params;
    const prepared = this.queue.then(() => this.prepareNow(params));
    this.queue = prepared.catch(() => {});
    return prepared;
  }

  private async prepareNow(params: EncodedParams): Promise<void> {
    // Another type was chosen while this waited its turn, and has its own.
    if (this.wanted !== params) return;
    if (this.dealing?.params === params || this.fruitless === params) return;
    this.abandon();
    const kept = await this.boards.dealTimes(this.puzzleId, params);
    // Each kept board says how long it took, which is how a slow deal is
    // heard of: the one just kept, or one of an earlier visit.
    if (kept.some((ms) => ms >= SLOW_DEAL_MS)) this.slow.add(params);
    if (kept.length >= (this.slow.has(params) ? SLOW_TYPE_BOARDS : 1)) return;
    const deal = this.startDeal(this.puzzleId, params);
    const dealing = { params, deal };
    this.dealing = dealing;
    void deal.dealt.then(async ({ board, ms }) => {
      if (this.dealing !== dealing) return;
      this.dealing = null;
      if (board === null) {
        this.fruitless = params;
        return;
      }
      await this.boards.keep(this.puzzleId, board, ms);
      // Round again, for the next board of a slow type. A type chosen
      // meanwhile has asked for its own.
      if (this.wanted === params) void this.prepare(params);
    });
  }

  /** Abandon the deal under way, if there is one, and deal no further until
   * asked again. */
  stop(): void {
    this.wanted = null;
    this.abandon();
  }

  private abandon(): void {
    this.dealing?.deal.stop();
    this.dealing = null;
  }
}
