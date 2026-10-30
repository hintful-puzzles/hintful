# show-how-to-play-on-first-open

**Status: filed on the owner's word (2026-10-30)**: "see about having each
game pop up its 'How to play' panel (or perhaps a friendlier summary thereof)
on the very first time that a player opens it", with a review of the help
texts "to see that they really are newbie friendly" in the same change. The
owner left the details to the session that takes this up, and suggested a
UX / technical-writer subagent as a consultant.

## Why

A player who opens a game for the first time meets a board with no idea of
its rules. The help is there, one row down in the menu, but nothing offers
it. And some pages do not stand alone once found: ABCD's Controls open with
"ABCD uses the same control scheme as Solo, but with letters instead of
numbers", which sends a newcomer to a game they have not played.

## What Changes

- **On a game's first open, the app shows how to play it**: either the How to
  play drawer itself or a friendlier short summary that leads to it, which
  the session decides with the consultant. It is shown once per game,
  dismissed in one action, and never again unasked. It works with touch,
  keyboard and mouse, at every screen size, offline, and accessibly (focus,
  a screen reader's announcement, Escape).
- **Every game's help page is reviewed for whether it stands alone for a
  newcomer**, and what the review finds is fixed in the pages in this change.
  The named antipattern is a page that leans on another game's page.

## How the work is done

The session consults a UX / technical-writer subagent, as the owner
suggested, on two things: the first-open experience (what is shown, when,
how it is dismissed, and how it reads on a phone), and the review's criteria
(what "stands alone for a newcomer" means, as a checklist the review applies
to every page). The consultant is given the facts below and the pages, not
the session's own conclusion. The session then designs, writes the spec
deltas, implements, and fixes every page the review flags.

## Facts the session starts from (2026-10-30; re-check before relying on them)

**Where How to play lives and how it is shown.**

- One markdown page per game in `help/games/<puzzleId>.md`, rendered by the
  `help/games/*.md` entry in `vite.config.ts` through
  `help/_game.html.hbs` and served at `/help/<puzzleId>`. Site-level pages are
  `help/*.md`. The page count is `ls help/games/*.md | wc -l`.
- The menu's row is the `help-link` entry in `src/puzzle/command-list.ts`
  (label `How to play <Game>`), rendered as a real link by
  `src/puzzle/components/menu.ts`. `Screen.interceptCommandAndHrefClicks`
  (`src/screens/screen.ts`) routes any help URL (`isHelpUrl`,
  `src/routing.ts`) to `Screen.showHelpViewer`, which lazily imports and
  opens `src/components/help-viewer.ts`: a `wa-drawer` with `light-dismiss`
  that loads the rendered page through `wa-include`, with its own history.
  Its source still has TODOs for key handling (arrows, page scrolling).
- Pages are HTML, so the service worker's precache (`globPatterns` in
  `vite.config.ts`) includes them; offline use rests on that.
- A one-line summary of every game already exists: `objective` in
  `src/puzzle/catalog-data.ts` (ABCD: "Place letters according to the
  numbers. Identical letters cannot touch."). The page's own unheaded
  rules, before `## Controls`, are another candidate. Either could seed a
  short summary without a second copy of the rules.
- `src/dialog-dismissal.test.ts` holds the rule that a surface a player only
  reads closes on a click away from it; a new panel falls under its scan.

**What could record "has opened this game before".**

- Settings live in IndexedDB through Dexie (`src/store/db.ts`):
  `CommonSettings` once, and a `PuzzleSettings` record per game, read and
  written by `src/store/settings.ts`. Saves are `src/store/saved-games.ts`
  and `src/store/kept-boards.ts`.
- `PuzzleSettings.lastGameId` is written when a game deals or opens a board
  (`src/screens/puzzle-screen.ts`), and has been since 2026-08-21. A record
  with it set already means "this player has opened this game here", so the
  first open could be read off it with no new field. It is cleared when the
  remembered board will not load, and `clearPuzzleSettings` deletes the
  record, so that reading would show the panel again in those cases.
- A new optional field on `PuzzleSettings` is the other route. An optional
  field is additive: every record written before it reads as unset, and the
  settings backup (`SerializedSettings`) carries it with the rest. **It is
  not a compatibility break**, so the rule "ask before changing what a
  player's data holds" (`AGENTS.md`, `docs/work-management.md` § "What the
  owner accepts") asks nothing of it on that account. What it decides is who
  sees the panel, which is the owner's question 2 below.

**The help pages.**

- `docs/help-pages.md` and `openspec/specs/help-pages/spec.md` govern them;
  `src/help-coverage.test.ts` holds the skeleton (rules unheaded, then
  `## Controls`, own sections, `## Where the puzzle comes from`, `## Hints`,
  parameters last). Credits are moved, never rewritten (help-pages.md § "A
  game's page"). The requirement "Adopting or relocating a help page changes
  no words" binds an adoption, not a later fix; the session confirms that
  reading before rewording adopted text.
- Examples of a page that does not stand alone (a sample, not a census;
  the query is `git grep -n -i "same control\|similar to Solo\|as Solo" help/games/`):
  - `help/games/abcd.md`, `crossing.md`, `mathrax.md`, `salad.md` and
    `seismic.md` open their Controls with "uses the same control scheme as
    Solo" (Salad: "similar to Solo"), then each restates part of it in its
    own words.
  - `help/games/group.md`: "If you don't already know what a group is, I
    don't really recommend trying to play this game", and the rules lean on
    linked Wikipedia articles.
  - Pages that say "the same as pressing 'M'" (`abcd.md`, `keen.md`,
    `towers.md`, `group.md`, `solo.md`, `unequal.md`) name a key the reader
    may not have met yet in that page.
- `help-pages.md` § "A game's page": a sentence several pages would each
  write is the engine's, rendered from a placeholder (`{{mark-all}}`,
  `{{sticky-pencil}}` in `vite-plugins/note-controls.ts`). The Solo-style
  entry controls that five pages describe by reference are that shape; the
  engine-first fix is a generated sentence, not five hand-written ones.

**What rules bound it.**

- No progression features (`docs/doctrine.md`, `AGENTS.md`). A "seen" flag
  stays clear of that line as long as it is never shown, counted or
  rewarded: no "games tried" tally, no checklist, no badge.
- `openspec/specs/app-shell/spec.md`, "The chrome offers the hint and never
  urges it": the same spirit applies here. The panel is shown once and then
  offered only as it is today; it does not push the hint, and it does not
  come back as a reminder.
- No spec today governs first-run behavior; `app-shell` and `help-pages`
  are where the deltas go.

## Questions for the owner

The session brings these with what it and the consultant found, and only if
the consultant finds no clear winner:

1. **The full How to play drawer, or a short summary that links to it**, on
   first open.
2. **Players who have already played a game before this ships**: do they see
   it once on their next open of each game (a new field), or not (read the
   first open off `lastGameId`)?

## Acceptance

The owner's, in the running app, since they asked for it by name. Before
handing over, the session runs the app (Chrome, through the `playwright-cli`
skill) and sees, on a phone-sized and a desktop-sized window: a game's first
open showing the panel, its dismissal by touch, keyboard and mouse, a second
open not showing it, and the same offline. Every help page passes the
review's checklist, and the pages it changed are read in the app.
