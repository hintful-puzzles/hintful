# Tasks

## 1. Measure

- [x] 1.1 Re-take the population from the code: every rung below Unreasonable that supposes a mark and propagates to a clash, beyond the four in the proposal (design D1: none)
- [x] 1.2 For each tier in the table, measure what the tier's boards need once the rung is gone: deal boards at HEAD, solve each with the rung stubbed, and list the stalls by what the next markable fact would be (design D3–D5)
- [x] 1.3 Read Boats' trial against `docs/solver-and-generator.md` § "Check, Tactic, Search": if it is a Check, take it out of the population with the reason (design D2: a Check)

## 2. Fill each tier

- [x] 2.1 For each stall shape that recurs across games, design the mark or rung in the engine, and see it deal the tier's boards (a value placed and looked at once: Path's square, Spokes' too-costly line)
- [ ] 2.2 Move each rung to Unreasonable, or retire it, once its tier deals without it; measure boards dealt and dealing time per tier, before and after
  - [x] Path: Normal and Tricky are Checks, the lookaheads retire, Unreasonable is added (D3, D7); the edges skeleton follows
  - [x] Spokes: one spoke tried each way and looked at once, which is seal, too costly and must keep, at Normal; `contradiction-bounded` retires (D4, D8)
  - [ ] Clusters: the two-clue count at Normal; `lookahead-chain` retires, Unreasonable is added (D5, D7)
  - [ ] Boats: the refutation names the filled line (D2)
- [x] 2.3 Bring the owner any tier no markable technique fills, with the measurement and the compatibility cost (none left unfilled; D6, D7)

## 3. Retire what is left

- [ ] 3.1 Retire the static what-if walk and `engine-hints`' exception for a tier-defining supposition rung, with whatever no game still uses
- [ ] 3.2 Help pages, guides and specs of each game touched
- [ ] 3.3 Run each changed game's hint in the app
- [ ] 3.4 The gate, green
