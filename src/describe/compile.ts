/**
 * The compiler from a description's techniques to TypeScript
 * (`openspec/changes/compile-the-latin-ladder/design.md`): each technique
 * becomes a function over `engine/describe-runtime.ts`'s marks and grid that enumerates its
 * bindings in the order its binders are written, and fires the first whose
 * conclusion changes the marks.
 *
 * Every term is given a sort before any code is written, and the sort decides
 * the representation: a number, a truth, an element as its index, a set of
 * values as a bitmask, a set of elements as an ordered array. A formula that
 * reads a name or calls a function the grid does not have, or mixes sorts,
 * is refused here, so a description that compiles is well-sorted.
 */

import { MADE } from "../engine/marks-made.ts";
import {
  type Slot as ClauseSlot,
  STATED_INNER_WORDS,
  STATED_WORDS,
  slotsOf,
} from "../engine/stated-clauses.ts";
import {
  cellMarkOf,
  type Definition,
  type ClueKind as DescribedClueKind,
  type Description,
  type DescriptionJson,
  edgeMarkOf,
  type LibraryJson,
  loadDescription,
  type MarkSort,
  parseTechnique,
  relationMarkOf,
  type Says,
  type StatedClauses,
  type Technique,
  UNPLACED,
  type Wording,
  withEveryVariation,
} from "./description.ts";
import { type Binder, type Expr, parse } from "./expr.ts";
import { footprintOf } from "./footprint.ts";

/** A region's sort names its partition, as a clue's names its kind. */
type ElemSort =
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

type Sort =
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

const NUM: Sort = { k: "num" };
const INT: Sort = { k: "int" };
const BOOL: Sort = { k: "bool" };
const elem = (e: ElemSort): Sort => ({ k: "elem", e });
const setOf = (of: Sort): Sort => ({ k: "set", of });

/** A compiled term: TypeScript that computes it, once its statements have run. */
interface Val {
  code: string;
  sort: Sort;
  /** For a name a term may read: the slot from which it is defined. */
  at?: Slot;
  /** For a name bound by a loop over an array: the array's code and the
   * loop's counter, which is the name's index in it. */
  pos?: { arr: string; i: string };
  /** For a name bound by `=`: the code of the term it names. */
  names?: string;
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
const setKey = (v: Val): string => v.names ?? v.code;

/**
 * A place in the code, just after a name is bound, where a term that reads
 * nothing bound later can be computed once (§ "What a technique compiles
 * to"). `loops` counts the loops open there, so a term used inside more of
 * them is computed fewer times in the slot.
 */
interface Slot {
  seq: number;
  indent: number;
  loops: number;
  lines: Line[];
  /** The terms computed here, by their code, each to its name. */
  made: Map<string, Val>;
}

interface Line {
  indent: number;
  text: string;
}

interface Block {
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
interface Shared {
  readonly made: Map<string, { out: Out; path: readonly Block[]; val: Val }>;
}

/** Whether code written to `cur` may read a term written to `out` when its
 * blocks were `path`. */
function sharedReach(out: Out, path: readonly Block[], cur: Out): boolean {
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

function show(s: Sort): string {
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
const isMask = (s: Sort): boolean => s.k === "set" && s.of.k === "num";
const isArray = (s: Sort): boolean => s.k === "set" && s.of.k !== "num";
const scalar = (s: Sort): boolean => s.k === "num" || s.k === "elem" || s.k === "none";

function tsType(s: Sort): string {
  if (s.k === "bool") return "boolean";
  if (s.k === "int") return "number | bigint";
  if (isArray(s)) return "readonly number[]";
  if (s.k === "list") return "Int32Array | null";
  return "number";
}

class CompileError extends Error {}

/** The code being written: statements at an indent, the slots among them,
 * and fresh names. */
class Out {
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
function heldName(prefix: string, env: Env): string {
  return env.scratch !== null && env.held !== undefined
    ? Out.held(prefix)
    : Out.fresh(prefix);
}

/**
 * `lines` without each loop's binding of its element that nothing in the
 * loop reads: a read the loop's counter answers (`edge(x, y)` over
 * `adj4(x)`) can leave the element itself unread. A line's scope is the
 * lines after it indented as deep or deeper.
 */
function unreadBindingsDropped(lines: string[]): string[] {
  const indent = (l: string): number => l.length - l.trimStart().length;
  return lines.filter((line, i) => {
    // An array's element, or a stated set's member (`bindingLoops`).
    const m =
      /^\s*const (v_\w+) = (?:_a\d+\[_i\d+\]|(?:_i\d+ === \d+ \? [\w.[\]]+ : )*[\w.[\]]+);$/.exec(
        line,
      );
    if (m === null) return true;
    const read = new RegExp(`\\b${m[1]}\\b`);
    const depth = indent(line);
    for (let j = i + 1; j < lines.length && indent(lines[j]) >= depth; j++)
      if (read.test(lines[j])) return true;
    return false;
  });
}

/** An array the size of the board, or of a line: what a loop over it costs,
 * in halves of a power of the board's size. */
const BOARD_ARRAY = /^sp\.(cells|edges|points|corners|slots|centers|faces|angles)\b/;
const LINE_ARRAY = /^sp\.(lines|rows|cols|lineCells\[)/;
/** The runtime's walks, by what each walks. */
const BOARD_WALKS =
  /\b(through|throughWhere|linked|reaches|connected|cuts|edgeGroups|pointGroups|beam|look)\(/;
const LINE_WALKS = /\b(stretch|ray|chain)\(/;

/**
 * How a technique's dearest read grows with the board, from its code: the
 * loops round it over the board or a line, and a walk of the board or a line
 * it makes, each a power of the board's size, a line's a half (§ "What a
 * technique compiles to"). In halves: 4 is `n^2`. A kept structure's read is
 * a lookup, and costs nothing here.
 */
function techniqueGrowth(lines: readonly string[]): number {
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
const MAX_GROWTH = 6;

/** The length below which a set a comprehension makes is scanned for a
 * member, not stamped (`addOnce`). */
const SCANNED_SET = 16;
export const WARN_GROWTH = 5;

/** A growth in halves as a power: 3 is `n^1.5`. */
const power = (halves: number): string =>
  halves === 0 ? "1" : halves === 2 ? "n" : `n^${halves / 2}`;

/** A clue kind's sorts. A clue at the board has no place or value of its
 * own (`none`), and its fields are read as functions of it. */
interface ClueKind {
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

interface Env {
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
  clues: ReadonlyMap<string, ClueKind>;
  /** The partitions the board deals, by name. */
  regions: ReadonlySet<string>;
  /** The partition among the units, whose parts are the space's boxes: its
   * name, or `null` where there is none. */
  boxes: string | null;
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
   * (`_repeat`, `_times`) rather than from the marks. `null` elsewhere. */
  answer: { repeats: boolean } | null;
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
  /** The suppositions of the `with`s the code is inside, innermost first:
   * the names of the cell and of the value it is supposed to hold. */
  supposed: readonly { cell: string; value: string }[];
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
interface LayerSort {
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

interface Hoist {
  /** The function's start, for a term that reads no bound name. */
  root: Slot;
  /** The loops open where the code is being written. */
  loops: number;
  /** Whether `value` and `known` may be read early: only where nothing the
   * technique concludes is a placement, the one fact that changes them. */
  marks: boolean;
}

type Scope = ReadonlyMap<string, Val>;

const NAMES: Record<string, Val> = {
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
function noGeometry(n: string, env: Env): string | null {
  if (!GEOMETRY.has(n)) return null;
  if (env.tiling)
    return TILING_HAS.has(n) ? null : `${n}: a tiling has no rows, columns or squares`;
  return env.geometry ? null : `${n}: the board is cells alone, with no geometry`;
}

/** What only a tiling has. */
const TILING_ONLY = new Set(["angles", "apex"]);

function expect(v: Val, k: Sort["k"], what: string): void {
  if (v.sort.k !== k)
    throw new CompileError(`${what}: expected ${k}, got ${show(v.sort)}`);
}

function expectElem(v: Val, e: ElemSort, what: string): void {
  if (!(v.sort.k === "elem" && v.sort.e === e) && v.sort.k !== "none")
    throw new CompileError(`${what}: expected a ${e}, got ${show(v.sort)}`);
}

const isSetOf = (s: Sort, e: ElemSort): boolean =>
  s.k === "set" && s.of.k === "elem" && s.of.e === e;

/** The elements that hold the answer's values, as code: the space's cells,
 * or its edges. */
const answerSet = (env: Env): string =>
  env.answerSort === "edge" ? "sp.edges" : "sp.cells";
const answerCount = (env: Env): string => `${answerSet(env)}.length`;

/** Bind a value to a const when it will be read more than once. */
function once(v: Val, out: Out): Val {
  if (/^[A-Za-z_$][\w$]*$/.test(v.code) || /^-?\d+$/.test(v.code)) return v;
  const t = Out.fresh("_t");
  out.emit(`const ${t} = ${v.code};`);
  return v.group === undefined
    ? { code: t, sort: v.sort }
    : { code: t, sort: v.sort, group: v.group };
}

function sameSort(a: Sort, b: Sort): boolean {
  if (a.k === "none" || b.k === "none") return scalar(a) && scalar(b);
  if (a.k !== b.k) return false;
  if (a.k === "elem" && b.k === "elem") return a.e === b.e;
  if (a.k === "set" && b.k === "set") return sameSort(a.of, b.of);
  return true;
}

/** A cell's candidates through the function's `cands`, read once a cell. */
function candOf(c: string, env: Env): string {
  if (env.readsCands) env.readsCands.yes = true;
  return tapped(
    c,
    `(cands[${c}] >= 0 ? cands[${c}] : (cands[${c}] = ${marksRead("cand", c)}))`,
    env,
  );
}

/** `code`, a read of element `c`'s marks, which also records `c` where the
 * code records its reads. */
function tapped(c: string, code: string, env: Env, edge = false): string {
  if (env.reads === undefined) return code;
  return `(${edge ? env.reads.edges : env.reads.cells}.push(${c}), ${code})`;
}

/**
 * Cell `c`'s marks as the solve's arrays hold them, read in place: a method
 * call here was 5 to 20% of a described game's deal, because a compiled
 * technique is past V8's inlining budget and each read stayed a call.
 */
function marksRead(fn: "known" | "value" | "cand", c: string, env?: Env): string {
  const code =
    fn === "known"
      ? `(b.grid[${c}] !== 0)`
      : fn === "value"
        ? `(b.grid[${c}] || -1)`
        : `b.cands[${c}]`;
  return env === undefined ? code : tapped(c, code, env);
}

/** Whether cell `c` may still hold `d`, read in place as {@link marksRead},
 * or of a wide domain's words. */
const hasRead = (c: string, d: string, env: Env): string =>
  tapped(
    c,
    env.wide ? `b.has(${c}, ${d})` : `(((b.cands[${c}] >> ${d}) & 1) !== 0)`,
    env,
  );

/** A wide domain's candidates read otherwise than through its methods. */
const NOT_WIDE =
  "a wide domain's candidates are read by membership, a count, `first` and a binder";

/** A set of numbers made as a mask where the values run past what one holds:
 * bind its members, or count them, instead. */
const MASK_IN_WIDE =
  "a set of numbers is a mask of 32 bits, which a wide domain's values pass: bind its members";

function compileExpr(e: Expr, scope: Scope, env: Env, out: Out): Val {
  if (env.hoist !== null && e.k !== "num" && e.k !== "name") {
    const v = hoisted(e, scope, env, env.hoist);
    if (v !== null) return v;
  }
  const shared = env.shared;
  if (shared === undefined) return compileNode(e, scope, env, out);
  if (e.k === "call" && FACTS.some((f) => mentions(e, f, env.defs, new Set())))
    shared.made.clear();
  if (e.k !== "agg" && e.k !== "quant") return compileNode(e, scope, env, out);
  if (FACTS.some((f) => mentions(e, f, env.defs, new Set())))
    return compileNode(e, scope, env, out);
  const key = sharedKey(e, scope, env);
  const kept = shared.made.get(key);
  if (kept !== undefined && sharedReach(kept.out, kept.path, out)) return kept.val;
  const v = compileNode(e, scope, env, out);
  // Only a number or a truth its own loop declared is kept: a set's array is
  // emptied where its site runs again, and a read the runtime answers is
  // cheap.
  const total = v.sort.k === "num" || v.sort.k === "bool" || isMask(v.sort);
  if (total && /^_[gq]\d+$/.test(v.code))
    shared.made.set(key, {
      out,
      path: [...out.blocks],
      val: { code: v.code, sort: v.sort },
    });
  return v;
}

/** The calls that make a fact. */
const FACTS = ["place", "strike", "mark"] as const;

/** A term's statement, the code of each name it reads from its scope, and
 * the suppositions it is read under. */
function sharedKey(e: Expr, scope: Scope, env: Env): string {
  const free = new Set<string>();
  freeNames(e, free, new Set());
  const names = [...free]
    .sort()
    .map((n) => `${n}=${scope.get(n)?.code ?? ""}`)
    .join(",");
  return `${JSON.stringify(e)}|${names}|${JSON.stringify(env.supposed)}`;
}

/** Whether `e` is a sightline bent by a clue kind's mirrors. */
const isBentSight = (fn: string, args: readonly Expr[]): boolean =>
  SIGHT_BENT.has(fn) && (fn !== "sight" || args.length === 2);

/** A call's arguments that are values, not a clue kind's name. */
function valueArgs(e: Extract<Expr, { k: "call" }>): readonly Expr[] {
  if (e.fn === "clue") return e.args.slice(1);
  return isBentSight(e.fn, e.args) ? e.args.slice(0, 1) : e.args;
}

/** The functions a term may call and still be computed early: none reads
 * the candidates, binds a name, or makes a fact. Nor may one throw: a moved
 * term is computed whether or not the guard around it holds. */
const EARLY = new Set([
  "value",
  "known",
  "clue",
  "at",
  "per",
  "v",
  "stretch",
  "run_lengths",
  "connected",
  "cuts",
  "cut_edges",
  "matched",
  "reaches",
  "step",
  "compass",
  "to",
  "chain",
  "last",
  "slash",
  "linked",
  "through",
  "x",
  "y",
  "cell",
  "row",
  "col",
  "edge",
  "end1",
  "end2",
  "other",
  // A tiling's geometry (`tilingCall`).
  "edges",
  "faces",
  "angles",
  "apex",
  "ends",
  "abs",
  "bits",
  "times",
  "range",
  "sight",
  "sight_direct",
  "sight_bent",
  "sight_twice",
  "sight_exit",
  "opposite",
  "across",
  "nth",
  "index",
]);

/**
 * Whether `e` can be computed anywhere its names are bound: it binds no name
 * of its own, reads no candidate, makes no fact and calls no definition that
 * does. `bound` says which names are its inputs; `marks` is set where it
 * reads `value` or `known`.
 */
function early(
  e: Expr,
  bound: (n: string) => boolean,
  env: Env,
  marks: { read: boolean },
): boolean {
  const all = (xs: readonly Expr[]): boolean =>
    xs.every((x) => early(x, bound, env, marks));
  switch (e.k) {
    case "num":
      return true;
    case "name":
      return (
        bound(e.name) ||
        NAMES[e.name] !== undefined ||
        env.regions.has(e.name) ||
        e.name === env.boxes ||
        (e.name === "diagonals" && env.diagonals) ||
        env.sizes.names.has(e.name) ||
        e.name === "order" ||
        e.name === "w" ||
        e.name === "h"
      );
    case "set":
      return all(e.elems);
    case "size":
    case "not":
    case "neg":
      return early(e.of, bound, env, marks);
    case "bin":
      if ((e.op === "in" || e.op === "notin") && e.b.k === "call" && e.b.fn === "cand")
        return false;
      return all([e.a, e.b]);
    case "quant":
    case "agg":
    case "with":
      return false;
    case "call": {
      if (
        e.fn === "value" ||
        e.fn === "known" ||
        e.fn === "to" ||
        e.fn === "chain" ||
        e.fn === "last" ||
        e.fn === "linked"
      )
        marks.read = true;
      if (e.fn === "clue" || isBentSight(e.fn, e.args)) return all(valueArgs(e));
      if (EARLY.has(e.fn) || partOf(e.fn, env)) return all(e.args);
      const def = env.defs.get(e.fn);
      if (def === undefined || !all(e.args)) return false;
      return early(def.body, (n) => def.params.includes(n), env, marks);
    }
  }
}

/** The names `e` reads from its scope; a definition's body reads only its
 * parameters, which are its arguments. */
function namesIn(e: Expr, into: Set<string>, env: Env): void {
  switch (e.k) {
    case "name":
      into.add(e.name);
      return;
    case "set":
      for (const x of e.elems) namesIn(x, into, env);
      return;
    case "size":
    case "not":
    case "neg":
      namesIn(e.of, into, env);
      return;
    case "bin":
      namesIn(e.a, into, env);
      namesIn(e.b, into, env);
      return;
    case "call":
      for (const x of valueArgs(e)) namesIn(x, into, env);
      return;
    default:
      return;
  }
}

/** A read a slot keeps for every use after it, though no loop is left. */
const isRead = (e: Expr): boolean =>
  e.k === "size" ||
  (e.k === "call" && (e.fn === "value" || e.fn === "known" || e.fn === "clue"));

/**
 * `e` computed in the slot of the last name it reads, where that takes it out
 * of a loop or it is a read the slot can share: the name it is kept under,
 * or `null` where it is computed where it stands.
 */
function hoisted(e: Expr, scope: Scope, env: Env, h: Hoist): Val | null {
  const marks = { read: false };
  if (!early(e, (n) => scope.has(n), env, marks)) return null;
  if (marks.read && !h.marks) return null;
  const names = new Set<string>();
  namesIn(e, names, env);
  let slot = h.root;
  for (const n of names) {
    const v = scope.get(n);
    if (v === undefined) continue;
    if (v.at === undefined) return null;
    if (v.at.seq > slot.seq) slot = v.at;
  }
  if (slot.loops === h.loops && !isRead(e)) return null;
  // Its own terms are moved as it is, so a read it makes is the one every
  // other term there shares: `clue(sum, k)` and `clue(sum, k) = none` read
  // the clue once.
  const tmp = new Out(0);
  const v = compileNode(e, scope, env, tmp);
  // A set is moved only where it is a fresh array no code writes, made by a
  // sum or difference of sets: Net's reach took the same difference of a
  // square's sides from `P` for each side of the square beside it.
  const fresh =
    e.k === "bin" && (e.op === "+" || e.op === "-") && tmp.entries.length === 0;
  if ((isArray(v.sort) && !fresh) || v.sort.k === "subsets" || v.sort.k === "clues")
    return null;
  if (tmp.entries.length === 0) {
    const made = slot.made.get(v.code);
    if (made !== undefined) return made;
  }
  const t = Out.fresh("_h");
  for (const l of tmp.entries) if ("text" in l) slot.lines.push(l);
  slot.lines.push({ indent: 0, text: `const ${t} = ${v.code};` });
  const val: Val = { code: t, sort: v.sort, at: slot };
  if (tmp.entries.length === 0) slot.made.set(v.code, val);
  return val;
}

function compileNode(e: Expr, scope: Scope, env: Env, out: Out): Val {
  switch (e.k) {
    case "num":
      return { code: String(e.v), sort: NUM };
    case "name":
      return name(e.name, scope, env, out);
    case "set":
      return setLiteral(e.elems, scope, env, out);
    case "size": {
      if (keptChain(e.of, env)) {
        const c = compileExpr(
          (e.of as Extract<Expr, { k: "call" }>).args[0],
          scope,
          env,
          out,
        );
        expectElem(c, "cell", "chain");
        env.used.add("chainLength");
        return {
          code: `chainLength(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${c.code})`,
          sort: NUM,
        };
      }
      const s = compileExpr(e.of, scope, env, out);
      if (s.sort.k === "cands") return { code: `b.candCount(${s.code})`, sort: NUM };
      if (isMask(s.sort)) {
        env.used.add("popcount");
        return { code: `popcount(${s.code})`, sort: NUM };
      }
      if (isArray(s.sort)) return { code: `${s.code}.length`, sort: NUM };
      if (s.sort.k === "list") {
        env.used.add("listLength");
        return { code: `listLength(${s.code})`, sort: NUM };
      }
      throw new CompileError(`|…| of ${show(s.sort)}`);
    }
    case "not": {
      const v = compileExpr(e.of, scope, env, out);
      expect(v, "bool", "not");
      return { code: `!(${v.code})`, sort: BOOL };
    }
    case "neg": {
      const v = compileExpr(e.of, scope, env, out);
      if (v.sort.k === "int") {
        env.used.add("isub");
        return { code: `isub(0, ${v.code})`, sort: INT };
      }
      expect(v, "num", "-");
      return { code: `-(${v.code})`, sort: NUM };
    }
    case "bin":
      return binary(e, scope, env, out);
    case "quant":
      return quantifier(e, scope, env, out);
    case "agg":
      return aggregate(e, scope, env, out);
    case "with":
      return supposing(e, scope, env, out);
    case "call":
      return call(e.fn, e.args, scope, env, out);
  }
}

/**
 * `with place(c, d): P`: `P` read on the marks with `c` holding `d`. Its
 * reads of the marks see the supposition (`env.supposed`), so none of them
 * is computed outside it, and nothing in it concludes.
 */
function supposing(
  e: Extract<Expr, { k: "with" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  return compileExpr(e.body, scope, suppose(e, scope, env, out).env, out);
}

/** The environment `e`'s body is read in, and the names its cell and value
 * are held in, which `with` has written. */
function suppose(
  e: Extract<Expr, { k: "with" }>,
  scope: Scope,
  env: Env,
  out: Out,
): { env: Env; cell: string; value: string } {
  if (env.answer !== null || env.position !== null)
    throw new CompileError(
      "with supposes a value on the marks, which only a technique reads",
    );
  const c = compileExpr(e.cell, scope, env, out);
  expectElem(c, env.answerSort, "with");
  const d = compileExpr(e.value, scope, env, out);
  expect(d, "num", "with");
  const cell = Out.fresh("_wc");
  const value = Out.fresh("_wd");
  out.emit(`const ${cell} = ${c.code};`);
  out.emit(`const ${value} = ${d.code};`);
  const inner: Env = {
    ...env,
    concluding: false,
    supposed: [{ cell, value }, ...env.supposed],
    hoist: env.hoist === null ? null : { ...env.hoist, marks: false },
  };
  // A truth in a premise, and a set where a `says` reads one under a
  // supposition; whoever reads it checks its sort.
  return { env: inner, cell, value };
}

/**
 * What held in `e`, which is true here, as the code of a `Witness` value
 * (`describe-runtime.ts`) or `null` where nothing in it is worth reporting,
 * with the statements that compute it written to `out`. It is written only
 * where a hint reads it, on the marks before a firing's facts are made, so a
 * part is read here a second time and the solve path never runs it.
 *
 * It follows `and` (each side), `or` (the side that held, the left first),
 * `exists` (the first member the body held for), `with` and a definition's
 * body. Anything else, a `not`, a `forall`, an aggregate, has no witness: a
 * `forall` has no one member, and what a `not` holds is a fact about
 * something that did not happen.
 */
function witnessOf(e: Expr, scope: Scope, env: Env, out: Out): string | null {
  const bool = (x: Expr, sc: Scope = scope): Val => {
    const v = compileExpr(x, sc, env, out);
    expect(v, "bool", "witness");
    return once(v, out);
  };
  const of = (w: string | null): string => w ?? "null";
  if (e.k === "name" && !scope.has(e.name)) {
    const def = env.defs.get(e.name);
    if (def === undefined || def.params.length > 0) return null;
    return `{ held: "def", name: ${JSON.stringify(e.name)}, of: ${of(witnessOf(def.body, scope, env, out))} }`;
  }
  const body = inlined(e, scope, env);
  if (body !== e && e.k === "call")
    return `{ held: "def", name: ${JSON.stringify(e.fn)}, of: ${of(witnessOf(body, scope, env, out))} }`;
  if (e.k === "bin" && e.op === "and") {
    const parts = [e.a, e.b]
      .map((x) => witnessOf(x, scope, env, out))
      .filter((w): w is string => w !== null);
    if (parts.length === 0) return null;
    env.used.add("witnessAll");
    return parts.length === 1 ? parts[0] : `witnessAll(${parts.join(", ")})`;
  }
  if (e.k === "bin" && e.op === "or") {
    const r = Out.fresh("_wo");
    out.emit(`let ${r}: Witness | null = null;`);
    const left = bool(e.a);
    out.open(`if (${left.code}) {`);
    out.emit(
      `${r} = { held: "arm", arm: 0, of: ${of(witnessOf(e.a, scope, env, out))} };`,
    );
    out.close();
    out.open(`if (!${left.code}) {`);
    out.emit(
      `${r} = { held: "arm", arm: 1, of: ${of(witnessOf(e.b, scope, env, out))} };`,
    );
    out.close();
    return r;
  }
  if (e.k === "with") {
    const s = suppose(e, scope, env, out);
    const inner = witnessOf(e.body, scope, s.env, out);
    return `{ held: "supposing", cell: ${s.cell}, value: ${s.value}, of: ${of(inner)} }`;
  }
  if (e.k === "quant" && e.q === "exists") {
    const r = Out.fresh("_wm");
    const label = Out.fresh("W");
    out.emit(`let ${r}: Witness | null = null;`);
    out.open(`${label}: {`);
    bindingLoops(e.binders, scope, env, out, (sc) => {
      const v = bool(e.body, sc);
      out.open(`if (${v.code}) {`);
      const member = e.binders
        .filter((b) => b.kind !== "fill")
        .map((b) => {
          const val = sc.get(b.name);
          if (val === undefined) throw new Error(`witness: ${b.name} is not bound`);
          return `${b.name}: ${val.code}${isArray(val.sort) ? ".slice()" : ""}`;
        });
      const inner = witnessOf(e.body, sc, env, out);
      out.emit(
        `${r} = { held: "member", member: { ${member.join(", ")} }, of: ${of(inner)} };`,
      );
      out.emit(`break ${label};`);
      out.close();
    });
    out.close();
    return r;
  }
  return null;
}

/** `known(c)`, `value(c)` or `cand(c)` of cell `c`: the grid's in the answer
 * check, the marks' in a technique, under the suppositions in force. */
function markRead(fn: "known" | "value" | "cand", c: Val, env: Env, out: Out): Val {
  if (env.answer) {
    if (fn === "cand")
      throw new CompileError("a rule reads the answer, never the marks");
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
function supposedRead(
  x: string,
  env: Env,
  held: (s: { cell: string; value: string }) => string,
  plain: string,
): string {
  return env.supposed.reduceRight(
    (acc, s) => `(${x} === ${s.cell} ? ${held(s)} : ${acc})`,
    plain,
  );
}

/** Whether `fn` names a partition, which as a function gives a cell's part. */
const partOf = (fn: string, env: Env): boolean =>
  env.regions.has(fn) || fn === env.boxes;

function name(n: string, scope: Scope, env: Env, out: Out): Val {
  const bound = scope.get(n);
  if (bound !== undefined) return bound;
  if (n === "domain" && env.wide) throw new CompileError(NOT_WIDE);
  if (n === "domain" && env.cellDomain)
    throw new CompileError("the domain is each cell's here: read a cell's candidates");
  if (n === "domain" && env.position !== null)
    throw new CompileError("a position has a domain a layer, read by the checker only");
  const refused = noGeometry(n, env);
  if (refused !== null) throw new CompileError(refused);
  if (env.tiling && n === "faces")
    return { code: "sp.faces", sort: setOf(elem("face")) };
  if (env.tiling && n === "angles")
    return { code: "sp.angles", sort: setOf(elem("angle")) };
  const layer = env.position?.get(n);
  if (layer?.over === "board") return layerRead(n, layer, "0", env);
  if (n === "integers")
    throw new CompileError(
      "integers is a move's binder's set alone: it has no end to list",
    );
  const known = NAMES[n];
  if (known !== undefined) return known;
  if (n === "faces" && env.faces !== null) {
    env.sizes.read.add(env.faces);
    env.readsClues.yes = true;
    env.used.add("facesOf");
    return { code: `facesOf(cl.${env.faces})`, sort: setOf(elem("face")) };
  }
  const table = env.tables.get(n);
  if (table !== undefined && table.of.length === 0) {
    env.readsClues.yes = true;
    return { code: `cl.${n}`, sort: table.to };
  }
  if (env.regions.has(n)) {
    env.readsClues.yes = true;
    return { code: `cl.${n}.parts`, sort: setOf(elem(`region ${n}`)) };
  }
  if (n === env.boxes) return { code: "sp.boxes", sort: setOf(elem("line")) };
  if (n === "diagonals" && env.diagonals)
    return { code: "sp.diagonals", sort: setOf(elem("line")) };
  if (n === "order" || n === "w") return { code: "sp.w", sort: NUM };
  if (n === "h") return { code: "sp.h", sort: NUM };
  if (env.sizes.names.has(n)) {
    env.sizes.read.add(n);
    env.readsClues.yes = true;
    return { code: `cl.${n}`, sort: NUM };
  }
  const def = env.defs.get(n);
  if (def !== undefined && def.params.length === 0)
    return compileExpr(def.body, new Map(), env, out);
  throw new CompileError(`unknown name "${n}"`);
}

function setLiteral(elems: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  if (elems.length === 0)
    throw new CompileError("{} has no sort; write a comprehension");
  const vs = elems.map((x) => compileExpr(x, scope, env, out));
  const sort = vs[0].sort;
  if (!vs.every((v) => sameSort(v.sort, sort)))
    throw new CompileError(
      `a set of mixed sorts: ${vs.map((v) => show(v.sort)).join(", ")}`,
    );
  if (sort.k === "num") {
    if (env.wide && !elems.every((x) => x.k === "num" && x.v >= 0 && x.v <= 31))
      throw new CompileError(MASK_IN_WIDE);
    return {
      code: `(${vs.map((v) => `(1 << ${v.code})`).join(" | ")})`,
      sort: setOf(NUM),
    };
  }
  if (sort.k !== "elem") throw new CompileError(`a set of ${show(sort)}`);
  env.used.add("setOf");
  return { code: `setOf(${vs.map((v) => v.code).join(", ")})`, sort: setOf(sort) };
}

/** Whether a set literal's members are all elements of one sort, as a probe
 * that writes nothing reads them. */
function setLiteralElements(elems: readonly Expr[], scope: Scope, env: Env): boolean {
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
    shared: undefined,
  };
  const sorts = elems.map((x) => compileExpr(x, scope, probe, new Out(0)).sort);
  // Numbers too where the domain is wide, as no mask holds them.
  const looped = (s: Sort): boolean =>
    s.k === "elem" || (env.wide === true && s.k === "num");
  return sorts.every((s) => looped(s) && sameSort(s, sorts[0]));
}

/** A connective whose right side may need statements: they run only where
 * the left side leaves the answer open, so a premise can guard what it reads. */
function shortCircuit(
  op: "and" | "or" | "implies",
  a: Expr,
  b: Expr,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const va = compileExpr(a, scope, env, out);
  expect(va, "bool", op);
  const inner = new Out(0, out);
  const vb = compileExpr(b, scope, env, inner);
  expect(vb, "bool", op);
  const left = op === "implies" ? `!(${va.code})` : va.code;
  if (inner.entries.length === 0)
    return { code: `(${left} ${op === "and" ? "&&" : "||"} ${vb.code})`, sort: BOOL };
  const r = Out.fresh("_c");
  // Typed, since a left side TypeScript has narrowed to `true` (a chain of
  // conclusions, each true once made) would type the name as `true`.
  out.emit(`let ${r}: boolean = ${left};`);
  out.open(op === "and" ? `if (${r}) {` : `if (!${r}) {`);
  out.append(inner);
  out.emit(`${r} = ${vb.code};`);
  out.close();
  return { code: r, sort: BOOL };
}

function binary(e: Extract<Expr, { k: "bin" }>, scope: Scope, env: Env, out: Out): Val {
  const { op } = e;
  if (op === "and" || op === "or" || op === "implies")
    return shortCircuit(op, e.a, e.b, scope, env, out);
  // `d in cand(c)` reads one place of the cube, which is cheaper than any
  // kept mask: a mask is kept for what reads the whole of it.
  if ((op === "in" || op === "notin") && e.b.k === "call" && e.b.fn === "cand") {
    const d = compileExpr(e.a, scope, env, out);
    expect(d, "num", op);
    const c = compileExpr(e.b.args[0], scope, env, out);
    expectElem(c, env.answerSort, "cand");
    const x = env.supposed.length === 0 ? c.code : once(c, out).code;
    const at = env.supposed.length === 0 ? d.code : once(d, out).code;
    const has = supposedRead(
      x,
      env,
      (s) => `${at} === ${s.value}`,
      hasRead(x, at, env),
    );
    return { code: op === "in" ? has : `!${has}`, sort: BOOL };
  }
  // `q in linked(k)` asks whether two points share a group, which the marks'
  // own groups answer without listing one.
  if (
    (op === "in" || op === "notin") &&
    e.b.k === "call" &&
    e.b.fn === "linked" &&
    e.b.args.length === 1 &&
    !env.answer &&
    env.supposed.length === 0
  ) {
    const q = compileExpr(e.a, scope, env, out);
    expectElem(q, "point", op);
    const k = compileExpr(e.b.args[0], scope, env, out);
    expectElem(k, "point", "linked");
    env.used.add("linkedWith");
    const code = `linkedWith(sp, b, ${q.code}, ${k.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  // `x in chain(c)` asks whether the walk from `c` reaches `x`, which the
  // marks' kept chains answer without walking it.
  if ((op === "in" || op === "notin") && keptChain(e.b, env)) {
    const x = compileExpr(e.a, scope, env, out);
    expectElem(x, "cell", op);
    const c = compileExpr(
      (e.b as Extract<Expr, { k: "call" }>).args[0],
      scope,
      env,
      out,
    );
    expectElem(c, "cell", "chain");
    env.used.add("chainHas");
    const code = `chainHas(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${x.code}, ${c.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  const a = compileExpr(e.a, scope, env, out);
  // `c in cells(r)` of a rectangle a binder names compares the cell with its
  // sides, and no list of its cells is made.
  const named = e.b.k === "call" && e.b.fn === "cells" ? e.b.args[0] : undefined;
  const r = named?.k === "name" ? scope.get(named.name) : undefined;
  if ((op === "in" || op === "notin") && r?.sort.k === "elem" && r.sort.e === "rect") {
    expectElem(a, "cell", op);
    env.used.add("rectHolds");
    const code = `rectHolds(sp, ${r.code}, ${a.code})`;
    return { code: op === "in" ? code : `!${code}`, sort: BOOL };
  }
  const b = compileExpr(e.b, scope, env, out);
  if (a.sort.k === "int" || b.sort.k === "int") return exact(op, a, b, env);
  switch (op) {
    case "iff":
      expect(a, "bool", op);
      expect(b, "bool", op);
      return { code: `(${a.code} === ${b.code})`, sort: BOOL };
    case "=":
    case "!=": {
      if (!sameSort(a.sort, b.sort))
        throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
      if (isArray(a.sort)) {
        env.used.add("sameSet");
        const eq = `sameSet(${a.code}, ${b.code})`;
        return { code: op === "=" ? eq : `!${eq}`, sort: BOOL };
      }
      if (a.sort.k === "list") {
        env.used.add("sameList");
        const eq = `sameList(${a.code}, ${b.code})`;
        return { code: op === "=" ? eq : `!${eq}`, sort: BOOL };
      }
      return {
        code: `(${a.code} ${op === "=" ? "===" : "!=="} ${b.code})`,
        sort: BOOL,
      };
    }
    case "<":
    case "<=":
    case ">":
    case ">=":
      expect(a, "num", op);
      expect(b, "num", op);
      return { code: `(${a.code} ${op} ${b.code})`, sort: BOOL };
    case "in":
    case "notin": {
      if (b.sort.k !== "set" || !sameSort(a.sort, b.sort.of))
        throw new CompileError(`${show(a.sort)} in ${show(b.sort)}`);
      // A group of cells joined across a set of edges, read through the
      // groups joined where the set is bound, is one list each of its cells
      // reads: a cell is in it where its own group is that list, and no
      // list is walked.
      const group = /^(_eg\d+)\.of\(/.exec(setKey(b));
      if (group !== null) {
        const same = `(${group[1]}.of(${a.code}) === ${b.code})`;
        return { code: op === "in" ? same : `!${same}`, sort: BOOL };
      }
      const marks = memberTable(b, env);
      const has = isMask(b.sort)
        ? `((${b.code} >> ${a.code}) & 1) !== 0`
        : marks !== null
          ? `${marks}[${a.code} + 1] === 1`
          : `${b.code}.includes(${a.code})`;
      return { code: op === "in" ? `(${has})` : `!(${has})`, sort: BOOL };
    }
    case "subset":
      if (!sameSort(a.sort, b.sort) || a.sort.k !== "set")
        throw new CompileError(`${show(a.sort)} subset ${show(b.sort)}`);
      if (isMask(a.sort))
        return { code: `((${a.code} & ~${b.code}) === 0)`, sort: BOOL };
      env.used.add("subsetOf");
      return { code: `subsetOf(${a.code}, ${b.code})`, sort: BOOL };
    case "+":
    case "-":
      if (a.sort.k === "num") {
        expect(b, "num", op);
        return { code: `(${a.code} ${op} ${b.code})`, sort: NUM };
      }
      if (!sameSort(a.sort, b.sort) || a.sort.k !== "set")
        throw new CompileError(`${show(a.sort)} ${op} ${show(b.sort)}`);
      if (isMask(a.sort))
        return {
          code: op === "+" ? `(${a.code} | ${b.code})` : `(${a.code} & ~${b.code})`,
          sort: a.sort,
        };
      env.used.add(op === "+" ? "union" : "minus");
      return {
        code: `${op === "+" ? "union" : "minus"}(${a.code}, ${b.code})`,
        sort: a.sort,
      };
    case "*":
    case "/":
    case "mod":
      expect(a, "num", op);
      expect(b, "num", op);
      if (op === "*") return { code: `(${a.code} * ${b.code})`, sort: NUM };
      if (op === "/") return { code: `Math.trunc(${a.code} / ${b.code})`, sort: NUM };
      return { code: `(${a.code} % ${b.code})`, sort: NUM };
  }
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
function exact(op: Extract<Expr, { k: "bin" }>["op"], a: Val, b: Val, env: Env): Val {
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

/**
 * Write the loops of `binders`, each binding's statements written by `body`
 * inside them. A binding a `where` refuses is skipped: `continue` inside a
 * loop, and leaving a labeled block for a name bound by `=`.
 */
/**
 * Where the names bound from `binders[i]` on are costly to make (a walk or
 * a loop) and the next set binder reads none of them, whether that set has
 * a member, read before they are made: where it has none there is no
 * binding, so they are not made. `null` where the check would not pay, or
 * where there is no loop of these binders' own to pass on to. Net's
 * `sealNote` made a square's reach for every square, the squares with every
 * side known among them.
 */
function emptyAhead(binders: readonly Binder[], i: number, env: Env): Expr | null {
  const prior = binders[i - 1];
  if (prior === undefined || prior.kind === "let") return null;
  let j = i;
  while (binders[j]?.kind === "let") j++;
  const next = binders[j];
  // A set with no filter of its own is rarely empty: the check would only
  // cost.
  if (next === undefined || next.kind !== "in" || next.where === null) return null;
  const lets = binders.slice(i, j);
  if (
    !lets.some((b) => walks(b.of, env.defs, new Set()) || loopDepth(b.of, env.defs) > 0)
  )
    return null;
  const cheap = (e: Expr | null): boolean =>
    e === null || (!walks(e, env.defs, new Set()) && loopDepth(e, env.defs) === 0);
  if (!cheap(next.of) || !cheap(next.where)) return null;
  const read = new Set<string>();
  freeNames(next.of, read, new Set());
  if (next.where !== null) freeNames(next.where, read, new Set([next.name]));
  if (lets.some((b) => read.has(b.name))) return null;
  return {
    k: "quant",
    q: "exists",
    binders: [next],
    body: { k: "name", name: "true" },
  };
}

function bindingLoops(
  binders: readonly Binder[],
  scope: Scope,
  env: Env,
  out: Out,
  body: (scope: Scope) => void,
  descending = false,
): void {
  const walk = (i: number, sc: Scope): void => {
    if (i === binders.length) {
      body(sc);
      return;
    }
    const bnd = binders[i];
    let v = `v_${bnd.name}`;
    // A definition's binder named as the variable an argument is held in
    // (`spots(y)`, its body binding `y` again) would capture it.
    const held = new RegExp(`\\b${v}\\b`);
    for (const [name, val] of sc)
      if (name !== bnd.name && held.test(val.code)) {
        v = Out.fresh(`${v}_`);
        break;
      }
    let closeBlock = false;
    let skip = "continue";
    let sort: Sort;
    let pos: Val["pos"];
    let members: Val["members"];
    let names: string | null = null;
    let edgeSet: Val["edgeSet"] | null = null;
    let where = bnd.where;
    if (bnd === env.visitBinder && env.visitAt !== undefined)
      env.visitAt.slot = out.slot(env.hoist?.loops ?? 0);
    // A count may be taken ahead of the binder's set, and again once its
    // name is bound, ahead of its filter.
    const recheck = env.recheck?.binders === binders ? env.recheck : null;
    if (recheck !== null)
      recheck.chain.push({ slot: out.slot(0), loops: recheck.loops.length });
    if (bnd.kind === "fill") {
      if (env.wide) throw new CompileError(`${bnd.name}: ${NOT_WIDE}`);
      const f = fillLoop(bnd, sc, env, out);
      v = f.code;
      sort = { k: "fill" };
      where = f.rest;
    } else if (bnd.kind === "let") {
      const empty = emptyAhead(binders, i, env);
      if (empty !== null) {
        const has = compileExpr(empty, sc, env, out);
        out.emit(`if (!(${has.code})) continue;`);
      }
      const t = compileExpr(bnd.of, sc, env, out);
      sort = t.sort;
      names = setKey(t);
      const of = bnd.of;
      const at = sc;
      edgeSet = () => keptEdgeSet(of, at, env);
      if (bnd.where !== null) {
        const label = Out.fresh("L");
        out.open(`${label}: {`);
        closeBlock = true;
        skip = `break ${label}`;
      }
      out.emit(`const ${v} = ${t.code};`);
    } else if (bnd.of.k === "call" && bnd.of.fn === "clues") {
      const kind = clueKindArg(bnd.of.args, env);
      env.readsClues.yes = true;
      sort = elem(`clue ${kind}`);
      const n = env.clues.get(kind)?.fields ? "n" : "at.length";
      out.open(`for (let ${v} = 0; ${v} < cl.${kind}.${n}; ${v}++) {`);
    } else if (bnd.of.k === "call" && bnd.of.fn === "before") {
      // The members ahead of x, read in place up to x's index.
      const [xe, le] = bnd.of.args;
      if (bnd.of.args.length !== 2) throw new CompileError("before takes 2");
      const L = compileExpr(le, sc, env, out);
      const x = compileExpr(xe, sc, env, out);
      if (!isArray(L.sort) || L.sort.k !== "set" || !sameSort(x.sort, L.sort.of))
        throw new CompileError(`before(${show(x.sort)}, ${show(L.sort)})`);
      sort = L.sort.of;
      const a = Out.fresh("_a");
      const n = Out.fresh("_n");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = ${L.code};`);
      out.emit(
        `const ${n} = ${x.pos?.arr === L.code ? x.pos.i : `${a}.indexOf(${x.code})`};`,
      );
      out.open(`for (let ${ix} = 0; ${ix} < ${n}; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: L.code, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      cluePin(bnd, sc, env)
    ) {
      // The cells whose clue holds one value, read off the clue list's
      // index: the where still reads each, so it says what it said.
      const pin = cluePin(bnd, sc, env) as { kind: string; value: Expr };
      const t = once(compileExpr(pin.value, sc, env, out), out);
      // `none`, an element with no clue, is indexed as `clueAt` reads it.
      if (t.sort.k !== "none") expect(t, "num", `clue(${pin.kind}, ${bnd.name})`);
      env.readsClues.yes = true;
      env.used.add("cluesValued");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = cluesValued(cl.${pin.kind}, ${t.code});`);
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      keptPin(bnd, sc, env) !== null
    ) {
      // The cells where a kept definition has one value, read off an index
      // of every cell's, made once a placement: the where still reads each.
      const pin = keptPin(bnd, sc, env) as { fn: string; read: string; value: Expr };
      const t = once(compileExpr(pin.value, sc, env, out), out);
      expect(t, "num", `${pin.fn}(${bnd.name})`);
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(
        `const ${a} = ${pin.fn}Kept.valued(b, ${pin.read}, sp.cells, ${t.code});`,
      );
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      valuePin(bnd, sc, env) !== null
    ) {
      // The cells holding one value, read off an index of every cell's, made
      // once a placement: the where still reads each.
      const t = once(compileExpr(valuePin(bnd, sc, env) as Expr, sc, env, out), out);
      expect(t, "num", `value(${bnd.name})`);
      env.used.add("cellsValued");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(`const ${a} = cellsValued(b, sp.cells, ${t.code});`);
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (
      bnd.of.k === "name" &&
      bnd.of.name === "cells" &&
      chainPin(bnd, sc, env) !== null
    ) {
      // The cells whose chain holds one cell, read off the kept chains'
      // tree under it: the where still reads each, so it says what it said.
      const pin = chainPin(bnd, sc, env) as Expr;
      const x = once(compileExpr(pin, sc, env, out), out);
      expectElem(x, "cell", "chain");
      env.used.add("chainHolders");
      sort = elem("cell");
      const a = Out.fresh("_a");
      const ix = Out.fresh("_i");
      out.emit(
        `const ${a} = chainHolders(sp, b, ${namedBy(Out.fresh("_x"), env)}, ${x.code});`,
      );
      out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
      out.emit(`const ${v} = ${a}[${ix}];`);
      pos = { arr: a, i: ix };
    } else if (bnd.of.k === "call" && bnd.of.fn === "range") {
      // Counted rather than read off a mask, which holds no number past 31
      // and none below 0: a position along a line of a large board.
      if (bnd.of.args.length !== 2) throw new CompileError("range takes 2");
      const [a, b] = bnd.of.args.map((x) => {
        const t = once(compileExpr(x, sc, env, out), out);
        expect(t, "num", "range");
        return t;
      });
      sort = NUM;
      out.open(
        descending
          ? `for (let ${v} = ${b.code}; ${v} >= ${a.code}; ${v}--) {`
          : `for (let ${v} = ${a.code}; ${v} <= ${b.code}; ${v}++) {`,
      );
    } else if (
      bnd.of.k === "set" &&
      bnd.of.elems.length <= 4 &&
      setLiteralElements(bnd.of.elems, sc, env)
    ) {
      // A set stated member by member is looped over as its members, with
      // no array made: Bridges' `{edge(c, y), end(c, y)}` and the `{c}` of
      // a conditional sum are read for every line at every rung. A member
      // equal to one before it is passed over, as the set holds it once.
      const vals = bnd.of.elems.map((x) => once(compileExpr(x, sc, env, out), out));
      const es = vals.map((x) => x.code);
      sort = vals[0].sort;
      const ix = Out.fresh("_i");
      out.open(`for (let ${ix} = 0; ${ix} < ${es.length}; ${ix}++) {`);
      out.emit(
        `const ${v} = ${es
          .slice(0, -1)
          .map((e, i) => `${ix} === ${i} ? ${e} : `)
          .join("")}${es[es.length - 1]};`,
      );
      for (let i = 1; i < es.length; i++)
        out.emit(
          `if (${ix} === ${i} && (${es
            .slice(0, i)
            .map((e) => `${v} === ${e}`)
            .join(" || ")})) continue;`,
        );
    } else {
      const s = compileExpr(bnd.of, sc, env, out);
      if (s.sort.k === "subsets") {
        const of = s.sort.of;
        sort = of;
        const els = Out.fresh("_e");
        const k = Out.fresh("_k");
        const j = Out.fresh("_j");
        if (isMask(of)) {
          env.used.add("valuesOf");
          out.emit(`const ${els} = valuesOf(${s.code});`);
        } else out.emit(`const ${els} = ${s.code};`);
        // Where a union over the subset's members is kept a member each
        // (`memberUnion`), what is kept is declared here, once a set.
        if (!isMask(of) && env.hoist !== null)
          members = { els, k, pre: out.slot(env.hoist.loops) };
        // Counted in binary with the set's last member as the lowest bit, so
        // the subsets of {1, 2, 3} come as {3}, {2}, {2, 3}, {1}, ...
        // A filter that opens on the subset's size is read off the counter,
        // before the subset is built (Mines' `count`, by its fewest numbers),
        // and a size it pins counts only the subsets of that size, in the
        // same order.
        const size = sizeTest(bnd.name, bnd.where);
        if (size?.op === "===") {
          const e = once(compileExpr(size.of, sc, env, out), out);
          expect(e, "num", `|${bnd.name}|`);
          env.used.add("nextOfSize");
          const n = Out.fresh("_n");
          out.emit(`const ${n} = 1 << ${els}.length;`);
          out.open(
            `for (let ${k} = ${e.code} > ${els}.length ? ${n} : (1 << ${e.code}) - 1; ${k} < ${n}; ${k} = ${e.code} === 0 ? ${n} : nextOfSize(${k})) {`,
          );
        } else out.open(`for (let ${k} = 0; ${k} < 1 << ${els}.length; ${k}++) {`);
        if (size !== null && size.op !== "===") {
          const e = compileExpr(size.of, sc, env, out);
          expect(e, "num", `|${bnd.name}|`);
          env.used.add("popcount");
          out.emit(`if (!(popcount(${k}) ${size.op} ${e.code})) continue;`);
        }
        if (isMask(of)) {
          out.emit(`let ${v} = 0;`);
          out.emit(
            `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${v} |= 1 << ${els}[${j}];`,
          );
        } else {
          // The subset is read only until the next is counted, as a set
          // comprehension's array is (`aggregate`).
          if (env.scratch !== null) {
            const kept = Out.fresh("_g");
            env.scratch.push(`const ${kept}: number[] = [];`);
            out.emit(`const ${v} = ${kept};`);
            out.emit(`${v}.length = 0;`);
          } else out.emit(`const ${v}: number[] = [];`);
          out.emit(
            `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${v}.push(${els}[${j}]);`,
          );
        }
      } else if (isMask(s.sort)) {
        sort = NUM;
        const m = Out.fresh("_m");
        out.open(`for (let ${m} = ${s.code}; ${m} !== 0; ${m} &= ${m} - 1) {`);
        out.emit(`const ${v} = 31 - Math.clz32(${m} & -${m});`);
      } else if (s.sort.k === "cands") {
        // Listed before the loop, so a strike the loop makes moves nothing
        // it walks.
        sort = NUM;
        const a = Out.fresh("_a");
        const ix = Out.fresh("_i");
        out.emit(`const ${a} = b.candList(${s.code});`);
        out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
        out.emit(`const ${v} = ${a}[${ix}];`);
      } else if (isArray(s.sort) && s.sort.k === "set") {
        sort = s.sort.of;
        const a = Out.fresh("_a");
        const ix = Out.fresh("_i");
        out.emit(`const ${a} = ${s.code};`);
        out.open(`for (let ${ix} = 0; ${ix} < ${a}.length; ${ix}++) {`);
        out.emit(`const ${v} = ${a}[${ix}];`);
        pos = { arr: s.code, i: ix };
      } else throw new CompileError(`${bnd.name} in ${show(s.sort)}: not a set`);
    }
    // Every binder of a set, and every filling, opened one loop.
    const loop = bnd.kind !== "let";
    const h = env.hoist;
    if (h !== null && loop) h.loops++;
    const inner = new Map(sc);
    binderOpened(recheck, out, loop);
    const bound: Val = {
      code: v,
      sort,
      at: h === null ? undefined : out.slot(h.loops),
      ...(pos === undefined ? {} : { pos }),
      ...(members === undefined ? {} : { members }),
      ...(names === null ? {} : { names }),
      ...(edgeSet === null ? {} : { edgeSet }),
    };
    inner.set(bnd.name, bound);
    if (bnd === env.visitBinder) {
      if (skip !== "continue")
        throw new CompileError(`${bnd.name}: a visited binder loops`);
      out.emit(
        `if (_visit !== null) { if (_visit[${v}] === 0) continue; _visit[${v}] = 0; }`,
      );
    }
    if (where !== null) {
      const w = compileExpr(where, inner, env, out);
      expect(w, "bool", `where of ${bnd.name}`);
      out.emit(`if (!(${w.code})) ${skip};`);
      // What the rest reads of this name is computed past the filter, so a
      // binding it skips does not pay for it; what the filter computed is
      // shared.
      if (bound.at !== undefined && h !== null) {
        const after = out.slot(h.loops);
        after.made = bound.at.made;
        inner.set(bnd.name, { ...bound, at: after });
      }
    }
    walk(i + 1, inner);
    binderClosed(recheck, loop);
    if (h !== null && loop) h.loops--;
    if (loop || closeBlock) out.close();
  };
  walk(0, scope);
}

/**
 * Where `bnd`, a binder over the cells, opens its where with `clue(kind, x)
 * = t` of a kind dealt once an element, `t` reading nothing `bnd` binds: the
 * kind and `t`, so the cells can be read off the clue list's index. A
 * definition is read as its body (Dominosa's `num(c) = a`).
 */
function cluePin(
  bnd: Binder,
  scope: Scope,
  env: Env,
): { kind: string; value: Expr } | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  const [first] = fillConjuncts(bnd.where, scope, env);
  if (first === undefined || first.k !== "bin" || first.op !== "=") return null;
  const kindOf = (e: Expr): string | null => {
    const read = inlined(e, scope, env);
    if (read.k !== "call" || read.fn !== "clue" || read.args.length !== 2) return null;
    const [k, x] = read.args;
    if (k.k !== "name" || x.k !== "name" || x.name !== bnd.name) return null;
    const kind = env.clues.get(k.name);
    return kind === undefined || kind.per || kind.fields ? null : k.name;
  };
  for (const [side, other] of [
    [first.a, first.b],
    [first.b, first.a],
  ] as const) {
    const kind = kindOf(side);
    if (kind === null) continue;
    const reads = new Set<string>();
    freeNames(other, reads, new Set());
    if (!reads.has(bnd.name)) return { kind, value: other };
  }
  return null;
}

/**
 * Where `bnd`, a binder over the cells, has a conjunct `value(x) = t`, `t`
 * reading nothing `bnd` binds, and `value` reads the marks' own grid: `t`, so
 * the cells can be read off an index of every cell's value (Crossing's
 * squares holding a number's first digit).
 */
function valuePin(bnd: Binder, scope: Scope, env: Env): Expr | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "=") continue;
    for (const [side, other] of [
      [c.a, c.b],
      [c.b, c.a],
    ] as const) {
      if (
        side.k !== "call" ||
        side.fn !== "value" ||
        scope.has("value") ||
        side.args.length !== 1 ||
        side.args[0].k !== "name" ||
        side.args[0].name !== bnd.name
      )
        continue;
      const reads = new Set<string>();
      freeNames(other, reads, new Set());
      if (reads.has(bnd.name)) continue;
      const mark = Out.mark();
      const y = Out.fresh("_y");
      const probe = new Out(0);
      const f = compileExpr(
        side,
        new Map([...scope, [bnd.name, { code: y, sort: elem("cell") }]]),
        env,
        probe,
      );
      Out.rewind(mark);
      if (probe.entries.length === 0 && f.code === `(b.grid[${y}] || -1)`) return other;
    }
  }
  return null;
}

/**
 * Where `bnd`, a binder over the cells, has a conjunct `f(x) = t` of a
 * definition `f` kept for the marks, `t` reading nothing `bnd` binds: `f`,
 * the code reading it of a cell, and `t`, so the cells can be read off an
 * index of every cell's value (Signpost's squares holding a number).
 */
function keptPin(
  bnd: Binder,
  scope: Scope,
  env: Env,
): { fn: string; read: string; value: Expr } | null {
  if (bnd.kind !== "in" || bnd.where === null) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "=") continue;
    for (const [side, other] of [
      [c.a, c.b],
      [c.b, c.a],
    ] as const) {
      if (
        side.k !== "call" ||
        scope.has(side.fn) ||
        !env.defs.has(side.fn) ||
        side.args.length !== 1 ||
        side.args[0].k !== "name" ||
        side.args[0].name !== bnd.name
      )
        continue;
      const reads = new Set<string>();
      freeNames(other, reads, new Set());
      if (reads.has(bnd.name)) continue;
      const mark = Out.mark();
      const y = Out.fresh("_y");
      const probe = new Out(0);
      const f = compileExpr(
        side,
        new Map([...scope, [bnd.name, { code: y, sort: elem("cell") }]]),
        env,
        probe,
      );
      if (
        probe.entries.length > 0 ||
        f.sort.k !== "num" ||
        !f.code.startsWith(`${side.fn}(b, `)
      ) {
        Out.rewind(mark);
        continue;
      }
      return { fn: side.fn, read: `(${y}: number): number => ${f.code}`, value: other };
    }
  }
  return null;
}

/**
 * Where `bnd`, a binder over the cells, has a conjunct `t in chain(x)` of the
 * chains the marks keep, `t` reading nothing `bnd` binds: `t`, so the cells
 * can be read off the tree of the cells whose chain holds it.
 */
function chainPin(bnd: Binder, scope: Scope, env: Env): Expr | null {
  if (bnd.kind !== "in" || bnd.where === null || !chainsKept(env)) return null;
  for (const c of fillConjuncts(bnd.where, scope, env)) {
    if (c.k !== "bin" || c.op !== "in") continue;
    const ch = inlined(c.b, scope, env);
    if (!keptChain(ch, env)) continue;
    const [at] = (ch as Extract<Expr, { k: "call" }>).args;
    if (at.k !== "name" || at.name !== bnd.name) continue;
    const reads = new Set<string>();
    freeNames(c.a, reads, new Set());
    if (!reads.has(bnd.name)) return c.a;
  }
  return null;
}

/** A call of a definition read as its body, its parameters replaced by the
 * arguments, until it is no such call. */
function inlined(e: Expr, scope: Scope, env: Env): Expr {
  const def = e.k === "call" && !scope.has(e.fn) ? env.defs.get(e.fn) : undefined;
  if (e.k !== "call" || def === undefined || def.params.length !== e.args.length)
    return e;
  const sub = new Map(def.params.map((p, i) => [p, e.args[i]] as const));
  const avoid = new Set<string>();
  for (const a of e.args) freeNames(a, avoid, new Set());
  return inlined(substitute(def.body, sub, avoid), scope, env);
}

/**
 * A filling's conjuncts, `a and b and c` as `[a, b, c]`, and a call of a definition read as its body's, its
 * parameters replaced by the arguments: so a condition stated once, as
 * Keen's `apart(f, K)`, is kept as each cell is assigned wherever it is
 * written.
 */
function fillConjuncts(e: Expr, scope: Scope, env: Env): Expr[] {
  if (e.k === "bin" && e.op === "and")
    return [...fillConjuncts(e.a, scope, env), ...fillConjuncts(e.b, scope, env)];
  const def = e.k === "call" && !scope.has(e.fn) ? env.defs.get(e.fn) : undefined;
  if (e.k !== "call" || def === undefined || def.params.length !== e.args.length)
    return [e];
  const sub = new Map(def.params.map((p, i) => [p, e.args[i]] as const));
  const avoid = new Set<string>();
  for (const a of e.args) freeNames(a, avoid, new Set());
  return fillConjuncts(substitute(def.body, sub, avoid), scope, env);
}

/** `e` with each name `sub` maps replaced by its term, refusing a binder that
 * would capture a name the terms read (`avoid`). */
function substitute(
  e: Expr,
  sub: ReadonlyMap<string, Expr>,
  avoid: ReadonlySet<string>,
): Expr {
  const go = (x: Expr): Expr => substitute(x, sub, avoid);
  switch (e.k) {
    case "num":
      return e;
    case "name":
      return sub.get(e.name) ?? e;
    case "set":
      return { ...e, elems: e.elems.map(go) };
    case "size":
    case "not":
    case "neg":
      return { ...e, of: go(e.of) };
    case "bin":
      return { ...e, a: go(e.a), b: go(e.b) };
    case "call": {
      const to = sub.get(e.fn);
      if (to !== undefined && to.k !== "name")
        throw new CompileError(`${e.fn}(…): its argument is not a name`);
      return { ...e, fn: to?.k === "name" ? to.name : e.fn, args: e.args.map(go) };
    }
    case "quant":
    case "agg": {
      const inner = new Map(sub);
      const binders = e.binders.map((b) => {
        const of = substitute(b.of, inner, avoid);
        if (avoid.has(b.name))
          throw new CompileError(
            `a definition's binder ${b.name} would capture an argument`,
          );
        inner.delete(b.name);
        return {
          ...b,
          of,
          where: b.where === null ? null : substitute(b.where, inner, avoid),
        };
      });
      const rest = (x: Expr | null): Expr | null =>
        x === null ? null : substitute(x, inner, avoid);
      return e.k === "quant"
        ? { ...e, binders, body: rest(e.body) as Expr }
        : { ...e, binders, where: rest(e.where), term: rest(e.term) };
    }
    case "with":
      return { ...e, cell: go(e.cell), value: go(e.value), body: go(e.body) };
  }
}

/** Whether `e` reads the filling `f` only as `f(x)` of the names `at`. */
function readsOnlyAt(e: Expr, f: string, at: ReadonlySet<string>): boolean {
  const go = (x: Expr | null): boolean => x === null || readsOnlyAt(x, f, at);
  switch (e.k) {
    case "num":
      return true;
    case "name":
      return e.name !== f;
    case "set":
      return e.elems.every(go);
    case "size":
    case "not":
    case "neg":
      return go(e.of);
    case "bin":
      return go(e.a) && go(e.b);
    case "call": {
      if (e.fn !== f) return e.args.every(go);
      const [x] = e.args;
      return e.args.length === 1 && x.k === "name" && at.has(x.name);
    }
    case "quant":
    case "agg":
      return (
        e.binders.every((b) => go(b.of) && go(b.where)) &&
        (e.k === "quant" ? go(e.body) : go(e.where) && go(e.term))
      );
    case "with":
      return go(e.cell) && go(e.value) && go(e.body);
  }
}

/** `forall x in S, y in before(x, S) [where P]: B`, over the filling's own
 * set `S` and reading it only at `x` and `y`: a condition on each pair. */
function pairOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { x: string; y: string; when: Expr | null; body: Expr } | null {
  if (c.k !== "quant" || c.q !== "forall" || c.binders.length !== 2) return null;
  const [bx, by] = c.binders;
  if (bx.kind !== "in" || bx.where !== null || by.kind !== "in") return null;
  if (by.of.k !== "call" || by.of.fn !== "before" || by.of.args.length !== 2)
    return null;
  const [xe, s2] = by.of.args;
  if (xe.k !== "name" || xe.name !== bx.name) return null;
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
  for (const s of [bx.of, s2]) {
    if (reads(s, f) || setKey(compileExpr(s, scope, probe, new Out(0))) !== set)
      return null;
  }
  const at = new Set([bx.name, by.name]);
  if (
    !readsOnlyAt(c.body, f, at) ||
    (by.where !== null && !readsOnlyAt(by.where, f, at))
  )
    return null;
  return { x: bx.name, y: by.name, when: by.where, body: c.body };
}

/** `sum(x in S of f(x)) = t` or the `prod`, either way round, over the
 * filling's own set and with `t` reading no filling; optionally the right
 * side of an `or` whose left reads none, which is then its guard. */
function totalOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { fn: "sum" | "prod"; t: Expr; unless: Expr | null } | null {
  let unless: Expr | null = null;
  let eq = c;
  if (c.k === "bin" && c.op === "or" && !reads(c.a, f)) {
    unless = c.a;
    eq = c.b;
  }
  if (eq.k !== "bin" || eq.op !== "=") return null;
  for (const [agg, t] of [
    [eq.a, eq.b],
    [eq.b, eq.a],
  ]) {
    if (agg.k !== "agg" || (agg.fn !== "sum" && agg.fn !== "prod") || reads(t, f))
      continue;
    const [b] = agg.binders;
    if (
      agg.binders.length !== 1 ||
      b.kind !== "in" ||
      b.where !== null ||
      agg.where !== null
    )
      continue;
    const x = agg.term === null ? null : readOf(agg.term, f);
    if (x?.k !== "name" || x.name !== b.name || reads(b.of, f)) continue;
    const probe: Env = {
      ...env,
      used: new Set(),
      scratch: null,
      hoist: null,
      boardRoot: null,
    };
    if (setKey(compileExpr(b.of, scope, probe, new Out(0))) !== set) continue;
    return { fn: agg.fn, t, unless };
  }
  return null;
}

/** `f(t)`'s argument, where `e` is a read of the filling `f`; else `null`. */
const readOf = (e: Expr, f: string): Expr | null =>
  e.k === "call" && e.fn === f && e.args.length === 1 ? e.args[0] : null;

/** `f(x) = t`, either way round, where neither `x` nor `t` reads `f`. */
function pinOf(c: Expr, f: string): { x: Expr; t: Expr } | null {
  if (c.k !== "bin" || c.op !== "=") return null;
  for (const [r, t] of [
    [c.a, c.b],
    [c.b, c.a],
  ]) {
    const x = readOf(r, f);
    if (x !== null && !reads(x, f) && !reads(t, f)) return { x, t };
  }
  return null;
}

/**
 * Open the depth-first enumeration of a filling `fill f of S [from cand]`:
 * each element of `S` in order takes each of its values ascending, and the
 * code after this runs once a whole assignment, where `continue` goes on to
 * the next. Two kinds of `where` conjunct are kept as each element is
 * assigned rather than once it is whole, which bounds the work and not the
 * result: `distinct(f(x) over x in T)` passes over a value an earlier member
 * of `T` holds, and `f(x) = t` gives `x` the one value `t`. `rest` is the
 * conjuncts left for the whole assignment. The values are kept by cell, so
 * `f(x)` is one read, and are `-1` off `S`.
 */
function fillLoop(
  bnd: Binder,
  scope: Scope,
  env: Env,
  out: Out,
): { code: string; arr: string; rest: Expr | null } {
  const f = bnd.name;
  const s = compileExpr(bnd.of, scope, env, out);
  // A filling gives values to what holds the answer's: cells, or edges.
  const held = elem(env.answerSort);
  if (!(isArray(s.sort) && s.sort.k === "set" && sameSort(s.sort.of, held)))
    throw new CompileError(
      `fill ${f} of ${show(s.sort)}: not a set of ${env.answerSort}s`,
    );
  if (bnd.from !== undefined && bnd.from !== "cand")
    throw new CompileError(`fill ${f} from ${bnd.from}: only from cand`);
  const a = Out.fresh("_a");
  const fv = heldName("_f", env);
  const last = heldName("_l", env);
  const st = Out.fresh("_s");
  // Each a call: the values by cell, the set they were last given over, so
  // the next enumeration clears it, and each depth's last value tried.
  const decls = [
    `const ${fv} = new Int32Array(${answerCount(env)}).fill(-1);`,
    `let ${last}: readonly number[] = [];`,
    `const ${st}: number[] = [];`,
  ];
  if (env.scratch !== null && env.held !== undefined) {
    env.held.push(
      `let ${fv} = new Int32Array(0);`,
      `let ${last}: readonly number[] = [];`,
    );
    // Cleared whole each run: the set it was last given over may be a
    // scratch array the run before has since refilled.
    env.scratch.push(
      `if (${fv}.length < ${answerCount(env)}) ${fv} = new Int32Array(${answerCount(env)}).fill(-1);`,
      `else ${fv}.fill(-1);`,
      `${last} = [];`,
      `const ${st}: number[] = [];`,
    );
  } else if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  out.emit(`const ${a} = ${s.code};`);
  // Each check is written into the loop over a cell's values, where
  // `continue` passes over the value.
  const checks: ((o: Out) => void)[] = [];
  const rest: Expr[] = [];
  const e = Out.fresh("_e");
  const d = Out.fresh("_d");
  const i = Out.fresh("_i");
  const j = Out.fresh("_j");
  const valueLoop = Out.fresh("V");
  let paired = false;
  const filling: Val = { code: fv, sort: { k: "fill" } };
  for (const c of bnd.where === null ? [] : fillConjuncts(bnd.where, scope, env)) {
    const pinned = pinOf(c, f);
    const term = c.k === "agg" && c.fn === "distinct" ? c.term : null;
    const over = c.k === "agg" ? c.binders : [];
    const pair = pinned === null ? pairOf(c, f, setKey(s), scope, env) : null;
    const total =
      pinned === null && pair === null ? totalOf(c, f, setKey(s), scope, env) : null;
    if (pinned !== null) {
      const x = once(compileExpr(pinned.x, scope, env, out), out);
      expectElem(x, env.answerSort, f);
      const t = once(compileExpr(pinned.t, scope, env, out), out);
      expect(t, "num", f);
      checks.push((o) =>
        o.emit(`if (${e} === ${x.code} && ${d} !== ${t.code}) continue;`),
      );
    } else if (pair !== null) {
      // Each pair is checked once the later of its two cells has its value:
      // the whole condition, so it is not read again.
      paired = true;
      checks.push((o) => {
        const y = Out.fresh("_y");
        const inner = new Map(scope);
        inner.set(f, filling);
        inner.set(pair.x, { code: e, sort: held });
        inner.set(pair.y, { code: y, sort: held });
        const flat: Env = { ...env, hoist: null, boundSets: env.hoist !== null };
        o.open(`for (let ${j} = 0; ${j} < ${i}; ${j}++) {`);
        o.emit(`const ${y} = ${a}[${j}];`);
        if (pair.when !== null) {
          const w = compileExpr(pair.when, inner, flat, o);
          expect(w, "bool", `where of ${pair.y}`);
          o.emit(`if (!(${w.code})) continue;`);
        }
        const b = compileExpr(pair.body, inner, flat, o);
        expect(b, "bool", "forall");
        o.emit(`if (!(${b.code})) continue ${valueLoop};`);
        o.close();
      });
    } else if (total !== null) {
      // Each element still to be given a value adds at least the domain's
      // least and at most its greatest, so a sum that cannot come to `t`
      // either way is passed over; a product that does not divide `t` never
      // comes to it, while it is positive. The whole condition is read again
      // once the filling is.
      rest.push(c);
      const unless =
        total.unless === null
          ? null
          : once(compileExpr(total.unless, scope, env, out), out);
      if (unless !== null) expect(unless, "bool", "or");
      const t = once(compileExpr(total.t, scope, env, out), out);
      expect(t, "num", total.fn);
      const lo = Out.fresh("_lo");
      const hi = Out.fresh("_hi");
      if (total.fn === "sum") {
        out.emit(`const ${lo} = 31 - Math.clz32(b.domain & -b.domain);`);
        out.emit(`const ${hi} = 31 - Math.clz32(b.domain);`);
      }
      checks.push((o) => {
        const p = Out.fresh("_t");
        o.open(unless === null ? "{" : `if (!${unless.code}) {`);
        o.emit(`let ${p} = ${d};`);
        o.emit(
          `for (let ${j} = 0; ${j} < ${i}; ${j}++) ${p} ${total.fn === "sum" ? "+=" : "*="} ${fv}[${a}[${j}]];`,
        );
        if (total.fn === "sum") {
          const left = `(${a}.length - ${i} - 1)`;
          o.emit(`if (${p} + ${left} * ${lo} > ${t.code}) continue;`);
          o.emit(`if (${p} + ${left} * ${hi} < ${t.code}) continue;`);
        } else o.emit(`if (${p} > 0 && ${t.code} % ${p} !== 0) continue;`);
        o.close();
      });
    } else if (
      term !== null &&
      over.length === 1 &&
      over[0].kind === "in" &&
      over[0].where === null &&
      !reads(over[0].of, f) &&
      readOf(term, f)?.k === "name" &&
      (readOf(term, f) as { name: string }).name === over[0].name
    ) {
      const T = once(compileExpr(over[0].of, scope, env, out), out);
      if (!sameSort(T.sort, s.sort))
        throw new CompileError(`distinct(${f}(…) over ${show(T.sort)})`);
      const inT = (x: string): string =>
        T.code === s.code ? "true" : `${T.code}.includes(${x})`;
      checks.push((o) =>
        o.emit(
          `if (${inT(e)}) { let ${j} = 0; while (${j} < ${i} && !(${fv}[${a}[${j}]] === ${d} && ${inT(`${a}[${j}]`)})) ${j}++; if (${j} < ${i}) continue; }`,
        ),
      );
    } else rest.push(c);
  }
  const mask =
    bnd.from === undefined
      ? "b.domain"
      : supposedRead(
          e,
          env,
          (s) => `(1 << ${s.value})`,
          env.memo ? candOf(e, env) : marksRead("cand", e, env),
        );
  const r = Out.fresh("_r");
  const once0 = Out.fresh("_o");
  out.emit(`for (const ${e} of ${last}) ${fv}[${e}] = -1;`);
  out.emit(`${last} = ${a};`);
  out.emit(`let ${i} = 0;`);
  out.emit(`${st}[0] = 0;`);
  // The empty set has one filling, the empty one.
  out.emit(`let ${once0} = ${a}.length === 0;`);
  out.open("for (;;) {");
  out.open(`if (${a}.length === 0) {`);
  out.emit(`if (!${once0}) break;`);
  out.emit(`${once0} = false;`);
  out.close();
  out.open(`while (${a}.length > 0 && ${i} >= 0) {`);
  out.emit(`const ${e} = ${a}[${i}];`);
  out.emit(`if (${st}[${i}] > 0) ${fv}[${e}] = -1;`);
  out.emit(`let ${r} = ${mask} & ~((2 << ${st}[${i}]) - 1);`);
  out.emit(`let ${d} = 0;`);
  out.open(`${paired ? `${valueLoop}: ` : ""}for (; ${r} !== 0; ${r} &= ${r} - 1) {`);
  out.emit(`${d} = 31 - Math.clz32(${r} & -${r});`);
  // The value is the cell's while it is checked, for a pair to read; a value
  // passed over is replaced before any check reads the cell again.
  out.emit(`${fv}[${e}] = ${d};`);
  for (const check of checks) check(out);
  out.emit("break;");
  out.close();
  out.open(`if (${r} === 0) {`);
  out.emit(`${st}[${i}] = 0;`);
  out.emit(`${i}--;`);
  out.emit("continue;");
  out.close();
  out.emit(`${st}[${i}] = ${d};`);
  out.emit(`if (${i} === ${a}.length - 1) break;`);
  out.emit(`${i}++;`);
  out.emit(`${st}[${i}] = 0;`);
  out.close();
  out.emit(`if (${i} < 0) break;`);
  return {
    code: fv,
    arr: a,
    rest:
      rest.length === 0
        ? null
        : rest.reduce((x, y) => ({ k: "bin", op: "and", a: x, b: y })),
  };
}

/** Where `where`'s first conjunct compares `|name|` with a term that does not
 * read `name`: the comparison, as TypeScript, and the term. */
function sizeTest(name: string, where: Expr | null): { op: string; of: Expr } | null {
  let first = where;
  while (first !== null && first.k === "bin" && first.op === "and") first = first.a;
  if (first === null || first.k !== "bin") return null;
  const ops: Readonly<Record<string, string>> = {
    "=": "===",
    "<=": "<=",
    "<": "<",
    ">=": ">=",
    ">": ">",
  };
  const op = ops[first.op];
  const { a, b } = first;
  if (op === undefined || a.k !== "size" || a.of.k !== "name" || a.of.name !== name)
    return null;
  return reads(b, name) ? null : { op, of: b };
}

function clueKindArg(args: readonly Expr[], env: Env): string {
  const a = args[0];
  if (args.length !== 1 || a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError(
      `clues(kind) names a clue kind of the description${a?.k === "name" ? `, and ${a.name} is none` : ""}`,
    );
  return a.name;
}

/** The clue at the board's field named `fn`, with its kind, or `null`. */
function fieldOf(
  fn: string,
  env: Env,
): { kind: string; at: ElemSort | null; v: Sort } | null {
  for (const [kind, c] of env.clues) {
    const f = c.fields?.get(fn);
    if (f !== undefined) return { kind, ...f };
  }
  return null;
}

/** Whether `name` is read anywhere in `e`. */
function reads(e: Expr, name: string): boolean {
  switch (e.k) {
    case "num":
      return false;
    case "name":
      return e.name === name;
    case "set":
      return e.elems.some((x) => reads(x, name));
    case "size":
    case "not":
    case "neg":
      return reads(e.of, name);
    case "bin":
      return reads(e.a, name) || reads(e.b, name);
    case "call":
      return e.fn === name || e.args.some((x) => reads(x, name));
    case "with":
      return reads(e.cell, name) || reads(e.value, name) || reads(e.body, name);
    case "quant":
    case "agg":
      return (
        e.binders.some(
          (b) => reads(b.of, name) || (b.where !== null && reads(b.where, name)),
        ) ||
        (e.k === "quant"
          ? reads(e.body, name)
          : e.term !== null && reads(e.term, name)) ||
        (e.k === "agg" && e.where !== null && reads(e.where, name))
      );
  }
}

/**
 * `exists d in S: d in T` and `forall d in S: d in T` (or `not in`), where
 * both are sets of values, as the bitwise test it is: one AND, not a loop
 * over `S`'s members. `null` where the quantifier has another shape.
 */
function setQuantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const [b, ...more] = e.binders;
  const body = e.body;
  if (b === undefined || more.length > 0 || b.kind !== "in" || b.where !== null)
    return null;
  if (body.k !== "bin" || (body.op !== "in" && body.op !== "notin")) return null;
  if (body.a.k !== "name" || body.a.name !== b.name || reads(body.b, b.name))
    return null;
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
  if (!isMask(compileExpr(b.of, scope, probe, new Out(0)).sort)) return null;
  if (!isMask(compileExpr(body.b, scope, probe, new Out(0)).sort)) return null;
  const s = compileExpr(b.of, scope, env, out);
  const t = compileExpr(body.b, scope, env, out);
  // The members of S that the body holds of: in T, or outside it.
  const hit = body.op === "in" ? `(${s.code} & ${t.code})` : `(${s.code} & ~${t.code})`;
  const miss =
    body.op === "in" ? `(${s.code} & ~${t.code})` : `(${s.code} & ${t.code})`;
  return {
    code: e.q === "exists" ? `(${hit} !== 0)` : `(${miss} === 0)`,
    sort: BOOL,
  };
}

/**
 * `exists x in cells(r): x in cells(s)` and `forall x in cells(r): x in
 * cells(s)` (or `not in`), `r` and `s` rectangles, as a comparison of their
 * sides: whether they meet, or one lies within the other. `null` where the
 * quantifier has another shape.
 */
function rectQuantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const [b, ...more] = e.binders;
  const body = e.body;
  if (b === undefined || more.length > 0 || b.kind !== "in" || b.where !== null)
    return null;
  if (body.k !== "bin" || (body.op !== "in" && body.op !== "notin")) return null;
  if (body.a.k !== "name" || body.a.name !== b.name) return null;
  const cellsOf = (x: Expr): Expr | null =>
    x.k === "call" &&
    x.fn === "cells" &&
    x.args.length === 1 &&
    !reads(x.args[0], b.name)
      ? x.args[0]
      : null;
  const re = cellsOf(b.of);
  const se = cellsOf(body.b);
  if (re === null || se === null) return null;
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
  const isRect = (x: Expr): boolean => {
    const s = compileExpr(x, scope, probe, new Out(0)).sort;
    return s.k === "elem" && s.e === "rect";
  };
  if (!isRect(re) || !isRect(se)) return null;
  const r = compileExpr(re, scope, env, out);
  const s = compileExpr(se, scope, env, out);
  // Every cell of r in s is r within s; some is r meeting s; `not in`
  // turns each into the other's negation.
  const within = e.q === "forall" ? body.op === "in" : body.op === "notin";
  const fn = within ? "rectWithin" : "rectMeets";
  env.used.add(fn);
  const call = `${fn}(sp, ${r.code}, ${s.code})`;
  return { code: body.op === "notin" ? `!${call}` : call, sort: BOOL };
}

/** The names `e` reads that it does not bind, function names included. */
function freeNames(e: Expr, into: Set<string>, bound: ReadonlySet<string>): void {
  switch (e.k) {
    case "num":
      return;
    case "name":
      if (!bound.has(e.name)) into.add(e.name);
      return;
    case "set":
      for (const x of e.elems) freeNames(x, into, bound);
      return;
    case "size":
    case "not":
    case "neg":
      freeNames(e.of, into, bound);
      return;
    case "bin":
      freeNames(e.a, into, bound);
      freeNames(e.b, into, bound);
      return;
    case "call":
      if (!bound.has(e.fn)) into.add(e.fn);
      for (const x of e.args) freeNames(x, into, bound);
      return;
    case "quant":
    case "agg": {
      const inner = new Set(bound);
      for (const b of e.binders) {
        freeNames(b.of, into, inner);
        inner.add(b.name);
        if (b.where !== null) freeNames(b.where, into, inner);
      }
      if (e.k === "quant") freeNames(e.body, into, inner);
      else {
        if (e.term !== null) freeNames(e.term, into, inner);
        if (e.where !== null) freeNames(e.where, into, inner);
      }
      return;
    }
  }
}

/**
 * `exists fill f of S where ... and f(x) = t: B`, asked inside loops that
 * bind only `x` and `t`, as the projection it is: every filling the rest
 * allows, enumerated once where the rest's names are bound, keeps the values
 * it gives each cell, and the question is whether `t` is among `x`'s. It is
 * enumerated again only once the kept candidates it read are cleared
 * (`_epoch`), so it answers as the pinned enumeration would. `null` where
 * the quantifier has another shape, or computing it earlier saves no loop.
 */
function projection(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const h = env.hoist;
  const [bnd, ...more] = e.binders;
  if (e.q !== "exists" || more.length > 0 || h === null || env.epoch === null)
    return null;
  if (bnd.kind !== "fill" || bnd.where === null) return null;
  const f = bnd.name;
  const cs = fillConjuncts(bnd.where, scope, env);
  const at = cs.findIndex((c) => pinOf(c, f) !== null);
  if (at < 0) return null;
  const pin = pinOf(cs[at], f) as { x: Expr; t: Expr };
  const rest = cs.filter((_, i) => i !== at);
  const names = new Set<string>();
  const own = new Set([f]);
  freeNames(bnd.of, names, new Set());
  for (const c of rest) freeNames(c, names, own);
  freeNames(e.body, names, own);
  let slot = h.root;
  for (const n of names) {
    const v = scope.get(n);
    if (v === undefined) continue;
    if (v.at === undefined) return null;
    if (v.at.seq > slot.seq) slot = v.at;
  }
  if (slot.loops >= h.loops) return null;
  if (!env.epoch.used) {
    env.epoch.used = true;
    h.root.lines.push({ indent: 0, text: "let _epoch = 0;" });
  }
  const pj = heldName("_p", env);
  const last = heldName("_l", env);
  const any = Out.fresh("_y");
  const made = Out.fresh("_g");
  const decls = [
    `const ${pj} = new Int32Array(${answerCount(env)});`,
    `let ${last}: readonly number[] = [];`,
    `let ${any} = false;`,
  ];
  if (env.scratch !== null && env.held !== undefined) {
    env.held.push(
      `let ${pj} = new Int32Array(0);`,
      `let ${last}: readonly number[] = [];`,
    );
    // Cleared whole each run, as the filling's values are.
    env.scratch.push(
      `if (${pj}.length < ${answerCount(env)}) ${pj} = new Int32Array(${answerCount(env)});`,
      `else ${pj}.fill(0);`,
      `${last} = [];`,
      `let ${any} = false;`,
    );
  } else if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  // The rest's names are bound anew there, so the projection is due again.
  slot.lines.push({ indent: 0, text: `let ${made} = -1;` });
  out.open(`if (${made} !== _epoch) {`);
  out.emit(`${made} = _epoch;`);
  const x0 = Out.fresh("_e");
  out.emit(`for (const ${x0} of ${last}) ${pj}[${x0}] = 0;`);
  out.emit(`${any} = false;`);
  const pattern = onlyRunPattern(bnd, [...rest, e.body], scope, env);
  if (pattern !== null) {
    // Every filling at once, by the line's dynamic program.
    const S = once(compileExpr(bnd.of, scope, env, out), out);
    const o = Out.fresh("_o");
    const fits = fitsCall(bnd, S, pattern, o, scope, env, out);
    out.open(`if (${fits}) {`);
    out.emit(`${last} = ${S.code};`);
    out.emit(`${any} = true;`);
    out.emit(
      `for (let ${x0} = 0; ${x0} < ${S.code}.length; ${x0}++) ${pj}[${S.code}[${x0}]] = ${o}[${x0}];`,
    );
    out.close();
  } else {
    const where =
      rest.length === 0
        ? null
        : rest.reduce((a, b): Expr => ({ k: "bin", op: "and", a, b }));
    const fl = fillLoop({ ...bnd, where }, scope, env, out);
    h.loops++;
    const inner = new Map(scope);
    inner.set(f, { code: fl.code, sort: { k: "fill" }, at: out.slot(h.loops) });
    for (const cond of [fl.rest, e.body]) {
      if (cond === null) continue;
      const v = compileExpr(cond, inner, env, out);
      expect(v, "bool", "exists fill");
      out.emit(`if (!(${v.code})) continue;`);
    }
    out.emit(`${last} = ${fl.arr};`);
    out.emit(`${any} = true;`);
    out.emit(`for (const ${x0} of ${fl.arr}) ${pj}[${x0}] |= 1 << ${fl.code}[${x0}];`);
    h.loops--;
    out.close();
  }
  out.close();
  const x = once(compileExpr(pin.x, scope, env, out), out);
  expectElem(x, env.answerSort, f);
  const t = once(compileExpr(pin.t, scope, env, out), out);
  expect(t, "num", f);
  const s = compileExpr(bnd.of, scope, env, out);
  // Off S, f(x) is -1, which only a t of -1 equals. A numeral t is widened,
  // which the typechecker otherwise calls a comparison that cannot hold.
  return {
    code: `((((${pj}[${x.code}] >> ${t.code}) & 1) !== 0) || ((${t.code} as number) === -1 && ${any} && !${s.code}.includes(${x.code})))`,
    sort: BOOL,
  };
}

/** `run_lengths(L, {x in cells(L) where f(x) = v}) = R`, either way round, where
 * the filling `f` is of `cells(L)` itself and neither `v` nor `R` reads it:
 * the line, the run value and the lengths. */
function runPatternOf(
  c: Expr,
  f: string,
  set: string,
  scope: Scope,
  env: Env,
): { L: Expr; v: Expr; R: Expr } | null {
  if (c.k !== "bin" || c.op !== "=") return null;
  for (const [r, R] of [
    [c.a, c.b],
    [c.b, c.a],
  ]) {
    if (r.k !== "call" || r.fn !== "run_lengths" || r.args.length !== 2 || reads(R, f))
      continue;
    const [L, T] = r.args;
    if (reads(L, f) || T.k !== "agg" || T.fn !== "set" || T.where !== null) continue;
    const [b] = T.binders;
    if (T.binders.length !== 1 || b.kind !== "in" || b.where === null) continue;
    if (T.term?.k !== "name" || T.term.name !== b.name) continue;
    const cellsOfL: Expr = { k: "call", fn: "cells", args: [L] };
    if (JSON.stringify(b.of) !== JSON.stringify(cellsOfL)) continue;
    const pin = pinOf(b.where, f);
    if (pin === null || pin.x.k !== "name" || pin.x.name !== b.name) continue;
    const probe: Env = {
      ...env,
      used: new Set(),
      scratch: null,
      hoist: null,
      boardRoot: null,
    };
    if (setKey(compileExpr(cellsOfL, scope, probe, new Out(0))) !== set) continue;
    return { L, v: pin.t, R };
  }
  return null;
}

/** The run pattern a filling's conditions `conds` are, read through the
 * definitions they call, where they are that and nothing else (a `true`
 * aside), and the filling is of a line's squares from `cand` or from the
 * domain; else `null`. */
function onlyRunPattern(
  bnd: Binder,
  conds: readonly Expr[],
  scope: Scope,
  env: Env,
): { L: Expr; v: Expr; R: Expr } | null {
  if (bnd.kind !== "fill" || (bnd.from !== undefined && bnd.from !== "cand"))
    return null;
  const cs = conds
    .flatMap((c) => fillConjuncts(c, scope, env))
    .filter((c) => !(c.k === "name" && c.name === "true"));
  if (cs.length !== 1) return null;
  const probe: Env = {
    ...env,
    used: new Set(),
    scratch: null,
    hoist: null,
    boardRoot: null,
  };
  const s = compileExpr(bnd.of, scope, probe, new Out(0));
  return runPatternOf(cs[0], bnd.name, setKey(s), scope, env);
}

/**
 * The runtime's `runFits` over the filling `bnd` of the line `S`, with its
 * squares' masks read from `cand` or the domain: TypeScript that is whether
 * any filling fits `pattern`, and that writes each square's values over the
 * fillings into `o`, by the square's place on the line, where `o` is given.
 */
function fitsCall(
  bnd: Binder,
  S: Val,
  pattern: { L: Expr; v: Expr; R: Expr },
  o: string | null,
  scope: Scope,
  env: Env,
  out: Out,
): string {
  const v = compileExpr(pattern.v, scope, env, out);
  expect(v, "num", "run_lengths");
  const R = compileExpr(pattern.R, scope, env, out);
  if (R.sort.k !== "list")
    throw new CompileError(`run_lengths(L, S) = ${show(R.sort)}`);
  const m = Out.fresh("_m");
  const i = Out.fresh("_i");
  const x = Out.fresh("_e");
  const decls = [
    `const ${m} = new Int32Array(${answerCount(env)});`,
    ...(o === null ? [] : [`const ${o} = new Int32Array(${answerCount(env)});`]),
  ];
  if (env.scratch !== null) env.scratch.push(...decls);
  else for (const d of decls) out.emit(d);
  const mask =
    bnd.from === undefined
      ? "b.domain"
      : supposedRead(
          x,
          env,
          (sup) => `(1 << ${sup.value})`,
          env.memo ? candOf(x, env) : marksRead("cand", x, env),
        );
  out.open(`for (let ${i} = 0; ${i} < ${S.code}.length; ${i}++) {`);
  out.emit(`const ${x} = ${S.code}[${i}];`);
  out.emit(`${m}[${i}] = ${mask};`);
  out.close();
  env.used.add("runFits");
  const fits = Out.fresh("_y");
  out.emit(
    `const ${fits} = runFits(${m}, ${S.code}.length, ${v.code}, ${R.code}, ${o ?? "null"});`,
  );
  return fits;
}

/**
 * `exists fill f of cells(L) [from cand] where ...: ...` whose conditions,
 * its `where` and its body alike, are one run pattern (`runPatternOf`) and
 * any number of pins `f(x) = t`: decided by the runtime's `runFits`, a
 * dynamic program over the line, where listing the fillings would take time
 * exponential in the line's length. `null` for any other shape.
 */
function runFill(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const [bnd, ...more] = e.binders;
  if (e.q !== "exists" || more.length > 0 || bnd.kind !== "fill") return null;
  const f = bnd.name;
  const conds = [
    ...(bnd.where === null ? [] : fillConjuncts(bnd.where, scope, env)),
    e.body,
  ];
  const pinned = conds.flatMap((c) => {
    const pin = pinOf(c, f);
    return pin === null ? [] : [pin];
  });
  const pattern = onlyRunPattern(
    bnd,
    conds.filter((c) => pinOf(c, f) === null),
    scope,
    env,
  );
  if (pattern === null) return null;
  const S = once(compileExpr(bnd.of, scope, env, out), out);
  const o = Out.fresh("_o");
  const tests = [
    fitsCall(bnd, S, pattern, pinned.length > 0 ? o : null, scope, env, out),
  ];
  for (const pin of pinned) {
    const px = once(compileExpr(pin.x, scope, env, out), out);
    expectElem(px, env.answerSort, f);
    const t = once(compileExpr(pin.t, scope, env, out), out);
    expect(t, "num", f);
    const at = Out.fresh("_p");
    out.emit(`const ${at} = ${S.code}.indexOf(${px.code});`);
    // Off the line f(x) is -1, which only a t of -1 equals.
    tests.push(
      `(${at} < 0 ? (${t.code} as number) === -1 : ((${o}[${at}] >> ${t.code}) & 1) !== 0)`,
    );
  }
  return { code: `(${tests.join(" && ")})`, sort: BOOL };
}

/** How a name in a term summed over a group reaches the marks: the group's
 * point, a square round it, or anything else bound inside the term. */
type RoundName = "point" | "round" | "other";

/**
 * Whether `e` reads the marks only at the squares round the point it is
 * about, and no name from outside it: then a placement changes it only at
 * the placed square's own points, which is what lets the runtime keep a sum
 * of it over a group a placement at a time.
 */
function readsRound(
  e: Expr,
  names: ReadonlyMap<string, RoundName>,
  env: Env,
  depth = 0,
): boolean {
  if (depth > 8) return false;
  const all = (es: readonly Expr[], ns = names): boolean =>
    es.every((x) => readsRound(x, ns, env, depth));
  switch (e.k) {
    case "num":
      return true;
    case "name": {
      if (names.has(e.name) || env.clues.has(e.name)) return true;
      const def = env.defs.get(e.name);
      if (def !== undefined)
        return (
          def.params.length === 0 && readsRound(def.body, new Map(), env, depth + 1)
        );
      return NAMES[e.name] !== undefined;
    }
    case "call": {
      const { fn, args } = e;
      // Not `cand`: a strike is not logged, so a kept sum would miss it.
      if (fn === "value" || fn === "known") {
        const [c] = args;
        return args.length === 1 && c.k === "name" && names.get(c.name) === "round";
      }
      if (MARK_READS.has(fn) || isMarkRead(fn, env) || names.has(fn)) return false;
      if (!all(args)) return false;
      const def = env.defs.get(fn);
      if (def === undefined) return true;
      if (def.params.length !== args.length) return false;
      const inner = new Map<string, RoundName>();
      def.params.forEach((p, i) => {
        const a = args[i];
        inner.set(p, a.k === "name" ? (names.get(a.name) ?? "other") : "other");
      });
      return readsRound(def.body, inner, env, depth + 1);
    }
    case "with":
      return false;
    case "quant":
    case "agg": {
      const inner = new Map(names);
      for (const b of e.binders) {
        if (b.kind === "fill" || !readsRound(b.of, inner, env, depth)) return false;
        const round =
          b.kind === "in" &&
          b.of.k === "call" &&
          b.of.fn === "cells" &&
          b.of.args.length === 1 &&
          b.of.args[0].k === "name" &&
          inner.get(b.of.args[0].name) === "point";
        inner.set(b.name, round ? "round" : "other");
        if (b.where !== null && !readsRound(b.where, inner, env, depth)) return false;
      }
      const rest =
        e.k === "quant" ? [e.body] : [e.where, e.term].filter((x) => x !== null);
      return all(rest, inner);
    }
    default:
      return all(children(e));
  }
}

/**
 * A `sum`, `count`, `forall` or `exists` over the set `linked(k)` of the
 * marks, whose term reads them only round its own point, read from the sum
 * the runtime keeps over each group as the hand-written solver kept its
 * groups' exits (`linkedSum`): joined as two groups join, and moved a
 * placement at a time. Without it, every read walked the whole group. `null`
 * where the aggregate is not one.
 */
function linkedAggregate(
  how: "sum" | "count" | "forall" | "exists",
  binders: readonly Binder[],
  where: Expr | null,
  term: Expr | null,
  scope: Scope,
  env: Env,
): Val | null {
  const { kept } = env;
  if (
    kept === null ||
    env.answer !== null ||
    env.position !== null ||
    env.supposed.length > 0 ||
    binders.length !== 1 ||
    binders[0].kind !== "in"
  )
    return null;
  const [binder] = binders;
  const of = binder.of;
  const set =
    of.k === "name"
      ? scope.get(of.name)
      : of.k === "call" && of.fn === "linked" && !scope.has("linked")
        ? compileExpr(of, scope, env, new Out(0))
        : undefined;
  if (set?.group === undefined) return null;
  const filter =
    binder.where === null
      ? where
      : where === null
        ? binder.where
        : ({ k: "bin", op: "and", a: binder.where, b: where } as const);
  const point = new Map<string, RoundName>([[binder.name, "point"]]);
  if (filter !== null && !readsRound(filter, point, env)) return null;
  if (term !== null && !readsRound(term, point, env)) return null;

  const key = JSON.stringify([how, binder.name, filter, term]);
  let made = kept.terms.get(key);
  if (made === undefined) {
    const v = `v_${binder.name}`;
    const readsClues = { yes: false };
    const body = new Out(1);
    const sc: Scope = new Map([[binder.name, { code: v, sort: elem("point") }]]);
    const own: Env = {
      ...env,
      used: kept.used,
      readsClues,
      scratch: null,
      hoist: null,
      boardRoot: null,
      concluding: false,
      memo: false,
      epoch: null,
    };
    if (how !== "count" && term === null) return null;
    Out.own("", () => {
      if (filter !== null) {
        const w = compileExpr(filter, sc, own, body);
        expect(w, "bool", how);
        body.emit(`if (!(${w.code})) return 0;`);
      }
      if (term === null || how === "count") body.emit("return 1;");
      else {
        const t = compileExpr(term, sc, own, body);
        expect(t, how === "sum" ? "num" : "bool", how);
        body.emit(
          how === "sum"
            ? `return ${t.code};`
            : `return (${t.code}) ? ${how === "forall" ? "0 : 1" : "1 : 0"};`,
        );
      }
    });
    const fn = `linkTerm${kept.terms.size}`;
    const text = body.text();
    // A term that reads no marks, or no geometry, leaves its parameter unread.
    const param = (p: string): string =>
      new RegExp(`\\b${p}\\.`).test(text.join("\n")) ? p : `_${p}`;
    kept.defs.set(fn, {
      sort: NUM,
      clues: readsClues.yes,
      board: false,
      code: [
        `/** What each point of a group adds to a ${how} kept over the group. */`,
        `function ${fn}(${param("b")}: Marks, ${param("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt" : "_cl: null"}, ${v}: number): number {`,
        ...text,
        "}",
      ].join("\n"),
    });
    made = { fn, clues: readsClues.yes };
    kept.terms.set(key, made);
  }
  if (made.clues) env.readsClues.yes = true;
  env.used.add("linkedSum");
  const sum = `linkedSum(sp, b, ${made.clues ? "cl" : "null"}, ${made.fn}, ${set.group})`;
  switch (how) {
    case "forall":
      return { code: `(${sum} === 0)`, sort: BOOL };
    case "exists":
      return { code: `(${sum} > 0)`, sort: BOOL };
    default:
      return { code: sum, sort: NUM };
  }
}

/**
 * Whether `e` reads the marks only through `value` and `known` of edge `x`
 * (an answer on the edges) or of `end1(x)` and `end2(x)` (one on the cells),
 * and from outside only clues, constants and the scalar names it adds to
 * `outer`: then a placement changes it only at the edges its index names.
 * Candidates are not read, since a strike is not logged.
 */
function readsAtEdge(
  e: Expr,
  x: string,
  scope: Scope,
  env: Env,
  outer: Set<string>,
  depth = 0,
): boolean {
  if (depth > 8) return false;
  const go = (y: Expr): boolean => readsAtEdge(y, x, scope, env, outer, depth);
  switch (e.k) {
    case "num":
      return true;
    case "name": {
      if (e.name === x || env.clues.has(e.name)) return true;
      const bound = scope.get(e.name);
      if (bound !== undefined) {
        if (!scalar(bound.sort)) return false;
        outer.add(e.name);
        return true;
      }
      const def = env.defs.get(e.name);
      if (def !== undefined)
        return (
          def.params.length === 0 &&
          readsAtEdge(def.body, x, scope, env, outer, depth + 1)
        );
      return NAMES[e.name] !== undefined;
    }
    case "call": {
      const { fn, args } = e;
      const isX = (a: Expr): boolean => a.k === "name" && a.name === x;
      if (fn === "value" || fn === "known") {
        const [c] = args;
        if (args.length !== 1) return false;
        return env.answerSort === "edge"
          ? isX(c)
          : c.k === "call" && (c.fn === "end1" || c.fn === "end2") && isX(c.args[0]);
      }
      if (MARK_READS.has(fn) || isMarkRead(fn, env) || scope.has(fn)) return false;
      const def = env.defs.get(fn);
      if (def !== undefined) {
        const body = inlined(e, scope, env);
        return body !== e && readsAtEdge(body, x, scope, env, outer, depth + 1);
      }
      return args.every(go);
    }
    case "not":
    case "neg":
    case "size":
      return go(e.of);
    case "bin":
      return go(e.a) && go(e.b);
    default:
      return false;
  }
}

/**
 * Where `of`, the set a binder names, is `{x in edges where P}` and `P`
 * reads the marks only at the edge (`readsAtEdge`), and at most one number
 * bound before it: `P` compiled once as a function of the module, so the
 * groups the set joins are kept on the marks a placement at a time
 * (`keptEdgeGroups`) rather than joined afresh at each binding, which
 * cost Filling's deals a fifth of their time. `null` for any other set.
 */
function keptEdgeSet(
  of: Expr,
  scope: Scope,
  env: Env,
): ReturnType<NonNullable<Val["edgeSet"]>> {
  const { kept } = env;
  if (
    kept === null ||
    env.answer !== null ||
    env.position !== null ||
    env.supposed.length > 0
  )
    return null;
  let set = of;
  if (set.k === "name" && !scope.has(set.name)) {
    const def = env.defs.get(set.name);
    if (def !== undefined && def.params.length === 0) set = def.body;
  }
  set = inlined(set, scope, env);
  if (
    set.k !== "agg" ||
    set.fn !== "set" ||
    set.binders.length !== 1 ||
    set.where !== null ||
    set.term?.k !== "name"
  )
    return null;
  const [bnd] = set.binders;
  if (
    bnd.kind !== "in" ||
    bnd.of.k !== "name" ||
    bnd.of.name !== "edges" ||
    scope.has("edges") ||
    bnd.where === null ||
    set.term.name !== bnd.name
  )
    return null;
  const outer = new Set<string>();
  if (!readsAtEdge(bnd.where, bnd.name, scope, env, outer) || outer.size > 1)
    return null;
  const [a] = outer;
  const key = JSON.stringify(["edges", bnd.name, bnd.where, a ?? null]);
  let made = kept.terms.get(key);
  if (made === undefined) {
    const v = `v_${bnd.name}`;
    const readsClues = { yes: false };
    const body = new Out(1);
    const sc = new Map<string, Val>([[bnd.name, { code: v, sort: elem("edge") }]]);
    if (a !== undefined) sc.set(a, { code: "a", sort: (scope.get(a) as Val).sort });
    const own: Env = {
      ...env,
      used: kept.used,
      readsClues,
      scratch: null,
      hoist: null,
      boardRoot: null,
      concluding: false,
      memo: false,
      epoch: null,
    };
    const where = bnd.where;
    const w = Out.own("", () => compileExpr(where, sc, own, body));
    expect(w, "bool", `{${bnd.name} in edges where …}`);
    body.emit(`return ${w.code};`);
    const fn = `edgeHolds${kept.terms.size}`;
    const text = body.text();
    const param = (p: string): string =>
      new RegExp(`\\b${p}\\b`).test(text.join("\n")) ? p : `_${p}`;
    kept.defs.set(fn, {
      sort: BOOL,
      clues: readsClues.yes,
      board: false,
      code: [
        "/** Whether an edge is in a set whose groups are kept on the marks. */",
        `function ${fn}(${param("b")}: Marks, ${param("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt" : "_cl: null"}, ${v}: number, ${param("a")}: number): boolean {`,
        ...text,
        "}",
      ].join("\n"),
    });
    made = { fn, clues: readsClues.yes };
    kept.terms.set(key, made);
  }
  return {
    fn: made.fn,
    arg: a === undefined ? "0" : (scope.get(a) as Val).code,
    clues: made.clues,
  };
}

/**
 * `forall R = through(x, O): P` (or `exists`), `O` a set whose groups are
 * kept (`keptEdgeSet`), and `P` reading `R` but no marks and nothing else
 * bound: a truth about the group, so it is made once a group, kept by the
 * group's list beside where `O` is bound and read by every square of it.
 * Galaxies' `finished(x, O)` was made once a square, and for each dot near
 * it. `null` for any other quantifier.
 */
function groupQuantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (env.hoist === null || e.binders.length !== 1) return null;
  const [bnd] = e.binders;
  if (bnd.kind !== "let" || bnd.where !== null) return null;
  const of = inlined(bnd.of, scope, env);
  if (
    of.k !== "call" ||
    of.fn !== "through" ||
    of.args.length !== 2 ||
    scope.has("through")
  )
    return null;
  const [, setArg] = of.args;
  if (setArg.k !== "name") return null;
  const O = scope.get(setArg.name);
  const kept = O?.edgeSet?.() ?? null;
  if (O?.at === undefined || kept === null) return null;
  const free = new Set<string>();
  freeNames(e.body, free, new Set([bnd.name]));
  if ([...free].some((n) => scope.has(n))) return null;
  if (readsMarks(e.body, env)) return null;
  const R = once(compileExpr(bnd.of, scope, env, out), out);
  const key = `memo ${e.q} ${bnd.name} ${JSON.stringify(e.body)}`;
  let memo = O.at.made.get(key);
  if (memo === undefined) {
    const m = Out.fresh("_memo");
    O.at.lines.push({
      indent: 0,
      text: `const ${m} = new Map<readonly number[], boolean>();`,
    });
    memo = { code: m, sort: BOOL };
    O.at.made.set(key, memo);
  }
  const v = Out.fresh("_gq");
  out.emit(`let ${v} = ${memo.code}.get(${R.code});`);
  out.open(`if (${v} === undefined) {`);
  const inner = new Map(scope);
  inner.set(bnd.name, { code: R.code, sort: R.sort });
  // The quantifier read with its one binding made: its body, as it is.
  const body = quantifierOver(e, inner, env, out);
  out.emit(`${v} = ${body};`);
  out.emit(`${memo.code}.set(${R.code}, ${v});`);
  out.close();
  return { code: v, sort: BOOL };
}

/**
 * `set(t over x in through(c, O) …)`, `O` a set of edges a binder or a
 * parameter names, and the rest reading no marks and no name bound after
 * `O`: a set made of the group, so it is made once a group, kept by the
 * group's list beside where `O` is bound. Net's `run` made the dead ends
 * round a reach's group once from each side of the square it walked from,
 * and those walks mostly meet one group. `null` for any other aggregate.
 */
function groupSet(
  e: Extract<Expr, { k: "agg" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (env.hoist === null || e.fn !== "set" || e.where !== null) return null;
  const [first, ...rest] = e.binders;
  if (first?.kind !== "in") return null;
  const of = first.of;
  if (
    of.k !== "call" ||
    of.fn !== "through" ||
    of.args.length !== 2 ||
    scope.has("through")
  )
    return null;
  const [, setArg] = of.args;
  if (setArg.k !== "name") return null;
  const O = scope.get(setArg.name);
  if (O?.at === undefined || !isSetOf(O.sort, "edge")) return null;
  const Oat = O.at;
  // The set with its group a name of its own, which nothing else binds.
  const group = Out.fresh("_grp");
  const over: Extract<Expr, { k: "agg" }> = {
    ...e,
    binders: [{ ...first, of: { k: "name", name: group } }, ...rest],
  };
  // What the set reads past its group: names bound no later than `O`, so the
  // group's set stands for as long as `O` does.
  const free = new Set<string>();
  freeNames(over, free, new Set([group]));
  for (const n of free) {
    const v = scope.get(n);
    if (v !== undefined && (v.at === undefined || v.at.seq > Oat.seq)) return null;
  }
  if (readsMarks(over, env)) return null;
  const R = once(compileExpr(first.of, scope, env, out), out);
  const key = `memo set ${JSON.stringify(e)}`;
  const kept = Oat.made.get(key);
  const m = kept?.code ?? Out.fresh("_memo");
  const v = Out.fresh("_gs");
  out.emit(`let ${v} = ${m}.get(${R.code});`);
  out.open(`if (${v} === undefined) {`);
  const inner = new Map(scope);
  inner.set(group, { code: R.code, sort: R.sort });
  const made = compileNode(over, inner, env, out);
  // A set of elements is the site's array, which its next making empties:
  // the memo keeps a copy.
  out.emit(`${v} = ${made.code}${isArray(made.sort) ? ".slice()" : ""};`);
  out.emit(`${m}.set(${R.code}, ${v});`);
  out.close();
  if (kept === undefined) {
    Oat.lines.push({
      indent: 0,
      text: `const ${m} = new Map<readonly number[], ${tsType(made.sort)}>();`,
    });
    Oat.made.set(key, { code: m, sort: made.sort });
  }
  return { code: v, sort: made.sort };
}

/** A quantifier whose one binding is in `scope` already: its body. */
function quantifierOver(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): string {
  const v = compileExpr(e.body, scope, env, out);
  expect(v, "bool", e.q);
  return v.code;
}

function quantifier(
  e: Extract<Expr, { k: "quant" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  const linked = linkedAggregate(e.q, e.binders, null, e.body, scope, env);
  if (linked !== null) return linked;
  const ofGroup = groupQuantifier(e, scope, env, out);
  if (ofGroup !== null) return ofGroup;
  const forall = e.q === "forall";
  const masked =
    setQuantifier(e, scope, env, out) ?? rectQuantifier(e, scope, env, out);
  if (masked !== null) return masked;
  const projected = projection(e, scope, env, out);
  if (projected !== null) return projected;
  const fitted = runFill(e, scope, env, out);
  if (fitted !== null) return fitted;
  const r = Out.fresh("_q");
  const label = Out.fresh("Q");
  out.emit(`let ${r} = ${forall};`);
  out.open(`${label}: {`);
  bindingLoops(e.binders, scope, env, out, (sc) => {
    const v = compileExpr(e.body, sc, env, out);
    expect(v, "bool", e.q);
    out.open(`if (${forall ? `!(${v.code})` : v.code}) {`);
    out.emit(`${r} = ${!forall};`);
    out.emit(`break ${label};`);
    out.close();
  });
  out.close();
  return { code: r, sort: BOOL };
}

/**
 * Where an aggregate's one binder counts a range and its term is that
 * binder plus or minus what does not read it, so that a `min` or a `max` is
 * the first number that passes counted from one end: 1 where the term rises
 * with the binder, -1 where it falls; 0 where it is not of that shape.
 */
function countedSlope(e: Extract<Expr, { k: "agg" }>): number {
  if (e.binders.length !== 1) return 0;
  const [b] = e.binders;
  if (b.kind !== "in" || b.of.k !== "call" || b.of.fn !== "range") return 0;
  if (e.term === null) return 1;
  // How the term moves with the binder: null where it is not a sum of the
  // binder once and what does not read it.
  const slope = (x: Expr): number | null => {
    if (x.k === "name" && x.name === b.name) return 1;
    const reads = new Set<string>();
    freeNames(x, reads, new Set());
    if (!reads.has(b.name)) return 0;
    if (x.k !== "bin" || (x.op !== "+" && x.op !== "-")) return null;
    const l = slope(x.a);
    const r = slope(x.b);
    if (l === null || r === null) return null;
    return x.op === "+" ? l + r : l - r;
  };
  const s = slope(e.term);
  return s === 1 || s === -1 ? s : 0;
}

function aggregate(
  e: Extract<Expr, { k: "agg" }>,
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (e.fn === "sum" || e.fn === "count") {
    const linked = linkedAggregate(e.fn, e.binders, e.where, e.term, scope, env);
    if (linked !== null) return linked;
  }
  const ofGroup = groupSet(e, scope, env, out);
  if (ofGroup !== null) return ofGroup;
  const r = Out.fresh("_g");
  const label = Out.fresh("G");
  const last = e.binders[e.binders.length - 1];
  const term = (sc: Scope): Val =>
    e.term === null ? name(last.name, sc, env, out) : compileExpr(e.term, sc, env, out);
  let sort: Sort = NUM;
  const loops = (body: (sc: Scope) => void): void => {
    out.open(`${label}: {`);
    bindingLoops(e.binders, scope, env, out, body);
    out.close();
  };
  switch (e.fn) {
    case "count":
      out.emit(`let ${r} = 0;`);
      loops(() => out.emit(`${r}++;`));
      break;
    case "sum":
    case "prod":
      out.emit(`let ${r} = ${e.fn === "sum" ? 0 : 1};`);
      loops((sc) => {
        const t = term(sc);
        expect(t, "num", e.fn);
        out.emit(`${r} ${e.fn === "sum" ? "+=" : "*="} ${t.code};`);
      });
      break;
    case "min":
    case "max":
      // `-1` is none, below every value, so the first term always replaces it.
      out.emit(`let ${r} = -1;`);
      if (countedSlope(e) !== 0) {
        // Of the numbers a range counts, the first that passes from the end
        // the answer lies at is the answer: a position along a long line, or
        // Signpost's nearest number held, found without reading the rest.
        out.open(`${label}: {`);
        bindingLoops(
          e.binders,
          scope,
          env,
          out,
          (sc) => {
            const t = once(term(sc), out);
            expect(t, "num", e.fn);
            out.emit(`${r} = ${t.code};`);
            out.emit(`break ${label};`);
          },
          (e.fn === "max") === (countedSlope(e) === 1),
        );
        out.close();
        break;
      }
      loops((sc) => {
        const t = once(term(sc), out);
        expect(t, "num", e.fn);
        out.emit(
          `if (${r} === -1 || ${t.code} ${e.fn === "min" ? "<" : ">"} ${r}) ${r} = ${t.code};`,
        );
      });
      break;
    case "the": {
      const n = Out.fresh("_n");
      out.emit(`let ${r} = -1;`);
      out.emit(`let ${n} = 0;`);
      loops((sc) => {
        const t = term(sc);
        if (!scalar(t.sort)) throw new CompileError(`the(…) of ${show(t.sort)}`);
        sort = t.sort;
        out.open(`if (++${n} === 2) {`);
        out.emit(`${r} = -1;`);
        out.emit(`break ${label};`);
        out.close();
        out.emit(`${r} = ${t.code};`);
      });
      break;
    }
    case "distinct": {
      const seen = Out.fresh("_s");
      out.emit(`let ${r} = true;`);
      out.emit(`const ${seen}: number[] = [];`);
      loops((sc) => {
        const t = once(term(sc), out);
        if (!scalar(t.sort)) throw new CompileError(`distinct(…) of ${show(t.sort)}`);
        out.open(`if (${seen}.includes(${t.code})) {`);
        out.emit(`${r} = false;`);
        out.emit(`break ${label};`);
        out.close();
        out.emit(`${seen}.push(${t.code});`);
      });
      sort = BOOL;
      break;
    }
    case "set": {
      // A comprehension over one set's members gives each once already.
      const plain =
        e.binders.length === 1 &&
        e.binders[0].kind === "in" &&
        e.term?.k === "name" &&
        e.term.name === e.binders[0].name;
      // The term's sort decides the result's representation, so it is read
      // off a pass whose code is thrown away before the result is declared.
      let termSort: Sort = NUM;
      const probe: Env = {
        ...env,
        used: new Set(),
        scratch: null,
        hoist: null,
        boardRoot: null,
      };
      bindingLoops(e.binders, scope, probe, new Out(0), (sc) => {
        termSort =
          e.term === null
            ? name(last.name, sc, probe, new Out(0)).sort
            : compileExpr(e.term, sc, probe, new Out(0)).sort;
      });
      if (!scalar(termSort) || termSort.k === "none")
        throw new CompileError(`set(…) of ${show(termSort)}`);
      sort = setOf(termSort);
      if (isMask(sort) && env.wide) throw new CompileError(MASK_IN_WIDE);
      // A member already kept is told by the site's marks, not a scan of
      // what it has kept, which grows quadratic over a reach across the
      // board (Net's `run`).
      const marks =
        !plain && !isMask(sort) && env.scratch !== null ? heldName("_st", env) : null;
      if (isMask(sort)) {
        out.emit(`let ${r} = 0;`);
        if (memberUnion(e, r, scope, env, out)) break;
      } else if (env.scratch !== null) {
        // One array a site, emptied each time the site is evaluated: its
        // value is read only until the site is evaluated again, and a
        // reason copies what it keeps.
        env.scratch.push(`const ${r}: number[] = [];`);
        out.emit(`${r}.length = 0;`);
        if (marks !== null) {
          // A rung's stamps outlive its run: the pass only grows, so a
          // stamp from an earlier run never matches.
          if (env.held !== undefined) env.held.push(`const ${marks} = stamps();`);
          else env.scratch.push(`const ${marks} = stamps();`);
          env.used.add("stamps");
          env.used.add("addOnce");
          out.emit(`${marks}.pass++;`);
        }
      } else out.emit(`const ${r}: number[] = [];`);
      loops((sc) => {
        const t = once(term(sc), out);
        if (t.sort.k === "num") out.emit(`${r} |= 1 << ${t.code};`);
        else if (plain) out.emit(`${r}.push(${t.code});`);
        else if (marks !== null) {
          // A short set is scanned in place, which a call to stamp costs
          // more than: Palisade's deals took 1.13 of the time stamping every
          // member (2026-11-09).
          const v = Out.fresh("_t");
          out.emit(`const ${v} = ${t.code};`);
          out.emit(
            `if (${r}.length < ${SCANNED_SET}) { if (!${r}.includes(${v})) ${r}.push(${v}); } else addOnce(${r}, ${marks}, ${v});`,
          );
        } else out.emit(`if (!${r}.includes(${t.code})) ${r}.push(${t.code});`);
      });
      break;
    }
  }
  return { code: r, sort };
}

/**
 * Whether `e` reads the marks only through `value` and `known`, which change
 * only as a value is placed, and makes no fact: so it holds while
 * `b.placed` stands. Its free names, those no binder of its own binds, are
 * added to `free`.
 */
function keptWhilePlaced(
  e: Expr,
  env: Env,
  free: Set<string>,
  own: ReadonlySet<string> = new Set(),
): boolean {
  const all = (xs: readonly (Expr | null)[], names = own): boolean =>
    xs.every((x) => x === null || keptWhilePlaced(x, env, free, names));
  const binders = (bs: readonly Binder[], rest: readonly (Expr | null)[]): boolean => {
    const names = new Set(own);
    for (const b of bs) {
      if (b.kind === "fill" || !all([b.of], names)) return false;
      names.add(b.name);
      if (!all([b.where], names)) return false;
    }
    return all(rest, names);
  };
  switch (e.k) {
    case "num":
      return true;
    case "name":
      if (!own.has(e.name)) free.add(e.name);
      return true;
    case "set":
      return all(e.elems);
    case "size":
    case "not":
    case "neg":
      return all([e.of]);
    case "bin":
      return all([e.a, e.b]);
    case "quant":
      return binders(e.binders, [e.body]);
    case "agg":
      return binders(e.binders, [e.where, e.term]);
    case "with":
      return false;
    case "call": {
      if (
        e.fn === "cand" ||
        e.fn === "place" ||
        e.fn === "strike" ||
        e.fn === "linked" ||
        // A strike from an edge's mark and a relation count as no
        // placement, as a cell's mark does.
        (e.fn !== "mark" && e.fn !== env.cellMark?.name && isMarkRead(e.fn, env))
      )
        return false;
      if (!all(valueArgs(e))) return false;
      const def = env.defs.get(e.fn);
      return (
        def === undefined ||
        keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
      );
    }
  }
}

/**
 * `set(t over x in T, …)` of numbers, `T` each subset of an array: the union
 * of each member's own set, which the rest of the comprehension makes from
 * the member alone. Each member's is kept ahead of the loop over the
 * subsets, made again once a value has been placed since, so a subset's is
 * an OR of its members'. The union goes into `r`; false where `e` is not of
 * that shape, and nothing is written.
 */
function memberUnion(
  e: Extract<Expr, { k: "agg" }>,
  r: string,
  scope: Scope,
  env: Env,
  out: Out,
): boolean {
  const [first, ...rest] = e.binders;
  if (
    env.hoist === null ||
    env.answer !== null ||
    env.supposed.length > 0 ||
    e.where !== null ||
    first.kind !== "in" ||
    first.of.k !== "name"
  )
    return false;
  const T = scope.get(first.of.name);
  const of = T?.sort;
  if (T?.members === undefined || of?.k !== "set") return false;
  const { els, k, pre } = T.members;
  const each: Extract<Expr, { k: "agg" }> = { ...e, binders: rest };
  const free = new Set<string>();
  const parts: (Expr | null)[] = [first.where, rest.length > 0 ? each : e.term];
  if (
    !parts.every(
      (p) => p === null || keptWhilePlaced(p, env, free, new Set([first.name])),
    )
  )
    return false;
  for (const n of free) {
    const v = scope.get(n);
    if (v !== undefined && (v.at === undefined || v.at.seq > pre.seq)) return false;
  }
  const kept = Out.fresh("_pm");
  const at = Out.fresh("_pp");
  pre.lines.push({ indent: 0, text: `const ${kept}: number[] = [];` });
  pre.lines.push({ indent: 0, text: `let ${at} = -1;` });
  const j = Out.fresh("_j");
  const x = Out.fresh("v_m");
  out.open(`if (${at} !== b.placed) {`);
  out.emit(`${at} = b.placed;`);
  out.open(`for (let ${j} = 0; ${j} < ${els}.length; ${j}++) {`);
  out.emit(`const ${x} = ${els}[${j}];`);
  const inner = new Map(scope).set(first.name, { code: x, sort: of.of });
  const flat: Env = { ...env, hoist: null };
  let mask: Val;
  if (rest.length > 0) mask = aggregate(each, inner, flat, out);
  else {
    const t = once(
      e.term === null
        ? name(first.name, inner, flat, out)
        : compileExpr(e.term, inner, flat, out),
      out,
    );
    expect(t, "num", "set");
    mask = { code: `(1 << ${t.code})`, sort: setOf(NUM) };
  }
  if (first.where !== null) {
    const w = compileExpr(first.where, inner, flat, out);
    expect(w, "bool", `where of ${first.name}`);
    out.emit(`${kept}[${j}] = ${w.code} ? ${mask.code} : 0;`);
  } else out.emit(`${kept}[${j}] = ${mask.code};`);
  out.close();
  out.close();
  out.emit(
    `for (let ${j} = 0; ${j} < ${els}.length; ${j}++) if ((${k} >> (${els}.length - 1 - ${j})) & 1) ${r} |= ${kept}[${j}];`,
  );
  return true;
}

/**
 * `latin(f, U)`: no value of `f` more often in a unit of `U` than `times`
 * allows it, which on a whole grid is each value exactly that often. A rule
 * of the answer, so read only by the answer check.
 */
function latin(args: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  const [f, units] = args;
  if (!env.answer) throw new CompileError("latin(f, U) is a rule of the answer");
  if (args.length !== 2 || f.k !== "name")
    throw new CompileError("latin(f, U) names an answer function and a set of units");
  const U = compileExpr(units, scope, env, out);
  if (U.sort.k !== "set" || U.sort.of.k !== "elem")
    throw new CompileError(`latin over ${show(U.sort)}`);
  const r = Out.fresh("_q");
  const label = Out.fresh("Q");
  const u = Out.fresh("_u");
  const c = Out.fresh("_c");
  const seen = Out.fresh("_n");
  out.emit(`let ${r} = true;`);
  // A value is a bit of a 32-bit mask, so fewer than 32.
  out.emit(`const ${seen} = new Int32Array(32);`);
  out.open(`${label}: for (const ${u} of ${U.code}) {`);
  out.emit(`${seen}.fill(0);`);
  const cells = call(
    "cells",
    [{ k: "name", name: "$u" }],
    new Map([...scope, ["$u", { code: u, sort: U.sort.of }]]),
    env,
    out,
  );
  out.open(`for (const ${c} of ${cells.code}) {`);
  const v = once(
    call(
      f.name,
      [{ k: "name", name: "$c" }],
      new Map([["$c", { code: c, sort: elem("cell") }]]),
      env,
      out,
    ),
    out,
  );
  expect(v, "num", "latin");
  out.open(`if (++${seen}[${v.code}] > ${timesOf(v.code, env)}) {`);
  out.emit(`${r} = false;`);
  out.emit(`break ${label};`);
  out.close();
  out.close();
  out.close();
  return { code: r, sort: BOOL };
}

/** `times(d)` in the answer check: the description's count for its repeated
 * value, 1 for every other. */
const timesOf = (d: string, env: Env): string =>
  env.answer === null
    ? `(${d} === b.repeat ? b.times : 1)`
    : env.answer.repeats
      ? `(${d} === _repeat ? _times : 1)`
      : "1";

/** Layer `fn`'s value at place `at`: exact where its domain is not finite,
 * which a layer holds as a safe integer (`held`). */
function layerRead(fn: string, layer: LayerSort, at: string, env: Env): Val {
  if (layer.carried && env.carrying !== fn)
    throw new CompileError(
      `${fn} is carried: no rule reads it, but its own assignment`,
    );
  const code = `p.${fn}[${at}]`;
  return { code, sort: layer.open ? INT : NUM };
}

/** `at(k)`, `v(k)` or `per(k)` of a clue `k`: a clue per value sits at its
 * element and the value both. */
function clueField(fn: string, k: Val, env: Env): Val {
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
function rectCall(fn: string, vs: readonly Val[], env: Env): Val | null {
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
function diagonalCall(fn: string, vs: readonly Val[], env: Env): Val | null {
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
function centerCall(fn: string, vs: readonly Val[], env: Env, out: Out): Val | null {
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
function tilingCall(fn: string, vs: readonly Val[], env: Env): Val | null {
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
function relationCall(fn: string, vs: readonly Val[], env: Env, out: Out): Val | null {
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
function edgeStrike(fn: string, vs: readonly Val[], env: Env, out: Out): Val {
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

/**
 * `through(c, {e in edges where P})`, its set stated in place rather than
 * bound: a walk from `c` that asks `P` of each edge it meets
 * (`throughWhere`), never the set of every edge. `null` for any other
 * `through`.
 */
function throughStated(
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  const set = inlined(args[1], scope, env);
  if (set.k !== "agg" || set.fn !== "set" || set.where !== null) return null;
  const [bnd, ...more] = set.binders;
  if (bnd === undefined || more.length > 0 || bnd.kind !== "in") return null;
  if (bnd.of.k !== "name" || bnd.of.name !== "edges" || scope.has("edges")) return null;
  if (set.term?.k !== "name" || set.term.name !== bnd.name) return null;
  const c = compileExpr(args[0], scope, env, out);
  expectElem(c, "cell", "through");
  const e = Out.fresh("_te");
  const inner = new Map(scope);
  inner.set(bnd.name, { code: e, sort: elem("edge") });
  const body = new Out(0);
  // Asked once an edge met, so nothing in it is moved out of the walk.
  const test =
    bnd.where === null
      ? { code: "true", sort: BOOL }
      : compileExpr(bnd.where, inner, { ...env, hoist: null }, body);
  expect(test, "bool", "through's set");
  const lines = body.text().join(" ");
  env.used.add("throughWhere");
  return {
    code: `throughWhere(sp, ${c.code}, (${e}: number): boolean => { ${lines} return ${test.code}; })`,
    sort: setOf(elem("cell")),
  };
}

/** The code of `edge(a, b)`, where `va` and `vb` are the terms whose code
 * is `a` and `b`. A neighbor bound by the loop over the other's `adj4` or
 * `adj8` names its edge by the loop's counter. */
function edgeBetween(a: string, b: string, va: Val, vb: Val): string {
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
function matchedCall(vs: readonly Val[], env: Env): Val {
  for (const S of vs)
    if (!isSetOf(S.sort, "cell"))
      throw new CompileError(`matched(${show(S.sort)}): A and B are sets of cells`);
  env.used.add("matched");
  return { code: `matched(sp, ${vs[0].code}, ${vs[1].code})`, sort: BOOL };
}

/** A sightline bent by the mirrors a clue kind deals, and what it reads:
 * the field of the runtime's `SightSets` each function is. */
const SIGHT_BENT: ReadonlyMap<string, string> = new Map([
  ["sight", "all"],
  ["sight_direct", "direct"],
  ["sight_bent", "bent"],
  ["sight_twice", "twice"],
  ["sight_exit", "exit"],
]);

/** `sight(s, M)` and its kin: the sightline from slot `s`, turned by the
 * mirrors clue kind `M` deals, 1 `\` and 2 `/`. */
function bentSight(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (args.length !== 2) throw new CompileError(`${fn}(s, mirrors) takes 2`);
  const m = args[1];
  if (m.k !== "name" || !env.clues.has(m.name))
    throw new CompileError(
      `${fn}(s, M): M names a clue kind of the description${m.k === "name" ? `, and ${m.name} is none` : ""}`,
    );
  const kind = env.clues.get(m.name) as ClueKind;
  if (!sameSort(kind.at, elem("cell")) || kind.per)
    throw new CompileError(`${fn}(s, ${m.name}): the mirrors sit one a cell`);
  const refused = noGeometry("slots", env);
  if (refused !== null) throw new CompileError(refused);
  const s = compileExpr(args[0], scope, env, out);
  expectElem(s, "slot", fn);
  env.readsClues.yes = true;
  env.used.add("sights");
  const field = SIGHT_BENT.get(fn) as string;
  return {
    code: `sights(sp, cl.${m.name})[${s.code}].${field}`,
    sort: field === "exit" ? elem("slot") : setOf(elem("cell")),
  };
}

/** A call with a form of its own, `latin(…)` or a bent sightline, or null. */
function ownForm(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val | null {
  if (fn === "latin") return latin(args, scope, env, out);
  if (isBentSight(fn, args)) return bentSight(fn, args, scope, env, out);
  return null;
}

/** `clue(kind, x)`, or `clue(kind, x, d)` of a clue per value: the clue of
 * that kind at `x`. */
function clueCall(args: readonly Expr[], scope: Scope, env: Env, out: Out): Val {
  const a = args[0];
  if (a.k !== "name" || !env.clues.has(a.name))
    throw new CompileError(
      `clue(kind, x) names a clue kind of the description${a.k === "name" ? `, and ${a.name} is none` : ""}`,
    );
  const kind = env.clues.get(a.name) as ClueKind;
  if (kind.fields)
    throw new CompileError(`clue(${a.name}, x): a clue at the board sits at nothing`);
  if (args.length !== (kind.per ? 3 : 2))
    throw new CompileError(
      kind.per ? `clue(${a.name}, x, d): one a value` : `clue(${a.name}, x)`,
    );
  const x = compileExpr(args[1], scope, env, out);
  if (!sameSort(x.sort, kind.at))
    throw new CompileError(`clue(${a.name}, ${show(x.sort)})`);
  env.readsClues.yes = true;
  if (kind.list) {
    env.used.add("listAt");
    return { code: `listAt(cl.${a.name}, ${x.code})`, sort: kind.v };
  }
  env.used.add("clueAt");
  if (!kind.per) return { code: `clueAt(cl.${a.name}, ${x.code})`, sort: kind.v };
  const d = compileExpr(args[2], scope, env, out);
  expect(d, "num", "clue");
  env.used.add("perPlace");
  const place = `(${x.code} < 0 ? -1 : perPlace(${x.code}, ${d.code}))`;
  return { code: `clueAt(cl.${a.name}, ${place})`, sort: kind.v };
}

/**
 * Every slot of a technique's stated clauses names what the technique states:
 * a number term or a lexicon word said plainly, a role it marks or a term of
 * elements as a reference. A fact's clauses read the firing's terms and the
 * fact's own.
 */
function checkStated(
  id: string,
  says: Says,
  variants: readonly { sorts: ReadonlyMap<string, Sort> }[],
  factSorts: ReadonlyMap<string, Sort> | null,
): void {
  const isNum = (s?: Sort): boolean => s?.k === "num" || s?.k === "int";
  const isElems = (s?: Sort): boolean =>
    s !== undefined && (s.k === "elem" || (s.k === "set" && s.of.k === "elem"));
  const check = (
    where: string,
    clauses: StatedClauses,
    sorts: ReadonlyMap<string, Sort>,
    roles: ReadonlySet<string>,
  ): void => {
    for (const [part, src] of Object.entries(clauses) as [string, string][]) {
      let slots: ClauseSlot[];
      try {
        slots = slotsOf(src);
      } catch (e) {
        throw new CompileError(`${id}: says ${where}${part}: ${(e as Error).message}`);
      }
      const plain = (name: string, inner: boolean): void => {
        if (STATED_WORDS.has(name) || isNum(sorts.get(name))) return;
        if (inner && STATED_INNER_WORDS.has(name)) return;
        throw new CompileError(
          `${id}: says ${where}${part} says {${name}}, which is no number term and no word of the lexicon`,
        );
      };
      for (const s of slots) {
        if (s.role === null) plain(s.name as string, false);
        else if (s.name === null) {
          if (s.role !== "ring" && !roles.has(s.role))
            throw new CompileError(
              `${id}: says ${where}${part} names {${s.role}}, which it marks nothing in`,
            );
        } else if (!isElems(sorts.get(s.name)))
          throw new CompileError(
            `${id}: says ${where}${part} names {${s.role} ${s.name}}, and ${s.name} is no term of elements`,
          );
        for (const n of s.inner) plain(n, true);
      }
    }
  };
  const wording = (words: readonly Wording[], i: number): string =>
    words.length > 1 ? `wording ${i} ` : "";
  for (const [i, v] of says.variants.entries())
    for (const [j, w] of v.words.entries())
      check(
        `${v.name === null ? "" : `${v.name} `}${wording(v.words, j)}`,
        w.clauses,
        variants[i].sorts,
        new Set(v.marks.map((m) => m.role)),
      );
  if (says.fact !== null && factSorts !== null) {
    const sorts = new Map([...variants.flatMap((v) => [...v.sorts]), ...factSorts]);
    const roles = new Set([
      ...says.variants.flatMap((v) => v.marks.map((m) => m.role)),
      ...says.fact.marks.map((m) => m.role),
    ]);
    for (const [j, w] of says.fact.words.entries())
      check(`fact ${wording(says.fact.words, j)}`, w.clauses, sorts, roles);
  }
}

/** The module's `STATED`: each kind of step's clauses as the description
 * states them, by wording, and each fact's, for `engine/stated.ts` to render.
 * A firing's `wording`, and a fact's, is the index of the one that held; it is
 * absent where there is one. Empty where nothing states a clause. */
function statedTable(own: readonly Technique[]): string[] {
  const rows: string[] = [];
  for (const t of own) {
    if (t.says === null) continue;
    const fact =
      t.says.fact === null || t.says.fact.words.length === 0
        ? null
        : t.says.fact.words.map((w) => w.clauses);
    for (const v of t.says.variants) {
      if (v.words.length === 0 && fact === null) continue;
      const kind = v.name === null ? t.id : `${t.id}.${v.name}`;
      const entry = {
        ...(v.words.length === 0 ? {} : { step: v.words.map((w) => w.clauses) }),
        ...(fact === null ? {} : { fact }),
      };
      rows.push(`  ${JSON.stringify(kind)}: ${JSON.stringify(entry)},`);
    }
  }
  if (rows.length === 0) return [];
  return [
    "/** Each kind of step's words as the description states them, and each",
    " * fact's, by wording (`engine/stated.ts`). */",
    "export const STATED = {",
    ...rows,
    "} as const;",
    "",
  ];
}

/** The index of the first of `words` whose `when` holds, as code; the last
 * has none and holds always. */
function wordingIndex(
  words: readonly Wording[],
  label: string,
  compiled: (e: Expr) => Val,
): string {
  const holds = words.slice(0, -1).map((w, i) => {
    const v = compiled(w.when as Expr);
    expect(v, "bool", `${label} wording ${i} when`);
    return `${v.code} ? ${i} : `;
  });
  return `(${holds.join("")}${words.length - 1})`;
}

/**
 * A `place` or `strike` whose technique `says` something of each fact: on a
 * hint's path it reads what the fact has of its own where the fact is made,
 * in the conclusion's scope (the `forall` binders, and any `with` it writes),
 * and records it beside the fact, in step with `facts`.
 */
function factWithSays(
  fn: "strike" | "place",
  c: string,
  d: string,
  site: NonNullable<Env["factSays"]>,
  scope: Scope,
  env: Env,
  out: Out,
): void {
  const cond = fn === "strike" ? hasRead(c, d, env) : `!${marksRead("known", c)}`;
  out.open(`if (${cond}) {`);
  out.emit(`if (fire === null) { b.${fn}At(${c}, ${d}); changed = true; }`);
  out.open("if (fire !== null) {");
  const inner: Env = {
    ...env,
    concluding: false,
    shared: { made: new Map() },
    recheck: undefined,
  };
  const fields = { terms: [] as string[], marks: [] as string[] };
  const read = (e: Expr, group: "terms" | "marks", name: string): string => {
    const r = compileExpr(e, scope, inner, out);
    if (group === "marks" && !isArray(r.sort))
      throw new CompileError(`says fact marks ${name} is not a set of elements`);
    fields[group].push(`${name}: ${tsType(r.sort)};`);
    if (group === "terms") site.sorts.set(name, r.sort);
    return `${name}: ${isArray(r.sort) ? `${r.code}.slice()` : r.code}`;
  };
  const terms = site.says.terms.map((x) => read(x.expr, "terms", x.name));
  const marks = site.says.marks.map((x) => read(x.expr, "marks", x.role));
  site.fields.terms = fields.terms;
  site.fields.marks = fields.marks;
  // The wording that holds for this square, read where the fact is made.
  const wording =
    site.says.words.length > 1
      ? `wording: ${wordingIndex(site.says.words, "says fact", (e) => compileExpr(e, scope, inner, out))}, `
      : "";
  out.emit(`facts.push(${fn === "strike" ? "STRIKE" : "PLACE"}, ${c}, ${d});`);
  out.emit(
    `${site.buffer}.push({ ${wording}terms: { ${terms.join(", ")} }, marks: { ${marks.join(", ")} } });`,
  );
  out.close();
  out.close();
  env.used.add(fn === "strike" ? "STRIKE" : "PLACE");
}

function call(
  fn: string,
  args: readonly Expr[],
  scope: Scope,
  env: Env,
  out: Out,
): Val {
  if (fn === "clues")
    throw new CompileError("clues(kind) is read only as a binder's set");
  const own = ownForm(fn, args, scope, env, out);
  if (own !== null) return own;
  const layer = env.position?.get(fn);
  if (layer !== undefined) {
    // A layer of the position, read at a cell, or at a face.
    if (layer.over === "board")
      throw new CompileError(`${fn} is the board's one value, read by its name`);
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, layer.over, fn);
    return layerRead(fn, layer, c.code, env);
  }
  const table = env.tables.get(fn);
  if (table !== undefined) {
    if (args.length !== table.of.length)
      throw new CompileError(`${fn} takes ${table.of.length}, given ${args.length}`);
    env.readsClues.yes = true;
    let code = `cl.${fn}`;
    args.forEach((a, i) => {
      const v = compileExpr(a, scope, env, out);
      const want = table.of[i];
      if (want.k === "num") expect(v, "num", fn);
      else if (want.k === "elem") expectElem(v, want.e, fn);
      code += `[${v.code}]`;
    });
    return { code, sort: table.to };
  }
  const refused = noGeometry(fn, env);
  if (refused !== null) throw new CompileError(refused);
  if (!env.tiling && TILING_ONLY.has(fn))
    throw new CompileError(`${fn}: only a tiling has angles`);
  if (env.position !== null && (fn === "value" || fn === "known" || fn === "cand"))
    throw new CompileError(`${fn}: a position is read by its layers`);
  if (fn === "clue") return clueCall(args, scope, env, out);
  const field = fieldOf(fn, env);
  if (field !== null) {
    // A clue at the board's field, read of the clue, and of an element
    // where it is one an element.
    const want = field.at === null ? 1 : 2;
    if (args.length !== want)
      throw new CompileError(`${fn} takes ${want}, given ${args.length}`);
    const k = compileExpr(args[0], scope, env, out);
    expectElem(k, `clue ${field.kind}`, fn);
    env.readsClues.yes = true;
    let code = `cl.${field.kind}.${fn}[${k.code}]`;
    if (field.at !== null) {
      const x = compileExpr(args[1], scope, env, out);
      expectElem(x, field.at, fn);
      code += `[${x.code}]`;
    }
    return { code, sort: field.v };
  }
  if (partOf(fn, env)) {
    // A partition named as a function: the part holding a cell.
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, "cell", fn);
    if (fn === env.boxes) return { code: `sp.boxOf[${c.code}]`, sort: elem("line") };
    env.readsClues.yes = true;
    return { code: `cl.${fn}.of[${c.code}]`, sort: elem(`region ${fn}`) };
  }
  if (env.relations.has(fn)) {
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const c = compileExpr(args[0], scope, env, out);
    expectElem(c, "cell", fn);
    env.readsClues.yes = true;
    return { code: `cl.${fn}[${c.code}]`, sort: setOf(elem("cell")) };
  }
  const filling = scope.get(fn);
  if (filling?.sort.k === "fill") {
    if (args.length !== 1)
      throw new CompileError(`${fn} takes 1, given ${args.length}`);
    const x = compileExpr(args[0], scope, env, out);
    expectElem(x, env.answerSort, fn);
    return { code: `${filling.code}[${x.code}]`, sort: NUM };
  }
  if (fn === "through" && args.length === 2) {
    const walked = throughStated(args, scope, env, out);
    if (walked !== null) return walked;
  }
  const vs = args.map((x) => compileExpr(x, scope, env, out));
  const arity = (n: number): void => {
    if (vs.length !== n) throw new CompileError(`${fn} takes ${n}, given ${vs.length}`);
  };
  const cell = (i: number): string => {
    expectElem(vs[i], "cell", fn);
    return vs[i].code;
  };
  const shaped =
    tilingCall(fn, vs, env) ??
    relationCall(fn, vs, env, out) ??
    diagonalCall(fn, vs, env) ??
    rectCall(fn, vs, env) ??
    centerCall(fn, vs, env, out);
  if (shaped !== null) return shaped;
  switch (fn) {
    case "cells": {
      arity(1);
      const s = vs[0].sort;
      if (s.k === "elem" && s.e.startsWith("region ")) {
        env.readsClues.yes = true;
        return {
          code: `cl.${s.e.slice("region ".length)}.cells[${vs[0].code}]`,
          sort: setOf(elem("cell")),
        };
      }
      if (s.k === "elem" && s.e === "corner")
        return { code: `sp.cornerCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
      expectElem(vs[0], "line", fn);
      return { code: `sp.lineCells[${vs[0].code}]`, sort: setOf(elem("cell")) };
    }
    case "row":
    case "col":
      arity(1);
      return { code: `sp.${fn}Of[${cell(0)}]`, sort: elem("line") };
    case "peers":
    case "adj4":
    case "adj8":
      arity(1);
      return { code: `sp.${fn}[${cell(0)}]`, sort: setOf(elem("cell")) };
    case "ray":
      arity(2);
      env.used.add("ray");
      return { code: `ray(sp, ${cell(0)}, ${cell(1)})`, sort: setOf(elem("cell")) };
    case "step":
      arity(2);
      expect(vs[1], "num", fn);
      env.used.add("step");
      return { code: `step(sp, ${cell(0)}, ${vs[1].code})`, sort: elem("cell") };
    case "compass":
      arity(3);
      expect(vs[1], "num", fn);
      expect(vs[2], "num", fn);
      env.used.add("compass");
      return {
        code: `compass(sp, ${cell(0)}, ${vs[1].code}, ${vs[2].code})`,
        sort: elem("cell"),
      };
    case "to":
      arity(1);
      return {
        code: `(${namedBy(Out.fresh("_x"), env)})(${cell(0)})`,
        sort: elem("cell"),
      };
    case "chain": {
      arity(1);
      env.used.add("chain");
      return {
        code: `chain(sp, ${namedBy(Out.fresh("_x"), env)}, ${cell(0)})`,
        sort: setOf(elem("cell")),
      };
    }
    case "last": {
      arity(1);
      const kept = chainsKept(env);
      env.used.add(kept ? "chainEnd" : "lastOf");
      const next = namedBy(Out.fresh("_x"), env);
      return {
        code: kept
          ? `chainEnd(sp, b, ${next}, ${cell(0)})`
          : `lastOf(${next}, ${cell(0)})`,
        sort: elem("cell"),
      };
    }
    case "beam": {
      if (vs.length !== 1 && vs.length !== 3)
        throw new CompileError(`beam takes 1 or 3, given ${vs.length}`);
      expectElem(vs[0], "slot", fn);
      if (env.supposed.length > 0)
        throw new CompileError("a beam is not read under with");
      if (env.answer) {
        if (vs.length === 3) throw new CompileError("a rule reads beam(s) alone");
        env.used.add("beamOf");
        return { code: `beamOf(sp, g, ${vs[0].code})`, sort: NUM };
      }
      env.used.add("beam");
      if (vs.length === 1) return { code: `beam(sp, b, ${vs[0].code})`, sort: NUM };
      expect(vs[2], "num", fn);
      return {
        code: `beam(sp, b, ${vs[0].code}, ${cell(1)}, ${vs[2].code})`,
        sort: NUM,
      };
    }
    case "ahead":
      arity(1);
      expectElem(vs[0], "slot", fn);
      if (env.answer)
        throw new CompileError("a rule reads the answer, never the marks");
      if (env.supposed.length > 0)
        throw new CompileError("a beam is not read under with");
      env.used.add("ahead");
      return { code: `ahead(sp, b, ${vs[0].code})`, sort: elem("cell") };
    case "within":
      arity(2);
      expect(vs[1], "num", fn);
      env.used.add("within");
      return {
        code: `within(sp, ${cell(0)}, ${vs[1].code})`,
        sort: setOf(elem("cell")),
      };
    case "on_grid": {
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      const x = once(vs[0], out);
      const y = once(vs[1], out);
      return {
        code: `(${x.code} >= 0 && ${x.code} < sp.w && ${y.code} >= 0 && ${y.code} < sp.h)`,
        sort: BOOL,
      };
    }
    case "units_of":
      arity(1);
      return { code: `sp.unitsOf[${cell(0)}]`, sort: setOf(elem("line")) };
    case "sight":
      arity(1);
      expectElem(vs[0], "slot", fn);
      return { code: `sp.sight[${vs[0].code}]`, sort: setOf(elem("cell")) };
    case "opposite":
      arity(1);
      expectElem(vs[0], "slot", fn);
      return { code: `sp.opposite[${vs[0].code}]`, sort: elem("slot") };
    case "corners":
      arity(1);
      return { code: `sp.cellCorners[${cell(0)}]`, sort: setOf(elem("corner")) };
    case "across": {
      // A corner's diagonal pairs each sum to its first and last cells' sum.
      arity(2);
      expectElem(vs[0], "corner", fn);
      const k = once(vs[0], out);
      const cs = `sp.cornerCells[${k.code}]`;
      return { code: `(${cs}[0] + ${cs}[3] - ${cell(1)})`, sort: elem("cell") };
    }
    case "nth": {
      arity(2);
      const L = vs[0];
      expect(vs[1], "num", fn);
      if (L.sort.k === "list") {
        // A list's member, none past either end.
        env.used.add("nth");
        return { code: `nth(${L.code}, ${vs[1].code})`, sort: NUM };
      }
      if (!isArray(L.sort) || L.sort.k !== "set")
        throw new CompileError(`nth of ${show(L.sort)}: not an ordered set or a list`);
      return { code: `(${L.code}[${vs[1].code}] ?? -1)`, sort: L.sort.of };
    }
    case "stretch": {
      // The maximal run of S along L that holds c.
      arity(3);
      expectElem(vs[0], "line", fn);
      const S = vs[2];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`stretch(L, c, ${show(S.sort)}): S is a set of cells`);
      env.used.add("stretch");
      return {
        code: `stretch(sp.lineCells[${vs[0].code}], ${cell(1)}, ${S.code})`,
        sort: setOf(elem("cell")),
      };
    }
    case "run_lengths": {
      // The lengths of the maximal runs of S along L, in L's order.
      arity(2);
      expectElem(vs[0], "line", fn);
      const S = vs[1];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`run_lengths(L, ${show(S.sort)}): S is a set of cells`);
      env.used.add("runsOf");
      return {
        code: `runsOf(sp.lineCells[${vs[0].code}], ${S.code})`,
        sort: { k: "list" },
      };
    }
    case "connected":
    case "cuts": {
      // Whether the cells S are one group side by side, and the members
      // without which the rest are not.
      arity(1);
      const S = vs[0];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`${fn}(${show(S.sort)}): S is a set of cells`);
      env.used.add(fn);
      return {
        code: `${fn}(sp, ${S.code})`,
        sort: fn === "connected" ? BOOL : setOf(elem("cell")),
      };
    }
    case "cut_edges": {
      // The members of E whose two cells E joins only through them.
      arity(1);
      const E = vs[0];
      if (!isSetOf(E.sort, "edge"))
        throw new CompileError(`cut_edges(${show(E.sort)}): E is a set of edges`);
      env.used.add("cutEdges");
      return { code: `cutEdges(sp, ${E.code})`, sort: setOf(elem("edge")) };
    }
    case "matched":
      arity(2);
      return matchedCall(vs, env);
    case "reaches": {
      // How many members of S square c reaches through members side by
      // side once t is taken out.
      arity(3);
      const S = vs[1];
      if (!isSetOf(S.sort, "cell"))
        throw new CompileError(`reaches(c, ${show(S.sort)}, t): S is a set of cells`);
      env.used.add("reaches");
      return { code: `reaches(sp, ${cell(0)}, ${S.code}, ${cell(2)})`, sort: NUM };
    }
    case "index":
    case "before": {
      arity(2);
      const [x, L] = vs;
      if (!isArray(L.sort) || L.sort.k !== "set" || !sameSort(x.sort, L.sort.of))
        throw new CompileError(`${fn}(${show(x.sort)}, ${show(L.sort)})`);
      if (fn === "before") {
        env.used.add("before");
        return { code: `before(${x.code}, ${L.code})`, sort: L.sort };
      }
      // A name bound by a loop over the same array is at the loop's counter,
      // and the space numbers its own elements in the order it lists them.
      if (x.pos?.arr === L.code) return { code: x.pos.i, sort: NUM };
      if (
        L.code === "sp.cells" ||
        L.code === "sp.slots" ||
        L.code === "sp.lines" ||
        L.code === "sp.corners" ||
        L.code === "sp.points" ||
        L.code === "sp.edges" ||
        L.code.startsWith("facesOf(")
      )
        return { code: x.code, sort: NUM };
      return { code: `${L.code}.indexOf(${x.code})`, sort: NUM };
    }
    case "x":
      arity(1);
      return { code: `(${cell(0)} % sp.w)`, sort: NUM };
    case "y":
      arity(1);
      return { code: `((${cell(0)} / sp.w) | 0)`, sort: NUM };
    case "cell":
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      return { code: `(${vs[1].code} * sp.w + ${vs[0].code})`, sort: elem("cell") };
    case "edge":
      arity(2);
      return { code: edgeBetween(cell(0), cell(1), vs[0], vs[1]), sort: elem("edge") };
    case "crossedBy": {
      arity(1);
      expectElem(vs[0], "edge", fn);
      return { code: `sp.crossing[${vs[0].code}]`, sort: elem("edge") };
    }
    case "ends":
    case "end1":
    case "end2":
    case "other": {
      expectElem(vs[0], "edge", fn);
      const e = once(vs[0], out);
      const p = `sp.edgeEnds[2 * ${e.code}]`;
      const q = `sp.edgeEnds[2 * ${e.code} + 1]`;
      if (fn === "ends") {
        arity(1);
        return { code: `[${p}, ${q}]`, sort: setOf(elem("cell")) };
      }
      if (fn !== "other") {
        arity(1);
        return { code: fn === "end1" ? p : q, sort: elem("cell") };
      }
      arity(2);
      const c = once({ code: cell(1), sort: vs[1].sort }, out);
      return { code: `(${p} === ${c.code} ? ${q} : ${p})`, sort: elem("cell") };
    }
    case "known":
    case "value":
    case "cand":
      arity(1);
      expectElem(vs[0], env.answerSort, fn);
      return markRead(fn, vs[0], env, out);
    case "abs":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: `Math.abs(${vs[0].code})`, sort: NUM };
    case "bits":
      // A number's one bits are a set of numbers as the mask holds one; none,
      // a number below 0, has none.
      arity(1);
      expect(vs[0], "num", fn);
      return { code: `Math.max(0, ${vs[0].code})`, sort: setOf(NUM) };
    case "times":
      arity(1);
      expect(vs[0], "num", fn);
      return { code: timesOf(vs[0].code, env), sort: NUM };
    case "range":
      arity(2);
      expect(vs[0], "num", fn);
      expect(vs[1], "num", fn);
      if (env.wide) throw new CompileError(MASK_IN_WIDE);
      env.used.add("rangeMask");
      return { code: `rangeMask(${vs[0].code}, ${vs[1].code})`, sort: setOf(NUM) };
    case "subsets":
      arity(1);
      if (vs[0].sort.k !== "set")
        throw new CompileError(`subsets of ${show(vs[0].sort)}`);
      return { code: vs[0].code, sort: { k: "subsets", of: vs[0].sort } };
    case "first": {
      arity(1);
      const s = vs[0];
      if (s.sort.k === "cands") return { code: `b.candFirst(${s.code})`, sort: NUM };
      if (isMask(s.sort)) {
        env.used.add("least");
        return { code: `least(${s.code})`, sort: NUM };
      }
      if (s.sort.k !== "set") throw new CompileError(`first of ${show(s.sort)}`);
      const a = once(s, out);
      return { code: `(${a.code}.length > 0 ? ${a.code}[0] : -1)`, sort: s.sort.of };
    }
    case "at":
    case "per":
    case "v":
      arity(1);
      return clueField(fn, vs[0], env);
    case "strike":
    case "place": {
      if (!env.concluding) throw new CompileError(`${fn} outside a conclusion`);
      arity(2);
      if (
        vs[0].sort.k === "elem" &&
        ((vs[0].sort.e === "edge" && env.answerSort !== "edge") ||
          vs[0].sort.e === "angle" ||
          (vs[0].sort.e === "cell" &&
            env.answerSort !== "cell" &&
            env.edgeMarkSort === "cell"))
      )
        return edgeStrike(fn, vs, env, out);
      expectElem(vs[0], env.answerSort, fn);
      const c = once(vs[0], out);
      expect(vs[1], "num", fn);
      const d = once(vs[1], out);
      // A fact that changes nothing is left out, so a binding fires only
      // where its conclusion changes the marks.
      if (env.factSays !== undefined) {
        factWithSays(fn, c.code, d.code, env.factSays, scope, env, out);
        return { code: "true", sort: BOOL };
      }
      out.emit(
        fn === "strike"
          ? `if (${hasRead(c.code, d.code, env)}) { if (fire === null) { b.strikeAt(${c.code}, ${d.code}); changed = true; } else facts.push(STRIKE, ${c.code}, ${d.code}); }`
          : `if (!${marksRead("known", c.code)}) { if (fire === null) { b.placeAt(${c.code}, ${d.code}); changed = true; } else facts.push(PLACE, ${c.code}, ${d.code}); }`,
      );
      env.used.add(fn === "strike" ? "STRIKE" : "PLACE");
      return { code: "true", sort: BOOL };
    }
  }
  const def = env.defs.get(fn);
  if (def !== undefined) return definitionCall(fn, def, args, vs, env, out);
  throw new CompileError(`unknown function "${fn}"`);
}

/** Whether chains are read off what the marks keep (`chainsOf`): on the
 * marks themselves, under no supposition, and not by the answer check. */
const chainsKept = (env: Env): boolean =>
  !env.answer && env.position === null && env.supposed.length === 0;

/** Whether `e` is a chain the marks keep. */
const keptChain = (e: Expr, env: Env): boolean =>
  e.k === "call" && e.fn === "chain" && e.args.length === 1 && chainsKept(env);

/**
 * The function from a cell to the cell its value names by the answer's `to`,
 * -1 where it holds no value or names none: what `to(c)` and `chain(c)`
 * read. The value is read as the technique reads it, under any `with`. `x`
 * is the name of its parameter.
 */
function namedBy(x: string, env: Env): string {
  const to = env.to ?? null;
  if (to === null)
    throw new CompileError(
      "to and chain follow the answer's `to`, which it does not say",
    );
  const out = new Out(1);
  const read = markRead("value", { code: x, sort: elem("cell") }, env, out);
  const d = Out.fresh("_d");
  out.emit(`const ${d} = ${read.code};`);
  out.emit(`if (${d} < 0) return -1;`);
  // Compiled where it is read, not moved out of the function it makes.
  const scope = new Map<string, Val>([
    ["c", { code: x, sort: elem("cell") }],
    ["d", { code: d, sort: NUM }],
  ]);
  const v = compileExpr(
    to,
    scope,
    { ...env, hoist: null, boardRoot: null, shared: undefined },
    out,
  );
  expectElem(v, "cell", "the answer's to");
  // One line, as every term's code is.
  return [
    `(${x}: number): number => {`,
    `if (${x} < 0) return -1;`,
    ...out.text().map((l) => l.trim()),
    `return ${v.code};`,
    "}",
  ].join(" ");
}

/** A call of a definition the description makes, its arguments compiled. */
function definitionCall(
  fn: string,
  def: Definition,
  args: readonly Expr[],
  vs: readonly Val[],
  env: Env,
  out: Out,
): Val {
  if (def.params.length !== vs.length)
    throw new CompileError(`${fn} takes ${def.params.length}, given ${vs.length}`);
  const fixing = env.prelude?.fixing ?? null;
  const last = vs.length - 1;
  if (fixing?.name === fn) {
    // A self read passes the parameters before the last through as they
    // are, so it reads the set being computed.
    args.slice(0, last).forEach((a, i) => {
      if (!(a.k === "name" && a.name === def.params[i]))
        throw new CompileError(
          `${fn} reads itself with ${def.params[i]} changed: its fixed point is in ${def.params[last]} alone`,
        );
    });
    expectElem(vs[last], "cell", fn);
    return { code: `(${fixing.arr}[${vs[last].code}] === 1)`, sort: BOOL };
  }
  if (mentions(def.body, fn, env.defs, new Set())) {
    expectElem(vs[last], "cell", fn);
    const fixed = fixedPoint(fn, def, vs.slice(0, last), env);
    const at =
      last === 0
        ? fixed
        : `${fixed}(${vs
            .slice(0, last)
            .map((v) => v.code)
            .join(", ")})`;
    return { code: `(${at}[${vs[last].code}] === 1)`, sort: BOOL };
  }
  const kept = keptDefinition(fn, def, vs, env);
  if (kept !== null) return kept;
  const inner = new Map<string, Val>();
  const h = env.hoist;
  def.params.forEach((p, i) => {
    // A group's set is not made where it is passed: a sum over it reads the
    // runtime's kept sums, and the set itself is read from the groups kept.
    const v = vs[i].group === undefined ? once(vs[i], out) : vs[i];
    // A parameter is a name the body may read early, from where it is
    // bound: a literal anywhere, the argument's own name from its slot.
    const at =
      h === null
        ? undefined
        : /^-?\d+$/.test(v.code)
          ? h.root
          : (v.at ?? out.slot(h.loops));
    inner.set(p, { ...v, at });
  });
  return rungKept(fn, def, vs, inner, env) ?? compileExpr(def.body, inner, env, out);
}

/**
 * A definition that reads the marks, of one or two elements, kept by the
 * rung reading it for each argument until a firing changes the marks, as
 * the rung keeps its candidates (`candOf`): Bridges' `need(c)` and
 * `has(c, y)` are read for an island and each of its lines by every line
 * near it, and made again at each read they cost Bridges' deals four times
 * its hand-written ladder's (2026-11-08). Compiled once, as a function of
 * the module that the rung passes its candidates to, and whose map each rung
 * that calls it empties where it empties its candidates. Only one whose
 * loops nest two deep, through the definitions it reads, is kept: a single
 * loop over a few cells costs less to make again than to look up, and kept,
 * Mosaic's `need(c)` over its 3x3 block cost its deals a quarter more
 * (2026-11-08). None is kept under a supposition, whose reads differ. `null`
 * where the definition is not one.
 */
function rungKept(
  fn: string,
  def: Definition,
  vs: readonly Val[],
  inner: Scope,
  env: Env,
): Val | null {
  const { memos, kept } = env;
  if (
    memos === undefined ||
    kept === null ||
    !env.memo ||
    env.supposed.length > 0 ||
    vs.length === 0 ||
    vs.length > 2 ||
    vs.some((v) => v.sort.k !== "elem" || v.group !== undefined) ||
    loopDepth(def.body, env.defs) < 2 ||
    !readsMarks(def.body, env) ||
    FACTS.some((f) => mentions(def.body, f, env.defs, new Set()))
  )
    return null;
  const name = `${fn}Marked`;
  const key = `rung ${fn}`;
  let made = kept.defs.get(key);
  if (made === undefined) {
    const ps = def.params.map((p) => `v_${p}`);
    const readsClues = { yes: false };
    const nested = new Map<string, readonly string[]>();
    const body = new Out(1);
    const val = Out.own(name, () =>
      compileExpr(
        def.body,
        new Map(def.params.map((p, i) => [p, { code: ps[i], sort: vs[i].sort }])),
        {
          ...env,
          used: kept.used,
          readsClues,
          readsCands: { yes: false },
          memos: nested,
          scratch: null,
          hoist: null,
          boardRoot: null,
          shared: undefined,
          epoch: null,
          concluding: false,
        },
        body,
      ),
    );
    if (val.sort.k !== "num" && val.sort.k !== "bool") return null;
    const type = tsType(val.sort);
    const map = `${name}Kept`;
    // An element is an index from -1, `none`, past which the second
    // argument's fits in 2^20, and the key a double holds exactly.
    const at = ps.length === 1 ? ps[0] : `(${ps[0]} + 1) * 1048577 + (${ps[1]} + 1)`;
    const lines = [...body.text(), `  const _made = ${val.code};`];
    const reads = (n: string): string =>
      lines.some((l) => new RegExp(`(?<!\\.)\\b${n}\\b`).test(l)) ? n : `_${n}`;
    made = {
      sort: val.sort,
      clues: readsClues.yes,
      board: false,
      maps: [map, ...[...nested.values()].flat()],
      code: [
        `const ${map} = new Map<number, ${type}>();`,
        "",
        `/** \`${fn}(${def.params.join(", ")})\` as the description defines it, kept by`,
        " * the rung that reads it until a firing changes the marks. */",
        `export function ${name}(${reads("b")}: Marks, ${reads("sp")}: GridSpace, ${readsClues.yes ? "cl: Dealt, " : ""}${reads("cands")}: Int32Array, ${ps.map((p) => `${p}: number`).join(", ")}): ${type} {`,
        `  const _was = ${map}.get(${at});`,
        "  if (_was !== undefined) return _was;",
        ...lines,
        `  ${map}.set(${at}, _made);`,
        "  return _made;",
        "}",
      ].join("\n"),
    };
    kept.defs.set(key, made);
  }
  if (made.clues) env.readsClues.yes = true;
  if (env.readsCands) env.readsCands.yes = true;
  memos.set(name, made.maps ?? []);
  const args = def.params.map((p) => inner.get(p)?.code ?? "");
  return {
    code: `${name}(b, sp, ${made.clues ? "cl, " : ""}cands, ${args.join(", ")})`,
    sort: made.sort,
  };
}

/**
 * A definition of one element whose set of elements a technique reads, kept
 * for each element while no value is placed in the marks (`keptOf`): Rect's
 * `fits(q)` is read for every other clue inside loops over the clues, and
 * kept, it is made once a clue between placements and shared by every rung.
 * Only one that reads the marks through `value` and `known` alone, and no
 * name of the technique, is kept. `null` where the definition is not one.
 */
function keptDefinition(
  fn: string,
  def: Definition,
  vs: readonly Val[],
  env: Env,
): Val | null {
  const { kept } = env;
  if (
    kept === null ||
    env.position !== null ||
    env.supposed.length > 0 ||
    vs.length === 0 ||
    vs.some((v) => v.sort.k !== "elem" && v.sort.k !== "num") ||
    !keptWhilePlaced(def.body, env, new Set(), new Set(def.params))
  )
    return null;
  // One that reads no marks is made once a board, so a loop or a walk
  // repays the keeping; one made again after each placement needs two, or
  // one read inside a loop that does not bind its argument, which would
  // otherwise make it again on each pass for the same argument (Mosaic's
  // `need(c)`, read for each clue near `c`).
  const board = !readsMarks(def.body, env);
  // The answer check reads a grid and no marks, so only what is kept for the
  // board is the same there: inlined, Crossing's `head(L, c)` walked the
  // board again for every square of every line, two thirds of its deals.
  if (env.answer !== null && !board) return null;
  const depth = loopDepth(def.body, env.defs);
  const h = env.hoist;
  const repeated =
    depth >= 1 &&
    h !== null &&
    vs.every((v) => v.at !== undefined && v.at.loops < h.loops);
  if (
    depth < 2 &&
    !repeated &&
    !(board && (depth === 1 || walks(def.body, env.defs, new Set())))
  )
    return null;
  // Of several arguments, one is kept only for the board: kept for the marks,
  // each pair's value made again after every placement cost Rect's and
  // Path's deals more than it saved (2026-11-08).
  if (vs.length > 1 && !board) return null;
  let made = kept.defs.get(fn);
  if (made === undefined) {
    // Compiled once, as a function of its own. A mask is not kept: its
    // loops are over values, and cost less to make again than to look up. A
    // number or a truth whose loops nest two deep is: Boats' `done(m)`
    // counts the closed boats over the whole board.
    const ps = def.params.map((p) => `v_${p}`);
    const readsClues = { yes: false };
    const body = new Out(1);
    const val = Out.own(fn, () =>
      compileExpr(
        def.body,
        new Map(def.params.map((p, i) => [p, { code: ps[i], sort: vs[i].sort }])),
        // Its own arrays, not a technique's reused ones: each is kept.
        {
          ...env,
          used: kept.used,
          readsClues,
          scratch: null,
          hoist: null,
          boardRoot: null,
          concluding: false,
          memo: false,
          epoch: null,
        },
        body,
      ),
    );
    // An element is kept as its index: Bridges' `far(c, y)`, the island a
    // ray from an island reaches, is read for every line at every rung.
    if (
      !isArray(val.sort) &&
      val.sort.k !== "num" &&
      val.sort.k !== "bool" &&
      val.sort.k !== "elem"
    )
      return null;
    // A statement whose loop compiles away costs less than the lookup: Rect's
    // `meets(r, s)` is a comparison of corners, and kept, its deals took 1.09
    // of the time (2026-11-08).
    if (
      body.entries.length === 0 &&
      !BOARD_WALKS.test(val.code) &&
      !LINE_WALKS.test(val.code)
    )
      return null;
    const type = tsType(val.sort);
    // One array a parameter, the last holding the values: `under[i]` is the
    // type of what the array reached by the first `i` arguments holds.
    const under = [type];
    for (let i = 1; i < ps.length; i++) under.push(`Kept<${under[i - 1]}>`);
    const held = under[ps.length - 1];
    const last = ps[ps.length - 1];
    const reach = ps
      .slice(0, -1)
      .map(
        (p, i) => `  const _kept${i + 1} = (_kept${i === 0 ? "" : i}[${p}] ??= []);`,
      );
    const at = ps.length === 1 ? "_kept" : `_kept${ps.length - 1}`;
    kept.used.add("keptStore");
    kept.used.add("type Kept");
    const store = `${fn}Kept`;
    const keptAt = board
      ? `${store}.board(${readsClues.yes ? "cl" : "sp"})`
      : `${store}.marks(b)`;
    const spParam = [keptAt, val.code, ...body.text()].some((l) => /\bsp\b/.test(l))
      ? "sp"
      : "_sp";
    // The board last read and its values, in the module: asking the store
    // at every read cost Net's deals a twentieth, its function shared by
    // every store.
    const on = readsClues.yes ? "cl" : spParam;
    made = {
      sort: val.sort,
      clues: readsClues.yes,
      board,
      code: [
        `const ${store} = keptStore<${held}>();`,
        ...(board
          ? [`let ${fn}On: object | null = null;`, `let ${fn}At: Kept<${held}> = [];`]
          : []),
        "",
        `/** \`${fn}(${def.params.join(", ")})\` as the description defines it, kept for the`,
        board
          ? " * board, since it reads no marks. */"
          : " * marks while no value is placed in them. */",
        `export function ${fn}(${board ? "" : "b: Marks, "}${spParam}: GridSpace, ${readsClues.yes ? "cl: Dealt, " : ""}${ps.map((p) => `${p}: number`).join(", ")}): ${type} {`,
        ...(board
          ? [
              `  if (${on} !== ${fn}On) {`,
              `    ${fn}At = ${keptAt};`,
              `    ${fn}On = ${on};`,
              "  }",
              `  const _kept: Kept<${held}> = ${fn}At;`,
            ]
          : [`  const _kept: Kept<${held}> = ${keptAt};`]),
        ...reach,
        `  if (${at}[${last}] !== undefined) return ${at}[${last}];`,
        ...body.text(),
        `  const _made = ${val.code};`,
        `  ${at}[${last}] = _made;`,
        "  return _made;",
        "}",
      ].join("\n"),
    };
    kept.defs.set(fn, made);
  }
  if (made.clues) env.readsClues.yes = true;
  const call = `${fn}(${made.board ? "" : "b, "}sp, ${made.clues ? "cl, " : ""}${vs.map((v) => v.code).join(", ")})`;
  // A value kept for the board is read from its table, fetched once a run,
  // and the function asked only for one not yet made: asking the store for
  // the table at each read was a tenth of Net's deals, which read a square's
  // `arms(c)` in every filling.
  const root = env.hoist?.root ?? env.boardRoot ?? undefined;
  if (!made.board || vs.length !== 1 || root === undefined)
    return { code: call, sort: made.sort };
  const fetch = `${fn}Kept.board(${made.clues ? "cl" : "sp"})`;
  let table = root.made.get(fetch);
  if (table === undefined) {
    const t = Out.fresh("_k");
    root.lines.push({ indent: 0, text: `const ${t} = ${fetch};` });
    table = { code: t, sort: made.sort };
    root.made.set(fetch, table);
  }
  return { code: `(${table.code}[${vs[0].code}] ?? ${call})`, sort: made.sort };
}

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
function memberTable(s: Val, env: Env): string | null {
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
function walks(
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
function loopDepth(
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

// --- a definition that reads itself -----------------------------------------

/** The functions that read the marks, rather than the board. */
const MARK_READS = new Set([
  "value",
  "known",
  "cand",
  "to",
  "chain",
  "last",
  "linked",
  "place",
  "strike",
  "beam",
  "ahead",
]);

/** Whether `e` reads the marks, itself or through a definition, a supposition
 * included: what a definition kept for the whole board must not do. */
function readsMarks(e: Expr, env: Env, seen: Set<string> = new Set()): boolean {
  if (e.k === "with") return true;
  const name = e.k === "call" ? e.fn : e.k === "name" ? e.name : null;
  if (name !== null) {
    if (e.k === "call" && (MARK_READS.has(name) || isMarkRead(name, env))) return true;
    const d = env.defs.get(name);
    if (d !== undefined && !seen.has(name)) {
      seen.add(name);
      if (readsMarks(d.body, env, seen)) return true;
    }
  }
  return children(e).some((c) => readsMarks(c, env, seen));
}

/** Whether `fn` reads or makes one of the description's own marks: the mark
 * naming an element a cell, the mark on the edges or angles, or the
 * relation over the edges. */
function isMarkRead(fn: string, env: Env): boolean {
  return (
    fn === "mark" ||
    fn === env.cellMark?.name ||
    fn === env.edgeMark ||
    (env.relation !== null &&
      (fn === env.relation || fn === "related" || fn === "relate"))
  );
}

/** The terms directly under `e`. */
function children(e: Expr): Expr[] {
  switch (e.k) {
    case "num":
    case "name":
      return [];
    case "call":
      return e.args;
    case "set":
      return e.elems;
    case "size":
    case "not":
    case "neg":
      return [e.of];
    case "bin":
      return [e.a, e.b];
    case "with":
      return [e.cell, e.value, e.body];
    case "quant":
      return [
        ...e.binders.flatMap((b) => [b.of, ...(b.where ? [b.where] : [])]),
        e.body,
      ];
    case "agg":
      return [
        ...e.binders.flatMap((b) => [b.of, ...(b.where ? [b.where] : [])]),
        ...(e.where ? [e.where] : []),
        ...(e.term ? [e.term] : []),
      ];
  }
}

/** Whether `e` reads definition `fn`, itself or through the definitions it
 * calls. */
function mentions(
  e: Expr,
  fn: string,
  defs: ReadonlyMap<string, Definition>,
  seen: Set<string>,
): boolean {
  if (e.k === "call") {
    if (e.fn === fn) return true;
    const d = defs.get(e.fn);
    if (d !== undefined && !seen.has(e.fn)) {
      seen.add(e.fn);
      if (mentions(d.body, fn, defs, seen)) return true;
    }
  }
  return children(e).some((c) => mentions(c, fn, defs, seen));
}

/**
 * Refuse a read of `fn` in `e` that could make the set `fn` defines lose a
 * member as it gains one, so that its least fixed point is the set the
 * description means: a read is allowed where it stands positively, under
 * `and`, `or`, `exists`, a `forall`'s body, and the right of `implies`.
 */
function monotone(
  e: Expr,
  fn: string,
  positive: boolean,
  defs: ReadonlyMap<string, Definition>,
): void {
  const none = (...es: (Expr | null)[]): void => {
    for (const x of es)
      if (x !== null && mentions(x, fn, defs, new Set()))
        throw new CompileError(
          `${fn} reads itself where a larger set could make it smaller, or through another definition`,
        );
  };
  switch (e.k) {
    case "call":
      if (e.fn !== fn) {
        none(e);
        return;
      }
      if (!positive) throw new CompileError(`${fn} reads itself under a negation`);
      none(...e.args);
      return;
    case "not":
      monotone(e.of, fn, !positive, defs);
      return;
    case "bin":
      if (e.op === "and" || e.op === "or") {
        monotone(e.a, fn, positive, defs);
        monotone(e.b, fn, positive, defs);
      } else if (e.op === "implies") {
        monotone(e.a, fn, !positive, defs);
        monotone(e.b, fn, positive, defs);
      } else none(e.a, e.b);
      return;
    case "quant":
      for (const b of e.binders) {
        none(b.of);
        if (b.where !== null)
          monotone(b.where, fn, e.q === "exists" ? positive : !positive, defs);
      }
      monotone(e.body, fn, positive, defs);
      return;
    default:
      none(e);
  }
}

/**
 * The array holding definition `fn`'s least fixed point, computed once at
 * the top of the function being compiled: the least set of cells for which
 * its body holds, its reads of itself read as membership. It reads only the
 * position and its parameters, so it is the same wherever the function reads
 * it with the same values of the parameters before its last: one set, or,
 * with such parameters, a function giving the set for their values.
 */
function fixedPoint(
  fn: string,
  def: Definition,
  earlier: readonly Val[],
  env: Env,
): string {
  const pre = env.prelude;
  if (pre === null)
    throw new CompileError(
      `${fn} reads itself, which only a planning game's rules may`,
    );
  const kept = pre.fixed.get(fn);
  if (kept !== undefined) return kept;
  monotone(def.body, fn, true, env.defs);
  for (const v of earlier)
    if (v.sort.k !== "num" && v.sort.k !== "elem")
      throw new CompileError(
        `${fn}: a fixed point's parameters are numbers and elements`,
      );
  const arr = Out.fresh("_fix");
  const c = Out.fresh("_c");
  const grew = Out.fresh("_grew");
  // The parameters before the last, as the function computing the set for
  // each of their values names them.
  const names = earlier.map(() => Out.fresh("_a"));
  const scope = new Map<string, Val>(
    earlier.map((v, i) => [def.params[i], { code: names[i], sort: v.sort }]),
  );
  scope.set(def.params[earlier.length], { code: c, sort: elem("cell") });
  // The body first, so a fixed point it reads is computed ahead of this one.
  const body = new Out(0);
  const outer = pre.fixing;
  pre.fixing = { name: fn, arr };
  const v = compileExpr(def.body, scope, env, body);
  pre.fixing = outer;
  expect(v, "bool", fn);
  const out = pre.out;
  // With parameters before the last, a set for each of their values, made
  // when it is first read and kept for the call.
  const sets = names.length > 0 ? Out.fresh("_sets") : "";
  const key = names.length === 1 ? names[0] : `[${names.join(", ")}].join()`;
  const of = `${arr}Of`;
  if (names.length > 0) {
    out.emit(
      `const ${sets} = new Map<${names.length === 1 ? "number" : "string"}, Uint8Array>();`,
    );
    out.open(
      `const ${of} = (${names.map((n) => `${n}: number`).join(", ")}): Uint8Array => {`,
    );
    out.emit(`const kept = ${sets}.get(${key});`);
    out.emit("if (kept !== undefined) return kept;");
  }
  out.emit(`const ${arr} = new Uint8Array(sp.cells.length);`);
  out.open(`for (let ${grew} = true; ${grew}; ) {`);
  out.emit(`${grew} = false;`);
  out.open(`for (let ${c} = 0; ${c} < sp.cells.length; ${c}++) {`);
  out.emit(`if (${arr}[${c}] === 1) continue;`);
  out.append(body);
  out.open(`if (${v.code}) {`);
  out.emit(`${arr}[${c}] = 1;`);
  out.emit(`${grew} = true;`);
  out.close();
  out.close();
  out.close();
  const made = names.length > 0 ? of : arr;
  if (names.length > 0) {
    out.emit(`${sets}.set(${key}, ${arr});`);
    out.emit(`return ${arr};`);
    out.close("};");
  }
  pre.fixed.set(fn, made);
  return made;
}

// --- a technique ------------------------------------------------------------

const capitalized = (id: string): string => id[0].toUpperCase() + id.slice(1);

/** The sorts each binder of a technique takes, for its binding's type. */
function binderSorts(t: Technique, env: Env): { name: string; sort: Sort }[] {
  const sorts: { name: string; sort: Sort }[] = [];
  const probe = new Out(0);
  bindingLoops(
    t.binders,
    new Map(),
    { ...env, used: new Set(), scratch: null, hoist: null, boardRoot: null },
    probe,
    (sc) => {
      for (const b of t.binders) {
        const v = sc.get(b.name);
        if (v !== undefined) sorts.push({ name: b.name, sort: v.sort });
      }
    },
  );
  return sorts;
}

/**
 * A technique's bindings, each checked before it fires that what it read of
 * the marks still holds: a solve makes each fact as it concludes it, so a
 * binding that read a set before an earlier binding's fact reads it stale,
 * and would conclude from marks no longer there (§ "What a technique
 * compiles to"). Where a count of the facts made has moved since the
 * binding first read the marks, its binders' reads are made again.
 */
interface Recheck {
  /** The binders whose loops the counts are taken in: the technique's own. */
  binders: readonly Binder[];
  /** The slots a count may be taken in, outermost first: the function's
   * start, and ahead of each binder in scope and of its filter, each with
   * how many of the binders' loops are open there. */
  chain: { slot: Slot; loops: number }[];
  /** The statements opening the binders' loops open where the code is
   * written, outermost first. */
  loops: Line[];
  /** Where a binding is checked, ahead of its premise, with the slots in
   * scope there, the loops open, the visited binder's element, which a
   * binding passed over is visited again at, and its reads made again. */
  checks: {
    at: Slot;
    chain: readonly { slot: Slot; loops: number }[];
    loops: readonly Line[];
    visit: string | null;
    reads: readonly Reread[];
    fresh: readonly FreshRead[];
  }[];
}

/** A binder's loop, if it opens one, is open: a count may be taken inside. */
function binderOpened(r: Recheck | null, out: Out, loop: boolean): void {
  if (r === null) return;
  if (loop) r.loops.push((out.blocks.at(-1) as Block).line);
  r.chain.push({ slot: out.slot(0), loops: r.loops.length });
}

/** A binder's scope is closed, with the slots its own and its loop's. */
function binderClosed(r: Recheck | null, loop: boolean): void {
  if (r === null) return;
  r.chain.splice(-2);
  if (loop) r.loops.pop();
}

/** One of a binding's reads of the marks made again: the statements that
 * make it, its truth, and how many of the binders' loops are open where a
 * binding it fails is left, so that the bindings it governs are passed over
 * with it. */
interface Reread {
  lines: readonly Line[];
  code: string;
  leave: number;
}

/**
 * A binding's reads of the marks that a fact made since could have changed:
 * whether each binder's element is still in its set, each `=` names what its
 * term reads now, and each `where` holds, compiled at the binding, outermost
 * first. A read is made again only where another binding's facts can come
 * between it and the binding, a loop opened since; and only where it reads
 * the marks, since the board's deal and the binders' names do not change. A
 * read the language cannot state again (a subset's membership) is false, so
 * its bindings are passed over whenever a count moves. A set named by `=`
 * that the binding reads only by its groups is read again only at those
 * groups (`groupRereads`).
 */
function rereads(
  binders: readonly Binder[],
  rest: readonly (Expr | null)[],
  scope: Scope,
  env: Env,
): Reread[] {
  const out: { expr: Expr; read: number; leave: number; set?: number }[] = [];
  const levels = new Map<string, number>();
  let loops = 0;
  for (const [i, bnd] of binders.entries()) {
    const name: Expr = { k: "name", name: bnd.name };
    if (bnd.kind === "let") {
      if (readsMarks(bnd.of, env))
        out.push({
          expr: { k: "bin", op: "=", a: name, b: bnd.of },
          read: loops,
          leave: loops,
          set: i,
        });
    } else {
      loops++;
      // The set is read ahead of the binder's own loop, an element of it at
      // a time in it.
      if (readsMarks(bnd.of, env))
        out.push({ expr: memberOf(name, bnd.of), read: loops - 1, leave: loops });
    }
    if (bnd.where !== null && readsMarks(bnd.where, env))
      out.push({ expr: bnd.where, read: loops, leave: loops });
    levels.set(bnd.name, loops);
  }
  return out
    .filter((r) => r.read < loops)
    .flatMap(({ expr, leave, set }): Reread[] => {
      if (set !== undefined) {
        const after = [
          binders[set].where,
          ...binders.slice(set + 1).flatMap((b) => [b.of, b.where]),
          ...rest,
        ].filter((e): e is Expr => e !== null);
        const groups = groupRereads(binders[set].name, after, levels, scope, env);
        if (groups !== null) return groups;
      }
      const o = new Out(0);
      const mark = Out.mark();
      const used = new Set(env.used);
      const scratch: string[] = [];
      try {
        const v = compileExpr(expr, scope, { ...env, scratch }, o);
        expect(v, "bool", "a read made again");
        env.scratch?.push(...scratch);
        return [{ lines: flatLines(o), code: v.code, leave }];
      } catch (e) {
        if (!(e instanceof CompileError)) throw e;
        Out.rewind(mark);
        env.used.clear();
        for (const u of used) env.used.add(u);
        return [{ lines: [], code: "false", leave }];
      }
    });
}

/**
 * A set `S` named by `=` ahead of the loops, read by the binding only as the
 * groups `through(t, S)` of terms `t` of the binders, its groups kept on the
 * marks: whether each such group is the one the binding took, the kept
 * groups caught up and read at `t`. A placement elsewhere leaves the binding
 * as it was, where reading `S` whole again would pass it over: Filling's
 * `O = alike` changed with nearly every placement, and ended each run at
 * its first. A group's read fails for the bindings of its terms' values, so
 * that is the scope it leaves. `null` where `after`, what is read after `S`
 * is bound, reads it otherwise, or its groups are not kept.
 */
function groupRereads(
  s: string,
  after: readonly Expr[],
  levels: ReadonlyMap<string, number>,
  scope: Scope,
  env: Env,
): Reread[] | null {
  const terms = new Map<string, Expr>();
  if (!after.every((e) => throughOnly(e, s, new Set(), terms))) return null;
  const S = scope.get(s);
  const kept = S?.edgeSet?.() ?? null;
  if (S?.at === undefined || kept === null) return null;
  const key = `keptEdgeGroups(sp, b, ${kept.clues ? "cl" : "null"}, ${kept.fn}, ${kept.arg}, ${env.answerSort === "edge"})`;
  // The groups the binding read, taken where `S` is bound.
  const then = S.at.made.get(key);
  if (then === undefined) return null;
  const reads: Reread[] = [];
  for (const t of terms.values()) {
    if (readsMarks(t, env)) return null;
    const names = new Set<string>();
    freeNames(t, names, new Set());
    let leave = levels.get(s) ?? 0;
    for (const n of names) leave = Math.max(leave, levels.get(n) ?? 0);
    const o = new Out(0);
    const x = compileExpr(t, scope, env, o);
    expectElem(x, "cell", "through");
    const now = Out.fresh("_now");
    const was = `${then.code}.of(${x.code})`;
    reads.push({
      lines: [
        ...flatLines(o),
        { indent: 0, text: `const ${now} = ${key}.of(${x.code});` },
      ],
      code: `${now} === ${was} || sameSet(${now}, ${was})`,
      leave,
    });
  }
  if (kept.clues) env.readsClues.yes = true;
  env.used.add("keptEdgeGroups");
  env.used.add("sameSet");
  return reads;
}

/** One of a binding's reads made afresh for the stale-read guard: the
 * statements that make it, its truth, and what it reads, for the error. */
interface FreshRead {
  lines: readonly Line[];
  code: string;
  what: string;
}

/**
 * Every read a binding makes of its binders, made afresh at the binding for
 * the stale-read guard (`staleChecking` in the runtime): each element still
 * in its set, each `=` naming what its term reads, each `where` holding. It
 * is written apart from `rereads` and narrows nothing: every binder, whether
 * or not a fact could have come between, read from the marks with no count.
 * A set the binding reads only by its groups is compared at those groups,
 * joined afresh from the set read now, not the kept ones. A read the
 * language cannot state again is not made.
 */
function freshReads(
  binders: readonly Binder[],
  rest: readonly (Expr | null)[],
  scope: Scope,
  env: Env,
): FreshRead[] {
  const out: FreshRead[] = [];
  const attempt = (what: string, make: (o: Out, e: Env) => string): void => {
    const o = new Out(0);
    const mark = Out.mark();
    const used = new Set(env.used);
    try {
      // No buffer is kept for the function: a build drops the guard, and a
      // buffer declared outside it would be made on every call.
      const code = make(o, { ...env, scratch: null });
      out.push({ lines: flatLines(o), code, what });
    } catch (e) {
      if (!(e instanceof CompileError)) throw e;
      Out.rewind(mark);
      env.used.clear();
      for (const u of used) env.used.add(u);
    }
  };
  const truth = (expr: Expr) => (o: Out, e: Env) => {
    const v = compileExpr(expr, scope, e, o);
    expect(v, "bool", "a read made afresh");
    return v.code;
  };
  for (const [i, bnd] of binders.entries()) {
    const name: Expr = { k: "name", name: bnd.name };
    if (bnd.kind === "let") {
      const after = [
        bnd.where,
        ...binders.slice(i + 1).flatMap((b) => [b.of, b.where]),
        ...rest,
      ].filter((e): e is Expr => e !== null);
      const terms = new Map<string, Expr>();
      const S = scope.get(bnd.name);
      // Asking for a set's kept groups declares what keeps them, so only a
      // set read by its groups alone asks.
      const kept = after.every((e) => throughOnly(e, bnd.name, new Set(), terms))
        ? (S?.edgeSet?.() ?? null)
        : null;
      const then =
        kept === null || S?.at === undefined
          ? undefined
          : S.at.made.get(
              `keptEdgeGroups(sp, b, ${kept.clues ? "cl" : "null"}, ${kept.fn}, ${kept.arg}, ${env.answerSort === "edge"})`,
            );
      if (then !== undefined)
        attempt(`${bnd.name}'s groups`, (o, e) => {
          const now = compileExpr(bnd.of, scope, e, o);
          const groups = Out.fresh("_fg");
          o.emit(`const ${groups} = edgeGroups(sp, ${now.code});`);
          e.used.add("edgeGroups");
          e.used.add("sameSet");
          return [...terms.values()]
            .map((t) => {
              const x = compileExpr(t, scope, e, o);
              expectElem(x, "cell", "through");
              return `sameSet(${groups}.of(${x.code}), ${then.code}.of(${x.code}))`;
            })
            .join(" && ");
        });
      else attempt(`${bnd.name} =`, truth({ k: "bin", op: "=", a: name, b: bnd.of }));
    } else if (bnd.kind === "in")
      attempt(`${bnd.name} in`, truth(memberOf(name, bnd.of)));
    if (bnd.where !== null) attempt(`where of ${bnd.name}`, truth(bnd.where));
  }
  return out;
}

/** Whether `e` reads the set named `s` only as `through(t, s)`, each `t`
 * bound outside `e` (gathered into `terms`, by its form). */
function throughOnly(
  e: Expr,
  s: string,
  local: ReadonlySet<string>,
  terms: Map<string, Expr>,
): boolean {
  if (e.k === "name") return e.name !== s;
  const [t, set] = e.k === "call" && e.fn === "through" ? e.args : [];
  if (set?.k === "name" && set.name === s && !local.has(s)) {
    const names = new Set<string>();
    freeNames(t, names, new Set());
    if ([...names].some((n) => local.has(n))) return false;
    terms.set(JSON.stringify(t), t);
    return throughOnly(t, s, local, terms);
  }
  if (e.k === "quant" || e.k === "agg") {
    const inner = new Set([...local, ...e.binders.map((b) => b.name)]);
    return children(e).every((c) => throughOnly(c, s, inner, terms));
  }
  return children(e).every((c) => throughOnly(c, s, local, terms));
}

/** `x in of`, where `of` is a range or a set stated member by member, which
 * a binder ranges over but no `in` reads, as the comparisons they are. */
function memberOf(x: Expr, of: Expr): Expr {
  if (of.k === "call" && of.fn === "range" && of.args.length === 2) {
    const [lo, hi] = of.args;
    return {
      k: "bin",
      op: "and",
      a: { k: "bin", op: "<=", a: lo, b: x },
      b: { k: "bin", op: "<=", a: x, b: hi },
    };
  }
  if (of.k === "set" && of.elems.length > 0)
    return of.elems
      .map((e): Expr => ({ k: "bin", op: "=", a: x, b: e }))
      .reduce((a, b) => ({ k: "bin", op: "or", a, b }));
  return { k: "bin", op: "in", a: x, b: of };
}

/** `o`'s statements, its slots' among them, each at its indent in `o`. */
function flatLines(o: Out): Line[] {
  return o.entries.flatMap((e) =>
    "text" in e
      ? [{ indent: e.indent, text: e.text }]
      : e.lines.map((l) => ({ indent: e.indent + l.indent, text: l.text })),
  );
}

/** The kinds of mark ({@link MADE}) each of the marks' members a compiled
 * line names reads; a write, what to visit, or a size the marks hold, reads
 * none a binding rests on. Any other mention of the marks, `b` passed to a function of the
 * runtime, reads every kind. */
const READS = new Map<string, number>([
  ...["grid", "known", "value"].map((m): [string, number] => [m, 1 << MADE.value]),
  ...["cands", "cand", "has", "candCount", "candFirst", "candList"].map(
    (m): [string, number] => [m, 1 << MADE.cand],
  ),
  ["edgeCand", 1 << MADE.edgeMark],
  ["markOf", 1 << MADE.cellMark],
  ...["pairOf", "relatedOf"].map((m): [string, number] => [m, 1 << MADE.relation]),
  // The count of placements and cell marks, by which a kept term is kept.
  ["placed", (1 << MADE.value) | (1 << MADE.cellMark)],
  ...[
    "placeAt",
    "strikeAt",
    "edgeStrikeAt",
    "markAt",
    "relateAt",
    "visit",
    "domain",
    "repeat",
    "times",
  ].map((m): [string, number] => [m, 0]),
]);
const EVERY_KIND = (1 << Object.keys(MADE).length) - 1;

/** The kinds of mark a line of compiled code reads: the code names the
 * marks `b` and nothing else so (`compileTechnique`'s signature). */
function kindsRead(line: string): number {
  let kinds = 0;
  for (const m of line.matchAll(/\bb\b(?:\.(\w+))?/g))
    kinds |= m[1] === undefined ? EVERY_KIND : (READS.get(m[1]) ?? EVERY_KIND);
  return kinds;
}

/**
 * Write each binding's check: for each kind of mark read ahead of it, the
 * count of facts that changed that kind is taken in the latest slot in scope
 * that no read of the kind precedes, and a binding whose counts moved reads
 * its binders again; one whose reads no longer hold leaves their scope, its
 * element left to visit again. A technique run on placing is run again, by
 * `rerun`. Whether a left loop marked the run to be run again.
 */
function rechecked(r: Recheck, body: Out, rerun: string | null, env: Env): boolean {
  // A kind of mark the description keeps none of no fact changes.
  const kept =
    (1 << MADE.value) |
    (1 << MADE.cand) |
    (env.edgeMark === null ? 0 : 1 << MADE.edgeMark) |
    (env.cellMark === null ? 0 : 1 << MADE.cellMark) |
    (env.relation === null ? 0 : 1 << MADE.relation);
  const before = new Map<Slot, number>();
  let read = 0;
  for (const e of body.entries) {
    if ("text" in e) {
      read |= kindsRead(e.text);
      continue;
    }
    before.set(e, read);
    for (const l of e.lines) read |= kindsRead(l.text);
  }
  const taken = new Map<string, string>();
  const labels = new Map<Line, string>();
  let stale = false;
  for (const check of r.checks) {
    if (check.reads.length === 0) continue;
    const kinds = (before.get(check.at) ?? EVERY_KIND) & kept;
    const moved: string[] = [];
    for (const k of Object.values(MADE)) {
      if ((kinds & (1 << k)) === 0) continue;
      let place = check.chain[0];
      for (let i = check.chain.length - 1; i >= 0; i--)
        if (((before.get(check.chain[i].slot) ?? EVERY_KIND) & (1 << k)) === 0) {
          place = check.chain[i];
          break;
        }
      // Only a loop opened since the count runs another binding, whose
      // facts could move it.
      if (place.loops === check.loops.length) continue;
      const at = place.slot;
      const key = `${at.seq}_${k}`;
      let name = taken.get(key);
      if (name === undefined) {
        name = `${Out.fresh("_m")}_${k}`;
        taken.set(key, name);
        at.lines.push({ indent: 0, text: `const ${name} = b.made[${k}];` });
      }
      moved.push(`b.made[${k}] !== ${name}`);
    }
    if (moved.length === 0) continue;
    const again =
      check.visit === null ? "" : `if (_visit !== null) _visit[${check.visit}] = 1; `;
    const lines: Line[] = [{ indent: 0, text: `if (${moved.join(" || ")}) {` }];
    // A read that fails fails for every binding it governs, so its scope is
    // left: its loop goes on to the next, and the function's start is left
    // by returning.
    for (const read of check.reads) {
      let leave: string;
      if (read.leave === 0)
        leave = rerun === null ? "return fired;" : `return ${rerun} | fired;`;
      else {
        const loop = check.loops[read.leave - 1];
        let label = labels.get(loop);
        if (label === undefined) {
          // A technique's binders' loops nest in one chain, so the depth
          // names one in the function; a fresh name would renumber the
          // module's others.
          label = `R${read.leave}`;
          labels.set(loop, label);
          const i = body.entries.indexOf(loop);
          if (i < 0)
            throw new CompileError("a binder's loop is not the technique's own");
          body.entries.splice(i, 0, { indent: loop.indent, text: `${label}:` });
        }
        if (rerun !== null) stale = true;
        leave = `${rerun === null ? "" : "_stale = true; "}continue ${label};`;
      }
      for (const l of read.lines) lines.push({ indent: l.indent + 1, text: l.text });
      lines.push({ indent: 1, text: `if (!(${read.code})) { ${again}${leave} }` });
    }
    lines.push({ indent: 0, text: "}" });
    check.at.lines.push(...lines);
  }
  if (stale) r.chain[0].slot.lines.push({ indent: 0, text: "let _stale = false;" });
  return stale;
}

/** Write each binding's stale-read guard, after its reads made again: under
 * the runtime's switch, every read of its binders made afresh, each that no
 * longer holds an error. */
function freshChecked(r: Recheck, id: string, env: Env): void {
  for (const check of r.checks) {
    if (check.fresh.length === 0) continue;
    env.used.add("staleChecking");
    env.used.add("freshBinding");
    // The guard is half again the module's size: a build drops it. `DEV` is
    // the module's (`runtimeImport`).
    const lines: Line[] = [{ indent: 0, text: "if (DEV && staleChecking) {" }];
    for (const read of check.fresh)
      for (const l of read.lines) lines.push({ indent: l.indent + 1, text: l.text });
    const holds = check.fresh.map((read) => read.code).join(", ");
    const what = check.fresh.map((read) => JSON.stringify(read.what)).join(", ");
    lines.push(
      {
        indent: 1,
        text: `freshBinding(${JSON.stringify(id)}, [${holds}], [${what}]);`,
      },
      { indent: 0, text: "}" },
    );
    check.at.lines.push(...lines);
  }
}

function compileTechnique(t: Technique, env: Env): { code: string; clues: boolean } {
  const fnName = t.id.includes(".") ? t.id.slice(t.id.indexOf(".") + 1) : t.id;
  return Out.own(fnName, () => techniqueFunction(t, fnName, env));
}

function techniqueFunction(
  t: Technique,
  fnName: string,
  env: Env,
): { code: string; clues: boolean } {
  const bindingType = `${capitalized(fnName)}Binding`;
  const saysType = `${capitalized(fnName)}Says`;
  const readsClues = { yes: false };
  const onPlace = t.on !== null;
  // A strike runs no placing technique, so a rung's reads of `value` and
  // `known` hold across one (`hoist` below).
  if (t.on === "strike" && places(t.conclude, env))
    throw new CompileError(`${t.id}: a technique run on striking only strikes`);
  // A rung reads a cell's candidates many times a scan, so it keeps them;
  // a technique run on placing or striking reads few, each time, and does
  // not.
  const scratch: string[] = [];
  const held: string[] = [];
  const epoch = { used: false };
  const readsCands = { yes: false };
  const memos = new Map<string, readonly string[]>();
  const tenv: Env = {
    ...env,
    readsClues,
    readsCands,
    memos: onPlace ? undefined : memos,
    memo: !onPlace,
    scratch,
    ...(onPlace ? {} : { held }),
    hoist: null,
    boardRoot: null,
    epoch: onPlace ? null : epoch,
    factSays:
      t.says?.fact == null
        ? undefined
        : {
            says: t.says.fact,
            buffer: `${fnName}FactSays`,
            fields: { terms: [], marks: [] },
            sorts: new Map(),
          },
  };
  if (t.binders.some((b) => b.kind === "fill"))
    throw new CompileError(`${t.id}: a filling binds in a quantifier, not a technique`);
  const sorts = binderSorts(t, tenv);
  const fields = sorts.map((s) => `  ${s.name}: ${tsType(s.sort)};`);
  const body = new Out(1);
  body.emit(`const facts = ${fnName}Facts;`);
  body.emit("let fired = 0;");
  body.emit("let changed = false;");
  const recheck: Recheck = {
    binders: [],
    chain: [{ slot: body.slot(0), loops: 0 }],
    loops: [],
    checks: [],
  };
  // A solve makes each fact as it concludes it, so a placement would change
  // a `value` or `known` read before it; a strike changes neither.
  tenv.hoist = { root: body.slot(0), loops: 0, marks: !places(t.conclude, env) };
  tenv.boardRoot = tenv.hoist.root;
  // The facts and the kept candidates live in one buffer each a function,
  // emptied each call: a rung never runs inside its own call (a firing runs
  // only the techniques run on placing and striking), `fire` reads the facts
  // before it returns, and one run on striking, which a strike of its own
  // runs again, has its facts copied before they are made
  // (`strikingRung`). The candidates are kept only by a technique that
  // reads them, which is known once its body is compiled.
  const buffer = `${fnName}Cands`;
  const keep = body.slot(0);
  const refills: Slot[] = [];
  // Nothing is moved out of a binding's reads made again, nor shared with
  // what was computed before the facts that made a read stale.
  const readEnv = (): Env => ({
    ...benv,
    hoist: null,
    boardRoot: null,
    shared: { made: new Map() },
    recheck: undefined,
    visitBinder: undefined,
    visitAt: undefined,
  });
  // The fields of what a firing says, by group, as the module's type for it.
  const saysFields = {
    variants: [] as {
      name: string | null;
      terms: string[];
      marks: string[];
      sorts: Map<string, Sort>;
      /** Whether a firing carries the `wording` that held. */
      worded: boolean;
    }[],
  };
  const fire = (sc: Scope): void => {
    const shared: Shared = { made: new Map() };
    const visited =
      benv.visitBinder === undefined ? undefined : sc.get(benv.visitBinder.name);
    recheck.checks.push({
      at: body.slot(0),
      chain: [...recheck.chain],
      loops: [...recheck.loops],
      visit: visited?.code ?? null,
      reads: rereads(recheck.binders, [t.premise, t.conclude], sc, readEnv()),
      fresh: freshReads(t.binders, [t.premise, t.conclude], sc, readEnv()),
    });
    if (t.premise !== null) {
      const p = compileExpr(t.premise, sc, { ...tenv, shared }, body);
      expect(p, "bool", "premise");
      body.emit(`if (!(${p.code})) continue;`);
    }
    body.emit("facts.length = 0;");
    if (tenv.factSays !== undefined) body.emit(`${tenv.factSays.buffer}.length = 0;`);
    body.emit("changed = false;");
    const c = compileExpr(t.conclude, sc, { ...tenv, concluding: true, shared }, body);
    expect(c, "bool", "conclusion");
    // A set is a buffer the next binding refills, and a reason may keep it
    // past that, as a plan does, so the binding holds a copy.
    const binding = `{ ${sorts
      .map((s) => `${s.name}: v_${s.name}${isArray(s.sort) ? ".slice()" : ""}`)
      .join(", ")} }`;
    // A conclusion that is false proves the marks inconsistent.
    body.emit(`if (!(${c.code})) return -1;`);
    body.open("if (changed || facts.length > 0) {");
    body.emit("fired = 1;");
    // What the step speaks of is read here, on the marks before the facts are
    // made, and only on a hint's path: a solve passes no `fire`.
    let said = "";
    if (t.says !== null) {
      said = ", _says";
      body.open("if (fire !== null) {");
      saysFields.variants.length = 0;
      const { variants } = t.says;
      const arms = variants[0].name !== null;
      // The arm that holds, the first true one: every condition is read where
      // the others are, on the marks before the facts are made.
      if (arms) {
        const holds = variants.map((v) => {
          const w = compileExpr(v.when as Expr, sc, { ...tenv, shared }, body);
          expect(w, "bool", `says ${v.name} when`);
          return w.code;
        });
        body.emit(`let _arm = -1;`);
        body.emit(
          holds
            .map((h, i) => `if (${h}) _arm = ${i};`)
            .reduceRight(
              (rest, line, i) =>
                i === holds.length - 1 ? line : `${line} else ${rest}`,
              "",
            ),
        );
      }
      if (tenv.factSays !== undefined)
        body.emit(
          `if (${tenv.factSays.buffer}.length * 3 !== facts.length) throw new Error(${JSON.stringify(`${t.id}: a fact of its conclusion is made where says.fact is not read`)});`,
        );
      // What held in the technique's `where`s and `premise`, read on the
      // same marks as the terms.
      if (t.says.witness) {
        env.used.add("type Witness");
        env.used.add("witnessAll");
        const held = [
          ...t.binders.flatMap((b) => (b.kind === "fill" ? [] : [b.where])),
          t.premise,
        ].filter((x): x is Expr => x !== null);
        const parts = held
          // Its buffers are declared where it is read, not once a call.
          .map((x) =>
            witnessOf(
              x,
              sc,
              { ...tenv, shared: { made: new Map() }, scratch: null },
              body,
            ),
          )
          .filter((w): w is string => w !== null);
        body.emit(
          `const _w: Witness | null = ${
            parts.length === 0
              ? "null"
              : parts.length === 1
                ? parts[0]
                : `witnessAll(${parts.join(", ")})`
          };`,
        );
      }
      // The elements those same formulas read, a second time on the same
      // marks, recording each read of a mark.
      if (t.says.reads) {
        env.used.add("type Reads");
        body.emit(`const _rc: number[] = [];`);
        body.emit(`const _re: number[] = [];`);
        const readEnv: Env = {
          ...tenv,
          shared: { made: new Map() },
          scratch: null,
          // In place: a read moved out of its loop would run before `_rc`
          // is declared, and one shared with the solve path's is not made.
          hoist: null,
          boardRoot: null,
          reads: { cells: "_rc", edges: "_re" },
        };
        // What a binder is drawn from or defined as is read too: a number's
        // lines left are the marks round it, bound before any `where`.
        for (const x of [
          ...t.binders.flatMap((b) => (b.kind === "fill" ? [] : [b.of, b.where])),
          t.premise,
        ]) {
          if (x === null) continue;
          const v = compileExpr(x, sc, readEnv, body);
          if (x === t.premise || t.binders.some((b) => b.where === x)) {
            expect(v, "bool", "reads");
            once(v, body);
          } else if (/_r[ce]\.push\(/.test(v.code)) {
            // A value is wanted for its reads alone.
            body.emit(`void (${v.code});`);
          }
        }
        body.emit(
          `const _r: Reads = { cells: [...new Set(_rc)], edges: [...new Set(_re)] };`,
        );
      }
      if (arms) body.emit(`let _says: ${saysType} | null = null;`);
      for (const [i, v] of variants.entries()) {
        const fields = { terms: [] as string[], marks: [] as string[] };
        const sorts = new Map<string, Sort>();
        // A term read inside an arm is not in scope in another.
        const inArm: Shared = { made: new Map(shared.made) };
        if (arms) body.open(`if (_arm === ${i}) {`);
        // Where the step has wordings, each term and mark is bound once, for
        // their `when`s to read by name.
        const worded = v.words.length > 1;
        const named = new Map(sc);
        const read = (e: Expr, group: "terms" | "marks", name: string): string => {
          const r = compileExpr(e, sc, { ...tenv, shared: inArm }, body);
          if (group === "marks" && !isArray(r.sort))
            throw new CompileError(
              `${t.id}: says marks ${name} is not a set of elements`,
            );
          fields[group].push(`${name}: ${tsType(r.sort)};`);
          if (group === "terms") sorts.set(name, r.sort);
          // A set is a buffer the next binding refills.
          const code = isArray(r.sort) ? `${r.code}.slice()` : r.code;
          if (!worded) return `${name}: ${code}`;
          const bound = `_sw_${name}`;
          body.emit(`const ${bound} = ${code};`);
          named.set(name, { code: bound, sort: r.sort });
          return `${name}: ${bound}`;
        };
        const terms = v.terms.map((x) => read(x.expr, "terms", x.name));
        const marks = v.marks.map((x) => read(x.expr, "marks", x.role));
        const own =
          tenv.factSays === undefined ? "" : `, facts: ${tenv.factSays.buffer}.slice()`;
        const wording = worded
          ? `, wording: ${wordingIndex(v.words, `${t.id}: says${v.name === null ? "" : ` ${v.name}`}`, (e) => compileExpr(e, named, { ...tenv, shared: inArm }, body))}`
          : "";
        body.emit(
          `${arms ? "" : "const "}_says = { ${arms ? `arm: ${JSON.stringify(v.name)}, ` : ""}terms: { ${terms.join(", ")} }, marks: { ${marks.join(", ")} }${wording}${own}${t.says.witness ? ", witness: _w" : ""}${t.says.reads ? ", reads: _r" : ""} };`,
        );
        if (arms) body.close();
        saysFields.variants.push({ name: v.name, ...fields, sorts, worded });
      }
      if (arms)
        body.emit(
          `if (_says === null) throw new Error(${JSON.stringify(`${t.id}: no arm of says holds`)});`,
        );
    }
    // A technique run on placing makes every firing; a rung stops at the
    // first unless `fire` asks for the rest.
    if (onPlace) {
      body.emit(
        `${t.says === null ? "if (fire !== null) " : ""}fire(${binding}, facts${said});`,
      );
      if (t.says !== null) body.close();
    } else {
      body.emit(
        t.says === null
          ? `if (fire !== null && !fire(${binding}, facts)) return 1;`
          : `if (!fire(${binding}, facts${said})) return 1;`,
      );
      if (t.says !== null) body.close();
      // The firing changed the marks the kept candidates were read from.
      refills.push(body.slot(0));
      if (epoch.used) body.emit("_epoch++;");
    }
    body.close();
  };
  // The binders' statements share their terms as a premise's do: no fact is
  // made among them, and one is read again only where `sharedReach` allows.
  // Bridges' `cap(c, y)` reads `has(c, y)` three times in one `where`.
  const benv: Env = { ...tenv, shared: { made: new Map() }, recheck };
  const foot = footprintOf(t, env);
  const footName = `${fnName}Footprint`;
  const visitAt = { slot: null as Slot | null, groups: new Map<string, string>() };
  if (foot !== null) {
    benv.visitBinder = t.binders[foot.sets?.length ?? 0];
    benv.visitAt = visitAt;
    env.used.add("type Footprint");
  }
  let params: string;
  if (onPlace) {
    const [first, ...rest] = t.binders;
    if (first === undefined || first.kind !== "in")
      throw new CompileError(
        `${t.id}: a technique run on ${t.on === "strike" ? "striking binds the struck" : "placing binds the placed"} cell first`,
      );
    const of = compileExpr(
      first.of,
      new Map(),
      { ...tenv, hoist: null, boardRoot: null },
      new Out(0),
    );
    const held = env.answerSort;
    if (!isSetOf(of.sort, held))
      throw new CompileError(`${t.id}: its first binder is not over ${held}s`);
    const sc = new Map<string, Val>([
      [first.name, { code: `v_${first.name}`, sort: elem(held), at: tenv.hoist.root }],
    ]);
    if (first.where !== null) {
      const w = compileExpr(first.where, sc, benv, body);
      expect(w, "bool", `where of ${first.name}`);
      body.emit(`if (!(${w.code})) return 0;`);
    }
    recheck.binders = rest;
    bindingLoops(rest, sc, benv, body, fire);
    params = `v_${first.name}: number, `;
  } else {
    recheck.binders = t.binders;
    bindingLoops(t.binders, new Map(), benv, body, fire);
    params = "";
  }
  const end = body.slot(0);
  body.emit("return fired;");
  // A read made again runs only once a fact has moved a count, so it is no
  // part of what a run costs.
  const growth = techniqueGrowth(body.text());
  // Before the `_visit` line, which reads what to visit and no mark.
  // A technique run on placing is not run again by a fixpoint, so where it
  // passed a binding over it runs again on the cell.
  const rerun = onPlace
    ? `${fnName}(b, sp, ${readsClues.yes ? "cl, " : ""}v_${t.binders[0].name}, fire)`
    : null;
  if (rechecked(recheck, body, rerun, env))
    end.lines.push({ indent: 0, text: `if (_stale) return ${rerun} | fired;` });
  freshChecked(recheck, t.id, env);
  if (foot !== null) {
    if (visitAt.slot === null)
      throw new CompileError(`${t.id}: its visited binder was not met`);
    // A set whose groups are not kept hands none, and its technique visits
    // every element each run.
    const groups = (foot.sets ?? []).map(
      (name) => visitAt.groups.get(`v_${name}`) ?? "undefined",
    );
    const args = groups.length === 0 ? footName : `${footName}, [${groups.join(", ")}]`;
    visitAt.slot.lines.push({
      indent: 0,
      text: `const _visit = fire === null ? (b.visit?.(${args}) ?? null) : null;`,
    });
  }
  if (readsCands.yes) {
    keep.lines.push(
      {
        indent: 0,
        text: `if (${buffer}.length < ${answerCount(env)}) ${buffer} = new Int32Array(${answerCount(env)});`,
      },
      { indent: 0, text: `const cands = ${buffer};` },
      { indent: 0, text: "cands.fill(-1);" },
    );
    for (const s of refills) s.lines.push({ indent: 0, text: "cands.fill(-1);" });
  }
  // A probe of the body's sorts may have called a function the body does
  // not.
  const called = body.text().join("\n");
  const maps = new Set(
    [...memos].flatMap(([name, m]) => (called.includes(`${name}(`) ? m : [])),
  );
  for (const m of maps)
    for (const s of [keep, ...refills])
      s.lines.push({ indent: 0, text: `${m}.clear();` });
  const clueParam = readsClues.yes ? "cl: Dealt, " : "";
  const text = [...scratch.map((d) => `  ${d}`), ...body.text()];
  // The generated code names nothing else `sp`, so a body that never says it
  // reads no geometry, and the parameter is marked unread.
  const spParam = text.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  if (growth > MAX_GROWTH)
    throw new CompileError(
      `${t.id}: its dearest read grows with the board as ${power(growth)}, past ${power(MAX_GROWTH)}: bind a set once outside the loops that read it, or keep what it reads (docs/descriptions.md § "What a technique compiles to")`,
    );
  if (t.says !== null)
    checkStated(t.id, t.says, saysFields.variants, tenv.factSays?.sorts ?? null);
  const lines = [
    `export interface ${bindingType} {`,
    ...fields,
    "}",
    "",
    ...(t.says === null
      ? []
      : [
          ...(tenv.factSays === undefined
            ? []
            : [
                `/** What a square the firing decides has of its own, read where it is made. */`,
                `export interface ${saysType}Fact {`,
                ...(tenv.factSays.says.words.length > 1
                  ? [
                      "  /** The index of the wording that held (`STATED`). */",
                      "  wording: number;",
                    ]
                  : []),
                `  terms: { ${tenv.factSays.fields.terms.join(" ")} };`,
                `  marks: { ${tenv.factSays.fields.marks.join(" ")} };`,
                "}",
                "",
              ]),
          `/** What a step for a firing of it speaks of: its terms, and the elements it marks by role${saysFields.variants[0].name === null ? "" : "; the arm that holds says which way it reads"}${tenv.factSays === undefined ? "" : "; and `facts`, what each of its facts has of its own"}. */`,
          ...(saysFields.variants[0].name === null
            ? [
                `export interface ${saysType} {`,
                `  terms: { ${saysFields.variants[0].terms.join(" ")} };`,
                `  marks: { ${saysFields.variants[0].marks.join(" ")} };`,
                ...(saysFields.variants[0].worded
                  ? [
                      "  /** The index of the wording that held (`STATED`). */",
                      "  wording: number;",
                    ]
                  : []),
                ...(tenv.factSays === undefined ? [] : [`  facts: ${saysType}Fact[];`]),
                ...(t.says.witness ? ["  witness: Witness | null;"] : []),
                ...(t.says.reads ? ["  reads: Reads;"] : []),
                "}",
              ]
            : [
                `export type ${saysType} =`,
                ...saysFields.variants.map(
                  (v) =>
                    `  | { arm: ${JSON.stringify(v.name)}; terms: { ${v.terms.join(" ")} }; marks: { ${v.marks.join(" ")} }${v.worded ? "; wording: number" : ""}${tenv.factSays === undefined ? "" : `; facts: ${saysType}Fact[]`}${t.says?.witness ? "; witness: Witness | null" : ""}${t.says?.reads ? "; reads: Reads" : ""} }`,
                ),
                ";",
              ]),
          "",
        ]),
    `const ${fnName}Facts: number[] = [];`,
    ...(tenv.factSays === undefined
      ? []
      : [`const ${fnName}FactSays: ${saysType}Fact[] = [];`]),
    ...(readsCands.yes ? [`let ${buffer} = new Int32Array(0);`] : []),
    ...held,
    ...(foot === null
      ? []
      : [
          "",
          "/** What a binding at one element of its first binder reads. */",
          `const ${footName}: Footprint = ${JSON.stringify(foot)};`,
        ]),
    "",
    `/** Its dearest read grows with the board as ${power(growth)}. */`,
    `export function ${fnName}(b: Marks, ${spParam}: GridSpace, ${clueParam}${params}fire: Fire<${bindingType}${t.says === null ? "" : `, ${saysType}`}> | null): number {`,
    ...text,
    "}",
  ];
  return { code: lines.join("\n"), clues: readsClues.yes };
}

/** Whether `e` makes a placement, in a definition it calls included. */
function places(e: Expr, env: Env): boolean {
  switch (e.k) {
    case "num":
    case "name":
      return false;
    case "set":
      return e.elems.some((x) => places(x, env));
    case "size":
    case "not":
    case "neg":
      return places(e.of, env);
    case "bin":
      return places(e.a, env) || places(e.b, env);
    case "with":
      return places(e.body, env);
    case "quant":
      return (
        e.binders.some(
          (b) => places(b.of, env) || (b.where !== null && places(b.where, env)),
        ) || places(e.body, env)
      );
    case "agg":
      return (
        e.binders.some((b) => places(b.of, env)) ||
        (e.term !== null && places(e.term, env))
      );
    case "call": {
      if (e.fn === "place") return true;
      const def = env.defs.get(e.fn);
      return (
        e.args.some((x) => places(x, env)) ||
        (def !== undefined && places(def.body, env))
      );
    }
  }
}

// --- modules ----------------------------------------------------------------

/** What a module needs from the runtime, as an import line: of the helpers
 * the compiler used, those its code still names, since a set compiled and
 * then read another way (`linkedAggregate`) is never written. */
function runtimeImport(
  used: ReadonlySet<string>,
  clueTypes: readonly string[],
  regions: boolean,
  runtime: string,
  body: string,
): string {
  const named = (n: string): boolean =>
    n.startsWith("type ") || new RegExp(`\\b${n}\\b`).test(body);
  const names = [
    ...clueTypes.map((t) => `type ${t}`),
    "type Fire",
    "type GridSpace",
    "type Marks",
    ...(regions ? ["type Partition"] : []),
    ...[...used].filter(named).sort(),
  ];
  const line = `import { ${names.join(", ")} } from "${runtime}";`;
  // Read once a module: under Vitest each read of `import.meta.env` is a
  // lookup, and in the stale-read guard's condition, in every binding, it
  // doubled the cost of a solve (2026-11-10). A build folds it to `false`
  // and drops the guard all the same.
  return names.includes("staleChecking")
    ? `${line}\n\nconst DEV = import.meta.env.DEV;`
    : line;
}

const HEADER = (source: string): string =>
  `// Compiled by \`npm run describe\` from ${source}: edit that, not this.`;

/** A library's techniques, each a function over any grid's units. */
export function compileLibrary(
  lib: LibraryJson,
  source: string,
  runtime: string,
): string {
  Out.reset();
  const used = new Set<string>();
  const env: Env = {
    defs: new Map(),
    clues: new Map(),
    regions: new Set(),
    boxes: null,
    diagonals: false,
    cellDomain: false,
    sizes: { names: new Set(), read: new Set() },
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: true,
    tiling: false,
    faces: null,
    answerSort: "cell",
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    boardRoot: null,
    epoch: null,
    prelude: null,
    relations: new Set(),
    edgeMark: null,
    edgeMarkSort: "edge",
    relation: null,
    cellMark: null,
    supposed: [],
    kept: null,
  };
  const parts = Object.entries(lib.techniques).map(([id, stated]) => {
    const t: Technique = { ...parseTechnique(lib.library, id, stated), ...UNPLACED };
    const out = compileTechnique(t, env);
    if (out.clues)
      throw new CompileError(
        `${lib.library}.${id}: a library technique reads no clues`,
      );
    return out.code;
  });
  const body = parts.join("\n\n");
  return `${[HEADER(source), "", runtimeImport(used, [], false, runtime, body), "", body].join("\n")}\n`;
}

/** The element sort a clue, or a clue at the board's field, sits at. */
function placeSort(what: string, at: string, env: Env): ElemSort {
  if (
    at === "edge" ||
    at === "cell" ||
    at === "line" ||
    at === "slot" ||
    at === "corner" ||
    at === "point" ||
    at === "center"
  )
    return at;
  if (env.tiling && (at === "face" || at === "angle")) return at;
  if (env.regions.has(at)) return `region ${at}`;
  throw new CompileError(`${what}: no element sort "${at}"`);
}

/** The sort of the members of `value`, a set, which may read `at`. */
function valuesSort(what: string, value: Expr, at: Sort | null, env: Env): Sort {
  // Compiled only for its sort, so what it would call is not imported, and
  // a mask it would make runs nowhere.
  const v = compileExpr(
    value,
    new Map(at === null ? [] : [["at", { code: "at", sort: at }]]),
    {
      ...env,
      wide: false,
      used: new Set(),
      readsClues: { yes: false },
      sizes: { ...env.sizes, read: new Set() },
    },
    new Out(0),
  );
  if (v.sort.k !== "set") throw new CompileError(`${what}: its values are not a set`);
  return v.sort.of;
}

/** The type a clue at the board is dealt as: how many there are, and each
 * field's values by clue, and by element where it is one an element, or
 * its list. */
function recordsType(fields: NonNullable<ClueKind["fields"]>): string {
  const parts = [...fields].map(
    ([name, f]) =>
      `readonly ${name}: readonly ${f.v.k === "list" ? "Int32Array" : f.at === null ? "number" : "(readonly number[])"}[]`,
  );
  return `{ readonly n: number; ${parts.join("; ")} }`;
}

/** The sorts of a clue kind's place and value, or of a clue at the board's
 * fields, from its declaration. */
function clueSorts(kind: string, c: DescribedClueKind, env: Env): ClueKind {
  if (c.value === null) {
    const fields = new Map<string, { at: ElemSort | null; v: Sort }>();
    for (const [name, f] of c.fields) {
      if (env.defs.has(name) || env.clues.has(name) || env.regions.has(name))
        throw new CompileError(`clue ${kind}: its field ${name} is named twice`);
      const at = f.at === null ? null : placeSort(`clue ${kind} ${name}`, f.at, env);
      const v = valuesSort(`clue ${kind} ${name}`, f.value, null, env);
      if (v.k !== "num")
        throw new CompileError(`clue ${kind} ${name}: its values are not numbers`);
      fields.set(name, { at, v: f.list ? { k: "list" } : v });
    }
    return { at: { k: "none" }, v: { k: "none" }, per: false, list: false, fields };
  }
  const at = elem(placeSort(`clue ${kind}`, c.at, env));
  const v = valuesSort(`clue ${kind}`, c.value, at, env);
  if (c.list && v.k !== "num")
    throw new CompileError(`clue ${kind}: a list holds numbers`);
  return { at, v: c.list ? { k: "list" } : v, per: c.per, list: c.list, fields: null };
}

/**
 * The ladder's order: the description's, but a technique a variation adds,
 * which the description lists after its own, goes before the first of a
 * higher tier on its scale, so a ladder in tier order stays in tier order
 * with the variation on.
 */
function rungOrder(
  techniques: readonly Technique[],
  addedBy: ReadonlyMap<string, string>,
): Technique[] {
  const out = techniques.filter((t) => !addedBy.has(t.id));
  for (const t of techniques.filter((x) => addedBy.has(x.id))) {
    const at = out.findIndex((x) => x.scale === t.scale && x.tier > t.tier);
    out.splice(at < 0 ? out.length : at, 0, t);
  }
  return out;
}

/**
 * A game's own techniques, its clue lists, and its ladder: every technique,
 * the library's it places included, by id and tier in the description's
 * order, which is the order a rung runs them in.
 */
export function compileGame(
  json: DescriptionJson,
  libraries: readonly LibraryJson[],
  source: string,
  runtime: string,
): string {
  Out.reset();
  const d = loadDescription(withEveryVariation(json), libraries);
  const used = new Set<string>();
  const clues = new Map<string, ClueKind>();
  const { space } = d.json;
  const grid = space.grid ?? null;
  const tiling = space.tiling !== undefined;
  if ([grid !== null, space.cells !== undefined, tiling].filter(Boolean).length !== 1)
    throw new CompileError(
      `${json.game}: a space is a grid, cells or a tiling, one of them`,
    );
  const relations = Object.keys(space.relations ?? {});
  const edgeMark = edgeMarkOf(d.json);
  const parts = Object.keys(space.regions ?? {});
  const unitParts = parts.filter((name) => space.units.includes(name));
  if (unitParts.length > 1)
    throw new CompileError(`${unitParts.join(", ")}: one partition among the units`);
  // A partition among the units is the space's boxes, dealt or not.
  const boxes = unitParts[0] ?? null;
  const regions = new Set(
    parts.filter((name) => name !== boxes && space.regions?.[name] === "dealt"),
  );
  for (const kind of d.clueKinds.keys())
    if (regions.has(kind))
      throw new CompileError(
        `${kind}: a partition and a clue kind are dealt by one name`,
      );
  const env: Env = {
    defs: d.defs,
    clues,
    regions,
    boxes,
    diagonals: space.diagonals === true,
    // A size the grid is not measured in: `order`, `w` and `h` are the
    // space's own.
    sizes: {
      names: new Set(
        Object.keys(d.json.sizes).filter(
          (n) =>
            grid === null ||
            (n !== "order" && n !== "w" && n !== "h" && n !== grid.w && n !== grid.h),
        ),
      ),
      read: new Set(),
    },
    cellDomain: false,
    used,
    concluding: false,
    answer: null,
    position: null,
    carrying: null,
    tables: new Map(),
    geometry: grid !== null || tiling,
    tiling,
    faces: null,
    answerSort: d.answerSort,
    to: d.to,
    wide: d.wide,
    memo: false,
    scratch: null,
    readsClues: { yes: false },
    hoist: null,
    boardRoot: null,
    epoch: null,
    prelude: null,
    relations: new Set(relations),
    edgeMark: edgeMark?.name ?? null,
    edgeMarkSort: edgeMark?.sort ?? "edge",
    relation: relationMarkOf(d.json),
    cellMark: cellMarkOf(d.json),
    supposed: [],
    kept: { defs: new Map(), used, terms: new Map() },
  };
  Out.own("", () => {
    for (const [kind, c] of d.clueKinds) clues.set(kind, clueSorts(kind, c, env));
  });
  const domainLines = Out.own("domainOf", () =>
    cellDomain(d.domain, env, d.json.sizes),
  );
  const own = d.techniques.filter((t) => !t.id.includes("."));
  const code = own.map((t) => compileTechnique(t, env).code);
  const kept = env.kept?.defs ?? new Map();
  for (const fn of kept.keys())
    if (own.some((t) => t.id === fn))
      throw new CompileError(`${fn}: a kept definition and a technique share the name`);
  code.push(...[...kept.values()].map((k) => k.code));
  const check = Out.own("isAnswer", () => answerCheck(json, d, env));
  const scales = Object.entries(d.json.scales ?? {});
  const sizes = [...env.sizes.read].sort();
  const clueLines =
    clues.size + regions.size + relations.length + sizes.length === 0
      ? []
      : [
          "/** What the board deals: its partitions by name, its relations, a set of",
          " * cells for each cell, its clues by kind, and the sizes a technique or the",
          " * rules read that the grid does not give. */",
          "export interface Dealt {",
          ...[...regions].map((r) => `  ${r}: Partition;`),
          ...relations.map((r) => `  readonly ${r}: readonly (readonly number[])[];`),
          ...[...clues].map(
            ([k, c]) =>
              `  ${k}: ${c.fields ? recordsType(c.fields) : c.list ? "ListClues" : "ClueList"};`,
          ),
          ...sizes.map((n) => `  ${n}: number;`),
          "}",
          "",
        ];
  const ids = d.techniques.filter((t) => t.on === null).map((t) => t.id);
  const placing = d.techniques.filter((t) => t.on === "place").map((t) => t.id);
  const striking = d.techniques.filter((t) => t.on === "strike").map((t) => t.id);
  // A technique a variation adds runs only on a board the variation is on.
  const addedBy = new Map<string, string>();
  for (const [name, v] of Object.entries(json.variations ?? {}))
    for (const t of v.add?.techniques ?? [])
      addedBy.set("use" in t ? t.use : t.id, name);
  const quoted = (xs: readonly string[]): string =>
    xs.length === 0 ? "never" : xs.map((id) => JSON.stringify(id)).join(" | ");
  const onCellEntry = (id: string): string => {
    const by = addedBy.get(id);
    const fields = [
      `id: ${JSON.stringify(id)}`,
      ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
    ];
    return `  { ${fields.join(", ")} },`;
  };
  const ladder = [
    "/** The units no value repeats in, in the description's order: the",
    " * engine builds the space from them. */",
    `export const units: readonly string[] = ${JSON.stringify(space.units)};`,
    "",
    ...(space.edges === "king"
      ? [
          "/** A diagonal neighbor is across an edge too: the engine builds the",
          " * space's edges by it. */",
          'export const edgeGeometry = "king";',
          "",
        ]
      : []),
    "/** Every technique a rung runs, by id: the description's, in its order. */",
    `export type LadderId = ${quoted(ids)};`,
    "",
    ...(own.some((t) => t.says !== null)
      ? [
          "/** What a firing of each technique that says anything says, by id. */",
          "export interface SaysById {",
          ...own
            .filter((t) => t.says !== null)
            .map((t) => `  ${t.id}: ${capitalized(t.id)}Says;`),
          "}",
          "",
          "/** The kinds of step a firing can be: a technique's id, and for one whose",
          " * `says` has arms, `<id>.<arm>` for each. */",
          `export const SAYS_KINDS = ${JSON.stringify(
            own.flatMap((t) =>
              t.says === null
                ? []
                : t.says.variants.map((v) =>
                    v.name === null ? t.id : `${t.id}.${v.name}`,
                  ),
            ),
          )} as const;`,
          "",
          ...statedTable(own),
          ...(own.some((t) => t.says?.each)
            ? [
                "/** The techniques whose step is made for each square the firing decides. */",
                `export const SAYS_EACH: readonly (keyof SaysById)[] = ${JSON.stringify(
                  own.filter((t) => t.says?.each).map((t) => t.id),
                )};`,
                "",
              ]
            : []),
          ...(own.some((t) => t.says?.legs)
            ? [
                "/** The techniques whose later squares' steps continue the first (a subset of",
                " * `SAYS_EACH`). */",
                `export const SAYS_LEGS: readonly (keyof SaysById)[] = ${JSON.stringify(
                  own.filter((t) => t.says?.legs).map((t) => t.id),
                )};`,
                "",
              ]
            : []),
        ]
      : []),
    "/** Every technique run as each value is placed, by id. */",
    `export type PlacingId = ${quoted(placing)};`,
    "",
    "/** The techniques run as each value is placed, in the description's order,",
    " * each with the variation that adds it where one does. */",
    "export const placing: readonly { id: PlacingId; variation?: string }[] = [",
    ...placing.map(onCellEntry),
    "];",
    "",
    "/** Every technique run as a value is struck from a cell, by id. */",
    `export type StrikingId = ${quoted(striking)};`,
    "",
    "/** The techniques run as a value is struck from a cell, in the",
    " * description's order, each with the variation that adds it where one",
    " * does. */",
    "export const striking: readonly { id: StrikingId; variation?: string }[] = [",
    ...striking.map(onCellEntry),
    "];",
    "",
    "/** The ladder: each technique's tier, on its scale where that is not the",
    " * description's tiers, the least cap it runs at where that is above its",
    " * tier, the cap from which it no longer runs where it has one, and the",
    " * variation that adds it where one does, in the order the description",
    " * lists them, a variation's before the first of a higher tier. */",
    "export const ladder: readonly { id: LadderId; tier: number; scale?: string; from?: number; until?: number; variation?: string }[] = [",
    ...rungOrder(
      d.techniques.filter((t) => t.on === null),
      addedBy,
    ).map((t) => {
      const by = addedBy.get(t.id);
      const fields = [
        `id: ${JSON.stringify(t.id)}`,
        `tier: ${t.tier}`,
        ...(t.scale === null ? [] : [`scale: ${JSON.stringify(t.scale)}`]),
        ...(t.from === null ? [] : [`from: ${t.from}`]),
        ...(t.until === null ? [] : [`until: ${t.until}`]),
        ...(by === undefined ? [] : [`variation: ${JSON.stringify(by)}`]),
      ];
      return `  { ${fields.join(", ")} },`;
    }),
    "];",
    "",
    `/** The description's tiers, by name. */`,
    `export const tiers: readonly string[] = ${JSON.stringify(d.tiers)};`,
    ...(scales.length === 0
      ? []
      : [
          "",
          "/** Its other scales' tiers, by scale. */",
          `export const scales: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(Object.fromEntries(scales))};`,
        ]),
  ];
  const body = [
    ...clueLines,
    ...ladder,
    ...domainLines,
    "",
    ...check,
    "",
    code.join("\n\n"),
  ].join("\n");
  return `${[
    HEADER(source),
    "",
    runtimeImport(
      used,
      [
        ...new Set(
          [...clues.values()].flatMap((c) =>
            c.fields !== null ? [] : [c.list ? "ListClues" : "ClueList"],
          ),
        ),
      ].sort(),
      regions.size > 0,
      runtime,
      body,
    ),
    "",
    body,
  ].join("\n")}\n`;
}

/**
 * The answer check: whether a whole grid, a value a cell and 0 where it has
 * none, is an answer to the board `cl` deals. Every cell holds a value of its
 * domain, and the shape, the rules and each dealt clue's meaning hold of it.
 * A rule a variation adds holds only where the board has the variation on,
 * as a technique a variation adds runs only there; a clue kind or partition
 * a variation adds is dealt empty where it is off.
 */
function answerCheck(json: DescriptionJson, d: Description, env: Env): string[] {
  const readsClues = { yes: false };
  const scratch: string[] = [];
  const cenv: Env = {
    ...env,
    answer: { repeats: d.repeat !== null },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
  const out = new Out(1);
  // A check reads a whole grid it never changes, so what a rule binds is
  // made once where it is bound: a set of edges is joined into groups there,
  // not walked again from each square (Rectangles' shape).
  cenv.hoist = { root: out.slot(0), loops: 0, marks: true };
  cenv.boardRoot = cenv.hoist.root;
  // A board of cells alone is measured in nothing.
  const { grid } = json.space;
  const measured = grid === undefined ? (e: Expr) => e : measuredBy(grid);
  const scope = new Map<string, Val>();
  out.open(`for (const cell of ${answerSet(env)}) {`);
  out.emit("const held = g[cell];");
  if (env.cellDomain) {
    readsClues.yes = true;
    out.emit(
      env.wide
        ? "if (!(held > 0 && domainOf(sp, cl, cell, held))) return false;"
        : "if (!(held > 0 && (domainOf(sp, cl, cell) >> held) & 1)) return false;",
    );
    out.close();
  } else {
    const at = new Out(1);
    const dom = compileExpr(measured(d.domain), scope, cenv, at);
    if (!isMask(dom.sort)) throw new CompileError("the domain is not a set of values");
    out.emit("if (!(held > 0 && (_domain >> held) & 1)) return false;");
    out.close();
    out.entries.unshift(...at.entries, {
      indent: 1,
      text: `const _domain = ${dom.code};`,
    });
    scope.set("domain", { code: "_domain", sort: setOf(NUM) });
  }
  if (d.repeat !== null) {
    const value = compileExpr(measured(d.repeat.value), scope, cenv, out);
    const times = compileExpr(measured(d.repeat.times), scope, cenv, out);
    out.emit(`const _repeat = ${value.code};`);
    out.emit(`const _times = ${times.code};`);
  }
  // A variation's own rules, each after the description's.
  const rules = [
    ...(json.shape ?? []).map((src) => ({ src, on: null as string | null })),
    ...Object.values(json.rules ?? {}).map((src) => ({ src, on: null })),
    ...Object.entries(json.variations ?? {}).flatMap(([name, v]) => [
      ...(v.add?.shape ?? []).map((src) => ({ src, on: name })),
      ...Object.values(v.add?.rules ?? {}).map((src) => ({ src, on: name })),
    ]),
  ];
  for (const { src, on } of rules) {
    if (on !== null) out.open(`if (variations.includes(${JSON.stringify(on)})) {`);
    const v = compileExpr(measured(parse(src)), scope, cenv, out);
    expect(v, "bool", `rule ${src}`);
    out.emit(`if (!(${v.code})) return false;`);
    if (on !== null) out.close();
  }
  for (const [kind, c] of d.clueKinds) {
    // A clue that says nothing of the answer itself (Signpost's arrow, which
    // the domain reads) holds of any.
    if (c.means.k === "name" && c.means.name === "true") continue;
    const sorts = env.clues.get(kind) as ClueKind;
    const k = Out.fresh("_k");
    const at = Out.fresh("_at");
    const v = Out.fresh("_v");
    const per = sorts.per ? Out.fresh("_per") : "";
    readsClues.yes = true;
    // A clue at the board is `k` in its meaning, its fields read of it.
    const own: [string, Val][] = sorts.fields
      ? [["k", { code: k, sort: elem(`clue ${kind}`) }]]
      : [
          ["at", { code: at, sort: sorts.at }],
          ["v", { code: v, sort: sorts.v }],
          ...(sorts.per ? [["per", { code: per, sort: NUM }] as [string, Val]] : []),
        ];
    out.open(
      `for (let ${k} = 0; ${k} < cl.${kind}.${sorts.fields ? "n" : "at.length"}; ${k}++) {`,
    );
    if (sorts.per) {
      cenv.used.add("perElement");
      cenv.used.add("perValue");
      out.emit(`const ${at} = perElement(cl.${kind}.at[${k}]);`);
      out.emit(`const ${per} = perValue(cl.${kind}.at[${k}]);`);
      out.emit(`const ${v} = cl.${kind}.v[${k}];`);
    } else if (!sorts.fields) {
      out.emit(`const ${at} = cl.${kind}.at[${k}];`);
      // A clue whose place is the whole of what it says (a block) has a value
      // its meaning never reads.
      if (reads(c.means, "v"))
        out.emit(`const ${v} = cl.${kind}.${sorts.list ? "lists" : "v"}[${k}];`);
    }
    const means = compileExpr(
      measured(c.means),
      new Map([...scope, ...own]),
      cenv,
      out,
    );
    expect(means, "bool", `clue ${kind}`);
    out.emit(`if (!(${means.code})) return false;`);
    out.close();
  }
  out.emit("return true;");
  const params = [
    "g: ArrayLike<number>",
    "sp: GridSpace",
    ...(readsClues.yes ? ["cl: Dealt"] : []),
    ...(rules.some((r) => r.on !== null) ? ["variations: readonly string[]"] : []),
  ];
  return [
    "/** Whether `g`, a value a cell and 0 where it has none, is an answer to the",
    " * board: every cell a value of its domain, and every rule and dealt clue",
    " * true of it, a variation's rules where `variations` has it on. */",
    `export function isAnswer(${params.join(", ")}): boolean {`,
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    "}",
  ];
}

/**
 * A formula with the space's own measures read off the grid: where the
 * description measures its grid in a term of other sizes (Solo's `c * r`),
 * that term is the grid's width or height.
 */
function measuredBy(grid: { w: string; h: string }): (e: Expr) => Expr {
  const w = JSON.stringify(parse(grid.w));
  const h = JSON.stringify(parse(grid.h));
  const go = (e: Expr): Expr => {
    // A grid one cell high is measured in no term: a 1 is a 1.
    if (e.k === "num") return e;
    const s = JSON.stringify(e);
    if (s === w) return { k: "name", name: "w" };
    if (s === h) return { k: "name", name: "h" };
    const opt = (x: Expr | null): Expr | null => (x === null ? null : go(x));
    const binders = (bs: readonly Binder[]): Binder[] =>
      bs.map((b) => ({ ...b, of: go(b.of), where: opt(b.where) }));
    switch (e.k) {
      case "name":
        return e;
      case "call":
        return { ...e, args: e.args.map(go) };
      case "set":
        return { ...e, elems: e.elems.map(go) };
      case "size":
      case "not":
      case "neg":
        return { ...e, of: go(e.of) };
      case "bin":
        return { ...e, a: go(e.a), b: go(e.b) };
      case "with":
        return { ...e, cell: go(e.cell), value: go(e.value), body: go(e.body) };
      case "quant":
        return { ...e, binders: binders(e.binders), body: go(e.body) };
      case "agg":
        return {
          ...e,
          binders: binders(e.binders),
          where: opt(e.where),
          term: opt(e.term),
        };
    }
  };
  return go;
}

/**
 * Where the answer's domain is a cell's (it reads `c`, as Seismic's is its
 * area's numbers), the function the engine seeds each cell's candidates
 * from, and `domain` alone is then refused in a technique; nothing where it
 * is the board's.
 */
function cellDomain(
  domain: Expr,
  env: Env,
  sizes: Readonly<Record<string, unknown>>,
): string[] {
  if (env.wide) return wideDomain(domain, env);
  const names = new Set<string>();
  freeNames(domain, names, new Set());
  // Solo's board is measured in a `c`, which is no cell.
  if (!names.has("c") || "c" in sizes) return [];
  env.cellDomain = true;
  const out = new Out(1);
  const scope = new Map<string, Val>([["c", { code: "v_c", sort: elem("cell") }]]);
  const v = compileExpr(domain, scope, env, out);
  if (!isMask(v.sort)) throw new CompileError("the domain is not a set of values");
  const cl = env.readsClues.yes ? "cl: Dealt, " : "_cl: Dealt, ";
  env.readsClues.yes = false;
  const body = [...out.text(), `  return ${v.code};`];
  const sp = body.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  return [
    "",
    "/** The values each cell may hold, by cell: its domain. */",
    `export function domainOf(${sp}: GridSpace, ${cl}v_c: number): number {`,
    ...body,
    "}",
  ];
}

/**
 * A wide domain, which no mask holds, as whether cell `c` may hold `d`: the
 * domain is `range(a, b)` or `{d in range(a, b) where P}`, so the engine
 * seeds each cell by asking it of every value. Always a cell's, so `domain`
 * alone is refused in a technique.
 */
function wideDomain(domain: Expr, env: Env): string[] {
  let range: Expr = domain;
  let d = "d";
  let where: Expr | null = null;
  if (domain.k === "agg" && domain.fn === "set" && domain.binders.length === 1) {
    const [bnd] = domain.binders;
    const term = domain.term;
    if (
      bnd.kind !== "in" ||
      (term !== null && !(term.k === "name" && term.name === bnd.name))
    )
      throw new CompileError(
        "a wide domain is `range(a, b)` or `{d in range(a, b) where P}`",
      );
    range = bnd.of;
    d = bnd.name;
    where = bnd.where ?? domain.where;
  }
  if (range.k !== "call" || range.fn !== "range" || range.args.length !== 2)
    throw new CompileError(
      "a wide domain is `range(a, b)` or `{d in range(a, b) where P}`",
    );
  env.cellDomain = true;
  const out = new Out(1);
  const scope = new Map<string, Val>([
    ["c", { code: "v_c", sort: elem("cell") }],
    [d, { code: "v_d", sort: NUM }],
  ]);
  const [a, b] = range.args.map((x) => {
    const t = once(compileExpr(x, scope, env, out), out);
    expect(t, "num", "range");
    return t.code;
  });
  out.emit(`if (v_d < ${a} || v_d > ${b}) return false;`);
  const p = where === null ? null : compileExpr(where, scope, env, out);
  if (p !== null) expect(p, "bool", "where");
  const cl = env.readsClues.yes ? "cl: Dealt, " : "_cl: Dealt, ";
  env.readsClues.yes = false;
  const body = [...out.text(), `  return ${p === null ? "true" : p.code};`];
  const sp = body.some((l) => /\bsp\b/.test(l)) ? "sp" : "_sp";
  return [
    "",
    "/** Whether cell `v_c` may hold `v_d`: its domain, wider than a mask. */",
    `export function domainOf(${sp}: GridSpace, ${cl}v_c: number, v_d: number): boolean {`,
    ...body,
    "}",
  ];
}

/** The expression compiler, for the position rules' compiler
 * (`compile-position.ts`), which writes other functions from the same
 * terms. */
export {
  bindingLoops,
  CompileError,
  compileExpr,
  type Env,
  expect,
  HEADER,
  type LayerSort,
  Out,
  type Sort,
  show,
  type Val,
};
