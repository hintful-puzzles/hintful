## MODIFIED Requirements

### Requirement: Params: The fourth Dominosa tier is named Unreasonable and keeps its character

The fourth tier SHALL be named `Unreasonable`, because its boards are dealt by
a search that tries a domino where deduction stops, and its difficulty
character SHALL be `"e"`.

#### Scenario: The fourth tier keeps its difficulty character

- **WHEN** params at the fourth tier are encoded in full
- **THEN** the suffix is `"de"`, so a game ID that says `"de"` names the same
  board whatever the tier is called

### Requirement: Generation: Each Dominosa tier adds its deductions to the tier below

Easy SHALL perform the domino-single-placement and square-single-placement
deductions. Normal SHALL additionally perform square-single-domino,
domino-must-overlap, the two local-duplicate deductions, and the parity
deduction. Tricky SHALL additionally perform set analysis without doubles.
`Unreasonable` SHALL additionally perform set analysis with doubles, and its
boards SHALL be ones the ladder at Tricky stops on and the search finds one
answer for. A board of a tier below Unreasonable SHALL be one the ladder
finishes at that tier and not below it.

#### Scenario: A cap leaves out the deductions above it

- **WHEN** a board that needs set analysis is solved with the solver capped at
  Normal
- **THEN** the verdict is ambiguous (2)

#### Scenario: Upstream's boards keep their tiers

- **WHEN** each board upstream's generator dealt is graded
- **THEN** it is graded at the tier upstream dealt it at, its Unreasonable
  board by the search

### Requirement: Solver: What the parity and forcing-chain deductions conclude

The solver SHALL run the ladder Dominosa's description states, compiled, each
technique checked sound. The parity deduction SHALL rule out a domino whose
placement would split the unfilled area into two odd-sized regions. Beneath
the ladder, a search SHALL assume a domino on each spot left round the square
with the fewest, and count a board's answers to two; its budget SHALL be
2,000 positions, and SHALL NOT be lowered: a board already dealt, which a
saved game holds, loads only within it.

#### Scenario: A placement that splits the board oddly is ruled out

- **WHEN** a domino on a spot would leave an odd number of unfilled squares on
  each side of it
- **THEN** the parity deduction rules a domino out of that spot

#### Scenario: A board with several answers is told from one with none found

- **WHEN** the board upstream dealt at Ambiguous for the seed `dominosa-a6` is
  loaded at any tier
- **THEN** it is refused as having more than one solution

### Requirement: Hint: Dominosa's hint is seeded from the placed dominoes

The hint's plan SHALL be computed by running the deductive solver one firing
at a time, seeded from the placed dominoes. It SHALL NOT take a barrier edge
the player has drawn as a premise. The step's exact move, a domino or an
edge, SHALL complete the step, and every other move SHALL be off the plan.

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken board the ladder finishes is advanced by applying
  one freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved

## REMOVED Requirements

### Requirement: Hint: The forcing chain grades boards and is never narrated

**Reason**: The forcing chains are retired. Unreasonable is dealt by the
search beneath the ladder, which no hint narrates on any tier.

**Migration**: "Solver: What the parity and forcing-chain deductions
conclude" states the search; "Generation: Each Dominosa tier adds its
deductions to the tier below" states what Unreasonable deals.
