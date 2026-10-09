# Cuts: ts-migration

Requirements: 44 before, 31 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| Migration proceeds top-down, product-value first | port | The order in which the midend and the games were ported; every game is ported and nothing is left to order. |
| A leaf library is ported when a game needs it | port | The leaf libraries are ported and live in `src/engine/`; no bridged seam or characterization corpus exists to refuse. |
| A game narrates every deduction it accepts, or rejects the board at generation | collection | `engine-hints`, "A game narrates every deduction or rejects the board at generation", says the two means. The measured cost stays here in "A rejecting generation gate is measured before it is adopted". |
| The C engine is fully retired once every game is ported | obsolete | No C, wasm, Embind or Emscripten file is tracked outside a change's `reference/`. `build-pipeline`, "The app builds from a clean checkout with no toolchain but Node", holds it from here on. |
| The catalog and the manual are built without the C toolchain | collection | `build-pipeline`, "Nothing is generated into the source tree" (the catalog is committed TypeScript, the help committed markdown) and "The app builds from a clean checkout with no toolchain but Node". |
| `puzzles/` does not survive the migration | obsolete | `puzzles/` is gone. The clause that still binds, no C source or C build system outside a change's `reference/`, is now a sentence and a scenario line of "A C source kept as a reading reference lives with its change". |
| "not in `puzzles/`" (A C source kept as a reading reference lives with its change) | obsolete | The directory it names does not exist. |
| The served help sources live under `help/` | collection | `repo-layout`, "Every help page the app serves lives under `help/`". |
| The upstream MIT notices live in `licenses/`, byte-identical | collection | `licensing`, "Upstream notices are kept byte-identical in licenses/", which also says they sit outside the source tree they cover and that the file names are this project's. |
| Scenario "A parity shortfall is not deferred silently" (Game work is accepted by exercising it, not by a green suite) | duplicate | Restates the requirement's last sentence; the scenario "A green suite is not sufficient" stays. |
| Scenario "A dialog-only change is verified where the suite cannot see it" (A shared declarative helper is adopted by every game it fits) | process | `AGENTS.md` § "Rules for every session": run the app before calling UI work done. `engine-params`, "No game ships an empty custom-params dialog", holds the empty case. |
| Scenario "A get/set round-trip is offered as the guard" (same requirement) | collection | `repo-layout`, "An assertion's two sides do not derive from the same value". |
| A game's params fields are not renamed to fit a helper | process | `docs/games/mechanics.md` § "The Custom dialog" ("passes the field map ... rather than being renamed to fit"), and `docs/doctrine.md` § "Convention over configuration". |
| A corrected tier gate retires or re-founds the game's differential | duplicate | "A rejecting generation gate is measured before it is adopted" (a gate is not refused for changing the boards, and the differential need not outlive it) and "Upstream's C is a readable reference, not a byte-oracle". |
| The params corpus is derived and guarded against vacuity | how | Which cases the corpus is built from is the header of `src/engine/testing/params-corpus.ts`. That it is derived was already in "Encoded params are byte-stable, and the guard is derived", which now also carries the vacuity guard and its scenario. |
| A field that is the length of another field is not perturbed alone | particular | One exclusion inside the corpus builder, explained where it is written in `params-corpus.ts`; only the corpus's own test consults it. |
| Scenario "A solver is converted to the shared deduction runner" (A difficulty-capped solver is monotone in its cap at every tier) | collection | `engine-helpers`, "A shared deduction-fixpoint scaffold": a converted solver reaches the same verdicts. The requirement already says one cross-game guard covers every game. |
| The cross-game guard holds every offered tier to generating or a refusal | collection | `engine-difficulty`, "An offered tier generates, or is refused with a reason", with "A game's tiers are read from its difficulty item" for which tiers are walked. |
