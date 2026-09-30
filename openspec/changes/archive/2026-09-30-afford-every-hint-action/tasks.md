# Tasks

## 1. Engine

- [x] 1.1 `hint-gesture.ts`: `PointerAction`, `click`, `drag`, `key`, `MARK_ALL_CODE`
- [x] 1.2 `Game.hintGesture`; `Midend.executeHint` plays the gesture through `interpretMove`, judged by `hintKeepTrack`, and throws on a stray move, an off-screen key, a short gesture or a missing gesture
- [x] 1.3 Replay a declined press as the frontend does (its release, no drag)
- [x] 1.4 `midend.test.ts`: each refusal fires, a multi-move step completes on its last move, a click is a press and its release
- [x] 1.5 `TargetGeometry.pointAt` (required), `verbGesture`, `routeGesture`; `target-verb.test.ts` holds `pointAt` to its target (seen red with a planted off-by-one)
- [x] 1.6 `noteEntryGesture` (`note-taking-cell.ts`), `candidateGesture` (`candidate-hint.ts`), `digitKeyCode` (`key-labels.ts`)
- [x] 1.7 `hint-gesture.test.ts`: every hinted game's plans walked with `executeHint` on every gate preset

## 2. Games

- [x] 2.1 Every hinted game declares `hintGesture`, and its `hintKeepTrack` follows each move of a multi-move step
- [x] 2.2 Each step the pointer could not make is fixed in the hint, and recorded in `design.md` D5
- [x] 2.3 A candidate strike the mark-all control makes whole is played by one press of it (`markAllNow`), and keep-track completes it
- [x] 2.4 Palisade and Separate share `borderHintGesture`

## 3. Docs and close

- [x] 3.1 `docs/games/hints.md` § "Every step is a gesture"; engine catalog entry
- [x] 3.2 `docs/games/input.md`: a hint's gesture is the pointer's route, and where it is checked
- [x] 3.3 Run the app: auto-solve played Net to completion (locks through the notes route) and Solo through taps and keypad keys, no console errors
- [ ] 3.4 Gate, commit, archive
