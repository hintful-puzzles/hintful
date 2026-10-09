# engine-colors Specification

## Purpose
The colors every game paints with: that a game holds no color value and takes
a meaning before a named color, how a color is authored or adapted for the
light and dark schemes, what a game declares about its own palette, the look
of a board of pieces and the two-state pair, and the distances the guards hold
the collection to in both schemes.

## Requirements

### Requirement: The bevel trio comes from the shared mkhighlight helpers

The engine SHALL provide the bevel trio once. `mkhighlightBackground` shifts a
background lying too near pure white or pure black away from that extreme,
treating one within rounding drift of an extreme as lying on it. `mkhighlight`
returns that background with a highlight shifted toward white and a lowlight
shifted toward black, each saturating at its extreme when the background is
too near it. A game SHALL take the shift and the trio from these helpers and
SHALL NOT re-derive either locally.

#### Scenario: A game derives its palette from the shared helper

- **WHEN** a game's `colors()` method calls `mkhighlight(defaultBackground)`
- **THEN** it receives a background, a highlight strictly brighter than it and a lowlight strictly darker than it
- **AND** the game contains no local copy of the highlight and lowlight math

#### Scenario: Light host backgrounds get a pure-white highlight

- **WHEN** the host background is white or near-white
- **THEN** the background is shifted away from pure white, so that a pure-white tile color is visibly brighter
- **AND** the highlight saturates to pure white and does not collapse into the adjusted background

### Requirement: Adapting a color to another scheme preserves its relation to the board

A calculated per-scheme value SHALL preserve the color's relationship to its
own background: a color close in lightness to the background in one scheme
SHALL be close to the background in the other, and a color far from it SHALL
stay far from it, so that a subtle tint of the board never becomes a prominent
area of color purely because the scheme changed. This SHALL hold regardless of
how colorful the color is: grays and chromatic colors SHALL NOT be adapted by
different principles.

#### Scenario: A near-background tint stays near the background

- **WHEN** a color close in lightness to the game's background is adapted to the
  opposite scheme
- **THEN** it remains close in lightness to that scheme's background

#### Scenario: Text and fills keep their order

- **WHEN** a color drawn as text or a thin line, and a color drawn as a large fill,
  are both adapted to a dark scheme
- **THEN** the text color is lighter than the fill color it may be drawn over

#### Scenario: A tint behaves as a gray of its lightness does

- **WHEN** a gray and a chromatic color of one lightness are adapted to the dark
  scheme by calculation
- **THEN** the two land at one lightness

### Requirement: A palette may carry its own per-scheme decisions

The engine SHALL report to the frontend, per palette index, any decision a
palette entry makes about its own behavior when the color scheme changes. An
entry carries one where that behavior is a property of the color's meaning and
not of the game showing it. Reporting per index is required because the
association between a color and its meaning cannot be assumed to survive
transfer to the frontend. An index that reports none SHALL be adapted by calculation.

#### Scenario: A color's own decision is applied

- **WHEN** a palette entry states that it must not be adapted, and the game
  declares no exchange for that index
- **THEN** the frontend paints the value the entry stated and does not adapt it
  by calculation

### Requirement: A game's declared exchange holds over an entry's own decision

The exchange a game declares for its palette (`darkSwaps`) SHALL be applied
after every index has its dark value, whether the entry stated that value or
it was calculated, so that a game whose board needs different treatment can
still state it.

#### Scenario: A declared exchange wins

- **WHEN** a palette entry states its own dark value, and the game also declares
  an exchange for that index
- **THEN** the index is painted in its partner's dark value

### Requirement: A color that means "this piece is black or white" is distinct from ink and paper

The engine SHALL distinguish a color used as maximum-contrast foreground or
surface (grid lines, glyphs, text, a white cell background) from a color used
to say a game object is black or white (a black peg, a black mine, the filled
squares of a two-color game). The two SHALL NOT share a role: foreground and
surface colors SHALL invert with the scheme, so that text stays readable
against the surface it is drawn on, while a piece's black or white is the
game's own meaning and SHALL be preserved.

#### Scenario: Ink inverts so text stays readable

- **WHEN** a color used for grid lines, glyphs or text is resolved for a dark scheme
- **THEN** it is light enough to read against that scheme's surface

#### Scenario: A black piece stays black

- **WHEN** a color whose meaning is that a game object is black is resolved for a dark
  scheme
- **THEN** it remains black, since inverting it would tell the player the piece is
  the other color
- **AND** the game requires no declaration of its own to keep it black

### Requirement: A shared role is an absolute color or a function of the background

A role SHALL be declared in one of two forms, chosen by whether it must
survive the app's dark-mode adaptation: an absolute color, for a role whose
purpose is to be unmistakable regardless of the board (the error color); or a
function of the frontend background, for any role that must stay legible
against the board. The second is required, not stylistic: the app
supplies pure white as the host background in dark mode, so a fixed pale
color that reads in light mode can land on the board there.

#### Scenario: A role that must stay legible is derived from the background

- **WHEN** a background-derived role is resolved against a light host background and
  against the pure white the app supplies in dark mode
- **THEN** the resulting color is visibly distinct from the board in both cases

### Requirement: A color is a shared role only where two games mean the same by it

A color SHALL be a shared role only where two or more games mean the same
thing by it; a hint role (`HINT_ACTION` and its siblings) owes one game, since
the hint vocabulary settles its meaning. A color one game derives for its own
board SHALL be declared in the engine's table of game-local colors, under a
name that begins with the game's id; a named color a game takes directly is
not in that table. A member of a set told apart from its other members SHALL
NOT be a shared role.

#### Scenario: A game-specific color stays game-specific

- **WHEN** a color is derived for one game's board only
- **THEN** it is declared game-local under that game's id, so the declaration is a
  recorded decision and not an omission
- **AND** the suite fails when another game imports it

#### Scenario: A role one game is left holding

- **WHEN** a shared role outside the hint vocabulary is taken by one game, or by
  none
- **THEN** the suite fails and names the role and the game

#### Scenario: The evidence fill has one game

- **WHEN** one game alone has evidence cells that hold nothing, and fills them
  with `HINT_EVIDENCE_WASH`
- **THEN** the fill stays a shared role, and the distances the hint roles owe
  each other are measured with it among them

### Requirement: A game contains no color value

A game SHALL NOT contain a color value. Every color a game shows SHALL be a
named reference to a shared color token, or the result of a shared function
whose inputs are such tokens or the background the game was handed, the form
for a color relative to another: a bevel highlight to its surface, a ramp to
its endpoints. A game SHALL NOT read a channel of the background or combine
colors itself. A scheme SHALL therefore be restyled or added in the token
table alone, with no change to any game.

#### Scenario: An undeclared color fails the suite

- **WHEN** a game's source gains a color written as a value
- **THEN** the suite fails, naming the file and the line
- **AND** it passes once the color is a reference to a role, a named color or a
  declared game-local color

#### Scenario: A relative color is derived from tokens

- **WHEN** a color's meaning is defined relative to another color, such as a bevel
  against its surface
- **THEN** it is produced by a shared function
- **AND** it is not authored as an independent value per game

#### Scenario: A scheme is added

- **WHEN** a new color scheme is introduced
- **THEN** it is defined by giving tokens their values for that scheme
- **AND** no game source is modified

### Requirement: A game's palette depends on nothing but the frontend background

A game's palette SHALL depend on nothing but the frontend background: no game
computes a color from its parameters or its state. A game that picks which
token to draw with by its state is selecting, not computing, and this
requirement does not forbid it.

#### Scenario: A state picks between two tokens

- **WHEN** a game draws a cell in one color or another according to its state
- **THEN** both colors are entries of the one palette built from the background
- **AND** the palette is the same for every parameter set and every position

### Requirement: A color token defines a value per color scheme

A color token SHALL state its value for each color scheme the app offers,
chosen for what the token means to the player under that scheme and not
converted from another scheme's value by a general formula. A token that
leaves a scheme's value unstated SHALL be adapted by calculation, so that
schemes can be authored incrementally. A token's name SHALL describe its
meaning, not its appearance, since its appearance differs between schemes.

#### Scenario: An unstated scheme value falls back

- **WHEN** a token does not state a value for the active scheme
- **THEN** its value is calculated from a scheme it does state
- **AND** the game renders correctly

### Requirement: The collection's colors are a small named set

The colors the collection uses SHALL be a small named set, sized by what the
games demonstrably need to distinguish and not by how many colors happen to
have been written. A color SHALL NOT be added to it because one game wants a
shade; a game that needs a color the set does not have SHALL record what it
means to the player and why no existing color serves.

#### Scenario: A color the set does not have

- **WHEN** a game needs a color no existing meaning or named color provides
- **THEN** the reason is recorded with the color: what it means to the player, and
  why nothing in the set serves

### Requirement: A game references a meaning, or a named color that is the meaning

Every color a game shows SHALL be a reference to a meaning (an error, a hint,
a completed clue), except where the color itself is the meaning: a member of a
set whose job is to be told apart from the other members, or a color the game
names to the player.

#### Scenario: A set member is taken by name

- **WHEN** a game colors the members of a set the player tells apart
- **THEN** it references the set's named colors, and no meaning

### Requirement: A meaning holds no value of its own

A meaning SHALL be defined in terms of a color from the named set and SHALL
hold no value of its own, so that changing a color changes every meaning built
on it. Two kinds of meaning are outside this: ink and paper, which are adapted
by the scheme and so cannot be named colors, and a meaning that is a function
of the background.

#### Scenario: A meaning resolves to a named color

- **WHEN** the meaning for something being wrong is resolved
- **THEN** it is a color from the named set, by reference
- **AND** restyling that color restyles the meaning

### Requirement: A named color's name is true

Where a color is referenced by name and not by meaning, the name SHALL
describe the color as a player would, under every color scheme. A scheme that
gives such a color another value SHALL give it another shade of the same
color; it SHALL NOT change it into a color a player would give another name. A
name reaches the player: a hint that says "fill with yellow" is making a claim
about the board.

#### Scenario: A hint names a color

- **WHEN** a hint's explanation refers to a color by name
- **THEN** the color that name resolves to is recognizably that color in the
  active scheme

#### Scenario: A scheme restyles a named color

- **WHEN** a scheme gives a named color a different value
- **THEN** the value is a different shade of the same color
- **AND** every explanation that names it is still true

### Requirement: A set of colors meant to be told apart is designed as a set

Colors a game relies on to distinguish items SHALL be mutually distinguishable
in every scheme, and that SHALL be a property of the named set and not of any
one game that draws from it. It is a relation between members, so no rule
applied to a single color, adapting it to a scheme included, establishes or
preserves it.

#### Scenario: A scheme is added or changed

- **WHEN** a color scheme is introduced or restyled
- **THEN** the members of the named set remain distinguishable from one another
- **AND** this is verified by measurement, not by inspection

### Requirement: The hint emphases stay distinguishable in both schemes

Hint-role colors SHALL stay distinguishable in each scheme, not only in light.
Every pair among the acted-on color (`HINT_ACTION`), the evidence
(`HINT_EVIDENCE`), the evidence drawn as a fill (`HINT_EVIDENCE_WASH`) and the
two premise references (`HINT_BLACKREF`, `HINT_WHITEREF`) SHALL stay more than
0.12 apart in OKLCH in each scheme.

#### Scenario: A scheme's hint colors converge

- **WHEN** a color edit brings two hint roles within 0.12 in either scheme
- **THEN** the palette guard fails, naming the pair and the scheme

### Requirement: The acted-on hint color outweighs the evidence fill

The acted-on hint color SHALL carry more than twice the chroma of the evidence
fill in each scheme. A narration ties two marks together in words only where
the marks differ by something other than hue, and a solid acted-on color
against a wash qualifies because it differs in weight, the cue left to a
reader who cannot compare hues.

#### Scenario: The acted-on color loses its weight

- **WHEN** the acted-on hint color's chroma falls to twice the wash's or below,
  in either scheme
- **THEN** the palette guard fails, because the narration's exemption for
  solid-against-wash marks no longer holds

### Requirement: A dark-scheme palette swap keeps its bevel lit from one side

For every bevel trio a game exchanges via `darkSwaps`, the highlight SHALL be
lighter than the surface it sits on and the lowlight darker, in both schemes.
This is a relationship to that surface and not to the board: a measurement of
a swapped index against the background SHALL NOT be read as stating it, since
the two indices of a pair denote different roles in the two schemes and such a
measurement compares a highlight with a lowlight.

#### Scenario: A bevel survives the scheme flip

- **WHEN** a game's bevel trio is resolved for the light scheme and for the dark scheme
- **THEN** in each scheme its highlight is lighter than its base and its lowlight is darker

### Requirement: A declared swap keeps its pair in one order across the schemes

For every pair a game declares in `darkSwaps`, whatever its two colors are,
the lighter of the two in the light scheme SHALL be the lighter of the two in
the dark scheme. A swap exists because inverting every color's lightness turns
an emboss into an inset. Both indices of a pair SHALL exist in the game's
palette and differ in lightness, and no index SHALL be named by more than one
pair.

#### Scenario: A pair keeps its order across the schemes

- **WHEN** a declared pair is resolved for the light scheme and for the dark scheme
- **THEN** the color that is lighter in one is lighter in the other
- **AND** this fails for every declared pair when the exchange is not applied

### Requirement: Every game's board sits at one tone

The engine SHALL hand a game's `colors()` a background already shifted off
pure white and pure black, from a single resolution point (`resolvePalette`)
that whatever paints a board for a player goes through. The color a game
paints its board with SHALL resolve to the same value across the collection
for a given host background, whether or not the game's own `colors()` calls
`mkhighlight`: on the backgrounds the app hands, a game that calls it SHALL
get back the background it received.

#### Scenario: A raw-background game and a mkhighlight game paint one board

- **WHEN** a game that assigns the background it receives as its board, and a
  game that assigns `mkhighlight(...).background`, are both resolved against pure
  white
- **THEN** the two board colors are equal

#### Scenario: Every registered game paints the collection's board

- **WHEN** every registered game's palette is resolved against pure white and
  against the light host
- **THEN** the color at each game's board index equals the shifted host in both
  cases
- **AND** the check looks at every game the app lists and fails if the shift did
  not fire

#### Scenario: A tinted host the app does not hand

- **WHEN** a background that is not gray, and lies within the shift's reach of
  white or black, is shifted and then shifted again
- **THEN** the second result MAY differ from the first in a channel's last
  binary place, which is the bound of the equality: the app hands pure white
  and one gray, and for those the two are the same value

#### Scenario: A test that names the colors of a draw record

- **WHEN** a test calls a game's `colors()` with a background of its own, to
  label what a recorded frame drew
- **THEN** it paints no board for a player and is not held to the resolution
  point

### Requirement: A ruled-out edge is discernible in both schemes

The shared "ruled out" role (`lineNoColor`) SHALL resolve to a color a clear
step off the board in both schemes, a mid gray, and SHALL remain visibly
distinct from the completed-region fill (`REGION_DONE`) it may be drawn
across, so that a player, and in particular a keyboard player whose cursor
walks the edges, can see where a ruled-out edge lies while still reading it as
disabled and not drawn.

#### Scenario: A ruled-out edge stands off a dark board

- **WHEN** the role is resolved for the dark scheme against the collection's
  board
- **THEN** its lightness stands off the board's by more than a step that reads
  as board
- **AND** it remains darker than ink

#### Scenario: A ruled-out edge across a completed region still shows

- **WHEN** the role and `REGION_DONE` are resolved against the same
  board in either scheme
- **THEN** the two are visibly distinct

### Requirement: The solved flash is one role

A game whose completion flash is drawn as a fill or line color SHALL take that
color from the shared `FLASH` role, which is maximum contrast against the
surface and inverts with the scheme. A game whose flash is an animation and
not a color (a bevel wave, a state swap, a color cycle, a wash under text)
keeps its own mechanism and is not covered by this requirement.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** two games that flash their board to white on completion are resolved
  in either scheme
- **THEN** both flash colors are equal
- **AND** neither is the board's own color in that scheme

### Requirement: A departure from a shared role is stated at the assignment

Where the shared palette defines a role for a meaning a game's color carries
(the keyboard cursor, a held or dragged item, a flagged mistake, a hint's
action or evidence, a black or white piece, a retired clue, a correctly
completed region), the game SHALL assign that role. A game that assigns a
different color for that meaning SHALL state, on or immediately above the
assignment, why its board has spent the role's color.

#### Scenario: A game whose board has spent the cursor's green says so

- **WHEN** a game assigns its keyboard-cursor slot a color other than the shared
  cursor role
- **THEN** the assignment carries a one-line reason naming what the role's color
  is already used for on that board

#### Scenario: A slot whose name says what it means

- **WHEN** a slot named for a cursor, a held or dragged item, a hint or a
  mistake is assigned another color with no reason beside it
- **THEN** the suite fails and names the file, the line and the slot

#### Scenario: A meaning no slot name says

- **WHEN** a game gives another color to a retired clue, a completed region or a
  black or white piece
- **THEN** no cross-game check finds it, because a slot's name is all that says
  what a slot means, and the names these meanings go by are used for other
  things in other games
- **AND** the reason is owed all the same

### Requirement: Colors a game paints side by side stand apart in the dark scheme

Two palette colors that a game's sampled frames paint next to each other
SHALL stand a stated distance apart in the dark scheme as the app paints it,
or be entered as close on purpose with what carries the shape instead. Two filled areas SHALL owe that distance outright. A thin mark or a
glyph SHALL owe it only where the light scheme gives the same pair more than
twice its dark distance. The pairs SHALL be read off the game's own draw
record, so a game is covered by being registered.

#### Scenario: A pair that is close on purpose

- **WHEN** two neighbors stand closer than the distance and something else
  tells them apart, as a white pearl's black outline does on the loop, or the
  shadow edge of a lifted tile does for its lit edge
- **THEN** the guard holds an entry for that pair saying so, and fails when a
  pair is close with no entry, or an entry's pair is no longer close

#### Scenario: The frames a game is sampled on

- **WHEN** the guard reads a game's neighbors
- **THEN** it reads two frames at the game's default parameters: the board as
  dealt, and the board some hint steps in where the game has a hint
- **AND** a color only a drag, a mistake, the solved flash or a hint's own
  marks bring out is on neither, and is not measured

#### Scenario: Two colors that meet at a corner

- **WHEN** two areas or marks touch along fewer than a handful of pixels on a
  frame
- **THEN** the pair is a corner and not a boundary, and owes no distance

#### Scenario: A wall that sinks into the floor fails

- **WHEN** a movement game's wall and floor are painted as adjacent areas
- **AND** the wall's dark value stands closer to the floor than the stated
  distance
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A quiet grid line passes

- **WHEN** a grid line stands closer to its cell than the stated distance in the
  dark scheme, and the light scheme gives the pair no more than twice its dark
  distance
- **THEN** the guard does not fail on the pair

#### Scenario: One color under two indices

- **WHEN** two palette indices hold one color in both schemes, and a frame
  paints them side by side, as areas or as marks
- **THEN** the pair owes no distance, being one role under two names

### Requirement: A pair that is close on purpose is recorded

A pair of side-by-side colors that is closer in the dark scheme than the
stated distance on purpose SHALL be recorded with what it is, one entry per
pair, and an entry whose pair is no longer close SHALL fail.

#### Scenario: An excused pair that stops being close fails

- **WHEN** a recorded pair's dark distance rises above the stated distance, or
  the game stops painting the pair
- **THEN** the guard fails until the entry is removed

### Requirement: A lightness a help page names is pinned in the game's palette

A game whose help page calls something black, shaded, white or lit SHALL hold
in its palette a color that is dark, or light, in both schemes by its own
authored values, so that the word stays true when the scheme changes. A
palette that holds the `SHADED` role answers a page that says shaded. A page
whose word is not about a piece's color SHALL be recorded with what the word
is about, and a record for a page that no longer uses the word SHALL fail.

#### Scenario: A lit square drawn in paper fails

- **WHEN** a help page tells the player to light up the squares
- **AND** the game paints a lit square in a color that inverts with the scheme
  and holds no color pinned light
- **THEN** a test fails and names the game and the word

#### Scenario: A word about something else is recorded

- **WHEN** a help page says squares "light up" to describe a mistake shown in
  red
- **THEN** the game is recorded as using the word for something other than a
  piece's color, with what it is

### Requirement: A game declares its palette's scheme handling with its own color constants

What a game's palette needs from the color schemes beyond its tokens SHALL be
declared on the game, as `Game.paletteScheme`, in terms of the game's own
color constants: the color the board is painted in when it is not color 0, and
the pairs whose dark values are exchanged. The declaration SHALL name palette
slots only. It SHALL NOT hold a color value or a number that adjusts one: a
color that is wrong in one scheme is corrected on its token, in the engine.

#### Scenario: A moved color takes its swap with it

- **WHEN** a color is added or dropped above a game's bevel so that the bevel's indices move
- **THEN** the dark scheme still exchanges the bevel's highlight and lowlight, with no edit outside the game's palette

### Requirement: The app reads a game's scheme handling from the game

The app SHALL read a game's `paletteScheme` from the game, through the static
attributes the midend reports, and SHALL hold no table of its own that
addresses a game's palette by index. A game that declares nothing SHALL get
color 0 as its board and no exchanged pairs.

#### Scenario: A game that declares nothing

- **WHEN** a game has no `paletteScheme`
- **THEN** the app paints the page around its canvas in color 0, and adapts its palette to the dark scheme with no exchange

#### Scenario: A board that is not color 0

- **WHEN** a game declares a board color other than color 0
- **THEN** the page around its canvas takes that color, and the guards that measure against the board measure against it

### Requirement: A bevel a game draws is lit from one side in both schemes

For every bevel on a game's frames, the lighter of its two colors in the light
scheme SHALL be the lighter of the two in the dark scheme, as the app paints
them, so that its highlight is lighter than the surface it sits on and its
lowlight darker in both. A game SHALL be held to this by drawing a bevel, not
by declaring one. A bevel whose two colors are also used as tints SHALL take
palette slots of its own, since exchanging a slot's dark value changes every
use of it.

#### Scenario: A bevel with no declared swap fails

- **WHEN** a game draws a raised bevel in two colors derived from the board
- **AND** it declares no exchange for them
- **THEN** the cross-game guard fails and names the game and the pair

### Requirement: The engine owns what a board of pieces looks like

The engine SHALL provide, once for the collection, the look of a board whose
content is pieces, and a game SHALL take it by reference: the surface, the
piece and the two-state pair. The surface SHALL be the color of a cell that
holds a piece or will, the color of the line between two cells, and the lifted
color of the cell under a piece the puzzle gave, each a shared role that
authors both schemes. The line SHALL stand off both cell colors in both
schemes.

#### Scenario: The line shows beside a plain cell and a lifted one

- **WHEN** the three surface roles are resolved in either scheme
- **THEN** the line's color differs from the plain cell's and from the lifted
  cell's

### Requirement: A piece is drawn inset on its cell

The engine SHALL provide a drawing helper that paints a piece as a shape inset
on its cell, so that the grid shows between neighboring pieces and a mark
drawn at the cell's edge lands beside the piece.

#### Scenario: Two neighboring pieces of one kind

- **WHEN** two adjacent cells hold pieces of one color
- **THEN** the grid shows between the two pieces

### Requirement: The two-state pair is two colors, two words and two shapes

The engine SHALL provide the two-state pair, for a game with two states of
which neither is the important one: two colors, the two words a player would
call them, and two shapes, each indexed alike.

#### Scenario: A member is one index in all three

- **WHEN** a game takes the pair's first member
- **THEN** its color, its word and its shape are each the first of their list

### Requirement: The pair's colors keep off the marks' hues and stand apart in lightness

The two-state pair's colors SHALL be none of the hues spent on marks drawn
over a board: the error's, the cursor's, those of the hint roles, and the
orange in which a game that uses the pair outlines a hint premise no shared
role names. A game that paints the pair, a role made of it or one of its
washes SHALL give no mark of its own a color in either of the pair's hues.
They SHALL stand apart in lightness in both schemes, for a player who cannot
tell the hues.

#### Scenario: A cursor over a finished region

- **WHEN** a game washes a finished region in the pair's first hue, as Filling
  does, and draws its keyboard cursor as a ring over the cell
- **THEN** the ring is the shared cursor's green and not a purple, which the
  wash would swallow in the dark scheme

#### Scenario: The pair survives a loss of hue

- **WHEN** the pair's two colors are measured in either scheme
- **THEN** their lightnesses stand apart by more than a stated gap
- **AND** their shapes differ

#### Scenario: A third hint premise on a board of the pair

- **WHEN** a game that uses the pair marks a hint premise that is neither the
  evidence nor one of the two premise references
- **THEN** it outlines it in orange, which is neither piece's hue

### Requirement: A game that uses the pair names no hue or shape of its own

A game that uses the two-state pair SHALL name no hue or shape of its own for
a state: its palette, its hint sentences and its control words take the pair's
members by index, and its help page names a member's color by a placeholder
the help build fills from the same words. Replacing the pair SHALL therefore
be a change to the engine's declaration alone.

#### Scenario: A different pair changes no game

- **WHEN** the engine's two-state pair is given other colors, words or shapes
- **THEN** a game that uses the pair draws, narrates and documents the new pair
- **AND** no file under that game's directory and no line of its help page
  changes

#### Scenario: A help page that types a pair name fails

- **WHEN** a game's help page names the pair by placeholder
- **AND** also types one of the pair's color words
- **THEN** the cross-game help guard fails and names the page

### Requirement: The pair's hues carry what a player moves, seeks and finishes

The engine SHALL provide shared roles, each a reference to a member of the
two-state pair or to its wash, for what is a board's content without being one
of two states: a thing the player pushes or carries (`MOVED`), where the
player is going or what they are after (`GOAL`, and `GOAL_WASH` for the cell
it is in), and the surface of a region the player has finished correctly
(`REGION_DONE`). A game SHALL take these by reference and name no hue for
them, so replacing the pair recolors them too.

#### Scenario: A finished region is colored, not a step of gray

- **WHEN** `REGION_DONE` is resolved in either scheme
- **THEN** it carries the first pair member's hue
- **AND** it is distinct from the lifted surface under a given and from the
  wash under a selected cell

#### Scenario: A pushed thing and its destination are the two of the pair

- **WHEN** a game draws a thing the player pushes and the place it belongs
- **THEN** the first is `MOVED` and the second is `GOAL`

### Requirement: The figure the player steers takes the cursor's color

The figure the player steers SHALL NOT take a hue of the two-state pair: it is
the cursor's color, which says where the player is.

#### Scenario: A figure beside the thing it pushes

- **WHEN** a game draws the figure the player steers beside a thing it pushes
- **THEN** the figure is the cursor role's color and the pushed thing is `MOVED`
