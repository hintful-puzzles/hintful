# Experiment B: the collection, written in the language

Task 3.4, run 2026-10-29 against the first version of `language.md` (commit
`cf61715c`). The six sample games are in `language.md` § "The six sample
games". The other 54 were written by three agents, each from the game's help
page, its spec's `Rules:` requirements, its `paramConfig` and its hint rungs,
told to bend no rule and to list everything that did not fit. Their full
write-ups are the record, one file per family:

| File | Games |
| --- | --- |
| `collection/latin-and-numbers.md` | Keen, Towers, Unequal, Mathrax, Group, Salad, Seismic, Filling, ABCD, Crossing, Subsets, Magnets, Undead |
| `collection/lines-and-shading.md` | Pearl, Tracks, Path, Signpost, Rome, Bridges, Spokes, Slant, Sticks, Singles, Mosaic, Pattern, Unruly, Clusters, Bricks, Light Up, Tents, Boats, Star Battle |
| `collection/regions-and-moves.md` | Rect, Separate, Galaxies, Dominosa, Map, Net, Netslide, Flip, Untangle, Fifteen, Sixteen, Twiddle, Cube, Pegs, Inertia, Slide, Flood, Same Game, Mines, Black Box, Guess, Numgame |

Two descriptions were read against their games by the session (Keen, and
the Tents matching) and agreed. The rest are the agents' and were not each
checked.

## The tally

All 60 games were written, and every declared variation of each.

| Verdict | Games | Count |
| --- | --- | --- |
| Fits | Solo, Range, Palisade, Sokoban, Mosaic, Clusters, Light Up, Star Battle, Sixteen | 9 |
| Fits with library additions | Loopy, Ascent, Mathrax, Group, Salad, Seismic, ABCD, Crossing, Magnets, Pearl, Tracks, Signpost, Rome, Bridges, Spokes, Slant, Sticks, Unruly, Bricks, Boats, Rect, Separate, Galaxies, Dominosa, Map, Net, Netslide, Twiddle | 28 |
| Needs a core change | Keen, Towers, Unequal, Filling, Subsets, Undead, Path, Singles, Pattern, Tents, Flip, Untangle, Fifteen, Cube, Pegs, Inertia, Slide, Flood, Same Game, Mines, Black Box, Guess, Numgame | 23 |

So 37 of 60 are described by the first version, and 23 are not. In three of
the 23 (Towers, Filling, Undead) every rule states and only a technique needs
the change; in the other twenty a rule does. By kind of freedom: of the 45
constraint games (fill, and Net, Flip and Untangle), 33 fit; of the 15
planning, query and expression games, 4 (Sokoban, Sixteen, Twiddle,
Netslide).

Every library addition was a definition in the core logic, and none was a
renamed rule. They cluster: direction-labeled incidence (`step`,
`edge(c, d)`, `ray`) in seven games, run segments of a line (`segments`,
`runs`) in four, a component of a set (`component`, `region`) in four.

## What did not fit, by the change it needs

Each line is one change to the core, with the games that need it. They are
ordered by how many games each serves.

1. **A bounded quantifier over fillings** (eight games). A premise of the form
   "no way of filling this cage, line, sightline or component from the marks
   is consistent", or "every fit agrees". It is second-order, over the
   assignments of a set the board bounds, and first-order logic unrolls it
   only for a fixed size. Keen's `cage` and `cageLine`, Towers'
   `arrangement`, Undead's `sightline`, Filling's `growth` and `blocked`,
   Dominosa's `set`, Mines' `count`, Pattern's and Tents' fits. Solo's own
   `set` technique in the sample already quantified over sets of cells, so
   the first version used it without saying so. Tents' rule that tents can
   be matched to trees is the same form in a rule: a matching exists.
2. **A one-step look** (eight games). "Place this value, and one clue or one
   neighbor breaks at once": Path, Spokes, Singles, Light Up, Boats, Star
   Battle, Clusters, Sticks. The first version had only `premise suppose`,
   which it marked unmarkable, so it would have filed these Checks as
   Search. The engine's own classes (`docs/solver-and-generator.md` §
   "Check, Tactic, Search") are the distinction the language lacked.
3. **Moves as a precondition and assignments** (six games). Rewrite patterns
   along a direction cannot hold a rolling solid (Cube), a slide that runs
   until it stops (Inertia, Slide), a whole component recolored (Flood),
   gravity (Same Game) or arithmetic (Numgame).
4. **Queries richer than one reveal** (three games). Mines' zero cascade and
   Black Box's entry and exit reveal several places; Guess has a bound on
   queries and a lost state; Mines deals after the first query.
5. **Clues a rule reads, and clues whose absence is a rule** (four games).
   Path's "which numbers may meet" and Singles' "no number twice among the
   clear" compare two clues' values outside either clue's meaning. Pattern's
   clue is a list. In Unequal's Adjacent and in Subsets, no bar or no mark is
   itself a fact.
6. **Fixed points and closure over tuples** (two games, and two techniques).
   Pegs' cut-off test is a least fixed point with two premises; Black Box's
   ray is closure over (cell, direction) pairs. Pattern's and Tents' fits use
   it too.
7. **A fold aggregate** (Keen's product cages).
8. **What the freedom is** (three games). The kind was read from the block's
   keyword, so Fifteen, whose moves are invertible but depend on where the
   gap is, went in with Sokoban. Flip's answer is the position for its rules
   and the press vector for its techniques. Untangle computed as a fill over
   a continuous domain, not a commuting action as `theory.md` had it.
9. **An objective, and domains that are not finite** (Same Game's score;
   Untangle's points, Numgame's integers). These the theory already named as
   limits.

## What the computed words said

The words were computed for every declared variation and compared with the
catalog's filing.

**They agree** for every tier (all of them generator settings), every size,
and these: Solo's X, Bridges' no loops, Unruly's unique, ABCD's no diagonal,
Seismic's Tectonic, Flip's Crosses and Random as rulesets (in one of its two
notations), and the generator settings of Keen, Mathrax, ABCD, Magnets,
Signpost, Sticks, Mosaic and Light Up.

**They disagree as `taxonomy.md` predicted**: Net's and Netslide's wrapping
(board shape), Solo's Jigsaw (board shape), Ascent's three adjacencies
(board shapes) and Edges (modifier), Unequal and Adjacent (separate games),
Salad's Letters (a modifier over Numbers), Group's hidden identity (a
generator setting).

**They disagree where the taxonomy did not look**: Twiddle's rows only
(ruleset, filed as a modifier), Cube's solids (separate games, filed as a
board shape), Guess's no duplicates (ruleset, filed as a modifier: it also
forbids repeats in a guess, a change of the freedom), Guess's blanks (ruleset,
a plain checkbox), and Boats' fleet (ruleset, a plain item).

**The computation itself failed in five ways**, each a defect of the first
version:

- **It depends on how a rule is factored.** Path and Pairs compute as one
  game when "which numbers may join" is written as one predicate with a
  relation for a parameter, and as two when each ruleset gives the number its
  own meaning. The technique overlap (`taxonomy.md` § "The open cases, read
  in step 2") is what says the first factoring is right.
- **Nothing decides whether a number is a size or a parameter.** Bridges'
  most bridges per pair, Boats' fleet and Twiddle's block size each computed
  as either.
- **The theory and the language's table disagreed** on a number inside a
  rule: `theory.md` filed bounding a rule by a parameter as a modifier, and
  `language.md`'s table filed a changed parameter as a ruleset. Star Battle
  computed one way, Bridges the other.
- **The table had no row** for a changed finish, a replaced given, an
  objective, a dealt space dealt differently, or a block that both adds a
  rule and changes the freedom.
- **Flip's word changed with notation**: written in the freedom, the toggle
  pattern makes Crosses and Random rulesets; written as a dealt relation in
  the space, board shapes.

**Families.** The `family` line was declared, not computed, and the
taxonomy's rows did not share answer shapes: the loop and path row has five
different shape predicates, Signpost has none, and the shading row runs from
Range's two shape predicates to none at all. What each row shares is **what
the player produces**: the answer's sort and domain (shaded cells, edges in a
loop, numbers in cells, a division into regions). That is puzz.link's
grouping (`prior-art.md`).

## What experiment B changed

`language.md` and `theory.md` were revised from this list, as the second
version the corpus test is run against (§ "The second version" in each).
The collection is the experiment that was meant to break the first version,
so its findings go into the language; the corpus is held out, and its
findings do not.
