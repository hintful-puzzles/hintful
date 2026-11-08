/**
 * Net's hint: the ladder walked from the player's facts, finishing every
 * board the generator deals, soundly; the words of a step that reads a
 * square as turned; keep-track on a turn and a lock; the refusal on a
 * mistake; and the marks on the frame.
 *
 * "Every generated board is hinted to the end, every step agreeing with the
 * solution" is the property that stands in for the byte-match the generator
 * left behind with upstream's solver (`net-differential.test.ts`).
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { anticlockwise, clockwise } from "../../engine/square-edges.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newDesc } from "./generator.ts";
import type { NetHint, NetRung } from "./hint.ts";
import { netGame } from "./index.ts";
import { answerOf } from "./solver.ts";
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

/** A board whose plan settles a T by reading the straight beside it as left
 * no way to turn: turned one way, the T has no wire for the straight to lie
 * across to, and upright the straight closes a loop through the T. */
const STRANDS = "5x5:81924a3be3be5731bb848cca2";

/** The steps the tests below read, each pinned on a position whose hint opens
 * with one. */
const pinned = describeHintPins({
  game: netGame,
  params: [{ w: 5, h: 5, wrapping: false, barrierProbability: 0, diff: DIFF_EASY }, W5],
  seeds: 40,
  kinds: {
    turn: (step) => step.highlights?.kind === "turn",
  },
  pins: {
    /** Held on 1453 of 3507 positions walked. */
    turn: "5x5de:2a5e482a79d77eb51aa568818",
    /** Held on 3507 of 3507 positions walked. */
    fitLock: "5x5de:2a5e482a79d77eb51aa568818",
    /** Held on 747 of 3507 positions walked. */
    fitNote: {
      id: "5x5wde:dbd59c2d8845d7c2313447a15",
      moves: [{ type: "lock", x: 3, y: 0 }],
    },
    /** Held on 476 of 3507 positions walked. */
    loopLock: {
      id: "5x5wde:473d4acd331eb98138cc37198",
      moves:
        '[{"type":"rotate","op":"A","x":0,"y":1},{"type":"lock","x":0,"y":1},{"type":"note","x":1,"y":1,"dir":1,"note":2},{"type":"rotate","op":"A","x":2,"y":1},{"type":"lock","x":2,"y":1},{"type":"note","x":2,"y":4,"dir":8,"note":2},{"type":"note","x":3,"y":1,"dir":1,"note":2},{"type":"note","x":3,"y":4,"dir":8,"note":1},{"type":"note","x":3,"y":3,"dir":8,"note":2},{"type":"note","x":3,"y":2,"dir":8,"note":1},{"type":"note","x":3,"y":1,"dir":8,"note":2},{"type":"rotate","op":"A","x":3,"y":1},{"type":"lock","x":3,"y":1}]',
    },
    /** Held on 103 of 3507 positions walked. */
    loopNote: {
      id: "5x5wde:473d4acd331eb98138cc37198",
      moves:
        '[{"type":"rotate","op":"A","x":0,"y":1},{"type":"lock","x":0,"y":1},{"type":"note","x":1,"y":1,"dir":1,"note":2},{"type":"rotate","op":"A","x":2,"y":1},{"type":"lock","x":2,"y":1},{"type":"note","x":2,"y":4,"dir":8,"note":2},{"type":"note","x":3,"y":1,"dir":1,"note":2}]',
    },
    /** Held on 359 of 3507 positions walked. */
    sealLock: "5x5wde:3325223c386e7a755e354585a",
    /** Held on 56 of 3507 positions walked. */
    sealNote: {
      id: "5x5wde:84ebb19a428edd1d9e68aac18",
      moves:
        '[{"type":"lock","x":0,"y":1},{"type":"note","x":1,"y":1,"dir":1,"note":2},{"type":"lock","x":2,"y":1},{"type":"rotate","op":"C","x":1,"y":1},{"type":"lock","x":1,"y":1},{"type":"lock","x":4,"y":1},{"type":"rotate","op":"F","x":4,"y":2},{"type":"lock","x":4,"y":2}]',
    },
    /** Held on 76 of 3372 positions walked. */
    // By hand: no board the scan deals needs the idea, the seal settling
    // first. STRANDS, at its T.
    strandLock: {
      id: "5x5de:81924a3be3be5731bb848cca2",
      moves:
        '[{"type":"lock","x":0,"y":1},{"type":"lock","x":0,"y":0},{"type":"lock","x":0,"y":2},{"type":"rotate","op":"A","x":0,"y":3},{"type":"lock","x":0,"y":3},{"type":"lock","x":1,"y":3},{"type":"rotate","op":"A","x":0,"y":4},{"type":"lock","x":0,"y":4},{"type":"rotate","op":"C","x":1,"y":4},{"type":"lock","x":1,"y":4},{"type":"rotate","op":"F","x":2,"y":4},{"type":"lock","x":2,"y":4},{"type":"rotate","op":"A","x":3,"y":4},{"type":"lock","x":3,"y":4},{"type":"rotate","op":"A","x":4,"y":4},{"type":"lock","x":4,"y":4},{"type":"note","x":3,"y":2,"dir":1,"note":1},{"type":"note","x":3,"y":1,"dir":1,"note":1},{"type":"note","x":2,"y":0,"dir":8,"note":1},{"type":"note","x":1,"y":1,"dir":1,"note":1},{"type":"rotate","op":"A","x":4,"y":0},{"type":"lock","x":4,"y":0},{"type":"rotate","op":"A","x":4,"y":1},{"type":"lock","x":4,"y":1},{"type":"rotate","op":"F","x":4,"y":2},{"type":"lock","x":4,"y":2},{"type":"rotate","op":"C","x":4,"y":3},{"type":"lock","x":4,"y":3}]',
    },
  },
  unreached: {
    strandNote:
      "A neighbor left no way to turn rules out a whole turning of the " +
      "square, so on the boards walked its every side was settled at once " +
      "and the lock fired first, and the seal settles most squares before " +
      "it: no position of 3,507 opened with the note.",
  },
});

describe("the plan", () => {
  // The Easy boards: an Unreasonable one is where the plan stops short
  // (`net-tier.test.ts`).
  for (const item of leafPresets(netGame)) {
    const p = item.params;
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

/** The plan's sentences and rungs on a pasted board, each step checked
 * against the answer the search finds, and whether it finishes the board. */
function follow(id: string) {
  const colon = id.indexOf(":");
  const p = netGame.decodeParams(id.slice(0, colon));
  const state = newState(p, id.slice(colon + 1));
  const answer = answerOf(state);
  if (answer.kind !== "one") throw new Error(`${id}: no one answer`);
  const { solution } = answer;
  let s = state;
  const said: string[] = [];
  const rungs = new Set<NetRung>();
  for (const step of plan(state)) {
    const m = step.move;
    said.push(step.explanation);
    if (step.rung) rungs.add(step.rung);
    if (m.type === "note")
      expect((solution[m.y * p.w + m.x] & m.dir) !== 0).toBe(m.note === NOTE_WIRE);
    s = netGame.executeMove(s, m);
    if (m.type === "lock")
      expect(s.tiles[m.y * p.w + m.x] & 0xf).toBe(solution[m.y * p.w + m.x]);
  }
  return { said, rungs, solved: netGame.status(s) === "solved" };
}

describe("the easiest step first", () => {
  it("opens with the walls, and seals nothing while a side alone gives a step", () => {
    const { said, rungs } = follow("5x5:843886bbb66dae95ceda11112");
    expect(said[0]).toBe(
      "This straight must fit the wall, so only one way fits: turn it.",
    );
    expect(said[1]).toBe("…and lock this straight, for no other way fits.");
    expect(said.findIndex((t) => t.includes("seal off the striped squares"))).toBe(21);
    expect(rungs.has("sealLock")).toBe(true);
  });
});

describe("a wire followed through squares not settled yet", () => {
  it("is sealed off where the dead ends it runs into have no other wire", () => {
    // A straight between two dead ends, one of them across the wrapped edge:
    // lying across, it would join both and nothing else, though no wire
    // between them is known.
    const { said, solved } = follow("5x5wde:5196412d61c4dd89ee7392653");
    expect(solved).toBe(true);
    expect(said).toContain(
      "Lying across, this straight would join the striped dead ends (one across the wrapped edge), which have no other wire, closing all three off from the rest, so only one way fits: turn it.",
    );
  });
});

describe("a square looked at as turned", () => {
  it("rules out a turning that leaves the square beside it no way to turn", () => {
    const { state, step } = pinned("strandLock");
    expect(step.rung).toBe("strandLock");
    const marks = stepMarks(step);
    const ring = marks.of("ring", CELL);
    expect(ring).toHaveLength(1);
    // The square left no way to turn is outlined beside the ringed one.
    const [at] = ring;
    const beside = marks
      .of("outline", CELL)
      .filter((q) => Math.abs(q.x - at.x) + Math.abs(q.y - at.y) === 1);
    expect(beside.length, `${state.w}x${state.h}`).toBeGreaterThan(0);
    expect(step.explanation).toMatch(/no way to fit it/);
  });

  it("finishes a board that needs it", () => {
    const { rungs, solved } = follow(STRANDS);
    expect(solved).toBe(true);
    expect([...rungs].some((r) => r.startsWith("strand"))).toBe(true);
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

  it("rings the square a step turns and locks", () => {
    const r = renderScenario({
      game: netGame,
      id: "5x5:299511de1166b536dbb1861b2",
      showHint: true,
    });
    expect(r.hint).toBeDefined();
    expectRing(r.recording.ops);
    expect(r.recording.ops).toMatchSnapshot();
  });
});
