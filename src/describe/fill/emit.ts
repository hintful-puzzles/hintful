/**
 * What every part of the fill compiler (`compile-fill.ts`) writes its
 * functions and objects with.
 */

import { CompileError, type Env } from "../compile-sorts.ts";

/** A compiling environment that reads a whole board `g`, as the answer
 * check does. */
export function answerEnv(
  env: Env,
  readsClues: { yes: boolean },
  scratch: string[],
): Env {
  return {
    ...env,
    answer: { repeats: false },
    readsClues,
    scratch,
    memo: false,
    hoist: null,
    boardRoot: null,
    epoch: null,
    concluding: false,
  };
}

/** A function's parameter, `_`-prefixed where its body leaves it unread. */
export const param = (name: string, type: string, body: readonly string[]): string =>
  body.some((l) => new RegExp(`\\b${name}\\b`).test(l))
    ? `${name}: ${type}`
    : `_${name}: ${type}`;

/** `{ [key]: value }` to spread into a module's object, or nothing where
 * `value` is absent, so the module holds no `null` field. */
export function present<K extends string, V>(
  key: K,
  value: V | null,
): Partial<Record<K, V>> {
  return value === null ? {} : ({ [key]: value } as Record<K, V>);
}

/** The index of tier `name`, refused where there is no such tier. */
export function tierIndex(
  tiers: readonly string[],
  name: string,
  where: string,
): number {
  const i = tiers.indexOf(name);
  if (i < 0) throw new CompileError(`${where}: ${name} is no tier`);
  return i;
}
