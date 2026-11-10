# supply-techniques-by-kind-of-rule

**Status: draft, filed on the owner's word (2026-11-10), for later.** Fifth
in the plan of
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md).
It waits for `state-hint-sentences-in-the-description`, since a technique
the engine supplies brings its words with it. The session that takes it up
writes its tasks, after the measurement under § "Before it starts".

## Why

A described game states about six techniques of its own (297 over 47 games,
2026-11-10), and each costs a statement, a soundness check with a planted
defect, words, and a pinned position. The report's surveys judged about two
thirds of them (196) to follow from one rule alone: a count met, a count
starved, a single place left, a neighbor ruled out. The Latin library
already shows the other way: eight games place its techniques with `use`
and state none of them.

The owner asked (2026-11-08) whether the engine could hold abstract kinds
of deduction, so that a game states few or none of its techniques, and
(2026-11-10) welcomed a large refactor where it pays for itself over a
hundred more games, with the catalog's games as their exemplars. At two
thirds, a new game would state about two techniques, and a hundred games
would not write, check, word or pin about four hundred.

## What Changes

- **A kind of rule carries its techniques.** A rule stated as one of the
  engine's kinds ("exactly k of these hold v", "all different", "one loop",
  "these are one group", "no two of these touch") brings the deductions
  that follow from it alone, each with its words, placed by `use` at the
  tier the game gives it, as the Latin library's are.
- **A library technique is checked sound once**, on its kind of rule alone,
  the weakest setting any game adds to. A game that places it pays no
  solver time for it.
- **A rule states how it breaks.** Each kind has a clause for a position
  that violates it ("this 3 would have four lines"). The engine then states
  the Check every game writes by hand, "suppose a value: one rule breaks at
  once", with the witness
  `explain-a-firing-by-its-witness-and-parents` reports, and the same
  clause is there for a mistake's explanation.
- **A game states what is its own**: where two rules meet in a pattern
  worth a name, its tiers and order, and its nouns.
- **The catalog is restated on the library**, so that a game copied as an
  exemplar shows the way a new game is written.

## Before it starts

1. **Cluster the one-rule techniques by their statements**, not by label:
   the report's surveys labeled each by reading it and compared no
   formulas. The change goes ahead only if a small number of kinds, about
   fifteen, covers most of them. Say the number found, and bring it to the
   owner if it is far from that.
2. **Say what restating one game costs**: a library technique fires in the
   library's order, so boards, grades and the order of a hint's steps move
   (`docs/descriptions.md` § "A statement's order is behavior"). Restate
   three games, deal-compare them, walk their hints, and report what moved.
3. **Ask the owner** with those two before the catalog moves. A hint's
   order moving was accepted once for `describe-the-whole-catalog`; this is
   a new plan and a new ask.

## Where two rules meet

The report counted 88 such techniques. Many are a supposition that breaks a
second rule, which the stated Check above covers. For the rest, the
proposal this came from named two tools, both untried here: pairing rules
and keeping what a census of dealt boards keeps, and asking a solver for
the smallest set of rules that forces a move where a ladder is stuck.
Neither is in this change unless the first measurement shows the group
large after the Check is taken out.

## What it builds on

`docs/descriptions.md` § "What this builds on" lists the works already
taken from. One to read and add: propagators that explain what they
propagate, from constraint programming's lazy clause generation, which is
the same idea as a kind of rule carrying its deductions with their reasons.
This was recalled, not read, when this was filed (2026-11-10): verify it
before citing.

## What it touches

`describe/` (a `use` that takes a rule), the engine's libraries beside
`engine/latin.description.yaml`, the soundness checker and
`research/technique-check/inherit.ts`, every described game's description,
and `docs/descriptions.md` and `docs/new-game.md`.

## Acceptance

To be written when it starts, from the two measurements. At least: every
board a game deals still has one answer at its tier, every hint walk still
finishes, and a new game in a family the library covers states only what is
its own.
