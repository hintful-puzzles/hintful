# Tasks

## 1. Measure

- [ ] 1.1 Write the comparison into the solver behind a switch that is off,
  and repeat the proposal's count through the solver itself: of the boards
  the rule stops short on that have one answer, how many the two finish, at
  5x5, 10x10 and 25x25, with aggressive generation and without.
- [ ] 1.2 Count what side-by-side pairs alone finish, against pairs at any
  overlap, and choose which the hint narrates.
- [ ] 1.3 Count how often an Unreasonable board is then dealt at each preset
  and how long a deal takes, with aggressive generation and without.
- [ ] 1.4 Choose between a middle tier and a wider Easy (proposal, "What to
  settle first"), and record the choice and its reason in a `design.md`.

## 2. Build

- [ ] 2.1 The solver's comparison, with a test on a hand-built board where
  neither number decides anything alone.
- [ ] 2.2 The hint's rung: sentence, marks, `hintRungs` entry, pins, and the
  help page's entry under "Every step is one of two ideas".
- [ ] 2.3 The tiers as chosen in 1.4, the contract, the generator at both
  settings of aggressive generation, the menu, and the bounds in
  `mosaic/state.ts` measured again.
- [ ] 2.4 In the running app: deal a board the new rung is needed on, follow
  the hint through that step and read it; deal an Unreasonable board and see
  the hint stop where no two numbers decide a square.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `docs/games/solver-and-generator.md`: what § "Giving a deductive
  game an Unreasonable tier" says of Mosaic, once it is no longer true.
- [ ] 3.3 Commit, push, archive.
