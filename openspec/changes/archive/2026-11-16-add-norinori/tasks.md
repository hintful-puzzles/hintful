# add-norinori: tasks

## 1. The game, description-first

- [x] 1.1 Confirm the rules against the cited sources (design.md)
- [x] 1.2 Write `norinori.description.yaml`: help, rules, ladder, words
- [x] 1.3 Scaffold from the grid skeleton; state, solver, hint (no
      `hint-text.ts`), generator, render, index
- [x] 1.4 Move Star Battle's region walls to `engine/region-walls.ts`
- [x] 1.5 Register the game; its `help/puzzles.md` row
- [x] 1.6 Deal speed at every preset; presets and size bounds from it
- [x] 1.7 Tests: own, generation, hint pins (`hint-scan`)
- [x] 1.8 Soundness verdicts for every technique (`describe-check`)
- [x] 1.9 `npm run game -- norinori` green; capability and params snapshots
- [x] 1.10 Icons; the game's spec delta
- [x] 1.11 Run the app: pointer, keyboard, touch; hint at every stage; a
      subagent reads the hint's words against the board

- [x] 1.12 The owner's playtest (2026-11-16: "I love the game so far, as
      well as its hints"), and their calls, each now a change of its own:
      outline what closes a region's room (`say-why-a-region-has-no-room`),
      a domino drawn as one, by the engine (`draw-dominoes-in-the-engine`),
      and no color word for a state (`name-states-by-rule-not-color`)

## 2. What the session records (the change's deliverable)

- [x] 2.1 Hand-written lines by file, against Star Battle's
- [x] 2.2 Every place the engine made the game say something not about
      Norinori, mended or filed
- [x] 2.3 Which techniques follow from one rule alone
- [x] 2.4 How long each part took
- [x] 2.5 File `pair-compiled-rungs-in-the-engine` and
      `norinori-larger-boards`
