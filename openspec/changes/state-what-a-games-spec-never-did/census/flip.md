# flip

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: matrix, comma, lights, in hex | gap | "Flip descriptions are two hex strings" (new) |
| desc | what `newState` refuses | gap | "Flip descriptions are two hex strings" (new) |
| params | `WxH`, and a bare `W` as a square | stated | "Flip's params encoding" |
| params | the `c` / `r` letter, left out of the short form | stated | "Flip's params encoding" |
| params | refusals: a width or height below 1, a size too large | stated | "Flip refuses a size it cannot use" |
| params | the Custom dialog's Game mode field | stated | "Flip's rulesets are Crosses and Random" |
| pref | none of the game's own (`prefs` is absent) | not-owed | `ts-engine`: "The engine supports per-game user preferences" |
| control | a click on a square | stated | "A press flips the square and its matrix-defined neighbors" |
| control | a press on a square that flips nothing | gap | "A square that flips nothing takes no press" (new) |
| control | the arrows, and Enter or Space on the cursor's square | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the secondary button, a held finger | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| hint | `lastChance`: the last square in reading order that flips an unlit square | stated | "A press that is an unlit square's last chance is said as a deduction" |
| hint | `fromTheAnswer`: a press the order does not decide | stated | "A press the order does not decide is offered as one of the fewest" |
| hint | `lastPress`: the press that finishes the board | stated | "The last press says it finishes the board" |
| hint | the order: reading order over the shortest answer, the last press first among the kinds | stated | "Flip's hint presses the shortest answer in reading order and says what forces each press", "The last press says it finishes the board" |
| hint | the refusal on a board no presses light | stated | "The hint refuses a board no set of presses lights" |
| words | the status bar's move count | stated | "Flip's status bar counts the moves" |
| words | what the count is after Solve | gap | "Solve counts a move for each square it presses" (new) |
| words | the preset titles | not-owed | `engine-params`: "The preset menu gives each ruleset a section" |

## Defects

None.

## Notes

- `openspec/specs/flip/spec.md`, "Flip's solver finds a shortest set of
  presses", says Solve presses the answer "in one move". That is one step of
  the history; `executeMove` adds one to `moves` for each press
  (`src/games/flip/index.ts`, the `solution` arm), which the new requirement
  states. The two do not contradict, and a reader of the first alone would
  expect the count to rise by one.
- The square with an empty matrix row was run by the reviewer on a
  description composed for the run and quoted in no scenario,
  `0074191345d1644c17058,5d0` under `3x3c` (the Crosses matrix with the
  top-left square's row cleared). Through the midend, Enter on that square
  makes no move: the bar stays `Moves: 0` and nothing can be undone, where
  Enter one square to the right gives `Moves: 1`. No test of Flip opens such
  a description.
- The bar after Solve reads `Auto-solved. Moves: 5` and after the undo
  `Auto-solver used. Moves: 0`: the words before `Moves:` are the midend's
  (`ts-engine`, "The status bar's completion words come from the engine").
