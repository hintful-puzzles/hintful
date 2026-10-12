# Design

Every figure here was taken on 2026-10-12, on the owner's machine at two
vitest workers with other work running (load 3 to 17). Re-take one before
relying on it.

## What was there already

The proposal was written the morning `decouple-the-commit-from-the-whole-suite`
landed, and that change built most of what this one asked for:

- **A scope a guard is given.** `GATE_GAME_SCOPE`, beside `GATE_PRECOMMIT=1`,
  is read in two places that cannot disagree (`src/engine/testing/game-scope.ts`):
  `vitest.config.ts` turns it into the filter that skips the other games'
  `<id>: …` cases, and `slow.ts` turns it into `inSweep` and
  `itOverWholeSweep` for a ledger or a floor that reads across the cases.
- **The files a game reaches.** `scripts/checks/reach.ts` walks imports and
  the `?raw` globs the cross-game guards read source through.

So the proposal's "narrowed by a population it is given, not by a test-name
filter" is met by that mechanism, which is both: the filter skips the cases,
and the population helpers narrow what reads across them. **The command adds
no second way to narrow.** It sets the commit hook's two variables for one
game, which is also why a guard that pins a count over the collection is
safe: such a count is in `itOverWholeSweep` or filtered by `inSweep` already,
for the hook's sake (`build-pipeline`, "An assertion that reads across a
sweep is narrowed with the sweep").

## The command

`npm run game -- <id>` is `scripts/game.ts`. Three steps, each run whatever
the one before found:

1. `npm run typecheck`.
2. `biome check src/games/<id>`, read-only.
3. One `vitest run` over `gameTestFiles(id)` with `GATE_PRECOMMIT=1` and
   `GATE_GAME_SCOPE=<id>`.

**Which files.** `gameTestFiles` (in `select-tests.ts`) is every test file
that reaches a path of the game: its directory, its help page, its icons,
tracked or not, so a game not yet committed is read. Less the other games'
own test files, which reach this game only through the registry they share:
those were 11 files and 17 s of an 80 s run for Clusters, and a failure in
one is that game's.

**Every file is scoped, where a push would run six of them whole.** A push
runs a file that reads the game's help page or icons itself with every
game's cases, because the change might have broken another game's. A verdict
on one game asks only for its own, so there is one vitest run and no `whole`
list.

**The census of task 1.1**, as a query: `gameTestFiles("clusters")` is 108
files of the suite's 454, of which 3 are Clusters' own and 105 are guards
and engine tests that reach it. `find src vite-plugins -name '*.test.ts'`
and the function are the two counts; nothing here pins them.

## The report

- **A refusal names its guide section from the guard's own text.** 13 of the
  105 guards cite a section (`<guide>.md § "Heading"`). A table in the
  command of which guard means which section would be a second copy that
  rots, so the command reads the citations out of the refusing file with
  the reader `guide-sections.mjs` uses (`scripts/checks/guide-citations.ts`,
  taken out of that check so there is one). A citation it prints is one the
  gate has resolved to a heading. A guard that cites none is reported with
  "its header says what it asks", which is true of every guard here. Adding
  citations to the other 92 is not this change's: a guard gains one when
  someone is sent to it and finds the header is not enough.
- **What it did not run is counted from the run** where it can be: the
  skipped cases titled for another game, and every other skipped case (a
  floor over the collection, a check deferred to CI). The rest is stated: the
  later boards of each kind (`perCommit`), the gate's checks that read no
  game, the build, the app.
- **`--reporter=dot`.** A line a file buried the handful that refuse under
  the hundred that pass.

## Sweeps that walked every game in one test

Narrowing by title skips a case. It cannot skip a loop over the registry
inside one test, or in a `beforeAll`. For Clusters, 5.3 s of an 80 s run was
cases titled for Clusters; five guards did the rest of the per-game work for
all 57 games regardless:

| Guard | Shape | Cost in a one-game run |
| --- | --- | --- |
| `input-answers.test.ts` | a `beforeAll` sweeping every game | 28.6 s before its first test |
| `canceled-press.test.ts` | four tests, each a loop over every game | 12.7 s |
| `wrong-entry-check.test.ts` | two ledger tests that swept every game | 9.1 s |
| `drag-cancel.test.ts` | one test over every game | 5.0 s |
| `mark-all.test.ts` | the roster test dealt every member's boards | 4.3 s |

Each now does a game's work in a case titled for the game, with the ledger
filtered by `inSweep` and the floor in `itOverWholeSweep`, which is what
`docs/testing.md` § "A cross-game guard the hooks can narrow" already asked.
The commit hook gains the same seconds on every game commit. `canceled-press`
was seen to fail in its new form with `restoreUi` taken out of
`Midend.cancelPress`: 55 of its 57 game cases whole, and Towers' one case
when scoped to Towers.

**Left as they are**: the sweeps still inside one test cost 18 s of test
time between them in a one-game run, the largest `cursor-vocabulary` (2.3 s),
`upstream-descs` (1.8 s) and `position-status` (1.6 s). Several are scans of
source or a snapshot of the collection and are whole by nature. The guide
now says the shape to avoid.

## What it costs

| Game | Before the five guards were split | After |
| --- | --- | --- |
| Clusters | 84 s | 47 s |
| Towers | | 53 s |
| Solo | 107 s | 66 s |

The task asked for "well under a minute", and that is not met for a large
game on a busy box. What is left is not tests: the cases and the game's own
files are about 30 s of worker time, 15 s of wall at two workers. The rest is
loading 105 guards, each of which imports the registry of 57 games (vitest
reports 45 s of import across the two workers). Four workers bought ten
seconds in one trial and doubled the import, since each worker loads the
graph. The worker count is the owner's (`vitest.config.ts`, a quarter of a
shared machine), and `VITEST_MAX_WORKERS` overrides it on a free box.

## The planted defects (task 2.3)

Three in Towers, one run, 50 s, exit 1:

| Planted | Refused by |
| --- | --- |
| the `populate` pin removed from `towers-hint.test.ts` | the typecheck (`pins` is a record over every rung), and Towers' own pin tests |
| a filled rectangle of `COL_HINT` drawn after the marks | `hint-mark.test.ts`, citing `hints-marks.md` § "Shade vs ring", and `warm-repaint.test.ts` |
| `requestKeys` offering one digit more than the board reads | `input-parity.test.ts`, citing `input.md` § "The input-parity bar", and Towers' own keypad test |

An "unnamed mark" as the task wrote it cannot be planted: a mark is made by
the word that names it (`mark.as`), so the mark guard planted against is the
fill.

## The five records a new game was refused by

| Record | Now |
| --- | --- |
| `asset-integrity.test.ts`: two icons | a real thing to make; the command names it |
| `help-coverage.test.ts`: a row in `help/puzzles.md` | kept by hand; the command names it |
| `capability-surface.test.ts`, `params-stability.test.ts`: a snapshot row | kept by vitest; the command says how to write a snapshot again |
| `hint-mark.test.ts`: `expect(CHECKED.length).toBe(50)` | a ledger of the three hint games whose renderer exports no `COL_HINT` (Fifteen, Flood, Sixteen), asserted equal to what the sweep leaves out. A game that exports the color is swept with no edit; one that stops exporting it fails. Seen red before the ledger was filled. |
| `params-read-whole.test.ts`: an entry in `UPSTREAM` for every game | asked of no game. The record is held to name only registered games and not to have emptied. |

**Seen on a game no record had met.** A copy of the skeleton was stamped,
registered and given a catalog entry, and the command run on it: 43 s, exit
1, and three refusals in one run, which are the three rows above that are
left (the icons, the capability snapshot, the row in `help/puzzles.md`),
where the first day of the skeleton met five one at a time. The copy was
then removed.

**A local vitest run writes a missing snapshot row and passes.** That first
run reported `Snapshots 1 written`: `params-stability.test.ts.snap` had
gained the new game's row, in a file the author never opened, and the guard
that exists to make them read it had passed. So the command runs with
`--update=none`, as CI does, and the row's absence is a refusal with the
instruction to write it. Seen: the stability guard fails for the new game
under that flag, and passes without it.

**The assurance the last one drops, and what replaces it.** A game ported
from upstream that never records its params strings is no longer refused.
Nothing a game declares says it has an upstream (the catalog's `collection`
has two values and both mean it; ten ported games have no C-reference
fixture), so the guard could only ask every game or none, and asking every
game refuses a game written here. `docs/new-game.md` § "Before you start"
now lists the record among the interface risks of a port. When a game new to
the collection gives the catalog a third `collection` value, the guard can
ask again of the other two; `add-starbattle` is where that value arrives.

## An instrument found blind on the way

`scripts/checks/unused-exports.mjs` listed its files with the pathspec
`scripts/**/*.ts`, which asks for a directory below `scripts/` and so read
12 of the 16 TypeScript files there: every command that sits in `scripts/`
itself was no importer, and the two helpers `scripts/game.ts` is the only
reader of were reported dead. It is `scripts/*.ts` now, as `src/*.ts` beside
it always was (a pathspec's `*` crosses directories), and reads 16.

## What the specs required

`build-pipeline`, "The game scope travels as one value beside the role
toggle": the command sets both, so it is inside the requirement, and
`src/gate-scope.test.ts` asks only that the hooks set the toggle and CI does
not. `testing` gains three requirements for the command (the delta). The
shape of a narrowable sweep stays guidance in `docs/testing.md`, since the
sweeps left above would make a SHALL false.
