# Device report — test-touch-on-a-real-device

Two instruments, kept apart because the spec delta says they must be:

- **Laptop** (2026-09-24): headless Chromium 153 via `playwright-cli`, a
  412×860 viewport, mouse and keyboard, against the deployed origin
  `https://hintful.click` and a local `vite preview` of the same commit
  (`24d2e81f`). This covers what the frontend and the host *do*. It is not a
  device pass. Nothing it reports is a verdict on how anything feels under a
  finger.
- **Owner's phone**: Android Chrome at 412 CSS px wide (the width in
  `87fc5b6c`), used for play over the preceding days. `87fc5b6c` and
  `24d2e81f` are fixes from that use. Items marked **device** below are the
  ones still owed a verdict from it.

Verdicts: **pass**, **fail → fixed**, **finding** (works, but a decision is
owed), **not tried**.

**Scope of the device pass (owner, 2026-09-24):** *"I just want basic
confidence in the big picture … we'll be continually testing it anyway."* The
owner played a ten-item subset in the installed app on the phone, taking at
least one game for each concern. The items marked **not tried** were left to
that continued testing by the owner's choice. They are not claimed as passes.

## 1. The seven repaired games

| Item | Verdict | Evidence |
|---|---|---|
| 1.1 Pegs | pass | Press a peg, hold, drag over a neighbor into the hole, lift: the jump lands. |
| 1.2 Filling | pass | Press, hold, drag across a run: the run fills. |
| 1.3–1.7 Flip, Flood | pass | A held tap acts. |
| 1.3–1.7 Cube, Fifteen, Sokoban | not tried | Same promotion path as Flip and Flood. |
| 1.8 swallowed vs. sluggish | n/a | Nothing felt wrong. |

## 2. The control group

| Item | Verdict | Evidence |
|---|---|---|
| 2.1 Mines long-press flag | pass | Long press flags rather than opens. Two-finger tap not tried. |
| 2.2 Loopy three-state tap | pass | Taps cycle an edge, and a fingertip hits the edge meant. Pattern not tried. |
| 2.3 Tracks | pass (by use) | Played at length on the phone during `87fc5b6c`, with no input defect. |
| 2.4 Desktop mouse and keyboard, deployed build | pass | Pegs mouse drag and keyboard cursor movement on `hintful.click`. |

## 3. Reachability

| Item | Verdict | Evidence |
|---|---|---|
| 3.1 Hit targets: Untangle | pass, with a finding | Points are grabbed as aimed, except on the largest board (25 points), where *"a few times … it didn't react on the first tap, but did work on repeat … Could be when there were multiple nodes in close proximity."* Owner: acceptable. Worth revisiting if it recurs: when two points' hit areas overlap, which one wins. |
| 3.1 Hit targets: Loopy | pass | See 2.2. Bridges and Palisade not tried. |
| 3.2 Keypad: Solo | pass | Comfortable, and clear of the board. It prompted a request: see "What the device asked for". |
| 3.3 Keyboard cursor on a small screen | not tried | |
| 3.4 Landscape on the phone | pass | Tablet not tried. |

### Found on the way: four boards framed in unpainted canvas — fail → fixed

On the deployed build, Pegs and Sixteen sat in a **solid black square** in light
mode, and Mines and Pearl had a thin black ring round their edge. The frontend's
canvas is opaque (`alpha: false`), so it starts black, and the engine paints no
pixels of its own: each game's first frame must fill the whole canvas. These
four filled only their cells or their frame. Upstream never had the problem
because its midend filled color 0 on every fresh drawstate, which this engine
deliberately stopped doing (`b49bfdb8`).

Every snapshot was green throughout, because a snapshot records what a frame
drew and cannot see what it did not. A census rasterized every game's first
frame: 57 looked at, exactly these four with bare pixels (Pegs 45%, Sixteen
48%, Mines 3%, Pearl 0.8%). Each now fills its canvas first.
`src/engine/first-frame-coverage.test.ts` holds all 57 to it. It went red on
exactly the four with the fixes reverted.

That most of the other games each write their own full-canvas fill is a
convention the framework should own. That is filed as `engine-paints-the-first-frame-ground`
rather than done here.

## 4. The PWA

| Item | Verdict | Evidence |
|---|---|---|
| 4.1a Installed app: the bottom bar | **fail → fixed** (confirmed on the phone after `a3b82ab7` deployed) | On the owner's phone the installed app showed no bottom command bar, while the same page in a tab did. Pixel-reading the screenshot showed the bar *was* rendered, with only its top 12 device px showing above the system navigation bar: in standalone mode `100dvh` came out about 64 CSS px taller than the window, and `overflow: hidden` clipped the bar off. The puzzle page is now sized by `window.innerHeight` (`src/utils/app-height.ts`, as `--app-height`, with `100dvh` as the fallback), updated on every resize. That is right in a tab and in an app. Chromium check: at 860 and 700 px, the bar's bottom sits on the window's bottom and nothing scrolls. |
| 4.1b Fresh install: favorites | **fail → fixed** (confirmed on the phone) | A new install or private window showed six favorites nobody chose, a starter set inherited from puzzles-web. Storage was verified empty on a fresh profile. Owner: *"this should be up to the player."* `a1ac32f9` starts the list empty. |
| 4.1 Install: name, icon | pass | The deployed manifest says `name: "Hintful Puzzles"`, `short_name: "Hintful"`, `display: standalone`, scope `/`, with 64/192/512 icons and a maskable 512. Installed and launched from the home screen on the phone. |
| 4.2 Offline | pass (Chromium) | On `hintful.click` with offline use enabled, 286 of 286 precache entries were stored (7.2 MB). With the network off: a cold reload of Pegs kept the move in progress; `/`, `/untangle`, `/help/` and `/help/solo` loaded; `/solo`, never visited, generated and drew a new board; the self-hosted Plex faces loaded; no console errors. |
| 4.3 Update flow | pass, as designed | See below. On the phone the deploy of `a3b82ab7` reached the installed app, and the owner reported the update *"resolved"*. The silent reload stands as the design; revisit it only if a reload is ever noticed mid-play. |
| 4.4 Backgrounding | pass | Mines mid-game, another app for a minute, then back: the game and its timer were as left. |
| 4.5 Preflight | pass (owner's phone) | The app has been in daily use on the phone, so `preflight.ts` does not block it. |
| 4.6 What is missing | none from the PWA | Nothing on the platform list (an app-controlled install prompt, safe-area insets, wake-lock, shortcuts, orientation lock) was asked for by the device. What it did ask for is below. |

### What the device asked for

Two owner requests came out of the pass. Each is filed as its own change, because
each needs an interaction or a contract designed:

- **`pin-mark-all-to-the-phone-bar`**, from the Solo keypad: *"I want the
  'Update all pencil marks' button to always be there on the bottom toolbar, in
  every game that has it, seeing how useful it is."*
- **`make-the-timer-an-engine-feature`**, from backgrounding Mines: *"why does
  only Mines have a timer? I think we should make the timer an engine feature
  that could be enabled in any game."*

### 4.3 There is no update prompt: the app reloads itself

`tasks.md` expected a prompt. The code has none. `registerType: "prompt"` only
tells vite-plugin-pwa not to auto-register. `PWAManager` owns the flow, and
`autoUpdate` defaults to `allowOfflineUse`, which defaults to *running as an
installed app*. So an installed app has auto-update on unless the player turns
it off in Preferences → Advanced.

Measured against a local preview by republishing a changed `pegs.html` under
the installed worker: the page opened on the old version, the new worker
installed in the background, and **the page reloaded itself 2.6 s later**
("New service worker ready, reloading page"). The game in progress came back
intact (Move 1 of 1), because every move is autosaved. The only place an update
is visible is the status line in Preferences → Advanced ("update downloaded
(install now)"), and only when auto-update is off.

What a player can lose is what autosave does not hold: a drag in flight, an
open dialog, a hint mid-walk, the scroll of a help page. A real deploy that
changes the JS bundles re-downloads more than one file, so on a phone network
the reload lands later, and more likely mid-gesture. The alternatives were to defer the reload to the next navigation or to
backgrounding (`visibilitychange` → hidden), or to show a toast. The owner
judged it across a real push to the installed app and reported the update as
resolved, so the silent reload stands.

### Host: the custom domain overrides `sw.js`'s cache header — finding

`templates/_headers.txt.hbs` gives `/sw.js` `Cache-Control: no-cache`, and
`hintful-puzzles.pages.dev/sw.js` serves exactly that. `hintful.click/sw.js`
serves **`max-age=14400`**, because the zone's *Browser Cache TTL* rewrites the
header for extensions Cloudflare caches (`.js`). HTML and the manifest are not
touched.

The practical cost is small. The registration's `updateViaCache` is `imports`,
so browsers bypass the HTTP cache when fetching the top-level worker script to
check for an update. But the deployed header contradicts the repo, which is
exactly the deploy-only divergence to avoid. The fix is a dashboard setting
(Caching → Configuration → Browser Cache TTL → *Respect Existing Headers*), not
a commit. It is the owner's account, so it is left to the owner.

## 5. Gesture constants

| Item | Verdict | Evidence |
|---|---|---|
| 5.1 `secondaryButtonHoldTime` 350 ms, `secondaryButtonDragThreshold` 8 px | pass (defaults kept) | The Pegs/Filling press-hold-drag and the Mines long-press all worked without complaint on one Android phone, 412 CSS px wide. That is one device and one hand, not a population, so the defaults stand until a player says otherwise. |
