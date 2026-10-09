# Cuts: licensing

Requirements: 15 before, 13 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The upstream notices sit outside the source they cover | duplicate | Folded into "Upstream notices are kept byte-identical in licenses/", which now says the top-level `licenses/`, not inside the source tree, and why |
| "The upstream notices are reachable from the app": the sentence that a move or rename repoints the `?raw` import in the same commit, and the scenario "A rename repoints the imports" | type | The imports in `src/dialogs/about-dialog.ts` are resolved by the build, which the gate runs: a notice moved without its import does not build |
| The notice check refuses an implausibly short listing | process | `docs/method.md` § "Count what the check looked at": count the inputs and assert the count. `assertNoPlaceholders` in `vite-plugins/dependency-notices.ts` does so, and its test pins it |
