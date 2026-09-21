# guess — delta

## MODIFIED Requirements

### Requirement: Guess offers one key per color, and a tap selects a peg

Guess SHALL offer an on-screen key for each of its colors, a Clear key, and a
Submit key. Pressing a color key SHALL place that color in the working row and
move the cursor to where the next one will go, exactly as the matching digit on
a physical keyboard does; Clear SHALL rub out a color; Submit SHALL send the row
when it is markable.

Colors are Guess's markable elements, and the collection puts a game's elements
on the panel. They were reachable only by dragging from the board's palette
column onto a slot, and that gesture is **fragile on a finger by construction**:
the frontend promotes a press that stays within 8 px for 350 ms to
`RIGHT_BUTTON`, so "press a color, pause to aim, then drag" is dropped
entirely. Guess cannot turn that promotion off with `ignoresSecondaryButton`,
because its right button genuinely means something — it toggles a peg's hold.

A key SHALL act **whether or not the cursor is shown**, revealing it. This is
deliberately unlike Map, whose keys are declined without a visible cursor: with
no cursor a color goes to the first empty slot, so a player who has never moved
a cursor can fill a row by pressing colors alone. It is what makes the panel
usable on touch before any selection gesture exists.

A key SHALL be painted in the color it enters (`KeyLabel.swatch`) and labeled
with the digit it sends. The **tenth** color SHALL be the `'0'` key, not the
`'a'` that the collection's digit keypad rolls over to past nine — the key
`digitOf` answers as zero and this game reads as ten. A ten-color game is
reachable from the Custom dialog, and an `'a'` key there would be one the game
refuses: inert on the panel, and invisible to the sweep that catches inert keys,
which reads the default params only.

The **Submit key** SHALL carry a button code this frontend's key map does not
send, so that the panel is its only emitter and it cannot collide with a
bare-letter app shortcut. It SHALL be offered unconditionally and SHALL be
declined on a row that is not markable: `requestKeys` takes params alone,
because the panel reloads only on a param change, so a key that appears only
when a row is complete is not expressible. The status line SHALL carry the
refusal's reason.

Submitting SHALL NOT happen automatically when the last slot is filled. Undo
cannot take a submitted row back — `changedState` rebuilds the working row from
the holds alone, so undoing the first guess of a board yields an empty row
rather than the one that was sent — which would make a mis-timed automatic
submission a retype rather than a mistake to correct. It could not replace the
Submit control in any case, because editing a peg of a row that is already full
never re-crosses the empty-to-full boundary.

A pointer release over a peg of the current row SHALL **select** that peg. The
panel acts where the player is pointing and a player without a keyboard has no
arrow keys, so this is how a row is edited rather than only filled — and it is
what keeps a deliberate mid-row blank expressible under `allowBlank`, where a
blank's *position* is part of the probe and filling the first empty slot can
only ever leave blanks as a suffix.

The board SHALL NOT draw a palette column. Upstream drew every color down the
board's left side to be dragged from, and with the drag retired the column was a
second way to say what a key already says, costing a quarter of the board's
width for no capability either surface lacked.

The board's width SHALL therefore carry no term for the palette, and its height
SHALL be the guess rows' alone rather than the greater of the rows and the
column.

That is about a quarter of the width back at standard params. **It does not
follow that the pegs get bigger**, and the spec says so because the arithmetic
invites the opposite conclusion: the app fits the board to the window, so a
freed dimension enlarges the tile only when it was the limiting one. Measured in
Chrome at 1280×720, the height limits at standard params and the peg spacing is
unchanged at 46 px — the win shows up as a narrower board, not a larger one.

**A pointer-only way to enter a peg SHALL remain**, with the keypad turned off
(`showPuzzleKeyboard`) as with it on. It is the answer row's (see "Guess keeps
rule-out marks in an answer row"): a tap on one of its dots enters that color in
the same column of the working row. That surface is the notation, so it cannot
become a palette that disagrees with what has been ruled out — the objection
that retired the column does not apply to it.

The keyboard cursor SHALL be **one-dimensional**: the peg the next color will
fill, or — in notes mode — the answer slot the next mark goes in. The second
axis existed to walk the palette column and went with it. `CURSOR_SELECT` SHALL
submit from the submit position and SHALL toggle notes mode on a slot, which is
what Enter on the highlight does in every note-taking game; with the cursor
hidden it SHALL be declined. A digit names a color in one press, from the
keyboard and from the panel both, so no game state is reachable only by walking
a list.

A peg's **hold** SHALL stay off the panel. A hold is a modifier on a peg rather
than an element, and it is already reachable by a right click, by a long press
on touch, and by `CURSOR_SELECT2` at the cursor.

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

#### Scenario: The board has no palette to tap

- **WHEN** the board is tapped to the left of the guess rows, where the palette
  column used to stand
- **THEN** no move and no UI update is produced, and the working row is
  unchanged

#### Scenario: The tenth color is the zero key

- **WHEN** the keypad is requested for a ten-color game
- **THEN** the tenth key sends `'0'` and the Clear and Submit keys are still the
  last two entries

#### Scenario: Enter on a slot toggles notes mode

- **WHEN** the cursor is shown on a peg of the working row and `CURSOR_SELECT`
  is pressed twice
- **THEN** notes mode is switched on by the first press and off by the second,
  and no move is made

## REMOVED Requirements

### Requirement: Guess composes a row from colors, holds, keyboard, and hint input

**Reason**: its hint key filled the working row with upstream's row-filler, and
the key (`'h'`, `'H'`, `'?'`) now belongs to the app's Hint command, which Guess
answers through `Game.hint()`. The row-filler's job — a guess consistent with
every score — is the hint's probe step, chosen better and narrated with what it
counted.

**Migration**: the surviving rules and scenarios are "Guess composes a row from
colors, holds and keyboard input" below; the hint is "Guess's hint places what
the rows prove, then suggests a guess".

## ADDED Requirements

### Requirement: Guess composes a row from colors, holds and keyboard input

`interpretMove` SHALL support: placing a color from a panel key, from the
matching digit on a physical keyboard, or from a tap on an answer-row dot;
selecting a slot with a pointer release over it; right-clicking a current-row
slot to toggle its hold; a one-dimensional keyboard cursor over the pegs, with
erase, hold (`CURSOR_SELECT2`) and submit (`CURSOR_SELECT` on the submit
position); and a Submit key. Guess SHALL NOT consume `'h'`, `'H'` or `'?'`,
which reach the app's Hint command.

A color the player enters SHALL land in the slot they have selected, and — when
none is selected — in the **first empty slot** of the working row. Advancing by
index instead is what let the first color pressed after a submit overwrite a
held peg: holds carry a row pre-filled *out of order*, and only the first-open
rule handles that. After any transition that changes the row being played, and
after every entry, the cursor SHALL rest on the first empty slot, or on the
submit position when the row has none.

A color SHALL be declined when the row is full and no slot is selected: there is
nowhere for it to go, and overwriting a slot the player did not name would be a
guess about which one they meant.

A row SHALL be submittable (`markable`) only when enough pegs are filled (all,
unless `allowBlank`) and — when `allowMultiple` is false — no color repeats. The
working row, holds, cursor, label toggle and notes mode SHALL live in
`GuessUi`; submitting holds SHALL carry held pegs into the next working row.
`changedState` SHALL rebuild the working row only when the row being played
changes — a submit, an undo or redo of one, a reveal — and SHALL leave it alone
across a mark, which is a move too.

Every pointer action SHALL happen on the **release**, keyed on the button
*class* rather than the left button specifically, and the press SHALL be
declined — except a right-click or held finger on an answer-row dot, whose press
rules the color out and whose release then does nothing. There is no drag to
defer to, so claiming the press would buy only drag frames nothing reads — and
an unconsumed press is answered with a release at the press point, which makes
a press that slides off before it lifts still act where it started. Reading the
class is what keeps a press promoted to the right button by the 350 ms touch
hold working as itself: a held finger over the feedback pegs still submits,
where testing `LEFT_RELEASE` would drop it.

#### Scenario: Submit is only offered for a markable row

- **WHEN** the working row has fewer filled pegs than required
- **THEN** `isMarkable` is false and a submit attempt produces no guess move

#### Scenario: Holds carry pegs to the next guess

- **WHEN** a slot is held and a non-winning guess is submitted
- **THEN** the next working row is pre-filled with the held peg's color and
  unheld slots are cleared

#### Scenario: The first key after a submit does not overwrite a held peg

- **WHEN** a row is submitted with holds on pegs 0 and 2, leaving the next
  working row pre-filled at those two slots, and a color key is then pressed
- **THEN** the color lands in slot 1 and both held pegs keep their colors

#### Scenario: A mark keeps the half-composed row

- **WHEN** two pegs of the working row are filled and a color is ruled out of
  an answer slot, and that mark is then undone
- **THEN** the working row still holds both pegs after each

#### Scenario: The hint letters reach the app

- **WHEN** `'h'`, `'H'` or `'?'` is pressed on a board in play
- **THEN** `interpretMove` returns `null`

### Requirement: Guess keeps rule-out marks in an answer row

Guess SHALL draw an **answer row** below the guess rows while the game is in
play: one slot per peg of the hidden combination, each showing a dot for every
color — filled while the color is not ruled out of that slot, hollow in its own
color once it is. The reveal SHALL replace it when the game ends. A dot SHALL be
small enough never to read as a peg.

A slot's ruled-out colors SHALL be part of the state (`ruledOut`, a bitmask per
slot), changed by a mark move that **sets** each named mark to ruled out or not
rather than toggling it, so that a mark undoes, replays from the move log, and
can be placed by a hint step idempotently.

A player SHALL be able to rule a color out, and back in, by:

- a right-click or held finger on its dot, in either mode;
- a tap on its dot in notes mode;
- its color key or digit in notes mode, which acts on the answer slot the
  cursor is on; Clear in notes mode SHALL put every color back in that slot.

Notes mode SHALL be `GuessUi.pencilMode`, so the engine supplies the Marks key
and the pencil-mode indicator. In notes mode the cursor SHALL be drawn on the
answer row rather than the working row, and SHALL not rest on the submit
position.

Outside notes mode, a tap on a dot SHALL enter that color in the **same
column** of the working row.

A mark SHALL never be reported as a mistake. The answer is hidden, and a check
that a mark contradicts it would tell the player something the rows have not;
a mark the rows do not justify is a hypothesis.

#### Scenario: A tap on a dot enters that color in its column

- **WHEN** notes mode is off and the dot for color 5 in the third answer slot is
  tapped on a fresh board
- **THEN** the working row is `0, 0, 5, 0` and no move is made

#### Scenario: A held finger on a dot rules it out

- **WHEN** the right button is pressed on the dot for color 3 in the second
  answer slot and then released
- **THEN** the press produces a mark move ruling 3 out of that slot, the release
  produces nothing, and the working row is unchanged

#### Scenario: A color key marks in notes mode

- **WHEN** notes mode is on, the cursor is on the third slot, and the fourth
  color key is pressed
- **THEN** a mark move rules color 4 out of the third answer slot

#### Scenario: Notes mode keeps the cursor off the submit position

- **WHEN** notes mode is switched on while the cursor rests on the submit
  position
- **THEN** the cursor moves to the last slot

### Requirement: Guess's hint places what the rows prove, then suggests a guess

Guess SHALL provide `hint`, `hintKeepTrack` and `refreshHintStep`. The hint
SHALL read nothing but the scored rows — never the hidden answer — so that two
boards whose rows scored alike get the same plan.

Its steps SHALL be of two kinds, in this order.

**Marks.** Each step SHALL place, as one mark move, the rule-outs that one
one-row reading proves and the answer row does not yet show, narrated with the
reading, with the row it reads outlined, any answer slots it leans on outlined,
and the dots it rules out ringed. The readings SHALL be sound: no answer that
fits every scored row has a color the hint rules out of a slot, which SHALL be
checked by brute force over the whole answer space. The hint SHALL derive its
own rule-outs from the rows rather than read the player's, and SHALL NOT place a
mark the board already has.

**A probe.** Every plan SHALL end with a guess that fits every score so far,
with one dot per slot ringed. Its sentence SHALL claim only what was counted —
how many answers still fit, and the most the guess can leave whatever it
scores — and those counts SHALL be checked against a recount. The probe SHALL be
a function of the scored rows alone, so a plan recomputed after anything but a
guess names the same guess.

On the presets a player who follows the hint SHALL win within the row limit,
checked over every Standard answer. The hint SHALL refuse only once the game is
over.

#### Scenario: A row with no blacks is read as marks

- **WHEN** repeats are off and the only scored row is `1, 2, 3, 4` with two
  whites and no blacks
- **THEN** the first step rules 1, 2, 3 and 4 out of the first, second, third
  and fourth answer slots respectively, in one mark move

#### Scenario: A mark the player made is not taught again

- **WHEN** the player has already ruled 2 out of the second slot on that board
- **THEN** the first step rules out the other three and not that one

#### Scenario: The plan ends in a guess that could win

- **WHEN** a hint is asked on any board in play
- **THEN** its last step is a guess move whose pegs fit every scored row

#### Scenario: Following the hint wins

- **WHEN** every Standard answer is played by applying the first step of a
  freshly computed hint until the game ends
- **THEN** every game is won within ten rows
