## ADDED Requirements

### Requirement: A described technique is a rung read off the notes

A game whose description states its techniques SHALL offer each as a rung of
the walk that runs the compiled technique over the marks the board's notes
show (`techniqueRung`), once the notes are set up, and SHALL build a step's
reason from the terms the technique says. A technique the board's tier would
not run SHALL offer nothing.

#### Scenario: A technique past the board's tier

- **WHEN** a hint is asked on a board whose tier is below a technique's
- **THEN** no step of the plan is a firing of that technique

### Requirement: A technique waits in its ladder's order

A technique after its ladder's first SHALL wait until every earlier rung of
the walk is empty, as the solver reaches it only once those before it are
spent. One of a tier harder than the ladder's easiest MAY offer, while it
waits, a firing that continues the plan's latest steps.

#### Scenario: A harder technique continues the work in hand

- **WHEN** a single is on the board, and a technique of a harder tier than the
  ladder's easiest, within the board's tier, has a firing that rests on the
  cell the last step decided
- **THEN** the plan may take that firing before the single

## MODIFIED Requirements

### Requirement: The game keeps what carries its meaning

A game on the walk SHALL keep what carries its meaning: its ladder's
techniques, as rungs over the notes, or its recording solver where it has
one, the words and evidence of its steps, how a firing splits into legs,
which what the narration names singular dictates, its own rungs, the
deviations the walk names as optional hooks, each stating the game-shaped
fact that needs it, and its regions where those are a decision the game
makes and not one its family has already answered.

#### Scenario: The strike axis follows the narration

- **WHEN** a game's narration names one cell at a time and it splits a firing's
  strikes by cell
- **THEN** the firing becomes one leg per cell, in the order the cells first
  appear in it

### Requirement: A row/column Latin square answers no question its regions already settle

The engine SHALL provide a preset over the candidate-elimination plan walk
(`runLatinCandidatePlan`) supplying every plan field whose answer is forced once
a game's cells' no-repeat regions are exactly a row and a column, so that a
plain Latin game supplies its own techniques' rungs and its own words and
nothing else; the Latin library's set, fish and wing are rungs the engine
builds (`latinStrikeRungs`). Every game SHALL remain free to call the general
entry point, and a game that does SHALL say why.

#### Scenario: A plain Latin game declares no regions

- **WHEN** a candidate-elimination game whose cells' no-repeat regions are exactly a row
  and a column walks its hint plan
- **THEN** it passes no region function, no single-reason function and no hidden-single
  evidence area, and its hidden singles are still classified in, narrated by and shaded
  along the correct line
