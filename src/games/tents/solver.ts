/**
 * Tents solver — port of `tents_solve` in `tents.c`, as a
 * `runDeductionFixpoint` ladder. Returns the upstream verdict: 0 impossible
 * (no consistent solution), 1 unique (fully determined), 2 ambiguous /
 * non-converged. The generator gates on this exact verdict, so the deductive
 * power must match C on every board
 * (docs/games/solver-and-generator.md § "Solver-gated generation").
 *
 * `diff` caps the ladder by tier: `DIFF_EASY - 1` runs only the tent↔tree
 * link, which is what the generator's "not solvable one level down" check asks
 * of an Easy board; `DIFF_EASY` adds the grass marks, a tree's single
 * candidate and the per-line count; `DIFF_TRICKY` adds the tree diagonal-pair
 * elimination and the line count's reach into the neighboring lines.
 *
 * Upstream folds each Tricky deduction into an Easy sweep behind a difficulty
 * test. Here each is a rung of its own, so a census can see whether the
 * generator ever reaches it. That moves when the Tricky deductions run and not
 * what the ladder concludes: `tents-ladder.test.ts` proves it against
 * upstream's loop, kept as {@link tentsSolveLegacy}.
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import {
  BLANK,
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  FLIP,
  MAGIC,
  MAXDIR,
  N,
  NONTENT,
  TENT,
  TREE,
} from "./state.ts";

export interface SolveResult {
  ret: number;
  soln: Int8Array;
  /** Per square, the direction of the tree or tent it is tied to, or `N`. */
  links: Int8Array;
}

/** The working board the rungs share: the squares, the tent↔tree links, and
 * scratch for the line enumeration. */
class TentsBoard {
  readonly links: Int8Array;
  readonly soln: Int8Array;
  // Scratch for the line enumeration.
  readonly locs: Int32Array;
  readonly place: Int8Array;
  readonly mrows: Int8Array;
  readonly trows: Int8Array;

  constructor(
    readonly w: number,
    readonly h: number,
    grid: Int8Array,
    readonly numbers: Int32Array,
  ) {
    this.links = new Int8Array(w * h).fill(N);
    this.soln = Int8Array.from(grid);
    const maxlen = Math.max(w, h);
    this.locs = new Int32Array(maxlen);
    this.place = new Int8Array(maxlen);
    this.mrows = new Int8Array(3 * maxlen);
    this.trows = new Int8Array(3 * maxlen);
  }

  private inGrid(x: number, y: number): boolean {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }

  private isUnmatchedTree(x: number, y: number): boolean {
    const i = y * this.w + x;
    return this.inGrid(x, y) && this.soln[i] === TREE && !this.links[i];
  }

  /** The directions from tree `(x, y)` to a square that could still be its
   * tent: blank, or a tent not yet tied to a tree. */
  private treeCandidates(x: number, y: number): number[] {
    const found: number[] = [];
    for (let d = 1; d < MAXDIR; d++) {
      const x2 = x + DX(d);
      const y2 = y + DY(d);
      if (!this.inGrid(x2, y2)) continue;
      const i = y2 * this.w + x2;
      if (this.soln[i] === BLANK || (this.soln[i] === TENT && !this.links[i])) {
        found.push(d);
      }
    }
    return found;
  }

  private link(x: number, y: number, d: number): void {
    this.links[y * this.w + x] = d;
    this.links[(y + DY(d)) * this.w + x + DX(d)] = FLIP(d);
  }

  /** A tent with only one unattached adjacent tree is tied to that tree. */
  linkTents(): number {
    const { w, h, soln, links } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TENT || links[y * w + x]) continue;
        const trees: number[] = [];
        for (let d = 1; d < MAXDIR && trees.length < 2; d++) {
          if (this.isUnmatchedTree(x + DX(d), y + DY(d))) trees.push(d);
        }
        if (trees.length === 0) return -1; // tent cannot link to anything
        if (trees.length === 1) {
          this.link(x, y, trees[0]);
          fired++;
        }
      }
    }
    return fired;
  }

  /** A blank square orthogonally adjacent to no unmatched tree is grass. */
  grassAwayFromTrees(): number {
    const { w, h, soln } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK) continue;
        let canBeTent = false;
        for (let d = 1; d < MAXDIR; d++) {
          if (this.isUnmatchedTree(x + DX(d), y + DY(d))) canBeTent = true;
        }
        if (!canBeTent) {
          soln[y * w + x] = NONTENT;
          fired++;
        }
      }
    }
    return fired;
  }

  /** A blank square touching a tent, even diagonally, is grass. */
  grassNextToTents(): number {
    const { w, h, soln } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK) continue;
        let touches = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dy && !dx) continue;
            const x2 = x + dx;
            const y2 = y + dy;
            if (this.inGrid(x2, y2) && soln[y2 * w + x2] === TENT) touches = true;
          }
        }
        if (touches) {
          soln[y * w + x] = NONTENT;
          fired++;
        }
      }
    }
    return fired;
  }

  /** An unmatched tree with exactly one square that could be its tent has its
   * tent there. */
  treeSingles(): number {
    const { w, h, soln, links } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TREE || links[y * w + x]) continue;
        const cands = this.treeCandidates(x, y);
        if (cands.length === 0) return -1; // tree cannot link to anything
        if (cands.length === 1) {
          const d = cands[0];
          soln[(y + DY(d)) * w + x + DX(d)] = TENT;
          this.link(x, y, d);
          fired++;
        }
      }
    }
    return fired;
  }

  /** An unmatched tree whose two candidates sit round a corner from each
   * other: whichever holds its tent, the square diagonal to the tree between
   * them touches that tent, so it is grass. */
  treeDiagonalPairs(): number {
    const { w, h, soln, links } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TREE || links[y * w + x]) continue;
        const cands = this.treeCandidates(x, y);
        if (cands.length !== 2) continue;
        const [d1, d2] = cands;
        if ((DX(d1) === 0) === (DX(d2) === 0)) continue; // opposite sides
        const i = (y + DY(d1) + DY(d2)) * w + x + DX(d1) + DX(d2);
        if (soln[i] === BLANK) {
          soln[i] = NONTENT;
          fired++;
        }
      }
    }
    return fired;
  }

  /**
   * The numbers round the edge. For each row and column, enumerate every
   * placement of its unplaced tents, drop the ones putting two tents side by
   * side, and fix any blank square every remaining placement agrees on.
   *
   * With `neighbors` the same placements are read for what they do to the two
   * lines alongside, a square there being grass when every placement puts a
   * tent next to it, and only those squares are written: what the line itself
   * agrees on is the plain rung's to find.
   */
  lineCounts(neighbors: boolean): number {
    const { w, h, soln, numbers, locs, mrows } = this;
    let fired = 0;
    for (let i = 0; i < w + h; i++) {
      let start: number;
      let step: number;
      let len: number;
      let start1: number;
      let start2: number;
      if (i < w) {
        start = i;
        step = w;
        len = h;
        start1 = i > 0 ? start - 1 : -1;
        start2 = i + 1 < w ? start + 1 : -1;
      } else {
        start = (i - w) * w;
        step = 1;
        len = w;
        start1 = i > w ? start - w : -1;
        start2 = i + 1 < w + h ? start + w : -1;
      }

      let k = numbers[i];
      let n = 0;
      for (let j = 0; j < len; j++) {
        if (soln[start + j * step] === TENT) k--;
        else if (soln[start + j * step] === BLANK) locs[n++] = j;
      }
      if (n === 0) continue;

      this.enumerateLine(n, k, len);

      // No placement valid at all ⇒ inconsistent puzzle.
      if (mrows[locs[0]] === MAGIC) return -1;

      const targets = neighbors ? [-1, start1, start2] : [start, -1, -1];
      for (let j = 0; j < len; j++) {
        for (let whichrow = 0; whichrow < 3; whichrow++) {
          const m = mrows[whichrow * len + j];
          const tstart = targets[whichrow];
          if (
            tstart >= 0 &&
            m !== MAGIC &&
            m !== BLANK &&
            soln[tstart + j * step] === BLANK
          ) {
            soln[tstart + j * step] = m;
            fired++;
          }
        }
      }
    }
    return fired;
  }

  /**
   * Fold every valid placement of `k` tents among the line's `n` free squares
   * into `mrows`: `[0, len)` the line itself, `[len, 3·len)` the two lines
   * alongside. A square every placement agrees on keeps that value, one they
   * disagree on becomes `BLANK`, and one no valid placement reached stays
   * `MAGIC`.
   */
  private enumerateLine(n: number, k: number, len: number): void {
    const { locs, place, mrows, trows } = this;

    // First possibility: k tents in the leftmost of the n free squares.
    for (let j = 0; j < n; j++) place[j] = j < k ? TENT : NONTENT;
    mrows.fill(MAGIC, 0, 3 * len);

    while (true) {
      // Valid unless two chosen tents are physically adjacent.
      let valid = true;
      for (let j = 0; j + 1 < n; j++) {
        if (place[j] === TENT && place[j + 1] === TENT && locs[j + 1] === locs[j] + 1) {
          valid = false;
          break;
        }
      }

      if (valid) {
        trows.fill(MAGIC, 0, len);
        trows.fill(BLANK, len, 3 * len);
        for (let j = 0; j < n; j++) {
          trows[locs[j]] = place[j];
          if (place[j] === TENT) {
            for (let jj = locs[j] - 1; jj <= locs[j] + 1; jj++) {
              if (jj >= 0 && jj < len) {
                trows[len + jj] = NONTENT;
                trows[2 * len + jj] = NONTENT;
              }
            }
          }
        }
        for (let j = 0; j < 3 * len; j++) {
          if (trows[j] === MAGIC) continue;
          if (mrows[j] === MAGIC || mrows[j] === trows[j]) mrows[j] = trows[j];
          else mrows[j] = BLANK;
        }
      }

      // Next combination of k choices from n.
      let p = 0;
      let j = n - 1;
      for (; j > 0; j--) {
        if (place[j] === TENT) p++;
        if (place[j] === NONTENT && place[j - 1] === TENT) {
          place[j - 1] = NONTENT;
          place[j] = TENT;
          while (p-- > 0) place[++j] = TENT;
          while (++j < n) place[j] = NONTENT;
          break;
        }
      }
      if (j <= 0) return; // finished enumerating
    }
  }

  /** Every square decided and every tent and tree tied. */
  complete(): boolean {
    const { soln, links } = this;
    for (let i = 0; i < soln.length; i++) {
      if (soln[i] === BLANK) return false;
      if (soln[i] !== NONTENT && links[i] === N) return false;
    }
    return true;
  }
}

function tentsLadder(b: TentsBoard): DeductionTechnique[] {
  return [
    { id: "tent-link", tier: DIFF_EASY - 1, run: () => b.linkTents() },
    { id: "grass-away-from-trees", tier: DIFF_EASY, run: () => b.grassAwayFromTrees() },
    { id: "grass-next-to-tents", tier: DIFF_EASY, run: () => b.grassNextToTents() },
    { id: "tree-single", tier: DIFF_EASY, run: () => b.treeSingles() },
    { id: "tree-diagonal-pair", tier: DIFF_TRICKY, run: () => b.treeDiagonalPairs() },
    { id: "line-count", tier: DIFF_EASY, run: () => b.lineCounts(false) },
    { id: "line-neighbors", tier: DIFF_TRICKY, run: () => b.lineCounts(true) },
  ];
}

/**
 * @param diff the highest tier to run (see the module doc).
 * @param firings the census sink, forwarded to `runDeductionFixpoint`; only
 *   `tents-ladder.test.ts` passes one.
 */
export function tentsSolve(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
  diff: number,
  firings?: FiringTally,
): SolveResult {
  const b = new TentsBoard(w, h, grid, numbers);
  const { impossible } = runDeductionFixpoint({
    techniques: tentsLadder(b),
    maxTier: diff,
    firings,
  });
  const ret = impossible ? 0 : b.complete() ? 1 : 2;
  return { ret, soln: b.soln, links: b.links };
}

/** Upstream's hand-written loop, kept as the oracle `tents-ladder.test.ts`
 * proves {@link tentsSolve} against. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: deduction ladder over tent/tree pairing constraints with row/column counts.
export function tentsSolveLegacy(
  w: number,
  h: number,
  grid: Int8Array,
  numbers: Int32Array,
  diff: number,
): SolveResult {
  const links = new Int8Array(w * h).fill(N);
  const soln = Int8Array.from(grid);
  const maxlen = Math.max(w, h);
  const locs = new Int32Array(maxlen);
  const place = new Int8Array(maxlen);
  const mrows = new Int8Array(3 * maxlen);
  const trows = new Int8Array(3 * maxlen);

  while (true) {
    let doneSomething = false;

    // Any tent with only one unattached adjacent tree is tied to that tree.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TENT || links[y * w + x]) continue;
        let linkd = 0;
        let d: number;
        for (d = 1; d < MAXDIR; d++) {
          const x2 = x + DX(d);
          const y2 = y + DY(d);
          if (
            x2 >= 0 &&
            x2 < w &&
            y2 >= 0 &&
            y2 < h &&
            soln[y2 * w + x2] === TREE &&
            !links[y2 * w + x2]
          ) {
            if (linkd) break; // found more than one
            linkd = d;
          }
        }
        if (d === MAXDIR && linkd === 0) {
          return { ret: 0, soln, links }; // tent cannot link to anything
        }
        if (d === MAXDIR) {
          const x2 = x + DX(linkd);
          const y2 = y + DY(linkd);
          links[y * w + x] = linkd;
          links[y2 * w + x2] = FLIP(linkd);
          doneSomething = true;
        }
      }
    }
    if (doneSomething) continue;
    if (diff < 0) break; // link deduction only

    // Mark a blank NONTENT if it is not orthogonally adjacent to any
    // unmatched tree.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK) continue;
        let canBeTent = false;
        for (let d = 1; d < MAXDIR; d++) {
          const x2 = x + DX(d);
          const y2 = y + DY(d);
          if (
            x2 >= 0 &&
            x2 < w &&
            y2 >= 0 &&
            y2 < h &&
            soln[y2 * w + x2] === TREE &&
            !links[y2 * w + x2]
          ) {
            canBeTent = true;
          }
        }
        if (!canBeTent) {
          soln[y * w + x] = NONTENT;
          doneSomething = true;
        }
      }
    }
    if (doneSomething) continue;

    // Mark a blank NONTENT if it is (perhaps diagonally) adjacent to a tent.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK) continue;
        let imposs = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dy && !dx) continue;
            const x2 = x + dx;
            const y2 = y + dy;
            if (x2 >= 0 && x2 < w && y2 >= 0 && y2 < h && soln[y2 * w + x2] === TENT) {
              imposs = true;
            }
          }
        }
        if (imposs) {
          soln[y * w + x] = NONTENT;
          doneSomething = true;
        }
      }
    }
    if (doneSomething) continue;

    // A tree with exactly one {unattached tent, BLANK} neighbor must have its
    // tent there.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TREE || links[y * w + x]) continue;
        let linkd = 0;
        let linkd2 = 0;
        let nd = 0;
        for (let d = 1; d < MAXDIR; d++) {
          const x2 = x + DX(d);
          const y2 = y + DY(d);
          if (!(x2 >= 0 && x2 < w && y2 >= 0 && y2 < h)) continue;
          if (
            soln[y2 * w + x2] === BLANK ||
            (soln[y2 * w + x2] === TENT && !links[y2 * w + x2])
          ) {
            if (linkd) linkd2 = d;
            else linkd = d;
            nd++;
          }
        }
        if (nd === 0) {
          return { ret: 0, soln, links }; // tree cannot link to anything
        }
        if (nd === 1) {
          const x2 = x + DX(linkd);
          const y2 = y + DY(linkd);
          soln[y2 * w + x2] = TENT;
          links[y * w + x] = linkd;
          links[y2 * w + x2] = FLIP(linkd);
          doneSomething = true;
        } else if (
          nd === 2 &&
          (DX(linkd) === 0) !== (DX(linkd2) === 0) &&
          diff >= DIFF_TRICKY
        ) {
          // Two candidate squares diagonally separated (not opposite sides):
          // the square adjacent to both (other than the tree) can't be a tent.
          const x2 = x + DX(linkd) + DX(linkd2);
          const y2 = y + DY(linkd) + DY(linkd2);
          if (soln[y2 * w + x2] === BLANK) {
            soln[y2 * w + x2] = NONTENT;
            doneSomething = true;
          }
        }
      }
    }
    if (doneSomething) continue;

    // The numbers round the edge: for each row/column, enumerate all placements
    // of the unplaced tents, drop invalid (adjacent-tent) ones, and fix any
    // square given the same state by every remaining combination.
    for (let i = 0; i < w + h; i++) {
      let start: number;
      let step: number;
      let len: number;
      let start1: number;
      let start2: number;
      if (i < w) {
        start = i;
        step = w;
        len = h;
        start1 = i > 0 ? start - 1 : -1;
        start2 = i + 1 < w ? start + 1 : -1;
      } else {
        start = (i - w) * w;
        step = 1;
        len = w;
        start1 = i > w ? start - w : -1;
        start2 = i + 1 < w + h ? start + w : -1;
      }
      if (diff < DIFF_TRICKY) {
        start1 = -1;
        start2 = -1;
      }

      let k = numbers[i];
      let n = 0;
      for (let j = 0; j < len; j++) {
        if (soln[start + j * step] === TENT) k--;
        else if (soln[start + j * step] === BLANK) locs[n++] = j;
      }
      if (n === 0) continue;

      // First possibility: k tents in the leftmost of the n free squares.
      for (let j = 0; j < n; j++) place[j] = j < k ? TENT : NONTENT;

      // mrow[0..len) is the row, [len..2len) row1 (start1), [2len..3len) row2.
      mrows.fill(MAGIC, 0, 3 * len);

      while (true) {
        // Valid unless two chosen tents are physically adjacent.
        let valid = true;
        for (let j = 0; j + 1 < n; j++) {
          if (
            place[j] === TENT &&
            place[j + 1] === TENT &&
            locs[j + 1] === locs[j] + 1
          ) {
            valid = false;
            break;
          }
        }

        if (valid) {
          // Build trow (3*len): row = MAGIC then filled, row1/row2 = BLANK then
          // NONTENT around each tent.
          trows.fill(MAGIC, 0, len);
          trows.fill(BLANK, len, 3 * len);
          for (let j = 0; j < n; j++) {
            trows[locs[j]] = place[j];
            if (place[j] === TENT) {
              for (let jj = locs[j] - 1; jj <= locs[j] + 1; jj++) {
                if (jj >= 0 && jj < len) {
                  trows[len + jj] = NONTENT;
                  trows[2 * len + jj] = NONTENT;
                }
              }
            }
          }
          for (let j = 0; j < 3 * len; j++) {
            if (trows[j] === MAGIC) continue;
            if (mrows[j] === MAGIC || mrows[j] === trows[j]) mrows[j] = trows[j];
            else mrows[j] = BLANK;
          }
        }

        // Next combination of k choices from n.
        let p = 0;
        let j = n - 1;
        for (; j > 0; j--) {
          if (place[j] === TENT) p++;
          if (place[j] === NONTENT && place[j - 1] === TENT) {
            place[j - 1] = NONTENT;
            place[j] = TENT;
            while (p-- > 0) place[++j] = TENT;
            while (++j < n) place[j] = NONTENT;
            break;
          }
        }
        if (j <= 0) break; // finished enumerating
      }

      // No placement valid at all ⇒ inconsistent puzzle.
      if (mrows[locs[0]] === MAGIC) return { ret: 0, soln, links };

      // Apply anything newly deduced.
      for (let j = 0; j < len; j++) {
        for (let whichrow = 0; whichrow < 3; whichrow++) {
          const base = whichrow * len;
          const tstart = whichrow === 0 ? start : whichrow === 1 ? start1 : start2;
          if (
            tstart >= 0 &&
            mrows[base + j] !== MAGIC &&
            mrows[base + j] !== BLANK &&
            soln[tstart + j * step] === BLANK
          ) {
            soln[tstart + j * step] = mrows[base + j];
            doneSomething = true;
          }
        }
      }
    }

    if (!doneSomething) break;
  }

  // Return 1 if soln and links are completely filled, 2 otherwise.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (soln[y * w + x] === BLANK) return { ret: 2, soln, links };
      if (soln[y * w + x] !== NONTENT && links[y * w + x] === 0)
        return { ret: 2, soln, links };
    }
  }
  return { ret: 1, soln, links };
}
