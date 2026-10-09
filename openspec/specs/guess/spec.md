# guess Specification

## Purpose
Guess, the Mastermind puzzle of deducing a hidden combination of colors from the
feedback each submitted row earns: its params and obfuscated solution
descriptions, Knuth-style scoring, the row a player composes with keys, taps and
holds, the answer row the player keeps rule-out marks in, the mistake check on
those marks, and the hint that fills the row and suggests a guess.

## Requirements

### Requirement: Guess's parameters

Params SHALL be `ncolors`, `npegs`, `nguesses`, `allowBlank` and
`allowMultiple`, encoded `c{ncolors}p{npegs}g{nguesses}{b|B}{m|M}`, with a
lenient decode that ignores unknown letters.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ ncolors: 8, npegs: 5, nguesses: 12, allowBlank: false, allowMultiple: true }`
  are encoded
- **THEN** the result is `c8p5g12Bm`
- **AND** decoding `c8p5g12Bm` round-trips those params

### Requirement: Guess refuses params no board can be dealt for

The `paramConfig` bounds SHALL hold `ncolors` to 2 through 10, `npegs` to at
least 2 and `nguesses` to at least 1, so that the engine refuses a value outside
them. `validateParams` SHALL reject `allowMultiple = false` with
`ncolors < npegs`.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `allowMultiple: false` and
  `ncolors: 3, npegs: 4`
- **THEN** it returns a non-null error string

#### Scenario: An eleventh color is refused by the engine

- **WHEN** the engine's params check is given `ncolors: 11`
- **THEN** it returns a refusal that names the Colors field

### Requirement: Guess descriptions are obfuscated solution bitmaps

`newDesc` SHALL draw a random color sequence, each peg uniformly from
`1..ncolors` and redrawn on a repeat when `allowMultiple` is false, encode it as
a byte-per-peg bitmap, apply `obfuscateBitmap`, and hex-encode the result.
`newState` SHALL recover the solution by reversing that, and SHALL refuse a desc
of the wrong length, one whose bytes fall outside `1..ncolors`, and, when
`allowMultiple` is false, one that repeats a color.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a solution sequence is obfuscated and hex-encoded to a desc, then that
  desc is hex-decoded and de-obfuscated by `newState`
- **THEN** the recovered solution equals the original sequence

#### Scenario: A corrupted description is rejected

- **WHEN** the engine validates a desc of the wrong length, or one that
  de-obfuscates to a color outside `1..ncolors`
- **THEN** it returns a refusal with its reason

#### Scenario: A hand-typed answer with a repeat is refused where repeats are off

- **WHEN** a desc that de-obfuscates to the same color in two slots is offered
  to a game with `allowMultiple: false`
- **THEN** it is refused as repeating a color

### Requirement: A Guess move is a submitted row or a set of marks

A `GuessMove` SHALL be a guess submission carrying the working row's pegs and
holds (`{ type: "guess", pegs, holds }`), or a set of answer-row marks. Solve
SHALL submit the answer as the next guess, which wins.

#### Scenario: Solve plays the answer

- **WHEN** the move `solve` returns is executed on a board in play
- **THEN** `status()` returns `"solved"` and the source state is unmutated

### Requirement: Guess scores submitted rows with Knuth feedback

A guess submission SHALL validate each peg against
`[allowBlank ? 0 : 1, ncolors]`, then mark the row with Knuth's feedback:
`nc_place` exact-position matches (black) and
`nc_colour = Σ_color min(#guess, #solution) − nc_place` color-only matches
(white). It SHALL store that feedback on the row, then advance to the next row
unless every peg is in the correct place.

#### Scenario: Feedback counts black then white pegs

- **WHEN** a row with two pegs in the correct place and one further peg of a
  color present elsewhere in the solution is submitted
- **THEN** the feedback contains exactly two correct-place markers followed by
  one correct-color marker, and the source state is unmutated

#### Scenario: A blank peg is refused where blanks are off

- **WHEN** a guess move carrying an empty peg is executed in a game with
  `allowBlank: false`
- **THEN** `executeMove` throws

### Requirement: Guess is won or lost by the rows on the board

Guess SHALL be a Mastermind clone: the player deduces a hidden combination of
`npegs` color pegs drawn from `ncolors` colors within `nguesses` guess rows. The
game SHALL be won when the last submitted row has every peg in the correct
place, and lost, with the solution revealed, when the rows are exhausted
without a win.

#### Scenario: A correct guess wins

- **WHEN** the submitted row equals the solution
- **THEN** the row's feedback is all correct-place, and `status()` returns
  `"solved"`

#### Scenario: Exhausting the rows loses and reveals

- **WHEN** the final available row is submitted without matching the solution
- **THEN** `status()` returns `"lost"` and the solution becomes visible

### Requirement: Guess offers one key per color

Guess SHALL offer an on-screen key for each of its colors, a Clear key, and a
Submit key. Pressing a color key SHALL place that color in the working row and
move the cursor to where the next one will go, exactly as the matching digit on
a physical keyboard does; Clear SHALL rub out a color; Submit SHALL send the row
when it is markable.

#### Scenario: A guess is committed from panel buttons alone

- **WHEN** a color key is pressed once per peg on a fresh board and then the
  submit key, with no pointer input anywhere in the sequence
- **THEN** a guess move is committed

### Requirement: A key acts whether or not the cursor is shown

Outside notes mode a color key or Clear SHALL act whether or not the cursor is
shown, revealing it, and the Submit key SHALL act whether or not it is shown.
With no cursor a color SHALL go to the first empty slot, so that a player who
has never moved a cursor can fill a row by pressing colors alone.

#### Scenario: The first key of a fresh board

- **WHEN** a color key is pressed on a fresh board whose cursor has never been
  shown
- **THEN** the color lands in the first slot and the cursor is shown on the
  second

### Requirement: A color key wears its color and its digit

A key SHALL be painted in the color it enters (`KeyLabel.swatch`) and labeled
with the digit it sends. The tenth color SHALL be the `'0'` key, not the `'a'`
that the collection's digit keypad rolls over to past nine: `digitOf` answers
that key as zero and this game reads it as ten, so an `'a'` key would be one the
game refuses.

#### Scenario: The tenth color is the zero key

- **WHEN** the keypad is requested for a ten-color game
- **THEN** the tenth key sends `'0'` and the Clear and Submit keys are still the
  last two entries

### Requirement: The Submit key is always offered and only the panel sends it

The Submit key SHALL carry a button code this frontend's key map does not send,
so that the panel is its only emitter and it cannot collide with a bare-letter
app shortcut. It SHALL be offered unconditionally, because `requestKeys` takes
params alone, and SHALL be declined on a row that is not markable. The status
line SHALL carry the refusal's reason (see "Guess says why a row will not go").

#### Scenario: Submit on a row that is not ready

- **WHEN** the Submit key is pressed on a fresh board with an empty working row
- **THEN** no move and no UI update is produced

### Requirement: Guess never submits a row on its own

Submitting SHALL NOT happen automatically when the last slot is filled. Undo
cannot give a submitted row back, because `changedState` rebuilds the working
row from the holds alone, so an automatic submission would be a retype rather
than a mistake to correct.

#### Scenario: Filling the last slot waits for Submit

- **WHEN** a color key fills the last empty slot of the working row on a
  Standard board
- **THEN** no guess move is made and the cursor rests on the submit position

### Requirement: A tap selects a peg of the working row

A pointer release over a peg of the current row SHALL select that peg and leave
notes mode, so that a row can be edited rather than only filled, and a
deliberate mid-row blank stays expressible under `allowBlank`, where a blank's
position is part of the guess.

#### Scenario: A tap on an empty slot selects it

- **WHEN** an empty slot of the current row is tapped and a color key is pressed
- **THEN** that color lands in the slot that was tapped

#### Scenario: A tap on a filled slot keeps the cursor

- **WHEN** a filled slot of the current row is tapped
- **THEN** the slot keeps its color and the cursor is shown on that slot

### Requirement: The board draws no palette column

The board SHALL NOT draw a palette column: the key panel already says what a
column of colors would. The board's width SHALL carry no term for a palette, and
its height SHALL be that of the guess rows and the answer row, never the greater
of the rows and a column.

#### Scenario: The board has no palette to tap

- **WHEN** the board is tapped to the left of the guess rows
- **THEN** no move and no UI update is produced, and the working row is
  unchanged

### Requirement: The panel is the pointer's only way to choose a color

A tap SHALL select a slot, of the working row or of the answer row (see "Guess
marks an answer slot selected as a whole"), and never a color inside one. The
key panel SHALL be the pointer's only way to choose a color, so a player who
turns the on-screen keypad off (`showPuzzleKeyboard`) SHALL enter pegs and marks
with the physical keyboard's digits.

#### Scenario: A tap on one color's block chooses no color

- **WHEN** an answer slot is tapped on the block of one of its colors
- **THEN** the slot is selected, no mark move is made, and no peg is placed

### Requirement: Guess's keyboard cursor is one-dimensional

The keyboard cursor SHALL be one-dimensional: the peg the next color will fill,
or, in notes mode, the answer slot the next mark goes in. `CURSOR_SELECT` SHALL
submit from the submit position and SHALL toggle notes mode on a slot; with the
cursor hidden it SHALL be declined. A digit SHALL name a color in one press,
from the keyboard and from the panel both, so that no game state is reachable
only by walking a list.

#### Scenario: Enter on a slot toggles notes mode

- **WHEN** the cursor is shown on a peg of the working row and `CURSOR_SELECT`
  is pressed twice
- **THEN** notes mode is switched on by the first press and off by the second,
  and no move is made

### Requirement: A hold stays off the panel

A peg's hold SHALL stay off the panel: a hold is a modifier on a peg rather than
an element. It SHALL be reachable by a right click, by a long press on touch,
and by `CURSOR_SELECT2` at the cursor. Guess SHALL NOT declare
`ignoresSecondaryButton`, because its secondary button toggles a hold.

#### Scenario: A right click toggles a hold

- **WHEN** the right button is pressed on a slot of the current row, and then
  pressed on it again
- **THEN** the slot is held after the first press and not held after the second

### Requirement: Guess says why a row will not go

While the game is in play the status line SHALL name the guess in progress and
the number available, and, when the working row cannot be submitted because a
color repeats under `allowMultiple: false`, SHALL say so: a submit that is
silently declined reads to a player as a broken key.

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
live holds, which replaying the move log cannot recover. The encoding SHALL be
one field per slot, comma-separated: the peg's color number, `0` for an empty
slot, followed by `_` when the slot is held (`3_,0,5,2`). `decodeUi` SHALL
treat a peg the params have no color for as an empty slot, and SHALL leave the
cursor where the next color will go.

#### Scenario: A half-composed row survives a save

- **WHEN** a working row is partly filled with a hold set, encoded through
  `encodeUi`, and decoded into a freshly built `Ui`
- **THEN** the restored row and holds equal the originals and the restored
  cursor rests on the first empty slot

#### Scenario: A peg no color exists for is dropped

- **WHEN** `decodeUi` is given a peg outside `1..ncolors`
- **THEN** that slot is left empty and the rest of the row still decodes

### Requirement: Guess leaves the hint letters to the app

Guess SHALL NOT consume `'h'`, `'H'` or `'?'`, which reach the app's Hint
command.

#### Scenario: The hint letters reach the app

- **WHEN** `'h'`, `'H'` or `'?'` is pressed on a board in play
- **THEN** `interpretMove` returns `null`

### Requirement: A color lands in the selected slot, else the first empty one

A color the player enters SHALL land in the slot they have selected, and, when
none is selected, in the first empty slot of the working row, because holds
carry a row pre-filled out of order. After any transition that changes the row
being played, and after every entry, the cursor SHALL rest on the first empty
slot. With none it SHALL rest on the last slot in notes mode, else on the submit
position when the row is markable, else on the slot just entered, or the first
after a transition.

#### Scenario: The first key after a submit does not overwrite a held peg

- **WHEN** a row is submitted with holds on pegs 0 and 2, leaving the next
  working row pre-filled at those two slots, and a color key is then pressed
- **THEN** the color lands in slot 1 and both held pegs keep their colors

#### Scenario: A full row that cannot go keeps the cursor on a slot

- **WHEN** the last slot of a row is filled with a color the row already holds,
  in a game with `allowMultiple: false`
- **THEN** the cursor rests on that slot and not on the submit position

### Requirement: A color is declined when the row is full and no slot is selected

A color SHALL be declined when the row is full and no slot is selected: there
is nowhere for it to go, and overwriting a slot the player did not name would be
a guess about which one they meant.

#### Scenario: A color key on a full row

- **WHEN** the working row is full, no slot is selected, and a color key is
  pressed
- **THEN** no move and no UI update is produced and the row is unchanged

### Requirement: A row is submittable only when it is markable

A row SHALL be submittable (`markable`) only when enough pegs are filled (all,
unless `allowBlank`) and, when `allowMultiple` is false, no color repeats.

#### Scenario: Submit is only offered for a markable row

- **WHEN** the working row has fewer filled pegs than required
- **THEN** `isMarkable` is false and a submit attempt produces no guess move

### Requirement: The working row lives in the Ui and is rebuilt only when the row changes

The working row, holds, cursor, label toggle and notes mode SHALL live in
`GuessUi`; submitting holds SHALL carry held pegs into the next working row.
`changedState` SHALL rebuild the working row only when the row being played
changes (a submit, an undo or redo of one, a reveal) and SHALL leave it alone
across a mark, which is a move too.

#### Scenario: Holds carry pegs to the next guess

- **WHEN** a slot is held and a non-winning guess is submitted
- **THEN** the next working row is pre-filled with the held peg's color and
  unheld slots are cleared

#### Scenario: A mark keeps the half-composed row

- **WHEN** two pegs of the working row are filled and a color is ruled out of
  an answer slot, and that mark is then undone
- **THEN** the working row still holds both pegs after each

### Requirement: Guess's pointer acts on the release

A pointer action SHALL happen on the release, keyed on the button class rather
than the left button specifically, and its press SHALL be declined; the hold
toggle alone SHALL act on the secondary button's press. An unconsumed press is
answered with a release at the press point, so a press that slides off before it
lifts SHALL still act where it started, and a press the touch hold promoted to
the right button SHALL still act as itself.

#### Scenario: A held finger over the feedback pegs still submits

- **WHEN** the working row is markable and the right button is pressed and
  released over the feedback pegs beside it
- **THEN** the press is declined and the release produces a guess move

### Requirement: Guess's hint places what the rows prove, then suggests a guess

Guess SHALL provide `hint`, `hintKeepTrack` and `refreshHintStep`. The hint
SHALL read nothing but the scored rows, never the hidden answer, so that two
boards whose rows scored alike get the same plan. Its steps SHALL be of two
kinds, in this order: marks, then a probe.

#### Scenario: Two answers behind the same rows

- **WHEN** two boards with different hidden answers hold the same scored rows
  and the same marks
- **THEN** the hint gives both the same plan

### Requirement: A mark step places what one reading proves

Each mark step SHALL place, as one mark move, the rule-outs that one one-row
reading proves and the answer row does not yet show, narrated with the reading,
with the row it reads striped, any answer slots it leans on outlined, and the
colors it rules out framed. The hint SHALL derive its own rule-outs from the
rows rather than read the player's, and SHALL NOT place a mark the board already
has.

#### Scenario: A row with no blacks is read as marks

- **WHEN** repeats are off and the only scored row is `1, 2, 3, 4` with two
  whites and no blacks
- **THEN** the first step rules 1, 2, 3 and 4 out of the first, second, third
  and fourth answer slots respectively, in one mark move

#### Scenario: A mark the player made is not taught again

- **WHEN** the player has already ruled 2 out of the second slot on that board
- **THEN** the first step rules out the other three and not that one

### Requirement: The hint's readings are sound

The readings SHALL be sound: no answer that fits every scored row has a color
the hint rules out of a slot. Soundness SHALL be checked by brute force over the
whole answer space.

#### Scenario: Every fitting answer survives the rule-outs

- **WHEN** every answer that fits a board's scored rows is enumerated
- **THEN** none of them has, in any slot, a color the hint rules out of that
  slot

### Requirement: Every plan ends with a probe that could win

Every plan SHALL end with a guess that fits every score so far, with one color
per slot framed, unless its search is out of reach (see the next requirement).
Its sentence SHALL claim only what was counted: how many
answers still fit, and the most the guess can leave whatever it scores. Those
counts SHALL be checked against a recount. The probe SHALL be a function of the
scored rows alone, so that a plan recomputed after anything but a guess names
the same guess.

#### Scenario: The plan ends in a guess that could win

- **WHEN** a hint is asked on any board in play
- **THEN** its last step is a guess move whose pegs fit every scored row

### Requirement: Following the hint wins, and the hint refuses only a dead end

On the presets a player who follows the hint SHALL win within the row limit,
checked over every Standard answer. The hint SHALL refuse only once the game is
over, or on a board so large that its search finds no fitting answer within its
budget and no mark step is left. With mark steps left on such a board, the plan
SHALL be those steps alone.

#### Scenario: Following the hint wins

- **WHEN** every Standard answer is played by applying the first step of a
  freshly computed hint until the game ends
- **THEN** every game is won within ten rows

#### Scenario: A lost game has no hint

- **WHEN** a hint is asked after the rows are exhausted
- **THEN** the hint refuses, saying the game is over

### Requirement: Guess draws an answer row of the colors still possible

Guess SHALL draw an answer row below the guess rows while the game is in play,
1.5 tiles tall: one slot per peg of the hidden combination, each a dark well
divided into one cell per color, in keypad order and in the same place in every
slot. A color still possible in a slot SHALL be a solid block inset in its
cell, with no outline; a color ruled out of the slot SHALL be drawn as nothing.
The reveal SHALL replace the row when the game ends.

#### Scenario: A ruled-out color is drawn as nothing

- **WHEN** the answer row is drawn on a fresh Standard board
- **THEN** there is one block per color per slot, and a slot with a color ruled
  out draws one block fewer

### Requirement: The answer row's blocks stay legible

The well SHALL be darker than every peg color in both color schemes, so that no
block can sink into it and read as ruled out. The cell grid SHALL be the one
giving the largest cell, fewest wasted cells among equals. A block SHALL be
small enough never to read as a peg. With labels on, a block SHALL carry its
color's digit.

#### Scenario: Six colors in a slot

- **WHEN** the answer row is drawn on a fresh Standard board
- **THEN** each slot's cells are two across and three down, and each block is
  under half a tile across

### Requirement: A mark is state, set by a move

A slot's ruled-out colors SHALL be part of the state (`ruledOut`, a bitmask per
slot), changed by a mark move that sets each named mark to ruled out or not
rather than toggling it, so that a mark undoes, replays from the move log, and
can be placed by a hint step idempotently.

#### Scenario: The same mark move twice

- **WHEN** a mark move ruling color 5 out of the third slot is executed, and
  then executed again
- **THEN** color 5 is ruled out of the third slot after each

### Requirement: Guess marks an answer slot selected as a whole

Where the selection is SHALL decide what a color key does. A pointer release
anywhere on an answer slot, its gap and margin included, SHALL select that slot
and switch notes mode on; a release on a working-row peg SHALL select it and
switch notes mode off. A right-click or held finger on the answer row SHALL mark
nothing: its press SHALL be declined, and its release SHALL select the slot as a
tap does.

#### Scenario: A tap anywhere on an answer slot selects it for marking

- **WHEN** notes mode is off and the third answer slot is tapped at its first
  or its last point
- **THEN** notes mode is on, the cursor is shown on the third slot, no move is
  made, and the working row is unchanged

#### Scenario: A tap on the working row goes back to entering pegs

- **WHEN** an answer slot has been tapped and then the fourth peg of the
  working row is tapped
- **THEN** notes mode is off and the cursor is on the fourth peg

#### Scenario: A held finger on the answer row marks nothing

- **WHEN** the right button is pressed on an answer slot and released there, as
  a right-click or a finger held past the touch hold arrives
- **THEN** the press returns `null`, and the release shows the cursor on that
  slot with notes mode on and no color ruled out

### Requirement: In notes mode a color key rules its color out

In notes mode a color key or digit SHALL rule its color out of the selected
slot, or back in when it is already out, and Clear SHALL put every color back in
that slot. With no slot selected, both SHALL be declined.

#### Scenario: A color key marks the selected slot

- **WHEN** the third answer slot has been tapped and the fifth color key is
  pressed
- **THEN** a mark move rules color 5 out of the third answer slot

#### Scenario: Notes mode with no cursor shown

- **WHEN** notes mode is switched on by the Marks key on a board whose cursor
  has never been shown, and a color key is pressed
- **THEN** no move and no UI update is produced

### Requirement: Notes mode is the engine's pencil mode

Notes mode SHALL be `GuessUi.pencilMode`, so that the engine supplies the Marks
key and the pencil-mode indicator. In notes mode a shown cursor SHALL be drawn
round the answer slot rather than on the working row, in the margin outside the
well, and SHALL NOT rest on the submit position. The Marks key and
`CURSOR_SELECT` SHALL therefore move a shown frame between the rows in the same
column; the Marks key SHALL NOT itself show a hidden cursor.

#### Scenario: Notes mode keeps the cursor off the submit position

- **WHEN** notes mode is switched on while the cursor rests on the submit
  position
- **THEN** the cursor moves to the last slot

#### Scenario: A row submitted in notes mode leaves a slot framed

- **WHEN** every peg is held, notes mode is on, and a row that does not win is
  submitted, so that the next working row arrives full
- **THEN** the frame is on the last answer slot, and a color key rules its
  color out of that slot

### Requirement: A hint's marks on the answer row sit beside the content

A hint's mark on a color SHALL be a thin frame in the gap beside its block,
never a fill over it; a hint's evidence outline on a slot SHALL sit in the
margin outside the well.

#### Scenario: A color the hint rules out

- **WHEN** a mark step is shown before its marks are placed
- **THEN** each color it rules out is still drawn as its whole block, with a
  frame round the block in the gap

### Requirement: Guess checks the answer row's rule-outs against the code

Guess's `findMistakes` SHALL report each answer slot whose rule-out marks include
the code's color in that slot, as the slot alone, never the color, and nothing
once the game is over. It SHALL NOT read the guess rows, scored or in progress,
and SHALL NOT report any other mark. The mistake SHALL be drawn as a frame in the
error color in the margin round the slot's well, and SHALL repaint when it comes
and when it goes.

#### Scenario: A rule-out of the code's own color

- **WHEN** the player rules out of a slot the color the code has there, and runs
  Check & Save
- **THEN** that slot is framed as a mistake and the board is not saved

#### Scenario: Every color ruled out

- **WHEN** every color is ruled out of a slot
- **THEN** that slot is reported, since one of those colors is the code's

#### Scenario: A guess that is not the code

- **WHEN** the player has submitted rows that are not the code, and no slot rules
  out its own color
- **THEN** `findMistakes` reports nothing

### Requirement: Guess draws an empty hole as quiet surface

`redraw` SHALL draw an empty peg hole, and an empty feedback hole, as the
collection's cell surface inside a rim in the surface's grid line, so that the
pegs are the color on the board and an empty hole is where a peg goes and no
state of its own. The ten peg colors, the black and white feedback pegs, the
wash that lights a row ready to be scored, the held-peg bar and the answer
row's well SHALL keep their own colors.

#### Scenario: An empty hole recedes

- **WHEN** a board with rows not yet reached is drawn
- **THEN** each of their holes is filled in the cell surface and rimmed in the
  grid line
- **AND** no empty hole is outlined in ink

#### Scenario: A peg keeps its color and its outline

- **WHEN** a row holds pegs
- **THEN** each peg is filled in its own color and outlined in ink

### Requirement: Guess's rub-out keys act on the row the frame is on

Outside notes mode the erase key SHALL clear the selected slot when it holds a
color, and otherwise SHALL backspace: rub out the rightmost filled slot the
player is not holding. Backspacing SHALL walk past a held slot, which was
carried over rather than typed, and SHALL be declined when every filled slot is
held. The key SHALL never write past the last peg. `D` and `d` SHALL do what
the erase key does in either mode, and in notes mode touch no peg.

#### Scenario: Clearing on the submit position backspaces

- **WHEN** the working row is full, so the cursor sits on the submit position,
  and the clear key is pressed
- **THEN** the last color the player typed is rubbed out, the row keeps its
  length, and the guess submitted next executes

#### Scenario: Backspace leaves a held peg alone

- **WHEN** the only filled slots left are held ones and the clear key is pressed
  with nothing selected
- **THEN** no move and no UI update is produced and the held colors are kept

#### Scenario: The letter key clears the framed slot's marks in notes mode

- **WHEN** notes mode is on with the frame on the second answer slot, which has
  a color ruled out, the working row is full, and `d` is pressed
- **THEN** the color is put back in the second answer slot, no peg of the
  working row changes, and notes mode stays on

#### Scenario: The letter key rubs out a peg outside notes mode

- **WHEN** notes mode is off, the cursor is on the second slot of a full
  working row, and `d` is pressed
- **THEN** the second peg of the working row is rubbed out
