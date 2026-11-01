/**
 * A corpus of boards for the games a description newly states, and the
 * lowest tier each solves at, so two solvers can be compared on the same
 * boards: dealt by whichever generator the tree has, written to CORPUS_OUT;
 * or, with CORPUS_IN, read back and solved again at every cap. Each line is
 * the game, its params, the board, and its verdict at each cap from the
 * lowest.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { it } from "vitest";
import { difficultyTiers, withTier } from "../../src/engine/difficulty.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { seismicGame } from "../../src/games/seismic/index.ts";
import { unrulyGame } from "../../src/games/unruly/index.ts";

// biome-ignore lint/suspicious/noExplicitAny: a walk over any tiered game.
type AnyGame = any;

const GAMES: [string, AnyGame][] = [
  ["unruly", unrulyGame],
  ["seismic", seismicGame],
];
const SEEDS = 40;

it("tiers", () => {
  const out = process.env["CORPUS_OUT"];
  if (out === undefined) throw new Error("CORPUS_OUT names the file to write");
  const input = process.env["CORPUS_IN"];
  const lines: string[] = [];
  const verdicts = (g: AnyGame, p: unknown, desc: string): string =>
    (difficultyTiers(g) ?? [])
      .map((_, cap) => g.difficulty.solveAtCap(p, desc, cap))
      .join(" ");
  if (input !== undefined) {
    const byName = new Map(GAMES);
    for (const line of readFileSync(input, "utf8").split("\n")) {
      if (line === "") continue;
      const [name, params, desc] = line.split("\t");
      const g = byName.get(name);
      const p = g.decodeParams(params);
      lines.push([name, params, desc, verdicts(g, p, desc)].join("\t"));
    }
  } else
    for (const [name, g] of GAMES)
      for (const [tier] of (difficultyTiers(g) ?? []).entries())
        for (const base of [
          g.defaultParams(),
          ...(name === "unruly" ? [{ ...g.defaultParams(), unique: true }] : []),
          ...(name === "seismic" ? [{ ...g.defaultParams(), mode: 1 }] : []),
        ])
          for (let s = 0; s < SEEDS; s++) {
            const p = withTier(g, base, tier);
            const { desc } = g.newDesc(p, randomNew(`tiers ${name} ${tier} ${s}`));
            const params = g.encodeParams(p, true);
            lines.push([name, params, desc, verdicts(g, p, desc)].join("\t"));
          }
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`${lines.length} boards`);
});
