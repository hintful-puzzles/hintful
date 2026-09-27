/**
 * Which games can a commit have changed, and how the per-commit hook narrows
 * the cross-game sweeps to them.
 *
 * A cross-game guard runs one case per game, and nearly all of a game commit's
 * test time is those cases for games it did not touch: measured 2026-09-27 on a
 * Pearl-only change, 518 s of 593 s was per-game cases and 105 s of that was
 * Pearl's (`measure-the-suites-per-commit-cost`).
 *
 * **The soundness condition**, both halves of which must hold for a skipped case
 * to be one the commit could not have turned red:
 *
 *   1. every staged path lies under `src/games/<id>/`, so no engine module, no
 *      guard and no shared test helper changed; and
 *   2. a case titled `<id>: …` depends on no game but `<id>`. A game cannot
 *      import another game (`src/module-layering.test.ts`), so a case reaches a
 *      second game only by reading it on purpose, and none does today.
 *
 * Both halves fail open. A path outside a game directory yields no scope, and a
 * guard that titles its cases some other way is simply not narrowed.
 *
 * **The scope travels as one variable, `GATE_GAME_SCOPE`**, which
 * `scripts/gate.sh` sets from `select-tests.mjs --game-scope`. Two things read
 * it, and they must agree about which games ran: `vitest.config.ts` turns it
 * into the name filter that skips the other games' cases, and `slow.ts` turns
 * it into {@link inSweep} and `itOverWholeSweep` for the assertions that read
 * across a sweep. Both honor it only beside `GATE_PRECOMMIT=1`, so it inherits
 * that toggle's backstop in `src/gate-scope.test.ts`.
 *
 * Pure and free of Node APIs, so the build side and the suite can both import
 * it.
 */

const GAME_PATH = /^src\/games\/([^/]+)\/./;

/** The games a commit touched, or `null` when it touched anything else. */
export function gameScope(staged: readonly string[]): string[] | null {
  if (staged.length === 0) return null;
  const ids = new Set<string>();
  for (const path of staged) {
    const id = GAME_PATH.exec(path)?.[1];
    if (id === undefined) return null;
    ids.add(id);
  }
  return [...ids].sort();
}

/** The scope a run was given, or `null` when its sweeps are whole. */
export function scopeFromEnv(
  env: Readonly<Partial<Record<string, string>>>,
): string[] | null {
  if (env["GATE_PRECOMMIT"] !== "1") return null;
  const ids = (env["GATE_GAME_SCOPE"] ?? "").split(",").filter(Boolean);
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
