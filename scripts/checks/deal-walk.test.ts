/**
 * **How long does a Custom size take to deal?** One game's half of
 * `npm run deal-walk` (`scripts/deal-walk.ts`, which says how to run it and
 * how to read the report). This deals the boards; the script watches it,
 * because a generator is synchronous and a deal that never ends can only be
 * stopped from outside.
 *
 * **The sizes.** A game's size fields are the ones its params label takes its
 * size from, so a count or a percentage stays as the menu has it. The presets
 * are grouped by every other field, tier aside, and each group's largest is
 * the foot of a ladder at every tier: that size, then 1.5, 2, 3, 4, 6 and 8
 * times it, up to the field's declared maximum. A ladder ends at the first
 * rung with a deal slower than `DEAL_WALK_STOP_MS`, or one that threw or never
 * came back, so each is measured one rung past where it stops being quick. A
 * cell is `DEAL_WALK_SEEDS` deals, or fewer once they have taken that long
 * between them.
 *
 * A game without tiers is also dealt at every size from its fields' minimums
 * up to that foot, the fields stepped together. `tier-walk.test.ts` deals
 * those sizes for a game with tiers and lists the slow ones.
 *
 * **`DEAL_WALK_CELLS` deals the params it names and nothing else**, each
 * `DEAL_WALK_SEEDS` times whatever they take, which is how the sizes each side
 * of a line are counted before the line is drawn.
 *
 * **It can be killed between any two deals and started again.** The cell in
 * flight is written to the state file before its deal, so a run that finds one
 * there on starting knows that deal took the last run down, and
 * `DEAL_WALK_DIED` says how.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { it } from "vitest";
import "../../src/games/index.ts";
import { difficultyChoiceItem, withTier } from "../../src/engine/difficulty.ts";
import type { Game, ParamConfigItem } from "../../src/engine/game.ts";
import { paramsError } from "../../src/engine/params.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { getTsGame, registeredGameIds } from "../../src/engine/registry.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";
import type { DealWalkCell, DealWalkState } from "../deal-walk-report.ts";

const env = (name: string): string | null => process.env[name] ?? null;

const LIST = env("DEAL_WALK_LIST");
const STATE = env("DEAL_WALK_STATE");
const GAME = env("DEAL_WALK_GAME");
const DIED = env("DEAL_WALK_DIED") ?? "the run died";
const CELLS = env("DEAL_WALK_CELLS")?.split(" ") ?? null;
const SEEDS = Number(env("DEAL_WALK_SEEDS") ?? 4);
const STOP_MS = Number(env("DEAL_WALK_STOP_MS") ?? 10_000);

const FACTORS = [1, 1.5, 2, 3, 4, 6, 8];

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
type AnyGame = Game<any, any, any, any, any, any>;
type Params = Record<string, unknown>;
type Item = ParamConfigItem<Params>;
type NumericItem = Extract<Item, { type: "string" }>;

interface Rung {
  params: Params;
  /** Whether a slow deal here ends the ladder: true on the way up from the
   * menu's largest, false among the sizes below it. */
  climbing: boolean;
}

/** The fields a params label takes its size from: the item in the size slot,
 * and the ones documented together with it (Height, with Width). */
function sizeItems(game: AnyGame): NumericItem[] {
  const out: NumericItem[] = [];
  for (const item of (game.paramConfig ?? []) as Item[]) {
    if (item.type !== "string") continue;
    const withSize =
      typeof item.doc === "object" &&
      out.some((s) => s.kw === (item.doc as { with: string }).with);
    if (item.label?.slot === "size" || withSize) out.push(item);
  }
  return out;
}

/** Every ladder the walk deals for `game`, each a list of params in order. */
function ladders(game: AnyGame): Rung[][] {
  const tierItem = difficultyChoiceItem<Params>(game);
  const sizes = sizeItems(game);
  if (sizes.length === 0) return [];
  const area = (p: Params): number =>
    sizes.reduce((n, item) => n * Number(item.get(p)), 1);

  // The largest preset of each group: the presets alike in every field that
  // is neither a size nor the tier.
  const feet = new Map<string, Params>();
  for (const { params } of leafPresets(game) as { params: Params }[]) {
    const key = ((game.paramConfig ?? []) as Item[])
      .filter((item) => item !== tierItem && !sizes.includes(item as NumericItem))
      .map((item) => String(item.get(params)))
      .join("|");
    const held = feet.get(key);
    if (held === undefined || area(params) > area(held)) feet.set(key, params);
  }

  const tiers = tierItem ? tierItem.choices.map((_, tier) => tier) : [null];
  const out: Rung[][] = [];
  for (const foot of feet.values()) {
    for (const tier of tiers) {
      const rungs: Rung[] = [];
      const seen = new Set<string>();
      const add = (value: (item: NumericItem) => number, climbing: boolean): void => {
        const sized = { ...foot };
        for (const item of sizes) {
          const max = item.bounds?.max ?? Number.POSITIVE_INFINITY;
          item.set(sized, String(Math.min(value(item), max)));
        }
        const params = tier === null ? sized : withTier(game, sized, tier);
        const label = game.encodeParams(params, true);
        if (seen.has(label)) return;
        seen.add(label);
        rungs.push({ params, climbing });
      };
      if (tier === null) {
        const lo = (item: NumericItem): number => item.bounds?.min ?? 1;
        const steps = Math.max(...sizes.map((s) => Number(s.get(foot)) - lo(s)));
        for (let k = 0; k < steps; k++) {
          add((item) => Math.min(lo(item) + k, Number(item.get(foot))), false);
        }
      }
      for (const factor of FACTORS) {
        add((item) => Math.round(Number(item.get(foot)) * factor), true);
      }
      out.push(rungs);
    }
  }
  return out;
}

const slowest = (cell: DealWalkCell): number => Math.max(0, ...cell.ms);

/** Whether a ladder ends at this cell: it is past the point of being quick. */
const ends = (cell: DealWalkCell): boolean =>
  cell.died !== null || cell.threw !== null || slowest(cell) > STOP_MS;

function walk(id: string, statePath: string): void {
  const game = getTsGame(id) as AnyGame;
  const state = JSON.parse(readFileSync(statePath, "utf8")) as DealWalkState;
  const save = (): void => writeFileSync(statePath, JSON.stringify(state));
  const cellOf = (label: string): DealWalkCell | null =>
    state.cells.find((c) => c.label === label) ?? null;

  if (state.inFlight !== null) {
    const cell = cellOf(state.inFlight);
    if (cell) {
      cell.died = DIED;
      cell.lost++;
      // On a ladder the deal that never came back is the cell's last.
      cell.done = CELLS === null;
    }
    state.inFlight = null;
    save();
  }

  const asked: Rung[][] | null =
    CELLS?.map((cell) => [{ params: game.decodeParams(cell), climbing: false }]) ??
    null;
  state.ladders = [];
  for (const rungs of asked ?? ladders(game)) {
    const ladder: string[] = [];
    state.ladders.push(ladder);
    for (const { params, climbing } of rungs) {
      const label = game.encodeParams(params, true);
      ladder.push(label);
      let cell = cellOf(label);
      if (cell === null) {
        const refusal = paramsError(game, params, true);
        cell = {
          label,
          refusal,
          ms: [],
          gaveUp: 0,
          threw: null,
          died: null,
          lost: 0,
          done: refusal !== null,
        };
        state.cells.push(cell);
      }
      // The seed goes on from the deals this cell has had, lost ones included.
      for (let seed = cell.ms.length + cell.lost; seed < SEEDS && !cell.done; seed++) {
        state.inFlight = label;
        save();
        const started = performance.now();
        try {
          game.newDesc(params, randomNew(`deal-walk-${id}-${label}-${seed}`));
        } catch (e) {
          if (e instanceof RetryLimitExceeded) cell.gaveUp++;
          else cell.threw = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        }
        cell.ms.push(Math.round(performance.now() - started));
        // A slow cell on a ladder is dealt for about as long as the deal that
        // would end the ladder, and no longer: the slow cells are most of a
        // walk. A cell asked for by name has every deal it was promised.
        const spent = cell.ms.reduce((a, b) => a + b, 0);
        if (asked === null && (ends(cell) || spent > STOP_MS)) break;
      }
      cell.done = true;
      state.inFlight = null;
      save();
      if (climbing && ends(cell)) break;
    }
  }
  state.done = true;
  save();
}

it("deals one game's sizes up from the menu's largest", () => {
  if (LIST !== null) {
    writeFileSync(LIST, JSON.stringify(registeredGameIds().sort()));
    return;
  }
  // Collected with the other advisory checks, and only the script runs it.
  if (STATE === null || GAME === null) return;
  walk(GAME, STATE);
});
