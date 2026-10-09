# Cuts: puzzle-icons

Requirements: 8 before, 7 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The preferred procedure captures the icons in the dev server | duplicate | Folded into "Adding a new puzzle's icons is a manual screenshot workflow", which now carries the three steps and this requirement's scenario. Step 3's "correctly named and correctly sized" is "The capture bar re-rolls the board and captures both icons" |
| "The work SHALL NOT require a brew toolchain (GTK, ImageMagick, oxipng), nor any wasm or C build step", and the scenario "A new puzzle's icons are produced without a build toolchain" | obsolete | No C or wasm build is left in the tree, and `scripts/build-icons.sh` is deleted (`.gitignore` says so). The refusal that still binds is kept in general form: no icon-generation script or image toolchain |
| "The catalog card (`src/components/catalog-card.ts`) SHALL resolve … through `new URL(..., import.meta.url)`, and SHALL render them through `<img srcset>`" | how | The rule kept is which two files the card reads, and at which density; the scenario still names `srcset` |
| Scenario "A new puzzle is added to the catalog" (under "Per-puzzle thumbnail icons are committed PNGs") | duplicate | Scenario "A cataloged puzzle lacks an icon" of the same requirement: the same failure of the same test |
