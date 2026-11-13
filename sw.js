/* Service worker: deixa o app abrir sem internet. Mude VERSION ao publicar mudanças grandes. */
const VERSION = 'treino-v7';
const SHELL = ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/data/exercises.js', 'js/data/videos.js', 'js/data/program.js', 'js/data/equip.js', 'js/data/gym.js', 'js/music.js', 'js/generator.js', 'js/share.js', 'js/people.js', 'js/ocr.js', 'js/theme.js', 'js/diet.js', 'js/plans.js', 'js/store.js', 'js/ui.js', 'js/workout.js', 'js/pdfimport.js', 'js/views.js', 'js/app.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isPdfLib = url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net'; // leitores de PDF e de imagem
  if (e.request.method !== 'GET' || (url.origin !== location.origin && !isPdfLib)) return;
  // rede primeiro (para pegar atualizações), cache quando estiver offline
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
