# crossing

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the walls as alternating runs, a comma, the clue numbers | stated | "Crossing descriptions use the upstream run-length encoding" |
| desc | what the parser refuses: a character out of place, wall data short of or past the board, a clue of the wrong length, a repeat, a list that does not match the runs | stated | "A Crossing description is validated against its board" |
| desc | what loading refuses: several answers, none | stated | "A pasted Crossing board opens at the difficulty it needs" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, a string without the height being square | stated | "Crossing's parameters" |
| params | the `S` letter (`symmetric-walls`) | stated | "Crossing's parameters" |
| params | the `d` letter and the tier letters `e`, `u` | stated | "Crossing's parameters" |
| params | what the short form leaves out: the symmetry and the difficulty | stated | "Crossing's parameters" |
| params | refusal: width and height both below 4, either below 2 | stated | "Crossing's parameters" |
| params | refusal: an area past the largest dealt, and a thin board's own smaller one | stated | "Crossing rejects board sizes it cannot generate" |
| params | refusal: Unreasonable past its own bound | stated | "Unreasonable is bounded on its own measurements" |
| pref | `auto-advance` | gap | "Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight`" (new); what it does is "Crossing advances the selection along the number being filled" |
| pref | `highlight-runs` | gap | "Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight`" (new); what it does is "The board marking and the list coloring are separate preferences" |
| pref | `fit-highlight` | gap | "Crossing's own preferences are `auto-advance`, `highlight-runs` and `fit-highlight`" (new); what it does is "The board marking and the list coloring are separate preferences" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| control | left-click selects a cell, right-click selects it for pencil marks | stated | "Crossing is played by selecting a cell and entering a digit"; the press itself is `engine-notes`: "A pointer press moves the highlight to the pressed cell" |
| control | a digit enters or toggles a note; Backspace, Space or `0` clears | stated | "A digit key enters, and Backspace, Space or 0 clears" |
| control | the arrows move the selection and set the fill direction | stated | "The fill direction is remembered and set by three gestures" |
| control | Enter toggles pencil mode | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | typing a whole number: the selection steps along the run | stated | "Crossing advances the selection along the number being filled" |
| control | clicking the selected cell again at a crossing swaps the direction | stated | "The fill direction is remembered and set by three gestures" |
| control | clicking a clue picks it up or places it; clicking a run drops it | stated | "Crossing places whole clue numbers from the list"; "A clue that fits both runs goes to the more written-in one" |
| control | putting a held clue down | gap | "A held clue is put down by a second click, a click where it cannot go, or an entry" (new) |
| control | the keypad: `1` to `9` and Clear | stated | "A digit key enters, and Backspace, Space or 0 clears"; Clear is `engine-input`: "Backspace clears wherever the panel's Clear does" |
| hint | rung `onlyNumber` ("only one number fits") | stated | "The hint names the technique, not the candidate elimination"; "The narration states the elimination that does the work" |
| hint | rung `onlyRun` ("only one run fits") | stated | "The hint names the technique, not the candidate elimination"; "A number's one run is shown by the squares that rule it out elsewhere" |
| hint | rung `sharedDigit` ("every fitting number agrees") | stated | "The hint names the technique, not the candidate elimination" |
| hint | rung `crossRuns` ("crossing runs") | stated | "The hint names the technique, not the candidate elimination" |
| hint | rung `noteDigits` ("so note them") | stated | "A placement the board does not yet support waits for its notes" |
| hint | rung `noteStrike` ("so rule it out"), ahead of a placement | stated | "A placement the board does not yet support waits for its notes" |
| hint | rung `noteStrike`, a note nothing supports where no placement follows | gap | "Crossing's hint looks for a whole run first and a note last" (new) |
| hint | the order the techniques are tried in | gap | "Crossing's hint looks for a whole run first and a note last" (new) |
| hint | what "still fits" means | stated | "A number still fits a run only as the board shows it" |
| hint | the marks, on the board and in the clue list | stated | "Each kind of hinted action has its own mark"; "The hint's evidence includes the listed numbers it reasons over" |
| hint | one deduction one hint, a run's notes one journey | stated | "One deduction is one hint" |
| hint | the refusals | stated | "Crossing refuses to hint a board it cannot honestly advise"; "Crossing's hint stops where the solver does" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the preset titles ("9x9 symmetric Easy") | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. `help/games/crossing.md:9` names Backspace and Space as the keys that
clear and omits `0`, which `src/games/crossing/index.ts:115-120` also takes;
the spec states all three.

## Notes

- **A held clue survives a click on a wall, a right-click, an arrow and
  Enter.** `src/games/crossing/index.ts:176-193` puts a held clue down only
  on a left click on an open square (`editable`), and the key arm at
  `:239-242` only for a digit or a clearing key with a cell selected. Run
  2026-10-11 on the first preset's board with 871 held: a click on the wall
  at the third square of the top row, a right-click on the first square, the
  Right arrow and Enter each left it held. The new requirement says so. A
  clue the player can no longer see a reason to hold stays held until one of
  the listed gestures; whether a wall click should put it down is a choice
  nobody has made, and is the owner's.
- **Clicking the held clue again places it** where a cell is selected for
  digit entry and one of its runs can take the clue
  (`src/games/crossing/index.ts:146-164`, tried before the toggle): reachable
  by holding a clue and then moving the cursor with the arrows. "Crossing
  places whole clue numbers from the list" states that placement, and either
  way the clue is no longer held.
- **The bounds' figures are in no sentence.** "Crossing rejects board sizes it
  cannot generate" and "Unreasonable is bounded on its own measurements" say
  a largest area exists and give the sizes either side of it in scenarios;
  the figures themselves (`MAX_AREA`, `MAX_THIN_AREA`,
  `MAX_UNREASONABLE_AREA` in `src/games/crossing/state.ts`) are measured, and
  `openspec/config.yaml` keeps a measured figure out of a requirement.
  Counted as stated.
- The three preference keys were in no requirement though each preference's
  behavior was. The same may hold of other games whose preferences are
  described by what they do: a key is what a saved preference depends on.
