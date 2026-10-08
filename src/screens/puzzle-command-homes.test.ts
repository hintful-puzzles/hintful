// @vitest-environment happy-dom
//
/**
 * **Every command is in exactly one of the three panels, and the panels and
 * the command bus agree about which.**
 *
 * The defect this guards against shipped twice. First `hint`,
 * `toggle-reference` and `check-and-save` were offered from *both* a game menu
 * and a toolbar, with eleven further commands split between the two under no
 * rule. Then a desktop rail and a phone bar were one list drawn as two shapes,
 * and the phone's sheet opened on nine rows its bar already showed. Each
 * surface was correct on its own, so nothing could see either.
 *
 * So the check is a **render**, not a source scan: it mounts the real Bar,
 * Menu and Game controls against a fake puzzle, walks every shadow root under
 * them, and compares the `data-command` values it finds with `PuzzleScreen`'s
 * own `commandMap`. Both directions fail: a command offered twice, and a
 * command offered nowhere.
 *
 * The Bar and the Menu are held to more than not overlapping. They **partition
 * one ordered list**: at every Bar length the Menu is exactly the entries the
 * Bar does not show, in the list's order, which is what makes the Menu's
 * contents predictable from where the Bar stops.
 */
import "../test-setup/element-internals.ts";
import "../test-setup/resize-and-animations.ts";
import { render, type TemplateResult } from "lit";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// The real `saved-games` store, against `fake-indexeddb`. Nothing here needs a
// saved game: `Back to last save` renders either way, disabled when there is
// none, and a disabled control still has the `data-command` this file reads.

import { createTsEngine } from "../engine/registry.ts";
import { NOT_STARTED } from "../engine/solve-failure.ts";
import { registerAllGames } from "../games/index.ts";
import {
  barCapacity,
  commandList,
  cutCommandList,
  MIN_BAR_LENGTH,
} from "../puzzle/command-list.ts";
import { PuzzleBar } from "../puzzle/components/bar.ts";
import { PuzzleGameControls } from "../puzzle/components/game-controls.ts";
import { PuzzleMenu } from "../puzzle/components/menu.ts";
import { settings } from "../store/settings.ts";
import { PuzzleScreen } from "./puzzle-screen.ts";

// Every `wa-icon` fetches its SVG from Web Awesome's default icon library, and
// happy-dom aborts those requests at teardown: twenty stack traces per run, in
// a suite where nobody is looking at an icon. Serve an empty SVG instead. (The
// app's own resolver in `src/icons.ts` never runs here: only `main.ts` installs
// it, and this test mounts components on their own.)
vi.stubGlobal(
  "fetch",
  vi.fn(
    async () =>
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        headers: { "Content-Type": "image/svg+xml" },
      }),
  ),
);

type FakePuzzle = Record<string, unknown>;

/**
 * A puzzle that can do **everything**, so every panel renders every control it
 * has.
 *
 * Deliberately maximal: a capability-gated control that is absent would
 * otherwise read as "this command has no home", and the failure would name the
 * wrong problem. The `renders no command a game cannot run` case below covers
 * the other end.
 */
function fullyCapablePuzzle(overrides: FakePuzzle = {}): FakePuzzle {
  return {
    puzzleId: "lightup",
    displayName: "Light Up",
    status: "ongoing",
    hasBoard: true,
    isSolved: false,
    canUndo: true,
    canRedo: true,
    canHint: true,
    canSolve: true,
    canMarkAll: true,
    canCheck: true,
    hasReference: true,
    hasPencilMarks: false,
    ignoresSecondaryButton: false,
    wantsStatusbar: true,
    statusbarText: "3 lights placed",
    hintPending: false,
    hintArmedToApply: false,
    autoHintActive: false,
    // A deal is being looked for, which is when its way out has a control.
    dealMessage: "Looking for a board…",
    canStopDeal: true,
    helpMessage: "",
    activeHintExplanation: "",
    currentMove: 3,
    totalMoves: 7,
    checkpoints: new Set<number>(),
    restarts: [],
    currentParams: "7x7",
    requestKeys: async () => [],
    palette: [],
    ...overrides,
  };
}

/** Mount `element` with `puzzle` injected, rendered for real. */
async function mount<T extends HTMLElement & { updateComplete: Promise<boolean> }>(
  element: T,
  puzzle: FakePuzzle,
): Promise<T> {
  // `@consume` assigns this field from the context; with no provider in this
  // detached tree, assigning it directly is the same write by a shorter route.
  (element as unknown as { puzzle: unknown }).puzzle = puzzle;
  document.body.append(element);
  await element.updateComplete;
  return element;
}

async function mountBar(puzzle: FakePuzzle, length: number): Promise<PuzzleBar> {
  const bar = new PuzzleBar();
  bar.length = length;
  return mount(bar, puzzle);
}

async function mountMenu(puzzle: FakePuzzle, barLength: number): Promise<PuzzleMenu> {
  const menu = new PuzzleMenu();
  menu.barLength = barLength;
  menu.gameName = "Light Up";
  menu.helpHref = "/help/lightup.html";
  return mount(menu, puzzle);
}

async function mountControls(puzzle: FakePuzzle): Promise<PuzzleGameControls> {
  const controls = await mount(new PuzzleGameControls(), puzzle);
  // The keys are asked for in the first update and arrive in a later one.
  await Promise.resolve();
  await controls.updateComplete;
  return controls;
}

/** What the screen says under the board, from the real `renderWords`. It is
 * no panel, and one command lives there: the way out of a deal. */
function mountWords(puzzle: FakePuzzle): HTMLElement {
  const screen = new PuzzleScreen();
  Object.defineProperty(screen, "puzzle", { get: () => puzzle });
  const template = (
    screen as unknown as { renderWords(): TemplateResult }
  ).renderWords();
  const host = document.createElement("div");
  document.body.append(host);
  render(template, host);
  return host;
}

/** Every `data-command` under `root`, descending through shadow roots, so a
 * command inside a nested component is not missed and reported as homeless. */
function commandsIn(root: ParentNode): string[] {
  const out: string[] = [];
  for (const el of root.querySelectorAll("[data-command]")) {
    const command = el.getAttribute("data-command");
    // A command may carry arguments (`settings:data`); the handler is the part
    // before the first colon, and that is what the map is keyed by.
    if (command) out.push(command.split(":")[0]);
  }
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) out.push(...commandsIn(el.shadowRoot));
  }
  return out;
}

/** The commands each place offers for `puzzle`, at one Bar length. */
async function homes(puzzle: FakePuzzle, barLength: number) {
  document.body.replaceChildren();
  return {
    Bar: commandsIn((await mountBar(puzzle, barLength)).shadowRoot as ParentNode),
    Menu: commandsIn((await mountMenu(puzzle, barLength)).shadowRoot as ParentNode),
    "Game controls": commandsIn((await mountControls(puzzle)).shadowRoot as ParentNode),
    "under the board": commandsIn(mountWords(puzzle)),
  };
}

/** The Bar lengths a window can produce for a game with a hint: the floor,
 * the whole leading run, and one between. */
const BAR_LENGTHS = [4, 5, 6];

/**
 * Commands that are deliberately in no panel, one entry per command with the
 * reason it is excused.
 *
 * A **ledger against the derived set**, not a filter applied before deriving:
 * the assertion below requires it to be exactly right, so an entry that stops
 * being true fails just as loudly as a missing home. (`docs/games/testing.md`:
 * where intent cannot be observed, attach it to the derived member.)
 */
const IN_NO_PANEL: Record<string, string> = {
  "capture-icons": "dev-only, from the ?screenshot icon-capture bar",
  redraw: "dev-only debugging; no player-facing control",
  "change-type": "the parameter chips are a puzzle-type-menu, not a data-command",
  "toggle-pencil-mode":
    "the bare P shortcut's command; the control is the Game controls' Marks key, " +
    "which sends the same code straight to the game",
  // `All puzzles` and `How to play …` are real links, carrying an `href` and
  // nothing else. `Screen.interceptCommandAndHrefClicks` routes the home URL to
  // `navigateToHomePage` and a help URL to the help drawer, and it *throws* in
  // dev on an element with both an href and a data-command.
  home: "the `All puzzles` link is an <a href>, routed by the href interceptor",
};

describe("every puzzle command is in exactly one of the three panels", () => {
  let commandKeys: string[];

  beforeEach(() => {
    document.body.replaceChildren();
    const screen = new PuzzleScreen();
    commandKeys = Object.keys(
      (screen as unknown as { commandMap: Record<string, unknown> }).commandMap,
    );
  });

  it("finds a command map and rendered panels at all", async () => {
    // Vacuity guards: an empty map, or a panel that failed to render, would
    // make every assertion below pass over nothing.
    expect(commandKeys.length).toBeGreaterThan(15);
    const found = await homes(fullyCapablePuzzle(), MIN_BAR_LENGTH);
    expect(found.Bar.length).toBe(MIN_BAR_LENGTH);
    expect(found.Menu.length).toBeGreaterThan(10);
    expect(found["Game controls"]).toEqual(["mark-all", "toggle-reference"]);
    expect(found["under the board"]).toEqual(["stop-deal"]);
  });

  it("gives no control both an href and a data-command", async () => {
    // `Screen.interceptCommandAndHrefClicks` throws on such an element, but
    // only in dev and only when somebody clicks it, so the `How to play …` row
    // once shipped with both, the anchor's navigation won the race, and the
    // help drawer became a full-page load. Asserting it at render is what
    // turns a click-time throw into a build-time failure.
    const puzzle = fullyCapablePuzzle();
    for (const panel of [
      await mountBar(puzzle, MIN_BAR_LENGTH),
      await mountMenu(puzzle, MIN_BAR_LENGTH),
      await mountControls(puzzle),
    ]) {
      const both = [
        ...(panel.shadowRoot?.querySelectorAll("[data-command][href]") ?? []),
      ].map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute("data-command")}]`);
      expect(
        both,
        `${panel.localName}: a control is either a link or a command, never both`,
      ).toEqual([]);
    }
  });

  it.each(
    BAR_LENGTHS,
  )("cuts one list between the Bar and the Menu, at a Bar of %i", async (barLength) => {
    const puzzle = fullyCapablePuzzle();
    const list = commandList(puzzle as never, "Light Up");
    // The help link and the timeline hold a place in the order and are not
    // commands.
    const commands = list.flatMap((entry) =>
      entry.kind === "command" ? [entry.id] : [],
    );
    expect(barCapacity(list)).toBe(6);

    const found = await homes(puzzle, barLength);
    expect(found.Bar, "the Bar is the list's leading entries").toEqual(
      commands.slice(0, barLength),
    );
    expect(
      found.Menu,
      "the Menu is every entry the Bar does not show, in the list's order",
    ).toEqual(commands.slice(barLength));
    // The first four are on the Bar at every size.
    expect(found.Bar.slice(0, 4)).toEqual(["undo", "redo", "hint", "check-and-save"]);
  });

  it.each(BAR_LENGTHS)("offers no command twice, at a Bar of %i", async (barLength) => {
    const found = await homes(fullyCapablePuzzle(), barLength);
    const places = new Map<string, string[]>();
    for (const [place, commands] of Object.entries(found)) {
      for (const command of commands) {
        places.set(command, [...(places.get(command) ?? []), place]);
      }
    }
    expect(
      [...places]
        .filter(([, where]) => where.length > 1)
        .map(([command, where]) => `${command}: ${where.join(" and ")}`),
      "a command reachable from two places is the defect the panels were " +
        "built to remove; give it one home",
    ).toEqual([]);
  });

  it.each(
    BAR_LENGTHS,
  )("gives every command in the map a home, or a reason, at a Bar of %i", async (barLength) => {
    const found = new Set(
      Object.values(await homes(fullyCapablePuzzle(), barLength)).flat(),
    );

    const homeless = commandKeys.filter(
      (c) => !found.has(c) && !Object.hasOwn(IN_NO_PANEL, c),
    );
    expect(
      homeless,
      "these commands are registered but reachable from no panel: give each a " +
        "control, or an entry in IN_NO_PANEL saying why not",
    ).toEqual([]);

    // The ledger is held to being exactly right in the other direction too:
    // an excuse for a command that now *has* a control is a stale note that
    // would quietly permit a duplicate later.
    const staleExcuses = Object.keys(IN_NO_PANEL).filter((c) => found.has(c));
    expect(
      staleExcuses,
      "IN_NO_PANEL excuses a command that now has a control; remove the entry",
    ).toEqual([]);
    const excusesForNothing = Object.keys(IN_NO_PANEL).filter(
      (c) => !commandKeys.includes(c),
    );
    expect(
      excusesForNothing,
      "IN_NO_PANEL names a command that is not in the command map at all",
    ).toEqual([]);
  });

  it("renders no command a game cannot run", async () => {
    const found = new Set(
      Object.values(
        await homes(
          fullyCapablePuzzle({
            canHint: false,
            canSolve: false,
            canMarkAll: false,
            canCheck: false,
            hasReference: false,
            wantsStatusbar: false,
          }),
          MIN_BAR_LENGTH,
        ),
      ).flat(),
    );
    // Absent, not present-and-disabled: "grayed out for this puzzle" teaches a
    // player that the app is broken here, not that the game has no such idea.
    for (const command of [
      "hint",
      "toggle-auto-hint",
      "mark-all",
      "toggle-reference",
      "check-only",
      "solve",
    ]) {
      expect(found.has(command), `${command} should be absent for this game`).toBe(
        false,
      );
    }
    // …and the ones every game has are still there.
    for (const command of ["undo", "redo", "check-and-save", "new-game"]) {
      expect(found.has(command), `${command} should be present for every game`).toBe(
        true,
      );
    }
  });

  it("shows the help banner exactly once, whether or not the game can hint", () => {
    // Solve refuses in the banner, and a game can offer Solve with no hint
    // (Mines): its banner was once rendered only under the hint's control, so
    // a refused Solve there showed nothing at all.
    for (const canHint of [true, false]) {
      document.body.replaceChildren();
      const words = mountWords(
        fullyCapablePuzzle({ canHint, helpMessage: NOT_STARTED }),
      );
      const banners = [...words.querySelectorAll(".hint")].map((el) =>
        el.textContent?.trim(),
      );
      expect(banners, `canHint: ${canHint}`).toEqual([NOT_STARTED]);
    }
  });

  it("writes a label on every control", async () => {
    // An icon alone is how eight controls once shipped wordless. The keys that
    // type a character are not held to it: the on-screen key panel is an input
    // surface, where the character is the label.
    const puzzle = fullyCapablePuzzle();
    const bar = await mountBar(puzzle, 6);
    const menu = await mountMenu(puzzle, MIN_BAR_LENGTH);
    const controls = await mountControls(puzzle);
    const unlabeled = [
      ...(bar.shadowRoot?.querySelectorAll("button") ?? []),
      ...(menu.shadowRoot?.querySelectorAll("[part=row]") ?? []),
      ...(controls.shadowRoot?.querySelectorAll("wa-button") ?? []),
    ].filter((el) => (el.textContent ?? "").trim() === "");
    // Vacuity floor: six commands, the Menu button and the button toggle.
    expect(bar.shadowRoot?.querySelectorAll("button").length).toBe(8);
    expect(unlabeled.map((el) => el.outerHTML)).toEqual([]);
  });
});

/**
 * The panels against real games, by what each game is: its static attributes
 * and its keys come from the engine, so no capability is typed in here.
 */
describe("what a game brings is in the Game controls, and only there", () => {
  beforeAll(registerAllGames);

  beforeEach(() => {
    document.body.replaceChildren();
  });

  function puzzleFor(puzzleId: string): FakePuzzle {
    const engine = createTsEngine(puzzleId);
    if (!engine) throw new Error(`no engine for ${puzzleId}`);
    expect(engine.newGame()).toBeNull();
    return fullyCapablePuzzle({
      ...engine.getStaticProperties(),
      puzzleId,
      displayName: puzzleId,
      dealMessage: "",
      currentParams: engine.getParams(),
      requestKeys: async () => engine.requestKeys(),
    });
  }

  /** What the Game controls panel shows, in order. */
  async function controlsOf(puzzleId: string) {
    const panel = await mountControls(puzzleFor(puzzleId));
    const root = panel.shadowRoot as ShadowRoot;
    return {
      empty: panel.empty,
      keys: [...root.querySelectorAll("puzzle-keys")].map(
        (keys) => `${keys.labeled ? "labeled" : "keys"}:${keys.keys.length}`,
      ),
      commands: commandsIn(root),
    };
  }

  it("draws the same Bar for Solo and for Tracks", async () => {
    const solo = commandsIn(
      (await mountBar(puzzleFor("solo"), 6)).shadowRoot as ParentNode,
    );
    document.body.replaceChildren();
    const tracks = commandsIn(
      (await mountBar(puzzleFor("tracks"), 6)).shadowRoot as ParentNode,
    );
    expect(solo).toHaveLength(6);
    expect(tracks).toEqual(solo);
  });

  it("gives Solo its keys, its note toggle and mark-all, in that order", async () => {
    const solo = await controlsOf("solo");
    expect(solo.empty).toBe(false);
    // The keys that type, then the one that is a mode.
    expect(solo.keys).toHaveLength(2);
    expect(solo.keys[0]).toMatch(/^keys:\d+$/);
    expect(solo.keys[1]).toBe("labeled:1");
    expect(solo.commands).toEqual(["mark-all"]);

    // …and neither the Bar nor the Menu has mark-all.
    for (const barLength of BAR_LENGTHS) {
      const found = await homes(puzzleFor("solo"), barLength);
      expect(found.Bar).not.toContain("mark-all");
      expect(found.Menu).not.toContain("mark-all");
    }
  });

  it("gives Dominosa its Reference, and the Menu none", async () => {
    expect((await controlsOf("dominosa")).commands).toEqual(["toggle-reference"]);
    const found = await homes(puzzleFor("dominosa"), MIN_BAR_LENGTH);
    expect(found.Menu).not.toContain("toggle-reference");
    expect(found.Bar).not.toContain("toggle-reference");
  });

  it("draws no panel for a game that brings nothing", async () => {
    // Cube has no keys, no mark-all and no reference. Tracks has a second
    // action, and the toggle that reaches it is the Bar's.
    expect(await controlsOf("cube")).toEqual({ empty: true, keys: [], commands: [] });
    expect((await controlsOf("tracks")).empty).toBe(true);
  });

  it("puts the button toggle on the Bar, only in a game with a secondary action", async () => {
    const toggle = async (puzzle: FakePuzzle) =>
      (await mountBar(puzzle, MIN_BAR_LENGTH)).shadowRoot?.querySelector(
        '[part~="swap"]',
      ) ?? null;
    expect(puzzleFor("tracks")["ignoresSecondaryButton"]).toBe(false);
    expect(settings.showMouseButtonToggle).toBe(true);
    const shown = await toggle(puzzleFor("tracks"));
    expect(shown?.textContent?.trim()).toBe("Left");

    // A press asks the screen for the swap, and the caption follows the
    // answer.
    const bar = shown?.getRootNode() as ShadowRoot;
    const asked: boolean[] = [];
    bar.host.addEventListener("puzzle-swap-buttons", (event) =>
      asked.push((event as CustomEvent<{ swap: boolean }>).detail.swap),
    );
    (shown as HTMLElement).click();
    expect(asked).toEqual([true]);
    (bar.host as PuzzleBar).swapButtons = true;
    await (bar.host as PuzzleBar).updateComplete;
    expect(bar.querySelector('[part~="swap"]')?.textContent?.trim()).toBe("Right");

    // A game that ignores the secondary button has nothing to swap to.
    expect(
      await toggle(fullyCapablePuzzle({ ignoresSecondaryButton: true })),
    ).toBeNull();
    // And a player can turn it off.
    settings.showMouseButtonToggle = false;
    try {
      expect(await toggle(puzzleFor("tracks"))).toBeNull();
    } finally {
      settings.showMouseButtonToggle = true;
    }
  });
});

/** Every menu trigger under `root`, descending through shadow roots. */
function triggersIn(root: ParentNode): Element[] {
  const out = [...root.querySelectorAll('[slot="trigger"]')];
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) out.push(...triggersIn(el.shadowRoot));
  }
  return out;
}

describe("a menu inside the Menu", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("is opened by a trigger that is not also a command", async () => {
    // A command chosen from a Menu that is over the board closes it, and
    // closing it takes any menu inside it along. The timeline's counter once
    // carried `show-timeline`, and tapping it closed the sheet and showed
    // nothing.
    const menu = await mountMenu(fullyCapablePuzzle(), MIN_BAR_LENGTH);
    const triggers = triggersIn(menu.shadowRoot as ParentNode);
    // Vacuity floor: the timeline's counter.
    expect(triggers.length).toBeGreaterThanOrEqual(1);
    expect(
      triggers
        .filter((el) => el.closest("[data-command]"))
        .map((el) => el.closest("[data-command]")?.getAttribute("data-command")),
    ).toEqual([]);
  });

  it("is the Menu's only one", async () => {
    // The Menu is the screen's one overflow: no second menu of commands
    // inside it.
    const menu = await mountMenu(fullyCapablePuzzle(), MIN_BAR_LENGTH);
    const owners = triggersIn(menu.shadowRoot as ParentNode).map((el) => {
      const root = el.getRootNode();
      return root instanceof ShadowRoot ? root.host.localName : "document";
    });
    expect(owners).toEqual(["puzzle-history"]);
  });

  it("starts where the Bar stops", () => {
    const list = commandList(fullyCapablePuzzle() as never, "Light Up");
    for (const barLength of [0, 3, 4, 5, 6, 9]) {
      const { bar, menu } = cutCommandList(list, barLength);
      expect([...bar, ...menu]).toEqual(list);
      expect(bar.length).toBe(Math.min(6, Math.max(MIN_BAR_LENGTH, barLength)));
    }
  });
});
