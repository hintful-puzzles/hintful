/**
 * **Does a Custom size deal the tier it asks for?** For each tiered game, deal
 * boards at sizes below the menu's largest, at every tier, and compare the
 * tier asked with the lowest cap that solves the board. That comparison holds
 * for a solver that is not monotone in its cap too (Boats): a board some lower
 * cap solves was dealt below its tier, whatever the caps above it do.
 *
 * `difficulty-contract.test.ts` holds every *preset* to that, and deliberately
 * not a tier written onto a small size, because whether a size can carry a tier
 * is the question and not a premise. This asks the question. A cell comes out
 * one of five ways:
 *
 * - **at tier** on every deal;
 * - **below**: a board dealt under a tier it does not need, which is the defect
 *   this exists to find;
 * - **above**: the generator's acceptance is wider than the contract's cap;
 * - **gave up**: the generator found no board in the house count of tries,
 *   so the tier is absent at that size or rarer than that, which the app's
 *   deadline may still deal;
 * - **refused**, with the sentence a player is shown.
 *
 * **The sizes are a sample, and the report says which.** Every numeric field
 * runs from its declared lower bound, or from 1 where it declares none, up to
 * the largest value a preset holds, once with the fields stepped together (4x4, 5x5, …) and once
 * each alone on every menu shape. Sizes past the largest preset are
 * `npm run deal-walk`'s question (`scripts/deal-walk.ts`), and so is a deal
 * that is slow: once a tier takes longer than `TIER_WALK_SLOW_MS` on a shape,
 * the larger sizes of that shape are left out at that tier and listed as
 * such, and a cell it was quick at three times can still hold a deal that
 * never ends (Mathrax's 9x9 at its top tier did).
 *
 * **A cell that passes is not cleared.** A few deals convict a cell that fails
 * and say little about one that does not: a tier a generator misses one time
 * in ten passes three deals most of the time. Raise `TIER_WALK_SEEDS` for a
 * cell that matters.
 *
 * A report and not a gate: the whole walk is many minutes. Run it for the
 * games a change could have moved, and read `metrics/tier-walk.md`, which is
 * rewritten after every cell:
 *
 *     TIER_WALK_GAMES=group,unequal npx vitest run \
 *       -c scripts/checks/diff.vitest.config.mts tier-walk
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import "../../src/games/index.ts";
import {
  cappedSolveFor,
  type DifficultyContract,
  difficultyChoiceItem,
  lowestSolvingCap,
  withTier,
} from "../../src/engine/difficulty.ts";
import type { Game, ParamConfigItem } from "../../src/engine/game.ts";
import { paramsError } from "../../src/engine/params.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { getTsGame, registeredGameIds } from "../../src/engine/registry.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";

const OUT = "metrics/tier-walk.md";

const ONLY = process.env["TIER_WALK_GAMES"]?.split(",") ?? null;
const SEEDS = Number(process.env["TIER_WALK_SEEDS"] ?? 3);
const SLOW_MS = Number(process.env["TIER_WALK_SLOW_MS"] ?? 3000);

/** Where a field that declares no lower bound starts. Its real bound is in
 * `validateParams`, often against another field (Clusters, Loopy), so the walk
 * starts under any of them and the sizes too small come out as refused. */
const UNDECLARED_MIN = 1;

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
type AnyGame = Game<any, any, any, any, any, any>;
type Params = Record<string, unknown>;
type NumericItem = Extract<ParamConfigItem<Params>, { type: "string" }>;

interface Cell {
  label: string;
  tier: number;
  refusal: string | null;
  /** Left out because a smaller size of its shape was slow at this tier. */
  skipped: boolean;
  /** The lowest solving cap of each board dealt, `null` where no cap solves. */
  caps: (number | null)[];
  gaveUp: number;
  /** The slowest deal, in milliseconds. */
  slowest: number;
}

interface Section {
  id: string;
  tiers: readonly string[];
  cells: Cell[];
}

/** Every params record the walk deals for `game`, before tiers are applied,
 * each with the index of the menu shape it was built on. */
function sizesToWalk(game: AnyGame): { shape: number; params: Params }[] {
  const tierItem = difficultyChoiceItem<Params>(game);
  const presets = leafPresets(game).map((e) => e.params as Params);
  const numeric = (game.paramConfig ?? []).filter(
    (item: ParamConfigItem<Params>): item is NumericItem =>
      // Digits, and not `Number()`: a list field left empty reads as 0.
      item.type === "string" && presets.every((p) => /^\d+$/.test(item.get(p))),
  );
  const range = numeric.map((item) => ({
    item,
    lo: item.bounds?.min ?? UNDECLARED_MIN,
    hi: Math.max(...presets.map((p) => Number(item.get(p)))),
  }));

  const seen = new Set<string>();
  const out: { shape: number; params: Params }[] = [];
  const add = (shape: number, params: Params): void => {
    const key = game.encodeParams(tierItem ? withTier(game, params, 0) : params, true);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ shape, params });
  };

  presets.forEach((base, shape) => {
    // The fields stepped together, each stopping at its own largest.
    const steps = Math.max(0, ...range.map((r) => r.hi - r.lo));
    for (let k = 0; k <= steps; k++) {
      const p = { ...base };
      for (const r of range) r.item.set(p, String(Math.min(r.lo + k, r.hi)));
      add(shape, p);
    }
    // Each field alone, the others as the preset has them.
    for (const r of range) {
      for (let v = r.lo; v <= r.hi; v++) {
        const p = { ...base };
        r.item.set(p, String(v));
        add(shape, p);
      }
    }
  });
  return out;
}

function walk(section: Section, game: AnyGame, report: () => void): void {
  const { id, tiers } = section;
  const contract = game.difficulty as DifficultyContract<Params>;
  const slow = new Set<string>();
  for (const { shape, params } of sizesToWalk(game)) {
    for (let tier = 0; tier < tiers.length; tier++) {
      const p = withTier(game, params, tier);
      const label = game.encodeParams(p, true);
      const cell: Cell = {
        label,
        tier,
        refusal: paramsError(game, p, true),
        skipped: false,
        caps: [],
        gaveUp: 0,
        slowest: 0,
      };
      section.cells.push(cell);
      if (cell.refusal !== null) continue;
      if (slow.has(`${shape}:${tier}`)) {
        cell.skipped = true;
        continue;
      }
      for (let seed = 0; seed < SEEDS; seed++) {
        const started = performance.now();
        let desc: string | null = null;
        try {
          desc = game.newDesc(p, randomNew(`tier-walk-${id}-${label}-${seed}`)).desc;
        } catch {
          cell.gaveUp++;
        }
        cell.slowest = Math.max(cell.slowest, performance.now() - started);
        if (desc !== null) {
          cell.caps.push(
            lowestSolvingCap(cappedSolveFor(contract, p, desc), tiers.length),
          );
        }
        if (cell.slowest > SLOW_MS) {
          slow.add(`${shape}:${tier}`);
          break;
        }
      }
      report();
    }
  }
}

const isBelow = (cell: Cell): boolean =>
  cell.caps.some((cap) => cap !== null && cap < cell.tier);

/** What a cell did, in the words of the header's outcomes, or `null` where
 * every deal came out at its tier. */
function finding(cell: Cell, tiers: readonly string[]): string | null {
  const name = (cap: number | null): string =>
    cap === null ? "no cap" : (tiers[cap] ?? String(cap));
  const off = cell.caps.filter((cap) => cap !== cell.tier);
  const parts: string[] = [];
  if (off.length > 0) {
    parts.push(`${isBelow(cell) ? "BELOW" : "above"}: ${off.map(name).join(", ")}`);
  }
  if (cell.gaveUp > 0) parts.push(`gave up on ${cell.gaveUp}`);
  if (cell.slowest > SLOW_MS) parts.push(`${(cell.slowest / 1000).toFixed(1)} s`);
  return parts.length > 0 ? parts.join("; ") : null;
}

const HEADING = "## ";

/** The report's sections as they stand on disk, by game, each without its
 * heading. A walk of some games rewrites theirs and keeps the rest, so the
 * file stays the whole collection's. */
function sectionsOnDisk(): Map<string, string> {
  const out = new Map<string, string>();
  if (!existsSync(OUT)) return out;
  const [, ...blocks] = `\n${readFileSync(OUT, "utf8")}`.split(`\n${HEADING}`);
  for (const block of blocks) {
    const end = block.indexOf("\n");
    out.set(block.slice(0, end), block.slice(end + 1).trim());
  }
  return out;
}

function render(sections: readonly Section[], kept: Map<string, string>): string {
  const bodies = new Map(kept);
  for (const section of sections) bodies.set(section.id, renderSection(section));
  const lines: string[] = [
    "# Tier walk",
    "",
    `${SEEDS} deals a cell. A cell not listed dealt every board at its tier.`,
    "",
  ];
  for (const id of [...bodies.keys()].sort()) {
    lines.push(`${HEADING}${id}`, "", bodies.get(id) ?? "", "");
  }
  return `${lines.join("\n")}\n`;
}

function renderSection({ tiers, cells }: Section): string {
  const lines: string[] = [];
  const dealt = cells.filter((c) => c.refusal === null && !c.skipped);
  const skipped = cells.filter((c) => c.skipped);
  const refused = cells.filter((c) => c.refusal !== null);
  lines.push(
    `${dealt.length} cells dealt, ${refused.length} refused, ` +
      `${skipped.length} left out as slow.`,
    "",
  );
  for (const cell of dealt) {
    const found = finding(cell, tiers);
    if (found !== null) {
      lines.push(`- \`${cell.label}\` asked ${tiers[cell.tier]}: ${found}`);
    }
  }
  for (const cell of refused) {
    lines.push(`- \`${cell.label}\` refused: ${cell.refusal}`);
  }
  if (skipped.length > 0) {
    lines.push(`- left out: ${skipped.map((c) => `\`${c.label}\``).join(" ")}`);
  }
  return lines.join("\n").trimEnd();
}

it("walks every tier at sizes below the menu's largest", () => {
  const sections: Section[] = [];
  mkdirSync("metrics", { recursive: true });
  const kept = ONLY === null ? new Map<string, string>() : sectionsOnDisk();
  const report = (): void => writeFileSync(OUT, render(sections, kept));

  for (const id of registeredGameIds().sort()) {
    if (ONLY !== null && !ONLY.includes(id)) continue;
    const game = getTsGame(id) as AnyGame;
    const tiers = difficultyChoiceItem<Params>(game)?.choices ?? null;
    if (tiers === null || !game.difficulty) continue;
    const section: Section = { id, tiers, cells: [] };
    sections.push(section);
    walk(section, game, report);
  }
  report();

  // A filter that names no tiered game, or a walk that found no size to deal,
  // would otherwise write an empty report that reads as a clean one.
  const boards = sections.flatMap((s) => s.cells).flatMap((c) => c.caps);
  expect(sections.length, "no tiered game was walked").toBeGreaterThan(0);
  expect(boards.length, "no board was dealt").toBeGreaterThan(0);
});
