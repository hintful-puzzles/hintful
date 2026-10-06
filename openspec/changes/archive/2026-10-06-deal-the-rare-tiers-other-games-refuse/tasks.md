## 1. Measure

- [x] 1.1 Each cell a `tooRareToDeal` call refuses, re-measured with the
      retry bound lifted: tries a board, seconds a board, and the slowest
      board. The cells beside each refusal were timed too, which is where
      three of the five findings were.

## 2. Decide and build, a game at a time

- [x] 2.1 Keen. Dealt with a bound of five times the mean: 5x5, 7x7 and 8x8
      above Tricky, and 9x9 at Tricky. Still refused: 9x9 above Tricky, at 50
      seconds a board.
- [x] 2.2 Map. Dealt from five squares wide, with nine times the work budget:
      8 regions at Normal, 9 and 10 above it. Refused under five wide, where
      most cells gave no board in a million maps. Three wide at Tricky stays
      refused.
- [x] 2.3 Salad. The 5x5 stays refused at 34 seconds. An 8x8 and up is
      refused too, which was dealt at 75 seconds and more. The 6x6 and 7x7
      are dealt at about 20, as before, and are now held by a test.
- [x] 2.4 Spokes. Every board two squares wide is refused at Unreasonable; a
      2x7 and longer was dealt at 100 seconds a board and more.
- [x] 2.5 Light Up. Still refused, with the wait written beside it.

## 3. Close

- [x] 3.1 Each dealt cell held by a dealt-tier test
      (`describeDealtTiers(..., { seldom: true })`, which Group's now uses
      too), and each `doc` sentence and help page saying what is now true.
      Seen in Chrome: a 7x7 Keen and a 6x6 Map of 8 regions dealt, and a 9x9
      Keen refused with its sentence.
