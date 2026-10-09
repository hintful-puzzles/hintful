# Ledger: sixteen

Base: bb004490

Where every rule of Sixteen's spec went in the reference form.

## Sixteen game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `sixteen` game implements `Game`, the toroidal sliding-tile puzzle | spec: Sixteen game implements the Game interface |
| The five type arguments of `Game` | untrue: `sixteenGame` in `src/games/sixteen/index.ts` is typed with eight arguments, the hint highlights and rung among them, so the requirement names `Game` alone |
| `WxH[mM]` params, a movetarget above 0 shuffling by random moves, otherwise a parity-corrected random permutation | spec: Sixteen's params choose how the board is scrambled |
| A slide of a whole row or column, toroidal, counted once whatever its distance | spec: A slide is one move whatever its distance |
| A slide is expressed as `{ axis, index, delta }` | untrue: `SixteenMove` in `src/games/sixteen/state.ts` is `{ type: "slide", axis, index, delta }`, beside a `{ type: "solve" }` arm |
| A keyboard cursor with three modes, slide animation, completion flash, per-tile cache rendering | spec: Sixteen game implements the Game interface |
| Scenario: random-permutation generation is solvable | spec: Sixteen's params choose how the board is scrambled |
| Scenario clause: the solved state reports completed status | spec: Sixteen game implements the Game interface |
| Scenario: slide move semantics | spec: A slide is one move whatever its distance |

## The Sixteen port implements heuristic hints and rendering

| Rule | Where it went |
| --- | --- |
| The planner searches in full-slide moves, an exact bidirectional search on every board and a heuristic forward search past it, and returns the whole path as narrated steps | spec: The Sixteen hint plans in full-slide moves |
| A forward search that improves the board without finishing returns its partial path | spec: A search that falls short returns its partial path |
| The exact search is not gated on how nearly finished the board looks | spec: Sixteen's exact search is not gated on how finished the board looks |
| It was gated at a strict local minimum with at most eight tiles out of place, and the 5×5 hint cycled with period 4 | history; guide: docs/games/hints.md § "Sliding-permutation games" |
| The measured plan peaks at 17 tiles out of place and a travel of 30, from 9 and 9 | figure |
| A shortest plan climbs on the way home, so a gate hands the board back to the heuristic | spec: Sixteen's exact search is not gated on how finished the board looks |
| See the `engine-hints` planner requirement for the general rule | reason |
| Narration describes what the move does: the lowest-numbered out-of-place tile on the moved line, the landing cell as target, the delta normalized to in-grid travel | spec: A step narrates what its move does |
| A previewed continuation keeps its journey tile and is flagged `continuesPrevious`, and a step previews a perpendicular second leg | spec: A journey's second leg keeps its tile |
| A move landing the tile in its solved cell reads as a final placement, any other as a setup move, consistent with the quality bar and Fifteen, the why attaching to the journey's end | spec: A step says whether its tile arrives or is staged |
| A journey's final leg narrates the final placement | untrue: `say.step` in `src/games/sixteen/hint-text.ts` gives a `continues` leg no why at all, and `narrateStep` in `index.ts` puts the journey's why on its first leg |
| A hint gives the move home even when it undoes the player's slide, and the veto stays with the heuristic search | spec: The hint gives the move home even when it undoes the player's slide |
| The port withheld the undo as useless advice and the shape of a ping-pong | history |
| `redraw` highlights the tile, its landing cell and the slide arrow in the hint's color | spec: Sixteen draws the hinted tile, its landing cell and its arrow |
| The color is named `COL_HINT` | reason |
| `hintKeepTrack` reports completed, onTrack with the delta adjusted in place, or off | spec: hintKeepTrack follows slides of the hinted line |
| Scenario: Sixteen generates a hint plan | spec: The Sixteen hint plans in full-slide moves; spec: A step narrates what its move does; spec: Sixteen draws the hinted tile, its landing cell and its arrow |
| Scenario: a local-minimum endgame still yields a plan | spec: Sixteen's exact search is not gated on how finished the board looks |
| Scenario: a player who re-asks after every move still arrives | spec: Sixteen's exact search is not gated on how finished the board looks |
| Scenario: narration distinguishes a final placement from a staging move | spec: A step says whether its tile arrives or is staged |

## The Sixteen port supports direct row and column dragging

| Rule | Where it went |
| --- | --- |
| Direct touch and mouse dragging of a row or column, offset live, snapped on release, executed past half a tile | spec: The Sixteen port supports direct row and column dragging |
| Scenario: dragging a row to slide it right | spec: The Sixteen port supports direct row and column dragging |

## Sixteen's hint SHALL finish the swapped-pair endgames

| Rule | Where it went |
| --- | --- |
| The hint returns a plan from a board of one or two swapped pairs and does not refuse | spec: Sixteen's hint SHALL finish the swapped-pair endgames |
| Sixteen configures the depth-bounded deep search, reaching nine moves at its largest preset | spec: Sixteen's hint SHALL finish the swapped-pair endgames |
| Such a board is a strict local minimum, one move past what a state-storing search affords at this size | spec: Sixteen's hint SHALL finish the swapped-pair endgames |
| The hint stopped on twelve of forty 5×4 games and five of forty 5×5 ones, after thirty-odd hints, saying "No move here would get you closer." | history; figure; guide: docs/games/hints.md § "Sliding-permutation games" |
| The guard names the boards and asserts the plan length, since only a long plan proves the deep search ran | spec: The swapped-pair guard names its boards and asserts the plan length |
| Scenario: a single swapped pair | spec: Sixteen's hint SHALL finish the swapped-pair endgames |
| Scenario: two swapped pairs | spec: Sixteen's hint SHALL finish the swapped-pair endgames |

## Sixteen's hint SHALL count the tangles its distance measure cannot see

| Rule | Where it went |
| --- | --- |
| The hint measures a board by travel and its tangles, and returns a plan from a tangled board | spec: Sixteen's hint SHALL count the tangles its distance measure cannot see |
| The measure is travel plus the number of tangles | untrue: `heuristic` in `src/games/sixteen/index.ts` adds `TANGLE_COST`, four, for each tangle past `TANGLES_IN_REACH`, so the requirement says a cost for the tangles |
| Travel alone is blind to a tangle, which makes a tangled board a strict local minimum | spec: Sixteen's hint SHALL count the tangles its distance measure cannot see |
| A pair reads as two squares and is nine moves away, four tangles thirteen-odd while reading as eight | figure |
| The hint refused at move 33 of a 5×5 game reached by following its own hints | history |
| Reaching further is not attempted with this machinery, and counting the tangles is the escape | spec: A tangled board is not answered by searching further |
| A further ply costs about 40× at a branching factor of 40 | figure; guide: docs/games/hints.md § "Recompute-stable plans" |
| Crossing nine moves needed a kept endgame database and a five-ply walk | figure; guide: docs/games/hints.md § "Sliding-permutation games" |
| A tangled board is past both exact searches, so nothing else answered | reason |
| The count costs one O(n) pass | spec: A tangled board is not answered by searching further |
| The count is priced only past two tangles, and the measure is plain travel at or under that | spec: The tangle count is priced only past what the exact searches unwind |
| Two, because a tangle is about four and a half moves and the deep search reaches nine | figure |
| A measure sharpened everywhere stops the deep search's gate opening | spec: The tangle count is priced only past what the exact searches unwind |
| The complete nine-move plan became a five-move partial one | figure |
| The boards the exact searches own are measured exactly as before, which is not tuning | reason |
| The guarantee is asserted by walking recomputed hints to solved, not by one plan's length | spec: The tangle guarantee is asserted by walking recomputed hints |
| The first arrangement armed the measure only where travel was helpless and ran 400 hints without solving | history; figure |
| The boards a guard names are even permutations, since an odd board cannot be solved | spec: The boards a tangle guard names are even permutations |
| Scenario: the board the hint refused on | spec: Sixteen's hint SHALL count the tangles its distance measure cannot see |
| Scenario: tangles beyond a pair count | spec: Sixteen's hint SHALL count the tangles its distance measure cannot see |
| Scenario: a one- or two-tangle endgame is untouched | spec: The tangle count is priced only past what the exact searches unwind |

## Sixteen's hint SHALL refuse only by saying its search ran out

| Rule | Where it went |
| --- | --- |
| An empty plan is refused with the search-out-of-reach constant, and never by claiming no move gets closer | spec: Sixteen's hint SHALL refuse only by saying its search ran out |
| An empty plan has one cause, and it is a fact about the search | spec: Sixteen's hint SHALL refuse only by saying its search ran out |
| The message this replaced was false on the board that prompted the change | history |
| Scenario: a refusal that has to be true | spec: Sixteen's hint SHALL refuse only by saying its search ran out |

## A Sixteen tile stands off the board, and its arrows are Netslide's

| Rule | Where it went |
| --- | --- |
| A tile's face is the lifted surface inside its bevel, the tile keeps its bevel, and color 0 stays the board | spec: A Sixteen tile stands off the board |
| A slide arrow is filled as Netslide's, in ink outline, with the cursor's and the hint's colors on the arrows they name | spec: Sixteen's slide arrows are Netslide's |
| Scenario: a tile is not the board's gray | spec: A Sixteen tile stands off the board |
| Scenario: the arrows match Netslide's in the dark scheme | spec: Sixteen's slide arrows are Netslide's |
