/**
 * Each capability a born game names is tested on a fixture: a description
 * under `src/engine/testing/fixtures/` that names no game, so its tests show
 * another game can adopt it (the `testing` spec's "A capability is tested on
 * a description of its own").
 *
 * A capability is what a description names for the engine to run: a key of
 * `play`, of `deal`, of `deal.sample` or of `space` and `space.grid` that the
 * description schema names (a `deal` key it does not name is prose, how a
 * clue is dealt), a painter (`paint`), what it `produces` and its `freedom`.
 * The compiler's builtins are not counted: each call is run on boards by the
 * soundness check of the technique that makes it (`docs/descriptions.md`
 * § "Checking a technique sound").
 *
 * The fixtures name a capability; a test runs it. So each fixture is held to
 * a test file that imports its compiled module for a value.
 */

import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import schema from "../describe/description.schema.json";
import { compiledPath } from "../describe/sources.ts";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { expectLedger } from "../engine/testing/ledger.ts";
import { testFilesImporting } from "../engine/testing/test-source.ts";

const fixtureTexts = import.meta.glob<string>(
  "../engine/testing/fixtures/*/*.description.yaml",
  { query: "?raw", import: "default", eager: true },
);
const FIXTURES = Object.entries(fixtureTexts).map(([key, text]) => ({
  source: key.replace(/^(\.\.\/)+/, "src/"),
  description: parse(text, { version: "1.2", schema: "core" }) as Record<
    string,
    unknown
  >,
}));

/** The capabilities each fixture does not cover yet, while a born game names
 * them. Each leaves as a fixture names it. */
const NO_FIXTURE_YET: readonly string[] = [
  "deal.grow",
  "deal.hideFlag",
  "deal.latin",
  "deal.leaves",
  "deal.never",
  "deal.oneIn",
  "deal.options",
  "deal.sample.climb",
  "deal.sample.dominoes",
  "deal.sample.first",
  "deal.sample.mend",
  "deal.sample.picture",
  "deal.sample.pieces",
  "deal.stripFrom",
  "deal.symmetric",
  "deal.thorough",
  "deal.unpair",
  "deal.withhold",
  "play.plain",
  "play.shape",
  "play.tally",
  "play.wash",
  "produces: links",
  "space.grid.hexagon",
  "space.regions",
];

type Json = Readonly<Record<string, unknown>>;

const isObject = (x: unknown): x is Json =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** The property names a schema node gives, through its `oneOf`, `anyOf` and
 * `allOf`. */
function named(node: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (n: unknown): void => {
    if (!isObject(n)) return;
    if (isObject(n["properties"]))
      for (const k of Object.keys(n["properties"])) out.add(k);
    for (const k of ["oneOf", "anyOf", "allOf"])
      for (const m of (n[k] as unknown[] | undefined) ?? []) walk(m);
  };
  walk(node);
  return out;
}

const game = (schema.$defs.game as Json)["properties"] as Json;
const deal = game["deal"] as Json;
const SECTIONS: readonly { path: readonly string[]; keys: Set<string> }[] = [
  { path: ["play"], keys: named(game["play"]) },
  { path: ["deal"], keys: named(deal) },
  { path: ["deal", "sample"], keys: named((deal["properties"] as Json)["sample"]) },
  { path: ["space"], keys: named(schema.$defs.space) },
  {
    path: ["space", "grid"],
    keys: named(((schema.$defs.space as Json)["properties"] as Json)["grid"]),
  },
];

/** What `description` names for the engine to run. */
function capabilities(description: Json): Set<string> {
  const out = new Set<string>();
  for (const { path, keys } of SECTIONS) {
    const at = path.reduce<unknown>(
      (o, k) => (isObject(o) ? o[k] : undefined),
      description,
    );
    if (!isObject(at)) continue;
    for (const k of Object.keys(at)) if (keys.has(k)) out.add([...path, k].join("."));
  }
  const play = description["play"];
  if (isObject(play))
    for (const section of ["values", "given"])
      if (isObject(play[section]))
        for (const v of Object.values(play[section]))
          if (isObject(v) && typeof v["paint"] === "string")
            out.add(`paint: ${v["paint"]}`);
  out.add(`produces: ${String(description["produces"])}`);
  const freedom = description["freedom"];
  if (isObject(freedom)) out.add(`freedom: ${String(freedom["kind"])}`);
  return out;
}

describe("the capabilities born games name", () => {
  const named = new Set(BORN_GAMES.flatMap((g) => [...capabilities(g.description)]));
  const covered = new Set(FIXTURES.flatMap((f) => [...capabilities(f.description)]));

  it("reads the born games, the fixtures and the schema", () => {
    // Every section of the schema names keys, and every born game names one
    // of play's; an emptied glob or a moved schema node would pass the rest.
    for (const s of SECTIONS) expect(s.keys.size, s.path.join(".")).toBeGreaterThan(0);
    expect(BORN_GAMES.length).toBeGreaterThan(0);
    expect(FIXTURES.length).toBeGreaterThan(0);
    expect(named).toContain("play.values");
  });

  it("are each named by a fixture, or listed until one is", () => {
    expectLedger(
      [...named].filter((c) => !covered.has(c)),
      Object.fromEntries(NO_FIXTURE_YET.map((c) => [c, true])),
      {
        table: "NO_FIXTURE_YET",
        file: "src/guards/capability-fixtures.test.ts",
        found: "capabilities a born game names and no fixture does",
        add: "name it in a fixture under src/engine/testing/fixtures/ that an engine test runs, or list it in NO_FIXTURE_YET until one does",
        value: null,
      },
    );
  });

  it.each(FIXTURES.map((f) => f.source))("%s is run by a test", (source) => {
    expect(testFilesImporting(compiledPath(source))).not.toEqual([]);
  });
});
