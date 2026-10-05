import { describe, expect, it } from "vitest";
import { difficultyItem } from "./difficulty.ts";
import type { ParamConfigItem } from "./game.ts";
import { presetGrid } from "./preset-grid.ts";

interface P {
  w: number;
  diff: number;
  wrap: boolean;
}

const tiered: ParamConfigItem<P>[] = [
  difficultyItem<P>(["Easy", "Normal", "Tricky"], "diff"),
];
const board = (w: number): P => ({ w, diff: 0, wrap: false });
const lines = (menu: { submenu?: { params?: P }[] }) =>
  (menu.submenu ?? []).map((m) => `${m.params?.w}/${m.params?.diff}`);

describe("presetGrid", () => {
  it("offers each board at every tier, easiest first", () => {
    expect(lines(presetGrid(tiered, [4, 6].map(board)))).toEqual([
      "4/0",
      "4/1",
      "4/2",
      "6/0",
      "6/1",
      "6/2",
    ]);
  });

  it("stops a board at the tiers the game gives it", () => {
    const menu = presetGrid(tiered, [4, 6].map(board), {
      tiers: (p) => (p.w === 6 ? [1, 2] : null),
    });
    expect(lines(menu)).toEqual(["4/0", "4/1", "4/2", "6/1", "6/2"]);
  });

  it("puts the variants after the grid, as they stand", () => {
    const wrapping = { ...board(6), diff: 1, wrap: true };
    const menu = presetGrid(tiered, [board(4)], { variants: [wrapping] });
    expect(menu.submenu?.at(-1)?.params).toEqual(wrapping);
    expect(menu.submenu).toHaveLength(4);
  });

  it("lists the boards of a game without tiers", () => {
    expect(lines(presetGrid<P>([], [4, 6].map(board)))).toEqual(["4/0", "6/0"]);
  });

  it("hands out params of its own", () => {
    const boards = [board(4)];
    const menu = presetGrid<P>([], boards);
    expect(menu.submenu?.[0]?.params).not.toBe(boards[0]);
  });
});
