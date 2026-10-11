# towers

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the `4w` clues joined by `/`, top, bottom, left, right, then `,` and the givens as run letters, numbers and `_` | stated | "Towers descriptions encode edge clues and grid givens" |
| desc | what `newState` refuses | stated | "Towers' reading of a description refuses a malformed one" |
| params | `{w}`, and the `d` letter (`e`, `h`, `x`, `u`), full form only | stated | "Towers' parameters are a grid size and a difficulty" |
| params | what the short form leaves out | stated | "Towers' parameters are a grid size and a difficulty" |
| params | a letter that names no tier | stated | "Towers' grid size runs from 3 to 9" |
| params | Grid size bounded 3 to 9 | stated | "Towers' grid size runs from 3 to 9" |
| params | refusal when dealing: a 3×3 above Normal | stated | "Towers' grid size runs from 3 to 9" |
| pref | `auto-pencil` | stated | "Towers auto-pencils row/column eliminations on placement"; its default in `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for", "The sticky pencil toggle is a mode switch, not a selection" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose"; the reading Towers starts on in "A Towers hint step populates, eliminates or places" |
| pref | `appearance` | stated | "Towers exposes an appearance preference" |
| control | a press selects a cell, and the arrows move the selection | not-owed | `engine-notes`: "A pointer press moves the highlight to the pressed cell" |
| control | a press on a tower leaning out of the cell below | stated | "Towers selects a cell by pointer or by keyboard cursor" |
| control | a digit enters a height, or toggles a pencil mark | stated | "Towers accepts digit, pencil, clue-strike, and solve moves" |
| control | Backspace, Space and `0` clear a cell | stated | "Towers accepts digit, pencil, clue-strike, and solve moves" |
| control | right-click, and Enter, for pencil marks | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for", "The select key on a showing highlight toggles pencil mode" |
| control | a click on a clue marks it done | stated | "An outside clue is struck through by a click or a modified cursor key" |
| control | a drag along the clues | not-owed | `engine-input`: "A draggable mark is declared as a sweep or as drag-mark verbs" |
| control | Shift or Ctrl with an arrow marks a clue done | stated | "An outside clue is struck through by a click or a modified cursor key" |
| control | the `M` key | not-owed | `engine-notes`: "The Mark-all action is the M key", "Mark-all is adaptive in a game with an obvious-candidate rule" |
| control | the keypad: `1` to `w`, then Clear | stated | "Towers provides on-screen key labels" |
| hint | `populate`, `clean`, `note` | not-owed | `engine-candidate-hints`: "The walk owns the setup", "A candidate hint plan reads an unmarked cell the way the player chose" |
| hint | `dup` | not-owed | `engine-candidate-hints`: "A placement's cull continues its journey" |
| hint | `single`, `regionsFull`, `hiddenSingle` | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | `set`, `forcing` | not-owed | `latin-solver`: "The solver applies the generic deductions up to the difficulty ceiling"; `engine-candidate-hints`: "A set outlines the cells it rests on", "A premise that asserts a walk is computed and numbered" |
| hint | the Latin steps are worded in heights, in Towers' own sentences | not-owed | `engine-candidate-hints`: "A game whose generic wording diverges keeps its own narration" |
| hint | `fullLine`, `tallestNearest` | stated | "A Towers hint is ordered the way a person solves" |
| hint | `facing` | gap | "Facing Towers clues that sum to one more than the grid size place the tallest tower" (new) |
| hint | `lineFull` | gap | "A Towers clue one short of its count keeps the short heights from the cell beside it" (new) |
| hint | `lowerBound` | gap | "A Towers height is struck from the cells too near a clue to hide it" (new) |
| hint | `arrangement` | gap | "A Towers height that no arrangement of a clue's line allows is struck" (new) |
| hint | the order of the plan: singles, the two note-free clue lines, eliminations, placements | stated | "A Towers hint is ordered the way a person solves" |
| hint | the order the clue eliminations are tried in, and the tier they stop at | gap | "Towers' clue eliminations are tried a facing pair first and arrangements last" (new) |
| hint | the three kinds of step | stated | "A Towers hint step populates, eliminates or places" |
| hint | what a step says and marks | stated | "A Towers hint step says what was spotted and why it forces the move", "A Towers hint step marks the clue it reasons from and the cells it acts on" |
| hint | when it refuses | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording", "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- The four clue techniques an earlier pass reported as never stated are
  `facing`, `lineFull`, `lowerBound` and `arrangement`. The help page teaches
  two of them by name ("Facing clues that add to one more than the grid size",
  "Too tall, too close"); the spec named none, speaking only of "the next clue
  elimination".
- The keys `auto-pencil`, `sticky-pencil-mode` and `pencil-keep-highlight` are
  fixed by the engine's preference builders (`src/engine/pencil-prefs.ts`), so
  every game that offers one stores it under the same key. No engine
  capability writes the three keys out: `engine-notes` speaks of "the sticky
  pencil preference", "the keep-highlight pencil preference" and
  "auto-pencil", and only `hint-notes` appears as a literal, in
  `engine-candidate-hints`. A saved preference depends on the key, so
  `engine-notes` could state the three once. Towers' spec states what its
  auto-pencil does and is marked `stated` on that.
- The too-near rule passes over a height that stands behind a taller one, as
  one the clue cannot see, only when the taller one is at least two taller:
  the loop that looks for it starts one height too high
  (`src/games/towers/solver.ts`, in the "Lower bounds" block, `mm = height +
  1` indexing an array whose slot `mm` is height `mm + 1`). Upstream's
  `towers.c` has the same line (`for (m = n+1; m < w; m++)`), so this is
  inherited and not a porting slip. It is sound, since a height counted when
  it could have been passed over only shrinks what is struck, and the
  generator's grading rests on it as it stands. The new requirement states
  what the code does; whether to tighten it is a draft for the owner, in the
  manner of Sticks' "The segment-reachability look-behind bounds are kept".
  Run through the recording solver at Easy with one clue of 4 on a 5×5 line:
  with 5 in the fourth cell and 3 in the fifth, heights 4 and 2 are struck
  (4 from the two nearest cells, 2 from the nearest), the 3 passed over; with
  4 in the fifth cell in place of the 3, only height 3 is struck from the
  nearest cell, the 4 having taken a place though the 5 hides it. Passed
  over, it would have left 3 struck from two cells and 2 from one. The
  requirement's sentence says both halves and its scenarios assert only the
  first.
- The arrangement scenario was run: a clue of 2 on an otherwise empty 3×3
  line strikes 3 from the nearest cell as too near at Easy, and at Normal
  then strikes 2 from the middle cell as an arrangement. The facing, the
  one-short and the too-near scenarios were run the same way and hold.
- The order requirement said "once, every facing pair". The facing pairs are
  found first, all of them in one firing, each time the deductions are
  recorded afresh, so it now says "first".
- The hint reads the board's tier from its state (`state.diff`), and uses no
  technique above it. On an Easy board that leaves
  out the arrangements, the sets and the chains even where one would apply.
- A params string with a difficulty letter the game does not know (`6dq`)
  decodes to the default tier; Towers' spec states it ("Towers' grid size runs
  from 3 to 9"), which Sticks', Tents' and Tracks' did not.
