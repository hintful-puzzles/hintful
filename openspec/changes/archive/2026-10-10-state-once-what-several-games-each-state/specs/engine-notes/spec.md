## ADDED Requirements

### Requirement: The button and the sticky preference decide the mode a press selects for

With the sticky pencil preference off, a primary press that commits no move
SHALL select the pressed cell for a value and turn pencil mode off, and a
secondary one SHALL select it for pencil marks and turn the mode on. With it
on, a primary one SHALL select in the mode that is on and change no mode. Such
a press on the cell the highlight shows on, in the mode it selects for, SHALL
put the highlight away, unless the game gives the repeat press its own meaning
(Crossing's change of direction).

#### Scenario: A primary press keeps a latched pencil mode

- **WHEN** a secondary press has switched pencil mode on under the sticky
  preference, and another empty cell is then pressed with the primary button
- **THEN** that cell is selected for a pencil mark and pencil mode stays on

#### Scenario: A primary press on a cell selected for pencil marks, sticky off

- **WHEN** the sticky preference is off, a secondary press has selected an empty
  cell for pencil marks, and the same cell is pressed with the primary button
- **THEN** the cell is selected for a value and pencil mode is off, and the
  highlight is not put away

#### Scenario: A second primary press under the sticky preference

- **WHEN** a cell selected by a primary press is pressed again with the primary
  button under the sticky preference, in either mode, in a game that gives the
  repeat press no meaning of its own
- **THEN** the highlight is put away and pencil mode is as it was

### Requirement: The select key on a showing highlight toggles pencil mode

In a game whose press is its selection, the select key (Enter) pressed while
the highlight shows SHALL toggle pencil mode, the same with the sticky
preference on or off, and SHALL hand the highlight to the keyboard. The rule
SHALL NOT bind a game whose press starts a drag, where the select key belongs
to the game's own keyboard gesture (Map's pick and drop, Rome's arming of a
placement).

#### Scenario: The select key after a pointer selection

- **WHEN** the pointer has selected an empty cell, the select key is pressed and
  a value is then typed
- **THEN** the value is toggled as a pencil mark and the highlight stays, as a
  highlight the keyboard placed does

#### Scenario: The select key in a game whose press starts a drag

- **WHEN** the cursor shows on a colored region in Map and the primary select
  key is pressed
- **THEN** the color is picked up and pencil mode is as it was

### Requirement: Mark-all is adaptive in a game with an obvious-candidate rule

For a game with an obvious-candidate rule (a region provider, or a rule of its
own) the action SHALL be adaptive. While any empty cell has no notes, it SHALL
fill every such cell with all its candidates and change no other. Otherwise it
SHALL remove the obvious candidates: with a region provider, every penciled
value equal to a value placed in one of the cell's uniqueness regions,
whichever the game has of row, column, sub-block, X-diagonal, and a cage or
outlined region that forbids repeats.

#### Scenario: A second press on a fully-noted board removes obvious candidates

- **WHEN** every empty cell is already fully noted and the player activates the
  mark-all control on a game whose uniqueness regions are its rows and columns
  (and blocks and diagonals where it has them)
- **THEN** the action removes exactly the penciled values already placed in
  each cell's regions, leaving every still-possible candidate

#### Scenario: A narrowed cell beside a note-less one

- **WHEN** one empty cell has been narrowed to two notes, another carries none,
  and the player activates the control
- **THEN** the cell with no notes takes all its candidates and the narrowed cell
  keeps its two

### Requirement: The Mark-all cleanup is one move, or none

In a game with an obvious-candidate rule, the cleanup SHALL be emitted as one
move, with the marks it removes computed at `interpretMove` time, so replay and
undo are exact. A game that builds the press with `adaptiveMarkAll` or
`adaptiveMarkAllMove` SHALL emit it as its `pencilStrike`. When there is
nothing to fill and nothing to strike, the action SHALL produce no move at all,
a true no-op that adds no undo entry, rather than an empty strike.

#### Scenario: Replaying the cleanup

- **WHEN** every empty cell is already noted, the player activates the
  mark-all control on a game with an obvious-candidate rule, and the move is
  replayed
- **THEN** the action emitted one move, and replaying it reproduces the cleaned
  board

## MODIFIED Requirements

### Requirement: The sticky pencil toggle is a mode switch, not a selection

With sticky pencil mode on, a secondary press SHALL switch pencil mode. On a
cell that can take a mark it SHALL also move the highlight there, and on a cell
that could take no mark it SHALL leave the highlight where it is, because the
toggle is a mode switch rather than a selection.

#### Scenario: The sticky toggle does not double as a selection key

- **WHEN** a player presses the secondary button on a filled cell, with sticky
  pencil mode on
- **THEN** pencil mode toggles
- **AND** the highlight is exactly where it was, shown or hidden as it was

#### Scenario: The sticky toggle on an empty cell

- **WHEN** with sticky pencil mode on and pencil mode off, a player presses the
  secondary button on an empty cell the highlight is not on
- **THEN** pencil mode is on and that cell is selected for pencil marks

### Requirement: Every member offers the keep-highlight preference, defaulted the same way

Every game in the mechanic SHALL offer the keep-highlight pencil preference, on
by default, so one gesture does one thing across the family and the player who
wants the other still has it. A member that offers the sticky pencil preference
SHALL start with it on, and a member that offers auto-pencil SHALL start with
it off, which leaves cleaning the notes to the Mark-all press and the hint.

#### Scenario: The family answers a preference question once

- **WHEN** a player makes the same mouse-driven pencil mark in any two games of
  the mechanic, having changed no preferences
- **THEN** the highlight behaves the same way in both

#### Scenario: A first secondary press latches

- **WHEN** a player who has changed no preference presses the secondary button
  on an empty cell, in a member that offers the sticky preference
- **THEN** pencil mode is on and stays on through the next primary press

#### Scenario: A placement with no preference changed

- **WHEN** a player who has changed no preference places a value, in a member
  that offers auto-pencil
- **THEN** the pencil marks of every other cell are as they were

### Requirement: Repeated Mark-all presses converge

The cleanup SHALL be idempotent and a pure function of the placed values. On a
board whose notes the player has not narrowed, repeated presses SHALL converge
to and remain at every empty cell noted with all its candidates minus those the
game's obvious-candidate rule strikes. There SHALL be no fill-then-clean toggle,
and a cleaned board SHALL NOT silently re-fill. A clean SHALL NOT empty a cell
of its last note, which keeps idempotency unconditional on a mistaken board.

#### Scenario: Repeated presses are idempotent (no re-fill, no toggle)

- **WHEN** the player activates the mark-all control a third time, after a fill
  and a clean, with no board change in between
- **THEN** the cleaned board is unchanged: the action produces no move (a true
  no-op, no undo entry) and does not re-fill any cell

#### Scenario: Every note of a cell is ruled out

- **WHEN** a wrong placement leaves every note of an empty cell obvious, and the
  control is activated
- **THEN** the cell keeps one note, and the press after that is no move

## REMOVED Requirements

### Requirement: Mark-all is adaptive in a game with uniqueness regions

**Reason**: Restated as "Mark-all is adaptive in a game with an obvious-candidate rule". The population was "a game that supplies a per-game region provider", and the fill-then-strike press is also what a game with a rule of its own does: ABCD and Salad and Rome build it with `adaptiveMarkAll` (`src/engine/candidate-hint.ts`), the six Latin games (group, keen, mathrax, solo, towers, unequal) with `adaptiveMarkAllMove`, and Map with its own `markAll` (`src/games/map/hint.ts`), which fills the dotless regions and otherwise removes the dots its neighbors' colors rule out. So the title changes; no source or guide cites it (`spec-citations.mjs --list`). Two more corrections: the fill changes no noted cell, in every one of these (each `executeMove` skips a cell with notes, and `mark-all.test.ts` holds every `canMarkAll` game to it); and the list of regions said "its row and column" of every region game, which is false of Rome, whose provider gives the outlined region alone.

### Requirement: The Mark-all cleanup is one pencilStrike, or no move

**Reason**: Restated as "The Mark-all cleanup is one move, or none". It opened "In a game with uniqueness regions", and `adaptiveMarkAll` does the same for a game that passes its own rule: marks computed in `interpretMove`, one strike move, `null` when there are none. The strike is the game's own `pencilStrike` in each of the nine games that call the helper (Rome's through its `CandidateMoveAdapter`). Map does not call it and has no `pencilStrike`: its clean is one move of dot toggles computed in `interpretMove` (`regionsMove`), and no move when `markAll` returns `null`. So the rule that holds of all ten is "one move, computed at `interpretMove` time, or none", and the title changes with it; nothing cites the old one.
