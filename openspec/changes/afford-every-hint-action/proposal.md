# afford-every-hint-action

**Status: implemented (2026-09-30); `design.md` D1 says where the gesture ended
up living and why.** Owner-requested. The last of
three parts: `one-pointer-for-mouse-and-touch` removed the middle button, the
key-held clicks and the stylus bit, and `audit-input-affordances` measures what
each input reaches. This part makes the rule structural for hints.

## Why

Net's hint told the player to lock a square, which a touch player could not do
(found in playtest, 2026-09-30). Hint rule 6 says a hint relies only on marks
the player can make, and nothing in the engine checked *how* the player makes
them. Owner, 2026-09-30: the engine must make it **impossible**, not merely
tested against, to create a hint that uses an action some input cannot perform
on its own.

With a finger and a mouse now the same input, "each input alone" is two
inputs: the **pointer** (two buttons, clicks and drags, no key held) and the
**keyboard**.

## What changes

**A hint step carries the gesture it asks for, and the midend derives the move
from it.** A step names a pointer gesture (a primary or secondary press, or a
drag from one point to another) and the midend obtains the move by running
that gesture through the game's own `interpretMove`, the way the frontend
would. A hint then cannot hand back a move the pointer does not make, because it
has no move to hand back. Because the pointer covers mouse and touch, one
gesture serves both.

The keyboard route stands on a guard rather than the construction: the
target-verb model's keys-equal-buttons guard (`target-verb.test.ts`) holds for
every verb game, and it is extended to the games outside the model.
`declare-drag-games-click-half` brings the drag games into the model, and the
two are designed together.

Where a gesture is a sequence (Net's half turn is two quarter turns, and a step
in notes mode needs the mode on), the step carries the sequence and the
auto-hint plays it. Where the structural form is not reachable for a game yet,
a guard replays every step of the cross-game hint walk through the pointer and
through the keyboard, and fails if either cannot make the step's move; each such
game states why it is not structural yet, and the list is to shrink to empty.

Settle first: what a step's highlight is drawn from once the move is derived
(the gesture's target is the natural source), and how a multi-leg journey
(`continuesPrevious`) carries one gesture per leg.

## Hints to pull in

None. This change constrains every hint; it checks itself against the hinted
games, Net first, since Net's lock is the case that found it.
