# Design

## The measure (2026-11-17, at 0bdcbd5ce)

`scripts/new-game.sh zzgame` in a scratch worktree, then the game registered
by hand and `npm run game -- zzgame` run once, files untracked (176 s):

| Proposal's item | At HEAD |
| --- | --- |
| Typecheck red from the start (`pins: {}`) | The copy's pins are scanned, so it is green as stamped; it goes red the moment the rungs are renamed, until `hint-scan` has run. Still true. |
| Stale snapshots copied | Copied. |
| Stale `soundness.json` entries copied | Copied, and nothing refuses one whose technique is gone. |
| `skip_specs` refused only at the verdict | Still; `openspec validate` words it well, it is only late. |
| `npm run game` needs `git add -N` | `unused-exports` and `absence-spelling` read tracked files only, so an untracked game passed them in the verdict and could fail them at the commit. |
| Menu shape rules one verdict at a time | The skeletons' presets already hold a portrait rectangle. The rectangle refusal did not say that a rectangle must be portrait, so the fix it invited (8x6) met the portrait rule a verdict later. |
| First verdict late | The guide put it after registration, which came at step 5. |

The first verdict also refused the copy itself on a rule the item list did
not name: **both skeletons still kept a `hint-text.ts`**, which
`hint-text-convention.test.ts` refuses in any game, because the move of every
game's sentences into its description passed over `src/skeleton/`. A new
game was refused by the convention at birth. Other refusals were records a
new game owes by hand (its icons, its `help/puzzles.md` row, two snapshots)
and its spec.

## Decisions

- **Scaffolding stays `scripts/new-game.sh`**, with registration in
  `scripts/new-game-register.mjs` beside it. A `npm run new-game` would be
  a second name for the same thing; the script works, and every guide
  names it.
- **The scaffold registers the game.** No cross-game guard reads a game
  until it is registered, so registering at step 5 is what made the
  refusals arrive one at a time. The catalog entry describes the skeleton's
  puzzle, as the copy's help page does, until the author replaces both.
  This reverses the scenario "The checklist is printed, not performed" for
  the registry and catalog; the icons and words stay the author's.
- **Snapshots are not copied; soundness verdicts are.** A snapshot is the
  skeleton's output, so the copy's own tests write the copy's. A verdict is
  a fingerprint of a technique the copy has verbatim, so it is true of the
  copy; what was wrong was that a verdict outlived its technique silently.
  `unchecked()` now returns `orphans` and `compile.test.ts` refuses them.
- **`skip_specs` is removed by the scaffold** from `add-<id>` where present:
  the game owes its spec from its first line, and the verdict says so from
  its first run.
- **A missing pin is a test failure, not a type error.** `pins` is
  `Partial<Record<…>>`: a misnamed pin still fails to compile, a missing one
  fails "every kind's pin fires its kind" with the `hint-scan` command. The
  compile-time "every rung has a pin" bought nothing the test does not, and
  cost an hour of red typecheck on every new game.
- **The verdict reads the game's untracked files** through
  `scripts/checks/listed-files.mjs` and `GAME_VERDICT_UNTRACKED`; the gate
  does not, since an untracked file is left out of the commit.
- **The skeletons' sentences move into their descriptions**, the edges
  skeleton's Check onto `breaks:` as Path's, and the convention guard now
  reads `src/skeleton/` too, so a skeleton cannot drift off it again.
