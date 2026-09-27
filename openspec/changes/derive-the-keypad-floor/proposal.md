# derive-the-keypad-floor

**Status: scaffolded, not started** (2026-09-27).

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
