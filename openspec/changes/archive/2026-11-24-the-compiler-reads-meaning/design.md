## Where the proposal's commits are

The hashes the review cited resolve to nothing in this repository
(2026-11-24). The defects themselves are in the log: the range mask in
973039781 (Keen born), the `_sp` parameter in 5d92bb887, the named sets
read by hand in 533537e85, e778b633c and f89e11ba1, and `hideFirst` on
Mathrax in 0e84347d2. Nothing below depends on the hashes.

## 1.1 Where the analysis keys on spelling (2026-11-24)

The query: `git grep -n -E "inlined\(|params\.length === 0|cycleOf|pointCycleOf|JSON.stringify" -- src/describe`
and the matchers each names. Every site reads one of three spellings.

### A set or a term named by a definition with no parameters

`inlined` reads a *call* of a definition as its body, and nothing else. A
definition with no parameters is read as a `name`, so each site that must
see through one checks for it by hand:

- by hand: `Check.resolved`, `throughSet`, `heldSet`, `heldLetsInPlace`
  (`compile-violations.ts`), the binder-set reading in `compile-expr.ts`'s
  hoisted walk (`def.params.length === 0`), `name()`;
- not at all, so a named set takes the general path where the same set
  written in place is bounded: `counted` and `stretchOf` (a count or a
  stretch through a named set), the size of a named set (`size` in
  `compileExpr`), `throughStated` and the hoisted `through` (`compile-expr.ts`),
  the stretch's set, `walkCache`'s key, `cluePin`/`chainPin`'s reads, and
  each matcher below.

**Structural reading:** `inlined` reads a name that no scope binds and that
names a definition with no parameters as that definition's body, as it reads
a call. Every site already inlines its head, so every one sees through both
spellings, and the hand-written copies go. A definition may read itself
(Flood's `flooded(c)`, a planning game's fixed point), so nothing refuses
one: a check that inlines such a call loops as it did before.

### The cycle forms, matched by their text

`cycleOf` asks for `forall e in edges where W: end2(e) not in
through(end1(e), {x in edges where W' and x != e})` exactly: W' compared to
W by `JSON.stringify` after renaming, the conjuncts in that order, the
binder's set the name `edges`. The same rule written `x != e and W'`, with
`=` turned round, with its set named (`forall e in lines: ... through(...,
lines - {e})`), or with W in a definition, is read line by line, a walk from
each. `pointCycleOf` (Slant's form over the points) asks the same of its
three binders: `slash(c, p) = value(c)` one way round, J stated in place.

**Structural reading:** a set of edges is read as its base and its filter's
conjuncts (`{x in edges where A and B}`, a named set inlined, `S - {y}` as
the conjunct `x != y`), and two terms are compared as one when they are the
same up to the names they bind, the order of `and`'s conjuncts, and the
sides of `=` and `!=` (`sameTerm` in `compile-terms.ts`). The cycle form is
then: a binder over a set of edges, and a walk over the same set less the
bound edge, from one end of it to the other.

### Comparisons by `JSON.stringify` elsewhere

The stretch's line (`b.of.args[0]` against the line argument) and the walk
cache's key compare text. Both are given `sameTerm`'s reading or the
inlined term, so a name and its body are one.

### Read in an order, for cost only

`cluePin` takes the where's *first* conjunct, `chainPin` any. A pin chooses
how the binder's cells are enumerated, and the where is still read of each,
so the spelling changes the cost and the order the cells come in, never what
is checked. The order is behavior (a firing's first binding), so this change
leaves the pins as they are: a description that wants the pin writes the clue
first, which `docs/descriptions.md` says.

## 2.3 A rule that can never hold

The compiler sees no board, and a rule false of every board is false by
what it says of one (a loop rule turned round), never in its text, so the
refusal is the deal's. Every fill deal checks each answer it draws or builds with
`isAnswer` and throws the draw away when it breaks a rule. Measured over
every registered game's default params, four deals each (2026-11-24): the
sampled draws were never refused by a rule, and Singles' built answers were
refused 4 times in 15 tries.

The fixtures are not registered, and the gate found one past that rate:
`shearing`'s scatter drew cells outside its hexagon, whose kind's meaning
holds them clear, so on a 5-high hexagon 900 to 3,600 draws were refused
for every board held. The sampler now leaves those cells at the scatter's
other value (`outsideKept`), the defect the refusal is meant to show.

So the deal names the rules a refused answer breaks (the module's
`violations` on the whole answer, which are empty exactly where `isAnswer`
holds), and once the rules have refused 100 answers with none yet held it
refuses, naming the rule that refused most. At Singles' rate, 100 refusals in
a row come once in 10^56 deals; a description whose rules refuse nine
answers in ten needs a sampler that builds them in, which the refusal says.

The hand-written generators whose solvers ask a compiled `isAnswer` (Path,
Net, Rome, Slant and others) keep their retry bound: they leave with the
migration onto the fill deal, which is where this refusal lives.

## 3.1 The four properties (read 2026-11-24)

What each bug was, what catches it planted again, and the cheapest tier
that does. Each plant below was run and seen to fail.

- **A range past 31** (973039781): `x in range(lo, hi)` built
  `rangeMask(lo, hi)`, whose `1 << d` wraps at 32, so a cage total of 32
  or more was in no range. The compiler now compares a number with the
  ends; `rangeMask` itself now throws on a bound outside 0 to 31, and a
  property test over every pair of bounds from -2 to 40 asks for the exact
  set or the throw (fails with the throw removed). With the compiler's
  comparison reverted, a Keen 6x6 deal throws `range(1, 36)`. Every
  generated `rangeMask` call is bounded by a size whose maximum is 31 at
  most (Adjacent's `w`, Solo's `across`, Group's `order` 26).
- **Emitted and read names** (5d92bb887, `_sp` emitted and `sp` read): the
  gate typechecks `src/generated/`, so a name read and never bound fails in
  every module with the form. With `play.ts`'s `domainOf` planted back to
  `_sp`, ten fixtures' modules fail the typecheck. No test is added.
- **Numerals in wording** ("sum to g"): on a board of numbers a term said
  bare goes through the value hook (`numeral`, a letter past nine), which
  is right for a value and wrong for a clue's number or a count. The
  compiler now refuses, on a board of numbers (`Env.numerals`) and in the
  library, a bare term whose expression, or the `let` it names, reads a
  clue, a size or a `count`/`sum`/`prod` (`checkStated`). No description
  had one; Keen's `{numeral sum}` turned back to `{sum}` is refused
  (`compile.test.ts`), and passes with the check off. On a shading board
  the hook is digits, so a bare clue there is said as drawn and stays
  allowed.
- **Per-tier clue kinds** (a6e0921d2: the hide pruned the signs at Easy,
  leaving no Normal `ordering` board): planting the keep off (`unread` all
  false in `deal/hide.ts`) fails six tests in `edges.test.ts` and
  `corners.test.ts`. Already guarded; no test is added.

## 4.1 What a fixture can be held to (2026-11-24)

The tier a test deals at is in its code, so no guard reads it. What the
description says is guarded instead, in the compiler, which holds games
too: `hideOf` refuses a hidden kind that no technique and not the domain
reads (`clue(kind, …)`, `clues(kind)`, through definitions), a given
excepted, since the hide would keep none of it. `cornering` without `pair`
is refused (`compile.test.ts`; passes with the refusal off). As `cornering`
stood it read every kind at Normal and would pass: its defect was a test
at a tier reading none of the kind, which `docs/testing.md` now states.

Reading for it found the deal's read set wrong for any clue not at a cell.
The compiled `reads` named a firing's cell bindings alone, and `cluesRead`
looked each cell's index up in every kind's list: a corner, line or edge
clue of that index was marked read, and one a corner binding named was not.
`reads.at` now names each element binding with the kinds placed at its
sort; the placing path marks the kinds at cells (`corners.test.ts`, fails
with the old reading). Same boards on all 176 deals of Boats, Mathrax,
Towers and Unequal against HEAD (`deal-compare`, 4 seeds a preset): the
prune's `finishes` check had covered the error, at the cost of its prune.
