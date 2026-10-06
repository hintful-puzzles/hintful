/**
 * The Comlink surface a worker-side puzzle presents to the app.
 *
 * `TsWorkerPuzzle` is its only implementer, and it is a hand-stated interface
 * anyway: the app types the worker as `Remote<PuzzleEngineSurface>`, and
 * `Remote<TsWorkerPuzzle>` would drag the concrete class's whole surface across
 * the worker boundary, so every internal method would read as part of the
 * contract.
 */

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

export interface PuzzleEngineSurface {
  readonly puzzleId: string;

  setCallbacks(
    notifyChange: (message: ChangeNotification) => void,
    notifyTimerState: (isActive: boolean) => void,
  ): void;
  getStaticProperties(): PuzzleStaticAttributes;

  /** `fitTo` is the board area and `kept` a board dealt ahead; see
   * `EngineCore.newGame`. */
  newGame(fitTo?: Size, kept?: DealtBoard | null): string | null;
  /** See `EngineCore.dealParams`. */
  dealParams(fitTo?: Size): EncodedParams;
  /** See `EngineCore.dealFoundNone`. */
  dealFoundNone(fitTo?: Size): string;
  /** See `EngineCore.returnToBoardType`. */
  returnToBoardType(): void;
  newGameFromId(id: string): string | null;
  restartGame(): void;
  undo(): void;
  redo(): void;
  solve(): string | null;
  hint(): string | null;
  /** Apply one step of the stored plan in slow motion. `hideAfter` (the
   * Hint-button stepper) hides the plan once the step settles instead of
   * previewing the next step; auto-play leaves it false. */
  executeHint(hideAfter?: boolean): string | null;
  /** Milliseconds of the animation currently armed (e.g. the slow-motion
   * move `executeHint` just played), or 0 when nothing is animating. The
   * auto-hint loop paces each step by this. */
  currentAnimationMs(): number;
  /** Check the board as Check & save does (`EngineCore.check`), displaying
   * what the check finds. */
  check(): CheckVerdict;

  /** The active game's reference-aid model (inventory checklist with found
   * status), or null when the game has no reference aid. */
  getReference(): ReferenceModel | null;
  /** Spotlight a reference item on the board (or clear it with null). A
   * `UI_UPDATE`-shaped change: repaints but adds no move/history/save. No-op
   * for a game without a reference aid. */
  selectReference(key: string | null): void;

  processKey(key: number): boolean;
  processMouse(point: Point, button: number): boolean;
  /** Whether the running game tracks the pointer between presses
   * (`Game.hover`). Asked once per game so the app can send no hovers at
   * all for a game that has none. A method rather than a property because
   * this surface crosses Comlink, where a getter would not survive. */
  tracksHover(): boolean;
  /** Pointer moved over the board with no button down, or left it
   * (`null`). Repaints at most; never a move, never history. */
  processHover(point: Point | null): boolean;
  requestKeys(): KeyLabel[];

  getParams(): string;
  setParams(params: string): string | null;
  turnParams(params: string): string | null;
  /** The label of an encoded params set; throws when it does not decode. */
  describeParams(params: string): string;
  getPresets(): PresetMenuEntry[];

  getCustomParamsConfig(): ConfigDescription;
  getCustomParams(): ConfigValues;
  setCustomParams(values: ConfigValues): string | null;
  encodeCustomParams(values: ConfigValues): CustomParamsEncoding;

  getPreferencesConfig(): ConfigDescription;
  getPreferences(): ConfigValues;
  setPreferences(values: ConfigValues): void;
  // No binary preferences form (upstream's `midend_serialize_prefs`): the app
  // persists `ConfigValues` per puzzle through get/setPreferences. A preferences
  // import/export feature should choose its own wire format, not inherit the C's.

  redraw(): void;
  getColorPalette(defaultBackground: Color): Color[];
  /**
   * The authored dark-mode value of each palette index whose token states one.
   * Empty when the palette states nothing of its own.
   */
  darkPalette(defaultBackground: Color): Record<number, Color>;
  size(maxSize: Size): Size;
  preferredSize(): Size;
  formatAsText(): string | null;

  loadGame(data: Uint8Array<ArrayBuffer>): string | null;
  saveGame(): Uint8Array<ArrayBuffer>;
  /** Hold the solve timer while the page is hidden; see `EngineCore`. */
  setTimerPaused(paused: boolean): void;

  attachCanvas(canvas: OffscreenCanvas, fontInfo: FontInfo): void;
  deleteDrawing(): void;
  detachCanvas(): void;
  resizeDrawing(size: Size, dpr: number): void;
  setDrawingPalette(colors: string[]): void;
  getImage(options?: ImageEncodeOptions): Promise<Blob>;

  delete(): void;
}
