#!/usr/bin/env node
/**
 * Move source files and directories, and repoint everything that names them.
 *
 *   node scripts/move-modules.mjs src/engine/dsf.ts=src/engine/board/dsf.ts \
 *     src/engine/grid=src/engine/board/grid [--dry]
 *
 * Each argument is `old=new`, a tracked file or directory, from the root. A
 * test file's vitest snapshot (`__snapshots__/<name>.snap`) moves with it.
 *
 * What is repointed, in every tracked text file but the archive's and the
 * metrics' records of their day:
 *
 * - **A module specifier, read off the syntax tree**: an import, an `export …
 *   from`, an `import()`, and each pattern of an `import.meta.glob`. A
 *   specifier is resolved from where its file was and rewritten from where its
 *   file is, so a file that moves deeper keeps reaching what it reached. A glob
 *   is repointed by its static prefix, which keeps `./**` meaning the directory
 *   it meant.
 * - **A path from the root in text**: `src/engine/dsf.ts`, a backticked
 *   `engine/dsf.ts`, a directory's `src/engine/grid/`, in code strings,
 *   comments and the guides. A path reached by `../` is a specifier's and is
 *   left to the first pass.
 *
 * A description moved carries its compiled module's path with it
 * (`src/generated/…`, ignored by git and rebuilt by `npm run describe`).
 *
 * What it cannot see, and reports instead: a specifier built at run time (a
 * template literal, `new URL(p, import.meta.url)`). Read the diff by its
 * shape afterwards (`scripts/check-rename-shape.mjs`).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, posix } from "node:path";

const ts = createRequire(import.meta.url)("typescript");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const pairs = args
  .filter((a) => !a.startsWith("--"))
  .map((a) => {
    const [from, to] = a.split("=");
    if (!from || !to) throw new Error(`want old=new, got ${a}`);
    return [from.replace(/\/$/, ""), to.replace(/\/$/, "")];
  });
if (pairs.length === 0) {
  console.error("usage: move-modules.mjs old=new … [--dry]");
  process.exit(2);
}

const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .split("\0")
  .filter((f) => f !== "" && existsSync(f));
const trackedSet = new Set(tracked);

/** Every file moved, old → new; and every directory moved. */
const fileMap = new Map();
const dirMap = new Map();
for (const [from, to] of pairs) {
  if (trackedSet.has(from)) {
    fileMap.set(from, to);
    const snap = posix.join(
      posix.dirname(from),
      "__snapshots__",
      `${posix.basename(from)}.snap`,
    );
    if (trackedSet.has(snap))
      fileMap.set(
        snap,
        posix.join(posix.dirname(to), "__snapshots__", `${posix.basename(to)}.snap`),
      );
    continue;
  }
  const inside = tracked.filter((f) => f.startsWith(`${from}/`));
  if (inside.length === 0)
    throw new Error(`${from} is neither a tracked file nor a directory of them`);
  dirMap.set(from, to);
  for (const f of inside) fileMap.set(f, to + f.slice(from.length));
}

/** A compiled description goes where its description goes. */
const compiled = (p) =>
  p.startsWith("src/") && p.endsWith(".description.yaml")
    ? `src/generated/${p.slice(4).replace(/\.description\.yaml$/, ".compiled.ts")}`
    : null;
const virtual = new Map();
for (const [from, to] of fileMap) {
  const a = compiled(from);
  const b = compiled(to);
  if (a && b) virtual.set(a, b);
}
const generatedDirs = new Map();
for (const [from, to] of dirMap)
  if (from.startsWith("src/"))
    generatedDirs.set(`src/generated/${from.slice(4)}`, `src/generated/${to.slice(4)}`);

const exists = (p) => trackedSet.has(p) || virtual.has(p) || existsSync(p);
const movedTo = (p) => {
  if (fileMap.has(p)) return fileMap.get(p);
  if (virtual.has(p)) return virtual.get(p);
  for (const [from, to] of [...dirMap, ...generatedDirs])
    if (p === from || p.startsWith(`${from}/`)) return to + p.slice(from.length);
  return p;
};

/** `spec` as written in a file at `fromDir`, resolved to a root path and the
 * suffix the writer left off. */
function resolveSpec(fromDir, spec) {
  const base = posix.normalize(posix.join(fromDir, spec));
  for (const suffix of ["", ".ts", "/index.ts"]) {
    const p = base + suffix;
    if (exists(p) && (suffix !== "" || !isDir(p))) return { path: p, suffix };
  }
  return null;
}
const isDir = (p) => tracked.some((f) => f.startsWith(`${p}/`));

function relativeSpec(fromDir, to) {
  const r = posix.relative(fromDir, to);
  if (r === "") return ".";
  return r.startsWith(".") ? r : `./${r}`;
}

/** The rewritten specifier, or null when nothing it names moved. */
function repoint(oldFile, newFile, spec) {
  if (!spec.startsWith(".")) return null;
  const oldDir = posix.dirname(oldFile);
  const newDir = posix.dirname(newFile);
  const hit = resolveSpec(oldDir, spec);
  if (hit === null) return null;
  const target = movedTo(hit.path);
  if (target === hit.path && oldDir === newDir) return null;
  const full = relativeSpec(newDir, target);
  const out =
    hit.suffix && full.endsWith(hit.suffix) ? full.slice(0, -hit.suffix.length) : full;
  return out === spec ? null : out;
}

/** A glob's pattern repointed by its static prefix. */
function repointGlob(oldFile, newFile, pattern) {
  const neg = pattern.startsWith("!");
  const body = neg ? pattern.slice(1) : pattern;
  if (!body.startsWith(".")) return null;
  const parts = body.split("/");
  const firstMagic = parts.findIndex((s) => /[*?{[]/.test(s));
  const staticParts = firstMagic < 0 ? parts : parts.slice(0, firstMagic);
  const rest = firstMagic < 0 ? [] : parts.slice(firstMagic);
  if (firstMagic < 0) {
    const r = repoint(oldFile, newFile, body);
    return r === null ? null : (neg ? "!" : "") + r;
  }
  const oldDir = posix.dirname(oldFile);
  const abs = posix.normalize(posix.join(oldDir, ...staticParts));
  const target = movedTo(abs);
  const prefix = relativeSpec(posix.dirname(newFile), target);
  const out = [prefix, ...rest].join("/");
  const final = (neg ? "!" : "") + out;
  return final === pattern ? null : final;
}

const CODE = /\.(ts|mts|cts|mjs|js|tsx)$/;
const SKIP = [
  /^openspec\/changes\/archive\//,
  /^metrics\//,
  /\.(png|jpg|ico|woff2?|gz|zip)$/,
];
const unseen = [];

/** Specifier edits for one code file, as [start, end, text]. */
function specifierEdits(file, text) {
  const newFile = movedTo(file);
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const edits = [];
  const moves = newFile !== file;
  const literal = (node, f) => {
    if (!ts.isStringLiteralLike(node)) return;
    const r = f(node.text);
    if (r !== null) edits.push([node.getStart(sf) + 1, node.getEnd() - 1, r]);
  };
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    )
      literal(node.moduleSpecifier, (s) => repoint(file, newFile, s));
    else if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(sf);
      const arg = node.arguments[0];
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && arg) {
        if (ts.isStringLiteralLike(arg)) literal(arg, (s) => repoint(file, newFile, s));
        else if (moves) unseen.push(`${file}: import(${arg.getText(sf)})`);
      } else if (callee === "import.meta.glob" && arg) {
        const items = ts.isArrayLiteralExpression(arg) ? arg.elements : [arg];
        for (const item of items) literal(item, (s) => repointGlob(file, newFile, s));
      } else if (moves && /toMatchFileSnapshot$/.test(callee) && arg)
        unseen.push(`${file}: ${callee}(${arg.getText(sf)})`);
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isCallExpression(node.expression) &&
      node.expression.expression.getText(sf) === "import.meta.glob"
    ) {
      // A glob's result is keyed by each match's specifier from this file.
      literal(node.argumentExpression, (s) => repoint(file, newFile, s));
    } else if (
      ts.isNewExpression(node) &&
      node.expression.getText(sf) === "URL" &&
      node.arguments?.[1]?.getText(sf) === "import.meta.url"
    ) {
      const arg = node.arguments[0];
      if (ts.isStringLiteralLike(arg)) literal(arg, (s) => repoint(file, newFile, s));
      else if (moves)
        unseen.push(`${file}: new URL(${arg.getText(sf)}, import.meta.url)`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return edits;
}

/** Root paths in text: every moved file, and every moved directory as a
 * prefix. Longest first, so `engine/hint-words.test.ts` wins over its stem. */
const textMoves = new Map();
for (const [from, to] of [...fileMap, ...virtual]) {
  textMoves.set(from, to);
  if (from.endsWith(".ts") && !from.endsWith("/index.ts"))
    textMoves.set(from.slice(0, -3), to.slice(0, -3));
}
for (const [from, to] of [...dirMap, ...generatedDirs]) {
  textMoves.set(`${from}/`, `${to}/`);
  textMoves.set(from, to);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const keys = [...textMoves.keys()].sort((a, b) => b.length - a.length);
const alternatives = keys.map((k) => {
  const bare = k.slice(4); // without `src/`
  // A stem or a directory without its slash must end there; a full file name
  // or a directory with its slash may run on.
  const end = /\.[a-z]+$|\/$/.test(k) ? "" : "(?![\\w.\\-/])";
  // Without `src/`, a path needs a directory to be one: a bare file name is
  // prose about the file, true wherever it lives.
  const short = bare.replace(/\/$/, "").includes("/")
    ? `|(?<![\\w/.\\-])${esc(bare)}`
    : "";
  return `(?:src/${esc(bare)}${short})${end}`;
});
const pathPattern = keys.length ? new RegExp(alternatives.join("|"), "g") : null;
const lookup = new Map(keys.map((k) => [k.slice(4), textMoves.get(k).slice(4)]));

function textEdits(text) {
  if (!pathPattern) return text;
  return text.replace(pathPattern, (m) => {
    const src = m.startsWith("src/") && lookup.has(m.slice(4));
    const key = src ? m.slice(4) : m;
    const to = lookup.get(key);
    if (to === undefined) return m;
    return src ? `src/${to}` : to;
  });
}

const changed = [];
for (const file of tracked) {
  if (SKIP.some((r) => r.test(file))) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("\0")) continue;
  let next = text;
  if (CODE.test(file)) {
    const edits = specifierEdits(file, text).sort((a, b) => b[0] - a[0]);
    for (const [s, e, r] of edits) next = next.slice(0, s) + r + next.slice(e);
  }
  next = textEdits(next);
  if (next !== text) changed.push([file, next]);
}

console.log(`${fileMap.size} file(s) to move, ${changed.length} file(s) to repoint.`);
for (const u of unseen) console.log(`  not repointed (built at run time): ${u}`);
if (dry) {
  for (const [f] of changed) console.log(`  ${f}`);
  process.exit(0);
}
for (const [file, next] of changed) writeFileSync(file, next);
for (const [from, to] of fileMap) {
  mkdirSync(dirname(to), { recursive: true });
  execFileSync("git", ["mv", from, to]);
}
console.log("done: read the diff by its shape (scripts/check-rename-shape.mjs).");
