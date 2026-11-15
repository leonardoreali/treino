/* Saúde e lesões: condições registradas que ficam valendo até a pessoa resolver.
   - Dor temporária, lesão/fratura/cirurgia (com fases de retorno) ou condição crônica;
   - "sem diagnóstico" usa regras gerais da região; um diagnóstico usa regras específicas;
   - todo treino montado passa por estas regras; a dor é acompanhada a cada treino.
   Não é orientação médica: serve para apoiar o acompanhamento de um profissional de saúde. */
(function () {
  const e = U.esc, H = window.HEALTH = {};
  // Origem e revisão das regras. Atualize aqui quando um profissional revisar ou quando as regras mudarem.
  H.RULES_INFO = { versao: '1.1', data: '14/11/2026', origem: 'Regras gerais de atividade física para dor, lesão e condições crônicas, escritas pelo desenvolvedor do app com base em orientações amplamente divulgadas (evitar impacto, carga e amplitude que provocam dor; retorno gradual depois da liberação).', revisao: 'Ainda não revisadas por médico, fisioterapeuta ou profissional de educação física.' };
  H.rulesNote = () => 'Regras v' + H.RULES_INFO.versao + ' (' + H.RULES_INFO.data + '). ' + H.RULES_INFO.revisao;
  const conds = () => S.state.conditions || (S.state.conditions = []);
  const active = () => conds().filter(c => !c.resolved);
  const alunos = () => S.state.alunos || [];
  const ownerOf = id => alunos().find(a => (a.conditions || []).some(c => c.id === id)) || null;
  // Acha a condição (do usuário ou de um aluno) e marca o dono como alterado, para sincronizar.
  const findC = id => { const own = conds().find(x => x.id === id); if (own) return own; const a = ownerOf(id); if (!a) return null; a.t = Date.now(); return a.conditions.find(x => x.id === id); };
  const rerender = () => { if (['#saude', '#aluno'].includes(location.hash)) APP.render(); };
  const ids = s => (s || '').split(' ').filter(Boolean);

  H.AREAS = { joelho: 'Joelho', ombro: 'Ombro', lombar: 'Coluna lombar', pescoco: 'Pescoço', punho: 'Punho e mão', cotovelo: 'Cotovelo', braco: 'Braço / antebraço', quadril: 'Quadril', perna: 'Coxa / canela', tornozelo: 'Tornozelo e pé', costela: 'Costela / tórax' };
  const REGION = { ombro: 'up', cotovelo: 'up', punho: 'up', braco: 'up', joelho: 'low', quadril: 'low', perna: 'low', tornozelo: 'low', lombar: 'lombar', costela: 'costela', pescoco: 'pescoco' };
  const REGION_CATS = { up: ['empurrar', 'puxar', 'habilidade'], low: ['pernas'], lombar: ['core'], costela: ['core'], pescoco: ['habilidade'] };
  const PROTECT = { up: ['noHang', 'noHands', 'noJump'], low: ['noJump', 'noStandCardio'], lombar: ['noSpinalFlex', 'noJump'], costela: ['noSpinalFlex', 'noJump'], pescoco: ['noInvert'] };
  const BASE_AVOID = { braco: ['cotovelo', 'punho'], perna: ['joelho', 'tornozelo'], costela: [] };
  const baseAvoid = area => (BASE_AVOID[area] || [area]).flatMap(a => ids(GEN.AVOID[a]));
  const FLAG_EX = {
    noJump: 'agachamento-salto salto-grupado burpee corda polichinelo joelho-alto mountain-climber flexao-explosiva flexao-palma estrela rodante kip-up macaco mortal-tras mortal-frente',
    noInvert: 'parada-mao-parede parada-mao-um-pe parada-mao-toques parada-mao-livre hspu-parede pike-pushup-elevado parada-ponte rolamento-frente rolamento-tras',
    noHands: 'prancha prancha-lateral mountain-climber burpee crow',
    noSpinalFlex: 'abdominal abdominal-infra abdominal-obliquo abdominal-bicicleta abdominal-maquina abdominal-polia russian-twist elevacao-pernas toes-to-bar vsit dragon-flag pike-pe pancake contrai-relaxa-pike terra',
    noStandCardio: 'caminhada corda escada escada-maq esteira eliptico polichinelo joelho-alto burpee',
  };
  const FLAG_TEXT = { noJump: 'sem saltos nem impacto', noInvert: 'sem posições de cabeça para baixo', noHang: 'sem pendurar na barra', noHands: 'sem apoio nas mãos', noSpinalFlex: 'sem flexionar a coluna com carga (abdominais tradicionais)', noStandCardio: 'sem cardio em pé', noHIIT: 'sem intervalado intenso', noValsalva: 'cargas moderadas (10+ repetições), isometrias de até 30 s, sem prender a respiração' };

  // Diagnósticos específicos por região. avoid = exercícios evitados; prefer = costumam ser bem tolerados; tips = orientação geral.
  const SPEC = {
    joelho: [
      { id: 'pfps', name: 'Dor na frente do joelho / condromalácia', avoid: 'pistol pistol-assistido pistol-banco shrimp agachamento-salto salto-grupado bulgaro cossack extensora hack afundo-halteres passada avanco', flags: ['noJump'], prefer: 'ponte-gluteo-elastico clamshell monster-walk wall-sit meia-ponte', tips: ['Agache só até onde não doer.', 'Fortalecer quadril e glúteo costuma aliviar a frente do joelho.'] },
      { id: 'menisco', name: 'Lesão de menisco', avoid: 'pistol pistol-assistido shrimp cossack agachamento-salto salto-grupado pombo lagarto borboleta', flags: ['noJump'], tips: ['Evite agachar fundo e girar o joelho com o pé apoiado.'] },
      { id: 'lca', name: 'Lesão ou cirurgia de ligamento (LCA)', lesao: true, avoid: 'agachamento-salto salto-grupado cossack passada avanco afundo-halteres burpee corda estrela rodante kip-up macaco', flags: ['noJump'], tips: ['Siga o protocolo do fisioterapeuta: a volta completa costuma levar meses.', 'Mudança de direção e saltos só com liberação.'] },
      { id: 'tendinite_patelar', name: 'Tendinite patelar', avoid: 'agachamento-salto salto-grupado pistol shrimp', flags: ['noJump'], prefer: 'wall-sit', tips: ['Isometria (cadeirinha na parede) costuma aliviar a dor do tendão.'] },
      { id: 'artrose_joelho', name: 'Artrose no joelho', cronica: true, avoid: 'agachamento-salto salto-grupado burpee corda pistol shrimp', flags: ['noJump'], prefer: 'bicicleta wall-sit ponte-gluteo-elastico', tips: ['Movimento ajuda a articulação: prefira baixo impacto e fortalecimento da coxa.'] },
    ],
    ombro: [
      { id: 'manguito', name: 'Tendinite / impacto do manguito rotador', avoid: 'dips mergulho-banco hspu-parede pike-pushup pike-pushup-elevado desenvolvimento-halteres desenvolvimento-maquina arnold remada-alta parada-mao-parede muscle-up barra-explosiva supino-barra', prefer: 'rotacao-externa wall-slide face-pull ytw escapula-barra', tips: ['Evite levantar o braço acima da cabeça com carga enquanto doer.'] },
      { id: 'luxacao_ombro', name: 'Luxação / instabilidade do ombro', lesao: true, avoid: 'dips mergulho-banco supino-barra crucifixo peck-deck crossover pullover hspu-parede parada-mao-parede muscle-up barra-explosiva back-lever passagem-ombro dead-hang', tips: ['Evite o braço aberto e girado para trás (posição de arremesso).'] },
      { id: 'bursite_ombro', name: 'Bursite no ombro', avoid: 'hspu-parede desenvolvimento-halteres desenvolvimento-maquina arnold remada-alta elevacao-lateral dips', prefer: 'rotacao-externa wall-slide', tips: ['Movimentos abaixo da altura do ombro costumam ser melhor tolerados.'] },
    ],
    lombar: [
      { id: 'lombalgia', name: 'Dor lombar comum (sem lesão)', flags: ['noSpinalFlex'], prefer: 'dead-bug prancha prancha-lateral meia-ponte gato-vaca', tips: ['Ficar em movimento costuma ajudar mais que repouso total.'] },
      { id: 'hernia', name: 'Hérnia de disco lombar', flags: ['noSpinalFlex', 'noJump'], avoid: 'stiff remada-curvada agachamento-barra', prefer: 'dead-bug prancha prancha-lateral meia-ponte', tips: ['Prefira core sem flexionar a coluna (prancha, dead bug).', 'Formigamento ou perda de força na perna: pare e procure atendimento.'] },
      { id: 'ciatica', name: 'Ciática', flags: ['noSpinalFlex', 'noJump'], avoid: 'stiff remada-curvada agachamento-barra pike-pe pancake', prefer: 'dead-bug meia-ponte gato-vaca', tips: ['Alongamentos que puxam atrás da perna podem piorar a dor: pule se doer.'] },
    ],
    pescoco: [
      { id: 'cervical', name: 'Hérnia ou dor cervical', flags: ['noInvert'], avoid: 'ponte encolhimento remada-alta abdominal dragon-flag', tips: ['Evite carregar peso nos ombros e posições de cabeça para baixo.'] },
    ],
    punho: [
      { id: 'tendinite_punho', name: 'Tendinite / túnel do carpo', avoid: 'flexao flexao-diamante flexao-archer flexao-pseudo-planche planche-lean tuck-planche parada-mao-parede crow lsit tuck-lsit burpee mountain-climber rosca-direta', tips: ['Flexão com punho reto (segurando halteres ou com punhos fechados) costuma doer menos.', 'Prancha sobre os antebraços em vez das mãos.'] },
    ],
    cotovelo: [
      { id: 'epicondilite', name: 'Epicondilite (cotovelo de tenista ou golfista)', avoid: 'barra-pronada chin-up dead-hang rosca-direta rosca-scott rosca-concentrada triceps-testa triceps-frances remada-curvada', tips: ['Pegada forte e repetitiva costuma irritar: alivie a pegada.'] },
    ],
    tornozelo: [
      { id: 'entorse', name: 'Entorse de tornozelo', lesao: true, flags: ['noJump'], tips: ['Exercícios de equilíbrio entram na fase de retorno e ajudam a evitar nova entorse.'] },
      { id: 'fascite', name: 'Fascite plantar', flags: ['noJump'], avoid: 'corda escada esteira', prefer: 'bicicleta', tips: ['Alongar a panturrilha e a sola do pé costuma ajudar.'] },
    ],
    quadril: [
      { id: 'artrose_quadril', name: 'Artrose no quadril', cronica: true, flags: ['noJump'], avoid: 'cossack pancake espacate-frontal espacate-lateral pombo', prefer: 'bicicleta meia-ponte clamshell', tips: ['Baixo impacto e fortalecimento de glúteo costumam ajudar.'] },
    ],
  };
  // Lesões que existem em qualquer região.
  const ANY_LESAO = [{ id: 'fratura', name: 'Fratura', lesao: true }, { id: 'cirurgia', name: 'Cirurgia recente', lesao: true }, { id: 'lesao_muscular', name: 'Lesão muscular (estiramento)', lesao: true }];
  const CHRONIC = [
    { id: 'hipertensao', name: 'Pressão alta (hipertensão)', flags: ['noValsalva', 'noInvert'], rpeMax: 7, tips: ['Expire no esforço: não prenda a respiração.', 'Pressão alta hoje, dor de cabeça forte ou tontura: não treine.'] },
    { id: 'diabetes', name: 'Diabetes', check: 'Mediu a glicose? Se estiver fora da faixa que seu médico definiu, não treine agora. Tenha um lanche por perto.', tips: ['Cuide dos pés: tênis confortável e confira se não há feridas.', 'Treino de força e aeróbico costumam ajudar no controle da glicose.'] },
    { id: 'asma', name: 'Asma', check: 'Bombinha por perto? Aqueça por mais tempo hoje.', tips: ['Aquecimento mais longo e pausas maiores no intervalado.', 'Ar frio e seco costuma piorar: prefira treinar em lugar abrigado.'] },
    { id: 'cardiopatia', name: 'Problema no coração', flags: ['noHIIT', 'noValsalva'], rpeMax: 6, clearance: true, tips: ['Só treine com liberação do cardiologista.', 'Dor no peito, falta de ar fora do normal ou palpitação: pare na hora e procure atendimento.'] },
    { id: 'osteoporose', name: 'Osteoporose / osteopenia', flags: ['noSpinalFlex', 'noJump'], prefer: 'agachamento meia-ponte superman', tips: ['Força e equilíbrio ajudam os ossos e evitam quedas.', 'Evite abdominais que dobram a coluna.'] },
    { id: 'fibromialgia', name: 'Fibromialgia', rpeMax: 6, tips: ['Comece leve e aumente aos poucos; dias ruins acontecem: faça a versão curta.'] },
    { id: 'articulacoes', name: 'Quero proteger as articulações (baixo impacto)', flags: ['noJump'], tips: ['Troca saltos por exercícios sem impacto.'] },
    { id: 'gestacao', name: 'Gestação ou pós-parto', clearance: true, flags: ['noJump'], tips: ['O app não sabe adaptar o treino para cada fase da gestação: siga o médico e um profissional de educação física.'] },
  ];
  const specOf = c => c.kind === 'cronica' ? CHRONIC.find(x => x.id === c.spec) || (SPEC[c.area] || []).find(x => x.id === c.spec)
    : (SPEC[c.area] || []).concat(ANY_LESAO).find(x => x.id === c.spec) || null;
  const PHASES = { protecao: 'Proteção', retorno: 'Retorno', fortalecimento: 'Fortalecimento' };
  const PH_ORDER = ['protecao', 'retorno', 'fortalecimento'];
  H.title = c => { const sp = specOf(c); return (sp ? sp.name : c.kind === 'lesao' ? 'Lesão' : 'Dor') + (c.area ? ' — ' + H.AREAS[c.area].toLowerCase() : '') + (c.side && c.side !== 'na' ? ' (' + { esq: 'esquerdo', dir: 'direito', ambos: 'os dois lados' }[c.side] + ')' : ''); };
  const painNow = c => c.pains && c.pains.length ? c.pains[c.pains.length - 1].v : (c.pain0 || 0);

  // ---------- regras somadas de todas as condições ativas ----------
  H.rules = list => {
    const r = { avoid: new Set(), removeCats: new Set(), caps: {}, setsCap: {}, load: {}, maxKg: {}, flags: new Set(), rpeMax: 10, why: {}, tips: [], checks: [], clearance: [], names: [] };
    const add = (list, why) => list.forEach(x => { r.avoid.add(x); if (!r.why[x]) r.why[x] = why; });
    (list || active()).forEach(c => {
      const sp = specOf(c) || {}, reg = REGION[c.area], name = H.title(c);
      r.names.push(name + (c.kind === 'lesao' ? ' · fase de ' + PHASES[c.phase].toLowerCase() : ''));
      add(ids(sp.avoid), name); (sp.flags || []).forEach(f => r.flags.add(f));
      add(ids(c.blocked && c.blocked.join(' ')), 'orientação do profissional');
      if (c.maxKg > 0 && reg) REGION_CATS[reg].forEach(k => { r.maxKg[k] = Math.min(r.maxKg[k] || 999, c.maxKg); });
      if (sp.rpeMax) r.rpeMax = Math.min(r.rpeMax, sp.rpeMax);
      (sp.tips || []).forEach(t => r.tips.push(t)); if (sp.check) r.checks.push(sp.check);
      if (sp.clearance && !c.cleared) r.clearance.push(c);
      if (c.kind === 'lesao' && reg) {
        // dor forte numa lesão: volta a poupar a região até melhorar
        if (c.phase === 'protecao' || painNow(c) >= 6) { REGION_CATS[reg].forEach(k => r.removeCats.add(k)); PROTECT[reg].forEach(f => r.flags.add(f)); add(baseAvoid(c.area), name); r.rpeMax = Math.min(r.rpeMax, 7); }
        else if (c.phase === 'retorno') { REGION_CATS[reg].forEach(k => { r.caps[k] = Math.min(r.caps[k] || 9, 2); r.setsCap[k] = 2; r.load[k] = Math.min(r.load[k] || 1, 0.5); }); add(baseAvoid(c.area), name); if (reg === 'low') r.flags.add('noJump'); r.rpeMax = Math.min(r.rpeMax, 6); }
        else { REGION_CATS[reg].forEach(k => { r.caps[k] = Math.min(r.caps[k] || 9, 3); r.load[k] = Math.min(r.load[k] || 1, 0.8); }); if (reg === 'low') r.flags.add('noJump'); }
      } else if (c.kind === 'dor' && reg) {
        const p = painNow(c);
        if (p >= 6) { REGION_CATS[reg].forEach(k => r.removeCats.add(k)); PROTECT[reg].forEach(f => r.flags.add(f)); add(baseAvoid(c.area), name); }
        else if (p >= 3 || !c.spec) { add(baseAvoid(c.area), name); REGION_CATS[reg].forEach(k => { r.caps[k] = Math.min(r.caps[k] || 9, 3); }); }
      }
    });
    r.flags.forEach(f => add(ids(FLAG_EX[f]), FLAG_TEXT[f]));
    if (r.flags.has('noHang')) S.allExercises().forEach(x => { if (S.needs(x.id).includes('barra')) add([x.id], FLAG_TEXT.noHang); });
    // sem as mãos: também nada que precise segurar peso (halter, barra, polia, paralelas)
    if (r.flags.has('noHands')) S.allExercises().forEach(x => { if (S.needs(x.id).some(q => ['halteres', 'barra-livre', 'polia', 'paralelas', 'argolas', 'corda-remada', 'corda-pular'].includes(q))) add([x.id], 'precisa segurar peso com as mãos'); });
    r.tips = [...new Set(r.tips)];
    return r;
  };
  // O que muda no treino, em frases curtas (para a tela e para o relatório).
  H.effects = c => {
    const sp = specOf(c) || {}, reg = REGION[c.area], out = [], cats = reg ? REGION_CATS[reg].map(k => CATEGORIES[k].toLowerCase()).join(', ') : '';
    if (c.kind === 'lesao' && reg) out.push(c.phase === 'protecao' ? 'Treina o resto do corpo; nada de ' + cats + (reg === 'up' ? ' nem exercícios que precisem segurar peso' : '') + ' até a liberação.' : c.phase === 'retorno' ? 'Volta de ' + cats + ' só nas variações mais fáceis, no máximo 2 séries, carga pela metade e esforço leve.' : cats[0].toUpperCase() + cats.slice(1) + ' de volta com 80% da carga, sem as variações mais difíceis nem explosivas.');
    if (c.kind === 'dor' && reg) { const p = painNow(c); out.push(p >= 6 ? 'Dor forte: poupa toda a região (' + cats + ').' : p >= 3 || !c.spec ? 'Evita os exercícios que mais forçam a região e limita a dificuldade.' : 'Dor leve: só evita os exercícios específicos do diagnóstico.'); }
    (sp.flags || []).forEach(f => out.push(FLAG_TEXT[f][0].toUpperCase() + FLAG_TEXT[f].slice(1) + '.'));
    if (ids(sp.avoid).length) out.push('Evita: ' + ids(sp.avoid).map(x => S.ex(x).name).slice(0, 6).join(', ') + (ids(sp.avoid).length > 6 ? '…' : '') + '.');
    if (ids(sp.prefer).length) out.push('Costumam ser bem tolerados: ' + ids(sp.prefer).map(x => S.ex(x).name).join(', ') + '.');
    if (sp.rpeMax) out.push('Esforço máximo recomendado: ' + sp.rpeMax + ' de 10.');
    if (c.maxKg > 0) out.push('Carga máxima de ' + c.maxKg + ' kg nos exercícios da região (orientação do profissional).');
    if (c.blocked && c.blocked.length) out.push('Bloqueados pelo profissional: ' + c.blocked.map(x => S.ex(x).name).join(', ') + '.');
    return out;
  };

  // ---------- aplicar as regras a um treino montado ----------
  const TIMED = /prancha|wall-sit|hollow|superman|dead-hang|isometria|lsit|parada|planche|lever|tuck|vsit/;
  function pickAlt(it, r, used, cap) {
    const ex = S.ex(it.ex), lvl = Math.min(ex.level, cap || 9);
    const c = S.allExercises().filter(x => x.cat === ex.cat && x.id !== it.ex && !r.avoid.has(x.id) && !r.removeCats.has(x.cat) && !used.has(x.id) && !S.missing(x.id).length && x.level <= (cap || Math.max(2, ex.level)) && TIMED.test(x.id) === TIMED.test(it.ex));
    const jumpy = new Set(ids(FLAG_EX.noJump));
    c.sort((a, b) => (jumpy.has(a.id) ? 1 : 0) - (jumpy.has(b.id) ? 1 : 0) || (!!a.w === !!ex.w ? 0 : 1) - (!!b.w === !!ex.w ? 0 : 1) || Math.abs(a.level - lvl) - Math.abs(b.level - lvl));
    return c[0];
  }
  const resize = (it, n) => { it.sets = n; ['vals', 'done', 'kgs'].forEach(k => { if (it[k]) it[k] = it[k].slice(0, n); }); };
  function apply(c) {
    const r = H.rules(); if (!r.names.length) return;
    const used = new Set(c.blocks.flatMap(b => (b.items || []).map(i => i.ex))), swapped = [], removed = [];
    c.blocks.forEach(b => {
      if (b.kind === 'forca') b.items = b.items.filter(it => {
        let ex = S.ex(it.ex);
        const bad = r.avoid.has(it.ex) || r.removeCats.has(ex.cat), cap = r.caps[ex.cat];
        if (bad || (cap && ex.level > cap)) {
          const alt = r.removeCats.has(ex.cat) ? null : pickAlt(it, r, used, cap);
          if (!alt) { removed.push(ex.name + ' (' + (r.removeCats.has(ex.cat) ? 'usa a região em recuperação' : r.why[ex.id] || 'sua condição') + ')'); return false; }
          swapped.push(ex.name + ' → ' + alt.name + ' (' + (r.why[ex.id] || (cap ? 'dificuldade limitada na recuperação' : 'sua condição')) + ')'); used.add(alt.id); it.ex = alt.id; delete it.skill; ex = alt;
          const s = W.suggest(alt.id, it, 0); Object.assign(it, { vals: s.targets, up: false, done: Array(it.sets).fill(false), kgs: alt.w ? Array(it.sets).fill(s.kg || '') : null, hint: 'Adaptado à sua condição (' + (r.why[S.ex(it.ex).id] || 'saúde') + '). ' + (s.hint || '') });
        }
        if (r.setsCap[ex.cat] && it.sets > r.setsCap[ex.cat]) resize(it, r.setsCap[ex.cat]);
        if (r.load[ex.cat] && it.kgs && it.kgs.some(Number)) { const f = r.load[ex.cat]; it.kgs = it.kgs.map(k => k ? Math.max(1, Math.round(Number(k) * f)) : k); it.hint = 'Carga reduzida a ' + Math.round(f * 100) + '% por causa da recuperação. ' + (it.hint || ''); }
        if (r.maxKg[ex.cat] && it.kgs) { const m = r.maxKg[ex.cat]; if (it.kgs.some(k => Number(k) > m)) { it.kgs = it.kgs.map(k => Number(k) > m ? m : k); it.hint = 'Carga limitada a ' + m + ' kg (orientação do profissional). ' + (it.hint || ''); } }
        if (r.flags.has('noValsalva')) {
          if (it.unit === 'reps' && ex.w && it.min < 10) { const d = 10 - it.min; it.min = 10; it.max = Math.max(it.max + d, 12); it.vals = it.vals.map(v => Math.max(v, 10)); if (it.kgs) it.kgs = it.kgs.map(k => k ? Math.round(Number(k) * 0.85 * 2) / 2 : k); }
          if (it.unit === 's' && it.max > 30) { it.max = 30; it.min = Math.min(it.min, 30); it.vals = it.vals.map(v => Math.min(v, 30)); }
        }
        return true;
      });
      else if (b.kind === 'check') b.items.forEach(it => { if (it.ex && r.avoid.has(it.ex)) it.note = '⚠ Pule (' + (r.why[it.ex] || 'sua condição') + ').'; });
      else if (b.kind === 'intervalado') {
        if (r.flags.has('noHIIT') || r.removeCats.has('pernas')) b.drop = true;
        else (b.options || []).forEach(o => { const l = o.labels.filter(x => !S.allExercises().some(y => y.name === x && r.avoid.has(y.id))); o.labels = l.length ? l : ['Marcha rápida no lugar']; });
      } else if (b.kind === 'cardio' && (r.avoid.has(b.ex) || r.flags.has('noStandCardio'))) {
        if (!r.removeCats.has('pernas') && !S.missing('bicicleta').length && !r.avoid.has('bicicleta')) { b.ex = 'bicicleta'; b.note = 'Adaptado: bicicleta ergométrica em ritmo de conversa, se não doer.'; } else b.drop = true;
      }
    });
    const dropped = c.blocks.filter(b => b.drop).map(b => b.title);
    c.blocks = c.blocks.filter(b => !b.drop && (b.kind !== 'forca' || b.items.length));
    // sessão ficou vazia: monta um bloco com o que é seguro
    if (!c.blocks.some(b => b.kind === 'forca')) {
      const order = ['core', 'pernas', 'empurrar', 'puxar', 'mobilidade', 'flexibilidade'], pick = [];
      order.forEach(cat => S.allExercises().filter(x => x.cat === cat && x.level <= 2 && !r.avoid.has(x.id) && !r.removeCats.has(x.cat) && !S.missing(x.id).length && !pick.some(p => p.cat === cat)).slice(0, 1).forEach(x => pick.push(x)));
      const items = pick.slice(0, 5).map((x, i) => { const timed = TIMED.test(x.id), it = { ex: x.id, sets: 2, min: timed ? 20 : 10, max: timed ? 30 : 15, unit: timed ? 's' : 'reps', rest: 60, key: 'h.' + i }; const s = W.suggest(x.id, it, 0); return Object.assign(it, { vals: s.targets, done: [false, false], hint: 'Treino alternativo seguro para a sua condição.' }); });
      if (items.length) c.blocks.splice(1, 0, { title: 'Treino alternativo (o original força a região)', kind: 'forca', items });
    }
    const notes = ['<b>Adaptado para: ' + e(r.names.join('; ')) + '.</b>'];
    if (swapped.length) notes.push('Trocados: ' + e(swapped.join(', ')) + '.');
    if (removed.length) notes.push('Fora de hoje: ' + e(removed.join(', ')) + '.');
    if (dropped.length) notes.push('Sem ' + e(dropped.join(' e ').toLowerCase()) + ' por enquanto.');
    if (r.rpeMax < 10) notes.push('Esforço até <b>' + r.rpeMax + ' de 10</b>: termine sentindo que daria para fazer bem mais.');
    r.checks.forEach(x => notes.push('✔ ' + e(x)));
    notes.push('Dor que aumenta durante o exercício (acima de 3 de 10): pare aquele exercício.');
    c.adaptNotes = notes.concat(c.adaptNotes || []); c.health = true;
  }
  const build0 = W.build;
  W.build = (type, forced) => { build0(type, forced); if (S.current) { apply(S.current); S.saveCurrent(); } };

  // gerar treino já considerando as condições
  const gen0 = GEN.generate;
  GEN.generate = (p, owned) => {
    const forAluno = Array.isArray(p.conditions), act = forAluno ? p.conditions.filter(c => !c.resolved) : active(), areas = act.filter(c => c.area && c.kind !== 'cronica').map(c => BASE_AVOID[c.area] ? BASE_AVOID[c.area] : [c.area]).flat().filter(a => GEN.LIMITS[a]);
    const p2 = Object.assign({}, p, { limit: [...new Set((p.limit || []).concat(areas))], lesao: act.some(c => c.kind === 'lesao') ? 's' : p.lesao });
    const prog = gen0(p2, owned);
    if (act.length && prog.notes && prog.notes[0]) prog.notes[0].text += '\n\nCondições de saúde consideradas: ' + act.map(H.title).join('; ') + (forAluno ? '. Exercícios já trocados para respeitar as condições de hoje: gere de novo quando a situação do aluno mudar.' : '. Cada treino é ajustado a elas na hora de começar.');
    if (forAluno && act.length) adaptProgram(prog, H.rules(act));
    return prog;
  };

  // Versão fixa da adaptação, para programas montados para um aluno (que vão impressos ou por link).
  function adaptProgram(prog, r) {
    prog.sessions.forEach(s => {
      const used = new Set();
      s.blocks.forEach(b => {
        if (b.kind === 'forca') b.items = b.items.filter(it => {
          const id = it.skill ? W.resolve(it, '', '') : it.ex, ex = S.ex(id), cap = r.caps[ex.cat];
          if (!(r.avoid.has(id) || r.removeCats.has(ex.cat) || (cap && ex.level > cap))) { used.add(id); return true; }
          const alt = r.removeCats.has(ex.cat) ? null : pickAlt({ ex: id, unit: it.unit }, r, used, cap);
          if (!alt) return false;
          used.add(alt.id); it.ex = alt.id; delete it.skill; it.note = 'Adaptado: ' + (r.why[id] || 'condição de saúde') + '. ' + (it.note || '');
          if (r.setsCap[alt.cat]) it.sets = Math.min(it.sets, r.setsCap[alt.cat]);
          return true;
        });
        if (b.kind === 'intervalado' && (r.flags.has('noHIIT') || r.removeCats.has('pernas'))) b.drop = true;
      });
      s.blocks = s.blocks.filter(b => !b.drop && (b.kind !== 'forca' || b.items.length));
    });
  }

  // ---------- consulta com profissional e diagnóstico ----------
  const LESAO_SPECS = new Set(['fratura', 'cirurgia', 'lca', 'luxacao_ombro', 'entorse', 'lesao_muscular']);
  const consulted = c => c.consult === 'sim' || !!c.spec;
  // Lembrete: a cada 7 dias (3 se a dor for forte); quem marcou consulta é perguntado em 14 dias.
  H.nudgeDue = c => {
    if (c.resolved || c.kind === 'cronica' || consulted(c)) return false;
    const every = c.consult === 'agendado' ? 14 : painNow(c) >= 6 ? 3 : 7;
    return S.daysBetween(c.lastNudge || c.since, S.today()) >= every;
  };
  const nudgeHtml = c => {
    const n = S.daysBetween(c.since, S.today()), where = H.AREAS[c.area] ? H.AREAS[c.area].toLowerCase() : 'corpo';
    return '<div class="hint warn"><b>' + (c.consult === 'agendado' ? 'Como foi a consulta?' : 'Procure um profissional de saúde') + '</b><br>' +
      (c.consult === 'agendado' ? 'Você marcou consulta para a dor em ' + e(where) + '. Já foi?' : 'Você registrou ' + (c.kind === 'lesao' ? 'uma lesão' : 'dor') + ' em ' + e(where) + (n ? ' há ' + n + ' dia' + (n > 1 ? 's' : '') : '') + ' e ainda não passou por avaliação. Um médico ou fisioterapeuta descobre a causa, e com o diagnóstico o app adapta o treino com muito mais precisão. A UBS atende de graça.') +
      (painNow(c) >= 6 ? '<br><b>Com dor forte, não espere:</b> procure atendimento logo.' : '') +
      '<div class="row wrap"><button class="btn small" data-a="hl-diag" data-id="' + c.id + '">Já fui</button>' + (c.consult !== 'agendado' ? '<button class="btn small ghosty" data-a="hl-consult" data-id="' + c.id + '">Marquei consulta</button>' : '') + '<button class="btn small ghosty" data-a="hl-snooze" data-id="' + c.id + '">Lembrar depois</button></div></div>';
  };
  A['hl-consult'] = d => { const c = findC(d.id); c.consult = 'agendado'; c.lastNudge = S.today(); c.t = Date.now(); S.save(); U.closeModal(); U.toast('Ótimo! Daqui a 2 semanas pergunto como foi.'); rerender(); if (location.hash === '#hoje') APP.render(); };
  A['hl-snooze'] = d => { const c = findC(d.id); c.lastNudge = S.today(); c.t = Date.now(); S.save(); U.toast('Ok, lembro de novo em alguns dias.'); APP.render(); };
  // Interpreta o diagnóstico escrito com as palavras do profissional.
  const DIAG = [
    [/condromal|patelofemoral|frente do joelho|patela/, 'pfps', 'joelho'], [/menisco/, 'menisco', 'joelho'], [/\blca\b|cruzado|ligamento/, 'lca', 'joelho'],
    [/tendin\w* patelar|joelho de saltador/, 'tendinite_patelar', 'joelho'], [/artros|desgaste|osteoartr/, 'artrose_joelho', 'joelho'], [/artros|desgaste|osteoartr/, 'artrose_quadril', 'quadril'],
    [/manguito|supraespinh|impacto|tendin/, 'manguito', 'ombro'], [/luxa|instabil|deslocou|desloca/, 'luxacao_ombro', 'ombro'], [/bursit/, 'bursite_ombro', 'ombro'],
    [/hernia|protrus|abaulament/, 'hernia', 'lombar'], [/ciatic/, 'ciatica', 'lombar'], [/lombalg|muscular|contratur|mecanic|postur/, 'lombalgia', 'lombar'],
    [/hernia|protrus|cervical|cervicalg|torcicol/, 'cervical', 'pescoco'], [/tunel|carpo|tendin|quervain/, 'tendinite_punho', 'punho'], [/epicondil|tenista|golfista|tendin/, 'epicondilite', 'cotovelo'],
    [/entorse|torcao|torceu|torci/, 'entorse', 'tornozelo'], [/fascit|esporao/, 'fascite', 'tornozelo'],
    [/fratur|quebr|fissur/, 'fratura', null], [/cirurg|operou|operacao/, 'cirurgia', null], [/estiramento|distensao|lesao muscular|ruptura parcial|rompimento parcial/, 'lesao_muscular', null],
  ];
  const NOTHING = /nada grave|sem lesao|nao tem nada|so inflama|inflamacao|cansaco muscular|normal|nada de mais/;
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  H.evaluate = (text, area) => {
    const t = norm(text); if (!t.trim()) return null;
    for (const [re, spec, ar] of DIAG) if ((ar === area || ar === null) && re.test(t)) return { spec };
    if (NOTHING.test(t)) return { nothing: true };
    for (const [re, spec, ar] of DIAG) if (ar && re.test(t)) return { spec, otherArea: ar };
    return { unknown: true };
  };
  A['hl-diag'] = d => {
    const c = findC(d.id), opts = ANY_LESAO.concat(SPEC[c.area] || []);
    U.modal('<h2>O que o profissional disse?</h2><p class="muted small">Escreva o diagnóstico como o médico ou fisioterapeuta falou (ou como está no laudo). O app interpreta e ajusta o treino.</p>' +
      '<label>Diagnóstico<textarea id="hl-dx" rows="3" placeholder="Ex.: tendinite no manguito rotador; condromalácia patelar grau 2; nada grave, só inflamação">' + e(c.diagnosis || '') + '</textarea></label>' +
      '<label>Orientações que ele deu (opcional)<textarea id="hl-dxn" rows="2" placeholder="Ex.: evitar agachamento profundo por 30 dias">' + e(c.notes || '') + '</textarea></label>' +
      '<button class="btn block" data-a="hl-dx-go" data-id="' + c.id + '">Avaliar diagnóstico</button>' +
      '<details style="margin-top:10px"><summary class="muted small">Ou escolha da lista</summary><div class="list">' + opts.map(x => '<button class="list-item" data-a="hl-dx-pick" data-id="' + c.id + '" data-spec="' + x.id + '"><span>' + e(x.name) + '</span></button>').join('') + '</div></details>');
  };
  const dxResult = (c, res, text) => {
    const tmp = Object.assign({}, c, { spec: res.spec || null, kind: res.spec ? (LESAO_SPECS.has(res.spec) ? 'lesao' : (SPEC[c.area] || []).some(x => x.id === res.spec && x.cronica) ? 'cronica' : 'dor') : c.kind, phase: c.phase || 'retorno' });
    let h = '<h2>Avaliação do diagnóstico</h2>' + (text ? '<p class="muted small">Você escreveu: “' + e(text) + '”</p>' : '');
    if (res.spec) {
      h += '<div class="hint up">Entendi como: <b>' + e(specOf(tmp).name) + '</b>' + (res.otherArea ? ' (parece ser em ' + e(H.AREAS[res.otherArea].toLowerCase()) + ', não em ' + e(H.AREAS[c.area].toLowerCase()) + ')' : '') + '.</div><b class="small">O treino passa a:</b><ul class="small" style="padding-left:18px">' + H.effects(Object.assign({}, tmp, { area: res.otherArea || c.area })).map(x => '<li>' + e(x) + '</li>').join('') + '</ul>' +
        ((specOf(tmp).tips || []).length ? '<b class="small">Dicas gerais para esse diagnóstico</b><ul class="small muted" style="padding-left:18px">' + specOf(tmp).tips.map(t => '<li>' + e(t) + '</li>').join('') + '</ul>' : '') +
        (tmp.kind === 'lesao' && c.kind !== 'lesao' ? '<label>Situação com o profissional <select id="hl-dx-phase"><option value="protecao">Ainda sem liberação para usar a região</option><option value="retorno" selected>Liberado com cuidado</option><option value="fortalecimento">Liberado; recuperando a força</option></select></label>' : '') +
        '<button class="btn block" data-a="hl-dx-ok" data-id="' + c.id + '" data-spec="' + res.spec + '" data-area="' + (res.otherArea || c.area || '') + '">Confirmar e adaptar</button><button class="btn ghosty block" data-a="hl-diag" data-id="' + c.id + '">Não é isso</button>';
    } else if (res.nothing) h += '<div class="hint up">Que bom que não é nada grave.</div><p class="small">Sigo com as regras gerais para a região enquanto houver dor e paro de lembrar da consulta. Se a dor durar mais de 6 semanas, volte ao profissional.</p><button class="btn block" data-a="hl-dx-ok" data-id="' + c.id + '" data-spec="">Confirmar</button>';
    else h += '<div class="hint warn">Não reconheci esse diagnóstico na minha lista.</div><p class="small">Sigo com as regras gerais para ' + e((H.AREAS[c.area] || 'a região').toLowerCase()) + ' e paro de lembrar da consulta. Para o treino respeitar exatamente o que o profissional pediu, registre os <b>exercícios proibidos</b> e a <b>carga máxima</b> nas orientações.</p><button class="btn block" data-a="hl-dx-ok" data-id="' + c.id + '" data-spec="" data-pro="1">Confirmar e abrir orientações</button><button class="btn ghosty block" data-a="hl-diag" data-id="' + c.id + '">Escolher da lista</button>';
    U.modal(h);
  };
  A['hl-dx-go'] = d => { const c = findC(d.id), text = U.$('#hl-dx').value.trim(), notes = U.$('#hl-dxn').value.trim(); if (!text) return U.toast('Escreva o que o profissional disse.'); c._dx = text; if (notes) c.notes = notes; dxResult(c, H.evaluate(text, c.area), text); };
  A['hl-dx-pick'] = d => { const c = findC(d.id); dxResult(c, { spec: d.spec }, ''); };
  A['hl-dx-ok'] = d => {
    const c = findC(d.id), ph = U.$('#hl-dx-phase');
    c.consult = 'sim'; c.diagDate = S.today(); if (c._dx) c.diagnosis = c._dx; delete c._dx;
    if (d.spec) {
      c.spec = d.spec; if (d.area) c.area = d.area;
      if (LESAO_SPECS.has(d.spec)) { if (c.kind !== 'lesao') { c.kind = 'lesao'; c.phase = ph ? ph.value : 'retorno'; c.phaseSince = S.today(); if (c.phase !== 'protecao') c.cleared = S.today(); } }
      else if ((SPEC[c.area] || []).some(x => x.id === d.spec && x.cronica)) c.kind = 'cronica';
    }
    c.t = Date.now(); S.save();
    if (d.pro) return A['hl-pro']({ id: c.id });
    U.closeModal(); U.toast('Diagnóstico registrado: os treinos já seguem as novas regras.'); APP.render();
  };

  // ---------- antes do treino ----------
  const start0 = A.start;
  A.start = d => {
    if (S.current || d.type !== 'session') return start0(d);
    const r = H.rules();
    if (r.clearance.length) return U.modal('<h2>Liberação médica</h2><p>Você registrou: <b>' + e(r.clearance.map(H.title).join(', ')) + '</b>. Para essa condição, o treino precisa de liberação do médico.</p>' +
      '<button class="btn block" data-a="hl-clear" data-ids="' + r.clearance.map(c => c.id).join(',') + '">Tenho liberação para treinar</button><button class="btn ghosty block" data-a="modal-close">Ainda não tenho</button>' +
      '<p class="muted small">Sem liberação, faça só caminhada leve ou alongamento e marque uma consulta (UBS atende de graça).</p>');
    start0(d);
    const h2 = U.$('#modal .modal-box h2');
    const due = active().filter(H.nudgeDue)[0]; if (h2 && due) h2.insertAdjacentHTML('afterend', nudgeHtml(due));
    if (h2 && r.names.length) h2.insertAdjacentHTML('afterend', '<div class="hint">🩹 O treino já vem adaptado para: <b>' + e(r.names.join('; ')) + '</b>.' + (r.checks.length ? '<br>' + r.checks.map(e).join('<br>') : '') + ' <a href="#saude" data-a="modal-close-go" data-go="#saude">Ver saúde</a></div>');
    const pain = U.$('#modal #pre-inj'); if (pain) pain.closest('label').insertAdjacentHTML('afterend', '<p class="small"><a href="#saude" data-a="hl-new-go">Lesão, fratura ou problema que vai durar? Registre em Saúde</a> para o app acompanhar até você se recuperar.</p>');
  };
  A['hl-clear'] = d => { d.ids.split(',').forEach(id => { const c = findC(id); if (c) { c.cleared = S.today(); c.t = Date.now(); } }); S.save(); U.closeModal(); A.start({ type: 'session' }); };
  A['hl-new-go'] = () => { U.closeModal(); location.hash = '#saude'; setTimeout(() => A['hl-new'](), 150); };

  // ---------- depois do treino: dor de cada condição ----------
  const finish0 = A['w-finish'];
  A['w-finish'] = (d, el, ev) => {
    finish0(d, el, ev);
    const btn = U.$('.modal-box [data-a="w-save"]'), list = active().filter(c => c.kind !== 'cronica');
    if (!btn || !list.length || !S.current || S.current.type !== 'session') return;
    btn.insertAdjacentHTML('beforebegin', '<p style="margin-top:14px"><b>Como está a dor?</b> <span class="muted small">0 = nenhuma, 10 = a pior possível</span></p>' + list.map(c =>
      '<label>' + e(H.title(c)) + ' <span class="hl-val" id="hv-' + c.id + '">' + painNow(c) + '</span><input type="range" min="0" max="10" step="1" value="' + painNow(c) + '" data-hpain="' + c.id + '" aria-label="Dor: ' + e(H.title(c)) + '"></label>').join(''));
  };
  document.addEventListener('input', ev => { const id = ev.target.dataset && ev.target.dataset.hpain; if (id) { const s = U.$('#hv-' + id); if (s) s.textContent = ev.target.value; } });
  const save0 = A['w-save'];
  A['w-save'] = (d, el, ev) => {
    const vals = [...document.querySelectorAll('[data-hpain]')].map(x => ({ id: x.dataset.hpain, v: +x.value }));
    save0(d, el, ev);
    if (!vals.length) return;
    const msgs = [];
    vals.forEach(({ id, v }) => { const c = findC(id); if (!c) return; (c.pains = c.pains || []).push({ date: S.today(), v }); c.t = Date.now(); msgs.push(...review(c)); });
    S.save();
    const close = U.$('#modal .modal-box [data-a="modal-close"].btn');
    if (close && msgs.length) close.insertAdjacentHTML('beforebegin', '<div class="hint"><b>🩹 Acompanhamento</b><ul style="margin:6px 0 0;padding-left:18px">' + msgs.map(m => '<li>' + m + '</li>').join('') + '</ul></div>');
  };
  // Sugestões depois de registrar dor (a pessoa confirma: o app nunca libera fase sozinho).
  function review(c) {
    const p = c.pains || [], last = p[p.length - 1].v, prev = p.length > 1 ? p[p.length - 2].v : null, days = S.daysBetween(c.phaseSince || c.since, S.today()), out = [], name = '<b>' + e(H.title(c)) + '</b>';
    if (last >= 6) out.push(name + ': dor forte (' + last + '/10). O próximo treino poupa mais a região. Se não melhorar em poucos dias, procure o médico ou fisioterapeuta.' + (c.kind === 'lesao' && c.phase !== 'protecao' ? ' <button class="link" data-a="hl-phase" data-id="' + c.id + '" data-dir="-1">Voltar uma fase</button>' : ''));
    else if (prev != null && last >= prev + 3) out.push(name + ': a dor subiu de ' + prev + ' para ' + last + '. Observe; se continuar, converse com o profissional.');
    if (c.kind === 'lesao' && last <= 2 && (prev == null || prev <= 2)) {
      if (c.phase === 'retorno' && days >= 14) out.push(name + ': 2 treinos com pouca dor depois de ' + days + ' dias no retorno. Se o profissional concordar: <button class="link" data-a="hl-phase" data-id="' + c.id + '" data-dir="1">avançar para fortalecimento</button>.');
      if (c.phase === 'fortalecimento' && days >= 28) out.push(name + ': pouca dor há ' + days + ' dias no fortalecimento. <button class="link" data-a="hl-resolve" data-id="' + c.id + '">Marcar como recuperado</button> quando o profissional liberar.');
    }
    if (!consulted(c) && c.kind !== 'cronica' && (last >= 6 || (last >= 3 && H.nudgeDue(c)))) { out.push(name + ': ainda sem avaliação profissional. Procure um médico ou fisioterapeuta (UBS atende de graça). <button class="link" data-a="hl-diag" data-id="' + c.id + '">Já fui</button>'); c.lastNudge = S.today(); }
    if (c.kind === 'dor') {
      if (last <= 1 && prev != null && prev <= 1) out.push(name + ': 2 treinos quase sem dor. <button class="link" data-a="hl-resolve" data-id="' + c.id + '">Marcar como resolvida</button>?');
      else if (last >= 3 && S.daysBetween(c.since, S.today()) >= 42) out.push(name + ': a dor dura mais de 6 semanas. Vale procurar um médico ou fisioterapeuta (UBS atende de graça).');
    }
    return out;
  }
  A['hl-phase'] = d => { const c = findC(d.id); if (!c) return; const i = Math.max(0, Math.min(2, PH_ORDER.indexOf(c.phase) + +d.dir)); c.phase = PH_ORDER[i]; c.phaseSince = S.today(); c.t = Date.now(); if (i > 0) c.cleared = c.cleared || S.today(); S.save(); U.toast('Fase: ' + PHASES[c.phase]); rerender(); };
  A['hl-resolve'] = d => { const c = findC(d.id); if (!c) return; c.resolved = S.today(); c.t = Date.now(); S.save(); U.toast('Marcado como resolvido. Os treinos voltam ao normal.'); rerender(); };

  // ================= TELA SAÚDE =================
  const spark = p => { if (!p || p.length < 2) return ''; const v = p.slice(-12).map(x => x.v), W2 = 120, Hh = 30; return '<svg viewBox="0 0 ' + W2 + ' ' + Hh + '" width="' + W2 + '" height="' + Hh + '" aria-label="Dor ao longo do tempo"><polyline points="' + v.map((y, i) => (i * W2 / (v.length - 1)).toFixed(1) + ',' + (Hh - 3 - y / 10 * (Hh - 6)).toFixed(1)).join(' ') + '" fill="none" stroke="var(--warn)" stroke-width="2" stroke-linejoin="round"/></svg>'; };
  const card = c => {
    const sp = specOf(c) || {}, kindTxt = { dor: 'Dor temporária', lesao: 'Lesão em recuperação', cronica: 'Condição crônica' }[c.kind];
    return '<div class="card"><div class="row between"><h2>' + e(H.title(c)) + '</h2><span class="tag">' + kindTxt + '</span></div>' +
      '<div class="muted small">Desde ' + U.fmtDate(c.since) + (c.spec ? '' : c.kind !== 'cronica' ? ' · sem diagnóstico (regras gerais da região)' : '') + (sp.clearance ? (c.cleared ? ' · liberado em ' + U.fmtDate(c.cleared) : ' · <b class="bad">sem liberação médica</b>') : '') + '</div>' +
      (c.kind === 'lesao' ? '<div class="phases">' + PH_ORDER.map((ph, i) => '<span class="' + (ph === c.phase ? 'on' : PH_ORDER.indexOf(c.phase) > i ? 'done' : '') + '">' + PHASES[ph] + '</span>').join('') + '</div>' +
        '<p class="muted small">' + (c.phase === 'protecao' ? 'Até o médico ou fisioterapeuta liberar o uso da região.' : c.phase === 'retorno' ? 'Primeiras semanas depois da liberação: o mais leve possível, sem dor.' : 'Recuperando a força, ainda sem o máximo e sem explosão.') + '</p>' : '') +
      '<b class="small">O que muda no seu treino</b><ul class="small" style="margin:4px 0;padding-left:18px">' + H.effects(c).map(x => '<li>' + e(x) + '</li>').join('') + '</ul>' +
      ((sp.tips || []).length ? '<b class="small">Dicas gerais</b><ul class="small muted" style="margin:4px 0;padding-left:18px">' + sp.tips.map(t => '<li>' + e(t) + '</li>').join('') + '</ul>' : '') +
      (c.kind !== 'cronica' ? (consulted(c) ? (c.diagnosis ? '<div class="small"><b>Diagnóstico:</b> ' + e(c.diagnosis) + (c.diagDate ? ' <span class="muted">(' + U.fmtDate(c.diagDate) + ')</span>' : '') + '</div>' : '') : H.nudgeDue(c) ? nudgeHtml(c) : '<div class="small muted">' + (c.consult === 'agendado' ? 'Consulta marcada. ' : 'Sem avaliação profissional ainda. ') + '<button class="link" data-a="hl-diag" data-id="' + c.id + '">Já passei por um profissional</button></div>') : '') +
      (c.notes ? '<div class="hint small"><b>Orientação do profissional:</b> ' + e(c.notes) + '</div>' : '') +
      (c.kind !== 'cronica' ? '<div class="row between"><div class="small">Dor agora: <b>' + painNow(c) + '/10</b></div>' + spark(c.pains) + '</div><div class="chips" style="flex-wrap:wrap">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<button data-a="hl-pain" data-id="' + c.id + '" data-v="' + n + '" class="' + (painNow(c) === n ? 'on' : '') + '">' + n + '</button>').join('') + '</div>' : '') +
      '<div class="row wrap">' + (c.kind === 'lesao' && c.phase === 'protecao' ? '<button class="btn small" data-a="hl-phase" data-id="' + c.id + '" data-dir="1">O profissional me liberou</button>' : '') +
      (c.kind === 'lesao' && c.phase === 'retorno' ? '<button class="btn small ghosty" data-a="hl-phase" data-id="' + c.id + '" data-dir="1">Avançar para fortalecimento</button>' : '') +
      (c.kind === 'lesao' && c.phase !== 'protecao' ? '<button class="btn small ghosty" data-a="hl-phase" data-id="' + c.id + '" data-dir="-1">Voltar uma fase</button>' : '') +
      (sp.clearance && !c.cleared ? '<button class="btn small" data-a="hl-clear1" data-id="' + c.id + '">Tenho liberação médica</button>' : '') +
      '<button class="btn small ghosty" data-a="hl-pro" data-id="' + c.id + '">Orientações do profissional</button>' +
      '<button class="btn small ghosty" data-a="hl-resolve" data-id="' + c.id + '">' + (c.kind === 'cronica' ? 'Remover' : 'Resolvido') + '</button></div></div>';
  };
  V.saude = () => {
    const act = active(), old = conds().filter(c => c.resolved);
    return '<a href="#perfil" class="muted small">← Perfil</a><div class="row between"><h1>Saúde e lesões</h1><button class="btn small" data-a="hl-new">+ Registrar</button></div>' +
      '<div class="hint warn small"><b>O app não substitui médico, fisioterapeuta nem profissional de educação física.</b> Ele aplica regras gerais e as orientações que você registrar, para apoiar o acompanhamento de um profissional. Dor forte, inchaço, formigamento, dor no peito ou falta de ar: pare e procure atendimento.</div>' +
      (act.length ? act.map(card).join('') + '<button class="btn ghosty block" data-a="hl-report">📋 Relatório para o profissional de saúde</button>'
        : '<div class="card"><p>Nenhuma condição registrada. Se você tem uma <b>dor</b>, uma <b>lesão ou fratura</b> (ou está voltando de uma), ou uma <b>condição crônica</b> como pressão alta, diabetes ou hérnia, registre aqui: todos os treinos passam a ser adaptados até você se recuperar.</p><button class="btn" data-a="hl-new">Registrar agora</button></div>') +
      '<details class="card small"><summary><b>Sobre estas regras</b></summary><p>' + e(H.RULES_INFO.origem) + '</p><p><b>Revisão:</b> ' + e(H.RULES_INFO.revisao) + '</p><p class="muted">Versão ' + H.RULES_INFO.versao + ', de ' + H.RULES_INFO.data + '. O app nunca libera uma fase sozinho: toda liberação é informada por você, a partir do que o profissional disse.</p></details>' +
      (old.length ? '<details class="card"><summary><b>Já resolvidas (' + old.length + ')</b></summary><ul class="small">' + old.map(c => '<li>' + e(H.title(c)) + ' — ' + U.fmtDate(c.since) + ' a ' + U.fmtDate(c.resolved) + ' <button class="link" data-a="hl-reopen" data-id="' + c.id + '">reabrir</button></li>').join('') + '</ul></details>' : '');
  };
  A['hl-pain'] = d => { const c = findC(d.id); (c.pains = c.pains || []).push({ date: S.today(), v: +d.v }); c.t = Date.now(); S.save(); const m = review(c); APP.render(); if (m.length) U.modal('<h2>Acompanhamento</h2><ul>' + m.map(x => '<li>' + x + '</li>').join('') + '</ul><button class="btn block" data-a="modal-close">Ok</button>'); };
  A['hl-clear1'] = d => { const c = findC(d.id); c.cleared = S.today(); c.t = Date.now(); S.save(); APP.render(); };
  A['hl-reopen'] = d => { const c = findC(d.id); delete c.resolved; c.t = Date.now(); S.save(); APP.render(); };
  A['hl-pro'] = d => {
    const c = findC(d.id), own = ownerOf(d.id), progs = own ? Object.values(S.state.programs).filter(p => p.alunoId === own.id) : [S.program()];
    let list = S.allExercises().filter(x => progs.some(p => p.sessions.some(s => s.blocks.some(b => (b.items || []).some(it => it.ex === x.id || (it.skill && W.resolve(it, p.id, 'x') === x.id))))));
    if (!list.length) list = S.allExercises().filter(x => x.level <= 3);
    list.sort((a, b) => a.name.localeCompare(b.name));
    U.modal('<h2>Orientações do profissional</h2><p class="muted small">' + e(H.title(c)) + '. Anote o que o médico, fisioterapeuta ou professor orientou. Os exercícios marcados saem de todos os treinos.</p>' +
      '<label>Orientações<textarea id="hl-notes" rows="4" placeholder="Ex.: sem carga acima de 5 kg no braço esquerdo por 4 semanas">' + e(c.notes || '') + '</textarea></label>' +
      (c.area ? '<label>Carga máxima na região, em kg (opcional) <input type="number" id="hl-maxkg" inputmode="decimal" min="0" step="0.5" value="' + (c.maxKg || '') + '" placeholder="sem limite"></label>' : '') +
      '<p><b class="small">Exercícios proibidos</b></p><div class="list" style="max-height:40vh;overflow:auto">' + list.map(x => '<label class="chk"><input type="checkbox" class="hl-blk" value="' + e(x.id) + '"' + ((c.blocked || []).includes(x.id) ? ' checked' : '') + '><span>' + e(x.name) + '</span></label>').join('') + '</div>' +
      '<button class="btn block" data-a="hl-pro-save" data-id="' + c.id + '">Salvar</button>');
  };
  A['hl-pro-save'] = d => { const c = findC(d.id); c.notes = U.$('#hl-notes').value.trim(); c.maxKg = U.$('#hl-maxkg') ? +U.$('#hl-maxkg').value || 0 : 0; c.blocked = [...document.querySelectorAll('.hl-blk:checked')].map(x => x.value); c.t = Date.now(); S.save(); U.closeModal(); APP.render(); U.toast('Orientações salvas: valem para todos os treinos.'); };

  // ---------- cadastro guiado ----------
  let wz = {};
  const wzDraw = () => {
    const al = wz.al && alunos().find(a => a.id === wz.al);
    let h = '<h2>Registrar condição</h2>' + (al ? '<p class="muted small">Na ficha de <b>' + e(al.nome) + '</b></p>' : '');
    if (!wz.kind) h += '<p class="muted">O que você quer registrar?</p>' +
      '<button class="choice" data-a="wz" data-k="kind" data-v="dor"><span class="em">🤕</span><span><b>Uma dor que apareceu</b><small>Algo temporário que o app vai acompanhar até passar.</small></span></button>' +
      '<button class="choice" data-a="wz" data-k="kind" data-v="lesao"><span class="em">🦴</span><span><b>Lesão, fratura ou cirurgia</b><small>Inclusive se você está voltando de uma. O treino segue fases até a recuperação.</small></span></button>' +
      '<button class="choice" data-a="wz" data-k="kind" data-v="cronica"><span class="em">🩺</span><span><b>Condição crônica ou doença</b><small>Pressão alta, diabetes, asma, artrose, osteoporose…</small></span></button>';
    else if (wz.kind === 'cronica' && !wz.spec) h += '<p class="muted">Qual condição?</p><div class="list">' + CHRONIC.concat(SPEC.joelho.filter(x => x.cronica).map(x => Object.assign({ area: 'joelho' }, x)), SPEC.quadril.filter(x => x.cronica).map(x => Object.assign({ area: 'quadril' }, x))).map(x => '<button class="list-item" data-a="wz-spec" data-v="' + x.id + '" data-area="' + (x.area || '') + '"><span>' + e(x.name) + '</span></button>').join('') + '</div><p class="muted small">Não está na lista? Registre como dor ou lesão na região e anote as orientações do seu médico.</p>';
    else if (wz.kind !== 'cronica' && !wz.area) h += '<p class="muted">Em qual região?</p><div class="chips" style="flex-wrap:wrap">' + Object.entries(H.AREAS).map(a => '<button data-a="wz" data-k="area" data-v="' + a[0] + '">' + a[1] + '</button>').join('') + '</div>';
    else if (wz.kind !== 'cronica' && wz.spec === undefined) {
      const opts = (wz.kind === 'lesao' ? ANY_LESAO.concat((SPEC[wz.area] || []).filter(x => x.lesao)) : []).concat((SPEC[wz.area] || []).filter(x => !x.lesao && !x.cronica));
      h += '<p class="muted">Tem diagnóstico? Com ele o treino segue regras específicas; sem ele, regras gerais para ' + e(H.AREAS[wz.area].toLowerCase()) + '.</p><div class="list"><button class="list-item" data-a="wz-spec" data-v=""><span><b>Não sei / sem diagnóstico</b></span></button>' +
        opts.map(x => '<button class="list-item" data-a="wz-spec" data-v="' + x.id + '"><span>' + e(x.name) + '</span></button>').join('') + '</div>';
    } else if (wz.kind !== 'cronica' && wz.spec === null && !wz.consult) {
      h += '<p class="muted">Já passou por um médico ou fisioterapeuta por isso?</p>' +
        '<button class="choice" data-a="wz" data-k="consult" data-v="sim"><span class="em">✅</span><span><b>Já fui</b><small>Você conta o que ele disse e o app interpreta o diagnóstico.</small></span></button>' +
        '<button class="choice" data-a="wz" data-k="consult" data-v="agendado"><span class="em">📅</span><span><b>Marquei consulta</b><small>O app pergunta como foi daqui a 2 semanas.</small></span></button>' +
        '<button class="choice" data-a="wz" data-k="consult" data-v="nao"><span class="em">⏳</span><span><b>Ainda não</b><small>O app usa regras gerais e lembra você de procurar um profissional.</small></span></button>';
    } else {
      h += '<p><b>' + e(H.title(Object.assign({ side: 'na' }, wz))) + '</b></p>' +
        (wz.area ? '<label>Lado <select id="wz-side"><option value="na">Não se aplica</option><option value="esq">Esquerdo</option><option value="dir">Direito</option><option value="ambos">Os dois</option></select></label>' : '') +
        '<label>Desde quando <input type="date" id="wz-since" value="' + S.today() + '"></label>' +
        (wz.kind !== 'cronica' ? '<label>Dor agora (0 a 10) <span id="wz-pv">3</span><input type="range" id="wz-pain" min="0" max="10" value="3"></label>' : '') +
        (wz.kind === 'lesao' ? '<label>Situação com o médico/fisioterapeuta <select id="wz-phase"><option value="protecao">Ainda em recuperação, sem liberação para usar a região</option><option value="retorno">Liberado há pouco, com cuidado</option><option value="fortalecimento">Liberado; recuperando a força</option></select></label>' : '') +
        (wz.consult === 'sim' ? '<label>O que o profissional disse (diagnóstico) <textarea id="wz-dx" rows="2" placeholder="Ex.: tendinite no manguito rotador"></textarea></label>' : '') +
        '<label>Orientações do profissional (opcional) <textarea id="wz-notes" rows="3" placeholder="O que o médico ou fisioterapeuta orientou"></textarea></label>' +
        '<button class="btn block" data-a="wz-save">Salvar e adaptar meus treinos</button>';
    }
    if (wz.kind) h += '<div class="row"><button class="link" data-a="wz-back">← Voltar</button></div>';
    U.modal(h);
  };
  A['hl-new'] = d => { wz = { al: (d && d.al) || null }; wzDraw(); };
  A.wz = d => { wz[d.k] = d.v; wzDraw(); };
  A['wz-spec'] = d => { wz.spec = d.v || null; if (d.area) wz.area = d.area; wzDraw(); };
  A['wz-back'] = () => { if (wz.consult) delete wz.consult; else if (wz.spec !== undefined) { delete wz.spec; if (wz.kind === 'cronica') delete wz.area; } else if (wz.area) delete wz.area; else delete wz.kind; wzDraw(); };
  document.addEventListener('input', ev => { if (ev.target.id === 'wz-pain') U.$('#wz-pv').textContent = ev.target.value; });
  A['wz-save'] = () => {
    const v = id => (U.$('#' + id) || {}).value;
    const c = { id: 'h-' + S.uid(), t: Date.now(), kind: wz.kind, area: wz.area || null, spec: wz.spec || null, side: v('wz-side') || 'na', since: v('wz-since') || S.today(), notes: (v('wz-notes') || '').trim(), blocked: [] };
    if (c.kind !== 'cronica') { c.pain0 = +v('wz-pain'); c.pains = [{ date: S.today(), v: c.pain0 }]; }
    if (c.kind === 'lesao') { c.phase = v('wz-phase'); c.phaseSince = S.today(); if (c.phase !== 'protecao') c.cleared = S.today(); }
    const dx = (v('wz-dx') || '').trim(); // lido antes de fechar a janela
    c.consult = c.spec ? 'sim' : (wz.consult || 'nao'); c.lastNudge = S.today();
    const al = wz.al && alunos().find(a => a.id === wz.al);
    if (al) { (al.conditions = al.conditions || []).push(c); al.t = Date.now(); } else conds().push(c);
    S.save(); U.closeModal();
    if (!al) location.hash = '#saude';
    APP.render();
    if (dx) { c._dx = dx; return dxResult(c, H.evaluate(dx, c.area), dx); }
    if (c.consult === 'nao' && c.kind !== 'cronica') return U.modal('<h2>Registrado</h2><p>' + (al ? 'Os treinos de ' + e(al.nome) + ' vão respeitar essa condição.' : 'Seus treinos já estão adaptados.') + '</p>' + nudgeHtml(Object.assign({}, c, { consult: 'nao' })).replace('Lembrar depois', 'Ok, entendi'));
    U.toast(al ? 'Registrado na ficha de ' + al.nome + '.' : 'Registrado. Todos os treinos agora são adaptados.');
  };

  // ---------- relatório para o profissional ----------
  A['hl-report'] = () => {
    const p = S.state.profile || {}, since = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10), logs = S.sortedLogs().filter(l => l.date >= since);
    const txt = 'RELATÓRIO DE TREINO E SAÚDE' + (p.nome ? ' — ' + p.nome : '') + ' (' + U.fmtDate(S.today()) + ')\n' + (p.idade ? 'Idade ' + p.idade + ' · ' : '') + (p.peso ? p.peso + ' kg · ' : '') + (p.altura ? p.altura + ' cm' : '') + '\n\n' +
      active().map(c => '• ' + H.title(c) + ' — desde ' + U.fmtDate(c.since) + (c.kind === 'lesao' ? ' · fase: ' + PHASES[c.phase] : '') + (c.kind !== 'cronica' ? ' · dor atual ' + painNow(c) + '/10' + (c.pains && c.pains.length > 1 ? ' (histórico: ' + c.pains.slice(-8).map(x => x.v).join(', ') + ')' : '') : '') +
        '\n  Adaptações aplicadas pelo app: ' + H.effects(c).join(' ') + (c.notes ? '\n  Orientação registrada: ' + c.notes : '')).join('\n\n') +
      '\n\nTreinos nos últimos 28 dias: ' + logs.length + (logs.length ? ' (último em ' + U.fmtDate(logs[0].date) + ')' : '') + '\n' +
      logs.slice(0, 8).map(l => '  ' + U.fmtDate(l.date) + ' — ' + (l.sessionName || '') + (l.rpe ? ' · esforço ' + l.rpe + '/10' : '') + (l.feel ? ' · achou ' + { facil: 'fácil', ok: 'na medida', pesado: 'pesado' }[l.feel] : '') + (l.pain ? ' · dor em ' + l.pain.join(', ') : '')).join('\n') +
      '\n\nGerado pelo app Nina Calisthenics (regras gerais, sem avaliação clínica). ' + H.rulesNote() + ' As fases e liberações registradas foram informadas pelo próprio usuário. Por favor, indique o que deve ser mudado.';
    SHARE.last = { text: txt, fone: '' };
    U.modal('<h2>Relatório para o profissional</h2><p class="muted small">Mostre ao médico, fisioterapeuta ou professor. As orientações deles você registra em cada condição.</p><textarea readonly rows="12" id="sh-text">' + e(txt) + '</textarea>' +
      '<button class="btn block" data-a="sh-wa">Enviar pelo WhatsApp</button><button class="btn ghosty block" data-a="sh-copy">Copiar</button>');
  };

  // ---------- Hoje e Perfil ----------
  // Acrescenta à tela Hoje (definida em js/theme.js) os avisos de saúde e de consulta.
  const hoje0 = V.hoje;
  V.hoje = () => {
    const h = hoje0(), act = active(); if (!act.length) return h;
    const due = act.filter(H.nudgeDue)[0];
    const b = (due ? nudgeHtml(due) : '') + '<a class="hint" href="#saude" style="display:block;text-decoration:none;color:inherit">🩹 Treinos adaptados para: <b>' + e(act.map(c => H.title(c) + (c.kind === 'lesao' ? ' (' + PHASES[c.phase].toLowerCase() + ')' : '')).join('; ')) + '</b> ›</a>';
    const i = h.indexOf('<div class="hero'); return i >= 0 ? h.slice(0, i) + b + h.slice(i) : h.replace('</h1>', '</h1>' + b);
  };
  const perfil0 = V.perfil;
  V.perfil = () => perfil0().replace('</h1>', '</h1><a class="card lvl-card" href="#saude" style="text-decoration:none;color:inherit"><div class="lvl-badge" style="background:var(--card2)">🩹</div><div class="grow"><b>Saúde e lesões</b><div class="muted small">' +
    (active().length ? active().length + ' condição(ões) ativa(s): ' + e(active().map(H.title).join('; ')) : 'Dor, lesão, fratura ou condição crônica: registre para adaptar os treinos') + '</div></div><span class="muted">›</span></a>');

  // ---------- ficha do aluno ----------
  const aluno0 = V.aluno;
  V.aluno = () => {
    const h = aluno0(), a = alunos().find(x => x.id === PEOPLE.alunoId); if (!a) return h;
    const act = (a.conditions || []).filter(c => !c.resolved), old = (a.conditions || []).filter(c => c.resolved);
    const sec = '<div class="card"><div class="row between"><h2>Saúde e lesões</h2><button class="btn small" data-a="hl-new" data-al="' + e(a.id) + '">+ Registrar</button></div>' +
      '<p class="muted small">Dores, lesões e condições crônicas do aluno. Os treinos gerados para ele já respeitam estas condições, e elas vão junto quando você envia o treino. Para liberar a volta de uma lesão, siga o médico ou fisioterapeuta dele.</p>' +
      (act.length ? act.map(card).join('') : '<p class="small">Nenhuma condição registrada.</p>') +
      (old.length ? '<details><summary class="small muted">Já resolvidas (' + old.length + ')</summary><ul class="small">' + old.map(c => '<li>' + e(H.title(c)) + ' <button class="link" data-a="hl-reopen" data-id="' + c.id + '">reabrir</button></li>').join('') + '</ul></details>' : '') + '</div>';
    const i = h.indexOf('<div class="card"><h2>Treinos</h2>');
    return i >= 0 ? h.slice(0, i) + sec + h.slice(i) : h + sec;
  };
  // enviar treino de aluno: as condições dele vão junto no link
  const send0 = SHARE.program;
  SHARE.program = async (progId, fone, toName) => {
    const src = S.state.programs[progId], a = src && src.alunoId && alunos().find(x => x.id === src.alunoId), act = a ? (a.conditions || []).filter(c => !c.resolved) : [];
    if (act.length) src.conds = act.map(c => Object.assign({}, c, { pains: (c.pains || []).slice(-6) }));
    try { return await send0(progId, fone, toName); } finally { if (src) delete src.conds; }
  };
  // o link do treino troca o endereço para #hoje antes de abrir a janela: observa por alguns instantes depois de cada troca
  window.addEventListener('hashchange', () => { let n = 0; const iv = setInterval(() => {
    const inc = SHARE.incoming, h2 = U.$('#modal .modal-box h2');
    if (h2 && /Treino recebido/.test(h2.textContent) && inc && inc.p && inc.p.conds && !U.$('#modal .hl-inc')) h2.insertAdjacentHTML('afterend', '<div class="hint hl-inc">🩹 O professor registrou condições de saúde: <b>' + e(inc.p.conds.map(H.title).join('; ')) + '</b>. Ao aceitar, elas entram na sua área de Saúde e os treinos são adaptados.</div>');
    if (++n > 30 || U.$('#modal .hl-inc')) clearInterval(iv); }, 100); });
  const accept0 = A['sh-accept'];
  A['sh-accept'] = d => {
    const inc = SHARE.incoming, cs = (inc && inc.p && inc.p.conds) || []; if (inc && inc.p) delete inc.p.conds;
    accept0(d);
    const key = c => [c.kind, c.area, c.spec].join('|'); let added = 0;
    cs.forEach(c => { if (!active().some(x => key(x) === key(c))) { conds().push(Object.assign({}, c, { id: 'h-' + S.uid(), t: Date.now() })); added++; } });
    if (added) { S.save(); U.toast(added + ' condição(ões) de saúde adicionada(s) em Saúde.'); }
  };
  // relatório do aluno ao professor: leva as condições e a dor
  H.reportConds = () => active().map(c => ({ kind: c.kind, area: c.area, spec: c.spec, side: c.side, since: c.since, phase: c.phase, consult: c.consult, diagnosis: c.diagnosis, pains: (c.pains || []).slice(-8), notes: c.notes }));
  H.reportText = () => active().length ? '\n\nSaúde:\n' + active().map(c => '  • ' + H.title(c) + (c.kind === 'lesao' ? ' · fase ' + PHASES[c.phase].toLowerCase() : '') + (c.kind !== 'cronica' ? ' · dor ' + painNow(c) + '/10' : '') + (c.diagnosis ? ' · diagnóstico: ' + c.diagnosis : c.kind !== 'cronica' && !consulted(c) ? ' · sem avaliação profissional' : '')).join('\n') : '';
  const rhtml0 = SHARE.reportHtml;
  SHARE.reportHtml = d => (d.conds && d.conds.length ? '<div class="hint"><b>🩹 Saúde</b><ul class="small" style="margin:4px 0 0;padding-left:18px">' + d.conds.map(c => '<li>' + e(H.title(c)) + (c.kind === 'lesao' ? ' · fase ' + e(PHASES[c.phase] || '') : '') + (c.pains && c.pains.length ? ' · dor ' + c.pains.map(x => x.v).join(' → ') : '') + (c.diagnosis ? ' · ' + e(c.diagnosis) : '') + '</li>').join('') + '</ul></div>' : '') + rhtml0(d);
  const rsave0 = A['sh-report-save'];
  A['sh-report-save'] = () => {
    const a = alunos().find(x => x.id === U.$('#sh-aluno').value), cs = (SHARE.incoming && SHARE.incoming.conds) || [];
    rsave0();
    if (!a || !cs.length) return;
    const key = c => [c.area, c.spec || ''].join('|'); a.conditions = a.conditions || [];
    cs.forEach(c => { const m = a.conditions.find(x => !x.resolved && key(x) === key(c)); if (m) Object.assign(m, { kind: c.kind, phase: c.phase, consult: c.consult, diagnosis: c.diagnosis, pains: c.pains, notes: c.notes || m.notes, t: Date.now() }); else a.conditions.push(Object.assign({}, c, { id: 'h-' + S.uid(), t: Date.now(), blocked: [] })); });
    a.t = Date.now(); S.save(); U.toast('Relatório e condições de saúde atualizados na ficha de ' + a.nome + '.');
  };
})();
