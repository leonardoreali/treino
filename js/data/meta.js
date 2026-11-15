/* Classificação dos exercícios (v17):
   - padrão de movimento (além da categoria): empurrar horizontal/vertical, puxar horizontal/vertical, agachar,
     dobrar o quadril, flexionar o joelho, estabilizar, locomover e isolado (braços, ombros, máquinas);
   - região trabalhada nos exercícios de mobilidade e flexibilidade;
   - unilateral (um lado de cada vez);
   - exige supervisão: nunca entra sozinho em treinos gerados, trocas automáticas ou evolução automática.
   Exercício criado pelo usuário pode ter o campo pat definido no editor. */
(function () {
  window.PATTERNS = {
    'empurrar-h': 'Empurrar horizontal', 'empurrar-v': 'Empurrar vertical', 'puxar-h': 'Puxar horizontal', 'puxar-v': 'Puxar vertical',
    agachar: 'Agachar', quadril: 'Dobrar o quadril', joelho: 'Flexionar o joelho', estabilizar: 'Estabilizar', locomover: 'Locomover', isolado: 'Isolado (braços, ombros, máquinas)',
  };
  window.REGIONS = { quadril: 'Quadril', posterior: 'Posterior de coxa', ombro: 'Ombros', tornozelo: 'Tornozelos', coluna: 'Coluna', punho: 'Punhos' };
  const P = {
    'empurrar-h': 'flexao-inclinada flexao-joelhos flexao flexao-aberta flexao-diamante flexao-declinada flexao-archer flexao-pseudo-planche flexao-explosiva flexao-palma flexao-um-braco-elevada flexao-um-braco flexao-hindu flexao-spiderman flexao-t flexao-pausa flexao-typewriter flexao-tuck-planche flexao-escapular flexao-assimetrica flexao-um-braco-negativa supino-maquina supino-halteres supino-inclinado supino-barra crucifixo peck-deck supino-declinado supino-inclinado-barra crossover supino-fechado planche-lean tuck-planche tuck-planche-avancado tuck-planche-elevacoes planche-meia-straddle straddle-planche straddle-planche-elastico planche-completa',
    'empurrar-v': 'pike-pushup pike-pushup-elevado hspu-parede hspu-negativa hspu-livre mergulho-banco mergulho-negativo dips dips-argola dips-coreano desenvolvimento-maquina desenvolvimento-halteres desenvolvimento-barra arnold parada-mao-parede parada-mao-um-pe parada-mao-toques parada-mao-livre parada-caixa caminhada-parede parada-mao-chute press-handstand headstand parada-antebraco',
    'puxar-h': 'remada-australiana remada-corda remada-australiana-elevada remada-argola remada-australiana-archer remada-um-braco remada-maquina remada-baixa remada-serrote remada-curvada remada-cavalinho face-pull crucifixo-inverso band-pull-apart ytw front-lever-tuck fl-tuck-avancado fl-uma-perna fl-straddle front-lever fl-elevacoes-tuck fl-remada-tuck fl-negativa fl-elastico back-lever back-lever-tuck back-lever-tuck-avancado back-lever-straddle',
    'puxar-v': 'dead-hang escapula-barra barra-negativa barra-pronada chin-up isometria-topo barra-l barra-explosiva barra-cintura muscle-up-negativa muscle-up muscle-up-transicao muscle-up-argola barra-archer barra-larga barra-neutra barra-commando barra-typewriter barra-um-braco-assistida barra-um-braco barra-com-peso chin-up-negativa barra-elastico barra-assimetrica isometria-um-braco barra-um-braco-negativa puxada-alta pulldown puxada-triangulo pullover',
    agachar: 'agachamento wall-sit agachamento-salto passada cossack bulgaro pistol-assistido pistol-banco pistol pistol-negativa shrimp leg-press leg-press-horizontal goblet agachamento-barra afundo-halteres avanco hack smith agachamento-sumo agachamento-pausa step-up step-down afundo-reverso afundo-lateral passada-salto skater-squat sissy-squat agachamento-frontal bulgaro-halteres agachamento-split',
    quadril: 'ponte-gluteo-elastico ponte-unilateral hip-thrust stiff terra terra-sumo good-morning stiff-unilateral stiff-unilateral-livre hip-hinge-bastao kettlebell-swing meia-ponte superman',
    joelho: 'nordic nordic-assistido flexora ponte-pes-elevados ponte-caminhada flexao-joelho-toalha-excentrica flexao-joelho-toalha flexao-joelho-toalha-unilateral ponte-unilateral-elevada',
    estabilizar: 'prancha dead-bug prancha-lateral hollow-body elevacao-joelhos elevacao-pernas toes-to-bar dragon-flag dragon-flag-negativa lsit-apoio lsit-tuck-um-pe tuck-lsit lsit-uma-perna lsit vsit abdominal abdominal-polia abdominal-infra abdominal-obliquo abdominal-bicicleta russian-twist abdominal-maquina prancha-alta prancha-toque-ombro bird-dog hollow-rock v-up flutter-kicks pallof prancha-lateral-quadril copenhagen ab-wheel windshield-wiper elevacao-joelhos-paralelas turkish-getup crow elbow-lever bandeira bandeira-tuck equilibrio-um-pe',
    locomover: 'corda caminhada escada polichinelo joelho-alto mountain-climber burpee burpee-barra esteira bicicleta eliptico escada-maq remo-ergometro corrida sprint double-under bear-crawl skater-jump pedalar farmer-walk',
    isolado: 'elevacao-lateral elevacao-frontal triceps-polia triceps-frances triceps-testa triceps-corda triceps-inverso triceps-coice rosca-alternada rosca-martelo rosca-direta rosca-scott rosca-concentrada rosca-polia rosca-inversa encolhimento remada-alta extensora abdutora adutora gluteo-maquina gluteo-polia panturrilha panturrilha-unilateral panturrilha-maquina panturrilha-sentado',
  };
  const R = {
    quadril: 'meia-ponte lagarto pombo borboleta couch-stretch sapo circulos-quadril quadril-90-90 worlds-greatest monster-walk clamshell agachamento-profundo afundo-espacate espacate-frontal espacate-lateral pancake alongamento-quadriceps cars-quadril rotacao-interna-quadril adutor-balanco shin-box',
    posterior: 'pike-pe pike-ativo meio-espacate contrai-relaxa-pike alongamento-posterior-deitado',
    ombro: 'passagem-ombro rotacao-ombros rotacao-externa wall-slide alongamento-peitoral alongamento-triceps cachorro-baixo cars-ombro deslizamento-chao alongamento-dorsal-banco postura-filhote sleeper-stretch extensao-ombro',
    tornozelo: 'mobilidade-tornozelo alongamento-panturrilha tornozelo-circulos tibial-parede alongamento-soleo caminhada-ponta-calcanhar equilibrio-um-pe',
    coluna: 'gato-vaca cobra crianca torcao-coluna rotacao-toracica ponte jefferson-curl livro-aberto extensao-toracica passar-agulha inclinacao-lateral',
    punho: 'alongamento-punho punho-circulos elevacao-palmas punho-garrafa pronacao-supinacao abertura-dedos',
  };
  const UNI = 'flexao-archer flexao-um-braco-elevada flexao-um-braco flexao-um-braco-negativa flexao-assimetrica flexao-typewriter barra-archer barra-typewriter barra-um-braco-assistida barra-um-braco barra-assimetrica isometria-um-braco barra-um-braco-negativa barra-commando remada-um-braco remada-australiana-archer remada-serrote ' +
    'passada bulgaro bulgaro-halteres pistol-assistido pistol-banco pistol pistol-negativa shrimp cossack afundo-halteres avanco step-up step-down afundo-reverso afundo-lateral passada-salto skater-squat agachamento-split ponte-unilateral ponte-unilateral-elevada stiff-unilateral stiff-unilateral-livre flexao-joelho-toalha-unilateral panturrilha-unilateral ' +
    'prancha-lateral prancha-lateral-quadril copenhagen bird-dog turkish-getup equilibrio-um-pe bandeira bandeira-tuck';
  // Exigem professor ou spotter experiente e espaço adequado: ficam fora de qualquer sugestão automática.
  const SUP = 'mortal-tras mortal-frente butterfly-kick reversao-frente reversao-tras ponte-em-pe parada-ponte rodante';

  const pat = {}, reg = {};
  Object.entries(P).forEach(([k, ids]) => ids.split(' ').forEach(id => { pat[id] = k; }));
  Object.entries(R).forEach(([k, ids]) => ids.split(' ').forEach(id => { reg[id] = k; }));
  const uni = new Set(UNI.split(' ')), sup = new Set(SUP.split(' '));
  EXERCISES.forEach(x => {
    if (pat[x.id]) x.pat = pat[x.id];
    if (reg[x.id]) x.reg = reg[x.id];
    if (uni.has(x.id)) x.uni = true;
    if (sup.has(x.id)) x.sup = true;
  });

  // Buscas específicas para o tools/buscar-videos.js quando a busca padrão traz vídeo errado.
  window.VIDEO_QUERY = {
    abdominal: 'crunch abdominal no solo tutorial iniciante', sapo: 'frog stretch adductor hip mobility tutorial', cobra: 'cobra pose yoga tutorial iniciantes',
    'flexao-pausa': 'pause push up tutorial', 'estrela-uma-mao': 'one handed cartwheel tutorial', 'dead-hang': 'dead hang tutorial how to hang',
    'barra-cintura': 'chest to bar pull up tutorial', 'isometria-topo': 'flexed arm hang tutorial', 'hspu-parede': 'handstand push up wall tutorial beginner',
    'parada-mao-um-pe': 'wall handstand one leg off drill', ponte: 'bridge backbend tutorial beginner how to', cotovelada: 'muay thai horizontal elbow tutorial',
    'passar-agulha': 'thread the needle stretch thoracic mobility', 'punho-garrafa': 'wrist curl and reverse wrist curl tutorial', 'fl-negativa': 'front lever negatives tutorial calisthenics',
    'muscle-up-transicao': 'low bar muscle up transition drill', 'ponte-pes-elevados': 'elevated hamstring bridge tutorial', 'abertura-dedos': 'finger extension rubber band exercise',
    'defesa-chute': 'muay thai checking kicks tutorial defense', 'agachamento-pausa': 'pause squat bodyweight tutorial', 'prancha-lateral-quadril': 'side plank hip dips tutorial',
  };
})();
