# share-the-latin-candidate-plan — design

Written 2026-09-20 from `add-mathrax-hint`'s findings, **before** the work, so
task 1.1 has something to check rather than something to invent. Every count
below is from 2026-09-19 and will have moved; the point of writing them down is
that a fresh session can tell whether it has.

## 1. The question each finding has to answer

`AGENTS.md` § "Convention over configuration" gives the one test: *can we say
what a game would legitimately want to do differently?* Applied per field, not
per finding, because the answer differs inside each one.

| Field | A game could want it different? | Verdict |
|---|---|---|
| `regionsOf` | Yes — Solo's blocks and diagonals, Salad's value set | stays a parameter; the **preset** supplies the row/column answer |
| `singleReason` | **No**, and the type proves it: given `Reg = RowColRegion`, `singleReasonOf` is the only inhabitant of the signature | preset supplies it; no override needed |
| hidden-single placement area | No, given the same `Reg` — it is `hiddenSingleLine` of the reason's own line | preset supplies it; a game's *other* placement arms compose on top |
| `strikeWords`' acted-on cell | **No** — every game means "the cell this firing acts on" | the walk passes it |
| `cleanObviousText`'s region phrase | No, given `regionsOf` — Solo already derives it | derived |
| `cleanObviousText`'s placed verb | **Yes** — Towers' towers *stand*, Solo's digits are *placed* | stays a parameter |
| `notes`' noun | **Yes** — "number", "height", "element", "letter" | stays a parameter |

Two rows are the whole point, and they are the two where the answer is *forced
by an answer already given*. That is the strongest form the test has: not "six
games happen to agree" but "the question has one answer once `regionsOf` is
known."

## 2. Decisions

**D1. A preset, not a new entry point.** `runLatinCandidatePlan` wraps
`runCandidatePlan` and fills the three row/column answers; it does not replace
it. Solo and Salad keep calling `runCandidatePlan` directly, and any game may,
which is what keeps the convention's override first-class (`AGENTS.md`: "Every
convention ships with an override"). A game taking the explicit form says why
in its change.

**D2. The preset takes `w` and gives back the regions — it does not infer
them.** The temptation is a `latin: true` flag. That is a statement *about* the
game for a mechanism to read, which is the manifest shape `AGENTS.md` names; the
honest form is a function a game calls, whose parameters are values the
mechanism consumes.

**D3. `StepWords` gains the firing's cell, and `marks[0]` goes.** The walk
already computes `cellsOf(marks)` for the step's `targets`. Passing the first of
those to `strikeWords` costs nothing and removes the second statement of a fact.
The latent defect this closes: `marks[0]` is *the* cell only because
`strikeAxis` keeps a firing inside one cell, so a game whose axis lets a firing
span cells today names the wrong cell in its evidence with nothing to notice.
Solo's `intersect` axis is exactly such a firing (`strikeAxis: (op) => …
? null : …` — a whole-firing leg across several cells), so **check Solo first**:
it may already be shading by its first mark where it means the region.

**D4. The region phrase is derived where the regions can name themselves.**
`RowColRegion` carries `line`, and Solo's carry a `kind`; `noRepeatRegionNames`
is the existing derivation. Move it beside `rowColRegions` and have the preset
call it. A region type with no name keeps the parameter.

**D5. Behavior-preserving, and say so per game.** Unlike `candidate-plan-kit`,
nothing here changes what the frontier sees, so every render snapshot and every
hint walk should be byte-identical. **A moved snapshot is a finding to explain,
not a baseline to refresh** — and given D3, a moved Solo snapshot is the
expected shape of a real bug being fixed, which is a different sentence from
"the refactor drifted". Write which one it is.

## 3. The trap this change is most likely to fall into

**Counting spellings under-measures the population.** The counts in
`proposal.md` came from `grep`, and `AGENTS.md` § "A scan that keys on a name"
is explicit that a copy is never called by the name of the thing it copies.
Before designing against "four games write `regionsOf: (x, y) => rowColRegions`",
take the population by reference — `npm run refs -- src/engine/latin-hint.ts
rowColRegions` — and read the call sites, because fourteen function bodies cost
less than a heuristic that lies about them. Expect the reference count to be
**higher** than the grep: `interpretMove`'s mark-all arm calls `rowColRegions`
too (Mathrax's does), and that is not a plan field.

## 4. Sequencing

D3 and D1 edit the same lines of the same eight files, so doing them in separate
changes means touching each twice. In one change, the order that minimizes
churn:

1. **D3 first**, alone, across every candidate game — it is a signature change
   with a mechanical shape, and its diff should be verifiable line by line
   ("every changed line either deletes a `marks[0]` dig or threads a new
   parameter").
2. **D4**, which is independent and small.
3. **D1/D2 last**, collapsing the row/column games' plan calls, because by then
   the lines it removes have settled.

Verify each step by shape before moving to the next (`AGENTS.md` § "Verify a
bulk edit by shape, not by a green suite"), then the slow tier for the games
touched.

## 5. What would make this change not worth doing

Stated up front so the fresh session can kill it cheaply rather than finishing
it out of momentum:

- If the reference sweep shows the row/column preset would serve **two** games
  rather than six, the fixed cost dominates and extracting one helper at a time
  wins (`AGENTS.md` § "the ambition sets the scale"). Six is the number that
  makes it worth it; check it.
- If D3 turns out to need a per-game hook to say *which* cell a firing acts on,
  the "helper keeps all the logic" property is gone and it should be declined
  and recorded, the way Undead was.

## 6. What the re-measurement did to §§ 1–4 (2026-09-20, the implementing session)

§ 3 said to expect the counts to have moved. Three did, and two findings did not
survive contact with the code. Recorded here rather than by quietly editing the
sections above, because the *shape* of each error is the reusable part.

### The counts

Taken by reference (`npm run refs`) over the seven games that walk a candidate
plan — group, keen, mathrax, salad, solo, towers, unequal:

| Field | Proposal | Measured | Why it moved |
|---|---|---|---|
| plain row/column `regionsOf` | four | **six** (all but Solo) | Group spells it `const regions = …`, Salad `saladRegions(o)`. A copy is never called by the name of the thing it copies |
| `singleReason: singleReasonOf` | six | **six** ✓ | — |
| hidden-single placement area | three copies | **six** | verbatim in Mathrax and Unequal; inside `placementArea` (Keen), `reasonArea` (Towers, Group) and `reasonEvidence` (Salad) |

§ 3's own prediction held too: `rowColRegions` has 29 references, because the
Mark-all arm calls it in four games and Group's own rung calls it and
`singleReasonOf` directly. Those are not plan fields and they stay.

**Salad is on the preset, against the proposal's expectation.** "Solo and Salad,
whose regions or values differ, stay on the general entry" was half wrong:
Salad's regions do not differ at all. What differs is its note encoding and its
setup, and both were already ordinary plan fields (`enc`, `setUp`). The habit
this catches: reading "differs" off a game's reputation rather than off the
field in question.

### D3 — declined on its premise

The finding: `strikeWords` digs `{ x: marks[0].x, y: marks[0].y }` back out of
the marks, and "a game whose axis lets a firing span cells names the wrong one
silently."

The premise is false. `cellsOf` (the walk's own helper, which builds the step's
`targets`) returns each cell once **in the order they first appear**, so
`cellsOf(marks)[0]` and `{ x: marks[0].x, y: marks[0].y }` are the same value
for every firing, always. Nothing can diverge, so "the evidence a game shades
cannot name a different cell from the one the move acts on" was already true and
threading the parameter would have renamed a fact rather than fixed one. And a
firing that genuinely spans cells has **no** single acted-on cell, so there is no
correct value for the walk to pass — which is why task 2.3 ("prove the new shape
fails") could not be satisfied, and that impossibility is what settled it.

Measured while checking: three `marks[0]` digs exist (Mathrax, Unequal — cells;
Towers — `marks[0].n`, a value). All three are sound today, each because the
game's own `strikeAxis` keeps a firing to one cell or one value. Solo, the game
D3 said to check first, does not dig a cell at all.

**The reusable part**: AGENTS.md's "prove a new guard fails before trusting it"
applies to a *refactor's* falsification task as much as to a guard. A task that
cannot be written is a finding about the design, not an obstacle to route around.

### D4 — re-founded, not built as written

The finding rested on "Solo … derives the phrase from the regions it declares
(`joinOr(noRepeatRegionNames(state))`)". It does not. `noRepeatRegionNames` is a
hand-written list (`["row", "column", "block"]`, then `"diagonal"` if `xtype`,
then `"cage"` if Killer) sitting twelve lines from the `regionsOf` it parallels,
and nothing holds the two together. So the precedent D4 wanted to generalize
does not exist — and the thing it pointed at is itself an instance of the defect,
in the one game the preset cannot serve.

A literal derivation there is not cheap: the cage carries no name (it is
`holdsEvery: false` and untagged *by design*, so that the type refuses a partial
region declared as whole), two diagonals must collapse to one word, and the
`at`-less call is a union over the board. That is its own set of decisions, so it
is filed as `derive-solos-region-names` rather than folded in here.

What this change does instead is **remove the phrase structurally** for the
family that can be served: the preset builds both setup sentences from the
game's `{ noun, placedVerb }`, so a game on it has no way to state the region
phrase and therefore no way to state a wrong one. That is stronger than deriving
a string — the tie is in the type, not in a helper both sides must remember to
call. Five games stopped typing `"row or column"`; Salad keeps its literal
because its custom `setUp` builds its own clean step, and Solo's phrase is
genuinely per-board.

### D5 — held, with nothing to explain

Every converted game's suite and every hint/render snapshot passed unchanged, no
`-u`. D5 asked for a sentence per game saying whether the plan is byte-identical;
the honest sentence is one for all six.

### The fall-out D1 did not predict

Renaming the entry point broke a **derived enrollment**: `FRONTIER_GAMES` in
`hint-frontier.test.ts` finds the plan-walking games by scanning their
comment-stripped sources for `runCandidatePlan(`, and `runLatinCandidatePlan`
does not contain that string. Six of seven games left the population silently;
only the vacuity floor (`length > 1`) caught it, and it would have survived a
partial rename. Two things worth carrying:

- **The comment stripper transpiles**, which erases type arguments — which is
  why a call written `runCandidatePlan<M, H, …>({` matched a key ending in `(`
  at all. A scan's key is written against the *stripped* text, not the source.
- The repair is AGENTS.md's: key on the shape both entries share
  (`CandidatePlan(`), and add a **second, independent derivation** of the same
  population (who imports the module) asserted equal to the first, so a key that
  stops matching a call site fails rather than passing over a smaller set. Both
  halves were proved to fail before being trusted.
