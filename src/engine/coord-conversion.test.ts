/**
 * **Nothing re-derives the pixel-to-cell conversion.** `fromCoord`
 * (`geometry.ts`) is the collection's one spelling of it, and a game or a
 * shared helper that writes the floor out again is a second copy that can
 * come to differ in the border, which is the one place the spellings can
 * differ and a place a player presses.
 *
 * ON THE INSTRUMENT. This keys on the conversion's shape in source: a
 * `Math.floor` or `Math.trunc` (or a `| 0`) whose argument ends in a division
 * by the tile size. **The tile size is recognized by the names it goes by**
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
import { describe, expect, it } from "vitest";
import { registeredGameIds } from "./registry.ts";
import "../games/index.ts";

/** Every game's sources, and the engine's own, where a helper several games
 * share can hold the same second copy. `geometry.ts` is the conversion. */
const sourceModules = import.meta.glob<string>(
  ["../games/**/*.ts", "./**/*.ts", "!./geometry.ts", "!./testing/**"],
  { query: "?raw", import: "default", eager: true },
);

/** The names a tile size goes by, after any `ds.` or `m.` it is read off. */
const TILE_SIZE = String.raw`(?:[\w.]+\.)?(?:ts|tile|tileSize)`;
/** An argument whose last operation is a division by the tile size. */
const ENDS_IN_TILE_DIVISION = new RegExp(String.raw`\/\s*${TILE_SIZE}\s*$`);
const FLOORED_BY_OR = new RegExp(
  String.raw`\(([^()]*\/\s*${TILE_SIZE})\s*\)\s*\|\s*0`,
  "g",
);

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
  "group/render.ts": {
    "return Math.trunc((px + (ts - border(ts) - legend(ts))) / ts) - 1;": FOLDS,
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
  "mathrax/render.ts": {
    "return Math.trunc((v - origin(ts)) / ts);": FOLDS,
  },
  "rome/index.ts": {
    "return Math.max(0, Math.floor((pixel - o) / ts));": FOLDS,
  },
  "seismic/render.ts": {
    "return Math.trunc((v - origin(ts)) / ts);": FOLDS,
  },
  "undead/index.ts": {
    "x: Math.trunc((p.x - border - 1) / ts),": FOLDS,
    "y: Math.trunc((p.y - border - 2) / ts) - 1,": FOLDS,
  },
};

/** Blank out comments, keeping every offset, so prose about a division is not
 * read as one. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
}

/** The argument of the call whose opening parenthesis is at `open`. */
function argumentAt(src: string, open: number): string {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "(") depth++;
    if (src[i] === ")" && --depth === 0) return src.slice(open + 1, i);
  }
  return "";
}

interface Conversion {
  /** `<game>/<file>` for a game's source, `./<file>` for the engine's. */
  file: string;
  line: number;
  text: string;
  /** The lines of the file, for reading the comment over the conversion. */
  lines: readonly string[];
}

function conversions(): Conversion[] {
  const found: Conversion[] = [];
  for (const [path, raw] of Object.entries(sourceModules)) {
    if (path.endsWith(".test.ts")) continue;
    const file = path.replace("../games/", "");
    const src = code(raw);
    const lines = raw.split("\n");
    const at = (offset: number): Conversion => {
      const line = src.slice(0, offset).split("\n").length;
      return { file, line, text: lines[line - 1].trim(), lines };
    };
    for (const call of src.matchAll(/Math\.(?:floor|trunc)\(/g)) {
      const open = call.index + call[0].length - 1;
      if (ENDS_IN_TILE_DIVISION.test(argumentAt(src, open))) found.push(at(call.index));
    }
    for (const or of src.matchAll(FLOORED_BY_OR)) found.push(at(or.index));
  }
  return found;
}

describe("a game does not re-derive the pixel-to-cell conversion", () => {
  const all = conversions();

  it("read the games, and sees each shape it looks for", () => {
    const games = new Set(Object.keys(sourceModules).map((path) => path.split("/")[2]));
    for (const id of registeredGameIds()) expect(games).toContain(id);
    // The shapes, on lines written here: an unmatched pattern finds nothing
    // and every game passes.
    expect(ENDS_IN_TILE_DIVISION.test("(p.x - b) / ds.tileSize")).toBe(true);
    expect(ENDS_IN_TILE_DIVISION.test("(px - m.border) / m.tile")).toBe(true);
    expect(ENDS_IN_TILE_DIVISION.test("tileSize / 2")).toBe(false);
    expect("(py / ts) | 0".match(FLOORED_BY_OR)).toHaveLength(1);
    // And in the games: the ledger's own lines are found, checked below.
    expect(all.length).toBeGreaterThan(0);
  });

  it("holds every conversion a game writes out to a stated reason", () => {
    const unexplained = all.filter((c) => !(c.text in (OWN_CONVERSIONS[c.file] ?? {})));
    expect(
      unexplained.map((c) => `${c.file}:${c.line}  ${c.text}`),
      "call fromCoord (engine/geometry.ts) where the conversion is exactly it; " +
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
