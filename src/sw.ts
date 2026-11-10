/// <reference lib="webworker" />
import type { WorkboxPlugin } from "workbox-core";
import { cacheNames } from "workbox-core";
import {
  addPlugins,
  cleanupOutdatedCaches,
  getCacheKeyForURL,
  precacheAndRoute,
} from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST;

//
// Message handlers
//

self.addEventListener("message", (event) => {
  switch (event.data?.type) {
    case "SKIP_WAITING":
      event.waitUntil(self.skipWaiting());
      break;
  }
});

async function sendMessageToClients(message: unknown, event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });
      for (const client of clients) {
        client.postMessage(message);
      }
    })(),
  );
}

//
// Installation progress reporting
//

// Progress is in bytes (`vite-plugins/precache-size.ts` writes each file's
// size) over the files this install has to fetch. On an update that is only
// the files whose URL or revision changed. Workbox still runs every entry
// through the plugin below, a cache hit included, so the others are skipped
// there rather than counted as downloaded.
const sizeByUrl = new Map<string, number>();
const pendingUrls = new Set<string>();

// A missing file (skew between deploys, a failed fetch) weights every file
// equally, which makes the figure a file count rather than wrong.
async function loadSizes() {
  let sizes: Record<string, number> = {};
  try {
    const response = await fetch(
      new URL("precache-size.json", self.registration.scope),
      {
        cache: "no-cache",
      },
    );
    if (response.ok)
      sizes = ((await response.json()) as { sizes: Record<string, number> }).sizes;
  } catch {
    // keep the equal weights
  }
  sizeByUrl.clear();
  for (const entry of manifest) {
    const url = typeof entry === "string" ? entry : entry.url;
    sizeByUrl.set(new URL(url, self.registration.scope).href, sizes[url] ?? 1);
  }
}

let pendingFiles = 0;
let pendingBytes = 0;
let doneFiles = 0;
let doneBytes = 0;

// Registered before precacheAndRoute's own install listener, so it reads the
// cache before that listener's fetches have stored anything into it.
let planned: Promise<void> = Promise.resolve();

self.addEventListener("install", (event) => {
  planned = (async () => {
    const cache = await caches.open(cacheNames.precache);
    const cached = new Set((await cache.keys()).map((request) => request.url));
    await loadSizes();
    pendingUrls.clear();
    pendingFiles = 0;
    pendingBytes = 0;
    doneFiles = 0;
    doneBytes = 0;
    for (const url of sizeByUrl.keys()) {
      const key = getCacheKeyForURL(url);
      if (key && cached.has(new URL(key, self.location.href).href)) continue;
      pendingUrls.add(url);
      pendingFiles++;
      pendingBytes += sizeByUrl.get(url) ?? 0;
    }
    await sendMessageToClients(
      { type: "PRECACHE_START", totalBytes: pendingBytes, total: pendingFiles },
      event,
    );
  })();
  event.waitUntil(planned);
});

// Custom plugin to track file precaching progress.
// handlerDidComplete runs when the caching handler for a request is completed.
const progressPlugin: WorkboxPlugin = {
  handlerDidComplete: async ({ event, request, error }) => {
    if (event.type === "install") {
      await planned;
      const url = new URL(request.url);
      url.search = "";
      if (!pendingUrls.has(url.href)) return; // already cached: nothing fetched
      doneFiles++;
      doneBytes += sizeByUrl.get(url.href) ?? 0;

      await sendMessageToClients(
        {
          type: "PRECACHE_PROGRESS",
          url: request.url,
          count: doneFiles,
          total: pendingFiles,
          bytes: doneBytes,
          totalBytes: pendingBytes,
          success: !error,
        },
        event,
      );

      if (doneFiles >= pendingFiles) {
        await sendMessageToClients({ type: "PRECACHE_COMPLETE" }, event);
      }
    }
  },
};

//
// Caching
//

cleanupOutdatedCaches();
addPlugins([progressPlugin]);
precacheAndRoute(manifest, {
  // All URL parameters are handled locally:
  ignoreURLParametersMatching: [/.*/],
});
