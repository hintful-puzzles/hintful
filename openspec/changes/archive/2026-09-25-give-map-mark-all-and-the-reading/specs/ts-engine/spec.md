## ADDED Requirements

### Requirement: A preference change drops the stored hint plan

A hint plan is built from the board and the game's preferences, so when the player
changes a preference while the midend holds a plan, the midend SHALL drop that plan and
clear any displayed step, and the next hint SHALL be built under the new values.

#### Scenario: Switching how hints pencil in takes effect on the next hint

- **WHEN** the player has applied a hint step built under "Only as needed" and then
  chooses "Every candidate first"
- **THEN** the displayed hint is cleared, and the next hint opens with the populate
  reading's setup rather than continuing the old plan
