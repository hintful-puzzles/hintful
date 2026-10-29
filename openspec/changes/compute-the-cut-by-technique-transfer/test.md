# The test, fixed before any technique is stated

Tasks 1.1 and 1.2, written and committed 2026-10-29. The commit that adds this
file states no technique and runs nothing. What the computed cut is, which
pairs it is run on, the word each should get and where that word comes from,
and the result that fails it.

## Sections

| Section | What it holds |
| --- | --- |
| The computed cut | how a pair gets its word, fixed before any run |
| The inputs | which descriptions are compared, and the three rewrites allowed |
| The pairs | 68 pairs in four groups, each with its expected word and source |
| What fails it | the number of misses that fails the computed cut |
| Predictions | where this session expects a miss, and why, written before the run |

## The computed cut

Two descriptions X and Y are compared in each direction. **Y keeps X's
techniques** when every technique of X can be stated over Y's vocabulary and
is sound under Y's rules. Then:

| X keeps Y's, and Y keeps X's | Word |
| --- | --- |
| both directions | one game (a ruleset, or a board shape when only the space differs) |
| one direction only: Y keeps X's | one game, Y a modifier of X |
| neither | two games |

The pairs are scored on **one game or two**. The finer word is reported but
not scored, since the corpus's expected words are one or two.

**A direction is decided in one of three ways**, the cheapest that applies,
and the report says which decided each pair:

1. **Vocabulary.** X's technique reads something Y does not have: a clue kind,
   a mark kind, an answer sort, a relation of the space, or a relation the
   description defines (`define`, `parameter`). Then that technique is not
   kept. A clue kind always has at least one technique that reads it, its
   **completion**: when the marks fix the clue's meaning on all but one
   element, the last is forced. Completion is sound by construction, since it
   is the clue's meaning applied, so a game with a clue kind Y lacks loses a
   technique in Y. A relation is matched by its name in the description, and
   by its type.
2. **Entailment.** On a board, every answer satisfying Y's rules satisfies X's
   rules, with clue values free on both sides. Then every technique of X is
   sound under Y, by monotonicity, and none needs stating. This is one solver
   query a board. It applies only where X and Y share a space and an answer
   sort; a board shape is never decided this way.
3. **Stated techniques.** Each technique of X, stated in the language, is
   checked sound under Y's rules. Any technique unsound on any board means
   not kept. Kept needs **every technique of X**: for a game of ours, every
   rung its hint and solver fire; for an outside game, every technique its
   write-up or source names, plus the ones this change states, listed before
   the run. That list being the game's whole method is an assumption for an
   outside game, and the report says so for each pair it decides "kept".

**Soundness** is experiment C's: for every binding, no answer satisfying the
rules, with marks consistent with it, makes the premise true and the
conclusion false. Answers are not required to be unique: no technique in the
collection assumes a board has one answer. Clues are free variables, each
place holding a clue or none. A counterexample is reported with its board,
and one that is degenerate (no clue, an empty set of clear cells) is flagged
but still counts.

**Board sizes.** Entailment and each stated technique are run on at least two
board sizes. A direction decided by vocabulary needs no board, and the report
says so.

**A planning freedom** has two kinds of technique. A **prune** says no plan
reaches the finish from a position satisfying its premise; it is sound when
that is so on every position of the boards tried. A **macro** is a sequence of
moves and a stated effect; it is sound when every move is legal and the
effect holds wherever its premise does. Planning is checked by exhaustive
search of the positions of small boards, not by a solver: on a finite board
that is exact, and simpler. The rows the corpus found missing are then
computed, not filed: an added move keeps every macro and may unsound a prune;
an added finish or a guard that only removes moves keeps every prune and may
break a macro.

## The inputs

Each game is compared as the archived investigation described it:
`collection/` for ours and `language.md` § "The six sample games",
`corpus/` for outside puzzles. Where a pair's game was named but not
described (Shimaguni), this change writes it, from pzprjs's rules, before
stating any technique.

**Three rewrites are allowed, and no others.** The corpus found three pairs
whose word turned on how the answer was written. Each may be written the
other way, and the rewrite counts only when the checker finds the two
writings have the same answers, translated by a stated definition, on the
boards tried:

| Puzzle | As the corpus wrote it | Rewrite allowed |
| --- | --- | --- |
| Symmetry Area | walls | a number in every cell, as Filling writes it |
| Hiroimono | a fill of the order | moves, as Neko writes it |
| Knight's Tour | moves | a fill of the order, as Ascent writes it |

A pair is computed on the writings registered here; where a rewrite is
allowed, it is computed on both writings and the report gives both, scoring
the rewrite. That is the one place this test chooses a writing, and it
chooses it now.

## The pairs

### Group A: the corpus's 15 wrong pairs

The expected word is the corpus agents' "a solver of both" judgment
(`corpus.md` § "The result", `corpus/` § "The cut"). The variation table got
every one wrong.

| # | Pair | Expected |
| --- | --- | --- |
| A1 | Nurikabe, Mochikoro | two |
| A2 | LITS, Norinori | two |
| A3 | Hinge, Heyawake | two |
| A4 | Yin-Yang, Unruly | two |
| A5 | Cave, Range | two |
| A6 | Aquarium, Thermometers | two |
| A7 | Stostone, Shimaguni | two |
| A8 | Pipe Link, Reflect Link | two |
| A9 | Hiroimono, Neko | one (Hiroimono Neko with one rule more) |
| A10 | Sukoro, View | two |
| A11 | Symmetry Area, Filling | one (Filling with symmetric regions) |
| A12 | Hakoiri, Star Battle | two |
| A13 | Toichika, Hakoiri | two |
| A14 | N-Queens, Star Battle | two |
| A15 | Icosian, Knight's Tour | one (a Hamiltonian problem on two graphs) |

### Group B: the corpus's 24 right pairs in families A and B

The expected word is the same judgment, and the table got each right
(`corpus/shading-and-loops.md` § "Summary table"). All are two games.

| # | Pair | # | Pair |
| --- | --- | --- | --- |
| B1 | Heyawake, Usoone | B13 | Yajilin, Tracks |
| B2 | Heyawake, Singles | B14 | Castle Wall, Yajilin |
| B3 | Norinori, Dominosa | B15 | Country Road, Double Back |
| B4 | Yin-Yang, Nurikabe | B16 | Onsen, Country Road |
| B5 | Nurimisaki, Cave | B17 | Icebarn, Nagare |
| B6 | Tapa, Mosaic | B18 | Geradeweg, Balance Loop |
| B7 | Tapa, Nurikabe | B19 | Geradeweg, Pearl |
| B8 | Kakurasu, Pattern | B20 | Balance Loop, Pearl |
| B9 | Usoone, Yajikazu | B21 | Slalom, Nagare |
| B10 | Yajikazu, Yajilin | B22 | Myopia, Loopy |
| B11 | Creek, Squaro | B23 | Kouchoku, Untangle |
| B12 | Stostone, Dosun-Fuwari | B24 | Kouchoku, One-stroke |

### Group C: the catalog's declared variations, and `taxonomy.md`'s measured pairs

Every `rulesetItem` and `modifierItem` (`git grep -l -E
"rulesetItem|modifierItem" -- src/games`, 16 games, run 2026-10-29), and every
row of `taxonomy.md` § "What the techniques share". The expected word is the
measured rung overlap where there is one; where there is none, the catalog's
filing, marked "catalog". `taxonomy.md`'s reading of the overlap stands where
it read one (Edges, Letters, Killer).

| # | Pair | Overlap | Expected |
| --- | --- | --- | --- |
| C1 | Solo, Solo X | 11/11 | one |
| C2 | Solo, Solo Jigsaw | 11/11 | one |
| C3 | Solo, Killer | 7/11 | one (the owner's decision 5) |
| C4 | Ascent Classic, Orthogonal | 6–7/7 | one |
| C5 | Ascent Classic, Hex | 6–7/7 | one |
| C6 | Ascent Classic, Edges | 4/8–4/9 | one (an added clue kind, `taxonomy.md` § "The open cases") |
| C7 | Ascent rectangle, its other board shapes | 8/8 | one |
| C8 | Star Battle one star, two stars | 7/8 | one |
| C9 | Star Battle one star, three stars | 2 boards | one (catalog) |
| C10 | Salad Numbers, Letters | 11/14 | one (an added clue kind) |
| C11 | Unequal, Adjacent | 6/11 | two |
| C12 | Seismic, Tectonic | 7/7 | one |
| C13 | Path, Pairs | 3/3, and every reason | one |
| C14 | Flip Crosses, Random | 3/3 | one |
| C15 | Twiddle, rows only | 4/4 | one |
| C16 | Twiddle, orientation | 4/4 | one |
| C17 | Bridges, no loops | 5/7 | one |
| C18 | Bridges most two, most one, three or four | none | one (catalog) |
| C19 | Unruly, unique | 3/4 | one |
| C20 | Group, identity hidden | 6/9 | one |
| C21 | Guess, no duplicates | 5/9 | one |
| C22 | Net, wrapping | 3/3 | one |
| C23 | Netslide, wrapping | 3/3 | one |
| C24 | Net, Netslide | 0 | two |
| C25 | Keen, multiplication only | 7/8 | one |
| C26 | Mathrax, its clue switches | 7/7 | one |
| C27 | ABCD, no diagonal | 2 boards | one (catalog) |

### Group D: the planning rows

The rows the corpus found missing, each on one pair. The expected word is the
one the investigation wrote for it.

| # | Pair | Row | Expected |
| --- | --- | --- | --- |
| D1 | Ball sort, with the owner's added tube | an added move | one (`corpus.md` § "Added after the test": "it should be a modifier") |
| D2 | Knight's Tour, closed tour | an added finish | one (`corpus/graphs-words-planning.md`: the theory calls an added goal a modifier) |

Hiroimono and Neko (A9) is the third row, a guard that only removes moves.

## What fails it

The computed cut **fails** if either holds:

- **more than 5 of the 68 pairs** get the other word than the expected one;
- **more than 2 of group A's 15** do.

A pair the run cannot decide counts as a miss: a construct the checker does
not compile, a check that runs more than 30 minutes on the smaller board, or
a game whose techniques cannot be listed. A pass is reported with how many
pairs each of the three ways decided, since a cut decided mostly by
vocabulary is mostly the old table's structural test.

## Predictions

Written now, so that a miss can be told from a surprise. They change no
expected word and no count.

- **D1, ball sort's added tube: expected one, predicted two.** A prune of
  plain ball sort ("no legal pour and not sorted: lost") is unsound once a
  tube may be added, so ball sort with the tube does not keep ball sort's
  techniques, and plain ball sort cannot state the tube's. The planning
  counterpart of monotonicity holds for plans, not for prunes.
- **A15, Icosian and Knight's Tour: expected one, predicted two.** Icosian is
  a cycle and Knight's Tour, as the corpus wrote it, an open path. A cycle's
  technique (a vertex with two edges left takes both) is unsound for an open
  path, whose ends have one. The corpus's "one Hamiltonian problem" is true of
  the closed tour against Icosian, which D2 tests.
- **A9, Hiroimono and Neko: expected one, uncertain.** Hiroimono's start is
  free and Neko's is given. A Neko prune that reads the cat's square has no
  premise before Hiroimono's first move.
- **C12, Seismic and Tectonic, and C13, Path and Pairs: expected one,
  predicted one**, because the archived descriptions write each as one rule
  general in a defined relation (`clash`, `meets`) and the code's rungs are
  general in it. If they come out one, the reason is the writing that the
  code shares, and the report says so.
