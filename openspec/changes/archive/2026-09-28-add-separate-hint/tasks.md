# Tasks

## 1. Ladder

- [x] 1.1 Split `solverAttempt` into `shared-letter`, `walled-apart`, `only-way` on `runDeductionFixpoint`, returning per firing only when recording
- [x] 1.2 Keep the hand-written loop as `solverAttemptLegacy`; `separate-ladder.test.ts` over generator runs, census with no `unreached`
- [x] 1.3 Plant a reversed extension order (ladder test and differential red) and a silenced `walled-apart` (census red); restore
- [x] 1.4 Measure generation cost against the legacy loop

## 2. Engine: the border grid's hint layer

- [x] 2.1 `engine/border-grid-hint.ts`: `BorderHint`, `borderHintJourney`, `borderHintKeepTrack`
- [x] 2.2 `hintTileBits` and the evidence flags in `border-grid-render.ts`, drawn by `drawBorderTile`
- [x] 2.3 `edgeContinuation` into `engine/hint-text.ts`
- [x] 2.4 Move Palisade onto them; its snapshots unchanged
- [x] 2.5 Flag-collision test covers every exported flag, pairwise
- [x] 2.6 Engine catalog entry

## 3. Separate hint

- [x] 3.1 `separateRecordingPass`: seed from the player's marks, drive `singleFirings`
- [x] 3.2 `hint`, `hintKeepTrack`, `hint-text.ts`, palette entries
- [x] 3.3 `separate-hint.test.ts`: partial-board walks, arm census with ledger, pinned two-edge `only-way`, keep-track, refusal, tier-2.5 frame
- [x] 3.4 Cross-game hint guards pass for Separate
- [x] 3.5 Run the app: opening frame, hatched/outlined frames

## 4. Docs

- [x] 4.1 `docs/games/hints.md` and `solver-and-generator.md`
