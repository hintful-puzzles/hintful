## MODIFIED Requirements

### Requirement: Params: Ascent refuses an area of 1000, a Hexagon out of proportion and a 2×2 in Edges

Ascent's dimensions SHALL declare a `maxArea` of 999, since the path's numbers
run to the area and a typed number stops at three digits. `validateParams`
SHALL refuse, on a Hexagon, an even height or a width not greater than half the
height, and a 2×2 grid in Edges.

#### Scenario: A Hexagon of even height

- **WHEN** a Hexagon board seven wide and six high is validated
- **THEN** it is refused with "Height must be an odd number."

#### Scenario: A board of a thousand squares

- **WHEN** a board 40 wide and 25 high is validated
- **THEN** it is refused with "Width times height must be at most 999."
