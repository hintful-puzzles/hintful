# engine-colors Specification

## Purpose
The colors every game paints with: the shared semantic palette and its named
tokens, how a color is adapted between the light and dark schemes, and the
rules that keep a game's palette declared, small and true to its names.

## Requirements

### Requirement: The engine provides a shared color-mkhighlight helper

The engine SHALL provide `mkhighlightBackground(bg: Color): Color` in `src/engine/color/color-mkhighlight.ts`, implementing the `misc.c` `game_mkhighlight_specific` background-adjustment logic with the near-white epsilon fix. Every white/black-tile game SHALL be able to import and use this instead of re-deriving it locally.

#### Scenario: A game imports the shared mkhighlightBackground

- **WHEN** a game's `colors()` method receives a default background that is near-white
- **THEN** `mkhighlightBackground` shifts the background away from pure white so that a pure-white tile color is visibly brighter
- **AND** the game does not contain a local copy of the highlight logic

### Requirement: The engine provides a full mkhighlight palette helper

The engine SHALL provide `mkhighlight(bg: Color): { background: Color; highlight: Color; lowlight: Color }` in `src/engine/color/color-mkhighlight.ts`, implementing the full `misc.c` `game_mkhighlight` derivation: the background is adjusted via `mkhighlightBackground`, then the highlight is shifted from the adjusted background toward white by K = sqrt(3)/6 and the lowlight toward black by K. Per upstream, when the background is within K of white the highlight SHALL saturate to pure white, and when within K of black the lowlight SHALL saturate to pure black. Games needing the standard bg/highlight/lowlight trio SHALL destructure this helper instead of re-deriving the colors locally.

#### Scenario: A game derives its palette from the shared helper

- **WHEN** a game's `colors()` method calls `mkhighlight(defaultBackground)`
- **THEN** it receives background, highlight, and lowlight colors matching upstream `game_mkhighlight`, with the highlight strictly brighter and the lowlight strictly darker than the background
- **AND** the game contains no local copy of the highlight/lowlight math

#### Scenario: Light host backgrounds get a pure-white highlight

- **WHEN** the host background is white or near-white
- **THEN** the highlight saturates to pure white instead of collapsing into the adjusted background (the defect the previous per-game inline copies had)

### Requirement: Adapting a color to another scheme preserves its relation to the board

A calculated per-scheme value SHALL preserve the color's relationship to its own
background: a color close in lightness to the background in one scheme SHALL be close
to the background in the other, and a color far from it SHALL stay far from it. The
failure this forbids is a subtle tint of the board becoming a prominent area of color
purely because the scheme changed.

This SHALL hold regardless of how colorful the color is. A rule that treats grays and
chromatic colors by different principles will make a game's near-background tints
behave unlike its near-background grays, which is that failure.

#### Scenario: A near-background tint stays near the background

- **WHEN** a color close in lightness to the game's background is adapted to the
  opposite scheme
- **THEN** it remains close in lightness to that scheme's background

#### Scenario: Text and fills keep their order

- **WHEN** a color drawn as text or a thin line, and a color drawn as a large fill,
  are both adapted to a dark scheme
- **THEN** the text color is lighter than the fill color it may be drawn over

### Requirement: A palette may carry its own per-scheme decisions

The engine SHALL report to the frontend, **per palette index**, any decision a palette
entry makes about its own behavior when the color scheme changes — a decision an
entry may carry where that behavior is a property of the color's meaning rather than
of the game showing it. Reporting per index is required because the association between
a color and its meaning cannot be assumed to survive transfer to the frontend.

A per-puzzle adjustment SHALL take precedence over a decision carried by the palette,
so that a game whose board needs different treatment can still state it.

#### Scenario: A color's own decision is applied

- **WHEN** a palette entry states that it must not be adapted, and the puzzle declares
  no adjustment for that index
- **THEN** the frontend leaves that color unchanged

#### Scenario: A per-puzzle adjustment wins

- **WHEN** a palette entry states that it must not be adapted, and the puzzle also
  declares an adjustment for that index
- **THEN** the puzzle's adjustment is applied instead

### Requirement: A color that means "this piece is black or white" is distinct from ink and paper

The engine SHALL distinguish a color used as **maximum-contrast foreground or surface**
(grid lines, glyphs, text, a white cell background) from a color used to say **a game
object is black or white** (a black peg, a black mine, the filled squares of a
two-color game).

The two SHALL NOT share a role, because they require opposite treatment when the scheme
changes: foreground and surface colors invert, so that text stays readable against the
surface it is drawn on, while a piece's black or white is the game's own meaning and
SHALL be preserved — inverting it would tell the player the piece is the other color.

#### Scenario: Ink inverts so text stays readable

- **WHEN** a color used for grid lines, glyphs or text is resolved for a dark scheme
- **THEN** it is light enough to read against that scheme's surface

#### Scenario: A black piece stays black

- **WHEN** a color whose meaning is that a game object is black is resolved for a dark
  scheme
- **THEN** it remains black
- **AND** the game requires no per-puzzle adjustment to keep it black

### Requirement: The engine provides a shared semantic color palette

The engine SHALL provide a shared module of **semantic color roles** — the colors
that mean something to the *player* — alongside the existing structural
`color-mkhighlight` helpers. A role SHALL be defined in exactly one place, and every
game SHALL obtain its player-facing colors from there rather than writing an RGB
triple.

A role SHALL be declared in one of two forms, chosen by whether it must survive the
app's dark-mode adaptation:

- an **absolute** color, for a role whose purpose is to be unmistakable regardless of
  the board (the error/mistake color);
- a **function of the frontend background**, for any role that must stay legible
  *against the board*. This is required, not stylistic: the app passes a game **pure
  white** as its default background in dark mode, so a fixed pale color that reads
  correctly in light mode can otherwise land on the background in dark mode.

A color SHALL be a shared role only where **two or more games use it to mean the same
thing to the player**. A color that belongs to one game's visual identity, or that is
a member of that game's own enumerated set whose job is to be distinguishable from the
set's other members (peg colors, region colors, tile color sets, per-number digit
colors), SHALL remain game-local — but SHALL be **declared** as such rather than left
undeclared.

The engine SHALL NOT duplicate the structural background/highlight/lowlight
derivation, which the `mkhighlight` helpers continue to own.

#### Scenario: Two games needing the same cue get the same color

- **WHEN** two games render the same player-facing cue (a hint, a flagged mistake, a
  keyboard cursor)
- **THEN** both obtain that color from the same role
- **AND** neither contains a literal color value for it

#### Scenario: A role that must stay legible is derived from the background

- **WHEN** a background-derived role is resolved against a light host background and
  against the pure white the app supplies in dark mode
- **THEN** the resulting color is visibly distinct from that background in both cases

#### Scenario: A game-specific color set stays game-specific

- **WHEN** a game's colors form its own enumerated set whose members must be
  distinguishable from each other rather than carrying a meaning that recurs elsewhere
- **THEN** those colors remain defined by that game
- **AND** they are declared as game-local, so the declaration is a recorded decision
  rather than an omission

### Requirement: A game's palette contains no undeclared color

The suite SHALL fail when any registered game's palette contains a color that is
neither traceable to a shared role or the `mkhighlight` trio, nor listed as a declared
game-local color for that game.

The failure mode this guards is **silent divergence**: a hand-written color is
invisible to a render snapshot (which records whatever the game emits) and to a
targeted op assertion (which names the game's own constant), so without this guard a
new color, or a second spelling of an existing role, can enter the collection with
nothing objecting.

#### Scenario: An undeclared color fails the suite

- **WHEN** a game's palette gains a color that is neither a shared role nor declared
  game-local
- **THEN** the suite fails, naming the game and the color
- **AND** it passes once the color is either mapped to a role or declared game-local

### Requirement: A game contains no color value

A game SHALL NOT contain a color value. Every color a game shows SHALL be a named
reference to a shared color token, or the result of a shared function whose inputs are
such tokens.

The second form exists because some colors are genuinely *relative* to another color —
a bevel highlight is a function of the surface it sits on, a pencil mark is a function
of the board it is written on, and an interpolated ramp is a function of its endpoints.
Requiring literal values for these would replace one correct line of arithmetic with
many authored values that must then be kept consistent by hand.

A game's palette SHALL depend on nothing but the frontend background: no game requires
a color computed from its parameters or its state. A game MAY choose **which** token to
draw with based on its state; that is selection, not computation.

#### Scenario: A color is referenced, never written

- **WHEN** a game builds its palette
- **THEN** each entry is a token reference or a call to a shared derivation
- **AND** the game source contains no color value of its own

#### Scenario: A relative color is derived from tokens

- **WHEN** a color's meaning is defined relative to another color, such as a bevel
  against its surface
- **THEN** it is produced by a shared function whose inputs are tokens
- **AND** it is not authored as an independent value per game

### Requirement: A color token defines a value per color scheme

A color token SHALL define its value for **each color scheme the app offers**, chosen
for what the token means to the player under that scheme rather than converted from
another scheme's value by a general formula.

A token MAY leave a scheme's value unstated, in which case it SHALL be adapted by
calculation, so that schemes can be authored incrementally. A token's name SHALL
describe its **meaning**, not its appearance, since its appearance differs between
schemes.

Changing a scheme's appearance SHALL be possible by editing the token table alone, and
adding a color scheme SHALL require no change to any game.

#### Scenario: A scheme is restyled without touching a game

- **WHEN** a scheme's values are changed in the token table
- **THEN** every game that references those tokens shows the new colors
- **AND** no game source is modified

#### Scenario: A scheme is added

- **WHEN** a new color scheme is introduced
- **THEN** it is defined by giving tokens their values for that scheme
- **AND** no game source is modified

#### Scenario: An unstated scheme value falls back

- **WHEN** a token does not state a value for the active scheme
- **THEN** its value is calculated from a scheme it does state
- **AND** the game renders correctly

### Requirement: The collection's colors are a small named set

The colors the collection uses SHALL be a **small named set**, sized by what the
games demonstrably need to distinguish rather than by how many colors happen to
have been written. A color SHALL NOT be added to it because one game wants a
shade; a game that needs a color the set does not have SHALL record what it means
to the player and why no existing color serves.

Every color a game shows SHALL be a reference to a **meaning** — an error, a
hint, a completed clue — except where the color itself is the meaning: a member
of a set whose job is to be told apart from the other members, or a color the
game names to the player.

A meaning SHALL be defined in terms of a color from the set rather than holding a
value of its own, so that changing a color changes every meaning built on it.

#### Scenario: A game asks for a meaning

- **WHEN** a game needs the color for something being wrong, or for the move a
  hint is proposing
- **THEN** it references that meaning
- **AND** the meaning resolves to a color from the named set

#### Scenario: A color the set does not have

- **WHEN** a game needs a color no existing meaning or named color provides
- **THEN** the reason is recorded with the color: what it means to the player, and
  why nothing in the set serves

### Requirement: A named color's name is true

Where a color is referenced **by name** rather than by meaning, the name SHALL
describe the color as a player would, under **every** color scheme. A scheme MAY
change such a color's shade; it SHALL NOT change it into a color a player would
give another name.

This exists because a name reaches the player. A hint that says "fill with yellow"
is making a claim about the board, and a scheme that renders that color as
something else makes the game lie to the player.

#### Scenario: A hint names a color

- **WHEN** a hint's explanation refers to a color by name
- **THEN** the color that name resolves to is recognisably that color in the
  active scheme

#### Scenario: A scheme restyles a named color

- **WHEN** a scheme gives a named color a different value
- **THEN** the value is a different shade of the same color
- **AND** every explanation that names it is still true

### Requirement: A set of colors meant to be told apart is designed as a set

Colors a game relies on to distinguish items SHALL be mutually distinguishable in
every scheme, and that SHALL be a property of the named set rather than of any one
game that draws from it.

Mutual distinguishability cannot be established one color at a time: it is a
relation between members, so no rule applied to a single color — including
adapting it to a scheme — can establish or preserve it.

#### Scenario: A scheme is added or changed

- **WHEN** a color scheme is introduced or restyled
- **THEN** the members of the named set remain distinguishable from one another
- **AND** this is verified by measurement rather than by inspection

### Requirement: The hint emphases stay distinguishable in both schemes

Hint-role colors SHALL stay distinguishable in **each** scheme, not only in
light. Every pair among the acted-on color, the fill behind text it is about,
the evidence, and the two premise references SHALL stay more than 0.12 apart in
OKLCH in each scheme, and the acted-on color SHALL carry more than twice the
chroma of either wash in each scheme.

This is what the narration rule above rests on. A narration may tie two marks
together in words only where the marks are themselves distinguishable by
something other than hue; a solid acted-on color against a wash qualifies
because it differs in **weight**, which is the cue left to a reader who cannot
compare hues. An exemption resting on a number is worth exactly as much as the
assertion that keeps the number true.

Measuring the light column alone does NOT state this requirement. The two
schemes are authored separately by construction, so their separations differ:
the closest pair of the six is the fill-versus-evidence pair in **dark**, at
0.124, against 0.147 for the same pair in light. A guard that reads only the
light value stays green through a dark-scheme collapse.

#### Scenario: A scheme's hint colors converge

- **WHEN** a color edit brings two hint roles within 0.12 in either scheme
- **THEN** the palette guard fails, naming the pair and the scheme

#### Scenario: The acted-on color loses its weight

- **WHEN** the acted-on hint color's chroma falls to twice a wash's or below,
  in either scheme
- **THEN** the palette guard fails, because the narration rule's exemption for
  solid-against-wash marks no longer holds

### Requirement: A dark-scheme palette swap keeps its bevel lit from one side

For every bevel trio a game exchanges via `darkSwaps`, the highlight SHALL be lighter than the surface it sits on and the lowlight darker, **in both schemes**.

A swap exists because inverting every color's lightness turns an emboss into an inset. For every declared pair, whatever its two colors are, the lighter of the two in the light scheme SHALL be the lighter of the two in the dark scheme.

The requirement above is a relationship to that *surface* and not to the board, so a measurement of a swapped index against the background does not state it and MUST NOT be read as though it did: the two indices of a pair denote different roles in the two schemes, so such a measurement compares a highlight with a lowlight.

#### Scenario: A bevel survives the scheme flip

- **WHEN** a game's bevel trio is resolved for the light scheme and for the dark scheme
- **THEN** in each scheme its highlight is lighter than its base and its lowlight is darker

#### Scenario: A swap names two distinct colors

- **WHEN** a game declares a `darkSwaps` pair
- **THEN** both indices exist in that game's palette, they differ in lightness, and no index is named by more than one pair

#### Scenario: A pair keeps its order across the schemes

- **WHEN** a declared pair is resolved for the light scheme and for the dark scheme
- **THEN** the color that is lighter in one is lighter in the other
- **AND** the check fails for every declared pair when the exchange is not applied

### Requirement: Every game's board sits at one tone

The engine SHALL hand a game's `colors()` a background already shifted off pure
white and pure black by `mkhighlightBackground`, from a single resolution point
(`resolvePalette`) that every consumer of a game's palette — the midend's palette
and dark-value reporting and the render-scenario harness — goes through. The
color a game paints its board with SHALL therefore resolve to the same value
across the collection for a given host background, whether or not the game's own
`colors()` calls `mkhighlight`.

A game MAY call `mkhighlight` on the background it receives to obtain the bevel
trio; the background it gets back SHALL be identical to the one it was handed.

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
- **AND** the check counts the games it looked at and fails if the shift did not
  fire

#### Scenario: A game calling mkhighlight is unaffected

- **WHEN** a game's `colors()` calls `mkhighlight` on the background it receives
- **THEN** the trio it obtains equals the trio derived from the unshifted host,
  because the shift is idempotent

### Requirement: A ruled-out edge is discernible in both schemes

The shared "ruled out" role (`lineNoColor`) SHALL resolve to a color a clear
step off the board in both schemes — a mid gray — and SHALL remain visibly
distinct from the completed-region fill (`REGION_DONE`) it may be drawn
across, so that a player, and in particular a keyboard player whose cursor walks
the edges, can see where a ruled-out edge lies while still reading it as
disabled rather than drawn.

#### Scenario: A ruled-out edge stands off a dark board

- **WHEN** the role is resolved for the dark scheme against the collection's
  board
- **THEN** its lightness differs from the board's by more than the undecided
  edge's did before this change (the value the owner's playtest found nearly
  invisible)
- **AND** it remains darker than ink

#### Scenario: A ruled-out edge across a completed region still shows

- **WHEN** the role and `REGION_DONE` are resolved against the same
  board in either scheme
- **THEN** the two are visibly distinct

### Requirement: The solved flash is one role

A game whose completion flash is drawn as a fill or line color SHALL take that
color from the shared `FLASH` role, which is maximum contrast against the
surface and inverts with the scheme. A game whose flash is an animation rather
than a color — a bevel wave, a state swap, a color cycle, a wash under text —
keeps its own mechanism and is not covered by this requirement.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** two games that flash their board to white on completion are resolved
  in either scheme
- **THEN** both flash colors are equal
- **AND** neither is the board's own color in that scheme

### Requirement: A departure from a shared role is stated at the assignment

Where the shared palette defines a role for a meaning a game's color carries
(the keyboard cursor, a held or dragged item, a flagged mistake, a hint's action
or evidence, a black or white piece, a retired clue, a correctly completed
region), the game SHALL assign that role. A game that assigns a different color
for that meaning SHALL state, on or immediately above the assignment, why its
board has spent the role's color — so that the departure is a recorded decision
and not an unexamined inheritance.

A cross-game check SHALL find every such departure by the shape of the
assignment rather than by the slot's name, and SHALL fail on one that carries no
reason.

#### Scenario: A game whose board has spent the cursor's green says so

- **WHEN** a game assigns its keyboard-cursor slot a color other than the shared
  cursor role
- **THEN** the assignment carries a one-line reason naming what the role's color
  is already used for on that board

#### Scenario: An unexplained departure fails the check

- **WHEN** a game assigns a slot whose meaning a shared role covers to a color
  other than that role, with no reason at the assignment
- **THEN** the cross-game check names the game and the slot

#### Scenario: The check counts what it looked at

- **WHEN** the cross-game check runs
- **THEN** it reports the number of games and slots it examined and fails if that
  number is not the collection's

### Requirement: Colors a game paints side by side stand apart in the dark scheme

Two palette colors that a game's frames paint next to each other SHALL stand at
least a stated distance apart in the dark scheme as the app paints it, measured
between the two colors within that scheme. The pairs SHALL be read off the
game's own draw record, so that a game is covered by being registered.

Two filled areas owe the distance outright. A thin mark or a glyph owes it only
where the light scheme gives the same pair at least twice the distance, since a
quiet grid line is quiet in both schemes on purpose. A pair that is closer on
purpose SHALL be recorded with what it is, one entry per pair, and an entry
whose pair is no longer close SHALL fail.

#### Scenario: A wall that sinks into the floor fails

- **WHEN** a movement game's wall and floor are painted as adjacent areas
- **AND** the wall's dark value stands closer to the floor than the stated
  distance
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A new game is covered without being listed

- **WHEN** a game is added to the catalog
- **THEN** its frames are measured by the same guard with no edit to the guard

#### Scenario: An excused pair that stops being close fails

- **WHEN** a recorded pair's dark distance rises above the stated distance, or
  the game stops painting the pair
- **THEN** the guard fails until the entry is removed

### Requirement: A lightness a help page names is pinned in the game's palette

A game whose help page calls something black, shaded, white or lit SHALL hold in
its palette a color that is dark, or light, in both schemes by its own authored
values, so that the word stays true when the scheme changes. A page whose word
is not about a piece's color SHALL be recorded with what the word is about, and
a record for a page that no longer uses the word SHALL fail.

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

What a game's palette needs from the color schemes beyond its tokens SHALL be declared on the game, as `Game.paletteScheme`, in terms of the game's own color constants: the color the board is painted in when it is not color 0, and the pairs whose dark values are exchanged.

The declaration SHALL name palette slots only. It SHALL NOT hold a color value or a number that adjusts one: a color that is wrong in one scheme is corrected on its token, in the engine.

The app SHALL read that declaration from the game, through the static attributes the midend reports, and SHALL hold no table of its own that addresses a game's palette by index. A game that declares nothing SHALL get color 0 as its board and no exchanged pairs.

#### Scenario: A moved color takes its swap with it

- **WHEN** a color is added or dropped above a game's bevel so that the bevel's indices move
- **THEN** the dark scheme still exchanges the bevel's highlight and lowlight, with no edit outside the game's palette

#### Scenario: A game that declares nothing

- **WHEN** a game has no `paletteScheme`
- **THEN** the app paints the page around its canvas in color 0, and adapts its palette to the dark scheme with no exchange

#### Scenario: A board that is not color 0

- **WHEN** a game declares a board color other than color 0
- **THEN** the page around its canvas takes that color, and the guards that measure against the board measure against it

### Requirement: A bevel a game draws is lit from one side in both schemes

For every bevel on a game's frames, the lighter of its two colors in the light scheme SHALL be the lighter of the two in the dark scheme, as the app paints them.

The bevels SHALL be read off the game's own draw record by shape, two polygons drawn one after the other that split one box along its diagonal, so that a game is covered by drawing a bevel and not by declaring one. Two shapes drawn one over the other SHALL NOT be read as a bevel.

A bevel whose two colors are also used as tints SHALL take palette slots of its own, since exchanging a slot's dark value changes every use of it.

#### Scenario: A bevel with no declared swap fails

- **WHEN** a game draws a raised bevel in two colors derived from the board
- **AND** it declares no exchange for them
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A new game is covered without being listed

- **WHEN** a game that draws a bevel is added to the catalog
- **THEN** its bevel is checked by the same guard with no edit to the guard

#### Scenario: The guard reads something

- **WHEN** the guard runs
- **THEN** it finds a bevel in a game that draws through each shared helper and in a game that draws its own, and fails if it finds none

### Requirement: The engine owns what a board of pieces looks like

The engine SHALL provide, once for the collection, the look of a board whose
content is pieces, and a game SHALL take it by reference:

- the **surface**: the color of a cell that holds a piece or will, the color of
  the line between two cells, and the lifted color of the cell under a piece
  the puzzle gave, each a shared role that authors both schemes. The line
  SHALL stand off both cell colors in both schemes;
- the **piece**: a drawing helper that paints a piece as a shape inset on its
  cell, so that the grid shows between neighboring pieces and a mark drawn at
  the cell's edge lands beside the piece;
- the **two-state pair**: two colors, the two words a player would call them,
  and two shapes, each indexed alike, for a game with two states of which
  neither is the important one.

The pair's colors SHALL be none of the hues the shared roles spend on marks
drawn over a board (the error, the hint's action, the cursor, and the orange a
hint outlines premises in), and SHALL stand apart in lightness in both schemes,
so that a player who cannot tell the hues still has the lightness and the
shape.

A game that uses the pair SHALL name no hue or shape of its own for a state:
its palette, its hint sentences and its control words take the pair's members
by index, and its help page names a member's color by a placeholder the help
build fills from the same words. Replacing the pair SHALL therefore be a change
to the engine's declaration alone.

#### Scenario: A different pair changes no game

- **WHEN** the engine's two-state pair is given other colors, words or shapes
- **THEN** a game that uses the pair draws, narrates and documents the new pair
- **AND** no file under that game's directory and no line of its help page
  changes

#### Scenario: A help page that types a pair name fails

- **WHEN** a game's help page names the pair by placeholder
- **AND** also types one of the pair's color words
- **THEN** the cross-game help guard fails and names the page

#### Scenario: The pair survives a loss of hue

- **WHEN** the pair's two colors are measured in either scheme
- **THEN** their lightnesses stand apart by more than the gap that was too
  close to play by
- **AND** their shapes differ

### Requirement: The pair's hues carry what a player moves, seeks and finishes

The engine SHALL provide shared roles, each a reference to a member of the
two-state pair or to its wash, for the things that are a board's content
without being one of two states: a thing the player pushes or carries
(`MOVED`), where the player is going or what they are after (`GOAL`, and
`GOAL_WASH` for the cell it is in), and the surface of a region the player has
finished correctly (`REGION_DONE`). A game SHALL take these by reference and
name no hue for them, so that replacing the pair recolors them too.

The figure the player steers SHALL NOT take a pair hue: it is the cursor's
color, which says where the player is.

#### Scenario: A finished region is colored, not a step of gray

- **WHEN** `REGION_DONE` is resolved in either scheme
- **THEN** it carries the first pair member's hue
- **AND** it is distinct from the lifted surface under a given and from the
  wash under a selected cell

#### Scenario: A pushed thing and its destination are the two of the pair

- **WHEN** a game draws a thing the player pushes and the place it belongs
- **THEN** the first is `MOVED` and the second is `GOAL`
