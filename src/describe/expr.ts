/**
 * The formula syntax of a description (README.md § "The formula syntax"),
 * parsed to a tree the evaluator walks.
 *
 * It is `language.md`'s expression layer with one change: an aggregate is a
 * call, `count(c in L where P)`, so that how far its body reaches needs no
 * precedence rule.
 */

export type Expr =
  | { k: "num"; v: number }
  | { k: "name"; name: string }
  | { k: "call"; fn: string; args: Expr[] }
  | { k: "set"; elems: Expr[] }
  | { k: "size"; of: Expr }
  | { k: "not"; of: Expr }
  | { k: "neg"; of: Expr }
  | { k: "bin"; op: BinOp; a: Expr; b: Expr }
  | { k: "quant"; q: "forall" | "exists"; binders: Binder[]; body: Expr }
  | {
      k: "agg";
      fn: AggFn;
      binders: Binder[];
      /** `where`: which bindings count. */
      where: Expr | null;
      /** `of` (sum, prod, min, max) or `over` (distinct, set): the term. */
      term: Expr | null;
    };

export type BinOp =
  | "and"
  | "or"
  | "implies"
  | "iff"
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "in"
  | "notin"
  | "subset"
  | "+"
  | "-"
  | "*"
  | "/"
  | "mod";

export type AggFn =
  | "count"
  | "sum"
  | "prod"
  | "min"
  | "max"
  | "distinct"
  | "set"
  | "the";

/** `x in S`, `S` evaluated with the binders before it in scope, or `x = t`,
 * a name for a term; either may be followed by `where P`, which filters. */
export interface Binder {
  name: string;
  kind: "in" | "let";
  of: Expr;
  where: Expr | null;
}

const AGGS: ReadonlySet<string> = new Set([
  "count",
  "sum",
  "prod",
  "min",
  "max",
  "distinct",
  "set",
  "the",
]);
const KEYWORDS: ReadonlySet<string> = new Set([
  "and",
  "or",
  "not",
  "implies",
  "iff",
  "in",
  "subset",
  "forall",
  "exists",
  "where",
  "of",
  "over",
  "mod",
]);

interface Token {
  t: "num" | "id" | "op" | "end";
  s: string;
  at: number;
}

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  const ops = [
    "<=",
    ">=",
    "!=",
    "=",
    "<",
    ">",
    "+",
    "-",
    "*",
    "/",
    "(",
    ")",
    "{",
    "}",
    ",",
    ":",
    "|",
  ];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const m = /^[0-9]+/.exec(src.slice(i));
      if (m === null) throw new Error("unreachable");
      out.push({ t: "num", s: m[0], at: i });
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
      if (m === null) throw new Error("unreachable");
      out.push({ t: "id", s: m[0], at: i });
      i += m[0].length;
      continue;
    }
    const op = ops.find((o) => src.startsWith(o, i));
    if (op === undefined)
      throw new SyntaxError(`unexpected "${ch}" at ${i} in: ${src}`);
    out.push({ t: "op", s: op, at: i });
    i += op.length;
  }
  out.push({ t: "end", s: "", at: src.length });
  return out;
}

export function parse(src: string): Expr {
  const toks = tokenize(src);
  let p = 0;
  const peek = (): Token => toks[p];
  const fail = (what: string): never => {
    throw new SyntaxError(`${what} at ${peek().at} ("${peek().s}") in: ${src}`);
  };
  const isOp = (s: string): boolean => peek().t === "op" && peek().s === s;
  const isKw = (s: string): boolean => peek().t === "id" && peek().s === s;
  const eat = (s: string): void => {
    if (!(isOp(s) || isKw(s))) fail(`expected "${s}"`);
    p++;
  };
  const ident = (): string => {
    const tok = peek();
    if (tok.t !== "id" || KEYWORDS.has(tok.s)) fail("expected a name");
    p++;
    return tok.s;
  };

  // The binders of a quantifier or aggregate: `x in S [where P], y = t, ...`.
  // A binder's set is parsed below `in`, so `x in S where P` reads as hoped.
  function binders(): Binder[] {
    const out: Binder[] = [];
    for (;;) {
      const name = ident();
      let kind: Binder["kind"];
      if (isKw("in")) {
        p++;
        kind = "in";
      } else if (isOp("=")) {
        p++;
        kind = "let";
      } else return fail('expected "in" or "="');
      const of = additive();
      let where: Expr | null = null;
      if (isKw("where")) {
        p++;
        where = implication();
      }
      out.push({ name, kind, of, where });
      if (!isOp(",")) return out;
      // A comma inside binders starts another binder only if a name and
      // `in` or `=` follow; otherwise it ends them (an argument list).
      const next = toks[p + 1];
      const after = toks[p + 2];
      if (next?.t === "id" && (after?.s === "in" || after?.s === "=")) p++;
      else return out;
    }
  }

  function expr(): Expr {
    if (isKw("forall") || isKw("exists")) {
      const q = peek().s as "forall" | "exists";
      p++;
      const bs = binders();
      eat(":");
      return { k: "quant", q, binders: bs, body: expr() };
    }
    return iff();
  }
  function iff(): Expr {
    const a = implication();
    if (isKw("iff")) {
      p++;
      return { k: "bin", op: "iff", a, b: implication() };
    }
    return a;
  }
  function implication(): Expr {
    const a = disjunction();
    if (isKw("implies")) {
      p++;
      return {
        k: "bin",
        op: "implies",
        a,
        b: isKw("forall") || isKw("exists") ? expr() : implication(),
      };
    }
    return a;
  }
  function disjunction(): Expr {
    let a = conjunction();
    while (isKw("or")) {
      p++;
      a = { k: "bin", op: "or", a, b: conjunction() };
    }
    return a;
  }
  function conjunction(): Expr {
    let a = negation();
    while (isKw("and")) {
      p++;
      a = { k: "bin", op: "and", a, b: negation() };
    }
    return a;
  }
  function negation(): Expr {
    if (isKw("not")) {
      p++;
      return { k: "not", of: negation() };
    }
    if (isKw("forall") || isKw("exists")) return expr();
    return comparison();
  }
  function comparison(): Expr {
    const a = additive();
    const cmp = ["=", "!=", "<=", ">=", "<", ">"].find((o) => isOp(o));
    if (cmp !== undefined) {
      p++;
      return { k: "bin", op: cmp as BinOp, a, b: additive() };
    }
    if (isKw("in")) {
      p++;
      return { k: "bin", op: "in", a, b: additive() };
    }
    if (isKw("not") && toks[p + 1]?.s === "in") {
      p += 2;
      return { k: "bin", op: "notin", a, b: additive() };
    }
    if (isKw("subset")) {
      p++;
      return { k: "bin", op: "subset", a, b: additive() };
    }
    return a;
  }
  function additive(): Expr {
    let a = multiplicative();
    for (;;) {
      if (isOp("+") || isOp("-")) {
        const op = peek().s as "+" | "-";
        p++;
        a = { k: "bin", op, a, b: multiplicative() };
      } else return a;
    }
  }
  function multiplicative(): Expr {
    let a = unary();
    for (;;) {
      if (isOp("*") || isOp("/") || isKw("mod")) {
        const op = peek().s as "*" | "/" | "mod";
        p++;
        a = { k: "bin", op, a, b: unary() };
      } else return a;
    }
  }
  function unary(): Expr {
    if (isOp("-")) {
      p++;
      return { k: "neg", of: unary() };
    }
    return primary();
  }
  function primary(): Expr {
    const tok = peek();
    if (tok.t === "num") {
      p++;
      return { k: "num", v: Number(tok.s) };
    }
    if (isOp("(")) {
      p++;
      const e = expr();
      eat(")");
      return e;
    }
    if (isOp("|")) {
      p++;
      const e = additive();
      eat("|");
      return { k: "size", of: e };
    }
    if (isOp("{")) {
      p++;
      const elems: Expr[] = [];
      // `{x in S where P}` is a comprehension, `set(x over x in S where P)`.
      if (peek().t === "id" && toks[p + 1]?.s === "in") {
        const bs = binders();
        eat("}");
        const last = bs[0];
        return {
          k: "agg",
          fn: "set",
          binders: bs,
          where: null,
          term: { k: "name", name: last.name },
        };
      }
      if (!isOp("}")) {
        elems.push(additive());
        while (isOp(",")) {
          p++;
          elems.push(additive());
        }
      }
      eat("}");
      return { k: "set", elems };
    }
    if (tok.t === "id" && !KEYWORDS.has(tok.s)) {
      p++;
      if (!isOp("(")) return { k: "name", name: tok.s };
      p++;
      if (AGGS.has(tok.s)) return aggregate(tok.s as AggFn);
      const args: Expr[] = [];
      if (!isOp(")")) {
        args.push(expr());
        while (isOp(",")) {
          p++;
          args.push(expr());
        }
      }
      eat(")");
      return { k: "call", fn: tok.s, args };
    }
    return fail("expected a term");
  }
  // After `fn(`: `count(bs [where P])`, `sum(bs of t)`, `distinct(t over bs)`.
  function aggregate(fn: AggFn): Expr {
    if (fn === "distinct" || fn === "set") {
      const term = additive();
      eat("over");
      const bs = binders();
      eat(")");
      return { k: "agg", fn, binders: bs, where: null, term };
    }
    const bs = binders();
    let term: Expr | null = null;
    if (isKw("of")) {
      p++;
      term = additive();
    }
    eat(")");
    return { k: "agg", fn, binders: bs, where: null, term };
  }

  const e = expr();
  if (peek().t !== "end") fail("expected the end");
  return e;
}
