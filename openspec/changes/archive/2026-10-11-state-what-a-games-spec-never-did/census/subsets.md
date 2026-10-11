# subsets

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: one comma-separated token a cell in reading order, a set number or `_`, then arrow letters | stated | "Subsets descriptions use the per-cell arrow encoding" |
| desc | what a set number means | gap | "A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell" (new) |
| desc | which cell of a horseshoe carries the arrow letter, and the order of a cell's letters | gap | "A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell" (new) |
| desc | what `newState` refuses: too many or too few cells, a set number out of range, a missing separator, an unexpected character, an arrow off the grid, two arrows on one edge | stated | "A Subsets description is validated" |
| desc | what `newState` refuses: a set given twice, arrow letters out of order | gap | "A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell" (new) |
| params | the encoding: `{w}x{h}`, the `n` letter, the `d` letter (`e`, `t`) | gap | "Subsets params are written `4x4n4` and a difficulty letter" (new) |
| params | what the short form leaves out, and what an absent `n` or `d` decodes as | gap | "Subsets params are written `4x4n4` and a difficulty letter" (new) |
| params | a difficulty letter naming no tier is refused | stated | "Subsets' parameters" |
| params | refusal: anything but 4×4 with `n = 4` | stated | "Subsets' parameters" |
| params | the Custom dialog's one field | stated | "The Custom dialog offers the tier alone" |
| control | left-click, right-click and Backspace on a letter | stated | "Subsets is played by toggling letter slots" |
| control | Enter and Space at the cursor | stated | "Subsets is played by toggling letter slots" |
| control | a drag on from a press | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | the arrows walk the letters | stated | "The keyboard cursor walks the letter slots" |
| control | the inspect badge, and the cursor moving onto a cell | stated | "Focusing a cell shows the sets it can hold" |
| control | a press on a tally entry with no cell in focus | stated | "Selecting a set shows where it can go" |
| control | a press on a tally entry with a cell in focus | stated | "Subsets players can rule a set out of a cell" |
| control | the keyboard in the tally band | stated | "The keyboard reaches the tally band" |
| control | touching the aid while a hint shows | stated | "Touching the reference aid dismisses a displayed hint" |
| control | the keypad | not-owed | the game has no `requestKeys` |
| hint | `ruleOut` | stated | "A firing's rule-outs are placed before it" |
| hint | `arrowKnown`, `arrowMask` | gap | "The Subsets hint carries a letter across a horseshoe" (new) |
| hint | `hiddenSingle` | stated | "Subsets provides an explained hint" (its scenario "A hidden single is shown with its placement spotlight") |
| hint | `collapse` | stated | "A hint step rests only on what the board shows", "A firing's rule-outs are placed before it" |
| hint | the order the techniques are tried in | gap | "The Subsets hint reads the horseshoes before it counts sets" (new) |
| hint | the rules above the lowest tier come last | stated | "The hint reaches for the higher rules last" |
| hint | what the two horseshoe steps say and mark | gap | "The Subsets hint carries a letter across a horseshoe" (new) |
| hint | a refusal on a board that breaks a rule | stated | "Subsets provides an explained hint" |
| hint | a refusal on a letter that is wrong and breaks no rule | gap | "A Subsets hint refuses a letter the answer does not have" (new) |
| hint | a refusal when deduction runs out | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | the preset titles, "4x4 Size 4 Easy" and "4x4 Size 4 Normal" | gap | "A Subsets preset is titled by its board and its tier" (new) |

## Defects

None.

## Notes

- Subsets declares no preference (`prefs` is absent), so there is no `pref`
  row.
- **A bug: a wrong word in the Controls paragraph.** The paragraph the help
  page shows is generated from `targetVerbs`, and on the page its last
  sentence reads "Press Backspace or Delete to leave the number under the
  cursor undecided; clicking it round gets there too."
  (`src/games/subsets/index.ts:401`). The cursor is on a letter: the
  sentence before it on the same page says "Enter does what a click does to
  the letter under it", from the geometry's noun (`index.ts:308`). One word
  to fix. No requirement here says "number"; "Subsets is played by toggling
  letter slots" states the key.
- **A bug: Check & Save cannot point at a wrong letter that breaks no rule.**
  Reproduced through the midend on
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, whose answer has {D} in
  the second cell: with B marked present there, `findMistakes` returns
  nothing and no letter turns red, `Midend.check()` answers `dead-end`, and
  the app shows "Not saved" with "These entries contradict each other, so one
  of them must be wrong. Undo, or clear the ones you are unsure of." Hint
  says the same sentence. So the board is not saved and the player is told
  something is wrong, and not which letter, though the game holds the answer
  (`hint` compares against it, `index.ts:602`). `findMistakes` reads the
  answer only for rule-outs (`solver.ts:430`).
  `docs/games/solver-and-generator.md` § "The solvable-game contract" owes
  more: "re-solve from the fixed clues and return every player cell that
  contradicts the unique solution", and § "Live rule errors and the re-solve
  are both": "Keep the live errors (free, immediate) *and* base
  `findMistakes` on the re-solve". "Subsets flags mistakes for Check & Save"
  in the tree lists what is flagged today and so states the shortfall; it is
  the requirement to change with the fix. The requirement written here
  states the hint's refusal alone, which the help page gives
  (`help/games/subsets.md:34`), and says nothing of the mistake check.
- **The preset titles: no bug found, and the report of one was wrong.** The
  titles are declared (`state.ts:164`), "4x4 Size 4" being upstream's name
  for its one preset with the tier's name after it. The label the params
  compose is "Easy" or "Normal" alone (`describeParams`), since the Custom
  dialog has only the difficulty field. A player does not meet that label:
  the type header looks a board's params up among the presets before it
  composes anything (`src/puzzle/puzzle.ts:911`), choosing Normal in the
  Custom dialog leaves the params `4x4n4dt`, the Normal preset's own string
  (run through `Midend.setCustomParams`), and every params string that
  passes `validateParams` is one of the two presets'. So the Type menu and
  the header both read "4x4 Size 4 Normal" whichever way the board was
  chosen. This was read from the code and the midend and not opened in a
  browser. `engine-params` "A preset keeps a declared title only for a name
  no field says" allows the title, no field saying the size.
- `decodeParams` is hand-written and is not the engine's codec. It differs
  from a `choice` segment in one way a player can meet: an unknown difficulty
  letter is refused, where the codec's decodes to the default. The spec states
  Subsets' side.
