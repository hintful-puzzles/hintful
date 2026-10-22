/**
 * Net's hint (`add-net-hint`): a plan that finishes every board the generator
 * deals, soundly; keep-track on a turn and a lock; the refusal on a mistake;
 * and the marks on the frame.
 *
 * "Every generated board is hinted to the end, every step agreeing with the
 * solution" is the property that stands in for the byte-match on the seeds
 * where the generator now leaves upstream (`net-differential.test.ts`).
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { presetMenu } from "../../engine/param-label.ts";
import { randomNew } from "../../engine/random/index.ts";
import { anticlockwise, clockwise } from "../../engine/square-edges.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { Facts, nextStep } from "./deduce.ts";
import { newDesc } from "./generator.ts";
import type { NetHint, NetRung } from "./hint.ts";
import { netGame } from "./index.ts";
import { COL_HINT } from "./render.ts";
import { answerOf, netSolver, SOLVER_UNIQUE, solverFinishes } from "./solver.ts";
import {
  LOCKED,
  type NetMove,
  type NetParams,
  type NetState,
  NOTE_WIRE,
  newState,
  newUi,
  sideIndex,
} from "./state.ts";

function board(p: NetParams, seed: string) {
  const { desc, aux } = newDesc(p, randomNew(seed));
  return {
    id: `${netGame.encodeParams(p, true)}:${desc}`,
    state: newState(p, desc),
    solution: Uint8Array.from(aux ?? "", (c) => Number.parseInt(c, 16)),
  };
}

type TurnHint = Exclude<NetHint, { kind: "note" }>;

const plan = (s: NetState) => {
  const r = netGame.hint?.(s, undefined, newUi(s));
  if (!r?.ok) throw new Error(`no hint: ${r?.error}`);
  return r.steps;
};

const W5: NetParams = {
  w: 5,
  h: 5,
  wrapping: true,
  barrierProbability: 0,
  diff: DIFF_EASY,
};

/** Two boards the solver stops on and the hint finishes. On the first a T,
 * turned one way, leaves the straight beside it no way to turn. On the second
 * no turning does that, and a T is settled by the group it would seal off
 * once its own wires are counted. */
const STRANDS = "5x5:81924a3be3be5731bb848cca2";
const SEALS_IN_PLACE = "5x5:64432a4be63e6364eb7815332";

/** The steps the tests below read, each pinned on a position whose hint opens
 * with one. */
const pinned = describeHintPins({
  game: netGame,
  params: [{ w: 5, h: 5, wrapping: false, barrierProbability: 0, diff: DIFF_EASY }, W5],
  seeds: 40,
  kinds: {
    turn: (step) => step.highlights?.kind === "turn",
    // A square's turnings read off the loops they would close as well as off
    // its sides. No mark tells it from a group a wire merely runs on into, so
    // the board's own next deduction is asked.
    loopOnTheWay: (step, state) =>
      step.rung === "sealed" &&
      (nextStep(new Facts(state))?.because.some(
        (b) => b.why.kind === "sealed" && b.why.barLoops,
      ) ??
        false),
  },
  pins: {
    /** Held on 1454 of 3618 positions walked. */
    turn: "5x5:2a5e482a79d77eb51aa568818",
    /** Held on 2 of 3618 positions walked. */
    loopOnTheWay: {
      id: "5x5w:473d4acd331eb98138cc37198",
      moves:
        '[{"type":"rotate","op":"A","x":0,"y":1},{"type":"lock","x":0,"y":1},{"type":"note","x":1,"y":1,"dir":1,"note":2},{"type":"rotate","op":"A","x":2,"y":1},{"type":"lock","x":2,"y":1},{"type":"note","x":3,"y":1,"dir":1,"note":2},{"type":"lock","x":0,"y":2},{"type":"note","x":4,"y":0,"dir":1,"note":2},{"type":"note","x":4,"y":4,"dir":8,"note":2},{"type":"note","x":2,"y":3,"dir":8,"note":2},{"type":"note","x":4,"y":3,"dir":1,"note":2},{"type":"note","x":3,"y":3,"dir":1,"note":1},{"type":"note","x":0,"y":4,"dir":1,"note":1},{"type":"note","x":4,"y":4,"dir":1,"note":2}]',
    },
    /** Held on 3618 of 3618 positions walked. */
    side: "5x5:2a5e482a79d77eb51aa568818",
    /** Held on 423 of 3618 positions walked. */
    loop: {
      id: "5x5w:5ad241a7a81ebc3ce3d8c3914",
      moves:
        '[{"type":"rotate","op":"F","x":4,"y":0},{"type":"lock","x":4,"y":0},{"type":"lock","x":0,"y":0},{"type":"rotate","op":"A","x":1,"y":0},{"type":"lock","x":1,"y":0},{"type":"rotate","op":"A","x":1,"y":1},{"type":"lock","x":1,"y":1},{"type":"lock","x":0,"y":1},{"type":"rotate","op":"A","x":1,"y":2},{"type":"lock","x":1,"y":2},{"type":"lock","x":0,"y":2},{"type":"note","x":3,"y":2,"dir":1,"note":1},{"type":"note","x":0,"y":3,"dir":8,"note":1},{"type":"note","x":1,"y":3,"dir":8,"note":1},{"type":"rotate","op":"F","x":4,"y":4},{"type":"lock","x":4,"y":4},{"type":"rotate","op":"C","x":0,"y":4},{"type":"lock","x":0,"y":4},{"type":"lock","x":1,"y":4},{"type":"note","x":2,"y":4,"dir":1,"note":2}]',
    },
    /** Held on 607 of 3618 positions walked. */
    sealed: "5x5w:3325223c386e7a755e354585a",
    /** Kept by hand, where the step opens the plan. The scan deals no board
     * like it: the hint finishes this one and the solver does not, so it is
     * neither an Easy deal nor an Unreasonable one. */
    neighbor: {
      id: STRANDS,
      moves:
        '[{"type":"lock","x":0,"y":1},{"type":"rotate","op":"A","x":3,"y":4},{"type":"lock","x":3,"y":4},{"type":"note","x":2,"y":0,"dir":8,"note":1},{"type":"note","x":3,"y":1,"dir":1,"note":1},{"type":"note","x":3,"y":2,"dir":1,"note":1},{"type":"note","x":1,"y":3,"dir":8,"note":1},{"type":"lock","x":0,"y":0},{"type":"lock","x":0,"y":2},{"type":"rotate","op":"A","x":0,"y":3},{"type":"lock","x":0,"y":3},{"type":"lock","x":1,"y":3},{"type":"rotate","op":"A","x":0,"y":4},{"type":"lock","x":0,"y":4},{"type":"rotate","op":"C","x":1,"y":4},{"type":"lock","x":1,"y":4},{"type":"rotate","op":"F","x":2,"y":4},{"type":"lock","x":2,"y":4},{"type":"rotate","op":"A","x":4,"y":4},{"type":"lock","x":4,"y":4},{"type":"note","x":1,"y":1,"dir":1,"note":1},{"type":"rotate","op":"A","x":4,"y":0},{"type":"lock","x":4,"y":0},{"type":"rotate","op":"A","x":4,"y":1},{"type":"lock","x":4,"y":1},{"type":"rotate","op":"F","x":4,"y":2},{"type":"lock","x":4,"y":2},{"type":"rotate","op":"C","x":4,"y":3},{"type":"lock","x":4,"y":3}]',
    },
  },
});

describe("the plan", () => {
  // The Easy boards: an Unreasonable one is where the plan stops short
  // (`net-tier.test.ts`).
  for (const item of presetMenu(netGame).submenu ?? []) {
    const p = item.params as NetParams;
    if (p.diff !== DIFF_EASY) continue;
    it(`${item.title}: finishes the board, every step agreeing with the solution`, () => {
      const { state, solution } = board(p, `net-hint-${item.title}`);
      let s = state;
      for (const step of plan(state)) {
        const m = step.move;
        if (m.type === "note")
          expect((solution[m.y * p.w + m.x] & m.dir) !== 0).toBe(m.note === NOTE_WIRE);
        s = netGame.executeMove(s, m);
        if (m.type === "lock")
          expect(s.tiles[m.y * p.w + m.x] & 0xf).toBe(solution[m.y * p.w + m.x] & 0xf);
      }
      expect(s.tiles.every((t) => t & LOCKED)).toBe(true);
      expect(netGame.status(s)).toBe("solved");
    });
  }
});

describe("boards the solver settles", () => {
  /** The plan's sentences on `desc`, each step checked against the solver's
   * answer, and the board it leaves. */
  function follow(p: NetParams, desc: string) {
    const state = newState(p, desc);
    const solution = Uint8Array.from(state.tiles, (t) => t & 0xf);
    expect(netSolver(p.w, p.h, solution, state.barriers, p.wrapping)).toBe(
      SOLVER_UNIQUE,
    );
    let s = state;
    const said: string[] = [];
    for (const step of plan(state)) {
      const m = step.move;
      said.push(step.explanation);
      if (m.type === "note")
        expect((solution[m.y * p.w + m.x] & m.dir) !== 0).toBe(m.note === NOTE_WIRE);
      s = netGame.executeMove(s, m);
      if (m.type === "lock")
        expect(s.tiles[m.y * p.w + m.x] & 0xf).toBe(solution[m.y * p.w + m.x] & 0xf);
    }
    return { said, solved: netGame.status(s) === "solved" };
  }

  it("follows a wire through squares not settled yet", () => {
    // Upstream's board for the seed "net-trace-4". A dead end, two straights
    // and a dead end stand in one column: upright, the straight joins all
    // four and nothing else, though no wire between them is known. No pin: the
    // sentence opened none of 3618 hints over 80 boards dealt today.
    const { said, solved } = follow(W5, "19d7aaae8449d5636cad43c44");
    expect(solved).toBe(true);
    expect(said).toContain(
      "Standing upright, this straight would lead only into the striped squares, which end its wire however they turn, so it must stay across: lock it.",
    );
  });

  it("counts out a turning that would close a loop on the way", () => {
    // A board the hint finishes only by reading a square's turnings off the
    // loops they would close as well as off its sides.
    const { id } = pinned("loopOnTheWay");
    const { said, solved } = follow(W5, id.slice(id.indexOf(":") + 1));
    expect(solved).toBe(true);
    expect(
      said.some((t) => t.includes("which end or loop its wire however they turn")),
    ).toBe(true);
  });
});

describe("a square looked at as turned", () => {
  /** The rungs of the plan on a pasted board, each step checked against the
   * answer the search finds, and whether the plan finishes the board. */
  function follow(id: string) {
    const colon = id.indexOf(":");
    const p = netGame.decodeParams(id.slice(0, colon));
    const state = newState(p, id.slice(colon + 1));
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error(`${id}: no one answer`);
    const { solution } = answer;
    let s = state;
    const rungs = new Set<NetRung>();
    for (const step of plan(state)) {
      const m = step.move;
      if (step.rung) rungs.add(step.rung);
      if (m.type === "note")
        expect((solution[m.y * p.w + m.x] & m.dir) !== 0).toBe(m.note === NOTE_WIRE);
      s = netGame.executeMove(s, m);
      if (m.type === "lock")
        expect(s.tiles[m.y * p.w + m.x] & 0xf).toBe(solution[m.y * p.w + m.x]);
    }
    return { state, rungs, solved: netGame.status(s) === "solved" };
  }

  it("rules out a turning that leaves the square beside it no way to turn", () => {
    const { state, step } = pinned("neighbor");
    // The T at 1,2, pointing up, down and left, has no wire for the straight
    // at 2,2 to lie across to; upright, the straight joins 2,1 to 2,3, which
    // the T then joins already, by way of 1,1 and 1,3.
    const next = nextStep(new Facts(state));
    const cited = next?.because.map((b) => b.why).find((w) => w.kind === "neighbor");
    if (next?.kind !== "lock" || cited?.kind !== "neighbor")
      throw new Error("the plan does not open with a lock that cites a neighbor");
    expect([next.at, cited.at]).toEqual([2 * 5 + 1, 2 * 5 + 2]);
    expect(cited.ways.map((w) => w.why.kind).sort()).toEqual(["loop", "side"]);

    const marks = stepMarks(step);
    const keys = (points: readonly { x: number; y: number }[]) =>
      points.map((p) => `${p.x},${p.y}`).sort();
    expect(keys(marks.of("ring", CELL))).toEqual(["1,2"]);
    expect(keys(marks.of("outline", CELL))).toContain("2,2");
    expect(keys(marks.of("stripes", CELL))).toEqual(["1,1", "1,3", "2,1", "2,3"]);
  });

  it("finishes a board the solver stops on", () => {
    for (const id of [STRANDS, SEALS_IN_PLACE]) {
      const { state, rungs, solved } = follow(id);
      expect(solverFinishes(state), id).toBe(false);
      expect(solved, id).toBe(true);
      // The second board has no step of the first's kind, so what finishes
      // it is the sealed group.
      expect(rungs.has("neighbor"), id).toBe(id === STRANDS);
    }
  });
});

describe("keep-track", () => {
  it("a turn the other way round is on track, and the step asks for the rest", () => {
    const { state: s, step } = pinned("turn");
    const h = step.highlights as TurnHint;
    const now = s.tiles[h.at.y * s.w + h.at.x] & 0xf;
    const wrongWay: NetMove =
      anticlockwise(now) === h.wires
        ? { type: "rotate", op: "C", x: h.at.x, y: h.at.y }
        : { type: "rotate", op: "A", x: h.at.x, y: h.at.y };
    const copy: HintStep<NetMove, NetHint, NetRung> = { ...step };
    const turned =
      wrongWay.type === "rotate" && wrongWay.op === "A"
        ? anticlockwise(now)
        : clockwise(now);
    const verdict = netGame.hintKeepTrack?.(wrongWay, copy, s);
    if (turned === h.wires) expect(verdict).toBe("completed");
    else {
      expect(verdict).toBe("onTrack");
      const after = netGame.executeMove(s, wrongWay);
      const rest = netGame.executeMove(after, copy.move);
      expect(rest.tiles[h.at.y * s.w + h.at.x] & 0xf).toBe(h.wires);
    }
  });

  it("the step's own move completes it; a move elsewhere drops the plan", () => {
    const { state: s, step } = pinned("turn");
    expect(netGame.hintKeepTrack?.(step.move, step, s)).toBe("completed");
    const h = step.highlights as TurnHint;
    const elsewhere: NetMove = { type: "lock", x: (h.at.x + 1) % s.w, y: h.at.y };
    expect(netGame.hintKeepTrack?.(elsewhere, step, s)).toBe("off");
  });
});

describe("refusal and marks", () => {
  const P: NetParams = {
    w: 5,
    h: 5,
    wrapping: false,
    barrierProbability: 0,
    diff: DIFF_EASY,
  };

  it("flags a wrong note, so the midend refuses a hint", () => {
    const { state, solution } = board(P, "net-refuse");
    const crosses = (solution[12] & 1) !== 0;
    const lie = netGame.executeMove(state, {
      type: "note",
      x: 2,
      y: 2,
      dir: 1,
      note: crosses ? 2 : 1,
    });
    expect(lie.sides[sideIndex(lie, 2, 2, 1)]).not.toBe(0);
    expect(netGame.findMistakes?.(lie).length ?? 0).toBeGreaterThan(0);
  });

  it("rings the square a step turns and locks, in the hint color", () => {
    const r = renderScenario({
      game: netGame,
      id: "5x5:299511de1166b536dbb1861b2",
      showHint: true,
    });
    expect(r.hint).toBeDefined();
    expect(r.recording.ops.some((o) => "color" in o && o.color === COL_HINT)).toBe(
      true,
    );
    expect(r.recording.ops).toMatchSnapshot();
  });
});
