# recheck-a-firing-before-it-writes

**Status: filed by `describe-lines-and-loops` (2026-11-07), on the owner's
agreement.** It follows `make-descriptions-zero-cost`, so that its cost is
measured on that change's runtime.

## Why

A solve run with no firing cap fires every binding of a technique in one
pass. A binding that read a set bound before an earlier firing of the same
pass reads it stale.

Path's `pairBreaks` bound a square's three open edges and placed one. A
later binding of the same square still read all three as open, and the
ladder called 21 of HEAD's 260 boards impossible.

Two nets did not catch it:

- **The soundness check** judges one binding on its own, so it passed the
  technique.
- **The generator** dropped every board the bug misgraded, so its new deals
  looked right.

Only grading HEAD's boards with the new ladder showed it. Today the fix is
care: each technique says `not known(x)` again for what it reads
(`docs/descriptions.md` § "A statement's order is behavior"). Every game
still to be described can make the same slip, and nothing would fail.

## What Changes

The engine makes the stale read impossible, never a game. Before a
binding's conclusion is written, the runtime checks again what the binding
read. The compiler knows which values those are. A binding whose premises
no longer hold does not fire. The `not known` re-checks a description
carries for this reason then go.

## Acceptance

- Path's `pairBreaks` without its re-checks grades the three boards in
  `path.test.ts` at their tiers.
- The boards dealt by every described game are unchanged.
- The cost is measured against `make-descriptions-zero-cost`'s census, and
  is within its target.
- The guide's paragraph is replaced by the rule the engine now enforces.
