"""The planning pairs of the test (`test.md` § "The computed cut", a planning
freedom), checked by exhaustive search of every position of small boards.

A prune claims no plan reaches the finish from a position its premise holds
of: it is sound when every such position is unsolvable. A macro claims an
effect: it is sound when the effect holds wherever it applies. Both are
checked on every position reachable from every deal of the board.

Run: python3 planning.py [A9 D1 D2 C15 C23]. Writes results-planning.txt."""

import itertools
import sys
import time
from pzl import write_results

results = {}


def record(pair, label, verdict, seconds, witness=None):
    line = f"{pair:4} {label:58} {verdict:28} {seconds:7.1f}s"
    if witness is not None:
        line += f"   at {witness}"
    print(line, flush=True)
    results.setdefault(pair, []).append({"check": label, "verdict": verdict, "seconds": round(seconds, 1),
                                         "binding": None if witness is None else str(witness)})


class Solver:
    """Whether a position can reach the finish, for every position reachable
    from `starts`: a least fixed point backward from the finished positions,
    which is exact whether or not moves can be undone (ball sort's can)."""

    def __init__(self, starts, moves, finish):
        self.positions = reachable(starts, moves)
        back = {}
        for p in self.positions:
            for q in moves(p):
                back.setdefault(q, []).append(p)
        good = {p for p in self.positions if finish(p)}
        todo = list(good)
        while todo:
            q = todo.pop()
            for p in back.get(q, ()):
                if p not in good:
                    good.add(p)
                    todo.append(p)
        self.good = good

    def __call__(self, p):
        return p in self.good


def check_prune(pair, label, positions, premise, solvable):
    """A prune is sound when no position its premise holds of is solvable."""
    t0 = time.time()
    n = fired = 0
    for p in positions:
        n += 1
        if premise(p):
            fired += 1
            if solvable(p):
                record(pair, label, "unsound", time.time() - t0, p)
                return "unsound"
    verdict = "sound" if fired else "sound (never fires)"
    record(pair, f"{label} [{fired}/{n} positions]", verdict, time.time() - t0)
    return verdict


def reachable(starts, moves):
    seen, todo = set(starts), list(starts)
    while todo:
        p = todo.pop()
        for q in moves(p):
            if q not in seen:
                seen.add(q)
                todo.append(q)
    return seen


# ------------------------------------------------------- Neko and Hiroimono

DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))
OPP = {d: (-d[0], -d[1]) for d in DIRS}


def cells_of(w, h):
    return [(x, y) for y in range(h) for x in range(w)]


def first_in(w, h, c, d, items):
    x, y = c
    while True:
        x, y = x + d[0], y + d[1]
        if not (0 <= x < w and 0 <= y < h):
            return None
        if (x, y) in items:
            return (x, y)


def neko(w, h):
    """Neko (corpus 102): the cat jumps to the first fruit in a direction and
    eats it; finished when no fruit is left. A position is (cat, fruits)."""
    def moves(p):
        cat, fruit = p
        out = []
        for d in DIRS:
            f = first_in(w, h, cat, d, fruit)
            if f is not None:
                out.append((f, fruit - {f}))
        return out
    cells = cells_of(w, h)
    starts = [(c, frozenset(F)) for c in cells
              for r in range(len(cells)) for F in itertools.combinations([x for x in cells if x != c], r)]
    return starts, moves, lambda p: not p[1]


def hiroimono(w, h):
    """Hiroimono (corpus 38), written as moves (the rewrite `test.md` allows):
    the first move picks any stone; each later move goes to the first stone in
    a direction that does not reverse the last. A position is (current stone or
    None before the first move, stones left, the last direction or None)."""
    def moves(p):
        cur, stones, last = p
        if cur is None:
            return [(s, stones - {s}, None) for s in stones]
        out = []
        for d in DIRS:
            if last is not None and d == OPP[last]:
                continue
            s = first_in(w, h, cur, d, stones)
            if s is not None:
                out.append((s, stones - {s}, d))
        return out
    cells = cells_of(w, h)
    starts = [(None, frozenset(S), None) for r in range(1, len(cells) + 1) for S in itertools.combinations(cells, r)]
    return starts, moves, lambda p: p[0] is not None and not p[1]


def shares_line(a, b):
    return a != b and (a[0] == b[0] or a[1] == b[1])


def neko_isolated(cat, fruit):
    """For the cat's cell k and a fruit f: nothing else of the fruits, nor k,
    in f's row or column."""
    return cat is not None and any(not any(shares_line(f, g) for g in (fruit - {f}) | {cat}) for f in fruit)


def neko_stuck(cat, fruit):
    """For the cat's cell k: no fruit in k's row or column, and a fruit left."""
    return cat is not None and bool(fruit) and not any(shares_line(cat, f) for f in fruit)


def hiro_no_reverse(cur, stones, last):
    """The current stone has stones only behind it, in the reverse of the last
    direction, and stones are left."""
    if cur is None or last is None or not stones:
        return False
    return all(d == OPP[last] for d in DIRS if any(
        s[0] - cur[0] == 0 and (s[1] - cur[1]) * d[1] > 0 or s[1] - cur[1] == 0 and (s[0] - cur[0]) * d[0] > 0
        for s in stones))


def run_a9():
    for w, h in ((3, 3), (4, 3), (4, 4)):
        tag = f"{w}x{h}"
        ns, nm, nf = neko(w, h)
        hs, hm, hf = hiroimono(w, h)
        n_solv, h_solv = Solver(ns, nm, nf), Solver(hs, hm, hf)
        n_pos, h_pos = n_solv.positions, h_solv.positions
        check_prune("A9", f"Neko's isolated in Neko {tag}", n_pos, lambda p: neko_isolated(*p), n_solv)
        check_prune("A9", f"Neko's stuck in Neko {tag}", n_pos, lambda p: neko_stuck(*p), n_solv)
        # Neko's prunes read the cat: in Hiroimono's writing, its current stone.
        check_prune("A9", f"Neko's isolated in Hiroimono {tag}", h_pos, lambda p: neko_isolated(p[0], p[1]), h_solv)
        check_prune("A9", f"Neko's stuck in Hiroimono {tag}", h_pos, lambda p: neko_stuck(p[0], p[1]), h_solv)
        check_prune("A9", f"Hiroimono's noReverse in Hiroimono {tag}", h_pos, lambda p: hiro_no_reverse(*p), h_solv)
    record("A9", "Hiroimono's noReverse in Neko", "not expressible", 0.0,
           "Neko's position has no last direction")


# ------------------------------------------------------------------ ball sort


def ballsort(k, h, e, tube):
    """Ball sort (corpus 108): pour the top ball onto an empty tube or a same
    colored top with room; finished when every tube is empty or full of one
    color. With `tube`, the owner's added tube: one more empty tube, once. A
    position is (tubes, spare), each tube a tuple bottom to top."""
    def moves(p):
        tubes, spare = p
        out = []
        for a, ta in enumerate(tubes):
            if not ta:
                continue
            for b, tb in enumerate(tubes):
                if a != b and len(tb) < h and (not tb or tb[-1] == ta[-1]):
                    nt = list(tubes)
                    nt[a], nt[b] = ta[:-1], tb + (ta[-1],)
                    out.append((tuple(nt), spare))
        if spare:
            out.append((tubes + ((),), 0))
        return out

    def finish(p):
        return all(not t or (len(t) == h and len(set(t)) == 1) for t in p[0])

    balls = [c for c in range(k) for _ in range(h)]
    starts = set()
    for perm in set(itertools.permutations(balls)):
        tubes = tuple(tuple(perm[i * h:(i + 1) * h]) for i in range(k)) + ((),) * e
        starts.add((tubes, 1 if tube else 0))
    return starts, moves, finish


def pours(p, h):
    tubes = p[0]
    return any(ta and b != a and len(tb) < h and (not tb or tb[-1] == ta[-1])
               for a, ta in enumerate(tubes) for b, tb in enumerate(tubes))


def run_d1():
    for k, h in ((2, 2), (2, 3), (3, 2), (3, 3)):
        tag = f"{k} colors, {h} high, 1 empty"
        for tube in (False, True):
            name = "ball sort with the tube" if tube else "ball sort"
            st, mv, fin = ballsort(k, h, 1, tube)
            solv = Solver(st, mv, fin)
            pos = solv.positions
            check_prune("D1", f"ball sort's noPour in {name}, {tag}", pos,
                        lambda p: not fin(p) and not pours(p, h), solv)
            t0 = time.time()
            bad = None
            for p in pos:
                tubes = p[0]
                for a, ta in enumerate(tubes):
                    if not ta:
                        continue
                    run = len(ta) - len(tuple(itertools.takewhile(lambda x: x == ta[-1], reversed(ta))))
                    n = len(ta) - run
                    for b, tb in enumerate(tubes):
                        if a != b and tb and tb[-1] == ta[-1] and h - len(tb) >= n:
                            q = p
                            for _ in range(n):
                                nxt = [r for r in mv(q) if r[1] == q[1] and len(r[0][b]) == len(q[0][b]) + 1
                                       and len(r[0][a]) == len(q[0][a]) - 1]
                                if not nxt:
                                    bad = p
                                    break
                                q = nxt[0]
                            if bad is None and (q[0][b][-n:] != ta[-n:] or q[0][a] != ta[:-n]):
                                bad = p
                if bad:
                    break
            record("D1", f"ball sort's pourRun in {name}, {tag}", "unsound" if bad else "sound", time.time() - t0, bad)
    record("D1", "the tube's addTube in plain ball sort", "not expressible", 0.0, "plain ball sort has no such move")


# ------------------------------------------------------------- knight's tour

KNIGHT = [(a * sx, b * sy) for a, b in ((1, 2), (2, 1)) for sx in (1, -1) for sy in (1, -1)]


def knights(w, h, closed):
    cells = cells_of(w, h)
    adj = {c: [(c[0] + dx, c[1] + dy) for dx, dy in KNIGHT if 0 <= c[0] + dx < w and 0 <= c[1] + dy < h] for c in cells}

    def moves(p):
        start, k, seen = p
        return [(start, n, seen | {n}) for n in adj[k] if n not in seen]

    def finish(p):
        start, k, seen = p
        return len(seen) == len(cells) and (not closed or start in adj[k])

    starts = [(c, c, frozenset([c])) for c in cells]
    return starts, moves, finish, adj, cells


def run_d2():
    for w, h in ((3, 4), (3, 5)):
        tag = f"{w}x{h}"
        tours = {}
        for closed in (False, True):
            st, mv, fin, adj, cells = knights(w, h, closed)
            solv = Solver(st, mv, fin)
            tours[closed] = (solv, solv.positions, adj, cells)
        for closed in (False, True):
            solv, pos, adj, cells = tours[closed]
            name = "the closed tour" if closed else "Knight's Tour"

            def dead_ends(p, adj=adj, cells=cells):
                start, k, seen = p
                left = [c for c in cells if c not in seen]
                lone = [u for u in left if not any(v not in seen for v in adj[u]) and u not in adj[k]]
                return len(lone) >= 2

            def no_return(p, adj=adj, cells=cells):
                start, k, seen = p
                return len(seen) < len(cells) and not any(v not in seen for v in adj[start])

            check_prune("D2", f"Knight's Tour's deadEnds in {name} {tag}", pos, dead_ends, solv)
            check_prune("D2", f"the closed tour's noReturn in {name} {tag}", pos, no_return, solv)
        solvable_closed = sum(1 for p in tours[True][1] if p[2] == frozenset([p[0]]) and tours[True][0](p))
        record("D2", f"closed tours exist on {tag}", "yes" if solvable_closed else "no: closed checks are vacuous", 0.0)
    record("D2", "Knight's Tour's prunes in the closed tour, by entailment", "kept", 0.0,
           "the same moves, and the closed finish implies the open one")


# ------------------------------------------------------------------- Twiddle


def twiddle_moves(w, h, n):
    """Each block's quarter turn, anticlockwise and clockwise, as (permutation,
    turn): the cell a content goes to, and the quarter turns it gains. The
    code's convention: p[k] receives p[k+1] for the cells listed clockwise."""
    gens = []
    for by in range(h - n + 1):
        for bx in range(w - n + 1):
            perm = {c: c for c in cells_of(w, h)}
            turn = {c: 0 for c in cells_of(w, h)}
            for y in range(n):
                for x in range(n):
                    # anticlockwise quarter turn of the block: (x, y) -> (y, n-1-x)
                    src = (bx + x, by + y)
                    dst = (bx + y, by + n - 1 - x)
                    perm[src] = dst
                    turn[src] = 1
            gens.append((perm, turn))
    out = []
    for perm, turn in gens:
        inv = {v: k for k, v in perm.items()}
        out.append((perm, turn))
        out.append((inv, {c: -turn[c] % 4 for c in turn}))
    return out


def compose(seq, cells):
    """The effect of moves in order: where each cell's content ends, and its
    net quarter turns."""
    where = {c: c for c in cells}
    turns = {c: 0 for c in cells}
    for perm, turn in seq:
        for c in cells:
            at = where[c]
            turns[c] = (turns[c] + turn[at]) % 4
            where[c] = perm[at]
    return where, turns


def run_c15():
    w = h = 3
    n = 2
    cells = cells_of(w, h)
    mv = twiddle_moves(w, h, n)
    single = list(range(len(mv)))
    inverse = {i: i ^ 1 for i in single}
    blocks = len(mv) // 2

    def powers(b):
        return [[2 * b], [2 * b + 1], [2 * b, 2 * b]]

    def inv(seq):
        return [inverse[i] for i in reversed(seq)]

    library = [[i] for i in single]
    for a in range(blocks):
        for b in range(blocks):
            if a == b:
                continue
            for X in powers(a):
                for Y in powers(b):
                    comm = X + Y + inv(X) + inv(Y)
                    library.append(comm)
                    library.append(X + Y + inv(X))          # a tuck
                    for s in single:
                        library.append([s] + comm + [inverse[s]])

    def fix(where):
        f = 0
        while f < len(cells) and where[cells[f]] == cells[f]:
            f += 1
        return f

    t0 = time.time()
    broken = None
    checked = 0
    for seq in library:
        where, turns = compose([mv[i] for i in seq], cells)
        f = fix(where)
        checked += 1
        # Plain's claim: cells before f hold their tiles. With orientation, a
        # finished tile is also the right way round.
        if any(turns[cells[i]] for i in range(f)):
            broken = (seq, f, [turns[cells[i]] for i in range(f)])
            break
    record("C16", f"Twiddle's library sequences in orientation, 3x3 [{checked} sequences]",
           "unsound" if broken else "sound", time.time() - t0, broken)
    record("C15", "Twiddle's library sequences in rows only", "sound (argued, not run)", 0.0,
           "a cell holding its tile holds a tile of its row")
    record("C15", "rows only's sequences in Twiddle", "sound (argued, not run)", 0.0,
           "with every value distinct, a same-valued tile is the tile")
    record("C16", "orientation's twists in Twiddle", "not expressible", 0.0, "plain Twiddle has no turns")


# ------------------------------------------------------------------ Netslide


def grid_edges(w, h, wrap):
    es = set()
    for y in range(h):
        for x in range(w):
            for dx, dy in ((1, 0), (0, 1)):
                nx, ny = x + dx, y + dy
                if wrap:
                    nx, ny = nx % w, ny % h
                elif nx >= w or ny >= h:
                    continue
                if (nx, ny) != (x, y):
                    es.add(tuple(sorted(((x, y), (nx, ny)))))
    return sorted(es)


def spanning_trees(cells, edges):
    n = len(cells)
    for es in itertools.combinations(edges, n - 1):
        parent = {c: c for c in cells}

        def root(c):
            while parent[c] != c:
                parent[c] = parent[parent[c]]
                c = parent[c]
            return c
        ok = True
        for a, b in es:
            ra, rb = root(a), root(b)
            if ra == rb:
                ok = False
                break
            parent[ra] = rb
        if ok:
            yield es


def run_c23():
    for w, h in ((3, 3), (4, 3)):
        cells = cells_of(w, h)
        for wrap in (False, True):
            name = f"Netslide{' wrapping' if wrap else ''} {w}x{h}"
            t0 = time.time()
            trees = bad = 0
            for es in spanning_trees(cells, grid_edges(w, h, wrap)):
                trees += 1
                arms = {c: 0 for c in cells}
                for a, b in es:
                    arms[a] += 1
                    arms[b] += 1
                if any(v == 0 for v in arms.values()) or sum(arms.values()) != 2 * (len(cells) - 1):
                    bad += 1
            record("C23", f"the arm prunes over every answer of {name} [{trees} trees]",
                   "unsound" if bad else "sound", time.time() - t0)
    # The parity prune: on a board odd both ways, every slide of a line other
    # than the source's is an odd cycle, an even permutation. Wrapping does not
    # change the slides, so one group serves both writings.
    w = h = 3
    cells = cells_of(w, h)
    idx = {c: i for i, c in enumerate(cells)}
    cx, cy = w // 2, h // 2
    gens = []
    for y in range(h):
        if y != cy:
            for s in (1, -1):
                gens.append(tuple(idx[((c[0] - s) % w, c[1])] if c[1] == y else idx[c] for c in cells))
    for x in range(w):
        if x != cx:
            for s in (1, -1):
                gens.append(tuple(idx[(c[0], (c[1] - s) % h)] if c[0] == x else idx[c] for c in cells))
    t0 = time.time()
    start = tuple(range(len(cells)))
    seen = {start}
    todo = [start]
    while todo:
        p = todo.pop()
        for g in gens:
            q = tuple(p[g[i]] for i in range(len(cells)))
            if q not in seen:
                seen.add(q)
                todo.append(q)

    def even(p):
        p, s = list(p), 0
        for i in range(len(p)):
            while p[i] != i:
                j = p[i]
                p[i], p[j] = p[j], p[i]
                s += 1
        return s % 2 == 0
    odd = [p for p in seen if not even(p)]
    record("C23", f"the parity prune, 3x3 slide group [{len(seen)} arrangements]",
           "unsound" if odd else "sound", time.time() - t0)


RUNS = {"A9": run_a9, "D1": run_d1, "D2": run_d2, "C15": run_c15, "C23": run_c23}

if __name__ == "__main__":
    sys.setrecursionlimit(100000)
    for name in sys.argv[1:] or list(RUNS):
        RUNS[name]()
    write_results("results-planning.txt", results)
