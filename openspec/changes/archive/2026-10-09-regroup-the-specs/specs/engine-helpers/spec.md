## ADDED Requirements

### Requirement: A shared abstraction states its actual scope, not an aspirational one

A shared module's documentation SHALL describe the scope it actually has. A
module that documents itself as universal while fitting a minority of its
candidates SHALL be corrected, and its known non-fits SHALL be named in the
module itself with the reason each does not fit. An abstraction's stated scope
is part of its API: fitting a minority of callers is not a defect, and
claiming otherwise is.

#### Scenario: A game is considered for a shared abstraction

- **WHEN** a contributor evaluates whether a game's solver fits the shared
  deduction runner
- **THEN** the module names the known non-fits and why, so the evaluation
  starts from evidence rather than from an implied obligation
- **AND** a solver whose loop merely *resembles* the shared one is not treated
  as fitting until its differential says so

#### Scenario: An audit finds the majority do not fit

- **WHEN** an audit of candidates for a shared abstraction finds most do not
  fit
- **THEN** the correct outcome is a short adoption list, a recorded no-go
  list, and a corrected module header, and not a widened abstraction
- **AND** candidates that were not individually examined are recorded as
  **unaudited**, never counted as no-gos

### Requirement: A shared declarative helper is adopted by every game it fits

Every game that an engine-provided declarative-table helper fits SHALL use it,
and a game that does not SHALL have its reason recorded. The helpers in
question emit tables a game would otherwise hand-write:
`dimensionParamConfig()` for width/height params, and the shared pencil-mark
preference declarations. Adopting such a helper SHALL be a no-op: no
differential and no render snapshot moves.

#### Scenario: A new port declares its params config

- **WHEN** a newly ported game with width and height params declares
  `paramConfig`
- **THEN** it calls `dimensionParamConfig()` rather than writing the table
- **AND** its Custom-type dialog behaves identically to every other game's

### Requirement: A per-game label states only what holds on every board

A per-game label SHALL state only what holds for every board that game can
deal. Where the fact it states varies within the game, as Solo's auto-pencil
clears a diagonal only under X and a cage only under Killer, the label SHALL
name the relation rather than enumerate, since a declarative table has no
params in scope. A label that differs between games because it states a
game-specific fact SHALL be a required argument of the shared helper, never a
default.

#### Scenario: A helper is parameterized by a player-visible string

- **WHEN** a shared declarative helper's label differs between games because
  it states a game-specific fact (the auto-pencil preference names what that
  game's placement clears)
- **THEN** the label is a **required** argument, never a default
- **BECAUSE** a default that only some callers want is a sentence a game can
  inherit while it is silently wrong about that game

#### Scenario: A label enumerates a structure that varies within the game

- **WHEN** a declarative label would list the parts of a structure the game
  derives elsewhere, and which parts exist depends on the params
- **THEN** the label names the relation instead, so that it holds on every
  board the game can deal
- **BECAUSE** the enumeration is a copy of the derivation that no single board
  makes true

### Requirement: The engine answers which character is a digit, once

The engine SHALL provide, in `decimal.ts`, `isDigit(c: string): boolean` and
`digitValue(c: string): number | null`: the value `0`–`9` a decimal digit
character stands for, or `null` for any other character. The absent case SHALL
sit outside the number domain, so no caller can use the result without
discriminating it. `digitValue` on a character, `c2n` on a desc character and
`digitOf` on a key SHALL agree on every digit, and a test SHALL hold them
equal.

#### Scenario: A character that is no digit has no value

- **WHEN** a caller reads `digitValue("7")` and `digitValue("x")`
- **THEN** it receives `7` and `null`

### Requirement: A game reads and writes a digit character through the engine

A game SHALL read a digit character through `isDigit` and `digitValue` and
SHALL write a single digit as `String(n)`. It SHALL NOT declare its own
`isDigit`, compare a character against a one-digit string with a relational
operator, subtract a digit code from a character code, or add one to build a
character. A hex nibble read case-insensitively (a bitmap of mines or lit
cells) is not a decimal digit and is read with `Number.parseInt(c, 16)`.

#### Scenario: A private copy fails the build

- **WHEN** a game source declares an `isDigit`, `digitValue`,
  `parseLeadingInt`, `n2c`, `c2n`, `n2cUpper`, `c2nUpper`, `scanRunLength` or
  `encodeRunLength` of its own
- **THEN** a guard reports it, the reserved names being read from the fact
  modules' own export lists

### Requirement: The meaning of a digit character stays with the game

What a digit character's value means SHALL stay with the game: the bound it
accepts and what an out-of-range value does (an error message, a sentinel, a
rejected desc) are written beside the call. A write into a typed array SHALL
name that array's own absent constant (`?? EMPTY`, `?? -1`) and SHALL NOT
inherit a codec's, and a write that is safe only because `validateDesc`
screened the character SHALL say so at the write.

#### Scenario: A run-length game reads a bounded clue

- **WHEN** Slant's `validateDesc` meets a value token
- **THEN** it reads `digitValue(tok.value)` and applies its own bound of `4`,
  rejecting `5` with its own message and a letter with its own message

#### Scenario: A stray character cannot be stored without a decision

- **WHEN** Filling's `newState` writes a clue into its `Uint8Array`, whose
  absent value is `0`
- **THEN** the write names `EMPTY` for a character that is not a digit, and a
  non-digit can never be stored as `255`

### Requirement: The recording path steps the ladder one firing at a time through the engine

The engine SHALL provide, beside the deduction-fixpoint runner, a driver that
runs the same ladder one firing per call (`singleFirings`), and a hint that
records a firing at a time SHALL use it and SHALL NOT bend the runner's
early-out into a stop condition. The driver and the runner SHALL share one pass
down the ladder, so the tier cap, the restart rule and the budget cannot differ
between the solver's projection and the hint's.

#### Scenario: One firing per call

- **WHEN** a hint calls the driver on a board where two techniques each have
  work to do
- **THEN** each call returns exactly one firing, restarting from the easiest
  technique
- **AND** a call after the ladder is exhausted returns nothing

### Requirement: A call of the driver returns one firing, and a contradiction is sticky

Each call SHALL run the ladder from its first technique and return the technique
that fired, or nothing when no technique fires or the early-out says there is
nothing left to do. A contradiction SHALL be sticky: once a technique proves the
board inconsistent, the driver SHALL report it and SHALL run no technique again.
The step budget SHALL be required, and its attribution tally SHALL outlive a
single call, so a technique that runs away across many calls is named.

#### Scenario: A contradiction stops the driver for good

- **WHEN** a technique proves the board inconsistent
- **THEN** the driver reports the contradiction and returns nothing
- **AND** no technique runs on any later call

### Requirement: The driver returns a firing the player cannot see

The driver SHALL return every firing, including one that changed nothing the
player can see. Whether a firing is shown SHALL be the plan loop's decision,
where a hidden firing still advances the board and is counted: a driver that
skipped such firings would hide them where nothing counts them.

#### Scenario: A firing with nothing to show is still returned

- **WHEN** a technique fires but records no move the player could make
- **THEN** the driver returns it like any other firing
- **AND** the plan loop's `showable` hides it and counts it as hidden
