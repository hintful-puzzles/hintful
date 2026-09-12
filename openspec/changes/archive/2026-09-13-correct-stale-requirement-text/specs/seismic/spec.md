## MODIFIED Requirements

### Requirement: Seismic game implements the Game interface

The engine SHALL provide `src/games/seismic/` implementing the `Game`
interface for Seismic (Hakyuu / Ripple Effect), registered so the puzzle is
served by the TypeScript engine.

Parameters SHALL be a width, a height, a difficulty (Easy or Normal), and a game
mode (Seismic or Tectonic). Validation SHALL require width and height at least 4
and a known difficulty, matching upstream. A game ID SHALL encode the width,
height, mode and difficulty and round-trip through decode, with a bare number
decoding as a square grid.

Any size bound in validation SHALL be derived from a measurement of the *shipped*
generator rather than inherited, and SHALL carry a reason the Custom-type dialog
can display, naming the mode it applies to. Where a bound remains it SHALL
reflect whichever stage is actually the limit — the region fill or the
clue-stripping loop. The retry loops below any bound SHALL be finite, so a
divergence fails with a labeled error rather than running forever.

**The bound SHALL be per mode, because the two modes are stopped by different
things and the distinction is not a matter of degree.** Tectonic's limit is
*reachability*: every size up to 100 cells generates, some of them slowly.
Seismic's is *possibility*: 10×10 does not generate at all — each attempt runs
for around sixteen seconds and then exhausts its retry budget — and no amount of
waiting changes that, so its bound SHALL stay at the largest area whose worst
observed run is short. Raising Seismic's bound SHALL require repeating the slow
sizes over several seeds; a bound set from medians is the error this game has
already shipped and retracted once.

**A size the player types in the Custom dialog MAY be one that takes seconds to
generate; a preset SHALL NOT.** A preset is offered to everyone who opens the
Type menu, so a long generation there is a wait nobody chose, whereas a Custom
size is a wait the player asked for knowing the board they wanted. Presets SHALL
therefore stop well inside the bound, and this SHALL be asserted rather than left
to convention. This is what makes 10×10 — the size upstream's own notes call
standard for Hakyuu — available in Tectonic mode without reintroducing the long
menu wait the constructive generator was written to remove.

The grid SHALL be partitioned into regions, and a region of size N SHALL require
one instance of each number from 1 to N. In Seismic mode two equal numbers Z on
the same row or column SHALL be at least Z cells apart; in Tectonic mode two
equal numbers SHALL NOT be orthogonally or diagonally adjacent. Regions SHALL be
represented on the shared disjoint-set structure, and because the wall layout is
determined by region membership alone, generation from a given seed SHALL be
reproducible without matching any particular canonical-element choice.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, mode and difficulty are recovered

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset
- **THEN** a board is produced whose unique solution is reachable by the solver at
  the preset's difficulty band

#### Scenario: A board larger than upstream could build is generable

- **WHEN** a board larger than upstream's 7×7 ceiling is requested, within the
  measured bound
- **THEN** it is accepted by validation and a soluble board is produced

#### Scenario: The standard Hakyuu size is available where it can be built

- **WHEN** a 10×10 board is requested in Tectonic mode from the Custom dialog
- **THEN** it is accepted by validation and a soluble board is produced
- **AND** no preset offers that size, so it is reached only by a player who asked
  for it

#### Scenario: A size the generator cannot build is refused up front

- **WHEN** a 10×10 board is requested in Seismic mode
- **THEN** it is rejected with a stated reason naming the mode, rather than
  accepted and left to churn until its retry budget is exhausted

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the validation bound admits

### Requirement: Seismic ports the deductive solver and solver-gated generator

Seismic SHALL provide a solver that fills the grid by candidate elimination — a
naked single and a hidden single within a region at Easy, plus a trial-placement
deduction at Normal — reporting the difficulty reached or that the puzzle is not
uniquely soluble. The solver SHALL enforce the mode's keep-apart rule and the
one-of-each-number-per-region rule while eliminating candidates.

The generator SHALL partition the grid into connected regions **before** placing
any number, and SHALL then fill each region with the numbers 1 to its size by
searching over the solver's own candidate propagation, so that a region holds
exactly the numbers it requires by construction. It SHALL NOT depend on a
post-hoc test that a randomly-merged region happens to hold a valid number set:
that is upstream's approach, its author records it as needing replacement, and its
success rate falls to nothing above roughly fifty cells. The generator SHALL then
strip clues while the puzzle stays soluble at the target difficulty, and accept a
puzzle only when it is soluble at that difficulty and not at the difficulty below
— both stages unchanged. Generation from a given seed SHALL be reproducible,
reusing the bit-identical random source.

Every generated board SHALL satisfy, by test rather than by luck: every region is
connected and holds exactly the numbers 1 to its size; the mode's keep-apart rule
holds across the whole solution; and the description round-trips through the
codec.

Upstream's fill-then-merge generator SHALL be retained behind an option that only
the differential test sets, so that the frozen C-reference fixtures continue to
match byte-for-byte and the solver, the description codec and the clue-stripping
loop keep that oracle. A test SHALL assert that the option still changes the
generated description, so the oracle cannot decay into re-testing the shipped
path.

#### Scenario: The solver grades a puzzle's difficulty

- **WHEN** a uniquely soluble puzzle is solved
- **THEN** the solver reports the lowest difficulty at which its deductions
  complete the grid

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: Every region is valid by construction

- **WHEN** a board is generated at any preset
- **THEN** each of its regions is connected and holds exactly one of each number
  from 1 to that region's size, and no two equal numbers violate the mode's
  keep-apart rule

#### Scenario: The C-reference oracle still applies to the unchanged stages

- **WHEN** the differential test generates each frozen fixture with upstream's
  region grower selected
- **THEN** the description matches the recorded C description byte-for-byte, and a
  further test confirms that deselecting the option produces a different
  description
