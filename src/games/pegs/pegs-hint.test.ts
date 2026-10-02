/**
 * Pegs' solver, Solve and hint (`add-pegs-hint`).
 *
 * Each sentence the hint can say is pinned by a position it fires on, found by
 * a fixed-seed scan over hint-guided and random play on 5×5 Random and 7×7
 * Random boards (2026-10-02), so a change to the generator cannot quietly stop
 * a branch being exercised.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { isDeadEnd } from "../../engine/hint-refusal.ts";
import { MOVE, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import {
  bindingDefects,
  deadEndBindingDefects,
} from "../../engine/testing/hint-binding.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { hint, hintKeepTrack } from "./hint.ts";
import { HOLE, JUMP, type Marked, PEG } from "./hint-text.ts";
import { pegsGame } from "./index.ts";
import { findFinish, frozenPegs, legalJumps, provedLost } from "./solver.ts";
import { GRID_HOLE, GRID_PEG, type PegsMove, type PegsState, status } from "./state.ts";

const G = pegsGame;

function load(id: string): PegsState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

const pegCount = (s: PegsState) => s.grid.filter((v) => v === GRID_PEG).length;

function played(s: PegsState, j: Marked): PegsState {
  const grid = new Uint8Array(s.grid);
  grid[j.from] = GRID_HOLE;
  grid[(j.from + j.to) / 2] = GRID_HOLE;
  grid[j.to] = GRID_PEG;
  return { ...s, grid };
}

const asMarked = (s: PegsState, m: PegsMove): Marked => {
  if (m.type !== "jump") throw new Error("expected a jump");
  return { from: m.sy * s.w + m.sx, to: m.ty * s.w + m.tx };
};

const same = (a: Marked, b: Marked) => a.from === b.from && a.to === b.to;

const PINNED = {
  /** A rival cuts a peg off at once. */
  trap: "5x5:OOOOPHHHHHOHHHPOHHPPOOHPO",
  /** After a rival, every next jump cuts off the same peg. */
  trapSoon: "5x5:OOPPPOOPHOOHPPPHHHPPOOHHO",
  /** The plan opens by clearing a row, a column, or a block of six. */
  row: "5x5:PPHPPPOPPOPPPPPPPHPPOOPOO",
  column: "5x5:OHOOOHHPHOHHPHHPPPHHPHPPO",
  block: "5x5:OPPPPPPPPPPPHPPPPPPOPPPOO",
  /** Every rival loses. */
  only: "5x5:OOPPPOOPHOOPPHPHHPPPOOPHO",
  /** Every rival settled: some finish, some lose. */
  onlyThese: "5x5:OOOOPPHPHHOHHPPOPPPPOOPPO",
  /** Some finish, some lose, and some were past the search. */
  alsoThese: "7x7:PPHHOOOOPPHHOHOOHPHHHOHPPPPPOOPHHPPOHHPPPPOOOHOOO",
  /** Every jump can finish. */
  anyJump: "5x5:OOOOPPPPPPOPPPPOPPHPOOPPO",
  /** The jump that leaves one peg. */
  last: "5x5:OOOOHHHHHHOHHPPOHHHHOOHHO",
  /** The rest of the link variants: a different peg's trap, this peg's
   * trap a jump later, and a jump that would strand a peg, by this peg and by
   * another (found by a further scan, 2026-10-02). */
  trapOther: "5x5:OHPPHHOHPPHPHHPHOOPOHOOOO",
  trapSoonOwn: "5x5:OOOOHOPPHPPPHPHPHHOHPHPOO",
  strandOwn: "7x7:OOOOOOHOHOOOOHHHOOPPPHPPPHPPHPPHPPHPHPHHPPOOHOHPO",
  strandOther: "7x7:OHPPHHOOHOPOOOPPPPPPOOPPPPPOOPPPHPOHHPPPPPOOPPPOO",
  /** A peg alone now, which the offered jump lands beside: the owner's
   * playtest position (2026-10-02). */
  joins: "7x7:OOPHHOOOOHHPOOHPPHHHPHHPPPPPHHPPPPPOOPPPOOOOPPPOO",
  /** Lost, with no peg frozen: only the exhaustive search can say so. */
  lost: "5x5:POPPPPHPOOPHHHHPPHOOHOOOO",
} as const;

/** Two pegs, each beyond any other's reach. */
const TWO_CUT_OFF = "5x1:PHHHP";
/** A pair that can still jump, and a peg walled off from it. */
const ONE_CUT_OFF = "7x1:PPHOHHP";

/** The hint at `id`, which must offer a plan, with its first step's text
 * checked against `text`. */
function planAt(
  id: string,
  text: RegExp,
): { s: PegsState; steps: HintStep<PegsMove>[] } {
  const s = load(id);
  const r = hint(s);
  if (!r.ok) throw new Error(r.error);
  expect(r.steps[0].explanation).toMatch(text);
  for (const step of r.steps) expect(step.explanation.length).toBeLessThanOrEqual(120);
  return { s, steps: r.steps };
}

describe("pegs solver", () => {
  it("finishes every preset's dealt board, and the line it finds plays out", () => {
    const presets = leafPresets(G);
    expect(presets.length).toBeGreaterThan(0);
    for (const { params } of presets) {
      const { desc } = G.newDesc(params, randomNew("solver"));
      let s = G.newState(params, desc);
      const finish = findFinish(s);
      if (finish.kind !== "found") throw new Error(`${G.encodeParams(params, true)}`);
      for (const j of finish.jumps) {
        s = G.executeMove(s, {
          type: "jump",
          sx: j.from % s.w,
          sy: Math.floor(j.from / s.w),
          tx: j.to % s.w,
          ty: Math.floor(j.to / s.w),
        });
      }
      expect(status(s)).toBe("solved");
    }
  });

  it("calls a peg frozen only on a position the exhaustive search proves lost", () => {
    // The closure's soundness, checked against a search with no closure in it:
    // every 5×5 position random play reaches whose frozen check fires.
    let fired = 0;
    const params = G.decodeParams("5x5random");
    for (let seed = 0; seed < 40; seed++) {
      const rng = randomNew(`frozen${seed}`);
      let s = G.newState(params, G.newDesc(params, rng).desc);
      for (let k = 0; k < 15; k++) {
        if (frozenPegs(s).length > 0) {
          fired++;
          expect(findFinish(s).kind).toBe("lost");
        }
        const jumps = legalJumps(s);
        if (jumps.length === 0) break;
        const j = jumps[k % jumps.length];
        s = G.executeMove(s, {
          type: "jump",
          sx: j.from % 5,
          sy: Math.floor(j.from / 5),
          tx: j.to % 5,
          ty: Math.floor(j.to / 5),
        });
      }
    }
    expect(fired).toBeGreaterThan(0);
  });

  it("proves the pinned lost position lost, with no peg frozen", () => {
    const s = load(PINNED.lost);
    expect(frozenPegs(s)).toEqual([]);
    expect(provedLost(s, 100_000)).toBe(true);
    expect(provedLost(load(PINNED.only), 100_000)).toBe(false);
  });

  it("does not call a finished board's last peg frozen", () => {
    // A desc must have two pegs, so the finished board is built directly.
    const grid = Uint8Array.from([0, 0, GRID_PEG]);
    expect(frozenPegs({ w: 3, h: 1, grid })).toEqual([]);
  });
});

describe("pegs hint", () => {
  it("refuses a board with pegs cut off, and outlines them", () => {
    const outlined = (id: string, text: RegExp): number[] => {
      const s = load(id);
      const r = hint(s);
      if (r.ok || !r.words) throw new Error(`${id}: expected a marked refusal`);
      expect(r.error).toMatch(text);
      expect(isDeadEnd(r.error)).toBe(true);
      expect(deadEndBindingDefects(G, s, G.newUi(s), r)).toEqual([]);
      return [...stepMarks(r).of("outline", PEG)];
    };
    expect(
      outlined(TWO_CUT_OFF, /^The outlined pegs are cut off.* beside each\.$/),
    ).toEqual(frozenPegs(load(TWO_CUT_OFF)));
    expect(
      outlined(ONE_CUT_OFF, /^The outlined peg is cut off.* beside it\.$/),
    ).toEqual([6]);
  });

  it("marks a cut-off peg when the check refuses to save, until the next move", () => {
    const { midend, recording } = renderScenario({ game: G, id: ONE_CUT_OFF });
    const unmarked = JSON.stringify(recording.ops);
    const verdict = midend.check();
    expect(verdict.kind).toBe("dead-end");
    if (verdict.kind === "dead-end")
      expect(verdict.reason).toMatch(/^The outlined peg/);
    const frame = (): string => {
      const rec = new RecordingDrawing(midend.getColorPalette(DEFAULT_BACKGROUND));
      midend.forceRedraw(rec);
      return JSON.stringify(rec.ops);
    };
    expect(frame()).not.toBe(unmarked);
    // The pair can still jump, and the move puts the outline away: the frame is
    // the one that board paints with no check asked.
    const moves: PegsMove[] = [{ type: "jump", sx: 0, sy: 0, tx: 2, ty: 0 }];
    midend.playMoves(moves);
    const fresh = renderScenario({ game: G, id: ONE_CUT_OFF, moves });
    expect(frame()).toBe(JSON.stringify(fresh.recording.ops));
  });

  it("refuses a lost board with nothing frozen as one no solution leaves", () => {
    expect(hint(load(PINNED.lost))).toEqual({
      ok: false,
      error: NO_SOLUTION_FROM_HERE,
    });
  });

  it("stripes a rival that cuts a peg off at once, and outlines that peg", () => {
    const { s, steps } = planAt(
      PINNED.trap,
      /^This peg's striped jump would cut off the outlined peg\. One way to save it: jump into the ringed hole\.$/,
    );
    const marks = stepMarks(steps[0]);
    const [rival] = marks.of("stripes", JUMP);
    const [victim] = marks.of("outline", PEG);
    const j = asMarked(s, steps[0].move);
    expect(legalJumps(s).some((r) => same(r, rival))).toBe(true);
    expect(same(rival, j)).toBe(false);
    // "This peg's" striped jump: the same peg, the other way.
    expect(rival.from).toBe(j.from);
    expect(frozenPegs(played(s, rival))).toContain(victim);
    expect(frozenPegs(played(s, j))).not.toContain(victim);
  });

  it("names a rival after which every jump cuts the outlined peg off", () => {
    const { s, steps } = planAt(
      PINNED.trapSoon,
      /^After the striped jump, any next jump cuts off the outlined peg\. One way to save it: jump/,
    );
    const marks = stepMarks(steps[0]);
    const [rival] = marks.of("stripes", JUMP);
    const [victim] = marks.of("outline", PEG);
    const j = asMarked(s, steps[0].move);
    // A different peg, so the move is offered as one way to save the victim,
    // which it does: it starts a line that finishes.
    expect(rival.from).not.toBe(j.from);
    expect(findFinish(played(s, j)).kind).toBe("found");
    const next = played(s, rival);
    expect(frozenPegs(next)).toEqual([]);
    const replies = legalJumps(next);
    expect(replies.length).toBeGreaterThan(0);
    for (const j of replies) expect(frozenPegs(played(next, j))).toContain(victim);
  });

  for (const [name, n] of [
    ["row", 3],
    ["column", 3],
    ["block", 6],
  ] as const) {
    it(`walks the clearing of a ${name} as one journey`, () => {
      const { s, steps } = planAt(
        PINNED[name],
        new RegExp(`clear the striped ${name} and change nothing else\\. First`),
      );
      expect(steps).toHaveLength(n);
      expect(steps.slice(1).every((st) => st.continuesPrevious)).toBe(true);
      expect(steps[0].continuesPrevious).toBeUndefined();
      const shape = stepMarks(steps[0]).of("stripes", PEG);
      expect(shape).toHaveLength(n);
      let end = s;
      for (const st of steps) end = G.executeMove(end, st.move);
      // Exactly the striped pegs are gone, and everything else is as it was.
      for (const [i, v] of s.grid.entries())
        expect(end.grid[i]).toBe(shape.includes(i) ? GRID_HOLE : v);
    });
  }

  it("says a jump is the only one only where every rival is proved lost", () => {
    const { s, steps } = planAt(
      PINNED.only,
      /^No other jump can still finish, so jump/,
    );
    const j = asMarked(s, steps[0].move);
    const rivals = legalJumps(s).filter((r) => !same(r, j));
    expect(rivals.length).toBeGreaterThan(0);
    for (const r of rivals) expect(provedLost(played(s, r), 100_000)).toBe(true);
  });

  it("draws the arrows on exactly the jumps that can still finish", () => {
    const { s, steps } = planAt(
      PINNED.onlyThese,
      /^Only the jumps with arrows can still finish\. One of them: jump/,
    );
    const j = asMarked(s, steps[0].move);
    const arrows = stepMarks(steps[0]).of("outline", JUMP);
    // The offered jump is one of them, and carries its arrow under the rings.
    expect(arrows.some((a) => same(a, j))).toBe(true);
    expect(arrows.length).toBeGreaterThan(1);
    for (const r of legalJumps(s).filter((r) => !same(r, j))) {
      const shown = arrows.some((a) => same(a, r));
      if (shown) expect(findFinish(played(s, r)).kind).toBe("found");
      else expect(provedLost(played(s, r), 100_000)).toBe(true);
    }
  });

  it("claims nothing about an undrawn rival the search could not settle", () => {
    const { s, steps } = planAt(
      PINNED.alsoThese,
      /^The jumps with arrows can still finish; some others cannot\. One of them: jump/,
    );
    const j = asMarked(s, steps[0].move);
    const arrows = stepMarks(steps[0]).of("outline", JUMP);
    expect(arrows.some((a) => same(a, j))).toBe(true);
    for (const a of arrows) expect(findFinish(played(s, a)).kind).toBe("found");
    const undrawn = legalJumps(s).filter(
      (r) => !same(r, j) && !arrows.some((a) => same(a, r)),
    );
    expect(undrawn.some((r) => provedLost(played(s, r), 300_000))).toBe(true);
  });

  it("says every jump can finish only where each one can", () => {
    const { s } = planAt(
      PINNED.anyJump,
      /^Every jump can still finish with one peg\. One of them: jump/,
    );
    for (const r of legalJumps(s)) expect(findFinish(played(s, r)).kind).toBe("found");
  });

  /** Whether `p` has a peg in one of the four squares beside it. */
  const hasNeighbor = (st: PegsState, p: number) =>
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].some(([dx, dy]) => {
      const x = (p % st.w) + dx;
      const y = Math.floor(p / st.w) + dy;
      return (
        x >= 0 && x < st.w && y >= 0 && y < st.h && st.grid[y * st.w + x] === GRID_PEG
      );
    });

  for (const [name, text, own, danger] of [
    [
      "trapOther",
      /^The striped jump would cut off the outlined peg\. One way to save it: jump/,
      false,
      "cut",
    ],
    [
      "trapSoonOwn",
      /^After this peg's striped jump, any next jump cuts off the outlined peg\. One way to save it: jump into the ringed hole\.$/,
      true,
      "soon",
    ],
    [
      "strandOwn",
      /^This peg's striped jump would strand the outlined peg\. One way to keep a peg beside it: jump into the ringed hole\.$/,
      true,
      "strand",
    ],
    [
      "strandOther",
      /^The striped jump would strand the outlined peg\. One way to keep a peg beside it: jump/,
      false,
      "strand",
    ],
  ] as const) {
    it(`links the move to the danger it answers (${name})`, () => {
      const { s, steps } = planAt(PINNED[name], text);
      const marks = stepMarks(steps[0]);
      const [rival] = marks.of("stripes", JUMP);
      const [victim] = marks.of("outline", PEG);
      const j = asMarked(s, steps[0].move);
      expect(rival.from === j.from).toBe(own);
      const afterRival = played(s, rival);
      if (danger === "cut") expect(frozenPegs(afterRival)).toContain(victim);
      if (danger === "soon")
        for (const r of legalJumps(afterRival))
          expect(frozenPegs(played(afterRival, r))).toContain(victim);
      if (danger === "strand") {
        // Stranded by the striped jump: it had a neighbor, and loses it.
        expect(hasNeighbor(s, victim)).toBe(true);
        expect(hasNeighbor(afterRival, victim)).toBe(false);
        expect(hasNeighbor(played(s, j), victim)).toBe(true);
      } else expect(findFinish(played(s, j)).kind).toBe("found");
    });
  }

  it("goes back for a stranded peg", () => {
    const { s, steps } = planAt(
      PINNED.joins,
      /^The outlined peg is stranded, with no peg beside it\. One way to save it: go back for it\.$/,
    );
    const [lone] = stepMarks(steps[0]).of("outline", PEG);
    const j = asMarked(s, steps[0].move);
    const beside = (a: number, b: number) =>
      Math.abs((a % s.w) - (b % s.w)) +
        Math.abs(Math.floor(a / s.w) - Math.floor(b / s.w)) ===
      1;
    const pegBeside = (st: PegsState) =>
      [0, 1, 2, 3].some((d) => {
        const q = lone + [1, -1, s.w, -s.w][d];
        return (
          q >= 0 && q < st.grid.length && beside(q, lone) && st.grid[q] === GRID_PEG
        );
      });
    expect(pegBeside(s)).toBe(false);
    expect(beside(j.to, lone)).toBe(true);
    expect(pegBeside(played(s, j))).toBe(true);
  });

  it("names the jump that leaves one peg", () => {
    const { s, steps } = planAt(PINNED.last, /: that finishes with one peg\.$/);
    expect(status(G.executeMove(s, steps[0].move))).toBe("solved");
  });

  it("binds every pinned step's words to what it draws", () => {
    let checked = 0;
    for (const id of Object.values(PINNED)) {
      if (id === PINNED.lost) continue;
      let s = load(id);
      const r = hint(s);
      if (!r.ok) throw new Error(`${id}: ${r.error}`);
      for (const step of r.steps) {
        expect(bindingDefects(G, s, G.newUi(s), step), id).toEqual([]);
        s = G.executeMove(s, step.move);
        checked++;
      }
    }
    // Fifteen plans, three of them packages of 3, 3 and 6 legs.
    expect(checked).toBe(12 + 3 + 3 + 6);
  });

  it("rings the jumping peg and the hole it lands in, and following it solves", () => {
    let s = load("7x7:OOPPPOOOOPPPOOPPPPPPPPPPHPPPPPPPPPPOOPPPOOOOPPPOO");
    let requests = 0;
    while (status(s) !== "solved") {
      const r = hint(s);
      if (!r.ok) throw new Error(r.error);
      requests++;
      for (const step of r.steps) {
        const m = step.move;
        if (m.type !== "jump") throw new Error("jump");
        const marks = stepMarks(step);
        // Rung as a peg and a hole, or as the whole move where the words
        // leave it to the board.
        if (marks.of("ring", MOVE).length > 0) {
          expect(marks.of("ring", PEG)).toEqual([]);
          expect(marks.of("ring", HOLE)).toEqual([]);
        } else {
          expect(marks.of("ring", PEG)).toEqual([m.sy * s.w + m.sx]);
          expect(marks.of("ring", HOLE)).toEqual([m.ty * s.w + m.tx]);
        }
        expect(hintKeepTrack(m, step, s)).toBe("completed");
        s = G.executeMove(s, m);
      }
    }
    expect(requests).toBeGreaterThan(1);
    expect(pegCount(s)).toBe(1);
  });

  it("drops the plan on any other jump", () => {
    const s = load(PINNED.trap);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const step = r.steps[0];
    const want = asMarked(s, step.move);
    const other = legalJumps(s).find((j) => !same(j, want));
    if (!other) throw new Error("expected a rival jump");
    const m: PegsMove = {
      type: "jump",
      sx: other.from % s.w,
      sy: Math.floor(other.from / s.w),
      tx: other.to % s.w,
      ty: Math.floor(other.to / s.w),
    };
    expect(hintKeepTrack(m, step, s)).toBe("off");
  });

  // COL_HINT and COL_HINT_EVIDENCE.
  const COL_HINT = 6;
  const COL_HINT_EVIDENCE = 7;

  it("draws a trap's rings, outline and stripes (tier 2.5)", () => {
    const { recording } = renderScenario({ game: G, id: PINNED.trap, showHint: true });
    const rings = (color: number) =>
      recording.ops.filter(
        (o) => o.op === "circle" && o.fill === -1 && o.outline === color,
      ).length;
    // Two strokes per ring: a ringed peg and hole, and one outlined peg.
    expect(rings(COL_HINT)).toBe(4);
    expect(rings(COL_HINT_EVIDENCE)).toBe(2);
    // The rival's three squares are striped.
    expect(recording.ops.filter((o) => o.op === "hatch").length).toBe(3);
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws an arrow per rival that can still finish (tier 2.5)", () => {
    const s = load(PINNED.onlyThese);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const arrows = stepMarks(r.steps[0]).of("outline", JUMP);
    const { recording } = renderScenario({
      game: G,
      id: PINNED.onlyThese,
      showHint: true,
    });
    // An arrowhead is drawn once, by the square holding the hole it points at,
    // and clipped away in the other two.
    const heads = recording.ops.filter(
      (o) => o.op === "polygon" && o.fill === COL_HINT_EVIDENCE,
    );
    expect(heads.length).toBe(arrows.length * 3);
    expect(recording.ops).toMatchSnapshot();
  });
});

describe("pegs solve", () => {
  const solveOf = (orig: string, curr: string) => {
    const solve = G.solve;
    if (!solve) throw new Error("expected solve");
    return solve(load(orig), load(curr));
  };

  it("finishes from the player's position when it can", () => {
    const r = solveOf(PINNED.only, PINNED.only);
    if (!r.ok) throw new Error(r.error);
    const done = G.executeMove(load(PINNED.only), r.move);
    expect(status(done)).toBe("solved");
  });

  it("falls back to the dealt board when the player's position is lost", () => {
    const r = solveOf("7x1:PPHOHHH", ONE_CUT_OFF);
    expect(r).toEqual({ ok: true, move: { type: "solve", finish: 2 } });
    if (!r.ok) return;
    expect(G.textFormat?.(G.executeMove(load(ONE_CUT_OFF), r.move))).toBe("--* ---");
  });

  it("says a board no line finishes from has no solution", () => {
    expect(solveOf(TWO_CUT_OFF, TWO_CUT_OFF)).toEqual({
      ok: false,
      error: "This puzzle has no solution.",
    });
  });

  it("round-trips the solve move through a save", () => {
    const m: PegsMove = { type: "solve", finish: 12 };
    expect(G.deserializeMove?.(G.serializeMove?.(m))).toEqual(m);
  });
});
