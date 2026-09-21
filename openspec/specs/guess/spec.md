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
`wantsStatusbar = false`, `isTimed = false`, `canSolve = true`, and
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

### Requirement: Guess accepts drag, hold, keyboard, and hint input

`interpretMove` SHALL support: dragging a color from the color bar, from a
current-row peg, or from a past-guess peg onto a current-row slot to set that peg
(and dragging a current-row peg away to clear it), using a blitter drag sprite;
right-clicking a current-row slot to toggle its hold; a keyboard color/peg
cursor with number-key entry, delete, hold (`CURSOR_SELECT2`), and submit
(`CURSOR_SELECT` on the submit position); and a hint key (`'h'`, `'H'`, or `'?'`)
that fills the working row with the lexicographically-first guess consistent with
all feedback so far. A row SHALL be submittable (`markable`) only when enough
pegs are filled (all, unless `allowBlank`) and — when `allowMultiple` is false —
no color repeats. The working row, holds, drag, cursor, label toggle, and cached
hint SHALL live in `GuessUi`; submitting holds SHALL carry held pegs into the
next working row.

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
