import * as Sentry from "@sentry/browser";
import { type Remote, wrap } from "comlink";
import {
  installWorkerErrorReceivers,
  StaleBuildError,
  uninstallWorkerErrorReceivers,
} from "../utils/errors.ts";
import type { RemoteWorkerPuzzleFactory } from "./worker.ts";

const sentryWebWorkerIntegration = import.meta.env.VITE_SENTRY_DSN
  ? Sentry.webWorkerIntegration({ worker: [] })
  : null;
if (sentryWebWorkerIntegration) {
  Sentry.addIntegration(sentryWebWorkerIntegration);
}

/**
 * `request`, unless the worker fails to start first.
 *
 * A worker whose script never runs never answers, so without this a Comlink
 * call to it waits for ever: the board stays blank, the chips say "Type…", and
 * nothing is reported. That reached the owner's phone as a deploy landed
 * (2026-09-27): the page named the previous build's worker file, which
 * Cloudflare Pages had stopped serving. A failed script load arrives as a plain
 * `Event`, and is a stale page; an `ErrorEvent` is the worker's own code
 * throwing as it starts, and is a bug. `puzzle-worker-start.test.ts` holds both.
 */
export async function unlessWorkerFailsToStart<T>(
  worker: Worker,
  request: Promise<T>,
): Promise<T> {
  let onError = (_event: Event) => {};
  const failed = new Promise<never>((_, reject) => {
    onError = (event) =>
      reject(
        event instanceof ErrorEvent
          ? new Error(`The puzzle worker failed as it started: ${event.message}`)
          : new StaleBuildError("The puzzle worker's script could not be loaded"),
      );
    worker.addEventListener("error", onError);
  });
  try {
    return await Promise.race([request, failed]);
  } finally {
    // Once the worker has answered, a later error is not a failure to start;
    // left attached, it would reject a promise nobody is waiting on.
    worker.removeEventListener("error", onError);
  }
}

/** An instance of the puzzle worker, reporting its errors as the page's own. */
export interface PuzzleWorker {
  readonly worker: Worker;
  readonly factory: Remote<RemoteWorkerPuzzleFactory>;
  terminate(): void;
}

/**
 * Start an instance of the puzzle worker (`worker.ts`). The page runs one for
 * the board in play, and a second, short-lived one for each board dealt ahead
 * (`deal-ahead.ts`): the same script, so the build has one worker file to
 * precache and both name the same build of every generator.
 */
export function spawnPuzzleWorker(name: string): PuzzleWorker {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name,
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
  return {
    worker,
    factory: wrap<RemoteWorkerPuzzleFactory>(worker),
    terminate() {
      uninstallWorkerErrorReceivers(worker);
      worker.terminate();
    },
  };
}
