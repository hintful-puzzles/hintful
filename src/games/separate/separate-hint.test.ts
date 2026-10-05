/**
 * Separate's explained hint, beyond what the cross-game guards walk.
 *
 * `hint-resume.test.ts` follows the hint's own moves from a fresh board. A
 * player marks edges in any order, and `only-way` is not monotone in what is
 * known: a region that grows can gain choices, so a board with more correct
 * marks could in principle leave the ladder with less to say. So the first
 * block starts from random *correct* partial boards (a random share of the
 * solution's own edges revealed) and holds the hint to finishing every one.
 * Measured when written: 909 such boards across all four presets, no stall;
 * this is a slice of that corpus sized for the gate.
 */
import { describe, expect, it } from "vitest";
import { BORDER, DISABLED, DX, DY, FLIP } from "../../engine/border-grid.ts";
import { type BorderHint, EDGE } from "../../engine/border-grid-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newSeparateDesc } from "./generator.ts";
import { type SeparateRung, separateGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import { separateRecordingPass, solveToBorders } from "./solver.ts";
import {
  executeMove,
  newState,
  type SeparateMove,
  type SeparateParams,
  type SeparateState,
} from "./state.ts";

const PRESETS: SeparateParams[] = [
  { w: 4, h: 4, k: 4 },
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 6, k: 4 },
  { w: 6, h: 6, k: 6 },
];

const hintOf = (s: SeparateState) => {
  const r = separateGame.hint?.(s);
  if (!r) throw new Error("separate declares no hint");
  return r;
};

/** Reveal each interior edge of the solution with probability `share`. */
function partialBoard(
  p: SeparateParams,
  fresh: SeparateState,
  sol: Uint8Array,
  share: number,
  rng: ReturnType<typeof randomNew>,
): SeparateState {
  let st = fresh;
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++)
      for (const dir of [1, 2]) {
        const x2 = x + DX[dir];
        const y2 = y + DY[dir];
        if (x2 >= p.w || y2 >= p.h) continue;
        if (randomUpto(rng, 1000) >= share * 1000) continue;
        const wall = (sol[y * p.w + x] & BORDER(dir)) !== 0;
        const on = (d: number): number => (wall ? BORDER(d) : DISABLED(BORDER(d)));
        st = executeMove(st, {
          type: "edges",
          edits: [
            { x, y, flag: on(dir) },
            { x: x2, y: y2, flag: on(FLIP(dir)) },
          ],
        });
      }
  return st;
}

const isSolved = (s: SeparateState): boolean => separateGame.status(s) === "solved";

type Step = HintStep<SeparateMove, BorderHint, SeparateRung>;

/** Every step given, walking to solved one recomputed hint at a time. */
function walk(start: SeparateState): { spoken: Step[]; solved: boolean } {
  const spoken: Step[] = [];
  let st = start;
  for (let guard = 0; guard < 400 && !isSolved(st); guard++) {
    const r = hintOf(st);
    if (!r.ok) return { spoken, solved: false };
    spoken.push(...r.steps);
    st = executeMove(st, r.steps[0].move);
  }
  return { spoken, solved: isSolved(st) };
}

/** The corpus: per preset, two boards, each walked from fresh and from four
 * random correct partial boards. */
const corpus = PRESETS.flatMap((p) =>
  ["a", "b"].map((seed) => {
    const rng = randomNew(`separate-hint-${p.w}x${p.h}n${p.k}-${seed}`);
    const fresh = newState(p, newSeparateDesc(p, rng).desc);
    const sol = solveToBorders(p, fresh.letters) as Uint8Array;
    const starts = [fresh];
    for (const share of [0.2, 0.4, 0.6, 0.8])
      starts.push(partialBoard(p, fresh, sol, share, rng));
    return { label: `${p.w}x${p.h}n${p.k} ${seed}`, starts };
  }),
);

/** How many squares a step stripes, how many it outlines, how many edges it
 * rings. */
const marked = (s: Step) => {
  const m = stepMarks(s);
  return {
    striped: m.of("stripes", CELL).length,
    outlined: m.of("outline", CELL).length,
    edges: m.of("ring", EDGE).length,
  };
};
/** A firing's first leg, of `rung`. */
const opens = (s: Step, rung: SeparateRung): boolean =>
  s.rung === rung && !s.continuesPrevious;

/** Each sentence arm, keyed by what its step is and marks. */
const ARMS = {
  "two-letters": (s) => opens(s, "sharedLetter") && marked(s).striped === 0,
  "region-and-letter": (s) =>
    opens(s, "sharedLetter") && marked(s).striped > 0 && marked(s).outlined === 1,
  "two-regions": (s) =>
    opens(s, "sharedLetter") && marked(s).striped > 0 && marked(s).outlined > 1,
  "walled-apart-one": (s) => opens(s, "walledApart") && marked(s).edges === 1,
  "walled-apart-many": (s) => opens(s, "walledApart") && marked(s).edges > 1,
  "only-way-letter": (s) => opens(s, "onlyWay") && marked(s).striped === 1,
  "only-way-region": (s) => opens(s, "onlyWay") && marked(s).striped > 1,
  "shared-letter-many": (s) => opens(s, "sharedLetter") && marked(s).edges > 1,
  "continue-wall": (s) => s.continuesPrevious === true && s.highlights?.kind === "wall",
  "continue-open": (s) =>
    s.continuesPrevious === true && s.highlights?.kind === "nowall",
} as const satisfies Record<string, (s: Step) => boolean>;

/** Arms this corpus does not reach, each with its reason; the pinned test
 * below reaches it directly. */
const UNREACHED: Partial<Record<keyof typeof ARMS, string>> = {
  "continue-open":
    "an only-way firing sets two edges only when its region wraps round the " +
    "square it must take; none in a 909-board census reached it",
};

describe("separate hint from the player's own positions", () => {
  const reached = new Set<string>();
  let walked = 0;

  for (const { label, starts } of corpus) {
    it(`${label}: finishes from fresh and from correct partial boards`, () => {
      for (const [n, start] of starts.entries()) {
        if (isSolved(start)) continue;
        const { spoken, solved } = walk(start);
        walked++;
        expect(solved, `${label} start ${n}: the hint stopped short`).toBe(true);
        for (const s of spoken) {
          const arms = Object.entries(ARMS).filter(([, is]) => is(s));
          expect(arms.length, `no arm speaks "${s.explanation}"`).toBeGreaterThan(0);
          for (const [arm] of arms) reached.add(arm);
        }
      }
    });
  }

  it("walked a real corpus and heard every arm it claims to", () => {
    expect(walked).toBeGreaterThanOrEqual(corpus.length * 4);
    const missing = Object.keys(ARMS).filter((a) => !reached.has(a));
    expect(missing.sort()).toEqual(Object.keys(UNREACHED).sort());
  });
});

describe("the ledgered arm, reached directly", () => {
  it("an only-way region wrapped round its square opens both edges in one firing", () => {
    // 4x2, letters ABBA / CDDC. The player has joined the L (0,0),(1,0),(0,1)
    // and walled (1,0)|(2,0), so the L's one square left is the notch (1,1),
    // which it touches on two edges.
    const letters = Uint8Array.from("ABBACDDC", (c) => c.charCodeAt(0) - 65);
    const p = { w: 4, h: 2, k: 4 };
    let st = newState(p, "ABBACDDC");
    const mark = (x: number, y: number, dir: number, wall: boolean): void => {
      const on = (d: number): number => (wall ? BORDER(d) : DISABLED(BORDER(d)));
      st = executeMove(st, {
        type: "edges",
        edits: [
          { x, y, flag: on(dir) },
          { x: x + DX[dir], y: y + DY[dir], flag: on(FLIP(dir)) },
        ],
      });
    };
    mark(0, 0, 1, false);
    mark(0, 0, 2, false);
    mark(1, 0, 1, true);
    const { next } = separateRecordingPass(p, letters, st.borders, stepBudget("test"));
    const firings = [];
    for (let f = next(); f; f = next()) firings.push(f);
    const onlyWay = firings.find((f) => f.kind === "onlyWay");
    expect(onlyWay?.edges.map((e) => e.kind)).toEqual(["nowall", "nowall"]);
  });
});

describe("separate hint mechanics", () => {
  const p = PRESETS[1];
  const fresh = newState(p, newSeparateDesc(p, randomNew("separate-hint-track")).desc);

  it("counts the hinted click as done, and the other button as off", () => {
    const r = hintOf(fresh);
    if (!r.ok) throw new Error(r.error);
    const step = r.steps[0];
    const hl = step.highlights as BorderHint;
    const bit = hl.kind === "wall" ? BORDER(hl.dir) : DISABLED(BORDER(hl.dir));
    const other = hl.kind === "wall" ? DISABLED(BORDER(hl.dir)) : BORDER(hl.dir);
    const click = (flag: number): SeparateMove => ({
      type: "edges",
      edits: [{ x: hl.x, y: hl.y, flag }],
    });
    expect(separateGame.hintKeepTrack?.(click(bit), step, fresh)).toBe("completed");
    expect(separateGame.hintKeepTrack?.(click(other), step, fresh)).toBe("off");
  });

  it("flags a wrong edge, so the midend refuses a hint", () => {
    const sol = solveToBorders(p, fresh.letters) as Uint8Array;
    // Wall off the first interior edge the solution leaves open.
    const i = [...Array(p.w * p.h).keys()].find(
      (j) => j % p.w < p.w - 1 && !(sol[j] & BORDER(1)),
    ) as number;
    const x = i % p.w;
    const y = (i - x) / p.w;
    const wrong = executeMove(fresh, {
      type: "edges",
      edits: [
        { x, y, flag: BORDER(1) },
        { x: x + 1, y, flag: BORDER(3) },
      ],
    });
    expect(separateGame.findMistakes?.(wrong).length ?? 0).toBeGreaterThan(0);
  });
});

/** A step that names two regions: a two-region or region-and-letter step. */
const namesTwo = (s: HintStep<unknown>): boolean => {
  const m = stepMarks(s);
  return m.of("stripes", CELL).length > 0 && m.of("outline", CELL).length > 0;
};

const pinned = describeHintPins({
  game: separateGame,
  params: [PRESETS[1]],
  kinds: { namesTwo },
  pins: {
    /** Held on 119 of 437 positions walked. */
    namesTwo: {
      id: "5x5n5:ECBDAEEAEABECDCADCBDDCABB",
      moves:
        '[{"type":"edges","edits":[{"x":0,"y":0,"flag":4},{"x":0,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":4,"y":0,"flag":4},{"x":4,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":2},{"x":1,"y":1,"flag":8}]},{"type":"edges","edits":[{"x":1,"y":1,"flag":4},{"x":1,"y":2,"flag":1}]},{"type":"edges","edits":[{"x":2,"y":2,"flag":4},{"x":2,"y":3,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":3,"flag":4},{"x":3,"y":4,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":4,"flag":2},{"x":4,"y":4,"flag":8}]},{"type":"edges","edits":[{"x":0,"y":0,"flag":32},{"x":1,"y":0,"flag":128}]}]',
    },
    /** Held on 418 of 437 positions walked. */
    sharedLetter: "5x5n5:CCADEEEEEBDBBDCAAAABBDDCC",
    /** Held on 405 of 437 positions walked. */
    walledApart: {
      id: "5x5n5:EECBAABCBDABDCEACDEACBDED",
      moves:
        '[{"type":"edges","edits":[{"x":0,"y":0,"flag":2},{"x":1,"y":0,"flag":8}]},{"type":"edges","edits":[{"x":2,"y":0,"flag":4},{"x":2,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":0,"flag":4},{"x":3,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":4},{"x":0,"y":2,"flag":1}]},{"type":"edges","edits":[{"x":1,"y":1,"flag":4},{"x":1,"y":2,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":2,"flag":4},{"x":0,"y":3,"flag":1}]},{"type":"edges","edits":[{"x":2,"y":2,"flag":4},{"x":2,"y":3,"flag":1}]},{"type":"edges","edits":[{"x":2,"y":3,"flag":4},{"x":2,"y":4,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":3,"flag":4},{"x":3,"y":4,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":0,"flag":64},{"x":0,"y":1,"flag":16}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":32},{"x":1,"y":1,"flag":128}]}]',
    },
    /** Held on 420 of 437 positions walked. */
    onlyWay: {
      id: "5x5n5:ECBDAEEAEABECDCADCBDDCABB",
      moves:
        '[{"type":"edges","edits":[{"x":0,"y":0,"flag":4},{"x":0,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":4,"y":0,"flag":4},{"x":4,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":2},{"x":1,"y":1,"flag":8}]},{"type":"edges","edits":[{"x":1,"y":1,"flag":4},{"x":1,"y":2,"flag":1}]},{"type":"edges","edits":[{"x":2,"y":2,"flag":4},{"x":2,"y":3,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":3,"flag":4},{"x":3,"y":4,"flag":1}]},{"type":"edges","edits":[{"x":3,"y":4,"flag":2},{"x":4,"y":4,"flag":8}]}]',
    },
  },
});

describe("separate hint frame", () => {
  it("paints the edges blue, hatches one region and outlines the other", () => {
    const { id, moves, step } = pinned("namesTwo");
    const result = renderScenario({ game: separateGame, id, moves, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);

    const ops = result.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    const hatched = new Set(opsOfKind(ops, "hatch").map((h) => `${h.x},${h.y}`));
    expect(hatched.size).toBe(stepMarks(result.hint).of("stripes", CELL).length);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    // The letters the deduction reads are still drawn over the marks.
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(result.hint?.explanation).toMatch(/striped/);
    expect(result.hint?.explanation).toMatch(/outlined/);
    expect(ops).toMatchSnapshot();
  });
});
