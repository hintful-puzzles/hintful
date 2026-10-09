# Ledger: lightup

Base: bb004490

Where every rule of Light Up's spec went in the reference form.

## Light Up game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `lightup` game implements `Game`, and what solves a board | spec: Light Up game implements the Game interface |
| It provides `solve` and `textFormat` and drives a solve-completion flash | spec: Light Up game implements the Game interface |
| The five params, the symmetry and difficulty values, and the full and short encodings | spec: Light Up's parameters |
| All upstream presets are offered | spec: Light Up's presets |
| There are 9 of them, and they are upstream's | figure; history |
| The two lenient decodes, kept as upstream's quirks | spec: Light Up decodes params leniently; history |
| The demotion is of a bare `WxH` id | untrue: `decodeParams` in `src/games/lightup/state.ts` demotes whenever the string has no `s` field, whatever else it carries, so `18x10b20` demotes too |
| `validateParams` enforces a minimum size of 2×2 and known symmetry and difficulty values | untrue: the engine's `paramsError` in `src/engine/params.ts` refuses these from `paramConfig` (the dimension `bounds` and the two choice lists) before `validateParams` in `src/games/lightup/state.ts` runs, which checks neither |
| `validateParams` enforces a blackpc of 5 to 100 | spec: Light Up's params are validated |
| 4-way symmetry only on square grids of at least 3×3 | untrue: `validateParams` in `src/games/lightup/state.ts` requires a square grid of 4-way rotational only, allows 4-way mirror on any rectangle, and refuses either 4-way symmetry only when width and height are both below 3 |
| Scenario: params round-trip | spec: Light Up's parameters |
| Scenario: lenient decode quirks | spec: Light Up decodes params leniently |
| Scenario: invalid params are rejected, with 4-way symmetry narrowed to rotational | spec: Light Up's params are validated |

## Light Up descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The row-major encoding, what `validateDesc` rejects, and what `newState` parses | spec: Light Up descriptions use the upstream run-length encoding |
| Scenario: a description round-trips | spec: Light Up descriptions use the upstream run-length encoding |
| Scenario: a malformed description is rejected | spec: Light Up descriptions use the upstream run-length encoding |

## Light Up accepts pointer and cursor input

| Rule | Where it went |
| --- | --- |
| `interpretMove` reproduces upstream input | history |
| Left-click and right-click toggles, no-ops on walls and outside the grid, and the two rejections with no history entry | spec: Light Up accepts pointer and cursor input |
| Placing a bulb clears a mark and placing a mark removes a bulb, in `executeMove`, which recomputes lit counts | spec: A bulb and a mark exclude each other |
| Arrow keys, select or Enter, select2 or `i`, the same rejections, and completion hiding the cursor | spec: Light Up's keyboard cursor |
| The board is solved exactly while the grid is correct | spec: Light Up is solved exactly while the grid is correct |
| Scenario: left-click places and toggles a bulb | spec: Light Up accepts pointer and cursor input |
| Scenario: marks block bulbs | spec: Light Up accepts pointer and cursor input |
| Scenario: completion is detected | spec: Light Up is solved exactly while the grid is correct |

## Light Up ships findMistakes

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves, flags wrong bulbs and marks on solution bulbs, and yields `[]` without a unique solution | spec: Light Up ships findMistakes |
| A flagged square renders with a distinct overlay that repaints on the frame it is computed | spec: Light Up ships findMistakes |
| The overlay reaches the diff key through a sidecar | untrue: `redraw` in `src/games/lightup/render.ts` sets `DF_WRONG` as a bit of the packed word that is the cache entry, and there is no sidecar |
| Scenario: Check & Save flags a wrong bulb | spec: Light Up ships findMistakes |
| Scenario: a merely-unhelpful mark is not flagged | spec: Light Up ships findMistakes |

## Light Up ships an explained deductive hint

| Rule | Where it went |
| --- | --- |
| `hint()` returns a plan of narrated steps from the solver's techniques at the player's position, honoring bulbs and marks | spec: Light Up ships an explained deductive hint |
| No displayed step is a generic, un-narrated fallback | spec: Light Up ships an explained deductive hint |
| A hint is refused on a solved board and on one with mistakes, coupled to the overlay and the banner | spec: A Light Up hint is refused on a solved board and on a wrong one |
| The game's `hint()` makes those two refusals | untrue: `hint` in `src/games/lightup/index.ts` refuses only when deduction is exhausted, and the midend in `src/engine/midend.ts` returns `ALREADY_SOLVED` or `FIX_MISTAKES_FIRST` before calling it |
| Each step names its technique, leads with the indication, says why, concludes in the necessity voice, and one firing is one step | spec: A Light Up hint step names its technique and says why |
| The bar is called Palisade's | history |
| The four techniques narrated at minimum | spec: Light Up narrates each of its deductive techniques |
| A step that rules squares out emits the impossible-mark move | spec: A hint step that rules a square out places the impossible-mark |
| `hintKeepTrack` classifies partial completion as on-track and shrinks the step in place | spec: A partly followed hint step shrinks in place |
| A discount narration describes its set as the deduction counts it, the unlit square itself included, says whether it means the dark square or the other outlined squares, and states its premise | spec: A discount narration describes the set as the deduction counts it |
| Why a narration naming only the other outlined squares is false | reason |
| Scenario: a forced bulb is explained | spec: A Light Up hint step names its technique and says why |
| Scenario: a satisfied clue groups its marks | spec: A Light Up hint step names its technique and says why |
| Scenario: a discounted square's narration counts every candidate | spec: A discount narration describes the set as the deduction counts it |
| Scenario: refusal on a wrong board | spec: A Light Up hint is refused on a solved board and on a wrong one |
| Scenario: the plan completes deductive boards | spec: Light Up ships an explained deductive hint |

## Light Up hint rendering follows the element-type legend

| Rule | Where it went |
| --- | --- |
| The hint highlights and does not perform, with targets ringed `COL_HINT` and no preview | spec: Light Up hint rendering follows the element-type legend |
| Evidence shaded or ringed by what it is, the dark square's ring and the clue's ring | spec: Light Up draws a hint's evidence by what it is |
| Every hint bit is in the tile cache's diff key | spec: Light Up's tile cache keys on one packed word |
| Scenario: evidence is visible as an area | spec: Light Up hint rendering follows the element-type legend; spec: Light Up draws a hint's evidence by what it is |
| In that scenario, each unlit square of the corridor renders `COL_HINT_CELL` | untrue: `buildHighlights` in `src/games/lightup/index.ts` leaves the target and the dark square out of a forced-light step's `area`, so `redraw` in `src/games/lightup/render.ts` rings them and shades only the rest |
| Scenario: a hint step's marks stay inside its evidence | spec: Light Up draws a hint's evidence by what it is |

## No non-Unreasonable Light Up tier requires guessing

| Rule | Where it went |
| --- | --- |
| Every tier not named `Unreasonable` generates only boards the narrated techniques solve with no recursion | spec: No non-Unreasonable Light Up tier requires guessing |
| The recursion tier is offered as `Unreasonable` | spec: No non-Unreasonable Light Up tier requires guessing |
| It is upstream's Hard, renamed by a change that left generation untouched | history |
| On an `Unreasonable` board the hint may narrate the deductive prefix and then refuse, stated as what the code does in place of a permission | spec: On an Unreasonable board the hint stops at the guess point |
| Scenario: deductive tiers are hint-complete | spec: No non-Unreasonable Light Up tier requires guessing |
| Scenario: the guess tier is honestly named | spec: No non-Unreasonable Light Up tier requires guessing |

## Light Up grades boards with a tiered deductive solver

| Rule | Where it went |
| --- | --- |
| Easy applies forced-light and the two clue deductions | spec: Light Up grades boards with a tiered deductive solver |
| Normal adds the discount over sets from unlit squares and clue combinations, with the minimum-rule-out choice and the restart | spec: Normal adds the overlapping-set discount |
| The names MAKESLIGHT and MAKESDARK, and that the heuristic and `Combi` are upstream's | history |
| Unreasonable adds recursion on the most-illuminating square, capped at depth 5, with the unique-solution bookkeeping | spec: Unreasonable adds depth-capped recursion |
| The solver tracks the clues it used, and serves `solve()` and `findMistakes` | spec: The solver records the clues it used and serves solve and findMistakes |
| Scenario: generated boards solve at exactly their difficulty | spec: Light Up grades boards with a tiered deductive solver |
| Scenario: solve recovers a solution from a dirty board | spec: The solver records the clues it used and serves solve and findMistakes |

## Light Up generates solver-gated boards

| Rule | Where it went |
| --- | --- |
| Symmetric walls with the center draw, the light placement, numbering and the solver gate | spec: Light Up generates solver-gated boards |
| Stripping unused numbers, removing the rest in the one-shot shuffled order, and rejecting a board solvable a difficulty lower | spec: The generator strips clues while the puzzle stays good |
| After 20 failed grids `blackpc` goes up by 5 | spec: The generator adds walls when no board turns up |
| The ramp goes to at most 90 | untrue: `newLightupDesc` in `src/games/lightup/generator.ts` adds 5 while `blackpc` is below 90, so a start that is not a multiple of 5 passes 90, and then resets to the percentage asked for |
| Generation from a seed is reproducible | spec: Light Up generates solver-gated boards |
| Scenario: generation is reproducible from a seed | spec: Light Up generates solver-gated boards |

## Light Up renders with live error feedback

| Rule | Where it went |
| --- | --- |
| A provably wrong clue sits on a disc in the error color, and what provably wrong means | spec: Light Up renders with live error feedback |
| A bulb lit by another bulb is error-colored | spec: Light Up renders with live error feedback |
| Walls show their clue, lit squares are filled yellow, and bulbs are circles | spec: Light Up draws walls, bulbs and light on the collection's quiet surface; spec: A clue and a bulb are one white in both schemes |
| The impossible-mark is the ruled-out cross, suppressed on lit squares when `show-lit-blobs`, default on through `Game.prefs`, is off | spec: The impossible-mark is the ruled-out cross |
| The keyboard cursor and the 3-phase completion flash | spec: Light Up's cursor and completion flash |
| The packed flags are the cache key, an `Int32Array` | spec: Light Up's tile cache keys on one packed word |
| An overlay not in the packed value, the `findMistakes` highlight, is in a sidecar | untrue: `redraw` in `src/games/lightup/render.ts` ORs `DF_WRONG`, `DF_BLOBS_PREF` and the hint bits into the packed word, and `LightupDrawState` holds no sidecar |
| Scenario: overlapping bulbs render as errors | spec: Light Up renders with live error feedback |
| Scenario: a provably-wrong clue turns red, merged into the dark-scheme scenario of the same case | spec: Light Up renders with live error feedback |
| Scenario: lit blobs honor the preference | spec: The impossible-mark is the ruled-out cross |

## Light Up draws walls, bulbs and light on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| The unlit surface, the grid line, the frame, the lit wash and the solid wall | spec: Light Up draws walls, bulbs and light on the collection's quiet surface |
| The clue's white and the bulb's white disc with its black outline, the same in both schemes | spec: A clue and a bulb are one white in both schemes |
| The mark is the collection's ruled-out cross | spec: The impossible-mark is the ruled-out cross |
| The clue a hint reasons from keeps its digit and is ringed in the evidence color with a white line inside | spec: Light Up draws a hint's evidence by what it is |
| The help page and the Custom dialog say wall, never black square | spec: Light Up's words call the square a wall |
| A wrong clue's disc and digit, and an overlapping bulb's disc, in the full error color | spec: Light Up renders with live error feedback |
| The cursor is corner brackets clear of a bulb, and the flash blinks lit squares to the lifted surface | spec: Light Up's cursor and completion flash |
| Scenario: an unlit square is surface and a lit one is washed | spec: Light Up draws walls, bulbs and light on the collection's quiet surface |
| Scenario: a wrong clue reads on its wall in the dark scheme | spec: Light Up renders with live error feedback |
