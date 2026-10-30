/**
 * The browser's Back closes a dialog or drawer that is open, rather than
 * leaving the page. Every game is a page of its own, so on a phone, Back over
 * the help left for whatever page came before, often another game.
 *
 * Opening one pushes a history entry marked as ours; Back pops it, and the
 * `popstate` closes what is open. Closing one another way takes the entry back
 * off, so the next Back leaves the page as it would have. One entry stands for
 * everything open at once: a card that hands over to the help drawer keeps it.
 *
 * Only Web Awesome's `wa-dialog` and `wa-drawer`, which open and close by the
 * events they dispatch, and none of which navigates. The native `<dialog>`s
 * (the switcher, the Menu sheet) can start a navigation of their own, and an
 * entry taken back off then would race it.
 */

const MARK = "backCloses";

const open = new Set<() => void>();

function marked(): boolean {
  const state: unknown = window.history.state;
  return typeof state === "object" && state !== null && MARK in state;
}

function onPopState() {
  if (marked()) return;
  const closes = [...open];
  open.clear();
  for (const close of closes) close();
}

/** Registers `close` to run on Back; the returned function says it closed
 * some other way. */
function backCloses(close: () => void): () => void {
  open.add(close);
  if (!marked()) {
    const state: unknown = window.history.state;
    window.history.pushState(
      { ...(typeof state === "object" ? state : {}), [MARK]: true },
      "",
    );
  }
  return () => {
    if (!open.delete(close) || open.size > 0) return;
    // Deferred, so a surface opened in the same turn (the card's Full rules
    // opening the drawer) keeps the entry instead of popping it.
    setTimeout(() => {
      if (open.size === 0 && marked()) window.history.back();
    });
  };
}

const SURFACES = new Set(["WA-DIALOG", "WA-DRAWER"]);

/** The surface an event was dispatched by, if it is one Back closes. The
 * events bubble out of shadow roots, so the target is the first of the path. */
function surfaceOf(event: Event): (HTMLElement & { open: boolean }) | null {
  const [origin] = event.composedPath();
  return origin instanceof HTMLElement &&
    SURFACES.has(origin.tagName) &&
    "open" in origin
    ? (origin as HTMLElement & { open: boolean })
    : null;
}

/** Wires Back to every `wa-dialog` and `wa-drawer` the page opens. */
export function installBackCloses() {
  const releases = new WeakMap<HTMLElement, () => void>();
  window.addEventListener("popstate", onPopState);
  document.addEventListener("wa-after-show", (event) => {
    const surface = surfaceOf(event);
    if (surface && !releases.has(surface))
      releases.set(
        surface,
        backCloses(() => {
          surface.open = false;
        }),
      );
  });
  document.addEventListener("wa-after-hide", (event) => {
    const surface = surfaceOf(event);
    if (!surface) return;
    releases.get(surface)?.();
    releases.delete(surface);
  });
}
