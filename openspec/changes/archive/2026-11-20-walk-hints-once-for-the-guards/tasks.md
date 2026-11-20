## 1. One walk

- [x] 1.1 Read each `src/engine/hint-*.test.ts` and `solve-finishes.test.ts`;
      list each walk's population, boards, limit and per-step check.
      Found (2026-11-20): six walk a midend over `HINT_GAMES` × `gatePresets`
      — gesture (every board, 2000 steps, Marks key after each play), ink
      (every board, 4, each reference's ops in its role's ink), mark (every
      board, 6, ring shape and no fill), look (first board, 8, one mark then
      the whole step), overlay (every board, a warm frame repaints on Hint)
      and mid-animation (first board, one step pressed mid-animation). The
      last two are not press-read-apply loops and take only the boards.
      The others walk `game.hint()` without a midend (quality, resume,
      text-convention, walk-fingerprint), each with its own rounds, stride
      and refresh, and stay so. `solve-finishes` is no hint walk: it solves
      from `probeBoard` positions, and moves to enrollment under 2.1.
      `hint-finishes-any-board` walks from a scrambled board, not a slice.
- [x] 1.2 Write the shared walk with a visitor; move the walks onto it one
      by one, each keeping its limit. Plant the defect each guard exists for
      once after the move and see it fail.
      `testing/hint-walk.ts`. Planted and failed: the Marks key's state
      (gesture, on Guess), the look beat (look), the settle before a press
      (mid-animation), an outline side filling its cell (mark), an outline
      side in the next palette slot (ink, on Unequal), the sidecar never
      stale (overlay, four games).

## 2. One population path

- [x] 2.1 Move the guards reading `registeredGameIds()` directly onto
      `enrollment.ts`, or record why one needs another population.
      `REGISTERED_GAMES` / `REGISTERED_IDS`. Left on the registry: the build
      (`build-facts.ts`, not a guard) and `game-id-of.ts`'s error message.
      `help-coverage.test.ts`'s per-game cases take the catalog, one help
      page an entry.

## 3. Per-game tests that repeat a guard

- [x] 3.1 For hint-to-solved, save round-trip and params round-trip, list
      the per-game tests that repeat the guard's case; remove each whose
      case the guard covers at the same strength.
      The guards are `hint-resume.test.ts` ("a hint can solve from any
      mid-game position": every gate preset to solved, `findMistakes` after
      each move), `save-round-trip.test.ts` and the params codec checks in
      `difficulty-contract.test.ts` / `custom-params.test.ts`. Each titles
      its cases `<id>: …`, so a commit to the game still runs them: no local
      feedback is lost by a removal. Before removing one, check
      `scripts/feedback-probe-cases.mjs` for a case that relies on it, and
      keep a per-game test that pins more than the guard (an answer check
      on each step, a hand-written move the guard's input never makes).
      Found (2026-11-20). The params guard is `params-stability.test.ts`,
      which compared through the encoding only; it now also asserts that the
      menu's params (default, presets, tiers) decode to the record itself.
      Only Solo failed that: a plain board's `kdiff` is never encoded, so its
      presets now carry the decoder's default (no encoding moved; the
      snapshot lost only the duplicate rows). Eleven per-game round-trips
      over menu params went; the rest pin a brief form, a lenient or legacy
      string, or params off the menu. The save guard logged no move for nine
      games (Bridges, Numgame, Path, Spokes, Untangle, Wordtrail: its presses
      never release or drag; Pegs, Slide, Wordguess: blind input reaches no
      move). It now plays three hinted moves and seeded `randomGesture`s, and
      its self-check counts the save's moves instead of consumed presses
      (planted: an unhandled Untangle move, missed before, now fails). Eleven
      per-game saves replaying a move kind the guard now plays went; Adjacent
      and Pattern lost their empty-log halves. Of the hint walks, only
      Group's, Unequal's and Mathrax's 5x5 Normal repeated the gate's case:
      the rest walk larger boards, check the answer each step, start from
      the player's marks, or forbid the refusal the guard accepts. No probe
      case names a game test.
- [x] 3.2 Update the skeletons' test files so a stamp no longer copies them.
      The params tests keep only the brief form and an off-menu string; the
      hint walks (answer each step) and saves (literal text) pin more.
- [x] 3.3 `docs/testing.md`: the walk, and the one population path.
- [x] 3.4 Run `npm run test:hint-sweeps`; commit, push, archive.
