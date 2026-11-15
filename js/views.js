/* Telas: Hoje, Habilidades, Evolução, Biblioteca, Programa (com editor/importação) e Ajustes. */
(function () {
  const V = window.V = {}, after = V.after = {};
  const e = U.esc;
  const ui = V.ui = { evoTab: 'historico', chartEx: null, chartTest: null, libCat: '', libQ: '', libLvl: 0, libPat: '', libReg: '', libMod: '', libSup: false, draft: null };


  // ================= HOJE =================
  // A tela Hoje fica em js/theme.js (V.hoje). Aqui só ficam as ações usadas por ela.
  A.start = d => { if (!S.current) W.build(d.type, d.si != null && d.si !== '' ? +d.si : undefined); U.wake(true); location.hash = '#treino'; };

  // ================= HABILIDADES =================
  V.habilidades = () => {
    let h = '<h1>Habilidades</h1><p class="muted">Avance quando cumprir o critério com boa forma em dois treinos seguidos. Os passos atuais entram sozinhos nos treinos.</p>';
    for (const sk of SKILLS) {
      const cur = S.skillStep(sk.id), prog = S.critProgress(sk.steps[cur]);
      h += '<div class="card skill"><div class="row between"><h2>' + sk.icon + ' ' + e(sk.name) + '</h2><span class="muted small">' + (cur + 1) + '/' + sk.steps.length + '</span></div>' +
        '<div class="muted small">Prazo típico: ' + e(sk.prazo) + '</div>' + (sk.note ? '<div class="note">' + e(sk.note) + '</div>' : '') + '<ol class="steps">';
      sk.steps.forEach((st, i) => {
        const ex = S.ex(st.ex), state = i < cur ? 'done' : i === cur ? 'cur' : 'lock';
        h += '<li class="' + state + '"><span class="dot">' + (i < cur ? '✓' : i + 1) + '</span><div class="grow"><span class="ex-name" data-a="exercise" data-ex="' + e(st.ex) + '">' + e(st.label || ex.name) + '</span>' +
          '<div class="muted small">Critério: ' + st.crit.sets + ' × ' + st.crit.val + U.unit(st.crit.unit) + (i === cur ? ' · ' + prog + '/2 treinos seguidos' : '') + '</div></div>' +
          '<button class="ghost" data-a="video" data-ex="' + e(st.ex) + '">▶</button></li>';
      });
      h += '</ol>' + (prog >= 2 && cur < sk.steps.length - 1 ? '<div class="hint up">Critério cumprido — pode avançar!</div>' : '') +
        '<div class="row">' + (cur > 0 ? '<button class="btn ghosty small" data-a="skill-set" data-id="' + sk.id + '" data-v="' + (cur - 1) + '">← Voltar um passo</button>' : '') +
        (cur < sk.steps.length - 1 ? '<button class="btn small' + (prog >= 2 ? '' : ' ghosty') + '" data-a="skill-set" data-id="' + sk.id + '" data-v="' + (cur + 1) + '">Avançar passo →</button>' : '') + '</div>' +
        (sk.id === 'acrobacia' ? '<label class="chk"><input type="checkbox" id="phase2"' + (S.state.phase2 ? ' checked' : '') + '><span>Fase 2 ativa: incluir o bloco de acrobacias no começo da sessão de habilidades</span></label>' : '') + '</div>';
    }
    return h;
  };
  A['skill-set'] = d => { S.state.skills[d.id] = +d.v; S.save(); APP.render(); };
  document.addEventListener('change', ev => { if (ev.target.id === 'phase2') { S.state.phase2 = ev.target.checked; S.save(); } });

  // ================= EVOLUÇÃO =================
  V.evolucao = () => {
    const tabs = [['historico', 'Histórico'], ['graficos', 'Gráficos'], ['testes', 'Testes e medidas']];
    let h = '<h1>Evolução</h1><div class="tabs">' + tabs.map(t => '<button data-a="evo-tab" data-tab="' + t[0] + '" class="' + (ui.evoTab === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div>';
    const logs = S.sortedLogs();
    if (ui.evoTab === 'historico') {
      const days = new Set(logs.map(l => l.date)), cells = [];
      for (let i = 34; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5), iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); cells.push('<i class="' + (days.has(iso) ? 'on' : '') + '" title="' + U.fmtDate(iso) + '"></i>'); }
      h += '<div class="card"><div class="muted small">Últimos 35 dias</div><div class="heat">' + cells.join('') + '</div></div>';
      h += logs.length ? logs.map(l => '<details class="card log"><summary><b>' + U.fmtDate(l.date) + '</b> · ' + e(l.sessionName || '') + (l.rpe ? ' <span class="tag">esforço ' + l.rpe + '</span>' : '') + (l.type === 'flex' ? ' <span class="tag">dia leve</span>' : '') + (l.partial ? ' <span class="tag warn">parcial ' + l.pct + '%</span>' : l.type === 'session' ? ' <span class="tag good">completo</span>' : '') + '</summary>' +
        '<ul class="plain">' + (l.items || []).map(i => '<li><span data-a="exercise" data-ex="' + e(i.ex) + '" class="ex-name">' + e(S.ex(i.ex).name) + '</span>: ' + i.sets.join(', ') + U.unit(i.unit) + (i.kg && i.kg.some(Number) ? ' @ ' + [...new Set(i.kg)].join('/') + ' kg' : '') + '</li>').join('') +
        (l.interval ? '<li>Intervalado: ' + e(l.interval) + '</li>' : '') + '</ul>' + (l.notes ? '<p class="muted">' + e(l.notes) + '</p>' : '') +
        '<div class="muted small">' + (l.round ? 'Volta ' + l.round : '') + (l.minutes ? ' · ' + l.minutes + ' min' : '') + '</div><button class="link danger" data-a="log-del" data-id="' + l.id + '">Apagar registro</button></details>').join('')
        : '<div class="empty">Nenhum treino registrado ainda.</div>';
    } else if (ui.evoTab === 'graficos') {
      const ids = [...new Set(logs.flatMap(l => (l.items || []).map(i => i.ex)))].sort((a, b) => S.ex(a).name.localeCompare(S.ex(b).name));
      if (!ids.includes(ui.chartEx)) ui.chartEx = ids[0] || null;
      if (!ids.length) h += '<div class="empty">Registre treinos para ver os gráficos.</div>';
      else {
        const ms = V.metricsFor(ui.chartEx); if (!ms.find(m => m.id === ui.chartMetric)) ui.chartMetric = ms[0].id;
        const m = ms.find(x => x.id === ui.chartMetric), data = V.chartData(ui.chartEx, m);
        h += '<div class="card"><label>Exercício <select id="chart-ex">' + ids.map(id => '<option value="' + e(id) + '"' + (id === ui.chartEx ? ' selected' : '') + '>' + e(S.ex(id).name) + '</option>').join('') + '</select></label>' +
          '<div class="chips" role="group" aria-label="O que mostrar">' + ms.map(x => '<button data-a="chart-m" data-m="' + x.id + '" class="' + (x.id === m.id ? 'on' : '') + '" aria-pressed="' + (x.id === m.id) + '">' + x.label + '</button>').join('') + '</div>' +
          '<div class="chips" role="group" aria-label="Período">' + [['30', '30 dias'], ['90', '3 meses'], ['365', '1 ano'], ['all', 'Tudo']].map(x => '<button data-a="chart-p" data-p="' + x[0] + '" class="' + ((ui.chartPeriod || 'all') === x[0] ? 'on' : '') + '" aria-pressed="' + ((ui.chartPeriod || 'all') === x[0]) + '">' + x[1] + '</button>').join('') + '</div>' +
          '<p class="small" style="margin:8px 0 0"><b>' + m.label + (m.unit ? ' (' + m.unit + ')' : '') + ':</b> <span class="muted">' + m.desc + '</span></p>' +
          '<canvas id="chart" class="chart" role="img" aria-label="' + e(V.chartSummary(m, data)) + '"></canvas><div id="chart-info" class="small">' + e(V.chartSummary(m, data)) + '</div>' +
          (data.length ? '<details><summary class="small muted">Ver os valores (' + data.length + ')</summary><table class="tbl"><tr><th>Data</th><th>' + m.label + '</th><th>Séries</th></tr>' + data.slice().reverse().map(d => '<tr><td>' + d.date.split('-').reverse().join('/') + '</td><td><b>' + d.y + '</b></td><td class="small muted">' + d.sets.join(', ') + U.unit(d.unit) + (d.kg ? ' @ ' + d.kg + ' kg' : '') + '</td></tr>').join('') + '</table></details>' : '') + '</div>';
      }
    } else {
      const p = S.program(), tests = V.tests();
      if (!tests.find(t => t.id === ui.chartTest)) ui.chartTest = tests[0] ? tests[0].id : null;
      h += '<div class="card"><h3>Novo registro</h3><div class="row wrap"><label>Teste <select id="m-test">' + tests.map(t => '<option value="' + t.id + '"' + (t.id === ui.chartTest ? ' selected' : '') + '>' + e(t.name) + ' (' + t.unit + ')</option>').join('') + '</select></label>' +
        '<label>Valor <input id="m-val" type="number" inputmode="decimal" step="0.1" min="0"></label><label>Data <input id="m-date" type="date" value="' + S.today() + '"></label><button class="btn" data-a="m-add">Salvar</button></div>' +
        '<p class="muted small">Retestes nas voltas ' + (p.deloadRounds || []).join(', ') + '. Cintura: uma vez por semana, de manhã.</p></div>';
      h += '<div class="card"><table class="tbl"><tr><th>Teste</th><th>Início</th><th>Atual</th><th>Meta</th></tr>' + tests.map(t => {
        const ms = S.state.measures.filter(m => m.test === t.id).sort((a, b) => a.date < b.date ? -1 : 1), last = ms[ms.length - 1], base = t.baseline != null ? t.baseline : (ms[0] ? ms[0].value : null);
        const diff = last && base != null ? last.value - base : null, good = diff != null && (t.lowerIsBetter ? diff < 0 : diff > 0);
        return '<tr data-a="m-pick" data-id="' + t.id + '" class="' + (t.id === ui.chartTest ? 'sel' : '') + '"><td>' + e(t.name) + '</td><td>' + (base != null ? base + U.unit(t.unit) : '—') + '</td><td>' + (last ? '<b>' + last.value + '</b>' + (diff ? ' <span class="' + (good ? 'good' : 'bad') + '">' + (diff > 0 ? '+' : '') + Math.round(diff * 10) / 10 + '</span>' : '') : '—') + '</td><td class="muted small">' + e(t.goal || '') + '</td></tr>';
      }).join('') + '</table><canvas id="chart" class="chart"></canvas>' +
        '<ul class="plain small">' + S.state.measures.filter(m => m.test === ui.chartTest).sort((a, b) => a.date < b.date ? 1 : -1).map(m => '<li>' + U.fmtDate(m.date) + ': <b>' + m.value + '</b> <button class="link danger" data-a="m-del" data-id="' + m.id + '">apagar</button></li>').join('') + '</ul></div>';
    }
    return h;
  };
  V.tests = () => { const t = (S.program().tests || []).slice(); if (!t.some(x => x.id === 'peso')) t.push({ id: 'peso', name: 'Peso', unit: 'kg', baseline: null, goal: '' }); return t; };
  after.evolucao = () => {
    const cv = U.$('#chart'); if (!cv) return;
    const css = getComputedStyle(document.documentElement);
    if (ui.evoTab === 'graficos') {
      const m = V.metricsFor(ui.chartEx).find(x => x.id === ui.chartMetric), data = V.chartData(ui.chartEx, m);
      U.chart(cv, [{ color: css.getPropertyValue('--accent'), points: data.map(d => ({ x: U.fmtDate(d.date), t: new Date(d.date + 'T12:00').getTime(), y: d.y })) }], { zero: m.zero });
    } else if (ui.evoTab === 'testes') {
      const t = V.tests().find(x => x.id === ui.chartTest); if (!t) return;
      const ms = S.state.measures.filter(m => m.test === t.id).sort((a, b) => a.date < b.date ? -1 : 1);
      const pts = (t.baseline != null ? [{ x: 'início', y: t.baseline }] : []).concat(ms.map(m => ({ x: U.fmtDate(m.date), y: m.value })));
      U.chart(cv, [{ color: css.getPropertyValue('--accent'), points: pts }]);
    }
  };
  // Métricas por tipo de exercício. Cada uma mede uma coisa diferente: o texto explica qual.
  const r1 = v => Math.round(v * 10) / 10;
  V.metricsFor = ex => {
    const hs = S.logsFor(ex), last = hs.length ? hs[hs.length - 1].item : { unit: 'reps' };
    if (last.unit === 'min') return [{ id: 'min', label: 'Minutos', unit: 'min', zero: true, desc: 'quanto tempo de cardio em cada treino.', f: i => i.sets.reduce((a, b) => a + b, 0) }];
    if (hs.some(h => h.item.kg && h.item.kg.some(Number))) return [
      { id: 'maxkg', label: 'Carga máxima', unit: 'kg', desc: 'o maior peso usado no treino, em qualquer série.', f: i => i.kg && i.kg.some(Number) ? Math.max(...i.kg.map(Number)) : null },
      { id: 'e1rm', label: 'Força estimada', unit: 'kg', desc: 'quanto você levantaria uma única vez, calculado pelo peso e pelas repetições (fórmula de Epley). Sobe com mais peso ou mais repetições.', f: i => i.kg && i.kg.some(Number) ? r1(Math.max(...i.sets.map((r, k) => (Number(i.kg[k]) || 0) * (1 + Math.min(r, 15) / 30)))) : null },
      { id: 'vol', label: 'Volume', unit: 'kg', zero: true, desc: 'soma de peso × repetições de todas as séries: o trabalho total do treino.', f: i => i.kg ? Math.round(i.sets.reduce((a, r, k) => a + r * (Number(i.kg[k]) || 0), 0)) : null },
      { id: 'reps', label: 'Repetições', unit: 'reps', zero: true, desc: 'total de repetições somando todas as séries, sem considerar o peso.', f: i => i.sets.reduce((a, b) => a + b, 0) }];
    const u = last.unit === 's' ? 's' : 'reps';
    return [
      { id: 'best', label: 'Melhor série', unit: u, desc: 'a melhor série do treino' + (u === 's' ? ' (o maior tempo segurando).' : ' (o máximo de repetições numa série).'), f: i => Math.max(...i.sets) },
      { id: 'avg', label: 'Média por série', unit: u, desc: 'média das séries do treino. Não muda quando o número de séries muda (como na volta leve).', f: i => r1(i.sets.reduce((a, b) => a + b, 0) / i.sets.length) },
      { id: 'total', label: u === 's' ? 'Tempo total' : 'Repetições totais', unit: u, zero: true, desc: 'soma de todas as séries do treino.', f: i => i.sets.reduce((a, b) => a + b, 0) }];
  };
  V.chartData = (ex, m) => {
    const p = ui.chartPeriod || 'all', since = p === 'all' ? '' : new Date(Date.now() - (+p) * 864e5).toISOString().slice(0, 10);
    return S.logsFor(ex).filter(h => h.log.date >= since && h.item.unit === (m.id === 'min' ? 'min' : h.item.unit)).map(h => ({ date: h.log.date, y: m.f(h.item), sets: h.item.sets, unit: h.item.unit, kg: h.item.kg && h.item.kg.some(Number) ? Math.max(...h.item.kg.map(Number)) : null })).filter(d => d.y != null);
  };
  V.chartSummary = (m, data) => {
    if (!data.length) return 'Sem registros nesse período.';
    const f = data[0], l = data[data.length - 1], best = data.reduce((a, d) => d.y > a.y ? d : a), u = m.unit ? ' ' + m.unit : '';
    return data.length + ' treino(s) de ' + f.date.split('-').reverse().join('/') + ' a ' + l.date.split('-').reverse().join('/') + '. ' + (data.length > 1 ? 'Primeiro: ' + f.y + u + '; último: ' + l.y + u + ' (' + (l.y - f.y >= 0 ? '+' : '') + r1(l.y - f.y) + u + '). ' : '') + 'Melhor: ' + best.y + u + ' em ' + best.date.split('-').reverse().join('/') + '.';
  };
  A['chart-m'] = d => { ui.chartMetric = d.m; APP.render(); };
  A['chart-p'] = d => { ui.chartPeriod = d.p; APP.render(); };
  A['evo-tab'] = d => { ui.evoTab = d.tab; if (location.hash !== '#evolucao') location.hash = '#evolucao'; else APP.render(); };
  A['log-del'] = d => { if (confirm('Apagar este registro? Não dá para desfazer.')) { S.removeLog(d.id); APP.render(); } };
  A['m-pick'] = d => { ui.chartTest = d.id; APP.render(); };
  A['m-add'] = () => {
    const v = Number(U.$('#m-val').value); if (!v) return U.toast('Digite o valor.');
    ui.chartTest = U.$('#m-test').value;
    S.state.measures.push({ id: S.uid(), t: Date.now(), test: ui.chartTest, value: v, date: U.$('#m-date').value || S.today() });
    S.save(); APP.render(); U.toast('Registrado!');
  };
  A['m-del'] = d => { if (confirm('Apagar esta medida?')) { S.removeMeasure(d.id); APP.render(); } };
  document.addEventListener('change', ev => {
    if (ev.target.id === 'chart-ex') { ui.chartEx = ev.target.value; APP.render(); }
    if (ev.target.id === 'm-test') { ui.chartTest = ev.target.value; }
  });

  // ================= BIBLIOTECA =================
  function libFiltered() {
    const q = ui.libQ.trim().toLowerCase();
    return S.allExercises().filter(x => (!ui.libCat || x.cat === ui.libCat) && (!ui.libLvl || x.level === ui.libLvl) && (!ui.libPat || x.pat === ui.libPat) && (!ui.libReg || x.reg === ui.libReg) && (!ui.libMod || x.mod === ui.libMod) && (!ui.libSup || !x.sup) && (!ui.libOwn || !S.missing(x.id).length) && (!q || x.name.toLowerCase().includes(q)))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }
  function libList() {
    const list = libFiltered();
    const EMO = { empurrar: '💪', puxar: '🧗', pernas: '🦵', core: '🎯', habilidade: '🤸', cardio: '🏃', flexibilidade: '🧘', mobilidade: '🔄', acrobacia: '🌀', luta: '🥊' };
    return list.length ? list.map(x => '<button class="tile" data-a="exercise" data-ex="' + e(x.id) + '"><span class="tile-img">' + (EMO[x.cat] || '🏋️') + (U.thumb(x.id) ? '<img alt="" loading="lazy" src="' + U.thumb(x.id) + '" onerror="this.remove()">' : '') +
      '<span class="tag lvl' + x.level + '">' + LEVELS[x.level] + '</span>' + (x.sup ? '<span class="tag sup" title="Exige supervisão">⚠️</span>' : '') + '</span><span class="tile-body"><b>' + e(x.name) + '</b><small>' + e(x.pat && window.PATTERNS ? PATTERNS[x.pat] : x.reg && window.REGIONS ? CATEGORIES[x.cat] + ' · ' + REGIONS[x.reg] : CATEGORIES[x.cat] || 'Outros') + (x.w ? ' · com carga' : '') + (x.sup ? ' · exige supervisão' : '') + '</small></span></button>').join('') : '<div class="empty">Nada encontrado.</div>';
  }
  const cnt = n => ' <span class="cnt">' + n + '</span>';
  V.biblioteca = () => { const all = S.allExercises(), inCat = all.filter(x => !ui.libCat || x.cat === ui.libCat); return '<div class="row between"><h1>Biblioteca</h1><button class="btn small" data-a="lib-new">+ Exercício</button></div>' +
    '<p class="muted small lib-total"><b>' + all.length + '</b> exercícios no total' + ((S.state.customEx || []).length ? ' (<b>' + S.state.customEx.length + '</b> criados por você)' : '') + '. <a href="#" data-a="lib-stats">Ver a lista por categoria</a></p><input id="lib-q" type="search" placeholder="Buscar exercício…" value="' + e(ui.libQ) + '">' +
    '<div class="chips">' + [['', 'Tudo']].concat(Object.entries(CATEGORIES)).map(c => '<button data-a="lib-cat" data-c="' + c[0] + '" class="' + (ui.libCat === c[0] ? 'on' : '') + '">' + c[1] + cnt(c[0] ? all.filter(x => x.cat === c[0]).length : all.length) + '</button>').join('') + '</div>' +
    '<div class="chips">' + LEVELS.map((l, i) => '<button data-a="lib-lvl" data-l="' + i + '" class="' + (ui.libLvl === i ? 'on' : '') + '">' + (l || 'Todos os níveis') + cnt(i ? inCat.filter(x => x.level === i).length : inCat.length) + '</button>').join('') + '<button data-a="lib-own" class="' + (ui.libOwn ? 'on' : '') + '">🏠 Só com meu equipamento</button><button data-a="lib-sup" class="' + (ui.libSup ? 'on' : '') + '">🛡️ Sem os que exigem supervisão' + cnt(inCat.filter(x => !x.sup).length) + '</button></div>' +
    '<div class="lib-filters"><label>Padrão de movimento <select id="lib-pat"><option value="">Todos' + '</option>' + Object.entries(PATTERNS).map(p => '<option value="' + p[0] + '"' + (ui.libPat === p[0] ? ' selected' : '') + '>' + p[1] + ' (' + inCat.filter(x => x.pat === p[0]).length + ')</option>').join('') + '</select></label>' +
    (!ui.libCat || ui.libCat === 'mobilidade' || ui.libCat === 'flexibilidade' ? '<label>Região (mobilidade e flexibilidade) <select id="lib-reg"><option value="">Todas</option>' + Object.entries(REGIONS).map(r => '<option value="' + r[0] + '"' + (ui.libReg === r[0] ? ' selected' : '') + '>' + r[1] + ' (' + inCat.filter(x => x.reg === r[0]).length + ')</option>').join('') + '</select></label>' : '') + (!ui.libCat || ui.libCat === 'mobilidade' || ui.libCat === 'flexibilidade' ? '<label>Modalidade <select id="lib-mod"><option value="">Todas</option>' + Object.entries(MODALITIES).map(m => '<option value="' + m[0] + '"' + (ui.libMod === m[0] ? ' selected' : '') + '>' + m[1] + ' (' + inCat.filter(x => x.mod === m[0]).length + ')</option>').join('') + '</select></label>' : '') + '</div>' +
    (ui.libCat === 'mobilidade' || ui.libCat === 'flexibilidade' || ui.libReg || ui.libMod ? '<button class="btn block ghosty" data-a="mob-menu">🧘 Montar uma rotina de mobilidade ou alongamento</button>' : '') +
    '<p class="muted small" id="lib-count">' + libCountText() + '</p><div class="tiles" id="lib-list">' + libList() + '</div>'; };
  function libCountText() { const n = libFiltered().length, t = S.allExercises().length; return n === t ? 'Mostrando todos os ' + t + ' exercícios' : 'Mostrando ' + n + ' de ' + t + ' exercícios'; }
  // Lista completa: quantos exercícios há em cada categoria e em cada nível
  A['lib-stats'] = () => {
    const all = S.allExercises(), cats = Object.entries(CATEGORIES).concat([['outros', 'Outros']]).filter(c => all.some(x => x.cat === c[0]));
    U.modal('<h2>Exercícios por categoria</h2><p class="muted small"><b>' + all.length + '</b> exercícios no total.</p><div style="overflow-x:auto"><table class="tbl"><tr><th>Categoria</th><th>Total</th>' + LEVELS.slice(1).map(l => '<th>' + l + '</th>').join('') + '</tr>' +
      cats.map(c => { const xs = all.filter(x => x.cat === c[0]); return '<tr><td><a href="#" data-a="lib-cat-go" data-c="' + c[0] + '">' + e(c[1]) + '</a></td><td><b>' + xs.length + '</b></td>' + [1, 2, 3, 4, 5].map(n => '<td>' + (xs.filter(x => x.level === n).length || '·') + '</td>').join('') + '</tr>'; }).join('') +
      '<tr><td><b>Total</b></td><td><b>' + all.length + '</b></td>' + [1, 2, 3, 4, 5].map(n => '<td><b>' + all.filter(x => x.level === n).length + '</b></td>').join('') + '</tr></table></div>' +
      '<h3>Por padrão de movimento</h3><div style="overflow-x:auto"><table class="tbl"><tr><th>Padrão</th><th>Total</th>' + LEVELS.slice(1).map(l => '<th>' + l + '</th>').join('') + '</tr>' +
      Object.entries(PATTERNS).map(p => { const xs = all.filter(x => x.pat === p[0]); return '<tr><td><a href="#" data-a="lib-pat-go" data-p="' + p[0] + '">' + e(p[1]) + '</a></td><td><b>' + xs.length + '</b></td>' + [1, 2, 3, 4, 5].map(n => '<td>' + (xs.filter(x => x.level === n).length || '·') + '</td>').join('') + '</tr>'; }).join('') + '</table></div>' +
      '<h3>Mobilidade e flexibilidade por região</h3><div style="overflow-x:auto"><table class="tbl"><tr><th>Região</th><th>Total</th>' + Object.values(MODALITIES).map(m => '<th>' + m + '</th>').join('') + '</tr>' +
      Object.entries(REGIONS).map(r => { const xs = all.filter(x => x.reg === r[0]); return '<tr><td><a href="#" data-a="lib-reg-go" data-r="' + r[0] + '">' + e(r[1]) + '</a></td><td><b>' + xs.length + '</b></td>' + Object.keys(MODALITIES).map(m => '<td>' + (xs.filter(x => x.mod === m).length || '·') + '</td>').join('') + '</tr>'; }).join('') + '</table></div>' +
      '<p class="muted small">Unilaterais: ' + all.filter(x => x.uni).length + ' · Exigem supervisão (fora dos treinos automáticos): ' + all.filter(x => x.sup).length + ' · Com vídeo: ' + all.filter(x => S.videoFor(x.id)).length + ' · Com carga (academia): ' + all.filter(x => x.w).length + ' · Só com peso do corpo: ' + all.filter(x => !S.needs(x.id).length).length + '</p>');
  };
  A['lib-pat-go'] = d => { Object.assign(ui, { libCat: '', libLvl: 0, libReg: '', libMod: '', libPat: d.p }); U.closeModal(); location.hash = '#biblioteca'; APP.render(); };
  A['lib-reg-go'] = d => { Object.assign(ui, { libCat: '', libLvl: 0, libPat: '', libMod: '', libReg: d.r }); U.closeModal(); location.hash = '#biblioteca'; APP.render(); };
  A['lib-cat-go'] = d => { ui.libCat = d.c === 'outros' ? '' : d.c; ui.libLvl = 0; U.closeModal(); location.hash = '#biblioteca'; APP.render(); };
  A['lib-cat'] = d => { ui.libCat = d.c; if (d.c && d.c !== 'mobilidade' && d.c !== 'flexibilidade') { ui.libReg = ''; ui.libMod = ''; } APP.render(); };
  A['lib-lvl'] = d => { ui.libLvl = +d.l; APP.render(); };
  A['lib-own'] = () => { ui.libOwn = !ui.libOwn; APP.render(); };
  A['lib-sup'] = () => { ui.libSup = !ui.libSup; APP.render(); };
  document.addEventListener('change', ev => { if (ev.target.id === 'lib-pat') { ui.libPat = ev.target.value; APP.render(); } if (ev.target.id === 'lib-reg') { ui.libReg = ev.target.value; APP.render(); } if (ev.target.id === 'lib-mod') { ui.libMod = ev.target.value; APP.render(); } });
  // equipamentos (Ajustes)
  document.addEventListener('change', ev => {
    const q = ev.target.dataset && ev.target.dataset.equip; if (!q) return;
    const own = new Set(S.owned()); if (ev.target.checked) own.add(q); else own.delete(q);
    S.state.equip = [...own]; S.save();
  });
  A['equip-add'] = () => {
    const name = U.$('#equip-new').value.trim(); if (!name) return U.toast('Digite o nome do equipamento.');
    const id = 'q-' + S.uid(); (S.state.customEquip = S.state.customEquip || []).push({ id, t: Date.now(), name });
    S.state.equip = S.owned().concat(id); S.save(); APP.render();
  };
  A['equip-del'] = d => { S.state.customEquip = (S.state.customEquip || []).filter(x => x.id !== d.id); S.state.deleted.push(d.id); S.save(); APP.render(); };
  document.addEventListener('input', ev => { if (ev.target.id === 'lib-q') { ui.libQ = ev.target.value; U.$('#lib-list').innerHTML = libList(); U.$('#lib-count').textContent = libCountText(); } });
  A['lib-new'] = () => U.modal('<h2>Novo exercício</h2><label>Nome <input id="nx-name"></label><label>Categoria <select id="nx-cat">' + Object.entries(CATEGORIES).map(c => '<option value="' + c[0] + '">' + c[1] + '</option>').join('') + '</select></label>' +
    '<label>Nível <select id="nx-lvl">' + LEVELS.slice(1).map((l, i) => '<option value="' + (i + 1) + '">' + l + '</option>').join('') + '</select></label>' +
    '<label>Equipamento necessário <select id="nx-eq"><option value="">Nenhum (peso do corpo)</option>' + S.allEquip().map(q => '<option value="' + e(q.id) + '">' + e(q.name) + '</option>').join('') + '</select></label>' +
    '<label>Padrão de movimento <select id="nx-pat"><option value="">Nenhum / não sei</option>' + Object.entries(PATTERNS).map(p => '<option value="' + p[0] + '">' + p[1] + '</option>').join('') + '</select></label>' +
    '<label>Como fazer <textarea id="nx-how" rows="2" placeholder="Ex.: De quatro, com as mãos no chão…"></textarea></label>' +
    '<div class="card"><div class="small"><b>Articulações que o exercício exige (obrigatório)</b> <span class="muted">— usadas para proteger lesões registradas em Saúde. Já vêm marcadas pela categoria, padrão, equipamento e descrição; acrescente o que faltar.</span></div><div class="row wrap" style="margin-top:4px">' + Object.entries(JOINTS).map(j => '<label class="chk" style="border:0"><input type="checkbox" class="nx-joint" value="' + j[0] + '"><span>' + j[1] + '</span></label>').join('') + '</div>' +
    '<div id="nx-jwarn" class="small"></div><label class="chk" style="border:0"><input type="checkbox" id="nx-jok"><span>Conferi as articulações marcadas</span></label></div>' +
    '<label>Link do short no YouTube (opcional) <input id="nx-vid" placeholder="https://youtube.com/shorts/…"></label><button class="btn block" data-a="lib-save">Salvar</button>');
  // sugere as articulações enquanto a pessoa preenche (até ela mexer nas caixas) e avisa quando o equipamento ou a posição pedem atenção
  let nxTouched = false;
  const nxDraft = () => ({ id: 'c-novo', name: (U.$('#nx-name') || {}).value || '', cat: U.$('#nx-cat').value, pat: U.$('#nx-pat').value || undefined, equip: U.$('#nx-eq').value ? [U.$('#nx-eq').value] : undefined, how: U.$('#nx-how').value, jointsManual: [] });
  function nxSuggest() {
    if (!U.$('#nx-cat')) return; const d = nxDraft(), j = jointsOf(d), eq = U.$('#nx-eq').value;
    if (!nxTouched) document.querySelectorAll('.nx-joint').forEach(c => { c.checked = j.includes(c.value); });
    const w = [];
    if (eq && (/^q-/.test(eq) || ['elastico', 'superband', 'maquinas'].includes(eq))) w.push('O equipamento escolhido pode carregar articulações diferentes conforme o uso (onde prende, onde apoia): confira a lista.');
    if (!d.how.trim()) w.push('Sem descrição, o app só sabe o que a categoria indica. Apoio nas mãos, de joelhos, pendurado ou saltando muda as articulações.');
    U.$('#nx-jwarn').innerHTML = w.map(t => '<p class="warn-box"><span aria-hidden="true">⚠️</span> <span>' + e(t) + '</span></p>').join('');
  }
  document.addEventListener('change', ev => { if (['nx-cat', 'nx-pat', 'nx-eq'].includes(ev.target.id)) nxSuggest(); if (ev.target.classList && ev.target.classList.contains('nx-joint')) nxTouched = true; });
  document.addEventListener('input', ev => { if (['nx-how', 'nx-name'].includes(ev.target.id)) nxSuggest(); });
  const libNew0 = A['lib-new']; A['lib-new'] = () => { nxTouched = false; libNew0(); nxSuggest(); };
  A['lib-save'] = () => {
    const name = U.$('#nx-name').value.trim(); if (!name) return U.toast('Dê um nome ao exercício.');
    if (!document.querySelectorAll('.nx-joint:checked').length) return U.toast('Marque pelo menos uma articulação que o exercício exige.');
    if (!U.$('#nx-jok').checked) return U.toast('Confira as articulações marcadas e marque "Conferi".');
    S.state.customEx.push({ id: 'c-' + S.uid(), t: Date.now(), name, cat: U.$('#nx-cat').value, level: +U.$('#nx-lvl').value, how: U.$('#nx-how').value.trim(), q: name, equip: U.$('#nx-eq').value ? [U.$('#nx-eq').value] : undefined, video: U.ytId(U.$('#nx-vid').value) || undefined, pat: U.$('#nx-pat').value || undefined, jointsManual: [...document.querySelectorAll('.nx-joint:checked')].map(c => c.value) });
    S.save(); U.closeModal(); APP.render();
  };

  // ================= PROGRAMA =================
  const describe = (it, pid, key) => it.text ? e(it.text) : e(S.ex(W.resolve(it, pid, key)).name) + ' <span class="muted">' + U.fmtRange(it) + '</span>';
  V.programa = () => {
    if (ui.draft) return editor();
    const p = S.program(), n = p.sessions.length;
    let h = '<h1>Programa</h1><div class="card"><h2>' + e(p.name) + '</h2><div class="muted">' + p.rounds + ' voltas × ' + n + ' sessões' + (p.startDate ? ' · início em ' + U.fmtDate(p.startDate) : '') + '</div>' +
      '<div class="row wrap"><label>Estou na volta <select id="pos-r">' + Array.from({ length: p.rounds }, (_, i) => '<option' + (i + 1 === Math.min(S.round(), p.rounds) ? ' selected' : '') + '>' + (i + 1) + '</option>').join('') + '</select></label>' +
      '<label>sessão <select id="pos-s">' + p.sessions.map((s, i) => '<option value="' + i + '"' + (i === S.sessionIdx() ? ' selected' : '') + '>' + (i + 1) + ' — ' + e(s.name) + '</option>').join('') + '</select></label></div>' +
      '<p class="muted small">Ajuste aqui se a fila do app estiver diferente de onde você realmente está.</p></div>' + V.planCard();
    h += p.sessions.map((s, si) => '<details class="card"><summary><b>Sessão ' + (si + 1) + '</b> — ' + e(s.name) + (s.duration ? ' <span class="muted small">~' + s.duration + ' min</span>' : '') + '</summary>' +
      s.blocks.map((b, bi) => '<h4>' + e(b.title) + (b.phase2 ? ' <span class="tag">fase 2</span>' : '') + '</h4>' + (b.note ? '<p class="muted small">' + e(b.note) + '</p>' : '') +
        '<ul class="plain small">' + (b.items || []).map((it, ii) => '<li>' + describe(it, p.id, si + '.' + bi + '.' + ii) + '</li>').join('') +
        (b.options || []).map(o => '<li>' + e(o.name) + '</li>').join('') + '</ul>').join('') + '</details>').join('');
    h += (p.notes || []).map(nt => '<details class="card"><summary><b>' + e(nt.title) + '</b></summary><p class="pre">' + e(nt.text) + '</p></details>').join('');
    h += '<h3>Novo treino</h3><div class="card"><p>PDF e foto funcionam com fichas <b>impressas ou digitadas</b>. Para cartão de academia preenchido à mão, use <b>Marcar na lista</b>.</p>' +
      '<div class="row wrap"><label class="btn">📄 Importar PDF<input type="file" id="pdf-file" accept="application/pdf" hidden></label>' +
      '<label class="btn">📷 Foto da ficha<input type="file" id="img-file" accept="image/*" hidden></label>' +
      '<a class="btn" href="#ficha">✅ Marcar na lista</a>' +
      '<button class="btn ghosty" data-a="prog-json">Colar texto</button><button class="btn ghosty" data-a="prog-new">Montar à mão</button></div><div id="pdf-status" class="muted small"></div></div>';
    const all = Object.values(S.state.programs).filter(x => !x.alunoId);
    h += '<h3>Meus programas</h3><div class="list">' + all.map(x => '<div class="list-item"><span>' + (x.id === p.id ? '● ' : '') + e(x.name) + '</span><span class="row">' +
      (x.id === p.id ? '<span class="tag">ativo</span>' : '<button class="btn small" data-a="prog-use" data-id="' + e(x.id) + '">Usar</button>') +
      '<button class="btn small ghosty" data-a="prog-edit" data-id="' + e(x.id) + '">Editar</button><button class="btn small ghosty" data-a="prog-share" data-id="' + e(x.id) + '">Compartilhar</button>' +
      (all.length > 1 && x.id !== p.id ? '<button class="link danger" data-a="prog-del" data-id="' + e(x.id) + '">apagar</button>' : '') + '</span></div>').join('') + '</div>';
    return h;
  };
  document.addEventListener('change', async ev => {
    const t = ev.target;
    if (t.id === 'pos-r' || t.id === 'pos-s') { S.setPos((+U.$('#pos-r').value - 1) * S.program().sessions.length + +U.$('#pos-s').value); S.save(); U.toast('Posição na fila ajustada.'); }
    if (t.id === 'img-file' && t.files[0]) {
      const st = U.$('#pdf-status'); st.textContent = 'Lendo a foto… (na primeira vez baixa o leitor, pode demorar)';
      try {
        const res = await OCR.read(t.files[0], msg => { st.textContent = msg; }), txt = res.text;
        st.textContent = '';
        if (res.words < 4 || !PDFIMPORT.parseText(txt).sessions.length) { t.value = ''; return void (st.innerHTML = 'Não consegui ler essa ficha. O leitor gratuito só entende texto impresso ou digitado, de frente e com boa luz — não lê letra de mão nem cartão com marca-d’água. <a href="#ficha">Use “Marcar na lista”</a>, que é rápido, ou toque em “Colar texto” para digitar.'); }
        A['prog-json']({ text: txt, photo: 1 });
      } catch (err) { console.error(err); st.textContent = 'Erro ao ler a foto: ' + err.message; }
    }
    if (t.id === 'pdf-file' && t.files[0]) {
      const st = U.$('#pdf-status'); st.textContent = 'Lendo o PDF…';
      try {
        const lk = await PDFIMPORT.findLink(t.files[0]).catch(() => null);
        if (lk) { st.textContent = ''; location.hash = lk; return; } // PDF feito pelo app: importa o treino completo
        const d = await PDFIMPORT.parse(t.files[0]);
        if (!d.sessions.length) { st.textContent = 'Não encontrei tabelas de treino neste PDF. Use "Colar texto/JSON de um chat" ou "Montar à mão".'; return; }
        // É o mesmo programa que já existe no app? (título do PDF contido no nome de um programa)
        const tk = s => norm(s).split(' ').filter(w => w.length > 2), dn = tk(d.name);
        const same = Object.values(S.state.programs).find(p => { if (p.alunoId) return false; const pn = new Set(tk(p.name)); return dn.length >= 2 && dn.filter(w => pn.has(w)).length / dn.length >= 0.75; });
        if (same) { d.sameAs = same.id; d.onlyData = true; }
        ui.draft = d; APP.render(); U.toast('Encontrei ' + d.sessions.length + ' sessões. Revise e salve.');
      } catch (err) { console.error(err); st.textContent = 'Erro ao ler o PDF: ' + err.message + ' (a importação precisa de internet na primeira vez).'; }
    }
  });
  A['prog-use'] = d => { S.state.activeProgram = d.id; S.save(); APP.render(); };
  A['prog-del'] = d => { if (confirm('Apagar este programa? O histórico de treinos é mantido.')) { delete S.state.programs[d.id]; S.state.deleted.push(d.id); S.save(); APP.render(); } };
  A['prog-new'] = () => { ui.draft = { name: 'Meu treino', rounds: 12, flex: true, sessions: [{ name: 'Sessão 1', items: [] }] }; APP.render(); };
  A['prog-edit'] = d => {
    const p = S.state.programs[d.id];
    ui.draft = { id: p.id, name: p.name, rounds: p.rounds, flex: false, keep: p, sessions: p.sessions.map((s, si) => ({ name: s.name,
      items: s.blocks.filter(b => b.kind === 'forca').flatMap((b, bi) => b.items.map(it => Object.assign({}, it, { name: S.ex(W.resolve(it, p.id, 'x')).name }))) })) };
    if (p.sessions.some(s => s.blocks.some(b => b.kind !== 'forca'))) U.toast('Editando só os exercícios de força; aquecimento, cardio e alongamento são mantidos.');
    if (location.hash !== '#programa') location.hash = '#programa'; else APP.render();
  };
  const PROMPT = 'Converta o treino do PDF/texto que enviei para JSON, sem nenhum texto fora do JSON, neste formato exato:\n' +
    '{"name":"nome do programa","rounds":12,"sessions":[{"name":"nome da sessão","items":[{"name":"nome do exercício","sets":4,"min":6,"max":10,"unit":"reps","side":false,"rest":90,"note":""}]}]}\n' +
    'Regras: uma entrada em "sessions" para cada sessão/dia de treino, na ordem; "unit" é "reps", "s" (segundos) ou "min"; "min" e "max" são a faixa de repetições (iguais se for número fixo); "side" é true quando for "cada perna/lado"; "rest" é o descanso em segundos; "rounds" é quantas vezes a sequência se repete (semanas ou voltas).';
  A['prog-json'] = d => U.modal('<h2>' + (d && d.photo ? 'Texto lido da foto' : 'Importar por texto') + '</h2>' +
    '<p class="muted">' + (d && d.photo ? 'Corrija o que saiu errado antes de continuar. ' : '') + 'Uma linha por exercício, com séries × repetições. Linhas como "Treino A" ou "Dia 2" separam as sessões.</p>' +
    '<textarea id="pj-json" rows="11" placeholder="Treino A&#10;Supino reto 3x10-12&#10;Puxada alta 3x12&#10;Prancha 3x30s&#10;&#10;Treino B&#10;Agachamento 4x8">' + e((d && d.text) || '') + '</textarea>' +
    '<button class="btn block" data-a="pj-go">Abrir no editor</button>' +
    '<details style="margin-top:12px"><summary class="muted small">O texto está bagunçado? Peça ajuda a um chat gratuito</summary><p class="muted small">Envie o PDF ou a foto para qualquer chat gratuito junto com o pedido abaixo e cole a resposta (JSON) no campo acima.</p>' +
    '<textarea readonly rows="4" id="pj-prompt">' + e(PROMPT) + '</textarea><button class="btn small ghosty" data-a="pj-copy">Copiar pedido</button></details>');
  A['pj-copy'] = () => { navigator.clipboard.writeText(PROMPT).then(() => U.toast('Copiado!'), () => { U.$('#pj-prompt').select(); U.toast('Selecione e copie com Ctrl+C.'); }); };
  A['pj-go'] = () => {
    const raw = U.$('#pj-json').value;
    if (!/"sessions"/.test(raw)) { // texto simples: uma linha por exercício
      const d = PDFIMPORT.parseText(raw);
      if (!d.sessions.length) return U.toast('Não encontrei exercícios. Use o formato "Supino 3x10", um por linha.');
      ui.draft = d; U.closeModal(); if (location.hash !== '#programa') location.hash = '#programa'; else APP.render();
      return U.toast('Encontrei ' + d.sessions.reduce((a, s) => a + s.items.length, 0) + ' exercícios. Revise e salve.');
    }
    try {
      const txt = raw, d = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      if (!Array.isArray(d.sessions)) throw new Error('sem "sessions"');
      ui.draft = { name: d.name || 'Meu treino', rounds: +d.rounds || 12, flex: true, sessions: d.sessions.map(s => ({ name: s.name || 'Sessão', items: (s.items || []).map(i => Object.assign({ sets: 3, min: 10, max: 10, unit: 'reps' }, i)) })) };
      U.closeModal(); APP.render();
    } catch (err) { U.toast('Não consegui ler esse JSON: ' + err.message); }
  };

  // ---------- editor de programa ----------
  function editor() {
    const d = ui.draft;
    return '<h1>' + (d.id ? 'Editar programa' : 'Revisar novo programa') + '</h1><p class="muted">Confira nomes, séries e repetições. Exercícios que não existem na biblioteca são criados automaticamente.</p>' +
      '<datalist id="ex-names">' + S.allExercises().map(x => '<option value="' + e(x.name) + '">').join('') + '</datalist>' +
      '<div class="card"><label>Nome do programa <input id="ed-name" value="' + e(d.name) + '"></label><div class="row wrap"><label>Voltas (repetições da sequência) <input id="ed-rounds" type="number" min="1" value="' + d.rounds + '"></label>' +
      '<label>Voltas leves, com metade das séries (ex.: 4, 8, 12) <input id="ed-deload" value="' + e((d.deload || (d.keep && d.keep.deloadRounds) || []).join(', ')) + '"></label></div>' +
      (d.keep ? '' : '<label class="chk"><input type="checkbox" id="ed-flex"' + (d.flex ? ' checked' : '') + '><span>Incluir aquecimento no início e rotina curta de flexibilidade no fim de cada sessão</span></label>') + '</div>' +
      ((d.logs && d.logs.length) || (d.tests && d.tests.length) || d.sameAs ? '<div class="card hl"><h2>Seus dados no PDF</h2>' +
        '<ul class="plain small">' + (d.startDate ? '<li>Início do programa: <b>' + U.fmtDate(d.startDate) + '</b></li>' : '') +
        (d.tests || []).map(t => '<li>Teste — ' + e(t.name) + ': <b>' + (t.baseline != null ? t.baseline + U.unit(t.unit) : 'a medir') + '</b>' + (t.goal ? ' → meta ' + e(t.goal) : '') + '</li>').join('') +
        (d.logs || []).map(l => '<li>Treino de ' + U.fmtDate(l.date) + (l.tag ? ' (' + e(l.tag) + ')' : '') + ': ' + l.items.map(i => e(i.name) + ' ' + i.sets.join(', ') + U.unit(i.unit)).join(' · ') + '</li>').join('') + '</ul>' +
        ((d.logs && d.logs.length) || (d.tests && d.tests.length) ? '<label class="chk"><input type="checkbox" id="ed-data"' + (d.useData ? ' checked' : '') + '><span>Importar esses dados (testes, registros e posição na fila)</span></label>' : '<p class="muted small">Não encontrei registros de treino nem testes neste PDF.</p>') +
        (d.sameAs ? '<label class="chk"><input type="checkbox" id="ed-only"' + (d.onlyData ? ' checked' : '') + '><span>Este PDF é o programa <b>' + e(S.state.programs[d.sameAs].name) + '</b>, que já está no app na versão completa (cardio, intervalado, habilidades). Manter essa versão e só importar meus dados</span></label>' : '') + '</div>' : '') +
      d.sessions.map((s, si) => '<div class="card ed-session"><div class="row"><input class="ed-sname grow" value="' + e(s.name) + '" aria-label="Nome da sessão"><button class="link danger" data-a="ed-del-s" data-s="' + si + '">remover sessão</button></div>' +
        '<div class="ed-head"><span>Exercício</span><span>Séries</span><span>Mín</span><span>Máx</span><span>Un.</span><span>Lado</span><span></span></div>' +
        s.items.map((it, ii) => '<div class="ed-item" data-note="' + e(it.note || '') + '" data-rest="' + (it.rest || '') + '" data-skill="' + e(it.skill || '') + '"><input class="i-name" list="ex-names" value="' + e(it.name || '') + '" aria-label="Exercício">' +
          '<input class="i-sets" type="number" min="1" value="' + (it.sets || 1) + '" aria-label="Séries"><input class="i-min" type="number" min="0" value="' + (it.min || 0) + '" aria-label="Mínimo"><input class="i-max" type="number" min="0" value="' + (it.max || it.min || 0) + '" aria-label="Máximo">' +
          '<select class="i-unit" aria-label="Unidade">' + ['reps', 's', 'min'].map(u => '<option' + (u === it.unit ? ' selected' : '') + '>' + u + '</option>').join('') + '</select>' +
          '<input class="i-side" type="checkbox"' + (it.side ? ' checked' : '') + ' title="Cada lado/perna" aria-label="Cada lado">' +
          '<button class="link danger" data-a="ed-del-i" data-s="' + si + '" data-i="' + ii + '" aria-label="Remover">✕</button></div>').join('') +
        '<button class="btn small ghosty" data-a="ed-add-i" data-s="' + si + '">+ exercício</button>' +
        (d.keep ? '' : (() => { const c = s.cardio || {}, o = (s.interval || [])[0] || {};
          return '<details class="ed-extra"' + (s.cardio || s.interval ? ' open' : '') + ' data-more="' + e(JSON.stringify((s.interval || []).slice(1))) + '"><summary class="muted small">Cardio e intervalado desta sessão (opcional)</summary>' +
            '<div class="row wrap"><label>Cardio contínuo: de (min) <input class="s-cmin" type="number" min="0" value="' + (c.min || '') + '"></label><label>até (min) <input class="s-cmax" type="number" min="0" value="' + (c.max || '') + '"></label></div>' +
            '<div class="row wrap"><label>Intervalado: forte (s) <input class="s-iw" type="number" min="0" value="' + (o.work || '') + '"></label><label>pausa (s) <input class="s-ir" type="number" min="0" value="' + (o.rest || '') + '"></label><label>rodadas <input class="s-in" type="number" min="0" value="' + (o.rounds || '') + '"></label></div>' +
            '<label>Exercícios do intervalado, separados por vírgula <input class="s-il" value="' + e((o.labels || []).join(', ')) + '" placeholder="Burpee, Polichinelo…"></label></details>'; })()) + '</div>').join('') +
      '<div class="row"><button class="btn ghosty" data-a="ed-add-s">+ sessão</button></div>' +
      '<div class="row end"><button class="btn ghosty" data-a="ed-cancel">Cancelar</button><button class="btn big" data-a="ed-save">Salvar programa</button></div>';
  }
  function readDraft() {
    const d = ui.draft;
    d.name = U.$('#ed-name').value.trim() || 'Meu treino'; d.rounds = Math.max(1, +U.$('#ed-rounds').value || 1);
    if (U.$('#ed-flex')) d.flex = U.$('#ed-flex').checked;
    if (U.$('#ed-data')) d.useData = U.$('#ed-data').checked;
    if (U.$('#ed-only')) d.onlyData = U.$('#ed-only').checked;
    d.deload = U.$('#ed-deload').value.split(/[^\d]+/).map(Number).filter(n => n > 0);
    const extra = sEl => {
      const x = U.$('.ed-extra', sEl); if (!x) return {};
      const n = c => +U.$(c, x).value || 0, o = {};
      if (n('.s-cmin')) o.cardio = { min: n('.s-cmin'), max: Math.max(n('.s-cmin'), n('.s-cmax')) };
      let more = []; try { more = JSON.parse(x.dataset.more || '[]'); } catch (err) {}
      if (n('.s-iw') && n('.s-in')) o.interval = [{ work: n('.s-iw'), rest: n('.s-ir'), rounds: n('.s-in'), labels: U.$('.s-il', x).value.split(',').map(t => t.trim()).filter(Boolean) }].concat(more);
      return o;
    };
    d.sessions = [...document.querySelectorAll('.ed-session')].map(sEl => Object.assign(extra(sEl), { name: U.$('.ed-sname', sEl).value.trim() || 'Sessão',
      items: [...sEl.querySelectorAll('.ed-item')].map(r => { const min = +U.$('.i-min', r).value || 0; return { name: U.$('.i-name', r).value.trim(), sets: Math.max(1, +U.$('.i-sets', r).value || 1), min, max: Math.max(min, +U.$('.i-max', r).value || 0),
        unit: U.$('.i-unit', r).value, side: U.$('.i-side', r).checked, note: r.dataset.note || undefined, rest: +r.dataset.rest || undefined, skill: r.dataset.skill || undefined }; }) }));
  }
  const hasWork = s => s.items.some(i => i.name) || s.cardio || s.interval;
  function extraBlocks(s) {
    const c = s.cardio ? [{ title: 'Cardio contínuo', kind: 'cardio', min: s.cardio.min, max: s.cardio.max, ex: 'caminhada', note: 'Ritmo em que dá para falar frases curtas.' }] : [];
    const i = s.interval ? [{ title: 'Intervalado', kind: 'intervalado', note: 'Esforço máximo no forte, pausa leve.', options: s.interval.map((o, n) => ({ name: 'Opção ' + 'ABCDEF'[n] + ' — ' + o.rounds + ' × ' + o.work + ' s / ' + o.rest + ' s', work: o.work, rest: o.rest, rounds: o.rounds, labels: o.labels && o.labels.length ? o.labels : ['Esforço máximo'], ex: 'corda' })) }] : [];
    return { c, i };
  }
  A['ed-add-s'] = () => { readDraft(); ui.draft.sessions.push({ name: 'Sessão ' + (ui.draft.sessions.length + 1), items: [] }); APP.render(); };
  A['ed-del-s'] = d => { readDraft(); ui.draft.sessions.splice(+d.s, 1); APP.render(); };
  A['ed-add-i'] = d => { readDraft(); ui.draft.sessions[+d.s].items.push({ name: '', sets: 3, min: 8, max: 12, unit: 'reps' }); APP.render(); };
  A['ed-del-i'] = d => { readDraft(); ui.draft.sessions[+d.s].items.splice(+d.i, 1); APP.render(); };
  A['ed-cancel'] = () => { const al = ui.draft.alunoId || (ui.draft.keep && ui.draft.keep.alunoId); ui.draft = null; if (al) location.hash = '#aluno'; else APP.render(); };
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  // Aplica ao programa os dados pessoais lidos do PDF: data de início, testes e registros de treino.
  function applyData(d, progId) {
    const prog = S.state.programs[progId];
    if (!d.useData || !prog) return 0;
    if (d.startDate) prog.startDate = d.startDate;
    prog.tests = prog.tests || [];
    for (const t of d.tests || []) {
      const old = prog.tests.find(x => x.id === t.id || norm(x.name).split(' ')[0] === norm(t.name).split(' ')[0]);
      if (old) { old.baseline = t.baseline; if (t.goal) old.goal = t.goal; old.unit = t.unit; } else prog.tests.push(t);
    }
    let added = 0, lastIdx = -1, lastDate = '';
    for (const l of d.logs || []) {
      const id = 'pdf-' + l.date + '-' + (l.tag || 'x');
      const exOf = s => s.blocks.filter(b => b.kind === 'forca').flatMap(b => b.items.map(it => S.ex(W.resolve(it, progId, 'x'))));
      let si = /^\d+$/.test(l.tag) ? +l.tag - 1 : l.tag ? prog.sessions.findIndex(s => new RegExp('(^|[^A-Za-zÀ-ÿ])' + l.tag + '([^A-Za-zÀ-ÿ]|$)').test(s.name)) : -1;
      if (!prog.sessions[si]) { // sem letra/número: a sessão que mais tem os exercícios do registro
        let best = 0; si = 0;
        prog.sessions.forEach((s, i) => { const n = l.items.filter(it => V.matchExercise(it.name, exOf(s))).length; if (n > best) { best = n; si = i; } });
      }
      const cand = exOf(prog.sessions[si]);
      const items = l.items.map(it => { const ex = V.matchExercise(it.name, cand) || V.matchExercise(it.name); return ex ? { ex: ex.id, unit: it.unit, sets: it.sets } : null; }).filter(Boolean);
      if (l.date >= lastDate) { lastDate = l.date; lastIdx = si; }
      if (!items.length || S.state.logs.some(x => x.id === id) || S.state.deleted.includes(id)) continue;
      S.state.logs.push({ id, t: Date.now(), date: l.date, programId: progId, round: 1, sessionIdx: si, sessionName: prog.sessions[si].name, type: 'session', items, rpe: null, notes: 'Importado do PDF.' });
      added++;
    }
    if (lastIdx >= 0 && (S.state.pos[progId] || 0) < lastIdx + 1) S.state.pos[progId] = lastIdx + 1;
    return added;
  }
  V.matchExercise = (name, list) => {
    const n = norm(name), all = list || S.allExercises();
    let hit = all.find(x => norm(x.name) === n || x.id === n.replace(/ /g, '-'));
    if (hit) return hit;
    const tk = new Set(n.split(' ').filter(w => w.length > 2)); let best = null, bs = 0;
    for (const x of all) { const xt = new Set(norm(x.name).split(' ').filter(w => w.length > 2)); const inter = [...tk].filter(w => xt.has(w)).length, sc = inter / (tk.size + xt.size - inter || 1);
      // aceita se for bem parecido, ou se um nome estiver inteiro dentro do outro ("Búlgaro" → "Agachamento búlgaro")
      const ok = sc >= 0.6 || (sc >= 0.4 && inter > 0 && (inter === tk.size || (inter === xt.size && xt.size >= 2)));
      if (ok && sc > bs) { bs = sc; best = x; } }
    return best;
  };
  A['ed-save'] = () => {
    readDraft();
    const d = ui.draft, id = d.id || 'p-' + S.uid();
    if (d.sameAs && d.onlyData) {
      const n = applyData(d, d.sameAs);
      S.state.activeProgram = d.sameAs; ui.draft = null; S.save(); location.hash = '#hoje';
      return U.toast(d.useData ? 'Dados importados: ' + n + ' treino(s) e ' + (d.tests || []).length + ' teste(s).' : 'Programa mantido, nada importado.');
    }
    const created = [];
    const toItems = s => s.items.filter(i => i.name).map((i, n) => {
      let ex = V.matchExercise(i.name);
      if (!ex) { ex = Object.assign({ id: 'c-' + S.uid() + n, t: Date.now(), name: i.name, level: 1, how: i.note || '', q: i.name }, guess(i.name)); S.state.customEx.push(ex); created.push(ex.id); }
      const o = { ex: ex.id, sets: i.sets, min: i.min, max: i.max, unit: i.unit, side: i.side, rest: i.rest || (n < 2 ? 150 : 75) };
      if (i.note) o.note = i.note;
      if (i.skill && S.skill(i.skill) && S.skill(i.skill).steps.some(st => st.ex === ex.id)) { o.skill = i.skill; }
      return o;
    });
    let prog;
    if (d.keep) { // mantém blocos que não são de força; substitui os de força pelo editado
      prog = JSON.parse(JSON.stringify(d.keep)); prog.name = d.name; prog.rounds = d.rounds; prog.deloadRounds = d.deload || [];
      prog.sessions = d.sessions.map((s, si) => {
        const old = d.keep.sessions[si], items = toItems(s);
        if (!old) return { name: s.name, blocks: [{ title: s.name, kind: 'forca', items }] };
        const o = JSON.parse(JSON.stringify(old)); o.name = s.name; let used = false;
        o.blocks = o.blocks.filter(b => { if (b.kind !== 'forca') return true; if (used) return false; used = true; b.items = items; return true; });
        if (!used && items.length) o.blocks.push({ title: s.name, kind: 'forca', items });
        return o;
      });
      delete S.state.swaps[id];
    } else {
      const base = DEFAULT_PROGRAM.sessions[0].blocks, aq = base[0], fx = base[base.length - 1];
      prog = { id, name: d.name, rounds: d.rounds, startDate: S.today(), deloadRounds: d.deload || [], tests: JSON.parse(JSON.stringify(DEFAULT_PROGRAM.tests)), notes: [],
        sessions: d.sessions.filter(hasWork).map(s => { const x = extraBlocks(s), items = toItems(s);
          return { name: s.name, blocks: (d.flex ? [JSON.parse(JSON.stringify(aq))] : []).concat(x.c, items.length ? [{ title: s.name, kind: 'forca', items }] : [], x.i, d.flex ? [JSON.parse(JSON.stringify(fx))] : []) }; }) };
      if (!prog.sessions.length) return U.toast('Adicione pelo menos um exercício.');
      S.state.pos[id] = 0;
    }
    if (d.alunoId) prog.alunoId = d.alunoId;
    S.state.programs[id] = prog;
    if (prog.alunoId) { ui.draft = null; S.save(); location.hash = '#aluno'; U.toast('Treino salvo na ficha do aluno.'); return newEx(created); }
    S.state.activeProgram = id;
    if (!d.keep) { if (d.tests && d.tests.length && d.useData) prog.tests = []; applyData(d, id); }
    ui.draft = null;
    S.save(); APP.render(); U.toast('Programa salvo e ativado!'); newEx(created);
  };
  // Categoria e "usa carga" de um exercício novo, pelo nome.
  function guess(name) {
    const n = norm(name), cat = /supino|flexao|triceps|desenvolvimento|peito|ombro|crucifixo|voador|peck|mergulho|elevacao (lateral|frontal)/.test(n) ? 'empurrar'
      : /remada|puxada|puxador|pulley|rosca|biceps|dorsal|barra fixa|pull/.test(n) ? 'puxar'
      : /agach|leg|perna|panturrilha|gluteo|afundo|passada|stiff|terra|extensora|flexora|cadeira|hack|abdutor|adutor|quadril/.test(n) ? 'pernas'
      : /abd|prancha|core|lombar|obliquo/.test(n) ? 'core' : /corrida|esteira|bike|bicicleta|corda|cardio|hiit|eliptico|caminhada/.test(n) ? 'cardio' : /along|mobilidade|flexibilidade/.test(n) ? 'flexibilidade' : 'outros';
    return { cat, w: /supino|rosca|puxada|puxador|pulley|leg|cadeira|maquina|halter|polia|cabo|cross|extensora|flexora|stiff|terra|triceps|desenvolvimento|crucifixo|elevacao (lateral|frontal)|remada (baixa|curvada|cavalinho|unilateral|alta)|hack|smith|voador|peck|abdutor|adutor|hip thrust|goblet/.test(n) || undefined };
  }
  // Depois de salvar: vídeo automático para os exercícios novos (com chave) ou lista para escolher (sem chave).
  async function newEx(ids) {
    if (!ids.length) return;
    const n = S.cfg.ytKey ? await U.autoVideos(ids) : 0;
    const left = ids.filter(id => !S.videoFor(id));
    U.modal('<h2>' + ids.length + ' exercício(s) novo(s) na biblioteca</h2>' + (n ? '<p class="hint up">Fixei um vídeo automaticamente em ' + n + '. Toque no exercício para conferir ou trocar.</p>' : '') +
      (left.length && !S.cfg.ytKey ? '<p class="muted">Eles ainda não têm vídeo. Toque em cada um para buscar no YouTube e colar o link — ou cadastre uma chave gratuita do YouTube em Ajustes para o app escolher sozinho.</p>' : '') +
      '<div class="list">' + ids.map(id => '<button class="list-item" data-a="exercise" data-ex="' + e(id) + '"><span>' + e(S.ex(id).name) + '<small class="muted"> · ' + e(CATEGORIES[S.ex(id).cat] || 'Outros') + '</small></span><span class="tag">' + (S.videoFor(id) ? '▶ com vídeo' : 'sem vídeo') + '</span></button>').join('') + '</div>');
  }

  // ================= AJUSTES =================
  V.ajustes = () => '<a href="#perfil" class="muted small">← Perfil</a><h1>Ajustes</h1>' +
    (S.recovered ? '<div class="hint warn">' + e(S.recovered) + ' <button class="link" data-a="rec-ok">Ok</button></div>' : '') +
    '<div class="card"><h2>Sincronização PC ↔ celular</h2><p class="muted">Seus dados ficam num Gist <b>privado</b> da sua conta do GitHub. Faça isto uma vez em cada aparelho:</p>' +
    '<ol class="small"><li>Abra <a target="_blank" rel="noopener" href="https://github.com/settings/tokens/new?description=App%20de%20treino&scopes=gist">github.com → Settings → Tokens (classic) → Generate new token</a>.</li>' +
    '<li>Marque <b>apenas</b> a permissão <code>gist</code>. Em validade, escolha <b>90 dias</b> (ou 1 ano): quando vencer, o app avisa e você gera outro.</li><li>Cole o token abaixo e toque em Conectar. Use o mesmo token no PC e no celular.</li></ol>' +
    '<details class="small"><summary class="muted">Riscos e cuidados com o token</summary><ul><li>O token fica guardado <b>neste navegador</b>. Quem tiver acesso a ele (aparelho destravado, extensões maliciosas) pode usar o token.</li>' +
    '<li>Com só a permissão <code>gist</code>, o token não mexe nos seus repositórios nem na sua conta: só lê e grava gists.</li><li>Não use o token em aparelho de outra pessoa nem compartilhe prints dele.</li>' +
    '<li>Perdeu o celular ou desconfia de algo? <a target="_blank" rel="noopener" href="https://github.com/settings/tokens">revogue o token no GitHub</a>: ele para de funcionar na hora em todos os aparelhos.</li></ul></details>' +
    '<div class="row wrap"><input id="tok" type="password" autocomplete="off" placeholder="ghp_…" value="' + e(S.cfg.token) + '" class="grow" aria-label="Token do GitHub">' +
    '<button class="btn" data-a="sync-connect">' + (S.cfg.token ? 'Sincronizar agora' : 'Conectar') + '</button></div>' +
    '<div class="muted small" id="sync-status" role="status">Situação: ' + e(S.syncStatus) + '</div>' +
    (S.cfg.tokenExp ? '<div class="small ' + (new Date(S.cfg.tokenExp) - Date.now() < 14 * 864e5 ? 'bad' : 'muted') + '">Token vence em ' + new Date(S.cfg.tokenExp).toLocaleDateString((window.I18N && I18N.locale || 'pt-BR')) + '.</div>' : '') +
    (S.cfg.token ? '<div class="row wrap"><button class="btn small ghosty" data-a="sync-off">Desligar neste aparelho</button><button class="btn small ghosty danger" data-a="sync-del">Apagar backup na nuvem</button></div>' +
      '<p class="muted small"><b>Desligar</b> esquece o token só aqui: o backup na nuvem e os outros aparelhos continuam. <b>Apagar backup na nuvem</b> exclui o Gist; os dados deste aparelho ficam. Para invalidar o token em todo lugar, revogue no GitHub.</p>' : '') + '</div>' +
    '<div class="card"><h2>Idioma · Language · Idioma</h2>' + I18N.picker() + '</div>' +
    V.themeCard() +
    '<div class="card"><h2>Meus equipamentos</h2><p class="muted">Marque o que você tem. O app avisa quando um exercício pede algo que falta, e a Biblioteca pode filtrar só o que dá para fazer.</p>' +
    S.allEquip().map(q => '<label class="chk"><input type="checkbox" data-equip="' + e(q.id) + '"' + (S.owned().includes(q.id) ? ' checked' : '') + '><span class="grow">' + e(q.name) + '</span>' +
      (q.id.startsWith('q-') ? '<button class="link danger" data-a="equip-del" data-id="' + e(q.id) + '">remover</button>' : '') + '</label>').join('') +
    '<div class="row"><input id="equip-new" class="grow" placeholder="Novo equipamento (ex.: halteres 10 kg)" aria-label="Novo equipamento"><button class="btn small" data-a="equip-add">Adicionar</button></div></div>' +
    '<div class="card"><h2>Música</h2><p class="muted">Toque no botão 🎵 (canto da tela) para colar o link de uma playlist do YouTube, YouTube Music ou Spotify. Com YouTube, o volume abaixa sozinho quando um timer apita.</p></div>' +
    '<div class="card"><h2>Vídeos automáticos (opcional)</h2><p class="muted">Com uma chave gratuita da API do YouTube, o app escolhe sozinho o vídeo dos exercícios novos e mostra opções no botão "Escolher vídeo". Sem chave, tudo continua funcionando: você busca e cola o link.</p>' +
    '<details><summary class="muted small">Como criar a chave (grátis, sem cartão)</summary><ol class="small"><li>Entre em <a target="_blank" rel="noopener" href="https://console.cloud.google.com/apis/library/youtube.googleapis.com">console.cloud.google.com → YouTube Data API v3</a> com sua conta Google, crie um projeto e toque em <b>Ativar</b>.</li>' +
    '<li>Vá em <b>Credenciais → Criar credenciais → Chave de API</b>.</li><li>Em <b>Restrições</b>, limite a chave à "YouTube Data API v3" e ao site <code>' + e(location.hostname || 'leonardoreali.github.io') + '</code>.</li><li>Cole a chave abaixo. O limite gratuito dá cerca de 100 buscas por dia.</li></ol></details>' +
    '<div class="row wrap"><input id="ytkey" type="password" autocomplete="off" placeholder="AIza…" value="' + e(S.cfg.ytKey || '') + '" class="grow" aria-label="Chave da API do YouTube"><button class="btn" data-a="ytkey-save">Salvar</button></div>' +
    '<p class="muted small">A chave fica só neste aparelho.</p></div>' +
    '<div class="card"><h2>Backup manual</h2><p class="muted">Baixe um arquivo com tudo (treinos, programas, medidas) ou restaure um backup. Antes de restaurar, o app guarda uma cópia do que está aqui.</p><div class="row wrap"><button class="btn" data-a="backup">⬇ Baixar backup</button>' +
    '<label class="btn ghosty">⬆ Restaurar backup<input type="file" id="restore" accept="application/json,.json" hidden></label></div>' +
    (S.previous() ? '<p class="small">Cópia anterior guardada em ' + new Date(S.previous().d).toLocaleString((window.I18N && I18N.locale || 'pt-BR'), { dateStyle: 'short', timeStyle: 'short' }) + '. <button class="link" data-a="undo-restore">Voltar para ela</button></p>' : '') + '</div>' +
    '<div class="card"><h2>Preferências</h2><label class="chk"><input type="checkbox" id="snd"' + (S.cfg.sound ? ' checked' : '') + '><span>Sons dos timers</span></label></div>' +
    INSTALL.card() +
    '<div class="card"><h2>Zona de perigo</h2><button class="btn danger ghosty" data-a="reset">Apagar todos os dados deste aparelho</button></div>';
  A['sync-connect'] = async () => { S.cfg.token = U.$('#tok').value.trim(); S.saveCfg(); if (!S.cfg.token) return U.toast('Cole o token primeiro.'); await S.sync(); APP.render(); };
  A['ytkey-save'] = async () => {
    S.cfg.ytKey = U.$('#ytkey').value.trim(); S.saveCfg();
    if (!S.cfg.ytKey) return U.toast('Chave removida.');
    try { await U.ytSearch('push up shorts'); U.toast('Chave funcionando!'); } catch (err) { U.toast('A chave não funcionou: ' + err.message); }
  };
  A['sync-off'] = () => { if (!confirm('Desligar a sincronização neste aparelho? O backup na nuvem e os outros aparelhos continuam como estão.')) return; S.disconnect(); APP.render(); U.toast('Sincronização desligada neste aparelho.'); };
  A['sync-del'] = async () => {
    if (!confirm('Apagar o backup da nuvem (o Gist no GitHub)? Os dados deste aparelho ficam, mas os outros aparelhos param de sincronizar. Não dá para desfazer.')) return;
    try { await S.deleteRemote(); APP.render(); U.toast('Backup na nuvem apagado e sincronização desligada.'); } catch (err) { U.toast('Não consegui apagar: ' + err.message); }
  };
  A['rec-ok'] = () => { S.recovered = null; APP.render(); };
  A['undo-restore'] = () => { if (confirm('Trocar os dados atuais pela cópia anterior? Os atuais viram a nova cópia anterior.')) { S.undoRestore(); APP.render(); U.toast('Dados trocados pela cópia anterior.'); } };
  A.backup = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S.exportData(), null, 1)], { type: 'application/json' }));
    a.download = 'treino-backup-' + S.today() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  A.reset = () => { if (confirm('Apagar TODOS os dados deste aparelho (treinos, programas, medidas)? Não dá para desfazer.') && confirm('Tem certeza? Faça um backup antes se tiver dúvida.')) { S.reset(); APP.render(); } };
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (t.id === 'snd') { S.cfg.sound = t.checked; S.saveCfg(); }
    if (t.id === 'restore' && t.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        let m; try { m = S.parseBackup(r.result); } catch (err) { t.value = ''; return U.modal('<h2>Não restaurei</h2><p>' + e(err.message) + '.</p><p class="muted small">Seus dados atuais não foram alterados.</p><button class="btn block" data-a="modal-close">Ok</button>'); }
        const st = m.state, n = st.logs.length, np = Object.keys(st.programs).length;
        if (!confirm('Restaurar este backup (' + n + ' treino(s), ' + np + ' programa(s))? Os dados atuais deste aparelho serão substituídos, mas ficam guardados como cópia anterior.')) { t.value = ''; return; }
        S.restore(st); APP.render(); U.toast('Backup restaurado' + (m.fixed ? ' (' + m.fixed + ' registro(s) com defeito descartados)' : '') + '.');
      };
      r.readAsText(t.files[0]);
    }
  });
})();
