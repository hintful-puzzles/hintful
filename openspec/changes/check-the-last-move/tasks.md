# Tasks

## 1. Before designing

- [x] 1.1 Measure what the second verdict's search costs on each game's largest presets, and find the games it cannot serve
- [x] 1.2 Bring the owner those measurements and a proposed answer to each question in the proposal; wait for their word

## 2. The judge, in the engine

- [ ] 2.1 An aimed walk: `ladderWalk`'s `aim`, taken by the driver before the frontier's choice, at any tier, under `fallback` and `prerequisite`
- [ ] 2.2 A move's facts from two `CellMarks`, and whether walked marks hold each
- [ ] 2.3 `Game.judgeMove` and its verdict type; the judge's run over an aimed walk, direct or chained by the fact graph
- [ ] 2.4 `describedFiringHint` supplies `judgeMove` from its spec and step loop
- [ ] 2.5 A test: a move a deduction makes is named by its sentence, a guess is not reached, a chain quotes its first step, a note added is not judged

## 3. The midend and the app

- [ ] 3.1 `check()` judges the last gesture after a sound verdict; `activeCheck` painted, sent and cleared as a displayed step is
- [ ] 3.2 Refusals and Check without saving answer in `activeCheck`; the modal and the toasts go
- [ ] 3.3 The words area shows `activeCheck`, led by "Check", a refusal in the warning color
- [ ] 3.4 Run the app: a followed move, a guess, a cross, a mistake, a dead end, in two firing-builder games

## 4. Every builder

- [ ] 4.1 `describedEdgeHint`
- [ ] 4.2 `describedHint`
- [ ] 4.3 The candidate plan (Latin games)
- [ ] 4.4 The games that walk the ladder from their own code (Crossing, Filling, Loopy, Magnets, Net, Pattern, Slant, Subsets), or a recorded decline

## 5. Close

- [ ] 5.1 Help: what Check & save says (`help/features.md`); `docs/hints.md` on the judge
- [ ] 5.2 Owner's acceptance (proposal)
