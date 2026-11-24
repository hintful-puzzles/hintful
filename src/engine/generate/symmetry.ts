/**
 * The symmetries a board's pattern of clues or blocks may keep, by what each
 * keeps the same: the board turned, or reflected in a line through its
 * middle. Upstream numbers them differently in each game (lightup.c's
 * `SYMM_REF2` reflects top to bottom, solo.c's left to right), so a game's
 * description names each choice's symmetry here, never by its number.
 */

export const SYMMETRIES = [
  "none",
  "halfTurn",
  "quarterTurn",
  "mirrorLeftRight",
  "mirrorTopBottom",
  "mirrorDiagonal",
  "mirrorBothWays",
  "mirrorBothDiagonals",
  "mirrorEightWays",
] as const;

export type Symmetry = (typeof SYMMETRIES)[number];

/** The symmetries that take a square to a square only on a square board:
 * those that turn it a quarter or reflect it in a diagonal. */
export const SQUARE_ONLY: ReadonlySet<Symmetry> = new Set([
  "quarterTurn",
  "mirrorDiagonal",
  "mirrorBothDiagonals",
  "mirrorEightWays",
]);

/** Upstream `set_blacks`' number (`symmetric-blacks.ts`'s `SYMM_*`) for each
 * symmetry it keeps, its 2-way mirror reflecting top to bottom. Here, not
 * there, so the description compiler reads it without the generator. */
export const SET_BLACKS_SYMM: Readonly<Partial<Record<Symmetry, number>>> = {
  none: 0,
  mirrorTopBottom: 1,
  halfTurn: 2,
  mirrorBothWays: 3,
  quarterTurn: 4,
};

/** The maps of (x, y) on a `w` by `h` board each symmetry is made of, the
 * identity left out. */
const MAPS: Readonly<
  Record<
    Symmetry,
    readonly ((x: number, y: number, w: number, h: number) => [number, number])[]
  >
> = {
  none: [],
  halfTurn: [(x, y, w, h) => [w - 1 - x, h - 1 - y]],
  quarterTurn: [
    (x, y, w) => [w - 1 - y, x],
    (x, y, w, h) => [w - 1 - x, h - 1 - y],
    (x, y, _w, h) => [y, h - 1 - x],
  ],
  mirrorLeftRight: [(x, y, w) => [w - 1 - x, y]],
  mirrorTopBottom: [(x, y, _w, h) => [x, h - 1 - y]],
  mirrorDiagonal: [(x, y) => [y, x]],
  mirrorBothWays: [
    (x, y, w) => [w - 1 - x, y],
    (x, y, _w, h) => [x, h - 1 - y],
    (x, y, w, h) => [w - 1 - x, h - 1 - y],
  ],
  mirrorBothDiagonals: [
    (x, y) => [y, x],
    (x, y, w, h) => [w - 1 - x, h - 1 - y],
    (x, y, w, h) => [w - 1 - y, h - 1 - x],
  ],
  mirrorEightWays: [
    (x, y, w) => [w - 1 - x, y],
    (x, y, _w, h) => [x, h - 1 - y],
    (x, y, w, h) => [w - 1 - x, h - 1 - y],
    (x, y) => [y, x],
    (x, y, w) => [y, w - 1 - x],
    (x, y, _w, h) => [h - 1 - y, x],
    (x, y, w, h) => [w - 1 - y, h - 1 - x],
  ],
};

/** The squares square `c` of a `w` by `h` board goes to under `s`, by index
 * in reading order: `c` first, each once. */
export function orbitOf(s: Symmetry, w: number, h: number, c: number): number[] {
  if (SQUARE_ONLY.has(s) && w !== h)
    throw new Error(`symmetry: ${s} needs a square board, not ${w}x${h}`);
  const x = c % w;
  const y = Math.floor(c / w);
  const out = [c];
  for (const map of MAPS[s]) {
    const [ix, iy] = map(x, y, w, h);
    const i = iy * w + ix;
    if (!out.includes(i)) out.push(i);
  }
  return out;
}
