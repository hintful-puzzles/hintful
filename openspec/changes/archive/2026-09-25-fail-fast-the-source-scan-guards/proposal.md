# fail-fast-the-source-scan-guards

Owner-requested, 2026-09-22, after a gated commit in
`share-the-selected-cell-highlight` failed twice for reasons that took seconds
to find and minutes to report. Implemented 2026-09-25; `tasks.md` holds the
measurements and what they changed about the plan below.

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

## Further thoughts on the suite's cost

This section held unmeasured leads on what a commit pays overall (per-case
selection, per-worker `builtGames()`, a cheaper enrollment path, the hint-resume
walk). They moved, verbatim, to `measure-the-suites-per-commit-cost` so they
outlive this change's archive, together with this change's measurement of the
board-building guards.

## What this is not

Not a change to *what* the gate checks, and not a weakening: every file still
runs on every gated commit and in CI. It changes only *when* a cheap failure
is reported.
