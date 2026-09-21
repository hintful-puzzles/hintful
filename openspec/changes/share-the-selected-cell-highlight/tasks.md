# share-the-selected-cell-highlight — tasks

**Nothing here is started.**

## 1. Take the population by shape, before designing

- [ ] 1.1 Find every game that draws a selection highlight, keyed on the
      **shape** and not on a name: a `COL_HIGHLIGHT` fill of a cell rect, and a
      three-point polygon in `COL_HIGHLIGHT`. Fifteen `render.ts` files
      reference both `COL_HIGHLIGHT` and `pencilMode` (2026-09-21) — classify
      what that catches rather than narrowing the scan, which is the error
      `AGENTS.md` § "A scan that keys on a name" names.
- [ ] 1.2 Read the geometry of each. Solo, Keen and Undead are byte-identical
      in intent (full rect; triangle with half-tile legs from the top-left
      corner); the question is which of the rest **differ**, and whether each
      difference is about the puzzle or is an accident. A game that legitimately
      differs is a genuine decision and keeps its own drawing.
- [ ] 1.3 Record any game whose highlight is *not* a cell — Map is one, and
      there may be others.

## 2. Decide the contract

- [ ] 2.1 Does the shared renderer take a **cell**, or a **shape the game
      supplies**? A cell covers eleven games today and excludes Map for ever;
      a shape covers Map and costs every caller an argument it does not need.
      A third option is a cell-shaped default with a region-shaped override —
      which is only worth it if the override is used by more than Map.
- [ ] 2.2 What does the triangle mean where a cell is not square, or where the
      top-left corner is occupied? The pencil-mode *indicator* already had to
      answer the neighboring question (`pencilIndicatorCanvas` grows the canvas
      on every side); do not re-answer it differently here.
- [ ] 2.3 Where does the renderer sit relative to the tile cache? Every one of
      these games folds the highlight into its packed cell key so the old cell
      repaints when the highlight leaves. A shared renderer that draws outside
      that key would leave a highlight behind — `docs/games/rendering.md`
      § "A cursor is usually a cache key, not a blitter" is the rule, and its
      **exception** (Spokes' partial clear) is the trap.

## 3. Extend the pair to the games that have neither

- [ ] 3.1 **Map.** Behavior first: does it adopt `pressNoteTakingCell`, or keep
      its own press handling? Its right button is a *real gesture* — a
      right-drag from a color onto a blank region toggles a pencil bit — so
      the mechanic's "right press toggles notes" collides, and the collision
      must be **derived from what the game does with the button**, never from a
      list. `ignoresSecondaryButton` is the existing precedent for deriving
      exactly this, and `engine/testing/input-probe.ts` already asks the
      question behaviorally.
- [ ] 3.2 **Map's picture.** Whatever §2.1 decided, the outcome is that the
      selected *region* is unmistakable — which the present ring is not on a
      blank region, where its fill is the board background. If a region outline
      is drawn, note that `add-map-hint` needs the same thing for its marks:
      solve it once.
- [ ] 3.3 Any other game §1.3 found.

## 4. Prove it changed nothing where nothing should change

- [ ] 4.1 Tier-2.5 render snapshots for the eleven games that already behave
      correctly, **taken before the refactor** and expected to be byte-identical
      after. A shared renderer that shifts a highlight by a pixel is a
      regression in eleven games at once, and the snapshot is the only thing
      that would notice.
- [ ] 4.2 Verify the bulk edit **by shape, not by a green suite**: assert every
      changed line in the diff is the one intended kind of change, then read the
      exceptions.
- [ ] 4.3 Watch the new guard fail: break the triangle's geometry deliberately
      and see a game go red.
- [ ] 4.4 Run the app — every game §1 found, both modes, both color schemes.

## 5. Record

- [ ] 5.1 `docs/games/rendering.md`: the highlight pair, and where it sits
      relative to the tile cache.
- [ ] 5.2 `docs/games/engine-catalog.md`: the entry currently titled "the
      pointer half" stops being only the pointer half.
- [ ] 5.3 The spec delta, including the derived rule for a game whose secondary
      button is already spoken for.
