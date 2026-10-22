# path Specification Delta — add-zip-to-path

## ADDED Requirements

### Requirement: Rules: Zip joins the numbers in order with one line

Under the Zip ruleset each number 1 to K SHALL be on exactly one square. The puzzle SHALL be solved when one line runs from 1 to K through every square, passing the numbers in order: the first and last numbered squares take one line, and every other square two.

#### Scenario: A line out of order does not win

- **WHEN** every square has its lines but the line passes 3 before 2
- **THEN** the game's status is ongoing
