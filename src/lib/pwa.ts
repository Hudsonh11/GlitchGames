// Guarded service worker registration.
// Never registers in dev, inside an iframe, or on Lovable preview hosts —
// a stale service worker there would serve outdated HTML/assets.

const SW_URL = '/sw.js';
const LEGACY_CACHE = 'glitch-shell-v1';

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (host.startsWith('id-preview--') || host.startsWith('preview--')) return true;
  if (host === 'lovableproject.com' || host.endsWith('.lovableproject.com')) return true;
  if (host === 'lovableproject-dev.com' || host.endsWith('.lovableproject-dev.com')) return true;
  if (host === 'beta.lovable.dev' || host.endsWith('.beta.lovable.dev')) return true;

  if (new URLSearchParams(window.location.search).has('sw')) {
    if (new URLSearchParams(window.location.search).get('sw') === 'off') return true;
  }

  return false;
}

async function unregisterAppWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => {
        const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '';
        return url.endsWith(SW_URL);
      })
      .map((r) => r.unregister()),
  );
}

export async function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  if (isBlockedContext()) {
    await unregisterAppWorkers().catch(() => {});
    return;
  }

  try {
    // Drop the cache created by the previous hand-written worker.
    await caches.delete(LEGACY_CACHE).catch(() => {});

    // Reload once when a new service worker takes control, so every device
    // picks up the latest deploy without clearing browser history.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    const reg = await navigator.serviceWorker.register(SW_URL, {
      scope: '/',
      updateViaCache: 'none', // never serve a cached sw.js
    });

    // Check for a new version on load, when the tab regains focus,
    // and every 30 minutes while the app stays open.
    const checkForUpdate = () => reg.update().catch(() => {});
    checkForUpdate();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    window.setInterval(checkForUpdate, 30 * 60 * 1000);
  } catch {
    // Non-fatal: the site works fine without offline support.
  }
}
