/**
 * What every `happy-dom` file gets, whether or not it asked: the stubs Web
 * Awesome needs to be mounted, and a body emptied after the file.
 *
 * Both are here, rather than imported by the files that mount components,
 * because the suite runs with `isolate: false`: a worker keeps one window and
 * one module graph for all its files. A component one file defined is still
 * defined in the next, and a `<wa-dialog>` that the next file creates, even as
 * a bare stand-in, is upgraded to the real one, `wa-button` and all. Without
 * the stubs in place, its update throws asynchronously, and `vitest` exits 1
 * naming a Web Awesome chunk and whichever file was running at the time. An
 * opt-in import made that depend on which files shared a worker, and in what
 * order, which is decided by load.
 *
 * A file that leaves elements in the body leaves them in the next file's
 * document, still connected and still updating; emptying it after each file
 * keeps one file's elements out of another's run.
 *
 * In a `node` file there is no DOM, and this does nothing.
 */
import { afterAll } from "vitest";

if (typeof document !== "undefined") {
  await import("./element-internals.ts");
  await import("./resize-and-animations.ts");
  afterAll(() => {
    document.body.replaceChildren();
  });
}
