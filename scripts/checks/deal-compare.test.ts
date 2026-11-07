/**
 * **What does a change cost a game's deals and solves, on the same boards?**
 * Deal each preset of some games with the same seeds on the working tree and
 * on another commit, alternating which side goes first, and time each deal and
 * each single solve of the board at every cap. It checks the boards the two
 * deal are the same and that each cap's verdict on a board is the same, so a
 * timing never compares two different pieces of work without saying so.
 *
 * **Why this and not a profile.** `deal-profile` says where the work is; only
 * the same boards timed both ways say what a change costs, because a share of
 * a profile cannot tell work the old code also did from work it did not.
 *
 *     DEAL_COMPARE_BASE=HEAD DEAL_COMPARE_GAMES=slant,path \
 *       npx vitest run -c scripts/checks/diff.vitest.config.mts deal-compare
 *
 * extracts the commit's `src/` to `.deal-compare/<sha>/` once (ignored by git,
 * and kept for the next run), imports both trees' games in this one process,
 * and writes the report to `.deal-compare/report.md` a preset at a time, so a
 * long run can be watched there. `DEAL_COMPARE_SEEDS` deals each preset that
 * many times (5), `DEAL_COMPARE_SOLVES` repeats each board's solves (3), and
 * `DEAL_COMPARE_PRESETS` keeps the presets whose encoded params contain one
 * of its comma-separated strings.
 *
 * **It fails only where a board's verdicts differ**, which no change to how a
 * solver concludes may cause; a board that differs is the generator's, and is
 * reported. **The times are a report**: the machine is busy and its load
 * moves, which the alternation spreads over both sides but cannot remove.
 * HEAD against itself read 0.73 to 1.15× a preset at three deals
 * (2026-11-07), so a claim rests on more deals than that, or on two runs that
 * agree, and a game's total row is steadier than a preset's.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import "../../src/games/index.ts";
import { difficultyTiers } from "../../src/engine/difficulty.ts";
import type { Game } from "../../src/engine/game.ts";
import { paramsError } from "../../src/engine/params.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { getTsGame } from "../../src/engine/registry.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
type AnyGame = Game<any, any, any, any, any, any>;
type RandomNew = (seed: string) => Parameters<AnyGame["newDesc"]>[1];

const BASE = process.env["DEAL_COMPARE_BASE"] ?? null;
const GAMES = process.env["DEAL_COMPARE_GAMES"]?.split(",") ?? [];
const SEEDS = Number(process.env["DEAL_COMPARE_SEEDS"] ?? 5);
const SOLVES = Number(process.env["DEAL_COMPARE_SOLVES"] ?? 3);
const PRESETS = process.env["DEAL_COMPARE_PRESETS"]?.split(",") ?? null;
const DIR = ".deal-compare";
const REPORT = `${DIR}/report.md`;

interface Side {
  game: AnyGame;
  randomNew: RandomNew;
}

/** The base commit's `src/`, extracted once by its full hash. */
async function baseTree(
  rev: string,
): Promise<{ sha: string; getTsGame: typeof getTsGame; randomNew: RandomNew }> {
  const sha = execFileSync("git", ["rev-parse", "--verify", `${rev}^{commit}`], {
    encoding: "utf8",
  }).trim();
  const root = resolve(DIR, sha);
  if (!existsSync(`${root}/src`)) {
    mkdirSync(root, { recursive: true });
    const tar = execFileSync("git", ["archive", sha, "src"], { maxBuffer: 1 << 30 });
    execFileSync("tar", ["-x", "-C", root], { input: tar });
  }
  await import(`${root}/src/games/index.ts`);
  const registry = (await import(`${root}/src/engine/registry.ts`)) as {
    getTsGame: typeof getTsGame;
  };
  const random = (await import(`${root}/src/engine/random/index.ts`)) as {
    randomNew: RandomNew;
  };
  return { sha, getTsGame: registry.getTsGame, randomNew: random.randomNew };
}

/** Each cap's verdict on a board, or the one answer of a game without tiers. */
function verdicts(
  game: AnyGame,
  params: unknown,
  desc: string,
  caps: number,
): string[] {
  const contract = game.difficulty;
  if (contract !== undefined) {
    return Array.from({ length: caps }, (_, cap) =>
      contract.solveAtCap(params, desc, cap),
    );
  }
  if (game.finishesByDeduction !== undefined) {
    return [String(game.finishesByDeduction(game.newState(params, desc)))];
  }
  return [];
}

interface Cell {
  label: string;
  deal: [number, number];
  dealMax: [number, number];
  solve: [number, number];
  boards: number;
  differentBoards: number;
  differentVerdicts: number;
}

const ms = (n: number): string => (n < 10 ? n.toFixed(2) : n.toFixed(0));
const ratio = (head: number, base: number): string =>
  base === 0 ? "-" : `${(head / base).toFixed(2)}×`;

function row(c: Cell): string {
  const n = Math.max(c.boards, 1);
  const flags = [
    c.differentBoards > 0 ? `${c.differentBoards} boards differ` : "",
    c.differentVerdicts > 0 ? `${c.differentVerdicts} verdicts differ` : "",
  ]
    .filter((s) => s !== "")
    .join(", ");
  return `| ${c.label} | ${c.boards} | ${ms(c.deal[1] / n)} | ${ms(c.deal[0] / n)} | ${ratio(c.deal[0], c.deal[1])} | ${ms(c.dealMax[1])} | ${ms(c.dealMax[0])} | ${ms(c.solve[1] / n)} | ${ms(c.solve[0] / n)} | ${ratio(c.solve[0], c.solve[1])} | ${flags} |`;
}

/** Time `f` on each side, the side that goes first alternating by `turn`. */
function both<T>(turn: number, f: (side: 0 | 1) => T): [T, T, number, number] {
  const out: (T | null)[] = [null, null];
  const took = [0, 0];
  for (const side of turn % 2 === 0 ? ([0, 1] as const) : ([1, 0] as const)) {
    const started = performance.now();
    out[side] = f(side);
    took[side] = performance.now() - started;
  }
  return [out[0] as T, out[1] as T, took[0] ?? 0, took[1] ?? 0];
}

function compare(id: string, sides: [Side, Side]): Cell[] {
  const [head, base] = sides;
  const caps = difficultyTiers(head.game)?.length ?? 0;
  const cells: Cell[] = [];
  for (const { params } of leafPresets(head.game)) {
    if (paramsError(head.game, params, true) !== null) continue;
    const label = head.game.encodeParams(params, true);
    if (PRESETS !== null && !PRESETS.some((p) => label.includes(p))) continue;
    const baseParams = base.game.decodeParams(label);
    const p: [unknown, unknown] = [params, baseParams];
    const cell: Cell = {
      label: `${id} ${label}`,
      deal: [0, 0],
      dealMax: [0, 0],
      solve: [0, 0],
      boards: 0,
      differentBoards: 0,
      differentVerdicts: 0,
    };
    // An untimed deal a side first, so neither pays the other's warm-up.
    both(0, (s) =>
      sides[s].game.newDesc(p[s], sides[s].randomNew(`deal-compare-warm-${label}`)),
    );
    for (let seed = 0; seed < SEEDS; seed++) {
      const [a, b, ta, tb] = both(seed, (s) =>
        sides[s].game.newDesc(
          p[s],
          sides[s].randomNew(`deal-compare-${label}-${seed}`),
        ),
      );
      cell.deal[0] += ta;
      cell.deal[1] += tb;
      cell.dealMax[0] = Math.max(cell.dealMax[0], ta);
      cell.dealMax[1] = Math.max(cell.dealMax[1], tb);
      cell.boards++;
      if (a.desc !== b.desc) cell.differentBoards++;
      // The solves are of the working tree's board on both sides, so a
      // generator that changed still has its solver compared on one board.
      for (let rep = 0; rep < SOLVES; rep++) {
        const [va, vb, sa, sb] = both(seed + rep, (s) =>
          verdicts(sides[s].game, p[s], a.desc, caps),
        );
        cell.solve[0] += sa / SOLVES;
        cell.solve[1] += sb / SOLVES;
        if (rep === 0 && va.join() !== vb.join()) cell.differentVerdicts++;
      }
    }
    cells.push(cell);
    appendFileSync(REPORT, `${row(cell)}\n`);
  }
  return cells;
}

// `npm run diff` runs every advisory check, and this one has nothing to
// compare until it is told what.
it.skipIf(BASE === null)(
  "times the same boards' deals and solves on the working tree and another commit",
  async () => {
    expect(GAMES.length, "set DEAL_COMPARE_GAMES").toBeGreaterThan(0);
    const base = await baseTree(BASE ?? "HEAD");
    mkdirSync(DIR, { recursive: true });
    writeFileSync(
      REPORT,
      [
        `# Deals and solves on the same boards: the working tree against ${base.sha.slice(0, 10)} (${BASE})`,
        "",
        `${SEEDS} deals a preset, each board's solves at every cap ${SOLVES} times; mean ms.`,
        "",
        "| Preset | Boards | Deal base | Deal now | Ratio | Max base | Max now | Solve base | Solve now | Ratio | Differences |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        "",
      ].join("\n"),
    );
    const all: Cell[] = [];
    for (const id of GAMES) {
      const sides: [Side, Side] = [
        { game: getTsGame(id) as AnyGame, randomNew },
        { game: base.getTsGame(id) as AnyGame, randomNew: base.randomNew },
      ];
      const cells = compare(id, sides);
      // A game's whole: its presets' total time, so the large boards weigh most.
      const whole: Cell = {
        label: `**${id}**`,
        deal: [0, 0],
        dealMax: [0, 0],
        solve: [0, 0],
        boards: 0,
        differentBoards: 0,
        differentVerdicts: 0,
      };
      for (const c of cells) {
        for (const s of [0, 1] as const) {
          whole.deal[s] += c.deal[s];
          whole.dealMax[s] = Math.max(whole.dealMax[s], c.dealMax[s]);
          whole.solve[s] += c.solve[s];
        }
        whole.boards += c.boards;
        whole.differentBoards += c.differentBoards;
        whole.differentVerdicts += c.differentVerdicts;
      }
      appendFileSync(REPORT, `${row(whole)}\n`);
      all.push(...cells);
    }
    // The instrument's known positive: something was dealt on both sides.
    expect(all.length, "no preset was dealt").toBeGreaterThan(0);
    // A board's verdicts are what its solver concludes, which no change to how
    // it concludes them may move. A board that differs is the generator's.
    const moved = all.filter((c) => c.differentVerdicts > 0).map((c) => c.label);
    expect(moved, `verdicts differ: see ${REPORT}`).toEqual([]);
  },
);
