## MODIFIED Requirements

### Requirement: Black Box params are a size and a ball range

Params SHALL be `w`, `h`, `minballs` and `maxballs`, encoded
`w{w}h{h}m{minballs}M{maxballs}`. Decoding SHALL read the four letters in any
order, a letter left out keeping its default, and SHALL refuse any other
character.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 8, h: 8, minballs: 3, maxballs: 6 }` are encoded
- **THEN** the result is `w8h8m3M6`
- **AND** decoding `w8h8m3M6` round-trips those params
