## MODIFIED Requirements

### Requirement: Generation: Rome's rules are met in one order, Easy first

The solver SHALL try its rules in this order, each only where those before it
find nothing, and the hint SHALL offer them in that order: a square down to
one arrow, an arrow its area already holds, and an arrow that would close a
loop, at Easy; the squares an area's arrows must go in, a pair, and the one
mark that leads to a goal, at Normal; and an arrow into a square that could
only point back, at Tricky.

#### Scenario: A Tricky rule on an Easy board

- **WHEN** the hint is followed from the dealt position of a board dealt at
  Easy
- **THEN** no step is a Normal or a Tricky rule: none keeps an area's arrows
  to their squares, names a pair, keeps the one mark that leads to a goal, or
  rules out an arrow into a square that could only point back

### Requirement: Hint: Rome's hint teaches the solve the generator graded

The hint SHALL run the techniques of the ladder the solve runs, over the
player's notes, and the arrows it places SHALL be the arrows the solve
places.

#### Scenario: The recording places what the solve places

- **WHEN** a board's hint is followed from its dealt position until it stops
- **THEN** the arrows placed, with the clues, are the solved grid
