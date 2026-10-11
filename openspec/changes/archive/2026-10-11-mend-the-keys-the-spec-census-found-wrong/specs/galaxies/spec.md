## ADDED Requirements

### Requirement: The keyboard picks up a Galaxies dot wherever it sits

With the cursor on a dot, Enter or Space SHALL begin the association drag
from that dot, whether the dot sits inside a square, on an edge between two
or on a corner between four. An edge that holds a dot takes no line, so the
key SHALL NOT be read there as a click on the edge.

#### Scenario: A dot on an edge

- **WHEN** the cursor is on a dot that sits on the edge between two squares,
  and Enter is pressed
- **THEN** a drag from that dot begins, the arrows steer its free end, and a
  second Enter on a square the dot could own associates the square
