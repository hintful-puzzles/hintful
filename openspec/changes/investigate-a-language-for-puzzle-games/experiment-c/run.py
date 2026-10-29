"""Run experiment C: each technique and its planted variant on small boards."""

import time
from pzl_check import check
import expc_games as g


def report(name, board_name, board, rules, consistent, technique):
    t0 = time.time()
    n, ce = check(board, rules, consistent, technique)
    dt = time.time() - t0
    if ce is None:
        print(f"{name:28} {board_name:10} SOUND    {n:6} bindings  {dt:6.1f}s")
    else:
        env, model = ce
        fns = board.functions
        shown = {k: v for k, v in env.items()}
        vals = {c: model.eval(t, model_completion=True) for c, t in fns["value"].items()}
        print(f"{name:28} {board_name:10} UNSOUND  after {n} bindings  {dt:6.1f}s")
        print(f"    binding {shown}")
        print(f"    answer  {sorted((c, str(v)) for c, v in vals.items())}")
        if "mark" in fns:
            marks = {c: model.eval(t, model_completion=True) for c, t in fns["mark"].items()}
            print(f"    marks   {sorted((c, str(v)) for c, v in marks.items())}")


for rw, rh in ((2, 2), (3, 2)):
    b = g.solo_board(rw, rh)
    name = f"Solo {rw}x{rh}"
    report("hiddenSingle", name, b, g.SOLO_RULES, g.SOLO_CONSISTENT, g.HIDDEN_SINGLE)
    report("hiddenSingle, planted", name, b, g.SOLO_RULES, g.SOLO_CONSISTENT, g.HIDDEN_SINGLE_UNSOUND)

for w in (4, 6):
    b = g.unruly_board(w, w)
    name = f"Unruly {w}x{w}"
    report("threes (pair)", name, b, g.UNRULY_RULES, g.UNRULY_CONSISTENT, g.THREES_PAIR)
    report("threes (gap)", name, b, g.UNRULY_RULES, g.UNRULY_CONSISTENT, g.THREES_GAP)
    report("threes, planted", name, b, g.UNRULY_RULES, g.UNRULY_CONSISTENT, g.THREES_UNSOUND)

for w, h in ((3, 3), (4, 4), (5, 4)):
    b = g.range_board(w, h)
    name = f"Range {w}x{h}"
    report("connect", name, b, g.RANGE_RULES, g.RANGE_CONSISTENT, g.CONNECT)
    report("connect, planted", name, b, g.RANGE_RULES, g.RANGE_CONSISTENT, g.CONNECT_UNSOUND)
    report("connect, no no_adjacent", name, b, [g.RANGE_DOMAIN, g.RANGE_CONNECTED],
           g.RANGE_CONSISTENT, g.CONNECT)
