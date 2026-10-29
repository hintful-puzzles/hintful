"""Group C of the test (`test.md`): the variations that need every rung
stated. Each game's ladder is checked in its own game and in the variation,
both ways; a technique general in a relation or parameter reads the variation's.

Run: python3 run_c.py [C2 C12 C8 ...]. Writes results-c.txt."""

import sys
import time

import z3

from pzl import binding_of, check_technique, node, write_results
from space import Grid
import ladders as L

TIMEOUT = 1800
results = {}


def check(pair, label, game, tech, split):
    t0 = time.time()
    v, m, env = check_technique(game.rules, game.consistent, tech, timeout_s=TIMEOUT, split=split,
                                answer_vars=game.answer_vars, verify=game.verify)
    dt = time.time() - t0
    b = binding_of(m, env) if m is not None else None
    print(f"{pair:4} {label:58} {v:28} {dt:7.1f}s" + (f"   at {b}" if b else ""), flush=True)
    results.setdefault(pair, []).append({"check": label, "verdict": v, "seconds": round(dt, 1),
                                         "binding": {k: str(x) for k, x in b.items()} if b else None})
    return v


def satisfiable(game):
    s = z3.Solver()
    s.set("timeout", 600000)
    s.add([node(r).z(1) for r in game.rules])
    return s.check()


def ladder_in(pair, board_tag, ladder, x_name, game, splits):
    for t in ladder:
        check(pair, f"{x_name}'s {t.name} in {game.name}", game, t, splits.get(t.name, 1))


PAIRS = {}


def pair(name):
    def deco(f):
        PAIRS[name] = f
        return f
    return deco


SOLO_SPLITS = {"hiddenSingle": 1, "nakedSingle": 1, "intersect": 2, "subset": 3, "hiddenPair": 2,
               "fish": 3, "wing": 3, "forcingChain": 3}


@pair("C2")
def c2():
    for rw, rh in ((2, 2), (3, 2)):
        n = rw * rh
        g = Grid(n, n)
        # Plain Solo and Jigsaw have one ladder, general in the units
        # (`rungs.md`), so the ladder checked in each game is both games'.
        for y in (L.solo(g, rw, rh, False), L.solo(g, rw, rh, True)):
            ladder_in("C2", "", L.solo_ladder(g, y), "Solo", y, SOLO_SPLITS)


@pair("C12")
def c12():
    for w, h, k in ((4, 4, 4), (5, 4, 5)):
        g = Grid(w, h)
        seis, tect = L.seismic(g, k, False), L.seismic(g, k, True)
        for y in (seis, tect):
            print(f"     {y.name} {w}x{h} satisfiable: {satisfiable(y)}", flush=True)
        # The two rulesets have one ladder, general in clash: checked in a
        # game, it reads that game's clash, so one run a game is both ways.
        for y in (seis, tect):
            ladder_in("C12", f"{w}x{h}", L.seismic_ladder(g, y), f"Seismic {w}x{h}", y,
                      {"nakedSingle": 1, "strike": 2, "hiddenSingle": 1, "starve": 2})


@pair("C12T")
def c12t():
    """C12's deciding direction alone: Seismic's ladder, reading Tectonic's
    clash, in Tectonic on 4x4."""
    g = Grid(4, 4)
    tect = L.seismic(g, 4, True)
    ladder_in("C12", "4x4", L.seismic_ladder(g, tect), "Seismic 4x4", tect,
              {"nakedSingle": 1, "strike": 2, "hiddenSingle": 1, "starve": 2})


@pair("C8")
def c8():
    # One star, the plain game, and two stars, on boards where two fit.
    for n in (5, 6):
        g = Grid(n, n)
        one = L.starbattle(g, 1)
        ladder_in("C8", f"{n}x{n}", L.starbattle_ladder(g, one), f"one star {n}x{n}", one, {})
    for n in (7, 8):
        g = Grid(n, n)
        two = L.starbattle(g, 2)
        r = satisfiable(two)
        print(f"     two stars {n}x{n} satisfiable: {r}", flush=True)
        if r == z3.sat:
            ladder_in("C8", f"{n}x{n}", L.starbattle_ladder(g, two), f"one star's, k read from two stars {n}x{n}", two, {})


@pair("C9")
def c9():
    """Three stars fit on no board under 12x12 (10x10 and 11x11 are unsat),
    and z3 does not settle 12x12 with the regions as variables in ten
    minutes. So the ladder is checked on two 12x12 boards the game's own
    generator dealt (`starbattle-12x12-3.txt`, seeds "cut a" and "cut b"): a
    claim about those deals, not every deal of the size."""
    with open("starbattle-12x12-3.txt") as f:
        maps = [[int(v) for v in line.split(",")] for line in f if line.strip()]
    g = Grid(12, 12)
    for i, m in enumerate(maps):
        fixed = {(x, y): m[y * 12 + x] for x, y in g.cells}
        three = L.starbattle(g, 3, fixed=fixed)
        print(f"     three stars, dealt board {i + 1}, satisfiable: {satisfiable(three)}", flush=True)
        ladder_in("C9", "", L.starbattle_ladder(g, three), f"one star's, k from three stars, board {i + 1}", three, {})


@pair("C4")
def c4():
    """Ascent's ladder, general in adjacency, `dist` and `near`, in each mode
    and on a board shape with a wall (C4, C5, C7 together)."""
    import ladders2 as L2
    for w, h in ((3, 3), (4, 3)):
        for mode, walls in (("classic", ()), ("orth", ()), ("hex", ()), ("classic", ((w - 1, 0),))):
            gm = L2.ascent(w, h, mode, walls)
            print(f"     {gm.name} satisfiable: {satisfiable(gm)}", flush=True)
            ladder_in("C4", "", L2.ascent_ladder(gm), "Ascent", gm, {"proximity": 2})


@pair("C13")
def c13():
    import ladders2 as L2
    for w, h in ((3, 3), (4, 3)):
        for mode in ("path", "pairs"):
            gm = L2.path_game(w, h, mode)
            print(f"     {gm.name} satisfiable: {satisfiable(gm)}", flush=True)
            ladder_in("C13", "", L2.path_ladder(gm), "Path", gm, {"forced": 2, "joined": 3, "closed": 1, "stuck": 3})


@pair("C14")
def c14():
    import ladders2 as L2
    for w, h in ((3, 3), (4, 3)):
        for mode in ("crosses", "random"):
            gm = L2.flip(w, h, mode)
            ladder_in("C14", "", L2.flip_ladder(gm), "Flip", gm, {"lastChance": 2})


@pair("C22")
def c22():
    import ladders2 as L2
    for w, h in ((3, 3), (4, 3)):
        for wrap in (False, True):
            gm = L2.net(w, h, wrap)
            print(f"     {gm.name} satisfiable: {satisfiable(gm)}", flush=True)
            ladder_in("C22", "", L2.net_ladder(gm), "Net", gm, {"side": 3, "loop": 4, "sealed": 3, "neighbor": 3})


@pair("C18")
def c18():
    """Bridges' most bridges a pair: an answer under a lower bound is an answer
    under a higher one, for every pair of islands."""
    t0 = time.time()
    for lo, hi in ((1, 2), (2, 3), (3, 4)):
        b = z3.Int("bridges")
        s = z3.Solver()
        s.add(b >= 0, b <= lo, z3.Not(b <= hi))
        v = "entails" if s.check() == z3.unsat else "not"
        print(f"C18  most {lo} gives most {hi}: {v}", flush=True)
        results.setdefault("C18", []).append({"check": f"Bridges most {lo} entails most {hi}", "verdict": v,
                                              "seconds": round(time.time() - t0, 1), "binding": None})


if __name__ == "__main__":
    for name in sys.argv[1:] or list(PAIRS):
        PAIRS[name]()
    write_results("results-c.txt", results)
