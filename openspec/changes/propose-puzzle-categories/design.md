# propose-puzzle-categories — design

## D1. A family is a value a mechanism consumes, and maintenance may read it

`AGENTS.md` separates two things called "declaration". A value that a mechanism
*consumes* is healthy. A statement *about* a game that only a guard reads is a
manifest, and the rule is to refuse it. The family is the first kind: the
chips, the search and the switcher all run on it, just as search runs on
`aliases`.

The owner also wants the families to serve maintenance, and the two uses do not
conflict as long as the line is kept here:

- **Reading a family to choose a population is fine.** Examples: a measurement
  campaign's corpus, an audit's scope, a doc's "the shading puzzles". Before
  this change each campaign typed its own list, and a typed list goes stale.
  `puzzlesInFamily("latin")` does not.
- **Enrolling a game in an engine mechanic *only* because of its family is
  still a manifest.** If a game joins a shared mechanic by having it (calling
  the helper, emitting the reason), that remains the enrollment. A family can
  name the population a *measurement* runs over. It is never the only thing
  standing between a game and a guard.

## D2. Hold a tag to the code wherever the code can vouch for it

A hand-written tag is only as good as whoever wrote it, so wherever the code
can say which family a game belongs to, a test asserts agreement. Latin squares
is the family where this is cheap, and it bounds from both sides:

- **below**: any game importing `engine/latin-hint` narrates rows and columns
  holding each symbol once, so it must be a Latin square;
- **above**: any game tagged Latin squares must use `engine/latin` or
  `engine/latin-hint`.

The bounds differ (Ascent, Singles and Tents borrow a Latin helper without
being Latin squares), and they need not match. A sandwich still catches both
directions of error: planting Keen in "Numbers & letters" failed the lower
bound, and planting ABCD in "Latin squares" failed the upper. Both were seen
red before the tags were restored.

The other families are editorial. Nothing in the code separates "Regions" from
"Shading" without a manifest, and the history in `AGENTS.md` § "Documentation"
shows that sweeping vocabulary to approximate such a split does not work. When
a second family gains a code-level signature (say, a shared shading engine),
it gets a sandwich of its own.

## D3. One family per game, and none of one

A family of one is a link, not a family, and an empty family is a chip that
does nothing, so the guard refuses both. A new game that fits nowhere gets a
new family only once there is a second member; until then it goes in the
nearest existing one. `docs/games/README.md` states this at the registration
step.

## D4. Where "more like this" lives

Two places were considered:

- **A "similar puzzles" section on each help page**: rejected. The help viewer
  (`help-viewer.ts` `handleDocumentClick`) loads every same-origin link inside
  its own drawer, so a link to `/solo` would open a whole puzzle page inside
  the help panel.
- **The quick-switch**: chosen. It is already the puzzle screen's way to reach
  another game, on the keyboard and through `More… → Switch puzzle…`. With
  nothing typed it previously showed an alphabetical list, which wasted the
  moment the player asked the question. Once anything is typed, the search
  takes over and the grouping disappears.

The grouped list is still one flat sequence for the arrow keys. The group
headings are `role="presentation"` rows, so keyboard navigation is unchanged.

## D5. Chips beside the filter, not instead of it

The chips narrow independently of All / Favorites / In progress, so "my
favorites among the shading puzzles" takes two taps. There is no "All families"
chip: pressing the pressed chip releases it, which avoids a tenth chip that
means "none of these". The chips wrap rather than scroll sideways. At 390px
that is four rows, and every family stays visible instead of hiding behind a
swipe nobody knows to make. Checked at 390px and 1440px, in both color schemes.
