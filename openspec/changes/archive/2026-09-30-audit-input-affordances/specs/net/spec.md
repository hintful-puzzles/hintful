## ADDED Requirements

### Requirement: Net's view controls and jumble have pointer routes
Every action Net's keyboard offers outside its verbs SHALL also be reachable by a pointer alone:

- **The source**: the keypad SHALL offer a Source key (also `C` on the keyboard) that arms Source mode, in which the next press on a square, or a select at the cursor, moves the source there and ends the mode; Escape SHALL end it without moving the source, and the status line SHALL say while it is on. Ctrl+arrow SHALL still move the source.
- **The jumble**: the keypad SHALL offer a Jumble key, making the same move as J.
- **The origin of a wrapping grid**: a drag begun in the margin around the grid SHALL scroll it by whole squares, the grid following the pointer, as Shift+arrow scrolls it. On a grid that does not wrap, a press in the margin SHALL start no scroll.

Source mode and a scroll in progress SHALL be transient `Ui` state that a save does not carry.

#### Scenario: The Source key and a tap move the source
- **WHEN** the player presses the Source key and then taps a square
- **THEN** the network is lit from that square, no move is recorded, and Source mode is off

#### Scenario: A margin drag scrolls as the keys do
- **WHEN** the player drags two squares to the right from the margin of a wrapping grid
- **THEN** the origin is where two presses of Shift+Left leave it
