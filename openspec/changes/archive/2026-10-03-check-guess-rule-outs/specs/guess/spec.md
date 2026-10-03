## MODIFIED Requirements

### Requirement: Guess game implements the Game interface

The engine SHALL provide a registered `guess` game implementing
`Game<GuessParams, GuessState, GuessMove, GuessUi, GuessDrawState, GuessMistake>`:
a Mastermind clone in which the player deduces a hidden combination of `npegs`
color pegs drawn from `ncolors` colors within `nguesses` guess rows. Params SHALL
be `ncolors`, `npegs`, `nguesses`, `allowBlank`, and `allowMultiple`, encoded
`c{ncolors}p{npegs}g{nguesses}{b|B}{m|M}` with lenient decode (unknown letters
ignored). The two upstream presets — **Standard** (`6,4,10,false,true`) and
**Super** (`8,5,12,false,true`) — SHALL be offered. `validateParams` SHALL reject
`ncolors < 2` or `npegs < 2`, `ncolors > 10`, `nguesses < 1`, and
`allowMultiple = false` with `ncolors < npegs`. The game SHALL provide
`statusbarText`, `solve` and `findMistakes`, and SHALL NOT provide `textFormat`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ ncolors: 8, npegs: 5, nguesses: 12, allowBlank: false, allowMultiple: true }`
  are encoded
- **THEN** the result is `c8p5g12Bm`
- **AND** decoding `c8p5g12Bm` round-trips those params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `allowMultiple: false` and
  `ncolors: 3, npegs: 4`
- **THEN** it returns a non-null error string

## ADDED Requirements

### Requirement: Guess checks the answer row's rule-outs against the code

Guess's `findMistakes` SHALL report each answer slot whose rule-out marks include
the code's color in that slot, as the slot alone, never the color, and nothing
once the game is over. It SHALL NOT read the guess rows, scored or in progress.
The mistake SHALL be drawn as a frame in the error color in the margin round the
slot's well, held in the slot's cache key so it repaints when it comes and goes.

#### Scenario: A rule-out of the code's own color

- **WHEN** the player rules out of a slot the color the code has there, and runs
  Check & Save
- **THEN** that slot is framed as a mistake and the board is not saved

#### Scenario: Every color ruled out

- **WHEN** every color is ruled out of a slot
- **THEN** that slot is reported, since one of those colors is the code's

#### Scenario: A guess that is not the code

- **WHEN** the player has submitted rows that are not the code, and no slot rules
  out its own color
- **THEN** `findMistakes` reports nothing
