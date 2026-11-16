# norinori Specification

## Purpose
Norinori, the Nikoli puzzle of shading squares in a grid divided into
regions so that every region holds two and the shaded squares come in
dominoes that touch no other. This capability states what is the game's
own: its rules and what Check & Save reports, what its params and
description hold, what its three difficulty tiers mean and what a dealt
board promises, its controls, its explained hint, and how a region is
drawn.

## Requirements

### Requirement: Rules: The domino rules decide when a board is solved

A Norinori board SHALL be solved exactly when every region holds exactly two
shaded squares and every shaded square shares a side with exactly one other
shaded square. A domino MAY cross a region's border. A cross SHALL be the
player's note that a square is clear and SHALL count toward nothing, so a
blank square counts as clear.

#### Scenario: Two dominoes touch along a side

- **WHEN** every region holds two shaded squares and two of the dominoes
  share a side
- **THEN** the board is not solved

### Requirement: Rules: Check & Save compares shaded squares and crosses with the answer

Norinori's mistake check SHALL report every shaded square where the board's
one answer is clear and every cross where it is shaded, and SHALL never
report a blank square. On a board its deductions do not finish it has no
answer to compare with and SHALL report nothing.

#### Scenario: A shaded square the answer leaves clear

- **WHEN** the player shades a square the answer leaves clear
- **THEN** that square is reported, and a blank square beside it is not

### Requirement: Params: A params string is the size and the tier, and one with no tier is Easy

A Norinori params string SHALL be the width, `x` and the height, and in the
full form `d` and the tier's letter (`e`, `n`, `t`). A string that leaves the
tier out SHALL decode as Easy. Each side SHALL be at least 4 and the grid at
most 400 squares; the refusal names the bound.

#### Scenario: A board's own string

- **WHEN** an 8x8 board at Normal is encoded in full, and again in the form
  a board's ID carries
- **THEN** the strings are `8x8dn` and `8x8`

### Requirement: Description: A description is the walls between regions, and no region is one square

A Norinori description SHALL be the engine's run-length list of the walls
between regions (`engine/wall-runs.ts`) and nothing else: the board has no
clues. Regions SHALL be numbered in the order their first squares are met
reading the grid. A description with a region of one square SHALL be
refused, since it cannot hold two shaded squares.

#### Scenario: A wall on every border

- **WHEN** a 4x4 description gives a wall on every border
- **THEN** it is refused

### Requirement: Generation: A tier is the hardest deduction its boards need

An Easy board SHALL be finished by deductions about one domino, one shaded
or open square, or one region, or a lone shaded square and the one region
its open neighbors lie in. A Normal board SHALL also need a region whose
other open squares, with or without one of them shaded, cannot hold its
shaded squares as parts of dominoes.
A Tricky board SHALL also need a square tried shaded, with only what that
rules out at once. Every dealt board SHALL need its tier and no easier one.

#### Scenario: A Normal board

- **WHEN** a board is dealt at Normal
- **THEN** the deductions capped at Normal finish it and capped at Easy do
  not

### Requirement: Generation: A dealt board has one answer

The generator SHALL place dominoes, deal some of them as regions of their
own two squares, take a region round each other two shaded squares from the
engine's division, and move single squares between neighboring regions until
its deductions finish the board, so that a dealt board has exactly one
answer. Every region SHALL be connected; a region of two squares SHALL be a
domino of the answer, and every other region SHALL hold at least three
squares.

#### Scenario: Any dealt board

- **WHEN** a board is dealt
- **THEN** Solve finishes it, and every region of two squares is shaded in
  the answer

### Requirement: Solver: Solve gives the answer the deductions reach

Solve SHALL fill the board with the answer the deductions reach from the
regions alone, shaded squares and crosses both, whatever the player has
marked. On a board they do not finish, which only a pasted ID can be, Solve
SHALL refuse.

#### Scenario: Solving a dealt board

- **WHEN** Solve is run on a dealt board with wrong marks on it
- **THEN** every square holds the answer's shade or cross and the board is
  solved

### Requirement: Controls: The left button shades and the right crosses out

Norinori's input is its declared target verbs, the collection's shading
input: the left button SHALL shade a blank square and cross it out on its
second click, the right button SHALL cross it out first, and a third click
of either SHALL clear it. A drag SHALL repeat the pressed square's change on
the squares it passes that held what that square held.

#### Scenario: Two left clicks

- **WHEN** a blank square is clicked twice with the left button
- **THEN** it is shaded after the first click and crossed out after the
  second

### Requirement: Preferences: A shaded square brings the crosses it rules out

Norinori SHALL declare what a placement rules out: the open squares beside a
domino the move completes, and the rest of a region the move gives its second
shaded square.

#### Scenario: Completing a domino with the preference on

- **WHEN** the auto-cross preference is on and the player shades the second
  square of a domino
- **THEN** every open square beside the domino is crossed out, in the same
  step of Undo

### Requirement: Hint: The hint reads only regions, shaded squares and crosses

The hint SHALL treat a square as open until it is shaded or crossed out, and
SHALL deduce from nothing else the player has not marked, so the crosses a
domino gives are a step of their own. It SHALL try its deductions easiest
first and apply no tier cap, since a board opened by its ID carries none.
Every word it says SHALL be the description's.

#### Scenario: A domino with open squares beside it

- **WHEN** a hint is asked for on a board where two shaded squares side by
  side have open squares beside them
- **THEN** the first step crosses those squares out and outlines the domino

### Requirement: Hint: A trial shade is one square and what it rules out at once

A step that tries a square shaded SHALL rule out only the open squares
beside it and its partner where it would complete a domino, and the rest of
its region where it would complete it, and SHALL conclude only that a region
is left without room for the shaded squares it needs. It SHALL follow no
further consequence of the trial.

#### Scenario: A trial that leaves a region without room

- **WHEN** shading a square would complete a domino whose neighbors take
  the open squares a region needs
- **THEN** the step crosses the tried square out, stripes the region and
  outlines the tried square's partner, not the open squares the trial rules
  out

### Requirement: Hint: A region without room outlines what closes it

A step that concludes a region has no room for the shaded squares it needs
SHALL say they do not fit "as dominoes" ("in a domino" for one), and SHALL
outline the shaded squares outside the region's open squares and beside
them, which a fill of them must keep clear of, saying "given" them. Its
outline SHALL hold only shaded squares, as every other step's does.

#### Scenario: A shaded square in the next region closes the room

- **WHEN** a region's open squares, less one, cannot hold its two shaded
  squares as dominoes because one of them would touch a shaded square of
  the next region
- **THEN** the step rings the square left out, stripes the region, outlines
  that shaded square, and says the region has no room for 2 shaded squares
  as dominoes, given the outlined square

### Requirement: Look: A region's border and surface are drawn as Star Battle's

A shaded square SHALL be drawn as the collection's shaded piece, in the
error color while it touches two shaded squares or its region holds more
than two; a cross SHALL be the collection's ruled-out cross. A region's
border SHALL be a heavy line of which each square paints the half inside its
own box (`engine/region-walls.ts`), and a square's surface SHALL be its
region's fill, as Star Battle's are. A hint's ring and outline SHALL sit
inside the square's surface, never on the border.

#### Scenario: Three shaded in a row

- **WHEN** three squares in a row are shaded
- **THEN** the middle one is drawn in the error color

### Requirement: Look: Two shaded squares that touch only each other are one domino

`redraw` SHALL draw two shaded squares that are beside each other and beside
no other shaded square as one domino, the engine's piece over two cells, with
a divider in the board's color. The domino SHALL cover the line or region wall
between its halves. A shaded square beside two or more others SHALL be drawn
as a piece of its own.

#### Scenario: A domino across a region wall

- **WHEN** two shaded squares in different regions touch only each other
- **THEN** they are drawn as one tile over the wall between them

#### Scenario: A run of three is no domino

- **WHEN** three shaded squares are in a row
- **THEN** each is drawn as a piece of its own
