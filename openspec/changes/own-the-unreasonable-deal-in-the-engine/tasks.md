# Tasks

One engine change. It files no change for a single game: what it finds in a
game goes in its own `design.md`, or to the owner.

## 1. Read

- [ ] 1.1 Read the Unreasonable generator of each of the twelve games and
  tabulate it (proposal, "What to settle first"). Record the table in a
  `design.md`.
- [ ] 1.2 Decide what the engine takes, and which games keep their own and
  why. If fewer than about eight fit one shape, say so to the owner before
  building: the change may be smaller than filed, or not worth making.
- [ ] 1.3 Time `hintFinishes` against board size on three games, and say
  where the cost is.

## 2. Build

- [ ] 2.1 The engine's deal of an Unreasonable board, with tests on a fake
  game: it keeps a board only with one answer that deduction stops short of,
  and it runs its bound out where there is none.
- [ ] 2.2 Move the games to it, the two already read first (Sticks,
  Rectangles), then the rest, each with its own tier tests passing unchanged
  except where a fixture is pinned to a seed.
- [ ] 2.3 The fix to `hintFinishes`, if 1.3 found the cost there.
- [ ] 2.4 In the running app: an Unreasonable board dealt in three of the
  moved games, and the hint stopping where deduction does.

## 3. Close

- [ ] 3.1 `docs/games/solver-and-generator.md` § "Giving a deductive game an
  Unreasonable tier": what a game writes for the tier, as it now is.
- [ ] 3.2 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.3 Commit, push, archive.
