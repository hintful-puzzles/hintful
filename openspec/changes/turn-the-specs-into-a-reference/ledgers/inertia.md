# Ledger: inertia

Base: bb004490

Where every rule of Inertia's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters. Two of the old
titles hold a semicolon, which this format reads as the separator between two
destinations, so those two requirements carry a comma in its place.

## Inertia game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `inertia` game implementing `Game`, its grid of five cell kinds, one ball starting on a stop-square, won when every gem is collected | spec: Inertia game implements the Game interface |
| A move slides the ball in one of eight directions until a stop-square or a wall, collecting gems and dying on a mine | spec: The ball slides until it is stopped |
| Params are `w` and `h`, with three presets | spec: Inertia's parameters and presets |
| The presets are upstream's sizes turned to draw taller than wide | history |
| It provides `solve`, `textFormat`, `statusbarText` and `hint` | spec: Inertia game implements the Game interface |
| It does not implement `findMistakes`, with its reason | spec: Inertia has no mistake check |
| Check & save degrades to a plain quick-save | untrue: `canCheck` in `src/engine/midend.ts` is true for a game with a `hint`, so Check & save runs the check and a dead end (a dead ball, a stranded gem) refuses the save |
| Scenario: params round-trip | spec: Inertia's parameters and presets |
| Scenario: an area below 6 squares is rejected by `validateParams` | spec: Inertia's parameters and presets |
| Scenario: `validateParams` rejects a dimension below 2 | untrue: `validateParams` in `src/games/inertia/state.ts` tests only the area. The floor of 2 is the `bounds` of `paramConfig`, which the engine's `paramsError` refuses before it |

## The ball slides until it is stopped

| Rule | Where it went |
| --- | --- |
| `executeMove` moves square by square, collecting, dying and stopping, and the state records the distance traveled | spec: The ball slides until it is stopped |
| `interpretMove` rejects a direction into a wall, and every move while the ball is dead | spec: A move into a wall, or by a dead ball, is refused |
| Scenario: the ball collects gems on the way past | spec: The ball slides until it is stopped |
| Scenario: the ball dies on a mine, and the slide stops there | spec: The ball slides until it is stopped |
| Scenario: no further move is accepted from a dead ball until the player undoes | spec: A move into a wall, or by a dead ball, is refused |
| Scenario: a move into a wall is refused | spec: A move into a wall, or by a dead ball, is refused |

## All eight directions are reachable from the keyboard

| Rule | Where it went |
| --- | --- |
| Arrow keys for the four orthogonals, the number-pad digits for all eight, with or without `MOD_NUM_KEYPAD` | spec: All eight directions are reachable from the keyboard |
| The bare digits are what keeps the diagonals on the keyboard, and Inertia binds no other digit | spec: All eight directions are reachable from the keyboard |
| A deliberate divergence from upstream, which requires the modifier | history |
| This frontend never sets the modifier, so without the bare digits the diagonals are reachable only with the mouse | untrue: `src/puzzle/components/view-interactive.ts` sets `MOD_NUM_KEYPAD` from `event.location === 3`, so a number pad with Num Lock on delivers it. The diagonals are lost only to a keyboard with no number pad or with Num Lock off, which is what the requirement now says |
| Scenario: a diagonal is reachable from the keyboard | spec: All eight directions are reachable from the keyboard |

## The ball can be swiped in a direction

| Rule | Where it went |
| --- | --- |
| A press on the ball begins a swipe, an arrow shows the aimed octant, and release plays it | spec: The ball can be swiped in a direction |
| Aiming yields no direction, no arrow and no move when back on the ball or aimed at a wall | spec: A swipe aimed at nothing makes no move |
| The aim arrow has its own color, distinct from the hint's | spec: The aim arrow has its own color |
| The whole gesture works on the secondary button, with its reason, and Inertia binds nothing else to it | spec: The swipe works on the secondary button |
| The click-an-octant input stays supported | spec: The ball can be swiped in a direction |
| A deliberate divergence, and why upstream's input is fiddly with a finger | history |
| Scenario: holding and dragging aims, and releasing launches | spec: The ball can be swiped in a direction |
| Scenario: dragging back to the ball calls the swipe off | spec: A swipe aimed at nothing makes no move |

## Descriptions encode the grid; the start square becomes a stop

| Rule | Where it went |
| --- | --- |
| The desc is `w · h` characters of the six-letter alphabet, row-major | spec: Descriptions encode the grid, and the start square becomes a stop |
| `newState` puts the ball on the one `S` square, a stop-square thereafter | spec: Descriptions encode the grid, and the start square becomes a stop |
| `validateDesc` rejects a wrong length, an unrecognized character, other than one start square, and no gem | spec: Descriptions encode the grid, and the start square becomes a stop |
| Scenarios: the start square is a stop square, and a desc with no gems is rejected | spec: Descriptions encode the grid, and the start square becomes a stop |

## Rendering, animation and the status bar

| Rule | Where it went |
| --- | --- |
| The floor is the cell surface with its grid line, a wall a flat gray block a clear step off the floor in both schemes, and touching walls are one mass | spec: Inertia's floor and walls |
| Mines, stop-squares, gems and the ball, each in its color, the dead ball a red splat, the ball over a blitter-saved background | spec: Inertia's pieces and ball |
| A move animates the slide in a time proportional to the square root of the distance, each gem going as the ball reaches it | spec: A move animates the slide, and death and the win flash |
| Death flashes the board red and the win flashes it light | spec: A move animates the slide, and death and the win flash |
| The status bar shows the gem count, `DEAD!`, `COMPLETED!` and a deaths tally | spec: Inertia's status bar |
| The tally counts only a death by a move just made on an unfinished board | spec: Inertia's status bar |
| Scenario: undo and redo do not re-count a death | spec: Inertia's status bar |
| Scenario: a wall is a flat block | spec: Inertia's floor and walls |

## The hint plans for the nearest gem the ball can safely take

| Rule | Where it went |
| --- | --- |
| The hint plans in legs, each for the nearest gem the ball can take without stranding itself, a stranding candidate rejected for the next-nearest | spec: The hint plans for the nearest gem the ball can safely take |
| Where the near gems all strand, the tour supplies the leg, its remaining route the witness | spec: The route solver's tour is the hint's fallback, never its plan |
| The plan does not simply follow the tour, because a hint is recomputed when the player goes their own way and two tours can disagree | spec: The route solver's tour is the hint's fallback, never its plan |
| Why the nearest safe gem cannot ping-pong | guide: docs/games/hints.md § "Recompute-stable plans" |
| Scenario: the hint always makes progress | spec: The route solver's tour is the hint's fallback, never its plan |
| Scenario: a stranding grab is not suggested | spec: The hint plans for the nearest gem the ball can safely take |

## The hint explains each move by the gem it is going for

| Rule | Where it went |
| --- | --- |
| Every move is narrated against its leg's gem and claims no more than is verified | spec: The hint explains each move by the gem it is going for |
| The subgoal is the last gem along the leg's final move, and it is marked on the board because gems are anonymous | spec: The hint explains each move by the gem it is going for |
| The subgoal is derived once from the plan and carried, never re-derived per step, with its reason | spec: The subgoal is held stable across its leg |
| Forced: mines are named when mines force the move, walls when walls do, and mines are not spoken of then | spec: A forced move is called forced, by what forces it |
| Collecting: the narration names what the slide sweeps up | spec: A collecting move names what it sweeps up and what stops the ball |
| Collecting: every collecting narration names what brings the ball to a halt | untrue: `say.collect` in `src/games/inertia/hint-text.ts` names the stopper only where the slide is not the ball's only move. Where it is, the sentence gives the walls or mines that force it and the sweep |
| Stranding: whenever a single slide would take the subgoal gem and strand another, the narration says so | untrue: `narrate` in `src/games/inertia/hint.ts` tests for the stranding grab only after the collecting and forced branches, so a suggested slide that itself collects the gem by a safe direction is narrated as collecting |
| Stranding, for a suggested slide that collects nothing | spec: A stranding grab is called out |
| Positioning: every slide that collects nothing says no slide from here reaches the subgoal gem | untrue: `narrate` in `src/games/inertia/hint.ts` says so only when the move is not the ball's only one and `oneSlideGrab` finds none. An only move gets the forced sentence, and a grab it could take and cannot prove a trap gets the `declined` sentence, that the route comes at the gem from another side |
| Positioning: what the move is for, the premise checked, and no claim to be the only such move unless verified | spec: A positioning move's premise is checked |
| One more slide is promised only when it is the plan's own next move | spec: One more slide is promised only when the plan makes it |
| A broken promise reads as a hint that has lost the plot | reason |
| Scenario: a move that collects nothing is explained by what it sets up | spec: The hint explains each move by the gem it is going for |
| Scenario: the subgoal does not change under the player's feet | spec: The subgoal is held stable across its leg |
| Scenario: a forced move is called forced | spec: A forced move is called forced, by what forces it |
| Scenario: the hint never says a gem is out of reach when a slide would take it | spec: A positioning move's premise is checked |

## A hint is a nudge; only Solve is a commitment

| Rule | Where it went |
| --- | --- |
| `hint` does not mark the game solved-with-help, while Solve plays the whole route and is recorded as the solver's | spec: A hint is a nudge, and only Solve is a commitment |
| The separation is the reason the hint exists: a player asking for one nudge does not pay Solve's price | spec: A hint is a nudge, and only Solve is a commitment |
| Scenario: asking for a hint does not brand the game auto-solved | spec: A hint is a nudge, and only Solve is a commitment |
| `hintKeepTrack` completes the step on a move in its direction and keeps the plan, with its reason | spec: Following the hint keeps the plan |
| Scenario: following the hint keeps the plan | spec: Following the hint keeps the plan |
| Scenarios: the hint refuses when the ball is dead, and when a gem is out of reach for ever, and says to undo | spec: The hint refuses honestly when the move to make is undo |

## The hint is drawn as a marked gem and an arrow

| Rule | Where it went |
| --- | --- |
| The subgoal gem is ringed in its own color and the direction is an arrow on the ball | spec: The hint is drawn as a marked gem and an arrow |
| The aim arrow of a swipe takes precedence over the hint's arrow | spec: The hint is drawn as a marked gem and an arrow |
| The aim arrow takes precedence over the ring too | untrue: `redraw` in `src/games/inertia/render.ts` sets the ring from the hint's marks whatever the swipe is doing. Only the arrow gives way, and only while the swipe is aimed in a direction |
| The ring is part of the tile's cache key, with its reason | spec: The hint is drawn as a marked gem and an arrow |
| Scenario: the marked gem is ringed and the direction shown | spec: The hint is drawn as a marked gem and an arrow |

## Generated boards place gems only where the ball can go and come back

| Rule | Where it went |
| --- | --- |
| The fill in fifths with one start square, shuffled, the candidates found, too few rejected, and the gems placed on a shuffled subset | spec: Generated boards place gems only where the ball can go and come back |
| A candidate has some direction reachable both from and back to the start, by two breadth-first searches over square-plus-direction pairs, with why pairs are required | spec: Gem candidates are searched as square-plus-direction pairs |
| A grid with a square further than the relaxing threshold from the nearest candidate is rejected | spec: Generated boards keep their gem candidates spread |
| Scenario: every generated board is completable | spec: Generated boards place gems only where the ball can go and come back |

## Solve plays a computed route to the finished board

| Rule | Where it went |
| --- | --- |
| `solve` computes a route from the current position collecting every remaining gem, and errors when one is unreachable | spec: Solve plays a computed route to the finished board |
| The move graph with its directed gem vertices, the tour grown by splicing detours, and the shortening passes | spec: The route is a tour grown over the move graph |
| The tour is an approximation, and two are grown, nearest and farthest, the shorter kept | spec: The route is the shorter of two tours |
| The solve move plays the whole route, the ball jumps to its end, and the step-by-step aid is the hint's | spec: Solve plays a computed route to the finished board |
| Scenario: a computed route collects every gem | spec: The route is a tour grown over the move graph |
| Scenario: Solve finishes the game | spec: Solve plays a computed route to the finished board |
