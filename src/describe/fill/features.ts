/**
 * A board of numbers whose values are sets of features (`play.numbers.features`,
 * Subsets' sets of letters): what the description may declare, and
 * `featuresOf(d)`, the features of value `d` as a mask, which the renderer
 * draws a square's slots from (`engine/fill/render/layers/features.ts`).
 */

import { compileExpr } from "../compile-expr.ts";
import {
  CompileError,
  type Env,
  isMask,
  NUM,
  Out,
  type Val,
} from "../compile-sorts.ts";
import type { PlayJson } from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv } from "./emit.ts";

/** Refuses features a board cannot draw: a square's slots hold its letters
 * alone, so no other drawing of its value goes with them; and an open
 * square's letters are what its notes agree on, so it is never unnoted. */
export function checkFeatures(numbers: PlayJson["numbers"], fullNotes: boolean): void {
  if (numbers?.features === undefined) return;
  for (const other of ["raised", "letters", "pictures", "empty"] as const)
    if (numbers[other] !== undefined)
      throw new CompileError(`play numbers features: and ${other}`);
  if (!fullNotes)
    throw new CompileError(
      "play numbers features: an open square's letters are its notes', and no notes are kept full",
    );
  if (new Set(numbers.features.names).size !== numbers.features.names.length)
    throw new CompileError(
      `play numbers features: ${numbers.features.names} names a feature twice`,
    );
}

/** `featuresOf(d)`, the mask of value `d`'s features, from
 * `play.numbers.features.of`, a formula of `d` alone. Nothing where the
 * values are no features. */
export function featuresOfFn(
  of: string | null,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (of === null) return [];
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(parse(of)),
    new Map<string, Val>([["d", { code: "d", sort: NUM }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  if (!isMask(v.sort))
    throw new CompileError("play numbers features of: not a set of numbers");
  return [
    "",
    "/** The features of value `d`, bit `k` feature `k` (`play.numbers.features`). */",
    "export function featuresOf(d: number): number {",
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return ${v.code};`,
    "}",
  ];
}
