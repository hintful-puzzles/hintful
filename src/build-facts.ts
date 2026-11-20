/**
 * What the build reads from the game collection: the help pages' generated
 * sections and the home screen's draft labels. The build loads this one
 * module through `vite-plugins/game-code.ts` when it renders, never when its
 * configuration loads, so the games and the registry they fill are one
 * evaluation, and an edit to any of them is a hot reload in dev.
 */

import "./games/index.ts";

export { MARK_ALL_HELP, MARK_ALL_PLACEHOLDER } from "./engine/candidate-hint.ts";
export { hasHint } from "./engine/contract/game.ts";
export {
  HINT_MARKS_PLACEHOLDER,
  legendMarkdown,
} from "./engine/contract/hint-words.ts";
export { draftSections, notApplicableMarkdown } from "./engine/contract/sections.ts";
export {
  MODIFIERS_PLACEHOLDER,
  modifiersMarkdown,
  modifiersOf,
} from "./engine/game-id/modifier.ts";
export {
  expandChoices,
  PARAMETERS_PLACEHOLDER,
  parametersMarkdown,
} from "./engine/game-id/param-help.ts";
export {
  RULESETS_PLACEHOLDER,
  rulesetField,
  rulesetsMarkdown,
} from "./engine/game-id/ruleset.ts";
export {
  CONTROLS_PLACEHOLDER,
  controlsMarkdown,
  DONE_CLUES_PLACEHOLDER,
  doneCluesMarkdown,
} from "./engine/input/target-verb.ts";
export { TOUCH_PLACEHOLDER, touchHelp } from "./engine/input/touch-help.ts";
export {
  offersStickyPencil,
  STICKY_PENCIL_HELP,
  STICKY_PENCIL_PLACEHOLDER,
} from "./engine/pencil-prefs.ts";
export { expandPair } from "./engine/piece.ts";
export { getTsGame, registeredGameIds } from "./engine/registry.ts";
export { RULES_OUT_PLACEHOLDER, rulesOutHelp } from "./engine/rules-out.ts";
export { WING_PLACEHOLDER, wingHelp } from "./engine/wing.ts";
