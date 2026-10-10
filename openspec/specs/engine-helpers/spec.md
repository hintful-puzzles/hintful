# engine-helpers Specification

## Purpose

The shared algorithmic helpers a game would otherwise copy, and the catalog
that names them: the disjoint-set forest, loop finding, grid coordinates, the
small parsers and the decimal-character helpers, the contract of the deduction
fixpoint that a solver and its hint share, and the rules for the scope a
shared helper claims and which games adopt it.

## Requirements

### Requirement: The engine provides a shared disjoint-set forest (dsf)

The engine SHALL provide the disjoint-set forest `Dsf` in `src/engine/dsf.ts`.
A game that needs union-find SHALL import it from there and SHALL NOT hold a
copy of its own.

#### Scenario: A game imports the shared Dsf

- **WHEN** a game needs disjoint-set operations
- **THEN** it imports `Dsf` from `src/engine/dsf.ts`
- **AND** no game directory contains a local `dsf.ts`

### Requirement: The engine provides shared grid-coordinate helpers

The engine SHALL provide `coord(pos: number, tileSize: number, border: number):
number` and `fromCoord(pixel: number, tileSize: number, border: number): number`
in `src/engine/geometry.ts`, mapping between a cell index and its top-left
pixel along one axis, with the caller supplying the game's own border.
`fromCoord` SHALL be `Math.floor((pixel − border) / tileSize)` directly, which
is correct for a pixel in the border region with no truncating-division
workaround.

#### Scenario: A game maps a pixel inside a cell to that cell

- **WHEN** a game calls `fromCoord(pixel, tileSize, border)` for a pixel that
  lies within cell `c`'s extent
- **THEN** the result is `c`
- **AND** `coord(c, tileSize, border)` returns the cell's top-left pixel

#### Scenario: A border-region click maps to a negative cell index

- **WHEN** `fromCoord` receives a pixel left of the first cell (inside the
  border, `pixel < border`)
- **THEN** it returns a negative index, so the caller's bounds check rejects it

### Requirement: A grid game imports the coordinate helpers

A game, and a helper games share, SHALL take the cell a pixel falls in from
`fromCoord` and SHALL NOT write its division out again. The one
override folds a press in the top or left margin onto the first row or column
the game draws there, where `fromCoord` answers one further out: a game that
takes it SHALL say so at its own conversion and name `fromCoord` as what it
declines. A position that keeps its fraction of a tile, and a change of scale
to a tiling's units, are not this mapping.

#### Scenario: A game fixes its border in a wrapper

- **WHEN** a game's border is a function of the tile size
- **THEN** its own `fromCoord(pixel, tileSize)` calls the engine's with that
  border, and holds no division of its own

#### Scenario: A game folds a margin press onto the first cell

- **WHEN** a game needs a press in the top or left margin to land on row or
  column 0
- **THEN** its conversion truncates toward zero, and the comment on it says
  that the truncation is what folds the press onto the first cell

#### Scenario: Only the outline folds

- **WHEN** a game gives the first square the pixels of the outline drawn
  before it and no more of the margin, as Rome does
- **THEN** its conversion floors, holds the outline's pixels to row or column
  0, and its comment names `fromCoord` as declined for those pixels

#### Scenario: Everything before the board is one index

- **WHEN** a game wants one answer for any pixel above or left of its board,
  as Tracks and Ascent do
- **THEN** it bounds what `fromCoord` returns, and holds no division of its
  own

#### Scenario: A change of scale

- **WHEN** Loopy turns a pointer's pixels into its tiling's units to find the
  nearest edge, or a tiling's extent into pixels
- **THEN** the division is its own, being no cell index

#### Scenario: A tile size under another name

- **WHEN** a conversion divides by a tile size the code calls something other
  than `ts`, `tile` or `tileSize`
- **THEN** the cross-game guard does not see it, which is the bound of what
  it measures: it recognizes the tile size by the names it goes by

#### Scenario: A legend sits between the margin and the grid

- **WHEN** a game draws a row and a column of headings outside its grid, and a
  press in the margin beyond them is to grab the heading beside it
- **THEN** its truncating conversion answers the heading's index for both, and
  its comment names `fromCoord` as declined

#### Scenario: A game reads where in a tile the pointer is

- **WHEN** a game tells a tile's corner from its edge from its center by the
  pointer's fraction of a tile, as Rect and Galaxies do
- **THEN** it divides for itself and says that `fromCoord` would floor the
  fraction away
- **AND** a game that wants the tile as well, as Net does, takes the tile from
  `fromCoord` and the fraction from its own division

### Requirement: The engine provides a shared permutation-parity helper

The engine SHALL provide `permParity(perm: Int32Array, n: number): number` in
`src/engine/shuffle.ts`, returning the parity (0 or 1) of the number of
inversions in the first `n` entries of `perm`: the generator's parity check for
a sliding-tile puzzle. Parity correction (which entries to swap, and under what
condition) SHALL remain local to each game's generator.

#### Scenario: Parity reflects the inversion count

- **WHEN** a game calls `permParity` on a permutation with an odd number of
  inversions
- **THEN** the result is `1`
- **AND** a permutation with an even number of inversions yields `0`

### Requirement: A shared deduction-fixpoint scaffold

The engine SHALL provide `runDeductionFixpoint` in
`src/engine/deduction-fixpoint.ts`, a reusable runner that a logic game's
solver and its explained hint share, so that the ordered-technique loop, the
difficulty cap, the step budget and its attribution are written once. The
techniques SHALL remain per game. A game that hand-rolls this loop SHALL
converge onto the shared runner without changing its techniques, their order
or its verdicts.

#### Scenario: The generation path is unchanged by the shared runner

- **WHEN** a game's hand-rolled loop is moved onto the shared runner and its
  solver runs with no budget
- **THEN** it reaches the same solved or stuck verdict on every board, and
  where it grades, the same difficulty

### Requirement: A technique is a declaration, not a closure

The runner SHALL take an ordered list of techniques, each declaring a stable
`id`, the difficulty `tier` it belongs to, and a `run` that reports whether it
changed the board: above zero when it fired, zero when there was nothing to
do, below zero when it proved a contradiction. Both `id` and `tier` SHALL be
required, so that a ladder states its own tiers and names and does not encode
them in array positions.

#### Scenario: A technique proves a contradiction

- **WHEN** a technique's `run` returns a number below zero
- **THEN** the runner stops and reports the board impossible, attempting no
  further technique

### Requirement: The grade and the cap are tiers, never positions

The runner SHALL report as the grade the highest `tier` among the techniques
that fired. It SHALL accept an optional maximum tier that excludes every
technique above it wherever that technique sits in the ladder, so a cheap
technique placed after an expensive one still runs under a low cap. Grading a
board SHALL NOT depend on a technique's index.

#### Scenario: Two techniques sharing one tier grade alike

- **WHEN** a ladder declares two techniques at the same `tier` and only the
  later one fires
- **THEN** the reported grade is that shared tier, not the technique's position
  in the ladder

#### Scenario: A cap excludes by tier, not by position

- **WHEN** a ladder places a low-tier technique after a high-tier one and runs
  under a cap below the high tier
- **THEN** the high-tier technique is skipped and the low-tier one still runs

### Requirement: A conditionally available technique guards itself in run

A technique that applies only under a board rule (a variant mode) or only at
one exact tier SHALL express that inside its own `run` and return `0` when it
does not apply. The runner SHALL NOT provide an availability predicate: it
would have the same effect as returning `0`, and one option per game is how a
runner becomes a configuration language.

#### Scenario: A variant-only technique on a board without the variant

- **WHEN** a ladder holds a technique for a variant rule and the board does not
  play that variant
- **THEN** the technique's `run` returns `0` and the runner goes on to the next
  technique, with nothing declared to the runner about the variant

### Requirement: The early-out means there is nothing left for the ladder to do

The runner SHALL accept an optional early-out, `settled`, meaning that the
ladder should stop because there is nothing left for it to do. It SHALL be
checked at the top of every iteration, so no technique is attempted on a board
that is already settled. It SHALL NOT be specified or named as "solved": a
caller also uses it to stop on a contradiction, on a refuted board, or on an
action budget the game itself imposes.

#### Scenario: The early-out stops a refuted board, not only a solved one

- **WHEN** a game's early-out reports that the board is refuted, or that a
  budget the game imposes on itself is spent
- **THEN** the ladder stops without attempting a further technique, exactly as
  it does for a completed board

### Requirement: The record is the game's, and the generation path allocates nothing

The runner SHALL NOT carry the record of a firing. On the hint path a technique
SHALL record its firing through its game's own recorder, as a side effect of
`run`, and SHALL allocate a reason only when that recorder is present. With no
budget and no caller's tally the runner SHALL allocate nothing, so the
generation path runs unguarded and stays byte-for-byte unchanged.

#### Scenario: The hint path records off the same runner

- **WHEN** a game runs the same ladder through the runner with its recorder on
  the hint path
- **THEN** each firing is recorded with its technique and premise, in solver
  order

### Requirement: The step budget ticks on the recording path only, and names the runaway technique

The runner SHALL accept an optional step budget and tick it once per iteration.
A caller SHALL pass it only on the recording (hint) path, so a fixpoint that
does not terminate there throws a labeled error while the generator runs
unbudgeted. When a budget is present the runner SHALL attribute a
non-termination to the technique responsible, naming the techniques by firing
count in the thrown error. With neither a budget nor a caller's tally it SHALL
count nothing.

#### Scenario: A runaway technique is named

- **WHEN** a technique on the recording path reports progress without changing
  the board until the step budget trips
- **THEN** the thrown error names the techniques by firing count, so the
  responsible one is identified without bisecting the ladder

#### Scenario: A hint path that does not terminate

- **WHEN** a fixpoint on the hint path never stops firing
- **THEN** it throws a labeled step-budget error and does not hang

### Requirement: A game that does not fit the runner records the promise it breaks

A game that does not fit SHALL have its reason recorded against this contract.
The reason SHALL name a promise this runner makes that the game must break; a
description of the shape of the game's loop is not such a reason. When the
contract changes, the record SHALL be re-derived and not carried forward.
Adoption SHALL require no new option on the runner: a game that would need one
stays bespoke.

#### Scenario: A recorded no-go is re-derived, not copied, when the contract moves

- **WHEN** the runner's contract changes such that a previously recorded reason
  no longer names a promise the game must break
- **THEN** that game is re-derived against the new contract, and adopts it if
  adoption needs no new option on the runner

### Requirement: A bespoke loop carries three obligations

A game whose solver keeps its own loop SHALL have three obligations recorded
for it, per game and not assumed: every board it accepts remains walkable to
completion by a hint projection, its tiers bind to real differences of
technique, and a recording path that does not terminate fails loud. An
obligation that is vacuous, and not satisfied, SHALL be recorded as unmet.

#### Scenario: An obligation that holds of nothing

- **WHEN** a game with a bespoke loop has no hint, so that no board can fail
  to be walked by one
- **THEN** its walkability obligation is recorded as unmet, not as met

### Requirement: The engine provides a shared loop-finding helper

The engine SHALL provide `findLoops(nvertices, neighbors)` in
`src/engine/findloop.ts`. It takes a neighbor callback `(vertex: number) => Iterable<number>` over
an undirected graph and returns `{ anyLoop, isLoopEdge(u, v), isBridge(u, v)
}`. An edge SHALL be a loop edge exactly when
it is not a bridge. `isBridge` SHALL answer the vertex counts either side of a
bridge, `null` for a loop edge. A neighbor reported twice is two edges to it,
which SHALL be a loop of the two.

#### Scenario: A cycle's edges are loop edges

- **WHEN** `findLoops` runs over a graph containing a cycle with a tail
- **THEN** `anyLoop` is true, every cycle edge reports `isLoopEdge` true,
  and the tail edge reports `isLoopEdge` false

#### Scenario: A forest has no loops

- **WHEN** `findLoops` runs over a multi-component tree graph
- **THEN** `anyLoop` is false and every edge is a bridge with correct
  vertex counts on each side

#### Scenario: Two edges between one pair

- **WHEN** `findLoops` runs over a path one of whose edges is reported twice,
  at its start, in its middle or at its end
- **THEN** it ends, `anyLoop` is true, that edge reports `isLoopEdge` true
  and the others are bridges

### Requirement: A game that flags a forbidden loop uses the loop finder

A game that needs loop-error detection, where its rules forbid a loop, SHALL
consume `findLoops` and SHALL NOT re-roll it.

#### Scenario: A game highlights the edges of a loop

- **WHEN** a game in which any loop is an error marks the edges that form one
- **THEN** it asks `isLoopEdge` of each edge, over a neighbor callback built
  from its own board

### Requirement: The engine catalog names every shared helper there is

`docs/games/engine-catalog.md` SHALL name every module directly under
`src/engine/`, and every directory of modules under it as one entry, so the
menu an author consults cannot silently shrink. A module without one SHALL be in a ledger with its reason, which SHALL fail when it
names a module that no longer exists. The check SHALL run in the
gate's fast prefix, ahead of the documentation-only shortcut, and SHALL NOT be
a vitest file: a test that read `docs/` would make that shortcut unsafe.

#### Scenario: A new engine module ships without a catalog entry

- **WHEN** a module is added under `src/engine/` and the catalog is not updated
- **THEN** the gate fails, naming the module and pointing at the catalog

#### Scenario: A documentation-only commit deleting an entry is still checked

- **WHEN** a commit touches only `docs/` and removes a module's catalog entry
- **THEN** the check still runs, because it sits ahead of the
  documentation-only shortcut

#### Scenario: A file is added inside a directory the catalog names

- **WHEN** a module is added to `src/engine/grid/`, which the catalog names as
  one entry
- **THEN** the check passes with no new entry, since the file is a part of
  that helper

### Requirement: A hot constant's placement is decided by the build, not by the suite

Whether a constant that a hot loop reads is hoisted into a shared module SHALL
be decided on what the production build emits. A slowdown observed under
vitest SHALL NOT by itself forbid the hoist: it is weighed only as a cost to
the suite. Where such a constant is kept module-local for speed, the comment
saying so SHALL record the measured ratio, its control, and that the cost does
not reach a player.

#### Scenario: a shared table is proposed for a hot loop

- **WHEN** a constant read inside a solver or generator loop is proposed for a
  shared module
- **THEN** the decision is made on what the production build emits, and the
  suite's slowdown is weighed only as suite cost
- **AND** if the constant stays local, the comment says so with its measurement
  and does not assert a bare multiplier

### Requirement: The engine provides a shared leading-integer parser

The engine SHALL provide `parseLeadingInt(s: string, start: number): { value:
number; next: number }` in `src/engine/decimal.ts`. It SHALL return the integer
formed by the maximal digit run starting at `start`, which is 0 when the run is
empty, and the index of the first character that is not a digit. That index
SHALL be unchanged from `start` when there was no digit, which is how a caller
tells "no number here" from "zero".

#### Scenario: A game decodes a WxH param string

- **WHEN** a game's `decodeParams` parses `"10x7"` using `parseLeadingInt`
- **THEN** the first call returns `{ value: 10, next: 2 }` and a second call
  starting after the `"x"` returns `{ value: 7, next: 4 }`

#### Scenario: There is no number at the index

- **WHEN** `parseLeadingInt` is called at an index that holds no digit
- **THEN** it returns the value 0 and `next` equal to `start`

### Requirement: A game reads a digit run with the shared parser

A game that reads a digit run from a param string or from a game description
SHALL call `parseLeadingInt` and SHALL NOT scan the run itself, in any
spelling: an accumulator (`n = n * 10 + …`), a collected substring passed to
`Number.parseInt`, a `parseInt` of the tail followed by a skip, or a helper
named locally. A loop that skips digits and another character (the `.` in a
percentage) is not a digit run, and is written with the shared `isDigit`.

#### Scenario: No game declares a copy

- **WHEN** the guard reads the games' source
- **THEN** no game file declares a copy under any name
- **AND** the guard finds a copy by its shape (a relational comparison against
  a one-digit string), not by the name `parseLeadingInt`

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
