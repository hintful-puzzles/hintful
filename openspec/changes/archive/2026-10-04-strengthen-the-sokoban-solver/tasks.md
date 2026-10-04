## 1. Measure

- [x] 1.1 Re-take the baseline: openings solved within each budget per preset
      (design D1), the generator's rejections and deal time (D8), and the
      worst hint request per preset (D8). Positions are the figure compared;
      times are upper bounds, taken under load and paging (design, "How things
      were measured").
- [x] 1.2 Trace where the stalled searches spend their budget (D2).

## 2. Prune and rank

- [x] 2.1 Corral pruning (`searchPushes`), kept: little alone, half the
      positions once the ranking is in (D4).
- [x] 2.2 Rank a push by its distance from what is out of place (`farFrom`),
      the change that moved the baseline (D3).
- [x] 2.3 The fence check made at expansion (D5).
- [x] 2.4 Macros and incremental keys measured and dropped, with a ranking by
      targets filled too soon, last-in-first-out ties and either side alone
      (D6).

## 3. The hint

- [x] 3.1 The potential check stops at the first rival that lowers it, and
      searches those rivals to the plan's budget (D7).
- [x] 3.2 The five pinned positions the new lines moved, and the board whose
      line comes straight back, found again by the scan.

## 4. Close

- [x] 4.1 `DEAL_BUDGET` and `PLAN_BUDGET` re-chosen from the new figures (D8),
      and the deal's loop bounded.
- [x] 4.2 docs/games/hints.md § "Judge the rivals of a searched move" and the
      solver's header updated with what was measured.
- [x] 4.3 Tests: the verdicts against trying every push, the corral rule's
      three cases, and three openings pinned within the deal's budget, each
      seen red with its defect planted.
