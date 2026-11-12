/* Compartilhar por link (WhatsApp): o treino ou relatório viaja inteiro dentro do link, sem servidor. */
(function () {
  const SH = window.SHARE = {};
  const e = U.esc;
  const BASE = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'https://leonardoreali.github.io/treino/' : location.origin + location.pathname;
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; };
  SH.encode = async obj => {
    const json = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) return 'z' + b64(new Uint8Array(await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()));
    return 'j' + b64(json);
  };
  SH.decode = async str => {
    const bytes = unb64(str.slice(1));
    if (str[0] === 'z') return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
    return JSON.parse(new TextDecoder().decode(bytes));
  };
  SH.fone = f => { const d = String(f || '').replace(/\D/g, ''); return d.length === 10 || d.length === 11 ? '55' + d : d; };

  function dialog(title, text, fone, extra) {
    SH.last = { text, fone: SH.fone(fone) };
    U.modal('<h2>' + e(title) + '</h2>' + (extra || '') + '<textarea readonly rows="6" id="sh-text">' + e(text) + '</textarea>' +
      '<button class="btn block" data-a="sh-wa">Enviar pelo WhatsApp' + (SH.last.fone ? ' para +' + SH.last.fone : '') + '</button>' +
      '<div class="row"><button class="btn ghosty grow" data-a="sh-copy">Copiar</button>' + (navigator.share ? '<button class="btn ghosty grow" data-a="sh-native">Outro app…</button>' : '') + '</div>');
  }
  A['sh-wa'] = () => window.open('https://wa.me/' + (SH.last.fone || '') + '?text=' + encodeURIComponent(SH.last.text), '_blank', 'noopener');
  A['sh-copy'] = () => navigator.clipboard.writeText(SH.last.text).then(() => U.toast('Copiado!'), () => { U.$('#sh-text').select(); U.toast('Selecione e copie.'); });
  A['sh-native'] = () => navigator.share({ text: SH.last.text }).catch(() => {});

  SH.program = async (progId, fone, toName) => {
    const src = S.state.programs[progId]; if (!src) return;
    const p = JSON.parse(JSON.stringify(src)); delete p.alunoId; delete p.id;
    const ids = new Set(p.sessions.flatMap(s => s.blocks.flatMap(b => (b.items || []).map(i => i.ex).filter(Boolean))));
    const ex = (S.state.customEx || []).filter(x => ids.has(x.id));
    const from = (S.state.profile || {}).nome || '';
    const link = BASE + '#t=' + await SH.encode({ k: 'p', from, p, ex });
    dialog('Compartilhar treino', (toName ? 'Olá, ' + toName + '! ' : '') + 'Segue o treino "' + p.name + '" (' + p.sessions.length + ' sessões' + (from ? ', enviado por ' + from : '') + '). Toque no link para abrir no app e importar:\n' + link, fone,
      '<p class="muted small">Quem receber abre o link, vê o treino e escolhe se quer usar. Seus registros e medidas não vão junto.</p>');
  };
  A['prog-share'] = d => SH.program(d.id);

  SH.report = async fone => {
    const since = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10), nome = (S.state.profile || {}).nome || 'Aluno';
    const logs = S.sortedLogs().filter(l => l.date >= since).reverse().map(l => ({ id: l.id, date: l.date, n: l.sessionName, rpe: l.rpe, notes: l.notes, min: l.minutes,
      items: (l.items || []).map(i => ({ name: S.ex(i.ex).name, sets: i.sets, kg: i.kg, unit: i.unit })) }));
    if (!logs.length) return U.toast('Nenhum treino registrado nos últimos 14 dias.');
    const line = l => U.fmtDate(l.date) + ' — ' + l.n + (l.rpe ? ' (esforço ' + l.rpe + ')' : '') + '\n' + l.items.map(i => '  • ' + i.name + ': ' + i.sets.join(', ') + U.unit(i.unit) + (i.kg && i.kg.some(Number) ? ' @ ' + Math.max(...i.kg) + ' kg' : '')).join('\n') + (l.notes ? '\n  Obs.: ' + l.notes : '');
    const link = BASE + '#t=' + await SH.encode({ k: 'r', nome, d: S.today(), peso: (S.state.profile || {}).peso, logs });
    dialog('Relatório para o professor', 'Relatório de treino — ' + nome + ' (últimos 14 dias)\n\n' + logs.map(line).join('\n\n') + '\n\nAbrir no app do professor:\n' + link, fone);
  };
  A['report-share'] = () => SH.report();

  // ---------- receber ----------
  SH.check = async () => {
    if (!location.hash.startsWith('#t=')) return;
    const code = location.hash.slice(3);
    history.replaceState(null, '', location.pathname + location.search + '#hoje'); APP.render();
    let d; try { d = await SH.decode(code); } catch (err) { return U.toast('Link de treino inválido ou cortado.'); }
    if (d.k === 'p' && d.p && Array.isArray(d.p.sessions)) {
      SH.incoming = d;
      const exName = id => (EXERCISES.concat(d.ex || [], S.state.customEx || []).find(x => x.id === id) || { name: id }).name;
      U.modal('<h2>Treino recebido</h2><p><b>' + e(d.p.name) + '</b>' + (d.from ? ' — enviado por ' + e(d.from) : '') + '</p>' +
        d.p.sessions.map((s, i) => '<details' + (i ? '' : ' open') + '><summary><b>' + (i + 1) + '.</b> ' + e(s.name) + '</summary><ul class="plain small">' +
          s.blocks.filter(b => b.kind !== 'check').flatMap(b => (b.items || []).map(it => '<li>' + e(it.skill ? S.ex(W.resolve(it, '', '')).name : exName(it.ex)) + ' <span class="muted">' + U.fmtRange(it) + '</span></li>')
            .concat(b.kind === 'cardio' ? ['<li>Cardio ' + b.min + '–' + b.max + ' min</li>'] : [], (b.options || []).map(o => '<li>Intervalado: ' + e(o.name) + '</li>'))).join('') + '</ul></details>').join('') +
        '<button class="btn big block" data-a="sh-accept" data-use="1">Adicionar e começar a usar</button><button class="btn ghosty block" data-a="sh-accept" data-use="">Só guardar em Meus programas</button>');
    } else if (d.k === 'r' && Array.isArray(d.logs)) {
      SH.incoming = d;
      const al = S.state.alunos || [], guess = al.find(a => a.nome && d.nome && a.nome.toLowerCase().split(' ')[0] === d.nome.toLowerCase().split(' ')[0]);
      U.modal('<h2>Relatório de ' + e(d.nome) + '</h2><p class="muted small">' + d.logs.length + ' treino(s) até ' + U.fmtDate(d.d) + '</p>' + SH.reportHtml(d) +
        (al.length ? '<label>Salvar na ficha do aluno <select id="sh-aluno">' + al.map(a => '<option value="' + e(a.id) + '"' + (guess && guess.id === a.id ? ' selected' : '') + '>' + e(a.nome) + '</option>').join('') + '</select></label><button class="btn block" data-a="sh-report-save">Salvar relatório</button>'
          : '<p class="muted small">Para guardar relatórios, ative o modo profissional em Perfil e cadastre o aluno.</p>'));
    } else U.toast('Não reconheci o conteúdo deste link.');
  };
  SH.reportHtml = d => d.logs.map(l => '<details><summary><b>' + U.fmtDate(l.date) + '</b> · ' + e(l.n || '') + (l.rpe ? ' <span class="tag">esforço ' + l.rpe + '</span>' : '') + '</summary><ul class="plain small">' +
    l.items.map(i => '<li>' + e(i.name) + ': ' + i.sets.join(', ') + U.unit(i.unit) + (i.kg && i.kg.some(Number) ? ' @ ' + Math.max(...i.kg) + ' kg' : '') + '</li>').join('') + '</ul>' + (l.notes ? '<p class="muted small">' + e(l.notes) + '</p>' : '') + '</details>').join('');
  A['sh-accept'] = d => {
    const inc = SH.incoming, id = 'p-' + S.uid(), p = inc.p; p.id = id; p.startDate = S.today();
    for (const x of inc.ex || []) if (x && x.id && !S.allExercises().some(y => y.id === x.id)) S.state.customEx.push(x);
    S.state.programs[id] = p; S.state.pos[id] = 0; if (d.use) S.state.activeProgram = id;
    S.save(); U.closeModal(); location.hash = d.use ? '#hoje' : '#programa'; APP.render(); U.toast(d.use ? 'Treino ativado!' : 'Treino guardado.');
  };
  A['sh-report-save'] = () => {
    const a = (S.state.alunos || []).find(x => x.id === U.$('#sh-aluno').value); if (!a) return;
    a.reports = (a.reports || []).filter(r => r.d !== SH.incoming.d).concat([{ d: SH.incoming.d, peso: SH.incoming.peso, logs: SH.incoming.logs }]); a.t = Date.now();
    S.save(); U.closeModal(); U.toast('Relatório salvo na ficha de ' + a.nome + '.');
  };
  window.addEventListener('hashchange', SH.check);
})();
