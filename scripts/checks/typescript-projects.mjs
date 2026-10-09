#!/usr/bin/env node
/**
 * Every tracked TypeScript file belongs to a project the gate compiles
 * (`build-pipeline`, "The typechecker sees every TypeScript file in the
 * repository").
 *
 * A file outside every project's `include` is checked by nothing, and nothing
 * says so: the compiler reports on the files it was given. So this asks each
 * project for the files it reads and compares that with what git tracks.
 *
 * The projects are the ones `scripts/gate.sh` hands the compiler, read from
 * its own lines, so a project the gate stops compiling stops counting here.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const tsc = join(repoRoot, "node_modules", "typescript-7", "bin", "tsc");

const gate = readFileSync(join(repoRoot, "scripts", "gate.sh"), "utf8");
const projects = [...gate.matchAll(/^npm run -s tsc -- (.*)$/gm)].map(
  ([, args]) => /-p (\S+)/.exec(args)?.[1] ?? "tsconfig.json",
);
if (projects.length < 2) {
  console.error(
    `✗ typescript-projects: found ${projects.length} compiler line(s) in scripts/gate.sh, and there are at least two projects.`,
  );
  process.exit(1);
}

const compiled = new Set();
for (const project of projects) {
  const listing = execFileSync(
    process.execPath,
    [tsc, "-p", project, "--listFilesOnly"],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  for (const file of listing.split("\n")) {
    if (file) {
      compiled.add(relative(repoRoot, file));
    }
  }
}

const tracked = execFileSync("git", ["ls-files", "*.ts", "*.mts", "*.cts"], {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);
const outside = tracked.filter((file) => !compiled.has(file));

if (outside.length > 0) {
  console.error(
    `✗ typescript-projects: ${outside.length} TypeScript file(s) are in no project the gate compiles:`,
  );
  for (const file of outside) {
    console.error(`    ${file}`);
  }
  console.error(`  Add each to the \`include\` of one of: ${projects.join(", ")}.`);
  process.exit(1);
}
console.log(
  `✓ typescript-projects: ${tracked.length} TypeScript files, each in one of ${projects.length} projects.`,
);
