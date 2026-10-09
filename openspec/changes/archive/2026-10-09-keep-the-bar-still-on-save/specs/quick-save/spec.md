## MODIFIED Requirements

### Requirement: A clean save confirms on its own button; only a refused save interrupts

A successful Check & save SHALL be confirmed on the control that was pressed:
for a moment it reads "Saved" with a check mark, then returns to "Check & save".
While it reads "Saved" the control SHALL keep the size it has at rest, so that
no control beside it moves.
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
- **AND** every control on the Bar, the hint's included, stays where it was
- **AND** a screen reader is told the board had no mistakes and was saved

#### Scenario: A refused save still interrupts

- **WHEN** Check & save finds mistakes and refuses to save
- **THEN** a modal alert reports the count and that nothing was saved

#### Scenario: An unsettled save says so without interrupting

- **WHEN** Check & save saves a position past the hint's search
- **THEN** the control reads "Saved" and a toast says the check could not tell
  whether the position can still be finished
