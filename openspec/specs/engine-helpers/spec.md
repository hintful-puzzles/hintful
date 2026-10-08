# engine-helpers Specification

## Purpose
The shared algorithmic helpers a game would otherwise copy, and the catalog
that names them: the disjoint-set forest, loop finding, the deduction fixpoint,
grid coordinates and the small parsers.

## Requirements

### Requirement: The engine provides a shared disjoint-set forest (dsf)

The engine SHALL provide the `Dsf` class in `src/engine/dsf.ts`, promoted from the Galaxies local implementation. The class SHALL support `constructor(n)`, `reinit()`, `canonify(i)`, `merge(a, b)`, `size(i)` (the number of elements in `i`'s class), and `equivalent(a, b)` (whether `a` and `b` share a class) with path compression and union-by-size. Games that need union-find SHALL import from this shared location.

#### Scenario: A game imports the shared Dsf

- **WHEN** a game needs disjoint-set operations
- **THEN** it imports `Dsf` from `src/engine/dsf.ts`
- **AND** no game directory contains a local `dsf.ts`

#### Scenario: Size and equivalence reflect merges

- **WHEN** elements are merged into a class and `size`/`equivalent` are queried
- **THEN** `size(i)` returns the count of elements in `i`'s class for any member `i`
- **AND** `equivalent(a, b)` returns true iff `a` and `b` are in the same class

### Requirement: The engine provides shared grid-coordinate helpers

The engine SHALL provide `coord(pos: number, tileSize: number, border: number):
number` and `fromCoord(pixel: number, tileSize: number, border: number): number`
in `src/engine/geometry.ts`, implementing the upstream `COORD` /
`FROMCOORD` mapping with the caller supplying the per-game border (most games
use `Math.floor(tileSize / 2)`). `fromCoord` SHALL use `Math.floor((pixel −
border) / tileSize)` directly — correct for pixels in the border region without
the C truncating-division idiom (`+k·tileSize / −k`) that per-game copies carry.
Grid games SHALL import these instead of re-deriving the mapping locally.

#### Scenario: A game maps a pixel inside a cell to that cell

- **WHEN** a game calls `fromCoord(pixel, tileSize, border)` for a pixel that
  lies within cell `c`'s extent
- **THEN** the result is `c`
- **AND** `coord(c, tileSize, border)` returns the cell's top-left pixel

#### Scenario: A border-region click maps to a negative cell index

- **WHEN** `fromCoord` receives a pixel left of the first cell (inside the
  border, `pixel < border`)
- **THEN** it returns a negative index (so the caller's bounds check rejects it),
  matching the upstream macro's intent without the truncation workaround

### Requirement: The engine provides a shared permutation-parity helper

The engine SHALL provide `permParity(perm: Int32Array, n: number): number` in
`src/engine/shuffle.ts`, returning the parity (0 or 1) of the number of
inversions in the first `n` entries of `perm` — the idiomatic shared form of the
generator parity check used by sliding-tile puzzles. Per-game parity *correction*
(which entries to swap, and under what condition) SHALL remain local to each
game's generator.

#### Scenario: Parity reflects the inversion count

- **WHEN** a game calls `permParity` on a permutation with an odd number of
  inversions
- **THEN** the result is `1`
- **AND** a permutation with an even number of inversions yields `0`

### Requirement: A shared deduction-fixpoint scaffold

The engine SHALL provide a reusable deduction-fixpoint runner (in
`src/engine/`) that a logic game's solver and its explained hint share, so
the ordered-technique loop, the difficulty cap, the optional recorder threading,
and the non-termination step-budget are written **once** rather than hand-rolled
per game.

**A technique is a declaration, not a closure.** The runner SHALL take an
ordered list of techniques, each declaring a stable `id`, the difficulty `tier`
it belongs to, and a `run` reporting whether it changed the board (`> 0` fired,
`0` nothing to do, `< 0` contradiction proved). Both `id` and `tier` SHALL be
required: a ladder states its own tiers rather than encoding them in array
positions, and states its own names rather than leaving a reader to count.

**The grade and the cap are tiers, never positions.** The runner SHALL report as
the grade the highest `tier` among the techniques that fired, and SHALL accept an
optional maximum *tier* that excludes every technique above it **wherever it sits
in the ladder** — so a cheap technique placed after an expensive one is still
run under a low cap. Grading a board SHALL NOT depend on a technique's index.

**A conditionally-available technique SHALL guard itself inside `run` and return
`0`.** The runner SHALL NOT provide an availability predicate: such a predicate
would be indistinguishable in effect from returning `0`, so it would exist only
to document, and one option per game is how this runner becomes a configuration
language. A game whose technique applies only under a board rule (a variant
mode) or only at one exact tier expresses that in its own `run`.

**The runner SHALL accept an optional early-out meaning "the ladder should stop,
because there is nothing left for it to do"**, checked at the top of every
iteration so no technique is attempted on an already-settled board. This SHALL
NOT be specified as "solved": most callers use it to stop on a contradiction, on
a refuted board, or on an action budget the game itself imposes, and a name
narrower than its meaning obliges every reader to consult the doc comment.

The runner SHALL also accept an optional recorder that, when present, gates every
reason allocation so the generation path stays byte-for-byte unchanged and, when
absent, runs unguarded. The runner SHALL tick a step budget once per iteration
**only** on the recording (hint) path, so a non-terminating fixpoint throws a
labeled error while the generator runs unbudgeted. **When a budget is present the
runner SHALL attribute a non-termination to the technique responsible**, naming
the techniques by firing count in the thrown error; when no budget is present it
SHALL count nothing, so the generation path allocates nothing extra.

The techniques themselves remain per-game (each game's deductions are its own);
only the loop, cap, recorder-gating, budget and attribution are shared. Games
that hand-roll this loop SHALL converge onto the shared runner without changing
their techniques, order, or verdicts.

**A game that does not fit SHALL have its reason recorded against this contract,
and that record SHALL be re-derived rather than carried forward when the contract
changes** — a reason that a game did not fit an earlier runner is not evidence
about the current one. A recorded reason SHALL name **a promise this runner makes
that the game must break**; a description of the game's loop shape is not such a
reason. Adoption SHALL require no new option on the runner: a game that would
need one stays bespoke.

**A bespoke loop SHALL carry three obligations, recorded per game rather than
assumed**: every board it accepts remains walkable to completion by a hint
projection, its tiers bind to real technique differences, and a non-terminating
recording path fails loud. An obligation that is **vacuous** rather than
satisfied SHALL be recorded as unmet.

#### Scenario: The generation path is unchanged by the shared runner

- **WHEN** a game's solver runs through the shared runner with no recorder
- **THEN** it reaches the same solved/stuck verdict (and, where graded, the same
  difficulty) as before the extraction
- **AND** its differential / behavioral regression suite stays green

#### Scenario: The hint path records off the same runner

- **WHEN** the same game runs the shared runner with a recorder on the hint path
- **THEN** each firing is recorded with its technique and premise in solver order
- **AND** a non-terminating fixpoint on the hint path throws a labeled
  step-budget error rather than hanging

#### Scenario: Two techniques sharing one tier grade alike

- **WHEN** a ladder declares two techniques at the same `tier` and only the later
  one fires
- **THEN** the reported grade is that shared tier, not the technique's position
  in the ladder

#### Scenario: A cap excludes by tier, not by position

- **WHEN** a ladder places a low-tier technique after a high-tier one and runs
  under a cap below the high tier
- **THEN** the high-tier technique is skipped and the low-tier one still runs

#### Scenario: A runaway technique is named

- **WHEN** a technique on the recording path reports progress without changing
  the board until the step budget trips
- **THEN** the thrown error names the techniques by firing count, so the
  responsible one is identified without bisecting the ladder

#### Scenario: The early-out stops a refuted board, not only a solved one

- **WHEN** a game's early-out reports that the board is refuted, or that a budget
  the game imposes on itself is spent
- **THEN** the ladder stops without attempting a further technique, exactly as it
  does for a completed board

#### Scenario: A recorded no-go is re-derived, not copied, when the contract moves

- **WHEN** the runner's contract changes such that a previously recorded reason
  no longer names a promise the game must break
- **THEN** that game is re-derived against the new contract, and adopts it if
  adoption needs no new option on the runner

### Requirement: The engine provides a shared loop-finding helper

The engine SHALL provide `src/engine/findloop.ts`, an idiomatic TS
port of upstream `findloop.c` (Tarjan's bridge-finding algorithm, the
non-recursive linked-list variant): `findLoops(nvertices, neighbors)`
takes a neighbor callback `(vertex: number) => Iterable<number>` over an
undirected graph and returns `{ anyLoop, isLoopEdge(u, v),
isBridge(u, v) }`, where an edge is a loop edge exactly when it is not a
bridge (its removal would not disconnect its component) and `isBridge`
optionally reports the vertex counts on either side. Games needing
loop-error detection (Slant now; Bridges, Dominosa, Loopy, Tracks when
ported) SHALL consume this helper rather than re-rolling it.

#### Scenario: A cycle's edges are loop edges

- **WHEN** `findLoops` runs over a graph containing a cycle with a tail
- **THEN** `anyLoop` is true, every cycle edge reports `isLoopEdge` true,
  and the tail edge reports `isLoopEdge` false

#### Scenario: A forest has no loops

- **WHEN** `findLoops` runs over a multi-component tree graph
- **THEN** `anyLoop` is false and every edge is a bridge with correct
  vertex counts on each side

### Requirement: The engine catalog names every shared helper there is

`docs/games/engine-catalog.md` SHALL carry an entry for every module under
`src/engine/`, so the menu a game author consults before re-rolling a helper
cannot silently shrink. A module deliberately without its own entry SHALL be
recorded in a ledger carrying its reason, and that ledger SHALL fail when it
names a module that no longer exists.

The check SHALL run in the pre-commit gate's fast prefix, ahead of the
documentation-only shortcut, and SHALL NOT be a vitest file — a test reading
`docs/` would make that shortcut unsafe (`repo-layout`).

#### Scenario: A new engine module ships without a catalog entry

- **WHEN** a module is added under `src/engine/` and the catalog is not updated
- **THEN** the gate fails, naming the module and pointing at the catalog

#### Scenario: A documentation-only commit deleting an entry is still checked

- **WHEN** a commit touches only `docs/` and removes a module's catalog entry
- **THEN** the check still runs, because it sits ahead of the documentation-only
  shortcut

### Requirement: A hot constant's placement is decided by the build, not by the suite
A constant that a hot loop reads MAY be hoisted into a shared module, and a
slowdown observed under vitest SHALL NOT by itself forbid the hoist. Where such a
constant is kept module-local for speed, the comment saying so SHALL record the
measured ratio, its control, and that the cost does not reach a player.

Measured 2026-09-12 on Range's generator, three arms in one process, rotated and
interleaved, 21 reps, four runs: an imported table costs **1.62–1.73×** against
an A/A control of **0.98–1.01**. The mechanism is not in doubt — vite's
module-runner transform rewrites `DR[i]` to `__vite_ssr_import_0__.DR[i]` and
defines every export as a getter, so the loop pays an accessor call per access.

**It does not survive bundling.** `vite build` flattens the two modules into one
scope and the read compiles to a direct `var` access, byte-identical to the
module-local form. The cost is a fact about the suite; a refactor that removes
six copies of a table makes the tests slower and the game exactly as fast.

#### Scenario: a shared table is proposed for a hot loop

- **WHEN** a constant read inside a solver or generator loop is proposed for a
  shared module
- **THEN** the decision is made on what the production build emits, and the
  suite's slowdown is weighed only as suite cost
- **AND** if the constant stays local, the comment says so with its measurement
  rather than asserting a bare multiplier

#### Scenario: an arm is timed against another

- **WHEN** two implementations are compared by timing
- **THEN** every arm is exercised once before the clock starts, the arms are
  interleaved with rotating order, and the minimum is reported beside the median
- **AND** an A/A control arm is timed alongside them, so a ratio that is really
  an artifact of module load order or of warm-up has somewhere to show up

#### Scenario: a control looks suspiciously tight

- **WHEN** a paired-timing control is suspected of flattering itself
- **THEN** the suspicion is checked by warming the arms rather than by loading
  a second module instance
- **AND** measured here, one instance timed twice (0.98–1.02) and two separately
  loaded instances (0.98–1.01) are indistinguishable once every arm is warmed

### Requirement: The engine provides a shared leading-integer parser

The engine SHALL provide `parseLeadingInt(s: string, start: number): { value: number; next: number }` in `src/engine/decimal.ts`, returning the integer formed by the maximal digit run starting at `start` (0 when the run is empty) and the index of the first non-digit character — unchanged from `start` when there was no digit, which is how a caller tells "no number here" from "zero". A game that reads a digit run from a param string **or a game description** SHALL call this instead of scanning the run itself, in any spelling: an accumulator (`n = n * 10 + …`), a collected substring passed to `Number.parseInt`, a `parseInt` of the tail followed by a skip, or a locally named helper. A loop that skips digits *and* another character (a `.` in a percentage) is not a digit run and MAY stay a loop written with the shared `isDigit`.

#### Scenario: A game decodes a WxH param string

- **WHEN** a game's `decodeParams` parses `"10x7"` using `parseLeadingInt`
- **THEN** the first call returns `{ value: 10, next: 2 }` and a second call starting after the `"x"` returns `{ value: 7, next: 4 }`
- **AND** no game file declares a copy under any name — the guard finds a copy by its shape (a relational comparison against a one-digit string), not by the name `parseLeadingInt`

#### Scenario: A desc codec reads a number the same way

- **WHEN** a game's desc carries a decimal number (a clue, a run length, a coordinate)
- **THEN** the codec reads it with `parseLeadingInt` and the desc bytes are unchanged from the hand-rolled scan it replaced
