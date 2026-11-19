/**
 * The files a source check reads: those git tracks under `pathspecs`, and,
 * where `npm run fast-checks` runs the gate's checks ahead of a commit
 * (`GATE_KEEP_GOING`), the files git does not track yet.
 *
 * A check that reads tracked files alone reads none of a game or a module
 * written but not yet added, and passed it there to refuse it at the commit.
 * The untracked files are never read in the gate itself: an untracked file is
 * left out of a commit, and one read there could pass a check the commit then
 * fails without it.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/** Every file git lists for `args` and `pathspecs`, split on NUL. */
const git = (args, pathspecs) =>
  execFileSync("git", ["ls-files", "-z", ...args, "--", ...pathspecs], {
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);

/** The tracked files matching `pathspecs`, and the untracked ones where the
 * run is ahead of a commit. A tracked file deleted and not yet staged is left
 * out: the checks read the working tree, as the gate tests it. */
export function listedFiles(pathspecs) {
  const tracked = git([], pathspecs).filter((f) => existsSync(f));
  if (process.env.GATE_KEEP_GOING !== "1") return tracked;
  return tracked.concat(git(["--others", "--exclude-standard"], pathspecs));
}
