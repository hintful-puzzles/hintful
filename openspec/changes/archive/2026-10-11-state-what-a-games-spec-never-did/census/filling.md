# filling

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the clues in scan order, a letter a run of blanks, a digit a clue | stated | "Filling descriptions are run-length number grids" |
| desc | what the parser refuses: another character, a clue of 0 or above `max(w, h, 3)`, an area short of or past the grid | stated | "A Filling description is refused unless it fills the grid exactly" |
| desc | what loading refuses: several answers, none | stated | "A pasted Filling board opens at the difficulty it needs" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, a bare number being square | stated | "Filling's parameters" |
| params | the `d` letter and the tier letters `e`, `u` | stated | "Filling's parameters" |
| params | what the short form leaves out: the difficulty | stated | "Filling's parameters" |
| params | refusal: a width or height below 1 | stated | "Filling's parameters" |
| params | refusal: more than 300 squares, to deal | stated | "Filling rejects board sizes it cannot generate" |
| params | refusal: Unreasonable on a strip of one, three or four | stated | "Filling refuses Unreasonable where no board of a size needs it" |
| params | refusal: width times height too large to count | not-owed | `engine-params`: "A grid too large for a game is refused in one sentence" (`400000000x400000000` is refused, run 2026-10-11; the ceiling is where the area stops being an exact number, which no rule of Filling's sets) |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a click selects a square and a drag adds the squares it passes | stated | "Filling builds a selection of cells" |
| control | a digit, or Backspace for 0, fills the selection or the cursor's square | stated | "Filling fill moves and selection" |
| control | a number too large for the board | stated | "Filling fill moves and selection" |
| control | the arrows move the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | Space adds the cursor's square to the selection or takes it out | stated | "Filling builds a selection of cells" |
| control | Enter, then the arrows: a keyboard drag | gap | "Enter starts and ends a Filling keyboard drag" (new) |
| control | Escape clears the selection | stated | "Filling builds a selection of cells" |
| control | the right button, and a held press on touch | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| control | the keypad: `1` to `9` and Clear | stated | "Filling provides on-screen key labels" |
| hint | rung `growth` ("can't fully grow without", "fits exactly into") | stated | "One region-growth firing is one hint step" |
| hint | rung `blocked` ("has only this empty square to grow into") | stated | "A cell no growth group covers is forced on its own" |
| hint | rung `lonely` ("it can only be a 1") | stated | "A cell no growth group covers is forced on its own" |
| hint | rung `bitmap` ("Every other number … would", "it must be N") | stated | "A cell no growth group covers is forced on its own" |
| hint | the order: a growth group first, else one square by the remaining rules, else the next square the solver fills from the clues | stated | "A cell no growth group covers is forced on its own"; "Filling's hint keeps what the solver deduces from the clues alone"; the remaining rules' own order is "Filling solver deduces the unique solution" |
| hint | the marks: ringed squares, the striped region, the outlined neighbors | stated | "Filling hint color legend"; "Filling draws the displayed step's target and evidence" |
| hint | following a step square by square | stated | "hintKeepTrack follows a Filling step square by square" |
| hint | the refusal where deduction runs out | stated | "Filling's hint stops where the solver does" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- **A pointer press does not end a keyboard drag.**
  `src/games/filling/index.ts:115-120` clears the selection on a press and
  leaves `keydragging` set, so after Enter, a click and an arrow, the square
  the cursor lands on joins the new selection though nothing shows a drag is
  on. Run 2026-10-11 on the first preset's board: Enter, a click, and
  `keydragging` was still set, with the click's square selected. The new
  requirement lists what ends the drag (a second Enter, Space, Escape, a key
  that fills or erases) and is silent on the press. It reads as a bug to
  file, not a rule to state: a pointer press takes the board over everywhere
  else.
- **A digit too large for the board leaves a keyboard drag on** and the
  selection as it was (`src/games/filling/index.ts:162-164`: the key is
  declined before the drag is ended; run on a 3×3 board with `4`). The
  requirement said "a number typed" ends the drag, which that digit does not,
  and now says so.
- **Delete erases as Backspace does** (`isEraseKey`); "Filling fill moves and
  selection" names Backspace only, and `engine-input`'s "Backspace clears
  wherever the panel's Clear does" covers the key the frontend sends.
- The `blocked` and `bitmap` rungs are stated by what they conclude and from
  what; the sentences in the Item column are in `hint-text.ts` and no
  requirement quotes them. `growth`'s and `lonely`'s are quoted.
