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
- [x] 2.2 The candidate walk: `StepWords`/`Premise` carry narrations; `area`
      and `hatch` derived from them (`evidenceOf`); refresh and keep-track
      narrow the words. All eleven games on the walk bound, under both
      readings. The cull after a placement outlines the value just placed
      (`placedRulesOut`); the binding walk found Map's pair-dot legs claiming
      a partner's dots not yet on the board, and they now mark only the region
      they dot.
- [x] 2.3 Signpost: an explained hint (follows, only next, only before),
      bound from its first commit, with the arrow as a mark kind of its own,
      tier-2.5 frame test (proved red with the arrow in ink) and help section.

## 3. Help and docs

- [x] 3.1 `{{hint-marks}}` generated from the legend; `help-coverage.test.ts`
      holds placeholder and binding together.
- [x] 3.2 `docs/games/hints.md`: § "Bind the words to the marks"; the mark
      table points at the roles.
- [x] 3.3 Spec delta for `ts-engine`; `skip_specs` removed.
- [x] 3.4 Scaffold the sweep: `bind-the-remaining-hints`, with the pilot's
      open questions.
- [x] 3.5 Run the app: Signpost's arrow, ring and stripes, and Keen's cull with
      the placed number outlined, on screen in Chromium.
