"""Spaces, marks and answers on a board: the library's grid relations, and
dealt regions as variables so that a check covers every way of dealing them."""

import z3

from pzl import Connected, as_z3, members, where

DIRS4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
DIRS8 = DIRS4 + ((1, 1), (1, -1), (-1, 1), (-1, -1))
KNIGHT = tuple((a * sx, b * sy) for a, b in ((1, 2), (2, 1)) for sx in (1, -1) for sy in (1, -1))


class Grid:
    def __init__(self, w, h, wrap=False):
        self.w, self.h, self.wrap = w, h, wrap
        self.cells = [(x, y) for y in range(h) for x in range(w)]
        self.rows = [tuple((x, y) for x in range(w)) for y in range(h)]
        self.cols = [tuple((x, y) for y in range(h)) for x in range(w)]
        self.adj4 = self.neighbors(DIRS4)
        self.adj8 = self.neighbors(DIRS8)

    def at(self, x, y):
        if self.wrap:
            return (x % self.w, y % self.h)
        return (x, y) if 0 <= x < self.w and 0 <= y < self.h else None

    def neighbors(self, dirs):
        out = {}
        for (x, y) in self.cells:
            ns = []
            for dx, dy in dirs:
                n = self.at(x + dx, y + dy)
                if n is not None and n != (x, y) and n not in ns:
                    ns.append(n)
            out[(x, y)] = ns
        return out

    def ray(self, c, d):
        """The cells from c's neighbor in direction d to the edge, in order."""
        out, (x, y) = [], c
        while True:
            x, y = x + d[0], y + d[1]
            n = self.at(x, y)
            if n is None or n == c or n in out:
                return out
            out.append(n)

    def runs(self, k):
        """Every run of k consecutive cells along a row or column, both ways."""
        out = []
        for line in self.rows + self.cols:
            for seq in (line, line[::-1]):
                out += [tuple(seq[i:i + k]) for i in range(len(seq) - k + 1)]
        return out

    def windows2(self):
        return [((x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1))
                for y in range(self.h - 1) for x in range(self.w - 1)]

    def rim(self, c):
        x, y = c
        return x in (0, self.w - 1) or y in (0, self.h - 1)


class Regions:
    """A dealt partition of the cells into k connected regions, as variables:
    `label[c]` is the region of c. A check over these covers every partition
    of the board into k connected regions. `fixed` deals one instead."""

    def __init__(self, cells, adj, k, name="reg", fixed=None, sizes=None):
        self.cells, self.k = cells, k
        self.ids = list(range(k))
        if fixed is not None:
            self.label = {c: z3.IntVal(fixed[c]) for c in cells}
        else:
            self.label = {c: z3.Int(f"{name}_{c}") for c in cells}
        self.adj = adj
        self.sizes = sizes

    def cells_of(self, r):
        return {c: self.label[c] == r for c in self.cells}

    def wellformed(self):
        cs = [z3.And(self.label[c] >= 0, self.label[c] < self.k) for c in self.cells]
        for r in self.ids:
            m = self.cells_of(r)
            cs.append(z3.Or(list(m.values())))
            cs.append(Connected(m, self.adj).z(1))
            if self.sizes is not None:
                cs.append(z3.Sum([z3.If(g, 1, 0) for g in m.values()]) == self.sizes)
        return z3.And(cs)

    def same(self, a, b):
        return self.label[a] == self.label[b]


def shading(cells, name="value"):
    """An answer cell -> {0 clear, 1 shaded}, and marks {0, 1, 2 unknown}
    consistent with it."""
    value = {c: z3.Int(f"{name}_{c}") for c in cells}
    mark = {c: z3.Int(f"mark_{c}") for c in cells}
    domain = z3.And([z3.And(v >= 0, v <= 1) for v in value.values()])
    consistent = z3.And([z3.And(m >= 0, m <= 2, z3.Implies(m != 2, m == value[c]))
                         for c, m in mark.items()])
    return value, mark, domain, consistent


def candidates(cells, digits, name="value"):
    """An answer cell -> digits, and candidate marks that never strike the
    answer's digit."""
    value = {c: z3.Int(f"{name}_{c}") for c in cells}
    cand = {(c, d): z3.Bool(f"cand_{c}_{d}") for c in cells for d in digits}
    domain = z3.And([z3.Or([value[c] == d for d in digits]) for c in cells])
    consistent = z3.And([z3.Implies(value[c] == d, cand[(c, d)]) for c in cells for d in digits])
    return value, cand, domain, consistent


def known(mark, c, v):
    return mark[c] == v


def shaded_set(value, cells, v=1):
    return {c: value[c] == v for c in cells}


def connected_where(value, cells, adj, v):
    return Connected(where(cells, lambda c: value[c] == v), adj)


__all__ = ["Grid", "Regions", "shading", "candidates", "members", "as_z3"]
