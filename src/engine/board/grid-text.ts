/**
 * A game's plain-text board (`Game.textFormat`) written as a walk over its
 * grid: the game says what goes at each place, and the walk writes the rows,
 * the lines between them and the newlines. See the `engine-helpers` spec,
 * "The engine writes a grid's plain-text board".
 *
 * Three shapes cover the grid-shaped games:
 *
 * - **Cells in rows**: {@link gridText} with a `cell` and, where the game
 *   spaces its cells, an `across`.
 * - **Cells joined by edges**, a line of edge glyphs between two rows of
 *   cells (Path, Slant): `gridText` with `between`, whose `down` sits under
 *   each cell and `middle` under each `across`.
 * - **Boxed cells**, a rim of corners and edges round every cell (Light Up,
 *   Rect): {@link boxedGridText}.
 *
 * A clue row above or below the grid is the game's own line, written before
 * or after the walk; a clue at each end of a row is `ends`.
 */

/** What the walk writes at a place: the same text everywhere, or the text for
 * the place `(x, y)`. */
export type TextAt = string | ((x: number, y: number) => string);

export interface GridTextLayout {
  /** Written between cell `x` and cell `x + 1` of row `y`. None by default. */
  readonly across?: TextAt;
  /**
   * A line written between row `y` and row `y + 1`: `down(x, y)` under each
   * cell and `middle(x, y)` under each `across`. No such line by default.
   */
  readonly between?: { readonly down: TextAt; readonly middle: TextAt };
  /** The text each line starts and ends with: row `y`'s, or with `between`
   * true the line under it. */
  readonly ends?: (y: number, between: boolean) => readonly [string, string];
  /** Whether the last line ends in a newline, as every other does. It does by
   * default. */
  readonly finalNewline?: boolean;
}

function textAt(text: TextAt): (x: number, y: number) => string {
  return typeof text === "string" ? () => text : text;
}

/**
 * The text of a `w` × `h` grid whose cell `(x, y)` reads `cell(x, y)`, row by
 * row, each line ended by a newline.
 */
export function gridText(
  w: number,
  h: number,
  cell: (x: number, y: number) => string,
  layout: GridTextLayout = {},
): string {
  const { between, ends } = layout;
  /** Line `y`'s text: `at` each place, `gap` between two, then its ends. */
  const line = (y: number, under: boolean, at: TextAt, gap: TextAt): string => {
    const atXY = textAt(at);
    const gapXY = textAt(gap);
    let text = "";
    for (let x = 0; x < w; x++) {
      text += atXY(x, y);
      if (x < w - 1) text += gapXY(x, y);
    }
    if (ends === undefined) return text;
    const [start, end] = ends(y, under);
    return start + text + end;
  };
  const lines: string[] = [];
  for (let y = 0; y < h; y++) {
    lines.push(line(y, false, cell, layout.across ?? ""));
    if (between !== undefined && y < h - 1)
      lines.push(line(y, true, between.down, between.middle));
  }
  const text = lines.join("\n");
  return layout.finalNewline === false ? text : `${text}\n`;
}

/** A boxed grid's text by place. Every edge and corner is the grid's own,
 * the rim included: `top(x, h)` is the bottom rim, `left(w, y)` the right. */
export interface BoxedGrid {
  /** Cell `(x, y)`, for `x < w`, `y < h`. */
  readonly cell: TextAt;
  /** The edge along the top of cell `(x, y)`, for `x < w`, `y ≤ h`. */
  readonly top: TextAt;
  /** The edge down the left of cell `(x, y)`, for `x ≤ w`, `y < h`. */
  readonly left: TextAt;
  /** The corner at the top left of cell `(x, y)`, for `x ≤ w`, `y ≤ h`. */
  readonly corner: TextAt;
}

/**
 * The text of a `w` × `h` grid with a rim round every cell: a line of corners
 * and top edges, then a line of left edges and cells, and so on down to the
 * bottom rim. It is {@link gridText} over the `(w + 1)` × `(h + 1)` corners.
 */
export function boxedGridText(w: number, h: number, box: BoxedGrid): string {
  return gridText(w + 1, h + 1, textAt(box.corner), {
    across: box.top,
    between: { down: box.left, middle: box.cell },
  });
}
