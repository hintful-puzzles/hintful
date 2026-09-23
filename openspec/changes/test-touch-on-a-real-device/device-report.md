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
owed), **device** (not yet judged on hardware).

## 1. The seven repaired games

| Item | Verdict | Evidence |
|---|---|---|
| 1.1 Pegs | device | Laptop: a mouse drag from a peg over its neighbor into the hole lands the move on the deployed build (Move 1 of 1). Says nothing about a held finger. |
| 1.2 Filling | device | |
| 1.3–1.7 Cube, Fifteen, Flip, Flood, Sokoban | device | |
| 1.8 swallowed vs. sluggish | device | Record which one it is for any game that feels wrong. |

## 2. The control group

| Item | Verdict | Evidence |
|---|---|---|
| 2.1 Mines long-press / two-finger flag | device | |
| 2.2 Pattern, Loopy three-state tap | device | |
| 2.3 Tracks | device | Owner played Tracks on the phone for `87fc5b6c`; no input defect was reported then, but that session was about layout. |
| 2.4 Desktop mouse and keyboard, deployed build | pass | Pegs mouse drag and keyboard cursor movement on `hintful.click`. |

## 3. Reachability

| Item | Verdict | Evidence |
|---|---|---|
| 3.1 Hit targets (Untangle first, then Loopy, Bridges, Palisade) | device | |
| 3.2 Keypad on a small screen (Solo, Undead, Salad) | device | Laptop at 412×860: Solo's two-row keypad sits clear of the board, under it. Legibility and thumb reach are a device question. |
| 3.3 Keyboard cursor on a small screen | device | Only if a keyboard or tablet is to hand. |
| 3.4 Portrait / landscape, phone / tablet | device | Portrait phone width was the subject of `87fc5b6c` and `24d2e81f`. Landscape and tablet not yet seen. |

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
| 4.1a Installed app: the bottom bar | **fail → fixed, device to confirm** | On the owner's phone the installed app showed no bottom command bar, while the same page in a tab did. Pixel-reading the screenshot showed the bar *was* rendered, with only its top 12 device px showing above the system navigation bar: in standalone mode `100dvh` came out about 64 CSS px taller than the window, and `overflow: hidden` clipped the bar off. The puzzle page is now sized by `window.innerHeight` (`src/utils/app-height.ts`, as `--app-height`, with `100dvh` as the fallback), updated on every resize. That is right in a tab and in an app. Chromium check: at 860 and 700 px, the bar's bottom sits on the window's bottom and nothing scrolls. It still needs confirming in the installed app after the deploy. |
| 4.1 Install: name, icon | pass (manifest) · device (home screen) | The deployed manifest says `name: "Hintful Puzzles"`, `short_name: "Hintful"`, `display: standalone`, scope `/`, with 64/192/512 icons and a maskable 512. How the icon looks on a launcher is a device question. |
| 4.2 Offline | pass (Chromium) | On `hintful.click` with offline use enabled, 286 of 286 precache entries were stored (7.2 MB). With the network off: a cold reload of Pegs kept the move in progress; `/`, `/untangle`, `/help/` and `/help/solo` loaded; `/solo`, never visited, generated and drew a new board; the self-hosted Plex faces loaded; no console errors. |
| 4.3 Update flow | **finding** | See below. |
| 4.4 Backgrounding | device | The in-progress game is autosaved per move (it survived an offline reload and the update reload above). Whether a Mines timer and a quick-save survive the OS evicting a backgrounded tab is a device question. |
| 4.5 Preflight | pass (owner's phone) | The app has been in daily use on the phone, so `preflight.ts` does not block it. |
| 4.6 What is missing | device | Decide after 4.1 and 4.4 on hardware. |

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
the reload lands later, and more likely mid-gesture. **The owner decides this**:
keep the silent reload, defer the reload to the next navigation or
backgrounding (`visibilitychange` → hidden), or show a toast. It is
player-visible. It needs a real deploy to judge on the phone: open a game
before a push lands, keep playing, and see whether the reload is noticed.

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
| 5.1 `secondaryButtonHoldTime` 350 ms, `secondaryButtonDragThreshold` 8 px | device | Unchanged. Judge on the Pegs/Filling press-hold-drag and the Mines long-press. Note the device when judging. |
