# Input: pointer, keyboard, touch

How a game receives a pointer, a finger, a key and the on-screen keypad, and
what this frontend does that upstream's did not. It rests on the specs
[`engine-input`](../openspec/specs/engine-input/spec.md) (touch equivalence,
on-screen keys, the keyboard cursor, targets and verbs),
[`ts-engine`](../openspec/specs/ts-engine/spec.md) (the `Game` interface) and
[`app-shell`](../openspec/specs/app-shell/spec.md) (focus, the panels). The
`interpretMove` / `executeMove` contract and `UI_UPDATE` are in
[`mechanics.md`](./mechanics.md), a drag's preview and its blitter in
[`rendering.md`](./rendering.md), and the helper inventory in
[`engine-catalog.md`](./engine-catalog.md).

## What every game does

The skeleton's [`index.ts`](../src/skeleton/grid/index.ts) does each of these
already; a copy changes the verbs and keeps the shape.

1. Import every button code, predicate and cursor helper from
   [`engine/pointer.ts`](../src/engine/pointer.ts), and declare none
   (§ "Button codes and a key held with Shift").
2. Hold the keyboard cursor as `ui.cursor`, built by `newCursor()` in `newUi`
   (§ "Keyboard cursors").
3. Declare the input as `targetVerbs`: a geometry (`squareGrid`), a `primary`
   and a `secondary` verb, each key-only verb with its `pointer` route, and a
   `sweep` where a mark is wanted on several squares (§ "Targets and verbs").
4. Set `Game.targetVerbs` and end `interpretMove` with
   `interpretTargetVerbs(targetVerbs, …)`. Input beyond the verbs is an arm
   above that line, which tests that the button is a pointer button before it
   reads a position, and answers `null` for a button it did not act on
   (§ "A button you did not act on must not be claimed").
5. Write `{{controls}}` in [`help.md`](../src/skeleton/grid/help.md) where the
   Controls paragraph goes, and after it only what the game does beyond its
   verbs.
6. Build `hintGesture` from the same verbs with `verbClicks`
   (`hints.md` § "Every step is a gesture").
7. Make every action reachable with the two buttons alone, clicks and drags,
   and from the keyboard alone, to completion (§ "One pointer, two buttons",
   § "The input-parity bar").
8. Declare `Game.ignoresSecondaryButton` exactly when the right button has
   no action of its own (§ "A touch hold arrives as the right button").
9. Run the app with a finger-sized pointer and with the keyboard alone.

Then take from the table what the game has beyond this: a drag, typed
values, keys of its own, pixel coordinates in its state.

## Sections

| Section | Read it when |
| --- | --- |
| Button codes and a key held with Shift | your `interpretMove` compares `button` with anything, or gives a shifted key a meaning |
| An upstream editor-only key is not wired | upstream's `interpret_move` has a branch under `#ifdef EDITOR` |
| The input-parity bar | a cross-game input guard failed on your game, or one input mode cannot finish a board |
| Writing or extending an input probe | you write or change a cross-game input guard |
| The numeric keypad never arrives | your game binds a numpad key, or compares `button` with a character literal |
| – An erase or cancel key | your game answers Backspace, Delete, Clear or Escape, in a verb or in an arm of its own |
| – A digit key | your game answers a digit, or uses the numpad as a direction pad |
| One pointer, two buttons | upstream used the middle button, a modifier with a click, or a touch-only behavior; or an action has no button to spare |
| A touch hold arrives as the right button | your game has a press-and-drag gesture, or you decide what the right button means |
| The board keeps the keyboard after a control | you work on the app shell, not on a game, and add or change a control of the Bar, the Menu or the Game controls |
| The app's shortcut keys | your game binds `u`, `r`, `n`, `h` or `p`, or you add an app shortcut |
| The puzzle screen's three panels | you work on the app shell, not on a game, and add a command, a control or a panel; or you ask which hook of a game puts a control on the screen |
| Targets and verbs | your game is "aim at a target, and each button does something there" |
| – A key-only verb and its pointer route | a key does something no single click does |
| – A target that is not a grid square | the player aims at an edge, a clue, a block or a scrolled tile |
| – A move picked in parts | a move takes several presses, each picking one part of it |
| – A drag game declares its click half | your game has a drag of its own and a click beside it |
| – A mark that drags is a sweep | a button's verb is a mark the player wants on several targets |
| – A mark outside the verbs that drags | a clue marked done, a notes-mode mark, or the one button your own drag leaves free |
| Keyboard cursors | your game has a keyboard cursor, or an arrow key that acts |
| – The keyboard equivalent of a drag is a design, not a derivation | you plan the keyboard of a game played by dragging |
| – Giving a drag game a keyboard | a grab, drag and release needs a keyboard form |
| – Giving a geometric game a keyboard | the input is per edge on a tiling with no rows or columns |
| Drag models | your game has a drag and you choose its shape |
| – The line drag | the player draws lines along the edges between squares by dragging through them |
| – The accreting-paint drag | a press picks a value and the drag paints the cells it passes |
| – A line-fill drag picks a transformation | a drag fills one row or column |
| – A sprite drag | a piece follows the pointer |
| – The aim drag | a drag picks one target or one direction, and the release commits it |
| A button with two meanings resolves on the release | one button is both a click and a drag, or a second tap cycles |
| A press you do not act on must still be consumed | a press defers its decision to the drag or the release |
| A canceled press is the engine's | you are about to handle a canceled pointer or Escape during a press |
| A board change under a gesture is the engine's | you are about to write a `changedState` that clears a drag |
| A button you did not act on must not be claimed | your `interpretMove` has an arm gated on coordinates, or a tail that answers `UI_UPDATE` |
| Round fractional pointer coordinates | your state stores pixel-space coordinates |
| An aid extends the move, at the one place the move is built | a preference makes a click do forced work for the player |
| The on-screen keypad | your game types values, or upstream gave it a virtual keypad |
| – Elements on the panel of a drag or click game | a game's markable values are an enumerable per-cell set and are not typed yet |
| – A key whose precondition is a board state | a panel key is valid only in some positions |
| – A keypad that changes past the default params | the keys differ at a size no preset reaches, or upstream's keypad has a quirk |
| – Size the panel to the boards you generate | the format admits values the generator never makes |
| – A notes mode added to a game | your game gains `ui.pencilMode`, or a note on the side two squares share |

## Button codes and a key held with Shift

Take every button code, class predicate and modifier mask from
[`engine/pointer.ts`](../src/engine/pointer.ts), and never restate one: no
local `const MOD_MASK`, no renamed copy, no magic number where a named button
exists (`0x0209` for `CURSOR_UP`). The module exports `LEFT_BUTTON` to
`CURSOR_SELECT2`, `isMouseDown` / `isMouseDrag` / `isMouseRelease`, the
`MOD_*` masks and `stripModifiers`.
[`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) derives the
export list from the module and fails on a game-local declaration that shadows
one.

A press reaches a game from `puzzle/components/view-interactive.ts`, through
the worker, as `Midend.processInput` calling `interpretMove`. A key arrives as
a bare character code from the view's `puzzleKeyMap`.

**Shift on a key is yours to read, and you need not strip it.** A key held
with Shift arrives with `MOD_SHFT` set, a capital letter included. If the game
declines it, the midend offers the same key again without Shift
(`withoutShift`), so `button === 'D'` matches. Shift with an arrow is a
gesture, and declining it is final. A game that gives a shifted key its own
meaning answers the first offer. Ctrl and the keypad bit are not taken off.

## An upstream editor-only key is not wired

Do not map a move letter upstream guards behind `#ifdef EDITOR`. Say so in the
change's `design.md`, so it is not decided again.

## The input-parity bar

**A game is played to completion by mouse, by touch and by keyboard.** A game
where one mode cannot finish a board has a defect, or an exemption recorded
with its reason in the game's spec. Normative: `engine-input`, "Keyboard
reachability is a recorded decision for every game".

These guards read the live registry through a real `Midend`, so a game joins
each by being registered. The section named says what the game owes.

| Guard | What it holds |
| --- | --- |
| [`view-interactive.test.ts`](../src/puzzle/components/view-interactive.test.ts) | a finger and a mouse send the same codes; a held key or the middle button changes nothing (§ "One pointer, two buttons") |
| [`input-parity.test.ts`](../src/engine/input-parity.test.ts) | the `ignoresSecondaryButton` biconditional (§ "A touch hold arrives as the right button"); that a keyboard-only sequence commits a move, not merely moves a cursor; that every on-screen key reaches the game (§ "The on-screen keypad"); that a game declines a button it did not act on |
| [`shortcuts.test.ts`](../src/puzzle/shortcuts.test.ts) | every bare letter the app binds still reaches the app (§ "The app's shortcut keys") |
| [`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) | no game tests a code the frontend cannot send (§ "The numeric keypad never arrives") |
| [`canceled-press.test.ts`](../src/engine/canceled-press.test.ts) | a canceled press leaves the board and the `Ui` as they were (§ "A canceled press is the engine's") |
| [`drag-cancel.test.ts`](../src/engine/drag-cancel.test.ts) | a gesture ends when the board changes under it (§ "A board change under a gesture is the engine's") |
| [`input-answers.test.ts`](../src/engine/input-answers.test.ts) | what each answer of `interpretMove` leaves behind ([`mechanics.md`](./mechanics.md) § "interpretMove and UI_UPDATE") |
| [`modifier-arrow.test.ts`](../src/engine/modifier-arrow.test.ts) | Shift or Ctrl with an arrow and with its opposite never change the board alike |
| [`hint-gesture.test.ts`](../src/engine/hint-gesture.test.ts) | every hint step is played through `interpretMove` by the gesture `hintGesture` gives ([`hints.md`](./hints.md) § "Every step is a gesture") |

**Take a modified arrow's direction from the key (`cursorDelta`), never from
where the clamped cursor ended up**, which is right everywhere but the far
edge. `modifier-arrow.test.ts` reads the board, so a game whose cursor travels
with the move tests that itself.

No guard says whether a gesture is usable: a hit target large enough for a
fingertip, a cursor the player can see, a panel that offers the keys the game
wants. Check those in the browser.

## Writing or extending an input probe

Take the probe from
[`engine/testing/input-probe.ts`](../src/engine/testing/input-probe.ts) and do
not write a second one. It holds the board builder, the probe grid and the
questions the guards ask, so two guards cannot drift apart.

- **Never convict a game because the board did not change.** An eraser has
  nothing to erase on a fresh board, and a Clear key on an empty cell is a
  legitimate no-op. A change is a sufficient sign that an input means
  something; report a game as meaningless only when it is invisible under
  every observation (`secondaryAction`).
- **Never credit a game because it consumed the input.** Consuming
  `RIGHT_BUTTON` with a bare repaint is not a meaning: ask what the player
  can perceive, now or after the next input, in the frame or the save.
- **Button codes are not Unicode.** `MOD_MASK` is `0x7000`, so a private-use
  code such as `0xE000` decodes as modifier bits on another key. Take a code
  no game acts on from `UNACTIONABLE` in
  [`input-parity.test.ts`](../src/engine/input-parity.test.ts), which derives
  why each is safe from the vocabulary.

## The numeric keypad never arrives

**A keypad binding is never the only route to an input: bind the bare digits
too.** `MOD_NUM_KEYPAD | '7'` does fire, but only with Num Lock on. With it
off the key is `Home`, which `puzzleKeyMap` does not carry, and a laptop may
have no numpad. Where the game gives those digits no other meaning, read a
bare digit as the pad's: `numpadDirection(button | MOD_NUM_KEYPAD)`. Exemplar:
[`inertia/index.ts`](../src/games/inertia/index.ts) (`keyDirection`).

The keypad bit rides a digit and nothing else. With Num Lock off the pad's 8
is the plain `CURSOR_UP` and its Enter the plain `CURSOR_SELECT`.

**Before porting a comparison of `button` with a character literal, check what
`puzzleKeyMap` delivers.** Space arrives as `CURSOR_SELECT2` and Enter as
`CURSOR_SELECT`, so `button == ' '` never matches. Accept the button this
frontend sends; keeping the literal beside it costs nothing.

[`emittable-keys.test.ts`](../src/engine/emittable-keys.test.ts) reads the
codes the frontend can produce and the codes the game sources test, and fails
on a test with no producer. The on-screen panel is a second emitter, so the
set is computed for each game: `8` reaches a game that offers `clearKey` and
no other.

### An erase or cancel key

**Never write the codes.** Test `isEraseKey(button)` (8 or 127) and
`isCancelKey(button)` (27, 8 or 127), from
[`engine/pointer.ts`](../src/engine/pointer.ts); a game with both meanings
tests them in separate branches. The keyboard sends 127 for Backspace, Delete
and Clear, never upstream's `'\b'` (8).

- **A clear that is a verb takes `keys: ERASE_KEYS`**
  ([`engine/target-verb.ts`](../src/engine/target-verb.ts)) and tests no
  button: a `keyOnly` verb whose route is `cycle`. Exemplar: the skeleton's
  [`index.ts`](../src/skeleton/grid/index.ts).
- **An arm of the game's own calls `isEraseKey` where it decides what the
  key means**, and passes the decision on, never the button. Exemplar:
  `isClear` in [`keen/index.ts`](../src/games/keen/index.ts).
- **Do not `switch` on a button that may be an erase key.** A `case` cannot
  call a predicate, so a gate that calls `isEraseKey` in front of a `switch`
  with `case 8:` alone is dead at the last step. Where a `switch` is kept, it
  spells both labels, `case BACKSPACE: case DELETE:`.
  `emittable-keys.test.ts` fails on a numeric `case` of a `switch` on the
  button.

Escape reaches a game as 27 whenever no pointer gesture is in flight
(`app-shell`, "Escape reaches the puzzle when there is no gesture to cancel").

### A digit key

**Ask `digitOf(button)` and spell no digit code.** It answers the digit `0` to
`9` a key stands for, or `null`, and reads through the modifier bits, so a
numpad digit with Num Lock on is that digit. Write the bound (`n <= w`, the
cell's region size) and the meaning of `0` (a clear, a tenth value, one more
typed digit) beside the call, in the game's own terms. A command bound to a
digit is the same call (`digit === 1`).

**Where the numpad is a direction pad, ask `numpadDirection(button)` first,
all eight directions at once**, and ask `digitOf` only when it answers `null`.
A diagonal is then never read as a digit.

[`decimal.test.ts`](../src/engine/decimal.test.ts) scans every operand of
every game source and fails on a `48`, a `0x39`, a `- 48`, a numeric `case` or
a `c >= "0"`, whatever the value is called.

## One pointer, two buttons

**A game has a left button and a right button, and nothing tells it which
device pressed them.** A tap is `LEFT_BUTTON`, a long press is `RIGHT_BUTTON`,
and a drag from either is that button's drag. Three things upstream had are
not in the vocabulary:

- **The middle button.** `MIDDLE_BUTTON`, its drag and its release are not
  exported, and the view drops a middle press.
- **A key held with a press.** A press arrives with no modifier bits. A
  modifier on a key (Shift+arrow, Ctrl+arrow) is a keyboard gesture and stays.
- **`MOD_STYLUS`.** A game has no touch-only behavior.

**Every action is reachable with the two buttons alone, clicks and drags, and
every action is reachable from the keyboard alone.** Where a third action has
no button to spare, put it in a mode the player turns on (a tap in notes mode,
a key that arms the next tap) or on the on-screen keypad. A clear rarely needs
a control: a button cycle that passes through empty reaches it, and Backspace
stays as a `keyOnly` verb whose route is `cycle`. A pointer gesture with no
key gets one the same way, such as Shift+arrow for a drag.

Inside the target-verb model the rule is structural: a `keyOnly` verb without
a `pointer` route is a type error, and its route is tested. An arm of the
game's own, handled before `interpretTargetVerbs`, is checked by nothing. Put
an action in the model whenever it fits.

## A touch hold arrives as the right button

A finger that stays within 8 px for 350 ms is delivered as `RIGHT_BUTTON`, and
its drag and release follow (`detectSecondaryButton`, `src/utils/touch.ts`).
"Press, pause to aim, then drag" is such a press, so **every press-and-drag
gesture must survive the promotion**. Choose by what the right button means:

- **Nothing of its own: declare `Game.ignoresSecondaryButton`, and test only
  the left button's codes.** The view then skips the detection and delivers
  the press at once, the bar offers no "Right click" toggle, and the midend
  hands the game a mouse's right button as the left, so a right click plays
  as a click. `input-parity.test.ts` asserts the biconditional: the flag is
  declared exactly when no secondary gesture changes anything a player can
  perceive, in the frame or the save, that the primary gesture would not,
  and a declaring game does nothing with a right button handed to it
  directly. A game never folds the right button onto the left itself. A
  pencil press through `pressNoteTakingCell` counts as an action with no
  `RIGHT_BUTTON` branch of the game's own. The flag is not upstream's
  `REQUIRE_RBUTTON` inverted: a game may use the right button without
  needing it.
- **A meaning the drag keeps: continue the drag on the button class.** Test
  `isMouseDrag` and `isMouseRelease`, not `LEFT_DRAG`, so a promoted press
  starts and finishes its own right-button drag. Exemplar:
  [`boats/index.ts`](../src/games/boats/index.ts).
- **Best: put the gesture on the left button too**, so a touch player never
  triggers the promotion. The left button then has two meanings
  (§ "A button with two meanings resolves on the release"). Exemplar:
  [`galaxies/index.ts`](../src/games/galaxies/index.ts).

The tell of a stranded touch player is a drag lifecycle that matches
`LEFT_DRAG` where `isMouseDrag` is meant.

Before changing the detector's timings, read
[`utils/touch.test.ts`](../src/utils/touch.test.ts), which asserts the window,
the radius, the second finger's timer reset and `unhandledEvent`.

## The board keeps the keyboard after a control

**A game writes nothing for this; it binds work on the app shell.** Give a
new control a `data-command`, and it hands keyboard focus back to the board
when pressed, as every control of the Bar, the Menu and the Game controls
does. The two carve-outs are a click that opens a menu, which needs the
focus, and a keyboard activation of a button, whose player is in the tab
order on purpose. Normative: `app-shell`, "Pressing a control gives the
keyboard back to the board".

## The app's shortcut keys

**A game that takes a bare letter keeps it and declares nothing.**
[`puzzle/shortcuts.ts`](../src/puzzle/shortcuts.ts) is the one table: the
chords (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl+Y`, `Ctrl/Cmd+S`,
`Ctrl/Cmd+K`) are always the app's, and bare `u`, `r`, `n` and `h` sit behind
the `oneKeyShortcuts` preference. A bare letter is offered to the game first
and becomes an app command only when the game declines it: `interpretMove`
returned `null` and left what the `Ui` shows as it was.

Add a shortcut as a row of that table. The key drawn on a Bar slot and a Menu
row comes from it, and `shortcuts.test.ts` holds the label to the binding.

## The puzzle screen's three panels

**A game places no control: what it declares puts its controls in the Game
controls panel**
([`components/game-controls.ts`](../src/puzzle/components/game-controls.ts)).
Its keys come from `requestKeys`, the note toggle from the key whose code is
`PENCIL_MODE_BUTTON`, mark-all from a `markAll` hook and Reference from a
`reference` hook. Nothing one game brings goes in the Menu.

The rest binds work on the app shell. Normative: `app-shell`, "The puzzle
screen is three panels, and every command is in exactly one", "The Bar and
the Menu are one ordered list, cut once", "The Bar carries the button toggle",
"A hint's words sit under the board", "The hint rises out of the panel under
it, and the board stands on it", "A hint's references show what they name"
and "Only the Menu scrolls".

- **Add a command as an entry of
  [`command-list.ts`](../src/puzzle/command-list.ts)**, placed by how often
  it is used, and never as a control added to a panel.
- **A function every game shares is on the Bar**, a command or not.
- **No panel carries a media query.** Where a panel docks is the player's
  layout, kept for each window shape ([`layout.ts`](../src/puzzle/layout.ts));
  a panel only names its grid area.
- **A panel over the board is a modal `<dialog>`.** To leave part of the
  screen in view, make the backdrop clear there and never shrink it: a press
  on inert content the backdrop does not cover reaches the document's root, so
  "tap outside to close" (`utils/dialog.ts`) does not see it.
- **Check a panel change in Chrome** at desktop, tablet, phone and
  landscape-phone sizes, since `puzzle-command-homes.test.ts` and
  `layout.test.ts` see no pixels: the Bar and the Game controls report no
  scroll, pressing Hint leaves every control's rectangle where it was, and
  two presses on one point of the Menu button open and close the Menu with
  the Bar's slots unmoved, docked and over the board.

## Targets and verbs

**If the game is "aim at a target, and each button does something there",
declare it and write no press handling.** Set `Game.targetVerbs` and end
`interpretMove` with `interpretTargetVerbs(targetVerbs, …)`
([`engine/target-verb.ts`](../src/engine/target-verb.ts)). The declaration is
a geometry and a verb for each button; a verb is a `does` phrase for the help
and an `apply(state, target, ui)` that returns the game's own `Move`, `null`,
or `UI_UPDATE` for a verb that only changes what is shown. Exemplars: the
skeleton's [`index.ts`](../src/skeleton/grid/index.ts);
[`lightup/index.ts`](../src/games/lightup/index.ts) (verbs only);
[`unruly/index.ts`](../src/games/unruly/index.ts) (verbs, a digit arm and an
erase key).

The model owns, and a game does not write:

- a press parks the cursor, hidden, on the target it hit;
- the first Enter or Space on a hidden cursor only shows it;
- Enter applies `primary`, Space applies `secondary` (or `primary` again where
  there is none), and a verb's own `keys` apply it;
- a press on no target, or a button with no verb, is `null`.

What a game decides:

- **Anything else the game does with input is an arm of its own, tried
  first**, above the hand-off.
- **Verb semantics are functions, never flags.** A refusal, a three-state
  cycle or "either button clears" is a line of the verb's `apply`.
- **The left button places what the puzzle is about, and the right button
  says "nothing here".** A cross, a dot or any other mark that rules a
  target out is the `secondary` verb, declared as `secondary:
  rulingOut({ … })` with the game's own words and mark, or a cycle whose
  first press makes that mark. `primary` does not typecheck with it, however
  much oftener the player makes the mark than the placement: one meaning a
  button across the collection is worth more than a click saved in one game
  (the owner's ruling, 2026-10-13, on Star Battle, which first shipped the
  other way round). Where a placement rules the crosses out, the engine's
  preference can make them for the player (`docs/mechanics.md` §
  "Preferences", `rulesOut`), and `target-verb.test.ts` holds such a game to
  a ruling-out right button.
- **Space is always the right button's verb.** A verb that wants another key
  takes `keys`; it does not remap Space.
- **Keys use the model's spellings**: `letterKey("T")` for a letter in either
  case, `digitKey(1)` for a digit on the main row or the numpad, `ERASE_KEYS`
  for Backspace and Delete. Write a character code only for a key that is none
  of these.
- **Write each `does` as the end of "Click a square to …"**, for the common
  case. The help page writes `{{controls}}` (`vite-plugins/controls.ts`) and
  adds after it only what the game does beyond its verbs, a cycle's full
  account included.
- **`apply` reads the `Ui` only for what the player owns**: a preference that
  swaps the buttons, a tally kept beside the board.
- **Keep the `Ui` to where the player is.** The guard walks the cursor by
  comparing `Ui` digests, so a field that differs on every `newUi` (an RNG
  seeded from entropy) runs the walk out of budget. State that is neither
  the player's position nor read by replay belongs outside the `Ui`.

[`target-verb.test.ts`](../src/engine/target-verb.test.ts) plays every
declaring game: at every cursor position on a target, Enter leaves the board a
left-click leaves at that target's `pointAt`, Space that of its button, each
verb key that of its button. An arm that handles Enter differently from the
click fails there, and so does one that acts on the square beside the cursor.

The model is not for a drag game's drag, nor for a keyboard that walks
something other than the targets. Measure such a game with `boardsReached`
(`testing/input-probe.ts`), naming where a press addresses what its cursor
rests on, before bending the model to it.

### A key-only verb and its pointer route

**A verb no button applies directly goes in `keyOnly`, with its `keys` and the
pointer's route to the same move.** It does not typecheck without
`pointer: PointerRoute`:

- `repeat`: the button pressed `times` times (a half turn is two quarter
  turns);
- `cycle`: a button whose cycle passes through the result (an erase key);
- `notes`: the button pressed in notes mode, at `where` on the target when the
  game reads where a press lands.

The Controls paragraph says the route, and `target-verb.test.ts` holds it to
what the key does at the same target, comparing boards as the player sees
them (`boardsReached` with `bySight`). The route is pressed at the target's
`pointAt`, so a `notes` route's `where` is that point. Exemplars: [`net/index.ts`](../src/games/net/index.ts)
(`repeat` and `notes`); the skeleton's
[`index.ts`](../src/skeleton/grid/index.ts) (`cycle`).

### A target that is not a grid square

**Say what a target is in the geometry, and nowhere else.** `squareGrid({
size, border })` serves a grid of tile-sized catchments, a block grid
included, where `border` reads the block size from the state. For anything
else write a `TargetGeometry`: `pointerTarget`, its inverse `pointAt`,
`cursorTarget`, `parkCursor` and `moveCursor`. `pointerTarget` receives the
`Ui` for a view the player scrolls.

The model reads only `ui.cursor.visible`; where the cursor is and how it moves
belong to the geometry. A cursor position that rests on no target makes Enter
do nothing there, and the guard walks through it without pressing.

Exemplars: `borderGridGeometry` in
[`engine/border-grid.ts`](../src/engine/border-grid.ts) (an edge between two
cells); [`magnets/index.ts`](../src/games/magnets/index.ts) (tiles and the
clues round them); [`net/index.ts`](../src/games/net/index.ts) (a scrolled
origin); [`numgame/index.ts`](../src/games/numgame/index.ts) (a board that
is no grid: six places and four buttons).

### A move picked in parts

**Where a move takes several presses, one verb picks a part a press**, and
holds what is picked on the `Ui` until the last part makes the move: Target's
number, operator and second number. Every board change clears what was
picked (`changedState`). The guards arm such a move with the presses before
its last, so nothing is declared for them. Two things are the game's own:

- **Its `hintGesture` taps each part**, from the selection as it stands.
  `verbClicks` needs every click to make a move the step keeps, which a click
  that only picks does not.
- **A key for a part picks the part under the cursor too** where nothing is
  picked yet, so the keyboard needs no more presses than the pointer.

Exemplar: [`numgame/index.ts`](../src/games/numgame/index.ts).

### A drag game declares its click half

**The press, drag and release stay an arm of the game's own, and the click is
declared.** A click reaches a drag game as the release of a drag that never
left its target, so that release applies `buttonVerb(targetVerbs, button)`,
and the press calls `pressTarget(targetVerbs, ui, target)`, which parks the
cursor there, hidden. Normative: `engine-input`, "A drag game's press arm goes
through the engine's verbs".

Where a drag preview shows what the release will do, the preview and the verb
read one function. A key the drag has no button for is a `keyOnly` verb on a
`cycle` route. Exemplar: [`tents/index.ts`](../src/games/tents/index.ts).

### A mark that drags is a sweep

**Where a button's verb is a mark the player wants on several targets (shade,
cross, wall, flag), declare `sweep` and write no drag.** `sweep.holds(state,
target)` says what a target holds, as a value `===` compares. A drag on from a
press then repeats the press on every further target that held what the
pressed one held before its press, so it paints and never toggles. The midend
undoes the whole drag in one step, and the Controls paragraph says the drag.

Four knobs, each a fact about the puzzle:

- `buttons`: leave a button out where its verb is a move (rotate, slide, fire,
  open) or a mark never wanted in a row;
- `reaches(first, next)`: where a drag from one kind of target must not take
  another;
- `within(ds)`: **every edge geometry needs it.** An edge's catchment meets
  its neighbors' at each corner, so without a reach a drag along a wall clips
  the edges crossing it. With one, an edge is taken only where the pointer
  passes near its middle;
- `says`: where the default sentence would not describe the gesture.

**A game whose own arm takes the press** opens the same drag with
`beginSweep`, continues it with `sweepTo`, and asks `endSweep` on the release
whether the drag made a move, in which case the release is not a click.

**Split two drags by what the press lands on, and prefer what the target holds
to where in it the press falls**, since a split by position turns on a few
pixels. Exemplar: [`tracks/index.ts`](../src/games/tracks/index.ts).

**Do not write a second paint drag beside the model's.** Where the drag is the
game's own gesture on that target, the click stays one mark a press.

[`target-verb-sweep.test.ts`](../src/engine/target-verb-sweep.test.ts) plays
every declaring game: a drag between two like targets marks both, and one Undo
takes it back.

### A mark outside the verbs that drags

**Declare it with `dragMarkVerbs`, export the declaration, and add it to
[`drag-marks.test.ts`](../src/engine/drag-marks.test.ts).** This is for a clue
marked done beside cells that take a keypad, a mark of notes mode, or the one
button a drag game's own drag does not use. The game declares the one mark,
where a press lands on it and what it holds, and drives the drag with
`beginSweep`, `sweepTo` and `endSweep`.

The declaration is no `Game` member, so no guard finds it unless it is added
to that test, which runs the sweep check (`testing/sweep-probe.ts`). A `holds`
that reads the wrong array typechecks and drags nothing. Exemplars: `clueDrag`
in [`towers/index.ts`](../src/games/towers/index.ts); `crossDrag` in
[`engine/line-drawing.ts`](../src/engine/line-drawing.ts).

## Keyboard cursors

**Hold the keyboard cursor as `ui.cursor`, a `GridCursor` (`x`, `y`,
`visible`) from [`engine/pointer.ts`](../src/engine/pointer.ts), and give
nothing about it a second name.** Build it with `newCursor(x?, y?, visible?)`.
[`cursor-vocabulary.test.ts`](../src/engine/cursor-vocabulary.test.ts) finds a
cursor by its shape, read off `newCursor()`, and fails on one held anywhere
else.

- `moveCursor(cursor, button, w, h, wrap?)` reveals and moves in one press and
  returns whether anything changed. On `false` (a non-cursor button, or a
  clamped press at the edge on a visible cursor) return `null`, not
  `UI_UPDATE`.
- `showCursor(cursor)` reveals in place, for a select press or an arrow that
  acts; `hideCursor(cursor)` hides when a pointer takes over. Each returns
  whether it changed anything, which is usually the `UI_UPDATE` answer.
- For a traversal that is not a bounded grid step (a half-grid cursor, corner
  skipping, lock modes), build on `cursorDelta` (button to unit delta),
  `isCursorMove` and `gridCursorMove` (the clamp, `null` on a no-op). A
  half-grid cursor between cells is `moveBorderCursor` in
  [`engine/border-grid.ts`](../src/engine/border-grid.ts).

A cursor move that changes only the `Ui` returns `UI_UPDATE`
([`mechanics.md`](./mechanics.md) § "interpretMove and UI_UPDATE").

**The first arrow press reveals and moves**, in every game
(`cursor-vocabulary.test.ts` presses one in each). The one exception is a
rule: **an arrow that is itself an action only reveals on the first
press**, so the board does not move under a player who cannot yet see where it
would act. That path calls `showCursor` and returns early; the plain arrow
beside it reveals and moves. Exemplar:
[`range/index.ts`](../src/games/range/index.ts), the shifted arrow.

What a game does while the cursor moves is its own: read `ui.cursor` either
side of a `moveCursor` call. Exemplar:
[`tents/index.ts`](../src/games/tents/index.ts).

**A fact kept beside the cursor is a field beside it, never a second cursor.**
`cursorFromKeyboard` is the collection's name and polarity: `true` when the
keyboard revealed or moved the cursor, `false` when a pointer took it over.
For the other reading, name a predicate and add no field. Exemplar:
`keyboardCursor` and `mouseCursor` in
[`ascent/ui.ts`](../src/games/ascent/ui.ts). A field that says what the cursor
is armed for never says whether it is shown.

### The keyboard equivalent of a drag is a design, not a derivation

**Budget for designing a drag game's keyboard, and expect a playtest.** Do not
derive the bindings from a table of the pointer's gestures: that was tried and
withdrawn (`openspec/postmortems/2026-09-05-gesture-table-withdrawal.md`), and
no shipped drag game's keyboard is what a derivation would produce. What is
derivable is the cursor itself, which `moveCursor` gives. Read the keyboard
requirements of the specs of `slide`, `loopy`, `galaxies`, `bridges`,
`untangle`, `pegs` and `sixteen` for seven designs.

### Giving a drag game a keyboard

**Model the keyboard as a second way to hold, not a second way to move.** A
drag game already computes what a grabbed thing can reach and turns a release
into one move; give the keyboard a cursor that reaches the same set, through
the same two functions the pointer arm calls. Exemplar:
[`slide/index.ts`](../src/games/slide/index.ts), `grabBlockAt` and
`releaseGrab`.

- **Name the drag state for what it now is**: `grabbed`, not a `dragging` that
  a keypress sets, and the flags and colors named after it likewise
  (`FG_GRABBED`, `COL_GRABBED`).
- **One cell a press, not slide-to-the-end**, which cannot stop inside a
  corridor and so cannot reach every cell the drag reaches.
- **Keep the cursor out of the grab.** A grab is canceled when the board moves
  under it; a cursor is a position and stays.
- **A pointer press takes the board over.** Hide the cursor, and where the
  press grabs nothing, put down what the keyboard held, or the next
  `LEFT_DRAG` moves it.
- **Test the equality, not the new path.** Make one journey both ways and
  compare the move, the board and the move count.

### Giving a geometric game a keyboard

**Where the input is per edge on a tiling with no rows or columns, put the
cursor on a dot and reach an edge as (dot, direction).** Every dot has a ring
of incident edges in clockwise order (`GridDot.edges`); a face or an edge
gives an arrow nothing well defined to step along. Exemplar:
[`loopy/cursor.ts`](../src/games/loopy/cursor.ts) and
[`loopy-keyboard.test.ts`](../src/games/loopy/loopy-keyboard.test.ts); the
`loopy` spec states the design in full, from "Loopy is playable from the
keyboard alone" on.

- **Arrows walk, and the edge walked is the one acted on.** Do not make
  arrows choose an edge without moving, with travel on a modifier.
- **Prove coverage under the walk, then measure the residue and cover it.**
  Break ties in opposite senses for opposite arrows, give what is left a
  modified arrow that aims without moving, and assert both halves over every
  preset and tiling, and that every dot is reachable by walking.
- **Reset the aim's repeat when the arrow changes or the cursor moves**, or
  the second press of a fresh direction skips an edge.
- **Hold the cursor under `ui.cursor` in the game's own shape**, and do not
  fake an `(x, y)`. `cursor-vocabulary.test.ts` does not see it, so the
  game's own test guards it.
- **Enter is the left button, Space the right, and the erase key clears**,
  through the function the pointer arm calls.
- **Draw the cursor from geometry**, beneath what it highlights, and pin
  where it lands with a capture.

## Drag models

Pick a drag's shape by what the press decides. The preview, the `moves.ts`
split, the blitter and canceling a dangling drag in `changedState` are in
[`rendering.md`](./rendering.md).

| The press decides | Shape |
| --- | --- |
| nothing more than the mark a click makes | a sweep (§ "A mark that drags is a sweep") |
| the square a line along the edges starts from | § "The line drag" |
| a paint value | § "The accreting-paint drag" |
| a `from → to` pair for one line | § "A line-fill drag picks a transformation" |
| the piece picked up | § "A sprite drag" |
| one end of a pair, or the origin of a direction | § "The aim drag" |

A rectangle-fill drag ([`pattern/index.ts`](../src/games/pattern/index.ts))
and a slide-follow drag ([`sixteen/index.ts`](../src/games/sixteen/index.ts),
[`slide/index.ts`](../src/games/slide/index.ts)) keep lifecycles of their own.

**Continue every drag on the button class** (`isMouseDrag`, `isMouseRelease`),
never on the exact press code (§ "A touch hold arrives as the right button").

### The line drag

**Where the player draws lines along the edges between squares by dragging
through them, declare `LineRules` and write no input.**
[`engine/line-drawing.ts`](../src/engine/line-drawing.ts) is the whole
input: the drag, the click on an edge, the right button's cross sweep and
the keys. Its header says what each does. A game declares three facts:

- `mark`: what an edge holds, read from the game's own state;
- `takes`: how many lines a square takes, which no drag, click or key
  exceeds;
- `loops`: whether a drag back onto its first square closes a loop.

The rules go in `moves.ts`, since `render.ts` previews the drag with
`dragPreview` from them. `lineDrawing(rules, { layout, move })` in `index.ts`
builds `interpretMove` and `crossDrag`. `move` turns the edges a release
changes into the game's own saved move, so Pearl keeps its op pairs. Export
`crossDrag` and add it to `drag-marks.test.ts`
(§ "A mark outside the verbs that drags"). Exemplars:
[`path/`](../src/games/path/) and [`pearl/`](../src/games/pearl/).

Tracks' rail drag is not this one: it commits each edge as the pointer
passes it, through the sweep, and its square drag fills one row or column.

### The accreting-paint drag

The press picks a paint value, the drag gathers the cells the pointer passes
over, and the release commits them as one move. Two `Ui` fields carry it
(`dragType: number`, `drag: number[]`). Write the three phases in
`interpretMove`; there is no shared helper, and a third game of this shape is
the time to weigh one against the two exemplars.

- **Press** (`isMouseDown`, after the bounds check): reset, pick `dragType` by
  cycling the pressed cell's value (left and right cycle opposite ways), seed
  `drag` with the pressed cell, return `UI_UPDATE`.
- **Drag** (`isMouseDrag`, guarded by `dragType !== -1`): skip a cell already
  gathered, already the drag value, or a clear that changes nothing; else push
  and return `UI_UPDATE`.
- **Release** (`isMouseRelease`, a non-empty drag): build one move from the
  gathered cells, leaving out givens; else `UI_UPDATE`.

Preview the drag by recoloring the gathered cells, and put the recoloring in
the diff key ([`rendering.md`](./rendering.md) § "The tile cache and the diff
key"). Exemplars: [`clusters/index.ts`](../src/games/clusters/index.ts);
[`bricks/index.ts`](../src/games/bricks/index.ts).

### A line-fill drag picks a transformation

The drag fills one row or column, and the press decides a `from → to` pair:
every square of the line dragged out that reads `from` becomes `to`. Four `Ui`
fields carry it (`dragFrom`, `dragTo`, the anchor, the current end). Exemplar:
[`boats/index.ts`](../src/games/boats/index.ts).

- **Choose the axis at each drag event, not at the press.** Whichever
  coordinate has moved less snaps back to the anchor, so a drag can change
  direction.
- **`from` is a filter, and `'*'` means whatever is there.** A filtered drag
  paints only matching squares; clearing widens `from` to `'*'`, so one drag
  flattens a mixed line.
- **One predicate answers "would this fill change anything?"**
  (`fillChangesAnything`), and every arm of `interpretMove` asks it. Whether a
  move is a step of Undo is not the game's to decide
  ([`mechanics.md`](./mechanics.md) § "interpretMove and UI_UPDATE").

### A sprite drag

**Copy [`pegs/index.ts`](../src/games/pegs/index.ts); do not bend `GridDrag`
to it.** The `Ui` holds `sx`/`sy`, the anchor in grid cells; `dx`/`dy`, the
pointer in pixels; and `dragging`. `GridDrag` keeps both ends in one
coordinate space, and here the release does not read the far end: it derives
the target cell from the pixel position again. The place the blitter saved the
background is `dragX`/`dragY` on the draw state, half a tile off the pointer.
Second exemplar: [`signpost/index.ts`](../src/games/signpost/index.ts). A
third sprite drag is the time to build an anchor-only drag in the engine.

### The aim drag

The drag picks one target, not a set. Keep the snapped aim (an octant, a tile)
in the `Ui` and hold to four rules:

- each drag event recomputes the aim and returns `null` when it is unchanged;
- an aim whose release would do nothing draws no preview;
- **the release commits what was previewed**, not the raw release pixel, which
  differs on a finger's lift;
- the preview and `executeMove` share one legality function (in `moves.ts`).

Exemplars: [`inertia/index.ts`](../src/games/inertia/index.ts) (an octant off
the ball); [`galaxies/index.ts`](../src/games/galaxies/index.ts) (a snapped
drop tile, either end of the pair moving).

**Where either end of a pair can be the one that moves**, write the legality,
the preview and the commit in terms of the pair. The second direction then
costs one `Ui` boolean and two carve-outs: "dragged back to where it started
is a null move" must not fire when the target is the source, and no mark is
lifted off a source that never had one.

**An aim can carry a distance as well as a direction.** Take the direction
from the drag's main axis off the square it started on, and the length from
how many tiles the drag reaches, clamped to what is legal. Exemplar: `aimAt`
in [`sokoban/index.ts`](../src/games/sokoban/index.ts). Then:

- **A drag off the board aims at nothing.** The canvas captures the pointer,
  so positions past its edge keep arriving; clear the aim for any of them.
- **Split two meanings of one button by where the press lands, not by how far
  it travels.** A press that can only be a drag is claimed; a press that can
  only be a tap is declined, and the tap acts on the release
  (§ "A press you do not act on must still be consumed").

## A button with two meanings resolves on the release

**A press that could be a click or a drag does not act on the press.** It
records where it landed and returns `UI_UPDATE` (§ "A press you do not act on
must still be consumed"). Travel beyond a few pixels makes it a drag from the
press point, and a release that never traveled is the click. Exemplar:
[`galaxies/index.ts`](../src/games/galaxies/index.ts).

- **Measure the release against the press, not against a flag.** A release can
  arrive far from its press with no drag event the game took as one. A
  distance test rejects it; a flag needs the case spelled out.
- **A flag kept for it is named `dragged`**: set once the gesture moved off
  its start, so a drag that returns is still a drag. It is not
  `GridDrag.live`, which a press sets at once, and not `aiming`, which names
  an aim drag's direction.
- **A second tap that cycles acts on the release too**, where a press on the
  selected thing also begins a drag from it. The press leaves the cycle's
  state alone, or the release could not tell which state it was in. Exemplar:
  [`ascent/index.ts`](../src/games/ascent/index.ts).
- **Where a drag was only ever "a click at its start", resolve by where it
  ends.** Take the drag only when its two ends make the gesture's pair, and
  let one function answer "is this the gesture?" for the preview, the release
  and the error feedback. Exemplar: `dragLink` in
  [`tents/index.ts`](../src/games/tents/index.ts).

## A press you do not act on must still be consumed

**A press that defers its decision to the drag or the release returns
`UI_UPDATE`, even when nothing on screen changes.** A `null` from a press
means "I do not want this gesture": `view-interactive.ts` tracks the pointer
only for a consumed press, so no drag event follows.

The tell is a drag lifecycle that looks right and is never entered: the
release arrives at the press coordinates and does the click's thing.

**A game with no drag at all inverts it.** Decline the press, act on the
release, and the frontend hands over the release at the press point, so a
press that slides off before it lifts still acts where it started. Exemplar:
[`guess/index.ts`](../src/games/guess/index.ts). A press with no gesture
behind it claims nothing (§ "A button you did not act on must not be
claimed").

## A canceled press is the engine's

**Write nothing for a cancel.** When the browser cancels a pointer, or Escape
is pressed with a pointer down, `Midend.cancelPress` puts back the `Ui` it
copied at the press ([`engine/ui-snapshot.ts`](../src/engine/ui-snapshot.ts))
and the place in the history. Normative: `engine-input`, "A canceled press
leaves the game as it was before the press".

What it asks of a game:

- **Keep what a gesture changes in the `Ui` or the state.** What a press
  writes to the draw state or to a module variable outlives a cancel.
- **Keep the `Ui` copyable**: plain objects, arrays, typed arrays, `Map`,
  `Set`, and classes whose content is their own fields (`GridDrag`). `copyUi`
  refuses anything else by name at the first press.
- **Do not read a drag off the top left of the board as a cancel.** It is only
  somewhere a player dragged to.

Guard: [`canceled-press.test.ts`](../src/engine/canceled-press.test.ts).

## A board change under a gesture is the engine's

**Write nothing to end a drag when Undo, Redo, a restart, a hint's move, Solve
or a load lands with a pointer down.** `Midend.stateReplaced` ends the
gesture: the `Ui` goes back to the copy taken at the press, a declared sweep
is ended, and the drags and the release still to come reach no game.
Normative: `engine-input`, "A board change from outside the input ends the
gesture in flight" and "An ended gesture leaves the Ui as before its press".

The moves the gesture made before the change stay, and the restored `Ui` is
told of them through `changedState` before it is told of the change. So a `Ui`
write that `interpretMove` ties to a move, and that `changedState` cannot
rebuild from the two boards (a tally), is put back with the rest.

**A move made by a key does not end the gesture**, so that a digit typed with
a finger still down on a cell goes into it. A key's move ends every `GridDrag`
and closes the open press, and no more. So **write a `changedState` that
clears a pointer drag only for a key's move**, and only where the drag is in
fields of the game's own and a key can move the board while it is held.
Exemplar: [`sokoban/index.ts`](../src/games/sokoban/index.ts). Do not write
one for Undo. What else `changedState` is for is in
[`mechanics.md`](./mechanics.md) § "changedState".

Guard: [`drag-cancel.test.ts`](../src/engine/drag-cancel.test.ts).

## A button you did not act on must not be claimed

**Return `null` for every button the game did nothing with.** Claim a pointer
button the game is deferring on (§ "A press you do not act on must still be
consumed"), and decline everything else. A button the game gives no meaning
is not consumed merely by repainting: answering `UI_UPDATE` to
`RIGHT_BUTTON` gives it none, and the game still owes
`ignoresSecondaryButton` (§ "A touch hold arrives as the right button").
Normative: `engine-input`, "A game declines a button it did not act on". Two
parties read the answer:

- the input guards ask their questions by it, and a game that answers
  everything passes all of them vacuously;
- the app's bare-letter shortcuts are derived from it:
  `view-interactive.ts` raises `puzzle-key-unhandled` when a game declines a
  key, so a game that claims every key takes `u`, `r`, `n` and `h` from its
  players.

**A keyboard event arrives at `(0, 0)`, which is inside every grid.** An arm
gated on the coordinates alone therefore runs for every key. Add `isMouseDown(
button) || isMouseDrag(button) || isMouseRelease(button)` to the coordinate
test, and decline in the arm that knows the input is not the game's.

Upstream's shape cannot be copied here: its midend claims `n`, `u`, `r` and
`q` above the game, so its games never decline them.

## Round fractional pointer coordinates

**A game that stores pixel-space coordinates in its state rounds pointer input
to integers at the boundary.** `devicePixelRatio` scaling delivers sub-pixel
coordinates. A game that converts a pixel to a cell with
[`fromCoord`](../src/engine/geometry.ts) is unaffected. Check the integer
invariant again in `executeMove`, the one place a drag, a solve, a replay and
a load all pass, so a bypass fails loudly. Exemplar: `placeDraggedPoint` in
[`untangle/index.ts`](../src/games/untangle/index.ts).

## An aid extends the move, at the one place the move is built

**An aid that does forced work for the player is folded into the ops of the
move it extends, in the one function that builds the move.** One Undo then
takes the whole thing back, and replay is unchanged, provided the ops are
absolute sets and not toggles. Exemplar: `setEdge` in
[`loopy/index.ts`](../src/games/loopy/index.ts), with its `autofollow` and
`autoRuleOut`.

- **Read the counts through the pending ops, not off the board.** One click
  can deliver several marks, and a helper that reads the state alone finds
  nothing on the move that should trigger it.
- **Derive the hint's allowance from the step's own move.** `hintKeepTrack`
  drops the plan on an op the step did not ask for, so with the aid on it
  would drop on the step just taken. Run the same aid over the step's wanted
  ops and allow exactly that, so an extra mark the step does not force still
  counts as going another way. Guard to copy: `loopy-hint.test.ts`, "keeps
  track of a step the player took with auto rule-out on".

## The on-screen keypad

**A game that types values implements `requestKeys(params): KeyLabel[]`.** An
absent hook is an empty keypad, and on touch the panel is the only way to
type. Normative: the on-screen-keys requirements of
[`engine-input`](../openspec/specs/engine-input/spec.md). Exemplars:
[`solo/index.ts`](../src/games/solo/index.ts),
[`keen/index.ts`](../src/games/keen/index.ts),
[`undead/index.ts`](../src/games/undead/index.ts) (keys with word labels).

- **Build digits with `digitKeys(n)`** from
  [`engine/key-labels.ts`](../src/engine/key-labels.ts): `'1'` to `'9'`, then
  `'a'`, `'b'` and on, then `clearKey`. Size `n` from the params. The label
  `"Clear"` is what the panel turns into the clear icon, so do not reword it.
- **Do not list the Marks key.** `Midend.requestKeys` appends `pencilModeKey`
  for any game `takesNotes` recognizes. The game owes that the key acts: it
  sends `PENCIL_MODE_BUTTON`, as the app's bare `P` shortcut does, and
  `toggleNoteTakingMode` handles it for a note-taking cell game.
  `pencil-mode-key.test.ts` asserts both.
- **A board with a `pencil` array offers a keypad, and no other game does
  without a ledger entry.** `input-parity.test.ts` holds the biconditional
  (`hasPencilArray`); a keypad on a game with no such array is named in
  `KEYPAD_WITHOUT_PENCIL` with the reason touch play needs it.
- **Test `isEraseKey`, never the panel's code.** The panel's Clear sends
  `CLEAR_BUTTON` (8) and the keyboard's Backspace sends `DELETE` (127).
- **The hook takes `params` only.** The panel reloads only on a param change,
  so thread no state or `Ui` through it.
- **Every key offered must reach the game.** `input-parity.test.ts` sends each
  returned button over a real board and fails on one `interpretMove` never
  consumes.
- **Pin the returned `KeyLabel[]` in the game's test file**, tier 1, for
  representative params: the `digitKeys` rollover and any quirk.
- **Write nothing to keep focus on the board.** The panel prevents the
  `mousedown` default (`keepFocusOnTheBoard` in
  [`components/keys.ts`](../src/puzzle/components/keys.ts)). No behavioral
  test sees focus, since each calls `processInput` directly, so a change to
  the panel is checked in the app: press a key, then type on the physical
  keyboard.

### Elements on the panel of a drag or click game

**Put a game's markable elements on the panel wherever they are an enumerable
per-cell set**: select a cell, tap a value, and in notes mode the same key
toggles it as a mark. Send the character codes typed entry already answers, so
the keys cost no input path. Exemplars:
[`rome/index.ts`](../src/games/rome/index.ts),
[`map/index.ts`](../src/games/map/index.ts),
[`guess/index.ts`](../src/games/guess/index.ts).

- **A panel key enters at the keyboard cursor, so a tap must be able to place
  one.** Put the selection on a tap that is otherwise a no-op (press and
  release on one target). `input-parity.test.ts` presses keys with a cursor
  already placed and does not show an unreachable panel. The exception is a
  key arm that acts with no cursor shown; read the arm's guard to see which
  the game has.
- **Decide "this release wrote nothing, so select" by the local predicate**
  (the target already holds what the release would put there), never by
  comparing the state before and after ([`mechanics.md`](./mechanics.md)
  § "interpretMove and UI_UPDATE").
- **Where the element is not a character, the key is the pick-up**: it sets
  what the drag carries and calls the drop the drag calls, so notes mode and
  every refusal come from one function.
- **A key that enters a color says so with `KeyLabel.swatch`**, a palette
  index the frontend resolves against the game's palette. The label stays the
  character the key sends. Build the keys with `colorKeys`.
- **The panel replaces a palette drawn on the board; it does not join it.**
  Two surfaces for one keypress cost board width and disagree once one grows
  state. A drawn palette that arms a tap makes a tap mean "select" or "place"
  by state the player cannot see.
- **A player's notes are a display, not a set of targets.** Size a target to a
  finger: where a cell holds several values, the cell is the target and a key
  names the value. Draw the notes as solid blocks in fixed places, with
  nothing where a value is ruled out.
- **A game with a real secondary meaning cannot declare
  `ignoresSecondaryButton`**, so for it the keypad is the reliable way in on
  touch.
- **Offer no element keys where a note is relational or positional**: which
  corner, which pair of edges, which two adjacent squares. Those are pointed
  at, and no key can name one.

### A key whose precondition is a board state

**Offer the key always, decline it when the precondition fails, and say why
somewhere the player sees** (the status bar). `requestKeys` cannot offer a key
conditionally and `KeyLabel` has no disabled state, and a silent refusal reads
as a broken key. Exemplar: the Submit key of
[`guess/index.ts`](../src/games/guess/index.ts).

The inert-panel-key probe of `input-parity.test.ts` primes the board with the
panel's first key, and with a run of keys, before it tries the key under test.
For a key with a precondition of several presses, make the probe reach it; do
not add the key to `INERT_PANEL_KEYS`, which lists findings and exempts
nothing.

### A keypad that changes past the default params

**Match upstream's keypad exactly, quirks included, and pin it at the widest
params the game admits and at the width below each rollover.**
`input-parity.test.ts` reads the keypad at the default params only. The clear
key follows the values, so "rewrite the tenth entry" and "rewrite the tenth
value" differ, and the first replaces Clear at nine.

A quirk of the game's own gets a builder of the game's own (`unequalKeys` in
[`unequal/index.ts`](../src/games/unequal/index.ts)). A quirk that is a fact
about the digits lives in the engine (`colorKeysZeroIsTen`), because
`decimal.test.ts` allows one statement of the digit codes. Explicit labels are
carried word for word.

### Size the panel to the boards you generate

**Offer no key that is inert on every board the generator makes, and derive
the bound: do not write it.** Compute it from the generator's distribution
(`Math.max(...)` over the array), assert in a structural test that every
generated board fits it, and pin the `KeyLabel[]`, so widening the
distribution fails a test. Exemplar: `maxGeneratedRegionSize` in
[`seismic/generator.ts`](../src/games/seismic/generator.ts).

### A notes mode added to a game

**A sticky mode is visible, and that can cost geometry.** A game that gains
`ui.pencilMode` gains the pencil-mode indicator's corner
(`pencil-indicator-placement.test.ts`). Where the borders cannot hold the
glyph, grow the canvas with `pencilIndicatorCanvas`, on every side so the
board stays centered, route every drawing site through an `origin(ts)`, and
shift `fromCoord` by the same margin. A game whose tiles never painted outside
the board paints the new margin once. Exemplar:
[`rome/render.ts`](../src/games/rome/render.ts).

**A note on the side two squares share has one gesture set.** A tap marks the
side of the square it lands nearest. From the keyboard a select picks a
square, a select on a neighbor marks the side between them, and Escape lets
go. Do not give the board a second, half-cell cursor for it. Exemplars:
[`slant/index.ts`](../src/games/slant/index.ts),
[`net/index.ts`](../src/games/net/index.ts).
