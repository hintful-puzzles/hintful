## MODIFIED Requirements

### Requirement: Range params are refused outside their bounds

`validateParams` SHALL refuse a `w + h` above 128, which overflows the cell
encoding, and, when `full`, a grid with both dimensions at most 2 (1×1, 1×2,
2×1 and 2×2), which admits no good puzzle. It SHALL refuse no size for the
time its deal takes, at either difficulty: a player can stop a deal.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with full generation on a 2×2 grid
- **THEN** it returns a non-null error string

#### Scenario: The largest boards are asked for at both difficulties

- **WHEN** a 64×64, a 2×126 and an 18×18 board are checked for dealing at
  Easy and at Unreasonable
- **THEN** none is refused
- **AND** a 64×65 board is refused for its width plus height

## ADDED Requirements

### Requirement: Range's rules run on every board the encoding allows

The deductive solver SHALL finish on a board of any size the encoding allows,
dealt or pasted, however long a path its white squares form.

#### Scenario: A strip of the greatest length

- **WHEN** the solver runs on a 127×1 grid with no clue and nothing decided
- **THEN** every cell but the two ends is set white

#### Scenario: The largest board with nothing shaded

- **WHEN** the solver runs on a 64×64 grid with no clue and nothing decided
- **THEN** it returns having set no cell

## REMOVED Requirements

### Requirement: Unreasonable Range is bounded on its own measurements

**Reason**: The bound refused boards that deal. Past it every Unreasonable
deal measured returned a board with one answer that the rules stop short of,
and only took longer, and a deal's wait is the player's to stop.

**Migration**: "Range params are refused outside their bounds" says that no
size is refused for its wait. A strip is still refused at Unreasonable, by
"Range refuses Unreasonable where no board needs it".
