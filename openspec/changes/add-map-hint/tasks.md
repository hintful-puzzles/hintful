# add-map-hint — tasks

**Nothing here is started.** Read [`docs/games/hints.md`](../../../docs/games/hints.md)
first — it is the procedure; the proposal is the case.

## 1. Make the ladder addressable (the A2 cost)

- [ ] 1.1 Split `solver.ts`'s inline rungs into named functions over shared
      scratch, keeping the tier caps as one number. The comment above `solve`
      argues *against* splitting ("the tier cap would stop being one number") —
      re-derive that rather than inheriting it, since a recording projection is
      a consumer it did not have.
- [ ] 1.2 Assert the split changed no verdict: the existing differential plus
      "every generated board is uniquely solvable at exactly its stated tier"
      over a fixed seed sweep, before any hint code exists.
- [ ] 1.3 Decide, from the code rather than in advance, whether the rungs then
      go on `runDeductionFixpoint`. Record the answer either way.

## 2. Answer deixis before writing a sentence

- [ ] 2.1 How is a region named in text? Options seen so far: its number (behind
      `showNumbers`, **off by default**), its position relative to a landmark
      the player can see, or nothing at all with the board carrying the whole
      reference. Each is a claim about what the player can find.
- [ ] 2.2 How is a region marked on the board? `hint-mark.ts` bands a **cell's
      border box** and a Map region is a polyomino of half-cell triangles, so
      this is the first thing to test — take a known-firing board and try to
      mark one region with the shared vocabulary. If it cannot, say so in
      `docs/games/hints.md`, because 24 games' worth of adoption currently
      reads as generality.
- [ ] 2.3 Settle 2.1 and 2.2 **together**. They trade against each other: an
      unambiguous outline lets the sentence say "this region", and no outline
      makes the sentence carry it alone.

## 3. The rungs, lowest first

- [ ] 3.1 **Easy — only one color left.** The candidate set is `state.pencil`
      and the player can now enter any of it with one key, so the step can
      place the marks it reasons from as real moves.
- [ ] 3.2 **Normal — the shared pair.** State the premise, do not just announce
      the conclusion: *two neighbors, both down to the same two colors, use both
      between them.* The `equivalentEdges` lesson is that a conclusion which
      does not follow from its own stated premises reads as a non-sequitur.
      One firing = one journey, however many regions it strikes.
- [ ] 3.3 **Hard — forcing chains.** Extract the chain the BFS actually walked,
      not a re-derivation. Number the links; **never draw it as a path** —
      an arrow's "this forces that" was measured false in 34% of links.
- [ ] 3.4 **Unreasonable — refuse.** Say deduction has run out, in the
      collection's shared refusal shape.

## 4. Verify

- [ ] 4.1 A firing census per rung, with a **power argument** where one finds
      zero, and the firing case pinned as the desc the rung consumes.
- [ ] 4.2 The cross-game guards a game joins by having a `hint()` — nothing to
      enroll, but check what they now demand of Map.
- [ ] 4.3 Recompute stability: a Map plan must not swing between recomputes.
      Its natural potential is candidate count, which only falls.
- [ ] 4.4 Run the app. Read every sentence against the board it is pointing at,
      in both color schemes.

## 5. Record

- [ ] 5.1 Whether the shared marks reached a graph — in
      `docs/games/hints.md`, as a finding either way.
- [ ] 5.2 The spec delta for Map's hint, and the tier-honesty statement that
      Unreasonable refuses.
