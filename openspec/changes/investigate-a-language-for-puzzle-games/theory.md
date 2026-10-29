# A theory of puzzle games, for the catalog and the language

Task 3.1, written 2026-10-29 from `taxonomy.md`, the step 2 readings and
experiment A. It states what a puzzle game is made of, what the catalog's
words mean over those parts, and where the cut between games falls, with the
reason it falls there. The language (`language.md`) is this theory written
down so a program can read it. Nothing here moves the catalog.

## Sections

| Section | What it settles |
| --- | --- |
| The parts | the eight parts a description falls into, each defined |
| Freedom, and why it decides how a game is solved | the four kinds of freedom, and the one fact that separates them |
| Techniques | what a technique and a tier are, for deducing and for planning |
| What a variation keeps | the result the cut rests on: which variations keep a game's techniques, and why |
| The catalog's words | board shape, modifier, ruleset, generator setting, size, game, family |
| The cut | the principle, and its structural tests |
| The open cases | each case `taxonomy.md` could not place, resolved or named as a limit |
| Limits | what the theory does not cover |

## The parts

A puzzle game deals **instances**. An instance is a board the player can be
handed, and the game's description says, for every instance, what the player
sees, what they may do and when they have finished. The description falls
into eight parts.

1. **Space.** A finite structure of **elements** of a few sorts (cells, edges,
   vertices, regions, slots outside the board, cages) and **relations** among
   them: adjacency, incidence, membership of a region or a line, order along a
   line. A topology (wrapping, a tiling, an outline with holes) is a fact about
   these relations, not a separate thing. The space may be fixed by the
   parameters (Loopy's tiling) or dealt (Solo's Jigsaw blocks, Pegs' Random
   board, the regions of Palisade's answer are not space but answer).
2. **Domain.** For each sort that the answer assigns, the set of values one
   element holds: a digit or a blank, shaded or not, a line or none, one of
   four turns, a point of the plane.
3. **Answer shape.** The predicate every finished answer satisfies before any
   clue is read: a Latin square; one closed loop; a partition into regions; a
   spanning tree; a proper coloring. It is what "a finished board looks like"
   with every clue removed.
4. **Clue vocabulary.** The kinds of given beyond the answer's own values.
   A **clue kind** is a placement (which element sort, or which line or slot,
   a clue of the kind sits on), a value set, and a **meaning**: a predicate
   over the answer, parameterized by the clue's place and value. Loopy's face
   number means "this many of the face's edges are lines"; Killer's cage means
   "these cells sum to the value, with no repeat".

   A **given of the answer** is a clue whose meaning is that an element's
   value lies in a set fixed by the domain: the value itself (Solo's
   givens), or a coarsening of it (Salad's ball, "holds a symbol"; its cross,
   "is empty"). Every fill puzzle with a domain has givens of the answer, and
   they are **not part of the vocabulary**. A game's vocabulary is the clue
   kinds whose meaning reads more than one element, or reads the answer from
   outside it.
5. **Goal predicates.** Further rules the finished answer satisfies, each a
   predicate with parameters: no two stars touch; two stars per unit; no loop
   of bridges; no two rows alike. A clue kind is a family of predicates, one
   per clue dealt; a goal predicate is one predicate the game imposes whatever
   is dealt.
6. **Freedom.** How the player gets from the dealt position to a finished
   one: the positions they can hold, the moves between them, and the reading
   of a position as an answer. Fill the blanks; turn a tile; slide a row;
   press a square; reveal a cell. A bound on the moves (Flood's limit) is part
   of the freedom (§ "The open cases").
7. **Size.** The numbers that scale an instance without changing any rule:
   width, height, the digit count, a region's size, the number of mines.
8. **Distribution.** Which instances the generator deals among those the
   rules allow: the symmetry of the givens, which clue kinds are dealt, how
   many givens are left, how deep a shuffle goes, and the tier. Uniqueness of
   the answer is the distribution's promise too, and every deduction game here
   makes it.

A **solution** of an instance is an answer that satisfies the answer shape,
the meaning of every clue dealt, and every goal predicate. The instance is
**well posed** when it has exactly one. The freedom then says how the player
reaches it.

## Freedom, and why it decides how a game is solved

**One fact sorts every freedom in the collection: whether the player's moves
commute.** If any order of the same moves reaches the same position, the
position is a function of which moves were made, so it is a function of a
**choice**: which value each element takes, or how often each move is made.
Solving is then finding the choice, a constraint problem over the choice's
variables, and a hint deduces. If order matters, the position is a function of
a sequence, solving is finding a path, and a hint plans.

| Kind | Moves | What is chosen, or sought | Games |
| --- | --- | --- | --- |
| **Fill** | set an element's value, over what it held | the answer itself | most of the catalog, and Untangle (a point's place, over a continuous domain) |
| **Commuting action** | each move acts on the position, and any two commute | how often each move is made: a vector over a cyclic group per element (Net's turns), or over GF(2) (Flip's presses) | Net, Flip |
| **Non-commuting action** | moves are invertible and do not commute: a group, or, where a move's availability depends on the position (Fifteen's gap, Slide's blocks), a groupoid | a word in the moves | Fifteen, Sixteen, Twiddle, Netslide, Slide |
| **Transition system** | some moves cannot be undone by a move | a path through positions | Sokoban, Inertia, Pegs, Cube, Flood, Same Game |
| **Query** | a move reveals part of a fixed hidden answer as a clue | the hidden answer, from what is revealed | Mines, Black Box, Guess |

The first two kinds are **constraint problems**, and the last three are not:
the third and fourth are **planning problems**, and the query kind is a
constraint problem whose clues arrive in play.

Net and Flip are the instructive cases. They look like moving games, and are
constraint problems, because their moves commute. Netslide is Net's answer
reached by Sixteen's freedom, and is a planning problem.

**The kind is computed from the moves, never declared**: whether every move
can be undone by a move, and whether any two commute. Experiment B found the
first version reading it from how a description was written, and filing
Fifteen with Sokoban (`collection.md`). In a commuting action the answer the
rules read is the position, and the choice the techniques read (how often each
move is made) is derived from the moves; both are the game's.

**Within a planning kind, the move set is the kind.** For a commuting freedom,
a method does not depend on which moves there are: Flip's Crosses and Random
are both solved by linear algebra over GF(2), whatever a press toggles, and
share all three rungs (`taxonomy.md` § "What the techniques share"). For a
non-commuting freedom, a method is made of the generators: a commutator, a
conjugate, a tuck is a word in the moves the game has. Fifteen's hole walk,
Twiddle's block commutators and Sixteen's line shifts share nothing, and their
hints teach three methods (`taxonomy.md` § "The open cases, read in step 2").
So two non-commuting freedoms are the same kind only when they have the same
generators, up to the symmetry of the board.

## Techniques

**A deduction technique** is a rule of inference: a **premise**, which is a
pattern over the parts (some elements, the facts the player's marks record
about them, and the clues on them), and a **conclusion**, which is a set of
facts about the answer (a value placed, a candidate struck, an edge crossed
out). It is **sound** when every solution consistent with the premise
satisfies the conclusion, reading only the game's rules: the answer shape,
the clue meanings and the goal predicates. It is **markable** when the
premise and conclusion are both facts the player's marks can record
(`docs/solver-and-generator.md` § "Check, Tactic, Search").

**A planning technique** is a macro: a sequence of moves with a stated effect
(a tuck takes one tile in and leaves the finished tiles as they were), and
a **staging policy** saying which subgoal comes next (reading order, the
shorter of a row and a column). A planning game's hint by search, with no
macros, has no techniques the theory can compare (Sixteen's).

**A tier** is a set of techniques, and a board is dealt at a tier when its
answer is reached with that set and not with the set below. So a tier is part
of the distribution: it changes which boards are dealt, not what a solution
is. Experiment A found the tiers visible in the hint's rungs in 38 of 44 games,
and invisible where the hint's rungs and the solver's techniques are two
vocabularies (`experiment-a.md`).

**Soundness is monotone in the rules.** If a technique is sound under a set of
rules, it is sound under any larger set: a solution of the larger set is a
solution of the smaller, so it satisfies the conclusion. This is the one
result the cut rests on.

## What a variation keeps

A **variation** of a game changes some of its parts. What it does to the
game's techniques follows from which part it touches and how.

1. **Adding a rule keeps every technique.** A modifier adds a goal predicate,
   and an added clue kind adds a family of them. By monotonicity every
   technique of the plain game stays sound. Some fire less, since the new
   rule decides cells first; none becomes wrong. The variation brings the
   rungs of its new rule. Measured: Bridges' no loops adds `wouldCloseLoop`
   and `mustReachOut`, Unruly's unique adds `unique`, Killer adds three cage
   rungs and keeps 7 of plain Solo's 8, and Salad's Letters adds `borderNear`
   and `borderFar` to Numbers.
2. **Changing only the space keeps the techniques that are stated over the
   relations rather than over coordinates.** A technique that reads "the
   neighbors of this cell" is the same technique on a hexagon. Measured:
   Ascent's adjacencies share 6 or 7 of 7 rungs, its board shapes 8 of 8,
   Solo's Jigsaw 11 of 11, Net's wrapping 3 of 3.
3. **Changing a parameter of a rule keeps the techniques that are general in
   it.** Star Battle's one and two stars share 7 of 8 rungs; the eighth,
   `needed`, is about a second star. Path and Pairs differ in one relation
   inside one predicate, which numbers a line may join, and share every rung,
   reason and clash (`taxonomy.md` § "The open cases, read in step 2").
4. **Removing or replacing a rule can unsound the techniques that read it.**
   A replaced clue kind takes away every technique whose premise reads that
   kind. Measured: Unequal's and Adjacent's clue rungs are disjoint, and they
   share only the Latin family's 6.
5. **Changing the kind of freedom keeps nothing.** A deduction technique is
   about a choice, and a planning technique is about a path. Net and Netslide
   share no rung. Within planning, a change of generators keeps no macro.

## The catalog's words

Each word names what a variation touches. The first five are within a game.

- **Board shape**: changes only the space. This includes adjacency and
  topology. Keeps the techniques stated over relations (2).
- **Modifier**: adds a rule, a goal predicate or a clue kind, or bounds one
  by a parameter; combines freely with the game's other modifiers (the deal
  test, which stays). Keeps every technique (1).
- **Ruleset**: changes the domain, replaces a goal predicate, or changes the
  move set of a commuting freedom, and keeps the game's techniques (3).
  Rulesets exclude each other. A changed **parameter** of a rule (Star
  Battle's stars per unit, Bridges' most bridges per pair) is not a ruleset:
  it bounds the rule, and is a modifier, as the engine's choice modifier
  already is.
- **Parameter or size**: a number is a **parameter** when a rule reads it
  other than as the extent of the space or the domain, and a **size**
  otherwise. Bridges' most bridges per pair and Boats' fleet are parameters;
  Solo's block size and Twiddle's block size are sizes of the space. Twiddle's
  block size also changes the generators, which makes it a separate game by
  the cut, a case the theory names and does not settle (§ "Limits").
- **Generator setting**: changes only the distribution, including the tier.
  Keeps every technique, since no rule changes.
- **Size**: a number of the instance. Keeps every technique.
- **Game**: one answer shape, one clue vocabulary, and one kind of freedom,
  where a non-commuting freedom's kind is its generators. Its variations are
  the five above.
- **Family**: one **product**, what the player makes: the answer's sorts and
  domain (shaded cells; edges in a loop or path; numbers in cells; a division
  into regions; objects placed; a network), with the freedom's division into
  constraint and planning problems. Its games differ in answer shape, clue
  vocabulary or freedom. (Revised after experiment B: the first version cut
  a family by answer shape, and the catalog's rows do not share one; the loop
  and path row has five shape predicates. A cut by product is puzz.link's,
  `prior-art.md`.) The answer shape is the level below: the Latin games are
  one shape within the numbers family.

**The asymmetry of adding.** A variation that adds is filed against the game
it adds to. Killer adds cages to Solo and is a modifier of Solo; Solo is not a
modifier of Killer. Where two variants each add a different clue kind to a
game no one ships plain (Unequal's inequality signs and Adjacent's bars, both
added to a Latin square with givens), neither is the other's plain game, and
each loses the other's rungs: they are two games of one family.

## The cut

**The principle**, the owner's tentative decision (`taxonomy.md` § "The
owner's decision"): **a ruleset keeps its game's techniques.** A variation
whose techniques do not carry over is another game in the same family.

**Its structural tests**, read off a description without running anything,
from § "What a variation keeps":

| The variation | Keeps the techniques | Word |
| --- | --- | --- |
| touches only space | yes, where stated over relations | board shape |
| adds a rule or clue kind | yes, by monotonicity | modifier |
| changes a parameter of a rule | yes, where general in it | modifier |
| changes the domain, a predicate in place, or a commuting move set | yes, where general in it | ruleset |
| changes only the distribution | yes | generator setting |
| replaces a clue kind | no: the clue's rungs go | separate game |
| changes the freedom's kind, or a non-commuting freedom's generators | no | separate game |

**How it relates to the candidates.** This is candidate B with V-strict, with
two refinements found in step 2: a given of the answer is not a clue
vocabulary, so adding a clue kind to a game with only givens is not a
replacement (Killer, Letters); and a non-commuting freedom's kind is its
generators, which candidate B left as one kind (Fifteen, Sixteen and Twiddle
are three games, where B made them one). With both, the structural tests and
the measured technique overlap agree on every pair measured in
`taxonomy.md`.

**The measure that checks it.** Where techniques are named in one vocabulary,
the overlap of two variants' fired rungs is the check, and a structural test
that disagrees with it is a defect in the test or in the vocabulary. Rung ids
are per game, so this check works within a game and within the Latin family,
and nowhere else today. A language whose techniques are written over the
parts makes it work across games.

## The open cases

Each case `taxonomy.md` § "Cases the decomposition could not place" named.

- **An added clue kind (Ascent's Edges).** Resolved: a modifier, by
  monotonicity. It keeps Classic's techniques and adds `lines` and
  `pointers`. The measured overlap is lower (4 of 8 or 9) because an Edges
  board is dealt with fewer in-grid givens, so `only` and `onlyBeside` are
  needed less: a change in the distribution, which an added rule usually
  brings. Filed today as one of four exclusive rulesets, since it fixes the
  adjacency to Classic's; that is the deal test's `only`, not a reason to be
  a ruleset.
- **A removed given (Group with its identity hidden).** Resolved: a
  generator setting. Hiding the identity's row and column changes which
  givens are dealt and no rule. Its two rungs, `identityFill` and
  `identityElim`, are sound in the plain game too and never fire there,
  because the givens decide their cells first. A tier works the same way.
- **Clues revealed by play (Mines, Black Box, Guess).** Resolved: the query
  kind of freedom. The hidden answer has a shape and the clue kinds have
  meanings as in any game; a move reveals a clue. Mines is deduction over the
  revealed clues, Black Box over the rays fired, Guess over the feedback.
  What the theory does not cover is the choice of query: which cell to reveal
  for the most information is an optimization, outside techniques.
- **A goal on the path, not the board (Flood's move limit, Guess's rows, Same
  Game's score).** Resolved for a limit: a bound on the length of the path is
  part of the freedom. Same Game's score is an **objective**, not a
  predicate: the player finishes on any board with no move left, and the
  score ranks finishes. The theory names it as a limit: a game with an
  objective is an optimization, and its techniques are heuristics.
- **A start position as the instance (Netslide's, Sixteen's and Twiddle's
  shuffles).** Resolved: in a planning game the instance is the start
  position, and the shuffle depth is the distribution, as the givens are a
  deduction game's.
- **A space dealt at random (Pegs' Random board).** Resolved: the space is
  part of the instance where the parameters do not fix it, and the
  distribution deals it, as Jigsaw's blocks are dealt.
- **A continuous domain (Untangle's points).** Named as a limit. The theory
  places Untangle (a fill over a continuous domain: each point's final place
  is all that matters; the answer shape is a planar straight-line drawing of a given
  graph), but no technique over a continuous domain is markable, and its hint
  is a heuristic. The language states its rules and no techniques.

## Limits

- **The principle is measured, not proved, for a change of space or of a
  parameter.** Monotonicity proves that adding keeps every technique. That a
  board shape or a parameter keeps the techniques depends on the techniques
  being stated over relations or generally in the parameter, which is a fact
  about how the ladder is written, and is checked by measurement (and in a
  language, by stating them that way).
- **Rung ids are per game**, so the measure works across games only within
  the Latin family until techniques are written in one language.
- **A planning game whose hint is a search has no techniques to compare.**
  Sixteen's and Netslide's are; their games are separated by the generator
  test alone.
- **Objectives and continuous domains** are described and not reasoned
  about.
- **The word can depend on how a rule is written.** Path and Pairs are one
  game when "which numbers a line may join" is one predicate with a relation
  for its parameter, and two when each gives the number its own meaning
  (`collection.md`). The theory says the factoring that keeps the shared
  techniques visible is the right one, which makes the measure, not the
  structure, the arbiter in such a case.
- **A size that changes the generators** (Twiddle's block size) is a
  separate game by the cut and a size by the parameter test. Not settled.
- **No player's judgment** stands behind any of this. Whether players find
  the cut clear is not measured.
