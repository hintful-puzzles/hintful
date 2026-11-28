/**
 * A fill board's candidate notes (`engine/fill/notes.ts`): whether it keeps
 * them, what the walk of the notes reads, and what a technique must say for
 * a step of the walk to be named.
 */

import { PART_STEPS, REPEAT_STEPS, WALK_STEPS } from "../../engine/fill/walk-steps.ts";
import { CompileError, type Env } from "../compile-sorts.ts";
import { clauseOf } from "../compile-stated.ts";
import { concludes } from "../compile-technique.ts";
import { type Description, type DescriptionJson, noteMarkOf } from "../description.ts";
import { parse } from "../expr.ts";

/**
 * Whether the board keeps notes, and the dealt partitions whose parts the
 * walk of the notes reads. Refuses a technique the walk cannot name a step
 * of, notes on a board of buttons, a strike on a board of numbers that
 * keeps none, hint notes on a board without them or whose notes are full,
 * and `full` on a mark that is no candidate notes.
 */
export function notesOf(
  json: DescriptionJson,
  d: Description,
  env: Env,
): { notes: boolean; fullNotes: boolean; distinctParts: string[] } {
  const p = json.play;
  // Notes are typed, a key a value, so only a board of numbers keeps them.
  const mark = noteMarkOf(json);
  const notes = mark !== null;
  for (const [name, m] of Object.entries(json.marks ?? {}))
    if (m.full === true && name !== mark)
      throw new CompileError(`marks ${name}: full, and it is no candidate notes`);
  const fullNotes = mark !== null && json.marks?.[mark]?.full === true;
  if (fullNotes && p?.hintNotes !== undefined)
    throw new CompileError(
      "play hintNotes: the notes are full, so the hint never reads a square with none",
    );
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
  return { notes, fullNotes, distinctParts };
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
 * over the terms the walk supplies and the board's sizes; and where a unit
 * holds a value more than once, the step its cull says (`REPEAT_STEPS`).
 */
function checkWalkSteps(
  json: DescriptionJson,
  d: Description,
  distinctParts: readonly string[],
): void {
  // Every variation's units, as the compiled module lists them.
  const { units } = d.json.space;
  const lines = units.every((u) => u === "rows" || u === "cols" || u === "lines");
  const sizes = Object.keys(json.sizes ?? {}).filter((s) => s !== "w" && s !== "h");
  // A variation the player switches on is a flag by its name: Solo's X adds
  // the diagonals to how far a placed value reaches.
  const flags = Object.entries(json.settings ?? {})
    .filter(([, s]) => s.gives === "variation")
    .map(([id]) => id);
  const check = (
    table: Readonly<Record<string, Readonly<Record<string, string>>>>,
    why: string,
    marks: readonly string[],
  ): void => {
    for (const [id, supplied] of Object.entries(table))
      checkWalkStep(d, id, supplied, why, marks, sizes, flags);
  };
  if (units.length === 0 || !lines || distinctParts.length > 0)
    check(WALK_STEPS, "the notes' reach is no row and column", []);
  if (json.answer?.value?.repeat !== undefined)
    check(REPEAT_STEPS, "a unit holds a value more than once", ["outline"]);
  // Optional: worded only where a part's hidden single needs its own reason.
  if (distinctParts.length > 0 && d.steps.some((s) => s.id === "hiddenSingle"))
    check(PART_STEPS, "a part is worded", ["stripes"]);
  // The walk speaks every other step in the engine's words (its singles are
  // the Latin library's), so a step worded under another name is words the
  // player never sees. A variation may add the reach that reads WALK_STEPS
  // (`dividing`'s cages), so those stay allowed on any board.
  const spokenBy = new Set(
    d.steps.flatMap((s) => s.terms.flatMap((t) => clauseOf(t.kind) ?? [])),
  );
  for (const s of d.steps)
    if (
      !Object.hasOwn(WALK_STEPS, s.id) &&
      !Object.hasOwn(REPEAT_STEPS, s.id) &&
      !(distinctParts.length > 0 && Object.hasOwn(PART_STEPS, s.id)) &&
      !spokenBy.has(s.id)
    )
      throw new CompileError(
        `steps ${s.id}: the walk reads no step of that name, and speaks it in the engine's words (it reads ${[...Object.keys(WALK_STEPS), ...Object.keys(REPEAT_STEPS), ...(distinctParts.length > 0 ? Object.keys(PART_STEPS) : [])].join(", ")})`,
      );
}

/** Holds the description's step `id` to the terms the walk `supplied` it
 * beside the sizes and the variations' flags, and to the roles of `marks`,
 * each of a cell, where it is required because `why`. */
function checkWalkStep(
  d: Description,
  id: string,
  supplied: Readonly<Record<string, string>>,
  why: string,
  marks: readonly string[],
  sizes: readonly string[],
  flags: readonly string[],
): void {
  const step = d.steps.find((s) => s.id === id);
  if (step === undefined)
    throw new CompileError(`steps: ${id} is unworded, and ${why}`);
  if (step.ring !== "cell")
    throw new CompileError(`steps ${id}: the walk rings a cell`);
  for (const m of step.marks)
    if (!marks.includes(m.role) || m.sort !== "cell")
      throw new CompileError(
        `steps ${id}: the walk marks ${marks.length === 0 ? "nothing" : `a cell, as ${marks.join(", ")}`}`,
      );
  for (const t of step.terms) {
    const kind = Object.hasOwn(supplied, t.name)
      ? supplied[t.name]
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
