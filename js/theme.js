/* Tela Hoje (visual novo, nível/XP, semana), questionário de primeira vez e "compartilhar o app". */
(function () {
  const e = U.esc;
  const APP_URL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'https://leonardoreali.github.io/treino/' : location.origin + location.pathname;
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const volume = l => (l.items || []).reduce((a, i) => a + i.sets.reduce((x, y) => x + y, 0), 0);

  // XP: 50 por treino + 10 por série + 2 por minuto de cardio. A cada 1000 XP sobe um nível.
  U.xp = () => S.state.logs.reduce((a, l) => a + 50 + (l.items || []).reduce((b, i) => b + (i.unit === 'min' ? i.sets[0] * 2 : i.sets.length * 10), 0), 0);
  U.thumb = exId => { const id = S.videoFor(exId); return id ? 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg' : ''; };
  function streak() {
    const days = new Set(S.state.logs.map(l => l.date)), d = new Date(); let n = 0;
    if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
    while (days.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // ================= HOJE =================
  V.hoje = () => {
    const p = S.program(), n = p.sessions.length, si = S.sessionIdx(), round = S.round(), logs = S.sortedLogs();
    const nome = ((S.state.profile || {}).nome || '').split(' ')[0];
    const days = new Set(logs.map(l => l.date)), today = S.today();
    let h = '<div class="eyebrow">' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + '</div><h1>' + (nome ? 'Bora, ' + e(nome) + '!' : 'Hoje') + '</h1>';
    if (S.current) h += '<div class="card hl"><b>Treino em andamento:</b> ' + e(S.current.name) + '<div class="row"><a class="btn" href="#treino">Continuar</a></div></div>';
    if (S.finished()) {
      h += '<div class="hero"><div class="eyebrow">Programa concluído</div><h2>Você fechou as ' + p.rounds + ' voltas! 🏆</h2><p>Hora do próximo ciclo: gere um treino novo pelo perfil, importe um PDF ou repita este.</p><div class="row wrap"><a class="btn big" href="#perfil">Gerar novo treino</a><a class="btn ghosty" href="#programa">Programas</a></div></div>';
    } else {
      const s = p.sessions[si], pct = Math.round(100 * S.pos() / (p.rounds * n)), C = 2 * Math.PI * 30;
      const same = logs.filter(l => l.type === 'session' && l.programId === p.id && l.sessionIdx === si).slice(0, 3);
      const caindo = same.length === 3 && volume(same[0]) < volume(same[1]) && volume(same[1]) < volume(same[2]);
      const pes = logs.filter(l => l.rpe).slice(0, 2), exausto = pes.length === 2 && pes.every(l => l.rpe >= 9);
      const fase = (p.phases || []).find(f => round >= f.from && round <= f.to);
      const blocks = s.blocks.filter(b => !b.phase2 || S.state.phase2);
      const nEx = blocks.filter(b => b.kind === 'forca').reduce((a, b) => a + b.items.length, 0);
      h += '<div class="hero"><div class="hero-top"><div><div class="eyebrow">Volta ' + round + ' de ' + p.rounds + ' · sessão ' + (si + 1) + '/' + n + '</div><h2>' + e(s.name) + '</h2></div>' +
        '<div class="ring" title="Progresso do programa"><svg viewBox="0 0 74 74"><circle class="bg" cx="37" cy="37" r="30"/>' + (pct ? '<circle class="fg" cx="37" cy="37" r="30" stroke-dasharray="' + (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : '') + '</svg><b>' + pct + '%</b></div></div>' +
        '<div class="pills">' + (s.duration ? '<span>⏱ ~' + s.duration + ' min</span>' : '') + (nEx ? '<span>' + nEx + ' exercícios</span>' : '') + blocks.filter(b => b.kind === 'cardio' || b.kind === 'intervalado').map(b => '<span>' + e(b.title) + '</span>').join('') +
        (S.isDeload() ? '<span>volta leve</span>' : '') + '</div>' +
        (S.current ? '' : '<div class="row wrap"><button class="btn big" data-a="start" data-type="session">▶ Começar treino</button><button class="btn ghosty" data-a="start" data-type="flex">Só alongar (10 min)</button></div>') +
        '<div class="muted small" style="margin-top:10px">' + e(p.name) + '</div></div>';
      if (fase) h += '<div class="hint">' + e(fase.label) + '</div>';
      if (S.isDeload()) h += '<div class="hint up">Volta leve: metade das séries e <a href="#evolucao" data-a="evo-tab" data-tab="testes">reteste dos números do início</a>.</div>';
      if (caindo || exausto) h += '<div class="hint warn">' + (caindo ? 'Seu desempenho nesta sessão caiu 2 vezes seguidas. ' : 'Seus 2 últimos treinos foram esforço 9–10. ') + 'Considere descansar hoje: faça só o alongamento.</div>';
      if (logs.some(l => l.date === today && l.type === 'session')) h += '<div class="hint">Você já treinou hoje. A próxima sessão fica para amanhã.</div>';
    }
    // nível + semana
    const xp = U.xp(), lvl = Math.floor(xp / 1000) + 1, week = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5), k = iso(d); week.push('<div>' + 'DSTQQSS'[d.getDay()] + '<i class="' + (days.has(k) ? 'on' : '') + (k === today ? ' today' : '') + '">' + (days.has(k) ? '✓' : d.getDate()) + '</i></div>'); }
    h += '<div class="card lvl-card"><div class="lvl-badge">' + lvl + '</div><div class="grow"><div class="row between"><b>Nível ' + lvl + '</b><span class="muted small">' + (xp % 1000) + ' / 1000 XP</span></div><div class="bar"><i style="width:' + (xp % 1000) / 10 + '%"></i></div></div></div>' +
      '<div class="card"><div class="week">' + week.join('') + '</div></div>' +
      (() => { const d = U.dietToday(); return '<a class="card lvl-card" href="#dieta" style="text-decoration:none;color:inherit"><div class="lvl-badge" style="background:var(--card2)">🍽️</div><div class="grow"><b>Diário alimentar</b><div class="muted small">' + (d.n ? 'Hoje: ' + d.kcal + ' kcal · ' + d.prot + ' g de proteína' : 'Anote o que você comeu hoje') + '</div></div><span class="muted">›</span></a>'; })() +
      '<div class="stats"><div><b>' + streak() + '</b><span>dias seguidos</span></div><div><b>' + logs.filter(l => l.date >= iso(new Date(Date.now() - 6 * 864e5))).length + '</b><span>treinos em 7 dias</span></div><div><b>' + logs.length + '</b><span>treinos no total</span></div></div>';
    if (!S.finished()) h += '<h3>Fila</h3><div class="card queue">' + p.sessions.map((x, i) => '<div class="q' + (i === si ? ' cur' : i < si ? ' past' : '') + '"><span class="q-n">' + (i + 1) + '</span><span>' + e(x.name) + '</span></div>').join('') + '</div>';
    return h + '<button class="btn ghosty block" data-a="app-share">💚 Indicar o app para alguém</button>';
  };

  // ================= COMPARTILHAR O APP =================
  A['app-share'] = () => {
    const text = 'Estou usando este app de treino gratuito: ele monta um treino sob medida (em casa ou na academia), tem vídeo de cada exercício, timers e acompanha a evolução. Abre direto no navegador e funciona sem internet:';
    if (navigator.share) return navigator.share({ title: 'Treino — app gratuito', text, url: APP_URL }).catch(() => {});
    SHARE.last = { text: text + '\n' + APP_URL, fone: '' };
    U.modal('<h2>Indicar o app</h2><textarea readonly rows="5" id="sh-text">' + e(SHARE.last.text) + '</textarea><button class="btn block" data-a="sh-wa">Enviar pelo WhatsApp</button><button class="btn ghosty block" data-a="sh-copy">Copiar</button>');
  };

  // ================= PRIMEIRA VEZ =================
  let step = 1;
  V.inicio = () => {
    const dots = '<div class="dots"><i class="on"></i><i class="' + (step > 1 ? 'on' : '') + '"></i></div>';
    if (step === 1) return '<div class="onb">' + dots + '<h1>Bem-vindo ao <b>Treino</b></h1><p class="muted">Primeiro, conte um pouco sobre você. Leva um minuto, fica só no seu aparelho e dá para mudar depois.</p>' +
      '<div class="card">' + PEOPLE.form(S.state.profile || {}) + '</div><div class="row end wrap"><button class="link" data-a="onb-skip">Pular por enquanto</button><button class="btn big" data-a="onb-next">Continuar</button></div></div>';
    return '<div class="onb">' + dots + '<h1>Como você quer <b>treinar</b>?</h1><p class="muted">Escolha um caminho. Dá para trocar depois em Programa.</p>' +
      '<button class="choice" data-a="onb-go" data-to="auto"><span class="em">⚡</span><span><b>Montar um treino para mim</b><small>O app cria o treino a partir das suas respostas e dos seus equipamentos.</small></span></button>' +
      '<button class="choice" data-a="onb-go" data-to="manual"><span class="em">✍️</span><span><b>Quero montar o meu</b><small>Você escolhe as sessões e os exercícios, com a biblioteca para ajudar.</small></span></button>' +
      '<button class="choice" data-a="onb-go" data-to="tenho"><span class="em">📄</span><span><b>Já tenho um treino</b><small>Importe por PDF, foto da ficha ou texto — ou abra o link que seu professor mandou.</small></span></button>' +
      '<button class="choice" data-a="onb-go" data-to="exemplo"><span class="em">👀</span><span><b>Só quero olhar</b><small>Entrar com o programa de exemplo (calistenia em casa).</small></span></button>' +
      '<div class="row"><button class="link" data-a="onb-back">← Voltar</button></div></div>';
  };
  const finish = () => { S.state.onboarded = true; S.save(); step = 1; };
  A['onb-next'] = () => { PEOPLE.saveProfile(); step = 2; APP.render(); window.scrollTo(0, 0); };
  A['onb-back'] = () => { step = 1; APP.render(); };
  A['onb-skip'] = () => { step = 2; APP.render(); };
  A['onb-go'] = d => {
    const p = S.state.profile; finish();
    if (d.to === 'auto') { if (!p) { U.toast('Preencha o perfil para gerar o treino.'); return void (location.hash = '#perfil'); } PEOPLE.preview = { prog: GEN.generate(p), alunoId: null }; location.hash = '#previa'; }
    else if (d.to === 'manual') { V.ui.draft = { name: 'Meu treino', rounds: 12, flex: true, sessions: [{ name: 'Treino A', items: [{ name: '', sets: 3, min: 8, max: 12, unit: 'reps' }] }] }; location.hash = '#programa'; }
    else if (d.to === 'tenho') { location.hash = '#programa'; setTimeout(() => { const el = U.$('#pdf-file'); if (el) el.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' }); U.toast('Escolha: PDF, foto da ficha ou colar texto.'); }, 250); }
    else location.hash = '#hoje';
  };
  // Primeira abertura: sem perfil, sem treinos e sem ter passado pelo questionário.
  U.needsOnboarding = () => !S.state.onboarded && !S.state.profile && !S.state.logs.length && Object.keys(S.state.programs).length <= 1 && !S.cfg.token;
})();
