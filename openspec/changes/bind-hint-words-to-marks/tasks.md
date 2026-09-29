# Tasks

## 1. Engine

- [x] 1.1 `hint-words.ts`: roles, kinds, `Narration`, `phrase`, `mark.*`,
      `pronoun`, `narrow`; a unit test writing each falsifier form.
- [x] 1.2 `Game` gains the `Highlights` parameter and the `hintMarks` section;
      `HintStep` gains `words`.
- [x] 1.3 `testing/hint-binding.ts`, run from the hint-quality walk for every
      bound game, with a vacuity count; proved to fail on a planted mismatch
      (Palisade's multi-edge ring narrowed to one edge: six steps red).

## 2. Pilot consumers

- [x] 2.1 The border grid (Palisade, Separate): `borderHintJourney` takes
      narrations and reads each leg's evidence off them; both games bound.
      Separate's "hatched" became "striped"; a continuation leg names the
      edges it rings and the evidence it points back to.
- [ ] 2.2 The candidate walk: `StepWords`/`Premise` carry narrations; `area`
      and `hatch` derived from them; refresh and keep-track narrow the words.
      Every game on the walk bound.
- [ ] 2.3 Signpost: an explained hint, bound from its first commit, with its
      render marks, tier-2.5 tests and help section.

## 3. Help and docs

- [x] 3.1 `{{hint-marks}}` generated from the legend; `help-coverage.test.ts`
      holds placeholder and binding together.
- [ ] 3.2 `docs/games/hints.md`: the mark table points at the roles; a section
      on writing a bound narration (the section landed with 2.1; the table
      follows the candidate walk).
- [ ] 3.3 Spec delta for `ts-engine`; remove `skip_specs`.
- [ ] 3.4 Scaffold the sweep over the remaining hinted games, batched by shared
      machinery.
- [ ] 3.5 Run the app: Palisade, a candidate game and Signpost hints on screen.
