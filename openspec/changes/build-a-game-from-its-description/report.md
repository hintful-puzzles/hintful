# Report: building a game from its description

Task 3.1, written 2026-10-29 for the owner's decision. The code and every
result line are `research/describe/` (`results-*.txt`); how it was designed
is `design.md`. Nothing in the app, the engine, the specs or the catalog
changed.

**What the owner is asked** (§ "The recommendation"): whether to go ahead,
and if so, whether the next change makes the description the source the
Latin family's ladder is built from.

## Sections

| Section | What it holds |
| --- | --- |
| The result | the headline, in four lines |
| The postmortems, read again | task 1.1: what each binds, and why |
| The form | task 1.2: JSON, its schema, the formula syntax, a library |
| The answer check | task 2.1 |
| The ladder and the hint's firings | task 2.2 |
| What was built, and what it replaces | task 2.3 |
| The checker in WebAssembly | the measurement the owner asked for before a port |
| What fits, and what does not | for which games, and what would be excluded |
| The recommendation | and the owner's decision |
| What was not checked | |

## The result

1. **The rules alone give the answer check.** On boards each game dealt,
   the description's verdict agreed with `status()` and `findMistakes`
   everywhere, for Towers, Unequal, Adjacent and Solo with its X, Jigsaw
   and Killer variations; a planted defect in each clue's meaning was seen.
2. **The stated techniques are the game's ladder, exactly.** For Unequal and
   Adjacent, run to a fixpoint at every tier, they ended on the same
   candidates as the game's own solver in every cell of 1,080 of 1,080
   closures, and gave the same grade on 270 of 270 boards.
3. **Every firing the hint narrates is one binding of a stated technique.**
   Of 2,630 firings of the two games' recording solvers, each was concluded
   exactly, mark for mark, by one binding of the technique stated under its
   rung, on the same marks.
4. **The cost is speed and the narrower games.** Interpreted, the ladder is
   15 to 146 times slower than the native solver, so it would be compiled,
   not interpreted (§ "What was built, and what it replaces"); techniques that quantify over the fillings of a cage or a
   line (Keen, Towers' `arrangement`, Killer's cage sums) were not run.

## The postmortems, read again

The four withdrawals the proposal names, and the two others in
`openspec/postmortems/`, each for whether its finding binds a description
of a game's rules and techniques that the engine runs.

| Postmortem | Its finding | Binds this? |
| --- | --- | --- |
| Scene graph (2026-05-21) | a declarative renderer was slow, and its pilot, Flip, the easiest case | **No** for its object: rendering is outside the description. **Yes** for its method, "don't pilot on the easiest case": Unequal is the Latin engine whole (singles, sets, fish, the wing) with a clue technique in each mode, and the hardest cases (fillings) are named in § "What fits" as untried, not passed over |
| Gesture table (2026-09-05) | a table expressed a quarter of the collection's input; the keyboard half of a drag is a design; the benefit had shipped by derivation | **No** for its object: input is outside. Its test, "measure the escapers before committing", **binds**, and § "What fits" is that measurement for the Latin family. Its preference for a property derived from behavior over one declared is met differently here: the description's claims are compared with the code's behavior on every board run, so a drift fails rather than rots |
| Board model (2026-09-06) | `grid/` is the general board model and 55 of 57 games decline it for typed arrays | **No**, and the pilot respects it: the description's space is the mathematics formulas read, never the game's state. A game keeps its arrays, and a binding of 20 to 50 lines reads them as an instance |
| Definition adapter (2026-09-06) | four declarations each stood alone, so there was nothing for an adapter to join | **Its criterion is now met the other way.** It asked whether a declaration needs another to do its job. Here every part needs the others: a technique reads the clues' and the space's vocabulary, the answer check reads the rules, the search judges the techniques, and the soundness checker judges techniques against rules. That interdependence is what the four lacked |
| Tile loop (2026-09-09) | its headline number was wrong by a factor of four, and nobody had taken it | **Binds the method**: § "What was built" measures what the description replaces, line by line, before proposing to replace it |
| Retire MODIFIED deltas (2026-08-24), Untangle unflip (2026-09-26) | an openspec workflow, and one game's interaction | No: neither is a declarative direction |

The doctrine's bar (`docs/doctrine.md` § "One source of truth") is the one
that decides: a declaration is healthy when the engine runs it or builds
from it. The answer check and the differential checks are checks, a second
statement held to the code. The ladder run from data is the engine running
the declaration. Only the second is "building from" it.

## The form

**JSON, with a JSON Schema, formulas in one syntax** (`design.md` § "The
form of a description"). `research/describe/description.schema.json` is
what an editor validates against; the loader parses every formula, so a
description that loads has no syntax error in it. Four descriptions and a
library were written: `towers.json` (36 lines), `unequal.json` (58),
`adjacent.json` (66), `solo.json` (48), and `library/latin.json` (36).

Two things came out of writing them that the notation did not have:

- **A library of techniques**, stated once and placed by each game at its
  own tier (`{"use": "latin.wing", "tier": "Extreme"}`). The Latin engine's
  six techniques are stated once for every Latin game, as `latin.ts` holds
  them once in code.
- **Variations as patches**: Solo's X adds a rule, Killer adds a clue kind,
  Jigsaw replaces the box partition with a dealt one, and the three apply
  to one description and compose (the Killer board in the pilot is one).

**A technique's binders are what one hint step names, and its conclusion
quantifies over what the step strikes.** The first statement of Unequal's
clue technique bound one end of a sign and one value per binding; the
game's solver fires once per sign, striking at both ends, and Adjacent's
once per edge, striking every value that does not fit. Stated that way, one
binding is one firing. This is a rule for writing techniques that the
investigation's notation did not state.

## The answer check

`results-answer.txt`. Boards from each game's generator, three seeds at each
size and tier the pilot covers (Towers 4 to 6 at every tier, Unequal and
Adjacent 4 to 6 at every tier the game deals, Solo 2x3 and 3x3 plain, X,
Jigsaw and Killer):

| Game | Boards | One answer by the rules, the game's | Full boards compared | Of them, refused by clues alone | `findMistakes` compared | Disagreements |
| --- | --- | --- | --- | --- | --- | --- |
| Towers | 36 | 36 | 1,086 | 186 | 216 | 0 |
| Unequal | 45 | 45 | 1,267 | 142 | 270 | 0 |
| Adjacent | 36 | 36 | 1,032 | 133 | 216 | 0 |
| Solo | 27 | 27 | 766 | 25 | 162 | 0 |

Adjacent at 4x4 above Easy is not dealt: the game refuses it.

What was compared on each board:

- **`status()` on full boards**: the solution, 24 mutants of it (a value
  changed; two cells of a row swapped), and every **intercalate** of it, a
  2x2 of open cells holding *a, b / b, a* swapped, which keeps every row and
  column Latin. The intercalates are the boards only the clues can refuse,
  and the "broken by clues alone" count is how many the comparison judged
  that way. Without them, the first run had none: every mutant broke a
  column, so the clue semantics were never what decided.
- **The answer**: a search that knows only the rules (`answer-check.ts`)
  found exactly one answer on every board, the game's.
- **`findMistakes`** on six boards of planted entries and notes each.

**Planted defects**, each in one clue's meaning, each seen: Towers' clue read
as "at least", Unequal's sign read backwards, and Adjacent's missing bar
read as nothing. The last is not seen on 4x4 boards, whose bars alone
decide every mutant and the answer, and is seen on 5x5.

**The search is the slow part.** It is generic: native propagation for the
library's `latin`, and for every other rule instance, a trial of the
completions of the cells it reads. Towers' clues read a whole line: the
median Towers board takes 0.4 s and the slowest 6x6 56 s, against half a
second at most for the others. Keeping a trial completion Latin cut one 6x6
board from 84 s to 15 s. A check
that runs in the gate would compare against the game's own solution, which
needs no search; the search is what shows the board unique by the rules.

## The ladder and the hint's firings

`results-ladder.txt` (ten seeds) and `results-firings.txt` (three seeds).

**Closures.** At each tier cap below the search, the stated techniques were
run to a fixpoint from the givens and compared, cell by cell, with the
candidate cube the game's `solveUnequal` ends with at the same cap. Every
technique stated is monotone, so the fixpoint at a cap does not depend on
the order the techniques run in, and the closures are comparable whatever
order the game's solver used.

| Game | Boards | Closures equal | Grades equal | Boards each technique fired on |
| --- | --- | --- | --- | --- |
| Unequal | 150 | 600 of 600 | 150 of 150 | placed 150, single 135, sign 120, hiddenSingle 114, set 47, wing 23, fish 13 |
| Adjacent | 120 | 480 of 480 | 120 of 120 | placed 120, single 100, adjacent 90, hiddenSingle 66, adjacentSet 58, fish 20, set 14, **wing 0** |

**Planted defects**, each seen: the wing dropped, the sign's bound made
strict (unsound), and sets narrowed to pairs.

**Firings.** Every firing of the game's recording solver
(`recordUnequalDeductions`), which is what each hint step narrates, was
replayed: the stated techniques of the firing's rung fired on the solver's
own marks just before it.

| Game | Boards | Firings | Covered | Matched by one binding |
| --- | --- | --- | --- | --- |
| Unequal | 45 | 1,342 | 1,342 | 1,342 |
| Adjacent | 36 | 1,288 | 1,288 | 1,288 |

The instrument was seen to fail before it was trusted: under the first
statement of the clue techniques (one end, one value a binding) it matched
1,043 of 1,342 and 1,123 of 1,288, which is how the rule in § "The form" was
found.

**What the hint adds on top is not stated.** A first version compared the
hint's steps with techniques fired on the player's pencil marks, and 1,592 of
1,924 matched. The gap is not a defect of either side: the candidate hint
plans from its recording solver and then re-reads singles off the player's
own marks (`regionsFull`, `hiddenSingle`, the populate and clean steps), a
narration layer the description does not state and need not.

**What it gives the grader and the hint.** Today the grader and the hint
read one solver, and the hint's rung names are the reasons' kinds. Run from
the description, both read one statement, and a firing's bindings are its
premise: the sign, its two ends, the value struck. The game's reason objects
carry the same facts under other names (`{kind: "greater", ox, oy, bound}`);
the hint words would read the bindings instead.

## What was built, and what it replaces

**What the tool is**: about 1,840 lines of TypeScript with their comments
(the parser 391, the evaluator 436, the spaces 277, loading 315, the search
297, the ladder 125) and 780 of tests and harness. It is the interpreter a
description needs once, for every game.

**What each game writes**: a binding from its state to an instance, about 25
lines for Towers, 45 for Solo with its variations, 60 for Unequal's two modes
(`bindings.ts`, with the pilot's own lists of params), and the description.
The descriptions are 36 to 66 lines of JSON each, the library 36. The binding is the per-game cost; everything
else is shared.

**What the descriptions would replace**, counted as code lines (no comments
or blank lines):

| Code | Lines | Stated as |
| --- | --- | --- |
| `latin.ts`'s deductive layer: `place`'s strikes, `elim`, `set`, `diffSimple`, `confinedSet`, `diffSet`, `wing` (Salad's repeated symbol and the forcing chains left out) | 323 | `library/latin.json`, six techniques, 36 lines with their notes |
| `wing.ts`'s `weighWing` | 70 | one of those six |
| Unequal's clue techniques, validator and context (`solver.ts` lines 82 to 323) | 201 | three techniques and two clue meanings, about 20 lines |
| Unequal's `checkComplete` (the status rules) | 43 | the two clue meanings and `latin(value, lines)` |
| Towers' `checkErrors` | 67 | one definition and one clue meaning |

What does not move: each game's generator, its rendering, input and hint
words; the Latin engine's forcing chains and recursion (the search rungs,
which a description marks unmarkable and does not state as a technique);
and `checkErrors`' other use, the live highlighting of a partial board, which
the pilot did not state.

**Speed.** `results-measure.txt`: the stated ladder interpreted, against the
game's own solver, on the same boards at the top deductive tier, five boards
a params. **The interpreter is 15 to 146 times slower**: 1 to 24 ms a board
against 0.02 to 0.3 ms, the ratio rising with the size and the tier.

The interpreter evaluates each formula afresh for every binding. A game's
generator calls its solver once per removed clue, many times a deal, so an
interpreted ladder could not stand in for the native solver at that rate. A
ladder built from the description would be **compiled**: each technique
turned into a TypeScript function at build time, as a dependency-injection
container's configuration is turned into objects before it runs. That is
the owner's comparison, and it is what "built from" would mean here.

## The checker in WebAssembly

The owner asked for the WebAssembly build's speed on the heaviest checks
before any port. A port of just enough of `pzl.py` to run them was written
outside the repository, in a scratch directory with its own `z3-solver`: the
same variables, constraints, creation order, split and blocking loop as the
Python tool, which it was run beside on the same machine, one check at a
time with nothing else running.

| Check | Python z3 4.16 | `z3-solver` 5.3.3 (WebAssembly) | Verdicts |
| --- | --- | --- | --- |
| Solo's `wing`, 4x4 | 425 s | **52 s** (23 s of it in 3,072 solver calls) | sound, both |
| Solo's `wing`, planted (the target need see only one end) | 0.05 s | 0.26 s | unsound, both |
| Range's `connect`, 5x5 | 80 s | 120 s (119 s of it in 25 solver calls) | sound, both |
| Range's `connect`, 6x6 | did not finish in over an hour, as in the cut's runs | not run | |

**The WebAssembly build is not the bottleneck.** Where the time is z3's own,
as in `connect`, whose 25 solver calls are nearly all of it, the WebAssembly
build is 1.5 times slower than native z3. Where the time is the tool's, as
in the wing's 3,072 small calls, the TypeScript port was eight times faster
than the Python one, which spends most of its time building formulas (or z3
4.16 is slower there than 5.3; the two were not separated). Range's `connect`
on 6x6 stays out of reach on either side, as the cut's report found: that is
the encoding of connectivity, not the runtime.

What a port costs besides: the package is 38 MB, nearly all one `.wasm`
file, with no dependencies; it runs z3 on worker threads (`SharedArrayBuffer`,
available in Node 26 with no flags), so every check is asynchronous; and
integers come back as `bigint`. It is a development dependency only: nothing
of it would reach the app.

## What fits, and what does not

Measured in the Latin family, the escapers before the shape (the gesture
table's lesson):

| Game | Answer check | Ladder |
| --- | --- | --- |
| Unequal, Adjacent | run, agrees | run, identical |
| Solo (plain, X, Jigsaw, Killer) | run, agrees | not run; its `intersect` and sets fit the library's form, its Killer cage rungs need fillings |
| Towers | run, agrees | not run; its Easy rungs fit (the investigation stated three), `arrangement` needs fillings, and its one-off facing-clue rule is a placement the solver makes once, outside the fixpoint |
| Keen, Mathrax | not run; their clue meanings are sums, products and differences, which the syntax has | cage rungs quantify over a cage's fillings |
| Group | not run | its identity and associativity rules are over pairs and triples of cells, which the syntax has |
| Salad, ABCD | not run | a repeated symbol, which `latin.ts` carries as a special case and the library does not |

**Fits well**: a game whose techniques read a bounded neighborhood of marks
(a unit, a sign, an edge, a wing). **Fits once one construct is executed**:
techniques over the fillings of a cage or line, which `language.md` states
(`exists fill f of S`) and the interpreter does not yet run. **Excluded,
by design**: the search rungs. A game's answer check fits wherever its rules
are finite, which is every game of the Latin family.

## The recommendation

**Go ahead, for the Latin family, with the ladder built from the
description.** The pilot did what the owner set as the strong reason: the
description, run, is the game's grader and the source of its hint's
firings, with nothing left over, and the answer check came from the rules
with no solver code.

**The next change, proposed**: compile the Latin library's techniques and
Unequal's from their descriptions into the functions the deduction fixpoint
runs, replacing `latin.ts`'s deductive layer and Unequal's clue techniques,
with this pilot's closure, grade and firing comparisons as its acceptance
test, and the generator's speed measured against today's. Then, one change
each, the games of § "What fits" in order of fit, with fillings executed
before Keen, Towers and Killer. The technique checker is ported to
TypeScript in that change, as the owner decided, so that every stated
technique is checked sound against its rules before it is compiled; its
WebAssembly build is fast enough (§ "The checker in WebAssembly").

**What it would not do**: the help page's rules and the spec's `Rules:`
requirements stay written by hand. The investigation declined generating a
help page's rules, and the pilot found no reason to reopen that; a check
holding the spec's rules to a description is possible and was not tried.

**The owner's decisions asked for**:

1. Whether to go ahead.
2. Whether the ladder is compiled from the description (the recommendation),
   or the description is held to hand-written code by a check in the gate
   (the answer check and the differential checks, as the pilot ran them),
   which is cheaper and is a second statement held to the first rather than
   one statement.

## What was not checked

- **The ladder of any game but Unequal's two modes.** Towers' and Solo's
  were not stated whole.
- **Fillings**, so no technique of Keen, Towers' `arrangement` or Killer's
  cages ran.
- **Soundness of the stated techniques** against the rules, which is the
  checker's job; the pilot showed them equal to the code, and the code is
  as sound as its tests show.
- **Adjacent's wing never fired** on the 120 boards walked, so the wing is
  compared only on Unequal's boards.
- **Boards above 6x6** for Towers, Unequal and Adjacent.
- **A partial board's error highlighting**, which `checkErrors` also does.
- **The help page and spec rules** (§ "The recommendation").
