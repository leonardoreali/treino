/* Árvores de habilidade + programa inicial (o PDF "Programa de Treino em Casa").
   Item de exercício: { ex | skill, sets, min, max, unit:'reps'|'s', side, rest (s), note }
   Tipos de bloco: 'check' (aquecimento/alongamento), 'forca', 'cardio', 'intervalado'. */
(function () {
  // crit: quantas séries (sets) com pelo menos (val) para liberar o próximo passo.
  window.SKILLS = [
    { id: 'muscle-up', name: 'Muscle-up', icon: '🦍', prazo: '3–9 meses', start: 0,
      note: 'Antes do muscle-up, confira a distância entre a barra e o teto (80–90 cm livres). Sem espaço, vá só até a barra explosiva em casa.',
      steps: [
        { ex: 'barra-pronada', label: '12 barras limpas', crit: { sets: 1, val: 12, unit: 'reps' } },
        { ex: 'barra-explosiva', crit: { sets: 5, val: 5, unit: 'reps' } },
        { ex: 'barra-cintura', crit: { sets: 5, val: 5, unit: 'reps' } },
        { ex: 'muscle-up-negativa', crit: { sets: 5, val: 5, unit: 'reps' } },
        { ex: 'muscle-up', crit: { sets: 5, val: 5, unit: 'reps' } }] },
    { id: 'parada-mao', name: 'Parada de mão', icon: '🤸', prazo: '6–12 meses para a livre', start: 0,
      steps: [
        { ex: 'parada-mao-parede', label: 'Peito para a parede 60 s', crit: { sets: 3, val: 60, unit: 's' } },
        { ex: 'parada-mao-um-pe', crit: { sets: 3, val: 30, unit: 's' } },
        { ex: 'parada-mao-toques', crit: { sets: 3, val: 20, unit: 's' } },
        { ex: 'parada-mao-livre', label: 'Livre 10 s', crit: { sets: 3, val: 10, unit: 's' } },
        { ex: 'parada-mao-livre', label: 'Livre 30 s', crit: { sets: 3, val: 30, unit: 's' } }] },
    { id: 'front-lever', name: 'Front lever', icon: '🪵', prazo: '1–2 anos para o completo', start: 0,
      steps: [
        { ex: 'front-lever-tuck', crit: { sets: 5, val: 10, unit: 's' } },
        { ex: 'fl-tuck-avancado', crit: { sets: 5, val: 10, unit: 's' } },
        { ex: 'fl-uma-perna', crit: { sets: 5, val: 10, unit: 's' } },
        { ex: 'fl-straddle', crit: { sets: 5, val: 10, unit: 's' } },
        { ex: 'front-lever', crit: { sets: 5, val: 10, unit: 's' } }] },
    { id: 'l-sit', name: 'L-sit', icon: '🪑', prazo: '2–4 meses para o L-sit', start: 2,
      steps: [
        { ex: 'lsit-apoio', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'lsit-tuck-um-pe', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'tuck-lsit', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'lsit-uma-perna', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'lsit', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'vsit', crit: { sets: 3, val: 15, unit: 's' } }] },
    { id: 'pistol', name: 'Pistol squat', icon: '🦵', prazo: '1–3 meses', start: 0,
      steps: [
        { ex: 'pistol-assistido', crit: { sets: 3, val: 8, unit: 'reps' } },
        { ex: 'pistol-banco', crit: { sets: 3, val: 8, unit: 'reps' } },
        { ex: 'pistol', crit: { sets: 3, val: 8, unit: 'reps' } }] },
    { id: 'flexao-um-braco', name: 'Flexão de um braço', icon: '💪', prazo: '4–8 meses', start: 0,
      steps: [
        { ex: 'flexao', label: 'Flexão 4 × 15', crit: { sets: 4, val: 15, unit: 'reps' } },
        { ex: 'flexao-diamante', crit: { sets: 3, val: 8, unit: 'reps' } },
        { ex: 'flexao-archer', crit: { sets: 3, val: 8, unit: 'reps' } },
        { ex: 'flexao-um-braco-elevada', crit: { sets: 3, val: 8, unit: 'reps' } },
        { ex: 'flexao-um-braco', crit: { sets: 3, val: 8, unit: 'reps' } }] },
    { id: 'planche', name: 'Planche', icon: '🛩️', prazo: 'Meta de longo prazo, após 6 meses', start: 0,
      steps: [
        { ex: 'planche-lean', label: 'Planche lean 30 s', crit: { sets: 3, val: 30, unit: 's' } },
        { ex: 'tuck-planche', crit: { sets: 3, val: 15, unit: 's' } },
        { ex: 'tuck-planche-avancado', crit: { sets: 3, val: 15, unit: 's' } }] },
    { id: 'acrobacia', name: 'Acrobacias (fase 2)', icon: '🌀', prazo: 'Depois de 12 barras, 60 s de parada de mão na parede e pistol completo', start: 0,
      note: 'O mortal NÃO é para treinar sozinho no colchonete: só com spotter experiente, colchão grosso ou estrutura de ginástica. Ao chegar no rodante, procure um grupo de parkour ou ginástica.',
      steps: [
        { ex: 'rolamento-frente', label: 'Rolamento para frente e para trás', crit: { sets: 1, val: 10, unit: 'reps' } },
        { ex: 'ponte', label: 'Ponte com braços estendidos', crit: { sets: 3, val: 20, unit: 's' } },
        { ex: 'estrela', label: 'Estrela, para os dois lados', crit: { sets: 1, val: 10, unit: 'reps' } },
        { ex: 'salto-grupado', crit: { sets: 3, val: 5, unit: 'reps' } },
        { ex: 'rodante', crit: { sets: 1, val: 10, unit: 'reps' } },
        { ex: 'parada-ponte', crit: { sets: 1, val: 5, unit: 'reps' } },
        { ex: 'mortal-tras', label: 'Mortal — só com spotter experiente', crit: { sets: 1, val: 1, unit: 'reps' } }] },
  ];

  const it = (ex, sets, min, max, unit, extra) => Object.assign({ ex, sets, min, max: max || min, unit: unit || 'reps' }, extra || {});
  const sk = (skill, sets, min, max, unit, extra) => Object.assign({ skill, sets, min, max: max || min, unit: unit || 'reps' }, extra || {});

  const aquecimento = extra => ({
    title: 'Aquecimento (8 min)', kind: 'check', items: [
      it('corda', 1, 180, 180, 's'), it('rotacao-ombros', 1, 30, 30, 's'), it('gato-vaca', 1, 10), it('escapula-barra', 1, 10),
      it('agachamento', 1, 10, 10, 'reps', { note: 'Lento' }), ...(extra || []),
      { text: '1 série leve do primeiro exercício' }] });
  const flexCurta = () => ({
    title: 'Rotina curta de flexibilidade (10 min)', kind: 'check', items: [
      it('pike-pe', 1, 45, 60, 's'), it('pike-ativo', 3, 10, 10, 'reps', { note: 'Calcanhares fora do chão por 2 s' }),
      it('meio-espacate', 1, 45, 45, 's', { side: true }), it('lagarto', 1, 45, 45, 's', { side: true }),
      it('pombo', 1, 45, 45, 's', { side: true }), it('ponte', 3, 10, 10, 's', { note: 'Ou meia ponte, só quadril' })] });
  const elasticoOmbro = [it('rotacao-externa', 2, 15), it('wall-slide', 2, 10)];

  window.DEFAULT_PROGRAM = {
    id: 'casa-2026-11', name: 'Programa de Treino em Casa — Calistenia, Cardio e Flexibilidade',
    startDate: '2026-11-09', rounds: 12, deloadRounds: [4, 8, 12],
    sessions: [
      { name: 'Força A: empurrar + pernas', duration: 60, blocks: [
        aquecimento([it('monster-walk', 2, 10, 10, 'reps', { side: true, note: 'Passos para cada lado' })]),
        { title: 'Treino A', kind: 'forca', items: [
          it('pike-pushup', 4, 6, 10, 'reps', { rest: 150 }),
          sk('flexao-um-braco', 4, 8, 15, 'reps', { rest: 150 }),
          it('mergulho-banco', 3, 10, 15, 'reps', { rest: 75 }),
          it('bulgaro', 3, 8, 12, 'reps', { side: true, rest: 75 }),
          sk('pistol', 3, 5, 8, 'reps', { side: true, rest: 75 }),
          it('panturrilha-unilateral', 3, 15, 25, 'reps', { side: true, rest: 60 }),
          it('hollow-body', 3, 20, 40, 's', { rest: 60 })] },
        { title: 'Mini elásticos (final)', kind: 'forca', items: [
          it('ponte-gluteo-elastico', 3, 15, 15, 'reps', { rest: 45 }), it('clamshell', 2, 15, 15, 'reps', { side: true, rest: 30 })] },
        flexCurta()] },
      { name: 'Cardio contínuo + core', duration: 45, blocks: [
        { title: 'Cardio contínuo', kind: 'cardio', min: 30, max: 40, ex: 'caminhada',
          note: 'Ritmo em que dá para falar frases curtas. Melhor: caminhada rápida ou trote fora de casa, de dia. Em casa: blocos de 3 min de corda com 1 min leve, alternando com subida de escada.' },
        { title: 'Core (10 min)', kind: 'forca', items: [
          it('hollow-body', 3, 30, 30, 's', { rest: 45 }), it('prancha-lateral', 3, 30, 30, 's', { side: true, rest: 45 }),
          it('dead-bug', 3, 10, 10, 'reps', { side: true, rest: 45 })] },
        flexCurta()] },
      { name: 'Força B: puxar + core', duration: 60, blocks: [
        aquecimento(elasticoOmbro),
        { title: 'Treino B', kind: 'forca', items: [
          it('barra-pronada', 5, 4, 7, 'reps', { rest: 150, note: 'Pare 1–2 reps antes da falha' }),
          it('chin-up', 3, 5, 8, 'reps', { rest: 150 }),
          it('remada-corda', 3, 10, 15, 'reps', { rest: 75, note: 'Alternativa: Y-T-W de bruços no banco, 3 × 8 de cada letra' }),
          it('escapula-barra', 3, 10, 10, 'reps', { rest: 60 }),
          it('elevacao-joelhos', 3, 8, 12, 'reps', { rest: 60 }),
          it('isometria-topo', 3, 10, 20, 's', { rest: 75 }),
          it('superman', 3, 20, 30, 's', { rest: 60 })] },
        flexCurta()] },
      { name: 'Habilidades + cardio intervalado', duration: 45, blocks: [
        aquecimento(),
        { title: 'Acrobacias — fase 2 (15 min)', kind: 'forca', phase2: true, items: [sk('acrobacia', 3, 5, 10, 'reps', { rest: 60 })] },
        { title: 'Prática de habilidades (20 min)', kind: 'forca', note: 'Sempre longe da falha: é treino de técnica, não de cansaço.', items: [
          sk('parada-mao', 5, 20, 40, 's', { rest: 90 }), sk('l-sit', 4, 10, 15, 's', { rest: 90 }),
          sk('pistol', 3, 5, 5, 'reps', { side: true, rest: 90 })] },
        { title: 'Intervalado', kind: 'intervalado', note: 'Esforço máximo no forte, pausa leve. Na primeira volta, 6 rodadas de corda em vez de 10.', options: [
          { name: 'Opção A — corda (10 min)', work: 30, rest: 30, rounds: 10, firstRounds: 6, labels: ['Corda o mais rápido possível'], ex: 'corda' },
          { name: 'Opção B — Tabata (4 min)', work: 20, rest: 10, rounds: 8, labels: ['Burpee', 'Mountain climber', 'Agachamento com salto', 'Polichinelo'], ex: 'burpee' }] },
        flexCurta()] },
      { name: 'Força C: corpo todo + habilidades', duration: 60, blocks: [
        aquecimento(elasticoOmbro),
        { title: 'Treino C', kind: 'forca', items: [
          sk('parada-mao', 5, 20, 40, 's', { rest: 150, note: 'Primeiro, sempre: habilidade se treina descansado' }),
          it('barra-explosiva', 4, 3, 5, 'reps', { rest: 150 }),
          it('flexao-explosiva', 4, 5, 8, 'reps', { rest: 75 }),
          sk('l-sit', 4, 10, 20, 's', { rest: 75 }),
          sk('front-lever', 4, 8, 15, 's', { rest: 75 }),
          it('agachamento-salto', 3, 8, 8, 'reps', { rest: 60 }),
          it('passada', 3, 12, 12, 'reps', { side: true, rest: 60 })] },
        flexCurta()] },
      { name: 'Recuperação: flexibilidade longa + parada de mão leve', duration: 40, blocks: [
        { title: 'Parada de mão leve na parede', kind: 'forca', items: [sk('parada-mao', 5, 20, 30, 's', { rest: 60 })] },
        { title: 'Sessão longa de flexibilidade (30 min)', kind: 'check', items: [
          it('pike-pe', 2, 45, 60, 's'), it('pike-ativo', 2, 10, 10, 'reps'), it('meio-espacate', 2, 45, 45, 's', { side: true }),
          it('lagarto', 2, 45, 45, 's', { side: true }), it('pombo', 2, 45, 45, 's', { side: true }), it('ponte', 2, 10, 10, 's'),
          it('contrai-relaxa-pike', 4, 5, 5, 's', { note: 'Empurre 5 s, solte e desça mais' }),
          it('pancake', 3, 45, 45, 's'), it('pancake', 2, 10, 10, 'reps', { note: 'Levantando os calcanhares do chão' }),
          it('afundo-espacate', 2, 45, 45, 's', { side: true }), it('couch-stretch', 2, 45, 45, 's', { side: true }),
          it('dead-hang', 3, 30, 30, 's', { note: 'Relaxado' }), it('passagem-ombro', 1, 10)] }] },
    ],
    tests: [
      { id: 'barras', name: 'Barras seguidas', unit: 'reps', baseline: 8, goal: '12–15' },
      { id: 'flexoes', name: 'Flexões seguidas', unit: 'reps', baseline: 15, goal: '30+ e flexão archer' },
      { id: 'agachamentos', name: 'Agachamentos', unit: 'reps', baseline: 50, goal: 'Pistol squat com apoio leve' },
      { id: 'prancha', name: 'Prancha', unit: 's', baseline: 90, goal: 'Hollow body 45 s' },
      { id: 'panturrilha', name: 'Panturrilha na escada', unit: 'reps', baseline: 50, goal: '25 com uma perna' },
      { id: 'cintura', name: 'Cintura (na altura do umbigo)', unit: 'cm', baseline: null, goal: '3–5 cm a menos', lowerIsBetter: true },
    ],
    notes: [
      { title: 'Como funciona a fila', text: 'São 6 sessões em ordem fixa, uma por dia, sem dias da semana. Terminou a 6, volta para a 1. Não treinou? A fila espera. Não pule sessões nem faça duas no mesmo dia.\n\nHorário fixo: 17h. Dia cheio ou ruim: faça só a rotina curta de flexibilidade (10 min) — a fila não anda, e o hábito continua.\n\nVoltas 4, 8 e 12 são leves: metade das séries e reteste dos números do início.' },
      { title: 'Regras de progressão e descanso', text: '1. Dupla progressão: completou todas as séries no topo da faixa → passe para a variação mais difícil e volte ao início da faixa.\n2. Perto da falha, não na falha: termine sentindo que dariam mais 1–2 reps.\n3. Volta leve: voltas 4, 8 e 12 com metade das séries.\n4. Descanse mais um dia se: dor nas articulações, sono ruim por vários dias ou desempenho caindo em 2 treinos seguidos.\n5. Dor aguda ou que piora: pare. Se persistir, procure médico ou fisioterapeuta.\n6. Perdeu um dia: a fila espera. Depois de 3 dias ou mais parado, volte pelo início da faixa.\n7. Sono: 7–9 horas.' },
      { title: 'Descanso entre séries', text: '2–3 min nos dois primeiros exercícios e 60–90 s nos demais.' },
      { title: 'Flexibilidade', text: '10 minutos todo dia valem mais que uma hora de vez em quando. Desconforto de uns 6 de 10; dor aguda ou formigamento é sinal para sair da posição. Alongamento longo fica melhor depois do treino, não antes da força.' },
      { title: 'Alimentação básica', text: '• Proteína em toda refeição (referência comum: 1,6–2 g por kg). Opções baratas: ovos, frango, sardinha em lata, carne moída, feijão com arroz, leite e iogurte.\n• Metade do prato com legumes e verduras no almoço e no jantar.\n• Cortar calorias líquidas: refrigerante, suco de caixinha e álcool.\n• Água ao longo do dia.\n\nMeça a cintura uma vez por semana, de manhã. Se em 3 semanas não mudar nada, tire um lanche ou doce extra por dia.' },
    ],
  };

  // Registros de treino vêm do PDF importado pelo usuário (Programa → Importar PDF), não do código.
  window.DEFAULT_LOGS = [];
})();
