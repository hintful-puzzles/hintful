# link-upstream-by-game-id-only: design

## D1. Drop the link rather than gate it per game

The alternative was to keep the seed link for games whose generator still
matches upstream's. Nothing can say which games those are. A game matches only
on the seeds that never reach a divergence, which `deal-every-tracks-board`
measured at 0% to 96% of seeds depending on the preset. A per-game flag would
be exactly the kind of statement beside the code that nothing checks
(AGENTS.md, "One source of truth"). The game ID link already opens the same
board, so dropping the seed link loses nothing a player needs.

The function takes no seed at all. That makes "never link upstream by seed"
part of its signature. `upstream-links.test.ts` also asserts what each link
names, and it fails with a seed link planted back.

## D2. Not changed: the in-app link still prefers the seed

"This specific game" is `params#seed` whenever the board came from New Game,
and the game ID otherwise. The same divergence that motivated this change
means such a link can deal a different board after a generator change.
`deal-every-tracks-board` did that to most Tracks seed links above Easy, with
the owner's agreement. Preferring the game ID would make in-app links durable
across versions, but it changes what every shared link looks like and how long
it is, so it is the owner's decision and not part of this change. It is raised
with the owner in the session that archived this change.

## D3. Wording

The Game ID field keeps the existing "any compatible app" sentence. The Random
seed field says "Deals this same game again in this app". In the help, the
Game ID bullet in the Share section explains the difference, and the sentence
about opening links from Simon Tatham's website notes that a seed link may
deal a different board here.
