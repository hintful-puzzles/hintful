/**
 * Loopy's parameters: the grid-type table, the difficulty table, and the
 * params codec / validator / preset menu built from them.
 *
 * Upstream generates four parallel arrays from one `GRIDLIST` macro
 * (`gridnames[]`, `grid_types[]`, `grid_size_limits[]`, `GRID_CONFIGS`) and
 * three more from `DIFFLIST`, because C has no better way to keep them in
 * step. Here each list is one `as const` table of objects, and the choice
 * names, the encode char and the min-size error messages are *derived* from it.
 */

import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { type GridType, gridValidateParams } from "../../engine/grid/index.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, num, paramsCodec } from "../../engine/params-codec.ts";

/**
 * Loopy's grid types, in **Loopy's own ordering** — which is deliberately not
 * `grid.ts`'s `GridType` ordering (`GRIDGEN_LIST`): Loopy's index 11 is Penrose
 * P2, where `GRIDGEN_LIST`'s is `greatdodecagonal`.
 *
 * **The array index is the wire format.** It is encoded into params as `t<n>`
 * and therefore into every saved game and shared game ID. As upstream warns:
 * *do not add values to this list except at the end, or old game ids will stop
 * working* — and never "tidy" it into `GRIDGEN_LIST` order.
 *
 * `amin` / `omin` are the per-type minimum sizes: both dimensions must be at
 * least `amin`, and at least one must be at least `omin`. They live here rather
 * than in the geometry because they are a *game* judgment about what makes a
 * playable board — `gridValidateParams` implements only the maximum-size
 * guards.
 */
export const LOOPY_GRIDS = [
  { title: "Squares", type: "square", amin: 3, omin: 3, turns: true },
  { title: "Triangular", type: "triangular", amin: 3, omin: 3, turns: false },
  { title: "Honeycomb", type: "honeycomb", amin: 3, omin: 3, turns: false },
  { title: "Snub-Square", type: "snubsquare", amin: 3, omin: 3, turns: true },
  { title: "Cairo", type: "cairo", amin: 3, omin: 4, turns: true },
  { title: "Great-Hexagonal", type: "greathexagonal", amin: 3, omin: 3, turns: false },
  { title: "Octagonal", type: "octagonal", amin: 3, omin: 3, turns: true },
  { title: "Kites", type: "kites", amin: 3, omin: 3, turns: false },
  { title: "Floret", type: "floret", amin: 1, omin: 2, turns: false },
  { title: "Dodecagonal", type: "dodecagonal", amin: 2, omin: 2, turns: false },
  {
    title: "Great-Dodecagonal",
    type: "greatdodecagonal",
    amin: 2,
    omin: 2,
    turns: false,
  },
  {
    title: "Penrose (kite/dart)",
    type: "penrose_p2_kite",
    amin: 3,
    omin: 3,
    turns: true,
  },
  {
    title: "Penrose (rhombs)",
    type: "penrose_p3_thick",
    amin: 3,
    omin: 3,
    turns: true,
  },
  {
    title: "Great-Great-Dodecagonal",
    type: "greatgreatdodecagonal",
    amin: 2,
    omin: 2,
    turns: false,
  },
  { title: "Kagome", type: "kagome", amin: 3, omin: 3, turns: false },
  {
    title: "Compass-Dodecagonal",
    type: "compassdodecagonal",
    amin: 2,
    omin: 2,
    turns: true,
  },
  { title: "Hats", type: "hats", amin: 6, omin: 6, turns: false },
  { title: "Spectres", type: "spectres", amin: 6, omin: 6, turns: true },
] as const satisfies readonly {
  title: string;
  type: GridType;
  amin: number;
  omin: number;
  /** Whether a patch `h` wide and `w` tall is this same tiling turned on its
   * side, so the board may be dealt either way round. True of the tilings with
   * a square's symmetry and of the aperiodic ones whose patch fills its box
   * alike both ways; `orientation.test.ts` holds each to its drawn size
   * exchanging exactly. A triangle or hexagon lattice turned is another
   * tiling, and Hats' patch is not the same shape turned. */
  turns: boolean;
}[];

/** Difficulty levels, in encode order: a level's letter is its params encoding
 * (`d<c>`), and its index the internal `diff` value the solver caps its rungs
 * by. */
const LOOPY_DIFF_CHARS = "enth";
export const LOOPY_DIFFS: readonly string[] = tierNames(LOOPY_DIFF_CHARS.length);

export const DIFF_EASY = 0;
export const DIFF_NORMAL = 1;
export const DIFF_TRICKY = 2;
export const DIFF_HARD = 3;
/** One past the hardest difficulty. Doubles as the solver rungs' "no progress"
 * sentinel, exactly as upstream. */
export const DIFF_MAX = 4;

export interface LoopyParams {
  w: number;
  h: number;
  /** Index into {@link LOOPY_DIFFS}. */
  diff: number;
  /** Index into {@link LOOPY_GRIDS} — Loopy's ordering, not `GridType`'s. */
  type: number;
}

/** The `grid.ts` tiling a Loopy grid-type index selects. */
export function gridTypeOf(p: LoopyParams): GridType {
  return LOOPY_GRIDS[p.type].type;
}

export function defaultParams(): LoopyParams {
  return { w: 10, h: 10, diff: DIFF_EASY, type: 0 };
}

export function validateParams(p: LoopyParams, _full: boolean): string | null {
  const { amin, omin, type } = LOOPY_GRIDS[p.type];
  if (p.w < amin || p.h < amin)
    return `Width and height for this grid type must both be at least ${amin}`;
  if (p.w < omin && p.h < omin)
    return `At least one of width and height for this grid type must be at least ${omin}`;
  // A deliberate divergence: upstream accepts these params and then *aborts*
  // during generation. A Penrose kite/dart patch of width 3 comes out empty for
  // every seed and every height — 0 successes in 200 descriptions for each of
  // 3x3 through 3x8, where every other aperiodic configuration surveyed
  // succeeds at least ~20% of the time — so `buildLoopyGrid`'s retry cannot
  // rescue it. Rejecting it here lets the Custom dialog show a reason instead
  // of failing on "New game". A width bound, not an `amin` bump: 4x3 and wider
  // generate fine.
  if (type === "penrose_p2_kite" && p.w < 4)
    return "Width for Penrose (kite/dart) must be at least 4";
  return gridValidateParams(type, p.w, p.h);
}

export const paramConfig: ParamConfigItem<LoopyParams>[] = [
  ...dimensionParamConfig<LoopyParams>({
    doc: "Size of the board, counted in the chosen tiling's own repeating units rather than in faces, so the same numbers make boards of quite different sizes on different tilings. Each tiling has a smallest size it allows: at least 3 by 3 for most (with one side at least 4 for Cairo), 2 by 2 for the four dodecagonal ones, 1 by 2 for Floret, 6 by 6 for Hats and Spectres, and a width of at least 4 for Penrose (kite/dart).",
  }),
  {
    kw: "type",
    name: "Grid type",
    type: "choices",
    choices: LOOPY_GRIDS.map((g) => g.title),
    doc: "The tiling the loop is drawn on. Squares, Triangular and Honeycomb (hexagons) are the familiar ones; Cairo is made of pentagons and Kites of kite shapes; Snub-Square, Great-Hexagonal, Octagonal, Floret, Dodecagonal, Great-Dodecagonal, Great-Great-Dodecagonal, Kagome and Compass-Dodecagonal each mix faces of more than one shape, or of an unusual one. Penrose (kite/dart), Penrose (rhombs), Hats and Spectres are aperiodic: their pattern never repeats.",
    label: { slot: "kind" },
    get: (p) => p.type,
    set: (p, v) => {
      p.type = v;
    },
  },
  difficultyItem(LOOPY_DIFFS, "diff"),
];

/** `<w>x<h>t<type>`, plus the generator-only `d<diffchar>`. Every part after
 * the width is optional: a missing height copies the width, and a missing type
 * or an unknown difficulty letter keeps its {@link defaultParams} value. The
 * type is its {@link LOOPY_GRIDS} index, which is the wire format. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  num(paramConfig, "t", {
    get: (p) => p.type,
    set: (p, v) => {
      p.type = v;
    },
  }),
  choice(paramConfig, "d", "difficulty", LOOPY_DIFF_CHARS, { full: true }),
]);

const preset = (w: number, h: number, diff: number, type: number): LoopyParams => ({
  w,
  h,
  diff,
  type,
});

const PRESETS_TOP: LoopyParams[] = [
  preset(7, 7, DIFF_EASY, 0),
  preset(10, 10, DIFF_EASY, 0),
  preset(7, 7, DIFF_NORMAL, 0),
  preset(10, 10, DIFF_NORMAL, 0),
  preset(7, 7, DIFF_HARD, 0),
  preset(10, 10, DIFF_HARD, 0),
  preset(9, 14, DIFF_HARD, 1), // Triangular
  preset(7, 7, DIFF_HARD, 3), // Snub-Square
  preset(9, 9, DIFF_HARD, 4), // Cairo
  preset(4, 6, DIFF_HARD, 7), // Kites
  preset(10, 10, DIFF_HARD, 11), // Penrose (kite/dart)
  preset(10, 10, DIFF_HARD, 12), // Penrose (rhombs)
];

// A tiling that cannot turn has sizes of its own that draw taller than wide,
// chosen to keep the drawn area of upstream's landscape preset.
const PRESETS_MORE: LoopyParams[] = [
  preset(10, 10, DIFF_HARD, 2), // Honeycomb
  preset(4, 5, DIFF_HARD, 5), // Great-Hexagonal
  preset(3, 6, DIFF_HARD, 14), // Kagome
  preset(7, 7, DIFF_HARD, 6), // Octagonal
  preset(5, 5, DIFF_HARD, 8), // Floret
  preset(3, 6, DIFF_HARD, 9), // Dodecagonal
  preset(3, 6, DIFF_HARD, 10), // Great-Dodecagonal
  preset(3, 5, DIFF_HARD, 13), // Great-Great-Dodecagonal
  preset(4, 5, DIFF_HARD, 15), // Compass-Dodecagonal
  preset(9, 11, DIFF_HARD, 16), // Hats
  preset(10, 10, DIFF_HARD, 17), // Spectres
];

/** `Game.transposeParams`: a tiling that turns (`LOOPY_GRIDS`' `turns`) is dealt
 * either way round; any other keeps the shape it was chosen at. */
export function transposeParams(p: LoopyParams): LoopyParams | null {
  return LOOPY_GRIDS[p.type].turns ? { ...p, w: p.h, h: p.w } : null;
}

/**
 * The **two-level** preset menu — unusual in this collection: the common grids
 * at the top level, the exotic tilings in a "More..." submenu. The app shell
 * renders a submenu as a labeled section rather than a nested flyout (see
 * `components/type-menu.ts`), which reads well, so the nesting is kept.
 */
export function presets(): PresetMenu<LoopyParams> {
  return {
    title: "Loopy",
    submenu: [
      ...PRESETS_TOP.map((p) => ({ params: p })),
      {
        title: "More...",
        submenu: PRESETS_MORE.map((p) => ({ params: p })),
      },
    ],
  };
}
