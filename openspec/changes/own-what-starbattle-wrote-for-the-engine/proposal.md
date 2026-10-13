# own-what-starbattle-wrote-for-the-engine

**Status: scaffolded 2026-10-13, not started.** Filed by `add-starbattle`,
whose `findings.md` (archived with it) is the measurement behind each item.
It needs no answer from the owner to start. It has no `tasks.md` yet: the
session that takes it up writes them.

## Why

Star Battle was written whole in one session as the measurement of
`fit-a-new-game-in-one-session`. Four things it wrote, or worked round, were
not about Star Battle, and the next game of its kind would write them again.
In the order of what they cost:

1. **Mending a division until it has one answer.** A board whose regions
   are its only clue almost never has one answer as dealt (none of 300 at
   8x8 with one star, measured 2026-10-12). `starbattle/generator.ts` mends
   it: search for a second answer (`solvedPositions`), move a cell that
   breaks it into a neighboring region, keep both regions connected and no
   smaller than a least size, and where no second answer is found move a
   cell the ladder left open and keep the move unless more cells are left
   open. Only the ladder call is the game's. The search is three fifths of a
   deal's time and runs again on every kept move, which is why a 12x12 takes
   2 to 14 seconds.
2. **`OverlaySidecar.pack` asks for ringed notes**, so a game with no notes
   cannot use it without `warm-repaint.test.ts` holding it to painting one,
   and keeps its ring, stripes and outline sides in a tile key of its own
   (`starbattle/render.ts`).
3. **`verbClicks` takes the first button the game's keep-track does not
   refuse.** A keep-track that allows the first press of a two-press cycle
   then makes the gesture stop a click short, so Star Battle keeps a second,
   stricter judge for the gesture (`starbattleMakesStep`).
4. **The skeleton is a rectangle.** A board sized by one number changes the
   size item, its codec segment and `transposeParams` by hand.

## What Changes

- An engine walk that mends a division against a game's judge (what the
  board leaves open, and a second answer where there is one), with Star
  Battle moved onto it and its boards unchanged for a seed, or the change in
  them stated. Whether a second game needs it first is this change's to
  argue: `docs/doctrine.md` asks a shared layer to be weighed at dozens of
  games, and one game is one.
- `OverlaySidecar.pack` reads the kinds a game's legend has, and Star
  Battle's renderer moves onto it.
- `verbClicks` prefers the button whose click the judge completes or
  shrinks the step on, and Star Battle's second judge goes.
- The skeleton, or `scripts/new-game.sh`, stamps a square board on request.

Also from the same findings, smaller: the table of upstream params strings
in `params-read-whole.test.ts` moves to a module the catalog's test can
read, so that every game whose `collection` is not `own` is required to have
an entry again.

## Added 2026-10-13, at the owner's word

The owner asked for every further pain point of that session to be written
up. These are the ones `findings.md` did not turn into an item above. Two
were small enough to mend at once and are: the catalog's row for
`answer-search.ts` now says a generator may want it, and the stamp's
checklist names the `stripes` role and the origins heading.

5. **The right button is the cross, and nothing holds a game to it.** Star
   Battle shipped with the cross on the left button and was turned round on
   the owner's first play. The rule is now in `docs/input.md` § "Targets
   and verbs". The engine could own it: a `ruledOut` verb a game declares
   in place of `secondary`, which the model puts on the right button and
   Space, whose `does` phrase and cross it supplies, and which a guard can
   then find. Count first how many games' `secondary` is a cross.
6. **A star that brings its crosses is three pieces a game wires by hand.**
   The `auto-cross` preference needs a verb that reads the `Ui`, a
   keep-track that leaves the brought crosses out of its judgment, and a
   plan that ends at the first star. Other games place a thing and leave
   the player to cross out what it rules out; Tents and Light Up are the
   first to look at. A declared "what this placement rules out at a glance"
   would give each the preference and its three pieces.
7. **The skeleton speaks of a ring and an outline, and never of stripes.**
   A hint about a row, column or region stripes it
   (`docs/hints-marks.md` § "Hatch the line the sentence names"), which
   most grid games' hints are. The skeleton's second rung could name its
   number's row so the copy starts with all three roles drawn.
8. **A registered game is asked for its spec before its change can
   archive.** `spec-subjects.mjs` refuses a game with no
   `openspec/specs/<game>/spec.md`, and a game that waits for the owner's
   acceptance has only a delta. Star Battle's spec was copied to
   `openspec/specs/` by hand, and its archive must skip the merge. Either
   the check reads an open change's delta for a game that has no spec yet,
   or `docs/new-game.md` § "The acceptance gate" says to sync.
9. **Three gate checks first spoke at the commit**, each after a ninety
   second wait: `absence-spelling` (a `| null | undefined`), the strict
   form of `openspec validate` (a requirement over 500 characters, which
   the plain form passes), and `unused-exports`. `npm run game` could run
   the checks that read a game's own files and its change, since it already
   says which gate checks it leaves out.
10. **A scratch census has no home.** One throwaway vitest file in the
    game's directory was rewritten about ten times, each time to print a
    table by throwing it, and then deleted. `npm run deal-walk` measures the menu's sizes at the tiers
    a finished game declares, and nothing measures a generator that is
    still being written: tries, boards by lowest solving tier, and time, at
    a list of params.
11. **`presetGrid` and rulesets.** Splitting a menu by ruleset took one
    declaration, and then a ledger line in `preset-menu-shape.test.ts` for
    each tier a ruleset does not offer, keyed by game and not by ruleset, so
    the reason for Two stars and the reason for Three share a line.

## Capabilities

### Modified Capabilities

- `engine-helpers`, `engine-hints`, `engine-input`, `repo-layout`: as the
  items above land. The session that takes this up names the requirements.

## Impact

`src/engine/`, `src/skeleton/`, `src/games/starbattle/`. No player-visible
change is intended; a change in which board a seed deals is allowed and is
said.
