## 1. Decide

- [ ] 1.1 Owner: is a check that finds only provable mistakes what Check & Save
      means in Black Box and Mines, and what does it say when it finds none?

## 2. Black Box

- [ ] 2.1 `findMistakes` from `deduce`: a guess on a settled empty square, a known
      mark on a settled ball. A test that it reads nothing hidden, in the shape
      of the hint's own.
- [ ] 2.2 Drop the `notApplicable.findMistakes` excuse; re-read which of the
      hint's conflict moves are still reachable once the midend refuses first.

## 3. Mines

- [ ] 3.1 `findMistakes` from the hint's deductions over the opened numbers: a
      flag on a square they prove safe.
- [ ] 3.2 Drop the excuse; re-read the hint's "the flag must come off" leg.

## 4. Docs and acceptance

- [ ] 4.1 docs/games/hints.md § "A mark nothing can check is a claim, not a
      premise (Mines)" and the help pages say what the check now does.
- [ ] 4.2 Run both games in the app; owner acceptance on the check's behavior.
