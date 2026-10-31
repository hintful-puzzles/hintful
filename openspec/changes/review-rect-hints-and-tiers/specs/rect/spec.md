## REMOVED Requirements

### Requirement: Generation: An Easy Rectangles board is one the hint finishes

**Reason**: Easy is now the plainer three of the hint's rungs, and a board
the rest finish is Normal; its scenario's board is one of those.

**Migration**: "Generation: An Easy or Normal Rectangles board is one the
hint's rungs of its tier finish" holds both tiers.

## MODIFIED Requirements

### Requirement: Params: Rectangles' parameters and their encoding

Params SHALL be `w`, `h`, the ruleset, `expandfactor`, a non-negative float
that defaults to 0, and the difficulty. They SHALL encode as `{w}x{h}`, a
`p` for Patches and nothing for Rectangles, then in the full form only an
`e{%g}` suffix for a non-zero expansion factor and the difficulty, `de`, `dn`
or `du`. A bare `{n}` SHALL decode as a square of that side, and an ID with no
difficulty letter as Easy. A grid of area less than 2 SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` at Unreasonable are
  encoded in full
- **THEN** the result is `10x10e0.5du` and decoding it round-trips the params

#### Scenario: A string from before the tiers

- **WHEN** `9x7`, written before the game had tiers, is decoded
- **THEN** the params are Easy, and their full encoding is `9x7de`

#### Scenario: Normal has a letter of its own

- **WHEN** params of a 7×7 board at Normal are encoded in full
- **THEN** the result is `7x7dn`

#### Scenario: The short form drops the expansion factor

- **WHEN** params `{ w: 7, h: 7, expandfactor: 0.5 }` are encoded in the short
  form
- **THEN** the result is `7x7`

#### Scenario: A grid of one square is refused

- **WHEN** params of a 1×1 grid are validated
- **THEN** they are refused with an error string

#### Scenario: The Patches ruleset round-trips

- **WHEN** `6x6pdu` is decoded and encoded in full
- **THEN** the result is `6x6pdu`, and `6x6du` decodes to Rectangles

### Requirement: Params: Rectangles' menu offers its two largest sizes at Easy alone

Rectangles' menu SHALL be the grid `presets` builds from its sizes
(`engine-params`, "The preset menu is a grid"). Under Rectangles each size
SHALL be offered at Easy and Unreasonable, and the two largest, 15×19 and
19×19, at Easy alone; no line SHALL be Normal. Under Patches, 7×7 SHALL be
offered at every tier, 6×8 at Easy and Normal, and 9×12 at Normal.

#### Scenario: The menu's twelve lines

- **WHEN** Rectangles' preset menu is read
- **THEN** its first five Rectangles sizes each appear as Easy and then as
  Unreasonable, and 15×19 and 19×19 follow as Easy

#### Scenario: Patches' six lines

- **WHEN** the Patches section of the menu is read
- **THEN** 7×7 appears as Easy, Normal and Unreasonable, 6×8 as Easy and
  Normal, and 9×12 as Normal

### Requirement: Generation: Rectangles deals only boards its hint can finish

At Easy and Normal the generator SHALL deal only boards the hint's rungs of
that tier finish from an empty board, and at Normal only boards Easy's rungs
do not, dealing again where a board it laid out falls outside them. The desc
of a seed for which upstream deals such a board SHALL differ from upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator, dealing an Easy board, lays out a uniquely solvable
  board Easy's rungs cannot finish
- **THEN** it draws another board instead of returning that one

#### Scenario: A board of the tier upstream's seed dealt

- **WHEN** each seed upstream's generator was recorded on is dealt at the tier
  its recorded board needs
- **THEN** the desc and the `aux` are upstream's, byte for byte

### Requirement: Generation: A Patches board hides what its clues need not say

Under Patches each clue SHALL first name its rectangle's shape and size. The
generator SHALL then hide each clue's size, and then widen each clue's shape
to plain, in a random order, keeping each change only where the board's tier
still holds: Easy's rungs finish it, then at Normal every rung does, or at
Unreasonable the search still proves one answer.

#### Scenario: A dealt Patches board hides some sizes

- **WHEN** Patches boards are dealt at 6×6, 7×7 and 8×8, at every tier
- **THEN** each has exactly one answer, its tier is the one asked for, and
  some clue on it shows no number

### Requirement: Hint: Rectangles' hint tries its five deductions plainest first

At each step the hint SHALL give the first that fires of its five deductions,
in this order: a clue with one fit, a square only one clue's fits reach,
squares another clue is sure to cover, a fit that would leave no room, and
last a line. It SHALL look across the whole board for one before it tries the
next, and SHALL take no Normal deduction while an Easy one fires.

#### Scenario: A line is the last resort

- **WHEN** some clue has one fit left and some edge could also be drawn as a
  line
- **THEN** the step draws the clue's rectangle

#### Scenario: An Easy board's plan is Easy's deductions

- **WHEN** the hint's plan for a dealt Easy Patches board is read
- **THEN** no step leaves a clue no room or draws a line

## ADDED Requirements

### Requirement: Generation: An Easy or Normal Rectangles board is one the hint's rungs of its tier finish

Easy SHALL solve a board exactly where the hint's Easy rungs, a clue with one
fit, a square one clue reaches and squares another clue is sure to cover,
finish it from an empty board, and the search proves it has one answer.
Normal SHALL add the rungs that leave a clue no room and draw a line. Neither
asks whether the solver reaches a unique placement.

#### Scenario: A board only the hint finishes is Normal

- **WHEN** `7x7:b4c2b3a2_2a2b3c4a4b3_6b6h4e2a2a` is entered, a board the
  hint's rungs finish, Easy's do not, and the solver stalls on
- **THEN** it opens as Normal

#### Scenario: A board the solver finishes and the hint does not is Unreasonable

- **WHEN** `9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` is entered, a board the
  solver settles by ruling placements out that no line can record
- **THEN** it opens as Unreasonable

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the hint does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Hint: A Rectangles hint names a clue with no number by what it shows

A step's words SHALL name a clue with no number by its shape and "clue" ("the
tall clue"), or a plain one as "the ? clue". A line step ruled out for
missing a square SHALL say that only the crossing clue reaches it. Where two
clues a sentence names read alike, the second SHALL be "the other" one.

#### Scenario: A plain clue in a sentence

- **WHEN** the hint's plans on dealt Patches boards name a clue that shows a
  question mark
- **THEN** each names it "the ? clue"

#### Scenario: A line for a square only one clue reaches

- **WHEN** the only fits across an edge are one clue's, and each leaves out a
  square no other clue reaches
- **THEN** the words are "Only the outlined N can cross this edge, and it
  would miss the outlined square only it reaches, so the edge is a line."
