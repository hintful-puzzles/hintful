/**
 * The clues a sampled answer deals (`engine/fill/deal/`'s derive step):
 * `clueHolds_<kind>`, whether a clue holds of the whole board, and
 * `deriveClues`, every clue the board deals, with the kinds dealt one in a
 * group, dealt by no deal, or withheld at some values.
 */

import { bindingLoops, compileExpr } from "../compile-expr.ts";
import {
  type ClueKind,
  CompileError,
  type Env,
  expect,
  Out,
  type Val,
} from "../compile-sorts.ts";
import { freeNames } from "../compile-terms.ts";
import {
  type Description,
  type DescriptionJson,
  dividesOf,
  growOf,
  sampleOf,
  tallyKindOf,
} from "../description.ts";
import type { Binder, Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { latinOf } from "./clue-steps.ts";
import { answerEnv, param } from "./emit.ts";
import { UNIVERSE } from "./locations.ts";
import { dealtBy, dealtPartitions } from "./partitions.ts";
import { ruledKinds } from "./settings.ts";

/** `deal.oneIn`: by clue kind, the cells a clue at `at` is the one of, so
 * the deal shows one in each such group, at a random member. */
function oneInOf(json: DescriptionJson): Readonly<Record<string, string>> {
  return json.deal?.oneIn ?? {};
}

/**
 * The deal of kind `kind` one in each group: for each cell no group so far
 * holds, its group's cells, one of them at random, and there the first of
 * its values whose clue holds as the only one of its kind (`clueHolds_` with
 * the clues `cl`). Emitted into `once`, which `deriveClues` runs after the
 * other kinds.
 */
function onceOf(
  kind: string,
  c: { readonly value: Expr | null },
  group: string,
  sorts: ClueKind,
  env: Env,
  measured: (e: Expr) => Expr,
  once: Out,
): void {
  const covered = Out.fresh("_covered");
  const members = Out.fresh("_members");
  const at = Out.fresh("_at");
  const vs = Out.fresh("_v");
  const pickAt = Out.fresh("_pick");
  const found = Out.fresh("found");
  once.emit(`const ${covered} = new Uint8Array(sp.cells.length);`);
  once.emit(`const ${at}: number[] = [];`);
  once.emit(`const ${vs}: number[] = [];`);
  once.open("for (const _c of sp.cells) {");
  once.emit(`if (${covered}[_c]) continue;`);
  once.emit(`const ${members}: number[] = [];`);
  const groupExpr = measured(parse(group));
  bindingLoops(
    [{ name: "_p", kind: "in", of: groupExpr, where: null }],
    new Map<string, Val>([["at", { code: "_c", sort: sorts.at }]]),
    { ...env, readsClues: { yes: false } },
    once,
    (sc) => once.emit(`${members}.push(${(sc.get("_p") as Val).code});`),
  );
  once.emit(`if (${members}.length === 0) continue;`);
  once.emit(`for (const _m of ${members}) ${covered}[_m] = 1;`);
  once.emit(`const ${pickAt} = ${members}[pick(${members}.length)];`);
  once.open(`${found}: {`);
  bindingLoops(
    [{ name: "v", kind: "in", of: measured(c.value as Expr), where: null }],
    new Map<string, Val>([["at", { code: pickAt, sort: sorts.at }]]),
    { ...env, readsClues: { yes: false } },
    once,
    (sc) => {
      const v = (sc.get("v") as Val).code;
      once.emit(
        `if (clueHolds_${kind}(g, sp, { ...cl, ${kind}: clueList([${pickAt}], [${v}], sp.cells.length) }, ${pickAt}, ${v})) { ${at}.push(${pickAt}); ${vs}.push(${v}); break ${found}; }`,
      );
    },
  );
  once.close();
  once.close();
  // The clues in cell order, as a list holds them.
  once.emit(
    `const _order_${kind} = ${at}.map((_x, _i) => _i).sort((_a, _b) => ${at}[_a] - ${at}[_b]);`,
  );
  once.emit(
    `cl.${kind} = clueList(_order_${kind}.map((_i) => ${at}[_i]), _order_${kind}.map((_i) => ${vs}[_i]), sp.cells.length);`,
  );
}

/** What `deal.never` says no deal deals, which only an ID carries: whole
 * kinds (Pattern's given squares, which only upstream's pictures hold), and
 * values of a kind at cells (Boats' segment of a shape not given). It is a
 * kind, a list of them, or by kind its values, or `all`. */
function neverOf(
  json: DescriptionJson,
  d: Description,
): { kinds: string[]; values: ReadonlyMap<string, readonly number[]> } {
  const never = json.deal?.never;
  const byKind: Readonly<Record<string, "all" | number[]>> =
    never === undefined
      ? {}
      : typeof never === "string"
        ? { [never]: "all" }
        : Array.isArray(never)
          ? Object.fromEntries(never.map((k) => [k, "all"]))
          : never;
  const kinds: string[] = [];
  const values = new Map<string, number[]>();
  for (const [k, v] of Object.entries(byKind)) {
    if (!d.clueKinds.has(k)) throw new CompileError(`deal never: ${k} is no clue kind`);
    if (v === "all") kinds.push(k);
    else if (d.clueKinds.get(k)?.at !== "cell")
      throw new CompileError(
        `deal never: ${k}'s values, and it is no clue kind at a cell`,
      );
    else values.set(k, v);
  }
  return { kinds, values };
}

/** `E` where a meaning is `E = v` or `v = E`, alone or a term of a
 * conjunction, and `E` does not read `v`: the one value the clue can hold,
 * which a derive takes without trying each. `null` where it is not. */
function solvedFor(means: Expr): Expr | null {
  if (means.k !== "bin") return null;
  if (means.op === "and") return solvedFor(means.a) ?? solvedFor(means.b);
  if (means.op !== "=") return null;
  const isV = (e: Expr): boolean => e.k === "name" && e.name === "v";
  const freeOfV = (e: Expr): boolean => {
    const names = new Set<string>();
    freeNames(e, names, new Set());
    return !names.has("v");
  };
  if (isV(means.b) && freeOfV(means.a)) return means.a;
  if (isV(means.a) && freeOfV(means.b)) return means.b;
  return null;
}

/**
 * `<kind>_l`, the list a list kind deals at each element of `universe`, its
 * meaning `T = v` (either way round) with `T` read off the answer: the list
 * is `T`, so every element holds one, an empty one included. A meaning of
 * any other shape is refused.
 */
function listDerived(
  kind: string,
  means: Expr,
  universe: string,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  const isV = (e: Expr) => e.k === "name" && e.name === "v";
  const term =
    means.k !== "bin" || means.op !== "="
      ? null
      : isV(means.b)
        ? means.a
        : isV(means.a)
          ? means.b
          : null;
  if (term === null)
    throw new CompileError(
      `clue ${kind}: a sampled deal derives a list whose meaning is a list of the answer = v`,
    );
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const out = new Out(1);
  const sorts = env.clues.get(kind) as ClueKind;
  const t = compileExpr(
    measured(term),
    new Map<string, Val>([["at", { code: "at", sort: sorts.at }]]),
    answerEnv(env, readsClues, scratch),
    out,
  );
  if (t.sort.k !== "list" || readsClues.yes)
    throw new CompileError(
      `clue ${kind}: a sampled deal derives a list whose meaning is a list of the answer = v`,
    );
  return [
    `const ${kind}_l = sp.${universe}.map((at) => {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return Array.from(${t.code});`,
    "});",
  ];
}

/**
 * For a description whose deal samples an answer: `clueHolds_<kind>(g, sp,
 * at, v)`, whether a clue of each kind at `at` valued `v` holds of the whole
 * board `g`, and `deriveClues(g, sp)`, the clues `g` deals, each kind at
 * each element where one of its values holds, the first in its values'
 * order. Nothing for any other description. A clue the board's answer alone
 * cannot decide (one whose meaning reads other clues, a clue at the board,
 * a list, one a value) cannot be derived, and is refused.
 */
export function derivedClues(
  json: DescriptionJson,
  d: Description,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (sampleOf(json) === null) {
    // Only a derive deals a kind on some boards alone.
    for (const [kind, { size }] of ruledKinds(json))
      throw new CompileError(
        `settings ${size}: deals ${kind}, and the deal samples no answer`,
      );
    return [];
  }
  // The partition the deal grows round the answer, or those it divides apart
  // from it.
  const growing = growOf(json)?.partition;
  const grown =
    growing === undefined ? dividesOf(json).map((x) => x.partition) : [growing];
  // A size the grid is not measured in is the params' (a `settings` choice that gives a size).
  if (dealtPartitions(env).some((r) => !grown.includes(r)) || env.relations.size > 0)
    throw new CompileError(
      `${json.game}: a sampled deal derives clues and deals a partition, and this board deals more`,
    );
  const holds: string[] = [];
  const derive = new Out(1);
  const dealt: string[] = [];
  const oneIn = oneInOf(json);
  for (const k of Object.keys(oneIn))
    if (d.clueKinds.get(k)?.at !== "cell")
      throw new CompileError(`deal oneIn: ${k} is no clue kind at a cell`);
  /** The kinds dealt one in each group, after the rest. */
  const once = new Out(1);
  const outside = json.space.grid?.hexagon?.outside;
  const latinKind = latinOf(json, d)?.kind;
  const { kinds: neverKinds, values: neverValues } = neverOf(json, d);
  const never = [...neverKinds, ...(latinKind === undefined ? [] : [latinKind])];
  const tally = tallyKindOf(json) ?? undefined;
  /** Whether a kind sits at the dealt partition's parts, whose cells its
   * meaning reads off the partition. */
  const atParts = (c: { at: string }): boolean => grown.includes(c.at);
  const partKinds = [...d.clueKinds.values()].some(atParts);
  if (partKinds && Object.keys(oneIn).length > 0)
    throw new CompileError("deal oneIn: a kind dealt one a group, and kinds at parts");
  const ruled = ruledKinds(json);
  for (const [kind, c] of d.clueKinds) {
    const rule = ruled.get(kind);
    if (
      rule !== undefined &&
      (kind === tally ||
        kind === outside ||
        never.includes(kind) ||
        oneIn[kind] !== undefined ||
        atParts(c) ||
        env.clues.get(kind)?.list === true)
    )
      throw new CompileError(
        `settings ${rule.size}: deals ${kind}, which is no clue of one value a sampled deal derives at a cell, a line, a slot, an edge or a corner`,
      );
    // The tally is the params', as a size is.
    if (kind === tally) {
      dealt.push(`${kind}: sizes.${kind}`);
      continue;
    }
    // A hexagon's corners hold its outside kind, and no other cell does.
    if (kind === outside) {
      derive.emit(
        `const ${kind}_at = sp.cells.filter((c) => !inHexagon(sp.w, sp.h, c % sp.w, Math.floor(c / sp.w)));`,
      );
      dealt.push(
        `${kind}: clueList(${kind}_at, ${kind}_at.map(() => 0), sp.cells.length)`,
      );
      env.used.add("inHexagon");
      continue;
    }
    // A kind only an ID carries is dealt none.
    if (never.includes(kind)) {
      dealt.push(`${kind}: clueList([], [], sp.cells.length)`);
      continue;
    }
    const sorts = env.clues.get(kind) as ClueKind;
    const parts = atParts(c);
    const universe = parts ? null : UNIVERSE[c.at];
    if (sorts.list && !sorts.per && universe !== undefined && universe !== null) {
      for (const line of listDerived(kind, c.means, universe, env, measured))
        derive.emit(line);
      dealt.push(
        `${kind}: listClues(sp.${universe}, ${kind}_l, sp.${universe}.length)`,
      );
      env.used.add("listClues");
      continue;
    }
    if (
      c.value === null ||
      sorts.list ||
      universe === undefined ||
      (sorts.per && universe === null)
    )
      throw new CompileError(
        `clue ${kind}: a sampled deal derives a clue of one value at a cell, a line, a slot, an edge, a corner or a part, or one a value at any but a part`,
      );
    // A clue one a value is read at its element for the value `per`.
    const per = sorts.per ? "per" : null;
    const readsClues = { yes: false };
    // A size the params give is at hand before any clue is dealt (Salad's
    // symbols, which say which value is the empty square).
    const readsSizes = { yes: false };
    const scratch: string[] = [];
    const henv = { ...answerEnv(env, readsClues, scratch), readsSizes };
    const out = new Out(1);
    const means = compileExpr(
      measured(c.means),
      new Map<string, Val>([
        ["at", { code: "at", sort: sorts.at }],
        ["v", { code: "v", sort: sorts.v }],
        ...(per === null
          ? []
          : [[per, { code: per, sort: { k: "num" } }] as [string, Val]]),
      ]),
      henv,
      out,
    );
    expect(means, "bool", `clue ${kind}`);
    const group = oneIn[kind];
    // A part's cells are read off the partition, which the clues hold.
    if (readsClues.yes && group === undefined && !parts)
      throw new CompileError(
        `clue ${kind}: its meaning reads the board's clues, so a sampled answer cannot deal it`,
      );
    const body = [
      ...scratch.map((s) => `  ${s}`),
      ...out.text(),
      `  return ${means.code};`,
    ];
    holds.push(
      "",
      group === undefined
        ? `/** Whether a ${kind} clue at \`at\` valued \`v\` holds of the whole board \`g\`. */`
        : `/** Whether a ${kind} clue at \`at\` valued \`v\` holds of the whole board \`g\`, the clues \`cl\`. */`,
      `export function clueHolds_${kind}(${[
        "g: ArrayLike<number>",
        param("sp", "GridSpace", body),
        ...(group === undefined && !parts && !readsSizes.yes
          ? []
          : [param("cl", "Dealt", body)]),
        param("at", "number", body),
        ...(per === null ? [] : [param(per, "number", body)]),
        param("v", "number", body),
      ].join(", ")}): boolean {`,
      ...body,
      "}",
    );
    if (group !== undefined) {
      if (per !== null)
        throw new CompileError(`deal oneIn: ${kind} is a clue one a value`);
      onceOf(kind, c, group, sorts, henv, measured, once);
      continue;
    }
    // Each element in order, then each value in the values' order: a value
    // pushed at this element already is the one that holds first.
    const at = `${kind}_at`;
    const vs = `${kind}_v`;
    derive.emit(`const ${at}: number[] = [];`);
    derive.emit(`const ${vs}: number[] = [];`);
    // A board a variation's partition is not dealt on has no clue at its
    // parts (Solo's cages and their totals, Killer's alone).
    const gated = parts && dealtBy(json, c.at) !== null;
    if (gated) derive.open(`if (cl.${c.at} !== undefined) {`);
    // A kind a ruleset deals is dealt on its boards alone (Salad's border
    // clues, Letters' alone): the size is read, so `Dealt` holds it.
    if (rule !== undefined) {
      env.sizes.read.add(rule.size);
      derive.open(
        `if (${rule.values.map((n) => `sizes.${rule.size} === ${n}`).join(" || ")}) {`,
      );
    }
    // A meaning `E = v` is solved for `v`: a value at a time would try 9^6
    // products on a cage of six.
    const solved = solvedFor(measured(c.means));
    const value = measured(c.value);
    const binders: Binder[] = [
      {
        name: "at",
        kind: "in",
        of: { k: "name", name: parts ? c.at : (universe as string) },
        where: null,
      },
      ...(per === null
        ? []
        : [{ name: per, kind: "in", of: measured(d.domain), where: null } as Binder]),
      solved === null
        ? { name: "v", kind: "in", of: value, where: null }
        : {
            name: "v",
            kind: "let",
            of: solved,
            where: { k: "bin", op: "in", a: { k: "name", name: "v" }, b: value },
          },
    ];
    bindingLoops(
      binders,
      new Map(),
      // The loops read the sizes off the `cl` built before them, not
      // through the meaning's call.
      { ...henv, readsClues: { yes: false }, readsSizes: { yes: false } },
      derive,
      (sc) => {
        const el = (sc.get("at") as Val).code;
        const d = per === null ? null : (sc.get(per) as Val).code;
        // A clue one a value sits at its element and value's place.
        const a = d === null ? el : `perPlace(${el}, ${d})`;
        const v = (sc.get("v") as Val).code;
        // No clue of another kind sits outside a hexagon.
        const within =
          outside !== undefined && universe === "cells"
            ? `inHexagon(sp.w, sp.h, ${el} % sp.w, Math.floor(${el} / sp.w)) && `
            : "";
        // A value only an ID writes is never derived.
        const withheld = (neverValues.get(kind) ?? []).map((n) => ` && ${v} !== ${n}`);
        derive.emit(
          `if (${within}${at}.at(-1) !== ${a}${withheld.join("")} && clueHolds_${kind}(g, sp, ${parts || readsSizes.yes ? "cl, " : ""}${el}, ${d === null ? "" : `${d}, `}${v})) { ${at}.push(${a}); ${vs}.push(${v}); }`,
        );
      },
    );
    if (gated) derive.close();
    if (rule !== undefined) derive.close();
    if (per !== null) env.used.add("perPlace");
    dealt.push(
      `${kind}: clueList(${at}, ${vs}, ${parts ? `cl.${c.at}${gated ? "?" : ""}.parts.length${gated ? " ?? 0" : ""}` : per === null ? `sp.${universe}.length` : `perPlace(sp.${universe}.length, 0)`})`,
    );
  }
  if (dealt.length > 0) env.used.add("clueList");
  dealt.unshift(...grown.map((r) => `${r}: grown[${JSON.stringify(r)}]`));
  // The sizes the techniques and the rules read, as `Dealt` holds them.
  const sizes = [...env.sizes.read].sort();
  for (const n of sizes) dealt.push(`${n}: sizes.${n}`);
  const onceKinds = Object.keys(oneIn);
  // A clue reads the partitions off the deal's, a part's its cells and a
  // cell's the size of its area (Seismic's given), and the sizes off the
  // params (ABCD's letters, which a clue a value is one of).
  const derived = derive.text();
  if (derived.some((l) => /\bcl\./.test(l)))
    derived.unshift(
      `  const cl = { ${[
        ...grown.map((r) => `${r}: grown[${JSON.stringify(r)}]`),
        ...sizes.map((n) => `${n}: sizes.${n}`),
      ].join(", ")} } as unknown as Dealt;`,
    );
  const body =
    onceKinds.length === 0
      ? [...derived, `  return { ${dealt.join(", ")} };`]
      : [
          ...derived,
          // Each kind dealt one in a group is read as the only clue of its
          // kind on the board, beside every other kind.
          `  const cl: Dealt = { ${[
            ...dealt,
            ...onceKinds.map((k) => `${k}: clueList([], [], sp.cells.length)`),
          ].join(", ")} };`,
          ...once.text(),
          "  return cl;",
        ];
  if (onceKinds.length > 0) env.used.add("clueList");
  return [
    ...holds,
    "",
    "/** The clues the whole board `g` deals: each kind at each element where",
    " * one of its values holds, the first in its values' order; the",
    " * partition the deal grew round it; and the sizes the params give. */",
    `export function deriveClues(${[
      param("g", "ArrayLike<number>", body),
      param("sp", "GridSpace", body),
      // A board with no partition imports no `Partition`, and is grown none.
      grown.length === 0
        ? "_grown: object = {}"
        : param("grown", "Readonly<Record<string, Partition>>", body),
      sizes.length === 0 && tally === undefined
        ? "_sizes: object = {}"
        : `sizes: ${[
            ...(sizes.length === 0
              ? []
              : [
                  `Readonly<Record<${sizes.map((n) => JSON.stringify(n)).join(" | ")}, number>>`,
                ]),
            ...(tally === undefined
              ? []
              : [`{ readonly ${tally}: Dealt["${tally}"] }`]),
          ].join(" & ")}`,
      ...(onceKinds.length === 0 ? [] : ["pick: (n: number) => number = () => 0"]),
    ].join(", ")}): Dealt {`,
    ...body,
    "}",
  ];
}
