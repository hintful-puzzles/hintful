# Assessing test strength

How to find out whether a test would catch anything, and how not to be lied
to by the tool you use to find out. It applies to the whole tree, not just
the games. Writing tests is [`testing.md`](testing.md) § "The test tiers" and
`testing.md` § "Render scenarios"; this guide is assessing them, which is a
different activity.

The rules are normative in the specs: [`testing`](../openspec/specs/testing/spec.md)
("The test suite's strength is audited, not assumed"; "A shared module's tests
give feedback where the code lives") and
[`build-pipeline`](../openspec/specs/build-pipeline/spec.md) ("No correctness
check is removed or weakened to buy speed"). This guide is how to follow them.
Its findings come mostly from `2026-08-02-audit-test-suite-strength`,
`2026-08-02-strengthen-engine-test-feedback` and
`2026-08-01-right-size-the-test-gate`; a figure is true of the tree it was
measured on, so re-measure before reasoning from one.

## 1. Three properties, routinely confused

| property | question | how you measure it |
| --- | --- | --- |
| **coverage** | is this line executed? | line coverage, the least interesting |
| **strength** | would a wrong answer here be *noticed*? | mutation: change the line, see if anything fails |
| **feedback** | noticed **by what**, and how soon? | break the line, run *only* the module's own tests |

**Feedback is the one to measure deliberately.** A session runs the files it
touched and lets the commit hook be the single full run, so a module whose
own tests cannot see its defects goes green while broken, during exactly the
refactoring the tests exist to make safe. `npm run probe` (§2a) measures it
and prints each module's local-catch rate; the engine modules it first found
locally weak were brought to full marks for a few dozen tests and seconds of
gate CPU.

**A shrunk denominator is not a pass mark.** A module's rate leaves out a case
argued **equivalent** (§5), and once a case was removed for probing the wrong
layer: it changed which loop a seed produces, which is a differential's
guarantee and not a local test's. Each exclusion buys a written argument, and
the harness re-checks every equivalent on every run: one that starts being
*caught* means the argument expired under a code change.

> ### The number this table replaced was an artifact — read §7 first
>
> The audit's **"killed by its own test file"** column, from Stryker's
> `killedBy`, ranked modules wrongly in both directions. **Stryker bails the
> test run on the first failure**, so `killedBy` names the covering test that
> ran **first**, and vitest orders files roughly alphabetically: `grid.ts`
> scored near zero because other `grid-*` test files sort ahead of
> `grid.test.ts`, which alone fails on a planted defect. The module the column
> rated mid-table was the worst. **The correction reversed the work order the
> change was scoped around.**

**"Well covered" is not the finish line.** Ask where the failure would
appear, and how long after the mistake.

## 2. The cheap probe — do this before reaching for any tool

**Probe by hand first; it takes minutes.** Most of the audit's findings came
from it, and full mutation testing found one.

1. Pick the line that is the *point* of the code: the `Math.max`, the `<=`,
   the guard.
2. Break it.
3. Run the narrowest test set you would have trusted.
4. Widen until something fails. **Where it first fails is the finding.**

**A survivor of the narrow runs is a feedback finding, not a weak test.** The
audit's sharpest case was a semantic of a shared module that only one consumer
read: every other consumer was right to stay green, so it was pinned only by
files two layers away and died first in the full suite. Two local assertions
moved its failure from a two-minute suite run to milliseconds.

**A scripted probe must fail loudly when its edit does not apply.** A
non-unique anchor leaves the file untouched, the tests pass, and the harness
reports `SURVIVED`: a clean measurement of nothing.

```sh
n=$(grep -c "$ANCHOR" "$FILE")
[ "$n" -eq 1 ] || { echo "EDIT NOT APPLIED ($n matches) — not a result"; exit 1; }
```

## 2a. `npm run probe` — the cheap probe, kept

The §2 loop as a committed corpus. Runner:
[`scripts/feedback-probe.mjs`](../scripts/feedback-probe.mjs), whose header
gives usage and timings; cases:
[`scripts/feedback-probe-cases.mjs`](../scripts/feedback-probe-cases.mjs).
`npm run probe -- --verify` checks the anchors in well under a second; a
module-name argument filters the run.

**A case is a real defect with a sentence naming it.** Not "conditional
flipped" but *"a placed digit is no longer ruled out of its column"*, applied
to the source, with only the module's own tests run against it.

**A case is anchored within a named declaration, not within its file.** Its
`within` names the function, method, class or constant it perturbs, and its
`find` must match exactly once there
([`scripts/feedback-probe-locate.mjs`](../scripts/feedback-probe-locate.mjs)).
When a refactor moves a probed line into another function, re-point `within`.
A name declared twice in the file must be qualified (`Dsf.merge`); the locator
aborts rather than choose. The scope is the declaration because file-wide
uniqueness let an unrelated edit elsewhere in the module block a commit, and
that collateral grows with exactly the refactoring `AGENTS.md` asks for. The
strictness is the same; only the search space is narrower.

What the harness does that the ad-hoc probe does not:

- **It aborts if an anchor is missing or non-unique**, before running
  anything, where it would otherwise report a clean `SURVIVED`.
- **It derives "own tests" mechanically**: every engine test file that
  *imports* the module, **or a barrel re-exporting it**. This question has
  been answered wrongly three ways: by filename (§7), as the one file named
  after the module when several drive it, and by direct imports only, missing
  the tests that go through a barrel.
- **It excludes `*-differential.test.ts` even when engine-local**, so a module
  cannot score full marks on assertions it does not make.
- **It carries `equivalent: true` cases with their argument**, excluded from
  the rate, and flags one that starts being *caught*.
- **It walks `src/engine/` recursively, and refuses to run below a committed
  floor on the test files it finds.** A walk that stops following
  subdirectories derives fewer own tests, so the rate drops, which reads as
  "the tests got worse" rather than "the instrument stopped looking". The
  anchor check cannot catch it, since a pure file move leaves every anchor
  valid.

**The probe is a diagnostic, never a gate and never ratcheted**, the same
standing as `npm run metrics` and `npm run mutation`. Adding a case is
welcome. Adding one because a module scores badly is score-chasing.

**Only `--verify` is gated.** It runs in the commit gate's fail-fast prefix
and checks that every anchor still **applies** and the test-file floor holds,
never what the probe would find. Without it, a refactor of a probed line
would silently shrink the corpus and the harness would report success: a
silent cap that reads as health. The rate stays ungated, because a gated
feedback number invites tests written against the number. When `--verify`
fails, re-anchor on surrounding text, and decide whether the case still
states the defect it claims to.

**During a run, leave alone only the module being probed.** A run re-reads
each module from disk when its turn comes and restores only the module it has
planted, so an edit to any other module survives; an edit to the planted one
is overwritten by the restore. `git diff src/engine` names it. `--verify`
during a run reads the plant as an anchor mismatch on that module.

**Never run two probes at once, and read "anchor not found" with that in
mind.** A run edits engine source in place. A second run reads its baseline
while the first has a defect planted, then either restores the mutation as if
it were the original or reports an anchor missing from a line that is sitting
there in git. An argument-less run means *every module*, so one left going
behind a filtered run is the usual way in. The tell is that the quoted anchor
**does** match the committed file: check `git diff` on the probed module
before believing the anchor drifted. Anything already `git add`ed stays
staged while the working tree carries the plant.

## 3. Writing a test that discriminates

**A test passing on first write is not evidence it works.** Flip the line the
test is for, watch it go red, put it back (`testing.md` § "Break the code
under a new test"). Two shapes of a test that passed at once and caught
nothing:

- **Its case was already caught by an unrelated guard**, so the check under
  test could be deleted with the test green. The discriminating case is one
  only that check rejects.
- **Its inputs never hit the boundary**: `<=` and `<` differ only on the value
  that *equals* the bound, so a test without that value cannot tell them apart.

### An assertion whose two sides derive from the same value is a decoration

**An assertion the construction guarantees cannot fail.** A grid test
compared each dot's `edges.length` with its `order`, while the array is
allocated with length `order`: halving every degree in the builder passed the
whole file. The non-vacuous form is one the code under test has to get right,
here a degree counted independently from the edges that name the dot.

Shapes to search for (the general list is [`method.md`](./method.md) § "A
guard measures the thing it claims to guard"):

- `x.length` compared with the thing that sized `x`.
- A getter compared with the field it returns.
- A derived total compared with the sum it was computed from.

**When a real invariant has an exception, bound the exception; do not drop
the assertion.** A boundary dot's face ring is legally broken once by the
infinite exterior, so "no null faces" is false; "at most one null, and only
on the boundary" is the bound that still catches a walk giving up early.

### `toContain` of one character cannot distinguish it from a superstring

**A one-character needle admits every string that contains it.** A board
renderer checked with `toContain(".")` and similar stayed green when a bulk
edit turned every empty cell into `"./"`. The corruptions that happen, a
stray suffix, a doubled glyph, a wrong-width pad, are exactly superstrings,
and a short needle in a small alphabet is the same: `toContain("1")` is
satisfied by `"11"`.

Two exemptions narrow the trap to where it bites:

1. **The negative form is strengthened by it.** `not.toContain("x")` fails on
   the superstring too.
2. **`toContain` on an array is exact-element, not substring.**
   `expect(["11"]).toContain("1")` **fails**, so collecting drawn texts into
   an array and asserting `toContain("1")` is the right assertion. Check the
   receiver's *type* before "fixing" a site.

**Ask "is this the only assertion of the rendering?", not "is the needle
short?"** A site beside an assertion that pins the rendering down, or a smoke
check in a test about something else, is fine, and rewriting it is churn. The
sites that asserted a whole board a character at a time and nothing else were
rewritten, each seen to fail on a planted corruption the old form let
through; the rest are enumerated in
`openspec/changes/archive/2026-08-02-close-bulk-edit-blind-spots/tasks.md` §4.

**For a text format, assert the whole rendering.** `toMatchInlineSnapshot()`
fills itself in on first run and its failure diff shows the board. Keep at
least one targeted assertion beside it, so a careless `vitest -u` cannot erase
the guarantee (`testing.md` § "Render scenarios").

**A per-character check cannot notice a character that is absent.** A test
named for four glyphs asserted three, because its fixture never placed the
fourth; the whole rendering makes the omission visible.

### A test whose every assertion is conditional says nothing when its case never arrives

**Count what the condition matched and assert the count outside it**, so a
fixture that stops producing the case fails instead of passing over nothing.
`scripts/checks/vacuous-assertions.mjs` fails the gate on a test whose every
`expect` sits behind an `if`, counting `if (…) continue;` and
`if (…) return;`, the same guard written the other way round. Its header
holds the measurement that chose it.

**It is the only shape guarded, because it is the only one that caught
anything.** Measured against the tests `tidy-the-code-after-the-port` found
vacuous, it caught several; "both sides are one expression" and "a bound the
type guarantees" caught none, and the first's hits were sound assertions that
a seed determines a result. The proposal had ranked the conditional shape
lowest-confidence.

**The exemptions are derived from the syntax, not ledgered.** An `if`/`else`
that asserts on both branches always runs one. A scan whose last statement is
a `throw` has written its own vacuity guard. Widening the key to *loop
bodies* reports hundreds of table-driven cases over literal arrays that cannot
be empty: a wall, and a wall is a guard nobody keeps.

**The guard proves itself on every run against its fixtures**, because a
guard about tests that cannot fail has no business being one.

### A passing test is not evidence the test *file* is well-formed

**Write deliberate garbage as escapes or a byte array, never as a literal**
(`Uint8Array.from([0x53, 0x41, 0x00, 0xff])`). A literal NUL in a test file
passed tsc, biome, the test and the build; **git treats a file containing NUL
as binary and stops diffing it**, so the change became unreviewable, and
`git diff --stat` printing `Bin` was the only signal.
`src/asset-integrity.test.ts` now forbids raw control characters in `src/`
`.ts` files.

**A check cannot contain a literal instance of what it forbids.** That one is
a codepoint comparison, not a character class: the regex form fails its own
file, and escaping it trips biome's `noControlCharactersInRegex`.

### Short-circuits hide whole guards

**For any validator, corrupt one field at a time**, and include a case
asserting the *valid* input still passes, or every rejection case can pass
for the wrong reason. A save validator's only malformed input failed its
**first** check and short-circuited, so every later check ran only on the
happy path and could be replaced with `true` with the suite green. Line
coverage cannot see this, because the lines run.

## 4. The boundary with the differentials — state it, then verify it

**Some guarantees belong to a game's frozen differential, not a local test**:
an RNG draw order, a region sizing that decides *which boards exist*.
Restating those locally cannot be done better and is pointless done worse.

**The boundary is checked, not asserted.** Run the differential against the
mutation rather than reasoning about it, and record the division in the
module's own test file, so a later reader can place a new case on the right
side of the line. `src/engine/latin.test.ts` and
`src/engine/symmetric-blacks.test.ts` are the worked examples. A local test
asserts what is order-independent, such as a matching's maximality against
brute force; a test pinning a particular matching would break on any
deliberate generator change while proving nothing new.

**Extracted logic arrives with its tests.** Extraction into `src/engine/`
moves the code but not its tests, so the game's differential still catches
defects, nothing turns red, and the module arrives with no local assertions
(`testing.md` § "A shared module needs its own tests").

### 4a. A frozen capture used as a *quality bar* is on the wrong side of the line

**A capture is a specification only for what is underivable**: which board a
solver-gated generator produces, an RNG stream, a tiling's incidence in
emission order. No local test can replace those.

**A capture used as a peer comparison is not a differential**, whatever it
looks like: "our answer is within a tolerance of the other implementation's",
for a quantity with a definition you could compute. It is green whenever both
implementations are wrong the same way, and its tolerance cannot be
tightened, because it absorbs *the peer's* error rather than yours. The
worked example is `grid-incenter.test.ts` (`retire-the-incentre-c-fixture`):
computing the true answer instead of comparing with C's found a rounding bug
both implementations shared, which every face had passed.

**Ask whether the quantity has an independent derivation.** If it does,
compute it and delete the capture, which trades a fixture for a *stronger*
guarantee. If it does not, the capture stays. **When you delete one, account
for every fact it carried**, not just the headline: that capture also
supplied the list of cases swept, which the replacement re-founds on
`ALL_GRID_TYPES`, so a new tiling joins by existing rather than by someone
remembering.

## 5. Distinguish not covered from not reachable

A survivor has three explanations, and each needs a different action:

| class | action |
| --- | --- |
| **missing assertion** | write the test |
| **unreachable in practice** | record it; do **not** delete the code |
| **equivalent mutant** | record and move on |

`divvy.test.ts` records a class-two case: a retry loop that never iterates for
any shape tested, so a mutant after the first attempt survives correctly.

**Before calling anything dead, recall `tighten-type-checking`**: it proved
every one of its "unreachable" branches live and the analysis wrong.

**Chasing an equivalent mutant is worse than leaving it**, because the test
written to kill it asserts a mechanism rather than a claim. Each equivalent in
the corpus carries its argument, in one of three kinds:

- **From the code**: the guarded path is never reached, or its result is
  discarded downstream, as the module's own contract says.
- **Mathematically**: the change cannot alter an answer, as with ray casting
  to the left rather than the right, since both sides of a closed polygon
  have crossings of the same parity.
- **By measurement, when the argument will not close**: a sweep shows
  byte-identical output, after the sweep's own sensitivity is checked by a
  perturbation it does catch. Such a case stays in the corpus **because** the
  argument is empirical, so an input that exposes it shows up as an
  equivalent turning CAUGHT.

**An equivalence argument expires when the code under it changes**: a
scan-skipping ledger became load-bearing when a later feature read it.

**An empirical equivalence covers only the property it measured**: a search
case shown never to return a longer path also answered before its budget
check, and so returned paths where it should refuse.

**Working out *why* a mutant is equivalent is worth it even when nothing
changes**: the reasoning has found a comment that misdescribed the code.

## 6. Full mutation testing — when it is worth it, and what it costs

**Use `npm run mutation` to close a question the cheap probes opened, not to
open one.** Its config,
[`scripts/stryker.config.mjs`](../scripts/stryker.config.mjs), documents its
settings. **It is an audit, never a gate, and its score is never ratcheted**:
a number that invites maximizing invites tests written against mutants rather
than against behavior.

**A mutant costs one run of its covering tests, or one whole-suite run when
coverage cannot be attributed.** So affordability is decided by three things,
none visible from a module's line count:

1. **How broad the target's covering set is.** `midend.ts` dominates,
   because nearly every test constructs a `Midend`.
2. **How slow the suite is with parallelism off.** Stryker forces
   `maxWorkers: 1`; the dry run *is* the suite, serially.
3. **How much of the target is module-scope code.** Those mutants cannot
   always be attributed per test.

**Mutation cost is derived from suite cost, twice over**: halving the suite's
CPU more than halved an identical dry run.

### Timeouts are non-termination, not contention — and you can tell without re-running

**Read the report before blaming a loaded box.** Stryker scores a timeout as
*killed*, so the score is unaffected, but whether timeouts are real infinite
loops decides whether the run's time was wasted. In the audit, modules with no
loop had no timeouts at all, and the rate ran *inversely* to covering-set
size, where contention predicts the opposite; the timeouts clustered on
mutators that are non-terminating by definition inside a hand-rolled `while`
(`i++` → `i--`, an emptied loop body).

**Budget a re-run at the last run's time**; do not hope a quiet machine makes
it faster. The lever that would move it is `timeoutMS`, and lowering it costs
information (a slow survivor misreported as killed), not correctness.

**Triage survivors by cluster, not in file order.** `mutation-shape.mjs`, in
the archived audit, turns `metrics/mutation/report.json` into a per-module
table and survivor clusters by `(module, mutator)`: hundreds of survivors in
file order is a list, and one mutator's cluster in one module is one decision.
Expect conditionals and boolean literals in orchestration plumbing to be
largely equivalent.

## 7. The rule that caught the most: check the instrument against something external

**An instrument's unit of measurement is part of its correctness**, and
re-reading your own reasoning cannot verify it. Every row below was caught
only against something *outside* the tool. Some measured the wrong unit;
others had the right unit but were **capped or blind**, and reported health
over a scan of nothing, which is the variant to watch hardest.

| instrument | wrong because | caught by |
| --- | --- | --- |
| snapshot-pairing script | measured per `it`; the rule is per `describe` | reading the flagged files: every finding phantom |
| mutation probe harness | reported SURVIVED when its edit did not apply | a non-unique anchor |
| "−70% faster suite" | summed per-test **wall clock** on a loaded box | `/usr/bin/time`: the real figure was −53% |
| "modules with no test" | matched on **filename** | asking which tests *import* the module |
| mutation report table | no column for `Ignored` | reading Stryker's published schema |
| distilled report | flattened `location.start.line` | output below the fold not yet checked |
| "killed by its own test file" | Stryker **bails on first failure**, so it names the first covering test, not the capable ones | every killed mutant having exactly one `killedBy`, then a planted defect failing the module's own file alone |
| "the module's own test file" | one file named after the module is not its tests | counting the engine files that import the module |
| **knip's "0 unused exports"** | its resolver did not follow this tree's `.ts` import specifiers, so its graph stopped at each entry file | `--trace-export` on a symbol plainly imported, answering "No export found" |
| **the complexity distribution** | read through biome's default `--max-diagnostics=20`, so every threshold reported exactly "20" | the flatness: a distribution that does not move is the cap, not the tree |
| "86.5% of specifiers resolved" | counted bare package imports as failures to resolve | listing them: the real failures were a handful of `?raw`/`?inline` assets |
| an import-cost micro-benchmark | stubbed the module namespace as plain data properties, where vite defines exports as **getters** that V8 treats differently | it measured the imported arm as *faster*, against a mechanism already confirmed in the transform's output |
| "the A/A control flatters itself" | the arms were not warmed before the clock started | warming every arm: one instance timed twice reads the same as two separately loaded instances |
| **the agent's LSP `findReferences`, cold** | issued while the server was loading, it returned a small fraction of the references, with no error, and repeated cold it answered the same | the same query a minute later (`weigh-a-semantic-code-server`); `npm run refs` builds the whole program before answering |
| **a random-input fuzz over every game** | the defect it generalized needs a multi-step coincidence random play does not assemble | handing it the **unfixed** game as a control, which also passed |

**Hand a sweep a known positive before believing it found nothing.** It is
the cheapest habit on this page. A clean result from a broad sweep is a claim
about the instrument's reach, and a fuzz's reach is invisible: a green line
says nothing about whether the one sequence that matters was assembled. The
control costs one run (spread the game object, drop the fix, re-run), and it
turned "the collection is clean" into "this instrument cannot answer the
question", which is why the fuzz was not shipped. This is
[`method.md`](./method.md) § "See a guard fail before trusting it" aimed at a
sweep, and it applies hardest where the sweep is broadest, because breadth is
what makes a null result feel earned. Reading the population answered the
question instead: the games lacking the fix were a list to sit down with.

**Give a table a total and assert the columns sum to it**, so a status cannot
vanish by omission.

**Validate a parser against the real schema, not a fixture you wrote from
your understanding of it**, which validates the understanding, not the
parser.

**Before believing a derived metric, read what the tool documents it to
mean.** `killedBy` is a field about Stryker's execution; only a reading that
took it to mean "the tests capable of killing this" turned it into a ranking
of modules.

**An overstated caveat misleads as much as a missing one.** The costliest
error was a caveat that was *too strong*: mutants reported unevaluated in
three files when nearly all had been tested.

**A number that survives into a proposal has still not been checked.** The
most consequential error was the `killedBy` ranking: a follow-up change was
scoped and its spec written around its order before anyone measured it.
