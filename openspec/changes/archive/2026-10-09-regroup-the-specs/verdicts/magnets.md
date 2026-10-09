# Verdicts: magnets

## keep `magnets`: Magnets' parameters

The doubt was that the requirement did not record the generation-only refusal of a 3×6 Normal board. It does now: "of full params, Normal at 3×6 and 6×3", with the scenario "A 3×6 Normal board that arrives written still loads". That matches `validateParams` in `src/games/magnets/state.ts`, which refuses it behind `full`.

## reword `magnets`: Magnets flags mistakes against the unique solution

Dropped "a board that is not uniquely solvable SHALL yield no mistakes". No board in play can reach it: Magnets declares a difficulty contract, and `engine-params` "A board loads only if the game's own solver solves it" refuses, at load, a board that no cap solves. `findMistakes` solves at the top cap, which solves whatever any cap does (`engine-difficulty` "A difficulty-capped solver is monotone in its cap at every tier"). The guard in the code stays, and `docs/games/solver-and-generator.md` § "The solvable-game contract" states the rule for every game. Nothing else changed.

### Requirement: Magnets flags mistakes against the unique solution

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: re-solve from the dominoes and the row and column counts, and
return every player-set cell whose content contradicts the unique solution, and
every cell of a domino marked `?` that is neutral in it, since the hint reads a
`?` as a fact. Empty cells, and a `?` on a domino that is a magnet in the
solution, SHALL never be flagged.

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed

## keep `magnets`: Magnets renders under the web geometry

The canvas with a one-tile clue margin and no border beyond it, and which count sits on which side, are decisions about how the game looks. A session changing `computeSize` or the clue layout would check its change against this.

## keep `magnets`: Magnets grades boards with a tiered deductive solver

Stating in the body what the scenario alone said is a rewording that loses nothing, and the body is true: `checkDifficulty` in `src/games/magnets/generator.ts` accepts a board only when it solves at its own tier and, for Normal, does not at Easy. The second sentence, that a deduction crosses a domino to its partner, is the game's own.

## keep `magnets`: What a Magnets board asks, and when it is solved

The retitling broke nothing. I searched `src/`, `docs/`, `scripts/` and every open change under `openspec/changes/` outside the archive for "Magnets game implements the Game interface": no hit. `spec-citations.mjs --list` cites no Magnets requirement.

## keep `magnets`: Every Magnets preset size is offered at each tier

The same search for "presets are drawn taller than wide" finds nothing outside the archive, so the old title is named nowhere that still reads it.
