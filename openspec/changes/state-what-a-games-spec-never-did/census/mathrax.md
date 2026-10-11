# mathrax

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the two comma-separated run-length parts, givens then clues | stated | "Mathrax descriptions use the run-length grid-and-clue encoding" |
| desc | the run letters `a`..`z`, the clue letters `A S M D E O`, equality as `S0` | gap | "A Mathrax description spells a run in lowercase and a clue in uppercase" (new) |
| desc | refusals: too many squares, a digit above the size, an unknown character, a part that stops short | stated | "Mathrax's reading of a description refuses a malformed one" |
| desc | the range of each clue number; a clue missing its number, a parity clue with one, a missing `,`, trailing text | gap | "A Mathrax clue number is one that two digits of the board can make" (new) |
| desc | `supersededDesc` | not-owed | the game has none |
| params | Size: the leading number, 3 to 9 | stated | "Mathrax refuses a size, a difficulty or a clue-type set it cannot play" |
| params | Difficulty: `d` and the letters `e n t r` | gap | "Mathrax's params are the size, a tier letter and the clue-type letters" (new); only `r` was stated, in "Mathrax's parameters are a size, a difficulty and a set of clue types" |
| params | Addition clues: `A` | gap | "Mathrax's params are the size, a tier letter and the clue-type letters" (new) |
| params | Subtraction clues: `S` | gap | same (new) |
| params | Multiplication clues: `M` | gap | same (new) |
| params | Division clues: `D` | gap | same (new) |
| params | Equality clues: `E` | gap | same (new) |
| params | Even/odd clues: `O` | gap | same (new) |
| params | no letters means all six types | stated | "Mathrax's parameters are a size, a difficulty and a set of clue types" |
| params | what the short form leaves out, and the fixed reading order of the clue letters | gap | "Mathrax's params are the size, a tier letter and the clue-type letters" (new) |
| params | refusal: no clue type enabled, when generating | stated | "Mathrax refuses a size, a difficulty or a clue-type set it cannot play" |
| params | refusal: size 3 at Normal or Unreasonable, when generating | stated | "Mathrax offers only the difficulties a size can support" |
| params | refusal: an unknown difficulty letter | not-owed | `engine-params`: "Params validity is the engine's check" (a choice outside its list) |
| pref | `auto-pencil` | stated | "Mathrax offers the sticky pencil and auto-pencil preferences"; default off is `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| pref | `hint-notes` starts on "Only as needed" (the departure) | stated | "Mathrax's hint plan is the shared candidate-elimination walk" |
| control | left-click selects a cell; a digit enters it; a given takes none | stated | "Mathrax input and keypad" |
| control | Backspace, Space and `0` clear | stated | "Mathrax input and keypad" |
| control | in pencil mode a clear key leaves a filled cell alone | gap | "Mathrax input and keypad" (corrected) |
| control | right-click selects for a pencil mark, or toggles the sticky mode | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for", "The sticky pencil toggle is a mode switch, not a selection" |
| control | arrow keys move the selected cell | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | Enter toggles between numbers and pencil marks | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | `M` fills, then cleans, the pencil marks | not-owed | `engine-notes`: "The Mark-all action is the M key", "Mark-all is adaptive in a game with an obvious-candidate rule" |
| control | keypad: digits 1 to the size and Clear | stated | "Mathrax input and keypad" |
| control | keypad: the Marks key | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| control | `targetVerbs` | not-owed | the game declares none |
| hint | `populate` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| hint | `clean` | not-owed | `engine-candidate-hints`: "Candidate-elimination hints clean obvious candidates at populate" |
| hint | `note` | not-owed | `engine-candidate-hints`: "The implicit reading writes the notes a firing rests on" |
| hint | `dup` | not-owed | `engine-candidate-hints`: "A placement's cull continues its journey" |
| hint | `single` | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | `regionsFull` | not-owed | `engine-candidate-hints`: "A note-less single is placed in its own words" |
| hint | `hiddenSingle` | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | `set` | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises", "A set outlines the cells it rests on" |
| hint | `forcing` | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises" |
| hint | `clue` | stated | "A recorded clue elimination names one clue acting on one cell", "A clue step names its clue and what lies across it", "A clue step outlines the cells that identify its clue" |
| hint | the order the techniques are tried in | not-owed | `engine-candidate-hints`: "The walk owns the ladder" (Mathrax gives the walk no rung of its own; a clue step is a recorded strike) |
| hint | the tier the hint deduces at | gap | "Mathrax's hint deduces at the tier of the board's params" (new); the cap at Tricky was stated, in "The recording solve stops below the guess-and-verify tier" |
| hint | refusal on a mistake, and where deduction runs out | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar | not-owed | the game has none |
| words | a label's words for a restricted clue set ("only addition", "no even-odd") | gap | "A Mathrax label names a restricted clue set by the shorter list" (new) |
| words | preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- `auto-pencil` is offered through one engine helper (`autoPencilPref`) by
  every game that has it, and each game's spec restates that a placement
  strikes its value from its regions' notes. `engine-notes` states only its
  default. The engine could state the key and the behavior once, each game
  keeping only the regions it reaches.
- `engine-notes` and `engine-candidate-hints` state what the sticky,
  keep-highlight and hint-notes preferences do, but only `hint-notes` is named
  there by its key; `sticky-pencil-mode` and `pencil-keep-highlight` appear in
  no engine spec as literals.
- `decodeParams` drops a clue letter that is out of order without refusing
  the string (`6dnDS` loads as division only and re-encodes as `6dnD`). The
  new params requirement states it as it is; whether a string the encoder
  never writes should be refused is the owner's call, and a compatibility
  question.
- The reading accepts a clue number with leading zeros (`A06` reads as `6+`),
  which the encoder never writes. Not stated in the new requirement.
- The help page's Controls section does not mention that `0` clears; the spec
  and the code agree that it does (`src/games/mathrax/index.ts:215`).
- In pencil mode, Backspace, Space and `0` do nothing on a cell that holds a
  digit (`src/games/mathrax/index.ts:222`), where "Mathrax input and keypad"
  says "backspace, space or zero clear" with no exception. The line's comment
  says it is meant, and Keen, Group and Undead do the same, so the sentence
  was what was wrong: a MODIFIED entry restates the requirement with "In
  pencil mode no key SHALL change a cell that holds a digit" and a scenario.
- Run on 2026-10-11: every params and description string the delta quotes,
  through `decodeParams`, `paramsError`, `describeParams`, `validateDesc` and
  `newState`, each meaning what its scenario says (`m1g1c,aS2cS1S3dS0d` is the
  5×5 board `src/engine/warm-repaint.test.ts` holds; the others are
  `facts.json`'s or `src/games/mathrax/mathrax.test.ts`'s). `hint()` was
  followed to the end of three boards dealt at each of `5de`, `5dn` and
  `6dt`: the Easy boards showed no `set` or `forcing` step and every clue
  step of theirs read a single number across the clue, and the Tricky boards
  showed `set`. A board built with the short form's params is hinted at Easy
  and refused partway (12 boards of 12 dealt at `5dn` and `6dt`); a player
  does not reach that, because the midend gives a board loaded from an id its
  own tier (`withBoardTier` in `src/engine/midend.ts`).
