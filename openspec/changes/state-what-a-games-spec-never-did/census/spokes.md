# spokes

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: one character a cell, `0`–`8` or `X`, no runs | stated | "Spokes descriptions use one clue character per cell" |
| desc | what the parser refuses: too short, too long, a character that is neither a clue digit nor `X` | stated | "A Spokes description is validated against the board's cells" |
| desc | what an `X` hole does that a `0` does not | gap | "An X hole also blocks the diagonals that pass its corners" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | that the string carries width, height and difficulty | stated | "Spokes' parameters" |
| params | the `h` letter of the top tier | stated | "Spokes' top tier is named Unreasonable" |
| params | `{w}x{h}`, the square shorthand, the `d` letter with `e` and `t`, what the short form leaves out | gap | "Spokes' params write the difficulty as d and a letter" (new) |
| params | a missing `d` reads as Easy; a `d` with no tier letter is refused | gap | "Spokes' params write the difficulty as d and a letter" (new) |
| params | refusal: width or height below 2 | stated | "Spokes' parameters" |
| params | refusal when dealing: `Unreasonable` on eight squares or fewer, or two squares wide | stated | "Spokes' parameters" |
| pref | `mark-satisfied`: what it changes | stated | "The satisfied-hub marking is visual only and can be turned off"; "Spokes marks hubs whose spoke count is met" |
| pref | `mark-satisfied`: its key, its name and that it starts on | gap | "The satisfied-hub preference is mark-satisfied and starts on" (new) |
| control | a click on a dot draws or clears a line; a right-click marks it unused or clears it | gap | "A press on a hub aims at the dot it points toward" (new) |
| control | a left drag between hubs toggles a line, a right drag a mark | stated | "Spokes is played by dragging between hubs or with a keyboard cursor" |
| control | how a press or a drag picks its spoke, and where it picks none | gap | "A press on a hub aims at the dot it points toward" (new) |
| control | either gesture clears a spoke that holds a line or a mark | stated | "Spokes is played by dragging between hubs or with a keyboard cursor" |
| control | a diagonal line rules its crossing out, and the crossing is inert | stated | "A diagonal line automatically rules out its crossing"; "A line cannot cross a diagonal line" |
| control | the keyboard cursor on the half-grid; Enter draws, Space marks | stated | "Spokes is played by dragging between hubs or with a keyboard cursor" |
| control | the first select key on a hidden cursor only shows it; a press parks the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the cursor on a hub's center addresses no spoke | not-owed | `engine-input`: "A target and its cursor belong to the geometry" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `twoOnes` | stated | "Spokes explains why each hinted move is forced" |
| hint | rung `saturation` | stated | "A deduction that forces several spokes is one journey" |
| hint | rung `exhaustion` | stated | "A deduction that forces several spokes is one journey"; "A Spokes hint prefers a connection and never hints a useless rule-out" |
| hint | rung `contradiction`, at its bounded strength only | stated | "Spokes explains why each hinted move is forced"; "Spokes' hint stops at bounded reasoning" |
| hint | the order the techniques are tried in | gap | "Spokes' hint tries its techniques in one order" (new) |
| hint | what a step says | stated | "Spokes explains why each hinted move is forced"; "A deduction that forces several spokes is one journey" |
| hint | what a step marks | gap | "A Spokes hint shows a line to draw and marks a dot to rule out" (new) |
| hint | a plan recomputed after a step goes on with the same deduction | stated | "A Spokes hint plan is stable across recomputation" |
| hint | refusal when deduction and the bounded look-ahead run out | stated | "Spokes' hint stops at bounded reasoning" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- **The test that an `X` carves a wider hole than a `0` does not compare the
  two.** `src/games/spokes/spokes.test.ts` ("carves a wider hole for 'X' than
  for '0'") loads `010111111` and `0X0111111` and compares a neighbor's spoke
  count: the first has a hub where the second has the hole, so the count
  differs whether or not `X` does more than `0`. On that board the two top
  corners are holes already, so `0X0111111` and `000111111` give the same
  spokes; run through `newState`, both did. A board with hubs in the corners
  beside the hole shows the difference (the hub below the hole keeps its two
  upward diagonals under `0` and loses them under `X`), and no test or
  `facts.json` string is one. The new requirement's scenario quotes the
  test's string and says the rest in words. The rest was run: on `1X1111111`
  the middle hub has no spoke toward either top corner and the top-left hub
  only its downward one, and on `101111111` the middle hub has both and the
  top-left hub its diagonal as well.
- `hint()` in `src/games/spokes/index.ts` refuses with `PUZZLE_NOT_REASONABLE`
  when the clues alone do not deduce one solution at the top tier. The spec's
  Purpose says the hint "refuses a position it cannot vouch for" and no
  requirement says so. `engine-params` "A board loads only if the game's own
  solver solves it" keeps such a board from loading, so the branch is one no
  loaded board reaches, and no requirement was written for it.
- The hint plans with the bounded look-ahead on every board, an Easy one
  included (`deduceSpokesPlan`'s default in `src/games/spokes/solver.ts`). An
  Easy board never needs it, so nothing a player sees follows.
- `choice(…, "d", …)` is given `invalid` in `src/games/spokes/state.ts`, so a
  `d` with an unknown letter is refused where Slant reads it as Easy. See
  `census/slant.md`.
