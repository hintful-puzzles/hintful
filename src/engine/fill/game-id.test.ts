/**
 * A fill game's params, on the `sizing` fixture: a size beyond the grid's
 * that the params give and the rules read, its rulesets as the Custom
 * dialog's game mode with the narrowest board each has an answer on, and the
 * bounds the board and a tier keep beyond the sizes'.
 */

import { describe, expect, it } from "vitest";
import * as sizing from "../../generated/engine/testing/fixtures/sizing/sizing.compiled.ts";
import { spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillParams } from "./game-id.ts";

const game = fillGame("sizing", sizing);
const SHADED = 1;
const CROSSED = 2;

/** Why the params of `p` are refused, or `null`. */
function refusal(p: FillParams): string | null {
  if (game.validateParams === undefined) throw new Error("no validateParams");
  return game.validateParams(p, true);
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
