/**
 * Disjoint-set / union-find (upstream `dsf.c`): path compression and
 * union-by-size, with upstream's choice of root (see `merge`).
 */
export class Dsf {
  private readonly parent: Int32Array;
  /** Tree size for union-by-size; only meaningful at a root. */
  private readonly classSize: Int32Array;

  /** Each class's smallest element, kept at its root; only for a dsf made by
   * {@link Dsf.withMinimal}. */
  private readonly least: Int32Array | null;

  constructor(n: number, trackMinimal = false) {
    this.parent = new Int32Array(n);
    this.classSize = new Int32Array(n);
    this.least = trackMinimal ? new Int32Array(n) : null;
    this.reinit();
  }

  /** A dsf that also answers {@link minimal} (upstream `dsf_new_min`). The root
   * is whichever element union-by-size left there, so a caller that wants a
   * class's *first* element, in the order it numbers them, asks for this. */
  static withMinimal(n: number): Dsf {
    return new Dsf(n, true);
  }

  /** Restore the singleton partition (every element its own root). */
  reinit(): void {
    for (let i = 0; i < this.parent.length; i++) {
      this.parent[i] = i;
      this.classSize[i] = 1;
      if (this.least) this.least[i] = i;
    }
  }

  /** The smallest element of `i`'s class (upstream `dsf_minimal`). */
  minimal(i: number): number {
    if (!this.least) throw new Error("dsf: minimal() on a dsf not made withMinimal");
    return this.least[this.canonify(i)];
  }

  /** Canonical root of `i`'s equivalence class. */
  canonify(i: number): number {
    let root = i;
    while (this.parent[root] !== root) root = this.parent[root];
    // Path compression: walk again, repointing every node to the root.
    let cur = i;
    while (this.parent[cur] !== root) {
      const next = this.parent[cur];
      this.parent[cur] = root;
      cur = next;
    }
    return root;
  }

  /** Merge `a`'s class with `b`'s. No-op if already in the same class.
   *
   * The root is upstream `dsf_merge`'s: the larger class's, and on a tie the
   * *second* argument's. Some algorithms branch on the root's *identity*
   * (Filling's `learn_critical_square` walks a region from its canonical
   * cell), so the differentials depend on this choice, not only on the
   * partition. */
  merge(a: number, b: number): void {
    const ra = this.canonify(a);
    const rb = this.canonify(b);
    if (ra === rb) return;
    const least = this.least ? Math.min(this.least[ra], this.least[rb]) : 0;
    if (this.classSize[ra] > this.classSize[rb]) {
      this.parent[rb] = ra;
      this.classSize[ra] += this.classSize[rb];
      if (this.least) this.least[ra] = least;
    } else {
      this.parent[ra] = rb;
      this.classSize[rb] += this.classSize[ra];
      if (this.least) this.least[rb] = least;
    }
  }

  /** Number of elements in `i`'s equivalence class. */
  size(i: number): number {
    return this.classSize[this.canonify(i)];
  }

  /** True iff `a` and `b` are in the same equivalence class. */
  equivalent(a: number, b: number): boolean {
    return this.canonify(a) === this.canonify(b);
  }

  /** A deep copy: a fresh forest with the same partition, for a state that
   * clones its `Dsf` per move. */
  clone(): Dsf {
    const copy = new Dsf(this.parent.length, this.least !== null);
    copy.parent.set(this.parent);
    copy.classSize.set(this.classSize);
    if (this.least) copy.least?.set(this.least);
    return copy;
  }
}

/** The root/inverse pair a flip-dsf canonify returns. */
export interface FlipCanon {
  /** Canonical root of the equivalence class. */
  root: number;
  /** True iff `n`'s sense is flipped relative to the root. */
  inverse: boolean;
}

/**
 * Flip (parity) disjoint-set, upstream `dsf.c`'s flip variant: a union-find
 * whose classes also track a parity bit, so two elements can be bound "in the
 * same sense" or "in opposite senses" (Dominosa: two domino placements are
 * either always together or always opposite).
 *
 * Path compression carries the accumulated parity as `dsf_path_compress_flip`
 * does; union is by class size with {@link Dsf}'s tie-break.
 */
export class FlipDsf {
  private readonly parent: Int32Array;
  private readonly classSize: Int32Array;
  /** For a non-root `n`, whether its sense is flipped relative to its parent. */
  private readonly flip: Uint8Array;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.classSize = new Int32Array(n);
    this.flip = new Uint8Array(n);
    this.reinit();
  }

  /** Restore the singleton partition (every element its own root, no flips). */
  reinit(): void {
    for (let i = 0; i < this.parent.length; i++) {
      this.parent[i] = i;
      this.classSize[i] = 1;
      this.flip[i] = 0;
    }
  }

  /** Walk to the root of `n`, accumulating the flip parity along the way.
   * Mirrors `dsf_find_root_flip`. */
  private findRoot(n: number): { root: number; flip: number } {
    let flip = 0;
    while (this.parent[n] !== n) {
      flip ^= this.flip[n];
      n = this.parent[n];
    }
    return { root: n, flip };
  }

  /** Repoint every node on the path from `n` to `root`, fixing up its stored
   * flip so the parity relative to the root is preserved.
   * Mirrors `dsf_path_compress_flip`. */
  private pathCompress(n: number, root: number, flip: number): void {
    while (this.parent[n] !== n) {
      const prev = n;
      const flipPrev = flip;
      n = this.parent[n];
      flip ^= this.flip[prev];
      this.flip[prev] = flipPrev;
      this.parent[prev] = root;
    }
  }

  /** Canonical root of `n`'s class and whether `n` is flipped relative to it. */
  canonify(n: number): FlipCanon {
    const { root, flip } = this.findRoot(n);
    this.pathCompress(n, root, flip);
    return { root, inverse: flip !== 0 };
  }

  /** Bind `n1` and `n2` into one class, in opposite senses when `inverse`.
   * Two elements already in one class keep their parity: a contradictory
   * `inverse` is not checked. Mirrors `dsf_merge_flip`. */
  mergeFlip(n1: number, n2: number, inverse: boolean): void {
    const inv = inverse ? 1 : 0;
    const c1 = this.findRoot(n1);
    const c2 = this.findRoot(n2);
    const r1 = c1.root;
    const r2 = c2.root;
    let f1 = c1.flip;
    let f2 = c2.flip;
    let root: number;

    if (r1 === r2) {
      root = r1;
    } else {
      const s1 = this.classSize[r1];
      const s2 = this.classSize[r2];
      if (s1 > s2) {
        this.parent[r2] = root = r1;
        this.flip[r2] = f1 ^ f2 ^ inv;
        f2 ^= this.flip[r2];
      } else {
        this.parent[r1] = root = r2;
        this.flip[r1] = f1 ^ f2 ^ inv;
        f1 ^= this.flip[r1];
      }
      this.classSize[root] = s1 + s2;
    }

    this.pathCompress(n1, root, f1);
    this.pathCompress(n2, root, f2);
  }
}
