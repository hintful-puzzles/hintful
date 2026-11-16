# name-states-by-rule-not-color

Asked by the owner, 2026-11-16, playtesting Norinori: "we should use a
different word to 'purple' for squares that are 'filled' … my general
sensibility is that we should distinguish between rules of the game and our
choice of colors." Their answers the same day: a one-state game says
**"shaded"**, and a two-state game names its pieces **by their shape**.

## What says a color today

The words come from one place. `TWO_NAMES` (`engine/color/colors.ts`) is the
color words of the two-state pair, `wordOf(TWO[0])` and `wordOf(TWO[1])`;
`SHADED_NAME` (`engine/piece.ts`) is the first of them, and `UNSHADED_NAME`
is "clear". A help page names them by the placeholder `{{pair:0}}` and
`{{pair:1}}` (`expandPair`), and a description's `{shaded}` term reaches
`SHADED_NAME` through `engine/stated.ts`.

It was decided in `give-the-boards-a-visual-identity` (archived
2026-10-08): "Unruly's words follow the pieces", and the shading games'
"words say `SHADED_NAME`". The owner asked in the same change for themes to
be easy to add later, and a color word in a rule follows the theme: that is
the conflict this change removes. Who reads the promise: the player, in a
hint and on a help page. Nothing a save, a game ID or a link holds changes.

Find the speakers by the reference, never by the word: the importers of
`TWO_NAMES`, `SHADED_NAME` and `expandPair`, the descriptions that say
`{shaded}` or `{{pair:`. On 2026-11-16 the one-state games were Pattern,
Mosaic, Range, Singles, Bricks and Norinori, and the two-state games
Unruly, Clusters and Flip; Cube, Separate and Sokoban also say the pair.

## What this change does

- **One state**: the word is "shaded" ("This square must be shaded"; the
  opposite stays "clear"). It is what the genre's rules call it, and what
  the code already calls the state.
- **Two states**: each piece is named by its shape, which no theme changes.
  The pair is a square and a disc (`TWO_SHAPES`); "square" clashes with the
  board's own squares, so the square piece needs a word of its own
  ("block" is the first candidate). Show the owner the sentences of each
  two-state game before settling the word.
- The names stop being derived from the colors: the pair's words are
  declared beside its shapes, and a theme that changes a color changes no
  word. A guard keeps a hint from saying a color word for a piece.
- Hint snapshots and pins move in every game above; help pages change.

## Before it starts

- Take the population from the references above, not from this list.
- Read `docs/hints.md` for the vocabulary rules and the retired-phrase
  guard, which is the place a retired word belongs.
