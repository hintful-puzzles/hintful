/** The dealt clues as a compiled technique reads them: by place, element
 * or value, as lists, and the runs a list's clues fit
 * (`describe-runtime.ts`). */

/** A clue kind as dealt: the element each clue sits at and its value, by
 * clue index; and at each element, the clue there and its value (`-1` where
 * there is none). `clueAt` reads the value by element, one load a read where
 * the clue's index would make it two. */
export interface ClueList {
  readonly at: Int32Array;
  readonly v: Int32Array;
  readonly byAt: Int32Array;
  readonly valueAt: Int32Array;
}

/** The clue list of `n` clues, over `elements` elements to sit at. */
export function clueList(
  at: readonly number[],
  v: readonly number[],
  elements: number,
): ClueList {
  const byAt = new Int32Array(elements).fill(-1);
  const valueAt = new Int32Array(elements).fill(-1);
  at.forEach((e, k) => {
    byAt[e] = k;
    valueAt[e] = v[k];
  });
  return { at: Int32Array.from(at), v: Int32Array.from(v), byAt, valueAt };
}

/** The clue list of the elements of `values` where `given` holds, in order,
 * each with `value` its value (by default the value it holds). */
export function cluesWhere(
  values: ArrayLike<number>,
  given: (v: number, e: number) => boolean,
  value: (v: number, e: number) => number = (v) => v,
): ClueList {
  const at: number[] = [];
  const v: number[] = [];
  for (let e = 0; e < values.length; e++) {
    if (!given(values[e], e)) continue;
    at.push(e);
    v.push(value(values[e], e));
  }
  return clueList(at, v, values.length);
}

/**
 * `make` once a board: what it made for an object is kept for the object's
 * life, so a board's deal is one object across its solves, and what a
 * compiled technique keeps for a board (by its deal) is kept with it. Where
 * the object is changed in place between solves (a generator's working
 * array), `still` says whether what was made for it holds yet, given what
 * else `make` reads (`more`).
 */
export function perBoard<K extends object, V, A extends unknown[] = []>(
  make: (k: K, ...more: A) => V,
  still: (made: V, k: K, ...more: A) => boolean = () => true,
): (k: K, ...more: A) => V {
  const kept = new WeakMap<K, V>();
  return (k, ...more) => {
    const had = kept.get(k);
    if (had !== undefined && still(had, k, ...more)) return had;
    const made = make(k, ...more);
    kept.set(k, made);
    return made;
  };
}

/** Each clue list's elements by the value of the clue there, built at the
 * first read: a list is never changed once made. */
const byValue = new WeakMap<ClueList, Map<number, number[]>>();
const NO_ELEMENTS: readonly number[] = [];

/** `{x in cells where clue(kind, x) = v}`: the elements whose clue holds
 * `v`, `-1` for none, in order, read off an index rather than a scan of
 * every element. */
export function cluesValued(list: ClueList, v: number): readonly number[] {
  let index = byValue.get(list);
  if (index === undefined) {
    index = new Map();
    for (let x = 0; x < list.byAt.length; x++) {
      // An element with no clue reads as -1, as `clueAt` reads it.
      const held = clueAt(list, x);
      const at = index.get(held);
      if (at === undefined) index.set(held, [x]);
      else at.push(x);
    }
    byValue.set(list, index);
  }
  return index.get(v) ?? NO_ELEMENTS;
}

/** Where a clue of a kind dealt once for each value (`per: value`) sits: at
 * its element `x` for the value `d`, both read back by {@link perElement}
 * and {@link perValue}. A value fits the candidate bitmask's 31 bits. */
export function perPlace(x: number, d: number): number {
  return x * 32 + d;
}
export function perElement(place: number): number {
  return place >> 5;
}
export function perValue(place: number): number {
  return place & 31;
}

/** `clue(kind, x)`: the value of the clue at `x`, or `-1`. */
export function clueAt(list: ClueList, x: number): number {
  return x < 0 ? -1 : list.valueAt[x];
}

/** A clue kind whose clue is a list of numbers (`list: true`), as dealt:
 * the element each clue sits at and its list, by clue index, and the clue
 * at each element (`-1` where there is none). */
export interface ListClues {
  readonly at: Int32Array;
  readonly lists: readonly Int32Array[];
  readonly byAt: Int32Array;
}

/** The list clues `lists`, each at its element of `at`, over `elements`
 * elements to sit at. */
export function listClues(
  at: readonly number[],
  lists: readonly (readonly number[])[],
  elements: number,
): ListClues {
  const byAt = new Int32Array(elements).fill(-1);
  at.forEach((e, k) => {
    byAt[e] = k;
  });
  return {
    at: Int32Array.from(at),
    lists: lists.map((l) => Int32Array.from(l)),
    byAt,
  };
}

/** `clue(kind, x)` of a list kind: the list at `x`, or `null`. */
export function listAt(clues: ListClues, x: number): Int32Array | null {
  const k = x < 0 ? -1 : clues.byAt[x];
  return k < 0 ? null : clues.lists[k];
}

/** `A = B` of two lists: the same numbers in the same order. A list a
 * clue kind has none of equals nothing. */
export function sameList(
  a: ArrayLike<number> | null,
  b: ArrayLike<number> | null,
): boolean {
  if (a === null || b === null || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** `|l|` of a list: how many numbers it holds, none for a list a clue kind
 * has none of. */
export function listLength(l: ArrayLike<number> | null): number {
  return l === null ? 0 : l.length;
}

/** `nth(l, i)`: the list's member at `i`, counted from 0, or none (`-1`)
 * past either end. */
export function nth(l: ArrayLike<number> | null, i: number): number {
  return l === null || i < 0 || i >= l.length ? -1 : l[i];
}

/** `runs(L, S)`: the lengths of the maximal runs of `S` along the line
 * `L`, in `L`'s order. */
export function runsOf(L: readonly number[], S: readonly number[]): Int32Array {
  const out: number[] = [];
  let run = 0;
  for (const c of L) {
    if (S.includes(c)) run++;
    else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return Int32Array.from(out);
}

/** Scratch for {@link runFits}, grown to the longest line asked. */
let fitFrom = new Uint8Array(0);
let fitTo = new Uint8Array(0);
let fitBlocked = new Int32Array(0);
let fitClear = new Uint8Array(0);
let fitCover = new Int32Array(0);
let fitEnd = new Int32Array(0);

/** {@link runFits}' last question and answer about each list of lengths: a
 * technique asks one line again for each of its squares, the pin alone
 * differing, which the projection answers for all of them, and a solve asks
 * every line again each pass, most of them unchanged since. */
interface FitsAsked {
  masks: Int32Array;
  v: number;
  fits: boolean;
  out: Int32Array;
}
const asked = new WeakMap<object, FitsAsked>();

/**
 * Whether some filling of a line's `n` squares, each a value of its mask in
 * `masks` (bit `d` for value `d`), has its squares of value `v` in runs of
 * the lengths `R`, in order: `exists fill f of cells(L): run_lengths(L, {x in
 * cells(L) where f(x) = v}) = R`, compiled. Where `out` is given, each
 * square's place in it gets the values that square takes in some such
 * filling, the projection a pinned `f(x) = t` reads.
 *
 * A dynamic program over the places a run may start, `(i, j)`: the first
 * `i` squares filled with `j` runs, the square before `i` not `v`. Every
 * filling is one path through it, so the work is the line's length times
 * its runs, where listing the fillings is exponential in the line's length
 * (a line of 30 with seven runs of 1 has 346,104).
 */
export function runFits(
  masks: Int32Array,
  n: number,
  v: number,
  R: ArrayLike<number> | null,
  out: Int32Array | null,
): boolean {
  if (R === null) return false;
  let last = asked.get(R);
  if (last !== undefined && last.masks.length === n && last.v === v) {
    let same = true;
    for (let i = 0; i < n && same; i++) same = masks[i] === last.masks[i];
    if (same) {
      if (out !== null) out.set(last.out);
      return last.fits;
    }
  }
  if (last === undefined || last.masks.length !== n) {
    last = { masks: new Int32Array(n), v, fits: false, out: new Int32Array(n) };
    asked.set(R, last);
  }
  last.masks.set(masks.subarray(0, n));
  last.v = v;
  last.fits = fitsOf(masks, n, v, R, last.out);
  if (out !== null) out.set(last.out);
  return last.fits;
}

/** {@link runFits}, asked afresh: `out`, where given, is emptied where no
 * filling fits. */
function fitsOf(
  masks: Int32Array,
  n: number,
  v: number,
  R: ArrayLike<number>,
  out: Int32Array | null,
): boolean {
  const k = R.length;
  const bit = 1 << v;
  const stride = n + 1;
  const size = (k + 1) * stride;
  if (fitFrom.length < size) {
    fitFrom = new Uint8Array(size * 2);
    fitTo = new Uint8Array(size * 2);
  }
  if (fitBlocked.length < n + 1) {
    fitBlocked = new Int32Array((n + 1) * 2);
    fitClear = new Uint8Array((n + 1) * 2);
    fitCover = new Int32Array((n + 1) * 2);
  }
  if (fitEnd.length < size) fitEnd = new Int32Array(size * 2);
  const blocked = fitBlocked;
  const clear = fitClear;
  // How many squares before each place cannot hold `v`, and whether each
  // square can hold another value.
  blocked[0] = 0;
  for (let i = 0; i < n; i++) {
    blocked[i + 1] = blocked[i] + ((masks[i] & bit) === 0 ? 1 : 0);
    clear[i] = (masks[i] & ~bit) !== 0 ? 1 : 0;
  }
  // Where the j-th run from place i leads: its squares all may hold `v`, and
  // the square after it, if any, may hold another value; -1 where it cannot.
  const end = fitEnd;
  for (let j = 0; j < k; j++) {
    const r = R[j];
    for (let i = 0; i < n; i++) {
      const e = i + r;
      end[j * stride + i] =
        r <= 0 || e > n || blocked[e] - blocked[i] > 0
          ? -1
          : e === n
            ? n
            : clear[e]
              ? e + 1
              : -1;
    }
  }
  const from = fitFrom;
  const to = fitTo;
  from.fill(0, 0, size);
  to.fill(0, 0, size);
  from[0] = 1;
  for (let j = 0; j <= k; j++)
    for (let i = 0; i < n; i++) {
      if (!from[j * stride + i]) continue;
      if (clear[i]) from[j * stride + i + 1] = 1;
      if (j < k) {
        const e = end[j * stride + i];
        if (e >= 0) from[(j + 1) * stride + e] = 1;
      }
    }
  if (!from[k * stride + n]) {
    out?.fill(0, 0, n);
    return false;
  }
  if (out === null) return true;
  to[k * stride + n] = 1;
  for (let j = k; j >= 0; j--)
    for (let i = n - 1; i >= 0; i--) {
      let reach = clear[i] === 1 && to[j * stride + i + 1] === 1;
      if (!reach && j < k) {
        const e = end[j * stride + i];
        reach = e >= 0 && to[(j + 1) * stride + e] === 1;
      }
      if (reach) to[j * stride + i] = 1;
    }
  // A square some run covers on a path through, counted by where each such
  // run starts and ends; a square a path passes clear.
  const cover = fitCover;
  cover.fill(0, 0, n + 1);
  out.fill(0, 0, n);
  for (let j = 0; j <= k; j++)
    for (let i = 0; i < n; i++) {
      if (!from[j * stride + i]) continue;
      if (clear[i] && to[j * stride + i + 1]) out[i] |= masks[i] & ~bit;
      if (j === k) continue;
      const e = end[j * stride + i];
      if (e < 0 || !to[(j + 1) * stride + e]) continue;
      const r = R[j];
      cover[i]++;
      cover[i + r]--;
      if (e > i + r) out[i + r] |= masks[i + r] & ~bit;
    }
  let covered = 0;
  for (let i = 0; i < n; i++) {
    covered += cover[i];
    if (covered > 0) out[i] |= bit;
  }
  return true;
}
