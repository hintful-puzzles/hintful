## REMOVED Requirements

### Requirement: Non-blocking confirmations use a transient toast

**Reason**: A clean Check & save no longer shows a toast. The owner found the
confirmation too prominent for something done this often: *"It shouldn't be
that special."*
**Migration**: Replaced by "A clean save confirms on its own button; only a
refused save interrupts" below. Quick-load keeps its toast, and a refused save
keeps its modal.

### Requirement: Combined Check-&-Save gates the checkpoint on a clean board

**Reason**: The requirement said the control's label is "Quick-save" in a game
without mistake-checking. The app has long used one name everywhere, and
`help/features.md` tells players so ("the button reads the same and simply
saves — one name for the save in every puzzle"). It also required a
"confirmation" whose form the requirement below now states.
**Migration**: Restated below with the label claim corrected. The scenarios
that were true survive.

## ADDED Requirements

### Requirement: Check & save gates the checkpoint on a clean board

The app SHALL provide a single control, labeled "Check & save" in every game,
that, for a game implementing mistake-checking (`canFindMistakes`), validates
before saving: it SHALL run `findMistakes()` and quick-save the board only if
zero mistakes are found. If one or more are found it SHALL NOT write the
quick-save slot, so the previous quick-save is left intact, and SHALL report the
count while the mistaken cells are highlighted. For a game without
mistake-checking, the same control SHALL perform a plain quick-save.

#### Scenario: Clean board is checkpointed

- **WHEN** the player activates Check & save on a mistake-checking game whose
  board has no mistakes
- **THEN** the board is quick-saved and the save is confirmed

#### Scenario: Board with mistakes is not checkpointed

- **WHEN** the player activates Check & save and the board has mistakes
- **THEN** no quick-save is written, the previous quick-save (if any)
  remains, the mistaken cells are highlighted, and the count is reported

#### Scenario: Game without mistake-checking does a plain quick-save

- **WHEN** the active game does not implement mistake-checking
- **THEN** the control still reads "Check & save", and activating it
  quick-saves the board directly

### Requirement: A clean save confirms on its own button; only a refused save interrupts

A successful Check & save SHALL be confirmed on the control that was pressed:
for a moment it reads "Saved" with a check mark, then returns to "Check & save".
The same confirmation SHALL be announced to assistive technology through a
polite live region, and it SHALL report the check as well as the save where a
check ran ("No mistakes. Saved."). It SHALL NOT show a toast or a modal. The
Check & save control SHALL be drawn like the commands beside it, not as a
bordered or outlined button.

A refused save, where Check & save found mistakes, SHALL remain a modal alert,
because it must interrupt: it reports that nothing was saved and that the
offending cells are highlighted.

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
