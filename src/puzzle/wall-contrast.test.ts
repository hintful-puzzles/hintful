/**
 * A movement game's walls stand clear of its floor in both schemes, as the app
 * paints them (`scheme-palettes.ts`), not as the token table says.
 *
 * Derived, the dark wall sat 0.03 of lightness off the floor and could not be
 * told apart on a phone (owner, 2026-10-03), so `wallColor` authors its dark
 * value; this holds the gap that value was chosen for. The games are those
 * that call `wallColor` (`npm run refs -- src/engine/color/palette.ts
 * wallColor`), with their palette indices.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { colorToOKLCH } from "../utils/color.ts";
import { schemePalettes } from "./scheme-palettes.ts";

const WALLS: Record<string, { floor: number; wall: number }> = {
  inertia: { floor: 0, wall: 8 },
  sokoban: { floor: 0, wall: 11 },
};

/** The least lightness between a wall's face and the floor, in either scheme. */
const MIN_GAP = 0.08;

describe("walls stand clear of the floor", () => {
  for (const [id, { floor, wall }] of Object.entries(WALLS)) {
    it(`${id}: in the dark scheme`, () => {
      const { dark } = schemePalettes(id);
      const l = (i: number) => colorToOKLCH(dark[i])[0];
      expect(Math.abs(l(wall) - l(floor))).toBeGreaterThanOrEqual(MIN_GAP);
    });
  }
});
