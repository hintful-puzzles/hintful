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
 * Used by the generator (uniqueness gating), `solve`, the `H` autosolve hint,
 * and `findMistakes`.
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import { Dsf } from "../../engine/dsf.ts";
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
  DIFF_COUNT,
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  F,
  STRAIGHT,
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

/** The workspace the rungs share, and the loop pieces the last
 * {@link PearlBoard.buildLoops} found. */
class PearlBoard {
  readonly W: number;
  readonly H: number;
  readonly ws: Int32Array;
  /** A closed loop was found and everything off it blanked: solved. */
  closed = false;
  readonly dsf: Dsf;
  readonly dsfsize: Int32Array;
  nonblanks = 0;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly clues: Uint8Array,
  ) {
    this.W = 2 * w + 1;
    this.H = 2 * h + 1;
    this.ws = initialWorkspace(w, h, clues);
    this.dsf = new Dsf(w * h);
    this.dsfsize = new Int32Array(w * h);
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

  /** Nail down any unknown edge its square's surviving states agree on. */
  edgesFromShapes(): number {
    const { w, h, W, ws } = this;
    let fired = 0;
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
        if (edgeand & ~edgeor) return -1;
        for (let d = 1; d <= 8; d += d) {
          const ex = 2 * x + 1 + DX(d);
          const ey = 2 * y + 1 + DY(d);
          if (!(edgeor & d) && ws[ey * W + ex] === 3) {
            ws[ey * W + ex] = 2;
            fired++;
          } else if (edgeand & d && ws[ey * W + ex] === 3) {
            ws[ey * W + ex] = 1;
            fired++;
          }
        }
      }
    return fired;
  }

  /** The longer-range deductions from the black and white pearls. */
  pearlClues(): number {
    const { w, h, W, ws, clues } = this;
    let fired = 0;
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
              // Corner connected on an edge ⇒ the square beyond it is a
              // straight in that direction.
              if (ws[fy * W + fx] !== 1 << type) {
                ws[fy * W + fx] = 1 << type;
                fired++;
              }
            } else if (ws[ey * W + ex] === 3) {
              // Corner separated by an unknown edge from a square that
              // cannot be the required straight ⇒ that edge is disconnected.
              if (!(ws[fy * W + fx] & (1 << type))) {
                ws[ey * W + ex] = 2;
                fired++;
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
              ws[sq] &= ~(1 << type);
              fired++;
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
              ws[gy * W + gx] &= bLU | bLD | bRU | bRD;
              fired++;
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
    const { w, W, H, ws, dsf, dsfsize } = this;
    // The closed-loop rung runs before this one at every cap and found no
    // loop, so this rebuilds the open pieces it saw.
    this.buildLoops();
    const { nonblanks } = this;
    let fired = 0;
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        if ((y ^ x) & 1) {
          const ac = ((y - 1) >> 1) * w + ((x - 1) >> 1);
          const bc = (y >> 1) * w + (x >> 1);
          if (ws[y * W + x] === 3) {
            const ae = dsf.canonify(ac);
            const be = dsf.canonify(bc);
            if (ae === be && dsfsize[ae] < nonblanks) {
              ws[y * W + x] = 2;
              fired++;
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
                if (e !== ae) loopsize++; // add the square itself
                if (loopsize < nonblanks) {
                  ws[y * W + x] &= ~(1 << b);
                  fired++;
                }
              }
            }
        }
      }
    return fired;
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
