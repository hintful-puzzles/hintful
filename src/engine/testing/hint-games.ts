/**
 * The enrolled set for every cross-game hint guard — **derived from the
 * registry, never authored**: a game is enrolled iff it declares `hint`, and
 * every file importing `HINT_GAMES` iterates it.
 *
 * A hand-maintained list is a thing a session has to remember, and a game left
 * off it gets none of the guards, silently: *a guard blind to a game cannot fire
 * on it.* Reading the declaration rather than scanning for the word matters too,
 * because games mention `hint` without declaring one (an unused `redraw`
 * parameter, Guess's unrelated `ui.hint`).
 *
 * **A game with no `hint()` is a draft** (docs/hints.md § "The quality bar"), and
 * joins every guard here the moment it gains one.
 *
 * Dev/test-only; never imported by production code.
 */
import { type AnyGame, membersNotMentioning, REGISTERED_GAMES } from "./enrollment.ts";
import { dealtBoards } from "./presets.ts";
import { perCommit, SLOW_TESTS_ENABLED } from "./slow.ts";

export type { AnyGame };

/** Every registered game that declares a `hint()`, in `REGISTERED_GAMES`' stable
 * order. */
export const HINT_GAMES: [string, AnyGame][] = REGISTERED_GAMES.filter(
  ([, game]) => typeof game.hint === "function",
);

/**
 * The games whose hint **plans by searching** rather than by deducing — derived
 * from each game's own comment-stripped source (it calls the shared slide
 * planner), never declared. The marker carries its opening paren so importing
 * the planner without calling it does not count.
 *
 * **It bounds what the *gate* walks**, in `hint-quality.test.ts` and
 * `hint-resume.test.ts`, because a search is the one hint shape whose cost explodes
 * with board size: the walk is quadratic in it twice over (one full search per
 * move, and more moves on a bigger board), so walked at every size these games
 * would be a large share of the whole suite's test time.
 *
 * Which games may *refuse* as a search past its reach is a different question,
 * answered by {@link SEARCH_REACH_GAMES}: Guess and Pegs search without this
 * planner.
 */
export const SEARCH_PLANNING_GAMES: readonly string[] =
  membersMentioning("planSlides(");

/**
 * The games whose hint can say `SEARCH_OUT_OF_REACH`, the one refusal that
 * admits a search ran out rather than claiming anything about the board —
 * derived from each game's own code naming it, or handing a search's outcome
 * to `searchRefusal`, which names it for them; never declared.
 *
 * `hint-resume.test.ts` excuses exactly these its walk's completion promise,
 * with a ledger saying why each has a reach. It is keyed on the refusal's name
 * rather than on calling the slide planner, because a hint can search without
 * the planner (Guess's enumeration, Pegs' beam-and-proof search) and still
 * give this refusal.
 */
export const SEARCH_REACH_GAMES: readonly string[] = HINT_GAMES.map(
  ([id]) => id,
).filter(
  (id) =>
    membersMentioning("SEARCH_OUT_OF_REACH").includes(id) ||
    membersMentioning("searchRefusal(").includes(id),
);

/** The hinted games whose comment-stripped code contains `marker`. */
function membersMentioning(marker: string): string[] {
  const ids = HINT_GAMES.map(([id]) => id);
  const without = new Set(membersNotMentioning(ids, marker));
  return ids.filter((id) => !without.has(id));
}

/** True when a step declares no board marks at all — `highlights` absent, or an
 * object whose every field is empty. The candidate-elimination games' populate
 * opener (`{ area: [], targets: [], marks: [] }`) is the canonical case: its
 * banner narration is the whole display, so a frame it paints nothing on is
 * *correct*. Both cross-game guards need the same judgment — `hint-overlay`
 * to know which step must repaint a warm frame, `hint-quality` to know which
 * step must then carry words instead. */
export function declaresNoMarks(highlights: unknown): boolean {
  if (highlights == null) return true;
  if (typeof highlights !== "object") return false;
  return Object.values(highlights).every(
    (v) => v == null || (Array.isArray(v) && v.length === 0),
  );
}

/**
 * How many **distinct mark roles** a step declares — the count that decides
 * whether "this cell" points at anything: with one mark it is unambiguous, with
 * two it names neither unless the narration ties them.
 *
 * A role counts when its field carries board geometry: a non-empty array, a
 * cell index, or a coordinate object. A field holding a *mode* rather than a
 * place does not — Bricks' `forced: "shade"` and Lightup's `kind: "light"` say
 * what the step does, not where. Strings and booleans are therefore skipped,
 * which is the whole of the rule.
 *
 * Declared roles, not rendered ones: cheap enough to sweep every tier of every
 * game, and it cannot see a role the renderer ignores. `scripts/checks/
 * hint-deixis.test.ts` is where that limitation is written down.
 */
export function markRoles(highlights: unknown): number {
  if (highlights == null || typeof highlights !== "object") return 0;
  let roles = 0;
  for (const v of Object.values(highlights)) {
    if (Array.isArray(v)) {
      if (v.length > 0) roles++;
    } else if (typeof v === "number") {
      if (Number.isFinite(v) && v >= 0) roles++;
    } else if (v !== null && typeof v === "object") {
      roles++;
    }
  }
  return roles;
}

/**
 * **The boards a per-commit cross-game sweep walks** — every preset in the slow
 * tier, the `axisSlice` in the gate, and in both every value the Custom dialog
 * offers that no preset holds (`dealtBoards`).
 *
 * This is the one place the gate's preset population is decided, because a
 * sweep that decides it for itself decides it wrong. Walking `firstLeaf` — by
 * convention the smallest and easiest board a game offers — or synthesizing
 * params from it with a `withTier` that writes only the tier field never runs
 * a board carrying a cage, a jigsaw block, an X diagonal, an Adjacent clue, a
 * Tectonic region, a multiplication-only Keen or any Loopy tiling but Squares,
 * and a sweep whose subject is *narration* misses every sentence those add.
 * `docs/testing.md` § "How a cross-game guard finds its population" rule 6
 * names the tell: a guard that builds its inputs with a `with*` rather than
 * reading them off something the game offers.
 *
 * **Which sweeps still build their own is asserted rather than counted** —
 * `hint-enrollment.test.ts` scans the suite for the two calls and holds the
 * result to a ledger with a reason per entry, because a sweep fixed once does
 * not stay fixed, even beside one that was.
 *
 * **Difficulty needs no special case**: it is a `"choices"` item like any
 * other, so a slice *replaces* a `tiers.map(withTier(base))` loop rather than
 * multiplying with it — one preset per tier falls out of the same rule that
 * reaches the modes, and it is a board the player can actually pick rather than
 * a tier label written onto the smallest grid in the menu.
 *
 * **The local hooks take a game's modes and not its sizes, for every game.**
 * `perCommit` leaves the largest board to CI, where the whole slice is
 * walked on every push to `main` (`docs/testing.md` § "One board of
 * each kind in the hooks"). Every value of every mode, tier and choice keeps
 * a board in the hooks, on the smallest preset offering it.
 *
 * **A searching hint takes its modes and not its sizes everywhere.** Its cost is
 * superlinear in board size — one full search per move, and more moves to make
 * — so the members of {@link SEARCH_PLANNING_GAMES} get `scalarEnds: false`:
 * every mode on the smallest board offering it, and no large board at all.
 * That is derived from the same axes as everyone else's slice rather than being
 * a count of presets to keep, because a count chosen to reach a game's modes
 * stops reaching them the day the game gains one.
 *
 * **What the slice does not walk, and what does.** Every preset in between — a
 * mode at a size other than its smallest, a tier at a size other than the
 * menu's first — is the slow tier's, through this same function:
 * `npm run test:slow -- src/engine/hint-resume.test.ts`.
 */
export function gatePresets(
  id: string,
  game: AnyGame,
): { title: string; params: unknown }[] {
  return dealtBoards(game, {
    every: SLOW_TESTS_ENABLED,
    scalarEnds: perCommit(false, !SEARCH_PLANNING_GAMES.includes(id)),
  });
}
