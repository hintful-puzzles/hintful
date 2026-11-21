## MODIFIED Requirements

### Requirement: Params: Path's params are its declared codec's

The params SHALL be the width, the height, the ruleset and the tier, written `<w>x<h>[z]d<tier letter>`: `z` for the Path ruleset and nothing for Pairs, so a string written before the game had rulesets decodes to Pairs, and the tier letters `e`, `n`, `t` and `u`. The tier SHALL be written only in the full form; a string without it SHALL decode to Normal. Width and height SHALL each be at least 3.

#### Scenario: A params string round-trips

- **WHEN** `6x4de` is decoded and encoded in full
- **THEN** the result is `6x4de`

#### Scenario: Tricky round-trips

- **WHEN** `10x10dt` is decoded and encoded in full
- **THEN** the result is `10x10dt`

#### Scenario: The Path ruleset round-trips

- **WHEN** `6x6zdt` is decoded and encoded in full
- **THEN** the result is `6x6zdt`, and `6x6dt` decodes to Pairs
