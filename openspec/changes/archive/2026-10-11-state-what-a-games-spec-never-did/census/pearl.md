# pearl

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: row-major, `B`, `W`, lowercase runs | stated | "Pearl descriptions use the upstream run-length encoding" |
| desc | what a run letter counts (`a` 1 to `z` 26), and that trailing blanks are written | gap | "A Pearl run letter counts its unclued squares from a" (new) |
| desc | what `newState` refuses: an unknown character, too much or too little | stated | "Pearl descriptions use the upstream run-length encoding" |
| params | `{w}x{h}` and the full-form `d` segment | stated | "Pearl's parameters" |
| params | the difficulty letters `e` and `t`; no letter, or another letter, reads as Easy | gap | "Pearl's difficulty letters are e and t" (new) |
| params | upstream's trailing `n` | stated | "Pearl's parameters" |
| params | refusals: a side below 5, an area that overflows, Normal with `w + h` below 11 | stated | "Pearl's parameter bounds" |
| pref | `appearance` | stated | "Pearl's appearance preference" |
| control | left-drag along edges | stated | "Pearl draws the loop by dragging along grid edges" |
| control | right-drag crosses the edges it passes | stated | "Pearl marks no-line crosses with the secondary drag" |
| control | a click on an edge, either button; a click on the middle of a square | gap | "A Pearl click toggles the edge nearest the press" (new) |
| control | Enter shows a hidden cursor, starts and commits a path; Space, Escape, Backspace, Delete abandon it | gap | "Pearl's Enter key traces a path the arrows extend" (new) |
| control | Ctrl and Shift with an arrow | gap | "Pearl's Enter key traces a path the arrows extend" (new); in part "Pearl's keyboard cursor draws lines and marks" |
| control | the arrows move the cursor; a modified arrow on a hidden cursor only shows it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | the `H` key | stated | "Pearl leaves the H key to the app" |
| hint | `square`: a square read off its own edges | gap | "Pearl's hint reads a square off its own edges" (new) |
| hint | `blackRunsOn`, `blackCannotRunOn` | gap | "Pearl's hint reads a black pearl from the square past it" (new) |
| hint | `whiteCannotTurn`, `whiteTurnsOpposite` | gap | "Pearl's hint reads a white pearl from the squares beside it" (new) |
| hint | `closesEarly`, `closesEarlyThrough` | gap | "Pearl's hint rules out a loop that would close early" (new) |
| hint | the order the techniques are tried in | gap | "Pearl's hint tries a square, then a pearl, then an early loop" (new) |
| hint | the lines a step carries on, and their sentences | stated | "Pearl's hint draws a black pearl's arm whole", "Pearl's hint names every line it carries on" |
| hint | what a step marks | stated | "A Pearl hint step says why and marks what it decides" |
| hint | a cross the square already shows | stated | "A Pearl hint step asks for no cross the square already shows" |
| hint | the refusal when no rule fires | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar (none) | not-owed | `ts-engine`: "Solve, the status bar and text export follow from the game's methods" |
| words | the preset titles (`6x6 Easy`) | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- "Pearl explains the next deduction" names the hint's techniques (a square
  read off its own edges, "each of the four pearl rules", an edge and a square
  state that would close a loop early) and says of none what it concludes or
  from what. The five new hint requirements say that, and leave the existing
  one as the statement that the hint is a projection of the solver.
- "Pearl's keyboard cursor draws lines and marks" has one sentence ("a
  keyboard cursor that draws lines or marks with modifiers") and a scenario
  for Ctrl and Shift. The new keyboard requirement adds that Ctrl moves the
  cursor along the line and what both together do. A later session may want
  to fold the two into one.
- The help page says Space or Escape abandons a path; Backspace and Delete do
  too (`isCancelKey`). The help is not wrong, only shorter, and the keyboard
  requirement names all four.
- A `d` with a letter that is neither `e` nor `t` decodes as Easy and says
  nothing (`6x6dz` encodes back as `6x6de`), where Rome and Salad park such a
  letter out of range so that it is refused. The requirement states what
  Pearl does.
- The order requirement is written from the solver's ladder as the hint's
  recording pass walks it (`pearlRecordingPass`, one firing at a time): the two
  square rungs, the pearl rung, the closed-loop rung, which confirms and is
  never shown, and the shortcut rung, an edge before a square state.
