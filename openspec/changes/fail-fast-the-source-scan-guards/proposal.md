# fail-fast-the-source-scan-guards

**Status: scaffolded, not started.** Owner-requested, 2026-09-22, after a
gated commit in `share-the-selected-cell-highlight` failed twice for reasons
that took seconds to find and minutes to report.

## Why

The gate (`scripts/gate.sh`) already has a fail-fast prefix: typechecks, biome
and the node guards run in seconds before the heavy branch. But a whole class
of cheap checks sits *inside* the heavy branch: the cross-game guards written
as vitest files that read game **source** through `import.meta.glob(?raw)` and
assert something about its shape. They take milliseconds each, and they are
reported after the full `vitest run` (about 8 minutes on 2026-09-22, the
machine under load around 15), because they are vitest files like any other.
Vitest also tends to schedule the longest files first, which leaves the cheap
ones for the end.

What happened (2026-09-22): one commit touching eleven games' palettes and
highlight drawing passed every fast step, then failed at the end of vitest on
`raised-bevel.test.ts`, a census of lone lowlight triangles, and on
`palette-departures.test.ts`, which requires a reason next to a cursor slot
that departs from the shared role. Both are pure source scans. The re-run cost
the same again. (That day's second failure was biome's complexity lint, which is
already in the prefix and failed in seconds; that one was not the gate's cost.)

## What changes

1. **A source-scan pass in the fail-fast prefix.** Run the guards that only
   read source as one small `vitest run` ahead of the heavy branch, and exclude
   the same files from the main run so nothing runs twice.
2. **Membership derived, not listed.** A file is in the pass because of what it
   does, not because a roster names it: roughly, "reads game or engine source
   through a raw glob, and generates no board". A guard (in the prefix itself)
   asserts that the prefix set and the main set together cover every test file
   exactly once, which is the vacuity guard for a split: a file that fell out
   of both would pass by never running.
3. **The board-building guards, measured.** Guards on `builtGames()`
   (`capability-surface.test.ts`, the note-taking guards, the input probes) also
   caught things on 2026-09-22, but they generate a board for every game. Those
   join the prefix only if a measured run says they are cheap enough; the likely
   answer is a second, slightly slower stage, not the first.

## A starting classification, to be re-derived

Keyed on names, which `AGENTS.md` § "A scan that keys on a name" warns about.
It is the question, not the answer. The files outside `src/games/` whose
source mentions both `import.meta.glob` and `games/` numbered **22**
(2026-09-22). Of those, **11** also mention a board-building helper
(`builtGames`, `enrolledIn`, `capabilitySets`, `registeredGameIds`,
`probeBoard`, `new Midend`, `renderScenario`, `newDesc`), and **11** do not:

`palette-departures`, `palette-source`, `hint-enrollment`, `hint-refusal`,
`note-vocabulary`, `raised-bevel`, `gate-scope`, `module-layering`,
`palette-override-claims`, `catalog-aliases`, `test-selection`.

A board could reach any of these through an import the grep cannot see, so
§1.1 classifies by *running* them, not by reading them.

## Further thoughts on the suite's cost (unmeasured; for whoever picks this up)

The owner flagged a broader test-optimization session for another day. These are
leads, not findings. Each needs the idle-machine, memory-aware measurement
`AGENTS.md` § "Test discipline" asks for before it becomes a proposal.

- **The hook's test selection widens to everything on any game edit.**
  `select-tests-in-the-precommit-hook` made the hook run only the tests a
  commit could affect, but any `src/games/` edit selects every glob-reading
  cross-game guard, and those guards iterate *every* game. Many are
  `describe.each` over the population, and each case depends on one game's
  source plus the engine. When a commit touches no engine file, only the cases
  for the games it touched could change verdict. Narrowing per case (by an
  environment variable the guards read, as `PRECOMMIT_HOOK_RUN` already is) is
  a large, sound saving *if* the soundness condition is stated and tested: no
  engine file changed, and the guard's per-game case reads only that game.
  The hook-scoping license in the `build-pipeline` spec is the template.
- **`builtGames()` is memoized per worker, not per run.** With
  `isolate: false`, every worker that touches an enrollment guard generates
  every game's board once. With the worker pool near its cap, that may be the
  same few seconds of generation paid several times. Worth one measurement: how
  many times per gate run the registry is built.
- **Several guards need only `newUi` and the game object, not a playable
  board.** A cheaper enrollment path (a fixed small preset per game, or the
  `Ui` built without generating) could cut the board-building half of the
  guards substantially. Check which fields they actually read first.
- **Cost is concentrated, and known to be.** `retire-tests-that-do-not-earn-
  their-runtime` measured half the suite's time in three games whose hints plan
  by searching, amplified by cross-game guards that recompute a full hint after
  every move. The hint-resume walk is the obvious candidate for a cheaper
  per-commit configuration with the full walk left to CI, under the same
  four-condition license the narration ledger's rot half uses.
- **Say what the instrument measured.** A timing taken with the machine at load
  15 and in swap is an upper bound. Record free memory and swap beside every
  figure, and compare ratios rather than seconds across runs.

## What this is not

Not a change to *what* the gate checks, and not a weakening: every file still
runs on every gated commit and in CI. It changes only *when* a cheap failure
is reported.
