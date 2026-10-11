# abcd

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: `(w + h) × n` comma-terminated clue numbers, rows then columns, `-` a hidden clue | stated | "ABCD descriptions use the edge-clue encoding" |
| desc | what the parser refuses: too few or too many clues, a clue above `1 + width / 2` or `1 + height / 2`, another character | stated | "An ABCD description is validated against its clue count and its lines" |
| desc | a board with several answers or none | stated | "A pasted ABCD board opens at the difficulty it needs" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `WxH`, a bare number being square | not-owed | `engine-params`: "The engine provides a shared dimension param parser" |
| params | the `n` letter and the `D` letter | gap | "ABCD params are written as the size, n with the letter count, and D for no diagonal touching" (new) |
| params | the `R` letter, `de` / `du`, and that the short form leaves both out | stated | "ABCD's generation-time settings are in the full encoding only" |
| params | a string with no difficulty letter | stated | "ABCD's generation-time settings are in the full encoding only" |
| params | refusal: width or height under 2; letters under 3, over 9, or under 5 with no diagonal touching | stated | "ABCD's parameters" |
| params | refusal: a size past the measured bound, when dealing | stated | "ABCD refuses board sizes it cannot generate"; "The bound is measured across size, shape and letter count" |
| params | refusal: Unreasonable at nine squares or fewer, two wide with no diagonal touching, or past its own bound | stated | "ABCD refuses Unreasonable where none of a size's boards needs it"; "Unreasonable is bounded on its own measurements" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| control | click to select; a letter key, or a digit `1` to `9` up to the letter count, enters it; Backspace, Space and `0` clear | stated | "ABCD enters a letter into the selected cell" |
| control | clearing a cell that holds only marks | stated | "Clearing an ABCD cell that holds only marks is a move" |
| control | right-click selects for pencil marks; the sticky mode | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | Enter toggles pencil mode | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | the arrow keys | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | `M`: fill every empty cell's marks, then strike the obvious ones | stated | "ABCD's obvious marks are a touching letter and a letter its line has in full"; the key is `engine-notes`: "The Mark-all action is the M key" |
| control | `requestKeys`: `A` to the board's last letter, and Clear | gap | "ABCD's keypad offers the board's letters and Clear" (new) |
| hint | rungs `populate`, `clean`: the setup | not-owed | `engine-candidate-hints`: "The walk owns the setup"; what the clean strikes is "ABCD's obvious marks are a touching letter and a letter its line has in full" |
| hint | rung `note`: a note-less cell's candidates written for a step that rests on them | not-owed | `engine-candidate-hints`: "The implicit reading writes the notes a firing rests on"; its reach is "ABCD offers an explained hint" |
| hint | rung `dup`: a placed letter struck from the cells it touches | stated | "ABCD offers an explained hint" (the reach); `engine-candidate-hints`: "A placement's cull continues its journey" |
| hint | rung `single`: a cell with one pencil mark left | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | rung `regionsFull`: a note-less cell with every other letter beside it | not-owed | `engine-candidate-hints`: "A note-less single is placed in its own words", read over the reach by "What a placed value rules out may depend on the value" |
| hint | rung `satisfied` | stated | "The satisfied-clue rung strikes a letter from a line that has its count" |
| hint | rung `packed` | stated | "The runs rung places the letters a line's open cells force" |
| hint | the order | stated | "The runs rung is the hint's last resort"; the rest is `engine-candidate-hints`: "The walk owns the ladder" |
| hint | that the two line rungs wait for the notes to be set up, where the walk offers a game's own rungs before the setup | gap | "ABCD's hint reads a line only once the notes are set up" (new) |
| hint | where it stops on an Unreasonable board | stated | "ABCD's hint stops where the ladder does" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the label: the tier's name, "clues hidden", the diagonal rule's words | stated | "ABCD's label names the tier and the hidden clues apart"; "ABCD's menu offers a board under each of its rules" |

## Defects

None.

## Notes

- The `regionsFull` and `note` sentences are ABCD's own words ("Every other
  letter is already beside, above or below this cell", "No letter stands next
  to this cell yet") over a mechanic the engine states. They are counted
  not-owed because what each concludes, and from what, is the engine's
  requirement read over the reach ABCD's spec gives. A session that wants the
  wording held would add it to "ABCD offers an explained hint".
- The help's line on `M` (`help/games/abcd.md:22`) gives the first press
  only, the fill. A press on a board whose empty cells all carry marks strikes
  the obvious ones instead (`src/games/abcd/index.ts:203`), which
  "ABCD's obvious marks are a touching letter and a letter its line has in
  full" and `engine-notes`: "Mark-all is adaptive in a game with an
  obvious-candidate rule" state. The help is short of the code, not against
  it.
