# Tasks: shorten-the-untangle-endgame

## 1. Baseline
- [x] 1.1 Re-run `reference/endgame-prototype.test.ts.txt` (see its README)
  against the current hint; record moves-to-solve on the owner's two boards and
  the 24-board population, with load average and free memory beside any timing.
  (Reproduced D4 exactly: 31 → 20; 6.6/31.0/50.9 against 7.4/32.1/50.9.)
- [x] 1.2 Pin the owner's seeded board (`20#343769d2db4f418cccd3b79e00c975d0`) as
  its description plus `aux`, beside the description board already pinned in
  `untangle-hint.test.ts`.

## 2. Culprits
- [x] 2.1 Minimal crossing-hitting sets (branch on a pair's four endpoints),
  per group of crossings sharing no point, grown by a neighbor of a stuck
  culprit when placement fails.
- [x] 2.2 Neighbor-order check against the solved layout, better mirror.
  Decided: a guide that ranks sets, never a mandatory member (D8).

## 3. Placement by face
- [x] 3.1 Faces of the settled drawing, each named by the wedge the line to a
  spot leaves one settled neighbor through (D8).
- [x] 3.2 For a culprit: spots in each face that see all its settled neighbors,
  keeping the hint's gaps, scored by room and pull toward the neighbors.
- [x] 3.3 Backtracking over faces, fail-first; exact verification with `cross()`
  in the board's pairing.
- [x] 3.4 Measure request time at n = 10, 20, 25 against the ~300 ms target:
  79 ms average, 289 ms worst, on a loaded, swapping machine (D8).

## 4. The endgame in the hint
- [x] 4.1 When to fire (30 or fewer crossings, first thing each request; a
  greedy plan stops once it reaches that), fallback to the current steps when
  no journey is found, and the termination rules (D8).
- [x] 4.2 Narration and the marked-point rings, in `hint-text.ts` and
  `render.ts`, under the 120-character ledger.
- [x] 4.3 Tests: the owner's boards finish in about the owner's move count; every
  leg's count, the journey's claim, the marked set and the termination rules
  are checked against the board; a render scenario for the rings; each new
  guard was seen to fail with its defect planted (the unplacing rule only on a
  pinned position, which the per-commit seeds do not reach).

## 5. Records
- [x] 5.1 Spec delta for the `untangle` hint requirement, and remove `skip_specs`
  from `.openspec.yaml`.
- [x] 5.2 `docs/games/hints.md` § "Non-deductive (heuristic) hints": the
  endgame pattern and what it measured.
- [x] 5.3 Run the app (the owner's board solves in 21 moves by hint, every
  leg's sentence checked on screen); owner acceptance of wording, highlight and
  move counts (accepted 2026-09-26).
- [x] 5.4 Follow-up: the mirrored cluster the 25-point walks still thrash on
  (D8, "What is left"), scaffolded as `unflip-a-mirrored-untangle-cluster`.
