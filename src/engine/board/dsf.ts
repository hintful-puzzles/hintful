/**
 * Disjoint-set / union-find (upstream `dsf.c`): path compression and
 * union-by-size, with upstream's choice of root (see `merge`).
 */
export class Dsf {
  private readonly parent: Int32Array;
  /** Tree size for union-by-size; only meaningful at a root. */
  private readonly classSize: Int32Array;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.classSize = new Int32Array(n);
    this.reinit();
  }

  /** Restore the singleton partition (every element its own root). */
  reinit(): void {
    for (let i = 0; i < this.parent.length; i++) {
      this.parent[i] = i;
      this.classSize[i] = 1;
    }
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
    if (this.classSize[ra] > this.classSize[rb]) {
      this.parent[rb] = ra;
      this.classSize[ra] += this.classSize[rb];
    } else {
      this.parent[ra] = rb;
      this.classSize[rb] += this.classSize[ra];
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
    const copy = new Dsf(this.parent.length);
    copy.parent.set(this.parent);
    copy.classSize.set(this.classSize);
    return copy;
  }

  /** Take on `other`'s partition in place, for a holder that keeps one forest
   * and puts it back to a copy it saved. */
  copyFrom(other: Dsf): void {
    this.parent.set(other.parent);
    this.classSize.set(other.classSize);
  }
}
