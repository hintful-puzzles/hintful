## MODIFIED Requirements

### Requirement: Solver: Tents' solver is a certified deduction ladder

Tents' solver SHALL deduce only, as the ladder `tents.description.yaml`
states. Each technique SHALL be checked sound, and a planted defect of each
found unsound. Its hint pins SHALL reach every kind of step, each technique's
and each arm's, on boards dealt at every preset and at a non-square size.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: A mis-tiered Normal technique fails

- **WHEN** either Normal technique is declared at Easy
- **THEN** the generator's gate accepts different boards, and the hint-walk
  snapshots move or the tier gate fails

#### Scenario: A silenced technique fails

- **WHEN** any technique is removed from the description
- **THEN** its pinned kind of step is no longer reached, and the pins fail

#### Scenario: A Normal rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair technique is silenced
- **THEN** its pinned step is no longer given, and the pins fail, even though
  every board is still dealt at its tier because other techniques reach its
  conclusions

### Requirement: Hint: A Tents hint step says why and marks what it uses

Each step SHALL say why it is forced in one sentence. What its ring, its
outline and its stripes stand for SHALL be the legend's (`hint.marks`).

#### Scenario: A line count's picture

- **WHEN** the displayed step counts a row
- **THEN** the row and its clue are hatched, and the squares the step decides
  are ringed

### Requirement: Hint: A Tents line's remaining tents grass the squares beside it that each placement touches

Where every way of placing a row's or column's remaining tents in its open
squares, no two side by side, puts a tent next to one open square of a line
alongside, even diagonally, a step SHALL mark that square grass ("Wherever
this column's 2 remaining tents go, one touches each ringed square"). The
step SHALL decide no square of the line it counts.

#### Scenario: A column's two tents on a dealt Normal board

- **WHEN** the hint is followed on the 8×8 Normal board
  `hcabb_naambbc,1,2,1,2,2,1,1,2,1,2,1,2,2,0,2,2` from nothing placed
- **THEN** its third step, after the squares beside no tree and the row whose
  number is 0, counts the second column, which needs 2 tents, and marks grass
  the squares to its left and its right in the third row

### Requirement: Hint: The Tents hint tries the squares beside a tree before it counts a line

`hint` SHALL take the first of these that decides something, and begin again
after each: grass beside no tree, or beside trees that all have their tents;
grass round a tent; a tree's one open square; the square between a tree's two
diagonal candidates; a link after which one of those four decides something;
a line's count over its own squares; its count over the lines beside it; a
link after which any of them does, or else the first link pending, from
the board's dealt tier.

#### Scenario: A line is counted when no square beside a tree is decided

- **WHEN** a hint is asked for on the 8×8 Easy board
  `ebachbngeca_a,2,1,2,1,1,1,1,3,3,0,1,2,1,1,2,2` with nothing placed
- **THEN** the first step marks as grass the squares beside no tree
- **AND** the second marks as grass the open squares of the row whose number is
  0, and a step about the squares round a tent comes only once a later count
  has placed one
