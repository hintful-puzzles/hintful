## MODIFIED Requirements

### Requirement: Clean TS save format, and future game IDs stay stable

The project SHALL use a clean TypeScript-native save format. Compatibility
with the C-serialization save format, and with shared game IDs from before the
TypeScript engine, SHALL NOT be required. A game ID the TypeScript engine
hands out SHALL remain stable and shareable: it names its board
(`params:desc`), and names the same board on every build.

#### Scenario: Old C-format save is not required to load

- **WHEN** a save produced by the C-serialization path is presented to the TS
  engine
- **THEN** the engine is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: A shared game ID reproduces its board

- **WHEN** a game ID the TS engine handed out is entered on another TS-engine
  build
- **THEN** the same board is produced

## REMOVED Requirements

### Requirement: Narratable-deduction generation policy

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The solver and the hint are two projections of one deduction engine

**Reason**: Moved to `engine-hints`, with its words.

### Requirement: A rejecting generation gate is measured before it is adopted

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: An Unreasonable tier is the one exemption from the narratable policy

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A shared abstraction states its actual scope, not an aspirational one

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: A shared declarative helper is adopted by every game it fits

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: A per-game label states only what holds on every board

**Reason**: Moved to `engine-helpers`, with its words.

### Requirement: A difficulty tier binds the board it generates

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The tier gate's cost is measured by its worst case

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: An unbindable tier is refused, not silently downgraded

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A generator never settles for a lower tier

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A refusal that claims absence rests on a count

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A rare tier is dealt by retrying

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A tier too rare to deal says so

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A tier probe runs on state uncontaminated by earlier candidates

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: Encoded params are byte-stable, and the guard is derived

**Reason**: Moved to `engine-params`, with its words.

### Requirement: Encode and decode are mutual inverses over the corpus

**Reason**: Moved to `engine-params`, with its words.

### Requirement: The recorded params encodings do not move

**Reason**: Moved to `engine-params`, with its words.

### Requirement: A difficulty-capped solver is monotone in its cap at every tier

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A non-monotone solver is repaired, never declared

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The monotonicity guard samples enough boards to catch its defect

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A generator that runs out of tries is answered, not thrown

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: Only an exhausted retry bound is answered

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: The app shows the sentence wherever a deal was asked for

**Reason**: Moved to `dealing`, with its words.
