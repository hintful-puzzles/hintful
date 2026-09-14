# add-seismic-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first — it is the
procedure; `AGENTS.md` § "Hint quality bar" is the bar. The measurement is
[`findings.md`](./findings.md).

## 0. Re-take the claims, and the baseline

- [x] 0.1 Seismic was hintless; three rungs (`marks`, `areas`, `attempt`) on
      `runDeductionFixpoint`, a generator that gates at `diff` and rejects
      `diff − 1`, and a ladder-equivalence test — as the audit said.
- [x] 0.2 Read `add-tracks-hint` and `add-bridges-hint`'s `findings.md`.
- [x] 0.3 Baseline: `generator` 398, `index` 372, `render` 397, `solver` 376,
      `state` 515 = **2,058 production lines**.

## 1. Engine refactoring survey

- [x] 1.1 Taken: candidate helpers read `grid.length` rather than `w * w`;
      `nakedSingle` takes a `NoteEncoding`; `obviousCleanStep` split out of
      `emitObviousCleanStep`; `OverlaySidecar` keys evidence cells on their
      outline sides. Declined with reasons: the single-firing driver, a shared
      census helper (`findings.md` §3–4).
- [x] 1.2 None was its own coherent unit: each is a few lines, found by and
      needed for this hint, and covered by its own unit test.

## 2. The hint

- [x] 2.1 `hint.ts` deduces from the player's notes (sound because
      `findMistakes` vouches for every note); `hint-text.ts` holds the five
      sentences; `render.ts` rings targets, outlines evidence and strikes notes
      through; `pencilStrike` added to `SeismicMove`. Generator path untouched.
- [x] 2.2 `attempt` is a Check (`findings.md` §2), held to `placeNumber` +
      `regionsViable` by `seismic-hint.test.ts`.
- [x] 2.3 Spec delta for the hint; `skip_specs` removed.
- [x] 2.4 Purity: the shared region `Dsf` is compressed once when read, so
      `hint()` no longer rewrites it (`hint-resume.test.ts`).

## 3. Report and accept

- [x] 3.1 `findings.md`: +583 / −24 game lines, of which +335 the deduction
      projection; +87 / −31 engine.
- [x] 3.2 Ran the app in Chrome and read six step kinds in place;
      `help/games/seismic.md` gains a Hints section.
- [x] 3.3 `docs/games/hints.md` (deducing from notes, the outline diff key, the
      Seismic legend row, the band placement), `solver-and-generator.md`
      (`attempt` as a Check) and `rendering.md` (the outline lane).
- [x] 3.4 `openspec validate --all --strict`, then the gate.
