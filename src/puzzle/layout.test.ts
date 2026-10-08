/**
 * **Every layout a player can reach lays out, with each panel in a place of
 * its own.**
 *
 * The docking settings are constrained so that a collision cannot be
 * expressed, and this is what holds the grid to that: it enumerates every
 * state the settings and the window can produce, and asserts that each region
 * present owns exactly one rectangle of the grid. A region given no cell would
 * be auto-placed by the browser, over or beside the board; two regions given
 * one name would be drawn on top of each other.
 *
 * What it cannot see is pixels: that the tracks are wide enough is checked in
 * the browser (`docs/games/input.md`, "The puzzle screen's three panels").
 */
import { describe, expect, it } from "vitest";
import {
  type ControlsSide,
  DEFAULT_SHAPE_LAYOUT,
  gridLayout,
  gridTemplateAreas,
  type LayoutState,
  menuFits,
  type Region,
  type ShapeLayout,
  WINDOW_SHAPES,
  windowShape,
} from "./layout.ts";

const SIDES: ControlsSide[] = ["left", "right"];
const BARS: ShapeLayout["bar"][] = ["bottom", "side"];
const CONTROLS: ShapeLayout["controls"][] = ["side", "under"];
const FLAGS = [false, true];

/** Every state the settings and the window can produce. */
function everyState(): LayoutState[] {
  const states: LayoutState[] = [];
  for (const shape of WINDOW_SHAPES)
    for (const controlsSide of SIDES)
      for (const bar of BARS)
        for (const controls of CONTROLS)
          for (const menuDocked of FLAGS)
            for (const reference of FLAGS)
              states.push({
                shape,
                controlsSide,
                bar,
                controls,
                menuDocked,
                reference,
              });
  return states;
}

/** The regions `state` must place: the four every layout has, and the two
 * that are sometimes there. */
function regionsOf(state: LayoutState): Region[] {
  return [
    "top",
    "board",
    "words",
    "controls",
    "bar",
    ...(state.menuDocked ? (["menu"] as const) : []),
    ...(state.reference ? (["reference"] as const) : []),
  ];
}

/** The cells `region` occupies, or `null` when they are not one rectangle. */
function rectangleOf(
  areas: readonly (readonly Region[])[],
  region: Region,
): { rows: [number, number]; columns: [number, number] } | null {
  const cells: [number, number][] = [];
  areas.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === region) cells.push([r, c]);
    });
  });
  if (cells.length === 0) return null;
  const rows = cells.map(([r]) => r);
  const columns = cells.map(([, c]) => c);
  const box = {
    rows: [Math.min(...rows), Math.max(...rows)] as [number, number],
    columns: [Math.min(...columns), Math.max(...columns)] as [number, number],
  };
  const area = (box.rows[1] - box.rows[0] + 1) * (box.columns[1] - box.columns[0] + 1);
  return area === cells.length ? box : null;
}

describe("the puzzle screen's grid", () => {
  it("enumerates a real population", () => {
    expect(everyState()).toHaveLength(3 * 2 * 2 * 2 * 2 * 2);
  });

  it("gives every region present exactly one rectangle, and no other region a cell", () => {
    for (const state of everyState()) {
      const grid = gridLayout(state);
      const label = JSON.stringify(state);
      const expected = regionsOf(state);

      // A well-formed template: every row as long as the column list.
      expect(grid.rows, label).toHaveLength(grid.areas.length);
      for (const row of grid.areas)
        expect(row, label).toHaveLength(grid.columns.length);

      for (const region of expected) {
        expect(
          rectangleOf(grid.areas, region),
          `${region} has no rectangle of its own in ${label}`,
        ).not.toBeNull();
      }
      const named = new Set(grid.areas.flat());
      expect([...named].sort(), label).toEqual([...expected].sort());
    }
  });

  it("flexes the board's row and column, and only those", () => {
    for (const state of everyState()) {
      const grid = gridLayout(state);
      const board = rectangleOf(grid.areas, "board");
      if (!board) throw new Error("no board");
      expect(board.rows[0]).toBe(board.rows[1]);
      expect(board.columns[0]).toBe(board.columns[1]);
      expect(grid.rows.filter((size) => size.includes("1fr"))).toEqual([
        grid.rows[board.rows[0]],
      ]);
      expect(grid.columns.filter((size) => size.includes("1fr"))).toEqual([
        grid.columns[board.columns[0]],
      ]);
    }
  });

  it("puts the Menu on the side opposite the Game controls", () => {
    const docked = everyState().filter((state) => state.menuDocked);
    expect(docked).toHaveLength(48);
    for (const state of docked) {
      const { areas } = gridLayout(state);
      const menu = rectangleOf(areas, "menu");
      const board = rectangleOf(areas, "board");
      if (!menu || !board) throw new Error("unplaced");
      // One column against the board, from the top down to a bottom Bar.
      const step = state.controlsSide === "right" ? -1 : 1;
      expect(menu.columns).toEqual([board.columns[0] + step, board.columns[0] + step]);
      expect(menu.rows).toEqual([
        0,
        state.bar === "side" ? areas.length - 1 : areas.length - 2,
      ]);
    }

    // Where the Game controls are beside the board, the board lies between
    // them and the Menu.
    const beside = docked.filter((state) => state.controls === "side");
    expect(beside).toHaveLength(24);
    for (const state of beside) {
      const { areas } = gridLayout(state);
      const controls = rectangleOf(areas, "controls");
      const board = rectangleOf(areas, "board");
      if (!controls || !board) throw new Error("unplaced");
      expect(controls.columns[0] > board.columns[0]).toBe(
        state.controlsSide === "right",
      );
    }
  });

  it("keeps a side Bar at the window's edge, the whole height", () => {
    const sideBars = everyState().filter((state) => state.bar === "side");
    expect(sideBars).toHaveLength(48);
    for (const state of sideBars) {
      const { areas } = gridLayout(state);
      const last = areas[0].length - 1;
      const bar = rectangleOf(areas, "bar");
      expect(bar?.rows).toEqual([0, areas.length - 1]);
      expect(bar?.columns).toEqual(
        state.controlsSide === "right" ? [0, 0] : [last, last],
      );
    }
  });

  /**
   * The `Menu` button must be under the pointer that opened the Menu. The Bar
   * holds still when the Menu's column is inside the Bar's span, or is on the
   * same side of the Bar as the board's column, which is the one that flexes
   * and gives the Menu its width.
   */
  it("leaves the Bar where it was when the Menu docks", () => {
    const docked = everyState().filter((state) => state.menuDocked);
    expect(docked).toHaveLength(48);
    for (const state of docked) {
      const grid = gridLayout(state);
      const bar = rectangleOf(grid.areas, "bar");
      const board = rectangleOf(grid.areas, "board");
      const menu = grid.areas[0].indexOf("menu");
      if (!bar || !board || menu < 0) throw new Error("unplaced");
      const side = (column: number) =>
        column < bar.columns[0] ? "before" : column > bar.columns[1] ? "after" : "in";
      const held = side(menu) === "in" || side(menu) === side(board.columns[0]);
      expect(held, JSON.stringify(state)).toBe(true);
      // And no row comes or goes with the Menu.
      expect(grid.rows).toEqual(gridLayout({ ...state, menuDocked: false }).rows);
    }
  });

  it("leaves the top row to the readouts", () => {
    for (const state of everyState()) {
      const top = gridLayout(state).areas[0];
      expect(
        top.filter((cell) => !["top", "menu", "bar", "reference"].includes(cell)),
      ).toEqual([]);
      expect(top).toContain("top");
    }
  });

  it("writes a template the browser reads", () => {
    expect(
      gridTemplateAreas(
        gridLayout({
          shape: "wide",
          controlsSide: "right",
          ...DEFAULT_SHAPE_LAYOUT.wide,
          menuDocked: true,
          reference: false,
        }).areas,
      ),
    ).toBe(
      '"menu top top" "menu board controls" "menu words controls" "bar bar controls"',
    );
    expect(
      gridTemplateAreas(
        gridLayout({
          shape: "tall",
          controlsSide: "right",
          ...DEFAULT_SHAPE_LAYOUT.tall,
          menuDocked: false,
          reference: false,
        }).areas,
      ),
    ).toBe('"top" "board" "words" "controls" "bar"');
  });
});

describe("the window's shape", () => {
  it("is tall when portrait, and wide or short by a landscape window's height", () => {
    expect(windowShape(390, 844, 16)).toBe("tall");
    expect(windowShape(768, 1024, 16)).toBe("tall");
    expect(windowShape(800, 1000, 16)).toBe("tall");
    expect(windowShape(1440, 900, 16)).toBe("wide");
    expect(windowShape(1280, 600, 16)).toBe("wide");
    expect(windowShape(844, 390, 16)).toBe("short");
    expect(windowShape(1000, 373, 16)).toBe("short");
    // In rem: a touch device's larger root font makes the same window short.
    expect(windowShape(1024, 600, 19.2)).toBe("short");
  });

  it("docks the Menu only where the board loses nothing to it", () => {
    const wide = DEFAULT_SHAPE_LAYOUT.wide;
    expect(menuFits(1440, 900, 16, wide)).toBe(true);
    expect(menuFits(1280, 720, 16, wide)).toBe(true);
    // Narrowed until the board would be squeezed: the Menu opens over it.
    expect(menuFits(800, 720, 16, wide)).toBe(false);
    expect(menuFits(390, 844, 16, DEFAULT_SHAPE_LAYOUT.tall)).toBe(false);
  });
});
