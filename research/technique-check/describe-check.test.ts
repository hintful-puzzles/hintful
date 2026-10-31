/**
 * Every technique the app compiles, checked sound against its description's
 * rules (`describe-check.ts`), and a planted defect in each that must come
 * out unsound. Writes `results-describe.txt`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  isFormal,
  isLibrary,
  loadDescription,
  type Technique,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  CHECKED_ORDERS,
  gameFingerprint,
  libraryFingerprint,
  soundnessKey,
} from "../../src/describe/soundness.ts";
import {
  checkTechnique,
  libraryDescription,
  planted,
  type Verdict,
} from "./describe-check.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The orders each is checked at: 4 is the least a set or fish of two fits. */
const ORDERS = CHECKED_ORDERS;

/** Planted defects: one condition loosened in each, so each claims a strike
 * or a contradiction the rules do not force. A loosening that only makes a
 * technique strike less, or that drops a condition consistency already
 * gives, is not a defect, and the checker rightly calls it sound. */
const PLANTS: Record<string, { conclude?: string; for?: string }> = {
  placed: { conclude: "forall p in cells(col(c)): strike(p, value(c))" },
  hiddenSingle: {
    for: "u in units, placed = set(value(c) over c in cells(u) where known(c)), d in domain - placed, n = count(c in cells(u) where d in cand(c)) where n < 3",
    conclude: "n >= 1 and place(first({c in cells(u) where d in cand(c)}), d)",
  },
  single: {
    for: "L in cols, c in cells(L) where not known(c) and |cand(c)| < 3",
    conclude: "place(c, first(cand(c)))",
  },
  set: {
    conclude:
      "(|T| > 0 or (forall c in cells(u): |cand(c)| > 0)) and |S| >= |V| - |T| and (forall c in open where c not in S, d in V - T where d in cand(c): strike(c, d))",
    for: "u in units, V = domain - set(value(c) over c in cells(u) where known(c)), open = {c in cells(u) where not known(c)}, T in subsets(V) where |T| = 0 or (2 <= |T| and |T| <= |V| - 2), S = {c in open where not (exists d in T: d in cand(c))} where |S| >= |V| - |T| - 1",
  },
  fish: {
    for: "d in domain, X0 = {L in cols where not (exists c in cells(L): value(c) = d)}, Y0 = range(0, h - 1) - set(y(c) over c in cells where value(c) = d), T in subsets(Y0) where |T| = 0 or (2 <= |T| and |T| <= |X0| - 2), X = {L in X0 where not (exists c in cells(L): y(c) in T and d in cand(c))} where |X| >= |X0| - |T| - 1",
    conclude:
      "(|T| > 0 or (forall L in cols: exists c in cells(L): d in cand(c))) and (forall L in X0 - X, c in cells(L) where y(c) in Y0 - T and d in cand(c): strike(c, d))",
  },
  wing: {
    for: "m in cells where not known(m), x in domain, R = cand(m) - {x} where |R| >= 1 and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x}), k0 in peers(m) where not known(k0) and cand(k0) = {min(a in R), x}, t in peers(k0) where t != m and not known(t) and x in cand(t) and (forall a in R: exists k in peers(m): not known(k) and cand(k) = {a, x} and k != t and k in peers(t)), E = set(first({k in peers(m) where not known(k) and cand(k) = {a, x} and k != t and k in peers(t)}) over a in R)",
  },
  sign: {
    conclude:
      "forall d in domain: ((forall d2 in cand(small): d <= d2 + 1) implies strike(big, d)) and ((forall d2 in cand(big): d >= d2) implies strike(small, d))",
  },
  adjacent: {
    conclude: "forall d in cand(b) where fits(e, value(a), d): strike(b, d)",
  },
  associativity: {
    conclude:
      "((known(l) and value(l) in cand(r)) implies place(r, value(q))) and ((known(r) and value(r) in cand(l)) implies place(l, value(r)))",
  },
  identity: {
    for: "w0 = first({c in cells where known(c)}) where w0 != none, e in domain where (value(w0) = left(w0) and e = right(w0)) or (value(w0) != left(w0) and e = left(w0))",
  },
  notIdentity: {
    for: "a in domain, o = min(j in domain where known(mul(j, a)) or (known(mul(a, j)) and value(mul(a, j)) != j)) where o != none",
  },
  facing: {
    conclude:
      "forall s in P, c = nth(sight(s), clue(sees, s)): w in cand(c) and place(c, w)",
  },
  bounds: {
    conclude:
      "(near implies (forall h in short(L, far(L, R)): strike(c0, h))) and (near or (forall K = (domain - P) + set(value(c) over c in L where known(c) and not (exists c2 in before(c, L): value(c2) > value(c) + 1)), i in domain, h = w + 1 - i where h in K, j in range(0, v - |K - range(1, h)| - 1): strike(nth(L, j), h)))",
  },
  arrangement: {
    conclude:
      "forall d in cand(c) where not (exists fill f of L from cand where distinct(f(x) over x in L) and f(c) = d: seen(f, L) = v + 1): strike(c, d)",
  },
  adjacentSet: {
    conclude:
      "forall d in cand(b) where exists d2 in cand(a): d2 != d and not fits(e, d2, d): strike(b, d)",
  },
};

const lines: string[] = [];
const line = (where: string, v: Verdict, want: string): void => {
  const ok = v.verdict === want;
  const s = `${ok ? "ok " : "BAD"} ${where.padEnd(10)} ${v.technique.padEnd(30)} ${String(v.order).padEnd(2)} ${v.verdict.padEnd(8)} (want ${want.padEnd(8)}) ${String(v.queries).padStart(5)} queries ${v.seconds.toFixed(1).padStart(6)}s${v.at ? `   at ${v.at}` : ""}`;
  console.log(s);
  lines.push(s);
};

async function checkAll(
  where: string,
  d: ReturnType<typeof loadDescription>,
  ts: readonly Technique[],
) {
  const bad: string[] = [];
  for (const t of ts) {
    const name = t.id.includes(".") ? t.id.slice(t.id.indexOf(".") + 1) : t.id;
    for (const order of ORDERS) {
      const v = await checkTechnique(d, t, order);
      line(where, v, "sound");
      if (v.verdict !== "sound") bad.push(`${t.id} ${order}`);
      const plant = PLANTS[name];
      if (plant === undefined) continue;
      if (order === 3 && (name === "set" || name === "fish")) continue;
      const p = await checkTechnique(d, planted(t, plant), order);
      line(where, p, "unsound");
      if (p.verdict !== "unsound") bad.push(`${t.id} planted ${order}`);
    }
  }
  return bad;
}

it("the techniques the app compiles are sound, and each planted defect is not", async () => {
  const bad: string[] = [];
  const verdicts: Record<string, string> = {};
  const sources = globSync("src/**/*.description.yaml", { cwd: ROOT }).sort();
  const files = new Map(
    sources.map((s) => [
      s,
      loadDescriptionFile(readFileSync(`${ROOT}${s}`, "utf8"), s),
    ]),
  );
  const libraries = [...files.values()].filter(isLibrary);
  for (const [source, file] of files) {
    if (isLibrary(file)) {
      const library = libraryDescription(file);
      const failed = await checkAll(file.library, library.d, library.techniques);
      bad.push(...failed);
      for (const id of Object.keys(file.techniques))
        if (!failed.some((f) => f.startsWith(`${id} `)))
          verdicts[soundnessKey(source, id)] = libraryFingerprint(file, id);
      continue;
    }
    if (!isFormal(file) || file.techniques === undefined) continue;
    const d = loadDescription(file, libraries);
    const own = d.techniques.filter((t) => !t.id.includes("."));
    const failed = await checkAll(file.game, d, own);
    bad.push(...failed);
    for (const stated of file.techniques)
      if (!("use" in stated) && !failed.some((f) => f.startsWith(`${stated.id} `)))
        verdicts[soundnessKey(source, stated.id)] = gameFingerprint(file, stated);
  }
  writeFileSync(
    fileURLToPath(new URL("results-describe.txt", import.meta.url)),
    `${lines.join("\n")}\n`,
  );
  // Only the planted defects may fail; a verdict is recorded only for a
  // technique found sound.
  writeFileSync(
    `${ROOT}src/describe/soundness.json`,
    `${JSON.stringify(Object.fromEntries(Object.entries(verdicts).sort()), null, 2)}\n`,
  );
  expect(bad).toEqual([]);
});
