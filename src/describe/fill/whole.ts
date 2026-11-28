/**
 * What a click and an edit write on a board of buttons, from the
 * description's `play:`: each button's cycle (`play.click` by button), and
 * a dealt part played whole (`play.whole`), whose other squares an edit
 * writes by `wholeOthers` (`engine/fill/edit.ts`).
 */

import { compileExpr } from "../compile-expr.ts";
import {
  CompileError,
  type Env,
  expect,
  NUM,
  Out,
  type Val,
} from "../compile-sorts.ts";
import type { DescriptionJson, PlayJson } from "../description.ts";
import type { Expr } from "../expr.ts";
import { parse } from "../expr.ts";
import { answerEnv } from "./emit.ts";

/** A click's cycles go round values the player places, the left button's
 * from its own value and the right's from theirs. */
export function checkClick(p: PlayJson): void {
  if (typeof p.click !== "object") return;
  const values = p.values ?? {};
  for (const button of ["primary", "secondary"] as const) {
    const list = p.click[button];
    for (const v of list)
      if (values[v] === undefined)
        throw new CompileError(
          `play click: ${button} goes round ${v}, which is no value the player places`,
        );
    if (p[button] === undefined || list[0] !== p[button])
      throw new CompileError(`play click: ${button} goes first to its own value`);
  }
}

/** A part played whole is a dealt partition's, whose parts the board holds. */
export function checkWhole(json: DescriptionJson, whole: PlayJson["whole"]): void {
  if (whole !== undefined && json.space.regions?.[whole.part] !== "dealt")
    throw new CompileError(`play whole: ${whole.part} is no dealt partition`);
}

/**
 * `wholeOthers(d)`: what the other squares of a part played whole hold once
 * one holds `d`, from `play.whole.others`, a formula of `d` alone. Nothing
 * where no part is.
 */
export function wholeOthersOf(
  others: string | null,
  env: Env,
  measured: (e: Expr) => Expr,
): string[] {
  if (others === null) return [];
  const scratch: string[] = [];
  const out = new Out(1);
  const v = compileExpr(
    measured(parse(others)),
    new Map<string, Val>([["d", { code: "d", sort: NUM }]]),
    answerEnv(env, { yes: false }, scratch),
    out,
  );
  expect(v, "num", "play whole others");
  return [
    "",
    "/** What a part played whole's other squares hold once one holds `d`. */",
    "export function wholeOthers(d: number): number {",
    ...scratch.map((s) => `  ${s}`),
    ...out.text(),
    `  return ${v.code};`,
    "}",
  ];
}
