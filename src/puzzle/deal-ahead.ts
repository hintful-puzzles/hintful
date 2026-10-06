/**
 * The next board, dealt before it is asked for.
 *
 * A deal is slow once a board and some types take seconds to find one (Group's
 * 6x6 at Tricky is ten seconds on average), so the page deals the board after
 * this one while the player is busy with this one, and keeps it. New game then
 * plays the kept board and the wait is paid once a type.
 *
 * **Every type is dealt ahead, not only a slow one.** What it costs is one
 * board more than the player plays, for each type they open, and telling a slow
 * type from a quick one would take a measurement the page has not got until it
 * has dealt there.
 *
 * **The deal runs in a second worker.** A generator owns its thread until it
 * returns, and the board in play needs the first one to answer input.
 */

import type { DealtBoard, EncodedParams, PuzzleId } from "../engine/types.ts";
import type { KeptBoards } from "../store/kept-boards.ts";
import { spawnPuzzleWorker, unlessWorkerFailsToStart } from "./spawn-worker.ts";

/** A deal under way off the page's thread. */
export interface RunningDeal {
  /** The board, or `null` where the generator found none. Never settles once
   * the deal is stopped. */
  readonly board: Promise<DealtBoard | null>;
  stop(): void;
}

export type StartDeal = (puzzleId: PuzzleId, params: EncodedParams) => RunningDeal;

/** Deal one board in a worker of its own, which ends with the deal. */
const dealInWorker: StartDeal = (puzzleId, params) => {
  const { worker, factory, terminate } = spawnPuzzleWorker(`deal-worker-${puzzleId}`);
  return {
    board: unlessWorkerFailsToStart(worker, factory.deal(puzzleId, params)).finally(
      terminate,
    ),
    stop: terminate,
  };
};

export class DealAhead {
  /** The deal under way, and the type it is for. */
  private dealing: { params: EncodedParams; deal: RunningDeal } | null = null;
  /** The type whose last deal here found no board. It is not dealt again
   * until a board of it has been asked for, or a resize would start another
   * search of seconds each time it reported. */
  private fruitless: EncodedParams | null = null;
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly puzzleId: PuzzleId,
    private readonly boards: Pick<KeptBoards, "take" | "has" | "keep">,
    private readonly startDeal: StartDeal = dealInWorker,
  ) {}

  /** The board kept for `params`, for the deal that is about to be made. */
  async take(params: EncodedParams): Promise<DealtBoard | null> {
    this.fruitless = null;
    return this.boards.take(this.puzzleId, params);
  }

  /**
   * See that a board is kept for `params`, the type the next New game deals,
   * or is on its way. A deal under way for any other type is one the player
   * has left, and is stopped.
   */
  prepare(params: EncodedParams): Promise<void> {
    const prepared = this.queue.then(() => this.prepareNow(params));
    this.queue = prepared.catch(() => {});
    return prepared;
  }

  private async prepareNow(params: EncodedParams): Promise<void> {
    if (this.dealing?.params === params || this.fruitless === params) return;
    this.stop();
    if (await this.boards.has(this.puzzleId, params)) return;
    const deal = this.startDeal(this.puzzleId, params);
    const dealing = { params, deal };
    this.dealing = dealing;
    void deal.board.then(async (board) => {
      if (this.dealing !== dealing) return;
      this.dealing = null;
      if (board === null) this.fruitless = params;
      else await this.boards.keep(this.puzzleId, board);
    });
  }

  /** Abandon the deal under way, if there is one. */
  stop(): void {
    this.dealing?.deal.stop();
    this.dealing = null;
  }
}
