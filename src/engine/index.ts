/**
 * The engine's barrel: the `Game` interface every game implements, the `Midend`
 * that orchestrates it, the game registry, and a few shared helpers.
 *
 * See `openspec/specs/ts-engine/spec.md` for the capability contract, and the
 * `engine-*` specs beside it for each subject.
 */

export { fromCoord } from "./board/geometry.ts";
export type {
  Game,
  GameDrawing,
  HintStep,
  HintTrackVerdict,
  ParamConfigItem,
  SolveResult,
  UiUpdate,
} from "./contract/game.ts";
export { UI_UPDATE } from "./contract/game.ts";
export { dimensionParamConfig } from "./game-id/params.ts";
export { Midend } from "./midend/midend.ts";
export { createTsEngine, registerGame } from "./midend/registry.ts";
export { drawRectOutline } from "./render/draw.ts";
