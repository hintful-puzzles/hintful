## ADDED Requirements

### Requirement: A described game names its tiers once, in its description

A game whose description states `tiers` SHALL write its tier names there and
nowhere else: its difficulty field SHALL take its choices from the compiled
module's `tiers`, the search's tier included, and a game with one tier SHALL
offer no difficulty field. A guard over every compiled module SHALL fail
where a game's menu differs from its description's tiers, its population
derived from the modules and not listed.

#### Scenario: A menu passed a list of its own

- **WHEN** a described game's difficulty field offers names its compiled
  `tiers` do not hold, or in another order
- **THEN** the guard fails, naming the game

#### Scenario: A description renamed

- **WHEN** a description's tier is renamed on the scale
- **THEN** the menu shows the new name with no other edit

## MODIFIED Requirements

### Requirement: Tier names come from one collection-wide scale

A tiered game SHALL name its tiers by position from the collection's scale,
easiest first: Easy, Normal, Tricky, Hard, Extreme. A game with `n` tiers takes
the first `n`, and a name SHALL hold the same position in every game that has
it. A described game SHALL write them in its description's `tiers`; a game
without one SHALL call `tierNames(n)`, which SHALL refuse a count the scale
cannot name rather than return a short list.

#### Scenario: A new game declares its tiers

- **WHEN** a game with `n` tiers is implemented
- **THEN** its description lists the first `n` names of the scale, with
  Unreasonable last when its hardest tier can require Search, and a game
  without a description calls `tierNames(n)` or `tierNames(n, { search: true })`

#### Scenario: A count past the scale

- **WHEN** `tierNames` is asked for more names than the scale holds
- **THEN** it throws, since a short list would leave the guards covering fewer
  tiers than the game has

### Requirement: Unreasonable is declared and never issued by position

`Unreasonable` SHALL NOT be issued by position. It is the name `engine-hints`
reserves for a tier whose boards can require Search, and a game takes it by
declaring that of its hardest tier: a described game names that tier
Unreasonable in its description, and a game without one calls
`tierNames(n, { search: true })`, which replaces the top name. The guard on
tier names SHALL NOT be read as evidence that a tier searches: it checks the
shape of the list.

#### Scenario: A two-tier game whose harder tier backtracks

- **WHEN** a game has two tiers and its harder one can require Search
- **THEN** its tiers are Easy and Unreasonable

#### Scenario: A top tier that is a bounded tactic

- **WHEN** a game's hardest tier never requires Search
- **THEN** it is never named `Unreasonable`, however many tiers the game has

### Requirement: A game that searches has a tier for each deduction and Unreasonable above them

The engine SHALL give a game whose top tier is the search's its tiers from
its description's `tiers` (`searchTiers`), which SHALL end in Unreasonable
or be refused: a difficulty field, and a contract that asks the game's
deduction below Unreasonable and its search there. `searchTierSegment` SHALL
write a tier as `d` and the first letter of its name, in the full form only,
and SHALL leave a string with no `d` at the game's `defaultParams` tier, which
SHALL be Easy.

#### Scenario: One deduction is Easy and Unreasonable

- **WHEN** a game asks for the tiers of one deduction
- **THEN** they are Easy and Unreasonable, written `de` and `du`

#### Scenario: A second deduction is Normal, and Unreasonable keeps its letter

- **WHEN** a game asks for the tiers of two deductions
- **THEN** they are Easy, Normal and Unreasonable, written `de`, `dn` and `du`

#### Scenario: A board is solved at the tier its deduction first finishes it

- **WHEN** a board's deduction finishes it at the second tier and not at the
  first, and its search says one answer
- **THEN** the contract says unsolved at Easy and solved at Normal and at
  Unreasonable

#### Scenario: A string that states no tier

- **WHEN** a game on these tiers decodes `7x7`, or `7x7dn` where it has no
  Normal
- **THEN** the first reads as Easy, the tier its default params hold, and the
  second is refused as a letter the tag does not list
