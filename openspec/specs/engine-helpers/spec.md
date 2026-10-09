# engine-helpers Specification

## Purpose
The shared algorithmic helpers a game would otherwise copy, and the catalog
that names them: the disjoint-set forest, loop finding, the deduction fixpoint,
grid coordinates and the small parsers.

## Requirements

### Requirement: The engine provides a shared disjoint-set forest (dsf)

The engine SHALL provide the `Dsf` class in `src/engine/dsf.ts`. The class
SHALL support `constructor(n)`, `reinit()`, `canonify(i)`, `merge(a, b)`,
`size(i)` (the number of elements in `i`'s class) and `equivalent(a, b)`
(whether `a` and `b` share a class), with path compression and union by size.
A game that needs union-find SHALL import it from this shared location.

#### Scenario: A game imports the shared Dsf

- **WHEN** a game needs disjoint-set operations
- **THEN** it imports `Dsf` from `src/engine/dsf.ts`
- **AND** no game directory contains a local `dsf.ts`

#### Scenario: Size and equivalence reflect merges

- **WHEN** elements are merged into a class and `size` and `equivalent` are
  queried
- **THEN** `size(i)` returns the count of elements in `i`'s class for any
  member `i`
- **AND** `equivalent(a, b)` returns true if and only if `a` and `b` are in
  the same class

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

A grid game SHALL import `coord` and `fromCoord` instead of re-deriving the
mapping locally. The one override is truncation toward zero, which folds a
press inside the top or left margin onto row or column 0 where `fromCoord`
answers a negative index: a game that takes it SHALL say so at its own
conversion.

#### Scenario: A game fixes its border in a wrapper

- **WHEN** a game's border is a function of the tile size
- **THEN** its own `fromCoord(pixel, tileSize)` calls the engine's with that
  border, and holds no division of its own

#### Scenario: A game folds a margin press onto the first cell

- **WHEN** a game needs a press in the top or left margin to land on row or
  column 0
- **THEN** its conversion truncates toward zero, and the comment on it says
  that the truncation is what folds the press onto the first cell

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
`src/engine/findloop.ts`: Tarjan's bridge finding, non-recursive linked-list
form. It takes a neighbor callback `(vertex: number) => Iterable<number>` over
an undirected graph and returns `{ anyLoop, isLoopEdge(u, v), isBridge(u, v)
}`. An edge SHALL be a loop edge exactly when
it is not a bridge: removing it would not disconnect its component. `isBridge`
SHALL answer the vertex counts either side of a bridge, `null` for a loop
edge.

#### Scenario: A cycle's edges are loop edges

- **WHEN** `findLoops` runs over a graph containing a cycle with a tail
- **THEN** `anyLoop` is true, every cycle edge reports `isLoopEdge` true,
  and the tail edge reports `isLoopEdge` false

#### Scenario: A forest has no loops

- **WHEN** `findLoops` runs over a multi-component tree graph
- **THEN** `anyLoop` is false and every edge is a bridge with correct
  vertex counts on each side

### Requirement: A game that flags a forbidden loop uses the loop finder

A game that needs loop-error detection, where its rules forbid a loop, SHALL
consume `findLoops` and SHALL NOT re-roll it.

#### Scenario: A game highlights the edges of a loop

- **WHEN** a game in which any loop is an error marks the edges that form one
- **THEN** it asks `isLoopEdge` of each edge, over a neighbor callback built
  from its own board

### Requirement: The engine catalog names every shared helper there is

`docs/games/engine-catalog.md` SHALL carry an entry for every module under
`src/engine/`, so that the menu a game author consults before re-rolling a
helper cannot silently shrink. A module deliberately without an entry of its
own SHALL be recorded in a ledger carrying its reason, and that ledger SHALL
fail when it names a module that no longer exists.

#### Scenario: A new engine module ships without a catalog entry

- **WHEN** a module is added under `src/engine/` and the catalog is not updated
- **THEN** the gate fails, naming the module and pointing at the catalog

### Requirement: The catalog check runs ahead of the documentation-only shortcut

The check that holds the catalog complete SHALL run in the pre-commit gate's
fast prefix, ahead of the documentation-only shortcut. It SHALL NOT be a vitest
file, because a test that read `docs/` would make that shortcut unsafe
(`repo-layout`).

#### Scenario: A documentation-only commit deleting an entry is still checked

- **WHEN** a commit touches only `docs/` and removes a module's catalog entry
- **THEN** the check still runs, because it sits ahead of the
  documentation-only shortcut

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

### Requirement: A timing comparison warms every arm and carries a control

Where two implementations are compared by timing, every arm SHALL be exercised
once before the clock starts, the arms SHALL be interleaved with rotating
order, and the minimum SHALL be reported beside the median. An A/A control arm
SHALL be timed alongside them, so that a ratio that is an artifact of module
load order or of warm-up has somewhere to show up.

#### Scenario: an arm is timed against another

- **WHEN** an imported table is timed against a module-local one
- **THEN** both arms and the control are run once before the clock starts, and
  then timed interleaved in rotating order

#### Scenario: a control looks suspiciously tight

- **WHEN** a paired-timing control is suspected of flattering itself
- **THEN** the suspicion is checked by warming the arms, not by loading a
  second module instance

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

#### Scenario: A desc codec reads a number the same way

- **WHEN** a game's desc carries a decimal number (a clue, a run length, a
  coordinate)
- **THEN** the codec reads it with `parseLeadingInt`
