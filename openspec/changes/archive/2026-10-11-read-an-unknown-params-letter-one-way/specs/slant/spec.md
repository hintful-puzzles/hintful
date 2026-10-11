## RENAMED Requirements

- FROM: `### Requirement: A Slant difficulty letter that is missing or unknown reads as Easy`
- TO: `### Requirement: A Slant string with no difficulty letter reads as Easy`

## MODIFIED Requirements

### Requirement: A Slant string with no difficulty letter reads as Easy

`decodeParams` SHALL read a string with no `d` segment as the default
difficulty, Easy, and SHALL refuse one whose `d` is followed by a letter other
than `e` or `h`.

#### Scenario: The short form of a Normal preset

- **WHEN** `5x5`, the short form of the preset `5x5dh`, is decoded
- **THEN** the params are 5 by 5 at Easy, the board `5x5de` names
- **AND** `5x5dh` with its `h` written `x` is refused
