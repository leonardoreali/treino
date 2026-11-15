/* Rastreio de evolução (sem IA, tudo no aparelho):
   - mede cada exercício a cada treino (força estimada com carga, média de reps/segundos sem carga);
   - classifica: recorde, subindo, estável, estagnado, caindo;
   - promove sozinho para a próxima variação/passo de habilidade quando a pessoa domina o atual;
   - quando estagna 3 treinos, recua a carga 10% (ou muda o ritmo) para retomar o ganho;
   - depois de dias parado, reduz o treino; depois de 30 dias, pede um treino novo. */
(function () {
  const e = U.esc, P = window.PROG = { level: null };
  const BLOCK_DAYS = 30;
  const prog = () => S.state.prog || (S.state.prog = {});
  const r1 = v => Math.round(v * 10) / 10;
  // Arredonda para os pesos que existem na academia: de 2,5 em 2,5 kg a partir de 20 kg, de 1 em 1 kg abaixo disso.
  const kgRound = v => Math.max(0, v >= 20 ? Math.round(v / 2.5) * 2.5 : Math.round(v));

  // ---------- medidas ----------
  const weighted = item => !!(item.kg && item.kg.some(Number));
  // Força estimada (fórmula de Epley) para carga; média por série para peso do corpo e tempo.
  P.score = item => {
    if (item.unit === 'min') return item.sets.reduce((a, b) => a + b, 0);
    if (weighted(item)) return r1(Math.max(...item.sets.map((r, i) => (Number(item.kg[i]) || 0) * (1 + Math.min(r, 15) / 30))));
    return r1(item.sets.reduce((a, b) => a + b, 0) / Math.max(1, item.sets.length));
  };
  P.series = (exId, uptoId) => {
    const all = S.logsFor(exId).filter(h => !uptoId || h.log.id !== uptoId);
    if (!all.length) return [];
    const last = all[all.length - 1].item, mode = h => h.item.unit + (weighted(h.item) ? 'kg' : '');
    return all.filter(h => mode(h) === mode({ item: last })).map(h => ({ date: h.log.date, id: h.log.id, score: P.score(h.item), item: h.item }));
  };
  P.status = s => {
    const n = s.length; if (n < 2) return 'novo';
    const v = s.map(x => x.score), last = v[n - 1], prevMax = Math.max(...v.slice(0, -1));
    if (last > prevMax * 1.001) return 'pr';
    if (n >= 3 && v[n - 1] < v[n - 2] * 0.95 && v[n - 2] < v[n - 3] * 0.95) return 'caindo';
    if (n >= 4 && Math.max(...v.slice(-3)) <= Math.max(...v.slice(0, -3)) * 1.01) return 'estagnado';
    return last >= v[n - 2] ? 'subindo' : 'estavel';
  };
  const BADGE = { pr: ['🏆 Recorde', 'good'], subindo: ['↑ Subindo', 'good'], estavel: ['→ Estável', ''], estagnado: ['⏸ Estagnado', 'warn'], caindo: ['↓ Caindo', 'bad'], novo: ['Novo', ''], recuo: ['↺ Recuo planejado', ''] };
  const statusOf = exId => { const st = P.status(P.series(exId)), pr = prog()[exId]; return pr && pr.cool > 0 && (st === 'caindo' || st === 'estagnado') ? 'recuo' : st; };
  const fmtScore = (s) => !s ? '—' : s.item.unit === 'min' ? s.score + ' min' : weighted(s.item) ? s.score + ' kg (força estimada)' : s.score + (s.item.unit === 's' ? ' s' : ' reps') + ' por série';

  // ---------- tempo parado ----------
  const lastLogDate = () => { const l = S.sortedLogs()[0]; return l ? l.date : null; };
  P.gap = () => { const d = lastLogDate(); return d ? S.daysBetween(d, S.today()) : 0; };
  P.blocked = () => { const d = lastLogDate(), p = S.program(); return !!d && P.gap() >= BLOCK_DAYS && (!p.startDate || p.startDate <= d); };
  P.returnLevel = () => {
    const re = S.state.reentry;
    if (re && re.left > 0) return 'reentry';
    const g = P.gap();
    return g >= 14 ? 'reentry' : g >= 7 ? 'return' : null;
  };

  // ---------- metas: recuo planejado e retorno depois de parar ----------
  const suggest0 = W.suggest;
  W.suggest = (ex, it, gap) => {
    const r = suggest0(ex, it, gap), pr = prog()[ex], clamp = v => Math.max(it.min, Math.min(it.max, v));
    if (pr && pr.reset) {
      r.targets = r.targets.map(() => it.min);
      if (pr.reset.kg) { r.kg = pr.reset.kg; r.hint = 'Estagnado há 3 treinos: recuo planejado para ' + pr.reset.kg + ' kg (−10%) começando do início da faixa. Em poucas semanas você passa a marca antiga.'; }
      else r.hint = 'Estagnado há 3 treinos: hoje, início da faixa com descida lenta (3 s) e pausa de 1 s embaixo. Isso destrava o próximo ganho.';
      r.up = false;
    }
    if (P.level === 'return') { r.targets = r.targets.map(t => clamp(Math.round(t * 0.85))); if (r.kg) r.kg = kgRound(r.kg * 0.9); r.up = false; }
    if (P.level === 'reentry') { r.targets = r.targets.map(() => it.min); if (r.kg) r.kg = kgRound(r.kg * 0.8); r.up = false; }
    return r;
  };

  const build0 = W.build;
  W.build = (type, forced) => {
    P.level = type === 'session' ? P.returnLevel() : null;
    if (P.level === 'reentry' && !(S.state.reentry && S.state.reentry.left > 0)) { S.state.reentry = { left: 2 }; S.save({ noSync: true }); }
    build0(type, forced);
    const c = S.current, lvl = P.level; P.level = null;
    if (!c || !lvl) return;
    c.blocks.forEach(b => { if (b.kind === 'forca') b.items.forEach(it => { if (it.sets > 2) { it.sets--; ['vals', 'done', 'kgs'].forEach(k => { if (it[k]) it[k] = it[k].slice(0, it.sets); }); } }); });
    const g = P.gap();
    c.adaptNotes = [(lvl === 'reentry' ? '<b>Recondicionamento</b> (' + (S.state.reentry.left === 2 ? '1º' : '2º') + ' de 2 treinos): você ficou ' + g + ' dias parado, então hoje é −1 série, início da faixa e cargas −20%. O corpo perde ritmo rápido, mas volta rápido também.'
      : '<b>Retorno</b>: ' + g + ' dias sem treinar. Hoje vem −1 série e metas um pouco menores (cargas −10%).')].concat(c.adaptNotes || []);
    c.returnLevel = lvl;
    S.saveCurrent();
  };

  // ---------- 30 dias parado: precisa de um treino novo ----------
  const blockHtml = () => '<div class="card hl"><div class="eyebrow">' + P.gap() + ' dias sem treinar</div><h2>Hora de um treino novo</h2>' +
    '<p class="muted">Depois de um mês parado, o corpo não está mais no ponto em que este programa parou: continuar dele aumenta o risco de lesão e de frustração. Escolha como recomeçar:</p>' +
    '<button class="choice" data-a="ret-go" data-to="gerar"><span class="em">⚡</span><span><b>Refazer a avaliação e gerar um treino</b><small>Atualize peso e os testes de flexões e barras: o app monta um treino para o seu nível de hoje.</small></span></button>' +
    '<button class="choice" data-a="ret-go" data-to="subir"><span class="em">📄</span><span><b>Subir um treino novo</b><small>PDF, foto da ficha, marcar na lista ou link do professor.</small></span></button>' +
    '<button class="choice" data-a="ret-go" data-to="recomecar"><span class="em">↺</span><span><b>Recomeçar este programa do início</b><small>Volta para a volta 1, com 2 treinos de recondicionamento.</small></span></button></div>';
  A['ret-go'] = d => {
    U.closeModal();
    if (d.to === 'gerar') { location.hash = '#perfil'; setTimeout(() => { const el = U.$('.f-flexoes'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); } U.toast('Atualize seus dados e testes e toque em "Gerar meu treino".'); }, 250); }
    else if (d.to === 'subir') location.hash = '#programa';
    else { const p = S.program(); p.startDate = S.today(); S.setPos(0); S.state.reentry = { left: 2 }; S.save(); APP.render(); U.toast('Programa reiniciado. Os 2 primeiros treinos vêm mais leves.'); }
  };
  const start0 = A.start;
  A.start = d => { if (!S.current && d.type === 'session' && P.blocked()) return U.modal(blockHtml()); start0(d); };

  // ---------- Hoje: aviso de tempo parado + cartão de evolução ----------
  const overview = () => {
    const ids = [...new Set(S.state.logs.flatMap(l => (l.items || []).map(i => i.ex)))];
    const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), st = {};
    let prs = 0;
    ids.forEach(id => {
      const s = P.series(id); st[statusOf(id)] = (st[statusOf(id)] || 0) + 1;
      s.forEach((x, i) => { if (i && x.date >= since && x.score > Math.max(...s.slice(0, i).map(y => y.score)) * 1.001) prs++; });
    });
    return { ids, st, prs };
  };
  // Acrescenta à tela Hoje (definida em js/theme.js) o cartão de evolução e os avisos de tempo parado.
  const hoje0 = V.hoje;
  V.hoje = () => {
    let h = hoje0();
    const g = P.gap(), lvl = P.returnLevel();
    const banner = P.blocked() ? blockHtml() : lvl && !S.current ? '<div class="hint warn">' + (lvl === 'reentry' ? 'Você ficou ' + g + ' dias parado: os próximos ' + ((S.state.reentry && S.state.reentry.left) || 2) + ' treinos vêm mais leves para você retomar sem se machucar.' : 'Faz ' + g + ' dias desde o último treino: o de hoje vem um pouco mais leve.') + '</div>' : '';
    if (banner) { const i = h.indexOf('<div class="hero'); h = i >= 0 ? h.slice(0, i) + banner + h.slice(i) : h.replace('</h1>', '</h1>' + banner); }
    const o = overview();
    if (o.ids.length) {
      const card = '<a class="card lvl-card" href="#evolucao" data-a="evo-tab" data-tab="progresso" style="text-decoration:none;color:inherit"><div class="lvl-badge" style="background:var(--card2)">📈</div><div class="grow"><b>Sua evolução</b><div class="muted small">' +
        [o.prs ? '🏆 ' + o.prs + ' recorde' + (o.prs > 1 ? 's' : '') + ' em 30 dias' : '', (o.st.pr || 0) + (o.st.subindo || 0) ? '↑ ' + ((o.st.pr || 0) + (o.st.subindo || 0)) + ' subindo' : '', o.st.estagnado ? '⏸ ' + o.st.estagnado + ' estagnado' + (o.st.estagnado > 1 ? 's' : '') : '', o.st.caindo ? '↓ ' + o.st.caindo + ' caindo' : ''].filter(Boolean).join(' · ') + '</div></div><span class="muted">›</span></a>';
      const j = h.indexOf('<div class="card lvl-card">'); h = j >= 0 ? h.slice(0, j) + card + h.slice(j) : h + card;
    }
    return h;
  };

  // ---------- fim do treino: o que evoluiu e o que muda ----------
  const save0 = A['w-save'];
  A['w-save'] = (d, el, ev) => {
    const snap = S.current ? JSON.parse(JSON.stringify(S.current)) : null, n = S.state.logs.length;
    save0(d, el, ev);
    if (!snap || S.state.logs.length === n) return;
    const log = S.state.logs[S.state.logs.length - 1];
    if (snap.type !== 'session') return;
    if (S.state.reentry && S.state.reentry.left > 0 && snap.returnLevel === 'reentry') { S.state.reentry.left--; if (!S.state.reentry.left) delete S.state.reentry; }
    const slots = snap.blocks.filter(b => b.kind === 'forca').flatMap(b => b.items), pid = snap.programId, P2 = S.state.programs[pid];
    const prs = [], better = [], promos = [], stalls = []; let repeated = 0;
    (log.items || []).forEach(item => {
      if (item.unit === 'min') return;
      const ex = item.ex, before = P.series(ex, log.id), now = P.score(item), slot = slots.find(s => s.ex === ex), pr = prog()[ex];
      if (pr && pr.reset) delete pr.reset;                       // recuo cumprido
      if (pr && pr.cool > 0) pr.cool--;
      const same = before.filter(x => weighted(x.item) === weighted(item));
      if (same.length) {
        repeated++;
        const best = Math.max(...same.map(x => x.score)), last = same[same.length - 1];
        if (now > best * 1.001) prs.push({ ex, from: best, to: now, item });
        else if (now > last.score) better.push(ex);
      }
      // estagnou: 3 treinos sem recorde
      const st = P.status(P.series(ex));
      if (st === 'estagnado' && !(pr && pr.cool > 0) && !snap.returnLevel && !snap.health) { // treino reduzido por saúde não conta como estagnação
        const top = Math.max(...item.kg || [0]), kg = weighted(item) ? Math.min(kgRound(top * 0.9), top - (top >= 20 ? 2.5 : 1)) : 0;
        prog()[ex] = { reset: kg ? { kg } : { tempo: true }, cool: 3, since: S.today() };
        stalls.push({ ex, kg });
      }
      // domina o exercício: topo da faixa em todas as séries, 2 treinos seguidos → próxima variação
      if (!slot || !P2 || String(slot.key).startsWith('f') || weighted(item)) return;
      const top = it2 => it2.sets.length >= Math.min(slot.sets, 2) && it2.sets.every(v => v >= slot.max);
      const prevSame = before[before.length - 1];
      if (slot.skill) {
        const sk = S.skill(slot.skill), cur = S.skillStep(slot.skill), step = sk && sk.steps[cur];
        if (step && step.ex === ex && cur < sk.steps.length - 1 && S.critProgress(step) >= 2 && !(S.state.swaps[pid] || {})[slot.key]) {
          S.state.skills[slot.skill] = cur + 1; promos.push({ kind: 'skill', skill: slot.skill, prev: cur, from: ex, to: sk.steps[cur + 1].ex });
        }
      } else if (top(item) && prevSame && top(prevSame.item) && NEXT_VARIATION[ex] && !S.ex(NEXT_VARIATION[ex]).sup && !S.missing(NEXT_VARIATION[ex]).length && !slots.some(s2 => s2.ex === NEXT_VARIATION[ex])) {
        const sw = S.state.swaps[pid] = S.state.swaps[pid] || {}, old = sw[slot.key];
        sw[slot.key] = NEXT_VARIATION[ex]; promos.push({ kind: 'swap', pid, key: slot.key, prev: old, from: ex, to: NEXT_VARIATION[ex] });
      }
    });
    log.prs = prs.length; log.t = Date.now();
    S.save();
    P.lastPromos = promos;
    // comparação com a última vez desta mesma sessão
    const prevS = S.sortedLogs().find(l => l.id !== log.id && l.programId === pid && l.sessionIdx === snap.sessionIdx && l.type === 'session');
    const reps = l => (l.items || []).filter(i => i.unit === 'reps').reduce((a, i) => a + i.sets.reduce((x, y) => x + y, 0), 0);
    const ton = l => (l.items || []).reduce((a, i) => a + (i.kg ? i.sets.reduce((x, r, k) => x + r * (Number(i.kg[k]) || 0), 0) : 0), 0);
    const pct = (a, b) => b ? Math.round(100 * (a - b) / b) : null;
    const dr = prevS ? pct(reps(log), reps(prevS)) : null, dt = prevS ? pct(ton(log), ton(prevS)) : null;
    const name = id => '<b>' + e(S.ex(id).name) + '</b>';
    let html = '<div class="card" style="margin-top:4px"><h3 style="margin-top:0">Evolução de hoje</h3>';
    if (prs.length) html += '<div class="hint up">🏆 <b>' + prs.length + ' recorde' + (prs.length > 1 ? 's' : '') + '!</b><ul style="margin:6px 0 0;padding-left:18px">' + prs.map(p => '<li>' + name(p.ex) + ': ' + p.from + ' → <b>' + p.to + '</b>' + (weighted(p.item) ? ' kg de força estimada' : p.item.unit === 's' ? ' s por série' : ' reps por série') + '</li>').join('') + '</ul></div>';
    if (better.length) html += '<p class="small">↑ Melhor que da última vez em ' + better.map(name).join(', ') + '.</p>';
    if (dr != null || dt != null) html += '<p class="small muted">Comparado com o último ' + e(snap.name) + ': ' + [dr != null && reps(log) ? (dr === 0 ? 'mesmo total de repetições' : (dr > 0 ? '+' : '') + dr + '% de repetições') : '', dt ? (dt > 0 ? '+' : '') + dt + '% de carga total (' + Math.round(ton(log)) + ' kg)' : ''].filter(Boolean).join(' · ') + '</p>';
    if (promos.length) html += '<div class="hint up">⬆ <b>Você evoluiu de exercício</b><ul style="margin:6px 0 0;padding-left:18px">' + promos.map((p, i) => '<li>' + name(p.from) + ' → ' + name(p.to) + ' <button class="link" data-a="prog-undo" data-i="' + i + '">desfazer</button></li>').join('') + '</ul><div class="small muted">Dominou o atual (topo da faixa em 2 treinos seguidos ou critério da habilidade). O próximo treino já vem com o novo.</div></div>';
    if (stalls.length) html += '<div class="hint warn">⏸ <b>Estagnou</b> (3 treinos sem recorde)<ul style="margin:6px 0 0;padding-left:18px">' + stalls.map(s => '<li>' + name(s.ex) + ': ' + (s.kg ? 'na próxima vez, recuo para ' + s.kg + ' kg e reconstrução' : 'na próxima vez, descida lenta e pausa para destravar') + '</li>').join('') + '</ul></div>';
    if (!prs.length && !better.length && !promos.length && !stalls.length) html += '<p class="small muted">' + (repeated ? 'Sem recorde hoje: você manteve o nível. Constância também é evolução.' : 'Primeiro registro destes exercícios: a evolução aparece a partir do próximo treino.') + '</p>';
    html += '<a class="small" href="#evolucao" data-a="modal-close-go" data-go="#evolucao">Ver toda a evolução ›</a></div>';
    const box = U.$('#modal .modal-box');
    if (box) {
      if (promos.some(p => p.kind === 'skill')) box.querySelectorAll('.hint.up').forEach(x => { if (/Critério cumprido/.test(x.textContent)) x.remove(); });
      const h2 = box.querySelector('h2'); if (h2) h2.insertAdjacentHTML('afterend', html);
    }
    V.ui.evoTab = 'progresso';
  };
  A['prog-undo'] = (d, el) => {
    const p = (P.lastPromos || [])[+d.i]; if (!p) return;
    if (p.kind === 'skill') S.state.skills[p.skill] = p.prev;
    else { const sw = S.state.swaps[p.pid] || {}; if (p.prev) sw[p.key] = p.prev; else delete sw[p.key]; }
    P.lastPromos[+d.i] = null; S.save(); el.closest('li').innerHTML = 'Desfeito: continua em ' + e(S.ex(p.from).name) + '.';
  };

  // ---------- Evolução → Progresso ----------
  const spark = s => {
    if (s.length < 2) return '';
    const v = s.slice(-12).map(x => x.score), lo = Math.min(...v), hi = Math.max(...v), W2 = 90, H = 28;
    const pts = v.map((y, i) => (i * W2 / (v.length - 1)).toFixed(1) + ',' + (hi === lo ? H / 2 : H - 3 - (y - lo) / (hi - lo) * (H - 6)).toFixed(1)).join(' ');
    return '<svg viewBox="0 0 ' + W2 + ' ' + H + '" width="' + W2 + '" height="' + H + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };
  // Próxima meta: usa a faixa do programa ativo quando o exercício está nele.
  const nextGoal = ex => {
    const p = S.program(); let slot = null;
    p.sessions.forEach((s, si) => s.blocks.forEach((b, bi) => (b.items || []).forEach((it, ii) => { if (!slot && b.kind === 'forca' && !it.text && W.resolve(it, p.id, si + '.' + bi + '.' + ii) === ex) slot = it; })));
    const s = P.series(ex), last = s.length ? s[s.length - 1].item : null;
    if (!slot && !last) return '';
    const it = slot ? { sets: slot.sets, min: slot.min, max: slot.max, unit: slot.unit } : { sets: last.sets.length, min: Math.min(...last.sets), max: Math.max(...last.sets) + 2, unit: last.unit };
    const r = W.suggest(ex, it, 0), u = it.unit === 's' ? ' s' : '';
    if (r.up && NEXT_VARIATION[ex]) return 'Pronto para evoluir: <b>' + e(S.ex(NEXT_VARIATION[ex]).name) + '</b>';
    const t = r.targets, same = t.every(x => x === t[0]);
    return 'Próxima meta: <b>' + (same ? t.length + ' × ' + t[0] + u : t.join(', ') + u) + (r.kg ? ' com ' + r.kg + ' kg' : '') + '</b>' + (slot ? '' : ' <span class="muted">(fora do programa atual)</span>');
  };
  const progressoView = () => {
    const logs = S.sortedLogs(), o = overview();
    if (!o.ids.length) return '<div class="empty">Registre seus treinos: a evolução de cada exercício aparece aqui a partir do segundo treino.</div>';
    // treinos por semana (8 semanas)
    const wk = []; for (let i = 7; i >= 0; i--) { const a = new Date(Date.now() - (i * 7 + 6) * 864e5).toISOString().slice(0, 10), b = new Date(Date.now() - i * 7 * 864e5).toISOString().slice(0, 10); const ss = logs.filter(l => l.date >= a && l.date <= b && l.type === 'session'); wk.push({ full: ss.filter(l => !l.partial).length, part: ss.filter(l => l.partial).length }); }
    const mx = Math.max(3, ...wk.map(w => w.full + w.part));
    // séries por grupo nos últimos 7 dias
    const since7 = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10), grp = {};
    logs.filter(l => l.date >= since7).forEach(l => (l.items || []).forEach(i => { if (i.unit !== 'min') { const c = S.ex(i.ex).cat; grp[c] = (grp[c] || 0) + i.sets.length; } }));
    const gmx = Math.max(10, ...Object.values(grp));
    const ids = o.ids.slice().sort((a, b) => { const la = P.series(a), lb = P.series(b); return (lb.length ? lb[lb.length - 1].date : '') < (la.length ? la[la.length - 1].date : '') ? -1 : 1; });
    return '<div class="stats"><div><b>' + o.prs + '</b><span>recordes em 30 dias</span></div><div><b>' + ((o.st.pr || 0) + (o.st.subindo || 0)) + '</b><span>exercícios subindo</span></div><div><b>' + ((o.st.estagnado || 0) + (o.st.caindo || 0)) + '</b><span>precisam de atenção</span></div></div>' +
      '<div class="card"><b>Treinos por semana</b><div class="bars" role="img" aria-label="Treinos por semana nas últimas 8 semanas: ' + wk.map(w => w.full + (w.part ? ' + ' + w.part + ' parcial' : '')).join(', ') + '">' + wk.map((w, i) => '<div title="' + w.full + ' completo(s), ' + w.part + ' parcial(is)"><i class="part" style="height:' + Math.round(100 * w.part / mx) + '%"></i><i style="height:' + Math.round(100 * w.full / mx) + '%"></i><span>' + (i === 7 ? 'esta' : '-' + (7 - i)) + '</span></div>').join('') + '</div><div class="legend small"><span><i style="background:var(--accent)"></i>completos</span><span><i style="background:color-mix(in srgb, var(--accent) 35%, var(--card2))"></i>parciais</span></div></div>' +
      (Object.keys(grp).length ? '<div class="card"><b>Séries por grupo nos últimos 7 dias</b><p class="muted small">Referência comum para ganhar músculo: 10 a 20 séries por grupo por semana.</p>' + Object.entries(grp).sort((a, b) => b[1] - a[1]).map(([c, n]) => '<div class="grp"><span>' + e(CATEGORIES[c] || 'Outros') + '</span><div class="bar"><i style="width:' + Math.round(100 * n / gmx) + '%"></i></div><b>' + n + '</b></div>').join('') + '</div>' : '') +
      '<h3>Exercícios</h3>' + ids.map(id => {
        const s = P.series(id), st = statusOf(id), b = BADGE[st], best = s.length ? s.reduce((a, x) => x.score > a.score ? x : a) : null;
        return '<div class="card prog-ex"><div class="row between"><span class="ex-name" data-a="exercise" data-ex="' + e(id) + '">' + e(S.ex(id).name) + '</span><span class="tag ' + b[1] + '">' + b[0] + '</span></div>' +
          '<div class="row between" style="margin-top:6px"><div class="small"><div class="muted">Melhor: ' + fmtScore(best) + '</div><div>' + nextGoal(id) + '</div><div class="muted">' + s.length + ' treino' + (s.length > 1 ? 's' : '') + (s.length ? ' · último ' + U.fmtDate(s[s.length - 1].date) : '') + '</div></div>' + spark(s) + '</div></div>';
      }).join('');
  };
  V.ui.evoTab = 'progresso';
  const evo0 = V.evolucao;
  V.evolucao = () => {
    const btn = on => '<button data-a="evo-tab" data-tab="progresso" class="' + (on ? 'on' : '') + '">Progresso</button>';
    if (V.ui.evoTab !== 'progresso') return evo0().replace('<div class="tabs">', '<div class="tabs">' + btn(false));
    const h = evo0().replace('<div class="tabs">', '<div class="tabs">' + btn(true)); // reaproveita o título e as abas
    const top = h.slice(0, h.indexOf('</div>', h.indexOf('<div class="tabs">')) + 6);
    return top + progressoView();
  };
})();
