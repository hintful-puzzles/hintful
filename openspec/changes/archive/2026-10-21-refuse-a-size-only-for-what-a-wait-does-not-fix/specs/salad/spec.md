## MODIFIED Requirements

### Requirement: Params: Salad refuses two symbols at Normal where no board has it

When a board is to be dealt at Normal with two symbols, `validateParams` SHALL
refuse an ABC End View board smaller than 8×8 and a Number Ball board up to
4×4 with the sentence that no such puzzle is Normal. A Number Ball board of
5×5 or larger is rare at that tier and SHALL be dealt (`engine-difficulty`,
"A rare tier is dealt under the deadline").

#### Scenario: Two letters at Normal

- **WHEN** the `3` of `5n3Ldx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are refused with "No 5x5 Letters puzzle with 2 symbols is
  Normal."
- **AND** they are not refused for a board that arrives with its description

#### Scenario: Two numbers at Normal

- **WHEN** the `4` of `5n4Bdx` is changed to `2` and the params are checked for
  dealing
- **THEN** they are not refused
- **AND** a 4×4 Number Ball board with two symbols is refused with "No 4x4
  Numbers puzzle with 2 symbols is Normal."
