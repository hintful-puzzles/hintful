/**
 * How often a hint plan leaves the ground its previous step worked on while a
 * firing that continued it was available — the instrument behind
 * `sequence-hints-in-cell-games` (`findings.md`), kept as the guard for
 * `HintFrontier`.
 *
 * It reads a plan from the outside, through nothing but what every
 * candidate-elimination step carries, so it cannot share a blind spot with the
 * game's own candidate lists:
 *
 * - **a firing** is a journey (an unflagged step and its `continuesPrevious`
 *   legs);
 * - **what it wrote** is diffed off the state across its steps, never read off
 *   the move, so it cannot disagree with the board;
 * - **what it read** is its steps' `area ∪ hatch ∪ targets`, the premise the
 *   hint shows,
 *   narrowed for a placement to the placed value along its evidence (a hidden 7
 *   in a row reads only the row's 7s);
 * - **a candidate** at a position is a later firing of the same plan that reads
 *   nothing written between the two, so it was available then (Loopy's
 *   definition in `order-hints-from-the-frontier`);
 * - **a firing continues** another when it reads a cell the other wrote.
 *
 * Populate and the obvious-clean opening read the whole board and are set
 * aside, as is anything else with no evidence and several targets.
 *
 * Dev/test-only.
 */
import type { AnyGame } from "./enrollment.ts";

type Pt = { x: number; y: number };

interface Firing {
  wCells: Set<number>;
  wPairs: Set<string>;
  area: Set<number>;
  targets: Set<number>;
  bookkeeping: boolean;
  /** The value a placement puts down, or `null` for a strike. */
  placed: number | null;
  digits: Set<number>;
}

function typedArrays(
  s: Record<string, unknown>,
  n: number,
): [string, ArrayLike<number>][] {
  return Object.entries(s).filter(
    ([, v]) =>
      ArrayBuffer.isView(v) && (v as unknown as ArrayLike<number>).length === n,
  ) as [string, ArrayLike<number>][];
}

function firingsOf(
  game: AnyGame,
  state0: Record<string, unknown>,
  steps: readonly {
    move: unknown;
    continuesPrevious?: boolean;
    highlights?: unknown;
  }[],
): Firing[] {
  const n = (state0["grid"] as ArrayLike<number>).length;
  const w = Math.round(Math.sqrt(n));
  const cell = (p: Pt): number | null =>
    p.x >= 0 && p.y >= 0 && p.x < w && p.y < w ? p.y * w + p.x : null;
  const firings: Firing[] = [];
  let state = state0;
  for (const s of steps) {
    const hl = (s.highlights ?? {}) as { area?: Pt[]; hatch?: Pt[]; targets?: Pt[] };
    // The line a step hatches is read as much as the cells it outlines.
    const read = [...(hl.area ?? []), ...(hl.hatch ?? [])];
    let f = firings[firings.length - 1];
    if (!s.continuesPrevious || !f) {
      const area = read.filter((p) => cell(p) !== null);
      const targets = new Set((hl.targets ?? []).map(cell).filter((c) => c !== null));
      f = {
        wCells: new Set(),
        wPairs: new Set(),
        area: new Set(),
        targets: new Set(),
        bookkeeping:
          (s.move as { type?: string }).type === "pencilAll" ||
          (area.length === 0 && targets.size > 1),
        placed: null,
        digits: new Set(),
      };
      firings.push(f);
    }
    const first = f.wCells.size === 0;
    for (const p of read) {
      const c = cell(p);
      if (c !== null) f.area.add(c);
    }
    for (const p of hl.targets ?? []) {
      const c = cell(p);
      if (c !== null) f.targets.add(c);
    }
    const next = game.executeMove(state, s.move) as Record<string, unknown>;
    const after = new Map(typedArrays(next, n));
    for (const [key, a] of typedArrays(state, n)) {
      const b = after.get(key);
      if (!b) continue;
      for (let i = 0; i < n; i++) {
        if (a[i] === b[i]) continue;
        f.wCells.add(i);
        if (key === "pencil") {
          const diff = a[i] ^ b[i];
          for (let d = 0; d < 31; d++)
            if (diff & (1 << d)) {
              f.wPairs.add(`${i}:${d}`);
              f.digits.add(d);
            }
        } else {
          f.wPairs.add(`${i}:*`);
          if (key === "grid" && b[i] > 0) {
            f.digits.add(b[i]);
            if (first && f.placed === null) f.placed = b[i];
          }
        }
      }
    }
    state = next;
  }
  return firings;
}

/** Does `f` read anything `by` wrote? */
function reads(f: Firing, by: Firing | { wCells: Set<number>; wPairs: Set<string> }) {
  for (const c of f.targets) if (by.wCells.has(c)) return true;
  for (const c of f.area) {
    if (f.placed === null) {
      if (by.wCells.has(c)) return true;
    } else if (by.wPairs.has(`${c}:*`)) return true;
    else for (const d of f.digits) if (by.wPairs.has(`${c}:${d}`)) return true;
  }
  return false;
}

export interface Continuity {
  /** Positions measured: firings after the first, bookkeeping aside. */
  positions: number;
  /** Positions whose firing reads nothing the previous firing wrote. */
  jumps: number;
  /** Of those, the ones where an available firing did read it. */
  avoidable: number;
}

/** The plan `game.hint` gives for `state`, walked and measured. */
export function planContinuity(game: AnyGame, state: unknown): Continuity {
  const res = game.hint?.(state);
  if (!res?.ok) return { positions: 0, jumps: 0, avoidable: 0 };
  const firings = firingsOf(game, state as Record<string, unknown>, res.steps);
  const out: Continuity = { positions: 0, jumps: 0, avoidable: 0 };
  // Bookkeeping is never a position or a candidate, but what it writes still
  // stands between a position and a later firing.
  let prev: Firing | null = null;
  for (let k = 0; k < firings.length; k++) {
    const fk = firings[k];
    if (fk.bookkeeping) continue;
    const before = prev;
    prev = fk;
    if (before === null) continue;
    out.positions++;
    if (reads(fk, before)) continue;
    out.jumps++;
    const between = { wCells: new Set(fk.wCells), wPairs: new Set(fk.wPairs) };
    for (let j = k + 1; j < firings.length; j++) {
      const fj = firings[j];
      if (!fj.bookkeeping && !reads(fj, between) && reads(fj, before)) {
        out.avoidable++;
        break;
      }
      for (const c of fj.wCells) between.wCells.add(c);
      for (const p of fj.wPairs) between.wPairs.add(p);
    }
  }
  return out;
}
