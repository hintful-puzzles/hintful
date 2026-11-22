/**
 * A hint's walk where the player draws marks as notes (Tents' links), and
 * some of them need no drawing: the board shows them at a glance. The
 * description names the techniques that read such a mark (`play.glance`).
 *
 * - **Read before every firing.** Those techniques run once on the marks
 *   drawn so far, by the player or by a step the hint asked for, and what
 *   they find joins the marks. Once, and on the drawn marks alone: a mark
 *   that needs another one read first is not on the board.
 * - **Asked for only where it serves.** The same techniques, run in the walk,
 *   are then left with marks one reading deeper, which the player cannot see
 *   until one is drawn. Drawing them as they are found would ask for marks
 *   nothing uses, so a mark is offered only where, with it drawn and the
 *   board read again, a technique it serves fires; what that firing reads is
 *   what the mark serves, which the walk goes on from. An ask sits before
 *   each technique `play.askBefore` names, serving the techniques above it,
 *   and one more at the ladder's end serves any; where none serves there, the
 *   first mark is offered alone, since a chain two marks long is still one
 *   the ladder would follow.
 *
 * Generalized from Tents' hand-written walk (`add-tents-hint`'s design).
 */

import { CellMarks } from "../solve/cell-marks.ts";
import { MARK } from "../solve/describe-runtime.ts";
import {
  admits,
  type Caps,
  type Firing,
  keptRung,
  type LadderEntry,
  type Rung,
} from "../solve/ladder-runtime.ts";
import type { Taken } from "../solve/ladder-walk.ts";

/** What the description declares: `play.glance` and `play.askBefore`. */
export interface GlanceDecl {
  readonly glance: readonly string[];
  readonly askBefore?: readonly string[];
}

/** A hint's walk with its marks read at a glance. */
export interface GlanceWalk {
  /** The ladder the walk takes: the glance techniques replaced by asks. */
  readonly entries: readonly LadderEntry[];
  /** The asks' ids, which the walk takes only where nothing else follows. */
  readonly fallback: readonly string[];
  /** Read the marks the board shows onto `m` before a firing is taken: the
   * drawn marks, and what the glance techniques find on them. Marks a firing
   * made since the last reading count as drawn, since its step asks for them.
   * False where the board contradicts itself. */
  settle(m: CellMarks): boolean;
  /** What the firing an ask was offered for reads, or none. */
  serves(taken: Taken): readonly number[];
}

/** A copy of `m` that shares no marks with it, for trying a mark. */
function copied(m: CellMarks): CellMarks {
  const c = new CellMarks(m.sp, m.domain, m.grid.slice());
  c.cands.set(m.cands);
  c.marked.set(m.marked);
  return c;
}

/** The marks `facts` makes, as cell and element pairs. */
function* marksIn(facts: readonly number[]): Generator<[number, number]> {
  for (let i = 0; i < facts.length; i += 3)
    if (facts[i] === MARK) yield [facts[i + 1], facts[i + 2]];
}

/**
 * The walk of `entries` at `caps` from the marks `drawn` (each cell's
 * element, `-1` none), with `decl`'s techniques read at a glance. `premise`
 * is what a firing reads, which an ask's mark serves.
 */
export function glanceWalk(
  entries: readonly LadderEntry[],
  decl: GlanceDecl,
  drawn: Int32Array,
  caps: Caps,
  premise: (taken: Taken) => readonly number[],
): GlanceWalk {
  const glance = entries.filter((e) => decl.glance.includes(e.id));
  const placing = entries.filter((e) => !decl.glance.includes(e.id));

  /** Read onto `m`, holding the marks `marks`, those the glance techniques
   * find on them. */
  const read = (m: CellMarks, marks: Int32Array): boolean => {
    m.marked.set(marks);
    m.placed++;
    const found: Firing[] = [];
    for (const e of glance) {
      const got = e.run.firings(m);
      if (got === "contradiction") return false;
      found.push(...got);
    }
    for (const f of found)
      for (const [c, q] of marksIn(f.facts)) {
        if (m.marked[c] === q) continue;
        // Two readings that name different elements for one cell.
        if (m.marked[c] >= 0) return false;
        m.markAt(c, q);
      }
    return true;
  };

  // What the marks held after the last reading, so a mark a firing has made
  // since is told from one the reading made.
  let lastRead = drawn.slice();
  const settle = (m: CellMarks): boolean => {
    for (let c = 0; c < drawn.length; c++)
      if (m.marked[c] !== lastRead[c] && m.marked[c] >= 0) drawn[c] = m.marked[c];
    const ok = read(m, drawn);
    lastRead = m.marked.slice();
    return ok;
  };

  const rungs = Object.fromEntries(glance.map((e) => [e.id, e.run]));
  /** An ask serving `then`, and with `anyway` offering a mark that serves
   * nothing where none serves. */
  const ask = (then: readonly LadderEntry[], anyway: boolean): Rung =>
    keptRung(
      rungs,
      (m, { facts, reasons }) => {
        const trial = copied(m);
        const trialDrawn = drawn.slice();
        for (const [c, q] of marksIn(facts)) trialDrawn[c] = q;
        if (!read(trial, trialDrawn)) return null;
        for (const e of then) {
          const got = e.run.firings(trial);
          if (got === "contradiction" || got.length === 0) continue;
          return [{ ...reasons[0], serves: premise({ ...got[0], entry: e }) }];
        }
        return null;
      },
      anyway,
    );

  // Each ask serves the techniques above it that the walk's tier admits.
  const name = glance.map((e) => e.name).join(" or ");
  const out: LadderEntry[] = [];
  const fallback: string[] = [];
  const askEntry = (anyway: boolean): void => {
    const id = `ask${fallback.length}`;
    fallback.push(id);
    const then = out.filter((e) => !fallback.includes(e.id) && admits(e, caps));
    out.push({ id, name, tier: 0, run: ask(then, anyway) });
  };
  for (const e of placing) {
    if (decl.askBefore?.includes(e.id)) askEntry(false);
    out.push(e);
  }
  askEntry(true);

  return {
    entries: out,
    fallback,
    settle,
    serves: (taken) =>
      (taken.reasons[0] as { serves?: readonly number[] } | undefined)?.serves ?? [],
  };
}
