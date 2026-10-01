/**
 * Shared helpers for decoding upstream-format param strings
 * (`"10x7"`, `"7x7dn"`, ...). Upstream's `decode_params` walks the
 * string with `atoi` + manual pointer advances; the TS ports walk it
 * with `decimal.ts`'s `parseLeadingInt`, which returns both the parsed
 * value and the index to continue from.
 */

import { parseLeadingInt } from "./decimal.ts";
import type { ParamBounds, ParamConfigItem, ParamLabel } from "./game.ts";

/**
 * Parse an upstream `WxH`-or-square dimension prefix starting at
 * `start`: a width, then an optional `"x"` followed by a height, with a
 * **square** fallback (`h = w`) when no `"x"` is present. `next` is the
 * index of the first character after the consumed dimensions, so a
 * caller can continue parsing a trailing suffix (a difficulty letter,
 * `m<movetarget>`, ...).
 */
export function parseDimensions(
  s: string,
  start = 0,
): { w: number; h: number; next: number } {
  const wParse = parseLeadingInt(s, start);
  const w = wParse.value;
  if (s[wParse.next] === "x") {
    const hParse = parseLeadingInt(s, wParse.next + 1);
    return { w, h: hParse.value, next: hParse.next };
  }
  return { w, h: w, next: wParse.next };
}

/**
 * Parse a custom-params **text field** to an integer with `atoi`
 * semantics: the leading digit run, with an empty or non-numeric field
 * becoming 0. This is the right coercion for a `paramConfig` `set` on a
 * numeric field — 0 (or any out-of-range value) is then rejected by the
 * game's own `validateParams` with its message, whereas `Number.parseInt`
 * would yield `NaN`, which slips past every `<`/`>` bound check.
 */
export function parseConfigInt(v: string): number {
  return parseLeadingInt(v, 0).value;
}

/** C `atof`: parse a leading float, yielding 0 for garbage — never `NaN`,
 * which would slip past every `<`/`>` bound check in `validateParams`. Used
 * by any game with a `float` param (Netslide/Net's barrier probability,
 * Rectangles' expansion factor). */
export function atof(s: string): number {
  const value = Number.parseFloat(s);
  return Number.isNaN(value) ? 0 : value;
}

/**
 * Render a number the way C's `%g` does (`encode_params` writes floats with
 * it): six significant digits, trailing zeros stripped, switching to
 * exponential notation below 1e-4 or at/above 1e6. This is emphatically *not*
 * `String(x)` — that renders 1/3 as `0.3333333333333333`, which C would read
 * back (via {@link atof}) as a slightly different number than it wrote, so a
 * float param that round-trips through `String` can silently generate a
 * different board. Any game encoding a `float` param uses this. */
export function formatG(value: number): string {
  if (value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  if (exponent < -4 || exponent >= 6) {
    const [mantissa, exp] = value.toExponential(5).split("e");
    return `${stripTrailingZeros(mantissa)}e${exp[0]}${exp.slice(1).padStart(2, "0")}`;
  }
  return stripTrailingZeros(value.toFixed(Math.max(0, 5 - exponent)));
}

function stripTrailingZeros(s: string): string {
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

/**
 * Keys of `P` holding a **plain** `number`. Deliberately narrower than
 * "numeric key": a field typed as a literal union (a difficulty index
 * `0 | 1 | 2`) is excluded, because a free-text integer box must not be
 * allowed to write an out-of-union value into it.
 */
type PlainNumberKey<P> = {
  [K in keyof P]-?: number extends P[K] ? (P[K] extends number ? K : never) : never;
}[keyof P];

/** Which fields of `P` hold the width and the height. */
export interface DimensionFields<P> {
  w: PlainNumberKey<P>;
  h: PlainNumberKey<P>;
}

const DEFAULT_DIMENSION_FIELDS = { w: "w", h: "h" };

/**
 * `Game.transposeParams` for a game whose board is its width × height grid and
 * whose rules have no direction: the same params with the two exchanged. Takes
 * the field pair exactly as `dimensionParamConfig` does, so the two are
 * declared alike: `transposeParams: transposeDimensions()`.
 */
export function transposeDimensions<P extends { w: number; h: number }>(): (p: P) => P;
export function transposeDimensions<P>(fields: DimensionFields<P>): (p: P) => P;
export function transposeDimensions<P>(
  fields: DimensionFields<P> = DEFAULT_DIMENSION_FIELDS as DimensionFields<P>,
): (p: P) => P {
  return (p) => ({ ...p, [fields.w]: p[fields.h], [fields.h]: p[fields.w] });
}

/** What a game says about its width and height. */
export interface DimensionOptions<P> {
  /** What the pair means, for the help: "Size of the grid in squares." */
  doc: string;
  /** The range each must fall in. */
  bounds?: ParamBounds;
  /** The size's words in a params label, when `WxH` is not how this board is
   * sized: Ascent's hexagon is "Size 7". */
  size?: (p: P) => string | null;
}

/**
 * The two `width`/`height` `ParamConfigItem`s that virtually every grid
 * game's "Custom type…" dialog needs — the params analog of the shared
 * dimension *parser* above. A plain w/h game declares its whole custom
 * form as `paramConfig: dimensionParamConfig({ doc })`; a variant game
 * spreads these first and appends its own fields.
 *
 * A game whose params spell their dimensions differently (Mosaic's
 * `width`/`height`, Unruly's `w2`/`h2` — upstream names for the *full*
 * grid extent, not halves) passes the field pair rather than being
 * renamed to fit: `dimensionParamConfig<UnrulyParams>({ fields: { w: "w2",
 * h: "h2" }, doc })`.
 *
 * The labels (`"Width"`/`"Height"`) are upstream's, and the `kw`s are their
 * slugs. Each field renders as a text box (upstream's `C_STRING`) whose `set`
 * parses the leading integer exactly as upstream's `atoi` does (empty or
 * non-numeric → 0, which `bounds` or the game's `validateParams` then
 * rejects). The pair is one entry in the help, and labels a params set `WxH`.
 */
export function dimensionParamConfig<P extends { w: number; h: number }>(
  opts: DimensionOptions<P>,
): ParamConfigItem<P>[];
export function dimensionParamConfig<P>(
  opts: DimensionOptions<P> & { fields: DimensionFields<P> },
): ParamConfigItem<P>[];
export function dimensionParamConfig<P>(
  opts: DimensionOptions<P> & { fields?: DimensionFields<P> },
): ParamConfigItem<P>[] {
  const fields = opts.fields ?? (DEFAULT_DIMENSION_FIELDS as DimensionFields<P>);
  const bounds = opts.bounds ? { bounds: opts.bounds } : {};
  return [
    numberItem<P>("width", "Width", fields.w, {
      doc: opts.doc,
      ...bounds,
      label: {
        slot: "size",
        words: opts.size ?? ((p) => `${p[fields.w]}x${p[fields.h]}`),
      },
    }),
    numberItem<P>("height", "Height", fields.h, { doc: { with: "width" }, ...bounds }),
  ];
}

/**
 * A text field holding a plain integer: `get` renders it, `set` parses it the
 * way upstream's `atoi` does ({@link parseConfigInt}). The common shape of a
 * count — Mines' mines, Map's regions, Untangle's points.
 */
export function numberItem<P>(
  kw: string,
  name: string,
  field: PlainNumberKey<P>,
  opts: {
    doc: ParamConfigItem<P>["doc"];
    bounds?: ParamBounds;
    label?: ParamLabel<P>;
  },
): ParamConfigItem<P> {
  return {
    kw,
    name,
    type: "string",
    ...opts,
    get: (p) => String(p[field]),
    set: (p, v) => {
      // `PlainNumberKey` guarantees this field holds a plain `number`, but TS
      // cannot narrow a write through a generic key, so the target is asserted.
      (p as Record<PlainNumberKey<P>, number>)[field] = parseConfigInt(v);
    },
  };
}

/** A square board's size words, `NxN`, for a game sized by one number. */
export function squareSize<P>(field: PlainNumberKey<P>): (p: P) => string {
  return (p) => `${p[field]}x${p[field]}`;
}

/**
 * A `validateParams` refusal for a board whose area would overflow what the
 * game's arrays or arithmetic can hold. Where the ceiling sits is each game's
 * own; the words are the same in every game that has one.
 */
export const AREA_TOO_LARGE = "Width times height must not be unreasonably large";

/**
 * Why these params cannot be played, or `null` — the one validity check the
 * midend and every test go through.
 *
 * It checks what the `paramConfig` items declare first: a numeric field inside
 * its `bounds`, and a choice inside its list. Then the game's own
 * `validateParams`, for what depends on more than one field. The messages here
 * name the field by the label the Custom dialog shows it with, so a refusal
 * always says which box to change.
 */
export function paramsError<P>(
  game: {
    paramConfig?: readonly ParamConfigItem<P>[];
    validateParams?(p: P, full: boolean): string | null;
  },
  p: P,
  full: boolean,
): string | null {
  for (const item of game.paramConfig ?? []) {
    const error = itemError(item, p, full);
    if (error !== null) return error;
  }
  return game.validateParams?.(p, full) ?? null;
}

function itemError<P>(item: ParamConfigItem<P>, p: P, full: boolean): string | null {
  if (item.type === "string" && item.bounds) {
    const { min, max } = item.bounds;
    // Negated so that a value that is not a number at all fails both.
    const value = Number(item.get(p));
    if (min !== undefined && !(value >= min))
      return `${item.name} must be at least ${min}`;
    if (max !== undefined && !(value <= max))
      return `${item.name} must be at most ${max}`;
  }
  if (item.type === "choices") {
    const index = item.get(p);
    const accepted = item.choices.length + (full ? 0 : (item.retired ?? 0));
    if (!(Number.isInteger(index) && index >= 0 && index < accepted))
      return `${item.name} must be one of ${item.choices.join(", ")}`;
  }
  return null;
}
