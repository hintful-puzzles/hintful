## RENAMED Requirements

- FROM: `### Requirement: Hint: A walk in a Rome hint is numbered square by square`
- TO: `### Requirement: Hint: A walk in a Rome hint is outlined square by square`

## MODIFIED Requirements

### Requirement: Hint: A walk in a Rome hint is outlined square by square

Where a firing's premise is a walk, an arrow chain that leads back to the
square being struck, the chain SHALL be shown as the collection shows a walk
(`engine-candidate-hints`, "A premise that asserts a walk is computed and
outlined"), with the arrows themselves giving its order.

#### Scenario: A deduction is narrated by its premise, not by its move

- **WHEN** the hint's next step strikes an arrow that would close a loop
- **THEN** the sentence states that following the arrows from the named
  neighboring square leads back to this one, and the arrow chain is outlined
  with no number on any of its squares
