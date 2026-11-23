/*
 * A deal is as symmetric as its description says: the clues a symmetric hide
 * leaves (`deal.symmetric`, Range's numbers under a half turn), and the cells
 * a sample lays first at an option's symmetry (`deal.sample.first.symmetry`,
 * Light Up's and Sticks' walls). For every born game whose compiled deal
 * declares either, each board dealt at its presets, and at each symmetry its
 * option offers on the first preset, has every such cell's partners too.
 *
 * The partners are written here from the geometry, apart from the
 * generator's copy (`engine/generate/symmetric-blacks.ts`), so a wrong copy
 * fails rather than agreeing with itself.
 */
import { describe, expect, it } from "vitest";
import { paramsError } from "../engine/game-id/params.ts";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { dealt } from "../engine/testing/dealt.ts";
import { leafPresets } from "../engine/testing/presets.ts";

const modules = import.meta.glob<Record<string, unknown>>(
  "../generated/games/*/*.compiled.ts",
  { eager: true },
);

interface DealShape {
  readonly hide?: string;
  readonly symmetric?: "halfTurn";
  readonly sample?: { readonly first?: { value: number; symmetry: string } };
  readonly options?: Readonly<Record<string, { default: number }>>;
}

/** The cells a cell at (x, y) of a w by h board must be matched by under
 * upstream's symmetry `symm` (`SYMM_*`: none, 2-way mirror, 2-way rotational,
 * 4-way mirror, 4-way rotational). */
function partners(symm: number, w: number, h: number, x: number, y: number): number[] {
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

type Params = { w: number; h: number; options?: Readonly<Record<string, number>> };

const symmetric = BORN_GAMES.flatMap((born) => {
  const entry = Object.entries(modules).find(([p]) =>
    p.endsWith(`/${born.id}.compiled.ts`),
  );
  const deal = entry?.[1]["deal"] as DealShape | undefined;
  if (deal === undefined) return [];
  const first = deal.sample?.first;
  if (deal.symmetric === undefined && first === undefined) return [];
  return [{ born, deal, first: first ?? null }];
});

describe("a deal is as symmetric as its description says", () => {
  it("reads a real population", () => {
    // Range's half-turned numbers, and Light Up's and Sticks' walls.
    expect(symmetric.map((s) => s.born.id).sort()).toEqual(
      expect.arrayContaining(["lightup", "range", "sticks"]),
    );
  });

  for (const { born, deal, first } of symmetric) {
    const { game } = born;
    const presets = leafPresets(game).map((e) => e.params as Params);
    const boards: Params[] = [...presets];
    if (first !== null) {
      const top = presets[0];
      for (let symm = 0; symm < 5; symm++) {
        const p = { ...top, options: { ...top.options, [first.symmetry]: symm } };
        if (paramsError(game, p, true) === null) boards.push(p);
      }
    }
    it(`${born.id}: has each cell's partners, on ${boards.length} boards`, () => {
      for (const p of boards) {
        const { desc } = dealt(game, p);
        const state = game.newState(p, desc) as {
          values: ArrayLike<number>;
          dealt: Record<string, { at: ArrayLike<number> }>;
        };
        const id = `${game.encodeParams(p, true)}:${desc}`;
        if (deal.symmetric !== undefined && deal.hide !== undefined) {
          const at = new Set(Array.from(state.dealt[deal.hide].at));
          for (const c of at)
            expect(at.has(p.w * p.h - 1 - c), `${id}: ${deal.hide} at ${c}`).toBe(true);
        }
        if (first !== null) {
          const symm =
            p.options?.[first.symmetry] ?? deal.options?.[first.symmetry]?.default ?? 0;
          const values = state.values;
          for (let c = 0; c < values.length; c++) {
            if (values[c] !== first.value) continue;
            for (const q of partners(symm, p.w, p.h, c % p.w, Math.floor(c / p.w)))
              expect(values[q], `${id}: symmetry ${symm}, ${c} and ${q}`).toBe(
                first.value,
              );
          }
        }
      }
    });
  }
});
