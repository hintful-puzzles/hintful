/**
 * Salad's compiled ladder against its hand-written one, on deals and hint
 * walks of both rulesets: with `COMPARE.on`, every solve runs both, the
 * hand-written one on a copy, and tallies where they differ in the grade,
 * the grid, the cube or the records.
 * `openspec/changes/describe-salad/tasks.md` 2.4.
 */
import { expect, it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { COMPARE } from "../../src/games/salad/solver.ts";
import {
  DIFF_EASY,
  DIFF_HARD,
  GAMEMODE_LETTERS,
  GAMEMODE_NUMBERS,
  type SaladParams,
} from "../../src/games/salad/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 3);
const STEPS = 400;

function presets(): SaladParams[] {
  const out: SaladParams[] = [];
  const walk = (menu: PresetMenu<SaladParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(saladGame));
  return out;
}

it("salad: the compiled ladder against the hand-written one", () => {
  COMPARE.compared = 0;
  COMPARE.mismatches.length = 0;
  COMPARE.reasons.clear();
  const g = saladGame;
  let boards = 0;
  let hints = 0;
  const deals: string[] = [];
  // The walk's steps by rung, so a zero is seen to cover Salad's own.
  const rungs = new Map<string, number>();
  // Each shape with its empty square once a line and more than once, and
  // two symbols, where Normal deals in time (a Numbers board of two takes
  // most of a minute).
  const shapes: [number, number][] = [
    [4, 2],
    [4, 3],
    [5, 2],
    [5, 3],
    [5, 4],
    [6, 3],
    [6, 4],
    [7, 4],
    [8, 5],
  ];
  const params: SaladParams[] = [
    g.defaultParams(),
    ...presets(),
    ...[GAMEMODE_LETTERS, GAMEMODE_NUMBERS].flatMap((mode) =>
      shapes.flatMap(([order, nums]) =>
        [DIFF_EASY, DIFF_HARD]
          .filter(
            (diff) => !(mode === GAMEMODE_NUMBERS && nums === 2 && diff === DIFF_HARD),
          )
          .map((diff) => ({ order, nums, mode, diff })),
      ),
    ),
  ];
  const only = process.env["ONLY"];
  const seen = new Set<string>();
  // SALAD_HAND_SET and SALAD_HAND_FISH have the compiled ladder's set and
  // fish run the engine's own multiplicity code where the empty square
  // repeats, as the hand-written ladder does.
  COMPARE.handSet = process.env["SALAD_HAND_SET"] !== undefined;
  COMPARE.handFish = process.env["SALAD_HAND_FISH"] !== undefined;
  COMPARE.on = true;
  try {
    for (const p of params) {
      const name = g.encodeParams(p, true);
      if (seen.has(name) || (only !== undefined && name !== only)) continue;
      seen.add(name);
      if (g.validateParams?.(p, true)) continue;
      for (let s = 0; s < SEEDS; s++) {
        let desc: string;
        try {
          desc = g.newDesc(p, randomNew(`check salad ${s}`)).desc;
        } catch (e) {
          if (!(e instanceof RetryLimitExceeded)) throw e;
          progress(`${name}: the generator gives up`);
          break;
        }
        // What a player is dealt, by each ladder alone.
        COMPARE.on = false;
        COMPARE.handWritten = true;
        let theirs: string;
        try {
          theirs = g.newDesc(p, randomNew(`check salad ${s}`)).desc;
        } finally {
          COMPARE.handWritten = false;
          COMPARE.on = true;
        }
        if (theirs !== desc) deals.push(`${name} seed ${s}`);
        boards++;
        let state = g.newState(p, desc);
        for (let k = 0; k < STEPS; k++) {
          const h = g.hint?.(state);
          if (!h?.ok || h.steps.length === 0) break;
          const rung = h.steps[0].rung ?? "?";
          rungs.set(rung, (rungs.get(rung) ?? 0) + 1);
          const move = h.steps[0].move;
          if (!move) break;
          const next = g.executeMove(state, move);
          if (next === null) break;
          state = next;
          hints++;
        }
        progress(
          `${name} seed ${s}: ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
        );
      }
    }
  } finally {
    COMPARE.on = false;
    COMPARE.handSet = false;
    COMPARE.handFish = false;
  }
  progress(
    `salad: ${boards} boards, ${hints} hint steps, ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
  );
  progress(`steps: ${[...rungs].sort().join(" ")}`);
  progress(`records: ${[...COMPARE.reasons].sort().join(" ")}`);
  const byWhat = new Map<string, number>();
  for (const m of COMPARE.mismatches) {
    const k = m.what.join("+");
    byWhat.set(k, (byWhat.get(k) ?? 0) + 1);
  }
  progress(`differ by: ${[...byWhat].sort().join(" ")}`);
  // Where a fixpoint differs, the board and cap, and the ladder left with
  // fewer candidates.
  const byWhere = new Map<string, number>();
  for (const m of COMPARE.mismatches) {
    if (m.what.join() === "records") continue;
    const t = m.theirs as { where: string; left: number };
    const o = m.ours as { left: number };
    const k = `${t.where} ${t.left < o.left ? "hand-written" : t.left > o.left ? "compiled" : "even"}`;
    byWhere.set(k, (byWhere.get(k) ?? 0) + 1);
  }
  progress(`fixpoints differ, stronger: ${[...byWhere].sort().join("; ")}`);
  // Where only the records differ, the board and the first records apart.
  const kind = (r: unknown): string =>
    typeof r === "string"
      ? (JSON.parse(r) as { kind: string; reason: { kind: string } }).reason.kind
      : "none";
  const byRecord = new Map<string, number>();
  for (const m of COMPARE.mismatches) {
    if (m.what.join() !== "records") continue;
    const t = m.theirs as { where: string; record: unknown };
    const o = m.ours as { record: unknown };
    const k = `${t.where} ${kind(t.record)}/${kind(o.record)}`;
    byRecord.set(k, (byRecord.get(k) ?? 0) + 1);
  }
  progress(`records apart: ${[...byRecord].sort().join("; ")}`);
  progress(`deals differ: ${deals.length} ${deals.join(", ")}`);
  // A difference beyond the records first: one in what a solve concludes.
  const beyond = COMPARE.mismatches.filter((m) => m.what.join() !== "records");
  const records = COMPARE.mismatches.filter((m) => m.what.join() === "records");
  progress(JSON.stringify([...beyond.slice(0, 2), ...records.slice(0, 2)], null, 1));
  expect([COMPARE.mismatches.length, deals.length]).toEqual([0, 0]);
}, 7_200_000);
