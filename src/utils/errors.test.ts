// @vitest-environment happy-dom
/*
 * Recovery from a stale page after a deploy.
 *
 * The failure this covers reached a player: every chunk filename carries a
 * content hash, a deploy replaces those hashes, and Cloudflare Pages serves
 * only the current deployment — so a page loaded before a deploy names files
 * that no longer exist, and the next lazy `import()` fails with "Failed to
 * fetch dynamically imported module". The About dialog would not open, and the
 * rejection fell through to the generic handler, which showed a crash dialog.
 *
 * Nothing in the suite could see it. The failure is not in any module's logic —
 * it is in the relationship between a page and the deployment it is talking to,
 * which no unit test has. So the thing to test is the *recovery*: given the
 * event Vite fires, does the app reload rather than accuse itself, and does it
 * stop reloading if reloading is not helping?
 */
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import * as crashDialog from "../dialogs/crash-dialog.ts";
import { installErrorHandlers, StaleBuildError } from "./errors.ts";

let reportError: MockInstance<typeof crashDialog.reportError>;
/** The event Vite dispatches when a preloaded chunk fails to load. */
function firePreloadError(message = "Failed to fetch dynamically imported module") {
  const event = new Event("vite:preloadError", { cancelable: true });
  (event as Event & { payload: Error }).payload = new Error(message);
  window.dispatchEvent(event);
  return event;
}

describe("a stale chunk after a deploy recovers by reloading", () => {
  let reload: ReturnType<typeof vi.fn<() => void>>;

  // ONCE, not per test. `installErrorHandlers` adds listeners to the shared
  // `window` and is not idempotent — production calls it once from `main.ts`.
  // Calling it per test stacked a second, third and fourth handler on the same
  // event, so one dispatch ran the whole recovery several times over and the
  // later tests failed against their own setup rather than against the code.
  beforeAll(() => {
    installErrorHandlers();
  });

  beforeEach(() => {
    reportError = vi.spyOn(crashDialog, "reportError").mockResolvedValue(undefined);
    sessionStorage.clear();
    reload = vi.fn<() => void>();
    // happy-dom's `location` is not configurable wholesale; replacing just the
    // method is enough and leaves the rest of the URL machinery intact.
    vi.spyOn(window.location, "reload").mockImplementation(reload);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reloads instead of reporting a crash", () => {
    const event = firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
    // The player is not told the app crashed: it did not, the page was stale.
    expect(reportError).not.toHaveBeenCalled();
    // Vite's default is to rethrow, which is what produced the crash dialog.
    expect(event.defaultPrevented).toBe(true);
  });

  it("reloads only once, so a chunk a reload cannot fix is not a loop", () => {
    firePreloadError();
    firePreloadError();
    firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reports for real once reloading has been shown not to help", () => {
    firePreloadError();
    reportError.mockClear();

    firePreloadError("Failed to fetch dynamically imported module");

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(String(reportError.mock.calls[0][0])).toContain("reloading did not help");
  });

  it("still recovers when web storage throws", () => {
    // A browser set to block site data throws on access rather than returning
    // null. An unguarded read here would take out the recovery it bounds.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("The operation is insecure.");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("The operation is insecure.");
    });

    firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(reportError).not.toHaveBeenCalled();
  });

  // The puzzle worker is not a lazy import, so Vite never fires its event for
  // it: `Puzzle.create` raises a StaleBuildError, and the rejection reaches
  // here. It must land in the same recovery, bounded by the same cooldown.
  it("recovers the same way from a StaleBuildError nobody caught", () => {
    const event = fireRejection(new StaleBuildError("worker script missing"));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(reportError).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);

    fireRejection(new StaleBuildError("worker script missing"));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(String(reportError.mock.calls[0][0])).toContain("reloading did not help");
  });

  it("still reports any other rejection as a crash", () => {
    fireRejection(new Error("an ordinary bug"));

    expect(reload).not.toHaveBeenCalled();
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});

/** What the browser dispatches for a rejection nobody handled. */
function fireRejection(reason: unknown) {
  const event = new Event("unhandledrejection", { cancelable: true });
  (event as Event & { reason: unknown }).reason = reason;
  window.dispatchEvent(event);
  return event;
}
