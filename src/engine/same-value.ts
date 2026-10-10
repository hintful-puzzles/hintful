/**
 * **Whether two values hold the same thing.**
 *
 * The midend asks it of the board before a move and the board after, to keep
 * a move that changed nothing out of the history, and of a `Ui` before an
 * input and after, to repaint one a game changed without saying so and to
 * claim the input where what it shows changed. A game writes nothing for any
 * of them: its state and its `Ui` are read as they are.
 *
 * A part both values share by reference is the same at once, which is what
 * makes the question cheap on a real move: `executeMove` copies what it
 * changes and shares the rest.
 */

/** The pairs already being compared, so a value that holds itself ends. */
type Met = Map<object, Set<object>>;

function same(a: unknown, b: unknown, met: Met, shown: boolean): boolean {
  if (Object.is(a, b)) return true;
  // A function is the same only as itself, which `Object.is` has answered.
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a === null || b === null) return false;

  const pairs = met.get(a);
  if (pairs?.has(b)) return true;
  if (pairs) pairs.add(b);
  else met.set(a, new Set([b]));

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (Array.isArray(a)) {
    const other = b as unknown[];
    if (a.length !== other.length) return false;
    for (let i = 0; i < a.length; i++)
      if (!same(a[i], other[i], met, shown)) return false;
    return true;
  }
  if (ArrayBuffer.isView(a)) {
    const [x, y] = [a as unknown as ArrayLike<unknown>, b as ArrayLike<unknown>];
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (!Object.is(x[i], y[i])) return false;
    return true;
  }
  if (a instanceof Map) {
    const other = b as Map<unknown, unknown>;
    if (a.size !== other.size) return false;
    // In order: two maps filled in different orders read as different, which
    // costs a step of Undo at worst and never drops a move.
    const theirs = other.entries();
    for (const [k, v] of a) {
      const [ok, ov] = theirs.next().value as [unknown, unknown];
      if (!same(k, ok, met, shown) || !same(v, ov, met, shown)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    const other = b as Set<unknown>;
    if (a.size !== other.size) return false;
    const theirs = other.values();
    for (const v of a) if (!same(v, theirs.next().value, met, shown)) return false;
    return true;
  }
  // What is left must be an object whose whole content is its own properties.
  // A `Date` or a `WeakMap` would compare as two empty shells, so it is
  // refused by name and never called the same wrongly.
  const tag = Object.prototype.toString.call(a);
  if (tag !== "[object Object]") {
    throw new Error(`a value holds ${tag}, which the engine cannot compare`);
  }
  const [x, y] = [a as Record<string, unknown>, b as Record<string, unknown>];
  if (shown && x["visible"] === false && y["visible"] === false) return true;
  const keys = Object.keys(x);
  if (keys.length !== Object.keys(y).length) return false;
  for (const k of keys) {
    if (!Object.hasOwn(y, k) || !same(x[k], y[k], met, shown)) return false;
  }
  return true;
}

/** Whether `a` and `b` hold the same thing, part for part. */
export function sameValue(a: unknown, b: unknown): boolean {
  return same(a, b, new Map(), false);
}

/**
 * Whether `a` and `b` show the same thing: {@link sameValue}, but a part
 * hidden in both (`visible: false`) is the same wherever it sits. A press
 * parks a hidden cursor on what it pressed, which moves nothing on screen.
 */
export function sameShown(a: unknown, b: unknown): boolean {
  return same(a, b, new Map(), true);
}
