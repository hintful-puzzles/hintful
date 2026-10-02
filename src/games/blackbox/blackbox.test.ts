/**
 * Tier-1 logic tests for Black Box: the laser ray-tracer (straight pass,
 * head-on hit, entry reflection, exit reciprocity), guess verification
 * counting, desc obfuscation round-trip + rejection, params round-trip +
 * validation, and the status mapping.
 *
 * The tracer is exercised through the public `Game` surface (build a
 * state with known balls, fire via `executeMove`, read `exits`) rather
 * than the internal functions, so the tests pin observable behavior.
 */

import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { bin2hex, obfuscateBitmap } from "../../engine/obfuscate.ts";
import { describeParams } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { newDesc } from "./answer.ts";
import { blackboxGame } from "./index.ts";
import {
  BALL_CORRECT,
  BALL_GUESS,
  type BlackboxParams,
  type BlackboxState,
  type BlackboxUi,
  decodeParams,
  defaultParams,
  encodeParams,
  grid2range,
  LASER_EMPTY,
  LASER_HIT,
  LASER_REFLECT,
  newState,
} from "./state.ts";

/** Build a state with balls at 0-indexed arena coords `[x, y]`. */
function makeState(
  w: number,
  h: number,
  balls: Array<[number, number]>,
): BlackboxState {
  const nlasers = 2 * (w + h);
  const grid = new Int32Array((w + 2) * (h + 2));
  for (const [bx, by] of balls) grid[(by + 1) * (w + 2) + (bx + 1)] = BALL_CORRECT;
  return {
    w,
    h,
    minballs: balls.length,
    maxballs: balls.length,
    nballs: balls.length,
    nlasers,
    grid,
    exits: new Int32Array(nlasers).fill(LASER_EMPTY),
    laserno: 1,
    nguesses: 0,
    reveal: false,
    justwrong: false,
  };
}

/** rangeno of the top-row firing cell above arena column `ax` (0-indexed). */
function topRange(w: number, h: number, ax: number): number {
  return grid2range(w, h, ax + 1, 0) as number;
}
/** rangeno of the bottom-row firing cell below arena column `ax`. */
function bottomRange(w: number, h: number, ax: number): number {
  return grid2range(w, h, ax + 1, h + 1) as number;
}

function fire(s: BlackboxState, rangeno: number): BlackboxState {
  return blackboxGame.executeMove(s, { type: "fire", rangeno });
}

describe("Black Box — laser tracer", () => {
  it("passes straight through an empty arena and pairs entry/exit", () => {
    const s = makeState(5, 5, []);
    const top = topRange(5, 5, 0); // column 1
    const bottom = bottomRange(5, 5, 0);
    const after = fire(s, top);
    expect(after.exits[top]).toBe(bottom);
    expect(after.exits[bottom]).toBe(top);
  });

  it("reports a hit on a head-on ball", () => {
    // Ball in column 1 (arena x=0), fired from the top of column 1.
    const s = makeState(5, 5, [[0, 2]]);
    const top = topRange(5, 5, 0);
    const after = fire(s, top);
    expect(after.exits[top]).toBe(LASER_HIT);
  });

  it("reflects instantly when a ball sits diagonally at the entry", () => {
    // Entry is top of column 1 heading down; a ball at arena (1,0) sits
    // diagonally ahead, forcing an immediate reflection.
    const s = makeState(5, 5, [[1, 0]]);
    const top = topRange(5, 5, 0);
    const after = fire(s, top);
    expect(after.exits[top]).toBe(LASER_REFLECT);
  });

  it("deflects around a ball and exits elsewhere", () => {
    // A single off-column ball deflects the beam to a different exit
    // (neither hit, reflect, nor the straight-through pairing).
    const s = makeState(5, 5, [[1, 1]]);
    const top = topRange(5, 5, 0);
    const straight = bottomRange(5, 5, 0);
    const after = fire(s, top);
    const e = after.exits[top];
    expect(e).not.toBe(LASER_HIT);
    expect(e).not.toBe(LASER_REFLECT);
    expect(e).not.toBe(LASER_EMPTY);
    expect(e).not.toBe(straight);
    // Whatever the exit, it is reciprocal.
    expect(after.exits[e]).toBe(top);
  });

  it("keeps every fired laser reciprocal across a full sweep", () => {
    let s = makeState(6, 6, [
      [0, 0],
      [2, 3],
      [4, 1],
      [5, 5],
      [3, 4],
    ]);
    for (let i = 0; i < s.nlasers; i++) {
      if (s.exits[i] !== LASER_EMPTY) continue;
      s = fire(s, i);
    }
    let pairs = 0;
    for (let i = 0; i < s.nlasers; i++) {
      const e = s.exits[i];
      if (e === LASER_EMPTY || e === LASER_HIT || e === LASER_REFLECT) continue;
      expect(s.exits[e]).toBe(i);
      pairs++;
    }
    // A layout where every laser hit or reflected would assert nothing at all.
    expect(pairs, "no laser came out the other side").toBeGreaterThan(0);
  });

  it("rejects firing an already-fired laser", () => {
    const s = makeState(5, 5, []);
    const top = topRange(5, 5, 0);
    const after = fire(s, top);
    expect(() => fire(after, top)).toThrow();
  });
});

describe("Black Box — guess verification", () => {
  const balls: Array<[number, number]> = [
    [0, 0],
    [1, 1],
    [2, 2],
  ];

  function mark(s: BlackboxState, x: number, y: number): BlackboxState {
    return blackboxGame.executeMove(s, { type: "toggleBall", x: x + 1, y: y + 1 });
  }

  it("Solve replaces the guesses with the real balls, which wins", () => {
    let s = makeState(5, 5, balls);
    s = mark(s, 0, 0); // correct
    s = mark(s, 3, 3); // wrong
    const solved = blackboxGame.executeMove(s, { type: "solve" });
    expect(solved.reveal).toBe(true);
    expect(solved.nguesses).toBe(3);
    for (let x = 1; x <= 5; x++) {
      for (let y = 1; y <= 5; y++) {
        const v = solved.grid[y * 7 + x];
        expect(Boolean(v & BALL_GUESS)).toBe(Boolean(v & BALL_CORRECT));
      }
    }
    expect(blackboxGame.status(solved)).toBe("solved");
  });

  it("solves when every ball is guessed correctly", () => {
    let s = makeState(5, 5, balls);
    for (const [x, y] of balls) s = mark(s, x, y);
    const revealed = blackboxGame.executeMove(s, { type: "reveal" });
    expect(revealed.reveal).toBe(true);
    expect(blackboxGame.status(revealed)).toBe("solved");
  });

  it("shows one error without revealing on an inconsistent verify", () => {
    let s = makeState(5, 5, balls);
    s = mark(s, 0, 0);
    s = mark(s, 1, 1);
    s = mark(s, 3, 3); // wrong
    const verified = blackboxGame.executeMove(s, { type: "reveal" });
    expect(verified.justwrong).toBe(true);
    expect(verified.reveal).toBe(false);
    expect(blackboxGame.status(verified)).toBe("ongoing");
  });

  it("rejects a reveal when too few balls are marked", () => {
    let s = makeState(5, 5, balls);
    s = mark(s, 0, 0); // only one of three
    expect(() => blackboxGame.executeMove(s, { type: "reveal" })).toThrow();
  });

  it("bumps the session error counter on a wrong move via changedState", () => {
    let s = makeState(5, 5, balls);
    s = mark(s, 0, 0);
    s = mark(s, 1, 1);
    s = mark(s, 3, 3);
    const verified = blackboxGame.executeMove(s, { type: "reveal" });
    const ui = blackboxGame.newUi(s);
    ui.newmove = true; // a real move was just made
    blackboxGame.changedState?.(ui, s, verified);
    expect(ui.errors).toBe(1);
    expect(ui.newmove).toBe(false);
  });
});

describe("Black Box — desc codec", () => {
  it("recovers the scattered balls through obfuscation", () => {
    const p = defaultParams();
    const { desc } = newDesc(p, randomNew("blackbox-desc"));
    expect(validateDesc(blackboxGame, p, desc)).toBeNull();
    const s = newState(p, desc);
    let placed = 0;
    for (let i = 0; i < s.grid.length; i++) if (s.grid[i] & BALL_CORRECT) placed++;
    expect(placed).toBe(s.nballs);
    expect(s.nballs).toBeGreaterThanOrEqual(p.minballs);
    expect(s.nballs).toBeLessThanOrEqual(p.maxballs);
    expect(s.w).toBe(p.w);
    expect(s.h).toBe(p.h);
  });

  /** The desc newDesc would write for `bytes`. */
  const encode = (...bytes: number[]) => {
    const bmp = Uint8Array.from(bytes);
    obfuscateBitmap(bmp, bmp.length * 8, false);
    return bin2hex(bmp);
  };

  it("rejects a description of the wrong length", () => {
    const p = defaultParams();
    expect(validateDesc(blackboxGame, p, "abc")).toBe(DESC_TOO_SHORT);
    const two = { w: 3, h: 3, minballs: 1, maxballs: 2 };
    const one = encode(3, 3, 0, 0);
    const pair = encode(3, 3, 0, 0, 1, 1);
    expect(validateDesc(blackboxGame, two, one)).toBeNull();
    expect(validateDesc(blackboxGame, two, pair)).toBeNull();
    // Part of a ball past one is a second ball cut short; past two, too many.
    expect(validateDesc(blackboxGame, two, `${one}ab`)).toBe(DESC_TOO_SHORT);
    expect(validateDesc(blackboxGame, two, `${pair}a`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(blackboxGame, two, encode(3, 3, 0, 0, 1, 1, 2, 2))).toBe(
      DESC_TOO_LONG,
    );
  });

  it("reads only the lowercase hex its encoder writes", () => {
    const p = { w: 3, h: 3, minballs: 1, maxballs: 1 };
    const desc = encode(3, 3, 1, 2);
    expect(validateDesc(blackboxGame, p, desc)).toBeNull();
    expect(validateDesc(blackboxGame, p, `${desc.slice(0, 7)}g`)).toBe(
      descBadCharacter("g"),
    );
    const upper = desc.toUpperCase();
    const at = [...upper].findIndex((c) => c !== c.toLowerCase());
    expect(at).toBeGreaterThanOrEqual(0);
    expect(validateDesc(blackboxGame, p, upper)).toBe(descBadCharacter(upper[at]));
  });

  it("rejects two balls on one cell", () => {
    const p = { w: 3, h: 3, minballs: 2, maxballs: 2 };
    expect(validateDesc(blackboxGame, p, encode(3, 3, 1, 2, 2, 1))).toBeNull();
    expect(validateDesc(blackboxGame, p, encode(3, 3, 1, 2, 1, 2))).toBe(DESC_REPEATED);
  });

  it("rejects a description whose balls fall outside the arena", () => {
    // A valid 2x2 header, then one ball a column (then a row) past the arena.
    const p = { w: 2, h: 2, minballs: 1, maxballs: 1 };
    for (const bmp of [Uint8Array.of(2, 2, 2, 0), Uint8Array.of(2, 2, 0, 2)]) {
      obfuscateBitmap(bmp, bmp.length * 8, false);
      expect(validateDesc(blackboxGame, p, bin2hex(bmp))).toBe(DESC_OUT_OF_RANGE);
    }
  });
});

describe("Black Box — params", () => {
  it("round-trips encode/decode", () => {
    const p = { w: 8, h: 8, minballs: 3, maxballs: 6 };
    expect(encodeParams(p, true)).toBe("w8h8m3M6");
    expect(decodeParams("w8h8m3M6")).toEqual(p);
  });

  it("ignores unknown letters on decode", () => {
    expect(decodeParams("w5zzh5m3M3")).toEqual({
      w: 5,
      h: 5,
      minballs: 3,
      maxballs: 3,
    });
  });

  it("rejects invalid params", () => {
    const refusal = (p: BlackboxParams) => paramsError(blackboxGame, p, true);
    expect(refusal({ w: 1, h: 5, minballs: 1, maxballs: 1 })).toBe(
      "Width must be at least 2.",
    );
    expect(refusal({ w: 5, h: 256, minballs: 1, maxballs: 1 })).toBe(
      "Height must be at most 255.",
    );
    expect(refusal({ w: 5, h: 5, minballs: 0, maxballs: 1 })).toBe(
      "No. of balls must be at least 1.",
    );
    expect(refusal({ w: 5, h: 5, minballs: 4, maxballs: 2 })).not.toBeNull();
    expect(refusal({ w: 3, h: 3, minballs: 9, maxballs: 9 })).not.toBeNull();
    expect(refusal({ w: 8, h: 8, minballs: 5, maxballs: 5 })).toBeNull();
  });

  it("labels a ball count, singular or a range", () => {
    expect(describeParams(blackboxGame, { w: 5, h: 5, minballs: 1, maxballs: 1 })).toBe(
      "5x5, 1 ball",
    );
    expect(describeParams(blackboxGame, { w: 8, h: 8, minballs: 3, maxballs: 6 })).toBe(
      "8x8, 3-6 balls",
    );
  });
});

describe("Black Box — Game surface", () => {
  it("reports its capability flags", () => {
    expect(blackboxGame.id).toBe("blackbox");
    expect(blackboxGame.statusbarText).toBeDefined();
    expect(blackboxGame.solve).toBeDefined();
    expect(blackboxGame.hint).toBeDefined();
    expect(blackboxGame.findMistakes).toBeDefined();
  });

  it("produces the correct status-bar text across phases", () => {
    const s = makeState(8, 8, [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
    const ui: BlackboxUi = blackboxGame.newUi(s);
    expect(blackboxGame.statusbarText?.(s, ui)).toContain("Balls marked: 0 / 5");
  });
});
