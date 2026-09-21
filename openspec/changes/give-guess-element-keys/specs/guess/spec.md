# guess — delta

## ADDED Requirements

### Requirement: Guess offers one key per color, and a tap selects a peg

Guess SHALL offer an on-screen key for each of its colors and a Clear key.
Pressing a color key SHALL place that color at the keyboard cursor and advance
the cursor, exactly as the matching digit on a physical keyboard does; Clear
SHALL empty the peg at the cursor.

Colors are Guess's markable elements, and the collection puts a game's elements
on the panel. They were reachable only by dragging from the board's palette
column onto a slot, and that gesture is **fragile on a finger by construction**:
the frontend promotes a press that stays within 8 px for 350 ms to
`RIGHT_BUTTON`, so "press a color, pause to aim, then drag" is dropped
entirely. Guess cannot turn that promotion off with `ignoresSecondaryButton`,
because its right button genuinely means something — it toggles a peg's hold.

A key SHALL act **whether or not the cursor is shown**, revealing it. This is
deliberately unlike Map, whose keys are declined without a visible cursor: the
peg the cursor starts on is the row's first, so a player who has never moved a
cursor can fill a row left to right by pressing colors alone. It is what makes
the panel usable on touch before any selection gesture exists.

A key SHALL be painted in the color it enters (`KeyLabel.swatch`) and labeled
with the digit it sends. The **tenth** color SHALL be the `'0'` key, not the
`'a'` that the collection's digit keypad rolls over to past nine — the key
`digitOf` answers as zero and this game reads as ten. A ten-color game is
reachable from the Custom dialog, and an `'a'` key there would be one the game
refuses: inert on the panel, and invisible to the sweep that catches inert keys,
which reads the default params only.

A pointer release over a peg of the current row that would write nothing new
into it SHALL **select** that peg. The panel acts at the cursor and a player
without a keyboard has no arrow keys to move one with, so this is how a row is
edited rather than only filled. The condition SHALL be the local one — the peg
already holds whatever the release would put there — and never a comparison of
the row before and after.

Selection is additive on an empty slot, whose tap was no move at all, and a
**correction** on a filled one: the press picked that peg up and the release put
the same color straight back **and hid the cursor**, which is the one thing a
panel player must not have happen.

The board's palette column SHALL remain the drag source and the color legend,
and a tap on it SHALL remain no move. Tap-to-arm would give a tap on a slot two
meanings depending on state the player cannot see, and would put a second input
model into the one game this rule exists to stop being an exception. Dragging a
color onto a slot, and dragging a peg out of the row to clear it, SHALL continue
to work unchanged and SHALL leave no keyboard cursor behind.

A peg's **hold** SHALL stay off the panel. A hold is a modifier on a peg rather
than an element, and it is already reachable by a right click, by a long press
on touch, and by `CURSOR_SELECT2` at the cursor. Submitting a row likewise needs
nothing new: a tap on the feedback area beside a markable row already submits
it, because the press there is not consumed and the release reaches the submit
arm.

#### Scenario: A guess is committed from panel buttons alone

- **WHEN** a color key is pressed once per peg on a fresh board and then the
  submit key, with no pointer input anywhere in the sequence
- **THEN** a guess move is committed

#### Scenario: A tap on an empty slot selects it

- **WHEN** an empty slot of the current row is tapped and a color key is pressed
- **THEN** that color lands in the slot that was tapped

#### Scenario: A tap on a filled slot keeps the cursor

- **WHEN** a filled slot of the current row is tapped
- **THEN** the slot keeps its color and the cursor is shown on that slot

#### Scenario: The tenth color is the zero key

- **WHEN** the keypad is requested for a ten-color game
- **THEN** the tenth key sends `'0'` and the Clear key is still the last entry

### Requirement: Guess never writes past the end of the working row

A key that acts on the peg at the cursor SHALL be declined when the cursor is on
the **submit position** — the place past the last peg that `CURSOR_SELECT`
submits from, and that the digit keys advance onto when a row becomes markable.

The erase key was the one arm that did not bound the cursor against the peg
count while `CURSOR_SELECT` and `CURSOR_SELECT2` both did. Unguarded it writes
one past the row, which lengthens it while the markable test — reading only the
first `npegs` — still says yes, and the guess that follows is rejected by
`executeMove` with an illegal peg. It is reachable with a keyboard the moment a
row is full, and the panel's Clear key sends the same button.

#### Scenario: Clearing on the submit position is declined

- **WHEN** the working row is full, so the cursor sits on the submit position,
  and the clear key is pressed
- **THEN** no move and no UI update is produced, the row keeps its length, and
  the guess submitted next executes
