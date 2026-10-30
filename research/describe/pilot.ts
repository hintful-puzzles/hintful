/**
 * What the pilot's runs share: dealing a game's board, and instantiating its
 * description on it.
 */

import { appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type LibraryJson, loadDescription } from "../../src/describe/description.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import type { Binding } from "./bindings.ts";
import {
  describedLibrary,
  type Instance,
  instantiate,
  withVariations,
} from "./description.ts";

export const LIBRARIES: readonly LibraryJson[] = [
  describedLibrary("src/engine/latin.description.yaml"),
];

export interface DealtBoard<P, S> {
  params: P;
  seed: string;
  desc: string;
  state: S;
  inst: Instance;
}

/** A board at `params`, or `null` where the game refuses them or its
 * generator gives up at the house count of tries. */
export function deal<P, S>(
  b: Binding<P, S>,
  params: P,
  seed: string,
): DealtBoard<P, S> | null {
  if (b.game.validateParams?.(params, true)) return null;
  let desc: string;
  try {
    desc = b.game.newDesc(params, randomNew(seed)).desc;
  } catch (e) {
    if (e instanceof RetryLimitExceeded) return null;
    throw e;
  }
  const state = b.game.newState(params, desc);
  const dealt = b.dealt(state);
  const json = withVariations(b.description, dealt.variations ?? []);
  const inst = instantiate(loadDescription(json, LIBRARIES), dealt);
  return { params, seed, desc, state, inst };
}

export function label<P>(b: Binding<P, unknown>, params: P): string {
  return `${b.description.game} ${b.game.encodeParams(params, true)}`;
}

/** A small deterministic stream for the mutants and planted marks. */
export function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function writeResult(name: string, text: string): void {
  writeFileSync(fileURLToPath(new URL(name, import.meta.url)), text);
}

/** The boards dealt per params: `PILOT_SEEDS`, else `fallback`. */
export function seedsPerParams(fallback: number): number {
  return Number(process.env["PILOT_SEEDS"] ?? fallback);
}

/** The games a run is narrowed to by `PILOT_GAMES`, or every game. */
export function onlyGames(): string[] | null {
  return process.env["PILOT_GAMES"]?.split(",") ?? null;
}

/** A line of progress, to a log a long run can be watched by. */
export function progress(text: string): void {
  const log = process.env["PILOT_LOG"];
  if (log) appendFileSync(log, `${new Date().toISOString().slice(11, 19)} ${text}\n`);
}
