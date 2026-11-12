/* Gerador de treino por regras (sem IA): monta um programa a partir do perfil
   (objetivo, nível, dias, tempo, local, equipamentos, limitações e testes simples). */
(function () {
  const G = window.GEN = {};
  G.GOALS = { saude: 'Saúde e condicionamento geral', emagrecer: 'Emagrecer / definir', hipertrofia: 'Ganhar músculo', forca: 'Ganhar força', habilidades: 'Habilidades de calistenia' };
  G.LEVELS = { 1: 'Iniciante (menos de 6 meses)', 2: 'Intermediário (6 meses a 2 anos)', 3: 'Avançado (mais de 2 anos)' };
  G.LIMITS = { joelho: 'Joelho', ombro: 'Ombro', lombar: 'Lombar', punho: 'Punho' };
  // Exercícios evitados por limitação.
  const AVOID = {
    joelho: 'agachamento-salto salto-grupado burpee pistol pistol-assistido pistol-banco bulgaro passada afundo-halteres shrimp cossack agachamento-barra corda polichinelo joelho-alto',
    ombro: 'dips mergulho-banco pike-pushup pike-pushup-elevado hspu-parede desenvolvimento-halteres desenvolvimento-maquina parada-mao-parede supino-barra triceps-frances barra-explosiva',
    lombar: 'terra stiff remada-curvada superman agachamento-barra elevacao-pernas toes-to-bar dragon-flag burpee',
    punho: 'planche-lean tuck-planche parada-mao-parede flexao-diamante flexao-pseudo-planche crow tuck-lsit lsit',
  };
  // Padrões de movimento: [exercício, nível 1-3]. Primeiro os de peso do corpo, depois os de academia.
  const PAT = {
    pushH: [['flexao-inclinada', 1], ['flexao-joelhos', 1], ['flexao', 2], ['flexao-diamante', 3], ['dips', 3], ['flexao-archer', 4], ['flexao-pseudo-planche', 4], ['supino-maquina', 1], ['supino-halteres', 2], ['supino-barra', 3], ['supino-inclinado', 2]],
    pushV: [['mergulho-banco', 1], ['pike-pushup', 2], ['pike-pushup-elevado', 3], ['hspu-parede', 4], ['desenvolvimento-maquina', 1], ['desenvolvimento-halteres', 2]],
    pullV: [['barra-negativa', 1], ['chin-up', 2], ['barra-pronada', 3], ['barra-l', 4], ['barra-archer', 4], ['puxada-alta', 1]],
    pullH: [['remada-australiana', 1], ['remada-corda', 2], ['remada-maquina', 1], ['remada-baixa', 1], ['remada-serrote', 2], ['remada-curvada', 3], ['ytw', 1], ['superman', 1]],
    knee: [['agachamento', 1], ['bulgaro', 2], ['pistol-assistido', 3], ['pistol', 4], ['leg-press', 1], ['goblet', 1], ['agachamento-barra', 3]],
    hip: [['meia-ponte', 1], ['ponte-gluteo-elastico', 1], ['nordic', 3], ['flexora', 1], ['hip-thrust', 2], ['stiff', 2], ['terra', 3]],
    single: [['passada', 1], ['bulgaro', 2], ['afundo-halteres', 2], ['wall-sit', 1]],
    legIso: [['extensora', 1], ['flexora', 1], ['abdutora', 1], ['wall-sit', 1]],
    calf: [['panturrilha', 1], ['panturrilha-unilateral', 2], ['panturrilha-maquina', 1]],
    coreA: [['prancha', 1], ['dead-bug', 1], ['abdominal', 1], ['hollow-body', 2], ['elevacao-joelhos', 2], ['abdominal-polia', 2], ['elevacao-pernas', 3], ['toes-to-bar', 4]],
    coreB: [['prancha-lateral', 1], ['superman', 1], ['dead-bug', 1]],
    bi: [['rosca-alternada', 1], ['rosca-martelo', 1], ['rosca-direta', 2], ['chin-up', 2]],
    tri: [['triceps-polia', 1], ['triceps-frances', 2], ['mergulho-banco', 1], ['flexao-diamante', 3]],
    delt: [['elevacao-lateral', 1], ['face-pull', 1]],
    rear: [['face-pull', 1], ['ytw', 1], ['superman', 1]],
    explo: [['agachamento-salto', 2], ['flexao-explosiva', 3]],
  };
  const TEMPL = {
    fullA: ['Corpo todo A', 'pushH pullV knee hip coreA calf delt'],
    fullB: ['Corpo todo B', 'pushV pullH single hip coreB tri bi'],
    fullC: ['Corpo todo C', 'pushH pullH knee legIso coreA bi tri'],
    upper: ['Superior', 'pushH pullV pushV pullH bi tri delt'],
    lower: ['Inferior', 'knee hip single legIso calf coreA coreB'],
    push: ['Empurrar', 'pushH pushV tri delt pushH coreA'],
    pull: ['Puxar', 'pullV pullH bi rear pullH coreB'],
    legs: ['Pernas', 'knee hip single legIso calf coreA'],
  };
  const TIMED = new Set(['prancha', 'prancha-lateral', 'hollow-body', 'superman', 'wall-sit', 'dead-hang']);
  const SKILL_OF = { pushH: 'flexao-um-braco', knee: 'pistol' };

  G.imc = p => p.peso && p.altura ? p.peso / Math.pow(p.altura / 100, 2) : null;
  G.imcText = v => v == null ? '' : v < 18.5 ? 'abaixo do peso' : v < 25 ? 'faixa considerada saudável' : v < 30 ? 'sobrepeso' : 'obesidade';

  G.generate = function (p, owned) {
    owned = owned || S.owned();
    const goal = p.objetivo || 'saude', days = Math.max(2, Math.min(6, +p.dias || 3)), time = +p.tempo || 45;
    const imc = G.imc(p), age = +p.idade || 0;
    const careful = (age && (age >= 60 || age < 16)) || (imc && imc >= 35) || (p.limit || []).length > 0;
    let lvl = Math.max(1, Math.min(3, +p.nivel || 1)); if (careful && (age >= 60 || age < 16 || (imc && imc >= 35))) lvl = 1;
    const gymFirst = p.local === 'academia' || (p.local === 'misto' && (goal === 'hipertrofia' || goal === 'forca'));
    const avoid = new Set((p.limit || []).flatMap(l => (AVOID[l] || '').split(' ')));
    if ((imc && imc >= 30) || age >= 60) AVOID.joelho.split(' ').filter(x => /salto|burpee|corda|polichinelo|joelho-alto/.test(x)).forEach(x => avoid.add(x));
    const can = id => !avoid.has(id) && (EQUIP_NEEDS[id] || []).every(q => owned.includes(q));
    // nível por padrão a partir dos testes (flexões e barras seguidas), quando informados
    const lv = { push: lvl, pull: lvl, legs: lvl };
    if (p.flexoes !== '' && p.flexoes != null) lv.push = +p.flexoes < 5 ? 1 : +p.flexoes <= 20 ? 2 : +p.flexoes <= 35 || lvl < 3 ? 3 : 4;
    if (p.barras !== '' && p.barras != null) lv.pull = +p.barras < 1 ? 1 : +p.barras < 8 ? 2 : +p.barras < 15 || lvl < 3 ? 3 : 4;
    const lvFor = pat => /^push|tri|delt/.test(pat) ? lv.push : /^pull|bi/.test(pat) ? lv.pull : lvl;

    const pick = (pat, used, alt) => {
      const target = lvFor(pat);
      let c = PAT[pat].filter(x => can(x[0]) && !used.has(x[0]) && x[1] <= target + 1);
      if (!c.length) return null;
      const isGym = x => !!S.ex(x[0]).gym;
      c.sort((a, b) => (gymFirst ? isGym(b) - isGym(a) : isGym(a) - isGym(b)) || (a[1] <= target ? 0 : 1) - (b[1] <= target ? 0 : 1) || (a[1] <= target ? b[1] - a[1] : a[1] - b[1]));
      const pref = c.filter(x => isGym(x) === isGym(c[0]) && x[1] <= Math.max(target, c[0][1]));
      return (alt && pref[1] ? pref[1] : c[0])[0];
    };
    const VOL = { forca: [4, 5, 8, 4, 6, 150], hipertrofia: [lvl > 1 ? 4 : 3, 8, 12, 8, 12, 90], emagrecer: [3, 10, 15, 10, 15, 60], saude: [lvl > 1 ? 3 : 2, 10, 15, 10, 15, 75], habilidades: [lvl > 1 ? 4 : 3, 6, 10, 6, 10, 120] }[careful && goal === 'forca' ? 'saude' : goal];
    const maxEx = time <= 30 ? 4 : time <= 45 ? 6 : 7;
    const item = (ex, n, pat) => {
      const core = /^core/.test(pat), acc = core || (goal === 'forca' && /^(tri|bi|delt|rear|calf|legIso)/.test(pat));
      const w = S.ex(ex).w, sets = Math.min(careful ? 3 : 5, Math.max(2, VOL[0] - (n >= 2 ? 1 : 0) + (n >= 2 && VOL[0] <= 2 ? 1 : 0)));
      const o = TIMED.has(ex) ? { ex, sets: Math.min(3, sets), min: 20, max: 40, unit: 's', rest: 45 }
        : acc ? { ex, sets: Math.min(3, sets), min: core ? 10 : 8, max: core ? 15 : 12, unit: 'reps', rest: 60 }
        : { ex, sets, min: w ? VOL[3] : VOL[1], max: w ? VOL[4] : VOL[2], unit: 'reps', rest: n < 2 ? VOL[5] : Math.max(45, VOL[5] - 30) };
      if (goal === 'hipertrofia' && lvl === 3 && w && /^(tri|bi|delt|rear|legIso|calf)/.test(pat)) o.note = 'Última série: perto da falha, reduza ~20% da carga e continue sem descanso (drop-set).';
      if (/bulgaro|passada|afundo|pistol|panturrilha-unilateral|remada-serrote|prancha-lateral|dead-bug/.test(ex)) o.side = true;
      if (goal === 'habilidades' && SKILL_OF[pat] && S.skill(SKILL_OF[pat]).steps.some(s => s.ex === ex)) { o.skill = SKILL_OF[pat]; }
      return o;
    };
    const aquec = () => ({ title: 'Aquecimento (5–8 min)', kind: 'check', items: [
      can('corda') ? { ex: 'corda', sets: 1, min: 120, max: 120, unit: 's' } : (avoid.has('polichinelo') ? { text: 'Marcha parada ou caminhada leve — 2 min' } : { ex: 'polichinelo', sets: 1, min: 60, max: 60, unit: 's' }),
      { ex: 'rotacao-ombros', sets: 1, min: 30, max: 30, unit: 's' }, { ex: 'gato-vaca', sets: 1, min: 10, max: 10, unit: 'reps' },
      { ex: 'agachamento', sets: 1, min: 10, max: 10, unit: 'reps', note: 'Lento' }, { text: '1 série leve do primeiro exercício' }] });
    const flex = () => JSON.parse(JSON.stringify(DEFAULT_PROGRAM.sessions[0].blocks.slice(-1)[0]));
    const hiit = () => {
      const labels = ['polichinelo', 'joelho-alto', 'mountain-climber', 'agachamento-salto', 'burpee'].filter(x => !avoid.has(x) && (lvl > 1 || x !== 'burpee')).map(x => S.ex(x).name);
      const o = lvl === 1 ? { work: 20, rest: 40, rounds: 8 } : lvl === 2 ? { work: 30, rest: 30, rounds: 10 } : { work: 20, rest: 10, rounds: 8 };
      return { title: 'Intervalado', kind: 'intervalado', note: 'Forte no esforço, pausa leve. Se faltar ar para falar uma palavra, diminua.', options: [Object.assign({ name: o.rounds + ' × ' + o.work + ' s forte / ' + o.rest + ' s pausa', labels: labels.length ? labels : ['Marcha rápida no lugar'], ex: 'polichinelo' }, o)] };
    };
    const cardioEx = ['esteira', 'bicicleta', 'eliptico'].find(can) || 'caminhada';
    const cardio = long => ({ title: 'Cardio contínuo', kind: 'cardio', ex: cardioEx, min: (long ? 25 : 15) + (lvl - 1) * 5, max: (long ? 35 : 20) + (lvl - 1) * 5, note: 'Ritmo em que dá para falar frases curtas: ' + S.ex(cardioEx).name.toLowerCase() + '.' });

    const strength = (key, alt) => {
      const [name, pats] = TEMPL[key], used = new Set(), items = [];
      const skills = [];
      if (goal === 'habilidades') {
        if (/A|push|upper/.test(key) && can('parada-mao-parede')) skills.push({ skill: 'parada-mao', sets: 4, min: 20, max: 40, unit: 's', rest: 90 });
        if (/B|pull|upper/.test(key) && can('front-lever-tuck')) skills.push({ skill: 'front-lever', sets: 4, min: 8, max: 15, unit: 's', rest: 90 });
        if (/C|legs|lower|B/.test(key) && !avoid.has('tuck-lsit')) skills.push({ skill: 'l-sit', sets: 4, min: 10, max: 20, unit: 's', rest: 75 });
      }
      for (const pat of pats.split(' ')) {
        if (items.length + skills.length >= maxEx) break;
        const ex = pick(pat, used, alt); if (!ex) continue;
        used.add(ex); items.push(item(ex, items.length, pat));
      }
      const blocks = [aquec(), { title: name, kind: 'forca', items: skills.concat(items) }];
      if ((goal === 'emagrecer' || goal === 'saude') && time >= 45 && days <= 3) blocks.push(goal === 'emagrecer' ? hiit() : cardio(false));
      blocks.push(flex());
      return { name: name + (alt ? ' (variação)' : ''), duration: time, blocks };
    };
    const cardioSession = hard => ({ name: hard ? 'Cardio intervalado + core' : 'Cardio contínuo + core', duration: Math.min(time, 45), blocks: [
      aquec(), hard ? hiit() : cardio(true),
      { title: 'Core', kind: 'forca', items: ['coreA', 'coreB'].map((pt, n) => { const ex = pick(pt, new Set(), false); return ex ? item(ex, n + 2, pt) : null; }).filter(Boolean) }, flex()] });

    const S_ = { 2: ['fullA', 'fullB'], 3: ['fullA', 'fullB', 'fullC'], 4: ['upper', 'lower', 'upper*', 'lower*'], 5: ['push', 'pull', 'legs', 'upper', 'lower'], 6: ['push', 'pull', 'legs', 'push*', 'pull*', 'legs*'] };
    let plan = S_[days].slice();
    if (lvl === 1 && days >= 4) plan = ['fullA', 'fullB', 'fullC', 'fullA*', 'fullB*', 'fullC*'].slice(0, days); // iniciante: corpo todo rende mais
    if (goal === 'emagrecer' || goal === 'saude') {
      const nCardio = goal === 'emagrecer' ? Math.floor(days / 2) : days >= 5 ? 2 : days >= 3 ? 1 : 0;
      const st = ['fullA', 'fullB', 'fullC', 'fullA*'].slice(0, days - nCardio); plan = [];
      for (let i = 0, c = 0; i < st.length; i++) { plan.push(st[i]); if (c < nCardio) plan.push(c++ % 2 === 0 ? 'cardio' : 'hiit'); }
    }
    const sessions = plan.map(k => k === 'cardio' ? cardioSession(false) : k === 'hiit' ? cardioSession(true) : strength(k.replace('*', ''), k.endsWith('*')));
    const seen = {}; sessions.forEach(s => { seen[s.name] = (seen[s.name] || 0) + 1; if (seen[s.name] > 1) s.name += ' ' + seen[s.name]; });

    const periodized = lvl === 3 && (goal === 'forca' || goal === 'hipertrofia') && !careful;
    const why = ['Objetivo: ' + G.GOALS[goal] + '. ' + days + ' sessões por volta (uma volta ≈ uma semana), cerca de ' + time + ' min cada.',
      'Divisão: ' + sessions.map(s => s.name).join(' → ') + '.',
      'Exercícios escolhidos pelo seu nível' + (p.flexoes || p.barras ? ' e pelos testes de flexões/barras' : '') + ', usando só os equipamentos marcados' + (gymFirst ? ' (prioridade para academia)' : ' (prioridade para peso do corpo)') + '.',
      (p.limit || []).length ? 'Evitei exercícios que costumam incomodar: ' + p.limit.map(l => G.LIMITS[l].toLowerCase()).join(', ') + '.' : '',
      periodized ? 'Periodização em 3 fases de 4 voltas: a faixa de repetições dos exercícios com carga cai 2 reps a cada fase, para você subir o peso. A 4ª volta de cada fase é leve.' : '',
      careful ? 'ATENÇÃO: pelo seu perfil (idade, IMC ou limitação), o treino foi montado na versão mais conservadora. Antes de começar, converse com um médico e, se possível, com um profissional de educação física.' : '',
      'Este treino é montado por regras gerais, não por um profissional que te avaliou. Dor aguda, tontura ou falta de ar fora do normal: pare e procure atendimento.'].filter(Boolean).join('\n\n');
    return {
      id: 'g-' + S.uid(), name: 'Treino ' + ({ saude: 'de saúde', emagrecer: 'para definir', hipertrofia: 'de hipertrofia', forca: 'de força', habilidades: 'de habilidades' }[goal]) + ' — ' + days + '×/semana',
      startDate: S.today(), rounds: 12, deloadRounds: [4, 8, 12], generated: true, sessions,
      phases: periodized ? [{ from: 1, to: 4, label: 'Fase 1 — base (mais repetições)', shift: 0 }, { from: 5, to: 8, label: 'Fase 2 — intensificação (mais carga, −2 reps)', shift: 2 }, { from: 9, to: 12, label: 'Fase 3 — pico (carga alta, −4 reps)', shift: 4 }] : undefined,
      tests: [{ id: 'peso', name: 'Peso', unit: 'kg', baseline: +p.peso || null, goal: '', lowerIsBetter: goal === 'emagrecer' || undefined },
        { id: 'flexoes', name: 'Flexões seguidas', unit: 'reps', baseline: p.flexoes === '' || p.flexoes == null ? null : +p.flexoes, goal: '' },
        { id: 'barras', name: 'Barras seguidas', unit: 'reps', baseline: p.barras === '' || p.barras == null ? null : +p.barras, goal: '' },
        { id: 'prancha', name: 'Prancha', unit: 's', baseline: null, goal: '' },
        { id: 'cintura', name: 'Cintura (na altura do umbigo)', unit: 'cm', baseline: null, goal: '', lowerIsBetter: true }],
      notes: [{ title: 'Como este treino foi montado', text: why },
        { title: 'Como progredir', text: '1. Completou todas as séries no topo da faixa? Com carga: aumente o peso e volte ao início da faixa. Sem carga: passe para a variação mais difícil.\n2. Termine as séries sentindo que dariam mais 1–2 repetições.\n3. Voltas 4, 8 e 12 são leves: metade das séries.\n4. Perdeu um dia? A fila espera. Não dobre treinos.\n5. Sono de 7–9 h e proteína em toda refeição fazem parte do treino.' }],
    };
  };
})();
