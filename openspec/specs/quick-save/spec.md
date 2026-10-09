# quick-save Specification

## Purpose
The one-slot quick save every puzzle offers, behind a Check & save that, in a
game that can check, leaves the slot untouched while the board has mistakes or
the hint calls the position a dead end, with its keyboard shortcut and its
confirmations. It exists so a player can mark a position, checked wherever the
game can check it, and come back to it without managing save files.

## Requirements

### Requirement: A single quick-save slot per puzzle

The app SHALL provide one dedicated quick-save slot per `puzzleId`, persisted
in IndexedDB as a distinct save type, separate from the named save library and
from autosave. Saving to the slot SHALL overwrite the previous quick-save for
that puzzle. The slot SHALL be read back into the puzzle through the same save
codec the library uses, so it works for every game without per-game code.

#### Scenario: Quick-save then quick-load round-trips

- **WHEN** the player quick-saves a board and later quick-loads
- **THEN** the puzzle is restored to the quick-saved state
- **AND** a second quick-save overwrites the slot rather than adding a
  second record

### Requirement: The presence of a quick-save is observable

Whether a puzzle has a quick-save SHALL be observable reactively, so that a
quick-load control can enable and disable itself.

#### Scenario: Quick-load disabled with no slot

- **WHEN** no quick-save exists for the current puzzle
- **THEN** the quick-load control is disabled, and it becomes enabled as
  soon as a quick-save is made

### Requirement: Quick-save keyboard shortcut

The app SHALL bind Cmd/Ctrl+S to the Check & save action and SHALL
prevent the browser's default "save page" behavior for that chord while
a puzzle is open.

#### Scenario: Cmd/Ctrl+S triggers Check & save

- **WHEN** the player presses Cmd/Ctrl+S with a puzzle open
- **THEN** the Check & save action runs and the browser does not show its
  save-page dialog

### Requirement: Check & save gates the checkpoint on a clean board

The app SHALL provide a single control, labeled "Check & save" in every game.
For a game that can check (`canCheck`: it implements mistake-checking or has a
hint), the control SHALL validate before saving, through the engine's
`check()`, and SHALL quick-save the board only if the check finds no mistakes
and the hint does not call the position a dead end.

#### Scenario: Clean board is checkpointed

- **WHEN** the player activates Check & save on a mistake-checking game whose
  board has no mistakes
- **THEN** the board is quick-saved and the save is confirmed

### Requirement: A refused Check & save leaves the slot intact and says why

Where the check behind Check & save finds mistakes or a dead end, the app
SHALL NOT write the quick-save slot, so the previous quick-save is left
intact. It SHALL interrupt with a modal alert that says nothing was saved and
why: the count of mistakes while the mistaken cells are highlighted, or the
hint's own sentence while any cause it names is marked.

#### Scenario: Board with mistakes is not checkpointed

- **WHEN** the player activates Check & save and the board has mistakes
- **THEN** no quick-save is written, the previous quick-save (if any)
  remains, the mistaken cells are highlighted, and a modal alert reports the
  count and that nothing was saved

#### Scenario: A dead end is not checkpointed

- **WHEN** the player activates Check & save on a position the hint would ask
  them to undo from (a Pegs peg nothing can reach, an Inertia gem the ball can
  never get back to, entries that contradict each other)
- **THEN** no quick-save is written, and the hint's sentence is reported while
  what it names is marked

### Requirement: A position the hint's search cannot settle is saved

Where the check behind Check & save finds no mistakes and the hint's search
could not settle the position, the board SHALL be quick-saved, and a
non-blocking toast SHALL say the check could not tell whether the position can
still be finished. The toast SHALL be announced in place of the confirmation.

#### Scenario: A position past the search's reach is saved

- **WHEN** the hint's search cannot settle the position
- **THEN** the board is quick-saved, the control reads "Saved", and a toast
  says the check could not tell whether the position can still be finished

### Requirement: A game that cannot check gets a plain quick-save

For a game that cannot check, the same "Check & save" control SHALL perform a
plain quick-save.

#### Scenario: Game without mistake-checking does a plain quick-save

- **WHEN** the active game neither implements mistake-checking nor has a hint
- **THEN** the control still reads "Check & save", and activating it
  quick-saves the board directly

### Requirement: A clean save confirms on its own button

A successful Check & save SHALL be confirmed on the control that was pressed:
for a moment it reads "Saved" with a check mark, then returns to
"Check & save". While it reads "Saved" the control SHALL keep the size it has
at rest, so that no control beside it moves. A successful save SHALL NOT show
a toast or a modal, except the toast of a save the check could not settle.

#### Scenario: A clean save confirms on the button

- **WHEN** Check & save (or Cmd/Ctrl+S) saves a clean board
- **THEN** no toast or modal appears
- **AND** the Check & save control reads "Saved" for a moment, then "Check & save"
- **AND** every control on the Bar, the hint's included, stays where it was

### Requirement: A save's confirmation is announced with the check's result

The confirmation of a successful Check & save SHALL be announced to assistive
technology through a polite live region, and it SHALL report the check as well
as the save where a check ran: "No mistakes. Saved." where `findMistakes` ran.

#### Scenario: A screen reader hears the check and the save

- **WHEN** Check & save saves a clean board on a game that implements
  mistake-checking
- **THEN** a screen reader is told the board had no mistakes and was saved

### Requirement: Check & save is drawn like the commands beside it

The Check & save control SHALL be drawn like the commands beside it, and SHALL
NOT be drawn as a bordered or outlined button.

#### Scenario: The control sits among its neighbors unframed

- **WHEN** the Bar shows Check & save beside its other commands
- **THEN** Check & save is drawn like them, and not as a bordered or outlined
  button

### Requirement: A successful Quick-load confirms with a toast

A successful Quick-load SHALL be confirmed with a transient toast that
auto-dismisses and does not block input.

#### Scenario: Quick-load confirms without blocking

- **WHEN** the player quick-loads a puzzle that has a quick-save
- **THEN** a toast says the saved position is restored, and it goes away on
  its own while the board stays playable
