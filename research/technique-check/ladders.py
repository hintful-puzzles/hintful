"""Group C's games whose variations need every rung stated (`techniques.md` §
"Group C", `rungs.md`): Solo and Jigsaw, Seismic and Tectonic, Star Battle by
its star count. A technique general in a relation or a parameter reads it
from the game it is checked in, as the vocabulary rule says."""

import z3

from pzl import And, Atom, Exists, Forall, Not, Or, Technique, lift, members, minus, union_over, where
from regions import count_in, regions_ok, regions_of
from shading import Game
from space import Regions, shading

# ------------------------------------------------------------------- Solo


def solo(g, rw, rh, jigsaw):
    """Solo (language.md's sample): a Latin square over rows, columns and
    blocks. Jigsaw deals the blocks as any n connected regions of n cells;
    here they are variables, so a check covers every jigsaw of the size."""
    n = rw * rh
    digits = list(range(1, n + 1))
    value = {c: z3.Int(f"v_{c}") for c in g.cells}
    cand = {(c, d): z3.Bool(f"cand_{c}_{d}") for c in g.cells for d in digits}
    if jigsaw:
        reg = Regions(g.cells, g.adj4, n, name="blk", sizes=n)
    else:
        fixed = {(x, y): (y // rh) * (n // rw) + x // rw for x, y in g.cells}
        reg = Regions(g.cells, g.adj4, n, name="blk", fixed=fixed)
    units = [("row", i) for i in range(n)] + [("col", i) for i in range(n)] + [("blk", r) for r in range(n)]

    def unit_cells(u):
        kind, i = u
        if kind == "row":
            return {c: True for c in g.rows[i]}
        if kind == "col":
            return {c: True for c in g.cols[i]}
        return {c: reg.label[c] == i for c in g.cells}

    rules = [Atom(z3.And([z3.And(value[c] >= 1, value[c] <= n) for c in g.cells]))]
    if jigsaw:
        rules.append(Atom(reg.wellformed()))
    for a in g.cells:
        for b in g.cells:
            if a < b:
                same = a[0] == b[0] or a[1] == b[1]
                rules.append(Atom(z3.Implies(z3.Or(same, reg.label[a] == reg.label[b]), value[a] != value[b])))
    consistent = Atom(z3.And([z3.Implies(value[c] == d, cand[(c, d)]) for c in g.cells for d in digits]))

    def verify(a):
        v, lab = a["value"], a["region"]
        if jigsaw and not (regions_ok(g, lab, n) and all(len(cs) == n for cs in regions_of(g.cells, lab).values())):
            return False
        groups = list(g.rows) + list(g.cols) + list(regions_of(g.cells, lab).values())
        return all(len({v[c] for c in grp}) == len(grp) for grp in groups)

    def sees(a, b):
        return z3.And(z3.BoolVal(a != b), z3.Or(z3.BoolVal(a[0] == b[0] or a[1] == b[1]), reg.label[a] == reg.label[b]))

    return Game(f"Solo{' Jigsaw' if jigsaw else ''} {n}x{n}", rules, consistent,
                {"value": value, "region": reg.label}, verify,
                {"value": value, "cand": cand, "units": units, "unit_cells": unit_cells, "digits": digits,
                 "sees": sees, "n": n})


def solo_ladder(g, gm):
    value, cand, units, uc, digits, sees = (gm.extra[k] for k in ("value", "cand", "units", "unit_cells", "digits", "sees"))
    cells = g.cells
    in_unit = lambda u, c: lift(lambda uu, cc: uc(uu).get(cc, False), u, c)
    out = []
    out.append(Technique("hiddenSingle", [("u", lambda e: units), ("d", lambda e: digits),
                                          ("c", lambda e: union_over(e["u"], uc))],
                         lambda e: Forall(minus(union_over(e["u"], uc), e["c"]),
                                          lambda c2: lift(lambda d: z3.Not(cand[(c2, d)]), e["d"])),
                         lambda e: lift(lambda c, d: value[c] == d, e["c"], e["d"])))
    out.append(Technique("nakedSingle", [("c", lambda e: cells), ("d", lambda e: digits)],
                         lambda e: lift(lambda c, d: z3.And([z3.Not(cand[(c, d2)]) for d2 in digits if d2 != d]), e["c"], e["d"]),
                         lambda e: lift(lambda c, d: value[c] == d, e["c"], e["d"])))
    # intersect: d's candidates in u1 all inside u2 strike d from u2's other cells.
    out.append(Technique("intersect", [("u1", lambda e: units), ("u2", lambda e: units), ("d", lambda e: digits),
                                       ("c", lambda e: cells)],
                         lambda e: And(Forall(cells, lambda x: Or(Not(in_unit(e["u1"], x)), in_unit(e["u2"], x),
                                                                  lift(lambda d: z3.Not(cand[(x, d)]), e["d"]))),
                                       in_unit(e["u2"], e["c"]), Not(in_unit(e["u1"], e["c"]))),
                         lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"])))
    # subset, naked pair: two cells of u whose candidates lie in {d1, d2}
    # strike d1 and d2 from the rest of u.
    pairs = [(d1, d2) for d1 in digits for d2 in digits if d1 < d2]
    out.append(Technique("subset", [("u", lambda e: units), ("p", lambda e: pairs), ("a", lambda e: cells),
                                    ("b", lambda e: cells), ("c", lambda e: cells), ("i", lambda e: [0, 1])],
                         lambda e: And(in_unit(e["u"], e["a"]), in_unit(e["u"], e["b"]), in_unit(e["u"], e["c"]),
                                       lift(lambda a, b, c: z3.BoolVal(len({a, b, c}) == 3), e["a"], e["b"], e["c"]),
                                       lift(lambda a, p: z3.And([z3.Not(cand[(a, d)]) for d in digits if d not in p]), e["a"], e["p"]),
                                       lift(lambda b, p: z3.And([z3.Not(cand[(b, d)]) for d in digits if d not in p]), e["b"], e["p"])),
                         lambda e: lift(lambda c, p, i: value[c] != p[i], e["c"], e["p"], e["i"])))
    # subset, hidden pair: d1 and d2 have no candidate in u outside a and b,
    # so a holds one of them.
    out.append(Technique("hiddenPair", [("u", lambda e: units), ("p", lambda e: pairs), ("a", lambda e: cells),
                                        ("b", lambda e: cells)],
                         lambda e: And(in_unit(e["u"], e["a"]), in_unit(e["u"], e["b"]),
                                       lift(lambda a, b: z3.BoolVal(a != b), e["a"], e["b"]),
                                       Forall(cells, lambda x: Or(Not(in_unit(e["u"], x)), lift(lambda a, b: z3.BoolVal(x in (a, b)), e["a"], e["b"]),
                                                                  lift(lambda p: z3.And(z3.Not(cand[(x, p[0])]), z3.Not(cand[(x, p[1])])), e["p"])))),
                         lambda e: lift(lambda a, p: z3.Or(value[a] == p[0], value[a] == p[1]), e["a"], e["p"])))
    # fish, size 2 (an X-wing) over rows and columns.
    n = gm.extra["n"]
    rpairs = [(i, j) for i in range(n) for j in range(n) if i < j]
    out.append(Technique("fish", [("d", lambda e: digits), ("r", lambda e: rpairs), ("k", lambda e: rpairs),
                                  ("c", lambda e: cells)],
                         lambda e: lift(lambda d, r, k, c: z3.And(
                             z3.BoolVal(c[0] in k and c[1] not in r),
                             *[z3.Not(cand[((x, y), d)]) for y in r for x in range(n) if x not in k]), e["d"], e["r"], e["k"], e["c"]),
                         lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"])))
    # wing (XY): m holds {x, y}, e1 {x, z}, e2 {y, z}, m sees both ends, and t
    # sees both ends: t is not z.
    trip = [(x, y, z) for x in digits for y in digits for z in digits if len({x, y, z}) == 3 and x < y]
    only = lambda c, ds: z3.And([z3.Not(cand[(c, d)]) for d in digits if d not in ds])
    out.append(Technique("wing", [("v", lambda e: trip), ("m", lambda e: cells), ("e1", lambda e: cells),
                                  ("e2", lambda e: cells), ("t", lambda e: cells)],
                         lambda e: And(lift(lambda m, v: only(m, (v[0], v[1])), e["m"], e["v"]),
                                       lift(lambda a, v: only(a, (v[0], v[2])), e["e1"], e["v"]),
                                       lift(lambda b, v: only(b, (v[1], v[2])), e["e2"], e["v"]),
                                       lift(sees, e["m"], e["e1"]), lift(sees, e["m"], e["e2"]),
                                       lift(sees, e["t"], e["e1"]), lift(sees, e["t"], e["e2"])),
                         lambda e: lift(lambda t, v: value[t] != v[2], e["t"], e["v"])))
    # forcingChain, three links: s holds {a, b}; q1 sees s and holds {b, c};
    # q2 sees q1 and holds {c, a}. Either s or q2 is a, so a cell seeing both
    # is not a.
    out.append(Technique("forcingChain", [("v", lambda e: [(a, b, c) for a in digits for b in digits for c in digits if len({a, b, c}) == 3]),
                                          ("s", lambda e: cells), ("q1", lambda e: cells), ("q2", lambda e: cells),
                                          ("t", lambda e: cells)],
                         lambda e: And(lift(lambda s, v: only(s, (v[0], v[1])), e["s"], e["v"]),
                                       lift(lambda q, v: only(q, (v[1], v[2])), e["q1"], e["v"]),
                                       lift(lambda q, v: only(q, (v[2], v[0])), e["q2"], e["v"]),
                                       lift(sees, e["q1"], e["s"]), lift(sees, e["q2"], e["q1"]),
                                       lift(sees, e["t"], e["s"]), lift(sees, e["t"], e["q2"])),
                         lambda e: lift(lambda t, v: value[t] != v[0], e["t"], e["v"])))
    return out


# ---------------------------------------------------------------- Seismic


def seismic(g, k, tectonic):
    """Seismic (collection): areas of size N hold 1..N once; two equal numbers
    n may not `clash`. Seismic's clash: same row or column, n or fewer apart.
    Tectonic's: the eight neighbors. The areas are variables."""
    reg = Regions(g.cells, g.adj4, k, name="area")
    top = len(g.cells)
    value = {c: z3.Int(f"sv_{c}") for c in g.cells}
    digits = list(range(1, 6))
    cand = {(c, d): z3.Bool(f"scand_{c}_{d}") for c in g.cells for d in digits}
    size = {r: count_in(reg, r, lambda c: z3.BoolVal(True)) for r in reg.ids}

    def area_size(c):
        t = z3.IntVal(0)
        for r in reg.ids:
            t = z3.If(reg.label[c] == r, size[r], t)
        return t

    def clash(a, b, n):
        if a == b:
            return z3.BoolVal(False)
        if tectonic:
            return z3.BoolVal(b in g.adj8[a])
        dx, dy = abs(a[0] - b[0]), abs(a[1] - b[1])
        if dx == 0 or dy == 0:
            return z3.BoolVal(dx + dy <= n) if isinstance(n, int) else (dx + dy <= n)
        return z3.BoolVal(False)

    rules = [Atom(reg.wellformed())]
    rules += [Atom(z3.And(value[c] >= 1, value[c] <= area_size(c), value[c] <= max(digits))) for c in g.cells]
    for a in g.cells:
        for b in g.cells:
            if a < b:
                rules.append(Atom(z3.Implies(reg.label[a] == reg.label[b], value[a] != value[b])))
                rules.append(Atom(z3.Implies(value[a] == value[b], z3.Not(clash(a, b, value[a])))))
    consistent = Atom(z3.And([z3.Implies(value[c] == d, cand[(c, d)]) for c in g.cells for d in digits]))

    def verify(a):
        v, lab = a["value"], a["region"]
        if not regions_ok(g, lab, k):
            return False
        for cs in regions_of(g.cells, lab).values():
            if sorted(v[c] for c in cs) != list(range(1, len(cs) + 1)):
                return False
        for x in g.cells:
            for y in g.cells:
                if x != y and v[x] == v[y]:
                    if tectonic and y in g.adj8[x]:
                        return False
                    dx, dy = abs(x[0] - y[0]), abs(x[1] - y[1])
                    if not tectonic and (dx == 0 or dy == 0) and dx + dy <= v[x]:
                        return False
        return True

    return Game("Tectonic" if tectonic else "Seismic", rules, consistent, {"value": value, "region": reg.label}, verify,
                {"value": value, "cand": cand, "reg": reg, "digits": digits, "clash": clash, "area_size": area_size})


def seismic_ladder(g, gm):
    """Seismic's rungs, each reading the clash relation of the game it is
    checked in."""
    value, cand, reg, digits, clash, area_size = (gm.extra[k] for k in ("value", "cand", "reg", "digits", "clash", "area_size"))
    cells = g.cells
    only = lambda c, d: z3.And([z3.Not(cand[(c, d2)]) for d2 in digits if d2 != d])
    out = [Technique("nakedSingle", [("c", lambda e: cells), ("d", lambda e: digits)],
                     lambda e: lift(only, e["c"], e["d"]),
                     lambda e: lift(lambda c, d: value[c] == d, e["c"], e["d"])),
           # strike: a cell down to n strikes n from every cell it clashes with,
           # and from the rest of its area.
           Technique("strike", [("p", lambda e: cells), ("d", lambda e: digits), ("c", lambda e: cells)],
                     lambda e: lift(lambda p, d, c: z3.And(z3.BoolVal(p != c), only(p, d),
                                                           z3.Or(clash(p, c, d), reg.label[p] == reg.label[c])),
                                    e["p"], e["d"], e["c"]),
                     lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"])),
           # hiddenSingle in an area: n, owed by c's area, has no other home there.
           Technique("hiddenSingle", [("c", lambda e: cells), ("d", lambda e: digits)],
                     lambda e: lift(lambda c, d: z3.And(d <= area_size(c), *[
                         z3.Implies(reg.label[x] == reg.label[c], z3.Not(cand[(x, d)])) for x in cells if x != c]),
                         e["c"], e["d"]),
                     lambda e: lift(lambda c, d: value[c] == d, e["c"], e["d"])),
           # starve: every home of n in a's area, which owes n, clashes with c.
           Technique("starve", [("a", lambda e: cells), ("d", lambda e: digits), ("c", lambda e: cells)],
                     lambda e: lift(lambda a, d, c: z3.And(
                         reg.label[c] != reg.label[a], d <= area_size(a),
                         *[z3.Implies(z3.And(reg.label[h] == reg.label[a], cand[(h, d)]), clash(c, h, d)) for h in cells]),
                         e["a"], e["d"], e["c"]),
                     lambda e: lift(lambda c, d: value[c] != d, e["c"], e["d"]))]
    return out


# ------------------------------------------------------------ Star Battle


def starbattle(g, stars, fixed=None):
    """Star Battle (collection): `stars` (the parameter k) a row, column and
    region, no two touching. Regions are variables unless `fixed` deals them."""
    n = g.w
    reg = Regions(g.cells, g.adj4, n, name="sreg", fixed=fixed)
    value, mark, domain, consistent = shading(g.cells)
    units = [("row", i) for i in range(n)] + [("col", i) for i in range(n)] + [("reg", r) for r in range(n)]

    def unit_cells(u):
        kind, i = u
        if kind == "row":
            return {c: True for c in g.rows[i]}
        if kind == "col":
            return {c: True for c in g.cols[i]}
        return {c: reg.label[c] == i for c in g.cells}

    rules = [domain] + ([Atom(reg.wellformed())] if fixed is None else [])
    rules += [Atom(z3.Sum([z3.If(as_bool(m), value[c], 0) for c, m in unit_cells(u).items()]) == stars) for u in units]
    rules += [Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1))) for a in g.cells for b in g.adj8[a]]

    def verify(a):
        v, lab = a["value"], a["region"]
        if fixed is None and not regions_ok(g, lab, n):
            return False
        groups = list(g.rows) + list(g.cols) + list(regions_of(g.cells, lab).values())
        return all(sum(v[c] for c in grp) == stars for grp in groups) and \
            not any(v[x] == 1 and v[y] == 1 for x in g.cells for y in g.adj8[x])

    return Game(f"Star Battle k={stars} {n}x{n}", rules, consistent, {"value": value, "region": reg.label}, verify,
                {"value": value, "mark": mark, "units": units, "unit_cells": unit_cells, "k": stars, "reg": reg})


def as_bool(m):
    return z3.BoolVal(m) if isinstance(m, bool) else m


def starbattle_ladder(g, gm):
    """Star Battle's rungs, general in k: each reads the k of the game it is
    checked in. Marks: 1 star, 0 cross, 2 unknown."""
    value, mark, units, uc, k = (gm.extra[x] for x in ("value", "mark", "units", "unit_cells", "k"))
    cells = g.cells
    inu = lambda u, c: lift(lambda uu, cc: as_bool(uc(uu).get(cc, False)), u, c)
    stars_in = lambda u: lift(lambda uu: z3.Sum([z3.If(z3.And(as_bool(m), mark[c] == 1), 1, 0) for c, m in uc(uu).items()]), u)
    open_in = lambda uu, c: z3.And(as_bool(uc(uu).get(c, False)), mark[c] == 2)
    need = lambda u: k - stars_in(u)
    touch = lambda a, b: a != b and abs(a[0] - b[0]) <= 1 and abs(a[1] - b[1]) <= 1

    def room_at_least(pool, m):
        """At least m cells of `pool` (a function of a cell to a z3 Bool), no
        two touching; m is at most 3, so it is first-order."""
        if m <= 0:
            return z3.BoolVal(True)
        parts = []
        for a in cells:
            if m == 1:
                parts.append(pool(a))
                continue
            for b in cells:
                if b <= a or touch(a, b):
                    continue
                if m == 2:
                    parts.append(z3.And(pool(a), pool(b)))
                    continue
                for c in cells:
                    if c <= b or touch(a, c) or touch(b, c):
                        continue
                    parts.append(z3.And(pool(a), pool(b), pool(c)))
        return z3.Or(parts) if parts else z3.BoolVal(False)

    def lacks_room(pool, need_term):
        return z3.Or([z3.And(need_term == m, z3.Not(room_at_least(pool, m))) for m in range(1, k + 1)])

    out = [Technique("around", [("s", lambda e: cells), ("c", lambda e: cells)],
                     lambda e: lift(lambda s, c: z3.And(z3.BoolVal(touch(s, c)), mark[s] == 1), e["s"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"])),
           Technique("full", [("u", lambda e: units), ("c", lambda e: cells)],
                     lambda e: And(inu(e["u"], e["c"]), lift(lambda c: mark[c] == 2, e["c"]), Atom(need(e["u"]) == 0)),
                     lambda e: lift(lambda c: value[c] == 0, e["c"])),
           Technique("exact", [("u", lambda e: units), ("c", lambda e: cells)],
                     lambda e: And(inu(e["u"], e["c"]), lift(lambda c: mark[c] == 2, e["c"]),
                                   Atom(need(e["u"]) > 0),
                                   Atom(lift(lambda uu: z3.Sum([z3.If(open_in(uu, x), 1, 0) for x in cells]), e["u"]) == need(e["u"]))),
                     lambda e: lift(lambda c: value[c] == 1, e["c"])),
           # confined, one line and one region: r's open cells all in line L and
           # need(r) = need(L): L's other open cells are no star; and the other
           # half, L's open cells all in r: r's other open cells are no star.
           Technique("confinedLine", [("L", lambda e: units[:2 * g.w]), ("r", lambda e: units[2 * g.w:]), ("c", lambda e: cells)],
                     lambda e: And(lift(lambda L, r, c: z3.And(
                         mark[c] == 2, as_bool(uc(L).get(c, False)), z3.Not(as_bool(uc(r).get(c, False))),
                         *[z3.Implies(open_in(r, x), as_bool(uc(L).get(x, False))) for x in cells]), e["L"], e["r"], e["c"]),
                         Atom(need(e["r"]) == need(e["L"]))),
                     lambda e: lift(lambda c: value[c] == 0, e["c"])),
           Technique("confinedRegion", [("L", lambda e: units[:2 * g.w]), ("r", lambda e: units[2 * g.w:]), ("c", lambda e: cells)],
                     lambda e: And(lift(lambda L, r, c: z3.And(
                         mark[c] == 2, as_bool(uc(r).get(c, False)), z3.Not(as_bool(uc(L).get(c, False))),
                         *[z3.Implies(open_in(L, x), as_bool(uc(r).get(x, False))) for x in cells]), e["L"], e["r"], e["c"]),
                         Atom(need(e["r"]) == need(e["L"]))),
                     lambda e: lift(lambda c: value[c] == 0, e["c"])),
           # needed: without c, u has no room for its need.
           Technique("needed", [("u", lambda e: units), ("c", lambda e: cells)],
                     lambda e: And(inu(e["u"], e["c"]), lift(lambda c: mark[c] == 2, e["c"]),
                                   Atom(lift(lambda uu, c: lacks_room(lambda x: z3.And(z3.BoolVal(x != c), open_in(uu, x)), k - z3.Sum(
                                       [z3.If(z3.And(as_bool(m), mark[y] == 1), 1, 0) for y, m in uc(uu).items()])), e["u"], e["c"]))),
                     lambda e: lift(lambda c: value[c] == 1, e["c"])),
           # crowded: a star at c, with its touching cells crossed, leaves a unit
           # U without room for what U then still needs.
           Technique("crowded", [("c", lambda e: cells), ("U", lambda e: units)],
                     lambda e: And(lift(lambda c: mark[c] == 2, e["c"]),
                                   Atom(lift(lambda c, U: lacks_room(
                                       lambda x: z3.And(z3.BoolVal(x != c and not touch(x, c)), open_in(U, x)),
                                       k - z3.Sum([z3.If(z3.And(as_bool(m), mark[y] == 1), 1, 0) for y, m in uc(U).items()])
                                       - z3.If(as_bool(uc(U).get(c, False)), 1, 0)), e["c"], e["U"]))),
                     lambda e: lift(lambda c: value[c] == 0, e["c"])),
           # starved: as crowded, and the star also completes each of its own
           # units that needed one, crossing their other open cells.
           Technique("starved", [("c", lambda e: cells), ("U", lambda e: units)],
                     lambda e: And(lift(lambda c: mark[c] == 2, e["c"]),
                                   Atom(lift(lambda c, U: lacks_room(
                                       lambda x: z3.And(z3.BoolVal(x != c and not touch(x, c)), open_in(U, x),
                                                        *[z3.Not(z3.And(as_bool(uc(o).get(c, False)), as_bool(uc(o).get(x, False)),
                                                                        k - z3.Sum([z3.If(z3.And(as_bool(m), mark[y] == 1), 1, 0) for y, m in uc(o).items()]) == 1))
                                                          for o in units]),
                                       k - z3.Sum([z3.If(z3.And(as_bool(m), mark[y] == 1), 1, 0) for y, m in uc(U).items()])
                                       - z3.If(as_bool(uc(U).get(c, False)), 1, 0)), e["c"], e["U"]))),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))]
    return out
