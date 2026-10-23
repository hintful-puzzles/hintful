/**
 * What stands in for an oracle: every board dealt has exactly one answer,
 * counted by a search that shares no code with the ladder, needs exactly the
 * tier it was asked at, and has no path the generator promises not to lay;
 * and every rung of the ladder fires on boards the generator deals
 * (docs/testing.md § "What a new game ships").
 */
import { describe, expect, it } from "vitest";
import { LINE } from "../../engine/line-drawing.ts";
import { randomNew } from "../../engine/random/index.ts";
import { squareEdges } from "../../engine/square-edges.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { countAnswers } from "./count-answers.ts";
import { newPathDesc } from "./generator.ts";
import { pathGame } from "./index.ts";
import { answerOf, PATH_RUNGS, PathBoard, solvePath } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  encodeParams,
  executeMove,
  MODE_PATH,
  MODE_ZIP,
  NO_END,
  newState,
  type PathParams,
  presets,
} from "./state.ts";

/** Every preset, a small board, and one that is not square. */
const SHAPES: PathParams[] = [
  ...(presets().submenu ?? []).flatMap((leaf) => (leaf.params ? [leaf.params] : [])),
  { w: 4, h: 4, diff: DIFF_EASY, mode: MODE_PATH },
  { w: 7, h: 5, diff: DIFF_NORMAL, mode: MODE_PATH },
  { w: 5, h: 5, diff: DIFF_NORMAL, mode: MODE_ZIP },
  { w: 6, h: 5, diff: DIFF_EASY, mode: MODE_ZIP },
];

describeDealtTiers(
  pathGame,
  SHAPES.map((p) => encodeParams(p, true)),
);

// The cells `absentTier` in `state.ts` refuses, with its proof.
describeAbsentTiers(pathGame, [
  "3x3dn",
  "3x4dn",
  "5x3dn",
  "3x3dt",
  "4x3dt",
  "4x4dt",
  "3x5dt",
  "5x4dt",
]);

const SEEDS = ["a", "b", "c"];

const dealt = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${encodeParams(p, true)} ${seed}`;
    return { label, p, desc: newPathDesc(p, randomNew(`ladder ${label}`)).desc };
  }),
);

describeLadderCensus<PathParams & { desc: string }>({
  game: "path",
  rungs: PATH_RUNGS,
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY],
  cases: dealt.map(({ label, p, desc }) => ({ label, board: () => ({ ...p, desc }) })),
  solve: (p, cap, firings) => {
    const s = newState(p, p.desc);
    return solvePath(new PathBoard(s, s.edges), cap, firings);
  },
});

/** A Zip board's brute force walks every path through its squares, which
 * past this many takes seconds. */
const ZIP_COUNTED = 36;

describe("path dealt boards", () => {
  it.each(
    dealt.filter(({ p }) => p.w * p.h <= (p.mode === MODE_ZIP ? ZIP_COUNTED : 49)),
  )("$label has exactly one answer", ({ p, desc }) => {
    expect(countAnswers(newState(p, desc))).toBe(1);
  });

  it.each(
    dealt.filter(({ p }) => p.mode === MODE_PATH),
  )("$label has no straight path of four squares or more", ({ p, desc }) => {
    const start = newState(p, desc);
    const answer = answerOf(start);
    if (answer === null) throw new Error("the ladder finishes every dealt board");
    const solved = executeMove(start, { kind: "solve", edges: answer });
    const g = squareEdges(p.w, p.h);
    for (let i = 0; i < g.cells; i++) {
      if (solved.ends[i] === NO_END) continue;
      // Walk the path from this end, and see whether it ever turns.
      const xs = new Set<number>();
      const ys = new Set<number>();
      let length = 0;
      for (let at = i, prev = -1; at >= 0; ) {
        xs.add(at % p.w);
        ys.add(Math.floor(at / p.w));
        length++;
        let next = -1;
        for (let k = 0; k < 4; k++) {
          const e = g.around[at * 4 + k];
          if (e < 0 || solved.edges[e] !== LINE) continue;
          const j = g.a[e] === at ? g.b[e] : g.a[e];
          if (j !== prev) next = j;
        }
        prev = at;
        at = next;
      }
      expect(
        length >= 4 && (xs.size === 1 || ys.size === 1),
        `the path from ${i}`,
      ).toBe(false);
    }
  });
});
