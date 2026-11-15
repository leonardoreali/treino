/* Seleção de mobilidade e flexibilidade (v18).
   - Aquecimento: só mobilidade ativa e controlada, nas articulações que a sessão mais exige.
   - Volta à calma: flexibilidade estática (e força em amplitude final para quem treina habilidades).
   - Rotinas avulsas: mobilidade (5–10 min), flexibilidade (10–20 min) e sessão completa (20–30 min).
   Leva em conta objetivo, nível, limitações cadastradas, habilidades e equipamentos. */
(function () {
  const MOB = window.MOB = {};
  const e = U.esc;
  // Articulações mais exigidas por padrão de movimento e por habilidade
  const BY_PAT = { 'empurrar-h': ['punho', 'ombro'], 'empurrar-v': ['ombro', 'punho', 'coluna'], 'puxar-h': ['ombro', 'coluna'], 'puxar-v': ['ombro'], agachar: ['quadril', 'tornozelo'],
    quadril: ['posterior', 'quadril'], joelho: ['posterior'], estabilizar: ['coluna', 'quadril'], locomover: ['tornozelo', 'quadril'], isolado: ['ombro'] };
  const BY_SKILL = { 'parada-mao': ['punho', 'ombro', 'coluna'], planche: ['punho', 'ombro'], 'front-lever': ['ombro', 'coluna'], 'back-lever': ['ombro'], 'l-sit': ['posterior', 'punho'],
    pistol: ['tornozelo', 'quadril', 'posterior'], 'muscle-up': ['ombro', 'punho'], 'flexao-um-braco': ['punho', 'ombro'], 'barra-um-braco': ['ombro'], posterior: ['posterior'], acrobacia: ['punho', 'coluna', 'ombro'] };
  MOB.BY_SKILL = BY_SKILL;
  // Mobilidade e alongamentos que costumam incomodar quem tem limitação na região (somados a GEN.AVOID)
  const AVOID_MOB = { punho: 'elevacao-palmas', ombro: 'german-hang skin-the-cat sleeper-stretch extensao-ombro elevacao-bracos-prono', lombar: 'jefferson-curl cobra ponte',
    joelho: 'couch-stretch couch-stretch-ativo sapo quadriceps-deitado alongamento-quadriceps agachamento-profundo pombo shin-box quadril-90-90-liftoff', quadril: 'shin-box quadril-90-90-liftoff straddle-ativo sapo', pescoco: 'ponte',
    tornozelo: 'mobilidade-tornozelo tibial-parede caminhada-ponta-calcanhar equilibrio-um-pe alongamento-panturrilha alongamento-soleo agachamento-profundo',
    cotovelo: 'punho-garrafa pronacao-supinacao alongamento-triceps elevacao-palmas german-hang skin-the-cat' };
  // Limitação marcada no perfil: os movimentos leves da região continuam (costumam ajudar), com aviso para parar se doer
  const LIMIT_REG = { ombro: ['ombro'], lombar: ['coluna'], punho: ['punho'], cotovelo: ['punho'], quadril: ['quadril'], tornozelo: ['tornozelo'], joelho: [], pescoco: [] };
  MOB.cautionNote = (limits, x) => (limits || []).some(l => (LIMIT_REG[l] || []).includes(x.reg)) ? 'Movimento leve: faça só se não doer (você marcou limitação nesta região).' : '';
  const withCaution = (items, limits) => items.map(it => { const n = MOB.cautionNote(limits, S.ex(it.ex)); return n ? Object.assign(it, { note: n }) : it; });
  MOB.avoidFor = limits => new Set((limits || []).flatMap(l => ((GEN.AVOID[l] || '') + ' ' + (AVOID_MOB[l] || '')).split(' ').filter(Boolean)));

  // Regiões em ordem de exigência, a partir dos itens de uma sessão (exercícios e habilidades)
  MOB.demand = items => {
    const n = {}; const add = (rs, w) => rs.forEach((r, i) => { n[r] = (n[r] || 0) + w - i * 0.1; });
    (items || []).forEach(it => {
      if (it.skill && BY_SKILL[it.skill]) add(BY_SKILL[it.skill], 2);
      const x = it.ex && S.ex(it.ex); if (x && BY_PAT[x.pat]) add(BY_PAT[x.pat], 1);
    });
    return Object.keys(n).sort((a, b) => n[b] - n[a]);
  };
  const ALL = ['quadril', 'coluna', 'ombro', 'posterior', 'tornozelo', 'punho'];
  // Escolhe exercícios de uma modalidade cobrindo as regiões na ordem pedida; seed varia entre sessões
  MOB.pick = ({ regions, mod, n, maxLvl, can, seed, used, noFill }) => {
    used = used || new Set(); const out = [], want = regions && regions.length ? regions.slice() : ALL.slice(), rest = ALL.filter(r => !want.includes(r));
    const pool = r => S.allExercises().filter(x => x.reg === r && x.mod === mod && !x.sup && x.level <= maxLvl && !used.has(x.id) && can(x.id)).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
    const round = (list, pass) => { for (const r of list) { if (out.length >= n) return; const c = pool(r); if (!c.length) continue; const x = c[((seed || 0) + pass) % c.length]; used.add(x.id); out.push(x); } };
    // primeiro as regiões pedidas (várias voltas, uma de cada por volta); só completa com o resto do corpo se faltar exercício
    for (let pass = 0; out.length < n && pass < 4; pass++) round(want, pass);
    for (let pass = 0; !noFill && out.length < n && pass < 2; pass++) round(rest, pass);
    return out;
  };
  MOB.item = (x, scale) => { const d = x.dose || { sets: 1, min: 30, max: 30, unit: 's' }, sets = scale === 'warm' ? 1 : d.sets; return Object.assign({ ex: x.id, sets, min: d.min, max: d.max, unit: d.unit }, d.side ? { side: true } : {}); };

  // ---------- no gerador ----------
  MOB.warmup = (regions, ctx) => withCaution(MOB.pick({ regions, mod: 'ativa', n: ctx.n || 3, maxLvl: Math.min(2, ctx.lvl + 1), can: ctx.can, seed: ctx.seed }).map(x => MOB.item(x, 'warm')), ctx.limits);
  MOB.cooldown = (regions, ctx) => {
    const n = ctx.time <= 30 ? 3 : ctx.time <= 45 ? 4 : 5, used = new Set();
    const st = MOB.pick({ regions, mod: 'estatica', n, maxLvl: ctx.lvl + 1, can: ctx.can, seed: ctx.seed, used });
    const fin = ctx.goal === 'habilidades' || ctx.lvl >= 2 ? MOB.pick({ regions: regions.slice(0, 2), mod: 'final', n: 1, maxLvl: ctx.lvl + 1, can: ctx.can, seed: ctx.seed, used }) : [];
    const items = withCaution(fin.concat(st).map(x => MOB.item(x)), ctx.limits), mins = Math.max(5, Math.round(items.reduce((a, it) => a + it.sets * (it.unit === 's' ? it.max : it.max * 4) * (it.side ? 2 : 1), 0) / 60));
    return { title: 'Volta à calma: alongamento (' + mins + ' min)', kind: 'check', note: 'Foco: ' + regions.slice(0, 3).map(r => REGIONS[r].toLowerCase()).join(', ') + '. Alongamento estático fica no fim do treino: antes de força ou salto ele pode diminuir o rendimento.', items };
  };

  // ---------- rotinas avulsas ----------
  const TYPES = {
    mob: { name: 'Mobilidade', time: '5–10 min', parts: [['ativa', 7]] },
    flex: { name: 'Flexibilidade', time: '10–20 min', parts: [['ativa', 3], ['estatica', 6]] },
    full: { name: 'Sessão completa', time: '20–30 min', parts: [['ativa', 4], ['final', 3], ['estatica', 6]] },
  };
  const TITLES = { ativa: 'Mobilidade ativa (movimentos lentos e amplos)', final: 'Força em amplitude final', estatica: 'Alongamento estático (segure a posição)' };
  const profile = () => S.state.profile || {};
  const focusRegions = f => {
    if (REGIONS[f]) return [f];
    if (f === 'skills') { const ids = new Set(); [S.program()].forEach(p => p.sessions.forEach(s => s.blocks.forEach(b => (b.items || []).forEach(it => it.skill && ids.add(it.skill))))); const r = MOB.demand([...ids].map(skill => ({ skill }))); return r.length ? r : ALL; }
    if (f === 'today') { const p = S.program(), s = p.sessions[S.sessionIdx()]; return s ? MOB.demand(s.blocks.flatMap(b => b.items || []).map(it => it.skill ? it : { ex: W.resolve(it, p.id, 'x') })) : ALL; }
    return ALL;
  };
  MOB.routine = (type, focus) => {
    const t = TYPES[type], pr = profile(), lvl = Math.max(1, Math.min(3, +pr.nivel || 1)), avoid = MOB.avoidFor(pr.limit);
    const hr = window.HEALTH ? HEALTH.rules() : null;
    const can = id => !avoid.has(id) && !S.missing(id).length && !(hr && HEALTH.mobReason(S.ex(id), hr));
    const regions = focusRegions(focus), used = new Set(), seed = new Date().getDate();
    const blocks = t.parts.map(([mod, n]) => {
      const xs = MOB.pick({ regions: focus === 'all' ? ALL : regions, mod, n: REGIONS[focus] ? Math.min(n, 4) : n, maxLvl: lvl + 1, can, seed, used, noFill: !!REGIONS[focus] });
      return xs.length ? { title: TITLES[mod], kind: 'check', items: xs.map(x => MOB.item(x, type === 'mob' ? 'warm' : '')) } : null;
    }).filter(Boolean);
    if (REGIONS[focus]) { // foco numa região só: completa com o resto do corpo para não ficar curto demais
      const extra = MOB.pick({ regions: ALL.filter(r => r !== focus), mod: type === 'mob' ? 'ativa' : 'estatica', n: 2, maxLvl: lvl + 1, can, seed, used });
      if (extra.length) blocks.push({ title: 'Resto do corpo', kind: 'check', items: extra.map(x => MOB.item(x, type === 'mob' ? 'warm' : '')) });
    }
    const label = { all: 'corpo todo', skills: 'minhas habilidades', today: 'treino de hoje' }[focus] || REGIONS[focus].toLowerCase();
    blocks.forEach(b => withCaution(b.items, pr.limit));
    const locked = hr && REGIONS[focus] && hr.mob.some(m => m.mode === 'lock' && HEALTH.mobRegions(m.area).includes(focus));
    return { name: t.name + ' — ' + label, blocks, locked };
  };
  A['mob-menu'] = () => {
    const opt = (v, l) => '<option value="' + v + '">' + l + '</option>';
    U.modal('<h2>Mobilidade e alongamento</h2><p class="muted small">Rotinas montadas na hora pelas suas habilidades, limitações cadastradas e equipamentos. Não contam como treino da fila.</p>' +
      Object.entries(TYPES).map(([k, t], i) => '<label class="chk"><input type="radio" name="mob-type" value="' + k + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + t.name + '</b> · ' + t.time + '<br><small class="muted">' +
        { mob: 'Movimentos articulares ativos. Pode ser usada como aquecimento antes de treinar.', flex: 'Alongamentos mantidos. Melhor em dia separado ou depois do treino, não antes de força ou salto.', full: 'Mobilidade, força em amplitude final e alongamento. Para um dia dedicado à flexibilidade.' }[k] + '</small></span></label>').join('') +
      '<label>Foco <select id="mob-focus">' + opt('all', 'Corpo todo') + opt('today', 'Articulações do treino de hoje') + opt('skills', 'Minhas habilidades') + Object.entries(REGIONS).map(r => opt(r[0], r[1])).join('') + '</select></label>' +
      '<button class="btn block" data-a="mob-go">▶ Começar</button>');
  };
  A['mob-go'] = () => {
    const type = (document.querySelector('input[name="mob-type"]:checked') || {}).value || 'mob', focus = U.$('#mob-focus').value;
    if (S.current) return U.toast('Termine ou descarte o treino em andamento primeiro.');
    W.flexOverride = MOB.routine(type, focus);
    if (W.flexOverride.locked) { W.flexOverride = null; return U.toast('Essa região está em recuperação (tela Saúde): exercícios nela só com orientação do profissional.'); }
    if (!W.flexOverride.blocks.length) { W.flexOverride = null; return U.toast('Nenhum exercício disponível com seus equipamentos e limitações.'); }
    U.closeModal(); A.start({ type: 'flex' });
  };
})();
