/**
 * Task 2.1: the answer check from each description, against the game's own
 * `status()` and `findMistakes` on dealt boards. Writes `results-answer.txt`
 * and fails on any disagreement, naming it.
 */
import { describe, expect, it } from "vitest";
import { entryMistakes, gridCell } from "../../src/engine/entry-mistakes.ts";
import { brokenRules, searchAnswers } from "./answer-check.ts";
import {
  adjacentBinding,
  type Binding,
  soloBinding,
  towersBinding,
  unequalBinding,
} from "./bindings.ts";
import {
  deal,
  label,
  lcg,
  onlyGames,
  progress,
  seedsPerParams,
  writeResult,
} from "./pilot.ts";

const SEEDS = seedsPerParams(3);
const MUTANTS = 24;
const PLANTED = 6;

interface Tally {
  boards: number;
  unique: number;
  statusCompared: number;
  /** Compared boards the clues alone said were not solved. */
  clueOnly: number;
  mistakesCompared: number;
  searchMs: number[];
  nodes: number[];
  disagreements: string[];
  /** Params the game refuses, or whose generator gives up. */
  undealt: string[];
}

function mistakeKey(ms: readonly unknown[]): string {
  return ms
    .map((m) => {
      const { x, y, kind } = m as { x: number; y: number; kind: string };
      return `${x},${y},${kind}`;
    })
    .sort()
    .join(" ");
}

function check<P, S>(b: Binding<P, S>, t: Tally): void {
  const g = b.game;
  for (const params of b.params)
    for (let i = 0; i < SEEDS; i++) {
      const seed = `describe ${i}`;
      const where = `${label(b, params)} seed "${seed}"`;
      const dealStart = performance.now();
      const board = deal(b, params, seed);
      if (board === null) {
        t.undealt.push(label(b, params));
        break;
      }
      progress(`${where}: dealt in ${(performance.now() - dealStart).toFixed(0)} ms`);
      const { state, inst } = board;
      const w = inst.space.names.get("w") as number;
      const n = inst.space.cells.length;
      t.boards++;

      const solved = g.solve?.(state, state);
      if (solved === undefined || !solved.ok) {
        t.disagreements.push(`${where}: the game found no solution`);
        continue;
      }
      const solution = Array.from(b.entries(g.executeMove(state, solved.move)));

      const t0 = performance.now();
      const found = searchAnswers(inst, 2);
      t.searchMs.push(performance.now() - t0);
      t.nodes.push(found.nodes);
      progress(
        `${where}: searched in ${(performance.now() - t0).toFixed(0)} ms, ${found.nodes} nodes`,
      );
      if (found.answers.length !== 1)
        t.disagreements.push(
          `${where}: the rules give ${found.answers.length} answers${found.undecided ? " (undecided)" : ""}`,
        );
      else if (found.answers[0].join() !== solution.join())
        t.disagreements.push(`${where}: the rules' answer is not the game's`);
      else t.unique++;
      const answer = found.answers[0] ?? solution;

      // status() on the solution and on mutants of it.
      const rnd = lcg(i * 7919 + n);
      const open = [...Array(n).keys()].filter((c) => inst.givens[c] === 0);
      const boards: number[][] = [solution];
      for (let k = 0; k < MUTANTS && open.length > 1; k++) {
        const m = solution.slice();
        const c = open[Math.floor(rnd() * open.length)];
        if (k % 2 === 0) {
          // One value changed.
          const others = inst.domain.filter((v) => v !== m[c]);
          m[c] = others[Math.floor(rnd() * others.length)];
        } else {
          // Two open cells of one row swapped, which keeps every row Latin.
          const row = open.filter(
            (d) => Math.floor(d / w) === Math.floor(c / w) && d !== c,
          );
          if (row.length === 0) continue;
          const d = row[Math.floor(rnd() * row.length)];
          [m[c], m[d]] = [m[d], m[c]];
        }
        boards.push(m);
      }
      // Intercalates: a 2x2 of open cells holding a, b / b, a, swapped. Every
      // line stays Latin, so only a clue can say the board is not solved.
      for (let y1 = 0; y1 < w; y1++)
        for (let y2 = y1 + 1; y2 < w; y2++)
          for (let x1 = 0; x1 < w; x1++)
            for (let x2 = x1 + 1; x2 < w; x2++) {
              const q = [y1 * w + x1, y1 * w + x2, y2 * w + x1, y2 * w + x2];
              if (q.some((c) => inst.givens[c] !== 0)) continue;
              const s = solution;
              if (s[q[0]] !== s[q[3]] || s[q[1]] !== s[q[2]]) continue;
              const m = s.slice();
              [m[q[0]], m[q[1]], m[q[2]], m[q[3]]] = [
                s[q[1]],
                s[q[0]],
                s[q[3]],
                s[q[2]],
              ];
              boards.push(m);
            }
      for (const m of boards) {
        const own = g.status(b.withEntries(state, m));
        const broken = brokenRules(inst, m);
        if (broken.length > 0 && broken.every((r) => / clue \d+$/.test(r)))
          t.clueOnly++;
        t.statusCompared++;
        if ((own === "solved") !== (broken.length === 0))
          t.disagreements.push(
            `${where}: status ${own}, the rules break [${broken.join("; ")}] on ${m.join("")}`,
          );
      }

      // findMistakes on planted entries and notes.
      if (g.findMistakes === undefined) continue;
      for (let k = 0; k < PLANTED; k++) {
        const entry = Array.from(inst.givens);
        const notes = new Array<number>(n).fill(0);
        for (const c of open) {
          const r = rnd();
          if (r < 0.3) entry[c] = inst.domain[Math.floor(rnd() * inst.domain.length)];
          else if (r < 0.6)
            for (const v of inst.domain) if (rnd() < 0.5) notes[c] |= 1 << v;
        }
        const own = mistakeKey(g.findMistakes(b.withEntries(state, entry, notes)));
        const stated = mistakeKey(
          entryMistakes(
            { answer, entry, notes, fixed: (c) => inst.givens[c] !== 0 },
            gridCell(w),
          ),
        );
        t.mistakesCompared++;
        if (own !== stated)
          t.disagreements.push(`${where}: findMistakes [${own}] against [${stated}]`);
      }
    }
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? 0 : s[Math.floor(s.length / 2)];
};

describe("the answer check from the description", () => {
  it("agrees with each game's status() and findMistakes", () => {
    const lines: string[] = [
      `Seeds per params: ${SEEDS}. Mutants per board: ${MUTANTS}. Planted boards: ${PLANTED}.`,
      "",
    ];
    const all: string[] = [];
    const only = onlyGames();
    const games = [
      towersBinding,
      unequalBinding,
      adjacentBinding,
      soloBinding,
    ] as Binding<unknown, unknown>[];
    for (const b of games.filter(
      (g) => only === null || only.includes(g.description.game),
    )) {
      const t: Tally = {
        boards: 0,
        unique: 0,
        statusCompared: 0,
        clueOnly: 0,
        mistakesCompared: 0,
        searchMs: [],
        nodes: [],
        disagreements: [],
        undealt: [],
      };
      check(b, t);
      if (t.undealt.length > 0)
        lines.push(`${b.description.game}: not dealt: ${t.undealt.join(", ")}`);
      lines.push(
        `${b.description.game}: ${t.boards} boards, ${t.unique} with one answer by the rules and it the game's; ` +
          `status compared on ${t.statusCompared} full boards (${t.clueOnly} broken by clues alone), ` +
          `findMistakes on ${t.mistakesCompared}; ` +
          `search median ${median(t.searchMs).toFixed(1)} ms, max ${Math.max(...t.searchMs).toFixed(1)} ms, ` +
          `median ${median(t.nodes)} nodes; ${t.disagreements.length} disagreements`,
      );
      for (const d of t.disagreements) lines.push(`  ${d}`);
      all.push(...t.disagreements);
    }
    writeResult(
      only === null ? "results-answer.txt" : `results-answer-${only.join("-")}.txt`,
      `${lines.join("\n")}\n`,
    );
    expect(all).toEqual([]);
  });

  // Each clue's meaning planted wrong, as a description could drift from its
  // game: the comparison must see each one.
  const planted: [string, Binding<unknown, unknown>, string, string][] = [
    [
      "Towers, a clue read as at least",
      towersBinding as Binding<unknown, unknown>,
      "sees",
      "visible(at) >= v",
    ],
    [
      "Unequal, the sign read backwards",
      unequalBinding as Binding<unknown, unknown>,
      "greater",
      "value(v) < value(other(at, v))",
    ],
    [
      "Adjacent, a missing bar read as nothing",
      adjacentBinding as Binding<unknown, unknown>,
      "bar",
      "v = 1 implies abs(value(end1(at)) - value(end2(at))) = 1",
    ],
  ];
  for (const [name, b, kind, means] of planted)
    it(`sees a planted defect: ${name}`, () => {
      const json = structuredClone(b.description);
      const clue = json.clues?.[kind];
      if (clue === undefined) throw new Error(`no clue ${kind}`);
      clue.means = means;
      const t: Tally = {
        boards: 0,
        unique: 0,
        statusCompared: 0,
        clueOnly: 0,
        mistakesCompared: 0,
        searchMs: [],
        nodes: [],
        disagreements: [],
        undealt: [],
      };
      // The middle size only. On 4x4 Adjacent, two boards, the bars alone
      // decide every mutant and the answer, so that defect goes unseen there.
      const n = b.params.length / 3;
      const small = b.params.filter((_, i) => i >= n && i < 2 * n);
      check({ ...b, description: json, params: small }, t);
      expect(t.disagreements.length).toBeGreaterThan(0);
    });
});
