## ADDED Requirements

### Requirement: A definition that reads itself is its least fixed point

A planning game's definition of one cell that reads itself SHALL compile to the least set of cells for which its body holds, and the compiler SHALL refuse one whose reads of itself could make the set smaller as it grows: under a negation, beside `iff` or `=`, on the left of `implies`, in a `forall`'s `where`, inside an aggregate, or through another definition.

#### Scenario: Pegs' frozen peg rests on a fixed point

- **WHEN** a Pegs board has a peg beside which no peg can ever come to stand, and another peg
- **THEN** the compiled `frozen` claim holds, and the checker finds it sound

#### Scenario: A read under a negation is refused

- **WHEN** a definition `r(c)` reads `not r(c)`
- **THEN** compiling the description fails, naming `r`

### Requirement: A dead-end claim names the cells it holds of

A claim whose last conjunct is `exists x in S: P` SHALL give, through the rules' `witnesses`, every `x` for which the conjuncts before it and `P` hold, and a game's dead-end banner SHALL outline those cells.

#### Scenario: Inertia outlines its stranded gem

- **WHEN** a slide leaves an Inertia gem no slide can ever pass over
- **THEN** the hint's refusal outlines that gem, the compiled claim's witness

### Requirement: A lost position has no moves

Where a description states `lose`, its compiled rules SHALL list no move from a lost position and call every move from it illegal.

#### Scenario: A dead ball cannot slide

- **WHEN** Inertia's ball stops on a mine
- **THEN** no slide is legal until the move is undone

### Requirement: A search's own copy of the moves is measured and held to them

A solver or planner that applies moves by code of its own SHALL do so only where the compiled move was measured too slow for it, with the measurement beside the code and a test holding the two to agreement.

#### Scenario: Pegs' packed jumps agree with the compiled ones

- **WHEN** Pegs' packed board lists its jumps and frozen pegs on positions of random games
- **THEN** they are the compiled rules' moves and the `frozen` claim's witnesses
