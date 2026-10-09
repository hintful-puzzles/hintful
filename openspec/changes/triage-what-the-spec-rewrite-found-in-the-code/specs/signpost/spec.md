## MODIFIED Requirements

### Requirement: Signpost reports mistakes for Check & Save

`signpost` SHALL implement `findMistakes(state)`: it SHALL re-solve from the
immutable clues and, if that yields a unique complete chain, flag every cell
whose player `next` link disagrees with the solution's. A flagged cell, a
given's included, SHALL be drawn with its number in the error color. A cell
with no outgoing player link SHALL never be flagged. If the board is not
uniquely solvable, `findMistakes` SHALL return no mistakes.

#### Scenario: A wrong link is flagged

- **WHEN** the player links two cells that are not consecutive in the unique
  solution and requests Check & Save
- **THEN** `findMistakes` flags that link, its cell is drawn with the error
  styling on the next paint, and the save is refused

#### Scenario: A wrong link out of a given

- **WHEN** the player drags a link out of the `1` to a cell the solution does
  not put second, and requests Check & Save
- **THEN** the `1` is drawn in the error color, though a clash of numbers
  never recolors a given

#### Scenario: A hand-typed ambiguous board reports nothing

- **WHEN** `findMistakes` runs on a desc with no unique solution
- **THEN** it returns an empty list
