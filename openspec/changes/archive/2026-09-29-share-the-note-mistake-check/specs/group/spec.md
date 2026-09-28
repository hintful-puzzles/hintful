## ADDED Requirements

### Requirement: Group's Check & Save flags pencil marks that have crossed out the answer

Group's `findMistakes` SHALL report, beside every entry that contradicts the unique
solution, every empty cell whose non-empty pencil marks leave out that cell's
solution element, as a `note` mistake drawn in the same mistake outline. Marks
that include the answer beside other candidates SHALL NOT be reported. Because the
hint reasons from the marks, it SHALL refuse while such a mark set stands.

#### Scenario: Marks without the answer are a mistake and the hint refuses

- **WHEN** an empty cell's pencil marks hold only elements other than its solution
- **THEN** `findMistakes` reports that cell as a `note` mistake, and a hint request
  refuses asking the player to fix the highlighted mistakes first

#### Scenario: Extra candidates beside the answer are not a mistake

- **WHEN** an empty cell's pencil marks hold its solution element and others
- **THEN** `findMistakes` reports nothing for that cell
