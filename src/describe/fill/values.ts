/**
 * What a clue kind's values are, as the fill compiler reads them off its
 * `value: range(lo, hi)`.
 */

import { CompileError, type Env } from "../compile-sorts.ts";
import {
  type Description,
  type DescriptionJson,
  dividesOf,
  type SizeRange,
} from "../description.ts";
import type { Expr } from "../expr.ts";

/** The values a kind's `range(lo, hi)` states, where both are numbers. */
export function valuesOf(d: Description, kind: string): number[] | null {
  const c = d.clueKinds.get(kind);
  if (c === undefined) throw new CompileError(`id: no clue kind ${kind}`);
  return c.value !== null &&
    c.value.k === "call" &&
    c.value.args.every((a) => a.k === "num")
    ? c.value.args.map((a) => (a.k === "num" ? a.v : 0))
    : null;
}

/** Whether a kind is a cell's one-valued marker, which says where a clue is
 * and never its value: one value, 0. */
export function markerKind(d: Description, kind: string): boolean {
  return d.clueKinds.get(kind)?.at === "cell" && valuesOf(d, kind)?.join() === "0,0";
}

/** Whether a kind is valued 0 or 1 at every element (Adjacent's bar), so a
 * record writes where it is 1 alone. */
export function flagKind(d: Description, kind: string): boolean {
  return (
    d.clueKinds.get(kind)?.complete === true && valuesOf(d, kind)?.join() === "0,1"
  );
}

/** Whether a kind is valued 0 to 2 at every edge (Subsets' horseshoe), 1
 * naming the edge's first end and 2 its second, so a record writes it at
 * the end it names. */
export function endKind(d: Description, kind: string): boolean {
  const c = d.clueKinds.get(kind);
  return c?.at === "edge" && c.complete && valuesOf(d, kind)?.join() === "0,2";
}

/** Whether a clue kind's value is one of the board's elements (a sign's
 * greater end), not a number. */
export const isElement = (env: Env, kind: string): boolean =>
  env.clues.get(kind)?.v.k === "elem";

/** The least of a `range(lo, hi)` whose `lo` is a number; `-1` otherwise. */
export const lowBound = (value: Expr | null): number =>
  value?.k === "call" && value.args[0]?.k === "num" ? value.args[0].v : -1;

/** The most of a `range(lo, hi)` whose `hi` is a size, at the size's most;
 * `Infinity` where it is anything else or the size has no most. */
export const sizeBound = (
  value: Expr | null,
  sizes: Readonly<Record<string, SizeRange>>,
) => {
  const hi = value?.k === "call" ? value.args[1] : undefined;
  return hi?.k === "name" ? (sizes[hi.name]?.max ?? Infinity) : Infinity;
};

/** The most of a `range(1, |cells(P(at))|)`, the numbers of a cell's part
 * of a partition the deal divides to drawn sizes: the largest size drawn;
 * `null` where the value is anything else. */
export function partBound(value: Expr | null, json: DescriptionJson): number | null {
  if (value === null) return null;
  const hi = value.k === "call" && value.fn === "range" ? value.args[1] : undefined;
  const of =
    hi?.k === "size" &&
    hi.of.k === "call" &&
    hi.of.fn === "cells" &&
    hi.of.args[0]?.k === "call"
      ? hi.of.args[0].fn
      : null;
  const divide = dividesOf(json).find((d) => d.partition === of);
  return divide !== undefined && "sizes" in divide
    ? Math.max(...divide.sizes.flat())
    : null;
}
