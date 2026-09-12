## MODIFIED Requirements

### Requirement: Group game implements the Game interface

The engine SHALL provide `src/games/group/` implementing the `Game`
interface for Group — a Latin-square puzzle whose completed grid must be a valid
group Cayley table (Latin **and** associative) — registered so the puzzle is
served by the TypeScript engine.

Group SHALL accept a grid size (group order) between 3 and 26, a difficulty of
Easy, Normal, Tricky, Hard or Unreasonable, and a "show identity" flag. It
SHALL reject an identity-hidden Easy puzzle and an identity-hidden 3×3 puzzle,
because such puzzles cannot be made: identity-hidden puzzles leave two rows and
columns blank, and only a deduction above Easy can distinguish them.

The element-numbering used for display and keyboard input SHALL depend on the
"show identity" flag — with identity shown, the identity element is presented
first — and this SHALL affect the solution encoding and on-screen labels but
SHALL NOT affect the grid description.

#### Scenario: A generated board is a solvable group table

- **WHEN** a new game is generated for a legal size and difficulty in either
  identity mode
- **THEN** its clues admit exactly one completion, that completion is a valid
  group table, and the solver grades it at the requested difficulty

#### Scenario: Impossible identity-hidden parameters are rejected

- **WHEN** parameters request an identity-hidden Easy puzzle, or an
  identity-hidden 3×3 puzzle
- **THEN** validation rejects them with a reason

### Requirement: Group ports the graded group-axiom solver over the shared Latin solver

Group SHALL solve using the shared `src/engine/latin.ts` engine, supplying
only its group-specific deductions and validator: at Normal, an associativity
forward-deduction ((ab)c = a(bc)) together with filling the identity's row and
column once the identity is known; at Tricky, ruling out identity candidates from
any product that equals neither of its factors. Hard SHALL use the generic
set-elimination and forcing techniques and Unreasonable the generic
guess-and-verify recursion, with no Group-specific technique. A completed grid
SHALL be accepted only if it is associative.

The solver SHALL NOT introduce a difficulty tier beyond the five upstream ships,
and SHALL NOT implement the inverse-based, hard-mode-associativity or
element-order techniques upstream lists as unimplemented; the shipped difficulty
grading depends on their absence.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

#### Scenario: Associativity is used as a deduction

- **WHEN** a partially-filled board has `ab`, `bc` and `(ab)c` known but `a(bc)`
  blank at Normal or harder
- **THEN** the solver places `a(bc)` equal to `(ab)c`
