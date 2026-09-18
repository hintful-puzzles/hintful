# loopy

## ADDED Requirements

### Requirement: Loopy shows which lines belong to the segment you last touched

Loopy SHALL highlight the connected run of drawn lines containing the edge the player
last acted on — the edge a pointer set, or the edge the keyboard cursor has chosen —
so that "are these two ends the same segment?" can be answered without tracing the
board by eye.

The highlight SHALL be derived from the board and the player's last action alone, never
from a per-segment identity. Segment identity changes whenever two runs join, so a
scheme that colors segments reshuffles the board as the player draws; keying on the
player's own last action means the picture changes when, and only when, they act.

This is a **second reader of the connectivity the game already computes** for its
completion check, not a second notion of it.

The existing highlight of every closed loop but the largest is unaffected: that one
reports a loop already closed, and this one is what lets the player see the closure
coming.

#### Scenario: setting a line lights its run

- **WHEN** the player draws a line that joins two runs of lines
- **THEN** every line of the joined run is highlighted, and lines of other runs are not

#### Scenario: the keyboard gets the same aid

- **WHEN** the keyboard cursor chooses an edge that is a drawn line
- **THEN** that line's whole run is highlighted, exactly as a pointer setting it would

#### Scenario: joining two runs does not recolor the board

- **WHEN** two highlighted-and-unhighlighted runs are joined into one
- **THEN** the only change is which lines are highlighted; no line changes to a
  different color scheme, and no run the player did not touch gains a color

#### Scenario: an excluded edge is not a segment

- **WHEN** the player's last action excluded an edge rather than drawing a line
- **THEN** no run is highlighted on account of that edge
