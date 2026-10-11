## ADDED Requirements

### Requirement: A Dominosa description brackets only a number of 10 or more

`newState` SHALL refuse a bracketed number below 10, as it refuses one above
`n`, and SHALL refuse any character that is neither a digit nor a bracket
where a number is due: `newDesc` writes a number under 10 as its one digit
and nothing else.

#### Scenario: A small number in brackets

- **WHEN** `[0]0012113233302132120`, the first preset's board
  `00012113233302132120` with its first number put in brackets, is read for
  `3t`
- **THEN** it is refused as holding a number out of range

### Requirement: Dominosa's hint tries its techniques in one order

Each firing of the hint's plan SHALL be the first that applies of: a domino
with one spot left that is not yet placed there; a square with one neighbor
left to pair with; a square that can only be part of one domino; a spot that
overlaps every spot of a domino; the two duplicate deductions; odd regions;
and set analysis, without doubles and then with them. The hint SHALL try all
of them on every board, whatever tier it was dealt at.

#### Scenario: A placement is taken before a line

- **WHEN** a board holds both a domino with one spot left and a spot that
  set analysis rules out
- **THEN** the plan's first step places the domino

#### Scenario: An Easy board never reaches the later techniques

- **WHEN** the hint is followed from the start of a board dealt at Easy
- **THEN** every step is a domino with one spot left or a square with one
  neighbor left

### Requirement: A square that takes one domino rules that domino out elsewhere

Where every spot left to a square, more than one, would put the same domino
on it, that domino is used there. The step SHALL rule the domino out of each
spot of its own that does not cover the square, and SHALL outline the square.

#### Scenario: Two ways to pair a square, one domino

- **WHEN** a 2 can still pair with the 4 above it or the 4 beside it, and with
  nothing else, and the 2–4 domino has a third spot across the board
- **THEN** the technique's step draws a line on that third spot, and its
  sentence says the outlined square can only be part of the 2–4 domino

### Requirement: A spot that overlaps every spot of a domino is ruled out

Where one spot overlaps every spot left to some domino, a domino on it would
leave that one nowhere to go. The step SHALL rule the spot out, and SHALL
outline the squares of the spots left to the domino it protects. The spots
need share no one square for it to overlap them all.

#### Scenario: Two spots end to end

- **WHEN** a row reads 3, 5, 5, 3 and the 3–5 domino has only the first pair
  and the last pair left
- **THEN** the step draws a line between the two 5s, whose spot overlaps both

### Requirement: A spot that would force a domino twice is ruled out

A step SHALL rule a spot out where a domino on it would leave a square beside
it with no spot left but ones of that same domino, which would then be on the
board twice, and SHALL outline that square. It SHALL rule a spot out where a
domino on it would leave two squares beside it each with only spots of one
and the same domino, none of them covering both, and SHALL outline the two.

#### Scenario: One square forced to repeat the domino

- **WHEN** a 1–6 domino on a spot would take from the 6 beside it every pairing
  but ones with a 1
- **THEN** the step draws a line on the spot, and its sentence says a 1–6
  there would force a second 1–6 at the outlined square

#### Scenario: Two squares forced to share a domino

- **WHEN** a domino on a spot would leave a 0 beside one of its squares and a 0
  beside the other each able to pair only with a 3
- **THEN** the step draws a line on the spot, and its sentence says both
  outlined squares would need one and the same domino

### Requirement: Set analysis rules a group's dominoes out of every other spot

Among the squares showing one number, where a group, no two of which the
number's double could still cover, can between them be part of only as many
different dominoes as the group has squares, each of those dominoes is used
on the group. The step SHALL rule each out of every spot that covers no
square of the group, and SHALL outline the group. A group of one domino, and
one leaving out fewer than two of the number's squares, SHALL NOT fire.

#### Scenario: Two 4s that share two partners

- **WHEN** two of the 4s on the board, not adjacent, can each still pair only
  with a 1 or a 6
- **THEN** the technique rules 1–4 and 4–6 out of every spot away from those
  two squares, one line a step

### Requirement: Set analysis with doubles lets the double cover two of the group

The hint SHALL then try a group two of whose squares the number's double
could still cover. Where the group can hold one domino fewer than
it has squares, the step SHALL rule the double out of every spot covering
fewer than two of the group, and the others out of every spot covering none.
Where it can hold as many as it has squares, the step SHALL rule out only the
double, from every spot covering none. A group that can hold one domino, or
every domino showing the number, SHALL NOT fire.

#### Scenario: Three 2s and two dominoes

- **WHEN** three 2s, two of them adjacent, can between them be part of only
  the 2–2 and the 2–5
- **THEN** the technique rules the 2–2 out of every spot but ones covering
  two of the three, and the 2–5 out of every spot away from them

### Requirement: A later line of one firing does not repeat its reason

Where one firing rules out several spots, the first step SHALL give the
reason and each later one SHALL say only that its spot cannot hold a domino
either, for the same reason, naming the outlined squares where the reason has
any.

#### Scenario: The second line of an odd region

- **WHEN** the odd-regions deduction, which outlines nothing, rules out two
  spots
- **THEN** the second step reads "…and this spot can't hold a domino either,
  for the same reason."
