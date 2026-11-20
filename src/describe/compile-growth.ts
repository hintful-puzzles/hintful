/**
 * How a compiled technique's cost grows with the board, read off the code
 * the compiler (`compile.ts`) writes and the functions its terms walk.
 */

import { slotsOf } from "../engine/stated-clauses.ts";
import { CompileError, type Env, isArray, Out, type Val } from "./compile-sorts.ts";
import type { Definition, Says } from "./description.ts";
import { children, type Expr } from "./expr.ts";

/** An array the size of the board, or of a line: what a loop over it costs,
 * in halves of a power of the board's size. */
const BOARD_ARRAY = /^sp\.(cells|edges|points|corners|slots|centers|faces|angles)\b/;
const LINE_ARRAY = /^sp\.(lines|rows|cols|lineCells\[)/;
/** The runtime's walks, by what each walks. */
export const BOARD_WALKS =
  /\b(through|throughWhere|linked|reaches|connected|cuts|edgeGroups|pointGroups|beam|look)\(/;
export const LINE_WALKS = /\b(stretch|ray|chain)\(/;

/**
 * How a technique's dearest read grows with the board, from its code: the
 * loops round it over the board or a line, and a walk of the board or a line
 * it makes, each a power of the board's size, a line's a half (§ "What a
 * technique compiles to"). In halves: 4 is `n^2`. A kept structure's read is
 * a lookup, and costs nothing here.
 */
export function techniqueGrowth(lines: readonly string[]): number {
  const arrays = new Map<string, string>();
  const open: { indent: number; cost: number }[] = [];
  let worst = 0;
  // What a step says is read once a firing and only where a hint asks, so the
  // block that reads it is no part of what a run costs.
  let saying: number | null = null;
  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    if (saying !== null) {
      if (indent > saying) continue;
      saying = null;
    }
    if (line.trim() === "if (fire !== null) {") {
      saying = indent;
      continue;
    }
    while (open.length > 0 && (open.at(-1) as { indent: number }).indent >= indent)
      open.pop();
    const t = line.trim();
    const a = /^const (_a\d+) = (.*);$/.exec(t);
    if (a !== null) arrays.set(a[1], a[2]);
    let cost = 0;
    if (t.startsWith("for (")) {
      const over = /< (_a\d+)\.length/.exec(t);
      const of = over === null ? null : (arrays.get(over[1]) ?? "");
      if (of !== null) cost = BOARD_ARRAY.test(of) ? 2 : LINE_ARRAY.test(of) ? 1 : 0;
      // A kind dealt at elements is as many as they are; one of the
      // board's fields (a fleet) is a handful.
      else if (/< cl\.\w+\.at\.length|<= .*\bsp\.(w|h)\b/.test(t)) cost = 2;
    }
    const walk = BOARD_WALKS.test(t) ? 2 : LINE_WALKS.test(t) ? 1 : 0;
    const round = open.reduce((s, x) => s + x.cost, 0);
    worst = Math.max(worst, round + cost + walk);
    if (t.startsWith("for (")) open.push({ indent, cost });
    // A truth made once a group (`groupQuantifier`) is made at most once a
    // square, whatever loops read it.
    else if (/^if \(_gq\d+ === undefined\) \{$/.test(t))
      open.push({ indent, cost: 2 - round });
  }
  return worst;
}

/** The steepest growth a technique may have, refused past it, and the one
 * `npm run describe` warns of from. The catalog's steepest was `n^3`
 * (Galaxies' `soleOwner`) and its `n^2.5`s were Boats' (2026-11-07), both
 * games measured slower than their hand-written ladders. */
export const MAX_GROWTH = 6;

/** The roles of `says.marks` a step draws its evidence in. */
const MARK_ROLES: ReadonlySet<string> = new Set(["outline", "stripes", "strand"]);

/**
 * A break's set the words of `v` draw in a role, put in that role's mark
 * (`marks`, each `role: code`, typed in `fields`), so the step draws it and
 * what the firing rests on holds it. `sets` holds each break term's code.
 */
export function drawBrokeSets(
  id: string,
  v: Says["variants"][number],
  sets: ReadonlyMap<string, string>,
  marks: string[],
  fields: string[],
): void {
  const drawn = new Map<string, Set<string>>();
  for (const w of v.words)
    for (const src of Object.values(w.clauses))
      for (const s of slotsOf(src as string))
        if (
          s.role !== null &&
          MARK_ROLES.has(s.role) &&
          s.name !== null &&
          sets.has(s.name)
        )
          drawn.set(s.role, (drawn.get(s.role) ?? new Set()).add(s.name));
  for (const [role, names] of drawn) {
    const i = marks.findIndex((m) => m.startsWith(`${role}: `));
    if (i >= 0 && v.marks.find((m) => m.role === role)?.sort !== null)
      throw new CompileError(
        `${id}: a break's set is drawn as ${role}, which holds several sorts`,
      );
    const own = i < 0 ? [] : [`...${marks[i].slice(role.length + 2)}`];
    const codes = [...names].map((n) => `...${sets.get(n)}`);
    const merged = `${role}: [...new Set([${[...own, ...codes].join(", ")}])]`;
    if (i >= 0) marks[i] = merged;
    else {
      marks.push(merged);
      fields.push(`${role}: number[];`);
    }
  }
}

/** The length below which a set a comprehension makes is scanned for a
 * member, not stamped (`addOnce`). */
export const SCANNED_SET = 16;
export const WARN_GROWTH = 5;

/** A growth in halves as a power: 3 is `n^1.5`. */
export const power = (halves: number): string =>
  halves === 0 ? "1" : halves === 2 ? "n" : `n^${halves / 2}`;

/** The functions whose runtime walks a line or the board. */
const WALKS = new Set([
  "stretch",
  "run_lengths",
  "ray",
  "sight",
  "through",
  "reaches",
  "connected",
  "cuts",
  "cut_edges",
  "matched",
  "beam",
  "look",
  "sight_direct",
  "sight_bent",
  "sight_twice",
]);

/**
 * Where a set of elements a binder named outside every loop is asked about
 * inside one, the code of a table of its members, made once where it is
 * bound (`memberMarks`); `null` elsewhere, where a scan costs no more than
 * the table. Net's `run` asked whether
 * each edge round a reach across the board was in `U`, a set of most of
 * the board's edges, by scanning it.
 */
export function memberTable(s: Val, env: Env): string | null {
  const h = env.hoist;
  // A set bound inside a loop is made once a pass, mostly of a few members
  // round one element (Net's `W`, a square's sides), which a table made each
  // pass costs more than scanning.
  if (h === null || s.at === undefined || s.at.loops > 0 || h.loops === 0) return null;
  if (s.sort.k !== "set" || s.sort.of.k !== "elem" || !isArray(s.sort)) return null;
  const key = `memberMarks(${s.code})`;
  let made = s.at.made.get(key);
  if (made === undefined) {
    const t = Out.fresh("_mm");
    s.at.lines.push({ indent: 0, text: `const ${t} = ${key};` });
    made = { code: t, sort: s.sort, at: s.at };
    s.at.made.set(key, made);
  }
  env.used.add("memberMarks");
  return made.code;
}

/** Whether `e` walks a line or the board, through the definitions it reads. */
export function walks(
  e: Expr,
  defs: ReadonlyMap<string, Definition>,
  seen: Set<string>,
): boolean {
  if (e.k === "call") {
    if (WALKS.has(e.fn)) return true;
    const d = defs.get(e.fn);
    if (d !== undefined && !seen.has(e.fn)) {
      seen.add(e.fn);
      if (walks(d.body, defs, seen)) return true;
    }
  }
  return children(e).some((c) => walks(c, defs, seen));
}

/** How deep the loops of `e` nest, through the definitions it reads: a set
 * made by one loop costs about what looking it up does. */
export function loopDepth(
  e: Expr,
  defs: ReadonlyMap<string, Definition>,
  seen: ReadonlySet<string> = new Set(),
): number {
  const inner = Math.max(0, ...children(e).map((c) => loopDepth(c, defs, seen)));
  // A chain walks as far as the board, as a loop over it does.
  if (e.k === "quant" || e.k === "agg" || (e.k === "call" && e.fn === "chain"))
    return inner + 1;
  const def = e.k === "call" && !seen.has(e.fn) ? defs.get(e.fn) : undefined;
  if (def === undefined) return inner;
  return Math.max(
    inner,
    loopDepth(def.body, defs, new Set([...seen, e.k === "call" ? e.fn : ""])),
  );
}
