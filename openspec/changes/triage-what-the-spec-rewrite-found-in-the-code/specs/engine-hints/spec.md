## MODIFIED Requirements

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types
of the collection's refusal constants, plus a sentence made by `puzzleDeadEnd`
or `markedDeadEnd`, the named escapes. A game SHALL NOT be able to return a
sentence of its own wording. The type is of literals, so a string spelling a
constant's text exactly is that constant to it, and the player reads the same
sentence.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by an escape
- **THEN** the typecheck fails
