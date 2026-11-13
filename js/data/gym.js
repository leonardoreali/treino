/* Exercícios de academia (com carga) e equipamentos de academia. Mesmo formato de exercises.js. */
(function () {
  const rows = [
    // empurrar
    ['supino-maquina', 'Supino na máquina', 'empurrar', 1, 'Costas apoiadas, escápulas juntas; empurre sem travar os cotovelos.', 'machine chest press form'],
    ['supino-halteres', 'Supino reto com halteres', 'empurrar', 2, 'Deitado no banco, halteres na linha do peito; desça controlado até os cotovelos a ~90°.', 'dumbbell bench press form'],
    ['supino-inclinado', 'Supino inclinado com halteres', 'empurrar', 2, 'Banco a 30–45°; halteres sobem e se aproximam no topo.', 'incline dumbbell press form'],
    ['supino-barra', 'Supino reto com barra', 'empurrar', 3, 'Pés firmes, escápulas juntas, barra desce até o peito. Use trava ou alguém por perto.', 'barbell bench press form'],
    ['crucifixo', 'Crucifixo com halteres', 'empurrar', 2, 'Cotovelos levemente dobrados; abra até alongar o peito e feche.', 'dumbbell fly form'],
    ['peck-deck', 'Voador (peck deck)', 'empurrar', 1, 'Costas apoiadas; feche os braços à frente contraindo o peito.', 'pec deck machine form'],
    ['desenvolvimento-maquina', 'Desenvolvimento na máquina', 'empurrar', 1, 'Empurre para cima sem arquear a lombar.', 'machine shoulder press form'],
    ['desenvolvimento-halteres', 'Desenvolvimento com halteres', 'empurrar', 2, 'Sentado, halteres na altura das orelhas; empurre acima da cabeça.', 'dumbbell shoulder press form'],
    ['elevacao-lateral', 'Elevação lateral', 'empurrar', 1, 'Halteres sobem pelos lados até a altura dos ombros, cotovelos levemente dobrados.', 'lateral raise form'],
    ['triceps-polia', 'Tríceps na polia', 'empurrar', 1, 'Cotovelos colados no corpo; estenda até o fim.', 'triceps pushdown form'],
    ['triceps-frances', 'Tríceps francês', 'empurrar', 2, 'Halter atrás da cabeça, cotovelos apontando para cima.', 'overhead dumbbell triceps extension form'],
    ['triceps-testa', 'Tríceps testa', 'empurrar', 2, 'Deitado, barra desce em direção à testa só dobrando os cotovelos.', 'skull crusher form'],
    // puxar
    ['puxada-alta', 'Puxada alta (pulldown)', 'puxar', 1, 'Puxe a barra até o alto do peito, cotovelos para baixo; não balance o tronco.', 'lat pulldown form'],
    ['remada-maquina', 'Remada na máquina', 'puxar', 1, 'Peito apoiado; puxe os cotovelos para trás juntando as escápulas.', 'seated machine row form'],
    ['remada-baixa', 'Remada baixa na polia', 'puxar', 1, 'Tronco firme, puxe o pegador até o abdômen.', 'seated cable row form'],
    ['remada-serrote', 'Remada unilateral com halter', 'puxar', 2, 'Mão e joelho no banco, costas retas; puxe o halter até a cintura.', 'single arm dumbbell row form'],
    ['remada-curvada', 'Remada curvada com barra', 'puxar', 3, 'Tronco inclinado, coluna neutra; barra até o umbigo.', 'barbell bent over row form'],
    ['face-pull', 'Face pull', 'puxar', 1, 'Corda na polia alta; puxe em direção ao rosto abrindo os cotovelos.', 'face pull form'],
    ['rosca-alternada', 'Rosca alternada com halteres', 'puxar', 1, 'Cotovelos parados ao lado do corpo; suba um de cada vez.', 'dumbbell bicep curl form'],
    ['rosca-martelo', 'Rosca martelo', 'puxar', 1, 'Pegada neutra (polegares para cima).', 'hammer curl form'],
    ['rosca-direta', 'Rosca direta com barra', 'puxar', 2, 'Sem balançar o tronco; desça controlado.', 'barbell curl form'],
    ['encolhimento', 'Encolhimento de ombros', 'puxar', 1, 'Halteres ao lado do corpo; suba os ombros em direção às orelhas.', 'dumbbell shrug form'],
    // pernas
    ['leg-press', 'Leg press', 'pernas', 1, 'Pés na largura dos ombros; desça até ~90° sem tirar o quadril do banco.', 'leg press form'],
    ['goblet', 'Agachamento goblet', 'pernas', 1, 'Halter junto ao peito; agache entre os joelhos com o tronco ereto.', 'goblet squat form'],
    ['agachamento-barra', 'Agachamento livre com barra', 'pernas', 3, 'Barra nos trapézios, coluna neutra, joelhos seguem os pés.', 'barbell back squat form'],
    ['extensora', 'Cadeira extensora', 'pernas', 1, 'Estenda os joelhos e desça devagar.', 'leg extension form'],
    ['flexora', 'Mesa/cadeira flexora', 'pernas', 1, 'Dobre os joelhos trazendo o rolo; volte devagar.', 'leg curl machine form'],
    ['stiff', 'Stiff (terra romeno)', 'pernas', 2, 'Joelhos pouco dobrados, quadril vai para trás, coluna reta; sinta o posterior.', 'romanian deadlift form'],
    ['terra', 'Levantamento terra', 'pernas', 3, 'Barra junto às canelas, coluna neutra; empurre o chão. Aprenda com carga leve.', 'deadlift form beginner'],
    ['afundo-halteres', 'Afundo com halteres', 'pernas', 2, 'Passo à frente, joelho de trás quase toca o chão.', 'dumbbell lunge form'],
    ['hip-thrust', 'Elevação de quadril (hip thrust)', 'pernas', 2, 'Costas no banco, barra no quadril; suba até alinhar tronco e coxas.', 'hip thrust form'],
    ['abdutora', 'Cadeira abdutora', 'pernas', 1, 'Abra as pernas contra a resistência; volte devagar.', 'hip abduction machine form'],
    ['adutora', 'Cadeira adutora', 'pernas', 1, 'Feche as pernas contra a resistência.', 'hip adduction machine form'],
    ['panturrilha-maquina', 'Panturrilha na máquina', 'pernas', 1, 'Amplitude completa, pausa no alto.', 'calf raise machine form'],
    // core
    ['abdominal', 'Abdominal (crunch)', 'core', 1, 'Lombar no chão; suba só os ombros, queixo longe do peito.', 'crunch form'],
    ['abdominal-polia', 'Abdominal na polia', 'core', 2, 'Ajoelhado, corda atrás da cabeça; enrole o tronco para baixo.', 'cable crunch form'],
    // cardio
    ['esteira', 'Esteira', 'cardio', 1, 'Caminhada inclinada ou trote em ritmo de conversa.', 'treadmill beginner workout'],
    ['bicicleta', 'Bicicleta ergométrica', 'cardio', 1, 'Banco na altura do quadril; ritmo constante.', 'stationary bike beginner form'],
    ['eliptico', 'Elíptico', 'cardio', 1, 'Tronco ereto, movimento contínuo.', 'elliptical machine how to use'],
    // mais exercícios comuns em fichas de academia
    ['leg-press-horizontal', 'Leg press horizontal (180°)', 'pernas', 1, 'Sentado, empurre a plataforma à frente sem travar os joelhos.', 'horizontal leg press form'],
    ['hack', 'Agachamento hack', 'pernas', 2, 'Costas no encosto da máquina; desça até ~90° e empurre.', 'hack squat machine form'],
    ['smith', 'Agachamento no smith (barra guiada)', 'pernas', 2, 'Pés um pouco à frente da barra; desça controlado.', 'smith machine squat form'],
    ['avanco', 'Avanço', 'pernas', 2, 'Passo à frente e volta; tronco ereto, joelho alinhado com o pé.', 'forward lunge form'],
    ['gluteo-maquina', 'Glúteo na máquina / coice', 'pernas', 1, 'Empurre para trás com o calcanhar, sem arquear a lombar.', 'glute kickback machine form'],
    ['gluteo-polia', 'Coice de glúteo na polia', 'pernas', 2, 'Caneleira na polia baixa; estenda a perna para trás.', 'cable glute kickback form'],
    ['panturrilha-sentado', 'Panturrilha sentado', 'pernas', 1, 'Joelhos a 90° sob o apoio; suba e desça com amplitude total.', 'seated calf raise form'],
    ['supino-declinado', 'Supino declinado', 'empurrar', 2, 'Banco declinado; barra desce até a parte baixa do peito.', 'decline bench press form'],
    ['supino-inclinado-barra', 'Supino inclinado com barra', 'empurrar', 3, 'Banco a 30–45°; barra desce até o alto do peito.', 'incline barbell bench press form'],
    ['crossover', 'Crossover na polia', 'empurrar', 2, 'Um passo à frente; feche os braços em arco à frente do peito.', 'cable crossover form'],
    ['pullover', 'Pullover', 'puxar', 2, 'Deitado, halter desce atrás da cabeça com os cotovelos quase retos.', 'dumbbell pullover form'],
    ['elevacao-frontal', 'Elevação frontal', 'empurrar', 1, 'Halteres sobem à frente até a altura dos ombros.', 'front raise form'],
    ['crucifixo-inverso', 'Crucifixo inverso', 'puxar', 1, 'Tronco inclinado; abra os braços para trás, apertando as escápulas.', 'reverse fly form'],
    ['arnold', 'Desenvolvimento Arnold', 'empurrar', 3, 'Começa com as palmas para você e gira enquanto empurra.', 'arnold press form'],
    ['remada-alta', 'Remada alta', 'puxar', 2, 'Barra sobe junto ao corpo até o peito, cotovelos acima das mãos.', 'upright row form'],
    ['pulldown', 'Pulldown com braços estendidos', 'puxar', 2, 'Polia alta; desça a barra até as coxas com os braços quase retos.', 'straight arm pulldown form'],
    ['remada-cavalinho', 'Remada cavalinho', 'puxar', 2, 'Tronco inclinado sobre a barra em T; puxe até o peito.', 't bar row form'],
    ['puxada-triangulo', 'Puxada com triângulo', 'puxar', 1, 'Pegada neutra fechada; puxe até o peito.', 'close grip lat pulldown form'],
    ['rosca-scott', 'Rosca Scott', 'puxar', 2, 'Braços apoiados no banco Scott; desça até quase estender.', 'preacher curl form'],
    ['rosca-concentrada', 'Rosca concentrada', 'puxar', 1, 'Sentado, cotovelo apoiado na coxa.', 'concentration curl form'],
    ['rosca-polia', 'Rosca na polia', 'puxar', 1, 'Polia baixa; cotovelos parados ao lado do corpo.', 'cable bicep curl form'],
    ['triceps-corda', 'Tríceps na corda', 'empurrar', 1, 'Polia alta com corda; abra as mãos no fim do movimento.', 'triceps rope pushdown form'],
    ['triceps-inverso', 'Tríceps com pegada inversa', 'empurrar', 2, 'Polia alta, palmas para cima; estenda os cotovelos.', 'reverse grip triceps pushdown form'],
    ['triceps-coice', 'Tríceps coice', 'empurrar', 1, 'Tronco inclinado, cotovelo alto; estenda o braço para trás.', 'triceps kickback form'],
    ['abdominal-infra', 'Abdominal infra (elevação de pernas deitado)', 'core', 2, 'Deitado, suba as pernas estendidas sem tirar a lombar do chão.', 'lying leg raise form'],
    ['abdominal-obliquo', 'Abdominal oblíquo', 'core', 1, 'Suba girando o tronco, cotovelo em direção ao joelho oposto.', 'oblique crunch form'],
    ['abdominal-bicicleta', 'Abdominal bicicleta', 'core', 2, 'Pedale no ar alternando cotovelo e joelho opostos.', 'bicycle crunch form'],
    ['russian-twist', 'Giro russo', 'core', 2, 'Sentado, tronco inclinado; gire de um lado para o outro.', 'russian twist form'],
    ['abdominal-maquina', 'Abdominal na máquina', 'core', 1, 'Enrole o tronco contra a resistência, sem puxar com os braços.', 'ab crunch machine form'],
    ['escada-maq', 'Escada (simulador)', 'cardio', 2, 'Passos completos, sem apoiar o peso nos braços.', 'stair climber machine workout'],
    ['remo-ergometro', 'Remo ergômetro', 'cardio', 2, 'Empurre com as pernas, depois puxe com os braços; volte na ordem inversa.', 'rowing machine technique'],
  ];
  const noLoad = new Set(['abdominal', 'esteira', 'bicicleta', 'eliptico', 'avanco', 'abdominal-infra', 'abdominal-obliquo', 'abdominal-bicicleta', 'russian-twist', 'escada-maq', 'remo-ergometro']);
  // Grupos como nos cartões de academia: usados no modo "marcar na lista".
  window.SHEET = [
    ['Membros inferiores', 'extensora leg-press leg-press-horizontal agachamento-barra hack smith avanco afundo-halteres flexora gluteo-maquina gluteo-polia hip-thrust stiff terra abdutora adutora panturrilha-maquina panturrilha-sentado goblet bulgaro agachamento'],
    ['Peito', 'supino-barra supino-halteres supino-inclinado supino-inclinado-barra supino-declinado supino-maquina peck-deck crucifixo crossover flexao'],
    ['Costas', 'puxada-alta puxada-triangulo remada-baixa remada-serrote remada-alta remada-curvada remada-cavalinho remada-maquina pulldown pullover barra-pronada'],
    ['Ombro', 'elevacao-lateral elevacao-frontal crucifixo-inverso encolhimento desenvolvimento-halteres desenvolvimento-maquina arnold face-pull'],
    ['Bíceps', 'rosca-direta rosca-alternada rosca-scott rosca-concentrada rosca-martelo rosca-polia'],
    ['Tríceps', 'triceps-polia triceps-corda triceps-testa triceps-frances triceps-inverso triceps-coice mergulho-banco'],
    ['Abdômen', 'abdominal abdominal-infra abdominal-obliquo abdominal-bicicleta abdominal-maquina abdominal-polia prancha prancha-lateral russian-twist'],
    ['Cardio', 'esteira bicicleta eliptico escada-maq remo-ergometro corda'],
  ].map(r => ({ name: r[0], ids: r[1].split(' ') }));
  rows.forEach(r => EXERCISES.push({ id: r[0], name: r[1], cat: r[2], level: r[3], how: r[4], q: r[5], w: !noLoad.has(r[0]), gym: true }));

  [['halteres', 'Halteres'], ['barra-livre', 'Barra e anilhas'], ['banco-supino', 'Banco de supino / regulável'], ['polia', 'Polia / cabos'],
    ['maquinas', 'Máquinas de musculação'], ['cardio-maq', 'Esteira, bicicleta ou elíptico']].forEach(r => EQUIP.push({ id: r[0], name: r[1], gym: true }));
  const add = (eq, ids) => ids.split(' ').forEach(id => { (EQUIP_NEEDS[id] = EQUIP_NEEDS[id] || []).push(eq); });
  add('halteres', 'supino-halteres supino-inclinado crucifixo desenvolvimento-halteres elevacao-lateral triceps-frances remada-serrote rosca-alternada rosca-martelo encolhimento goblet afundo-halteres');
  add('banco-supino', 'supino-halteres supino-inclinado crucifixo supino-barra triceps-testa');
  add('banco', 'remada-serrote hip-thrust');
  add('barra-livre', 'supino-barra triceps-testa remada-curvada rosca-direta agachamento-barra stiff terra hip-thrust');
  add('polia', 'triceps-polia puxada-alta remada-baixa face-pull abdominal-polia');
  add('maquinas', 'supino-maquina peck-deck desenvolvimento-maquina remada-maquina leg-press extensora flexora abdutora adutora panturrilha-maquina');
  add('cardio-maq', 'esteira bicicleta eliptico');
  add('maquinas', 'leg-press-horizontal hack smith gluteo-maquina panturrilha-sentado abdominal-maquina rosca-scott');
  add('polia', 'gluteo-polia crossover pulldown puxada-triangulo rosca-polia triceps-corda triceps-inverso');
  add('barra-livre', 'supino-declinado supino-inclinado-barra remada-alta remada-cavalinho');
  add('banco-supino', 'supino-declinado supino-inclinado-barra pullover');
  add('halteres', 'pullover elevacao-frontal crucifixo-inverso arnold rosca-concentrada triceps-coice');
  add('cardio-maq', 'escada-maq remo-ergometro');
  window.EQUIP_GYM = ['halteres', 'barra-livre', 'banco-supino', 'polia', 'maquinas', 'cardio-maq', 'banco', 'barra', 'paralelas', 'colchonete', 'parede', 'degrau'];
})();
