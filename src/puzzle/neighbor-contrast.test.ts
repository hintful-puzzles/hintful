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
 * that paints one, known by the fill's token. So is one edge of a bevel whose
 * other edge stands off the same neighbor ({@link bevelCarried}), known by the
 * game's `darkSwaps`.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { resolvePalette } from "../engine/color/color-mkhighlight.ts";
import { REGION_FILLS } from "../engine/color/colors.ts";
import { getTsGame } from "../engine/registry.ts";
import { expectLedger } from "../engine/testing/ledger.ts";
import { inSweep } from "../engine/testing/slow.ts";
import type { Color } from "../engine/types.ts";
import * as inertia from "../games/inertia/render.ts";
import * as sokoban from "../games/sokoban/render.ts";
import { puzzleIds } from "./catalog.ts";
import {
  colorDistance,
  MIN_DARK_DISTANCE,
  type SchemeNeighbor,
  schemeNeighbors,
  tooCloseInDark,
} from "./neighbor-contrast.ts";
import { schemeOf, schemePalettes } from "./scheme-palettes.ts";

/** `kind:a:b` to what the pair is, per game. */
const CLOSE_ON_PURPOSE: Record<string, Record<string, string>> = {
  galaxies: {
    "mark:15:8": "a white dot's ink rim, white in the dark scheme; the dot carries it",
  },
  guess: {
    "mark:1:17": "the outline of a white peg, which is white",
  },
  pearl: {
    "area:9:15": "a white pearl on the loop; its black outline carries it",
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

/**
 * Whether a pair is one edge of a bevel beside a color its other edge stands
 * off: a tile's lit edge on its face, its shadow edge beside the gap. A bevel
 * is the two indices dark mode exchanges (`darkSwaps`), drawn as opposite
 * edges of one shape, so where one edge sinks into its neighbor the other
 * still outlines the shape.
 */
function bevelCarried(id: string): (p: SchemeNeighbor) => boolean {
  const swaps = schemeOf(id).darkSwaps;
  const { dark } = schemePalettes(id);
  const otherEdge = (i: number): number | null => {
    for (const [x, y] of swaps) {
      if (i === x) return y;
      if (i === y) return x;
    }
    return null;
  };
  const clears = (edge: number, beside: number): boolean => {
    const other = otherEdge(edge);
    return (
      other !== null && colorDistance(dark[other], dark[beside]) >= MIN_DARK_DISTANCE
    );
  };
  return (p) => p.kind !== "text" && (clears(p.a, p.b) || clears(p.b, p.a));
}

/** The games a region fill was exempted in, as the sweep finds them. */
const exemptedIn = new Set<string>();
/** The games a bevel edge was exempted in. */
const bevelIn = new Set<string>();

describe("neighbors stand apart in the dark scheme", () => {
  for (const id of puzzleIds) {
    it(`${id}: no pair is closer than the floor, but the ones on purpose`, () => {
      const pairs = schemeNeighbors(id);
      // A frame that painted nothing would pass everything below.
      expect(pairs.length).toBeGreaterThanOrEqual(3);
      const atMargin = regionFillAtMargin(id);
      const carried = bevelCarried(id);
      const tooClose = pairs.filter(tooCloseInDark);
      if (tooClose.some(atMargin)) exemptedIn.add(id);
      if (tooClose.some(carried)) bevelIn.add(id);
      const close = tooClose
        .filter((p) => !atMargin(p) && !carried(p))
        .map((p) => `${p.kind}:${p.a}:${p.b}`)
        .sort();
      expectLedger(close, CLOSE_ON_PURPOSE[id] ?? {}, {
        table: `CLOSE_ON_PURPOSE.${id}`,
        file: "src/puzzle/neighbor-contrast.test.ts",
        found: "palette pairs drawn side by side closer than the dark floor",
        add: "pull the two colors apart in the dark scheme, or add the pair with why it is close on purpose",
      });
    });
  }

  // The exemption is found by the token, so a fill that stopped being one, or
  // a margin the scheme misplaced, would leave it exempting nothing.
  it("exempts a region fill at the margin where one is painted", () => {
    expect([...exemptedIn]).toEqual(
      expect.arrayContaining(["map", "norinori", "starbattle"].filter(inSweep)),
    );
  });

  // Likewise a bevel's: a swap that stopped being declared would leave it
  // exempting nothing, and the tiles' close edges would fail above instead.
  it("exempts a bevel edge where its other edge clears", () => {
    expect([...bevelIn]).toEqual(
      expect.arrayContaining(
        ["fifteen", "sixteen", "slide", "twiddle"].filter(inSweep),
      ),
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
