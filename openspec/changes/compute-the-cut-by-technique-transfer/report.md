# Report: the cut, computed by technique transfer

Task 4.2, written 2026-10-29 for the owner's decision. The test was fixed
before any technique was stated (`test.md`, commit `401f4f4b`); the techniques
were listed before the runs that could call a direction kept
(`techniques.md`, commit `c62b7e20`). The code and every result line are
`research/technique-check/` (`results-a.txt`, `results-c.txt`,
`results-planning.txt`). Nothing in the app, the engine, the specs or the
catalog changed.

**What the owner is asked** (§ "The recommendation"): whether to commit to the
language with the computed cut, and with it which catalog moves to file.

## Sections

| Section | What it holds |
| --- | --- |
| The result | pass or fail, against `test.md` § "What fails it" |
| The pairs | every pair's computed word, and what decided it |
| The misses | the two pairs the cut got wrong, and why |
| What the checker became | tasks 3.1 to 3.4, and what was measured |
| What the result does not show | the limits a reader should weigh |
| The recommendation | commit or not, and the catalog moves |

## The result

**The computed cut puts every pair the old table got wrong on the solver's
side but one, and its two misses were predicted.** Of the 63 pairs decided
outright, 61 got the word expected of them; of the corpus's 15 wrong pairs,
14. The other five are ours, and every check of them so far agrees with
their expected word. The two misses
(§ "The misses") were written into `test.md` § "Predictions" before anything
ran: Icosian and Knight's Tour, and ball sort's added tube. The second is a
correction to the theory, not a defect of the method.

Against the line `test.md` drew, more than 5 misses overall or more than 2 of
group A, it passes. The owner's reading (2026-10-29) is that the line is
context, not the verdict: the decision is qualitative, and it waits for
`build-a-game-from-its-description`. What the result does and does not
support is § "What the result does not show".

Five of group C's pairs were still running on their larger boards when this
was written (§ "Group C" marks each); every check of them that finished is
sound, on every board it reached.

## The pairs

Each pair's word, the way that decided each direction (V vocabulary, E
entailment, S stated techniques checked by the solver, P exhaustive search
of a planning game), and the expected word. "Kept" is X's techniques sound
in Y.

### Group A: the corpus's fifteen wrong pairs

| # | Pair | First keeps second's? | Second keeps first's? | Computed | Expected |
| --- | --- | --- | --- | --- | --- |
| A1 | Nurikabe, Mochikoro | no, S (`rectangle`) | no, S (`unreachable`) | two | two |
| A2 | LITS, Norinori | no, S (`pair`) | no, S (`four`) | two | two |
| A3 | Hinge, Heyawake | no, S (`adjacent`) | no, S (`alone`) | two | two |
| A4 | Yin-Yang, Unruly | no, S (`threes`) | no, S (`no2x2`) | two | two |
| A5 | Cave, Range | no, S (`connect`, `adjacency`) | no, S (`enclosed`) | two | two |
| A6 | Aquarium, Thermometers | no, V | no, V | two | two |
| A7 | Stostone, Shimaguni | no, S (`differ`) | no, S (`column`) | two | two |
| A8 | Pipe Link, Reflect Link | no, V (triangles) | no, S (`corner`) | two | two |
| A9 | Hiroimono, Neko | yes, P (Neko's `isolated`, `stuck`) | no, V (no last direction) | one: Hiroimono a modifier of Neko | one |
| A10 | Sukoro, View | no, S (`seen`) | no, S (`full`) | two | two |
| A11 | Symmetry Area, Filling | yes, E (as numbers) | no, S (`straightThree`) | one: a modifier of Filling | one |
| A12 | Hakoiri, Star Battle | no, V | no, V | two | two |
| A13 | Toichika, Hakoiri | no, V | no, V | two | two |
| A14 | N-Queens, Star Battle | no, V (regions) | no, S (`diagonal`) | two | two |
| A15 | Icosian, Knight's Tour | no, V | no, V | **two** | one |

Every technique S names was first checked sound in its own game on the same
boards, and every counterexample passed the other game's verifier (§ "What
the checker became"). A9 was searched on 3x3, 4x3 and 4x4 (up to 1.4 million
positions); A11 by enumerating every answer of 2x3 and 2x4, where the walls
writing and the numbers writing have the same 9 and 24 answers.

### Group B: the corpus's twenty-four right pairs

All twenty-four are two games, by vocabulary in both directions
(`techniques.md` § "Group B" names what each turns on). All match.

### Group C: the catalog's variations

| # | Pair | Decided by | Computed | Word | Expected |
| --- | --- | --- | --- | --- | --- |
| C1 | Solo, X | E | one | modifier | one |
| C2 | Solo, Jigsaw | S, both ways | one, on 4x4 (running: 6x6) | board shape | one |
| C3 | Solo, Killer | E; V back | one | modifier | one |
| C4 | Ascent Classic, Orthogonal | S, both ways | one | board shape | one |
| C5 | Ascent Classic, Hex | S, both ways | one | board shape | one |
| C6 | Ascent Classic, Edges | E; V back | one | modifier | one |
| C7 | Ascent, a board shape with a wall | S, both ways | one | board shape | one |
| C8 | Star Battle, one star and two | S, both ways | running: the ladder is sound for one star on 5x5 and 6x6; two stars from 7x7 | | one |
| C9 | Star Battle, one star and three | S, both ways | running: three stars fit on no board under 12x12; on a dealt 12x12, every rung checked so far is sound | | one |
| C10 | Salad Numbers, Letters | E; V back | one | modifier | one |
| C11 | Unequal, Adjacent | V both ways | two | | two |
| C12 | Seismic, Tectonic | S, both ways | running: three of four rungs sound in Seismic on 4x4; Tectonic not yet reached | | one |
| C13 | Path, Pairs | S, both ways | one | ruleset | one |
| C14 | Flip Crosses, Random | S, both ways | one | ruleset | one |
| C15 | Twiddle, rows only | argued, both ways | one | ruleset | one |
| C16 | Twiddle, orientation | P; V back | one | modifier | one |
| C17 | Bridges, no loops | E; V back | one | modifier | one |
| C18 | Bridges, most bridges | E (z3, on the bound); V back | one | modifier | one |
| C19 | Unruly, unique | E; V back | one | modifier | one |
| C20 | Group, identity hidden | E both ways | one | generator setting | one |
| C21 | Guess, no duplicates | E; V back | one | modifier | one |
| C22 | Net, wrapping | S, both ways | one, on 3x3 (running: wrapping 4x3, bordered 4x3 sound) | board shape | one |
| C23 | Netslide, wrapping | P, both ways | one | board shape | one |
| C24 | Net, Netslide | V both ways | two | | two |
| C25 | Keen, multiplication only | E both ways | one | generator setting | one |
| C26 | Mathrax, its clue switches | E both ways | one | generator setting | one |
| C27 | ABCD, no diagonal | E; V back | one | modifier | one |

"V back" is the variation's added rule or clue: its completion cannot be
stated in the plain game, which is what makes the word a modifier and not a
ruleset. The entailment of C1, C3, C6, C10, C17, C19, C20, C21 and C25 to C27
was read off the archived descriptions, where each variation adds lines to
the plain game's or changes only its deal. A conjunction entails its parts,
so no solver query was run for them; that is a departure from `test.md`,
which said one query a board, and is stronger than it, not weaker.

### Group D: the planning rows

| # | Pair | Plain keeps the variation's? | Variation keeps plain's? | Computed | Expected |
| --- | --- | --- | --- | --- | --- |
| D1 | ball sort, the added tube | no, V (`addTube`) | **no**, P (`noPour` unsound) | **two** | one |
| D2 | Knight's Tour, the closed tour | no, P (`noReturn` unsound) | yes, E (the same moves, a stronger finish) | one: a modifier | one |

## The misses

Two, both predicted in `test.md` § "Predictions" before anything ran.

**A15, Icosian and Knight's Tour: computed two, expected one.** Icosian's
techniques read marks on edges; Knight's Tour's, written as the corpus wrote
it (moves) or as the rewrite `test.md` allowed (a fill of the order), read
the knight's square or numbers on squares. Neither can state the other's, so
the cut says two by vocabulary alone. The prediction said two for a different
reason (a cycle's technique is unsound on an open path), which `techniques.md`
records and which was not needed. Is the expected word right? The corpus's
"one Hamiltonian problem on two graphs" holds of the closed tour against
Icosian, both cycles; the plain tour is an open path. Even the closed tour
would compute two here, since the two descriptions write a tour with
different answer sorts and no allowed rewrite joins them. So this miss is
the factoring dependence the corpus found, surviving the computed cut where
the answer sort itself differs. It is reported as a miss.

**D1, ball sort's added tube: computed two, expected one.** The expected word
was the investigation's guess for an added move: "every plan stays legal when
a move is added, the planning counterpart of monotonicity, so it should be a
modifier". The search found the guess half right. Every plan stays legal, and
the `pourRun` macro stays sound, but a prune does not: "no legal pour and not
sorted: lost" is unsound once a tube can still be added (3 colors, 2 high,
one empty tube, found at once). So by the principle, a ruleset keeps its
game's techniques, the tube makes another game. **The planning rows of the
variation table come out of this as computed rows**: an added move keeps
macros and can unsound prunes; an added finish (D2) and a guard that only
removes moves (A9) keep prunes and can break macros. Whether players would
call the added tube "the same game" is a different question from whether its
techniques carry over, and `add-ball-sort` decides what the catalog shows.

## What the checker became

**3.1. Its home.** `research/technique-check/`, run by hand; `research/` is one
of the gate's documentation-only paths, which `src/gate-scope.test.ts` proves
no test or build reads. `README.md` there says how to run each part.

**3.2. Fillings and fixed points.** The compiler (`pzl.py`) compiles every
form for a polarity. Asserted, a least fixed point carries a derivation rank;
denied, a closed set witnesses it unreached; `connected` is the same pair. A
bounded filling asserted is fresh variables; denied, its assignments are
enumerated (`ExistsFill.cap` gives up past 20,000). `validate.py` reruns all
of experiment C on the new compiler, and catches a planted defect in each new
form: a reach asserted and denied together, a cage filling striking the wrong
digit, a denied filling read with the wrong sum. Every result is as expected.

**The verifier.** Every counterexample is read back and judged by a plain
Python reading of the other game's rules, written apart from its z3 encoding;
an encoding may then be a consequence of the rules (more answers), and a
rejected counterexample is blocked and the search goes on. It caught one
real encoding defect: Stostone's fall let a block land below the board, so
the encoding admitted columns with too many shaded cells, and Stostone's own
`column` technique looked unsound; with the landing bounded it is sound.
Hinge's counterexample search is narrowed to dominoes across a region
border, each a valid Hinge block; a narrowed search that found nothing would
have reported "undecided", never "sound".

**3.3. One query a technique, and the boards in reach.** A technique's bound
variables are one-hot choices inside the query, and the leading ones may be
enumerated (`split`) with the rules compiled once into an incremental solver.

| Check | Experiment C | Now |
| --- | --- | --- |
| Solo 6x6 `hiddenSingle` | 49 s | 0.4 s |
| Range 5x4 `connect` | 301 s | 4.5 s |

**The boards now in reach**, on a machine whose load ran between 55 and 140
through the runs, so each time is an upper bound:

- **Local techniques** reach 6x6 in seconds: Solo's hidden single, Unruly's
  `threes`, Yin-Yang's `no2x2`.
- **Connectivity in a rule** reaches 5x4 in seconds and 6x6 slowly: Nurikabe's
  `unreachable` took 35 s on 5x4, and Range's `connect` on 6x6 ran for hours
  without settling.
- **Regions as variables** (every deal at once) reach 5x4 and 6x6: Star
  Battle's confinement rungs take 4 to 11 minutes on 6x6.
- **A dealt board** of 12x12 takes minutes a rung.
- **Wide bindings** are the cost: Solo's `wing` and `forcingChain`, five bound
  cells and three digits, take 15 to 20 minutes on 4x4.

So a soundness check over every deal of a playable size is in reach for
local and region rules, and not yet for connectivity.

**3.4. The planning rows.** `planning.py` searches every position reachable
from every deal of a small board and checks each prune and macro there, with
solvability as a least fixed point backward from the finished positions,
which is exact whether or not moves can be undone.

## What the result does not show

- **Vocabulary decides most "two games".** Of the 40 pairs computed two, 30
  are decided by vocabulary in both directions (all of group B, A6, A12, A13,
  A15, C11, C24): one game has a clue, an answer sort or a relation the other
  lacks. That is the old table's structural test, which was already right on
  them. The solver decided the pairs the old table got wrong, but for A6,
  A12, A13 and A15.
- **The writing still matters.** A15 turns on how a tour is written, and
  Seismic and Tectonic, Path and Pairs come out one game because their
  descriptions, like their code, state one rule over a defined relation
  (`clash`, `fits`). The computed cut removes the table's guess about which
  techniques survive; it does not remove the choice of what a description
  names.
- **"Kept" is as strong as the list of techniques.** For our games the list
  is every rung (`rungs.md`), read by agents from the code and condensed by
  the session. For an outside game it is the techniques this change stated
  (Neko's two prunes), and kept means those.
- **Small boards.** A pass is a claim about the sizes tried (experiment C
  showed a technique sound on 4x4 and unsound on 6x6). Regions were variables
  wherever they appear, so a check covers every deal of its size.
- **Two directions rest on argument, not a run**: Twiddle's rows only both ways
  (a cell holding its tile holds a tile of its row; with distinct values a
  same-valued tile is the tile), and Path's `weighed`, whose every exclusion is
  one of the looks checked.
- **The techniques are stated, not compared with the code.** That a stated
  technique computes what the TypeScript rung does was read, not checked.
- **D2's closed tour** exists on neither 3x4 nor 3x5, so the search's checks
  of it are vacuous; the direction rests on entailment.

## The recommendation

**Not yet a decision; the owner takes it after
`build-a-game-from-its-description`** (2026-10-29). What this change adds to
it, in the order of the value it suggests:

1. **The cut is the least of it.** It decides words in the catalog (ruleset,
   modifier, board shape) and the Type menu's sections; the one substantive
   move it points to, Unequal and Adjacent as two games, costs saves and
   links. A taxonomy alone would not justify a language.
2. **A soundness check of techniques is worth more than expected.** It is now
   fast enough to run across every deal of a small board, and it checks the
   claim the hints make to a player: that a step is forced. None of our rungs
   failed under any of our variations, which is reassurance; but the
   instrument caught every planted defect and one real encoding defect, so
   its passes mean something.
3. **Its weak link is the one building would close.** Each technique here was
   stated by reading the code; nothing checks that the TypeScript rung
   computes what the statement says. A differential check, the stated
   technique and the code's rung run on the same marks, would. It is the one
   experiment that shows whether a description and the code can be held
   together, and `build-a-game-from-its-description` should run it beside
   its answer-check pilot.
4. **The cost seen here argues for one source.** Every game here had its rules
   written twice, for z3 and for the Python verifier, and the one defect
   found came from that duplication. A version worth adopting compiles one
   description to its consumers; hand translation is what the doctrine calls
   a second copy.
5. **Where it fits.** Constraint games state cleanly, rules and techniques
   both, and our code is often already factored the way the language wants
   (`clash`, `fits`, a star count read by one ladder). Planning games gain
   little: their techniques are search and macros, and the one lesson here
   was that an added move can unsound a prune.
6. **For new games** (the project's direction is dozens of them), the value is
   a rules-first route: the description gives an answer check, a small-board
   uniqueness test and a soundness check of the planned techniques before
   any hint code exists.

The language would not run the app's ladders: a solver is far too slow for
that, and a built ladder means generated or interpreted TypeScript.

**Where the checker lives.** It is Python, inherited from experiment C, since
z3's Python binding is its fullest; it is a second language the typecheck and
biome never see, and it cannot import the games, which the differential check
needs.

**The owner's decision on the checker (2026-10-29).** Keep the Python and z3
checker as a research tool, unextended past this change. If building from
descriptions goes ahead, port it to TypeScript with z3's official
`z3-solver` package as part of `build-a-game-from-its-description`, so that
it imports the games; its validate and planted cases are the port's
acceptance test, and the WebAssembly build's speed on the heaviest checks
(Solo's `wing`, Range's `connect` on 6x6) is measured first. A proof
assistant (Lean or Rocq) proves a claim for every board size, which z3's
bounded checks cannot, but finds no counterexamples and has no link to the
code: it is for a few cornerstone theorems, if a claim ever needs one, as
its own change.

**Catalog moves, if the owner commits.** The computed words, against the
catalog's filing today; none is proposed until then, and each would be its
own change:

| Variation | Filed today | Computed | Cost |
| --- | --- | --- | --- |
| Solo Jigsaw; Net's and Netslide's wrapping | modifier | board shape | words and the Type menu only |
| Ascent's Orthogonal, Hex, Classic | rulesets | board shapes | the same |
| Ascent's Edges; Salad's Letters | rulesets | modifiers | the same |
| Twiddle's rows only | modifier | ruleset (each keeps the other's) | the same |
| Group's identity hidden | modifier | generator setting | the same |
| Unequal and Adjacent | one game | two games | a split: saves, links and favorites divided by their params, with a route alias |
| Killer, X, Bridges', Unruly's, Guess's and ABCD's options; Star Battle's star count; Seismic and Tectonic; Path and Pairs; Flip's patterns; Twiddle's orientation | as filed | as filed | nothing |

`taxonomy.md` proposed Star Battle's star count as a modifier and Twiddle's
orientation as a ruleset. Computed, orientation keeps plain Twiddle's
techniques and not the other way, a modifier as filed; and Star Battle's
ladder is one, general in the star count, so on the boards checked so far
each count keeps the others' techniques, a ruleset as filed. On both, the
computation sides with the catalog.
