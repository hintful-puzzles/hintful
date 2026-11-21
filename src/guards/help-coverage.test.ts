/*
 * The catalog and the games' descriptions that carry help are two lists of
 * games, and they must be the same list — asserted in **both** directions,
 * like `catalog-registry.test.ts`.
 *
 * Written because its absence hid a real gap. Until `retire-the-upstream-help-tree`
 * the per-puzzle help came from two sources in two formats — 43 upstream HTML
 * fragments and 13 markdown pages — and nothing listed the correspondence, so
 * nobody noticed that 43 + 13 = 56 of 57: `separate` had no help page at all,
 * in either source. The reverse direction costs nothing to add and catches the
 * other half of the same mistake, a page left behind after a game is renamed.
 *
 * The glob is read through Vite so the file stays inside the browser-shaped type
 * world (`tsconfig.json` `"types": []`), which means an unmatched glob yields
 * `{}` **silently** — hence the explicit non-vacuity assertion. That is the
 * `palette-source.test.ts` trap, and it is why the count is asserted rather than
 * inferred from the sweep passing.
 */

import ts from "typescript";
import { describe, expect, it } from "vitest";
import { renderHelpPage } from "../describe/help-page.ts";
import {
  gameDescriptions,
  gameHelp,
  helpPage,
  helpProse,
} from "../describe/help-pages.ts";
import { loadDescriptionFile } from "../describe/load.ts";
import { descriptionPath } from "../describe/paths.ts";
import { TWO, wordOf } from "../engine/color/colors.ts";
import {
  difficultyChoiceItem,
  difficultyTiers,
} from "../engine/contract/difficulty.ts";
import { hasHint } from "../engine/contract/game.ts";
import { HINT_MARKS_PLACEHOLDER } from "../engine/contract/hint-words.ts";
import {
  MODIFIERS_PLACEHOLDER,
  modifiersMarkdown,
  modifiersOf,
} from "../engine/game-id/modifier.ts";
import { expandChoices, PARAMETERS_PLACEHOLDER } from "../engine/game-id/param-help.ts";
import {
  RULESETS_PLACEHOLDER,
  rulesetField,
  rulesetsMarkdown,
} from "../engine/game-id/ruleset.ts";
import { MARK_ALL_HELP, MARK_ALL_PLACEHOLDER } from "../engine/hint/candidate-hint.ts";
import {
  offersStickyPencil,
  STICKY_PENCIL_PLACEHOLDER,
} from "../engine/hint/pencil-prefs.ts";
import {
  CONTROLS_PLACEHOLDER,
  DONE_CLUES_PLACEHOLDER,
} from "../engine/input/target-verb.ts";
import { TOUCH_PLACEHOLDER } from "../engine/input/touch-help.ts";
import { getTsGame } from "../engine/midend/registry.ts";
import { RULES_OUT_PLACEHOLDER } from "../engine/midend/rules-out.ts";
import { expandPair, PAIR_NAMES } from "../engine/render/piece.ts";
import { WING_PLACEHOLDER } from "../engine/solve/wing.ts";
import {
  OPTIONAL_GAME_MEMBERS,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";
import { HINT_GAMES } from "../engine/testing/hint-games.ts";
import { itOverWholeSweep } from "../engine/testing/slow.ts";
import { nodesOf, parsed } from "../engine/testing/syntax.ts";
import { puzzleDataMap, puzzleIds } from "../puzzle/catalog.ts";
import { type CommandPuzzle, commandList } from "../puzzle/command-list.ts";
import { insertGameLists, NO_RIGHT_CLICK } from "../puzzle/game-lists.ts";

const skeletons = import.meta.glob<string>("../skeleton/*/skeleton.description.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

// The "All the puzzles" page, whose table rows link `../<puzzleId>`, as the
// build renders its source.
const puzzlesPage = insertGameLists(
  puzzleDataMap,
  import.meta.glob<string>("../../help/puzzles.md", {
    query: "?raw",
    import: "default",
    eager: true,
  })["../../help/puzzles.md"],
  [],
);

describe("help page coverage", () => {
  // A description that carries help is a cataloged game's, at its path; the
  // skeletons' are the copies `scripts/new-game.sh` stamps.
  const helped = [...gameDescriptions]
    .filter(([path, text]) => "help" in loadDescriptionFile(text, path))
    .map(([path]) => path);

  it("has a help page for every cataloged puzzle", () => {
    const missing = puzzleIds.filter((id) => !helped.includes(descriptionPath(id)));
    expect(missing, "add help to src/games/<id>/<id>.description.yaml").toEqual([]);
  });

  it("has no help page for an uncataloged game", () => {
    const known = new Set<string>(puzzleIds.map(descriptionPath));
    const orphaned = helped.filter((path) => !known.has(path));
    expect(orphaned, "a description carrying help names no cataloged game").toEqual([]);
  });

  it("is not vacuous — the globs found the pages", () => {
    expect(helped.length).toBeGreaterThan(50);
    expect(Object.keys(skeletons).length).toBeGreaterThan(1);
  });

  it.each(
    Object.entries(skeletons),
  )("the %s skeleton's page renders, as the copy's will", (path, text) => {
    const file = loadDescriptionFile(text, path);
    if (!("help" in file) || file.help === undefined)
      throw new Error(`${path}: no help`);
    const facts = {
      name: "Skeleton",
      rulesets: false,
      parameters: PARAMETERS_PLACEHOLDER,
      touch: TOUCH_PLACEHOLDER,
    };
    expect(renderHelpPage(file.help, facts, path)).toContain("## Hints");
  });
});

describe("every game's page has the one skeleton", () => {
  // The renderer writes the skeleton (`describe/help-page.ts`): the order of
  // the sections, their headings, the origins heading's number and the
  // parameters placeholder. What a page owes is read off the game, never off a
  // list: `hint()` decides the Hints section.
  //
  // A hint's sentence names its marks ("the striped and outlined regions", "the
  // ringed dot"), and a player who was never told what they mean has to decode
  // them on the spot, which is what the Hints section is for. For a game whose
  // hint declares `hint.marks`, the list of marks is generated from it (the
  // placeholder check below). For the rest, the check is PRESENCE, NOT
  // CONTENT: a field proves a section exists and nothing about whether it
  // teaches the marks.
  const hinted = new Set(HINT_GAMES.map(([id]) => id));

  it("is not vacuous — the registry offered hinted games", () => {
    expect(hinted.size).toBeGreaterThan(30);
  });

  it.each(puzzleIds)("%s: has a Hints section iff it has a hint", (id) => {
    expect(gameHelp(id).hints !== undefined, descriptionPath(id)).toBe(hinted.has(id));
  });

  // Who invented a puzzle, what else it is called and where more of it is to
  // be found is a credit worth keeping, and nothing a reader needs on the way
  // from the rules to the controls, so it is the description's `origins`.
  //
  // A credit is told from a rule by its WORDS, which is the only way a test
  // can tell one: these are the words every credit on these pages used when
  // they were moved (2026-10-07). It is a floor. A credit written in other
  // words passes, so the count below holds the pattern to the sections it was
  // read from.
  const CREDIT = /\binvent|\bdesigner\b|\bknown (?:as|under)\b|\bimplementation of\b/i;
  let credited = 0;

  it.each(puzzleIds)("%s: its origins are in their own section", (id) => {
    const { origins = "" } = gameHelp(id);
    if (CREDIT.test(origins)) credited++;
    const credit = CREDIT.exec(helpProse(id).replace(origins, ""));
    expect(
      credit?.[0],
      `${descriptionPath(id)} credits its puzzle outside its origins`,
    ).toBeUndefined();
  });

  itOverWholeSweep("is not vacuous — the credit words find the credits", () => {
    expect(credited).toBeGreaterThanOrEqual(10);
  });

  // A bound game's list of marks is generated from its legend
  // (`vite-plugins/hint-marks.ts`), so its Hints section carries the
  // placeholder the build fills, and no other page does. The build refuses both
  // mismatches too; this says so before a ten-minute gate reaches `vite build`.
  it.each(puzzleIds)("%s: carries the list-of-marks placeholder iff bound", (id) => {
    const game = getTsGame(id);
    const bound = game !== null && hasHint(game);
    expect(helpPage(id).includes(HINT_MARKS_PLACEHOLDER), descriptionPath(id)).toBe(
      bound,
    );
  });

  // A game whose hint can be a wing says what one is in its Hints section, in
  // the engine's one sentence (`vite-plugins/hint-marks.ts`), and no other
  // page does.
  let wingPages = 0;
  it.each(
    puzzleIds,
  )("%s: carries the wing placeholder iff its hint can be one", (id) => {
    const page = helpPage(id);
    const owed = getTsGame(id)?.hint.rungs.includes("wing") ?? false;
    const count = (text: string) => text.match(WING_PLACEHOLDER)?.length ?? 0;
    expect(count(gameHelp(id).hints ?? ""), descriptionPath(id)).toBe(owed ? 1 : 0);
    expect(count(page)).toBe(owed ? 1 : 0);
    if (owed) wingPages++;
  });

  itOverWholeSweep("is not vacuous — some page owes the wing", () => {
    expect(wingPages).toBeGreaterThanOrEqual(2);
  });

  // A page about pieces of the two-state pair names them with `{{pair:0}}` and
  // `{{pair:1}}` (`vite-plugins/pair.ts`). One that also types a name holds a
  // second copy of `PAIR_NAMES`, and one that says a member's color names a
  // piece by what a theme changes (`name-states-by-rule-not-color`).
  let pairPages = 0;
  it.each(
    puzzleIds,
  )("%s: a page naming the pair types neither name nor color", (id) => {
    const page = helpPage(id);
    expect(() => expandPair(page), `${descriptionPath(id)}`).not.toThrow();
    if (expandPair(page) === page) return;
    pairPages++;
    const words = [
      ...PAIR_NAMES,
      ...TWO.flatMap((c) => [wordOf(c).light, wordOf(c).dark]),
    ];
    for (const word of words)
      expect(page, `${descriptionPath(id)}`).not.toMatch(new RegExp(`\\b${word}`, "i"));
  });

  itOverWholeSweep("is not vacuous — some page names the pair", () => {
    expect(pairPages).toBeGreaterThanOrEqual(1);
  });

  // Every page is served from `/help/`, whatever directory its source is in,
  // so from a game's page `../x` is the game `x` and a site-level help page is
  // its bare name. A link written to the source tree's shape (`../features`)
  // renders and leads nowhere.
  const linked = [MARK_ALL_HELP];
  it.each(puzzleIds)("%s: a link out of the help names a game", (id) => {
    const page = helpPage(id);
    for (const source of [page, ...linked])
      for (const [, target] of source.matchAll(/\]\(\.\.\/([^)#]*)/g))
        expect(puzzleIds, `${descriptionPath(id)} links ../${target}`).toContain(
          target,
        );
  });

  // A game declaring `targetVerbs` has its Controls paragraph generated
  // (`vite-plugins/controls.ts`), inside its Controls section, and no other page
  // carries the placeholder. The build refuses both mismatches too.
  it.each(puzzleIds)("%s: carries the controls placeholder iff it has verbs", (id) => {
    const page = helpPage(id);
    const declares = getTsGame(id)?.targetVerbs !== undefined;
    const { controls } = gameHelp(id);
    expect(controls.includes(CONTROLS_PLACEHOLDER), `${descriptionPath(id)}`).toBe(
      declares,
    );
    expect(page.split(CONTROLS_PLACEHOLDER).length - 1).toBe(declares ? 1 : 0);
  });

  // The Mark-all press, the sticky pencil preference, what a placement rules
  // out and a clue marked done are each described by one generated sentence
  // (`vite-plugins/note-controls.ts`), in the Controls section of a game that
  // has the thing and on no other page.
  const noteSentences = [
    {
      placeholder: MARK_ALL_PLACEHOLDER,
      owed: (id: string) => getTsGame(id)?.markAll !== undefined,
    },
    {
      placeholder: STICKY_PENCIL_PLACEHOLDER,
      owed: (id: string) => offersStickyPencil(getTsGame(id) ?? {}),
    },
    {
      placeholder: RULES_OUT_PLACEHOLDER,
      owed: (id: string) => getTsGame(id)?.rulesOut !== undefined,
    },
    {
      placeholder: DONE_CLUES_PLACEHOLDER,
      owed: (id: string) => getTsGame(id)?.doneClues !== undefined,
    },
  ];
  let noteSentencePages = 0;
  it.each(puzzleIds)("%s: carries each note-taking sentence iff it is owed", (id) => {
    const page = helpPage(id);
    const { controls } = gameHelp(id);
    for (const { placeholder, owed } of noteSentences) {
      const where = `${descriptionPath(id)}, ${placeholder}`;
      expect(controls.includes(placeholder), where).toBe(owed(id));
      expect(page.split(placeholder).length - 1, where).toBe(owed(id) ? 1 : 0);
      if (owed(id)) noteSentencePages++;
    }
  });

  itOverWholeSweep("is not vacuous — some page owes a note-taking sentence", () => {
    expect(noteSentencePages).toBeGreaterThanOrEqual(2);
  });

  // A game with rulesets has its list of them generated from the declaration
  // (`engine/game-id/ruleset.ts`), in the unheaded rules at the top of its page, and no
  // other page carries the placeholder. The build refuses both mismatches too.
  let withRulesets = 0;

  it.each(puzzleIds)("%s: carries the rulesets placeholder iff it has them", (id) => {
    const page = helpPage(id);
    const game = getTsGame(id);
    if (!game) throw new Error(`${id} is not registered`);
    const declares = rulesetField(game) !== null;
    if (declares) withRulesets++;
    const { rules } = gameHelp(id);
    expect(rules.split(RULESETS_PLACEHOLDER).length - 1, `${descriptionPath(id)}`).toBe(
      declares ? 1 : 0,
    );
    expect(page.split(RULESETS_PLACEHOLDER).length - 1).toBe(declares ? 1 : 0);
  });

  itOverWholeSweep("is not vacuous — some games declare rulesets", () => {
    expect(withRulesets).toBeGreaterThanOrEqual(3);
  });

  // The same for a game with rule modifiers (`engine/game-id/modifier.ts`): its list
  // of them is generated, in the rules, and no other page has the placeholder.
  let withModifiers = 0;

  it.each(puzzleIds)("%s: carries the modifiers placeholder iff it has them", (id) => {
    const page = helpPage(id);
    const game = getTsGame(id);
    if (!game) throw new Error(`${id} is not registered`);
    const declares = modifiersOf(game).length > 0;
    if (declares) withModifiers++;
    const { rules } = gameHelp(id);
    expect(
      rules.split(MODIFIERS_PLACEHOLDER).length - 1,
      `${descriptionPath(id)}`,
    ).toBe(declares ? 1 : 0);
    expect(page.split(MODIFIERS_PLACEHOLDER).length - 1).toBe(declares ? 1 : 0);
  });

  itOverWholeSweep("is not vacuous — some games declare modifiers", () => {
    expect(withModifiers).toBeGreaterThanOrEqual(5);
  });

  // Where a page names a choice of one of its fields — a mode, a grid type —
  // it writes `{{choice:kw:index}}` and the build says the dialog's word
  // (`expandChoices`), so the name typed out is a second copy of it. The game's
  // own name is left alone: "Seismic" is the game far more often than its mode.
  // The tier names are too, being ordinary words ("an Easy board") that
  // `help/features.md` explains once for every game.
  let named = 0;
  let expanded = 0;

  it.each(puzzleIds)("%s: names a field's choice through the placeholder", (id) => {
    const page = helpPage(id);
    const game = getTsGame(id);
    if (!game) throw new Error(`${id} is not registered`);
    const config = game.paramConfig;
    expect(() => expandChoices(config, page), `${descriptionPath(id)}`).not.toThrow();
    expanded += page.split("{{choice:").length - 1;

    const tiers = difficultyChoiceItem(game);
    const typed: string[] = [];
    for (const item of config) {
      if (item.type !== "choices" || item === tiers) continue;
      item.choices.forEach((name, index) => {
        if (!/[a-z]/i.test(name) || name === puzzleDataMap[id].name) return;
        named++;
        const word = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(?<![\\w-])${word}(?![\\w-])`).test(page))
          typed.push(`"${name}" is {{choice:${item.kw}:${index}}}`);
      });
    }
    expect(typed, `${descriptionPath(id)} types a choice's name`).toEqual([]);
  });

  itOverWholeSweep("is not vacuous — choices were read, and pages name some", () => {
    expect(named).toBeGreaterThan(40);
    expect(expanded).toBeGreaterThan(15);
  });
});

describe("the All-the-puzzles page lists the whole collection", () => {
  // The table is built from the catalog (`puzzle/game-lists.ts`), so
  // what this reads is that the page still asks for it, and the builder still
  // writes a row per game.
  const listed = [
    ...puzzlesPage.matchAll(/^\|\s*\[[^\]]+]\(\.\.\/([a-z0-9]+)\)/gm),
  ].map((m) => m[1]);

  it("lists every cataloged puzzle", () => {
    const known = new Set(listed);
    expect(puzzleIds.filter((id) => !known.has(id))).toEqual([]);
  });

  it("lists nothing that is not a cataloged puzzle", () => {
    const known = new Set<string>(puzzleIds);
    expect(listed.filter((id) => !known.has(id))).toEqual([]);
  });

  it("is not vacuous — the row pattern matched", () => {
    expect(listed.length).toBe(puzzleIds.length);
  });
});

// `help-pages`, "A game's rules stand alone as a newcomer's summary": the rules
// are what a game's first open shows (`first-open-card.ts`), so they are short
// enough to read over the board, and a reader needs nothing but this page.
describe("a game's page stands alone for a newcomer", () => {
  // Measured on a 360×640 phone (2026-10-30): a card whose rules come to 90
  // words as the card shows them fits without scrolling, and the generated
  // lists of modes and settings are most of what overflowed.
  const RULES_WORDS = 90;
  const shownRules = (id: string): string => {
    const game = getTsGame(id);
    if (!game) throw new Error(`no game ${id}`);
    const lists = gameHelp(id)
      .rules.replace(
        RULESETS_PLACEHOLDER,
        rulesetsMarkdown(rulesetField(game)?.rulesets ?? []),
      )
      .replace(MODIFIERS_PLACEHOLDER, modifiersMarkdown(modifiersOf(game)));
    return expandPair(expandChoices(game.paramConfig, lists));
  };

  it.each(puzzleIds)("%s: its rules are a summary", (id) => {
    const count = shownRules(id)
      .split(/\s+/)
      .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    expect(
      count,
      `${descriptionPath(id)}: the first-open card shows ${count} words of rules; move what is past ${RULES_WORDS} under a heading of its own`,
    ).toBeLessThanOrEqual(RULES_WORDS);
  });

  it.each(puzzleIds)("%s: its rules link nowhere", (id) => {
    const link = /\]\(|https?:\/\//.exec(gameHelp(id).rules);
    expect(
      link?.[0],
      `${descriptionPath(id)}: a link belongs in origins`,
    ).toBeUndefined();
  });

  // A catalog name, as a name: case-sensitive, so "the path" and "a flip" are
  // words and "Path" and "Flip" are games, except where a sentence starts.
  let read = 0;
  it.each(puzzleIds)("%s: its rules and Controls name no other game", (id) => {
    const { rules, controls } = gameHelp(id);
    read++;
    for (const other of puzzleIds) {
      if (other === id) continue;
      const name = puzzleDataMap[other].name;
      const named = new RegExp(`(?<!^\\s*|[.!?]\\s+)\\b${name}\\b`, "m").exec(
        `${rules}\n\n${controls}`,
      );
      expect(
        named?.[0],
        `${descriptionPath(id)} names ${name}: say it in this page's own words`,
      ).toBeUndefined();
    }
  });

  itOverWholeSweep("is not vacuous — every page was read", () => {
    expect(read).toBe(puzzleIds.length);
  });

  // A control a page names in bold is spelled as the app spells it: a reader
  // looks for those words on the screen. The labels are the command list's,
  // read in each state that changes one.
  const labels = new Map<string, string>();
  for (const on of [false, true])
    for (const hintBeat of ["show", "explain", "apply"] as const) {
      const stub: CommandPuzzle = {
        puzzleId: "solo",
        canUndo: on,
        canRedo: on,
        canHint: true,
        canCheck: on,
        isSolved: on,
        hintPending: on,
        hintBeat,
        autoHintActive: on,
      };
      for (const { label } of commandList(stub, "Solo"))
        if (label) labels.set(label.toLowerCase(), label);
    }
  let bolded = 0;
  it.each(puzzleIds)("%s: names a command in bold as the app does", (id) => {
    for (const [, bold] of helpProse(id).matchAll(/\*\*([^*]+)\*\*/g)) {
      const label = labels.get(bold.toLowerCase());
      if (label === undefined) continue;
      bolded++;
      expect(bold, `${descriptionPath(id)} spells a command's label`).toBe(label);
    }
  });

  itOverWholeSweep("is not vacuous — pages name commands in bold", () => {
    expect(bolded).toBeGreaterThanOrEqual(10);
  });

  // An author's own voice, "I recommend", "I've had reports": a newcomer does
  // not know who is speaking. Credits are the origins', in their author's words.
  it.each(puzzleIds)("%s: speaks in no author's first person", (id) => {
    const { origins = "" } = gameHelp(id);
    const voice = /\b(?:I(?:'m|'ve|'d|'ll|’m|’ve|’d|’ll)?|[Mm]y|me)\b(?![-'’])/.exec(
      helpProse(id).replace(origins, ""),
    );
    expect(voice?.[0], `${descriptionPath(id)} speaks as its author`).toBeUndefined();
  });
});

describe("a help page introduces the puzzle, not its implementation", () => {
  // `help-pages`: these pages "SHALL NOT carry development status, known-issue
  // lists or roadmap notes". That rule has been in force since
  // `audit-author-known-issues` stripped `## Status` sections from the thirteen
  // third-party pages — and it was still being violated, in two pages, by a
  // *different spelling* of the same thing: upstream's `slide.html` and
  // `sokoban.html` opened a `<strong>Status:</strong>` paragraph with "This is
  // an experimental, unfinished puzzle", about two games this collection
  // finished, registered, spec'd and ships. A rule enforced by one spelling in
  // one directory is not enforced.
  //
  // Deliberately narrow: it matches the *label* forms only. Several pages say
  // "the status line" about the game's own status bar (palisade, samegame), and
  // a trap that fires on those would be turned off rather than fixed.
  const STATUS_LABEL = /^(?:#{1,6}\s*status\b|\*\*status:?\*\*)/im;

  it.each(puzzleIds)("%s", (id) => {
    const match = STATUS_LABEL.exec(helpPage(id));
    expect(
      match?.[0],
      `${descriptionPath(id)} carries a development-status note. Help pages describe how to play.`,
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// The site-level pages, held to the app rather than to a list of their own
// ---------------------------------------------------------------------------

/*
 * The three blocks below exist because the per-game invariant above has no
 * site-level counterpart, and the same class of miss followed it: on 2026-08-06
 * the whole of `help/` mentioned hints **once**, in passing, in a note about a
 * different puzzle — while thirty games shipped an explained `hint()` written to
 * a 2,500-line quality bar. Nothing could notice, because nothing was asked.
 *
 * ON THE INSTRUMENT. The tempting check — "does `features.md` contain the word
 * hint?" — is a grep for a spelling standing in for a resolved reference, which
 * is this repo's most-repeated defect (`grid.test.ts`'s `d.edges.length ===
 * d.order`, `touch-input.test.ts`'s catalog-vs-registry count, the silently
 * empty `import.meta.glob`, both halves of `retire-the-upstream-help-tree`'s
 * dead-link grep). Worse, it can only ever compare the help against a list
 * kept in the help's own test: it notices a section being **deleted** and never
 * a feature being **omitted**, which is the failure that actually happened.
 *
 * So the list comes from the `Game` contract. Every optional member is
 * classified, the classification is read against the contract's own AST, and an
 * **unclassified member fails** — a new capability cannot reach players without
 * someone saying, in one line, where a player is told about it.
 */

/** `help/features.md`, the page the site-level coverage is asserted against. */
const featuresPage = import.meta.glob<string>("../../help/features.md", {
  query: "?raw",
  import: "default",
  eager: true,
})["../../help/features.md"];

/** The words of every page the app serves: the site-level pages, and each
 * game's description. */
const allHelpPages = [
  ...Object.values(
    import.meta.glob<string>("../../help/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  ),
  ...gameDescriptions.values(),
];

/** The app's icon map's source — the naming convention a help glyph follows.
 * (It is not the *resolution* path: see "the help's glyphs are a closed set".) */
const iconsSource = import.meta.glob<string>("../icons.ts", {
  query: "?raw",
  import: "default",
  eager: true,
})["../icons.ts"];

/**
 * Where a player is told about each optional capability.
 *
 * - `features` — a feature of *this* fork, documented at that anchor in
 *   `help/features.md`. The anchor must exist; that is the checked half.
 * - `upstream` — a feature the original collection has too, covered by the
 *   manual `features.md` links to in its opening paragraph.
 * - `internal` — no player-visible surface of its own.
 *
 * **The boundary is not "did upstream have it" but "can a player find it
 * without being told".** Filling in every pencil mark is upstream's `M` key,
 * and a touch player has no `M` key, so the button we added is ours to explain.
 */
type Coverage =
  | { kind: "features"; anchor: string; why: string }
  | { kind: "upstream"; why: string }
  | { kind: "internal"; why: string };

const CAPABILITY_COVERAGE: Record<string, Coverage> = {
  // --- this fork's own, and the reason this file grew these blocks ---
  hint: { kind: "features", anchor: "hints", why: "the explained-hint stepper" },
  transposeParams: {
    kind: "features",
    anchor: "board-shape",
    why: "a new board is dealt turned to fit a wide screen",
  },
  hover: {
    kind: "features",
    anchor: "hover-connected",
    why: "hovering lights everything joined to what is under the pointer",
  },
  findMistakes: {
    kind: "features",
    anchor: "checking",
    why: "the mistake overlay, and the save it gates",
  },
  "hint.judgeMove": {
    kind: "features",
    anchor: "checking",
    why: "Check & save's word on the last move",
  },
  clearMistakes: {
    kind: "features",
    anchor: "hint-refusals",
    why: "applying the hint on a wrong board takes the mistakes off",
  },
  revealOne: {
    kind: "features",
    anchor: "hint-refusals",
    why: "applying the hint where deduction runs out fills in one piece of the answer",
  },
  difficulty: {
    kind: "features",
    anchor: "difficulty",
    why: "what a tier name promises — `Unreasonable` above all",
  },
  finishesByDeduction: {
    kind: "features",
    anchor: "difficulty",
    why: "the same promise for a game with no tiers: every board is finished by reasoning",
  },
  markAll: {
    kind: "features",
    anchor: "mark-all",
    why: "a toolbar button with no keyboard equivalent a touch player can reach",
  },
  reference: {
    kind: "features",
    anchor: "reference",
    why: "the reference panel, its search and filters, and picking an item",
  },
  rulesOut: {
    kind: "features",
    anchor: "rules-out",
    why: "a preference that makes the marks a placement rules out",
  },
  ignoresSecondaryButton: {
    kind: "features",
    anchor: "right-mouse",
    why: "why the touch right-click gestures are off in some puzzles",
  },
  requestKeys: {
    kind: "features",
    anchor: "virtual-keyboard",
    why: "the on-screen keyboard's keys are this",
  },
  keyStatus: {
    kind: "features",
    anchor: "virtual-keyboard",
    why: "a word puzzle's keys show what the guesses found",
  },
  textFormat: {
    kind: "features",
    anchor: "sharing",
    why: "Copy as text, in the share dialog",
  },
  notApplicable: {
    kind: "features",
    anchor: "hints",
    why: "the Draft label, and each game page's generated Not in this game section",
  },

  // --- the original collection's, covered by the manual features.md links to ---
  prefs: { kind: "upstream", why: "per-game preferences" },
  validateParams: {
    kind: "upstream",
    why: "the Custom dialog's refusal, beside the ranges the Parameters section states",
  },
  statusbarText: { kind: "upstream", why: "the status line" },

  // --- no player-visible surface of their own ---
  hasNoSolution: {
    kind: "internal",
    why: "refuses a game ID nobody could finish, in a sentence shown where it was opened",
  },
  supersededDesc: { kind: "internal", why: "how a save rebuilds a board that moved" },
  changedState: { kind: "internal", why: "a game's own bookkeeping across a move" },
  "hint.gesture": {
    kind: "internal",
    why: "how auto-hint plays a step with the pointer",
  },
  "hint.targets": {
    kind: "internal",
    why: "how auto-hint plays a step with the pointer, through the game's verbs",
  },
  targetVerbs: {
    kind: "internal",
    why: "the game page's Controls paragraph, generated from it rather than told once",
  },
  doneClues: {
    kind: "internal",
    why: "the game page's sentence on marking a clue done, generated from it",
  },
  "hint.refreshStep": { kind: "internal", why: "re-validating a stored step" },
  "hint.uiUpdateClears": {
    kind: "internal",
    why: "when a UI change invalidates a step",
  },
  paletteScheme: { kind: "internal", why: "how the palette adapts to a scheme" },
  animLength: { kind: "internal", why: "animation timing" },
  flashLength: { kind: "internal", why: "animation timing" },
  timerHolds: { kind: "internal", why: "when the solve timer waits" },
  moveCodec: { kind: "internal", why: "save format" },
  uiCodec: { kind: "internal", why: "save format" },
};

/** Every `{#anchor}` defined by a heading in `features.md`. */
function featuresAnchors(): Set<string> {
  if (featuresPage === undefined) {
    throw new Error("help-coverage: help/features.md not found");
  }
  return new Set(
    [...featuresPage.matchAll(/^#{2,6}[^\n]*\{#([a-z0-9-]+)\}\s*$/gm)].map((m) => m[1]),
  );
}

describe("every player-facing capability is documented somewhere", () => {
  const members = OPTIONAL_GAME_MEMBERS;

  it("inspects the whole optional surface of the contract", () => {
    // Vacuity: an AST read that matched nothing would pass every assertion
    // below over an empty list and report health.
    expect(members.length).toBeGreaterThan(20);
    expect(members).toContain("findMistakes");
    expect(members).toContain("hint.judgeMove");
  });

  it("classifies every optional member — a new capability cannot slip through", () => {
    const unclassified = members.filter((m) => !(m in CAPABILITY_COVERAGE));
    expect(
      unclassified,
      "a new `Game` capability needs a line in CAPABILITY_COVERAGE saying where " +
        "a player is told about it (or that they need not be)",
    ).toEqual([]);
  });

  it("classifies nothing the contract no longer offers", () => {
    const known = new Set(members);
    const stale = Object.keys(CAPABILITY_COVERAGE).filter((m) => !known.has(m));
    expect(stale, "CAPABILITY_COVERAGE names a member `Game` does not have").toEqual(
      [],
    );
  });

  it("has the features.md section every `features` classification claims", () => {
    const anchors = featuresAnchors();
    // Vacuity: a heading pattern that stopped matching would make every
    // `features` claim below unfalsifiable.
    expect(anchors.size).toBeGreaterThan(5);

    const missing = Object.entries(CAPABILITY_COVERAGE)
      .filter(([, c]) => c.kind === "features")
      .map(([m, c]) => [m, (c as { anchor: string }).anchor] as const)
      .filter(([, anchor]) => !anchors.has(anchor))
      .map(([m, anchor]) => `${m} → help/features.md#${anchor}`);
    expect(missing, "a documented capability's help section is gone").toEqual([]);
  });
});

describe("the populations the help asserts are derived, not trusted", () => {
  /*
   * `features.md` names the puzzles whose touch right-click gestures are
   * switched off, and the build writes the names from `ignoresSecondaryButton`
   * (`vite-plugins/game-lists.ts`). This reads the sentence as the build
   * renders it.
   *
   * The rule the help follows is "state the property, do not hand-maintain the
   * population": a named population the build derives cannot rot.
   */
  it("names exactly the puzzles whose secondary-button gestures are off", () => {
    const flaggedIds = REGISTERED_GAMES.filter(
      ([, g]) => g.ignoresSecondaryButton === true,
    ).map(([id]) => id);
    const flagged = flaggedIds.map((id) => puzzleDataMap[id]?.name ?? id).sort();
    expect(
      flagged.length,
      "no game declares the flag — derivation is vacuous",
    ).toBeGreaterThan(0);
    expect(featuresPage, `the page writes ${NO_RIGHT_CLICK} for them`).toContain(
      NO_RIGHT_CLICK,
    );

    const paragraph = /have no use for a right-click[^.]*?:([^.]*)\./s.exec(
      insertGameLists(puzzleDataMap, featuresPage ?? "", flaggedIds),
    )?.[1];
    expect(paragraph, "the §Right mouse sentence naming them has moved").toBeDefined();
    const named = (paragraph ?? "")
      .replace(/\*\*/g, "")
      .split(/,|\band\b/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .sort();
    expect(named).toEqual(flagged);
  });

  /*
   * `Unreasonable` is a promise, not a boast: it is the one tier name allowed to
   * mean "deduction may not finish this board" (`engine-difficulty`). Thirteen games
   * ship one and, until this change, nothing player-facing said so — which made
   * a hint that had honestly run out indistinguishable from a broken one.
   */
  it("explains the tier name as long as any game ships it", () => {
    const shipping = REGISTERED_GAMES.filter(([, game]) =>
      difficultyTiers(game)?.includes("Unreasonable"),
    );
    expect(
      shipping.length,
      "no game declares the tier — derivation is vacuous",
    ).toBeGreaterThan(0);
    expect(
      featuresAnchors().has("difficulty"),
      `${shipping.length} games offer an Unreasonable tier; features.md must say what it promises`,
    ).toBe(true);
  });
});

describe("the help's glyphs are a closed set", () => {
  /*
   * `::hint::` renders `<span class="icon icon-hint">`, and `--icon` on
   * `.icon-hint` in `src/css/help.css` is the only thing that puts a picture
   * there. A name with no rule renders as **empty space** — no build error, no
   * console warning, nothing.
   *
   * **The forward direction is asserted in `vite-plugins/extra-pages.ts`, not
   * here**, and deliberately: Vitest stubs every CSS import to the empty string
   * (`?raw` included, since the stub is applied by the CSS pipeline the query
   * still goes through), so this file cannot read the stylesheet at all — the
   * first cut tried, and its own vacuity guard convicted it. The plugin can, it
   * already has the icon name in hand, and it is where the standing TODO asking
   * for this check was written. `vite build` is in the pre-commit gate.
   *
   * What is left here is the direction that needs no stylesheet: the glyphs the
   * help asks for, held to the app's own icon names. A `::typo::` is caught by
   * the plugin as a missing rule; a *rule* for a glyph nobody uses is caught by
   * the plugin never touching it, which is why the reverse check is the one
   * worth keeping cheap.
   */
  const used = [
    ...new Set(
      allHelpPages.flatMap((page) =>
        [...page.matchAll(/::([a-z0-9-]+)(?:\|[^:]*)?::/g)].map((m) => m[1]),
      ),
    ),
  ].sort();

  it("is not vacuous — the pages were read and the glyph pattern matched", () => {
    expect(allHelpPages.length).toBeGreaterThan(50);
    expect(used.length).toBeGreaterThan(10);
  });

  it("names only glyphs the app itself has an icon for", () => {
    // `src/icons.ts` is not loaded by a help page, so this is not the
    // resolution path — it is the naming convention, which is worth holding to
    // so a help glyph and the toolbar button it describes stay the same picture.
    // The map's keys, read off its object literal: a key is a name whatever
    // its value is spelled as.
    const appIconNames = new Set<string>();
    for (const n of nodesOf(parsed("src/icons.ts", iconsSource ?? ""))) {
      if (
        !ts.isVariableDeclaration(n) ||
        !ts.isIdentifier(n.name) ||
        n.name.text !== "defaultIcons" ||
        n.initializer === undefined
      )
        continue;
      // `{ … } as const`, or any other assertion around the literal.
      let map: ts.Expression = n.initializer;
      while (
        ts.isAsExpression(map) ||
        ts.isSatisfiesExpression(map) ||
        ts.isParenthesizedExpression(map)
      )
        map = map.expression;
      if (ts.isObjectLiteralExpression(map))
        for (const p of map.properties)
          if (
            p.name !== undefined &&
            (ts.isStringLiteral(p.name) || ts.isIdentifier(p.name))
          )
            appIconNames.add(p.name.text);
    }
    expect(appIconNames.size, "no icon map read from src/icons.ts").toBeGreaterThan(20);
    // The help has a handful of glyphs of its own (install instructions,
    // `experimental`) that no app control uses; they are named here so the set
    // stays closed rather than the assertion being softened to a subset test.
    const HELP_ONLY = new Set([
      "edge-app-available",
      "ellipsis",
      "ellipsis-vertical",
      "experimental",
      "firefox-web-apps",
      "install-desktop",
      "ios-add-to-home-screen",
      "ios-share",
    ]);
    const unknown = used.filter((n) => !appIconNames.has(n) && !HELP_ONLY.has(n));
    expect(
      unknown,
      "a help glyph names neither an app icon nor a known help-only one",
    ).toEqual([]);
  });
});
