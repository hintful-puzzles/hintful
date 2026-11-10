/// <reference lib="webworker" />
import type { WorkboxPlugin } from "workbox-core";
import { cacheNames } from "workbox-core";
import {
  addPlugins,
  cleanupOutdatedCaches,
  getCacheKeyForURL,
  precacheAndRoute,
} from "workbox-precaching";
import {
  type InstallPlan,
  InstallProgress,
  planInstall,
} from "./utils/precache-plan.ts";

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
// the files whose URL or revision changed. Workbox runs every manifest entry
// through the plugin below, a cache hit included, so `InstallProgress` skips
// what the plan did not ask for rather than counting it as downloaded.
//

async function loadSizes(): Promise<Map<string, number> | null> {
  try {
    const response = await fetch(
      new URL("precache-size.json", self.registration.scope),
      {
        cache: "no-cache",
      },
    );
    if (!response.ok) return null;
    const { sizes } = (await response.json()) as { sizes: Record<string, number> };
    return new Map(
      Object.entries(sizes).map(([url, size]) => [
        new URL(url, self.registration.scope).href,
        size,
      ]),
    );
  } catch {
    return null; // progress falls back to a file count
  }
}

function absoluteUrl(url: string) {
  return new URL(url, self.registration.scope).href;
}

let progress: InstallProgress | null = null;
let planned: Promise<void> = Promise.resolve();

// Registered before precacheAndRoute's own install listener, so it reads the
// cache before that listener has stored anything into it. Were a file stored
// first, it would be treated as already cached: left out of the figure, which
// is then a little short, never wrong about what the player must wait for.
self.addEventListener("install", (event) => {
  planned = (async () => {
    const cache = await caches.open(cacheNames.precache);
    const cached = new Set((await cache.keys()).map((request) => request.url));
    const sizes = await loadSizes();
    const plan: InstallPlan = planInstall({
      urls: manifest.map((entry) =>
        absoluteUrl(typeof entry === "string" ? entry : entry.url),
      ),
      sizes,
      isCached: (url) => {
        const key = getCacheKeyForURL(url);
        return key !== undefined && cached.has(new URL(key, self.location.href).href);
      },
    });
    progress = new InstallProgress(plan);
    await sendMessageToClients(
      { type: "PRECACHE_START", total: plan.pending.size, totalBytes: plan.totalBytes },
      event,
    );
  })();
  event.waitUntil(planned);
});

// Custom plugin to track file precaching progress.
// handlerDidComplete runs when the caching handler for a request is completed.
const progressPlugin: WorkboxPlugin = {
  handlerDidComplete: async ({ event, request, error }) => {
    if (event.type !== "install") return;
    await planned;
    const url = new URL(request.url);
    url.search = "";
    const message = progress?.finish(url.href);
    if (!message) return;

    await sendMessageToClients(
      { type: "PRECACHE_PROGRESS", url: request.url, ...message, success: !error },
      event,
    );
    if (progress?.complete) {
      await sendMessageToClients({ type: "PRECACHE_COMPLETE" }, event);
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
