# Cuts: sixteen

Requirements: 23 before, 19 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Sixteen game implements the Game interface": "The engine SHALL provide a registered `sixteen` game implementing `Game`". The rules of the puzzle, the cursor modes and the slide animation stay, retitled "Sixteen slides whole rows and columns until the tiles read in order". | type | The compiler and the registry say it of every game. |
| "Sixteen game implements the Game interface": "a completion flash" | collection | `ts-engine` "The win flash plays on a forward move that solves the board"; Sixteen only declares `solvedFlash`. |
| "Sixteen game implements the Game interface": "per-tile cache rendering" | how | How the frame is kept cheap; no player sees it. |
| "The Sixteen hint plans in full-slide moves": "It SHALL run an exact bidirectional search that meets in the middle on every board, and a heuristic forward search for the boards that search cannot reach." | collection | `engine-hints` "Sliding-permutation games share one slide planner whose exact search always runs" and "The slide planner's exact search runs on every board". |
| "A search that falls short returns its partial path" | collection | `engine-hints` "The slide planner returns a partial plan when it falls short". |
| "Sixteen's exact search is not gated on how finished the board looks" | collection | `engine-hints` "The slide planner's exact search runs on every board": a game supplies a budget and never a condition, with the same reason. Its two scenarios are held by "Sixteen's hint SHALL finish the swapped-pair endgames" here and by `engine-hints` "The deep search reaches one ply past the ungated search". |
| "A step says whether its tile arrives or is staged": "The wording SHALL be consistent with the hint quality bar (the Palisade exemplar) and with the sibling Fifteen hint." | process | `docs/games/hints.md` § "The quality bar". |
| "The swapped-pair guard names its boards and asserts the plan length" | particular | A rule about one test; the scenarios of "Sixteen's hint SHALL finish the swapped-pair endgames" keep the named boards and the plan of more than eight moves, and the test's comment keeps the reason. |
| "The tangle guarantee is asserted by walking recomputed hints" | duplicate | The scenarios of "Sixteen's hint SHALL count the tangles its distance measure cannot see" follow recomputed hints to solved; `engine-hints` "A plan steered by a measure SHALL be steered by one measure" gives the reason. |
| "The Sixteen port supports direct row and column dragging": "The Sixteen TS port" becomes "Sixteen" | port | There is no other Sixteen in the tree. |
