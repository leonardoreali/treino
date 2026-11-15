/* Utilidades de interface: formatação, som, timers, modal, vídeo e gráfico. */
(function () {
  const U = window.U = {};
  const A = window.A = {}; // ações de clique: <button data-a="nome">
  U.$ = (s, r) => (r || document).querySelector(s);
  U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.fmtDate = iso => { const [y, m, d] = iso.split('-'); return d + '/' + m + (y !== String(new Date().getFullYear()) ? '/' + y.slice(2) : ''); };
  U.fmtSec = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  U.unit = u => u === 's' ? ' s' : u === 'min' ? ' min' : '';
  U.fmtRange = it => it.unit === 's' && it.min >= 120 && it.min === it.max && it.min % 60 === 0 ? (it.sets > 1 ? it.sets + ' × ' : '') + it.min / 60 + ' min' : (it.sets > 1 ? it.sets + ' × ' : '') + it.min + (it.max > it.min ? '–' + it.max : '') + U.unit(it.unit) + (it.sets <= 1 && it.unit === 'reps' ? ' reps' : '') + (it.side ? ' cada lado' : '');

  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-a]');
    if (!el) return;
    const fn = A[el.dataset.a];
    if (fn) { ev.preventDefault(); fn(el.dataset, el, ev); }
  });

  // ---------- toast ----------
  let toastT;
  U.toast = msg => { const t = U.$('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200); };

  // ---------- som / vibração / tela ligada ----------
  let ac;
  U.beep = (freq, ms) => {
    if (ms >= 90 && window.MUSIC) MUSIC.duck();
    if (!S.cfg.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.25, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms / 1000);
      o.start(); o.stop(ac.currentTime + ms / 1000);
    } catch (e) {}
  };
  U.buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  let wake = null;
  U.wake = async on => {
    try {
      if (on && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
      if (!on && wake) { wake.release(); wake = null; }
    } catch (e) {}
  };

  // ---------- barra de timer (descanso / contagem de exercício) ----------
  let T = null;
  function stopBar() { if (T) { clearInterval(T.iv); T = null; } U.$('#timerbar').hidden = true; document.body.classList.remove('has-timer'); }
  function tick() {
    if (!T) return;
    const now = Date.now(), bar = U.$('#timerbar');
    if (now < T.prepEnd) {
      const p = Math.ceil((T.prepEnd - now) / 1000);
      if (T.last !== 'p' + p) { T.last = 'p' + p; U.beep(520, 90); }
      U.$('.tb-time', bar).textContent = p; U.$('.tb-label', bar).textContent = 'Prepare-se — ' + T.label;
      U.$('.tb-fill', bar).style.width = '0%';
      return;
    }
    const rem = Math.ceil((T.end - now) / 1000);
    U.$('.tb-time', bar).textContent = U.fmtSec(rem);
    U.$('.tb-label', bar).textContent = (T.kind === 'rest' ? 'Descanso' : 'Valendo') + ' — ' + T.label;
    U.$('.tb-fill', bar).style.width = Math.min(100, 100 * (1 - (T.end - now) / (T.total * 1000))) + '%';
    if (rem <= 3 && rem > 0 && T.last !== rem) { T.last = rem; U.beep(660, 110); }
    if (rem <= 0) { const cb = T.onDone, total = T.total; U.beep(990, 600); U.buzz([200, 100, 200]); stopBar(); cb && cb(total); }
  }
  function startBar(o) {
    stopBar();
    const now = Date.now(), prep = (o.prep || 0) * 1000;
    T = Object.assign({ prepEnd: now + prep, end: now + prep + o.seconds * 1000, total: o.seconds }, o);
    const bar = U.$('#timerbar');
    bar.className = 'timerbar ' + o.kind;
    bar.innerHTML = '<div class="tb-fill"></div><div class="tb-row"><div class="tb-time"></div><div class="tb-label"></div>' +
      (o.kind === 'rest' ? '<button data-a="timer-add">+30 s</button>' : '') + '<button data-a="timer-stop">' + (o.kind === 'rest' ? 'Pular' : 'Parar') + '</button></div>';
    bar.hidden = false; document.body.classList.add('has-timer');
    T.iv = setInterval(tick, 200); tick();
  }
  U.rest = (seconds, label) => { if (seconds > 0) startBar({ seconds, label: label || '', kind: 'rest' }); };
  U.hold = (seconds, label, onDone) => startBar({ seconds, label, kind: 'hold', prep: 5, onDone });
  U.stopTimer = stopBar;
  A['timer-add'] = () => { if (T) { T.end += 30000; T.total += 30; tick(); } };
  A['timer-stop'] = () => {
    if (!T) return;
    const cb = T.onDone, kind = T.kind, elapsed = Math.round((Date.now() - T.prepEnd) / 1000);
    stopBar();
    if (kind === 'hold' && cb && elapsed > 0) cb(elapsed);
  };

  // ---------- timer de intervalado (tela cheia) ----------
  let I = null;
  function iStop() { if (I) clearInterval(I.iv); I = null; U.$('#overlay').hidden = true; U.wake(!!S.current); }
  function iPhase() { // define a fase atual a partir do índice
    const o = I.o;
    if (I.idx < 0) return { name: 'PREPARE', cls: 'prep', dur: 5, label: 'Começa com: ' + o.labels[0] };
    const round = Math.floor(I.idx / 2), work = I.idx % 2 === 0;
    return { name: work ? 'FORTE' : 'PAUSA', cls: work ? 'work' : 'rest', dur: work ? o.work : o.rest, round,
      label: work ? o.labels[round % o.labels.length] : (round + 1 < I.rounds ? 'A seguir: ' + o.labels[(round + 1) % o.labels.length] : 'Última pausa') };
  }
  function iTick() {
    if (!I || I.paused) return;
    let ph = iPhase(), rem = Math.ceil((I.end - Date.now()) / 1000);
    if (rem <= 0) {
      I.idx++;
      if (I.idx >= I.rounds * 2 - 1) { const cb = I.onDone; U.beep(990, 900); U.buzz([300, 100, 300]); iStop(); cb && cb(); return; }
      ph = iPhase(); I.end = Date.now() + ph.dur * 1000; rem = ph.dur; I.last = null;
      U.beep(ph.cls === 'work' ? 990 : 440, 400); U.buzz(200);
    } else if (rem <= 3 && I.last !== rem) { I.last = rem; U.beep(660, 100); }
    const ov = U.$('#overlay');
    ov.className = 'overlay ' + ph.cls;
    U.$('.iv-phase', ov).textContent = ph.name;
    U.$('.iv-time', ov).textContent = rem;
    U.$('.iv-label', ov).textContent = ph.label;
    U.$('.iv-round', ov).textContent = 'Rodada ' + (Math.max(0, ph.round || 0) + 1) + ' de ' + I.rounds;
  }
  U.interval = (o, rounds, onDone) => {
    I = { o, rounds, onDone, idx: -1, end: Date.now() + 5000, paused: false };
    const ov = U.$('#overlay');
    ov.innerHTML = '<div class="iv-round"></div><div class="iv-phase"></div><div class="iv-time"></div><div class="iv-label"></div>' +
      '<div class="iv-btns"><button data-a="iv-pause">Pausar</button><button data-a="iv-stop">Encerrar</button></div>';
    ov.hidden = false; U.wake(true);
    I.iv = setInterval(iTick, 200); iTick();
  };
  A['iv-pause'] = (d, el) => {
    if (!I) return;
    if (I.paused) { I.end = Date.now() + I.left; I.paused = false; el.textContent = 'Pausar'; }
    else { I.left = I.end - Date.now(); I.paused = true; el.textContent = 'Continuar'; }
  };
  A['iv-stop'] = () => { if (confirm('Encerrar o intervalado?')) iStop(); };

  // ---------- modal ----------
  U.modal = html => { const m = U.$('#modal'); m.innerHTML = '<div class="modal-box"><button class="modal-x" data-a="modal-close" aria-label="Fechar">✕</button>' + html + '</div>'; m.hidden = false; };
  U.closeModal = () => { const m = U.$('#modal'); m.hidden = true; m.innerHTML = ''; };
  A['modal-close'] = U.closeModal;
  U.$('#modal').addEventListener('click', ev => { if (ev.target.id === 'modal') U.closeModal(); });

  // ---------- vídeo ----------
  U.ytId = url => { const m = String(url).match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/) || String(url).trim().match(/^([\w-]{11})$/); return m ? m[1] : null; };
  U.searchUrl = ex => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + ' como fazer tutorial');
  U.videoHtml = exId => {
    const ex = S.ex(exId), id = S.videoFor(exId);
    let v;
    if (!id) v = '<div class="novideo">Sem vídeo fixo para este exercício.</div>';
    else if (location.protocol === 'file:') v = '<a class="thumb" target="_blank" rel="noopener" href="https://www.youtube.com/shorts/' + id + '"><img alt="" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><span>▶ Abrir no YouTube</span></a>';
    else v = '<div class="' + ((window.VIDEO_WIDE || {})[exId] && !S.state.videos[exId] ? 'vid-wide' : 'short') + '"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?playsinline=1&rel=0&modestbranding=1" title="Vídeo do exercício" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    return v + '<div class="vid-links"><a target="_blank" rel="noopener" href="' + U.searchUrl(ex) + '">🔎 Buscar outros tutoriais</a>' +
      (S.cfg.ytKey ? '<button class="link" data-a="video-pick" data-ex="' + U.esc(exId) + '">Escolher vídeo</button>' : '') +
      '<button class="link" data-a="video-change" data-ex="' + U.esc(exId) + '">' + (S.cfg.ytKey ? 'Colar link' : 'Trocar vídeo') + '</button></div>';
  };
  U.showExercise = exId => {
    const ex = S.ex(exId), hist = S.logsFor(exId).slice(-5).reverse(), next = NEXT_VARIATION[exId];
    U.modal('<h2>' + U.esc(ex.name) + '</h2><div class="tags"><span class="tag">' + U.esc(CATEGORIES[ex.cat] || 'Outros') + '</span><span class="tag lvl' + ex.level + '">' + LEVELS[ex.level] + '</span>' +
      (ex.pat && window.PATTERNS ? '<span class="tag">' + U.esc(PATTERNS[ex.pat]) + '</span>' : '') + (ex.reg && window.REGIONS ? '<span class="tag">' + U.esc(REGIONS[ex.reg]) + '</span>' : '') + (ex.uni ? '<span class="tag">Unilateral</span>' : '') + (ex.mod && window.MODALITIES ? '<span class="tag">' + U.esc(MODALITIES[ex.mod]) + '</span>' : '') + '</div>' +
      (ex.sup ? '<div class="warn-box">⚠️ <b>Exige supervisão.</b> Treine só com professor ou alguém experiente segurando (spotter), em colchão grosso ou estrutura de ginástica. O app nunca coloca este exercício sozinho nos treinos.</div>' : '') +
      U.videoHtml(exId) + '<p>' + U.esc(ex.how) + '</p>' +
      (ex.dose ? '<p class="small"><b>Dose recomendada:</b> ' + U.fmtRange(ex.dose) + (ex.mod === 'estatica' ? ' · no fim do treino ou em dia separado' : ex.mod === 'ativa' ? ' · serve de aquecimento' : '') + '</p>' : '') +
      (ex.warn ? '<div class="warn-box"><span aria-hidden="true">⚠️</span> <span>' + U.esc(ex.warn) + '</span></div>' : '') +
      '<p class="small"><b>Equipamento:</b> ' + (S.needs(exId).length ? S.needs(exId).map(q => { const n = (S.allEquip().find(x => x.id === q) || { name: q }).name, ok = S.owned().includes(q); return '<span class="' + (ok ? 'good' : 'bad') + '">' + (ok ? '✓ ' : '✗ ') + U.esc(n) + '</span>'; }).join(' · ') : 'nenhum (peso do corpo)') + '</p>' +
      (next ? '<p class="muted">Ficou fácil? Próxima variação' + (S.ex(next).sup ? ' (exige supervisão)' : '') + ': <a href="#" data-a="exercise" data-ex="' + next + '">' + U.esc(S.ex(next).name) + '</a></p>' : '') +
      (hist.length ? '<h3>Últimos registros</h3><ul class="plain">' + hist.map(h => '<li><b>' + U.fmtDate(h.log.date) + '</b> — ' + h.item.sets.join(', ') + U.unit(h.item.unit) + (h.item.kg && h.item.kg.some(Number) ? ' @ ' + Math.max(...h.item.kg) + ' kg' : '') + '</li>').join('') + '</ul>' : ''));
  };
  A.exercise = d => U.showExercise(d.ex);
  A.video = d => U.showExercise(d.ex);
  A['video-change'] = d => {
    const url = prompt('Cole o link do vídeo/short do YouTube para este exercício.\n(Deixe vazio para voltar ao vídeo padrão.)');
    if (url === null) return;
    if (!url.trim()) delete S.state.videos[d.ex];
    else { const id = U.ytId(url); if (!id) return U.toast('Não reconheci esse link do YouTube.'); S.state.videos[d.ex] = id; }
    S.save(); U.showExercise(d.ex);
  };

  // ---------- busca de vídeos (opcional: precisa de uma chave gratuita da API do YouTube, colada em Ajustes) ----------
  U.ytSearch = async q => {
    const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&videoEmbeddable=true&maxResults=6&q=' + encodeURIComponent(q) + '&key=' + encodeURIComponent(S.cfg.ytKey));
    if (!r.ok) throw new Error(r.status === 403 || r.status === 400 ? 'chave inválida, sem permissão ou cota do dia esgotada' : 'o YouTube respondeu ' + r.status);
    return ((await r.json()).items || []).filter(i => i.id && i.id.videoId).map(i => ({ id: i.id.videoId, title: i.snippet.title, ch: i.snippet.channelTitle }));
  };
  const vq = ex => (ex.gym || EXERCISES.includes(ex) ? ex.q : ex.name + ' exercício execução') + ' shorts';
  A['video-pick'] = async d => {
    const ex = S.ex(d.ex);
    try {
      const rs = await U.ytSearch(vq(ex));
      if (!rs.length) return U.toast('Nenhum vídeo encontrado.');
      U.modal('<h2>Escolher vídeo — ' + U.esc(ex.name) + '</h2><div class="vgrid">' + rs.map(v => '<button data-a="video-set" data-ex="' + U.esc(d.ex) + '" data-id="' + v.id + '"><img alt="" src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg"><span>' + U.esc(v.title) + '</span><small class="muted">' + U.esc(v.ch) + '</small></button>').join('') + '</div>');
    } catch (e) { U.toast('Busca de vídeos falhou: ' + e.message); }
  };
  A['video-set'] = d => { S.state.videos[d.ex] = d.id; S.save(); U.showExercise(d.ex); };
  // Fixa o primeiro resultado para cada exercício novo. Devolve quantos conseguiu.
  U.autoVideos = async ids => {
    let n = 0;
    for (const id of ids) { try { const rs = await U.ytSearch(vq(S.ex(id))); if (rs[0]) { S.state.videos[id] = rs[0].id; n++; } } catch (e) { break; } }
    if (n) S.save(); return n;
  };

  // ---------- gráfico de linhas simples ----------
  U.chart = (canvas, series, opts) => {
    opts = opts || {};
    const css = getComputedStyle(document.documentElement), dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const c = canvas.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h);
    const labels = series[0] ? series[0].points.map(p => p.x) : [];
    const ys = series.flatMap(s => s.points.map(p => p.y)).filter(v => v != null);
    c.font = '11px system-ui, sans-serif'; c.fillStyle = css.getPropertyValue('--muted');
    if (!ys.length) { c.textAlign = 'center'; c.fillText('Sem dados ainda', w / 2, h / 2); return; }
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (lo === hi) { lo -= 1; hi += 1; }
    const padv = (hi - lo) * 0.15; lo = opts.zero ? 0 : Math.max(0, lo - padv); hi += padv;
    const L = 34, R = 10, Tp = 10, B = 22, pw = w - L - R, ph = h - Tp - B;
    // Com datas (p.t), o eixo horizontal é proporcional ao tempo: intervalos maiores entre treinos aparecem maiores.
    const pts0 = series[0] ? series[0].points : [], withT = pts0.length > 1 && pts0.every(q => q.t != null), timed = withT && pts0[pts0.length - 1].t - pts0[0].t >= 864e5, t0 = timed ? pts0[0].t : 0, t1 = timed ? pts0[pts0.length - 1].t : 1; // tudo no mesmo dia: espaça por ordem
    const X = i => L + (labels.length < 2 ? pw / 2 : timed ? pw * (pts0[i].t - t0) / Math.max(1, t1 - t0) : pw * i / (labels.length - 1)), Y = v => Tp + ph * (1 - (v - lo) / (hi - lo));
    c.strokeStyle = css.getPropertyValue('--line'); c.lineWidth = 1; c.textAlign = 'right';
    for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke(); c.fillText(Math.round(v * 10) / 10, L - 5, y + 4); }
    c.textAlign = 'center';
    if (timed) { // marcas de data espaçadas no tempo; com mais de um ano, mostra mês/ano
      const long = t1 - t0 > 330 * 864e5, nT = Math.max(2, Math.min(6, Math.floor(pw / 60)));
      for (let k = 0; k <= nT; k++) { const t = t0 + (t1 - t0) * k / nT, d = new Date(t); c.fillText(long ? String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear()).slice(2) : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'), L + pw * k / nT, h - 6); }
    } else {
      const stepL = Math.ceil(labels.length / Math.max(2, Math.floor(pw / 46)));
      labels.forEach((l, i) => { if (i % stepL === 0 || i === labels.length - 1) c.fillText(l, X(i), h - 6); });
    }
    series.forEach(s => {
      c.strokeStyle = c.fillStyle = s.color; c.lineWidth = 2; c.beginPath();
      let started = false;
      s.points.forEach((p, i) => { if (p.y == null) return; if (started) c.lineTo(X(i), Y(p.y)); else { c.moveTo(X(i), Y(p.y)); started = true; } });
      c.stroke();
      s.points.forEach((p, i) => { if (p.y == null) return; c.beginPath(); c.arc(X(i), Y(p.y), 3.2, 0, 7); c.fill(); });
    });
  };
})();
