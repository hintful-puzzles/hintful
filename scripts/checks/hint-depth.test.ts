/**
 * **How deep is each rung's step, and does its tier agree?** A step's depth is
 * how many facts its words lean on that the board does not show, each a claim
 * about every placement of some element (`hint-words.ts`'s `derived`, read as
 * `Narration.depth`). Measured on Rectangles (`review-rect-hints-and-tiers`),
 * that ordered the rungs by how hard they are where a sentence's length and the
 * placements its claim ranges over did not.
 *
 * This walks every board each hinted game's menu offers, two deals each, to the
 * end of its plan, and records each step's depth against its rung. A rung's
 * tier is measured, not declared: the lowest tier on whose boards it is
 * spoken.
 *
 * It lists a step whose depth is out of order with its tier: no deeper than
 * the typical step of a rung in a lower tier, or deeper than the typical step
 * of one in a higher tier, where a rung's typical step is its median depth.
 * Such a step sits in the wrong tier, or its words rest on a fact they do not
 * name (`measure-hint-depth`, design.md § "Tried against the old `line`
 * sentence").
 *
 * **It is a report, not a gate.** Which depth belongs in which tier is a
 * judgment per game. A game that declares no derived reference reads 0
 * everywhere, so it is listed as undeclared rather than as shallow.
 *
 *     npx vitest run -c scripts/checks/diff.vitest.config.mts hint-depth
 *
 * `HINT_DEPTH_GAMES=rect,towers` limits it to some games, and
 * `HINT_DEPTH_SEEDS=200` deals each board more often than twice.
 */
import { writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { difficultyChoiceItem, tierOf } from "../../src/engine/difficulty.ts";
import { paramsError } from "../../src/engine/params.ts";
import { dealt } from "../../src/engine/testing/dealt.ts";
import { HINT_GAMES } from "../../src/engine/testing/hint-games.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";

const OUT = "metrics/hint-depth.md";
const ONLY = process.env["HINT_DEPTH_GAMES"]?.split(",") ?? null;
/** Deals of each board. A rare case of a rung needs more than the default. */
const SEEDS = [...Array(Number(process.env["HINT_DEPTH_SEEDS"] ?? 2)).keys()];
/** Steps walked on one board, and hint requests made of it. */
const STEPS = 400;
const ROUNDS = 80;

interface Rung {
  /** The lowest tier whose boards speak it. */
  tier: number;
  /** Steps by depth. */
  depths: Map<number, number>;
  /** One sentence for each depth, its numbers folded, as an example. */
  said: Map<number, string>;
}

const median = (depths: Map<number, number>): number => {
  const all = [...depths].sort((a, b) => a[0] - b[0]);
  let left = Math.ceil([...depths.values()].reduce((a, b) => a + b, 0) / 2);
  for (const [d, n] of all) {
    left -= n;
    if (left <= 0) return d;
  }
  return 0;
};

const histogram = (depths: Map<number, number>): string =>
  [...depths]
    .sort((a, b) => a[0] - b[0])
    .map(([d, n]) => `${d}×${n}`)
    .join(" ");

it("reports each rung's depth, and the steps out of order with their tier", () => {
  const games = new Map<
    string,
    { tiers: readonly string[]; rungs: Map<string, Rung> }
  >();
  let examined = 0;
  let laterLegs = 0;

  for (const [name, game] of HINT_GAMES) {
    if (ONLY && !ONLY.includes(name)) continue;
    const item = difficultyChoiceItem(game);
    const rungs = new Map<string, Rung>();
    games.set(name, { tiers: item?.choices ?? [""], rungs });
    for (const { params } of leafPresets(game)) {
      if (paramsError(game, params, true)) continue;
      const tier = item ? tierOf(game, params) : 0;
      for (const seed of SEEDS) {
        const { desc, aux } = dealt(game, params, seed);
        let state = game.newState(params, desc);
        const ui = game.newUi(state);
        let walked = 0;
        for (let round = 0; round < ROUNDS && walked < STEPS; round++) {
          if (game.status(state) !== "ongoing") break;
          const res = game.hint?.(state, aux, ui);
          if (!res?.ok) break;
          for (const step of res.steps) {
            if (walked++ >= STEPS) break;
            const form = step.words?.form;
            // A journey's later leg rests on the reasoning its first leg gave
            // and says only what it is for, so its depth is the first leg's.
            if (form && "relation" in form && form.relation === "again") laterLegs++;
            else {
              examined++;
              const depth = step.words?.depth ?? 0;
              const id = step.rung ?? "(no rung)";
              const r = rungs.get(id) ?? { tier, depths: new Map(), said: new Map() };
              rungs.set(id, r);
              r.tier = Math.min(r.tier, tier);
              r.depths.set(depth, (r.depths.get(depth) ?? 0) + 1);
              if (!r.said.has(depth))
                r.said.set(depth, step.explanation.replace(/\d+/g, "#"));
            }
            const live = game.refreshHintStep
              ? game.refreshHintStep(step, state)
              : step;
            if (live === null) continue;
            state = game.executeMove(state, live.move);
          }
        }
      }
    }
  }

  const declaring = [...games].filter(([, g]) =>
    [...g.rungs.values()].some((r) => [...r.depths.keys()].some((d) => d > 0)),
  );
  // The "how many did I look at?" guard, and the instrument's known positive:
  // some game declares a derived reference, and its steps read deeper than 0.
  expect(examined, "no hint step was examined").toBeGreaterThan(ONLY ? 0 : 5000);
  expect(declaring.length, "no step read deeper than 0").toBeGreaterThan(0);

  const table: string[] = [];
  const listed: string[] = [];
  for (const [name, { tiers, rungs }] of declaring) {
    const typical = [...rungs].map(([id, r]) => ({
      id,
      ...r,
      typical: median(r.depths),
    }));
    for (const r of typical) {
      table.push(
        `| ${name} | ${r.id} | ${tiers[r.tier] || "–"} | ${histogram(r.depths)} |`,
      );
      const lower = typical.filter((o) => o.tier < r.tier).map((o) => o.typical);
      const higher = typical.filter((o) => o.tier > r.tier).map((o) => o.typical);
      const floor = lower.length ? Math.max(...lower) : -1;
      const ceiling = higher.length ? Math.min(...higher) : Infinity;
      for (const [d, n] of [...r.depths].sort((a, b) => a[0] - b[0])) {
        const why =
          d <= floor
            ? `no deeper than a lower tier's typical ${floor}`
            : d > ceiling
              ? `deeper than a higher tier's typical ${ceiling}`
              : null;
        if (why === null) continue;
        listed.push(
          `| ${name} | ${r.id} | ${tiers[r.tier] || "–"} | ${d} | ${n} | ${why} | ${(r.said.get(d) ?? "").replace(/\|/g, "\\|")} |`,
        );
      }
    }
  }
  const undeclared = [...games.keys()].filter(
    (g) => !declaring.some(([name]) => name === g),
  );

  const lines = [
    "# Hint depth",
    "",
    "Generated by `npx vitest run -c scripts/checks/diff.vitest.config.mts hint-depth`.",
    "**Advisory.** A step's depth is how many facts its words lean on that the",
    "board does not show (`hint-words.ts`'s `derived`). A listed step sits in the",
    "wrong tier, or its words rest on a fact they do not name.",
    "",
    `${examined} steps walked in ${games.size} games, and ${laterLegs} later legs of a journey`,
    `set aside, since each rests on its first leg; ${declaring.length} games declare a derived reference.`,
    "",
    "## Depth by rung",
    "",
    "A rung's tier is the lowest whose boards speak it. Depths are `depth×steps`.",
    "",
    "| game | rung | tier | depths |",
    "| --- | --- | --- | --- |",
    ...table,
    "",
    "## Steps out of order with their tier",
    "",
    listed.length ? "| game | rung | tier | depth | steps | why | said |" : "None.",
    ...(listed.length
      ? ["| --- | --- | --- | --- | --- | --- | --- |", ...listed]
      : []),
    "",
    "## Games that declare nothing",
    "",
    "Every step reads 0 here, so the depths say nothing about these games yet.",
    "",
    undeclared.length ? undeclared.join(", ") : "None.",
  ];
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(
    `wrote ${OUT}: ${examined} steps, ${declaring.length} declaring games, ${listed.length} listed`,
  );
});
