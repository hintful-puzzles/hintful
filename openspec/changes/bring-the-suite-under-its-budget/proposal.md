# bring-the-suite-under-its-budget

**Status: filed 2026-11-09** by the session that took on
`repeated-hints-always-finish-the-board`, from CI going red on `main`.

## Why

CI's gate fails a run whose whole suite costs more than `MARGIN × BUDGET.suite`
(`scripts/checks/test-cost.ts`: 40 minutes, failing past 50), in reference
seconds. On 2026-11-09 the suite read 44.1 minutes on the run for `47f1ae36`
(over budget, named, within the margin) and 52.3 minutes on one of the two
runs for `e447c88a`, a documentation-only commit, which failed. The same tests
landing either side of the margin is what an over-budget suite does on
runners that differ, and the guide's rule is to cut, never to raise the
budget (`docs/testing.md` § "What runs when", the paragraph on the budgets).

The cost is spread, not one file's: on the failed run the heaviest were
`hint-resume` (four shares, 350 s together), `hint-quality` (four shares),
`ladder-continuity` (97 s), `candidate-reading` (97 s), `desc-error-games`
(94 s), `hint-ink`, `hint-overlay`, `hint-gesture`, `wrong-entry-check`,
`warm-repaint`, `hint-mark` and `hint-frontier`, each 70 to 90 s. Read the
current figures from the newest CI run before acting on these
(`gh run view <id> --log | grep -E "^ +[0-9]+ s +src/"`).
`hint-finishes-any-board.test.ts`, added the same day, costs about 26 s.

## What Changes

- Bring the suite at or under 40 minutes on CI, with room for the runner
  spread, by the guide's three treatments in their order (write a searched
  board down, turn a seed count down with `seedBudget`, defer to the slow
  tier), starting with the files above.
- Look first for overlap between the cross-game hint walks: `hint-resume`,
  `hint-quality`, `hint-overlay`, `hint-ink` and `hint-mark` each walk every
  hinted game's boards, and a walk two of them share could be dealt and
  played once.

- **A game's own files get a deep tier** (owner, 2026-11-09: "we'll be
  looking to add dozens more games, so I'd prefer that as little as possible
  of the CI run time be game-specific"). CI runs each game's own files in a
  shallow form. What only adds confidence about that one game runs where the
  game is worked on: in the hook whose scope names it, in a push whose shared
  code reaches it, and by hand. The cost report holds each game's own files
  in CI to `BUDGET.game`.

## Acceptance

- One CI gate run on `main` reads under 30 minutes (owner, 2026-11-09,
  replacing three consecutive runs under 40, so that the next weeks' games
  do not bring the suite back over).
