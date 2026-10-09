## ADDED Requirements

### Requirement: The solver and the hint are two projections of one deduction engine

A logic game's deductive solver and its hint SHALL be two projections of one
deduction engine. The generator runs the techniques to a fixpoint with the
recorder off and SHALL accept a board only when the techniques fully solve it;
the hint runs the same techniques with the recorder on. Deductive completion
implies uniqueness, so no separate uniqueness pass SHALL be required. The
difficulty grade SHALL be the highest **tier** reached, never a technique's
position in the ladder.

#### Scenario: A board is graded by tier and not by position

- **WHEN** the techniques solve a board, and the last technique in the ladder
  that fired declares a lower tier than an earlier one that fired
- **THEN** the board's grade is the higher tier

### Requirement: The hint-resume walk excuses the games that can say a search ran out

Which games the hint-resume walk excuses its completion promise SHALL be a
population apart from a sweep's cost exemption (`testing`), `SEARCH_REACH_GAMES`: the games whose own code names
`SEARCH_OUT_OF_REACH`, the refusal that admits a search ran out, or hands a
search's outcome to `searchRefusal`, which names it for them. A game can
search without the slide planner, so the excuse SHALL NOT be keyed on the
planner.

#### Scenario: A game that searches without the slide planner may refuse past its reach

- **WHEN** a game's hint can say `SEARCH_OUT_OF_REACH` from a search of its own
- **THEN** the hint-resume walk excuses it by the same derivation, and its ledger
  entry is required before the guard passes

### Requirement: An excused game's reason and remaining cover are recorded per member

The reason a member is excused, and the test that still covers its largest
board on every commit, SHALL be recorded per member, with the derivation
asserted to be exactly the ledger, so a game that later joins the mechanic
fails the guard until someone writes that sentence.

#### Scenario: A newly enrolled game has no ledger entry

- **WHEN** the derivation enrolls a game the ledger does not name
- **THEN** the ledger's equality assertion fails until its entry names what
  covers its largest board

### Requirement: Auto-Hint stops when a step throws

Auto-Hint SHALL stop when a step's hint throws, so the error reaches the app's
reporter and the loop is not left marked active with nothing driving it.

#### Scenario: Auto-Hint meets a thrown step

- **WHEN** Auto-Hint is running and a step's hint throws
- **THEN** Auto-Hint stops and the error propagates to the app's reporter

## MODIFIED Requirements

### Requirement: A game narrates every deduction or rejects the board at generation

A game SHALL meet the technique rule by one of two strategies. It narrates
every deduction its generator accepts, promoting any catch-all into an honest
technique, however non-local or tedious, as Filling narrates its global
candidate elimination. Or it rejects at generation the boards whose solution
needs a deduction it cannot narrate (the `engine-difficulty` narratable-deduction
generation policy, to which this is the hint system's companion).

#### Scenario: A solver has a catch-all rung

- **WHEN** a game's generator accepts boards that need a deduction its hint has
  no technique for
- **THEN** the game either narrates that deduction as a technique of its own,
  or stops generating such boards

## REMOVED Requirements

### Requirement: A per-cell overlay reaches the render cache through the shared sidecar

**Reason**: Moved to `engine-drawing`, with its words.

### Requirement: Only a tier named Unreasonable requires Search

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A propagating trial on a hard tier moves up or renames the tier

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A name is dropped only from a tier that generates nothing

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A tier list has one definition per game

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: A moved rung leaves its old tier generable

**Reason**: Moved to `engine-difficulty`, with its words.

### Requirement: GameDrawing draws the hint's line hatch

**Reason**: Moved to `engine-drawing`, with its words.

### Requirement: A set outlines the cells it rests on

**Reason**: Moved to `engine-candidate-hints`, with its words.

### Requirement: A bound game's help SHALL list its marks from its legend

**Reason**: Moved to `help-pages`, with its words.

### Requirement: A drag game's press arm goes through the engine's verbs

**Reason**: Moved to `engine-input`, with its words.

### Requirement: The candidate walk stamps the steps it builds

**Reason**: Moved to `engine-candidate-hints`, with its words.

### Requirement: A rung list holds only the rungs of the readings its plan walks

**Reason**: Moved to `engine-candidate-hints`, with its words.

### Requirement: A plan's setup declares the reading it walks

**Reason**: Moved to `engine-candidate-hints`, with its words.
