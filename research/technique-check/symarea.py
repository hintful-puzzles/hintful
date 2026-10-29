"""A11: Symmetry Area and Filling, by enumerating every answer of small boards.

1. The rewrite `test.md` allows: Symmetry Area written with walls (corpus 44)
   and with a number in every cell, as Filling writes it, must have the same
   answers, translated by num(c) = the size of c's region.
2. Written as numbers, Symmetry Area's rules are Filling's with `symmetric`
   added, so Filling's techniques are kept (entailment, read off the two
   descriptions).
3. Symmetry Area's `straightThree` is checked against both games' answers.

Clues are left out on both sides: a clue only removes answers, and each side
is compared over all of its answers. Run: python3 symarea.py"""

import itertools
import time

from pzl import write_results

results = {}


def record(label, verdict, seconds, witness=None):
    line = f"A11  {label:58} {verdict:28} {seconds:7.1f}s" + (f"   at {witness}" if witness else "")
    print(line, flush=True)
    results.setdefault("A11", []).append({"check": label, "verdict": verdict, "seconds": round(seconds, 1),
                                          "binding": witness})


def grid(w, h):
    cells = [(x, y) for y in range(h) for x in range(w)]
    adj = {c: [d for d in ((c[0] + 1, c[1]), (c[0] - 1, c[1]), (c[0], c[1] + 1), (c[0], c[1] - 1))
               if 0 <= d[0] < w and 0 <= d[1] < h] for c in cells}
    edges = sorted({tuple(sorted((a, b))) for a in cells for b in adj[a]})
    return cells, adj, edges


def components(cells, adj, same):
    seen, out = set(), []
    for c in cells:
        if c in seen:
            continue
        comp, todo = [c], [c]
        seen.add(c)
        while todo:
            x = todo.pop()
            for y in adj[x]:
                if y not in seen and same(x, y):
                    seen.add(y)
                    comp.append(y)
                    todo.append(y)
        out.append(frozenset(comp))
    return out


def symmetric(region):
    """Its own image under a half turn about its center."""
    xs = [c[0] for c in region]
    ys = [c[1] for c in region]
    sx, sy = min(xs) + max(xs), min(ys) + max(ys)
    return all((sx - x, sy - y) in region for x, y in region)


def walls_answers(w, h):
    """Corpus 44's writing: a set of walls; a wall only between regions of
    different sizes; every region symmetric."""
    cells, adj, edges = grid(w, h)
    out = set()
    for bits in itertools.product((False, True), repeat=len(edges)):
        wall = {e for e, b in zip(edges, bits) if b}
        regs = components(cells, adj, lambda a, b: tuple(sorted((a, b))) not in wall)
        of = {c: r for r in regs for c in r}
        if any(len(of[a]) == len(of[b]) for a, b in wall):
            continue
        if all(symmetric(r) for r in regs):
            out.add(frozenset(wall))
    return out


def number_answers(w, h, with_symmetry):
    """Filling's writing (collection): a number in every cell, each the size of
    its connected same-number area; with `with_symmetry`, Symmetry Area's rule
    added, every area symmetric."""
    cells, adj, edges = grid(w, h)
    n = len(cells)
    out = []
    for vals in itertools.product(range(1, n + 1), repeat=n):
        num = dict(zip(cells, vals))
        regs = components(cells, adj, lambda a, b: num[a] == num[b])
        if all(len(r) == num[next(iter(r))] for r in regs) and (not with_symmetry or all(symmetric(r) for r in regs)):
            out.append(num)
    return out


def straight_three(answers, w, h):
    """straightThree: two neighboring 3s make a 3 at a right angle to them
    impossible. Sound when no answer has such an L of 3s. Marks show only
    true values, so the answer holding the premise is the worst case."""
    cells, adj, _ = grid(w, h)
    for num in answers:
        for a in cells:
            for b in adj[a]:
                for c in adj[b]:
                    if c != a and (c[0] - b[0], c[1] - b[1]) != (b[0] - a[0], b[1] - a[1]):
                        if num[a] == num[b] == num[c] == 3:
                            return (a, b, c)
    return None


for w, h in ((2, 3), (2, 4)):
    tag = f"{w}x{h}"
    t0 = time.time()
    walls = walls_answers(w, h)
    sym = number_answers(w, h, True)
    cells, adj, edges = grid(w, h)
    translated = {frozenset(e for e in edges if num[e[0]] != num[e[1]]) for num in sym}
    same = translated == walls and len(translated) == len(sym)
    record(f"the two writings of Symmetry Area {tag} [{len(walls)} answers]",
           "same answers" if same else "DIFFERENT", time.time() - t0)
    t0 = time.time()
    fill = number_answers(w, h, False)
    record(f"Filling's rules hold of Symmetry Area's answers {tag}",
           "entails" if all(any(f == s for f in fill) for s in sym) else "not", time.time() - t0)
    t0 = time.time()
    hit = straight_three(sym, w, h)
    record(f"Symmetry Area's straightThree in Symmetry Area {tag}", "unsound" if hit else "sound", time.time() - t0, hit)
    t0 = time.time()
    hit = straight_three(fill, w, h)
    record(f"Symmetry Area's straightThree in Filling {tag} [{len(fill)} answers]",
           "unsound" if hit else "sound", time.time() - t0, hit)

write_results("results-a.txt", results)
