# Tasks

## 1. The engine's reference contract

- [x] 1.1 `ReferenceModel` carries `title`, `instructions`, `sections` and `hinted`; `ReferenceItem.status` gains `"ruledOut"`; Dominosa's `reference()` fills one unheaded section. Verify: `npm run typecheck`, `dominosa.test.ts`.
- [x] 1.2 `getReference()` marks the board helped (D2). Verify: a midend test that the timer reads assisted after `getReference()` on Dominosa and not before; see it fail with the line removed.
- [x] 1.3 `HintStep.reference` and the midend's `hinted` (D3); `describedEdgeHint`'s leg may carry `reference`. Verify: a midend test with a stub game.

## 2. The panel

- [x] 2.1 `reference-panel.ts` renders title, instructions, headed sections, ruled-out and hinted items, with no game named; refetches when the displayed hint changes. Verify: run the app on Dominosa, panel unchanged in look; `puzzle-screen.test.ts`.

## 3. Wordtrail

- [x] 3.1 The dictionary (D4): `reference`/`selectReference`, the spotlight drawn as a render bit and cleared on a board press. Verify: a test of statuses on a board with a crossed edge (the spec's scenario) and of the spotlight's frame.
- [x] 3.2 The hint names its words or counts them (D5), and each step names its words as reference items. Verify: `wordtrail-hint.test.ts` scenarios, `npm run describe` lint.
- [x] 3.3 Help text: the dictionary, and the hint marking its words. Verify: help-coverage.

## 4. Wordguess

- [x] 4.1 Remove the answer row: the mark move, Marks mode, rule-outs, `findMistakes`, the render's answer row and its layout. Verify: `wordguess.test.ts`, `wordguess-render.test.ts` updated.
- [x] 4.2 The hint is the guess step alone (D6); the description's techniques go. Verify: `wordguess-hint.test.ts`, incl. "following the hint wins on every preset".
- [x] 4.3 The dictionary (D7): words from `fittingIn`, selecting writes the working row. Verify: a test of the spec's scenario.
- [x] 4.4 Help text rewritten for no answer row, with the dictionary. Verify: help-coverage.

## 5. Docs and finish

- [x] 5.1 `docs/mechanics.md` § "The reference aid": sections, help, hinted items. Verify: read through.
- [x] 5.2 Run the app: both word games' dictionaries, Dominosa's panel, a hint marking words, "with help" on finish. Verify: screenshots.
- [ ] 5.3 `npm run test:hint-sweeps`, then commit and push.

## Workflow follow-up

- Archive; then update the `wordguess` spec's Purpose, which a delta cannot
  reach (it still names the answer row).
