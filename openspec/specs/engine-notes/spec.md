# engine-notes Specification

## Purpose
The note-taking cell shared by the games whose squares hold candidates: its
encoding, its vocabulary and keys, the Marks key that toggles pencil mode, the
Mark-all press that fills every note, the highlight's picture, and the
pencil-mode indicator.

## Requirements

### Requirement: The note-taking cell is one shared mechanic

A game whose player highlights a cell, types a value into it, and pencils
candidate marks in it SHALL obtain that mechanic from the engine rather than
implementing it. The engine SHALL provide it as a mechanic module, of the same
shape and by the same test as the shared border-marking grid: what belongs in it is what would
otherwise have to change in every copy at once, and nothing that merely looks
alike.

#### Scenario: Code that merely looks alike stays with the games

- **WHEN** several members' entry code is alike only in building each game's
  own move from that game's own grid and notes
- **THEN** it stays in the games, and the mechanic gains no helper for it

### Requirement: The engine owns what a press and an entry do to the highlight

The engine SHALL own what a pointer press does to the highlight: which button
selects and which deselects, how the sticky pencil mode behaves, and the fact
that a pointer press hands the cursor's provenance back to the mouse. The
engine SHALL also own what a symbol entry does to the highlight: whether a real
entry puts it away, and what a keystroke that would write nothing returns.

#### Scenario: A keystroke that would write what is already there

- **WHEN** the pointer placed the highlight and the player types the value the
  cell already holds
- **THEN** the highlight is put away and a repaint is reported, with no move
- **AND** had the keyboard placed the highlight, nothing is reported at all

### Requirement: A game in the mechanic keeps its puzzle and its own move

A game SHALL keep everything about its puzzle: its coordinate mapping, its
symbol vocabulary, the predicate that decides whether a keystroke is a no-op,
and its own `Move` type. The shared code SHALL report what the press did to the
highlight and SHALL NOT construct a move, because a shared move type would
couple the games' save formats. The two questions a game answers for itself
SHALL be exactly: may the player type a value into this cell, and may this cell
carry pencil marks.

#### Scenario: A given, a wall, a clue square and a filled square

- **WHEN** a press lands on a cell that is a given in one game, a wall in
  another, a clue square in a third or a filled square in a fourth
- **THEN** each game says so only through its answers to the two questions
- **AND** the engine reports where the highlight went, and the game builds any
  move itself

### Requirement: A pointer press moves the highlight to the pressed cell

In every game in the mechanic, a pointer press SHALL move the highlight to the
pressed cell, whether or not the cell can take what the press offers; the cell
decides only whether the highlight is shown. The position SHALL be kept while
the highlight is hidden, so the next arrow key resumes from it. The sticky
pencil toggle is the one arm exempt from this rule.

#### Scenario: A press onto a cell that cannot take a value

- **WHEN** a player presses a given, while the highlight is showing elsewhere
- **THEN** the highlight is hidden **and** has moved to the pressed cell
- **AND** the next arrow key steps from the pressed cell

### Requirement: The highlight is shown only where its mode could write

In every game in the mechanic, the highlight SHALL be shown only where the mode
it is in could write: against "may carry marks" in pencil mode and "may take a
value" otherwise.

#### Scenario: A left press in a latched pencil mode onto a filled cell

- **WHEN** pencil mode is latched and the player presses the primary button on
  a cell that may take a value and may carry no mark, while the highlight is
  elsewhere
- **THEN** the highlight moves there and is hidden
- **AND** the same press with pencil mode off shows it

### Requirement: The sticky pencil toggle is a mode switch, not a selection

With sticky pencil mode on, a secondary press SHALL switch pencil mode, and on
a cell that could take no mark it SHALL leave the highlight where it is,
because the toggle is a mode switch rather than a selection.

#### Scenario: The sticky toggle does not double as a selection key

- **WHEN** a player presses the secondary button on a filled cell, with sticky
  pencil mode on
- **THEN** pencil mode toggles
- **AND** the highlight is exactly where it was, shown or hidden as it was

### Requirement: Putting the highlight away never changes pencil mode

Neither the press nor the entry SHALL change pencil mode as a side effect of
putting the highlight away. A latched pencil mode SHALL stay latched until the
player unlatches it, which is what the preference's own wording promises.

#### Scenario: A latched pencil mode survives a mouse-driven mark

- **WHEN** a player has latched pencil mode and enters a mark with the pointer
- **THEN** pencil mode is still latched

### Requirement: The mechanic's Ui fields have one spelling and one polarity

The mechanic's `Ui` fields SHALL have one spelling and one polarity across the
whole collection, including in a game that carries the cursor-provenance flag
without the rest of the mechanic.

#### Scenario: A game outside the mechanic that tracks cursor provenance

- **WHEN** a game with no pencil mode records whether the keyboard placed its
  cursor
- **THEN** the field is `cursorFromKeyboard`, true when the keyboard did

### Requirement: Every member offers the keep-highlight preference, defaulted the same way

Every game in the mechanic SHALL offer the keep-highlight pencil preference,
defaulted the same way, so one gesture does one thing across the family and the
player who wants the other still has it. The
members that offer the sticky pencil preference SHALL default it the same way.

#### Scenario: The family answers a preference question once

- **WHEN** a player makes the same mouse-driven pencil mark in any two games of
  the mechanic, having changed no preferences
- **THEN** the highlight behaves the same way in both

### Requirement: An unoffered pencil preference is read from its absence

Where a game does not offer one of the pencil preferences, its behavior SHALL
be derived from that absent declaration rather than from a roster of exempt
games.

#### Scenario: A member with no sticky preference

- **WHEN** a member's `Ui` carries no sticky field and the player presses the
  secondary button on an open cell the highlight is not on
- **THEN** the press selects that cell for pencil marks, as it does in a member
  whose sticky preference is off

### Requirement: Enrollment in the mechanic is derived from the Ui

Enrollment SHALL be derived: a game is in the mechanic if and only if its `Ui`
carries the mechanic's fields, read off its own `newUi` output. The engine
SHALL fail the build for a game that carries them and does not route its press
through a shared arm. That check SHALL be a source scan, because what it
asserts is that no hand-written copy exists.

#### Scenario: A game carrying the fields must use the mechanic

- **WHEN** a game's `newUi` returns the mechanic's `Ui` fields
- **AND** its sources never call a shared press arm
- **THEN** the build fails, naming that game

### Requirement: A field that is not the player's candidate set is outside the vocabulary

Two things are outside the convention, and a guard SHALL NOT convict them. One
is a field that is not a candidate set, even where it carries a retired word:
Pearl's `marks` are the player's no-line marks on a cell's four edges. The
other is a solver's own working candidate scratch, because naming it `pencil`
would claim a player-facing affordance that a game with no note-taking does not
offer.

#### Scenario: A solver's candidate scratch is left alone

- **WHEN** a game's solver module declares its own `marks` working array
- **THEN** the guard does not convict it, by a stated path rule rather than by an
  enumerated exemption for that game

### Requirement: The engine owns the pencil-mode indicator, not only its glyph

The engine SHALL provide the whole pencil-mode indicator: the background box,
the glyph, and the invalidation of that box. A game SHALL supply only what is
its own: where the indicator sits, which is the box the engine computes for
it, and which palette indices it uses. A game SHALL NOT write the
paint-and-invalidate sequence itself.

#### Scenario: a game places the indicator and says nothing else about it

- **GIVEN** a game that offers a pencil mode
- **WHEN** it renders a frame
- **THEN** it names the engine's box, the mode and its own three palette
  indices, and the engine paints, skips or erases accordingly
- **AND** the box is invalidated whenever it is painted, without the game
  arranging that

### Requirement: The engine decides when the indicator repaints

The engine SHALL own the indicator's repaint decision, keeping what it last
showed in a cache on the game's draw state, so that the decision is written
once rather than once per game. A draw state that has never painted the
indicator SHALL paint it even when the mode has not changed, and the game SHALL
pass no first-frame flag for it.

#### Scenario: the mode changes on a draw state that has already painted

- **GIVEN** a draw state that has painted at least one frame with the mode off
- **WHEN** the player turns pencil mode on and the game redraws
- **THEN** the glyph appears
- **AND** turning it off again erases the glyph on the following frame

#### Scenario: a fresh draw state

- **WHEN** a new game or a resize gives a game a fresh draw state, with the mode
  as it was
- **THEN** the indicator's box is painted on the first frame

### Requirement: The Mark-all action is the M key

The action SHALL reuse the keyboard input path rather than a new engine method:
a game that sets `canMarkAll` SHALL handle the `M`/`m` key in `interpretMove`
and return its mark-all move, and a game SHALL NOT answer that key without
setting the flag. The app shell SHALL show the control only when `canMarkAll`
is true, and on activation it SHALL inject the `M` key via the surface's
`processKey`.

#### Scenario: A flag that disagrees with the game

- **WHEN** a game sets `canMarkAll` and does not answer the `M` key, or answers
  it without setting the flag
- **THEN** the cross-game guard fails, naming that game

#### Scenario: A pencil-mark game shows the control and fills candidates

- **WHEN** the active game reports `canMarkAll` true and the player activates
  the control
- **THEN** the `M` key is injected via `processKey`, the game fills every empty
  cell with all candidate pencil marks, and the board repaints

### Requirement: Mark-all is adaptive in a game with uniqueness regions

For a game whose cells have uniqueness regions (one that supplies a per-game
region provider), the action SHALL be adaptive. If any empty cell has no pencil
notes at all, it SHALL fill every note-less empty cell with all candidates.
Otherwise it SHALL remove the obvious candidates: every penciled value equal to
a value already placed in one of that cell's uniqueness regions: its row and
column, plus a sub-block, an X-diagonal and a cage that forbids repeats where
the game has them.

#### Scenario: A second press on a fully-noted board removes obvious candidates

- **WHEN** every empty cell is already fully noted and the player activates the
  mark-all control on a game with uniqueness regions
- **THEN** the action removes exactly the penciled values already placed in
  each cell's row and column (and block and diagonal where the game has them),
  leaving every still-possible candidate

### Requirement: An obvious candidate is judged only against placed values

"Obvious" SHALL be judged only against placed values, never inferred from
another pencil mark. A Keen arithmetic cage SHALL NOT count as a uniqueness
region.

#### Scenario: An arithmetic cage is not a uniqueness region

- **WHEN** the game is Keen and a cell's penciled value also appears in its cage but
  not in its row or column
- **THEN** the cleanup does NOT remove that candidate (the value is still legal under
  the cage's arithmetic constraint)

### Requirement: The Mark-all cleanup is one pencilStrike, or no move

In a game with uniqueness regions, the cleanup SHALL be emitted as the atomic
`pencilStrike` move with its marks computed at `interpretMove` time, so replay
and undo are exact. When there is nothing to fill and nothing to strike, the
action SHALL produce no move at all, a true no-op that adds no undo entry,
rather than an empty `pencilStrike`.

#### Scenario: Replaying the cleanup

- **WHEN** every empty cell is already noted, the player activates the
  mark-all control on a game with uniqueness regions, and the move is replayed
- **THEN** the action emitted one `pencilStrike`, and replaying it reproduces
  the cleaned board

### Requirement: Repeated Mark-all presses converge

The cleanup SHALL be idempotent and a pure function of the placed grid. On a
board whose notes the player has not narrowed, repeated presses SHALL converge
to and remain at every empty cell noted with all candidates minus the values
placed in its regions. There SHALL be no fill-then-clean toggle, and a cleaned
board SHALL NOT silently re-fill. A clean SHALL NOT empty a cell of its last
note, which keeps idempotency unconditional on a mistaken board.

#### Scenario: Repeated presses are idempotent (no re-fill, no toggle)

- **WHEN** the player activates the mark-all control a third time, after a fill and a
  clean, with no board change in between
- **THEN** the cleaned board is unchanged: the action produces no move (a true no-op,
  no undo entry) and does not re-fill any cell, and the resulting notes equal `{1..n}`
  minus the placed values in each cell's regions

### Requirement: A game with no obvious-candidate rule keeps a fill-only Mark-all

A game that supplies neither a region provider nor an obvious-candidate rule of
its own (Undead, for one) SHALL keep the fill-only behavior, and its press on a
board with no note-less empty cell SHALL produce no move.

#### Scenario: A non-uniqueness game keeps fill-only

- **WHEN** the game has no row/column uniqueness model and no cleanup of its
  own (e.g. Undead)
- **THEN** the mark-all action only ever fills missing candidates; it performs no
  obvious-candidate cleanup

### Requirement: One way into note-taking across the collection

A game that takes notes SHALL offer the collection's shared pencil-mode toggle:
the Marks key, last on its on-screen keypad, sending the one button code that
the app's bare `P` shortcut also sends. A game SHALL NOT invent a toggle of its
own, and a game that takes no notes SHALL NOT offer the key. That prohibition
SHALL NOT reach a gesture a game already has: a secondary press, or a select
key on a showing cursor, toggling the mode as well.

#### Scenario: A game with a pencil mode is reachable the same way as the rest

- **WHEN** any registered game that takes notes is asked for its keypad, and
  that key is pressed
- **THEN** the key is present, last, and the press toggles the mode

#### Scenario: A game without the mode does not offer the key

- **WHEN** a registered game takes no notes
- **THEN** its keypad does not offer the toggle, so no key on it does nothing

### Requirement: The engine gives every note-taking game its Marks key

The engine SHALL append the shared Marks key to the on-screen keypad of every
game that takes notes, at the keypad the app renders rather than at each game's
own key list. A game SHALL NOT list the key itself, so there is one source and
no two statements of the rule to drift apart.

#### Scenario: A note-taking game gets the key without asking for it

- **WHEN** a game whose board carries notes is rendered, whatever its own key
  list contains and whether or not it has one
- **THEN** its rendered keypad ends with the Marks key, exactly once

#### Scenario: A game that takes no notes is not given one

- **WHEN** a game with neither notes nor the mode is rendered
- **THEN** its keypad is exactly its own, with no Marks key

### Requirement: Whether a game takes notes is derived from what the game is

Whether a game takes notes SHALL be derived from what the game is, a `pencil`
array on its board or the collection's pencil-mode flag on its `Ui`, and never
from a boolean the game declares, which a new game can forget and a changed one
can leave behind with nothing noticing. The derivation SHALL have one
definition, read by both the engine that offers the key and the guard that
checks it, so the two cannot disagree about who is in the population.

#### Scenario: A game whose notes are not a pencil array

- **WHEN** a game's notes are edge or line states with no `pencil` array, and
  its `Ui` carries the pencil-mode flag
- **THEN** it takes notes, by the same definition for the engine and the guard

### Requirement: An offered Marks key is never inert

A game offered the Marks key SHALL consume the press and toggle its pencil
mode, because a key that is offered and does nothing looks like the feature is
there. A game that genuinely cannot toggle a mode SHALL be recorded as an
exception against the derived population, one entry per game with its reason,
and the derivation SHALL assert that ledger is exactly right, so a game that
quietly stops handling the key fails rather than joining the exceptions.

#### Scenario: A game that ignores the key fails

- **WHEN** a note-taking game does not consume the pencil-mode button
- **THEN** the cross-game guard names it, rather than passing over it

### Requirement: A sticky notes mode is visible on the board

Every game that takes notes SHALL show the pencil-mode indicator in the
engine's corner, reserving the room for it, by a border wide enough or by a
canvas grown to make one, because a sticky mode whose state cannot be seen is a
mode the player cannot trust. The population SHALL be the one the Marks key is
offered by, so a game given the key is held to showing what the key did.

#### Scenario: A latched mode can be read off the board

- **WHEN** a player latches pencil mode in any game that takes notes, and no
  cell is highlighted
- **THEN** the glyph in the engine's corner shows that the mode is on

### Requirement: A game reserves the indicator's reach at every tile size

Every game that takes notes SHALL reserve at least `pencilIndicatorReach(tileSize)`
at the canvas's top-right corner at every tile size: the glyph plus the gap that
keeps it off each edge, which a game reserving the glyph alone would be short of
at both. It SHALL do so with a margin never narrower than the reach or by
growing its canvas with `pencilIndicatorCanvas`. A margin of exactly half a tile
SHALL NOT be relied on, because the glyph's floor makes it wider than that on a
small tile.

#### Scenario: Nothing of the board is under or over the glyph

- **WHEN** a note-taking game draws a frame with pencil mode off, at any tile size from 12 to 96 pixels
- **THEN** the only thing it paints inside the indicator's box is the background the indicator erases to, underneath the indicator

### Requirement: A board that occupies the indicator's corner grows a margin on every side

A game whose board leaves the indicator's corner occupied SHALL grow a margin
for it rather than overlap the board or move the glyph. It SHALL grow that
margin on every side, so the board stays centered in its canvas rather than
being pushed off-center by room taken on one side only.

#### Scenario: A game whose board has no margin grows one

- **WHEN** a game acquires the pencil mode and its own borders are too small to
  hold the glyph
- **THEN** its canvas is grown on every side so the board stays centered, its
  pointer mapping shifts by the same margin, and the indicator is drawn in the
  engine's box

### Requirement: A note encoding states a cell's full candidate set

`NoteEncoding` SHALL be able to state, per cell, every note a blank cell could
carry, which is the set a fill-all puts there. It SHALL default to the values
`1..values`, the whole board's answer for a Latin game. Every shared helper that
fills notes SHALL read it rather than computing a board-wide mask of its own.

#### Scenario: A game that says nothing is unaffected

- **WHEN** a game supplies no per-cell set
- **THEN** the populate fills every value of the note alphabet

### Requirement: A per-cell candidate set agrees with the game's own fill-all

A game whose full candidate set varies cell to cell SHALL supply it to
`NoteEncoding`, and the set it supplies SHALL agree with that game's own
fill-all move. A hint plan that populates more than the player's own control
does goes on to teach strikes on notes the player's board never had.

#### Scenario: A per-cell candidate set reaches the plan's populate

- **WHEN** a candidate-elimination game whose blank cells differ in what they may
  hold (its board edges or its region sizes bound them) runs a hint plan
- **THEN** the plan's populate step fills each cell with exactly that cell's set,
  and the plan never offers a strike on a note outside it

### Requirement: A move dialect writes the fill-all as well as reading it

`CandidateMoveAdapter` SHALL be able to build a game's fill-all move, defaulting
to the canonical `{ type: "pencilAll" }`. Every shared helper that emits a
fill-all, which are the lazy populate, the adaptive Mark-all press and the
plan's default setup, SHALL build it through the dialect rather than spelling
the canonical shape itself. A game SHALL NOT rename its move discriminator to
suit the engine, because the save format replays the move log.

#### Scenario: A game whose moves are keyed differently is emitted correctly

- **WHEN** a candidate-elimination game whose `Move` union is keyed by something
  other than `type` runs a hint plan or answers the Mark-all press
- **THEN** the fill-all move emitted is the game's own, and its `executeMove`
  applies it

### Requirement: The note-taking cell's highlight has one picture, drawn by the engine

The engine SHALL draw the note-taking cell's highlight, so that the selected
cell looks the same in every game in the mechanic: the whole cell washed while
typing enters a value, and a right triangle in the cell's top-left corner, its
legs half the cell's painted width and height, while typing enters a note. The
picture SHALL be the same whether the pointer or the keyboard placed the
highlight.

#### Scenario: Entry and notes, in every member

- **WHEN** a member's cell is selected, first for entry by the pointer and by
  the keyboard, then for notes
- **THEN** the entry frames wash the whole cell and draw no triangle, and the
  notes frame draws the corner triangle in the same wash and does not wash the
  cell

### Requirement: The highlight's wash is the palette's "you are here" wash

The highlight's wash SHALL be the palette's "you are here" wash of the board's
background, at whatever palette index the game keeps it, for both the full cell
and the triangle.

#### Scenario: Two members that keep the wash at different indices

- **WHEN** two members keep the wash at different palette indices and are drawn
  on the same background
- **THEN** both highlights are the same color

### Requirement: The highlight is part of the cell's background

The picture SHALL be part of the cell's background: it is drawn with the cell's
background and before any of the cell's content, so a clue, a mark or a divider
in the same corner stays on top of it. The game SHALL fold the highlight's
state into its per-cell repaint key, so the cell repaints when the highlight
arrives, changes mode or leaves.

#### Scenario: The highlight leaves

- **WHEN** the highlight is put away
- **THEN** the cell repaints, with neither the wash nor the triangle

### Requirement: A game keeps what is its puzzle's in the highlight's picture

A game SHALL keep what is genuinely about its puzzle: the rect it paints, its
background, a completion flash that hides the highlight, and a square the
picture cannot sit on. A Crossing wall has no background to wash and can be
reached only by the arrow keys, so the keyboard cursor there SHALL remain the
corner brackets.

#### Scenario: The keyboard cursor on a Crossing wall

- **WHEN** the arrow keys take the cursor onto a wall in Crossing
- **THEN** the wall shows corner brackets, with neither the wash nor the triangle

### Requirement: Membership in the highlight's picture is derived as the mechanic's is

Membership SHALL be derived as the mechanic's is: a game is in it if and only
if its `Ui` carries the mechanic's fields. A member that does not paint its cell
background through the engine SHALL fail the build, by a source scan, because
what is asserted is that no hand-drawn copy exists. A member whose selection is
not a cell SHALL be excused only by a ledger, one entry per member, which the
guard holds exactly right.

#### Scenario: A member whose selection is not a cell

- **WHEN** a member's selection is a region rather than a cell (Map)
- **THEN** it draws the pair's meaning in the region's shape, is excused from
  the cell picture by a one-entry-per-member ledger the guard holds exactly
  right, and tests its own picture beside its renderer

#### Scenario: A game that kept its own copy

- **WHEN** a game carries the mechanic's `Ui` fields and never calls the
  engine's cell-background painter
- **THEN** the build fails and names the game

### Requirement: A game whose press starts a drag joins the note-taking cell through its tap

A game whose pointer press is the start of a drag (Rome's arrow and pencil
drags, Map's color and mark drags) SHALL join the note-taking cell through its
tap: a release that commits nothing SHALL resolve through the engine's press
arm, with the button the gesture used, while the drags keep the buttons they
already had. Only the tap is the mechanic's, so no roster of games whose right
button is "spoken for" SHALL exist.

#### Scenario: The right tap and the right drag in one game

- **WHEN** in Rome or Map the right button is pressed and released on one
  square or region, and separately pressed and dragged to another
- **THEN** the tap selects for notes (or, sticky, latches notes mode), and the
  drag still lays the mark it laid before

### Requirement: A game that joins through its tap is a full member of the mechanic

A game whose press starts a drag SHALL carry the mechanic's `Ui` fields and both
pencil preferences, and SHALL be held by every guard over the mechanic like any
other member. That includes the repeat tap and the sticky toggle, which it SHALL
answer exactly as a game whose press is its selection does.

#### Scenario: A repeat tap puts the highlight away

- **WHEN** a tap selects a square or region in a game whose press starts a drag,
  and the same tap is repeated
- **THEN** the highlight is put away, as it is in every game whose press is its
  selection

#### Scenario: A sticky right tap leaves the highlight where it was

- **WHEN** with sticky pencil mode on, a right tap in such a game lands on
  something that can take no mark, while the highlight is showing elsewhere
- **THEN** pencil mode switches and the highlight stays exactly where it was

### Requirement: A press that may become a drag changes nothing in the selection

In a game whose press starts a drag, the press SHALL NOT move, hide or otherwise
change the selection: the selection changes when the gesture resolves. The
mechanic's rules SHALL run at the release rather than at the press, because the
press cannot tell a tap from a drag, and with sticky pencil mode on a right
press that ran them would switch the mode on the way into every right-drag.

#### Scenario: A right drag with sticky pencil mode on

- **WHEN** with sticky pencil mode on, the right button is pressed in such a
  game and dragged to lay a mark
- **THEN** pencil mode is as it was, and the press itself left the highlight
  showing where it was

### Requirement: The pencil-mode indicator is legible against the canvas

The pencil-mode indicator's glyph SHALL be sized by `pencilIndicatorBox` as half
a tile less its insets, clamped between 20 and 48 CSS pixels, so a board of many
small tiles still shows a glyph that reads against its canvas and a coarse board
on a large screen does not grow it past the size of a toolbar icon.

#### Scenario: A fine-grained board shows a glyph that reads

- **WHEN** a note-taking game's board, at any of its presets, is fitted to a phone-sized or laptop-sized canvas slot
- **THEN** the indicator glyph is at least 3.5% of the canvas's shorter side

### Requirement: The engine owns the candidate encoding

A candidate value `n` SHALL be bit `n` of a 32-bit mask, through the engine's
`valueBit` and `valuesOneTo` (`engine/candidate-bits.ts`), which SHALL refuse a
value the mask cannot hold rather than wrap. A game's largest value SHALL be at
most `MAX_CANDIDATE_VALUE`.

An `OverlaySidecar` SHALL keep a step's struck marks in a lane of their own, in
the game's encoding, never in the word that carries the target and evidence
roles, and its stale test SHALL cover that lane.

#### Scenario: The highest values of a 31-value game

- **WHEN** a hint strikes candidate 30 or 31 from a cell
- **THEN** the struck lane holds that value's bit, the role word is untouched,
  and swapping a struck 30 for a target on the same cell makes the cell stale

#### Scenario: A value past the mask

- **WHEN** code asks for the bit of value 32
- **THEN** it throws a `RangeError` instead of returning another value's bit

### Requirement: One note-taking vocabulary and one layout across games

A game holding the player's provisional candidate marks SHALL keep them in a
typed array named `pencil`, the word the engine uses everywhere else it speaks
about notes, so that shared code and cross-game guards read a game's notes
without being told per game where they live. Each element SHALL be one
candidate bitmask: of a cell, or of a region where regions are what the player
fills. The element type SHALL stay the game's own.

#### Scenario: A game whose notes belong to regions

- **WHEN** a game's player marks candidates on regions and not on cells, as in
  Map
- **THEN** its `pencil` array holds one bitmask per region, and it conforms as
  a game keeping one bitmask per cell does
