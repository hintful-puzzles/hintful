"""Group A's constraint games on a grid, as `corpus/` and `collection/` describe
them: each game's rules in z3, the same rules as a plain Python evaluation
(the verifier every counterexample must pass), and the techniques stated for
it in `techniques.md`.

A game is a function of a board that returns a Game. Answers are `value`
(and, where a game has them, `clue` and `region`); marks are `mark`.
Clues are free variables: 0 is no clue."""

import z3

from pzl import And, Atom, Connected, ExistsFill, Forall, Not, Reach, Technique, lift, minus, where
from space import Grid, Regions, shading

UNKNOWN = 2


class Game:
    def __init__(self, name, rules, consistent, answer_vars, verify, extra=None):
        self.name, self.rules, self.consistent = name, rules, consistent
        self.answer_vars, self.verify = answer_vars, verify
        self.extra = extra or {}


# ------------------------------------------------------------ Python helpers


def comps(cells, adj, keep):
    """The components of the cells satisfying keep, under adj."""
    seen, out = set(), []
    for c in cells:
        if c in seen or not keep(c):
            continue
        comp, todo = [], [c]
        seen.add(c)
        while todo:
            x = todo.pop()
            comp.append(x)
            for y in adj[x]:
                if y not in seen and keep(y):
                    seen.add(y)
                    todo.append(y)
        out.append(comp)
    return out


def one_comp(cells, adj, keep):
    return len(comps(cells, adj, keep)) <= 1


def no2x2(g, v, color):
    return all(not all(v[c] == color for c in q) for q in g.windows2())


def sight(g, v, c, d, stop):
    """Cells seen from c in direction d before the first cell with `stop`."""
    n = 0
    for x in g.ray(c, d):
        if stop(x):
            break
        n += 1
    return n


def is_rectangle(cells):
    xs, ys = [c[0] for c in cells], [c[1] for c in cells]
    return len(cells) == (max(xs) - min(xs) + 1) * (max(ys) - min(ys) + 1)


# --------------------------------------------------------------- the games


def clue_vars(g, top):
    clue = {c: z3.Int(f"clue_{c}") for c in g.cells}
    dom = And(*[Atom(z3.And(clue[c] >= 0, clue[c] <= top)) for c in g.cells])
    return clue, dom


def nurikabe(g):
    """Nurikabe (corpus 1): shaded connected, no 2x2 shaded, every island has
    exactly one clue, its size."""
    value, mark, domain, consistent = shading(g.cells)
    n = len(g.cells)
    clue, cdom = clue_vars(g, n)
    idx = {c: i for i, c in enumerate(g.cells)}
    lab = {c: z3.Int(f"lab_{c}") for c in g.cells}
    clear = lambda c: value[c] == 0
    rules = [domain, cdom,
             Connected(where(g.cells, lambda c: value[c] == 1), g.adj4),
             And(*[Atom(z3.Not(z3.And([value[c] == 1 for c in q]))) for q in g.windows2()])]
    for c in g.cells:
        rules.append(Atom(z3.Implies(clue[c] > 0, z3.And(clear(c), lab[c] == idx[c]))))
        rules.append(Atom(z3.Implies(clear(c), z3.Or([z3.And(lab[c] == idx[k], clue[k] > 0) for k in g.cells]))))
        for d in g.adj4[c]:
            rules.append(Atom(z3.Implies(z3.And(clear(c), clear(d)), lab[c] == lab[d])))
    for k in g.cells:
        isl = where(g.cells, lambda c, k=k: z3.And(clear(c), lab[c] == idx[k]))
        rules.append(Atom(z3.Implies(clue[k] > 0, z3.Sum([z3.If(m, 1, 0) for m in isl.values()]) == clue[k])))
        rules.append(Connected(isl, g.adj4))

    def verify(a):
        v, cl = a["value"], a["clue"]
        if not one_comp(g.cells, g.adj4, lambda c: v[c] == 1) or not no2x2(g, v, 1):
            return False
        for comp in comps(g.cells, g.adj4, lambda c: v[c] == 0):
            ks = [c for c in comp if cl[c] > 0]
            if len(ks) != 1 or cl[ks[0]] != len(comp):
                return False
        return all(cl[c] == 0 or v[c] == 0 for c in g.cells)

    return Game("Nurikabe", rules, consistent, {"value": value, "clue": clue}, verify,
                {"value": value, "mark": mark, "clue": clue})


def mochikoro(g):
    """Mochikoro (corpus 2): clear cells connected diagonally too, every clear
    area a rectangle holding at most one clue, its size; no 2x2 shaded."""
    value, mark, domain, consistent = shading(g.cells)
    clue, cdom = clue_vars(g, len(g.cells))
    idx = {c: i for i, c in enumerate(g.cells)}
    lab = {c: z3.Int(f"mlab_{c}") for c in g.cells}
    clear = lambda c: value[c] == 0
    rules = [domain, cdom,
             Connected(where(g.cells, lambda c: value[c] == 0), g.adj8),
             And(*[Atom(z3.Not(z3.And([value[c] == 1 for c in q]))) for q in g.windows2()])]
    for c in g.cells:
        rules.append(Atom(z3.Implies(clear(c), z3.And(lab[c] >= 0, lab[c] < len(g.cells)))))
        for d in g.adj4[c]:
            rules.append(Atom(z3.Implies(z3.And(clear(c), clear(d)), lab[c] == lab[d])))
    for a in g.cells:
        for b in g.cells:
            if idx[b] <= idx[a]:
                continue
            box = [(x, y) for x in range(min(a[0], b[0]), max(a[0], b[0]) + 1)
                   for y in range(min(a[1], b[1]), max(a[1], b[1]) + 1)]
            same = z3.And(clear(a), clear(b), lab[a] == lab[b])
            rules.append(Atom(z3.Implies(same, z3.And([z3.And(clear(x), lab[x] == lab[a]) for x in box]))))
            rules.append(Atom(z3.Implies(z3.And(clue[a] > 0, clue[b] > 0), lab[a] != lab[b])))
    for c in g.cells:
        size = z3.Sum([z3.If(z3.And(clear(x), lab[x] == lab[c]), 1, 0) for x in g.cells])
        rules.append(Atom(z3.Implies(clue[c] > 0, z3.And(clear(c), size == clue[c]))))

    def verify(a):
        v, cl = a["value"], a["clue"]
        if not one_comp(g.cells, g.adj8, lambda c: v[c] == 0) or not no2x2(g, v, 1):
            return False
        for comp in comps(g.cells, g.adj4, lambda c: v[c] == 0):
            ks = [c for c in comp if cl[c] > 0]
            if not is_rectangle(comp) or len(ks) > 1 or any(cl[k] != len(comp) for k in ks):
                return False
        return all(cl[c] == 0 or v[c] == 0 for c in g.cells)

    return Game("Mochikoro", rules, consistent, {"value": value, "clue": clue}, verify,
                {"value": value, "mark": mark, "clue": clue})


def nurikabe_unreachable(g, gm):
    """Nurikabe's `unreachable` (corpus 1), in the form that reads the clues
    and the board alone: a cell farther from every clue than the clue's island
    can stretch is shaded."""
    value, mark, clue = gm.extra["value"], gm.extra["mark"], gm.extra["clue"]
    dist = lambda a, b: abs(a[0] - b[0]) + abs(a[1] - b[1])
    return Technique("unreachable", [("c", lambda e: g.cells)],
                     lambda e: lift(lambda c: z3.And(mark[c] == UNKNOWN,
                                                     z3.And([z3.Implies(clue[k] > 0, clue[k] <= dist(k, c)) for k in g.cells])), e["c"]),
                     lambda e: lift(lambda c: value[c] == 1, e["c"]))


def mochikoro_rectangle(g, gm):
    """Mochikoro's rectangle completion: three clear cells of a 2x2 window
    make the fourth clear, since a clear area is a rectangle."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    wins = g.windows2()
    return Technique("rectangle", [("q", lambda e: wins), ("c", lambda e: [c for q in wins for c in q])],
                     lambda e: lift(lambda q, c: z3.And(z3.BoolVal(c in q), *[mark[x] == 0 for x in q if x != c]), e["q"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


def windows_completion(g, gm, color_from_mark):
    """No 2x2 of one color: three of a window marked x make the fourth not x."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    wins = g.windows2()
    return Technique("no2x2", [("q", lambda e: wins), ("c", lambda e: g.cells), ("x", lambda e: [0, 1])],
                     lambda e: lift(lambda q, c, x: z3.And(z3.BoolVal(c in q), *[mark[y] == x for y in q if y != c]),
                                    e["q"], e["c"], e["x"]),
                     lambda e: lift(lambda c, x: value[c] != x, e["c"], e["x"]))


# ----------------------------------------------------- Yin-Yang and Unruly


def yinyang(g):
    """Yin-Yang (corpus 7): each color connected, no 2x2 of one color."""
    value, mark, domain, consistent = shading(g.cells)
    rules = [domain,
             Connected(where(g.cells, lambda c: value[c] == 0), g.adj4),
             Connected(where(g.cells, lambda c: value[c] == 1), g.adj4),
             And(*[Atom(z3.Not(z3.Or(z3.And([value[c] == 0 for c in q]), z3.And([value[c] == 1 for c in q]))))
                   for q in g.windows2()])]

    def verify(a):
        v = a["value"]
        return (one_comp(g.cells, g.adj4, lambda c: v[c] == 0) and one_comp(g.cells, g.adj4, lambda c: v[c] == 1)
                and no2x2(g, v, 0) and no2x2(g, v, 1))

    return Game("Yin-Yang", rules, consistent, {"value": value}, verify, {"value": value, "mark": mark})


def unruly(g):
    """Unruly (collection): no three in a row of one color, every row and column
    half each color."""
    value, mark, domain, consistent = shading(g.cells)
    rules = [domain] + [Atom(z3.Not(z3.And(value[a] == value[b], value[b] == value[c]))) for a, b, c in g.runs(3)]
    rules += [Atom(z3.Sum([value[c] for c in L]) * 2 == len(L)) for L in g.rows + g.cols]

    def verify(a):
        v = a["value"]
        if any(v[a_] == v[b] == v[c] for a_, b, c in g.runs(3)):
            return False
        return all(2 * sum(v[c] for c in L) == len(L) for L in g.rows + g.cols)

    return Game("Unruly", rules, consistent, {"value": value}, verify, {"value": value, "mark": mark})


def unruly_threes(g, gm):
    value, mark = gm.extra["value"], gm.extra["mark"]
    runs = g.runs(3)
    return Technique("threes", [("t", lambda e: runs), ("x", lambda e: [0, 1])],
                     lambda e: lift(lambda t, x: z3.And(mark[t[0]] == x, mark[t[1]] == x), e["t"], e["x"]),
                     lambda e: lift(lambda t, x: value[t[2]] != x, e["t"], e["x"]))


# ------------------------------------------------------------ Range and Cave


def sees_terms(g, value):
    """1 + the clear cells seen from c in the four directions, until shaded."""
    out = {}
    for c in g.cells:
        total = z3.IntVal(1)
        for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ray = g.ray(c, d)
            for i in range(len(ray)):
                total = total + z3.If(z3.And([value[x] == 0 for x in ray[:i + 1]]), 1, 0)
        out[c] = total
    return out


def sees_ok(g, v, cl):
    for c in g.cells:
        if cl[c] > 0:
            if v[c] != 0:
                return False
            if 1 + sum(sight(g, v, c, d, lambda x: v[x] == 1) for d in ((1, 0), (-1, 0), (0, 1), (0, -1))) != cl[c]:
                return False
    return True


def range_game(g):
    """Range (collection sample): no two shaded touch, clear connected, a clue
    sees its number of cells."""
    value, mark, domain, consistent = shading(g.cells)
    clue, cdom = clue_vars(g, g.w + g.h - 1)
    s = sees_terms(g, value)
    rules = [domain, cdom, Connected(where(g.cells, lambda c: value[c] == 0), g.adj4),
             And(*[Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1))) for a in g.cells for b in g.adj4[a]])]
    rules += [Atom(z3.Implies(clue[c] > 0, z3.And(value[c] == 0, s[c] == clue[c]))) for c in g.cells]

    def verify(a):
        v, cl = a["value"], a["clue"]
        return (one_comp(g.cells, g.adj4, lambda c: v[c] == 0)
                and all(not (v[a_] == 1 and v[b] == 1) for a_ in g.cells for b in g.adj4[a_])
                and sees_ok(g, v, cl))

    return Game("Range", rules, consistent, {"value": value, "clue": clue}, verify,
                {"value": value, "mark": mark, "clue": clue})


def cave(g):
    """Cave (corpus 9): clear connected, every shaded group reaches the rim, a
    clue sees its number of cells; shaded cells may touch."""
    value, mark, domain, consistent = shading(g.cells)
    clue, cdom = clue_vars(g, g.w + g.h - 1)
    s = sees_terms(g, value)
    shaded = where(g.cells, lambda c: value[c] == 1)
    rim = {c: z3.And(value[c] == 1, z3.BoolVal(g.rim(c))) for c in g.cells}
    rules = [domain, cdom, Connected(where(g.cells, lambda c: value[c] == 0), g.adj4),
             Forall(shaded, lambda c: Reach(rim, c, shaded, g.adj4))]
    rules += [Atom(z3.Implies(clue[c] > 0, z3.And(value[c] == 0, s[c] == clue[c]))) for c in g.cells]

    def verify(a):
        v, cl = a["value"], a["clue"]
        return (one_comp(g.cells, g.adj4, lambda c: v[c] == 0)
                and all(any(g.rim(x) for x in comp) for comp in comps(g.cells, g.adj4, lambda c: v[c] == 1))
                and sees_ok(g, v, cl))

    return Game("Cave", rules, consistent, {"value": value, "clue": clue}, verify,
                {"value": value, "mark": mark, "clue": clue})


def range_connect(g, gm):
    """Range's `connect` (experiment C): a cell whose shading would part two
    cells not shaded is clear."""
    value, mark = gm.extra["value"], gm.extra["mark"]

    def premise(e):
        within = minus(where(g.cells, lambda x: mark[x] != 1), e["c"])
        return And(lift(lambda c: mark[c] == UNKNOWN, e["c"]),
                   lift(lambda p: mark[p] != 1, e["p"]), lift(lambda q: mark[q] != 1, e["q"]),
                   Not(Reach(dict(e["p"].guards) if hasattr(e["p"], "guards") else {e["p"]: True}, e["q"], within, g.adj4)))

    return Technique("connect", [("c", lambda e: g.cells), ("p", lambda e: minus(g.cells, e["c"])),
                                 ("q", lambda e: minus(g.cells, e["c"]))],
                     premise, lambda e: lift(lambda c: value[c] == 0, e["c"]))


def range_adjacency(g, gm):
    """Range's `adjacency`: a cell beside a shaded cell is clear."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("adjacency", [("s", lambda e: g.cells), ("c", lambda e: g.cells)],
                     lambda e: lift(lambda s, c: z3.And(mark[s] == 1, z3.BoolVal(c in g.adj4[s])), e["s"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


def cave_enclosed(g, gm):
    """Cave: a cell off the rim whose every neighbor is clear is clear, since a
    shaded cell there could not reach the rim."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("enclosed", [("c", lambda e: g.cells)],
                     lambda e: lift(lambda c: z3.And(z3.BoolVal(not g.rim(c)), *[mark[d] == 0 for d in g.adj4[c]]), e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))
