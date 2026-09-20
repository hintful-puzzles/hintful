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

## What this does not do

- **Not a new engine contract chosen in advance.** The standing note on the
  `find`/`apply`/`narrate` split still applies: it owes an answer to what it
  buys beyond the hint walk, and this change is evidence toward that answer
  rather than a place to adopt it.
- **Not Rome's byte-match surface.** The generator is solver-gated at every
  step, so rule order and the dsf root choice are load-bearing for the published
  desc. A recording projection that changes the *commit* path changes every
  board; assert it does not, as Mathrax did, rather than arguing it.
