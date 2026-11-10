# described-ladder Specification

## Purpose
What a game whose techniques are stated in a description runs on, whatever
its board: the marks the engine owns, the space the description declares, the
ladder run capped per scale, the library paired by the engine, and the hint
built from the same compiled firings, so that a game states its techniques
and pairs its own reasons and writes no solver loop.

## Requirements

### Requirement: A compiled ladder runs on the engine's marks, whatever the board

The engine SHALL own the marks a compiled technique reads, a value and a mask of candidates a cell, and SHALL run a compiled module's ladder on them: one technique an entry, in the module's order, capped and graded per scale, the module's techniques run on placing as each value is placed, and those run on striking as a fact strikes a value. A game's solver SHALL extend the marks only to keep what no description states, a search.

#### Scenario: A board with no units

- **WHEN** Unruly's ladder solves a board
- **THEN** it runs on the engine's marks with no unit, and a placement culls nothing

#### Scenario: A Latin game's solve is unchanged

- **WHEN** a Latin game's board is dealt and hinted on the engine's marks
- **THEN** every deal and every hint step's rung, move and words are what the per-tier runner gave

### Requirement: The space is the one the description declares

A compiled module SHALL list the description's units in its order, and the engine SHALL build the board's space from them: rows and columns lines whether or not they are units, and the one partition among the units the space's boxes. The library's `placed` SHALL strike a placed value from every unit holding it.

#### Scenario: A placed value leaves its box

- **WHEN** a value is placed on a Solo board
- **THEN** it is struck from the rest of its row, column and box, and of each diagonal holding it on an X board

### Requirement: A domain may be a cell's

Where a description's answer domain reads the cell, `c`, the compiled module SHALL export each cell's domain, the engine SHALL start each cell's candidates from it, the soundness checker SHALL bound each cell's answer and marks by it, and the bare name `domain` SHALL be refused in a technique.

#### Scenario: A Seismic area's numbers

- **WHEN** a Seismic board with an area of three squares is solved
- **THEN** each of its squares starts able to hold 1, 2 and 3 only

### Requirement: The library's techniques are paired by the engine

A described game SHALL pair only its own techniques with their reasons, and the engine SHALL pair the library's, unless the game pairs one with a reason of its own. A technique of the game's own that its description states and the game does not pair SHALL be a type error.

#### Scenario: A table names the game's own

- **WHEN** Unequal's ladder is built
- **THEN** its table pairs `sign` alone, and the library's five techniques run with the engine's reasons

### Requirement: A technique a variation adds runs only where it is on

A technique a variation adds, a rung or one run on placing, SHALL run only on a board the variation is on, SHALL come in the ladder before the first technique of a higher tier on its scale, and SHALL be checked sound in the worlds that have it.

#### Scenario: Unruly's unique rows

- **WHEN** an Unruly board without the unique rule is solved
- **THEN** the unique-rows technique does not run

#### Scenario: ABCD's diagonal strikes

- **WHEN** a letter is placed on an ABCD board that allows diagonal touching
- **THEN** it is not struck from the squares diagonally beside it

### Requirement: A hint walks the compiled firings

A described game's hint SHALL be built from its compiled ladder's firings: recorded into the candidate walk where the game has notes, and otherwise by a walk that takes, one firing a step, the firing continuing from the walk's last steps, the ladder's order breaking ties, and never one of a higher tier than the ladder's own next firing.

#### Scenario: An easier step is never passed over

- **WHEN** an Unruly board offers a three in a row and a near-complete line, the line beside the hint's last step
- **THEN** the next step is the three in a row

### Requirement: A technique may read the king's-move neighborhood

The description language SHALL give a technique a cell's eight neighbors, `adj8(c)`, and the cells within `r` king's moves of it, `within(c, r)`, the cell among them, in reading order; the compiler, the runtime and the soundness checker SHALL each read both.

#### Scenario: A Mosaic number's block

- **WHEN** a Mosaic number in a corner is read
- **THEN** its block, `within(c, 1)`, is its own square and the three beside it

#### Scenario: Nothing touches a star

- **WHEN** a star is placed on a Star Battle board
- **THEN** the compiled `around` makes the squares in `adj8` of it empty

### Requirement: A described game's generator grades on its compiled ladder

A described game's generator SHALL decide a board's tier by running the compiled ladder capped at each tier, and SHALL keep no second solver for grading.

#### Scenario: Mosaic's Easy deal

- **WHEN** an Easy Mosaic board is dealt
- **THEN** the compiled ladder capped at Easy finishes it, and no other solver is asked

#### Scenario: Clusters' prune reads the board alone

- **WHEN** Clusters' generator prunes neighboring dots of one color
- **THEN** it compares their colors and dots, and no bit a solver wrote into the grid

### Requirement: A clue revealed during play is read as a dealt clue

A game whose clues come from play SHALL build the compiled module's `Dealt` from its state on each hint and solve, and the description language SHALL declare nothing about where a clue came from; a clue at the board SHALL be stated with fields, each a function of the clue and, where the field is one a cell, of a cell.

#### Scenario: A Mines number opened by the hint

- **WHEN** a Mines hint's step opens a square
- **THEN** the walk's clue list holds that square's number before its next firing, and the marks it had are kept

#### Scenario: A Guess score

- **WHEN** a Guess row is scored
- **THEN** the compiled ladder reads its pegs, black and total as one clue at the board

### Requirement: A technique may read a laser's path over partial marks

The description language SHALL give a technique `beam(s)`, where the laser fired in from slot `s` goes over the values placed, `beam(s, c, v)`, the same supposing cell `c` holds `v`, and `ahead(s)`, the first cell no value is placed in that decides it; the game, the compiled code and the soundness checker SHALL read one tracer for it.

#### Scenario: A laser through an open square

- **WHEN** a Black Box laser's path reaches a square nothing has settled, and a ball there would send it where it did not go
- **THEN** `ray` places an empty square there

### Requirement: Mines certifies its boards on its compiled ladder

Mines' generator SHALL accept a layout only where the compiled ladder, opening each square it proves safe, finishes the board from the first square opened, and SHALL keep no second solver for it.

#### Scenario: An Expert board

- **WHEN** a 30×16 board with 99 mines is laid out at the first click
- **THEN** the hint's own ladder finishes it from there

### Requirement: A board may be cells alone, its neighbors a relation it deals

A description SHALL be able to state its board as a count of cells with no geometry, in place of a grid, with each cell's neighbors a relation the board deals; the compiler SHALL refuse the grid's geometry on it, the compiled module's `Dealt` SHALL carry the relation, and the soundness checker SHALL check each technique over every relation on its cells, each pair in it or not.

#### Scenario: A Map region and the regions it borders

- **WHEN** Map's hint or solver reads which regions a region borders
- **THEN** it reads the `borders` relation the map deals, and the compiled ladder runs on the regions as the space's cells

### Requirement: Map runs its compiled ladder

Map's solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; its Unreasonable tier SHALL be the engine's answer search over the compiled marks.

#### Scenario: A Tricky board's hint

- **WHEN** a Tricky Map board's hint weighs a region
- **THEN** the step is a firing of the compiled `weigh`, and the board was graded at Tricky by the compiled ladder

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

### Requirement: A technique may run as a value is struck

A description SHALL be able to state a technique run as a fact strikes a value from a cell (`on: strike`), its first binder bound to that cell, which only strikes and is not a rung; the engine SHALL run it whenever a fact removes a value a cell still had, so its strikes belong to the firing that made the first. A mark a player makes that is a state of the candidates SHALL need no construct of its own.

#### Scenario: A strike at one end of a tile

- **WHEN** a Magnets firing strikes `+` from one end of an open tile
- **THEN** the same firing strikes `−` from its other end

#### Scenario: A tile marked `?`

- **WHEN** a Magnets hint reads a tile the player marked `?`
- **THEN** it reads neutral struck from both of its ends

### Requirement: Magnets runs its compiled ladder

Magnets' solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; the generator SHALL lay a board's tiles with the same ladder over a board with no numbers.

#### Scenario: A hint step

- **WHEN** Magnets' hint places a pole because a line has just enough squares left for it
- **THEN** the step is a firing of the compiled `count` technique, bound by the line and the pole

### Requirement: Singles runs its compiled ladder

Singles' solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung. The generator SHALL lay its covered squares with the same ladder, run after each covering. The sneaky circles SHALL stay the generator's own, outside the description, since the rules do not force them.

#### Scenario: A hint step

- **WHEN** Singles' hint makes a square clear because covering it would cut the clear squares in two
- **THEN** the step is a firing of the compiled `split` technique, bound by the square

### Requirement: A technique may read whether cells are one group

A description SHALL be able to read `connected(S)`, whether a set of cells is one group side by side, and `cuts(S)`, the members without which the rest are not, in `S`'s order; the compiled code SHALL compute `cuts` by one search of the set, and the soundness checker SHALL read both by their definition, with no unknown of its own.

#### Scenario: A set with a bridge

- **WHEN** a description reads `cuts(S)` of a set whose two halves meet only through one cell
- **THEN** that cell is a member of it, and no cell whose removal leaves the rest joined is

### Requirement: A board may be any tiling

A description SHALL be able to state its board as a tiling, with the answer on its edges: its cells SHALL be the tiling's dots, and its faces and angles (two edges side by side round a dot) SHALL be sorts a technique reads, with a clue sitting on a face. The compiler SHALL refuse the rectangle's geometry on it, the game SHALL build the space from its grid, and the soundness checker SHALL check each technique on small tilings.

#### Scenario: A Loopy clue on a hexagon

- **WHEN** Loopy's compiled ladder counts a clue on a honeycomb board
- **THEN** it reads the clue at the face and the face's six edges and angles from the tiling's space

### Requirement: An edge mark may sit on the angles

A mark on edges SHALL be able to sit on the angles instead, its candidates the values its meaning may take there, read and struck as an edge mark is. An angle's index SHALL name the same two edges as the player's note of that index, so a note seeds the mark and a narrowed mark is placed as that note.

#### Scenario: A player's corner note

- **WHEN** a player has noted a Loopy corner as needing a line and asks for a hint
- **THEN** the ladder starts with 0 struck from that angle's mark

### Requirement: Two edges may be known alike or opposite

A description SHALL be able to declare a relation over the edges, each pair unrelated, alike or opposite, that a technique reads and concludes. The marks SHALL keep the relation closed, so two edges related through a chain read as related, and the hint SHALL be able to name the chain's links.

#### Scenario: A chain of pairs

- **WHEN** edge a is noted alike b, and b opposite c
- **THEN** a technique reading a and c reads them as opposite, and a hint citing that pair places its links one at a time

### Requirement: Loopy runs its compiled ladder

Loopy's solver, generator, hint and Solve SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung. The hint SHALL walk the same ladder, keeping a firing that only notes a corner or relates two edges as a fact it places as a note where a line cites it.

#### Scenario: A Hard board's pair

- **WHEN** a Hard Loopy board's hint settles an edge from a pair of edges
- **THEN** the step is a firing of a compiled technique, the pair a fact a compiled technique related, and the board was graded at Hard by the compiled ladder

### Requirement: A technique that found nothing runs again only once what it reads changes

A compiled ladder's solve SHALL skip a technique that found nothing until a fact changes a mark it reads, and SHALL still try the techniques from the easiest after every firing, so that every board's tier and every firing's order are those of a run that skips nothing.

#### Scenario: A firing elsewhere does not wake a technique

- **WHEN** a technique has found nothing and a later firing changes only marks it does not read
- **THEN** the solve does not run it again until one of its marks changes

#### Scenario: Skipping changes no verdict

- **WHEN** a ladder is run on the same board with skipping and without it
- **THEN** both runs make the same firings in the same order and reach the same marks

### Requirement: A binding fires only on the marks it read

A compiled technique's solve SHALL NOT fire a binding whose binders' reads of the marks a fact made since in its own run has changed. The engine SHALL read them again, and no description SHALL restate a premise for this. A binding passed over SHALL be tried again on the marks as they then stand: by the ladder's next run, or, for a technique run on placing, by running it again on its cell.

#### Scenario: A square's second binding does not read the edge its first drew

- **WHEN** Path's `pairBreaks` draws a line on one of a square's three open edges, and a later binding of the same square read those three as open before the line was drawn
- **THEN** the later binding does not fire, and the board grades at the tier the hand-written ladder gave it

#### Scenario: A read the fact left standing still fires

- **WHEN** Rome's `loop` strikes one arrow from a square, and the square's next arrow, read before that strike, is still among its candidates
- **THEN** the next arrow's binding fires in the same run, as it did before the reads were made again

#### Scenario: A laser's square read before a placement is read again

- **WHEN** Blackbox's `ray` places at the first unknown square along a laser for one value, and the same laser's next value read that square before the placement
- **THEN** the next value's binding is passed over and the laser is tried again on the marks as they then stand

#### Scenario: Every described game's bindings are read afresh in the suite

- **WHEN** the suite solves each described game's shared boards with the stale-read guard on
- **THEN** every binding about to fire reads all its binders afresh from the marks, with no count and no narrowing, and one whose read no longer holds fails that game's case
