"""Group A of the test (`test.md`): the corpus's fifteen wrong pairs. The pairs
the solver decides are run here, each technique first in its own game (it
must be sound there, or the statement is wrong) and then in the other game.
Every 'unsound' has passed the other game's independent verifier.

Run: python3 run_a.py [pair ...]   (A1, A2, ...; all by default)
Writes results-a.txt beside it, keeping the lines of pairs not run."""

import sys
import time

from pzl import binding_of, check_technique, write_results
from space import Grid
import shading as S
import regions as R
import numbers_loops as N

TIMEOUT = 900
results = {}


def check(pair, label, game, tech, split=1, narrow=True):
    t0 = time.time()
    search = game.extra.get("search", []) if narrow else []
    v, m, env = check_technique(game.rules + search, game.consistent, tech, timeout_s=TIMEOUT, split=split,
                                answer_vars=game.answer_vars, verify=game.verify)
    if search and v.startswith("sound"):
        v = "undecided (narrowed search)"
    dt = time.time() - t0
    line = f"{pair:4} {label:58} {v:22} {dt:7.1f}s"
    if m is not None:
        line += f"   at {binding_of(m, env)}"
    print(line, flush=True)
    results.setdefault(pair, []).append({"check": label, "verdict": v, "seconds": round(dt, 1),
                                         "binding": {k: str(x) for k, x in binding_of(m, env).items()} if m else None})
    return v


def own_and_cross(pair, board, x_name, x_game, x_tech, y_name, y_game, split=1):
    """x_tech is a technique of X: sound in X, and is it sound in Y?"""
    gx, gy = x_game(board), y_game(board)
    tag = f"{board.w}x{board.h}"
    check(pair, f"{x_name}'s {x_tech(board, gx).name} in {x_name} {tag}", gx, x_tech(board, gx), split, narrow=False)
    check(pair, f"{x_name}'s {x_tech(board, gy).name} in {y_name} {tag}", gy, x_tech(board, gy), split)


PAIRS = {}


def pair(name):
    def deco(f):
        PAIRS[name] = f
        return f
    return deco


@pair("A1")
def a1():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A1", g, "Nurikabe", S.nurikabe, S.nurikabe_unreachable, "Mochikoro", S.mochikoro)
        own_and_cross("A1", g, "Mochikoro", S.mochikoro, S.mochikoro_rectangle, "Nurikabe", S.nurikabe)


@pair("A2")
def a2():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A2", g, "LITS", lambda b: R.lits(b, 2), R.lits_four, "Norinori", lambda b: R.norinori(b, 4))
        own_and_cross("A2", g, "Norinori", lambda b: R.norinori(b, 4), R.norinori_pair, "LITS", lambda b: R.lits(b, 2))


@pair("A3")
def a3():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A3", g, "Heyawake", lambda b: R.heyawake(b, 3), R.heyawake_adjacent, "Hinge", lambda b: R.hinge(b, 3))
        own_and_cross("A3", g, "Hinge", lambda b: R.hinge(b, 3), R.hinge_alone, "Heyawake", lambda b: R.heyawake(b, 3))


@pair("A4")
def a4():
    for w in (4, 6):
        g = Grid(w, w)
        own_and_cross("A4", g, "Yin-Yang", S.yinyang, lambda b, gm: S.windows_completion(b, gm, None), "Unruly", S.unruly)
        own_and_cross("A4", g, "Unruly", S.unruly, S.unruly_threes, "Yin-Yang", S.yinyang)


@pair("A5")
def a5():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A5", g, "Range", S.range_game, S.range_connect, "Cave", S.cave)
        own_and_cross("A5", g, "Range", S.range_game, S.range_adjacency, "Cave", S.cave)
        own_and_cross("A5", g, "Cave", S.cave, S.cave_enclosed, "Range", S.range_game)


@pair("A7")
def a7():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A7", g, "Stostone", lambda b: R.stostone(b, 4), R.stostone_column, "Shimaguni", lambda b: R.shimaguni(b, 4))
        own_and_cross("A7", g, "Shimaguni", lambda b: R.shimaguni(b, 4), R.shimaguni_differ, "Stostone", lambda b: R.stostone(b, 4))


@pair("A8")
def a8():
    for w, h in ((3, 3), (4, 4)):
        g = Grid(w, h)
        own_and_cross("A8", g, "Pipe Link", N.pipelink, N.pipe_corner, "Reflect Link", N.reflect)


@pair("A10")
def a10():
    for w, h in ((4, 4), (5, 4)):
        g = Grid(w, h)
        own_and_cross("A10", g, "Sukoro", N.sukoro, N.sukoro_full, "View", N.view)
        own_and_cross("A10", g, "View", N.view, N.view_seen, "Sukoro", N.sukoro)


@pair("A14")
def a14():
    for n in (5, 6):
        g = Grid(n, n)
        own_and_cross("A14", g, "N-Queens", R.nqueens, R.nqueens_diagonal, "Star Battle", lambda b: R.starbattle(b, n))


if __name__ == "__main__":
    which = sys.argv[1:] or list(PAIRS)
    for name in which:
        PAIRS[name]()
    write_results("results-a.txt", results)
