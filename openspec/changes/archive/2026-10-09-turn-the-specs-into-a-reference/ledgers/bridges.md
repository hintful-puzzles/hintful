# Ledger: bridges

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Bridges game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `bridges` game with the rules of the puzzle, providing `solve` and `textFormat` | spec: Bridges game implements the Game interface |
| It implements `Game` with six named type arguments | untrue: `bridgesGame` in `src/games/bridges/index.ts` is declared with eight, the six listed and then `BridgesHighlights` and `BridgesRung`, so the requirement now says `Game` |
| Params are `w`, `h`, `maxb`, `islands`, `expansion`, `allowloops` and `difficulty` at Easy, Normal or Tricky | spec: Bridges params are size, bridge limit, density, expansion, loops and difficulty |
| The square 7, 10 and 15 boards at each tier with `maxb = 2`, `islands = 30`, `expansion = 10` and loops allowed, and after them one 10×10 Normal board without loops | spec: Bridges offers three square sizes at every tier and one board without loops |
| There are 9 such presets, and they are upstream's | figure |
| Scenario: params round-trip | spec: Bridges params are size, bridge limit, density, expansion, loops and difficulty |
| Scenario: `validateParams` refuses a 3×3 grid at the default density as too small for the minimum island count | untrue: `validateParams` in `src/games/bridges/state.ts` accepts 3×3 at the default density at Easy, where the island target is three, and refuses it only at a tier above Easy through `sparseRefusal`, so the scenario now names the tier |

## Bridges descriptions encode the island clue grid

| Rule | Where it went |
| --- | --- |
| Row-major encoding, a digit or letter for an island's count and a run-length letter for empty cells | spec: Bridges descriptions encode the island clue grid |
| The encoding is upstream's `new_game_desc` | history |
| `newState` parses the island list, the island flags and the reverse index, and shares the clue data across a game's states | spec: Bridges descriptions encode the island clue grid |
| `validateDesc` rejects a desc that overruns the grid or holds an out-of-range character | spec: A Bridges description that describes no board is refused |
| `validateDesc` rejects an island count no legal bridge configuration could satisfy at the grid edge | untrue: `parseDesc` in `src/games/bridges/state.ts` makes no such check, and what it refuses besides is a desc that stops short of the grid, two islands orthogonally next to each other and fewer than two islands, which the requirement now lists |
| Scenario: a description round-trips | spec: Bridges descriptions encode the island clue grid |
| Scenario: a malformed description is rejected | spec: A Bridges description that describes no board is refused |

## Bridges input drags bridges between islands

| Rule | Where it went |
| --- | --- |
| A left-drag to the next in-line island adds or increments a bridge, wrapping to zero past the span's limit, tracked as it moves and committed on release | spec: Bridges input drags bridges between islands |
| The tracking and the commit are named `update_drag_dst` and `finish_drag` | history |
| A right-drag lowers the span's limit by one, down to the cross and back to no limit | spec: A secondary drag lowers a Bridges span's limit by one |
| Cursor keys move a keyboard cursor, and `CURSOR_SELECT` grabs and drops a keyboard drag | spec: Bridges has a keyboard cursor that drags |
| A drag that does not run cleanly between two in-line islands is canceled with no change | spec: Bridges input drags bridges between islands |
| No editor-only move letters are mapped | spec: Bridges has a keyboard cursor that drags |
| Scenario: dragging cycles the bridge count, and an off-line drag is canceled | spec: Bridges input drags bridges between islands |

## Bridges flags mistakes and live errors

| Rule | Where it went |
| --- | --- |
| Provably wrong state is drawn red: an island that can no longer reach its count, and bridges completing a forbidden loop when `allowloops` is false | spec: Bridges draws provably wrong state red |
| It does so as upstream does, through `island_impossible`, `map_hasloops` and `findloop` | history |
| `findMistakes` re-solves from the clues and returns every span the player's marks contradict, by bridge, by count and by limit, the cross included | spec: Bridges findMistakes reports every span the unique solution contradicts |
| A board that is not uniquely solvable yields no mistakes | spec: Bridges findMistakes reports every span the unique solution contradicts |
| The live-error and `findMistakes` overlays are distinct | untrue: `redrawBridges` in `src/games/bridges/render.ts` sets the one warning bit for an impossible island, a group warning and a mistake alike and draws all three in the one red, so the requirement says the mistake overlay is drawn in the live-error red |
| Both overlays are part of the render diff key, so they repaint and clear on a later frame | spec: Bridges error and mistake marks are in the tile diff key |
| Scenario: a wrong bridge is flagged | spec: Bridges findMistakes reports every span the unique solution contradicts |
| Scenario: a mistake overlay repaints on a later frame | spec: Bridges error and mistake marks are in the tile diff key |

## Bridges auto-marks satisfied islands (fork aid)

| Rule | Where it went |
| --- | --- |
| An `auto-mark-complete` boolean preference, default on, through `Game.prefs`, drawing a satisfied island with the done-mark face with no player action | spec: Bridges auto-marks satisfied islands (fork aid) |
| It is a deliberate divergence from upstream, which requires a manual click | history |
| The background is named `DI_BG_MARK` and the flag `G_MARK` | history |
| The aid is purely visual, sets no mark and locks no bridge, and the manual click-to-mark-and-lock is retained | spec: Bridges auto-marks satisfied islands (fork aid) |
| The auto-mark background never fights the red live-error foreground | spec: Bridges auto-marks satisfied islands (fork aid) |
| That holds because a satisfied island is never `island_impossible` | reason |
| The background is in the render diff key, so the face is taken as soon as the count is met and reverts when a bridge is removed | spec: Bridges error and mistake marks are in the tile diff key |
| The done-mark background is the lifted surface | spec: Bridges tells a settled island by a lifted face |
| Scenario: a satisfied island grays only when the preference is on | spec: Bridges auto-marks satisfied islands (fork aid) |

## Bridges explains the next deduction

| Rule | Where it went |
| --- | --- |
| A hint is refused on a solved or wrong board by the midend before it asks the game, and otherwise `hint(state)` returns the forced deductions as an ordered plan whose steps narrate why | spec: Bridges explains the next deduction |
| The plan comes from the `DeductionTechnique` objects the from-scratch solve runs, through `singleFirings` with a recorder, with no rung reimplemented and the generator's path unchanged | spec: Bridges plans a hint with the solver's own techniques |
| Those objects are three | untrue: `Solver.ladder()` in `src/games/bridges/solver.ts` returns four techniques, with sealing off a technique of its own beside stage 2, so the requirement gives no count |
| The ladder is capped at the board's own difficulty, the tier the generator certified it at | spec: Bridges plans a hint with the solver's own techniques |
| One firing is one step: a stage stops at the first island that moved under a recorder, and a rung with several teachable rules returns at the first that changed the board | spec: One Bridges firing is one hint step |
| A stage sweeps sixty-seven islands | figure |
| A step's move carries several bridges when one premise forces them all | spec: One Bridges firing is one hint step |
| `hintKeepTrack` then verdicts `"onTrack"` and shrinks the step in place, counting a bridge toward the step's count as progress and accepting the span from either end | spec: A Bridges hint step is followed one drag at a time |
| A step that limits a span is followed by the limit the player's drag leaves | spec: A Bridges hint step is followed one drag at a time |
| The cross is reached from no limit in more than one drag | reason |
| The working copy resumes from the player's marks and first marks every island whose bridges meet its clue | spec: Bridges hint resumes from the player's marks |
| Every change is recorded, and a firing with no reason is applied and never shown | spec: Bridges hint hides the bookkeeping mark |
| Exactly one rule declares no reason, stage 1's mark of a completed island | spec: Bridges hint hides the bookkeeping mark |
| No step leans on a fact the player cannot see, the limit is a step of its own, and the deduction's board never holds what the player's does not | spec: No Bridges hint step leans on a fact the player cannot see |
| The sentence of a limit step | spec: No Bridges hint step leans on a fact the player cannot see |
| A firing carries which cause forced it, read while the trial still stands | spec: A Bridges firing carries which cause forced it |
| Scenario: an island with exactly enough room left | spec: Bridges explains the next deduction |
| Scenario: a bookkeeping mark is never a step | spec: Bridges hint hides the bookkeeping mark |
| Scenario: a hint runs from the player's own bridges | spec: Bridges hint resumes from the player's marks |
| Scenario: a hint refuses on a wrong board, and says so honestly when the annotation is what is wrong | spec: Bridges explains the next deduction |
| Scenario: following the plan solves the board at every tier | spec: Bridges plans a hint with the solver's own techniques |
| Scenario: a hint writes the limit a later step counts | spec: No Bridges hint step leans on a fact the player cannot see |

## Bridges marks a hint in its own vocabulary

| Rule | Where it went |
| --- | --- |
| `redraw` draws the step's marks from `BridgesHighlights` as the game's own shapes recolored, and nothing comes from `engine/hint-mark.ts` | spec: Bridges marks a hint in its own vocabulary |
| A decided span is the bundle it would become, added bars in `COL_HINT` and the rest in the board's color, or the pair of crosses in `COL_HINT` when blocked | spec: A Bridges hint draws a span as what the step makes of it |
| An island is marked by its rim and clue digit, `COL_HINT` when named and `COL_HINT_CELL` when counted, never both | spec: A Bridges hint recolors an island's rim and clue digit |
| A step recolors the island in the action color only when its sentence names it | spec: A Bridges hint recolors an island's rim and clue digit |
| The three premises that count a group the island belongs to mark every member alike | untrue: `namesFocus` in `src/games/bridges/hint.ts` leaves the island unnamed for two group premises, the sealed group and the loop, while the third, `mustReachOut`, names its island and recolors it in the action color, so the requirement binds a premise that counts the group without naming the island |
| The hint marks are carried per cell in an `Int32Array` compared in the diff key, in the packed descriptor's layout, so a later hint repaints and a rim reaches the four tiles around it | spec: Bridges hint marks are in the tile diff key |
| Scenario: a displayed hint repaints an otherwise unchanged frame | spec: Bridges hint marks are in the tile diff key |
| Scenario: raising a span leaves the bridges already there in board ink | spec: A Bridges hint draws a span as what the step makes of it |
| Scenario: no hint mark is a fill | spec: Bridges marks a hint in its own vocabulary |

## Bridges solves with a graded multi-stage deductive solver

| Rule | Where it went |
| --- | --- |
| The solver runs its stages gated by difficulty, is purely deductive, and maintains the possible and maximum counts as it goes | spec: Bridges solves with a graded multi-stage deductive solver |
| The stages are upstream's `solve_sub`, whose `depth` is unused, and the counts are `map_update_possibles` | history |
| It returns an impossible, ambiguous or solved verdict | untrue: `solveFromScratch` in `src/games/bridges/solver.ts` returns 1 for solved and 0 otherwise, a contradiction included, and the game's `solveAtCap` reports `"solved"` or `"unsolved"`, so the requirement says it reports whether it solved the board |
| Easy runs stage 1: an island's count equal to its room, and no bridge into a satisfied island | spec: Bridges Easy runs the single-island deductions |
| Normal adds stage 2, the loop rule when loops are forbidden, and sealing off | spec: Bridges Normal adds direction counting, loops and sealing off |
| Stage 2 reasons with each neighbor's own remaining capacity | untrue: `solveIslandStage2` in `src/games/bridges/solver.ts` sums what each direction can hold, the span's possible count or the bridges on a locked span, and not what the neighbor still needs, so the requirement says the most the other directions can hold |
| Tricky adds stage 3: the "at most" limit, the starved island and the direction that must reach out | spec: Bridges Tricky adds the connected-group deductions |
| Sealing off was upstream's Tricky and was taken down to Normal as a deliberate divergence | history |
| It is one bridge and one check, and the deduction a player meets first | reason |
| Generating Tricky with `maxb` 1 is refused with a reason, with its reason, and a board dealt that way still loads | spec: Bridges refuses to generate Tricky with one bridge per line |
| Scenario: a generated board is uniquely solvable at its difficulty | spec: Bridges solves with a graded multi-stage deductive solver |
| Scenario: two neighboring 1s are kept apart at Normal | spec: Bridges Normal adds direction counting, loops and sealing off |
| Scenario: Tricky with one bridge per line is refused | spec: Bridges refuses to generate Tricky with one bridge per line |

## Bridges generates boards soluble at exactly their difficulty

| Rule | Where it went |
| --- | --- |
| The generator grows a map from a random island to the density target, derives the clues, and retries until a board is soluble at exactly the target difficulty | spec: Bridges generates boards soluble at exactly their difficulty |
| Scenario: a generated board is graded at its requested difficulty | spec: Bridges generates boards soluble at exactly their difficulty |

## Bridges renders islands and bridges with a show-hints preference

| Rule | Where it went |
| --- | --- |
| The renderer draws islands as circles with their count, single and double bridges, the no-line and mark indicators, and the win flash | spec: Bridges renders islands, bridges, marks and the win flash |
| It draws an in-progress drag preview line | untrue: `redrawBridges` in `src/games/bridges/render.ts` recolors the drag's two islands and the bridges already between them and draws no line on an empty span, so the requirement says that |
| It draws a keyboard cursor ring | untrue: `drawIsland` in `src/games/bridges/render.ts` fills the island's face with the cursor wash and leaves the rim alone, so the requirement says a wash on the face |
| The `findMistakes` overlay reuses the red warning channel with no palette entry of its own, so it is in the diff key and repaints clean when cleared | spec: Bridges error and mistake marks are in the tile diff key |
| A `show-hints` boolean preference through `Game.prefs` | spec: Bridges offers a show-hints preference for possible bridges |
| The preference is upstream's `PREF_SHOW_HINTS` | history |
| When on, faint `COL_HINT` lines indicate forced or forbidden bridges | untrue: the lines are drawn in `COL_POSSIBLE`, since `COL_HINT` in `src/games/bridges/render.ts` is the hint's action color, and they run along every span between two in-line islands that carries no bridge and no cross, where a bridge could go, which the requirement now says |
| Scenario: the show-hints preference toggles the overlay | spec: Bridges offers a show-hints preference for possible bridges |

## Bridges lets the player limit a span

| Rule | Where it went |
| --- | --- |
| A player can write the most bridges a span may carry, no limit being `maxb` and a limit of none being the cross, stored in the per-span maximum a bridge drag wraps at | spec: Bridges lets the player limit a span |
| A span limited to one takes a single bridge and the next drag clears it | spec: Bridges lets the player limit a span |
| The secondary drag, by right button, promoted touch hold or Shift+arrow, lowers the limit by one through to the cross and back, every stop weaker than the next | spec: A secondary drag lowers a Bridges span's limit by one |
| A limit never drops below the bridges drawn, the cycle skips the cross over a bundle, and a full bundle with no limit has nothing to lower | spec: A Bridges limit never drops below the bridges drawn |
| `executeMove` rejects a limit below the bridges drawn, above `maxb`, or of none | spec: A Bridges limit never drops below the bridges drawn |
| A limit is drawn as `≤n` on a patch of background at the middle square, in the span's color, red with the span when flagged, and is in the diff key | spec: A Bridges limit is drawn as ≤n at the middle of its span |
| A from-scratch solve ignores the player's limits and Solve lifts every one | spec: A Bridges solve ignores and lifts the player's limits |
| Scenario: a right-drag lowers a span's limit | spec: A secondary drag lowers a Bridges span's limit by one |
| Scenario: a limit never falls below the bridges drawn | spec: A Bridges limit never drops below the bridges drawn |
| Scenario: a wrong limit is a mistake | spec: Bridges lets the player limit a span |

## Bridges grades a board the same however its islands are listed

| Rule | Where it went |
| --- | --- |
| The verdict at every difficulty is a function of the board and not of the order the state lists its islands in | spec: Bridges grades a board the same however its islands are listed |
| An island's room along a span is the least of what it needs and what the span can still take, its capacity less the bridges on it, so room never grows | spec: An island's room along a span never grows as bridges are drawn |
| This diverges from upstream, which takes the bridges off the limit alone | history |
| Scenario: a board, and a dealt board, has one grade in every island order | spec: Bridges grades a board the same however its islands are listed |

## Bridges tells a settled island by a lifted face

| Rule | Where it went |
| --- | --- |
| An island with bridges to take has the cell surface, a completed or auto-marked one the lifted surface, and the band under a locked bridge is the lifted surface | spec: Bridges tells a settled island by a lifted face |
| Settled is told by a pair of named surfaces that hold in both schemes, never by a bevel shade | spec: Bridges tells a settled island by a lifted face |
| The rim, the count and the bridges stay in ink, and the board between islands stays the board | spec: A settled Bridges island keeps its rim, count and bridges in ink |
| Scenario: an island with bridges to take has the cell surface, and a completed island is lifted | spec: Bridges tells a settled island by a lifted face |
