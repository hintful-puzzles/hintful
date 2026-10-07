## MODIFIED Requirements

### Requirement: Group game implements the Game interface

The engine SHALL provide `src/games/group/` implementing the `Game`
interface for Group — a Latin-square puzzle whose completed grid must be a valid
group Cayley table (Latin **and** associative) — registered so the puzzle is
served by the TypeScript engine.

Group SHALL accept a grid size (group order) between 3 and 26, a difficulty of
Easy, Normal, Tricky, Hard or Unreasonable, and a "show identity" flag. It
SHALL reject an identity-hidden 3×3 puzzle, and SHALL declare that hiding the
identity leaves every tier but Easy (the modifier's `only`), because such
puzzles cannot be made: identity-hidden puzzles leave two rows and columns
blank, and only a deduction above Easy can distinguish them. The engine builds
the refusal of an identity-hidden Easy deal from that declaration, and a board
that arrives already written is not held to it, since nothing reads its tier.

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

- **WHEN** parameters about to deal a board request an identity-hidden Easy
  puzzle, or an identity-hidden 3×3 puzzle
- **THEN** validation rejects them with a reason

#### Scenario: The Custom dialog hides the identity with Easy chosen

- **WHEN** the player unticks "Show identity" while Easy is chosen
- **THEN** Easy is disabled and the difficulty shows Normal, and OK deals a
  board with no refusal
