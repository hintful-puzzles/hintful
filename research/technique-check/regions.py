"""Group A's games over dealt regions. The regions are variables (`Regions`),
so a check covers every partition of the board into k connected regions;
the verifier reads the partition back with the answer. A region clue is one
variable a region, `rc[r]`, -1 for none."""

import itertools

import z3

from pzl import And, Atom, Connected, ExistsFill, Technique, lift, where
from shading import Game, comps, one_comp, no2x2
from space import Regions, shading

UNKNOWN = 2


def region_clues(reg, top):
    rc = {r: z3.Int(f"rc_{r}") for r in reg.ids}
    dom = And(*[Atom(z3.And(rc[r] >= -1, rc[r] <= top)) for r in reg.ids])
    return rc, dom


def rc_of(reg, rc, c):
    """The clue of c's region."""
    t = z3.IntVal(-1)
    for r in reg.ids:
        t = z3.If(reg.label[c] == r, rc[r], t)
    return t


def count_in(reg, r, cond):
    return z3.Sum([z3.If(z3.And(reg.label[c] == r, cond(c)), 1, 0) for c in reg.cells])


def regions_of(cells, lab):
    out = {}
    for c in cells:
        out.setdefault(lab[c], []).append(c)
    return out


def regions_ok(g, lab, k):
    """The partition the verifier reads back: k connected regions."""
    regs = regions_of(g.cells, lab)
    return len(regs) == k and all(len(comps(cs, g.adj4, lambda c, cs=set(cs): c in cs)) == 1 for cs in regs.values())


def base(g, k, sizes=None, name="reg"):
    reg = Regions(g.cells, g.adj4, k, name=name, sizes=sizes)
    value, mark, domain, consistent = shading(g.cells)
    return reg, value, mark, [domain, Atom(reg.wellformed())], consistent


# --------------------------------------------------------------------- LITS


def normal_shape(cells):
    """A shape up to rotation and reflection: the least of its 8 images."""
    best = None
    for fx, fy, sw in itertools.product((1, -1), (1, -1), (False, True)):
        pts = [((y, x) if sw else (x, y)) for x, y in cells]
        pts = [(x * fx, y * fy) for x, y in pts]
        mx, my = min(p[0] for p in pts), min(p[1] for p in pts)
        img = tuple(sorted((x - mx, y - my) for x, y in pts))
        best = img if best is None or img < best else best
    return best


def lits(g, k):
    """LITS (corpus 4): four shaded cells a region, connected; all shaded
    connected; no 2x2 shaded; touching tetrominoes of two regions not alike.
    The encoding leaves out the tetromino's own connectivity and `alike`; the
    verifier holds them."""
    reg, value, mark, rules, consistent = base(g, k)
    rules += [Atom(count_in(reg, r, lambda c: value[c] == 1) == 4) for r in reg.ids]
    rules += [Connected(where(g.cells, lambda c: value[c] == 1), g.adj4),
              And(*[Atom(z3.Not(z3.And([value[c] == 1 for c in q]))) for q in g.windows2()])]

    def verify(a):
        v, lab = a["value"], a["region"]
        if not regions_ok(g, lab, k) or not one_comp(g.cells, g.adj4, lambda c: v[c] == 1) or not no2x2(g, v, 1):
            return False
        regs = regions_of(g.cells, lab)
        tet = {}
        for r, cs in regs.items():
            sh = [c for c in cs if v[c] == 1]
            if len(sh) != 4 or not one_comp(sh, g.adj4, lambda c, s=set(sh): c in s):
                return False
            tet[r] = normal_shape(sh)
        for c in g.cells:
            for d in g.adj4[c]:
                if v[c] == 1 and v[d] == 1 and lab[c] != lab[d] and tet[lab[c]] == tet[lab[d]]:
                    return False
        return True

    return Game("LITS", rules, consistent, {"value": value, "region": reg.label}, verify,
                {"value": value, "mark": mark, "reg": reg})


def norinori(g, k):
    """Norinori (corpus 5): two shaded cells a region; every shaded cell has
    exactly one shaded neighbor."""
    reg, value, mark, rules, consistent = base(g, k)
    rules += [Atom(count_in(reg, r, lambda c: value[c] == 1) == 2) for r in reg.ids]
    rules += [Atom(z3.Implies(value[c] == 1, z3.Sum([value[d] for d in g.adj4[c]]) == 1)) for c in g.cells]

    def verify(a):
        v, lab = a["value"], a["region"]
        if not regions_ok(g, lab, k):
            return False
        if any(sum(v[c] for c in cs) != 2 for cs in regions_of(g.cells, lab).values()):
            return False
        return all(v[c] == 0 or sum(v[d] for d in g.adj4[c]) == 1 for c in g.cells)

    return Game("Norinori", rules, consistent, {"value": value, "region": reg.label}, verify,
                {"value": value, "mark": mark, "reg": reg})


def lits_four(g, gm):
    """LITS: a region with four cells left that are not clear has them all
    shaded (a region holds four)."""
    value, mark, reg = gm.extra["value"], gm.extra["mark"], gm.extra["reg"]
    return Technique("four", [("c", lambda e: g.cells)],
                     lambda e: lift(lambda c: z3.And(mark[c] == UNKNOWN,
                                                     z3.Sum([z3.If(z3.And(reg.label[x] == reg.label[c], mark[x] != 0), 1, 0)
                                                             for x in g.cells]) == 4), e["c"]),
                     lambda e: lift(lambda c: value[c] == 1, e["c"]))


def norinori_pair(g, gm):
    """Norinori: a shaded cell with a shaded neighbor has its other neighbors
    clear."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("pair", [("s", lambda e: g.cells), ("t", lambda e: g.cells), ("c", lambda e: g.cells)],
                     lambda e: lift(lambda s, t, c: z3.And(z3.BoolVal(t in g.adj4[s] and c in g.adj4[s] and c != t),
                                                           mark[s] == 1, mark[t] == 1), e["s"], e["t"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


# -------------------------------------------------------- Heyawake and Hinge


def heyawake(g, k):
    """Heyawake (corpus 3): no two shaded touch, clear connected, a room's clue
    counts its shaded cells, and no run of clear cells crosses two room
    borders."""
    reg, value, mark, rules, consistent = base(g, k, name="room")
    rc, rdom = region_clues(reg, len(g.cells))
    rules += [rdom, Connected(where(g.cells, lambda c: value[c] == 0), g.adj4)]
    rules += [Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1))) for a in g.cells for b in g.adj4[a]]
    rules += [Atom(z3.Implies(rc[r] >= 0, count_in(reg, r, lambda c: value[c] == 1) == rc[r])) for r in reg.ids]
    for L in g.rows + g.cols:
        for i in range(len(L)):
            for j in range(i + 2, len(L)):
                run = z3.And([value[c] == 0 for c in L[i:j + 1]])
                borders = z3.Sum([z3.If(reg.label[L[t]] != reg.label[L[t + 1]], 1, 0) for t in range(i, j)])
                rules.append(Atom(z3.Implies(run, borders <= 1)))

    def verify(a):
        v, lab, cl = a["value"], a["region"], a["rc"]
        if not regions_ok(g, lab, k) or not one_comp(g.cells, g.adj4, lambda c: v[c] == 0):
            return False
        if any(v[x] == 1 and v[y] == 1 for x in g.cells for y in g.adj4[x]):
            return False
        for r, cs in regions_of(g.cells, lab).items():
            if cl[r] >= 0 and sum(v[c] for c in cs) != cl[r]:
                return False
        for L in g.rows + g.cols:
            for i in range(len(L)):
                for j in range(i + 1, len(L)):
                    if all(v[c] == 0 for c in L[i:j + 1]):
                        if sum(lab[L[t]] != lab[L[t + 1]] for t in range(i, j)) > 1:
                            return False
        return True

    return Game("Heyawake", rules, consistent, {"value": value, "region": reg.label, "rc": rc}, verify,
                {"value": value, "mark": mark, "reg": reg, "rc": rc})


def hinge_block_ok(g, lab, block):
    """Hinge's rule for one shaded block: the edges inside it that cross a
    region border are exactly the block's edges across one grid line, one
    unbroken run along it, and the block is its own mirror image across it."""
    bset = set(block)
    inner = [(a, b) for a in block for b in g.adj4[a] if b in bset and a < b]
    x_edges = [(a, b) for a, b in inner if lab[a] != lab[b]]
    if not x_edges:
        return False
    vertical = {a[0] + 0.5 for a, b in x_edges if a[1] == b[1]}
    horizontal = {a[1] + 0.5 for a, b in x_edges if a[0] == b[0]}
    if len(vertical) + len(horizontal) != 1:
        return False
    if vertical:
        line = vertical.pop()
        across = [(a, b) for a, b in inner if a[1] == b[1] and min(a[0], b[0]) + 0.5 == line]
        if set(across) != set(x_edges):
            return False
        ys = sorted(a[1] for a, b in across)
        if ys != list(range(ys[0], ys[0] + len(ys))):
            return False
        return all((round(2 * line - x), y) in bset for x, y in block)
    line = horizontal.pop()
    across = [(a, b) for a, b in inner if a[0] == b[0] and min(a[1], b[1]) + 0.5 == line]
    if set(across) != set(x_edges):
        return False
    xs = sorted(a[0] for a, b in across)
    if xs != list(range(xs[0], xs[0] + len(xs))):
        return False
    return all((x, round(2 * line - y)) in bset for x, y in block)


def hinge(g, k):
    """Hinge (corpus 6): every shaded block is split by a region border into
    two mirror halves; a region's clue counts its shaded cells. The encoding
    holds the clues and that a shaded cell has a shaded neighbor across or
    along the block; the verifier holds the whole rule."""
    reg, value, mark, rules, consistent = base(g, k)
    rc, rdom = region_clues(reg, len(g.cells))
    rules += [rdom]
    rules += [Atom(z3.Implies(rc[r] >= 0, count_in(reg, r, lambda c: value[c] == 1) == rc[r])) for r in reg.ids]
    rules += [Atom(z3.Implies(value[c] == 1, z3.Or([value[d] == 1 for d in g.adj4[c]]))) for c in g.cells]

    def verify(a):
        v, lab, cl = a["value"], a["region"], a["rc"]
        if not regions_ok(g, lab, k):
            return False
        for r, cs in regions_of(g.cells, lab).items():
            if cl[r] >= 0 and sum(v[c] for c in cs) != cl[r]:
                return False
        return all(hinge_block_ok(g, lab, b) for b in comps(g.cells, g.adj4, lambda c: v[c] == 1))

    # Where to look for a counterexample: blocks that are dominoes across a
    # region border, each a valid Hinge block. A search narrowed so can find
    # an answer but cannot show there is none (run_a.py says so).
    search = [Atom(z3.Implies(value[c] == 1, z3.And(
        z3.Sum([value[d] for d in g.adj4[c]]) == 1,
        *[z3.Implies(value[d] == 1, reg.label[d] != reg.label[c]) for d in g.adj4[c]]))) for c in g.cells]
    return Game("Hinge", rules, consistent, {"value": value, "region": reg.label, "rc": rc}, verify,
                {"value": value, "mark": mark, "reg": reg, "rc": rc, "search": search})


def heyawake_adjacent(g, gm):
    """Heyawake: a cell beside a shaded cell is clear."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("adjacent", [("s", lambda e: g.cells), ("c", lambda e: g.cells)],
                     lambda e: lift(lambda s, c: z3.And(z3.BoolVal(c in g.adj4[s]), mark[s] == 1), e["s"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


def hinge_alone(g, gm):
    """Hinge: a cell whose neighbors are all clear is clear, since a block of
    one cell has no border inside it."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("alone", [("c", lambda e: g.cells)],
                     lambda e: lift(lambda c: z3.And(*[mark[d] == 0 for d in g.adj4[c]]), e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


# -------------------------------------------------- Stostone and Shimaguni


def one_block_rules(g, reg, value):
    """Each region holds one connected block of shaded cells, at least one
    cell, and shaded cells of two regions never touch."""
    rules = []
    for r in reg.ids:
        rules.append(Atom(count_in(reg, r, lambda c: value[c] == 1) >= 1))
        rules.append(Connected(where(g.cells, lambda c, r=r: z3.And(reg.label[c] == r, value[c] == 1)), g.adj4))
    rules += [Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1, reg.label[a] != reg.label[b])))
              for a in g.cells for b in g.adj4[a]]
    return rules


def one_block_ok(g, v, lab):
    for cs in regions_of(g.cells, lab).values():
        sh = [c for c in cs if v[c] == 1]
        if not sh or not one_comp(sh, g.adj4, lambda c, s=set(sh): c in s):
            return False
    return not any(v[a] == 1 and v[b] == 1 and lab[a] != lab[b] for a in g.cells for b in g.adj4[a])


def fall(g, v, lab):
    """The blocks fall under gravity until none moves: the set of shaded cells
    after the fall. A block moves down one when every cell below it is free or
    its own."""
    pos = {c for c in g.cells if v[c] == 1}
    owner = {c: lab[c] for c in pos}
    moved = True
    while moved:
        moved = False
        for r in sorted(set(owner.values())):
            cells = [c for c in pos if owner[c] == r]
            below = [(x, y + 1) for x, y in cells]
            if all(y < g.h and ((x, y) not in pos or owner[(x, y)] == r) for x, y in below):
                for c in cells:
                    pos.discard(c)
                    del owner[c]
                for x, y in below:
                    pos.add((x, y))
                    owner[(x, y)] = r
                moved = True
    return pos


def stostone(g, k):
    """Stostone (corpus 17): one block a region, blocks of two regions never
    touch, a clue counts its region's block, and when the blocks fall they
    fill the bottom half exactly. The fall is encoded as the corpus states it,
    an order-keeping downward shift a region that packs the bottom half; the
    verifier simulates gravity."""
    reg, value, mark, rules, consistent = base(g, k)
    rc, rdom = region_clues(reg, len(g.cells))
    rules += [rdom] + one_block_rules(g, reg, value)
    rules += [Atom(z3.Implies(rc[r] >= 0, count_in(reg, r, lambda c: value[c] == 1) == rc[r])) for r in reg.ids]
    d = {r: z3.Int(f"drop_{r}") for r in reg.ids}
    rules += [Atom(z3.And(d[r] >= 0, d[r] <= g.h)) for r in reg.ids]

    def drop(c):
        t = z3.IntVal(0)
        for r in reg.ids:
            t = z3.If(reg.label[c] == r, d[r], t)
        return t

    rules += [Atom(z3.Implies(value[c] == 1, c[1] + drop(c) < g.h)) for c in g.cells]
    for x in range(g.w):
        col = [(x, y) for y in range(g.h)]
        for ty in range(g.h):
            lands = z3.Sum([z3.If(z3.And(value[c] == 1, c[1] + drop(c) == ty), 1, 0) for c in col])
            rules.append(Atom(lands == (1 if ty >= g.h // 2 else 0)))
        for a in col:
            for b in col:
                if a[1] < b[1]:
                    rules.append(Atom(z3.Implies(z3.And(value[a] == 1, value[b] == 1), a[1] + drop(a) < b[1] + drop(b))))

    def verify(a):
        v, lab, cl = a["value"], a["region"], a["rc"]
        if not regions_ok(g, lab, k) or not one_block_ok(g, v, lab):
            return False
        for r, cs in regions_of(g.cells, lab).items():
            if cl[r] >= 0 and sum(v[c] for c in cs) != cl[r]:
                return False
        return fall(g, v, lab) == {(x, y) for x in range(g.w) for y in range(g.h // 2, g.h)}

    return Game("Stostone", rules, consistent, {"value": value, "region": reg.label, "rc": rc}, verify,
                {"value": value, "mark": mark, "reg": reg, "rc": rc})


def shimaguni(g, k):
    """Shimaguni (written here from pzprjs's rules): one block a region, blocks
    of two regions never touch, blocks of two neighboring regions differ in
    size, and a clue counts its region's block."""
    reg, value, mark, rules, consistent = base(g, k)
    rc, rdom = region_clues(reg, len(g.cells))
    rules += [rdom] + one_block_rules(g, reg, value)
    size = {r: count_in(reg, r, lambda c: value[c] == 1) for r in reg.ids}
    rules += [Atom(z3.Implies(rc[r] >= 0, size[r] == rc[r])) for r in reg.ids]
    for a in g.cells:
        for b in g.adj4[a]:
            for r1 in reg.ids:
                for r2 in reg.ids:
                    if r1 < r2:
                        rules.append(Atom(z3.Implies(z3.And(reg.label[a] == r1, reg.label[b] == r2), size[r1] != size[r2])))

    def verify(a):
        v, lab, cl = a["value"], a["region"], a["rc"]
        if not regions_ok(g, lab, k) or not one_block_ok(g, v, lab):
            return False
        regs = regions_of(g.cells, lab)
        sz = {r: sum(v[c] for c in cs) for r, cs in regs.items()}
        if any(cl[r] >= 0 and sz[r] != cl[r] for r in regs):
            return False
        return not any(lab[x] != lab[y] and sz[lab[x]] == sz[lab[y]] for x in g.cells for y in g.adj4[x])

    return Game("Shimaguni", rules, consistent, {"value": value, "region": reg.label, "rc": rc}, verify,
                {"value": value, "mark": mark, "reg": reg, "rc": rc})


def stostone_column(g, gm):
    """Stostone: a column already holding half its height in shaded cells has
    its other cells clear, since the fall keeps every column's count and
    leaves the bottom half full."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    return Technique("column", [("c", lambda e: g.cells)],
                     lambda e: lift(lambda c: z3.And(mark[c] == UNKNOWN,
                                                     z3.Sum([z3.If(mark[(c[0], y)] == 1, 1, 0) for y in range(g.h)]) == g.h // 2), e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))


def shimaguni_differ(g, gm):
    """Shimaguni: a region of two cells beside a region whose clue is 1 has
    both its cells shaded, since its block cannot also be one cell."""
    value, mark, reg, rc = gm.extra["value"], gm.extra["mark"], gm.extra["reg"], gm.extra["rc"]

    def premise(e):
        return lift(lambda a, b, c: z3.And(
            z3.BoolVal(b in g.adj4[a]), reg.label[a] != reg.label[b], reg.label[c] == reg.label[a],
            z3.Sum([z3.If(reg.label[x] == reg.label[a], 1, 0) for x in g.cells]) == 2,
            rc_of(reg, rc, b) == 1), e["a"], e["b"], e["c"])

    return Technique("differ", [("a", lambda e: g.cells), ("b", lambda e: g.cells), ("c", lambda e: g.cells)],
                     premise, lambda e: lift(lambda c: value[c] == 1, e["c"]))


# ------------------------------------------------- Star Battle and N-Queens


def starbattle(g, k, stars=1):
    """Star Battle (collection): `stars` a row, column and region, no two
    touching, even diagonally. Here k is the number of regions (= the size)."""
    reg, value, mark, rules, consistent = base(g, k)
    rules += [Atom(z3.Sum([value[c] for c in L]) == stars) for L in g.rows + g.cols]
    rules += [Atom(count_in(reg, r, lambda c: value[c] == 1) == stars) for r in reg.ids]
    rules += [Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1))) for a in g.cells for b in g.adj8[a]]

    def verify(a):
        v, lab = a["value"], a["region"]
        if not regions_ok(g, lab, k):
            return False
        if any(sum(v[c] for c in L) != stars for L in g.rows + g.cols):
            return False
        if any(sum(v[c] for c in cs) != stars for cs in regions_of(g.cells, lab).values()):
            return False
        return not any(v[x] == 1 and v[y] == 1 for x in g.cells for y in g.adj8[x])

    return Game(f"Star Battle {stars}", rules, consistent, {"value": value, "region": reg.label}, verify,
                {"value": value, "mark": mark, "reg": reg, "stars": stars})


def nqueens(g):
    """N-Queens (corpus 65): n queens, no two in a row, column or diagonal."""
    value, mark, domain, consistent = shading(g.cells)
    attack = lambda a, b: a != b and (a[0] == b[0] or a[1] == b[1] or abs(a[0] - b[0]) == abs(a[1] - b[1]))
    rules = [domain, Atom(z3.Sum([value[c] for c in g.cells]) == g.w)]
    rules += [Atom(z3.Not(z3.And(value[a] == 1, value[b] == 1))) for a in g.cells for b in g.cells if a < b and attack(a, b)]

    def verify(a):
        v = a["value"]
        qs = [c for c in g.cells if v[c] == 1]
        return len(qs) == g.w and not any(attack(x, y) for x in qs for y in qs)

    return Game("N-Queens", rules, consistent, {"value": value}, verify, {"value": value, "mark": mark})


def nqueens_diagonal(g, gm):
    """N-Queens: no queen on a queen's diagonal, at any distance."""
    value, mark = gm.extra["value"], gm.extra["mark"]
    diag = lambda a, b: a != b and abs(a[0] - b[0]) == abs(a[1] - b[1])
    return Technique("diagonal", [("q", lambda e: g.cells), ("c", lambda e: g.cells)],
                     lambda e: lift(lambda q, c: z3.And(z3.BoolVal(diag(q, c)), mark[q] == 1), e["q"], e["c"]),
                     lambda e: lift(lambda c: value[c] == 0, e["c"]))
