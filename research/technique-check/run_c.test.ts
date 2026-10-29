/**
 * Group C of the test (`test.md`): the variations that need every rung
 * stated. Each game's ladder is checked in its own game and in the variation,
 * both ways; a technique general in a relation or parameter reads the
 * variation's.
 *
 * `PAIRS="C2 C12 C8"` runs those pairs (all by default). Writes
 * `results-c.txt`.
 */
import { readFileSync } from "node:fs";
import { it } from "vitest";
import * as L from "./ladders.ts";
import * as L2 from "./ladders2.ts";
import {
  bindingOf,
  checkTechnique,
  fixed,
  node,
  pad,
  pairsToRun,
  type ResultRow,
  say,
  showBinding,
  type Technique,
  writeResults,
  Z3,
} from "./pzl.ts";
import type { Game } from "./shading.ts";
import { type Cell, cell, Grid } from "./space.ts";

const TIMEOUT = 1800;
const results = new Map<string, ResultRow[]>();

function record(pair: string, row: ResultRow): void {
  const rows = results.get(pair) ?? [];
  rows.push(row);
  results.set(pair, rows);
}

async function check<X>(
  pair: string,
  label: string,
  game: Game<X>,
  tech: Technique,
  split: number,
): Promise<string> {
  const t0 = performance.now();
  const { verdict, model, env } = await checkTechnique(
    game.rules,
    game.consistent,
    tech,
    {
      timeoutS: TIMEOUT,
      split,
      answerVars: game.answerVars,
      verify: game.verify,
    },
  );
  const dt = (performance.now() - t0) / 1000;
  const b = model !== null ? bindingOf(model, env) : null;
  const shown = b !== null && Object.keys(b).length > 0;
  say(
    `${pad(pair, 4)} ${pad(label, 58)} ${pad(verdict, 28)} ${fixed(dt, 7)}s` +
      (shown ? `   at ${showBinding(b)}` : ""),
  );
  record(pair, {
    check: label,
    verdict,
    seconds: Math.round(dt * 10) / 10,
    binding: shown ? showBinding(b, true) : null,
  });
  return verdict;
}

async function satisfiable<X>(game: Game<X>): Promise<string> {
  const s = new Z3.Solver();
  s.set("timeout", 600000);
  s.add(...game.rules.map((r) => node(r).z(1)));
  return s.check();
}

async function ladderIn<X>(
  pair: string,
  ladder: Technique[],
  xName: string,
  game: Game<X>,
  splits: Record<string, number>,
): Promise<void> {
  for (const t of ladder)
    await check(
      pair,
      `${xName}'s ${t.name} in ${game.name}`,
      game,
      t,
      splits[t.name] ?? 1,
    );
}

const SOLO_SPLITS = {
  hiddenSingle: 1,
  nakedSingle: 1,
  intersect: 2,
  subset: 3,
  hiddenPair: 2,
  fish: 3,
  wing: 3,
  forcingChain: 3,
};

const SEISMIC_SPLITS = { nakedSingle: 1, strike: 2, hiddenSingle: 1, starve: 2 };

const PAIRS = new Map<string, () => Promise<void>>([
  [
    "C2",
    async () => {
      for (const [rw, rh] of [
        [2, 2],
        [3, 2],
      ]) {
        const n = rw * rh;
        const g = new Grid(n, n);
        // Plain Solo and Jigsaw have one ladder, general in the units
        // (`rungs.md`), so the ladder checked in each game is both games'.
        for (const y of [L.solo(g, rw, rh, false), L.solo(g, rw, rh, true)])
          await ladderIn("C2", L.soloLadder(g, y), "Solo", y, SOLO_SPLITS);
      }
    },
  ],
  [
    "C12",
    async () => {
      for (const [w, h, k] of [
        [4, 4, 4],
        [5, 4, 5],
      ]) {
        const g = new Grid(w, h);
        const both = [L.seismic(g, k, false), L.seismic(g, k, true)];
        for (const y of both)
          say(`     ${y.name} ${w}x${h} satisfiable: ${await satisfiable(y)}`);
        // The two rulesets have one ladder, general in clash: checked in a
        // game, it reads that game's clash, so one run a game is both ways.
        for (const y of both)
          await ladderIn(
            "C12",
            L.seismicLadder(g, y),
            `Seismic ${w}x${h}`,
            y,
            SEISMIC_SPLITS,
          );
      }
    },
  ],
  [
    // C12's deciding direction alone: Seismic's ladder, reading Tectonic's
    // clash, in Tectonic on 4x4.
    "C12T",
    async () => {
      const g = new Grid(4, 4);
      const tect = L.seismic(g, 4, true);
      await ladderIn(
        "C12",
        L.seismicLadder(g, tect),
        "Seismic 4x4",
        tect,
        SEISMIC_SPLITS,
      );
    },
  ],
  [
    "C8",
    async () => {
      // One star, the plain game, and two stars, on boards where two fit.
      for (const n of [5, 6]) {
        const g = new Grid(n, n);
        const one = L.starbattle(g, 1);
        await ladderIn("C8", L.starbattleLadder(g, one), `one star ${n}x${n}`, one, {});
      }
      for (const n of [7, 8]) {
        const g = new Grid(n, n);
        const two = L.starbattle(g, 2);
        const r = await satisfiable(two);
        say(`     two stars ${n}x${n} satisfiable: ${r}`);
        if (r === "sat")
          await ladderIn(
            "C8",
            L.starbattleLadder(g, two),
            `one star's, k read from two stars ${n}x${n}`,
            two,
            {},
          );
      }
    },
  ],
  [
    // Three stars fit on no board under 12x12 (10x10 and 11x11 are unsat),
    // and z3 does not settle 12x12 with the regions as variables in ten
    // minutes. So the ladder is checked on two 12x12 boards the game's own
    // generator dealt (`starbattle-12x12-3.txt`, seeds "cut a" and "cut b"):
    // a claim about those deals, not every deal of the size.
    "C9",
    async () => {
      const text = readFileSync(
        new URL("starbattle-12x12-3.txt", import.meta.url),
        "utf8",
      );
      const maps = text
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.split(",").map(Number));
      const g = new Grid(12, 12);
      for (const [i, m] of maps.entries()) {
        const dealt = new Map<Cell, number>(
          g.cells.map(([x, y]) => [cell(x, y), m[y * 12 + x]]),
        );
        const three = L.starbattle(g, 3, dealt);
        say(
          `     three stars, dealt board ${i + 1}, satisfiable: ${await satisfiable(three)}`,
        );
        await ladderIn(
          "C9",
          L.starbattleLadder(g, three),
          `one star's, k from three stars, board ${i + 1}`,
          three,
          {},
        );
      }
    },
  ],
  [
    // Ascent's ladder, general in adjacency, `dist` and `near`, in each mode
    // and on a board shape with a wall (C4, C5, C7 together).
    "C4",
    async () => {
      for (const [w, h] of [
        [3, 3],
        [4, 3],
      ])
        for (const [mode, walls] of [
          ["classic", []],
          ["orth", []],
          ["hex", []],
          ["classic", [cell(w - 1, 0)]],
        ] as const) {
          const gm = L2.ascent(w, h, mode, walls);
          say(`     ${gm.name} satisfiable: ${await satisfiable(gm)}`);
          await ladderIn("C4", L2.ascentLadder(gm), "Ascent", gm, { proximity: 2 });
        }
    },
  ],
  [
    "C13",
    async () => {
      for (const [w, h] of [
        [3, 3],
        [4, 3],
      ])
        for (const mode of ["path", "pairs"]) {
          const gm = L2.pathGame(w, h, mode);
          say(`     ${gm.name} satisfiable: ${await satisfiable(gm)}`);
          await ladderIn("C13", L2.pathLadder(gm), "Path", gm, {
            forced: 2,
            joined: 3,
            closed: 1,
            stuck: 3,
          });
        }
    },
  ],
  [
    "C14",
    async () => {
      for (const [w, h] of [
        [3, 3],
        [4, 3],
      ])
        for (const mode of ["crosses", "random"]) {
          const gm = L2.flip(w, h, mode);
          await ladderIn("C14", L2.flipLadder(gm), "Flip", gm, { lastChance: 2 });
        }
    },
  ],
  [
    "C22",
    async () => {
      for (const [w, h] of [
        [3, 3],
        [4, 3],
      ])
        for (const wrap of [false, true]) {
          const gm = L2.net(w, h, wrap);
          say(`     ${gm.name} satisfiable: ${await satisfiable(gm)}`);
          await ladderIn("C22", L2.netLadder(gm), "Net", gm, {
            side: 3,
            loop: 4,
            sealed: 3,
            neighbor: 3,
          });
        }
    },
  ],
  [
    // Bridges' most bridges a pair: an answer under a lower bound is an answer
    // under a higher one, for every pair of islands.
    "C18",
    async () => {
      const t0 = performance.now();
      for (const [lo, hi] of [
        [1, 2],
        [2, 3],
        [3, 4],
      ]) {
        const b = Z3.Int.const("bridges");
        const s = new Z3.Solver();
        s.add(b.ge(0), b.le(lo), Z3.Not(b.le(hi)));
        const v = (await s.check()) === "unsat" ? "entails" : "not";
        say(`C18  most ${lo} gives most ${hi}: ${v}`);
        record("C18", {
          check: `Bridges most ${lo} entails most ${hi}`,
          verdict: v,
          seconds: Math.round((performance.now() - t0) / 100) / 10,
          binding: null,
        });
      }
    },
  ],
]);

it("run_c", async () => {
  for (const name of pairsToRun([...PAIRS.keys()])) {
    const run = PAIRS.get(name);
    if (run === undefined) throw new Error(`no pair ${name}`);
    await run();
  }
  writeResults("results-c.txt", results);
});
