# rules-out-from-the-description

Filed 2026-11-16 from the debrief of `add-norinori` and
`draw-dominoes-in-the-engine`, as the engine's finding; the owner agreed to it
the same day.

## What the work found

A game offers the `auto-cross` preference by declaring `Game.rulesOut`, a
`bring(before, after)` written in TypeScript (`docs/mechanics.md`
§ "Preferences"). Every game that declares one is a described game, and its
`bring` restates techniques its description already states:

- Norinori's `ruledOut` (`norinori/index.ts`) is the description's `domino`
  and `fullRegion`, and `dominoPartner` (`norinori/state.ts`) restates the
  description's `lit(c) = 1`.
- Star Battle's is its `around`, `fullLine` and `fullRegion`, and its comment
  says so: they "conclude the same squares on every board whose marks are
  consistent".
- Tents' and Light Up's are the same shape (find the population by the
  reference: the games whose `Game` sets `rulesOut`).

A second copy of a rule, kept by hand beside the one the engine runs, is
what `docs/doctrine.md` refuses. It also differs where the marks are
inconsistent, which each game decides for itself today.

## What this change does

- A description names the techniques a placement brings (`brings:` on the
  description, or a flag on each technique), with the preference's words.
- The engine builds `rulesOut` from them: it runs those compiled techniques
  on the board after the move, keeps the firings whose evidence includes a
  square the move placed, and answers with their conclusions as one move.
  The game writes no `bring`.
- The four games move over, and their hand-written `bring` and helpers go.
  A game whose `bring` the techniques cannot say keeps its own, and says why.

## Before it starts

- Settle in the design what "the evidence includes a placed square" reads:
  a firing's `reads`, its `for` bindings, or a new declaration; and what an
  inconsistent board brings (today Star Battle still crosses round a star
  placed beside another).
- `rules-out.test.ts` plays every declaring game's hint with the preference
  on; keep it, and see it fail on a planted difference before trusting it.
- Measure: the compiled techniques run on every move with the preference
  on; time a move on the largest Custom board of each game.
