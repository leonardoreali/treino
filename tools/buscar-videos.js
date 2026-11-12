// Busca um short do YouTube para cada exercício da biblioteca e grava js/data/videos.js.
// Uso:  node tools/buscar-videos.js          (só os que faltam)
//       node tools/buscar-videos.js --todos  (refaz todos)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const out = path.join(root, 'js', 'data', 'videos.js');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['exercises.js', 'equip.js', 'gym.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data', f), 'utf8'), ctx);
if (fs.existsSync(out) && !process.argv.includes('--todos')) vm.runInContext(fs.readFileSync(out, 'utf8'), ctx);
const have = ctx.window.VIDEOS || {};
const titles = ctx.window.VIDEO_TITLES || {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1; SOCS=CAI' };

async function find(q) {
  const html = await (await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' #shorts'), { headers: H, signal: AbortSignal.timeout(15000) })).text();
  const ids = [];
  const add = re => { for (const m of html.matchAll(re)) if (!ids.includes(m[1])) ids.push(m[1]); };
  add(/"reelWatchEndpoint":\{"videoId":"([\w-]{11})"/g);
  add(/\/shorts\/([\w-]{11})/g);
  const shorts = ids.length;
  add(/"videoRenderer":\{"videoId":"([\w-]{11})"/g);
  for (const id of ids.slice(0, 8)) {
    const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id), { headers: H, signal: AbortSignal.timeout(15000) });
    if (r.ok) { const j = await r.json(); return { id, title: j.title + ' — ' + j.author_name, short: ids.indexOf(id) < shorts }; }
  }
  return null;
}

let n = 0;
(async () => {
  for (const ex of ctx.window.EXERCISES) {
    if (have[ex.id]) continue;
    try {
      const v = await find(ex.q);
      if (v) { have[ex.id] = v.id; titles[ex.id] = v.title; console.log('ok ', ex.id, v.id, v.short ? '[short]' : '[video]', v.title); }
      else console.log('--- ', ex.id, 'nada encontrado');
    } catch (e) { console.log('ERRO', ex.id, e.message, (e.cause && e.cause.code) || ''); await sleep(5000); }
    await sleep(1200); if (++n % 10 === 0) gravar();
  }
  gravar();
  console.log('Gravado:', Object.keys(have).length, 'vídeos');
})();
function gravar() {
  fs.writeFileSync(out, '/* Gerado por tools/buscar-videos.js — id do vídeo do YouTube por exercício. */\n' +
    'window.VIDEOS = ' + JSON.stringify(have, null, 1) + ';\nwindow.VIDEO_TITLES = ' + JSON.stringify(titles, null, 1) + ';\n');
}
