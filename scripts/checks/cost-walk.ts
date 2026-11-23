/**
 * The work `npm run compare-cost` counts (`scripts/compare-cost.ts`), one run
 * a process, in whichever tree the command copied it into. Not run alone: it
 * is bundled with the games it counts (`cost.vite.config.mts`), which have
 * registered by the time it runs.
 *
 * `COST_KIND` says which run:
 *
 * - `list`: deal the boards of `COST_GAMES` and write their IDs to `COST_OUT`;
 * - `none`: do nothing, the start-up the others are counted net of;
 * - `walk`: load the boards of `COST_GAME` in `COST_LIST` and walk each by
 *   its hint to the end;
 * - `deal`: deal the params of those boards, as many times each as there are
 *   boards of them.
 *
 * It writes what it saw to `COST_OUT`. Only the engine's oldest entry points
 * are read, so a baseline from before the counter it reports still runs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import type { Game } from "../../src/engine/contract/game.ts";
import { getTsGame } from "../../src/engine/midend/registry.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import * as fixpoint from "../../src/engine/solve/deduction-fixpoint.ts";
import { leafPresets } from "../../src/engine/testing/presets.ts";

import type { CostRun } from "../compare-cost.ts";

// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
type AnyGame = Game<any, any, any, any, any, any>;

const env = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) throw new Error(`cost-walk: ${name} is not set`);
  return value;
};

function load(id: string): AnyGame {
  const game = getTsGame(id);
  if (game === null) throw new Error(`cost-walk: "${id}" is not in the bundle`);
  return game;
}

/** The squares a board has, read off its encoded params, which every game
 * begins with its size as upstream's IDs do: `WxH`, or one side `N` of a
 * square (Star Battle's). A params record names its fields as each game
 * chose, and a hand-written game's differ from its born one's. */
function area(encoded: string): number | null {
  const size = /^(\d+)(?:x(\d+))?/.exec(encoded);
  if (size === null) return null;
  const w = Number(size[1]);
  return w * Number(size[2] ?? w);
}

const BOARDS_A_PRESET = 4;
const MAX_AREA = 100;

function list(): CostRun {
  const boards: Record<string, string[]> = {};
  for (const id of env("COST_GAMES").split(",")) {
    const game = load(id);
    const ids: string[] = [];
    for (const { params } of leafPresets(game)) {
      const encoded = game.encodeParams(params, true);
      const a = area(encoded);
      if (a === null)
        throw new Error(`cost-walk: ${id}'s params ${encoded} give no size`);
      if (a > MAX_AREA) continue;
      for (let k = 0; k < BOARDS_A_PRESET; k++) {
        const { desc } = game.newDesc(
          params,
          randomNew(`compare-cost ${encoded} ${k}`),
        );
        ids.push(`${encoded}:${desc}`);
      }
    }
    boards[id] = ids;
  }
  return { boards };
}

function run(kind: string): CostRun {
  if (kind === "none") return {};
  const game = load(env("COST_GAME"));
  const ids = JSON.parse(readFileSync(env("COST_LIST"), "utf8")) as string[];
  const boards = ids.map((gameId) => {
    const colon = gameId.indexOf(":");
    return {
      gameId,
      params: game.decodeParams(gameId.slice(0, colon)),
      desc: gameId.slice(colon + 1),
    };
  });
  if (kind === "deal") {
    let k = 0;
    for (const { params } of boards) game.newDesc(params, randomNew(`deal ${k++}`));
    return {};
  }
  if (kind !== "walk")
    throw new Error(`cost-walk: COST_KIND "${kind}" is none of list, none, walk, deal`);
  const tries = "techniqueTries" in fixpoint ? fixpoint.techniqueTries : null;
  const refused: Record<string, string> = {};
  const unsolved: string[] = [];
  let steps = 0;
  const triesBefore = tries?.count ?? 0;
  for (const { gameId, params, desc } of boards) {
    let state: unknown;
    try {
      state = game.newState(params, desc);
    } catch (e) {
      refused[gameId] = e instanceof Error ? e.message : String(e);
      continue;
    }
    // A plan that never ends the board is cut off, as a player would be.
    for (let ask = 0; ask < 10_000 && game.status(state) !== "solved"; ask++) {
      const plan = game.hint.plan(state);
      if (!plan.ok || plan.steps.length === 0) break;
      for (const step of plan.steps) {
        state = game.executeMove(state, step.move);
        steps++;
      }
    }
    if (game.status(state) !== "solved") unsolved.push(gameId);
  }
  return {
    refused,
    steps,
    tries: tries === null ? null : tries.count - triesBefore,
    unsolved,
  };
}

const kind = env("COST_KIND");
writeFileSync(env("COST_OUT"), JSON.stringify(kind === "list" ? list() : run(kind)));
