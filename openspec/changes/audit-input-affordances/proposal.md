# audit-input-affordances

**Status: scaffolded, not started (2026-09-30).** Owner-requested; the second of
three parts split out of `afford-every-hint-action`.

## Why

The owner's rule (2026-09-30) is that every action is reachable by the keyboard
alone and by a pointer alone, with no key held. `one-pointer-for-mouse-and-touch`
made a finger and a mouse the same input, so "touch alone" now follows from
"mouse alone", and it removed the middle button and the key-held clicks. What
nobody has is the table itself: for each game, each action, and how each of the
two inputs reaches it. Without it, `afford-every-hint-action` cannot say which
games its structural guarantee has to reach first, and a gap is found the way
Net's lock was found, in play.

## What changes

For every registered game, taken from the registry, list each action (each
distinct kind of move, and each UI change a hint could ask for) and whether a
pointer alone (two buttons, clicks and drags) and the keyboard alone reach it.
**Measure, don't read**: `testing/input-probe.ts`'s `boardsReached` gives the
boards one gesture reaches, and a pointer-only walk to a fixpoint gives the
boards a sequence reaches. An action is afforded when some sequence of that
input's gestures produces it (a half turn is two quarter turns; a clear is a
cycle through empty).

Already known to need an answer:

- **Net**: Ctrl+arrow moves the source and Shift+arrow scrolls a wrapping grid;
  neither has a pointer route.
- **`keyOnly` verbs**: each must have a pointer route by some sequence. Net's
  half turn and lock and the erase keys of Loopy, Subsets and Unruly have one;
  Slant's is unchecked.
- **Keyboard-held modifiers** that paint while moving (Pattern, Boats, Tents,
  Towers, Unequal and others): keyboard gestures, and fine; check each painted
  result also has a pointer route.

Record the gaps and give each one an answer. A pointer route is a player-visible
control, so propose it with its alternatives where there is no one clear design.
Turn the walk into a standing cross-game guard if it is cheap enough to run per
commit, since this rule should hold for every future game.

## Hints to pull in

None.
