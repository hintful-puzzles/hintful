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

- [x] 2.1 The enumeration lives in the candidate plan, not on `deduceHintPlan`: none of
      these games plans through `deduceHintPlan`, and each plan's choice points are its
      rungs. `nakedSingles`, `availableStrikes` and `availablePlacements` list what each
      rung could fire now, and only firings whose premise the board already shows. The
      hint path only: the recording solvers and the generators are untouched (D4 there).
- [x] 2.2 `HintFrontier` (`engine/hint-frontier.ts`): continuity with the plan's last
      three steps first, most recent first, then the rung order, so a fresh plan opens
      as before. The walk around it is `runCandidatePlan`: the loop six games had each
      written moved into the engine, owner-directed mid-change ("refactor away from
      just consistent idioms towards having the functionality in the framework"), and
      the recorded decision not to build a shared driver is reversed in
      `docs/games/hints.md`. Jumps fell from 48.4% to 35.9% of steps, and the avoidable
      share of them from 23.0% to 5.8%.
- [x] 2.3 `hint-frontier.test.ts`: every game that walks with `runCandidatePlan`
      (derived from its source) is measured from outside by
      `engine/testing/plan-continuity.ts`, bounding avoidable jumps below 10% (measured
      3.9–8.3%, against 14.8–32.1% for the old order). All six games and both rule tests
      failed under a reversed comparator. The availability clause is the instrument's
      candidate definition, not a distance.

## 3. Bound the journey — moved

- [~] 3.1–3.2 Moved to `bound-loopy-note-journeys`. They are Loopy's, they share
      nothing with the cell-game ordering, and 3.1 is a judgment the earlier campaign
      left to the owner (does a 55-leg walked journey read as a chain or as a wall), so
      they should not hold this change open.

## 4. Widen the note placement (carried 3.4) — moved

- [~] 4.1–4.2 Moved to `bound-loopy-note-journeys` with §3, which gates them.

## 6. Found on the way

- [x] 6.1 Solo's hint threw on one fresh Killer board in six: the notes culls ignored
      the cage, which forbids repeats. Fixed in its own commit, with the lesson in
      `docs/games/hints.md` § "Candidate-elimination games".
- [x] 6.2 Two live requirements contradicted the code: "A shared cell-region helper"
      (by that fix) and "Latin-family hints distinguish naked, hidden and forced
      singles" (by `strike-before-forced-singles`, which retired the third kind and left
      the requirement describing it). Both are replaced in this change's delta.

## 5. Not here

- [~] 5.1 Extracting Loopy's premise-note placement into the engine. One member, no
      shared fact graph (D5). The trigger is `apply-markable-facts-rule` giving a
      second game notes; the extraction rides with it, not with this change.
