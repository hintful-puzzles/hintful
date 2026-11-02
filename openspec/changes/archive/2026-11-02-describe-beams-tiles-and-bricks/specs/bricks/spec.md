## REMOVED Requirements

### Requirement: Solver: The depth-2 rung stays in the Bricks solver

**Reason**: Solve, the hint's refusal and the mistake check know a board's answer from the engine's search beneath the ladder, which finds every board upstream's lookahead of either depth solves.
**Migration**: "Solver: Bricks knows a board's answer from the search beneath its ladder".

### Requirement: Hint: A Bricks contradiction no named rule matches is an error, never a narration

**Reason**: No trial is classified: each way a supposed color breaks a rule is a technique of the description, checked sound, and a step's reason is the technique that fired.
**Migration**: "Hint: A Bricks hint step's reason is the technique that fired".

### Requirement: Hint: A Bricks hint takes the first empty cell one color breaks a rule in

**Reason**: The hint walks the compiled ladder's firings, taking the one that carries on from its last step, as every ladder hint does.
**Migration**: "Hint: The Bricks hint carries on from its last step, by the rules in order".

### Requirement: Hint: The recursive lookahead rung is never narrated

**Reason**: There is no lookahead rung: the tier above Easy is the engine's search.
**Migration**: "Hint: The search beneath the Bricks ladder is never narrated".

## MODIFIED Requirements

### Requirement: Generation: Bricks offers Easy and Unreasonable, and no third tier

Bricks SHALL offer two tiers, Easy and `Unreasonable`. An Easy board SHALL be one its ladder finishes from its numbers, and an Unreasonable one a board with one answer that the ladder stops short of, dealt and graded by the engine's search, since only a tier of that name may ask for a search. Upstream's third tier, whose sub-solve recursed in turn, names no boards, so it SHALL NOT be offered under any name: not in the preset menu, the difficulty contract or the custom-params dialog.

#### Scenario: The preset menu offers two tiers

- **WHEN** the preset menu is listed
- **THEN** every entry is Easy or `Unreasonable`

#### Scenario: An Unreasonable board needs the search

- **WHEN** a board is dealt at Unreasonable
- **THEN** the search finds it one answer
- **AND** the ladder does not finish it

### Requirement: Solver: The Bricks solver places cells by contradiction

The ladder SHALL place each cell by contradiction: a color supposed in an open cell breaks a rule at once, so the cell is the other color. Each way a rule breaks SHALL be a technique of the description, checked sound: clearing the cell leaves a shaded brick above it nothing to rest on, or a number too few cells to reach it; shading it makes three in a row, leaves it nothing beneath it to rest on, or gives a number too many. Each technique SHALL also hold its rule on the marks as they stand, so a broken position is a contradiction. The ladder SHALL NOT guess.

#### Scenario: A cell that would complete a row of three is cleared

- **WHEN** an empty cell lies between two shaded cells of its row, on a board
  that has a solution
- **THEN** the ladder finds shading it breaks a rule and sets it unshaded

### Requirement: Hint: A Bricks hint step is one journey of one cell

Each hint step SHALL decide one cell, a single self-contained journey: a firing that forces several is as many steps. A paint that gives the step's cell the color it forces, alone or in a drag across other cells, SHALL complete the step, and every other move SHALL be off the plan.

#### Scenario: A step decides one cell and leaves it as it was

- **WHEN** a hint step is shown
- **THEN** it rings one cell, which is still empty on the board
- **AND** the cells it reasons from carry a different mark

## ADDED Requirements

### Requirement: Hint: The search beneath the Bricks ladder is never narrated

The search beneath the ladder SHALL NOT be narrated at all: it commits a cell by solving the rest of the board from a hypothesis, and no hint narrates a search on any tier. Where only the search could progress, the hint SHALL refuse instead.

#### Scenario: The search never reaches a narration

- **WHEN** a hint is asked for where the ladder forces no cell on a board the search finds one answer
- **THEN** the hint refuses, saying that nothing further follows by deduction

### Requirement: Solver: Bricks knows a board's answer from the search beneath its ladder

Solve, the hint's refusal and the mistake check SHALL know a board's answer from the engine's search by trial and error over the ladder, whatever tier the board was dealt at, and a board the search finds no one answer SHALL be one Solve refuses and the hint does not plan on.

#### Scenario: Solve on an upstream Tricky board

- **WHEN** the player asks for the solution of one of upstream's frozen Tricky boards
- **THEN** the board is solved

### Requirement: Hint: A Bricks hint step's reason is the technique that fired

Every hint step SHALL give as its reason the technique that forced its cell, and SHALL name the rule that technique states. No hint sentence SHALL claim that a chain of forced consequences was followed.

#### Scenario: Every technique reaches a narration

- **WHEN** hint plans are recorded over dealt boards replayed from shares of their answers
- **THEN** each of the five techniques gives some step its reason

### Requirement: Hint: The Bricks hint carries on from its last step, by the rules in order

`hint` SHALL take, of the firings the ladder could make, the one that carries on from the cells its last step read and decided, and otherwise the first by its rule: a shaded brick stranded, a number left short, three in a row, a brick resting on nothing, a number given too many. A firing that forces several cells SHALL be taken as consecutive steps of one cell each: clockwise round the number or brick it reasons from, and left to right along a row.

#### Scenario: A number with all its bricks

- **WHEN** a hint is asked for where a number has all its shaded neighbors and three of its neighbors are empty, and no other rule forces a cell
- **THEN** the next three steps clear those three cells clockwise from above, each by that number
