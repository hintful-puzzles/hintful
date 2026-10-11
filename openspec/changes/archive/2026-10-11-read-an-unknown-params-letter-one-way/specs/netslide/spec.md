## MODIFIED Requirements

### Requirement: A Netslide params string with no `b` asks for no barriers

Decoding SHALL read a string with no `b` as a barrier probability of 0,
though the default params have 1. The letters SHALL be read once each in the
order `w`, `b`, `m`, one out of that order being refused, and a bare `{n}`
SHALL be a square grid, after which each of them is refused.

#### Scenario: The default and the preset beside it

- **WHEN** the default params are encoded in full, and `3x3` is decoded
- **THEN** the first is `3x3b1`, a grid with every barrier drawn, and the
  second is a 3×3 grid with no barrier inside it and no wrapping
