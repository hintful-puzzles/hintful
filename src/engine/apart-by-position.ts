/**
 * Words that tell apart squares a hint's sentence would otherwise name alike.
 *
 * A number is named by its value (docs/games/hints.md § "Name a square by its
 * value"), and a step that reasons from two numbers of one value would say
 * "the 3" of both. Where each sits among the others says which: "the upper 3"
 * and "the lower 3".
 */

import type { Point } from "./types.ts";

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];

const pointKey = (p: Point): string => `${p.x},${p.y}`;

/** Where each of several squares of one name sits among them: upper and
 * lower, or left and right, for two; their order from the top or the left for
 * more. */
function positions(same: readonly Point[]): Map<string, string> {
  const out = new Map<string, string>();
  const vertical = new Set(same.map((p) => p.y)).size === same.length;
  const sorted = [...same].sort((p, q) =>
    vertical ? p.y - q.y : p.x - q.x || p.y - q.y,
  );
  sorted.forEach((p, i) => {
    if (same.length === 2)
      out.set(
        pointKey(p),
        vertical ? (i === 0 ? "upper" : "lower") : i === 0 ? "left" : "right",
      );
    else
      out.set(
        pointKey(p),
        `${ORDINALS[i] ?? `${i + 1}th`} from the ${vertical ? "top" : "left"}`,
      );
  });
  return out;
}

/**
 * How one step's sentence names each of `things`: by `name` alone where no
 * other shares it, and with its position where one does ("upper 3", "3 second
 * from the top"). Built over every such thing the sentence names, since a name
 * is shared or not among those. A thing named twice counts once.
 */
export function apartByPosition<T>(
  things: readonly T[],
  at: (thing: T) => Point,
  name: (thing: T) => string,
): (thing: T) => string {
  const byName = new Map<string, Map<string, Point>>();
  for (const t of things) {
    const same = byName.get(name(t)) ?? new Map<string, Point>();
    same.set(pointKey(at(t)), at(t));
    byName.set(name(t), same);
  }
  const where = new Map<string, string>();
  for (const same of byName.values())
    if (same.size > 1)
      for (const [k, q] of positions([...same.values()])) where.set(k, q);
  return (t) => {
    const q = where.get(pointKey(at(t)));
    if (q === undefined) return name(t);
    return q.includes(" from ") ? `${name(t)} ${q}` : `${q} ${name(t)}`;
  };
}
