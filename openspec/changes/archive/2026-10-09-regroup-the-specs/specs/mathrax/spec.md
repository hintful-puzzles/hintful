## ADDED Requirements

### Requirement: What separates Mathrax's difficulty tiers

Beside the shared Latin deductions, Mathrax's clue deduction SHALL keep in a
cell only the digits every clue at its corners permits, given the candidates of
the cell across that clue. Easy SHALL read an arithmetic clue only when the cell
across it is down to one digit. Easy and Normal SHALL act only where one digit
is left; Tricky SHALL strike all that is ruled out. Normal SHALL add the shared
set elimination, Tricky the harder one and forcing chains, and `Unreasonable`
guessing and verifying.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue

## REMOVED Requirements

### Requirement: Mathrax solves and generates over the shared Latin-square framework

**Reason**: Reworded in `mathrax` as "What separates Mathrax's difficulty
tiers". how: that the solver rides the shared framework is how it is built.
What a tier means was missing, and `src/games/mathrax/solver.ts` has it. The
clue deduction is one body under two gates (`simple` in `mathraxOptions`, which
holds back only the arithmetic clues, and `diff <= DIFF_NORMAL` in
`applyOptions`). The tiers also differ in the shared deductions `mathraxSolve`
wires: `diffSimple` at Easy, `diffSet0` at Normal, `diffSet1` and `diffForcing`
at Tricky, and the recursion at the top. The requirement names both, so
dropping the framework clause loses nothing a reader needs. The title changes
because the old one named only the framework.
