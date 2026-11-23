/**
 * The games born from their descriptions: each description that carries
 * `catalog:`, with the game it registers and its cases file. A guard over
 * born games takes its population here, so a game joins by being born and
 * no list is kept.
 *
 * Dev/test-only; never imported by production code.
 */

import { parse } from "yaml";
import { type AnyGame, REGISTERED_GAMES } from "./enrollment.ts";
import { casesPath } from "./game-cases.ts";

const descriptions = import.meta.glob<string>("../../games/*/*.description.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});
const compiledModules = import.meta.glob<Readonly<Record<string, unknown>>>(
  "../../generated/games/*/*.compiled.ts",
  { eager: true },
);
const casesFiles = import.meta.glob<string>("../../games/*/*.cases.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** A glob key as a path from the repository's root. */
const fromRoot = (key: string): string => key.replace(/^(\.\.\/)+/, "src/");

export interface BornGame {
  readonly id: string;
  readonly game: AnyGame;
  /** Its description, from the root. */
  readonly source: string;
  /** Its description, as read. */
  readonly description: Readonly<Record<string, unknown>>;
  /** The module its description compiles to. */
  readonly compiled: Readonly<Record<string, unknown>>;
  /** Its cases file, from the root, and the text there; null where it has
   * none. */
  readonly cases: { readonly path: string; readonly text: string } | null;
}

/** Every cases file, from the root, whether or not a born game's. */
export const CASES_FILES: readonly string[] = Object.keys(casesFiles).map(fromRoot);

export const BORN_GAMES: readonly BornGame[] = Object.entries(descriptions).flatMap(
  ([key, text]) => {
    const data = parse(text, { version: "1.2", schema: "core" }) as Record<
      string,
      unknown
    > | null;
    if (data?.["catalog"] === undefined) return [];
    const id = String(data["game"]);
    const game = REGISTERED_GAMES.find(([g]) => g === id)?.[1];
    if (game === undefined)
      throw new Error(`${fromRoot(key)}: ${id} is not registered`);
    const compiled = Object.entries(compiledModules).find(([p]) =>
      p.endsWith(`/${id}/${id}.compiled.ts`),
    )?.[1];
    if (compiled === undefined)
      throw new Error(`${fromRoot(key)}: ${id} has no compiled module`);
    const casesKey = casesPath(key);
    const casesText = casesFiles[casesKey];
    return [
      {
        id,
        game,
        source: fromRoot(key),
        description: data,
        compiled,
        cases:
          casesText === undefined
            ? null
            : { path: fromRoot(casesKey), text: casesText },
      },
    ];
  },
);

/**
 * Whether game `id` is born and its board keeps no notes (its compiled
 * `play.notes`). A born game's code is the fill board's, which walks the
 * candidate plan and speaks the Latin words for a board that keeps notes
 * alone, so a guard asking what a game's code calls leaves such a game out:
 * the code says the walk is there, and the game never takes it.
 */
export function bornWithoutNotes(id: string): boolean {
  const born = BORN_GAMES.find((b) => b.id === id);
  if (born === undefined) return false;
  return (
    (born.compiled["play"] as { readonly notes?: true } | undefined)?.notes !== true
  );
}
