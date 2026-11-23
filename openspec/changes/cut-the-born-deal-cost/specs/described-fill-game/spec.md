## ADDED Requirements

### Requirement: A born game deals no slower than the game it replaced

A fill game born from its description SHALL deal each board of its menu at no more cost than the hand-written game it replaced dealt it, counted in instructions retired on the same params dealt the same number of times, beyond the spread of repeated runs. Where a born deal of a menu board takes more than 100 ms of CPU time and the hand-written deal did not, the change that leaves it so SHALL record the reason.

#### Scenario: A born deal counted against the hand-written one

- **WHEN** a born game's deals of its menu boards are counted against the commit before it was born
- **THEN** the born deals' instructions are within the spread of the hand-written ones', or below them
