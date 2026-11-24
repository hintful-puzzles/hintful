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
spellings, and the hand-written copies go. A definition reading itself would
now loop at compile time: the description is refused where it is parsed.

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

So the deal names the rules a refused answer breaks (the module's
`violations` on the whole answer, which are empty exactly where `isAnswer`
holds), and once the rules have refused 100 answers with none yet held it
refuses, naming the rule that refused most. At Singles' rate, 100 refusals in
a row come once in 10^56 deals; a description whose rules refuse nine
answers in ten needs a sampler that builds them in, which the refusal says.

The hand-written generators whose solvers ask a compiled `isAnswer` (Path,
Net, Rome, Slant and others) keep their retry bound: they leave with the
migration onto the fill deal, which is where this refusal lives.
