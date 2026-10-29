# Experiment C: is a technique, stated in the language, sound?

Task 3.5, run 2026-10-29. Three techniques from three games were written in
the language's expression forms and checked against their games' rules by a
solver on small boards; each was paired with a deliberately unsound variant
that the check had to catch. The code is `experiment-c/` (Python and z3
4.16; run `python3 run.py` there, about seven minutes), and nothing in it is
part of the app.

## How the check works

The language's forms (`language.md` § "Expressions") are written as nested
tuples, one per form, and **compiled to z3 by grounding**: on a given board
every quantifier is a finite conjunction or disjunction. A technique is a
binding (which unit, which digit, which cell), a premise over the player's
marks, and a conclusion over the answer. It is **sound on a board** when, for
every binding, this is unsatisfiable:

> the rules hold of the answer, the marks are consistent with the answer, the
> premise holds of the marks, and the conclusion is false of the answer.

A satisfying assignment is a counterexample: an answer, marks and a binding
under which the technique concludes something false. This is the soundness
Butler, Torlak and Popović checked for Nonogram rules (`prior-art.md`),
applied to the language's own forms.

Connectivity is the case the prior art finds hard. The rules **assert**
connectedness, which compiles to a distance labeling from a root; a premise
**asserts** that two squares are separated, which compiles to a set closed
under adjacency that holds one and not the other. Each is exact for its
polarity, and neither appears under a negation in these three games.

## The results

| Game | Technique | Board | Verdict | Bindings | Seconds |
| --- | --- | --- | --- | --- | --- |
| Solo | `hiddenSingle` | 2×2 blocks (4×4) | sound | 192 | 2.9 |
| Solo | planted: the premise skips one more cell | 2×2 blocks | **unsound**, at the first binding | 1 | 0.0 |
| Solo | `hiddenSingle` | 3×2 blocks (6×6) | sound | 648 | 49.1 |
| Solo | planted | 3×2 blocks | **unsound** | 1 | 0.1 |
| Unruly | `threes`, a pair: two of a color, then the other | 4×4 | sound | 64 | 0.4 |
| Unruly | `threes`, a gap: a color either side, the middle the other | 4×4 | sound | 64 | 0.4 |
| Unruly | planted: a color two apart forbids it in the cell after | 4×4 | **sound** | 32 | 0.2 |
| Unruly | `threes`, pair and gap | 6×6 | sound | 192 each | 3.0 each |
| Unruly | planted | 6×6 | **unsound** | 1 | 0.0 |
| Range | `connect`: a square whose shading would part two squares not shaded is clear | 3×3, 4×4, 5×4 | sound | 576, 3,600, 7,220 | 5, 80, 301 |
| Range | planted: the parting read among squares known clear | 3×3, 4×4, 5×4 | **unsound**, at the third binding | 3 | 0.1 |
| Range | `connect`, under Range's rules without "no two shaded squares touch" | 3×3, 4×4, 5×4 | **unsound** | 3 | 0.1 |

The three techniques, as stated:

```pzl
technique hiddenSingle                      # Solo
  for unit u, digit d, cell c in u
  premise forall c2 in u - {c}: d not in cand(c2)
  conclude value(c) = d

technique threes                            # Unruly, the pair
  for run t of three cells along a line, color x
  premise mark(t[0]) = x and mark(t[1]) = x
  conclude value(t[2]) != x

technique connect                           # Range
  for cell c, cells p, q other than c
  premise mark(c) = unknown and mark(p) != shaded and mark(q) != shaded
          and separated(p, q, among cells - {c} where mark != shaded)
  conclude value(c) = clear
```

## What it shows

**A technique stated in the language can be checked against the rules, and
the check finds unsound ones.** All three techniques were sound on every
board tried, and every planted variant was caught, with a board, marks and a
binding that show why (`experiment-c/run.py` prints them). The connectivity
technique, the kind the prior art's explainers handle worst, checked as
readily as the local ones.

**"Sound on small boards" is a claim about the boards tried.** The planted
Unruly variant is sound on 4×4: in a line of four with two of each color,
a color at the first and third cells forces the other at the fourth. It is
unsound from 6×6. So the check is run on more than one size, and a pass is
reported with the sizes. A proof for every size is a different tool (an
inductive argument, or a check over a parametric board), and nothing here
gives one.

**Soundness belongs to a technique and a rule set together, as monotonicity
says.** Range's `connect` has no condition that each side of the cut holds a
clear square, as a Nurikabe-style technique would need; it is sound only
because Range forbids two shaded squares side by side, so no side of the cut
can be shaded whole. Without that rule the same technique is unsound, at the
third binding. That is `theory.md` § "What a variation keeps" in both
directions: adding a rule keeps a technique sound, removing one can break it.
It also says something to the cut: a game with Range's connectivity rule and
not its no-adjacency rule (the corpus's Cave) cannot take Range's `connect`
as it is.

**What it does not show.** The premise audit the gate already runs
(`firing-replay.test.ts`) asks whether a firing follows from the cells its
step names, by the game's own code. This asks whether a technique follows
from the rules, by a statement of both. Neither replaces the other, and
nothing here compares the stated technique with the game's code: that the
TypeScript `ruleConnectedness` computes the same thing as `connect` above is
read, not checked. A check of that would run the stated technique and the
game's rung on the same marks, which is question 3's checker.

**Cost.** The check grounds every binding and asks z3 once per binding. It
grows with the bindings and the board: 5 minutes for Range's three bound
cells on 5×4. A technique with more bound variables, or the bounded
fillings of the second version, needs a smarter encoding (quantifying the
binding inside one query) before boards of a playable size are in reach.
