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
import { difficultyTiers, withTier } from "../../src/engine/contract/difficulty.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { game as clustersGame } from "../../src/generated/games/clusters/clusters.game.ts";
import { game as mosaicGame } from "../../src/generated/games/mosaic/mosaic.game.ts";
import { game as seismicGame } from "../../src/generated/games/seismic/seismic.game.ts";
import { game as starbattleGame } from "../../src/generated/games/starbattle/starbattle.game.ts";
import { game as unrulyGame } from "../../src/generated/games/unruly/unruly.game.ts";
import { say } from "../progress.ts";

// biome-ignore lint/suspicious/noExplicitAny: a walk over any tiered game.
type AnyGame = any;

const GAMES: [string, AnyGame][] = [
  ["unruly", unrulyGame],
  ["seismic", seismicGame],
  ["starbattle", starbattleGame],
  ["mosaic", mosaicGame],
  ["clusters", clustersGame],
];
const SEEDS = 40;

it("tiers", () => {
  const out = process.env["CORPUS_OUT"];
  if (out === undefined) throw new Error("CORPUS_OUT names the file to write");
  const input = process.env["CORPUS_IN"];
  // CORPUS_GAMES narrows the corpus to some games, by name, comma-separated.
  const only = process.env["CORPUS_GAMES"]?.split(",") ?? null;
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
    for (const [name, g] of GAMES.filter(([n]) => only === null || only.includes(n)))
      for (const [tier] of (difficultyTiers(g) ?? []).entries()) {
        say(`${name} tier ${tier}: ${lines.length} boards so far`);
        for (const base of [
          g.defaultParams(),
          ...(name === "unruly"
            ? [{ ...g.defaultParams(), variations: ["unique"] }]
            : []),
          ...(name === "seismic" ? [{ ...g.defaultParams(), sizes: { mode: 1 } }] : []),
        ])
          for (let s = 0; s < SEEDS; s++) {
            const p = withTier(g, base, tier);
            const { desc } = g.newDesc(p, randomNew(`tiers ${name} ${tier} ${s}`));
            const params = g.encodeParams(p, true);
            lines.push([name, params, desc, verdicts(g, p, desc)].join("\t"));
          }
      }
  writeFileSync(out, `${lines.join("\n")}\n`);
  say(`${lines.length} boards`);
});
