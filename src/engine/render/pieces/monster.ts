/**
 * The undead and the mirrors they are seen in: a ghost, a vampire and a
 * zombie, each in its own color outlined in ink, and a mirror, a thick stroke
 * corner to corner that falls (`\`) or rises (`/`). The art is upstream
 * undead.c's `draw_monster` and `draw_cell_background`: a monster is drawn in
 * a box three quarters of its tile, so a note drawn in a tile a third larger
 * than its slot fills the slot.
 */

import { INK } from "../../color/palette.ts";
import { COL_BACKGROUND, COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Color, Point } from "../../contract/types.ts";
import type { Painter } from "./painter.ts";

/**
 * The three monsters' colors. Upstream derives all three from the
 * background's **red channel alone**, which is why they are a matched family
 * rather than three independent colors: ghost cyan, zombie green, vampire
 * pink, all at the same brightness so no monster looks more important than
 * another.
 */
export const ghostColor = (background: Color): Color => [
  background[0] * 0.5,
  background[0],
  background[0],
];
/** @see ghostColor */
export const zombieColor = (background: Color): Color => [
  background[0] * 0.5,
  background[0],
  background[0] * 0.5,
];
/** @see ghostColor */
export const vampireColor = (background: Color): Color => [
  background[0],
  background[0] * 0.9,
  background[0] * 0.9,
];

const f = Math.floor;
const idiv = (a: number, b: number): number => Math.trunc(a / b);

/** A disc of radius `r`, or a point where it rounds to none. */
function dot(dr: GameDrawing, x: number, y: number, r: number, color: number): void {
  if (r > 0) dr.drawCircle({ x, y }, r, color, color);
  else dr.drawRect({ x, y, w: 1, h: 1 }, color);
}

/** A ghost centered at `(x, y)` in a box `ts` wide: a dome over a hem of
 * three scallops, two eyes looking right. */
function ghost(
  dr: GameDrawing,
  x: number,
  y: number,
  ts: number,
  body: number,
  ink: number,
) {
  const m25 = idiv(2 * ts, 5);
  dr.clip({ x: x - f(ts / 2) + 2, y: y - f(ts / 2) + 2, w: ts - 3, h: f(ts / 2) + 1 });
  dr.drawCircle({ x, y }, m25, body, ink);
  dr.unclip();
  const hem: Point[] = [
    { x: x - m25, y: y - 2 },
    { x: x - m25, y: y + m25 },
  ];
  for (let j = 0; j < 3; j++) {
    const total = m25 * 2;
    const before = idiv(total * j, 3);
    const after = idiv(total * (j + 1), 3);
    const mid = idiv(before + after, 2);
    hem.push({ x: x - m25 + mid, y: y + m25 - idiv(total, 6) });
    hem.push({ x: x - m25 + after, y: y + m25 });
  }
  hem.push({ x: x + m25, y: y - 2 });
  dr.clip({ x: x - f(ts / 2) + 2, y, w: ts - 3, h: ts - f(ts / 2) - 1 });
  dr.drawPolygon(hem, body, ink);
  dr.unclip();
  const eyeY = y - f(ts / 12);
  const pupil = f(ts / 48);
  for (const s of [-1, 1])
    dr.drawCircle({ x: x + s * f(ts / 6), y: eyeY }, f(ts / 10), COL_BACKGROUND, ink);
  for (const s of [-1, 1]) dot(dr, x + s * f(ts / 6) + 1 + pupil, eyeY, pupil, ink);
}

/** A vampire centered at `(x, y)` in a box `ts` wide: a widow's peak of dark
 * hair, two eyes, and two fangs under a lip. */
function vampire(
  dr: GameDrawing,
  x: number,
  y: number,
  ts: number,
  body: number,
  ink: number,
) {
  const m25 = idiv(2 * ts, 5);
  dr.clip({ x: x - f(ts / 2) + 2, y: y - f(ts / 2) + 2, w: ts - 3, h: f(ts / 2) });
  dr.drawCircle({ x, y }, m25, ink, ink);
  dr.unclip();
  dr.clip({
    x: x - f(ts / 2) + 2,
    y: y - f(ts / 2) + 2,
    w: f(ts / 2) + 1,
    h: f(ts / 2),
  });
  dr.drawCircle({ x: x - f(ts / 7), y }, m25 - f(ts / 7), body, ink);
  dr.unclip();
  dr.clip({ x, y: y - f(ts / 2) + 2, w: f(ts / 2) + 1, h: f(ts / 2) });
  dr.drawCircle({ x: x + f(ts / 7), y }, m25 - f(ts / 7), body, ink);
  dr.unclip();
  dr.clip({ x: x - f(ts / 2) + 2, y, w: ts - 3, h: f(ts / 2) });
  dr.drawCircle({ x, y }, m25, body, ink);
  dr.unclip();
  const eyeY = y - f(ts / 16);
  for (const s of [-1, 1])
    dr.drawCircle({ x: x + s * f(ts / 7), y: eyeY }, f(ts / 16), COL_BACKGROUND, ink);
  for (const s of [-1, 1]) dot(dr, x + s * f(ts / 7), eyeY, f(ts / 48), ink);
  dr.clip({ x: x - f(ts / 2) + 2, y: y + f(ts / 8), w: ts - 3, h: f(ts / 4) });
  for (const s of [-1, 1])
    dr.drawPolygon(
      [
        { x: x + s * idiv(3 * ts, 16), y: y + idiv(ts, 8) },
        { x: x + s * idiv(2 * ts, 16), y: y + idiv(7 * ts, 24) },
        { x: x + s * idiv(1 * ts, 16), y: y + idiv(ts, 8) },
      ],
      COL_BACKGROUND,
      ink,
    );
  dr.drawCircle({ x, y: y - f(ts / 5) }, m25, body, ink);
  dr.unclip();
}

/** A zombie centered at `(x, y)` in a box `ts` wide: a round head, its eyes
 * crossed out, a grimace. */
function zombie(
  dr: GameDrawing,
  x: number,
  y: number,
  ts: number,
  body: number,
  ink: number,
) {
  const m25 = idiv(2 * ts, 5);
  dr.drawCircle({ x, y }, m25, body, ink);
  const eyeY = y - f(ts / 12);
  const r = f(ts / 16);
  for (const s of [-1, 1]) {
    const ex = x + s * f(ts / 7);
    dr.drawLine({ x: ex - r, y: eyeY - r }, { x: ex + r, y: eyeY + r }, ink, 1);
    dr.drawLine({ x: ex + r, y: eyeY - r }, { x: ex - r, y: eyeY + r }, ink, 1);
  }
  const mouthY = y + f(ts / 6);
  dr.clip({ x: x - f(ts / 5), y: mouthY, w: m25 + 1, h: f(ts / 2) });
  dr.drawCircle({ x: x - f(ts / 15), y: mouthY }, f(ts / 12), COL_BACKGROUND, ink);
  dr.unclip();
  dr.drawLine({ x: x - f(ts / 5), y: mouthY }, { x: x + f(ts / 5), y: mouthY }, ink, 1);
}

type Drawn = typeof ghost;

/** A monster's painter: drawn by `draw` in its color, `color` of the
 * background, outlined in ink, or in the error role where a rule breaks at
 * its cell. */
const monster = (color: (background: Color) => Color, draw: Drawn): Painter => ({
  colors: (background) => [color(background), INK],
  surface: null,
  paint(dr, { x, y, w }, slot, error) {
    const ts = idiv(3 * w, 4);
    draw(dr, x + f(w / 2), y + f(w / 2), ts, slot[0], error ? COL_ERROR : slot[1]);
  },
});

export const ghostPiece: Painter = monster(ghostColor, ghost);
export const vampirePiece: Painter = monster(vampireColor, vampire);
export const zombiePiece: Painter = monster(zombieColor, zombie);

/** A mirror, a stroke a sixteenth of the tile thick from a quarter in on
 * either side: falling to the right (`\`) where `falls`, else rising. */
const mirror = (falls: boolean): Painter => ({
  colors: () => [INK],
  surface: null,
  paint(dr, { x, y, w }, slot, error) {
    const cx = x + f(w / 2);
    const cy = y + f(w / 2);
    const d = f(w / 4);
    const fall = falls ? d : -d;
    dr.drawLine(
      { x: cx - d, y: cy - fall },
      { x: cx + d, y: cy + fall },
      error ? COL_ERROR : slot[0],
      Math.max(1, f(w / 16)),
    );
  },
});

export const fallPiece: Painter = mirror(true);
export const risePiece: Painter = mirror(false);
