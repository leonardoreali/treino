/* Navegação entre telas e inicialização. */
(function () {
  const APP = window.APP = {};
  const TABS = [['hoje', '🏠', 'Hoje'], ['habilidades', '🌳', 'Habilidades'], ['evolucao', '📈', 'Evolução'], ['biblioteca', '📚', 'Biblioteca'], ['programa', '📋', 'Programa'], ['ajustes', '⚙️', 'Ajustes']];
  const views = { hoje: V.hoje, treino: W.view, habilidades: V.habilidades, evolucao: V.evolucao, biblioteca: V.biblioteca, programa: V.programa, ajustes: V.ajustes };

  APP.render = function () {
    const name = (location.hash || '#hoje').slice(1), fn = views[name] || views.hoje;
    const main = U.$('#view'), y = APP.last === name ? window.scrollY : 0;
    main.innerHTML = fn();
    U.$('#nav').innerHTML = '<div class="brand">💪 Treino</div>' + TABS.map(t => '<a href="#' + t[0] + '" class="' + (name === t[0] || (name === 'treino' && t[0] === 'hoje') ? 'on' : '') + '"><span class="ico">' + t[1] + '</span><span>' + t[2] + '</span></a>').join('');
    if (V.after[name]) V.after[name]();
    window.scrollTo(0, y); APP.last = name;
  };
  window.addEventListener('hashchange', APP.render);
  window.addEventListener('resize', () => { if (V.after[APP.last]) V.after[APP.last](); });

  S.onSync = s => { const el = U.$('#sync-status'); if (el) el.textContent = 'Situação: ' + s; };
  S.onRemoteChange = () => { if (!S.current && U.$('#modal').hidden) APP.render(); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { S.sync(); if (S.current) U.wake(true); } });

  APP.render();
  S.sync();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
