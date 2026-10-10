# Tasks

One engine change. It files no change for a single game: what it finds in a
game goes in its own `design.md`, or to the owner.

## 1. Measure

- [x] 1.1 List every `retryLimit` call under `src/games/` that bounds a whole
  deal with its own number, with the seconds its run-out takes. Done at a
  size each game's tests pin as having no board, 47 cells in 28 games:
  `design.md`, Decision 1. The worst size a `validateParams` admits was not
  walked per game; the spread at the small cells was already 0.05 to 358
  seconds.
- [x] 1.2 Try a deadline armed by `generate` and read by `retryLimit` on
  Rectangles (5x13, expansion factor 2, Unreasonable), Map and Bridges:
  `design.md`, Decision 1.
- [x] 1.3 Choose the unit and the length, and record it in a `design.md` with
  what was measured: wall-clock time, two minutes.

## 2. Build

- [x] 2.1 The engine's bound, with tests on a fake game: a deal that never
  finds a board is answered at the bound, a generator called with no deal
  armed is bounded by its count alone, and a deal that ends returns the board
  its seed gives. Seen red with the count planted back under a deadline.
- [x] 2.2 Remove each per-game budget the bound makes idle, with the diff
  read: the generator loses a constant and its sizing comment, and no fixture
  moves.
- [x] 2.3 In the running app: a type that finds no board (Rectangles, Custom,
  5x5, expansion factor 0.5, Unreasonable) answers at the bound, and the
  rarest types dealt today still deal.

## 3. Close

- [x] 3.1 Rewrite `docs/games/solver-and-generator.md` § "A size that cannot
  carry a tier" and § "Every retry loop is bounded" around the engine's
  bound, and have a fresh-context reader follow it for a made-up game.
- [x] 3.2 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.3 Commit, push, archive.
