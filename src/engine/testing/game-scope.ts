/**
 * How the local hooks narrow the cross-game sweeps to some games' cases.
 *
 * A cross-game guard runs one case per game, and nearly all of a game commit's
 * test time is those cases for games it did not touch.
 *
 * **In a push, a skipped case is one the pushed commits could not have turned
 * red**, which needs both:
 *
 *   1. the test file reaches no changed path except through a game, and every
 *      game whose code reaches one is in the scope. `commitPlan` in
 *      `scripts/checks/reach.ts` computes both, and runs a file that fails the
 *      first *whole*, in a vitest run of its own with no scope; and
 *   2. a case titled `<id>: …` depends on no game but `<id>`. A game cannot
 *      import another game (`src/module-layering.test.ts`), so a case reaches a
 *      second game only by reading it on purpose, and none does today.
 *
 * Both halves fail open. A path the walk cannot model yields no scope, and a
 * guard that titles its cases some other way is simply not narrowed.
 *
 * **In a commit the scope is the games it stages**, and a skipped case may be
 * one the commit broke: the push runs it (`scripts/checks/select-tests.ts`).
 * The second half above is still what makes a staged game's cases the whole of
 * that game's verdict.
 *
 * **The scope travels as one variable, `GATE_GAME_SCOPE`**, which
 * `scripts/gate.sh` sets from `select-tests.ts`'s plan. Two things read it, and
 * they must agree about which games ran: `vitest.config.ts` turns it into the
 * name filter that skips the other games' cases, and `slow.ts` turns it into
 * {@link inSweep} and `itOverWholeSweep` for the assertions that read across a
 * sweep. Both honor it only beside `GATE_PRECOMMIT=1`, so it inherits that
 * toggle's backstop in `src/gate-scope.test.ts`.
 *
 * Pure and free of Node APIs, so the build side and the suite can both import
 * it.
 */

/** The value of `GATE_GAME_SCOPE` that runs no game's cases: a commit that
 * stages no game. Not a game id, and distinct from unset, which is every
 * game's. */
const NO_GAME = "-";

/** The scope a run was given, or `null` when its sweeps are whole. An empty
 * list is a run that skips every game's cases. */
export function scopeFromEnv(
  env: Readonly<Partial<Record<string, string>>>,
): string[] | null {
  if (env["GATE_PRECOMMIT"] !== "1") return null;
  const value = env["GATE_GAME_SCOPE"] ?? "";
  if (value === NO_GAME) return [];
  const ids = value.split(",").filter(Boolean);
  return ids.length > 0 ? ids : null;
}

/**
 * A `vitest -t` pattern that runs every test except the cases titled for a game
 * outside `scope`.
 *
 * Vitest matches the pattern against the test's describe titles and its own
 * title joined by single spaces, so a case's `<id>: ` can only be recognized at
 * the start of the name or after a space. That also catches a title with
 * `<id>: ` mid-sentence, which can only skip more of a test that the commit did
 * not change the game of. Returns `null` when nothing would be skipped.
 */
export function otherGamesFilter(
  scope: readonly string[],
  allIds: readonly string[],
): string | null {
  const others = allIds.filter((id) => !scope.includes(id)).sort();
  if (others.length === 0) return null;
  // An id is spliced into a regex unescaped, so refuse one that could mean
  // something there; the callers turn the throw into "no narrowing".
  const unsafe = others.find((id) => !/^[a-z0-9-]+$/.test(id));
  if (unsafe !== undefined) throw new Error(`not a plain game id: ${unsafe}`);
  return `^(?!(?:.* )?(?:${others.join("|")}): )`;
}
