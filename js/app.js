/* Navegação entre telas e inicialização. */
(function () {
  const APP = window.APP = {};
  const TABS = [['hoje', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>', 'Hoje'], ['habilidades', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>', 'Habilidades'], ['evolucao', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>', 'Evolução'], ['biblioteca', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>', 'Exercícios'], ['programa', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>', 'Programa'], ['perfil', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/></svg>', 'Perfil']];
  const views = { hoje: V.hoje, treino: W.view, habilidades: V.habilidades, evolucao: V.evolucao, biblioteca: V.biblioteca, programa: V.programa, ajustes: V.ajustes, perfil: V.perfil, previa: V.previa, alunos: V.alunos, aluno: V.aluno, inicio: V.inicio, dieta: V.dieta, ficha: V.ficha, saude: V.saude };
  const PARENT = { treino: 'hoje', dieta: 'hoje', ficha: 'programa', ajustes: 'perfil', saude: 'perfil', previa: 'perfil', alunos: 'perfil', aluno: 'perfil' };

  APP.render = function () {
    const name = (location.hash || '#hoje').slice(1), fn = views[name] || views.hoje;
    const main = U.$('#view'), y = APP.last === name ? window.scrollY : 0;
    document.body.classList.toggle('onboarding', name === 'inicio');
    main.innerHTML = fn();
    U.$('#nav').innerHTML = '<div class="brand">🐾 NINA <b>CALISTHENICS</b></div>' + TABS.map(t => '<a href="#' + t[0] + '" class="' + (name === t[0] || PARENT[name] === t[0] ? 'on' : '') + '"' + (name === t[0] || PARENT[name] === t[0] ? ' aria-current="page"' : '') + '><span class="ico">' + t[1] + '</span><span>' + t[2] + '</span></a>').join('');
    if (V.after[name]) V.after[name]();
    window.scrollTo(0, y); APP.last = name;
  };
  window.addEventListener('hashchange', () => APP.render());
  window.addEventListener('resize', () => { if (V.after[APP.last]) V.after[APP.last](); });

  S.onSync = s => { const el = U.$('#sync-status'); if (el) el.textContent = 'Situação: ' + s; };
  S.onRemoteChange = () => { if (!S.current && U.$('#modal').hidden) APP.render(); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { S.sync(); if (S.current) U.wake(true); } });

  if (U.needsOnboarding() && (!location.hash || location.hash === '#hoje')) history.replaceState(null, '', location.pathname + location.search + '#inicio');
  APP.render();
  I18N.start();
  SHARE.check();
  S.sync();
  // ---------- atualizações do app ----------
  // Em desenvolvimento (localhost) o service worker fica desligado, a não ser com ?sw=1, para não servir arquivos antigos.
  const dev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !/[?&]sw=1/.test(location.search);
  APP.showUpdate = () => {
    if (!APP.newSW || APP.updLater === 'sempre') return;
    let b = U.$('#upd'); if (!b) { b = document.createElement('div'); b.id = 'upd'; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    b.innerHTML = S.current ? '<span>Nova versão do app disponível. Ela é instalada quando você terminar o treino.</span><button data-a="upd-later">Ok</button>'
      : '<span>Nova versão do app disponível.</span><button data-a="upd-go">Atualizar</button><button data-a="upd-later" aria-label="Depois">Depois</button>';
  };
  A['upd-go'] = () => { if (S.current) return APP.showUpdate(); APP.newSW && APP.newSW.postMessage('SKIP_WAITING'); };
  A['upd-later'] = () => { const b = U.$('#upd'); if (b) b.remove(); APP.updLater = S.current ? 'treino' : 'sempre'; };
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    if (dev) navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    else {
      navigator.serviceWorker.register('sw.js').then(reg => {
        const offer = w => { APP.newSW = w; APP.showUpdate(); };
        if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
        reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
        document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
      }).catch(() => {});
      // recarrega só quando uma versão nova assume (na primeira instalação não há o que recarregar)
      let reloading = false; const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || S.current || !hadController) return; reloading = true; location.reload(); });
    }
  }
  // terminou o treino com uma versão nova esperando: oferece de novo
  const render0 = APP.render;
  APP.render = function () { render0(); if (APP.newSW && !S.current && APP.updLater === 'treino') { APP.updLater = null; APP.showUpdate(); } };
})();
