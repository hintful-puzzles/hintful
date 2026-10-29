"""Experiment C again, on the new compiler: each technique it found sound must
still be sound, and each planted variant still caught. Then the new forms,
each with a planted defect of its own (task 3.2). Run: python3 validate.py"""

import sys
import time

import z3

from pzl import (And, Atom, Connected, Exists, ExistsFill, Forall, ForallFill, Implies, Not, Reach,
                 Technique, binding_of, check_entails, check_technique, count, lift, minus, same,
                 union_over, where)
from space import Grid, Regions, candidates, shading

failures = []


def expect(label, got, want, dt):
    ok = got == want
    print(f"{'ok ' if ok else 'BAD'} {label:58} {got:8} (want {want:8}) {dt:6.1f}s")
    if not ok:
        failures.append(label)


def run(label, rules, consistent, tech, want, split=1):
    t0 = time.time()
    v, m, env = check_technique(rules, consistent, tech, split=split)
    expect(label, v, want, time.time() - t0)
    return v, m, env


# ---------------------------------------------------------------- Solo

def solo(rw, rh):
    n = rw * rh
    g = Grid(n, n)
    boxes = [tuple((bx * rw + x, by * rh + y) for y in range(rh) for x in range(rw))
             for by in range(rw) for bx in range(rh)]
    units = g.rows + g.cols + boxes
    digits = list(range(1, n + 1))
    value, cand, domain, consistent = candidates(g.cells, digits)
    latin = And(*[Atom(z3.Distinct([value[c] for c in u])) for u in units])
    return g, units, digits, value, cand, [domain, latin], consistent


def hidden_single(units, digits, value, cand, planted=False):
    binds = [("u", lambda e: units), ("d", lambda e: digits),
             ("c", lambda e: union_over(e["u"], lambda u: u))]
    if planted:
        binds.append(("c3", lambda e: minus(union_over(e["u"], lambda u: u), e["c"])))

    def premise(e):
        rest = minus(union_over(e["u"], lambda u: u), e["c"], *([e["c3"]] if planted else []))
        return Forall(rest, lambda c2: lift(lambda d: z3.Not(cand[(c2, d)]), e["d"]))

    return Technique("hiddenSingle", binds, premise,
                     lambda e: lift(lambda c, d: value[c] == d, e["c"], e["d"]))


for rw, rh in ((2, 2), (3, 2)):
    g, units, digits, value, cand, rules, cons = solo(rw, rh)
    run(f"Solo {rw}x{rh} hiddenSingle", rules, cons, hidden_single(units, digits, value, cand), "sound")
    run(f"Solo {rw}x{rh} hiddenSingle, planted", rules, cons,
        hidden_single(units, digits, value, cand, planted=True), "unsound")

# --------------------------------------------------------------- Unruly


def unruly(w, h):
    g = Grid(w, h)
    value, mark, domain, consistent = shading(g.cells)
    no3 = [Atom(z3.Not(z3.And(value[a] == value[b], value[b] == value[c]))) for a, b, c in g.runs(3)]
    bal = [Atom(z3.Sum([value[c] for c in L]) == len(L) // 2) for L in g.rows + g.cols]
    return g, value, mark, [domain] + no3 + bal, consistent


def threes(g, value, mark, k_from, k_to, length):
    runs = g.runs(length)
    return Technique("threes", [("t", lambda e: runs), ("x", lambda e: [0, 1])],
                     lambda e: lift(lambda t, x: z3.And(mark[t[k_from[0]]] == x, mark[t[k_from[1]]] == x), e["t"], e["x"]),
                     lambda e: lift(lambda t, x: value[t[k_to]] != x, e["t"], e["x"]))


for w in (4, 6):
    g, value, mark, rules, cons = unruly(w, w)
    run(f"Unruly {w}x{w} threes (pair)", rules, cons, threes(g, value, mark, (0, 1), 2, 3), "sound")
    run(f"Unruly {w}x{w} threes (gap)", rules, cons, threes(g, value, mark, (0, 2), 1, 3), "sound")
    run(f"Unruly {w}x{w} planted (a color two apart)", rules, cons, threes(g, value, mark, (0, 2), 3, 4),
        "sound" if w == 4 else "unsound")

# ---------------------------------------------------------------- Range


def range_rules(g, value, adjacent=True):
    rules = [Connected(where(g.cells, lambda c: value[c] == 0), g.adj4)]
    if adjacent:
        rules.append(And(*[Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1)))
                           for a in g.cells for b in g.adj4[a] if a < b]))
    return rules


def connect(g, value, mark, planted=False):
    """A square whose shading would part two squares not shaded is clear."""
    def premise(e):
        okp = (lambda x: mark[x] == 0) if planted else (lambda x: mark[x] != 1)
        within = minus(where(g.cells, okp), e["c"])
        return And(lift(lambda c: mark[c] == 2, e["c"]),
                   lift(okp, e["p"]), lift(okp, e["q"]),
                   Not(Reach(dict(e["p"].guards), e["q"], within, g.adj4)))
    return Technique("connect", [("c", lambda e: g.cells), ("p", lambda e: minus(g.cells, e["c"])),
                                 ("q", lambda e: minus(g.cells, e["c"]))],
                     premise, lambda e: lift(lambda c: value[c] == 0, e["c"]))


def cave_rules(g, value):
    """Cave: the clear squares connected, and every shaded square reaching the
    rim through shaded squares; no rule against shaded squares touching."""
    shaded = where(g.cells, lambda c: value[c] == 1)
    rim = {c: z3.And(value[c] == 1, z3.BoolVal(g.rim(c))) for c in g.cells}
    return [Connected(where(g.cells, lambda c: value[c] == 0), g.adj4),
            Forall(shaded, lambda c: Reach(rim, c, shaded, g.adj4))]


for w, h in ((3, 3), (4, 4), (5, 4), (6, 6)):
    g = Grid(w, h)
    value, mark, domain, cons = shading(g.cells)
    rules = [domain] + range_rules(g, value)
    run(f"Range {w}x{h} connect", rules, cons, connect(g, value, mark), "sound")
    run(f"Range {w}x{h} connect, planted", rules, cons, connect(g, value, mark, planted=True), "unsound")
    run(f"Range {w}x{h} connect without no-adjacent", [domain] + range_rules(g, value, False), cons,
        connect(g, value, mark), "unsound")
    if (w, h) != (3, 3):
        run(f"Cave {w}x{h} Range's connect", [domain] + cave_rules(g, value), cons, connect(g, value, mark), "unsound")

# ------------------------------------------------- the new forms, planted

# Denied connectivity: entailment needs it. Range's rules entail "clear
# connected", and a rule set without it does not.
for w, h in ((3, 3), (4, 4)):
    g = Grid(w, h)
    value, mark, domain, cons = shading(g.cells)
    t0 = time.time()
    v, _ = check_entails([domain] + range_rules(g, value), [Connected(where(g.cells, lambda c: value[c] == 0), g.adj4)])
    expect(f"entail {w}x{h}: Range's rules give clear connected", v, "entails", time.time() - t0)
    t0 = time.time()
    v, _ = check_entails([domain] + range_rules(g, value)[1:], [Connected(where(g.cells, lambda c: value[c] == 0), g.adj4)])
    expect(f"entail {w}x{h}: no-adjacent alone does not", v, "not", time.time() - t0)
    t0 = time.time()
    v, _ = check_entails([domain] + cave_rules(g, value), [domain] + range_rules(g, value))
    expect(f"entail {w}x{h}: Cave's rules do not give Range's", v, "not", time.time() - t0)

# A reach asserted and denied of the same pair is unsatisfiable.
g = Grid(4, 4)
value, mark, domain, cons = shading(g.cells)
clear = where(g.cells, lambda c: value[c] == 0)
s = z3.Solver()
s.add(domain, Reach({(0, 0): True}, (3, 3), clear, g.adj4).z(1), Reach({(0, 0): True}, (3, 3), clear, g.adj4).z(-1))
expect("reach asserted and denied together", str(s.check()), "unsat", 0)
s = z3.Solver()
s.add(domain, Reach({(0, 0): True}, (3, 3), clear, g.adj4).z(1))
expect("reach asserted alone", str(s.check()), "sat", 0)

# Bounded fillings: Keen's cage. A cage of two cells in a Latin row with sum
# 3 on digits 1..3 holds {1, 2}; the technique "every filling of the cage
# from the candidates that meets its sum leaves out 3" is sound, and a planted
# one that also strikes 2 is not.
digits = [1, 2, 3]
cells = [(0, 0), (1, 0), (2, 0)]
value, cand, domain, cons = candidates(cells, digits)
cage = [(0, 0), (1, 0)]
rules = [domain, Atom(z3.Distinct([value[c] for c in cells])), Atom(value[(0, 0)] + value[(1, 0)] == 3)]


def cage_tech(strike):
    def premise(e):
        return ForallFill(cage, lambda c: digits,
                          lambda f: Implies(And(Atom(f[(0, 0)] != f[(1, 0)]), Atom(f[(0, 0)] + f[(1, 0)] == 3),
                                                *[Atom(z3.Or([z3.And(f[c] == d, cand[(c, d)]) for d in digits])) for c in cage]),
                                            lift(lambda c: f[c] != strike, e["c"])))
    return Technique("cageFill", [("c", lambda e: cage)], premise, lambda e: lift(lambda c: value[c] != strike, e["c"]))


run("fill: a 2-cell cage of sum 3 never holds 3", rules, cons, cage_tech(3), "sound")
run("fill, planted: ... never holds 2", rules, cons, cage_tech(2), "unsound")


def cage_exists(strike):
    # "no filling of the cage with `strike` in c meets its sum": an exists
    # fill under a negation, denied in the premise.
    def premise(e):
        return Not(ExistsFill(cage, lambda c: digits,
                              lambda f: And(lift(lambda c: f[c] == strike, e["c"]),
                                            Atom(f[(0, 0)] + f[(1, 0)] == 3), Atom(f[(0, 0)] != f[(1, 0)]))))
    return Technique("cageNone", [("c", lambda e: cage)], premise, lambda e: lift(lambda c: value[c] != strike, e["c"]))


run("fill denied: no filling with 3 meets the sum", rules, cons, cage_exists(3), "sound")
run("fill denied, planted: the sum read as 4", rules, cons,
    Technique("cageNone4", [("c", lambda e: cage)],
              lambda e: Not(ExistsFill(cage, lambda c: digits,
                                       lambda f: And(lift(lambda c: f[c] == 1, e["c"]), Atom(f[(0, 0)] + f[(1, 0)] == 4)))),
              lambda e: lift(lambda c: value[c] != 1, e["c"])), "unsound")

print()
print("FAILED: " + ", ".join(failures) if failures else "all as expected")
sys.exit(1 if failures else 0)
