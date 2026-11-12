/**
 * What an offline install will fetch and how far along it is: the pure part of
 * the service worker's progress reporting, kept out of `src/sw.ts` so it can be
 * tested without a worker.
 *
 * It knows nothing about which files exist. The manifest and the sizes arrive
 * as data from the build, so nothing here changes when the codebase does.
 */

export interface InstallPlan {
  /** Absolute URL (no query) of each file this install has to fetch. */
  pending: ReadonlySet<string>;
  /**
   * Gzipped bytes of the pending files, or 0 when no size is known (the
   * progress is then by file count).
   */
  totalBytes: number;
  /** Gzipped bytes by absolute URL; empty when none are known. */
  sizes: ReadonlyMap<string, number>;
}

export interface PlanInput {
  /** Every precached file, as absolute URLs. */
  urls: readonly string[];
  /**
   * Gzipped size by absolute URL, or null when `precache-size.json` could not
   * be read. A URL it does not list weighs nothing: the build does not see
   * every manifest entry (the web manifest is added after its sizes are taken),
   * and a file from another deploy is simply left out of the figure.
   */
  sizes: ReadonlyMap<string, number> | null;
  /** Whether the precache already holds this URL's current revision. */
  isCached: (url: string) => boolean;
}

export function planInstall({ urls, sizes, isCached }: PlanInput): InstallPlan {
  const known = sizes ?? new Map<string, number>();
  const pending = new Set(urls.filter((url) => !isCached(url)));
  let totalBytes = 0;
  for (const url of pending) totalBytes += known.get(url) ?? 0;
  return { pending, totalBytes, sizes: known };
}

export interface ProgressMessage {
  /** Files fetched so far, of `total`. */
  count: number;
  total: number;
  /** Bytes fetched so far, of `totalBytes`; both 0 when sizes are unusable. */
  bytes: number;
  totalBytes: number;
}

/** Records files as they finish; a file the plan did not ask for is ignored. */
export class InstallProgress {
  private done = new Set<string>();
  private bytes = 0;

  constructor(private readonly plan: InstallPlan) {}

  /** The progress after `url` finished, or null if it is not part of the plan. */
  finish(url: string): ProgressMessage | null {
    if (!this.plan.pending.has(url)) return null;
    if (!this.done.has(url)) {
      this.done.add(url);
      this.bytes += this.plan.sizes.get(url) ?? 0;
    }
    return {
      count: this.done.size,
      total: this.plan.pending.size,
      bytes: this.bytes,
      totalBytes: this.plan.totalBytes,
    };
  }

  /** Where the install stands now, for a page that joined partway through. */
  snapshot(): ProgressMessage {
    return {
      count: this.done.size,
      total: this.plan.pending.size,
      bytes: this.bytes,
      totalBytes: this.plan.totalBytes,
    };
  }

  get complete(): boolean {
    return this.done.size >= this.plan.pending.size;
  }
}

/**
 * What the worker tells pages about an install: `PRECACHE_START` when it
 * begins, `PRECACHE_PROGRESS` as each file lands, and the same progress shape
 * in answer to a `PRECACHE_QUERY`, which a page sends when it finds a worker
 * already installing. The worker announces once, so a page that opens (a game,
 * say) after the start has only a query to learn the total from.
 */
export type PrecacheMessage =
  | ({
      type: "PRECACHE_START" | "PRECACHE_PROGRESS";
      /** The version of the build the installing worker carries. */
      version: string | null;
    } & ProgressMessage)
  | { type: "PRECACHE_COMPLETE" };

/** What a page knows of the download, built up from the worker's messages. */
export interface DownloadState {
  progress: number | null;
  bytes: { done: number; total: number } | null;
  pendingVersion: string | null;
  /** Bytes the download that just finished fetched. */
  downloadedBytes: number | null;
}

export const NO_DOWNLOAD: DownloadState = {
  progress: null,
  bytes: null,
  pendingVersion: null,
  downloadedBytes: null,
};

/**
 * The state after a message. Every progress message carries the total, so any
 * one is enough to show "x% of y MB", whether or not the start was seen. The
 * pending version outlives the download so "update downloaded" can name it.
 */
export function applyPrecacheMessage(
  state: DownloadState,
  message: PrecacheMessage,
): DownloadState {
  if (message.type === "PRECACHE_COMPLETE") {
    return {
      ...state,
      progress: null,
      bytes: null,
      downloadedBytes: state.bytes?.total ?? null,
    };
  }
  // Without sizes the percent is by file count and no byte figure is known.
  const sized = message.totalBytes > 0;
  return {
    progress: message.total > 0 ? percentOf(message) : null,
    bytes: sized ? { done: message.bytes, total: message.totalBytes } : null,
    pendingVersion: message.version,
    downloadedBytes: null,
  };
}

/** The whole-number percent a message stands for, never past 100. */
export function percentOf({
  count,
  total,
  bytes,
  totalBytes,
}: ProgressMessage): number {
  const fraction = totalBytes > 0 ? bytes / totalBytes : total > 0 ? count / total : 0;
  return Math.min(100, Math.round(fraction * 100));
}
