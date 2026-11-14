/**
 * **How much of a described game's deal and hint walk could its description
 * cost?** A sampling profile of each game's deals and hint walks at HEAD,
 * which reports the share `f` of samples with described code on the stack: a
 * compiled module, or the runtime only compiled code calls.
 *
 * **Why a share bounds the cost.** The description replaced code that did the
 * same deductions and dealt the same boards, so whatever runs with no
 * described frame on the stack ran before too. The hand-written game took at
 * least the `(1 − f)` that remains, and the described one is at most
 * `1 / (1 − f)` times it: under 10% where `f` is under 9%. A game cleared
 * that way needs no worktree at its last hand-written commit; one that is not
 * is timed back to back against it, and the functions listed are where to
 * look first. Glue in a game's own files that builds what a module reads is
 * not counted, so a game whose solver changed shape is timed regardless.
 *
 * **A report and not a gate.** The shares are one machine's on one day, and a
 * cell is a few deals.
 *
 *     DEAL_PROFILE_PROGRESS=/tmp/p.md \
 *       npx vitest run -c scripts/checks/diff.vitest.config.mts deal-profile
 *
 * writes `metrics/deal-profile.md`, and each game's lines to the progress file
 * as it ends. `DEAL_PROFILE_GAMES=rect,path` limits it to some games and
 * writes only the progress file, `DEAL_PROFILE_SEEDS` deals each preset that
 * many times (2), and `DEAL_PROFILE_BUDGET_MS` stops a game's deals, and then
 * its walks, once they have taken that long (20,000).
 */
import { appendFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { Session } from "node:inspector/promises";
import { expect, it } from "vitest";
import "../../src/games/index.ts";
import type { Game } from "../../src/engine/game.ts";
import { paramsError } from "../../src/engine/params.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { getTsGame } from "../../src/engine/registry.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
type AnyGame = Game<any, any, any, any, any, any>;

const OUT = "metrics/deal-profile.md";
const PROGRESS = process.env["DEAL_PROFILE_PROGRESS"] ?? null;
const ONLY = process.env["DEAL_PROFILE_GAMES"]?.split(",") ?? null;
const SEEDS = Number(process.env["DEAL_PROFILE_SEEDS"] ?? 2);
const BUDGET_MS = Number(process.env["DEAL_PROFILE_BUDGET_MS"] ?? 20_000);
/** The hot functions listed a phase. */
const TOP = Number(process.env["DEAL_PROFILE_TOP"] ?? 6);
/** Steps walked on one board, and hint requests made of it. */
const STEPS = 400;
const ROUNDS = 80;

/** The described games: those with a compiled module. */
const DESCRIBED = readdirSync("src/games")
  .filter((id) => existsSync(`src/games/${id}/${id}.compiled.ts`))
  .sort();

/** Code that runs only because a game is described. */
const DESCRIBED_CODE =
  /\.compiled\.ts|\/engine\/(describe-runtime|ladder-runtime|position-runtime)\.ts/;

interface ProfileNode {
  id: number;
  callFrame: { functionName: string; url: string };
  hitCount?: number;
  children?: number[];
}

interface Share {
  samples: number;
  described: number;
  /** Self samples under described code, by `file:function`. */
  hot: Map<string, number>;
}

const file = (url: string): string => url.slice(url.lastIndexOf("/") + 1);

function share(nodes: ProfileNode[]): Share {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: Share = { samples: 0, described: 0, hot: new Map() };
  const visit = (node: ProfileNode, under: boolean): void => {
    const own = DESCRIBED_CODE.test(node.callFrame.url);
    const hits = node.hitCount ?? 0;
    const name = node.callFrame.functionName || "(anonymous)";
    // The idle pseudo-frames are no one's deal; the collector's are.
    if (name !== "(idle)" && name !== "(program)") out.samples += hits;
    if (under || own) {
      out.described += hits;
      const key = `${own ? "" : "(callee) "}${file(node.callFrame.url)}:${name}`;
      out.hot.set(key, (out.hot.get(key) ?? 0) + hits);
    }
    for (const child of node.children ?? []) {
      const next = byId.get(child);
      if (next) visit(next, under || own);
    }
  };
  const root = nodes[0];
  if (root) visit(root, false);
  return out;
}

const pct = (n: number, of: number): string =>
  of === 0 ? "-" : `${((100 * n) / of).toFixed(1)}%`;

/** The most the description can have added: `1 / (1 − f) − 1`. */
function bound(s: Share): string {
  const f = s.samples === 0 ? 0 : s.described / s.samples;
  return f >= 1 ? "∞" : `${((1 / (1 - f) - 1) * 100).toFixed(0)}%`;
}

const top = (s: Share, n: number): string =>
  [...s.hot]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} ${pct(v, s.samples)}`)
    .join("; ");

interface Board {
  params: unknown;
  desc: string;
  aux?: string;
}

function presetsOf(game: AnyGame): { params: unknown; label: string }[] {
  return leafPresets(game)
    .filter(({ params }) => paramsError(game, params, true) === null)
    .map(({ params }) => ({ params, label: game.encodeParams(params, true) }));
}

/** Deal every preset `SEEDS` times, within the budget, keeping the boards. */
function deal(game: AnyGame, boards: Board[]): number {
  const started = performance.now();
  for (let seed = 0; seed < SEEDS; seed++) {
    for (const { params, label } of presetsOf(game)) {
      if (performance.now() - started > BUDGET_MS) break;
      const rng = randomNew(`deal-profile-${label}-${seed}`);
      const { desc, aux } = game.newDesc(params, rng);
      boards.push({ params, desc, aux });
    }
  }
  return performance.now() - started;
}

/** Follow each board's hints to its end, within the budget. */
function walk(game: AnyGame, boards: Board[]): number {
  const started = performance.now();
  for (const { params, desc, aux } of boards) {
    if (performance.now() - started > BUDGET_MS) break;
    let state = game.newState(params, desc);
    const ui = game.newUi(state);
    let walked = 0;
    for (let round = 0; round < ROUNDS && walked < STEPS; round++) {
      if (game.status(state) !== "ongoing") break;
      const res = game.hint?.(state, aux, ui);
      if (!res?.ok) break;
      for (const step of res.steps) {
        if (walked++ >= STEPS) break;
        const live = game.refreshHintStep ? game.refreshHintStep(step, state) : step;
        if (live === null) continue;
        state = game.executeMove(state, live.move);
      }
    }
  }
  return performance.now() - started;
}

it("reports the share of each described game's deals and walks in described code", async () => {
  const session = new Session();
  session.connect();
  await session.post("Profiler.enable");
  await session.post("Profiler.setSamplingInterval", { interval: 200 });

  const lines: string[] = [];
  let profiled = 0;
  for (const id of DESCRIBED.filter((g) => ONLY === null || ONLY.includes(g))) {
    const game = getTsGame(id) as AnyGame;
    const boards: Board[] = [];
    const row: string[] = [id];
    const notes: string[] = [];
    for (const phase of ["deal", "walk"] as const) {
      if (phase === "walk" && typeof game.hint !== "function") {
        row.push("no hint", "", "");
        continue;
      }
      await session.post("Profiler.start");
      const ms = phase === "deal" ? deal(game, boards) : walk(game, boards);
      const { profile } = await session.post("Profiler.stop");
      const s = share(profile.nodes as ProfileNode[]);
      if (s.described > 0) profiled++;
      row.push(`${Math.round(ms)} ms`, pct(s.described, s.samples), bound(s));
      notes.push(`|  | ${phase}: ${top(s, TOP)} | | | | | |`);
    }
    const mine = [`| ${row.join(" | ")} |`, ...notes];
    lines.push(...mine);
    // Vitest holds a passing test's console, so progress goes to a file.
    if (PROGRESS !== null) appendFileSync(PROGRESS, `${mine.join("\n")}\n`);
  }
  session.disconnect();

  // The instrument's known positive: some profile saw described code.
  expect(profiled, "no profile had a described sample").toBeGreaterThan(0);

  if (ONLY !== null) return;
  writeFileSync(
    OUT,
    [
      "# Described code's share of each game's deals and hint walks",
      "",
      "Written by `scripts/checks/deal-profile.test.ts`, which says how to read it.",
      "",
      "| Game | Deals | Described | At most | Walks | Described | At most |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...lines,
      "",
    ].join("\n"),
  );
});
