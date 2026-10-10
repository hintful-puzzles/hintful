# Tasks

One engine change. It files no change for a single game: what it finds in a
game goes in its own `design.md`, or to the owner.

## 1. Measure

- [ ] 1.1 List every `retryLimit` call under `src/games/` that bounds a whole
  deal with its own number, with the seconds its run-out takes at the game's
  costliest preset and at the worst size its `validateParams` admits. This is
  the spread the engine's bound replaces.
- [ ] 1.2 Try a deadline armed by `generate` and read by `retryLimit` on
  Rectangles (5x13, expansion factor 2, Unreasonable), Map and Bridges: the
  rate of run-outs at the cells each budget was sized for, against today's.
- [ ] 1.3 Choose the unit and the length (proposal, "What to settle first"),
  and record it in a `design.md` with what was measured.

## 2. Build

- [ ] 2.1 The engine's bound, with tests on a fake game: a deal that never
  finds a board is answered at the bound, a generator called with no deal
  armed is bounded by its count alone, and a deal that ends returns the board
  its seed gives.
- [ ] 2.2 Remove each per-game budget the bound makes idle, a game at a time,
  with the diff read: the generator loses a constant and its sizing comment,
  and no fixture moves.
- [ ] 2.3 In the running app: a type that finds no board (Rectangles, Custom,
  5x5, expansion factor 0.5, Unreasonable) answers within the bound, and the
  rarest type dealt today still deals.

## 3. Close

- [ ] 3.1 Rewrite `docs/games/solver-and-generator.md` § "A size that cannot
  carry a tier" and § "Every retry loop is bounded" around the engine's
  bound, and have a fresh-context reader follow it for a made-up game.
- [ ] 3.2 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.3 Commit, push, archive.
