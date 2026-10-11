## ADDED Requirements

### Requirement: Map's grid is at least two squares each way and holds at least five regions

Map's `paramConfig` SHALL bound the width and the height at 2 or more and the
region count `n` at 5 or more, so the engine refuses a smaller value both when
a board is dealt and when a game ID is loaded.

#### Scenario: Four regions are refused

- **WHEN** the preset params `15x20n30de` are changed in one place, the region
  count, to read `15x20n4de`
- **THEN** they are refused with "Regions must be at least 5."

### Requirement: Map refuses a tier that a map has no board at

When a board is to be dealt above Easy, `validateParams` SHALL refuse, as
having no board at the tier: a map of 7 regions or fewer, a map two squares
wide or tall, a map whose every square is a region, and a map of 8 regions
above Normal. The refusal SHALL name the map and the tier and say there is
none. None of these SHALL be refused at Easy, or when a game ID is loaded.

#### Scenario: Seven regions have only Easy boards

- **WHEN** `4x4n7dn`, a 4x4 map of 7 regions at Normal, is validated for a deal
- **THEN** it is refused with "No map of 7 regions is Normal."
- **AND** the same params validated for loading are accepted

#### Scenario: Eight regions stop at Normal

- **WHEN** `4x4n8dh`, a 4x4 map of 8 regions at Tricky, is validated for a deal
- **THEN** it is refused with "No map of 8 regions is Tricky."

### Requirement: Map refuses a tier too rare to deal on a narrow map

When a board is to be dealt, `validateParams` SHALL refuse as too rare to
deal, after the absences: a map less than 5 squares on its narrower side of 8
regions at Normal, or of 9 or 10 regions at Tricky or Unreasonable; and a map
three squares on its narrower side at Tricky. From five squares wide the
few-region maps SHALL be dealt, and a map three squares wide SHALL be dealt at
Unreasonable.

#### Scenario: Eight regions on a 4x5 map

- **WHEN** `4x5n8dn` is validated for a deal
- **THEN** it is refused with "Normal maps of 8 regions less than 5 squares
  wide are too rare to deal."
- **AND** `5x5n8dn`, the same count on a map five squares wide, is accepted

#### Scenario: Three squares wide refuses Tricky and not Unreasonable

- **WHEN** `3x20n30dh` and `3x20n30du` are validated for a deal
- **THEN** the first is refused with "Tricky maps three squares wide are too
  rare to deal." and the second is accepted

### Requirement: Map's digits, keys and color words name one order of the colors

The four colors SHALL have one order, red, yellow, teal and violet: a clue
digit `0`–`3` in a desc is that color by position, the digit keys `1`–`4` and
the on-screen keys labeled with them enter the first to the fourth, and the
hint names a color by that word.

#### Scenario: A clue digit, a key and a word agree

- **WHEN** the desc whose clue list is `0c1321b3e01a0b10b0032` is opened on
  `15x20n30de`
- **THEN** region 0 is a red clue and region 4 a yellow one, and the key that
  would enter the color of region 4 elsewhere is `2`

### Requirement: A drag from off the map or from a blank region carries no color

A press that is on no region SHALL pick up no color and no dots, and a press
on a blank region SHALL pick up no color and that region's dots. Dropped by a
left-drag, outside notes mode, on a region that is not a clue, either SHALL
clear the region's color and leave it exactly the dots carried. A right-drag carrying no color
SHALL do the same to a blank region and SHALL change nothing on a colored one.

#### Scenario: A drag from outside the grid erases

- **WHEN** the player presses outside the grid and releases on a region they
  colored earlier
- **THEN** the region is blank and has no dots

#### Scenario: A blank region's dots are copied

- **WHEN** the player drags from a blank region showing two dots onto another
  blank region showing none
- **THEN** the second region shows the same two dots and the first keeps its
  own

### Requirement: Notes mode makes every drop a pencil drop

While notes mode is on, the release of a left-drag and the primary select key
SHALL drop what is carried as a right-drag's release does: a carried color
toggles its dot on a blank region, and nothing is changed on a colored one.
The Marks key SHALL only switch the mode and SHALL make no move.

#### Scenario: A left-drag dots while the mode is on

- **WHEN** the Marks key has been pressed and the player left-drags from a
  colored region onto a blank one
- **THEN** the blank region gains a dot of that color and stays blank

#### Scenario: A colored region cannot be erased by a drag in notes mode

- **WHEN** notes mode is on and the player drags from outside the grid onto a
  region they colored
- **THEN** no move is made, and the gesture resolves as a tap on that region
  does in notes mode: the highlight moves there and is not shown, since a
  colored region takes no dot

### Requirement: A second select where the color was picked up erases, and the secondary select dots

A select key pressed while the cursor is hidden SHALL only show the cursor.
A second select with the cursor not moved since the pick-up SHALL drop "no
color" there, which, by the primary key with notes mode off, erases a region
the player colored. The secondary select key SHALL drop what is carried as a
right-drag's release does, toggling a carried color's dot on a blank region,
whatever the notes mode.

#### Scenario: Select twice erases

- **WHEN** notes mode is off, the cursor is shown on a region the player
  colored, and the primary select key is pressed twice without an arrow
  between
- **THEN** the region is blank

#### Scenario: The secondary select leaves a dot

- **WHEN** a color is picked up with the primary select key, the cursor is
  moved to a blank region and the secondary select key is pressed
- **THEN** that region gains a dot of the color and stays blank

### Requirement: The flash-type preference chooses how a solved map flashes

The `flash-type` preference SHALL choose the completion flash. Under "Cyclic",
the default, every colored region SHALL step through the other three colors
in turn and end on its own. Under "Each to white" the four colors SHALL go
blank one after another, in the colors' order, each returning as the next
goes. Under "All to white" the whole map SHALL go blank, show its colors, and
go blank again. "Each to white" SHALL run 0.5 seconds and the others 0.3.

#### Scenario: Each to white blanks one color at a time

- **WHEN** a map is solved under "Each to white" and a frame of the first
  quarter of the flash is drawn
- **THEN** the red regions are drawn blank and the other three colors keep
  their fills

### Requirement: The stipple-style preference sizes the dots

The `stipple-style` preference SHALL choose the radius of a pencil-mark dot:
a seventh of a tile under "Small", the default, and a quarter of a tile under
"Large". It SHALL change nothing else about where or whether a dot is drawn.

#### Scenario: Large dots sit where small ones did

- **WHEN** a dotted region is drawn under "Small" and again under "Large"
- **THEN** the dots have the same centers and colors, and the larger radius
