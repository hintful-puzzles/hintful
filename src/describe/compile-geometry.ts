/**
 * The grid's names and the calls of its geometry, for the compiler
 * (`compile.ts`): which a board has, and the code a call of each is, its
 * arguments compiled already.
 */

import {
  BOOL,
  type ClueKind,
  CompileError,
  type Env,
  elem,
  expect,
  expectElem,
  INT,
  isSetOf,
  type LayerSort,
  markRead,
  NUM,
  Out,
  once,
  setOf,
  show,
  tapped,
  type Val,
} from "./compile-sorts.ts";

export const NAMES: Record<string, Val> = {
  cells: { code: "sp.cells", sort: setOf(elem("cell")) },
  rows: { code: "sp.rows", sort: setOf(elem("line")) },
  cols: { code: "sp.cols", sort: setOf(elem("line")) },
  lines: { code: "sp.lines", sort: setOf(elem("line")) },
  units: { code: "sp.units", sort: setOf(elem("line")) },
  slots: { code: "sp.slots", sort: setOf(elem("slot")) },
  corners: { code: "sp.corners", sort: setOf(elem("corner")) },
  points: { code: "sp.points", sort: setOf(elem("point")) },
  centers: { code: "sp.centers", sort: setOf(elem("center")) },
  edges: { code: "sp.edges", sort: setOf(elem("edge")) },
  domain: { code: "b.domain", sort: setOf(NUM) },
  true: { code: "true", sort: BOOL },
  false: { code: "false", sort: BOOL },
  none: { code: "-1", sort: { k: "none" } },
};

/** What a board of cells alone has none of: the names and functions that
 * read a rectangle. */
const GEOMETRY = new Set([
  "rows",
  "cols",
  "lines",
  "units",
  "slots",
  "corners",
  "points",
  "centers",
  "opp",
  "edges",
  "slash",
  "linked",
  "through",
  "w",
  "h",
  "order",
  "row",
  "col",
  "peers",
  "adj4",
  "adj8",
  "ray",
  "step",
  "compass",
  "chain",
  "last",
  "stretch",
  "run_lengths",
  "connected",
  "cuts",
  "cut_edges",
  "matched",
  "reaches",
  "beam",
  "ahead",
  "within",
  "on_grid",
  "units_of",
  "x",
  "y",
  "cell",
  "edge",
  "rects",
  "width",
  "height",
  "inner",
  "rim",
]);

/** What a tiling has of a rectangle's geometry: its edges, and the groups
 * and walks over them. */
const TILING_HAS = new Set([
  "edges",
  "edge",
  "through",
  "connected",
  "cuts",
  "cut_edges",
  "reaches",
]);

/** Why a name of the rectangle's geometry is refused here, or `null`. */
export function noGeometry(n: string, env: Env): string | null {
  if (!GEOMETRY.has(n)) return null;
  if (env.tiling)
    return TILING_HAS.has(n) ? null : `${n}: a tiling has no rows, columns or squares`;
  return env.geometry ? null : `${n}: the board is cells alone, with no geometry`;
}

/** What only a tiling has. */
export const TILING_ONLY = new Set(["angles", "apex"]);

/** Layer `fn`'s value at place `at`: exact where its domain is not finite,
 * which a layer holds as a safe integer (`held`). */
export function layerRead(fn: string, layer: LayerSort, at: string, env: Env): Val {
  if (layer.carried && env.carrying !== fn)
    throw new CompileError(
      `${fn} is carried: no rule reads it, but its own assignment`,
    );
  const code = `p.${fn}[${at}]`;
  return { code, sort: layer.open ? INT : NUM };
}

/** `at(k)`, `v(k)` or `per(k)` of a clue `k`: a clue per value sits at its
 * element and the value both. */
export function clueField(fn: string, k: Val, env: Env): Val {
  if (k.sort.k !== "elem" || !k.sort.e.startsWith("clue "))
    throw new CompileError(`${fn} of ${show(k.sort)}: not a clue`);
  const kind = k.sort.e.slice("clue ".length);
  const decl = env.clues.get(kind) as ClueKind;
  if (decl.fields)
    throw new CompileError(`${fn} of a clue at the board: read its fields`);
  env.readsClues.yes = true;
  const code = `cl.${kind}.${fn === "v" ? "v" : "at"}[${k.code}]`;
  if (fn === "v") return { code, sort: decl.v };
  if (fn === "per" && !decl.per)
    throw new CompileError(`per of a ${kind} clue: it is one an element`);
  if (!decl.per) return { code, sort: decl.at };
  const read = fn === "at" ? "perElement" : "perValue";
  env.used.add(read);
  return { code: `${read}(${code})`, sort: fn === "at" ? decl.at : NUM };
}

/**
 * The readings of a rectangle on the grid, its arguments compiled: the ones
 * holding a cell, and a rectangle's cells, width, height, the edges inside it
 * and the edges round it. `null` for any other function, and for `cells` of
 * anything else.
 */
export function rectCall(fn: string, vs: readonly Val[], env: Env): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const isRect = (v?: Val): boolean => v?.sort.k === "elem" && v.sort.e === "rect";
  switch (fn) {
    case "cells":
      if (!isRect(vs[0])) return null;
      arity(1);
      env.used.add("rectCells");
      return { code: `rectCells(sp, ${vs[0].code})`, sort: setOf(elem("cell")) };
    case "rects":
      // The rectangles on the grid holding a cell, of a number of cells or,
      // where it is 0, of any.
      arity(2);
      expectElem(vs[0], "cell", fn);
      expect(vs[1], "num", fn);
      env.used.add("rectsOf");
      return {
        code: `rectsOf(sp, ${vs[0].code}, ${vs[1].code})`,
        sort: setOf(elem("rect")),
      };
    case "width":
    case "height":
    case "inner":
    case "rim": {
      arity(1);
      expectElem(vs[0], "rect", fn);
      const f = `rect${fn[0].toUpperCase()}${fn.slice(1)}`;
      env.used.add(f);
      return {
        code: `${f}(sp, ${vs[0].code})`,
        sort: fn === "width" || fn === "height" ? NUM : setOf(elem("edge")),
      };
    }
    default:
      return null;
  }
}

/**
 * The readings of a board of diagonals (Slant's), its arguments compiled:
 * the mark on the edges, the squares round a point and a square's corners,
 * which way a diagonal runs
 * through one, the points the diagonals join, and the cells joined across a
 * set of edges. `null` for any other function.
 */
export function diagonalCall(fn: string, vs: readonly Val[], env: Env): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const cell = (i: number): string => {
    expectElem(vs[i], "cell", fn);
    return vs[i].code;
  };
  // The mark on an edge, which only a technique reads.
  if (fn === env.edgeMark) {
    arity(1);
    if (env.answer) throw new CompileError("a rule reads the answer, never the marks");
    expectElem(vs[0], env.edgeMarkSort, fn);
    return {
      code: tapped(vs[0].code, `b.edgeCand(${vs[0].code})`, env, true),
      sort: setOf(NUM),
    };
  }
  switch (fn) {
    case "cells": {
      // The squares round a point; any other `cells` is not this board's.
      const s = vs[0]?.sort;
      if (s?.k !== "elem" || s.e !== "point") return null;
      arity(1);
      return { code: `sp.pointCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "points":
      arity(1);
      return { code: `sp.cellPoints[${cell(0)}]`, sort: setOf(elem("point")) };
    case "slash":
      arity(2);
      expectElem(vs[1], "point", fn);
      env.used.add("slash");
      return { code: `slash(sp, ${cell(0)}, ${vs[1].code})`, sort: NUM };
    case "linked": {
      arity(1);
      expectElem(vs[0], "point", fn);
      // The marks' own groups, kept while no value is placed, where nothing
      // is supposed.
      if (!env.answer && env.supposed.length === 0) {
        env.used.add("linkedOf");
        const k = vs[0].code;
        const set: Val = { code: `linkedOf(sp, b, ${k})`, sort: setOf(elem("point")) };
        // A point named is read again where the set is summed.
        return /^[A-Za-z_$][\w$]*$/.test(k) ? { ...set, group: k } : set;
      }
      // A cell's value read as the technique reads it, under any `with`.
      const x = Out.fresh("_x");
      const read = markRead("value", { code: x, sort: elem("cell") }, env, new Out(0));
      // The answer check reads one grid, so its groups are joined once a
      // check, not walked from each point.
      if (env.answer && env.supposed.length === 0 && env.scratch !== null) {
        if (!env.scratch.some((s) => s.startsWith("const _links ")))
          env.scratch.push(
            `const _links = pointGroups(sp, (${x}: number) => ${read.code});`,
          );
        env.used.add("pointGroups");
        return { code: `_links.of(${vs[0].code})`, sort: setOf(elem("point")) };
      }
      env.used.add("linked");
      return {
        code: `linked(sp, (${x}: number) => ${read.code}, ${vs[0].code})`,
        sort: setOf(elem("point")),
      };
    }
    case "through": {
      arity(2);
      const E = vs[1];
      if (!isSetOf(E.sort, "edge"))
        throw new CompileError(
          `through(c, E): E is a set of edges, not ${show(E.sort)}`,
        );
      // A set of edges a binder names is joined into groups once where it
      // is bound, so each square's is a lookup, not a walk over the set.
      if (E.at !== undefined && (env.hoist !== null || env.boundSets === true)) {
        const kept = E.edgeSet?.() ?? null;
        if (kept?.clues) env.readsClues.yes = true;
        const key =
          kept === null
            ? `edgeGroups(sp, ${E.code})`
            : `keptEdgeGroups(sp, b, ${kept.clues ? "cl" : "null"}, ${kept.fn}, ${kept.arg}, ${env.answerSort === "edge"})`;
        let groups = E.at.made.get(key);
        if (groups === undefined) {
          const t = Out.fresh("_eg");
          E.at.lines.push({ indent: 0, text: `const ${t} = ${key};` });
          groups = { code: t, sort: E.sort, at: E.at };
          E.at.made.set(key, groups);
        }
        if (kept !== null) env.visitAt?.groups.set(E.code, groups.code);
        env.used.add(kept === null ? "edgeGroups" : "keptEdgeGroups");
        return { code: `${groups.code}.of(${cell(0)})`, sort: setOf(elem("cell")) };
      }
      env.used.add("through");
      return { code: `through(sp, ${cell(0)}, ${E.code})`, sort: setOf(elem("cell")) };
    }
  }
  return null;
}

/**
 * The readings of a board turned about its centers (Galaxies'), its
 * arguments compiled: the squares round a center, the square one turns to
 * about it, and the mark naming a clue each cell may hold, read `name(c)`
 * and made by `mark(c, q)`. `null` for any other function.
 */
export function centerCall(
  fn: string,
  vs: readonly Val[],
  env: Env,
  out: Out,
): Val | null {
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const mark = env.cellMark;
  if (mark !== null && fn === mark.name) {
    arity(1);
    if (env.answer) throw new CompileError("a rule reads the answer, never the marks");
    expectElem(vs[0], "cell", fn);
    return { code: `b.markOf(${vs[0].code})`, sort: elem(`clue ${mark.kind}`) };
  }
  switch (fn) {
    case "cells": {
      const s = vs[0]?.sort;
      if (s?.k !== "elem" || s.e !== "center") return null;
      arity(1);
      return { code: `sp.centerCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "opp":
      arity(2);
      expectElem(vs[0], "cell", fn);
      expectElem(vs[1], "center", fn);
      env.used.add("opp");
      return { code: `opp(sp, ${vs[0].code}, ${vs[1].code})`, sort: elem("cell") };
    case "mark": {
      if (mark === null) throw new CompileError("mark(c, q): no mark names a clue");
      if (!env.concluding) throw new CompileError(`${fn} outside a conclusion`);
      arity(2);
      expectElem(vs[0], "cell", fn);
      expectElem(vs[1], `clue ${mark.kind}`, fn);
      const c = once(vs[0], out);
      const q = once(vs[1], out);
      // A cell off the grid, or one naming another clue, cannot name this
      // one: the conclusion is false. One naming it already is no fact.
      const t = Out.fresh("_mk");
      out.emit(`let ${t} = ${c.code} >= 0;`);
      out.emit(
        `if (${t}) { const _was = b.markOf(${c.code}); if (_was >= 0) ${t} = _was === ${q.code}; else if (fire === null) { b.markAt(${c.code}, ${q.code}); changed = true; } else facts.push(MARK, ${c.code}, ${q.code}); }`,
      );
      env.used.add("MARK");
      return { code: t, sort: BOOL };
    }
    default:
      return null;
  }
}

/**
 * A tiling's own functions (`tilingSpace`): the edges, dots and angles round
 * a face, a dot's edges and angles in its turn, an angle's edges and dot,
 * and the faces either side of an edge. `null` for any other function.
 */
export function tilingCall(fn: string, vs: readonly Val[], env: Env): Val | null {
  if (!env.tiling) return null;
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const of = vs[0]?.sort.k === "elem" ? vs[0].sort.e : null;
  switch (fn) {
    case "edges":
      arity(1);
      if (of === "face")
        return { code: `sp.faceEdges[${vs[0].code}]`, sort: setOf(elem("edge")) };
      if (of === "angle")
        return { code: `sp.angleEdges[${vs[0].code}]`, sort: setOf(elem("edge")) };
      expectElem(vs[0], "cell", fn);
      return { code: `sp.cellEdges[${vs[0].code}]`, sort: setOf(elem("edge")) };
    case "angles":
      arity(1);
      if (of === "face")
        return { code: `sp.faceAngles[${vs[0].code}]`, sort: setOf(elem("angle")) };
      expectElem(vs[0], "cell", fn);
      return { code: `sp.cellAngles[${vs[0].code}]`, sort: setOf(elem("angle")) };
    case "cells":
      if (of !== "face") return null;
      arity(1);
      return { code: `sp.faceCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    case "faces":
      arity(1);
      expectElem(vs[0], "edge", fn);
      return { code: `sp.edgeFaces[${vs[0].code}]`, sort: setOf(elem("face")) };
    case "apex":
      arity(1);
      expectElem(vs[0], "angle", fn);
      return { code: `sp.angleCell[${vs[0].code}]`, sort: elem("cell") };
  }
  return null;
}

/**
 * The relation over the edges (Loopy's pairs): `name(e, f)` the relations
 * still open between two edges, 1 alike and 2 opposite; `related(e)` the
 * edges related to `e`, itself among them; and `relate(e, f, d)` in a
 * conclusion, true where the two may still relate so. `null` for any other
 * function.
 */
export function relationCall(
  fn: string,
  vs: readonly Val[],
  env: Env,
  out: Out,
): Val | null {
  if (env.relation === null) return null;
  if (fn !== env.relation && fn !== "related" && fn !== "relate") return null;
  if (env.answer) throw new CompileError("a rule reads the answer, never the marks");
  const want = fn === "related" ? 1 : fn === "relate" ? 3 : 2;
  if (vs.length !== want)
    throw new CompileError(`${fn} takes ${want}, given ${vs.length}`);
  expectElem(vs[0], "edge", fn);
  if (fn === "related")
    return { code: `b.relatedOf(${vs[0].code})`, sort: setOf(elem("edge")) };
  expectElem(vs[1], "edge", fn);
  if (fn === env.relation)
    return { code: `b.pairOf(${vs[0].code}, ${vs[1].code})`, sort: setOf(NUM) };
  if (!env.concluding) throw new CompileError("relate outside a conclusion");
  expect(vs[2], "num", fn);
  const e = once(vs[0], out);
  const f = once(vs[1], out);
  const d = once(vs[2], out);
  out.emit(
    `if (b.pairOf(${e.code}, ${f.code}) === 6) { if (fire === null) { b.relateAt(${e.code}, ${f.code}, ${d.code}); changed = true; } else facts.push(RELATE, ${e.code}, 4 * ${f.code} + ${d.code}); }`,
  );
  env.used.add("RELATE");
  return {
    code: `((b.pairOf(${e.code}, ${f.code}) >> ${d.code}) & 1) !== 0`,
    sort: BOOL,
  };
}

/** `strike(e, d)` of an edge's mark, which is only ever narrowed. */
export function edgeStrike(fn: string, vs: readonly Val[], env: Env, out: Out): Val {
  if (fn === "place" || env.edgeMark === null)
    throw new CompileError(`${fn}(e, d): only a strike from an edge's mark`);
  expectElem(vs[0], env.edgeMarkSort, fn);
  const e = once(vs[0], out);
  expect(vs[1], "num", fn);
  const d = once(vs[1], out);
  out.emit(
    `if ((b.edgeCand(${e.code}) >> ${d.code}) & 1) { if (fire === null) { b.edgeStrikeAt(${e.code}, ${d.code}); changed = true; } else facts.push(STRIKE_EDGE, ${e.code}, ${d.code}); }`,
  );
  env.used.add("STRIKE_EDGE");
  return { code: "true", sort: BOOL };
}

/** The code of `edge(a, b)`, where `va` and `vb` are the terms whose code
 * is `a` and `b`. A neighbor bound by the loop over the other's `adj4` or
 * `adj8` names its edge by the loop's counter. */
export function edgeBetween(a: string, b: string, va: Val, vb: Val): string {
  for (const [x, y] of [
    [a, vb],
    [b, va],
  ] as const)
    for (const around of ["adj4", "adj8"])
      if (y.pos?.arr === `sp.${around}[${x}]`)
        return `sp.${around}Edges[${x}][${y.pos.i}]`;
  return `sp.edgeOf(${a}, ${b})`;
}

/** `matched(A, B)`: whether the cells of A and B pair off one to one, each
 * pair side by side. */
export function matchedCall(vs: readonly Val[], env: Env): Val {
  for (const S of vs)
    if (!isSetOf(S.sort, "cell"))
      throw new CompileError(`matched(${show(S.sort)}): A and B are sets of cells`);
  env.used.add("matched");
  return { code: `matched(sp, ${vs[0].code}, ${vs[1].code})`, sort: BOOL };
}
