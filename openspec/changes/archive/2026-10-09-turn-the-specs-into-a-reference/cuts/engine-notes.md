# Cuts: engine-notes

Requirements: 46 before, 41 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The vocabulary guard scans for a retired spelling as a typed-array field | particular | Only `src/engine/note-vocabulary.test.ts` consults it; its header carries the reason for a typed-array scan and its ledger test. The rule the guard holds stays in "One note-taking vocabulary across games" and "A field that is not the player's candidate set is outside the vocabulary". |
| The Mark-all guard derives its roster from the capability | process | `docs/doctrine.md` § "One source of truth": a cross-game guard finds its population by reading what the game is. `mark-all.test.ts` derives from `canMarkAll`. |
| The Mark-all flag is held to what the game does | duplicate | Merged into "The Mark-all action is the M key", which now forbids answering `M` without the flag and keeps the scenario. The sentence about the retired roster-against-flag check was history. |
| The engine surface exposes an opt-in "fill all pencil marks" capability | type | `Game.canMarkAll?: boolean` in `src/engine/game.ts` and `canMarkAll: this.game.canMarkAll ?? false` in `midend.ts`. That no control shows without the flag stays in "The Mark-all action is the M key". |
| "The app shell SHALL render the control among the game's on-screen controls, beside the Marks key" (The Mark-all action is the M key) | duplicate | `app-shell`, "Everything that depends on the game is in the Game controls", states the place and the order. |
| The pencil-mode indicator sits where the engine computes | duplicate | "A sticky notes mode is visible on the board" (the indicator in the engine's corner, room reserved) and "The engine owns the pencil-mode indicator, not only its glyph" (the game supplies only the engine's box). |
| "Both halves SHALL be guarded over the derived population: the default, and that the preference is offered at all." (Every member offers the keep-highlight preference, defaulted the same way) | process | `docs/games/engine-catalog.md` § "`note-taking-cell.ts` — the shared highlight-and-type mechanic" says the guard holds both halves over the derived population. |
