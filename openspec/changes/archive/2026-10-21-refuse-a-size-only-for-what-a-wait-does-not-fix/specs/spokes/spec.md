## MODIFIED Requirements

### Requirement: Params: Spokes refuses Unreasonable on a board too small or too narrow to have one

When a board is to be dealt, `validateParams` SHALL refuse `Unreasonable` on a
board of eight squares or fewer, which has no such board. A board two squares
wide is rare at that tier and SHALL be dealt ("A rare tier is dealt under the
deadline"). It SHALL set no upper bound on the width or the height.

#### Scenario: A narrow board at the top tier

- **WHEN** a 2×6 board is asked for at `Unreasonable`
- **THEN** the parameters are not refused
