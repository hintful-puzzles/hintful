/**
 * Group A of the test (`test.md`): the corpus's fifteen wrong pairs. The pairs
 * the solver decides are run here, each technique first in its own game (it
 * must be sound there, or the statement is wrong) and then in the other game.
 * Every 'unsound' has passed the other game's independent verifier.
 *
 * `PAIRS="A1 A2"` runs those pairs (all by default). Writes `results-a.txt`
 * beside it, keeping the lines of pairs not run.
 */
import { it } from "vitest";
import * as N from "./numbers_loops.ts";
import {
  bindingOf,
  checkTechnique,
  type Formula,
  fixed,
  pad,
  pairsToRun,
  type ResultRow,
  say,
  showBinding,
  type Technique,
  writeResults,
} from "./pzl.ts";
import * as R from "./regions.ts";
import * as S from "./shading.ts";
import { Grid } from "./space.ts";

const TIMEOUT = 900;
const results = new Map<string, ResultRow[]>();

/** The narrowed search a game names, if it names one. */
function searchOf(extra: unknown): Formula[] {
  if (
    typeof extra === "object" &&
    extra !== null &&
    "search" in extra &&
    Array.isArray(extra.search)
  )
    return extra.search as Formula[];
  return [];
}

async function check<X>(
  pair: string,
  label: string,
  game: S.Game<X>,
  tech: Technique,
  split = 1,
  narrow = true,
): Promise<string> {
  const t0 = performance.now();
  const search = narrow ? searchOf(game.extra) : [];
  let { verdict, model, env } = await checkTechnique(
    [...game.rules, ...search],
    game.consistent,
    tech,
    {
      timeoutS: TIMEOUT,
      split,
      answerVars: game.answerVars,
      verify: game.verify,
    },
  );
  if (search.length > 0 && verdict.startsWith("sound"))
    verdict = "undecided (narrowed search)";
  const dt = (performance.now() - t0) / 1000;
  const binding = model !== null ? bindingOf(model, env) : null;
  say(
    `${pad(pair, 4)} ${pad(label, 58)} ${pad(verdict, 22)} ${fixed(dt, 7)}s` +
      (binding !== null ? `   at ${showBinding(binding)}` : ""),
  );
  const rows = results.get(pair) ?? [];
  rows.push({
    check: label,
    verdict,
    seconds: Math.round(dt * 10) / 10,
    binding: binding !== null ? showBinding(binding, true) : null,
  });
  results.set(pair, rows);
  return verdict;
}

/** x's technique is a technique of X: sound in X, and is it sound in Y? */
async function ownAndCross<X>(
  pair: string,
  board: Grid,
  xName: string,
  xGame: (g: Grid) => S.Game<X>,
  xTech: (g: Grid, gm: S.Game<X>) => Technique,
  yName: string,
  yGame: (g: Grid) => S.Game<X>,
  split = 1,
): Promise<void> {
  const gx = xGame(board);
  const gy = yGame(board);
  const tag = `${board.w}x${board.h}`;
  await check(
    pair,
    `${xName}'s ${xTech(board, gx).name} in ${xName} ${tag}`,
    gx,
    xTech(board, gx),
    split,
    false,
  );
  await check(
    pair,
    `${xName}'s ${xTech(board, gy).name} in ${yName} ${tag}`,
    gy,
    xTech(board, gy),
    split,
  );
}

const sizes: [number, number][] = [
  [4, 4],
  [5, 4],
];

const PAIRS = new Map<string, () => Promise<void>>([
  [
    "A1",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        await ownAndCross(
          "A1",
          g,
          "Nurikabe",
          S.nurikabe,
          S.nurikabeUnreachable,
          "Mochikoro",
          S.mochikoro,
        );
        await ownAndCross(
          "A1",
          g,
          "Mochikoro",
          S.mochikoro,
          S.mochikoroRectangle,
          "Nurikabe",
          S.nurikabe,
        );
      }
    },
  ],
  [
    "A2",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        const lits = (b: Grid) => R.lits(b, 2);
        const norinori = (b: Grid) => R.norinori(b, 4);
        await ownAndCross("A2", g, "LITS", lits, R.litsFour, "Norinori", norinori);
        await ownAndCross("A2", g, "Norinori", norinori, R.norinoriPair, "LITS", lits);
      }
    },
  ],
  [
    "A3",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        const heyawake = (b: Grid) => R.heyawake(b, 3);
        const hinge = (b: Grid) => R.hinge(b, 3);
        await ownAndCross(
          "A3",
          g,
          "Heyawake",
          heyawake,
          R.heyawakeAdjacent,
          "Hinge",
          hinge,
        );
        await ownAndCross("A3", g, "Hinge", hinge, R.hingeAlone, "Heyawake", heyawake);
      }
    },
  ],
  [
    "A4",
    async () => {
      for (const w of [4, 6]) {
        const g = new Grid(w, w);
        await ownAndCross(
          "A4",
          g,
          "Yin-Yang",
          S.yinyang,
          S.windowsCompletion,
          "Unruly",
          S.unruly,
        );
        await ownAndCross(
          "A4",
          g,
          "Unruly",
          S.unruly,
          S.unrulyThrees,
          "Yin-Yang",
          S.yinyang,
        );
      }
    },
  ],
  [
    "A5",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        await ownAndCross(
          "A5",
          g,
          "Range",
          S.rangeGame,
          S.rangeConnect,
          "Cave",
          S.cave,
        );
        await ownAndCross(
          "A5",
          g,
          "Range",
          S.rangeGame,
          S.rangeAdjacency,
          "Cave",
          S.cave,
        );
        await ownAndCross(
          "A5",
          g,
          "Cave",
          S.cave,
          S.caveEnclosed,
          "Range",
          S.rangeGame,
        );
      }
    },
  ],
  [
    "A7",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        const stostone = (b: Grid) => R.stostone(b, 4);
        const shimaguni = (b: Grid) => R.shimaguni(b, 4);
        await ownAndCross(
          "A7",
          g,
          "Stostone",
          stostone,
          R.stostoneColumn,
          "Shimaguni",
          shimaguni,
        );
        await ownAndCross(
          "A7",
          g,
          "Shimaguni",
          shimaguni,
          R.shimaguniDiffer,
          "Stostone",
          stostone,
        );
      }
    },
  ],
  [
    "A8",
    async () => {
      for (const [w, h] of [
        [3, 3],
        [4, 4],
      ]) {
        const g = new Grid(w, h);
        await ownAndCross(
          "A8",
          g,
          "Pipe Link",
          N.pipelink,
          N.pipeCorner,
          "Reflect Link",
          N.reflect,
        );
      }
    },
  ],
  [
    "A10",
    async () => {
      for (const [w, h] of sizes) {
        const g = new Grid(w, h);
        await ownAndCross("A10", g, "Sukoro", N.sukoro, N.sukoroFull, "View", N.view);
        await ownAndCross("A10", g, "View", N.view, N.viewSeen, "Sukoro", N.sukoro);
      }
    },
  ],
  [
    "A14",
    async () => {
      for (const n of [5, 6]) {
        const g = new Grid(n, n);
        await ownAndCross(
          "A14",
          g,
          "N-Queens",
          R.nqueens,
          R.nqueensDiagonal,
          "Star Battle",
          (b) => R.starbattle(b, n),
        );
      }
    },
  ],
]);

it("run_a", async () => {
  for (const name of pairsToRun([...PAIRS.keys()])) {
    const run = PAIRS.get(name);
    if (run === undefined) throw new Error(`no pair ${name}`);
    await run();
  }
  writeResults("results-a.txt", results);
});
