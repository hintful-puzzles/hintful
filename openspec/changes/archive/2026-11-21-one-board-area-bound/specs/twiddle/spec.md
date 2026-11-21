## MODIFIED Requirements

### Requirement: Params: Twiddle refuses a board smaller than its block

`validateParams` SHALL reject `w < n` and `h < n`.

#### Scenario: A board narrower than its block is rejected

- **WHEN** the engine's params check receives `{ w: 2, n: 3 }`
- **THEN** it is refused with "Width must be at least the rotating block
  size."
