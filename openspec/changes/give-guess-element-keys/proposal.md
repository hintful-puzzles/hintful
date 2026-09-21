# give-guess-element-keys

**Status: scaffolded, not started.** Found while finishing
`give-map-element-keys`, verified in the code, and filed rather than folded in
— Guess is a different shape from Map and deserves its own decision.

## What was found

**Guess enters its element by drag alone.** A peg is placed by pressing on a
color in the palette column the board draws down its left side and releasing
over a slot in the current row. A *tap* on that palette does nothing: the press
sets `ui.dragColor`, and the release, with `overGuess === -1` and
`ui.dragOpeg === -1`, falls through every branch and clears the drag again
(`src/games/guess/index.ts`, `interpretMove`'s `LEFT_RELEASE` arm, read
2026-09-21).

So on touch there is exactly one gesture for entry, and it is the one Map and
Rome have both just stopped requiring. Guess already answers a **digit** for
each color from the keyboard (`digitOf`, same file), so the elements are
enumerable and the input path exists; what it has no `requestKeys` for is a
panel.

## Why it is not simply the same change again

- **Guess has no notes**, so it is outside the rule as written — that rule is
  about a game whose *notes* are an enumerable per-cell set, and it is the
  notes-mode half that made Map's keys nearly free. The principle underneath it
  ("a game's elements belong on the panel") still points here.
- **Guess draws its own palette on the board**, which is a real touch
  affordance and upstream's design. A keypad would be a second palette, and the
  honest question is whether the board palette should instead become
  *tappable* — tap a color to arm it, tap a slot to place it — which is fewer
  pixels and keeps upstream's layout. `KeyLabel.swatch` exists now either way.
- **Its cursor is two-dimensional in a different sense**: x is the peg, y is
  the color, so "select a slot, press a value" is already what the keyboard
  does, and a tap would need to set only x.

## What a proposal here would have to settle

- Panel keys, a tappable board palette, or both.
- What a tap on a slot means. Unlike Map's, Guess's taps are not uniformly
  no-ops: a tap on a filled slot in the current row picks that peg up.
- Whether the hint column and the holds (`CURSOR_SELECT2`, a right-click) need
  anything, since neither is reachable by a tap either.
