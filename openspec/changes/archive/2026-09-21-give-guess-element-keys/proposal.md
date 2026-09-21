# give-guess-element-keys

## Why

**Guess was the last game whose elements were enumerable and off the panel.**
`give-rome-its-element-keypad` established the rule and `give-map-element-keys`
extended it to a game whose element is a *color*; both left Guess open, because
Guess is a different shape — it has no notes, and it draws a palette column on
the board that a keypad would sit beside.

The owner's goal is the one that settled Map (2026-09-21): *"make the UX as
consistent and unsurprising as we can make it, across games."* Guess's elements
are its colors, they are enumerable, the keyboard already answers a digit for
each of them, and the panel is where the collection puts them. So Guess joins
the rule.

**Touch is where it bites.** A peg could be placed only by pressing on the
board's palette and releasing over a slot, and that gesture is *fragile on a
finger by construction*: `detectSecondaryButton` promotes a press that stays
within 8 px for 350 ms to `RIGHT_BUTTON`, and Guess's `interpretMove` answers
`RIGHT_BUTTON` nowhere but a current-row peg — so "press a color, pause to aim,
then drag" drops the whole gesture. Guess cannot take the usual way out
(`ignoresSecondaryButton`) because its right button genuinely means something:
it toggles a peg's hold. A keypad is the way out that does not cost the hold.

## What the scaffold got wrong

Both of its open worries were checked against the code and are false.

- **"Neither the Hint column nor the holds is reachable by a tap."** The hint
  column already is. A press there sets no `dragColor` and returns `null`, so
  the release falls through to `LEFT_RELEASE && overHint && ui.markable` and
  submits the row. Verified by driving `interpretMove`. Nothing to build; the
  scaffold's third decision dissolves.
- **"Map's prerequisite transfers: every panel key is dead until a tap can
  select."** It does not. Guess's digit arm is ungated by `cursor.visible` —
  it *reveals* the cursor, places at `cursor.x`, and advances — so from a cold
  board, tapping `1 2 3 4` fills the row left to right and leaves the cursor on
  the submit position. The panel works on touch **before** any tap-to-select
  exists. That makes selection an improvement rather than a precondition, and
  it is why this change is smaller than Map's.

## What changes

- **One key per color, plus Clear.** The keys are painted with their color
  (`KeyLabel.swatch`, from `give-map-element-keys`) and labeled with the digit
  the keyboard already sends, so the panel teaches the binding. Guess's tenth
  color is the `'0'` key, not `'a'` — upstream's quirk and the inverse of what
  `digitOf` answers — so the keypad comes from a new engine builder,
  `colorKeysZeroIsTen`, rather than from `digitKeys`'s `'a'` rollover. Without
  it a ten-color game (reachable from the Custom dialog; `MAXCOLORS` is 10)
  would ship an `'a'` key the game refuses, which is the Seismic defect.
- **A tap on a current-row slot selects it**, so the panel can edit a row and
  not only fill it. This is additive in Map's sense and *better* than what was
  there: a tap on an empty slot was a pure no-op, and a tap on a filled slot
  put the same color back **and hid the cursor** — the one thing a panel player
  must not have happen. The predicate is local and derived, never a state
  compare: a release over a peg selects it when it wrote nothing new there
  (`dragColor === 0`, or `dragOpeg === overGuess`).
- **The board palette stays a drag source, and a tap there stays a no-op.**
  Making it tap-to-arm would give a tap on a slot two meanings depending on
  hidden state, and would put a second, differently-shaped input model in the
  one game that is meant to stop being the odd one out. It remains the drag
  source and the color legend (`'l'` labels it), both unchanged.
- **The holds stay off the panel.** A hold is not an element, it is a modifier
  on a peg, and it is already reachable three ways: a right click, a long press
  on touch, and `CURSOR_SELECT2` at the cursor.

## The bug this found

**Clearing at the submit position corrupts the working row.** Every keyboard
arm bounds `cursor.x` against `npegs` — the digit arm requires `< npegs`,
`CURSOR_SELECT` and `CURSOR_SELECT2` both test `=== npegs` — except the erase
arm, which writes `currPegs[cursor.x] = 0` unguarded. `cursor.x` *is* `npegs`
the moment a row is full, because the digit arm advances onto the submit
position. So: fill a row, press Backspace, press Enter → `currPegs` has
`npegs + 1` entries, `isMarkable` still says yes (it reads only the first
`npegs`), and `executeMove` throws `Illegal guess peg 0`.

Reachable today with a keyboard; upstream has the same hole (`ui->curr_pegs->
pegs[ui->peg_cur]` past the end of a `malloc`'d array). It becomes **this
change's** to fix rather than a found-nearby, because the Clear key being added
to the panel sends exactly that button: shipping the panel without the guard
would put the crash on a button.

The erase arm now declines at the submit position, as `CURSOR_SELECT2` already
does — the cursor is not on a peg there, and Enter means submit.

## What replaces the assurance

Nothing here is gated by a fixture: the generator, solver, codec and feedback
scoring are untouched. What is new is input, and it is held by

- the pinned `KeyLabel[]`, at six colors **and at ten**, where the tenth key is
  `'0'` and every swatch names a palette index Guess's own `colors()` fills;
- a Midend-level test that a peg is placed **with no drag anywhere** — the
  question `input-parity.test.ts` structurally cannot ask, because it presses
  keys with a cursor already placed;
- a tap on a slot selecting it, and a tap on a filled slot no longer hiding the
  cursor;
- the row length after a clear at the submit position, and the guess that
  follows it executing;
- `input-parity.test.ts`'s "no on-screen key is inert", which Guess enrolled in
  by acquiring `requestKeys`.

Each was watched to fail with the behavior deliberately broken.
