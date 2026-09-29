# bind-hint-words-to-marks

**Status: scaffolded, not started.** Phase 1 of `envision-the-game-contract`.
Read that change's `design.md` first. It holds the measurements (2026-09-29) and
the owner's decisions this change is bound by.

## Why

A hint says something in words and shows it in marks, and the engine cannot
relate the two. `HintStep.explanation` is a `string`, and `Game.hint` returns
`HintResult<Move>`, so every game's highlight type is `unknown` at the boundary.
Measured on 2026-09-29:

- "Ringed" names the target in some games and the evidence in at least seven.
- The hatch is "striped" in about twelve games and "hatched" in one.
- The evidence role has at least seven field names.
- Nine games test a word against a mark.

Boats said "the striped row" over rings and passed every cross-game guard.
`refreshCandidateHintStep` and `keepCandidateHintTrack` shrink a step's marks
and leave its sentence as it was.

## Decided (owner, 2026-09-29)

- A **ring** is what the step decides.
- An **outline** is the evidence it reasons from.
- **Stripes** are the line or region the sentence names.
- Shipped words that disagree are renamed; for example, Bricks' "ringed"
  evidence becomes outlined.
- The engine owns each role's glyph, noun and adjective.
- The Hints help section's list of marks is generated from the roles.

## What changes

1. **Typed highlights through the boundary.** `Game` gains a highlights type
   parameter, so `hint`, `redraw`, `hintKeepTrack` and `refreshHintStep` stop
   erasing it.
2. **Mark roles owned by the engine.** For each role and each element kind
   (cell, edge, dot, region, line) the engine holds the glyph, the palette
   meaning, the noun and the adjective. A game may add a role when none fits,
   and its change says why. Where the engine draws a mark that straddles tiles,
   the game declares that mark's footprint, as `HintMarks.eraseBeforeTiles`'
   overlaps callback does ad hoc today.
3. **Tagged narration.** A sentence is built from fragments, where a reference
   to a mark supplies that mark's elements. The step's highlights are derived
   from the sentence rather than written beside it. The candidate walk already
   binds `targets` and `marks` to the move (`StepWords`, `candidate-plan.ts`);
   this extends that binding to the words.
4. **A validator on every step.** Every drawn mark is referred to, or belongs to
   a role declared silent. Every mark reference names a mark the step draws. It
   runs wherever `hint-quality.test.ts` walks.
5. **Refresh rebuilds the words** when it shrinks the marks.
6. **The Hints section's mark list is generated** from the roles the game uses.

## Tasks, in order

- **Task 0: the pilot.** Build the engine side against three consumers:
  - one hintless game, chosen from the thirteen for what it presses on in the
    mark contract, with the reason recorded;
  - Palisade, which is all deixis: "this edge", "these clues";
  - the ten games on the candidate walk, since one engine change reaches all
    ten.
- **The falsifier.** The forms below must be expressible without an escape per
  sentence:
  - deixis ("this cell" promising a ring);
  - quantifiers ("either outlined tile");
  - agreement ("it" or "them");
  - parenthetical references ("its bulbs (ringed)");
  - continuation legs;
  - the composed `${premise}, so ${conclusion}` sentence.

  If they cannot be, fall back to a typed mark *reference* checked against the
  step, rather than generated text, and record why.
- **The pilot ends by scaffolding the sweep** over the remaining hinted games,
  batched by the hint machinery they share: firing ladders on `hint-plan.ts`,
  placement ladders on `hint-track.ts`, the border grid, and the planners.
- Update `docs/games/hints.md`. Its mark table (§ "Hatch the line the sentence
  names" and neighbors) becomes a pointer to the engine's roles.
