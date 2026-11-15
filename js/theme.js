/* Tela Hoje (visual novo, nível/XP, semana), questionário de primeira vez e "compartilhar o app". */
(function () {
  const e = U.esc;
  const APP_URL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'https://leonardoreali.github.io/treino/' : location.origin + location.pathname;
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  // XP: bônus de 50 por treino completo, 25 por parcial e 15 por atividade leve (alongamento), mais 10 por série feita
  // e 2 por minuto de cardio. A cada 1000 XP sobe um nível.
  U.xpOf = l => (l.type === 'session' ? (l.partial ? 25 : 50) : 15) + (l.items || []).reduce((b, i) => b + (i.unit === 'min' ? i.sets[0] * 2 : i.sets.length * 10), 0);
  U.xp = () => S.state.logs.reduce((a, l) => a + U.xpOf(l), 0);
  U.thumb = exId => { const id = S.videoFor(exId); return id ? 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg' : ''; };
  // Dias seguidos com qualquer atividade (treino, parcial ou alongamento).
  function streak() {
    const days = new Set(S.state.logs.map(l => l.date)), d = new Date(); let n = 0;
    if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
    while (days.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // ================= HOJE =================
  // Esta é a única implementação da tela Hoje. js/progress.js e js/health.js apenas acrescentam blocos a ela
  // (cartão de evolução, avisos de tempo parado, saúde), envolvendo esta função — para mudar a tela, edite aqui.
  V.hoje = () => {
    const p = S.program(), n = p.sessions.length, mode = S.mode(), ti = S.todayIdx(), si = Math.max(0, ti), round = S.round(), logs = S.sortedLogs();
    const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const nome = ((S.state.profile || {}).nome || '').split(' ')[0];
    const days = new Set(logs.map(l => l.date)), today = S.today();
    let h = '<div class="eyebrow">' + new Date().toLocaleDateString((window.I18N && I18N.locale || 'pt-BR'), { weekday: 'long', day: 'numeric', month: 'long' }) + '</div><h1>' + (nome ? 'Bora, ' + e(nome) + '!' : 'Hoje') + '</h1>';
    if (S.current) h += '<div class="card hl"><b>Treino em andamento:</b> ' + e(S.current.name) + '<div class="row"><a class="btn" href="#treino">Continuar</a></div></div>';
    if (S.finished()) {
      h += '<div class="hero"><div class="eyebrow">Programa concluído</div><h2>Você fechou as ' + p.rounds + ' voltas! 🏆</h2><p>Hora do próximo ciclo: gere um treino novo pelo perfil, importe um PDF ou repita este.</p><div class="row wrap"><a class="btn big" href="#perfil">Gerar novo treino</a><a class="btn ghosty" href="#programa">Programas</a></div></div>';
    } else if (mode === 'dias' && ti < 0) {
      const nx = S.nextDay(), feito = logs.some(l => l.date === today && l.type === 'session');
      h += '<div class="hero"><div class="eyebrow">' + (feito ? 'Treino de hoje concluído' : 'Dia de descanso') + '</div><h2>' + (feito ? 'Mandou bem! 💪' : 'Hoje é descanso 😌') + '</h2><p>' + (nx ? 'Próximo treino: <b>' + e(nx.name) + '</b> — ' + (nx.k === 1 ? 'amanhã' : nx.day) + '.' : 'Nenhum dia marcado: escolha os dias em Programa.') + '</p>' +
        (S.current ? '' : '<div class="row wrap"><button class="btn" data-a="start" data-type="flex">Só alongar (10 min)</button><a class="btn ghosty" href="#programa">Mudar os dias</a></div>') + '</div>';
    } else {
      const s = p.sessions[si], pct = Math.round(100 * S.pos() / (p.rounds * n)), C = 2 * Math.PI * 30;
      // Queda: compara cada exercício com ele mesmo (mesma unidade), só com 3 ou mais registros.
      const last = logs.find(l => l.type === 'session' && l.programId === p.id && l.sessionIdx === si);
      const tracked = last ? (last.items || []).filter(i => i.unit !== 'min' && window.PROG && PROG.series(i.ex).length >= 3) : [];
      const quedas = tracked.filter(i => PROG.status(PROG.series(i.ex)) === 'caindo');
      const caindo = tracked.length >= 2 && quedas.length >= Math.max(2, Math.ceil(tracked.length / 2));
      const pes = logs.filter(l => l.rpe).slice(0, 2), exausto = pes.length === 2 && pes.every(l => l.rpe >= 9);
      const fase = (p.phases || []).find(f => round >= f.from && round <= f.to);
      const blocks = s.blocks.filter(b => !b.phase2 || S.state.phase2);
      const nEx = blocks.filter(b => b.kind === 'forca').reduce((a, b) => a + b.items.length, 0);
      h += '<div class="hero' + (p.endless ? ' endless' : '') + '"><div class="hero-top"><div><div class="eyebrow">' + (mode === 'livre' ? 'Sugestão de hoje' : mode === 'dias' ? 'Treino de ' + WD[new Date().getDay()] : 'Sessão ' + (si + 1) + '/' + n) + (p.endless ? ' · treino nº ' + (S.pos() + 1) : ' · volta ' + round + ' de ' + p.rounds) + '</div><h2>' + e(s.name) + '</h2></div>' +
        '<div class="ring" title="Progresso do programa"><svg viewBox="0 0 74 74"><circle class="bg" cx="37" cy="37" r="30"/>' + (pct ? '<circle class="fg" cx="37" cy="37" r="30" stroke-dasharray="' + (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : '') + '</svg><b>' + pct + '%<small>do programa</small></b></div></div>' +
        '<div class="pills">' + (s.duration ? '<span>⏱ ~' + s.duration + ' min</span>' : '') + (nEx ? '<span>' + nEx + ' exercícios</span>' : '') + blocks.filter(b => b.kind === 'cardio' || b.kind === 'intervalado').map(b => '<span>' + e(b.title) + '</span>').join('') +
        (S.isDeload() ? '<span>volta leve</span>' : '') + '</div>' +
        (S.current ? '' : '<div class="row wrap"><button class="btn big" data-a="start" data-type="session" data-si="' + si + '">▶ Começar treino</button><button class="btn ghosty" data-a="start" data-type="flex">Só alongar (10 min)</button></div>') +
        '<div class="muted small" style="margin-top:10px">' + e(p.name) + '</div></div>';
      if (fase) h += '<div class="hint">' + e(fase.label) + '</div>';
      if (S.isDeload()) h += '<div class="hint up">Volta leve: metade das séries e <a href="#evolucao" data-a="evo-tab" data-tab="testes">reteste dos números do início</a>.</div>';
      if (caindo || exausto) h += '<div class="hint warn">' + (caindo ? 'Caíram 2 treinos seguidos: ' + e(quedas.map(i => S.ex(i.ex).name).join(', ')) + '. ' : 'Seus 2 últimos treinos foram esforço 9–10. ') + 'Pode ser cansaço acumulado: considere descansar hoje ou fazer só o alongamento.</div>';
      if (logs.some(l => l.date === today && l.type === 'session')) h += '<div class="hint">Você já treinou hoje. A próxima sessão fica para amanhã.</div>';
    }
    // nível + semana
    const xp = U.xp(), lvl = Math.floor(xp / 1000) + 1, week = [];
    const kind = k => { const ls = logs.filter(l => l.date === k); return ls.some(l => l.type === 'session' && !l.partial) ? 'on' : ls.some(l => l.type === 'session') ? 'part' : ls.length ? 'lite' : ''; };
    const SYM = { on: '✓', part: '◐', lite: '·' }, NAME = { on: 'treino completo', part: 'treino parcial', lite: 'atividade leve' };
    for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5), k = iso(d), kd = kind(k); week.push('<div>' + d.toLocaleDateString((window.I18N && I18N.locale || 'pt-BR'), { weekday: 'narrow' }).toUpperCase() + '<i class="' + kd + (k === today ? ' today' : '') + '" title="' + (NAME[kd] || 'sem atividade') + '" aria-label="' + d.toLocaleDateString((window.I18N && I18N.locale || 'pt-BR'), { weekday: 'long' }) + ': ' + (NAME[kd] || 'sem atividade') + '">' + (SYM[kd] || d.getDate()) + '</i></div>'); }
    // meta da semana (segunda a domingo): treinos por semana do perfil, dos dias marcados ou do programa
    const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7)); const monK = iso(mon);
    const goal = mode === 'dias' ? new Set(p.sessions.flatMap(x => x.days || [])).size || n : Math.min(7, +((S.state.profile || {}).dias) || n);
    const weekS = logs.filter(l => l.date >= monK && l.type === 'session'), full = weekS.filter(l => !l.partial).length, part = weekS.length - full;
    const monthK = today.slice(0, 8) + '01', monthFull = logs.filter(l => l.date >= monthK && l.type === 'session' && !l.partial).length;
    h += '<div class="card lvl-card"><div class="lvl-badge">' + lvl + '</div><div class="grow"><div class="row between"><b>Nível ' + lvl + '</b><span class="muted small">' + (xp % 1000) + ' / 1000 XP</span></div><div class="bar"><i style="width:' + (xp % 1000) / 10 + '%"></i></div></div></div>' +
      '<div class="card"><div class="row between"><b>Meta da semana</b><span class="small">' + weekS.length + ' de ' + goal + ' treinos' + (part ? ' <span class="muted">(' + part + ' parcial' + (part > 1 ? 'is' : '') + ')</span>' : '') + '</span></div><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + goal + '" aria-valuenow="' + weekS.length + '"><i style="width:' + Math.min(100, 100 * weekS.length / goal) + '%"></i></div>' +
        '<div class="week">' + week.join('') + '</div><div class="legend small"><span>✓ completo</span><span>◐ parcial</span><span>· leve / alongamento</span></div></div>' +
      (() => { const d = U.dietToday(); return '<a class="card lvl-card" href="#dieta" style="text-decoration:none;color:inherit"><div class="lvl-badge" style="background:var(--card2)">🍽️</div><div class="grow"><b>Diário alimentar</b><div class="muted small">' + (d.n ? 'Hoje: ' + d.kcal + ' kcal · ' + d.prot + ' g de proteína' : 'Anote o que você comeu hoje') + '</div></div><span class="muted">›</span></a>'; })() +
      '<div class="stats"><div><b>' + streak() + '</b><span>dias ativos seguidos</span></div><div><b>' + monthFull + '</b><span>treinos completos no mês</span></div><div><b>' + logs.filter(l => l.type === 'session').length + '</b><span>treinos desde o início</span></div></div>';
    if (!S.finished()) h += mode === 'fila' ? '<h3>Fila</h3><div class="card queue">' + p.sessions.map((x, i) => '<div class="q' + (i === si ? ' cur' : i < si ? ' past' : '') + '"><span class="q-n">' + (i + 1) + '</span><span>' + e(x.name) + '</span></div>').join('') + '</div>'
      : '<h3>' + (mode === 'dias' ? 'Semana' : 'Escolher treino') + '</h3><div class="card queue">' + p.sessions.map((x, i) => '<div class="q' + (i === ti ? ' cur' : '') + '"><span class="q-n">' + 'ABCDEFGHIJ'[i] + '</span><span class="grow">' + e(x.name) + '<br><small class="muted">' + (mode === 'dias' ? ((x.days || []).map(d => WD[d]).join(', ') || 'sem dia marcado') : (S.lastDone(i) ? 'último: ' + U.fmtDate(S.lastDone(i)) : 'ainda não feito')) + '</small></span>' +
        (S.current ? '' : '<button class="btn small ghosty" data-a="start" data-type="session" data-si="' + i + '">Fazer</button>') + '</div>').join('') + '</div>';
    return h + '<button class="btn ghosty block" data-a="app-share">💚 Indicar o app para alguém</button>';
  };

  // ================= APARÊNCIA (cores escolhidas pela pessoa, guardadas no aparelho) =================
  const PRESETS = [['Limão', '#c8f53c', '#7c5cff'], ['Laranja', '#ff7a1a', '#4aa8ff'], ['Azul', '#4da3ff', '#ff5fa2'], ['Roxo', '#a78bfa', '#34d399'], ['Rosa', '#ff5fa2', '#7c5cff'], ['Vermelho', '#ff5a52', '#ffc857'], ['Verde-água', '#2dd4bf', '#f59e0b'], ['Dourado', '#f5c542', '#60a5fa']];
  const MODES = {
    escuro: { bg: '#0a0b0d', card: '#15171c', card2: '#1e2128', line: '#2a2e37', text: '#f3f4f6', muted: '#9aa1ad' },
    preto: { bg: '#000000', card: '#0e0f12', card2: '#17191e', line: '#24272e', text: '#f3f4f6', muted: '#9aa1ad' },
    claro: { bg: '#f3f4f7', card: '#ffffff', card2: '#e9ebf0', line: '#d6d9e0', text: '#14161a', muted: '#5b6270' },
  };
  const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  // No tema claro, cores muito claras (limão, dourado) sumiriam em links e números: escurece até dar leitura.
  const darken = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.substr(i, 2), 16) * k).toString(16).padStart(2, '0')).join('');
  const theme = () => Object.assign({ accent: '#c8f53c', accent2: '#7c5cff', mode: 'escuro' }, S.cfg.theme || {});
  U.applyTheme = () => {
    const t = theme(), m = MODES[t.mode] || MODES.escuro, st = document.documentElement.style;
    let acc = /^#[0-9a-f]{6}$/i.test(t.accent) ? t.accent : '#c8f53c'; const acc2 = /^#[0-9a-f]{6}$/i.test(t.accent2) ? t.accent2 : '#7c5cff';
    // Contraste: a cor principal também é usada como texto (links, números). Garante pelo menos 4,5:1 com o fundo,
    // clareando no tema escuro ou escurecendo no claro. A cor secundária precisa de 3:1 com o texto branco por cima.
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const lighten = (hex, k) => '#' + [1, 3, 5].map(i => { const v = parseInt(hex.substr(i, 2), 16); return Math.round(v + (255 - v) * k).toString(16).padStart(2, '0'); }).join('');
    for (let i = 0; i < 20 && ratio(acc, m.card) < 4.5; i++) acc = t.mode === 'claro' ? darken(acc, 0.9) : lighten(acc, 0.12);
    let a2 = acc2; for (let i = 0; i < 20 && ratio(a2, '#ffffff') < 3; i++) a2 = darken(a2, 0.9);
    Object.entries(m).forEach(([k, v]) => st.setProperty('--' + k, v));
    st.setProperty('--accent', acc); st.setProperty('--accent-ink', ratio(acc, '#101300') >= ratio(acc, '#ffffff') ? '#101300' : '#ffffff'); st.setProperty('--accent2', a2);
    const meta = U.$('meta[name=theme-color]'); if (meta) meta.content = m.bg;
  };
  V.themeCard = () => {
    const t = theme();
    return '<div class="card"><h2>Aparência</h2><p class="muted">Escolha as cores do app. Vale só para este aparelho.</p><div class="swatches">' +
      PRESETS.map(p => '<button class="swatch' + (t.accent === p[1] && t.accent2 === p[2] ? ' on' : '') + '" style="--a:' + p[1] + ';--b:' + p[2] + '" data-a="th-preset" data-c="' + p[1] + '" data-d="' + p[2] + '" title="' + p[0] + '" aria-label="Cores: ' + p[0] + '"></button>').join('') + '</div>' +
      '<div class="row wrap"><label>Cor principal <input type="color" id="th-accent" value="' + e(t.accent) + '"></label><label>Cor secundária <input type="color" id="th-accent2" value="' + e(t.accent2) + '"></label>' +
      '<label>Fundo <select id="th-mode">' + [['escuro', 'Escuro'], ['preto', 'Preto total'], ['claro', 'Claro']].map(o => '<option value="' + o[0] + '"' + (t.mode === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<button class="btn ghosty" data-a="th-reset">Voltar ao padrão</button></div></div>';
  };
  const setTheme = (patch, rerender) => { S.cfg.theme = Object.assign(theme(), patch); S.saveCfg(); U.applyTheme(); if (rerender) APP.render(); };
  A['th-preset'] = d => setTheme({ accent: d.c, accent2: d.d }, true);
  A['th-reset'] = () => { delete S.cfg.theme; S.saveCfg(); U.applyTheme(); APP.render(); };
  document.addEventListener('input', ev => { if (ev.target.id === 'th-accent') setTheme({ accent: ev.target.value }); if (ev.target.id === 'th-accent2') setTheme({ accent2: ev.target.value }); });
  document.addEventListener('change', ev => { if (ev.target.id === 'th-mode') setTheme({ mode: ev.target.value }, true); if (ev.target.id === 'th-accent' || ev.target.id === 'th-accent2') APP.render(); });
  U.applyTheme();

  // ================= COMPARTILHAR O APP =================
  A['app-share'] = () => {
    const text = 'Estou usando o Nina Calisthenics, um app de treino gratuito: ele monta um treino sob medida (em casa ou na academia), tem vídeo de cada exercício, timers e acompanha a evolução. Abre direto no navegador e funciona sem internet:';
    if (navigator.share) return navigator.share({ title: 'Nina Calisthenics', text, url: APP_URL }).catch(() => {});
    SHARE.last = { text: text + '\n' + APP_URL, fone: '' };
    U.modal('<h2>Indicar o app</h2><textarea readonly rows="5" id="sh-text">' + e(SHARE.last.text) + '</textarea><button class="btn block" data-a="sh-wa">Enviar pelo WhatsApp</button><button class="btn ghosty block" data-a="sh-copy">Copiar</button>');
  };

  // ================= PRIMEIRA VEZ =================
  let step = 1;
  V.inicio = () => {
    const dots = '<div class="dots"><i class="on"></i><i class="' + (step > 1 ? 'on' : '') + '"></i></div>';
    if (step === 1) return '<div class="onb">' + dots + I18N.picker() + '<h1>Vamos montar a sua <b>ficha de treino</b></h1>' +
      '<div class="card hl privacy"><div class="lvl-badge" style="background:var(--card2)" aria-hidden="true">🔒</div><div><b>Isto não é cadastro nem login.</b><p class="small" style="margin:4px 0 0">O app não tem contas nem servidor: <b>nada do que você preencher é enviado para ninguém</b>, nem para quem criou o app. Os dados ficam guardados só neste aparelho e servem apenas para montar a sua ficha e acompanhar sua evolução. Você pode apagar tudo quando quiser em Ajustes.</p></div></div>' +
      '<p class="muted">Responda o que quiser: nenhum campo é obrigatório, e dá para mudar depois em Perfil.</p>' +
      '<div class="card">' + PEOPLE.form(S.state.profile || {}) + '</div><div class="row end wrap"><button class="link" data-a="onb-skip">Pular e montar depois</button><button class="btn big" data-a="onb-next">Montar minha ficha</button></div></div>';
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
