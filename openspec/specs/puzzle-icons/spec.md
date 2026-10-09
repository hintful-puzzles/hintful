# puzzle-icons Specification

## Purpose
The per-puzzle thumbnail icons the catalog shows: committed PNGs rather than a
generated asset, the manual screenshot workflow a new puzzle follows to add its
pair, and the dev-only capture mode that workflow uses.

## Requirements

### Requirement: Per-puzzle thumbnail icons are committed PNGs

The repository SHALL hold two committed PNG files for every cataloged puzzle
in `src/assets/icons/`: `<puzzleId>-64d8.png`, which is 64×64, and
`<puzzleId>-128d8.png`, which is 128×128. For every `puzzleId` in the catalog
(`src/puzzle/catalog-data.ts`) both files SHALL be present and tracked in git:
the directory is a committed snapshot, not a generated one.

#### Scenario: A cataloged puzzle lacks an icon

- **WHEN** a puzzle is in the catalog and either `<puzzleId>-64d8.png` or
  `<puzzleId>-128d8.png` is absent from `src/assets/icons/`
- **THEN** the test suite fails
- **AND** the failure names the missing file's path

#### Scenario: A new puzzle is added to the catalog

- **WHEN** a contributor adds a puzzle to `src/puzzle/catalog-data.ts` and
  provides no matching pair of files in `src/assets/icons/`
- **THEN** the test suite fails on catalog completeness

### Requirement: The catalog card reads only the two icon files

The two files SHALL be the only icon-asset shapes the home-screen catalog
reads. The catalog card (`src/components/catalog-card.ts`) SHALL resolve
`<puzzleId>-64d8.png` as the 1× image and `<puzzleId>-128d8.png` as the 2×
image through `new URL(..., import.meta.url)`, and SHALL render them through
`<img srcset>`.

#### Scenario: A card renders its icon

- **WHEN** a catalog card renders for a `puzzleId`
- **THEN** its image's `srcset` offers the 64×64 file at 1× and the 128×128
  file at 2×
- **AND** it reads no other icon file for that puzzle

### Requirement: The d8 suffix stays in the icon filenames

Both filenames SHALL keep the `-d8` suffix, for path stability. The suffix
SHALL NOT bar a PNG24: a new icon that is a PNG24 SHALL carry the same suffix
as any other.

#### Scenario: A new icon is a PNG24

- **WHEN** a contributor captures a new puzzle's icons and they are PNG24
- **THEN** the files are still named `<puzzleId>-64d8.png` and
  `<puzzleId>-128d8.png`

### Requirement: Nothing under src/assets is generated

`src/assets/` SHALL hold committed files only, with no generated tree beside
the icons. `.gitignore` SHALL NOT ignore `src/assets/icons/`, and SHALL carry
no rule for any directory under `src/`.

#### Scenario: Icons are not gitignored

- **WHEN** a contributor inspects `.gitignore`
- **THEN** `src/assets/icons/` is not ignored
- **AND** no directory under `src/` is ignored as generated output

### Requirement: Adding a new puzzle's icons is a manual screenshot workflow

A contributor adding a puzzle to the catalog SHALL produce its two PNGs,
before merge, by running the app, capturing a representative screenshot of the
puzzle canvas and resizing it to the two required sizes. The work SHALL NOT
require a brew toolchain (GTK, ImageMagick, oxipng), nor any wasm or C build
step.

#### Scenario: A new puzzle's icons are produced without a build toolchain

- **WHEN** a contributor adds a puzzle and needs its icons
- **THEN** registering the game and adding its catalog entry is enough to open
  it in the dev server
- **AND** no wasm or C toolchain step is involved

### Requirement: The preferred procedure captures the icons in the dev server

The preferred procedure SHALL be, in order:

1. Register the puzzle in `src/games/index.ts`, add its catalog entry to
   `src/puzzle/catalog-data.ts`, and run `npm run dev`.
2. Open `/<puzzleId>?screenshot` in the dev server, accept the default preset,
   and re-roll with **New game** until the board is representative.
3. Activate **Capture icons**, which downloads the two PNGs, correctly named
   (`<puzzleId>-64d8.png`, `<puzzleId>-128d8.png`) and correctly sized.

#### Scenario: The contributor follows the procedure

- **WHEN** a contributor has registered and cataloged a puzzle, opened it with
  the `screenshot` param under `npm run dev` and re-rolled to a representative
  board
- **THEN** activating **Capture icons** downloads `<puzzleId>-64d8.png` and
  `<puzzleId>-128d8.png`, ready to commit to `src/assets/icons/`

### Requirement: Dev-only screenshot capture mode

The puzzle page SHALL accept a `screenshot` URL query param that, in a
development build (`import.meta.env.DEV`), puts the screen into a capture
mode: the normal header and footer chrome is hidden, and only the puzzle
canvas and a minimal capture bar are shown. In a production build the param
SHALL have no effect: the page renders exactly as it does without the param.

#### Scenario: Capture mode in a dev build

- **WHEN** a developer opens `/<puzzleId>?screenshot` on `npm run dev`
- **THEN** the page shows the puzzle canvas and the capture bar, with no
  header and no footer

#### Scenario: Param is inert in production

- **WHEN** the production build serves `/<puzzleId>?screenshot`
- **THEN** the normal puzzle screen renders (header, footer, interactive
  view) with no capture bar and no capture behavior

### Requirement: The capture bar re-rolls the board and captures both icons

The capture bar SHALL offer a **New game** action, which re-rolls the board
toward a representative state, and a **Capture icons** action. **Capture
icons** SHALL capture the live canvas, center-crop it to its largest centered
square, downscale that square to 64×64 and to 128×128, and download both
results as PNGs named `<puzzleId>-64d8.png` and `<puzzleId>-128d8.png`, the
exact filenames `src/assets/icons/` requires.

#### Scenario: Capturing the default-preset board

- **WHEN** a developer opens `/<puzzleId>?screenshot` on `npm run dev`
- **AND** the default-preset board has rendered
- **AND** the developer activates **Capture icons**
- **THEN** two PNG files download: `<puzzleId>-64d8.png` (64×64) and
  `<puzzleId>-128d8.png` (128×128)
- **AND** each is a centered-square downscale of the puzzle canvas
