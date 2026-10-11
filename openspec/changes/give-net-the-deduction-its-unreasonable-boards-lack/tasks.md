# Tasks

## 1. Measure

- [x] 1.1 Write the rule into the hint's engine behind a switch that is off,
  and repeat the proposal's count through the engine itself: of dealt
  Unreasonable boards, how many the four rules finish, at 5x5, 9x9 and 11x13
  and at 7x7 and 11x11 wrapping, 150 boards a size. Done, and the rule came
  apart into three (`design.md`, "What the proposal's rule is made of").
- [x] 1.2 Count how often an Unreasonable board is then drawn at each preset
  and how long a deal takes, and how often a board the four finish and the
  three do not is drawn (`design.md` D6).
- [x] 1.3 Choose between a middle tier and a wider Easy (proposal, "What to
  settle first"), and record the choice and its reason in a `design.md`.
  Neither, as Mosaic chose (D4).

## 2. Build

- [x] 2.1 The engine's fourth reason, with a test on a board where one way of
  turning a tile leaves its neighbor none. The board is a pinned position
  and not hand-built: the reason is looked for only where the others are
  silent, which a hand-built board would have to arrange everywhere.
- [x] 2.2 The hint's rung: sentence, marks, `hintRungs` entry, pins, and the
  help page's entry under "The ideas it teaches".
- [x] 2.3 The tiers as chosen in 1.3, the contract, the generator, the menu,
  and the Unreasonable bounds measured again.
- [x] 2.4 In the running app: deal a board the new rung is needed on, follow
  the hint through that step and read it; deal an Unreasonable board and see
  the hint stop where no turning leaves a neighbor without a way.

## 3. Close

- [x] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 3.2 `docs/games/solver-and-generator.md`: what the measurement in §
  "Giving a deductive game an Unreasonable tier" says of Net, once it is no
  longer true, and `help/games/net.md`, which tells the player to look for
  the rule by hand.
- [ ] 3.3 Commit, push, archive.
