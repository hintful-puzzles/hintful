# sokoban

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description's shape: row-major runs of a cell character and a count, and the kinds of cell | stated | "Sokoban descriptions use the upstream run-length encoding" |
| desc | the letters `s`, `w`, `t`, `b`, `f`, `p`, `d`, `u`, `v`, `A`–`Z`, and the least count | gap | "Sokoban descriptions spell each cell with a letter" (new) |
| desc | refusals: too much or too little data, no player or more than one, an unknown character | stated | "A Sokoban description is validated against the board" |
| desc | refusal: a count of 0 or 1 | gap | "Sokoban descriptions spell each cell with a letter" (new) |
| desc | a labeled barrel on a target has no place in a description | stated | "Sokoban's Solve finishes from the player's position, or else from the dealt board" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, a bare number as a square, nothing left out of the short form | stated | "Sokoban's parameters are a width and a height" |
| params | refusal: width or height below 4 | stated | "Sokoban's parameters are a width and a height" |
| params | refusal: more than 1200 squares, only when dealing | stated | "Sokoban deals no level past the area its search can open" |
| control | a tap or click walks and never pushes | stated | "A tap walks the player and never pushes" |
| control | a drag from a barrel, or from the player toward a barrel beside them; the arrow; letting go where it started | stated | "A drag pushes a barrel as far as it reaches" |
| control | the arrow keys step and push | stated | "Sokoban's keys step the player one cell at a time" |
| control | the digits `1`–`9` but `5` step in eight directions; a diagonal only walks | stated | "Sokoban's keys step the player one cell at a time" |
| control | the right button and a held touch | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| control | a drag in flight when the board changes | not-owed | `engine-input`: "A board change from outside the input ends the gesture in flight" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | the search, the push offered, and what keeps or drops a step | stated | "Sokoban's hint offers one push, set against the barrel's other pushes"; "The push Sokoban's hint offers shortens the plan" |
| hint | rung `trap` (the striped push) | stated | "A Sokoban hint step leads with a push that would leave a barrel stuck" |
| hint | rungs `only`, `onlyThese`, `alsoThese` (what the judging settled) | stated | "A Sokoban hint step says only what judging the barrel's other pushes settled" |
| hint | rung `fillFirst` | stated | "The hint says a target must be filled first only where another would wall it off" |
| hint | rung `clearsWay` | stated | "The hint says a barrel is in another's way only where moving it alone opens the way" |
| hint | rungs `onTarget`, `freesYou` | stated | "A Sokoban hint step with nothing judged says what its push does" |
| hint | rung `run` | stated | "A barrel's run of pushes onto a target is one journey" |
| hint | rung `plain` (the push alone) | gap | "A Sokoban hint step with nothing to say names only its push" (new) |
| hint | the order: the trap, the judging, the order of the barrels, the target, the way out, the run | stated | "A Sokoban hint step leads with a push that would leave a barrel stuck"; "A Sokoban hint step says only what judging the barrel's other pushes settled"; "A Sokoban hint step with nothing judged says what its push does"; "Sokoban's hint says what a push does to the order the barrels go home in"; "A barrel's run of pushes onto a target is one journey" |
| hint | what a step marks: the ringed push, the striped push, the arrows, the outlined barrel or target | stated | "A Sokoban hint step leads with a push that would leave a barrel stuck"; "A Sokoban hint step says only what judging the barrel's other pushes settled"; "The hint says a target must be filled first only where another would wall it off" |
| hint | refusals: a stuck barrel, no line from here, past the search's reach | stated | "Sokoban's hint refuses a position it cannot finish" |
| hint | refusal on a finished board | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- Sokoban has no preference (`facts.json`: `prefs: []`), so the census has no
  `pref` row.
- The order of the hint's sentences is stated across five requirements and by
  none in one place. Each says what it comes after ("Where no trap leads",
  "Where no trap leads and the judging settled nothing"), so the order can be
  read off them, and the new requirement closes the list at its end.
- A run is looked for only where the offered push is the plan's first
  (`src/games/sokoban/hint.ts`, where `runHome` is called): a push the hint
  offers in its place, as the shorter line, is never told as a run. "A
  barrel's run of pushes onto a target is one journey" does not say so; the
  new requirement on the push alone does.
- The description strings were run through `newState`: the dealt level puts
  the player at the ninth column of the fifth row, and `w13` written `w1`,
  `w0` or `w121` is each refused as a number out of range.
- The help says a tap walks "the shortest way round". The move a tap makes
  names only the square (`src/games/sokoban/state.ts`, the walk move), and the
  spec says "by any way round"; the route is the animation's. Nothing a player
  can check differs.
