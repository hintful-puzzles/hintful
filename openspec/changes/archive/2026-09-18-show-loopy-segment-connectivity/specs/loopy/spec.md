# loopy

## ADDED Requirements

### Requirement: Loopy shows which lines are joined to the one under the pointer

Loopy SHALL highlight the connected run of drawn lines containing the edge under the
mouse pointer, so that "are these two ends the same run?" can be answered without
tracing the board by eye. An edge carrying no line has no run, and hovering it SHALL
highlight nothing. When the pointer leaves the board the highlight SHALL clear.

The highlight SHALL be derived from the board and the pointer alone, never from a
per-segment identity. Segment identity changes whenever two runs join, so a scheme that
colors segments reshuffles the board as the player draws; keying on the pointer means
the picture changes when, and only when, the player moves it.

A hover SHALL never make a move, alter history, or change what a later move does. It
shows the player something the board already contains, so **nothing may depend on
it** — a touch screen has no hover, and the game must be exactly as playable without
one.

This is a **second reader of the connectivity the game already computes** for its
completion check, not a second notion of it.

The existing highlight of every closed loop but the largest is unaffected: that one
reports a loop already closed, and this one is what lets the player see the closure
coming.

#### Scenario: hovering a line lights its run and no other

- **WHEN** the board carries two runs of lines that share no dot, and the pointer rests
  on a line of one of them
- **THEN** every line of that run is highlighted and no line of the other is

#### Scenario: the pointer leaves

- **WHEN** the pointer moves off the board while a run is highlighted
- **THEN** the highlight clears

#### Scenario: an edge with no line on it

- **WHEN** the pointer rests on an edge that is undecided or ruled out
- **THEN** no run is highlighted

#### Scenario: a hover that changes nothing repaints nothing

- **WHEN** the pointer moves but stays nearest the same edge
- **THEN** the board is not repainted, so a pointer sweep costs one repaint per edge
  crossed rather than one per event
