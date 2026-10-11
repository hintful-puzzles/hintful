## ADDED Requirements

### Requirement: Spokes' params write the difficulty as d and a letter

`encodeParams` SHALL write `{w}x{h}` and, in the full form only, `d` and `e`
for Easy, `t` for Normal or `h` for `Unreasonable`. `decodeParams` SHALL read
a bare number as a square board and a string with no `d` as Easy. A `d`
followed by any other letter, or by nothing, SHALL name no tier, and such
params SHALL be refused.

#### Scenario: A Normal preset and its short form

- **WHEN** `4x4dt` is decoded
- **THEN** the board is 4 by 4 at Normal
- **AND** its short form `4x4` decodes to a 4 by 4 board at Easy

#### Scenario: A letter that names no tier

- **WHEN** `4x4dt` is entered with its `t` written `z`
- **THEN** the params are refused with "Difficulty must be one of Easy,
  Normal, Unreasonable."

### Requirement: An X hole also blocks the diagonals that pass its corners

A cell written `0` SHALL hold no hub and take away every spoke that points at
it. A cell written `X` SHALL do the same and SHALL also take away the four
diagonals that pass its corners, each joining a cell beside it to the cell
above or below it. Either cell's clue SHALL read as 0 afterwards.

#### Scenario: A hole in the top row

- **WHEN** `0X0111111` is loaded on a 3 by 3 board
- **THEN** the top row holds no hub, and the hub in the middle of the board
  has spokes to its sides and downward only
- **AND** were the two top corners hubs, the `X` would still leave the middle
  hub no spoke toward either, where a `0` in its place would leave both

### Requirement: The satisfied-hub preference is mark-satisfied and starts on

The preference that marks a hub whose count is met SHALL have the key
`mark-satisfied`, SHALL be a boolean named "Highlight hubs once their spoke
count is met", and SHALL start on.

#### Scenario: A player who has changed no preference

- **WHEN** a player who has changed no preference draws the last line a hub's
  number asks for
- **THEN** that hub takes the lifted surface

### Requirement: A press on a hub aims at the dot it points toward

A press on a hub's square, and a drag from it, SHALL aim by the direction
from that hub's center to the pointer, snapped to the nearest of the eight
directions, and the release SHALL apply its button's verb to the spoke aimed
at then. A pointer still close to the center, or aiming off the board, SHALL
aim at nothing, and its release SHALL change nothing.

#### Scenario: A click on a dot

- **WHEN** the player clicks the dot on a hub's right-hand rim and lets go
  without moving
- **THEN** the spoke to the hub on its right is toggled, as a drag to that
  hub toggles it

#### Scenario: A drag that overshoots

- **WHEN** a drag from a hub runs on past the hub to its right before it is
  let go
- **THEN** the spoke toggled is the one to the hub next to where the drag
  began, since only the direction is read

### Requirement: Spokes' hint tries its techniques in one order

The plan's next step SHALL be the first of these that the board gives: a hub
with exactly as many free spokes as lines it still needs; two neighboring
1-hubs that both still need their line; a hub with all its lines, for those
of its free spokes that reach a hub still needing one; and last the bounded
look-ahead, which reads the free spokes hub by hub and tries each as a forced
line before a forced rule-out.

#### Scenario: Two 1-hubs come before a finished hub

- **WHEN** no hub's count forces a line, two neighboring 1-hubs both still
  need their line, and a finished hub elsewhere has a free spoke toward an
  unfinished one
- **THEN** the plan's next step rules out the spoke between the 1-hubs

### Requirement: A Spokes hint shows a line to draw and marks a dot to rule out

A displayed step SHALL show each spoke it has still to decide: a spoke to
draw as a line in the hint color, and a spoke to rule out as a ring in the
hint color round its dot on the hub's rim, the dot itself left as an unmarked
one. The hubs the step's words name SHALL carry an outline just outside their
rim in the evidence color. A spoke that an earlier leg of the journey settled
SHALL carry no hint mark.

#### Scenario: The second leg of a saturated hub

- **WHEN** a hub's count forces three lines and the player has drawn the
  first
- **THEN** the step shows the two lines still to draw in the hint color and
  the hub with its outline, and the line already drawn is drawn as any line is
