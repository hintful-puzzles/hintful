import Dexie, { type Table } from "dexie";
import type { DealtBoard, EncodedParams, PuzzleId } from "../engine/types.ts";

interface KeptBoardRecord extends DealtBoard {
  puzzleId: PuzzleId;
  /** The build that dealt the board. */
  build: string;
}

/**
 * Its own database, apart from `PuzzleAppData`: nothing here is the player's.
 * Every row can be dealt again, so it can be dropped whole, and adding it
 * changed no schema that holds a saved game.
 */
class KeptBoardsDatabase extends Dexie {
  boards!: Table<KeptBoardRecord, [PuzzleId, EncodedParams]>;

  constructor() {
    // Dexie reads the IndexedDB globals once, as its module loads. The puzzle
    // runtime imports this store, so in a test worker that module may load
    // before the file that installs a fake IndexedDB: name them at open.
    super("PuzzleKeptBoards", {
      indexedDB: globalThis.indexedDB,
      IDBKeyRange: globalThis.IDBKeyRange,
    });
    this.version(1).stores({ boards: "&[puzzleId+params]" });
  }
}

/**
 * The boards dealt ahead of the next New game, one for each type of each
 * puzzle the player has opened, kept across visits so that a type whose boards
 * take seconds to find is waited for once and not once a visit.
 *
 * **A kept board is played as its generator wrote it**, with its tier taken on
 * trust and its `aux` handed to Solve, so it is good only for the build that
 * dealt it: another build's solver may grade the board differently. A row from
 * any other build reads as absent, and the next board kept clears them out.
 */
export class KeptBoards {
  private opened: KeptBoardsDatabase | null = null;

  constructor(private readonly build: string) {}

  /** Opened at first use, so importing the store touches no database. */
  private get db(): KeptBoardsDatabase {
    this.opened ??= new KeptBoardsDatabase();
    return this.opened;
  }

  /** The board kept for this type, which is the caller's from here on: it is
   * gone from the store, so no two deals are handed the one board. */
  async take(puzzleId: PuzzleId, params: EncodedParams): Promise<DealtBoard | null> {
    const row = await this.db.transaction("rw", this.db.boards, async () => {
      const found = await this.db.boards.get([puzzleId, params]);
      if (found) await this.db.boards.delete([puzzleId, params]);
      return found;
    });
    if (!row || row.build !== this.build) return null;
    return { params: row.params, desc: row.desc, aux: row.aux };
  }

  async has(puzzleId: PuzzleId, params: EncodedParams): Promise<boolean> {
    const row = await this.db.boards.get([puzzleId, params]);
    return row?.build === this.build;
  }

  async keep(puzzleId: PuzzleId, board: DealtBoard): Promise<void> {
    await this.db.transaction("rw", this.db.boards, async () => {
      await this.db.boards.filter((row) => row.build !== this.build).delete();
      await this.db.boards.put({ ...board, puzzleId, build: this.build });
    });
  }

  /** Test-only: empty the store. */
  async clear(): Promise<void> {
    await this.db.boards.clear();
  }
}

/**
 * A page of the dev server stands for a build of its own: the version string
 * there names the last commit, and a board dealt before an edit to a generator
 * would be played after it.
 */
const BUILD =
  (import.meta.env.PROD && import.meta.env.VITE_APP_VERSION) || crypto.randomUUID();

export const keptBoards = new KeptBoards(BUILD);
