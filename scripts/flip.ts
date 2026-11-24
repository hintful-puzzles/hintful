/**
 * What moving a game onto its description has left: `npm run flip -- <game>`.
 *
 * A flip deletes the game's hand-written modules and its tests, and the tree
 * still names them in places no single check reads. Each flip found them one
 * at a time, in the gate or in CI; this lists them at once, before the commit
 * or after it, and changes nothing:
 *
 *   1. what is left in the game's directory: modules and tests not yet
 *      deleted, and whether the description is born and has its cases file;
 *   2. every reference to one of the game's modules, by its path under the
 *      game's directory (`solo/solver.ts`), in any tracked file outside the
 *      directory, the generated tree, the snapshots, openspec's changes (their
 *      prose records what the code was the day it was written) and the
 *      research results and the metrics reports; the guides' are listed
 *      apart. The modules are those
 *      in the working tree, in HEAD and deleted in any commit, so a reference
 *      is found after the flip's commit as before it;
 *   3. the `game-lines` ceiling, as its check reports it;
 *   4. the snapshots outside the directory that name the game, by file name
 *      or by an entry's key, with the test that writes each;
 *   5. the lines of the cross-game guards and checks that name the game's id
 *      as a string or an object's key: a list kept by hand, which a flip may have to edit, and
 *      which `docs/doctrine.md` would rather derive.
 *
 * It exits 0 whatever it finds: it is a report, and the gate holds the rules.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function git(args: readonly string[]): string {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  // git grep exits 1 for "no match", which is an answer here.
  if (r.status !== 0 && !(args[0] === "grep" && r.status === 1))
    throw new Error(`git ${args.join(" ")} failed:\n${r.stderr}`);
  return r.stdout;
}

const game = process.argv[2];
if (game === undefined || !/^[a-z]+$/.test(game)) {
  console.error("usage: npm run flip -- <game>");
  process.exit(2);
}
const dir = `src/games/${game}`;
if (!existsSync(path.join(ROOT, dir)) && git(["ls-tree", "HEAD", dir]) === "") {
  console.error(`flip: no ${dir}, in the working tree or in HEAD`);
  process.exit(2);
}

const sections: string[] = [];
const section = (title: string, lines: readonly string[], none: string): void => {
  sections.push(
    `${title} (${lines.length})\n${lines.length === 0 ? `  ${none}` : lines.map((l) => `  ${l}`).join("\n")}`,
  );
};

// 1. The directory.
const onDisk = existsSync(path.join(ROOT, dir))
  ? readdirSync(path.join(ROOT, dir), { recursive: true }).map(String)
  : [];
const description = path.join(ROOT, dir, `${game}.description.yaml`);
const born =
  existsSync(description) && /^catalog:/m.test(readFileSync(description, "utf8"));
const left = onDisk
  .filter((f) => f.endsWith(".ts") || f.endsWith(".snap"))
  .map((f) => `${dir}/${f}`);
if (!born)
  left.unshift(`${dir}/${game}.description.yaml carries no catalog: (not born)`);
if (!existsSync(path.join(ROOT, dir, `${game}.cases.yaml`)))
  left.unshift(`no ${dir}/${game}.cases.yaml: the tests have nowhere to go`);
section("Left in the game's directory", left, "only the description's files");

// 2. References to the game's modules.
const modules = new Set(
  [
    ...onDisk.filter((f) => f.endsWith(".ts")),
    ...git(["ls-tree", "-r", "--name-only", "HEAD", dir])
      .split("\n")
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.slice(dir.length + 1)),
    ...git(["log", "--format=", "--name-only", "--diff-filter=D", "--", dir])
      .split("\n")
      .filter((f) => f.endsWith(".ts"))
      .map((f) => f.slice(dir.length + 1)),
  ].map((f) => f.replace(/\.ts$/, "")),
);
const refs: string[] = [];
const guideRefs: string[] = [];
if (modules.size > 0) {
  const alternation = [...modules]
    .map((m) => m.replace(/[.]/g, "[.]"))
    .sort()
    .join("|");
  const out = git([
    "grep",
    "-n",
    "-E",
    `(^|[^A-Za-z0-9_-])${game}/(${alternation})([.]ts)?([^A-Za-z0-9_./-]|$)`,
    "--",
    ".",
    `:!${dir}/`,
    ":!src/generated/",
    ":!**/__snapshots__/**",
    ":!openspec/changes/",
    ":!research/**/*.txt",
    ":!metrics/",
  ]);
  // The compiled module's path, `generated/games/<game>/<game>.compiled.ts`,
  // ends as a module of the game's directory once did; git's ERE has no
  // lookbehind to refuse it there.
  const cited = new RegExp(
    `(?<!generated/games/)(?<![A-Za-z0-9_-])${game}/(${alternation})([.]ts)?(?![A-Za-z0-9_./-])`,
  );
  for (const line of out.split("\n").filter((l) => cited.test(l))) {
    const short = line.length > 160 ? `${line.slice(0, 157)}...` : line;
    if (/^(docs\/|README\.md|AGENTS\.md)/.test(line)) guideRefs.push(short);
    else refs.push(short);
  }
}
section(
  "Guides citing the game's modules",
  guideRefs,
  "none (`scripts/checks/guide-paths.mjs` holds every citation to a file)",
);
section("Other files citing the game's modules", refs, "none");

// 3. The ceiling.
const lines = spawnSync(process.execPath, ["scripts/checks/game-lines.mjs"], {
  cwd: ROOT,
  encoding: "utf8",
});
sections.push(`The game-lines ceiling\n  ${(lines.stdout + lines.stderr).trim()}`);

// 4. Snapshots.
const snapshots: string[] = [];
const named = new RegExp(`(^|[^a-z])${game}([^a-z]|$)`);
for (const file of git(["ls-files", "*/__snapshots__/*"]).split("\n").filter(Boolean)) {
  if (file.startsWith(`${dir}/`) || !existsSync(path.join(ROOT, file))) continue;
  const base = path.basename(file);
  let why: string | null = null;
  if (named.test(base.replace(/\.test\.ts\.snap$/, ""))) why = "by name";
  else if (file.endsWith(".snap")) {
    const keys = readFileSync(path.join(ROOT, file), "utf8")
      .split("\n")
      .filter((l) => l.startsWith("exports[`") && named.test(l));
    if (keys.length > 0) why = `${keys.length} entr${keys.length === 1 ? "y" : "ies"}`;
  }
  if (why === null) continue;
  const parent = path.dirname(path.dirname(file));
  const writer = file.endsWith(".snap")
    ? `${parent}/${base.replace(/\.snap$/, "")}`
    : writerOf(parent, base);
  snapshots.push(`${file} (${why}): npx vitest run --update=all ${writer}`);
}
/** The test in `parent` that names a file snapshot's prefix, the part before
 * the game's id (`hint-walk-`). */
function writerOf(parent: string, base: string): string {
  const prefix = base.slice(0, base.search(named) + 1);
  const writers = readdirSync(path.join(ROOT, parent))
    .filter((f) => f.endsWith(".test.ts"))
    .filter((f) => readFileSync(path.join(ROOT, parent, f), "utf8").includes(prefix));
  return writers.length === 1 ? `${parent}/${writers[0]}` : `<the test that writes it>`;
}
section("Snapshots outside the directory that name the game", snapshots, "none");

// 5. Hand-kept lists.
const lists = git([
  "grep",
  "-n",
  "-E",
  `["'\`]${game}["'\`]|^[[:space:]]+${game}:`,
  "--",
  "src/guards/*.ts",
  "src/engine/testing/*.ts",
  "scripts/checks/*",
]);
section(
  "Guards and checks naming the game's id",
  lists
    .split("\n")
    .filter(Boolean)
    .map((l) => (l.length > 160 ? `${l.slice(0, 157)}...` : l)),
  "none",
);

console.log(`What flipping ${game} has left\n\n${sections.join("\n\n")}`);
