/**
 * The painters that draw a value of an answer whose values sit on the edges
 * between squares (`answer.value.sort: edge`), by the name a description's
 * `paint:` gives: a wall on the side two squares share, a line from one
 * square's middle to the other's, or a cross on the side.
 *
 * An edge runs one of two ways, so a painter's text is two strings, and a
 * value has no glyph of its own: the text format prints an edge where a
 * boxed grid prints the wall between its squares (`board/grid-text.ts`).
 */

/** What an edge's value prints as in a boxed grid's text. */
export interface EdgeValuePainter {
  /** Between two squares side by side, in the one-character wall. */
  readonly beside: string;
  /** Between two squares one above the other, in the three-character wall. */
  readonly above: string;
}

export const EDGE_VALUE_PAINTERS = {
  wall: { beside: "|", above: "---" },
  line: { beside: "-", above: " | " },
  cross: { beside: "x", above: " x " },
} as const satisfies Record<string, EdgeValuePainter>;

export type EdgeValuePainterName = keyof typeof EDGE_VALUE_PAINTERS;
