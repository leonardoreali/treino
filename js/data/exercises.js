/* Biblioteca de exercícios.
   Cada linha: [id, nome, categoria, nível 1-5, como fazer, busca no YouTube]
   Para adicionar um exercício, copie uma linha e mude os valores. */
(function () {
  const rows = [
    // ---------- EMPURRAR ----------
    ['flexao-inclinada', 'Flexão inclinada', 'empurrar', 1, 'Mãos num banco ou mesa, corpo reto. Versão mais fácil da flexão.', 'incline push up form'],
    ['flexao-joelhos', 'Flexão de joelhos', 'empurrar', 1, 'Joelhos no chão, quadril alinhado com ombros.', 'knee push up form'],
    ['flexao', 'Flexão', 'empurrar', 2, 'Corpo reto, cotovelos a ~45°, peito quase toca o chão.', 'perfect push up form'],
    ['flexao-aberta', 'Flexão aberta', 'empurrar', 2, 'Mãos mais largas que os ombros; mais peito.', 'wide push up form'],
    ['flexao-diamante', 'Flexão diamante', 'empurrar', 3, 'Mãos juntas formando um losango sob o peito; cotovelos colados.', 'diamond push up form'],
    ['flexao-declinada', 'Flexão declinada', 'empurrar', 3, 'Pés no banco; mais carga nos ombros.', 'decline push up form'],
    ['flexao-archer', 'Flexão archer', 'empurrar', 4, 'Mãos bem abertas; desça para um lado enquanto o outro braço fica estendido.', 'archer push up tutorial'],
    ['flexao-pseudo-planche', 'Flexão pseudo planche', 'empurrar', 4, 'Mãos na linha da cintura, dedos para fora, ombros à frente das mãos.', 'pseudo planche push up tutorial'],
    ['flexao-explosiva', 'Flexão explosiva', 'empurrar', 3, 'Empurre forte até as mãos saírem do chão; aterrisse macio.', 'explosive push up tutorial'],
    ['flexao-palma', 'Flexão com palma', 'empurrar', 4, 'Flexão explosiva batendo palma no ar.', 'clap push up tutorial'],
    ['flexao-um-braco-elevada', 'Flexão de um braço (mão elevada)', 'empurrar', 4, 'Uma mão no banco, pés afastados, corpo sem girar.', 'incline one arm push up progression'],
    ['flexao-um-braco', 'Flexão de um braço', 'empurrar', 5, 'Pés afastados, mão sob o ombro, quadril reto.', 'one arm push up tutorial'],
    ['pike-pushup', 'Pike push-up', 'empurrar', 2, 'Quadril alto, cabeça desce à frente das mãos. Ficou fácil: pés no banco.', 'pike push up form'],
    ['pike-pushup-elevado', 'Pike push-up elevado', 'empurrar', 3, 'Pés no banco, quadril acima dos ombros.', 'elevated pike push up tutorial'],
    ['hspu-parede', 'Flexão em parada de mão (parede)', 'empurrar', 5, 'Parada de mão na parede; desça a cabeça até o chão e empurre.', 'wall handstand push up tutorial'],
    ['mergulho-banco', 'Mergulho no banco', 'empurrar', 1, 'Ombros longe das orelhas, cotovelos para trás.', 'bench dips form'],
    ['dips', 'Mergulho nas paralelas', 'empurrar', 3, 'Entre duas cadeiras firmes ou paralelas; desça até 90° no cotovelo.', 'parallel bar dips form'],

    // ---------- PUXAR ----------
    ['dead-hang', 'Pendurado na barra', 'puxar', 1, 'Pendure relaxado, braços estendidos. Alonga ombros e fortalece a pegada.', 'dead hang benefits form'],
    ['escapula-barra', 'Escápula na barra', 'puxar', 1, 'Braços retos; só os ombros sobem e descem.', 'scapular pull up form'],
    ['remada-australiana', 'Remada australiana', 'puxar', 2, 'Sob uma barra baixa ou mesa, corpo reto; puxe o peito até a barra.', 'australian pull up form'],
    ['remada-corda', 'Remada com corda na barra', 'puxar', 2, 'Corda amarrada na barra com nó firme; incline para trás e puxe o peito até as mãos. Mais deitado = mais difícil.', 'inverted row rope towel row'],
    ['ytw', 'Y-T-W deitado', 'puxar', 1, 'De bruços no banco; braços formam as letras Y, T e W. 8 de cada.', 'prone YTW exercise'],
    ['barra-negativa', 'Barra negativa', 'puxar', 2, 'Suba com um salto e desça em 3–5 s.', 'negative pull up tutorial'],
    ['barra-pronada', 'Barra pronada', 'puxar', 3, 'Palmas para a frente; pare 1–2 reps antes da falha.', 'perfect pull up form'],
    ['chin-up', 'Barra supinada (chin-up)', 'puxar', 3, 'Palmas para você; queixo acima da barra, descida em 2 s.', 'chin up form'],
    ['isometria-topo', 'Isometria no topo da barra', 'puxar', 3, 'Segure com o queixo acima da barra.', 'pull up top hold isometric'],
    ['barra-l', 'Barra em L', 'puxar', 4, 'Barra com as pernas estendidas à frente.', 'L sit pull up tutorial'],
    ['barra-explosiva', 'Barra explosiva (até o peito)', 'puxar', 4, 'Base do muscle-up; poucas reps e rápidas, barra no peito.', 'explosive pull up chest to bar muscle up'],
    ['barra-cintura', 'Barra até a cintura', 'puxar', 4, 'Puxe o mais alto possível, barra na linha do umbigo.', 'high pull up to waist muscle up progression'],
    ['muscle-up-negativa', 'Negativa de muscle-up', 'puxar', 4, 'Comece em cima da barra e desça devagar passando pela transição.', 'negative muscle up tutorial'],
    ['muscle-up', 'Muscle-up', 'puxar', 5, 'Puxada explosiva + transição + mergulho. Confira o espaço até o teto.', 'muscle up tutorial beginner'],
    ['barra-archer', 'Barra archer', 'puxar', 5, 'Pegada larga; suba para um lado com o outro braço estendido.', 'archer pull up tutorial'],

    // ---------- PERNAS ----------
    ['agachamento', 'Agachamento', 'pernas', 1, 'Pés na largura dos ombros, joelhos seguem os pés, coluna neutra.', 'bodyweight squat form'],
    ['wall-sit', 'Cadeirinha na parede', 'pernas', 1, 'Costas na parede, joelhos a 90°.', 'wall sit form'],
    ['agachamento-salto', 'Agachamento com salto', 'pernas', 2, 'Agache e salte; aterrissagem macia.', 'jump squat form'],
    ['passada', 'Passada caminhando', 'pernas', 2, 'Passos longos, joelho de trás quase toca o chão, tronco ereto.', 'walking lunge form'],
    ['cossack', 'Agachamento cossaco', 'pernas', 3, 'Pernas bem abertas; agache para um lado com a outra perna estendida.', 'cossack squat tutorial'],
    ['bulgaro', 'Agachamento búlgaro', 'pernas', 3, 'Pé de trás no banco; desça reto.', 'bulgarian split squat form'],
    ['pistol-assistido', 'Pistol squat assistido', 'pernas', 3, 'Segurando no batente da porta; use as mãos o mínimo possível.', 'assisted pistol squat tutorial'],
    ['pistol-banco', 'Pistol squat sentando no banco', 'pernas', 3, 'Desça com uma perna até sentar no banco e levante sem impulso.', 'box pistol squat progression'],
    ['pistol', 'Pistol squat', 'pernas', 5, 'Agachamento completo em uma perna, a outra estendida à frente.', 'pistol squat tutorial'],
    ['shrimp', 'Shrimp squat', 'pernas', 4, 'Segure o pé de trás; joelho de trás toca o chão.', 'shrimp squat tutorial'],
    ['nordic', 'Nordic curl', 'pernas', 4, 'Pés presos; desça o tronco devagar usando o posterior da coxa.', 'nordic curl at home tutorial'],
    ['panturrilha', 'Panturrilha na escada', 'pernas', 1, 'Duas pernas no degrau; amplitude completa.', 'calf raise on step form'],
    ['panturrilha-unilateral', 'Panturrilha unilateral na escada', 'pernas', 2, 'Uma perna; descida lenta, 2 s.', 'single leg calf raise form'],
    ['ponte-gluteo-elastico', 'Ponte de glúteo com elástico', 'pernas', 1, 'Elástico acima dos joelhos; ao subir, empurre os joelhos para fora e segure 2 s.', 'banded glute bridge form'],

    // ---------- CORE ----------
    ['prancha', 'Prancha', 'core', 1, 'Cotovelos sob os ombros, glúteo contraído, quadril reto.', 'plank form'],
    ['dead-bug', 'Dead bug', 'core', 1, 'Lombar no chão; estenda braço e perna opostos.', 'dead bug exercise form'],
    ['superman', 'Superman (arch hold)', 'core', 1, 'De bruços; levante peito e pernas e segure. Equilibra o core para costas e lombar.', 'superman hold arch hold form'],
    ['prancha-lateral', 'Prancha lateral', 'core', 2, 'Cotovelo sob o ombro, quadril alto.', 'side plank form'],
    ['hollow-body', 'Hollow body', 'core', 2, 'Lombar colada no chão, ombros e pernas fora do chão.', 'hollow body hold tutorial'],
    ['elevacao-joelhos', 'Elevação de joelhos pendurado', 'core', 2, 'Sem balanço; ficou fácil, pernas estendidas.', 'hanging knee raise form'],
    ['elevacao-pernas', 'Elevação de pernas pendurado', 'core', 3, 'Pernas estendidas até a horizontal, sem balanço.', 'hanging leg raise form'],
    ['toes-to-bar', 'Pés na barra (toes to bar)', 'core', 4, 'Pernas estendidas até tocar a barra.', 'strict toes to bar tutorial'],
    ['dragon-flag', 'Dragon flag', 'core', 5, 'Segure atrás da cabeça; corpo reto descendo devagar.', 'dragon flag tutorial progression'],
    ['lsit-apoio', 'L-sit com pés no chão', 'core', 1, 'Mãos ao lado do quadril, empurre o chão e tire o quadril; pés apoiados.', 'L sit progression foot supported beginner'],
    ['lsit-tuck-um-pe', 'Tuck L-sit com um pé apoiado', 'core', 2, 'Joelhos dobrados, um pé sai do chão.', 'L sit progression one foot tuck'],
    ['tuck-lsit', 'Tuck L-sit', 'core', 2, 'Joelhos no peito, os dois pés fora do chão. Cadeiras ou banco dão mais altura.', 'tuck L sit tutorial'],
    ['lsit-uma-perna', 'L-sit com uma perna estendida', 'core', 3, 'Uma perna estendida, a outra dobrada; alterne.', 'one leg L sit progression'],
    ['lsit', 'L-sit', 'core', 4, 'Pernas estendidas e juntas, paralelas ao chão.', 'L sit tutorial'],
    ['vsit', 'V-sit', 'core', 5, 'Pernas sobem além da horizontal, formando um V.', 'V sit tutorial calisthenics'],

    // ---------- HABILIDADES ----------
    ['crow', 'Pose do corvo', 'habilidade', 2, 'Joelhos apoiados nos braços; equilíbrio nas mãos.', 'crow pose tutorial beginner'],
    ['parada-mao-parede', 'Parada de mão na parede (peito na parede)', 'habilidade', 2, 'Peito voltado para a parede; corpo reto, empurre o chão.', 'chest to wall handstand tutorial'],
    ['parada-mao-um-pe', 'Parada de mão tirando um pé da parede', 'habilidade', 3, 'Na parede, afaste um pé e busque o equilíbrio.', 'handstand wall drill one leg off wall balance'],
    ['parada-mao-toques', 'Parada de mão com toques curtos', 'habilidade', 4, 'Tire os dois pés da parede por instantes; volte tocando de leve.', 'handstand heel pulls toe pulls drill'],
    ['parada-mao-livre', 'Parada de mão livre', 'habilidade', 5, 'Sem parede; equilibre com os dedos.', 'freestanding handstand tutorial'],
    ['front-lever-tuck', 'Front lever tuck', 'habilidade', 3, 'Joelhos no peito, costas paralelas ao chão.', 'tuck front lever tutorial'],
    ['fl-tuck-avancado', 'Front lever tuck avançado', 'habilidade', 4, 'Costas retas, quadril na altura dos ombros, joelhos a 90°.', 'advanced tuck front lever tutorial'],
    ['fl-uma-perna', 'Front lever com uma perna', 'habilidade', 4, 'Uma perna estendida, a outra dobrada.', 'one leg front lever progression'],
    ['fl-straddle', 'Front lever pernas abertas', 'habilidade', 5, 'Pernas estendidas e abertas.', 'straddle front lever tutorial'],
    ['front-lever', 'Front lever', 'habilidade', 5, 'Corpo reto e paralelo ao chão, braços estendidos.', 'front lever tutorial'],
    ['back-lever', 'Back lever', 'habilidade', 4, 'Corpo reto de barriga para baixo, braços atrás.', 'back lever tutorial progression'],
    ['planche-lean', 'Planche lean', 'habilidade', 3, 'Posição de flexão; leve os ombros à frente das mãos, braços retos.', 'planche lean tutorial'],
    ['tuck-planche', 'Tuck planche', 'habilidade', 4, 'Joelhos no peito, pés fora do chão, braços retos.', 'tuck planche tutorial'],
    ['tuck-planche-avancado', 'Tuck planche avançado', 'habilidade', 5, 'Costas retas, quadril na altura dos ombros.', 'advanced tuck planche tutorial'],
    ['bandeira', 'Bandeira humana', 'habilidade', 5, 'Corpo horizontal de lado num poste vertical.', 'human flag tutorial progression'],

    // ---------- CARDIO ----------
    ['corda', 'Pular corda', 'cardio', 1, 'Saltos baixos, punhos giram a corda, cotovelos perto do corpo.', 'jump rope beginner tutorial'],
    ['caminhada', 'Caminhada rápida / trote', 'cardio', 1, 'Ritmo em que dá para falar frases curtas.', 'zone 2 running how to'],
    ['escada', 'Subida de escada', 'cardio', 1, 'Suba em ritmo constante; desça andando.', 'stair climbing workout'],
    ['polichinelo', 'Polichinelo', 'cardio', 1, 'Braços e pernas abrem e fecham juntos.', 'jumping jacks form'],
    ['joelho-alto', 'Corrida com joelho alto', 'cardio', 1, 'Corrida parada, joelhos na altura do quadril.', 'high knees exercise form'],
    ['mountain-climber', 'Mountain climber', 'cardio', 2, 'Posição de flexão; joelhos alternam rápido em direção ao peito.', 'mountain climbers form'],
    ['burpee', 'Burpee', 'cardio', 2, 'Agacha, prancha, flexão, volta e salta.', 'burpee form'],

    // ---------- FLEXIBILIDADE ----------
    ['pike-pe', 'Pike em pé', 'flexibilidade', 1, 'Pernas estendidas, desça devagar até os dedos; depois tornozelos, depois palmas no chão.', 'standing forward fold hamstring stretch'],
    ['pike-ativo', 'Pike ativo sentado', 'flexibilidade', 2, 'Pernas estendidas e juntas, mãos ao lado dos joelhos; levante os calcanhares por 2 s.', 'seated pike leg lifts compression'],
    ['meio-espacate', 'Meio espacate', 'flexibilidade', 1, 'Joelho de trás no chão, perna da frente estendida, tronco à frente.', 'half split stretch'],
    ['lagarto', 'Afundo baixo (lagarto)', 'flexibilidade', 1, 'Afundo profundo com as duas mãos por dentro do pé da frente.', 'lizard pose stretch'],
    ['pombo', 'Pombo', 'flexibilidade', 1, 'Perna da frente dobrada no chão, perna de trás estendida.', 'pigeon pose stretch'],
    ['meia-ponte', 'Meia ponte (quadril)', 'flexibilidade', 1, 'Deitado, pés no chão; suba só o quadril.', 'glute bridge form'],
    ['ponte', 'Ponte', 'flexibilidade', 3, 'Mãos ao lado da cabeça; empurre até estender os braços.', 'bridge backbend tutorial beginner'],
    ['contrai-relaxa-pike', 'Contrai-relaxa no posterior (pike sentado)', 'flexibilidade', 2, 'Empurre os calcanhares contra o chão por 5 s, solte e desça um pouco mais.', 'PNF hamstring stretch seated'],
    ['pancake', 'Pancake', 'flexibilidade', 3, 'Sentado de pernas abertas, tronco à frente com a coluna longa.', 'pancake stretch tutorial'],
    ['afundo-espacate', 'Afundo para espacate frontal', 'flexibilidade', 2, 'Com apoio das mãos, deslize em direção ao espacate.', 'front split stretch beginner'],
    ['couch-stretch', 'Couch stretch', 'flexibilidade', 2, 'Joelho de trás no chão junto à parede, pé subindo pela parede, tronco ereto.', 'couch stretch form'],
    ['passagem-ombro', 'Passagem de ombro com corda/toalha', 'flexibilidade', 1, 'Braços estendidos, leve a corda da frente para trás.', 'shoulder dislocates stretch'],
    ['borboleta', 'Borboleta', 'flexibilidade', 1, 'Sentado, solas dos pés juntas, joelhos para baixo.', 'butterfly stretch form'],
    ['espacate-frontal', 'Espacate frontal', 'flexibilidade', 5, 'Uma perna à frente e outra atrás, quadril quadrado.', 'front splits tutorial'],
    ['espacate-lateral', 'Espacate lateral', 'flexibilidade', 5, 'Pernas abertas para os lados.', 'middle splits tutorial'],

    // ---------- MOBILIDADE / AQUECIMENTO ----------
    ['rotacao-ombros', 'Rotação de ombros e braços', 'mobilidade', 1, 'Círculos amplos para frente e para trás.', 'arm circles shoulder warm up'],
    ['gato-vaca', 'Gato-vaca', 'mobilidade', 1, 'De quatro apoios; arredonde e arqueie a coluna.', 'cat cow stretch'],
    ['monster-walk', 'Monster walk', 'mobilidade', 1, 'Elástico acima dos joelhos, joelhos semidobrados, passos para o lado sem deixar os joelhos entrarem.', 'banded monster walk lateral'],
    ['clamshell', 'Concha (clamshell)', 'mobilidade', 1, 'Deitado de lado, elástico acima dos joelhos; abra o joelho de cima sem girar o quadril.', 'banded clamshell exercise'],
    ['rotacao-externa', 'Rotação externa de ombro', 'mobilidade', 1, 'Elástico nos punhos, cotovelos colados a 90°; gire as mãos para fora.', 'band external rotation shoulder'],
    ['wall-slide', 'Wall slide com elástico', 'mobilidade', 1, 'Elástico nos punhos, antebraços na parede; deslize para cima mantendo o elástico esticado.', 'banded wall slides shoulder'],

    // ---------- ACROBACIA ----------
    ['rolamento-frente', 'Rolamento para frente', 'acrobacia', 1, 'Queixo no peito, role sobre as costas, nunca sobre a cabeça. No colchonete.', 'forward roll tutorial beginner'],
    ['rolamento-tras', 'Rolamento para trás', 'acrobacia', 2, 'Mãos ao lado das orelhas, empurre o chão ao passar.', 'backward roll tutorial beginner'],
    ['estrela', 'Estrela', 'acrobacia', 2, 'Mão, mão, pé, pé em linha reta. Treine os dois lados.', 'cartwheel tutorial beginner'],
    ['salto-grupado', 'Salto grupado', 'acrobacia', 2, 'Salte alto e traga os joelhos ao peito; aterrissagem macia.', 'tuck jump form'],
    ['rodante', 'Rodante', 'acrobacia', 3, 'Estrela com meia volta, juntando os pés no ar.', 'round off tutorial'],
    ['parada-ponte', 'Parada de mão caindo para ponte', 'acrobacia', 4, 'Contra a parede no início; desça controlado até a ponte.', 'handstand to bridge tutorial'],
    ['kip-up', 'Kip-up', 'acrobacia', 4, 'Do chão, lance as pernas e empurre com as mãos para ficar de pé.', 'kip up tutorial'],
    ['macaco', 'Macaco', 'acrobacia', 3, 'Movimento de capoeira/parkour: mão atrás e passa por cima.', 'macaco tutorial beginner'],
    ['mortal-tras', 'Mortal para trás', 'acrobacia', 5, 'SÓ com spotter experiente ou estrutura de ginástica. Nunca sozinho no colchonete.', 'backflip progression safe spotter'],
    ['mortal-frente', 'Mortal para frente', 'acrobacia', 5, 'SÓ com spotter experiente ou estrutura de ginástica.', 'front flip progression safe'],

    // ---------- LUTA (muay thai) ----------
    ['guarda', 'Base e guarda', 'luta', 1, 'Pés na largura dos ombros, mãos altas, queixo baixo.', 'muay thai stance guard basics'],
    ['jab', 'Jab', 'luta', 1, 'Mão da frente, reta e rápida; volta para a guarda.', 'how to jab muay thai'],
    ['direto', 'Direto', 'luta', 1, 'Mão de trás; gire quadril e pé de trás.', 'how to throw a cross punch'],
    ['cruzado', 'Cruzado (gancho)', 'luta', 2, 'Cotovelo a 90°, gire o quadril.', 'how to throw a hook punch'],
    ['uppercut', 'Uppercut', 'luta', 2, 'De baixo para cima, força vinda das pernas.', 'how to throw an uppercut'],
    ['teep', 'Teep (chute frontal)', 'luta', 2, 'Joelho sobe e o quadril empurra para a frente.', 'muay thai teep tutorial'],
    ['chute-baixo', 'Chute baixo (low kick)', 'luta', 2, 'Gire o quadril, canela na coxa do oponente.', 'muay thai low kick tutorial'],
    ['chute-medio', 'Chute circular médio', 'luta', 3, 'Pé de apoio gira, quadril vira, braço do lado do chute desce.', 'muay thai roundhouse kick tutorial'],
    ['joelhada', 'Joelhada', 'luta', 2, 'Quadril para a frente, ponta do pé para baixo.', 'muay thai knee strike tutorial'],
    ['cotovelada', 'Cotovelada', 'luta', 3, 'Curta e na horizontal; gire o tronco.', 'muay thai elbow strike tutorial'],
    ['defesa-chute', 'Defesa de chute (check)', 'luta', 2, 'Levante a canela para fora para bloquear.', 'muay thai how to check a kick'],
    ['clinch', 'Clinch', 'luta', 3, 'Controle a nuca e os braços do oponente.', 'muay thai clinch basics'],
    ['sombra', 'Sombra (shadow boxing)', 'luta', 1, 'Rounds de 3 min combinando golpes e movimentação.', 'muay thai shadow boxing beginner'],
  ];

  window.CATEGORIES = {
    empurrar: 'Empurrar', puxar: 'Puxar', pernas: 'Pernas', core: 'Core',
    habilidade: 'Habilidades', cardio: 'Cardio', flexibilidade: 'Flexibilidade',
    mobilidade: 'Mobilidade', acrobacia: 'Acrobacia', luta: 'Luta',
  };
  window.LEVELS = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Elite'];
  window.EXERCISES = rows.map(r => ({ id: r[0], name: r[1], cat: r[2], level: r[3], how: r[4], q: r[5] }));

  // Próxima variação quando o exercício fica fácil (dupla progressão).
  window.NEXT_VARIATION = {
    'flexao-inclinada': 'flexao', 'flexao-joelhos': 'flexao', 'flexao': 'flexao-diamante',
    'flexao-diamante': 'flexao-archer', 'flexao-archer': 'flexao-um-braco-elevada',
    'flexao-um-braco-elevada': 'flexao-um-braco', 'flexao-explosiva': 'flexao-palma',
    'pike-pushup': 'pike-pushup-elevado', 'pike-pushup-elevado': 'hspu-parede',
    'mergulho-banco': 'dips', 'barra-negativa': 'barra-pronada', 'remada-australiana': 'barra-pronada',
    'barra-pronada': 'barra-l', 'barra-explosiva': 'barra-cintura', 'barra-cintura': 'muscle-up-negativa',
    'muscle-up-negativa': 'muscle-up', 'agachamento': 'bulgaro', 'bulgaro': 'pistol-assistido',
    'pistol-assistido': 'pistol-banco', 'pistol-banco': 'pistol', 'panturrilha': 'panturrilha-unilateral',
    'prancha': 'hollow-body', 'elevacao-joelhos': 'elevacao-pernas', 'elevacao-pernas': 'toes-to-bar',
    'lsit-apoio': 'lsit-tuck-um-pe', 'lsit-tuck-um-pe': 'tuck-lsit', 'tuck-lsit': 'lsit-uma-perna',
    'lsit-uma-perna': 'lsit', 'lsit': 'vsit', 'front-lever-tuck': 'fl-tuck-avancado',
    'fl-tuck-avancado': 'fl-uma-perna', 'fl-uma-perna': 'fl-straddle', 'fl-straddle': 'front-lever',
    'planche-lean': 'tuck-planche', 'tuck-planche': 'tuck-planche-avancado', 'meia-ponte': 'ponte',
    'agachamento-salto': 'salto-grupado',
  };
})();
