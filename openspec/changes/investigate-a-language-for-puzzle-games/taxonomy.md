# A taxonomy of the catalog

Step 0 of `design.md` § "The order of work", written 2026-10-28 for the
owner's decision. It changes nothing in the catalog. Every claim about the code
is as of that date, and the queries that produced them are given where they
can be run again.

**What the owner is asked.** Two questions decide every pair this document
looks at (§ "The two questions"). The rest is the evidence for them, and what
each answer would move.

## The two questions

1. **Does a change of freedom make a separate game?** Net and Netslide have
   one goal, one board and one clue vocabulary; the player turns tiles in one
   and slides rows in the other. So do Fifteen, Sixteen and Twiddle, which
   share the goal "put the numbered tiles in order" and differ only in the
   move.
2. **Does a replaced clue vocabulary make a separate game?** Salad's Letters
   and Numbers, Unequal and Adjacent, Path and Pairs, and Solo's Killer each
   replace what the givens are. Filed today as rulesets or
   a modifier; elsewhere in the catalog the same kind of difference separates
   games (Loopy and Pearl, Keen and Towers, Range and Singles).

The recommendation, its reasons and the alternatives are in § "Candidate cuts".

## What the prior art cuts by

Read for task 0.1 from primary text (papers, documentation, source), except
where marked. Step 1 reads each work whole; this is only how each divides a
puzzle and whether it defines a variant.

| Work | Parts | Variant, ruleset or family |
| --- | --- | --- |
| PuzzleScript | Objects, legend, collision layers, rewrite rules, win conditions (`No X`, `All X on Y`, …), levels. Movement is the engine's, not a rule | None: a file is a game, levels are instances |
| Ludii | Equipment (containers, components) and rules (start, play, end). A deduction puzzle is a CSP whose constraints sit in `play` (`satisfy`), ending `(is Solved)` | Options (tagged substitution points) and rulesets (named bundles of options) exist, but its own puzzles do not use them: Sudoku X, Killer and Jigsaw-like Sudokus are separate files, "variant of Sudoku" only in prose. Puzzles are classed **deduction** or **planning**; Lights Out, the 15-puzzle and peg solitaire are planning |
| Maeda and Inoue | Elements, relations, composed structures, domains, constraints, "hidden" values (the givens), uniqueness | None. Final board only, no move model |
| Demystify | Essence's `given` (instance), `find` (variables, marked as the player's, constraint switches, or hidden), `such that` | None: Jigsaw, X and Miracle Sudoku are separate models |
| grilops (README only) | Symbol set, lattice (square, hex, holes), constraints, with helpers for paths, regions, shapes, sightlines | None |
| ASP encodings | Input facts (the instance) apart from the program: domain, generate, test, show | None; recurring sub-encodings (connectedness, segments) noted as templates |
| pzprjs | A variety file per implementation family, each puzzle id overriding a list of named checks | **Two levels.** A genre is its own id, grouped by shared code, not by rules. A **variant flag** is a default-off checkbox that toggles one check and travels in the puzzle's URL (`slither_full`, `fillomino_tri`): our modifier, and the only implemented precedent found |
| Pelánek | A model of human Sudoku solving; difficulty from step complexity and step dependency | None |
| Hearn and Demaine (thesis § 5.1, found for this step) | Bounded puzzles, where each move uses up a resource (Sudoku fills up), are NP-complete; unbounded ones (sliding blocks, Sokoban) PSPACE-complete | A move-model cut, by complexity |

Not read in full: Browne's Ludi (2012; the host refused, abstract only),
Browne's "Deductive search for logic puzzles" (CIG 2013, abstract only), and
Lantz and others' "Depth in Strategic Games" (2017, secondary sources only).

**What it says for the taxonomy.**

- **No work cuts by technique, and one list cuts by goal.** Where variants
  are separated at all, it is by shared implementation (pzprjs) or by whatever
  an author could write as a substitution (Ludii); an added constraint made a
  new file in both Ludii and Demystify. (Corrected in step 1: puzz.link's
  genre list groups genres by what the player produces, shading, loop,
  connecting, dividing into areas, numbers, which is close to a cut by
  answer shape; `prior-art.md`.)
- **The modifier has a precedent**, in pzprjs's variant flag, and it is the
  same definition as ours: one rule toggled, off by default, in the link.
- **The cut between moves that commute and moves that do not is the prior
  art's one consistent divide**: Ludii's deduction and planning, Hearn and
  Demaine's bounded and unbounded. Ludii files Lights Out as planning, which
  this document argues is wrong in the way that matters to a hint (§ "The
  freedom divides in two"): its presses commute.
- **No work has freedom as a part separate from the goal.** The constraint
  side assumes filling blanks and has no move model; PuzzleScript has moves
  and no deduction. Stating freedom apart is this taxonomy's own.

## The decomposition

From `design.md` § "The first goal: a taxonomy", corrected where the
re-classification (below) broke it. A puzzle's description falls into seven
parts:

| Part | What it is | Examples |
| --- | --- | --- |
| **Space** | The cells and edges, which are neighbors, the regions, the topology, the outline | Loopy's tiling, Net's wrapping, Solo's blocks (Jigsaw's too), Ascent's diagonal adjacency |
| **Domain** | What a cell (or edge) of the answer holds | a digit 1..n; a digit or blank (Salad); shaded or not; a tile's orientation (Net, and Twiddle's orientable) |
| **Answer shape** | The global structure every finished answer has, before any clue | a Latin square; one closed loop; a partition into regions; a spanning tree (Net) |
| **Clue vocabulary** | The kinds of given, and what each one means | Loopy's face counts, Pearl's circles, Keen's cages, Towers' skyscrapers |
| **Goal predicates** | Further rules the answer satisfies, each with its parameters | no two stars touch; stars per unit = 2; no loops of bridges; rows unique |
| **Freedom** | How the dealt position relates to the positions the player can reach | fill blanks; turn each tile independently; slide a row; press a square (flip it and its neighbors) |
| **Size** | Numbers that scale an instance without changing the puzzle | width, height, digits, region size, mines, colors |
| **Distribution** | What the generator deals among the boards the rules allow | symmetry of the givens, remove clues, which clue kinds are dealt (Mathrax, Keen's multiplication only) |

Two corrections to the working hypothesis:

- **Answer shape is split from goal.** In a deduction puzzle the clues are
  parameters of local predicates, so "the goal" either includes the clues
  (and Loopy and Pearl have different goals) or excludes them (and Keen,
  Towers, Unequal and Mathrax have the same goal). Neither reading says what a
  player means by "the same puzzle". The answer shape is the part they share:
  a family is cut there.
- **Size is a part of its own**, and so is distribution, though the
  hypothesis had distribution already. A number that scales the board (Salad's
  symbols, Palisade's region size, Dominosa's top number) changes no rule.

### The freedom divides in two

Whether the player's moves **commute** decides how a game is solved. Where
any order of the same moves reaches the same position, only the final
position matters: the puzzle is a choice of an answer, a constraint problem,
and its hint deduces. Where order matters, the puzzle is a path through
positions, and its hint plans.

| Moves commute: a constraint problem | Order matters: a planning problem |
| --- | --- |
| Filling blanks (most of the catalog) | Fifteen, Sixteen, Netslide, Twiddle (a permutation group) |
| Net: each tile's turns are its own | Cube, Pegs, Sokoban, Inertia, Slide (a state machine) |
| Flip: presses add up over GF(2), so the answer is the set pressed | Flood, Same Game (irreversible, often with a move bound) |
| Untangle: each point's final place is all that matters | |

Hidden-information games (Mines, Black Box, Guess) are a third kind: the
answer is fixed and hidden, and a move is a query that reveals a clue.

Net and Flip are the instructive cases: they look like moving games, and are
constraint problems, which is why each has a deducing hint. Netslide is Net's
answer reached by Sixteen's freedom, and its hint is Sixteen's planner
(`src/games/netslide/hint.ts`).

## The catalog's words, defined over the parts

- **Board shape**: changes only the space. This includes adjacency and
  topology, not only the outline.
- **Modifier**: adds, removes or bounds one goal predicate, and combines
  freely with the game's other modifiers (the deal test stays).
- **Ruleset**: changes the domain, replaces a goal predicate, or changes the
  freedom within its kind (a different move set of the same kind). Under the
  answer to question 2, possibly also a replaced clue vocabulary.
- **Generator setting**: changes only the distribution. No catalog word.
- **Size**: a number of the instance. No catalog word.
- **Game**: one answer shape, one clue vocabulary (question 2), one kind of
  freedom (question 1).
- **Family**: one answer shape.

**A number inside a predicate** (Star Battle's stars per unit, Bridges' most
bridges per pair) is a size-like parameter of a goal predicate, so a
modifier. The current filing splits them (§ "Disagreements").

## Candidate cuts

Each is tested against the three pairs the design names, then against the
catalog.

| Candidate | Net / Netslide | Fifteen / Sixteen / Twiddle | Seismic / Tectonic |
| --- | --- | --- | --- |
| **A. Goal**: same answer shape, clue vocabulary and predicates (one may be replaced); any freedom | one game, two rulesets | one game, three rulesets | one game |
| **B. Goal and kind of freedom**: as A, but moves that commute and moves that do not make separate games | two games | one game, three rulesets | one game |
| **C. Technique**: a variant is in a game when it mostly shares the game's hint techniques | two games: no rung shared, and Netslide's planner is Sixteen's | three games: three different planners | one game: 7 of 7 rungs shared |

Question 2 is separate from these and applies to each of them. Under
**V-strict**, a replaced clue vocabulary makes a separate game. Under
**V-loose**, it is a ruleset.

| | V-strict | V-loose |
| --- | --- | --- |
| Splits from its game today | Salad's Letters and Numbers; Unequal and Adjacent; Solo's Killer; Path and Pairs | nothing |
| Merges into one game | nothing | Loopy and Pearl; Keen, Towers, Unequal, Mathrax and Solo (Group too, with associativity as a predicate); Range and Singles |
| Technique evidence (§ "What the techniques share") | A replaced vocabulary brings its own rungs and shares none of the clue rungs: Unequal and Adjacent share only the Latin rungs, and Killer only Solo's | — |
| Prior art | Ludii and Demystify file Killer and X Sudoku apart; pzprjs gives a genre its own id | pzprjs groups genres by shared code, which is close to V-loose but is not a rule |

**The recommendation: candidate B with V-strict**, revised 2026-10-29. The
first draft recommended A with V-strict. That pair is inconsistent by the
measure that ranks every kind of variation. A merges Net and Netslide, which
share no rung, while V-strict splits Unequal from Adjacent, which share half
their rungs.

**One principle answers both questions.** A ruleset keeps its game's
techniques. A variant whose own techniques do not carry over is another game
in the same family. The measurement orders the kinds of variation by how much
of the ladder survives:

| Variation | How much of the ladder survives | Word |
| --- | --- | --- |
| A board shape, or a change of adjacency | all of it | board shape |
| A modifier | all, plus the one rung of the predicate it adds | modifier |
| A number in a predicate; a move set of the same kind | nearly all (Star Battle 7/8; Flip 3/3) | modifier; ruleset |
| A replaced clue vocabulary | the family's half only (Unequal and Adjacent, Killer) | separate game |
| A move of the other kind | none (Net and Netslide 0) | separate game |

B and V-strict are the structural statements of where that line falls. Each
reads off a declaration, whether the moves commute and which clue kinds
exist, so neither depends on rung names. The measure is their check.

- **Question 1: no, within a kind of freedom; yes, across kinds.** Net and
  Netslide stay two games, side by side in one family: the same network,
  reached by deduction in one and by planning in the other. Fifteen, Sixteen
  and Twiddle become one game with three move sets. This is held with less
  confidence: their rungs cannot be compared, since the three planners name
  them differently. What would settle it is whether their hints teach the
  same staged method, putting the pieces home in reading order. Step 2 can
  read that off the three planners' narrations.
- **Question 2: yes.** The confident splits are Killer and Adjacent: the clue
  rungs on each side are disjoint. Two cases need a closer look before
  either moves:
  - **Salad's Numbers** has no clue rungs of its own: a ball or a cross is a
    given of the answer itself. So it may be the plain game, and Letters the
    variant that adds a clue kind, as Ascent's Edges does.
  - **Path's rungs** are too broad (`forced`, `breaks`) to say whether Pairs
    is solved the same way.
- **Why not A.** The owner's prompt was Net and Netslide. Under A they share a
  page and a menu, and nothing a player learns in one helps in the other.
  Their kinship is real, and it is the family's to show: one family, side by
  side.
- **Why not V-loose.** It cannot be stopped short of folding the Latin family
  into one game.

A family under the recommendation is an answer shape, and whether the moves
commute separates games within it. The catalog's families mix the two in
three places. Flip, in "Moves & planning", and Net and Untangle, in
"Rearranging", are filed with planning games, though their moves commute.
This document proposes no family change; it records where the tree and the
reasoning part.

## Disagreements with the catalog

Population: every `paramConfig` item of every registered game, dumped
2026-10-28 with a scratch test over `registeredGameIds()`. The rulesets and
modifiers are `git grep -l -E "rulesetItem|modifierItem" -- src/games`.
Each line gives the setting, how it is filed today, the part it touches, and
the word that part gives it.

| Setting | Filed as | Part touched | Word by the definitions |
| --- | --- | --- | --- |
| Net, Netslide: walls wrap around | modifier | space (a torus) | board shape |
| Solo: Jigsaw | modifier | space (the blocks) | board shape |
| Ascent: Orthogonal, Hex, Classic | rulesets | space (adjacency, tiling) | board shape. They share 6 or 7 of 7 rungs, as near as Ascent's own board shapes (8 of 8) |
| Twiddle: orientation matters | modifier | domain (a tile holds a turn) and goal | ruleset (shares 4 of 4 rungs) |
| Star Battle: one, two or three stars | rulesets | a number in a predicate | modifier, as Bridges' most bridges per pair already is (7 of 8 rungs shared between one and two stars) |
| Solo: Killer | modifier | clue vocabulary replaced | separate game (V-strict) or ruleset (V-loose). The deal test calls it a modifier because it combines with X and Jigsaw; the decomposition says combining is not the test |
| Salad: Letters, Numbers | rulesets | clue vocabulary replaced | question 2 |
| Unequal: Unequal, Adjacent | rulesets | clue vocabulary replaced | question 2 |
| Path: Path, Pairs | rulesets | what a number means, and a predicate | question 2 |
| Guess: allow blanks | plain checkbox | freedom (what a guess may be) | ruleset, of the same kind of freedom |
| Crossing: symmetric walls; Numgame: large numbers | label slot `kind` | distribution | generator setting. The label slot `kind` holds a board shape, a modifier and a generator setting today |

Settings the definitions agree with:

- **Modifiers:** ABCD's no diagonal, Bridges' no loops and most bridges, Unruly's unique, Guess's no duplicates, Solo's X, and Twiddle's rows only.
- **Rulesets:** Seismic and Tectonic, and Flip's Crosses and Random.
- **Kinds (board shapes):** Loopy's tilings, Ascent's board shape, Cube's solid and Pegs' board.
- **Generator settings and sizes:** all the rest. These include Keen's multiplication only, Mathrax's six clue switches and Signpost's corners, each of which changes which boards are dealt and no rule.

**Every game by answer shape and freedom.** This covers the games that
declare neither a ruleset nor a modifier as well. The games in one row share
an answer shape; what separates them is their clue vocabulary, which under
V-strict keeps each a game of its own. The rows are what the recommendation
makes a family.

| Answer shape | Moves commute | Games |
| --- | --- | --- |
| Latin square (some with blanks or extra predicates) | yes | Solo, Keen, Towers, Unequal, Mathrax, Group, Salad |
| Cells numbered within regions | yes | Seismic, Filling |
| A letter or digit per cell under counts | yes | ABCD, Crossing, Subsets |
| One loop or path through cells or edges | yes | Loopy, Pearl, Tracks, Path, Ascent, Signpost, Rome |
| A graph of links | yes | Bridges, Spokes, Slant, Sticks |
| Shading (two colors) | yes | Range, Singles, Mosaic, Pattern, Unruly, Clusters, Bricks |
| Objects placed | yes | Light Up, Tents, Magnets, Undead, Boats, Star Battle |
| A partition into regions | yes | Rect, Palisade, Separate, Galaxies, Dominosa, Map (colors regions) |
| A spanning network | yes for Net, no for Netslide | Net, Netslide |
| Tiles in order | no | Fifteen, Sixteen, Twiddle |
| A position reached by moves | no | Cube, Pegs, Sokoban, Inertia, Slide, Flood, Same Game |
| All lit | yes (over GF(2)) | Flip |
| A planar drawing | yes | Untangle |
| A hidden answer, found by queries | queries | Mines, Black Box, Guess |
| An expression | yes | Numgame |

Map is the one row choice that is arguable: its answer is a coloring of
regions that are given, so it sits as near the shading row as the partition
row. The only cross-game merges are in two rows. Candidate A merges both
the "spanning network" and "tiles in order" rows, B merges only the second,
and C merges neither. V-loose would also merge within the
first, fourth and sixth rows.

**The rule that a field changing which squares are neighbors is a ruleset**
(`docs/mechanics.md`) is the one the decomposition overturns. Adjacency is
space, as a tiling is, and the measurement agrees: the adjacency rulesets
share their rungs as fully as board shapes do.

## Cases the decomposition could not place

- **An added clue kind**: Ascent's Edges keeps Classic's givens and adds
  arrows around the grid. It is neither a replaced vocabulary nor a goal
  predicate, and it brings rungs of its own (`lines`, `pointers`).
- **A removed given**: Group with the identity hidden. Whether this is the
  clue vocabulary or the distribution is unclear. It adds two rungs
  (`identityFill`, `identityElim`), so it is more than a deal.
- **Clues revealed by play**: Mines, Black Box and Guess. The decomposition
  assumes the givens are dealt, but here a move is a query that returns a
  clue.
- **A goal on the path, not the board**: Flood's move limit and Guess's rows.
  Same Game's score is an objective to optimize, not a predicate.
- **A start position as the instance**: the shuffle counts of Netslide,
  Sixteen and Twiddle. In a planning game the distribution is the dealt
  position itself.
- **A space dealt at random**: Pegs' Random board.
- **A continuous domain**: Untangle's points.

## What the techniques share

For task 0.4: every hint rung each variant fires, from boards dealt at each
leaf preset with the variant set (two seeds each), walked by following the
hint until the board was solved or the hint refused. The instrument is
`HintStep.rung`, the id every hint step carries. It ran 2026-10-28 for 23
games; it was a scratch test and is not kept. "Shared" is rungs fired by both
variants, of rungs fired by either.

| Game: variants | Shared | Only one side fires |
| --- | --- | --- |
| Seismic: Seismic, Tectonic | 7/7 | — |
| Flip: Crosses, Random | 3/3 | — |
| Path: Path, Pairs | 3/3 | — (the rungs are broad: `forced`, `breaks`, `weighed`) |
| Ascent: Orthogonal, Hex, Classic | 6–7/7 | `routeOnly` |
| Ascent: Edges against the others | 4/8–4/9 | Edges `lines`, `pointers`; the others `only`, `onlyBeside` |
| Ascent: board shapes | 8/8 | — |
| Star Battle: one, two stars | 7/8 | two stars `needed` |
| Salad: Letters, Numbers | 11/14 | Letters `borderNear`, `borderFar` |
| Unequal: Unequal, Adjacent | 6/11 | Unequal `greater`, `lesser`; Adjacent `adjacent`, `adjacentSet` |
| Solo: Killer against plain | 7/11 | Killer `cageSingle`, `cageMinMax`, `cageSums` |
| Solo: X; Jigsaw | 11/11; 11/11 | — |
| Twiddle: rows only; orientation | 4/4; 4/4 | — |
| Bridges: no loops | 5/7 | `wouldCloseLoop`, `mustReachOut` |
| Unruly: unique | 3/4 | `unique` |
| Group: identity hidden | 6/9 | hidden `identityFill`, `identityElim` |
| Guess: duplicates allowed | 5/9 | four rungs about repeated colors |
| Net, Netslide (each against its wrapping) | 3/3 each | — |
| Net against Netslide | 0 | the rung sets are disjoint: `side`, `loop`, `sealed` against `frozenLine`, `besideSource`, `working` |
| Keen, Mathrax: their generator settings | 7/8; 7/7 | — |

What it shows:

- **A modifier adds exactly the rung of the predicate it adds.** Bridges'
  `wouldCloseLoop`, Unruly's `unique`. That is the definition read off the
  hint.
- **A board shape and a change of adjacency keep the ladder.**
- **A replaced clue vocabulary keeps only the answer shape's rungs**: Unequal
  and Adjacent, and Killer, share the Latin engine's rungs and none of their
  own.
- **A change of freedom kind shares nothing.**

The Latin games share one engine's rung names (`dup`, `single`,
`hiddenSingle`, `set`, `wing` and the rest). That is the one place rungs can
be compared across games, and it is the answer shape's half of the ladder,
which is why that half is the family.

## The open cases, read in step 2

Read 2026-10-29 for `tasks.md` 2.3 and 2.4, from the hint and solver code.
They change no decision above; the theory (`theory.md`) builds on them.

**Fifteen, Sixteen and Twiddle do not teach one method.** Each hint names a
tile and serves it ("Working on tile 7: …"), which is the stable-subgoal
contract every planning game's hint keeps (`docs/hints-search.md` § "Hold a
stable subgoal"), so the sentences look alike. The methods under them do not:

| Game | How the plan is found | What a step teaches |
| --- | --- | --- |
| Fifteen | upstream's greedy method (`fifteen/solver.ts`): the shorter of the top row and the left column, tile by tile, then a table for the 3×2 corner | walk the hole round the tile; `goalHome`, `goalCloser`, `goalReposition`, `tileHome`, `outOfWay` |
| Twiddle | stages in reading order (`twiddle/hint.ts`), each finished by a named run | a **tuck**, a **cycle**, **small cycles**, a **twist**, **lining up**: commutators of block turns |
| Sixteen | the shared slide planner (`engine/slide-planner.ts`): an exact shortest path where it fits, A* otherwise, over the whole board at once | which tile this slide carries; `home` and `settingUp` only |

Fifteen and Twiddle stage in reading order and Sixteen does not, and the
moves inside a stage share nothing: the hole's walk, block commutators, line
shifts. By the principle the owner's decision rests on, a ruleset keeps its
game's techniques, so **these are three games** in the "tiles in order"
family, as candidate C said. Candidate B made them one game, because their
moves are all of the same kind. That is where the principle and B's
structural statement part, and the theory states why: a method for moves that
commute does not depend on which moves there are (Flip's Crosses and Random
share their 3 rungs, since presses over GF(2) are solved by linear algebra
whatever a press toggles), and a method for moves that do not commute does
(a commutator is built from the generators it has). So the kind of freedom is
not the move set's commuting alone; for a non-commuting freedom the move set
is the kind.

**Salad's Numbers is the plain game, and Letters adds a clue kind.** Numbers'
givens are the answer itself, coarsened: a ball says a square holds a symbol,
a cross that it is empty, a digit what it holds. Every fill puzzle has givens
of that sort, and they are no clue vocabulary. Letters (ABC End View) keeps
the grid's givens, writes letters and crosses but never a ball, and adds the
border clues. The rungs say the same: Salad's ladder is the Latin family's
populate rungs, the empty-square rungs both modes use, and `borderNear` and
`borderFar`, which only Letters fires (§ "What the techniques share", 11 of 14
shared). So the case is not a replaced vocabulary, and V-strict does not split
it. It is the "added clue kind" of § "Cases the decomposition could not
place", and Ascent's Edges is the other.

**Path's Pairs keeps Path's techniques, at a finer grain than its rungs.**
Path's three rungs are broad, so the reasons under them were read
(`path/solver.ts`). Every firing is one of: a square with as many live edges as
lines it needs (`forced`); a line that would break the board at once
(`breaks`); every way a square could take its two lines, weighed (`weighed`).
What breaks a board is one of four clashes, `crowded`, `stuck`, `closed` and
`joined`, and the two modes differ in two lines: which numbers a line may
join (consecutive in Path, equal in Pairs) and whether a piece may close on
itself. No rung, reason or clash is one mode's own. The clue is the same kind
in both, a number on a square that a line ends at or passes, and what changes
is the predicate that relates two numbers, with the answer's shape (one path
or several). So Pairs is **a ruleset of Path**, a replaced predicate, as the
taxonomy's table filed it; V-strict does not split it.

**The Salad reading moves Killer, one of the two confident splits.** If
givens of the answer are no clue vocabulary, plain Solo has none, and Killer
does not replace a vocabulary: it adds cages to a game that had only givens,
as Letters adds border clues. The measurement says the same. Killer fires 7
of the 8 rungs plain Solo fires and adds its three cage rungs, the "nearly
all" row of the ladder table, beside Star Battle's 7 of 8. So by the
principle the owner decided on, Killer stays what the catalog files it as, a
modifier of Solo. Unequal's Adjacent is the one confident split left: Unequal
and Adjacent each add a clue kind to a Latin square no game ships plain, and
each loses the other's rungs (6 of 11 shared). **This revises how V-strict
applies, not the decision**: V-strict is unchanged, and "replaced" is now
defined (`theory.md`). The owner should see it before the catalog moves.

## What a move would cost

A game's id keys the page's path (`/netslide`), its help page, its saves and
autosaves (`[puzzleId+saveType+filename]` in `src/store/db.ts`), favorites
and preferences (`src/store/settings.ts`), and the front of every game ID and
`type` parameter in a link.

- **Merging two games** (Netslide into Net; Fifteen, Sixteen and Twiddle)
  costs, for each game folded in:
  - a route alias, so the old path and help link resolve;
  - a migration of the stored id on saves, favorites and preferences;
  - a translation of the old params string, which gains the ruleset field;
  - the merged game reading the folded game's saved moves.

  Every existing link and save stays openable if all four are done. A merge
  is a compatibility break only if one is skipped.
- **Splitting a game** (V-strict: Killer, Unequal's Adjacent, Salad's
  Numbers, Path's Pairs) costs the same in reverse. The saves and links are
  divided by their params: a Solo save with Killer on goes to the new game.
- **Changing only a word** (Star Battle's stars to a modifier; wrapping and
  Jigsaw to board shapes; Ascent's adjacencies to board shapes; Twiddle's
  orientation to a ruleset) keeps the params codec and so every ID, link and
  save. What changes is what a player reads: the ruleset name in front of a
  title ("Two stars: …") and the Type menu's sections. Those are
  player-visible and need the owner's word, but they break nothing.

## What was not checked

- **Loopy** ran out its ten minutes and fired nothing measurable, so its
  tilings are unmeasured. "A board shape keeps the ladder" rests on Ascent,
  Cube and Pegs.
- **Rung ids are per game.** Technique sharing across games is measurable
  only within the Latin family's shared names. A broad rung (Path's
  `forced`, Flip's `lastChance`) may hide reasoning that differs between
  variants.
- **Small samples**: ABCD without diagonal touching, 2 boards; Star Battle's
  three stars, 2 boards. Generation gave up on some cells (Bridges with one
  bridge, Group with the identity hidden at 6 and 8, one Killer cell), and
  boards the hint refused at a trial-and-error tier counted only up to the
  refusal.
- **Mathrax's "on" rows** are its presets' default, every clue kind on, so
  only the "off" rows vary.
- **The 44 games that declare neither** a ruleset nor a modifier were placed
  by reading their rules and help pages, not by measurement.
- **No player's judgment** was asked. Nothing here says which cut players
  would find clearer.
- **The prior art** was read for how it divides a puzzle only. Step 1 reads it
  whole.

## The owner's decision

**Tentatively decided, 2026-10-29: the recommendation, candidate B with
V-strict**, on the principle that a ruleset keeps its game's techniques.
Nothing in the catalog is moved on it yet. The owner's words: record it "as
tentatively decided, but don't act on it yet". It stands as the position the
theory and the language are built from (`tasks.md` § 3). Whether the catalog
moves is decided after the language has been tried on a corpus of puzzles
from outside the collection (`tasks.md` § 4).
