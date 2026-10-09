# Cuts: engine-colors

Requirements: 46 before, 36 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The engine provides a shared color-mkhighlight helper | duplicate | Merged, with the two below, into "The bevel trio comes from the shared mkhighlight helpers": the shift, the rounding-drift rule and the ban on a local copy all stay. |
| The engine provides a full mkhighlight palette helper | duplicate | Merged into the same requirement, with its scenario. |
| A mkhighlight shade saturates at the extreme | duplicate | One clause of the same requirement ("each saturating at its extreme"), and its scenario. |
| The signatures `mkhighlightBackground(bg: Color): Color` and `mkhighlight(bg: Color): { background; highlight; lowlight }` | type | The exports in `src/engine/color/color-mkhighlight.ts`. |
| "in `src/engine/color/color-mkhighlight.ts`" (both helpers) | how | Which module holds them binds nobody. |
| "by K = sqrt(3)/6" (the highlight and lowlight shift) | declared | `const K` in `color-mkhighlight.ts`, which the helpers read. |
| The engine provides a shared semantic color palette | duplicate | "A game contains no color value" (no RGB triple), "A meaning holds no value of its own" (defined once, by reference) and "A departure from a shared role is stated at the assignment" (two games take one role for one cue). |
| A game's palette contains no undeclared color | duplicate | Merged into "A game contains no color value", which now forbids reading a channel of the background and combining colors, and carries the failing-suite scenario. |
| "A literal of three numbers that is not a color SHALL be recorded with what it is." (same requirement) | process | `docs/games/rendering.md` § "What enforces the palette rules": `NOT_COLORS`, with a reason. |
| "The guard reads the source because a hand-written color is invisible to a render snapshot..." (same requirement) | how | Why the guard is a source scan; the header of `palette-source.test.ts` is where that is read. |
| A scheme is restyled or added in the token table alone | duplicate | Now the last sentence of "A game contains no color value", with the "A scheme is added" scenario. |
| Scenario "A color is referenced, never written" (A game contains no color value) | duplicate | Restates the requirement's first two sentences. |
| Scenario "A scheme is restyled without touching a game" | duplicate | "A scheme is added" stays and says the same of the same table. |
| The hint colors are measured in each scheme | duplicate | "The hint emphases stay distinguishable in both schemes" and "The acted-on hint color outweighs the evidence fill" each say "in each scheme", and their scenarios fail on "either scheme". |
| A game that calls mkhighlight gets back the background it was handed | duplicate | Now the last clause of "Every game's board sits at one tone". |
| Scenario "A game calling mkhighlight is unaffected" (same requirement) | duplicate | Restates that clause; that the shift is idempotent is said at `resolvePalette` in `color-mkhighlight.ts`. |
| "the midend's palette and dark-value reporting, and the render-scenario harness" (Every game's board sits at one tone) | how | "every consumer of a game's palette" is the rule; the list of today's consumers is a census. |
| "by `mkhighlightBackground`" (Every game's board sits at one tone) | how | Which helper does the shift; "The bevel trio comes from the shared mkhighlight helpers" names it as the shift's one owner. |
| "A game with white or black tiles SHALL be able to import it" (The engine provides a shared color-mkhighlight helper) | duplicate | "A game SHALL take the shift and the trio from these helpers" in the merged requirement. |
| "a pencil mark to the board it is written on" (A game contains no color value) | duplicate | One of three examples of a relative color; the bevel highlight and the ramp stay. |
| "measured between the two colors within that scheme" (Colors a game paints side by side stand apart in the dark scheme) | duplicate | "a stated distance apart in the dark scheme as the app paints it", in the same sentence. |
| A cross-game check finds an unexplained departure | process | `docs/games/rendering.md` § "The palette: three layers, meaning first" says where `palette-departures.test.ts` looks and what it fails on; `docs/method.md` § "Count what the check looked at" is its counting rule. The rule itself stays in "A departure from a shared role is stated at the assignment". |
| Two filled areas owe the dark distance outright, a thin mark conditionally | duplicate | Merged into "Colors a game paints side by side stand apart in the dark scheme", with both of its scenarios. |
| Scenario "A new game is covered without being listed" (Colors a game paints side by side...) | duplicate | Restates "so that a game is covered by being registered". |
| A bevel is read off the draw record by its shape | process | `docs/games/rendering.md` § "What enforces the palette rules": `bevels.test.ts` finds bevels by shape, what it does not see, and that it counts helper calls. That a game is covered by drawing a bevel stays in "A bevel a game draws is lit from one side in both schemes". |
| Scenario "A game asks for a meaning" (A game references a meaning, or a named color that is the meaning) | duplicate | Restates the requirement; "A set member is taken by name" stays. |
| Scenario "A swap names two distinct colors" (A declared swap keeps its pair in one order across the schemes) | duplicate | Restates the requirement's last sentence word for word. |
