# Verdicts: engine-colors

## keep `engine-colors`: A palette may carry its own per-scheme decisions

The per-index report is not one internal seam. `Midend.darkPalette` crosses the
worker boundary as a member of the engine surface (`src/puzzle/engine-surface.ts`,
`worker-adapter.ts`, `puzzle.ts`) before `components/view.ts` reads it, and
`src/puzzle/scheme-palettes.ts` rebuilds the same per-index record for the
dark-scheme guards. The sentence that reads as how is the constraint a session
would otherwise undo: a token's dark value is an own property of its array and
structured clone drops it (`src/engine/color/color-token.ts`), so sending the
tokens themselves loses every authored dark value without an error.

## keep `engine-colors`: The hint emphases stay distinguishable in both schemes

The number stays. `src/engine/color/palette.test.ts` holds exactly these five
roles more than 0.12 apart in each scheme, so the spec and the guard agree, and
the distance is the decision a session editing a hint color checks against. The
neighbor-contrast requirement says "a stated distance" because its floor is one
constant applied to every game's frames; this one is a threshold chosen for one
named set, and without the figure the requirement says only "distinguishable".

## keep `engine-colors`: The acted-on hint color outweighs the evidence fill

The factor of two is what `palette.test.ts` measures in both schemes, and it is
the footing of the solid-against-wash exemption that `engine-hints`, "A
narration never identifies an element by its color", leaves to this spec. Its
reason clause is the one place the two are tied together, so it stays whole.

## cut `engine-colors`: A pair that is close on purpose is recorded

duplicate: "Colors a game paints side by side stand apart in the dark scheme"
states both halves. Its body says a close pair is "entered as close on purpose
with what carries the shape instead", and its scenario "A pair that is close on
purpose" says the guard "holds an entry for that pair saying so, and fails when
a pair is close with no entry, or an entry's pair is no longer close". A pair
the game stops painting is a pair no longer close, since
`src/puzzle/neighbor-contrast.test.ts` compares the close pairs read off the
frames with the ledger's keys for equality. The stale-entry half is a rule a
session checks a change against (a palette whose indices moved fails on it),
and it survives in that scenario.

## keep `engine-colors`: The two-state pair is two colors, two words and two shapes

"Indexed alike" is a contract and not a description of three arrays. The
shared roles take members by position (`SHADED`, `MOVED` are `TWO[0]` and
`GOAL` is `TWO[1]` in `src/engine/color/palette.ts`; `SHADED_SHAPE` and
`SHADED_NAME` are index 0 of `TWO_SHAPES` and `TWO_NAMES` in
`src/engine/piece.ts`), the help placeholder resolves a member's word by its
index there, and "A game that uses the pair names no hue or shape of its own"
says a game takes "the pair's members by index". That requirement relies on
this one for the promise that one index means one member in all three.

## keep `engine-colors`: A dark-scheme palette swap keeps its bevel lit from one side

Both this and the next survive in the regrouped spec; the fold the entry
describes did not happen. The against-the-surface claim is a held rule, though
held narrowly: `src/puzzle/dark-palette.test.ts` states it as the claim its
swap tests make and measures highlight above base and lowlight below base for
each of Slide's materials in both schemes, and holds every other declared pair
to order only. A guard measuring less than the rule is no reason to drop the
rule, and the second half, that a swapped index measured against the board
compares a highlight with a lowlight, is a trap no test records.

## keep `engine-colors`: A bevel a game draws is lit from one side in both schemes

The rule the guard holds is the first sentence, pair order across the schemes,
and `src/puzzle/bevels.test.ts` measures exactly that on every bevel it finds
by shape. The "so that" clause gives the purpose and is not a second claim: a
dark scheme that inverts lightness and keeps the pair's order leaves the
highlight above its surface. The requirement's other two rules (held by
drawing and not by declaring; a bevel color also used as a tint takes its own
slot) are what a session adding a bevel reads.

## note the against-the-surface measurement covers one game

`src/puzzle/dark-palette.test.ts` checks a highlight against its own base only
in "slide's board". Every other `darkSwaps` trio and every bevel in
`bevels.test.ts` is held to the order of its two colors, never to the surface
between them. If the rule of "A dark-scheme palette swap keeps its bevel lit
from one side" is to be guarded for the collection, `bevels.test.ts` already
has each bevel's two fills and would need the face index beside them.
