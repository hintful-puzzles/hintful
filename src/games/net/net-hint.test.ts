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
import type { HintStep } from "../../engine/game.ts";
import { presetMenu } from "../../engine/param-label.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { anticlockwise, clockwise } from "../../engine/wires.ts";
import { Facts, nextStep } from "./deduce.ts";
import { newDesc } from "./generator.ts";
import type { NetHint, NetRung } from "./hint.ts";
import { netGame } from "./index.ts";
import { COL_HINT } from "./render.ts";
import { netSolver, SOLVER_UNIQUE } from "./solver.ts";
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

const W5: NetParams = { w: 5, h: 5, wrapping: true, barrierProbability: 0 };

/** The steps the tests below read, each pinned on a position whose hint opens
 * with one. */
const pinned = describeHintPins({
  game: netGame,
  params: [{ w: 5, h: 5, wrapping: false, barrierProbability: 0 }, W5],
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
  },
});

describe("the plan", () => {
  for (const item of presetMenu(netGame).submenu ?? []) {
    it(`${item.title}: finishes the board, every step agreeing with the solution`, () => {
      const p = item.params as NetParams;
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
      "Standing upright, this straight would lead only into the striped squares, where its wire must stop however they turn, sealing them off from the rest, so it must stay across: lock it.",
    );
  });

  it("counts out a turning that would close a loop on the way", () => {
    // A board the hint finishes only by reading a square's turnings off the
    // loops they would close as well as off its sides.
    const { id } = pinned("loopOnTheWay");
    const { said, solved } = follow(W5, id.slice(id.indexOf(":") + 1));
    expect(solved).toBe(true);
    expect(
      said.some((t) => t.includes("however they turn without closing a loop")),
    ).toBe(true);
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
