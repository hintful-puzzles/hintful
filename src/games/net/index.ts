/**
 * Net — Simon Tatham's original wire-rotation puzzle.
 *
 * A `w × h` grid of wire tiles whose solved form is a spanning tree rooted at a
 * movable source; the player rotates each tile until every tile is powered. The
 * model (direction algebra, desc codec, spanning-tree generator, power flood)
 * lives in `engine/wires.ts`, shared with Netslide; this file is the glue —
 * input, moves, solve, preferences, and the game object.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { Game, GamePref, SolveResult } from "../../engine/game.ts";
import { UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import { click, key, type PointerAction } from "../../engine/hint-gesture.ts";
import {
  atof,
  dimensionParamConfig,
  formatG,
  transposeDimensions,
} from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  isCancelKey,
  isCursorMove,
  isEraseKey,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { type RandomState, randomNew, randomUpto } from "../../engine/random/index.ts";
import { registerGame } from "../../engine/registry.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import {
  interpretTargetVerbs,
  letterKey,
  routeGesture,
  type TargetGeometry,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import {
  anticlockwise,
  clockwise,
  D,
  DIRECTIONS,
  L,
  offset,
  opposite,
  R,
  U,
} from "../../engine/wires.ts";
import { newDesc } from "./generator.ts";
import { type NetHint, netHint, netHintKeepTrack } from "./hint.ts";
import { findMistakes, type NetMistake } from "./mistakes.ts";
import {
  boardMargin,
  colors,
  computeSize,
  FLASH_FRAME,
  lineThick,
  type NetDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  ROTATE_TIME,
  redraw,
} from "./render.ts";
import { netSolver, SOLVER_INCONSISTENT, SOLVER_UNIQUE } from "./solver.ts";
import {
  computeActive,
  decodeParams,
  defaultParams,
  encodeParams,
  isComplete,
  LOCKED,
  type NetMove,
  type NetOp,
  type NetParams,
  type NetState,
  type NetUi,
  NOTE_NONE,
  NOTE_UNKNOWN,
  NOTE_WIRE,
  newState,
  newUi,
  type SideNote,
  sideIndex,
  validateParams,
} from "./state.ts";

/* ----------------------------------------------------------------------
 * Presets: upstream's ten, including the two 13×11 ones its `SMALL_SCREEN`
 * build leaves out (the web build showed them).
 */
const PRESETS: NetParams[] = [
  { w: 5, h: 5, wrapping: false, barrierProbability: 0 },
  { w: 7, h: 7, wrapping: false, barrierProbability: 0 },
  { w: 9, h: 9, wrapping: false, barrierProbability: 0 },
  { w: 11, h: 11, wrapping: false, barrierProbability: 0 },
  { w: 11, h: 13, wrapping: false, barrierProbability: 0 },
  { w: 5, h: 5, wrapping: true, barrierProbability: 0 },
  { w: 7, h: 7, wrapping: true, barrierProbability: 0 },
  { w: 9, h: 9, wrapping: true, barrierProbability: 0 },
  { w: 11, h: 11, wrapping: true, barrierProbability: 0 },
  { w: 11, h: 13, wrapping: true, barrierProbability: 0 },
];

/* ----------------------------------------------------------------------
 * Moves.
 */

/** Apply one A/C/F rotation to a wire mask (keeping the LOCKED bit). */
function rotateTile(op: "A" | "C" | "F", tile: number): number {
  const wires = tile & 0xf;
  const rotated =
    op === "A" ? anticlockwise(wires) : op === "C" ? clockwise(wires) : opposite(wires);
  return rotated | (tile & LOCKED);
}

function applyOp(tiles: Uint8Array, w: number, o: NetOp): void {
  const i = o.y * w + o.x;
  if (o.op === "L") tiles[i] ^= LOCKED;
  else tiles[i] = rotateTile(o.op, tiles[i]);
}

/** Each rotation's animation direction (see `NetState.lastRotateDir`). */
const ROTATE_DIR = { A: 1, C: -1, F: 2 } as const;

function executeMove(s: NetState, m: NetMove): NetState {
  if (m.type === "note") {
    // A note is the player's, not the network's: it changes no tile, so it
    // neither animates nor can complete the board.
    if (m.dir !== R && m.dir !== D) throw new Error(`net: note names side ${m.dir}`);
    const sides = new Uint8Array(s.sides);
    sides[sideIndex(s, m.x, m.y, m.dir)] = m.note;
    return { ...s, sides, lastRotateDir: 0 };
  }
  const tiles = new Uint8Array(s.tiles);
  let lastRotateX = 0;
  let lastRotateY = 0;
  let lastRotateDir = 0;

  switch (m.type) {
    case "rotate":
      applyOp(tiles, s.w, m);
      lastRotateX = m.x;
      lastRotateY = m.y;
      lastRotateDir = ROTATE_DIR[m.op];
      break;
    case "lock":
      tiles[m.y * s.w + m.x] ^= LOCKED;
      // A lock records its tile but does not animate, matching upstream's
      // `!noanim` tail.
      lastRotateX = m.x;
      lastRotateY = m.y;
      break;
    case "jumble":
    case "solve":
      for (const o of m.ops) applyOp(tiles, s.w, o);
      break;
    default:
      return assertNever(m, "net: executeMove");
  }

  return { ...s, tiles, lastRotateX, lastRotateY, lastRotateDir };
}

/** Rotate the tile at `(x, y)`, or nothing: a locked tile does not turn. */
function rotateMove(s: NetState, op: "A" | "C" | "F", x: number, y: number) {
  return s.tiles[y * s.w + x] & LOCKED ? null : ({ type: "rotate", op, x, y } as const);
}

/** The jumble's RNG, seeded from entropy on first use. It is neither the
 * player's position nor anything replay reads (a jumble is recorded as its
 * expanded ops), so it stays out of `NetUi`, whose every field is. */
let jumbleRs: RandomState | null = null;

function arrowDir(button: number): number {
  if (button === CURSOR_UP) return U;
  if (button === CURSOR_DOWN) return D;
  return button === CURSOR_LEFT ? L : R;
}

/**
 * The tile a press lands in, in the state's coordinates (the grid is drawn
 * scrolled by the origin), with where in the tile it landed as fractions
 * `fx`, `fy` of the way across, and whether it is on the gutter along the
 * tile's right or bottom edge. `null` off the grid.
 */
function pressedTile(s: NetState, ds: NetDrawState, p: Point, ui: NetUi) {
  const ts = ds.tileSize;
  const lt = lineThick(ts);
  const px = Math.floor(p.x) - boardMargin(ts) - lt;
  const py = Math.floor(p.y) - boardMargin(ts) - lt;
  const tx = Math.floor(px / ts);
  const ty = Math.floor(py / ts);
  if (px < 0 || py < 0 || tx >= s.w || ty >= s.h) return null;
  return {
    x: (tx + ui.orgX) % s.w,
    y: (ty + ui.orgY) % s.h,
    fx: (px % ts) / ts,
    fy: (py % ts) / ts,
    onGutter: px % ts >= ts - lt || py % ts >= ts - lt,
  };
}

/** The inverse of {@link pressedTile}: the point `fx`, `fy` of the way across
 * tile `t`'s face (the tile less its gutter), wherever the origin has scrolled
 * it to. */
function tilePoint(
  s: NetState,
  ds: NetDrawState,
  ui: NetUi,
  t: Point,
  fx: number,
  fy: number,
): Point {
  const ts = ds.tileSize;
  const lt = lineThick(ts);
  const face = ts - lt;
  const start = boardMargin(ts) + lt;
  const col = (t.x - ui.orgX + s.w) % s.w;
  const row = (t.y - ui.orgY + s.h) % s.h;
  return {
    x: start + col * ts + Math.min(face - 1, Math.floor(fx * face)),
    y: start + row * ts + Math.min(face - 1, Math.floor(fy * face)),
  };
}

/**
 * A target is a tile, named in the state's own coordinates. On screen the grid
 * is drawn scrolled by the origin, so a press is shifted by it; the cursor
 * already lives in state coordinates. A press on the gutter between tiles hits
 * nothing. The arrows wrap at the edges even on a bounded grid.
 */
const geometry: TargetGeometry<NetState, NetUi, NetDrawState, Point> = {
  noun: "square",
  pointerTarget(s, ds, p, ui) {
    const t = pressedTile(s, ds, p, ui);
    return t === null || t.onGutter ? null : { x: t.x, y: t.y };
  },
  pointAt: (s, ds, t, ui) => tilePoint(s, ds, ui, t, 0.5, 0.5),
  cursorTarget: (_s, ui) => ({ x: ui.cursor.x, y: ui.cursor.y }),
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor(s, ui, button) {
    const o = offset(ui.cursor.x, ui.cursor.y, arrowDir(button), s.w, s.h);
    ui.cursor.x = o.x;
    ui.cursor.y = o.y;
    ui.cursor.visible = true;
    return true;
  },
};

const rotate =
  (op: "A" | "C" | "F") =>
  (s: NetState, { x, y }: Point) =>
    rotateMove(s, op, x, y);

/** How far into a tile, as a fraction of its side, a notes-mode tap must land
 * to lock the tile rather than note its nearest side: the middle third. */
const LOCK_ZONE = 1 / 3;

/** Lock or unlock a square. The press that locks in notes mode is
 * `noteInput`'s. */
const lockMove = (_s: NetState, { x, y }: Point): NetMove => ({ type: "lock", x, y });

// A tap rotates anticlockwise and a long press clockwise, as the two buttons do.
const targetVerbs: TargetVerbs<NetState, NetUi, NetDrawState, Point, NetMove> = {
  geometry,
  primary: {
    does: "rotate it anticlockwise",
    keys: [letterKey("A")],
    apply: rotate("A"),
  },
  secondary: {
    does: "rotate it clockwise",
    keys: [letterKey("D")],
    apply: rotate("C"),
  },
  // The hint takes these two by position (`verbMove`).
  keyOnly: [
    {
      does: "rotate the square under the cursor half a turn",
      keys: [letterKey("F")],
      apply: rotate("F"),
      pointer: { kind: "repeat", button: "primary", times: 2 },
    },
    {
      does:
        "lock the square under the cursor once you think it is correct, so you " +
        "don't rotate it by accident, or unlock it again",
      keys: [letterKey("S")],
      apply: lockMove,
      pointer: { kind: "notes", button: "primary", where: "the middle of the square" },
    },
  ],
};

/**
 * Toggle `note` on side `dir` of tile `(x, y)`: on where the side holds any
 * other note or none, off where it holds this one. A wall already says no wire
 * crosses, so a side with one takes no note.
 */
function toggleNote(
  s: NetState,
  x: number,
  y: number,
  dir: number,
  note: SideNote,
): NetMove | null {
  if (s.barriers[y * s.w + x] & dir) return null;
  const now = s.sides[sideIndex(s, x, y, dir)];
  const set: SideNote = now === note ? NOTE_UNKNOWN : note;
  if (dir === R || dir === D) return { type: "note", x, y, dir, note: set };
  const o = offset(x, y, dir, s.w, s.h);
  return { type: "note", x: o.x, y: o.y, dir: opposite(dir), note: set };
}

/** The direction from tile `a` to its neighbor `b`, wrapping, or `null` when
 * they are not neighbors. */
function directionTo(s: NetState, a: Point, b: Point): number | null {
  for (const d of DIRECTIONS) {
    const o = offset(a.x, a.y, d, s.w, s.h);
    if (o.x === b.x && o.y === b.y && (o.x !== a.x || o.y !== a.y)) return d;
  }
  return null;
}

/**
 * Notes mode's presses and selects, as Slant's: a tap notes the side of the
 * tile it lands nearest (the left button a wire across it, the right button
 * none), and from the keyboard a select picks a tile, and a select on a
 * neighbor then notes the side between them (Enter a wire, Space none).
 *
 * A tap in the middle third of a tile, nearer none of its sides, locks or
 * unlocks it with either button. A lock is the player's other mark, and
 * outside notes mode both buttons rotate, so this is where a finger reaches it.
 */
function noteInput(
  s: NetState,
  ui: NetUi,
  ds: NetDrawState,
  p: Point,
  button: number,
): NetMove | null | UiUpdate {
  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    const t = pressedTile(s, ds, p, ui);
    if (t === null) return null;
    const hid = ui.cursor.visible;
    ui.cursor.visible = false;
    ui.pin = null;
    const nearest = [t.fx, 1 - t.fx, t.fy, 1 - t.fy];
    if (!t.onGutter && Math.min(...nearest) >= LOCK_ZONE) return lockMove(s, t);
    const dir = [L, R, U, D][nearest.indexOf(Math.min(...nearest))];
    const note = button === LEFT_BUTTON ? NOTE_WIRE : NOTE_NONE;
    return toggleNote(s, t.x, t.y, dir, note) ?? (hid ? UI_UPDATE : null);
  }
  // A select: the first on a hidden cursor only shows it.
  if (!ui.cursor.visible) {
    ui.cursor.visible = true;
    return UI_UPDATE;
  }
  const here = { x: ui.cursor.x, y: ui.cursor.y };
  const pin = ui.pin;
  const dir = pin === null ? null : directionTo(s, pin, here);
  if (pin === null || dir === null) {
    ui.pin = pin !== null && pin.x === here.x && pin.y === here.y ? null : here;
    return UI_UPDATE;
  }
  ui.pin = null;
  const note = button === CURSOR_SELECT ? NOTE_WIRE : NOTE_NONE;
  return toggleNote(s, pin.x, pin.y, dir, note) ?? UI_UPDATE;
}

/** The Source key, on the keypad as well as the keyboard. */
const KEY_SOURCE = 0x63;
const KEY_SOURCE_UPPER = 0x43;
/** J: jumble every unlocked square. */
const KEY_JUMBLE = 0x6a;
const KEY_JUMBLE_UPPER = 0x4a;

/**
 * In Source mode, light the network from the square pressed, or from the
 * cursor on a select, and leave the mode; Escape leaves it without moving.
 * `null` for anything else, which the rest of `interpretMove` handles.
 */
function placeSource(
  s: NetState,
  ui: NetUi,
  ds: NetDrawState,
  p: Point,
  button: number,
): UiUpdate | null {
  if (isCancelKey(button) && !isEraseKey(button)) {
    ui.placingSource = false;
    return UI_UPDATE;
  }
  if (isMouseDown(button)) {
    const t = pressedTile(s, ds, p, ui);
    if (t === null) return null;
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
    ui.cursor.visible = false;
  } else if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
  } else return null;
  ui.cx = ui.cursor.x;
  ui.cy = ui.cursor.y;
  ui.placingSource = false;
  return UI_UPDATE;
}

/**
 * The pointer's way to a hint step's move: a turn is a tap or a long press on
 * the tile (a half turn two taps), a lock a notes-mode tap in its middle, and a
 * note a notes-mode tap by its side. Notes mode is switched for the step and
 * back after, and so is Source mode, which would take the tap for itself.
 */
function hintGesture(
  s: NetState,
  ui: NetUi,
  ds: NetDrawState,
  m: NetMove,
): PointerAction[] {
  const [halfTurn, lock] = targetVerbs.keyOnly ?? [];
  let out: PointerAction[];
  if (m.type === "rotate") {
    const at = [{ x: m.x, y: m.y }];
    out =
      m.op === "F"
        ? routeGesture(targetVerbs, halfTurn, s, ds, ui, at)
        : verbGesture(
            targetVerbs,
            s,
            ds,
            ui,
            at,
            m.op === "A" ? "primary" : "secondary",
          );
    if (ui.pencilMode) out = [key(PENCIL_MODE_BUTTON), ...out, key(PENCIL_MODE_BUTTON)];
  } else if (m.type === "lock") {
    const at = [{ x: m.x, y: m.y }];
    out = routeGesture(targetVerbs, lock, s, ds, ui, at, { notesOn: ui.pencilMode });
  } else if (m.type === "note") {
    const [fx, fy] = m.dir === R ? [0.9, 0.5] : [0.5, 0.9];
    const tap = click(
      tilePoint(s, ds, ui, m, fx, fy),
      m.note === NOTE_WIRE ? "primary" : "secondary",
    );
    out = ui.pencilMode
      ? [tap]
      : [key(PENCIL_MODE_BUTTON), tap, key(PENCIL_MODE_BUTTON)];
  } else {
    throw new Error(`net: a hint never asks for ${m.type}`);
  }
  return ui.placingSource ? [key(KEY_SOURCE), ...out, key(KEY_SOURCE)] : out;
}

/** A drag begun in the margin of a wrapping grid scrolls it by whole squares,
 * the grid following the pointer, as Shift+arrow scrolls it from the keyboard.
 * The release ends it. */
function scrollDrag(
  s: NetState,
  ui: NetUi,
  ds: NetDrawState,
  p: Point,
  button: number,
): UiUpdate | null {
  const from = ui.scroll;
  if (from === null) return null;
  const ts = ds.tileSize;
  const wrap = (v: number, n: number) => ((v % n) + n) % n;
  const orgX = wrap(from.orgX - Math.round((p.x - from.x) / ts), s.w);
  const orgY = wrap(from.orgY - Math.round((p.y - from.y) / ts), s.h);
  const released = isMouseRelease(button);
  if (released) ui.scroll = null;
  if (orgX === ui.orgX && orgY === ui.orgY) return released ? UI_UPDATE : null;
  ui.orgX = orgX;
  ui.orgY = orgY;
  return UI_UPDATE;
}

function interpretMove(
  s: NetState,
  ui: NetUi,
  ds: NetDrawState,
  p: Point,
  rawButton: number,
): NetMove | null | UiUpdate {
  const button = stripModifiers(rawButton);

  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    ui.pin = null;
    return UI_UPDATE;
  }
  if (button === KEY_SOURCE || button === KEY_SOURCE_UPPER) {
    ui.placingSource = !ui.placingSource;
    ui.pin = null;
    return UI_UPDATE;
  }
  if (ui.placingSource) {
    const placed = placeSource(s, ui, ds, p, button);
    if (placed !== null) return placed;
  }
  if (ui.scroll !== null && (isMouseDrag(button) || isMouseRelease(button)))
    return scrollDrag(s, ui, ds, p, button);
  if (s.wrapping && isMouseDown(button) && pressedTile(s, ds, p, ui) === null) {
    ui.scroll = { x: p.x, y: p.y, orgX: ui.orgX, orgY: ui.orgY };
    return UI_UPDATE;
  }
  if (
    ui.pencilMode &&
    (button === LEFT_BUTTON ||
      button === RIGHT_BUTTON ||
      button === CURSOR_SELECT ||
      button === CURSOR_SELECT2)
  )
    return noteInput(s, ui, ds, p, button);
  // Escape lets go of a picked tile; the erase keys are not a cancel here.
  if (isCancelKey(button) && !isEraseKey(button) && ui.pin !== null) {
    ui.pin = null;
    return UI_UPDATE;
  }

  // Shift moves the origin, Ctrl the source, both together moves both. All are
  // UI-only; a bare arrow is the model's.
  const shift = (rawButton & MOD_SHFT) !== 0;
  const ctrl = (rawButton & MOD_CTRL) !== 0;
  if (isCursorMove(button) && (shift || ctrl)) {
    const dir = arrowDir(button);
    if (shift) {
      if (!s.wrapping) return null; // origin shift is meaningless when bounded
      const o = offset(ui.orgX, ui.orgY, dir, s.w, s.h);
      ui.orgX = o.x;
      ui.orgY = o.y;
    }
    if (ctrl) {
      const o = offset(ui.cx, ui.cy, dir, s.w, s.h);
      ui.cx = o.x;
      ui.cy = o.y;
    }
    return UI_UPDATE;
  }

  if (button === KEY_JUMBLE || button === KEY_JUMBLE_UPPER) {
    // j: rotate every unlocked tile a random amount, expanded into an explicit
    // op list so replay is deterministic.
    jumbleRs ??= randomNew(crypto.getRandomValues(new Uint8Array(16)));
    const ops: NetOp[] = [];
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        if (s.tiles[y * s.w + x] & LOCKED) continue;
        const r = randomUpto(jumbleRs, 4);
        if (r) ops.push({ op: (["A", "F", "C"] as const)[r - 1], x, y });
      }
    }
    return { type: "jumble", ops };
  }

  return interpretTargetVerbs(targetVerbs, s, ui, ds, p, rawButton);
}

/* ----------------------------------------------------------------------
 * Solve.
 */

function solve(_orig: NetState, curr: NetState, aux?: string): SolveResult<NetMove> {
  const { w, h } = curr;
  const n = w * h;
  const target = new Uint8Array(n);

  if (aux) {
    for (let i = 0; i < n; i++) target[i] = Number.parseInt(aux[i], 16) | LOCKED;
  } else {
    // The solver leaves every determined tile at its orientation | LOCKED.
    target.set(curr.tiles);
    if (netSolver(w, h, target, curr.barriers, curr.wrapping) === SOLVER_INCONSISTENT) {
      return { ok: false, error: NO_SOLUTION };
    }
  }

  // Build the op list transforming the current grid into the target: unlock,
  // rotate the shortest way, then lock, per tile that differs.
  const ops: NetOp[] = [];
  for (let i = 0; i < n; i++) {
    const from = curr.tiles[i];
    const to = target[i];
    if (from === to) continue;
    const ft = from & 0xf;
    const tt = to & 0xf;
    const x = i % w;
    const y = Math.floor(i / w);

    if (from & LOCKED) ops.push({ op: "L", x, y });
    if (tt === anticlockwise(ft)) ops.push({ op: "A", x, y });
    else if (tt === clockwise(ft)) ops.push({ op: "C", x, y });
    else if (tt === opposite(ft)) ops.push({ op: "F", x, y });
    if (to & LOCKED) ops.push({ op: "L", x, y });
  }

  return { ok: true, move: { type: "solve", ops } };
}

/* ----------------------------------------------------------------------
 * Preferences + saved UI.
 */

const prefs: GamePref<NetUi>[] = [
  {
    kw: "unlocked-loops",
    name: "Highlight loops involving unlocked squares",
    type: "boolean",
    get: (ui) => ui.unlockedLoops,
    set: (ui, v) => {
      ui.unlockedLoops = v;
    },
  },
];

function encodeUi(ui: NetUi): string {
  return `O${ui.orgX},${ui.orgY};C${ui.cx},${ui.cy}`;
}

function decodeUi(ui: NetUi, encoded: string): void {
  const m = /^O(-?\d+),(-?\d+);C(-?\d+),(-?\d+)/.exec(encoded);
  if (!m) return;
  const [orgX, orgY, cx, cy] = m.slice(1).map(Number);
  // Upstream also range-checks each pair against the grid; this hook gets no
  // state to check against, so it rejects only a pair that is not an integer.
  if (Number.isInteger(orgX) && Number.isInteger(orgY)) {
    ui.orgX = orgX;
    ui.orgY = orgY;
  }
  if (Number.isInteger(cx) && Number.isInteger(cy)) {
    ui.cx = cx;
    ui.cy = cy;
  }
}

/* ----------------------------------------------------------------------
 * Status bar.
 */

function statusbarText(s: NetState, ui: NetUi): string {
  const complete = isComplete(s);
  let counter = "";
  // Omit the counter when the source tile is empty (it would always read 1).
  if (s.tiles[ui.cy * s.w + ui.cx] & 0xf) {
    const active = computeActive(s, ui.cx, ui.cy);
    let powered = 0;
    let wired = 0;
    for (let i = 0; i < s.w * s.h; i++) {
      if (active[i]) powered++;
      if (s.tiles[i] & 0xf) wired++;
    }
    if (!complete || powered < wired) counter = `Active: ${powered}/${wired}`;
  }

  if (ui.placingSource) {
    return `Tap a square to light the network from it. ${counter}`.trimEnd();
  }
  return counter;
}

/* ----------------------------------------------------------------------
 * The Game.
 */

export const netGame: Game<
  NetParams,
  NetState,
  NetMove,
  NetUi,
  NetDrawState,
  NetMistake,
  NetHint
> = {
  id: "net",

  defaultParams,
  presets: () => ({
    title: "Net",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  }),
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<NetParams>({
      doc: "Size of the grid in squares. At least one of them must be more than 1.",
      bounds: { min: 1 },
    }),
    {
      kw: "walls-wrap-around",
      name: "Walls wrap around",
      type: "boolean",
      doc: "When on, the network may run off one edge of the grid and come back on the opposite edge, so the outside of the grid is no longer a wall. The grid cannot then be exactly 2 squares wide or high, since such a grid can never have just one solution.",
      label: { slot: "kind", words: (p) => (p.wrapping ? "wrapping" : null) },
      get: (p) => p.wrapping,
      set: (p, v) => {
        p.wrapping = v;
      },
    },
    {
      kw: "barrier-probability",
      name: "Barrier probability",
      type: "string",
      doc: "The share of the places where the finished network has no wire that get a barrier drawn across them. At 0 there are no barriers inside the grid; at 1 every such place has one, which gives away a lot about the solution.",
      bounds: { min: 0, max: 1 },
      label: {
        slot: "tail",
        words: (p) =>
          p.barrierProbability > 0
            ? `${Math.round(p.barrierProbability * 100)}% barriers`
            : null,
      },
      get: (p) => formatG(p.barrierProbability),
      set: (p, v) => {
        p.barrierProbability = Math.fround(atof(v));
      },
    },
  ],

  newDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  // The pointer's routes to Ctrl+arrow and J; the midend adds Marks.
  requestKeys: () => [
    { label: "Source", button: KEY_SOURCE },
    { label: "Jumble", button: KEY_JUMBLE },
  ],

  status: (s): GameStatus => (isComplete(s) ? "solved" : "ongoing"),

  solve,
  findMistakes,
  // The solver's verdict. The generator asks more (`finishes` in deduce.ts),
  // so that the hint finishes every board it deals.
  finishesByDeduction: (s) =>
    netSolver(
      s.w,
      s.h,
      Uint8Array.from(s.tiles, (t) => t & 0xf),
      s.barriers,
      s.wrapping,
    ) === SOLVER_UNIQUE,
  hint: (s, _aux, ui) => netHint(s, targetVerbs, ui ?? newUi(s)),
  hintMarks: {
    roles: {
      ring: "what the step decides: the square to turn and lock, or the side to note, drawn as the note the step places.",
      outline:
        "what the step reasons from: the notes and locks a way of turning would contradict, or the square whose every way of turning agrees about the ringed side.",
      stripes:
        "the squares a way of turning would close a loop through, or seal off from the rest.",
    },
  },
  hintKeepTrack: netHintKeepTrack,
  hintGesture,

  prefs,
  encodeUi,
  decodeUi,

  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: (a, b, dir) => ((dir === -1 ? a : b).lastRotateDir ? ROTATE_TIME : 0),

  // The flash sweeps the board, so it lasts as long as the board is wide.
  solvedFlash: (s) => FLASH_FRAME * (Math.max(s.w, s.h) + 4),
};

registerGame(netGame);
