# inertia

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a letter a square from `b g m s w S` | stated | "Descriptions encode the grid, and the start square becomes a stop" |
| desc | what `newState` refuses | stated | "Descriptions encode the grid, and the start square becomes a stop" |
| params | `WxH`, with nothing left out of the short form | stated | "Inertia's parameters" |
| params | a bare `W` as a square | not-owed | `engine-params`: "The codec grammar is a prefix, tagged segments, flags and letters" |
| params | refusals: a dimension below 2, an area below 6 | stated | "Inertia's parameters" |
| pref | none of the game's own (`prefs` is absent) | not-owed | `ts-engine`: "The engine supports per-game user preferences" |
| control | the arrow keys | stated | "All eight directions are reachable from the keyboard" |
| control | the digits `1`–`4` and `6`–`9`, with the number pad or without | stated | "All eight directions are reachable from the keyboard" |
| control | a click on a square away from the ball | stated | "The ball can be swiped in a direction" |
| control | a press on the ball, dragged out and released | stated | "The ball can be swiped in a direction" |
| control | a swipe let go on the ball, or aimed at a wall | stated | "A swipe aimed at nothing makes no move" |
| control | the secondary button, a held finger | stated | "The swipe works on the secondary button" |
| control | a direction into a wall, any move by a dead ball | stated | "A move into a wall, or by a dead ball, is refused" |
| hint | `collect` | stated | "A collecting move names what it sweeps up and what stops the ball" |
| hint | `forced` | stated | "A forced move is called forced, by what forces it" |
| hint | `strands` | stated | "A stranding grab is called out" |
| hint | `declined` | stated | "A positioning move's premise is checked" |
| hint | `positioning` | stated | "A positioning move's premise is checked", "One more slide is promised only when the plan makes it" |
| hint | the order the five are chosen in | stated | "A collecting move names what it sweeps up and what stops the ball" puts collecting first and folds the only-move reason into it; the conditions of the other four requirements cannot hold together |
| hint | which gem a leg goes for, and the fallback | stated | "The hint plans for the nearest gem the ball can safely take", "The route solver's tour is the hint's fallback, never its plan" |
| hint | the marks: the outlined gem, the arrow on the ball | stated | "The hint is drawn as a marked gem and an arrow" |
| hint | the refusals: a dead ball, a gem out of reach | stated | "The hint refuses honestly when the move to make is undo" |
| hint | the refusal where every gem can be reached and the route solver finds no route | gap | "Inertia's hint refuses in Solve's words where no route is found" (new) |
| words | the status bar: `Gems:`, `DEAD!`, `Deaths:` | stated | "Inertia's status bar" |
| words | the preset titles | not-owed | `engine-params`: "A preset leaf carries a label and a title" |

## Defects

- **The help names two refusals and the hint has three.**
  `help/games/inertia.md:46` says the hint refuses "if the ball is dead, or
  has already left a gem where it can never be reached", and that it circles
  the gems it can no longer reach. `src/games/inertia/hint.ts:313` also
  refuses, with `No solution can be found from this position. Undo, and try
  from an earlier one.` and no gem circled, where every gem can be reached
  and `solveRoute` finds no route. The new requirement states it.

## Notes

- A requirement on the order of the hint's five sentences was drafted and
  withdrawn. `narrate` in `src/games/inertia/hint.ts` tests forced before the
  grab, but the two cannot both hold: `onlyMove` is true only when every other
  direction is walled or fatal, and `oneSlideGrab` counts only a slide that
  does not kill the ball, so an only move has no grab to speak of. The four
  existing requirements already decide every case.
- `hint` had two refusals no requirement named. The reviewer ran both down.
  `NO_SOLUTION_FROM_HERE` is not behind `hasNoSolution`: that answers only a
  gem no move passes over, and the route solver asks more, a way out to each
  gem and back (`growTour` in `src/games/inertia/solver.ts`). It is reached
  on a hand-typed board, composed for the run and quoted in no scenario:
  `7x3:mbmbmbmbbbSbbbgwbbbwg` has two gems, each in a pit, and a fresh hint
  refuses with that sentence, Check & save answering a dead end; after east
  then south the hint outlines the gem that is left. On dealt boards it was
  not found: none in 41,089 positions, on walks of random slides that avoid
  the mines over 120 boards of `8x10` and `12x15`, each walk stopped at the
  first gem out of reach. A dealt board's gems can each be come back from to
  the start, which is why it is rare there; the walk shows no more than that.
- **A bug to file against the game: the route solver refuses a board that is
  two slides from won.** On the hand-typed `4x3:bmbmSbbbbbwg` the one gem
  lies in a pit, the slide that collects it wins, and the hint, Solve and
  Check & save all say `No solution can be found from this position. Undo,
  and try from an earlier one.` on the fresh board, where there is nothing to
  undo; east then south reads `COMPLETED!`. The tour must come home even from
  the last gem. It contradicts the tree's "The hint refuses honestly when the
  move to make is undo" and "Solve plays a computed route to the finished
  board", which errors only "when some remaining gem is unreachable". The new
  requirement states what the hint says when the route solver finds no
  route, and its scenario is a board on which that is true. That the solver
  finds none on this board is the bug, and no requirement says it should.
- `NO_MOVE_WORTH_MAKING` is a backstop no board reaches: `hint` has already
  seen `solveRoute` succeed, so the fallback leg exists, and a board with no
  gem left is answered by the midend first. No requirement is owed.
