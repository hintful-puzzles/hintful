## MODIFIED Requirements

### Requirement: Pattern descriptions are slash-separated clue lists

The desc SHALL encode the `w` column clues followed by the `h` row clues as a
`/`-separated list, each line a `.`-separated list of positive run lengths (an
empty line being an empty section). An OPTIONAL trailing `,`-suffix MAY encode
pre-filled immutable clue squares using the run-length alphabet (`a`/`A` … with
`z` advancing 25 cells), as produced by upstream's picture generator; the
fork's generator emits none, but `validateDesc` and `newState` SHALL still parse
it so such descs round-trip. `validateDesc` SHALL reject a clue that is
non-positive or grossly excessive, a line whose clues cannot fit in its length,
too few or too many line specifications, and any unrecognized character in
either section. `newState` SHALL parse the desc into the immutable clue arrays
and an all-`Unknown` grid (with any immutable suffix applied).

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its clues are re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an over-long line, a wrong number
  of line specifications, or an invalid character
- **THEN** it returns a non-null error string
