# teach-loopy-the-blocked-corner-pair

## Why

Owner, 2026-09-18, on a 10×10 Easy board where the hint offered a narrow single-dot
step: *"a much better deduction is that when a square with a 3 has two incoming edges,
they must not have an edge between them, as it would invalidate 2 edges, leaving it
with insufficient edges — therefore the square can immediately be solved in one
deduction, with all other edges being on."*

The deduction is sound and it is a technique a player learns once and then sees
everywhere. Take the square's corners `A B C D` with edge `AB` between `A` and `B`, and
suppose a line already reaches both `A` and `B` from outside:

- if `AB` were a line, `A` would have its two lines and so `DA` is ruled out; `B`
  likewise rules out `BC`;
- that leaves the 3 with `AB` and `CD` only — two lines where it needs three;
- so `AB` cannot be a line, and `BC`, `CD` and `DA` all must be.

One step settles all four edges.

**The solver already reaches this conclusion — in three firings, by a route that reads
nothing like the technique.** Traced through `dlineDeductions`: the external lines give
`atMostOne(DA, AB)` at `A` and `atMostOne(AB, BC)` at `B`; the interval bound then
notices that `{AB, BC}` can supply at most 1 while the complement `{CD, DA}` can supply
at most 2, which sums to exactly the clue, so `CD` and `DA` are forced; `AB` falls out
of the at-most-one bit; and `BC` falls out of the count. Each of those is a firing, and
"one deduction firing is one journey" faithfully renders them as three unrelated hints
— the first of which is the single-dot step the owner was shown.

**So this is not a missing deduction. It is a firing boundary that does not match the
technique**, and that is the interesting part: the hint bar assumes the engine's
granularity is the human one, and here it is not.

## What changes

- **The engine learns the pattern as one firing**, so it settles the whole face at once
  and can be narrated as one thing. Draft phrasing, to be settled in review:

  > *"Lines reach both ends of this 3's top edge. If that edge were a line too, both of
  > those dots would be full and the 3's other two edges ruled out — leaving it one
  > short. So that edge can't be a line, and the other three must be."*

  The owner's own draft said "incoming edges" and "the long way around"; the wording
  above avoids "incoming" because the player sees lines, not direction, and states the
  contradiction rather than naming the shape.

- **Generalized past the 3, if the measurement supports it.** The argument is not about
  3 specifically: it is *clue = order − 1* on a face whose two edges at each of two
  dots are blocked. On a square that is a 3; on a pentagon a 4. Whether to generalize is
  a task, not an assumption — a pattern that never fires outside squares is a worse
  trade than one that does.

## The cost that has to be measured, not assumed

**Loopy's generator is solver-gated, so a new rung changes which boards exist and at
what tier.** The rung table's own comment says the ordering "is part of the solver's
behavior, not a presentation choice", and `AGENTS.md` records that a solver exploring
differently accepts a different set of boards.

This change does **not** make the solver stronger — every board it can grade today it
can still grade, because the new pattern's conclusions were already reachable. What it
changes is **when**, and that is enough to re-grade: if the pattern fires at Normal
where the old route needed a Tricky-gated block, boards move down a tier. A board
labeled Tricky that is now solvable at Normal is a **dishonest difficulty**, which the
`difficulty` requirement treats as a defect rather than a nicety.

So §1 measures the re-grading before §2 writes anything, and the stopping condition is
stated in advance: *if the pattern re-grades a material share of boards, it is a hint-
side recognizer rather than a rung.* That fallback is real and cheaper — group the
three firings and narrate the group — and it costs nothing in the generator, at the
price of the grouping being a second place that knows the technique.

## What this does not do

- **Not the phrasing of every other hint.** One technique, one sentence.
- **Not a general "group firings into techniques" mechanism.** If a second technique
  wants one, that is the moment to build it — not this change.
