## MODIFIED Requirements

### Requirement: Hint: Light Up draws a hint's evidence by what it is

An evidence square SHALL keep its fill, lit or not, which is its premise, and
take a doubled ring in `COL_HINT_CELL`; so SHALL the unlit square the
deduction is about. The driving clue SHALL keep its white digit and be ringed
at its wall's edge in `COL_HINT_CELL`, with a line in the digit's white
inside the ring.

#### Scenario: Evidence is visible as an area

- **WHEN** a forced-light step is displayed
- **THEN** each square of the corridor it reasons over, other than the target
  and the square the deduction is about, takes a doubled ring in
  `COL_HINT_CELL` and no fill of a hint color

#### Scenario: A hint step's marks stay inside its evidence

- **WHEN** any grouped clue step is displayed
- **THEN** every target square lies within the narrated clue's neighbor set
