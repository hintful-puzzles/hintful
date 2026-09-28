## ADDED Requirements

### Requirement: Separate runs its solver as a declared ladder that its hint shares

Separate's solver SHALL run on `runDeductionFixpoint` as three tier-0 techniques,
in order: `shared-letter` (two adjacent components already holding a common letter
are disconnected, and every edge between them walled), `walled-apart` (an open
edge between two disconnected components is walled), and `only-way` (an under-size
component with exactly one legal neighboring square merges with it, marking the
edges between them "no wall"). The working state SHALL carry the same facts as
border-grid bytes, so the generator and the hint run the same techniques on the
same state. The ladder SHALL generate exactly the boards upstream's loop did, and
the hand-written loop SHALL be kept as the oracle a ladder-equivalence test proves
it against.

#### Scenario: The ladder moves no board

- **WHEN** the generator runs on the ladder
- **THEN** the frozen differential's descs are unchanged
- **AND** over generator runs the ladder and the legacy loop agree on partition, sizes, disconnects, locked letters and verdict, with every rung fired

### Requirement: Separate offers a deduction-based hint

Separate SHALL provide `hint()`, seeded from the player's own marks (no-wall marks
merge, walls disconnect), returning one multi-leg journey per firing of its ladder,
each leg setting one edge. It SHALL refuse on a solved board, on a board carrying a
mistake, and on a board its solver cannot finish from empty. Every sentence SHALL
rest only on letters, walls and regions joined by the player's own marks; a
sentence about two regions SHALL tell them apart by mark shape (one hatched, one
outlined), and a lone square SHALL be named by its letter.

#### Scenario: The hint finishes from the player's own positions

- **WHEN** hints are followed one recomputed step at a time from a fresh board or from a board revealing a random share of the solution's edges
- **THEN** the board is solved and no hint refuses

#### Scenario: Two regions are named by their marks

- **WHEN** a displayed step cites two regions
- **THEN** one is hatched and the other outlined, and the sentence names both marks

### Requirement: Border-grid games share the hint's notation layer

The border grid's hint highlight, the journey a firing becomes, the keep-track
verdict on a click, the per-tile hint flags, the drawing of a hatched region and
outlined squares, and the later-leg sentence SHALL come from the engine, shared by
Separate and Palisade. Each game SHALL keep its deduction, its sentences and its
own `Move`, wrapping the shared edits itself. Moving Palisade onto the shared layer
SHALL change no Palisade frame.

#### Scenario: Palisade's hint frames survive the extraction

- **WHEN** Palisade draws its hint through the shared layer
- **THEN** its render snapshots pass without `vitest -u`
