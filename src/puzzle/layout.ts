/**
 * **Where the puzzle screen's panels dock.** A pure function from the player's
 * layout choices and the window's shape to one CSS grid, so that every
 * viewport rule is a default a player can change and no panel carries a media
 * query of its own.
 *
 * The choices are constrained so that a collision cannot be expressed: the
 * Game controls have a side, the Menu takes the other one, and a side Bar is
 * at that window edge with the Menu between it and the board. Nothing docks to
 * the top, where the readout row is.
 *
 * **Opening the Menu moves no part of the Bar.** A side Bar is outside the
 * Menu's column, and a bottom Bar runs under it, so the `Menu` button that
 * opened the Menu is under the pointer to close it.
 */

/** Tall is portrait. A landscape window is `wide`, or `short` below
 * {@link SHORT_BELOW_REM} of height: a desktop and a landscape phone are both
 * landscape and want different defaults, so two orientations are not enough. */
export type WindowShape = "tall" | "wide" | "short";

export const WINDOW_SHAPES: readonly WindowShape[] = ["tall", "wide", "short"];

/** The height, in rem, below which a landscape window is `short`. In rem
 * because the root font size grows on a touch device, and the chrome with it. */
const SHORT_BELOW_REM = 34;

export type ControlsSide = "left" | "right";

/** The choices kept separately for each window shape. */
export interface ShapeLayout {
  readonly bar: "bottom" | "side";
  readonly controls: "side" | "under";
  /** Keep the Menu docked open when it fits beside the board. */
  readonly keepMenuOpen: boolean;
}

export const DEFAULT_SHAPE_LAYOUT: Readonly<Record<WindowShape, ShapeLayout>> = {
  tall: { bar: "bottom", controls: "under", keepMenuOpen: false },
  wide: { bar: "bottom", controls: "side", keepMenuOpen: true },
  short: { bar: "side", controls: "side", keepMenuOpen: false },
};

export function windowShape(width: number, height: number, rem: number): WindowShape {
  if (height >= width) return "tall";
  return height >= SHORT_BELOW_REM * rem ? "wide" : "short";
}

/** Widths the fit test and the grid share, in rem. */
const MENU_REM = 15.75;
const SIDE_BAR_REM = 4.75;
/** The room a side column of Game controls is assumed to take when asking
 * whether the Menu fits; its real width is its content's. */
const CONTROLS_REM = 8.25;
/** The readout row and a bottom Bar, together. */
const ROWS_REM = 6.5;

/**
 * Whether the Menu can dock without squeezing the board: what is left of the
 * width must be nearly as wide as the board area is high, so that a square
 * board loses nothing to it.
 */
export function menuFits(
  width: number,
  height: number,
  rem: number,
  layout: Pick<ShapeLayout, "bar" | "controls">,
): boolean {
  if (height >= width) return false;
  const beside =
    MENU_REM +
    (layout.bar === "side" ? SIDE_BAR_REM : 0) +
    (layout.controls === "side" ? CONTROLS_REM : 0);
  const boardWidth = width - beside * rem;
  const boardHeight =
    height - (layout.bar === "bottom" ? ROWS_REM : ROWS_REM / 2) * rem;
  return boardWidth >= 0.9 * boardHeight;
}

/** Every region of the puzzle screen's grid. `top` is the readout row and
 * `words` the status line and the hint's explanation, under the board. */
export type Region =
  | "top"
  | "board"
  | "words"
  | "controls"
  | "bar"
  | "menu"
  | "reference";

export interface LayoutState {
  readonly shape: WindowShape;
  readonly controlsSide: ControlsSide;
  readonly bar: ShapeLayout["bar"];
  readonly controls: ShapeLayout["controls"];
  /** The Menu is docked in the grid; otherwise it opens over the board. */
  readonly menuDocked: boolean;
  /** The reference panel is open. */
  readonly reference: boolean;
}

export interface GridLayout {
  /** One row of region names per grid row. */
  readonly areas: readonly (readonly Region[])[];
  readonly columns: readonly string[];
  readonly rows: readonly string[];
}

const REFERENCE_COLUMN = "min(340px, 42vw)";
/** As tall as its pieces need, and no taller than leaves the board its room. */
const REFERENCE_ROW = "fit-content(min(45vh, 22rem))";

/**
 * The grid for `state`, written for Game controls on the right and mirrored
 * for the left.
 *
 * A Bar along the bottom runs under the board and under a docked Menu, and a
 * side column of Game controls runs the full height beside them.
 */
export function gridLayout(state: LayoutState): GridLayout {
  const controlsBeside = state.controls === "side";
  const barBeside = state.bar === "side";
  // A reference beside the board needs a landscape window; a tall one puts it
  // under the board, above the Game controls.
  const referenceBeside = state.reference && state.shape !== "tall";
  const referenceUnder = state.reference && state.shape === "tall";

  const columns: { size: string; cell: (row: Region) => Region }[] = [];
  if (barBeside) columns.push({ size: "auto", cell: () => "bar" });
  if (state.menuDocked) {
    columns.push({
      size: `${MENU_REM}rem`,
      cell: (row) => (row === "bar" ? "bar" : "menu"),
    });
  }
  columns.push({ size: "minmax(0, 1fr)", cell: (row) => row });
  if (controlsBeside) {
    columns.push({ size: "auto", cell: (row) => (row === "top" ? "top" : "controls") });
  }
  if (referenceBeside)
    columns.push({ size: REFERENCE_COLUMN, cell: () => "reference" });

  const rows: { size: string; region: Region }[] = [
    { size: "auto", region: "top" },
    { size: "minmax(0, 1fr)", region: "board" },
    { size: "auto", region: "words" },
  ];
  if (referenceUnder) rows.push({ size: REFERENCE_ROW, region: "reference" });
  if (!controlsBeside) rows.push({ size: "auto", region: "controls" });
  if (!barBeside) rows.push({ size: "auto", region: "bar" });

  const ordered = state.controlsSide === "right" ? columns : [...columns].reverse();
  return {
    areas: rows.map((row) => ordered.map((column) => column.cell(row.region))),
    columns: ordered.map((column) => column.size),
    rows: rows.map((row) => row.size),
  };
}

/** The CSS value that names {@link GridLayout.areas} as a grid's areas. */
export function gridTemplateAreas(areas: GridLayout["areas"]): string {
  return areas.map((row) => `"${row.join(" ")}"`).join(" ");
}
