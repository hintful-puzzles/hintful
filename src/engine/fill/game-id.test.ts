/**
 * A fill game's params, on the `sizing` fixture: a size beyond the grid's
 * that the params give and the rules read, its rulesets as the Custom
 * dialog's game mode with the narrowest board each has an answer on, and the
 * bounds the board and a tier keep beyond the sizes'. On the `fleet` fixture,
 * a tally of pieces the params give, and the flag that hides more clues; on
 * `walling`, options only the deal reads; on `mirroring`, a hide the player
 * may make less thorough.
 */

import { describe, expect, it } from "vitest";
import * as fleet from "../../generated/engine/testing/fixtures/fleet/fleet.compiled.ts";
import * as mirroring from "../../generated/engine/testing/fixtures/mirroring/mirroring.compiled.ts";
import * as sizing from "../../generated/engine/testing/fixtures/sizing/sizing.compiled.ts";
import * as walling from "../../generated/engine/testing/fixtures/walling/walling.compiled.ts";
import { spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { type FillParams, tallyClue, withThorough } from "./game-id.ts";

const game = fillGame("sizing", sizing);
const fleetGame = fillGame("fleet", fleet);
const SHADED = 1;
const CROSSED = 2;

/** Why `g` refuses the params of `p`, or `null`. */
function refusal(
  p: FillParams,
  g: Pick<typeof game, "validateParams"> = game,
): string | null {
  if (g.validateParams === undefined) throw new Error("no validateParams");
  return g.validateParams(p, true);
}

const params = (w: number, n: number, diff = sizing.TIER.easy): FillParams => ({
  w,
  h: w,
  diff,
  sizes: { n },
});

describe("a size the params give beyond the grid's", () => {
  it("is written by its letter after the grid's, and read back", () => {
    expect(game.encodeParams(params(5, 2), true)).toBe("5n2de");
    expect(game.decodeParams("5n2de")).toEqual(params(5, 2));
    expect(game.decodeParams("5n1")).toEqual(params(5, 1));
  });

  it("is the Custom dialog's game mode, a ruleset a value from its least", () => {
    const mode = game.paramConfig.find((i) => i.name === "Game mode");
    if (mode === undefined || mode.type !== "choices") throw new Error("no game mode");
    expect(mode.choices).toEqual(["One a line", "Two a line"]);
    const p = params(5, 1);
    expect(mode.get(p)).toBe(0);
    mode.set(p, 1);
    expect(p.sizes).toEqual({ n: 2 });
  });

  it("refuses a board narrower than its ruleset's least", () => {
    expect(refusal(params(3, 2))).toBe("Two a line: the grid size must be at least 4.");
    expect(refusal(params(3, 1))).toBeNull();
    expect(refusal(params(4, 2))).toBeNull();
  });

  it("is read by the rules: a line holds that many", () => {
    // Two a line, none side by side, on 4x4: a checkerboard.
    const two = Uint8Array.from({ length: 16 }, (_, c) =>
      ((c % 4) + Math.floor(c / 4)) % 2 === 0 ? SHADED : CROSSED,
    );
    const sp = spaceOf(sizing, { w: 4, h: 4 });
    const clues = (n: number) => sizing.deriveClues(two, sp, {}, { n });
    expect(sizing.isAnswer(two, sp, clues(2))).toBe(true);
    expect(sizing.isAnswer(two, sp, clues(1))).toBe(false);
  });
});

describe("the bounds a board keeps beyond its sizes", () => {
  it("refuses a board below the least area, at any tier", () => {
    // The sizes allow a 2x2; the bounds do not.
    expect(refusal(params(2, 1))).toBe("The number of squares must be at least 9.");
    expect(refusal(params(3, 1))).toBeNull();
  });

  it("refuses a tier on a board below that tier's own", () => {
    expect(refusal(params(3, 1, sizing.TIER.normal))).toBe("No 3x3 puzzle is Normal.");
    expect(refusal(params(4, 1, sizing.TIER.normal))).toBeNull();
  });
});

describe("a tally of pieces the params give", () => {
  const p = (tally: number[], w = 5): FillParams => ({ w, h: w, diff: 0, tally });

  it("writes its size by its letter after the grid's and its counts at the end", () => {
    expect(fleetGame.encodeParams(p([2, 1]), true)).toBe("5x5f2de,2,1");
    expect(fleetGame.encodeParams(p([3, 0, 1]), false)).toBe("5x5f3,3,0,1");
  });

  it("reads a size's default counts, one more of each shorter, where none are given", () => {
    expect(fleetGame.decodeParams("5x5f3").tally).toEqual([3, 2, 1]);
    expect(fleetGame.decodeParams("5x5").tally).toEqual([2, 1]);
    // Counts the text runs out before are none.
    expect(fleetGame.decodeParams("5x5f2,1").tally).toEqual([1, 0]);
  });

  it("is two fields of the Custom dialog, a new size taking its default counts", () => {
    const field = (name: string) => {
      const f = fleetGame.paramConfig.find((i) => i.name === name);
      if (f === undefined || f.type !== "string") throw new Error(`no ${name}`);
      return f;
    };
    const q = p([2, 1]);
    // The default counts show blank.
    expect(field("Fleet configuration").get(q)).toBe("");
    field("Fleet size").set(q, "3");
    expect(q.tally).toEqual([3, 2, 1]);
    field("Fleet configuration").set(q, "0,1,1");
    expect(q.tally).toEqual([0, 1, 1]);
    expect(field("Fleet configuration").get(q)).toBe("0,1,1");
  });

  it("refuses a size past its bounds or the board's, and a tally of no piece", () => {
    const no = (q: FillParams) => refusal(q, fleetGame);
    expect(no(p([4, 3, 2, 1]))).toBe("Fleet size must be between 1 and 3.");
    expect(no(p([1, 1, 1], 2))).toBe(
      "Fleet size must be smaller than the width and height.",
    );
    expect(no(p([0, 0]))).toBe("The fleet must contain at least 1 piece.");
    expect(no(p([1, 1, 1], 3))).toBe("The fleet does not fit into the grid.");
    expect(no(p([1, 1, 1]))).toBeNull();
  });

  it("is the board clue the rules read: each length and its count", () => {
    expect(tallyClue(fleet.deal.tally, p([0, 1]))).toEqual({
      n: 2,
      length: [1, 2],
      boats: [0, 1],
    });
    // A piece of two along the top of a 3x3.
    const g = Uint8Array.from("##.......", (ch) => (ch === "#" ? 1 : 2));
    const sp = spaceOf(fleet, { w: 3, h: 3 });
    const holds = (boats: number[]) =>
      fleet.isAnswer(
        g,
        sp,
        fleet.deriveClues(g, sp, {}, { fleet: { n: 2, length: [1, 2], boats } }),
      );
    expect(holds([0, 1])).toBe(true);
    expect(holds([2, 0])).toBe(false);
    expect(holds([1, 1])).toBe(false);
  });
});

describe("a flag that hides more clues", () => {
  it("is written by its letter after the tier, and is the Custom dialog's", () => {
    const p: FillParams = { w: 5, h: 5, diff: 0, tally: [2, 1], hides: true };
    expect(fleetGame.encodeParams(p, true)).toBe("5x5f2deS,2,1");
    expect(fleetGame.decodeParams("5x5f2deS,2,1")).toEqual(p);
    expect(fleetGame.decodeParams("5x5f2de,2,1").hides).toBe(false);
    const flag = fleetGame.paramConfig.find((i) => i.name === "Remove numbers");
    if (flag === undefined || flag.type !== "boolean") throw new Error("no flag");
    expect(flag.get(p)).toBe(true);
    flag.set(p, false);
    expect(p.hides).toBe(false);
  });
});

describe("options only the deal reads", () => {
  const wallingGame = fillGame("walling", walling);
  const p = (w: number, h: number, walls: number, symmetry: number): FillParams => ({
    w,
    h,
    diff: 0,
    options: { walls, symmetry },
  });

  it("are written by their letters in a full ID alone, their defaults where absent", () => {
    expect(wallingGame.encodeParams(p(6, 6, 30, 1), true)).toBe("6x6b30s1de");
    expect(wallingGame.encodeParams(p(6, 6, 30, 1), false)).toBe("6x6");
    expect(wallingGame.decodeParams("6x6b30s1")).toEqual(p(6, 6, 30, 1));
    expect(wallingGame.decodeParams("6x6")).toEqual(p(6, 6, 20, 2));
  });

  it("are the Custom dialog's: a number, and a choice by its name", () => {
    const q = p(6, 6, 20, 2);
    const share = wallingGame.paramConfig.find((i) => i.name === "%age of walls");
    const symmetry = wallingGame.paramConfig.find((i) => i.name === "Symmetry");
    if (share?.type !== "string" || symmetry?.type !== "choices")
      throw new Error("no options");
    share.set(q, "45");
    symmetry.set(q, 3);
    expect(q.options).toEqual({ walls: 45, symmetry: 3 });
    expect(symmetry.choices).toEqual([
      "None",
      "2-way mirror",
      "2-way rotational",
      "4-way mirror",
      "4-way rotational",
    ]);
  });

  it("refuse a number past its bounds, and a choice the board's shape does not allow", () => {
    const no = (q: FillParams) => refusal(q, wallingGame);
    expect(no(p(6, 6, 4, 2))).toBe("%age of walls must be between 5 and 100.");
    expect(no(p(6, 5, 20, 4))).toBe("4-way rotational: the grid must be square.");
    expect(no(p(6, 5, 20, 3))).toBeNull();
    expect(no(p(6, 6, 20, 4))).toBeNull();
  });
});

describe("a hide the player may make less thorough", () => {
  const mirroringGame = fillGame("mirroring", mirroring);
  const p = (w: number, thorough: boolean): FillParams => ({
    w,
    h: w,
    diff: 0,
    thorough,
  });

  it("is written by its letter in a full ID where off, and read back", () => {
    expect(mirroringGame.encodeParams(p(5, false), true)).toBe("5x5h0de");
    expect(mirroringGame.encodeParams(p(5, true), true)).toBe("5x5de");
    expect(mirroringGame.encodeParams(p(5, false), false)).toBe("5x5");
    expect(mirroringGame.decodeParams("5x5h0").thorough).toBe(false);
    expect(mirroringGame.decodeParams("8x8h1").thorough).toBe(true);
  });

  it("is on by default narrower than its offFrom, and its label says where it is not", () => {
    expect(withThorough(mirroring.deal, p(6, false)).thorough).toBe(true);
    expect(withThorough(mirroring.deal, p(7, true)).thorough).toBe(false);
    const field = mirroringGame.paramConfig.find(
      (i) => i.name === "Aggressive generation",
    );
    if (field?.type !== "boolean") throw new Error("no thorough field");
    const words = (q: FillParams) =>
      field.label?.slot === "tail" ? field.label.words(q) : "no label";
    expect(words(p(6, true))).toBeNull();
    expect(words(p(6, false))).toBe("faster generation");
    expect(words(p(8, true))).toBe("slower generation");
  });
});
