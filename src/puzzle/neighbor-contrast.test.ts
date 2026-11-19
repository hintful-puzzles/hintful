/**
 * Two things a game paints side by side can be told apart in the dark scheme,
 * as the app paints them.
 *
 * Sokoban's derived dark wall sat 0.03 of lightness off its floor and could not
 * be told from it on a phone (owner, 2026-10-03). The pairs are read off each
 * game's own frames (`neighbor-contrast.ts`), so a game joins by being
 * registered and a new close pair fails here without anyone listing it.
 *
 * {@link CLOSE_ON_PURPOSE} is a ledger, one entry per pair with what the pair
 * is. It is held exact: an entry whose pair is no longer close fails, so it
 * cannot outlive its reason, and since entries are palette indices that is also
 * what catches a palette whose indices moved.
 *
 * A region fill beside the board's margin is close by the fills' design, not
 * by a game's choice, so {@link regionFillAtMargin} exempts it in every game
 * that paints one, known by the fill's token.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { resolvePalette } from "../engine/color/color-mkhighlight.ts";
import { REGION_FILLS } from "../engine/color/colors.ts";
import { getTsGame } from "../engine/registry.ts";
import { inSweep } from "../engine/testing/slow.ts";
import type { Color } from "../engine/types.ts";
import * as inertia from "../games/inertia/render.ts";
import * as sokoban from "../games/sokoban/render.ts";
import { puzzleIds } from "./catalog.ts";
import {
  MIN_DARK_DISTANCE,
  type SchemeNeighbor,
  schemeNeighbors,
  tooCloseInDark,
} from "./neighbor-contrast.ts";
import { schemeOf } from "./scheme-palettes.ts";

/** `kind:a:b` to what the pair is, per game. */
const CLOSE_ON_PURPOSE: Record<string, Record<string, string>> = {
  fifteen: {
    "mark:2:4":
      "a tile's lit bevel edge on its lifted face; the shadow edge carries the bevel",
    "area:3:5": "a tile's shadow edge beside the gap",
    "mark:3:5": "a tile's shadow edge beside the gap",
  },
  galaxies: {
    "mark:13:3": "a white dot's ink rim, white in the dark scheme; the dot carries it",
  },
  guess: {
    "mark:1:17": "the outline of a white peg, which is white",
  },
  pearl: {
    "area:4:15": "a white pearl on the loop; its black outline carries it",
  },
  sixteen: {
    "mark:2:4":
      "a tile's lit bevel edge on its lifted face; the shadow edge carries the bevel",
  },
  slide: {
    "area:0:20": "a block's lowlight edge beside the floor; its face clears it",
  },
  twiddle: {
    "mark:2:8":
      "a tile's lit bevel edge on its lifted face; the shadow edge carries the bevel",
  },
  undead: {
    "area:0:8": "a vampire's body on the board; its ink outline carries it",
  },
};

/**
 * Whether a pair is a region's fill beside the board's margin. The region
 * fills are made at the margin's own lightness, so that a board of them is
 * evenly light (`REGION_DESIGN`, `engine/color/colors.ts`), and the board's
 * edge is what is drawn between a region and the margin.
 */
function regionFillAtMargin(id: string): (p: SchemeNeighbor) => boolean {
  const game = getTsGame(id);
  if (!game) throw new Error(`${id} is not registered`);
  // The tokens themselves, as `colors` returns them; any host will do.
  const palette = resolvePalette(game, [1, 1, 1]);
  const margin = schemeOf(id).board;
  const fills = new Set<Color>(REGION_FILLS);
  return (p) =>
    p.kind === "area" &&
    (p.a === margin || p.b === margin) &&
    fills.has(palette[p.a === margin ? p.b : p.a]);
}

/** The games a region fill was exempted in, as the sweep finds them. */
const exemptedIn = new Set<string>();

describe("neighbors stand apart in the dark scheme", () => {
  for (const id of puzzleIds) {
    it(`${id}: no pair is closer than the floor, but the ones on purpose`, () => {
      const pairs = schemeNeighbors(id);
      // A frame that painted nothing would pass everything below.
      expect(pairs.length).toBeGreaterThanOrEqual(3);
      const atMargin = regionFillAtMargin(id);
      const tooClose = pairs.filter(tooCloseInDark);
      if (tooClose.some(atMargin)) exemptedIn.add(id);
      const close = tooClose
        .filter((p) => !atMargin(p))
        .map((p) => `${p.kind}:${p.a}:${p.b}`)
        .sort();
      expect(close).toEqual(Object.keys(CLOSE_ON_PURPOSE[id] ?? {}).sort());
    });
  }

  // The exemption is found by the token, so a fill that stopped being one, or
  // a margin the scheme misplaced, would leave it exempting nothing.
  it("exempts a region fill at the margin where one is painted", () => {
    expect([...exemptedIn]).toEqual(
      expect.arrayContaining(["map", "norinori", "starbattle"].filter(inSweep)),
    );
  });

  it("names only games that exist", () => {
    for (const id of Object.keys(CLOSE_ON_PURPOSE)) expect(puzzleIds).toContain(id);
  });

  // The pair this guard exists for is on the frames it reads, so the floor is
  // being applied to it and not merely to its neighbors.
  for (const [id, wall, floor] of [
    ["sokoban", sokoban.COL_WALL, sokoban.COL_FLOOR],
    ["inertia", inertia.COL_WALL, inertia.COL_FLOOR],
  ] as const) {
    it(`${id}: the wall beside the floor is one of the pairs measured`, () => {
      const pair = schemeNeighbors(id).find(
        (p) =>
          p.kind === "area" && [p.a, p.b].includes(wall) && [p.a, p.b].includes(floor),
      );
      expect(pair?.dark).toBeGreaterThanOrEqual(MIN_DARK_DISTANCE);
    });
  }
});
