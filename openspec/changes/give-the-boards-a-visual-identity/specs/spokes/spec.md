## MODIFIED Requirements

### Requirement: Spokes marks hubs whose spoke count is met

Rendering SHALL distinguish a hub that already carries as many lines as its clue
requires from one that does not, by the surface of its face: a hub with lines
still to take SHALL have the collection's cell surface, and a hub whose count is
met SHALL have the collection's lifted surface, the one a given sits on
elsewhere, since such a hub is settled. The two are a pair the collection names,
separated in both light and dark presentation, and never a step of gray of the
game's own. The distinction SHALL be visual only: a marked hub remains fully
editable. A preference SHALL let the player turn the marking off, and with it off
every hub SHALL have the cell surface.

Upstream nominally fills such a hub with pure white, which is indistinguishable
from the background the application supplies in either color scheme; that is
treated as a defect of presentation, which this project's display code is free to
correct.

#### Scenario: Meeting a clue marks the hub

- **WHEN** a hub's drawn lines reach the number its clue requires
- **THEN** that hub is filled in the satisfied color, and hubs that have not
  reached their clue are not

#### Scenario: The marking can be switched off

- **WHEN** the satisfied-hub preference is turned off
- **THEN** no hub is filled in the satisfied color, whatever its line count
