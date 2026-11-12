/* Lê um PDF de treino e extrai sessões + exercícios (séries × reps).
   É uma leitura por padrões: o resultado sempre passa pelo editor para revisão. */
(function () {
  const P = window.PDFIMPORT = {};
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const SETS = /(\d+)\s*[×xX]\s*(\d+)(?:\s*[–\-—]\s*(\d+))?\s*(min\b|s\b|seg\b)?/;
  const HEAD = /^(?:treino\s+([a-z0-9]+)\b|sess[aã]o\s+(\d+)\s*[—–\-:]|dia\s+(\d+)\b)/i;

  function load() {
    if (window.pdfjsLib) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = CDN + 'pdf.min.js';
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.worker.min.js'; ok(); };
      s.onerror = () => fail(new Error('não consegui baixar o leitor de PDF'));
      document.head.appendChild(s);
    });
  }

  // Agrupa os pedaços de texto de uma página em linhas; cada linha vira células separadas por espaços grandes.
  function toLines(items, page) {
    const frags = items.filter(i => i.str.trim()).map(i => ({ s: i.str, x: i.transform[4], y: i.transform[5] - page * 5000, w: i.width, h: Math.abs(i.transform[3]) || i.height || 10 }));
    frags.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const f of frags) {
      const l = lines.find(l => Math.abs(l.y - f.y) < 2.5);
      if (l) l.f.push(f); else lines.push({ y: f.y, f: [f] });
    }
    for (const l of lines) {
      l.f.sort((a, b) => a.x - b.x); l.h = Math.max(...l.f.map(f => f.h)); l.cells = [];
      for (const f of l.f) {
        const c = l.cells[l.cells.length - 1];
        if (c && f.x - c.x2 < 14) { c.s += (f.x - c.x2 > 1.5 ? ' ' : '') + f.s; c.x2 = f.x + f.w; }
        else l.cells.push({ s: f.s, x: f.x, x2: f.x + f.w, y: l.y });
      }
      l.text = l.cells.map(c => c.s).join('  ').trim();
    }
    return lines;
  }
  const parseSets = m => { const u = (m[4] || '').toLowerCase(); return { sets: +m[1], min: +m[2], max: +(m[3] || m[2]), unit: u === 'min' ? 'min' : u ? 's' : 'reps' }; };
  const clean = s => s.replace(/\s+/g, ' ').replace(/^[\s·•\-–—:.,\d)]+/, '').replace(/[\s:,.;(]+$/, '').trim();

  P.parse = async function (file) {
    await load();
    const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) pages.push(toLines((await (await pdf.getPage(n)).getTextContent()).items, n));
    // remove cabeçalhos/rodapés repetidos em todas as páginas
    const count = {};
    pages.forEach(ls => new Set(ls.map(l => l.text)).forEach(t => { count[t] = (count[t] || 0) + 1; }));
    const junk = t => /^page \d+ of \d+$/i.test(t) || /^p[aá]gina \d+/i.test(t) || (pages.length > 2 && count[t] >= pages.length - 1);
    const all = pages.flatMap(ls => ls.filter(l => !junk(l.text)));
    const hs = all.map(l => l.h).sort((a, b) => a - b), body = hs[Math.floor(hs.length / 2)] || 10;
    const isSection = l => l.h > body * 1.12 && l.cells.length <= 2 && !SETS.test(l.text);
    const title = all.length ? all.reduce((a, b) => b.h > a.h ? b : a).text : file.name.replace(/\.pdf$/i, '');
    const full = all.map(l => l.text).join('\n');
    const rm = full.match(/(\d+)\s+(?:voltas|semanas|ciclos)/i);

    const sessions = [];
    let cur = null;
    const flush = () => { if (cur && cur.items.length) sessions.push(cur); cur = null; };
    let i = 0;
    while (i < all.length) {
      const l = all[i], hm = l.cells.length <= 2 && l.text.match(HEAD);
      if (hm && !SETS.test(l.text)) {
        flush();
        const num = l.text.match(/sess[aã]o\s+(\d+)/i);
        cur = { name: clean(l.text.replace(/\((?:sess[aã]o|~)[^)]*\)/i, '').replace(/\(~?\d+\s*min\)/i, '')) || l.text, order: num ? +num[1] : 999, items: [] };
        i++; continue;
      }
      if (!cur || isSection(l)) { flush(); i++; continue; }
      // bloco contínuo até o próximo título
      const blk = [];
      while (i < all.length && !isSection(all[i]) && !(all[i].cells.length <= 2 && HEAD.test(all[i].text) && !SETS.test(all[i].text))) blk.push(all[i++]);
      // 1) tabelas: célula só com "4 × 6–10" → nome = textos da 1ª coluna mais próximos na vertical
      const setCells = [], nameCells = [];
      const left = Math.min(...blk.flatMap(b => b.cells.map(c => c.x)));
      for (const b of blk) for (const c of b.cells) {
        const m = c.s.match(SETS);
        if (m && c.x > left + 40 && c.s.replace(SETS, '').replace(/cada|perna|lado|s[ée]ries|reps|×/gi, '').trim().length < 4) setCells.push({ c, m, names: [], notes: [] });
      }
      const tableRows = new Set();
      if (setCells.length >= 2) {
        const setX = Math.min(...setCells.map(s => s.c.x));
        for (const b of blk) for (const c of b.cells) {
          if (setCells.some(s => s.c === c) || /^(exerc[ií]cio|s[ée]ries|reps|observa[cç][aã]o|perna|lado)/i.test(c.s.trim())) continue;
          let best = null, bd = 1e9;
          for (const s of setCells) { const d = Math.abs(s.c.y - c.y); if (d < bd) { bd = d; best = s; } }
          if (!best || bd > 21) continue;
          if (c.x2 <= setX + 2) { best.names.push(c); tableRows.add(b); } else if (c.x > setX + 20) best.notes.push(c);
        }
        for (const s of setCells) {
          if (!s.names.length) continue;
          s.names.sort((a, b) => b.y - a.y);
          const side = blk.some(b => Math.abs(b.y - s.c.y) < 16 && b.cells.some(c => Math.abs(c.x - s.c.x) < 60 && /cada|perna|lado/i.test(c.s)));
          cur.items.push(Object.assign({ name: clean(s.names.map(c => c.s).join(' ')), side, note: s.notes.sort((a, b) => b.y - a.y).map(c => c.s).join(' ').trim() || undefined, _y: s.c.y }, parseSets(s.m)));
        }
      }
      // 2) texto corrido: "hollow body 3 × 30 s, prancha lateral 3 × 30 s cada lado"
      for (const b of blk) {
        if (tableRows.has(b) || setCells.some(s => b.cells.includes(s.c))) continue;
        const re = /([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-,()]*?)\s*(:)?\s*(\d+\s*[×xX]\s*\d+(?:\s*[–\-—]\s*\d+)?\s*(?:min\b|s\b|seg\b)?)(\s*cada\s+(?:lado|perna))?/g;
        let m;
        while ((m = re.exec(b.text))) {
          const name = clean(m[2] ? m[1].split(/[;.]/).pop() : m[1].split(/[,;.]| e /).pop());
          if (name.length < 3 || name.length > 60) continue;
          cur.items.push(Object.assign({ name: name[0].toUpperCase() + name.slice(1), side: !!m[4] }, parseSets(m[3].match(SETS))));
        }
      }
    }
    flush();
    sessions.sort((a, b) => a.order - b.order);
    // junta títulos repetidos da mesma sessão e tira duplicados
    const out = [];
    for (const s of sessions) {
      const prev = out.find(o => o.order === s.order && s.order !== 999);
      if (prev) prev.items.push(...s.items); else out.push(s);
    }
    out.forEach(s => { s.items = s.items.filter((it, n, arr) => it.name && arr.findIndex(o => o.name === it.name && o.sets === it.sets && o.min === it.min) === n).map(it => { delete it._y; return it; }); delete s.order; });
    return Object.assign({ name: clean(title) || 'Meu treino', rounds: rm ? +rm[1] : 12, flex: true, sessions: out, useData: true }, extras(all, full, isSection));
  };

  // Dados pessoais do PDF: data de início, tabela "Teste / Hoje / Meta" e tabela de registro de treinos.
  function extras(all, full, isSection) {
    const sd = full.match(/a partir de\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i), p2 = s => String(s).padStart(2, '0');
    const year = sd ? sd[3] : String(new Date().getFullYear());
    const nearest = (list, y, max) => { let b = null, bd = max; for (const a of list) { const d = Math.abs(a.y - y); if (d <= bd) { bd = d; b = a; } } return b; };
    const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 2).join('-');

    const tests = [];
    const hi = all.findIndex(l => l.cells.some(c => /^hoje$/i.test(c.s.trim())) && l.cells.some(c => /^meta/i.test(c.s.trim())));
    if (hi >= 0) {
      const hx = all[hi].cells.find(c => /^hoje$/i.test(c.s.trim())).x, mx = all[hi].cells.find(c => /^meta/i.test(c.s.trim())).x;
      const region = [];
      for (let i = hi + 1; i < all.length && !isSection(all[i]); i++) {
        if (all[i].cells.some(c => c.x < hx - 5 && c.x2 > hx + 10)) break; // parágrafo: a tabela acabou
        region.push(...all[i].cells);
      }
      const col = c => c.x < hx - 5 ? 'n' : c.x < mx - 5 ? 't' : 'g', anchors = [];
      for (const c of region.filter(c => col(c) === 't')) { const a = anchors[anchors.length - 1]; if (a && Math.abs(a.y - c.y) < 16) a.t += ' ' + c.s; else anchors.push({ y: c.y, t: c.s, n: [], g: [] }); }
      for (const c of region) { const k = col(c); if (k === 't') continue; const a = nearest(anchors, c.y, 21); if (a) a[k].push(c.s); }
      for (const a of anchors) {
        const name = a.n.join(' ').trim(), t = a.t.trim(), cint = /cintura/i.test(name); if (!name) continue;
        let baseline = null, unit = cint ? 'cm' : 'reps';
        if (/^\d/.test(t) && !/\d\/\d/.test(t)) {
          const mm = t.match(/(\d+)\s*min/), ss = t.match(/(\d+)\s*s\b/);
          if (mm || ss) { baseline = (mm ? +mm[1] * 60 : 0) + (ss ? +ss[1] : 0); unit = 's'; } else baseline = parseFloat(t.replace(',', '.'));
        }
        if (baseline == null && !cint) continue;
        tests.push({ id: slug(name), name, unit, baseline, goal: a.g.join(' ').trim(), lowerIsBetter: cint || undefined });
      }
    }

    const logs = [];
    let li = -1;
    all.forEach((l, i) => { if (/^data\b/i.test(l.text) && /treino/i.test(l.text)) li = i; });
    if (li >= 0) {
      const left = all[li].cells[0].x, region = [], DATE = /^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?(?:\s+(\S{1,3}))?$/;
      for (let i = li + 1; i < all.length && !isSection(all[i]); i++) {
        const c0 = all[i].cells[0];
        if (all[i].cells.length === 1 && Math.abs(c0.x - left) < 8 && !DATE.test(c0.s.trim()) && c0.s.length > 40) break;
        region.push(...all[i].cells);
      }
      const anchors = [];
      for (const c of region) { const m = c.s.trim().match(DATE); if (m) anchors.push({ y: c.y, x: c.x, date: year + '-' + p2(m[2]) + '-' + p2(m[1]), tag: m[3] || '', txt: [] }); }
      for (const c of region) {
        const s = c.s.trim(); if (DATE.test(s)) continue;
        const a = nearest(anchors, c.y, 80); if (!a) continue;
        if (s.length <= 3 && !a.tag && Math.abs(a.y - c.y) < 21) a.tag = s; else if (/[A-Za-zÀ-ÿ]/.test(s) && s.length > 3) a.txt.push(s);
      }
      for (const a of anchors) {
        const items = [];
        for (const ch of a.txt.join(' ').split('·')) {
          const m = ch.trim().match(/^(.+?)\s+(\d+\s*[×xX]\s*\d+|\d+(?:\s*,\s*\d+)*)\s*(s|min)?(?![A-Za-z])/);
          if (!m) continue;
          const nx = m[2].match(/(\d+)\s*[×xX]\s*(\d+)/);
          items.push({ name: clean(m[1]), unit: m[3] || 'reps', sets: nx ? Array(+nx[1]).fill(+nx[2]) : m[2].split(',').map(Number) });
        }
        if (items.length) logs.push({ date: a.date, tag: a.tag, items });
      }
    }
    return { startDate: sd ? sd[3] + '-' + p2(sd[2]) + '-' + p2(sd[1]) : null, tests, logs };
  }
})();
