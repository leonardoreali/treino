/* Perfil físico, prévia do treino gerado e modo profissional (alunos, avaliações, relatórios). */
(function () {
  const e = U.esc;
  const PE = window.PEOPLE = { alunoId: null, preview: null };
  const sel = (cls, opts, val) => '<select class="' + cls + '">' + Object.entries(opts).map(o => '<option value="' + e(o[0]) + '"' + (String(val) === o[0] ? ' selected' : '') + '>' + e(o[1]) + '</option>').join('') + '</select>';
  const num = (cls, val, ph) => '<input class="' + cls + '" type="number" inputmode="decimal" min="0" step="any" value="' + (val == null ? '' : e(val)) + '"' + (ph ? ' placeholder="' + ph + '"' : '') + '>';
  const KITS = { casa: 'Casa com barra, elásticos e corda', nada: 'Casa sem equipamento', academia: 'Academia completa' };
  const kitOwned = k => k === 'academia' ? EQUIP.map(q => q.id) : k === 'nada' ? ['banco', 'parede', 'degrau', 'colchonete'] : EQUIP_DEFAULT;

  // Formulário de perfil (o mesmo para o usuário e para um aluno).
  function form(p, aluno) {
    p = p || {};
    return '<div class="pf">' +
      '<label class="wide">Nome <input class="f-nome" value="' + e(p.nome || '') + '" autocomplete="off"></label>' +
      (aluno ? '<label class="wide">WhatsApp (com DDD) <input class="f-fone" type="tel" value="' + e(p.fone || '') + '" placeholder="11 91234-5678"></label>' : '') +
      '<label>Idade ' + num('f-idade', p.idade) + '</label>' +
      '<label>Sexo ' + sel('f-sexo', { '': '—', m: 'Masculino', f: 'Feminino', o: 'Outro / prefiro não dizer' }, p.sexo || '') + '</label>' +
      '<label>Altura (cm) ' + num('f-altura', p.altura) + '</label><label>Peso (kg) ' + num('f-peso', p.peso) + '</label>' +
      '<label class="wide">Objetivo ' + sel('f-objetivo', GEN.GOALS, p.objetivo || 'saude') + '</label>' +
      '<label class="wide">Experiência com treino ' + sel('f-nivel', GEN.LEVELS, p.nivel || 1) + '</label>' +
      '<label>Dias por semana ' + sel('f-dias', { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' }, p.dias || 3) + '</label>' +
      '<label>Tempo por treino ' + sel('f-tempo', { 30: '30 min', 45: '45 min', 60: '60 min' }, p.tempo || 45) + '</label>' +
      '<label class="wide">Como quer seguir o treino ' + sel('f-plano', { fila: 'Em fila: continuo de onde parei', dias: 'Dias fixos da semana', livre: 'Livre: escolho A, B ou C na hora' }, p.plano || 'fila') + '</label>' +
      '<label class="wide">Onde treina ' + sel('f-local', { casa: 'Em casa / ao ar livre', academia: 'Academia', misto: 'Os dois' }, p.local || 'casa') + '</label>' +
      (aluno ? '<label class="wide">Equipamentos disponíveis ' + sel('f-kit', KITS, p.kit || 'casa') + '</label>' : '') +
      '<label>Flexões seguidas ' + num('f-flexoes', p.flexoes, 'opcional') + '</label><label>Barras seguidas ' + num('f-barras', p.barras, 'opcional') + '</label>' +
      '<div class="wide"><div class="muted small">Dor ou limitação em:</div><div class="row wrap" style="margin-top:4px">' + Object.entries(GEN.LIMITS).map(l => '<label class="chk" style="border:0"><input type="checkbox" class="f-limit" value="' + l[0] + '"' + ((p.limit || []).includes(l[0]) ? ' checked' : '') + '><span>' + l[1] + '</span></label>').join('') + '</div></div>' +
      '<label class="wide">Fratura, cirurgia recente ou lesão em tratamento? ' + sel('f-lesao', { n: 'Não', s: 'Sim' }, p.lesao || 'n') + '</label>' +
      '<label class="wide">Observações' + (aluno ? ' / anamnese' : '') + ' <textarea class="f-obs" rows="2">' + e(p.obs || '') + '</textarea></label></div>';
  }
  function read(p) {
    const v = c => (U.$('.' + c) || {}).value, n = c => v(c) === '' || v(c) == null ? '' : Number(v(c));
    Object.assign(p, { nome: (v('f-nome') || '').trim(), idade: n('f-idade'), sexo: v('f-sexo'), altura: n('f-altura'), peso: n('f-peso'), objetivo: v('f-objetivo'), nivel: +v('f-nivel'), dias: +v('f-dias'), tempo: +v('f-tempo'),
      local: v('f-local'), plano: v('f-plano') || 'fila', lesao: v('f-lesao') || 'n', flexoes: n('f-flexoes'), barras: n('f-barras'), limit: [...document.querySelectorAll('.f-limit:checked')].map(x => x.value), obs: (v('f-obs') || '').trim(), t: Date.now() });
    if (U.$('.f-fone')) { p.fone = v('f-fone').trim(); p.kit = v('f-kit'); }
    return p;
  }
  PE.form = form;
  const imcLine = p => { const i = GEN.imc(p); return i ? '<p class="muted small">IMC: <b>' + i.toFixed(1) + '</b> (' + GEN.imcText(i) + '). O IMC não separa músculo de gordura; use como referência, junto com a medida da cintura.</p>' : ''; };

  // ================= PERFIL =================
  V.perfil = () => {
    const p = S.state.profile || {};
    return '<h1>Perfil</h1><div class="card"><p class="muted">🔒 Isto não é uma conta: os dados ficam <b>só neste aparelho</b> e não são enviados para ninguém. Servem para montar sua ficha e acompanhar sua evolução' + (S.cfg.token ? ' (e para a cópia no seu próprio GitHub, se você ligou a sincronização)' : '') + '.</p>' + form(p) + imcLine(p) +
      '<div class="row wrap"><button class="btn" data-a="pf-save">Salvar perfil</button><button class="btn big" data-a="pf-gen">⚡ Gerar meu treino</button></div>' +
      '<p class="muted small">Equipamentos: ' + S.owned().length + ' marcados — <a href="#ajustes">conferir em Ajustes</a>. O treino usa só o que estiver marcado.</p></div>' +
      '<div class="card"><h2>Professor e amigos</h2><div class="row wrap"><button class="btn ghosty" data-a="report-share">📤 Enviar relatório ao professor</button><a class="btn ghosty" href="#programa">📋 Compartilhar um treino</a></div>' +
      '<label class="chk"><input type="checkbox" id="trainer"' + (S.state.trainer ? ' checked' : '') + '><span>Sou profissional de educação física (ativar fichas de alunos)</span></label>' +
      (S.state.trainer ? '<a class="btn" href="#alunos">👥 Meus alunos (' + (S.state.alunos || []).length + ')</a>' : '') + '</div>' +
      '<a class="btn ghosty block" href="#ajustes">⚙️ Ajustes: sincronização, equipamentos, música, backup</a>';
  };
  function saveProfile() {
    const p = read(S.state.profile || {}), old = (S.state.profile || {}).peso; S.state.profile = p;
    if (p.peso && !S.state.measures.some(m => m.test === 'peso' && m.date === S.today())) S.state.measures.push({ id: S.uid(), t: Date.now(), test: 'peso', value: p.peso, date: S.today() });
    if (p.local !== 'casa' && !S.owned().some(q => ['maquinas', 'halteres', 'barra-livre'].includes(q))) { S.state.equip = [...new Set(S.owned().concat(EQUIP_GYM))]; U.toast('Marquei os equipamentos de academia. Ajuste em Ajustes se precisar.'); }
    S.save(); return p;
  }
  PE.saveProfile = saveProfile;
  A['pf-save'] = () => { saveProfile(); APP.render(); U.toast('Perfil salvo.'); };
  A['pf-gen'] = () => { const p = saveProfile(); PE.preview = { prog: GEN.generate(p), alunoId: null }; location.hash = '#previa'; };
  document.addEventListener('change', ev => { if (ev.target.id === 'trainer') { S.state.trainer = ev.target.checked; S.save(); APP.render(); } });

  // ================= PRÉVIA DO TREINO GERADO =================
  V.previa = () => {
    const pv = PE.preview; if (!pv) return '<div class="empty">Nada para mostrar. <a href="#perfil">Voltar ao perfil</a></div>';
    const p = pv.prog, al = pv.alunoId && (S.state.alunos || []).find(a => a.id === pv.alunoId);
    return '<h1>Treino sugerido</h1><div class="card hl"><h2>' + e(p.name) + '</h2>' + (al ? '<div class="muted">Para: ' + e(al.nome) + '</div>' : '') + '<p class="pre small">' + e(p.notes[0].text) + '</p></div>' +
      p.sessions.map((s, i) => '<div class="card"><b>Sessão ' + (i + 1) + '</b> — ' + e(s.name) + ' <span class="muted small">~' + s.duration + ' min</span>' +
        s.blocks.filter(b => b.kind !== 'check').map(b => '<h4>' + e(b.title) + '</h4><ul class="plain small">' + (b.items || []).map(it => { const id = W.resolve(it, '', ''); return '<li><span class="ex-name" data-a="exercise" data-ex="' + e(id) + '">' + e(S.ex(id).name) + '</span> <span class="muted">' + U.fmtRange(it) + '</span></li>'; }).join('') +
          (b.kind === 'cardio' ? '<li>' + b.min + '–' + b.max + ' min — ' + e(b.note) + '</li>' : '') + (b.options || []).map(o => '<li>' + e(o.name) + ': ' + e(o.labels.join(' → ')) + '</li>').join('') + '</ul>').join('') +
        '<div class="muted small">+ aquecimento e alongamento</div></div>').join('') +
      '<div class="row end wrap"><a class="btn ghosty" href="' + (al ? '#aluno' : '#perfil') + '">Voltar e ajustar</a><button class="btn big" data-a="pv-save">' + (al ? 'Salvar na ficha do aluno' : 'Usar este treino') + '</button></div>' +
      '<p class="muted small">Depois de salvar, dá para trocar exercícios, séries e repetições em Programa → Editar.</p>';
  };
  A['pv-save'] = () => {
    const pv = PE.preview, p = pv.prog; PE.preview = null;
    S.state.programs[p.id] = p; S.state.pos[p.id] = 0;
    if (pv.alunoId) { p.alunoId = pv.alunoId; S.save(); location.hash = '#aluno'; U.toast('Treino salvo na ficha. Use "Enviar" para mandar pelo WhatsApp.'); }
    else { S.state.activeProgram = p.id; S.save(); location.hash = '#hoje'; U.toast('Treino ativado!'); }
  };

  // ================= ALUNOS =================
  const alunos = () => S.state.alunos || (S.state.alunos = []);
  const cur = () => alunos().find(a => a.id === PE.alunoId);
  const progsOf = id => Object.values(S.state.programs).filter(p => p.alunoId === id);
  V.alunos = () => '<h1>Alunos</h1><p class="muted">Fichas guardadas neste aparelho (e no seu Gist, se a sincronização estiver ligada). Cuide desses dados: são informações pessoais dos seus alunos.</p>' +
    '<div class="list">' + (alunos().length ? alunos().slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(a => '<button class="list-item" data-a="al-open" data-id="' + e(a.id) + '"><span>' + e(a.nome) +
      '<small class="muted"> · ' + e(GEN.GOALS[a.objetivo] || '') + '</small></span><span class="tag">' + progsOf(a.id).length + ' treino(s)</span></button>').join('') : '<div class="empty">Nenhum aluno cadastrado.</div>') + '</div>' +
    '<div class="row"><input id="al-new" class="grow" placeholder="Nome do novo aluno" aria-label="Nome do novo aluno"><button class="btn" data-a="al-add">Adicionar</button></div>';
  A['al-add'] = () => { const nome = U.$('#al-new').value.trim(); if (!nome) return U.toast('Digite o nome.'); const a = { id: 'a-' + S.uid(), t: Date.now(), nome, aval: [], reports: [] }; alunos().push(a); S.save(); PE.alunoId = a.id; location.hash = '#aluno'; };
  A['al-open'] = d => { PE.alunoId = d.id; location.hash = '#aluno'; };

  V.aluno = () => {
    const a = cur(); if (!a) return '<div class="empty">Aluno não encontrado. <a href="#alunos">Voltar</a></div>';
    const ps = progsOf(a.id), mine = Object.values(S.state.programs).filter(p => !p.alunoId), av = (a.aval || []).slice().sort((x, y) => x.date < y.date ? 1 : -1);
    const h = a.altura ? a.altura / 100 : null;
    return '<a href="#alunos" class="muted small">← Alunos</a><h1>' + e(a.nome) + '</h1>' +
      '<div class="card"><h2>Dados e anamnese</h2>' + form(a, true) + imcLine(a) + '<div class="row"><button class="btn" data-a="al-save">Salvar ficha</button></div></div>' +
      '<div class="card"><h2>Treinos</h2>' + (ps.length ? '<div class="list">' + ps.map(p => '<div class="list-item"><span>' + e(p.name) + '<small class="muted"> · ' + p.sessions.length + ' sessões</small></span><span class="row">' +
        '<button class="btn small" data-a="al-send" data-id="' + e(p.id) + '">Enviar</button><button class="btn small ghosty" data-a="prog-edit" data-id="' + e(p.id) + '" data-go="1">Editar</button>' +
        '<button class="link danger" data-a="al-prog-del" data-id="' + e(p.id) + '">apagar</button></span></div>').join('') + '</div>' : '<p class="muted">Nenhum treino ainda.</p>') +
        '<div class="row wrap"><button class="btn" data-a="al-gen">⚡ Gerar pelo perfil</button><button class="btn ghosty" data-a="al-manual">Montar à mão</button></div>' +
        (mine.length ? '<div class="row wrap"><label class="grow">Copiar um dos meus programas <select id="al-copy">' + mine.map(p => '<option value="' + e(p.id) + '">' + e(p.name) + '</option>').join('') + '</select></label><button class="btn ghosty" data-a="al-copy">Copiar</button></div>' : '') + '</div>' +
      '<div class="card"><h2>Avaliações físicas</h2><div class="pf"><label>Data <input id="av-date" type="date" value="' + S.today() + '"></label><label>Peso (kg) ' + num('av-peso', a.peso) + '</label><label>Cintura (cm) ' + num('av-cint') + '</label>' +
        '<label>Quadril (cm) ' + num('av-quad') + '</label><label>% de gordura ' + num('av-gord') + '</label><label>Obs. <input class="av-obs"></label></div><div class="row"><button class="btn" data-a="av-add">Registrar avaliação</button></div>' +
        (av.length ? '<div style="overflow-x:auto"><table class="tbl"><tr><th>Data</th><th>Peso</th><th>IMC</th><th>Cintura</th><th>Quadril</th><th>RCQ</th><th>% G</th><th></th></tr>' + av.map(x => '<tr><td>' + U.fmtDate(x.date) + '</td><td>' + (x.peso || '—') + '</td><td>' + (x.peso && h ? (x.peso / (h * h)).toFixed(1) : '—') + '</td><td>' + (x.cint || '—') + '</td><td>' + (x.quad || '—') + '</td><td>' + (x.cint && x.quad ? (x.cint / x.quad).toFixed(2) : '—') + '</td><td>' + (x.gord || '—') + '</td><td><button class="link danger" data-a="av-del" data-id="' + x.id + '">✕</button></td></tr>' + (x.obs ? '<tr><td colspan="8" class="muted small">' + e(x.obs) + '</td></tr>' : '')).join('') + '</table></div>' : '') + '</div>' +
      '<div class="card"><h2>Relatórios recebidos</h2>' + ((a.reports || []).length ? a.reports.slice().reverse().map(r => '<h4>Enviado em ' + U.fmtDate(r.d) + (r.peso ? ' · ' + r.peso + ' kg' : '') + '</h4>' + SHARE.reportHtml(r)).join('') : '<p class="muted">Quando o aluno tocar em "Enviar relatório ao professor" e você abrir o link recebido, os treinos dele aparecem aqui.</p>') + '</div>' +
      '<button class="btn danger ghosty" data-a="al-del">Excluir este aluno</button>';
  };
  A['al-save'] = () => { read(cur()); S.save(); APP.render(); U.toast('Ficha salva.'); };
  A['al-gen'] = () => { const a = read(cur()); S.save(); PE.preview = { prog: GEN.generate(a, kitOwned(a.kit)), alunoId: a.id }; location.hash = '#previa'; };
  A['al-manual'] = () => { V.ui.draft = { name: 'Treino de ' + cur().nome, rounds: 12, flex: true, alunoId: cur().id, sessions: [{ name: 'Treino A', items: [] }] }; location.hash = '#programa'; };
  A['al-copy'] = () => { const src = S.state.programs[U.$('#al-copy').value]; if (!src) return; const p = JSON.parse(JSON.stringify(src)); p.id = 'p-' + S.uid(); p.alunoId = cur().id; p.startDate = S.today(); S.state.programs[p.id] = p; S.state.pos[p.id] = 0; S.save(); APP.render(); U.toast('Programa copiado para a ficha.'); };
  A['al-send'] = d => SHARE.program(d.id, cur().fone, (cur().nome || '').split(' ')[0]);
  A['al-prog-del'] = d => { if (confirm('Apagar este treino da ficha?')) { delete S.state.programs[d.id]; S.state.deleted.push(d.id); S.save(); APP.render(); } };
  A['av-add'] = () => {
    const a = cur(), n = c => Number(U.$('.' + c).value) || null, x = { id: S.uid(), date: U.$('#av-date').value || S.today(), peso: n('av-peso'), cint: n('av-cint'), quad: n('av-quad'), gord: n('av-gord'), obs: U.$('.av-obs').value.trim() };
    if (!x.peso && !x.cint && !x.gord) return U.toast('Preencha pelo menos uma medida.');
    (a.aval = a.aval || []).push(x); if (x.peso) a.peso = x.peso; a.t = Date.now(); S.save(); APP.render();
  };
  A['av-del'] = d => { const a = cur(); a.aval = a.aval.filter(x => x.id !== d.id); a.t = Date.now(); S.save(); APP.render(); };
  A['al-del'] = () => {
    const a = cur(); if (!confirm('Excluir ' + a.nome + ' e os treinos da ficha? Não dá para desfazer.')) return;
    progsOf(a.id).forEach(p => { delete S.state.programs[p.id]; S.state.deleted.push(p.id); });
    S.state.alunos = alunos().filter(x => x.id !== a.id); S.state.deleted.push(a.id); S.save(); location.hash = '#alunos';
  };
})();
