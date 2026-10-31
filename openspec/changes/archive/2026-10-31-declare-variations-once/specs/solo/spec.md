## ADDED Requirements

### Requirement: Params: Solo's game modes are Standard and Jigsaw

Solo SHALL offer the shape of its blocks as a ruleset, Standard or Jigsaw,
read from the params (`r === 1` is a jigsaw), so that a game ID is written as
before. Choosing Standard on a jigsaw board SHALL give it the squarest
rectangular blocks of its order, and a prime order stays a jigsaw. X and
Killer SHALL stay modifiers of either.

#### Scenario: A jigsaw board's label

- **WHEN** a 9×9 jigsaw board with the diagonals is labeled
- **THEN** the label starts "Jigsaw: 9x9 X"
