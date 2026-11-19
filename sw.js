/* Atout hors ligne : les fichiers de l'appli sont gardés sur l'appareil.
   Réseau d'abord (les mises à jour arrivent), copie locale ensuite.
   Le lecteur de PDF (PDF.js, cdnjs) est aussi gardé après sa première utilisation. */
const CACHE = 'atout-cache-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  /* Supprime les copies des versions précédentes (dont jokers-xp-cache) */
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url, same = new URL(url).origin === self.location.origin, pdf = url.startsWith(PDFJS);
  if (!same && !pdf) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (same ? caches.match('./index.html') : undefined)))
  );
});
