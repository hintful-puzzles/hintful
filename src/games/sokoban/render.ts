/**
 * Sokoban rendering (upstream `game_colours` / `game_redraw` / `draw_tile`):
 * a per-tile cache keyed on what the tile shows, grid lines drawn once, walls
 * as flat blocks, targets / pits / deep pits / player / barrels as discs,
 * capital-letter barrel labels, and the hint's marks.
 *
 * There is no border (upstream's is a tile wide): the board is
 * `w * tileSize + 1` wide, the 1 for the closing grid line.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BROWN, GREEN, WHITE, YELLOW } from "../../engine/color/colors.ts";
import {
  cellSurface,
  DRAG_ADD,
  FLASH,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import { sokobanPit } from "../../engine/color/palette-games.ts";
import { drawMoveArrow, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import type { MarkedDeadEnd } from "../../engine/hint-refusal.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { BARREL, GOAL, PUSH } from "./hint-text.ts";
import { motionAt, motionFor, motionLength } from "./motion.ts";
import { DIRS, type Push } from "./solver.ts";
import {
  barrelLabel,
  DEEP_PIT,
  detargetize,
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
  SPACE,
  TARGET,
  WALL,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_LENGTH = 0.3;

// --- palette ------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_TARGET = 1;
const COL_PIT = 2;
const COL_DEEP_PIT = 3;
export const COL_BARREL = 4;
export const COL_PLAYER = 5;
const COL_TEXT = 6;
const COL_GRID = 7;
const COL_OUTLINE = 8;
export const COL_WALL = 9;
const COL_FLASH = 10;
export const COL_HINT = 11;
export const COL_HINT_EVIDENCE = 12;
/** A drag's aimed push, as Inertia's aimed slide. */
export const COL_AIM = 13;
/** A floor square. */
export const COL_FLOOR = 14;
const NCOLORS = 15;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = new Array<Color>(NCOLORS);
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_FLOOR] = cellSurface(defaultBackground);
  out[COL_OUTLINE] = INK;
  out[COL_PLAYER] = GREEN;
  out[COL_BARREL] = BROWN;
  // A target is a place and not a state of the floor, so it has a hue: the
  // one the board's pieces and the marks drawn on it have left unspent.
  out[COL_TARGET] = YELLOW;
  out[COL_PIT] = sokobanPit(mkhighlight(defaultBackground).lowlight);
  out[COL_DEEP_PIT] = INK;
  // `WHITE`, not `PAPER`: the letter is read against the barrel's brown,
  // which is one brown in both schemes.
  out[COL_TEXT] = WHITE;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_WALL] = wallFill(defaultBackground);
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
  /** Whether this is the square the aimed push stops on, which shows the
   * barrel's ghost: a one-square arrow is too short to see under a finger. */
  readonly ghost: boolean;
}

const NO_MARKS: TileMarks = {
  ringed: false,
  outlined: false,
  striped: false,
  arrows: [],
  aim: null,
  ghost: false,
};

/** A piece in motion, at its pixel center: the player, or a barrel by its
 * cell value. */
interface Sprite {
  readonly x: number;
  readonly y: number;
  readonly v: number;
}

/** Which of a wall's neighbors are walls too: the one to its left, the one
 * above, and all three round its top-left corner. A wall paints over the grid
 * line it shares with another, so walls that touch are one mass. */
interface WallJoin {
  readonly left: boolean;
  readonly up: boolean;
  readonly corner: boolean;
}

const NO_JOIN: WallJoin = { left: false, up: false, corner: false };

function drawTile(
  dr: GameDrawing,
  ds: SokobanDrawState,
  x: number,
  y: number,
  v: number,
  flash: boolean,
  marks: TileMarks,
  sprites: readonly Sprite[] = [],
  join: WallJoin = NO_JOIN,
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
    flash ? COL_FLASH : COL_FLOOR,
  );
  if (marks.striped)
    dr.drawHatch(
      { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 },
      COL_HINT,
      hatchPeriod(ts),
    );

  if (v === WALL) {
    // A flat block, on the tile inside its grid line.
    dr.drawRect({ x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 }, COL_WALL);
  } else if (v === PIT) {
    disc(floorDisc, COL_PIT);
  } else if (v === DEEP_PIT) {
    disc(floorDisc, COL_DEEP_PIT);
  } else if (isOnTarget(v)) {
    // A ring the width a barrel leaves round itself, so an empty target and a
    // filled one are the same ring with and without the barrel in it.
    disc(floorDisc, COL_TARGET);
    disc(pieceDisc, flash ? COL_FLASH : COL_FLOOR);
  }
  // The player or a barrel standing here, then any crossing it in motion,
  // each painted under this tile's clip.
  const piece = (at: Point, kind: number) => {
    if (isPlayer(kind)) {
      dr.drawCircle(at, pieceDisc, COL_PLAYER, COL_OUTLINE);
    } else if (isBarrel(kind)) {
      dr.drawCircle(at, pieceDisc, COL_BARREL, COL_OUTLINE);
      const label = barrelLabel(kind);
      if (label) {
        dr.drawText(
          at,
          glyphFont(Math.floor(ts / 2)),
          COL_TEXT,
          String.fromCharCode(label),
        );
      }
    }
  };
  if (v !== WALL && v !== PIT && v !== DEEP_PIT) piece(center, v);
  for (const s of sprites) piece({ x: s.x, y: s.y }, s.v);

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
  if (marks.ghost)
    for (let k = 0; k < 3; k++) dr.drawCircle(center, pieceDisc + k, -1, COL_AIM);

  dr.unclip();
  if (join.left) dr.drawRect({ x: tx, y: ty + 1, w: 1, h: ts - 1 }, COL_WALL);
  if (join.up) dr.drawRect({ x: tx + 1, y: ty, w: ts - 1, h: 1 }, COL_WALL);
  if (join.corner) dr.drawRect({ x: tx, y: ty, w: 1, h: 1 }, COL_WALL);
  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SokobanDrawState,
  prev: SokobanState | null,
  state: SokobanState,
  dir: number,
  ui: SokobanUi,
  animTime: number,
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
  const outlined = new Set([
    ...marks.of("outline", BARREL),
    ...marks.of("outline", GOAL),
  ]);
  const striped = new Set(marks.of("stripes", PUSH).flatMap(across));
  const arrowsAt = new Map<number, Push[]>();
  for (const p of marks.of("outline", PUSH))
    for (const c of across(p)) arrowsAt.set(c, [...(arrowsAt.get(c) ?? []), p]);
  const centerOf = (c: number) => tileCenter(c % w, Math.floor(c / w), ts);
  // The aimed push's squares, from the barrel to where it stops.
  const aimed = new Set<number>();
  let aim: readonly [Point, Point] | null = null;
  let ghostAt = -1;
  if (ui.grab && ui.aim) {
    const { x, y, dx, dy, n } = ui.aim;
    for (let k = 0; k <= n; k++) aimed.add((y + k * dy) * w + x + k * dx);
    aim = [tileCenter(x, y, ts), tileCenter(x + n * dx, y + n * dy, ts)];
    ghostAt = (y + n * dy) * w + x + n * dx;
  }

  // A move in motion: the board under it is the earlier one with the moving
  // barrel lifted off, and the player and that barrel are drawn where they
  // are by now, by every tile they overlap. An undo plays the motion back.
  const motion = prev && animTime > 0 ? motionFor(prev, state, dir) : null;
  let grid = state.grid;
  const sprites: Sprite[] = [];
  if (prev && motion) {
    const earlier = dir < 0 ? state : prev;
    const t = Math.min(animTime / motionLength(motion), 1);
    const at = motionAt(motion, w, dir < 0 ? 1 - t : t);
    const half = Math.floor(ts / 2);
    const px = (p: { x: number; y: number }) => ({
      x: Math.round(p.x * ts) + half,
      y: Math.round(p.y * ts) + half,
    });
    grid = earlier.grid.slice();
    if (motion.barrel && at.barrel) {
      const v = earlier.grid[motion.barrel.from];
      grid[motion.barrel.from] = isOnTarget(v) ? TARGET : SPACE;
      sprites.push({ ...px(at.barrel), v: isOnTarget(v) ? detargetize(v) : v });
    }
    sprites.push({ ...px(at.player), v: PLAYER });
  }
  const spritesAt = new Map<number, Sprite[]>();
  const reach = Math.floor(ts / 3) + 1;
  for (const s of sprites) {
    const x0 = Math.floor((s.x - reach) / ts);
    const x1 = Math.floor((s.x + reach) / ts);
    const y0 = Math.floor((s.y - reach) / ts);
    const y1 = Math.floor((s.y + reach) / ts);
    for (let y = Math.max(y0, 0); y <= Math.min(y1, h - 1); y++)
      for (let x = Math.max(x0, 0); x <= Math.min(x1, w - 1); x++) {
        const i = y * w + x;
        spritesAt.set(i, [...(spritesAt.get(i) ?? []), s]);
      }
  }

  // A hand-typed desc may carry generation's INITIAL; it draws as a wall.
  const isWall = (i: number) => grid[i] === WALL || grid[i] === INITIAL;

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = grid[i];
      if (!motion && y === state.py && x === state.px) {
        v = v === TARGET ? PLAYERTARGET : PLAYER;
      }
      const here = spritesAt.get(i) ?? [];
      if (isWall(i)) v = WALL;
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
              ghost: i === ghostAt,
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
        here.map((s) => `${s.v}@${s.x},${s.y}`).join(","),
      ].join(":");
      if (ds.tiles[i] !== key) {
        const left = v === WALL && x > 0 && isWall(i - 1);
        const up = v === WALL && y > 0 && isWall(i - w);
        const join = { left, up, corner: left && up && isWall(i - w - 1) };
        drawTile(dr, ds, x, y, v, flash, tile, here, join);
        ds.tiles[i] = key;
      }
    }
}
