## MODIFIED Requirements

### Requirement: Hint: Magnets' hint counts the tiles that can still give a line its pole

In the Normal tier's part the hint SHALL count a line's tiles, one lying along
it counting once, and its words SHALL say the count is of tiles. Where the line
needs as many more of a pole as it has undecided tiles, each SHALL be a magnet
and take a `?`. Where it needs as many more as it has tiles that can still give
one, a tile able to take the pole at only one of its squares there SHALL take
it. For `−` on a line with a `+` number, that count takes in the tiles that can
still give a `+`, so it concludes only when none can.

#### Scenario: A tile lying along the column counts once

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom tile neutral
- **THEN** its step begins "This column needs 3 more +s from just 3 tiles"

#### Scenario: Every undecided tile is needed

- **WHEN** a row needs three more `−` and has three undecided tiles
- **THEN** the step reads "This row needs 3 more −s and has only 3 undecided
  tiles, so each must be a magnet."
