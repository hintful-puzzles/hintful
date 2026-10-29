/**
 * The answer check from a description (design.md § "The answer check"): the
 * rules evaluated on a full board, and every answer of a dealt board found by
 * a search that knows the rules and nothing else.
 */

import type { Expr } from "../../src/describe/expr.ts";
import type { Instance } from "./description.ts";
import { type Board, evaluate, satisfiable, UNDECIDED } from "./evaluate.ts";
import type { Elem, Value } from "./space.ts";

/** One ground rule: a rule's outermost `forall` bound, or one dealt clue. */
export interface RuleInstance {
  label: string;
  expr: Expr;
  env: ReadonlyMap<string, Value>;
  /** A unit of the library's `latin`, which the search propagates natively. */
  latinUnit: Elem[] | null;
}

export function ruleInstances(inst: Instance): RuleInstance[] {
  const out: RuleInstance[] = [];
  const ctx = inst.ctx({ value: () => null, cand: () => [] }, false);
  const cellsOf = inst.space.fns.get("cells");
  if (cellsOf === undefined) throw new Error("no cells()");
  for (const rule of inst.d.rules) {
    const e = rule.expr;
    if (e.k === "call" && e.fn === "latin") {
      const units = evaluate(e.args[1], new Map(), ctx);
      if (!Array.isArray(units)) throw new TypeError("latin over a non-set");
      for (const u of units) {
        const cells = cellsOf([u]) as Elem[];
        out.push({
          label: `${rule.name}: ${(u as Elem).label}`,
          expr: {
            k: "agg",
            fn: "distinct",
            binders: [
              {
                name: "$c",
                kind: "in",
                of: { k: "name", name: "$cells" },
                where: null,
              },
            ],
            where: null,
            term: { k: "call", fn: "value", args: [{ k: "name", name: "$c" }] },
          },
          env: new Map<string, Value>([["$cells", cells]]),
          latinUnit: cells,
        });
      }
      continue;
    }
    if (
      e.k === "quant" &&
      e.q === "forall" &&
      e.binders.length === 1 &&
      e.binders[0].kind === "in"
    ) {
      const b = e.binders[0];
      const xs = evaluate(b.of, new Map(), ctx);
      if (Array.isArray(xs)) {
        for (const x of xs) {
          const env = new Map<string, Value>([[b.name, x]]);
          if (b.where !== null && evaluate(b.where, env, ctx) !== true) continue;
          out.push({
            label: `${rule.name}: ${String((x as Elem).label ?? x)}`,
            expr: e.body,
            env,
            latinUnit: null,
          });
        }
        continue;
      }
    }
    out.push({ label: rule.name, expr: e, env: new Map(), latinUnit: null });
  }
  for (const [kind, list] of inst.clues) {
    const means = inst.d.clueKinds.get(kind)?.means;
    if (means === undefined) throw new Error(`no meaning for ${kind}`);
    for (const k of list) {
      const c = inst.clueOf.get(k);
      if (c === undefined) throw new Error("a clue with no record");
      out.push({
        label: k.label,
        expr: means,
        env: new Map([
          ["at", c.at],
          ["v", c.v],
        ]),
        latinUnit: null,
      });
    }
  }
  return out;
}

function fullBoard(values: ArrayLike<number>): Board {
  return {
    value: (c) => (values[c.id] === 0 ? null : values[c.id]),
    cand: (c) => (values[c.id] === 0 ? [] : [values[c.id]]),
  };
}

/** The rule instances a full board breaks; none is solved. A cell with no
 * value breaks the answer's shape, as a value outside the domain does. */
export function brokenRules(inst: Instance, values: ArrayLike<number>): string[] {
  const out: string[] = [];
  for (const c of inst.space.cells)
    if (!inst.domain.includes(values[c.id])) out.push(`answer ${c.label}`);
  if (out.length > 0) return out;
  const ctx = inst.ctx(fullBoard(values), true);
  for (const r of ruleInstances(inst))
    if (evaluate(r.expr, r.env, ctx) !== true) out.push(r.label);
  return out;
}

export interface SearchResult {
  answers: number[][];
  /** Nodes the search visited. */
  nodes: number;
  /** Whether a rule instance ran out of tries somewhere; the answers are
   * then still answers, and the count is still exact, since every leaf is
   * checked whole. */
  undecided: boolean;
}

/**
 * Every answer of the dealt board, up to `limit`. The search assigns a cell
 * of fewest candidates, keeps `latin`'s units distinct (a placed value struck
 * from its unit, a value with one place left placed), and refuses a partial
 * board on which some rule instance cannot be satisfied by any completion of
 * the cells it reads. Every full board is checked against every rule.
 */
export function searchAnswers(
  inst: Instance,
  limit = 2,
  nodeBudget = 2_000_000,
): SearchResult {
  const n = inst.space.cells.length;
  const dom = inst.domain;
  const all = dom.reduce((m, v) => m | (1 << v), 0);
  const rules = ruleInstances(inst);
  const latinUnits = rules.flatMap((r) =>
    r.latinUnit === null ? [] : [r.latinUnit.map((c) => c.id)],
  );
  const others = rules.filter((r) => r.latinUnit === null);
  const unitsOf: number[][] = Array.from({ length: n }, () => []);
  latinUnits.forEach((u, i) => {
    for (const c of u) unitsOf[c].push(i);
  });
  const latinPeers: Set<number>[] = Array.from({ length: n }, (_, c) => {
    const s = new Set<number>();
    for (const u of unitsOf[c]) for (const d of latinUnits[u]) if (d !== c) s.add(d);
    return s;
  });
  // The cells each other instance has been seen to read, learned as it runs.
  const scope: Set<number>[] = others.map(() => new Set());
  const touching: number[][] = Array.from({ length: n }, () => []);

  const values = new Int32Array(n);
  const masks = new Int32Array(n).fill(all);
  const answers: number[][] = [];
  let nodes = 0;
  let undecided = false;

  const bits = (m: number): number[] => dom.filter((v) => m & (1 << v));
  const board: Board = {
    value: (c) => (values[c.id] === 0 ? null : values[c.id]),
    cand: (c) => bits(masks[c.id]),
  };
  const ctx = inst.ctx(board, true);
  const domain = (c: Elem): number[] => {
    return bits(masks[c.id]);
  };

  type Trail = [number, number, number][];
  const assign = (c: number, v: number, trail: Trail, queue: number[]): boolean => {
    if (!(masks[c] & (1 << v))) return false;
    trail.push([c, values[c], masks[c]]);
    values[c] = v;
    masks[c] = 1 << v;
    queue.push(c);
    return true;
  };
  const strike = (c: number, v: number, trail: Trail, queue: number[]): boolean => {
    if (!(masks[c] & (1 << v))) return true;
    trail.push([c, values[c], masks[c]]);
    masks[c] &= ~(1 << v);
    if (masks[c] === 0) return false;
    if (values[c] === 0 && (masks[c] & (masks[c] - 1)) === 0) {
      const only = dom.find((x) => masks[c] === 1 << x) ?? 0;
      return assign(c, only, trail, queue);
    }
    return true;
  };
  const instanceOk = (i: number): boolean => {
    const r = others[i];
    const seen = scope[i];
    const res = satisfiable(r.expr, r.env, ctx, (c, tried) => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        touching[c.id].push(i);
      }
      // A completion keeps `latin`'s units distinct too, so a clue's line is
      // tried only with values its row or column leaves.
      const taken = new Set<number>();
      for (const [d, v] of tried) if (latinPeers[c.id].has(d.id)) taken.add(v);
      return domain(c).filter((v) => !taken.has(v));
    });
    if (res === UNDECIDED) {
      undecided = true;
      return true;
    }
    return res;
  };
  const propagate = (queue: number[], trail: Trail): boolean => {
    const dirty = new Set<number>();
    while (queue.length > 0) {
      const c = queue.pop() as number;
      const v = values[c];
      for (const u of unitsOf[c])
        for (const d of latinUnits[u])
          if (d !== c && !strike(d, v, trail, queue)) return false;
      for (const i of touching[c]) dirty.add(i);
      if (queue.length === 0) {
        // Hidden singles in the latin units, and a value with no place left.
        for (const u of latinUnits) {
          if (u.length !== dom.length) continue;
          for (const x of dom) {
            let place = -1;
            let count = 0;
            for (const d of u)
              if (masks[d] & (1 << x)) {
                place = d;
                count++;
              }
            if (count === 0) return false;
            if (count === 1 && values[place] === 0 && !assign(place, x, trail, queue))
              return false;
          }
        }
      }
      if (queue.length === 0)
        for (const i of dirty) {
          dirty.delete(i);
          if (!instanceOk(i)) return false;
        }
    }
    return true;
  };
  const undo = (trail: Trail): void => {
    for (let i = trail.length - 1; i >= 0; i--) {
      const [c, v, m] = trail[i];
      values[c] = v;
      masks[c] = m;
    }
  };

  const search = (): void => {
    if (answers.length >= limit || ++nodes > nodeBudget) return;
    let best = -1;
    let bestCount = Infinity;
    for (let c = 0; c < n; c++) {
      if (values[c] !== 0) continue;
      const k = bits(masks[c]).length;
      if (k < bestCount) {
        best = c;
        bestCount = k;
      }
    }
    if (best < 0) {
      const full = Array.from(values);
      if (brokenRules(inst, full).length === 0) answers.push(full);
      return;
    }
    for (const v of bits(masks[best])) {
      const trail: Trail = [];
      const queue: number[] = [];
      if (assign(best, v, trail, queue) && propagate(queue, trail)) search();
      undo(trail);
      if (answers.length >= limit) return;
    }
  };

  const trail: Trail = [];
  const queue: number[] = [];
  let ok = true;
  for (let c = 0; c < n; c++)
    if (inst.givens[c] !== 0 && !assign(c, inst.givens[c], trail, queue)) ok = false;
  // Every instance is checked once at the start, which also learns its scope.
  if (ok) for (let i = 0; i < others.length && ok; i++) ok = instanceOk(i);
  if (ok && propagate(queue, trail)) search();
  if (nodes > nodeBudget) undecided = true;
  return { answers, nodes, undecided };
}
