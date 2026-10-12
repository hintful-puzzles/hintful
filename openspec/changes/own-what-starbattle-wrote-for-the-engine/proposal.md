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

## Capabilities

### Modified Capabilities

- `engine-helpers`, `engine-hints`, `engine-input`, `repo-layout`: as the
  items above land. The session that takes this up names the requirements.

## Impact

`src/engine/`, `src/skeleton/`, `src/games/starbattle/`. No player-visible
change is intended; a change in which board a seed deals is allowed and is
said.
