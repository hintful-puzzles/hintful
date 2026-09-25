# add-map-hint — tasks

## 1. Make the ladder addressable (the A2 cost)

- [x] 1.1 Split `solver.ts`'s inline rungs into named functions
      (`onlyColorLeft`, `sharedPair`, `forcingChain`). The comment's two
      objections were re-derived rather than inherited: the state is one
      `MapBoard` every rung reads, so nothing is threaded rung by rung, and the
      tier cap is still one number in one loop. Each rung *reports* its firings
      through a callback; the solver applies each on the spot, which is the
      order upstream mutated in, and the hint collects without applying.
- [x] 1.2 No verdict moved: the frozen differential (desc, aux and grade,
      byte-for-byte against the C, each desc depending on the solver's verdict
      at every clue removal) and `difficulty-contract.test.ts` pass unedited.
- [x] 1.3 Not on `runDeductionFixpoint`. The runner's value is a certified
      ladder and a shared single-firing driver; Map's hint needs every firing
      at once (for the frontier) and the witness each rests on, which the
      callback shape gives directly. Recorded here as the outcome.

## 2. Deixis

- [x] 2.1 A region is named by its mark ("this region", "the outlined pair",
      "region 1" by the drawn chain number), never by its region number, which
      is behind a preference off by default. A color is named by its word, from
      `FOUR_NAMES` (new, beside `FOUR_FILLS`).
- [x] 2.2 `hint-mark.ts` cannot mark a region: it bands a cell's border box. Map
      already drew its selection as a band inside a region's whole boundary, so
      the hint marks are that band in the hint colors, the target's twice the
      width of the evidence's. Recorded in `docs/games/hints.md` § "Shade vs
      ring" and § "A graph, not a grid (Map)".
- [x] 2.3 Settled together: the outline is unambiguous, so the sentences lean
      on it.

## 3. The rungs

- [x] 3.1 Easy: three arms, by what the region shows (no dots, one dot, dots a
      neighbor's color kills).
- [x] 3.2 Normal: the "use both" premise is stated. One firing is one journey
      with a leg per region it narrows.
- [x] 3.3 Hard: the chain the BFS walked (`chainTo` over its parent links),
      numbered at the regions' label points; chains of two (a pair) and targets
      inside their own chain are left to the rungs that state them.
- [x] 3.4 Unreasonable refuses with `DEDUCTION_EXHAUSTED`.
- [x] 3.5 Decided on the way: Map does not walk `runCandidatePlan`. Its notes
      model (populate the full set, then clean) is not Map's, whose unmarked
      region means "no information" and whose candidates are partly its
      neighbors' colors. A narrowing places a color, removes dots, or dots the
      colors left, whichever the board calls for.
- [x] 3.6 Decided on the way: `findMistakes` flags dots that leave out a
      region's answer, which is what makes reading the dots sound (the
      Seismic/Rome precedent). The help page says so.

## 4. Verify

- [x] 4.1 Census over 240 boards (40 per preset, both sizes, the three teachable
      tiers); one board per arm pinned as a desc. The two arms no fresh plan
      reaches (a lone player dot; a pair's target the player already dotted)
      have boards built by hand, and the arm table must be exactly pinned ∪
      built.
- [x] 4.2 Cross-game guards: two long-sentence ledger entries (the pair's two
      premises, the chain Tactic) and the hint-mark renderer count. The
      ordinal guard's sweep reaches no Map chain, so `map-hint.test.ts` pins
      one and asserts its numbers on the canvas.
- [x] 4.3 Recompute stability and resume: `hint-resume.test.ts` walks Map; the
      frontier's continuity is held by `map-hint.test.ts`, and
      `hint-frontier.test.ts` ledgers the games that take the frontier directly.
- [x] 4.4 Ran the app (Chrome): a chain frame in light and dark, the dots a
      chain places becoming the next pair's premise, the selection band nested
      inside a hint band, and a journey advancing when followed by hand.

## 5. Record

- [x] 5.1 `docs/games/hints.md` § "A graph, not a grid (Map)", the legend row,
      the Map bullet in § "Shade vs ring", and § "Number the chain" on a game
      without tiles; `engine-catalog.md` on the keyed frontier.
- [x] 5.2 Spec deltas: map (the hint, and dots in `findMistakes`) and ts-engine
      (the keyed frontier and its ledger).

## Engine refactors this change made

- `HintFrontier` keys on an element (`gridKey` for grids), so a graph game
  uses it unchanged.
- `FOUR_NAMES` beside `FOUR_FILLS`, as `TEN_NAMES` is beside `TEN`.

Declined, with the reason: `narrateForcingChain` for Map (two of its three
clauses are line-shaped), and `runCandidatePlan` (its populate-first note model).
