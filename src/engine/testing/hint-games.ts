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
 * **A game with no `hint()` is not a defect.** Some logic games stay hintless
 * deliberately, as the corpus for assessing the framework work; the bar that a
 * new game ships with a hint is stated in AGENTS.md.
 *
 * Dev/test-only; never imported by production code.
 */
import "../../games/index.ts";
import type { ParamConfigItem, PresetMenu } from "../game.ts";
import { getTsGame, registeredGameIds } from "../registry.ts";
import { type AnyGame, membersNotMentioning } from "./enrollment.ts";
import { SLOW_TESTS_ENABLED } from "./slow.ts";

export type { AnyGame };

/**
 * Every registered game that declares a `hint()`, by puzzle id, sorted so the
 * guards iterate in a stable order. The side-effect import above is what
 * populates the registry (`games/index.ts` calls `registerAllGames()` on
 * evaluation).
 */
export const HINT_GAMES: [string, AnyGame][] = registeredGameIds()
  .sort()
  .map((id): [string, AnyGame] => [id, getTsGame(id) as AnyGame])
  .filter(([, game]) => typeof game.hint === "function");

/**
 * How many games the registry offered the filter above — the **vacuity guard**
 * every derived sweep owes. Every hint guard passes vacuously over an empty
 * `HINT_GAMES`, so a derivation that silently found nothing (an import cycle
 * leaving the registry unpopulated, a renamed accessor) would turn them all
 * green while checking nothing. `hint-enrollment.test.ts` floors the
 * *population*, not only the filtered result, which can look healthy while the
 * set it was drawn from is short.
 */
export const REGISTERED_GAME_COUNT = registeredGameIds().length;

/**
 * The games whose hint **plans by searching** rather than by deducing — derived
 * from each game's own comment-stripped source (it calls the shared slide
 * planner), never declared. The marker carries its opening paren so importing
 * the planner without calling it does not count.
 *
 * **Two guards read this for two different reasons, which is why it lives
 * here.** `hint-resume.test.ts` reads it to excuse a member the walk's
 * completion promise — a bounded search may honestly run out of reach.
 * `hint-quality.test.ts` and `hint-resume.test.ts` both read it to bound what
 * the *gate* walks, because a search is the one hint shape whose cost explodes
 * with board size: the walk is quadratic in it twice over (one full search per
 * move, and more moves on a bigger board). Measured 2026-09-09, the two members
 * were **43% of the whole suite's test time** — Sixteen 30%, Netslide 13%.
 *
 * A third game that calls the planner joins both concerns by *having* the
 * mechanic, and `hint-resume.test.ts`'s `SEARCH_REACH` ledger then fails until
 * someone writes down what covers its largest board.
 */
export const SEARCH_PLANNING_GAMES: readonly string[] = (() => {
  const ids = HINT_GAMES.map(([id]) => id);
  const without = new Set(membersNotMentioning(ids, "planSlides("));
  return ids.filter((id) => !without.has(id));
})();

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

/** First leaf preset's params — a small, valid board for each game. */
export function firstLeaf<P>(menu: PresetMenu<P>): P {
  if (menu.params !== undefined) return menu.params;
  for (const sub of menu.submenu ?? []) {
    const p = firstLeaf(sub);
    if (p !== undefined) return p;
  }
  throw new Error("no leaf preset");
}

/**
 * Every leaf preset a game offers, with the title its menu shows.
 *
 * **The full population**, which the slow tier walks. A sweep that cannot
 * afford all of it slices with {@link axisSlice} rather than inventing a key of
 * its own; keys invented here have twice turned out to name one axis of several
 * and to drop the rest in silence.
 */
export function leafPresets<P>(menu: PresetMenu<P>): { title: string; params: P }[] {
  if (menu.params !== undefined) return [{ title: menu.title, params: menu.params }];
  return (menu.submenu ?? []).flatMap(leafPresets);
}

/** What a `paramConfig` item reads off a params record: the three types the
 * Custom dialog knows how to render, and all primitives, so a `Set` of them
 * compares by value and no serialization is needed to key an axis. */
type AxisValue = string | boolean | number;

/**
 * One axis a game's presets move along, with the values a per-commit slice owes
 * a board.
 */
export interface PresetAxis<Params> {
  /** The `paramConfig` keyword this axis is declared under — the name the
   * Custom dialog labels it with, and the one a diagnostic can name it by. */
  readonly kw: string;
  /** This axis's value on one preset's params. */
  read(params: Params): AxisValue;
  /** The values a slice must include a preset for. */
  readonly wanted: ReadonlySet<AxisValue>;
}

/**
 * The axes a game's presets **actually vary** — derived from `paramConfig`, the
 * field list the game already publishes so the Custom dialog can render it.
 *
 * **Why `paramConfig` rather than the params object's own keys.** It is a value
 * a mechanism *consumes* (`Midend.getCustomParams` builds the dialog from it),
 * not a statement written for a guard's benefit, which is the distinction
 * AGENTS.md § "Convention over configuration" draws between a healthy
 * declaration and a manifest. It is also complete: `custom-params.test.ts`
 * fails a registered game whose `paramConfig` is missing or empty, so no game
 * can join the collection with its axes unstated. And it is *typed* — the game
 * says which fields are free scalars and which are selections — which is the
 * whole of the rule below. Raw params keys carry neither: Boats' `fleetData` is
 * a derived array, Solo's `kdiff` moves only with `killer`.
 *
 * **A scalar axis contributes its extremes; a discrete axis contributes every
 * value.** A `"string"` item is a free-form dimension (a width, an order, a
 * region size): its values lie on a line, more of them is a bigger board, and
 * both ends is the cheap honest cover — the same "smallest and largest"
 * approximation `firstLeaf` and the untiered slice already rest on. A
 * `"boolean"` or `"choices"` item is a **selection from a closed set**, and its
 * values are not on a line at all: Solo's Killer is not more Solo than Solo, it
 * is four extra cage rungs and four extra cage sentences. Nothing interpolates
 * between the members of a closed set, so every one of them needs a board.
 *
 * A field every preset holds the same value at is not an axis — the game offers
 * no way to reach a second value from the presets menu, so a slice cannot walk
 * one. Salad's `difficulty` is the standing case.
 *
 * **Takes only what it reads**, the way `difficulty.ts`'s `difficultyTiers`
 * does, so the
 * rule can be exercised against a hand-written menu rather than only against
 * whatever the collection happens to offer today: `hint-games.test.ts` is where
 * the scalar/discrete split and the menu-order tie-break are actually pinned.
 */
export function presetAxes<Params>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  presets: readonly { params: Params }[],
  opts: SliceOptions = {},
): PresetAxis<Params>[] {
  const axes: PresetAxis<Params>[] = [];
  for (const item of game.paramConfig ?? []) {
    const read = (params: Params): AxisValue => item.get(params);
    const values = [...new Set(presets.map((e) => read(e.params)))];
    if (values.length < 2) continue;
    axes.push({
      kw: item.kw,
      read,
      wanted: new Set(wantedValues(item.type, values, opts.scalarEnds !== false)),
    });
  }
  return axes;
}

/**
 * How much of a scalar axis a slice takes.
 */
export interface SliceOptions {
  /**
   * Whether a scalar axis contributes its **far** end as well as its near one.
   * Default `true`, which is the honest cover: a width, an order or a region
   * size runs along a line, and both ends of it is what a sweep owes.
   *
   * `false` takes the near end alone — **every mode, each on the smallest
   * board offering it, and no large board at all.** It is for a sweep whose
   * cost is superlinear in board size and whose subject is not: a hint that
   * plans by *searching* pays for size twice over (one full search per move,
   * and more moves to make), so the gate takes its modes and leaves its sizes
   * to the slow tier. Which games those are is derived, not listed — see
   * {@link SEARCH_PLANNING_GAMES} — and {@link gatePresets} is the one place
   * that decides it.
   */
  readonly scalarEnds?: boolean;
}

/** Which of an axis's observed values a slice owes a board — both ends of a
 * numeric scalar (or its near end alone, see {@link SliceOptions}), all of
 * anything else. A `"string"` item whose values are not numbers is a selection
 * wearing a text field, so it is covered in full rather than ordered by a
 * comparison that would not mean anything. */
function wantedValues(
  type: "string" | "boolean" | "choices",
  values: readonly AxisValue[],
  scalarEnds: boolean,
): readonly AxisValue[] {
  if (type !== "string") return values;
  const nums = values.map((v) => Number(v));
  if (!nums.every((n) => Number.isFinite(n))) return values;
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return values.filter((_, i) => nums[i] === lo || (scalarEnds && nums[i] === hi));
}

/**
 * One preset per value of every axis the game varies — the per-commit slice of
 * a sweep whose full form walks every preset.
 *
 * Presets are taken in menu order and kept when one supplies a value no earlier
 * one did, so the board chosen for a mode is the **smallest** the menu offers it
 * on, and the first preset is always in. That ordering is the whole cost
 * discipline: a mode costs about what the game's easiest board costs, and only
 * a scalar axis's far end buys a large board.
 *
 * **What this replaces, and why keying on tier alone was not enough.** The slice
 * keyed a tiered game on its tier and took the first preset of each. Difficulty
 * is one axis of several, so every preset that shared a tier with a plainer
 * board earlier in the menu was de-duplicated away: Solo walked no X board, no
 * jigsaw board and no Killer board, Unequal walked no Adjacent board, Seismic no
 * Tectonic board, Group no identity-hidden board, Keen no multiplication-only
 * board. Salad fared worst: every preset it offers carries the *same* tier, so
 * eleven collapsed to one board and one of its two game modes was never walked
 * at all. That is the same collapse the untiered games had already paid for
 * once (`fix-sixteen-hint-recompute-stability`); tier was never *the* axis, it
 * was one of them.
 *
 * Difficulty needs no special case here: it is a `"choices"` item like any
 * other, so "one preset per tier" falls out of the same rule that reaches the
 * modes.
 */
export function axisSlice<Params, Entry extends { params: Params }>(
  game: { paramConfig?: readonly ParamConfigItem<Params>[] },
  presets: readonly Entry[],
  opts: SliceOptions = {},
): Entry[] {
  const axes = presetAxes(game, presets, opts);
  if (axes.length === 0) return presets.slice(0, 1);
  const covered = axes.map(() => new Set<AxisValue>());
  return presets.filter((e) => {
    let novel = false;
    for (const [i, axis] of axes.entries()) {
      const v = axis.read(e.params);
      if (!axis.wanted.has(v) || covered[i].has(v)) continue;
      covered[i].add(v);
      novel = true;
    }
    return novel;
  });
}

/**
 * **The boards a per-commit cross-game sweep walks** — every preset in the slow
 * tier, the {@link axisSlice} in the gate.
 *
 * This is the one place the gate's preset population is decided, because every
 * cross-game sweep but one used to decide it for itself and all of those
 * decided it wrong. They walked `firstLeaf` — by convention the smallest and
 * easiest board a game offers — or synthesized params from it with a `withTier`
 * that writes only the tier field, so no board any of them had ever run on
 * carried a cage, a jigsaw block, an X diagonal, an Adjacent clue, a Tectonic
 * region, a multiplication-only Keen or any Loopy tiling but Squares. Three of
 * them have *narration* as their subject, while Killer alone adds four cage
 * sentences. `docs/games/testing.md` § "How a cross-game guard finds its
 * population" rule 6 names the tell: a guard that builds its inputs with a
 * `with*` rather than reading them off something the game offers.
 *
 * **Which sweeps still build their own is asserted rather than counted** —
 * `hint-enrollment.test.ts` scans the suite for the two calls and holds the
 * result to a ledger with a reason per entry, because three of the sweeps found
 * that way were inside the file whose main walk had already been fixed once.
 *
 * **Difficulty needs no special case**: it is a `"choices"` item like any
 * other, so a slice *replaces* a `tiers.map(withTier(base))` loop rather than
 * multiplying with it — one preset per tier falls out of the same rule that
 * reaches the modes, and it is a board the player can actually pick rather than
 * a tier label written onto the smallest grid in the menu.
 *
 * **A searching hint takes its modes and not its sizes.** Its cost is
 * superlinear in board size — one full search per move, and more moves to make
 * — and `retire-tests-that-do-not-earn-their-runtime` measured the two members
 * of {@link SEARCH_PLANNING_GAMES} at 43% of all test time. So they get
 * `scalarEnds: false`: every mode on the smallest board offering it, and no
 * large board at all. That is derived from the same axes as everyone else's
 * slice rather than being a count of presets to keep — one of the two counts
 * this replaced was three, chosen because three happened to reach Netslide's
 * three barrier modes, which stops being true the day Netslide gains a fourth.
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
  const all = leafPresets(game.presets());
  if (SLOW_TESTS_ENABLED) return all;
  return axisSlice(game, all, { scalarEnds: !SEARCH_PLANNING_GAMES.includes(id) });
}
