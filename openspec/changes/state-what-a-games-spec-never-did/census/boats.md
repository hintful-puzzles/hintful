# boats

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: `width + height` comma-terminated border tokens, then the grid run-length encoded | stated | "Boats descriptions use the border-clue and run-length grid encoding" |
| desc | the order of the border tokens (columns first), the `-` marker, each given's letter, a border number above its line's length | gap | "A Boats description gives the column numbers first and names each given by a letter" (new) |
| desc | a trailing run with no given is left out | stated | "A Boats description omits a trailing run of squares with no clue" |
| desc | what the parser refuses: too many squares, the wrong number of border tokens, another character; never too few squares | stated | "Boats description validation rejects too many squares and never too few" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | what the encoding carries | stated | "Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag" |
| params | the letters `x`, `f`, `d` with `e` / `n` / `t` / `h`, `S`, the comma list; what the short form leaves out; what a missing part decodes as | gap | "Boats params are written as the size, f with the largest boat, the tier, S and the fleet's counts" (new) |
| params | refusal: width and height from 2 to 99, fleet size from 1 to 9 and no more than the longer side, a fleet of no boats, a fleet that does not fit | stated | "Boats refuses parameters no fleet can be dealt from" |
| params | refusal: one boat above Easy, when dealing | stated | "Boats refuses parameters no fleet can be dealt from" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left-click cycles empty, boat segment, water; right-click places water or empties | stated | "Boats is played by pointer and by keyboard" |
| control | a drag along one row or column: which squares it fills, the release off the board, the press on a number | gap | "A Boats drag fills its line as its first square changed" (new) |
| control | Enter and Space at the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the plain arrows | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | Ctrl, Shift and both with an arrow; Backspace and Delete (the key-only verb) | gap | "Boats' modifier arrows fill as the cursor moves, and Backspace empties" (new) |
| control | a segment's shape resolving, a finished boat crossed off | stated | "A boat segment resolves its shape and a completed boat is crossed off" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rungs `givenClue`, `neverTouch`, `centerForced` | gap | "The Boats hint reads a segment for the squares round it" (new) |
| hint | rungs `lineSatisfied`, `lineForced`, `allWaterPlaced` | gap | "The Boats hint finishes a line by its number" (new); the first is also the scenario of "The Boats hint replays the solver's deductions one firing at a time" |
| hint | rungs `isolated`, `mustExtend` | gap | "With every one-square boat placed, the Boats hint settles a hemmed-in square" (new) |
| hint | rung `mustGrow` | stated | "An end-capped boat that cannot stop grows at the second tier" |
| hint | rungs `centerCount`, `growTooLong`, `runTooShort`, and `onlyRunsLeft` in its Normal form | gap | "At Normal the Boats hint reads the fleet list" (new) |
| hint | rung `onlyRunsLeft` in its Tricky form, rung `sharedDiagonal` | gap | "At Tricky the Boats hint counts runs and shared diagonals" (new) |
| hint | how a hidden number is recovered | gap | "A hidden Boats number is recovered from a decided line, or as the last one hidden" (new); that the cheaper techniques are then asked again is "A recovered border number is offered to the cheaper techniques first" |
| hint | rung `refuted`: which trials it runs | gap | "At Hard the Boats hint tries the one square a line is short of" (new) |
| hint | rung `refuted`: that it names the rule broken | stated | "Every Boats technique is narrated" |
| hint | the order within a tier | gap | "The Boats hint asks its techniques in a fixed order" (new) |
| hint | the cap it replays at | stated | "The Boats hint replays at the lowest cap that solves the board" |
| hint | the water a placement brings with it | stated | "Water forced by the never-touch rule belongs to the step that places the boat" |
| hint | the marks | stated | "A Boats hint marks a boat and water each in its own shape" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the label: "size N", "fleet …", "hidden clues" | gap | "A Boats label gives the largest boat as its size" (new) |

## Defects

None. The help's two hand-written Controls lines (the drag, and Ctrl and
Shift with an arrow) say what the code does.

## Notes

- The help's Controls line says a drag fills "every square it passes over the
  way the first one changed" (`help/games/boats.md:17`). That holds with one
  exception the help does not give and the new requirement does: a left drag
  from a boat segment waters every square of the line that is no given,
  whatever it held (`src/games/boats/index.ts:150`), where every other drag
  changes only the squares that held what the first did.
- **A sentence of the hint that no board reaches.** The boat-too-long
  technique has words for a fleet with nothing missing ("every boat in the
  fleet has been found", `src/games/boats/hint-text.ts`, `growTooLong`). A
  board with every boat placed is solved whether or not its water is marked
  ("Boats is solved when the fleet is placed, without the water"), and the
  plan stops at a solved board: run 2026-10-11 on the dealt 6×6 with its
  boats placed and all the player's water taken off, the status was solved
  and the hint refused. So the new Normal requirement gives no scenario for
  it. Whether some unsolved board counts every boat as found was not
  settled by a search; the reading of `validateFullState` says none does.
- A Hard trial of a boat segment cannot fail by touching another boat at a
  corner on a board the Easy techniques have finished with, since they water
  every square diagonal to a segment first. The Hard requirement's scenario
  is therefore the line that could no longer reach its number.
- The preference the Custom dialog calls "Remove numbers" is labeled "hidden
  clues", and ABCD's "Remove clues" is labeled "clues hidden": two games, one
  idea, two wordings. An engine-owned word for it would settle both.
- "Boats solves with a four-tier deductive solver" names no technique of any
  tier, so until this change the only statement of what a tier may deduce was
  the solver. The new hint requirements state it for the hint; the solver's
  own order differs (the hint's is goal-first) and is still unstated.
