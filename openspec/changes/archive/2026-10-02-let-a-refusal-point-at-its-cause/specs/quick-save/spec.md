## MODIFIED Requirements

### Requirement: Check & save gates the checkpoint on a clean board

The app SHALL provide a single control, labeled "Check & save" in every game,
that, for a game that can check (`canCheck`: it implements mistake-checking or
has a hint), validates before saving through the engine's `check()`: it SHALL
quick-save the board only if the check finds no mistakes and the hint does not
call the position a dead end. If it finds either it SHALL NOT write the
quick-save slot, so the previous quick-save is left intact, and SHALL report
why: the count while the mistaken cells are highlighted, or the hint's own
sentence while any cause it names is marked. A position the hint's search could
not settle SHALL be saved. For a game that cannot check, the same control SHALL
perform a plain quick-save.

#### Scenario: Clean board is checkpointed

- **WHEN** the player activates Check & save on a mistake-checking game whose
  board has no mistakes
- **THEN** the board is quick-saved and the save is confirmed

#### Scenario: Board with mistakes is not checkpointed

- **WHEN** the player activates Check & save and the board has mistakes
- **THEN** no quick-save is written, the previous quick-save (if any)
  remains, the mistaken cells are highlighted, and the count is reported

#### Scenario: Game without mistake-checking does a plain quick-save

- **WHEN** the active game neither implements mistake-checking nor has a hint
- **THEN** the control still reads "Check & save", and activating it
  quick-saves the board directly

#### Scenario: A dead end is not checkpointed

- **WHEN** the player activates Check & save on a position the hint would ask
  them to undo from (a Pegs peg nothing can reach, an Inertia gem the ball can
  never get back to, entries that contradict each other)
- **THEN** no quick-save is written, and the hint's sentence is reported while
  what it names is marked

#### Scenario: A position past the search's reach is saved

- **WHEN** the hint's search cannot settle the position
- **THEN** the board is quick-saved, and the player is told the check could not
  tell whether it can still be finished

### Requirement: A clean save confirms on its own button; only a refused save interrupts

A successful Check & save SHALL be confirmed on the control that was pressed:
for a moment it reads "Saved" with a check mark, then returns to "Check & save".
The same confirmation SHALL be announced to assistive technology through a
polite live region, and it SHALL report the check as well as the save where a
check ran ("No mistakes. Saved." where `findMistakes` ran). It SHALL NOT show a
toast or a modal, with one exception: a save the check could not settle SHALL
say so in a non-blocking toast, which is announced in place of the confirmation
(owner, 2026-10-02). The Check & save control SHALL be drawn like the commands
beside it, not as a bordered or outlined button.

A refused save, where Check & save found mistakes or a dead end, SHALL remain a
modal alert, because it must interrupt: it reports that nothing was saved and
why.

A successful Quick-load SHALL be confirmed with a transient toast that
auto-dismisses and does not block input.

#### Scenario: A clean save confirms on the button

- **WHEN** Check & save (or Cmd/Ctrl+S) saves a clean board
- **THEN** no toast or modal appears
- **AND** the Check & save control reads "Saved" for a moment, then "Check & save"
- **AND** a screen reader is told the board had no mistakes and was saved

#### Scenario: A refused save still interrupts

- **WHEN** Check & save finds mistakes and refuses to save
- **THEN** a modal alert reports the count and that nothing was saved

#### Scenario: An unsettled save says so without interrupting

- **WHEN** Check & save saves a position past the hint's search
- **THEN** the control reads "Saved" and a toast says the check could not tell
  whether the position can still be finished
