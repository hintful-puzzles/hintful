# solo-ladder-as-declared-techniques

Found by `guard-recorded-firing-premises`, 2026-09-28; done the same day
(`design.md` has what it found).

## Why

Solo's solver runs its techniques inside one hand-written loop
(`SolverUsage.run` in `src/games/solo/solver.ts`), each `continue`-ing to the
top on progress. That is the shared fixpoint's loop written out again
(`runDeductionFixpoint`, which the Latin family and Rome use), and its
techniques have no names a caller can run one at a time.

That is what makes Solo the weakest game under the premise audit. The audit
reruns a firing's own technique from a state that keeps only its premise; Solo
can only rerun the whole loop for one pass, so a lower rung puts back a
returned cell before the firing's technique is reached. Measured on the
guard's boards, Killer aside: **61 cells tested against 782 put back**, where
Keen tests 1,087. A hidden single whose words drop the region it reasons over
leaves the guard green.

The byte-match fidelity that kept the loop bespoke is released (AGENTS.md §
"Byte-parity was a tool").

## What to find out

- Whether Solo's rungs map onto declared techniques cleanly: the killer rungs
  share state (cage reduction, extra cages) that runs before them each pass,
  which the fixpoint's `settled` hook may carry, as it carries Rome's
  validation.
- What replaces the differential's assurance for the loop's order, which
  decides which boards are graded at which tier: a ladder-equivalence test
  (`engine/testing/ladder-equivalence.ts`), as Rome's move got.
- Once the techniques are named, Solo's replay runs one of them, and its
  tested count should say whether the change earned itself.
