/**
 * Solo's compiled ladder against its hand-written one, on deals and hint
 * walks of every variation: with `COMPARE.on`, every solve not made inside
 * another runs both, the hand-written one on a copy, and tallies where they
 * differ in the grade on either scale, the grid, the cube or the records.
 * `openspec/changes/describe-solo/tasks.md` 2.3.
 */
import { expect, it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import { COMPARE } from "../../src/games/solo/solver.ts";
import {
  DIFF_BLOCK,
  DIFF_EXTREME,
  DIFF_INTERSECT,
  DIFF_RECURSIVE,
  DIFF_SET,
  DIFF_SIMPLE,
  type SoloParams,
  SYMM_NONE,
} from "../../src/games/solo/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 2);
const STEPS = 400;

function presets(): SoloParams[] {
  const out: SoloParams[] = [];
  const walk = (menu: PresetMenu<SoloParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(soloGame));
  return out;
}

it("solo: the compiled ladder against the hand-written one", () => {
  COMPARE.on = true;
  // SOLO_READ_AT_START has the hand-written min/max read each cage as the
  // call found it, as the compiled reading does.
  COMPARE.readAtStart = process.env["SOLO_READ_AT_START"] !== undefined;
  // SOLO_DOMAIN_SUMS has the hand-written sums count only the board's values.
  COMPARE.domainSums = process.env["SOLO_DOMAIN_SUMS"] !== undefined;
  // SOLO_SPLIT_PARTS has it read the cages and the partial cages as rungs of
  // their own; SOLO_ONE_PLACEMENT stops its killer placements at the first.
  COMPARE.splitParts = process.env["SOLO_SPLIT_PARTS"] !== undefined;
  COMPARE.onePlacement = process.env["SOLO_ONE_PLACEMENT"] !== undefined;
  // SOLO_FRESH_CAGES has its region rule read a cage's cells filled in its
  // own pass as filled.
  COMPARE.freshCages = process.env["SOLO_FRESH_CAGES"] !== undefined;
  // SOLO_ONE_AT_A_TIME has the compiled sudoku techniques stop at their first
  // firing on the solve path too.
  COMPARE.oneAtATime = process.env["SOLO_ONE_AT_A_TIME"] !== undefined;
  COMPARE.compared = 0;
  COMPARE.mismatches.length = 0;
  COMPARE.reasons.clear();
  const g = soloGame;
  const base = g.defaultParams();
  let boards = 0;
  let hints = 0;
  const deals: string[] = [];
  // The walk's steps by rung, so a zero is seen to cover Solo's own.
  const rungs = new Map<string, number>();
  const tiers = [
    DIFF_BLOCK,
    DIFF_SIMPLE,
    DIFF_INTERSECT,
    DIFF_SET,
    DIFF_EXTREME,
    DIFF_RECURSIVE,
  ];
  const shapes: Partial<SoloParams>[] = [
    { c: 2, r: 2 },
    { c: 2, r: 3 },
    { c: 3, r: 3 },
    { c: 5, r: 1 },
    { c: 6, r: 1 },
    { c: 9, r: 1 },
    { c: 2, r: 2, xtype: true },
    { c: 2, r: 3, xtype: true },
    { c: 3, r: 3, xtype: true },
    { c: 7, r: 1, xtype: true },
    { c: 2, r: 2, killer: true, symm: SYMM_NONE },
    { c: 2, r: 3, killer: true, symm: SYMM_NONE },
    { c: 3, r: 3, killer: true, symm: SYMM_NONE },
    { c: 6, r: 1, killer: true, symm: SYMM_NONE },
    { c: 3, r: 3, killer: true, xtype: true, symm: SYMM_NONE },
  ];
  const params: SoloParams[] = [
    base,
    ...presets(),
    ...shapes.flatMap((shape) => tiers.map((diff) => ({ ...base, ...shape, diff }))),
  ];
  const only = process.env["ONLY"];
  const seen = new Set<string>();
  try {
    for (const p of params) {
      const name = g.encodeParams(p, true);
      if (seen.has(name) || (only !== undefined && name !== only)) continue;
      seen.add(name);
      if (g.validateParams?.(p, true)) continue;
      for (let s = 0; s < SEEDS; s++) {
        let desc: string;
        try {
          desc = g.newDesc(p, randomNew(`check solo ${s}`)).desc;
        } catch (e) {
          if (!(e instanceof RetryLimitExceeded)) throw e;
          progress(`${name}: the generator gives up`);
          break;
        }
        // What a player is dealt, by each ladder alone.
        COMPARE.on = false;
        COMPARE.handWritten = true;
        const theirs = g.newDesc(p, randomNew(`check solo ${s}`)).desc;
        COMPARE.handWritten = false;
        COMPARE.on = true;
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
    COMPARE.readAtStart = false;
    COMPARE.domainSums = false;
    COMPARE.splitParts = false;
    COMPARE.onePlacement = false;
    COMPARE.freshCages = false;
    COMPARE.oneAtATime = false;
  }
  progress(
    `solo: ${boards} boards, ${hints} hint steps, ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
  );
  progress(`steps: ${[...rungs].sort().join(" ")}`);
  progress(`records: ${[...COMPARE.reasons].sort().join(" ")}`);
  const byWhat = new Map<string, number>();
  for (const m of COMPARE.mismatches) {
    const k = m.what.join("+");
    byWhat.set(k, (byWhat.get(k) ?? 0) + 1);
  }
  progress(`differ by: ${[...byWhat].sort().join(" ")}`);
  // A grade's difference by the verdicts it came with.
  const byVerdict = new Map<string, number>();
  for (const m of COMPARE.mismatches) {
    if (m.what.join() === "records") continue;
    const [a, b] = [m.theirs, m.ours] as { diff: number; kdiff: number }[];
    const k = `${a.diff}/${a.kdiff}->${b.diff}/${b.kdiff}`;
    byVerdict.set(k, (byVerdict.get(k) ?? 0) + 1);
  }
  progress(`grades (diff/kdiff): ${[...byVerdict].sort().join(" ")}`);
  progress(`deals differ: ${deals.length} ${deals.join(", ")}`);
  // A difference beyond the records first: one in what a solve concludes.
  const beyond = COMPARE.mismatches.filter((m) => m.what.join() !== "records");
  progress(JSON.stringify([...beyond, ...COMPARE.mismatches].slice(0, 4), null, 1));
  expect(COMPARE.mismatches).toEqual([]);
}, 7_200_000);
