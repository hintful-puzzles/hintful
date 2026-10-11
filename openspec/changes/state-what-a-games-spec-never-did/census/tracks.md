# tracks

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: run letters, one hexadecimal character a clue square, then the numbers, columns before rows, `S` on the exit column and the entrance row | stated | "Tracks descriptions use the upstream encoding" |
| desc | which side of a clue square each bit of its character is | gap | "A Tracks clue square's character adds up the sides its track leaves by" (new) |
| desc | what `newState` refuses: an unknown character, a clue square without exactly two sides, a short number list, an entrance or exit missing or doubled | stated | "newState parses a Tracks description and refuses a malformed one" |
| desc | what `newState` refuses: a number above the length of its line, squares past the grid | gap | "A Tracks number is at most the length of its line" (new) |
| params | `{w}x{h}`, a bare `{n}`, the `d` letter (`e`, `t`, `h`), the `o` letter | stated | "Tracks' parameters" |
| params | what the short form leaves out | stated | "Tracks' parameters" |
| params | what a string with no `d`, or with a letter that names no tier, decodes as | gap | "Tracks params that name no difficulty are Normal" (new) |
| params | Width and Height at least 4 | stated | "Tracks refuses a grid under 4×4, and a 4×4 above Easy" |
| params | refusal when dealing: a 4×4 above Easy | stated | "Tracks refuses a grid under 4×4, and a 4×4 above Easy" |
| params | refusal: a width times height past what a number holds | gap | "Tracks refuses a grid whose area cannot be counted" (new) |
| control | left-click on a square or an edge | stated | "A Tracks click toggles a square or an edge" |
| control | right-click on a square, or on the strip along an edge | stated | "A Tracks click toggles a square or an edge" |
| control | a left-drag from a square with no track, and a right-drag | stated | "Tracks input maps drag, click and cursor" |
| control | a left-drag from a square that carries track | stated | "A drag from a square that carries track lays segments" |
| control | the arrows walk squares and edges; Enter and Space | stated | "The Tracks keyboard cursor walks a half-grid" |
| control | a press outside the grid; a right-drag over track | stated | "A Tracks press outside the grid, or a no-track drag over track, makes no move" |
| control | the keypad | not-owed | the game has no `requestKeys` |
| hint | `onlyOneSideLeft`, `bothSidesLeft` | gap | "The Tracks hint settles a square from its blocked sides" (new) |
| hint | `clueFull`, `clueExact` | gap | "The Tracks hint counts a row or column against its clue" (new) |
| hint | `wouldCloseLoop`, `wouldStrandTrack`, `wouldFinishEarly` | gap | "The Tracks hint blocks a side that would close a loop or finish the track too soon" (new) |
| hint | `looseEndSpans` | gap | "The Tracks hint runs a lone loose end straight on" (new) |
| hint | `sharedFate` | gap | "The Tracks hint decides two neighbors whose track would run on" (new) |
| hint | `crossingParity` | gap | "The Tracks hint counts the crossings of a closed block" (new) |
| hint | the order the techniques are tried in | gap | "The Tracks hint tries a square's sides, then the clues, then the loop" (new) |
| hint | the tier it stops at | stated | "The Tracks hint is capped at the board's own tier" |
| hint | one firing is one step, and a step partly made | stated | "One Tracks firing is one hint step" |
| hint | what is not shown | stated | "A firing the board already shows is hidden", "Three rules of update-flags declare no reason" |
| hint | what a step marks | stated | "Tracks marks a hint in its own vocabulary", "Tracks hint evidence is drawn in the evidence color" |
| hint | when it refuses | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording", "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | "allow adjacent 1’s" in a title | gap | "A Tracks title says when adjacent 1 clues are allowed" (new) |
| words | what disallowing consecutive 1 clues does to a board | stated | "Tracks meets singleOnes by bending the track" |
| words | the size and the tier in a title | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- Tracks declares no preference (`prefs` is absent), so there is no `pref`
  row.
- "Each Tracks difficulty adds its rungs" names the solver's rungs by id with
  two or three words each ("single-track reasoning", "the one-way neighbor
  deduction"), which says which tier a rung is in and not what it concludes
  or from what. "Tracks explains the next deduction" names no technique. So
  all ten hint techniques are `gap`. The new requirements say each once, for
  the hint, in the words the hint uses.
- The solver's `check-single` rung is narrated by no technique: `hint.ts`
  holds that it fires on no board the generator deals, and the `unreached`
  ledger of `tracks-ladder.test.ts` records it. No requirement states it; the order
  requirement written here leaves it out, as the hint does.
- The loose-end rung has a second rule, that a line's loose ends and finished
  squares together meeting its clue stop each loose end running on along the
  line. On the recording path it throws if it ever changes the board
  (`src/games/tracks/solver.ts`, "a loose end in line … had a side left to
  block"), on the argument that the clue count and the flag rules, which run
  first, have always blocked those sides already. Nothing but that comment
  says so, and a session reordering the ladder would learn it from the throw.
- The default tier is Normal, so the short form of every Easy preset (`8x8`)
  decodes as a Normal board. A short string is what a board's ID carries
  before its description, and `engine-difficulty` "A loaded board whose id
  states no tier takes the lowest tier that solves it" grades a board that
  arrives written, so this decides only a bare params string with no board.
- A params string with a difficulty letter the game does not know (`8x8dq`)
  decodes to the default, Normal, and is not refused: the codec's `choice`
  segment, as in Tents and Sticks.
- `validateParams` refuses `w > Number.MAX_SAFE_INTEGER / h` in the engine's
  sentence `AREA_TOO_LARGE`, the same line as Tents'.
- The `o` letter is read in a string with no `d` (`8x8o` decodes as Normal
  with adjacent 1 clues allowed), and the short form never writes it.
