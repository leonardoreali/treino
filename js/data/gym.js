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
  ];
  const noLoad = new Set(['abdominal', 'esteira', 'bicicleta', 'eliptico']);
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
  window.EQUIP_GYM = ['halteres', 'barra-livre', 'banco-supino', 'polia', 'maquinas', 'cardio-maq', 'banco', 'barra', 'paralelas', 'colchonete', 'parede', 'degrau'];
})();
