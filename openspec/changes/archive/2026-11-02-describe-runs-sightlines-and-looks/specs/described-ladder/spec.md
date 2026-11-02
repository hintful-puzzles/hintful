## ADDED Requirements

### Requirement: A technique may read a line's stretches

A technique SHALL be able to read `stretch(L, c, S)`, the maximal run of the set of cells `S` along the line `L` that holds `c`, in the line's order, and none where `S` does not hold `c`; the compiled code and the soundness checker SHALL read it alike.

#### Scenario: ABCD's runs

- **WHEN** ABCD's `runs` counts how many of a letter a line's open squares hold with no two touching
- **THEN** it counts each open square at an even place in its stretch

### Requirement: A clue may sit at an element once for each value

A clue kind SHALL be able to sit at its element once for each value of the answer's domain (`per: value`), read `clue(kind, x, d)`, with its meaning reading the value as `per`; the soundness checker SHALL deal one at each element for each value, each present or not.

#### Scenario: ABCD's numbers

- **WHEN** ABCD's ladder reads how many of letter `d` a row holds
- **THEN** it reads `clue(count, L, d)`, `-1` where the number is hidden

### Requirement: ABCD runs its compiled ladder

ABCD's solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; its Unreasonable tier SHALL be the engine's answer search over the compiled marks.

#### Scenario: A runs step

- **WHEN** ABCD's hint places a letter by a line's stretches
- **THEN** the step is a firing of the compiled `runs`, read off the player's own notes

## MODIFIED Requirements

### Requirement: A technique a variation adds runs only where it is on

A technique a variation adds, a rung or one run on placing, SHALL run only on a board the variation is on, SHALL come in the ladder before the first technique of a higher tier on its scale, and SHALL be checked sound in the worlds that have it.

#### Scenario: Unruly's unique rows

- **WHEN** an Unruly board without the unique rule is solved
- **THEN** the unique-rows technique does not run

#### Scenario: ABCD's diagonal strikes

- **WHEN** a letter is placed on an ABCD board that allows diagonal touching
- **THEN** it is not struck from the squares diagonally beside it
