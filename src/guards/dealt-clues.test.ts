/*
 * A deal's clues are as its description says, where it says more than that
 * the answer keeps them (which the rules' guards hold of every board):
 *
 * - A value `deal.never` names (Boats' segment of unknown shape) is never
 *   dealt: the player is to find it.
 * - The kind hidden under a flag (its `when` in `deal.hide`, Boats' numbers) is dealt at
 *   every place it can sit with the flag off, and at fewer with it on.
 *
 * For every born game whose description declares either, each board dealt at
 * its presets, with the flag each way where it has one, is read back from
 * its desc and held to both.
 */
import { describe, expect, it } from "vitest";
import {
  type Clues,
  type FillBoard,
  type FillModule,
  spaceOf,
} from "../engine/fill/board.ts";
import { paramsError } from "../engine/game-id/params.ts";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { dealt } from "../engine/testing/dealt.ts";
import { leafPresets } from "../engine/testing/presets.ts";

/** Boards dealt at each params. */
const BOARDS = 2;

interface DealShape {
  /** The values of a kind `deal.never` names. */
  readonly withhold?: Readonly<Record<string, readonly number[]>>;
  /** The kind hidden under a flag, and the flag. */
  readonly hideFlag?: { readonly kind: string; readonly when: string };
}

/** What `born` declares of the two, the values from its description's
 * `never` and the flagged kind from its compiled hide. */
function shapeOf(born: (typeof BORN_GAMES)[number]): DealShape {
  const never = (born.description["deal"] as { never?: unknown } | undefined)?.never;
  const values =
    typeof never === "object" && never !== null && !Array.isArray(never)
      ? Object.entries(never).filter(([, v]) => Array.isArray(v))
      : [];
  const compiled = born.compiled["deal"] as {
    hide?: readonly { kind: string; when?: string }[];
  };
  const flagged = (compiled.hide ?? []).flatMap((h) =>
    h.when === undefined ? [] : [{ kind: h.kind, when: h.when }],
  );
  if (flagged.length > 1)
    throw new Error(`${born.id}: the guard reads one flagged kind`);
  return {
    ...(values.length === 0 ? {} : { withhold: Object.fromEntries(values) }),
    ...(flagged.length === 0 ? {} : { hideFlag: flagged[0] }),
  };
}

const declaring = BORN_GAMES.flatMap((born) => {
  const deal = shapeOf(born);
  const universes = (born.compiled["deal"] as { universes?: Record<string, string> })
    ?.universes;
  return deal.withhold === undefined && deal.hideFlag === undefined
    ? []
    : [{ born, deal, universes: universes ?? {} }];
});

type Params = { settings?: Readonly<Record<string, number>> };

describe("a deal's clues are as its description says", () => {
  it("reads a real population", () => {
    expect(declaring.map((d) => d.born.id)).toEqual(expect.arrayContaining(["boats"]));
  });

  for (const { born, deal, universes } of declaring) {
    const { game } = born;
    const module = born.compiled as unknown as FillModule<Clues<object>>;
    const boards: Params[] = leafPresets(game).flatMap(({ params }) => {
      const p = params as Params;
      const flag = deal.hideFlag;
      if (flag === undefined) return [p];
      return [0, 1]
        .map((on) => ({ ...p, settings: { ...p.settings, [flag.when]: on } }))
        .filter((q) => paramsError(game, q, true) === null);
    });
    it(`${born.id}: on ${boards.length} params, ${BOARDS} boards each`, () => {
      const wrong: string[] = [];
      let flagged = 0;
      // The withheld kind's clues read: a deal that dealt none tested nothing.
      let read = 0;
      for (const p of boards)
        for (let n = 0; n < BOARDS; n++) {
          const { desc } = dealt(game, p, n);
          const b = game.newState(p, desc) as FillBoard<Clues<object>>;
          const id = `${game.encodeParams(p, true)}:${desc}`;
          const list = (kind: string) =>
            b.dealt[kind as keyof typeof b.dealt] as unknown as {
              at: ArrayLike<number>;
              v: ArrayLike<number>;
            };
          for (const [kind, values] of Object.entries(deal.withhold ?? {}))
            for (const v of Array.from(list(kind).v)) {
              read++;
              if (values.includes(v)) wrong.push(`${id}: deals ${kind} ${v}`);
            }
          const flag = deal.hideFlag;
          if (flag === undefined) continue;
          const universe = universes[flag.kind];
          if (universe === undefined)
            throw new Error(`${born.id}: ${flag.kind} sits nowhere`);
          const places = (spaceOf(module, b) as unknown as Record<string, unknown[]>)[
            universe
          ].length;
          const shown = list(flag.kind).at.length;
          if (p.settings?.[flag.when] === 1) {
            flagged++;
            if (shown >= places) wrong.push(`${id}: hides no ${flag.kind}`);
          } else if (shown !== places)
            wrong.push(`${id}: shows ${shown} of ${places} ${flag.kind}`);
        }
      expect(wrong).toEqual([]);
      if (deal.hideFlag !== undefined) expect(flagged).toBeGreaterThan(0);
      if (deal.withhold !== undefined) expect(read).toBeGreaterThan(0);
    });
  }
});
