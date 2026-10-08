# engine-notes Specification

## Purpose
The note-taking cell shared by the games whose squares hold candidates: its
encoding, its vocabulary and keys, the Marks key that fills every note, and the
pencil-mode indicator.

## Requirements

### Requirement: The note-taking cell is one shared mechanic, not eleven copies

A game whose player **highlights a cell, types a value into it, and pencils
candidate marks in it** SHALL obtain that mechanic from the engine rather than
implementing it. The engine SHALL provide it as a *mechanic* module — the same
shape and the same test as the shared border-marking grid: what belongs in it is
what would otherwise have to change in every copy at once, and nothing that
merely looks alike.

The engine SHALL own **what a pointer press does to the highlight**: which
button selects and which deselects, how the fork's sticky pencil mode behaves,
and the fact that a pointer press hands the cursor's provenance back to the
mouse. The engine SHALL also own **what a symbol entry does to the highlight** —
whether a real entry puts it away, and what a keystroke that would write nothing
returns.

A game SHALL keep everything about its puzzle: its coordinate mapping, its
symbol vocabulary, the predicate that decides whether a keystroke is a no-op,
and its own `Move` type. The shared code SHALL report what the press did to the
highlight and SHALL NOT construct a move, because a shared move type would
couple save formats that have no reason to be identical.

The two questions a game answers for itself SHALL be exactly *may the player
type a value into this cell* and *may this cell carry pencil marks*. Those are
real differences about the puzzle — a given, a wall, a clue square and a filled
square are each some game's answer — and everything around them is not.

**Two rules replace disagreements that no game could explain in terms of its
puzzle**, and both SHALL hold for every game in the mechanic:

- A pointer press SHALL move the highlight to the pressed cell, whether or not
  the cell can take what the press offers; the cell decides only whether the
  highlight is *shown*. The position is observable while hidden, because the
  next arrow key resumes from it.
- The highlight SHALL be shown only where the mode it is in could write —
  against "may carry marks" in pencil mode and "may take a value" otherwise.

The sticky pencil toggle is the one arm exempt from the first rule: because it
is a mode switch rather than a selection, a press on a cell that could take no
mark SHALL leave the highlight where it is.

Neither the press nor the entry SHALL change pencil mode as a side effect of
putting the highlight away. A latched pencil mode stays latched until the player
unlatches it, which is what the preference's own wording promises.

The mechanic's `Ui` fields SHALL have one spelling and one polarity across the
whole collection, including in a game that carries the cursor-provenance flag
without the rest of the mechanic. Where a game does not offer one of the pencil
preferences, its behavior SHALL be derived from that absent declaration rather
than from a roster of exempt games.

**Every game in the mechanic SHALL offer both pencil preferences, defaulted the
same way**, so that one gesture does one thing across the family and the player
who wants the other still has it. The collection previously answered
"does a mouse-driven pencil mark keep the highlight" two ways — five games kept
it with no preference at all, six offered the preference and defaulted it off —
which a player met as the same gesture behaving oppositely in two games of the
same shape. Both halves SHALL be guarded over the derived population: the
default, and that the preference is offered at all.

Enrollment SHALL be **derived**: a game is in the mechanic iff its `Ui` carries
the fields, read off its own `newUi` output. The engine SHALL fail the build for
a game that carries them and does not route its press through the shared arm —
a check that must be a source scan, because what is being asserted is that a
hand-written twelfth copy does not exist.

#### Scenario: A press onto a cell that cannot take a value

- **WHEN** a player presses a given, while the highlight is showing elsewhere
- **THEN** the highlight is hidden **and** has moved to the pressed cell
- **AND** the next arrow key steps from the pressed cell

#### Scenario: The sticky toggle does not double as a selection key

- **WHEN** a player presses the secondary button on a filled cell, in a game
  offering sticky pencil mode
- **THEN** pencil mode toggles
- **AND** the highlight is exactly where it was, shown or hidden as it was

#### Scenario: A latched pencil mode survives a mouse-driven mark

- **WHEN** a player has latched pencil mode and enters a mark with the pointer
- **THEN** pencil mode is still latched

#### Scenario: The family answers a preference question once

- **WHEN** a player makes the same mouse-driven pencil mark in any two games of
  the mechanic, having changed no preferences
- **THEN** the highlight behaves the same way in both

#### Scenario: A game carrying the fields must use the mechanic

- **WHEN** a game's `newUi` returns the mechanic's `Ui` fields
- **AND** its sources never call the shared press arm
- **THEN** the build fails, naming that game

### Requirement: One note-taking vocabulary across games

A game holding the player's provisional per-cell candidate marks SHALL keep them
in a typed array named `pencil`, so that shared code and cross-game guards can
read a game's notes rather than being told per game where they live.

`pencil` SHALL be the word because the engine had already committed to it
everywhere else it speaks about notes — `Ui.pencilMode`, the `pencilSticky` and
`pencilKeepHighlight` preferences, `pencil-prefs.ts`, `pencil-indicator.ts`, and
the `pencilAll` / `pencilStrike` move vocabulary. The element type and the slot
arity SHALL stay the game's own: a candidate bitmask in one slot and a candidate
*cube* of `n` contiguous slots per cell are both conforming, and the array's
width is a fact about the puzzle.

Two things are **outside** this convention, and a guard SHALL NOT convict them:

- A field that is not a candidate set, even where it carries the retired word.
  Pearl's `marks` are the player's *no-line* marks on a cell's four edges, which
  is Loopy's `LINE_NO` rather than a set of candidates.
- A **solver's** own working candidate scratch. It is a different object with a
  different lifetime, and in a game with no note-taking at all it is the only
  candidate array there is; naming it `pencil` would claim a player-facing
  affordance the game does not offer.

The convention SHALL be enforced by scanning for the retired spellings **as a
typed-array field declaration** rather than by enumerating the games that have
notes: there is no runtime signal for "this array holds candidates", so the
population is not derivable and only the violation is. A bare name scan SHALL
NOT be used, because `marks` remains live and correct elsewhere — `HintMarks`,
the `pencilStrike` move's `marks`, a `Mark[]`.

#### Scenario: A game declares its candidate notes under a retired spelling

- **WHEN** a game's state declares `marks` or `pencils` as a typed array
- **THEN** the vocabulary guard fails, naming the file and line, and offers both
  remedies: rename it, or ledger it as not being a candidate set

#### Scenario: A solver's candidate scratch is left alone

- **WHEN** a game's solver module declares its own `marks` working array
- **THEN** the guard does not convict it, by a stated path rule rather than by an
  enumerated exemption for that game

#### Scenario: A ledgered exception that stops being true fails

- **WHEN** a file ledgered as not holding candidate notes no longer declares a
  retired spelling
- **THEN** the guard fails, so the ledger cannot outlive the finding it records

### Requirement: The Mark-all guard derives its roster from the capability

The cross-game Mark-all guard SHALL derive the games it exercises from
`Game.canMarkAll` and read each game's notes through the shared field name,
rather than carrying a hand-written row per game. The only per-game datum it may
hold is one a game genuinely answers differently — the slot arity — and that
ledger SHALL be asserted to name only games that offer the press.

An enrollment check comparing a hand-written roster with the flag it was copied
from SHALL NOT be kept once the roster is derived from that flag: it is then a
tautology. The question that survives is whether the flag matches what the game
*does*, which is asserted separately.

#### Scenario: A newly ported game shipping Mark-all is guarded immediately

- **WHEN** a game is registered that sets `canMarkAll`
- **THEN** it is exercised by every Mark-all property without any row being added

#### Scenario: A slot-arity entry for a game without the press fails

- **WHEN** the arity ledger names a game that does not offer Mark-all
- **THEN** the guard fails, naming it

### Requirement: The engine owns the pencil-mode indicator, not only its glyph
The engine SHALL provide the whole pencil-mode indicator — the background box,
the glyph, and the invalidation of that box — so that a game supplies only what
is its own: where the indicator sits and which palette indices it uses. A game
SHALL NOT write the paint-and-invalidate sequence itself.

The engine SHALL also own the repaint decision, taking the game's own
first-frame flag as an input, so that the indicator's cache is written once
rather than once per game.

#### Scenario: a game places the indicator and says nothing else about it

- **GIVEN** a game that offers a pencil mode and has chosen a box for its
  indicator
- **WHEN** it renders a frame
- **THEN** it names the box, the mode and its own three palette indices, and the
  engine paints, skips or erases accordingly
- **AND** the box is invalidated whenever it is painted, without the game
  arranging that

#### Scenario: the mode changes on a draw state that has already painted

- **GIVEN** a draw state that has painted at least one frame with the mode off
- **WHEN** the player turns pencil mode on and the game redraws
- **THEN** the glyph appears
- **AND** turning it off again erases the glyph on the following frame

### Requirement: The engine surface exposes an opt-in "fill all pencil marks" capability

The engine surface SHALL expose `canMarkAll` in its static attributes, true
iff the active game supports the "fill every empty cell with all candidate
pencil marks" action (upstream's `M`/`m` key). The `Game` interface SHALL
define an optional `readonly canMarkAll?: boolean` flag; the `Midend` SHALL
surface it as `canMarkAll: game.canMarkAll ?? false`.

The action itself reuses the existing keyboard input path rather than a new
engine method: a game that sets `canMarkAll` SHALL handle the `M`/`m` key in
`interpretMove` and return its mark-all move. The app shell SHALL render a
control in the same toolbar `wa-button-group` as Hint and Check & Save, shown
only when `canMarkAll` is true, which on activation injects the `M` key via the
surface's `processKey`.

The mark-all action SHALL be **adaptive** for a game whose cells have uniqueness
regions (one that supplies a per-game region provider): if any empty cell has **no
pencil notes at all** the action fills every note-less empty cell with all candidates
(as before); otherwise (every empty cell already carries notes) the action SHALL
instead **remove the obvious candidates** — every penciled value equal to a value
already *placed* in one of that cell's uniqueness regions (row/column, plus sub-block
and X-diagonal where the game has them; a Keen arithmetic cage is NOT a uniqueness
region). "Obvious" SHALL be judged only against placed values, never inferred from
another pencil mark.

The cleanup SHALL be emitted as the existing atomic `pencilStrike` move with its marks
computed at `interpretMove` time, so replay and undo are exact. When there is nothing to
fill **and** nothing to strike (an already-cleaned, fully-noted board) the action SHALL
produce **no move at all** (a true no-op that adds no undo entry), rather than an empty
`pencilStrike`. The cleanup SHALL be **idempotent** and a pure function of the placed
(non-pencil) grid: repeated presses converge to and remain at "every empty cell noted with
all candidates minus the values placed in its regions" — there SHALL be no fill⇄clean
toggle, and a cleaned board SHALL NOT silently re-fill. A clean SHALL NOT empty a cell of its last note (a cell whose every
candidate is region-eliminated occurs only on an already-mistaken board; leaving its last
note keeps idempotency unconditional). A game without a row/column uniqueness model (e.g.
Undead) SHALL keep the fill-only behavior.

#### Scenario: A pencil-mark game shows the control and fills candidates

- **WHEN** the active game reports `canMarkAll` true and the player activates
  the toolbar control
- **THEN** the `M` key is injected via `processKey`, the game fills every empty
  cell with all candidate pencil marks, and the board repaints

#### Scenario: A second press on a fully-noted board removes obvious candidates

- **WHEN** every empty cell is already fully noted and the player activates the
  mark-all control on a game with uniqueness regions
- **THEN** the action emits a `pencilStrike` that removes exactly the penciled
  values already placed in each cell's row/column (and block/diagonal where the game
  has them), leaving every still-possible candidate, and replaying the move
  reproduces the cleaned board

#### Scenario: Repeated presses are idempotent (no re-fill, no toggle)

- **WHEN** the player activates the mark-all control a third time, after a fill and a
  clean, with no board change in between
- **THEN** the cleaned board is unchanged — the action produces no move (a true no-op,
  no undo entry) and does not re-fill any cell — and the resulting notes equal `{1..n}`
  minus the placed values in each cell's regions

#### Scenario: An arithmetic cage is not a uniqueness region

- **WHEN** the game is Keen and a cell's penciled value also appears in its cage but
  not in its row or column
- **THEN** the cleanup does NOT remove that candidate (the value is still legal under
  the cage's arithmetic constraint)

#### Scenario: A non-uniqueness game keeps fill-only

- **WHEN** the game has no row/column uniqueness model (e.g. Undead)
- **THEN** the mark-all action only ever fills missing candidates; it performs no
  obvious-candidate cleanup

#### Scenario: A game without pencil marks shows no control

- **WHEN** the active game does not set `canMarkAll`
- **THEN** `canMarkAll` is false and the app shell renders no mark-all control

### Requirement: One way into note-taking across the collection

A game whose `Ui` carries `pencilMode` SHALL offer the collection's shared
pencil-mode toggle: the Marks key last on its on-screen keypad, sending the one
button code that the app's bare `P` shortcut also sends. A game SHALL NOT invent a
toggle of its own, and a game without the mode SHALL NOT offer the key.

Note-taking reached the player differently in each game: the cell games toggle the
mode with a secondary press, which a game whose secondary press already means
something cannot copy, leaving that game to invent a key nobody else has. The
shared key costs a game no button, is the only route a touch player can see, and
makes the mode something a player learns once. The population SHALL be derived from
what each game's `newUi` returns rather than from a roster, so a game joins by
having the mode. Gestures a game already has — a secondary press, a select key on a
showing cursor — MAY toggle the mode as well.

The mode's on-screen indicator SHALL likewise be the collection's: the shared pencil
glyph, at the position the engine computes, in every game that has the mode. A game
SHALL reserve the room for it rather than choose a different place for it. The figure
it reserves SHALL be the engine's stated reach — the glyph plus the gap that keeps it
off each edge, which a game reserving the glyph alone would be short of at both — and
a game whose board leaves that corner occupied SHALL grow a margin for it rather than
overlap the board or move the glyph, and SHALL grow that margin on every side, so the
board stays centered in its canvas rather than being pushed off-center by room taken
on one side only.

#### Scenario: The indicator is in the same place in every game

- **WHEN** pencil mode is on in any game that has it
- **THEN** the glyph is drawn in the position the engine computes, not one the game
  chose for itself

#### Scenario: A game with a pencil mode is reachable the same way as the rest

- **WHEN** any registered game whose `newUi` returns a `pencilMode` is asked for its
  keypad, and that key is pressed
- **THEN** the key is present, last, and the press toggles the mode

#### Scenario: A game without the mode does not offer the key

- **WHEN** a registered game has no `pencilMode`
- **THEN** its keypad does not offer the toggle, so no key on it does nothing

### Requirement: A note encoding states a cell's full candidate set

`NoteEncoding` SHALL be able to state, per cell, every note a blank cell could
carry — the set a fill-all puts there. It SHALL default to the values `1..values`,
which is the whole board's answer for a Latin game and is why the member went
unstated until a game needed a different one.

Every shared helper that fills notes SHALL read it rather than computing a
board-wide mask of its own. A game whose full set varies cell to cell SHALL
supply it, and the set it supplies SHALL agree with that game's own fill-all
move: a hint plan that populates more than the player's own control does goes on
to teach strikes on notes the player's board never had, which is precisely the
guarantee a candidate hint exists to keep.

#### Scenario: A per-cell candidate set reaches the plan's populate

- **WHEN** a candidate-elimination game whose blank cells differ in what they may
  hold (its board edges or its region sizes bound them) runs a hint plan
- **THEN** the plan's populate step fills each cell with exactly that cell's set,
  and the plan never offers a strike on a note outside it

#### Scenario: A game that says nothing is unaffected

- **WHEN** a game supplies no per-cell set
- **THEN** the populate fills every value of the note alphabet, as it did before

### Requirement: A move dialect writes the fill-all as well as reading it

`CandidateMoveAdapter` SHALL be able to build a game's fill-all move, defaulting
to the canonical `{ type: "pencilAll" }`. Every shared helper that emits a
fill-all — the lazy populate, the adaptive Mark-all press and the plan's default
setup — SHALL build it through the dialect rather than spelling the canonical
shape itself.

This closes an asymmetry rather than adding a capability: the same helpers
already *read* a fill-all through the dialect, so a game whose moves are keyed
differently could be understood by them but not spoken to by them. A game may
not rename its move discriminator to suit the engine, because the save format
replays the move log.

#### Scenario: A game whose moves are keyed differently is emitted correctly

- **WHEN** a candidate-elimination game whose `Move` union is keyed by something
  other than `type` runs a hint plan or answers the Mark-all press
- **THEN** the fill-all move emitted is the game's own, and its `executeMove`
  applies it

### Requirement: The engine gives every note-taking game its Marks key

The engine SHALL append the shared Marks key to the on-screen keypad of every
game that takes notes, at the keypad the app renders rather than at each game's
own key list. A game SHALL NOT list the key itself, so there is one source and
no two statements of the rule to drift apart.

Whether a game takes notes SHALL be **derived from what the game is** — a
`pencil` array on its board, or the collection's pencil-mode flag on its `Ui` —
and never from a boolean the game declares. A declaration can be forgotten by a
new game and left behind by a changed one with nothing noticing, which is how
two games came to carry notes with no key at all.

The derivation SHALL have **one definition**, read by both the engine that
offers the key and the guard that checks it, so the two cannot disagree about
who is in the population.

#### Scenario: A note-taking game gets the key without asking for it

- **WHEN** a game whose board carries notes is rendered, whatever its own key
  list contains and whether or not it has one
- **THEN** its rendered keypad ends with the Marks key, exactly once

#### Scenario: A game that takes no notes is not given one

- **WHEN** a game with neither notes nor the mode is rendered
- **THEN** its keypad is exactly its own, with no Marks key

### Requirement: An offered Marks key is never inert

A game offered the Marks key SHALL consume the press and toggle its pencil
mode. The engine can put a key on the panel; only the game can make it act, and
a key that is offered and does nothing is a worse failure than no key, because
it looks like the feature is there.

A game that genuinely cannot toggle a mode SHALL be recorded as an exception
against the derived population, one entry per game with its reason, and the
derivation SHALL assert that ledger is exactly right so a game that quietly
stops handling the key fails rather than joining the exceptions.

#### Scenario: A game that ignores the key fails

- **WHEN** a note-taking game does not consume the pencil-mode button
- **THEN** the cross-game guard names it, rather than passing over it

### Requirement: A sticky notes mode is visible on the board

A game with the collection's pencil-mode flag SHALL show the pencil-mode
indicator in the engine's corner, reserving the room for it — by a border wide
enough, or by a canvas grown to make one — because a sticky mode whose state
cannot be seen is a mode the player cannot trust.

#### Scenario: A game whose board has no margin grows one

- **WHEN** a game acquires the pencil mode and its own borders are too small to
  hold the glyph
- **THEN** its canvas is grown on every side so the board stays centered, its
  pointer mapping shifts by the same margin, and the indicator is drawn in the
  engine's box

### Requirement: The note-taking cell's highlight has one picture, drawn by the engine

The engine SHALL draw the note-taking cell's highlight, so that the selected
cell looks the same in every game in the mechanic: the whole cell washed while
typing enters a value, and a right triangle in the cell's top-left corner, its
legs half the cell's painted width and height, while typing enters a note. The
picture SHALL be the same whether the pointer or the keyboard placed the
highlight. The wash SHALL be the palette's "you are here" wash of the board's
background, at whatever palette index the game keeps it, for both the full cell
and the triangle.

The picture SHALL be part of the cell's background: it is drawn with the cell's
background and before any of the cell's content, so a clue, a mark or a
divider in the same corner stays on top of it. The game SHALL fold the
highlight's state into its per-cell repaint key, so the cell repaints when the
highlight arrives, changes mode or leaves.

A game SHALL keep what is genuinely about its puzzle: the rect it paints, its
background, a completion flash that hides the highlight, and a square the
picture cannot sit on. A Crossing wall has no background to wash and can be
reached only by the arrow keys, so the keyboard cursor there SHALL remain the
corner brackets.

Membership SHALL be derived as the mechanic's is — a game is in it iff its `Ui`
carries the fields — and a member that does not paint its cell background
through the engine SHALL fail the build, by a source scan, for the reason the
press arm's guard gives.

#### Scenario: Entry and notes, in every member

- **WHEN** a member's cell is selected, first for entry by the pointer and by
  the keyboard, then for notes
- **THEN** the entry frames wash the whole cell and draw no triangle, and the
  notes frame draws the corner triangle in the same wash and does not wash the
  cell

#### Scenario: The highlight leaves

- **WHEN** the highlight is put away
- **THEN** the cell repaints, with neither the wash nor the triangle

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

A game whose pointer press is the start of a drag — Rome's arrow and pencil
drags, Map's color and mark drags — SHALL join the note-taking cell through its
**tap**: a release that commits nothing SHALL resolve through the engine's press
arm, with the button the gesture used, while the drags themselves keep the
buttons they already had. So the right button needs no exemption where a game
already spends it on a drag: the drag and the tap are different gestures, and
only the tap is the mechanic's. No roster of games whose right button is
"spoken for" SHALL exist.

Such a game carries the mechanic's `Ui` fields and both pencil preferences, and
is held by every guard over the mechanic like any other member — including the
repeat tap and the sticky toggle, which it SHALL answer exactly as a game whose
press is its selection does. **Its press SHALL NOT move, hide or otherwise
change the selection**: a press that may become a drag commits to nothing, and
the selection changes when the gesture resolves. A press that changed the
selection would destroy both facts the release needs — whether the tap landed on
what was already selected, and where a highlight the sticky mode switch must not
move was showing.

The rules SHALL run at the release rather than at the press, because the press
cannot tell a tap from a drag: with sticky pencil mode on the right button's
press arm switches the mode, so running it at the press would flip the mode on
the way into every right-drag.

#### Scenario: The right tap and the right drag in one game

- **WHEN** in Rome or Map the right button is pressed and released on one
  square or region, and separately pressed and dragged to another
- **THEN** the tap selects for notes (or, sticky, latches notes mode), and the
  drag still lays the mark it laid before

#### Scenario: A repeat tap puts the highlight away

- **WHEN** a tap selects a square or region in a game whose press starts a drag,
  and the same tap is repeated
- **THEN** the highlight is put away, as it is in every game whose press is its
  selection

#### Scenario: A sticky right tap leaves the highlight where it was

- **WHEN** with sticky pencil mode on, a right tap in such a game lands on
  something that can take no mark, while the highlight is showing elsewhere
- **THEN** pencil mode switches and the highlight stays exactly where it was

### Requirement: The pencil-mode indicator is legible against the canvas and never covers the board

The pencil-mode indicator's glyph SHALL be sized by `pencilIndicatorBox` as half a tile less its insets, clamped between 20 and 48 CSS pixels, so a board of many small tiles still shows a glyph that reads against its canvas and a coarse board on a large screen does not grow it past the size of a toolbar icon. Every game that takes notes SHALL reserve at least `pencilIndicatorReach(tileSize)` at the canvas's top-right corner at every tile size, either with a margin never narrower than the reach or by growing its canvas with `pencilIndicatorCanvas`; a margin of exactly half a tile SHALL NOT be relied on, because the floor makes the glyph wider than that on a small tile. `pencil-indicator-placement.test.ts` asserts both halves.

#### Scenario: A fine-grained board shows a glyph that reads

- **WHEN** a note-taking game's board, at any of its presets, is fitted to a phone-sized or laptop-sized canvas slot
- **THEN** the indicator glyph is at least 3.5% of the canvas's shorter side

#### Scenario: Nothing of the board is under or over the glyph

- **WHEN** a note-taking game draws a frame with pencil mode off, at any tile size from 12 to 96 pixels
- **THEN** the only thing it paints inside the indicator's box is the background the indicator erases to, underneath the indicator

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
