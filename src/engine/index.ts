/**
 * The engine's barrel: the `Game` interface every game implements, the `Midend`
 * that orchestrates it, the game registry, the save codec, and a few shared
 * helpers.
 *
 * See `openspec/specs/ts-engine/spec.md` for the capability contract, and the
 * `engine-*` specs beside it for each subject.
 */

export { mkhighlight, mkhighlightBackground } from "./color/color-mkhighlight.ts";
export { parseLeadingInt } from "./decimal.ts";
export { type BevelBounds, drawRecessedBorder, drawRectOutline } from "./draw.ts";
export { Dsf } from "./dsf.ts";
export type {
  ActiveHint,
  Game,
  GameDrawing,
  HintResult,
  HintStep,
  HintTrackVerdict,
  ParamConfigItem,
  PresetMenu,
  SolveResult,
  UiUpdate,
} from "./game.ts";
export { UI_UPDATE } from "./game.ts";
export { coord, fromCoord } from "./geometry.ts";
export {
  type EngineCore,
  Midend,
  type NotifyChange,
  type NotifyTimerState,
} from "./midend.ts";
export { dimensionParamConfig, parseConfigInt } from "./params.ts";
export {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  cursorDelta,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "./pointer.ts";
export {
  _resetRegistry,
  createTsEngine,
  hasTsGame,
  registerGame,
} from "./registry.ts";
export {
  decodeSave,
  encodeSave,
  type SaveEnvelope,
} from "./save.ts";
