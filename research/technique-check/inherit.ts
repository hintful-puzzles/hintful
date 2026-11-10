/**
 * Which of an existing game's stated techniques a candidate inherits: each
 * one stated in the candidate's words or not, and where it is, checked
 * against the candidate's rules (`describe-check.ts`) on the small boards in
 * reach: sound, unsound with the board that shows it, or undecided. What
 * the candidate's rules hold that no technique it inherits reads is listed
 * beside, the rules a port writes techniques for.
 *
 * A technique is in the candidate's words when the compiler builds it from
 * the candidate's description: every clue kind, partition and term it reads
 * is the candidate's. A term the source defines and the candidate does not
 * goes with the technique, part of its statement; one both define is read as
 * the candidate's, a relation of its rules (Seismic's and Tectonic's
 * `clash`).
 */

import { CompileError, compileGame } from "../../src/describe/compile.ts";
import {
  type Definition,
  type DescriptionFile,
  type DescriptionJson,
  isFormal,
  isLibrary,
  type LibraryJson,
  type StatedTechnique,
  withEveryVariation,
} from "../../src/describe/description.ts";
import type { Binder, Expr } from "../../src/describe/expr.ts";
import { CHECK_BUDGET_MS, CHECKED_ORDERS } from "../../src/describe/soundness.ts";
import {
  checkTechnique,
  hasAnswer,
  regionCells,
  SampledBoards,
  sizeLabel,
  sizings,
  type Verdict,
  worldsOf,
} from "./describe-check.ts";

/** A game's or a library's own stated techniques, and the terms it defines. */
export interface Source {
  name: string;
  define: Readonly<Record<string, string>>;
  techniques: readonly (readonly [string, StatedTechnique])[];
}

/** What `file` states of its own, or `null` where it states nothing. A
 * technique a game places from a library is the library's, not the game's. */
export function sourceOf(file: DescriptionFile): Source | null {
  if (isLibrary(file))
    return {
      name: file.library,
      define: {},
      techniques: Object.entries(file.techniques),
    };
  if (!isFormal(file)) return null;
  const every = withEveryVariation(file);
  const own = (every.techniques ?? []).flatMap((t) =>
    "use" in t
      ? []
      : [
          [
            t.id,
            { on: t.on, for: t.for, premise: t.premise, conclude: t.conclude },
          ] as const,
        ],
  );
  if (own.length === 0) return null;
  return { name: file.game, define: every.define ?? {}, techniques: own };
}

/** The sources a candidate is reported against by default: each library its
 * family's games place, and every other game of its family that states
 * techniques of its own. */
export function familySources(
  candidate: DescriptionJson,
  files: readonly DescriptionFile[],
): Source[] {
  const family = files.filter(
    (f): f is DescriptionJson =>
      isFormal(f) && f.family === candidate.family && f.game !== candidate.game,
  );
  const placed = new Set(
    [candidate, ...family].flatMap((f) =>
      (withEveryVariation(f).techniques ?? []).flatMap((t) =>
        "use" in t ? [t.use.split(".")[0]] : [],
      ),
    ),
  );
  return [
    ...files.filter((f) => isLibrary(f) && placed.has(f.library)),
    ...family,
  ].flatMap((f) => sourceOf(f) ?? []);
}

/** The candidate with one technique of `source` as its only one, or why the
 * compiler cannot build it from the candidate's description. */
export function inCandidateWords(
  candidate: DescriptionJson,
  source: Source,
  id: string,
  stated: StatedTechnique,
  libraries: readonly LibraryJson[],
): DescriptionJson | string {
  const own = new Set([
    ...Object.keys(candidate.define ?? {}),
    ...Object.values(candidate.variations ?? {}).flatMap((v) =>
      Object.keys(v.add?.define ?? {}),
    ),
  ]);
  const carried = Object.entries(source.define).filter(([n]) => !own.has(n));
  const tiers = candidate.tiers ?? ["any"];
  const json: DescriptionJson = {
    ...candidate,
    tiers,
    define: { ...Object.fromEntries(carried), ...candidate.define },
    techniques: [{ id, tier: tiers[0], ...stated }],
    variations:
      candidate.variations === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries(candidate.variations).map(([n, v]) => [
              n,
              v.add === undefined
                ? v
                : { ...v, add: { ...v.add, techniques: undefined } },
            ]),
          ),
  };
  try {
    compileGame(json, libraries, `${candidate.game}.description.yaml`, "runtime.ts");
  } catch (e) {
    if (e instanceof CompileError) return e.message;
    throw e;
  }
  return json;
}

/** One technique's verdict in the candidate. */
export type Inherited =
  | { kind: "unstated"; why: string }
  | {
      kind: "sound";
      /** Asked on sampled boards somewhere, not proved on every board. */
      held: boolean;
      boards: string[];
    }
  | { kind: "unsound"; where: string; at: string | null; model: string[] | null }
  | { kind: "undecided"; where: string; why: string }
  | { kind: "unchecked"; why: string };

/** The shares of a board's time by which its whole proof stops; the rest
 * goes to sampled boards. */
const WHOLE = 0.4;

/**
 * `json`'s one technique checked in every world of the candidate, at each
 * order, on each board with an answer, the first unsound board ending it.
 * The technique gets {@link CHECK_BUDGET_MS}, shared among the boards left as
 * each begins, so a quick board leaves its time to the next.
 */
export async function checkInherited(
  json: DescriptionJson,
  libraries: readonly LibraryJson[],
  say: (line: string) => void,
): Promise<Inherited> {
  const id = json.techniques?.[0];
  if (id === undefined || "use" in id) throw new Error("one stated technique");
  const worlds = worldsOf(json, libraries, say);
  const boards: {
    where: string;
    w: (typeof worlds)[number];
    order: number;
    sizes: Map<string, number>;
  }[] = [];
  for (const w of worlds)
    for (const order of CHECKED_ORDERS)
      for (const sizes of sizings(w.d, order))
        boards.push({
          where: [w.where, ...[...sizes].map(([n, v]) => sizeLabel(order, n, v))].join(
            " ",
          ),
          w,
          order,
          sizes,
        });
  const deadline = performance.now() + CHECK_BUDGET_MS;
  const checked: string[] = [];
  let held = false;
  for (const [i, { where, w, order, sizes }] of boards.entries()) {
    const t = w.d.techniques.find((x) => x.id === id.id);
    if (t === undefined) continue;
    const cells = await regionCells(w.d, order, sizes);
    if (!(await hasAnswer(w.d, order, sizes, cells))) continue;
    const start = performance.now();
    const share = (deadline - start) / (boards.length - i);
    let v: Verdict;
    try {
      v = await checkTechnique(w.d, t, order, sizes, 1, cells, {
        deadline: start + share * WHOLE,
        model: true,
      });
      if (v.outOfTime) {
        const s = await new SampledBoards(w.d, order, sizes, cells).ask(
          t,
          1,
          start + share,
          { model: true },
        );
        if (s.asked === 0)
          return {
            kind: "undecided",
            where: `${where} ${order}`,
            why: "no board sampled in time",
          };
        say(
          `..  ${where} ${order} ${id.id}: not proved whole in time, asked on ${s.asked} boards${s.every ? ", every answer" : ""}`,
        );
        held = held || !s.every;
        v = s.v;
      }
    } catch (e) {
      // The checker reads less than the compiler builds, and says so with a
      // plain Error: a verdict it cannot reach, which the report says.
      if (!(e instanceof Error) || e.constructor !== Error) throw e;
      return {
        kind: "undecided",
        where: `${where} ${order}`,
        why: `the checker: ${e.message}`,
      };
    }
    say(
      `${v.verdict.padEnd(8)} ${where.padEnd(24)} ${id.id.padEnd(24)} ${order} ${String(v.queries).padStart(5)} queries ${v.seconds.toFixed(1).padStart(7)}s${v.at ? `   at ${v.at}` : ""}`,
    );
    if (v.verdict === "unsound")
      return {
        kind: "unsound",
        where: `${where} ${order}`,
        at: v.at ?? null,
        model: v.model ?? null,
      };
    if (v.verdict === "unknown")
      return {
        kind: "undecided",
        where: `${where} ${order}`,
        why: "z3 returned unknown",
      };
    checked.push(`${where} ${order}`);
  }
  if (checked.length === 0)
    return {
      kind: "unchecked",
      why: "no board in reach has an answer in a world with the technique",
    };
  return { kind: "sound", held, boards: checked };
}

/** Every name an expression reads: its names and the functions it calls. */
function namesIn(e: Expr | null, out: Set<string>): void {
  if (e === null) return;
  switch (e.k) {
    case "num":
      return;
    case "name":
      out.add(e.name);
      return;
    case "call":
      out.add(e.fn);
      for (const a of e.args) namesIn(a, out);
      return;
    case "set":
      for (const x of e.elems) namesIn(x, out);
      return;
    case "size":
    case "not":
    case "neg":
      namesIn(e.of, out);
      return;
    case "bin":
      namesIn(e.a, out);
      namesIn(e.b, out);
      return;
    case "quant":
      bindersIn(e.binders, out);
      namesIn(e.body, out);
      return;
    case "with":
      namesIn(e.cell, out);
      namesIn(e.value, out);
      namesIn(e.body, out);
      return;
    case "agg":
      bindersIn(e.binders, out);
      namesIn(e.where, out);
      namesIn(e.term, out);
      return;
  }
}

function bindersIn(bs: readonly Binder[], out: Set<string>): void {
  for (const b of bs) {
    namesIn(b.of, out);
    namesIn(b.where, out);
    if (b.from !== undefined) out.add(b.from);
  }
}

/** The names that read every unit at once: a technique reading one reads
 * each partition among the units. */
const EVERY_UNIT = ["units", "units_of", "peers"];

/** The other names a technique reads a line unit by. */
const LINE_NAMES: Readonly<Record<string, readonly string[]>> = {
  rows: ["lines", "row"],
  cols: ["lines", "col"],
};

/**
 * The names a technique reads, the terms it calls followed through `defs`:
 * every clue kind, partition and unit it can reach.
 */
export function readsOf(
  t: { binders: readonly Binder[]; premise: Expr | null; conclude: Expr },
  defs: ReadonlyMap<string, Definition>,
): Set<string> {
  const out = new Set<string>();
  bindersIn(t.binders, out);
  namesIn(t.premise, out);
  namesIn(t.conclude, out);
  const seen = new Set<string>();
  for (let grew = true; grew; ) {
    grew = false;
    for (const n of [...out]) {
      const def = defs.get(n);
      if (def === undefined || seen.has(n)) continue;
      seen.add(n);
      namesIn(def.body, out);
      grew = true;
    }
  }
  return out;
}

/** What a candidate's rules hold that a technique may read: each clue kind,
 * each partition, each unit. */
export function ruleParts(json: DescriptionJson): { part: string; reads: string[] }[] {
  const every = withEveryVariation(json);
  const units = every.space.units ?? [];
  return [
    ...Object.keys(every.clues ?? {}).map((k) => ({ part: `clue ${k}`, reads: [k] })),
    ...Object.keys(every.space.regions ?? {}).map((r) => ({
      part: `partition ${r}`,
      reads: units.includes(r) ? [r, ...EVERY_UNIT] : [r],
    })),
    ...units
      .filter((u) => !(u in (every.space.regions ?? {})))
      .map((u) => ({
        part: `unit ${u}`,
        reads: [u, ...(LINE_NAMES[u] ?? []), ...EVERY_UNIT],
      })),
  ];
}
