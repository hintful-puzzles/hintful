# bind-the-remaining-hints — design

The pilot's `design.md` (`archive/2026-09-29-bind-hint-words-to-marks`) is the
how; this file records what the sweep decided on top of it.

## D1. A recolored clue is an outline, not a fourth role

Pattern, Light Up and others recolor a clue digit rather than draw a mark
beside it. The recolor is a *glyph*, and the role is what the clue is to the
step: a clue the step reasons from is evidence, so it is an outline, whatever
color the game paints it. Two recolored clues in one step are told apart by
their nouns ("this row's clue", "column 3's clue"), as Signpost tells its two
rings apart by kind. A game that needs its own element for a clue slot outside
the grid defines a kind for it (`MarkKind`), as Signpost defined `ARROW`.

What the guide's table called "clue digit, action color" and "clue digit,
evidence color" were two glyphs for one role, and nothing a player reads
depended on the difference being a role: the sentence always named the clue.

## D2. Evidence that was "ringed" becomes outlined

The owner's decision (pilot proposal): a ring is what the step decides.
Unruly, among others, drew its evidence as a ring in the reference color and
said "the ringed row". Its words now say "outlined", and its highlight fields
are renamed from `ring` to `outline` so the code uses the role's word. The
glyph is unchanged: nothing in this change moves painting.

## D3. One step, one ringed element, whatever the sentence covers

A whole-line fill is a journey of one leg per cell, and each leg rings its own
cell. The sentence names that cell ("so this cell and every other empty one in
it must be white") rather than binding "every remaining cell" to one ring,
which is the Salad count-marker defect the pilot left open.

## D4. A keep-track shrink narrows the words

A game that shrinks a step when the player makes part of it (`hint-track.ts`)
rebuilds the step's highlights; it now narrows the words with them
(`Narration.narrow`) and resets `explanation` to the narrowed text, as the
candidate walk's refresh does. The binding walk does not play keep-track, so
such a game's own test asserts `bindingDefects` is empty after a shrink (Tents,
Pattern, Singles).

## D5. "Shaded" is a rule word, not a retired mark word

The pilot retired "shaded" with "hatched" and "highlighted", because Light Up
once called its evidence "the shaded squares". But Bricks' rules shade cells
("each shaded cell must have one below it"), and a hint speaks the rules'
words, so the lint would have pushed Bricks' hint away from its own help.
"Shaded" leaves the retired list; the binding walk still catches a shaded
*mark*, because a mark nobody names as a reference fails rule 3. Singles
changed its hint's "shaded" to "black", which is what its rules already said.

