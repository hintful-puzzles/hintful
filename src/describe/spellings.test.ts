/**
 * Two spellings of one rule compile to one analysis (the
 * `described-fill-game` requirement of that name): a statement that reads a
 * set or a term through a definition with no parameters, and the same
 * statement with the definition's body written in its place, give the same
 * violation check, code for code; and so do the loop rules written another
 * way round (`docs/descriptions.md` § "Where a rule breaks").
 */
import { describe, expect, it } from "vitest";
import { type DescriptionJson, isFormal } from "./description.ts";
import { loadDescriptionFile } from "./load.ts";
import { compileSource, compiles } from "./sources.ts";

const texts = import.meta.glob<string>("../**/*.description.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});
const sources = new Map(
  Object.entries(texts).map(([p, t]) => {
    const path = `src/${p.slice("../".length)}`;
    return [path, loadDescriptionFile(t, path)] as const;
  }),
);

/** The module's `violations`, its fresh names numbered by first use, so two
 * modules whose earlier code took a different count of them compare. */
function violationsOf(module: string): string {
  const from = module.indexOf("export function violations(");
  const to = module.indexOf("\n}\n", from);
  expect(from).toBeGreaterThan(0);
  const fresh = new Map<string, string>();
  return module
    .slice(from, to)
    .replace(/\b(_[A-Za-z]+)(\d+)\b/g, (_, stem: string, n: string) => {
      const key = stem + n;
      if (!fresh.has(key)) fresh.set(key, `${stem}#${fresh.size}`);
      return fresh.get(key) as string;
    });
}

/** `src` with each name of `names` read as an expression (not called, not a
 * field) written as `(body)`: the count replaced, and the text. */
function writtenInPlace(
  src: string,
  names: ReadonlyMap<string, string>,
): { text: string; n: number } {
  let n = 0;
  const text = src.replace(
    /(?<![.\w])([A-Za-z_]\w*)\b(?!\s*\()/g,
    (m, name: string) => {
      const body = names.get(name);
      if (body === undefined) return m;
      n++;
      return `(${body})`;
    },
  );
  return { text, n };
}

const cases = [...sources].flatMap(([source, file]) => {
  if (!compiles(file) || !isFormal(file)) return [];
  const named = new Map(
    Object.entries(file.define ?? {}).filter(([head]) => /^\w+$/.test(head)),
  );
  if (named.size === 0) return [];
  let n = 0;
  const inPlace = (rec: Readonly<Record<string, string>>): Record<string, string> =>
    Object.fromEntries(
      Object.entries(rec).map(([k, v]) => {
        const w = writtenInPlace(v, named);
        n += w.n;
        return [k, w.text];
      }),
    );
  const shape = file.shape?.map((s) => {
    const w = writtenInPlace(s, named);
    n += w.n;
    return w.text;
  });
  const variant: DescriptionJson = {
    ...file,
    shape,
    ...(file.rules === undefined ? {} : { rules: inPlace(file.rules) }),
    ...(file.implied === undefined ? {} : { implied: inPlace(file.implied) }),
  };
  return n === 0 ? [] : [{ source, variant, n }];
});

describe("two spellings of one rule compile to one analysis", () => {
  it("finds the statements that read a named set or term", () => {
    // Range's `unshaded`, Separate's `joined`, Boats' total and the rest.
    expect(cases.length).toBeGreaterThanOrEqual(4);
  });

  it.each(cases)("$source, its $n named reads written in place", ({
    source,
    variant,
  }) => {
    const named = compileSource(source, sources);
    const inPlace = compileSource(source, new Map([...sources, [source, variant]]));
    expect(violationsOf(inPlace)).toBe(violationsOf(named));
  });
});

/** The violation check of `source` with its `implied.noLoop` written `text`
 * (as it stands where `null`), with `define` added. */
function respelled(
  source: string,
  text: string | null,
  define: Record<string, string> = {},
): string {
  const file = sources.get(source);
  const stated =
    file !== undefined && isFormal(file) ? file.implied?.["noLoop"] : undefined;
  if (file === undefined || !isFormal(file) || stated === undefined)
    throw new Error(`${source} states no noLoop`);
  const variant: DescriptionJson = {
    ...file,
    define: { ...file.define, ...define },
    implied: { ...file.implied, noLoop: text ?? stated },
  };
  return violationsOf(compileSource(source, new Map([...sources, [source, variant]])));
}

describe("a loop rule is read by its structure", () => {
  const PATH = "src/games/path/path.description.yaml";
  const SLANT = "src/games/slant/slant.description.yaml";
  const DRAWN = { drawn: "{x in edges where value(x) = 1}" };
  it.each([
    [
      "its conjuncts turned round",
      "forall e in edges where value(e) = 1: end1(e) not in through(end2(e), {x in edges where e != x and 1 = value(x)})",
      {},
    ],
    [
      "its where as an implication",
      "forall e in edges: value(e) = 1 implies end2(e) not in through(end1(e), {y in edges where value(y) = 1 and y != e})",
      {},
    ],
    [
      "its set named",
      "forall e in drawn: end2(e) not in through(end1(e), drawn - {e})",
      DRAWN,
    ],
  ])("Path's, %s", (_, text, define) => {
    const stated = respelled(PATH, null);
    expect(stated).toContain("cycleEdges(");
    expect(respelled(PATH, text, define)).toBe(stated);
  });

  it.each([
    [
      "its equation turned round",
      "forall c in cells, k in {p in points(c) where value(c) = slash(c, p)}, q in before(k, {r in points(c) where slash(c, r) = value(c)}): q not in linked(k, c)",
      {},
    ],
    [
      "its points named",
      "forall c in cells, k in joins(c), q in before(k, joins(c)): q not in linked(k, c)",
      { "joins(c)": "{p in points(c) where slash(c, p) = value(c)}" },
    ],
  ])("Slant's, %s", (_, text, define) => {
    const stated = respelled(SLANT, null);
    expect(stated).toContain("cycleDiagonals(");
    expect(respelled(SLANT, text, define)).toBe(stated);
  });
});
