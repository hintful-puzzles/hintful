/**
 * The ring round each edge a step asks a value of, on an answer on the
 * edges: a pill across the side the edge's two squares share, with the
 * value as its edge painter draws it inside, both squares' halves, in the
 * ring's ink. The pill keeps clear of the two squares' numbers.
 */

import type { GameDrawing } from "../../../contract/game.ts";
import { squaresOfEdge } from "../../edge-target.ts";
import type { AskedEdge } from "../../marks.ts";
import type { CellLayout } from "../cell-text.ts";
import type { HintPass } from "../hint.ts";
import type { FillPalette } from "../palette.ts";
import type { FillSite } from "./site.ts";

function drawEdgeRing(
  pal: FillPalette,
  lay: CellLayout,
  hint: HintPass,
  dr: GameDrawing,
  ts: number,
  edge: AskedEdge,
): void {
  const painter = pal.edgeByValue.get(edge.value)?.painter;
  if (painter === undefined) throw new Error(`edge value ${edge.value} has no painter`);
  const { coord } = lay;
  const [{ x, y }, { x: nx, y: ny }] = squaresOfEdge(edge);
  const across = ny === y;
  // The side the first square has toward the second: right, or down.
  const d = across ? 1 : 2;
  const room = {
    x: coord(x, ts),
    y: coord(y, ts),
    w: (nx - x + 1) * ts,
    h: (ny - y + 1) * ts,
  };
  const half = Math.floor(ts / 2);
  const mx = across ? coord(nx, ts) : coord(x, ts) + half;
  const my = across ? coord(y, ts) + half : coord(ny, ts);
  // Short enough along the edge's squares to stop short of their numbers,
  // and wide enough across that a line inside shows the ring round it.
  const long = Math.floor(ts / 2);
  const short = Math.floor(ts * 0.42);
  const box = across
    ? { x: mx - long / 2, y: my - short / 2, w: long, h: short }
    : { x: mx - short / 2, y: my - long / 2, w: short, h: long };
  const band = lay.markBand(ts, [x, y, 0], null);
  // Each square's number stays outside the ring.
  const avoid = [hint.markStyle.text(x, y), hint.markStyle.text(nx, ny)].flatMap(
    (c) => [...c.enclose, ...c.avoid],
  );
  dr.drawRing(box, { enclose: [], avoid }, Math.max(2, band.outer + band.inner), {
    room,
    // The value at half scale, so its line or cross has room inside the
    // ring: drawn on a half-size tile each side of the edge whose side lies
    // on it, as long as the ring.
    inside: (ink) => {
      const s = long;
      const before = across
        ? { x: mx - s, y: my - s / 2, w: s, h: s }
        : { x: mx - s / 2, y: my - s, w: s, h: s };
      const after = across ? { ...before, x: mx } : { ...before, y: my };
      painter.paint(dr, before, d, ink);
      painter.paint(dr, after, (d + 2) % 4, ink);
    },
  });
}

export const edgeRings: FillSite = {
  on: (cx) => cx.onEdges,
  paint({ dr, ds, cx, lay, hint }) {
    for (const e of hint.askedEdges)
      drawEdgeRing(cx.pal, lay, hint, dr, ds.tileSize, e);
  },
};
