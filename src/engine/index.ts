/**
 * The engine's barrel: the `Game` interface every game implements, the `Midend`
 * that orchestrates it, the game registry, and a few shared helpers.
 *
 * See `openspec/specs/ts-engine/spec.md` for the capability contract, and the
 * `engine-*` specs beside it for each subject.
 */

export { drawRectOutline } from "./draw.ts";
export type {
  Game,
  GameDrawing,
  HintStep,
  HintTrackVerdict,
  ParamConfigItem,
  SolveResult,
  UiUpdate,
} from "./game.ts";
export { UI_UPDATE } from "./game.ts";
export { fromCoord } from "./geometry.ts";
export { Midend } from "./midend.ts";
export { dimensionParamConfig } from "./params.ts";
export { createTsEngine, registerGame } from "./registry.ts";
