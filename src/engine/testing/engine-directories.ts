/**
 * **The engine's directories, bottom to top**, and what each is.
 *
 * A module imports at run time only from its own directory or one earlier in
 * this list (`src/module-layering.test.ts`). A type-only import goes
 * anywhere: the contract names every concern's types, and an erased import
 * forms no runtime edge. Every directory directly under `src/engine/` is
 * listed, and nothing else is, so a new directory states its place here.
 *
 * What a kind means to the readers of this list:
 *
 * - `concern`: helpers grouped by what they are for. Each module is a helper
 *   of its own, cataloged by its file name; a directory inside one is a
 *   library (`docs/engine-catalog.md`).
 * - `library`: one helper made of parts, cataloged by its directory.
 * - `family`: the half of a `Game` that several games share. A game that
 *   imports it counts its files as its own code
 *   (`gameSourceFiles`, `enrollment.ts`).
 * - `harness`: the in-process test harness; nothing ships it.
 *
 * Dev/test-only, and plain data, so a node script can read it as well.
 */
export type EngineDirectoryKind = "concern" | "library" | "family" | "harness";

export const ENGINE_DIRECTORIES: readonly {
  readonly dir: string;
  readonly kind: EngineDirectoryKind;
}[] = [
  { dir: "color", kind: "library" },
  { dir: "contract", kind: "concern" },
  { dir: "random", kind: "library" },
  { dir: "board", kind: "concern" },
  { dir: "input", kind: "concern" },
  { dir: "game-id", kind: "concern" },
  { dir: "render", kind: "concern" },
  { dir: "mechanics", kind: "concern" },
  { dir: "generate", kind: "concern" },
  { dir: "solve", kind: "concern" },
  { dir: "hint", kind: "concern" },
  { dir: "edge-clue-latin", kind: "family" },
  { dir: "midend", kind: "concern" },
  { dir: "testing", kind: "harness" },
];
