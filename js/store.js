/* Estado do app (salvo no navegador) + sincronização opcional via GitHub Gist.
   Sincronização: mesclagem em três vias (aparelho × nuvem × última versão comum), campo a campo,
   com contador de versão para detectar gravações simultâneas. Backups validados e migrados. */
(function () {
  const KEY = 'calistenia.state.v1', CFG = 'calistenia.config.v1', CUR = 'calistenia.current.v1';
  const BASE = 'calistenia.base.v1', GOOD = 'calistenia.lastgood.v1', PREV = 'calistenia.prev.v1';
  const SYNC_FILE = 'calistenia-dados.json';
  const FORMAT_VERSION = 2;
  const pad = n => String(n).padStart(2, '0');
  const S = window.S = {};

  S.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  S.today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  S.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);

  function fresh() {
    const p = JSON.parse(JSON.stringify(DEFAULT_PROGRAM));
    return { v: FORMAT_VERSION, programs: { [p.id]: p }, activeProgram: p.id, pos: { [p.id]: 0 }, logs: JSON.parse(JSON.stringify(DEFAULT_LOGS)),
      skills: {}, swaps: {}, videos: {}, measures: [], customEx: [], deleted: [], phase2: false, updatedAt: 0, rev: 0 };
  }
  function readRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function read(k, def) { try { const v = JSON.parse(readRaw(k)); return v == null ? def : v; } catch (e) { return def; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { console.warn('Não foi possível salvar', e); return false; } }

  // ---------- validação e migração ----------
  const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
  const ID_LISTS = ['logs', 'measures', 'customEx', 'customEquip', 'conditions', 'diet', 'alunos', 'playlists'];
  // Confere a estrutura de um estado. Devolve a lista de problemas graves (vazia = ok).
  S.validate = st => {
    const err = [];
    if (!isObj(st)) return ['o arquivo não contém dados do app'];
    if (!isObj(st.programs) || !Object.keys(st.programs).length) err.push('nenhum programa de treino');
    else Object.entries(st.programs).forEach(([id, p]) => { if (!isObj(p) || !Array.isArray(p.sessions) || !p.sessions.length) err.push('programa "' + id + '" sem sessões'); });
    ID_LISTS.forEach(k => { if (st[k] != null && !Array.isArray(st[k])) err.push('"' + k + '" não é uma lista'); });
    return err;
  };
  // Leva qualquer versão antiga (ou dados com defeito) ao formato atual. Itens inválidos são descartados e contados.
  S.migrate = st => {
    const out = Object.assign(fresh(), st), base = fresh(); let fixed = 0;
    ['skills', 'swaps', 'videos', 'pos', 'programs'].forEach(k => { if (!isObj(out[k])) { out[k] = base[k]; fixed++; } });
    ID_LISTS.concat(['deleted']).forEach(k => { if (out[k] == null) out[k] = []; if (!Array.isArray(out[k])) { out[k] = []; fixed++; } });
    const okLog = l => isObj(l) && l.id && /^\d{4}-\d{2}-\d{2}$/.test(l.date || '') && Array.isArray(l.items) && l.items.every(i => isObj(i) && i.ex && Array.isArray(i.sets));
    const n = out.logs.length; out.logs = out.logs.filter(okLog); fixed += n - out.logs.length;
    ['measures', 'customEx', 'customEquip', 'conditions', 'diet', 'alunos', 'playlists'].forEach(k => { const m = out[k].length; out[k] = out[k].filter(x => isObj(x) && x.id); fixed += m - out[k].length; });
    Object.keys(out.programs).forEach(id => { const p = out.programs[id]; if (!isObj(p) || !Array.isArray(p.sessions) || !p.sessions.length) { delete out.programs[id]; fixed++; } else p.id = p.id || id; });
    if (!Object.keys(out.programs).length) { out.programs = base.programs; out.activeProgram = base.activeProgram; fixed++; }
    if (!out.programs[out.activeProgram]) out.activeProgram = Object.keys(out.programs)[0];
    out.v = FORMAT_VERSION; out.rev = out.rev || 0;
    return { state: out, fixed };
  };

  // ---------- carregamento com recuperação ----------
  S.recovered = null;
  (function load() {
    const raw = readRaw(KEY);
    let st = null;
    if (raw) { try { st = JSON.parse(raw); } catch (e) { st = null; } }
    if (raw && (!st || S.validate(st).length)) { // dados corrompidos: tenta a última cópia boa
      const good = read(GOOD, null);
      if (good && good.state && !S.validate(good.state).length) { st = good.state; S.recovered = 'Os dados deste aparelho estavam corrompidos. Recuperei a cópia de segurança de ' + new Date(good.d.length > 10 ? good.d : good.d + 'T12:00').toLocaleString((window.I18N && I18N.locale || 'pt-BR'), { dateStyle: 'short', timeStyle: good.d.length > 10 ? 'short' : undefined }) + '.'; }
      else if (st) { S.recovered = 'Alguns dados estavam com defeito e foram corrigidos.'; }
      try { localStorage.setItem(KEY + '.corrompido', raw); } catch (e) {}
    }
    const m = S.migrate(st || {});
    S.state = m.state;
    if (m.fixed && st && !S.recovered) S.recovered = m.fixed + ' registro(s) com defeito foram descartados ao abrir.';
  })();
  S.cfg = Object.assign({ sound: true, token: '', gistId: '', lastSync: 0 }, read(CFG, {}));
  S.current = read(CUR, null);

  S.save = function (opts) {
    S.state.updatedAt = Date.now();
    write(KEY, S.state);
    // cópia de segurança (no máximo 1 por minuto), só de dados válidos: é dela que o app se recupera se algo corromper
    if (Date.now() - (S._goodAt || 0) > 60000 && !S.validate(S.state).length) { S._goodAt = Date.now(); write(GOOD, { d: new Date().toISOString(), state: S.state }); }
    if (!(opts && opts.noSync)) S.scheduleSync();
  };
  S.saveCfg = () => write(CFG, S.cfg);
  S.saveCurrent = () => { if (S.current) write(CUR, S.current); else localStorage.removeItem(CUR); };
  S.reset = () => { S.keepPrevious(); S.state = fresh(); S.current = null; S.saveCurrent(); S.save(); };

  // ---------- backup ----------
  S.exportData = () => ({ format: 'treino-backup', fv: FORMAT_VERSION, exportedAt: new Date().toISOString(), state: S.state });
  S.keepPrevious = () => write(PREV, { d: new Date().toISOString(), state: S.state });
  S.previous = () => read(PREV, null);
  // Lê um arquivo de backup (formato novo ou antigo). Devolve { state, fixed } ou lança erro com a explicação.
  S.parseBackup = text => {
    let d; try { d = JSON.parse(text); } catch (e) { throw new Error('o arquivo não é um backup válido (não está em formato JSON)'); }
    const st = d && d.format === 'treino-backup' ? d.state : d;
    if (d && d.fv > FORMAT_VERSION) throw new Error('o backup foi feito numa versão mais nova do app: atualize o app antes de restaurar');
    const err = S.validate(st);
    if (err.length) throw new Error('backup com problema: ' + err.slice(0, 3).join('; '));
    return S.migrate(st);
  };
  S.restore = st => { S.keepPrevious(); S.state = st; S.current = null; S.saveCurrent(); S.save(); };
  S.undoRestore = () => { const p = S.previous(); if (!p) return false; const cur = S.state; S.state = S.migrate(p.state).state; write(PREV, { d: new Date().toISOString(), state: cur }); S.save(); return true; };

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
  S.logsFor = exId => S.state.logs.filter(l => (l.items || []).some(i => i.ex === exId)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.t || 0) - (b.t || 0))
    .map(l => ({ log: l, item: l.items.find(i => i.ex === exId) }));
  S.sortedLogs = () => S.state.logs.slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.t || 0) - (a.t || 0));
  S.removeLog = id => { S.state.logs = S.state.logs.filter(l => l.id !== id); S.state.deleted.push(id); S.save(); };
  S.removeMeasure = id => { S.state.measures = S.state.measures.filter(l => l.id !== id); S.state.deleted.push(id); S.save(); };

  // ---------- equipamentos ----------
  S.allEquip = () => EQUIP.concat(S.state.customEquip || []);
  S.owned = () => S.state.equip || EQUIP_DEFAULT;
  S.needs = exId => S.ex(exId).equip || EQUIP_NEEDS[exId] || [];
  S.missing = exId => { const own = S.owned(); return S.needs(exId).filter(q => !own.includes(q)).map(q => (S.allEquip().find(x => x.id === q) || { name: q }).name); };

  // Quantos dos últimos 2 treinos com o exercício cumpriram o critério (0, 1 ou 2).
  S.critProgress = step => {
    const ls = S.logsFor(step.ex).slice(-2).reverse();
    let n = 0;
    for (const { item } of ls) {
      if (item.sets.filter(v => v >= step.crit.val).length >= step.crit.sets) n++; else break;
    }
    return n;
  };

  // ---------- mesclagem em três vias ----------
  // Compara pelo conteúdo, independente da ordem das chaves.
  const stable = x => Array.isArray(x) ? '[' + x.map(stable).join(',') + ']' : isObj(x) ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + stable(x[k])).join(',') + '}' : JSON.stringify(x === undefined ? null : x);
  const same = (a, b) => stable(a) === stable(b);
  function union(a, b, deleted) {
    const m = new Map();
    for (const x of (a || []).concat(b || [])) { if (!x || !x.id) continue; const o = m.get(x.id); if (!o || (x.t || 0) > (o.t || 0)) m.set(x.id, x); }
    return [...m.values()].filter(x => !deleted.includes(x.id));
  }
  // base = última versão que os dois lados tinham em comum. Só um lado mudou → fica a mudança; os dois mudaram → conflito.
  function merge3(base, l, r, path, ctx) {
    if (same(l, r)) return l;
    if (isObj(l) && isObj(r) && (base === undefined || isObj(base))) {
      const out = {}, b = base || {};
      new Set(Object.keys(l).concat(Object.keys(r))).forEach(k => { const v = merge3(b[k], l[k], r[k], path ? path + '.' + k : k, ctx); if (v !== undefined) out[k] = v; });
      return out;
    }
    if (base !== undefined && same(l, base)) return r;
    if (base !== undefined && same(r, base)) return l;
    const empty = x => x === undefined || x === null || x === '' || x === false || (isObj(x) && !Object.keys(x).length) || (Array.isArray(x) && !x.length);
    if (empty(l)) return r; if (empty(r)) return l;
    if (/^pos\./.test(path) && typeof l === 'number' && typeof r === 'number') return Math.max(l, r); // fila: nunca volta para trás
    if (ctx.noBase) return r; // primeiro encontro deste aparelho com a nuvem: a nuvem prevalece (registros com id são somados de qualquer forma)
    ctx.conflicts.push(path);
    return ctx.remoteNewer ? r : l;
  }
  S.merge = function (local, remote, base) {
    if (!remote || !remote.v) return { state: local, conflicts: [] };
    const ctx = { conflicts: [], remoteNewer: (remote.updatedAt || 0) > (local.updatedAt || 0), noBase: !base };
    const SKIP = new Set(ID_LISTS.concat(['deleted', 'updatedAt', 'rev']));
    const pick = o => { const c = {}; Object.keys(o || {}).forEach(k => { if (!SKIP.has(k)) c[k] = o[k]; }); return c; };
    const out = merge3(base ? pick(base) : undefined, pick(local), pick(remote), '', ctx);
    out.deleted = [...new Set((local.deleted || []).concat(remote.deleted || []))];
    ID_LISTS.forEach(k => { out[k] = union(local[k], remote[k], out.deleted); });
    for (const id of out.deleted) if (out.programs) delete out.programs[id];
    if (!out.programs || !Object.keys(out.programs).length) out.programs = local.programs;
    if (!out.programs[out.activeProgram]) out.activeProgram = Object.keys(out.programs)[0];
    out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
    out.rev = Math.max(local.rev || 0, remote.rev || 0);
    out.v = FORMAT_VERSION;
    return { state: S.migrate(out).state, conflicts: ctx.conflicts };
  };

  // ---------- sincronização (GitHub Gist privado) ----------
  let timer = null, busy = false;
  S.syncStatus = S.cfg.token ? 'Aguardando' : 'Desligada';
  S.onSync = () => {};
  const setStatus = s => { S.syncStatus = s; try { S.onSync(s); } catch (e) {} };
  S.gh = async function (path, opts) {
    const r = await fetch('https://api.github.com' + path, Object.assign({}, opts, {
      headers: { Authorization: 'Bearer ' + S.cfg.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }));
    const exp = r.headers && r.headers.get && r.headers.get('github-authentication-token-expiration');
    if (exp && S.cfg.tokenExp !== exp) { S.cfg.tokenExp = exp; S.saveCfg(); }
    if (!r.ok) {
      const err = new Error(r.status === 401 ? 'token inválido, expirado ou revogado: gere um novo e cole em Ajustes' : r.status === 404 ? 'não encontrado (o token tem permissão de gist?)' : r.status === 403 ? 'acesso negado pelo GitHub (permissão ou limite de uso)' : 'o GitHub respondeu ' + r.status);
      err.status = r.status; throw err;
    }
    return r.status === 204 ? null : r.json();
  };
  async function readRemote() {
    const g = await S.gh('/gists/' + S.cfg.gistId), f = g.files[SYNC_FILE];
    let remote = {};
    if (f) { const txt = f.truncated ? await (await fetch(f.raw_url)).text() : f.content; try { remote = JSON.parse(txt); } catch (e) { remote = {}; } }
    return remote;
  }
  S.sync = async function () {
    if (!S.cfg.token || busy) return;
    busy = true; setStatus('Sincronizando…');
    try {
      if (!S.cfg.gistId) {
        const list = await S.gh('/gists?per_page=100');
        const found = list.find(g => g.files && g.files[SYNC_FILE]);
        if (found) S.cfg.gistId = found.id;
        else S.cfg.gistId = (await S.gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'Dados do app Nina Calisthenics (sincronização)', public: false, files: { [SYNC_FILE]: { content: '{}' } } }) })).id;
        S.saveCfg();
      }
      const before = stable(S.state), base = read(BASE, null);
      let remote = await readRemote(), conflicts = [], tries = 0, merged;
      if (remote.v && S.validate(remote).length) throw new Error('os dados na nuvem estão com defeito; nada foi sobrescrito');
      for (;;) {
        const m = S.merge(S.state, remote, base); merged = m.state; conflicts = m.conflicts;
        if (same(merged, remote)) break;                      // nuvem já está igual: nada a gravar
        // controle de versão: se outro aparelho gravou enquanto mesclávamos, mescla de novo
        const check = await readRemote();
        if ((check.rev || 0) !== (remote.rev || 0) && tries++ < 3) { remote = check; continue; }
        merged.rev = Math.max(merged.rev || 0, remote.rev || 0) + 1;
        await S.gh('/gists/' + S.cfg.gistId, { method: 'PATCH', body: JSON.stringify({ files: { [SYNC_FILE]: { content: JSON.stringify(merged) } } }) });
        break;
      }
      // só depois de gravar com sucesso: vira a nova base comum (sincronização interrompida não perde nada)
      S.state = merged; write(KEY, S.state); write(BASE, merged);
      S.cfg.lastSync = Date.now(); S.saveCfg();
      const hora = new Date().toLocaleTimeString((window.I18N && I18N.locale || 'pt-BR'), { hour: '2-digit', minute: '2-digit' });
      setStatus(conflicts.length ? 'Sincronizado às ' + hora + '. ' + conflicts.length + ' alteração(ões) feita(s) ao mesmo tempo nos dois aparelhos: ficou a mais recente.' : 'Sincronizado às ' + hora);
      if (before !== stable(S.state) && S.onRemoteChange) S.onRemoteChange();
    } catch (e) {
      if (e.status === 404 && S.cfg.gistId) { S.cfg.gistId = ''; S.saveCfg(); }
      setStatus('Erro: ' + e.message);
    } finally { busy = false; }
  };
  S.scheduleSync = function () { if (!S.cfg.token) return; clearTimeout(timer); timer = setTimeout(S.sync, 4000); };
  // Desligar neste aparelho: esquece o token. O backup na nuvem continua lá.
  S.disconnect = () => { S.cfg.token = ''; S.cfg.gistId = ''; S.cfg.tokenExp = ''; S.saveCfg(); try { localStorage.removeItem(BASE); } catch (e) {} S.syncStatus = 'Desligada'; };
  // Apagar o backup na nuvem (o Gist). Os dados deste aparelho ficam.
  S.deleteRemote = async () => {
    if (!S.cfg.token) throw new Error('conecte o token primeiro');
    if (!S.cfg.gistId) { const list = await S.gh('/gists?per_page=100'), f = list.find(g => g.files && g.files[SYNC_FILE]); if (f) S.cfg.gistId = f.id; }
    if (S.cfg.gistId) await S.gh('/gists/' + S.cfg.gistId, { method: 'DELETE' });
    S.disconnect();
  };
})();
