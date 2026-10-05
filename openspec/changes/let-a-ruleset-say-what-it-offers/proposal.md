# let-a-ruleset-say-what-it-offers

**Status: scaffolded, not started (2026-10-05).** Found while splitting
Ascent's dialog in `declare-ascent-and-flip-rulesets`, and agreed with the
owner as a follow-up.

## Why

A ruleset is a different puzzle, so it often does not take every setting the
game has. Today the Custom dialog shows every field whatever the ruleset, and
the mismatch is found after OK is pressed, as a refusal.

Ascent is the worst case, read in `src/games/ascent/index.ts` on 2026-10-05.
Its `validateParams` has four refusals keyed on Edges:

- Edges on any grid but the Rectangle: "Edges is played on the Rectangle
  grid."
- Edges with symmetrical clues;
- Edges below Normal;
- Edges on 2x2.

**The first exists only because of how the split was built.** Ascent keeps one
`mode`, in which Edges is a fifth value beside four grids, and its ruleset and
grid-type items read and write that value between them. Edges with the
Hexagon chosen has no value to be, so `MODE_EDGES_OFF_GRID` was added: a mode
that only a dialog's working copy holds, there to be refused. A params value
whose one purpose is to carry an error is a smell, and it is this change's to
remove.

Two more of the same shape, noticed and not measured: Seismic's size limit
depends on its ruleset (`MAX_CELLS_SEISMIC` and `MAX_CELLS_TECTONIC` in
`seismic/state.ts`), and Unequal's
Adjacent needs a size of 5 at Tricky and above.

## What is known and what is not

- **How many refusals are of this kind is not known.** The three games above
  were met while working, not found by a sweep. The population is every
  `validateParams` return that tests the game's ruleset, in the games that
  call `rulesetItem`; `params-refusal.test.ts` already reads every string a
  `validateParams` can return and is the place to start.
- **Modifiers have the same coupling to sizes and tiers** (Solo's Killer
  under 10, ABCD's diagonal rule at five letters; the archived
  `declare-rule-modifiers` lists them). Whether they belong here is open: a
  ruleset decides which *fields* apply, a modifier mostly bounds a number.
- **What the dialog can do is not known.** It is built from
  `ConfigDescription` (`engine/midend.ts`), which has no notion of one field
  depending on another, and the app form renders it. Hiding or disabling a
  field as the ruleset changes means the description, or the form, learns
  that dependency.

## What Changes

To be designed. The direction: a ruleset declares what it offers, and the
engine builds from that both the dialog (a field or a choice the ruleset does
not take is hidden or disabled) and the refusal for a params set that reaches
it another way, such as a typed game ID. One declaration, so the dialog and
the refusal cannot disagree, and no game writes the sentence.

What a ruleset might need to say, from the three games: the fields it does
not take (Edges: grid type, symmetrical clues), the choices of a field it
does take (Edges: Normal and above), and a bound on a number (Seismic's
cells).

## Hints to pull in

None.

## What would show it worked

Choosing Edges in Ascent's Custom dialog leaves no way to ask for a Hexagon,
`MODE_EDGES_OFF_GRID` is gone, and a game ID that names an impossible pair is
still refused with a sentence.
