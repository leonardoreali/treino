/* Tela do treino: monta a sessão da vez, sugere metas, registra séries e salva o histórico. */
(function () {
  const W = window.W = {};
  const e = U.esc;
  const FLEX_PADRAO = { title: 'Rotina curta de flexibilidade (10 min)', kind: 'check', items: [
    { ex: 'pike-pe', sets: 1, min: 45, max: 60, unit: 's' }, { ex: 'pike-ativo', sets: 3, min: 10, max: 10, unit: 'reps' },
    { ex: 'meio-espacate', sets: 1, min: 45, max: 45, unit: 's', side: true }, { ex: 'lagarto', sets: 1, min: 45, max: 45, unit: 's', side: true },
    { ex: 'pombo', sets: 1, min: 45, max: 45, unit: 's', side: true }, { ex: 'ponte', sets: 3, min: 10, max: 10, unit: 's' }] };

  W.resolve = (it, progId, key) => {
    const sw = (S.state.swaps[progId] || {})[key];
    if (sw) return sw;
    if (it.skill) { const sk = S.skill(it.skill); return sk ? sk.steps[S.skillStep(it.skill)].ex : it.ex; }
    return it.ex;
  };

  // Meta por série a partir do último registro (dupla progressão).
  W.suggest = (ex, it, gap) => {
    const hist = S.logsFor(ex).filter(h => h.item.unit === it.unit), last = hist[hist.length - 1];
    const fill = v => Array(it.sets).fill(v), clamp = v => Math.max(it.min, Math.min(it.max, v));
    const step = it.unit === 's' ? Math.max(1, Math.round((it.max - it.min) / 5)) : 1;
    if (!last) return { targets: fill(Math.round((it.min + it.max) / 2)), hint: it.min === it.max ? '' : 'Primeira vez: comece pelo meio da faixa.', up: false };
    const prev = last.item.sets, quando = U.fmtDate(last.log.date), txt = 'Última vez (' + quando + '): ' + prev.join(', ') + U.unit(it.unit) + '. ';
    const top = prev.length >= Math.min(it.sets, 2) && prev.every(v => v >= it.max);
    if (top) return { targets: fill(it.max), hint: txt + 'Topo da faixa em todas as séries — hora de dificultar.', up: true };
    if (gap >= 3 && it.min !== it.max) return { targets: fill(it.min), hint: txt + 'Você ficou 3+ dias parado: volte pelo início da faixa.', up: false };
    return { targets: fill(0).map((_, i) => clamp((prev[i] == null ? prev[prev.length - 1] : prev[i]) + step)), hint: txt + (it.min === it.max ? '' : 'Tente +' + step + ' por série.'), up: false };
  };

  W.build = type => {
    const p = S.program(), round = S.round(), si = S.sessionIdx(), deload = S.isDeload();
    let src;
    if (type === 'flex') {
      const all = p.sessions.flatMap(s => s.blocks);
      const b = all.find(b => b.kind === 'check' && /rotina curta/i.test(b.title)) || all.find(b => b.kind === 'check' && /flexib|along/i.test(b.title)) || FLEX_PADRAO;
      src = { name: 'Rotina curta de flexibilidade', blocks: [b] };
    } else src = p.sessions[si];
    const lastAny = S.sortedLogs()[0], gap = lastAny ? S.daysBetween(lastAny.date, S.today()) : 0;
    const blocks = [];
    src.blocks.forEach((b, bi) => {
      if (b.phase2 && !S.state.phase2) return;
      const nb = JSON.parse(JSON.stringify(b));
      nb.items = (nb.items || []).map((it, ii) => {
        const key = (type === 'flex' ? 'f' : si) + '.' + bi + '.' + ii;
        if (it.text) return Object.assign(it, { key, checked: false });
        const ex = W.resolve(it, p.id, key), sets = deload && b.kind === 'forca' ? Math.ceil(it.sets / 2) : it.sets;
        const o = Object.assign(it, { key, ex, sets, checked: false });
        if (b.kind === 'forca') { const s = W.suggest(ex, o, gap); Object.assign(o, { vals: s.targets, hint: s.hint, up: s.up, done: Array(sets).fill(false) }); }
        return o;
      });
      blocks.push(nb);
    });
    S.current = { type, programId: p.id, round, sessionIdx: si, name: src.name, startedAt: Date.now(), date: S.today(), blocks, deload };
    S.saveCurrent();
  };

  const findItem = key => { for (const b of S.current.blocks) for (const it of b.items) if (it.key === key) return it; };
  const rerender = () => { S.saveCurrent(); if (location.hash === '#treino') APP.render(); };

  function itemForca(it) {
    const ex = S.ex(it.ex), restTxt = it.rest ? ' · descanso ' + U.fmtSec(it.rest) : '';
    const next = it.up ? (it.skill && S.skill(it.skill).steps[S.skillStep(it.skill)].ex === it.ex && S.skillStep(it.skill) < S.skill(it.skill).steps.length - 1
      ? S.skill(it.skill).steps[S.skillStep(it.skill) + 1].ex : NEXT_VARIATION[it.ex]) : null;
    return '<div class="card ex' + (it.done.every(Boolean) ? ' alldone' : '') + '">' +
      '<div class="ex-head"><button class="vid" data-a="video" data-ex="' + e(it.ex) + '" aria-label="Ver vídeo">▶</button>' +
      '<div class="grow"><div class="ex-name" data-a="exercise" data-ex="' + e(it.ex) + '">' + e(ex.name) + '</div>' +
      '<div class="muted small">' + U.fmtRange(it) + restTxt + '</div></div>' +
      '<button class="ghost" data-a="w-swap" data-key="' + it.key + '" title="Trocar exercício">⇄</button></div>' +
      (it.note ? '<div class="note">' + e(it.note) + '</div>' : '') +
      (S.missing(it.ex).length ? '<div class="hint warn">Precisa de: ' + e(S.missing(it.ex).join(', ')) + ' — não está nos seus equipamentos. Troque o exercício (⇄) ou marque em Ajustes.</div>' : '') +
      (it.hint ? '<div class="hint' + (it.up ? ' up' : '') + '">' + e(it.hint) + '</div>' : '') +
      (it.up ? (next ? '<button class="btn small" data-a="w-up" data-key="' + it.key + '" data-next="' + e(next) + '">⬆ Subir para: ' + e(S.ex(next).name) + '</button>'
        : '<div class="hint">Sem variação cadastrada: desça mais devagar, faça pausa embaixo ou troque o exercício (⇄).</div>') : '') +
      '<div class="sets">' + it.vals.map((v, i) =>
        '<div class="set' + (it.done[i] ? ' done' : '') + '"><span class="set-n">' + (i + 1) + '</span>' +
        '<input type="number" inputmode="numeric" min="0" value="' + v + '" data-set="' + it.key + '" data-i="' + i + '" aria-label="Série ' + (i + 1) + '">' +
        '<span class="muted small">' + (it.unit === 's' ? 's' : it.unit === 'min' ? 'min' : 'reps') + '</span>' +
        (it.unit === 's' && !it.done[i] ? '<button class="ghost" data-a="w-hold" data-key="' + it.key + '" data-i="' + i + '" title="Cronometrar">⏱</button>' : '') +
        '<button class="check" data-a="w-set" data-key="' + it.key + '" data-i="' + i + '" aria-label="Concluir série">✓</button></div>').join('') + '</div></div>';
  }
  function itemCheck(it) {
    if (it.text) return '<label class="chk' + (it.checked ? ' on' : '') + '"><input type="checkbox" data-chk="' + it.key + '"' + (it.checked ? ' checked' : '') + '><span>' + e(it.text) + '</span></label>';
    const ex = S.ex(it.ex);
    return '<div class="chk' + (it.checked ? ' on' : '') + '"><input type="checkbox" data-chk="' + it.key + '"' + (it.checked ? ' checked' : '') + ' aria-label="Feito">' +
      '<div class="grow"><span class="ex-name" data-a="exercise" data-ex="' + e(it.ex) + '">' + e(ex.name) + '</span> <span class="muted small">' + U.fmtRange(it) + '</span>' +
      (it.note ? '<div class="muted small">' + e(it.note) + '</div>' : '') + '</div>' +
      (it.unit === 's' ? '<button class="ghost" data-a="w-chktime" data-key="' + it.key + '" title="Cronometrar">⏱</button>' : '') +
      '<button class="ghost" data-a="video" data-ex="' + e(it.ex) + '" title="Ver vídeo">▶</button></div>';
  }
  function block(b, bi) {
    let body = '';
    if (b.kind === 'forca') body = b.items.map(itemForca).join('');
    else if (b.kind === 'check') body = '<div class="card">' + b.items.map(itemCheck).join('') + '</div>';
    else if (b.kind === 'cardio') body = '<div class="card">' + (b.note ? '<p class="muted">' + e(b.note) + '</p>' : '') +
      '<div class="row"><button class="btn" data-a="w-cardio" data-b="' + bi + '">⏱ Iniciar ' + b.min + ' min</button>' +
      '<label class="inline">Minutos feitos <input type="number" inputmode="numeric" min="0" value="' + (b.minutes || '') + '" data-cardio="' + bi + '" placeholder="' + b.min + '–' + b.max + '"></label></div></div>';
    else if (b.kind === 'intervalado') body = '<div class="card">' + (b.note ? '<p class="muted">' + e(b.note) + '</p>' : '') +
      b.options.map((o, oi) => { const r = S.current.round === 1 && o.firstRounds ? o.firstRounds : o.rounds;
        return '<button class="btn block' + (b.doneOpt === o.name ? ' ok' : '') + '" data-a="w-interval" data-b="' + bi + '" data-o="' + oi + '">' + (b.doneOpt === o.name ? '✓ ' : '▶ ') + e(o.name) +
          '<span class="small"> — ' + r + ' × ' + o.work + ' s forte / ' + o.rest + ' s pausa</span></button>' +
          (o.labels.length > 1 ? '<div class="muted small">' + e(o.labels.join(' → ')) + '</div>' : ''); }).join('') + '</div>';
    return '<section><h3>' + e(b.title) + '</h3>' + (b.note && b.kind === 'forca' ? '<p class="muted small">' + e(b.note) + '</p>' : '') + body + '</section>';
  }

  W.view = () => {
    const c = S.current;
    if (!c) return '<div class="empty"><p>Nenhum treino em andamento.</p><a class="btn" href="#hoje">Ir para Hoje</a></div>';
    const tot = c.blocks.flatMap(b => b.kind === 'forca' ? b.items.flatMap(i => i.done) : b.kind === 'check' ? b.items.map(i => i.checked) : [!!(b.minutes || b.doneOpt)]);
    const pct = Math.round(100 * tot.filter(Boolean).length / Math.max(1, tot.length));
    return '<header class="wk-head"><div><div class="muted small">' + (c.type === 'flex' ? 'Dia leve — a fila não anda' : 'Volta ' + c.round + ' · Sessão ' + (c.sessionIdx + 1)) + (c.deload ? ' · <b>volta leve (metade das séries)</b>' : '') + '</div>' +
      '<h1>' + e(c.name) + '</h1></div></header><div class="bar"><i style="width:' + pct + '%"></i></div>' +
      c.blocks.map(block).join('') +
      '<div class="row end"><button class="btn danger ghosty" data-a="w-cancel">Descartar</button><button class="btn big" data-a="w-finish">Concluir treino</button></div>';
  };

  // ---------- eventos ----------
  document.addEventListener('input', ev => {
    const t = ev.target;
    if (!S.current) return;
    if (t.dataset.set) { const it = findItem(t.dataset.set); if (it) { it.vals[+t.dataset.i] = Math.max(0, Number(t.value) || 0); S.saveCurrent(); } }
    if (t.dataset.cardio) { S.current.blocks[+t.dataset.cardio].minutes = Number(t.value) || 0; S.saveCurrent(); }
  });
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (S.current && t.dataset.chk) { const it = findItem(t.dataset.chk); if (it) { it.checked = t.checked; rerender(); } }
  });
  A['w-set'] = d => {
    const it = findItem(d.key), i = +d.i;
    it.done[i] = !it.done[i];
    if (it.done[i]) { U.beep(880, 80); if (!(i === it.sets - 1 && !it.rest)) U.rest(it.rest || 60, S.ex(it.ex).name + (i < it.sets - 1 ? ' (série ' + (i + 2) + ')' : ' — próximo exercício')); }
    rerender();
  };
  A['w-hold'] = d => {
    const it = findItem(d.key), i = +d.i;
    U.hold(it.vals[i] || it.max, S.ex(it.ex).name, sec => { it.vals[i] = sec; it.done[i] = true; rerender(); U.rest(it.rest || 60, S.ex(it.ex).name); });
  };
  A['w-chktime'] = d => { const it = findItem(d.key); U.hold(it.max, S.ex(it.ex).name + (it.side ? ' (um lado)' : ''), () => { if (!it.side) { it.checked = true; rerender(); } }); };
  A['w-cardio'] = d => { const b = S.current.blocks[+d.b]; U.hold(b.min * 60, b.title, sec => { b.minutes = Math.max(1, Math.round(sec / 60)); rerender(); }); };
  A['w-interval'] = d => {
    const b = S.current.blocks[+d.b], o = b.options[+d.o], r = S.current.round === 1 && o.firstRounds ? o.firstRounds : o.rounds;
    U.interval(o, r, () => { b.doneOpt = o.name; rerender(); U.toast('Intervalado concluído!'); });
  };
  A['w-up'] = d => {
    const it = findItem(d.key), p = S.program();
    if (it.skill && !(S.state.swaps[p.id] || {})[d.key]) { S.state.skills[it.skill] = S.skillStep(it.skill) + 1; U.toast('Habilidade avançada: ' + S.ex(d.next).name); }
    else { (S.state.swaps[p.id] = S.state.swaps[p.id] || {})[d.key] = d.next; U.toast('Exercício trocado para ' + S.ex(d.next).name); }
    S.save(); swapInPlace(it, d.next);
  };
  function swapInPlace(it, exId) {
    it.ex = exId;
    const s = W.suggest(exId, it, 0);
    Object.assign(it, { vals: s.targets, hint: s.hint, up: false, done: Array(it.sets).fill(false) });
    rerender();
  }
  A['w-swap'] = d => {
    const it = findItem(d.key), cur = S.ex(it.ex);
    const list = S.allExercises().filter(x => x.cat === cur.cat && x.id !== it.ex).sort((a, b) => S.missing(a.id).length - S.missing(b.id).length || a.level - b.level);
    U.modal('<h2>Trocar ' + e(cur.name) + '</h2><p class="muted">A troca vale para as próximas vezes também.</p><div class="list">' +
      list.map(x => '<button class="list-item" data-a="w-swap-pick" data-key="' + d.key + '" data-ex="' + e(x.id) + '"><span>' + e(x.name) + (S.missing(x.id).length ? ' <small class="bad">falta: ' + e(S.missing(x.id).join(', ')) + '</small>' : '') + '</span><span class="tag lvl' + x.level + '">' + LEVELS[x.level] + '</span></button>').join('') +
      '</div><button class="btn ghosty" data-a="w-swap-pick" data-key="' + d.key + '" data-ex="">Voltar ao exercício original do programa</button>');
  };
  A['w-swap-pick'] = d => {
    const it = findItem(d.key), p = S.program(), sw = S.state.swaps[p.id] = S.state.swaps[p.id] || {};
    if (d.ex) sw[d.key] = d.ex; else delete sw[d.key];
    S.save(); U.closeModal();
    const [si, bi, ii] = d.key.split('.');
    const orig = si === 'f' ? it : p.sessions[+si].blocks[+bi].items[+ii];
    swapInPlace(it, d.ex || W.resolve(orig, p.id, d.key));
  };
  A['w-cancel'] = () => { if (confirm('Descartar este treino? Nada será registrado.')) { S.current = null; S.saveCurrent(); U.stopTimer(); U.wake(false); location.hash = '#hoje'; } };
  A['w-finish'] = () => {
    U.modal('<h2>Concluir treino</h2><p>Esforço percebido (1 = muito leve, 10 = máximo)</p><div class="rpe">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<button data-a="w-rpe" data-n="' + n + '">' + n + '</button>').join('') + '</div>' +
      '<label>Observações<textarea id="w-notes" rows="3" placeholder="Como foi? Dor, sono, energia…"></textarea></label>' +
      '<button class="btn big block" data-a="w-save">Salvar treino</button>');
  };
  A['w-rpe'] = (d, el) => { el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); el.parentNode.dataset.v = d.n; };
  A['w-save'] = () => {
    const c = S.current, items = [];
    c.blocks.forEach(b => {
      if (b.kind === 'forca') b.items.forEach(it => { const sets = it.vals.filter((v, i) => it.done[i]); if (sets.length) items.push({ ex: it.ex, unit: it.unit, sets, side: !!it.side }); });
      if (b.kind === 'cardio' && b.minutes) items.push({ ex: b.ex || 'caminhada', unit: 'min', sets: [b.minutes] });
    });
    const interval = c.blocks.map(b => b.doneOpt).filter(Boolean)[0] || null;
    const rpe = Number(U.$('.rpe').dataset.v) || null;
    S.state.logs.push({ id: S.uid(), t: Date.now(), date: c.date, programId: c.programId, round: c.round, sessionIdx: c.sessionIdx, sessionName: c.name, type: c.type,
      items, interval, rpe, notes: U.$('#w-notes').value.trim(), minutes: Math.max(1, Math.round((Date.now() - c.startedAt) / 60000)) });
    if (c.type === 'session' && c.programId === S.program().id) S.setPos(S.pos() + 1);
    S.current = null; S.saveCurrent(); S.save(); U.stopTimer(); U.wake(false);
    const ready = SKILLS.filter(sk => S.skillStep(sk.id) < sk.steps.length - 1 && S.critProgress(sk.steps[S.skillStep(sk.id)]) >= 2);
    const p = S.program();
    U.modal('<h2>Treino registrado 🎉</h2>' +
      (ready.length ? '<div class="hint up">Critério cumprido em 2 treinos seguidos: <b>' + ready.map(s => e(s.name)).join(', ') + '</b>. Avance em <a href="#habilidades" data-a="modal-close-go" data-go="#habilidades">Habilidades</a>.</div>' : '') +
      (S.finished() ? '<p>Você concluiu o programa inteiro! Suba o PDF do próximo treino em <b>Programa</b>.</p>'
        : '<p>Próxima da fila: <b>' + e(p.sessions[S.sessionIdx()].name) + '</b> (volta ' + S.round() + ').</p>') +
      '<button class="btn block" data-a="modal-close">Fechar</button>');
    location.hash = '#hoje';
  };
  A['modal-close-go'] = d => { U.closeModal(); location.hash = d.go; };
})();
