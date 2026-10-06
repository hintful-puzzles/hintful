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
 * **Every deal runs in a second worker**, the one a player is waiting for
 * included. A generator owns its thread until it returns, and the board in
 * play needs the first one to answer input. A worker can also be ended where a
 * generator cannot, which is how a player stops a deal they are tired of
 * waiting for (`DealAhead.stopWaiting`).
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

/** How a wait for a board ended: with the board, with `null` where the
 * generator found none, or `"stopped"` where the wait was ended first. */
export type WaitedDeal = DealtBoard | null | "stopped";

export class DealAhead {
  /** The type the next New game deals, as last heard. */
  private wanted: EncodedParams | null = null;
  /** A player waiting for a board, and the type they asked for. */
  private waiter: {
    params: EncodedParams;
    settle(found: WaitedDeal): void;
    fail(error: unknown): void;
  } | null = null;
  /** Counts the boards asked for, so that one asked for meanwhile is seen. */
  private asked = 0;
  /** The deal under way, and the type it is for. */
  private dealing: { params: EncodedParams; deal: RunningDeal } | null = null;
  /** The type that is not dealt until a board of it is asked for: its last
   * deal here found no board, or the player stopped it. Without this a resize
   * would start another search of seconds each time it reported. */
  private unasked: EncodedParams | null = null;
  /**
   * The types a deal was slow for. One deal says little about the next,
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

  /**
   * The next board of `params`, for a player who is waiting for it: the one
   * kept, or else the one a deal finds. That deal is the deal ahead already
   * under way for the type where there is one, so a type just chosen is
   * searched once and not twice. A wait begun earlier ends as stopped.
   */
  async next(params: EncodedParams): Promise<WaitedDeal> {
    const turn = ++this.asked;
    this.unasked = null;
    this.endWait();
    const kept = await this.boards.take(this.puzzleId, params);
    // A board taken is handed on whatever was asked for meanwhile: it is gone
    // from the store.
    if (kept !== null) return kept;
    if (turn !== this.asked) return "stopped";
    return new Promise((settle, fail) => {
      this.waiter = { params, settle, fail };
      void this.prepare(params);
    });
  }

  /**
   * The player's way out of a wait: the deal is ended, and its type is not
   * dealt again until a board of it is asked for.
   */
  stopWaiting(): void {
    this.asked++;
    if (this.waiter === null) return;
    this.unasked = this.waiter.params;
    this.endWait();
    this.abandon();
  }

  private endWait(): void {
    this.waiter?.settle("stopped");
    this.waiter = null;
  }

  /** The type to deal now. A player who is waiting comes before the board
   * after theirs. */
  private get target(): EncodedParams | null {
    return this.waiter?.params ?? this.wanted;
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
    if (this.target !== params) return;
    if (this.dealing?.params === params) return;
    const waiter = this.waiter;
    if (waiter === null && this.unasked === params) return;
    this.abandon();
    if (waiter !== null) {
      // The deal ahead may have ended between this player's look in the
      // store and their wait beginning: with a board, which is theirs, or
      // with none, which is no reason to keep them from a deal of their own.
      const kept = await this.boards.take(this.puzzleId, params);
      if (this.waiter !== waiter) return;
      if (kept !== null) {
        this.waiter = null;
        waiter.settle(kept);
        return;
      }
    } else {
      const kept = await this.boards.dealTimes(this.puzzleId, params);
      // Each kept board says how long it took, which is how a slow deal of an
      // earlier visit is heard of.
      if (kept.some((ms) => ms >= SLOW_DEAL_MS)) this.slow.add(params);
      if (kept.length >= (this.slow.has(params) ? SLOW_TYPE_BOARDS : 1)) return;
    }
    const deal = this.startDeal(this.puzzleId, params);
    const dealing = { params, deal };
    this.dealing = dealing;
    void deal.dealt.then(
      async ({ board, ms }) => {
        if (this.dealing !== dealing) return;
        this.dealing = null;
        if (ms >= SLOW_DEAL_MS) this.slow.add(params);
        if (board === null) this.unasked = params;
        const waiter = this.waiter;
        if (waiter?.params === params) {
          this.waiter = null;
          waiter.settle(board);
          return;
        }
        if (board === null) return;
        await this.boards.keep(this.puzzleId, board, ms);
        // Round again, for the next board of a slow type. A type chosen
        // meanwhile has asked for its own.
        if (this.wanted === params) void this.prepare(params);
      },
      (error: unknown) => {
        if (this.dealing !== dealing) return;
        this.dealing = null;
        const waiter = this.waiter;
        // With nobody waiting the failure is the page's to report.
        if (waiter?.params !== params) throw error;
        this.waiter = null;
        waiter.fail(error);
      },
    );
  }

  /** Abandon the deal under way and any wait for it, and deal no further
   * until asked again. */
  stop(): void {
    this.wanted = null;
    this.asked++;
    this.endWait();
    this.abandon();
  }

  private abandon(): void {
    this.dealing?.deal.stop();
    this.dealing = null;
  }
}
