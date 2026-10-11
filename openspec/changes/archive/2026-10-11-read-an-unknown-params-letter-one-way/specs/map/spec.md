## RENAMED Requirements

- FROM: `### Requirement: Map decodes params leniently`
- TO: `### Requirement: Map reads a params string with its height, region count or difficulty left out`

## MODIFIED Requirements

### Requirement: Map reads a params string with its height, region count or difficulty left out

`decodeParams` SHALL default an omitted `xH` to the width and an omitted `nN`
to `w*h/8`, SHALL read a `.` and the digits after it in the region count and
drop them, and SHALL refuse a difficulty char that is none of the four.

#### Scenario: Lenient decode

- **WHEN** `decodeParams` is given `12` (no height, no region count, no
  difficulty)
- **THEN** it yields `w = 12`, `h = 12`, `n = 12*12/8`, and the default
  difficulty
