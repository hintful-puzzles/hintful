/**
 * Worker-side adapter: presents an `EngineCore` (a `Midend`) through the
 * Comlink surface the app's `Puzzle` consumes. A `puzzleId` the registry does
 * not know is unplayable; `catalog-registry.test.ts` guards that in both
 * directions.
 *
 * It lives on the **app** side of the seam, not inside the engine, because an
 * adapter belongs with the thing being adapted *to*: it is the only module that
 * knows both the engine's `EngineCore` and the app's `Drawing` /
 * `PuzzleEngineSurface`, and under the engine it would make the engine import
 * the shell.
 *
 * Custom params and preferences forward to the midend, which builds each config
 * dialog from the game's declarative `paramConfig` / `prefs` and parses the
 * submitted values back. A game that declares neither yields an empty-but-valid
 * config, which is correct for a preset-only game like Flip.
 */

import { transfer } from "comlink";
import type { EngineCore } from "../engine/midend.ts";
import type {
  ChangeNotification,
  CheckVerdict,
  Color,
  ConfigDescription,
  ConfigValues,
  CustomParamsEncoding,
  DealtBoard,
  EncodedParams,
  FontInfo,
  KeyLabel,
  Point,
  PresetMenuEntry,
  PuzzleStaticAttributes,
  ReferenceModel,
  Size,
} from "../engine/types.ts";
import { Drawing } from "./drawing.ts";
import type { HintReferenceMarks, PuzzleEngineSurface } from "./engine-surface.ts";
import {
  inkCoverage,
  markAlpha,
  markBox,
  type ReferenceMarks,
  withoutSpecks,
} from "./mark-flash.ts";

export class TsWorkerPuzzle implements PuzzleEngineSurface {
  private drawing?: Drawing;
  /** The canvas `Drawing` throws if asked to paint before a palette is
   * installed, and the midend repaints on every transition, the initial one
   * included, which can fire before `setDrawingPalette`. So `redraw()` waits
   * for the palette, which the app sets as part of canvas setup. */
  private paletteReady = false;
  private timerActive = false;
  private lastTimeMs = 0;
  private notifyTimerStateRemote?: (isActive: boolean) => void;

  constructor(
    public readonly puzzleId: string,
    private readonly engine: EngineCore,
  ) {}

  // --- callbacks / lifecycle --------------------------------------

  setCallbacks(
    notifyChange: (message: ChangeNotification) => void,
    notifyTimerState: (isActive: boolean) => void,
  ): void {
    this.notifyTimerStateRemote = notifyTimerState;
    this.engine.setCallbacks(
      notifyChange,
      (active) => {
        if (active) this.activateTimer();
        else this.deactivateTimer();
      },
      // Repaint into the canvas this adapter owns; the engine has no Drawing.
      () => this.redraw(),
    );
  }

  getStaticProperties(): PuzzleStaticAttributes {
    return this.engine.getStaticProperties();
  }

  newGame(fitTo?: Size, kept?: DealtBoard | null): string | null {
    return this.engine.newGame(fitTo, kept);
  }
  dealParams(fitTo?: Size): EncodedParams {
    return this.engine.dealParams(fitTo);
  }
  dealFoundNone(fitTo?: Size): string {
    return this.engine.dealFoundNone(fitTo);
  }
  returnToBoardType(): void {
    this.engine.returnToBoardType();
  }
  newGameFromId(id: string): string | null {
    return this.engine.newGameFromId(id);
  }
  restartGame(): void {
    this.engine.restartGame();
  }
  undo(): void {
    this.engine.undo();
  }
  redo(): void {
    this.engine.redo();
  }
  solve(): string | null {
    return this.engine.solve();
  }
  hint(): string | null {
    return this.engine.hint();
  }
  executeHint(hideAfter = false): string | null {
    return this.engine.executeHint(hideAfter);
  }
  hintReferenceMarks(count: number): HintReferenceMarks | null {
    const drawing = this.drawing;
    if (!drawing || !this.paletteReady) return null;
    // One task, so no frame without a reference's marks is ever shown: an
    // OffscreenCanvas presents what it holds when the worker yields.
    /** The board drawn with each reference's marks hidden in turn, and
     * with all of them. */
    const frames = () => {
      const shown = drawing.pixels();
      const hidden = Array.from({ length: count }, (_, i) => {
        this.engine.hideHintReference(i);
        // A full repaint: a game's cache need not be keyed on every mark it
        // draws, and a skipped frame would read as a reference with none.
        this.engine.forceRedraw(drawing);
        return drawing.pixels().data;
      });
      this.engine.hideHintReference(null);
      return { shown, hidden };
    };
    this.engine.redraw(drawing);
    const drawn = frames();
    // A mark in an ink is measured by its coverage, from the inks drawn in
    // white and in black: by its difference it measures faint on content of
    // its own color, and a translucent one, the stripes, heavier than it is
    // drawn. A mark in any other color is measured by its difference. The
    // game's cache is keyed on what it draws, not on the colors, so a full
    // repaint puts each ink on every mark, and the last one restores them.
    const inks = this.engine.hintInkIndices();
    const inInk = (color: string) => {
      drawing.overrideColors(inks, color);
      this.engine.forceRedraw(drawing);
      return frames();
    };
    const white = inInk("#fff");
    const black = inInk("#000");
    drawing.overrideColors(inks, null);
    this.engine.forceRedraw(drawing);
    const { width, height } = drawn.shown;
    const refs: ReferenceMarks[] = drawn.hidden.map((hidden, i) => {
      const alpha = markAlpha(drawn.shown.data, hidden);
      const ink = inkCoverage(
        { shown: white.shown.data, hidden: white.hidden[i] },
        { shown: black.shown.data, hidden: black.hidden[i] },
      );
      for (let p = 0; p < alpha.length; p++) if (ink[p] > 0) alpha[p] = ink[p];
      const marks = withoutSpecks(alpha, width);
      return { alpha: marks, box: markBox(marks, width) };
    });
    return transfer(
      { width, height, refs, roles: this.engine.hintReferenceRoles() },
      refs.map((r) => r.alpha.buffer),
    );
  }
  currentAnimationMs(): number {
    return this.engine.currentAnimationMs();
  }
  check(): CheckVerdict {
    return this.engine.check();
  }
  getReference(): ReferenceModel | null {
    return this.engine.getReference();
  }
  selectReference(key: string | null): void {
    this.engine.selectReference(key);
  }

  // --- input ------------------------------------------------------

  processKey(key: number): boolean {
    return this.engine.processInput(0, 0, key);
  }
  processMouse({ x, y }: Point, button: number): boolean {
    return this.engine.processInput(x, y, button);
  }
  cancelPress(): boolean {
    return this.engine.cancelPress();
  }
  tracksHover(): boolean {
    return this.engine.tracksHover;
  }
  processHover(point: Point | null): boolean {
    return this.engine.processHover(point);
  }
  requestKeys(): KeyLabel[] {
    return this.engine.requestKeys();
  }

  // --- params / presets -------------------------------------------

  getParams(): string {
    return this.engine.getParams();
  }
  setParams(params: string): string | null {
    return this.engine.setParams(params);
  }
  turnParams(params: string): string | null {
    return this.engine.turnParams(params);
  }
  getPresets(): PresetMenuEntry[] {
    return this.engine.getPresets();
  }

  getCustomParamsConfig(): ConfigDescription {
    return this.engine.getCustomParamsConfig();
  }
  getCustomParams(): ConfigValues {
    return this.engine.getCustomParams();
  }
  setCustomParams(values: ConfigValues): string | null {
    return this.engine.setCustomParams(values);
  }
  describeParams(params: string): string {
    return this.engine.describeParams(params);
  }
  encodeCustomParams(values: ConfigValues): CustomParamsEncoding {
    return this.engine.encodeCustomParams(values);
  }
  getPreferencesConfig(): ConfigDescription {
    return this.engine.getPreferencesConfig();
  }
  getPreferences(): ConfigValues {
    return this.engine.getPreferences();
  }
  setPreferences(values: ConfigValues): void {
    this.engine.setPreferences(values);
  }

  // --- rendering --------------------------------------------------

  getColorPalette(defaultBackground: Color): Color[] {
    return this.engine.getColorPalette(defaultBackground);
  }

  darkPalette(defaultBackground: Color): Record<number, Color> {
    return this.engine.darkPalette(defaultBackground);
  }
  size(maxSize: Size): Size {
    return this.engine.size(maxSize);
  }
  preferredSize(): Size {
    return this.engine.preferredSize();
  }
  formatAsText(): string | null {
    return this.engine.formatAsText();
  }

  // --- save / load ------------------------------------------------

  loadGame(data: Uint8Array): string | null {
    return this.engine.loadGame(data);
  }
  saveGame(): Uint8Array<ArrayBuffer> {
    const data = this.engine.saveGame();
    return transfer(data, [data.buffer]);
  }

  setTimerPaused(paused: boolean): void {
    // A hidden page gets no animation frames, so a loop that stayed armed for
    // an animation would hand the whole hidden interval to the first frame
    // after resuming, and the clock would count it.
    if (!paused) this.lastTimeMs = self.performance.now();
    this.engine.setTimerPaused(paused);
  }

  setReducedMotion(reduced: boolean): void {
    this.engine.setReducedMotion(reduced);
  }

  // --- drawing ----------------------------------------------------

  attachCanvas(canvas: OffscreenCanvas, fontInfo: FontInfo): void {
    this.drawing = new Drawing(canvas, fontInfo);
  }
  deleteDrawing(): void {
    this.drawing = undefined;
  }
  detachCanvas(): void {
    this.drawing?.resize(1, 1, 1);
  }
  resizeDrawing({ w, h }: Size, dpr: number): void {
    if (!this.drawing) throw new Error("resizeDrawing: no canvas attached");
    // `Drawing.resize` sets `canvas.width`/`height`, which under `{alpha:false}`
    // resets the backing store to opaque black, so every tile the game's
    // `redraw` has cached is gone. `canvasCleared` drops the drawstate, and the
    // next `redraw` lays the ground and lets the game paint from scratch.
    this.drawing.resize(w, h, dpr);
    this.engine.canvasCleared();
  }
  setDrawingPalette(colors: string[]): void {
    if (!this.drawing) throw new Error("setDrawingPalette: no canvas attached");
    const firstInstall = !this.paletteReady && colors.length > 0;
    if (colors.length > 0) this.paletteReady = true;
    // `setPalette` returns true only when an already-installed palette was
    // replaced (light/dark toggle), which leaves any game's per-tile cache keyed
    // against the old palette: repaint from a fresh drawstate, as upstream's
    // `webapp.cpp` did (`setDrawingPalette → forceRedraw()`).
    if (this.drawing.setPalette(colors)) {
      this.forceRedraw();
      return;
    }
    // **The first install must also repaint.** `redraw()` drops every repaint
    // requested before the palette arrives, and the midend requests one on the
    // *initial* game transition, a race the game usually loses when generation
    // is fast. Nothing else re-issues it, so a deep link to a non-default type
    // (`/loopy?type=5x4t9dh`) left the canvas blank until some unrelated event
    // forced a repaint.
    if (firstInstall) this.forceRedraw();
  }
  async getImage(options?: ImageEncodeOptions): Promise<Blob> {
    if (!this.drawing) throw new Error("getImage: no canvas attached");
    return this.drawing.getImage(options);
  }
  redraw(): void {
    if (this.drawing && this.paletteReady) this.engine.redraw(this.drawing);
  }

  /** A full repaint with the per-game drawstate dropped, for a palette's first
   * install or its replacement: a plain `engine.redraw` would honor a cache
   * keyed against the old palette, or one built before any palette. Not on
   * `PuzzleEngineSurface`: the app's own redraw path is `redraw()`. */
  private forceRedraw(): void {
    if (this.drawing && this.paletteReady) this.engine.forceRedraw(this.drawing);
  }

  // --- timer ------------------------------------------------------

  private onAnimationFrame = (timestampMs: number): void => {
    if (this.timerActive) {
      this.engine.timer((timestampMs - this.lastTimeMs) / 1000);
      this.lastTimeMs = timestampMs;
      self.requestAnimationFrame(this.onAnimationFrame);
    }
  };

  private activateTimer(): void {
    if (!this.timerActive) {
      this.timerActive = true;
      this.lastTimeMs = self.performance.now();
      this.notifyTimerStateRemote?.(true);
      self.requestAnimationFrame(this.onAnimationFrame);
    }
  }
  private deactivateTimer(): void {
    if (this.timerActive) {
      this.timerActive = false;
      this.notifyTimerStateRemote?.(false);
    }
  }

  delete(): void {
    this.engine.delete();
    this.deleteDrawing();
  }
}
