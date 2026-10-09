# Cuts: engine-hints

Requirements: 162 before, 147 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The mark guards assert shape and derive their games | process | `docs/games/hints.md` § "Guarding it": guard the shape and not the color, palette indices read from each game's own renderer. The rule the guard holds stays in "A hint marks beside the content, never behind it". |
| The per-commit slice keeps one preset per value of every axis | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate": one preset per value of every axis, derived from `paramConfig`. "The hint walk SHALL cover every preset a game offers" stays. |
| A param's type decides what covering its axis means | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate": a `"string"` item covers both ends, a `"boolean"` or `"choices"` item every value, difficulty not special. |
| The slice takes presets in menu order | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate": menu order, so each value is claimed by the smallest board offering it. |
| Every cross-game sweep over presets derives its boards from the game | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate": call `gatePresets`, build no population, and the slice replaces a per-tier loop. |
| The slice's vacuity floor sits above its collapses | particular | Only the slice's own test consults where its floor sits; the general rule is `docs/games/testing.md` § "How a cross-game guard finds its population", rule 2. |
| A sweep's finding is pinned by its shape | process | `docs/method.md` § "A sweep that finds zero owes a power argument": pin the firing case as an input, never a seed. |
| A hint builder imports the refusal constants | duplicate | "Deduction running out on a sound board SHALL have one wording" forbids aliasing or spelling out a constant, and "A hint refusal SHALL be one of the collection's own" types the rest. Which directories the check scans is how the check is built. |
| The slide planner's games are guarded by the resume walk | process | `docs/games/hints.md` § "A hint must resume from any position": every hinting game is walked one freshly recomputed hint at a time. |
| The searching games are derived and their reasons ledgered | process | `docs/games/hints.md` § "Refusal wording comes from one module": the relaxation is derived from the games whose own code names the refusal, with a per-member ledger. "Only a searching hint is excused the walk's promise" stays. |
| The em-dash guard scans the games and the engine's shipped code | process | `docs/games/hints.md` § "No em-dashes": the three nets, the engine scan among them. That the rule covers engine-written wording stays in "Hint narration SHALL NOT use an em-dash". |
| The source scans and the runtime sweep both apply the em-dash rule | process | `docs/games/hints.md` § "No em-dashes": the nets overlap on purpose, and why. |
| The games with a text module are derived | process | `docs/games/testing.md` § "How a cross-game guard finds its population", rule 1. Which games have a text module stays in "A game's hint sentences SHALL live in one text module per game". |
| The ledger's reverse direction defers with the corner walk | process | `docs/games/hints.md` § "Keep the narration terse": the rot half defers with the corner and is reported as skipped in the hook. |
| A listing is not called dead on a walk that looked at nothing | process | `docs/games/hints.md` § "Keep the narration terse": suspect the walk first, and delete a listing only on a widened walk recorded beside the entry. |
| "…and color names SHALL NOT appear in the narration text", with the scenario clause "and the narration names neither color" (A legend color is never the only cue) | duplicate | "A narration never identifies an element by its color", which also gives the reason. |
| "The status-bar DOM stays gated on the app's `wantsStatusbar` attribute, so the empty status-bar text emitted for a game with no status bar is inert." (Hint explanation surfaces independent of the status bar) | how | What the player sees is in the sentences kept; where the empty text is dropped is the app shell's construction. |
| "…threaded through `PuzzleEngineSurface` and the worker adapter" (executeHint supports a single-step (hide-after) mode) | how | The path the flag travels; the type of the surface requires it. |
| "The planner's own state storage SHALL be allocation-free and packed, since the cost of a failed search decides whether running it on every board is affordable." (An exact-search budget is the smallest that crosses the worst endgame) | how | How the planner stores states; the promise that the exact search runs on every board stays. |
