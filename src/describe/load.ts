/**
 * Reading a `*.description.yaml`: the one loader `npm run describe`, the help
 * build, the tests and the research tools share. Nothing the app bundles
 * imports it, so neither parser ships.
 */

import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import { parse } from "yaml";
import schema from "./description.schema.json" with { type: "json" };
import type { DescriptionFile, VariationJson } from "./description.ts";
import { expandKind, KindError } from "./kinds.ts";

export class DescriptionError extends Error {}

const validate = new Ajv2020({ allErrors: true }).compile(schema);

/** The fault a writer can act on: an error inside a branch of a `oneOf` or
 * an `if` says which field is wrong, where the branch's own error says only
 * that no branch fit. */
function deepest(errors: readonly ErrorObject[]): ErrorObject {
  const branch = new Set(["oneOf", "anyOf", "if"]);
  return (
    [...errors]
      .filter((e) => !branch.has(e.keyword))
      .sort((a, b) => b.instancePath.length - a.instancePath.length)[0] ?? errors[0]
  );
}

/**
 * The description `text` states, validated against `description.schema.json`;
 * `path` names it in an error. YAML 1.2's core schema is pinned, so a prose
 * field that is the word `no` stays a string; a formula written unquoted that
 * YAML reads as a map fails as not a string, at its field.
 */
export function loadDescriptionFile(text: string, path: string): DescriptionFile {
  let data: unknown;
  try {
    data = parse(text, { version: "1.2", schema: "core", uniqueKeys: true });
  } catch (e) {
    throw new DescriptionError(`${path}: ${e instanceof Error ? e.message : e}`);
  }
  valid(data, path);
  // A placement's words are whole only once laid over its kind's, so the
  // expanded file is checked again.
  const placed = withKinds(data as DescriptionFile, path);
  if (placed !== data) valid(JSON.parse(JSON.stringify(placed), unplanted), path);
  return withPhrases(placed, path);
}

/** A JSON reviver dropping the plant a kind's technique carries, which the
 * statement it expands into has no field for. */
const unplanted = (key: string, v: unknown): unknown =>
  key === "plant" ? undefined : v;

function valid(data: unknown, path: string): void {
  if (validate(data)) return;
  const e = deepest(validate.errors ?? []);
  const extra =
    e.keyword === "additionalProperties" || e.keyword === "unevaluatedProperties"
      ? ` (${Object.values(e.params).join(", ")})`
      : "";
  throw new DescriptionError(`${path}: ${e.instancePath || "/"} ${e.message}${extra}`);
}

/** `data` with each technique placed as a kind of rule (`kinds.ts`) replaced
 * by the technique it stands for, a variation's added ones included. */
function withKinds(data: DescriptionFile, path: string): DescriptionFile {
  if (!("techniques" in data) || !Array.isArray(data.techniques)) return data;
  const words = "kindWords" in data ? data.kindWords : undefined;
  const expanded = (ts: readonly object[]): object[] =>
    ts.map((t) => ("kind" in t ? expandKind(t as never, path, words) : t));
  const variations: Record<string, VariationJson> | null =
    "variations" in data ? (data.variations ?? null) : null;
  try {
    return {
      ...data,
      techniques: expanded(data.techniques),
      ...(variations === null
        ? {}
        : {
            variations: Object.fromEntries(
              Object.entries(variations).map(([name, v]) => [
                name,
                v.add?.techniques === undefined
                  ? v
                  : { ...v, add: { ...v.add, techniques: expanded(v.add.techniques) } },
              ]),
            ),
          }),
    } as unknown as DescriptionFile;
  } catch (e) {
    if (e instanceof KindError) throw new DescriptionError(e.message);
    throw e;
  }
}

/** The keys whose strings are clauses. */
const CLAUSE_KEYS: ReadonlySet<string> = new Set([
  "look",
  "follows",
  "move",
  "effect",
  "again",
  "later",
]);

/**
 * `data` with every `{name}` of a phrase it declares (`phrases`) replaced by
 * the phrase, in every clause of its `steps` and `techniques`, so a clause is
 * checked and emitted with its phrases in it. A phrase may say another; one
 * that says itself, and a term named like a phrase (which `{name}` would never
 * say), are refused.
 */
function withPhrases(data: DescriptionFile, path: string): DescriptionFile {
  const phrases = "phrases" in data ? data.phrases : undefined;
  const names = Object.keys(phrases ?? {});
  if (phrases === undefined || names.length === 0) return data;
  const slot = new RegExp(`\\{(${names.join("|")})\\}`, "g");
  const expand = (src: string, seen: readonly string[]): string =>
    src.replace(slot, (_, name: string) => {
      if (seen.includes(name))
        throw new DescriptionError(
          `${path}: phrase ${name} says itself (${[...seen, name].join(" > ")})`,
        );
      return expand(phrases[name], [...seen, name]);
    });
  const walk = (v: unknown, key: string | null): unknown => {
    if (typeof v === "string")
      return key !== null && CLAUSE_KEYS.has(key) ? expand(v, []) : v;
    if (Array.isArray(v)) return v.map((x) => walk(x, null));
    if (v === null || typeof v !== "object") return v;
    if (key === "terms")
      for (const t of Object.keys(v))
        if (names.includes(t))
          throw new DescriptionError(
            `${path}: a term named ${t} is shadowed by the phrase of that name: rename one`,
          );
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
  };
  const out: Record<string, unknown> = { ...data };
  for (const part of ["steps", "techniques"])
    if (part in out) out[part] = walk(out[part], part);
  return out as unknown as DescriptionFile;
}
