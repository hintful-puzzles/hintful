/**
 * Sokoban rendering (upstream `game_colours` / `game_redraw` / `draw_tile`):
 * a per-tile cache keyed on what the tile shows, grid lines drawn once, walls
 * with a bevel, targets / pits / deep pits / player / barrels as discs,
 * capital-letter barrel labels, and the hint's marks.
 *
 * There is no border (upstream's is a tile wide): the board is
 * `w * tileSize + 1` wide, the 1 for the closing grid line.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BROWN, GREEN } from "../../engine/color/colors.ts";
import {
  DRAG_ADD,
  FLASH,
  GRID_MID,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  PAPER,
  wallColor,
} from "../../engine/color/palette.ts";
import { sokobanPit } from "../../engine/color/palette-games.ts";
import {
  drawMoveArrow,
  drawRaisedBevel,
  glyphFont,
  raisedBevelWidth,
} from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import type { MarkedDeadEnd } from "../../engine/hint-refusal.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { BARREL, PUSH } from "./hint-text.ts";
import { DIRS, type Push } from "./solver.ts";
import {
  barrelLabel,
  DEEP_PIT,
  INITIAL,
  isBarrel,
  isOnTarget,
  isPlayer,
  PIT,
  PLAYER,
  PLAYERTARGET,
  type SokobanMove,
  type SokobanState,
  type SokobanUi,
  TARGET,
  WALL,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_LENGTH = 0.3;

// --- palette (upstream's enum order: augmentation.ts keys its dark-mode swap
// of the bevel colors, 9 and 10, by index) -------------------------------

const COL_BACKGROUND = 0;
const COL_TARGET = 1;
const COL_PIT = 2;
const COL_DEEP_PIT = 3;
const COL_BARREL = 4;
const COL_PLAYER = 5;
const COL_TEXT = 6;
const COL_GRID = 7;
const COL_OUTLINE = 8;
const COL_HIGHLIGHT = 9;
const COL_LOWLIGHT = 10;
const COL_WALL = 11;
/** Appended past the upstream enum, which flashed the floor to its own bevel
 * highlight; the index-keyed swap above never reaches it. */
const COL_FLASH = 12;
/** The hint's marks, appended for the same reason. */
const COL_HINT = 13;
const COL_HINT_EVIDENCE = 14;
/** A drag's aimed push, as Inertia's aimed slide. */
const COL_AIM = 15;
const NCOLORS = 16;

export function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = new Array<Color>(NCOLORS);
  out[COL_BACKGROUND] = background;
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_OUTLINE] = INK;
  out[COL_PLAYER] = GREEN;
  out[COL_BARREL] = BROWN;
  // A target disc: sunk into the floor, in the floor's own shadow.
  out[COL_TARGET] = lowlight;
  out[COL_PIT] = sokobanPit(lowlight);
  out[COL_DEEP_PIT] = INK;
  out[COL_TEXT] = PAPER;
  out[COL_GRID] = GRID_MID;
  out[COL_WALL] = wallColor(background, highlight);
  out[COL_FLASH] = FLASH;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_EVIDENCE] = HINT_EVIDENCE;
  out[COL_AIM] = DRAG_ADD;
  return out;
}

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return { w: p.w * ts + 1, h: p.h * ts + 1 };
}

/** The pixel center of square `(x, y)`. */
export function tileCenter(x: number, y: number, ts: number): Point {
  return { x: x * ts + Math.floor(ts / 2), y: y * ts + Math.floor(ts / 2) };
}

// --- draw state -------------------------------------------------------

export interface SokobanDrawState {
  started: boolean;
  tileSize: number;
  /** Per-cell key of what was last drawn there; "" forces a redraw. */
  tiles: string[];
}

export function newDrawState(state: SokobanState, tileSize: number): SokobanDrawState {
  return {
    started: false,
    tileSize,
    tiles: new Array<string>(state.w * state.h).fill(""),
  };
}

// --- tile drawing -----------------------------------------------------

/** The hint's marks on one square. A push spans two squares, the barrel's and
 * the one it goes into, so both carry it and each paints its own piece. */
interface TileMarks {
  readonly ringed: boolean;
  readonly outlined: boolean;
  readonly striped: boolean;
  /** Each arrow as the pixel centers of the barrel and the square it goes
   * into. */
  readonly arrows: readonly (readonly [Point, Point])[];
  /** The push a drag is aiming, from the barrel to where it will stop: let go
   * and this happens. */
  readonly aim: readonly [Point, Point] | null;
}

const NO_MARKS: TileMarks = {
  ringed: false,
  outlined: false,
  striped: false,
  arrows: [],
  aim: null,
};

function drawTile(
  dr: GameDrawing,
  ds: SokobanDrawState,
  x: number,
  y: number,
  v: number,
  flash: boolean,
  marks: TileMarks,
): void {
  const ts = ds.tileSize;
  const tx = x * ts;
  const ty = y * ts;
  const center = tileCenter(x, y, ts);
  const disc = (r: number, fill: number) => dr.drawCircle(center, r, fill, COL_OUTLINE);
  const floorDisc = Math.floor((ts * 3) / 7); // a target or a pit
  const pieceDisc = Math.floor(ts / 3); // the player or a barrel

  dr.clip({ x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 });
  dr.drawRect(
    { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
    flash ? COL_FLASH : COL_BACKGROUND,
  );
  if (marks.striped)
    dr.drawHatch(
      { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
      COL_HINT,
      hatchPeriod(ts),
    );

  if (v === WALL) {
    const hw = raisedBevelWidth(ts);
    // Bevel, then the wall-colored inner square. The tile body is inset by one
    // to leave the grid line showing, so the bevel follows that rect.
    drawRaisedBevel(
      dr,
      { left: tx + 1, top: ty + 1, right: tx + ts, bottom: ty + ts },
      COL_HIGHLIGHT,
      COL_LOWLIGHT,
    );
    dr.drawRect(
      { x: tx + 1 + hw, y: ty + 1 + hw, w: ts - 2 * hw, h: ts - 2 * hw },
      COL_WALL,
    );
  } else if (v === PIT) {
    disc(floorDisc, COL_PIT);
  } else if (v === DEEP_PIT) {
    disc(floorDisc, COL_DEEP_PIT);
  } else {
    if (isOnTarget(v)) disc(floorDisc, COL_TARGET);
    if (isPlayer(v)) {
      disc(pieceDisc, COL_PLAYER);
    } else if (isBarrel(v)) {
      disc(pieceDisc, COL_BARREL);
      const label = barrelLabel(v);
      if (label) {
        dr.drawText(
          center,
          glyphFont(Math.floor(ts / 2)),
          COL_TEXT,
          String.fromCharCode(label),
        );
      }
    }
  }

  // The rings sit in the margin round a piece, so they read on the barrel's
  // brown; an outline inside a ring when one square carries both.
  const ring = (r: number, color: number) => {
    dr.drawCircle(center, r, -1, color);
    dr.drawCircle(center, r - 1, -1, color);
  };
  const outer = Math.floor(ts / 2) - 1;
  if (marks.ringed) ring(outer, COL_HINT);
  if (marks.outlined) ring(marks.ringed ? outer - 2 : outer, COL_HINT_EVIDENCE);
  for (const [a, b] of marks.arrows) drawMoveArrow(dr, ts, a, b, COL_HINT_EVIDENCE);
  if (marks.aim) drawMoveArrow(dr, ts, marks.aim[0], marks.aim[1], COL_AIM);

  dr.unclip();
  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SokobanDrawState,
  _prev: SokobanState | null,
  state: SokobanState,
  _dir: number,
  ui: SokobanUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<SokobanMove, unknown>,
  _mistakes?: readonly unknown[],
  deadEnd?: MarkedDeadEnd,
): void {
  const ts = ds.tileSize;
  const { w, h } = state;

  if (!ds.started) {
    for (let y = 0; y <= h; y++)
      dr.drawLine({ x: 0, y: y * ts }, { x: w * ts, y: y * ts }, COL_GRID, 1);
    for (let x = 0; x <= w; x++)
      dr.drawLine({ x: x * ts, y: 0 }, { x: x * ts, y: h * ts }, COL_GRID, 1);
    ds.started = true;
  }

  // Flash the background in the first and last thirds of the flash.
  const flash = flashTime > 0 && Math.floor((flashTime * 3) / FLASH_LENGTH) % 2 === 0;

  const marks = stepMarks(hint ?? deadEnd);
  const into = (p: Push) => p.barrel + DIRS[p.dir].dy * w + DIRS[p.dir].dx;
  const across = (p: Push) => [p.barrel, into(p)];
  const ringed = new Set(marks.of("ring", PUSH).flatMap(across));
  const outlined = new Set(marks.of("outline", BARREL));
  const striped = new Set(marks.of("stripes", PUSH).flatMap(across));
  const arrowsAt = new Map<number, Push[]>();
  for (const p of marks.of("outline", PUSH))
    for (const c of across(p)) arrowsAt.set(c, [...(arrowsAt.get(c) ?? []), p]);
  const centerOf = (c: number) => tileCenter(c % w, Math.floor(c / w), ts);
  // The aimed push's squares, from the barrel to where it stops.
  const aimed = new Set<number>();
  let aim: readonly [Point, Point] | null = null;
  if (ui.aiming && ui.aim) {
    const { x, y, dx, dy, n } = ui.aim;
    for (let k = 0; k <= n; k++) aimed.add((y + k * dy) * w + x + k * dx);
    aim = [tileCenter(x, y, ts), tileCenter(x + n * dx, y + n * dy, ts)];
  }

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = state.grid[i];
      if (y === state.py && x === state.px) {
        v = v === TARGET ? PLAYERTARGET : PLAYER;
      }
      // A hand-typed desc may carry generation's INITIAL; it draws as a wall.
      if (v === INITIAL) v = WALL;
      const arrows = arrowsAt.get(i) ?? [];
      const tile: TileMarks =
        ringed.has(i) ||
        outlined.has(i) ||
        striped.has(i) ||
        arrows.length > 0 ||
        aimed.has(i)
          ? {
              ringed: ringed.has(i),
              outlined: outlined.has(i),
              striped: striped.has(i),
              arrows: arrows.map(
                (p) => [centerOf(p.barrel), centerOf(into(p))] as const,
              ),
              aim: aimed.has(i) ? aim : null,
            }
          : NO_MARKS;
      const key = [
        v,
        flash ? "f" : "",
        tile.ringed ? "r" : "",
        tile.outlined ? "o" : "",
        tile.striped ? "s" : "",
        arrows.map(PUSH.key).join(","),
        tile.aim ? JSON.stringify(ui.aim) : "",
      ].join(":");
      if (ds.tiles[i] !== key) {
        drawTile(dr, ds, x, y, v, flash, tile);
        ds.tiles[i] = key;
      }
    }
}
