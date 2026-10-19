## MODIFIED Requirements

### Requirement: Hint: A cage deduction's sentence names the cage by its clue

A cage step's narration SHALL name the cage by its clue's goal ("sum to N",
"multiply to N", "differ by N", "have a ratio of N").

#### Scenario: A sum cage rules two digits out of a cell

- **WHEN** a cage with the clue `8+` allows neither 1 nor 4 in one of its cells
- **THEN** the step reads "No way to make this cage sum to 8 puts 1 or 4 in this
  cell, so they must go."

#### Scenario: A cage places a digit along its row

- **WHEN** every way to fill a `10×` cage places a 1 in its row
- **THEN** the step's sentence begins "This cage must multiply to 10, and every
  way to fill it places a 1 in its row"
