## ADDED Requirements

### Requirement: A born game deals no slower than the game it replaced

A fill game born from its description SHALL deal each board of its menu, as the app runs it, in no more than 100 ms of CPU time on average, unless the hand-written game it replaced took more on the same params; and then in no more than the hand-written game took, beyond the spread of repeated runs. A born deal slower than the hand-written one but under 100 ms is allowed, and the change that leaves it so SHALL record where its cost lies.

#### Scenario: A born deal against the hand-written one

- **WHEN** a born game's menu boards are dealt from a bundle of its tree and from one of the commit before it was born, alternately, the same number of times
- **THEN** each born board's mean is under 100 ms, or no more than the hand-written mean beyond the spread of the rounds

### Requirement: A hide takes clues away in the cheapest order first

At each tier a hide SHALL first take away the clues no firing's bindings read, then all but the shortest run of a random order of the rest that the board still finishes with, then the others one at a time in a random order. With `deal.thorough` off, none SHALL be taken at the first tier and no shortest run, and at most the board's shorter side at the asked tier.

#### Scenario: A thorough hide keeps no clue it can do without

- **WHEN** a board is dealt with `deal.thorough` on and any one of its shown clues is taken away
- **THEN** the board no longer finishes at its tier

## MODIFIED Requirements

### Requirement: A born game may build its answer and hide its clues

Where `deal.sample` is `build`, the answer SHALL be built a random value on a
random undecided cell at a time, each followed by what the ladder then
decides, from its lowest tier and a tier higher after each build that meets
a dead end or breaks a rule. Where `deal.hide` names a clue kind, its clues
SHALL be taken away at the lowest tier that finishes the board with every
clue, then at the asked tier, while the board finishes at each; a
draw no tier up to the asked finishes SHALL be thrown away.

#### Scenario: An Unruly board keeps only the givens it needs

- **WHEN** an Unruly board is dealt and any one of its givens is taken away
- **THEN** the board no longer finishes at its tier

#### Scenario: A Light Up board the lowest tier does not finish is kept

- **WHEN** a Light Up board is drawn at Normal whose every number Easy does
  not finish and Normal does
- **THEN** its numbers are hidden at Normal, and the board is not drawn again

### Requirement: A born game's last tier may be the answer search's

Where the last tier is named Unreasonable, a board SHALL be of it where the
ladder does not finish it and a search, assuming each value in an open cell
of the number with fewest open cells, proves it one answer. Its deal SHALL
strip a board hidden at the lowest tier below the search's that finishes
it, or on one try in eight every clue, while the search, assuming the dealt
value last, meets the dealt answer first; and Solve and Check SHALL read
the searched answer.

#### Scenario: An Unreasonable Mosaic board

- **WHEN** an 8×10 Mosaic board is dealt at Unreasonable and its hint is
  followed
- **THEN** the hint stops short of the answer, and Solve finishes it

### Requirement: A born game may hide several kinds of clue

`deal.hide` MAY name several kinds, whose clues SHALL be hidden in one random
order across them, each kept hidden while the ladder finishes the board.
`deal.stripFrom: everyClue` SHALL start every draw of a search tier from
every clue, not from a board hidden at the lowest tier that finishes it.

#### Scenario: Sticks hides lengths and block numbers together

- **WHEN** a Sticks board is dealt at Easy
- **THEN** both its line numbers and its block numbers are among those hidden
