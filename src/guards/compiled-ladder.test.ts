/*
 * A ladder is compiled from a description, or it does not run.
 *
 * The runner takes `CompiledTechniques` and a ladder's entries are `Rung`s,
 * both brands only `ladder-runtime.ts` gives, so a technique a game writes by
 * hand does not typecheck. A cast is the one way past that, and this refuses
 * it outside the runtime and the test tools that wrap a compiled ladder.
 *
 * A cast is found in the syntax tree, to either brand as bound through its
 * import, however deep in the asserted type (`as Rung[]`).
 */
import ts from "typescript";
import { expect, it } from "vitest";
import {
  type ExportRef,
  parsed,
  resolveSpecifier,
  usesOf,
} from "../engine/testing/syntax.ts";

const sources = import.meta.glob<string>(["../**/*.ts", "!../**/*.test.ts"], {
  eager: true,
  query: "?raw",
  import: "default",
});

const RUNTIME = "src/engine/solve/ladder-runtime.ts";
/** The brands, by the module that declares each. */
const BRANDS: readonly ExportRef[] = [
  { module: "src/engine/solve/deduction-fixpoint.ts", name: "CompiledTechniques" },
  { module: RUNTIME, name: "Rung" },
];
/** Where a brand is given: the runtime, and a tool wrapping what it gave. */
const BRANDING = [RUNTIME, "src/engine/testing/ladder-continuity.ts"];

/** Whether `sf` asserts a value to a type holding either brand. */
function casts(sf: ts.SourceFile): boolean {
  return BRANDS.some((brand) =>
    usesOf(sf, brand).some(({ node }) => {
      let type: ts.Node = node;
      while (ts.isTypeNode(type.parent) || ts.isQualifiedName(type.parent))
        type = type.parent;
      const p = type.parent;
      return (
        (ts.isAsExpression(p) || ts.isTypeAssertionExpression(p)) && p.type === type
      );
    }),
  );
}

it("casts to a compiled ladder's brand only where the brand is given", () => {
  const trees = Object.entries(sources).map(([key, text]) =>
    parsed(resolveSpecifier("src/guards/x.ts", key), text),
  );
  expect(trees.length).toBeGreaterThan(100);
  for (const b of BRANDING)
    expect(
      trees.some((t) => t.fileName === b && casts(t)),
      b,
    ).toBe(true);
  const casting = trees
    .filter((t) => !BRANDING.includes(t.fileName) && casts(t))
    .map((t) => t.fileName);
  expect(casting).toEqual([]);
});
