# state-what-a-games-spec-never-did

**Status: filed 2026-10-09 by the session that archived `regroup-the-specs`,
on the owner's word that its findings merit a change. What it says of the
specs was true that day; re-check before relying on it.**

## Why

The pruning's criteria say what always stays in a game's spec: a description
format, a params encoding, a preference key or a save field (what a saved
game or a shared link depends on); what a control does; and everything a hint
does and says. Settling the doubtful requirements found about twenty places
where a game's spec has never said one of these, so there was nothing to keep
and nothing to restore. The archived
`2026-10-09-regroup-the-specs/found.md`, § "Something a game's spec has never
stated", lists them:

- **A description format:** Net, Twiddle, Cube, Flip, Flood, Mines (both of
  its forms), Pegs.
- **A params encoding:** Group, Pegs.
- **A params refusal:** Keen's multiplication-only 9×9 above Tricky,
  Galaxies' 3×3 at Unreasonable.
- **Controls:** Blackbox, Signpost, Clusters' modifier arrows, Guess's label
  toggle, which corner each Twiddle letter turns.
- **A hint:** Mosaic, Signpost, Boats' techniques and their order, four of
  Towers' clue techniques, Mines' order.
- **Words a player reads:** the status bars of Mosaic and Blackbox, and what
  Netslide's preset titles mean.

The first two matter most. A description format is a promise to every saved
game and shared link, and today the only statement of seven of them is the
parser. A session changing one has no rule to check its change against, and
`AGENTS.md` asks it to stop before breaking such a promise.

That list is what one pass happened to notice, working from doubts about
other requirements. It is a sample and not a census.

## What Changes

- A census, derived from the code, of what every game's spec owes: for each
  registered game, whether its spec states its description format, its
  params encoding, each of its preference keys, its controls, and its hint's
  techniques and order.
- A requirement for each gap, written from the code and the help page and
  checked against both, in the game's capability.
- Nothing a player sees, and no code.

## Capabilities

### Modified Capabilities

Each game whose spec gains a requirement: the sixteen named above at least.

## Impact

- `openspec/specs/<game>/spec.md` for those games, and
  `docs/games/README.md` if the census shows what a game's spec is expected
  to hold needs saying there.
