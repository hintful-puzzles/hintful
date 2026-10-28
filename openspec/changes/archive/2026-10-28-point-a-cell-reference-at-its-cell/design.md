# Design

## What was seen (2026-10-28, `28f86147`)

On the proposal's board the step reads "No way to make this cage multiply to
4 puts 4 in this cell, so the 4 must go". "this cell" and "the 4" are two
pills of one color, and the only mark on the cell is the X on the 4.

The cause is one function. A candidate game's premise names its cell with
`thisCell`, a ring on the cell. `struckCellsByStrikes`
(`src/engine/candidate-plan.ts`) then redrew that ring as the strikes the step
makes. Its stated reason was `make-rings-round` D6: a grid of notes leaves no
room for a round ring round the cell. So "this cell" and "the 4" became the
same mark on the same notes, and the app measures a reference by the pixels
its mark draws (`hintReferenceMarks`). Both references were the X.

Every strike step in a candidate game whose premise names the cell it strikes
in goes through that function. That covers the games that build on
`candidate-plan.ts`: `npm run refs -- src/engine/candidate-plan.ts
runCandidatePlan` and the `runLatinCandidatePlan` callers. The guard (D3)
counts the steps.

## D1. The owner's choice: the cell takes an outline (2026-10-28)

Three marks were shown in the app on the proposal's board:

- a round ring on the cell at rest. `keep-rings-off-a-cells-numbers` D2 has
  every cell lay out its text to leave room for a ring, so D6's reason no
  longer holds;
- the same ring drawn only while the pill is pressed;
- a square outline on the cell, in the engine's outline role.

The owner declined both rings: *"I would avoid having another reason for a
ring, separate from the 'ringed' references."* A ring keeps one meaning,
what the step decides. Of the owner's other two suggestions, a colored
highlight is ruled out by `hints-marks.md` § "Why a fill cannot work,
whatever color it is". The owner chose the outline role: the cell a strike's
premise names is outlined, and its pill takes the outline's color. The X on
the struck note is unchanged, and D6 stands: no ring is drawn round a struck
note.

The outline already means "what the step reasons from", and the cell is
exactly that: the premise reasons about what can go in it. So no fifth role
is needed. The struck notes are marked by their strikes alone. The legends
that said a strike also marks "the cell they are in" now say instead that an
outline marks the cell whose notes a step reasons about.

## D2. Where the change is made

The premise keeps the cell reference the game wrote, and the walk redraws its
ring as an outline on the same cell. The game's words are still the place a
reference is made, and a game that writes `thisCell` in a strike premise
gets the outline without saying anything. The walk is also the only place
that knows a step strikes notes in that cell. A placement's "this cell" keeps
its ring, because there the cell is what the step decides.

## D3. The rule is made unbreakable, not swept for

The proposal asked for a guard on where a pressed cell reference's leader
ends. No test tier knows where a game draws a cell, so that guard would need
per-game layout. The defect has two sources, and the engine now refuses both:

- **A remark changes the role, never the kind.** `Narration.remarked` takes a
  role. Swapping a cell reference for the notes inside it can no longer be
  written.
- **A deictic never names the container of what it marks.** `mark.this` and
  `mark.the` refuse a kind drawn inside another (`MarkKind.within`). A note
  or a letter's slot is named by its value ("the 4", "A"). Undead's struck
  cell (`mark.this("strike", NOTE, …, "cell")`) and Subsets' cell
  (`mark.this("ring", SLOT, …, "cell")`) were the same defect written in the
  game, and both now outline the cell, as D1 does.

A broader drawing-tier guard was tried first: "no two references in other
words take the same marks". It flagged legitimate re-naming of one mark
("this square … so that square must hold a star") in eight games, so it was
dropped.

## D4. A role's word singles its mark out (owner, 2026-10-28)

Outlining the cell makes some sentences say "outlined" while two different
things are outlined. A census over every hinting game (two boards per gate
preset, up to 80 steps each, 2026-10-28) found 473 strike steps naming their
cell. Eighteen of them also had another reference saying "outlined": every
Rome loop strike ("The outlined arrow in the square below points back to
this square"), and the wing in Solo and Towers ("an outlined cell in line
with this cell"). Subsets' "This cell's set lies inside the outlined cell's"
does the same once its cell is outlined.

The owner chose to reword them: such a sentence names the other outlined
thing by its position or value, and each reference stays its own pill in its
own color. `referenceDefects` (`src/engine/testing/hint-reference.ts`), which
the hint-quality walk runs on every step, holds the rule. A reference that
says its role's word ("the outlined arrow") must be the only reference in that
role and kind in its sentence, apart from references to the same elements.

## D5. Two joined outlines are measured as two

Rome joins any two adjacent outline cells into one contour. When the app
hides one reference to measure its marks, the other cell's shared side
appears. The measure took any pixel that changed, so it credited that side to
the hidden reference, and at rest the board showed a strip in the wrong color
where nothing is drawn. `referenceAlpha` (`src/puzzle/mark-flash.ts`) no
longer counts as a reference's mark a pixel that the hint inks cover *more*
without it. This applies to any two adjacent outline references, in every
game.

## D6. A striped reference's leader

Checked in the app (2026-10-28), no stripes reference had a leader: not
Keen's "this cage", and not Undead's new "this cell". `nearestMarked` only
looked at pixels at least half covered, and stripes are drawn at
`HATCH_OPACITY`, 0.3. They have been measured at that coverage since the inks
began to be measured by coverage, so no pixel of theirs qualified. The
threshold is now half the reference's own strongest pixel. That is still 128
for a ring or an outline, and it reaches the bands of the stripes.
