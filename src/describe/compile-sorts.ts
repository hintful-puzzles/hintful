/**
 * What the compiler (`compile.ts`) works in: the sorts a term is given, a
 * compiled term, the code being written, the environment a description is
 * compiled in, and the reads of the marks that every part of it writes.
 */

import type { Recheck, Supposed } from "./compile-expr.ts";
import type {
  Definition,
  MarkSort,
  Says,
  SuppliedKind,
  Technique,
} from "./description.ts";
import type { Binder, Expr } from "./expr.ts";

/** A region's sort names its partition, as a clue's names its kind. */
export type ElemSort =
  | "cell"
  | "face"
  | "line"
  | "edge"
  | "slot"
  | "corner"
  | "point"
  | "center"
  | "rect"
  | "angle"
  | `clue ${string}`
  | `region ${string}`;

export type Sort =
  | { k: "num" }
  /** An integer of a domain that is not finite, computed exactly: the
   * runtime's `Exact`, a double while it is a safe integer. */
  | { k: "int" }
  | { k: "bool" }
  | { k: "none" }
  | { k: "elem"; e: ElemSort }
  | { k: "set"; of: Sort }
  | { k: "subsets"; of: Sort }
  | { k: "clues"; kind: string }
  /** A filling's values, read `f(x)`: an array by cell, `-1` off its set. */
  | { k: "fill" }
  /** A list of numbers in order, repeats kept: a list clue, or the lengths
   * `run_lengths(L, S)` gives. `null` where a clue kind has none at an element. */
  | { k: "list" }
  /** A cell's candidates where the domain is wide, no mask: its code is the
   * cell, and it is read by membership, a count, the least and a binder. */
  | { k: "cands" };

export const NUM: Sort = { k: "num" };
export const INT: Sort = { k: "int" };
export const BOOL: Sort = { k: "bool" };
export const elem = (e: ElemSort): Sort => ({ k: "elem", e });
export const setOf = (of: Sort): Sort => ({ k: "set", of });

/** A compiled term: TypeScript that computes it, once its statements have run. */
export interface Val {
  code: string;
  sort: Sort;
  /** For a name a term may read: the slot from which it is defined. */
  at?: Slot;
  /** For a name bound by a loop over an array: the array's code and the
   * loop's counter, which is the name's index in it. */
  pos?: { arr: string; i: string };
  /** For a name bound by `=`: the code of the term it names. */
  names?: string;
  /** For a name bound to each member of a mask or a cell's candidates: a
   * number a mask can hold, read in one with no guard ({@link maskHas}). */
  bit?: true;
  /** For a name bound to each subset of an array: the array's code, the
   * loop's counter, whose bits name the members, and the slot ahead of the
   * loop. */
  members?: { els: string; k: string; pre: Slot };
  /** For the set `linked(k)` on the marks: the code of `k`, so that a sum
   * over the set is read from the sums kept over the groups
   * (`linkedAggregate`). */
  group?: string;
  /** For a name bound to a set of edges whose condition reads the marks only
   * at the edge or its two squares: that condition, compiled as a function
   * of the module, and the one number it reads from outside, so the groups
   * the set joins are kept on the marks (`keptEdgeSet`). Made where a
   * `through` first asks, so a set no walk reads adds no function. */
  edgeSet?: () => { fn: string; arg: string; clues: boolean } | null;
}

/** The code a set is, a name bound by `=` read as its term: so a filling of
 * `K = cells(r)` and a sum over `cells(r)` are over one set. */
export const setKey = (v: Val): string => v.names ?? v.code;

/**
 * A place in the code, just after a name is bound, where a term that reads
 * nothing bound later can be computed once (§ "What a technique compiles
 * to"). `loops` counts the loops open there, so a term used inside more of
 * them is computed fewer times in the slot.
 */
export interface Slot {
  seq: number;
  indent: number;
  loops: number;
  lines: Line[];
  /** The terms computed here, by their code, each to its name. */
  made: Map<string, Val>;
}

export interface Line {
  indent: number;
  text: string;
}

export interface Block {
  id: number;
  loop: boolean;
  /** The statement that opened it. */
  line: Line;
}

/**
 * The aggregates and quantifiers a binding's premise and conclusion have
 * computed, each kept where it was computed, by its statement and the
 * code of the names it reads: so `bulbs(c)` stated three times in one
 * conclusion counts once. One is read again only where the code that made
 * it has surely run, and run since the last fact: in its own block, or one
 * nested in it that is no loop's, and with no fact compiled in between
 * (a solve makes each fact as it concludes it). A loop is never entered,
 * since a later pass of it may follow a fact made further down it.
 */
export interface Shared {
  readonly made: Map<string, { out: Out; path: readonly Block[]; val: Val }>;
}

/** Whether code written to `cur` may read a term written to `out` when its
 * blocks were `path`. */
export function sharedReach(out: Out, path: readonly Block[], cur: Out): boolean {
  let o: Out | null = cur;
  while (o !== null && o !== out) o = o.within;
  if (o === null) return false;
  const now = out.blocks;
  if (now.length < path.length) return false;
  for (let i = 0; i < path.length; i++) if (now[i].id !== path[i].id) return false;
  for (let i = path.length; i < now.length; i++) if (now[i].loop) return false;
  for (let p: Out = cur; p !== out; p = p.within as Out)
    if (p.blocks.some((b) => b.loop)) return false;
  return true;
}

export function show(s: Sort): string {
  switch (s.k) {
    case "elem":
      return s.e;
    case "set":
      return `set of ${show(s.of)}`;
    case "subsets":
      return `subsets of ${show(s.of)}`;
    case "clues":
      return `clues(${s.kind})`;
    default:
      return s.k;
  }
}

/** A set of values is a bitmask; any other set an array. */
export const isMask = (s: Sort): boolean => s.k === "set" && s.of.k === "num";
export const isArray = (s: Sort): boolean => s.k === "set" && s.of.k !== "num";
export const scalar = (s: Sort): boolean =>
  s.k === "num" || s.k === "elem" || s.k === "none";

/** The sort a supplied term of a kind is checked as: an element or a set of
 * them is a cell's to the checker, which asks only that it be elements. */
export function suppliedSort(kind: Exclude<SuppliedKind, "words">): Sort {
  const cell: Sort = { k: "elem", e: "cell" };
  switch (kind) {
    case "flag":
    case "several":
      return { k: "bool" };
    case "number":
      return { k: "num" };
    case "element":
      return cell;
    case "elements":
      return { k: "set", of: cell };
  }
}

/** Whether the game supplies a term or mark a technique says. */
export const supplies = (t: Technique): boolean =>
  t.says?.variants.some(
    (v) =>
      v.terms.some((x) => x.supplied !== null && x.supplied !== "several") ||
      v.marks.some((m) => m.expr === null),
  ) ?? false;

export function tsType(s: Sort): string {
  if (s.k === "bool") return "boolean";
  if (s.k === "int") return "number | bigint";
  if (isArray(s)) return "readonly number[]";
  if (s.k === "list") return "Int32Array | null";
  return "number";
}

export class CompileError extends Error {}

/** The code being written: statements at an indent, the slots among them,
 * and fresh names. */
export class Out {
  readonly entries: (Line | Slot)[] = [];
  private depth: number;
  /** The blocks open here, innermost last, each marked where it is a
   * loop's: what a term computed in one may be read from (`Shared`). */
  readonly blocks: Block[] = [];
  /** The code this is written for, inside a block of its own that is no
   * loop's: a connective's right side (`shortCircuit`). `null` for code
   * whose place is not known as it is written. */
  readonly within: Out | null;
  private static n = 0;
  private static owner: string | null = null;
  private static slots = 0;
  private static blockIds = 0;
  constructor(depth: number, within: Out | null = null) {
    this.depth = depth;
    this.within = within;
  }
  emit(line: string): void {
    this.entries.push({ indent: this.depth, text: line });
  }
  open(line: string): void {
    this.emit(line);
    this.depth++;
    this.blocks.push({
      id: ++Out.blockIds,
      loop: /^(for|while|do)\b/.test(line),
      line: this.entries.at(-1) as Line,
    });
  }
  close(line = "}"): void {
    this.depth--;
    this.blocks.pop();
    this.emit(line);
  }
  /** A slot here, `loops` deep. */
  slot(loops: number): Slot {
    const s: Slot = {
      seq: ++Out.slots,
      indent: this.depth,
      loops,
      lines: [],
      made: new Map(),
    };
    this.entries.push(s);
    return s;
  }
  /** `inner`'s statements and slots here, at this indent. */
  append(inner: Out): void {
    for (const e of inner.entries) {
      e.indent += this.depth;
      this.entries.push(e);
    }
  }
  text(): string[] {
    const pad = (n: number): string => "  ".repeat(n);
    return unreadBindingsDropped(
      this.entries.flatMap((e) =>
        "text" in e
          ? [`${pad(e.indent)}${e.text}`]
          : e.lines.map((l) => `${pad(e.indent + l.indent)}${l.text}`),
      ),
    );
  }
  /** A name of the function being written (`own`). */
  static fresh(prefix: string): string {
    if (Out.owner === null)
      throw new CompileError(`${prefix}: a fresh name outside any function`);
    return `${prefix}${++Out.n}`;
  }
  /** A name at the module's scope that the function being written keeps,
   * so its own name tells it from another function's. */
  static held(prefix: string): string {
    if (Out.owner === null || Out.owner === "")
      throw new CompileError(`${prefix}: a kept name outside a named function`);
    return `${Out.owner}${prefix}${Out.fresh("")}`;
  }
  /** `write`, which writes the function `owner`, its fresh names numbered
   * from the first: a function's text moves only when its own code does,
   * not when a function written before it takes a name more. A function
   * written while another is, as a kept definition is at its first call,
   * hands the other back its count. `""` owns code that is thrown away. */
  static own<T>(owner: string, write: () => T): T {
    const [n, outer] = [Out.n, Out.owner];
    Out.n = 0;
    Out.owner = owner;
    try {
      return write();
    } finally {
      Out.n = n;
      Out.owner = outer;
    }
  }
  /** Where the fresh names have reached, so a probe whose code is thrown
   * away can give back those it took (`rewind`): what another description
   * compiles to does not move with a probe it never uses. */
  static mark(): number {
    return Out.n;
  }
  static rewind(n: number): void {
    Out.n = n;
  }
  static reset(): void {
    Out.n = 0;
    Out.owner = null;
    Out.slots = 0;
  }
}

/** A name for what a rung keeps across its calls where it does (`held`),
 * declared at the module's scope, or else one of its own. */
export function heldName(prefix: string, env: Env): string {
  return env.scratch !== null && env.held !== undefined
    ? Out.held(prefix)
    : Out.fresh(prefix);
}

/**
 * `lines` without each loop's binding of its element that nothing in the
 * loop reads: a read the loop's counter answers (`edge(x, y)` over
 * `adj4(x)`) can leave the element itself unread. So can a supposition's
 * square and value (`suppose`), where its body reads no marks (Star Battle's
 * `fits`, which reads only its filling). A line's scope is the lines after
 * it indented as deep or deeper.
 */
function unreadBindingsDropped(lines: string[]): string[] {
  const indent = (l: string): number => l.length - l.trimStart().length;
  return lines.filter((line, i) => {
    // An array's element, or a stated set's member (`bindingLoops`), or a
    // supposition's square or value, each a read with no effect.
    const m =
      /^\s*const (v_\w+) = (?:_a\d+\[_i\d+\]|(?:_i\d+ === \d+ \? [\w.[\]]+ : )*[\w.[\]]+);$/.exec(
        line,
      ) ?? /^\s*const (_w[cd]\d+) = [\w.[\]]+;$/.exec(line);
    if (m === null) return true;
    const read = new RegExp(`\\b${m[1]}\\b`);
    const depth = indent(line);
    for (let j = i + 1; j < lines.length && indent(lines[j]) >= depth; j++)
      if (read.test(lines[j])) return true;
    return false;
  });
}

/** A clue kind's sorts. A clue at the board has no place or value of its
 * own (`none`), and its fields are read as functions of it. */
export interface ClueKind {
  at: Sort;
  v: Sort;
  /** A clue at its element for each value, dealt at `perPlace(x, d)`. */
  per: boolean;
  /** A clue that is a list of its values, dealt as `ListClues`. */
  list: boolean;
  /** A clue at the board's fields, by name: the element sort a field is one
   * of where it is one an element, and its values' sort. */
  fields: ReadonlyMap<string, { at: ElemSort | null; v: Sort }> | null;
}

export interface Env {
  /** The binder a technique's solve run visits only where a fact reached
   * (`footprint.ts`): its loop skips an element `_visit` does not hold. */
  visitBinder?: Binder;
  /** Where `_visit` is read, just ahead of the visited binder's loop and
   * after the groups of the sets bound before it are made; and those groups,
   * by the code of the set, as `through` joins them. */
  visitAt?: { slot: Slot | null; groups: Map<string, string> };
  /** Where a technique's bindings take a count of the facts made and check
   * it before they fire (`rechecked`); absent elsewhere. */
  recheck?: Recheck;
  defs: ReadonlyMap<string, Definition>;
  /** The break clauses (`Description.breaks`), whose terms a witness reads
   * where one held, and each term's sort as first read there, by
   * `break.term`, for the technique terms that say it. */
  breaks: {
    of: ReadonlyMap<
      string,
      { params: string[]; terms: { name: string; expr: Expr }[] }
    >;
    sorts: Map<string, Sort>;
  };
  clues: ReadonlyMap<string, ClueKind>;
  /** The partitions the board deals, by name. */
  regions: ReadonlySet<string>;
  /** The partition among the units, whose parts are the space's boxes: its
   * name, or `null` where there is none. */
  boxes: string | null;
  /** Whether the board deals that partition (Solo's jigsaw blocks), rather
   * than a formula cutting it. */
  boxesDealt: boolean;
  /** Whether the space has its diagonals. */
  diagonals: boolean;
  /** Whether the answer's domain is a cell's (it reads `c`), so `domain`
   * alone names nothing. */
  cellDomain: boolean;
  /** The description's sizes the grid does not give, which the board deals
   * where a technique reads one: those read, by name. */
  sizes: { names: ReadonlySet<string>; read: Set<string> };
  /** The runtime helpers the code calls, to import. */
  used: Set<string>;
  /** The declarations of the arrays a technique's comprehensions reuse, made
   * once a call; `null` outside a technique's body. */
  scratch: string[] | null;
  /** In a rung's body, the module's declarations of the arrays as long as the
   * board that its fillings and projections keep across its calls, each
   * with the list it last wrote, which its next use clears: made once a
   * call, they cost Net's deals a tenth, its rungs run a hundred thousand
   * times a deal. A technique run on placing or striking runs inside its
   * own call, and makes its own. */
  held?: string[];
  /** Whether `strike` and `place` may be called: in a conclusion only. */
  concluding: boolean;
  /** Where a technique's `says.fact` is read: at each `place` and `strike`
   * of its conclusion, beside the fact, on a hint's path only. `fields` is
   * the type of what it reads, set where it is compiled. */
  factSays?: {
    says: NonNullable<Says["fact"]>;
    buffer: string;
    fields: { terms: string[]; marks: string[] };
    /** Each term's sort, for checking the clauses that say it. */
    sorts: Map<string, Sort>;
  };
  /** Where the code is the answer check, which reads a whole grid's values
   * (`g`) rather than the marks: whether the description has a repeated
   * value, which the check then reads with its count from the description
   * (`_repeat`, `_times`) rather than from the marks; and whether the grid
   * may be partly undecided, 0 where it is, so a read of an undecided
   * element stops the term (the violation check). `null` elsewhere. */
  answer: { repeats: boolean; partial?: boolean } | null;
  /** Where the code reads a planning game's position (`p`): its layers, each
   * read as a function of a cell, or of a face. `null` elsewhere. */
  position: ReadonlyMap<string, LayerSort> | null;
  /** The carried layer whose assignment is being compiled, the one place a
   * read of it is allowed; `null` elsewhere. */
  carrying: string | null;
  /** The tables the board deals, by name: a planning game's. */
  tables: ReadonlyMap<string, { of: Sort[]; to: Sort }>;
  /** Whether the space is a rectangle, with the geometry that reads one;
   * false on a board of cells alone. */
  geometry: boolean;
  /** Whether the space is a tiling (`tilingSpace`): edges join its cells,
   * and it has faces and angles, but nothing of a rectangle's. */
  tiling: boolean;
  /** The size counting the faces, a second sort of element, or `null` where
   * the space has none. */
  faces: string | null;
  /** What holds a value of the answer, which `known`, `value`, `cand`,
   * `place` and `strike` read: a cell, or an edge (Separate's walls). */
  answerSort: "cell" | "edge";
  /** The cell a cell `c`'s value `d` names (the answer's `to`), which `to(c)`
   * and `chain(c)` read; absent where the answer names none. */
  to?: Expr | null;
  /** Whether the answer's values run past 31, so a cell's candidates are
   * read through the marks' methods and never as a mask. */
  wide?: boolean;
  /** Whether the function keeps each cell's candidates as it first reads
   * them (`cands`), until a firing it goes on from changes the marks. */
  memo: boolean;
  /** What a binding's premise and conclusion have computed that a later
   * read of the same term may share; absent elsewhere. */
  shared?: Shared;
  /** The functions of the definitions a rung keeps the value of, for each
   * argument, while its kept candidates hold (`rungKept`), each to the maps
   * a call of it fills. Absent outside a rung. */
  memos?: Map<string, readonly string[]>;
  /** Set where a technique's body reads a cell's candidates through
   * `cands`, which it then keeps; absent outside a technique. */
  readsCands?: { yes: boolean };
  /** Set where the code records what it reads, as the names of the arrays a
   * read of a cell's marks or an edge's pushes its element to: the hint's
   * second pass, never the solve (`says.reads`). */
  reads?: { cells: string; edges: string };
  /** Whether the code reads what the board deals, its clues or partitions,
   * so the function takes them. */
  readsClues: { yes: boolean };
  /** Where a technique's body moves terms to; `null` outside one, and in
   * code that is compiled only for its sort. */
  hoist: Hoist | null;
  /** The start of the function the code is written in, where a table kept
   * for the board is fetched once: kept where `hoist` is dropped only so
   * nothing moves out of a loop, and `null` in a probe or another function. */
  boardRoot?: Slot | null;
  /** Set where nothing is moved (`hoist` is `null`) but the code is a
   * technique's own, run where its binders are bound: a set a binder names
   * is still joined into groups once, there (`through`). */
  boundSets?: boolean;
  /** Whether a technique's body keeps a projection of fillings, valid while
   * the kept candidates are: then it counts their generations in `_epoch`.
   * `null` outside a technique. */
  epoch: { used: boolean } | null;
  /** Where a planning game's function computes each definition that reads
   * itself once, ahead of its body: the statements, and the array of each
   * such definition's set, by name. `null` elsewhere. */
  prelude: Prelude | null;
  /** The relations the board deals, each a set of cells for each cell, read
   * `name(c)`: a planning game's. */
  relations: ReadonlySet<string>;
  /** The name of the mark the description keeps on each edge, read
   * `name(e)` as the values it may still hold, or `null` where it keeps
   * none. */
  edgeMark: string | null;
  /** What the mark `edgeMark` names sits on: the edges, a tiling's angles,
   * or the cells where the answer is on the edges. */
  edgeMarkSort: MarkSort;
  /** The name of the relation the description keeps over the edges, read
   * `name(e, f)` and `related(e)` and made by `relate(e, f, d)`, or `null`
   * where it keeps none. */
  relation: string | null;
  /** The mark the description keeps on each cell naming a clue of `kind`,
   * read `name(c)` and made by `mark(c, q)`, or `null` where it keeps none. */
  cellMark: { name: string; kind: string } | null;
  /** The suppositions of the `with`s the code is inside, innermost first. */
  supposed: readonly Supposed[];
  /** The definitions a game's techniques keep for each argument, by name,
   * each compiled once as an exported function of the module
   * (`keptDefinition`); `null` where nothing is kept. */
  kept: {
    defs: Map<
      string,
      {
        sort: Sort;
        clues: boolean;
        board: boolean;
        code: string;
        /** The maps a call fills, where a rung keeps it (`rungKept`). */
        maps?: readonly string[];
      }
    >;
    /** The terms summed over a group (`linkedAggregate`), each compiled once
     * as a function of the module, by what it sums. */
    terms: Map<string, { fn: string; clues: boolean }>;
    /** The module's runtime helpers, which a function first compiled
     * inside a probe still needs. */
    used: Set<string>;
  } | null;
}

/** What a position's layer holds a value of (an element's, or the board's
 * one value), whether no rule reads it, and whether its domain is not
 * finite. */
export interface LayerSort {
  readonly over: ElemSort | "board";
  readonly carried: boolean;
  readonly open: boolean;
}

interface Prelude {
  readonly out: Out;
  readonly fixed: Map<string, string>;
  /** The definition whose least fixed point is being compiled, and its
   * array, while its body is: a read of it inside is a read of the array. */
  fixing: { name: string; arr: string } | null;
}

export interface Hoist {
  /** The function's start, for a term that reads no bound name. */
  root: Slot;
  /** The loops open where the code is being written. */
  loops: number;
  /** Whether `value` and `known` may be read early: only where nothing the
   * technique concludes is a placement, the one fact that changes them. */
  marks: boolean;
}

export type Scope = ReadonlyMap<string, Val>;

export function expect(v: Val, k: Sort["k"], what: string): void {
  if (v.sort.k !== k)
    throw new CompileError(`${what}: expected ${k}, got ${show(v.sort)}`);
}

export function expectElem(v: Val, e: ElemSort, what: string): void {
  if (!(v.sort.k === "elem" && v.sort.e === e) && v.sort.k !== "none")
    throw new CompileError(`${what}: expected a ${e}, got ${show(v.sort)}`);
}

export const isSetOf = (s: Sort, e: ElemSort): boolean =>
  s.k === "set" && s.of.k === "elem" && s.of.e === e;

/** The elements that hold the answer's values, as code: the space's cells,
 * or its edges. */
export const answerSet = (env: Env): string =>
  env.answerSort === "edge" ? "sp.edges" : "sp.cells";
export const answerCount = (env: Env): string => `${answerSet(env)}.length`;

/** Bind a value to a const when it will be read more than once. */
export function once(v: Val, out: Out): Val {
  if (/^[A-Za-z_$][\w$]*$/.test(v.code) || /^-?\d+$/.test(v.code)) return v;
  const t = Out.fresh("_t");
  out.emit(`const ${t} = ${v.code};`);
  return v.group === undefined
    ? { code: t, sort: v.sort }
    : { code: t, sort: v.sort, group: v.group };
}

export function sameSort(a: Sort, b: Sort): boolean {
  if (a.k === "none" || b.k === "none") return scalar(a) && scalar(b);
  if (a.k !== b.k) return false;
  if (a.k === "elem" && b.k === "elem") return a.e === b.e;
  if (a.k === "set" && b.k === "set") return sameSort(a.of, b.of);
  return true;
}

/** A cell's candidates through the function's `cands`, read once a cell. */
export function candOf(c: string, env: Env): string {
  if (env.readsCands) env.readsCands.yes = true;
  return tapped(
    c,
    `(cands[${c}] >= 0 ? cands[${c}] : (cands[${c}] = ${marksRead("cand", c)}))`,
    env,
  );
}

/** `code`, a read of element `c`'s marks, which also records `c` where the
 * code records its reads. */
export function tapped(c: string, code: string, env: Env, edge = false): string {
  if (env.reads === undefined) return code;
  return `(${edge ? env.reads.edges : env.reads.cells}.push(${c}), ${code})`;
}

/**
 * Cell `c`'s marks as the solve's arrays hold them, read in place: a method
 * call here was 5 to 20% of a described game's deal, because a compiled
 * technique is past V8's inlining budget and each read stayed a call.
 */
export function marksRead(
  fn: "known" | "value" | "cand",
  c: string,
  env?: Env,
): string {
  const code =
    fn === "known"
      ? `(b.grid[${c}] !== 0)`
      : fn === "value"
        ? `(b.grid[${c}] || -1)`
        : `b.cands[${c}]`;
  return env === undefined ? code : tapped(c, code, env);
}

/** Whether the number `x` is in the bitmask `m`. A shift counts mod 32, so
 * a number outside 0 to 31 (a total less what is placed, a value read as -1
 * where unknown) would read another bit: it is in no mask. A small literal,
 * or a name drawn from a mask's members (`inRange`), needs no guard: the
 * guard on a candidate read cost Towers' and Unequal's solves a tenth. */
export const maskHas = (m: string, x: string, inRange = false): string =>
  inRange || (/^\d+$/.test(x) && Number(x) < 32)
    ? `((${m} >> ${x}) & 1) !== 0`
    : `(${x}) >>> 0 < 32 && ((${m} >> ${x}) & 1) !== 0`;

/** Whether cell `c` may still hold `d`, read in place as {@link marksRead},
 * or of a wide domain's words. */
export const hasRead = (c: string, d: string, env: Env, inRange: boolean): string =>
  tapped(
    c,
    env.wide ? `b.has(${c}, ${d})` : `(${maskHas(`b.cands[${c}]`, d, inRange)})`,
    env,
  );

/** A wide domain's candidates read otherwise than through its methods. */
export const NOT_WIDE =
  "a wide domain's candidates are read by membership, a count, `first` and a binder";

/** A set of numbers made as a mask where the values run past what one holds:
 * bind its members, or count them, instead. */
export const MASK_IN_WIDE =
  "a set of numbers is a mask of 32 bits, which a wide domain's values pass: bind its members";

/** `known(c)`, `value(c)` or `cand(c)` of cell `c`: the grid's in the answer
 * check, the marks' in a technique, under the suppositions in force. */
export function markRead(
  fn: "known" | "value" | "cand",
  c: Val,
  env: Env,
  out: Out,
): Val {
  if (env.answer) {
    if (fn === "cand")
      throw new CompileError("a rule reads the answer, never the marks");
    if (env.answer.partial) {
      env.used.add(fn === "known" ? "knownIn" : "heldIn");
      return fn === "known"
        ? { code: `knownIn(g, ${c.code}, _rd)`, sort: BOOL }
        : { code: `heldIn(g, ${c.code}, _rd)`, sort: NUM };
    }
    return fn === "known"
      ? { code: `(g[${c.code}] > 0)`, sort: BOOL }
      : { code: `(g[${c.code}] || -1)`, sort: NUM };
  }
  if (fn === "cand" && env.wide) {
    if (env.supposed.length > 0)
      throw new CompileError("a supposition reads no wide domain's candidates");
    return { code: once(c, out).code, sort: { k: "cands" } };
  }
  if (env.supposed.length === 0 && !(fn === "cand" && env.memo)) {
    const sort = fn === "known" ? BOOL : fn === "value" ? NUM : setOf(NUM);
    return { code: marksRead(fn, c.code, env), sort };
  }
  const x = once(c, out).code;
  if (fn === "known")
    return {
      code: supposedRead(x, env, () => "true", marksRead("known", x, env)),
      sort: BOOL,
    };
  if (fn === "value")
    return {
      code: supposedRead(x, env, (s) => s.value, marksRead("value", x, env)),
      sort: NUM,
    };
  const plain = env.memo ? candOf(x, env) : marksRead("cand", x, env);
  return {
    code: supposedRead(x, env, (s) => `(1 << ${s.value})`, plain),
    sort: setOf(NUM),
  };
}

/** A read of cell `x`'s marks under the suppositions in force, innermost
 * first: `held(s)` is the read where `x` is the supposed cell `s`. */
export function supposedRead(
  x: string,
  env: Env,
  held: (s: Supposed) => string,
  plain: string,
): string {
  return env.supposed.reduceRight(
    (acc, s) =>
      `(${s.many ? `${s.cell}.includes(${x})` : `${x} === ${s.cell}`} ? ${held(s)} : ${acc})`,
    plain,
  );
}

/** A side of an exact operation: a number of a finite domain is a safe
 * integer, so an exact one as it is. */
function exactSide(v: Val, op: string): string {
  if (v.sort.k !== "int") expect(v, "num", op);
  return v.code;
}

/** The runtime's exact arithmetic, by operator. */
const EXACT_OP = {
  "+": "iadd",
  "-": "isub",
  "*": "imul",
  "/": "idiv",
  mod: "imod",
} as const;

/**
 * An operation one side of which is an exact integer: the result of
 * arithmetic is one too. An exact value is a double exactly where it is a
 * safe integer, so `===` and `<` compare two of them, or one and a number,
 * as they are. `/` truncates and `mod` takes the dividend's sign, as on
 * numbers.
 */
export function exact(
  op: Extract<Expr, { k: "bin" }>["op"],
  a: Val,
  b: Val,
  env: Env,
): Val {
  switch (op) {
    case "=":
    case "!=":
      return {
        code: `(${exactSide(a, op)} ${op === "=" ? "===" : "!=="} ${exactSide(b, op)})`,
        sort: BOOL,
      };
    case "<":
    case "<=":
    case ">":
    case ">=":
      return { code: `(${exactSide(a, op)} ${op} ${exactSide(b, op)})`, sort: BOOL };
    case "+":
    case "-":
    case "*":
    case "/":
    case "mod": {
      const fn = EXACT_OP[op];
      env.used.add(fn);
      return { code: `${fn}(${exactSide(a, op)}, ${exactSide(b, op)})`, sort: INT };
    }
    default:
      throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
  }
}

export function clueKindArg(args: readonly Expr[], env: Env): string {
  const a = args[0];
  if (args.length !== 1 || a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError(
      `clues(kind) names a clue kind of the description${a?.k === "name" ? `, and ${a.name} is none` : ""}`,
    );
  return a.name;
}

/** The clue at the board's field named `fn`, with its kind, or `null`. */
export function fieldOf(
  fn: string,
  env: Env,
): { kind: string; at: ElemSort | null; v: Sort } | null {
  for (const [kind, c] of env.clues) {
    const f = c.fields?.get(fn);
    if (f !== undefined) return { kind, ...f };
  }
  return null;
}

/** `times(d)` in the answer check: the description's count for its repeated
 * value, 1 for every other. */
export const timesOf = (d: string, env: Env): string =>
  env.answer === null
    ? `(${d} === b.repeat ? b.times : 1)`
    : env.answer.repeats
      ? `(${d} === _repeat ? _times : 1)`
      : "1";
