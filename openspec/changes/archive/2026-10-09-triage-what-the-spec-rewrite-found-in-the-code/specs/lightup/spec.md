## MODIFIED Requirements

### Requirement: Light Up's params are validated

Params SHALL be refused when the width or the height is below 2, or when the
symmetry or the difficulty is not one of its listed values: the engine refuses
these from the game's `paramConfig`. `validateParams` SHALL refuse, of full
params, a `blackpc` outside 5 to 100, 4-way rotational symmetry on a grid that
is not square, either 4-way symmetry on a grid whose width and height are
both below 3, and a board too small for the tier asked for.

#### Scenario: Invalid params are rejected

- **WHEN** full params carry a 1-wide grid, a `blackpc` outside 5 to 100, or
  4-way rotational symmetry on a non-square grid
- **THEN** they are refused with a non-null error string

#### Scenario: 4-way mirror symmetry on a non-square grid

- **WHEN** `validateParams` is given a 5×7 grid with 4-way mirror symmetry
- **THEN** it does not refuse the symmetry

#### Scenario: A board too small for its tier

- **WHEN** full params ask for a 2×2 above Easy, a 3×3 at Normal under a 4-way
  symmetry, or at `Unreasonable` a board of fewer than 9 squares, a 3×3 under
  any symmetry or a 4×4 under a 4-way symmetry
- **THEN** they are refused, saying that no such puzzle is of that tier or
  that such puzzles are too rare to deal

#### Scenario: A board too small for its tier arrives written

- **WHEN** a game ID carries a 2×2 Normal board with its description
- **THEN** the params are accepted and the board loads
