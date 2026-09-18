# sequence-hints-in-cell-games — tasks

Read `design.md`, then `order-hints-from-the-frontier/findings.md` — its instrument,
its bias analysis and its stopping condition are all reusable here, and only its
*conclusion* is Loopy-specific.

> **§1 carries a stopping condition, stated before the instrument is built:** if a
> plan position in a cell game usually offers one firing, ordering buys nothing and
> §2–§4 do not happen. That is what made the earlier stop trustworthy, and it is
> copied deliberately.

## 1. Measure, with the condition stated first

- [ ] 1.1 Write the read-set derivation in `engine/`, once, against the shared Latin
      reason union (D2). `set` reads everything, the conservative direction; count how
      many firings take that branch, because a corpus that is mostly `set` measures
      nothing.
- [ ] 1.2 Prove the instrument on a known positive before trusting a number: hand it a
      position with two hidden singles in disjoint regions and assert it reports two
      candidates. An instrument that has never been seen to say "two" cannot be trusted
      to mean it when it says "one".
- [ ] 1.3 Candidates per plan position across a cell-game corpus — Solo, Towers, Keen,
      Unequal at their harder tiers, where plans are long enough to have a tail. Report
      p50/p90/max, the share offering exactly one, and the share of ≥4-unit jumps that
      had an alternative sharing a unit with the previous step.
- [ ] 1.4 Say which way the bias runs and quote the numbers as bounds accordingly
      (under-read premises inflate candidates, so the figures are upper bounds and a
      **stop** is conservative while a **proceed** is earned).
- [ ] 1.5 **Decide, and write the decision down either way.** A stop here is a result,
      not a failure, and is reported as one — the earlier campaign's stop is the most
      valuable thing it produced.

## 2. The engine's ordering — only if 1.5 says proceed

- [ ] 2.1 The candidate-enumeration hook on `deduceHintPlan`, used only when a plan is
      built for a hint; absent it, today's order is unchanged.
- [ ] 2.2 The comparator, with admissibility first. `order-hints-from-the-frontier`
      D1–D6 hold the design; re-read D4 before touching anything a generator runs.
- [ ] 2.3 The guard, seen to fail under a reversed comparator — and never a bare
      distance assertion without an availability clause (D6 there).

## 3. Bound the journey

- [ ] 3.1 Decide whether a 55-leg journey is a defect, by walking one in the running
      app rather than by reading a leg count. It is walked at one step per press, so
      the question is whether it reads as a long chain or as a wall.
- [ ] 3.2 If it needs bounding: cap a journey, or spread a note back across the firings
      between its discovery and its use. Either way say what the player sees instead.

## 4. Widen the note placement (carried 3.4)

- [ ] 4.1 An expiring note placed at the **latest** position its explanation still
      describes. Gated on 3.1 — it concentrates notes onto their consumers harder.
- [ ] 4.2 Widen the `ts-engine` note-placement requirement to match, and re-measure the
      rate the guard in `loopy-hint.test.ts` holds.

## 5. Not here

- [~] 5.1 Extracting Loopy's premise-note placement into the engine. One member, no
      shared fact graph (D5). The trigger is `apply-markable-facts-rule` giving a
      second game notes; the extraction rides with it, not with this change.
