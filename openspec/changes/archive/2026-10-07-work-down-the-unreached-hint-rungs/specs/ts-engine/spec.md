## MODIFIED Requirements

### Requirement: A cross-game guard SHALL assert that tiers bind

`ts-migration` § "A difficulty tier binds the board it generates" already
requires the behavior, and `engine/difficulty.ts`'s `solvableAtExactlyTier` is
its one expression. **This requirement adds only the check**, because until it
nothing in the collection compared the tier a board was generated at with the
tier the board needs: `difficulty-contract.test.ts` computed the lowest solving
cap and used it only as the floor of a monotonicity sweep — an assertion sitting
beside the very value that would have proved the point, measuring a neighbor of
it (`docs/method.md`).

A cross-game guard SHALL, over a population derived from the registry with no
enrollment list, require that a board dealt from a preset whose tier the game's
difficulty contract can read is solvable at that tier and at no lower one.

**The rule has two spellings and the guard SHALL be what makes them meet.** A
game's generator states the tier-acceptance rule in its own terms, and the
game's `DifficultyContract.solveAtCap` states it again for every cross-game
consumer. A game's own tests exercise only the first, so a contract whose capped
solve is *wider* than the tier it names is invisible: Undead's generator bounded
Easy at three arc-consistency passes while its contract ran arc-consistency
unbounded, so every Normal board graded as Easy-solvable and the collection's
difficulty guards read an Easy that was not Undead's. Neither side was checkable
alone.

**The guard SHALL be keyed on the presets a player can pick**, reading each
preset's own tier through the difficulty contract — never on a tier written onto
some other preset. The distinction is not pedantic: applying a hard tier to the
collection's smallest preset asks a question no generator can answer (a 4×4 Solo
board cannot be Hard however its params are labeled), and a guard written that
way reported ten violations across four games where there were three across one.
`validateParams` accepting a params record is not evidence that a board can carry
the tier in it.

**Exceptions SHALL be derived from a declaration the game already makes**, never
from a roster. A game that genuinely cannot generate a declared tier at
a given size SHALL refuse it from `validateParams` with a reason — the shape
already required by "either generates every declared tier, or refuses it with a
reason" — rather than being added to an exemption list.

**The guard SHALL carry a vacuity count.** It iterates presets whose tier is
readable; a contract that stopped reporting one would make every assertion pass
over nothing. The count of asserted preset cases SHALL be asserted above a floor.

**Cost SHALL be tiered rather than paid per commit.** The full matrix over every
preset of every tiered game is expensive; the per-commit slice samples seeds
through the shared budget helper and the full matrix runs in the opt-in slow
tier, with the doc comment stating what the gate slice still covers.

#### Scenario: A generator downgrades a tier

- **WHEN** a game's generator accepts a board its lower cap already solves, for a
  preset the menu labels with the higher tier
- **THEN** the cross-game guard fails, naming the game, the preset and the caps
  it found

#### Scenario: A contract's capped solve is wider than the tier it names

- **WHEN** a game's `solveAtCap` omits a bound its generator's tier-acceptance
  rule applies, so boards of a higher tier solve at a lower cap
- **THEN** the guard fails, even though the game deals correct boards and every
  test the game owns passes

#### Scenario: A tier is unreachable at a size

- **WHEN** a declared tier cannot be generated at some preset's size
- **THEN** the game refuses those params from `validateParams` with a reason,
  and the guard asserts nothing about a board that was never dealt

#### Scenario: A new game joins

- **WHEN** a game is registered that offers a difficulty choice
- **THEN** it is asserted by this guard from its first commit, with no line added
  anywhere to enroll it

### Requirement: A hint step SHALL name the rung it speaks

Every hint step SHALL carry `rung`, the id of the deduction it is, and every
game that declares a `hint` SHALL declare `hintRungs`, the list of every rung a
step of its hint can be, each once. A step's rung SHALL be one of its game's
`hintRungs`. `HintStep` and `Game` SHALL be typed by the game's rung union, so
that a game whose steps are typed by its list fails to compile when a step is
stamped with an id the list lacks.

A rung is the deduction, at the grain the game's solver or plan already names
it: the kinds of its reason union, or the branches of a hint that deduces
nothing. The legs of one journey SHALL share their firing's rung. Two wordings
of one deduction SHALL NOT be two rungs.

Whatever needs to know which deduction a step is SHALL read `rung`, and SHALL
NOT match the step's sentence to find out: the pins a game's tests read, the
narration ledger, and a render scenario that walks a plan to a step. A test MAY
still assert what a step's sentence says, where the wording is the thing under
test.

The candidate walk SHALL stamp the steps it builds: a placement or a strike
with the kind of the reason it narrates, and its own setup steps and a
placement's cull with ids the engine owns. A game on the walk SHALL therefore
write its list and no stamp. Where a game's words for a placement narrate
another of its reasons than the one the walk handed it, the game SHALL say
which, so that a step's rung and its sentence name the same deduction.

**A game's list SHALL hold only the rungs of the readings its plan walks.** A
plan that gives a setup of its own walks the populate reading alone, and two of
the walk's rungs are then ones it cannot speak: the implicit reading's note
step, and the single read off a cell with no notes. Such a plan's step type
SHALL lack both, so its game's list lacks them and its tests excuse neither;
until this a list said more than its game did, and the two were excused in
Salad's tests as rungs no board reached. The setup is the declaration, since
the walk already runs it: a plan typed on the populate reading alone SHALL NOT
compile without one, a plan typed on both SHALL NOT compile with one, and the
walk SHALL throw rather than read a single off a cell with no notes on a plan
that gave one.

A rung id is not player-facing: no sentence, help page, save or game ID holds
one.

#### Scenario: A reason kind missing from the list

- **WHEN** a game's hint gains a reason kind and its rung list does not
- **THEN** the game does not typecheck, at the line that stamps the step

#### Scenario: A hinted game without a list

- **WHEN** a registered game declares `hint` and not `hintRungs`, or lists a
  rung twice
- **THEN** the hint-quality suite fails, naming the game

#### Scenario: A step of a rung the list lacks

- **WHEN** the hint-quality walk meets a step whose rung is not in its game's
  `hintRungs`
- **THEN** it fails, quoting the step's sentence

#### Scenario: A candidate game writes no stamp

- **WHEN** a game builds its plan through the shared candidate walk
- **THEN** each step's rung is the kind of the reason the walk narrated, or
  the engine's id for a setup step or a cull
- **AND** the game's list is the engine's ids and its own reasons' kinds

#### Scenario: A sentence of another reason

- **WHEN** a game's words for a placement are those of a reason other than
  the one the walk found, as a one-cell area's are a singleton's
- **THEN** the step carries that reason's rung, not the one the walk found

#### Scenario: A plan on the populate reading alone

- **WHEN** a game's plan gives a setup of its own
- **THEN** its rung list holds neither the note step nor the single of a cell
  with no notes, and its tests pin a board for every rung left
- **AND** a single the walk would read off a cell with no notes throws, naming
  the plan, where it would have been stamped with a rung the list lacks
