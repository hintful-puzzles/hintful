/*
 * What a placement brings (`Game.rulesOut`) is what the rules rule out with
 * it. For every born game whose description declares `rulesOut`, each
 * placement of a dealt board's answer, made alone on the fresh board, brings
 * exactly the open squares where the same value would break, together with
 * it, a statement that neither breaks alone. Laid in order on the board the
 * answer's earlier placements leave, each brings some of those, none set to
 * the placing value: the techniques a description names are a choice among
 * the rules' conclusions (Norinori's leave out a square between two shaded
 * ones), and a placement alone is where the help's rule is the whole of it.
 *
 * The squares are found here from the live rules (`Game.rules`), apart from
 * the techniques `bring` walks, so a technique that concludes too little or
 * too much fails rather than agreeing with itself. Two things are left out,
 * each for a reason any game shares:
 *
 * - A square the placement washes (`play.wash`, Light Up's lit squares):
 *   the board already shows it holding none, and the rules' grid reads it as
 *   decided.
 * - A matching (`matched(...)`, Tents' trees paired with tents): which
 *   partner a placement takes is settled by the whole board, never by the
 *   placement, so a square it rules out is no placement's to bring.
 *
 * The midend's walk with the preference on (`engine/midend/rules-out.test.ts`)
 * holds what is brought to be sound on every board it plays; this holds it
 * to be the rules' whole conclusion.
 */
import { describe, expect, it } from "vitest";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { dealt } from "../engine/testing/dealt.ts";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";
import { gatePresets } from "../engine/testing/hint-games.ts";

/** Boards dealt at each preset. */
const BOARDS = 2;

const declaring = BORN_GAMES.flatMap((born) => {
  const ro = born.compiled["RULES_OUT"] as { placing: number } | undefined;
  return ro === undefined ? [] : [{ born, placing: ro.placing }];
});

/** The statements of a description written as a matching. */
const matchings = (description: Readonly<Record<string, unknown>>): Set<string> => {
  const rules = (description["rules"] ?? {}) as Record<string, unknown>;
  return new Set(
    Object.entries(rules).flatMap(([name, text]) =>
      typeof text === "string" && /^\s*matched\(/.test(text) ? [name] : [],
    ),
  );
};

describe("a placement brings what the rules rule out with it", () => {
  it("reads a real population, every game that declares it", () => {
    expect(declaring.map((d) => d.born.id).sort()).toEqual(
      REGISTERED_GAMES.filter(([, g]) => g.rulesOut !== undefined)
        .map(([id]) => id)
        .sort(),
    );
    expect(declaring.length).toBeGreaterThanOrEqual(4);
  });

  for (const { born, placing } of declaring) {
    const { game } = born;
    const rules = game.rules;
    const bring = game.rulesOut?.bring;
    const skip = matchings(born.description);
    it(`${born.id}: brings each answer placement's squares, and no others`, () => {
      if (rules === undefined || bring === undefined)
        throw new Error(`${born.id} declares rulesOut and no rules`);
      let placements = 0;
      let brought = 0;
      const wrong: string[] = [];
      for (const { title, params } of gatePresets(game))
        for (let n = 0; n < BOARDS; n++) {
          const { desc } = dealt(game, params, n);
          const fresh = game.newState(params, desc);
          const solved = game.solve(fresh, fresh);
          if (!solved.ok) throw new Error(`${title} ${desc}: ${solved.error}`);
          const answer = rules.grid(game.executeMove(fresh, solved.move));
          const key = (v: { rule: string; clue: number; at: readonly number[] }) =>
            `${v.rule}|${v.clue}|${[...v.at].sort((a, b) => a - b).join(",")}`;
          const broken = (g: ArrayLike<number>) =>
            new Set(
              rules
                .violations(fresh, g)
                .filter((v) => !skip.has(v.rule))
                .map(key),
            );
          const placements_ = Array.from(answer.keys()).filter(
            (t) => answer[t] === placing && rules.grid(fresh)[t] === 0,
          );
          // Each placement alone on the fresh board, then each on the board
          // the answer's earlier ones leave: a domino is ruled on by its
          // second square.
          let laid = fresh;
          for (const inOrder of [false, true])
            for (const t of placements_) {
              const before = inOrder ? laid : fresh;
              const g0 = rules.grid(before);
              const holding = (cells: readonly number[]) => {
                const g = Uint16Array.from(g0);
                for (const c of cells) g[c] = placing;
                return g;
              };
              placements++;
              const placed = game.executeMove(before, { set: [t, placing] });
              if (inOrder) laid = placed;
              const set: readonly number[] = bring(before, placed)?.set ?? [];
              const got = set.filter((_, i) => i % 2 === 0).sort((a, b) => a - b);
              if (got.length > 0) brought++;
              const open = rules.grid(placed);
              const already = broken(g0);
              const alone = broken(holding([t]));
              const want: number[] = [];
              for (let c = 0; c < g0.length; c++) {
                if (c === t || open[c] !== 0) continue;
                const apart = broken(holding([c]));
                if (
                  [...broken(holding([t, c]))].some(
                    (k) => !alone.has(k) && !apart.has(k) && !already.has(k),
                  )
                )
                  want.push(c);
              }
              const values = set.filter((_, i) => i % 2 === 1);
              const fits = inOrder
                ? got.every((c) => want.includes(c)) && !values.includes(placing)
                : JSON.stringify(got) === JSON.stringify(want);
              if (!fits)
                wrong.push(
                  `${title} ${desc}, ${inOrder ? "in order" : "alone"} ${t}: brings ${JSON.stringify(got)}, the rules ${JSON.stringify(want)}`,
                );
            }
        }
      expect(wrong.slice(0, 5)).toEqual([]);
      // A walk that met no placement, or none that brings, tested nothing.
      expect(brought, `${born.id}: of ${placements} placements`).toBeGreaterThan(0);
    });
  }
});
