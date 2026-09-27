## MODIFIED Requirements

### Requirement: Ascent always offers a number beside the one selected

Selecting a placed number SHALL offer a number to place in the squares beside
it whenever one of its neighbors in the sequence is still missing: the one
after when the one before is placed, the one before when the one after is
placed, and the one after when neither is, with a right-click on an empty square
beside it cycling through the two. When neither is placed, a second tap on the
selected number SHALL offer the one before instead, and a third SHALL deselect
it, each acting on the release so that a drag from the number places what it
offers.

#### Scenario: A number with neither neighbor placed

- **WHEN** the player selects a number whose neighbors in the sequence are both
  missing and clicks an empty square beside it
- **THEN** the next number is placed there

#### Scenario: Tapping the selected number again

- **WHEN** the player taps a selected number whose neighbors in the sequence
  are both missing, then taps an empty square beside it
- **THEN** the number before it is placed there, and a further tap on the
  number instead deselects it
