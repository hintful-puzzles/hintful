## ADDED Requirements

### Requirement: Rules: A pour moves the top run of one color, as much of it as fits

A move SHALL pour from one tube into another: the balls of one color in an
unbroken run at the top of the first tube, as many of them as the second tube
has room for. It SHALL be legal only onto a ball of that color or into an
empty tube, and only where the second tube has room. The board SHALL be
solved when every tube is empty or full of balls of one color. A position
from which no series of pours sorts the board is a dead end; it is not lost,
and Undo leaves it.

#### Scenario: Three balls into room for one

- **WHEN** `2h4e1:abbb,aab,a` pours tube 0 into tube 1
- **THEN** one b goes and the board is `abb,aabb,a`

#### Scenario: Onto another color

- **WHEN** `2h2e1:ab,ba,` pours tube 0 into tube 1
- **THEN** the pour is refused, the b on top of tube 0 meeting the a on top
  of a full tube 1

### Requirement: Params: Colors, balls per tube and empty tubes

Params SHALL be the number of colors (2 to 10), the balls a tube holds (2 to
6) and the tubes that start empty (1 to 3), encoded `<colors>h<capacity>e<spare>`.
A string that leaves out `h` or `e` SHALL decode to 4 balls a tube and 2
empty tubes. There are as many full tubes as colors, so a board has colors
plus empty tubes.

#### Scenario: A bare count of colors

- **WHEN** `9` is decoded
- **THEN** the board is 9 colors, 4 balls a tube and 2 empty tubes, `9h4e2`

### Requirement: Params: A deal is refused where the generator cannot make one in good time

When a board is to be dealt, and only then, `validateParams` SHALL refuse
more than 48 balls with one empty tube, where almost no shuffle can be
sorted, and more than 30 with three, where a deal's positions near the
search's budget. A board of any size that arrives with its description SHALL
load.

#### Scenario: Nine colors of six with one empty tube

- **WHEN** `9h6e1` is checked for dealing
- **THEN** it is refused with "With one empty tube, a board can have at most
  48 balls."
- **AND** the same params are not refused for a board that arrives with its
  description

### Requirement: Description: Each tube from the bottom up, a letter a color

A description SHALL list every tube's balls from the bottom up, `a` for the
first color, `b` the second and so on, tubes split by commas, an empty tube
written as nothing. `newState` SHALL refuse a tube over its capacity, a letter
past the board's colors, a count of tubes other than colors plus empty tubes,
and a board without exactly one tube's worth of balls of every color. A
description may hold any such position, sorted tubes and partly filled ones
included.

#### Scenario: Two tubes of four and two empty ones

- **WHEN** `2h4e2:abba,baab,,` is loaded
- **THEN** tube 0 holds a, b, b, a from the bottom, tube 1 b, a, a, b, and
  tubes 2 and 3 are empty

### Requirement: Generation: A deal is a shuffle the search sorts, with no tube sorted

The generator SHALL shuffle every ball into the full tubes, leave the spare
tubes empty, and keep the deal only where no tube is dealt already sorted and
the search sorts it within its budget. The game has no difficulty tiers: its
difficulty is the board's colors and empty tubes, and the preset menu is
ordered by how often a player gets stuck on each.

#### Scenario: Every preset deals a board that can be sorted

- **WHEN** any preset is dealt
- **THEN** the search finds a line of pours that sorts it, and no tube is
  full of one color

### Requirement: Solver: Every reachable position, measured from sorted

The search SHALL enumerate every position the pours can reach from a board,
taking two positions that differ only in the order of their tubes as one, and
measure each by the fewest pours that sort it, or none. Its line SHALL be a
shortest one, each pour the first in order of the tube poured from and then
into that brings the board one pour nearer, so the line from any position on
it is the rest of it. Past its budget of positions it SHALL settle nothing.

#### Scenario: A dead end with pours left

- **WHEN** the board is a position no series of pours sorts, and pours
  remain
- **THEN** the search measures it as none, and the hint refuses it

### Requirement: Solver: Solve shows the sorted board a shortest line ends on

Solve SHALL show the sorted board that the search's line from the player's
position ends on, and else the one from the board as dealt.

#### Scenario: Solve from the deal

- **WHEN** Solve is chosen on a dealt board
- **THEN** every tube is empty or full of one color

### Requirement: Controls: Two taps make a pour

A tap on a tube with balls SHALL pick up its top run, shown lifted out of the
tube. A second tap SHALL pour the run into the tube tapped where the pour is
legal; on the tube picked up it SHALL put the run back; on a tube the run
cannot go into it SHALL pick that tube's run up instead, or put the run back
where that tube is empty. Any change of board SHALL put down what was picked
up.

#### Scenario: A pour by two taps

- **WHEN** on `2h2e1:ab,ba,` tube 0 is tapped and then tube 2
- **THEN** the b on top of tube 0 is poured into tube 2

### Requirement: Controls: A drag pours, and the keyboard taps

A drag from one tube to another SHALL pour from the first into the second,
whatever was picked up. The keyboard's cursor SHALL move along the tubes with
the arrow keys, up and down between rows, and Enter or Space at the cursor
SHALL do what a tap there does.

#### Scenario: A drag into the empty tube

- **WHEN** on `2h2e1:ab,ba,` the pointer is pressed on tube 1 and released
  on tube 2
- **THEN** the a on top of tube 1 is poured into tube 2

### Requirement: Hint: The first pour of a shortest line, its rivals settled

The hint SHALL offer the first pour of the search's shortest line, ringing the
balls that go and the slots they land in, and SHALL judge every other legal
pour by the same search. Where every other pour leads to a dead end the step
SHALL say so and conclude "so"; where some do, it SHALL stripe one and offer
the pour as one way to avoid it.

#### Scenario: A rival into a dead end

- **WHEN** a hint is asked where another pour leads to a dead end and this
  one does not
- **THEN** it reads "Working on the teal balls: the striped pour leads to a
  dead end. Avoid it: pour these balls into the ringed tube." with the
  board's color

### Requirement: Hint: The striped pour is beside the offered one, clear of its ring

Of the pours that lead to a dead end, the one striped SHALL be, where there
is one, a pour into the tube the offered pour leaves or out of the one it
fills; else one that moves none of its balls and fills none of its slots;
and only else one whose stripes lie under its ring.

#### Scenario: A dead end into the same slot

- **WHEN** on `5h4e1:caae,dada,ecbc,bdbe,debc,` a hint is asked
- **THEN** the striped pour is tube 0's orange ball into the empty tube, the
  slot the offered pour is ringed into, since no pour that leads to a dead
  end there keeps clear of the ring

### Requirement: Hint: Each step names the color it works toward

Each step but the last SHALL name, as its aim, the color the line next fills
a tube with, and SHALL say when its pour fills that tube; the last step SHALL
say that it sorts the board.

#### Scenario: The last pour

- **WHEN** a hint is asked one pour from sorted
- **THEN** it reads "Pour these balls into the ringed tube: that sorts the
  board." or the same of "this ball"

### Requirement: Hint: A dead end is refused, and the hint goes back

A dead end SHALL be refused as one, so that applying the hint goes back to the
last position that can still be sorted. A position with no pour at all is
refused at a glance, without the search.

#### Scenario: One pour into a dead end

- **WHEN** on `5h4e1:caae,dada,ecbc,bdbe,debc,` tube 0 is poured into tube 5
  and a hint is asked
- **THEN** the hint refuses the position, and applying it returns the board
  to before the pour

### Requirement: Look: Tubes in rows, balls told apart by a symbol

The tubes SHALL stand in as many rows as keep the board no wider than tall,
a short last row centered. Each ball SHALL be a disc of its color with a
symbol of its color's own drawn on it, so that no two colors are told apart by
hue alone.

#### Scenario: Six tubes

- **WHEN** a board of 4 colors and 2 empty tubes is drawn
- **THEN** its six tubes stand in two rows of three

### Requirement: Look: A pour streams its balls over the mouths

A pour SHALL fly its balls one after another, each drawn over the board: up
out of its tube into its row's headroom, clear of every mouth, across to the
headroom of the row it lands in, and down into its slot. A ball bound for the
tube right below its own SHALL step aside toward the board's middle on the
way. Solve SHALL show the sorted board at once.

#### Scenario: Into the tube below

- **WHEN** a pour goes into the tube right below the one it leaves
- **THEN** each ball leaves its tube by the mouth and steps aside, and never
  falls down through the tube it left
