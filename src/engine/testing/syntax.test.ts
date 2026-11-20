import type ts from "typescript";
import { describe, expect, it } from "vitest";
import { gamesUsing } from "./enrollment.ts";
import {
  declarationOf,
  importedModules,
  importedNames,
  parsed,
  resolveSpecifier,
  usesOf,
} from "./syntax.ts";

const REF = { module: "src/engine/border-grid.ts", name: "borderGridVerbs" };

let planted = 0;
/** The kinds of every use of {@link REF} in `text`, written at a game's path. */
const kinds = (text: string): string[] =>
  usesOf(parsed(`src/games/plant/case${planted++}.ts`, text), REF).map((u) => u.kind);

describe("a use of an export is bound through its import", () => {
  it("counts a renamed import and a namespace import", () => {
    expect(
      kinds(
        'import { borderGridVerbs as v } from "../../engine/border-grid.ts"; v(); v;',
      ),
    ).toEqual(["call", "reference"]);
    expect(
      kinds(
        'import * as bg from "../../engine/border-grid.ts"; new bg.borderGridVerbs();',
      ),
    ).toEqual(["new"]);
  });

  it("does not count the name bound from elsewhere, written in a comment or a string, or spelled as a member", () => {
    expect(
      kinds(
        'import { borderGridVerbs } from "./mine.ts"; borderGridVerbs();\n' +
          "// borderGridVerbs();\n" +
          'const s = "borderGridVerbs()"; x.borderGridVerbs(); y = { borderGridVerbs: 1 };',
      ),
    ).toEqual([]);
  });

  it("counts the export's own module by name", () => {
    const text = "export const borderGridVerbs = 1; f(borderGridVerbs);";
    expect(usesOf(parsed(REF.module, text), REF).map((u) => u.kind)).toEqual([
      "reference",
      "reference",
    ]);
  });
});

describe("a module's imports", () => {
  it("resolve against the importing file", () => {
    expect(resolveSpecifier("src/games/x/index.ts", "../../engine/a/b.ts")).toBe(
      "src/engine/a/b.ts",
    );
    expect(resolveSpecifier("src/engine/x.ts", "./y.ts")).toBe("src/engine/y.ts");
    expect(resolveSpecifier("src/engine/x.ts", "typescript")).toBe("typescript");
  });

  it("leave out a type-only import when asked for what survives compilation", () => {
    const sf = parsed(
      "src/games/plant/imports.ts",
      'import type { A } from "./a.ts";\nimport { type B } from "./b.ts";\n' +
        'import { type C, d } from "./c.ts";\nimport "./e.ts";\nexport type { F } from "./f.ts";',
    );
    expect(importedModules(sf).length).toBe(5);
    expect(
      importedNames(
        parsed(
          "src/games/plant/names.ts",
          'import { a as x, b } from "./c.ts";\nimport * as ns from "./c.ts";\nimport { d } from "./e.ts";',
        ),
        "src/games/plant/c.ts",
      ),
    ).toEqual(["a", "b"]);
    expect(importedModules(sf, true)).toEqual([
      "src/games/plant/c.ts",
      "src/games/plant/e.ts",
    ]);
  });
});

describe("a name's declaration", () => {
  it("is followed through an import, a renaming and both kinds of re-export", () => {
    const trees = new Map(
      Object.entries({
        "src/plant/use.ts":
          'import { f as g, K } from "./barrel.ts";\nfunction own() {}\n',
        "src/plant/barrel.ts":
          'export { h as f } from "./impl.ts";\nexport * from "./k.ts";',
        "src/plant/impl.ts": 'export function h() { return "h"; }',
        "src/plant/k.ts": 'export const K = "k";',
      }).map(([path, text]) => [path, parsed(path, text)]),
    );
    const at = (path: string) => trees.get(path) ?? null;
    const use = trees.get("src/plant/use.ts") as ts.SourceFile;
    const g = declarationOf(use, "g", at);
    expect(g?.kind === "function" && g.fn.getSourceFile().fileName).toBe(
      "src/plant/impl.ts",
    );
    const k = declarationOf(use, "K", at);
    expect(k?.kind === "const" && k.init.getText()).toBe('"k"');
    expect(declarationOf(use, "own", at)?.kind).toBe("function");
    expect(declarationOf(use, "nothing", at)).toBeNull();
  });
});

describe("a guard keyed on an export", () => {
  it("refuses an export no game uses, rather than reading an empty population as health", () => {
    expect(() => gamesUsing(["palisade"], { ...REF, name: "borderGridVerbz" })).toThrow(
      /renamed or moved/,
    );
    expect(gamesUsing(["palisade"], REF)).toEqual(["palisade"]);
  });
});
