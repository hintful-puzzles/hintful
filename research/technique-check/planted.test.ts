/**
 * A planted defect in each of group C's stated ladders: a variant of one of
 * its techniques with one condition dropped or loosened, which the checker
 * must call unsound. A ladder whose every technique passes says nothing until
 * its checker has been seen to fail (CLAUDE.md, "Method").
 */
import { expect, it } from "vitest";
import * as L from "./ladders.ts";
import * as L2 from "./ladders2.ts";
import type { Edge } from "./numbers_loops.ts";
import {
  And,
  Atom,
  type Bound,
  checkTechnique,
  Forall,
  fixed,
  ite,
  lift,
  Not,
  Or,
  pad,
  range,
  say,
  sum,
  Technique,
  tup,
  Z3,
} from "./pzl.ts";
import type { Game } from "./shading.ts";
import { type Cell, cd, Grid } from "./space.ts";

const bad: string[] = [];

async function expectUnsound<X>(
  label: string,
  game: Game<X>,
  tech: Technique,
  split: number,
): Promise<void> {
  const t0 = performance.now();
  const { verdict } = await checkTechnique(game.rules, game.consistent, tech, {
    split,
    answerVars: game.answerVars,
    verify: game.verify,
  });
  const ok = verdict === "unsound";
  say(
    `${ok ? "ok " : "BAD"} ${pad(label, 66)} ${pad(verdict, 10)} ${fixed((performance.now() - t0) / 1000, 6)}s`,
  );
  if (!ok) bad.push(label);
}

it("planted", async () => {
  // Solo Jigsaw: intersect without "c is not in u1".
  {
    const g = new Grid(4, 4);
    const jig = L.solo(g, 2, 2, true);
    const { value, cand, units, unitCells: uc, digits } = jig.extra;
    const inUnit = (u: Bound, c: Bound) =>
      lift((uu: L.Unit, cc: Cell) => uc(uu).get(cc) ?? false, u, c);
    await expectUnsound(
      "Solo Jigsaw: intersect, c allowed inside u1",
      jig,
      new Technique(
        "intersect-planted",
        [
          ["u1", () => units],
          ["u2", () => units],
          ["d", () => digits],
          ["c", () => g.cells],
        ],
        (e) =>
          And(
            Forall(g.cells, (x) =>
              Or(
                Not(inUnit(e["u1"], x)),
                inUnit(e["u2"], x),
                lift((d: number) => Z3.Not(cand.at(cd(x, d))), e["d"]),
              ),
            ),
            inUnit(e["u2"], e["c"]),
          ),
        (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
      ),
      2,
    );
  }

  // Tectonic: starve without "a's area owes n".
  {
    const g = new Grid(4, 4);
    const tect = L.seismic(g, 4, true);
    const { value, cand, reg, clash } = tect.extra;
    await expectUnsound(
      "Tectonic: starve, the area need not owe n",
      tect,
      new Technique(
        "starve-planted",
        [
          ["a", () => g.cells],
          ["d", () => [1, 2, 3, 4, 5]],
          ["c", () => g.cells],
        ],
        (e) =>
          lift(
            (a: Cell, d: number, c: Cell) =>
              Z3.And(
                reg.label.at(c).neq(reg.label.at(a)),
                ...g.cells.map((h) =>
                  Z3.Implies(
                    Z3.And(reg.label.at(h).eq(reg.label.at(a)), cand.at(cd(h, d))),
                    clash(c, h, d),
                  ),
                ),
              ),
            e["a"],
            e["d"],
            e["c"],
          ),
        (e) => lift((c: Cell, d: number) => value.at(c).neq(d), e["c"], e["d"]),
      ),
      2,
    );
  }

  // Star Battle: full fires with one star still owed.
  {
    const g = new Grid(5, 5);
    const sb = L.starbattle(g, 1);
    const { value, mark, units, unitCells: uc, k } = sb.extra;
    const starsIn = (u: Bound) =>
      lift(
        (uu: L.Unit) =>
          sum(
            [...uc(uu)].map(([c, m]) =>
              ite(Z3.And(L.asBool(m), mark.at(c).eq(1)), 1, 0),
            ),
          ),
        u,
      );
    await expectUnsound(
      "Star Battle: full with need 1",
      sb,
      new Technique(
        "full-planted",
        [
          ["u", () => units],
          ["c", () => g.cells],
        ],
        (e) =>
          And(
            lift(
              (uu: L.Unit, cc: Cell) => L.asBool(uc(uu).get(cc) ?? false),
              e["u"],
              e["c"],
            ),
            lift((c: Cell) => mark.at(c).eq(2), e["c"]),
            Atom(Z3.Int.val(k).sub(starsIn(e["u"])).eq(1)),
          ),
        (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
      ),
      1,
    );
  }

  // Ascent Orthogonal: proximity off by one.
  {
    const asc = L2.ascent(3, 3, "orth");
    const { value, cand, cells, dist, N } = asc.extra;
    const nums = range(1, N + 1);
    const placed = (p: Cell, m: number) =>
      Z3.And(...nums.filter((k) => k !== m).map((k) => Z3.Not(cand.at(cd(p, k)))));
    await expectUnsound(
      "Ascent Orthogonal: proximity, dist >= |m - k|",
      asc,
      new Technique(
        "proximity-planted",
        [
          ["p", () => cells],
          ["m", () => nums],
          ["k", () => nums],
          ["c", () => cells],
        ],
        (e) =>
          lift(
            (p: Cell, m: number, k: number, c: Cell) =>
              Z3.And(
                placed(p, m),
                Z3.Bool.val(c !== p && dist(c, p) >= Math.abs(m - k)),
              ),
            e["p"],
            e["m"],
            e["k"],
            e["c"],
          ),
        (e) => lift((k: number, c: Cell) => value.at(c).neq(k), e["k"], e["c"]),
      ),
      2,
    );
  }

  // Pairs: forced counting a line it cannot take.
  {
    const pp = L2.pathGame(3, 3, "pairs");
    const { line, emark, at, takes, cells, edges } = pp.extra;
    const linesAt = (c: Cell) => sum(at.at(c).map((e) => ite(emark.at(e).eq(1), 1, 0)));
    await expectUnsound(
      "Pairs: forced with one live edge too many",
      pp,
      new Technique(
        "forced-planted",
        [
          ["c", () => cells],
          ["e", () => edges],
        ],
        (e) =>
          lift(
            (c: Cell, ed: Edge) =>
              Z3.And(
                Z3.Bool.val(at.at(c).includes(ed)),
                emark.at(ed).eq(2),
                linesAt(c)
                  .add(sum(at.at(c).map((x) => ite(emark.at(x).eq(2), 1, 0))))
                  .eq(takes(c).add(1)),
              ),
            e["c"],
            e["e"],
          ),
        (e) => lift((ed: Edge) => line.at(ed), e["e"]),
      ),
      2,
    );
  }

  // Flip Random: lastChance without every other flipper decided.
  {
    const fl = L2.flip(3, 3, "random");
    const { press, unlit, pmark, M, cells, order } = fl.extra;
    const ord = (c: Cell) => order.get(c) ?? -1;
    await expectUnsound(
      "Flip Random: lastChance, other flippers undecided",
      fl,
      new Technique(
        "lastChance-planted",
        [
          ["i", () => cells],
          ["j", () => cells],
        ],
        (e) =>
          lift(
            (i: Cell, j: Cell) =>
              Z3.And(
                M.at(tup(i, j)),
                ...cells
                  .filter((k) => ord(k) > ord(i))
                  .map((k) => Z3.Not(M.at(tup(k, j)))),
                L2.parity([
                  unlit.at(j),
                  ...cells
                    .filter((k) => k !== i)
                    .map((k) => Z3.And(M.at(tup(k, j)), pmark.at(k).eq(1))),
                ]),
              ),
            e["i"],
            e["j"],
          ),
        (e) => lift((i: Cell) => press.at(i), e["i"]),
      ),
      2,
    );
  }

  // Net wrapping: neighbor with the side agreement reversed.
  {
    const nt = L2.net(3, 3, true);
    const { cells, nbr, wireR, cand, rot } = nt.extra;
    const four = () => range(4);
    await expectUnsound(
      "Net wrapping: neighbor, agreement read as a clash",
      nt,
      new Technique(
        "neighbor-planted",
        [
          ["t", () => cells],
          ["r", four],
          ["d", four],
        ],
        (e) =>
          lift(
            (t: Cell, r: number, d: number) => {
              const u = nbr(t, d) as Cell;
              return Z3.And(
                ...range(4).map((q) =>
                  Z3.Implies(
                    cand.at(cd(u, q)),
                    Z3.Eq(wireR(u, (d + 2) % 4, q), wireR(t, d, r)),
                  ),
                ),
              );
            },
            e["t"],
            e["r"],
            e["d"],
          ),
        (e) => lift((t: Cell, r: number) => rot.at(t).neq(r), e["t"], e["r"]),
      ),
      3,
    );
  }

  say("");
  say(bad.length > 0 ? `FAILED: ${bad.join(", ")}` : "every planted defect caught");
  expect(bad).toEqual([]);
});
