/**
 * Cube's hint: the plan finishes from anywhere, every step is a tap the game
 * reads as the step's roll, and the marks are drawn where the words say.
 */

import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { LEFT_BUTTON } from "../../engine/pointer.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { NO_FLASH } from "../../engine/win-wave.ts";
import { newDesc } from "./generator.ts";
import { hint } from "./hint.ts";
import { SQUARE } from "./hint-text.ts";
import { cubeGame } from "./index.ts";
import { COL_HINT_EVIDENCE, redraw } from "./render.ts";
import { DIR_CHARS, executeMove, findMoveDest } from "./roll.ts";
import { SolidType } from "./solids.ts";
import { canCollectWithoutDropping } from "./solver.ts";
import {
  type CubeMove,
  type CubeParams,
  type CubeState,
  newState,
  presets,
} from "./state.ts";

const PRESETS: CubeParams[] = presets().submenu.map((e) => e.params);

const solved = (s: CubeState): boolean => s.faceColors.every((c) => c);

/** The rolls legal from `s`. */
const rollsFrom = (s: CubeState): CubeMove[] =>
  DIR_CHARS.filter((_, r) => findMoveDest(s, r) !== null).map((dir) => ({ dir }));

describeHintPins({
  game: cubeGame,
  params: PRESETS,
  seeds: 6,
  maxSteps: 120,
  // Every other roll the player's own, so the scan meets positions a hint did
  // not lead to.
  stray: (s, turn, hinted): CubeMove | null => {
    if (turn % 2 === 0 && hinted) return hinted;
    const rolls = rollsFrom(s);
    return rolls[turn % rolls.length] ?? null;
  },
  pins: {
    /** Held on 3561 of 3561 positions walked. */
    collect: "c4x4:588C,2",
    /** Held on 3334 of 3561 positions walked. */
    travel: "c4x4:6183,13",
    /** Held on 30 of 3561 positions walked. */
    "come-round": {
      id: "c4x4:C264,4",
      moves: [
        { dir: "U" },
        { dir: "D" },
        { dir: "D" },
        { dir: "R" },
        { dir: "L" },
        { dir: "D" },
      ],
    },
    /** Held on 3201 of 3561 positions walked. */
    "forced-drop": { id: "t1x2:5240,12", moves: [{ dir: "L" }, { dir: "R" }] },
    /** Held on 2310 of 3561 positions walked. */
    drop: { id: "c4x4:183C,8", moves: [{ dir: "D" }, { dir: "R" }, { dir: "U" }] },
  },
});

describe("cube hint plan", () => {
  it("finishes every preset from its opening, recomputed after every roll", () => {
    for (const p of PRESETS) {
      for (const seed of ["w-a", "w-b", "w-c"]) {
        let s = newState(p, newDesc(p, randomNew(seed)).desc);
        for (let rolls = 0; !solved(s); rolls++) {
          // A recomputed plan that cycled would never finish; the potential
          // bounds a walk well inside this.
          expect(rolls, `${seed} on ${JSON.stringify(p)}`).toBeLessThan(400);
          const res = hint(s);
          if (!res.ok) throw new Error(`${seed}: ${res.error}`);
          s = executeMove(s, res.steps[0].move);
        }
      }
    }
  });

  it("finishes from positions the player wandered into", () => {
    for (const p of PRESETS) {
      let s = newState(p, newDesc(p, randomNew("stray")).desc);
      // Roll at random for a while, putting paint down on the way.
      const rng = randomNew("stray-rolls");
      for (let i = 0; i < 30; i++) {
        const rolls = rollsFrom(s);
        s = executeMove(s, rolls[randomUpto(rng, rolls.length)]);
      }
      const res = hint(s);
      if (!res.ok) throw new Error(`${JSON.stringify(p)}: ${res.error}`);
      for (const step of res.steps) s = executeMove(s, step.move);
      expect(solved(s)).toBe(true);
    }
  });

  it("is a shortest solution on the tetrahedron and the cube", () => {
    // Against a breadth-first search over the game's own rolls, with nothing
    // of the solver's: no window, no packing, no roll table.
    const shortest = (start: CubeState): number => {
      const key = (s: CubeState) =>
        `${s.current}|${s.faceColors.join("")}|${s.blue.join("")}`;
      const seen = new Set([key(start)]);
      let frontier = [start];
      for (let depth = 1; ; depth++) {
        const next: CubeState[] = [];
        for (const s of frontier) {
          for (const m of rollsFrom(s)) {
            const t = executeMove(s, m);
            if (solved(t)) return depth;
            if (seen.has(key(t))) continue;
            seen.add(key(t));
            next.push(t);
          }
        }
        frontier = next;
      }
    };
    for (const p of PRESETS.filter((q) => q.solid === SolidType.Tetrahedron)) {
      for (const seed of ["s-a", "s-b", "s-c"]) {
        const s = newState(p, newDesc(p, randomNew(seed)).desc);
        const res = hint(s);
        if (!res.ok) throw new Error(res.error);
        expect(res.steps.length, seed).toBe(shortest(s));
      }
    }
    const cube = PRESETS.find((q) => q.solid === SolidType.Cube) as CubeParams;
    const s = newState(cube, newDesc(cube, randomNew("w-a")).desc);
    const res = hint(s);
    if (!res.ok) throw new Error(res.error);
    expect(res.steps.length).toBe(shortest(s));
  });

  it("outlines each leg's goal on its other rolls, and rings where each roll lands", () => {
    const p = PRESETS.find((q) => q.solid === SolidType.Icosahedron) as CubeParams;
    let s = newState(p, newDesc(p, randomNew("w-a")).desc);
    const res = hint(s);
    if (!res.ok) throw new Error(res.error);
    for (const step of res.steps) {
      const marks = stepMarks(step);
      const after = executeMove(s, step.move);
      expect(marks.of("ring", SQUARE)).toEqual([after.current]);
      for (const goal of marks.of("outline", SQUARE)) {
        expect(goal).not.toBe(after.current);
        expect(s.blue[goal]).toBe(1);
      }
      s = after;
    }
  });
});

describe("whether a square can be picked up without putting paint down", () => {
  it("agrees with a search of the game's own rolls, on positions play wanders into", () => {
    // The search the claim "paint must go down before any comes up"
    // rests on, against one over whole states that knows nothing of it.
    const brute = (start: CubeState): boolean => {
      const painted = (s: CubeState) => s.blue.reduce((n, b) => n + b, 0);
      const before = painted(start);
      const key = (s: CubeState) => `${s.current}|${s.faceColors.join("")}`;
      const seen = new Set([key(start)]);
      const queue = [start];
      for (let i = 0; i < queue.length; i++) {
        for (const m of rollsFrom(queue[i])) {
          const t = executeMove(queue[i], m);
          if (painted(t) < before) return true;
          if (painted(t) > before || seen.has(key(t))) continue;
          seen.add(key(t));
          queue.push(t);
        }
      }
      return false;
    };
    const seen = { yes: 0, no: 0 };
    for (const p of PRESETS) {
      let s = newState(p, newDesc(p, randomNew("b")).desc);
      const rng = randomNew("b-rolls");
      for (let i = 0; i < 60 && !solved(s); i++) {
        const verdict = canCollectWithoutDropping(s);
        expect(verdict, `${JSON.stringify(p)} roll ${i}`).toBe(brute(s));
        seen[verdict ? "yes" : "no"]++;
        // Follow the hint mostly, so the walk reaches the endgame where the
        // answer is no.
        const res = hint(s);
        const rolls = rollsFrom(s);
        s = executeMove(
          s,
          res.ok && i % 3 ? res.steps[0].move : rolls[randomUpto(rng, rolls.length)],
        );
      }
    }
    // Both answers met, or the agreement says nothing about one of them.
    expect(seen.yes).toBeGreaterThan(10);
    expect(seen.no).toBeGreaterThan(10);
  });
});

describe("cube hint gesture", () => {
  it("is a tap the game reads as the step's roll, from every square of every preset", () => {
    for (const p of PRESETS) {
      const base = newState(p, newDesc(p, randomNew("g")).desc);
      const ds = cubeGame.newDrawState(base, cubeGame.preferredTileSize ?? 48);
      for (let sq = 0; sq < base.grid.length; sq++) {
        const s = { ...base, current: sq };
        for (const m of rollsFrom(s)) {
          const [tap] =
            cubeGame.hintGesture?.(s, {}, ds, m, {
              move: m,
              rung: "travel",
              explanation: "",
            }) ?? [];
          if (tap?.kind !== "click") throw new Error("not a tap");
          expect(cubeGame.interpretMove(s, {}, ds, tap.at, LEFT_BUTTON)).toEqual(m);
        }
      }
    }
  });
});

describe("cube hint marks", () => {
  it("rings the square to roll onto and outlines the goal, inside them", () => {
    const p = PRESETS.find((q) => q.solid === SolidType.Cube) as CubeParams;
    const s = newState(p, newDesc(p, randomNew("w-a")).desc);
    const res = hint(s);
    if (!res.ok) throw new Error(res.error);
    const step = res.steps.find((st) => stepMarks(st).of("outline", SQUARE).length > 0);
    if (!step) throw new Error("no step outlines a goal");
    const dr = new RecordingDrawing(cubeGame.colors(DEFAULT_BACKGROUND));
    const ds = cubeGame.newDrawState(s, cubeGame.preferredTileSize ?? 48);
    redraw(dr, ds, null, s, 0, {}, 0, NO_FLASH, step);
    const lines = opsOfKind(dr.ops, "line");
    // The square to roll onto is ringed round, and the goal's outline is
    // its four sides, so the two differ in shape; nothing in a hint color
    // fills.
    expectRing(dr.ops);
    expect(lines.filter((o) => o.color === COL_HINT_EVIDENCE)).toHaveLength(4);
    expect(opsOfKind(dr.ops, "polygon").some((o) => o.fill === COL_HINT_EVIDENCE)).toBe(
      false,
    );
  });
});
