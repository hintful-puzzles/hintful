# Proposal: refuse-a-bare-here

## Why

The owner could not follow a Path hint (2026-10-23): "A cross here would
force the numbered edges…, so this edge must be a line". "Here" pointed at
the ringed edge, but was plain words, not a pill. `docs/hints.md` already
says "never a bare 'here'", but nothing enforces it. The construction-time
lint in `engine/hint-words.ts` refuses a literal "this" and "these" outside a
reference, and nothing refuses "here" or "there". An audit of every sentence
builder found the same shape in a dozen games, nearly all from one template:
the edge skeleton's supposition, which Path copied ("a line here would…").
Path's and the skeleton's were fixed in `add-zip-to-path`.

## What Changes

- The `phrase` lint refuses a literal "here", and a "there" that names a
  place, outside a reference, as it refuses "this" and "these". "There is",
  "there are", "there's" and "there would be" are not places and still build.
  A call site the tests reach is then checked for good, which is the
  "pre-commit" the owner asked for: the gate's hint walks reach every rung.
- Every site the lint refuses is reworded so the place it points at is a
  pill, the way Path's now reads "A cross on [this edge] would…, so it must be
  a line". Audit of 2026-10-23, to be re-run when the lint lands:
  - A supposition's "a line / bulb / bridge / ball here would…", where the
    pill comes later in the sentence: Loopy, Pearl, Bridges, Black Box, Light
    Up, Salad, Rome, Towers, Sticks (eight sites), Tracks.
  - A "there" or "here" after a pill, pointing back at the place it names:
    Tents, Signpost, Slide, Dominosa, Netslide, Salad, Subsets, Ascent,
    Clusters.
  - "here" meaning "in this puzzle" (Palisade, Same Game) and Cube's and
    Inertia's "from here" (the player's piece, which no mark shows): reworded
    to say what they mean.
- The shared Latin sentence's "the 4 must go from the other cells there"
  (`engine/hint-text.ts`, so Group, Keen, Mathrax, Unequal, Salad and Solo
  and Towers through `dupWhere`) names an unmarked row and column, and is
  reworded with them marked or named.
- Sentences that point at an unmarked thing with a pronoun, which the lint
  cannot see, are fixed by hand: Solo's "the rest of it", Mines' "the squares
  they share" and "those squares'", Group's "its row and column", Unruly's
  "every other empty one in it", Slant's "as one already slants away from
  it", and Mosaic's "the left one's".
- No change to what a hint deduces, only to its words.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-hints`: a requirement that a literal "here" or place-naming
  "there" outside a reference refuses to build.

## Impact

- `src/engine/hint-words.ts` (the lint), `docs/hints.md` § "Bind the words
  to the marks".
- The hint-text files of the games above, and their pinned-sentence
  snapshots, which move with the words.
- A call site no test reaches would throw in play, as one saying "this"
  does today; the hint walks reach every rung (`hint-quality.test.ts`).
