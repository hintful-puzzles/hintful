/** What compiled code calls for its set algebra and exact arithmetic: a set
 * of values as a bitmask, a set of elements as an ordered array
 * (`describe-runtime.ts`). */

// --- what the generated code calls for its set algebra -------------------

/** The members of a set of values, counted in a fixed number of steps, as
 * compiled code counts a subset many times a scan. */
export function popcount(m: number): number {
  let v = m - ((m >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (Math.imul((v + (v >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24) & 0xff;
}

/**
 * An integer of a domain that is not finite, computed exactly: a double
 * exactly where it is a safe integer, and a `bigint` past that. Kept so, two
 * of them are equal exactly where `===` says, and `<` orders them, or one and
 * a number, as they are; a double's arithmetic is many times a `bigint`'s
 * speed, and few values leave it.
 */
type Exact = number | bigint;

/** `v` as an `Exact`: a double where it is a safe integer. */
function exactOf(v: bigint): Exact {
  const n = Number(v);
  return Number.isSafeInteger(n) ? n : v;
}

// A double's result of two safe integers is exact where it is a safe
// integer: a true result past one rounds to a double past one too. A
// quotient's double is never rounded across a whole number, since the
// numbers are below 2^53. Division by zero leaves the doubles, and BigInt
// throws.

export function iadd(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a + b))
    return a + b;
  return exactOf(BigInt(a) + BigInt(b));
}

export function isub(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a - b))
    return a - b;
  return exactOf(BigInt(a) - BigInt(b));
}

export function imul(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number" && Number.isSafeInteger(a * b))
    return a * b + 0;
  return exactOf(BigInt(a) * BigInt(b));
}

/** The quotient, truncated. */
export function idiv(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number") {
    const q = Math.trunc(a / b);
    if (Number.isSafeInteger(q)) return q + 0;
  }
  return exactOf(BigInt(a) / BigInt(b));
}

/** The remainder, with the dividend's sign. */
export function imod(a: Exact, b: Exact): Exact {
  if (typeof a === "number" && typeof b === "number") {
    const r = a % b;
    if (Number.isSafeInteger(r)) return r + 0;
  }
  return exactOf(BigInt(a) % BigInt(b));
}

/** An exact integer as a layer whose domain is not finite holds it: a double,
 * a safe integer, so that a read of the layer is exact as it is. */
export function held(v: Exact): number {
  if (typeof v === "bigint")
    throw new RangeError(`${v} is past what a layer holds exactly`);
  return v;
}

/** The least value of a set of values, or `-1`. */
export function least(m: number): number {
  return m === 0 ? -1 : 31 - Math.clz32(m & -m);
}

/** A set of values' members, ascending. */
export function valuesOf(m: number): number[] {
  const out: number[] = [];
  for (let v = m; v; v &= v - 1) out.push(31 - Math.clz32(v & -v));
  return out;
}

/** `{a, b, ...}` of elements: each once, in the order written. */
export function setOf(...xs: number[]): number[] {
  const out: number[] = [];
  for (const x of xs) if (!out.includes(x)) out.push(x);
  return out;
}

/** `a + b` of element sets: `a`, then what `b` adds, in order. */
export function union(a: readonly number[], b: readonly number[]): number[] {
  const out = a.slice();
  // A scan of `out` for each member is quadratic, which a reach over a whole
  // board (Net's) spends most of its time in; marks pay only past a few.
  if (a.length + b.length <= SMALL_SET) {
    for (const x of b) if (!out.includes(x)) out.push(x);
    return out;
  }
  const ep = stamped(a, b);
  if (ep < 0) {
    const seen = new Set(a);
    for (const x of b)
      if (!seen.has(x)) {
        seen.add(x);
        out.push(x);
      }
    return out;
  }
  for (const x of b)
    if (setMarks[x] !== ep) {
      setMarks[x] = ep;
      out.push(x);
    }
  return out;
}

/** Which elements a set holds, by index past the element (`none` at 0), so
 * a set bound once and asked about in a loop is asked in constant time. */
export function memberMarks(s: readonly number[]): Uint8Array {
  let top = -1;
  for (const x of s) if (x > top) top = x;
  const m = new Uint8Array(top + 2);
  for (const x of s) m[x + 1] = 1;
  return m;
}

/** A comprehension's marks on what it has kept, by element, as
 * {@link stamped}'s are: one a site, a pass each time the site is made. */
export interface Stamps {
  m: Int32Array;
  pass: number;
  /** The pass whose members so far are all stamped. */
  full: number;
}

export function stamps(): Stamps {
  return { m: new Int32Array(0), pass: 0, full: 0 };
}

/** Add `t` to the set `r` a comprehension is making, where it has not yet
 * been added this pass. */
export function addOnce(r: number[], s: Stamps, t: number): void {
  // The members added before the first call of a pass were scanned for, not
  // stamped (the compiled site scans a short set itself).
  if (s.full !== s.pass) {
    s.full = s.pass;
    for (const x of r) if (x >= 0) stampOne(s, x);
  }
  if (t < 0) {
    if (!r.includes(t)) r.push(t);
    return;
  }
  if (t < s.m.length && s.m[t] === s.pass) return;
  stampOne(s, t);
  r.push(t);
}

function stampOne(s: Stamps, t: number): void {
  if (t >= s.m.length) {
    const m = new Int32Array(Math.max(64, 2 * t + 2));
    m.set(s.m);
    s.m = m;
  }
  s.m[t] = s.pass;
}

/** `a - b` of element sets, in `a`'s order. */
export function minus(a: readonly number[], b: readonly number[]): number[] {
  if (b.length <= SMALL_SET) return a.filter((x) => !b.includes(x));
  const ep = stamped(b, a);
  if (ep < 0) {
    const gone = new Set(b);
    return a.filter((x) => !gone.has(x));
  }
  return a.filter((x) => setMarks[x] !== ep);
}

/** The size up to which a scan beats marking. */
const SMALL_SET = 16;

/** Marks on elements, by index: an element is marked in a pass where its
 * entry holds the pass's number, so a pass starts without clearing any. One
 * pass is live at a time, and only inside the function that started it. A
 * `Set` cost Net's reach over the whole board a tenth of a deal. */
let setMarks = new Int32Array(1024);
let setPass = 0;

/** Start a pass that marks `marked`, sized for every element of it and of
 * `also`; `-1` where either holds `none`, which no entry can mark. */
function stamped(marked: readonly number[], also: readonly number[]): number {
  let top = setMarks.length - 1;
  let least = 0;
  for (const x of marked)
    if (x > top) top = x;
    else if (x < least) least = x;
  for (const x of also)
    if (x > top) top = x;
    else if (x < least) least = x;
  if (least < 0) return -1;
  if (top >= setMarks.length) setMarks = new Int32Array(2 * top + 2);
  if (setPass === 0x7fffffff) {
    setMarks.fill(0);
    setPass = 0;
  }
  const ep = ++setPass;
  for (const x of marked) setMarks[x] = ep;
  return ep;
}

/** `a subset b` of element sets. */
export function subsetOf(a: readonly number[], b: readonly number[]): boolean {
  return a.every((x) => b.includes(x));
}

/** `a = b` of element sets: the same members, whatever their order. */
export function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && subsetOf(a, b);
}

/** `before(x, L)`: the members of `L` ahead of `x`, none where `x` is not
 * one. */
export function before(x: number, L: readonly number[]): readonly number[] {
  const i = L.indexOf(x);
  return i < 0 ? [] : L.slice(0, i);
}

export function mergeSorted(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) out.push(a[i] < b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}

/** The next mask above `k` with as many bits set (Gosper's hack), so a
 * `subsets` binder of one size counts only those. */
export function nextOfSize(k: number): number {
  const c = k & -k;
  const r = k + c;
  return (((r ^ k) >>> 2) / c) | r;
}

const faceLists: number[][] = [];

/** `faces`, on a board with `n` of them: each numbered, in order. */
export function facesOf(n: number): readonly number[] {
  faceLists[n] ??= Array.from({ length: n }, (_, f) => f);
  return faceLists[n];
}

/** `range(a, b)` as a set of values. A value outside 0 to 31 has no place in
 * a 32-bit mask, and `1 << d` would put it at `d mod 32` without a word. */
export function rangeMask(a: number, b: number): number {
  if (a > b) return 0;
  if (a < 0 || b > 31)
    throw new RangeError(`range(${a}, ${b}): a set holds only the values 0 to 31`);
  // Bits a to b at once, where b + 1 is a place of a 32-bit mask.
  if (b < 30) return (2 << b) - (1 << a);
  let m = 0;
  for (let d = a; d <= b; d++) m |= 1 << d;
  return m;
}
