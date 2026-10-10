# Rules: colors-and-animation

## reword `engine-colors`: The solved flash is one role

The requirement said a flash drawn as a fill takes `FLASH` and excused only a
flash that is an animation. The code has a second fill: `givenSurface`, under
every cell on the flash's lit beats. Read in each game's `colors()` and
`redraw` (`src/games/*/render.ts`; Mines' palette is in `index.ts`): Pegs
(`COL_LIT`), Range, Palisade, Subsets, Unruly and Slant (`COL_GIVEN`), Separate,
Singles, Same Game and Light Up (`COL_FLASH`), Netslide (`COL_FLASHING`), Net
(`COL_LOCKED`) and Mines (`COL_COVERED`) all assign `givenSurface` to the slot
the flash fills with; Palisade and Separate reach it through `flash` of
`BorderGridColors` (`drawBorderTile`, `src/engine/border-grid-render.ts`).
`FLASH` is assigned by Crossing, Inertia, Magnets, Loopy, Pearl, Rome, Mathrax,
Sokoban, Seismic, Spokes, Undead, Unequal and Untangle. One game fills with a
third color and says why at the assignment: Tracks takes `GOAL`
(`src/games/tracks/render.ts`, the comment above `out[COL_FLASH]`). The title
changes because "one role" is no longer what it says; no source or guide cites
it (`spec-citations.mjs --list`). The list of animations moves into a
scenario, and names the wave of bevel colors that ABCD, Ascent and Salad run
and the blink between the bevel's two colors that Fifteen, Sixteen, Twiddle
and Slide give their tiles (`bgcolor` in the first three's `redraw`,
`FLASH_LOW`/`FLASH_HIGH` in Slide's). The reviewer read the flash path of every
registered game's `render.ts`; the rest hide content, swap states, cycle
colors, spin or wash under text, and Cube and Guess have no solved flash.

### Requirement: A solved flash drawn as a color takes a shared color

A completion flash drawn as a fill or line color SHALL take a shared color and
none of the game's own. A flash that lifts cells takes the lifted surface
(`givenSurface`) on its lit beats, a step off the cell that reads in both
schemes; any other takes the `FLASH` role, maximum contrast against the surface
and inverting with the scheme. A game that flashes to another color SHALL say
why at the assignment. A flash that is an animation and not a color keeps its
own mechanism.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** two games that flash their board to white on completion are resolved
  in either scheme
- **THEN** both flash colors are equal
- **AND** neither is the board's own color in that scheme

#### Scenario: A board that lifts its cells

- **WHEN** a game whose flash lifts its cells also draws givens
- **THEN** a cell on a lit beat is the color of the cell under a given, and the
  pieces and glyphs on it are drawn as on any other frame

#### Scenario: A flash that is not a color

- **WHEN** a game's flash swaps two states, hides its content, cycles its
  colors, spins its pieces, blinks its beveled tiles between their bevel's two
  colors, runs a wave of its bevel's colors across the board or washes the
  cells under their text
- **THEN** it takes neither color and owes no reason

#### Scenario: A flash along content that has spent the role

- **WHEN** a game's flash runs along ink lines over a bed in a hue of the pair,
  where `FLASH` is the lines' opposite in one scheme and close to the bed in
  the other
- **THEN** it takes another shared role, and the assignment says so

## not-shared a quiet-surface board flashes by lifting its cells

There is no line that divides the boards that lift from those that take
`FLASH`. Rome, Seismic, Mathrax, Unequal, Crossing and Sokoban each paint their
cells in `cellSurface` (their `colors()`), and Mathrax, Rome, Seismic and
Unequal hold `givenSurface` in the same palette, and all six fill the flash
with `FLASH`. So which of the two a board takes is the game's, the shared
requirement says only what each kind's color is, and every game keeps the
sentence that says its flash lifts and what it lifts (every cell, every slot,
a tile as a ripple passes, the cells with no piece, the field and its margin,
the lit squares).

## edit `range`: The Range completion flash lifts every cell

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color". That the pieces stand is Range's.

from: , a step that reads in both schemes,
to:

## edit `separate`: The solved flash lifts every cell

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color".

from: , a step that reads in both schemes
to:

## edit `subsets`: The completion flash lifts every slot

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color". That a slot keeps its letter or cross is
Subsets'.

from: , a step that reads in both schemes,
to:

## edit `netslide`: The completion flash lifts the tiles

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color". That it is the surface Net lifts to stays.

from: , a step that reads in both schemes
to:

## edit `palisade`: A finished region and the solved flash cover the clue cells

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color".

from: , a step that reads in both schemes
to:

## edit `slant`: The completion flash lifts the squares in three phases

The reason for the lifted surface is in `engine-colors`, "A solved flash drawn
as a color takes a shared color". The three phases are Slant's.

from: , a step that reads in both schemes
to:

## keep `pegs`: The completion flash lifts every cell

It says that Pegs' flash is of the lifting kind and that every playable cell
lifts with its peg or hole drawn on it. The shared requirement says only what
color a lifting flash takes, not which game lifts.

## keep `unruly`: Unruly draws a cursor outline and a completion flash

The cursor's outline, and that the flash is lit on its first and last frames.

## keep `singles`: Singles completion flash

Only the cells that hold no piece lift.

## keep `samegame`: Same Game's flash lifts the field and leaves the tiles

The field and the margin inside the frame lift, and the tiles do not.

## keep `mines`: Mines' flashes fill every square on their lit beats

The win lifts to the covered surface, a death fills in the error color, and
the trodden mine keeps it.

## keep `lightup`: Light Up's cursor and completion flash

Only the lit squares blink, in three phases.

## keep `net`: The completion flash ripples through the lifted surface

The ripple, and that the lifted surface is the one a lock gives.

## note Bridges flashes to a bevel highlight with no reason at the assignment

`src/games/bridges/render.ts`, `lineColor` and the island's rim: on a lit beat
a bridge and an island take `COL_HIGHLIGHT`, which `colors()` fills with
`mkhighlight`'s highlight. That is a line color that is neither `FLASH` nor a
wave, and nothing at the assignment says why. By "A solved flash drawn as a
color takes a shared color" it owes `FLASH` or a line of reason. A code
question for a session on Bridges; not acted on.

## note ABCD, Ascent and Salad sweep their bevel's colors as cell fills

Their flash fills cells with `mkhighlight`'s highlight and lowlight in a moving
stripe (`abcd/render.ts` `drawTile`, `ascent/render.ts` the `flash >= sn`
branch, `salad/render.ts` the `(x + y) % 3 === flash` branch). The reworded
requirement classes this with the animations, as the doc of `FLASH` in
`src/engine/color/palette.ts` does ("a bevel wave"). Fifteen, Sixteen and
Twiddle blink every tile between the same two colors, and Slide its floor
between its bevel's two. Crossing, Rome, Seismic and Mathrax run the same kind
of stripe with `FLASH` as its bright beat (Rome and Seismic with the cursor's
wash as the dim one, Crossing with its selection color and the lifted surface).
Whether the seven should take `FLASH` too is the owner's: it changes what a
player sees.

## note a flash on losing fills with a color no requirement names

The reworded requirement binds the solved flash. Flood's defeat fills every
tile with `COL_MARK`, which is `BLACK` for a reason about marks
(`src/games/flood/render.ts`, `BADFLASH`), and Mines' death and Inertia's
with `ERROR`. Mines states its own; nothing shared says what a losing flash
takes. Not acted on.

## add `engine-colors`

The shaded-alone use of the pair. `src/engine/piece.ts` declares
`SHADED_SHAPE`, `SHADED_NAME` and `UNSHADED_NAME`, and `palette.ts` declares
`SHADED` as `TWO[0]`. The population is the games that import `SHADED_SHAPE`:
Bricks, Mosaic, Pattern, Range and Singles (`render.ts` of each, drawn with
`drawPiece`). Boats, Dominosa and Sticks import `SHADED` alone, for a placed
thing, and are not of it. Pattern, Range, Singles and Mosaic import both words
(`hint-text.ts` and `index.ts` of each); Bricks imports `UNSHADED_NAME`
(`index.ts`) and calls its piece "shaded", never by a color, which the
requirement allows by binding only where a game names the color. Each of the
five help pages writes `{{pair:0}}` (`help/games/`), and the help guard that
refuses a typed pair name walks every page.
after: A game that uses the pair names no hue or shape of its own

### Requirement: Shaded or not is the pair's first member alone

The engine SHALL provide, for a game where a cell is shaded or is not, the
pair's first member alone: its color (`SHADED`), its shape (`SHADED_SHAPE`),
its word (`SHADED_NAME`) and one word for a cell known not to be shaded
(`UNSHADED_NAME`), which holds no piece. Such a game SHALL take the three by
reference wherever it names the piece's color or shape, SHALL call a cell
known not to be shaded by that one word, and SHALL name the color in its help
page by the pair's placeholder.

#### Scenario: Two games conclude a cell is not shaded

- **WHEN** a hint of one such game and a hint of another each conclude that a
  cell is not shaded
- **THEN** both sentences end on the same word

#### Scenario: A game that names the state and never the color

- **WHEN** such a game's sentences call its piece by a word of the puzzle, as
  "shaded brick", and say no color
- **THEN** it owes the piece's word nowhere, and its help page still names the
  color by placeholder

#### Scenario: Two states the player makes

- **WHEN** both of a game's states are ones the player makes, as lit and unlit
- **THEN** the game takes the two-state pair, and this requirement does not
  bind it

## cut `pattern`: Pattern names no hue of its own

`engine-colors`, "Shaded or not is the pair's first member alone", holds all of
it: Pattern's hint sentences, control words and legend take `SHADED_NAME` and
`UNSHADED_NAME` (`src/games/pattern/hint-text.ts`, `index.ts`), and its help
page writes the placeholder.

## cut `mosaic`: Mosaic names no hue of its own for either mark

`engine-colors`, "Shaded or not is the pair's first member alone", holds all of
it: Mosaic's hint sentences, control words and legend take `SHADED_NAME` and
`UNSHADED_NAME` (`src/games/mosaic/hint-text.ts`, `index.ts`), and its help
page writes the placeholder.

## reword `bricks`: Bricks names no hue

That Bricks names no hue, says the collection's word for a cell that is not
shaded and names the color by placeholder is `engine-colors`, "Shaded or not
is the pair's first member alone". What is Bricks' own is that it calls the
piece "shaded" and never by its color (`src/games/bricks/hint-text.ts`,
`index.ts`: no `SHADED_NAME`), and that its help page says the shape. The
title said what went, and the scenario restated the shared word.

### Requirement: Bricks calls its piece shaded and never by its color

Bricks' hint sentences and control words SHALL say "shaded" for the shaded
state and SHALL NOT say the piece's color, and its help page SHALL say the
piece's shape beside the placeholder for its color.

#### Scenario: A hint rests on a shaded cell

- **WHEN** a hint step reasons from a cell that is shaded
- **THEN** its sentence calls it a shaded brick and names no color

## edit `range`: Range draws a shaded cell as the collection's shaded piece

That the piece is in the shared color and shape is `engine-colors`, "Shaded or
not is the pair's first member alone".

from: , in its color and shape, inset
to: , inset

## edit `pattern`: Pattern draws its picture as shaded pieces and crosses on a quiet surface

That the piece is in the shared color and shape is `engine-colors`, "Shaded or
not is the pair's first member alone".

from: , in the shaded color and shape, inset
to: , inset

## note Bricks' hint types the word for a cell that is not shaded

`src/games/bricks/hint-text.ts` writes `it must stay clear` as a literal, where
`index.ts` of the same game takes `UNSHADED_NAME`. The player reads the same
word, so the shared requirement is true of it today; a change to
`UNSHADED_NAME` would leave the hint behind. The five help pages type "clear"
too, there being no placeholder for it. Not acted on.

## reword `engine-colors`: The figure the player steers takes the cursor's color

It read as true of every steered figure. The population, from the code, is
three: Sokoban's and Inertia's `COL_PLAYER`, both `CURSOR`
(`src/games/sokoban/render.ts`, `src/games/inertia/render.ts`), and Cube's
solid, whose plain faces are `givenSurface` (`COL_SOLID`) and whose faces that
have picked up a square are `MOVED` (`COL_PAINT`), a hue of the pair
(`src/games/cube/render.ts`, `colors` and the polygon draw of the solid). The
departure can be said without naming the game: a figure that shows on itself
what the player carries.

### Requirement: The figure the player steers takes the cursor's color

The figure the player steers SHALL take the cursor's color, which says where
the player is, and SHALL NOT take a hue of the two-state pair. A figure whose
faces show what the player carries is the departure: a face that carries
SHALL be `MOVED`, as the thing is on the board, and a plain face SHALL be the
lifted surface (`givenSurface`), so that the only hue on the figure is what
it holds.

#### Scenario: A figure beside the thing it pushes

- **WHEN** a game draws the figure the player steers beside a thing it pushes
- **THEN** the figure is the cursor role's color and the pushed thing is `MOVED`

#### Scenario: A solid that picks paint up

- **WHEN** a game's figure is a solid that takes paint from a square onto the
  face that lands on it
- **THEN** that face is the painted square's color, every other face is the
  lifted surface, and no face is the cursor's color

## keep `cube`: Cube draws the solid as the one object on the board

It says which of Cube's colors each part of the solid takes, and that its
edges are ink. The shared requirement says only that such a figure departs.

## note the line of reason `COL_SOLID` owes at its assignment

By `engine-colors`, "A departure from a shared role is stated at the
assignment", `ret[COL_SOLID] = givenSurface(defaultBackground);` in
`src/games/cube/render.ts` owes a line above it. Proposed:

`// Not CURSOR, though the solid is what the player steers: a face shows whether it carries paint, so a plain face is a surface, the lifted one, and paint is the only hue on the solid.`

What I found recorded: the doc comment on the `COL_SOLID` constant in the same
file, "A plain face of the solid, lifted: the one thing on the board that
stands above it", written with the assignment in commit `8e2ffcda`
(2026-10-07; `git log -S'COL_SOLID] = '`). It says why lifted, not why not the
cursor's green. No comment, guide or commit says that; `docs/games/rendering.md`
("The pair's hues are the board's content beyond two states") names Cube's
paint as `MOVED` and the steered figure as `CURSOR`'s green in one bullet and
does not name the solid. That a face must stay a surface so its paint can be
read is my reading. The cross-game palette guard does not look at a slot named
for a solid, so nothing fails today.

## add `engine-hints`

A hint-executed move plays its game's animation at one duration. The engine
does it for every game: `executeHint`'s `send` in `src/engine/midend.ts` sets
`pendingHintAnim` on the move `hintKeepTrack` calls `"completed"`, and
`setupAnimation` then sets the length to `HINT_ANIM_S` and `animScale` to that
over the game's `animLength`, or leaves both alone when `animLength` is 0;
`redraw` is handed `animTime / animScale`. The flash length is not touched.
`AUTO_HINT_STEP_MS` in `src/puzzle/puzzle.ts` is the dwell, and the loop waits
the longer of it and the animation. I searched `engine-hints` and
`engine-drawing` for "animat", "duration", "stretch", "slow": only a scenario
of "The toolbar Hint button alternates show and apply" says "in slow motion".
One game states it for itself, Unruly; the rule is shared because the engine's
code is what makes it true of every game.
after: executeHint supports a single-step (hide-after) mode

### Requirement: A hint-executed move plays its animation at one duration

The move that completes a hint step under `executeHint` SHALL play its game's
animation at one duration, the same for every game and equal to the time
auto-play dwells on a step, so that auto-play reads as continuous motion. The
game SHALL be handed animation time scaled back to its own `animLength`, and
so writes nothing for it. A move whose `animLength` is zero SHALL land at
once. The completion flash SHALL keep its own length.

#### Scenario: The same move by the player's hand

- **WHEN** the player makes by hand the move a hint step would have made
- **THEN** it plays at the game's own `animLength`

#### Scenario: A game that animates nothing

- **WHEN** a hint step is executed in a game whose `animLength` is zero for it
- **THEN** the board shows the move at once, and auto-play still dwells on the
  step before the next

#### Scenario: A step that takes two moves

- **WHEN** a hint step is played by two moves, and `hintKeepTrack` calls only
  the second `"completed"`
- **THEN** only the second is stretched to the shared duration, and the first
  lands with no stretch

## cut `unruly`: A hint-executed placement plays at the hint-step duration

`engine-hints`, "A hint-executed move plays its animation at one duration",
holds it for every game: the midend scales whatever `animLength` returns, and
Unruly's `animLength` is positive for a placement by `unruly`, "A placement
animates as a growing fill". Unruly writes no code for the stretch
(`src/games/unruly/index.ts`, `animLength`).

## not-shared a searched plan's several moves for one tile are one journey

It is false of Fifteen. Its `hint` (`src/games/fifteen/index.ts`) returns the
whole greedy solution as one step a slide, each narrated against the goal
tile the slides serve, and flags none `continuesPrevious`: the slides for one
tile are separate hints. Netslide flags every slide while the plan's focus
stays on one tile (`narratePlan`, `src/games/netslide/hint.ts`); Sixteen flags
only a second leg the first previewed, a slide perpendicular to the first that
lands the tile on the previewed cell (`narrateStep`,
`src/games/sixteen/index.ts`); Sokoban flags a barrel's run of pushes onto a
target and Pegs and Untangle have journeys of their own shape. What the
midend does with a flagged leg is already shared (`engine-hints`, "A journey
stays on screen through its legs"); when a searched plan flags one is each
game's. `engine-hints`, "One deduction firing is one journey", stays as it is,
for a derived plan.

## keep `netslide`: A subgoal of several slides is one journey

When a Netslide plan flags a leg: the next slide carries the same tile nearer.
No shared requirement says it.

## keep `sixteen`: A journey's second leg keeps its tile

When a Sixteen plan flags a leg, and the preview the first leg carries. No
shared requirement says it.

## note Fifteen's slides for one goal tile are separate hints

Sixteen and Netslide present the slides that serve one tile as one hint and
Fifteen presents each as its own (`src/games/fifteen/index.ts`, `hint`). If
that is a difference no player wants, it is one engine question for the
sliding games (a plan's run of moves toward one subgoal as a journey), and it
changes what a player sees, so it is the owner's. Not acted on.
