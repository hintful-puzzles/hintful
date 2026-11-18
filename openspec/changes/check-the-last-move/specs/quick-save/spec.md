## ADDED Requirements

### Requirement: Check & save judges the last move

Where the check behind Check & save finds no mistakes and no dead end, and
the game judges moves (`judgeMove`), the check SHALL judge the player's last
move against the position before it, by the game's own deductions, and SHALL
NOT gate the save on the verdict. A move that followed SHALL be told, by
name, every deduction that makes it from the board where there is room. A
move no deduction reached SHALL be told it is correct but not yet forced. A
verdict SHALL mark nothing on the board.

#### Scenario: A reasoned move is named

- **WHEN** the player places a value one of the game's deductions makes from
  the position before it, then activates Check & save
- **THEN** the board is saved, and the words under the board say the move
  follows from that deduction, by its name, and nothing on the board is
  marked for it

#### Scenario: A move two deductions make names both

- **WHEN** the player's last move is one two of the game's deductions each
  make from the position before it, then activates Check & save
- **THEN** the words name both

#### Scenario: A lucky move is told so

- **WHEN** the player places a correct value no deduction reaches from the
  position before it, then activates Check & save
- **THEN** the board is saved, and the words say the move is correct but
  nothing on the board forces it yet

#### Scenario: A cross and a struck candidate are judged

- **WHEN** the player's last move crossed out a square, or struck a
  candidate, then activates Check & save
- **THEN** the move is judged as a placed value is

#### Scenario: A mark the board already shows is told so

- **WHEN** the player's last move marked what the marks already on the
  board decide (a Tracks side a square's two rails close), then activates
  Check & save
- **THEN** the words say the move writes down what the board already shows

### Requirement: Only a move a deduction could make is judged

A move that placed nothing a deduction makes (a note added, a value taken
back or overwritten), and the last thing done where it was not a move (an
undo, a redo, a restart), SHALL NOT be judged.

#### Scenario: An added note says nothing more

- **WHEN** the player's last move added a pencil note, then activates
  Check & save
- **THEN** Check & save says what it says of a sound board, and nothing of
  the move

### Requirement: A check answers where the hint does

What Check & save and Check without saving find SHALL be shown in the words
area under the board, where the hint's explanation is shown, styled as the
hint and led by "Check", and SHALL be announced through that area's live
region. It SHALL stay until the next move, hint, undo or redo.

#### Scenario: A verdict does not cover the board

- **WHEN** a check's verdict is shown
- **THEN** it is in the words area under the board, and no modal or toast
  covers the board

## MODIFIED Requirements

### Requirement: A refused Check & save leaves the slot intact and says why

Where the check behind Check & save finds mistakes or a dead end, the app
SHALL NOT write the quick-save slot, so the previous quick-save is left
intact. It SHALL say in the words area under the board, in the warning color,
that nothing was saved and why: the count of mistakes while the mistaken
cells are highlighted, or the hint's own sentence while any cause it names is
marked.

#### Scenario: Board with mistakes is not checkpointed

- **WHEN** the player activates Check & save and the board has mistakes
- **THEN** no quick-save is written, the previous quick-save (if any)
  remains, the mistaken cells are highlighted, and the words under the board
  report the count and that nothing was saved, in the warning color

#### Scenario: A dead end is not checkpointed

- **WHEN** the player activates Check & save on a position the hint would ask
  them to undo from (a Pegs peg nothing can reach, an Inertia gem the ball can
  never get back to, entries that contradict each other)
- **THEN** no quick-save is written, and the hint's sentence is reported under
  the board in the warning color while what it names is marked
