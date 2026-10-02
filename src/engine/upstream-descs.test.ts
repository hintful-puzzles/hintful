/*
 * A game ID upstream's own generator wrote still loads here.
 *
 * Compatibility with Simon Tatham's collection and the forks of it is
 * best-effort (AGENTS.md § "Upstream policy"): a player may paste a link to a
 * game on Simon Tatham's site, and the descs are close enough that keeping them
 * loading costs little. Every game's frozen differential fixture holds descs the C
 * generated, so each one must load (`validateDesc`). A parser tightened past what
 * upstream writes fails here, naming the desc.
 *
 * A fixture states its params either as a params string or as fields, which
 * are laid over the game's defaults. Unequal's fixture numbers its mode where
 * the params name it, the one translation needed.
 */
import { expect, it } from "vitest";
import { validateDesc } from "./desc-error.ts";
import { REGISTERED_GAMES } from "./testing/enrollment.ts";

interface Fields {
  desc?: unknown;
  params?: unknown;
  mode?: unknown;
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

function paramsFor(id: string, f: Fields, defaults: Fields): Fields {
  const params = { ...defaults, ...f };
  if (id === "unequal") params.mode = f.mode === 1 ? "adjacent" : "unequal";
  return params;
}

it("every desc upstream's generator wrote loads", () => {
  const games = new Map(REGISTERED_GAMES);
  const refused: string[] = [];
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
      const params =
        typeof f.params === "string"
          ? game.decodeParams(f.params)
          : paramsFor(id, f, game.defaultParams() as Fields);
      const err = validateDesc(game, params, f.desc);
      if (err !== null) refused.push(`${id} ${f.desc}: ${err}`);
    }
  }
  // 48 fixture files and 747 descs when written.
  expect(files).toBeGreaterThanOrEqual(40);
  expect(descs).toBeGreaterThanOrEqual(600);
  expect(refused).toEqual([]);
});
