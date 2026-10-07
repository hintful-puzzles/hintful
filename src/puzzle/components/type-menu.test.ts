// @vitest-environment happy-dom
/**
 * **"Custom type…" opens its dialog wherever the Type menu is drawn.**
 *
 * The menu appends the dialog inside the nearest `<puzzle-context>`, so the
 * dialog and its form are provided the same puzzle as the menu. The rail draws
 * its menu inside its own shadow root, which `Element.closest` does not leave,
 * and while the lookup used it the rail's Custom type… threw instead of opening.
 * So the menu is mounted both ways, under a real `<puzzle-context>` provider,
 * and the real dialog is opened from each.
 */
import "../../test-setup/element-internals.ts";
import "../../test-setup/resize-and-animations.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PuzzleContext } from "./context.ts";
import "./type-menu.ts";

type PuzzleTypeMenu = HTMLElementTagNameMap["puzzle-type-menu"];

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

/** A puzzle with just enough surface for the menu, the dialog and its form. */
function fakePuzzle() {
  return {
    puzzleId: "lightup",
    displayName: "Light Up",
    currentParams: "7x7",
    getPresets: async () => [],
    getParamsDescription: async () => "7x7",
    getCustomParamsConfig: async () => ({
      items: { w: { type: "string", name: "Width" } },
    }),
    getCustomParams: async () => ({ w: "7" }),
    delete: async () => {},
  };
}

let mounted: { context: PuzzleContext; menu: PuzzleTypeMenu }[] = [];

afterEach(() => {
  for (const { context, menu } of mounted) {
    // The menu removes its dialog from the context as it disconnects. A browser
    // runs that reaction after the removal that caused it; happy-dom runs it
    // during, and fails walking a child list that just changed.
    menu.remove();
    context.remove();
  }
  mounted = [];
});

/** A `<puzzle-context>` providing the fake puzzle, with a Type menu in it —
 * directly, or behind a shadow root the way the rail draws one. */
async function mountMenu(placement: "light DOM" | "shadow root") {
  const context = new PuzzleContext();
  // Assigned before connecting, so `connectedCallback` finds a puzzle and does
  // not create a real one.
  (context as unknown as { _puzzle: unknown })._puzzle = fakePuzzle();
  const menu = document.createElement("puzzle-type-menu");
  if (placement === "shadow root") {
    const host = document.createElement("div");
    host.attachShadow({ mode: "open" }).append(menu);
    context.append(host);
  } else {
    context.append(menu);
  }
  document.body.append(context);
  mounted.push({ context, menu });
  await menu.updateComplete;
  return { context, menu };
}

describe("the Type menu's Custom type… dialog", () => {
  for (const placement of ["light DOM", "shadow root"] as const) {
    it(`opens from a menu in the ${placement}`, async () => {
      const { context, menu } = await mountMenu(placement);
      await menu.launchCustomDialog();
      const dialog = context.querySelector("puzzle-custom-params-dialog");
      expect(dialog, "appended inside the puzzle-context").not.toBeNull();
      expect(dialog?.open).toBe(true);
    });
  }

  it("is titled with the game's display name, not its id", async () => {
    const { context, menu } = await mountMenu("shadow root");
    await menu.launchCustomDialog();
    const dialog = context.querySelector("puzzle-custom-params-dialog");
    await dialog?.updateComplete;
    const label = dialog?.shadowRoot?.querySelector("wa-dialog")?.getAttribute("label");
    expect(label).toBe("Custom Light Up");
  });
});
