# Ledger: map

Base: bb004490

Where every rule of Map's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Map game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `map` game implements `Game`, coloring regions so no two adjacent ones match, with immutable clues | spec: Map game implements the Game interface |
| The game is `Game<MapParams, MapState, MapMove, MapUi, MapDrawState, MapMistake>`, six type arguments | untrue: `mapGame` in `src/games/map/index.ts` is typed with eight, the last two `MapHint` and `MapRung`, so the rule names `Game` alone |
| Params are `w`, `h`, `n` and `diff`, encoded `{w}x{h}n{n}` with a full-form `d{char}` suffix over `e`/`n`/`h`/`u` | spec: Map's parameters |
| `decodeParams` is lenient about a missing height, a missing region count, a `.` in the count and an unknown difficulty char | spec: Map decodes params leniently |
| Eight presets, two sizes at every difficulty | spec: Map's presets |
| The presets are upstream's landscape sizes turned to draw taller than wide | history |
| `validateParams` enforces `n ≤ w*h` and the width×height overflow guard | spec: Map refuses params that describe no map |
| `validateParams` enforces `w ≥ 2`, `h ≥ 2` and `n ≥ 5` | untrue: `validateParams` in `src/games/map/state.ts` tests none of the three, they are the `bounds` of the `paramConfig` items in `src/games/map/index.ts`, and the engine refuses a value below a bound before it asks the game |
| The game provides `solve` and drives a completion flash suppressed after Solve | spec: Map game implements the Game interface |
| The game provides `textFormat` | untrue: `mapGame` in `src/games/map/index.ts` has no `textFormat`, and nothing under `src/games/map/` defines one |
| Scenario: params round-trip | spec: Map's parameters |
| Scenario: lenient decode | spec: Map decodes params leniently |
| Scenario: invalid params are rejected | spec: Map refuses params that describe no map |
| Scenario: `validateParams` is what returns the error for fewer than five regions | untrue: the engine's check of the `paramConfig` bound returns it, so the scenario says the params are validated without naming the hook |

## Map descriptions use the upstream two-part encoding

| Rule | Where it went |
| --- | --- |
| Two comma-separated run-length parts, and the edge list's order, letters, `z` of 25 with no switch and leading non-edge | spec: Map descriptions use the upstream two-part encoding |
| The clue list of digits `0`–`3` and run letters, with `z` a run of 26 | spec: Map's clue list runs over the regions |
| The regions are rebuilt by a union-find over non-edges, and an unknown character, a wrong region count and a clue list not of `n` regions are rejected | spec: A malformed Map description is refused |
| It is the game's `validateDesc` that rebuilds and rejects | untrue: `mapGame` in `src/games/map/index.ts` has no `validateDesc`, the rejections are thrown by `parseDesc` in `src/games/map/map-data.ts` under `newState`, and the engine's `validateDesc` in `src/engine/desc-error.ts` reports what reading the board threw, so the rule is put on reading a desc |
| `newState` parses the immutable structure, runs the desc-seeded smoothing pass and computes the label points | spec: newState builds the immutable map |
| Scenario: a description round-trips | spec: Map descriptions use the upstream two-part encoding |
| Scenario: a malformed description is rejected | spec: A malformed Map description is refused |

## Map reports completion and mistakes

| Rule | Where it went |
| --- | --- |
| Complete when every region is colored and no adjacent two match | spec: Map reports completion and mistakes |
| `findMistakes` re-solves from the clues and returns every region colored against the unique solution, and none on a board that is not uniquely solvable | spec: Map reports completion and mistakes |
| A blank region whose dots leave out its color is a mistake, with its reason, and a blank region with no dots never is | spec: Dots that leave out a region's color are a mistake |
| Check & Save depends on the hook and refuses to save while a mistake is present | spec: Check & Save refuses a Map board with a mistake |
| The red adjacency error markers stay, independent of `findMistakes` | spec: Map's adjacency error markers are always on |
| Scenario: a region colored against the unique solution is flagged | spec: Map reports completion and mistakes |
| Scenario: a partially-colored but correct board has no mistakes | spec: Map reports completion and mistakes |
| Scenario: dots that leave out a region's color are flagged, and a hint is refused | spec: Dots that leave out a region's color are a mistake |

## Map input, preferences and rendering

| Rule | Where it went |
| --- | --- |
| A press picks up a color or a blank region's marks into a drag blob, a release drops it, and a drop that changes nothing is no move | spec: A drag carries a color or its marks |
| A right-drag from a color to a blank region toggles one pencil bit, and penciling a colored region is rejected | spec: A right-drag pencils one color |
| A keyboard cursor picks and drops by the select keys | spec: The keyboard cursor picks and drops |
| The quadrant hit-test of a diagonally-split cell | spec: A drag carries a color or its marks; spec: The keyboard cursor picks and drops |
| The hit-test is upstream's `region_from_coords` | history |
| The three preferences go through `prefs`, live on the `Ui` with `newUi` defaults, and `l`/`L` toggles region numbers | spec: Map's preferences |
| The preferences keep the upstream keyword slugs | spec: Map's preferences |
| What `redraw` renders, from fills to the completion-flash style | spec: What Map draws |
| A `BORDER` of 0 | untrue: `computeSize` in `src/games/map/render.ts` grows the canvas by `pencilIndicatorCanvas` and `origin` starts the board at `pencilIndicatorReach(ts)`, so the board has no border of its own and the canvas has the indicator's room on every side; spec: Map's board has no border of its own |
| The border is upstream's NARROW_BORDERS | history |
| Scenario: a drag colors a region | spec: A drag carries a color or its marks |
| Scenario: a no-op drop yields no move | spec: A drag carries a color or its marks |

## Map ports the graded solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The four tiers of the solver's power over the adjacency graph | spec: Map's solver is graded by tier |
| The solver is a port of `map_solver` and the generator of `new_game_desc` | history |
| The three-valued verdict, and a grading routine returning the easiest tier that solves uniquely | spec: The solver returns a three-valued verdict |
| The generator grows voronoi regions, four-colors them, reduces clues without removing a color's last region, and retries below a floor | spec: Map's generator is gated on the solver |
| `solve` returns the generator's aux when present, else re-solves from the clues at maximum difficulty | spec: Solve uses the generator's answer when it has one |
| Scenario: generated boards are uniquely solvable at exactly their difficulty | spec: Map's generator is gated on the solver |
| Scenario: or at the generator's documented fallback for pathologically dense or sparse maps | untrue: `newMapDesc` in `src/games/map/generator.ts` has no fallback, it retries until a board is unique at the tier and not below it, and `retryLimit` throws when the budget is spent, so the scenario says exactly the requested difficulty and the body gains no rule |

## Map offers one key per color, and a tap selects a region

| Rule | Where it went |
| --- | --- |
| A key for each color and Clear, coloring or marking at the cursor, acting only while the cursor is shown, with the reason | spec: Map offers one key per color, and a tap selects a region |
| A decline is also what lets the app's bare-letter shortcuts through | reason |
| A gesture that commits no move selects the region it ended on, because a player without a keyboard cannot otherwise move the cursor | spec: A gesture that commits no move selects its region |
| Without it the panel is unreachable, and selection is additive because a tap already picks a color up and puts it back | reason |
| A drag ending on a clue or where it started selects by the same rule, not a second one | spec: A gesture that commits no move selects its region |
| The highlight and notes mode follow the note-taking cell's rule with the gesture's button, a color where not a clue and a mark where blank | spec: A Map selection follows the note-taking cell's rule |
| Selection names the region, the cursor is a cell plus a direction, and the direction comes from the hit-test's own quadrant test | spec: Selection names the region, not its cell |
| The selection is a band inside the region's boundary in the cursor color in both modes, the corner triangle in notes mode, and the fill does not change | spec: The selected region is drawn as a band |
| A color carried by the keyboard sits at the centroid of the cursor's triangle on a divided cell, and is nudged a pixel on a whole one | spec: A color carried by the keyboard sits in the triangle the cursor names |
| The one-pixel nudge is upstream's | history |
| Dragging and the keyboard's pick-and-drop keep working, and the panel replaces neither | spec: Dragging and select work beside the color keys |
| Scenario: a region is colored without dragging | spec: Map offers one key per color, and a tap selects a region |
| Scenario: the same key marks while notes mode is on | spec: Map offers one key per color, and a tap selects a region |
| Scenario: a clue refuses a color key | spec: Map offers one key per color, and a tap selects a region |
| Scenario: a tap on a split cell selects the region under the finger | spec: Selection names the region, not its cell |
| Scenario: the selected region is outlined, not recolored | spec: The selected region is drawn as a band |

## Map explains the next deduction

| Rule | Where it went |
| --- | --- |
| The midend refuses on a solved board or a mistake, `hint` refuses with `DEDUCTION_EXHAUSTED`, and otherwise returns an ordered plan | spec: Map explains the next deduction |
| A blank region's colors are its dots or all four, less its neighbors' colors, why that is sound, and where the plan places dots | spec: A blank region's colors are read from its dots |
| The three rungs, reported by the functions the solver runs | spec: The hint's deductions are the solver's three rungs |
| The lowest rung that fires, chosen within by the latest steps, so an Easy plan shows no pair and a Normal one no chain | spec: The plan offers the lowest rung that fires |
| A narrowing step colors, removes struck dots or dots what is left, its sentence says which, and one firing is one journey | spec: A narrowing step says what it does |
| A pair or chain opens with a leg for each premise region not showing its two colors | spec: A pair or chain first dots its premise |
| The chain step tells the pattern or walks by color up to five regions, and past that names the rule and the end | spec: The chain step names what the dots show |
| The chain step concludes on region 1 or the last, and the plan fails before speaking a walk that ends elsewhere | spec: The chain step ends on the struck color |
| The ring is a solid band in the action color and the only hint mark on a boundary, and a single outlines nothing else | spec: A hint step rings the region it acts on |
| Premise regions take a dashed line set in from the boundary, a chain is numbered with region numbers hidden, and the selection band stays visible | spec: A premise's regions are outlined apart from the ring |
| The generator does not call the hint, and splitting the rungs changes no verdict | spec: The generator does not call the hint |
| Scenario: a region whose neighbors show three colors takes the fourth | spec: The hint's deductions are the solver's three rungs |
| Scenario: a pair's undotted region is dotted before the pair is stated | spec: A pair or chain first dots its premise |
| Scenario: that first step outlines the pair's other region | untrue: `pairDot` in `src/games/map/hint-text.ts` marks only the ringed region, and the hint's own test holds a leg writing a pair's premise to outlining nothing, so the scenario says it outlines nothing |
| Scenario: a chain's conclusion is dotted onto an unmarked region | spec: A pair or chain first dots its premise |
| Scenario: a chain whose regions all carry the struck color is told as a pattern | spec: The chain step names what the dots show |
| Scenario: the hint's dots are the next step's premise | spec: A blank region's colors are read from its dots |

## Map offers Mark-all and the player's reading of an undotted region

| Rule | Where it went |
| --- | --- |
| `canMarkAll`, and the `M` key's adaptive press: fill, then clean keeping a last dot, then no move | spec: Map's Mark-all press is adaptive |
| The `hint-notes` preference through `candidateReading`, defaulting to `implicit` with its reason in `newUi`, and the implicit plan | spec: Map offers the player's reading of an undotted region |
| Under `populate` the plan opens with the press as one journey, then plans by the same rungs, and a move equal to a setup step's completes it | spec: The populate reading opens with the Mark-all press |
| Scenario: two presses dot each region with what its neighbors leave | spec: Map's Mark-all press is adaptive |
| Scenario: the press never refills a region the player narrowed | spec: Map's Mark-all press is adaptive |
| Scenario: the populate reading opens with the press | spec: The populate reading opens with the Mark-all press |
| Scenario: the implicit reading never fills | spec: Map offers the player's reading of an undotted region |

## Map draws an uncolored region on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| An uncolored region, the "no color" drag blob and a region blanked by the flash take the cell surface, and the four fills and ink borders stay | spec: Map draws an uncolored region on the collection's quiet surface |
| Scenario: an uncolored region is the cell surface | spec: Map draws an uncolored region on the collection's quiet surface |
