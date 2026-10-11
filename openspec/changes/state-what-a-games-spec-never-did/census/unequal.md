# unequal

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: per cell a number, flag letters `U`, `R`, `D`, `L` in that order, and a comma | stated | "Unequal descriptions encode per-cell numbers and adjacency flags" |
| desc | what the parser refuses: the wrong count of cells, a number out of range, a flag off the grid, contradictory flags, a run letter | stated | "A malformed Unequal description is refused" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{order}`, the short form | stated | "Unequal's parameters and their encoding" |
| params | the `a` letter (Adjacent mode) | stated | "Unequal's parameters and their encoding" |
| params | the `d` letter and its `t`, `e`, `k`, `x`, `r` | stated | "Unequal's parameters and their encoding"; "Unequal's top tier is named Unreasonable and keeps its character" |
| params | what the short form leaves out (the difficulty) | stated | "Unequal's parameters and their encoding" |
| params | an unknown difficulty letter | stated | "Unequal refuses the parameters it cannot deal" |
| params | refusal: an order outside 3 to the largest a candidate mask holds | stated | "Unequal refuses the parameters it cannot deal" |
| params | refusal: Adjacent at Tricky or harder below order 5; order 3 at Tricky or Unreasonable when dealing | stated | "Unequal refuses the parameters it cannot deal" |
| pref | `auto-pencil` | stated | "Unequal exposes pencil-mark preferences" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for"; "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes`, and that Unequal starts on Only as needed | stated | "The hint starts on the implicit reading"; the preference itself is `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| control | a click selects a square; right-click selects it for pencil marks | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | a digit (a letter from 11) places or pencils; Backspace, Space and, below order 10, `0` clear | stated | "Unequal accepts digit, pencil, clue-spent, and solve moves" |
| control | from order 10 the digits `0`–`9` are the values 1 to 10 | stated | "The keypad is zero-based from order 10" |
| control | a given takes no entry | stated | "Unequal accepts digit, pencil, clue-spent, and solve moves" |
| control | a click on a sign or bar marks it done | stated | "A clue is struck through by a click or a modified arrow" |
| control | a drag on through other clues repeats the mark | not-owed | `engine-input`: "A draggable mark is declared as a sweep or as drag-mark verbs" |
| control | Shift or Ctrl with an arrow marks the clue that way | stated | "A clue is struck through by a click or a modified arrow" |
| control | the arrows move the selection | not-owed | `engine-input`: "A bounded-grid cursor is driven through moveCursor"; "One arrow press reveals the cursor and moves it" |
| control | Enter switches between numbers and pencil marks | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | `M` fills the marks, then clears the obvious ones | not-owed | `engine-notes`: "Mark-all is adaptive in a game with an obvious-candidate rule" |
| control | the keypad: the values and Clear | stated | "Unequal provides on-screen key labels"; "The keypad is zero-based from order 10" |
| hint | the setup steps (`populate`, `clean`, `note`) | not-owed | `engine-candidate-hints`: "The walk owns the setup"; "The implicit reading writes the notes a firing rests on" |
| hint | a number its row or column already holds (`dup`) | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises" |
| hint | the singles (`single`, `regionsFull`, `hiddenSingle`) | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles"; "A shared narrator for generic Latin placements and strike premises" |
| hint | the set and the chain (`set`, `forcing`): their words and marks | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises"; "A set outlines the cells it rests on" |
| hint | the larger side of a sign (`greater`) and the smaller (`lesser`) | stated | "A clue elimination is one firing of one clue"; "Unequal provides an explained deduction hint" (scenario "An inequality bound is taught as a note strike") |
| hint | a bar, or none, beside a placed number (`adjacent`) | stated | "Unequal provides an explained deduction hint" (scenario "An adjacency clue is taught in Adjacent mode") |
| hint | a bar, or none, against an undecided neighbor (`adjacentSet`) | gap | "A bar is read against a neighbor that is still undecided" (new) |
| hint | the order: a single, then a strike, then a placement | stated | "The hint prefers a single, then a strike, then a placement" |
| hint | which techniques a board's tier brings, and their order among the strikes | gap | "Unequal's hint reasons no harder than the board's tier" (new) |
| hint | what a step says | stated | "Unequal's hint narration meets the hint quality bar" |
| hint | what a step marks | stated | "A hint's marks ring the struck cell and outline the clue's pair" |
| hint | no guess on an Unreasonable board | stated | "The hint's deduction is capped below recursion" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | stated | "Unequal is a Latin square with clues between neighbors" (it provides none) |
| words | preset titles: the mode, a size and a tier | not-owed | `engine-params`: "One describer labels every params set"; the two mode names are in "Unequal has two modes" |

## Defects

- The help says `M` fills: "Press the 'M' key to fill every empty square with
  all possible pencil marks" (`help/games/unequal.md:34`). The code's `M` is
  the adaptive Mark-all (`src/games/unequal/index.ts:293`): once no empty
  square lacks marks, a press removes the marks a row or column already rules
  out. The help leaves the second half out. `engine-notes` states the rule
  ("Mark-all is adaptive in a game with an obvious-candidate rule"), so no
  requirement was written.

## Notes

- A right-click on a sign or bar marks it done as a left-click does
  (`src/games/unequal/index.ts:224`), and the help names the left button only
  (`help/games/unequal.md:23`). The spec's "A click on a greater-than sign or
  adjacency bar" covers both, so it was not written again.
- The spec says what the generator promises at a tier ("Unequal generates
  uniquely-solvable boards at the target difficulty") and never what each tier
  means. The new hint requirement states the techniques by tier as the hint
  meets them; a requirement for the tiers themselves is `docs/games/README.md`'s
  "what each difficulty tier means", which is not one of this change's kinds.
- The hint's cap is the tier in the board's params
  (`src/games/unequal/index.ts:486`). For a board opened from an ID that
  states no tier, that is whatever the engine settles on
  (`engine-difficulty`: "A loaded board whose id states no tier takes the
  lowest tier that solves it"); not run here.
- Run on 2026-10-11 over boards dealt from `4dt`, `5dt`, `5de`, `5ade`,
  `5adk`, `5adx`, `5dx` and `5adr` (3 to 10 each), hinted from the board as
  dealt: the steps' rungs were the ones "Unequal's hint reasons no harder than
  the board's tier" gives each tier and no others. Easy plans were singles
  only; `greater`, `lesser` and `adjacent` first appeared at Normal,
  `adjacentSet` and `set` at Tricky, `forcing` at Hard. The same run showed a
  bar step ending "so pencil in only 1, 2 and 3" on a cell with no marks: the
  conclusion is the candidate walk's, and only the premise is Unequal's.
- Several of this batch's note-taking games (Undead, Unequal) leave the keys
  `sticky-pencil-mode` and `pencil-keep-highlight` to `engine-notes`, whose
  requirements name the preferences in words and never by key. If a stored
  preference depends on the key, the engine capability is where it would be
  stated once.
