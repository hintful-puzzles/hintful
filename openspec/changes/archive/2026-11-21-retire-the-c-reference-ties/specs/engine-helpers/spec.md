## MODIFIED Requirements

### Requirement: A shared abstraction states its actual scope, not an aspirational one

A shared module's documentation SHALL describe the scope it actually has. A
module that documents itself as universal while fitting a minority of its
candidates SHALL be corrected, and its known non-fits SHALL be named in the
module itself with the reason each does not fit. An abstraction's stated scope
is part of its API: fitting a minority of callers is not a defect, and
claiming otherwise is.

#### Scenario: A game is considered for a shared abstraction

- **WHEN** a contributor evaluates whether a game's solver fits the shared
  deduction runner
- **THEN** the module names the known non-fits and why, so the evaluation
  starts from evidence rather than from an implied obligation
- **AND** a solver whose loop merely *resembles* the shared one is not treated
  as fitting until, run through it, the game's tests pass and no hint-walk
  snapshot moves

#### Scenario: An audit finds the majority do not fit

- **WHEN** an audit of candidates for a shared abstraction finds most do not
  fit
- **THEN** the correct outcome is a short adoption list, a recorded no-go
  list, and a corrected module header, and not a widened abstraction
- **AND** candidates that were not individually examined are recorded as
  **unaudited**, never counted as no-gos

### Requirement: A shared declarative helper is adopted by every game it fits

Every game that an engine-provided declarative-table helper fits SHALL use it,
and a game that does not SHALL have its reason recorded. The helpers in
question emit tables a game would otherwise hand-write:
`dimensionParamConfig()` for width/height params, and the shared pencil-mark
preference declarations. Adopting such a helper SHALL be a no-op: no
hint-walk snapshot and no render snapshot moves.

#### Scenario: A new port declares its params config

- **WHEN** a newly ported game with width and height params declares
  `paramConfig`
- **THEN** it calls `dimensionParamConfig()` rather than writing the table
- **AND** its Custom-type dialog behaves identically to every other game's

### Requirement: The engine colors the regions of a division with one walk

`src/engine/generate/region-fill.ts` SHALL give each region a fill number below the
count asked for, such that two regions sharing a side never take the same
one, or report that there is none. The walk SHALL ask its caller which of
the regions tied for fewest fills left goes next and in what order its fills
are tried, once each at every step, so that a caller's random draws fall in
a fixed order.

#### Scenario: Two regions share a side

- **WHEN** a division is colored from four or more fills
- **THEN** no two regions that share a side have the same fill

#### Scenario: Map's generator draws through the walk

- **WHEN** Map's generator colors a map
- **THEN** it answers the walk's questions with its random draws, so the walk
  asks for one among the regions tied for fewest fills left, then for the
  order of that region's fills, once each at every step

#### Scenario: No coloring exists

- **WHEN** three regions each share a side with the other two and two fills
  are asked for
- **THEN** the walk reports that there is none
