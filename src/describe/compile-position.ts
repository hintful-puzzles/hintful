/**
 * The compiler from a planning game's description to its rules
 * (`docs/descriptions.md` § "A planning game's position and moves"): one
 * function a move for each of what it is asked (which bindings are legal on a
 * position, whether one is, and the position after it), the finish, the lost
 * position and the dead-end claims, all closed over a board in `rules`,
 * which returns the engine's `PositionRules`.
 *
 * Terms are compiled by `compile.ts`'s expression compiler with the position
 * as what a formula reads: a layer named as a function of a cell is that
 * layer's value there (`p.value[c]`). A move's assignments read `p` and write
 * a copy of it, so they are simultaneous.
 */

import {
  bindingLoops,
  CompileError,
  compileExpr,
  type Env,
  expect,
  HEADER,
  Out,
  type Sort,
  show,
  type Val,
} from "./compile.ts";
import {
  type AssignJson,
  type PlanningApplied,
  type PlanningJson,
  parseBinders,
  parseDefinitions,
  planningWith,
} from "./description.ts";
import { type Binder, type Expr, parse } from "./expr.ts";

const capitalized = (id: string): string => id[0].toUpperCase() + id.slice(1);

function parsed(game: string, where: string, src: string): Expr {
  try {
    return parse(src);
  } catch (e) {
    throw new SyntaxError(`${game} ${where}: ${(e as Error).message}`);
  }
}

function binders(game: string, where: string, src: string): Binder[] {
  try {
    return parseBinders(src);
  } catch (e) {
    throw new SyntaxError(`${game} ${where}: ${(e as Error).message}`);
  }
}

/** A function's lines, `indent` deep, with the statements at its top that
 * bind a move's fields to the names its body reads (`v_x = m.x`). */
function bound(fields: readonly string[], body: string[], indent: string): string[] {
  const text = body.join("\n");
  return [
    ...fields
      .filter((f) => new RegExp(`\\bv_${f}\\b`).test(text))
      .map((f) => `${indent}const v_${f} = m.${f};`),
    ...body,
  ];
}

/** `name` where `text` reads it, `_name` where it does not, as a parameter. */
const param = (name: string, text: string): string =>
  new RegExp(`\\b${name}\\b`).test(text) ? name : `_${name}`;

/** The code a variation's addition runs under, or none. */
function under(on: string | null, out: Out, body: () => void): void {
  if (on === null) {
    out.open("{");
    body();
    out.close();
    return;
  }
  out.open(`if (variations.includes(${JSON.stringify(on)})) {`);
  body();
  out.close();
}

/** A function's body, `depth` deep: what `write` emits, after the least
 * fixed points it reads, each computed once at its top. */
function body(env: Env, depth: number, write: (out: Out) => void): string[] {
  const prelude = {
    out: new Out(depth),
    fixed: new Map<string, string>(),
    fixing: null,
  };
  const outer = env.prelude;
  env.prelude = prelude;
  const out = new Out(depth);
  try {
    write(out);
  } finally {
    env.prelude = outer;
  }
  return [...prelude.out.text(), ...out.text()];
}

interface CompiledMove {
  type: string;
  name: string;
  /** The function's lines, at two indents (inside `rules`). */
  enumerate: string[];
  legal: string[];
  play: string[];
}

/** A move's binders, each with its sort, refusing any whose value is not a
 * number or an element: a move's binding is plain data. */
function bindingSorts(bs: readonly Binder[], env: Env): Map<string, Sort> {
  const sorts = new Map<string, Sort>();
  const probe: Env = { ...env, used: new Set(), scratch: null, hoist: null };
  bindingLoops(bs, new Map(), probe, new Out(0), (sc) => {
    for (const b of bs) {
      const v = sc.get(b.name);
      if (v !== undefined) sorts.set(b.name, v.sort);
    }
  });
  for (const [name, s] of sorts) {
    if (name === "move") throw new CompileError("a move binds no name `move`, its tag");
    if (s.k !== "num" && s.k !== "elem")
      throw new CompileError(
        `${name}: a move binds numbers and elements, not ${show(s)}`,
      );
  }
  return sorts;
}

function compileMove(
  m: PlanningApplied["moves"][number],
  layers: readonly string[],
  game: string,
  env: Env,
): CompiledMove {
  const bs = binders(game, `move ${m.name} for`, m.for);
  if (bs.some((b) => b.kind === "fill"))
    throw new CompileError(`${m.name}: a filling binds in a quantifier, not a move`);
  const when = m.when === null ? null : parsed(game, `move ${m.name} when`, m.when);
  const sorts = bindingSorts(bs, env);
  const fields = [...sorts.keys()];
  const type = `${capitalized(m.name)}Move`;
  const tag = JSON.stringify(m.name);

  // Every legal binding, pushed in binding order.
  const enBody = body(env, 2, (en) =>
    bindingLoops(bs, new Map(), env, en, (sc) => {
      const fieldsOf = fields.map((f) => `${f}: ${(sc.get(f) as Val).code}`);
      const push = `into.push({ move: ${tag}, ${fieldsOf.join(", ")} });`;
      if (when === null) {
        en.emit(push);
        return;
      }
      const w = compileExpr(when, sc, env, en);
      expect(w, "bool", `${m.name} when`);
      en.emit(`if (${w.code}) ${push}`);
    }),
  );

  // A binding is legal where each binder holds it, in turn, and the guard.
  const scope = new Map<string, Val>();
  const lgBody = body(env, 2, (lg) => {
    for (const b of bs) {
      const v = `v_${b.name}`;
      const sort = sorts.get(b.name) as Sort;
      if (b.kind === "let") {
        const t = compileExpr(b.of, scope, env, lg);
        lg.emit(`if (${v} !== ${t.code}) return false;`);
      } else {
        const s = compileExpr(b.of, scope, env, lg);
        if (s.code === "sp.cells" || s.code === "sp.lines")
          lg.emit(`if (!(${v} >= 0 && ${v} < ${s.code}.length)) return false;`);
        else if (s.sort.k === "set" && s.sort.of.k === "num")
          lg.emit(
            `if (!(${v} >= 0 && ${v} < 31 && ((${s.code} >> ${v}) & 1) !== 0)) return false;`,
          );
        else lg.emit(`if (!${s.code}.includes(${v})) return false;`);
      }
      scope.set(b.name, { code: v, sort });
      if (b.where !== null) {
        const w = compileExpr(b.where, scope, env, lg);
        expect(w, "bool", `where of ${b.name}`);
        lg.emit(`if (!(${w.code})) return false;`);
      }
    }
    if (when === null) lg.emit("return true;");
    else {
      const w = compileExpr(when, scope, env, lg);
      expect(w, "bool", `${m.name} when`);
      lg.emit(`return ${w.code};`);
    }
  });

  // The position after it: each assignment reads `p` and writes `q`, which
  // shares every layer the move does not assign.
  const assigned = layers.filter((l) =>
    m.set.some(({ assign }) => Object.hasOwn(assign, l)),
  );
  const plBody = body(env, 2, (pl) => {
    pl.emit(
      `const q: Position = { ...p${assigned.map((l) => `, ${l}: p.${l}.slice()`).join("")} };`,
    );
    m.set.forEach(({ assign, on }, i) => {
      const where = `move ${m.name} set ${i}`;
      const ebs = binders(game, `${where} for`, assign.for);
      const last = ebs[ebs.length - 1];
      if (last === undefined) throw new CompileError(`${where}: no cell assigned`);
      under(on, pl, () => {
        bindingLoops(ebs, scope, env, pl, (sc) => {
          const c = sc.get(last.name) as Val;
          if (!(c.sort.k === "elem" && c.sort.e === "cell"))
            throw new CompileError(
              `${where}: ${last.name} is a ${show(c.sort)}, not a cell`,
            );
          for (const [layer, src] of Object.entries(assign as AssignJson)) {
            if (layer === "for") continue;
            if (!layers.includes(layer))
              throw new CompileError(`${where}: no layer ${layer}`);
            const t = compileExpr(parsed(game, `${where} ${layer}`, src), sc, env, pl);
            expect(t, "num", `${where} ${layer}`);
            pl.emit(`q.${layer}[${c.code}] = ${t.code};`);
          }
        });
      });
    });
    pl.emit("return q;");
  });

  const sig = (lines: string[]) => param("p", lines.join("\n"));
  return {
    type: [
      `export interface ${type} {`,
      `  readonly move: ${tag};`,
      ...fields.map((f) => `  readonly ${f}: number;`),
      "}",
    ].join("\n"),
    name: m.name,
    enumerate: [
      `  function ${m.name}Moves(${sig(enBody)}: Position, into: Move[]): void {`,
      ...enBody,
      "  }",
    ],
    legal: [
      `  function ${m.name}Legal(${sig(lgBody)}: Position, m: ${type}): boolean {`,
      ...bound(fields, lgBody, "    "),
      "  }",
    ],
    play: [
      `  function ${m.name}Play(p: Position, m: ${type}): Position {`,
      ...bound(fields, plBody, "    "),
      "  }",
    ],
  };
}

/** A function of the position from formulas: `all` (every one holds) or
 * `any` (one does). */
function formulas(
  fn: string,
  items: readonly { src: string; on: string | null }[],
  how: "all" | "any",
  game: string,
  env: Env,
): string[] {
  const lines = body(env, 2, (out) => {
    for (const { src, on } of items)
      under(on, out, () => {
        const v = compileExpr(parsed(game, `${fn} ${src}`, src), new Map(), env, out);
        expect(v, "bool", `${fn} ${src}`);
        if (how === "all") out.emit(`if (!(${v.code})) return false;`);
        else out.emit(`if (${v.code}) return true;`);
      });
    out.emit(how === "all" ? "return true;" : "return false;");
  });
  return [
    `  function ${fn}(${param("p", lines.join("\n"))}: Position): boolean {`,
    ...lines,
    "  }",
  ];
}

/** Each dead-end claim as a predicate, false where its variation is off. */
function claimPredicates(
  items: PlanningApplied["deadEnds"],
  game: string,
  env: Env,
): string[] {
  return items.flatMap(({ id, src, on }) => {
    const lines = body(env, 3, (out) => {
      if (on !== null)
        out.emit(`if (!variations.includes(${JSON.stringify(on)})) return false;`);
      const v = compileExpr(parsed(game, `deadEnds ${id}`, src), new Map(), env, out);
      expect(v, "bool", `deadEnds ${id}`);
      out.emit(`return ${v.code};`);
    });
    return [`    ${id}: (${param("p", lines.join("\n"))}) => {`, ...lines, "    },"];
  });
}

/** A formula's conjuncts, in order. */
function conjuncts(e: Expr): Expr[] {
  return e.k === "bin" && e.op === "and" ? [...conjuncts(e.a), ...conjuncts(e.b)] : [e];
}

/**
 * The cells each claim holds of: where its last conjunct is `exists x in S:
 * P` with one binder, every `x` for which the conjuncts before it, the
 * binder's `where` and `P` hold. A claim of any other shape names none.
 */
function claimWitnesses(
  items: PlanningApplied["deadEnds"],
  game: string,
  env: Env,
): string[] {
  return items.flatMap(({ id, src, on }) => {
    const parts = conjuncts(parsed(game, `deadEnds ${id}`, src));
    const last = parts[parts.length - 1];
    const lines = body(env, 3, (out) => {
      out.emit("const at: number[] = [];");
      if (on !== null)
        out.emit(`if (!variations.includes(${JSON.stringify(on)})) return at;`);
      if (last.k === "quant" && last.q === "exists" && last.binders.length === 1) {
        for (const e of parts.slice(0, -1)) {
          const v = compileExpr(e, new Map(), env, out);
          expect(v, "bool", `deadEnds ${id}`);
          out.emit(`if (!(${v.code})) return at;`);
        }
        bindingLoops(last.binders, new Map(), env, out, (sc) => {
          const x = sc.get(last.binders[0].name) as Val;
          if (!(x.sort.k === "elem" && x.sort.e === "cell")) return;
          const v = compileExpr(last.body, sc, env, out);
          expect(v, "bool", `deadEnds ${id}`);
          out.emit(`if (${v.code}) at.push(${x.code});`);
        });
      }
      out.emit("return at;");
    });
    return [`    ${id}: (${param("p", lines.join("\n"))}) => {`, ...lines, "    },"];
  });
}

/** A planning game's rules, as a module. */
export function compilePlanning(
  json: PlanningJson,
  source: string,
  runtime: string,
  positionRuntime: string,
): string {
  Out.reset();
  const applied = planningWith(json, Object.keys(json.variations ?? {}));
  const d = applied.json;
  const layers = Object.keys(d.position);
  if (layers.length === 0)
    throw new CompileError(`${json.game}: a position has a layer`);
  const used = new Set<string>();
  const relations = Object.keys(d.space.relations ?? {});
  const env: Env = {
    defs: parseDefinitions(json.game, d.define ?? {}),
    clues: new Map(),
    regions: new Set(),
    boxes: null,
    diagonals: false,
    cellDomain: false,
    sizes: {
      names: new Set(
        Object.keys(d.sizes).filter(
          (n) => n !== "w" && n !== "h" && n !== d.space.grid.w && n !== d.space.grid.h,
        ),
      ),
      read: new Set(),
    },
    used,
    concluding: false,
    answer: null,
    position: new Set(layers),
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    epoch: null,
    prelude: null,
    relations: new Set(relations),
  };
  const moves = applied.moves.map((m) => compileMove(m, layers, json.game, env));
  const finished = formulas("finished", applied.finish, "all", json.game, env);
  const lost = formulas(
    "lost",
    (d.lose ?? []).map((src) => ({ src, on: null })),
    "any",
    json.game,
    env,
  );
  for (const { id } of applied.deadEnds)
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(id))
      throw new CompileError(`${json.game}: claim id ${id} is not a plain name`);
  const claims = claimPredicates(applied.deadEnds, json.game, env);
  const claimText = claims.join("\n");
  const witnesses = claimWitnesses(applied.deadEnds, json.game, env);
  const witnessText = witnesses.join("\n");
  // A lost position has no moves: it can only be undone.
  const loses = (d.lose ?? []).length > 0;
  const ids = applied.deadEnds.map((c) => JSON.stringify(c.id));
  const sizes = [...env.sizes.read].sort();
  const dispatch = (fn: "Legal" | "Play", args: string): string[] =>
    moves.map(
      (m) => `        case ${JSON.stringify(m.name)}: return ${m.name}${fn}(${args});`,
    );
  const inner = [
    ...moves.flatMap((m) => [...m.enumerate, "", ...m.legal, "", ...m.play, ""]),
    ...finished,
    "",
    ...lost,
    "",
    ...(ids.length === 0
      ? [
          "  // The description states no claim: nothing is a proved dead end.",
          "  const deadEnd = (_p: Position): DeadEndId | null => null;",
        ]
      : [
          "  const holds = claims(sp, cl, variations);",
          "  function deadEnd(p: Position): DeadEndId | null {",
          "    for (const id of deadEnds) if (holds[id](p)) return id;",
          "    return null;",
          "  }",
          "  const at = claimWitnesses(sp, cl, variations);",
        ]),
    "",
    "  return {",
    "    moves: (p) => {",
    "      const into: Move[] = [];",
    ...(loses ? ["      if (lost(p)) return into;"] : []),
    ...moves.map((m) => `      ${m.name}Moves(p, into);`),
    "      return into;",
    "    },",
    "    legal: (p, m) => {",
    ...(loses ? ["      if (lost(p)) return false;"] : []),
    "      switch (m.move) {",
    ...dispatch("Legal", "p, m"),
    "      }",
    "    },",
    "    play: (p, m) => {",
    "      switch (m.move) {",
    ...dispatch("Play", "p, m"),
    "      }",
    "    },",
    "    finished,",
    "    lost,",
    "    deadEnd,",
    ids.length === 0
      ? "    witnesses: () => [],"
      : "    witnesses: (id, p) => at[id](p),",
    "  };",
  ];
  const runtimeNames = ["type GridSpace", ...[...used].sort()];
  return `${[
    HEADER(source),
    "",
    `import { ${runtimeNames.join(", ")} } from "${runtime}";`,
    `import type { PositionRules } from "${positionRuntime}";`,
    "",
    "/** The space's units, for `describedSpace`: the description's. */",
    `export const units: readonly string[] = ${JSON.stringify(d.space.units)};`,
    "",
    "/** The position's layers, in the description's order. */",
    `export const layers = ${JSON.stringify(layers)} as const;`,
    "",
    "/** A position: a value a cell in each layer. */",
    "export type Position = {",
    ...layers.map((l) => `  readonly ${l}: Int32Array;`),
    "};",
    "",
    ...(sizes.length + relations.length === 0
      ? [
          "/** The board deals nothing the rules read beyond its grid. */",
          "export type Dealt = Readonly<Record<string, never>>;",
        ]
      : [
          "/** What the rules read that the grid does not give: sizes, and",
          " * relations, a set of cells for each cell. */",
          "export interface Dealt {",
          ...sizes.map((n) => `  readonly ${n}: number;`),
          ...relations.map((r) => `  readonly ${r}: readonly (readonly number[])[];`),
          "}",
        ]),
    "",
    ...moves.flatMap((m) => [m.type, ""]),
    "/** A move: its name and its binding. */",
    `export type Move = ${moves.map((m) => `${capitalized(m.name)}Move`).join(" | ")};`,
    "",
    "/** The description's dead-end claims, by id. */",
    `export type DeadEndId = ${ids.length === 0 ? "never" : ids.join(" | ")};`,
    "",
    "/** The claims in the order `deadEnd` tries them, the description's. */",
    `export const deadEnds: readonly DeadEndId[] = [${ids.join(", ")}];`,
    "",
    "/** Each claim alone, as the dead-end checker reads it: `deadEnd` answers",
    " * only the first that holds. */",
    `export function claims(${param("sp", claimText)}: GridSpace, ${param("cl", claimText)}: Dealt, ${param("variations", claimText)}: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => boolean>> {`,
    "  return {",
    ...claims,
    "  };",
    "}",
    "",
    "/** The cells each claim holds of, as a banner outlines them: none where the",
    " * claim does not hold, or names no cell. */",
    `export function claimWitnesses(${param("sp", witnessText)}: GridSpace, ${param("cl", witnessText)}: Dealt, ${param("variations", witnessText)}: readonly string[]): Readonly<Record<DeadEndId, (p: Position) => number[]>> {`,
    "  return {",
    ...witnesses,
    "  };",
    "}",
    "",
    "/** The rules on one board: its grid, what it deals, and the variations it",
    " * has on. */",
    `export function rules(${param("sp", inner.join("\n"))}: GridSpace, ${param("cl", inner.join("\n"))}: Dealt, ${param("variations", inner.join("\n"))}: readonly string[]): PositionRules<Position, Move, DeadEndId> {`,
    ...inner,
    "}",
  ].join("\n")}\n`;
}
