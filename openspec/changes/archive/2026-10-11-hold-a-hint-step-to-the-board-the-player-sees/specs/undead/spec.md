## MODIFIED Requirements

### Requirement: Undead's hint fills a cell when a monster has exactly the cells it needs

When the empty cells that can still hold a monster number exactly those of it
left to place, the hint SHALL place it in the first of them, ringing that cell,
with the words "Exactly as many cells can still hold a ghost as there are
ghosts left to place" and "this one can only be a ghost", in the monster's
name. What a cell can hold SHALL be read off the board: the monsters its
pencil marks list, and any monster while it has none.

#### Scenario: Two cells left for two vampires

- **WHEN** the total is three vampires, one is placed, and exactly two empty
  cells have a vampire among their pencil marks, every other empty cell being
  marked without one
- **THEN** a step places a vampire in one of the two, and the next places one
  in the other

#### Scenario: A count the board does not show yet

- **WHEN** a hint is asked on a board as dealt, with no pencil marks, where
  the clues leave a monster exactly the cells it needs
- **THEN** no step places by that count until the strikes that leave those
  cells have each been shown and made

### Requirement: Undead's hint tries a single, then a counted placement, then a strike

At each step the plan SHALL take the first that applies of: a cell whose
pencil marks are down to one monster, placed; a placement by a monster's
count, for ghosts, then vampires, then zombies; the next strike. Strikes SHALL
be found by trying the monster counts before the sightlines, in the same
order of monsters, and the sightlines from the one with the fewest monster
cells up, starting again from the counts after each one found.

#### Scenario: A count and a sightline both strike

- **WHEN** nothing can be placed, every ghost is on the board while an empty
  cell still lists a ghost, and a sightline's clues also rule a vampire out
  of a cell
- **THEN** the ghost is crossed out first, for the count, and the sightline's
  strike follows
