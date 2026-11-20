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
import { signal } from "@lit-labs/signals";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { KeyLabel, KeyStatus } from "../../engine/contract/types.ts";
import { pencilModeKey } from "../../engine/key-labels.ts";
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

async function mountKeys(
  keys: KeyLabel[],
  puzzle: object = { keyStatus: [] },
): Promise<PuzzleKeys> {
  const context = new PuzzleContext();
  (context as unknown as { _puzzle: unknown })._puzzle = Object.defineProperties(
    { palette: PALETTE, delete: async () => {} },
    Object.getOwnPropertyDescriptors(puzzle),
  );
  const panel = document.createElement("puzzle-keys");
  panel.keys = keys;
  context.append(panel);
  document.body.append(context);
  mounted.push(context);
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
      palette: [],
      keyStatus: [],
      delete: async () => {},
    };
    const panel = document.createElement("puzzle-keys");
    panel.keys = [{ button: 0x31, label: "1", swatch: 2 }];
    context.append(panel);
    document.body.append(context);
    mounted.push(context);
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

describe("the Marks key shows the mode it toggles", () => {
  it("is pressed while the game's pencil mode is on, and follows it", async () => {
    // The mode is read off the puzzle, not kept by the key: the key is not the
    // only way to flip it, so a copy would show it as the key last left it.
    const pencilMode = signal(false);
    const panel = await mountKeys([{ button: 0x31, label: "1" }, pencilModeKey], {
      keyStatus: [],
      get pencilMode() {
        return pencilMode.get();
      },
    });
    // What a screen reader is told, and whether the key is drawn lit.
    const shown = () =>
      buttons(panel).map((b) => [
        b.querySelector(".spoken")?.textContent ?? null,
        b.classList.contains("mode-on"),
      ]);

    // A key that types has no state at all.
    expect(shown()).toEqual([
      [null, false],
      ["off", false],
    ]);
    pencilMode.set(true);
    await panel.updateComplete;
    expect(shown()[1]).toEqual(["on", true]);
    pencilMode.set(false);
    await panel.updateComplete;
    expect(shown()[1]).toEqual(["off", false]);
  });
});

describe("a key shows what the board has shown of its value", () => {
  it("is filled, given a disc, or made faint, follows the board, and says so", async () => {
    // Read off the puzzle, as the Marks key's mode is: the keys are fetched
    // once a params change, and the status moves with every guess.
    const status = signal<KeyStatus[]>([]);
    const panel = await mountKeys(
      ["A", "B", "C", "D"].map((label) => ({ button: label.charCodeAt(0), label })),
      {
        get keyStatus() {
          return status.get();
        },
      },
    );
    const looks = () =>
      buttons(panel).map((b) => [
        b.style.getPropertyValue("--wa-color-fill-loud") ||
          (b
            .querySelector<HTMLElement>(".disc")
            ?.style.getPropertyValue("--wa-color-fill-loud") ??
            null),
        b.classList.contains("faint"),
        b.querySelector(".spoken")?.textContent ?? null,
      ]);
    expect(looks()).toEqual([
      [null, false, null],
      [null, false, null],
      [null, false, null],
      [null, false, null],
    ]);
    status.set([
      { button: 0x41, look: "fill", swatch: 3, spoken: "in place" },
      { button: 0x42, look: "disc", swatch: 2, spoken: "in the word" },
      { button: 0x43, look: "faint", spoken: "not in the word" },
    ]);
    await panel.updateComplete;
    expect(looks()).toEqual([
      [PALETTE[3], false, "in place"],
      [PALETTE[2], false, "in the word"],
      [null, true, "not in the word"],
      [null, false, null],
    ]);
    // The label is still the letter the key types.
    expect(buttons(panel)[1].textContent?.trim()).toMatch(/^B/);
  });
});

describe("a keypad with rows is a keyboard", () => {
  it("draws a line a row, in the order the rows are numbered", async () => {
    const panel = await mountKeys([
      { button: 0x51, label: "Q", row: 0 },
      { button: 0x41, label: "A", row: 1 },
      { button: 0x57, label: "W", row: 0 },
      { button: 8, label: "Clear", row: 1 },
    ]);
    const base = panel.shadowRoot?.querySelector("[part~=base]");
    expect(base?.classList.contains("keyboard")).toBe(true);
    const rows = [...(base?.querySelectorAll("[part~=group]") ?? [])].map((g) =>
      [...g.querySelectorAll("wa-button")].map((b) => b.getAttribute("data-button")),
    );
    expect(rows).toEqual([
      ["81", "87"],
      ["65", "8"],
    ]);
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
