# rerun-only-what-a-firing-touched

**Status: filed by `describe-loopy-net-pearl-tracks-and-tents` (2026-11-08),
on the owner's choice** to take Loopy's speed shortfall as an engine change
and not hold the push for it.

## Why

A compiled ladder runs on `runDeductionFixpoint`, which after every
productive technique starts again from the easiest. Each technique run from
the top scans its whole first binder, though nearly all of them find nothing,
since one firing changes a few elements and most techniques read none of
them.

Loopy, described, deals 2–3× slower than its hand-written ladder, which
propagated from what changed. Measured with `deal-compare` (2026-11-08, mean
and worst against HEAD's mean):

| Preset | Described | HEAD |
| --- | --- | --- |
| 9x14 Triangular Hard | 1.24 s (1.53 s) | 0.54 s |
| 9x9 Cairo Hard | 0.85 s (1.01 s) | 0.24 s |
| every preset | 0.37 s | 0.12 s |

The first is over the owner's bar (a large preset may take up to 1 s), and
the second touches it. The policy is the engine's, so every described game
pays it, and Net, Pearl, Tracks and Tents are described next.

## What Changes

- **A technique that found nothing is skipped until something it reads
  changes.** The restart from the easiest stays, so which technique fires
  first, and so every tier a board is graded at, is unchanged: a technique
  is deterministic in the marks, so one that found nothing on marks it reads
  unchanged finds nothing again.
- **What a technique reads is the compiler's to say.** It knows each
  technique's mark reads (the candidates, the line marks, a mark on the
  angles, the edge relation, a set the runtime keeps), so a compiled
  technique carries them, and `CellMarks` keeps a version for each that a
  fact bumps. A hand-written technique declares none and is always run, as
  now.
- **Finer grain is measured, not assumed.** A version per kind of mark may
  skip too little where every firing touches the kind every technique
  reads (Loopy's lines). Whether the first binder should run only over the
  elements that changed is decided by the measurement in task 1.

## Acceptance

- Every described game's boards and tiers are identical with HEAD's, by
  `deal-compare` at every cap, and its hint walks are unchanged: a walk
  takes one firing a call and is not affected, which a test says.
- Loopy's large presets are under 1 s, timed back to back with HEAD, and no
  described game is slower.
- A planted defect (a technique skipped though its read changed) fails a
  test that runs the ladder with and without skipping and compares every
  firing.
- `deduction-fixpoint.ts`'s header and `docs/solver-and-generator.md`
  § "The deduction fixpoint" say what the runner skips and why it is safe.
