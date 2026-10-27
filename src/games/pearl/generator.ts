/**
 * Pearl generator — port of `pearl_loopgen` + `new_clues` + `new_game_desc`
 * (pearl.c). The RNG draw order is pearl.c's, since the frozen differential
 * compares `newDesc(p, randomNew(seed))` with its desc byte for byte.
 *
 * The generator: build a random loop over the shared `generateLoop` (biased
 * toward black-pearl corners), derive the maximal clue set, gate on the
 * solver finding a unique solution at the requested difficulty (and failing
 * one tier easier), then greedily minimize the clues.
 */
import { type Grid, gridNewSquare } from "../../engine/grid/index.ts";
import {
  FACE_BLACK,
  FACE_WHITE,
  generateLoop,
  type LoopgenBias,
} from "../../engine/loopgen.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { D, dirX, dirY, L, R, U } from "../../engine/square-edges.ts";
import { pearlSolve } from "./solver.ts";
import {
  bLD,
  bLR,
  bLU,
  bRD,
  bRU,
  bUD,
  CORNER,
  DIFF_EASY,
  encodeClues,
  NOCLUE,
  type PearlParams,
  STRAIGHT,
} from "./state.ts";

/** Build the black-clue bias for `generateLoop` (upstream `pearl_loopgen_bias`):
 * the count of black-clue corner sites on the WHITE and BLACK boundaries. The
 * first call scans the whole board; each later one refreshes only what the one
 * face named can have changed, which the loop generator's contract (only that
 * face changed since the last call) allows. A rescan per call was most of a
 * deal's time. The score is the rescan's at every call, so it picks the same
 * candidate and draws no RNG.
 *
 * Unlike upstream, a dot whose type changes re-checks every dot beside it, not
 * the two loop neighbors it records: a dot with four boundary edges records
 * only two, and its others would keep a stale site. */
function makeBias(g: Grid): LoopgenBias {
  const nEdges = g.numEdges;
  const nDots = g.numDots;
  // The grid read once into flat arrays: it is walked thousands of times a
  // loop. Per edge its dots and faces (-1 the exterior); per dot, in its edge
  // order, each edge, the dot across it and its direction (0,1,2,3 for
  // L,U,R,D); per face its edges.
  const edgeDot1 = new Int32Array(nEdges);
  const edgeDot2 = new Int32Array(nEdges);
  const edgeFace1 = new Int32Array(nEdges);
  const edgeFace2 = new Int32Array(nEdges);
  for (const e of g.edges) {
    edgeDot1[e.index] = e.dot1.index;
    edgeDot2[e.index] = e.dot2.index;
    edgeFace1[e.index] = e.face1 ? e.face1.index : -1;
    edgeFace2[e.index] = e.face2 ? e.face2.index : -1;
  }
  const dotStart = new Int32Array(nDots + 1);
  for (const d of g.dots) dotStart[d.index + 1] = d.order;
  for (let di = 0; di < nDots; di++) dotStart[di + 1] += dotStart[di];
  const dotEdge = new Int32Array(dotStart[nDots]);
  const dotNbr = new Int32Array(dotStart[nDots]);
  const dotDir = new Int32Array(dotStart[nDots]);
  for (const d of g.dots)
    for (let k = 0; k < d.order; k++) {
      const e = d.edges[k];
      const d2 = e.dot1 === d ? e.dot2 : e.dot1;
      const at = dotStart[d.index] + k;
      dotEdge[at] = e.index;
      dotNbr[at] = d2.index;
      dotDir[at] = (d.y === d2.y ? 1 : 0) + 2 * (d.x + d.y > d2.x + d2.y ? 1 : 0);
    }
  const faceEdges = g.faces.map((f) =>
    Int32Array.from(f.edges.filter((e) => e !== null).map((e) => e.index)),
  );

  const faces = new Int8Array(g.numFaces);
  // Per boundary (0 WHITE, 1 BLACK), each array indexed by b * n + i: is each
  // edge on it; each dot's type (bits 0-3 its boundary edges by direction,
  // bit 4 a corner) and its first two loop neighbors; whether each dot is a
  // black-clue site.
  const onLoop = new Uint8Array(2 * nEdges);
  const vtype = new Int32Array(2 * nDots);
  const nbr0 = new Int32Array(2 * nDots);
  const nbr1 = new Int32Array(2 * nDots);
  const site = new Uint8Array(2 * nDots);
  // Dots to refresh, as stacks with a mark per dot that this call stacked it.
  const dotsTodo = new Int32Array(nDots);
  const sitesTodo = new Int32Array(nDots);
  const dotMark = new Int32Array(nDots);
  const siteMark = new Int32Array(nDots);
  let nDotsTodo = 0;
  let nSitesTodo = 0;
  let stamp = 0;
  let score = 0;
  let scanned = false;

  const stackDot = (di: number): void => {
    if (dotMark[di] === stamp) return;
    dotMark[di] = stamp;
    dotsTodo[nDotsTodo++] = di;
  };
  const stackSite = (di: number): void => {
    if (siteMark[di] === stamp) return;
    siteMark[di] = stamp;
    sitesTodo[nSitesTodo++] = di;
  };

  const refreshEdge = (board: Int8Array, b: number, c: number, ei: number): void => {
    const f1 = edgeFace1[ei];
    const f2 = edgeFace2[ei];
    const fc1 = f1 < 0 ? FACE_BLACK : board[f1];
    const fc2 = f2 < 0 ? FACE_BLACK : board[f2];
    const on = (fc1 === c) !== (fc2 === c) ? 1 : 0;
    if (on === onLoop[b * nEdges + ei]) return;
    onLoop[b * nEdges + ei] = on;
    stackDot(edgeDot1[ei]);
    stackDot(edgeDot2[ei]);
  };

  const refreshDot = (b: number, di: number): void => {
    let type = 0;
    let n0 = 0;
    let n1 = 0;
    let n = 0;
    const end = dotStart[di + 1];
    for (let at = dotStart[di]; at < end; at++)
      if (onLoop[b * nEdges + dotEdge[at]]) {
        type |= 1 << dotDir[at];
        if (n === 0) n0 = dotNbr[at];
        else if (n === 1) n1 = dotNbr[at];
        n++;
      }
    // A corner: on the loop but not a straight run.
    if (type !== 0 && type !== 0x5 && type !== 0xa) type |= 0x10;
    const i = b * nDots + di;
    if (type === vtype[i]) return;
    vtype[i] = type;
    nbr0[i] = n0;
    nbr1[i] = n1;
    stackSite(di);
    for (let at = dotStart[di]; at < end; at++) stackSite(dotNbr[at]);
  };

  // A black-clue site: a corner whose two loop neighbors are non-corners.
  const refreshSite = (b: number, di: number): void => {
    const o = b * nDots;
    const i = o + di;
    const now =
      vtype[i] & 0x10 && !((vtype[o + nbr0[i]] | vtype[o + nbr1[i]]) & 0x10) ? 1 : 0;
    score += now - site[i];
    site[i] = now;
  };

  return (board: Int8Array, face: number): number => {
    for (let b = 0; b < 2; b++) {
      const c = b === 0 ? FACE_WHITE : FACE_BLACK;
      stamp++;
      if (!scanned) {
        for (let ei = 0; ei < nEdges; ei++) refreshEdge(board, b, c, ei);
      } else if (faces[face] === c || board[face] === c) {
        for (const ei of faceEdges[face]) refreshEdge(board, b, c, ei);
      }
      for (let k = 0; k < nDotsTodo; k++) refreshDot(b, dotsTodo[k]);
      nDotsTodo = 0;
      for (let k = 0; k < nSitesTodo; k++) refreshSite(b, sitesTodo[k]);
      nSitesTodo = 0;
    }
    if (scanned) faces[face] = board[face];
    else faces.set(board);
    scanned = true;
    return score;
  };
}

/** Generate a random loop into `lines` (length w*h) via the biased loop
 * generator, converting the face coloring to per-cell R/U/L/D line bits
 * (upstream `pearl_loopgen`). */
function pearlLoopgen(
  w: number,
  h: number,
  lines: Uint8Array,
  rng: RandomState,
  g: Grid,
): void {
  const board = new Int8Array(g.numFaces);
  const s = g.tileSize;
  lines.fill(0, 0, w * h);

  generateLoop(g, board, rng, makeBias(g));

  const faceColor = (f: (typeof g.faces)[number] | null): number =>
    f === null ? FACE_BLACK : board[f.index];

  for (let i = 0; i < g.numEdges; i++) {
    const e = g.edges[i];
    const c1 = faceColor(e.face1);
    const c2 = faceColor(e.face2);
    if (c1 !== c2) {
      // This grid edge is on the loop: lay a line along it.
      let x1 = (e.dot1.x / s) | 0;
      let y1 = (e.dot1.y / s) | 0;
      let x2 = (e.dot2.x / s) | 0;
      let y2 = (e.dot2.y / s) | 0;
      if (x1 === x2) {
        if (y1 > y2) [y1, y2] = [y2, y1];
        lines[y1 * w + x1] |= D;
        lines[y2 * w + x1] |= U;
      } else if (y1 === y2) {
        if (x1 > x2) [x1, x2] = [x2, x1];
        lines[y1 * w + x1] |= R;
        lines[y1 * w + x2] |= L;
      }
    }
  }
}

/**
 * Build a puzzle: a random loop, its maximal clue set, solver-gated to a
 * unique solution at `difficulty` (and — for Normal — not solvable one tier
 * easier), then greedily minimized. Writes `clues` and the solution
 * `gridOut` (both length w*h). Follows `new_clues`, including the upstream
 * `corners`-array duplication quirk. The tier is the one asked for: a Normal
 * board too small to be Normal is refused by `validateParams` before this.
 */
function newClues(
  params: PearlParams,
  rng: RandomState,
  clues: Uint8Array,
  gridOut: Uint8Array,
): void {
  const w = params.w;
  const h = params.h;
  const diff = params.difficulty;
  const g = gridNewSquare(w - 1, h - 1);

  const attempt = retryLimit("pearl: newClues");
  while (true) {
    attempt();
    pearlLoopgen(w, h, gridOut, rng, g);

    // Set up the maximal clue array.
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const type = gridOut[y * w + x];
        clues[y * w + x] = NOCLUE;
        if ((bLR | bUD) & (1 << type)) {
          // A straight: a viable white clue iff at least one connected
          // square is a corner.
          let d = 1;
          for (; d <= 8; d += d)
            if (type & d) {
              const xx = x + dirX(d);
              const yy = y + dirY(d);
              if ((bLU | bLD | bRU | bRD) & (1 << gridOut[yy * w + xx])) break;
            }
          if (d <= 8) clues[y * w + x] = STRAIGHT;
        } else if ((bLU | bLD | bRU | bRD) & (1 << type)) {
          // A corner: a viable black clue iff every connected square is a
          // straight.
          let d = 1;
          for (; d <= 8; d += d)
            if (type & d) {
              const xx = x + dirX(d);
              const yy = y + dirY(d);
              if (!((bLR | bUD) & (1 << gridOut[yy * w + xx]))) break;
            }
          if (d > 8) clues[y * w + x] = CORNER;
        }
      }

    // See if we can solve the puzzle just like this, and that it isn't too
    // easy; otherwise go round and try again.
    if (pearlSolve(w, h, clues, gridOut, diff, false) !== 1) continue;
    if (diff > DIFF_EASY && pearlSolve(w, h, clues, gridOut, diff - 1, false) === 1)
      continue;

    // Shuffle the clues and remove them one at a time, keeping each removal
    // that leaves the puzzle soluble. Upstream meant to remove whichever clue
    // type is more numerous, but fills its `corners` array from STRAIGHT
    // positions too: corner clues are never removed and every straight is
    // tried twice. Reproduced, the second shuffle's RNG draws included,
    // because the frozen differential checks the desc byte for byte.
    const straights: number[] = [];
    for (let i = 0; i < w * h; i++) if (clues[i] === STRAIGHT) straights.push(i);
    shuffle(straights, rng);
    shuffle(straights.slice(), rng); // upstream's `corners` shuffle; only its draws matter

    for (let pass = 0; pass < 2; pass++)
      for (let k = straights.length - 1; k >= 0; k--) {
        const i = straights[k];
        const clue = clues[i];
        clues[i] = NOCLUE; // try removing this clue
        if (pearlSolve(w, h, clues, gridOut, diff, false) !== 1) clues[i] = clue; // oops, put it back
      }

    break; // got it
  }
}

export function newDesc(
  params: PearlParams,
  rng: RandomState,
): { desc: string; aux: string } {
  const w = params.w;
  const h = params.h;
  const grid = new Uint8Array(w * h);
  const clues = new Uint8Array(w * h);

  newClues(params, rng, clues, grid);

  // aux: the full solution as a hex string (upstream `new_game_desc`).
  let aux = "";
  for (const v of grid) aux += v.toString(16).toUpperCase();

  return { desc: encodeClues(clues, w * h), aux };
}
