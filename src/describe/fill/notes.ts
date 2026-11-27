/**
 * A fill board's candidate notes (`engine/fill/notes.ts`): whether it keeps
 * them, what the walk of the notes reads, and what a technique must say for
 * a step of the walk to be named.
 */

import { WALK_STEPS } from "../../engine/fill/walk-steps.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import { concludes } from "../compile-technique.ts";
import { type Description, type DescriptionJson, noteMarkOf } from "../description.ts";
import { parse } from "../expr.ts";

/**
 * Whether the board keeps notes, and the dealt partitions whose parts the
 * walk of the notes reads. Refuses a technique the walk cannot name a step
 * of, notes on a board of buttons, a strike on a board of numbers that
 * keeps none, and hint notes on a board without them.
 */
export function notesOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
): { notes: boolean; distinctParts: string[] } {
  const p = json.play;
  // Notes are typed, a key a value, so only a board of numbers keeps them.
  const notes = noteMarkOf(json) !== null;
  // The walk of notes names a step by the arm that held, each a rung the
  // description gives the technique, or by its one rung.
  if (notes)
    for (const t of d.techniques) {
      if (t.id.includes(".") || t.says === null) continue;
      const arms = t.says.variants.flatMap((v) => (v.name === null ? [] : [v.name]));
      if (arms.length === 0 && t.rungs.length > 1)
        throw new CompileError(
          `${t.id}: its steps are recorded under one rung, and it has ${t.rungs.length}: arms named for them choose`,
        );
      for (const arm of arms)
        if (t.rungs.length > 0 && !t.rungs.includes(arm))
          throw new CompileError(
            `${t.id}: a step of arm ${arm} is no rung of the technique's (${t.rungs.join(", ")})`,
          );
    }
  if (!notes)
    for (const t of d.techniques)
      if (t.says?.byValue === true)
        throw new CompileError(
          `${t.id}: says shown value, and the board keeps no notes`,
        );
  if (notes && p?.numbers === undefined)
    throw new CompileError(
      "marks: candidate notes are a board of numbers', and play has no `numbers`",
    );
  // A board of numbers holds no strike but in its notes: a step that only
  // strikes would be no move.
  if (!notes && p?.numbers !== undefined)
    for (const t of d.techniques)
      if (t.on === null && concludes(t.conclude, "strike", env))
        throw new CompileError(
          `technique ${t.id}: it strikes, and a board of numbers strikes only in notes \`marks\` declares`,
        );
  if (!notes && p?.hintNotes !== undefined)
    throw new CompileError(
      "play hintNotes: the hint reads notes, and `marks` declares none",
    );
  const distinctParts = notes ? distinctPartsOf(json, env) : [];
  if (notes) checkWalkSteps(json, d, distinctParts);
  return { notes, distinctParts };
}

/**
 * The dealt partitions a rule holds distinct, each stated as `forall r in P:
 * distinct(value(c) over c in cells(r))`: the walk of the notes reads a
 * value's places in each part, as in a row. A partition whose rule says more
 * (a cage's sum) is no such region, and is not listed.
 */
function distinctPartsOf(json: DescriptionJson, env: Env): string[] {
  const answer = Object.keys(json.answer);
  const parts = new Set<string>();
  for (const src of [...(json.shape ?? []), ...Object.values(json.rules ?? {})]) {
    const e = parse(src);
    if (e.k !== "quant" || e.q !== "forall" || e.binders.length !== 1) continue;
    const [r] = e.binders;
    if (r.kind !== "in" || r.where !== null || r.of.k !== "name") continue;
    if (!env.regions.has(r.of.name)) continue;
    const b = e.body;
    if (b.k !== "agg" || b.fn !== "distinct" || b.where !== null) continue;
    if (b.binders.length !== 1) continue;
    const [c] = b.binders;
    const over = c.of;
    if (c.kind !== "in" || c.where !== null || over.k !== "call") continue;
    if (over.fn !== "cells" || over.args.length !== 1) continue;
    const [of] = over.args;
    if (of.k !== "name" || of.name !== r.name) continue;
    const t = b.term;
    if (t === null || t.k !== "call" || !answer.includes(t.fn)) continue;
    if (t.args.length !== 1 || t.args[0].k !== "name" || t.args[0].name !== c.name)
      continue;
    parts.add(r.of.name);
  }
  return [...parts];
}

/**
 * Holds a board of notes to the regions its walk reads: its units (rows,
 * columns, diagonals and the partition among them) and the parts of
 * partitions its rules hold distinct. Where a placed value rules itself out
 * of more than a row and a column, or of none (a board with no unit, whose
 * placements reach as far as its techniques strike, ABCD's neighbors), the
 * description words the walk's steps that say how far (`WALK_STEPS`), each
 * over the terms the walk supplies and the board's sizes.
 */
function checkWalkSteps(
  json: DescriptionJson,
  d: Description,
  distinctParts: readonly string[],
): void {
  // Every variation's units, as the compiled module lists them.
  const { units } = d.json.space;
  const lines = units.every((u) => u === "rows" || u === "cols" || u === "lines");
  if (units.length > 0 && lines && distinctParts.length === 0) return;
  const sizes = Object.keys(json.sizes ?? {}).filter((s) => s !== "w" && s !== "h");
  // A variation the player switches on is a flag by its name: Solo's X adds
  // the diagonals to how far a placed value reaches.
  const flags = Object.entries(json.settings ?? {})
    .filter(([, s]) => s.gives === "variation")
    .map(([id]) => id);
  for (const [id, supplied] of Object.entries(WALK_STEPS)) {
    const step = d.steps.find((s) => s.id === id);
    if (step === undefined)
      throw new CompileError(
        `steps: ${id} is unworded, and the notes' reach is no row and column`,
      );
    if (step.ring !== "cell")
      throw new CompileError(`steps ${id}: the walk rings a cell`);
    for (const t of step.terms) {
      const kind = Object.hasOwn(supplied, t.name)
        ? (supplied as Readonly<Record<string, string>>)[t.name]
        : sizes.includes(t.name)
          ? "number"
          : flags.includes(t.name)
            ? "flag"
            : null;
      if (kind === null)
        throw new CompileError(
          `steps ${id}: the walk supplies no term ${t.name} (${[...Object.keys(supplied), ...sizes, ...flags].join(", ")})`,
        );
      if (t.kind !== kind)
        throw new CompileError(`steps ${id}: term ${t.name} is a ${kind}`);
    }
  }
}
