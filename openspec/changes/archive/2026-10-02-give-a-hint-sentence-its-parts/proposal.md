# give-a-hint-sentence-its-parts

**Status: scaffolded, not started (2026-10-02).** Owner, after the Pegs
playtest (`add-pegs-hint` design D7): *"why should that be left to auditing?
Couldn't we just make it structural, so that instead of the hint being a single
string, a game would have to offer the hint as a named tuple of hint parts with
those components? We do need a mechanism to allow exceptions, but I think that
we could rewrite a large majority of the hints into this form, so that these
exceptions would be few."*

## Why

The Pegs playtest settled rules for how a hint sentence reads, and none of them
is about Pegs:

1. **Look, then what follows, then the move.** Start with what the player
   should pay attention to, give the deduction it supports, and arrive at the
   move.
2. **Each part follows from the last.** Never "move A is bad; do move B" with
   no stated relation between them.
3. **"So" concludes only a move the sentence has narrowed to one.** Where
   several moves would do, the move is offered as one of them ("One of them:",
   "One way to save it:").
4. **Leave the move to the board when the board makes it obvious** ("…is
   stranded, with no peg beside it; go back for it.").
5. **Omit needless words.**

Today a step's words are one `Narration`, so each rule holds only where a game
remembered it. Swept for, they would drift exactly as every other swept rule
here has (AGENTS.md § "Convention over configuration": a declaration the engine
consumes beats a guard that reads code). Rules 1–4 can instead be the shape of
the thing a game hands over, with the engine composing the sentence.

The shape is partly here already. The candidate walk composes a game's premise
with an engine-written ", so …" ending (docs/games/hints.md § "The shared
candidate-hint machinery"), and Pegs needed a ring on a whole move so that
"go back for it" could name it without spelling the move out (`JUMP` in
`pegs/hint-text.ts`).

## What

A step's words become named parts the engine joins, along these lines (the
design pass decides the exact shape):

- **look**: what to attend to, a `Narration` naming the evidence marks;
- **follows**: what that implies;
- **move**: the action, either spelled out ("jump this peg into the ringed
  hole") or left to the board through an engine-owned reference to *the step's
  move*, which each game's renderer maps onto the rings it already draws;
- **relation**: how the move stands to the reasoning, a declared fact the
  engine turns into the connective: *forced* ("so …"), *one of several*
  ("One of them: …"), or *answers a danger* (the game supplies the short
  answer phrase, such as "One way to save it").

**Exceptions are first-class**: a step that cannot take the shape declares it,
with its reason, as the override pattern in AGENTS.md describes, and the
derivation asserts that the exceptions are exactly those declared. Likely
candidates: a bare move with nothing to say, a journey's continuation legs, and
refusals (which are not steps).

Rule 2 is the one the structure cannot fully enforce: the engine can guarantee
order and connective, not that the conclusion really follows. Separate parts
make it far easier to review, and the hint-quality walk can check the
mechanical half (a "so" over a move the game reports alternatives to).

## Decisions for the owner

- Whether the connectives are fixed engine words or a small vocabulary a game
  picks from by meaning. Fixed words are consistent across the collection; a
  vocabulary reads less mechanically. The census below should show how much
  variety the hints need.

## Hints to pull in

Black Box. It is deductive and its deductions rest on several premises (rays
in, rays out, what each excludes), so it tests whether look → follows → move
holds for a hint heavy with reasoning, not just for a search game's one-liners.
