# color-path-pairs

Filed 2026-10-21 on the owner's word, after Path's hint iteration: color each
pair of numbers, and the lines that reach them, in a color of its own.

## Why

In Path a line's number is the fact every deduction turns on, and the board
draws every line in ink: telling which number a line leads to means tracing
it. Coloring a number's disc and the lines that reach it shows that at a
glance. It gives nothing away: the numbers already say which squares pair up,
and the hint already counts an edge between two numbers' lines as plainly
closed (the owner, 2026-10-21, in removing the pair step), which coloring
makes as plain on the board as the hint assumes. It is also the genre's look:
Flow Free colors its pairs.

## The owner's decisions (2026-10-21)

- **Colors may repeat** where a board has more pairs than the set has colors.
  The numbers stay on the discs and tell repeated colors apart, so a player
  who cannot tell the hues apart loses nothing.
- **A separate palette for colors that mean nothing**, not the set games use
  today. `TEN` (`src/engine/color/colors.ts`) holds red, blue, green and teal,
  which are also the error, the hint's ring, the cursor and the hint's
  outline; a red pair would hide an error and a blue line blur with the
  hint. The pair colors come from a set designed to stand apart from every
  color that carries a meaning on the board.
- **One set of ten replaces both `FREE` and `TEN`** (later the same day,
  after a four-color `FREE` shipped and repeated on adjacent pairs). The
  owner: "I want more distinct colors... superseding whatever usages we
  currently have for TEN which use them for semantics-free needs... I'm ok
  with smaller hue differences between colors, as long as they're
  sufficiently distinct from the main semantic elements." The owner approved
  design D5 for the engine and every affected game: the ten, Path's edged
  lines, and Flood, Guess and Samegame moving onto the set, with `TEN`
  retired.

## What changes

**Where this list and design D5 differ, D5 holds.** The first pass shipped
a four-color `FREE`, Path's colored rings, lines and discs, red kept for
broken lines, and a drag that carries a traced line on. What is left is D5:
the set grows to ten, Path's lines and discs are edged, and the three `TEN`
games move.


- **An engine set of semantically free colors**, beside `TEN` in
  `src/engine/color/colors.ts`: colors a player tells apart that carry no
  meaning of the collection's (no error, hint, cursor, held or done color
  among them, nor one a player would take for one), measured for mutual
  distinctness in both schemes and against the marks drawn over them, as
  `TEN` was. Its size is what that measurement allows, and Path repeats
  colors past it.
- **Path colors each pair**: the disc of each number in its pair's color, and
  every line whose piece reaches a number in that number's color. A piece
  reaching no number stays ink. The number stays on the disc.
- **A broken line stays red** (design D3): no member of the set is near the
  error's red. The hint's marks are checked on colored lines in both schemes.
- **Flood, Guess and Samegame move onto the set** and `TEN` is retired
  (design D5): their hints say the set's names.

## Not in this change

Any change to Path's rules, hints or generation. The drag fix is a control,
not a rule.

## Impact

`src/engine/color/colors.ts` and its tests (`colors.test.ts`,
`scripts/checks/color-collide.test.ts` before and after); `src/games/path/render.ts`
and its snapshots; Flood's, Guess's and Samegame's renderers and hint
words, and their snapshots and help pages where a color is named; Path's help
(`help/games/path.md`); `docs/rendering.md` § "The palette: three layers,
meaning first"; specs `engine-colors`, `path`, and `flood`, `guess` and
`samegame` where a requirement names a color.
