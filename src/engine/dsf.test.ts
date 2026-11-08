import { describe, expect, it } from "vitest";
import { Dsf } from "./dsf.ts";
import { randomNew, randomUpto } from "./random/index.ts";

/**
 * Brute-force reference: a plain parent array, walked to a root each
 * time. No path compression, no union-by-size. Property tests cross
 * the optimized `Dsf` against this.
 */
class RefDsf {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  reinit(): void {
    for (let i = 0; i < this.parent.length; i++) this.parent[i] = i;
  }
  canonify(i: number): number {
    while (this.parent[i] !== i) i = this.parent[i];
    return i;
  }
  merge(a: number, b: number): void {
    const ra = this.canonify(a);
    const rb = this.canonify(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

function classesEqual(
  a: { canonify(i: number): number },
  b: { canonify(i: number): number },
  n: number,
): void {
  // Same equivalence relation: i ≡ j in `a` iff i ≡ j in `b`. (We
  // can't compare canonical roots directly — `a` may pick a different
  // representative than `b`.)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const aSame = a.canonify(i) === a.canonify(j);
      const bSame = b.canonify(i) === b.canonify(j);
      expect(aSame).toBe(bSame);
    }
  }
}

describe("Dsf", () => {
  it("starts as n singletons", () => {
    const d = new Dsf(5);
    for (let i = 0; i < 5; i++) expect(d.canonify(i)).toBe(i);
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        expect(d.canonify(i) === d.canonify(j)).toBe(false);
      }
    }
  });

  it("merge unifies the equivalence classes", () => {
    const d = new Dsf(6);
    d.merge(0, 1);
    d.merge(2, 3);
    d.merge(1, 2);
    // {0,1,2,3} together; {4}; {5}.
    expect(d.canonify(0)).toBe(d.canonify(3));
    expect(d.canonify(1)).toBe(d.canonify(2));
    expect(d.canonify(0) === d.canonify(4)).toBe(false);
    expect(d.canonify(4) === d.canonify(5)).toBe(false);
  });

  it("merge is idempotent on already-equivalent elements", () => {
    const d = new Dsf(4);
    d.merge(0, 1);
    const root = d.canonify(0);
    d.merge(0, 1);
    d.merge(1, 0);
    expect(d.canonify(0)).toBe(root);
    expect(d.canonify(1)).toBe(root);
  });

  it("size and equivalent reflect the merges", () => {
    const d = new Dsf(6);
    d.merge(0, 1);
    d.merge(2, 3);
    d.merge(1, 2);
    // {0,1,2,3} together; {4}; {5}.
    for (const i of [0, 1, 2, 3]) expect(d.size(i)).toBe(4);
    expect(d.size(4)).toBe(1);
    expect(d.size(5)).toBe(1);
    expect(d.equivalent(0, 3)).toBe(true);
    expect(d.equivalent(1, 2)).toBe(true);
    expect(d.equivalent(0, 4)).toBe(false);
    expect(d.equivalent(4, 5)).toBe(false);
  });

  // The tests above merge only equal-sized classes, so they never take the
  // `classSize[ra] > classSize[rb]` branch, and the brute-force property test
  // below compares class *membership* rather than roots or sizes. Both halves
  // of the union-by-size rule were therefore unasserted — and the root choice
  // is not an implementation detail here: `merge`'s doc comment records that
  // upstream algorithms branch on the canonical root's *identity* (Filling's
  // `learn_critical_square` walks a region from its canonical cell), so it is
  // required for differential parity, not just for connectivity.
  it("makes the larger class the root, whichever argument it arrived as", () => {
    for (const [big, small] of [
      [0, 2],
      [2, 0],
    ] as const) {
      const d = new Dsf(4);
      d.merge(0, 1); // {0,1}: a tie, so the second argument's root (1) wins
      expect(d.canonify(0)).toBe(1);
      d.merge(big, small); // {0,1} (size 2) against {2} (size 1)
      expect(d.canonify(2)).toBe(1);
      expect(d.size(2)).toBe(3);
    }
  });

  it("breaks a size tie toward the second argument's root, as upstream does", () => {
    const d = new Dsf(4);
    d.merge(0, 1); // root 1
    d.merge(2, 3); // root 3
    d.merge(1, 3); // two classes of 2: the tie goes to the second argument
    expect(d.canonify(0)).toBe(3);
    expect(d.size(0)).toBe(4);
  });

  it("accumulates the class size on both sides of the union-by-size branch", () => {
    // Grow a class one element at a time so every merge takes the
    // *larger-is-root* branch, the one the tests above never reach.
    const d = new Dsf(6);
    d.merge(0, 1);
    for (let i = 2; i < 6; i++) {
      d.merge(d.canonify(0), i); // larger class first
      expect(d.size(0)).toBe(i + 1);
    }
    expect(d.size(5)).toBe(6);
  });

  it("reinit restores n singletons", () => {
    const d = new Dsf(5);
    d.merge(0, 1);
    d.merge(2, 3);
    d.reinit();
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        expect(d.canonify(i) === d.canonify(j)).toBe(false);
      }
    }
  });

  // O(n²) cross-check after every op — legitimately CPU-heavy, and slow under
  // a busy suite. Not clock-gated: the verdict is the assertion, not the time.
  it("matches brute-force reference over long random sequences", () => {
    const n = 20;
    const rng = randomNew("dsf-property");
    for (let trial = 0; trial < 5; trial++) {
      const d = new Dsf(n);
      const ref = new RefDsf(n);
      for (let op = 0; op < 200; op++) {
        const a = randomUpto(rng, n);
        const b = randomUpto(rng, n);
        d.merge(a, b);
        ref.merge(a, b);
        classesEqual(d, ref, n);
      }
      d.reinit();
      ref.reinit();
      classesEqual(d, ref, n);
    }
    // 30s predated the suite-wide 60s default and *lowered* the ceiling;
    // under full-suite CPU saturation this legitimately runs 40s+.
  });
});
