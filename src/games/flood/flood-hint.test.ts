/**
 * Flood's hint: the solver's fills, one step each.
 *
 * Its one rung is pinned by a position it fires on, through
 * `testing/hint-positions.ts`, which also holds the scan that finds it.
 */

import { describe, expect, it } from "vitest";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { floodGame } from "./index.ts";

const G = floodGame;

const pinned = describeHintPins({
  game: G,
  params: [G.decodeParams("4x4c3m0"), G.decodeParams("12x12c6m5")],
  seeds: 6,
  pins: {
    /** Held on 130 of 130 positions walked. */
    fill: "4x4c3m0:0122212020122122,5",
  },
});

describe("Flood hint sentences", () => {
  it("fill: draws what it says", () => {
    const { state, step } = pinned("fill");
    expect(bindingDefects(G, state, G.newUi(state), step)).toEqual([]);
  });
});
