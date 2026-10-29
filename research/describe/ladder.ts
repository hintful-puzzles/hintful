/**
 * The stated techniques run as a game's ladder (design.md § "The ladder"):
 * at a tier cap, every technique of that tier and below, lowest tier first,
 * until none changes the marks.
 */

import type { Technique } from "../../src/describe/description.ts";
import type { Instance } from "./description.ts";
import { type Board, bindings, evaluate, type Fact } from "./evaluate.ts";

/** Marks by cell index: a value (0 is none) and a candidate bitmask, bit
 * `1 << v`. */
export interface Marks {
  values: Int32Array;
  masks: Int32Array;
}

export interface Firing {
  technique: string;
  tier: number;
  /** The facts that changed the marks. */
  facts: Fact[];
}

export interface LadderResult {
  marks: Marks;
  /** The highest tier that changed the marks, or -1. */
  grade: number;
  solved: boolean;
  impossible: boolean;
  firings: Firing[];
}

export function givenMarks(inst: Instance): Marks {
  const n = inst.space.cells.length;
  const all = inst.domain.reduce((m, v) => m | (1 << v), 0);
  const values = new Int32Array(n);
  const masks = new Int32Array(n).fill(all);
  for (let c = 0; c < n; c++)
    if (inst.givens[c] !== 0) {
      values[c] = inst.givens[c];
      masks[c] = 1 << inst.givens[c];
    }
  return { values, masks };
}

function boardOf(inst: Instance, m: Marks): Board {
  return {
    value: (c) => (m.values[c.id] === 0 ? null : m.values[c.id]),
    cand: (c) => inst.domain.filter((v) => m.masks[c.id] & (1 << v)),
  };
}

/** Every fact one technique concludes on these marks, or `"contradiction"`
 * where a binding's conclusion is false. */
export function fire(inst: Instance, t: Technique, m: Marks): Fact[] | "contradiction" {
  const each = fireEach(inst, t, m);
  return each === "contradiction" ? each : each.flat();
}

/** The facts of each binding of a technique whose premise holds: one entry a
 * firing, as a hint would narrate it. A conclusion that is false proves the
 * marks inconsistent. */
export function fireEach(
  inst: Instance,
  t: Technique,
  m: Marks,
): Fact[][] | "contradiction" {
  const out: Fact[][] = [];
  const base = inst.ctx(boardOf(inst, m), false);
  let contradiction = false;
  bindings(t.binders, new Map(), base, (env) => {
    if (t.premise !== null && evaluate(t.premise, env, base) !== true) return true;
    const facts: Fact[] = [];
    if (evaluate(t.conclude, env, { ...base, facts }) === false) {
      contradiction = true;
      return false;
    }
    out.push(facts);
    return true;
  });
  return contradiction ? "contradiction" : out;
}

/** Apply the facts; returns those that changed something, or `null` on a
 * contradiction. */
function apply(m: Marks, facts: readonly Fact[]): Fact[] | null {
  const changed: Fact[] = [];
  for (const f of facts) {
    const c = f.cell.id;
    const bit = 1 << f.d;
    if (f.k === "strike") {
      if (!(m.masks[c] & bit)) continue;
      m.masks[c] &= ~bit;
      if (m.masks[c] === 0) return null;
      changed.push(f);
    } else {
      if (m.values[c] === f.d) continue;
      if (m.values[c] !== 0 || !(m.masks[c] & bit)) return null;
      m.values[c] = f.d;
      m.masks[c] = bit;
      changed.push(f);
    }
  }
  return changed;
}

export function runLadder(
  inst: Instance,
  cap: number,
  start: Marks = givenMarks(inst),
): LadderResult {
  const m: Marks = { values: start.values.slice(), masks: start.masks.slice() };
  const ts = inst.d.techniques
    .filter((t) => t.tier <= cap)
    .sort((a, b) => a.tier - b.tier);
  const firings: Firing[] = [];
  let grade = -1;
  let impossible = false;
  outer: for (;;) {
    for (const t of ts) {
      const facts = fire(inst, t, m);
      const changed = facts === "contradiction" ? null : apply(m, facts);
      if (changed === null) {
        impossible = true;
        break outer;
      }
      if (changed.length > 0) {
        firings.push({ technique: t.id, tier: t.tier, facts: changed });
        grade = Math.max(grade, t.tier);
        continue outer;
      }
    }
    break;
  }
  const solved = !impossible && m.values.every((v) => v !== 0);
  return { marks: m, grade, solved, impossible, firings };
}
