## 1. Measure

- [x] 1.1 Count the throws: walk hint-guided play on Number Ball and Letters
      at every tier, catching the throw and counting it, and say how many
      boards it took to see the first. (71 of 1,195 Normal boards, none of
      1,800 Easy ones; the table is in the proposal.)
- [x] 1.2 On `5n3Bdx:c2b1aOXbXb3c1OOc`, find the strike the placement of 1 at
      cell 2 rests on, and why the plan did not teach it. (A set's strike of
      the hole symbol at (2,0), dropped by `record` with every other strike
      of it.)

## 2. Fix

- [x] 2.1 The plan teaches that strike, and the ball it leaves (`xNoteGone`).
      The board is pinned as an input.
- [x] 2.2 Salad's rung scan takes Normal Number Ball boards again.
      `repeatFull` leaves the rung list instead of `unreached`: no board can
      fire it. `forcing` leaves `unreached` with a pin.

## 3. Close

- [x] 3.1 The cause is Salad's, not the shared walk's: the classifier that
      threw was right. No other game has a symbol the board settles with a
      marker. What is shared is why no guard met it, a tier no preset
      offers, which is `offer-salad-normal-presets` and
      `walk-every-choice-the-dialog-offers`.
- [x] 3.2 `docs/games/hints.md` § "Non-uniform value sets (Salad)" and the
      help page's Hints section say what changed.
