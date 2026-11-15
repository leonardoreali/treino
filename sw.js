/* Service worker: o app abre sem internet e só troca de versão quando a pessoa aceita.
   Ao publicar mudanças, aumente VERSION: a versão nova é baixada inteira em segundo plano e fica esperando;
   o app mostra "Nova versão disponível" e só troca quando a pessoa toca em Atualizar (nunca no meio de um treino). */
const VERSION = 'treino-v17';
const RUNTIME = 'treino-bibliotecas';
const SHELL = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/data/exercises.js',
  'js/data/videos.js',
  'js/data/equip.js',
  'js/data/gym.js',
  'js/data/more.js',
  'js/data/program.js',
  'js/data/more2.js',
  'js/data/meta.js',
  'js/store.js',
  'js/ui.js',
  'js/i18n/en.js',
  'js/i18n/es.js',
  'js/i18n.js',
  'js/workout.js',
  'js/music.js',
  'js/pdfimport.js',
  'js/ocr.js',
  'js/views.js',
  'js/generator.js',
  'js/share.js',
  'js/people.js',
  'js/theme.js',
  'js/diet.js',
  'js/plans.js',
  'js/adapt.js',
  'js/progress.js',
  'js/health.js',
  'js/install.js',
  'js/app.js',
];

self.addEventListener('install', e => {
  // cache: 'reload' evita pegar arquivos antigos do cache do navegador; se faltar internet, a instalação falha e a versão atual continua.
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== RUNTIME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') { e.respondWith(caches.match('index.html').then(r => r || fetch(req))); return; }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  // leitores de PDF e de imagem (baixados na primeira vez que são usados): guardados para funcionar sem internet
  if (url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(RUNTIME).then(c => c.match(req).then(r => r || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
  }
});
