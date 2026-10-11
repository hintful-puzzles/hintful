# magnets

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: four comma-ended count lists, then `w·h` of `L` `R` `T` `B` `*` | stated | "Magnets descriptions carry the clues and domino layout" |
| desc | the count characters (digit or letter) | not-owed | `engine-params`: "The engine provides the two desc value alphabets" |
| desc | `.` for a number that is absent | stated | "Magnets descriptions carry the clues and domino layout" |
| desc | what `newState` refuses | stated | "A malformed Magnets description is refused" |
| desc | the sentence for an inconsistent layout | stated | "Magnets calls its pieces tiles when a player reads about them" |
| params | `{w}x{h}`, and a bare `{n}` as a square | stated | "Magnets' parameters" |
| params | the `d` letter (`e`, `t`), full form only | stated | "Magnets' parameters" |
| params | the `S` flag (Strip clues), full form only | stated | "Magnets' parameters" |
| params | what the short form leaves out | stated | "Magnets' parameters" |
| params | Width and Height bounded 2 to 61 | stated | "Magnets' parameters" |
| params | refusals: Easy below a side of 3, Normal below a side of 5, Normal at 3×6 when dealing | stated | "Magnets' parameters" |
| control | left-click or Enter on a tile | stated | "Magnets input cycles domino contents and toggles clue aids" |
| control | right-click or Space on a tile | stated | "Magnets input cycles domino contents and toggles clue aids" |
| control | click a clue to mark it done | stated | "Magnets input cycles domino contents and toggles clue aids" |
| control | a singleton square | stated | "A Magnets singleton square takes no input" |
| control | the cursor steps onto the clues, where Enter marks one done | gap | "The Magnets cursor walks onto the clues" (new) |
| control | a drag from a press | gap | "A Magnets drag repeats its press across tiles or across clues" (new) |
| control | arrows reveal and move the cursor; a press parks it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it", "The engine owns a declaring game's press and select keys" |
| control | the keypad | not-owed | the game has no `requestKeys` |
| hint | `force` | gap | "Magnets' hint settles one tile from what its ends cannot hold" (new) |
| hint | `lineFull` | gap | "Magnets' hint counts a line's neutral squares" (new) |
| hint | `lineExact` (neutral squares) | gap | "Magnets' hint counts a line's neutral squares" (new) |
| hint | `lineExact` (a pole) | gap | "Magnets' hint counts the squares that can still take a line's pole" (new) |
| hint | `oddGap` | gap | "Magnets' hint starts a line's one odd gap with the pole it has more of" (new) |
| hint | `oneNeutralLeft` | gap | "Magnets' hint counts a line's neutral squares" (new) |
| hint | `everyDominoNeeded` | gap | "Magnets' hint counts the tiles that can still give a line its pole" (new) |
| hint | `onlyEndLeft` | gap | "Magnets' hint counts the tiles that can still give a line its pole" (new) |
| hint | the order the techniques are tried in | gap | "Magnets' hint tries one tile first, then the lines, columns before rows" (new) |
| hint | what a step marks | stated | "A Magnets count premise marks what rules each square out", "A Magnets hint hatches the line its sentence names", "A met Magnets line cited as a reason is marked by its clue digit" |
| hint | a `?` is asked for and read as a fact | stated | "A Magnets firing the player can write is one journey of legs", "Magnets offers an explained hint" |
| hint | when it refuses | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording", "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | "strip clues" in a preset title, and what it does to a board | gap | "Strip clues removes each number a Magnets board does not need" (new) |
| words | the other words of a preset title | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- Magnets declares no preference (`prefs` is absent), so there is no `pref`
  row.
- The two tier requirements ("The deductions of Magnets' Easy tier", "The
  deductions of Magnets' Normal tier") name each deduction in the solver's
  words ("force-by-flags", "the odd-length-section deduction", "the
  single-neutral-left exclusion") without saying what it concludes or from
  what, so the seven hint rows are `gap` and not `stated`. The new requirements
  say it once, for the hint; the tier requirements still say which tier each
  belongs to.
- `everyDominoNeeded` and `onlyEndLeft` were weighed against "The deductions
  of Magnets' Normal tier", whose words for them are "all remaining dominoes
  being magnets rules out neutral; a domino with one placeable end has it
  set". Each gives the conclusion and not the count it follows from (as many
  more of a pole needed as there are undecided tiles, or tiles that can still
  give one), so a session could not check the condition against it, and both
  rows stay `gap`. The one new requirement that held them with a pole's
  square count is split in two, squares and tiles.
- The tile count for `−` is not the count for `+`. The solver adds the tiles
  that can give a `−` to those that can give a `+` when the line has a `+`
  number (`src/games/magnets/solver.ts:463-475`, upstream's count that is not
  reset, kept on purpose), so for `−` the only-end deduction fires only when
  no tile of the line can still give a `+`. The new requirement says so. It
  is sound, and weaker than the `+` case.
- Run on 2026-10-11: both quoted boards load; the keyboard scenarios and the
  drag scenario were driven through a `Midend` on the `facts.json` board and
  came out as written, and a drag begun on a clue marked three clues done and
  no tile. `hint()` was followed to the end of the two quoted boards and of
  four boards dealt at each of `5x6dt`, `5x6dtS`, `7x8dt`, `7x8dtS`,
  `9x10dtS` and `7x8de`: every board was finished, all seven rungs fired, and
  every sentence the delta quotes was spoken word for word.
- The hint shows only one arm of `lineFull`: the neutral count met, which asks
  for `?` marks. Its `+` and `−` arms, and the whole of the solver's
  marked-magnet count (`magnetsFill`), only rule a pole out of a square and are
  never shown; "A Magnets firing the board already says is not shown" states
  that.
- The solver's `neither` technique records no premise for the hint, and
  `recordingPass` throws if a firing arrives with none. It has not been seen to
  fire there: a pole ruled out of one end rules the opposite pole out of the
  other, so the one-tile technique before it always takes the square first.
  Nothing in the code says so, and a session reordering the ladder would learn
  it from the throw.
- A params string with a difficulty letter the game does not know (`5x6dx`)
  decodes to the default, Normal, and is not refused. This is the codec's
  `choice` segment and so the same in every game that uses one; `engine-params`
  "The codec grammar is a prefix, tagged segments, flags and letters" does not
  say what an unknown letter does, and could, once.
- `changedState` hides the keyboard cursor when the board becomes solved. Many
  games do the same in the same line, and no engine capability was found to
  state it; it is one sentence the engine could own.
