/**
 * The boards a run's workers deal, shared between them through files
 * (`src/engine/testing/dealt.ts`, "A run's workers share their boards too").
 *
 * As a setup file it installs the store in each worker, in the directory
 * {@link setup} made for the run; as a global setup it makes that directory
 * before the workers start and removes it after them. A worker inherits the
 * environment it was started with, which is how the directory reaches it.
 *
 * A worker that finds a board claimed and not yet written waits for it, since
 * dealing it again would cost as much as the wait. A claim whose worker has
 * gone is taken over.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  type DealStore,
  type StoredDeal,
  shareDealsThrough,
} from "../../src/engine/testing/dealt.ts";

const VARIABLE = "DEALT_BOARDS_DIR";

/** How long a waiting worker sleeps between looks at a claimed board. */
const POLL_MS = 20;

const pause = new Int32Array(new SharedArrayBuffer(4));

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function fileStore(dir: string): DealStore {
  // A key is params as a game encodes them, which may hold any character, and
  // may differ from another only in case, which a Mac's file names ignore
  // (Guess's `b` and `B`).
  const file = (key: string) =>
    path.join(dir, createHash("sha256").update(key).digest("hex"));
  return {
    take(key) {
      const board = `${file(key)}.json`;
      const claim = `${file(key)}.claim`;
      for (;;) {
        if (existsSync(board))
          return JSON.parse(readFileSync(board, "utf8")) as StoredDeal;
        try {
          writeFileSync(claim, String(process.pid), { flag: "wx" });
          return null;
        } catch (e) {
          if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
        }
        // The board may have been written since it was looked for.
        if (existsSync(board)) continue;
        const holder = Number(readFileSync(claim, "utf8"));
        if (holder === process.pid) return null;
        if (!alive(holder)) {
          unlinkSync(claim);
          continue;
        }
        Atomics.wait(pause, 0, 0, POLL_MS);
      }
    },
    put(key, deal) {
      const board = `${file(key)}.json`;
      // Written whole and then renamed, so no worker reads half of it.
      writeFileSync(`${board}.${process.pid}`, JSON.stringify(deal));
      renameSync(`${board}.${process.pid}`, board);
    },
  };
}

const dir = process.env[VARIABLE];
if (dir !== undefined && dir !== "") shareDealsThrough(fileStore(dir));

/** Makes the run's directory, and returns what removes it. Each project of
 * the run may call it, and the first one's directory is the run's. */
export function setup(): () => void {
  if (process.env[VARIABLE]) return () => {};
  const made = mkdtempSync(path.join(tmpdir(), "dealt-boards-"));
  process.env[VARIABLE] = made;
  return () => rmSync(made, { recursive: true, force: true });
}
