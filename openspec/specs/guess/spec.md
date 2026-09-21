# guess Specification

## Purpose
Guess, the Mastermind puzzle of deducing a hidden combination of colors from the
feedback each submitted row earns. This capability specifies its port to the TS
engine: obfuscated solution descriptions, Knuth-style scoring, and the row
composition — keys, taps, holds and a hint — that a player builds a guess with.

## Requirements

### Requirement: Guess game implements the Game interface

The engine SHALL provide a registered `guess` game implementing
`Game<GuessParams, GuessState, GuessMove, GuessUi, GuessDrawState>`: a Mastermind
clone in which the player deduces a hidden combination of `npegs` color pegs
drawn from `ncolors` colors within `nguesses` guess rows. Params SHALL be
`ncolors`, `npegs`, `nguesses`, `allowBlank`, and `allowMultiple`, encoded
`c{ncolors}p{npegs}g{nguesses}{b|B}{m|M}` with lenient decode (unknown letters
ignored). The two upstream presets — **Standard** (`6,4,10,false,true`) and
**Super** (`8,5,12,false,true`) — SHALL be offered. `validateParams` SHALL reject
`ncolors < 2` or `npegs < 2`, `ncolors > 10`, `nguesses < 1`, and
`allowMultiple = false` with `ncolors < npegs`. The game SHALL report
`wantsStatusbar = true`, `isTimed = false`, `canSolve = true`, and
`canFormatAsText = false`, and SHALL NOT provide `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ ncolors: 8, npegs: 5, nguesses: 12, allowBlank: false, allowMultiple: true }`
  are encoded
- **THEN** the result is `c8p5g12Bm`
- **AND** decoding `c8p5g12Bm` round-trips those params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `allowMultiple: false` and
  `ncolors: 3, npegs: 4`
- **THEN** it returns a non-null error string

### Requirement: Guess descriptions are obfuscated solution bitmaps

The Guess `newDesc` SHALL draw a random color sequence (each peg uniformly from
`1..ncolors`, redrawing on a repeat when `allowMultiple` is false), encode it as
a byte-per-peg bitmap, apply the upstream `obfuscate_bitmap` SHA-1 masking, and
hex-encode the result. `validateDesc` SHALL reject a desc of wrong length or one whose
de-obfuscated bytes fall outside `1..ncolors`. `newState` SHALL recover the
solution by hex-decoding and de-obfuscating the desc.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a solution sequence is obfuscated and hex-encoded to a desc, then that
  desc is hex-decoded and de-obfuscated by `newState`
- **THEN** the recovered solution equals the original sequence

#### Scenario: A corrupted description is rejected

- **WHEN** `validateDesc` is given a desc of the wrong length, or one that
  de-obfuscates to a color outside `1..ncolors`
- **THEN** it returns a non-null error string

### Requirement: Guess scores submitted rows with Knuth feedback

A `GuessMove` SHALL be a guess submission carrying the working row's pegs and
holds (`{ type: "guess", pegs, holds }`) or a solve (`{ type: "solve" }`).
`executeMove` SHALL be pure. A guess submission SHALL validate each peg against
`[allowBlank ? 0 : 1, ncolors]`, then mark the row with Knuth's feedback —
`nc_place` exact-position matches (black) and `nc_colour = Σ_color min(#guess,
#solution) − nc_place` color-only matches (white) — and store that feedback on
the row. The game SHALL set `solved = +1` (win) when every peg is in the correct
place, else advance to the next row, setting `solved = -1` (lose, revealing the
solution) when the rows are exhausted. A solve SHALL set `solved = -1`.

#### Scenario: A correct guess wins

- **WHEN** the submitted row equals the solution
- **THEN** the row's feedback is all correct-place, and `status()` returns
  `"solved"`

#### Scenario: Feedback counts black then white pegs

- **WHEN** a row with two pegs in the correct place and one further peg of a
  color present elsewhere in the solution is submitted
- **THEN** the feedback contains exactly two correct-place markers followed by
  one correct-color marker, and the source state is unmutated

#### Scenario: Exhausting the rows loses and reveals

- **WHEN** the final available row is submitted without matching the solution
- **THEN** `status()` returns `"lost"` and the solution becomes visible

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
board's left side to be dragged from, and with the drag retired the column is a
second way to say what a key already says — so the panel is the one place a
color is chosen, and the board is the guess rows and their feedback and nothing
else. Keeping it would leave the game with two color surfaces to hold in
agreement for no capability either one adds, which is the shape a notation would
break first: a strike-out on the panel and a plain legend on the board would be
two palettes of which only one shows what has been ruled out.

The board's width SHALL therefore carry no term for the palette, and its height
SHALL be the guess rows' alone rather than the greater of the rows and the
column.

That is about a quarter of the width back at standard params. **It does not
follow that the pegs get bigger**, and the spec says so because the arithmetic
invites the opposite conclusion: the app fits the board to the window, so a
freed dimension enlarges the tile only when it was the limiting one. Measured in
Chrome at 1280×720, the height limits at standard params and the peg spacing is
unchanged at 46 px — the win shows up as a narrower board, not a larger one.

The keyboard cursor SHALL be **one-dimensional**: the peg the next color will
fill. The second axis existed to walk that column and goes with it, and
`CURSOR_SELECT` — which placed whichever color the axis rested on — SHALL submit
from the submit position and be declined elsewhere. A digit names a color in one
press, from the keyboard and from the panel both, so no game state is reachable
only by walking a list.

**The cost, stated rather than discovered:** a player who turns the on-screen
keypad off (`showPuzzleKeyboard`, a global setting defaulting on) can no longer
enter a peg with the pointer alone, having neither a column to tap nor a key to
press. Solo, Keen and Filling are already in exactly that position — verified by
sweeping every pointer gesture over a real board, where all three commit zero
moves by pointer alone — so this is the collection's existing answer for a game
whose elements are values rather than positions, not a new one.

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

### Requirement: Guess composes a row from colors, holds, keyboard, and hint input

`interpretMove` SHALL support: placing a color from a panel key or from the
matching digit on a physical keyboard; selecting a slot with a pointer release
over it; right-clicking a current-row slot to toggle its hold; a
one-dimensional keyboard cursor over the pegs, with erase, hold
(`CURSOR_SELECT2`) and submit (`CURSOR_SELECT` on the submit position); a Submit
key; and a hint key (`'h'`, `'H'`, or `'?'`) that fills the working row with the
lexicographically-first guess consistent with all feedback so far.

A color the player enters SHALL land in the slot they have selected, and — when
none is selected — in the **first empty slot** of the working row. Advancing by
index instead is what let the first color pressed after a submit overwrite a
held peg: holds carry a row pre-filled *out of order*, and only the first-open
rule handles that. After any transition and after every entry, the cursor SHALL
rest on the first empty slot, or on the submit position when the row has none.

A color SHALL be declined when the row is full and no slot is selected: there is
nowhere for it to go, and overwriting a slot the player did not name would be a
guess about which one they meant.

A row SHALL be submittable (`markable`) only when enough pegs are filled (all,
unless `allowBlank`) and — when `allowMultiple` is false — no color repeats. The
working row, holds, cursor, label toggle, and cached hint SHALL live in
`GuessUi`; submitting holds SHALL carry held pegs into the next working row.

Every pointer action SHALL happen on the **release**, keyed on the button
*class* rather than the left button specifically, and the press SHALL be
declined. There is no drag to defer to, so claiming the press would buy only
drag frames nothing reads — and an unconsumed press is answered with a release
at the press point, which makes a press that slides off before it lifts still
act where it started. Reading the class is what keeps a press promoted to the
right button by the 350 ms touch hold working as itself: a held finger over the
feedback pegs still submits, where testing `LEFT_RELEASE` would drop it.

#### Scenario: Submit is only offered for a markable row

- **WHEN** the working row has fewer filled pegs than required
- **THEN** `isMarkable` is false and a submit attempt produces no guess move

#### Scenario: The hint key fills a consistent row

- **WHEN** the hint key is pressed with at least one prior scored guess
- **THEN** the working row is filled with a combination whose feedback against
  every prior guess matches that guess's recorded feedback, and the move returns
  a UI update (not a state transition)

#### Scenario: Holds carry pegs to the next guess

- **WHEN** a slot is held and a non-winning guess is submitted
- **THEN** the next working row is pre-filled with the held peg's color and
  unheld slots are cleared

#### Scenario: The first key after a submit does not overwrite a held peg

- **WHEN** a row is submitted with holds on pegs 0 and 2, leaving the next
  working row pre-filled at those two slots, and a color key is then pressed
- **THEN** the color lands in slot 1 and both held pegs keep their colors

### Requirement: Guess rubs out a color without ever lengthening the row

The erase key SHALL clear the selected slot when it holds a color, and otherwise
SHALL **backspace**: rub out the rightmost filled slot the player is not
holding. A held slot was carried over from the previous row rather than typed,
so backspacing SHALL walk past it, and SHALL be declined when every filled slot
is held.

The key SHALL never write past the last peg. The erase arm was the one that did
not bound the cursor against the peg count while `CURSOR_SELECT` and
`CURSOR_SELECT2` both did; unguarded it writes one past the row, which lengthens
it while the markable test — reading only the first `npegs` — still says yes,
and the guess that follows is rejected by `executeMove` with an illegal peg. The
bound SHALL come from the slot being chosen by a scan of the row or by a cursor
checked against `npegs`, rather than from declining the key.

#### Scenario: Clearing on the submit position backspaces

- **WHEN** the working row is full, so the cursor sits on the submit position,
  and the clear key is pressed
- **THEN** the last color the player typed is rubbed out, the row keeps its
  length, and the guess submitted next executes

#### Scenario: Backspace leaves a held peg alone

- **WHEN** the only filled slots left are held ones and the clear key is pressed
  with nothing selected
- **THEN** no move and no UI update is produced and the held colors are kept

### Requirement: Guess says why a row will not go

Guess SHALL report `wantsStatusbar` and SHALL provide `statusbarText`. The line
SHALL name the guess in progress and the number available, and — when the
working row cannot be submitted because a color repeats under
`allowMultiple: false` — SHALL say so.

The submit arms answer an unsubmittable row with `null`, and a key that appears
to do nothing is indistinguishable to a player from one that is broken. This is
the refusal made legible, and it is the reason the Submit key can be offered
unconditionally.

#### Scenario: A repeat under no-duplicates is explained

- **WHEN** the working row is filled with a repeated color in a game with
  `allowMultiple: false`
- **THEN** the submit key produces no move and the status line says that
  repeated colors are not allowed

#### Scenario: The explanation goes when the repeat does

- **WHEN** the repeated color is replaced by one the row does not already hold
- **THEN** the status line no longer mentions repeated colors and the submit key
  produces a guess move

### Requirement: Guess remembers a half-composed row across a save

Guess SHALL provide `encodeUi` and `decodeUi`, carrying the working row and the
live holds. Neither is in the move log — a row is only recorded once it is
submitted, and a hold only as part of the guess that carries it — so replaying
the log cannot recover them, and without the hook a player who closed the app
mid-row lost it. `decodeUi` SHALL treat a peg the params have no color for as an
empty slot, and SHALL leave the cursor where the next color will go.

#### Scenario: A half-composed row survives a save

- **WHEN** a working row is partly filled with a hold set, encoded through
  `encodeUi`, and decoded into a freshly built `Ui`
- **THEN** the restored row and holds equal the originals and the restored
  cursor rests on the first empty slot

#### Scenario: A peg no color exists for is dropped

- **WHEN** `decodeUi` is given a peg outside `1..ncolors`
- **THEN** that slot is left empty and the rest of the row still decodes
