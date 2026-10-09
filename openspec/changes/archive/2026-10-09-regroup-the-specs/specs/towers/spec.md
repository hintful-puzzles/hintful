## ADDED Requirements

### Requirement: Towers tells its inks apart

The renderer SHALL color given towers, user-entered towers, struck-through
("done") clues, and error cells distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both of those towers' digits are drawn in the error color

## REMOVED Requirements

### Requirement: Towers tells its inks and its selection apart

**Reason**: Reworded in `towers` as "Towers tells its inks apart". The
highlight's picture left this requirement in the prune, for `engine-notes` "The
note-taking cell's highlight has one picture, drawn by the engine", and the
title still promised it. Only the title changes.
