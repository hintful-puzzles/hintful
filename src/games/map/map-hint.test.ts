/**
 * Map's hint: every arm it can speak, pinned to a board it speaks it on; every
 * sentence's claim held to the board it is spoken over; the chain's numbers on
 * the canvas; and the tiers kept to their own rungs.
 */

import { describe, expect, it } from "vitest";
import { HINT_EVIDENCE } from "../../engine/color/palette.ts";
import { FIX_MISTAKES_FIRST } from "../../engine/hint-refusal.ts";
import { randomNew } from "../../engine/random/index.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { MapHint, MapHintStep } from "./hint.ts";
import { hintKeepTrack, refreshHintStep } from "./hint.ts";
import { mapGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import { neighbors } from "./solver.ts";
import type { MapMove, MapParams, MapState } from "./state.ts";

/** Every arm the hint speaks, keyed so adding one breaks compilation until it is
 * pinned here or ledgered below. */
const ARMS = {
  touches: /^This region touches /,
  lastDot: /^The only dot in this region/,
  deadDots: /^Its other dots match/,
  pairPlace: /^The outlined pair .* and must be \w+\.$/,
  pairStrike: /^The outlined pair .* must go\.$/,
  pairMark: /^The outlined pair .*: dot [\w ,]+\.$/,
  chainPlace: /^Region 1 is .* and must be \w+\.$/,
  chainStrike: /^Region 1 is .* must go\.$/,
  chainMark: /^Region 1 is .*: dot [\w ,]+\.$/,
  chainDot: /^Region \d+ touches /,
  chainTrim: /^Region \d+'s other dots/,
} satisfies Record<string, RegExp>;
type Arm = keyof typeof ARMS;

/**
 * The boards each arm fires on from a fresh board, pinned as the desc the rung
 * reads and never as a seed: a seed reaches a rung only through the generator,
 * which is free to stop producing the board while a census still reads health.
 * Found by a sweep of 240 boards, 40 per preset of the two sizes at the three
 * teachable tiers, which counted (firings on boards): touches 7178 on 240,
 * deadDots 156 on 87, pairPlace 466 on 156, pairMark 74 on 50, chainPlace 44 on
 * 37, chainStrike 5 on 5, chainMark 99 on 69.
 */
const CHAIN_BOARD =
  "15x20n30dh:echdkaebkheaaaaaiacaaabcbbabaacbhadbcacacegabaababacbaacbbdbachadaacjabbcaababgaaaaaaaaabdabbcabhadakabahccbdbecaahaibdbbbcdabbbacadeaaceccbbaaabbcacbdbdadabacfaaaaaaaalaaaadaaecabbadaaaibcccdcaadcdfdacza,a213c0a2e0a21d2b1a20";

const PINNED: Partial<Record<Arm, string>> = {
  touches:
    "15x20n30de:ddbaganckacadacaaaeacaaaaaabdacacabacacagcfaeabaabaaaahabaaaccbaaabaacfaaccacdabdaabdabdaaaadacaaaaafdbaabdahbacbbbabbhaebaceaabcbabfaabdaacebabacfagaaafeabdeacdabcajhegaabbbeceabceacceaaaabaddafaaaacgaababmbbbabdaeacaabcaca,b02c3232a2g0312a203a2",
  deadDots:
    "15x20n30dn:lacbaacbehaabcbacciaaadbfahadacadaaccffahfhaaaaadaaabaaaahabcaaaaaaabbbbcbfbcbabaafaacdaebfaaaaccaeaaabaabgahbcacbdbecaaaadbbbeababcdaaabbabciaeacdaebhadbcadbddkadcbaddabcaaabbabgbcaaabcbabbaacbbbebcacaabcakaaaaacbcaiaaae,3a12a1200c0g00310a3b1",
  pairPlace:
    "15x20n30dn:jchajdgabaaacaaacbdaaabbiabcaahdabccaebabacabcbahacccabbaamaaaacbabeaacacadbaeaagbbacadbgciebacbbatagegaiebcagbdhcabgbbeadfbbcdaababhbbabcjadcaaacbdbaabbbkbgacbfaaaabibabaaaabaaabaeaiaababdddbf,3f00c0a3b32b3b0a1323",
  pairMark:
    "15x20n30dn:lacbaacbehaabcbacciaaadbfahadacadaaccffahfhaaaaadaaabaaaahabcaaaaaaabbbbcbfbcbabaafaacdaebfaaaaccaeaaabaabgahbcacbdbecaaaadbbbeababcdaaabbabciaeacdaebhadbcadbddkadcbaddabcaaabbabgbcaaabcbabbaacbbbebcacaabcakaaaaacbcaiaaae,3a12a1200c0g00310a3b1",
  chainPlace:
    "15x20n30dh:caachabacccagbadadabbacaebcacababaaaaabbdccbmdhcbaadcbdakacbccdchcbaccfcifabjcdadbbabbfatdabdancpbbbahedaaabdbbafbcahbacbebaabcaaeaababbgaaagabafbbaaabaaabcbaccabcacahafbfaaaedecaalbcamd,1b0a1b1b3a02c2b2b13120a",
  chainStrike:
    "15x20n30dh:baccbaaagabacadcaadaaacbaaadfacceaaafaibcahbabhcaabbdbfbaagabbcbcbaabaeadaabadeababacbebaaacbaafcbcafabaacebbadbdabaaacaaaeccbgbaebckbbcabhacgaabaaaabcaabcadaacacbaaabcebcabbaabbbadabadacaabbbacfaabacfcbaabaabaibaadbhahaaaffcadbjbba,a230a3i13a2f1a3a2",
  chainMark: CHAIN_BOARD,
  chainDot: CHAIN_BOARD,
};

/**
 * The arms no fresh board reaches, each with why and with the board built by
 * hand below. All rest on dots the *player* made: the plan itself never leaves
 * a region with one dot (it colors it instead), and it dots a region only when
 * narrowing it, after which the same region is rarely a pair's target again (0
 * of the 240 boards above).
 */
const BUILT: Record<Exclude<Arm, keyof typeof PINNED>, string> = {
  lastDot: "a region the player dotted with its answer alone",
  pairStrike: "a pair's target the player had already dotted",
  chainTrim: "a chain's region the player dotted with a color a neighbor shows",
};

function stateOf(id: string): MapState {
  const [params, desc] = id.split(":");
  return mapGame.newState(mapGame.decodeParams(params), desc);
}

function plan(state: MapState): MapHintStep[] {
  const res = mapGame.hint?.(state);
  if (!res?.ok) throw new Error(`refused: ${res?.error}`);
  return res.steps as MapHintStep[];
}

const armOf = (text: string): Arm[] =>
  (Object.keys(ARMS) as Arm[]).filter((a) => ARMS[a].test(text));

/** What a region can still be, recomputed here rather than imported: its dots,
 * or all four without any, less its neighbors' colors. */
function left(s: MapState, r: number): number {
  const { graph, n, ngraph } = s.map;
  let p = s.pencil[r] || 0xf;
  for (const k of neighbors(graph, n, ngraph, r))
    if (s.coloring[k] >= 0) p &= ~(1 << s.coloring[k]);
  return p;
}

function adjacent(s: MapState, a: number, b: number): boolean {
  const { graph, n, ngraph } = s.map;
  return [...neighbors(graph, n, ngraph, a)].includes(b);
}

const bits = (m: number): number => [0, 1, 2, 3].filter((c) => m & (1 << c)).length;

/** Walk `steps` from `state`, handing each to `check` with the board it is
 * shown on. */
function walk(
  state: MapState,
  steps: readonly MapHintStep[],
  check: (s: MapState, step: MapHintStep) => void,
): MapState {
  let s = state;
  for (const step of steps) {
    check(s, step);
    s = mapGame.executeMove(s, step.move);
  }
  return s;
}

describe("map hint arms", () => {
  it("accounts for every arm exactly once", () => {
    const pinned = Object.keys(PINNED);
    const built = Object.keys(BUILT);
    expect([...pinned, ...built].sort()).toEqual(Object.keys(ARMS).sort());
    expect(pinned.filter((a) => built.includes(a))).toEqual([]);
  });

  for (const [arm, id] of Object.entries(PINNED) as [Arm, string][])
    it(`${arm} fires on its pinned board`, () => {
      const steps = plan(stateOf(id));
      expect(steps.some((s) => armOf(s.explanation).includes(arm))).toBe(true);
    });

  it("lastDot: a region dotted with its answer alone is placed by that dot", () => {
    const start = stateOf(PINNED.touches as string);
    const solved = walk(start, plan(start), () => {});
    const r = [...start.coloring.keys()].find((i) => start.coloring[i] < 0) as number;
    const dotted = mapGame.executeMove(start, {
      ops: [{ op: "pencil", region: r, bit: solved.coloring[r] }],
    });
    const spoken = plan(dotted).filter((s) => s.highlights?.targets[0] === r);
    expect(spoken.map((s) => armOf(s.explanation))).toEqual([["lastDot"]]);
  });

  it("chainTrim: a chain region carrying a dead dot loses it before the chain", () => {
    const start = stateOf(CHAIN_BOARD);
    const steps = plan(start);
    const at = steps.findIndex((s) => ARMS.chainDot.test(s.explanation));
    const before = walk(start, steps.slice(0, at), () => {});
    const r = steps[at].highlights?.targets[0] as number;
    // Dot every color on it, as a player marking "anything" would.
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: r, bit }] }),
      before,
    );
    const trims = plan(dotted).filter(
      (s) => s.highlights?.targets[0] === r && ARMS.chainTrim.test(s.explanation),
    );
    expect(trims).toHaveLength(1);
  });

  it("pairStrike: a pair's dotted target loses exactly the pair's dots", () => {
    const start = stateOf(PINNED.pairMark as string);
    const steps = plan(start);
    const at = steps.findIndex((s) => ARMS.pairMark.test(s.explanation));
    const before = walk(start, steps.slice(0, at), () => {});
    const k = steps[at].highlights?.targets[0] as number;
    // Dot every color on the target, as a player marking "anything" would.
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: k, bit }] }),
      before,
    );
    const [first] = plan(dotted);
    expect(armOf(first.explanation)).toEqual(["pairStrike"]);
    expect(first.highlights?.targets).toEqual([k]);
    const after = mapGame.executeMove(dotted, first.move);
    const [a, b] = (first.highlights as MapHint).evidence.map((e) => e.region);
    // The dots that went are the pair's two colors, and nothing else.
    expect(dotted.pencil[k] & ~after.pencil[k]).toBe(left(dotted, a));
    expect(left(dotted, a)).toBe(left(dotted, b));
  });
});

describe("map hint claims hold on the board they are spoken over", () => {
  it("every sentence's premise is what the board shows", () => {
    let checked = 0;
    for (const id of new Set(Object.values(PINNED)))
      walk(stateOf(id), plan(stateOf(id)), (s, step) => {
        const hl = step.highlights as MapHint;
        const [t] = hl.targets;
        const ev = hl.evidence.map((e) => e.region);
        const [arm] = armOf(step.explanation);
        expect(arm, step.explanation).toBeDefined();
        expect(s.coloring[t], "the target is blank").toBe(-1);
        if (arm === "touches" || arm === "deadDots" || arm === "lastDot") {
          // Its neighbors' colors leave one, and it outlines none of them: their
          // fills are the evidence.
          expect(ev).toEqual([]);
          expect(bits(left(s, t))).toBe(1);
        } else if (arm?.startsWith("pair")) {
          // "The outlined pair touch and can only be X or Y" and "this region
          // touches both".
          expect(ev).toHaveLength(2);
          expect(adjacent(s, ev[0], ev[1])).toBe(true);
          expect(bits(left(s, ev[0]))).toBe(2);
          expect(left(s, ev[0])).toBe(left(s, ev[1]));
          for (const e of ev) expect(adjacent(s, t, e)).toBe(true);
        } else if (arm === "chainDot" || arm === "chainTrim") {
          // A chain's own region, dotted with exactly the two colors it has.
          expect(ev).toContain(t);
          expect(bits(left(s, t))).toBe(2);
          expect((hl.want as { dots: number }).dots).toBe(left(s, t));
          expect(s.pencil[t]).not.toBe(left(s, t));
        } else if (arm?.startsWith("chain")) {
          // Numbered 1..m, each touching the next, each showing its two colors
          // as dots (the journey's earlier legs put them there), and this
          // region touching the first and the last.
          expect(hl.evidence.map((e) => e.order)).toEqual(ev.map((_, i) => i + 1));
          for (let i = 0; i + 1 < ev.length; i++)
            expect(adjacent(s, ev[i], ev[i + 1])).toBe(true);
          for (const e of ev) {
            expect(bits(left(s, e))).toBe(2);
            expect(s.pencil[e], "a chain region shows its two dots").toBe(left(s, e));
          }
          expect(adjacent(s, t, ev[0])).toBe(true);
          expect(adjacent(s, t, ev[ev.length - 1])).toBe(true);
          expect(ev).not.toContain(t);
        }
        checked++;
      });
    expect(checked).toBeGreaterThan(100);
  });

  it("a step never reaches past the easiest rung the board offers", () => {
    // Read off the board here, independently of the hint's own rung lists: is a
    // blank region down to one color, and does a pair fire anywhere?
    const blank = (s: MapState) =>
      [...s.coloring.keys()].filter((r) => s.coloring[r] < 0);
    const single = (s: MapState) => blank(s).some((r) => bits(left(s, r)) === 1);
    const pair = (s: MapState) =>
      blank(s).some((a) =>
        blank(s).some(
          (b) =>
            a < b &&
            adjacent(s, a, b) &&
            bits(left(s, a)) === 2 &&
            left(s, a) === left(s, b) &&
            blank(s).some(
              (k) => adjacent(s, k, a) && adjacent(s, k, b) && left(s, k) & left(s, a),
            ),
        ),
      );
    const seen = { pair: 0, chain: 0 };
    const boards = [
      ...new Set(Object.values(PINNED)),
      ...[0, 1, 2].flatMap((diff) =>
        [0, 1].map((s) => {
          const p: MapParams = { w: 15, h: 20, n: 30, diff };
          return `${mapGame.encodeParams(p, true)}:${mapGame.newDesc(p, randomNew(`map-tier-${diff}-${s}`)).desc}`;
        }),
      ),
    ];
    for (const id of boards)
      walk(stateOf(id), plan(stateOf(id)), (s, step) => {
        if (step.continuesPrevious) return; // a journey's later legs follow its first
        const [arm] = armOf(step.explanation);
        if (arm?.startsWith("pair")) {
          seen.pair++;
          expect(single(s), step.explanation).toBe(false);
        } else if (arm?.startsWith("chain")) {
          seen.chain++;
          expect(single(s) || pair(s), step.explanation).toBe(false);
        }
      });
    expect(seen.pair).toBeGreaterThan(5);
    expect(seen.chain).toBeGreaterThan(2);
  });
});

describe("map hint continuity", () => {
  it("after a placement, a neighbor it takes down to one color is where the plan goes next", () => {
    // The frontier's promise in Map's terms, read off the plan from outside:
    // `plan-continuity.ts` measures square grids, so Map holds its own.
    let checked = 0;
    for (const id of new Set(Object.values(PINNED))) {
      const steps = plan(stateOf(id));
      // The last firing, as the frontier sees it: every leg of one journey,
      // and the board before its first leg.
      let firing: MapHint[] = [];
      let firingStart: MapState | null = null;
      let last: MapHint[] = [];
      let lastStart: MapState | null = null;
      walk(stateOf(id), steps, (s, step) => {
        const hl = step.highlights as MapHint;
        if (step.continuesPrevious) {
          firing.push(hl);
          return;
        }
        last = firing;
        lastStart = firingStart;
        firing = [hl];
        firingStart = s;
        const from = lastStart;
        const placed = last.filter((h) => "color" in h.want).map((h) => h.targets[0]);
        if (!from || placed.length === 0) return;
        const { graph, n, ngraph } = s.map;
        const waiting = placed.some((p) =>
          [...neighbors(graph, n, ngraph, p)].some(
            (k) =>
              s.coloring[k] < 0 && bits(left(s, k)) === 1 && bits(left(from, k)) > 1,
          ),
        );
        if (!waiting) return;
        const wrote = last.flatMap((h) => h.targets);
        // A single outlines nothing but reads its colored neighbors all the
        // same, so those count as what it reads.
        const reads = [
          ...hl.targets,
          ...hl.evidence.map((e) => e.region),
          ...[...neighbors(graph, n, ngraph, hl.targets[0])].filter(
            (k) => s.coloring[k] >= 0,
          ),
        ];
        expect(
          reads.some((r) => wrote.includes(r)),
          step.explanation,
        ).toBe(true);
        checked++;
      });
    }
    expect(checked).toBeGreaterThan(50);
  });
});

describe("map hint bookkeeping", () => {
  it("dots a player makes toward a step keep the plan, and a stray one drops it", () => {
    const start = stateOf(PINNED.pairMark as string);
    const steps = plan(start);
    const at = steps.findIndex((s) => ARMS.pairMark.test(s.explanation));
    const s = walk(start, steps.slice(0, at), () => {});
    const step = steps[at];
    const want = (step.highlights as MapHint).want as { dots: number };
    const k = step.highlights?.targets[0] as number;
    const wanted = [0, 1, 2, 3].filter((c) => want.dots & (1 << c));
    const stray = [0, 1, 2, 3].find((c) => !(want.dots & (1 << c))) as number;
    const dot = (bit: number): MapMove => ({ ops: [{ op: "pencil", region: k, bit }] });

    expect(hintKeepTrack(dot(stray), step, s)).toBe("off");
    expect(hintKeepTrack(dot(wanted[0]), step, s)).toBe("onTrack");
    const half = mapGame.executeMove(s, dot(wanted[0]));
    // The step's move is rebuilt against the dot already made.
    const refreshed = refreshHintStep(step, half);
    expect(refreshed?.move.ops).toHaveLength(wanted.length - 1);
    const rest = wanted
      .slice(1)
      .reduce((st, b) => mapGame.executeMove(st, dot(b)), half);
    expect(refreshHintStep(step, rest)).toBeNull();
  });

  it("a dot set without a region's answer is a mistake, and the hint refuses", () => {
    const start = stateOf(PINNED.touches as string);
    const solved = walk(start, plan(start), () => {});
    const r = [...start.coloring.keys()].find((i) => start.coloring[i] < 0) as number;
    const wrong = (solved.coloring[r] + 1) % 4;
    const s = mapGame.executeMove(start, {
      ops: [{ op: "pencil", region: r, bit: wrong }],
    });
    expect(mapGame.findMistakes?.(s)).toEqual([{ region: r }]);
    expect(mapGame.hint?.(s)).toEqual({ ok: false, error: FIX_MISTAKES_FIRST });
  });
});

describe("map hint rendering", () => {
  it("a chain's regions carry their numbers, and the target its band", () => {
    const { recording, hint } = renderScenario({
      game: mapGame,
      id: PINNED.chainMark as string,
      showHint: true,
      hintUntil: (step) => ARMS.chainMark.test(step.explanation),
    });
    const hl = hint?.highlights as MapHint;
    const rgb = (c: readonly number[]) =>
      `rgb(${c.map((v) => Math.round(v * 255)).join(", ")})`;
    const numbers = new Set(
      recording.ops.flatMap((o) =>
        o.op === "text" && o.rgb === rgb(HINT_EVIDENCE) ? [o.text] : [],
      ),
    );
    expect([...numbers].sort()).toEqual(hl.evidence.map((e) => String(e.order)).sort());
    const polys = (c: number) =>
      recording.ops.filter((o) => o.op === "polygon" && o.fill === c).length;
    expect(polys(COL_HINT)).toBeGreaterThan(0);
    expect(polys(COL_HINT_CELL)).toBeGreaterThan(0);
    // The evidence is a dashed line, never a strip along a whole tile side: a
    // solid one beside the target's band read as one thick line (owner
    // playtest, 2026-09-25).
    const ts = mapGame.preferredTileSize ?? 32;
    for (const o of recording.ops)
      if (o.op === "polygon" && o.fill === COL_HINT_CELL) {
        const xs = o.points.map(([x]) => x);
        const ys = o.points.map(([, y]) => y);
        const long = Math.max(
          Math.max(...xs) - Math.min(...xs),
          Math.max(...ys) - Math.min(...ys),
        );
        expect(long).toBeLessThan(ts / 2);
      }
    expect(recording.ops).toMatchSnapshot();
  });
});
