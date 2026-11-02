# describe-connectivity

**Status: filed by `describe-tiles` (2026-11-02)**, step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Split at its
start, as step 7 split by game: it took Singles, and C as far as Singles
reads it, and filed the rest (Range, Rome, Slant, Boats) as
`describe-cuts-chains-loops-and-fleets`, which files step 9,
`describe-edges-and-divisions`, when its last part is archived.

## Why

Singles ran a hand-written ladder (`singles/solver.ts`, 909 lines: an op
queue with cascades, once-only rules, a flood fill a candidate square)
beside a description that stated only its help. What it read that the
language lacked: C, connectivity over the marks, as the clear squares
joined and the squares without which the uncovered ones would fall apart.

## What Changes

- **C as Singles reads it** in the description language, the ladder
  runtime and the checker: `connected(S)` and `cuts(S)`.
- **Singles' ladder stated**, its tiers as it grades them, and its
  hand-written rungs retired. Its `solveSneaky` is unsound and stays a
  generator hook, saying why.
- **Split at the start**: Range, Rome, Slant and Boats are filed as
  `describe-cuts-chains-loops-and-fleets`.

## Acceptance

Singles runs its compiled ladder for its hint, its generator's laying and
grading, and its answer check; the hand-written rungs removed; every
technique checked sound; the boards dealt, their tiers and the hint walks
compared with HEAD and each difference reported, with which saves or links
no longer load; the guides updated; the rest filed.
