## MODIFIED Requirements

### Requirement: The monotonicity guard samples enough boards to catch its defect

The guard SHALL sample **enough boards per tier to catch the defect it
names**, and that sample size SHALL be established by confirming that the
guard fires on a solver known to be non-monotone, not chosen by judgment. That
sample SHALL be walked on every push. The per-commit hook MAY walk the first
board of each tier alone, which still fails a solver that is non-monotone on
every board.

#### Scenario: A defect shows on most boards of a tier and not all

- **WHEN** a solver fails at a higher cap on most, and not all, of the boards
  of its easiest tier
- **THEN** the guard's sample per tier is the size at which it was seen to
  fail on that solver

#### Scenario: The first board of a tier is one the defect spares

- **WHEN** a commit makes a solver non-monotone on most boards of a tier, and
  the first board of that tier is not one of them
- **THEN** the per-commit hook passes, and the run on the push fails

### Requirement: A generator that runs out of tries is answered, not thrown

Where a generator exhausts its retry bound, the engine SHALL report it to the
caller as a sentence a player can be shown, and SHALL leave the board in play,
and the parameters it was dealt at, as they were. A bound that runs out says
that no board was found, which is an answer about the parameters and not a
fault. The sentence SHALL say that the tier may be rare or may be absent, and
SHALL NOT assert either, since the generator cannot tell them apart.

#### Scenario: A deal that finds no board keeps the one in play

- **WHEN** a type is chosen whose generator exhausts its retry bound
- **THEN** the player is shown a sentence saying no puzzle of that type was
  found
- **AND** the board that was on screen is still in play
- **AND** the type shown as chosen is that board's

#### Scenario: A seed that finds no board is refused like any other id

- **WHEN** a game ID carrying a seed is loaded and its generator exhausts its
  retry bound
- **THEN** loading returns the same sentence, as it returns any other refusal
