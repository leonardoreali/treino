/* Tipos de plano (fila, dias fixos, livre/ABC, contínuo) e o modo "marcar na lista" para fichas de academia. */
(function () {
  const e = U.esc;
  const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MODES = { fila: 'Fila: continua de onde parei (A → B → C → A…)', dias: 'Dias fixos da semana', livre: 'Livre: escolho o treino na hora (A, B, C…)' };

  // ---------- regras de cada tipo ----------
  S.mode = () => S.program().mode || 'fila';
  U.autoDays = n => ({ 1: [[1]], 2: [[1], [4]], 3: [[1], [3], [5]], 4: [[1], [2], [4], [5]], 5: [[1], [2], [3], [4], [5]], 6: [[1], [2], [3], [4], [5], [6]] }[n] || Array.from({ length: n }, (_, i) => [(i + 1) % 7]));
  S.lastDone = si => { const p = S.program(); const l = S.sortedLogs().find(x => x.programId === p.id && x.type === 'session' && x.sessionIdx === si); return l ? l.date : ''; };
  // Sessão de hoje: índice, ou -1 quando é dia de descanso (dias fixos).
  S.todayIdx = () => {
    const p = S.program(), n = p.sessions.length, m = S.mode();
    if (m === 'fila') return S.pos() % n;
    if (m === 'dias') { const wd = new Date().getDay(), today = S.today(); return p.sessions.findIndex((s, i) => (s.days || []).includes(wd) && S.lastDone(i) !== today); }
    let best = 0; for (let i = 1; i < n; i++) if (S.lastDone(i) < S.lastDone(best)) best = i; // livre: sugere o que está há mais tempo sem fazer
    return best;
  };
  S.sessionIdx = () => Math.max(0, S.todayIdx());
  S.finished = () => !S.program().endless && S.pos() >= S.program().rounds * S.program().sessions.length;
  S.nextDay = () => { const p = S.program(), wd = new Date().getDay(); for (let k = 1; k <= 7; k++) { const d = (wd + k) % 7, i = p.sessions.findIndex(s => (s.days || []).includes(d)); if (i >= 0) return { day: WD[d], name: p.sessions[i].name, k }; } return null; };

  // ---------- cartão em Programa ----------
  V.planCard = () => {
    const p = S.program(), m = S.mode();
    return '<div class="card"><h2>Como seguir este programa</h2><label>Organização <select id="pl-mode">' + Object.entries(MODES).map(o => '<option value="' + o[0] + '"' + (m === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      (m === 'dias' ? '<p class="muted small">Toque nos dias de cada treino:</p>' + p.sessions.map((s, si) => '<div style="margin-top:8px"><b class="small">' + e(s.name) + '</b><div class="chips">' + WD.map((d, di) => '<button data-a="pl-day" data-s="' + si + '" data-d="' + di + '" class="' + ((s.days || []).includes(di) ? 'on' : '') + '">' + d + '</button>').join('') + '</div></div>').join('') : '') +
      (m === 'livre' ? '<p class="muted small">Na tela Hoje aparecem todos os treinos; você escolhe qual fazer. O app sugere o que está há mais tempo parado.</p>' : '') +
      '<label class="chk"><input type="checkbox" id="pl-endless"' + (p.endless ? ' checked' : '') + '><span>Programa contínuo, sem data para acabar</span></label></div>';
  };
  document.addEventListener('change', ev => {
    const t = ev.target, p = S.program();
    if (t.id === 'pl-mode') { p.mode = t.value; if (p.mode === 'dias' && !p.sessions.some(s => (s.days || []).length)) U.autoDays(p.sessions.length).forEach((d, i) => { p.sessions[i].days = d; }); S.save(); APP.render(); }
    if (t.id === 'pl-endless') { p.endless = t.checked; S.save(); }
  });
  A['pl-day'] = d => { const s = S.program().sessions[+d.s], x = +d.d; s.days = (s.days || []).includes(x) ? s.days.filter(v => v !== x) : (s.days || []).concat(x).sort(); S.save(); APP.render(); };

  // O editor não conhece "mode": aplica depois de salvar (usado pelo modo ficha).
  const edSave = A['ed-save'];
  A['ed-save'] = () => {
    const d = V.ui.draft, mode = d && d.mode, before = new Set(Object.keys(S.state.programs));
    edSave();
    if (!mode) return;
    const id = Object.keys(S.state.programs).find(k => !before.has(k));
    if (id) { S.state.programs[id].mode = mode; S.state.programs[id].endless = true; S.save(); APP.render(); }
  };

  // ================= FICHA DE ACADEMIA: MARCAR NA LISTA =================
  V.ficha = () => '<a href="#programa" class="muted small">← Programa</a><h1>Montar pela ficha</h1>' +
    '<p class="muted">Para fichas de academia (cartão impresso com números à mão). Marque os exercícios da sua ficha e diga em qual treino cada grupo entra. Leva um minuto.</p>' +
    '<div class="card"><b>Séries × repetições padrão</b><div class="row"><input id="fx-sets" type="number" inputmode="numeric" min="1" value="4" style="width:70px" aria-label="Séries padrão"> × <input id="fx-reps" inputmode="numeric" value="15" style="width:90px" aria-label="Repetições padrão"></div>' +
    '<p class="muted small">Vale para o que você marcar. Para um exercício diferente, escreva nos campos ao lado dele (ex.: 3 × 10-12).</p></div>' +
    SHEET.map((g, gi) => '<div class="card fx-sec"><div class="row between"><h2>' + e(g.name) + '</h2><label class="inline">Treino <select class="fx-letter" aria-label="Treino do grupo ' + e(g.name) + '">' + ['—', 'A', 'B', 'C', 'D', 'E', 'F'].map(l => '<option>' + l + '</option>').join('') + '</select></label></div>' +
      g.ids.map(id => '<div class="chk"><input type="checkbox" class="fx-ex" value="' + e(id) + '" id="fx-' + gi + '-' + e(id) + '"><label class="grow" for="fx-' + gi + '-' + e(id) + '" style="margin:0;font-size:1rem;color:var(--text)">' + e(S.ex(id).name) + '</label>' +
        '<input class="fx-s" type="number" inputmode="numeric" min="1" placeholder="sér." style="width:56px;padding:8px 4px;text-align:center" aria-label="Séries"><input class="fx-r" inputmode="numeric" placeholder="reps" style="width:66px;padding:8px 4px;text-align:center" aria-label="Repetições"></div>').join('') + '</div>').join('') +
    '<div class="row end"><button class="btn big" data-a="fx-go">Montar treino</button></div>';
  A['fx-go'] = () => {
    const ds = Math.max(1, +U.$('#fx-sets').value || 3), dr = U.$('#fx-reps').value.trim() || '12', by = {};
    const reps = t => { const m = String(t).match(/(\d+)\D+(\d+)/) || String(t).match(/(\d+)/); return m ? { min: +m[1], max: +(m[2] || m[1]) } : { min: 12, max: 12 }; };
    document.querySelectorAll('.fx-sec').forEach(sec => {
      const rows = [...sec.querySelectorAll('.chk')].filter(r => U.$('.fx-ex', r).checked); if (!rows.length) return;
      let L = U.$('.fx-letter', sec).value; if (L === '—') L = 'A';
      rows.forEach(r => {
        const id = U.$('.fx-ex', r).value, ex = S.ex(id), timed = /^prancha/.test(id), cardio = ex.cat === 'cardio';
        const rr = reps(U.$('.fx-r', r).value.trim() || (cardio ? '20' : timed ? '30' : dr));
        (by[L] = by[L] || []).push({ name: ex.name, sets: cardio ? 1 : +U.$('.fx-s', r).value || ds, min: rr.min, max: Math.max(rr.min, rr.max), unit: cardio ? 'min' : timed ? 's' : 'reps' });
      });
    });
    const letters = Object.keys(by).sort(); if (!letters.length) return U.toast('Marque pelo menos um exercício.');
    V.ui.draft = { name: 'Minha ficha', rounds: 12, flex: false, mode: letters.length > 1 ? 'livre' : 'fila', sessions: letters.map(L => ({ name: 'Treino ' + L, items: by[L] })) };
    location.hash = '#programa'; U.toast('Confira e toque em Salvar programa.');
  };
})();
