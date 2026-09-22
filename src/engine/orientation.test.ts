/**
 * **Boards are dealt for a phone held upright.** Two guarantees, both read off
 * what each registered game already is:
 *
 * 1. Every default and every preset draws no wider than tall, judged by the
 *    game's own `computeSize`: the pixels a player gets, never the params'
 *    field names. A clue margin, a fleet panel or a tiling's cell shape all
 *    decide the drawn aspect, and a census keyed on `w > h` counted those
 *    wrong. The exceptions are a ledger of boards whose shape is the puzzle's
 *    own.
 * 2. A game that can turn its params (`Game.transposeParams`) turns them into
 *    valid params, turns them back exactly, and draws the turned board as the
 *    same board on its side. That last property is what lets the midend's
 *    deal-time choice between the two be a plain comparison of tile sizes.
 *
 * Who may turn is derived: every game whose Custom dialog asks for a width and
 * a height either has `transposeParams` or is in {@link NOT_TURNED} with the
 * reason a tall board of it is a different game.
 */

import { describe, expect, it } from "vitest";
import type { PresetMenu } from "./game.ts";
import {
  type AnyGame,
  type AnyParams,
  PARAMS_GAMES,
  REGISTERED_GAME_COUNT,
} from "./testing/params-corpus.ts";
import type { Size } from "./types.ts";

/** Within this of square a board gains nothing from being turned. */
const SQUARE_TOLERANCE = 1.02;

/** Boards that draw wider than tall because of what they are, by game and
 * encoded params. Held exactly right below: an entry nothing needs fails. */
const WIDE_BY_NATURE: Record<string, { reason: string; params: string[] }> = {
  cube: {
    reason:
      "Each solid rolls on a triangle grid sized to that solid, which draws " +
      "about 1.12 wide at every size; there is no taller grid of the same solid.",
    params: ["t1x2", "o2x2", "i3x3"],
  },
  ascent: {
    reason:
      "Hexagon mode's board is a regular hexagon, wider across its corners " +
      "than across its flats at every size.",
    params: ["7x7mH", "9x9mH"],
  },
};

/** Games with a width and a height that deliberately cannot be turned. */
const NOT_TURNED: Record<string, string> = {
  bricks:
    "Gravity: a shaded brick rests on the row below, and no three may lie in " +
    "a horizontal line.",
  samegame: "Gravity: tiles fall down and emptied columns close up leftward.",
  slide:
    "The key block starts in the top-left corner and leaves by a gate in the " +
    "right-hand wall.",
};

/** Games whose turned board does not exchange its drawn width and height
 * exactly, because something is drawn along one side only. Turning them is
 * still sound: the midend compares the real tile size of each orientation. */
const UNEVEN_FRAME: Record<string, string> = {
  abcd: "One pixel of tile-background allowance is added to the width only.",
  boats: "The fleet is drawn in a panel below the grid.",
  crossing: "The list of numbers to place is drawn below the grid.",
  undead: "The monster counts are drawn in a band above the grid.",
};

const TILE_SIZES = [17, 32];

function leaves(menu: PresetMenu<AnyParams>): AnyParams[] {
  if (menu.params !== undefined) return [menu.params];
  return (menu.submenu ?? []).flatMap(leaves);
}

/** The default and every preset leaf, deduplicated by encoding. */
function menuParams(game: AnyGame): AnyParams[] {
  const all = [game.defaultParams(), ...leaves(game.presets())];
  const seen = new Set<string>();
  return all.filter((p) => {
    const key = game.encodeParams(p, true);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The menu's boards, plus each one made a column wider through the Custom
 * dialog's own width item where that is still valid (two wider, for a game
 * that wants even sizes). Most menu boards are square, and a square board turns
 * into itself, so without these the exchange below could hardly fail. */
function boardsToTurn(game: AnyGame): AnyParams[] {
  const width = (game.paramConfig ?? []).find((item) => item.kw === "width");
  const out = menuParams(game);
  if (width === undefined || width.type !== "string") return out;
  for (const p of menuParams(game)) {
    for (const extra of [1, 2]) {
      const q = structuredClone(p);
      width.set(q, String(Number(width.get(q)) + extra));
      if (game.validateParams(q, true) === null) {
        out.push(q);
        break;
      }
    }
  }
  return out;
}

function drawn(game: AnyGame, p: AnyParams): Size {
  return game.computeSize(p, game.preferredTileSize ?? 32);
}

function hasWidthAndHeight(game: AnyGame): boolean {
  const kws = new Set((game.paramConfig ?? []).map((item) => item.kw));
  return kws.has("width") && kws.has("height");
}

describe("portrait by default", () => {
  it("looks at every game and a menu's worth of boards", () => {
    expect(PARAMS_GAMES.length).toBe(REGISTERED_GAME_COUNT);
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
    const boards = PARAMS_GAMES.reduce((n, [, g]) => n + menuParams(g).length, 0);
    expect(boards).toBeGreaterThanOrEqual(400);
  });

  it("draws no default or preset wider than tall, outside the ledger", () => {
    const wide: string[] = [];
    for (const [id, game] of PARAMS_GAMES) {
      for (const p of menuParams(game)) {
        const { w, h } = drawn(game, p);
        if (w > h * SQUARE_TOLERANCE) wide.push(`${id}:${game.encodeParams(p, false)}`);
      }
    }
    const ledger = Object.entries(WIDE_BY_NATURE).flatMap(([id, e]) =>
      e.params.map((p) => `${id}:${p}`),
    );
    expect([...new Set(wide)].sort()).toEqual(ledger.sort());
  });
});

describe("turning a board on its side", () => {
  const TURNING = PARAMS_GAMES.filter(([, g]) => g.transposeParams !== undefined);

  it("has a population, and a known positive in it", () => {
    expect(TURNING.map(([id]) => id)).toContain("magnets");
    expect(TURNING.length).toBeGreaterThanOrEqual(30);
  });

  it("is offered by every game with a width and a height, or excused", () => {
    const missing = PARAMS_GAMES.filter(
      ([, g]) => hasWidthAndHeight(g) && g.transposeParams === undefined,
    ).map(([id]) => id);
    expect(missing.sort()).toEqual(Object.keys(NOT_TURNED).sort());
    // An excuse for a game that turns after all, or has no width to turn, is
    // stale.
    for (const id of Object.keys(NOT_TURNED)) {
      const game = PARAMS_GAMES.find(([g]) => g === id)?.[1];
      expect(`${id}:${game !== undefined && hasWidthAndHeight(game)}`).toBe(
        `${id}:true`,
      );
    }
  });

  it("turns valid params into valid params and back again", () => {
    let turned = 0;
    for (const [id, game] of TURNING) {
      for (const p of boardsToTurn(game)) {
        const t = game.transposeParams?.(p) ?? null;
        if (t === null) continue;
        turned++;
        expect(`${id}:${game.validateParams(t, true)}`).toBe(`${id}:null`);
        const back = game.transposeParams?.(t) ?? null;
        expect(back === null ? null : game.encodeParams(back, true)).toBe(
          game.encodeParams(p, true),
        );
      }
    }
    expect(turned).toBeGreaterThanOrEqual(200);
  });

  it("draws the turned board as the same board on its side", () => {
    const uneven = new Set<string>();
    const nonSquare = new Set<string>();
    for (const [id, game] of TURNING) {
      for (const p of boardsToTurn(game)) {
        const t = game.transposeParams?.(p) ?? null;
        if (t === null) continue;
        for (const ts of TILE_SIZES) {
          const a = game.computeSize(p, ts);
          const b = game.computeSize(t, ts);
          if (a.w !== b.h || a.h !== b.w) uneven.add(id);
          if (a.w !== a.h) nonSquare.add(id);
        }
      }
    }
    expect([...uneven].sort()).toEqual(Object.keys(UNEVEN_FRAME).sort());
    // Every turning game was checked on a board the exchange could get wrong.
    expect(TURNING.map(([id]) => id).filter((id) => !nonSquare.has(id))).toEqual([]);
  });
});
