/**
 * Whether two states hold the same values in every field: a move that leaves
 * its board so is a step that does nothing.
 *
 * **What the two share by reference is not walked.** A move returns a new
 * state that keeps whatever it did not change, and for Loopy that is the grid,
 * a cyclic structure of every dot, edge and face that costs more to write out
 * once per move than the move cost to make. A move that changed shared
 * structure in place would read here as a move that does nothing, which is the
 * louder of the two ways to be wrong about it.
 */
export function sameState(
  a: unknown,
  b: unknown,
  met = new Map<object, object>(),
): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
    return false;
  // A pair met again is on a cycle; it is equal unless something else differs.
  if (met.get(a) === b) return true;
  met.set(a, b);
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (ArrayBuffer.isView(a) && !(a instanceof DataView)) {
    const x = a as unknown as ArrayLike<number>;
    const y = b as unknown as ArrayLike<number>;
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }
  if (a instanceof Set || a instanceof Map) {
    const x = [...a];
    const y = [...(b as Set<unknown>)];
    return x.length === y.length && x.every((v, i) => sameState(v, y[i], met));
  }
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every(
    (k) =>
      Object.hasOwn(b, k) &&
      sameState(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
        met,
      ),
  );
}
