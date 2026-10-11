## REMOVED Requirements

### Requirement: The engine deals a search-tier game's Unreasonable board

**Reason**: It spoke of the search's two tiers, and a game may have a tier
for a second deduction between them.

**Migration**: "The engine deals the Unreasonable board of a game that
searches".

## ADDED Requirements

### Requirement: A game that searches has a tier for each deduction and Unreasonable above them

The engine SHALL give a game whose top tier is the search's its tiers from a
count of the deductions below it (`searchTiers`): the collection's names in
order with Unreasonable last, a difficulty field, and a contract that asks the
game's deduction at each tier below Unreasonable and its search there. The
params segment SHALL write a tier as `d` and the first letter of its name, in
the full form only, and SHALL read a string with no tier as Easy.

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

### Requirement: The engine deals the Unreasonable board of a game that searches

A game whose difficulty contract is the search's tiers SHALL deal its
Unreasonable boards through the engine's deal, and SHALL hold no retry loop
for the tier. The engine SHALL keep a candidate only where the game's
deduction stops short of it and the game's search proves it has one answer.
The game SHALL supply how a candidate is drawn, its deduction, its search,
and a strip where it has one.

#### Scenario: A candidate is kept only with one answer that deduction stops short of

- **WHEN** a game's draw hands the engine a candidate its deduction finishes,
  one its search finds two answers for, and one with a single answer that the
  deduction stops short of
- **THEN** the third is the board dealt

#### Scenario: A size with no such board runs the deal's bound out

- **WHEN** no candidate a game draws at some parameters has the tier
- **THEN** the deal gives up at the bound every deal is under, and is
  answered as a generator that ran out of tries is

#### Scenario: A game with a middle tier deals its top one through the engine

- **WHEN** a game whose contract is the search's tiers, two of them or three,
  deals an Unreasonable board at its first preset that allows one
- **THEN** the engine's deal is what dealt it
