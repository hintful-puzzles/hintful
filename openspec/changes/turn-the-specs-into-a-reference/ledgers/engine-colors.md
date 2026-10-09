# Ledger: engine-colors

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine provides a shared color-mkhighlight helper

| Rule | Where it went |
| --- | --- |
| The engine provides `mkhighlightBackground(bg: Color): Color` in `src/engine/color/color-mkhighlight.ts` | spec: The engine provides a shared color-mkhighlight helper |
| It implements upstream's `game_mkhighlight_specific` background adjustment | history |
| What that adjustment is: a background too near white or black is shifted off the extreme | spec: The engine provides a shared color-mkhighlight helper |
| The near-white epsilon fix | spec: The engine provides a shared color-mkhighlight helper; held: src/engine/color/color-mkhighlight.ts "Anything within IEEE round-trip drift of exact equality counts as equal" |
| A white or black tile game can import it and does not re-derive it locally | spec: The engine provides a shared color-mkhighlight helper |
| Scenario: a near-white background is shifted so a pure-white tile is brighter, and the game holds no local copy | spec: The engine provides a shared color-mkhighlight helper |

## The engine provides a full mkhighlight palette helper

| Rule | Where it went |
| --- | --- |
| The engine provides `mkhighlight(bg)` returning background, highlight and lowlight, in `src/engine/color/color-mkhighlight.ts` | spec: The engine provides a full mkhighlight palette helper |
| It implements upstream's `game_mkhighlight` | history |
| The background is `mkhighlightBackground(bg)`, the highlight is shifted toward white by K = sqrt(3)/6 and the lowlight toward black by K | spec: The engine provides a full mkhighlight palette helper |
| Within K of white the highlight saturates to pure white, and within K of black the lowlight saturates to pure black | spec: A mkhighlight shade saturates at the extreme |
| A game needing the trio destructures the helper and does not re-derive the colors | spec: The engine provides a full mkhighlight palette helper |
| Scenario: the highlight is strictly brighter and the lowlight strictly darker, with no local copy of the math | spec: The engine provides a full mkhighlight palette helper |
| Scenario: the trio matches upstream `game_mkhighlight` | history |
| Scenario: a white or near-white host gets a pure-white highlight that does not collapse into the background | spec: A mkhighlight shade saturates at the extreme |
| The collapse was the defect of the earlier per-game inline copies | history |

## Adapting a color to another scheme preserves its relation to the board

| Rule | Where it went |
| --- | --- |
| A calculated per-scheme value keeps a color near its background near, and a color far from it far | spec: Adapting a color to another scheme preserves its relation to the board |
| A subtle tint of the board never becomes a prominent area of color because the scheme changed | spec: Adapting a color to another scheme preserves its relation to the board |
| This holds regardless of how colorful the color is, and grays and chromatic colors are not adapted by different principles | spec: Adapting a color to another scheme preserves its relation to the board |
| Different principles would make near-background tints behave unlike near-background grays | reason |
| Scenario: a near-background tint stays near the background | spec: Adapting a color to another scheme preserves its relation to the board |
| Scenario: text and fills keep their order | spec: Adapting a color to another scheme preserves its relation to the board |

## A palette may carry its own per-scheme decisions

| Rule | Where it went |
| --- | --- |
| The engine reports to the frontend, per palette index, a decision an entry makes about its own behavior under a scheme change | spec: A palette may carry its own per-scheme decisions |
| An entry carries one where the behavior is a property of the color's meaning and not of the game | spec: A palette may carry its own per-scheme decisions |
| Per index, because the association between a color and its meaning does not survive transfer to the frontend | spec: A palette may carry its own per-scheme decisions |
| A per-puzzle adjustment takes precedence over an entry's own decision, so a game whose board needs different treatment can state it | spec: A game's declared exchange holds over an entry's own decision |
| Scenario: an entry that must not be adapted, with no adjustment declared, is left as it is | spec: A palette may carry its own per-scheme decisions |
| Scenario: a per-puzzle adjustment for an index is applied instead of the entry's decision | untrue: the only adjustment a game can declare is an exchange of two indices (`PaletteScheme.darkSwaps`), and `darkModePalette` in `src/puzzle/dark-palette.ts` gives every index its authored or calculated dark value first and exchanges the declared pairs last, so the index takes its partner's dark value and nothing replaces an entry's decision with a value of the game's own |

## A color that means "this piece is black or white" is distinct from ink and paper

| Rule | Where it went |
| --- | --- |
| A color used as maximum-contrast foreground or surface is distinguished from a color that says a game object is black or white | spec: A color that means "this piece is black or white" is distinct from ink and paper |
| The two do not share a role, since foreground and surface invert with the scheme and a piece's black or white is preserved | spec: A color that means "this piece is black or white" is distinct from ink and paper |
| Inverting a piece's color would tell the player the piece is the other color | spec: A color that means "this piece is black or white" is distinct from ink and paper |
| Scenario: ink inverts so text stays readable | spec: A color that means "this piece is black or white" is distinct from ink and paper |
| Scenario: a black piece stays black with no per-puzzle adjustment | spec: A color that means "this piece is black or white" is distinct from ink and paper |

## The engine provides a shared semantic color palette

| Rule | Where it went |
| --- | --- |
| The engine provides one shared module of semantic roles beside the `mkhighlight` helpers, each role defined in one place, and a game writes no RGB triple | spec: The engine provides a shared semantic color palette |
| The module does not duplicate the background, highlight and lowlight derivation | spec: The engine provides a shared semantic color palette |
| A role is an absolute color or a function of the frontend background, chosen by whether it must survive the dark-mode adaptation | spec: A shared role is an absolute color or a function of the background |
| The second form is required and not stylistic | spec: A shared role is an absolute color or a function of the background |
| The app passes a game pure white as its default background in dark mode | untrue: `src/puzzle/components/view.ts` supplies pure white as the host background, and `resolvePalette` in `src/engine/color/color-mkhighlight.ts` shifts it off the extreme before any game's `colors()` sees it, so the requirement now says the host is pure white |
| A color is a shared role only where two or more games use it to mean the same thing | spec: A color is a shared role only where two games mean the same by it |
| A color of one game's visual identity stays game-local and is declared as such | spec: A color is a shared role only where two games mean the same by it |
| A member of a game's own enumerated set (peg, region, tile and digit colors) stays defined by that game | untrue: the sets are the engine's named colors (`TEN`, `EIGHT_FILLS`, `FOUR_FILLS` and `TWO` in `src/engine/color/colors.ts`), which a game references by name, and `src/engine/color/palette-games.ts` holds one game's colors that are functions of the board or of another color (Signpost's region ramp is built there from `EIGHT_FILLS`) under names prefixed with the game's id, which `src/engine/color/palette-source.test.ts` holds each game to on its import line, so the requirement now says a set member is not a shared role and the game-local table is where one game's color is declared |
| Scenario: two games needing one cue take it from one role, with no literal | spec: The engine provides a shared semantic color palette |
| Scenario: a background-derived role is distinct from a light host and from the pure white of dark mode | spec: A shared role is an absolute color or a function of the background |
| Scenario: a game-specific color is declared game-local, a recorded decision and not an omission | spec: A color is a shared role only where two games mean the same by it |

## A game's palette contains no undeclared color

| Rule | Where it went |
| --- | --- |
| The suite fails on a game color that is neither a shared role, the trio, nor a declared game-local color | spec: A game's palette contains no undeclared color; spec: A color is a shared role only where two games mean the same by it |
| The guard reads the resolved palette, traces each value to a role and names the game and the color | untrue: the guard reads game source and not palette values (`src/engine/color/palette-source.test.ts`), failing on a color literal, on a channel read off the background and on an import of the combinators in `color-token.ts`, and it names the file and the line, so the requirement now states those three rules and the list of three-number literals that are not colors |
| A hand-written color is invisible to a render snapshot and to an assertion that names the game's own constant | spec: A game's palette contains no undeclared color |
| The failure guarded against is silent divergence, a second spelling of an existing role | reason |
| Scenario: an undeclared color fails and passes once mapped to a role or declared game-local | spec: A game's palette contains no undeclared color |

## A game contains no color value

| Rule | Where it went |
| --- | --- |
| A game contains no color value, and every color is a token reference or the result of a shared function | spec: A game contains no color value |
| The shared function's inputs are tokens | untrue: the shared derivations take the background the game was handed as well as tokens (`lineNoColor(background)` and `cellSurface(background)` in `src/engine/color/palette.ts`, and `mkhighlight` itself), so the requirement now names both inputs |
| The second form is for a color relative to another: a bevel highlight, a pencil mark, an interpolated ramp | spec: A game contains no color value |
| Literal values would replace one line of arithmetic with many authored values kept consistent by hand | reason |
| A game's palette depends on nothing but the frontend background, with no color computed from params or state | spec: A game's palette depends on nothing but the frontend background |
| Choosing which token to draw with by state is selection and is allowed | spec: A game's palette depends on nothing but the frontend background |
| Scenario: a color is referenced, never written | spec: A game contains no color value |
| Scenario: a relative color is derived by a shared function and not authored per game | spec: A game contains no color value |

## A color token defines a value per color scheme

| Rule | Where it went |
| --- | --- |
| A token states its value per scheme, chosen for its meaning and not converted by a general formula | spec: A color token defines a value per color scheme |
| An unstated scheme value is adapted by calculation, so schemes are authored incrementally | spec: A color token defines a value per color scheme |
| A token's name describes its meaning and not its appearance | spec: A color token defines a value per color scheme |
| A scheme is restyled by editing the token table alone, and adding a scheme changes no game | spec: A scheme is restyled or added in the token table alone |
| Scenario: a scheme is restyled without touching a game | spec: A scheme is restyled or added in the token table alone |
| Scenario: a scheme is added | spec: A scheme is restyled or added in the token table alone |
| Scenario: an unstated scheme value falls back | spec: A color token defines a value per color scheme |

## The collection's colors are a small named set

| Rule | Where it went |
| --- | --- |
| The colors are a small named set, sized by what the games need to distinguish | spec: The collection's colors are a small named set |
| No color is added because one game wants a shade, and a game needing a new one records what it means and why none serves | spec: The collection's colors are a small named set |
| Every color a game shows references a meaning, except a member of a set told apart or a color the game names to the player | spec: A game references a meaning, or a named color that is the meaning |
| A meaning is defined in terms of a color from the set and holds no value of its own | spec: A meaning holds no value of its own |
| That holds of every meaning | untrue: `INK` and `PAPER` in `src/engine/color/palette.ts` are values of their own, exempted by name in `src/engine/color/palette.test.ts` because they are adapted by the scheme, and the background-derived roles (`lineNoColor`, `cellSurface`, `wallFill`) author values and are skipped by that test, so the requirement now names the two kinds outside it |
| Scenario: a game asks for a meaning, which resolves to a color from the set | spec: A game references a meaning, or a named color that is the meaning; spec: A meaning holds no value of its own |
| Scenario: a color the set does not have is recorded with its reason | spec: The collection's colors are a small named set |

## A named color's name is true

| Rule | Where it went |
| --- | --- |
| A color referenced by name is described by that name as a player would, under every scheme | spec: A named color's name is true |
| A scheme changes such a color's shade only, never into a color with another name | spec: A named color's name is true |
| A name reaches the player, as in a hint that says "fill with yellow" | spec: A named color's name is true |
| A scheme that rendered the color as something else would make the game lie | reason |
| Scenario: a hint names a color | spec: A named color's name is true |
| Scenario: a scheme restyles a named color | spec: A named color's name is true |

## A set of colors meant to be told apart is designed as a set

| Rule | Where it went |
| --- | --- |
| Colors a game distinguishes items by are mutually distinguishable in every scheme, as a property of the named set | spec: A set of colors meant to be told apart is designed as a set |
| It is a relation between members, so no rule on a single color establishes or preserves it | spec: A set of colors meant to be told apart is designed as a set |
| Scenario: after a scheme is added or changed the members stay distinguishable, verified by measurement | spec: A set of colors meant to be told apart is designed as a set |

## The hint emphases stay distinguishable in both schemes

| Rule | Where it went |
| --- | --- |
| Hint-role colors stay distinguishable in each scheme, with every pair more than 0.12 apart in OKLCH | spec: The hint emphases stay distinguishable in both schemes |
| One of the roles is the fill behind text the acted-on color is about | untrue: the acted-on color has no fill, as the doc comment of `HINT_ACTION` in `src/engine/color/palette.ts` says, and the fifth hint role is the evidence drawn as a fill (`HINT_EVIDENCE_WASH`), so the requirement names the five roles the palette has |
| The acted-on color carries more than twice the chroma of either wash in each scheme | untrue: there is one hint wash, `HINT_EVIDENCE_WASH`, and it is the one `src/engine/color/palette.test.ts` measures the acted-on color against, so the requirement says the evidence fill |
| A narration ties two marks in words only where they differ by something other than hue, and solid against wash differs in weight | spec: The acted-on hint color outweighs the evidence fill |
| An exemption resting on a number is worth what the assertion keeping the number true is worth | reason |
| Measuring the light column alone does not state the requirement, since the schemes are authored separately | spec: The hint colors are measured in each scheme |
| The closest pair is fill against evidence in dark, with its two measured separations | figure |
| Scenario: two hint roles within 0.12 in either scheme fail the palette guard, naming the pair and the scheme | spec: The hint emphases stay distinguishable in both schemes; spec: The hint colors are measured in each scheme |
| Scenario: the acted-on color's chroma falling to twice a wash's or below fails the guard | spec: The acted-on hint color outweighs the evidence fill |

## A dark-scheme palette swap keeps its bevel lit from one side

| Rule | Where it went |
| --- | --- |
| For every bevel trio exchanged via `darkSwaps` the highlight is lighter than its surface and the lowlight darker, in both schemes | spec: A dark-scheme palette swap keeps its bevel lit from one side |
| A swap exists because inverting lightness turns an emboss into an inset | spec: A declared swap keeps its pair in one order across the schemes |
| For every declared pair, the lighter in the light scheme is the lighter in the dark scheme | spec: A declared swap keeps its pair in one order across the schemes |
| The bevel rule is about the surface, and a swapped index measured against the background is not read as stating it | spec: A dark-scheme palette swap keeps its bevel lit from one side |
| Scenario: a bevel survives the scheme flip | spec: A dark-scheme palette swap keeps its bevel lit from one side |
| Scenario: a swap names two indices that exist and differ in lightness, and no index is in two pairs | spec: A declared swap keeps its pair in one order across the schemes |
| Scenario: a pair keeps its order, and the check fails for every pair when the exchange is not applied | spec: A declared swap keeps its pair in one order across the schemes |

## Every game's board sits at one tone

| Rule | Where it went |
| --- | --- |
| A game's `colors()` is handed a background shifted by `mkhighlightBackground`, from `resolvePalette`, which every consumer goes through | spec: Every game's board sits at one tone |
| The board color resolves to one value across the collection for a host background, whether or not the game calls `mkhighlight` | spec: Every game's board sits at one tone |
| A game that calls `mkhighlight` gets back the background it was handed | spec: A game that calls mkhighlight gets back the background it was handed |
| Scenario: a raw-background game and a mkhighlight game paint one board | spec: Every game's board sits at one tone |
| Scenario: every registered game paints the shifted host, and the check counts its games and fails if the shift did not fire | spec: Every game's board sits at one tone |
| Scenario: a game calling mkhighlight is unaffected, because the shift is idempotent | spec: A game that calls mkhighlight gets back the background it was handed |

## A ruled-out edge is discernible in both schemes

| Rule | Where it went |
| --- | --- |
| `lineNoColor` is a mid gray a clear step off the board in both schemes, distinct from `REGION_DONE`, seen and still read as disabled | spec: A ruled-out edge is discernible in both schemes |
| Scenario: on a dark board it stands off the board and stays darker than ink | spec: A ruled-out edge is discernible in both schemes |
| The step is compared with the undecided edge's value before the change, which the owner's playtest found nearly invisible | history |
| Scenario: a ruled-out edge across a completed region still shows | spec: A ruled-out edge is discernible in both schemes |

## The solved flash is one role

| Rule | Where it went |
| --- | --- |
| A flash drawn as a fill or line color takes the `FLASH` role, maximum contrast against the surface and inverting with the scheme | spec: The solved flash is one role |
| A flash that is an animation keeps its own mechanism and is not covered | spec: The solved flash is one role |
| Scenario: two white-flashing games flash one color, which is not the board's | spec: The solved flash is one role |

## A departure from a shared role is stated at the assignment

| Rule | Where it went |
| --- | --- |
| Where a role covers a meaning, the game assigns it, and a departure states why at or just above the assignment | spec: A departure from a shared role is stated at the assignment |
| The reason makes the departure a recorded decision and not an unexamined inheritance | reason |
| A cross-game check finds departures by the shape of the assignment and fails on one with no reason | spec: A cross-game check finds an unexplained departure |
| The check does not go by the slot's name, and covers every listed meaning | untrue: `src/engine/color/palette-departures.test.ts` finds assignments by shape and then keeps the slots whose index name contains CURSOR, HELD, DRAG or HINT, so a mistake, a piece, a retired clue and a completed region are not checked, and the requirement now names the four kinds of slot |
| Scenario: a game whose board has spent the cursor's green says so | spec: A departure from a shared role is stated at the assignment |
| Scenario: an unexplained departure names the game and the slot | spec: A cross-game check finds an unexplained departure |
| Scenario: the check reports the number of games and slots and fails if it is not the collection's | untrue: the same test reports nothing, and asserts that the number of game directories it read equals a count written in the test and that each kind of slot reaches a floor (`atLeast`), so the requirement says it fails on fewer games than the collection has or fewer slots than a stated floor |

## Colors a game paints side by side stand apart in the dark scheme

| Rule | Where it went |
| --- | --- |
| Two colors painted side by side stand a stated distance apart in the dark scheme as painted, measured within that scheme | spec: Colors a game paints side by side stand apart in the dark scheme |
| The pairs are read off the game's draw record, so a game is covered by being registered | spec: Colors a game paints side by side stand apart in the dark scheme |
| Two filled areas owe the distance outright, and a thin mark or glyph owes it only conditionally, since a quiet grid line is quiet in both schemes on purpose | spec: Two filled areas owe the dark distance outright, a thin mark conditionally |
| The condition is that the light scheme gives the pair at least twice the distance | untrue: `tooCloseInDark` in `src/puzzle/neighbor-contrast.ts` fails a mark or glyph only where `pair.dark < 0.5 * pair.light`, so the light distance must be more than twice the pair's own dark distance, not at least twice, and not twice the stated floor, and the requirement says more than twice its dark distance || A pair closer on purpose is recorded, one entry per pair, and an entry no longer close fails | spec: A pair that is close on purpose is recorded |
| Scenario: a wall that sinks into the floor fails | spec: Two filled areas owe the dark distance outright, a thin mark conditionally |
| Scenario: a new game is covered without being listed | spec: Colors a game paints side by side stand apart in the dark scheme |
| Scenario: an excused pair that stops being close, or is no longer painted, fails | spec: A pair that is close on purpose is recorded |

## A lightness a help page names is pinned in the game's palette

| Rule | Where it went |
| --- | --- |
| A game whose page says black, shaded, white or lit holds a color dark, or light, in both schemes by its authored values | spec: A lightness a help page names is pinned in the game's palette |
| That is the only way a page's word is answered | untrue: `holdsPinned` in `src/help-lightness-words.test.ts` also accepts, for a page that says shaded, a palette that holds the `SHADED` role whatever its lightness, and the requirement now says so |
| A page whose word is not about a piece's color is recorded, and a stale record fails | spec: A lightness a help page names is pinned in the game's palette |
| Scenario: a lit square drawn in paper fails | spec: A lightness a help page names is pinned in the game's palette |
| Scenario: a word about something else is recorded | spec: A lightness a help page names is pinned in the game's palette |

## A game declares its palette's scheme handling with its own color constants

| Rule | Where it went |
| --- | --- |
| Scheme handling is declared as `Game.paletteScheme` with the game's own constants: the board color and the exchanged pairs | spec: A game declares its palette's scheme handling with its own color constants |
| The declaration names slots only, with no color value and no adjusting number | spec: A game declares its palette's scheme handling with its own color constants |
| The app reads it through the midend's static attributes and holds no table addressing a palette by index | spec: The app reads a game's scheme handling from the game |
| A game that declares nothing gets color 0 as its board and no exchanged pairs | spec: The app reads a game's scheme handling from the game |
| Scenario: a moved color takes its swap with it | spec: A game declares its palette's scheme handling with its own color constants |
| Scenario: a game that declares nothing | spec: The app reads a game's scheme handling from the game |
| Scenario: a board that is not color 0 | spec: The app reads a game's scheme handling from the game |

## A bevel a game draws is lit from one side in both schemes

| Rule | Where it went |
| --- | --- |
| For every bevel on a game's frames, the lighter color in light is the lighter in dark, as painted | spec: A bevel a game draws is lit from one side in both schemes |
| Bevels are read off the draw record by shape, and two shapes drawn one over the other are not a bevel | spec: A bevel is read off the draw record by its shape |
| A bevel whose colors are also tints takes slots of its own | spec: A bevel a game draws is lit from one side in both schemes |
| Scenario: a bevel with no declared swap fails | spec: A bevel a game draws is lit from one side in both schemes |
| Scenario: a new game is covered without being listed | spec: A bevel is read off the draw record by its shape |
| Scenario: the guard finds a bevel in a game that draws its own | untrue: `src/puzzle/bevels.test.ts` requires every bevel on a game's frames to have come from a call of a shared helper (`drawRaisedBevel`, `drawRaisedTile`, `drawRecessedBorder`), so no game draws its own, and the scenario now says the guard sees a shared helper for each shape of bevel called and fails if it finds no game that draws a bevel |

## The engine owns what a board of pieces looks like

| Rule | Where it went |
| --- | --- |
| The engine provides the look of a board of pieces once, and a game takes it by reference | spec: The engine owns what a board of pieces looks like |
| The surface: the cell, the line and the lifted cell, each a role that authors both schemes, with the line off both cells in both schemes | spec: The engine owns what a board of pieces looks like |
| The piece: a helper that paints a shape inset on its cell | spec: A piece is drawn inset on its cell |
| The pair: two colors, two words and two shapes, indexed alike, for a game whose two states are equals | spec: The two-state pair is two colors, two words and two shapes |
| The pair's colors are none of the marks' hues and stand apart in lightness in both schemes | spec: The pair's colors keep off the marks' hues and stand apart in lightness |
| A game using the pair names no hue or shape, and its help page uses a placeholder, so replacing the pair is the engine's change alone | spec: A game that uses the pair names no hue or shape of its own |
| Scenario: a different pair changes no game | spec: A game that uses the pair names no hue or shape of its own |
| Scenario: a help page that types a pair name fails | spec: A game that uses the pair names no hue or shape of its own |
| Scenario: the pair's lightnesses stand apart and its shapes differ | spec: The pair's colors keep off the marks' hues and stand apart in lightness |
| The gap is measured against the one that was too close to play by | history |

## The pair's hues carry what a player moves, seeks and finishes

| Rule | Where it went |
| --- | --- |
| `MOVED`, `GOAL`, `GOAL_WASH` and `REGION_DONE` are roles referring to the pair or its wash, taken by reference so replacing the pair recolors them | spec: The pair's hues carry what a player moves, seeks and finishes |
| The figure the player steers takes no pair hue and is the cursor's color | spec: The figure the player steers takes the cursor's color |
| Scenario: a finished region carries the first member's hue and is distinct from the lifted surface and the selected wash | spec: The pair's hues carry what a player moves, seeks and finishes |
| Scenario: a pushed thing is `MOVED` and its destination `GOAL` | spec: The pair's hues carry what a player moves, seeks and finishes |
