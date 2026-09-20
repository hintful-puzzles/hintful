# add-rome-hint

## Why

Rome is the collection's only **candidate-elimination game whose candidates are
not values**. Its squares hold arrows, its notes are a per-square set of the
four directions (`state.pencil: Int32Array`, direction *bit flags* XORed in),
and its uniqueness regions are an outlined-region **`Dsf`** rather than a row,
a column or a block. Everything the candidate framework has been measured
against so far — the Latin family, Solo, Salad, Seismic — puts digits in cells
and gets its regions from `y*w+x` arithmetic.

Two things make it the right instrument rather than merely the interesting one:

- **It is guess-free at every tier, with no backtracking anywhere.** Its own
  solver header states it: Easy, Normal and Tricky differ only in *which*
  closed-form techniques may run. So every tier is narratable and there is no
  `Unreasonable` carve-out to argue about — the Check/Tactic/Search line, which
  Seismic was picked to settle, does not have to be re-litigated here.
- **Its ladder is already certified and its generator gates on it**
  (`rome-ladder.test.ts`, seven rungs, `findMistakes` present). The prerequisite
  work that Magnets needed is done.

The corpus audit (`characterize-the-hint-assessment-corpus`, `audit.md`) listed
it as class R and named what it presses on: *"a candidate substrate that is not
digits (arrow directions), and dsf reasoning"*. Every pick above it in that
audit's order has since been taken.

## What changes

Rome gains an explained `hint()` meeting the Palisade bar, and — this is the
point of picking it — the framework it does *not* fit gets fixed rather than
worked around.

**Four hypotheses to test, each falsifiable:**

1. **`NoteEncoding` generalizes off numbers.** Its two consumers (Seismic,
   Salad) are both `bit(n) = 1 << n`-shaped. Rome's notes are direction flags
   already in bit form. If a game whose values *are* bits needs a contortion to
   satisfy `NoteEncoding`, the abstraction is numeric and should say so.
2. **`CellRegion` wants a name.** `derive-solos-region-names` concluded that a
   `name` on the engine's `CellRegion` is one game's evidence, because **Solo is
   the only game that supplies its own `regionsOf`** — every other
   candidate-elimination game takes `runLatinCandidatePlan`'s fixed
   `rowColRegions`. Rome would be the second. Whether its hint wants to cite
   "this region" the way Solo cites "row, column, block" is the deciding datum,
   and it arrives for free. **Decide it here, either way, and record the
   decision.**
3. **A mixed ladder runs in one plan.** `single`, `doubles` and `naked-pairs`
   are candidate-elimination rungs; `loops`, `expand` and `find-4-position` are
   **dsf reachability** reasoning ("following the arrows from here could never
   reach a goal"). Nothing in the tree mixes candidate elimination with graph
   reachability in one `runCandidatePlan`. If the game's own-rungs slot takes
   them cleanly, that is the strongest evidence the slot is right; if the plan
   has to be bent, the bend is the finding.
4. **Arrow narration needs a vocabulary, not a translation.** `LatinVocab` is
   `{ noun, value }` and every consumer so far passes a digit glyph. A direction
   is a word ("up"), a glyph ("↑") and a *relation* ("points at this square"),
   and a sentence may need any of the three.

## Refactor as you go

This change is picked **because** it is expected to produce refactorings, so
declining one needs a recorded reason (`AGENTS.md` § "Refactor as you go"). Two
standing guardrails still bind: an exemplar hint never loses a word to an
abstraction, and game-specific logic is never contorted to fit a contract.

Where to look, in the order the work will meet them:

- **The recording projection.** Galaxies needed +387 lines in `solver.ts`;
  Tracks, Bridges, Seismic and Mathrax each measured their own. Report Rome's
  in the same terms — **game production lines, of which how many are the
  recording projection** — so the series stays comparable.
- **`naked-pairs` is a dead rung** the generator never reaches, and it carries
  an upstream quirk the solver header documents (it scans from the dsf root read
  as an element, genuinely skipping region members below it). A hint must decide
  whether to narrate a rung no board needs, and the answer is a *reason*, not a
  shrug.
- **The `Dsf` region as a `CellRegion`.** If `regionsOf` can be written over a
  dsf at all, ask immediately whether `engine/` should own that adapter rather
  than Rome — a second dsf-region game (`separate`, class A2) is already in the
  corpus.

## What the four hypotheses returned

Implemented 2026-09-20. Answers in the order they were posed; the followable
form is `docs/games/hints.md` § "Candidates that are not values (Rome)", and
`tasks.md` carries the measurements.

1. **`NoteEncoding` generalizes off numbers — and was incomplete in a way
   nobody had needed.** `bit` became a lookup and `values` is 4; no contortion.
   But the shared machinery enumerates candidates as `for (v = 1; v <= values;
   v++)`, so a direction must cross the boundary as a *dense ordinal* rather
   than as its bit — which is exactly what `NoteEncoding` exists to say, so the
   abstraction is not numeric, it is *positional*, and that is the honest
   description of what it always was. The genuine gap was elsewhere:
   `lazyPopulate` filled a board-wide `(1 << (w+1)) - 2` regardless of `enc`,
   because every game on the plan had one answer for every cell. Rome's full
   note set is **per square** (a top-row square can never point up) and
   Seismic's is per region. `NoteEncoding.all(i)` now states it.
2. **`CellRegion` does not want a name, and the question is closed.** Rome is
   the second game to supply its own `regionsOf`, which is what
   `derive-solos-region-names` was waiting for — and Rome's sentences say "this
   area", because Rome has one kind of region and there is nothing to tell
   apart. A `name` field would carry the constant `"area"` on every region Rome
   ever builds. Solo needs a name because it has five kinds; **a region's name
   is a fact about a game's narration, not about the region**, so it stays with
   the game that has several.
3. **A mixed ladder runs in one plan, and the own-rungs slot was never
   touched.** `loops`, `expand` and `find-4-position` all write to `pencil`, so
   all three are ordinary candidate eliminations whose *reason* is a fact about
   a graph. `plan.rungs` is `undefined` in Rome. The generalization: **ask what
   a rung writes**, not how exotic its reasoning is — the slot is for a firing
   whose *move* the canonical shapes cannot express (Salad's markers).
4. **A direction wants a word and a relation; it does not want a glyph.** All
   eleven arms want "up"; four additionally want the relation ("the square
   above", "point straight back"); none is improved by "↑". `LatinVocab` is not
   widened, and could not have helped anyway — Rome's generic-looking arms name
   an *area* where `narrateLatinReason` names a row and a column.

Two things the change turned up that it was not looking for:

- **`naked-pairs` is not dead.** Its `unreached` entry recorded a reproducible
  census ("2,896 calls across 36 board generations, zero firings"), and the
  census is honest — but thirty boards is a small sample for an event that
  happens on about one board in sixty, which is what solving 120 published
  descs measured. Two firing boards are now pinned in `rome-ladder.test.ts` **as
  descs rather than seeds**, `unreached` is empty, and the rung's `k < c`
  scan-order quirk is reachable again. *A census that finds zero owes a power
  argument, not only a count.*
- **A note-taking game had no note semantics.** Rome's `findMistakes` ignored
  marks on the strength of upstream's "can be used for any purpose". A
  candidate hint cannot deduce from a note it cannot trust, and a Mark-all that
  fills every legal arrow is incoherent under a "ruled out" reading — so a Rome
  mark now claims its arrow is still possible, and a square whose marks exclude
  its answer is a mistake. **This is the one player-visible decision in the
  change**; `tasks.md` § 6 states it and `help/games/rome.md` says so.

## What this does not do

- **Not a new engine contract chosen in advance.** The standing note on the
  `find`/`apply`/`narrate` split still applies: it owes an answer to what it
  buys beyond the hint walk, and this change is evidence toward that answer
  rather than a place to adopt it.
- **Not Rome's byte-match surface.** The generator is solver-gated at every
  step, so rule order and the dsf root choice are load-bearing for the published
  desc. A recording projection that changes the *commit* path changes every
  board; assert it does not, as Mathrax did, rather than arguing it.
