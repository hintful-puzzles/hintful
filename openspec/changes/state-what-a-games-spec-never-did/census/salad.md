# salad

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the sections: border, comma, grid in ABC End View, the grid alone in Number Ball; runs, `X`, `O` | stated | "Salad descriptions use the upstream run-length block encoding" |
| desc | a symbol is a letter in ABC End View and a digit in Number Ball, not an offset from a base per array | gap | "Salad descriptions use the upstream run-length block encoding" (corrected) |
| desc | the symbol characters (`A`-`I`, `1`-`9`), the border's order, what a run letter counts, which grid takes `O` | gap | "A Salad description writes letters in ABC End View and digits in Number Ball" (new) |
| desc | what `newState` refuses: too many or too few entries, a value out of range, an unknown character, a short border | stated | "A Salad description is validated against its arrays" |
| params | the encoding: `{order}n{nums}`, `L` or `B`, the full-form `d` with `e` or `x`; no mode letter reads as ABC End View and no `d` as Easy | gap | "Salad params are a size, n, a symbol count and a mode letter" (new) |
| params | refusals: `order` below 3, `nums` outside 2 to 9, `nums` not below `order` | stated | "Salad's parameters" |
| params | refusal: two symbols at Normal | gap | "Salad refuses two symbols at Normal where no board has it" (new) |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| control | select a square, enter a symbol or a marker, pencil marks | stated | "Salad selects a square and enters a symbol or a marker" |
| control | the keys themselves: digits and letters in either mode and either case, `X` `-` `_`, `O` `+` `=`, `0` and Space | gap | "Salad types a symbol by its letter or its digit in either mode" (new) |
| control | Backspace and Delete clear | not-owed | `engine-input`: "Backspace clears wherever the panel's Clear does" |
| control | an entry on a given, a marker its square contradicts | stated | "Salad refuses an entry on a given, and a marker its square contradicts" |
| control | the keypad: the symbols, `X`, `O`, Clear | stated | "Salad's keypad holds its symbols and the two markers" |
| control | the left and right press, the sticky mode | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | Enter toggles notes mode | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | the arrows move the selection | stated | "Salad selects a square and enters a symbol or a marker" |
| control | Mark all (`M`) | stated | "Salad offers a fill-all-candidates action"; `engine-notes`: "The Mark-all action is the M key" |
| hint | `populate`, `clean` | not-owed | `engine-candidate-hints`: "Candidate-elimination hints clean obvious candidates at populate" |
| hint | `dup`, `single`, `hiddenSingle`, `set`, `forcing` | stated | "Salad's hint narrates the Latin deductions it inherits and needs no fallback" |
| hint | `borderNear`, `borderFar` | stated | "Salad's hint narrates the border clue in its own terms" |
| hint | `countHolesDone`, `countLettersDone` | stated | "Salad's hint narrates the per-line count in its own terms" |
| hint | `crossNaked` | stated | "Salad's hint narrates the hole and symbol synchronization in its own terms" |
| hint | `xNoteGone` | stated | "A set or a chain that rules a square out as empty strikes its mark" |
| hint | `circleXNote` | stated | "Salad's hint strikes a circled square's empty-square mark wherever the circle came from" |
| hint | the order: the walk's ladder | not-owed | `engine-candidate-hints`: "The walk owns the ladder" |
| hint | the order of the game's own steps, and that they come before any pencil mark | gap | "Salad's hint counts a line before it asks for pencil marks" (new) |
| hint | how the empty-square mark is printed | stated | "Salad's hint prints the \"might be empty\" mark as X" |
| words | the status bar: the symbol range | gap | "Salad's status bar shows the range of its symbols" (new) |
| words | the preset label's `A~C` and `1~3` | gap | "Salad's status bar shows the range of its symbols" (new) |
| words | the menu's Letters and Numbers sections | not-owed | `engine-params`: "The preset menu gives each ruleset a section" |

## Defects

None.

## Notes

- "Salad's parameters" says a game ID "SHALL encode the size, symbol count,
  mode and difficulty" and gives no letter of it. The new requirement gives
  the string.
- "Salad descriptions use the upstream run-length block encoding" said a
  symbol is "a character offset from a per-array base". The parser reads
  letters in both of an ABC End View description's sections and digits in a
  Number Ball one, so the base is per mode and not per array: `CfABcBc,1o` is
  refused at its `1` as a `4n3L` board, and `cBb1aOXbXb3c1OOc` at its `B` as a
  `5n3B` one. The requirement is restated under `## MODIFIED Requirements`
  with those words corrected and nothing else changed. It still lists `O`
  among what a description holds without saying that an ABC End View grid
  refuses one; the new requirement says that.
- The order requirement states where Salad's own steps sit in the walk's
  ladder. Which available firing is shown next is the engine's
  (`engine-candidate-hints`: "The walk owns the ladder", "A candidate hint
  plan continues from its latest steps where it can"), so after the candidates
  are penciled in a count can come after a single. Not every Number Ball board
  opens on a count: `5n3Bdx:c2b1aOXbXb3c1OOc` opens by penciling in.
- A params string with no mode letter (`5n3`) decodes as ABC End View, the
  default preset's mode, and its full encoding is `5n3Lde`. The params
  requirement now says so.
- The keys `-`, `_`, `+`, `=` and `0`, and a letter typed on a Number Ball
  board (or a digit on an ABC End View one), are not on the help page. They
  are upstream's, and the help is not wrong, only shorter.
- "Salad offers a fill-all-candidates action" is one sentence with no key in
  it. The key and the adaptive second press are the engine's.
