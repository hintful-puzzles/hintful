# Input: pointer, keyboard, touch

How a game receives input in this frontend, and the traps this frontend has
that upstream never had. Every trap below has already cost this project a
shipped bug — read them before writing a game's input, not after.

Authoritative specs: [`engine-input`](../openspec/specs/engine-input/spec.md) (touch
equivalence, on-screen keys, the keyboard cursor) · [`ts-engine`](../openspec/specs/ts-engine/spec.md) (the
`Game` interface) ·
[`app-shell`](../openspec/specs/app-shell/spec.md) (focus handling).
Related guides: [`mechanics.md`](./mechanics.md) (the `interpretMove` /
`executeMove` contract and `UI_UPDATE`) · [`rendering.md`](./rendering.md)
(drag *previews*, blitters) · [`engine-catalog.md`](./engine-catalog.md) (the
shared helper inventory).

## How a press reaches interpretMove

A pointer or key event lands in `puzzle/components/view-interactive.ts`, which
maps it to an upstream-style button code and hands it through the worker to
`Midend.processInput`, which calls the game's `interpretMove`. Four facts
about that pipeline shape everything below:

- **Button codes and class predicates are shared** —
  [`engine/pointer.ts`](../src/engine/pointer.ts) exports the
  `LEFT_BUTTON`…`CURSOR_SELECT2` codes, the `isMouseDown` / `isMouseDrag` /
  `isMouseRelease` range predicates (upstream's `IS_MOUSE_*`), the `MOD_*`
  masks and `stripModifiers`. Never redeclare `const MOD_MASK`.
- **Shift on a key is yours to read, and you need not strip it.** A key held
  with Shift arrives with `MOD_SHFT` set, a capital letter included, since the
  player held Shift to type it. If you decline it, the midend offers the same
  key again without Shift (`withoutShift`), so `button === 'D'` matches. An
  arrow is the exception: Shift+arrow is a gesture, and declining it is a no.
  A game that gives a shifted key its own meaning (Untangle's Shift+Tab) must
  answer the first offer. Ctrl and the keypad bit are not taken off for you.
- **There are two buttons, and a tap is a click** — see § "One pointer, two
  buttons".
- **Keyboard characters arrive as bare char codes** through the view's
  `puzzleKeyMap`, with consequences upstream never had — see § "The numeric
  keypad never arrives".

**Don't map editor-only move letters from input.** Upstream guards them behind
`#ifdef EDITOR`; a port simply doesn't wire them, and says so in its
`design.md` so it isn't re-decided.

## The input-parity bar

**Maximum parity between mouse, touch and keyboard is the collection-wide bar**
(owner directive, 2026-08-03). A game where one mode cannot play to completion
carries either a defect or an explicitly recorded exemption — never an
unexamined gap.

**The sweeps below guard it automatically, all through the live registry and a
real `Midend`, so your game is covered the day it is registered.** You do not
have to remember they exist; you do have to know what they will tell you.

- [`view-interactive.test.ts`](../src/puzzle/components/view-interactive.test.ts)
  — a finger and a mouse send a game the same codes, and a held key or the
  middle button changes nothing (§ "One pointer, two buttons").
- [`input-parity.test.ts`](../src/engine/input-parity.test.ts) — the
  `ignoresSecondaryButton` biconditional (§ "A touch hold arrives as the right
  button"); **keyboard reachability**, which asks not only whether a cursor key
  is consumed but whether any keyboard-only sequence *commits a move*;
  **on-screen key reachability**, the reverse direction (§ "The on-screen
  keypad"); and the guard on the instrument all of those run on, that a game
  **declines a button it did not act on** (§ "A button you did not act on must
  not be claimed").
- [`shortcuts.test.ts`](../src/puzzle/shortcuts.test.ts) — that every bare
  letter the app binds still reaches the app in your game (same section).
- [`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) — the
  source scan for a key that can never fire (§ "The numeric keypad never
  arrives").
- [`canceled-press.test.ts`](../src/engine/canceled-press.test.ts) — a press
  the browser or Escape cancels leaves the board and the `Ui` as they were
  (§ "A canceled press is the engine's").
- [`input-answers.test.ts`](../src/engine/input-answers.test.ts) — what each
  answer of `interpretMove` leaves behind: no move that left the board as it
  was is a step of Undo and none that changed it is dropped, and no input
  left unclaimed changed the frame
  ([`mechanics.md`](./mechanics.md) § "interpretMove and UI_UPDATE").
- [`modifier-arrow.test.ts`](../src/engine/modifier-arrow.test.ts) — Shift
  or Ctrl with an arrow and with its opposite, pressed from every position the
  arrows reach, never change the board alike. It cannot read which way a game
  acted, since what a modified arrow does is each game's own, so it holds the
  one thing all of them owe; **take the direction from the key
  (`cursorDelta`), never from where the clamped cursor ended up**, which is
  right everywhere but the far edge. It sees a board, so a game whose cursor
  travels with the move (Sixteen under Ctrl) tests that itself.
- [`hint-gesture.test.ts`](../src/engine/hint-gesture.test.ts) — every hint
  step is played through your `interpretMove` by the gesture your
  `hintGesture` gives for it, so a hint can only ask for what the pointer does
  ([`hints.md`](./hints.md) § "Every step is a gesture").

**What no sweep can tell you** is whether the resulting gesture is *usable* —
hit targets big enough for a fingertip, a cursor a player can see, a panel
offering the keys the game wants. Those need the browser.

**On writing a probe of your own**: take it from
[`engine/testing/input-probe.ts`](../src/engine/testing/input-probe.ts)
rather than writing one. That module holds the board builder, the probe grid
and the questions the guards ask, so two guards cannot drift apart.

If you do extend one: **never convict a game because the board did not
change.** A right-button eraser has nothing to erase on a fresh board, a Clear
key on an empty cell is a legitimate no-op, and Fifteen's gap starts in the
corner where two of the four arrows correctly do nothing. What *is* sound is
the other direction: a change is a **sufficient** sign that an input means
something, and a game is reported meaningless only when it is invisible under
*every* observation (`secondaryMeaning`).

## The numeric keypad never arrives

**A keypad binding must never be the only route to an input — bind the bare
digits too.** `view-interactive.ts` sets `MOD_NUM_KEYPAD` from
`event.location === 3`, so `MOD_NUM_KEYPAD | '7'` does fire. But a numpad key
only arrives as a **digit when Num Lock is on**: with it off, numpad 7 is
`event.key === "Home"`, which `puzzleKeyMap` does not carry. And a laptop
keyboard may have no numpad at all. So the keypad is a *convenience route*,
never the only one.

**The bit rides a digit and nothing else.** With Num Lock off the pad's 8 is
`ArrowUp` from location 3, and its Enter is `Enter`: both arrive as the plain
`CURSOR_UP` and `CURSOR_SELECT`, so a game comparing `button === CURSOR_UP`
hears the pad's own arrows.

Inertia's four diagonal moves are keypad-or-mouse upstream, which leaves a
keyboard-only player without them. Accept the bare digits as well as the
modified ones (`stripModifiers`,
then look the character up) whenever the game binds no other meaning to those
digits. Exemplar: [`inertia/index.ts`](../src/games/inertia/index.ts)
(`DIGIT_DIRECTIONS`); guarded by
[`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts).

**The same trap, one layer up: a whole feature can hang off a character this
frontend never sends.** Upstream binds Slide's route-walking to
`button == ' '`, but `puzzleKeyMap` maps Space to `CURSOR_SELECT2` and Enter to
`CURSOR_SELECT`, so the bare space character never arrives.

**Tell:** an `interpretMove` comparing `button` against a **character literal**
(`' '`, `'u'`) or against `MOD_NUM_KEYPAD | …`. Check what `puzzleKeyMap`
actually delivers before porting the comparison; accept the buttons this
frontend does send (keeping the literal too costs nothing).

**The erase and cancel keys are the commonest instance.** Upstream writes
`button == '\b'` (8) to rub something out, and pairs it with Escape (27) to
abandon a drag. This frontend sends **127** for Backspace, Delete *and* Clear,
never 8 from the keyboard.

**Never write the codes.** [`engine/pointer.ts`](../src/engine/pointer.ts)
exports `isEraseKey` (8 | 127) and `isCancelKey` (27 | 8 | 127); a game with both
meanings tests them in separate branches. Escape reaches games as 27 whenever no
pointer gesture is in flight (`app-shell` spec, "Escape reaches the puzzle when
there is no gesture to cancel").

**The digit keys are the same fact, and `digitOf(button)` answers it** — the
digit `0`–`9` a key stands for, or `null`, looking through the modifier bits so
a numpad digit with Num Lock on *is* that digit. What stays with the game is everything that is genuinely about
the puzzle: the **bound** (`n <= w`, the cell's region size) and the **meaning
of `0`** — a clear in Seismic, Mathrax and Crossing, the tenth color in Guess,
sixteen in Bridges, one more typed digit in Ascent — so each is written beside
the call, in the game's own words. A command bound to a digit is the same call
(`digit === 1` places Undead's ghost). The one thing to resolve *before* asking
is a numpad digit that means something else — Ascent, Bricks and Cube use the
keypad as a direction pad. **Take the direction from
`numpadDirection(button)`, all eight at once**, so a diagonal is never left to
be read as a digit. Whatever the helper answers for is no digit; `digitOf` is
asked only when it answers `null`. Guarded by the code-keyed scan in
[`decimal.test.ts`](../src/engine/decimal.test.ts), which reads any operand
anywhere in a game source, not only against the button: a `48`, a `0x39`, a
`- 48`, a numeric `case` or a `c >= "0"` all fail it, whatever the value is
called.

[`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) reads the
codes the frontend can produce and the codes the game sources test, and fails
on a test with no producer. It is a source scan on purpose: what is asserted
is that no behavior exists, which no behavioral test can see. Two things to
know about it:

- **A `case` cannot call a predicate, so spell both codes**
  (`case BACKSPACE: case DELETE:`; exemplar `subsets/index.ts`). A gate that
  calls `isEraseKey` in front of a `switch` with `case 8:` alone is wired at
  every level and dead at the last one.
- **The on-screen panel is a second emitter**: `clearKey`'s button is `8`, so
  the emittable set is computed **per game** — 8 reaches a game that offers
  the key and no other.

## One pointer, two buttons

**A game has a left button and a right button, and nothing tells it which
device pressed them.** A tap is `LEFT_BUTTON`, a long press is `RIGHT_BUTTON`
(§ "A touch hold arrives as the right button"), and a drag from either is that
button's drag. A player moves between a mouse and a finger without learning a
game twice, and a player who has only one of them can reach everything (owner,
2026-09-30).

So three things upstream had are **not in the vocabulary at all**, rather than
discouraged:

- **The middle button.** `MIDDLE_BUTTON` and its drag and release are not
  exported; the view drops a middle press. Many touchpads cannot send one, and a
  finger has nothing like it.
- **A key held with a press.** The view sends a press with no modifier bits.
  Upstream's frontend turned Shift-click into the middle button and Ctrl-click
  into the other button, which only a player with a hand on each device can use.
  Modifiers on *keys* (Shift+arrow, Ctrl+arrow) are keyboard gestures and stay.
- **`MOD_STYLUS`.** Upstream marks a finger's press so a game can give touch
  its own behavior (in Loopy and Pattern a tap cycles three states where a
  click toggles two). With a long press as the second button that is not
  needed, and it would mean a second control scheme for one game.

**What this asks of a game**: every action it has must be reachable with the
two buttons, clicks and drags, and not only from the keyboard — and every
action must be reachable from the keyboard, not only the pointer. Where a
third action has no button to spare, it goes into a mode the player turns on
(Net's lock is a tap in the middle of a square in notes mode; Net's Source key
arms a tap that moves where the network is lit from), or onto the on-screen
keypad (Salad's `X` and `O`, Net's Jumble, Ascent's digits). A clear or reset
rarely needs a control of its own: a button cycle that passes through empty
already reaches it (Loopy, Subsets, Unruly keep Backspace as a keyboard
convenience, a `keyOnly` verb whose route is `cycle`). A pointer gesture with
no key gets one the same way: Group's heading drag is Shift+arrow, and its
click between headings is `|` or `-`.

**Where it is guaranteed, and where it is not.** Inside the target-verb model
the rule is structural: a `keyOnly` verb without a `pointer` route is a type
error, and its route is tested. An arm of the game's own — anything
`interpretMove` handles before `interpretTargetVerbs` — is outside it, and
nothing checks that arm's keys and gestures against each other. So put an
action in the model whenever it fits; an arm is where a gap can hide.

## A touch hold arrives as the right button

`detectSecondaryButton` (`src/utils/touch.ts`) gives touch a
long-press-for-secondary affordance: a finger that stays within 8 px for
350 ms is delivered to the game as `RIGHT_BUTTON` — and its drag and release
follow suit.

**That kills any press-and-drag gesture, precisely when the player pauses to
aim.** "Press, pause a moment to decide, then drag" is *exactly* a press that
stays put — so the gesture dies only on touch, and only for the player who
stopped to think (Inertia's swipe, a Pegs jump).

Four resolutions, by whether the game uses the secondary button:

- **No secondary meaning at all → declare `Game.ignoresSecondaryButton`**, and
  the view skips `detectSecondaryButton` for your game entirely: no promotion,
  and the press delivered immediately rather than held for the detection window.
  This is the right answer whenever it applies, because it fixes the problem
  where it is rather than teaching every game to survive it.

  **You do not get to choose freely.** `input-parity.test.ts` asserts the
  biconditional — you declare it *iff* the secondary button means nothing
  observable on a real board — so it cannot be forgotten by a new game or left
  behind by a game that grows a secondary meaning. It is **not** upstream's
  `REQUIRE_RBUTTON` inverted: a game may *use* the secondary button without
  *needing* it (Tracks), and that third group is the largest.

  **"Meaning" is derived, and consumption is not it.** The guard asks *did the
  secondary gesture change anything the player can perceive, now or next*, in
  the painted frame or the save, after priming the board three ways (one
  press, two presses, a drag), since a secondary meaning is usually "undo what
  the primary one did". **You need do nothing to enroll**: a pencil-mode press
  reached through `pressNoteTakingCell` is credited without a `RIGHT_BUTTON`
  branch of your own. The one gap: a secondary press whose *only* effect is
  one the primary press also has is still credited.
- **Secondary meaning, but the promoted gesture should do the primary thing →
  fold right onto left** at the top of `interpretMove`. One line; exemplar
  `asPrimary()` in [`inertia/index.ts`](../src/games/inertia/index.ts).
- **Secondary is meaningful → continue the drag on the button class, not the
  press button.** A drag keyed off `isMouseDrag`/`isMouseRelease` (rather than
  the exact press code) lets a long-press that arrived as `RIGHT_BUTTON` start
  and finish its own right-button drag correctly — the right answer for a game
  like Boats where the secondary button carries meaning and folding would be
  wrong. See § "Drag models".
- **Best of all → put the gesture on the left button too, so the promotion
  never has to happen.** The resolutions above make the promoted press
  survive; this one means a touch player never triggers it. Galaxies'
  association gesture is a plain left drag, with the right button doing the
  same for anyone who has the habit. The price is that the left button then
  has two meanings — see § "A button with two meanings resolves on the
  release". Ascent is the second case: a second tap on a selected number
  chooses the number below it, and the right-click does too.

**Tell:** a drag lifecycle that matches `LEFT_DRAG` specifically where
`isMouseDrag` is meant — it strands the touch player whose press was promoted.

**The detector itself is tested** ([`utils/touch.test.ts`](../src/utils/touch.test.ts)).
Read it before changing the timings — the 350 ms window, the 8 px
radius, and the second finger's *timer reset* (which makes the worst case twice
the hold time) are each asserted, and `unhandledEvent` is what stops a tap faster
than the detection round trip from losing its release.

## The board keeps the keyboard after a control

Pressing a control — any `data-command` control in the Bar, the Menu or the
Game controls — hands keyboard focus back to the interactive board view.

**The app claims a few keys above the game, and the rest reach it untouched.**
`src/puzzle/shortcuts.ts` is the one table: always-on chords
(`Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` and `Ctrl+Y` redo, `Ctrl/Cmd+S`
Check & save, `Ctrl/Cmd+K` the quick-switch), and bare `u`/`r`/`n`/`h`
behind the `oneKeyShortcuts` preference. **A bare letter is offered to the
game first and only becomes an app command if the game declines it** —
`Midend.processInput` returns false when `interpretMove` returned `null` and
left what the `Ui` shows as it was, so a game that takes `n` simply keeps it
and has to declare nothing.
The same table supplies the key drawn on a Bar slot and a Menu row, so a label
cannot come adrift from its binding (`src/puzzle/shortcuts.test.ts`).

It matters most to a keyboard player who alternates a *menu* command with play
— asking for a hint, then making its move — which is unusable without it. The normative rule is the
[`app-shell`](../openspec/specs/app-shell/spec.md) spec's "Pressing a
control gives the keyboard back to the board"; its two carve-outs are a click
that opens a menu (the menu needs the focus) and a keyboard activation of a
button (that player is in the tab order deliberately).

## The puzzle screen's three panels

The screen has three panels at every window size, each with one rule
(`app-shell`, "The puzzle screen is three panels, and every command is in
exactly one"). A porter decides nothing here: what a game is puts its controls
in the right one.

- **Bar**: the commands every game has. **Menu**: the rest. They are one
  ordered list, [`command-list.ts`](../src/puzzle/command-list.ts), cut
  once: the Bar shows its leading entries and the Menu every entry after. A
  new command is a new entry in that list, placed by how often it is used, and
  never a control added to a panel.
- **Game controls**: what the game in play brings, in
  [`components/game-controls.ts`](../src/puzzle/components/game-controls.ts).
  Its keys come from `requestKeys`, its note toggle from the key whose code is
  `PENCIL_MODE_BUTTON`, mark-all from a `markAll` hook, and Reference from a
  `reference` hook. A game that brings none of them has no panel.
  Nothing a single game has belongs in the Menu: a player does not know to
  look there for it.
- **A function every game shares is on the Bar, even where it is not a
  command.** The left/right button toggle is one: a slot of the Bar's own, at
  the end away from the `Menu` button, absent only in a game with
  `ignoresSecondaryButton`. The Game controls are for what differs from game
  to game.
- **The status line and the hint's words are in no panel.** They sit under the
  board, so showing a hint moves no control.
- **Only the Menu scrolls.** The Bar sheds trailing entries to the head of the
  Menu when it runs short, and the Game controls lay the keys out in more
  columns.

Where a panel docks is the player's layout, kept for each window shape
([`layout.ts`](../src/puzzle/layout.ts)): the grid's template is computed
from it, and a panel only names its area. No panel carries a media query, and
a new one must not start.

`puzzle-command-homes.test.ts` holds the panels to the command map in both
directions, and `layout.test.ts` enumerates every layout. Neither can see
pixels. **A change to a panel is checked in Chrome** at desktop, tablet, phone
and landscape-phone sizes: that the Bar and the Game controls report no
scroll, that pressing Hint leaves every control's rectangle where it was, and
that two presses on one point of the Menu button open and close the Menu with
the Bar's slots unmoved, docked and over the board.

A panel that opens over the board is a modal `<dialog>`, and what is outside
it is inert. Leave part of the screen in view under it by making the backdrop
clear there, never by shrinking the backdrop: a press on inert content the
backdrop does not cover reaches the document's root and not the dialog, so
"tap outside to close" (`utils/dialog.ts`) does not see it.

## Targets and verbs

**If your game is "aim at a square, and each button does something there",
declare it rather than writing it.** That is the target-verb model,
[`engine/target-verb.ts`](../src/engine/target-verb.ts): the game supplies a
**geometry** (which target a press addresses, which one the cursor rests on, how
the arrows move the cursor) and a **verb** per button — a sentence fragment for
the help and a function from `(state, target)` to the game's own `Move` or
`null`. The model owns the rest:

- a press parks the cursor, hidden, on the target it hit, so the keyboard
  carries on from where the pointer was;
- the first Enter or Space on a hidden cursor only shows it;
- Enter applies the left-click verb, Space the right-click verb (or the
  left-click verb again, when there is no second one), and a verb's own `keys`
  apply it too;
- a press on no target, or a button with no verb, is not the model's (`null`).

Declare the verbs as `Game.targetVerbs` and end `interpretMove` with
`interpretTargetVerbs(targetVerbs, …)`. Most games want
`squareGrid({ size, border })` as their geometry; a "square" there is a
tile-sized catchment, so Twiddle's block centers are a `squareGrid` whose
`border` reads the block size from the state. **Anything else the game does
with input is an arm of its own, tried first**: Unruly's digits, Range's
dotting Shift-arrows, Singles' click outside the grid, Twiddle's corner keys
and Net's Ctrl- and Shift-arrows each sit above the one-line hand-off in their
`interpretMove`. Exemplars: Light Up (verbs only), Unruly (verbs plus a digit
arm and an erase key), Net (a geometry of its own and all three verb slots).

The slots are `primary` (left, Enter), `secondary` (right, Space) and
`keyOnly` — verbs no button applies directly, such as Net's half turn on F.
**A key-only verb declares the pointer's route to what it does, and does not
typecheck without one** (`pointer: PointerRoute`, § "One pointer, two
buttons"): `repeat` a button (the half turn is two quarter turns), `cycle` a
button whose cycle passes through the result (an erase key), or press a
button in `notes` mode (Net's lock, in the middle of the square). The
Controls paragraph says the route, and `target-verb.test.ts` holds it to what
the key does, comparing the boards as the player sees them (`boardsReached`
with `bySight`), since a half turn and two quarter turns leave one picture
but different bookkeeping. **Space is always the right
button's verb.** A game that wants a different key for a verb gives the verb
`keys` (Net's lock is S); it does not remap Space.

**A target is whatever the game aims at**, and the geometry is where the game
says so: an edge between two cells (`borderGridGeometry` in
[`engine/border-grid.ts`](../src/engine/border-grid.ts), Palisade and
Separate; Dominosa's pair of numbers), a tile or a clue in the ring around the
grid (Magnets, whose keyboard reaches the clues it can mark done), a tile
drawn from a scrolled origin (Net — which is why `pointerTarget` receives the
`Ui`). The model reads only `ui.cursor.visible`; where the cursor is, and how
it moves, belongs to the geometry. A cursor position that rests on no target
(a Magnets corner is skipped; a half-grid corner is not) makes Enter do
nothing there.

A verb's `apply(state, target, ui)` sees the `Ui` for what the player owns — a
preference that swaps the buttons (Slant), a tally kept beside the board
(Mines' deaths) — and may return `UI_UPDATE` for a verb that only changes what
is shown (Black Box re-flashing a laser already fired).

**Keep the `Ui` to where the player is.** The guard walks the cursor by
comparing `Ui` digests, so a field that differs on every `newUi` (an RNG
seeded from entropy) makes every position look new and runs the walk out of
budget. State that is neither the player's position nor
read by replay belongs outside the `Ui`.

Two things follow from declaring:

- **The help's Controls paragraph is generated.** The page writes
  `{{controls}}` where it goes (`vite-plugins/controls.ts`) and adds, after it,
  only what the game does beyond its verbs. So write each verb's `does` as the
  end of "Click a square to …" — and describe the *common* case there, leaving a
  cycle's full story ("clicking again moves on round…") to the page.
- **The declaration is held to the behavior.**
  [`target-verb.test.ts`](../src/engine/target-verb.test.ts) plays every
  declaring game and asserts that Enter at every cursor position resting on a
  target reaches exactly the boards a left-click reaches, Space those of its
  verb's button, and each verb key those of its button — which is what the
  generated paragraph claims. Positions resting on no target are walked through
  but not pressed at, because what a key does there is an arm's business.
  An arm of your own that handles Enter differently from the click fails there.

**Verb semantics are functions, never flags.** Light Up's "a bulb refuses a
dotted square", Range's three-state cycle and Singles' "either button clears"
are each a line in the verb's `apply`; the model has no switch for any of them.

**Keys are declared with the model's spellings.** `letterKey("T")` is a letter
in either case, `digitKey(1)` a digit on the main row or the numpad, and
`ERASE_KEYS` is Backspace and Delete; a game writes character codes only for a
key that is none of these (and `decimal.test.ts` refuses a digit's).

**A drag game declares its click half.** Its press, drag and release stay an arm
of its own, and a click reaches it as the release of a drag that never left its
target — so that release applies `buttonVerb(targetVerbs, button)`, the verb
the released button declares, as Mines' release calls `openAt`. The press
calls `pressTarget(targetVerbs, ui, target)`, the model's own press: the cursor
parks there, hidden. Where a drag preview shows what the release
will do, the preview and the verb read one function (Tents' `clickTent` and
`clickGrass`), so the square a press shows is the one its release makes. Keys
the drag has no button for — Tents' T, N and B — are `keyOnly` verbs on a
`cycle` route. Exemplar: Tents.

**A mark can be dragged: declare `sweep`, do not write a drag.** Where a
button's verb is a mark (shade, cross, wall, flag) the player wants on several
targets, the declaration says what a target holds (`sweep.holds`, a value
`===` compares), and the model makes a drag on from a press repeat the press
on every further target that held what the pressed one held. It paints and
never toggles: the test is the value the first target had *before* its press.
The midend undoes the whole drag in one step (`joined`, in memory only), and
the Controls paragraph says the drag. Four knobs, each a fact about the
puzzle:

- `buttons`, where one button's verb is a move or a thing never wanted in a
  row (Light Up's bulb);
- `reaches(first, next)`, where a drag from one kind of target must not take
  another (Tracks: from an edge, edges only);
- `within(ds)`, **which every edge geometry needs**: an edge's catchment
  meets its neighbors' at each corner, so a drag along a wall would clip the
  edges crossing it. With a reach, an edge is taken only where the pointer
  passes near `pointAt` of it, its middle;
- `says`, where the default sentence would not describe the gesture.

A game whose own arm takes the press (a click that acts on the release, or a
drag of its own beside this one) opens the same drag with `beginSweep`,
continues it with `sweepTo` and asks `endSweep` on the release whether the
drag made a move, in which case the release is not a click. **Split two drags
by what the press lands on, and prefer what it holds to where in it the press
falls.** Tracks splits by content: a square that carries track drags
segments, any other drags square marks; a split by where in the square the
press fell made the outcome turn on a few pixels. Galaxies has no such content
to read, so a press on a line drags lines
and anywhere else is the association.
`target-verb-sweep.test.ts` plays every declaring game: a drag between two
like targets marks both, and one Undo takes it back.

**A mark outside the verbs is `dragMarkVerbs`.** A clue marked done beside
cells that take a keypad (Towers, Undead, Unequal), a mark of notes mode
(Slant; Net's is a pair of verbs written out, since its two buttons differ),
or the one button a drag game's own drag does not use (Pearl's right-button
cross): the game declares the one mark, where a press lands on it and what it
holds, exports the declaration, and opens and continues the drag with the same
three helpers. Such a declaration is no `Game` member, so no guard finds it by
itself: **add it to `drag-marks.test.ts`**, which runs the same check
(`testing/sweep-probe.ts`). That check has caught a `holds` reading the wrong
array, which typechecks and silently drags nothing.

**Which marks drag, and which do not.** A verb that is a move (rotate, slide,
fire, open) does not, and neither does a mark never wanted in a row (Light
Up's bulb): leave its button out of `buttons`. Where the drag is the game's
own gesture on that target (Rect, Bridges, Spokes, Map, Rome, Tents' left
button, Loopy's notes mode), the click stays one mark a press. **Do not write
a second paint drag beside the model's.**

**What the model is not for.** A drag game's drag is an arm of its own, and its
keyboard form of a drag (Tents' Shift-arrows, its `L`) is a design (below). A
game whose keyboard walks something other than the targets is not expressible —
measure it with `boardsReached` (`testing/input-probe.ts`) before bending the
model to it.

## Keyboard cursors

**Never restate anything `pointer.ts` exports.** Not the button codes, not the
predicates, not a locally-named copy — and not a magic number where a named
button exists (`button === 0x0209` is `CURSOR_UP` with the name hidden in a
comment, where no rename can reach it). This is enforced, not requested:
[`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) derives the
export list from `pointer.ts` itself and fails on any game-local declaration
that shadows one, so a helper added there is guarded on the day it lands.

**One cursor, one name, one field.** Every game holds its keyboard cursor as
`ui.cursor`, an [`engine/pointer.ts`](../src/engine/pointer.ts) `GridCursor`
(`x`, `y`, `visible`). Build it with `newCursor(x?, y?, visible?)` and drive it
with:

- `moveCursor(cursor, button, w, h, wrap?)` — **reveal and move in one press**,
  returning whether anything changed. `false` means a non-cursor button, or a
  clamped edge press on an already-visible cursor: return `null` rather than
  `UI_UPDATE` for a press that did nothing.
- `showCursor(cursor)` / `hideCursor(cursor)` — reveal in place (a select press,
  or an arrow the game treats as an *action*), and hide (a pointer took over).
  Both return whether they changed anything, which is usually the `UI_UPDATE`
  answer too.

The lower-level pieces are still there for a bespoke traversal: `cursorDelta`
(button → unit delta), `isCursorMove` (the four-direction range check), and
`gridCursorMove` (the position-only clamp, `null` on a no-op).

**Do not invent a second name for any of it.** `cursor-vocabulary.test.ts`
fails the build for a cursor held anywhere but `ui.cursor`, and it finds one
*structurally* — by its shape, read off `newCursor()` — so no spelling of the
name escapes it.

What genuinely stays per-game is a *traversal* that is not a bounded grid step —
a half-grid cursor, corner-skipping, lock modes, paint-while-traversing — which
keeps its own logic (built on `cursorDelta` if that helps), and whatever the
game does *while* the cursor moves. Note the shape of that split: a game may
legitimately want the cursor to *move* differently, and to *do* something as it
moves; no game has ever wanted to *name* it differently. Tents paints the cells
it passes and Boats drags a fill, both by reading `ui.cursor` either side of a
`moveCursor` call. Palisade and Separate get their half-grid cursor through
[`engine/border-grid.ts`](../src/engine/border-grid.ts) (whose own
`moveBorderCursor` is named apart from the shared helper because a step there
crosses *half* a cell), so a sweep reading only a game's `index.ts` would
wrongly convict them of having none.

**The first arrow press reveals *and* moves, everywhere**, so a keyboard player
never spends a press on the reveal. `moveCursor` does that for you; the guard is
collection-wide, in `cursor-vocabulary.test.ts`.

The one exception, and it is a rule rather than a per-game license: **an arrow
that is itself an action still only reveals on the first press.** Pearl's
modified arrow marks a line, Range's shifted arrow dots the cells it passes, and
Sixteen's arrow *is* a slide in its locked and modified modes — a first press
must not move the board out from under a player who cannot yet see where it
would act. Each of those calls `showCursor` and returns early on that path only;
the plain arrow beside it reveals and moves like everyone else's.

**Two games keep something extra beside the cursor, and both are worth copying
rather than re-deriving.** Ascent draws a mouse hover differently from a
keyboard cursor, so it carries `cursorFromKeyboard` alongside `cursor.visible`
and reads the pair back through two named predicates (`keyboardCursor` /
`mouseCursor` in `ascent/ui.ts`). Rome's `kmode` says what the cursor is *armed
for* (move / place / pencil), never whether it is shown. In
both, the shared part is the noun and the game's part is the verb.

**`cursorFromKeyboard` is the collection's name and the collection's polarity**,
carried by Ascent and the note-taking cell games, where it decides whether an
entry keeps the highlight. Write the flag `true` when the keyboard
revealed or moved the cursor and `false` when a pointer took it over; if you want
the other reading, name a predicate for it rather than a second field.

A cursor move that changes only `Ui` returns `UI_UPDATE` (the midend redraws,
notifies, and records no history entry) — the contract is in
[`mechanics.md`](./mechanics.md).

### The keyboard equivalent of a drag is a design, not a derivation

**Budget for designing it, and expect a playtest.** This is the standing rule
behind the two sections that follow. Deriving a game's keyboard bindings from
a declared pointer-gesture table was tried and withdrawn
(`openspec/postmortems/2026-09-05-gesture-table-withdrawal.md`): these drag
games' keyboards are hand-designed and *not* what any derivation would
produce:

| Game | Pointer gesture | Keyboard, as designed |
| --- | --- | --- |
| Slide | drag a block | grab / step one cell / release — **not** slide-to-the-end, which cannot stop inside a corridor |
| Loopy | click an edge on any of eighteen tilings | walk dot to dot along the best-continuing edge, Shift to aim; an earlier travel-modifier cut was playtested and rejected |
| Galaxies | drag either end of a (tile, dot) pair | select starts a *reverse* drag, arrows pick the dot, a second select commits |
| Bridges | drag island to island | a cone search outward for the next island, plus digit-jump to a clue |
| Untangle | drag a vertex | nearest point in the arrow's ±45° cone, half-tile nudge, Tab to cycle |
| Pegs | drag a peg | select arms "jumping mode"; the next arrow performs the jump |
| Sixteen | drag a row | three cursor lock modes, in which the arrow *is* the slide |

**What *is* derivable is already derived** — `moveCursor`, `gridCursorMove` and
`cursorDelta` give every game the reveal-and-move-in-one-press cursor, and
`cursor-vocabulary.test.ts` enforces it. So the work in front of you is the part
no helper can do for you, and the two sections below are the two worked ways in.

### Giving a drag game a keyboard

**Do not model the keyboard as a second way to move; model it as a second way to
hold.** A press-and-drag game already has the whole machinery — a grab computes
what the held thing can reach, and a release turns "where it is now" into one
move. The keyboard needs no part of that rebuilt; it needs a *cursor* that can
reach the same set. Slide is the worked example
([`slide/index.ts`](../src/games/slide/index.ts)): `grabBlockAt` and
`releaseGrab` are called by the pointer arm and the cursor arm alike, so a
keyboard journey and the equivalent drag are the same move by construction
rather than by agreement.

The concrete rules that fell out, each of which had a wrong answer available:

- **Rename the drag state to what it now is.** `ui.dragging` set true by a
  keypress is false documentation, and it propagates: `FG_DRAGGING`,
  `COL_DRAGGING`. Slide's became `grabbed`/`FG_GRABBED`/`COL_GRABBED`.
- **One cell per press, not slide-to-the-end.** Sliding as far as the set allows
  is fewer presses, but it cannot stop *inside* a corridor — so it cannot reach
  every cell the drag reaches, which is the whole point of adding the keyboard.
- **Keep the cursor out of the grab.** A grab is canceled whenever the board
  moves under it (its reachable set is stale); a cursor is a position on a grid
  whose size did not change. Clearing both in one `cancelGrab` reads to a player
  as a dropped keypress.
- **A pointer press takes the board over.** Hide the cursor, and where the press
  grabs nothing, put down whatever the keyboard was holding — otherwise the grab
  survives under a pointer and the next `LEFT_DRAG` flings it.
- **Test the equality, not the new path.** Asserting the keyboard in isolation
  passes just as happily against the second movement model you were trying not
  to build. Make the same journey both ways and compare the move, the board and
  the move count.

### Giving a geometric game a keyboard

A game whose input is **per-edge on an arbitrary tiling** has no cell for a
cursor to sit on and no row or column for an arrow to step along. Loopy is the
worked example ([`loopy/cursor.ts`](../src/games/loopy/cursor.ts),
[`loopy-keyboard.test.ts`](../src/games/loopy/loopy-keyboard.test.ts));
normative: the `loopy` spec, "Loopy is playable from the keyboard alone". What
generalized:

- **Put the cursor on the thing every tiling has.** Every dot has a ring of
  incident edges, and the grid already supplies it in clockwise order
  (`GridDot.edges`). A cursor on a *face* would need "cycle its twelve sides";
  one on an *edge* would need "the edge to the right of this edge", which is
  ill-defined exactly where the game is interesting. Reach an edge as
  (dot, direction) — which is also how a player draws a loop.
- **Arrows walk, and the edge you walked is the one you act on.** A plain arrow
  moves one dot along the edge that best continues that way (nearest in angle,
  within 90° so Up never walks you down), and Enter marks the edge behind you.
  Drawing is walk-Enter-walk-Enter; undrawing is walk back and Enter. Arrows
  that *choose* an edge without moving, with a modifier for travel, were
  playtested and rejected.
- **Prove coverage under the walk, then measure the residue and cover it.**
  A walk can only choose the edge it walked, so an edge that is never the
  nearest choice from *either* endpoint is unselectable. Break ties in
  **opposite senses for opposite arrows** (Up/Right clockwise, Down/Left
  counter-clockwise): an edge tied at one end is the mirror tie for the
  opposite arrow at the other end, which resolves it the other way. The
  residue is a few edges on Penrose kite/dart (degree-5 dots at 72°), and
  **Shift+arrow aims without moving** (nearest, repeat takes the next) covers
  those. The test asserts both halves over every preset and every tiling, so
  the residue is pinned and cannot grow. Plain is *go*, Shift is *look*.
- **Reset the aim's repeat when the arrow changes or the cursor moves**, or
  the second press of a fresh direction skips an edge.
- **The cursor's shape is the game's when the noun genuinely differs.** Loopy
  holds `{ dot, edge, arrow, visible }` under `ui.cursor` — the collection's one
  *name* — rather than the engine's `GridCursor`, because its position is a dot
  index and an arrow press chooses rather than moves. `cursor-vocabulary.test.ts`
  finds cursors by the grid-cell *shape* and so does not see it; the game's own
  test guards it. Do not fake an `(x, y)` to satisfy the guard.
- **Two select keys mirror two buttons.** Enter is the left button, Space the
  right, and the erase key clears. Route all of them through the *same*
  function the pointer arm calls (`setEdge`), so autofollow applies identically.
- **Travel is free once arrows walk.** With the walk model there is no
  separate travel key and no auto-advance: walking marks nothing until Enter,
  and the cursor is already at the far end when Enter is pressed. Assert every
  dot is reachable by walking from the start dot.
- **Draw the cursor from geometry.** A disc under the dot and a halo under
  the chosen edge, each painted *beneath* what it highlights so the edge's
  state stays legible; a tier-2.5 capture on an aperiodic tiling pins where
  they land.

## Drag models

Three distinct drag shapes recur across the collection. Pick by what the
*press* decides, and keep the preview rendering concerns in
[`rendering.md`](./rendering.md) (drag previews, the `moves.ts` split,
blitter sprites).

### The accreting-paint drag

The press picks a **paint value**, the drag accretes **an arbitrary set of
cells the pointer passes over**, and the release commits them as one move.
Upstream's shape (`game_ui` carrying `dragtype` + an accreted index list) maps
to two `Ui` fields (`dragType: number`, `drag: number[]`) and a three-phase
lifecycle in `interpretMove`:

- **press** (`isMouseDown`, after bounds-check): reset, pick `dragType` by
  cycling the pressed cell's current value (left and right cycle opposite
  ways), seed `drag` with the pressed cell; return `UI_UPDATE`;
- **drag** (`isMouseDrag`, guarded by `dragType !== -1`): skip a cell already
  accreted, already the drag value, or a no-op clear; else push; `UI_UPDATE`;
- **release** (`isMouseRelease`, non-empty drag): build one move from the
  accreted cells (filtering givens), else `UI_UPDATE`.

The drag continues off the **button class**, not the exact press button, so a
touch long-press that arrived as `RIGHT_BUTTON` (§ "A touch hold arrives as
the right button") continues its own drag correctly. The renderer previews the
drag by recoloring accreted cells in the cache key — put it in the diff key
([`rendering.md`](./rendering.md) § "The tile cache and the diff key").

Exemplars: [`clusters/index.ts`](../src/games/clusters/index.ts) (the
reference); [`bricks/index.ts`](../src/games/bricks/index.ts) (confirms the
shape generalizes — a single uniform `dragType` painted across accreted cells).
**A shared skeleton was evaluated and declined**: Sticks' drag
machine differs materially (the press picks no paint value — orientation comes
from the drag *axis* via a bounding-box test; each accreted cell stores its
own re-writable value; a matching-line start flips the whole drag into a
clearing drag), so only "accrete + commit on release" is shared — too little
to fix a callback shape over. If a third
Clusters-like consumer appears, revisit against Clusters and Bricks.

One idiom Sticks added: its coordinate conversion is **truncating** division
(`Math.trunc`), not the shared `fromCoord` floor — a pointer just inside the
border maps to row/column 0, as in C.

### A line-fill drag picks a transformation

Boats' drag fills **one row or column**, and the press decides not a paint
value but a `from → to` **pair**: "every square that currently reads `from`,
in the line I drag out, becomes `to`". Four `Ui` fields carry it (`dragFrom`,
`dragTo`, anchor, current) and three rules make it behave:

- **The axis is chosen per drag event, not at the press** — whichever
  coordinate has moved *less* snaps back to the anchor, so a drag can change
  its mind about direction mid-gesture.
- **`from` is a filter, and `'*'` means "whatever is there"** — clearing to
  water with the left button widens `from` to `'*'` so one sweep flattens a
  mixed line; a filtered drag paints only matching squares, which is what
  makes "turn all my guesses in this row into water" a single gesture.
- **One predicate decides "would this fill change anything?"**
  (`fillChangesAnything`) — every arm of `interpretMove` asks the same one.
  Whether a move is a step of Undo is not the game's to decide
  ([mechanics](./mechanics.md) § "interpretMove and UI_UPDATE").

The far-edge click target is widened by one so the number row/column is a grab
handle for its line — small, and worth keeping. Because the drag continues off
the button class, a touch long-press water drag works without folding right
onto left — the correct answer for a game that genuinely uses the secondary
button. Exemplar: [`boats/index.ts`](../src/games/boats/index.ts).

### Other drag shapes

A rectangle-fill drag (Pattern), a piece drag with a sprite (Pegs, Signpost),
and a slide-follow drag (Sixteen, Slide) each keep their own lifecycle; their
*rendering* halves (preview simulation, the `moves.ts` module split, blitter
sprites, canceling a dangling drag in `changedState`) are in
[`rendering.md`](./rendering.md).

**The sprite drag is a second consistent shape, and `GridDrag` is not it.**
Pegs and Signpost independently arrived at the same three-part `Ui`: `sx`/`sy`
the **grid** anchor, `dx`/`dy` the **pixel** current position, and `dragging`.
`GridDrag`'s two ends live in one coordinate space, and here the far end is a
pointer the release does not even read — the target cell is re-derived from it.
**A third sprite drag should copy Pegs, not bend `GridDrag`**, and if one
appears, the anchor-only drag that pair wants becomes worth building. The pixel *destination* — where the
blitter saved the background — is `dragX`/`dragY` on the **draw state** in all
three sprite games (Map's floating blob included), a half-tile offset from the
pointer.

The **aim drag** picks one discrete target, not a set: `Ui` stores the
snapped aim (an octant, a tile), each drag event recomputes it and returns
`null` when it is unchanged (nothing to repaint), an aim where release
would do nothing draws no preview — the absence *is* the feedback — and
release commits **what was previewed**, not the raw release pixel (they
differ exactly on touch lift-jitter, and the player saw the preview).
Exemplars: [`inertia/index.ts`](../src/games/inertia/index.ts) (the
swipe: octant aim off the ball, walls preview nothing);
[`galaxies/index.ts`](../src/games/galaxies/index.ts) (the association
drag: snapped drop tile, preview shows the target *and* its 180° partner
because release commits both, legality shared with `executeMove` through
`moves.ts` so preview and commit cannot drift).

Either end of an aim drag can be the one that moves. Galaxies' pair is
(tile, dot), and a press picks whichever end the player put their pointer
on: press a dot and the tile follows the pointer, press a plain cell and
the *dot* does, snapping to the nearest one a release could legally take.
Downstream — the legality predicate, the preview, the commit — is written
in terms of the pair and needs no knowledge of which end moved, so the
second direction costs one `Ui` boolean and two carve-outs (the
"dragged back to where it started is a null move" test must not fire when
the target *is* the source, and there is no arrow to lift off a source
that never had one).

**An aim drag can aim a distance as well as a direction.** Sokoban's push
([`sokoban/index.ts`](../src/games/sokoban/index.ts), `aimAt`) takes its
direction from the drag's main axis off the square it started on (the player,
or a barrel, which walks the player round behind it), and its length from how
many tiles the drag reaches, clamped to how far the barrel can go, so one drag
makes a long straight push. Two things it needed that Inertia's swipe did not:

- **A drag off the board aims at nothing.** The canvas captures the pointer,
  so a drag goes on reporting positions past its edge; read as an offset from
  the player, one far outside is a long push made the moment the pointer
  slipped off. Anything outside the board clears the aim.
- **Split the meanings by where the press lands, not by how far it travels.**
  A press on the player or a barrel is only ever a drag, so it is claimed; a
  press anywhere else is only ever a tap, so it is declined and the tap acts on
  the release
  (§ "A press you do not act on must still be consumed"). A tap there walks,
  which is why walking and pushing can share the primary button at all: the
  two meanings never meet on one press.

## A button with two meanings resolves on the release

**A press that could be either a click or a drag must not act on the press.**
Galaxies' left button toggles a wall *and* starts an association drag: the
press only records where it landed, travel beyond a few pixels turns it into a
drag sourced from the press point, and a release that never traveled is the
click. Upstream puts the drag on the right button instead, which is the button
this frontend serves worst (§ "A touch hold arrives as the right button").

Two things make it work, and neither is obvious:

- **Measure the release against the press, not a `dragStarted` flag.** A
  release can arrive far from its press with no drag between that the game
  took as one (each drag event was inside the travel threshold of the last
  place it looked). A distance test rejects it for free; a flag needs the case
  spelled out.
- **Claim the press anyway** — see the next section.

**Where a game does keep a flag for it, the flag is `dragged`** (Bridges,
Rect): *set once the gesture moved off its start, so a returning drag is still
a drag and a bare click is still a click*. It is not liveness and must not be
confused with `GridDrag.live`, which a press sets immediately. Do not spell it
`aiming`: Inertia's `aiming`/`aimDir` mean the *aimed direction* of an aim
drag, which is a different thing.

**A second tap that cycles belongs on the release too.** Ascent's selected
number cycles what it offers on the squares around it (the number above, the
one below, then deselected). A press on the selected number is also how a drag
from it begins, so the cycle acts on the release, and a press on the number
already selected leaves what it offers alone, or the release could not tell
which state it was in. `ascent.test.ts` walks both the taps and the drag.

**Tents resolves by where the drag ends, not by how far it went.** Upstream's
left drag was only ever "a click at the start", so its link gesture (a drag
between a tree and the tent or empty square beside it) takes the drag only when
the two ends make that pair; a wobble between any other two squares is still the
click. One function, `dragLink`, answers "is this the gesture?" for the preview,
the release and the error feedback alike, so they cannot disagree.

## A press you do not act on must still be consumed

**Returning `null` from a press is not "nothing to repaint" — it is "I don't
want this gesture", and it costs you every drag event that would have
followed.** `view-interactive.ts` installs `pointerTracking` only
`if (consumed)`, and `Midend.processInput` reports a `null` that changed
nothing the `Ui` shows as unconsumed. A game whose press defers its decision
to the release therefore has to return `UI_UPDATE` from the press when nothing
on screen changes.

**Tell:** a drag lifecycle that looks right and is never entered — the release
arrives at the *press* coordinates (the frontend never tracked the pointer, so
no move ever updated them), which then reads as a click and does the click's
thing.

**The exception is a game with no drag at all, and there it inverts:** decline
the press deliberately, act only on the release, and the frontend's own
`else` branch hands you the release at the press point. Guess does this — a
tap on a palette swatch enters that color, a tap on a slot selects it, and
nothing carries between them — and the behavior it buys is that a press which
slides off before it lifts still acts where it started, which on a finger is
the forgiving reading. The rule above is about a press that is *deferring* to a
gesture it wants; a press with no gesture behind it should not claim anything
(§ "A button you did not act on must not be claimed"). `input-parity.test.ts`
models both halves: it asks whether the gesture *acted*, not whether the press
was consumed.

## A canceled press is the engine's

**A game never hears of a cancel, and writes nothing for one.** The browser
cancels a pointer when a scroll or a system gesture takes a touch over, and the
view cancels one when Escape is pressed with a pointer down. Either way the
view calls `Midend.cancelPress`, which puts back what the midend kept at the
press: the `Ui`, copied ([`engine/ui-snapshot.ts`](../src/engine/ui-snapshot.ts)),
and the place in the history. A move the press or its drag made is gone, the
moves ahead of it for Redo are back, and a held piece, a drag preview or a
selection is as it was. Normative: `engine-input`, "A canceled press leaves
the game as it was before the press".

**Why the engine, and not a cancel code a game handles.** A reset arm in every
`interpretMove` is wrong silently in whichever game forgets a field, and a
game that acts on the press has made its move before a cancel could reach it.
A cancel sent as a drag off the board is worse: Galaxies read it as an arrow
dropped off the board, Bridges as a bridge up or to the left, Untangle as a
point moved to the corner.

What it asks of a game:

- **Keep what a gesture changes in the `Ui` or the state**, where the engine
  puts it back. Something a press writes to the draw state, or to a variable of
  the module, outlives a cancel.
- **Keep the `Ui` copyable**: plain objects, arrays, typed arrays, `Map`,
  `Set`, and classes whose content is their own fields (`GridDrag`). `copyUi`
  refuses anything else by name at the first press, so it cannot be missed.
- **Do not test for a drag off the top left of the board as a cancel.** That
  point is only somewhere a player dragged to.

[`canceled-press.test.ts`](../src/engine/canceled-press.test.ts) presses
and cancels across every game's board, with both buttons, where it pressed and
after a drag, on the opening board and on one played on, and requires the board
and the `Ui` to be what they were (`canceledPresses` in the probe module).

## A board change under a gesture is the engine's

**A game writes nothing to end its drag when the board changes under it.**
Undo, Redo, a restart, a hint's move, Solve or a load can land with a pointer
still down: the keyboard's Undo with the mouse held, a second finger on the
Undo button. The midend ends the gesture there (`Midend.stateReplaced`),
whatever the game holds it in. The `Ui` goes back to the copy taken at the
press, so no preview is left in the frame; a declared sweep is ended; and the
drags and the release still to come reach no game. Normative: `engine-input`,
"A board change from outside the input ends the gesture in flight" and "An
ended gesture leaves the Ui as before its press".

What differs from a cancel is the history. **The moves the gesture made before
the change stay**, since the change was made of the board they left, and the
restored `Ui` is told of them through `changedState` before it is told of the
change. So a `Ui` write that `interpretMove` ties to a move, and that
`changedState` cannot rebuild from the two boards (Inertia's death tally, set
through `justMadeMove`; Black Box's error count, through `newmove`), is put
back with the rest, as a cancel puts it back.

**A move made by a key is the one board change that does not end the
gesture.** A press on a keypad game's cell selects it, and the digit typed
with that finger still down goes into it; ending the gesture would put the
highlight back where it was before the press. The engine cannot tell that
press from a drag whose preview the key has just made false, so a key's move
ends every `GridDrag` and closes the open press, and no more.

**So a `changedState` that clears a pointer drag is needed only for a key's
move**, and only where the drag is in fields of the game's own and a key can
move the board while it is held (Sokoban's arrows under a barrel drag, Slide's
and Pegs' keyboard moves). Do not write one for Undo. What else
`changedState` is for is in [`mechanics.md`](./mechanics.md) §
"changedState": a `Ui` that tracks the board, and a gesture armed from the
keyboard, which is no pointer gesture and sits armed across any number of
board changes.

[`drag-cancel.test.ts`](../src/engine/drag-cancel.test.ts) presses every
game's board with both buttons, held and dragged, changes the board under the
gesture by an Undo and by a Redo, sends the rest of it, and requires that no
move follows and that the `Ui` is the one from before the press, told of the
same boards (`changedUnder` in the probe module).

## A button you did not act on must not be claimed

**The exact mirror of the section above, and the more expensive of the two.**
Returning `UI_UPDATE` for a button you did nothing with is not free politeness:
`interpretMove`'s return value is a *claim*, and three parties read it.

1. The **input guards** ask their questions by it — keyboard reachability, the
   `ignoresSecondaryButton` biconditional, the on-screen-key sweep. A game that
   answers everything passes all of them **vacuously**, and there is nothing to
   see: the suite is green either way.
2. The **app's bare-letter shortcuts** are derived from it.
   `view-interactive.ts` raises `puzzle-key-unhandled` exactly when a game
   declines a key, which is how `u`, `r`, `n` and `h` become undo, redo, New
   game and Hint with no per-game roster ([`shortcuts.ts`](../src/puzzle/shortcuts.ts)).
   A game claiming every key takes all four away from its own players.
3. The **frontend's gesture machinery** — that is § "A press you do not act on
   must still be consumed", pulling the other way. The two together say: claim a
   *pointer* button you are deferring on, decline everything else.

**The trap, concretely.** Keyboard events arrive at `(0, 0)`, which is inside
every grid. So a board arm gated on the *coordinates* alone runs for every key
there is, and a tail that answers `UI_UPDATE` for whatever the arm touched
claims them all. Add the conjunct — `isMouseDown(button) ||
isMouseDrag(button) || isMouseRelease(button)` — to the coordinate test:
decline in the arm that knows the input is not the game's, and nowhere else.

**Why upstream does not have this problem** and you cannot copy its shape here:
upstream's midend claims `n`/`u`/`r`/`q` *above* the game, so its games never
have to decline them. This port deliberately inverts that — offer the key to the
game, act only if it declines — which needs no roster and cannot be forgotten by
a new game, but which makes an honest `null` load-bearing in a way the C never
made it.

**On writing the probe**, if you extend the guard: button codes are not
Unicode. `MOD_MASK` is `0x7000`, so a private-use code such as `0xE000`
decodes as modifier bits on another key. `UNACTIONABLE` in
[`input-parity.test.ts`](../src/engine/input-parity.test.ts) derives every
reason its codes are safe from the vocabulary itself.

## Round fractional pointer coordinates

**A game that stores pixel-space coordinates in its state must round pointer
input to integers at the boundary.** Most ports convert a pixel to a cell
index via [`fromCoord`](../src/engine/geometry.ts) (a `Math.floor`), so
this never bites. But `devicePixelRatio` scaling delivers sub-pixel
coordinates where upstream's GUI frontends handed `interpret_move` integers,
and Untangle keeps rational vertex positions whose exact-integer crossing test
throws on a fraction. It rounds at the input boundary and re-checks the
integer invariant in `executeMove` (the single drag/solve/replay/load
chokepoint), so any bypass fails loudly. Exemplar:
[`untangle/index.ts`](../src/games/untangle/index.ts)
(`placeDraggedPoint`).

## An aid extends the move, at the one place the move is built

A convenience aid that does forced work for the player — Loopy's `autofollow`
extending a click along a corridor, its `autoRuleOut` excluding the edges a new
line settles by counting — belongs in the **one function that builds the move**
(`setEdge`), folded into that move's own ops. Two properties fall out and both
matter:

- **One undo takes the whole thing back**, because there is one move, not a move
  and a tidy-up. A player who drew a line and got three exclusions gets rid of all
  four with one press.
- **Replay is unchanged**, because the ops are absolute sets rather than toggles,
  so re-applying the recorded move reproduces the same board without re-running the
  aid.

Two things to get right:

- **Read the counts through the pending ops, not off the board.** The ops are what
  make the count true, and a corridor can deliver several lines at once, so a
  helper that consults `state.lines` alone finds nothing on exactly the move that
  should trigger it.
- **A move that does more than the hint asked drops the hint plan, unless you say
  otherwise.** `hintKeepTrack`'s honest default is that an op the step did not ask
  for means the player went their own way, so with the aid on the plan would
  drop on the step the player had just taken. The allowance has to be **derived from the step's own
  move** (run the same aid over the *wanted* ops), so an extra mark the step does
  not force still counts as divergence. Guard:
  `loopy-hint.test.ts` "keeps track of a step the player took with auto rule-out on",
  which also plants an unforced exclusion and asserts it still drops the plan.

## The on-screen keypad

**Any game upstream gave a virtual keypad loses it unless the port implements
`requestKeys?(params): KeyLabel[]`** — an absent hook means an empty keypad
(correct for games upstream gave none, like Flip). On touch this panel is the
*primary* digit-entry affordance, so it is not optional for a keypad game.
Normative: the on-screen-keys requirement in
[`engine-input`](../openspec/specs/engine-input/spec.md).

- **Digit games use the shared helper.** `digitKeys(n)` in
  [`engine/key-labels.ts`](../src/engine/key-labels.ts) builds `'1'..'9'`
  then `'a','b',…` past nine, plus the clear key — whose `"Clear"` label is
  load-bearing (it is what the `puzzle-keys` icon map turns into the clear
  icon). Size `n` from params: Solo `c*r`, Keen/Towers `w`, Filling fixed `9`.
- **A game does not list the Marks key: the engine appends it.**
  `Midend.requestKeys` adds `pencilModeKey` to any game `takesNotes` recognizes,
  so a game supplies only what is its own. The Marks key is the collection's one
  way into note-taking that costs no button: the cell games also toggle the mode
  with a right-click and with Enter on the highlight, but Loopy's right button
  and held finger already rule an edge out, so a shared key is what lets a
  player learn the mode once. It sends `PENCIL_MODE_BUTTON`, which
  `toggleNoteTakingMode` handles for a note-taking cell game and which the app's
  bare `P` shortcut sends too.

  What a game still owes is that the key *acts*: the engine can put it on the
  panel, only the game can make it toggle. `pencil-mode-key.test.ts` asserts
  both, reading the keypad off the `Midend` the app renders.
- **Whether a game has a keypad is checked per game, from what its board is.**
  A board with a `pencil` array (`hasPencilArray`, the board arm of
  `takesNotes`) writes its notes by typing a symbol, so it must offer a keypad;
  a game that offers one *without* such an array is named in
  `input-parity.test.ts`'s `KEYPAD_WITHOUT_PENCIL` with the reason touch play
  needs it (Filling, whose numbers are only ever typed). The check is a
  biconditional, so adding a keypad to a game with no pencil array fails until
  the game is ledgered.
- **Clear and Backspace are one key.** The panel's Clear sends `CLEAR_BUTTON`
  (8) and the keyboard's Backspace sends `DELETE` (127), so test for
  `isEraseKey`, never for the panel's code. The inert-key case presses
  Backspace wherever a panel offers Clear.
- **Put a game's markable elements on the panel, wherever they are an
  enumerable per-cell set.** Select a cell, tap a value, and in notes mode the
  same key toggles it as a mark. A game whose notes can only be *dragged*
  makes a player learn the same job twice. Rome's panel is four arrow keys
  plus Clear, sending the character codes its typed entry already answers, so
  the keys cost no new input path. What follows from it:

  - **A panel key enters at the keyboard cursor, so a tap must be able to
    place one.** A touch player has no arrow keys. **Check this before adding
    a keypad to a drag game**: `input-parity.test.ts` presses keys with a
    cursor already placed, so it will not tell you the panel is unreachable.
    A tap that is a bare no-op (press and release on one target) is the place
    to put the selection. The exception is a key arm that acts with no cursor
    shown: Guess's fills the first empty slot of the row. Read the key arm's
    guard to see which kind of game you have.
  - **Where the element is not a character, the key is the pick-up.** Map's
    key sets `ui.dragColor` and calls the `drop` its drag calls, so notes
    mode, the refusal on a clue and "no move where nothing changes" come from
    the one function.
  - **A key that enters a color says so, with `KeyLabel.swatch`** — a palette
    index the panel paints the key in, resolved against the game's own palette
    by the frontend, so the key follows the board into dark mode. The label
    stays the character the key sends.
  - **A game with a real secondary meaning cannot buy its way out of the
    long-press trap.** `ignoresSecondaryButton` is available only to a game
    whose right button means nothing, so for a game like Guess the keypad is
    not a second way in, it is *the* reliable one.
  - **The predicate for "this release wrote nothing, so select instead" is the
    local one** — the peg already holds what the release would put there —
    never a compare of state before and after ([`mechanics.md`](./mechanics.md)
    § "interpretMove and UI_UPDATE").
  - **Where the board already draws the elements, the panel replaces that
    drawing — it does not join it.** Two surfaces for one keypress cost board
    width and buy no capability, and the moment one grows state the other has
    not got (a strike-out notation) they disagree. A drawn palette that
    *arms* a tap is worse: a tap on a slot then means "select" or "place" by
    state the player cannot see.
  - **A player's notes are a display, not a set of targets.** Guess's rule-out
    marks live in an answer row, one slot per peg with a block for every color
    still possible. A tap selects a slot as a whole and the panel keys do the
    rest: selecting an answer slot turns notes mode on and selecting a peg
    turns it off. **Size a target to a finger, not to what fits in a cell**,
    and when a cell holds several values, make the cell the target and let a
    key name the value. Draw the notes to be read at a glance: solid blocks in
    fixed places, nothing where a value is ruled out.

  **A panel key cannot be offered conditionally.** `requestKeys` takes `params`
  alone, because the panel reloads only on a param change, so there is no
  expressing "show Submit once the row is full" — and `KeyLabel` has no
  disabled state either. A key whose precondition is a board state therefore
  ships unconditionally, is **declined** when the precondition fails, and needs
  somewhere to say why (Guess's Submit key, and its status bar). A refusal that
  is merely silent is indistinguishable from a broken key.

  Such a key also strains the **inert-panel-key probe**, which primes the board
  with the panel's first key, and with a run of keys, before trying the key
  under test. If you add a key with a multi-press precondition, check that the
  probe can still reach it rather than reaching for `INERT_PANEL_KEYS` — that
  list is a finding under management, not an exemption.

  Two games remain deliberately without element keys, because their notes are
  **relational or positional rather than a value you choose**: Loopy's mark is
  *which corner* of a face or *which pair of edges*, Slant's is *which two
  adjacent squares*, and both are indicated by pointing at them — there is no
  element for a button to name.

- **The panel must not take focus.** The board listens for `keydown` on
  *itself* (`view-interactive.ts`), and `puzzle-screen`'s window-level redirect
  steps in only when `document.activeElement` is the body — so a `mousedown`
  that focused a key would leave the **physical keyboard dead** until the
  player clicked the board again. The panel
  prevents the `mousedown` default (`keepFocusOnTheBoard` in
  [`components/keys.ts`](../src/puzzle/components/keys.ts)); a command
  control has its own answer to the same hole, `puzzle-screen.ts`'s `focusBoard`. **No
  behavioral tier can see this**: every one of them calls `processInput`
  directly, so check it in the real app.
- **A sticky mode must be visible, which can cost geometry.** Acquiring
  `ui.pencilMode` also acquires the pencil-mode indicator's corner
  (`pencil-indicator-placement.test.ts`), and a game whose borders cannot hold
  the glyph grows its canvas for it with `pencilIndicatorCanvas` — on **every**
  side, so the board stays centered — then routes every drawing site through an
  `origin(ts)` and shifts `fromCoord` by the same margin. Rome (a two-pixel
  border), Map and Net (none) all did; Net's canvas also needed its margin
  painted once, since its tiles never covered anything outside the board.
- **A note on the side two squares share has one gesture set: Slant's.** A tap
  marks the side of the square it lands nearest; from the keyboard a select
  picks a square and a select on a neighbor marks the side between them, with
  Escape to let go. Net's notes follow it (Enter a wire, Space none, as its
  buttons), rather than a half-cell cursor that would give one board two
  cursors. Budget for this when giving a drag game a
  notes mode: it is a handful of lines where the geometry already funnels
  through one helper, and a sweep of the renderer where it does not.
- **Match upstream's keypad exactly — including its quirks.** Unequal is the
  cautionary case: it allows order up to 32 and switches to a **`'0'`-based**
  keypad for order ≥ 10, so it gets a bespoke `unequalKeys(order)`, not
  `digitKeys`. Guess's quirk is one key wide — its colors stop at ten and the
  tenth is `'0'`, which is what `digitOf` answers and what
  `colorKeysZeroIsTen` builds — and it lives in the engine rather than the
  game, because the digit codes are the decimal fact `decimal.test.ts` allows
  exactly one statement of. Games with explicit labels (Undead's
  Ghost/Vampire/Zombie) carry those strings verbatim.

  **A quirk that only shows up past the default params is the dangerous kind.**
  `input-parity.test.ts` sweeps a game's keypad at its **default** params, so a
  wrong tenth key in a game whose presets stop at six or eight is inert only for
  the player who opened the Custom dialog, and nothing catches it. Pin the
  `KeyLabel[]` at the widest params the game admits, and at the width *below*
  the rollover too: the keypad carries its clear key after the values, so
  "rewrite the tenth entry" and "rewrite the tenth value" are different
  statements and the first one eats Clear at nine.
- **The hook takes `params` only.** The keypad does not vary with play and the
  panel reloads only on param change — don't thread state or ui through it.
- **Test it tier-1.** Pin the returned `KeyLabel[]` for representative params
  in the game's test file; assert the `digitKeys` rollover and any per-game
  quirk.
- **Every key you offer must reach you.** `input-parity.test.ts` sweeps each
  returned button over a real board and fails on one `interpretMove` never
  consumes — the *reverse* of the emittable-key scan, and the difference between
  "the wiring is connected" and "the input is reachable". A dead panel key is not
  a cosmetic surplus: on touch this panel is the only way to type, so it is a
  control that does nothing when pressed.
- **Size the panel to the boards you generate, not to the format — and
  *derive* the bound rather than writing it.** Seismic is the worked example
  ([`seismic/generator.ts`](../src/games/seismic/generator.ts)
  `maxGeneratedRegionSize`): its format admits digits to 9 but its generator
  makes smaller regions, and entry is capped at the cell's region size, so a
  `1`–`9` panel would carry keys inert on every board anybody plays. The
  keypad reads a bound *computed from the distribution* (`Math.max(...)` over
  the array, never a restated number), and the structural test asserts every
  generated region fits it. `requestKeys`
  takes params and cannot see the board, so this is a judgment made once — make
  it a derived one, and pin the resulting `KeyLabel[]` so widening the
  distribution *fails a test* rather than silently widening the panel.

Exemplars: `solo`, `keen`, `towers`, `unequal`, `filling` and Undead.

## Checklist

- [ ] A game whose input is targets and verbs declares `targetVerbs` and hands
      its buttons to `interpretTargetVerbs`, and its help page writes
      `{{controls}}` (§ "Targets and verbs").
- [ ] Every action reachable with the two buttons alone, clicks and drags, with
      no key held (§ "One pointer, two buttons").
- [ ] A hinted game's `hintGesture` aims with the same pixel helpers the
      renderer places things with, and a target-verb geometry's `pointAt`
      inverts its `pointerTarget` (`hints.md` § "Every step is a gesture").
- [ ] No binding on `MOD_NUM_KEYPAD | …` or a bare character literal without
      checking what `puzzleKeyMap` delivers; bare digits accepted where the
      keypad was a route to an input.
- [ ] No control code compared bare — including inside a `switch (button)`.
      `isEraseKey` / `isCancelKey`, or both `case` labels.
- [ ] No digit code spelled out — `digitOf(button)`, with the bound and the
      meaning of `0` written beside it in the game's own terms.
- [ ] Press-and-drag gestures survive a 350 ms hold — declare
      `ignoresSecondaryButton` if the secondary button means nothing to you, else
      fold to primary or key the drag off the button class.
- [ ] A keyboard-only player can play to completion — not merely move a cursor —
      or the exemption is recorded with its reason, in the spec.
- [ ] Keypad games implement `requestKeys`, pin it tier-1, and offer no key the
      game cannot accept on a board it generates.
- [ ] Pointer coordinates rounded at the boundary if state stores pixels.
- [ ] Every arm that acts on a pointer *position* also checks the button is a
      pointer button — keys arrive at `(0, 0)`, inside your grid — so a button
      you did not act on comes back `null`.
