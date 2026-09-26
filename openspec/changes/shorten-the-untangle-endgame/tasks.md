# Tasks: shorten-the-untangle-endgame

## 1. Baseline
- [ ] 1.1 Re-run `reference/endgame-prototype.test.ts.txt` (see its README)
  against the current hint; record moves-to-solve on the owner's two boards and
  the 24-board population, with load average and free memory beside any timing.
- [ ] 1.2 Pin the owner's seeded board (`20#343769d2db4f418cccd3b79e00c975d0`) as
  its description plus `aux`, beside the description board already pinned in
  `untangle-hint.test.ts`.

## 2. Culprits
- [ ] 2.1 Minimal crossing-hitting sets (branch on a pair's four endpoints).
- [ ] 2.2 Neighbor-order check against the solved layout, better mirror;
  decide how to treat vertices outside 3-connected parts (design D3 caveat).

## 3. Placement by face
- [ ] 3.1 Faces of the settled (crossing-free) drawing.
- [ ] 3.2 For a culprit: the faces holding all its settled neighbors, the region
  inside one that sees them all, and a roomy point in it that keeps the hint's
  gaps.
- [ ] 3.3 Backtracking over faces; exact verification with `cross()` in the
  board's pairing.
- [ ] 3.4 Measure request time at n = 10, 20, 25 against the ~300 ms target.

## 4. The endgame in the hint
- [ ] 4.1 When to fire (smallest re-placeable culprit set within a budget), and
  fallback to the current steps when a plan fails. Keep termination and
  recompute stability (design, "Constraints to keep").
- [ ] 4.2 Narration and the culprit highlight (design D5), in `hint-text.ts`,
  under the 120-character ledger.
- [ ] 4.3 Tests: the owner's boards finish in about the owner's move count; the
  population's average moves fall; every count is checked against the board;
  prove each new guard fails before trusting it.

## 5. Records
- [ ] 5.1 Spec delta for the `untangle` hint requirement (grep the live spec for
  the sentence being changed first), and remove `skip_specs` from
  `.openspec.yaml`.
- [ ] 5.2 `docs/games/hints.md` § "Non-deductive (heuristic) hints": the
  endgame pattern and what it measured.
- [ ] 5.3 Run the app; owner acceptance of wording, highlight and move counts.
