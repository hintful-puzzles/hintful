# Findings: writing Star Battle in one session

The log `proposal.md` § "This is also the measurement" asks for, written as
the work went on 2026-10-12. The game was written whole in one session:
state, solver, generator, input, drawing, hint, tests, spec, help page,
icons, and a run in the browser.

## Questions that were not about Star Battle

Each is a thing the session had to find out that the engine, the skeleton or
the index could have answered. In the order they came up. A line marked
**mended** was answered in a guide in this change.

1. **The skeleton is a rectangle; the game is a square.** `dims` and
   `dimensionParamConfig` had to become `size`, `numberItem` and
   `squareSize`, and `transposeDimensions()` had to become
   `notApplicable: { transposeParams: SQUARE_GRID }`, all found by grepping
   another square game (Towers). **Mended**: `docs/mechanics.md` § "What
   every game does" now says the three places.
2. **Does a division dealt by the engine have one answer? No**, and this
   decided the generator's whole shape. The figures are in `design.md` §
   "The generator". The archived design of
   `own-region-division-in-the-engine` left it open. **Mended**:
   `docs/solver-and-generator.md` § "A division into regions is the
   engine's".
3. **`redivide.ts` mends only regions of one size.** The catalog's row read
   as the helper for any mend, and the file had to be opened to learn
   otherwise. **Mended** in the catalog's row. Moving one cell between
   unequal regions while both stay connected is written in the game (30
   lines, `sparable` and the move in `mend`).
4. **`answer-search.ts` was the search the generator needed, and it is
   filed under "a deductive game's Unreasonable tier".** A first row search
   was written and thrown away before the catalog's row was read past its
   title. `solvedPositions` serves any generator that wants a second answer,
   tier or no tier.
5. **`encodeRegionWalls` takes a `Dsf`, and a region once joined cannot
   give a cell back**, so a generator that edits regions keeps them as
   numbers and builds a `Dsf` again to write the desc (`joinedCells`).
6. **Which mark role does a named row or region take?** The skeleton has a
   ring and an outline only. That a unit a sentence names is striped, and
   that two regions in one sentence take two shapes, was found in
   `docs/hints-marks.md`, and how to draw stripes by reading Rome.
7. **`OverlaySidecar.pack` cannot be used by a game with no notes.** It asks
   the words for ringed notes, and `warm-repaint.test.ts` then holds the
   game to painting one. The skeleton's own way (adding bits by hand) has
   no lane for an outline's sides. **Mended** as a note in
   `docs/hints-marks.md` § "Where the band goes, and who rubs it out"; the
   engine fix is a `pack` that takes the kinds a game has.
8. **`verbClicks` takes the first button the game's keep-track does not
   refuse**, so a keep-track that allows the first press of a two-press
   cycle makes the gesture stop one click short. Three guards failed with
   the same message before the cause was read out of `target-verb.ts`.
   **Mended** as a note in `docs/hints-marks.md` § "A journey completes leg
   by leg".
9. **What a first run of `npm run game` asks that is not the game**: the
   legend's `stripes` role, the help page's "Where the puzzle comes from"
   heading, the row in `help/puzzles.md`, the icons, and two recorded tables
   to add a row to. The stamp's checklist names four of the six; the legend
   role and the origins heading it does not.
10. **The catalog had no value for a game written here.** `collection` is
    now `original`, `unreleased` or `own`. The table of upstream params
    strings in `params-read-whole.test.ts` could again be required of every
    game that is not `own`, but the table lives in an engine test and the
    catalog is above the engine, so it would first move to a module both can
    read. Not done here.
11. **The mutation guard refuses a scratch edit by `sed` or a heredoc**, as
    it should, and each time cost a turn. A scratch census is a throwaway
    vitest file, written with the editor.

## What the engine should own, in the order this game priced it

1. **Mending a division until it has one answer.** Everything in
   `generator.ts` from `otherAnswer` to `mend` except the ladder call is not
   about Star Battle: find a second answer, move a cell that breaks it, keep
   connectivity and a least size, climb on the cells left open. It took the
   largest share of the session and three fifths of a deal's time. A second
   game with regions as its only clue would copy it whole.
2. **A `pack` for games without notes** (finding 7).
3. **A gesture that knows a press cycle** (finding 8): `verbClicks` could
   prefer the button whose click completes or shrinks the step.
4. **A square-grid skeleton, or a switch on the one there is** (finding 1).

## Tokens by phase

Read from the session's own log in ten-minute buckets, so the phases are
approximate where two overlapped. "New" is input not served from cache plus
output. The context stood at about 500,000 tokens when the game first passed
its whole verdict, and new tokens to that point were about 680,000.

| Phase | New tokens, about |
| --- | --- |
| Reading: the change, the route, the skeleton, the guides' sections | 120,000 |
| State, rules and solver | 80,000 |
| Generator, with its measurements | 190,000 |
| Input and drawing | 60,000 |
| Hint | 70,000 |
| Tests | 40,000 |
| Spec and help | 30,000 |
| Verification, the browser and the guards' refusals | 90,000 |

The generator cost most, nearly all of it measuring: five census runs to
learn that boards were not unique, then to choose a mend, then to place the
tiers. Reading was a sixth of the whole, against the half measured before
the series began.

## What was left

- **The deal is slow past 10x10** (`design.md` has the table). The menu
  stops where a board takes about a second. Three fifths of the time is the
  search for a second answer, run again on every kept move.
- **Three stars deal only as Easy**, and slowly above 12x12.
- **The first hints after a star are its crosses**, up to four steps a star
  with one star to a row. They are short and true, and a player who wants
  the next real deduction steps through them. An aid that crosses those
  squares for the player would remove them; it is a preference, and the
  owner's to ask for.
- **The upstream-params table** (finding 10).
