## ADDED Requirements

### Requirement: ABCD's obvious marks are a touching letter and a letter its line has in full

The obvious candidates ABCD's fill-all-marks command strikes SHALL be each mark
whose letter a touching cell already holds (diagonally too when that is
disallowed), and each mark whose letter its row or column already holds its
clue's count of.

#### Scenario: A row that has all of its letter

- **WHEN** every empty cell carries marks, a row's clue for `A` is 1, one cell
  of that row holds `A`, and the command is used
- **THEN** the `A` mark is struck from every other cell of that row that carries
  another mark

### Requirement: ABCD's bound is asserted in both directions

The bound on generable boards SHALL be asserted in both directions: that it
admits configurations measured generable as well as refusing those measured
un-generable.

#### Scenario: A tightened bound cannot bar a generable board

- **WHEN** a configuration measured generable is validated for generation
- **THEN** it is accepted, so a bound drawn tighter than the measurements
  fails as one drawn looser does

## REMOVED Requirements

### Requirement: ABCD's fill-all-marks command fills only cells with no marks

**Reason**: Restated as "ABCD's obvious marks are a touching letter and a letter its line has in full". Shortened to ABCD's own rule, which is what counts as obvious. The fill of the note-less cells and the narrowed cell left as it is are `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule"; one `pencilStrike` and no move when nothing strikes are `engine-notes`, "The Mark-all cleanup is one move, or none"; the kept last mark is `engine-notes`, "Repeated Mark-all presses converge". ABCD passes `abcdObviousMarks` (`src/games/abcd/solver.ts`) to `adaptiveMarkAll` and does nothing else of its own. The title said what went, so it changes; nothing cites it. This is a `reword` in a game's spec, which the task asked me to avoid: an `edit` cannot change a title, and no other family's rule touches this requirement.

### Requirement: The bound admits every preset and is asserted in both directions

**Reason**: Restated as "ABCD's bound is asserted in both directions". The sentence "Every shipped preset SHALL pass validation for generation" and
its scenario restate `engine-params`, "Every default and preset passes
validation for generation", which holds it for every game. What is ABCD's own
is that its measured bound is asserted from both sides
(`src/games/abcd/abcd.test.ts`, "abcd generable-size bound": the `admits` rows
and the `refuses` rows). The title named the part removed, so it changes; no
source or guide cites it (`spec-citations.mjs --list`). The scenario is new,
about what remains.
