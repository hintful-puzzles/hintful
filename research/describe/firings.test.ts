/**
 * Task 2.2's second half, the differential check: every firing of the game's
 * recording solver, which is what each of its hint steps narrates, read
 * against the technique stated under the firing's rung, fired on the same
 * marks. Writes `results-firings.txt`.
 *
 * A firing is **covered** when the stated technique concludes every mark it
 * changes, and **matched** when one binding of the technique concludes
 * exactly those marks: one firing, one statement.
 */
import { describe, expect, it } from "vitest";
import type { DeductionRecord } from "../../src/engine/deduction-record.ts";
import { adjacentBinding, type Binding, unequalBinding } from "./bindings.ts";
import type { Instance } from "./description.ts";
import type { Fact } from "./evaluate.ts";
import { fireEach, givenMarks, type Marks } from "./ladder.ts";
import { deal, label, progress, seedsPerParams, writeResult } from "./pilot.ts";

const SEEDS = seedsPerParams(3);

/** The recording solver writes one reason for a single, naked or hidden. */
const RUNGS: Record<string, string[]> = { single: ["single", "hiddenSingle"] };

interface Tally {
  boards: number;
  firings: number;
  covered: number;
  matched: number;
  byRung: Map<string, { firings: number; covered: number; matched: number }>;
  misses: string[];
}

const key = (f: Fact): string => `${f.k} ${f.cell.label} ${f.d}`;

/** The facts that change these marks. */
function live(m: Marks, facts: readonly Fact[]): Fact[] {
  return facts.filter((f) =>
    f.k === "strike"
      ? (m.masks[f.cell.id] & (1 << f.d)) !== 0
      : m.values[f.cell.id] === 0,
  );
}

function applyFacts(m: Marks, facts: readonly Fact[]): void {
  for (const f of facts) {
    if (f.k === "strike") m.masks[f.cell.id] &= ~(1 << f.d);
    else {
      m.values[f.cell.id] = f.d;
      m.masks[f.cell.id] = 1 << f.d;
    }
  }
}

function factOf(inst: Instance, w: number, r: DeductionRecord): Fact {
  return {
    k: r.kind === "place" ? "place" : "strike",
    cell: inst.space.cells[r.y * w + r.x],
    d: r.n,
  };
}

/** Whether a stated technique under one of `rungs` concludes `facts`: some
 * binding exactly, or the bindings between them. */
function judge(
  inst: Instance,
  rungs: string[],
  m: Marks,
  facts: Fact[],
): { covered: boolean; matched: boolean } {
  const want = new Set(facts.map(key));
  const concluded = new Set<string>();
  let matched = false;
  for (const t of inst.d.techniques) {
    if (!t.rungs.some((r) => rungs.includes(r))) continue;
    for (const each of fireEach(inst, t, m)) {
      const got = live(m, each).map(key);
      for (const k of got) concluded.add(k);
      if (got.length === want.size && got.every((k) => want.has(k))) matched = true;
    }
  }
  return { covered: [...want].every((k) => concluded.has(k)), matched };
}

function compare<P, S>(b: Binding<P, S>, t: Tally): void {
  const own = b.ownFirings;
  if (own === undefined) throw new Error("no recording solver");
  for (const params of b.params)
    for (let i = 0; i < SEEDS; i++) {
      const seed = `describe ${i}`;
      const board = deal(b, params, seed);
      if (board === null) break;
      const { state, inst } = board;
      const where = `${label(b, params)} seed "${seed}"`;
      const w = inst.space.names.get("w") as number;
      t.boards++;
      // The solver's marks once its givens are placed, each struck from its
      // row and column, before it records anything.
      const m = givenMarks(inst);
      const placed = inst.d.techniques.find((x) => x.rungs.includes("dup"));
      if (placed === undefined)
        throw new Error("no technique for a placement's strikes");
      applyFacts(m, fireEach(inst, placed, m).flat());
      const records = own(state, inst.d.tiers.length - 2);
      for (let k = 0; k < records.length; ) {
        const group = records[k].group;
        const firing: DeductionRecord[] = [];
        while (k < records.length && records[k].group === group)
          firing.push(records[k++]);
        // A firing that places a value strikes it from its peers as it does,
        // and those strikes are the placement's, judged once it is made.
        const dupOf = (r: DeductionRecord) =>
          (r.reason as { kind: string }).kind === "dup";
        const own_ = firing.filter((r) => !dupOf(r));
        const dups = firing.filter(dupOf);
        if (own_.length > 0) {
          // One firing may record under two rungs: an Unequal sign strikes at
          // its larger end as "greater" and its smaller as "lesser".
          const kinds = [
            ...new Set(own_.map((r) => (r.reason as { kind: string }).kind)),
          ];
          const rung = kinds.join("+");
          const facts = own_.map((r) => factOf(inst, w, r));
          const verdict = judge(
            inst,
            kinds.flatMap((k) => RUNGS[k] ?? [k]),
            m,
            live(m, facts),
          );
          t.firings++;
          const row = t.byRung.get(rung) ?? { firings: 0, covered: 0, matched: 0 };
          row.firings++;
          if (verdict.covered) {
            t.covered++;
            row.covered++;
          } else
            t.misses.push(
              `${where}: a "${rung}" firing (${facts.map(key).join(", ")}) not concluded`,
            );
          if (verdict.matched) {
            t.matched++;
            row.matched++;
          }
          t.byRung.set(rung, row);
          applyFacts(m, facts);
        }
        if (dups.length > 0) {
          const facts = dups.map((r) => factOf(inst, w, r));
          const verdict = judge(inst, ["dup"], m, live(m, facts));
          if (!verdict.covered)
            t.misses.push(
              `${where}: a placement's strikes (${facts.map(key).join(", ")}) not concluded`,
            );
          applyFacts(m, facts);
        }
      }
      progress(`${where}: ${records.length} records compared`);
    }
}

describe("the recording solver's firings, read against the stated techniques", () => {
  it("are each concluded by the technique stated under the firing's rung", () => {
    const lines = [`Seeds per params: ${SEEDS}.`, ""];
    const all: string[] = [];
    for (const b of [unequalBinding, adjacentBinding] as Binding<unknown, unknown>[]) {
      const t: Tally = {
        boards: 0,
        firings: 0,
        covered: 0,
        matched: 0,
        byRung: new Map(),
        misses: [],
      };
      compare(b, t);
      lines.push(
        `${b.description.game}: ${t.boards} boards; ${t.covered} of ${t.firings} firings covered, ` +
          `${t.matched} matched by one binding`,
        `  by rung (firings, covered, matched): ${[...t.byRung].map(([r, x]) => `${r} ${x.firings}/${x.covered}/${x.matched}`).join(", ")}`,
      );
      for (const u of t.misses.slice(0, 30)) lines.push(`  ${u}`);
      if (t.misses.length > 30) lines.push(`  … and ${t.misses.length - 30} more`);
      all.push(...t.misses);
    }
    writeResult("results-firings.txt", `${lines.join("\n")}\n`);
    expect(all).toEqual([]);
  });
});
