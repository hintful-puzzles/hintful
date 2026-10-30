# Tasks

## 1. Design

- [x] 1.1 Decide the help sections' fields in the schema, and how a shared sentence (a control scheme) is referenced (`design.md`)
- [x] 1.2 Write the spec deltas (`help-pages`, `build-pipeline`, `latin-solver`, `unequal`, `repo-layout`, `project-identity`) and remove `skip_specs`

## 2. Pilot on Unequal

- [x] 2.1 The loader reads YAML and validates it against the schema (strings refused where a formula or prose is expected); convert the Latin library and Unequal's two descriptions, and Towers' and Solo's beside their games; the compiled modules change only in their provenance line, and the soundness verdicts only in their keys
- [x] 2.2 Move Unequal's help page into its description, word for word, and build the page from it
- [ ] 2.3 Run the app and read Unequal's page; hand it to the owner

## 3. Every game

- [x] 3.1 Move each other game's page into a description, word for word, credits verbatim: rendering each back gives the page byte for byte, up to a trailing blank line, and the build's 65 help pages are byte-identical before and after
- [x] 3.2 Retire `help/games/` and what of `help-coverage.test.ts` the renderer now holds; the skeletons, `new-game.sh` and `select-tests.ts` follow; read a sample of pages in the app
- [x] 3.3 Update `docs/help-pages.md` and `docs/descriptions.md`, the other guides, README, CREDITS and the next change's facts

## 4. Close

- [ ] 4.1 Archive once the owner has read Unequal's page; `show-how-to-play-on-first-open` can then start
