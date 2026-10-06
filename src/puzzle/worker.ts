// TODO: use separate tsconfig.json for worker.ts (without DOM)
/// <reference lib="webworker" />
declare var self: DedicatedWorkerGlobalScope;

import * as Sentry from "@sentry/browser";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.registerWebWorker({ self });
}

import { expose, proxy, type Remote } from "comlink";
import { dealBoard } from "../engine/deal.ts";
import { createTsEngine } from "../engine/index.ts";
import { getTsGame } from "../engine/registry.ts";
import type { DealtBoard, EncodedParams } from "../engine/types.ts";
import { TsWorkerPuzzle } from "./worker-adapter.ts";
// Side-effect import: registers every game.
import "../games/index.ts";
import { installErrorHandlersInWorker } from "../utils/errors-worker.ts";
import type { PuzzleEngineSurface } from "./engine-surface.ts";

installErrorHandlersInWorker();

interface WorkerPuzzleFactory {
  create(puzzleId: string): Promise<PuzzleEngineSurface>;
  /** Deal one board at `params` and play nothing: what a second instance of
   * this worker is started for (`deal-ahead.ts`), since a generator owns its
   * thread until it returns. See `dealBoard`. */
  deal(puzzleId: string, params: EncodedParams): Promise<TimedDeal>;
}

/** What a deal found, and how long the generator took over it. */
export interface TimedDeal {
  /** `null` where the generator found no board. */
  board: DealtBoard | null;
  /** Timed in the worker, so that starting the worker is no part of it: on a
   * slow device that would make every type's deal look slow. */
  ms: number;
}
const workerPuzzleFactory: WorkerPuzzleFactory = {
  async create(puzzleId: string): Promise<PuzzleEngineSurface> {
    const engine = createTsEngine(puzzleId);
    if (!engine) {
      throw new Error(`No game is registered for puzzleId "${puzzleId}"`);
    }
    return proxy(new TsWorkerPuzzle(puzzleId, engine));
  },
  async deal(puzzleId: string, params: EncodedParams): Promise<TimedDeal> {
    const game = getTsGame(puzzleId);
    if (!game) {
      throw new Error(`No game is registered for puzzleId "${puzzleId}"`);
    }
    const started = performance.now();
    const board = dealBoard(game, params);
    return { board, ms: performance.now() - started };
  },
};

expose(workerPuzzleFactory);

export type RemoteWorkerPuzzle = Remote<PuzzleEngineSurface>;
/** The factory as the main thread holds it: a puzzle comes back as a proxy,
 * and a dealt board as a copy. */
export interface RemoteWorkerPuzzleFactory {
  create(puzzleId: string): Promise<RemoteWorkerPuzzle>;
  deal: WorkerPuzzleFactory["deal"];
}
