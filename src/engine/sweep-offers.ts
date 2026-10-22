/**
 * Every firing a sweep-shaped rung could make, for a technique's `available()`
 * (`deduction-fixpoint.ts`), from the rung as it is written.
 *
 * Most rungs scan their sites in order and, on the recording path, write the
 * first site that fires and return. Enumerating every firing by hand means a
 * second, side-effect-free copy of each rung, which drifts from the one the
 * generator runs. Instead the rung asks {@link SweepOffers.keep} where it
 * would return: firing, the answer is yes; while offers are being collected,
 * the board as the site left it is saved with what the recorder holds, the
 * board is put back, and the scan goes on to the next site. Each offer is
 * then taken by restoring what was saved, so taking it is exactly the firing
 * the rung made. A rung that fires without asking writes everything it found
 * at once, and that is one offer.
 *
 * A continuing driver takes every firing through the offers and never runs a
 * rung outright, so `keep()` answers yes only to `run`: a recording rung that
 * only a continuing plan drives may call it and scan on, with no early return
 * of its own (Range, Unruly, Light Up).
 *
 * Collecting runs every site's firing on the board and undoes it, so `save`
 * must copy everything a firing writes, and the rung must be one whose sites
 * read the board as the scan began (a rung whose later sites read an earlier
 * site's writes is not a sweep of independent firings, and offers what it
 * never would). A rung that finds the board inconsistent after offering some
 * offers none: the board is inconsistent whatever the plan takes.
 */
import type { DeductionTechnique, LadderCandidate } from "./deduction-fixpoint.ts";

export interface SweepBoard<S, R> {
  /** Copy everything a firing can write. */
  save(): S;
  /** Put the board back to a copy {@link save} made. */
  restore(s: S): void;
  /** What the recorder holds for the firing just made. */
  recorded(): R;
  /** Hand the recorder back what {@link recorded} read, as the firing left it. */
  record(r: R): void;
  /** The elements a firing's premise reads, by the frontier's key, judged on
   * the board before it, which is the board when this is asked. */
  reads(r: R): readonly number[];
  /** The elements a firing wrote, from the board before it and after. */
  writes(before: S, after: S, r: R): readonly number[];
}

export class SweepOffers<S, R> {
  private collecting: {
    base: S;
    /** What the recorder held as the scan began. */
    blank: R;
    out: { after: S; recorded: R }[];
  } | null = null;

  constructor(private readonly board: SweepBoard<S, R>) {}

  /** Where a rung on the recording path would return its firing: whether it
   * does. Collecting, the firing is offered, the board and the recorder put
   * back, and `false` tells the rung to scan on. A site's firing that records
   * nothing must not carry the last site's record. */
  keep(): boolean {
    const c = this.collecting;
    if (!c) return true;
    c.out.push({ after: this.board.save(), recorded: this.board.recorded() });
    this.board.restore(c.base);
    this.board.record(c.blank);
    return false;
  }

  /** Every firing `run` would make from the board as it stands, as candidates
   * for a hint plan's frontier, or `"contradiction"` where `run` finds the
   * board inconsistent. The board and the recorder are left as they were. */
  offer(run: () => number): LadderCandidate[] | "contradiction" {
    const { board } = this;
    const base = board.save();
    const c = { base, blank: board.recorded(), out: [] as { after: S; recorded: R }[] };
    this.collecting = c;
    let ret: number;
    try {
      ret = run();
      // A rung that writes all it finds at once, never asking, is one firing.
      if (ret > 0 && c.out.length === 0)
        c.out.push({ after: board.save(), recorded: board.recorded() });
    } finally {
      this.collecting = null;
      board.restore(base);
      board.record(c.blank);
    }
    if (ret < 0) return "contradiction";
    return c.out.map(({ after, recorded }) => ({
      reads: () => board.reads(recorded),
      writes: () => board.writes(base, after, recorded),
      take: () => {
        board.restore(after);
        board.record(recorded);
      },
    }));
  }

  /** `ladder` with each technique offering its firings through this
   * collector. */
  techniques(ladder: readonly DeductionTechnique[]): DeductionTechnique[] {
    return ladder.map((t) => ({ ...t, available: () => this.offer(t.run) }));
  }
}

/** The elements whose value differs between two copies of one array. */
export function changed(before: ArrayLike<number>, after: ArrayLike<number>): number[] {
  const out: number[] = [];
  for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) out.push(i);
  return out;
}
