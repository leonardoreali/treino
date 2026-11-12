/* Estado do app (salvo no navegador) + sincronização opcional via GitHub Gist. */
(function () {
  const KEY = 'calistenia.state.v1', CFG = 'calistenia.config.v1', CUR = 'calistenia.current.v1';
  const SYNC_FILE = 'calistenia-dados.json';
  const pad = n => String(n).padStart(2, '0');
  const S = window.S = {};

  S.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  S.today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  S.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);

  function fresh() {
    const p = JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
    return { v: 1, programs: { [p.id]: p }, activeProgram: p.id, pos: { [p.id]: 0 }, logs: JSON.parse(JSON.stringify(DEFAULT_LOGS)),
      skills: {}, swaps: {}, videos: {}, measures: [], customEx: [], deleted: [], phase2: false, updatedAt: 0 };
  }
  function read(k, def) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.warn('Não foi possível salvar', e); } }

  S.state = Object.assign(fresh(), read(KEY, {}));
  S.cfg = Object.assign({ sound: true, token: '', gistId: '', lastSync: 0 }, read(CFG, {}));
  S.current = read(CUR, null);

  S.save = function (opts) {
    S.state.updatedAt = Date.now();
    write(KEY, S.state);
    if (!(opts && opts.noSync)) S.scheduleSync();
  };
  S.saveCfg = () => write(CFG, S.cfg);
  S.saveCurrent = () => { if (S.current) write(CUR, S.current); else localStorage.removeItem(CUR); };
  S.reset = () => { S.state = fresh(); S.current = null; S.saveCurrent(); S.save(); };

  // ---------- consultas ----------
  S.allExercises = () => EXERCISES.concat(S.state.customEx || []);
  S.ex = id => S.allExercises().find(e => e.id === id) || { id, name: id, cat: 'outros', level: 1, how: '', q: id };
  S.program = () => S.state.programs[S.state.activeProgram] || Object.values(S.state.programs)[0];
  S.pos = () => S.state.pos[S.program().id] || 0;
  S.setPos = n => { S.state.pos[S.program().id] = Math.max(0, n); };
  S.round = () => Math.floor(S.pos() / S.program().sessions.length) + 1;
  S.sessionIdx = () => S.pos() % S.program().sessions.length;
  S.finished = () => S.pos() >= S.program().rounds * S.program().sessions.length;
  S.isDeload = r => (S.program().deloadRounds || []).includes(r == null ? S.round() : r);
  S.skill = id => SKILLS.find(s => s.id === id);
  S.skillStep = id => { const s = S.skill(id); const v = S.state.skills[id]; return Math.min(v == null ? s.start : v, s.steps.length - 1); };
  S.videoFor = exId => {
    const custom = S.state.videos[exId];
    if (custom === '') return null;
    return custom || (S.ex(exId).video) || (window.VIDEOS || {})[exId] || null;
  };
  S.logsFor = exId => S.state.logs.filter(l => (l.items || []).some(i => i.ex === exId)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
    .map(l => ({ log: l, item: l.items.find(i => i.ex === exId) }));
  S.sortedLogs = () => S.state.logs.slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.t || 0) - (a.t || 0));
  S.removeLog = id => { S.state.logs = S.state.logs.filter(l => l.id !== id); S.state.deleted.push(id); S.save(); };
  S.removeMeasure = id => { S.state.measures = S.state.measures.filter(l => l.id !== id); S.state.deleted.push(id); S.save(); };

  // Quantos dos últimos 2 treinos com o exercício cumpriram o critério (0, 1 ou 2).
  S.critProgress = step => {
    const ls = S.logsFor(step.ex).slice(-2).reverse();
    let n = 0;
    for (const { item } of ls) {
      if (item.sets.filter(v => v >= step.crit.val).length >= step.crit.sets) n++; else break;
    }
    return n;
  };

  // ---------- sincronização (GitHub Gist privado) ----------
  let timer = null, busy = false;
  S.syncStatus = S.cfg.token ? 'Aguardando' : 'Desligada';
  S.onSync = () => {};
  const setStatus = s => { S.syncStatus = s; try { S.onSync(s); } catch (e) {} };
  async function gh(path, opts) {
    const r = await fetch('https://api.github.com' + path, Object.assign({}, opts, {
      headers: { Authorization: 'Bearer ' + S.cfg.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }));
    if (!r.ok) throw new Error(r.status === 401 ? 'Token inválido ou expirado' : r.status === 404 ? 'Não encontrado (o token tem permissão de gist?)' : 'GitHub respondeu ' + r.status);
    return r.json();
  }
  function union(a, b, deleted) {
    const m = new Map();
    for (const x of (a || []).concat(b || [])) { const o = m.get(x.id); if (!o || (x.t || 0) > (o.t || 0)) m.set(x.id, x); }
    return [...m.values()].filter(x => !deleted.includes(x.id));
  }
  S.merge = function (local, remote) {
    if (!remote || !remote.v) return local;
    const newer = (remote.updatedAt || 0) > (local.updatedAt || 0) ? remote : local;
    const out = Object.assign({}, local, newer);
    out.deleted = [...new Set((local.deleted || []).concat(remote.deleted || []))];
    out.logs = union(local.logs, remote.logs, out.deleted);
    out.measures = union(local.measures, remote.measures, out.deleted);
    out.customEx = union(local.customEx, remote.customEx, out.deleted);
    out.programs = Object.assign({}, remote.programs, local.programs, newer.programs);
    for (const id of out.deleted) delete out.programs[id];
    if (!out.programs[out.activeProgram]) out.activeProgram = Object.keys(out.programs)[0];
    out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
    return out;
  };
  S.sync = async function () {
    if (!S.cfg.token || busy) return;
    busy = true; setStatus('Sincronizando…');
    try {
      if (!S.cfg.gistId) {
        const list = await gh('/gists?per_page=100');
        const found = list.find(g => g.files && g.files[SYNC_FILE]);
        if (found) S.cfg.gistId = found.id;
        else S.cfg.gistId = (await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Dados do app de treino (sincronização)', public: false, files: { [SYNC_FILE]: { content: '{}' } } }) })).id;
        S.saveCfg();
      }
      const g = await gh('/gists/' + S.cfg.gistId);
      const f = g.files[SYNC_FILE];
      let remote = {};
      if (f) { const txt = f.truncated ? await (await fetch(f.raw_url)).text() : f.content; try { remote = JSON.parse(txt); } catch (e) {} }
      const before = JSON.stringify(S.state);
      S.state = S.merge(S.state, remote);
      const after = JSON.stringify(S.state);
      write(KEY, S.state);
      if (after !== JSON.stringify(remote)) await gh('/gists/' + S.cfg.gistId, { method: 'PATCH', body: JSON.stringify({ files: { [SYNC_FILE]: { content: after } } }) });
      S.cfg.lastSync = Date.now(); S.saveCfg();
      setStatus('Sincronizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      if (before !== after && S.onRemoteChange) S.onRemoteChange();
    } catch (e) {
      if (/Não encontrado/.test(e.message) && S.cfg.gistId) { S.cfg.gistId = ''; S.saveCfg(); }
      setStatus('Erro: ' + e.message);
    } finally { busy = false; }
  };
  S.scheduleSync = function () { if (!S.cfg.token) return; clearTimeout(timer); timer = setTimeout(S.sync, 4000); };
})();
