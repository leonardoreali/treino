/* Adaptação automática por regras (sem IA):
   - antes do treino: como a pessoa está (bem / cansada / com dor ou lesão);
   - depois do treino: o que achou (fácil / na medida / pesado) e se sentiu dor;
   - o próximo treino muda séries, metas e exercícios a partir disso. */
(function () {
  const e = U.esc;
  const AREAS = GEN.LIMITS;
  const TIMED = /prancha|wall-sit|hollow|superman|dead-hang|isometria|lsit|parada|planche|lever|tuck|vsit/;
  // Com lesão em tratamento não se troca por um exercício parecido: sai tudo que usa a região.
  const UPPER = ['ombro', 'cotovelo', 'punho'], LOWER = ['joelho', 'tornozelo', 'quadril'];
  const INJ_CATS = { ombro: ['empurrar', 'puxar', 'habilidade'], cotovelo: ['empurrar', 'puxar', 'habilidade'], punho: ['empurrar', 'puxar', 'habilidade'], joelho: ['pernas'], tornozelo: ['pernas'], quadril: ['pernas'], lombar: ['pernas', 'core'], pescoco: ['habilidade'] };
  let today = { tired: false, pain: [], injury: false }; // respostas do "antes de começar"

  const sessLogs = (pid, si) => S.sortedLogs().filter(l => l.programId === pid && l.type === 'session' && l.sessionIdx === si && l.feel);
  // +1 série depois de 2 "fácil" seguidos na mesma sessão; −1 depois de 2 "pesado" (ou 1 pesado com esforço 9–10).
  const sessAdj = (pid, si) => {
    const [a, b] = sessLogs(pid, si); if (!a) return 0;
    if (a.feel === 'facil' && b && b.feel === 'facil') return 1;
    if (a.feel === 'pesado' && ((b && b.feel === 'pesado') || a.rpe >= 9)) return -1;
    return 0;
  };
  // Dor relatada nos últimos 7 dias (em qualquer treino).
  const recentPain = () => { const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10); return [...new Set(S.state.logs.filter(l => l.date >= since).flatMap(l => l.pain || []))]; };
  const avoidSet = areas => new Set(areas.flatMap(a => (GEN.AVOID[a] || '').split(' ')));
  const names = areas => areas.map(a => (AREAS[a] || a).toLowerCase()).join(', ');
  function alternative(it, avoid, used) {
    const ex = S.ex(it.ex);
    const c = S.allExercises().filter(x => x.cat === ex.cat && x.id !== it.ex && !x.sup && !avoid.has(x.id) && !used.has(x.id) && !S.missing(x.id).length && x.level <= Math.max(2, ex.level) && (it.unit !== 'reps' || !TIMED.test(x.id)) && (it.unit === 'reps' || TIMED.test(x.id)));
    const samePat = x => ex.pat && x.pat === ex.pat ? 0 : 1;
    c.sort((a, b) => samePat(a) - samePat(b) || (!!a.w === !!ex.w ? 0 : 1) - (!!b.w === !!ex.w ? 0 : 1) || Math.abs(a.level - ex.level) - Math.abs(b.level - ex.level));
    return c[0];
  }
  const resize = (it, n) => { it.sets = n; for (const k of ['vals', 'done', 'kgs']) if (it[k]) { const last = it[k][it[k].length - 1]; it[k] = Array.from({ length: n }, (_, i) => i < it[k].length ? it[k][i] : (k === 'done' ? false : last)); } };

  // ---------- metas: leva em conta o que a pessoa achou da última vez ----------
  const suggest0 = W.suggest;
  W.suggest = (ex, it, gap) => {
    const r = suggest0(ex, it, gap), hist = S.logsFor(ex).filter(h => h.item.unit === it.unit), last = hist[hist.length - 1];
    if (!last || !last.log.feel || r.up) return r;
    const prev = last.item.sets, clamp = v => Math.max(it.min, Math.min(it.max, v));
    if (last.log.feel === 'pesado') { r.targets = r.targets.map((t, i) => clamp(prev[i] == null ? prev[prev.length - 1] : prev[i])); r.hint = (r.hint || '').replace(/Tente \+\d+ por série\.|Mesma carga, tente \+1 repetição por série\./, '') + ' Você achou pesado da última vez: repita os mesmos números antes de subir.'; }
    else if (last.log.feel === 'facil' && it.min !== it.max) { r.targets = r.targets.map(t => clamp(t + 1)); r.hint = (r.hint || '') + ' Você achou fácil: meta um pouco maior hoje.'; }
    return r;
  };

  // ---------- montagem do treino: séries, trocas por dor, avisos ----------
  const build0 = W.build;
  W.build = (type, forced) => {
    build0(type, forced);
    const c = S.current; if (!c || type !== 'session') { today = { tired: false, pain: [], injury: false }; return; }
    const notes = [], adj = sessAdj(c.programId, c.sessionIdx), areas = [...new Set(today.pain.concat(recentPain()))], avoid = avoidSet(areas);
    const delta = adj + (today.tired ? -1 : 0);
    if (adj > 0) notes.push('Você achou esta sessão fácil nas 2 últimas vezes: <b>+1 série</b> nos exercícios.');
    if (adj < 0) notes.push('Esta sessão vinha pesada demais: <b>−1 série</b> até ficar na medida.');
    if (today.tired) notes.push('Dia de cansaço: <b>−1 série</b> hoje. Fazer menos é melhor do que não fazer.');
    const used = new Set(c.blocks.flatMap(b => (b.items || []).map(i => i.ex)));
    const injAreas = today.injury ? today.pain : [], injCats = new Set(injAreas.flatMap(a => INJ_CATS[a] || [])), injUpper = injAreas.some(a => UPPER.includes(a)), injLower = injAreas.some(a => LOWER.includes(a));
    const removed = [];
    if (injLower) c.blocks = c.blocks.filter(b => { if (b.kind === 'cardio' || b.kind === 'intervalado') { removed.push(b.title); return false; } return true; });
    c.blocks.forEach(b => {
      if (b.kind === 'forca') {
        b.items = b.items.filter(it => {
          if (today.injury && (injCats.has(S.ex(it.ex).cat) || avoid.has(it.ex) || (injUpper && S.needs(it.ex).includes('barra')))) { removed.push(S.ex(it.ex).name); return false; }
          if (avoid.has(it.ex)) {
            const alt = alternative(it, avoid, used), orig = S.ex(it.ex).name;
            if (alt) { used.add(alt.id); it.ex = alt.id; delete it.skill; const s = suggest0(alt.id, it, 0); Object.assign(it, { vals: s.targets, up: false, done: Array(it.sets).fill(false), kgs: alt.w ? Array(it.sets).fill(s.kg || '') : null, hint: 'Trocado hoje por causa da dor (' + names(areas) + '). Original: ' + orig + '. Se preferir, troque em ⇄.' }); }
            else it.hint = '⚠ Pode incomodar (' + names(areas) + '): faça leve, com menos amplitude, ou pule. ' + (it.hint || '');
          }
          if (delta) resize(it, Math.max(Math.min(2, it.sets), Math.min(6, it.sets + delta)));
          return true;
        });
      } else if (b.kind === 'check') b.items.forEach(it => { if (it.ex && avoid.has(it.ex)) it.note = '⚠ Pule ou faça bem leve (' + names(areas) + ').'; });
      else if (b.kind === 'intervalado' && areas.some(a => ['joelho', 'tornozelo', 'quadril', 'lombar'].includes(a))) b.note = '⚠ Com dor em ' + names(areas) + ', troque os saltos por marcha rápida no lugar ou pule o intervalado. ' + (b.note || '');
    });
    // dor ou lesão em ombro, cotovelo ou punho: sem exercícios de apoio nas mãos no intervalado
    if (areas.some(a => UPPER.includes(a))) c.blocks.forEach(b => (b.options || []).forEach(o => { const l = o.labels.filter(x => !/burpee|mountain/i.test(x)); o.labels = l.length ? l : ['Marcha rápida no lugar']; }));
    if (removed.length) notes.push('Tirei do treino de hoje, por envolver a região lesionada: <b>' + e(removed.join(', ')) + '</b>.');
    c.blocks = c.blocks.filter(b => b.kind !== 'forca' || b.items.length);
    if (areas.length) notes.unshift('Dor em <b>' + e(names(areas)) + '</b>: troquei ou marquei os exercícios que costumam forçar a região.');
    if (today.injury) notes.unshift('<b>Lesão, fratura ou cirurgia recente:</b> só treine a região afetada com liberação do médico ou fisioterapeuta. Na dúvida, não faça.');
    c.adaptNotes = notes; c.pre = { tired: today.tired, pain: today.pain, injury: today.injury };
    today = { tired: false, pain: [], injury: false };
    S.saveCurrent();
  };
  const view0 = W.view;
  W.view = () => { const h = view0(), c = S.current; return c && c.adaptNotes && c.adaptNotes.length ? h.replace('<section>', '<div class="card hl"><b>Treino adaptado para hoje</b><ul class="small" style="margin:6px 0 0;padding-left:18px">' + c.adaptNotes.map(n => '<li>' + n + '</li>').join('') + '</ul></div><section>') : h; };

  // ---------- antes de começar ----------
  const start0 = A.start;
  let pending = null;
  A.start = d => {
    if (S.current || d.type !== 'session') return start0(d);
    pending = { type: d.type, si: d.si };
    const rp = recentPain();
    U.modal('<h2>Antes de começar</h2><p class="muted">Como você está hoje? O treino se ajusta à resposta.</p>' +
      '<button class="choice" data-a="pre-go" data-how="ok"><span class="em">💪</span><span><b>Bem</b><small>Treino normal.</small></span></button>' +
      '<button class="choice" data-a="pre-go" data-how="tired"><span class="em">😴</span><span><b>Cansado ou dormi mal</b><small>Treino mais leve: uma série a menos.</small></span></button>' +
      '<div class="card"><b>🤕 Com dor ou lesão</b><p class="muted small">Marque onde. O app troca ou sinaliza os exercícios que forçam a região.</p><div class="chips" id="pre-pain" style="flex-wrap:wrap">' +
      Object.entries(AREAS).map(a => '<button data-a="chip-toggle" data-v="' + a[0] + '">' + a[1] + '</button>').join('') + '</div>' +
      (rp.length ? '<p class="muted small">Dor registrada nos últimos 7 dias (' + e(names(rp)) + ') já está sendo considerada. Marque acima só o que estiver doendo hoje.</p>' : '') +
      '<label class="chk"><input type="checkbox" id="pre-inj"><span>É fratura, cirurgia recente ou lesão em tratamento</span></label>' +
      '<button class="btn block" data-a="pre-go" data-how="pain">Adaptar o treino de hoje</button></div>' +
      '<p class="muted small">Dor forte, inchaço, formigamento ou dor no peito: não treine e procure atendimento.</p>');
  };
  A['chip-toggle'] = (d, el) => el.classList.toggle('on');
  A['pre-go'] = d => {
    today = { tired: d.how === 'tired', pain: [], injury: false };
    if (d.how === 'pain') {
      today.pain = [...document.querySelectorAll('#pre-pain .on')].map(b => b.dataset.v); today.injury = U.$('#pre-inj').checked;
      if (!today.pain.length && !recentPain().length) return U.toast('Marque onde é a dor.');
    }
    U.closeModal(); start0(pending || { type: 'session' });
  };

  // ---------- depois do treino ----------
  const finish0 = A['w-finish'];
  A['w-finish'] = (d, el, ev) => {
    finish0(d, el, ev);
    const btn = U.$('.modal-box [data-a="w-save"]'); if (!btn || !S.current || S.current.type !== 'session') return;
    const pre = (S.current.pre && S.current.pre.pain) || [];
    btn.insertAdjacentHTML('beforebegin', '<p style="margin-top:14px"><b>O que você achou do treino?</b></p><div class="chips" id="fb-feel" style="flex-wrap:wrap">' +
      [['facil', '😌 Fácil demais'], ['ok', '💪 Na medida'], ['pesado', '🥵 Pesado demais']].map(o => '<button data-a="fb-feel" data-v="' + o[0] + '" class="' + (o[0] === 'ok' ? 'on' : '') + '">' + o[1] + '</button>').join('') + '</div>' +
      '<p><b>Sentiu dor em algum lugar?</b> <span class="muted small">Dor de verdade, não o cansaço normal do músculo.</span></p><div class="chips" id="fb-pain" style="flex-wrap:wrap">' +
      Object.entries(AREAS).map(a => '<button data-a="chip-toggle" data-v="' + a[0] + '">' + a[1] + '</button>').join('') + '</div>');
  };
  A['fb-feel'] = (d, el) => el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
  const save0 = A['w-save'];
  A['w-save'] = (d, el, ev) => {
    const c = S.current, isSession = c && c.type === 'session';
    const feel = isSession && U.$('#fb-feel .on') ? U.$('#fb-feel .on').dataset.v : null, pain = isSession ? [...document.querySelectorAll('#fb-pain .on')].map(b => b.dataset.v) : [];
    const n = S.state.logs.length;
    save0(d, el, ev);
    if (!isSession || S.state.logs.length === n) return;
    const log = S.state.logs[S.state.logs.length - 1];
    log.feel = feel; if (pain.length) log.pain = pain; if (c.pre && (c.pre.tired || c.pre.injury)) log.pre = c.pre; log.t = Date.now();
    S.save();
    // conta para a pessoa o que muda
    const msgs = [], adj = sessAdj(c.programId, c.sessionIdx), nome = '<b>' + e(c.name) + '</b>';
    if (adj > 0) msgs.push('Duas vezes fácil: no próximo ' + nome + ' entra <b>+1 série</b>. Se sobrar, suba a variação ou a carga.');
    else if (adj < 0) msgs.push('Ficou pesado demais: o próximo ' + nome + ' vem com <b>−1 série</b> até ficar na medida.');
    else if (feel === 'pesado') msgs.push('Anotado: na próxima vez as metas repetem os números de hoje, sem aumentar.');
    else if (feel === 'facil') msgs.push('Anotado: metas um pouco maiores na próxima. Se achar fácil de novo, entra +1 série.');
    if (pain.length) {
      const repeat = S.sortedLogs().slice(1, 4).some(l => (l.pain || []).some(a => pain.includes(a)));
      msgs.push('Dor em <b>' + e(names(pain)) + '</b>: nos próximos 7 dias o app troca ou sinaliza os exercícios que forçam a região.' + (repeat ? ' <b>É a segunda vez recente — vale procurar um médico ou fisioterapeuta</b> (UBS atende de graça).' : ' Se continuar por mais de alguns dias, procure um médico ou fisioterapeuta.'));
    }
    const box = U.$('#modal .modal-box'), close = box && box.querySelector('[data-a="modal-close"].btn');
    if (close && msgs.length) close.insertAdjacentHTML('beforebegin', '<div class="hint up"><b>Como o app vai se adaptar</b><ul style="margin:6px 0 0;padding-left:18px">' + msgs.map(m => '<li>' + m + '</li>').join('') + '</ul></div>');
  };
})();
