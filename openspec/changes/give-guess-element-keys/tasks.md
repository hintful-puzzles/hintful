# give-guess-element-keys — tasks

## 1. Decide

- [x] 1.1 Panel keys, a tappable board palette, or both? **Panel keys.** The
      board palette keeps its one job — drag source and color legend — because
      tap-to-arm would give a tap on a slot two meanings depending on hidden
      state, and would put a second input model in the game this rule exists to
      stop being an exception.
- [x] 1.2 What a tap on a slot means. **It selects the slot.** Checked rather
      than assumed: a tap on an empty slot is a pure no-op, and a tap on a
      filled one re-places the same color and **hides the cursor** — so
      selecting is additive on one and a fix on the other.
- [x] 1.3 Hint column and holds. **Nothing.** The scaffold's premise was false:
      a tap on the hint column already submits (the press returns `null`, so
      the release reaches `overHint && markable`). A hold is a modifier, not an
      element, and has a right click, a long press and `CURSOR_SELECT2`.
- [x] 1.4 Does a key need a visible cursor, as Map's do? **No** — Guess's digit
      arm reveals the cursor and places at `cursor.x`, which is what lets the
      panel work on touch before any tap-to-select. Keeping that is what makes
      this change smaller than Map's, and it matches upstream.

## 2. Build

- [x] 2.1 `colorKeysZeroIsTen(n, firstColor)` in `engine/key-labels.ts`: the
      swatch keypad whose tenth key is `'0'`, not `digitKeys`'s `'a'`. In the
      engine because the digit codes are the decimal fact `decimal.test.ts`
      allows exactly one statement of, and because a ten-color Guess is
      reachable from the Custom dialog.
- [x] 2.2 `requestKeys` on Guess: `colorKeysZeroIsTen(p.ncolors, COL_1)`. The
      Marks key is not appended and must not be — Guess takes no notes.
- [x] 2.3 A release over a current-row peg that wrote nothing there selects it.
      The predicate is local and derived (`dragColor === 0` or
      `dragOpeg === overGuess`), never a compare of state before and after.
- [x] 2.4 The erase arm declines at the submit position, as `CURSOR_SELECT2`
      does. This is the crash fix, and it is in scope because the Clear key
      being added sends that button.

## 3. Verify

- [x] 3.1 Pin the `KeyLabel[]` at the default six colors **and at ten**, and
      assert every swatch names a palette index `colors()` fills. Nine is
      pinned too — the width where the tenth *entry* is the clear key.
- [x] 3.2 A peg is placed with no drag anywhere: a Midend playing panel buttons
      alone fills a row and submits it.
- [x] 3.3 A tap selects: the cursor lands on the tapped slot, a color key then
      acts there, and a tap on a *filled* slot no longer hides the cursor. The
      two drag gestures are pinned beside them, so the cost of the new branch
      would show.
- [x] 3.4 Clear at the submit position: the row keeps its length, and the guess
      that follows executes.
- [x] 3.5 Watch each new guard fail with the behavior deliberately broken —
      the erase guard removed (1 red), tap-select disabled (2 red), the tenth
      key keyed on the entry rather than the count (1 red, and it *was* eating
      Clear at nine), `requestKeys` unregistered (6 red). All restored.
- [x] 3.6 Re-baseline `capability-surface.test.ts` — Guess gained
      `requestKeys`, which is exactly the deliberate change that snapshot asks
      to be re-recorded and declared. The diff is that one line.
- [x] 3.7 Run the app, in Chrome. Panel-only play from a cold board (four keys
      fill the row, Enter submits — with the physical key pressed straight
      after a panel click, so the focus rule holds); Clear on the submit
      position declined with the row intact; a tap selecting a middle slot and
      a key landing there; both drags still placing and clearing, and leaving
      no cursor behind; a ten-color custom game whose tenth key is `'0'` and
      places the tenth color; dark mode, where the keys match the board; and
      390 px, where ten keys wrap to two rows. Zero console errors.

## 4. Record

- [x] 4.1 `docs/games/input.md`: Guess as the third worked case, and the two
      things it corrects about the rule as written — a panel is not always dead
      without tap-to-select, and a game with a real secondary meaning cannot buy
      its way out of the long-press trap with `ignoresSecondaryButton`.
- [x] 4.2 Spec deltas: `guess` (the keypad, tap-to-select, and the cursor never
      writing past the row), `ts-engine` (the zero-is-ten color keypad).
- [x] 4.3 `docs/games/engine-catalog.md`: the `key-labels.ts` entry gains the
      two color builders — and loses "every game with a `ui.pencilMode` offers
      it last", which `derive-the-marks-key-from-having-notes` made false. The
      engine appends the Marks key, and `takesNotes` is the population.
