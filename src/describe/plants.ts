/**
 * The defects planted in a description's statements, which the soundness
 * checks under `research/technique-check` must find unsound: one
 * `<name>.plants.yaml` beside each `<name>.description.yaml` whose
 * techniques or dead-end claims a check proves, so a game's plants go where
 * it goes and a check finds them by its description. `plants.test.ts` holds
 * each file to its description.
 *
 * Dev/test-only; nothing the app bundles imports it.
 */

import { parse } from "yaml";

/** A technique's statement with one part replaced: a `for`, a `conclude`, or
 * both. */
export interface TechniquePlant {
  for?: string;
  conclude?: string;
}

export interface Plants {
  /** By technique id, one for each technique the description states. */
  techniques: Record<string, TechniquePlant>;
  /** By technique id, a library's second plant in a technique that reads how
   * many times a value appears: the technique reading it as once. */
  once: Record<string, TechniquePlant>;
  /** By claim id, the claim's formula replaced. */
  deadEnds: Record<string, string>;
}

/** Where the plants of the description at `source` are. */
export const plantsPath = (source: string): string => {
  if (!source.endsWith(".description.yaml"))
    throw new Error(`${source} is not a description`);
  return source.replace(/\.description\.yaml$/, ".plants.yaml");
};

const SECTIONS = ["techniques", "once", "deadEnds"] as const;

function record(v: unknown, where: string): Record<string, unknown> {
  if (v === undefined) return {};
  if (typeof v !== "object" || v === null || Array.isArray(v))
    throw new Error(`${where} is not a map`);
  return v as Record<string, unknown>;
}

function techniquePlants(v: unknown, where: string): Record<string, TechniquePlant> {
  return Object.fromEntries(
    Object.entries(record(v, where)).map(([id, p]) => {
      const fields = record(p, `${where}.${id}`);
      const keys = Object.keys(fields);
      if (
        keys.length === 0 ||
        keys.some((k) => k !== "for" && k !== "conclude") ||
        Object.values(fields).some((s) => typeof s !== "string")
      )
        throw new Error(`${where}.${id} wants a string \`for\`, \`conclude\` or both`);
      return [id, fields as TechniquePlant];
    }),
  );
}

/** The plants `text` states; `path` names it in an error. */
export function parsePlants(text: string, path: string): Plants {
  const data = record(
    parse(text, { version: "1.2", schema: "core", uniqueKeys: true }),
    path,
  );
  const extra = Object.keys(data).filter(
    (k) => !(SECTIONS as readonly string[]).includes(k),
  );
  if (extra.length > 0) throw new Error(`${path}: no section ${extra.join(", ")}`);
  const deadEnds = record(data["deadEnds"], `${path} deadEnds`);
  for (const [id, s] of Object.entries(deadEnds))
    if (typeof s !== "string")
      throw new Error(`${path} deadEnds.${id} is not a string`);
  return {
    techniques: techniquePlants(data["techniques"], `${path} techniques`),
    once: techniquePlants(data["once"], `${path} once`),
    deadEnds: deadEnds as Record<string, string>,
  };
}
