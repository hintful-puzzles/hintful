# mosaic

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a digit a shown number, a letter a run of hidden squares | stated | "Mosaic descriptions are run-length clue grids" |
| desc | what the parser refuses: another character, a length other than `w·h` | stated | "Mosaic descriptions are run-length clue grids" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `h{0\|1}` segment and the `d` letter with `e` and `u` | stated | "Mosaic's parameters and their encoding" |
| params | what the short form leaves out: `h` and the difficulty | stated | "Mosaic's parameters and their encoding" |
| params | a bare `{w}` being square | not-owed | `engine-params`: "The codec grammar is a prefix, tagged segments, flags and letters" |
| params | refusal: a side under 3, more than 10000 squares | stated | "Mosaic's size limits" |
| params | refusal: a long thin board, when dealing | stated | "Mosaic rejects board shapes it cannot generate" |
| params | refusal: aggressive Unreasonable past 900 squares | stated | "Aggressive Unreasonable generation is bounded on its own measurements" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a press cycles the square; the right button and Space go the other way round | stated | "A Mosaic toggle cycles a mark and a paint fills only unmarked cells" |
| control | a drag on from a press | stated | "A Mosaic press toggles a cell and a drag repeats it" |
| control | a finished board takes only cursor movement | stated | "A Mosaic press toggles a cell and a drag repeats it" |
| control | Enter and Space at the cursor, and the first select key only showing it | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the arrows move and reveal the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rungs `met` and `needsAll`: one number alone | gap | "One Mosaic number alone settles its block" (new) |
| hint | rungs `needsMore` and `sameNeed`: what two numbers compared conclude | stated | "Mosaic's deduction compares two numbers whose blocks overlap" |
| hint | what a comparison says and marks | stated | "Mosaic's hint says a comparison of two numbers" |
| hint | the order: one number before two | stated | "Mosaic's deduction compares two numbers whose blocks overlap"; "Mosaic's hint stops where the rule does" |
| hint | the order within each: which number, and which other number | gap | "Mosaic's hint asks the numbers in reading order, and the nearest pair first" (new) |
| hint | the refusal where nothing is forced | stated | "Mosaic's hint stops where the rule does" |
| words | the status bar | gap | "The Mosaic status bar counts the numbers left" (new) |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/mosaic.md:36-39` gives the two single-number ideas as
`src/games/mosaic/deduce.ts:112-126` has them, and
`help/games/mosaic.md:45-52` the two comparisons as
`src/games/mosaic/deduce.ts:130-169` has them.

## Notes

- **The spec names the two single-number steps only as "one number at a
  time" and "upstream's rule".** Four requirements lean on that phrase
  ("Mosaic generates deduction-solvable boards", "Mosaic's hint stops where
  the rule does", "Mosaic's rule says when a block cannot meet its number",
  "Mosaic's deduction compares two numbers whose blocks overlap") and none
  said what the rule concludes. The new requirement is where it is said.
- The help says a dealt Easy puzzle "never needs a comparison"
  (`help/games/mosaic.md:54-55`), and "A pasted Mosaic board opens at the
  difficulty it needs" opens a board the comparison finishes as Easy. Both
  hold: the generator deals at Easy only what one number at a time finishes,
  and a pasted board is graded by the whole deduction.
- The hint's color word ("purple") is the engine's name for the shaded piece
  (`SHADED_NAME`), and the scenarios quote the sentences as run 2026-10-11.
