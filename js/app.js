/* Navegação entre telas e inicialização. */
(function () {
  const APP = window.APP = {};
  const TABS = [['hoje', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>', 'Hoje'], ['habilidades', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>', 'Skills'], ['evolucao', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>', 'Evolução'], ['biblioteca', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>', 'Exercícios'], ['programa', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>', 'Programa'], ['perfil', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/></svg>', 'Perfil']];
  const views = { hoje: V.hoje, treino: W.view, habilidades: V.habilidades, evolucao: V.evolucao, biblioteca: V.biblioteca, programa: V.programa, ajustes: V.ajustes, perfil: V.perfil, previa: V.previa, alunos: V.alunos, aluno: V.aluno, inicio: V.inicio, dieta: V.dieta };
  const PARENT = { treino: 'hoje', dieta: 'hoje', ajustes: 'perfil', previa: 'perfil', alunos: 'perfil', aluno: 'perfil' };

  APP.render = function () {
    const name = (location.hash || '#hoje').slice(1), fn = views[name] || views.hoje;
    const main = U.$('#view'), y = APP.last === name ? window.scrollY : 0;
    document.body.classList.toggle('onboarding', name === 'inicio');
    main.innerHTML = fn();
    U.$('#nav').innerHTML = '<div class="brand">TRE<b>INO</b></div>' + TABS.map(t => '<a href="#' + t[0] + '" class="' + (name === t[0] || PARENT[name] === t[0] ? 'on' : '') + '"><span class="ico">' + t[1] + '</span><span>' + t[2] + '</span></a>').join('');
    if (V.after[name]) V.after[name]();
    window.scrollTo(0, y); APP.last = name;
  };
  window.addEventListener('hashchange', APP.render);
  window.addEventListener('resize', () => { if (V.after[APP.last]) V.after[APP.last](); });

  S.onSync = s => { const el = U.$('#sync-status'); if (el) el.textContent = 'Situação: ' + s; };
  S.onRemoteChange = () => { if (!S.current && U.$('#modal').hidden) APP.render(); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { S.sync(); if (S.current) U.wake(true); } });

  if (U.needsOnboarding() && !location.hash.startsWith('#t=')) history.replaceState(null, '', location.pathname + location.search + '#inicio');
  APP.render();
  SHARE.check();
  S.sync();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
