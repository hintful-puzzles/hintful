# rome-implicit-continuity

**Status: scaffolded, not started.** Found by `fold-notes-into-conclusions`,
2026-09-25.

## Why

Rome's plan under the implicit reading is about 0.70 the length of its populate
plan, measured over every leaf preset at six seeds, and by the collection's rule
that makes it a candidate for the default. It was not switched because
`hint-frontier.test.ts` then measured it passing over a continuing firing on
**13.7%** of its jumps (bound: 10%), and **14.1%** with the fold disabled. The
populate plan passes.

A player can pick the implicit reading today, so the jumpier plan already ships
to anyone who chooses "Only as needed" in Rome. The continuity guard never saw
it, because it walks each game's default reading only.

## What to find out

- Which firings the implicit plan jumps to, and what it passed over. The
  instrument is `engine/testing/plan-continuity.ts`; read one jumpy plan out loud
  first (docs/games/hints.md § "Read one plan out loud").
- Whether the jump is real or the instrument's: Rome's `loop` evidence is a
  numbered path of placed squares, and `plan-continuity.ts` reads `area ∪ hatch ∪
  targets`, not the walk's `reads`. One instrument cause is ruled out
  (2026-09-25, `move-seismic-onto-the-candidate-walk` design D4): the instrument
  compared a placed value with pencil bit indices, which Rome's direction bits
  are not, and correcting it moved Rome's implicit figure only from 13.7% to
  13.5%.
- Whether the continuity guard should walk every reading a game offers, not only
  its default, since `candidate-reading.test.ts` already walks the other one for
  liveness.

If the cause is fixed, Rome's default can follow the measurement.
