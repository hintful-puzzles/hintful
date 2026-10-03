/**
 * Sokoban's solver, Solve and hint (`judge-rivals-for-search-hints`).
 *
 * Each sentence the hint says on generated boards is pinned by a position it
 * fires on, found by a fixed-seed scan over hint-guided play on 10×12 boards
 * (2026-10-03), so a change to the generator cannot quietly stop a branch
 * being exercised. The refusals are small boards built by hand.
 */

import { describe, expect, it } from "vitest";
import { isDeadEnd } from "../../engine/hint-refusal.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  bindingDefects,
  deadEndBindingDefects,
} from "../../engine/testing/hint-binding.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { hint, hintKeepTrack, pushMove, routeTo } from "./hint.ts";
import { BARREL, PUSH } from "./hint-text.ts";
import { executeMove, sokobanGame } from "./index.ts";
import { SokobanBoard, search, searchFrom } from "./solver.ts";
import { encodeBoard, type SokobanState, status } from "./state.ts";

const G = sokobanGame;

function load(id: string): SokobanState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

const PINNED = {
  /** This barrel's other push would jam it against a barrel and a wall. */
  trapFrozen:
    "10x12:w11fs3tstfw2us3bsbfw2sfsbs3tw2tsts3btw2bts2btb2w2sbs2bs3w2st2s3fsw2sbsfbs3w2s4tbt2w3fs4f2w11",
  /** This barrel's other push would freeze a barrel beside it. */
  trapVictim:
    "10x12:w11fs4fs2w2stwbsusbw2sbwtbtstw2s3tbs2w3fw3s4w2fs4fs2w2s5fwfw2s2fs3wfw2fws6w3fs2w2s2w11",
  /** This barrel's other push would wedge it in a corner. */
  trapCorner:
    "10x12:w11fs4fs2w2sfws4bw2s2wfsfstw2s3fus2w3fw3s4w2fs4fs2w2s5fwfw2s2fs3wfw2fws6w3fs2w2s2w11",
  /** This barrel's other push would leave it where no target can be reached. */
  trapDead:
    "10x12:w11f3sfs2fw2s2fs4fw2f2s4fsw2sfsfs4w2s4fs3w2s3fs4w2s2f2sfsfw2f2s3us2w2tbs2ftbsw2s8w11",
  /** Every other push of this barrel settled: one more finishes, one cannot. */
  onlyThese:
    "10x12:w11fs2f2w5fs2ws3fw2s7w4s2usbs2w2tbsfs2bsw2tbswst2bw4s2ws2tw3tbsws2fw6f2s2w8s2w11",
  /** Nothing settled worth saying; the push lands on a target. */
  onTarget:
    "10x12:w11tsbstst2w2bsub2sbfw2sfs5tw2tsts2bstw2bts2btb2w2sbs2bs3w2st2bs2fsw2sbstbs3w2s2bsfsftw3ts4ftw11",
  /** Nothing settled worth saying, and the push lands on floor. */
  plain:
    "10x12:w11vbs2tst2w2bsbsbsbfw2sfs5tw2tsts2bstw2bts2btb2w2sbs2bs3w2st2bs2fsw2sbstbs3w2s2bsfsftw3ts4ftw11",
};

/** Pushing first pushes alone, a barrel here went up and then back down for
 * ever (`judge-rivals-for-search-hints` design D3). */
const CYCLED =
  "16x20:w17s2w3tw10btsbsbwtw8ts6bw3tw5twtsws5bw5bwbsw5s2tw3s6btw4bw3sbswsw5tbsw3fvbtsw5tws2w2sbw2sw2sbtbs2bw2stswsw2sts3wtw2sbt2sw2sb2ts2w3sbtbsw2s2wtbsw3bs7btbtw4twsws2wsbtwtw6swsbws2tsbw6swbts3bs2w5s2wtws6w5sbtwtbswtbsw19";

/** A barrel in a corner off its target, beside the target it needed. */
const CORNERED = "5x4:w6bsuw2stsw6";
/** Two barrels side by side under a wall, the left one a push from its target
 * on an empty board: each holds the other still. */
const FROZEN = "6x4:w7tb2uw2s2tsw7";

function step(id: string) {
  const s = load(id);
  const r = hint(s);
  if (!r.ok) throw new Error(`${id}: ${r.error}`);
  return { s, step: r.steps[0] };
}

describe("the hint's sentences", () => {
  const cases: [keyof typeof PINNED, RegExp][] = [
    [
      "trapFrozen",
      /^This barrel's striped push would jam it so it can never move\. One way to avoid that: push it (left|right|up|down)\.$/,
    ],
    [
      "trapVictim",
      /^This barrel's striped push would jam the outlined barrel so it can never move\. One way to avoid that: push it \w+\.$/,
    ],
    [
      "trapCorner",
      /^This barrel's striped push would wedge it in a corner it can never leave\. One way to avoid that: push it \w+\.$/,
    ],
    [
      "trapDead",
      /^This barrel's striped push would leave it where no push can bring it to a target\. One way to avoid that: push it \w+\.$/,
    ],
    [
      "onlyThese",
      /^This barrel can still finish only along the arrows\. One of them: push it \w+\.$/,
    ],
    ["onTarget", /^Push this barrel \w+: that puts it on a target\.$/],
    ["plain", /^Push this barrel \w+\.$/],
  ];
  for (const [name, words] of cases) {
    it(`${name}: says what it checked, and draws what it says`, () => {
      const { s, step: st } = step(PINNED[name]);
      expect(st.explanation).toMatch(words);
      expect(bindingDefects(G, s, G.newUi(s), st)).toEqual([]);
      // The push is the board's to make, and leaves a board that still finishes.
      const after = G.executeMove(s, st.move);
      expect(search(after, 100_000).kind).toBe("found");
    });
  }

  it("stripes a push of the ringed barrel that really strands one", () => {
    const { s, step: st } = step(PINNED.trapCorner);
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const [striped] = marks.of("stripes", PUSH);
    expect(striped.barrel).toBe(ringed.barrel);
    const board = new SokobanBoard(s);
    const after = board.apply(board.positionOf(s), striped);
    expect(board.stuckBarrels(after)).not.toEqual([]);
  });

  it("draws arrows on the ringed barrel's pushes that finish, its own among them", () => {
    const { s, step: st } = step(PINNED.onlyThese);
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const arrows = marks.of("outline", PUSH);
    expect(arrows.length).toBeGreaterThan(1);
    expect(arrows.every((a) => a.barrel === ringed.barrel)).toBe(true);
    expect(arrows).toContainEqual(ringed);
    // Each arrow's push leaves a board the search still finishes.
    const board = new SokobanBoard(s);
    for (const a of arrows) {
      const after = board.apply(board.positionOf(s), a);
      expect(searchFrom(board, after, 100_000, { left: Infinity }).kind).toBe("found");
    }
  });
});

describe("refusals", () => {
  it("outlines a barrel already stuck, and asks to undo", () => {
    for (const [id, words] of [
      [CORNERED, /^The outlined barrel is wedged in a corner it can never leave\./],
      [FROZEN, /^The outlined barrel is jammed/],
    ] as const) {
      const s = load(id);
      const r = hint(s);
      if (r.ok || !r.words) throw new Error(`${id}: expected a marked refusal`);
      expect(r.error).toMatch(words);
      expect(isDeadEnd(r.error)).toBe(true);
      expect(deadEndBindingDefects(G, s, G.newUi(s), r)).toEqual([]);
      expect(stepMarks(r).of("outline", BARREL).length).toBe(1);
    }
  });
});

describe("following the hint", () => {
  it("never comes back to a position, where first pushes alone cycled", () => {
    let s = load(CYCLED);
    const seen = new Set<string>();
    let pushes = 0;
    while (status(s) !== "solved") {
      const key = encodeBoard(s);
      expect(seen.has(key), `back at a position after ${pushes} pushes`).toBe(false);
      seen.add(key);
      const r = hint(s);
      expect(r.ok, `refused after ${pushes} pushes`).toBe(true);
      if (!r.ok) return;
      s = executeMove(s, r.steps[0].move);
      pushes++;
    }
    expect(pushes).toBeGreaterThan(20);
  });

  it("keeps the step while the player walks, completes on its push, drops any other", () => {
    const { s, step: st } = step(PINNED.plain);
    const want = st.move;
    if (want.type !== "push") throw new Error("a hint step is a push");
    const route = routeTo(s, want);
    let at = s;
    for (const m of route.slice(0, -1)) {
      expect(hintKeepTrack(m, st, at)).toBe("onTrack");
      at = executeMove(at, m);
    }
    expect(hintKeepTrack(route[route.length - 1], st, at)).toBe("completed");
    // The walked route and the hint's own move reach the same board.
    expect(encodeBoard(executeMove(at, route[route.length - 1]))).toBe(
      encodeBoard(executeMove(s, want)),
    );
  });
});

describe("Solve", () => {
  it("leaves the finished board, from the dealt one when the player's is lost", () => {
    const s = load(PINNED.onTarget);
    const r = G.solve?.(s, s);
    expect(r?.ok).toBe(true);
    if (!r?.ok) return;
    expect(status(executeMove(s, r.move))).toBe("solved");

    // A lost position, the trap's striped push made, falls back on the board
    // as dealt.
    const { s: deal, step: trap } = step(PINNED.trapCorner);
    const [striped] = stepMarks(trap).of("stripes", PUSH);
    const lost = executeMove(deal, pushMove(deal.w, striped));
    expect(hint(lost).ok).toBe(false);
    const back = G.solve?.(deal, lost);
    expect(back?.ok).toBe(true);
    if (back?.ok) expect(status(executeMove(lost, back.move))).toBe("solved");
  });

  it("refuses a board on different walls", () => {
    const s = load(PINNED.plain);
    expect(() => executeMove(s, { type: "solve", board: "w6s2uw2btsw6" })).toThrow();
  });
});

describe("rendering the marks (tier 2.5)", () => {
  // COL_HINT and COL_HINT_EVIDENCE.
  const COL_HINT = 13;
  const COL_HINT_EVIDENCE = 14;
  const rings = (ops: readonly { op: string }[], color: number) =>
    ops.filter((o) => {
      const c = o as { op: string; fill?: number; outline?: number };
      return c.op === "circle" && c.fill === -1 && c.outline === color;
    }).length;

  it("rings the barrel and its square, and stripes the trap's two squares", () => {
    const { recording } = renderScenario({
      game: G,
      id: PINNED.trapCorner,
      showHint: true,
    });
    // Two strokes per ring.
    expect(rings(recording.ops, COL_HINT)).toBe(4);
    expect(recording.ops.filter((o) => o.op === "hatch").length).toBe(2);
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws an arrow for each push that finishes", () => {
    const { recording, hint: st } = renderScenario({
      game: G,
      id: PINNED.onlyThese,
      showHint: true,
    });
    const arrows = st ? stepMarks(st).of("outline", PUSH).length : 0;
    // Each arrow spans two squares, which paint its piece each.
    const heads = recording.ops.filter(
      (o) => o.op === "polygon" && o.fill === COL_HINT_EVIDENCE,
    ).length;
    expect(arrows).toBeGreaterThan(1);
    expect(heads).toBe(2 * arrows);
  });
});
