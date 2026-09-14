# add-seismic-hint — the measurement

Taken 2026-09-14. Line counts are raw `git diff --numstat` on production files,
as `add-tracks-hint`'s and `add-bridges-hint`'s `findings.md` §1 were taken.
Seismic's baseline before the change: `generator` 398, `index` 372, `render`
397, `solver` 376, `state` 515 = **2,058 production lines**.

## 1. The number

| row | Seismic | Bridges | Tracks | Galaxies (control) |
| --- | --- | --- | --- | --- |
| narration and step building (`hint-text.ts`, `hint.ts` from `narratePlace` down) | **+137** | +405 | +345 | +457 |
| **the deduction projection** (`hint.ts` down to `deduceSeismicPlan`, header and imports included) | **+335** | +377 / −9 | +536 / −19 | +387 / −29 |
| the overlay (`render.ts`) | **+84 / −17** | +331 / −51 | +220 / −19 | +192 / −26 |
| wiring (`index.ts`, `state.ts`) | **+27 / −7** | +44 / −8 | +31 / −1 | +102 / −1 |
| **game total** | **+583 / −24** | +1,157 / −68 | +1,132 / −39 | +1,138 / −56 |
| **engine** | **+87 / −31** | 0 | 0 | +3 |

**Half the cost of the three before it, and the reason is the shape, not the
game being small.** Three games of very different shape had come in within 2% of
each other; Seismic is the first to move that number, and each row says why:

- **The projection is re-derived from the player's own notes, not threaded
  through the rungs.** Tracks and Bridges each spent most of their projection on
  a reason per premise, captured in-rung, plus a per-premise early return gated
  on a recorder. Seismic has no recorder at all: each finder is the one-firing
  form of a rung, reading the notes on the player's screen. That is sound only
  because Seismic's `findMistakes` refuses the hint on a note that has crossed
  out its cell's answer (§3), and it is held to the rung it replaces by a test
  (§2).
- **The narration is five sentences over the shared candidate machinery.**
  `candidateHint`, `keepCandidateHintTrack`, `refreshCandidateHintStep`,
  `populateStep`, `nakedSingle` and the shared naked-single sentence all
  transferred; the shrink-in-place, the refusals and the populate opener were not
  written a third time.
- **The overlay used `hint-mark.ts` and `OverlaySidecar` whole**, because every
  element Seismic decides is a cell.

The engine row is the refactoring the proposal asked for (§4).

## 2. The Check/Tactic/Search reading of `attempt`: a Check

The audit filed Seismic third because `attempt` was *not obviously* on the Check
side: it places a candidate, lets `placeNumber` propagate, and rejects the
candidate if **any** area can no longer house **any** of its numbers — a question
about the whole board.

Reading what that rejection can possibly be settles it. Placing `n` at `c` takes
`n` from other cells and other numbers from `c` alone. So the area left short is
either `c`'s own, missing a number only `c` could hold — a hidden single, which
the Easy rung finds first — or another area that has lost its last `n`, every one
of whose remaining homes clashes with `c`. The second is **one placement and one
look at one area**: a Check, narrated directly at Normal, and the player can see
it without trialing anything: *"The outlined area can put its 2 only in line with
each of these and within 2 cells of it, so none of them can be 2."* Every cell
clashing with all of those homes is ruled out by the same fact, so they are one
step.

The reading is measured, not argued only: `seismic-hint.test.ts` walks every
Normal board of its corpus and, wherever the starved-area finder is the next
step, asserts it strikes **exactly** the candidates `placeNumber` +
`regionsViable` reject. The first probe, 36 boards, found 109 such points and 0
disagreements. The tier needs no `Unreasonable` name, and no Normal board moves.

## 3. What the proposal's two questions came to

**The single-firing driver did not become a third copy, and it is not being
extracted.** Tracks and Bridges ran their rungs through `runDeductionFixpoint`
with `settled` and `beforeTechnique` as a driver. Seismic did not need the
runner on the hint path at all. Its rungs are sweeps that apply everything at
once and read a candidate mask the player can already see, so re-deriving a
firing from the notes costs a few lines where threading costs a recorder. Two
copies of a six-line hook arrangement is not a layer below being wrong, and the
third game chose a different shape for a reason the first two could not have
used: their premises (a line's clue, a group's connectivity) are not written
down on the player's board.

That reason is the transferable finding. **A game whose deductions read only what
the player's notes show, and whose mistake check already vouches for every note,
can skip the recording projection entirely.** Written into
`docs/games/hints.md` § "Deduce from the notes when the mistake check vouches for
them", with the premise to check first.

**The mark vocabulary is not narrow; Bridges was unusual.** Seismic's marks are
cells and `hint-mark.ts` transferred without an adapter. The one new fact was
where the band goes: inside the cell's box, because the gap between Seismic's
cells is the black its region walls are made of.

## 4. The refactoring survey: taken and declined

| candidate | outcome | why |
| --- | --- | --- |
| candidate helpers scanning `w * w` cells | **taken** — they read `grid.length` | A note-taking board need not be square; a five-wide, eight-high Seismic board stopped three rows short. `anyEmptyLacksNotes` lost its now-unused width. |
| `nakedSingle` with the Latin `1 << n` over `1..w` | **taken** — takes a `NoteEncoding` | Seismic's notes sit at bit `n − 1` and run past the board's width; the parameter already existed for the mark helpers. |
| the obvious clean, tied to `regionsOf` | **taken** — `obviousCleanStep` split out of `emitObviousCleanStep` | A Seismic number's reach depends on its value, which a region list cannot say; the "fill, then clean is one journey" rule stays in one place. |
| an evidence cell's outline, missing from the diff key | **taken** — `OverlaySidecar` keys on outline sides | A cell can stay evidence while the shape around it changes, and a mark inside a cell is undone only by that cell's repaint; Seismic's two-frame test failed without it, and so did a sidecar unit test, both proven by planting the old `stale()`. It is the class `ts-engine`'s hint-mechanics requirement already names ("an overlay absent from the render cache's diff key"), closed for every game that packs a hint. |
| the single-firing driver | declined | §3. |
| the reason census as a shared test helper | declined | Its third copy is a seven-key record and one set comparison. Tracks ledgers arms with reasons, Bridges splits shipped presets from the rest, Seismic ledgers nothing; what is common is four lines, and a helper would take three shapes as options. |
| refusals, shrink-in-place, populate opener | already shared | Reused as they were. |

## 5. Two defects the guards found while it was written

- **`hint()` mutated the state**, caught by `hint-resume.test.ts` on the first
  run. Every Seismic state shares one region `Dsf`, and `canonify` compresses
  paths as it reads, so the first reader rewrote the partition. It is now
  compressed once when the description is read, which makes the "never mutated
  during play" comment on `SeismicBoard.dsf` true of its bytes too.
- **The two-frame outline defect** in §4, which the corpus test reached on a
  real board (a placement's strikes outline one cell; the next step, a hidden
  single, outlines that cell's area).

## 6. Measurements behind the design, and their conditions

- **Cost**, measured at load average 72 with little free memory, so an upper
  bound: one `hint()` on a fresh board about 20 ms; a full resume walk, one
  recompute per move, about 2 ms a move and 0.8 s for the slowest of 36 boards.
  No plan cap was needed.
- **Census** over 72 boards (every preset, four seeds, plus two rectangular
  shapes): every premise fires, none stalls, the starved-area finder fires only
  on Normal boards (264 times), and the longest sentence spoken is 115
  characters.
- **In the app** (Chrome, `6x6dh#sh-b`): six of the seven step kinds read in
  place — populate, clean, starved area, hidden single, a placement's strikes and
  a naked single — each frame's marks matching its sentence.
