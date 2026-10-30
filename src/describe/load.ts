/**
 * Reading a `*.description.yaml`: the one loader `npm run describe`, the help
 * build, the tests and the research tools share. Nothing the app bundles
 * imports it, so neither parser ships.
 */

import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import { parse } from "yaml";
import schema from "./description.schema.json" with { type: "json" };
import type { DescriptionFile } from "./description.ts";

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
  if (!validate(data)) {
    const e = deepest(validate.errors ?? []);
    const extra =
      e.keyword === "additionalProperties" || e.keyword === "unevaluatedProperties"
        ? ` (${Object.values(e.params).join(", ")})`
        : "";
    throw new DescriptionError(
      `${path}: ${e.instancePath || "/"} ${e.message}${extra}`,
    );
  }
  return data as DescriptionFile;
}
