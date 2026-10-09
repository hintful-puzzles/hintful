# Cuts: engine-drawing

Requirements: 35 before, 28 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "in one canonical winding" (The engine provides a shared recessed-border drawing helper; The engine provides a shared raised-bevel drawing helper) | how | The vertex order of a filled polygon; it does not change the fill. Which side takes which color, and that lowlight is drawn first, stay. |
| No game re-derives a bevel | duplicate | The rule and the guard are one sentence and a scenario in "A game draws its beveled frame through the recessed-border helper"; the raised half is "A game draws a raised tile through the shared helper". |
| How that guard reads a bevel (by shape, two polygons splitting one box; counting helper calls; equal counts per helper) | process | `docs/games/rendering.md` § "What enforces the palette rules" (the `bevels.test.ts` paragraph) says it. |
| Scenario "The guard reads nothing" (same requirement) | process | `docs/method.md` § "Count what the check looked at". |
| Scenario "A beveled game draws its frame through the helper" | duplicate | Restated its requirement; replaced by the guard's scenario. |
| Scenario "A raised-tile game draws its bevel through the helper" | duplicate | Restated its requirement; the pressed-in and Twiddle scenarios stay. |
| Scenario "a game needs different text options" (centered-glyph helper) | duplicate | Restated the requirement's last sentence word for word. |
| Scenario "a migrated test still catches its own defect" (render test records through the shared recording drawing) | process | `docs/method.md` § "See a guard fail before trusting it". No test in `src/` holds a `GameDrawing` double of its own any more, so no migration is left. |
| A repaint cue belongs in the tile cache before a sidecar | process | `docs/games/rendering.md` § "A cue with a tile available belongs in the tile key, not in a second cache": the preference, the reason, when a sidecar is right, and naming every input in its key. |
| The capability snapshot permits and forbids no name | duplicate | Merged into "The capability snapshot records a draw state's field names and judges none", which keeps the refusal of an approved vocabulary and its reason. |
| The capability snapshot reads the draw state as newDrawState returns it | duplicate | Merged into the same requirement: read as `newDrawState` returns it, at the preferred tile size, before any `redraw`. |
| Scenarios "a shared mechanic is added to several games at once" and "a field built from the tile size", and "no step of the `Game` contract assigns into it afterwards, so no later step can put back a field" (the two merged snapshot requirements) | duplicate | The merged requirement's one scenario states the loss of a field and that no name is judged; "A draw state is at one tile size for its whole life" says nothing sizes a draw state after it is built. |
| "not sizes, values or types, so that the snapshot moves when a game's vocabulary moves and at no other time" (capability snapshot) | how | "Names only" stays. |
| "(binary search)" (Fit-to-window sizing fills the slot) | how | How the largest fitting tile size is found. |
| Scenarios "A packed field overflows onto another" and "Two flags share a bit" (A warm frame matches a fresh paint of the same state) | process | `docs/games/rendering.md` § "A tile paints only its own box, and tiles that share pixels repaint together" lists the causes; the scenario for an input missing from the key stays. |
| The comparison paints the frames of an animation | duplicate | Merged into "The warm-frame comparison answers for what it reached", with its scenario. |
| "painting each frame until one is still" (same requirement) | process | `docs/games/rendering.md` § "A tile paints only its own box, and tiles that share pixels repaint together" ("What the run reaches is part of the result"). |
| "`Midend.timer` takes seconds." (same requirement) | process | `docs/games/rendering.md` § "A tile paints only its own box, and tiles that share pixels repaint together" ("What the run reaches is part of the result") says it beside the step it explains. |
| The comparison paints a drag's preview and a check | duplicate | Merged into "The warm-frame comparison answers for what it reached". |
| Scenario "A drag in the seeded run" (same requirement) | duplicate | Restated its requirement. |
| The comparison counts the frames and marks it painted | how | What `RepaintRun.reached` records and in which encoding (`role\|kind`, `StepMarks.of`). What the test requires of the report stays in "The warm-frame comparison answers for what it reached" and "Every hint mark a renderer asks for is painted by some run"; that mistake frames are counted and not required moved to the former. |
