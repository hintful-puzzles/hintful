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
