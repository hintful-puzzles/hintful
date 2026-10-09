## MODIFIED Requirements

### Requirement: Loopy enforces each tiling's minimum size

Per-grid-type minimum sizes (both dimensions at least `amin`; at least one
dimension at least `omin`) SHALL be enforced by Loopy, not by the geometry
layer, which refuses only a size that is not positive or is too large to
build. `validateParams` SHALL also
refuse a Penrose (kite/dart) board narrower than 4, at any height, since every
patch drawn at that width is degenerate and no redraw recovers it.

#### Scenario: A Cairo board needs one side of four

- **WHEN** Cairo params of 3 by 3 and of 3 by 4 are validated
- **THEN** the first is refused by Loopy's `validateParams`, since neither side
  reaches the tiling's `omin`, and the second is accepted

#### Scenario: A narrow kite/dart board is refused by its width alone

- **WHEN** Penrose (kite/dart) params of 3 by 8 and of 4 by 3 are validated
- **THEN** the first is refused with "Width for Penrose (kite/dart) must be at
  least 4." and the second is accepted

### Requirement: Where no patch reaches its size, Loopy deals the largest drawn

Where no patch drawn has more than half the usual count, Loopy SHALL deal the
largest patch it drew. A size SHALL NOT be refused because its patches are
small: a size whose every patch is the same few faces deals those faces. A
tier SHALL be refused at such a size, in the words of `noSuchTier`, only where
those faces have no puzzle of it: Normal on the Penrose (rhombs) sizes whose
every patch is three rhombs round a point. Where only a rare patch carries the
tier, a deal draws patches up to a bound, and one that runs the bound out
SHALL end as any generator's does, by throwing `RetryLimitExceeded`.

#### Scenario: A size no patch fills deals the largest patch drawn

- **WHEN** a 3x14 Penrose (rhombs) board is dealt, where no patch has more than
  half the usual count and the patches are of two sizes
- **THEN** the board is a patch of the larger size

#### Scenario: A size whose every patch is three faces deals them

- **WHEN** a 3x3 Penrose (rhombs) board is dealt at Easy, Tricky or Hard
- **THEN** a board of three faces is produced, and the deal does not give up

#### Scenario: The three rhombs have no Normal puzzle

- **WHEN** a 3x3, 3x4, 3x5 or 4x3 Penrose (rhombs) board is asked for at Normal
- **THEN** `validateParams` refuses the tier and names the size, and 5x3 at
  Normal is dealt

#### Scenario: Every patch drawn is one that cannot carry the tier

- **WHEN** the generator is asked directly for a 3x3 Penrose (rhombs) board at
  Normal, past `validateParams`
- **THEN** it throws `RetryLimitExceeded` once its patches are spent, and the
  engine's `generate` answers that there is no board
