# Ledger: netslide

Base: bb004490

Where every rule of Netslide's spec went in the reference form: every rule
kept, stated once, a requirement held to the tool's 500 characters. The tile
the old text called "the center" in its mechanics and "the source" in its hint
is the source throughout, defined once as the tile at `⌊w/2⌋, ⌊h/2⌋`.

## Netslide game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `netslide` game implements `Game`, a grid of 4-bit wire tiles whose solved form is a spanning tree scrambled by toroidal slides, slid by rows and columns but never the source's | spec: Netslide game implements the Game interface |
| The five type arguments of `Game` | held: src/games/netslide/index.ts "export const netslideGame: Game<" |
| The five params, their encoding, the square shorthand, and which suffix the full encoding alone writes | spec: Netslide's params and their encoding |
| The presets are upstream's, three sizes at easy, medium and hard | spec: Netslide offers three sizes at three difficulties |
| "All 9" presets | figure |
| Width and height above one, a probability in `[0, 1]`, a move target not negative | spec: Netslide's params are held to their ranges |
| `validateParams` is what requires them | untrue: `validateParams` in `src/games/netslide/state.ts` refuses only an oversized area, and the three ranges are the `bounds` of the `paramConfig` items in `src/games/netslide/index.ts`, which the engine's `paramsError` refuses |
| The game provides `solve` and `statusbarText` and no `textFormat` | spec: Netslide provides Solve and a status bar, and no text format |
| Scenario: params round-trip | spec: Netslide's params and their encoding |
| Scenario: invalid params are rejected | spec: Netslide's params are held to their ranges |

## Netslide descriptions encode wires and barriers

| Rule | Where it went |
| --- | --- |
| The row-major hex encoding with `v` and `h` barrier marks, and the refusal of an unexpected character or a wrong length | spec: Netslide descriptions encode wires and barriers |
| `validateDesc` is what rejects them | untrue: the game has no `validateDesc`, `newState` in `src/games/netslide/state.ts` refuses through `parseWireDesc` and the engine derives the verdict from it |
| `newState` parses both grids, walls in a non-wrapping game and derives the corner-joining flags | spec: newState builds the barrier grid |
| Barriers never change and are shared across every state of a game | spec: Every state of a game shares one barrier grid |
| The shared barriers are frozen | untrue: nothing freezes the array, since `Object.freeze` throws on a populated typed array, and the `readonly` type on `NetslideState.barriers` in `src/games/netslide/state.ts` is the guarantee |
| Scenario: a description round-trips | spec: Netslide descriptions encode wires and barriers |
| Scenario: a non-wrapping game is walled in | spec: newState builds the barrier grid |

## Netslide generates a spanning-tree grid, then shuffles it

| Rule | Where it went |
| --- | --- |
| The solved grid grows outward from the source, by a uniform pick from an ordered candidate set, with no full cross and no loop | spec: The solved grid is grown from the source as a spanning tree |
| The shuffle declines an undoing or overshooting slide without counting it, and how many slides it makes | spec: The shuffle declines a slide that undoes or overshoots |
| Barriers are chosen after the shuffle, one at a time, so a higher probability gives a superset | spec: Barriers are chosen after the shuffle |
| The unshuffled grid is saved as `aux` | spec: The generator saves the unshuffled grid as aux |
| Scenario: the solved grid is a spanning tree | spec: The solved grid is grown from the source as a spanning tree |
| Scenario: raising the barrier probability on one seed adds barriers | spec: Barriers are chosen after the shuffle |

## Netslide slides rows and columns, and powers the connected tiles

| Rule | Where it went |
| --- | --- |
| A move is a single-step toroidal slide of one line, or the solve move | spec: A move is one step of one line |
| A gutter click slides the line beside it, the right button reverses it, and a click beside the source's line is refused | spec: A click in the gutter slides the line beside it |
| The keyboard cursor walks the ring of arrows, skips the source's lines, and select slides | spec: The keyboard cursor walks the ring of arrows |
| The active tiles are those wired to the source, a line in motion is unpowered, and the game is complete when all are active | spec: Netslide slides rows and columns, and powers the connected tiles |
| Scenario: a slide wraps around | spec: A move is one step of one line |
| Scenario: the right button reverses a slide | spec: A click in the gutter slides the line beside it |
| Scenario: the center line cannot be slid | spec: A click in the gutter slides the line beside it |
| Scenario: completion is every tile powered | spec: Netslide slides rows and columns, and powers the connected tiles |

## Netslide renders wires, barriers, arrows and the slide animation

| Rule | Where it went |
| --- | --- |
| Wires in the powered or the plain color, a box at the source and at each endpoint, stubs across borders, and barriers joined at their corners | spec: Netslide renders wires, barriers, arrows and the slide animation |
| A slide arrow beside every slidable line, the cursor's highlighted, and the width of the border gutter | spec: A slide arrow sits beside every line that slides |
| The gutter's width is upstream's `NARROW_BORDERS` variant, which the web build compiles | history |
| A slide is animated by offsetting the line and drawing the wrapping tile off the grid, and completion flashes outward | spec: A slide is animated, and completion flashes outward |
| The status bar gives the move count, the target when set, and the active tiles | spec: The status bar counts moves and powered tiles |
| The status bar says whether the game is complete or was auto-solved | spec: The status bar counts moves and powered tiles; spec ts-engine: The status bar's completion words come from the engine |
| Scenario: powered and unpowered wires differ | spec: Netslide renders wires, barriers, arrows and the slide animation |
| Scenario: a slide is animated | spec: A slide is animated, and completion flashes outward |

## Netslide offers an explained hint

| Rule | Where it went |
| --- | --- |
| The game implements `Game.hint` and `Game.hintKeepTrack`, plans slides and narrates each by its consequence, and meets the hint quality bar | spec: Netslide offers an explained hint |
| The hint plans against `aux` when there is one and a grid recovered from the board otherwise | spec: The hint plans against a finished grid |
| The goal test is every tile powered, not equality with the target | spec: The plan's goal is every tile powered |
| Board elements are named as seen or counted, and the immovable tile is the source and never the center | spec: The hint names what the player can see |
| A line that cannot be slid is named by its number, as in "row 3 never slides" | untrue: `say.rowFixed` and `say.colFixed` in `src/games/netslide/hint-text.ts` say "This row never slides" and "This column never slides" and the line is hatched, because the board draws no numbers |
| The hint leads with the tile's single degree of freedom | spec: The hint leads with the tile's one degree of freedom |
| The rules are not restated step after step, and a tile that belongs beside the source is said so plainly | spec: The hint does not restate the rules |
| Each move is narrated by its consequence in the shared vocabulary, never restating the move, never "belongs" twice | spec: Each move is narrated by its consequence |
| A subgoal of several slides is one journey of `continuesPrevious` legs | spec: A subgoal of several slides is one journey |
| A tile is said to belong only where the finished board wants its wires, and never as its only cell | spec: The hint claims a tile belongs only where its wires are wanted |
| A tile parked by a plan that ran out of budget is narrated as set up | spec: A tile an unfinished plan parks is narrated as set up |
| Scenario: a hint on a board one move from solved | spec: Netslide offers an explained hint |
| Scenario: a hint on a board that came with no answer | spec: The hint plans against a finished grid |
| Scenario: a tile is only ever said to belong where its wires are wanted | spec: The hint claims a tile belongs only where its wires are wanted |
| Scenario: the immovable tile is never called the center | spec: The hint names what the player can see |
| Scenario: a frozen line is named by its number | untrue: the line is named "This row" and hatched, as the corrected scenario of "The hint leads with the tile's one degree of freedom" says |

## Netslide can be solved from any position

| Rule | Where it went |
| --- | --- |
| Following the hint finishes the board from any reachable position, on any preset, with or without an answer, never giving up and never circling | spec: Netslide can be solved from any position |
| This is achieved structurally and never by caching the plan, and the distance measure is a pure function of the board | spec: The distance to finished is a pure function of the board |
| An endgame the heuristic cannot see past is planned by an exact shortest search | spec: An endgame the heuristic cannot see past is searched exactly |
| The swapped pair "is really ten moves away" | figure |
| How the heuristic plan looped, several slides of one row returning the board to its start | history |
| The grid planned against is reachable by sliding, and why not every grid is | spec: The grid the hint plans against is reachable by sliding |
| The hint holds a stable subgoal across a journey and marks its tile | spec: The hint holds its subgoal across a journey |
| Netslide is covered by the cross-game hint-resume guard | spec: Netslide is covered by the cross-game hint-resume guard |
| Scenario: following the hint finishes a board that came with no answer | spec: Netslide can be solved from any position |
| Scenario: the hint never aims at a grid the board cannot reach | spec: The grid the hint plans against is reachable by sliding |

## Netslide can be solved without the generator's answer

| Rule | Where it went |
| --- | --- |
| `Game.solve` recovers the finished grid on a board with no `aux` and does not refuse | spec: Netslide can be solved without the generator's answer |
| Scenario: solving a game built from a descriptive id | spec: Netslide can be solved without the generator's answer |
| The refusal it avoids reads "Solution not known for this puzzle" | untrue: the refusal is `SOLUTION_UNKNOWN` in `src/engine/solve-failure.ts`, which reads "This game ID doesn't include its solution, and this puzzle has no solver to work one out." |

## Netslide renders the displayed hint step

| Rule | Where it went |
| --- | --- |
| The tile is highlighted, its destination marked, and the arrow to press drawn in the hint color | spec: Netslide renders the displayed hint step |
| A destination the tile belongs in is marked apart from one it passes through | spec: A destination a tile belongs in is marked apart from a stop on the way |
| Hint colors are appended past the upstream color enum | spec: Hint colors come after the upstream color enum |
| The hint overlay is part of the render cache's diff key | spec: The hint overlay is part of the render cache's diff key |
| The tile mark travels with its tile, marking the landing cell and not the vacated one while the hinted slide plays | spec: The tile mark travels with the tile during a slide |
| The destination mark stays on its cell, without the animation's offset | spec: The destination mark stays on its cell during a slide |
| Scenario: a hint repaints on a board that did not otherwise change | spec: The hint overlay is part of the render cache's diff key |
| Scenario: the tile mark travels with the tile mid-slide | spec: The tile mark travels with the tile during a slide |
| Scenario: the destination mark stays put mid-slide | spec: The destination mark stays on its cell during a slide |

## Netslide solves from the generator's grid when it has one

| Rule | Where it went |
| --- | --- |
| There is no deduction solver, and `solve` replays `aux` or else recovers the grid from the board | spec: Netslide solves from the generator's grid when it has one |
| Netslide does not implement `findMistakes`, since every reachable board is legal | spec: Netslide has no mistake check |
| Check & Save degrades to a plain quick-save | untrue: `check()` in `src/engine/midend.ts` still asks the hint whether the position is a dead end or out of reach, so what holds is that no mistake is flagged, which "Netslide has no mistake check" states |
| Scenario: Solve on a freshly generated game | spec: Netslide solves from the generator's grid when it has one |

## Netslide draws its tiles on a quiet surface

| Rule | Where it went |
| --- | --- |
| A tile's face is the cell surface inside the surface's grid line, a wall keeps its color and weight, no bevel, and a moving tile is drawn as one at rest | spec: Netslide draws its tiles on a quiet surface |
| The completion flash lifts a tile to the lifted surface on its lit beats | spec: The completion flash lifts the tiles |
| The slide arrows stay on the board, outlined in ink | spec: A slide arrow sits beside every line that slides |
| A wire and an endpoint are drawn at Net's weight, and a powered wire is a colored core inside the ink | spec: The network is drawn at Net's weight |
| Scenario: the network is as heavy as Net's | spec: The network is drawn at Net's weight |
| Scenario: a tile's face is the cell surface | spec: Netslide draws its tiles on a quiet surface |
| Scenario: the flash lifts the tiles | spec: The completion flash lifts the tiles |
