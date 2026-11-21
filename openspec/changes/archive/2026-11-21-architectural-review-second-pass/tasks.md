## 1. The review

- [x] 1.1 Re-read `archive/2026-11-20-architectural-review/design.md` and,
      for each item, the archived change that made it. Record what each left
      in place, measured.
- [x] 1.2 Measure what games repeat, the engine and its contract, the
      game-keyed lists in guards, the describe compiler and ladder runtime,
      and the tests, tooling and guides. Record each count with its query
      and the commit it was taken at (`design.md` § "The ranked list").
- [x] 1.3 Rank by payoff at dozens to hundreds of games. A cost every new
      game or every cross-game guard pays ranks above a one-off cost in a
      large file.
- [x] 1.4 Deliver the list to the owner, and wait for their pick.
      2026-11-21: delivered at `22ba4e45f`.

## 2. The owner's pick

- [x] 2.1 Scaffold each pick as its own change, in the owner's order. This
      change is archived once the picks are filed.
      Owner, 2026-11-21: "please take on all of these, including 7. It's
      absolutely ok to change things a player sees in order to make them
      more consistent across games" (recorded in `docs/doctrine.md` §
      "Nothing is sacred"). No order given, so the rank order: 1
      `ci-gate-scales-with-games`, 2 `describe-adapters-from-the-engine`,
      3 `redraw-takes-a-frame`, 4 `one-way-to-paint-hint-marks`, 5
      `walk-a-hint-plan-once`, 6 `trim-the-route-every-game-reads` (after
      2–5, whose passages it removes), 7 `one-board-area-bound`, 8
      `derive-the-wrong-board-pin`, 9
      `seams-in-the-hint-and-ladder-runtimes`.
