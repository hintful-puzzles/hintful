# link-upstream-by-game-id-only

Found by `deal-every-tracks-board`, and taken up in the same session at the
owner's request (2026-10-02).

## Why

For a puzzle that Simon Tatham's site carries, the Share dialog links the
board on screen there three ways: by game ID, by random seed and by puzzle
type. The seed link opens the same board only if our generator deals what
upstream's deals for that seed. Since byte-parity was released, nothing
promises that. Tracks now deals a different board than upstream for 37–96% of
seeds above Easy, and Solo's Killer generator diverged on 2% of seeds before
that. The player follows a link labeled "play this game at Simon Tatham's
website" and gets a different game. The game ID link beside it always names
the same board, because the board travels in the ID.

The panel's hint makes the same claim about the seed field in the app: "Enter
into any compatible portable puzzle collection app to play this same game".
That holds for the game ID and not for the seed.

## What Changes

- The Share dialog no longer links to upstream by random seed. The game ID
  and puzzle type links stay.
- The "any compatible app" hint moves onto the Game ID field. The Random seed
  field gets its own hint: it deals the same game again in this app.
- The help's Share section says which of the two IDs is portable, and that an
  upstream link by seed may deal a different board here.
- The upstream links become a pure function, `upstreamLinks`, with a test.

## Hints to pull in

None.
