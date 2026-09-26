## MODIFIED Requirements

### Requirement: Guess game implements the Game interface

The engine SHALL provide a registered `guess` game implementing
`Game<GuessParams, GuessState, GuessMove, GuessUi, GuessDrawState>`: a Mastermind
clone in which the player deduces a hidden combination of `npegs` color pegs
drawn from `ncolors` colors within `nguesses` guess rows. Params SHALL be
`ncolors`, `npegs`, `nguesses`, `allowBlank`, and `allowMultiple`, encoded
`c{ncolors}p{npegs}g{nguesses}{b|B}{m|M}` with lenient decode (unknown letters
ignored). The two upstream presets — **Standard** (`6,4,10,false,true`) and
**Super** (`8,5,12,false,true`) — SHALL be offered. `validateParams` SHALL reject
`ncolors < 2` or `npegs < 2`, `ncolors > 10`, `nguesses < 1`, and
`allowMultiple = false` with `ncolors < npegs`. The game SHALL provide `statusbarText` and `solve`, and SHALL NOT provide `textFormat` or `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ ncolors: 8, npegs: 5, nguesses: 12, allowBlank: false, allowMultiple: true }`
  are encoded
- **THEN** the result is `c8p5g12Bm`
- **AND** decoding `c8p5g12Bm` round-trips those params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `allowMultiple: false` and
  `ncolors: 3, npegs: 4`
- **THEN** it returns a non-null error string

### Requirement: Guess says why a row will not go

Guess SHALL provide `statusbarText`. The line
SHALL name the guess in progress and the number available, and — when the
working row cannot be submitted because a color repeats under
`allowMultiple: false` — SHALL say so.

The submit arms answer an unsubmittable row with `null`, and a key that appears
to do nothing is indistinguishable to a player from one that is broken. This is
the refusal made legible, and it is the reason the Submit key can be offered
unconditionally.

#### Scenario: A repeat under no-duplicates is explained

- **WHEN** the working row is filled with a repeated color in a game with
  `allowMultiple: false`
- **THEN** the submit key produces no move and the status line says that
  repeated colors are not allowed

#### Scenario: The explanation goes when the repeat does

- **WHEN** the repeated color is replaced by one the row does not already hold
- **THEN** the status line no longer mentions repeated colors and the submit key
  produces a guess move
