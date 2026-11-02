# describe-runs-sightlines-and-looks

**Status: filed by `describe-on-a-graph` (2026-11-02)**, step 7 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Split at its
start (`design.md` § "The split"): it takes ABCD, and files the other four
games as `describe-sightlines-and-looks`, which files step 8,
`describe-connectivity`, when it is archived.

## Why

ABCD runs a hand-written ladder beside a description that states only its
help. What it reads that the language lacks: Q, a line's stretches (the
maximal runs of a set along a line), and a clue at a pair, a line's number
for one letter.

## What Changes

- **Q as `stretch(L, c, S)`**, and **a clue per value** (`per: value`), in
  the description language, the compiler, the runtime and the checker.
- **A placing technique a variation adds runs only where it is on**, as a
  rung already did: ABCD's diagonal strikes.
- **ABCD described**: its three techniques and its placement strikes
  stated, compiled and checked sound; its hand-written rungs, `placeLetter`
  and `runsForce` retired; its hint's line rungs take their firings from the
  compiled ones; Unreasonable stays the engine's search, over the compiled
  marks.

## Acceptance

ABCD runs its compiled ladder for its hint and its generator; the
hand-written rungs removed; every technique checked sound; the boards dealt
and the hint walks compared with HEAD and each difference reported, with
which saves or links no longer load; the guides updated;
`describe-sightlines-and-looks` filed.
