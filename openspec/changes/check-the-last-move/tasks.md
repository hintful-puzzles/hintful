# Tasks

## 1. Before designing

- [x] 1.1 Measure what the second verdict's search costs on each game's largest presets, and find the games it cannot serve
- [x] 1.2 Bring the owner those measurements and a proposed answer to each question in the proposal; wait for their word

## 2. The judge, in the engine

- [x] 2.1 An aimed walk: `ladderWalk`'s `aim`, taken by the driver before the frontier's choice, at any tier, under `fallback` and `prerequisite`
- [x] 2.2 A move's facts from two `CellMarks`, and whether walked marks hold each
- [x] 2.3 `Game.judgeMove` and its verdict type; the judge's run over an aimed walk, direct or chained by the fact graph
- [x] 2.4 `describedFiringHint` supplies `judgeMove` from its spec and step loop
- [x] 2.5 A test: a move a deduction makes is named by its sentence, a guess is not reached, a chain quotes its first step, a mark taken off is not judged (`move-judge.test.ts`; no firing-builder game has notes, so the note case waits for 4.3)

## 3. The midend and the app

- [x] 3.1 `check()` judges the last gesture after a sound verdict; `activeCheck` painted, sent and cleared as a displayed step is (`check.test.ts`)
- [x] 3.2 Refusals and Check without saving answer under the board (`Puzzle.showCheckMessage`); the modal and the toasts go
- [x] 3.3 The words area shows the verdict, led by "Check", a refusal in the warning color
- [x] 3.4 Run the app (Chrome, 2026-11-18): Light Up a followed cross and a mistake at desktop and phone width; Star Battle a followed cross. A guess and a dead end are covered in tests, not seen in the app
- [x] 3.5 Found in 3.4: words longer than the hint room's sizer grow the room and move the board up, here to y=188.625. The canvas is then composited off the pixel grid, and its crosses show fringes. Measured 2026-11-18: the board sat off the grid on load too (x+0.5, y+0.19 at 1280×800), with no hint. The view now snaps the board to whole device pixels on every resize and size transition (`view.ts`, `snapToPixels`); seen in Chrome to hold at 1280 and 412 wide while the words area grows by fractional heights and back

## 4. Every builder

- [x] 4.1 `describedEdgeHint`: its fourteen games and the edge skeleton (the grid skeleton was missed in 2.4, wired now). Guard: `move-judge-games.test.ts`, every judging game calls its hint's first move followed, and a ledger of the hinting games that judge nothing. Seen in Chrome: Bridges and Tents, a followed move. Found: Pearl's `earlyThrough` fired with no pair of sides closing a loop (shape alone locks a side), its sentence false and its outline empty, which crashed the aimed walk; it now needs a pair (soundness check held) Measured 2026-11-18, each judging game's default board: the hint's first eight steps are all judged direct, the slowest judgment 60 ms (Spokes)
- [x] 4.2 `describedHint` (Unruly), the guard holding its first steps direct; seen in Chrome, a followed move
- [x] 4.3 The candidate plan: its eleven games (`candidate-judge.ts`; test `candidate-judge.test.ts`, the guard holding each game's first steps direct). Found: Abcd's second step read as chained, the aim never seeing the rungs that wait for the setup; the setup now goes first when judging
- [x] 4.3.1 Run the app (Chrome, 2026-11-18): Towers at 1280 wide, a placement the board shows and one a chain reaches; Keen at 412 wide, Fill marks (not judged), a chained placement and a struck note. Found and fixed: a ring on a 3D tower just placed threw, the tower's digit raised off its square (Towers now rings the tower's top; the guard paints a verdict in every judging game); a journey's later leg was quoted as "...and"; the verdict's chips all took one color, since hiding a reference to measure its color read only a displayed hint step; a chained verdict said "square" in games that say "cell"
- [ ] 4.4 The games that walk the ladder from their own code (Crossing, Filling, Loopy, Magnets, Net, Pattern, Slant, Subsets), or a recorded decline

## 5. Close

- [x] 5.1 Help: what Check & save says (`help/features.md` § "Checking your work", now with the chained verdict and a square's first notes); `docs/hints.md` on the judge. Found: CI's Gate was red from the first commit of this change, `help-coverage.test.ts` wanting a line for `judgeMove` (the push hook leaves that guard to CI)
- [ ] 5.2 Owner's acceptance (proposal)
