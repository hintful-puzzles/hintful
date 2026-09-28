# derive-the-keypad-floor

**Status: implemented** (2026-09-29).

## Why

`input-parity.test.ts` holds `expect(offered.length).toBeGreaterThanOrEqual(12)`
over the games that offer an on-screen keypad. Its comment says the floor is
"set at the twelve panels present when written rather than comfortably below
them", because a game that *loses* its keypad has no per-game case left to fail,
and this floor is the only thing that sees it.

That is no longer true. **Fifteen games offer a keypad** (counted 2026-09-27,
`vitest list` on the file's `no on-screen key is inert` cases), so any one of
them can drop its keypad and the floor still passes, in CI as much as in the
hook. Three games gained keypads and nobody raised the number. A floor that
depends on someone bumping it rots in the way `AGENTS.md` § "A count written in
prose is a census nobody re-runs" describes, just in code rather than prose.

## The idea (unmeasured)

Replace the count with a **property**: a game whose `interpretMove` accepts a
character code that only a keyboard can type (a digit or a letter) offers a
keypad, since on touch the panel is the only way to type it. A game losing its
keypad then fails its own case, whatever the population size, and there is no
number to keep current. The probes in `testing/input-probe.ts` already ask
"is this code consumed", which is the question needed.

Check before building: which games accept such codes today, and whether any of
them legitimately offers no panel (an exemption that would need a ledger entry
with its reason). If the property cannot be stated without a ledger longer than
the problem, the fallback is to raise the floor to the current count and say in
the comment that it must move when a keypad is added. Either way, show the new
check fails when a keypad is removed.

## What was measured (2026-09-29)

**The proposed property does not hold.** Of the 29 games that accept a digit or
letter key, 14 offer no keypad, and rightly: Bricks, Clusters, Sticks and
Unruly take `0`–`2` as shortcuts for states a tap cycles through, Net and
Twiddle take letters for rotations a click makes, Inertia and Sokoban take the
numpad digits as directions, and so on. Stating the property would have needed
a 14-entry ledger of claims that a pointer route exists — longer than the
problem, and nothing would check those reasons. The panel's Clear code (8) does
not separate them either: nine keypad-less games accept it as an erase or a
cancel.

**A property that does hold is the engine's own.** Every game whose board
carries a `pencil` array — the board arm of `takesNotes`, which `Midend` already
runs to add the Marks key — offers a keypad: thirteen of thirteen, no
exceptions. The reason is structural: such a note is written by typing a symbol,
and on touch only the panel types. The flag arm (Loopy, Slant) has no symbols to
type and offers none. Only two keypad games fall outside the arm, Filling
(numbers are only ever typed) and Guess (colors are only ever pressed; its notes
live in the answer row), and those two are a ledger with reasons.

## What changes

- `hasPencilArray` is exported from `engine/key-labels.ts`, and `takesNotes`
  calls it, so the guard and the engine read one definition.
- `input-parity.test.ts` drops `offered.length >= 12` for a per-game
  biconditional — *offers a keypad* iff *has a pencil array or is in
  `KEYPAD_WITHOUT_PENCIL`*. Each case is titled `<id>: …`, so a game commit's
  narrowed run still checks the game it touched. Proved red three ways: Solo
  without `requestKeys`, Filling without `requestKeys`, Guess missing from the
  ledger.
- **A defect the census found**: Unequal answered the panel's Clear (8) but not
  the keyboard's Backspace (127), which its help page promises, because
  `charValue` tested `8` rather than `isEraseKey`. Fixed, and guarded: the
  inert-key case now presses Backspace wherever a panel offers Clear (red
  against the unfixed Unequal, green on every other keypad game).
