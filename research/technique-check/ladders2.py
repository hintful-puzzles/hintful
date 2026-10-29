"""Group C's other stated ladders (`techniques.md` § "Group C"): Ascent across
its adjacencies and a board shape, Path and Pairs, Flip's two press
patterns, and Net with and without wrapping."""

import itertools

import z3

from pzl import And, Atom, Connected, Not, Reach, Technique, lift, where
from shading import Game, comps

# ------------------------------------------------------------------ Ascent

HEX = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, -1), (-1, 1))
ORTH = ((1, 0), (-1, 0), (0, 1), (0, -1))
KING = ORTH + ((1, 1), (1, -1), (-1, 1), (-1, -1))


def ascent(w, h, mode, walls=()):
    """Ascent (language.md's sample): the numbers 1..N on the board's cells,
    each next to the one before under the mode's adjacency. `walls` removes
    cells from the board, a board shape. `dist` and `near` are the code's: the
    mode's metric on the whole rectangle, walls ignored."""
    dirs = {"orth": ORTH, "hex": HEX, "classic": KING}[mode]
    cells = [(x, y) for y in range(h) for x in range(w) if (x, y) not in walls]
    adj = {c: [(c[0] + dx, c[1] + dy) for dx, dy in dirs if (c[0] + dx, c[1] + dy) in cells] for c in cells}
    N = len(cells)

    def dist(a, b):
        dx, dy = b[0] - a[0], b[1] - a[1]
        if mode == "orth":
            return abs(dx) + abs(dy)
        if mode == "classic":
            return max(abs(dx), abs(dy))
        return abs(dx) + abs(dy) if dx * dy > 0 else max(abs(dx), abs(dy))

    near = lambda a, b: a != b and dist(a, b) == 1
    value = {c: z3.Int(f"a_{c}") for c in cells}
    nums = list(range(1, N + 1))
    cand = {(c, n): z3.Bool(f"acand_{c}_{n}") for c in cells for n in nums}
    rules = [Atom(z3.And([z3.And(value[c] >= 1, value[c] <= N) for c in cells])), Atom(z3.Distinct(list(value.values())))]
    rules += [Atom(z3.Implies(value[c] < N, z3.Or([value[d] == value[c] + 1 for d in adj[c]]))) for c in cells]
    consistent = Atom(z3.And([z3.Implies(value[c] == n, cand[(c, n)]) for c in cells for n in nums]))

    def verify(a):
        v = a["value"]
        if sorted(v.values()) != nums:
            return False
        at = {v[c]: c for c in cells}
        return all(at[n + 1] in adj[at[n]] for n in nums[:-1])

    name = f"Ascent {mode}{' walled' if walls else ''} {w}x{h}"
    return Game(name, rules, consistent, {"value": value}, verify,
                {"value": value, "cand": cand, "cells": cells, "adj": adj, "dist": dist, "near": near, "N": N})


def ascent_ladder(gm):
    value, cand, cells, adj, dist, near, N = (gm.extra[k] for k in ("value", "cand", "cells", "adj", "dist", "near", "N"))
    nums = list(range(1, N + 1))
    placed = lambda p, m: z3.And([z3.Not(cand[(p, k)]) for k in nums if k != m])
    return [
        Technique("singlePosition", [("n", lambda e: nums), ("c", lambda e: cells)],
                  lambda e: lift(lambda n, c: z3.And([z3.Not(cand[(x, n)]) for x in cells if x != c]), e["n"], e["c"]),
                  lambda e: lift(lambda n, c: value[c] == n, e["n"], e["c"])),
        Technique("proximity", [("p", lambda e: cells), ("m", lambda e: nums), ("k", lambda e: nums), ("c", lambda e: cells)],
                  lambda e: lift(lambda p, m, k, c: z3.And(placed(p, m), z3.BoolVal(c != p and dist(c, p) > abs(m - k))),
                                 e["p"], e["m"], e["k"], e["c"]),
                  lambda e: lift(lambda k, c: value[c] != k, e["k"], e["c"])),
        Technique("overlap", [("n", lambda e: nums), ("c", lambda e: cells), ("s", lambda e: [-1, 1])],
                  lambda e: lift(lambda n, c, s: z3.And([z3.Not(cand[(x, n + s)]) for x in cells if near(x, c)])
                                 if 1 <= n + s <= N else z3.BoolVal(False), e["n"], e["c"], e["s"]),
                  lambda e: lift(lambda n, c: value[c] != n, e["n"], e["c"])),
        Technique("deadEnd", [("c", lambda e: [c for c in cells if len(adj[c]) == 1])],
                  lambda e: Atom(z3.BoolVal(True)),
                  lambda e: lift(lambda c: z3.Or(value[c] == 1, value[c] == N), e["c"])),
        Technique("singleNumber", [("c", lambda e: cells), ("n", lambda e: nums)],
                  lambda e: lift(lambda c, n: z3.And([z3.Not(cand[(c, k)]) for k in nums if k != n]), e["c"], e["n"]),
                  lambda e: lift(lambda c, n: value[c] == n, e["c"], e["n"])),
    ]


# -------------------------------------------------------------- Path, Pairs


def path_game(w, h, mode, top=4):
    """Path (collection) in its two rulesets. Lines on edges; a square with no
    number takes two, a numbered one `takes` (Path: one at 1 and the highest,
    else two; Pairs: one); no cycle; two numbers joined by a line through
    unnumbered squares must `fits` (Path: differ by one; Pairs: equal). The
    deal is part of a board: Path's numbers are 1..K once each, Pairs' each
    on two squares."""
    cells = [(x, y) for y in range(h) for x in range(w)]
    adj = {c: [d for d in ((c[0] + 1, c[1]), (c[0] - 1, c[1]), (c[0], c[1] + 1), (c[0], c[1] - 1)) if d in cells] for c in cells}
    edges = sorted({tuple(sorted((a, b))) for a in cells for b in adj[a]})
    at = {c: [e for e in edges if c in e] for c in cells}
    line = {e: z3.Bool(f"pl_{e}") for e in edges}
    emark = {e: z3.Int(f"pm_{e}") for e in edges}
    clue = {c: z3.Int(f"pc_{c}") for c in cells}
    K = z3.Int("pK")
    deg = {c: z3.Sum([z3.If(line[e], 1, 0) for e in at[c]]) for c in cells}
    numbered = lambda c: clue[c] > 0

    def takes(c):
        if mode == "pairs":
            return z3.If(numbered(c), 1, 2)
        return z3.If(z3.And(numbered(c), z3.Or(clue[c] == 1, clue[c] == K)), 1, 2)

    def fits(p, q):
        return (z3.Or(p - q == 1, q - p == 1)) if mode == "path" else (p == q)

    linked = {c: [(e[0] if e[1] == c else e[1], line[e]) for e in at[c]] for c in cells}
    rules = [Atom(z3.And([z3.And(clue[c] >= 0, clue[c] <= top) for c in cells])), Atom(z3.And(K >= 2, K <= top))]
    if mode == "path":
        rules += [Atom(z3.Sum([z3.If(clue[c] == n, 1, 0) for c in cells]) == z3.If(n <= K, 1, 0)) for n in range(1, top + 1)]
    else:
        rules += [Atom(z3.Or(z3.Sum([z3.If(clue[c] == n, 1, 0) for c in cells]) == 0,
                             z3.Sum([z3.If(clue[c] == n, 1, 0) for c in cells]) == 2)) for n in range(1, top + 1)]
    rules += [Atom(deg[c] == takes(c)) for c in cells]
    # No cycle: a line's two ends are never otherwise joined.
    for e in edges:
        a, b = e
        others = {c: [(d, g) for d, g in linked[c] if tuple(sorted((c, d))) != e] for c in cells}
        rules.append(Atom(z3.Implies(line[e], Not(Reach({a: True}, b, {c: True for c in cells}, others)).z(1))))
    # Joined numbers fit: a chain from a to b through unnumbered squares.
    for a in cells:
        for b in cells:
            if a < b:
                inner = {c: z3.Or(z3.Not(numbered(c)), z3.BoolVal(c in (a, b))) for c in cells}
                chain = Reach({a: True}, b, inner, linked)
                rules.append(Atom(z3.Implies(z3.And(numbered(a), numbered(b)), z3.Or(Not(chain).z(1), fits(clue[a], clue[b])))))
    consistent = Atom(z3.And([z3.And(emark[e] >= 0, emark[e] <= 2, z3.Implies(emark[e] != 2, (emark[e] == 1) == line[e]))
                              for e in edges]))

    def verify(a):
        ln, cl = a["line"], a["clue"]
        k = max(cl.values())
        if mode == "path" and sorted(v for v in cl.values() if v) != list(range(1, k + 1)):
            return False
        if mode == "pairs" and any(list(cl.values()).count(n) not in (0, 2) for n in range(1, top + 1)):
            return False
        for c in cells:
            want = 2 if not cl[c] else (1 if mode == "pairs" or cl[c] in (1, k) else 2)
            if sum(ln[e] for e in at[c]) != want:
                return False
        nb = {c: [x for e in at[c] if ln[e] for x in e if x != c] for c in cells}
        for comp in comps(cells, nb, lambda c: True):
            es = {e for e in edges if ln[e] and e[0] in comp}
            if len(es) != len(comp) - 1:
                return False
            ends = [c for c in comp if cl[c]]
            # walk the piece from each numbered square to the next numbered one
            for s in ends:
                for first in nb[s]:
                    prev, cur = s, first
                    while not cl[cur]:
                        nxt = [x for x in nb[cur] if x != prev]
                        if not nxt:
                            break
                        prev, cur = cur, nxt[0]
                    if cl[cur]:
                        p, q = cl[s], cl[cur]
                        if (mode == "path" and abs(p - q) != 1) or (mode == "pairs" and p != q):
                            return False
        return True

    name = f"{'Path' if mode == 'path' else 'Pairs'} {w}x{h}"
    return Game(name, rules, consistent, {"line": line, "clue": clue}, verify,
                {"line": line, "emark": emark, "clue": clue, "cells": cells, "edges": edges, "at": at,
                 "takes": takes, "fits": fits, "adj": adj})


def path_ladder(gm):
    """Path's rungs, general in `takes` and `fits`: each reads them from the
    game it is checked in."""
    line, emark, clue, cells, edges, at, takes, fits, adj = (gm.extra[k] for k in
                                                             ("line", "emark", "clue", "cells", "edges", "at", "takes", "fits", "adj"))
    lines_at = lambda c: z3.Sum([z3.If(emark[e] == 1, 1, 0) for e in at[c]])
    spare = lambda c: lines_at(c) < takes(c)
    other = lambda e, c: e[0] if e[1] == c else e[1]
    live = lambda e: z3.And(emark[e] == 2, spare(e[0]), spare(e[1]))
    marked = {c: [(other(e, c), emark[e] == 1) for e in at[c]] for c in cells}

    def end_of(a, p):
        """p is the number at a, or reached from a along drawn lines through
        unnumbered squares."""
        inner = {c: z3.Or(clue[c] == 0, z3.BoolVal(c == p)) for c in cells}
        return z3.And(clue[p] > 0, z3.Or(z3.BoolVal(a == p), Reach({a: z3.BoolVal(True)}, p, inner, marked).z(1)) if a != p
                      else z3.BoolVal(True))

    return [
        Technique("forced", [("c", lambda e: cells), ("e", lambda e: edges)],
                  lambda e: lift(lambda c, ed: z3.And(z3.BoolVal(ed in at[c]), live(ed), spare(c),
                                                      lines_at(c) + z3.Sum([z3.If(live(x), 1, 0) for x in at[c]]) == takes(c)),
                                 e["c"], e["e"]),
                  lambda e: lift(lambda ed: line[ed], e["e"])),
        Technique("joined", [("e", lambda e: edges), ("p", lambda e: cells), ("q", lambda e: cells)],
                  lambda e: lift(lambda ed, p, q: z3.And(z3.BoolVal(p != q), emark[ed] == 2,
                                                         z3.And(z3.Or(clue[ed[0]] == 0, z3.BoolVal(ed[0] == p)),
                                                                z3.Or(clue[ed[1]] == 0, z3.BoolVal(ed[1] == q))),
                                                         end_of(ed[0], p), end_of(ed[1], q),
                                                         z3.Not(fits(clue[p], clue[q]))), e["e"], e["p"], e["q"]),
                  lambda e: lift(lambda ed: z3.Not(line[ed]), e["e"])),
        Technique("closed", [("e", lambda e: edges)],
                  lambda e: lift(lambda ed: z3.And(emark[ed] == 2,
                                                   Reach({ed[0]: z3.BoolVal(True)}, ed[1], {c: True for c in cells}, marked).z(1)), e["e"]),
                  lambda e: lift(lambda ed: z3.Not(line[ed]), e["e"])),
        # stuck: a line on e fills a, so a's other open edges die; a neighbor c
        # of a then cannot reach its count.
        Technique("stuck", [("e", lambda e: edges), ("i", lambda e: [0, 1]), ("c", lambda e: cells)],
                  lambda e: lift(lambda ed, i, c: z3.And(
                      z3.BoolVal(c in adj[ed[i]] and c != ed[1 - i]), emark[ed] == 2,
                      lines_at(ed[i]) + 1 == takes(ed[i]),
                      lines_at(c) + z3.Sum([z3.If(live(x), 1, 0) for x in at[c] if ed[i] not in x]) < takes(c)),
                      e["e"], e["i"], e["c"]),
                  lambda e: lift(lambda ed: z3.Not(line[ed]), e["e"])),
    ]


# -------------------------------------------------------------------- Flip


def parity(bs):
    """Whether an odd number of the formulas hold."""
    out = z3.BoolVal(False)
    for b in bs:
        out = z3.Xor(out, b)
    return out


def flip(w, h, mode):
    """Flip (collection): pressing a square flips a pattern; the answer is a set
    of presses that leaves every square lit. Crosses' pattern is the square
    and its four neighbors; Random's, the square and a dealt selection of its
    eight, here variables."""
    cells = [(x, y) for y in range(h) for x in range(w)]
    order = {c: i for i, c in enumerate(cells)}
    press = {c: z3.Bool(f"fp_{c}") for c in cells}
    unlit = {c: z3.Bool(f"fu_{c}") for c in cells}
    pmark = {c: z3.Int(f"fm_{c}") for c in cells}
    if mode == "crosses":
        M = {(i, j): z3.BoolVal(i == j or abs(i[0] - j[0]) + abs(i[1] - j[1]) == 1) for i in cells for j in cells}
    else:
        M = {(i, j): (z3.BoolVal(True) if i == j else
                      z3.Bool(f"fM_{i}_{j}") if max(abs(i[0] - j[0]), abs(i[1] - j[1])) == 1 else z3.BoolVal(False))
             for i in cells for j in cells}
    flips = lambda j: [z3.And(M[(i, j)], press[i]) for i in cells]
    rules = [Atom(unlit[j] == parity(flips(j))) for j in cells]
    consistent = Atom(z3.And([z3.And(pmark[c] >= 0, pmark[c] <= 2, z3.Implies(pmark[c] != 2, (pmark[c] == 1) == press[c]))
                              for c in cells]))
    return Game(f"Flip {mode} {w}x{h}", rules, consistent, {}, None,
                {"press": press, "unlit": unlit, "pmark": pmark, "M": M, "cells": cells, "order": order})


def flip_ladder(gm):
    """lastChance, general in the pattern: for the last flipper i of square j
    in reading order, every other flipper of j decided, j still unlit after
    them: press i."""
    press, unlit, pmark, M, cells, order = (gm.extra[k] for k in ("press", "unlit", "pmark", "M", "cells", "order"))

    def premise(i, j):
        last = z3.And(M[(i, j)], *[z3.Not(M[(k, j)]) for k in cells if order[k] > order[i]])
        decided = z3.And([z3.Implies(M[(k, j)], pmark[k] != 2) for k in cells if k != i])
        after = parity([unlit[j]] + [z3.And(M[(k, j)], pmark[k] == 1) for k in cells if k != i])
        return z3.And(last, decided, after)

    return [Technique("lastChance", [("i", lambda e: cells), ("j", lambda e: cells)],
                      lambda e: lift(premise, e["i"], e["j"]), lambda e: lift(lambda i: press[i], e["i"]))]


# --------------------------------------------------------------------- Net

DIRS = ((0, -1), (1, 0), (0, 1), (-1, 0))     # N E S W, a quarter turn clockwise each


def net(w, h, wrap):
    """Net (collection): each tile turned so the wires form one tree over every
    tile. The dealt masks and barriers are variables, so a check covers every
    deal. Without wrapping the border is a wall."""
    cells = [(x, y) for y in range(h) for x in range(w)]

    def nbr(c, d):
        x, y = c[0] + DIRS[d][0], c[1] + DIRS[d][1]
        if wrap:
            return (x % w, y % h)
        return (x, y) if 0 <= x < w and 0 <= y < h else None

    mask = {(c, d): z3.Bool(f"nm_{c}_{d}") for c in cells for d in range(4)}
    rot = {c: z3.Int(f"nr_{c}") for c in cells}
    cand = {(c, r): z3.Bool(f"nc_{c}_{r}") for c in cells for r in range(4)}
    barrier = {(c, d): z3.Bool(f"nb_{c}_{d}") for c in cells for d in range(4)}
    wire_r = lambda c, d, r: mask[(c, (d - r) % 4)]
    wire = lambda c, d: z3.Or([z3.And(rot[c] == r, wire_r(c, d, r)) for r in range(4)])
    rules = [Atom(z3.And(rot[c] >= 0, rot[c] <= 3)) for c in cells]
    links = {}
    for c in cells:
        links[c] = []
        for d in range(4):
            u = nbr(c, d)
            if u is None:
                rules.append(Atom(z3.Not(wire(c, d))))
                continue
            rules.append(Atom(wire(c, d) == wire(u, (d + 2) % 4)))
            rules.append(Atom(barrier[(c, d)] == barrier[(u, (d + 2) % 4)]))
            rules.append(Atom(z3.Implies(barrier[(c, d)], z3.Not(wire(c, d)))))
            links[c].append((u, wire(c, d)))
        rules.append(Atom(z3.Or([wire(c, d) for d in range(4)])))
    rules.append(Connected({c: True for c in cells}, links))
    edges_used = z3.Sum([z3.If(wire(c, d), 1, 0) for c in cells for d in (1, 2) if nbr(c, d) is not None])
    rules.append(Atom(edges_used == len(cells) - 1))
    consistent = Atom(z3.And([z3.Implies(rot[c] == r, cand[(c, r)]) for c in cells for r in range(4)]))
    return Game(f"Net{' wrapping' if wrap else ''} {w}x{h}", rules, consistent, {}, None,
                {"cells": cells, "nbr": nbr, "wire_r": wire_r, "cand": cand, "rot": rot, "barrier": barrier})


def net_ladder(gm):
    cells, nbr, wire_r, cand, rot, barrier = (gm.extra[k] for k in ("cells", "nbr", "wire_r", "cand", "rot", "barrier"))

    def side_known(u, d, s):
        """Every turning left to u agrees its side d is wire (s) or not."""
        return z3.And([z3.Implies(cand[(u, r)], wire_r(u, d, r) == s) for r in range(4)])

    def maybe(c, d):
        u = nbr(c, d)
        if u is None:
            return z3.BoolVal(False)
        return z3.And(z3.Not(barrier[(c, d)]),
                      z3.Or([z3.And(cand[(c, r)], wire_r(c, d, r)) for r in range(4)]),
                      z3.Or([z3.And(cand[(u, r)], wire_r(u, (d + 2) % 4, r)) for r in range(4)]))

    def known_wire(c, d):
        u = nbr(c, d)
        if u is None:
            return z3.BoolVal(False)
        return z3.And(side_known(c, d, True), side_known(u, (d + 2) % 4, True))

    def side_premise(t, r, d):
        u = nbr(t, d)
        if u is None:
            return wire_r(t, d, r)                       # the border is a wall
        return z3.Or(z3.And(barrier[(t, d)], wire_r(t, d, r)),
                     z3.And(side_known(u, (d + 2) % 4, True), z3.Not(wire_r(t, d, r))),
                     z3.And(side_known(u, (d + 2) % 4, False), wire_r(t, d, r)))

    known = {c: [(nbr(c, d), known_wire(c, d)) for d in range(4) if nbr(c, d) is not None] for c in cells}

    def loop_premise(t, r, d1, d2):
        u1, u2 = nbr(t, d1), nbr(t, d2)
        if u1 is None or u2 is None or u1 == u2 or t in (u1, u2):
            return Atom(z3.BoolVal(False))
        return And(Atom(z3.And(wire_r(t, d1, r), wire_r(t, d2, r))),
                   Reach({u1: z3.BoolVal(True)}, u2, {c: z3.BoolVal(c != t) for c in cells}, known))

    def sealed_premise(t, r, x):
        steps = {}
        for c in cells:
            steps[c] = []
            for d in range(4):
                u = nbr(c, d)
                if u is None:
                    continue
                if c == t:
                    g = z3.And(wire_r(t, d, r), maybe(c, d) if u != t else z3.BoolVal(False))
                elif u == t:
                    g = z3.And(wire_r(t, (d + 2) % 4, r), maybe(c, d))
                else:
                    g = maybe(c, d)
                steps[c].append((u, g))
        return Not(Reach({t: z3.BoolVal(True)}, x, {c: True for c in cells}, steps))

    def neighbor_premise(t, r, d):
        u = nbr(t, d)
        if u is None or u == t:
            return z3.BoolVal(False)
        return z3.And([z3.Implies(cand[(u, q)], wire_r(u, (d + 2) % 4, q) != wire_r(t, d, r)) for q in range(4)])

    out_r = lambda e: lift(lambda t, r: rot[t] != r, e["t"], e["r"])
    return [
        Technique("side", [("t", lambda e: cells), ("r", lambda e: range(4)), ("d", lambda e: range(4))],
                  lambda e: lift(side_premise, e["t"], e["r"], e["d"]), out_r),
        Technique("loop", [("t", lambda e: cells), ("r", lambda e: range(4)), ("d1", lambda e: range(4)), ("d2", lambda e: range(4))],
                  lambda e: lift(loop_premise, e["t"], e["r"], e["d1"], e["d2"]), out_r),
        Technique("sealed", [("t", lambda e: cells), ("r", lambda e: range(4)), ("x", lambda e: cells)],
                  lambda e: lift(sealed_premise, e["t"], e["r"], e["x"]), out_r),
        Technique("neighbor", [("t", lambda e: cells), ("r", lambda e: range(4)), ("d", lambda e: range(4))],
                  lambda e: lift(neighbor_premise, e["t"], e["r"], e["d"]), out_r),
    ]
