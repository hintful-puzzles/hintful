# keen

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the block structure, a comma, the clue list in the order of the cages' minimal cells | stated | "Keen descriptions encode the block structure and cage clues" |
| desc | the run letters `_`, `a`..`y`, `z`, the order of the grid lines, a repeat count | stated | "The block structure is run lengths between dividing lines" |
| desc | the clue tags `a s m d` and the decimal value | stated | "Keen descriptions encode the block structure and cage clues" |
| desc | refusals: a malformed block structure, the wrong number of clues, an unknown tag, a subtraction or division clue off a domino | stated | "A malformed Keen description is refused" |
| desc | refusal: a clue value its cage could not make | gap | "A Keen clue's value is one its cage could make" (new) |
| desc | refusal: a repeat count below 3 | gap | "A Keen repeat count below three is refused" (new) |
| desc | `supersededDesc` | not-owed | the game has none |
| params | Grid size: the leading number, 3 to 9 | stated | "Keen's params encoding", "Keen's parameters" |
| params | Difficulty: `d` and the letters `e n h x u` | stated | "Keen's params encoding" |
| params | Multiplication only: the trailing `m` | stated | "Keen's params encoding" |
| params | what the short form leaves out | stated | "Keen's params encoding" |
| params | an unknown difficulty letter decodes as the default | stated | "Keen's params encoding" |
| params | refusal: a size outside 3 to 9 | stated | "Keen's parameters" |
| params | refusal: a 3×3 above Normal | stated | "A 3×3 Keen is not dealt above Normal" |
| params | refusal: a multiplication-only 9×9 above Tricky | gap | "A multiplication-only 9×9 Keen is not dealt above Tricky" (new) |
| pref | `auto-pencil` | stated | "Auto-pencil strikes a placed digit from its row and column", "Keen exposes pencil-mark preferences" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| control | left-click selects a cell, and every cell takes an entry | stated | "Keen selects a cell through the shared note-taking cell" |
| control | a digit key enters, or in pencil mode toggles a mark | stated | "Keen interprets digit, pencil, and mark-all input" |
| control | Backspace and Space clear | stated | "Keen interprets digit, pencil, and mark-all input" |
| control | in pencil mode a clear key leaves a filled cell alone | gap | "Keen interprets digit, pencil, and mark-all input" (corrected) |
| control | `0` clears, and a digit above the size does nothing | gap | "Keen interprets digit, pencil, and mark-all input" (modified) |
| control | right-click selects for a pencil mark, only on an empty cell, or toggles the sticky mode | stated | "Keen selects a cell through the shared note-taking cell"; the mode is `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | arrow keys move the selected square | stated | "Keen selects a cell through the shared note-taking cell" |
| control | Enter toggles between numbers and pencil marks | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | `M` fills, then cleans, the pencil marks | not-owed | `engine-notes`: "The Mark-all action is the M key", "Mark-all is adaptive in a game with an obvious-candidate rule" |
| control | keypad: digits 1 to the size and Clear | stated | "Keen provides on-screen key labels" |
| control | keypad: the Marks key | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| control | `targetVerbs` | not-owed | the game declares none |
| hint | `populate` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose" |
| hint | `clean` | not-owed | `engine-candidate-hints`: "Candidate-elimination hints clean obvious candidates at populate" |
| hint | `note` | not-owed | `engine-candidate-hints`: "The implicit reading writes the notes a firing rests on" |
| hint | `dup` | not-owed | `engine-candidate-hints`: "A placement's cull continues its journey" |
| hint | `single` | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | `regionsFull` | not-owed | `engine-candidate-hints`: "A note-less single is placed in its own words" |
| hint | `hiddenSingle` | not-owed | `engine-candidate-hints`: "A candidate hint distinguishes naked and hidden singles" |
| hint | `set` | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises", "A set outlines the cells it rests on" |
| hint | `forcing` | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises" |
| hint | `cage` | stated | "A cage elimination is one firing, struck as one journey", "A cage deduction's sentence names the cage by its clue" |
| hint | `cageLine` | stated | "A cage elimination is one firing, struck as one journey", "A cage deduction's sentence names the cage by its clue" |
| hint | the order the techniques are tried in | not-owed | `engine-candidate-hints`: "The walk owns the ladder" (Keen gives the walk no rung of its own; a cage step is a recorded strike) |
| hint | the cap below recursion | stated | "Keen provides an explained deduction hint" |
| hint | the tier the hint deduces at | gap | "Keen's hint deduces at the tier of the board's params" (new) |
| hint | refusal on a mistake, and where deduction runs out | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar | not-owed | the game has none |
| words | the label's "multiplication only" tail | gap | "A Keen label ends in multiplication only for a product-only puzzle" (new) |
| words | the size and tier of a preset title | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- `decodeParams("6d")`, a `d` with no letter after it, gives Easy and not the
  default tier: `DIFF_CHARS.indexOf("")` is 0
  (`src/games/keen/state.ts:128`). "Keen's params encoding" says a letter the
  encoding does not know decodes as the default; a missing letter does not.
  The encoder never writes one. Not stated in a requirement; a bug to fix or a
  sentence to add, on the owner's word since it is what a link decodes to.
- `decodeParams` reads `m` only where it stands: `6m` is a multiplication-only
  6×6 Normal, and `6dqm` loses its `m` with its unknown letter and is a plain
  6×6 Normal. Neither is a string the encoder writes.
- A clue value with leading zeros loads (`m03` is `m3`); the encoder never
  writes one. Not stated.
- The new clue-value requirement gives a multiplication clue's top as `w` to
  the power of the cage's area. The code also caps it below the bit that marks
  the operation (`src/games/keen/state.ts:288`), which no board of 9×9 and six
  cells reaches (9⁶ is under 2²⁹), so the cap is how it is built.
- "Keen's hint deduces at the tier of the board's params" is read from
  `src/games/keen/index.ts:367`. Run on 2026-10-11 by following `hint()` to
  the end of three boards dealt at `6dn` and three at `6dx`: the Normal boards
  showed no `set` or `forcing` step, and the Hard ones showed `set` and
  `cageLine`. A board dealt at `6dh` or `6dx` and built with the params of
  the short form `6` (Normal) is refused partway, 12 boards of 12; a player
  does not reach that, because the midend gives a board loaded from an id its
  own tier (`withBoardTier` in `src/engine/midend.ts`).
- In pencil mode, Backspace, Space and `0` do nothing on a cell that holds a
  digit (`src/games/keen/index.ts:190`; run 2026-10-11, `interpretMove`
  returns null). "Keen interprets digit, pencil, and mark-all input" says
  they clear the cell, with no exception. The line's comment says it is
  meant ("Can't pencil-mark a filled square"), and Group, Mathrax and Undead
  do the same, so the sentence was what was wrong: the MODIFIED entry now
  adds "In pencil mode no key SHALL change a cell that holds a digit" and a
  scenario.
- Every string the delta quotes was run on 2026-10-11 through
  `decodeParams`, `paramsError`, `describeParams` and `validateDesc`, and
  means what its scenario says.
- The existing scenarios of "Keen's params encoding" and "Keen descriptions
  encode the block structure and cage clues" quote no dealt description. The
  new clue-value requirement's first scenario quotes the `facts.json` board
  and says what it holds.
- The same gap as Mathrax's: a candidate-hint game's spec gives the cap of the
  recording solve and not that it runs at the board's own tier. If every
  Latin-family game passes its params' tier, `engine-candidate-hints` could
  state it once.
- `auto-pencil` is the engine's helper (`autoPencilPref`) and `engine-notes`
  states only its default; each game restates what it does.
