## ADDED Requirements

### Requirement: A set outlines the cells it rests on

A generic Latin set elimination SHALL record the cells whose candidates account for the
values it strikes, and a game's hint SHALL outline them as the step's evidence, so the
sentence that names them ("the outlined cells already account for …") points at cells
the player can see.

#### Scenario: A set's sentence names outlined cells

- **WHEN** a row/column game's hint strikes a candidate by a set
- **THEN** the step outlines the cells of the set and its sentence speaks of the
  outlined cells

### Requirement: The candidate walk stamps the steps it builds

The candidate walk SHALL stamp the steps it builds: a placement or a strike
with the kind of the reason it narrates, and its own setup steps and a
placement's cull with ids the engine owns. A game on the walk SHALL therefore
write its `hintRungs` list and no stamp. Where a game's words for a placement narrate
another of its reasons than the one the walk handed it, the game SHALL say
which, so that a step's rung and its sentence name the same deduction.

#### Scenario: A candidate game writes no stamp

- **WHEN** a game builds its plan through the shared candidate walk
- **THEN** each step's rung is the kind of the reason the walk narrated, or
  the engine's id for a setup step or a cull
- **AND** the game's list is the engine's ids and its own reasons' kinds

#### Scenario: A sentence of another reason

- **WHEN** a game's words for a placement are those of a reason other than
  the one the walk found, as a one-cell area's are a singleton's
- **THEN** the step carries that reason's rung, not the one the walk found

### Requirement: A rung list holds only the rungs of the readings its plan walks

A game's list SHALL hold only the rungs of the readings its plan walks. A plan
that gives a setup of its own walks the populate reading alone, and cannot
speak two of the walk's rungs: the implicit reading's note step, and the single
read off a cell with no notes. Such a plan's step type SHALL lack both, so its
game's list lacks them and its tests excuse neither.

#### Scenario: A plan on the populate reading alone

- **WHEN** a game's plan gives a setup of its own
- **THEN** its rung list holds neither the note step nor the single of a cell
  with no notes, and its tests pin a board for every rung left

### Requirement: A plan's setup declares the reading it walks

The setup is the declaration of the reading, since the walk already runs it. A
plan typed on the populate reading alone SHALL NOT compile without a setup, a
plan typed on both readings SHALL NOT compile with one, and the walk SHALL
throw, and not read a single off a cell with no notes, on a plan that gave a
setup.

#### Scenario: The walk would read a single off a cell with no notes

- **WHEN** a plan that gave a setup of its own reaches a single the walk would
  read off a cell with no notes
- **THEN** the walk throws, naming the plan, where it would have stamped the
  step with a rung the list lacks

## REMOVED Requirements

### Requirement: A reading over the continuity bound is named in a ledger

**Reason**: process: docs/games/hints.md § "Continue from the last step" states
it whole in its closing sentences: the guard bounds the jumps "under every
reading the game offers", and "A reading known to be over the bound sits in the
test's `OVER_BOUND` ledger with the change that owns it, and the walk asserts
it is still over, so fixing it retires the entry." Read 2026-10-09; the ledger
in `src/engine/hint-frontier.test.ts` is empty today.

### Requirement: The recording path steps the ladder one firing at a time through the engine

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: A call of the driver returns one firing, and a contradiction is sticky

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: The driver returns a firing the player cannot see

**Reason**: Moved to `engine-helpers`, with its words.
