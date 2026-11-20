/*
 * A game's own hint refusal is about that game, and every refusal's verdict is
 * its advice.
 *
 * `HintRefusal`'s type already keeps a game from returning a sentence it
 * typed: the only ways to make one are `hint-refusal.ts`'s kinds and the
 * dead-end escapes, `puzzleDeadEnd` and `markedDeadEnd`. What the type cannot
 * see is a sentence passed through an escape that another game also passes, or
 * that spells out a kind, so this reads every escape call in the tree and holds
 * each one to what the escape is for:
 *
 *  - **used by one game only.** Two games refusing for the same reason is a
 *    situation the collection has, which is what a kind is. No roster says
 *    which reasons are genuine; the sharing does.
 *  - **not a kind's words.**
 *  - **a dead end's words**: it tells the player to undo, as every kind
 *    `isDeadEnd` calls one does, and no other kind does.
 *
 * ON THE INSTRUMENT: keyed on a call of either escape, bound through its
 * import, wherever it appears, including the engine's hint builders. A
 * template's words are read with each substitution as a hole, a
 * `markedDeadEnd`'s through its `phrase` template,
 * and a call whose argument is none of these fails, since its sentence could
 * not be read.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  FIX_MISTAKES_FIRST,
  GAME_OVER,
  type HintRefusal,
  isDeadEnd,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
} from "./hint-refusal.ts";
import { NO_SOLUTION_FROM_HERE, SOLUTION_UNKNOWN } from "./solve-failure.ts";
import { parsed, resolveSpecifier, usesOf, where } from "./testing/syntax.ts";

const sources = {
  ...import.meta.glob<string>("../games/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("./**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

/** Every kind a game's `hint` can return. */
const REFUSAL_KINDS: readonly HintRefusal[] = [
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  GAME_OVER,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
  NO_SOLUTION_FROM_HERE,
  SOLUTION_UNKNOWN,
];

const KINDS = new Set<string>([...REFUSAL_KINDS, ALREADY_SOLVED, FIX_MISTAKES_FIRST]);

/** A sentence whose advice is to go back: one of its sentences opens "Undo". */
const SAYS_UNDO = /(?:^|[.:!] )Undo\b/;

/** A template's words, with each substitution written `${…}`. Built from its
 * parts so it reads as the text it is, not as a template missing its backticks. */
const HOLE = `$${"{…}"}`;

const ESCAPES = new Set(["puzzleDeadEnd", "markedDeadEnd"]);

interface Call {
  /** The sentence, or `null` when the argument cannot be read. */
  sentence: string | null;
  /** The escape called. */
  via: string;
  owner: string;
  where: string;
}

/** `src/games/<id>/…` belongs to `<id>`; anything else to the engine. */
function ownerOf(path: string): string {
  return /^src\/games\/([^/]+)\//.exec(path)?.[1] ?? "engine";
}

const REFUSAL = "src/engine/hint-refusal.ts";
const PHRASE = { module: "src/engine/hint-words.ts", name: "phrase" };

function templateText(t: ts.TemplateLiteral): string {
  if (ts.isNoSubstitutionTemplateLiteral(t)) return t.text;
  return t.head.text + t.templateSpans.map((s) => HOLE + s.literal.text).join("");
}

function sentenceOf(via: string, arg?: ts.Expression): string | null {
  if (!arg) return null;
  if (via === "markedDeadEnd") {
    const tagged =
      ts.isTaggedTemplateExpression(arg) &&
      usesOf(arg.getSourceFile(), PHRASE).some(({ node }) => node === arg.tag);
    return tagged ? templateText(arg.template) : null;
  }
  if (ts.isStringLiteral(arg)) return arg.text;
  if (ts.isNoSubstitutionTemplateLiteral(arg) || ts.isTemplateExpression(arg))
    return templateText(arg);
  return null;
}

const calls: Call[] = [];
let filesScanned = 0;
for (const [key, text] of Object.entries(sources)) {
  const path = resolveSpecifier("src/engine/x.ts", key);
  if (path.endsWith(".test.ts") || path === REFUSAL) continue;
  filesScanned++;
  const sf = parsed(path, text);
  // Bound through the import, so a renamed import is read and a local
  // function of the same name is not.
  for (const via of ESCAPES)
    for (const { node, kind } of usesOf(sf, { module: REFUSAL, name: via })) {
      if (kind !== "call") continue;
      const call = node.parent as ts.CallExpression;
      calls.push({
        sentence: sentenceOf(via, call.arguments[0]),
        via,
        owner: ownerOf(path),
        where: where(call),
      });
    }
}

describe("a game's own hint refusal", () => {
  it("is not vacuous — the tree was read and the escapes' calls were found", () => {
    // An unmatched glob yields `{}`, and every assertion below would then pass
    // over nothing. Inertia's two sentences, one marked, and Pegs' marked
    // template are the known positives.
    expect(filesScanned).toBeGreaterThan(300);
    expect(calls.filter((c) => c.owner === "inertia").length).toBeGreaterThanOrEqual(2);
    expect(calls.some((c) => c.via === "markedDeadEnd" && c.owner === "pegs")).toBe(
      true,
    );
    expect(calls.some((c) => c.sentence?.includes(HOLE))).toBe(true);
  });

  it("is a sentence the scan can read", () => {
    const unread = calls.filter((c) => c.sentence === null).map((c) => c.where);
    expect(
      unread,
      "pass puzzleDeadEnd a string literal or template, and markedDeadEnd a phrase template",
    ).toEqual([]);
  });

  it("belongs to one game: a reason two games give is a kind", () => {
    const owners = new Map<string, Set<string>>();
    for (const c of calls) {
      if (c.sentence === null) continue;
      const set = owners.get(c.sentence) ?? new Set<string>();
      set.add(c.owner);
      owners.set(c.sentence, set);
    }
    const shared = [...owners]
      .filter(([, games]) => games.size > 1)
      .map(([s, games]) => `${JSON.stringify(s)}: ${[...games].sort().join(", ")}`);
    expect(shared, "add a kind to hint-refusal.ts for these").toEqual([]);
  });

  it("is not a kind spelled out", () => {
    const copies = calls.flatMap(({ sentence, where }) =>
      sentence !== null && KINDS.has(sentence) ? [where] : [],
    );
    expect(copies, "use the kind itself").toEqual([]);
  });

  it("is a dead end, so it tells the player to undo", () => {
    const silent = calls.flatMap(({ sentence, where }) =>
      sentence !== null && !SAYS_UNDO.test(sentence) ? [`${where}: ${sentence}`] : [],
    );
    expect(silent).toEqual([]);
  });
});

describe("a refusal kind's verdict", () => {
  it("is a dead end exactly when its advice is to undo", () => {
    const wrong = REFUSAL_KINDS.filter((k) => isDeadEnd(k) !== SAYS_UNDO.test(k));
    expect(wrong).toEqual([]);
    // Both verdicts are present, so the comparison above can fail either way.
    expect(REFUSAL_KINDS.filter(isDeadEnd).length).toBeGreaterThan(0);
    expect(REFUSAL_KINDS.filter((k) => !isDeadEnd(k)).length).toBeGreaterThan(0);
  });
});
