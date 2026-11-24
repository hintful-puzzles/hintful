/**
 * The ring round each link a step asks for (`play.links`), with the link
 * inside it. Where the step rings both its cells, one pill round the two;
 * otherwise a small pill across the side they share.
 */

import type { GameDrawing } from "../../../contract/game.ts";
import { NOTHING_TO_CLEAR } from "../../../render/ring.ts";
import type { FillLink } from "../../marks.ts";
import type { CellLayout } from "../cell-text.ts";
import { drawLinkHalf } from "../layers/links.ts";
import { dirTo } from "../tile-word.ts";
import type { FillSite } from "./site.ts";

function drawLinkRing(
  lay: CellLayout,
  dr: GameDrawing,
  ts: number,
  w: number,
  { cell, to }: FillLink,
  whole: boolean,
): void {
  const { coord } = lay;
  const [x, y, nx, ny] = [cell % w, Math.floor(cell / w), to % w, Math.floor(to / w)];
  const d = dirTo(w, cell, to);
  const room = {
    x: coord(Math.min(x, nx), ts),
    y: coord(Math.min(y, ny), ts),
    w: (Math.abs(nx - x) + 1) * ts,
    h: (Math.abs(ny - y) + 1) * ts,
  };
  const across = ny === y;
  const long = Math.floor(ts * 0.8);
  const short = Math.floor(ts / 3);
  const mx = across ? coord(Math.max(x, nx), ts) : coord(x, ts) + Math.floor(ts / 2);
  const my = across ? coord(y, ts) + Math.floor(ts / 2) : coord(Math.max(y, ny), ts);
  const box = whole
    ? room
    : across
      ? { x: mx - long / 2, y: my - short / 2, w: long, h: short }
      : { x: mx - short / 2, y: my - long / 2, w: short, h: long };
  // Its width alone, which walls do not change.
  const band = lay.markBand(ts, [x, y, 0], null);
  dr.drawRing(box, NOTHING_TO_CLEAR, Math.max(2, band.outer + band.inner), {
    room,
    inside: (ink) => {
      drawLinkHalf(dr, ts, coord(x, ts), coord(y, ts), d, ink);
      drawLinkHalf(dr, ts, coord(nx, ts), coord(ny, ts), (d + 2) % 4, ink);
    },
  });
}

export const linkRings: FillSite = {
  on: (cx) => cx.linkClues !== null,
  paint({ dr, ds, lay, state, hint }) {
    for (const l of hint.askedLinks)
      drawLinkRing(lay, dr, ds.tileSize, state.w, l, hint.whole(l));
  },
};
