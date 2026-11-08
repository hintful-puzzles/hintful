## MODIFIED Requirements

### Requirement: Rules: Tents completion is judged from the board

Tents are placed on a `w × h` grid of fixed trees. The board SHALL be reported
complete exactly while its tents are an answer of `tents.description.yaml`, a
square left open read as grass: the tent count equals the tree count, every
row and column holds exactly its edge number of tents, no two tents are
adjacent even diagonally, and the trees and tents admit a one-to-one matching
of each tent to an orthogonally adjacent tree. Links SHALL play no part.

#### Scenario: Completion requires a valid matching

- **WHEN** the tents match all edge numbers and are non-adjacent but no
  perfect matching of trees and tents exists
- **THEN** the state does not report completed

#### Scenario: The tents alone finish a board

- **WHEN** every tent of the answer is placed and the other squares are left
  open
- **THEN** the state reports completed


### Requirement: Solver: Tents' solver is a certified deduction ladder

Tents' solver SHALL deduce only, as the ladder `tents.description.yaml`
states. Each technique SHALL be checked sound, and a planted defect of each
found unsound. The boards of its firing census SHALL be those generated at
every preset and at a non-square size, at every cap the generator uses, and
every technique SHALL fire on them.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: A mis-tiered Normal technique fails

- **WHEN** either Normal technique is declared at Easy
- **THEN** the generator's gate accepts different boards, and the frozen
  differential fails

#### Scenario: A silenced technique fails

- **WHEN** any technique is removed from the description
- **THEN** the firing census or the frozen differential fails

#### Scenario: A Normal rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair technique is silenced
- **THEN** the census reports it as never fired, even though the frozen
  differential still passes, because other techniques reach its conclusions

## ADDED Requirements

### Requirement: Solver: Tents' techniques by tier

At Easy the ladder SHALL hold a tent's link to its one tree still without a
tent, grass where no tree is beside, grass round a tree that has its tent,
grass round a tent, a tree's tent on its one square left, a tree's link to the
tent on its one square left, and a line's count. At Normal it SHALL add the
square both of a tree's two diagonal candidates touch, and the squares beside
a line that each placement of its tents touches.

#### Scenario: The cap beneath Easy deduces nothing

- **WHEN** the solver runs at the cap beneath Easy
- **THEN** no technique runs, and the board is not solved

## REMOVED Requirements

### Requirement: Generation: Tents' link rung sits beneath Easy, and its Easy rungs at Easy

**Reason**: The ladder is the description's, and its links are Easy techniques
like the rest; the cap beneath Easy runs nothing, which decides the same
boards, since links alone never finish one.

**Migration**: The tiers are stated in `tents.description.yaml`, held by
`Solver: Tents' techniques by tier`.

### Requirement: Generation: Tents' Normal rungs are rungs of their own

**Reason**: Folded into `Solver: Tents' techniques by tier`.

**Migration**: None: the techniques and their tiers are unchanged.

