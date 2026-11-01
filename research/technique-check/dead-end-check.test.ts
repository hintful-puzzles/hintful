/**
 * Every dead-end claim the app compiles, checked sound by searching every
 * position of small boards (`dead-end-check.ts`), and a planted defect beside
 * each that must come out unsound. Records each claim found sound, and that
 * fired on some board, in `src/describe/soundness.json`; writes
 * `results-dead-end.txt`. `GAMES="sixteen twiddle"` narrows it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  isPlanning,
  type PlanningJson,
  planningWith,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  deadEndFingerprint,
  deadEndKey,
  isDeadEndKey,
} from "../../src/describe/soundness.ts";
import { checkWorld, compiled, worldName, worlds } from "./dead-end-check.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/**
 * A defect planted in each claim, which the search must find unsound: a
 * condition dropped that the claim needs, or a quantity it keeps read too
 * finely.
 */
const PLANTED: Record<string, Record<string, string>> = {
  sixteen: {
    // A slide along an even side is an odd permutation.
    parity: `count(a in cells, b in cells where index(a, cells) < index(b, cells) and value(a) > value(b)) mod 2 = 1`,
  },
  fifteen: {
    // The gap's distance from its corner moves with the parity.
    parity: `exists g in cells where value(g) = 0: count(a in cells, b in cells where index(a, cells) < index(b, cells) and value(a) > value(b)) mod 2 != (|cells| - 1) mod 2`,
  },
  pegs: {
    // The last peg on a finished board stands alone.
    frozen: `exists p in cells where grid(p) = 1: forall q in adj4(p): not arrive(q)`,
  },
  twiddle: {
    // A block of even side moves a tile between colors.
    colorOdd: `exists c in cells, v = value(c), lo = below(v), hi = upTo(v), k in {0, 1}: count(d in cells where value(d) = v and shade(d) = k) != homes(lo, hi, k)`,
    // A block of side 2 turns an odd permutation.
    parity: `distinct(value(c) over c in cells) and count(a in cells, b in cells where index(a, cells) < index(b, cells) and value(a) > value(b)) mod 2 = 1`,
    // The tile's turns go with its color.
    colorTurned: `n mod 2 = 0 and exists c in cells, v = value(c), lo = below(v), hi = upTo(v), k in {0, 1}: count(d in cells where value(d) = v and shade(d) = k) != homes(lo, hi, k)`,
    // Four turns of one block add four to the sum.
    turnSum: `n mod 2 = 0 and sum(c in cells of turn(c)) mod 8 != 0`,
  },
};

/** The description with claim `id` replaced by `src`, wherever it is stated. */
function planting(d: PlanningJson, id: string, src: string): PlanningJson {
  if (d.deadEnds?.[id] !== undefined)
    return { ...d, deadEnds: { ...d.deadEnds, [id]: src } };
  const variations = Object.fromEntries(
    Object.entries(d.variations ?? {}).map(([name, v]) => [
      name,
      v.add?.deadEnds?.[id] === undefined
        ? v
        : { ...v, add: { ...v.add, deadEnds: { ...v.add.deadEnds, [id]: src } } },
    ]),
  );
  return { ...d, variations };
}

it("checks every dead-end claim sound, and finds every planted one unsound", async () => {
  const only = process.env["GAMES"]?.split(/[ ,]+/).filter(Boolean) ?? null;
  const sources = globSync("src/games/*/*.description.yaml", { cwd: ROOT }).sort();
  const lines: string[] = [];
  const verdicts: Record<string, string> = {};
  const bad: string[] = [];
  const checked: string[] = [];
  for (const source of sources) {
    const d = loadDescriptionFile(readFileSync(`${ROOT}${source}`, "utf8"), source);
    if (!isPlanning(d) || (only !== null && !only.includes(d.game))) continue;
    checked.push(`${source}#`);
    const claims = planningWith(d, Object.keys(d.variations ?? {})).deadEnds;
    // Nothing to find sound. Flip states none, and its dealt relation is one
    // no world deals (`checkWorld`).
    if (claims.length === 0) {
      lines.push(`${d.game}: states no dead-end claim`);
      continue;
    }
    const ws = worlds(d);
    const run = async (desc: PlanningJson, label: string) => {
      const mod = await compiled(desc, label);
      return ws.map(({ world, layers }) => checkWorld(desc, mod, world, layers));
    };
    const t0 = performance.now();
    const all = await run(d, "stated");
    const seconds = (performance.now() - t0) / 1000;
    const moveless = all.filter((r) => r.moveless).map((r) => worldName(r.world));
    if (moveless.length > 0)
      lines.push(
        `${d.game}: no move on any position, so not checked: ${moveless.join("; ")}`,
      );
    const results = all.filter((r) => !r.moveless);
    for (const r of results) {
      lines.push(
        `${d.game} ${worldName(r.world)}: ${r.positions} positions, ${r.finishable} can finish, ${r.missed} that cannot are claimed by none` +
          (r.broken === null ? "" : `; BROKEN: ${r.broken}`),
      );
      if (r.broken !== null) bad.push(`${d.game} ${worldName(r.world)}: ${r.broken}`);
    }
    for (const { id, src } of claims) {
      let fires = 0;
      let unsound: string | null = null;
      for (const r of results) {
        const c = r.claims.get(id);
        if (c === undefined) continue;
        fires += c.fires;
        if (c.unsound > 0) unsound ??= `${worldName(r.world)} at ${c.witness}`;
        lines.push(
          `  ${id} in ${worldName(r.world)}: holds of ${c.fires}, ${c.unsound} of them can finish`,
        );
      }
      const verdict =
        unsound !== null
          ? `UNSOUND in ${unsound}`
          : fires === 0
            ? "never fires"
            : "sound";
      lines.push(`${d.game} ${id}: ${verdict} (${seconds.toFixed(1)}s for the game)`);
      if (verdict === "sound")
        verdicts[deadEndKey(source, id)] = deadEndFingerprint(d, src);
      else bad.push(`${d.game} ${id}: ${verdict}`);
      const plant = PLANTED[d.game]?.[id];
      if (plant === undefined) {
        bad.push(`${d.game} ${id}: no planted defect`);
        continue;
      }
      const planted = await run(planting(d, id, plant), `planted-${id}`);
      const caught = planted.some(
        (r) => !r.moveless && (r.claims.get(id)?.unsound ?? 0) > 0,
      );
      lines.push(
        `${d.game} ${id} planted: ${caught ? "unsound, as it must be" : "NOT CAUGHT"}`,
      );
      if (!caught) bad.push(`${d.game} ${id}: the planted defect is not caught`);
    }
  }
  writeFileSync(
    fileURLToPath(new URL("results-dead-end.txt", import.meta.url)),
    `${lines.join("\n")}\n`,
  );
  const path = `${ROOT}src/describe/soundness.json`;
  const kept = Object.fromEntries(
    Object.entries(
      JSON.parse(readFileSync(path, "utf8")) as Record<string, string>,
    ).filter(
      ([k]) =>
        !isDeadEndKey(k) || (only !== null && !checked.some((s) => k.startsWith(s))),
    ),
  );
  writeFileSync(
    path,
    `${JSON.stringify(Object.fromEntries(Object.entries({ ...kept, ...verdicts }).sort()), null, 2)}\n`,
  );
  expect(bad).toEqual([]);
});
