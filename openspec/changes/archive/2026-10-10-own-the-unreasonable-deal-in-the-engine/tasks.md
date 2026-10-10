# Tasks

One engine change. It files no change for a single game: what it finds in a
game goes in its own `design.md`, or to the owner.

## 1. Read

- [x] 1.1 Read the Unreasonable generator of each of the twelve games and
  tabulate it (proposal, "What to settle first"). Record the table in a
  `design.md`.
- [x] 1.2 Decide what the engine takes, and which games keep their own and
  why. All twelve fit one loop and eight of them one strip, so it was built
  as filed (`design.md`, "What they share").
- [x] 1.3 Time `hintFinishes` against board size on three games, and say
  where the cost is. Five were timed: it is in the game's own planning
  (`design.md`, "What `hintFinishes` costs").

## 2. Build

- [x] 2.1 The engine's deal of an Unreasonable board, with tests on a fake
  game: it keeps a board only with one answer that deduction stops short of,
  and it runs its bound out where there is none. Each test was seen to fail
  with its defect planted.
- [x] 2.2 Move the games to it, the two already read first (Sticks,
  Rectangles), then the rest, each with its own tier tests passing unchanged.
  No fixture was pinned to a seed that moved: 3,840 boards dealt by the old
  generators and the moved ones on the same seeds are the same.
- [x] 2.3 The fix to `hintFinishes`, if 1.3 found the cost there. It did not,
  and `hintFinishes` is unchanged.
- [x] 2.4 In the running app: an Unreasonable board dealt in Sticks,
  Rectangles, Pattern, Net and Separate, and the hint followed to the step
  where it says nothing further follows by deduction.
- [x] 2.5 A guard that holds a game that gains the tier later to the engine's
  deal, seen to fail with a bypass planted in Crossing.

## 3. Close

- [x] 3.1 `docs/games/solver-and-generator.md` § "Giving a deductive game an
  Unreasonable tier": what a game writes for the tier, as it now is.
- [x] 3.2 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 3.3 Commit, push, archive.
