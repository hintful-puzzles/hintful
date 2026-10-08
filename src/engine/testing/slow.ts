/**
 * The opt-in tier for tests that are **expensive and not load-bearing per
 * commit**.
 *
 * The pre-commit gate exists to say "this tree is not broken", and it is paid
 * for on every commit. A handful of tests cost more than half of it (three
 * Seismic 7×7 differential fixtures at 272 s, one Bricks 12×8 at 100 s) while
 * their configuration coverage — every mode × difficulty — is carried by the
 * smaller boards of the same family, so what the big ones add is board *size*
 * against the same code paths.
 *
 * **What this is not.** It is not "these tests are unimportant", and it must not
 * become "these tests never run". A skipped test nobody runs is worse than a
 * deleted one, because the file still reads as coverage. These run under
 * `npm run test:slow`, which belongs with `npm run metrics` and `npm run diff`
 * as a **once-per-refactoring-round** check — the point at which a solver's
 * verdict might actually have moved.
 *
 * ## Run it targeted; the whole tier is not the unit of use
 *
 * **`npm run test:slow` re-runs the entire gate suite as well**, *plus* the
 * deferred cases, *plus* the widened seed budgets below, which multiply the
 * heaviest files 3–7.5×. Measured 2026-09-09: the tier itself is **six deferred
 * tests** in three files, and everything else it costs is the gate being paid
 * again. So the bare command is the wrong instrument for almost every question,
 * and reaching for it is how a tier becomes one nobody invokes.
 *
 * **Pass a path.** The script forwards arguments to vitest, so the deferred
 * work for the thing you are actually changing is one command:
 *
 * ```sh
 * npm run test:slow -- src/games/seismic        # the deferred 7x7 fixtures
 * npm run test:slow -- src/engine/hint-resume.test.ts   # every preset, not the gate slice
 * npm run test:slow -- src/games/sixteen src/engine/hint-quality.test.ts
 * ```
 *
 * That is the form to use when a refactor touches a solver, a generator or a
 * hint planner: run the slow tier **for the games it could have moved**, at the
 * moment you moved them, rather than promising yourself a whole-tier run later.
 *
 * **What must never be marked slow:** the only fixture covering some
 * configuration. Deferring the largest board of a family whose every
 * mode/difficulty is checked elsewhere costs the gate nothing it was relying on;
 * deferring the only fixture for a grid type silently removes that grid type
 * from every commit. State the remaining coverage when you mark something.
 */
import { describe, it } from "vitest";
import { scopeFromEnv } from "./game-scope.ts";

/** True when the run was asked for the expensive tier (`npm run test:slow`).
 *
 * Read off `globalThis` rather than `process.env` directly: the app's tsconfig
 * sets `"types": []` (no `@types/node` in the browser build's view), and this
 * module — dev-only though it is — lives under `src/`. */
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env;
export const SLOW_TESTS_ENABLED = Boolean(env?.["PUZZLES_SLOW_TESTS"]);

/**
 * True when this run is the **automatic per-commit hook** — the one role that
 * is allowed to narrow what it checks, because CI runs the whole gate on every
 * push to `main` (`.github/workflows/ci.yml` calls `npm run gate` with neither
 * toggle set). It is `.husky/pre-commit`'s own `GATE_PRECOMMIT`, read here
 * rather than invented, so the hook has one name for one idea.
 *
 * **The opposite polarity to {@link SLOW_TESTS_ENABLED}, and used far more
 * sparingly.** Slow is opt-in and defaults to *less*; this defaults to
 * **more** — every run that is not the hook (CI, `npm run gate`, a bare
 * `vitest`, an editor) gets the wide check. That direction is the whole safety
 * argument: forgetting to set it costs time, never coverage, and the shortcut
 * is unreachable from anywhere except the one caller that has the backstop.
 *
 * **What may hide behind it**, and it is a much narrower license than `slow`:
 * work whose omission for one commit is covered by the same run on push, and
 * which is expensive enough that a developer would otherwise start reaching for
 * `--no-verify`. It may **not** hide a check of the code the commit is
 * changing. `hint-quality.test.ts` is the case and states its own reasoning:
 * the narration ledger's *rot* half needs the expensive corner of the walk to
 * decide anything, and rot is by nature a thing push can catch, while the half
 * that catches a sentence you just wrote too long stays on every commit.
 *
 * Pair it with `it.skipIf(...)` rather than an early return, so a deferred
 * check is **reported as skipped** instead of passing silently — the hazard
 * `slow.ts` names above ("a skipped test nobody runs is worse than a deleted
 * one") applies here with the same force.
 */
export const PRECOMMIT_HOOK_RUN = env?.["GATE_PRECOMMIT"] === "1";

/**
 * An amount of work by role: `hook` in the automatic per-commit hook, `wide`
 * everywhere else (CI on every push, `npm run gate`, a bare `vitest`).
 *
 * **For more of the same, never for the only board of a kind.** The hook keeps
 * one board of every params set a sweep walks and every value of every mode;
 * what this takes off it is the second and later boards of one params set, and
 * a game's largest board where a smaller one of the same modes is walked. A
 * defect that shows on every board of a kind still fails the commit, and one
 * that needs the fourth board or the 50x50 fails the push. Say at the call
 * site what the hook's amount still walks.
 *
 * A session that changed the code a sweep guards runs it wide before
 * committing: `npx vitest run <file>`, which is the wide run because nothing
 * but the hook sets the toggle.
 */
export function perCommit<T>(hook: T, wide: T): T {
  return PRECOMMIT_HOOK_RUN ? hook : wide;
}

/** The games this run's cross-game sweeps are narrowed to, or `null` when every
 * sweep is whole. Only the per-commit hook narrows, and only to the games whose
 * code reaches what the commit staged; `game-scope.ts` states when that is
 * sound, and `vitest.config.ts` skips the other games' `<id>: ` cases from the
 * same variable. */
const SWEEP_SCOPE: ReadonlySet<string> | null = (() => {
  const ids = scopeFromEnv(env ?? {});
  return ids === null ? null : new Set(ids);
})();

/**
 * Whether game `id`'s cases run in this sweep. True for every game unless the
 * hook narrowed the run.
 *
 * **For an assertion that compares a ledger against what a sweep found.** Filter
 * the ledger with this, so a narrowed run still holds the touched game's entry
 * to what its case observed, rather than skipping the check or failing on every
 * game whose case never ran.
 */
export function inSweep(id: string): boolean {
  return SWEEP_SCOPE === null || SWEEP_SCOPE.has(id);
}

/**
 * `it`, skipped when the hook narrowed the sweeps. **For a floor over a whole
 * sweep** ("walked more than 100 boards", "found gestures in more than 1,000
 * places"), which no subset of games can be expected to meet and which the
 * narrowed run could only pass or fail meaninglessly. The build-pipeline spec
 * requires an assertion whose verdict depends on narrowed work to be narrowed
 * with it, and skipping reports that it was.
 */
export const itOverWholeSweep = it.skipIf(SWEEP_SCOPE !== null);

/** `describe`, skipped unless the slow tier was asked for. */
export const describeSlow = describe.skipIf(!SLOW_TESTS_ENABLED);

/** `it`, skipped unless the slow tier was asked for. */
export const itSlow = it.skipIf(!SLOW_TESTS_ENABLED);

/**
 * Pick a work amount by tier: `full` when the slow tier is on, `gate` otherwise.
 * For a property test whose seed count is a *confidence dial* rather than a
 * correctness threshold — the gate scans enough boards to catch a systematic
 * violation, the slow tier scans enough to catch a rare one.
 *
 * Use this only where more boards genuinely means more confidence. A test that
 * needs a specific board to exist should find it deterministically, not by
 * scanning further (docs/games/testing.md § "The test tiers").
 */
export function seedBudget(gate: number, full: number): number {
  return SLOW_TESTS_ENABLED ? full : gate;
}
