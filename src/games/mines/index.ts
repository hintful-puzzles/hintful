/**
 * Mines (Minesweeper) — native TS port of `puzzles/mines.c`.
 *
 * Mines is the collection's exemplar of desc supersession
 * (`Game.supersededDesc`): it generates its mine layout on the *first click*,
 * so the desc the player starts from names no layout at all, and must be
 * replaced once the real board exists.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  BLACK,
  BLUE,
  BLUE_BOLD,
  GRAY,
  GREEN,
  PINK,
  RED,
  RED_BOLD,
  TEAL,
} from "../../engine/color/colors.ts";
import {
  ERROR,
  ERROR_WASH,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  PAPER,
} from "../../engine/color/palette.ts";
import { minesLowlight, minesUnclearedFace } from "../../engine/color/palette-games.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import {
  type Game,
  registerGame,
  type SolveResult,
  type SupersededDesc,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/index.ts";
import { dimensionParamConfig, parseConfigInt } from "../../engine/params.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  newCursor,
} from "../../engine/pointer.ts";
import {
  type RandomState,
  randomStateEncode,
  randomUpto,
} from "../../engine/random/index.ts";
import { NOT_STARTED } from "../../engine/solve-failure.ts";
import {
  interpretTargetVerbs,
  pressTarget,
  squareGrid,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Color, GameStatus, Point } from "../../engine/types.ts";
import { minegen } from "./generator.ts";
import {
  MINES_RUNGS,
  type MinesHint,
  type MinesRung,
  minesHint,
  minesHintKeepTrack,
  minesRefreshHintStep,
} from "./hint.ts";
import {
  borderFor,
  COL_1,
  COL_2,
  COL_3,
  COL_4,
  COL_5,
  COL_6,
  COL_7,
  COL_8,
  COL_BACKGROUND,
  COL_BACKGROUND2,
  COL_BANG,
  COL_CURSOR,
  COL_FLAG,
  COL_FLAGBASE,
  COL_HIGHLIGHT,
  COL_HINT,
  COL_HINT_EVIDENCE,
  COL_LOWLIGHT,
  COL_MINE,
  COL_QUERY,
  COL_WRONGNUMBER,
  computeSize,
  FLASH_FRAME,
  type MinesDrawState,
  NCOLORS,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  around,
  COVERED,
  cloneState,
  decodeDesc,
  decodeParams,
  decodeUi,
  defaultParams,
  encodeLayoutHex,
  encodeParams,
  encodeUi,
  FLAG,
  isWon,
  KILLED,
  type MineOp,
  type MinesMove,
  type MinesParams,
  type MinesState,
  type MinesUi,
  QUERY,
  TODO,
  validateParams,
} from "./state.ts";

// --- the flood-open + first-click layout generation (open_square) ------

/**
 * Open square (x, y), generating the mine layout on the first click if it does
 * not yet exist (upstream `open_square`, mines.c:2135). Mutates `state` (a
 * fresh clone from `executeMove`) and, on the first click only, the *shared*
 * {@link MinesState.layout} box.
 */
function openSquare(state: MinesState, x: number, y: number): void {
  const { w, h, grid, layout } = state;

  if (!layout.mines) {
    // The single deliberate mutation of a shared object. The layout memoizes a
    // deterministic function of the desc's RNG state and this click, so
    // replaying the move log reproduces it exactly. The engine then pulls the
    // new desc from `supersededDesc`; the game never pushes into the midend.
    layout.mines = minegen(w, h, layout.n, x, y, layout.rs as RandomState);
    layout.startx = x;
    layout.starty = y;
    layout.rs = null;
  }
  const mines = layout.mines;

  // Record the first click on the *state* whether or not the layout was
  // generated here: a save restored from the private desc has the layout but
  // not the click, and this replayed open must put it back.
  if (state.clickedAt === null) state.clickedAt = { x, y };
  // Likewise the layout's start square, which the hint and the "start here"
  // cross read after an undo back to the start.
  if (layout.startx < 0) {
    layout.startx = x;
    layout.starty = y;
  }

  if (mines[y * w + x]) {
    // Trodden on a mine. Expose only it (so an undo can carry on).
    state.dead = true;
    grid[y * w + x] = KILLED;
    return;
  }

  // Flood: a square with no neighboring mines opens its covered neighbors.
  const todo: Point[] = [{ x, y }];
  grid[y * w + x] = TODO;
  while (todo.length > 0) {
    const sq = todo.pop() as Point;
    const near = around(w, h, sq.x, sq.y);
    const v = near.filter((q) => mines[q.y * w + q.x]).length;
    grid[sq.y * w + sq.x] = v;
    if (v > 0) continue;
    for (const q of near) {
      if (grid[q.y * w + q.x] === COVERED) {
        grid[q.y * w + q.x] = TODO;
        todo.push(q);
      }
    }
  }

  if (state.dead) return;

  // Win when exactly as many squares stay covered as there are mines.
  let nmines = 0;
  let ncovered = 0;
  for (let i = 0; i < w * h; i++) {
    if (grid[i] < 0) ncovered++;
    if (mines[i]) nmines++;
  }
  // A win flags the mines left covered, as upstream does.
  if (ncovered === nmines) {
    for (let i = 0; i < w * h; i++) if (grid[i] < 0) grid[i] = FLAG;
  }
}

// --- input -------------------------------------------------------------

/** Open the covered (or queried) square `{ x, y }`, counting a death if a mine
 * is under it; anything else opens nothing. */
function openAt(s: MinesState, { x, y }: Point, ui: MinesUi): MinesMove | null {
  const v = s.grid[y * s.w + x];
  if (v !== COVERED && v !== QUERY) return null;
  if (s.layout.mines?.[y * s.w + x]) ui.deaths++;
  return { type: "ops", ops: [{ op: "O", x, y }] };
}

/** Whether `{ x, y }` is a number with exactly its count of flags around it,
 * the only square a chord acts on. */
function chordReady(s: MinesState, x: number, y: number): boolean {
  const v = s.grid[y * s.w + x];
  if (v <= 0) return false;
  const flags = around(s.w, s.h, x, y).filter((q) => s.grid[q.y * s.w + q.x] === FLAG);
  return flags.length === v;
}

/** Chord the number at `{ x, y }` (upstream `goto uncover`, mines.c:2682): if
 * its flags match its count, open every covered neighbor (`C`) — unless one of
 * them is really a mine (a misplaced flag), in which case reveal *only* those
 * mines and count a death. */
function chordAt(s: MinesState, { x, y }: Point, ui: MinesUi): MinesMove | null {
  const { w, h } = s;
  if (!chordReady(s, x, y)) return null;
  const near = around(w, h, x, y);
  const ops: MineOp[] = near
    .filter((q) => s.grid[q.y * w + q.x] !== FLAG && s.layout.mines?.[q.y * w + q.x])
    .map((q) => ({ op: "O", x: q.x, y: q.y }));
  if (ops.length > 0) {
    ui.deaths++;
    return { type: "ops", ops };
  }
  return { type: "ops", ops: [{ op: "C", x, y }] };
}

const targetVerbs: TargetVerbs<MinesState, MinesUi, MinesDrawState, Point, MinesMove> =
  {
    geometry: squareGrid({ size: (s) => s, border: borderFor }),
    primary: {
      does:
        "open it, or, on a numbered square with exactly the right number of flags " +
        "around it, open all the squares around it that are not flagged",
      apply: (s, t, ui) => openAt(s, t, ui) ?? chordAt(s, t, ui),
    },
    secondary: {
      does: "place or remove a flag, if you think it is a mine",
      // Toggles a covered square between flagged and unflagged only.
      apply: (s, { x, y }) => {
        const v = s.grid[y * s.w + x];
        return v !== COVERED && v !== FLAG
          ? null
          : { type: "ops", ops: [{ op: "F", x, y }] };
      },
    },
  };

// --- hint ----------------------------------------------------------------

function keepTrack(
  m: MinesMove,
  step: HintStep<MinesMove, MinesHint>,
  s: MinesState,
): HintTrackVerdict {
  return minesHintKeepTrack(m, step, s, minesGame.executeMove);
}

// --- Game object -------------------------------------------------------

const mk = (w: number, h: number, n: number): MinesParams => ({
  ...defaultParams(),
  w,
  h,
  n,
});

export const minesGame: Game<
  MinesParams,
  MinesState,
  MinesMove,
  MinesUi,
  MinesDrawState,
  Point,
  MinesHint,
  MinesRung
> = {
  id: "mines",
  preferredTileSize: PREFERRED_TILE_SIZE,

  defaultParams,
  presets() {
    return {
      title: "Mines",
      submenu: [
        { params: mk(9, 9, 10) },
        { params: mk(9, 9, 35) },
        { params: mk(16, 16, 40) },
        { params: mk(16, 16, 99) },
        { params: mk(16, 30, 99) },
        { params: mk(16, 30, 170) },
      ],
    };
  },
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: (p) => ({
    ...p,
    w: p.h,
    h: p.w,
    firstClickX: p.firstClickY,
    firstClickY: p.firstClickX,
  }),
  paramConfig: [
    ...dimensionParamConfig<MinesParams>({
      doc: "Size of the grid in squares, more than 2 in each direction: a narrower grid cannot be laid out so that it is solved without guessing.",
      // Upstream's `SHRT_MAX`.
      bounds: { min: 1, max: 32767 },
    }),
    {
      kw: "mines",
      name: "Mines",
      type: "string",
      doc: "How many mines are hidden. Give a number, or a percentage such as <code>20%</code> of the grid's squares. There must be at least nine squares without a mine, because none is ever placed in or next to the first square you open.",
      bounds: { min: 1 },
      label: { slot: "tail", words: (p) => `${p.n} mines` },
      get: (p) => String(p.n),
      set: (p, v) => {
        // Percentage-of-area form (upstream `custom_params`, mines.c:271). The
        // width/height items run first (array order), so `p.w * p.h` is current.
        const n = parseConfigInt(v);
        p.n = v.includes("%") ? Math.floor((n * (p.w * p.h)) / 100) : n;
      },
    },
  ],

  newDesc(p: MinesParams, rng: RandomState): { desc: string } {
    // Burn the two `random_upto` draws batch generation spends on a first
    // click, purely to keep the RNG stream in step with it so shared seeds
    // reproduce.
    randomUpto(rng, p.w);
    randomUpto(rng, p.h);
    return { desc: `r${p.n},u,${randomStateEncode(rng)}` };
  },
  newState(p: MinesParams, desc: string): MinesState {
    const { layout, openXY } = decodeDesc(p, desc);
    const state: MinesState = {
      w: p.w,
      h: p.h,
      n: p.n,
      dead: false,
      layout,
      clickedAt: null,
      grid: new Int8Array(p.w * p.h).fill(COVERED),
    };
    if (openXY) openSquare(state, openXY.x, openXY.y);
    return state;
  },
  newUi(): MinesUi {
    return {
      hx: -1,
      hy: -1,
      hradius: 0,
      validradius: 0,
      flashIsDeath: false,
      deaths: 0,
      cursor: newCursor(),
    };
  },
  encodeUi,
  decodeUi,

  targetVerbs,

  interpretMove(
    s: MinesState,
    ui: MinesUi,
    ds: MinesDrawState,
    p: Point,
    button: number,
  ): MinesMove | null | UiUpdate {
    const { w, h } = s;
    if (s.dead || isWon(s)) return null; // no further moves permitted

    const tileSize = ds.tileSize;
    const border = borderFor(tileSize);
    const cx = fromCoord(p.x, tileSize, border);
    const cy = fromCoord(p.y, tileSize, border);

    // The left button depresses on the press and acts on the release, through
    // the same verbs Enter reaches via the model.
    if (button === LEFT_BUTTON || button === LEFT_DRAG) {
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) return null;
      // A press moves the highlight, whose *radius* previews a chord: 1 lights
      // the 3×3 around a number, 0 only the pressed cell. Pressed cells render
      // like opened ones, so the 3×3 shows only where the release will chord —
      // a number with all its flags — and never flashes a false "uncover" that
      // reverts on release.
      const onNumber = s.grid[cy * w + cx] >= 0;
      // validradius records chord-vs-open intent, preview or no preview: the
      // release chords a number (1) and opens a covered square (0).
      if (button === LEFT_BUTTON) ui.validradius = onNumber ? 1 : 0;
      ui.hx = cx;
      ui.hy = cy;
      ui.hradius = ui.validradius === 1 && chordReady(s, cx, cy) ? 1 : 0;
      pressTarget(targetVerbs, ui, { x: cx, y: cy });
      return UI_UPDATE;
    }

    if (button === LEFT_RELEASE) {
      ui.hx = ui.hy = -1;
      ui.hradius = 0;
      // Past this point we have adjusted the ui, so never return null.
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) return UI_UPDATE;
      const at = { x: cx, y: cy };
      // What the press intended, wherever the release lands: a covered square
      // pressed opens, a number pressed chords.
      const move =
        button === LEFT_RELEASE && ui.validradius === 0
          ? openAt(s, at, ui)
          : chordAt(s, at, ui);
      return move ?? UI_UPDATE;
    }

    return interpretTargetVerbs(targetVerbs, s, ui, ds, p, button);
  },

  executeMove(s: MinesState, m: MinesMove): MinesState {
    const { w, h } = s;
    if (m.type === "solve") {
      if (!s.layout.mines) throw new Error("Game has not been started yet");
      // The finished board, whatever was opened or flagged on the way: an
      // opened mine and a wrong flag are replaced like any wrong entry.
      const ret = { ...cloneState(s), dead: false };
      const mines = s.layout.mines;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          ret.grid[y * w + x] = mines[y * w + x]
            ? FLAG
            : around(w, h, x, y).filter((q) => mines[q.y * w + q.x]).length;
        }
      }
      return ret;
    }
    if (m.type !== "ops") return assertNever(m, "mines: executeMove");

    if (s.dead) throw new Error("dead players cannot move");
    const ret = cloneState(s);
    for (const op of m.ops) {
      const { x, y } = op;
      if (x < 0 || x >= w || y < 0 || y >= h) {
        throw new Error(`move out of range: ${op.op}${x},${y}`);
      }
      const i = y * w + x;
      if (op.op === "F") {
        if (ret.grid[i] === FLAG || ret.grid[i] === COVERED) {
          ret.grid[i] ^= COVERED ^ FLAG; // toggle -2 <-> -1
        } else {
          throw new Error("illegal flag move");
        }
      } else if (op.op === "O") {
        openSquare(ret, x, y);
      } else if (op.op === "C") {
        for (const q of around(w, h, x, y)) {
          const v = ret.grid[q.y * w + q.x];
          if (v === COVERED || v === QUERY) openSquare(ret, q.x, q.y);
        }
      } else {
        // `op` is one shape with a three-value `op` field, not a union of
        // shapes, so it is `op.op` that narrows to `never` here.
        assertNever(op.op, `mines: executeMove op at (${x},${y})`);
      }
    }
    return ret;
  },

  supersededDesc(s: MinesState): SupersededDesc | null {
    // Answer "nothing to say" until the layout exists AND the first click is
    // recorded — both happen together on the first open.
    if (!s.layout.mines || !s.clickedAt) return null;
    const hex = encodeLayoutHex(s.layout.mines, s.w * s.h);
    return { desc: `${s.clickedAt.x},${s.clickedAt.y},m${hex}`, privDesc: `m${hex}` };
  },

  solve(_orig: MinesState, curr: MinesState): SolveResult<MinesMove> {
    if (!curr.layout.mines) return { ok: false, error: NOT_STARTED };
    return { ok: true, move: { type: "solve" } };
  },

  status(s: MinesState): GameStatus {
    // Death is NOT a loss (the player will undo); only a genuine win is
    // reported, and the midend upgrades it to "solved-with-help" if the Solve
    // button was used (mines.c game_status:3322).
    return isWon(s) ? "solved" : "ongoing";
  },

  // A flag on a square with no mine under it. A mine the player opened is not
  // a mark to fix: the hint's dead-board refusal answers that.
  findMistakes(s: MinesState): readonly Point[] {
    const mines = s.layout.mines;
    if (!mines) return [];
    const out: Point[] = [];
    for (let i = 0; i < s.w * s.h; i++)
      if (s.grid[i] === FLAG && !mines[i])
        out.push({ x: i % s.w, y: Math.floor(i / s.w) });
    return out;
  },

  // A death is not a loss (the player undoes and plays on), yet nobody is
  // playing a dead board, so the timer holds on it.
  timerHolds(s: MinesState): boolean {
    return s.dead;
  },

  statusbarText(s: MinesState, ui: MinesUi): string {
    let mines = 0;
    let markers = 0;
    let closed = 0;
    for (let i = 0; i < s.w * s.h; i++) {
      const v = s.grid[i];
      if (v < 0) closed++;
      if (v === FLAG) markers++;
      if (s.layout.mines?.[i]) mines++;
    }
    if (!s.layout.mines) mines = s.layout.n;

    // A win's words are the engine's.
    let sb = "";
    if (s.dead) {
      sb = "DEAD!";
    } else if (!isWon(s)) {
      sb = `Marked: ${markers} / ${mines}`;
      const safeClosed = closed - mines;
      if (safeClosed > 0 && safeClosed <= 9) {
        sb +=
          safeClosed === 1
            ? " (1 safe square remains)"
            : ` (${safeClosed} safe squares remain)`;
      }
    }
    if (ui.deaths) sb = sb ? `${sb}  Deaths: ${ui.deaths}` : `Deaths: ${ui.deaths}`;
    return sb;
  },

  textFormat(s: MinesState): string {
    let out = "";
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const v = s.grid[y * s.w + x];
        let c: string;
        if (v === 0) c = "-";
        else if (v >= 1 && v <= 8) c = String(v);
        else if (v === FLAG) c = "*";
        else if (v === COVERED || v === QUERY) c = "?";
        else if (v === KILLED) c = "!";
        else c = " ";
        out += c;
      }
      out += "\n";
    }
    return out;
  },

  /** The death flash: a death is not a status, so the engine cannot see it. */
  flashLength(a: MinesState, b: MinesState, dir: number, ui: MinesUi): number {
    if (dir > 0 && !a.dead && b.dead) {
      ui.flashIsDeath = true;
      return 3 * FLASH_FRAME;
    }
    return 0;
  },

  solvedFlash(_s: MinesState, ui: MinesUi): number {
    ui.flashIsDeath = false;
    return 2 * FLASH_FRAME;
  },

  paletteScheme: {
    darkSwaps: [
      // An opened square and a covered one are a tone apart, and the tone has
      // to step the same way off the board in both schemes.
      [COL_BACKGROUND, COL_BACKGROUND2],
      [COL_HIGHLIGHT, COL_LOWLIGHT],
    ],
  },

  colors(defaultBackground: Color): Color[] {
    const bg = defaultBackground;
    const ret: Color[] = new Array(NCOLORS);
    ret[COL_BACKGROUND] = bg;
    ret[COL_BACKGROUND2] = minesUnclearedFace(bg);
    // Upstream's count colors, and by now most players' expectation of what a
    // minesweeper looks like: 1 blue, 2 green, 3 red, 4 navy, 5 maroon, 6 teal.
    // The two dark ones are why the palette has a bold step at all — a wash is a
    // fill, and these are digits.
    ret[COL_1] = BLUE;
    ret[COL_2] = GREEN;
    ret[COL_3] = RED;
    ret[COL_4] = BLUE_BOLD;
    ret[COL_5] = RED_BOLD;
    ret[COL_6] = TEAL;
    ret[COL_7] = INK;
    ret[COL_8] = GRAY;
    ret[COL_MINE] = BLACK;
    ret[COL_BANG] = ERROR;
    // Red because a flag is yours and deliberate, not because anything is
    // wrong — but the same red, which is what the collection has one of.
    ret[COL_FLAG] = RED;
    ret[COL_FLAGBASE] = INK;
    ret[COL_QUERY] = INK;
    ret[COL_HIGHLIGHT] = PAPER;
    ret[COL_LOWLIGHT] = minesLowlight(bg);
    ret[COL_WRONGNUMBER] = ERROR_WASH;
    // Pink: it has to read on a cleared square and an uncleared one alike, and
    // the board's own grays and the count digits have the rest spoken for.
    ret[COL_CURSOR] = PINK;
    ret[COL_HINT] = HINT_ACTION;
    ret[COL_HINT_EVIDENCE] = HINT_EVIDENCE;
    return ret;
  },
  computeSize,
  newDrawState,
  redraw,

  // The hint's own plan, played to its end. A board not laid out yet will be
  // laid out to finish from whichever square is opened first. A layout that
  // names no first square was made for one it does not say, and opening any
  // other is a guess.
  finishesByDeduction(s: MinesState): boolean {
    if (!s.layout.mines) return true;
    if (s.clickedAt === null) return false;
    const plan = minesHint(s, minesGame.executeMove);
    if (!plan.ok) return false;
    const end = plan.steps.reduce(
      (board, step) => minesGame.executeMove(board, step.move),
      s,
    );
    return isWon(end);
  },
  hint: (s) => minesHint(s, minesGame.executeMove),
  hintRungs: MINES_RUNGS,
  hintMarks: {
    roles: {
      ring: "each square the step decides: it must be a mine, it must be safe, or its flag must come off, as the sentence says.",
      outline:
        "what the step reasons from: the numbers it counts, and the mines one of them already touches.",
      stripes:
        "one set of squares the reasoning treats as a whole: the squares two numbers share, a number's squares beyond another's, or the squares a count of the mines left covers.",
    },
  },
  hintKeepTrack: keepTrack,
  hintGesture: (s, ui, ds, _m, step) =>
    verbClicks(
      targetVerbs,
      { executeMove: minesGame.executeMove, hintKeepTrack: keepTrack },
      s,
      ui,
      ds,
      step,
      step.highlights?.targets ?? [],
    ),
  refreshHintStep: minesRefreshHintStep,
};

registerGame(minesGame);
