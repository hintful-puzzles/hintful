/**
 * `ResizeController` and `Element.getAnimations()` made safe under happy-dom,
 * so a Web Awesome dialog holding a config form can be **opened** in a tier-3
 * test.
 *
 * - **`ResizeController` has no observer here.** vitest resolves Lit's `node`
 *   export, where `isServer` is true, and `@lit-labs/observers`' constructor
 *   returns before creating its `ResizeObserver` on the server. Its `target()`
 *   directive still calls `observe()` on the first render, which throws reading
 *   `observe` of undefined. happy-dom does provide `ResizeObserver`, so
 *   stubbing the global changes nothing. The controller's three methods that
 *   touch the observer do nothing while it has none.
 * - **happy-dom has no `getAnimations()`.** `wa-dialog` animates open with a
 *   class and then, in a `requestAnimationFrame`, asks whether anything is
 *   running. happy-dom runs that frame on `setImmediate`, after the test has
 *   finished, so this stays installed rather than being removed in `afterAll`.
 *
 * Both failures are asynchronous, outside the test that caused them, so the
 * test passes while `vitest` exits 1 naming a dependency's chunk.
 *
 * Neither reports anything: a controller that never observes, and no running
 * animations. Nothing here should be asserted against.
 *
 * Import it *before* the component modules, the same ordering rule
 * `element-internals.ts` documents.
 *
 * Dev/test-only, like everything under this directory.
 */
import { ResizeController } from "@lit-labs/observers/resize-controller.js";

type ObserverMethod = (this: { _observer?: unknown }, ...args: unknown[]) => void;

const controllerProto = ResizeController.prototype as unknown as Record<
  string,
  ObserverMethod
>;

for (const name of ["observe", "unobserve", "disconnect"]) {
  const original = controllerProto[name];
  controllerProto[name] = function (...args) {
    if (this._observer) original.apply(this, args);
  };
}

const proto = globalThis.Element?.prototype as
  | (Element & { getAnimations?: () => Animation[] })
  | undefined;

if (proto && typeof proto.getAnimations !== "function") {
  Object.defineProperty(proto, "getAnimations", {
    configurable: true,
    writable: true,
    value: () => [],
  });
}
