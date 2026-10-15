## ADDED Requirements

### Requirement: Preferences: A tent can bring the grass it rules out

Tents SHALL declare what a tent rules out, for the engine's `auto-cross`
preference: every blank square round a new tent, and the blank squares of
its row or column where the tent is the last its number asks for. They
become grass. A tent placed by joining a tree to an open square SHALL bring
the same.

#### Scenario: The last tent of a row

- **WHEN** the preference is on and a tent is placed that is the last its
  row's number asks for
- **THEN** the blank squares round the tent and the blank squares of the row
  become grass, and one Undo takes them back with the tent
