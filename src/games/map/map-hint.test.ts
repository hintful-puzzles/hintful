/**
 * Map's hint: every arm it can speak, pinned to a board it speaks it on; every
 * sentence's claim held to the board it is spoken over; the chain's numbers on
 * the canvas; and the tiers kept to their own rungs.
 */

import { describe, expect, it } from "vitest";
import { HINT_EVIDENCE } from "../../engine/color/palette.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { MapHint, MapHintStep } from "./hint.ts";
import { hintKeepTrack, refreshHintStep } from "./hint.ts";
import { REGION, WALK_MAX } from "./hint-text.ts";
import { mapGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
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
  // A chain, the same way, and the three ways its sentence tells the walk.
  "chainPlace",
  "chainStrike",
  "chainMark",
  "chainWalk",
  "chainLongWalk",
  "chainAlternates",
  "chainDot",
  "chainTrim",
] as const;
type Arm = (typeof ARMS)[number];

/** The regions a step's words outline, with their chain numbers. */
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
 * A leg writing a pair's premise outlines nothing, and one writing a chain's
 * is itself one of the numbered regions. The way a chain tells its walk is
 * read off the chain's dots, which the sentence was chosen from as the
 * firing's first narrowing leg was built: it is exact for a step that opens a
 * plan, and a later leg of the same firing may see a board that has moved.
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
    case "forcingChain": {
      if (ev.includes(t)) return [dotted ? "chainTrim" : "chainDot"];
      const struck = left(s, t) & ~("color" in want ? 1 << want.color : want.dots);
      const told = ev.every((e) => left(s, e) & struck)
        ? "chainAlternates"
        : ev.length <= WALK_MAX
          ? "chainWalk"
          : "chainLongWalk";
      return [
        "color" in want ? "chainPlace" : dotted ? "chainStrike" : "chainMark",
        told,
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
  "chainPlace",
  "chainStrike",
  "chainMark",
  "chainDot",
  "chainWalk",
  "chainAlternates",
  "chainLongWalk",
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
    /** Held on 1547 of 2876 positions walked. */
    touches:
      "15x20n30de:gaabgbaadaeabadccafbccecgacagbhaacgcamaacadacbacaaaagadamaaacbaaibbaabbdibdaccdbaicaabiclaaaddbdlagdvaedbhfabcaacagagaccdacabaabcjaeadcadacakaaaldaabafabbbaaadababaaabcmbbcgbdbbabc,23a2e03d2b3b2a01b3a0",
    /** Held on 358 of 2876 positions walked. */
    deadDots: {
      id: "15x20n30dh:nafahabcgceaaaaafabaaaaaaceagaccgckacbcadaabeaacbabccacabceccblaaadccdbcbabadbgacabadddbgaabbfbbcalbjccbbcebbafabaaababagacbeaaaccjaaabbbagciaeagbdjbceacecbfabaaaafabeaebbcbeaabaadabbadcbagbaar,b13d0e2c32f32a1",
      moves:
        '[{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1}]},{"ops":[{"op":"pencil","region":20,"bit":0},{"op":"pencil","region":20,"bit":1}]},{"ops":[{"op":"pencil","region":13,"bit":2},{"op":"pencil","region":13,"bit":3}]},{"ops":[{"op":"pencil","region":16,"bit":0},{"op":"pencil","region":16,"bit":1}]},{"ops":[{"op":"color","region":17,"color":2}]}]',
    },
    /** Held on 141 of 2876 positions walked. */
    pairPlace: {
      id: "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
      moves:
        '[{"ops":[{"op":"pencil","region":3,"bit":1},{"op":"pencil","region":3,"bit":2}]},{"ops":[{"op":"pencil","region":6,"bit":1},{"op":"pencil","region":6,"bit":2}]}]',
    },
    /** Held on 217 of 2876 positions walked. */
    pairDot:
      "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
    /** Held on 21 of 2876 positions walked. */
    pairMark: {
      id: "15x20n30dh:nafahabcgceaaaaafabaaaaaaceagaccgckacbcadaabeaacbabccacabceccblaaadccdbcbabadbgacabadddbgaabbfbbcalbjccbbcebbafabaaababagacbeaaaccjaaabbbagciaeagbdjbceacecbfabaaaafabeaebbcbeaabaadabbadcbagbaar,b13d0e2c32f32a1",
      moves:
        '[{"ops":[{"op":"pencil","region":9,"bit":0},{"op":"pencil","region":9,"bit":1}]},{"ops":[{"op":"pencil","region":20,"bit":0},{"op":"pencil","region":20,"bit":1}]}]',
    },
    /** Held on 27 of 2876 positions walked. */
    chainPlace: {
      id: "15x20n30dh:dbcacasbbaaacagbacabgcabbeabhccadafebaiaacjacaaafadafcbaaaafaibahalbdbebbbabfheaaabdbadacabaaaaclaeaacmaaaaafacaeaecbcdaecbbaddbdaaaabacabcdaaaabcaabacabadabaaccaabaadaaaacabadakabeababbdcbbaabccbcaaabahageo,1021a0a1c20d0c01c2b3",
      moves:
        '[{"ops":[{"op":"pencil","region":8,"bit":2},{"op":"pencil","region":8,"bit":3}]},{"ops":[{"op":"pencil","region":14,"bit":2},{"op":"pencil","region":14,"bit":3}]},{"ops":[{"op":"color","region":15,"color":1}]},{"ops":[{"op":"pencil","region":23,"bit":2},{"op":"pencil","region":23,"bit":3}]},{"ops":[{"op":"color","region":24,"color":1}]},{"ops":[{"op":"pencil","region":25,"bit":0},{"op":"pencil","region":25,"bit":3}]},{"ops":[{"op":"pencil","region":18,"bit":0},{"op":"pencil","region":18,"bit":3}]}]',
    },
    /** Held on 2 of 2876 positions walked. */
    chainStrike: {
      id: "15x20n30dh:baiahalfgbfbeabbbahbbbaeaafaaeffcaaaabaedaabbacabacaabafaabaaacabbfabdfbaaacaabaebcbaacabbbdbbabbbcchaababhagfbajadaccbccdbcaaabbahacbabhabdcbabcbcabaaelababbaahbbbaadaaaccaacadaaajadacbacdaaaabacbamaaaabjbcaaahbbacae,10101e0i1a3a212011",
      moves:
        '[{"ops":[{"op":"color","region":18,"color":1}]},{"ops":[{"op":"color","region":19,"color":2}]},{"ops":[{"op":"color","region":23,"color":0}]},{"ops":[{"op":"color","region":17,"color":1}]},{"ops":[{"op":"color","region":14,"color":3}]},{"ops":[{"op":"pencil","region":5,"bit":2},{"op":"pencil","region":5,"bit":3}]},{"ops":[{"op":"pencil","region":9,"bit":2},{"op":"pencil","region":9,"bit":3}]},{"ops":[{"op":"pencil","region":8,"bit":0},{"op":"pencil","region":8,"bit":1}]},{"ops":[{"op":"pencil","region":12,"bit":1},{"op":"pencil","region":12,"bit":2}]},{"ops":[{"op":"pencil","region":11,"bit":0},{"op":"pencil","region":11,"bit":2}]},{"ops":[{"op":"pencil","region":6,"bit":0},{"op":"pencil","region":6,"bit":3}]},{"ops":[{"op":"pencil","region":7,"bit":0},{"op":"pencil","region":7,"bit":1},{"op":"pencil","region":7,"bit":3}]}]',
    },
    /** Held on 37 of 2876 positions walked. */
    chainMark: {
      id: "15x20n30dh:dbfaabsbaacabahbbcfafafbbcablbadabbabaaadbacicccadcaabacddcaacgasbaadbdabaebbcdbdbbahbhbabbabasdtbjaebdfabibccfabadbdaaakcbcacaaaadagbfadbbceacdbbaaaagaabhacaabaabdabaabaaacadcbdicadace,203a2b0b3c0a3a1d3a32201",
      moves:
        '[{"ops":[{"op":"color","region":3,"color":1}]},{"ops":[{"op":"color","region":22,"color":0}]},{"ops":[{"op":"color","region":24,"color":1}]},{"ops":[{"op":"pencil","region":5,"bit":1},{"op":"pencil","region":5,"bit":3}]},{"ops":[{"op":"pencil","region":6,"bit":1},{"op":"pencil","region":6,"bit":2}]},{"ops":[{"op":"pencil","region":17,"bit":2},{"op":"pencil","region":17,"bit":3}]}]',
    },
    /** Held on 128 of 2876 positions walked. */
    chainDot: {
      id: "15x20n30dh:dbfaabsbaacabahbbcfafafbbcablbadabbabaaadbacicccadcaabacddcaacgasbaadbdabaebbcdbdbbahbhbabbabasdtbjaebdfabibccfabadbdaaakcbcacaaaadagbfadbbceacdbbaaaagaabhacaabaabdabaabaaacadcbdicadace,203a2b0b3c0a3a1d3a32201",
      moves:
        '[{"ops":[{"op":"color","region":3,"color":1}]},{"ops":[{"op":"color","region":22,"color":0}]},{"ops":[{"op":"color","region":24,"color":1}]}]',
    },
    /** Held on 50 of 2876 positions walked. */
    chainWalk: {
      id: "15x20n30dh:dbfaabsbaacabahbbcfafafbbcablbadabbabaaadbacicccadcaabacddcaacgasbaadbdabaebbcdbdbbahbhbabbabasdtbjaebdfabibccfabadbdaaakcbcacaaaadagbfadbbceacdbbaaaagaabhacaabaabdabaabaaacadcbdicadace,203a2b0b3c0a3a1d3a32201",
      moves:
        '[{"ops":[{"op":"color","region":3,"color":1}]},{"ops":[{"op":"color","region":22,"color":0}]},{"ops":[{"op":"color","region":24,"color":1}]},{"ops":[{"op":"pencil","region":5,"bit":1},{"op":"pencil","region":5,"bit":3}]},{"ops":[{"op":"pencil","region":6,"bit":1},{"op":"pencil","region":6,"bit":2}]},{"ops":[{"op":"pencil","region":17,"bit":2},{"op":"pencil","region":17,"bit":3}]}]',
    },
    /** Held on 11 of 2876 positions walked. */
    chainAlternates: {
      id: "15x20n30dh:dbcacasbbaaacagbacabgcabbeabhccadafebaiaacjacaaafadafcbaaaafaibahalbdbebbbabfheaaabdbadacabaaaaclaeaacmaaaaafacaeaecbcdaecbbaddbdaaaabacabcdaaaabcaabacabadabaaccaabaadaaaacabadakabeababbdcbbaabccbcaaabahageo,1021a0a1c20d0c01c2b3",
      moves:
        '[{"ops":[{"op":"pencil","region":8,"bit":2},{"op":"pencil","region":8,"bit":3}]},{"ops":[{"op":"pencil","region":14,"bit":2},{"op":"pencil","region":14,"bit":3}]},{"ops":[{"op":"color","region":15,"color":1}]},{"ops":[{"op":"pencil","region":23,"bit":2},{"op":"pencil","region":23,"bit":3}]},{"ops":[{"op":"color","region":24,"color":1}]},{"ops":[{"op":"pencil","region":25,"bit":0},{"op":"pencil","region":25,"bit":3}]},{"ops":[{"op":"pencil","region":18,"bit":0},{"op":"pencil","region":18,"bit":3}]}]',
    },
    /** Held on 5 of 2876 positions walked. */
    chainLongWalk: {
      id: "15x20n30dh:fadcceaamabbiaabbacdbaacaccbcagbbccceacaabbbbacaiaacabgacbbacbbaaacebabacaiejasbabgcbceacdbabaaacacababcbbcafchcffaabaadcafebabcabcbaadaacddebjaacbahaabbaaebcaaaeacdahdcceadbaabacebaeabakbobiacafaa,1a2d0013g03a3a103b12",
      moves:
        '[{"ops":[{"op":"color","region":1,"color":3}]},{"ops":[{"op":"color","region":27,"color":2}]},{"ops":[{"op":"color","region":22,"color":0}]},{"ops":[{"op":"color","region":20,"color":2}]},{"ops":[{"op":"color","region":26,"color":3}]},{"ops":[{"op":"pencil","region":4,"bit":0},{"op":"pencil","region":4,"bit":2}]},{"ops":[{"op":"pencil","region":5,"bit":1},{"op":"pencil","region":5,"bit":2}]},{"ops":[{"op":"pencil","region":6,"bit":1},{"op":"pencil","region":6,"bit":2}]},{"ops":[{"op":"pencil","region":13,"bit":1},{"op":"pencil","region":13,"bit":2}]},{"ops":[{"op":"pencil","region":17,"bit":0},{"op":"pencil","region":17,"bit":1}]},{"ops":[{"op":"pencil","region":11,"bit":2},{"op":"pencil","region":11,"bit":3}]},{"ops":[{"op":"pencil","region":15,"bit":0},{"op":"pencil","region":15,"bit":3}]}]',
    },
    /** Held on 40 of 2876 positions walked. */
    fill: "10x10n12de:dabcacaacbddccgacaacdaaaebaaaabaaaeabaaaeabbadcbadbafabaaababababbddaacadbcaaadabagaa,a103a21b1a1",
    /** Held on 191 of 2876 positions walked. */
    clean: {
      id: "10x10n12de:dabcacaacbddccgacaacdaaaebaaaabaaaeabaaaeabbadcbadbafabaaababababbddaacadbcaaadabagaa,a103a21b1a1",
      moves:
        '[{"ops":[{"op":"pencil","region":0,"bit":0},{"op":"pencil","region":0,"bit":1},{"op":"pencil","region":0,"bit":2},{"op":"pencil","region":0,"bit":3},{"op":"pencil","region":4,"bit":0},{"op":"pencil","region":4,"bit":1},{"op":"pencil","region":4,"bit":2},{"op":"pencil","region":4,"bit":3},{"op":"pencil","region":7,"bit":0},{"op":"pencil","region":7,"bit":1},{"op":"pencil","region":7,"bit":2},{"op":"pencil","region":7,"bit":3},{"op":"pencil","region":8,"bit":0},{"op":"pencil","region":8,"bit":1},{"op":"pencil","region":8,"bit":2},{"op":"pencil","region":8,"bit":3},{"op":"pencil","region":10,"bit":0},{"op":"pencil","region":10,"bit":1},{"op":"pencil","region":10,"bit":2},{"op":"pencil","region":10,"bit":3}]}]',
    },
    /** Held on 2876 of 2876 positions walked. */
    onlyColorLeft:
      "15x20n30de:gaabgbaadaeabadccafbccecgacagbhaacgcamaacadacbacaaaagadamaaacbaaibbaabbdibdaccdbaicaabiclaaaddbdlagdvaedbhfabcaacagagaccdacabaabcjaeadcadacakaaaldaabafabbbaaadababaaabcmbbcgbdbbabc,23a2e03d2b3b2a01b3a0",
    /** Held on 940 of 2876 positions walked. */
    sharedPair:
      "15x20n30dn:kadeeacalbaadbaddacaaaacedabcdaacadbaaaababbdabaabdbddaaadiaaaaabaabaacaaabaaaabadaaabfcacbacafbbacaccbaebbaeaccbadaacebcahabaaababaaagbaaccaaiccbcefblcabaaabcaabeaaebbabeaadaaaaeadbdbaaaahaabaaabgaabgbadaaaaecbacaaadaaaeaaaaciacdgadacah,0a1f302c3c01d21a3a",
    /** Held on 547 of 2876 positions walked. */
    forcingChain: {
      id: "15x20n30dh:dbfaabsbaacabahbbcfafafbbcablbadabbabaaadbacicccadcaabacddcaacgasbaadbdabaebbcdbdbbahbhbabbabasdtbjaebdfabibccfabadbdaaakcbcacaaaadagbfadbbceacdbbaaaagaabhacaabaabdabaabaaacadcbdicadace,203a2b0b3c0a3a1d3a32201",
      moves:
        '[{"ops":[{"op":"color","region":3,"color":1}]},{"ops":[{"op":"color","region":22,"color":0}]},{"ops":[{"op":"color","region":24,"color":1}]}]',
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
  chainTrim: "a chain's region the player dotted with a color a neighbor shows",
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
  pairStrike: /^The outlined pair .* must go\.$/,
  chainTrim: /^Region \d+ of the numbered chain has other dots/,
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

  it("chainTrim: a chain region carrying a dead dot loses it before the chain", () => {
    const { state: before, step } = pinned("chainDot");
    const r = step.highlights?.targets[0] as number;
    // Dot every color on it, as a player marking "anything" would.
    const dotted = [0, 1, 2, 3].reduce(
      (s, bit) => mapGame.executeMove(s, { ops: [{ op: "pencil", region: r, bit }] }),
      before,
    );
    const trims = spoken(dotted).filter(
      ({ step, arms }) =>
        step.highlights?.targets[0] === r && arms.includes("chainTrim"),
    );
    expect(trims).toHaveLength(1);
    expect(trims[0].step.explanation).toMatch(BUILT_WORDS.chainTrim);
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
        } else if (arm === "pairDot" || arm === "pairTrim") {
          // One of the pair, ringed, dotted with exactly its two colors, and
          // nothing outlined: the leg writes the pair's premise, and the other
          // region's dots may not be on the board yet.
          expect(ev).toEqual([]);
          expect(bits(left(s, t))).toBe(2);
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
          expect(evidenceOf(step).map((e) => e.order)).toEqual(ev.map((_, i) => i + 1));
          for (let i = 0; i + 1 < ev.length; i++)
            expect(adjacent(s, ev[i], ev[i + 1])).toBe(true);
          for (const e of ev) {
            expect(bits(left(s, e))).toBe(2);
            expect(s.pencil[e], "a chain region shows its two dots").toBe(left(s, e));
          }
          expect(adjacent(s, t, ev[0])).toBe(true);
          expect(adjacent(s, t, ev[ev.length - 1])).toBe(true);
          expect(ev).not.toContain(t);
          // What the sentence says about the dots is what they show: every
          // color the walk names is one of that region's dots, and "every
          // numbered region has a red dot" is true of every one.
          const COLORS = ["red", "yellow", "teal", "violet"];
          // The walk as named: region 1's color from "it's X", then each
          // "region k is Y". Every one is a dot of its region, and each differs
          // from the one before, which is the whole of "takes the dot the one
          // before it leaves": two dots each, one shared.
          const first = /^If region 1 isn't \w+, it's (\w+)/.exec(step.explanation);
          if (first) {
            const named = [COLORS.indexOf(first[1])];
            for (const m of step.explanation.matchAll(
              /region (\d+) is (\w+)(?=[,. ]| and)/g,
            ))
              if (Number(m[1]) === named.length + 1) named.push(COLORS.indexOf(m[2]));
            named.forEach((c, i) => {
              expect(s.pencil[ev[i]] & (1 << c), step.explanation).toBeGreaterThan(0);
              if (i > 0) expect(c, step.explanation).not.toBe(named[i - 1]);
            });
            // A listed walk reaches the last region, on the struck color.
            if (named.length > 1) {
              const struck = /^If region 1 isn't (\w+)/.exec(step.explanation)?.[1];
              expect(named).toHaveLength(ev.length);
              expect(COLORS[named[named.length - 1]]).toBe(struck);
            }
          }
          const all = /^Every numbered region has a (\w+) dot/.exec(step.explanation);
          if (all)
            for (const e of ev)
              expect(s.pencil[e] & (1 << COLORS.indexOf(all[1]))).toBeGreaterThan(0);
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
  it("a chain's regions carry their numbers, and the target its band", () => {
    const { recording, hint } = renderPinnedHint(mapGame, pinned("chainMark"));
    const rgb = (c: readonly number[]) =>
      `rgb(${c.map((v) => Math.round(v * 255)).join(", ")})`;
    const numbers = new Set(
      recording.ops.flatMap((o) =>
        o.op === "text" && o.rgb === rgb(HINT_EVIDENCE) ? [o.text] : [],
      ),
    );
    expect([...numbers].sort()).toEqual(
      evidenceOf(hint as MapHintStep)
        .map((e) => String(e.order))
        .sort(),
    );
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

describe("map's Mark-all press and the populate reading", () => {
  const mPress = (s: MapState): MapMove | null => {
    const m = mapGame.interpretMove(
      s,
      mapGame.newUi(s),
      preferredDrawState(mapGame, s),
      { x: 0, y: 0 },
      77, // 'M', as the toolbar button sends it
    );
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
