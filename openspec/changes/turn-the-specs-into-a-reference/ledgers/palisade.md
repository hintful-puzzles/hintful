# Ledger: palisade

Base: bb004490

Where every rule of Palisade's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Palisade game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `palisade` game implements `Game`, a region-division puzzle of walls counted by clues and regions of `k` cells | spec: Palisade game implements the Game interface |
| The six type arguments of `Game` by name | untrue: `palisadeGame` in `src/games/palisade/index.ts` takes eight, adding `PalisadeHint` and `PalisadeRung`, and the spec now says only `Game` |
| "Nikoli's Five Cells" | history |
| Params are `w`, `h` and `k`, encoded `{w}x{h}n{k}`, with four presets and a type summary from the `width`, `height` and `region-size` config keys | spec: Palisade's parameters are a size and a region size |
| The presets are upstream's sizes turned to draw taller than wide | history |
| `validateParams` requires `k`, `w` and `h` of at least 1 | untrue: `validateParams` in `src/games/palisade/state.ts` checks none of them, and the `bounds: { min: 1 }` its `paramConfig` declares are what the engine's `paramsError` refuses on, now spec: Palisade refuses a region size the grid cannot be divided by |
| `validateParams` requires `k` to divide the area | spec: Palisade refuses a region size the grid cannot be divided by |
| `validateParams` requires `k` below the area at every validation | untrue: `validateParams` returns null before that check when `full` is false, so `k` equal to the area is refused only under full validation, as `k = 2` is |
| Full validation rejects `k = 2` unless `w` or `h` is 1 | spec: Palisade refuses a region size the grid cannot be divided by |
| The game provides `statusbarText`, `solve` and `textFormat` | spec: Palisade game implements the Game interface |
| Scenario: params round-trip, and a bare `5` decodes square | spec: Palisade's parameters are a size and a region size |
| "Upstream lenience" | history |
| Scenario: invalid params are rejected | spec: Palisade refuses a region size the grid cannot be divided by |

## Palisade descriptions are run-length clue grids

| Rule | Where it went |
| --- | --- |
| The desc is the clue grid in scan order, a digit for a clue and a letter for a run of clueless cells | spec: Palisade descriptions are run-length clue grids |
| "Exactly as upstream" | history |
| A digit above 4, a non-clue character and a desc of too many squares are rejected | spec: Palisade descriptions are run-length clue grids |
| `newState` parses the clue board shared by reference, with the rim walls set and interior edges unknown | spec: A new Palisade board holds its clues and only the rim walls |
| Scenario: a description round-trips | spec: Palisade descriptions are run-length clue grids |
| Scenario: a malformed description is rejected | spec: Palisade descriptions are run-length clue grids |

## Palisade generates uniquely solvable boards

| Rule | Where it went |
| --- | --- |
| `newDesc` divides the rectangle, derives clues and walls, regenerates until solvable, then strips clues while the solver still solves, and emits the run-length desc | spec: Palisade generates uniquely solvable boards |
| The aux is the solution border set | untrue: `newDesc` in `src/games/palisade/solver.ts` returns `{ desc }` alone and no aux, and `solve` and `hint` re-solve from the clues |
| Scenario: generated boards are solvable | spec: Palisade generates uniquely solvable boards |
| "The 4 presets" in the scenario | figure |

## Palisade edges are three-valued and shared between cells

| Rule | Where it went |
| --- | --- |
| An edge is wall, no-wall mark or unknown, a byte per cell, recorded on both cells, and every emitted edit is two-sided | spec: Palisade edges are three-valued and shared between cells |
| "The upstream borderflag byte" | history |
| A left-click toggles wall and unknown, a right-click no-wall mark and unknown, and the half-grid keyboard cursor does the same | spec: Each button toggles the nearest edge toward its own state |
| `executeMove` rejects an edit toggling a wall that points off the grid | spec: The grid rim cannot be edited |
| Scenario: a wall toggle records both sides | spec: Palisade edges are three-valued and shared between cells |
| Scenario: the grid rim cannot be toggled | spec: The grid rim cannot be edited |

## Palisade detects completion and the unique-division solve

| Rule | Where it went |
| --- | --- |
| `isSolved` holds iff every component is of size `k`, every clue matches and no wall is stray, and `status` reports a win exactly then | spec: Palisade detects completion and the unique-division solve |
| `solve` runs the solver from the bare rim and emits the solution borders as a `solve` move, and the engine records its use | spec: The Solve command fills in the unique division |
| Scenario: a correct division is complete | spec: Palisade detects completion and the unique-division solve |
| Scenario: Solve fills a correct division | spec: The Solve command fills in the unique division |

## Palisade renders walls, clues, live errors, and a solve flash

| Rule | Where it went |
| --- | --- |
| The grid-corner dots are drawn once, then each tile is drawn when its flags differ from the cache: four edges, the clue and the cursor box | spec: Palisade renders walls, clues, live errors, and a solve flash |
| The background is drawn once on the first draw by `redraw` | untrue: `drawBorderGridBackground` in `src/engine/border-grid-render.ts` draws the dots only, over the ground the midend lays |
| The cache is an `Int32Array` | reason |
| A wall of a region too small, a wall dangling in one region and an impossible clue are reddened from the current borders | spec: Palisade reddens what the board already contradicts |
| A wall is reddened when its region is too large, and the scenario's walls enclosing a region larger than `k` | untrue: `borderErrorBits` in `src/engine/border-grid-render.ts` measures too large over cells joined by no-wall marks, not over the cells walls enclose, and reddens the edge between such a group and a neighbor whether or not it is a wall |
| A 0.7-second flash plays when a player move solves the board, after a prior Solve too, never on the Solve command, the game supplying only the duration | spec: A player's completing move flashes and the Solve command does not |
| Scenario: a player completion flashes and the Solve command does not | spec: A player's completing move flashes and the Solve command does not |

## Palisade checks mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the rim and returns every wall the solution lacks and every no-wall mark on a solution wall, and nothing when the clue set is not uniquely solvable | spec: Palisade checks mistakes against the unique solution |
| The midend overlay passes the mistakes to `redraw`, which reddens them until the next transition | spec: A flagged mistake reddens its edge until the next transition |
| Scenario: a wrong wall is flagged | spec: Palisade checks mistakes against the unique solution |
| Scenario: a correct partial board is clean | spec: Palisade checks mistakes against the unique solution |

## Palisade offers a deduction-based hint

| Rule | Where it went |
| --- | --- |
| The game implements `hint` and `hintKeepTrack`, and the full chain is returned as the plan | spec: Palisade offers a deduction-based hint |
| The solver is seeded from the player's walls and no-wall marks and run to a fixpoint, without mutating the state | spec: The hint is seeded from the player's own walls and marks |
| A wall is recorded for each new wall and a no-wall for each individually forced join, each carrying its firing | spec: The hint records every edge the deductions force |
| The private names `disconnect` and `connect` | reason |
| One firing's edges are one contiguous journey, later legs flagged `continuesPrevious`, and each leg's move is the two-sided edit | spec: All edges forced by one firing form one journey |
| "Per the engine's hint-authoring convention" | reason |
| A leg names its rule as advice not yet applied | spec: A hint sentence is advice that has not been applied |
| A multi-edge firing's first leg says why its edges go together, and concludes across the set | spec: A multi-edge firing says why its edges are forced together |
| The conclusion reads "clear this one, then the rest" | untrue: no sentence in `src/games/palisade/hint-text.ts` says it, and the multi-edge conclusions there are "draw them all", "its remaining edges can't be walls", "both must be walls" and "neither can be a wall" |
| A leg's highlights identify its edge, the firing's edges not yet set and the referenced cells | spec: Each hint leg marks every element its sentence references |
| The referenced cells are a clue pair, the clue cell or a region | untrue: `noDanglingEdges` in `src/games/palisade/solver.ts` also cites the four squares meeting at a corner, which the list now names |
| The midend refuses a hint on a solved or mistaken board, and `hint` returns an error when no deduction is found | spec: A hint is refused on a solved or mistaken board |
| `hintKeepTrack` completes on the hinted edit, button-checked | spec: Making the hinted edit completes the step |
| Every forced edge of the firing is painted `COL_HINT` and the highlight is in the per-tile cache | spec: The hint paints a firing's edges as one set |
| Every edge the firing forces is painted on every leg | untrue: `borderHintJourney` in `src/engine/border-grid-hint.ts` rings `edges.slice(leg)`, so an edge already set drops back to normal |
| Referenced cells are outlined in `COL_HINT_CELL` inside the cell body, and `equivalentEdges` marks the region, not the clue cell | spec: The hint marks the cells it reasons from inside the cell body |
| Every referenced cell is outlined, the `equivalentEdges` region included | untrue: `say.notTooSmall` and `say.equivalentEdges` in `src/games/palisade/hint-text.ts` mark their region with stripes, which `drawBorderTile` draws as a hatch in the hint edge color |
| The solver without a recorder behaves as before on the solve, mistake and generator paths | spec: The solver concludes the same with or without the hint's recorder |
| Scenario: the next deduction is surfaced and solves the board | spec: Palisade offers a deduction-based hint |
| Scenario: a coupled deduction is one multi-leg journey | spec: All edges forced by one firing form one journey; spec: A multi-edge firing says why its edges are forced together; spec: Each hint leg marks every element its sentence references |
| Scenario: a player no-wall mark is not re-hinted | spec: The hint is seeded from the player's own walls and marks |
| Scenario: the hint refuses on a mistaken or solved board | spec: A hint is refused on a solved or mistaken board |
| Scenario: following the hinted edit advances the plan | spec: Making the hinted edit completes the step |
| Scenario: the hint highlights a firing's edges as one set | spec: The hint paints a firing's edges as one set; spec: The hint marks the cells it reasons from inside the cell body |

## Palisade hint color legend

| Rule | Where it went |
| --- | --- |
| A displayed hint tells element types apart by a stable legend, consistent across the rules, each color with a non-color cue | spec: Palisade hint color legend |
| Forced edges draw `COL_HINT` as wall segments | spec: Palisade hint color legend |
| Several equivalent edges share the one color | spec: Equivalent forced edges share one legend color |
| A cited region is outlined in `COL_HINT_CELL` inside the cell body | spec: The hint marks the cells it reasons from inside the cell body |
| A cited clue is told by its digit on the outlined cell, with no fill of its own | spec: Palisade hint color legend |
| "The same way a number premise is treated elsewhere" | reason |
| No hint cites a decided cell, so no premise ring color is needed | reason |
| Scenario: a `notTooSmall` or `equivalentEdges` region is outlined in a color different from the forced edges | untrue: those two rules hatch their region in `COL_HINT`, the forced edges' own color, through `F_HINT_REGION` in `src/engine/border-grid-render.ts`, and only the two regions of `notTooBig` are outlined in `COL_HINT_CELL` |
| Scenario: forced edges and a `notTooBig` region are distinct | spec: The hint marks the cells it reasons from inside the cell body |
| Scenario: equivalent forced edges share one color | spec: Equivalent forced edges share one legend color |

## Palisade shades completed correct regions

| Rule | Where it went |
| --- | --- |
| A completed correct region fills with `REGION_DONE`, the untouched board does not, and the fill is a local check | spec: Palisade shades completed correct regions |
| "As in Rectangles", and the feedback Galaxies and Rectangles give | reason |
| The valid overlay is part of the render cache diff key | spec: The finished-region fill follows the board |
| Scenario: the solved board shades every region and the untouched board none | spec: Palisade shades completed correct regions |

## Palisade shares its border-marking mechanic rather than owning a copy

| Rule | Where it went |
| --- | --- |
| The bit vocabulary, the hit test, the paired edit and the half-cell cursor come from a shared engine module | spec: Palisade shares its border-marking mechanic rather than owning a copy |
| The cycle is undecided, then wall, then no-wall | untrue: `edgeEdits` in `src/engine/border-grid.ts` has no three-step cycle, each button toggling its own state against undecided and taking an edge straight from the other's, now spec: Each button toggles the nearest edge toward its own state |
| The look is shared on the same terms, and a change to what counts as a wrong wall reaches both games | spec: The border-marking mechanic's look is shared on the same terms |
| The clue semantics, solver, generator, grading and clue rendering stay Palisade's, and the shared renderer takes palette indices and a callback and never branches on the game | spec: Palisade's clue layer stays its own |
| The explained hint's own marks stay Palisade's | untrue: the marks are drawn by `hintTileBits` and `drawBorderTile` in `src/engine/border-grid-render.ts`, shared with Separate, and what stays in `src/games/palisade/hint-text.ts` is the sentences that name them, now spec: Palisade's clue layer stays its own |
| Adopting the shared module changes no board and no frame, and a re-baselined snapshot is evidence the extraction is wrong | history |
| Why a tier-2.5 snapshot binds the rendering extraction harder | history |
| Scenario: the shared mechanic is adopted without moving a board | history |
| Scenario: a fix to the shared mechanic reaches both games | spec: Palisade shares its border-marking mechanic rather than owning a copy |
| Scenario: the explained hint survives the shared renderer | spec: Palisade's clue layer stays its own |
| "Its narration is unchanged" in that scenario | history |

## Palisade draws its cells on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| Every cell is on the cell surface, a clue cell on the given's lifted surface with its digit in ink, and the edges keep their three colors | spec: Palisade draws its cells on the collection's quiet surface |
| A finished region fills whole, clue cells included, and the solved flash lifts every cell to the given's surface | spec: A finished region and the solved flash cover the clue cells |
| Scenario: a clue is told by the cell under it | spec: Palisade draws its cells on the collection's quiet surface |
| Scenario: the edges keep their three colors | spec: Palisade draws its cells on the collection's quiet surface |
| "As before the surface was applied" | history |
