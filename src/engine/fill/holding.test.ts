/**
 * A board of sets, each placed once, on the `holding` fixture: a horseshoe
 * between two squares where one's set holds the other's, drawn in the gap
 * between them.
 */

import { describe, expect, it } from "vitest";
import * as holding from "../../generated/engine/testing/fixtures/holding/holding.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import type { DrawOp } from "../testing/recording-drawing.ts";
import { renderScenario } from "../testing/render-scenario.ts";
import { paramSpaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillMove } from "./notes.ts";
import { COL_INK } from "./render/palette.ts";

const game = fillGame("holding", holding);

// A set is one more than its letters' bits, A 1 and B 2: the empty set 1,
// {A} 2, {B} 3 and {A, B} 4.
const letters = (d: number): number => d - 1;
const holds = (x: number, y: number): boolean =>
  x !== y && (letters(x) & letters(y)) === letters(y);

const PARAMS = game.defaultParams();

/** The desc of the 2x2 board `answer`, its squares `hidden` written as
 * nothing, each edge's horseshoe read off it. */
function descOf(answer: readonly number[], hidden: readonly number[] = []): string {
  const sp = paramSpaceOf(holding, { w: 2, h: 2 });
  const shoes = sp.edges.map((e) => {
    const [a, z] = [answer[sp.edgeEnds[2 * e]], answer[sp.edgeEnds[2 * e + 1]]];
    return holds(a, z) ? 1 : holds(z, a) ? 2 : 0;
  });
  const given = answer.map((v, c) => (hidden.includes(c) ? "" : v));
  return [...given, ...shoes].join(",");
}

const idOf = (answer: readonly number[], hidden: readonly number[] = []): string =>
  `${game.encodeParams(PARAMS, false)}:${descOf(answer, hidden)}`;

const drawn = (id: string, moves: { set: number[] }[] = []): DrawOp[] =>
  renderScenario({ game, id, moves }).recording.ops;

// {A} {B}
// {}  {A, B}
const ANSWER = [2, 3, 1, 4];

describe("a horseshoe", () => {
  it("opens toward the square whose set holds the other's, and is none where neither does", () => {
    const ops = drawn(idOf(ANSWER));
    const shoes = ops
      .filter(
        (o): o is Extract<DrawOp, { op: "circle" }> =>
          o.op === "circle" && o.fill === COL_INK,
      )
      .sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    // Its legs: the ink bar drawn over the ring's half toward the holder.
    const legs = (s: (typeof shoes)[number]): [number, number] => {
      const bar = ops.find(
        (o): o is Extract<DrawOp, { op: "rect" }> =>
          o.op === "rect" &&
          o.color === COL_INK &&
          o.x <= s.cx + 1 &&
          o.x + o.w >= s.cx &&
          o.y <= s.cy + 1 &&
          o.y + o.h >= s.cy,
      );
      if (bar === undefined) throw new Error("a horseshoe with no legs");
      const [mx, my] = [bar.x + bar.w / 2 - s.cx, bar.y + bar.h / 2 - s.cy];
      // Off the center by a pixel or less is along its axis.
      const side = (m: number) => (Math.abs(m) <= 1 ? 0 : Math.sign(m));
      return [side(mx), side(my)];
    };
    // {A} over {}, {B} over {A, B}, then {} beside {A, B}; {A} beside {B}
    // has none.
    expect(shoes).toHaveLength(3);
    expect(shoes.map(legs)).toEqual([
      [0, -1],
      [0, 1],
      [1, 0],
    ]);
  });

  it("is a red cross where two squares with none between them hold one another", () => {
    const id = idOf(ANSWER, [0]);
    const red = (ops: DrawOp[]) =>
      ops.filter(
        (o): o is Extract<DrawOp, { op: "line" }> =>
          o.op === "line" && o.color === COL_ERROR,
      );
    expect(red(drawn(id))).toEqual([]);
    // The empty set beside {B}, which holds it.
    const cross = red(drawn(id, [{ set: [0, 1] }]));
    expect(cross).toHaveLength(2);
    const mid = (l: (typeof cross)[number]) => [(l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2];
    expect(mid(cross[0])).toEqual(mid(cross[1]));
  });

  it("writes the board's text between its squares, open toward the holder", () => {
    const text = game.textFormat?.(game.newState(PARAMS, descOf(ANSWER))) ?? "";
    // {A} over {} opens up, {B} over {A, B} down, {} beside {A, B} right.
    expect(text).toContain("∪");
    expect(text).toContain("∩");
    expect(text).toContain("⊂");
  });
});

describe("notes full from the deal", () => {
  // Every set, bits 1 to 4.
  const EVERY = 0b11110;
  const open = (hidden: readonly number[]) =>
    game.newState(PARAMS, descOf(ANSWER, hidden));
  const strike = (c: number, ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: sets.map((n) => ({ x: c % 2, y: Math.floor(c / 2), n })),
  });
  const play = (hidden: readonly number[], ...moves: FillMove[]) =>
    moves.reduce((b, m) => game.executeMove(b, m), open(hidden));

  it("are every set in each open square as dealt, and none in a given one", () => {
    expect(Array.from(open([0, 3]).pencil ?? [])).toEqual([EVERY, 0, 0, EVERY]);
  });

  it("place the one set a square is narrowed to", () => {
    const b = play([0, 3], strike(0, 1, 3, 4));
    expect(b.values[0]).toBe(2);
    expect(b.pencil?.[0]).toBe(0);
    // Two left stay notes.
    expect(play([0, 3], strike(0, 1, 4)).pencil?.[0]).toBe(0b01100);
  });

  it("give every set back to a square whose set is cleared", () => {
    const b = play([0, 3], strike(0, 1, 4), { set: [0, 3] }, { set: [0, 0] });
    expect(b.values[0]).toBe(0);
    expect(b.pencil?.[0]).toBe(EVERY);
  });

  it("are not struck to nothing", () => {
    const b = play([0, 3], strike(0, 1, 4), strike(0, 2, 3));
    expect(b.values[0]).toBe(0);
    expect(b.pencil?.[0]).toBe(0b01100);
  });

  it("leave no square unnoted, so no hint-notes preference is offered", () => {
    expect(game.prefs?.map((p) => p.kw)).toEqual([
      "auto-pencil",
      "sticky-pencil-mode",
      "pencil-keep-highlight",
    ]);
  });

  it("are finished by the walk's strike alone where it leaves one set", () => {
    const b = open([0]);
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
    expect(game.status(game.executeMove(b, plan.steps[0].move))).toBe("solved");
  });
});
