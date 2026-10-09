# Verdicts: mathrax

## keep `mathrax`: A Mathrax board has one solution at every difficulty

The seed sentence stays. A seed still reaches a player through a `<params>#<seed>` game ID (`ts-engine`), and `random` "The random module's output is stable across builds" promises a seed feeds a generator the same numbers, but no shared requirement says a generator turns the same numbers into the same board. `testing` "The test suite is deterministic under parallel load" asks it only of tests.

## keep `mathrax`: Mathrax grades its difficulty tiers honestly

`engine-difficulty` "A cross-game guard asserts that tiers bind" reaches presets only, and the gate is a deliberate difference from upstream, which never asked (`newMathraxDesc` in `src/games/mathrax/generator.ts`). The bound on the loop is `engine-difficulty` "Every generate-until-success loop is bounded by the shared retry limit" and nothing more, but it is one clause and the requirement reads whole with it.

## reword `mathrax`: Mathrax solves and generates over the shared Latin-square framework

how: that the solver rides the shared framework is how it is built. What a tier means was missing, and `src/games/mathrax/solver.ts` has it. The clue deduction is one body under two gates (`simple` in `mathraxOptions`, which holds back only the arithmetic clues, and `diff <= DIFF_NORMAL` in `applyOptions`). The tiers also differ in the shared deductions `mathraxSolve` wires: `diffSimple` at Easy, `diffSet0` at Normal, `diffSet1` and `diffForcing` at Tricky, and the recursion at the top. The requirement names both, so dropping the framework clause loses nothing a reader needs. The title changes because the old one named only the framework.

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

## keep `mathrax`: Recording does not change what the Mathrax solver commits

The shared sentence, `engine-candidate-hints` "A shared candidate-elimination hint plan", says the walk changes no solver. Mathrax's recording path does differ from the plain one, committing one clue's eliminations a firing, so the invariant that the difficulty gate still waits on the whole intersection is Mathrax's own and has its own reason.

## keep `mathrax`: Mathrax's parameters are a size, a difficulty and a set of clue types

`engine-hints` gives the name Unreasonable its meaning; that Mathrax's top tier takes it is Mathrax's statement, and it is the reason the sentence about the retained `r` needs saying. The two belong together.

## keep `mathrax`: Mathrax draws its cells on a quiet surface and lifts a given

`engine-colors` "The engine owns what a board of pieces looks like" is about boards of pieces, and no shared requirement says a digit grid takes the cell surface and lifts a given. Solo, Keen, Towers, Unequal, Group and Salad each state it for themselves, with what differs (here the frame no heavier than the line, and the entry color kept unless a digit repeats), so it is a per-game decision as the specs stand.

## note No shared requirement says a deal is a function of its seed

`<params>#<seed>` IDs, the fixtures and every seeded test rely on a generator giving the same board for the same params and random state. Mathrax says it of itself; if it is meant of every game it belongs in `ts-engine` beside the requirement that describes the `#seed` ID.
