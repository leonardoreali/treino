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
    SH.pdfJob = { name: p.name, blob: null, promise: null };
    SH.pdfJob.promise = makePdf(src, progId, from, link).then(b => (SH.pdfJob.blob = b)).catch(err => { console.error(err); return null; }); // já vai gerando
    dialog('Compartilhar treino', (toName ? 'Olá, ' + toName + '! ' : '') + 'Segue o treino "' + p.name + '" (' + p.sessions.length + ' sessões' + (from ? ', enviado por ' + from : '') + '). Toque no link para abrir no app e importar:\n' + link, fone,
      '<button class="btn big block" data-a="sh-pdf">📄 Enviar em PDF</button><p class="muted small">O PDF traz o treino formatado para ler ou imprimir, e um link dentro dele importa tudo no app. Seus registros e medidas não vão junto.</p><h3>Ou só o link</h3>');
  };

  // ---------- PDF do treino ----------
  function loadPdfLib() {
    if (window.jspdf) return Promise.resolve();
    return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = ok; s.onerror = () => fail(new Error('sem internet para baixar o gerador de PDF')); document.head.appendChild(s); });
  }
  const T = s => String(s == null ? '' : s).replace(/→/g, '>').replace(/[^\x20-\x7E\xA0-\xFF–—•…]/g, '').replace(/\s+/g, ' ').trim(); // só o que a fonte do PDF sabe desenhar
  async function makePdf(p, progId, from, link) {
    await loadPdfLib();
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' }), PW = 595, M = 40, CW = PW - 2 * M;
    const X = [M + 8, M + 250, M + 345, M + 405], CWd = [234, 88, 54, CW - 413];
    let y = 0;
    const font = (st, sz, c) => { doc.setFont('helvetica', st); doc.setFontSize(sz); doc.setTextColor(c[0], c[1], c[2]); };
    const need = h => { if (y + h > 790) { doc.addPage(); y = 50; } };
    doc.setFillColor(10, 11, 13); doc.rect(0, 0, PW, 104, 'F');
    font('bold', 9, [200, 245, 60]); doc.text('PLANO DE TREINO', M, 36);
    font('bold', 20, [255, 255, 255]); doc.text(doc.splitTextToSize(T(p.name), CW)[0], M, 62);
    font('normal', 10, [190, 195, 205]); doc.text(T((from ? 'Enviado por ' + from + '  •  ' : '') + p.sessions.length + ' sessões  •  ' + p.rounds + ' voltas  •  ' + new Date().toLocaleDateString('pt-BR')), M, 84);
    y = 132;
    p.sessions.forEach((s, si) => {
      need(86);
      doc.setFillColor(200, 245, 60); doc.roundedRect(M, y - 15, CW, 24, 6, 6, 'F');
      font('bold', 12, [13, 18, 0]); doc.text(T('Sessão ' + (si + 1) + ' — ' + s.name) + (s.duration ? '  (~' + s.duration + ' min)' : ''), M + 8, y + 2);
      y += 28;
      font('bold', 8, [120, 125, 135]); ['EXERCÍCIO', 'SÉRIES × REPS', 'DESCANSO', 'OBSERVAÇÃO'].forEach((t, i) => doc.text(t, X[i], y)); y += 6;
      doc.setDrawColor(210, 212, 218); doc.line(M, y, PW - M, y); y += 14;
      const row = (cells, bold) => {
        const lines = cells.map((c, i) => doc.splitTextToSize(T(c), CWd[i])), h = Math.max(...lines.map(l => l.length)) * 12 + 8;
        need(h);
        lines.forEach((l, i) => { font(i === 0 && bold ? 'bold' : 'normal', 10, i === 0 ? [20, 20, 24] : [70, 74, 82]); doc.text(l, X[i], y); });
        y += h - 10; doc.setDrawColor(232, 233, 237); doc.line(M, y, PW - M, y); y += 14;
      };
      s.blocks.forEach((b, bi) => {
        if (b.kind === 'check') {
          const txt = T(b.title + ': ' + b.items.map(it => it.text || S.ex(W.resolve(it, progId, si + '.' + bi + '.x')).name + ' ' + U.fmtRange(it)).join('; ')), ls = doc.splitTextToSize(txt, CW - 16);
          need(ls.length * 11 + 10); font('italic', 9, [110, 115, 125]); doc.text(ls, M + 8, y); y += ls.length * 11 + 8;
        } else if (b.kind === 'forca') b.items.forEach((it, ii) => row([S.ex(W.resolve(it, progId, si + '.' + bi + '.' + ii)).name, U.fmtRange(it), it.rest ? U.fmtSec(it.rest) : '', it.note || ''], true));
        else if (b.kind === 'cardio') row([b.title, b.min + '–' + b.max + ' min', '', b.note || ''], true);
        else if (b.kind === 'intervalado') b.options.forEach(o => row(['Intervalado', o.rounds + ' × ' + o.work + ' s', o.rest + ' s', o.labels.join(', ')], true));
      });
      y += 12;
    });
    need(96);
    doc.setFillColor(243, 244, 246); doc.roundedRect(M, y, CW, 74, 8, 8, 'F');
    font('bold', 11, [20, 20, 24]); doc.text('Abrir este treino no app (gratuito)', M + 12, y + 22);
    font('normal', 9, [70, 74, 82]); doc.text(doc.splitTextToSize('Com vídeo de cada exercício, timers de descanso e registro da evolução. Toque no botão abaixo; se não abrir, importe este PDF em Programa > Importar PDF.', CW - 24), M + 12, y + 37);
    font('bold', 10, [40, 70, 200]); doc.textWithLink('>> Toque aqui para importar no app <<', M + 12, y + 64, { url: link });
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) { doc.setPage(i); font('normal', 8, [150, 154, 162]); doc.text('Plano montado por regras gerais ou pelo seu professor. Dor aguda, tontura ou falta de ar fora do normal: pare e procure atendimento.   ' + i + '/' + n, M, 822); }
    return doc.output('blob');
  }
  A['sh-pdf'] = async (d, el) => {
    const job = SH.pdfJob; if (!job) return;
    el.textContent = 'Gerando PDF…';
    const blob = job.blob || await job.promise;
    el.textContent = '📄 Enviar em PDF';
    if (!blob) return U.toast('Não consegui gerar o PDF (precisa de internet na primeira vez). Use o link abaixo.');
    const file = new File([blob], T(job.name).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 50) + '.pdf', { type: 'application/pdf' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) return await navigator.share({ files: [file], title: job.name, text: 'Treino "' + job.name + '". O link dentro do PDF importa tudo no app.' }); }
    catch (err) { if (err && err.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    U.toast('PDF baixado. Anexe o arquivo na conversa do WhatsApp.');
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
