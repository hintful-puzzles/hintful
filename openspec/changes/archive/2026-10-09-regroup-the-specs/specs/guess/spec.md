## MODIFIED Requirements

### Requirement: Guess remembers a half-composed row across a save

Guess SHALL provide `encodeUi` and `decodeUi`, carrying the working row and the
live holds, which replaying the move log cannot recover. The encoding SHALL be
one field per slot, comma-separated: the peg's color number, `0` for an empty
slot, followed by `_` when the slot is held (`3_,0,5,2`). `decodeUi` SHALL
treat a peg the params have no color for as an empty slot, and SHALL leave the
cursor where the next color will go.

#### Scenario: A half-composed row survives a save

- **WHEN** a working row is partly filled with a hold set, encoded through
  `encodeUi`, and decoded into a freshly built `Ui`
- **THEN** the restored row and holds equal the originals and the restored
  cursor rests on the first empty slot

#### Scenario: A peg no color exists for is dropped

- **WHEN** `decodeUi` is given a peg outside `1..ncolors`
- **THEN** that slot is left empty and the rest of the row still decodes
