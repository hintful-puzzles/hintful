# sequence-hints-in-cell-games — tasks

Read `design.md`, then `order-hints-from-the-frontier/findings.md` — its instrument,
its bias analysis and its stopping condition are all reusable here, and only its
*conclusion* is Loopy-specific.

> **§1 carries a stopping condition, stated before the instrument is built:** if a
> plan position in a cell game usually offers one firing, ordering buys nothing and
> §2–§4 do not happen. That is what made the earlier stop trustworthy, and it is
> copied deliberately.

## 1. Measure, with the condition stated first

- [x] 1.1 The read-set derivation. **Not against the Latin reason union**: most
      strikes in Towers, Keen and Unequal carry game-local reasons the union lacks, so
      D2's read-set would have measured the minority. It reads the step's
      `CandidateHighlights` (`area ∪ targets`) instead, which every game here emits,
      at three precisions that bracket the truth (`findings.md` § "The instrument").
- [x] 1.2 Known positive and negative pass at every precision, and every available
      placement was checked against the position's own notes: of 3,863, the 248 that
      are not singles are all clue-forced placements (cage sums, associativity).
- [x] 1.3 Six games, 42 boards, 3,445 positions: candidates **p50 3, p90 12**, one
      candidate at **20.7%** of positions. Jumps are measured as D3's continuity
      rather than a unit distance (in a Latin square every cell is two units from
      every other): 48.4% of steps continue nothing the previous step wrote, and
      **23.0%** of those had a continuing candidate.
- [x] 1.4 The bias runs the other way from Loopy's: the tight read-set and the
      plan-tail definition both under-count, so the figures are lower bounds and the
      proceed is earned.
- [x] 1.5 **Proceed.** Even the strictest reading has fewer than half the positions
      offering one firing. Most of the avoidable jumps cross techniques and a third of
      them reach back past the last step, so §2 orders frontier first, most recent
      first, and keeps the tier order as the tiebreak (`findings.md` § 1.5).

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
