## ADDED Requirements

### Requirement: Controls: Crossing's reference lists the numbers and those that fit the selected square

Crossing's reference SHALL be titled "Numbers" and list every clue number
under its length: placed where it is written into one run, in conflict where
it is written into more, outstanding where it fits, and ruled out otherwise.
With a square selected for digit entry, a number SHALL fit where a click on
the list would write it into a run through that square; with none, where
some run can still take it. The reference SHALL follow the selection as it
moves.

#### Scenario: The numbers that fit a selected crossing

- **WHEN** a square at the crossing of a five-square run and a two-square run
  is selected on a bare board
- **THEN** the reference shows every five- and two-digit number outstanding
  and every other number ruled out

### Requirement: Controls: Crossing's reference searches, filters and picks a number up

Crossing's reference SHALL ask for a search box, with a "Fits" filter for
outstanding numbers and "Placed" for placed ones and those in conflict.
Selecting a number SHALL pick it up, as a click on the list under the board
does.

#### Scenario: Picking a number up from the reference

- **WHEN** the player selects 54384 in the reference
- **THEN** 54384 is held, the board previews it in every run that can take
  it, and a click on such a run writes it in

### Requirement: Preferences: Marking the runs on the board is a preference

Marking the runs through the selected cell on the board (`highlight-runs`)
SHALL be available as a preference, on by default. The clue list SHALL NOT be
colored by where each clue fits: that is the reference's "Fits".

#### Scenario: The board marking follows its preference

- **WHEN** the preference for marking runs on the board is turned off
- **THEN** the board is no longer marked when a cell is selected

## REMOVED Requirements

### Requirement: Preferences: The board marking and the list coloring are separate preferences

**Reason**: The list's coloring by fit moved into the Numbers reference,
where it counts as help (the owner's decision, 2026-11-19), and its
`fit-highlight` preference went with it.

**Migration**: "Preferences: Marking the runs on the board is a preference".

## RENAMED Requirements

- FROM: `### Requirement: Look: Selecting a cell shows which clues fit its runs`
- TO: `### Requirement: Look: Selecting a cell marks its runs and leaves the list plain`
- FROM: `### Requirement: Look: Across and down each have one color, on the board and in the list`
- TO: `### Requirement: Look: Across and down each have one color`

## MODIFIED Requirements

### Requirement: Controls: A clue that fits both runs goes to the more written-in one

Where both runs through the selected cell can take the clue, it SHALL be placed
in the run whose squares are already the more written-in, and only a tie SHALL
be settled by the current fill direction: a blank run admits every unused clue
of its length and so is no evidence of which run the player meant.

#### Scenario: A clue completes the partly-written run rather than the blank one

- **WHEN** one run through the selected cell already carries digits the clue
  agrees with, the crossing run is blank, and both could take the clue
- **THEN** the clue is written into the partly-written run, whichever way the
  fill direction happens to be pointing

### Requirement: Look: Selecting a cell marks its runs and leaves the list plain

Selecting a cell SHALL mark the runs through it on the board, and the clue
list SHALL stay in its plain ink: which clues fit is the reference's to show.
A clue already written into the grid SHALL remain struck off.

#### Scenario: Both runs through the selected cell are answered for

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
- **THEN** both runs are marked on the board, each in its direction's color,
  and every clue not yet written into the grid is in the plain ink

#### Scenario: A clue on the board stays distinguishable from an unavailable one

- **WHEN** one clue has been written into the grid and another simply cannot go
  in the selected run
- **THEN** the first is struck off and the second is in the plain ink

#### Scenario: The same cell selected for pencil marks

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
  while pencil mode is on
- **THEN** the other cells of both runs are marked, each in its direction's
  color, the selected cell carries the pencil selection on its own surface, and
  every clue not yet written into the grid is in the plain ink

### Requirement: Look: Across and down each have one color

Horizontal and vertical runs SHALL be distinguished by color. The color SHALL
denote the run's direction and not whether it is the one being filled, so
that changing the fill direction does not change what any color means.

#### Scenario: Changing the fill direction leaves each run its color

- **WHEN** a cell lying in both runs is selected and the fill direction is
  toggled
- **THEN** the horizontal run is still marked in the across color and the
  vertical run in the down color

### Requirement: Look: The number list sits below the grid and shows how often each clue is placed

`redraw` SHALL draw pencil marks in an empty square and a number-list panel
below the grid, with each clue colored by how many times it is placed: plain
ink where it is in no run, struck off in the used-up color where it is in
one, and in the error color where it is in more.

#### Scenario: A clue written into the grid is drawn as used up

- **WHEN** exactly one run on the board reads as a listed number
- **THEN** that number is drawn in the list in the used-up color
