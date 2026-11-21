## MODIFIED Requirements

### Requirement: Params: Loopy enforces each tiling's minimum size

Per-grid-type minimum sizes (both dimensions at least `amin`; at least one
dimension at least `omin`) SHALL be enforced by Loopy, not by the geometry
layer, which refuses no size. `validateParams` SHALL also refuse a Penrose
(kite/dart) board narrower than 4, at any height, since every patch drawn at
that width is degenerate and no redraw recovers it.

#### Scenario: A Cairo board needs one side of four

- **WHEN** Cairo params of 3 by 3 and of 3 by 4 are validated
- **THEN** the first is refused by Loopy's `validateParams`, since neither side
  reaches the tiling's `omin`, and the second is accepted

#### Scenario: A narrow kite/dart board is refused by its width alone

- **WHEN** Penrose (kite/dart) params of 3 by 8 and of 4 by 3 are validated
- **THEN** the first is refused with "Width for Penrose (kite/dart) must be at
  least 4." and the second is accepted
