## MODIFIED Requirements

### Requirement: Checking a board never costs a player their checkpoint

The combined check-and-save command SHALL remain in the chrome's most reachable
tier. Alongside it, where a game can check (`canCheck`: it implements
`findMistakes` or has a hint), the puzzle screen SHALL also offer a quieter
command that runs the same check and reports the result **without writing a
checkpoint**.

The combined command is deliberate and is what most players want: it verifies
first and refuses to save over a mistake or a dead end, so a saved checkpoint is
a known-good one. What it cannot serve is a narrow case created by the store:
**the quick-save slot is one per puzzle**, so checking overwrites it. A player
who saved deliberately before a speculative branch, and then checks while the
board is still consistent, silently loses the position they were keeping.

The quieter command SHALL appear only where the game reports that it can check,
derived from the game rather than from a list of games.

#### Scenario: Checking without saving preserves an earlier checkpoint

- **GIVEN** a checkpoint saved at an earlier position
- **WHEN** the player runs the check-without-saving command at a later position
- **THEN** the mistakes are highlighted and the count reported
- **AND** returning to the checkpoint still restores the earlier position

#### Scenario: A game that cannot find mistakes

- **WHEN** the game neither implements `findMistakes` nor has a hint
- **THEN** the check-without-saving command is absent rather than present and
  disabled

#### Scenario: Checking a dead end without saving

- **WHEN** the player runs the check-without-saving command on a position the
  hint calls a dead end
- **THEN** the hint's sentence is reported in a toast and what it names is
  marked, and nothing is saved
