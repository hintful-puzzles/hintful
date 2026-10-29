"""Group A's number games without clues (Sukoro, View) and its two loop games
(Pipe Link, Reflect Link)."""

import z3

from pzl import And, Atom, Connected, Technique, lift, where
from shading import Game, comps, one_comp

NONE = -1     # a cell with no number
UNSEEN = -2   # a mark: not yet known

DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def numbered_board(g, top, name):
    value = {c: z3.Int(f"{name}_{c}") for c in g.cells}
    mark = {c: z3.Int(f"nmark_{c}") for c in g.cells}
    lo = 1 if name == "sukoro" else 0
    domain = And(*[Atom(z3.Or(value[c] == NONE, z3.And(value[c] >= lo, value[c] <= top))) for c in g.cells])
    consistent = And(*[Atom(z3.Implies(mark[c] != UNSEEN, mark[c] == value[c])) for c in g.cells])
    num = lambda c: value[c] != NONE
    common = [domain,
              Connected(where(g.cells, num), g.adj4),
              And(*[Atom(z3.Implies(z3.And(num(a), num(b)), value[a] != value[b])) for a in g.cells for b in g.adj4[a]])]
    return value, mark, consistent, common


def common_ok(g, v):
    if not one_comp(g.cells, g.adj4, lambda c: v[c] != NONE):
        return False
    return not any(v[a] != NONE and v[a] == v[b] for a in g.cells for b in g.adj4[a])


def sukoro(g):
    """Sukoro (corpus 50): a number counts its numbered neighbors; neighbors'
    numbers differ; the numbers are connected."""
    value, mark, consistent, rules = numbered_board(g, 4, "sukoro")
    rules += [Atom(z3.Implies(value[c] != NONE, value[c] == z3.Sum([z3.If(value[d] != NONE, 1, 0) for d in g.adj4[c]])))
              for c in g.cells]

    def verify(a):
        v = a["value"]
        if any(v[c] != NONE and not 1 <= v[c] <= 4 for c in g.cells) or not common_ok(g, v):
            return False
        return all(v[c] == NONE or v[c] == sum(v[d] != NONE for d in g.adj4[c]) for c in g.cells)

    return Game("Sukoro", rules, consistent, {"value": value}, verify, {"value": value, "mark": mark})


def view(g):
    """View (corpus 51): a number counts the empty cells it sees in the four
    directions, up to a number or the edge; neighbors' numbers differ; the
    numbers are connected."""
    value, mark, consistent, rules = numbered_board(g, g.w + g.h - 2, "view")
    for c in g.cells:
        seen = z3.IntVal(0)
        for d in DIRS:
            ray = g.ray(c, d)
            for i in range(len(ray)):
                seen = seen + z3.If(z3.And([value[x] == NONE for x in ray[:i + 1]]), 1, 0)
        rules.append(Atom(z3.Implies(value[c] != NONE, value[c] == seen)))

    def verify(a):
        v = a["value"]
        if not common_ok(g, v):
            return False
        for c in g.cells:
            if v[c] != NONE:
                seen = 0
                for d in DIRS:
                    for x in g.ray(c, d):
                        if v[x] != NONE:
                            break
                        seen += 1
                if v[c] != seen:
                    return False
        return True

    return Game("View", rules, consistent, {"value": value}, verify, {"value": value, "mark": mark})


def sukoro_full(g, gm):
    """Sukoro: a number whose numbered neighbors already make its count has its
    other neighbors empty."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("full", [("c", lambda e: g.cells), ("n", lambda e: g.cells)],
                     lambda e: lift(lambda c, n: z3.And(
                         z3.BoolVal(n in g.adj4[c]), mark[c] >= 0, mark[n] == UNSEEN,
                         mark[c] == z3.Sum([z3.If(mark[d] >= 0, 1, 0) for d in g.adj4[c]])), e["c"], e["n"]),
                     lambda e: lift(lambda n: value[n] == NONE, e["n"]))


def view_seen(g, gm):
    """View: a number whose known empty runs already add up to it sees no
    further, so the cell past each run holds a number."""
    value, mark = gm.extra["value"], gm.extra["mark"]

    def run(c, d):
        ray = g.ray(c, d)
        return z3.Sum([z3.If(z3.And([mark[x] == NONE for x in ray[:i + 1]]), 1, 0) for i in range(len(ray))] or [z3.IntVal(0)])

    def premise(c):
        return z3.And(mark[c] >= 0, mark[c] == z3.Sum([run(c, d) for d in DIRS]))

    def conclusion(c, d):
        ray = g.ray(c, d)
        parts = []
        for i, x in enumerate(ray):
            before = z3.And([mark[y] == NONE for y in ray[:i]])
            parts.append(z3.Implies(z3.And(before, mark[x] != NONE), value[x] != NONE))
        return z3.And(parts)

    return Technique("seen", [("c", lambda e: g.cells), ("d", lambda e: list(DIRS))],
                     lambda e: lift(premise, e["c"]), lambda e: lift(conclusion, e["c"], e["d"]))


# ----------------------------------------------------------------- the loops


def edges_of(g):
    es = sorted({tuple(sorted((a, b))) for a in g.cells for b in g.adj4[a]})
    at = {c: [e for e in es if c in e] for c in g.cells}
    return es, at


def loop_board(g, name):
    es, at = edges_of(g)
    line = {e: z3.Bool(f"{name}_{e}") for e in es}
    emark = {e: z3.Int(f"emark_{e}") for e in es}            # 0 cross, 1 line, 2 unknown
    consistent = And(*[Atom(z3.And(emark[e] >= 0, emark[e] <= 2,
                                   z3.Implies(emark[e] != 2, (emark[e] == 1) == line[e]))) for e in es])
    deg = {c: z3.Sum([z3.If(line[e], 1, 0) for e in at[c]]) for c in g.cells}
    linked = {c: [(e[0] if e[1] == c else e[1], line[e]) for e in at[c]] for c in g.cells}
    return es, at, line, emark, consistent, deg, linked


CORNERS = {1: ((1, 0), (0, 1)), 2: ((-1, 0), (0, 1)), 3: ((1, 0), (0, -1)), 4: ((-1, 0), (0, -1))}


def corner_edges(g, c, k):
    return [tuple(sorted((c, (c[0] + dx, c[1] + dy)))) for dx, dy in CORNERS[k]]


def reflect(g):
    """Reflect Link (corpus 26) on an instance with no cross clue, so no square
    is crossed: one loop through some squares, and a triangle's square is the
    corner it shows (unnumbered triangles; a number is one more clue that only
    removes answers)."""
    es, at, line, emark, consistent, deg, linked = loop_board(g, "rline")
    tri = {c: z3.Int(f"tri_{c}") for c in g.cells}
    rules = [Atom(z3.Or(deg[c] == 0, deg[c] == 2)) for c in g.cells]
    rules.append(Atom(z3.Or([deg[c] > 0 for c in g.cells])))
    rules.append(Connected(where(g.cells, lambda c: deg[c] > 0), linked))
    for c in g.cells:
        ok = [k for k in CORNERS if all(e in line for e in corner_edges(g, c, k))]
        rules.append(Atom(z3.Or(tri[c] == 0, *[tri[c] == k for k in ok])))
        for k in ok:
            rules.append(Atom(z3.Implies(tri[c] == k, z3.And(deg[c] == 2, *[line[e] for e in corner_edges(g, c, k)]))))

    def verify(a):
        ln, t = a["line"], a["tri"]
        d = {c: sum(ln[e] for e in at[c]) for c in g.cells}
        if any(d[c] not in (0, 2) for c in g.cells) or not any(d.values()):
            return False
        nb = {c: [x for e in at[c] if ln[e] for x in e if x != c] for c in g.cells}
        if len(comps(g.cells, nb, lambda c: d[c] > 0)) != 1:
            return False
        return all(t[c] == 0 or (d[c] == 2 and all(ln.get(e, False) for e in corner_edges(g, c, t[c]))) for c in g.cells)

    return Game("Reflect Link", rules, consistent, {"line": line, "tri": tri}, verify,
                {"line": line, "emark": emark, "at": at, "tri": tri})


def pipelink(g):
    """Pipe Link (corpus 25), as a consequence of its rules: every square holds
    a piece, two lines or a crossing of four. The trace's being one is left
    out; a weaker rule set can only make a technique look less sound."""
    es, at, line, emark, consistent, deg, linked = loop_board(g, "pline")
    rules = [Atom(z3.Or(deg[c] == 2, deg[c] == 4)) for c in g.cells]
    return Game("Pipe Link", rules, consistent, {"line": line}, lambda a: True,
                {"line": line, "emark": emark, "at": at})


def pipe_corner(g, gm):
    """Pipe Link: a square with only two edges not crossed out takes both, since
    every square is on the loop."""
    line, emark, at = gm.extra["line"], gm.extra["emark"], gm.extra["at"]
    return Technique("corner", [("c", lambda e: g.cells), ("e", lambda e: [x for c in g.cells for x in at[c]])],
                     lambda e: lift(lambda c, ed: z3.And(z3.BoolVal(ed in at[c]),
                                                         z3.Sum([z3.If(emark[x] != 0, 1, 0) for x in at[c]]) == 2,
                                                         emark[ed] != 0), e["c"], e["e"]),
                     lambda e: lift(lambda ed: line[ed], e["e"]))
