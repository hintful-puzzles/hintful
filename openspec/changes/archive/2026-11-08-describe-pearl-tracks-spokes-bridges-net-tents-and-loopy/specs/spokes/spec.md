## MODIFIED Requirements

### Requirement: Params: Spokes' top tier is named Unreasonable

The top tier SHALL be named `Unreasonable`, because a board of it has one answer that only a search by trial and error finds. Its internal key SHALL be `hard` and its encoded difficulty character SHALL be `h`, so that a game ID carrying that character names the same board whatever the tier is called.

#### Scenario: The top tier keeps its difficulty character

- **WHEN** a parameter set at `Unreasonable` is encoded to a game ID
- **THEN** its difficulty is written with the character `h`

### Requirement: Solver: Spokes solves with a tiered deductive solver

Spokes' ladder SHALL be its description's compiled ladder, each technique checked sound, and the hint SHALL walk the same ladder. Easy SHALL draw the links of a hub with only as many left as lines it still needs, rule out the link between two 1-hubs where the board has another hub, and rule out a full hub's links to hubs still short of lines; a link to a full hub, or across a drawn diagonal, counts as closed. Normal SHALL add its Check on one link. At `Unreasonable` a board SHALL be solved where the engine's search over the ladder finds it one answer.

#### Scenario: The solver deduces the unique solution

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches a single fully connected, fully satisfied configuration of lines

#### Scenario: A board the hand-written ladder dealt at Easy is dealt again

- **WHEN** the generator deals a seed at Easy
- **THEN** it deals the board the hand-written ladder dealt for that seed

### Requirement: Solver: Normal's rung is a Check on one spoke

Normal SHALL rule out a free spoke whose line breaks the board at once, the hubs it fills taking no more spokes, and draw one whose rule-out does, a hub at either end left with no spare spoke drawing all its others. Nothing SHALL be followed from the state tried: the board is read as it would stand, with every free spoke of a full hub ruled out. The board breaks where a hub near the hubs the trial changed is left too few spokes for its number, or the group of a changed hub has every hub full while some hub is outside it.

#### Scenario: A rule-out that starves a hub forces a line

- **WHEN** ruling a spoke out leaves the 7 at one end no spare spoke, and the 7's other spokes would leave a 4 too few spokes
- **THEN** the spoke is a line

#### Scenario: A break past one look belongs to the top tier

- **WHEN** a spoke's other state breaks the board only after a further deduction
- **THEN** the solver at Normal does not decide it on that account, and at `Unreasonable` the search does

### Requirement: Hint: Spokes' hint tries its techniques in one order

The plan's next step SHALL be the first of these that the board gives: a hub with exactly as many free spokes as lines it still needs; two neighboring 1-hubs that both still need their line; a hub with all its lines, for those of its free spokes that reach a hub still needing one; then Normal's Check, which tries each free spoke as a line, and last each hub with one spoke to spare without each of its spokes.

#### Scenario: Two 1-hubs come before a finished hub

- **WHEN** no hub's count forces a line, two neighboring 1-hubs both still need their line, and a finished hub elsewhere has a free spoke toward an unfinished one
- **THEN** the plan's next step rules out the spoke between the 1-hubs

## ADDED Requirements

### Requirement: Hint: Spokes' hint never searches

The Spokes hint SHALL walk the ladder alone, which has no rung above Normal. The search beneath it SHALL NOT contribute a step to a hint plan on any tier, so on an `Unreasonable` board the plan stops short of solved and the hint says that no deduction is left.

#### Scenario: An Unreasonable board's plan stops short

- **WHEN** a hint plan is walked to its end on a board the generator dealt at `Unreasonable`
- **THEN** the board is not solved, and the hint then refuses with no deduction left

## REMOVED Requirements

### Requirement: Hint: Spokes' hint stops at bounded reasoning

**Reason**: The hint no longer takes a tier to plan at, so there is no top-tier plan to compare with Normal's. What it guarded is restated as "Hint: Spokes' hint never searches".

**Migration**: None.

### Requirement: Solver: The contradiction look-ahead never guesses

**Reason**: The look-ahead is retired. `Unreasonable` is the engine's search over the compiled ladder, which counts a board's answers to two, and no tier commits a value from a trial that is not a Check.

**Migration**: None. A board the look-ahead solved has one answer, which the search finds.
