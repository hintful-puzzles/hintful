/*
 * A game ID upstream's own generator wrote still loads here.
 *
 * Compatibility with Simon Tatham's collection and the forks of it is
 * best-effort (AGENTS.md § "Upstream policy"): a player may paste a link to a
 * game on Simon Tatham's site, and the descs are close enough that keeping them
 * loading costs little. Every game's frozen differential fixture holds descs the C
 * generated, so each one must load (`loadVerdict`): parse, and have the one answer
 * loading asks of a game with a mistake check. A parser tightened past what
 * upstream writes fails here, naming the desc.
 *
 * A fixture states its params either as a params string or as fields, which
 * are laid over the game's defaults. **Every field is placed or known to be
 * about the fixture**, and a value must have its param's type: a field the
 * mapping drops loads the desc under the default params, which a parse alone
 * cannot notice. Boats' fleet, Keen's multiplication-only flag and Tracks'
 * single-ones count were dropped that way until the load verdict began asking
 * each game's solver about the board, which refused every Boats desc as
 * contradictory.
 */
import { expect, it } from "vitest";
import { loadVerdict } from "./desc-error.ts";
import { difficultyTiers, withTier } from "./difficulty.ts";
import { REGISTERED_GAMES } from "./testing/enrollment.ts";

interface Fields {
  desc?: unknown;
  params?: unknown;
  fixtures?: unknown;
  [field: string]: unknown;
}

const fixtures = import.meta.glob<unknown>(
  "../games/*/__fixtures__/*-c-reference.json",
  {
    eager: true,
    import: "default",
  },
);

/** Fields that describe the fixture rather than the board's params. */
const ABOUT_THE_FIXTURE = new Set([
  "desc",
  "seed",
  "aux",
  "genMs",
  "solverDiff",
  "solverKdiff",
  "gradeDiff",
  "grade",
  "solveRet",
  "verdict",
  "route",
  "minMoves",
  "name",
  "typeName",
  "diffIndex",
  "iterativeSolved",
  "bruteforceSolved",
  "ambiguous",
  "inconsistent",
]);

/** A fixture field whose param has another name or another form here. */
const TRANSLATED: Readonly<Record<string, Record<string, (v: unknown) => Fields>>> = {
  unequal: { mode: (v) => ({ mode: v === 1 ? "adjacent" : "unequal" }) },
  boats: { fleetdata: (v) => ({ fleetData: String(v).split(",").map(Number) }) },
  keen: { mult: (v) => ({ multiplicationOnly: v === true }) },
  tracks: { single_ones: (v) => ({ singleOnes: v === 1 }) },
  galaxies: { diff: (v) => ({ diff: "nu".indexOf(String(v)) }) },
};

type Game = (typeof REGISTERED_GAMES)[number][1];

/** The params key that holds `game`'s tier, or `null` for an untiered game. */
function tierKey(game: Game, defaults: Fields): string | null {
  if (difficultyTiers(game) === null) return null;
  const at = (t: number) => withTier(game, defaults, t) as Fields;
  return Object.keys(defaults).find((k) => at(0)[k] !== at(1)[k]) ?? null;
}

/** The params a fixture states, or the reasons its fields cannot be placed. A
 * fixture numbers a tier the game's params may name, which is the one
 * translation every tiered game shares. */
function paramsFor(
  id: string,
  game: Game,
  f: Fields,
  defaults: Fields,
): Fields | string[] {
  let params: Fields = { ...defaults };
  const unplaced: string[] = [];
  const tiered = tierKey(game, defaults);
  for (const [field, value] of Object.entries(f)) {
    if (ABOUT_THE_FIXTURE.has(field)) continue;
    const translate = TRANSLATED[id]?.[field];
    if (field === tiered && typeof value === "number" && !translate) {
      params = withTier(game, params, value) as Fields;
      continue;
    }
    const placed = translate ? translate(value) : { [field]: value };
    for (const [key, v] of Object.entries(placed)) {
      if (!(key in defaults)) unplaced.push(`${id}.${field}: no such param`);
      else if (typeof v !== typeof defaults[key])
        unplaced.push(
          `${id}.${field}: ${typeof v} for a ${typeof defaults[key]} param`,
        );
      else params[key] = v;
    }
  }
  return unplaced.length > 0 ? unplaced : params;
}

it("every desc upstream's generator wrote loads", () => {
  const games = new Map(REGISTERED_GAMES);
  const refused: string[] = [];
  const unplaced = new Set<string>();
  let files = 0;
  let descs = 0;
  for (const [path, data] of Object.entries(fixtures)) {
    files++;
    const id = path.split("/")[2] as string;
    const game = games.get(id);
    if (!game) throw new Error(`${path}: no registered game ${id}`);
    const list = (Array.isArray(data) ? data : (data as Fields).fixtures) as Fields[];
    for (const f of list) {
      if (typeof f.desc !== "string") continue;
      descs++;
      let params: unknown;
      if (typeof f.params === "string") params = game.decodeParams(f.params);
      else {
        const placed = paramsFor(id, game, f, game.defaultParams() as Fields);
        if (Array.isArray(placed)) {
          for (const u of placed) unplaced.add(u);
          continue;
        }
        params = placed;
      }
      const err = loadVerdict(game, params, f.desc);
      if (err !== null) refused.push(`${id} ${f.desc}: ${err}`);
    }
  }
  // 48 fixture files and 747 descs when written.
  expect(files).toBeGreaterThanOrEqual(40);
  expect(descs).toBeGreaterThanOrEqual(600);
  expect([...unplaced]).toEqual([]);
  expect(refused).toEqual([]);
});
