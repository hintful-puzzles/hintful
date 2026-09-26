# turn-the-timer-on-everywhere — tasks

- [x] 1.1 `show-timer` defaults on in the midend; `Game.isTimed` deleted with
      every game's declaration (61 lines by script, verified by shape: every
      removed line was an `isTimed:` declaration and nothing was added).
- [x] 1.2 Tests: the midend timer tests start from "on"; the animation-only tick
      test switches the timer off to isolate the animation half; Untangle's
      preference defaults include `show-timer: true`.
- [x] 1.3 Spec deltas: `ts-engine` by hand; the twenty game requirements that
      named `isTimed` generated, then checked against the live text with
      whitespace folded: each differs only by the clause, except the two Mines
      rewrites, which were read.
- [x] 1.4 Help and `docs/games/mechanics.md` updated.
