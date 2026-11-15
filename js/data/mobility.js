/* Mobilidade e flexibilidade (v18).
   Três modalidades, para não chamar todo alongamento de mobilidade:
   - estatica: flexibilidade estática e PNF (segurar a posição; vai no fim do treino ou em dia separado);
   - ativa:    mobilidade articular ativa e controlada (movimentos lentos e amplos; serve de aquecimento);
   - final:    flexibilidade ativa e força em amplitude final (o músculo trabalha na posição alongada).
   Cada exercício de mobilidade/flexibilidade tem dose recomendada (dose) e, quando há risco, um alerta (warn).
   Exercícios já existentes foram mantidos (mesmos ids); aqui só entram os que faltavam. */
(function () {
  window.MODALITIES = { estatica: 'Flexibilidade estática e PNF', ativa: 'Mobilidade articular ativa e controlada', final: 'Flexibilidade ativa e força em amplitude final' };
  // [id, nome, categoria, nível, como fazer, busca do vídeo, equipamentos, região, modalidade]
  const rows = [
    ['punho-cars', 'Rotação controlada do punho (wrist CARs)', 'mobilidade', 1, 'Segure o antebraço com a outra mão para ele não girar. Com o punho fechado, faça o maior círculo possível bem devagar, passando por todas as direções. 3–5 em cada sentido, por lado.', 'wrist CARs controlled articular rotations', [], 'punho', 'ativa'],
    ['quadril-90-90-liftoff', 'Elevação do joelho na posição 90/90 (lift-off)', 'mobilidade', 2, 'Sentado em 90/90, tronco ereto e mãos ao lado do corpo. Levante o joelho e o pé da perna de trás do chão, sem inclinar o tronco, segure 2 s e desça. Mais fácil: incline o tronco à frente ou apoie as mãos atrás.', '90 90 hip lift off tutorial', [], 'quadril', 'final'],
    ['escapula-elevacao-parede', 'Elevação escapular acima da cabeça na parede', 'mobilidade', 1, 'De frente para a parede, braços estendidos acima da cabeça com as mãos apoiadas. Sem dobrar os cotovelos, suba os ombros em direção às orelhas, segure 1 s e desça devagar. Prepara as escápulas para a parada de mão.', 'wall scapular shrugs overhead handstand', ['parede'], 'ombro', 'ativa'],
    ['elevacao-bracos-prono', 'Elevação dos braços deitado de bruços', 'mobilidade', 2, 'De bruços, testa apoiada numa toalha, braços estendidos acima da cabeça em Y e polegares para cima. Levante os braços do chão sem levantar o peito, segure 2 s e desça. Trabalha a força dos ombros na amplitude final.', 'prone Y lift overhead shoulder mobility', [], 'ombro', 'final'],
    ['flexor-quadril-ajoelhado', 'Alongamento do flexor do quadril com retroversão', 'flexibilidade', 1, 'Meio ajoelhado, almofada sob o joelho de trás. Encaixe o quadril (puxe o cóccix para baixo e contraia o glúteo de trás) antes de avançar; leve o quadril um pouco à frente com o tronco ereto. Sem arquear a lombar.', 'half kneeling hip flexor stretch posterior pelvic tilt', [], 'quadril', 'estatica'],
    ['quadriceps-deitado', 'Alongamento de quadríceps deitado de lado', 'flexibilidade', 1, 'Deitado de lado, segure o pé de cima e leve o calcanhar ao glúteo com os joelhos alinhados. Puxe o cóccix para baixo para sentir mais na frente do quadril. Mais fácil que a versão em pé, porque não exige equilíbrio.', 'side lying quad stretch', [], 'quadril', 'estatica'],
    ['couch-stretch-ativo', 'Couch stretch ativo', 'flexibilidade', 3, 'Na posição do couch stretch, com o glúteo de trás contraído, tire o pé da parede alguns centímetros e segure 3–5 s, ou contraia o pé contra a parede por 5 s e relaxe descendo um pouco mais. Força na amplitude final do quadríceps.', 'active couch stretch quad end range', ['parede'], 'quadril', 'final'],
    ['elevacao-perna-ativa', 'Elevação ativa da perna estendida', 'flexibilidade', 1, 'Deitado de costas, uma perna dobrada. Levante a outra estendida o mais alto que conseguir sem dobrar o joelho e desça devagar. Flexibilidade de posterior usada de verdade, sem puxar com as mãos.', 'active straight leg raise hamstring mobility', [], 'posterior', 'final'],
    ['straddle-ativo', 'Elevação de pernas abertas sentado', 'flexibilidade', 2, 'Sentado com as pernas abertas e estendidas, mãos no chão à frente do quadril. Levante as duas pernas (ou uma de cada vez) alguns centímetros e desça devagar. Ajuda no pancake e no espacate lateral.', 'seated straddle leg lifts compression', [], 'quadril', 'final'],
  ];
  const known = new Set(EXERCISES.map(x => x.id));
  rows.forEach(r => { if (known.has(r[0])) return; EXERCISES.push({ id: r[0], name: r[1], cat: r[2], level: r[3], how: r[4], q: r[5], reg: r[7], mod: r[8] }); if (r[6].length) EQUIP_NEEDS[r[0]] = (EQUIP_NEEDS[r[0]] || []).concat(r[6]); });

  // Agachamento profundo segurado é uma posição mantida (alongamento), não mobilidade ativa.
  EXERCISES.forEach(x => { if (x.id === 'agachamento-profundo') x.cat = 'flexibilidade'; });

  // Modalidade dos exercícios que já existiam. O que não está aqui segue a categoria:
  // flexibilidade → estática; mobilidade → ativa.
  const MOD = {
    ativa: 'passagem-ombro gato-vaca rotacao-ombros circulos-quadril cars-quadril cars-ombro punho-circulos tornozelo-circulos mobilidade-tornozelo quadril-90-90 shin-box worlds-greatest rotacao-toracica livro-aberto passar-agulha extensao-toracica rotacao-interna-quadril adutor-balanco deslizamento-chao wall-slide caminhada-ponta-calcanhar equilibrio-um-pe',
    final: 'pike-ativo ponte meia-ponte jefferson-curl elevacao-palmas clamshell monster-walk rotacao-externa tibial-parede punho-garrafa pronacao-supinacao abertura-dedos',
    estatica: 'contrai-relaxa-pike agachamento-profundo',
  };
  const mod = {}; Object.entries(MOD).forEach(([k, ids]) => ids.split(' ').forEach(id => { mod[id] = k; }));
  // lados: alongamentos e movimentos feitos um lado de cada vez
  const SIDE = new Set(('meio-espacate lagarto pombo couch-stretch couch-stretch-ativo afundo-espacate alongamento-quadriceps quadriceps-deitado flexor-quadril-ajoelhado alongamento-panturrilha alongamento-soleo ' +
    'alongamento-triceps sleeper-stretch alongamento-peitoral torcao-coluna quadril-90-90 quadril-90-90-liftoff shin-box cars-quadril cars-ombro punho-cars worlds-greatest livro-aberto passar-agulha ' +
    'inclinacao-lateral adutor-balanco mobilidade-tornozelo tornozelo-circulos elevacao-perna-ativa alongamento-posterior-deitado clamshell rotacao-externa equilibrio-um-pe pronacao-supinacao punho-garrafa').split(' '));
  const d = (sets, min, max, unit) => ({ sets, min, max, unit });
  // Dose recomendada quando o padrão da modalidade não serve
  const DOSE = {
    'contrai-relaxa-pike': d(3, 5, 5, 'reps'), 'agachamento-profundo': d(2, 30, 60, 's'), 'equilibrio-um-pe': d(2, 30, 30, 's'), ponte: d(3, 10, 20, 's'), 'meia-ponte': d(2, 10, 15, 'reps'),
    'pike-ativo': d(3, 8, 10, 'reps'), 'jefferson-curl': d(2, 6, 8, 'reps'), 'cars-quadril': d(1, 3, 5, 'reps'), 'cars-ombro': d(1, 3, 5, 'reps'), 'punho-cars': d(1, 3, 5, 'reps'),
    'tornozelo-circulos': d(1, 10, 10, 'reps'), 'caminhada-ponta-calcanhar': d(2, 20, 20, 'reps'), 'quadril-90-90-liftoff': d(2, 5, 8, 'reps'), 'couch-stretch-ativo': d(2, 5, 6, 'reps'),
    'elevacao-bracos-prono': d(2, 8, 10, 'reps'), 'straddle-ativo': d(2, 8, 10, 'reps'), 'elevacao-perna-ativa': d(2, 8, 10, 'reps'), 'monster-walk': d(2, 10, 15, 'reps'),
    'espacate-frontal': d(2, 45, 60, 's'), 'espacate-lateral': d(2, 45, 60, 's'), pancake: d(2, 45, 60, 's'), 'pike-pe': d(2, 30, 45, 's'),
  };
  const BASE = { estatica: d(2, 30, 45, 's'), ativa: d(1, 6, 8, 'reps'), final: d(2, 8, 12, 'reps') };
  // Alertas de risco específico
  const WARN = {
    'jefferson-curl': 'Comece sem carga e aumente só com a coluna sem dor. Com hérnia de disco ou dor lombar, faça apenas com liberação de um profissional.',
    'espacate-frontal': 'Desça só até um desconforto leve. Fisgada ou dor aguda: pare. Aqueça antes e não force num dia frio.',
    'espacate-lateral': 'Desça só até um desconforto leve. Fisgada ou dor aguda: pare. Aqueça antes e não force num dia frio.',
    pancake: 'Mantenha a coluna longa e não empurre com força. Dor na parte de dentro do joelho: diminua a abertura.',
    'german-hang': 'Muita tensão na frente dos ombros: entre e saia devagar, com os pés no chão no começo.',
    'skin-the-cat': 'Muita tensão na frente dos ombros: entre e saia devagar, com os pés no chão no começo.',
    ponte: 'Se a lombar doer ou formigar, pare e volte para a meia ponte. Evite com problema no pescoço.',
    cobra: 'Suba só até onde a lombar não incomodar; o quadril fica no chão.',
    'couch-stretch': 'Use almofada sob o joelho. Dor na frente do joelho: afaste um pouco o pé da parede.',
    'couch-stretch-ativo': 'Use almofada sob o joelho. Dor na frente do joelho: faça a versão normal.',
    'contrai-relaxa-pike': 'Contrações leves (metade da força). Não faça logo antes de treino de força ou de salto.',
    'sleeper-stretch': 'Pressão leve: se forçado, irrita a frente do ombro.',
    'quadril-90-90-liftoff': 'Cãibra na lateral do quadril é comum no começo: pare, solte e tente de novo.',
  };
  EXERCISES.forEach(x => {
    if (x.cat !== 'mobilidade' && x.cat !== 'flexibilidade' && !mod[x.id]) return;
    x.mod = x.mod || mod[x.id] || (x.cat === 'flexibilidade' ? 'estatica' : 'ativa');
    x.dose = Object.assign({}, DOSE[x.id] || BASE[x.mod], SIDE.has(x.id) ? { side: true } : {});
    if (WARN[x.id]) x.warn = WARN[x.id];
  });
  ['german-hang', 'skin-the-cat'].forEach(id => { const x = EXERCISES.find(y => y.id === id); if (x) x.warn = WARN[id]; });

  Object.assign(NEXT_VARIATION, {
    'quadriceps-deitado': 'alongamento-quadriceps', 'alongamento-quadriceps': 'couch-stretch', 'flexor-quadril-ajoelhado': 'couch-stretch', 'couch-stretch': 'couch-stretch-ativo',
    'shin-box': 'quadril-90-90-liftoff', 'cars-ombro': 'deslizamento-chao', 'deslizamento-chao': 'elevacao-bracos-prono', 'punho-circulos': 'punho-cars', 'punho-cars': 'alongamento-punho',
    'alongamento-posterior-deitado': 'elevacao-perna-ativa', 'pancake': 'straddle-ativo', 'escapula-elevacao-parede': 'wall-slide',
  });
  Object.assign(window.VIDEO_QUERY = window.VIDEO_QUERY || {}, {
    'punho-cars': 'wrist CARs tutorial mobility', 'escapula-elevacao-parede': 'wall scapular shrug handstand drill', 'elevacao-bracos-prono': 'prone overhead lift off shoulder flexion', 'elevacao-perna-ativa': 'active straight leg raise drill hamstring',
  });
})();
