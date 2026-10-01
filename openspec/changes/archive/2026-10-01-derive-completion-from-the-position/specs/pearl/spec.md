## MODIFIED Requirements

### Requirement: Pearl reports completion and mistakes

The game SHALL compute completion and always-on error marks by
`check_completion`'s rules — a union-find loop classification flagging squares of degree
greater than two, non-reciprocal links, and clue contradictions — and SHALL report
the board solved exactly while the lines form one closed loop satisfying every clue.
Because boards are uniquely solvable by default, the game SHALL implement
`findMistakes`: re-solve from the clues to the unique solution's line grid and
return every line segment the player has drawn that the solution does not contain,
and every no-line cross the player has placed on an edge the solution does contain
(each a definite mistake); a *missing* solution segment is not a mistake, and a board
that is not uniquely solvable (a `nosolve` board) yields no mistakes. Check & Save
depends on this hook and SHALL refuse to save while any mistake is present. The
always-on error marks and the `findMistakes` overlay are distinct signals; the
overlay SHALL draw a wrong cross in the mistake color.

#### Scenario: A line the solution does not contain is flagged

- **WHEN** the player has drawn a loop segment that the unique solution does not
  contain, and `findMistakes` is invoked
- **THEN** that segment is returned as a mistake

#### Scenario: A cross on an edge the solution uses is flagged

- **WHEN** the player has placed a no-line cross on an edge that the unique
  solution's loop runs through, and `findMistakes` is invoked
- **THEN** that edge is returned as a mistake, marked as a cross

#### Scenario: A correct partial board has no mistakes

- **WHEN** the player has drawn only loop segments that the unique solution
  contains
- **THEN** `findMistakes` returns an empty result
