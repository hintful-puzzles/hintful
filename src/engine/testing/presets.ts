/**
 * A game's presets as a population: every leaf the menu offers, and the slice
 * of them a per-commit sweep can afford.
 *
 * Reads only the game object it is handed, never the registry, so a test that
 * wants one game's presets does not import every game to get them.
 *
 * Dev/test-only; never imported by production code.
 */
import type { ParamConfigItem, PresetMenu } from "../game.ts";
import { presetMenu, type TitledPresetMenu } from "../param-label.ts";

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
export function leafPresets<P>(game: {
  paramConfig?: readonly ParamConfigItem<P>[];
  presets(): PresetMenu<P>;
}): { title: string; params: P }[] {
  const walk = (menu: TitledPresetMenu<P>): { title: string; params: P }[] =>
    menu.params !== undefined
      ? [{ title: menu.title, params: menu.params }]
      : (menu.submenu ?? []).flatMap(walk);
  return walk(presetMenu(game));
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
