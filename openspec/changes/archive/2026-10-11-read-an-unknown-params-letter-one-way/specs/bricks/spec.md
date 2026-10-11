## MODIFIED Requirements

### Requirement: Bricks writes its difficulty after d, in the full encoding only

The full encoding SHALL be `WxH` then `d` and the difficulty letter, and the
shared encoding `WxH` alone. `decodeParams` SHALL read a string with no `d` as
Easy, and SHALL refuse one whose letter after `d` is none of the three,
whether or not a description comes with it.

#### Scenario: The Unreasonable preset

- **WHEN** `6x7dn` is decoded
- **THEN** it is the 6×7 `Unreasonable` board
- **AND** its shared encoding is `6x7`, which decodes as Easy
