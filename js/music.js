/* Música: playlists do YouTube / YouTube Music (com volume que abaixa nos alarmes) e do Spotify (sem controle de volume). */
(function () {
  const M = window.MUSIC = {};
  const e = U.esc;
  let yt = null, ready = false, duckT = null, ducked = false, apiP = null;
  const vol = () => S.cfg.musicVol == null ? 70 : S.cfg.musicVol;
  const lists = () => S.state.playlists || (S.state.playlists = []);

  M.parse = url => {
    url = String(url).trim();
    const sp = url.match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
    if (sp) return { type: 'spotify', kind: sp[1], key: sp[2] };
    if (/youtu/.test(url)) {
      const l = url.match(/[?&]list=([\w-]+)/); if (l) return { type: 'youtube', list: l[1] };
      const v = U.ytId(url); if (v) return { type: 'youtube', video: v };
    }
    return null;
  };

  function skeleton() {
    U.$('#music').innerHTML = '<button id="music-btn" data-a="music-toggle" aria-label="Música">🎵</button><div class="music-panel">' +
      '<div class="row between"><b>Música</b><button class="ghost" data-a="music-toggle" aria-label="Fechar">✕</button></div>' +
      '<div class="row"><select id="music-sel" class="grow" aria-label="Playlist"></select><button class="btn small" data-a="music-add">+ Link</button></div>' +
      '<div id="music-holder"></div>' +
      '<div id="music-ctl" class="row" hidden><button class="ghost" data-a="music-cmd" data-c="prev" aria-label="Anterior">⏮</button><button class="ghost" data-a="music-cmd" data-c="toggle" aria-label="Tocar ou pausar">⏯</button>' +
      '<button class="ghost" data-a="music-cmd" data-c="next" aria-label="Próxima">⏭</button><button class="ghost" data-a="music-cmd" data-c="shuffle" title="Embaralhar">🔀</button>' +
      '<input type="range" id="music-vol" min="0" max="100" value="' + vol() + '" class="grow" aria-label="Volume"></div>' +
      '<p class="muted small" id="music-note"></p><button class="link danger" data-a="music-del">Remover esta playlist</button></div>';
    M.refresh();
  }
  M.refresh = () => {
    const sel = U.$('#music-sel'); if (!sel) return;
    sel.innerHTML = '<option value="">' + (lists().length ? 'Escolha uma playlist…' : 'Nenhuma playlist — toque em + Link') + '</option>' +
      lists().map(p => '<option value="' + e(p.id) + '"' + (p.id === M.cur ? ' selected' : '') + '>' + (M.parse(p.url).type === 'spotify' ? 'Spotify · ' : 'YouTube · ') + e(p.name) + '</option>').join('');
  };
  function api() {
    return apiP || (apiP = new Promise(ok => {
      if (window.YT && window.YT.Player) return ok();
      window.onYouTubeIframeAPIReady = ok;
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    }));
  }
  M.load = async id => {
    const p = lists().find(x => x.id === id), holder = U.$('#music-holder'), note = U.$('#music-note');
    try { yt && yt.destroy && yt.destroy(); } catch (err) {}
    yt = null; ready = false; M.cur = id || null; holder.innerHTML = ''; U.$('#music-ctl').hidden = true; note.textContent = '';
    U.$('#music-btn').classList.toggle('on', !!p);
    if (!p) return;
    const info = M.parse(p.url);
    if (info.type === 'spotify') {
      holder.innerHTML = '<iframe title="Spotify" src="https://open.spotify.com/embed/' + info.kind + '/' + info.key + '" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
      note.textContent = 'Spotify: o app não consegue abaixar o volume nos alarmes (o Spotify não permite). Sem login/Premium pode tocar só prévias. Os bipes tocam por cima da música.';
      return;
    }
    if (location.protocol === 'file:') { note.textContent = 'O player do YouTube só funciona pelo endereço publicado ou pelo "Abrir Treino.bat".'; return; }
    holder.innerHTML = '<div id="music-frame"></div>';
    note.textContent = 'Carregando…';
    await api();
    yt = new YT.Player('music-frame', { height: '170', width: '100%', videoId: info.video || undefined,
      playerVars: Object.assign({ playsinline: 1, rel: 0 }, info.list ? { listType: 'playlist', list: info.list } : {}),
      events: { onReady: ev => { ready = true; ev.target.setVolume(vol()); ev.target.playVideo(); U.$('#music-ctl').hidden = false; note.textContent = 'O volume abaixa sozinho quando um timer apita. Deixe o app aberto na tela: o YouTube pausa se a tela apagar.'; },
        onError: () => { note.textContent = 'Não consegui tocar este link (privado, removido ou bloqueado para players externos).'; } } });
  };
  // Abaixa o volume por um instante (chamado pelos bipes dos timers).
  M.duck = () => {
    if (!yt || !ready) return;
    try { if (!ducked) { ducked = true; yt.setVolume(Math.round(vol() * 0.2)); } } catch (err) {}
    clearTimeout(duckT);
    duckT = setTimeout(() => { ducked = false; try { yt.setVolume(vol()); } catch (err) {} }, 1700);
  };

  A['music-toggle'] = () => U.$('#music').classList.toggle('open');
  A['music-add'] = () => {
    const url = prompt('Cole o link de uma playlist ou vídeo do YouTube / YouTube Music, ou de uma playlist do Spotify:');
    if (!url) return;
    if (!M.parse(url)) return U.toast('Não reconheci esse link. Use um link do YouTube ou do Spotify.');
    const name = prompt('Nome para esta playlist:', 'Treino ' + (lists().length + 1)) || 'Playlist';
    const p = { id: S.uid(), t: Date.now(), name, url: url.trim() };
    lists().push(p); S.save(); M.refresh(); U.$('#music-sel').value = p.id; M.load(p.id);
  };
  A['music-del'] = () => {
    if (!M.cur || !confirm('Remover esta playlist da lista?')) return;
    S.state.playlists = lists().filter(p => p.id !== M.cur); S.state.deleted.push(M.cur); S.save(); M.load(null); M.refresh();
  };
  A['music-cmd'] = d => {
    if (!yt || !ready) return;
    try {
      if (d.c === 'prev') yt.previousVideo(); else if (d.c === 'next') yt.nextVideo();
      else if (d.c === 'shuffle') { yt.setShuffle(true); yt.nextVideo(); U.toast('Playlist embaralhada.'); }
      else if (yt.getPlayerState() === 1) yt.pauseVideo(); else yt.playVideo();
    } catch (err) {}
  };
  document.addEventListener('change', ev => { if (ev.target.id === 'music-sel') M.load(ev.target.value); });
  document.addEventListener('input', ev => { if (ev.target.id === 'music-vol') { S.cfg.musicVol = +ev.target.value; S.saveCfg(); if (yt && ready && !ducked) try { yt.setVolume(vol()); } catch (err) {} } });
  skeleton();
})();
