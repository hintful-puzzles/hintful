## ADDED Requirements

### Requirement: Bridges grades a board the same however its islands are listed

The solver's verdict at every difficulty SHALL be a function of the board: the
clues, their places and the params. It SHALL NOT depend on the order the
state lists its islands in, so the state the generator grows and the state
loaded from that board's description get one grade.

To that end the room an island has along a span SHALL be the least of what the
island still needs and what the span can still take, where what the span can
still take is its capacity (the lesser clue at its ends, and its limit) less
the bridges already on it. Room counted that way never grows as bridges are
drawn, so a deduction available on an emptier board is not lost on a fuller
one. This diverges from upstream, which takes the bridges off the limit alone.

#### Scenario: A board has one grade in every island order

- **WHEN** the islands of `11x11i5e10m3d2:4b7f2zzf2zn3b2g` are listed in any
  order and the board is solved from its clues at Easy, Normal and Tricky
- **THEN** every order solves it at all three

#### Scenario: A dealt board has one grade in every island order

- **WHEN** boards are dealt at `11x11i5e10m3d2` and each is solved at every
  difficulty with its islands listed in several shuffled orders
- **THEN** no board gets two verdicts
