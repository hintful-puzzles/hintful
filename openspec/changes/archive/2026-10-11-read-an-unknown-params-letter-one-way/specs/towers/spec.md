## MODIFIED Requirements

### Requirement: Towers' grid size runs from 3 to 9

The grid-size item of `paramConfig` SHALL declare the bounds 3 and 9, so that
the engine refuses a `w` outside them. A difficulty letter that names no tier
SHALL be refused. When full, `validateParams` SHALL refuse a
3×3 board above Normal.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 3` or `w > 9` are checked
- **THEN** they are refused with a sentence that names the grid size
