# Verdicts: engine-drawing

## keep `engine-drawing`: The engine provides a shared rectangle-outline drawing helper

The doc comment on `drawRectOutline` in `src/engine/draw.ts` gives the
inclusive corners and nothing else. The rule that a game calls the helper
rather than inlining four `drawLine` calls is in no comment, no guard holds it
(`bevels.test.ts` counts bevel helpers only), and
`docs/games/engine-catalog.md` § "`draw.ts` — shared drawing primitives" only
lists the name. The spec is the one place that rule is stated, and it stands
beside the same rule for the three bevel helpers and the glyph helper.

## keep `testing`: A game's render test records through the shared recording drawing

Now in `testing`. `docs/games/testing.md` § "Render-op vocabulary" says to
prefer the shared recorder because a local one "is a second vocabulary to
misremember", which is a different reason from this requirement's: a
hand-rolled double records only the calls its author anticipated, so a game
that starts or stops drawing something leaves the test green. No file under
`src/` holds a `GameDrawing` double today (the only implementers are
`RecordingDrawing` and the real `Drawing`), and that is the state this rule
keeps; a session writing a render test checks against it.

## keep `engine-drawing`: The comparison shows a hint and walks its plan to the end

A rule the guard exists to hold, and one of six requirements that together say
what a pass of `src/engine/warm-repaint.test.ts` answers for. `docs/games/rendering.md`
§ "A tile paints only its own box, and tiles that share pixels repaint
together" says the same of the run, but as an account of what it does and how
to read its report. A session shortening the walk for speed needs to know that
painting the win frame is required and the frames between are not.

## keep `engine-drawing`: A mark the seeded run does not paint is reached from a pinned board

The same guide section carries the pin rule, but three things here bind a
change to the test and are checked against, not followed as method: a pin is
the board and never a seed, a pin the seeded run has caught up with fails, and
a cross-tile mark that is not a hint mark is pinned in the game's own tests.
`PINNED` and `UNREACHED` in `src/engine/warm-repaint.test.ts` are the ledgers
it describes, and "Every hint mark a renderer asks for is painted by some run"
depends on it for what "a pinned board" is.

## keep `engine-drawing`: A game starts on a fresh draw state

Distinct from "The midend lays the ground under a fresh draw state's first
frame", which says what a fresh draw state gets and that only building one
arms the ground. This says a new game, a game id and a loaded save each build
one (`freshDrawState` at the start of a game in `src/engine/midend.ts`), and
no other requirement does: the umbrella names three signals that a draw state
is stale, and they are a tile-size change, `canvasCleared` and `forceRedraw`.
Without it nothing forbids carrying the previous board's cache into a loaded
save.

## keep `engine-drawing`: A game draws its beveled frame through the recessed-border helper

The right home, as worded. Its guard sentence says "a bevel of the helpers'
shape that no call to a shared helper drew" and its scenario names "a
two-triangle or a two-pentagon bevel", so it already speaks for the raised-tile
helpers, and that matches `src/puzzle/bevels.test.ts` ("a bevel is drawn by the
shared helper"), which counts calls to `drawRaisedTile`, `drawRaisedBevel` and
`drawRecessedBorder` against the bevels found by shape. "A game draws a raised
tile through the shared helper" states its own rule and is read beside this
one; moving the guard sentence there would only trade which of the two points
at the other.

## note the cut of "A repaint cue belongs in the tile cache before a sidecar" holds

Confirmed as `process`. `docs/games/rendering.md` § "A cue with a tile
available belongs in the tile key, not in a second cache" states the whole
preference with its reason and its exception (a cue with no tile to live in),
and it was a SHOULD about how a renderer is written, with no engine behavior
or guard behind it. What is a contract, that a per-cell overlay goes through
the shared sidecar, is still "A per-cell overlay reaches the render cache
through the shared sidecar".
