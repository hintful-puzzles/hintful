## ADDED Requirements

### Requirement: A technique may look at one supposed value

A technique SHALL be able to read `with place(c, d): P`, the formula `P` read on the marks with cell `c` holding `d`, nothing else changed and nothing propagated; it SHALL conclude nothing itself, and the compiled code and the soundness checker SHALL read every mark under it as the supposition.

#### Scenario: Sticks' too-long line

- **WHEN** a horizontal line in a blank square would make a numbered line longer than its number
- **THEN** the compiled `tooLong` reads the line through the number with that square's line in place, and places a vertical line there

#### Scenario: A supposition the checker ignored

- **WHEN** the checker reads a `with` without its supposition
- **THEN** Sticks' `overConnected` plant, which supposes the other line, comes out sound and the check fails

### Requirement: A square may hold a value that is no line or piece

A description SHALL be able to give a square a value of its own by a clue whose meaning places it, with a domain read off the clue, so that no other square may hold it and the marks start with it placed.

#### Scenario: Sticks' blocks

- **WHEN** a Sticks board is dealt
- **THEN** each block is a `block` clue, holds 3 in the marks before any technique runs, and no technique concludes a line in it

### Requirement: Sticks runs its compiled ladder

Sticks' solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; its Unreasonable tier SHALL be the engine's answer search over the compiled marks.

#### Scenario: A hint step

- **WHEN** Sticks' hint rules a square's line one way out
- **THEN** the step is a firing of the compiled technique for the rule the other way breaks, bound by the number it breaks
