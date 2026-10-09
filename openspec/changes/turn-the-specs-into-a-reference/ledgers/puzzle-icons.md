# Ledger: puzzle-icons

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Per-puzzle thumbnail icons are committed PNGs

| Rule | Where it went |
| --- | --- |
| Two committed PNGs per cataloged puzzle in `src/assets/icons/`, named `<puzzleId>-64d8.png` at 64×64 and `<puzzleId>-128d8.png` at 128×128 | spec: Per-puzzle thumbnail icons are committed PNGs |
| For every catalog `puzzleId` both files are present and tracked in git, and the directory is a committed snapshot, not a generated one | spec: Per-puzzle thumbnail icons are committed PNGs |
| The two files are the only icon-asset shapes the home-screen catalog reads | spec: The catalog card reads only the two icon files |
| The catalog card resolves the 64 file as 1× and the 128 file as 2× through `new URL(..., import.meta.url)` and renders them through `<img srcset>` | spec: The catalog card reads only the two icon files |
| The `d8` suffix is preserved in the filename for path stability | spec: The d8 suffix stays in the icon filenames |
| The suffix is a legacy of the earlier ImageMagick-quantized 8-bit-indexed pipeline | history |
| New icons MAY be PNG24 without changing the suffix | spec: The d8 suffix stays in the icon filenames |
| Nothing under `src/assets/` is generated, it holds committed files only | spec: Nothing under src/assets is generated |
| `.gitignore` carries no rule for any directory under `src/` | spec: Nothing under src/assets is generated |
| The icons were once the committed exception beside a generated manual tree, which went with the manual | history |
| Scenario: every catalog id is asserted to have both files, and the failure names the missing path | spec: Per-puzzle thumbnail icons are committed PNGs |
| That scenario names the test file and the command that runs it | history |
| Scenario: a new catalog entry without its pair of files fails the catalog-completeness test | spec: Per-puzzle thumbnail icons are committed PNGs |
| Scenario: the contributor produces the icons through the manual screenshot workflow before merge | spec: Adding a new puzzle's icons is a manual screenshot workflow |
| Scenario: `src/assets/icons/` is not gitignored, and no directory under `src/` is ignored as generated output | spec: Nothing under src/assets is generated |

## Adding a new puzzle's icons is a manual screenshot workflow

| Rule | Where it went |
| --- | --- |
| A contributor produces the two PNGs by running the app, capturing a representative screenshot of the puzzle canvas and resizing it to the two sizes | spec: Adding a new puzzle's icons is a manual screenshot workflow |
| No brew toolchain (GTK, ImageMagick, oxipng) is required | spec: Adding a new puzzle's icons is a manual screenshot workflow |
| Preferred step 1: register in `src/games/index.ts`, add the catalog entry to `src/puzzle/catalog-data.ts`, run `npm run dev` | spec: The preferred procedure captures the icons in the dev server |
| Step 1 used to require building the puzzle's C into wasm | history |
| Preferred step 2: open the puzzle with the `screenshot` param, accept the default preset, re-roll with New game until representative | spec: The preferred procedure captures the icons in the dev server |
| The dev server's address is `http://localhost:5173` | figure |
| Preferred step 3: Capture icons downloads the two correctly named, correctly sized PNGs | spec: The preferred procedure captures the icons in the dev server |
| Scenario: registering and cataloging the game is enough to open it in the dev server, with no wasm or C toolchain step | spec: Adding a new puzzle's icons is a manual screenshot workflow |

## Dev-only screenshot capture mode

| Rule | Where it went |
| --- | --- |
| The `screenshot` query param, in a development build, hides the header and footer chrome and shows only the canvas and a minimal capture bar | spec: Dev-only screenshot capture mode |
| In a production build the param has no effect | spec: Dev-only screenshot capture mode |
| The capture bar offers New game, to re-roll the board, and Capture icons | spec: The capture bar re-rolls the board and captures both icons |
| Capture icons captures the live canvas, center-crops to the largest centered square, downscales to 64×64 and 128×128 and downloads both under the exact filenames the icons directory requires | spec: The capture bar re-rolls the board and captures both icons |
| Scenario: capturing the default-preset board in a dev build downloads the two files, each a centered-square downscale | spec: The capture bar re-rolls the board and captures both icons |
| Scenario: the param is inert in production, with the normal screen and no capture bar or behavior | spec: Dev-only screenshot capture mode |
