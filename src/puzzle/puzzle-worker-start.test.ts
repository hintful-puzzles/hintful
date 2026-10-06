// @vitest-environment happy-dom
/*
 * A worker that never starts must not leave the board blank for ever.
 *
 * It did, on the owner's phone as a deploy landed: the page named the previous
 * build's worker file, the host no longer served it, and the first Comlink call
 * waited on a worker that would never answer. Nothing was thrown, so nothing
 * recovered and nothing was reported. `errors.test.ts` covers what happens to
 * the `StaleBuildError` this raises; this file covers raising it.
 */
import { describe, expect, it, vi } from "vitest";
import { StaleBuildError } from "../utils/errors.ts";
import { unlessWorkerFailsToStart } from "./spawn-worker.ts";

/** Only the event surface is read, so an `EventTarget` stands in for a Worker. */
function fakeWorker() {
  return new EventTarget() as unknown as Worker;
}

const never = new Promise<never>(() => {});

describe("unlessWorkerFailsToStart", () => {
  it("turns a script that failed to load into a StaleBuildError", async () => {
    const worker = fakeWorker();
    const result = unlessWorkerFailsToStart(worker, never);
    // What a browser fires when a worker's script cannot be fetched: a plain
    // `Event`, with no message and no error.
    worker.dispatchEvent(new Event("error"));
    await expect(result).rejects.toBeInstanceOf(StaleBuildError);
  });

  it("reports the worker's own startup error as a bug, not a stale page", async () => {
    const worker = fakeWorker();
    const result = unlessWorkerFailsToStart(worker, never);
    worker.dispatchEvent(new ErrorEvent("error", { message: "boom" }));
    const error = await result.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(StaleBuildError);
    expect(String(error)).toContain("boom");
  });

  it("answers with the request, and stops listening once it has", async () => {
    const worker = fakeWorker();
    const added = vi.spyOn(worker, "addEventListener");
    const removed = vi.spyOn(worker, "removeEventListener");
    await expect(unlessWorkerFailsToStart(worker, Promise.resolve(42))).resolves.toBe(
      42,
    );
    // A later error is the running worker's, not a failure to start, so the
    // listener must be gone: left attached, it would reject a promise nobody
    // is waiting on, and that surfaces as a crash report.
    expect(added).toHaveBeenCalledOnce();
    expect(removed).toHaveBeenCalledWith("error", added.mock.calls[0][1]);
  });
});
