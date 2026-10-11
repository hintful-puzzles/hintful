# Tasks

- [x] 1.1 Read `docs/help-pages.md` and the `help-pages` capability. Re-check
  each of the twelve against the code as it is now.
- [x] 1.2 Sort them: prevented by a declaration the engine already renders
  from; preventable by rendering from `requestKeys`, `canMarkAll` or
  `prefs`; hand-written with no declaration behind it. Record the counts.
- [x] 2.1 Render what the second pile shows is worth rendering, for every
  game, and see the guard that holds a page to it fail on one of the twelve.
- [x] 2.2 Correct the rest by hand, and the keys each page leaves out.
- [x] 2.3 Open each changed page in the running app.
- [x] 3.1 The spec deltas, `docs/help-pages.md`, validate, the gate, commit,
  push, archive.

## What was found (2026-10-11)

All twelve still held against the code.

- **Prevented by `targetVerbs` as it renders today: none.** Black Box,
  Dominosa and Loopy declare it, and each of their defects is in the prose
  after `{{controls}}` or in the Hints section.
- **Preventable by rendering from a declaration: four**, the three `M`
  sentences (Seismic, Solo, Unequal) from `canMarkAll`, and Seismic's sticky
  pencil mode from the preference. Both are now generated
  (`vite-plugins/note-controls.ts`). The sticky sentence was wrong on ten
  pages, not one: every game offering the preference starts with it on, and
  each page called it a mode "a preference switches on".
- **Hand-written with no declaration behind it: eight**, corrected by hand.
  Four are Hints prose (Dominosa twice, Inertia) or a description of what a
  press shows (Black Box); Bridges' `G`, Cube's keypad twice and Loopy's pair
  are keys of the game's own `interpretMove`.

Declined, with the reason:

- **The keypad from `requestKeys`.** None of the twelve is a key the on-screen
  keypad offers: Cube's are the hardware number pad's, which `requestKeys`
  does not list.
- **What a second Mark-all press crosses out.** It is each game's own (a row
  and column, a cage, a neighbor's color, nothing in Seismic and Undead), so
  the generated sentence states the additive rule the engine guards and each
  page adds its own second half by hand.
- **Singles' wrapping cursor**, which its geometry declares (`wrap: true`):
  one game declares it, so the page says it by hand.

Found on the way and fixed here: the links to `../features#difficulty` on
Galaxies, Map, Spokes and Undead led to `/features`, which is no page. The
help-coverage guard now holds a `../` link to naming a game.

Of "A help page shorter than the code", left as they were: Palisade (the page
does not claim an order) and Sokoban (the page's "shortest way round" is what
`route` in `src/games/sokoban/motion.ts` walks: the fewest steps).
