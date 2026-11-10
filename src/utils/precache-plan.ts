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

  get complete(): boolean {
    return this.done.size >= this.plan.pending.size;
  }
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
