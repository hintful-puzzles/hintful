# guess

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the obfuscated answer in hex | stated | "Guess descriptions are obfuscated solution bitmaps" |
| desc | what `newState` refuses | stated | "Guess descriptions are obfuscated solution bitmaps" |
| params | `c`, `p`, `g`, then `b`/`B` and `m`/`M` | stated | "Guess's parameters" |
| params | what the short form leaves out (nothing: one form) | stated | "Guess's parameters" |
| params | refusals: colors outside 2 to 10, pegs under 2, guesses under 1 | stated | "Guess refuses params no board can be dealt for" |
| params | refusal: no repeats with fewer colors than pegs | stated | "Guess refuses params no board can be dealt for" |
| pref | none of the game's own (`prefs` is absent) | not-owed | `ts-engine`: "The engine supports per-game user preferences" |
| control | a color key or its digit | stated | "Guess offers one key per color", "A color lands in the selected slot, else the first empty one" |
| control | the tenth color's `0` key | stated | "A color key wears its color and its digit" |
| control | Clear, Backspace, `D` | stated | "Guess's rub-out keys act on the row the frame is on" |
| control | Submit, Enter past the last peg, a tap on the feedback pegs | stated | "The Submit key is always offered and only the panel sends it", "Guess's keyboard cursor is one-dimensional", "Guess's pointer acts on the release" |
| control | a tap on a peg of the working row | stated | "A tap selects a peg of the working row" |
| control | a tap on an answer slot | stated | "Guess marks an answer slot selected as a whole" |
| control | a right click, a held finger, Space: the hold | stated | "A hold stays off the panel" |
| control | Left and Right | stated | "Guess's keyboard cursor is one-dimensional" |
| control | Enter on a peg, the Marks key | stated | "Notes mode is the engine's pencil mode" |
| control | a color key in notes mode | stated | "In notes mode a color key rules its color out" |
| control | `L`, the color numbers | gap | "L numbers the colors" (new) |
| control | `h`, `H` and `?` | stated | "Guess leaves the hint letters to the app" |
| hint | `scoredNothing` | gap | "Three readings come from one scored row alone" (new) |
| hint | `noBlack` | gap | "Three readings come from one scored row alone" (new) |
| hint | `everyPegScored` | gap | "Three readings come from one scored row alone" (new) |
| hint | `noRepeats` | gap | "A settled color is out of the other slots, and forced blacks settle theirs" (new) |
| hint | `blacksForced` | gap | "A settled color is out of the other slots, and forced blacks settle theirs" (new) |
| hint | `blacksAccounted` | gap | "A score the settled slots account for rules out the rest" (new) |
| hint | `totalAccounted` | gap | "A score the settled slots account for rules out the rest" (new) |
| hint | `onlyAnswer`, `opening`, `probe`, `probeFits`: what the guess step says | gap | "The suggested guess is said in one of four ways" (new) |
| hint | the order of the readings | gap | "Guess's readings are tried in one order" (new) |
| hint | marks first, then the guess; what a mark step marks | stated | "Guess's hint places what the rows prove, then suggests a guess", "A mark step places what one reading proves" |
| hint | the guess fits every score, and its counts are true | stated | "Every plan ends with a probe that could win" |
| hint | the refusals | stated | "Following the hint wins, and the hint refuses only a dead end" |
| words | the status bar: the guess in progress, the repeat it will not take | stated | "Guess says why a row will not go" |
| words | the status bar: ready to submit, won, lost | gap | "Guess's status bar counts the guesses and says how the game ended" (new) |
| words | the preset titles Standard and Super | gap | "Standard and Super are Guess's two named boards" (new) |

## Defects

None.

## Notes

- `statusbarText` (`src/games/guess/index.ts`) writes `Solved in N guesses.`
  on a won board, and the midend prefixes the engine's completion words to
  whatever a game returns (`ts-engine`, "The status bar's completion words
  come from the engine"), so a won board's bar carries both. `ts-engine`'s "No
  game writes the completion words itself" scans for what the words say, and
  this string passes it. Read by the reviewer through the midend on
  `c6p4g10Bm:7ad40e9b`: `COMPLETED! Solved in 3 guesses.` when the answer is
  the third row, `Auto-solved. Solved in 1 guess.` after Solve on the fresh
  board (and `Auto-solver used. Guess 1 of 10` once that is undone), and
  `Out of guesses: the answer is revealed.` after ten wrong rows, where the
  hint and Solve both refuse with `This game is over. Undo to play on, or
  start a new one.` The new requirement's scenarios quote the whole bar. A
  won bar says the board is finished twice over, `COMPLETED! Solved in`,
  which the owner may want one of.
- The color numbers are not in `encodeUi`, so a reload turns them off. The
  help (`help/games/guess.md:31`) offers them for colors that are hard to
  tell apart, which is a need that outlasts a session; a preference would
  keep it. That is a change to what a player sees and is not made here.
- The four leaning readings and the three one-row readings were each seen to
  fire over 400 dealt Standard boards played by the hint. The reviewer saw
  the two the writer had only read. `noRepeats` fired 68 times over 150
  boards dealt under `c6p4g10BM` and played by the hint, reading `The
  outlined slot can only be one color, and no color repeats, so no other slot
  can hold it: the framed color is out.`, with the settled slot outlined and
  no row striped. `probeFits` is the first step of a fresh ten-color,
  five-peg board with repeats on: the guess is `1, 1, 1, 1, 1`, the first
  answer that fits and not the two-of-each opening, and it reads `Only
  guesses that fit every score so far can win. One of them: guess the framed
  colors.` The delta's guess requirement was corrected to say which guess
  that is, and has a scenario for it.
- A row that scored nothing cannot come up under `c6p4g10BM`: four different
  colors of six always share two with the answer.
