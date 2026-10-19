## ADDED Requirements

### Requirement: A hint's reference names a thing and its mark

Every reference in a hint step's words SHALL be a noun phrase for a thing on
the board, and SHALL say which mark it is: by its role's word, or by a value
only one marked thing has. A bare "here", "this" or "it", or a clause, SHALL
NOT be a reference.

#### Scenario: Tracks names the square it decides

- **WHEN** a Tracks step reasons that a square without track would leave its
  row short
- **THEN** its words name that square with its mark's word, so the sentence
  can be read against the board without pressing a pill
