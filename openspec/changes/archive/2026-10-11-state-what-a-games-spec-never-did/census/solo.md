# solo

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the sections and their order: givens, a jigsaw's blocks, a killer's cages and sums, each behind a comma | stated | "Solo descriptions encode givens, block structure, and killer cages" |
| desc | the givens section: decimal numbers, `a`–`z` runs, `_`, and what it refuses | gap | "Solo's givens are numbers, with a letter for each run of empty cells" (new) |
| desc | the blocks and cages sections: the order of the sides, `_`, `a`–`y`, `z`, the closing border | gap | "Solo's blocks and cages are written as runs between borders" (new) |
| desc | refusal: blocks or cages of the wrong number or size | gap | "Solo refuses blocks and cages of the wrong number or size" (new) |
| desc | refusal: a section missing, or one the params do not call for | gap | "Solo refuses a description with a section too many or too few" (new) |
| desc | the sums section: where a cage's sum is written, its range | gap | "A killer cage's sum is written at one of its cells" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{c}x{r}`, `{c}j`, the `x` and `k` letters | stated | "Solo encodes and decodes its parameters" |
| params | the symmetry letters (`m8`, `m4`, `md4`, `m2`, `md2`, `r4`, `a`; `r2` left out) | stated | "Solo encodes and decodes its parameters" |
| params | the `d` letter (`b`, `i`, `a`, `e`, `u`; `dt` left out) | stated | "Solo encodes and decodes its parameters" |
| params | what the short form leaves out | stated | "Solo encodes and decodes its parameters" |
| params | unknown characters, the legacy `{c}x{r}j` | stated | "Solo decodes its parameters leniently" |
| params | a number with no `x` after it, a `d` with no tier letter, an explicit `r2` | gap | "Solo decodes its parameters leniently" (modified) |
| params | the killer difficulty (`kdiff`) is in neither form and no Custom field | gap | "Solo's killer difficulty is in no params string" (new) |
| params | refusal: more than 31 numbers, a killer grid of 10 or more, an X grid under 4, a tier a tiny grid lacks | stated | "Solo refuses parameters outside its bounds" |
| params | refusal: a single field outside its range, a tier not listed | not-owed | `engine-params`: "Params validity is the engine's check" |
| pref | `auto-pencil` | stated | "Solo exposes pencil-mark preferences"; "Auto-pencil strikes a placed digit from its no-repeat regions"; "The auto-pencil label names the relation, not the regions" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose"; Solo's start on it is "Solo's hint starts on the implicit reading" |
| control | a click selects a cell; a right-click selects it for pencil marks | not-owed | `engine-notes`: "A pointer press moves the highlight to the pressed cell"; "The button and the sticky preference decide the mode a press selects for" |
| control | a number key enters or pencils the number | stated | "Solo interprets digit, pencil, and mark-all input" |
| control | Backspace or Space clears the cell | stated | "Solo interprets digit, pencil, and mark-all input" |
| control | the numbers past 9 are typed as letters, and `M` is one of them on a grid of 22 or more | gap | "Solo types the numbers past 9 as letters" (new) |
| control | the arrows move the selected cell | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | Enter toggles between numbers and pencil marks | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | `M` fills in every pencil mark, then cleans the obvious ones | not-owed | `engine-notes`: "The Mark-all action is the M key"; "Mark-all is adaptive in a game with an obvious-candidate rule" |
| control | `requestKeys`: the numbers and Clear | stated | "Solo provides on-screen key labels" |
| control | the Marks key on the keypad | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| hint | rungs `populate`, `clean`, `note` (setting the notes up) | not-owed | `engine-candidate-hints`: "The walk owns the setup"; "The implicit reading writes the notes a firing rests on" |
| hint | rung `dup` (the cull after a placement) | stated | "Solo's narration leads with what was spotted"; `engine-candidate-hints`: "A placement's cull continues its journey" |
| hint | rung `single` (the one number a cell's notes leave) | stated | "The eliminations Solo's hint teaches"; "Solo's narration leads with what was spotted" |
| hint | rung `regionsFull` (a cell with no notes whose regions hold every other number) | not-owed | `engine-candidate-hints`: "A note-less single is placed in its own words" |
| hint | rung `hiddenSingle` ("Only one place") | stated | "The eliminations Solo's hint teaches"; `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | rung `intersect` ("Confined to an overlap") | stated | "The eliminations Solo's hint teaches" |
| hint | rung `set` ("Already accounted for"), and one number confined across several lines | stated | "The eliminations Solo's hint teaches"; "The two rungs whose premise is not a region carry their cells"; "A single-digit pattern step names the fewer lines" |
| hint | rung `forcing` (the numbered chain) | stated | "The eliminations Solo's hint teaches" |
| hint | rungs `cageSingle`, `cageMinMax`, `cageSums`, and the region total | stated | "The eliminations Solo's hint teaches"; "A killer sum has one of three origins"; "A killer sum is narrated by what it came from" |
| hint | the order the techniques are tried in | stated | `engine-candidate-hints`: "The walk owns the ladder"; "Solo's solver is a certified deduction ladder whose rungs run alone" |
| hint | the techniques are capped at the board's tier | gap | "Solo's hint uses no technique above the board's tier" (new) |
| hint | what a step says | stated | "Solo's narration leads with what was spotted"; "A killer sum is narrated by what it came from" |
| hint | what a step marks | stated | "Solo's hint marks pair each color with a shape"; "Solo marks every board element its hint sentence points at" |
| hint | refusal when only a guess remains | stated | "Solo's hint never narrates a guess" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles ("3x3 X Normal", "9 Jigsaw Normal", "3x3 Killer Easy") | not-owed | `engine-params`: "One describer labels every params set"; "A game declares its rule modifiers with modifierItem" |

## Defects

- `help/games/solo.md:28`–`30` says `M` fills in the pencil marks "except on a
  grid large enough to use M as a number". `src/games/solo/index.ts:216`–`218`
  reads `m` or `M` as 22 only when that is at most the grid's size, and line
  221 enters it only while a cell is highlighted; with no highlight the press
  falls through to the Mark-all arm at line 251. So on a grid of 22 or more
  `M` still marks all whenever no cell is selected. Run on an empty `2x11`
  board: with a cell highlighted `M` and `m` enter 22 (in pencil mode, the
  pencil mark 22), and with none highlighted `M` fills in every pencil mark.
  The new requirement states the code.

## Notes

- **A killer game ID is not checked for one sum a cage.** `parseDesc` in
  `src/games/solo/state.ts` reads the sums section as a grid and never
  compares it with the cages, and the solver holds a cage to the last sum it
  finds in it, in reading order (`src/games/solo/solver.ts`, where `kclues`
  is filled). What a player meets, entering the pinned killer board's ID
  (`src/games/solo/solo-ladder.test.ts`, "3x3 Killer, cage sums") with one
  change, each run through the midend's `newGameFromId`:
  - *A cage with no sum* (the opening `15_14` of the sums written `a14`): no
    board, and "The clues in this game ID contradict each other." `newState`
    alone builds the board; the load check refuses it because the solver
    reads the cage as summing to nothing. The player never plays such a
    board, and the sentence does not say a sum is missing.
  - *A cage with two sums, the second the true one* (`8_8a5` written
    `8_9_8_5`, so the cage of the fourth and fifth cells carries 9 and then
    8): the board loads. `src/games/solo/render.ts:405` draws a sum at every
    cell that carries one, so the cage shows both a 9 and an 8, and the game
    holds it to 8. The same with 8 written twice loads too.
  - *A cage with two sums, the second the false one* (`8_8_9_5`): no board,
    and the same sentence about contradicting clues.

  The new requirement says what a number in the sums section is read as and
  what `newDesc` writes, and does not say that a cage with no sum or with two
  is a description. Whether to refuse the two-sum ID at the parser is a
  question about hand-typed IDs alone: `newDesc` writes one sum a cage.
- **A cage of one cell cannot load and is never dealt.** Entering the same
  ID with the cages' first `a` written `__`, which leaves the fourth and
  fifth cells of the top row a cage each, gives no board and "This game ID
  divides its board into the wrong number or sizes of blocks or cages." The
  parser's lower bound on a cage is 2 cells, and `newDesc` folds single cells
  away whenever the killer difficulty is above the lowest, which it always is
  (next note): 300 boards dealt at `3x3ka` had no cage under 2 cells. The
  spec's "Solo's narration leads with what was spotted" has a scenario "A
  cage of one open cell and nothing filled", and `say.cageSingle` in
  `src/games/solo/hint-text.ts` has the arm for it ("has only this cell",
  taken when the cage's cells hold no digit and one is open, which is a cage
  of one cell): no board a player can reach gets there.
- **The presets' killer difficulty changes no deal.** `presets()` in
  `src/games/solo/index.ts` gives its eleven boards without cages
  `DIFF_KMINMAX` and the Killer board `DIFF_KINTERSECT`. The midend encodes a
  preset and decodes it (`getPresets`, then `setParams`), and `decodeParams`
  always gives `DIFF_KINTERSECT`: read back from the midend after choosing
  each preset, all twelve held it. The Killer preset's value is therefore
  unchanged, and on a board without cages `newDesc` and the hint never read
  the field. **No preset deals at a difficulty other than its title's.**
  What is left is a field of the preset table that nothing reads, and one
  sentence of the spec the code contradicts: "Solo decodes its parameters
  leniently" says `decodeParams` "SHALL round-trip the preset list", and the
  eleven presets come back with a different `kdiff`. The modified requirement
  keeps that sentence word for word, as a `MODIFIED` entry must. The field
  could go from the preset table, or from the params.
- **`engine-notes` names the pencil preferences by what they do and never by
  key.** `pencil-keep-highlight` is in no spec at all, and `auto-pencil` and
  `sticky-pencil-mode` only in a game's own. The four keys are declared once,
  in `src/engine/pencil-prefs.ts`; one requirement in `engine-notes` naming
  them would cover every note-taking game.
- A `d` followed by a letter that is no tier is skipped, and the letter is
  then read as a flag of its own: `3x3dx` decodes to the board `3x3x` names,
  Easy with the X rule on, and `3x3dz` to `3x3`. The modified requirement
  says only that the difficulty stays at Easy.
- The strings of the new requirements were run through `newState` and
  `decodeParams`, and each means what its scenario says: `25` for `2_5`
  is a number out of range; a `,` after a plain board's givens is too long;
  `zzzc` alone on `3x3ka`, and a jigsaw's givens alone, are too short; and
  the jigsaw's top row is in blocks of four, two and three cells.
