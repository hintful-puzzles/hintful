# engine-input Specification

## Purpose
Pointer, keyboard and touch input: the shared button and key vocabulary, the
gesture layer, the on-screen key panel, the keyboard cursor, and the
declarative targets-and-verbs form of a click game.

## Requirements

### Requirement: The engine provides shared pointer button constants

The engine SHALL provide button code constants (`LEFT_BUTTON`, `RIGHT_BUTTON`, `RIGHT_DRAG`, `RIGHT_RELEASE`, cursor keys, etc.) in `src/engine/pointer.ts`, matching the values in the engine's own `types.ts` `PuzzleButton`. These SHALL be plain `const` values (not an enum) so advisory diff scripts can import them under Node's strip-only TS loader.

#### Scenario: A game imports shared button constants

- **WHEN** a game's `interpretMove` function receives a button number
- **THEN** it compares against the shared constants from `pointer.ts` instead of locally-declared values
- **AND** no game file contains duplicate button code declarations

### Requirement: The engine provides a shared cursor button-to-delta helper

The engine SHALL provide `cursorDelta(button: number): { dx: number; dy: number }
| null` in `src/engine/pointer.ts`, returning the unit grid delta for the
four cursor-direction buttons (`CURSOR_UP` → `{0,−1}`, `CURSOR_DOWN` → `{0,+1}`,
`CURSOR_LEFT` → `{−1,0}`, `CURSOR_RIGHT` → `{+1,0}`) and `null` for any other
button, plus an `isCursorMove(button: number): boolean` predicate (true iff the
button is one of the four cursor-direction keys).

For the common case of an axis-aligned bounded grid, the engine SHALL also
provide `gridCursorMove(button: number, x: number, y: number, w: number, h:
number, wrap?: boolean): { x: number; y: number } | null` in the same module,
returning the new cursor coordinates after applying the button's delta — clamped
to `[0, w) × [0, h)` when `wrap` is false (the default) or wrapped toroidally when
`wrap` is true — or `null` when the button is not a cursor key or the move is a
no-op against a clamped edge. `gridCursorMove` SHALL be **position-only**: it
returns coordinates and never owns or mutates a game's `ui`.

`gridCursorMove` is the primitive beneath the shared cursor, not the interface a
game reaches for. A game holding an ordinary bounded-grid cursor SHALL drive it
through `moveCursor` (see "One keyboard-cursor vocabulary across games"), which
owns the position, the reveal and the changed-tracking together. `cursorDelta`
and `gridCursorMove` remain for a **traversal** that is not a bounded clamp —
obstacle-skipping, lock modes, half-cell coordinates, non-positional rolling
cursors — and for whatever a game does *while* the cursor moves.

#### Scenario: A cursor key yields its unit delta

- **WHEN** a game calls `cursorDelta(CURSOR_LEFT)`
- **THEN** it receives `{ dx: -1, dy: 0 }`

#### Scenario: A non-cursor button yields null

- **WHEN** a game calls `cursorDelta(LEFT_BUTTON)`
- **THEN** it receives `null`, and the game falls through to its other input
  handling

#### Scenario: A bounded-grid cursor move clamps at the edge

- **WHEN** a game calls `gridCursorMove(CURSOR_LEFT, 0, 3, w, h)` with the cursor
  already at the left edge and `wrap` defaulting to false
- **THEN** it receives `null` (no-op at the clamped edge), and the game makes no
  cursor change
- **AND** the same call one column in (`x = 1`) returns `{ x: 0, y: 3 }`

#### Scenario: A toroidal cursor move wraps

- **WHEN** a toroidal game calls `gridCursorMove(CURSOR_LEFT, 0, 3, w, h, true)`
- **THEN** it receives `{ x: w - 1, y: 3 }`

#### Scenario: A game that reinvented the clamp adopts the helper

- **WHEN** the engine ships `gridCursorMove`
- **THEN** the former local clamp helpers (`fifteen`'s `moveCursorClamped`,
  `sixteen`'s `moveCursor`) are deleted in favor of it
- **AND** no positional-cursor game carries its own bounded/toroidal clamp copy

### Requirement: The engine provides shared keyboard modifier-mask constants

The engine SHALL provide the keyboard modifier-mask constants `MOD_MASK`
(`0x7800`), `MOD_NUM_KEYPAD` (`0x4000`), `MOD_SHFT` (`0x2000`), and `MOD_CTRL`
(`0x1000`) in `src/engine/pointer.ts`, matching upstream's `puzzles.h`
modifier bits, plus a `stripModifiers(button: number): number` helper returning
`button & ~MOD_MASK`. These SHALL be plain `const` values (not an enum) for the
same strip-only-TS-loader reason as the button constants. Games that mask
modifier bits off an incoming button SHALL import these instead of redeclaring
the magic numbers locally.

#### Scenario: A game strips modifier bits from a button

- **WHEN** a game's `interpretMove` receives a button with modifier bits set and
  calls `stripModifiers(button)`
- **THEN** the result has the `MOD_MASK` bits cleared and the base button code
  and any unrelated high bits preserved
- **AND** no game file contains a local `MOD_MASK = 0x7800` (or sibling
  `MOD_NUM_KEYPAD`/`MOD_SHFT`/`MOD_CTRL`) declaration

### Requirement: Games may expose on-screen key labels

The engine SHALL support an optional `Game.requestKeys(params)` hook returning an
ordered list of `KeyLabel` (`{ button, label }`) — the on-screen virtual-keypad
buttons for that game, faithful to upstream `game_request_keys`. The hook SHALL
depend only on `params` (not on `state` or `ui`), matching upstream and the fact
that the app's key panel reloads its labels only when params change. Each entry's `button` is the
key code processed exactly as the equivalent physical keypress, and `label` is the
resolved display text (the digit/letter character, or `"Clear"` for the clear key,
so the app's icon mapping renders it); the engine does not re-derive labels from
button codes.

The `EngineCore` surface SHALL expose `requestKeys(): KeyLabel[]`, and the midend
SHALL return `game.requestKeys(params)` for the current params when the hook is
present and an empty list when it is absent. The worker adapter SHALL forward this
result rather than returning a fixed empty list, so the app shows the keypad the
game declares. A game without the hook SHALL show no keypad
(an empty list), unchanged from prior behavior.

#### Scenario: A keypad game's labels are served on the TS path

- **WHEN** the app requests the key labels for a TS-served game that implements
  `requestKeys`
- **THEN** the midend returns that game's `KeyLabel[]` for the current params
- **AND** the app renders one on-screen button per label, each entering the key
  when pressed

#### Scenario: A game without the hook shows no keypad

- **WHEN** the app requests the key labels for a TS-served game that does not
  implement `requestKeys`
- **THEN** the midend returns an empty list and no keypad is shown

### Requirement: Touch equivalence is guarded for every registered game

The test suite SHALL assert, for **every** game in the runtime registry, that a
touch press does what the same mouse press does, across a sweep of the whole
board — so that a newly ported game is covered on the day it is registered rather
than when somebody remembers to check it on a phone.

The sweep SHALL be dense enough to land on the game's live targets, and SHALL
fail rather than pass vacuously when no probe reaches one (an early cut of this
guard missed Untangle entirely, because its vertices sit at arbitrary points that
a coarse grid never hit).

#### Scenario: A new port that ignores touch fails the suite

- **WHEN** a game is registered whose `interpretMove` compares an unstripped
  button against `LEFT_BUTTON`, and the midend's stripping is removed
- **THEN** the guard test fails for that game

### Requirement: A game with no secondary meaning is not given a synthetic one

A game in which the secondary button means **nothing observable** SHALL declare
`Game.ignoresSecondaryButton`, and the interactive view SHALL then skip
`detectSecondaryButton` entirely for that game — neither long press nor
two-finger tap promoting the press, and the press delivered immediately rather
than held for the detection window.

Without it the promotion is pure loss: the frontend converts a held press to
`RIGHT_BUTTON`, the game tests no such button, and the whole gesture disappears —
only on touch, and only for the player who paused. "Press, pause to aim, then
drag" *is* a press that stays put, so a press-and-drag game loses its one gesture
exactly when the player stops to think. Seven games were in that state when the
collection was swept (Cube, Fifteen, Filling, Flip, Flood, Pegs, Sokoban), Pegs
and Filling being the two whose whole interaction is a drag.

The guard SHALL assert the **biconditional** — a game declares the flag if and
only if the secondary button means nothing observable on a real board — so the
declaration can neither be forgotten by a new game nor left behind by a game that
grows a secondary meaning.

**What counts as a meaning SHALL be derived, never declared.** Reading all 57
games found exactly three legitimate answers, and the guard SHALL credit all
three because they are one question rather than three cases — *did the secondary
gesture change anything the player can perceive, now or next?*

1. **It commits a move** (34 games).
2. **It changes what the next input does** (16) — the pencil-mode press, which
   nine games reach through the shared `pressNoteTakingCell` without naming
   `RIGHT_BUTTON` at all; plus Guess's peg hold, Samegame's selection clear,
   Rome's pencil drag, Signpost's backward grab and Ascent's candidate cycle.
   None of these commits anything by itself.
3. **It folds onto the primary button** (Slide's `asPrimary`) — the documented
   alternative to the flag.

Consumption alone SHALL NOT satisfy the biconditional. It was the previous
question and it was satisfied by a bare repaint: 16 of 57 games consumed
`RIGHT_BUTTON` without ever committing a move, so for those the guard held
whatever the game did. Replacing a game's secondary meaning with a bare
`UI_UPDATE` is green under "was it consumed" and red under this requirement.

The observation SHALL be **the painted frame together with the save**, not the
save alone. A game may keep a secondary meaning in UI state it never serializes —
Guess's peg holds — and a save-only probe reports such a game as meaningless,
demanding the flag from a game that has a meaning and turning off the promotion
it handles.

This SHALL NOT be read as reinstating "did the board change" as a conviction.
That question was rejected because its *negation* is unsound — an eraser on a
fresh board correctly changes nothing. Here a change is only ever a **sufficient**
sign that the button means something, and a game is reported meaningless only
when it is invisible under every observation, so the derivation cannot convict an
innocent game.

**A known bound, measured rather than merely admitted**: a secondary press whose
only effect is incidental — shared with the primary press, such as hiding the
keyboard cursor on any mouse-down — is credited on that alone. Removing both of
Ascent's real secondary arms leaves the guard green for exactly this reason, so
the gap is reachable rather than hypothetical.

What is *not* true is that any shipped game rests on it. Measured across the
collection: of the 50 games credited with a secondary meaning, **38 change the
save** and the remaining **12 change the painted frame**, and all twelve were
read — nine draw pencil marks (`pressNoteTakingCell`), plus Guess's peg holds,
Samegame's selection highlight and Signpost's drag highlight. Every one is a
meaning a player can see; none is an incidental repaint. The guard's priming
SHALL therefore include a two-press and a drag setup, because a one-press prime
left Ascent credited only by the incidental effect — the right verdict on
evidence that would not have survived the game changing.

Closing the gap entirely needs a "does the secondary do something the primary
does not" comparison, and Slide's deliberate fold — where the secondary does
*exactly* what the primary does — would fail it. The bound therefore stands
until a derivation exists that does not convict Slide, and it is documented so
the next reader does not rediscover it as a surprise.

This flag is **not** upstream's `REQUIRE_RBUTTON` inverted, and SHALL NOT be
derived from it. Those two describe different sets, and the difference is the
largest group of all: a game may *use* the secondary button without *needing* it
(Tracks), and suppressing its promotion would break a gesture it handles
correctly.

#### Scenario: A held touch press still plays a drag game

- **WHEN** a touch press is held past the long-press window and then dragged, in
  a game that declares `ignoresSecondaryButton`
- **THEN** the gesture is delivered as a left-button press, drag and release, and
  completes as it would have without the pause

#### Scenario: The declaration cannot drift from the behavior

- **WHEN** a registered game's secondary button means something observable
- **THEN** the guard fails if that game declares `ignoresSecondaryButton`
- **AND** when it means nothing observable, the guard fails if it does not

#### Scenario: A repaint is not a secondary meaning

- **WHEN** a game answers `RIGHT_BUTTON` but the gesture leaves the same frame
  and the same save, and changes nothing about what the next input does
- **THEN** the guard demands `ignoresSecondaryButton`, even though the button was
  consumed

#### Scenario: A meaning reached through a shared helper counts

- **WHEN** a game's secondary meaning is supplied by `pressNoteTakingCell` or
  another shared helper, with no `RIGHT_BUTTON` branch of its own
- **THEN** the guard credits it, because the derivation reads behavior rather
  than source

### Requirement: The gesture layer's own decisions are tested

`detectSecondaryButton` SHALL have direct tests, separate from the per-game
sweeps. A per-game guard that hands a game a synthetic `RIGHT_BUTTON` proves the
game copes with the decision; it cannot prove the decision was the right one, and
those are two different guarantees.

The tests SHALL cover the numbers the gesture arbitrates, because each is a
behavior rather than a constant: the hold window, the drag threshold and a
wobble inside it, a pointer type that is not touch, both affordances disabled,
the two-finger tap from either finger's release, and the second finger's **timer
reset** — which is what makes the documented worst case twice the hold time.

They SHALL also cover `unhandledEvent`, since the view replays it: without that,
a tap faster than the detection round trip loses its release entirely, and any
state the puzzle shows only while a press is held stays on screen.

#### Scenario: A stationary finger past the hold window is secondary

- **WHEN** a touch press stays within the drag threshold for longer than the hold
  time
- **THEN** the detector reports the secondary button

#### Scenario: A finger that moves is not

- **WHEN** a touch press moves beyond the drag threshold before the hold time
- **THEN** the detector reports the primary button, and hands back the move event
  it consumed so the view can replay it

### Requirement: Keyboard reachability is a recorded decision for every game

Every registered game SHALL either handle keyboard cursor input, or appear on an
explicit exemption list whose entry states **why** — and the exemption's reason
SHALL be in that game's spec, not only in a comment or a test fixture.

The point is not that every game must have a cursor. It is that "this game has no
keyboard" must be a decision somebody made and wrote down, rather than a
condition nobody noticed.

Handling a cursor key is necessary and not sufficient: the guard SHALL also
assert that some **keyboard-only sequence commits a move**, because a cursor that
goes everywhere and does nothing is not a keyboard. That probe SHALL allow
multi-step sequences, since several games pick a piece up with one select and put
it down with a second (Pegs, Map, Rectangles, Samegame, Signpost, Slide,
Untangle), and a single-keypress probe scores every one of them deaf.

The check SHALL derive a game's coverage through the registry and the shared
input helpers, not by reading its `index.ts` alone: a game declaring
`targetVerbs` hands its arrows and select keys to `interpretTargetVerbs`, and
Palisade and Separate reach it through `border-grid.ts`'s `borderGridVerbs`,
with no direct `CURSOR_*` reference of their own. A check that reads one file
convicts games that are fine, which is the failure mode where a guard is
turned off rather than fixed.

#### Scenario: A game with no keyboard handling must be on the list

- **WHEN** a registered game handles no cursor input
- **THEN** the guard fails unless that game is on the exemption list
- **AND** the exemption names the reason, which is also stated in the game's spec

#### Scenario: Cursor handling through a shared helper counts

- **WHEN** a game's cursor input is supplied by `interpretTargetVerbs` or
  another shared helper rather than by its own `CURSOR_*` branches
- **THEN** the guard recognizes it as covered

#### Scenario: A cursor that cannot act is not a keyboard

- **WHEN** a game moves a cursor in response to the arrow keys but no
  keyboard-only sequence changes the board
- **THEN** the guard fails

### Requirement: Every on-screen key a game offers reaches that game

For every game declaring `requestKeys`, the suite SHALL assert that each returned
button is one the game's `interpretMove` actually consumes somewhere on a real
board. On touch the key panel is the only character-entry route there is, so a
panel key that reaches nothing is an input a touch player cannot make at all.

This is the **reverse direction** of the emittable-key scan, and neither
substitutes for the other: that scan asks whether a code a game *tests* can be
sent, and this asks whether a code the frontend *sends* is received.

The probe SHALL prime the board before convicting a key — a "Clear" key on an
already-empty cell is a legitimate no-op, and scoring that as dead wrongly
convicts every keypad game. A key that is genuinely unreachable SHALL be recorded
in the guard as a finding under management, naming the change that owns it,
rather than silently excluded.

The count of games with a panel SHALL carry a floor that only moves up, because a
game that *loses* its `requestKeys` hook makes every one of its on-screen keys
unreachable at once — the largest version of this defect, and the one a per-key
sweep structurally cannot see.

#### Scenario: A panel key the game ignores fails the suite

- **WHEN** a game's `requestKeys` returns a button its `interpretMove` never
  consumes
- **THEN** the guard fails, naming the key and the game

#### Scenario: A clear key on an empty board is not a finding

- **WHEN** the probe tests a key whose only effect is to erase
- **THEN** it first writes something for that key to erase, rather than reporting
  the key as unreachable

### Requirement: The on-screen key panel is a second key emitter

A guard reasoning about which button codes this frontend can deliver SHALL
account for **both** emitters: `puzzleKeyMap` in the interactive view, and the
buttons a game's own `requestKeys` puts on the on-screen panel, which
`puzzle-keys` sends straight to `Puzzle.processKey`.

The set SHALL be computed **per game**, not as a union over the collection. The
clear key's button is `8` — upstream's `'\b'`, which `puzzleKeyMap` never sends —
so it is reachable in a game that offers it on its keypad and unreachable in a
game with no keypad at all. A union would excuse exactly the dead bindings the
scan exists to find.

A scan for a button compared against an unsendable code SHALL cover
`switch (button) { case <code>: }` as well as `button === <code>`. A `case` label
is neither a comparison nor a declaration, and one survived the collection-wide
erase-key sweep in that form: Unruly's gate admitted `DELETE` through
`isEraseKey` and its switch matched only `8`, so the key read as wired at every
level and was dead at the last one.

#### Scenario: A dead binding inside a switch is caught

- **WHEN** a game contains `switch (button)` with a `case` label for a control
  code neither the key map nor that game's own panel can send
- **THEN** the scan reports it, naming the file and line

#### Scenario: The clear key is emittable only where it is offered

- **WHEN** the scan evaluates a comparison against button `8`
- **THEN** it is accepted in a game whose `requestKeys` includes the clear key,
  and reported in a game that declares no keypad

### Requirement: One keyboard-cursor vocabulary across games

A game with a keyboard cursor SHALL hold it in the engine's shared cursor
shape — a position and a visibility flag — under one canonical `Ui` field,
rather than naming either itself. The engine SHALL provide that shape and the
verbs for it: constructing one, moving it, revealing it and hiding it.

A **plain** arrow press SHALL reveal the cursor **and** move it, so a keyboard
player never spends a keypress on the reveal. A pointer press SHALL hide it.
Where an arrow is *itself an action on the board* — a modified arrow that marks,
a mode in which the arrow slides the grid — a first press on a hidden cursor MAY
reveal without acting, because a player who cannot see the cursor cannot see
where the action would land; the plain arrow beside it SHALL still reveal and
move.

What a game does *while* the cursor moves SHALL remain entirely its own: a game
may paint, fill a line, or refuse a step, and the shared shape SHALL NOT grow to
cover any of it. A genuinely different **traversal** — half-cell coordinates,
corner-skipping, a lock mode — likewise stays per-game, and a helper for one
SHALL be named apart from the shared verb so neither shadows the other. A game
MAY carry an extra flag *beside* the cursor where it draws a real distinction
the shared shape does not (which device revealed it; what it is armed for). The
shared part is the noun; the verb is the game's.

The engine SHALL fail the build for a cursor held anywhere but the canonical
field. That check SHALL find it **structurally** — by the shape, read off the
engine's own constructor, over every game's real `newUi` output — rather than by
matching names, so an eleventh spelling is caught as surely as the ten that
preceded it. A game SHALL NOT re-declare an engine cursor helper, which is
enforced from `pointer.ts`'s own export list.

#### Scenario: One arrow press both reveals and moves

- **WHEN** a player presses an arrow key on a board whose cursor is hidden
- **THEN** the cursor becomes visible **and** has moved one cell

#### Scenario: An arrow that acts on the board still reveals first

- **WHEN** a player presses a modified arrow that would mark or slide, on a
  board whose cursor is hidden
- **THEN** the cursor becomes visible and the board is unchanged

#### Scenario: A game keeps what it does while moving

- **WHEN** a game paints or fills as its cursor traverses
- **THEN** that behavior is unchanged by the shared cursor shape, which reports
  only where the cursor is and whether it is visible

#### Scenario: A cursor under any other field fails the build

- **WHEN** a game holds a cursor-shaped object under a field of its own naming
- **THEN** the guard fails, naming the game and the field — without having been
  told that name in advance

### Requirement: A game declines a button it did not act on

`interpretMove` SHALL return `null` for a button it did not act on, and the suite
SHALL assert that across every registered game by sending button codes nothing in
the vocabulary can mean.

The return value is not only a repaint hint. Three collection-wide input guards
ask their questions *by* it — keyboard reachability, the
`ignoresSecondaryButton` biconditional, and the on-screen-key sweep — and
`view-interactive.ts` raises `puzzle-key-unhandled` exactly when a game declines
a key, which is what lets a bare letter become an app command with no per-game
roster. **A game that answers everything therefore passes every one of those
guards vacuously and takes the app's bare-letter shortcuts away from its own
players**, and both failures are invisible from a green suite.

The probe codes SHALL be asserted unactionable rather than assumed so, against
the shared button vocabulary itself: free of every bit in `MOD_MASK`, outside the
mouse and cursor ranges, outside the printable-ASCII and cancel-key codes, and
absent from every game's `requestKeys`. **Unicode's private-use area is not a
safe choice and SHALL NOT be used**: button codes are not Unicode, `MOD_MASK` is
`0x7800`, and `0xE000` decodes as `MOD_NUM_KEYPAD | MOD_SHFT | 0x8000`. That
choice is how this guard was first mis-measured — it convicted Sixteen, which
reads the keypad bit and was answering the probe exactly as designed, and put a
second game into a finding whose real population was one.

The probe SHALL be sent at the keyboard origin `(0, 0)` as well as across the
board, because a game gating on pointer *coordinates* alone answers every key
that arrives there, and a board-only sweep scores it healthy.

A game that claims such a code SHALL appear on an explicit ledger whose entry
states why, and the ledger SHALL be asserted **exactly equal** to the set the
sweep finds, so an entry cannot outlive the behavior it excuses.

This guard SHALL NOT be read as reopening "did the board change" as the question
the other input guards ask; that question falsely convicted four games and
"consumed" remains the right one. Asserting that a code with *no meaning* leaves
the board untouched is the one direction that has no innocent reading.

#### Scenario: A game answering a meaningless code is caught

- **WHEN** a registered game returns non-`null` for a button code the vocabulary
  cannot express
- **THEN** the guard fails and names the code, unless that game is on the ledger

#### Scenario: The probe codes are checked before the games are

- **WHEN** the guard runs
- **THEN** each probe code is asserted to carry no modifier bit, to be no mouse,
  cursor, cancel or printable-ASCII code, and to be offered by no game's keypad

#### Scenario: A fixed game cannot stay on the ledger

- **WHEN** a game on the ledger stops claiming unactionable codes
- **THEN** the guard fails until its entry is deleted

#### Scenario: The keyboard-reachability guard is sensitive again

- **WHEN** a game that previously answered every code has its cursor-key
  handling removed
- **THEN** the keyboard-reachability guard fails for that game, where before it
  passed

### Requirement: The collection's input guards share one behavioral probe

The questions the collection-wide input guards ask of a game SHALL live in one
shared module (`src/engine/testing/input-probe.ts`), and each guard SHALL ask
them through it rather than carrying its own copy.

Two guards in different directories were building the same board, walking the
same probe grid and hashing the same save, and they had already drifted: the
bare-letter sweep seeded its board differently, tested a single cursor position,
and consequently reported a different set of games the moment its board changed —
Tents accepts `n` on any square but a tree, so the finding depended on what the
seed dealt.

Every probe SHALL be **behavioral**: it drives a real `Midend` over a real board
through the same path the frontend uses. No probe SHALL read a game's source, and
none SHALL read a declaration about a game — a game joins a population by *having*
the behavior. A probe whose answer depends on where a cursor happens to land SHALL
walk the cursor rather than test one cell.

#### Scenario: A new guard inherits the probes

- **WHEN** a new collection-wide input guard is written
- **THEN** it obtains its board, probe points and questions from the shared
  module, and does not restate them

#### Scenario: A probe does not depend on the deal

- **WHEN** a probe's answer would differ according to which board a seed dealt
- **THEN** it sweeps the positions that could differ rather than asserting from
  one

### Requirement: The engine answers which key is a digit, once

The engine SHALL provide `digitOf(button: number): number | null` in
`src/engine/pointer.ts`: the digit `0`–`9` a button stands for, or `null` for
any other button. It SHALL look through the keyboard modifier bits, so a
numpad digit with Num Lock on (`MOD_NUM_KEYPAD | '7'`) reads as that digit —
the keypad is a convenience route to the same key, never a different one.

A game SHALL NOT spell the digit range itself — not as a comparison or
subtraction against the button (`48`, `0x39`, `button - 48`), not as a numeric
`case` in a `switch` on the button, and not as a local constant holding a digit
code that is then compared against the button. A guard SHALL find every such
site by its **codes**, in any operand position in any game source — the
button, a desc character, a helper's parameter under any name — and SHALL
prove itself on planted copies of each shape before scanning. The guard's one
stated blind spot is a constant holding a digit code that is passed as an
argument rather than used as an operand.

What a game does with the digit SHALL remain the game's: the bound it accepts
and the meaning it gives `0` (a clear, the value zero, ten, sixteen, one more
typed digit, a command) are answers about the puzzle, written beside the call.
A game that gives the **numpad's** digits another meaning (a direction pad)
SHALL resolve those before asking, as `MOD_NUM_KEYPAD | <digit>` bindings
already do.

#### Scenario: A numpad digit enters the same value as the bare key

- **WHEN** a game reads `digitOf(MOD_NUM_KEYPAD | '5')`
- **THEN** it receives `5`, exactly as for the bare `'5'`

#### Scenario: A hand-parsed digit fails the build

- **WHEN** a game source compares or offsets any value against a digit code,
  labels a `case` with one, or compares a character against a one-digit string
  with a relational operator
- **THEN** the guard reports the game and line, whatever the game named the
  value and wherever in its sources the line sits

#### Scenario: The bound and the meaning of zero stay with the game

- **WHEN** two games read the same digit key
- **THEN** each applies its own bound and its own reading of `0` — Guess the
  tenth color, Bridges sixteen, Seismic a clear — with no such policy in the
  helper

### Requirement: A pointer drag over a grid has one name across the collection
A game whose `Ui` remembers **where a pointer drag started and where it is now**,
as a pair of integer coordinates, SHALL hold that in the engine's `GridDrag`
rather than in fields of its own naming — the same convention `GridCursor`
already carries for the keyboard cursor.

The engine SHALL own the anchor, the current position, whether a drag is running,
and the helpers that start, move and end one. A game SHALL keep its own
coordinate space, since a game may legitimately work in cells, half-cells or any
other unit, and SHALL keep everything its drag *means* — what the press picked,
what the release commits, and its own `Move` type.

#### Scenario: a game asks whether a drag is running

- **GIVEN** a game that carries a `GridDrag`
- **WHEN** it needs to know whether a drag is in progress
- **THEN** it reads one field whose meaning is the same in every game
- **AND** it does not test a coordinate against a sentinel value of its own
  choosing

#### Scenario: two games with different coordinate spaces

- **GIVEN** one game whose drag is in grid cells and another whose drag is in
  half-grid coordinates
- **WHEN** both carry a `GridDrag`
- **THEN** neither is asked to change the space it works in

### Requirement: The engine cancels a drag the board changed under
The midend SHALL end every `GridDrag` on a game's `Ui` when it replaces the game
state, so that a drag cannot act on a board that no longer holds what the drag
was aimed at.

Membership SHALL be **derived** — the midend finds a drag by what the `Ui`
carries, never by a declaration a game makes about itself — so that a game
acquires the protection by having a drag and a new game cannot forget to ask
for it.

A game that genuinely needs a drag to survive a state change SHALL say so in its
own `changedState`, with its reason recorded — the engine's cancel runs first,
so the game's hook has the last word.

**A game carrying a `GridDrag` SHALL gate every committing path on `drag.live`**,
rather than on a secondary flag of its own. The engine can only end the drag it
can see; a release that keys off "which button started this" or "has the drag
left its anchor" does not hear the cancel, and commits a move from a board that
no longer exists. That includes any *click* path a release falls through to when
the drag half declines it.

#### Scenario: a release arriving after the board changed

- **GIVEN** a game whose drag is live, and a state replacement between the press
  and the release
- **WHEN** the player releases
- **THEN** no move is committed, by any path the release can take

#### Scenario: an undo lands while a drag is live

- **GIVEN** a live drag on a game that declares no `changedState`
- **WHEN** the player undoes a move
- **THEN** the drag is no longer running
- **AND** the game needed to declare nothing to get that

### Requirement: The engine answers which character is a digit, once

The engine SHALL provide, in `src/engine/decimal.ts`, `isDigit(c: string): boolean` and `digitValue(c: string): number | null` — the value `0`–`9` a decimal digit character stands for, or `null` for any other character. The absent case SHALL sit outside the number domain, so that no caller can use the result without discriminating it; a sentinel inside the domain passes a lower-bound test by coincidence and is stored as a wrapped byte by a typed array. Both SHALL take a **character**, never `string | undefined`: indexing past the end of a string yields `undefined` while typed `string`, and a signature that absorbs that spreads a runtime fact through every helper built on it. The caller holding the index SHALL carry the bounds check (`i < s.length && isDigit(s[i])`), as `parseLeadingInt` does. A game SHALL read a digit character through these and SHALL write a single digit as `String(n)`; it SHALL NOT declare its own `isDigit`, compare a character against a one-digit string with a relational operator, subtract a digit code from a character code, or add one to build a character. The three spellings of the fact — `digitValue` on a character, `c2n` on a desc character, `digitOf` on a key — SHALL agree on every digit, and a test SHALL hold them equal.

What the value *means* SHALL stay with the game: the bound it accepts and what an out-of-range value does (an error message, a sentinel, a rejected desc) are written beside the call. A write into a typed array SHALL name that array's own absent constant (`?? EMPTY`, `?? -1`) rather than inherit a codec's, and a write that is safe only because `validateDesc` screened the character SHALL say so at the write. A hex nibble read case-insensitively (a bitmap of mines or lit cells) is not a decimal digit and is read with `Number.parseInt(c, 16)`.

#### Scenario: A run-length game reads a bounded clue

- **WHEN** Slant's `validateDesc` meets a value token
- **THEN** it reads `digitValue(tok.value)` and applies its own bound of `4`, rejecting `5` with its own message and a letter with its own message

#### Scenario: A private copy fails the build

- **WHEN** a game source declares an `isDigit`, `digitValue`, `parseLeadingInt`, `n2c`, `c2n`, `n2cUpper`, `c2nUpper`, `scanRunLength` or `encodeRunLength` of its own
- **THEN** `emittable-keys.test.ts` reports it, the reserved names being read from the fact modules' own export lists

#### Scenario: A stray character cannot be stored without a decision

- **WHEN** Filling's `newState` writes a clue into its `Uint8Array`, whose absent value is `0`
- **THEN** the write names `EMPTY` for a character that is not a digit, and a non-digit can never be stored as `255`

### Requirement: An on-screen key may name a palette color

A `KeyLabel` MAY carry a `swatch`: an index into the palette of the game that
returned it. The app SHALL paint such a key in that color, resolved against the
**same** palette the canvas is painted from, so a key and the board cannot
disagree under any color scheme. A key without a `swatch` SHALL be rendered
exactly as before.

This exists because a game whose element is a color has no character that names
it. A bare `"1"` asks the player to learn which color one *is*, which is the one
thing the panel exists to spare them. The `label` SHALL still carry the
character the key sends, so the swatch teaches the keyboard binding rather than
replacing it.

The resolved palette SHALL be published from the single point that hands it to
the drawing, rather than recomputed for the panel: a second derivation is a
second thing to keep true, and the failure is silent — a key in last scheme's
color still looks like a key.

The label's ink SHALL be chosen from the fill's own lightness rather than fixed.
A palette is authored per scheme, and a fill light enough to take black text in
one scheme is not in the other.

A keypad of color keys SHALL be built by a shared builder alongside `digitKeys`,
not spelled out in the game. The button codes are the decimal-digit fact, which
the engine states exactly once and no game restates.

#### Scenario: A color key is painted from the board's own palette

- **WHEN** a game returns a `KeyLabel` with a `swatch`
- **THEN** the on-screen key is painted in the color that palette index holds,
  and follows it when the color scheme changes

#### Scenario: An ordinary key is untouched

- **WHEN** a game returns a `KeyLabel` with no `swatch`
- **THEN** the key carries no color of its own

### Requirement: A color keypad may spell its tenth value zero

The engine SHALL offer a color keypad whose tenth key is `'0'` alongside the one
whose tenth key is `'a'`, and a game SHALL choose between them rather than
spelling either set of button codes itself.

Both are real conventions in the collection and a game cannot be talked out of
its own: the digit games read `'a'` for a tenth value because they can go past
ten, and Guess reads `'0'` because its colors stop at ten and `digitOf` already
answers that key as zero. Offering only one would leave the other game shipping
a key it refuses, which is inert on the panel and invisible to the sweep that
catches inert keys — that sweep reads a game's **default** params, and the
tenth value here is reachable only through the Custom dialog.

The builder SHALL be keyed on there *being* a tenth value rather than on the
tenth *entry* existing: the keypad carries a clear key after its values, so at
nine values that entry is Clear and rewriting it would take the clear key away.

#### Scenario: Ten values put zero last and keep Clear

- **WHEN** a zero-is-ten color keypad is built for ten values
- **THEN** its tenth key sends `'0'` and the clear key is still the last entry

#### Scenario: Nine values are the ordinary keypad

- **WHEN** the same builder is asked for nine values
- **THEN** the keys are `'1'`–`'9'` and the clear key is untouched

### Requirement: The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle

The note-taking cell SHALL provide the two arms a gesture ends in, so that a
game whose press may become a drag writes no selection logic of its own:

- **A release that committed nothing** SHALL resolve through a tap arm that maps
  the release button back to the press it belongs to and then applies the same
  rules a click-select game's press applies. The rules SHALL be the same code,
  not the same intent.
- **A release that committed a move** SHALL resolve through a drag-entry arm
  that moves the highlight to the cell the pointer acted on and puts it away,
  which is what the mechanic already states for an entry the pointer made.

**The identity of what is selected SHALL come from the game, as a convention
with a first-class override.** The tap arm SHALL answer "is the highlight
already on the thing being tapped?" for itself when the game's selection is a
cell, and SHALL accept the game's own answer when it is not. A game whose
selection is a region SHALL NOT be a special case in the engine.

Whether a gesture committed stays the game's: it is a question about the puzzle,
and the collection's two drag games answer it differently for reasons about
their puzzles — Rome by direction (a drag back to the grabbed square is a
cancel), Map by effect (a drop that changes nothing is a tap on the region it
was released over).

#### Scenario: A region selection is compared as a region

- **WHEN** two taps land on different cells of one region in a game whose
  selection is a region
- **THEN** they read as a repeat tap on one selection

#### Scenario: Every member answers one gesture one way

- **WHEN** the collection is swept for the games carrying the mechanic's `Ui`
  fields, and each is driven through its own `interpretMove` with a pointer
  press and release
- **THEN** a repeat tap puts the highlight away in every one of them, unless the
  game answers the re-press some other way and records it, and a sticky right
  tap hides a showing highlight in none of them
- **AND** the sweep reports how many of its taps reached the sticky mode-switch
  branch, so a rule asserted over a sweep that never exercised it fails

### Requirement: A game offers a keypad exactly when touch play needs one to type

A game whose board carries a `pencil` array (the board arm of `takesNotes`,
exported as `hasPencilArray`) SHALL offer a non-empty `requestKeys`, because its
notes are written by typing a symbol and on touch the keypad is the only way to
type. A game that offers a keypad without such an array SHALL be named, with the
reason, in the input-parity guard's `KEYPAD_WITHOUT_PENCIL` ledger. The guard
SHALL check this per game as a biconditional, so that losing a keypad fails that
game's own case and gaining one without a pencil array fails until it is
ledgered; it SHALL NOT rely on a floor under the number of keypad games.

Wherever a game's keypad offers the Clear key (`CLEAR_BUTTON`), the keyboard's
Backspace (`DELETE`) SHALL also reach that game.

#### Scenario: A note-taking game that loses its keypad fails its own case

- **WHEN** a game whose board has a `pencil` array stops implementing
  `requestKeys`
- **THEN** that game's input-parity case fails, naming the pencil array as the
  reason it needs a keypad

#### Scenario: A keypad without a pencil array must be ledgered

- **WHEN** a game with no `pencil` array offers a keypad and is not in
  `KEYPAD_WITHOUT_PENCIL`
- **THEN** that game's input-parity case fails and asks for a ledger entry with
  the reason

#### Scenario: Backspace clears wherever the panel's Clear does

- **WHEN** a game's keypad offers the Clear key
- **THEN** a `DELETE` keypress is consumed by that game under the same probe that
  reaches its panel keys

### Requirement: Click-game input is declared as targets and verbs

A game whose input is **aim at a target, and each button applies a verb there** MAY declare it as `Game.targetVerbs`: a geometry (which target a press addresses, which one the cursor rests on, how the arrows move the cursor) and a verb per button, each a function from the state, a target and the player's `Ui` to the game's own `Move`, a UI-only update, or nothing, with the words the help uses for it. Such a game SHALL hand the buttons it does not handle itself to the engine's `interpretTargetVerbs`, and its help page SHALL carry the Controls paragraph generated from the declaration.

A target is whatever the game aims at — a square, an edge between two cells, a clue beside the grid — and where the cursor is, and how the arrows move it, belongs to the geometry; the engine reads only whether the cursor shows. A verb MAY also be reached only by keys, with no button.

The engine SHALL own, for every declaring game:

- a pointer press parks the cursor, hidden, on the target it pressed;
- the first select key on a hidden cursor only shows it;
- a press that applies nothing is a repaint only when it hid a shown cursor;
- Enter applies the left-click verb, Space the right-click verb, or the left-click verb when the game has no second one, and a verb's own keys apply that verb. Space is never bound to another verb: a game wanting a key for a verb gives the verb its own key.

A verb's semantics SHALL be the game's function, never a flag on the model. Input beyond the verbs SHALL be an arm of the game's own `interpretMove`, tried before the hand-off; an arm that resolves a press on its release SHALL call the same verb functions the model calls, so the model owns no release hook.

A cross-game guard SHALL hold the declaration to the behavior: for every declaring game, the boards a select key reaches at every cursor position the arrows reach that rests on a target SHALL equal the boards its button reaches at every point on the board, since that is what the generated paragraph tells the player. A position resting on no target belongs to an arm and is walked through without being pressed at.

#### Scenario: Enter does what the click does

- **WHEN** a declaring game is probed from its opening position
- **THEN** Enter at every reachable cursor position resting on a target reaches exactly the boards a left-click at every board point reaches, and Space those of the right-click, or of the left-click when there is no right verb

#### Scenario: An arm that disagrees with its verb fails

- **WHEN** a declaring game handles Space in an arm of its own that applies a different verb from its right-click
- **THEN** the guard fails for that game

#### Scenario: The help cannot describe a key the game does not bind

- **WHEN** a declaring game's help page is built
- **THEN** its Controls section carries the paragraph generated from its verbs, and a page carrying the placeholder for a game that declares none fails the build

#### Scenario: A key-only verb reaches the board

- **WHEN** a declaring game has a verb reached only by keys
- **THEN** each of its keys reaches some board from a primed position, or the guard fails

### Requirement: A game reads one pointer with two buttons
The frontend SHALL deliver a pointer to a game as a left button and a right button only, the same from a mouse, a finger and a pen: a click or a tap is `LEFT_BUTTON`, a right-click or a long press is `RIGHT_BUTTON`, and a drag from either is that button's drag and release. Nothing a game receives SHALL say which device pressed. A player moves between a mouse and a finger without learning a game twice, and a player who has only one of them reaches everything the other does.

So three things upstream offered SHALL NOT exist in the engine's vocabulary:

- **The middle button.** The engine SHALL NOT export middle-button codes, and the frontend SHALL drop a middle-button press. Many touchpads cannot send one and a finger has nothing like it.
- **A key held with a press.** The frontend SHALL send a pointer press, drag and release with no modifier bits, and SHALL NOT turn a press into another button because a key is held (upstream's Shift-click as middle and Ctrl-click as the other button). Modifiers on keys — Shift+arrow, Ctrl+arrow — are keyboard gestures and are unaffected.
- **A stylus bit.** No bit SHALL mark a press as a finger's or a pen's, and `Game` SHALL carry no flag asking for one. A game therefore cannot give touch a control scheme of its own, and cannot compare a raw button that a finger's press would fail to match — the defect that once left nine ports deaf to touch.

Every action a game offers SHALL be reachable with the two buttons alone, by clicks and drags, as well as from the keyboard. Where a game has more actions than buttons, the extra one goes into a mode the player turns on or onto the on-screen keypad; a clear or a reset that a button cycle already passes through needs no control of its own, and MAY keep a key as a keyboard convenience.

`view-interactive.test.ts` SHALL assert this at the frontend, on the codes a game receives.

#### Scenario: A tap sends what a click sends
- **WHEN** the board is pressed and released by a mouse, a finger or a pen
- **THEN** the game receives `LEFT_BUTTON` and `LEFT_RELEASE` in each case, with no other bits

#### Scenario: A held key changes nothing
- **WHEN** a left or right press is made with Shift, Ctrl or Command held
- **THEN** the game receives exactly what it receives for the same press with no key held

#### Scenario: The middle button does nothing
- **WHEN** the middle mouse button is pressed on the board
- **THEN** the game receives nothing

### Requirement: A key-only verb declares the pointer's route to it
A target-verb game's key-only verb SHALL declare how a pointer alone reaches the same move, as a `pointer` route the verb cannot be declared without, so that a verb no button applies directly is a type error unless the pointer has a way to it. A route SHALL be one of: the verb's target pressed with a button a stated number of times (`repeat`); pressed with a button until its cycle reaches the verb's result (`cycle`); or pressed with a button in notes mode, at a stated place on the target where the game reads where the press lands (`notes`).

The Controls paragraph generated from the declaration SHALL state each key-only verb's route beside its keys, so the help cannot describe a key without the pointer's way to the same move.

`target-verb.test.ts` SHALL hold every declared route to its keys, comparing boards by what the player sees rather than by the state, since a game may record bookkeeping a move leaves invisible (Net records which way its last turn went): for `repeat`, the boards the keys reach at every cursor target SHALL equal those the route reaches at every point on the board; for `cycle` and `notes`, every board the keys reach SHALL be one the route passes through.

An arm of a game's own, outside the model, is not covered by this requirement; its keys and gestures are the game's to match, and `docs/games/input.md` says so.

#### Scenario: A key-only verb without a route does not compile
- **WHEN** a game declares a key-only verb with keys and no `pointer` route
- **THEN** the typecheck fails

#### Scenario: A route that does not make the key's move fails
- **WHEN** Net's half turn declares three presses instead of two, or its lock declares a button cycle instead of a notes-mode press
- **THEN** `target-verb.test.ts` fails for Net, naming the verb

#### Scenario: The paragraph names the route
- **WHEN** a declaring game's Controls paragraph is generated
- **THEN** each key-only verb's sentence ends with its route, such as "or click it twice" for Net's half turn

### Requirement: A target geometry can say where to press for a target
Every `TargetGeometry` SHALL provide `pointAt(state, ds, target, ui)`, a point whose press addresses `target`, so a hint's gesture can aim at a target of the model. `target-verb.test.ts` SHALL hold, for every declaring game and every target a press on its default board reaches, that a press at the target's `pointAt` addresses that same target.

#### Scenario: A point that presses a neighbor fails
- **WHEN** a geometry's `pointAt` returns a point inside a neighboring target
- **THEN** `target-verb.test.ts` fails for that game, naming the target and the point

### Requirement: A drag on from a press repeats the press

A game that declares `Game.targetVerbs` MAY declare a **sweep**: what a target
holds, as a value the engine compares. For such a game the engine SHALL make a
drag on from a press repeat that press: each further target the pointer passes
over that holds what the pressed target held before its press SHALL get the
pressed button's verb, and a target that holds anything else SHALL be passed
over. A drag therefore paints the press's result and never toggles its way
along a row. A press whose verb made no move SHALL open no drag.

The declaration MAY limit the drag to some buttons, to some targets given the
first, and to targets the pointer passes within a stated distance of the point
that addresses them, which is how a drag along a line of edges is kept from
taking the edges that meet it at each corner. The engine SHALL take every
target between two pointer events, so a fast drag skips none.

A game whose own arm takes the press SHALL reach the same drag through the
engine's helpers, and where its click acts on the release, the pressed
target's verb SHALL be applied when the drag reaches a second target.

The midend SHALL treat the moves of one drag as one step: one Undo takes all
of them back and one Redo replays all of them. The grouping is not saved; a
reloaded game undoes such a drag a move at a time.

The generated Controls paragraph SHALL say the drag for a game that declares
one. A cross-game guard SHALL hold the declaration to the behavior: for every
game declaring a sweep, and each button it names, a drag between two targets
that hold the same thing leaves both holding the press's result, and one Undo
returns the board to where the press found it.

#### Scenario: A drag paints and does not toggle

- **WHEN** the player presses an empty square of a declaring game, which marks
  it, and drags across an empty square, a marked square and another empty
  square
- **THEN** the two empty squares take the same mark and the marked square is
  left as it was

#### Scenario: One Undo takes a drag back

- **WHEN** a drag has marked four targets and the player presses Undo once
- **THEN** all four are as they were before the press
- **AND** one Redo marks all four again

#### Scenario: A game that drops its drags fails

- **WHEN** a game declares a sweep and its `interpretMove` never hands a drag
  event to the engine
- **THEN** the guard fails for that game

### Requirement: A mark a player wants on several targets can be dragged

A button whose verb is a mark (a shade, a cross, a flag, a wall, a line, a
note, a clue marked done) SHALL be repeated by a drag wherever a drag on that
kind of target is not already another gesture of the game. A game SHALL
declare this and SHALL NOT write a drag of its own for it: as its
`targetVerbs.sweep`, or, where its input is not target-verb or the mark
exists beside it (a clue marked done beside cells that take a keypad, a mark
of notes mode, the one button a drag game's own drag does not use), as the
engine's verbs for one draggable mark, opened and continued through the same
helpers. A drag opened on one declaration SHALL NOT be carried on with
another.

A drag SHALL NOT repeat a verb that is a move (a rotation, a slide, a beam
fired, a square opened) or a mark never wanted in a row (Light Up's bulb).
Where a game's drag is its own gesture on that target (Rect's rectangle,
Bridges' bridge, Spokes' spoke, Map's color, Rome's arrow, Loopy's pair note
in notes mode, Tents' link on the left button), the click stays one mark a
press.

Each mark declared outside `targetVerbs` SHALL be held to the same behavioral
check as a declared sweep.

#### Scenario: A flag is dragged and a square is not opened

- **WHEN** the player right-drags across three covered squares in Mines
- **THEN** all three are flagged, and one Undo unflags all three
- **AND WHEN** the player left-drags across covered squares
- **THEN** no square is opened by the drag

#### Scenario: A clue marked done is dragged

- **WHEN** the player presses a clue beside a Towers grid, marking it done, and
  drags along the clues beside it
- **THEN** each clue passed that was not done is marked done
