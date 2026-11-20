## Decisions

**A guard's verdict should move only when what it guards moves.** Both
guards keep their purpose; what changes is which boards they read.

**Mark-collisions.** Today a declaration is a pair of palette indices,
checked exact against one frame. Two loosenings, used together or alone:

- a declaration names a slot against a range (`COL_TEXT` against every
  `COL_HUE_TEXT + i`), so a game with a variable number of colored items
  declares once;
- staleness is judged over a small fixed set of boards per game (the
  presets' first seed, say), so a pair is stale only when none shows it.

Read `engine-colors` § "Two unrelated marks are not one color and one shape"
before choosing; the rule's purpose is that a new collision is noticed, and
neither loosening may hide one.

**Warm-repaint.** Replace "one seed plus hand pins" with "seeds tried in
order until every paintable mark has been painted, up to a bound". The
search is deterministic, so a failure reproduces. Its cost goes on every
game's run, so measure the bound: most games are covered by their first
seed today, and the search must stop there for them. A hand pin remains
for a mark no seed within the bound paints (a mistake frame, a state only a
move sequence reaches; `WRONG` stays as it is).

**What stays hand-kept.** `WRONG`'s board-and-moves pins express a sequence
a search cannot find cheaply; they are encoded descs, stable across dealer
changes, and are not this change's subject.

## Risks

- A seed search can make the guard slower on a busy machine. The test
  prints which seed covered which mark, so a slow game is visible.
