/**
 * **Nothing re-derives the pixel-to-cell conversion.** `fromCoord`
 * (`geometry.ts`) is the collection's one spelling of it, and a game or a
 * shared helper that writes the floor out again is a second copy that can
 * come to differ in the border, which is the one place the spellings can
 * differ and a place a player presses.
 *
 * ON THE INSTRUMENT. This keys on the conversion's shape in the syntax tree:
 * a `Math.floor` or `Math.trunc` (or a `| 0`) whose argument's last operation
 * is a division by the tile size. **The tile size is recognized by the names it goes by**
 * ({@link TILE_SIZE}), which is the bound of what this sees: a draw state's
 * `tileSize` is the engine contract's own word, and `ts` and `tile` are the
 * locals the collection reads it into. A conversion dividing by a tile size
 * under another name is not seen here.
 *
 * A division that is not floored is not this conversion: a position that
 * keeps its fraction of a tile, or one rounded to the nearest tile.
 *
 * {@link OWN_CONVERSIONS} is a ledger held exact: a conversion with no entry
 * fails, and so does an entry whose line is gone.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { REGISTERED_IDS } from "../engine/testing/enrollment.ts";
import { nodesOf, parsed, resolveSpecifier } from "../engine/testing/syntax.ts";

/** Every game's sources, and the engine's own, where a helper several games
 * share can hold the same second copy. `geometry.ts` is the conversion. A
 * game born from its description has its sources written by the compiler. */
const sourceModules = import.meta.glob<string>(
  [
    "../games/**/*.ts",
    "../generated/games/**/*.ts",
    "../engine/**/*.ts",
    "!../engine/board/geometry.ts",
    "!../engine/testing/**",
  ],
  { query: "?raw", import: "default", eager: true },
);

/** The names a tile size goes by, as a local or as the member of a `ds.` or
 * `m.` it is read off. */
const TILE_SIZE = new Set(["ts", "tile", "tileSize"]);

/** `e` without the parentheses around it. */
function bare(e: ts.Expression): ts.Expression {
  return ts.isParenthesizedExpression(e) ? bare(e.expression) : e;
}

/** Whether `e`'s last operation is a division by the tile size. */
function endsInTileDivision(e: ts.Expression): boolean {
  const b = bare(e);
  if (!ts.isBinaryExpression(b) || b.operatorToken.kind !== ts.SyntaxKind.SlashToken)
    return false;
  const r = bare(b.right);
  const name = ts.isIdentifier(r)
    ? r.text
    : ts.isPropertyAccessExpression(r)
      ? r.name.text
      : null;
  return name !== null && TILE_SIZE.has(name);
}

/** Each floored division by the tile size in `sf`: `Math.floor(… / ts)`,
 * `Math.trunc(… / ts)`, or `(… / ts) | 0`. */
function flooredDivisions(sf: ts.SourceFile): ts.Node[] {
  return [...nodesOf(sf)].filter((n) => {
    if (ts.isCallExpression(n)) {
      const callee = n.expression;
      const [arg] = n.arguments;
      return (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === "Math" &&
        (callee.name.text === "floor" || callee.name.text === "trunc") &&
        arg !== undefined &&
        endsInTileDivision(arg)
      );
    }
    return (
      ts.isBinaryExpression(n) &&
      n.operatorToken.kind === ts.SyntaxKind.BarToken &&
      ts.isNumericLiteral(n.right) &&
      n.right.text === "0" &&
      endsInTileDivision(n.left)
    );
  });
}

/**
 * A game's own conversion, by the text of its line. `FOLDS` is the one
 * override of the cell index: a press in the top or left margin lands on the
 * first row or column the game draws there, where `fromCoord` answers one
 * further out. `SCALE` is not a cell index at all: a length changed between
 * pixels and a tiling's own units.
 */
const FOLDS = "folds a margin press onto the first row or column";
const SCALE = "a change of scale to or from a tiling's units";
const OWN_CONVERSIONS: Record<string, Record<string, typeof FOLDS | typeof SCALE>> = {
  "blackbox/index.ts": {
    "return Math.trunc((px - borderFor(ts)) / ts);": FOLDS,
  },
  "crossing/render.ts": {
    "return Math.trunc((pixel - border(ts)) / ts);": FOLDS,
  },
  "loopy/index.ts": {
    "const gx = Math.trunc(((p.x - border(tileSize)) * g.tileSize) / tileSize) + g.lowestX;":
      SCALE,
    "const gy = Math.trunc(((p.y - border(tileSize)) * g.tileSize) / tileSize) + g.lowestY;":
      SCALE,
  },
  "loopy/render.ts": {
    "w: Math.floor((g.xExtent * tileSize) / g.tileSize) + 2 * b + 1,": SCALE,
    "h: Math.floor((g.yExtent * tileSize) / g.tileSize) + 2 * b + 1,": SCALE,
  },
  "rome/index.ts": {
    "return Math.max(0, Math.floor((pixel - o) / ts));": FOLDS,
  },
};

interface Conversion {
  /** `<game>/<file>` for a game's source, `src/engine/<file>` for the
   * engine's. */
  file: string;
  line: number;
  /** The line the conversion starts on, trimmed: the ledger's key. */
  text: string;
  /** The lines of the file, for reading the comment over the conversion. */
  lines: readonly string[];
}

function conversions(): Conversion[] {
  const found: Conversion[] = [];
  for (const [key, raw] of Object.entries(sourceModules)) {
    if (key.endsWith(".test.ts")) continue;
    const path = resolveSpecifier("src/guards/x.ts", key);
    const file = path.replace(/^src\/games\//, "");
    const sf = parsed(path, raw);
    const lines = raw.split("\n");
    for (const n of flooredDivisions(sf)) {
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      found.push({ file, line, text: (lines[line - 1] ?? "").trim(), lines });
    }
  }
  return found;
}

describe("a game does not re-derive the pixel-to-cell conversion", () => {
  const all = conversions();

  it("read the games, and sees each shape it looks for", () => {
    const games = new Set(
      Object.keys(sourceModules).map((path) => /\/games\/([^/]+)\//.exec(path)?.[1]),
    );
    for (const id of REGISTERED_IDS) expect(games).toContain(id);
    // The shapes, on lines written here: an unmatched shape finds nothing
    // and every game passes.
    const planted = parsed(
      "src/games/plant/coord.ts",
      [
        "Math.floor((p.x - b) / ds.tileSize);",
        "Math.trunc(\n  (px - m.border) / // across lines\n  m.tile,\n);",
        "Math.floor(tileSize / 2);",
        "// Math.floor(x / ts)",
        "(py / ts) | 0;",
      ].join("\n"),
    );
    expect(flooredDivisions(planted).map((n) => n.getText())).toEqual([
      "Math.floor((p.x - b) / ds.tileSize)",
      "Math.trunc(\n  (px - m.border) / // across lines\n  m.tile,\n)",
      "(py / ts) | 0",
    ]);
    // And in the games: the ledger's own lines are found, checked below.
    expect(all.length).toBeGreaterThan(0);
  });

  it("holds every conversion a game writes out to a stated reason", () => {
    const unexplained = all.filter((c) => !(c.text in (OWN_CONVERSIONS[c.file] ?? {})));
    expect(
      unexplained.map((c) => `${c.file}:${c.line}  ${c.text}`),
      "call fromCoord (engine/board/geometry.ts) where the conversion is exactly it; " +
        "where it is not, say why at the site, naming fromCoord as declined, " +
        "and enter the line in OWN_CONVERSIONS",
    ).toEqual([]);
  });

  it("keeps the ledger to lines that are still there", () => {
    const stale = Object.entries(OWN_CONVERSIONS).flatMap(([file, entries]) =>
      Object.keys(entries)
        .filter((text) => !all.some((c) => c.file === file && c.text === text))
        .map((text) => `${file}: ${text}`),
    );
    expect(stale).toEqual([]);
  });

  it("finds the helper named beside every conversion that declines it", () => {
    // What the ledger says here, the site says to its reader: the comment
    // over a fold names `fromCoord` as what it declines. The game's own
    // function may be called `fromCoord` too, which is not that.
    const folds = all.filter((c) => OWN_CONVERSIONS[c.file]?.[c.text] === FOLDS);
    expect(folds.length).toBeGreaterThan(0);
    const silent = folds.filter((c) => {
      const above = c.lines.slice(Math.max(0, c.line - 16), c.line).join("\n");
      return !/\bfromCoord\b/.test(above.replace(/function fromCoord\w*\(/g, ""));
    });
    expect(silent.map((c) => `${c.file}:${c.line}  ${c.text}`)).toEqual([]);
  });
});
