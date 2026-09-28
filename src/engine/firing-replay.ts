/**
 * The audit of what a recorded firing's premise names: whether each strike and
 * placement the candidate walk offers by its premise (`availableFirings`) would
 * still be concluded from a solver state that keeps only that premise
 * (`guard-recorded-firing-premises`).
 *
 * The walk offers a recorded firing when its premise holds no mark the board
 * has yet to show, which is sound only if the premise names every cell whose
 * candidates or placed value the deduction reads. So the audit takes the
 * solver's state at the firing, returns every cell outside the premise to the
 * state the recording started from, and runs the technique that made the
 * firing again.
 *
 * **One technique, once, never the whole solve.** A solver run to its fixpoint
 * from that state re-derives everything it forgot, because the clues and
 * givens it started from are what derived it; such a check passes every
 * firing. The ladder's lower rungs do the same one firing at a time, so the
 * replay runs the firing's own technique alone where the solver can.
 *
 * **What fires first need not be the firing under audit.** A cell returned to
 * the start shows again what an earlier firing of the same technique struck
 * from it, and the technique finds that first. A deduction reading fewer
 * candidates concludes no more, so on the returned state such a firing
 * changes only returned cells: the audit makes those changes and asks again.
 * Anything else coming first is the finding, that the firing did not follow
 * from its premise. The price is a blind spot: a cell the technique itself
 * re-derives on the way is not tested, which is why the audit counts the
 * cells it did test ({@link PremiseAudit.tested}).
 *
 * A recording solver takes part through a {@link ReplayAdapter}, only while an
 * audit is running ({@link auditingPremises}): it builds a {@link FiringReplay}
 * before its recording run, marks each firing as it opens, and offers the
 * replay after.
 */

import type { Point } from "./types.ts";

/** One change a firing made: a candidate struck, or a value placed. */
export interface FiringChange {
  kind: "elim" | "place";
  x: number;
  y: number;
  n: number;
}

/** A solver's state as a replay reads it: each cell's placed value (0 for
 * none) and its candidates, bit `n` for value `n`. */
export interface CellBoard {
  values: Int32Array;
  cands: Int32Array;
}

/** How a recording solver's state is read, and one of its techniques run from
 * an edited copy. `T` is how the solver names a technique. */
export interface ReplayAdapter<T> {
  w: number;
  h: number;
  /** The recording solver's state now. */
  capture(): CellBoard;
  /** A fresh solver holding `board`, as the recording run would hold it
   * (recording path, context as the run began), and a way to run `technique`
   * on it once more each call: the state after, and the technique's verdict
   * (`> 0` fired, `0` found nothing, `< 0` found a contradiction). */
  run(board: CellBoard, technique: T): () => { after: CellBoard; ret: number };
  /** The technique's name, for a finding. */
  name(technique: T): string;
}

const copy = (b: CellBoard): CellBoard => ({
  values: b.values.slice(),
  cands: b.cands.slice(),
});

const cellDiffers = (a: CellBoard, b: CellBoard, c: number): boolean =>
  a.values[c] !== b.values[c] || a.cands[c] !== b.cands[c];

/** A recording run's state before each firing, and its techniques rerun from an
 * edited copy of it. */
export class FiringReplay<T = unknown> {
  readonly w: number;
  readonly h: number;
  private readonly start: CellBoard;
  private last: CellBoard;
  private pending: { board: CellBoard; technique: T } | null = null;
  private readonly at = new Map<number, { board: CellBoard; technique: T }>();

  constructor(private readonly adapter: ReplayAdapter<T>) {
    this.w = adapter.w;
    this.h = adapter.h;
    this.start = this.last = adapter.capture();
  }

  /** `technique` is about to run. */
  before(technique: T): void {
    const now = this.adapter.capture();
    const n = this.w * this.h;
    for (let c = 0; c < n; c++)
      if (cellDiffers(now, this.last, c)) {
        this.last = now;
        break;
      }
    this.pending = { board: this.last, technique };
  }

  /** The technique that last ran {@link before} has opened firing `group`. */
  open(group: number): void {
    if (!this.pending)
      throw new Error("replay: a firing opened with no technique running");
    this.at.set(group, this.pending);
  }

  private get(group: number): { board: CellBoard; technique: T } {
    const at = this.at.get(group);
    if (!at) throw new Error(`replay: no firing ${group} was recorded`);
    return at;
  }

  /** The cells whose state before `group` differs from the recording's start. */
  changedBefore(group: number): number[] {
    const { board } = this.get(group);
    const out: number[] = [];
    for (let c = 0; c < this.w * this.h; c++)
      if (cellDiffers(board, this.start, c)) out.push(c);
    return out;
  }

  technique(group: number): string {
    return this.adapter.name(this.get(group).technique);
  }

  /** The state before `group`, with `reset` returned to the start and
   * `applied` made. */
  private edited(
    group: number,
    reset: ReadonlySet<number>,
    applied: readonly FiringChange[],
  ): CellBoard {
    const b = copy(this.get(group).board);
    for (const c of reset) {
      b.values[c] = this.start.values[c];
      b.cands[c] = this.start.cands[c];
    }
    for (const a of applied) {
      const c = a.y * this.w + a.x;
      if (a.kind === "place") b.values[c] = a.n;
      else b.cands[c] &= ~(1 << a.n);
    }
    return b;
  }

  /** Run the technique that made `group` from the edited state until it
   * changes something: its changes, or none if it finds nothing. */
  refire(
    group: number,
    reset: ReadonlySet<number>,
    applied: readonly FiringChange[],
  ): FiringChange[] {
    const { technique } = this.get(group);
    const board = this.edited(group, reset, applied);
    const again = this.adapter.run(board, technique);
    // A technique may report a firing that changed nothing (Towers' one-off
    // facing clues place a tower already standing); it has more to say next.
    for (let pass = 0; pass <= this.w * this.h; pass++) {
      const { after, ret } = again();
      const changes = diff(board, after, this.w);
      if (changes.length > 0 || ret <= 0) return changes;
    }
    throw new Error(`replay: ${this.adapter.name(technique)} kept firing to no effect`);
  }

  /** The `reset` cells whose edited state still differs from the state before
   * `group`. */
  widened(
    group: number,
    reset: ReadonlySet<number>,
    applied: readonly FiringChange[],
  ): number[] {
    const { board } = this.get(group);
    const b = this.edited(group, reset, applied);
    return [...reset].filter((c) => cellDiffers(b, board, c));
  }
}

/** What turned `before` into `after`: each value placed, each candidate
 * struck. */
function diff(before: CellBoard, after: CellBoard, w: number): FiringChange[] {
  const out: FiringChange[] = [];
  for (let c = 0; c < before.values.length; c++) {
    const x = c % w;
    const y = (c / w) | 0;
    if (before.values[c] === 0 && after.values[c] !== 0)
      out.push({ kind: "place", x, y, n: after.values[c] });
    const gone = before.cands[c] & ~after.cands[c];
    for (let n = 0; 1 << n <= gone; n++)
      if (gone & (1 << n)) out.push({ kind: "elim", x, y, n });
  }
  return out;
}

/** A firing whose conclusion did not follow from its premise. */
export interface PremiseFinding {
  label: string;
  group: number;
  /** The technique that made it ({@link FiringReplay.technique}). */
  technique: string;
  /** The recorded reason of the firing's first change. */
  reason: unknown;
  /** What the firing concludes. */
  targets: readonly FiringChange[];
  /** The on-board cells its steps name as premise, as `y * w + x`. */
  premise: readonly number[];
  /** The cells returned to the recording's start. */
  reset: readonly number[];
  /** What the technique concluded first from that state instead. */
  instead: readonly FiringChange[];
}

export interface PremiseAudit {
  /** Recording runs that recorded anything, replayed or not. */
  recordings: number;
  /** Firings checked. */
  checks: number;
  /** Firings whose premise left nothing outside it to return to the start. */
  vacuous: number;
  /** Cells outside a checked premise that stayed returned to the start when
   * the firing came: the ones the audit actually tested. */
  tested: number;
  /** Cells outside a checked premise the technique itself had brought back to
   * the solver's state by then, and so were not tested. */
  kept: number;
  findings: PremiseFinding[];
  /** Firings the replay did not make again from the recorded state: a fault
   * in the instrument, not in a premise. */
  unreproduced: Pick<
    PremiseFinding,
    "label" | "group" | "technique" | "targets" | "instead"
  >[];
  /** The plans whose recording offered no replay, by label. */
  unreplayed: Set<string>;
  /** Checks and tested cells by technique ({@link FiringReplay.technique}). */
  byTechnique: Map<string, { checks: number; tested: number }>;
}

let audit: PremiseAudit | null = null;
let offered: FiringReplay | null = null;
/** The checks already made against each replay, by firing and premise. */
const done = new WeakMap<FiringReplay, Set<string>>();

/** Whether a premise audit is running, and so whether a recording solver
 * should build its replay. Always false outside {@link auditRecordedPremises}. */
export function auditingPremises(): boolean {
  return audit !== null;
}

/** A recording solver's replay of the run it just made. */
export function offerReplay(replay: FiringReplay): void {
  if (audit) offered = replay;
}

/** The replay the last recording run offered, once. A recording of `recorded`
 * operations that offered none is noted against `label`: its firings cannot be
 * audited, and saying so is what keeps a new recording solver from being
 * skipped in silence. */
export function takeReplay(label: string, recorded: number): FiringReplay | null {
  const r = offered;
  offered = null;
  if (audit && recorded > 0) {
    audit.recordings++;
    if (!r) audit.unreplayed.add(label);
  }
  return r;
}

/** Run `run` (hint plans, usually) with the audit on, and report it. */
export function auditRecordedPremises(run: () => void): PremiseAudit {
  if (audit) throw new Error("premise audits do not nest");
  const result: PremiseAudit = {
    recordings: 0,
    checks: 0,
    vacuous: 0,
    tested: 0,
    kept: 0,
    findings: [],
    unreproduced: [],
    unreplayed: new Set(),
    byTechnique: new Map(),
  };
  audit = result;
  try {
    run();
  } finally {
    audit = null;
    offered = null;
  }
  return result;
}

const same = (a: FiringChange, b: FiringChange): boolean =>
  a.kind === b.kind && a.x === b.x && a.y === b.y && a.n === b.n;

/**
 * Audit one firing: does its technique still conclude `targets` once every
 * cell `premise` leaves out is back at the recording's start?
 */
export function checkPremise(
  replay: FiringReplay,
  firing: {
    label: string;
    group: number;
    reason: unknown;
    premise: readonly Point[];
    targets: readonly FiringChange[];
  },
): void {
  if (!audit) return;
  const { label, group, reason, premise, targets } = firing;
  const { w, h } = replay;
  const cells = [
    ...new Set(
      premise
        .filter((p) => p.x >= 0 && p.y >= 0 && p.x < w && p.y < h)
        .map((p) => p.y * w + p.x),
    ),
  ].sort((a, b) => a - b);
  const key = `${group}|${cells.join(",")}|${targets.map((t) => `${t.kind}${t.x},${t.y},${t.n}`).join(";")}`;
  const seen = done.get(replay) ?? new Set<string>();
  done.set(replay, seen);
  if (seen.has(key)) return;
  seen.add(key);

  audit.checks++;
  const technique = replay.technique(group);
  const tally = audit.byTechnique.get(technique) ?? { checks: 0, tested: 0 };
  audit.byTechnique.set(technique, tally);
  tally.checks++;
  const concludes = (changes: readonly FiringChange[]): boolean =>
    targets.every((t) => changes.some((c) => same(c, t)));
  // The instrument first: from the recorded state the replay must make the
  // recorded firing, or it has no business judging one.
  const recorded = replay.refire(group, new Set(), []);
  if (!concludes(recorded)) {
    audit.unreproduced.push({
      label,
      group,
      technique,
      targets,
      instead: recorded,
    });
    return;
  }
  const inPremise = new Set(cells);
  const reset = new Set(replay.changedBefore(group).filter((c) => !inPremise.has(c)));
  if (reset.size === 0) audit.vacuous++;
  const applied: FiringChange[] = [];
  for (;;) {
    const changes = replay.refire(group, reset, applied);
    if (concludes(changes)) {
      const widened = replay.widened(group, reset, applied).length;
      audit.tested += widened;
      tally.tested += widened;
      audit.kept += reset.size - widened;
      return;
    }
    const at = changes.map((c) => c.y * w + c.x);
    if (at.length > 0 && at.every((c) => reset.has(c))) {
      applied.push(...changes);
      continue;
    }
    audit.findings.push({
      label,
      group,
      technique,
      reason,
      targets,
      premise: cells,
      reset: [...reset].sort((a, b) => a - b),
      instead: changes,
    });
    return;
  }
}
