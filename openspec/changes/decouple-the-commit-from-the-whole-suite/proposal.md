# decouple-the-commit-from-the-whole-suite

**Status: a draft, filed 2026-10-12 on the owner's word. It waits for the
owner's choice among the options below.** It has no `tasks.md` until then.

## Why

The owner, 2026-10-12, after a commit sat in the gate for 19 minutes: "we are
really wasting time here", and is open to running the whole suite only in CI,
or only before a push, or something else.

`keep-the-precommit-well-under-ten-minutes` (2026-10-08) brought the hook's
dearest selection to 387 s. Four days and 173 commits later it is more than
twice that. Every figure below was taken on 2026-10-12 on this machine;
re-take it before designing against it.

## What was measured

**The hook's dearest selection, then and now.** Every test selected, the
hook's toggle set, one run under `/usr/bin/time`:

| | Test time | Wall | CPU (`user + sys`) | Load |
| --- | --- | --- | --- | --- |
| 2026-10-08, that change's "after" | 714 s | 387 s | 865 s | 4 to 5 |
| 2026-10-12, commit `a318773b` in the hook | 2,062 s | 1,116 s | not taken | 12 to 14 |
| 2026-10-12, the same tree, re-run | 1,657 s | 901 s | 1,845 s | 6 to 9 |

CPU time is the figure least moved by what runs beside it, and it doubled.
So this is growth in the suite and not only a busy machine, though the two
runs were not at one load and a quiet pair has not been taken.

**Where it is.** Five files are 64% of the re-run's test time
(`node rank.mjs` over `vitest run --reporter=json`):

| File | Test time |
| --- | --- |
| `src/engine/target-verb.test.ts` | 353 s |
| `src/engine/hint-resume.test.ts` | 226 s |
| `src/engine/hint-quality.test.ts` | 184 s |
| `src/engine/input-parity.test.ts` | 169 s |
| `src/engine/warm-repaint.test.ts` | 123 s |

All 247 test files under `src/games/` are 396 s between them. The earlier
change left `target-verb`, `warm-repaint` and `input-parity` at 227 s between
them, as walks with nothing more to take off; they are 645 s now. What grew
them is not known: seven commits touched those files or the dealing helpers
since 2026-10-08 (`git log --since=2026-10-08 -- <the five files>
src/engine/testing/`), and none has been measured before and after.

**What makes a commit pay for all of it.** The hook's selector gives a
commit that touches the engine, the midend or the registry the plan `ALL`.
Commit `a318773b` got it for a changed comment in `src/games/index.ts`. A
commit that touches one game runs that game's cases only: the same five
files, narrowed to one game, cost seconds (the trial game's
`warm-repaint` case took 0.2 s).

**What already runs after a push.** CI runs the whole gate on every push to
`main`, beside the deploy and not in front of it. Its last eleven runs took
14 to 28 minutes, and four were canceled by a newer push
(`cancel-in-progress`), so a commit's whole run is not sure to finish. The
hook ends by saying so when the last finished run failed. There is no
pre-push hook.

## The options

**A. The whole suite runs only in CI.** The hook keeps the prefix, the source
scans, and the narrowed plan, and never runs `ALL`. A commit costs one to
two minutes whatever it touches. The cost: an engine commit's cross-game
verdict arrives 15 to 28 minutes later, from a run that a newer push
cancels, and on a trunk where the next session has already built on it. It
needs CI to stop canceling, and a red run to stop the next commit and not
only be mentioned.

**B. The whole suite runs before a push.** No gain as work is done here: a
session pushes each commit as it makes it, so the wait moves by seconds. It
helps only a session that makes several commits a push.

**C. The whole suite runs after the commit, on this machine, and does not
block.** The hook is as in A. A commit whose plan was `ALL` starts the five
walks in the background when it lands, and the verdict is a file the next
hook reads: red refuses the next commit until it is looked at. The session
keeps working while it runs. This keeps the verdict local, about ten
minutes behind, and independent of CI's cancellations. The cost is a
mechanism to build and a working tree that must not be what the background
run reads (it runs from the commit, in a worktree or an archive).

**D. Another round on the five files.** Find what doubled them since
2026-10-08 and take it back. This is owed whichever of A to C is chosen,
because CI and any background run pay the same bill, and it may be most of
the answer by itself.

## Recommendation

D first, since a doubling in four days is more likely one cause than five,
and it is cheap to look for. Then C over A: the walks that are dear are the
ones that catch an engine change breaking a game it did not touch, and A
leaves that to a run that is canceled a third of the time.

Separately, and small: a commit that changes only comments in a file should
not get the plan `ALL`.

## Capabilities

None at filing; the change sets `skip_specs`. A, B and C each move a
requirement of `build-pipeline`.

## Impact

`scripts/gate.sh`, `scripts/checks/select-tests.ts`, `.husky/`,
`.github/workflows/ci.yml`, the five test files, `docs/games/testing.md`
§ "Right-sizing the gate".
