# Design

Every figure here was taken on 2026-10-12 on the owner's machine, which was
never quiet: the load is stated beside each.

## What was measured

**The hook's whole selection, after the first round** (task 2.1). One run,
`GATE_PRECOMMIT=1`, the main pass, two workers:

| Test time | Wall | CPU | Load |
| --- | --- | --- | --- |
| 1,005 s | 554 s | 1,174 s | 8.3 falling to 6.9 |

**It is per-game work, spread thin.** Of the 1,005 s, 331 s is the games' own
test files, 549 s is cases titled `<id>: …` in the cross-game guards, and 124 s
is everything else. That is 880 s over 57 games with a median of 7.5 s a game.
Loopy is 135 s, Solo 65 s, Mosaic 65 s, Group 45 s, Sixteen 43 s. No file and
no game is a waste of the first round's kind: the three heaviest files are
161 s, 157 s and 118 s, each a sum of fifty small cases and two or three dear
ones.

**The machine gives the suite two workers**, by the owner's decision of
2026-09-09 (`vitest.config.ts`, `CONCURRENT_REPOS`), so wall is test time over
1.8. With six, the whole suite once measured 97 s.

**What a commit costs today** (task 2.3), in the gate from start to finish:

| Commit | Today |
| --- | --- |
| One game (Pearl) | 3 min 26 s, load 8 |
| The engine (`473dcb39`) | 12 min 38 s |
| A comment in the registry (`a318773b`) | 19 min, before the first round |

The one-game commit is not seconds: 235 s of test time, because the guards
whose cases are not titled for a game run whole (Loopy's `target-verb` case
alone is 41 s), and every other game's test file that imports the registry runs
too.

**CI as it is** (task 2.4), from `gh run list` over the 291 finished runs since
2026-09-15:

- 179 passed, 93 were canceled by a newer push and 19 failed. Since 2026-10-08:
  145 runs, 57 canceled (39%), none failed.
- As many as seven runs in a row were canceled, so a commit went seven pushes
  without any run finishing on it or on a later tree.
- A passing run takes 19.7 minutes at the median and 26 at the ninetieth
  percentile.
- **A red run stood for hours.** There were nine red spells between
  2026-10-04 and 2026-10-07, when CI was the first to report what the hook left
  out. They stood 1.5 to 20.3 hours, with 3 to 18 pushes made on top of each.
  The notice the hook prints came on 2026-10-08, and nothing has failed since,
  with the hook running every game on an engine commit.
- The repository is public, so runner minutes are not billed. Letting a run
  finish costs nothing but its place in the queue.

**What the three walks have caught** (task 2.2), from the archive and the log:

- `hint-resume`, the walk: Untangle's and Inertia's loops and Sixteen's
  period-4 cycle, each an instability between two consecutive recomputes of a
  searching or moving hint; thirteen refusals at the Unreasonable tier on its
  smallest boards; and the founding Singles defect, a hint that could not
  resume from any position the player had reached. For a deducing hint, a
  recomputed walk and one replayed plan gave the same firings on 24 Spokes
  boards at a tenth of the cost (`measure-the-search-planners-sweeps`, D3).
  The record holds no catch by the per-move `findMistakes` and none that
  needed a Loopy tiling other than Squares or a large Loopy board.
- `hint-resume`, the three single-plan blocks: every recorded catch showed on
  the first plan of some board of the tier.
- `hint-quality`: sentences spoken only in one mode or one tier at one size
  (Group's chain sentence at 12x12 Hard, about thirty long sentences in modes
  the first preset never reaches). An eight-plan walk was withdrawn because
  Light Up's arms did not fire that shallow. The fix each time was a pinned
  board.
- `warm-repaint`: defects in fourteen games on the first run, all on the
  default deal. Its recorded limit is reach, which is why it pins boards, and
  not the count of events. An earlier change declined to cut it.

## The options, and what each lets through

| | A commit to the engine waits | The whole run happens | Reaches `main` unseen by any local run |
| --- | --- | --- | --- |
| Today | 10 to 13 min, every commit | at every such commit | the sweeps' wider boards |
| A. CI only | about 1 min | in CI, 20 to 40 min after the push | every other game's cases, and the wider boards |
| B. Before the push | about 1 min | once a session, about 9 min | the wider boards, as today |
| C. After the commit, in the background | about 1 min | at every such commit, not waited for | the wider boards, and what a push overtakes |

**A lets through the thing the dear walks are for.** An engine change that
breaks a game it did not touch would be reported by a run that finishes after
the session has handed over to the next, on a trunk that has already been
deployed. That is the arrangement of 2026-10-04 to 2026-10-07, and its record
is above: red for hours with other work pushed on top. This is the measured
reason not to take A alone.

**B costs what the owner said it would**: the deploy waits for the session's
end. In exchange the session that broke a game is the one that sees it, with
the change still in its hands, and the whole run is paid once however many
commits the session made.

**C buys nothing B does not**, once a session pushes at its end, and it needs a
second working tree and a verdict file that the next hook reads. It is not
built.

## Decisions

### D1. A commit runs the games it stages; the push runs the rest; CI runs it all

This is B, with A's fast commit. It is the owner's lean with one hook added,
and deleting `.husky/pre-push` is all it takes to make it A.

- **A commit** runs the fast checks, the source scans, the production build,
  and the tests that reach what it stages, with per-game work for the games it
  stages and for no other: those games' own test files and their `<id>: …`
  cases. A commit to the midend therefore runs the engine's own tests and the
  whole-collection tests that are not split by game, and no game's boards.
  Two kinds of file still run whole: a staged test file, since it is what the
  author just wrote, and a guard that reads a staged path as text, since it
  costs milliseconds.
- **A push** runs what its commits left out, at the hooks' slice, as one plan
  over everything between the remote's commit and `HEAD`. It runs nothing when
  they left nothing out, which is a session that touched only games, help
  pages or documentation.
- **CI** runs the whole gate at its widest on every push, as it did.
- **A session pushes once, at its end, or when the owner asks to see the work
  sooner.** Each push that carries a change to shared code is one whole run.

There is no threshold on how many games a commit may reach before its sweeps
wait for the push. The count runs from 1 to 57 across the engine's files with
no gap to cut at (`commitPlan` over each file), and a game costs between 1 s
and 135 s, so any number would be a guess about cost. "The games it stages"
needs none.

The push refuses to run over uncommitted changes, because it reads the working
tree and would otherwise judge code the push does not carry.

### D2. CI's whole run is a workflow of its own, and is never canceled

The gate moves from a job in `ci.yml` to `gate.yml`. A newer push still cancels
a moot build and deploy, and no longer cancels the suite: GitHub keeps one
waiting run per group and replaces it, so the queue cannot grow, and every
commit is in a tree that was judged. A workflow of its own because a run whose
build was canceled concludes as canceled whatever its suite found, and that
conclusion is what `scripts/checks/ci-status.mjs` reads. The notice stays a
notice, at the end of both hooks.

### D3. The heavy tests

| Test | Decision | What the shorter form leaves out, and where it is caught |
| --- | --- | --- |
| `hint-resume`, the walk | **Shortened in the hooks.** At most 64 fresh plans a board, at evenly spaced moves, following the plan between them. A plan of 64 steps or fewer is walked a move at a time as before. | An instability between two consecutive recomputes on a board whose plan is longer than 64 steps. CI recomputes after every move. No such board is a searching hint's in the hooks' slice. |
| `hint-resume`, the step that does nothing | **Made cheaper, nothing left out.** Two states are compared field by field, and what they share by reference is not walked, where each was written out whole. | Nothing. A move that changed shared structure in place now reads as a step that does nothing and fails. |
| `target-verb`, `hint-frontier` | **Titled for their game**, so a hook can run one game's case. | Nothing: the same cases run. |
| `hint-quality` | **Kept.** | |
| `warm-repaint` | **Kept.** | |

Measured at the hooks' slice, `hint-resume.test.ts` went from 157 s to 47 s,
at loads of 8 and 5. Planted: a Mosaic hint that refuses past forty marks
fails the walk at move 13, and a plan that repeats its first step fails both
the state and the frame block.

### D4. A change to comments alone

A source file outside the game directories whose code tokens are unchanged
selects only the tests that read it as text. The comparison is the parser's
own tokens, so a `/*` inside a regular expression is not taken for a comment.
A test file is never read this way. Beside it, a glob is now matched to a
depth as well as a base, and `enrollment.ts` reads `games/*/**` where it read
`games/**`, so the registry is no longer text that every hint guard reads.

### D5. `target-verb.test.ts` compares sets of boards

Not mended here. Holding each key to the square under the cursor means pairing
every cursor position with the point that presses its target, in the probe
that five guards share, and the first run of a stricter guard over every
declaring game is its own piece of work. It is filed as the engine's:
`hold-a-key-to-the-square-under-its-cursor`, with Loopy's 35 s case in it.

## Offered to the owner, not made

Each of these drops something and names no replacement, or is the owner's by
an earlier decision. None is needed for the arrangement above.

1. **More workers for the push.** The push is the one run a session waits for,
   and it has two workers because the machine is shared four ways. Four would
   roughly halve it.
2. **Loopy's tilings in the hooks.** Loopy is 135 s of the 880 s of per-game
   work, and no recorded catch needed a tiling other than Squares. Walking
   Squares at every tier and one board of each other tiling at one tier would
   take most of that off. A tiling is a choice the Custom dialog offers, and
   the spec keeps a board for every value of every choice, so this is a change
   to that requirement.
3. **`hint-quality`'s thirty plans a case** and **`warm-repaint`'s sixty events
   a game.** Both were set by a finding and nothing in the record prices a
   smaller number. Shortening either is a measurement first: plant the defects
   each has caught and count the rounds or events each needs.

## Verification

Recorded in `tasks.md` section 4 as it was run.
