# Ledger: sokoban

Base: bb004490

Where every rule of Sokoban's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Sokoban game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/sokoban/` implements `Game` and is registered | spec: Sokoban game implements the Game interface |
| Rectangular boards by width and height, both at least 4, with presets 10×12, 12×16 and 16×20 | spec: Sokoban's parameters are a width and a height |
| The presets are upstream's sizes, turned to draw taller than wide | history |
| It implements `solve` and `hint`, both by searching within a budget | spec: Sokoban game implements the Game interface |
| It does not implement `findMistakes`, with the reason, and Check & Save asks the hint whether the position is a dead end | spec: Sokoban game implements the Game interface |
| Scenario: a new game produces a solvable board | spec: Sokoban game implements the Game interface |
| Scenario: parameters round-trip, and a bare number is a square board | spec: Sokoban's parameters are a width and a height |

## Sokoban descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| Row-major run-length encoding of a cell character and an optional repeat count | spec: Sokoban descriptions use the upstream run-length encoding |
| The alphabet covers the terrain, the barrel, the player and labeled capital-letter barrels, so hand-authored levels are supported | spec: Sokoban descriptions use the upstream run-length encoding |
| The alphabet covers a labeled barrel's on-target form | untrue: `DESC_LETTERS` in `src/games/sokoban/state.ts` is `[swptdbfuvA-Z]` and its comment says a labeled barrel's on-target control character has no place in an ID, so a description cannot write a labeled barrel on a target |
| Validation rejects a wrong cell count, telling too much from too little, no player or more than one, and unknown characters | spec: A Sokoban description is validated against the board |
| Scenario: a generated description round-trips | spec: Sokoban descriptions use the upstream run-length encoding |
| Scenario: a description of the wrong length is rejected | spec: A Sokoban description is validated against the board |
| Scenario: a description with no player is rejected | spec: A Sokoban description is validated against the board |

## Sokoban movement, pushing and completion

| Rule | Where it went |
| --- | --- |
| The cursor keys and the bare number keys move the player one cell, an orthogonal key move into a barrel pushes it, and a diagonal moves the player only under the NetHack rule | spec: Sokoban's keys step the player one cell at a time |
| A tap or click on a reachable square walks there by any way round as one move and never pushes | spec: A tap walks the player and never pushes |
| A drag previews its push and makes it on release as one move, from the player or from a barrel, one square for each tile reached, and makes no move let go where it started or off the board | spec: A drag pushes a barrel as far as it reaches |
| An illegal move produces no state change and no history entry, and undo and redo are the engine's with no game-specific state | spec: An illegal Sokoban move leaves no history |
| A barrel pushed onto a target is filled, into a pit fills it, and into a deep pit is consumed while the deep pit remains | spec: A pushed barrel fills a target or a pit |
| Completion is when the board cannot become more complete, so levels with spare barrels or pits still complete | spec: Sokoban is complete when the board cannot become more complete |
| Scenario: pushing a barrel onto its target | spec: Sokoban's keys step the player one cell at a time |
| Scenario: a push blocked by a wall is rejected | spec: Sokoban's keys step the player one cell at a time |
| Scenario: the last barrel onto a target completes the level | spec: Sokoban is complete when the board cannot become more complete |
| Scenario: a tap walks and never pushes | spec: A tap walks the player and never pushes |
| Scenario: a drag from the player pushes as far as it reaches | spec: A drag pushes a barrel as far as it reaches |
| Scenario: a drag from a barrel walks round and pushes | spec: A drag pushes a barrel as far as it reaches |

## Sokoban rendering

| Rule | Where it went |
| --- | --- |
| Each cell is drawn as its content over grid lines drawn once on the ground the midend lays, the floor is the cell surface and the grid its grid line, and the board flashes on completion | spec: Sokoban rendering |
| A barrel is the color for a thing the player pushes and a square, told from the player by shape, and its letter is white in both schemes | spec: A barrel is a square in the color for a thing the player pushes |
| A wall has no bevel, is a gray a clear step off the floor in both schemes, and touching walls are one mass | spec: A wall is a flat gray block, and walls that touch are one mass |
| A target is a ring in the color for where the player is going, as wide inside as a barrel | spec: A target is a ring in the color for where the player is going |
| A move animates along its route with the pushed barrel, briefly, an undo plays it backward, and a change that moves more than one barrel is shown at once | spec: A Sokoban move animates along the route it walks |
| Scenario: a completed board flashes | spec: Sokoban rendering |
| Scenario: a labeled barrel shows its letter | spec: A barrel is a square in the color for a thing the player pushes |
| Scenario: a push animates the walk to it, then the push | spec: A Sokoban move animates along the route it walks |
| Scenario: a wall is a flat block | spec: A wall is a flat gray block, and walls that touch are one mass |
| Scenario: a barrel on a target is ringed in the target's color | spec: A target is a ring in the color for where the player is going |

## Sokoban generation is deterministic

| Rule | Where it went |
| --- | --- |
| A reverse-move generator over the shared seeded RNG, so a seed always produces the same board, and a level is generated exactly as upstream generates it | spec: Sokoban generation is deterministic |
| The board dealt is the first level of the seed's stream the hint's search finishes from its opening within a fixed budget | spec: Sokoban deals the first level its hint's search can finish |
| A deal generates no more levels than the area fixes, eight at every menu size and more on a larger board, and deals the last as generated where the search finishes none before it | spec: A Sokoban deal generates a bounded number of levels |
| Scenario: the same seed reproduces the same board | spec: Sokoban generation is deterministic |
| Scenario: a level past the deal's budget is passed over | spec: Sokoban deals the first level its hint's search can finish |
| Scenario: a deal ends where the search finishes no level | spec: A Sokoban deal generates a bounded number of levels |
| Scenario: a larger board is given more levels | spec: A Sokoban deal generates a bounded number of levels |

## Sokoban's hint offers one push, set against the barrel's other pushes

| Rule | Where it went |
| --- | --- |
| The hint searches for a finishing line and offers one push with the walk to it, played by a drag of the barrel, and walking keeps the step, the push completes it, any other push drops it | spec: Sokoban's hint offers one push, set against the barrel's other pushes |
| The plan is the search's line, or the remainder of the line after its first push where that comes straight back and is the shorter | spec: The push Sokoban's hint offers shortens the plan |
| The offered push is one after which the search's line is shorter than the plan, wherever some push is | untrue: `hint` in `src/games/sokoban/hint.ts` looks for such a push only until `ALLOWANCE` positions are spent on the request, and offers the plan's first push where it found none. Restated so in spec: The push Sokoban's hint offers shortens the plan |
| A step leads with another push of the same barrel that would leave a barrel stuck for good, striped | spec: A Sokoban hint step leads with a push that would leave a barrel stuck |
| Otherwise it judges the barrel's other pushes through `judgeRivals` and says only what the judging settled | spec: A Sokoban hint step says only what judging the barrel's other pushes settled |
| Otherwise it says what the push does to order, else whether it puts the barrel on a target, else whether it lets the player out, the last only where the push opens at least four times as many squares | spec: A Sokoban hint step with nothing judged says what its push does |
| The hint refuses, outlining the barrel, on a barrel already stuck for good, with `NO_SOLUTION_FROM_HERE` where no line finishes and `SEARCH_OUT_OF_REACH` past its reach | spec: Sokoban's hint refuses a position it cannot finish |
| Scenario: a push that would corner the barrel is striped | spec: A Sokoban hint step leads with a push that would leave a barrel stuck |
| Scenario: following the hint never returns to a position | spec: The push Sokoban's hint offers shortens the plan |
| Scenario: a line that comes straight back does not send the barrel back | spec: The push Sokoban's hint offers shortens the plan |
| Scenario: a stuck barrel is outlined as the reason to undo | spec: Sokoban's hint refuses a position it cannot finish |

## Sokoban's Solve finishes from the player's position, or else from the dealt board

| Rule | Where it went |
| --- | --- |
| Solve searches from the player's position, then from the dealt board, and leaves the finished board, its move carrying that board as a game ID writes it and refused where the walls differ | spec: Sokoban's Solve finishes from the player's position, or else from the dealt board |
| Scenario: a lost position is solved from the dealt board | spec: Sokoban's Solve finishes from the player's position, or else from the dealt board |

## Sokoban's hint says what a push does to the order the barrels go home in

| Rule | Where it went |
| --- | --- |
| Where no trap leads and nothing was judged, a step says one of two things about order, each only where checked, the first before the second | spec: Sokoban's hint says what a push does to the order the barrels go home in |
| That a barrel on another empty target would wall off the target the push fills, what that check is, and only where every target has to be filled | spec: The hint says a target must be filled first only where another would wall it off |
| That this barrel keeps another from a target, the three things checked, and never where the push lets the player out | spec: The hint says a barrel is in another's way only where moving it alone opens the way |
| A run of two to five shortening pushes of one barrel onto a target is given as one journey | spec: A barrel's run of pushes onto a target is one journey |
| Scenario: the far target of a corridor is filled first | spec: The hint says a target must be filled first only where another would wall it off |
| Scenario: a barrel in another's way is pushed aside | spec: The hint says a barrel is in another's way only where moving it alone opens the way |
| Scenario: a barrel's run to a target is one journey | spec: A barrel's run of pushes onto a target is one journey |

## Sokoban's search leaves out only what a finishing line can do without

| Rule | Where it went |
| --- | --- |
| A position is reported lost only where no line finishes, and a line only where it plays to a finished board | spec: Sokoban's search leaves out only what a finishing line can do without |
| It may leave out a position that is lost for good, restated as one of the things a finishing line can do without, which the old title bounds what is left out to | spec: Sokoban's search leaves out only what a finishing line can do without |
| Beside a fenced floor that has to be opened it may search only the pushes into that floor, restated as keeping to those pushes only there | spec: Sokoban's search keeps to the pushes into a fenced floor only where it has to be opened |
| Distance from what is out of place only orders positions, and the budget is counted in positions and never in time | spec: Sokoban's search orders by distance and counts its budget in positions |
| Scenario: the verdicts agree with trying every push | spec: Sokoban's search leaves out only what a finishing line can do without |
| Scenario: only the pushes into a corral that has to be opened are searched | spec: Sokoban's search keeps to the pushes into a fenced floor only where it has to be opened |
| Scenario: a corral that can be left shut prunes nothing | spec: Sokoban's search keeps to the pushes into a fenced floor only where it has to be opened |
| Scenario: a generated level the search once could not finish is within a deal's budget | spec: Sokoban's search orders by distance and counts its budget in positions |
| The level is 16×20, and the search could not finish it within 300,000 positions before pushes were ordered | figure; history |

## Sokoban deals no level past the area its search can open

| Rule | Where it went |
| --- | --- |
| No level is dealt on a board of more than 1200 squares, with a sentence naming the limit and its reason, and only when dealing, a board with its description loading at any size | spec: Sokoban deals no level past the area its search can open |
| Scenario: a board past the limit is refused when dealing | spec: Sokoban deals no level past the area its search can open |
| Scenario: a board past the limit loads from its description | spec: Sokoban deals no level past the area its search can open |
