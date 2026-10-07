/**
 * Frozen upstream boards for Boats: every description recorded from
 * `puzzles/unreleased/boats.c` must still validate, round-trip through the
 * codec, and be solved at the tier it was dealt at and at every tier above. That
 * keeps a description shared before the port readable, and pins the codec and
 * the solver's reach against boards this generator did not deal.
 *
 * It does not ask the generator to reproduce them. Upstream's `boats.c` reads a
 * boat's first square off the union-find's root, which was the smallest element
 * when it was written and is not in the `dsf.c` it was built against: no boat
 * of two squares or more was ever seen as finished, and the technique that
 * grows an unfinished boat never fired. The solver here asks for the smallest
 * element, so it decides more than upstream's did and its generator keeps
 * different boards. Generation is carried by `boats.test.ts` ("boats solver",
 * "boats generator") and by `difficulty-contract.test.ts`, which holds every
 * dealt board to its tier and to every cap above it.
 */
import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { paramsError } from "../../engine/params.ts";
import cReference from "./__fixtures__/boats-c-reference.json" with { type: "json" };
import { boatsGame } from "./index.ts";
import { solveBoats } from "./solver.ts";
import {
  type BoatsParams,
  boardOf,
  DIFFCOUNT,
  decodeFleet,
  encodeDesc,
  newState,
} from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  fleet: number;
  diff: number;
  strip: boolean;
  /** The fleet configuration as `encode_params` writes it, e.g. `"3,2,1"`. */
  fleetdata: string;
  seed: string;
  desc: string;
}

const data = cReference as { fixtures: Fixture[] };

describe("boats frozen upstream boards (decode, round-trip, solve from their tier up)", () => {
  it("has fixtures to check, at every tier", () => {
    expect(new Set(data.fixtures.map((f) => f.diff)).size).toBe(DIFFCOUNT);
  });

  for (const f of data.fixtures) {
    const name = `${f.w}x${f.h}f${f.fleet}d${f.diff}${f.strip ? "S" : ""} [${f.fleetdata}] seed=${f.seed}`;
    it(name, () => {
      const p: BoatsParams = {
        w: f.w,
        h: f.h,
        fleet: f.fleet,
        fleetData: decodeFleet(f.fleetdata, f.fleet),
        diff: f.diff,
        strip: f.strip,
      };
      expect(paramsError(boatsGame, p, true)).toBeNull();
      expect(validateDesc(boatsGame, p, f.desc)).toBeNull();
      const state = newState(p, f.desc);
      expect(encodeDesc(p.w, p.h, state.borderClues, state.gridClues)).toBe(f.desc);
      for (let cap = f.diff; cap < DIFFCOUNT; cap++)
        expect(solveBoats(boardOf(state), cap).kind, `cap ${cap}`).toBe("solved");
    });
  }
});
