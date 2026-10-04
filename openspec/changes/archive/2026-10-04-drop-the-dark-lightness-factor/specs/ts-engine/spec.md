## MODIFIED Requirements

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
