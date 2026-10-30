// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { installBackCloses } from "./back-closes.ts";

installBackCloses();

/** A stand-in for a `wa-dialog`: what the module reads of one is its tag, its
 * `open`, and the two events it dispatches. */
function surface(): HTMLElement & { open: boolean } {
  const el = document.createElement("wa-dialog") as HTMLElement & { open: boolean };
  el.open = false;
  document.body.append(el);
  return el;
}

const show = (el: HTMLElement & { open: boolean }) => {
  el.open = true;
  el.dispatchEvent(new Event("wa-after-show", { bubbles: true, composed: true }));
};
const hide = (el: HTMLElement & { open: boolean }) => {
  el.open = false;
  el.dispatchEvent(new Event("wa-after-hide", { bubbles: true, composed: true }));
};
const popState = () =>
  window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("Back closes an open dialog", () => {
  it("pushes one entry when a dialog opens, and Back closes the dialog", async () => {
    const before = window.history.length;
    const dialog = surface();
    show(dialog);
    expect(window.history.length).toBe(before + 1);
    window.history.replaceState(null, "");
    popState();
    expect(dialog.open).toBe(false);
    hide(dialog);
    await settle();
  });

  it("takes its entry back off when the dialog closes another way", async () => {
    const dialog = surface();
    show(dialog);
    const state = window.history.state as Record<string, unknown> | null;
    expect(state && "backCloses" in state).toBe(true);
    let wentBack = false;
    const back = window.history.back.bind(window.history);
    window.history.back = () => {
      wentBack = true;
      back();
    };
    hide(dialog);
    await settle();
    window.history.back = back;
    expect(wentBack).toBe(true);
  });

  it("keeps the entry when one closes as another opens", async () => {
    const card = surface();
    const drawer = surface();
    show(card);
    let wentBack = false;
    const back = window.history.back.bind(window.history);
    window.history.back = () => {
      wentBack = true;
      back();
    };
    hide(card);
    show(drawer);
    await settle();
    expect(wentBack).toBe(false);
    window.history.replaceState(null, "");
    popState();
    expect(drawer.open).toBe(false);
    window.history.back = back;
  });

  it("ignores everything but dialogs and drawers", () => {
    const before = window.history.length;
    const details = document.createElement("wa-details");
    document.body.append(details);
    details.dispatchEvent(
      new Event("wa-after-show", { bubbles: true, composed: true }),
    );
    expect(window.history.length).toBe(before);
  });
});
