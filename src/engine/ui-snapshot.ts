/**
 * **A `Ui` as it was, kept to be put back.**
 *
 * The midend copies a game's `Ui` at every pointer press and, if the press is
 * canceled, puts the copy back (`Midend.cancelPress`). A game writes nothing
 * for this: whatever its press, drag or preview left in the `Ui` is undone by
 * being overwritten, so there is no per-game list of fields to reset and no
 * field a game can forget.
 *
 * The copy keeps each object's prototype, because the engine finds a
 * `GridDrag` by `instanceof` (`cancelDrags`), which `structuredClone` would
 * turn into a plain object.
 */

type TypedArray = ArrayBufferView & { slice(): TypedArray };

function copy(value: unknown, met: Map<object, unknown>): unknown {
  // A function is shared: it holds no gesture state of its own to put back.
  if (typeof value !== "object" || value === null) return value;
  const seen = met.get(value);
  if (seen !== undefined) return seen;

  if (Array.isArray(value)) {
    const out: unknown[] = [];
    met.set(value, out);
    for (const v of value) out.push(copy(v, met));
    return out;
  }
  if (ArrayBuffer.isView(value) && "slice" in value) {
    const out = (value as TypedArray).slice();
    met.set(value, out);
    return out;
  }
  if (value instanceof Map) {
    const out = new Map<unknown, unknown>();
    met.set(value, out);
    for (const [k, v] of value) out.set(copy(k, met), copy(v, met));
    return out;
  }
  if (value instanceof Set) {
    const out = new Set<unknown>();
    met.set(value, out);
    for (const v of value) out.add(copy(v, met));
    return out;
  }
  // What is left must be an object whose whole content is its own properties.
  // A built-in that keeps its content elsewhere (a Date, a WeakMap) would copy
  // as an empty shell, so it is refused by name and never copied wrongly.
  const tag = Object.prototype.toString.call(value);
  if (tag !== "[object Object]") {
    throw new Error(`a Ui holds ${tag}, which the engine cannot copy for a cancel`);
  }
  const out: Record<string, unknown> = Object.create(Object.getPrototypeOf(value));
  met.set(value, out);
  for (const [k, v] of Object.entries(value)) out[k] = copy(v, met);
  return out;
}

/** A deep copy of `ui`, sharing nothing mutable with it. */
export function copyUi<Ui>(ui: Ui): Ui {
  return copy(ui, new Map()) as Ui;
}

/**
 * Make `ui` hold what `saved` holds, in place: the midend, and anything else
 * holding the `Ui`, keeps the object it has. `saved` is used up by this: its
 * parts become the `Ui`'s.
 */
export function restoreUi<Ui>(ui: Ui, saved: Ui): void {
  if (typeof ui !== "object" || ui === null) return;
  if (typeof saved !== "object" || saved === null) return;
  const live = ui as Record<string, unknown>;
  const kept = saved as Record<string, unknown>;
  for (const k of Object.keys(live)) if (!(k in kept)) delete live[k];
  Object.assign(live, kept);
}
