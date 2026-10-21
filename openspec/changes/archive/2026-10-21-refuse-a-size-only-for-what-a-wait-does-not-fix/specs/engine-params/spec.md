## MODIFIED Requirements

### Requirement: A generation-only bound is gated on full

A game SHALL express a bound that holds only when generating, such as a size
with no board at the tier asked for or a difficulty that produces no distinct
boards, by gating it on `full` in its `validateParams`. The engine SHALL NOT
make that gate vacuous by passing a constant. A generation-only limit SHALL
NOT move into `bounds`, because a bound applies whatever the `full` flag says
and would refuse a description-carrying game ID that loads today.

#### Scenario: A size only generation refuses

- **WHEN** a game refuses a size only because its generator cannot deal it
- **THEN** the refusal is in `validateParams` behind `full`, the field's
  `bounds` admit the size, and a `<params>:<desc>` id at that size loads
