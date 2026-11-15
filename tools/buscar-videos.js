// Escolhe um vídeo que ENSINA cada exercício e grava js/data/videos.js.
// Busca no YouTube em inglês ("<termo> tutorial") e em português ("<nome> como fazer"), lê título, duração e
// formato dos resultados e dá nota: tutorial / passo a passo / técnica / erros comuns sobem; compilação, desafio,
// "fails" e vídeos muito longos descem. Fica o de maior nota.
// Uso:  node tools/buscar-videos.js           (só os que faltam)
//       node tools/buscar-videos.js --todos   (refaz todos)
//       node tools/buscar-videos.js id1 id2   (refaz só esses)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), out = path.join(root, 'js', 'data', 'videos.js');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['exercises.js', 'equip.js', 'gym.js', 'more.js', 'program.js', 'more2.js', 'meta.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data', f), 'utf8'), ctx);
const args = process.argv.slice(2), all = args.includes('--todos'), only = args.filter(a => !a.startsWith('--'));
if (fs.existsSync(out)) vm.runInContext(fs.readFileSync(out, 'utf8'), ctx);
const have = (all ? {} : ctx.window.VIDEOS) || {}, titles = (all ? {} : ctx.window.VIDEO_TITLES) || {}, wide = (all ? {} : ctx.window.VIDEO_WIDE) || {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8', cookie: 'CONSENT=YES+1; SOCS=CAI' };

// Lê os resultados da página de busca (ytInitialData): vídeos comuns e shorts, com título e duração.
async function search(q) {
  const html = await (await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), { headers: H, signal: AbortSignal.timeout(20000) })).text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s); if (!m) return [];
  let data; try { data = JSON.parse(m[1]); } catch (e) { return []; }
  const res = [];
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (o.videoRenderer && o.videoRenderer.videoId) {
      const v = o.videoRenderer, len = v.lengthText && v.lengthText.simpleText || '';
      const sec = len.split(':').reduce((a, x) => a * 60 + (+x || 0), 0);
      res.push({ id: v.videoId, title: (v.title && v.title.runs || []).map(r => r.text).join(''), ch: v.ownerText && v.ownerText.runs && v.ownerText.runs[0].text || '', sec, short: false });
    } else if (o.reelItemRenderer && o.reelItemRenderer.videoId) {
      const v = o.reelItemRenderer; res.push({ id: v.videoId, title: v.headline && v.headline.simpleText || '', ch: '', sec: 50, short: true });
    } else if (o.shortsLockupViewModel) {
      const v = o.shortsLockupViewModel, id = v.onTap && v.onTap.innertubeCommand && v.onTap.innertubeCommand.reelWatchEndpoint && v.onTap.innertubeCommand.reelWatchEndpoint.videoId;
      if (id) res.push({ id, title: v.overlayMetadata && v.overlayMetadata.primaryText && v.overlayMetadata.primaryText.content || '', ch: '', sec: 50, short: true });
    }
    for (const k in o) walk(o[k]);
  })(data);
  return res;
}
const GOOD = /tutorial|how to|how-to|como fazer|aprenda|learn|passo a passo|step by step|step-by-step|guide|guia|ensin/i;
const OK = /t[ée]cnica|technique|\bform\b|execu[cç][aã]o|correct|corret|mistake|erro|tips|dicas|progress|beginner|iniciante|drill|explain|explica|para iniciantes|breakdown|cue/i;
const BAD = /compila|compilation|fails?\b|challenge|desafio|\bvs\.?\b|reaction|rea[cç][aã]o|funny|meme|prank|insane|crazy|epic|motiva|edit\b|transformation|transforma[cç][aã]o|world record|recorde mundial|asmr|bordado|embroider|croch|costura|sewing|[óo]rtese|orthosis|artesanato|diy\b/i;
function score(v, ex) {
  let s = 0; const t = v.title || '';
  if (GOOD.test(t)) s += 5; if (OK.test(t)) s += 2; if (BAD.test(t)) s -= 10;
  const words = (ex.q + ' ' + ex.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(w => w.length > 3 && !/tutorial|form|beginner|como|fazer|progression/.test(w));
  const tl = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hit = words.filter(w => tl.includes(w)).length; s += Math.min(3, hit * 1.5); if (!hit) s -= 4; // título precisa falar do exercício
  if (!v.short) { if (v.sec >= 40 && v.sec <= 12 * 60) s += 2; else if (v.sec > 20 * 60) s -= 3; }
  if (/[ãõçáéíóú]|\bcomo\b|\bpara\b/i.test(t)) s += 1;
  // aparelho ou variação que o exercício não tem (abdominal no chão x na polia; cotovelada x cotovelada giratória)
  const nm = (ex.name + ' ' + ex.q).toLowerCase();
  if (!ex.gym && /polia|cable|m[áa]quina|machine|smith/i.test(t) && !/polia|cable|m[áa]quina|machine|smith/.test(nm)) s -= 6;
  if (/gir[a-z]*t[óo]ri|spinning/i.test(t) && !/girat|spinning/.test(nm)) s -= 6; // conteúdo em português ajuda o público principal
  return s;
}
async function best(ex) {
  const cands = [];
  const custom = (ctx.window.VIDEO_QUERY || {})[ex.id];
  for (const q of custom ? [custom] : [ex.q.replace(/\b(form|tutorial)\b/gi, '').trim() + ' tutorial', ex.name + ' como fazer']) {
    try { (await search(q)).slice(0, 12).forEach(v => { if (!cands.some(c => c.id === v.id)) cands.push(v); }); } catch (e) { console.log('  busca falhou:', q, e.message); }
    await sleep(900);
  }
  cands.forEach(v => { v.score = score(v, ex); });
  cands.sort((a, b) => b.score - a.score);
  return cands[0] && cands[0].score > 0 ? cands[0] : null;
}
let n = 0;
(async () => {
  for (const ex of ctx.window.EXERCISES) {
    if (only.length ? !only.includes(ex.id) : (have[ex.id] && !all)) continue;
    const v = await best(ex);
    if (v) { have[ex.id] = v.id; titles[ex.id] = v.title + (v.ch ? ' — ' + v.ch : ''); if (v.short) delete wide[ex.id]; else wide[ex.id] = 1; console.log('ok ', ex.id, v.id, v.short ? '[short]' : '[vídeo ' + Math.round(v.sec / 60) + 'min]', 'nota ' + v.score, v.title); }
    else console.log('--- ', ex.id, 'nenhum vídeo instrutivo encontrado (mantido o anterior, se houver)');
    if (++n % 10 === 0) gravar();
  }
  gravar(); console.log('Gravado:', Object.keys(have).length, 'vídeos');
})();
function gravar() {
  fs.writeFileSync(out, '/* Gerado por tools/buscar-videos.js — vídeo (que ensina) de cada exercício no YouTube. */\n' +
    'window.VIDEOS = ' + JSON.stringify(have, null, 1) + ';\nwindow.VIDEO_TITLES = ' + JSON.stringify(titles, null, 1) + ';\nwindow.VIDEO_WIDE = ' + JSON.stringify(wide) + ';\n');
}
