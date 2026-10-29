"""The three games of experiment C: their rules and techniques in the
language's forms, each technique beside a deliberately unsound variant."""

import z3
from pzl_check import Board

V = lambda n: ("var", n)
fn = lambda name, *args: ("fn", name, *args)
P = lambda t, k: ("pick", V(t), k)   # the k-th cell of a run t


def grid(w, h):
    cells = [(x, y) for y in range(h) for x in range(w)]
    adj = {(x, y): [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                    if 0 <= x + dx < w and 0 <= y + dy < h] for (x, y) in cells}
    rows = [[(x, y) for x in range(w)] for y in range(h)]
    cols = [[(x, y) for y in range(h)] for x in range(w)]
    return cells, adj, rows, cols


# ---------------------------------------------------------------- Solo (Latin)

def solo_board(rw, rh):
    n = rw * rh
    cells, adj, rows, cols = grid(n, n)
    boxes = [[(bx * rw + x, by * rh + y) for y in range(rh) for x in range(rw)]
             for by in range(rw) for bx in range(rh)]
    units = {f"u{i}": u for i, u in enumerate(rows + cols + boxes)}
    digits = list(range(1, n + 1))
    value = {c: z3.Int(f"value_{c}") for c in cells}
    cand = {(c, d): z3.Bool(f"cand_{c}_{d}") for c in cells for d in digits}
    return Board({"cells": cells, "units": list(units), "digits": digits},
                 units, adj, {"value": value, "cand": cand})


SOLO_RULES = [
    # answer value : cell -> 1..n
    ("forall", "c", "cells", ("exists", "d", "digits", ("=", fn("value", V("c")), V("d")))),
    # shape latin(value, rows + cols + box)
    ("forall", "u", "units", ("forall", "c1", ("members", V("u")),
        ("forall", "c2", ("minus", ("members", V("u")), V("c1")),
            ("!=", fn("value", V("c1")), fn("value", V("c2")))))),
]
# marks cand: the answer's digit is never struck
SOLO_CONSISTENT = ("forall", "c", "cells", ("forall", "d", "digits",
    ("implies", ("=", fn("value", V("c")), V("d")), fn("cand", V("c"), V("d")))))

# technique hiddenSingle: for unit u, digit d, cell c in u
#   premise forall c2 in u - {c}: d not in cand(c2)
#   conclude value(c) = d
HIDDEN_SINGLE = (
    [("u", "units"), ("d", "digits"), ("c", ("members", V("u")))],
    ("forall", "c2", ("minus", ("members", V("u")), V("c")),
        ("not", fn("cand", V("c2"), V("d")))),
    ("=", fn("value", V("c")), V("d")),
)
# Planted: the premise reads every cell of the unit but two, c and c3.
HIDDEN_SINGLE_UNSOUND = (
    [("u", "units"), ("d", "digits"), ("c", ("members", V("u"))),
     ("c3", ("minus", ("members", V("u")), V("c")))],
    ("forall", "c2", ("minus", ("members", V("u")), V("c"), V("c3")),
        ("not", fn("cand", V("c2"), V("d")))),
    ("=", fn("value", V("c")), V("d")),
)

# ------------------------------------------------------------- Unruly (binary)

def unruly_board(w, h):
    cells, adj, rows, cols = grid(w, h)
    lines = rows + cols
    triples, quads = [], []
    for L in lines:
        for seq in (L, L[::-1]):
            triples += [tuple(seq[i:i + 3]) for i in range(len(seq) - 2)]
            quads += [tuple(seq[i:i + 4]) for i in range(len(seq) - 3)]
    members = {f"l{i}": L for i, L in enumerate(lines)}
    members.update({t: list(t) for t in triples + quads})
    value = {c: z3.Int(f"value_{c}") for c in cells}
    mark = {c: z3.Int(f"mark_{c}") for c in cells}
    return Board({"cells": cells, "lines": list(members)[:len(lines)], "colors": [0, 1],
                  "triples": triples, "quads": quads},
                 members, adj, {"value": value, "mark": mark,
                                "half": {0: len(rows[0]) // 2}})


UNRULY_RULES = [
    # answer color : cell -> {0, 1}
    ("forall", "c", "cells", ("and", ("<=", 0, fn("value", V("c"))), ("<=", fn("value", V("c")), 1))),
    # rule no three in a row: forall run of three consecutive cells, not all one color
    ("forall", "t", "triples", ("not", ("and",
        ("=", fn("value", P("t", 0)), fn("value", P("t", 1))),
        ("=", fn("value", P("t", 1)), fn("value", P("t", 2)))))),
    # rule balanced: every line has as many of each color
    ("forall", "l", "lines", ("=", ("count", "c", ("members", V("l")), ("=", fn("value", V("c")), 1)),
                               ("fn", "half", 0))),
]
# marks mark : cell -> {0, 1, unknown = 2}; a marked color is the answer's
UNRULY_CONSISTENT = ("forall", "c", "cells", ("and",
    ("<=", 0, fn("mark", V("c"))), ("<=", fn("mark", V("c")), 2),
    ("implies", ("!=", fn("mark", V("c")), 2), ("=", fn("mark", V("c")), fn("value", V("c"))))))

# technique threes (a pair): two of a color side by side; the next cell along is the other color
THREES_PAIR = (
    [("t", "triples"), ("x", "colors")],
    ("and", ("=", fn("mark", P("t", 0)), V("x")), ("=", fn("mark", P("t", 1)), V("x"))),
    ("!=", fn("value", P("t", 2)), V("x")),
)
# technique threes (a gap): a color either side of a cell; the cell is the other color
THREES_GAP = (
    [("t", "triples"), ("x", "colors")],
    ("and", ("=", fn("mark", P("t", 0)), V("x")), ("=", fn("mark", P("t", 2)), V("x"))),
    ("!=", fn("value", P("t", 1)), V("x")),
)
# Planted: a color two apart forbids it in the cell after
THREES_UNSOUND = (
    [("t", "quads"), ("x", "colors")],
    ("and", ("=", fn("mark", P("t", 0)), V("x")), ("=", fn("mark", P("t", 2)), V("x"))),
    ("!=", fn("value", P("t", 3)), V("x")),
)

# --------------------------------------------------------------- Range (shading)

def range_board(w, h):
    cells, adj, rows, cols = grid(w, h)
    value = {c: z3.Int(f"value_{c}") for c in cells}   # 0 clear, 1 shaded
    mark = {c: z3.Int(f"mark_{c}") for c in cells}     # 0 clear, 1 shaded, 2 unknown
    return Board({"cells": cells}, {}, adj, {"value": value, "mark": mark})


RANGE_DOMAIN = ("forall", "c", "cells", ("and", ("<=", 0, fn("value", V("c"))), ("<=", fn("value", V("c")), 1)))
# shape no_adjacent(cells where shaded, adj4)
RANGE_NO_ADJACENT = ("forall", "c", "cells", ("forall", "y", ("adj", V("c")),
    ("not", ("and", ("=", fn("value", V("c")), 1), ("=", fn("value", V("y")), 1)))))
# shape connected(cells where clear, adj4)
RANGE_CONNECTED = ("connected", "c", "cells", ("=", fn("value", V("c")), 0))
RANGE_RULES = [RANGE_DOMAIN, RANGE_NO_ADJACENT, RANGE_CONNECTED]
RANGE_CONSISTENT = UNRULY_CONSISTENT

# technique connect: a cell whose shading would part two squares not shaded is clear
#   for cell c, cells p, q
#   premise mark(c) = unknown, p and q not shaded, and separated in the cells
#           other than c that are not shaded
#   conclude value(c) = clear
CONNECT = (
    [("c", "cells"), ("p", ("minus", "cells", V("c"))), ("q", ("minus", "cells", V("c")))],
    ("and", ("=", fn("mark", V("c")), 2),
            ("!=", fn("mark", V("p")), 1), ("!=", fn("mark", V("q")), 1),
            ("separated", V("p"), V("q"), "x", ("minus", "cells", V("c")),
             ("!=", fn("mark", V("x")), 1))),
    ("=", fn("value", V("c")), 0),
)
# Planted: separation read among the squares known clear, which unknown squares may still join
CONNECT_UNSOUND = (
    CONNECT[0],
    ("and", ("=", fn("mark", V("c")), 2),
            ("=", fn("mark", V("p")), 0), ("=", fn("mark", V("q")), 0),
            ("separated", V("p"), V("q"), "x", ("minus", "cells", V("c")),
             ("=", fn("mark", V("x")), 0))),
    ("=", fn("value", V("c")), 0),
)
