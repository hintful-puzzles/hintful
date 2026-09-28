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
 * test, and ties a tree to a tent already beside it inside the sweep that
 * places tents. Here each is a rung of its own, so a census can see whether the
 * generator ever reaches it (`tents-ladder.test.ts`) and the hint can narrate
 * it. That moves when they run and not what the ladder concludes, because every
 * rung is sound and only decides squares or ties links.
 *
 * The hint runs the same rungs through {@link tentsRecordingPass}, where a
 * link counts only if the player has drawn it or can read it off the board
 * ({@link TentsBoard.readLinks}).
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
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

/** Why a hint firing holds. Squares are indices; the rest of what a sentence
 * cites is read off the board the firing found. */
export type TentsReason =
  /** Blank squares beside no tree at all. */
  | { kind: "noTree"; squares: number[] }
  /** Blank squares every tree beside which already has its tent. */
  | { kind: "treesDone"; squares: number[] }
  /** The blank squares round one tent. */
  | { kind: "nextToTent"; tent: number; squares: number[] }
  /** A tree with one square left that could hold its tent. */
  | { kind: "treeSingle"; tree: number; square: number }
  /** A tree whose two squares left sit round a corner, and the square between
   * them, diagonal to the tree. */
  | { kind: "treeDiagonal"; tree: number; pair: [number, number]; square: number }
  /** A row or column's count, over its own squares (`line` is the clue index:
   * columns first). */
  | { kind: "lineCount"; line: number }
  /** A row or column's count, over the lines either side of it. */
  | { kind: "lineNeighbors"; line: number }
  /** A tent every other tree beside which already has its tent. */
  | { kind: "tentLink"; tent: number; tree: number }
  /** A tree whose one remaining square holds a tent. */
  | { kind: "treeLink"; tree: number; tent: number };

/** The hint's recorder: the reason for the firing in progress. */
interface TentsRecorder {
  reason: TentsReason | null;
}

/** The working board the rungs share: the squares, the tent↔tree links, and
 * scratch for the line enumeration. */
export class TentsBoard {
  readonly links: Int8Array;
  readonly soln: Int8Array;
  // Scratch for the line enumeration.
  readonly locs: Int32Array;
  readonly place: Int8Array;
  readonly mrows: Int8Array;
  readonly trows: Int8Array;
  /** Set on the hint path only: each rung then stops at its first premise. */
  rec: TentsRecorder | null = null;
  /** Set on the hint path only: the links the player has drawn, which
   * {@link readLinks} rebuilds `links` from. */
  drawn: Int8Array | null = null;

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

  /** A copy with no recorder: for trying a link before drawing it. */
  clone(): TentsBoard {
    const b = new TentsBoard(this.w, this.h, this.soln, this.numbers);
    b.links.set(this.links);
    if (this.drawn) b.drawn = Int8Array.from(this.drawn);
    return b;
  }

  private inGrid(x: number, y: number): boolean {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }

  private isUnmatchedTree(x: number, y: number): boolean {
    const i = y * this.w + x;
    return this.inGrid(x, y) && this.soln[i] === TREE && !this.links[i];
  }

  /** The orthogonal neighbors of square `i` that are on the board. */
  private neighbors(i: number): { j: number; d: number }[] {
    const x = i % this.w;
    const y = Math.floor(i / this.w);
    const out: { j: number; d: number }[] = [];
    for (let d = 1; d < MAXDIR; d++) {
      if (this.inGrid(x + DX(d), y + DY(d)))
        out.push({ j: i + DY(d) * this.w + DX(d), d });
    }
    return out;
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

  /**
   * Rebuild `links` from what the player can see: the links they have drawn,
   * and the ones the board shows at a glance given those. A tent is a tree's
   * at a glance when that tree is the only one beside it not drawn to another
   * tent, or when it is the only square beside the tree that is blank or an
   * undrawn tent. Only one reading deep: a pairing that needs another pairing
   * read first is not on the board, and the hint draws it
   * ({@link tentsRecordingPass}). -1 when the board contradicts itself.
   */
  readLinks(): number {
    const { soln, links } = this;
    const drawn = this.drawn;
    if (!drawn) throw new Error("tents: readLinks without drawn links");
    links.set(drawn);
    const pairs: [number, number][] = [];
    for (let i = 0; i < soln.length; i++) {
      if (drawn[i]) continue;
      if (soln[i] === TENT) {
        const trees = this.neighbors(i).filter(
          ({ j }) => soln[j] === TREE && !drawn[j],
        );
        if (trees.length === 0) return -1;
        if (trees.length === 1) pairs.push([i, trees[0].j]);
      } else if (soln[i] === TREE) {
        const open = this.neighbors(i).filter(
          ({ j }) => soln[j] === BLANK || (soln[j] === TENT && !drawn[j]),
        );
        if (open.length === 0) return -1;
        if (open.length === 1 && soln[open[0].j] === TENT) pairs.push([open[0].j, i]);
      }
    }
    for (const [tent, tree] of pairs) {
      const d = this.neighbors(tent).find(({ j }) => j === tree)?.d ?? N;
      if (links[tent] === d && links[tree] === FLIP(d)) continue;
      if (links[tent] || links[tree]) return -1; // one tree, two tents, or the reverse
      links[tent] = d;
      links[tree] = FLIP(d);
    }
    return 0;
  }

  /** Draw the link between `tent` and `tree`, as the hint asks the player to. */
  drawLink(tent: number, tree: number): void {
    const d = this.neighbors(tent).find(({ j }) => j === tree)?.d ?? N;
    if (d === N || !this.drawn) throw new Error("tents: drawLink off the hint path");
    this.drawn[tent] = this.links[tent] = d;
    this.drawn[tree] = this.links[tree] = FLIP(d);
  }

  /**
   * Every link the two link rungs would tie now, with its reason, without
   * tying any: a tent with one unmatched tree beside it, and a tree whose one
   * remaining square holds a tent.
   */
  pendingLinks(): Extract<TentsReason, { kind: "tentLink" | "treeLink" }>[] {
    const { w, soln, links } = this;
    const out: Extract<TentsReason, { kind: "tentLink" | "treeLink" }>[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < soln.length; i++) {
      if (links[i]) continue;
      const x = i % w;
      const y = Math.floor(i / w);
      if (soln[i] === TENT) {
        const trees = this.neighbors(i).filter(({ j }) =>
          this.isUnmatchedTree(j % w, Math.floor(j / w)),
        );
        if (trees.length === 1 && !seen.has(i)) {
          seen.add(i);
          out.push({ kind: "tentLink", tent: i, tree: trees[0].j });
        }
      } else if (soln[i] === TREE) {
        const cands = this.treeCandidates(x, y);
        if (cands.length !== 1) continue;
        const tent = i + DY(cands[0]) * w + DX(cands[0]);
        if (soln[tent] === TENT && !seen.has(tent)) {
          seen.add(tent);
          out.push({ kind: "treeLink", tree: i, tent });
        }
      }
    }
    return out;
  }

  /** A tent with only one unattached adjacent tree is tied to that tree. */
  linkTents(): number {
    const { w, h, soln, links, rec } = this;
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
          if (rec) {
            const tree = (y + DY(trees[0])) * w + x + DX(trees[0]);
            rec.reason = { kind: "tentLink", tent: y * w + x, tree };
            return fired;
          }
        }
      }
    }
    return fired;
  }

  /** An unmatched tree whose one remaining square already holds a tent is tied
   * to that tent. */
  treeLinks(): number {
    const { w, h, soln, links, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TREE || links[y * w + x]) continue;
        const cands = this.treeCandidates(x, y);
        if (cands.length === 0) return -1; // tree cannot link to anything
        const d = cands[0];
        const tent = (y + DY(d)) * w + x + DX(d);
        if (cands.length === 1 && soln[tent] === TENT) {
          this.link(x, y, d);
          fired++;
          if (rec) {
            rec.reason = { kind: "treeLink", tree: y * w + x, tent };
            return fired;
          }
        }
      }
    }
    return fired;
  }

  /** A blank square orthogonally adjacent to no unmatched tree is grass. */
  grassAwayFromTrees(): number {
    const { w, h, soln, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK || this.nearUnmatchedTree(x, y)) continue;
        if (rec) return this.recordGrassAway(y * w + x, rec);
        soln[y * w + x] = NONTENT;
        fired++;
      }
    }
    return fired;
  }

  private nearUnmatchedTree(x: number, y: number): boolean {
    for (let d = 1; d < MAXDIR; d++) {
      if (this.isUnmatchedTree(x + DX(d), y + DY(d))) return true;
    }
    return false;
  }

  /**
   * One grass-away premise from its first square `first`. A square beside no
   * tree at all is one kind, and the step takes every such square; otherwise
   * the step takes the squares beside the same tree as `first`, every tree
   * beside each of which already has its tent.
   */
  private recordGrassAway(first: number, rec: TentsRecorder): number {
    const { w, soln } = this;
    const nearTree = (i: number): boolean =>
      this.neighbors(i).some(({ j }) => soln[j] === TREE);
    const away = (i: number): boolean =>
      soln[i] === BLANK && !this.nearUnmatchedTree(i % w, Math.floor(i / w));
    let squares: number[];
    if (!nearTree(first)) {
      squares = [];
      for (let i = 0; i < soln.length; i++)
        if (away(i) && !nearTree(i)) squares.push(i);
      rec.reason = { kind: "noTree", squares };
    } else {
      const tree = this.neighbors(first).find(({ j }) => soln[j] === TREE)?.j ?? -1;
      squares = this.neighbors(tree)
        .map(({ j }) => j)
        .filter(away)
        .sort((a, b) => a - b);
      rec.reason = { kind: "treesDone", squares };
    }
    for (const i of squares) soln[i] = NONTENT;
    return squares.length;
  }

  /** A blank square touching a tent, even diagonally, is grass. */
  grassNextToTents(): number {
    const { w, h, soln, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== BLANK) continue;
        const tent = this.touchingTent(x, y);
        if (tent < 0) continue;
        if (rec) {
          // The step takes every blank round that tent.
          const squares: number[] = [];
          const tx = tent % w;
          const ty = Math.floor(tent / w);
          for (let yy = ty - 1; yy <= ty + 1; yy++)
            for (let xx = tx - 1; xx <= tx + 1; xx++)
              if (this.inGrid(xx, yy) && soln[yy * w + xx] === BLANK)
                squares.push(yy * w + xx);
          for (const i of squares) soln[i] = NONTENT;
          rec.reason = { kind: "nextToTent", tent, squares };
          return squares.length;
        }
        soln[y * w + x] = NONTENT;
        fired++;
      }
    }
    return fired;
  }

  /** The first tent touching `(x, y)`, even diagonally, or -1. */
  private touchingTent(x: number, y: number): number {
    const { w, soln } = this;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dy && !dx) continue;
        const x2 = x + dx;
        const y2 = y + dy;
        if (this.inGrid(x2, y2) && soln[y2 * w + x2] === TENT) return y2 * w + x2;
      }
    }
    return -1;
  }

  /** An unmatched tree with exactly one square that could be its tent, and that
   * square blank, has its tent there. */
  treeSingles(): number {
    const { w, h, soln, links, rec } = this;
    let fired = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (soln[y * w + x] !== TREE || links[y * w + x]) continue;
        const cands = this.treeCandidates(x, y);
        if (cands.length === 0) return -1; // tree cannot link to anything
        const d = cands[0];
        const square = (y + DY(d)) * w + x + DX(d);
        if (cands.length === 1 && soln[square] === BLANK) {
          soln[square] = TENT;
          this.link(x, y, d);
          fired++;
          if (rec) {
            rec.reason = { kind: "treeSingle", tree: y * w + x, square };
            return fired;
          }
        }
      }
    }
    return fired;
  }

  /** An unmatched tree whose two candidates sit round a corner from each
   * other: whichever holds its tent, the square diagonal to the tree between
   * them touches that tent, so it is grass. */
  treeDiagonalPairs(): number {
    const { w, h, soln, links, rec } = this;
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
          if (rec) {
            const tree = y * w + x;
            const pair: [number, number] = [
              tree + DY(d1) * w + DX(d1),
              tree + DY(d2) * w + DX(d2),
            ];
            rec.reason = { kind: "treeDiagonal", tree, pair, square: i };
            return fired;
          }
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
    const { w, h, soln, numbers, locs, mrows, rec } = this;
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

      const before = fired;
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
      if (rec && fired > before) {
        rec.reason = { kind: neighbors ? "lineNeighbors" : "lineCount", line: i };
        return fired;
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
    { id: "tree-link", tier: DIFF_EASY, run: () => b.treeLinks() },
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

// --- the hint's projection ---------------------------------------------------

/** The rungs that place a square, easiest first: what a link is drawn for. */
const NEAR = [
  "grass-away-from-trees",
  "grass-next-to-tents",
  "tree-single",
  "tree-diagonal-pair",
];
const LINES = ["line-count", "line-neighbors"];

/**
 * The hint's ladder: the solver's square-placing rungs, in the solver's
 * order, with its two link rungs replaced by one that draws a link only for a
 * step that rests on it.
 *
 * A link the board already shows is read by {@link TentsBoard.readLinks}
 * before every firing, so the link rungs are left with pairings one reading
 * deeper, which the player cannot see until one is drawn. Drawing them as
 * they are found would ask for links nothing uses. So a link is drawn when,
 * with it drawn, a rung that the board stalled on fires: first one of the near
 * rungs, before the line counts are tried, then any rung at all. Only when no
 * single link unlocks anything is the first one drawn anyway, since a chain
 * two links long is still a chain the solver would follow.
 */
function tentsHintLadder(b: TentsBoard): DeductionTechnique[] {
  const byId = new Map(tentsLadder(b).map((t) => [t.id, t]));
  const rung = (id: string): DeductionTechnique => {
    const t = byId.get(id);
    if (!t) throw new Error(`tents: no rung ${id}`);
    return t;
  };
  const drawFor = (id: string, then: readonly string[], anyway: boolean) => ({
    id,
    tier: DIFF_EASY,
    run: () => drawLinkFor(b, then, anyway),
  });
  return [
    ...NEAR.map(rung),
    drawFor("link-for-near", NEAR, false),
    ...LINES.map(rung),
    drawFor("link-for-any", [...NEAR, ...LINES], true),
  ];
}

/** Draw the first pending link after which one of the rungs `then` fires (or
 * the first pending link at all, `anyway`), recording why it holds. */
function drawLinkFor(b: TentsBoard, then: readonly string[], anyway: boolean): number {
  const pending = b.pendingLinks();
  const unlocks = (link: (typeof pending)[number]): boolean => {
    const trial = b.clone();
    trial.drawLink(link.tent, link.tree);
    if (trial.readLinks() < 0) return false;
    return tentsLadder(trial).some((t) => then.includes(t.id) && t.run() > 0);
  };
  let link = pending.find(unlocks) ?? null;
  if (!link && anyway && pending.length > 0) link = pending[0];
  if (!link) return 0;
  b.drawLink(link.tent, link.tree);
  if (b.rec) b.rec.reason = link;
  return 1;
}

/** One firing on the hint path. */
export interface TentsFiring {
  reason: TentsReason;
  /** The board just before it fired, which is what its sentence describes:
   * the squares, and the links as the player sees them. */
  before: { soln: Int8Array; links: Int8Array };
  /** The squares it decided, and their values. */
  cells: { i: number; v: number }[];
  /** The link it asks the player to draw. */
  link: { tent: number; tree: number } | null;
}

/**
 * The recording projection's driver: the hint ladder one firing at a time,
 * over the player's board `b`, whose `drawn` holds the player's links.
 *
 * **Before every firing the links are read afresh** ({@link
 * TentsBoard.readLinks}), so no firing rests on a pairing some earlier rung
 * tied and the board does not show. A pairing the solver needs beyond that
 * becomes a link the hint draws, and from then on it is on the board.
 */
export function tentsRecordingPass(
  b: TentsBoard,
  budget: StepBudget,
): { next(): TentsFiring | null; impossible(): boolean } {
  const rec: TentsRecorder = { reason: null };
  b.rec = rec;
  let broken = false;
  const firings = singleFirings({
    techniques: tentsHintLadder(b),
    budget,
    beforeTechnique: () => {
      rec.reason = null;
    },
  });
  const drawnOf = (): Int8Array => {
    if (!b.drawn) throw new Error("tents: a recording pass needs the drawn links");
    return b.drawn;
  };
  return {
    next(): TentsFiring | null {
      if (broken) return null;
      if (b.readLinks() < 0) {
        broken = true;
        return null;
      }
      const before = { soln: b.soln.slice(), links: b.links.slice() };
      const drawnBefore = drawnOf().slice();
      if (!firings.next()) return null;
      const { reason } = rec;
      if (!reason) throw new Error("tents: a hint firing recorded no reason");
      // The tent a tree has no other square for is placed joined to it, in the
      // one move the link gesture makes.
      if (reason.kind === "treeSingle") b.drawLink(reason.square, reason.tree);
      const cells: { i: number; v: number }[] = [];
      for (let i = 0; i < b.soln.length; i++)
        if (b.soln[i] !== before.soln[i]) cells.push({ i, v: b.soln[i] });
      let link: { tent: number; tree: number } | null = null;
      for (let i = 0; i < b.soln.length; i++)
        if (drawnOf()[i] !== drawnBefore[i] && b.soln[i] === TENT)
          link = { tent: i, tree: i + DY(drawnOf()[i]) * b.w + DX(drawnOf()[i]) };
      return { reason, before, cells, link };
    },
    impossible: () => broken || firings.impossible(),
  };
}
