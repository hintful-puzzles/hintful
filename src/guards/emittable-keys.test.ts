/**
 * **A game and the frontend must agree about input** — two source scans that no
 * behavioral test can replace, because each asserts the *absence* of something.
 *
 * ## 1. No game may test a button code this frontend cannot send
 *
 * Invisible from every other angle. A game's own tests feed `interpretMove` the
 * button directly, so an arm testing `8` handles `8` perfectly and passes. A
 * `Midend`-level sweep does the same. The defect is not in the game at all — it
 * is that nothing upstream of it ever emits that code, so the arm is a **key
 * that can never fire**, and the only symptom is a player pressing a key and
 * nothing happening.
 *
 * Three disguises:
 *
 * - `MOD_NUM_KEYPAD | '7'` — the frontend does set the bit, but a numpad key
 *   only arrives as a digit with Num Lock on, so a keypad-only arm is one most
 *   players cannot reach;
 * - `button == ' '` — Space arrives as `CURSOR_SELECT2`;
 * - `button === 8` for Backspace — the key map sends **127**.
 *
 * ## 2. No game may privately restate what `engine/input/pointer.ts` already owns
 *
 * §1's defect starts as a local copy of a frontend fact — `const BACKSPACE = 8`
 * beside the code that uses it. The copies are how the collection drifts.
 *
 * So this asserts the general rule rather than re-listing victims: a game may
 * not declare a name one of the engine's **fact modules** exports —
 * `pointer.ts`, `decimal.ts`, `desc-alphabet.ts` and `run-length.ts`, the
 * modules holding facts no game may restate. The names are
 * derived from each module's actual export list, so a helper added there is
 * guarded the day it lands — nobody has to remember this test exists. The list
 * of modules is an input this scan consumes, not a statement about any game.
 *
 * ## 3. The digit keys are guarded in `decimal.test.ts`
 *
 * The one fact §2 cannot see, because it has no name to shadow: *which codes
 * are the digit keys*. That scan keys on a digit code as any operand in any
 * game source, so a helper receiving the button under another name cannot hide
 * one, and it lives beside the fact it guards.
 *
 * See docs/input.md § "The numeric keypad never arrives".
 */

import ts from "typescript";
import { describe, expect, it } from "vitest";
import { PuzzleButton } from "../engine/contract/types.ts";
import * as decimal from "../engine/decimal.ts";
import * as descAlphabet from "../engine/desc-alphabet.ts";
import { puzzleKeyMap } from "../engine/input/key-map.ts";
import * as pointer from "../engine/input/pointer.ts";
import { BACKSPACE, DELETE, ESCAPE } from "../engine/input/pointer.ts";
import * as runLength from "../engine/run-length.ts";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";
import {
  nodesOf,
  parsed,
  resolveSpecifier,
  shown,
  usesOf,
  where,
} from "../engine/testing/syntax.ts";

/**
 * Game sources, read as syntax trees.
 *
 * A glob is not an import specifier, so a bulk rewriter that repoints imports
 * after a file move leaves it behind — and an unmatched glob yields `{}`, so
 * every assertion below would pass over nothing. That is what the vacuity
 * assertions are for.
 */
const gameModules = import.meta.glob<string>("../games/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * The engine modules holding facts no game may restate. A module is here
 * because a game restating what it owns is the defect §2 guards; what each
 * exports is read off the module itself.
 */
const FACT_MODULES: readonly Record<string, unknown>[] = [
  pointer,
  decimal,
  descAlphabet,
  runLength,
];

/** The names a game's button goes by where it is compared against a code:
 * `interpretMove`'s parameter and the locals it is read into. The bound of
 * what §1 sees, as `coord-conversion.test.ts`'s tile size is. */
const BUTTON = new Set(["button", "btn", "raw", "rawButton", "key"]);

const isButton = (e: ts.Expression): boolean =>
  ts.isIdentifier(e) && BUTTON.has(e.text);

const EQUALITY = new Set([
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
]);

/** What a button is compared against in `sf`: each `button === x` (either
 * way round) and each `case x:` of a `switch (button)`, with `x`. */
function buttonComparisons(
  sf: ts.SourceFile,
): { node: ts.Node; other: ts.Expression }[] {
  const out: { node: ts.Node; other: ts.Expression }[] = [];
  for (const n of nodesOf(sf)) {
    if (ts.isBinaryExpression(n) && EQUALITY.has(n.operatorToken.kind)) {
      if (isButton(n.left)) out.push({ node: n, other: n.right });
      else if (isButton(n.right)) out.push({ node: n, other: n.left });
    } else if (ts.isSwitchStatement(n) && isButton(n.expression)) {
      for (const clause of n.caseBlock.clauses)
        if (ts.isCaseClause(clause))
          out.push({ node: clause, other: clause.expression });
    }
  }
  return out;
}

/** The numeric literals a button is compared against in `sf`. */
function numericComparisons(sf: ts.SourceFile): { node: ts.Node; code: number }[] {
  return buttonComparisons(sf).flatMap(({ node, other }) =>
    ts.isNumericLiteral(other) ? [{ node, code: Number(other.text) }] : [],
  );
}

/**
 * Every code the **on-screen key panel** can deliver, read from the live
 * registry. `puzzle-keys` sends a `KeyLabel.button` straight to
 * `Puzzle.processKey`, so the panel is a second emitter and the key map is not
 * the whole frontend: a game's `clearKey` can send a code the key map never
 * does.
 *
 * Derived rather than listed, so a game that adds a bespoke key is covered on
 * the day it registers.
 */
function panelCodesByGame(): Map<string, Set<number>> {
  const byGame = new Map<string, Set<number>>();
  for (const [id, game] of REGISTERED_GAMES) {
    if (!game.requestKeys) continue;
    byGame.set(
      id,
      new Set(game.requestKeys(game.defaultParams()).map((k) => k.button)),
    );
  }
  return byGame;
}

/** `src/games/unruly/index.ts` → `unruly`. */
function gameIdOf(path: string): string {
  return /^src\/games\/([^/]+)\//.exec(path)?.[1] ?? "";
}

/**
 * Every code the key map can deliver, read off the map itself
 * (`engine/input/key-map.ts`, which the view reads).
 *
 * Printable characters (32..126) are excluded from the analysis entirely: the
 * view falls through to "any single character → its char code", so every one
 * of them is emittable and a game testing `'m'` is fine.
 */
const emittableFromKeyMap = new Set<number>(Object.values(puzzleKeyMap));

/** Every non-test `.ts` file under `src/games/`, parsed. */
const sources: ts.SourceFile[] = Object.entries(gameModules)
  .filter(([key]) => !key.includes(".test."))
  .map(([key, text]) => parsed(resolveSpecifier("src/guards/x.ts", key), text));

const at = (n: ts.Node): string => `${where(n)}  ${shown(n)}`;

describe("no game tests a button this frontend cannot send", () => {
  const panels = panelCodesByGame();
  /**
   * What can reach *this* game. The keyboard half is the same for everyone; the
   * panel half is not — `clearKey`'s button 8 reaches Abcd, which puts it on
   * its keypad, and reaches Unruly not at all, because Unruly has no keypad.
   * Taking the union across the collection instead would have excused exactly
   * the defect this scan exists to find.
   */
  const emittable = (path: string) =>
    new Set([...emittableFromKeyMap, ...(panels.get(gameIdOf(path)) ?? [])]);

  it("reads a plausible key map and a plausible set of game sources", () => {
    expect(emittableFromKeyMap.size).toBeGreaterThanOrEqual(8);
    expect(emittableFromKeyMap).toContain(DELETE);
    expect(emittableFromKeyMap).toContain(ESCAPE);
    expect(emittableFromKeyMap).toContain(PuzzleButton.CURSOR_UP);
    expect(sources.length).toBeGreaterThan(200);
    // …and the panel half, which would otherwise contribute nothing silently
    // if the registry were empty at collection time. The path→id mapping is
    // asserted too: a glob whose shape changed would key every lookup on `""`
    // and quietly hand every game an empty panel.
    expect(panels.size).toBeGreaterThanOrEqual(12);
    expect(gameIdOf("src/games/unruly/index.ts")).toBe("unruly");
    expect(new Set(sources.map((f) => gameIdOf(f.fileName))).size).toBeGreaterThan(50);
  });

  it("finds the comparisons it claims to check", () => {
    // The second half of the vacuity guard, and the one that matters more: the
    // codes above are useless if nothing is scanned against them. Games do
    // compare buttons to numeric literals — letter keys, the digits going
    // through `digitOf` — and if that stops being true this scan has gone stale
    // rather than the collection having become clean.
    expect(sources.flatMap(numericComparisons).length).toBeGreaterThan(10);
  });

  it("has no comparison against an unsendable control code", () => {
    // `switch (button) { case 8: … }` compares a button against a control code
    // exactly as `button === 8` does, and shipped a live defect a scan for the
    // `===` alone could not see: Unruly's `decideValue` carried `case 8:` for
    // months *after* the collection-wide erase-key sweep had "fixed" it — its
    // `interpretMove` gate called `isEraseKey`, so `DELETE` (127) passed the
    // gate, reached the switch, matched nothing and fell through to `default`.
    // A `case` cannot call a predicate, so the correct form spells both codes
    // (`case BACKSPACE: case DELETE:`).
    const dead: string[] = [];
    for (const sf of sources) {
      const reachable = emittable(sf.fileName);
      for (const { node, code } of numericComparisons(sf)) {
        // Printable ASCII always reaches games via the char-code fallback.
        if (code >= 32 && code <= 126) continue;
        if (reachable.has(code)) continue;
        dead.push(at(node));
      }
    }

    // **The keyboard cannot send 8; a keypad game's own panel can.**
    // `puzzleKeyMap` maps Backspace to 127, so a keyboard player never produces
    // upstream's `'\b'` — but `key-labels.ts`'s `clearKey` carries `button: 8`,
    // and on touch that panel is the only clear route there is. So the code is
    // reachable in Abcd, which offers it, and unreachable in Unruly, which has
    // no panel at all — which is why the set above is per-game and not a union
    // over the collection. A game with both meanings still wants `isEraseKey` /
    // `isCancelKey`, since a bare comparison is half-wired whichever half it
    // picks.
    expect(emittableFromKeyMap.has(BACKSPACE)).toBe(false);
    expect(emittable("src/games/abcd/index.ts").has(BACKSPACE)).toBe(true);
    expect(emittable("src/games/unruly/index.ts").has(BACKSPACE)).toBe(false);
    expect(dead).toEqual([]);
  });

  it("finds the switch-on-button cases it claims to check", () => {
    // Vacuity for the second shape, on the same terms as the first: if no file
    // switches on a button, this scan has gone stale rather than the collection
    // having become clean. (The population shrinks as games hand their buttons
    // to the target-verb model, which is why this is not a fixed count.)
    const subjects = sources.filter((sf) =>
      [...nodesOf(sf)].some((n) => ts.isSwitchStatement(n) && isButton(n.expression)),
    );
    expect(subjects.length).toBeGreaterThan(0);
    // No numeric label is left in the population — the last three were Unruly's
    // `'0'`, `'1'`, `'2'`, retired by `digitOf` — so the scan is proved on
    // planted code instead of on a floor the collection would have to fail to
    // keep: a label after a nested block, a comparison written backwards, and
    // neither in a comment.
    const planted = parsed(
      "src/games/plant/keys.ts",
      [
        "switch (button) {",
        "  case CURSOR_SELECT: {",
        "    if (x) { y(); }",
        "    break;",
        "  }",
        "  case 8:",
        "    return EMPTY;",
        "}",
        "if (27 === btn) z();",
        "// button === 9",
      ].join("\n"),
    );
    expect(
      numericComparisons(planted).map(({ node, code }) => [at(node), code]),
    ).toEqual([
      ["src/games/plant/keys.ts:6  case 8: return EMPTY;", 8],
      ["src/games/plant/keys.ts:9  27 === btn", 27],
    ]);
  });

  it("writes the named buttons by name, not as magic numbers", () => {
    // `button === 0x0209` *works* — it is `CURSOR_UP` — so this is not a
    // correctness bug today. It is the same drift that produced every entry
    // above: a game restating the shared vocabulary locally, where a rename or
    // a renumber in `pointer.ts` cannot reach it. Map, Rectangles and Tracks
    // each spelled all four arrow keys this way, two of them with the constant's
    // name in a trailing comment — which is a name that cannot be grepped, cannot
    // be renamed, and cannot be wrong out loud.
    const magic = sources
      .flatMap(numericComparisons)
      .filter(({ code }) => code >= 0x200 && emittableFromKeyMap.has(code))
      .map(({ node }) => at(node));
    expect(magic).toEqual([]);
  });

  it("has no named constant standing in for an unsendable code", () => {
    // The literal scan above cannot see `const KEY_BACKSPACE = 8; … button ===
    // KEY_BACKSPACE`.
    //
    // **The constant's NAME does not identify it**: matching on BACKSPACE,
    // DELETE, ESCAPE misses `const CLEAR = 8`, and would measure a neighbor of
    // the thing it guards. What identifies the defect is the *value*, and what
    // separates it from the many
    // legitimate `= 8`s (`COL_CURSOR`, `DIR_MAX`, `F_DOT_BLACK`) is that the
    // constant is then **compared against a button**. So match on both.
    const copies: string[] = [];
    for (const sf of sources) {
      const compared = new Set(
        buttonComparisons(sf).flatMap(({ other }) =>
          ts.isIdentifier(other) ? [other.text] : [],
        ),
      );
      for (const n of nodesOf(sf))
        if (
          ts.isVariableDeclaration(n) &&
          ts.isIdentifier(n.name) &&
          n.initializer !== undefined &&
          ts.isNumericLiteral(n.initializer) &&
          [8, 27].includes(Number(n.initializer.text)) &&
          compared.has(n.name.text)
        )
          copies.push(at(n));
    }
    expect(copies).toEqual([]);
  });

  it("keeps `MOD_NUM_KEYPAD` bindings paired with a bare-key route", () => {
    // **Not** because the modifier is dead. `docs/input.md` said for a
    // long time that "this web frontend does not set `MOD_NUM_KEYPAD`", and
    // that is false — `view-interactive.ts` sets it from
    // `event.location === 3`, and has since the initial webapp version. Cube
    // has a passing test asserting `MOD_NUM_KEYPAD | 0x38` steers the cube, and
    // Bricks calls the bit "load-bearing for the diagonals". An audit acting on
    // the doc would have deleted working code as dead.
    //
    // The real gap is narrower and still worth guarding: a numpad key only
    // arrives as a *digit* when Num Lock is on (with it off, numpad 7 is
    // `event.key === "Home"`, which the key map does not carry and the
    // char-code fallback rejects for being longer than one character), and a
    // laptop may have no numpad at all. So a keypad binding must never be the
    // *only* route to an input — which is what Inertia's diagonals were.
    const POINTER = "src/engine/input/pointer.ts";
    const cursorKeys = Object.keys(pointer).filter((n) => n.startsWith("CURSOR_"));
    let binders = 0;
    for (const sf of sources) {
      // A binding is the bit or'ed with a key's code, either way round; a mask
      // (`~MOD_MASK | MOD_NUM_KEYPAD`) and the bit forced onto a bare button
      // (`button | MOD_NUM_KEYPAD`) bind no key.
      const binds = usesOf(sf, { module: POINTER, name: "MOD_NUM_KEYPAD" }).some(
        ({ node }) => {
          const p = node.parent;
          if (
            !ts.isBinaryExpression(p) ||
            p.operatorToken.kind !== ts.SyntaxKind.BarToken
          )
            return false;
          return ts.isNumericLiteral(p.left === node ? p.right : p.left);
        },
      );
      if (!binds) continue;
      // The bare form of the same key must be accepted somewhere in the file:
      // a named cursor key compared with the button; `digitOf`, which looks
      // through the keypad bit and so is a bare-key route by construction; or
      // a hand-off to the target-verb model, whose arrows and Enter reach every
      // target (Twiddle's keypad turns a block the cursor can reach and Enter
      // turns).
      const cursorCompared = buttonComparisons(sf).some(({ other }) =>
        cursorKeys.some((name) =>
          usesOf(sf, { module: POINTER, name }).some(({ node }) => node === other),
        ),
      );
      const called = (module: string, name: string): boolean =>
        usesOf(sf, { module, name }).some((u) => u.kind === "call");
      expect(
        cursorCompared ||
          called(POINTER, "digitOf") ||
          called("src/engine/input/target-verb.ts", "interpretTargetVerbs"),
        `${sf.fileName} binds MOD_NUM_KEYPAD with no bare-key route`,
      ).toBe(true);
      binders++;
    }
    // Losing the last binder, or the bit moving out of `pointer.ts`, would
    // leave this green over nothing.
    expect(binders, "no game binds MOD_NUM_KEYPAD at all").toBeGreaterThan(0);
  });
});

describe("no game privately restates what an engine fact module owns", () => {
  /** Every value the fact modules export, read off the modules. Deriving
   * the list rather than writing one is the point: a helper added there is
   * guarded on the day it lands, with nobody remembering to extend this. */
  const exported = new Set(FACT_MODULES.flatMap((m) => Object.keys(m)));

  it("reads a plausible export list", () => {
    // Vacuity: an empty set would make the sweep below pass over nothing.
    expect(exported.size).toBeGreaterThanOrEqual(20);
    for (const name of [
      "isMouseDown",
      "isEraseKey",
      "gridCursorMove",
      "LEFT_BUTTON",
      "isDigit",
      "parseLeadingInt",
      "n2c",
      "scanRunLength",
    ])
      expect(exported).toContain(name);
  });

  it("finds no game-local declaration shadowing one", () => {
    // A function or a variable declared under the name, at any depth: a
    // local copy inside a function is as private as one at the top.
    const shadows: string[] = [];
    for (const sf of sources)
      for (const n of nodesOf(sf))
        if (
          (ts.isFunctionDeclaration(n) || ts.isVariableDeclaration(n)) &&
          n.name !== undefined &&
          ts.isIdentifier(n.name) &&
          exported.has(n.name.text)
        )
          shadows.push(`${where(n)}  ${n.name.text}`);
    // Group, Tents and Untangle each carried their own `isMouseDown` family —
    // survivors of the promotion that removed 27 other copies — and when the
    // scan widened to `decimal.ts` it found nine `isDigit`s and Unequal's
    // `n2c`/`c2n` on the first run. A private copy is not wrong today; it is
    // wrong the day the shared one changes, silently, in whichever games kept
    // theirs.
    expect(shadows).toEqual([]);
  });
});
