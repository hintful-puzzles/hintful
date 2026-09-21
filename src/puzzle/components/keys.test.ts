// @vitest-environment happy-dom
/**
 * **The on-screen key panel: a key that names a color, and a press that does
 * not steal the keyboard.**
 *
 * Both are invisible to every other tier. A swatch key is only wrong on screen,
 * and the focus theft was wrong in *every* keypad game for the project's whole
 * life with a green suite over it — the board listens for `keydown` on itself
 * (`view-interactive.ts`) and `puzzle-screen`'s window-level redirect steps in
 * only when nothing at all is focused, so a `mousedown` landing on a key left
 * the physical keyboard dead until the player clicked the board again.
 */
import "../../test-setup/element-internals.ts";
import "../../test-setup/resize-and-animations.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { KeyLabel } from "../../engine/types.ts";
import { cssColorToOKLCH, oklchToCSSColor } from "../../utils/color.ts";
import { PuzzleContext } from "./context.ts";
import "./keys.ts";

type PuzzleKeys = HTMLElementTagNameMap["puzzle-keys"];

// `wa-icon` fetches its SVG from Web Awesome's default library, and happy-dom
// aborts the request at teardown with a stack trace per icon.
vi.stubGlobal(
  "fetch",
  vi.fn(
    async () =>
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        headers: { "Content-Type": "image/svg+xml" },
      }),
  ),
);

/**
 * Pale and dark fills, written the way `view.ts` writes a resolved palette —
 * through `oklchToCSSColor`, so the ink decision is made on the same strings
 * production hands the panel.
 *
 * `String(...)` because colorjs's `display()` returns a **boxed** `String`
 * carrying the color on a property. It behaves as its text everywhere the app
 * uses it, and an assertion comparing one by identity fails while printing two
 * strings that look the same.
 */
const PALETTE = [
  [0.95, 0, 0],
  [0.5, 0, 0],
  [0.88, 0.05, 27],
  [0.34, 0.13, 27],
].map((lch) => String(oklchToCSSColor(lch as [number, number, number])));

let mounted: PuzzleContext[] = [];

afterEach(() => {
  for (const context of mounted) context.remove();
  mounted = [];
});

async function mountKeys(keys: KeyLabel[]): Promise<PuzzleKeys> {
  const context = new PuzzleContext();
  (context as unknown as { _puzzle: unknown })._puzzle = {
    currentParams: "4x4",
    requestKeys: async () => keys,
    palette: PALETTE,
    delete: async () => {},
  };
  const panel = document.createElement("puzzle-keys");
  context.append(panel);
  document.body.append(context);
  mounted.push(context);
  await panel.updateComplete;
  // The labels are fetched in `willUpdate`, so the first paint has none.
  await panel.updateComplete;
  return panel;
}

function buttons(panel: PuzzleKeys): HTMLElement[] {
  return [...(panel.shadowRoot?.querySelectorAll("wa-button") ?? [])];
}

describe("a key that names a color", () => {
  it("is painted in the palette color it enters, and labeled with its key", async () => {
    const panel = await mountKeys([
      { button: 0x31, label: "1", swatch: 2 },
      { button: 0x32, label: "2", swatch: 3 },
      { button: 8, label: "Clear" },
    ]);
    const [pale, dark, clear] = buttons(panel);

    expect(pale.style.getPropertyValue("--wa-color-fill-loud")).toBe(PALETTE[2]);
    expect(dark.style.getPropertyValue("--wa-color-fill-loud")).toBe(PALETTE[3]);
    // The character the key sends stays on it: the swatch teaches the keyboard
    // binding rather than replacing it.
    expect(pale.textContent?.trim()).toBe("1");

    // A key with no swatch is left entirely alone.
    expect(clear.style.getPropertyValue("--wa-color-fill-loud")).toBe("");
  });

  it("takes its ink from the fill's own lightness", async () => {
    // Not a fixed color: a palette is authored per scheme, and a fill light
    // enough for black text in one scheme is not in the other.
    const panel = await mountKeys([
      { button: 0x31, label: "1", swatch: 0 },
      { button: 0x32, label: "2", swatch: 1 },
    ]);
    const [onPale, onDark] = buttons(panel);
    expect(onPale.style.getPropertyValue("--wa-color-on-loud")).toBe("black");
    expect(onDark.style.getPropertyValue("--wa-color-on-loud")).toBe("white");
  });

  it("renders plain until a palette arrives", async () => {
    // The panel can be asked for keys before the board has been painted once.
    const context = new PuzzleContext();
    (context as unknown as { _puzzle: unknown })._puzzle = {
      currentParams: "4x4",
      requestKeys: async () => [{ button: 0x31, label: "1", swatch: 2 }],
      palette: [],
      delete: async () => {},
    };
    const panel = document.createElement("puzzle-keys");
    context.append(panel);
    document.body.append(context);
    mounted.push(context);
    await panel.updateComplete;
    await panel.updateComplete;

    expect(buttons(panel)[0].style.getPropertyValue("--wa-color-fill-loud")).toBe("");
  });

  it("can read back every color the palette is written in", async () => {
    // The ink decision parses the CSS string `view.ts` produced. These are the
    // two ends of the same conversion, so this is the assertion that keeps the
    // parse from being a claim: a color the app can write and not read would
    // throw inside the panel's render and take the whole keypad down.
    for (const l of [0, 0.25, 0.5, 0.75, 1])
      for (const c of [0, 0.13, 0.3]) {
        const css = oklchToCSSColor([l, c, 27]);
        expect(cssColorToOKLCH(css)[0]).toBeCloseTo(l, 2);
      }
  });
});

describe("pressing a key does not move focus off the board", () => {
  it("prevents the mousedown default, which is what focuses a button", async () => {
    // A proxy, stated as one: happy-dom does not focus on `mousedown` at all,
    // so the consequence cannot be observed here — it was checked in Chrome
    // against Solo and Map, where `document.activeElement` stays on the board
    // element (`view-interactive.ts`) and a physical key still reaches the game
    // straight after an on-screen key.
    const panel = await mountKeys([{ button: 0x31, label: "1" }]);
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    buttons(panel)[0].dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
