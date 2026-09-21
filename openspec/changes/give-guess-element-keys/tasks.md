# give-guess-element-keys — tasks

**Nothing here is started.** The first task is a decision, not code.

## 1. Decide, before building anything

- [ ] 1.1 Panel keys, a tappable board palette, or both? Guess already draws a
      palette column down the board's left side, which is a real affordance and
      upstream's layout; a keypad would be a second palette. Making the drawn
      one *tappable* costs no pixels and teaches one place to look.
- [ ] 1.2 What a tap on a slot means. **Map's case does not transfer**: its taps
      were uniformly no-ops, while a tap on a filled slot in Guess's current row
      picks that peg up, and a tap on a past row picks up the color it holds.
- [ ] 1.3 Whether the Hint column and the per-peg holds want anything. Neither
      is reachable by a tap either — a hold is `CURSOR_SELECT2` or a right
      click, which on touch is the long press.

## 2. If it goes ahead

- [ ] 2.1 Whatever §1 settled. `KeyLabel.swatch` (from
      `give-map-element-keys`) is there if it is a keypad: a key that enters a
      color is painted in it, from the game's own palette.
- [ ] 2.2 A test that a peg is placed **without a drag** — the assertion Map's
      panel rests on, and the one `input-parity.test.ts` cannot make, because
      it presses keys with a cursor already placed.
- [ ] 2.3 Run the app, on touch as well as with a mouse.
