/**
 * **The two color-scheme defaults must agree**, because they run at different
 * moments and disagreement is visible as a flash.
 *
 * `color-scheme-init.ts` is inlined into every page's `<head>` and runs before
 * anything else, precisely so the first paint is already the right scheme. It
 * cannot read the settings store — that is Dexie, and it is asynchronous — so
 * it carries its own copy of the default. `settings.ts` then loads and applies
 * the stored preference, or the store's default if there is none.
 *
 * If the two copies differ, a player with no stored preference gets the init
 * script's answer painted and the store's answer a moment later: a flash of the
 * wrong scheme on every cold load, for exactly the players who never touched
 * the setting. That is most of them.
 *
 * The check reads both files' syntax trees, because the drift is two
 * spellings of one decision in two files, and the init script cannot be
 * imported here — it has top-level side effects on `document`.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { nodesOf, parsed } from "./engine/testing/syntax.ts";

const sources = import.meta.glob<string>("./{color-scheme-init,store/settings}.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

const initTree = parsed(
  "src/color-scheme-init.ts",
  sources["./color-scheme-init.ts"] ?? "",
);
const settingsTree = parsed(
  "src/store/settings.ts",
  sources["./store/settings.ts"] ?? "",
);

/** The init script's default: `defaultIsDark`'s initializer, as written. */
function initDefault(): string | null {
  for (const n of nodesOf(initTree))
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.name.text === "defaultIsDark" &&
      n.initializer !== undefined
    )
      return n.initializer.getText();
  return null;
}

/** The store's default: the `default` its `colorScheme` setting is
 * decorated with. */
function storeDefault(): string | null {
  for (const n of nodesOf(settingsTree)) {
    if (
      !ts.isPropertyDeclaration(n) ||
      !ts.isIdentifier(n.name) ||
      n.name.text !== "colorScheme"
    )
      continue;
    for (const d of ts.getDecorators(n) ?? []) {
      const call = d.expression;
      const [options] = ts.isCallExpression(call) ? call.arguments : [];
      if (options === undefined || !ts.isObjectLiteralExpression(options)) continue;
      for (const p of options.properties)
        if (
          ts.isPropertyAssignment(p) &&
          ts.isIdentifier(p.name) &&
          p.name.text === "default" &&
          ts.isStringLiteral(p.initializer)
        )
          return p.initializer.text;
    }
  }
  return null;
}

describe("the color-scheme default is one decision", () => {
  it("the early-paint script and the settings store default to the same scheme", () => {
    // `null` in the init script means "ask the system"; "system" is the store's
    // word for the same thing. The mapping is spelled out rather than inferred,
    // so a third value added later fails here instead of silently comparing
    // unequal strings.
    const init = initDefault();
    expect(init, "no `defaultIsDark` in color-scheme-init.ts").not.toBeNull();
    const store = storeDefault();
    expect(store, "no colorScheme default in settings.ts").not.toBeNull();

    const asStoreWord = { null: "system", true: "dark", false: "light" } as const;
    expect(
      asStoreWord[init as keyof typeof asStoreWord],
      "the inlined early-paint script and the settings store disagree about " +
        "the default color scheme, so a player with no stored preference sees " +
        "one scheme painted and the other applied a moment later",
    ).toBe(store);
  });
});
