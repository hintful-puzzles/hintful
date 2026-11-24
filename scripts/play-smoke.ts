/**
 * A game played in the browser, end to end: `npm run play-smoke -- <game>
 * [--type <params>] [--out <dir>]`.
 *
 * What a flip runs before it is done (`docs/testing.md` § "A game played in
 * the browser"), and what each flip scripted again by hand: it starts this
 * tree's dev server on a free port, opens the game in Chrome through
 * `playwright-cli`, and
 *
 *   1. waits for the deal: the board's canvas, and no deal message;
 *   2. presses the board, and then `1` where the press alone made no move,
 *      and says where a move was made (Undo came on); then the same with the
 *      right button, a note in the games that take one that way; and undoes
 *      back to the deal each time;
 *   3. walks the hint to the end, pressing the Hint control through its
 *      beats, reading each step's sentence after "Explain the hint";
 *   4. screenshots the dealt board, the finish (its dialog), the solved board,
 *      and the solved board in the dark scheme, into `--out` (a directory of the system's temporary
 *      one by default, never this tree);
 *   5. reports the console's errors, the page's exceptions and the failed
 *      requests, and exits 1 where the walk did not solve the board or any of
 *      those is not empty.
 *
 * It is a smoke, not a judgment: the screenshots are for looking at, and
 * the sentences for reading. It kills only the server it started.
 *
 * The traps it handles, each of which cost a flip a round trip:
 *
 * - The Hint control cycles "Hint", "Explain the hint", "Apply the hint",
 *   and says "Thinking…" while a press is answered; it is disabled, not
 *   gone, once the board is solved (`puzzle/command-list.ts`).
 * - The hint's sentence and the board's canvas are inside shadow roots, which
 *   `innerText` of the body does not see: they are found by walking them.
 * - A press is held 80 ms: the board takes a press asynchronously, and two
 *   instant clicks in one round trip merge.
 * - A game's first open, in a fresh profile as every run's is, lays a card
 *   of its rules over the board and the controls until its Play is pressed.
 * - The dark scheme is the setting `colorScheme` (`store/settings.ts`),
 *   whose `localStorage` copy is read only before the store loads; a fresh
 *   profile's is "system", which the emulated media sets. Set in the store
 *   instead, it takes a reload, which deals the board again.
 * - The dev server serves no `precache-size.json`, which only a build
 *   writes; its 404 is not reported.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function usage(why: string): never {
  console.error(`play-smoke: ${why}`);
  console.error("usage: npm run play-smoke -- <game> [--type <params>] [--out <dir>]");
  process.exit(2);
}

const argv = process.argv.slice(2);
let game: string | null = null;
let type: string | null = null;
let out: string | null = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--type") type = argv[++i] ?? usage("--type needs params");
  else if (argv[i] === "--out")
    out = path.resolve(argv[++i] ?? usage("--out needs a directory"));
  else if (argv[i].startsWith("-")) usage(`no option ${argv[i]}`);
  else game = argv[i];
}
if (game === null) usage("name the game");
const shots = out ?? mkdtempSync(path.join(tmpdir(), `play-smoke-${game}-`));
mkdirSync(shots, { recursive: true });

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const s = createServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const address = s.address();
      s.close(() =>
        typeof address === "object" && address !== null
          ? resolve(address.port)
          : reject(new Error("no port")),
      );
    });
  });

/** The settings a page walk takes. */
interface WalkOptions {
  url: string;
  shots: string;
  /** Presses of the Hint control before the walk gives up. */
  presses: number;
}

/** What a page walk returns. */
interface WalkReport {
  dealt: boolean;
  input: string[];
  steps: number;
  sentences: string[];
  solved: boolean;
  stalled: string | null;
  errors: string[];
  failed: string[];
  shots: string[];
}

/** The minimum of Playwright's API the walk uses, as `playwright-cli` hands
 * it a page. */
interface Locator {
  first(): Locator;
  count(): Promise<number>;
  isDisabled(): Promise<boolean>;
  innerText(): Promise<string>;
  click(): Promise<void>;
}
interface Page {
  goto(url: string): Promise<unknown>;
  emulateMedia(o: { colorScheme: "dark" | "light" }): Promise<void>;
  waitForTimeout(ms: number): Promise<void>;
  screenshot(o: { path: string }): Promise<unknown>;
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
  getByRole(role: string, o: { name: RegExp | string; exact?: boolean }): Locator;
  on(event: string, fn: (x: never) => void): void;
  mouse: {
    move(x: number, y: number): Promise<void>;
    down(o?: { button: "left" | "right" }): Promise<void>;
    up(o?: { button: "left" | "right" }): Promise<void>;
  };
  keyboard: { press(key: string): Promise<void> };
}

/**
 * The walk, run in `playwright-cli`'s process by `run-code`: sent as its
 * source, so it names nothing outside itself.
 */
async function walk(page: Page, o: WalkOptions): Promise<WalkReport> {
  const r: WalkReport = {
    dealt: false,
    input: [],
    steps: 0,
    sentences: [],
    solved: false,
    stalled: null,
    errors: [],
    failed: [],
    shots: [],
  };
  page.on("console", (m: { type(): string; text(): string }) => {
    // A failed load is a response, reported below with its address.
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource"))
      r.errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e: Error) => r.errors.push(`exception: ${e.message}`));
  page.on("response", (res: { status(): number; url(): string }) => {
    if (res.status() >= 400 && !res.url().endsWith("/precache-size.json"))
      r.failed.push(`${res.status()} ${res.url()}`);
  });
  page.on("requestfailed", (req: { url(): string }) =>
    r.failed.push(`failed ${req.url()}`),
  );

  // What the shadow roots hold: the board's canvas and the hint's sentence.
  interface Seen {
    canvas: { x: number; y: number; w: number; h: number } | null;
    hint: string;
    dealing: boolean;
  }
  const look = () =>
    page.evaluate((): Seen => {
      let canvas: Seen["canvas"] = null as Seen["canvas"];
      let hint = "";
      let dealing = false;
      const visit = (root: Document | ShadowRoot) => {
        for (const el of root.querySelectorAll("*")) {
          if (el.tagName === "CANVAS" && canvas === null) {
            const b = el.getBoundingClientRect();
            if (b.width > 50) canvas = { x: b.x, y: b.y, w: b.width, h: b.height };
          }
          const cls = el.classList;
          if (cls.contains("hint") && !cls.contains("hint-sizer"))
            hint = (el.textContent ?? "").replace(/\s+/g, " ").trim();
          if (cls.contains("deal")) dealing = true;
          if (el.shadowRoot) visit(el.shadowRoot);
        }
      };
      visit(document);
      return { canvas, hint, dealing };
    });
  const shot = async (name: string) => {
    const file = `${o.shots}/${name}.png`;
    await page.screenshot({ path: file });
    r.shots.push(file);
  };
  const press = async (x: number, y: number, button: "left" | "right") => {
    await page.mouse.move(x, y);
    await page.mouse.down({ button });
    await page.waitForTimeout(80);
    await page.mouse.up({ button });
    await page.waitForTimeout(150);
  };
  const undo = page.getByRole("button", { name: "Undo", exact: true }).first();

  // 1. The deal.
  await page.goto(o.url);
  for (let t = 0; t < 300; t++) {
    const seen = await look();
    if (seen.canvas !== null && !seen.dealing) {
      r.dealt = true;
      break;
    }
    await page.waitForTimeout(100);
  }
  if (!r.dealt) return r;
  // A game's first open shows its rules over the board, until Play. Every
  // run's open is a first, and on a busy machine the card comes seconds
  // after the deal: a press made before it shows lands on the card.
  const play = page.getByRole("button", { name: "Play", exact: true }).first();
  for (let t = 0; t < 100 && (await play.count()) === 0; t++)
    await page.waitForTimeout(100);
  if ((await play.count()) > 0) {
    await play.click();
    for (let t = 0; t < 50 && (await play.count()) > 0; t++)
      await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);
  await shot("dealt");

  // 2. Input, then back to the deal.
  const board = (await look()).canvas;
  if (board === null) return r;
  // The middle of a board of an even count of squares is a line between
  // two, so the press moves off it until one makes a move.
  const at = [
    [0.5, 0.5],
    [0.59, 0.59],
    [0.41, 0.41],
    [0.3, 0.7],
  ] as const;
  for (const [button, what] of [
    ["left", "a press"],
    ["right", "a right press"],
  ] as const) {
    let made = "no move at any of four points";
    for (const [fx, fy] of at) {
      await press(board.x + fx * board.w, board.y + fy * board.h, button);
      const pressed = !(await undo.isDisabled());
      if (!pressed) {
        await page.keyboard.press("1");
        await page.waitForTimeout(150);
      }
      const moved = !(await undo.isDisabled());
      for (let k = 0; k < 20 && !(await undo.isDisabled()); k++) {
        await undo.click();
        await page.waitForTimeout(100);
      }
      await page.keyboard.press("Escape");
      if (pressed || moved) {
        made = `${pressed ? "the press made a move" : "the press, then 1, made a move"} at (${fx}, ${fy}) of the board`;
        break;
      }
    }
    r.input.push(`${what}: ${made}`);
  }

  // 3. The hint walk.
  const hint = page
    .getByRole("button", { name: /^(Hint|Explain the hint|Apply the hint|Thinking…)$/ })
    .first();
  let same = 0;
  let last = "";
  for (let p = 0; p < o.presses; p++) {
    if ((await hint.count()) === 0) {
      r.stalled = "no Hint control";
      break;
    }
    if (await hint.isDisabled()) {
      r.solved = true;
      break;
    }
    const label = (await hint.innerText()).trim();
    if (label === "Thinking…") {
      await page.waitForTimeout(100);
      continue;
    }
    const before = (await look()).hint;
    await hint.click();
    for (let t = 0; t < 100; t++) {
      await page.waitForTimeout(50);
      if (
        (await hint.isDisabled()) ||
        (await hint.innerText()).trim() !== label ||
        (await look()).hint !== before
      )
        break;
    }
    if (label === "Explain the hint") r.sentences.push((await look()).hint);
    if (label === "Apply the hint") r.steps++;
    // A refusal leaves the control where it was: the walk cannot go on.
    const now = `${(await hint.innerText()).trim()}|${(await look()).hint}`;
    same = now === last ? same + 1 : 0;
    last = now;
    if (same >= 3) {
      r.stalled = (await look()).hint || `the control stays at "${label}"`;
      break;
    }
  }
  // The solve's flash sweeps the board for a while, and then the finish's
  // dialog covers it: each has its shot.
  await page.waitForTimeout(3000);
  await shot("finished");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await shot("solved");

  // 4. The dark scheme, as the system asks for it: a reload would deal the
  // board again, its moves not yet saved.
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForTimeout(500);
  const dark = await page.evaluate(() =>
    document.documentElement.className.includes("wa-dark"),
  );
  if (!dark) r.errors.push("the dark scheme did not take: no wa-dark on the page");
  await shot("solved-dark");
  return r;
}

function cli(args: readonly string[]): string {
  const r = spawnSync("playwright-cli", args, { cwd: shots, encoding: "utf8" });
  if (r.error !== undefined) usage(`playwright-cli: ${r.error.message}`);
  if (r.status !== 0)
    throw new Error(`playwright-cli ${args[1]}: ${r.stdout}${r.stderr}`);
  return r.stdout;
}

async function main(): Promise<void> {
  const port = await freePort();
  const server = spawn(
    process.execPath,
    [
      path.join(ROOT, "node_modules/vite/bin/vite.js"),
      "--port",
      String(port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    { cwd: ROOT, stdio: "ignore" },
  );
  const session = `play-smoke-${process.pid}`;
  let opened = false;
  const stop = () => {
    if (opened) spawnSync("playwright-cli", [`-s=${session}`, "close"], { cwd: shots });
    server.kill();
  };
  process.on("exit", stop);
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
    process.on(signal, () => process.exit(1));

  const origin = `http://127.0.0.1:${port}`;
  console.error(`play-smoke: the dev server at ${origin}`);
  let up = false;
  for (let t = 0; t < 120 && !up; t++) {
    up = await fetch(origin).then(
      (res) => res.ok,
      () => false,
    );
    if (!up) await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!up) throw new Error(`the dev server at ${origin} did not answer in a minute`);

  const url = `${origin}/${game}${type === null ? "" : `?type=${encodeURIComponent(type)}`}`;
  cli([`-s=${session}`, "open", "about:blank"]);
  opened = true;
  console.error(`play-smoke: walking ${url}`);
  const options: WalkOptions = { url, shots, presses: 3000 };
  const printed = cli([
    `-s=${session}`,
    "run-code",
    `async page => JSON.stringify(await (${walk.toString()})(page, ${JSON.stringify(options)}))`,
  ]);
  const result = /### Result\n(.*)\n/.exec(printed)?.[1];
  if (result === undefined) throw new Error(`no result from the walk:\n${printed}`);
  const r = JSON.parse(JSON.parse(result) as string) as WalkReport;

  const lines = [
    `${game}${type === null ? "" : ` (${type})`}: ${r.dealt ? "dealt" : "NOT DEALT"}`,
    ...r.input.map((l) => `  input: ${l}`),
    `  hint: ${r.steps} steps applied, ${r.solved ? "solved" : "NOT SOLVED"}${r.stalled === null ? "" : `; stalled at: ${r.stalled}`}`,
    ...r.sentences.slice(0, 5).map((s) => `    "${s}"`),
    ...(r.sentences.length > 5 ? [`    … ${r.sentences.length - 5} more`] : []),
    ...r.errors.map((e) => `  error: ${e}`),
    ...r.failed.map((f) => `  request: ${f}`),
    `  screenshots: ${r.shots.join(", ")}`,
  ];
  console.log(lines.join("\n"));
  // The server would hold the process open: the exit closes both.
  process.exit(r.dealt && r.solved && r.errors.length + r.failed.length === 0 ? 0 : 1);
}

await main();
