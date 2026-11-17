/**
 * The files a source check reads: those git tracks under `pathspecs`, and,
 * where `npm run game` asks for one game's verdict, that game's files git does
 * not track yet.
 *
 * A check that reads tracked files alone reads none of a game written but not
 * yet added, and passed it in the verdict to refuse it at the commit. The
 * untracked files are read only for the game the verdict is on
 * (`GAME_VERDICT_UNTRACKED`, its id), never in the gate: an untracked file is
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

/** The tracked files matching `pathspecs`, and the verdict's game's untracked
 * ones among them. A tracked file deleted and not yet staged is left out: the
 * checks read the working tree, as the gate tests it. */
export function listedFiles(pathspecs) {
  const tracked = git([], pathspecs).filter((f) => existsSync(f));
  const game = process.env.GAME_VERDICT_UNTRACKED ?? "";
  if (game === "") return tracked;
  const dir = `src/games/${game}/`;
  return tracked.concat(
    git(["--others", "--exclude-standard"], pathspecs).filter((f) => f.startsWith(dir)),
  );
}
