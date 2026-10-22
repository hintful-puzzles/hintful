# faster-harder-path

Filed 2026-10-22 on the owner's word: "The new Path implementation is too
easy on the preset sizes, and it takes really long to open longer sizes. I'd
like you to please optimize it, and add harder presets."

## Why

**Slow.** An 11x11 board took 1.7 to 7.4 s to deal in Node, and larger
boards grew faster still. Profiled, four fifths of it was laying the paths,
not solving them: `layPaths` joins one-square paths at random and throws the
whole layout away when a path of one or two squares is walled in, and at
11x11 it did that 460 to 2,000 times a board. The rest was the ladder
scanning every square again at every firing, inside every supposition.

**Easy.** The menu topped out at 9x9, and Normal was the hardest tier. The
pairs a board keeps are set by the ladder, not the paths laid: the generator
adds numbers until the ladder finishes the board and strips the ones it does
not need. So a harder board needs a stronger rung the player can still
follow, and a generator that deals boards needing it.

## What changes

- **Dealing is fast at every size.** A path too short to stand is joined
  before it can be walled in; the ladder keeps its pieces of line as it goes,
  and remembers which squares have nothing forced until a write touches them,
  so a supposition looks only at the squares its walk reaches. A Normal 20x20
  deals in about half a second.
- **A Tricky tier**: the same supposition as Normal's, followed until the
  board breaks, but for up to twelve forced firings where Normal allows six.
- **A walk is measured as the hint shows it.** A supposition's walk is cut
  down to the firings its break needs before it is held to its tier's limit,
  in the solver, not only in the hint: the Easy rung fires squares the break
  never reads, and counting them graded boards Tricky whose every step a hint
  showed as Normal's.
- **Each tier is stripped from the one below.** The generator mends a board
  until the Easy rung finishes it and strips numbers tier by tier, so a join
  accepted at the tier asked for is one the tier below could not finish:
  boards need their tier by construction rather than by luck.
- **The menu**: 5x5 at Easy and Normal, 7x7, 8x12 and 10x15 at every tier.
- **The edges skeleton** measures its lookahead's walk the same way, being
  the same defect in the template new edge games are stamped from.
- The Custom dialog's tier description and the help page's hint section say
  what each tier asks of the player.

## Not changed

- No save, desc, shared link or preference changes meaning. `d`-suffixes
  `e` and `n` read as before; `t` is new.
- Normal's limit is six firings, as it was, now counted on the cut-down
  walk, so Normal finishes a few boards it did not. The boards dealt at a
  seed change, which breaks nothing (the app hands out boards, not seeds).
