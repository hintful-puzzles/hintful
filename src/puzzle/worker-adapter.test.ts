import { describe, expect, it } from "vitest";
import type { EngineCore } from "../engine/midend.ts";
import { TsWorkerPuzzle } from "./worker-adapter.ts";

describe("TsWorkerPuzzle — the first palette install must repaint", () => {
  /**
   * `redraw()` is gated on `paletteReady` because the canvas `Drawing` throws
   * if asked to paint before a palette exists — so every repaint requested
   * before then is **silently dropped**. The midend requests one on the initial
   * game transition, which is a race the game loses whenever generation is
   * fast, so the first palette install has to repaint, not only a replacement.
   *
   * The player-visible symptom was a board that never appeared: deep-linking to
   * a non-default type left the canvas blank, while the same params chosen from
   * the in-app menu painted at once (by then the palette was long installed).
   *
   * The test drives the adapter's real ordering — a repaint arriving *before*
   * the palette — through a fake engine that counts paints.
   */
  function fakeEngine(): { engine: EngineCore; paints: () => number } {
    let paints = 0;
    const engine = {
      redraw: () => {
        paints++;
      },
      forceRedraw: () => {
        paints++;
      },
      canvasCleared: () => {},
    } as unknown as EngineCore;
    return { engine, paints: () => paints };
  }

  /** Minimal stand-in for the canvas `Drawing`: `setPalette` reports `true`
   * only when it *replaces* a palette, exactly as the real one does. */
  function fakeDrawing(): { setPalette(colors: string[]): boolean } {
    let installed = false;
    return {
      setPalette(colors: string[]): boolean {
        const replaced = installed && colors.length > 0;
        if (colors.length > 0) installed = true;
        return replaced;
      },
    };
  }

  function attach(worker: TsWorkerPuzzle, drawing: unknown): void {
    // The real `attachCanvas` needs an OffscreenCanvas; reach past it, since
    // what is under test is the palette/redraw ordering, not canvas creation.
    (worker as unknown as { drawing: unknown }).drawing = drawing;
  }

  it("paints once the palette arrives, even though the earlier repaint was dropped", () => {
    const { engine, paints } = fakeEngine();
    const worker = new TsWorkerPuzzle("fake", engine);
    attach(worker, fakeDrawing());

    // The midend's initial-transition repaint, arriving before the palette.
    worker.redraw();
    expect(paints(), "a pre-palette repaint must not reach the canvas").toBe(0);

    // Installing the palette must flush that dropped repaint.
    worker.setDrawingPalette(["#000000", "#ffffff"]);
    expect(paints(), "the first palette install must repaint").toBe(1);
  });

  it("still repaints when a palette is later replaced (light/dark toggle)", () => {
    const { engine, paints } = fakeEngine();
    const worker = new TsWorkerPuzzle("fake", engine);
    attach(worker, fakeDrawing());

    worker.setDrawingPalette(["#000000"]);
    expect(paints()).toBe(1);
    // A replacement invalidates any per-tile cache keyed to the old colors.
    worker.setDrawingPalette(["#ffffff"]);
    expect(paints()).toBe(2);
  });
});
