import Dexie, { type Table } from "dexie";
import type { DealtBoard, EncodedParams, PuzzleId } from "../engine/types.ts";

interface KeptBoardRecord extends DealtBoard {
  /** Counts up, so the lowest of a type's rows is the board kept longest. */
  id?: number;
  puzzleId: PuzzleId;
  /** The build that dealt the board. */
  build: string;
  /** How long the generator took to find it, in milliseconds. */
  dealMs: number;
}

/**
 * Its own database, apart from `PuzzleAppData`: nothing here is the player's.
 * Every row can be dealt again, so it can be dropped whole, and adding it
 * changed no schema that holds a saved game.
 */
class KeptBoardsDatabase extends Dexie {
  kept!: Table<KeptBoardRecord, number>;

  constructor() {
    // Dexie reads the IndexedDB globals once, as its module loads. The puzzle
    // runtime imports this store, so in a test worker that module may load
    // before the file that installs a fake IndexedDB: name them at open.
    super("PuzzleKeptBoards", {
      indexedDB: globalThis.indexedDB,
      IDBKeyRange: globalThis.IDBKeyRange,
    });
    // Version 1 held one row a type in `boards`, keyed by the type. Dexie
    // cannot change a table's primary key, so the rows live in a table of
    // their own and the old one is dropped with what it held.
    this.version(2).stores({ boards: null, kept: "++id, [puzzleId+params]" });
  }
}

/**
 * The boards dealt ahead of the next New game, for each type of each puzzle
 * the player has opened, kept across visits so that a type whose boards take
 * seconds to find is waited for once and not once a visit. How many a type
 * keeps is the caller's to decide (`DealAhead`).
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

  /** A type's rows, the one kept longest first: the index orders equal keys
   * by the primary key. */
  private rows(puzzleId: PuzzleId, params: EncodedParams) {
    return this.db.kept.where("[puzzleId+params]").equals([puzzleId, params]);
  }

  /** The board kept longest for this type, which is the caller's from here
   * on: it is gone from the store, so no two deals are handed the one board. */
  async take(puzzleId: PuzzleId, params: EncodedParams): Promise<DealtBoard | null> {
    const row = await this.db.transaction("rw", this.db.kept, async () => {
      await this.rows(puzzleId, params)
        .filter((kept) => kept.build !== this.build)
        .delete();
      const found = await this.rows(puzzleId, params).first();
      if (found?.id !== undefined) await this.db.kept.delete(found.id);
      return found;
    });
    return row ? { params: row.params, desc: row.desc, aux: row.aux } : null;
  }

  /** How long each board kept for this type took to deal, so one figure for
   * each board kept. */
  async dealTimes(puzzleId: PuzzleId, params: EncodedParams): Promise<number[]> {
    const rows = await this.rows(puzzleId, params).toArray();
    return rows.filter((row) => row.build === this.build).map((row) => row.dealMs);
  }

  async keep(puzzleId: PuzzleId, board: DealtBoard, dealMs: number): Promise<void> {
    await this.db.transaction("rw", this.db.kept, async () => {
      await this.db.kept.filter((row) => row.build !== this.build).delete();
      await this.db.kept.add({ ...board, puzzleId, build: this.build, dealMs });
    });
  }

  /** Test-only: empty the store. */
  async clear(): Promise<void> {
    await this.db.kept.clear();
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
