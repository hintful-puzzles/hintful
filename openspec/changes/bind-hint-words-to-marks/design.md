# bind-hint-words-to-marks — design

Phase 1 of `envision-the-game-contract` (archived 2026-09-29). Its `design.md`
holds the measurements and the owner's decisions; this file records how they
were built.

## D1. The pilot's hintless game is Signpost

The thirteen hintless games on 2026-09-29 were Black Box, Cube, Flip, Mines,
Mosaic, Net, Pegs, Rect, Same Game, Signpost, Slide, Sokoban and Twiddle. The pilot needs the one that presses hardest on the
*mark contract*, not the cheapest hint. Signpost presses on three things the
other two pilot consumers do not:

- **Its decided element is not a cell.** A step decides a *link*, from one
  square to the next. Palisade decides edges and the candidate games decide
  cells and notes, and both have their own shapes in the engine already.
  Signpost is the first consumer that needs an element kind the engine did not
  anticipate, which is the "a game may add a role or kind" clause under test.
- **The line a sentence names can be diagonal.** "This arrow's line" runs
  along any of eight directions. The stripes role was only ever drawn over
  rows, columns and regions.
- **The evidence is heterogeneous.** Each square the arrow passes over is
  ruled out for a different reason: it already has a predecessor, its number
  does not follow, or it is the arrow's own chain. The sentence has to account
  for each outlined square without a reason per square.

Its solver is one rule (a square's sole successor or sole predecessor), so the
hint is cheap to state honestly, and every board the generator makes is
solvable by it, so the hint never has to refuse on a fresh board.

Mosaic was the runner-up. Every mark it needs (a ring on a cell, stripes over a
3×3 block) already exists, so it would have tested the contract less.

## D2. Roles, kinds and glyphs

`src/engine/hint-words.ts` owns the vocabulary:

| role | adjective | what it marks |
|---|---|---|
| `ring` | ringed | what the step decides |
| `outline` | outlined | the evidence the step reasons from |
| `stripes` | striped | the line or region the sentence names |

An **element kind** is what a mark is drawn on: a cell, a note in a cell, an
edge, a link. A kind owns how its elements are keyed (so two references to the
same edge from either side compare equal) and the *unit* a noun counts, so
"this cell" stays singular over three struck notes in one cell. The engine
defines `CELL` and `NOTE`; a game or a shared mechanic defines its own kind
(`border-grid-hint.ts`'s `EDGE`, Signpost's `LINK`), and the glyph for a role
on that kind is drawn by whoever draws that kind today. Nothing moves painting
behind the engine in this change, so no footprint is declared (see D7).

A game may add a role only when none of the three fits, and says why in its
change. The pilot added none.

## D3. Narration is built from fragments

A `Narration` is a sequence of parts, each a literal string or a *reference*: a
role, a kind, the elements, and how the words read. `say` is a tagged template
that composes strings, numbers and narrations, so `${premise}, so
${conclusion}.` carries both halves' references. The builders:

- `mark.this(role, kind, els, noun)` — deixis: "this cell", "these cells".
- `mark.the(role, kind, els, noun, det?)` — "the outlined squares", "either
  outlined tile".
- `mark.paren(role, kind, els, words)` — "its bulbs (ringed)".
- `mark.as(role, kind, els, words)` — any other words bound to a mark: a clue
  named by its value ("Clue 3"), "the other cells they pass through". `words`
  may be a function of the elements, which is what lets a reference re-render
  when its elements shrink.
- `pronoun(els)` — "it" or "them", agreeing with the unit count.

**The literal parts may not say what a reference must.** `say` throws if a
literal contains a role adjective (ringed, outlined, striped, and the retired
hatched, shaded and highlighted) or the deictic `this`/`these`. A template's
literals are fixed per call site, so any call site a test reaches once is
checked for good. `mark.as` refuses an adjective that belongs to another role,
which is the Boats defect ("the striped row" over rings) made unwritable.

The falsifier's six forms are each expressed without an escape; the unit test
`hint-words.test.ts` writes one sentence of each form and asserts its text and
references. The fallback (a typed reference checked against hand-written text)
was not needed.

## D4. A step carries its words

`HintStep` gains `words?: Narration`. A step built from a narration sets
`explanation` to `words.text`, so the status bar and the midend are unchanged.
The explanation stays a plain `string` on the step because it is the only part
that crosses the worker boundary, and the narration's render functions could
not.

## D5. The game declares the section

`Game` gains a seventh type parameter, `Highlights` (default `unknown`), and
`hint`, `hintKeepTrack`, `refreshHintStep`, `uiUpdateClearsHint` and `redraw`
take `HintStep<Move, Highlights>`. The section is:

```ts
hintMarks?: HintMarkLegend<Highlights>;
interface HintMarkLegend<H> {
  roles: Partial<Record<MarkRole, string>>; // what each role marks here
  drawn(h: H): readonly MarkRef[];         // what a step's highlights draw
}
```

Both halves are consumed: `roles` is the Hints help section's list of marks,
and `drawn` is what the validator compares a step's references against. A game
declaring the section is **bound**, and every one of its steps must carry
`words`.

`drawn` is a statement about the renderer, which is the one place this design
leans on a second copy. It is held true from the other side by the tier-2.5
render tests, which assert the glyph each highlight field paints, and by
`hint-mark.test.ts`. Moving painting behind the roles would retire it, and is
the next step once the sweep has every hinted game bound.

## D6. The validator

`src/engine/testing/hint-binding.ts`, run on every step the hint-quality walk
visits for a bound game:

1. `explanation === words.text`.
2. Every reference names a mark the step draws: its `(role, kind, key)` set is
   a subset of `drawn(highlights)`.
3. Every drawn mark is named by a reference.
4. Every role a step draws is one the legend lists.

There is no "silent role": every mark the pilot's games draw turned out to be
nameable, and a silent role would be the per-mark exemption the proposal warns
against. If the sweep finds a genuine one, it adds the declaration then, with
its reason.

## D7. The candidate walk derives its highlights from the words

`StepWords` and `Premise` carry narrations. The walk derives `area` from the
outline references on cells (keeping each cell's chain ordinal) and `hatch`
from the stripes references, instead of the game writing them beside the
sentence. `targets` and `marks` still come from the move, and the validator
holds the ring references to them. A strike's conclusion is a reference to the
struck notes whose words are a function of them, so when
`refreshCandidateHintStep` or `keepCandidateHintTrack` shrinks the marks, it
narrows the narration to the notes still live and the sentence re-renders:
"we must cross out 2 and 4" becomes "we must cross out the 4".

## D8. The help's list of marks is generated

A Hints section writes `{{hint-marks}}` where its list of marks goes, and the
help build replaces it with one bullet per role in the game's legend: the
role's noun and the game's own words for what it marks. The legend is read by
importing the game from the build, as `vite.config.ts` already imports the
catalog. `help-coverage.test.ts` requires the placeholder in a bound game's
page and forbids it in an unbound one.
