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

## The owner's answers (2026-10-12)

- **The optimization round comes first**, in the session that filed this.
- **Leaning to the whole suite only in CI**, together with removing or
  shortening the particularly heavy tests, "so that the suite is more
  cost-effective". The change is still to explore every option.
- **B is not to be judged on today's habit of pushing each commit.** If the
  whole suite moves to a pre-push hook, the rule that goes with it is that a
  session pushes at its end, or when the owner asks for an early push. So B
  is "one whole run a session, before its push", and its cost is that a
  deploy, which is how the owner sees work, waits for the session's end.

## The first round (2026-10-12)

**What had grown the input guards was one cause.** `probeBoard`'s `reset`
loads the same board again for every probe point, and since 2026-10-04 to
2026-10-10 the midend holds every board it loads to the game's solver:
`loadDesc` asks `solve` and the difficulty contract, and the tier label asks
the contract again. A reset cost 4.6 ms on Pattern and 10.8 ms on Filling
against 0.01 to 0.07 ms for the click it was resetting for, and the verbs
guard reset Pattern's board for each of 7,744 points, several times over.

The probe's game now remembers what the real game says of a board as dealt
(`src/engine/testing/input-probe.ts`), keyed on the params and desc a state
was built from. A reset is 0.02 ms. A state a move made is never
remembered. Planted: an erase key that marks two squares is still refused by
`target-verb.test.ts`.

| | Before | After |
| --- | --- | --- |
| The 19 files that use the probe | 742 s | 190 s |
| `target-verb.test.ts` | 353 s | 34 to 40 s |
| `input-parity.test.ts` | 169 s | 20 to 34 s |
| `canceled-press.test.ts` | 44 s | 12 to 15 s |

**The stale-step walk keyed every board twice**, and now once
(`hint-resume.test.ts`): Loopy's case 39.6 s to 26.0 s, both at a load near
10.

**The whole selection after the first of those**, same command:

| | Test time | Wall | CPU | Load |
| --- | --- | --- | --- | --- |
| Before | 1,657 s | 901 s | 1,845 s | 6 to 9 |
| After | 1,107 s | 626 s | 1,297 s | 6 to 13 |

That is a third off, and still well above 2026-10-08's 714 s of test time.
Neither pair was taken on a quiet machine.

**In the hook itself**, with `vite build` beside the tests: commit
`a318773b`, before, spent 1,116 s in the main pass; commit `473dcb39`,
which made the two changes above, spent 709 s there and 12 min 38 s in the
gate from start to finish. Both had the plan `ALL`.

**What is left is three walks, and none of it is waste of that kind.**
`hint-resume` (158 s), `hint-quality` (150 s) and `warm-repaint` (108 s) are
38% of what remains. Loopy alone is about 110 s of the first two, and Solo,
Mosaic, Pearl, Pegs and Group most of the rest. The resume walk asks the
mistake check and a whole new plan after every single move, which is what
it is for: shortening it is a trade in what it catches, and belongs with the
options above.

**Found on the way, not mended**: `target-verb.test.ts` compares the set of
boards a key reaches with the set its pointer route reaches, over all
squares together. A planted erase key that acted on the square beside the
cursor passed, because that board is one a click elsewhere also reaches.

## Capabilities

None at filing; the change sets `skip_specs`. A, B and C each move a
requirement of `build-pipeline`.

## Impact

`scripts/gate.sh`, `scripts/checks/select-tests.ts`, `.husky/`,
`.github/workflows/ci.yml`, the five test files, `docs/games/testing.md`
§ "Right-sizing the gate".
