/**
 * Experiment C again, on the new compiler: each technique it found sound must
 * still be sound, and each planted variant still caught. Then the new forms,
 * each with a planted defect of its own (task 3.2).
 */
import { it, expect as vitestExpect } from "vitest";
import {
  And,
  Atom,
  type B,
  Connected,
  checkEntails,
  checkTechnique,
  cmp,
  type Dict,
  type Env,
  ExistsFill,
  Forall,
  ForallFill,
  type Formula,
  fixed,
  guards,
  type I,
  Implies,
  lift,
  minus,
  Not,
  pad,
  Reach,
  type SetLike,
  say,
  Technique,
  tup,
  unionOver,
  where,
  Z3,
} from "./pzl.ts";
import { type Cell, candidates, cd, cell, Grid, shading } from "./space.ts";

const failures: string[] = [];

function expectVerdict(label: string, got: string, want: string, dt: number): void {
  const ok = got === want;
  say(
    `${ok ? "ok " : "BAD"} ${pad(label, 58)} ${pad(got, 8)} (want ${pad(want, 8)}) ${fixed(dt, 6)}s`,
  );
  if (!ok) failures.push(label);
}

async function run(
  label: string,
  rules: Formula[],
  consistent: Formula,
  tech: Technique,
  want: string,
  split = 1,
): Promise<void> {
  const t0 = performance.now();
  const { verdict } = await checkTechnique(rules, consistent, tech, { split });
  expectVerdict(label, verdict, want, (performance.now() - t0) / 1000);
}

// ---------------------------------------------------------------- Solo

function solo(rw: number, rh: number) {
  const n = rw * rh;
  const g = new Grid(n, n);
  const boxes: (readonly Cell[])[] = [];
  for (let by = 0; by < rw; by++)
    for (let bx = 0; bx < rh; bx++) {
      const box: Cell[] = [];
      for (let y = 0; y < rh; y++)
        for (let x = 0; x < rw; x++) box.push(cell(bx * rw + x, by * rh + y));
      boxes.push(tup(...box));
    }
  const units = [
    ...g.rows.map((r) => tup(...r)),
    ...g.cols.map((c) => tup(...c)),
    ...boxes,
  ];
  const digits = Array.from({ length: n }, (_, i) => i + 1);
  const { value, cand, domain, consistent } = candidates(g.cells, digits);
  const latin = And(
    ...units.map((u) => Atom(Z3.Distinct(...u.map((c) => value.at(c))))),
  );
  return { units, digits, value, cand, rules: [domain, latin], consistent };
}

function hiddenSingle(
  units: readonly (readonly Cell[])[],
  digits: number[],
  value: Dict<Cell, I>,
  cand: Dict<string, B>,
  planted = false,
): Technique {
  const unitOf = (e: Env) => unionOver(e["u"], (u: readonly Cell[]) => u);
  const binds: [string, (e: Env) => SetLike][] = [
    ["u", () => units],
    ["d", () => digits],
    ["c", unitOf],
  ];
  if (planted) binds.push(["c3", (e) => minus(unitOf(e), e["c"])]);
  const premise = (e: Env): Formula => {
    const rest = minus(unitOf(e), e["c"], ...(planted ? [e["c3"]] : []));
    return Forall(rest, (c2) =>
      lift((d: number) => Z3.Not(cand.at(cd(c2 as Cell, d))), e["d"]),
    );
  };
  return new Technique("hiddenSingle", binds, premise, (e) =>
    lift((c: Cell, d: number) => value.at(c).eq(d), e["c"], e["d"]),
  );
}

// --------------------------------------------------------------- Unruly

function unrulyGame(w: number, h: number) {
  const g = new Grid(w, h);
  const { value, mark, domain, consistent } = shading(g.cells);
  const no3 = g
    .runs(3)
    .map(([a, b, c]) =>
      Atom(Z3.Not(Z3.And(value.at(a).eq(value.at(b)), value.at(b).eq(value.at(c))))),
    );
  const bal = [...g.rows, ...g.cols].map((L) =>
    Atom(
      Z3.Sum(value.at(L[0]), ...L.slice(1).map((c) => value.at(c))).eq(
        Math.trunc(L.length / 2),
      ),
    ),
  );
  return { g, value, mark, rules: [domain, ...no3, ...bal], consistent };
}

function threes(
  g: Grid,
  value: Dict<Cell, I>,
  mark: Dict<Cell, I>,
  kFrom: [number, number],
  kTo: number,
  length: number,
): Technique {
  const runs = g.runs(length).map((r) => tup(...r));
  return new Technique(
    "threes",
    [
      ["t", () => runs],
      ["x", () => [0, 1]],
    ],
    (e) =>
      lift(
        (t: readonly Cell[], x: number) =>
          Z3.And(mark.at(t[kFrom[0]]).eq(x), mark.at(t[kFrom[1]]).eq(x)),
        e["t"],
        e["x"],
      ),
    (e) =>
      lift((t: readonly Cell[], x: number) => value.at(t[kTo]).neq(x), e["t"], e["x"]),
  );
}

// ---------------------------------------------------------------- Range

function rangeRules(g: Grid, value: Dict<Cell, I>, adjacent = true): Formula[] {
  const rules: Formula[] = [
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
  ];
  if (adjacent)
    rules.push(
      And(
        ...g.cells.flatMap((a) =>
          g.adj4
            .at(a)
            .filter((b) => cmp(a, b) < 0)
            .map((b) => Atom(Z3.Not(Z3.And(value.at(a).eq(1), value.at(b).eq(1))))),
        ),
      ),
    );
  return rules;
}

/** A square whose shading would part two squares not shaded is clear. */
function connect(
  g: Grid,
  value: Dict<Cell, I>,
  mark: Dict<Cell, I>,
  planted = false,
): Technique {
  const premise = (e: Env): Formula => {
    const okp = planted
      ? (x: Cell) => mark.at(x).eq(0)
      : (x: Cell) => mark.at(x).neq(1);
    const within = minus(where(g.cells, okp), e["c"]);
    return And(
      lift((c: Cell) => mark.at(c).eq(2), e["c"]),
      lift(okp, e["p"]),
      lift(okp, e["q"]),
      Not(Reach(guards(e["p"]), e["q"], within, g.adj4)),
    );
  };
  return new Technique(
    "connect",
    [
      ["c", () => g.cells],
      ["p", (e) => minus(g.cells, e["c"])],
      ["q", (e) => minus(g.cells, e["c"])],
    ],
    premise,
    (e) => lift((c: Cell) => value.at(c).eq(0), e["c"]),
  );
}

/** Cave: the clear squares connected, and every shaded square reaching the
 * rim through shaded squares; no rule against shaded squares touching. */
function caveRules(g: Grid, value: Dict<Cell, I>): Formula[] {
  const shaded = where(g.cells, (c) => value.at(c).eq(1));
  const rim = new Map(
    g.cells.map((c) => [c, Z3.And(value.at(c).eq(1), Z3.Bool.val(g.rim(c)))]),
  );
  return [
    Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    ),
    Forall(shaded, (c) => Reach(rim, c, shaded, g.adj4)),
  ];
}

// ------------------------------------------------------------ the cage

const digits3 = [1, 2, 3];
const cageCells = [cell(0, 0), cell(1, 0), cell(2, 0)];
const cage = [cell(0, 0), cell(1, 0)];

function cageTech(
  cand: Dict<string, B>,
  value: Dict<Cell, I>,
  strike: number,
  fillDigits = digits3,
): Technique {
  const premise = (e: Env) =>
    ForallFill(
      cage,
      () => fillDigits,
      (f) =>
        Implies(
          And(
            Atom(f.at(cage[0]).neq(f.at(cage[1]))),
            Atom(f.at(cage[0]).add(f.at(cage[1])).eq(3)),
            ...cage.map((c) =>
              Atom(
                Z3.Or(...digits3.map((d) => Z3.And(f.at(c).eq(d), cand.at(cd(c, d))))),
              ),
            ),
          ),
          lift((c: Cell) => f.at(c).neq(strike), e["c"]),
        ),
    );
  return new Technique("cageFill", [["c", () => cage]], premise, (e) =>
    lift((c: Cell) => value.at(c).neq(strike), e["c"]),
  );
}

/** "no filling of the cage with `strike` in c meets its sum": an exists fill
 * under a negation, denied in the premise. */
function cageExists(value: Dict<Cell, I>, strike: number): Technique {
  const premise = (e: Env) =>
    Not(
      ExistsFill(
        cage,
        () => digits3,
        (f) =>
          And(
            lift((c: Cell) => f.at(c).eq(strike), e["c"]),
            Atom(f.at(cage[0]).add(f.at(cage[1])).eq(3)),
            Atom(f.at(cage[0]).neq(f.at(cage[1]))),
          ),
      ),
    );
  return new Technique("cageNone", [["c", () => cage]], premise, (e) =>
    lift((c: Cell) => value.at(c).neq(strike), e["c"]),
  );
}

it("validate", async () => {
  for (const [rw, rh] of [
    [2, 2],
    [3, 2],
  ]) {
    const { units, digits, value, cand, rules, consistent } = solo(rw, rh);
    await run(
      `Solo ${rw}x${rh} hiddenSingle`,
      rules,
      consistent,
      hiddenSingle(units, digits, value, cand),
      "sound",
    );
    await run(
      `Solo ${rw}x${rh} hiddenSingle, planted`,
      rules,
      consistent,
      hiddenSingle(units, digits, value, cand, true),
      "unsound",
    );
  }

  for (const w of [4, 6]) {
    const { g, value, mark, rules, consistent } = unrulyGame(w, w);
    await run(
      `Unruly ${w}x${w} threes (pair)`,
      rules,
      consistent,
      threes(g, value, mark, [0, 1], 2, 3),
      "sound",
    );
    await run(
      `Unruly ${w}x${w} threes (gap)`,
      rules,
      consistent,
      threes(g, value, mark, [0, 2], 1, 3),
      "sound",
    );
    await run(
      `Unruly ${w}x${w} planted (a color two apart)`,
      rules,
      consistent,
      threes(g, value, mark, [0, 2], 3, 4),
      w === 4 ? "sound" : "unsound",
    );
  }

  for (const [w, h] of [
    [3, 3],
    [4, 4],
    [5, 4],
    [6, 6],
  ]) {
    const g = new Grid(w, h);
    const { value, mark, domain, consistent } = shading(g.cells);
    const rules = [domain, ...rangeRules(g, value)];
    await run(
      `Range ${w}x${h} connect`,
      rules,
      consistent,
      connect(g, value, mark),
      "sound",
    );
    await run(
      `Range ${w}x${h} connect, planted`,
      rules,
      consistent,
      connect(g, value, mark, true),
      "unsound",
    );
    await run(
      `Range ${w}x${h} connect without no-adjacent`,
      [domain, ...rangeRules(g, value, false)],
      consistent,
      connect(g, value, mark),
      "unsound",
    );
    if (w !== 3 || h !== 3)
      await run(
        `Cave ${w}x${h} Range's connect`,
        [domain, ...caveRules(g, value)],
        consistent,
        connect(g, value, mark),
        "unsound",
      );
  }

  // Denied connectivity: entailment needs it. Range's rules entail "clear
  // connected", and a rule set without it does not.
  for (const [w, h] of [
    [3, 3],
    [4, 4],
  ]) {
    const g = new Grid(w, h);
    const { value, domain } = shading(g.cells);
    const clearConnected = Connected(
      where(g.cells, (c) => value.at(c).eq(0)),
      g.adj4,
    );
    let t0 = performance.now();
    let v = (await checkEntails([domain, ...rangeRules(g, value)], [clearConnected]))
      .verdict;
    expectVerdict(
      `entail ${w}x${h}: Range's rules give clear connected`,
      v,
      "entails",
      (performance.now() - t0) / 1000,
    );
    t0 = performance.now();
    v = (
      await checkEntails([domain, ...rangeRules(g, value).slice(1)], [clearConnected])
    ).verdict;
    expectVerdict(
      `entail ${w}x${h}: no-adjacent alone does not`,
      v,
      "not",
      (performance.now() - t0) / 1000,
    );
    t0 = performance.now();
    v = (
      await checkEntails(
        [domain, ...caveRules(g, value)],
        [domain, ...rangeRules(g, value)],
      )
    ).verdict;
    expectVerdict(
      `entail ${w}x${h}: Cave's rules do not give Range's`,
      v,
      "not",
      (performance.now() - t0) / 1000,
    );
  }

  // A reach asserted and denied of the same pair is unsatisfiable.
  {
    const g = new Grid(4, 4);
    const { value, domain } = shading(g.cells);
    const clear = where(g.cells, (c) => value.at(c).eq(0));
    const source = new Map([[cell(0, 0), true]]);
    let s = new Z3.Solver();
    s.add(
      domain,
      Reach(source, cell(3, 3), clear, g.adj4).z(1),
      Reach(source, cell(3, 3), clear, g.adj4).z(-1),
    );
    expectVerdict("reach asserted and denied together", await s.check(), "unsat", 0);
    s = new Z3.Solver();
    s.add(domain, Reach(source, cell(3, 3), clear, g.adj4).z(1));
    expectVerdict("reach asserted alone", await s.check(), "sat", 0);
  }

  // Bounded fillings: Keen's cage. A cage of two cells in a Latin row with
  // sum 3 on digits 1..3 holds {1, 2}; the technique "every filling of the
  // cage from the candidates that meets its sum leaves out 3" is sound. A
  // planted variant must make its premise hold where it should not: one that
  // strikes 2 over the true fillings never fires, since the answer is itself a
  // filling, so the plants narrow the fillings instead.
  {
    const { value, cand, domain, consistent } = candidates(cageCells, digits3);
    const rules = [
      domain,
      Atom(Z3.Distinct(...cageCells.map((c) => value.at(c)))),
      Atom(
        value
          .at(cell(0, 0))
          .add(value.at(cell(1, 0)))
          .eq(3),
      ),
    ];
    await run(
      "fill: a 2-cell cage of sum 3 never holds 3",
      rules,
      consistent,
      cageTech(cand, value, 3),
      "sound",
    );
    await run(
      "fill, planted: the fillings read without 2",
      rules,
      consistent,
      cageTech(cand, value, 2, [1, 3]),
      "unsound",
    );
    await run(
      "fill denied: no filling with 3 meets the sum",
      rules,
      consistent,
      cageExists(value, 3),
      "sound",
    );
    await run(
      "fill denied, planted: the sum read as 5",
      rules,
      consistent,
      new Technique(
        "cageNone5",
        [["c", () => cage]],
        (e) =>
          Not(
            ExistsFill(
              cage,
              () => digits3,
              (f) =>
                And(
                  lift((c: Cell) => f.at(c).eq(1), e["c"]),
                  Atom(f.at(cage[0]).add(f.at(cage[1])).eq(5)),
                ),
            ),
          ),
        (e) => lift((c: Cell) => value.at(c).neq(1), e["c"]),
      ),
      "unsound",
    );
  }

  say("");
  say(failures.length > 0 ? `FAILED: ${failures.join(", ")}` : "all as expected");
  vitestExpect(failures).toEqual([]);
});
