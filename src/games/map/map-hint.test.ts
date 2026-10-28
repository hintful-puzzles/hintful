/**
 * Map's hint: every arm it can speak, pinned to a board it speaks it on; every
 * sentence's claim held to the board it is spoken over; a weighing's marks on
 * the canvas; and the tiers kept to their own rungs.
 */

import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { MapHint, MapHintStep } from "./hint.ts";
import { hintKeepTrack, refreshHintStep } from "./hint.ts";
import { colorName, colorsOf, REGION } from "./hint-text.ts";
import { mapGame } from "./index.ts";
import { COL_HINT_CELL } from "./render.ts";
import { neighbors } from "./solver.ts";
import type { MapMove, MapParams, MapState } from "./state.ts";

/** Every arm the hint speaks: the cases of a rung that read differently. A
 * step's arms are read off its rung, what it wants and the board it is shown
 * on ({@link armsOf}), so adding one breaks compilation until it is pinned here
 * or ledgered below. */
const ARMS = [
  // A single: with no dots, with one dot, with dots a neighbor's color kills.
  "touches",
  "lastDot",
  "deadDots",
  // A pair: its own regions dotted first, then what it rules out of a third.
  "pairDot",
  "pairTrim",
  "pairPlace",
  "pairStrike",
  "pairMark",
  // A weighing, the same way, and the two shapes its middle region takes:
  // without the struck color, so the ends alone carry it, or with it, so the
  // middle region itself is one of the ways.
  "weighPlace",
  "weighStrike",
  "weighMark",
  "weighEnds",
  "weighSelf",
  "weighDot",
  "weighTrim",
] as const;
type Arm = (typeof ARMS)[number];

/** The regions a step's words outline: a weighing's middle region first. */
const evidenceOf = (step: MapHintStep) => stepMarks(step).of("outline", REGION);

/** What a region can still be, recomputed here rather than imported: its dots,
 * or all four without any, less its neighbors' colors. */
function left(s: MapState, r: number): number {
  const { graph, n, ngraph } = s.map;
  let p = s.pencil[r] || 0xf;
  for (const k of neighbors(graph, n, ngraph, r))
    if (s.coloring[k] >= 0) p &= ~(1 << s.coloring[k]);
  return p;
}

/**
 * The arms `step` speaks on `s`, the board it is shown on.
 *
 * A single's arm is what the region's dots are; a leg that narrows a region
 * ends in a placement, a strike from its dots, or dots written on a bare one.
 * A leg writing a pair's or a weighing's premise outlines nothing. Whether a
 * weighing's middle region may be the struck color is read off its dots.
 */
function armsOf(step: MapHintStep, s: MapState): Arm[] {
  const hl = step.highlights;
  if (!hl || "regions" in hl.want) return [];
  const { want } = hl;
  const [t] = hl.targets;
  const dotted = s.pencil[t] !== 0;
  const ev = evidenceOf(step).map((e) => e.region);
  const { graph, n, ngraph } = s.map;
  switch (step.rung) {
    case "fill":
    case "clean":
      return [];
    case "onlyColorLeft": {
      if (!dotted) return ["touches"];
      const dead = [...neighbors(graph, n, ngraph, t)].some(
        (k) => s.coloring[k] >= 0 && s.pencil[t] & (1 << s.coloring[k]),
      );
      return [dead ? "deadDots" : "lastDot"];
    }
    case "sharedPair":
      if (ev.length === 0) return [dotted ? "pairTrim" : "pairDot"];
      return ["color" in want ? "pairPlace" : dotted ? "pairStrike" : "pairMark"];
    case "weighRegion": {
      if (ev.length === 0) return [dotted ? "weighTrim" : "weighDot"];
      const struck = left(s, t) & ~("color" in want ? 1 << want.color : want.dots);
      return [
        "color" in want ? "weighPlace" : dotted ? "weighStrike" : "weighMark",
        left(s, ev[0]) & struck ? "weighSelf" : "weighEnds",
      ];
    }
  }
}

/** The arms hint-guided play on a dealt board reaches. */
const DEALT = [
  "touches",
  "deadDots",
  "pairPlace",
  "pairDot",
  "pairMark",
  "weighPlace",
  "weighStrike",
  "weighMark",
  "weighDot",
  "weighEnds",
  "weighSelf",
] as const satisfies readonly Arm[];
type DealtArm = (typeof DEALT)[number];

const speaks =
  (arm: Arm) =>
  (step: MapHintStep, s: MapState): boolean =>
    armsOf(step, s).includes(arm);

/** The boards read with the dots filled in first, which is where a plan opens
 * on the Mark-all press: `fill`, then `clean`. */
const POPULATED: MapParams = { w: 10, h: 10, n: 12, diff: 0 };

/** A position for every rung, and one each dealt arm opens the hint on, at the
 * three teachable tiers. */
const pinned = describeHintPins({
  game: mapGame,
  params: [
    ...[0, 1, 2].map((diff): MapParams => ({ w: 15, h: 20, n: 30, diff })),
    POPULATED,
  ],
  seeds: 40,
  ui: (state) => ({
    ...mapGame.newUi(state),
    ...(state.map.n === POPULATED.n ? { candidateReading: "populate" as const } : {}),
  }),
  kinds: Object.fromEntries(DEALT.map((arm) => [arm, speaks(arm)])) as Record<
    DealtArm,
    ReturnType<typeof speaks>
  >,
  pins: {
    /** Held on 1574 of 2877 positions walked. */
    touches:
      "15x20n30de:gaabgbaadaeabadccafbccecgacagbhaacgcamaacadacbacaaaagadamaaacbaaibbaabbdibdaccdbaicaabiclaaaddbdlagdvaedbhfabcaacagagaccdacabaabcjaeadcadacakaaaldaabafabbbaaadababaaabcmbbcgbdbbabc,23a2e03d2b3b2a01b3a0",
    /** Held on 327 of 2877 positions walked. */
    deadDots: {
      id: "15x20n30dh:nafahabcgceaaaaafabaaaaaaceagaccgckacbcadaabeaacbabccacabceccblaaadccdbcbabadbgacabadddbgaabbfbbcalbjccbbcebbafabaaababagacbeaaaccjaaabbbagciaeagbdjbceacecbfabaaaafabeaebbcbeaabaadabbadcbagbaar,b13d0e2c32f32a1",
      moves:
        '[{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1}]},{"ops":[{"op":"pencil","region":20,"bit":0},{"op":"pencil","region":20,"bit":1}]},{"ops":[{"op":"pencil","region":13,"bit":2},{"op":"pencil","region":13,"bit":3}]},{"ops":[{"op":"pencil","region":16,"bit":0},{"op":"pencil","region":16,"bit":1}]},{"ops":[{"op":"color","region":17,"color":2}]}]',
    },
    /** Held on 157 of 2877 positions walked. */
    pairPlace: {
      id: "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
      moves:
        '[{"ops":[{"op":"pencil","region":3,"bit":1},{"op":"pencil","region":3,"bit":2}]},{"ops":[{"op":"pencil","region":6,"bit":1},{"op":"pencil","region":6,"bit":2}]}]',
    },
    /** Held on 200 of 2877 positions walked. */
    pairDot:
      "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
    /** Held on 15 of 2877 positions walked. */
    pairMark: {
      id: "15x20n30dh:nafahabcgceaaaaafabaaaaaaceagaccgckacbcadaabeaacbabccacabceccblaaadccdbcbabadbgacabadddbgaabbfbbcalbjccbbcebbafabaaababagacbeaaaccjaaabbbagciaeagbdjbceacecbfabaaaafabeaebbcbeaabaadabbadcbagbaar,b13d0e2c32f32a1",
      moves:
        '[{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1}]},{"ops":[{"op":"pencil","region":20,"bit":0},{"op":"pencil","region":20,"bit":1}]}]',
    },
    /** Held on 14 of 2877 positions walked. */
    weighPlace: {
      id: "15x20n30dh:cabaxeobpccaeaaaccaacaeaecbccgecbbcabaccbcabcaccbaaaaaabeaabaaaabbdababafeagaaeaaacbaaabbaaccaabbaababeadbaakabadaaabakabbababjaccceaaaaaaabdcbacecccddaaaaaabdbdaaaabaceadccakfaaacgbbbaacafbcafaaahacacbqaiacaadaac,0a31e12230h30a12a22",
      moves:
        '[{"ops":[{"op":"color","region":1,"color":2}]},{"ops":[{"op":"color","region":4,"color":0}]},{"ops":[{"op":"color","region":7,"color":2}]},{"ops":[{"op":"color","region":5,"color":1}]},{"ops":[{"op":"pencil","region":8,"bit":0},{"op":"pencil","region":8,"bit":3}]},{"ops":[{"op":"pencil","region":15,"bit":0},{"op":"pencil","region":15,"bit":1}]},{"ops":[{"op":"pencil","region":16,"bit":1},{"op":"pencil","region":16,"bit":3}]}]',
    },
    /** Held on 17 of 2877 positions walked. */
    weighStrike: {
      id: "15x20n30dh:eczeafcbbabbaaaeabbaaaabbbcbagbdacaeabbebfacecajbbdccaaacababcbbaabbabbaacabdaccbfdbabacbdbaalabccafabaabradaaaadbaedabhabbabbabacaaaabbbadfaeaacbbacdacbdaaabaaaccgddadaaeecfadbedbabaabfahbicbbmabacbjadbaaaaaad,202b3f0b220e0a120b",
      moves:
        '[{"ops":[{"op":"pencil","region":3,"bit":1},{"op":"pencil","region":3,"bit":3}]},{"ops":[{"op":"pencil","region":7,"bit":1},{"op":"pencil","region":7,"bit":3}]},{"ops":[{"op":"pencil","region":4,"bit":0},{"op":"pencil","region":4,"bit":2}]},{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1},{"op":"pencil","region":9,"bit":3}]},{"ops":[{"op":"pencil","region":22,"bit":0},{"op":"pencil","region":22,"bit":3}]},{"ops":[{"op":"pencil","region":14,"bit":0},{"op":"pencil","region":14,"bit":1}]}]',
    },
    /** Held on 45 of 2877 positions walked. */
    weighMark: {
      id: "15x20n30dh:faiaaaaaafdabamaacabacabdaabdabbacdbaafaaafeaaababbadbbdkaaalacaadcdgadabaaacaccahdabcbagbbbdaaaccbadaccdaafadbabbebcadadaacdcccacfacabbjadcacgaabdadbdadbfabahabbbabafcbabbagbaladabdecbaaaaabaaaaddaaaabaabbfbaabadalccac,02033322d31a303f11a022",
      moves:
        '[{"ops":[{"op":"color","region":9,"color":0}]},{"ops":[{"op":"color","region":11,"color":2}]},{"ops":[{"op":"pencil","region":10,"bit":0},{"op":"pencil","region":10,"bit":1}]},{"ops":[{"op":"pencil","region":21,"bit":0},{"op":"pencil","region":21,"bit":3}]},{"ops":[{"op":"pencil","region":14,"bit":1},{"op":"pencil","region":14,"bit":3}]}]',
    },
    /** Held on 124 of 2877 positions walked. */
    weighDot: {
      id: "15x20n30dh:faiaaaaaafdabamaacabacabdaabdabbacdbaafaaafeaaababbadbbdkaaalacaadcdgadabaaacaccahdabcbagbbbdaaaccbadaccdaafadbabbebcadadaacdcccacfacabbjadcacgaabdadbdadbfabahabbbabafcbabbagbaladabdecbaaaaabaaaaddaaaabaabbfbaabadalccac,02033322d31a303f11a022",
      moves:
        '[{"ops":[{"op":"color","region":9,"color":0}]},{"ops":[{"op":"color","region":11,"color":2}]}]',
    },
    /** Held on 52 of 2877 positions walked. */
    weighEnds: {
      id: "15x20n30dh:faiaaaaaafdabamaacabacabdaabdabbacdbaafaaafeaaababbadbbdkaaalacaadcdgadabaaacaccahdabcbagbbbdaaaccbadaccdaafadbabbebcadadaacdcccacfacabbjadcacgaabdadbdadbfabahabbbabafcbabbagbaladabdecbaaaaabaaaaddaaaabaabbfbaabadalccac,02033322d31a303f11a022",
      moves:
        '[{"ops":[{"op":"color","region":9,"color":0}]},{"ops":[{"op":"color","region":11,"color":2}]},{"ops":[{"op":"pencil","region":10,"bit":0},{"op":"pencil","region":10,"bit":1}]},{"ops":[{"op":"pencil","region":21,"bit":0},{"op":"pencil","region":21,"bit":3}]},{"ops":[{"op":"pencil","region":14,"bit":1},{"op":"pencil","region":14,"bit":3}]}]',
    },
    /** Held on 24 of 2877 positions walked. */
    weighSelf: {
      id: "15x20n30dh:eczeafcbbabbaaaeabbaaaabbbcbagbdacaeabbebfacecajbbdccaaacababcbbaabbabbaacabdaccbfdbabacbdbaalabccafabaabradaaaadbaedabhabbabbabacaaaabbbadfaeaacbbacdacbdaaabaaaccgddadaaeecfadbedbabaabfahbicbbmabacbjadbaaaaaad,202b3f0b220e0a120b",
      moves:
        '[{"ops":[{"op":"pencil","region":3,"bit":1},{"op":"pencil","region":3,"bit":3}]},{"ops":[{"op":"pencil","region":7,"bit":1},{"op":"pencil","region":7,"bit":3}]},{"ops":[{"op":"pencil","region":4,"bit":0},{"op":"pencil","region":4,"bit":2}]},{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1},{"op":"pencil","region":9,"bit":3}]},{"ops":[{"op":"pencil","region":22,"bit":0},{"op":"pencil","region":22,"bit":3}]}]',
    },
    /** Held on 40 of 2877 positions walked. */
    fill: "10x10n12de:dabcacaacbddccgacaacdaaaebaaaabaaaeabaaaeabbadcbadbafabaaababababbddaacadbcaaadabagaa,a103a21b1a1",
    /** Held on 191 of 2877 positions walked. */
    clean: {
      id: "10x10n12de:dabcacaacbddccgacaacdaaaebaaaabaaaeabaaaeabbadcbadbafabaaababababbddaacadbcaaadabagaa,a103a21b1a1",
      moves:
        '[{"ops":[{"op":"pencil","region":0,"bit":0},{"op":"pencil","region":0,"bit":1},{"op":"pencil","region":0,"bit":2},{"op":"pencil","region":0,"bit":3},{"op":"pencil","region":4,"bit":0},{"op":"pencil","region":4,"bit":1},{"op":"pencil","region":4,"bit":2},{"op":"pencil","region":4,"bit":3},{"op":"pencil","region":7,"bit":0},{"op":"pencil","region":7,"bit":1},{"op":"pencil","region":7,"bit":2},{"op":"pencil","region":7,"bit":3},{"op":"pencil","region":8,"bit":0},{"op":"pencil","region":8,"bit":1},{"op":"pencil","region":8,"bit":2},{"op":"pencil","region":8,"bit":3},{"op":"pencil","region":10,"bit":0},{"op":"pencil","region":10,"bit":1},{"op":"pencil","region":10,"bit":2},{"op":"pencil","region":10,"bit":3}]}]',
    },
    /** Held on 2877 of 2877 positions walked. */
    onlyColorLeft:
      "15x20n30de:gaabgbaadaeabadccafbccecgacagbhaacgcamaacadacbacaaaagadamaaacbaaibbaabbdibdaccdbaicaabiclaaaddbdlagdvaedbhfabcaacagagaccdacabaabcjaeadcadacakaaaldaabafabbbaaadababaaabcmbbcgbdbbabc,23a2e03d2b3b2a01b3a0",
    /** Held on 1057 of 2877 positions walked. */
    sharedPair:
      "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
    /** Held on 530 of 2877 positions walked. */
    weighRegion: {
      id: "15x20n30dh:faiaaaaaafdabamaacabacabdaabdabbacdbaafaaafeaaababbadbbdkaaalacaadcdgadabaaacaccahdabcbagbbbdaaaccbadaccdaafadbabbebcadadaacdcccacfacabbjadcacgaabdadbdadbfabahabbbabafcbabbagbaladabdecbaaaaabaaaaddaaaabaabbfbaabadalccac,02033322d31a303f11a022",
      moves:
        '[{"ops":[{"op":"color","region":9,"color":0}]},{"ops":[{"op":"color","region":11,"color":2}]}]',
    },
  },
});

/** The boards the pins sit on, each from its fresh state: the corpus the
 * whole-plan checks below walk. */
const pinnedBoards = (): string[] => [...new Set(DEALT.map((arm) => pinned(arm).id))];

/**
 * The arms no fresh board reaches, each with why and with the board built by
 * hand below. All rest on dots the *player* made: the plan itself never leaves
 * a region with one dot (it colors it instead), and it dots a region only when
 * narrowing it, after which the same region is rarely a pair's target again (0
 * of 240 dealt boards, 40 per preset of the two sizes at these tiers).
 */
const BUILT: Record<Exclude<Arm, DealtArm>, string> = {
  lastDot: "a region the player dotted with its answer alone",
  pairStrike: "a pair's target the player had already dotted",
  weighTrim: "a weighing's region the player dotted with a color a neighbor shows",
  pairTrim: "a pair's region the player dotted with a color a neighbor shows",
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

function adjacent(s: MapState, a: number, b: number): boolean {
  const { graph, n, ngraph } = s.map;
  return [...neighbors(graph, n, ngraph, a)].includes(b);
}

const bits = (m: number): number => [0, 1, 2, 3].filter((c) => m & (1 << c)).length;

/** The colors a step leaves its target: its color, or its dots. */
const wantMask = (hl: MapHint): number =>
  "color" in hl.want ? 1 << hl.want.color : "dots" in hl.want ? hl.want.dots : 0;

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

/** Every step of the plan from `state`, with the board it is shown on and the
 * arms it speaks there. */
function spoken(state: MapState): { s: MapState; step: MapHintStep; arms: Arm[] }[] {
  const out: { s: MapState; step: MapHintStep; arms: Arm[] }[] = [];
  walk(state, plan(state), (s, step) => {
    out.push({ s, step, arms: armsOf(step, s) });
  });
  return out;
}

/** The words of the arms no dealt board speaks, which no pin's snapshot holds. */
const BUILT_WORDS: Record<Exclude<Arm, DealtArm>, RegExp> = {
  lastDot: /^This region has a single dot/,
  pairStrike: /^This region touches the outlined pair, .* must go\.$/,
  weighTrim: /^This region's other dots match .* can only be /,
  pairTrim: /^This region's other dots match .* can only be /,
};

describe("map hint arms", () => {
  it("accounts for every arm exactly once", () => {
    const dealt: readonly string[] = DEALT;
    const built = Object.keys(BUILT);
    expect([...dealt, ...built].sort()).toEqual([...ARMS].sort());
    expect(dealt.filter((a) => built.includes(a))).toEqual([]);
  });

  it("lastDot: a region dotted with its answer alone is placed by that dot", () => {
    const start = stateOf(pinned("touches").id);
    const solved = walk(start, plan(start), () => {});
    const r = [...start.coloring.keys()].find((i) => start.coloring[i] < 0) as number;
    const dotted = mapGame.executeMove(start, {
      ops: [{ op: "pencil", region: r, bit: solved.coloring[r] }],
    });
    const ofRegion = spoken(dotted).filter(
      ({ step }) => step.highlights?.targets[0] === r,
    );
    expect(ofRegion.map(({ arms }) => arms)).toEqual([["lastDot"]]);
    expect(ofRegion[0].step.explanation).toMatch(BUILT_WORDS.lastDot);
  });

  it("weighTrim: a weighing's region carrying a dead dot loses it before the weighing", () => {
    const { state: before, step } = pinned("weighDot");
    const r = step.highlights?.targets[0] as number;
    // Dot every color on it, as a player marking "anything" would.
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: r, bit }] }),
      before,
    );
    const trims = spoken(dotted).filter(
      ({ step, arms }) =>
        step.highlights?.targets[0] === r && arms.includes("weighTrim"),
    );
    expect(trims).toHaveLength(1);
    expect(trims[0].step.explanation).toMatch(BUILT_WORDS.weighTrim);
  });

  it("pairTrim: a pair region carrying a dead dot loses it before the pair", () => {
    const { state: before, step } = pinned("pairDot");
    const r = step.highlights?.targets[0] as number;
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: r, bit }] }),
      before,
    );
    const trims = spoken(dotted).filter(
      ({ step, arms }) =>
        step.highlights?.targets[0] === r && arms.includes("pairTrim"),
    );
    expect(trims).toHaveLength(1);
    expect(trims[0].step.explanation).toMatch(BUILT_WORDS.pairTrim);
  });

  it("pairStrike: a pair's dotted target loses exactly the pair's dots", () => {
    const { state: before, step } = pinned("pairMark");
    const k = step.highlights?.targets[0] as number;
    // Dot every color on the target, as a player marking "anything" would.
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: k, bit }] }),
      before,
    );
    // The pair's own regions may be dotted first, as legs of the same journey.
    const after1 = spoken(dotted).find(({ arms }) => !arms.includes("pairDot"));
    if (!after1) throw new Error("no step after the pair's dots");
    const first = after1.step;
    expect(after1.arms).toEqual(["pairStrike"]);
    expect(first.explanation).toMatch(BUILT_WORDS.pairStrike);
    expect(first.highlights?.targets).toEqual([k]);
    const after = mapGame.executeMove(dotted, first.move);
    const [a, b] = evidenceOf(first).map((e) => e.region);
    // The dots that went are the pair's two colors, and nothing else.
    expect(dotted.pencil[k] & ~after.pencil[k]).toBe(left(dotted, a));
    expect(left(dotted, a)).toBe(left(dotted, b));
  });
});

describe("map hint claims hold on the board they are spoken over", () => {
  it("every sentence's premise is what the board shows", () => {
    let checked = 0;
    for (const id of pinnedBoards())
      walk(stateOf(id), plan(stateOf(id)), (s, step) => {
        const hl = step.highlights as MapHint;
        const [t] = hl.targets;
        const ev = evidenceOf(step).map((e) => e.region);
        const [arm] = armsOf(step, s);
        expect(arm, step.explanation).toBeDefined();
        expect(s.coloring[t], "the target is blank").toBe(-1);
        if (arm === "touches" || arm === "deadDots" || arm === "lastDot") {
          // Its neighbors' colors leave one, and it outlines none of them: their
          // fills are the evidence.
          expect(ev).toEqual([]);
          expect(bits(left(s, t))).toBe(1);
        } else if (
          arm === "pairDot" ||
          arm === "pairTrim" ||
          arm === "weighDot" ||
          arm === "weighTrim"
        ) {
          // One of the pair or weighing, ringed, dotted with exactly its
          // colors, and nothing outlined: the leg writes the premise, and the
          // other regions' dots may not be on the board yet. A pair's regions
          // and a weighing's ends have two; a weighing's middle region may
          // have three.
          expect(ev).toEqual([]);
          if (arm.startsWith("pair")) expect(bits(left(s, t))).toBe(2);
          else expect(bits(left(s, t))).toBeGreaterThanOrEqual(2);
          expect((hl.want as { dots: number }).dots).toBe(left(s, t));
          expect(s.pencil[t]).not.toBe(left(s, t));
        } else if (arm?.startsWith("pair")) {
          // "The outlined pair touch and can only be X or Y", each showing it
          // as dots (the journey's earlier legs put them there), and "this
          // region touches both".
          expect(ev).toHaveLength(2);
          expect(adjacent(s, ev[0], ev[1])).toBe(true);
          expect(bits(left(s, ev[0]))).toBe(2);
          expect(left(s, ev[0])).toBe(left(s, ev[1]));
          for (const e of ev) {
            expect(adjacent(s, t, e)).toBe(true);
            expect(s.pencil[e], "a pair region shows its two dots").toBe(left(s, e));
          }
        } else if (arm?.startsWith("weigh")) {
          // "Whatever the middle region is, [it or] an outlined end beside
          // this region is X": every region shows its colors as dots (the
          // journey's earlier legs put them there); each color the middle
          // region can take but X is an end's other dot, that end touching
          // the middle region and this one; and where the middle region can
          // be X, it touches this region too.
          const [middle, ...ends] = ev;
          const x = colorsOf(left(s, t) & ~wantMask(hl));
          expect(x, "a weighing strikes one color").toHaveLength(1);
          const xBit = 1 << x[0];
          expect(ev).not.toContain(t);
          for (const e of ev)
            expect(s.pencil[e], "a weighing's region shows its dots").toBe(left(s, e));
          const ways = left(s, middle) & ~xBit;
          expect(ends).toHaveLength(bits(ways));
          for (const e of ends) {
            expect(adjacent(s, e, middle)).toBe(true);
            expect(adjacent(s, e, t)).toBe(true);
            expect(bits(left(s, e))).toBe(2);
            expect(left(s, e) & xBit).toBe(xBit);
          }
          expect(ends.reduce((m, e) => m | (left(s, e) & ~xBit), 0)).toBe(ways);
          if (left(s, middle) & xBit) expect(adjacent(s, middle, t)).toBe(true);
        }
        checked++;
      });
    expect(checked).toBeGreaterThan(100);
  });

  it("names each color by the word of the scheme it is shown in", () => {
    // The dark fills of two of the four are a brown and a maroon, and a
    // sentence over a dark board says so: the dark words are the light ones,
    // each color swapped for its dark word, and no other change.
    const COLORS = [0, 1, 2, 3].map(colorName);
    const swapped = (text: string) =>
      COLORS.reduce(
        (t, w) =>
          t.replace(new RegExp(`\\b${w.light}\\b`, "gi"), (m) =>
            m[0] === m[0].toUpperCase()
              ? w.dark[0].toUpperCase() + w.dark.slice(1)
              : w.dark,
          ),
        text,
      );
    const said = new Set<string>();
    for (const id of pinnedBoards())
      walk(stateOf(id), plan(stateOf(id)), (_s, step) => {
        const dark = step.words?.textIn("dark") ?? "";
        expect(dark, step.explanation).toBe(swapped(step.explanation));
        for (const w of dark.toLowerCase().split(/\W+/)) said.add(w);
      });
    expect(said).toContain("brown");
    expect(said).toContain("maroon");
    expect(said).not.toContain("yellow");
    expect(said).not.toContain("pink");
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
    const seen = { pair: 0, weigh: 0 };
    const boards = [
      ...pinnedBoards(),
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
        const [arm] = armsOf(step, s);
        if (arm?.startsWith("pair")) {
          seen.pair++;
          expect(single(s), step.explanation).toBe(false);
        } else if (arm?.startsWith("weigh")) {
          seen.weigh++;
          expect(single(s) || pair(s), step.explanation).toBe(false);
        }
      });
    expect(seen.pair).toBeGreaterThan(5);
    expect(seen.weigh).toBeGreaterThan(2);
  });
});

describe("map hint continuity", () => {
  it("after a placement, a neighbor it takes down to one color is where the plan goes next", () => {
    // The frontier's promise in Map's terms, read off the plan from outside:
    // `plan-continuity.ts` measures square grids, so Map holds its own.
    let checked = 0;
    for (const id of pinnedBoards()) {
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
          ...evidenceOf(step).map((e) => e.region),
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
    const { state: s, step } = pinned("pairMark");
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

  it("a dot set without a region's answer is a mistake", () => {
    const start = stateOf(pinned("touches").id);
    const solved = walk(start, plan(start), () => {});
    const r = [...start.coloring.keys()].find((i) => start.coloring[i] < 0) as number;
    const wrong = (solved.coloring[r] + 1) % 4;
    const s = mapGame.executeMove(start, {
      ops: [{ op: "pencil", region: r, bit: wrong }],
    });
    expect(mapGame.findMistakes?.(s)).toEqual([{ region: r, kind: "note" }]);
  });
});

describe("map hint rendering", () => {
  it("a weighing outlines its regions in dashes, and rings the target", () => {
    const { recording } = renderPinnedHint(mapGame, pinned("weighMark"));
    const polys = (c: number) =>
      recording.ops.filter((o) => o.op === "polygon" && o.fill === c).length;
    // One ring, drawn by every cell it reaches, at the target's label point.
    const rings = ringsOf(recording.ops);
    expectRing(recording.ops, { rings: rings.length });
    expect(new Set(rings.map((r) => `${r.x},${r.y},${r.w},${r.h}`)).size).toBe(1);
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

describe("map's Mark-all press and the populate reading", () => {
  const mPress = (s: MapState): MapMove | null => {
    const m = mapGame.markAll?.(s) ?? null;
    return m && typeof m === "object" && "ops" in m ? m : null;
  };

  /** Press `M`; `null` when it is no move. */
  const press = (s: MapState): MapState | null => {
    const m = mPress(s);
    return m ? mapGame.executeMove(s, m) : null;
  };

  const blank = (s: MapState): number[] =>
    [...s.coloring.keys()].filter((r) => s.coloring[r] < 0);

  const populatePlan = (s: MapState): MapHintStep[] => {
    const res = mapGame.hint?.(s, undefined, {
      ...mapGame.newUi(s),
      candidateReading: "populate",
    });
    if (!res?.ok) throw new Error(`refused: ${res?.error}`);
    return res.steps as MapHintStep[];
  };

  it("fills all four colors, then leaves each region what its neighbors do", () => {
    const start = stateOf(pinned("touches").id);
    expect(blank(start).length).toBeGreaterThan(10);
    const filled = press(start) as MapState;
    for (const r of blank(start)) expect(filled.pencil[r], `region ${r}`).toBe(0xf);
    const cleaned = press(filled) as MapState;
    // The clean has something to do on this board, or the check below would
    // hold over a second fill.
    expect(blank(start).some((r) => cleaned.pencil[r] !== 0xf)).toBe(true);
    for (const r of blank(start))
      expect(cleaned.pencil[r], `region ${r}`).toBe(left(start, r));
    expect(press(cleaned)).toBeNull();
  });

  it("opens the populate plan with the press, fill and clean as one journey", () => {
    const start = stateOf(pinned("touches").id);
    const [fill, clean, next] = populatePlan(start);
    expect(fill.explanation).toMatch(/^Start by dotting all four colors/);
    expect(clean.explanation).toMatch(/^Now clear the easy ones/);
    expect(clean.continuesPrevious).toBe(true);
    expect(next.continuesPrevious).toBeFalsy();
    // The steps are the button's moves, so pressing it keeps the plan.
    expect(hintKeepTrack(mPress(start) as MapMove, fill, start)).toBe("completed");
    expect(refreshHintStep(clean, press(start) as MapState)).toBe(clean);
    // Not a step of the implicit plan, which reads the neighbors instead.
    expect(plan(start).some((s) => s.rung === "fill")).toBe(false);
  });

  it("a clean done dot by dot keeps the plan, and a finished one drops the step", () => {
    const filled = press(stateOf(pinned("touches").id)) as MapState;
    const clean = populatePlan(filled)[0];
    expect(clean.explanation).toMatch(/^Now clear the easy ones/);
    const [first, ...rest] = clean.move.ops;
    expect(rest.length).toBeGreaterThan(0);
    expect(hintKeepTrack({ ops: [first] }, clean, filled)).toBe("onTrack");
    const part = mapGame.executeMove(filled, { ops: [first] });
    expect(refreshHintStep(clean, part)?.move.ops).toEqual(rest);
    // A dot the clean does not remove is off the plan: here, re-adding the one
    // just struck.
    expect(hintKeepTrack({ ops: [first] }, clean, part)).toBe("off");
    expect(refreshHintStep(clean, press(filled) as MapState)).toBeNull();
  });
});
