/**
 * Task 2.2: the stated techniques run as the ladder, against the game's own
 * solver, on dealt boards: the candidates each ends with at every tier cap,
 * cell by cell, and the grade. Writes `results-ladder.txt`.
 */
import { describe, expect, it } from "vitest";
import { searchAnswers } from "./answer-check.ts";
import { adjacentBinding, type Binding, unequalBinding } from "./bindings.ts";
import type { TechniqueJson } from "./description.ts";
import { runLadder } from "./ladder.ts";
import { deal, label, progress, seedsPerParams, writeResult } from "./pilot.ts";

const SEEDS = seedsPerParams(3);

interface Tally {
  boards: number;
  closuresCompared: number;
  closuresEqual: number;
  gradesEqual: number;
  ladderMs: number[];
  /** Per technique, the boards it changed the marks on. */
  fired: Map<string, number>;
  differences: string[];
}

function bitsOf(m: number): string {
  const out: number[] = [];
  for (let v = 0; v < 31; v++) if (m & (1 << v)) out.push(v);
  return out.join("");
}

function compare<P, S>(b: Binding<P, S>, t: Tally): void {
  const own = b.ownLadder;
  if (own === undefined)
    throw new Error(`${b.description.game} has no ladder of its own to compare`);
  for (const params of b.params)
    for (let i = 0; i < SEEDS; i++) {
      const seed = `describe ${i}`;
      const board = deal(b, params, seed);
      if (board === null) break;
      const { state, inst } = board;
      const where = `${label(b, params)} seed "${seed}"`;
      const w = inst.space.names.get("w") as number;
      const top = inst.d.tiers.length - 1;
      t.boards++;
      let stated = top;
      const fired = new Set<string>();
      for (let cap = 0; cap < top; cap++) {
        const t0 = performance.now();
        const mine = runLadder(inst, cap);
        t.ladderMs.push(performance.now() - t0);
        for (const f of mine.firings) fired.add(f.technique);
        const theirs = own(state, cap);
        t.closuresCompared++;
        const cells: string[] = [];
        for (let c = 0; c < mine.marks.masks.length; c++)
          if (mine.marks.masks[c] !== theirs.masks[c])
            cells.push(
              `(${c % w},${Math.floor(c / w)}) stated ${bitsOf(mine.marks.masks[c])} game ${bitsOf(theirs.masks[c])}`,
            );
        if (cells.length === 0) t.closuresEqual++;
        else
          t.differences.push(
            `${where} at ${inst.d.tiers[cap]}: ${cells.length} cells differ: ${cells.slice(0, 4).join("; ")}`,
          );
        if (mine.solved && stated === top) stated = cap;
      }
      for (const f of fired) t.fired.set(f, (t.fired.get(f) ?? 0) + 1);
      // The top tier is the search: a board no deduction finishes, with one
      // answer.
      if (stated === top && searchAnswers(inst, 2).answers.length !== 1) stated = -1;
      const level = own(state, top).level;
      if (level === stated) t.gradesEqual++;
      else
        t.differences.push(
          `${where}: graded ${inst.d.tiers[level] ?? level} by the game, ${inst.d.tiers[stated] ?? stated} by the stated ladder`,
        );
      progress(`${where}: compared`);
    }
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? 0 : s[Math.floor(s.length / 2)];
};

describe("the stated ladder", () => {
  it("ends where each game's own solver ends, at every tier", () => {
    const lines = [`Seeds per params: ${SEEDS}.`, ""];
    const all: string[] = [];
    for (const b of [unequalBinding, adjacentBinding] as Binding<unknown, unknown>[]) {
      const t: Tally = {
        boards: 0,
        closuresCompared: 0,
        closuresEqual: 0,
        gradesEqual: 0,
        ladderMs: [],
        fired: new Map(),
        differences: [],
      };
      compare(b, t);
      lines.push(
        `${b.description.game}: ${t.boards} boards; ${t.closuresEqual} of ${t.closuresCompared} closures equal cell by cell; ` +
          `${t.gradesEqual} of ${t.boards} grades equal; ladder median ${median(t.ladderMs).toFixed(1)} ms, ` +
          `max ${Math.max(...t.ladderMs).toFixed(1)} ms`,
        `  boards each technique changed the marks on: ${[...t.fired].map(([k, n]) => `${k} ${n}`).join(", ")}`,
      );
      for (const d of t.differences) lines.push(`  ${d}`);
      all.push(...t.differences);
    }
    writeResult("results-ladder.txt", `${lines.join("\n")}\n`);
    expect(all).toEqual([]);
  });

  // A technique dropped, made unsound, or narrowed: the comparison must see
  // each.
  type Plant = (techniques: TechniqueJson[]) => TechniqueJson[];
  const planted: [string, Plant][] = [
    [
      "the wing dropped",
      (ts) => ts.filter((t) => !("use" in t && t.use === "latin.wing")),
    ],
    [
      "the sign's bound made strict, which is unsound",
      (ts) =>
        ts.map((t) =>
          "id" in t && t.id === "sign"
            ? { ...t, conclude: t.conclude.replace("d <= d2", "d < d2") }
            : t,
        ),
    ],
    [
      "sets narrowed to pairs",
      (ts) =>
        ts.map((t) =>
          "use" in t && t.use === "latin.set"
            ? {
                id: "pairs",
                tier: t.tier,
                for: "u in units, open = {c in cells(u) where not known(c)}, S in subsets(open, 2) where |S| < |open|, D = set(d over c in S, d in cand(c)) where |D| = |S|",
                conclude: "forall c in open - S, d in D: strike(c, d)",
              }
            : t,
        ),
    ],
  ];
  for (const [name, plant] of planted)
    it(`sees a planted defect in Unequal: ${name}`, () => {
      const json = structuredClone(unequalBinding.description);
      json.techniques = plant(json.techniques ?? []);
      const t: Tally = {
        boards: 0,
        closuresCompared: 0,
        closuresEqual: 0,
        gradesEqual: 0,
        ladderMs: [],
        fired: new Map(),
        differences: [],
      };
      compare({ ...unequalBinding, description: json } as Binding<unknown, unknown>, t);
      expect(t.differences.length).toBeGreaterThan(0);
    });
});
