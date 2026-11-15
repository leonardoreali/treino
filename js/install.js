/* Instalar o app: mostra o passo a passo certo para cada aparelho e, quando o navegador permite,
   um botão que instala na hora. Aparece na tela Hoje (até a pessoa instalar ou dispensar) e em Ajustes. */
(function () {
  const IN = window.INSTALL = { prompt: null };
  const ua = navigator.userAgent || '';
  IN.standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  IN.os = () => /Android/i.test(ua) ? 'android' : (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) ? 'ios' : 'desktop';
  // navegador interno de outro app (WhatsApp, Instagram, Facebook…): de lá não dá para instalar
  IN.inApp = () => /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|; wv\)/i.test(ua);
  const iosBrowser = () => /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) ? 'other' : 'safari';

  window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); IN.prompt = ev; if (['#hoje', '#ajustes', ''].includes(location.hash || '')) APP.render(); });
  window.addEventListener('appinstalled', () => { IN.prompt = null; S.cfg.installed = true; S.saveCfg(); U.toast('Nina Calisthenics instalado! Procure o ícone na tela inicial.'); if (window.APP) APP.render(); });

  IN.steps = () => {
    const os = IN.os();
    if (IN.inApp()) return '<p>Você abriu o link dentro de outro aplicativo. Para instalar, abra no navegador:</p><ol><li>Toque nos <b>três pontinhos ⋮</b> (ou no ícone de compartilhar) no canto da tela.</li><li>Escolha <b>Abrir no Chrome</b>' + (os === 'ios' ? ' ou <b>Abrir no Safari</b>' : '') + '.</li><li>Lá, siga as instruções de instalação que aparecem no app.</li></ol>';
    if (os === 'android') return '<ol><li>Abra este endereço no <b>Chrome</b>.</li><li>Toque nos <b>três pontinhos ⋮</b> no canto de cima, à direita.</li><li>Toque em <b>Instalar app</b> (em alguns celulares aparece <b>Adicionar à tela inicial</b>).</li><li>Confirme. O ícone da Nina aparece na tela inicial e o app abre em tela cheia, até sem internet.</li></ol>';
    if (os === 'ios') return iosBrowser() === 'safari'
      ? '<ol><li>Toque no botão de <b>compartilhar</b> (o quadrado com a seta para cima ⬆️) na barra do Safari.</li><li>Role e toque em <b>Adicionar à Tela de Início</b>.</li><li>Toque em <b>Adicionar</b>. O ícone da Nina aparece na tela inicial.</li></ol>'
      : '<ol><li>No iPhone, a instalação funciona melhor pelo <b>Safari</b>: copie o endereço e abra no Safari.</li><li>Toque em <b>compartilhar ⬆️</b> e depois em <b>Adicionar à Tela de Início</b>.</li></ol>';
    return '<ol><li>No <b>Chrome</b> ou no <b>Edge</b>, procure o ícone de instalar (um monitor com seta ⊕) no fim da barra de endereço.</li><li>Ou abra o menu ⋮ e escolha <b>Instalar Nina Calisthenics</b> (no Edge: Aplicativos → Instalar este site como aplicativo).</li></ol>';
  };
  IN.card = (compact) => {
    if (IN.standalone()) return '<div class="card"><h2>Instalar o app</h2><p class="muted">✓ Você já está usando o app instalado.</p></div>';
    const os = IN.os(), where = os === 'desktop' ? 'no computador' : 'no celular';
    return '<div class="card' + (compact ? ' hl install-card' : '') + '"><div class="row between"><h2>📲 Instale ' + where + '</h2>' + (compact ? '<button class="ghost" data-a="inst-later" aria-label="Agora não">✕</button>' : '') + '</div>' +
      '<p class="small' + (compact ? '' : ' muted') + '">O Nina Calisthenics é um site, mas pode virar um app: ícone na tela inicial, tela cheia e funciona <b>sem internet</b>. É grátis e não precisa de loja nem de conta.</p>' +
      (IN.prompt && !IN.inApp() ? '<button class="btn block" data-a="inst-go">Instalar agora</button><details class="small"><summary class="muted">Prefere fazer à mão?</summary>' + IN.steps() + '</details>' : IN.steps()) + '</div>';
  };
  A['inst-go'] = async () => { if (!IN.prompt) return; IN.prompt.prompt(); const r = await IN.prompt.userChoice.catch(() => ({})); IN.prompt = null; if (r && r.outcome === 'dismissed') U.toast('Tudo bem: dá para instalar depois em Perfil → Ajustes.'); APP.render(); };
  A['inst-later'] = () => { S.cfg.installLater = Date.now(); S.saveCfg(); APP.render(); U.toast('As instruções ficam em Perfil → Ajustes.'); };
  // Tela Hoje: no celular (ou quando o navegador oferece instalar), até instalar ou dispensar; volta depois de 14 dias.
  const showOnHoje = () => !IN.standalone() && !S.cfg.installed && (IN.os() !== 'desktop' || IN.prompt) && Date.now() - (S.cfg.installLater || 0) > 14 * 864e5;
  const hoje0 = V.hoje;
  V.hoje = () => { const h = hoje0(); if (!showOnHoje()) return h; const i = h.indexOf('</h1>'); return i >= 0 ? h.slice(0, i + 5) + IN.card(true) + h.slice(i + 5) : IN.card(true) + h; };
})();
