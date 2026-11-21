/**
 * Cross-game guarantee: **a live error mark is never a false alarm, and a
 * broken rule is marked.** A game's live errors are where its board breaks
 * its description's rules (`Game.rules`, `docs/rendering.md` § "Live errors
 * are the rules'"). The check is sound where no board on the way to an
 * answer is said to break one: so every board made by undeciding some of an
 * answer's elements has no violation. And it sees what it claims to: an
 * answer with one value changed breaks a rule, as the answer check says, on
 * most such boards, and the guard counts that it does.
 *
 * The population is every game that declares `rules`.
 */
import { expect, it } from "vitest";
import { dealt } from "../engine/testing/dealt.ts";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";
import { type AnyGame, gatePresets } from "../engine/testing/hint-games.ts";

const RULED: [string, AnyGame][] = REGISTERED_GAMES.filter(
  ([, g]) => g.rules !== undefined,
);

/** How many partial boards each answer is undecided into. */
const PARTIALS = 60;

it("drew a populated roster", () => {
  expect(RULED.length).toBeGreaterThan(0);
});

for (const [id, game] of RULED) {
  it(`${id}: no board on the way to an answer breaks a rule, and a changed answer does`, () => {
    const rules = game.rules as NonNullable<AnyGame["rules"]>;
    let planted = 0;
    let caught = 0;
    for (const { title, params } of gatePresets(game)) {
      const { desc } = dealt(game, params);
      const start = game.newState(params, desc);
      const solved = game.solve(start, start);
      if (!solved.ok) throw new Error(`${id}/${title}: no solution to check against`);
      const answer = game.executeMove(start, solved.move);
      const full = rules.grid(answer);
      expect(rules.violations(answer, full), `${id}/${title}: the answer`).toEqual([]);
      // A fixed sequence, so a failure names the same board each run.
      let seed = 12345;
      const next = (): number => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x80000000;
      };
      for (let i = 0; i < PARTIALS; i++) {
        const keep = next();
        const g = Uint8Array.from(full, (v) => (next() < keep ? v : 0));
        const found = rules.violations(answer, g);
        expect(
          found,
          `${id}/${title}: partial ${i} of the answer, ${[...g].join("")}`,
        ).toEqual([]);
      }
      const top = Math.max(...full);
      for (let x = 0; x < full.length; x++) {
        if (full[x] === 0) continue;
        for (let v = 1; v <= top; v++) {
          if (v === full[x]) continue;
          const g = Uint8Array.from(full);
          g[x] = v;
          planted++;
          if (rules.violations(answer, g).length > 0) caught++;
        }
      }
    }
    // A board with one value changed may still be an answer where the board
    // is not unique in that element; most are not.
    expect(planted, `${id}: no changed answers`).toBeGreaterThan(0);
    expect(
      caught / planted,
      `${id}: ${caught} of ${planted} changed answers caught`,
    ).toBeGreaterThan(0.9);
  });
}
