/**
 * The cells a dealt cell must be matched by under upstream's symmetries,
 * written from the geometry apart from the generator's copy
 * (`engine/generate/symmetric-blacks.ts`), so a test of a symmetric deal
 * fails on a wrong copy rather than agreeing with itself.
 */

/** The cells a cell at (x, y) of a w by h board must be matched by under
 * upstream's symmetry `symm` (`SYMM_*`: none, 2-way mirror, 2-way rotational,
 * 4-way mirror, 4-way rotational). */
export function partners(
  symm: number,
  w: number,
  h: number,
  x: number,
  y: number,
): number[] {
  const at = ([px, py]: [number, number]) => py * w + px;
  const flipV: [number, number] = [x, h - 1 - y];
  const half: [number, number] = [w - 1 - x, h - 1 - y];
  switch (symm) {
    case 0:
      return [];
    case 1:
      return [at(flipV)];
    case 2:
      return [at(half)];
    case 3:
      return [at(flipV), at([w - 1 - x, y]), at(half)];
    case 4:
      return [at([w - 1 - y, x]), at(half), at([y, h - 1 - x])];
    default:
      throw new Error(`no symmetry ${symm}`);
  }
}
