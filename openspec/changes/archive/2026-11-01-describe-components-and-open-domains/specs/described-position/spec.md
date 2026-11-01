## MODIFIED Requirements

### Requirement: A definition that reads itself is its least fixed point

A planning game's definition that reads itself SHALL compile to the least set of cells its last parameter makes it true of, for each value of its earlier parameters, every self read passing those through unchanged. The compiler SHALL refuse one whose reads of itself could make the set smaller as it grows: under a negation, beside `iff` or `=`, on the left of `implies`, in a `forall`'s `where`, inside an aggregate, or through another definition.

#### Scenario: Pegs' frozen peg rests on a fixed point

- **WHEN** a Pegs board has a peg beside which no peg can ever come to stand, and another peg
- **THEN** the compiled `frozen` claim holds, and the checker finds it sound

#### Scenario: A read under a negation is refused

- **WHEN** a definition `r(c)` reads `not r(c)`
- **THEN** compiling the description fails, naming `r`

#### Scenario: Same Game's group is a fixed point for each square

- **WHEN** a Same Game square is tapped
- **THEN** the group selected and removed is the compiled `joined(s, c)` of that square, the squares of its color joined to it side by side

## ADDED Requirements

### Requirement: A layer may be one value of the board

A layer `over: board` SHALL hold one value, read by its name alone and set by an assignment with no `for`.

#### Scenario: Flood counts its fills

- **WHEN** a Flood fill is played
- **THEN** the compiled `play` adds one to the board's `moves`, and the finish reads it against the limit

### Requirement: A layer's domain may be every integer, computed exactly

A layer of `domain: integers` SHALL hold any safe integer, and every term reading it SHALL be computed exactly, past a safe integer too; a value past a safe integer assigned to the layer SHALL throw. A move binder over `integers` SHALL be checked by `legal` and played by `play`, and never listed by `moves`.

#### Scenario: Numgame's product is exact

- **WHEN** six 100s are multiplied together on a Numgame board
- **THEN** the place holds exactly 10^12

#### Scenario: Untangle's crossing test is exact

- **WHEN** an Untangle board's points lie on one another's lines, at mixed denominators
- **THEN** the compiled finish agrees with upstream's exact crossing test

### Requirement: A game reads a definition through the compiled views

A description's `views` SHALL compile each named definition into the module's `views()`, giving the cells it holds of for values of its other parameters, so a game reads the description rather than a copy of it.

#### Scenario: Netslide's status bar counts the powered tiles

- **WHEN** a Netslide board is drawn
- **THEN** the count of active tiles is the compiled `powered` view's

### Requirement: The dead-end checker searches an open layer over its window

The dead-end checker SHALL search a layer whose domain is not finite over its `checked` window, end a line at a move out of it, and count the positions with such a move. It SHALL refuse a claim over an open layer with no window as beyond the checker, naming the layer.

#### Scenario: Flood's short claim is checked to one fill past the limit

- **WHEN** the checker runs on Flood
- **THEN** it searches the count of fills up to one past the limit, finds `short` sound, and reports the positions with a fill past that

### Requirement: A compiled move refuses a fraction

A planning game's compiled `legal` SHALL refuse a move whose cell or value binder is not an integer, whatever its range.

#### Scenario: A saved Untangle move to a fractional point is refused

- **WHEN** a save holds an Untangle move placing point 1.5
- **THEN** executing it throws rather than playing it
