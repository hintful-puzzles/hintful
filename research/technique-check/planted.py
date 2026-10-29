"""A planted defect in each of group C's stated ladders: a variant of one of
its techniques with one condition dropped or loosened, which the checker
must call unsound. A ladder whose every technique passes says nothing until
its checker has been seen to fail (CLAUDE.md, "Method"). Run: python3 planted.py"""

import sys
import time

import z3

from pzl import And, Atom, Forall, Not, Or, Technique, check_technique, lift, minus, union_over
from space import Grid
import ladders as L
import ladders2 as L2

bad = []


def expect_unsound(label, game, tech, split):
    t0 = time.time()
    v, m, env = check_technique(game.rules, game.consistent, tech, split=split,
                                answer_vars=game.answer_vars, verify=game.verify)
    ok = v == "unsound"
    print(f"{'ok ' if ok else 'BAD'} {label:66} {v:10} {time.time() - t0:6.1f}s", flush=True)
    if not ok:
        bad.append(label)


# Solo Jigsaw: intersect without "c is not in u1".
g = Grid(4, 4)
jig = L.solo(g, 2, 2, True)
value, cand, units, uc, digits = (jig.extra[k] for k in ("value", "cand", "units", "unit_cells", "digits"))
in_unit = lambda u, c: lift(lambda uu, cc: uc(uu).get(cc, False), u, c)
expect_unsound("Solo Jigsaw: intersect, c allowed inside u1", jig, Technique(
    "intersect-planted", [("u1", lambda e: units), ("u2", lambda e: units), ("d", lambda e: digits), ("c", lambda e: g.cells)],
    lambda e: And(Forall(g.cells, lambda x: Or(Not(in_unit(e["u1"], x)), in_unit(e["u2"], x),
                                               lift(lambda d: z3.Not(cand[(x, d)]), e["d"]))),
                  in_unit(e["u2"], e["c"])),
    lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"])), 2)

# Tectonic: starve without "a's area owes n".
g = Grid(4, 4)
tect = L.seismic(g, 4, True)
value, cand, reg, clash = (tect.extra[k] for k in ("value", "cand", "reg", "clash"))
expect_unsound("Tectonic: starve, the area need not owe n", tect, Technique(
    "starve-planted", [("a", lambda e: g.cells), ("d", lambda e: [1, 2, 3, 4, 5]), ("c", lambda e: g.cells)],
    lambda e: lift(lambda a, d, c: z3.And(reg.label[c] != reg.label[a], *[
        z3.Implies(z3.And(reg.label[h] == reg.label[a], cand[(h, d)]), clash(c, h, d)) for h in g.cells]),
        e["a"], e["d"], e["c"]),
    lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"])), 2)

# Star Battle: full fires with one star still owed.
g = Grid(5, 5)
sb = L.starbattle(g, 1)
value, mark, units, uc, k = (sb.extra[x] for x in ("value", "mark", "units", "unit_cells", "k"))
stars_in = lambda u: lift(lambda uu: z3.Sum([z3.If(z3.And(L.as_bool(m), mark[c] == 1), 1, 0) for c, m in uc(uu).items()]), u)
expect_unsound("Star Battle: full with need 1", sb, Technique(
    "full-planted", [("u", lambda e: units), ("c", lambda e: g.cells)],
    lambda e: And(lift(lambda uu, cc: L.as_bool(uc(uu).get(cc, False)), e["u"], e["c"]),
                  lift(lambda c: mark[c] == 2, e["c"]), Atom(k - stars_in(e["u"]) == 1)),
    lambda e: lift(lambda c: value[c] == 0, e["c"])), 1)

# Ascent Orthogonal: proximity off by one.
asc = L2.ascent(3, 3, "orth")
value, cand, cells, dist, N = (asc.extra[x] for x in ("value", "cand", "cells", "dist", "N"))
nums = list(range(1, N + 1))
placed = lambda p, m: z3.And([z3.Not(cand[(p, k)]) for k in nums if k != m])
expect_unsound("Ascent Orthogonal: proximity, dist >= |m - k|", asc, Technique(
    "proximity-planted", [("p", lambda e: cells), ("m", lambda e: nums), ("k", lambda e: nums), ("c", lambda e: cells)],
    lambda e: lift(lambda p, m, k, c: z3.And(placed(p, m), z3.BoolVal(c != p and dist(c, p) >= abs(m - k))),
                   e["p"], e["m"], e["k"], e["c"]),
    lambda e: lift(lambda k, c: value[c] != k, e["k"], e["c"])), 2)

# Pairs: forced counting a line it cannot take.
pp = L2.path_game(3, 3, "pairs")
line, emark, at, takes, cells, edges = (pp.extra[x] for x in ("line", "emark", "at", "takes", "cells", "edges"))
lines_at = lambda c: z3.Sum([z3.If(emark[e] == 1, 1, 0) for e in at[c]])
expect_unsound("Pairs: forced with one live edge too many", pp, Technique(
    "forced-planted", [("c", lambda e: cells), ("e", lambda e: edges)],
    lambda e: lift(lambda c, ed: z3.And(z3.BoolVal(ed in at[c]), emark[ed] == 2,
                                        lines_at(c) + z3.Sum([z3.If(emark[x] == 2, 1, 0) for x in at[c]]) == takes(c) + 1),
                   e["c"], e["e"]),
    lambda e: lift(lambda ed: line[ed], e["e"])), 2)

# Flip Random: lastChance without every other flipper decided.
fl = L2.flip(3, 3, "random")
press, unlit, pmark, M, cells, order = (fl.extra[x] for x in ("press", "unlit", "pmark", "M", "cells", "order"))
expect_unsound("Flip Random: lastChance, other flippers undecided", fl, Technique(
    "lastChance-planted", [("i", lambda e: cells), ("j", lambda e: cells)],
    lambda e: lift(lambda i, j: z3.And(M[(i, j)], *[z3.Not(M[(k, j)]) for k in cells if order[k] > order[i]],
                                       L2.parity([unlit[j]] + [z3.And(M[(k, j)], pmark[k] == 1) for k in cells if k != i])),
                   e["i"], e["j"]),
    lambda e: lift(lambda i: press[i], e["i"])), 2)

# Net wrapping: neighbor with the side agreement reversed.
nt = L2.net(3, 3, True)
cells, nbr, wire_r, cand, rot = (nt.extra[x] for x in ("cells", "nbr", "wire_r", "cand", "rot"))
expect_unsound("Net wrapping: neighbor, agreement read as a clash", nt, Technique(
    "neighbor-planted", [("t", lambda e: cells), ("r", lambda e: range(4)), ("d", lambda e: range(4))],
    lambda e: lift(lambda t, r, d: z3.And([z3.Implies(cand[(nbr(t, d), q)], wire_r(nbr(t, d), (d + 2) % 4, q) == wire_r(t, d, r))
                                           for q in range(4)]), e["t"], e["r"], e["d"]),
    lambda e: lift(lambda t, r: rot[t] != r, e["t"], e["r"])), 3)

print()
print("FAILED: " + ", ".join(bad) if bad else "every planted defect caught")
sys.exit(1 if bad else 0)
