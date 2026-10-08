# Design

Every figure here was taken on 2026-10-08 on the owner's machine, with two
vitest workers and the machine at load 4 to 6 (a browser and this session
beside the run, no other suite). "Test time" is the sum of per-test durations
in vitest's JSON report, which locates cost and does not price it; the CPU
figures at the end price it.

## Where the time was

One run of every test with the hook's toggle set: 417 files, 13,763 tests,
1,475 s of test time, 769 s of wall.

- The cross-game guards under `src/engine` were 84% of it, and the games' own
  tests 15%.
- `hint-quality.test.ts` was 448 s (30%), `hint-resume.test.ts` 212 s (14%).
- By game, across every guard: Group 236 s (16%), then Pearl, Loopy, Mosaic,
  Pegs and Sokoban at 50 to 100 s each.
- It was concentrated: after the dealer below, 5 tests of 13,763 held 26% of
  what was left and 40 held 52%.

`hint-quality.test.ts` did not grow in `07ff51a3`. That commit changed eight
lines of it (one floor over a whole sweep became skippable on a narrowed run)
and otherwise touched other test files and docs, so the work the file does is
the same on both sides of it. Its cost was the finding below.

## The finding: dealing, not checking

A probe dealt each board the gate walks for the six dearest games and then
followed its hint plan to the end. The walk took under 0.1 s on every board but
three (Pegs 9x9, Sokoban 16x20, a Pegs octagon). Dealing took up to 19.5 s:
Group's 8x8 at Hard, a board the Custom dialog offers and no preset holds, which
the sweeps deal because of "A cross-game sweep SHALL deal every choice the
Custom dialog offers". Each sweep seeded its deal from its own name, so about a
dozen dealt that board afresh, some of them twice.

## Decision 1: one dealer for the sweeps

`src/engine/testing/dealt.ts`: `dealt(game, params, n)` deals the `n`th board
of a params set once per worker, and `beginDealt` begins a midend on it by the
route New game takes with a board dealt ahead, so the generator's `aux` arrives
as it does for a player. Fourteen guard files take their boards from it
(`git grep -l testing/dealt.ts -- src`).

- Test time 1,475 s to 1,195 s, with nothing left out.
- What it gives up: each guard saw a different board of the same params.
  Nothing relied on it, and a guard that wants several takes them by `n`.
- A midend guard used to begin from a `params#seed` id. `beginDealt` was chosen
  over a `params:desc` id because a desc id carries no `aux`, and the hints that
  read it would have gone down a different path in every guard at once.

The boards changed, and four tests went red:

| Test | What the new board showed | Answer |
| --- | --- | --- |
| `hint-quality`, Singles | `corner4` speaks 155 characters; no board walked had reached the rung | Listed with `corner2` and `corner3`, whose reason is its reason |
| `hint-quality`, Singles | `adjBlack` is 121 characters where four squares are listed and three have two digits, on a 12x12 | Listed, with the board pinned |
| `hatch-contrast`, Rect | no dealt board hatched; Rect stripes on few positions | The board `rect-hint.test.ts` holds to its `overlap` rung is tried first |
| `firing-replay`, Solo | a `digit-set` firing (one digit across rows and columns) names only the squares the digit is left with, and reads the other squares of those lines | A defect in Solo's hint. Held in a `SHORT` ledger with its board, which fails when the board stops showing it. Raised with the owner; not fixed here |

## Decision 2: the hook walks one board of each kind

The owner's direction: a heavy test that is not extremely cost-effective leaves
the per-commit gate, runs in CI, and is run ad hoc by a session that touches
the code it guards. Whole files were not moved, because no heavy file is one
thing: each is one assertion over many boards, and the first board of a kind is
what catches a defect in the commit. What moved is the rest of the boards.

`perCommit(hook, wide)` in `slow.ts` chooses an amount by role. In the hook:

- `gatePresets` leaves out a game's largest board (`scalarEnds: false`, the
  slice the search-planning games already had), and keeps a board for every
  value of every mode, tier and choice;
- `hint-quality`'s walks take one board of a params set, not three;
- the difficulty contract's monotone walk takes one board a tier, not four;
- `hint-mark` takes one board of a params set, not two;
- the bound-hint walk checks the first 400 steps of a board: Mosaic's 50x50 is
  1,355 steps and was 52 s of that walk's 110 s. It stays in the hook's slice
  because it is the only preset with aggressive generation switched off.

What each catches that the hook now does not, and where it is caught:

| Left to the push | What it has caught | Cheapest input that would |
| --- | --- | --- |
| The largest board | A plan longer than a fixed cap (`hint-resume.test.ts`, on a 50x50 Mosaic plan of some 1,350 steps) | That board. CI walks it; a pin where a rung needs it |
| Boards 2 to 4 of a tier | A solver that fails at a higher cap on 7 of 8 of its easiest boards, with the first seed the eighth | Four boards. One misses it 1 time in 8, so CI keeps four |
| Seeds 2 and 3 of the length walk | A long sentence a tier speaks on some boards | A pinned board, which is what the ledger's `spokenOn` is |

Not done: moving `target-verb`, `warm-repaint` and `input-parity` (227 s of the
768 s left). Each walks one board a game and checks every target or tile of it,
so there is no more-of-the-same to take off, and the first board is the check.

**What a session is told.** `docs/games/testing.md` § "One board of each kind
per commit": after changing code a sweep guards, run that sweep wide
(`npx vitest run <file>`). A bare `vitest` is the wide run, because nothing but
the hook sets the toggle.

**Who sees a red push.** More now waits for CI, and CI cancels a run when a
newer push arrives, so only the latest push is sure of a whole run. The hook
ends by reading the last finished CI run on `main` and says so when it failed.
It never blocks: the next commit is usually the fix.

## Decision 3: the engine's specification is ten capabilities

`ts-engine` was 8,847 lines and 220 requirements. It is split by subject, with
the core (the `Game` interface, the midend, the registry, saves, preferences,
history, status, the timer, Solve) left in `ts-engine`:

`engine-hints`, `engine-candidate-hints`, `engine-input`, `engine-params`,
`engine-difficulty`, `engine-notes`, `engine-colors`, `engine-drawing`,
`engine-helpers`.

- **A move, made in `openspec/specs/` directly and not through a delta.** A
  delta states a change to what is required, and nothing is. The move was made
  by a script that then checked its own shape: every non-blank line of every
  requirement is in exactly one of the ten files, as many times as it was in
  the one, and no line was added. Each new file's Purpose is the only new text.
- Each requirement went by its title to the first subject whose words it
  carries, with fifteen titles placed by hand where the words misled.
- The citations of `ts-engine` in the guides, the other specs and the source
  were repointed by requirement. Three in `scripts/` are about an incident in
  August and name the spec as it then was; they stand.
- `scripts/checks/change-citations.mjs` now resolves a capability's name, which
  is a thing a reader can go and find, as a change id is.

## Decision 4: `midend.ts` is not split here

The question was whether its parts have tests that need a whole midend only
because there is nothing smaller to hold. Measured: `midend.test.ts` is 129
tests on fake games in under 0.1 s, and every test file that names the midend
sums to about 5 s. Nothing would get cheaper.

What makes a midend commit dear is selection: every cross-game guard builds a
`Midend`, so a staged `midend.ts` runs them all whole. A split moves that no
distance, since each guard would reach every part.

What it would split into, for whoever takes it up for its own sake: the hint
lifecycle (about 350 lines, `clearHint` to `playHintGesture`), the timer,
params with the Custom dialog and preferences, animation and flash, and
save and load. That is a refactor with no test-time case, so it is not this
change's.

## The result

With every test selected and the hook's toggle set, one run each under
`/usr/bin/time`, back to back, at load 4 to 5 (the before run from a worktree of
`153cf1a5`):

| | Test time | Wall | CPU (`user + sys`) |
| --- | --- | --- | --- |
| Before (`153cf1a5`) | 1,468 s | 763 s (12.7 min) | 1,643 s |
| After | 714 s | 387 s (6.4 min) | 865 s |

CPU fell 47%. That is the dearest selection there is, the one a commit to the
midend or to every game takes. The hook adds the fast prefix (about half a
minute) and runs `vite build` beside the tests. A commit that touches one game
runs that game's cases only.

Run wide, as CI runs it, the suite is 1,179 s of test time against 1,475 s: the
dealer's saving, with every board still walked.

What would take it lower is in three files that walk one board a game and
check all of it (`target-verb`, `warm-repaint`, `input-parity`, 227 s between
them), and no lever here applies to them.
