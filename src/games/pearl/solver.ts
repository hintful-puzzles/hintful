/**
 * Pearl solver — port of `pearl_solve` (pearl.c), as a `runDeductionFixpoint`
 * ladder. Pure iterative constraint propagation (no guessing, no recursion):
 * edge↔square elimination, the black-pearl (CORNER) and white-pearl
 * (STRAIGHT) clue deductions, and loop detection over a union-find. The Tricky
 * tier adds the shortcut-loop rule, so both tiers are guess-free.
 *
 * The workspace is `(2w+1)×(2h+1)`: squares sit at odd (x, y) and hold a
 * bitmask of their possible states (`1 << <directions>`); the edges between
 * them are 1 connected, 2 disconnected, 3 unknown.
 *
 * Upstream's loop runs the first two stages in one pass and has a `continue`
 * inside its Easy-only branch that reads as the Tricky rung running after an
 * earlier stage fired. It never does: the clue stage's own `continue` sits
 * just before it, so that branch is reached only with nothing fired, and the
 * first stage leaves nothing for itself to find a second time. So the runner's
 * walk is upstream's; `pearl-ladder.test.ts` proves it against the loop, kept
 * as {@link pearlWorkspaceLegacy}.
 *
 * Used by the generator (uniqueness gating), `solve`, `findMistakes`, and the
 * hint's recording pass ({@link pearlRecordingPass}).
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  ACW,
  bBLANK,
  bLD,
  bLR,
  bLU,
  bRD,
  bRU,
  bUD,
  CORNER,
  CW,
  D,
  DIFF_COUNT,
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  F,
  L,
  R,
  STRAIGHT,
  U,
} from "./state.ts";

/** The solver's verdict and the workspace it left. */
export interface PearlWorkspace {
  /** 0 inconsistent, 1 unique, 2 ambiguous. */
  ret: number;
  ws: Int32Array;
}

/** Every square open to the states its clue allows, the border edges
 * disconnected and every other edge unknown. */
function initialWorkspace(w: number, h: number, clues: Uint8Array): Int32Array {
  const W = 2 * w + 1;
  const ws = new Int32Array(W * (2 * h + 1));

  // Square states.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const sq = (2 * y + 1) * W + 2 * x + 1;
      switch (clues[y * w + x]) {
        case CORNER:
          ws[sq] = bLU | bLD | bRU | bRD;
          break;
        case STRAIGHT:
          ws[sq] = bLR | bUD;
          break;
        default:
          ws[sq] = bLR | bUD | bLU | bLD | bRU | bRD | bBLANK;
          break;
      }
    }
  // Horizontal edges (disconnected at the top/bottom border, else unknown).
  for (let y = 0; y <= h; y++)
    for (let x = 0; x < w; x++)
      ws[2 * y * W + (2 * x + 1)] = y === 0 || y === h ? 2 : 3;
  // Vertical edges (disconnected at the left/right border, else unknown).
  for (let y = 0; y < h; y++)
    for (let x = 0; x <= w; x++)
      ws[(2 * y + 1) * W + 2 * x] = x === 0 || x === w ? 2 : 3;
  return ws;
}

// --- the recording projection ----------------------------------------------

/**
 * Why one firing on the hint path holds, set by the rung as it fires. Squares
 * are cell indices (`y * w + x`); a direction is a single `R`/`U`/`L`/`D` bit.
 */
export type PearlReason =
  /** A square's pearl and edges leave it one way to take some edge. */
  | { kind: "square"; sq: number }
  /** A black pearl's line runs straight through the next square along `dir`. */
  | { kind: "blackRunsOn"; pearl: number; dir: number }
  /** ...and it cannot here, so the pearl's side toward `dir` is ruled out. */
  | { kind: "blackCannotRunOn"; pearl: number; dir: number }
  /** A white pearl cannot run along `axis` (`R` across, `U` up and down),
   * because neither square beside it that way can turn into it. */
  | { kind: "whiteCannotTurn"; pearl: number; axis: number }
  /** A white pearl's line runs straight on through the square toward `dir`, so
   * it must turn in the square on the other side. */
  | { kind: "whiteTurnsOpposite"; pearl: number; dir: number }
  /** The edge from `sq` toward `dir` would close the lines through `piece`
   * into a loop that leaves something out. */
  | { kind: "closesEarly"; sq: number; dir: number; piece: number[] }
  /** Taking `shape` would join `sq` to both ends of `piece`, with the same
   * result. */
  | { kind: "closesEarlyThrough"; sq: number; shape: number; piece: number[] };

/** The hint path's recorder: present only there, so every reason and every
 * per-premise return below sits behind `if (rec)` and the generator's path is
 * the ladder upstream ran. */
export interface PearlRecorder {
  reason: PearlReason | null;
}

/** The workspace the rungs share, and the loop pieces the last
 * {@link PearlBoard.buildLoops} found. */
export class PearlBoard {
  readonly W: number;
  readonly H: number;
  readonly ws: Int32Array;
  /** A closed loop was found and everything off it blanked: solved. */
  closed = false;
  readonly dsf: Dsf;
  readonly dsfsize: Int32Array;
  nonblanks = 0;
  rec: PearlRecorder | null = null;
  /** Every square's states before any edge is known: what its clue allows. */
  private readonly clueShapes: Int32Array;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly clues: Uint8Array,
  ) {
    this.W = 2 * w + 1;
    this.H = 2 * h + 1;
    this.ws = initialWorkspace(w, h, clues);
    this.clueShapes = this.ws.slice();
    this.dsf = new Dsf(w * h);
    this.dsfsize = new Int32Array(w * h);
  }

  /** The workspace index of the edge leaving square `(x, y)` toward `d`. */
  edgeAt(x: number, y: number, d: number): number {
    return (2 * y + 1 + DY(d)) * this.W + 2 * x + 1 + DX(d);
  }

  /**
   * Forget every state a square was struck to that its clue and its four edges
   * do not rule out themselves. The hint calls this before every firing, so
   * nothing a step rests on is a fact the player has no mark for: the player
   * marks edges, and a square's states are read off those. Returns `-1` if some
   * square is left with no state at all.
   */
  readSquaresFromEdges(): number {
    const { w, h, W, ws } = this;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sq = (2 * y + 1) * W + 2 * x + 1;
        ws[sq] = this.clueShapes[sq];
      }
    return this.shapesFromEdges() < 0 ? -1 : 0;
  }

  /**
   * Nail every unknown edge around square `(x, y)` that all its surviving
   * states agree on. With `oneAxis`, a black pearl's nails stop at the first
   * axis that has one, since each of its axes is a deduction of its own.
   * Returns how many edges it nailed, or `-1` if the states disagree with
   * themselves.
   */
  private nailSquare(x: number, y: number, oneAxis: boolean): number {
    const { W, ws } = this;
    const sq = (2 * y + 1) * W + 2 * x + 1;
    let edgeor = 0;
    let edgeand = 15;
    for (let b = 0; b < 0xd; b++)
      if (ws[sq] & (1 << b)) {
        edgeor |= b;
        edgeand &= b;
      }
    // Consistency: no bit both connected and disconnected.
    if (edgeand & ~edgeor) return -1;
    let nail = 0;
    for (let d = 1; d <= 8; d += d)
      if (ws[this.edgeAt(x, y, d)] === 3 && (!(edgeor & d) || edgeand & d)) nail |= d;
    if (oneAxis && nail && this.clues[y * this.w + x] === CORNER)
      nail &= nail & (R | L) ? R | L : U | D;
    let fired = 0;
    for (let d = 1; d <= 8; d += d)
      if (nail & d) {
        ws[this.edgeAt(x, y, d)] = edgeor & d ? 1 : 2;
        fired++;
      }
    return fired;
  }

  /**
   * Narrow square `sq` (a workspace index) to `states`. On the hint path a
   * narrowed square counts only through the edges it nails there and then,
   * because the player has no mark for a square's states, so it is settled at
   * once and taken back if it nails none. Returns the changes made, or `-1`.
   */
  private narrow(sq: number, states: number, reason: PearlReason): number {
    const { ws, rec } = this;
    if (!rec) {
      ws[sq] = states;
      return 1;
    }
    const was = ws[sq];
    ws[sq] = states;
    const x = ((sq % this.W) - 1) >> 1;
    const y = (((sq / this.W) | 0) - 1) >> 1;
    const nailed = this.nailSquare(x, y, false);
    if (nailed > 0) rec.reason = reason;
    else if (nailed === 0) ws[sq] = was;
    return nailed;
  }

  /** Discard any square state inconsistent with the known edges around it. */
  shapesFromEdges(): number {
    const { w, h, W, ws } = this;
    let fired = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sq = (2 * y + 1) * W + 2 * x + 1;
        for (let b = 0; b < 0xd; b++)
          if (ws[sq] & (1 << b)) {
            for (let d = 1; d <= 8; d += d) {
              const ex = 2 * x + 1 + DX(d);
              const ey = 2 * y + 1 + DY(d);
              if (ws[ey * W + ex] === (b & d ? 2 : 1)) {
                ws[sq] &= ~(1 << b);
                fired++;
                break;
              }
            }
          }
        // Consistency: each square must have at least one state left.
        if (!ws[sq]) return -1;
      }
    return fired;
  }

  /** Nail down any unknown edge its square's surviving states agree on. On the
   * hint path, one square's nails (one axis of a black pearl's) are a firing. */
  edgesFromShapes(): number {
    const { w, h, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const nailed = this.nailSquare(x, y, rec !== null);
        if (nailed < 0) return -1;
        fired += nailed;
        if (rec && nailed) {
          rec.reason = { kind: "square", sq: y * w + x };
          return fired;
        }
      }
    return fired;
  }

  /** The longer-range deductions from the black and white pearls. On the hint
   * path, each pearl rule that nails an edge is a firing of its own. */
  pearlClues(): number {
    const { w, h, W, ws, clues, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const pearl = y * w + x;
        const clue = clues[pearl];
        if (clue === CORNER) {
          for (let d = 1; d <= 8; d += d) {
            const ex = 2 * x + 1 + DX(d);
            const ey = 2 * y + 1 + DY(d);
            const fx = ex + DX(d);
            const fy = ey + DY(d);
            const type = d | F(d);
            if (ws[ey * W + ex] === 1) {
              // Corner connected on an edge ⇒ the square beyond it is a
              // straight in that direction.
              if (ws[fy * W + fx] !== 1 << type) {
                const n = this.narrow(fy * W + fx, 1 << type, {
                  kind: "blackRunsOn",
                  pearl,
                  dir: d,
                });
                if (n < 0) return -1;
                fired += n;
                if (rec && n) return fired;
              }
            } else if (ws[ey * W + ex] === 3) {
              // Corner separated by an unknown edge from a square that
              // cannot be the required straight ⇒ that edge is disconnected.
              if (!(ws[fy * W + fx] & (1 << type))) {
                ws[ey * W + ex] = 2;
                fired++;
                if (rec) {
                  rec.reason = { kind: "blackCannotRunOn", pearl, dir: d };
                  return fired;
                }
              }
            }
          }
        } else if (clue === STRAIGHT) {
          const sq = (2 * y + 1) * W + 2 * x + 1;
          // If a straight is between two squares neither of which can be a
          // corner connected to it, it cannot point that way.
          for (let d = 1; d <= 2; d += d) {
            const fx = 2 * x + 1 + 2 * DX(d);
            const fy = 2 * y + 1 + 2 * DY(d);
            const gx = 2 * x + 1 - 2 * DX(d);
            const gy = 2 * y + 1 - 2 * DY(d);
            const type = d | F(d);
            if (!(ws[sq] & (1 << type))) continue;
            if (
              !(ws[fy * W + fx] & ((1 << (F(d) | ACW(d))) | (1 << (F(d) | CW(d))))) &&
              !(ws[gy * W + gx] & ((1 << (d | ACW(d))) | (1 << (d | CW(d)))))
            ) {
              const n = this.narrow(sq, ws[sq] & ~(1 << type), {
                kind: "whiteCannotTurn",
                pearl,
                axis: d,
              });
              if (n < 0) return -1;
              fired += n;
              if (rec && n) return fired;
            }
          }
          // If a straight with known direction connects on one side to a
          // known straight, the other side must be a corner.
          for (let d = 1; d <= 8; d += d) {
            const fx = 2 * x + 1 + 2 * DX(d);
            const fy = 2 * y + 1 + 2 * DY(d);
            const gx = 2 * x + 1 - 2 * DX(d);
            const gy = 2 * y + 1 - 2 * DY(d);
            const type = d | F(d);
            if (ws[sq] !== 1 << type) continue;
            if (
              !(ws[fy * W + fx] & ~(bLR | bUD)) &&
              ws[gy * W + gx] & ~(bLU | bLD | bRU | bRD)
            ) {
              const g = gy * W + gx;
              const n = this.narrow(g, ws[g] & (bLU | bLD | bRU | bRD), {
                kind: "whiteTurnsOpposite",
                pearl,
                dir: d,
              });
              if (n < 0) return -1;
              fired += n;
              if (rec && n) return fired;
            }
          }
        }
      }
    return fired;
  }

  /**
   * Union the squares the connected edges join into loop pieces, counting the
   * squares that cannot be blank. Returns the piece that has closed into a
   * loop, `-1` when none has, or `-2` when two have.
   */
  private buildLoops(): number {
    const { w, W, H, ws, dsf, dsfsize } = this;
    dsf.reinit();
    dsfsize.fill(1);
    this.nonblanks = 0;
    let loopclass = -1;
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        if ((y ^ x) & 1) {
          // Edge field. Compute the squares it connects.
          const ac = ((y - 1) >> 1) * w + ((x - 1) >> 1);
          const bc = (y >> 1) * w + (x >> 1);
          if (ws[y * W + x] === 1) {
            let ae = dsf.canonify(ac);
            const be = dsf.canonify(bc);
            if (ae === be) {
              if (loopclass !== -1) return -2; // two separate loops: doom
              loopclass = ae;
            } else {
              const size = dsfsize[ae] + dsfsize[be];
              dsf.merge(ac, bc);
              ae = dsf.canonify(ac);
              dsfsize[ae] = size;
            }
          }
        } else if (y & x & 1) {
          // Square field. Count if it's definitely non-blank.
          if (!(ws[y * W + x] & bBLANK)) this.nonblanks++;
        }
      }
    return loopclass;
  }

  /**
   * A loop has closed: blank every square off it and stop, solved. Fires once,
   * and {@link closed} is the ladder's `settled`, so nothing runs after it.
   */
  closedLoop(): number {
    const { w, h, W, ws, dsf } = this;
    const loopclass = this.buildLoops();
    if (loopclass === -2) return -1;
    if (loopclass === -1) return 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (dsf.canonify(y * w + x) !== loopclass) {
          const sq = (2 * y + 1) * W + 2 * x + 1;
          // A non-blank square outside the loop: goofed.
          if (!(ws[sq] & bBLANK)) return -1;
          ws[sq] = bBLANK;
        }
    this.closed = true;
    return 1;
  }

  /** Mark any edge or square state that would close a loop short of every
   * square that cannot be blank. */
  shortcutLoops(): number {
    const { W, H, ws, rec } = this;
    // The closed-loop rung runs before this one at every cap and found no
    // loop, so this rebuilds the open pieces it saw.
    this.buildLoops();
    if (rec) return this.firstShortcut(rec);
    let fired = 0;
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        if ((y ^ x) & 1) {
          if (this.edgeClosesEarly(x, y)) {
            ws[y * W + x] = 2;
            fired++;
          }
        } else if (y & x & 1) {
          for (let b = 2; b < 0xd; b++)
            if (ws[y * W + x] & (1 << b) && this.shapeClosesEarly(x, y, b)) {
              ws[y * W + x] &= ~(1 << b);
              fired++;
            }
        }
      }
    return fired;
  }

  /**
   * The hint path's shortcut rung: the first edge that would close a loop
   * early, and failing that the first square state that would. Edges go first
   * because a state that runs from the end of a piece to its other end is
   * ruled out by exactly the edge the first half finds.
   */
  private firstShortcut(rec: PearlRecorder): number {
    const { w, W, H, ws } = this;
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++)
        if ((y ^ x) & 1 && this.edgeClosesEarly(x, y)) {
          ws[y * W + x] = 2;
          const vertical = y & 1;
          const cx = (x - 1) >> 1;
          const cy = (y - 1) >> 1;
          const sq = cy * w + cx;
          rec.reason = {
            kind: "closesEarly",
            sq,
            dir: vertical ? R : D,
            piece: this.pieceOf(sq),
          };
          return 1;
        }
    for (let y = 1; y < H - 1; y += 2)
      for (let x = 1; x < W - 1; x += 2)
        for (let b = 2; b < 0xd; b++) {
          const sq = y * W + x;
          if (!(ws[sq] & (1 << b)) || !this.shapeClosesEarly(x, y, b)) continue;
          const cell = ((y - 1) >> 1) * w + ((x - 1) >> 1);
          const d = b & -b;
          const end = cell + DY(d) * w + DX(d);
          const n = this.narrow(sq, ws[sq] & ~(1 << b), {
            kind: "closesEarlyThrough",
            sq: cell,
            shape: b,
            piece: this.pieceOf(end),
          });
          if (n) return n;
        }
    return 0;
  }

  /** Is the unknown edge at workspace `(x, y)` one that joins two squares of
   * the same piece, when some square that cannot be blank lies off it? */
  private edgeClosesEarly(x: number, y: number): boolean {
    const { w, W, ws, dsf, dsfsize } = this;
    if (ws[y * W + x] !== 3) return false;
    const ae = dsf.canonify(((y - 1) >> 1) * w + ((x - 1) >> 1));
    const be = dsf.canonify((y >> 1) * w + (x >> 1));
    return ae === be && dsfsize[ae] < this.nonblanks;
  }

  /** Would the square at workspace `(x, y)` taking state `b` join two ends of
   * one piece, when some square that cannot be blank lies off it? */
  private shapeClosesEarly(x: number, y: number, b: number): boolean {
    const { w, W, ws, dsf, dsfsize } = this;
    const ae = dsf.canonify(((y / 2) | 0) * w + ((x / 2) | 0));
    let e = -1;
    let connections = 0;
    for (let d = 1; d <= 8; d += d)
      if (b & d) {
        const xx = ((x / 2) | 0) + DX(d);
        const yy = ((y / 2) | 0) + DY(d);
        const ee = dsf.canonify(yy * w + xx);
        if (e === -1) e = ee;
        else if (e !== ee) e = -2;
        if (ws[(y + DY(d)) * W + (x + DX(d))] === 1) connections++;
      }
    if (e < 0 || connections >= 2) return false;
    let loopsize = dsfsize[e];
    if (e !== ae) loopsize++; // add the square itself
    return loopsize < this.nonblanks;
  }

  /** The cells of the piece holding cell `c`, in scan order. */
  private pieceOf(c: number): number[] {
    const { w, h, dsf } = this;
    const root = dsf.canonify(c);
    const cells: number[] = [];
    for (let i = 0; i < w * h; i++) if (dsf.canonify(i) === root) cells.push(i);
    return cells;
  }
}

function pearlLadder(b: PearlBoard): DeductionTechnique[] {
  return [
    { id: "shapes-from-edges", tier: DIFF_EASY, run: () => b.shapesFromEdges() },
    { id: "edges-from-shapes", tier: DIFF_EASY, run: () => b.edgesFromShapes() },
    { id: "pearl-clues", tier: DIFF_EASY, run: () => b.pearlClues() },
    { id: "closed-loop", tier: DIFF_EASY, run: () => b.closedLoop() },
    { id: "shortcut-loop", tier: DIFF_TRICKY, run: () => b.shortcutLoops() },
  ];
}

/**
 * Run the ladder to its fixpoint and return the verdict with the workspace.
 *
 * @param difficulty the highest tier to run (`DIFF_COUNT` runs them all).
 * @param firings the census sink, forwarded to `runDeductionFixpoint`; only
 *   `pearl-ladder.test.ts` passes one.
 */
export function pearlWorkspace(
  w: number,
  h: number,
  clues: Uint8Array,
  difficulty: number,
  firings?: FiringTally,
): PearlWorkspace {
  const b = new PearlBoard(w, h, clues);
  const { impossible } = runDeductionFixpoint({
    techniques: pearlLadder(b),
    maxTier: difficulty,
    settled: () => b.closed,
    firings,
  });
  return { ret: impossible ? 0 : b.closed ? 1 : 2, ws: b.ws };
}

/** An edge a firing decided: the side of square `sq` toward `dir` (`R` or `D`,
 * so each edge has one name), and whether it carries the line. */
export interface PearlEdgeOp {
  sq: number;
  dir: number;
  line: boolean;
}

/** One firing on the hint path. */
export interface PearlFiring {
  /** Why it holds; `null` for the closed-loop rung, which only confirms. */
  reason: PearlReason | null;
  /** The edges it decided. */
  ops: PearlEdgeOp[];
  /** The workspace just before it fired, which is what its sentence describes. */
  before: Int32Array;
}

/**
 * The recording projection's driver: the ladder one firing at a time, over the
 * player's board `b`.
 *
 * **Before every firing, each square's states are read afresh off its pearl and
 * its edges** ({@link PearlBoard.readSquaresFromEdges}), so no firing rests on
 * a state some earlier rung struck and no edge shows. The solver keeps those
 * strikes; the hint does not need them. Measured when this was written, over
 * 11,568 verdicts on generator-shaped boards from 6x6 to 10x10 at both tiers,
 * a solver that forgets them agrees with one that keeps them every time;
 * `pearl-hint.test.ts` holds the plans to finishing every board it deals.
 */
export function pearlRecordingPass(
  b: PearlBoard,
  budget: StepBudget,
): { next(): PearlFiring | null; impossible(): boolean } {
  const rec: PearlRecorder = { reason: null };
  b.rec = rec;
  let broken = false;
  const firings = singleFirings({
    techniques: pearlLadder(b),
    budget,
    beforeTechnique: () => {
      rec.reason = null;
    },
    settled: () => b.closed,
  });
  const { w, h, ws } = b;
  return {
    next(): PearlFiring | null {
      if (broken) return null;
      if (b.readSquaresFromEdges() < 0) {
        broken = true;
        return null;
      }
      const before = ws.slice();
      if (!firings.next()) return null;
      const ops: PearlEdgeOp[] = [];
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          for (const dir of [R, D]) {
            const e = b.edgeAt(x, y, dir);
            if (e < ws.length && ws[e] !== before[e])
              ops.push({ sq: y * w + x, dir, line: ws[e] === 1 });
          }
      return { reason: rec.reason, ops, before };
    },
    impossible: () => broken || firings.impossible(),
  };
}

/**
 * @param clues clue grid (NOCLUE/CORNER/STRAIGHT), length w*h
 * @param result out array (length w*h): written when solved (or `partial`)
 * @param difficulty DIFF_EASY or DIFF_TRICKY (or DIFF_COUNT to run all rungs)
 * @param partial when true, transcribe the partial workspace even if unsolved
 * @returns 0 inconsistent, 1 unique, 2 ambiguous
 */
export function pearlSolve(
  w: number,
  h: number,
  clues: Uint8Array,
  result: Uint8Array,
  difficulty: number,
  partial: boolean,
): number {
  const { ret, ws } = pearlWorkspace(w, h, clues, difficulty);
  if (ret === 1 || partial) transcribe(w, h, ws, result);
  return ret;
}

/** Transcribe the workspace's decided squares into `result`. */
function transcribe(w: number, h: number, ws: Int32Array, result: Uint8Array): void {
  const W = 2 * w + 1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // When the square is nailed to one state, write it; otherwise (only
      // possible under `partial`) leave the caller's prior value in place.
      const sq = (2 * y + 1) * W + 2 * x + 1;
      for (let b = 0; b < 0xd; b++)
        if (ws[sq] === 1 << b) {
          result[y * w + x] = b;
          break;
        }
    }

  // Fix up reciprocity: never leave a square linked to a neighbor that
  // does not link back (can happen when we give up on an impossible board).
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (let d = 1; d <= 8; d += d) {
        const nx = x + DX(d);
        const ny = y + DY(d);
        const linksBack =
          nx >= 0 && nx < w && ny >= 0 && ny < h && result[ny * w + nx] & F(d);
        if (!linksBack) result[y * w + x] &= ~d;
      }
}

/** Easiest difficulty (0-based) at which `clues` has a unique solution, or
 * -1 if none. */
export function gradePearl(w: number, h: number, clues: Uint8Array): number {
  const scratch = new Uint8Array(w * h);
  for (let diff = DIFF_EASY; diff < DIFF_COUNT; diff++)
    if (pearlSolve(w, h, clues, scratch, diff, false) === 1) return diff;
  return -1;
}

/** Upstream's hand-written loop, kept as the oracle `pearl-ladder.test.ts`
 * proves {@link pearlWorkspace} against. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: the whole deduction ladder in one pass; the rungs share loop state that extracting would have to thread back through.
export function pearlWorkspaceLegacy(
  w: number,
  h: number,
  clues: Uint8Array,
  difficulty: number,
): PearlWorkspace {
  const W = 2 * w + 1;
  const H = 2 * h + 1;
  const ws = initialWorkspace(w, h, clues);
  let ret = -1;

  const dsf = new Dsf(w * h);
  const dsfsize = new Int32Array(w * h);

  loop: while (true) {
    let doneSomething = false;

    // Discard any square state inconsistent with known edges around it.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sq = (2 * y + 1) * W + 2 * x + 1;
        for (let b = 0; b < 0xd; b++)
          if (ws[sq] & (1 << b)) {
            for (let d = 1; d <= 8; d += d) {
              const ex = 2 * x + 1 + DX(d);
              const ey = 2 * y + 1 + DY(d);
              if (ws[ey * W + ex] === (b & d ? 2 : 1)) {
                ws[sq] &= ~(1 << b);
                doneSomething = true;
                break;
              }
            }
          }
        // Consistency: each square must have at least one state left.
        if (!ws[sq]) {
          ret = 0;
          break loop;
        }
      }

    // Nail down any unknown edge whose neighboring square makes it known.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const sq = (2 * y + 1) * W + 2 * x + 1;
        let edgeor = 0;
        let edgeand = 15;
        for (let b = 0; b < 0xd; b++)
          if (ws[sq] & (1 << b)) {
            edgeor |= b;
            edgeand &= b;
          }
        // Consistency: no bit both connected and disconnected.
        if (edgeand & ~edgeor) {
          ret = 0;
          break loop;
        }
        for (let d = 1; d <= 8; d += d) {
          const ex = 2 * x + 1 + DX(d);
          const ey = 2 * y + 1 + DY(d);
          if (!(edgeor & d) && ws[ey * W + ex] === 3) {
            ws[ey * W + ex] = 2;
            doneSomething = true;
          } else if (edgeand & d && ws[ey * W + ex] === 3) {
            ws[ey * W + ex] = 1;
            doneSomething = true;
          }
        }
      }

    if (doneSomething) continue;

    // Longer-range clue-based deductions.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const clue = clues[y * w + x];
        if (clue === CORNER) {
          for (let d = 1; d <= 8; d += d) {
            const ex = 2 * x + 1 + DX(d);
            const ey = 2 * y + 1 + DY(d);
            const fx = ex + DX(d);
            const fy = ey + DY(d);
            const type = d | F(d);
            if (ws[ey * W + ex] === 1) {
              if (ws[fy * W + fx] !== 1 << type) {
                ws[fy * W + fx] = 1 << type;
                doneSomething = true;
              }
            } else if (ws[ey * W + ex] === 3) {
              if (!(ws[fy * W + fx] & (1 << type))) {
                ws[ey * W + ex] = 2;
                doneSomething = true;
              }
            }
          }
        } else if (clue === STRAIGHT) {
          const sq = (2 * y + 1) * W + 2 * x + 1;
          for (let d = 1; d <= 2; d += d) {
            const fx = 2 * x + 1 + 2 * DX(d);
            const fy = 2 * y + 1 + 2 * DY(d);
            const gx = 2 * x + 1 - 2 * DX(d);
            const gy = 2 * y + 1 - 2 * DY(d);
            const type = d | F(d);
            if (!(ws[sq] & (1 << type))) continue;
            if (
              !(ws[fy * W + fx] & ((1 << (F(d) | ACW(d))) | (1 << (F(d) | CW(d))))) &&
              !(ws[gy * W + gx] & ((1 << (d | ACW(d))) | (1 << (d | CW(d)))))
            ) {
              ws[sq] &= ~(1 << type);
              doneSomething = true;
            }
          }
          for (let d = 1; d <= 8; d += d) {
            const fx = 2 * x + 1 + 2 * DX(d);
            const fy = 2 * y + 1 + 2 * DY(d);
            const gx = 2 * x + 1 - 2 * DX(d);
            const gy = 2 * y + 1 - 2 * DY(d);
            const type = d | F(d);
            if (ws[sq] !== 1 << type) continue;
            if (
              !(ws[fy * W + fx] & ~(bLR | bUD)) &&
              ws[gy * W + gx] & ~(bLU | bLD | bRU | bRD)
            ) {
              ws[gy * W + gx] &= bLU | bLD | bRU | bRD;
              doneSomething = true;
            }
          }
        }
      }

    if (doneSomething) continue;

    // Detect shortcut loops.
    {
      dsf.reinit();
      dsfsize.fill(1);

      let nonblanks = 0;
      let loopclass = -1;
      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          if ((y ^ x) & 1) {
            const ax = (x - 1) >> 1;
            const ay = (y - 1) >> 1;
            const ac = ay * w + ax;
            const bx = x >> 1;
            const by = y >> 1;
            const bc = by * w + bx;
            if (ws[y * W + x] === 1) {
              let ae = dsf.canonify(ac);
              const be = dsf.canonify(bc);
              if (ae === be) {
                if (loopclass !== -1) {
                  ret = 0;
                  break loop;
                }
                loopclass = ae;
              } else {
                const size = dsfsize[ae] + dsfsize[be];
                dsf.merge(ac, bc);
                ae = dsf.canonify(ac);
                dsfsize[ae] = size;
              }
            }
          } else if (y & x & 1) {
            if (!(ws[y * W + x] & bBLANK)) nonblanks++;
          }
        }

      if (loopclass !== -1) {
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++)
            if (dsf.canonify(y * w + x) !== loopclass) {
              const sq = (2 * y + 1) * W + 2 * x + 1;
              if (ws[sq] & bBLANK) {
                ws[sq] = bBLANK;
              } else {
                ret = 0;
                break loop;
              }
            }
        ret = 1;
        break;
      }

      if (difficulty === DIFF_EASY) {
        if (doneSomething) continue;
        ret = 2;
        break;
      }

      for (let y = 1; y < H - 1; y++)
        for (let x = 1; x < W - 1; x++) {
          if ((y ^ x) & 1) {
            const ax = (x - 1) >> 1;
            const ay = (y - 1) >> 1;
            const ac = ay * w + ax;
            const bx = x >> 1;
            const by = y >> 1;
            const bc = by * w + bx;
            if (ws[y * W + x] === 3) {
              const ae = dsf.canonify(ac);
              const be = dsf.canonify(bc);
              if (ae === be) {
                if (dsfsize[ae] < nonblanks) {
                  ws[y * W + x] = 2;
                  doneSomething = true;
                }
              }
            }
          } else if (y & x & 1) {
            const ae = dsf.canonify(((y / 2) | 0) * w + ((x / 2) | 0));
            for (let b = 2; b < 0xd; b++)
              if (ws[y * W + x] & (1 << b)) {
                let e = -1;
                let connections = 0;
                for (let d = 1; d <= 8; d += d)
                  if (b & d) {
                    const xx = ((x / 2) | 0) + DX(d);
                    const yy = ((y / 2) | 0) + DY(d);
                    const ee = dsf.canonify(yy * w + xx);
                    if (e === -1) e = ee;
                    else if (e !== ee) e = -2;
                    if (ws[(y + DY(d)) * W + (x + DX(d))] === 1) connections++;
                  }
                if (e >= 0 && connections < 2) {
                  let loopsize = dsfsize[e];
                  if (e !== ae) loopsize++;
                  if (loopsize < nonblanks) {
                    ws[y * W + x] &= ~(1 << b);
                    doneSomething = true;
                  }
                }
              }
          }
        }
    }

    if (doneSomething) continue;

    ret = 2;
    break;
  }

  return { ret, ws };
}
