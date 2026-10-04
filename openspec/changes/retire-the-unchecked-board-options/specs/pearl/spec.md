## MODIFIED Requirements

### Requirement: Pearl reports completion and mistakes

The game SHALL compute completion and always-on error marks by
`check_completion`'s rules — a union-find loop classification flagging squares of degree
greater than two, non-reciprocal links, and clue contradictions — and SHALL report
the board solved exactly while the lines form one closed loop satisfying every clue.
Because boards are uniquely solvable, the game SHALL implement
`findMistakes`: re-solve from the clues to the unique solution's line grid and
return every line segment the player has drawn that the solution does not contain,
and every no-line cross the player has placed on an edge the solution does contain
(each a definite mistake); a *missing* solution segment is not a mistake, and a board
the solver cannot finish yields no mistakes. Check & Save
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

### Requirement: Pearl game is registered and implements the Game interface

The engine SHALL provide a registered `pearl` game implementing
`Game<PearlParams, PearlState, PearlMove, PearlUi, PearlDrawState, PearlMistake>`:
draw a single closed loop through grid cells so that it turns a right angle at
every black pearl (and goes straight through at least one cell on each side of
it) and passes straight through every white pearl (turning immediately before or
after). Params SHALL be `w`, `h` and `difficulty` (Easy or Normal), encoded
`{w}x{h}` with a full-form `d{char}` difficulty suffix. Decoding SHALL leave
upstream's trailing `n` unread, which asks for a board nothing has checked, and
encoding SHALL never write it.
`validateParams` SHALL enforce `w ≥ 5`, `h ≥ 5`, that width×height does not
overflow, and that a Normal board has `w + h ≥ 11`. Eight presets
(6×6, 8×8, 10×10, 8×12 each at Easy and Normal; upstream's 12×8 turned to draw
taller than wide) SHALL be offered. The game SHALL provide `solve` and `textFormat`, and SHALL drive a
completion flash suppressed after Solve. The two upstream appearance styles
(traditional Masyu and loopy) SHALL be selectable via an `appearance`
preference (default traditional).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`, or any
  board with `w < 5` or `h < 5`
- **THEN** it returns a non-null error string

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `12x8dtn` is decoded
- **THEN** the params are those of `12x8dt`

### Requirement: Pearl ports the deductive solver and solver-gated generator

The port SHALL implement `pearl_solve` as pure iterative constraint propagation
(no guessing or recursion) over the edge/square workspace: edge↔square
elimination, the black-pearl and white-pearl clue deductions, and shortcut-loop
detection over a union-find, with the Normal tier additionally applying the
premature-short-loop rules. It SHALL return the three-valued verdict
(inconsistent / unique / ambiguous), and a grading routine SHALL return the
easiest difficulty that yields a unique solution. The generator SHALL build a
random loop via the shared `generateLoop` (biased toward black-pearl corners),
derive a maximal clue set, gate every board on the solver finding a unique solution at the
requested difficulty (and failing one tier easier), then greedily minimize the
clues, generating a 5×5 Normal request at Easy. `solve` SHALL return
the generator's aux when present, else re-solve from the clues.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated and graded by the TS solver
- **THEN** the grading is a unique solution at exactly the requested difficulty
