import { signal } from "@lit-labs/signals";

interface WindowSize {
  readonly width: number;
  readonly height: number;
  /** The root font size in CSS pixels: what one `rem` measures here. */
  readonly rem: number;
}

function measure(): WindowSize {
  const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    // A detached or unstyled document reports no size; 16 is the CSS default.
    rem: Number.isFinite(rem) && rem > 0 ? rem : 16,
  };
}

/**
 * The window's size, as a signal: what the puzzle screen's layout and the
 * Layout preferences both read, so the two cannot disagree about which window
 * shape is in force.
 */
export const windowSize = signal<WindowSize>(measure(), {
  equals: (a, b) => a.width === b.width && a.height === b.height && a.rem === b.rem,
});

const update = () => windowSize.set(measure());
window.addEventListener("resize", update);
window.visualViewport?.addEventListener("resize", update);
