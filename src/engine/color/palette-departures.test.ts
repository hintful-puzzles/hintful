/**
 * **A departure from a shared role is stated at the assignment.**
 *
 * A "deliberately different" cursor in each of many games reads as many
 * decisions, when it is usually one decision plus collisions, and only a
 * stated reason tells them apart. This guard
 * reads every game's palette source and, for each slot whose *name* says what it
 * means — a cursor, a held or dragged item, a hint mark, a mistake — requires
 * either the shared role or a reason: a comment on the assignment, or on the
 * line above it.
 *
 * Keyed on the slot's index name because that is the only shape a palette
 * assignment has: `out[COL_CURSOR] = X` carries its meaning in `COL_CURSOR` and
 * nowhere else. A game that names a cursor slot something without "CURSOR" in it
 * is not seen here: that is a naming question, not a color one. The value is
 * read by what it refers to: `RED` is the export its identifier was imported
 * as, whatever it is called here.
 *
 * Three meanings the palette has a role for are left out, because no slot name
 * says them. `COL_DONE` is a retired clue in Towers and the rim of the solved
 * flash in Spokes; `COL_CORRECT` is a finished region in Rect and half of
 * Guess's `COL_CORRECTPLACE`, a feedback peg; and a black or a white piece is
 * `COL_BLACK` in one game and `COL_MINE` in the next. A check keyed on those
 * names would ask a reason of an assignment that departs from nothing.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import type { Color } from "../contract/types.ts";
import { gameSourceFiles, gameSyntax, REGISTERED_IDS } from "../testing/enrollment.ts";
import { colorToOKLCH } from "../testing/oklch.ts";
import { importedNames, nodesOf, parsed, where } from "../testing/syntax.ts";
import * as colors from "./colors.ts";
import * as palette from "./palette.ts";

/** A meaning, the slot names that say it, and the role(s) that cover it. */
const ROLES: Record<string, { slot: RegExp; roles: readonly string[] }> = {
  cursor: { slot: /CURSOR/, roles: ["CURSOR"] },
  held: { slot: /HELD/, roles: ["HELD"] },
  // A drag's origin is the thing picked up, so HELD covers a DRAG slot too.
  drag: { slot: /DRAG/, roles: ["DRAG_ADD", "DRAG_REMOVE", "HELD"] },
  hint: {
    slot: /HINT/,
    roles: ["HINT_RING", "HINT_OUTLINE", "HINT_STRIPES"],
  },
  mistake: { slot: /ERR|MISTAKE|WRONG/, roles: ["ERROR", "ERROR_TEXT", "ERROR_WASH"] },
};

const PALETTE = "src/engine/color/palette.ts";
const COLORS = "src/engine/color/colors.ts";

interface Assignment {
  game: string;
  /** `path:line`. */
  at: string;
  slot: string;
  /** The export the value refers to, or its source when it is no import. */
  value: string;
  explained: boolean;
}

/** Whether a comment stands on `node`'s line or the line above it, or inside
 * it: a leading comment starts on a line of its own, and a trailing one
 * follows on the same line. */
function commented(node: ts.Node): boolean {
  const text = node.getSourceFile().text;
  if ((ts.getLeadingCommentRanges(text, node.pos) ?? []).length > 0) return true;
  if ((ts.getTrailingCommentRanges(text, node.end) ?? []).length > 0) return true;
  const scanner = ts.createScanner(
    ts.ScriptTarget.ESNext,
    false,
    ts.LanguageVariant.Standard,
    text,
    undefined,
    node.getStart(),
    node.end - node.getStart(),
  );
  for (let k = scanner.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = scanner.scan())
    if (
      k === ts.SyntaxKind.SingleLineCommentTrivia ||
      k === ts.SyntaxKind.MultiLineCommentTrivia
    )
      return true;
  return false;
}

/** The export `expr` refers to through a named import, or its source. */
function exportedAs(expr: ts.Expression): string {
  if (!ts.isIdentifier(expr)) return expr.getText();
  for (const st of expr.getSourceFile().statements) {
    const b = ts.isImportDeclaration(st) ? st.importClause?.namedBindings : undefined;
    if (b === undefined || !ts.isNamedImports(b)) continue;
    const el = b.elements.find((e) => e.name.text === expr.text);
    if (el) return (el.propertyName ?? el.name).text;
  }
  return expr.text;
}

/** Every `x[COL_…] = value` in `trees`, under `game`. */
function assignmentsIn(game: string, trees: readonly ts.SourceFile[]): Assignment[] {
  const found: Assignment[] = [];
  for (const sf of trees)
    for (const n of nodesOf(sf)) {
      if (
        !ts.isBinaryExpression(n) ||
        n.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
        !ts.isElementAccessExpression(n.left) ||
        !ts.isIdentifier(n.left.argumentExpression) ||
        !n.left.argumentExpression.text.startsWith("COL_")
      )
        continue;
      const statement = ts.isExpressionStatement(n.parent) ? n.parent : n;
      found.push({
        game,
        at: where(n).replace(/^src\/games\//, ""),
        slot: n.left.argumentExpression.text,
        value: exportedAs(n.right),
        explained: commented(statement),
      });
    }
  return found;
}

/** The role slots `rolePalette` fills, which no game assigns: where a slot
 * holding its role is found once every game takes the role from there. */
const roleSlots: Assignment[] = Object.entries(
  import.meta.glob<string>("./roles.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
).flatMap(([, text]) =>
  assignmentsIn("roles", [parsed("src/engine/color/roles.ts", text)]),
);

describe("a departure from a shared role is stated at the assignment", () => {
  const all = [...gameSourceFiles.keys()].flatMap((id) =>
    assignmentsIn(id, gameSyntax(id)),
  );
  const byRole = Object.entries(ROLES).map(([meaning, { slot, roles }]) => ({
    meaning,
    roles,
    slots: all.filter((a) => slot.test(a.slot)),
  }));

  it("finds the game sources and the meaningful slots at all", () => {
    // An unmatched glob yields `{}` and every assertion below passes over
    // nothing. Every registered game contributes at least one assignment.
    const games = new Set(all.map((a) => a.game));
    expect([...games].sort()).toEqual(REGISTERED_IDS);
    // Each meaning is found under its slot name, and found holding its role,
    // in a game or in the role slots: a name that matched nothing, or a value
    // the comparison below could not recognize, would leave that meaning
    // unchecked or every game in breach.
    expect(roleSlots.length).toBeGreaterThan(0);
    for (const [meaning, { roles, slot }] of Object.entries(ROLES))
      expect(
        [...all, ...roleSlots].some(
          (a) => slot.test(a.slot) && roles.includes(a.value),
        ),
        `no ${meaning} slot holds its role`,
      ).toBe(true);
  });

  it("gives no mark the hue of a pair color the same board paints", () => {
    // The pair keeps off the hues of the *shared* marks (`palette.test.ts`),
    // and a departure can put a mark back on one: a purple cursor ring on the
    // purple wash of a finished region stands a hue of nothing apart from it.
    // So a game that takes the pair, a role defined over it or one of its
    // washes gives no slot named for a mark a color in either of its hues.
    const hue = (c: Color): number => colorToOKLCH(c)[2];
    const pairHued = Object.entries(colors)
      .filter(
        (entry): entry is [string, Color] =>
          Array.isArray(entry[1]) &&
          entry[1].length === 3 &&
          entry[1].every((channel) => typeof channel === "number"),
      )
      .filter(([, color]) => colors.TWO.some((member) => hue(member) === hue(color)))
      .map(([name]) => name);
    // Vacuity: the pair's own two names are among them.
    expect(pairHued.length).toBeGreaterThanOrEqual(colors.TWO.length);
    // `FLASH` is the pair's yellow and every game takes it, but it is on the
    // board only while the win flash crosses a solved one, where no mark is
    // waiting to be told from it. Counting it would put every game under
    // this rule for a color it shows for a third of a second.
    const overPair = Object.entries(palette)
      .filter(([, value]) =>
        [...colors.TWO, ...colors.TWO_WASH].some((member) => member === value),
      )
      .map(([name]) => name)
      .filter((name) => name !== "FLASH");
    expect(overPair).toContain("REGION_DONE");
    const pairNames = new Set(["TWO", "TWO_WASH", ...overPair]);
    const takesPair = (id: string): boolean =>
      gameSyntax(id).some((sf) =>
        [...importedNames(sf, COLORS), ...importedNames(sf, PALETTE)].some((n) =>
          pairNames.has(n),
        ),
      );
    expect(REGISTERED_IDS.filter(takesPair).length).toBeGreaterThan(0);

    const marks = Object.values(ROLES).map(({ slot }) => slot);
    const swallowed = all
      .filter((a) => marks.some((slot) => slot.test(a.slot)))
      .filter((a) => pairHued.includes(a.value))
      .filter((a) => takesPair(a.game));
    expect(swallowed.map((a) => `${a.at} ${a.slot} = ${a.value}`)).toEqual([]);
  });

  it.each(byRole)("$meaning: the role, or a reason", ({ roles, slots }) => {
    const unexplained = slots.filter(
      (a) => !roles.some((r) => a.value === r) && !a.explained,
    );
    expect(unexplained.map((a) => `${a.at} ${a.slot} = ${a.value}`)).toEqual([]);
  });
});
