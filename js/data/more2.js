/* Exercícios da v17: posterior de coxa sem academia, etapas preparatórias das habilidades difíceis,
   mobilidade por região (quadril, ombros, tornozelos, coluna, punhos), descrições revisadas e correções.
   Mesmo formato de more.js: [id, nome, categoria, nível 1-5, como fazer, busca do vídeo, equipamentos, usa carga]. */
(function () {
  EQUIP.push({ id: 'superband', name: 'Elástico grande (super band)' });
  const rows = [
    // ---------- POSTERIOR DE COXA (flexionar o joelho / dobrar o quadril) ----------
    ['hip-hinge-bastao', 'Dobradiça de quadril com bastão', 'pernas', 1, 'Cabo de vassoura encostado na cabeça, no meio das costas e no cóccix. Joelhos levemente dobrados, leve o quadril para trás até sentir a parte de trás da coxa, sem perder nenhum dos três pontos de contato, e volte.', 'hip hinge dowel drill tutorial'],
    ['ponte-pes-elevados', 'Ponte com pés elevados', 'pernas', 1, 'Deitado, calcanhares num banco ou sofá e joelhos pouco dobrados. Suba o quadril empurrando com os calcanhares e segure 1 s em cima. Quanto mais esticadas as pernas, mais trabalha o posterior.', 'elevated glute bridge hamstring tutorial', ['banco']],
    ['ponte-caminhada', 'Ponte com caminhada dos calcanhares', 'pernas', 2, 'Suba na ponte e dê passinhos com os calcanhares para longe do corpo até as pernas quase esticarem; volte dando passinhos, sem deixar o quadril cair.', 'glute bridge walkout hamstring tutorial'],
    ['flexao-joelho-toalha-excentrica', 'Flexão de joelho com toalha (só a volta)', 'pernas', 2, 'Deitado, calcanhares sobre uma toalha em piso liso (ou sliders). Suba o quadril e deslize os pés para longe em 3–5 s, sem baixar o quadril. Para voltar, desça o quadril e puxe os pés.', 'eccentric sliding hamstring curl tutorial'],
    ['flexao-joelho-toalha', 'Flexão de joelho com toalha ou sliders', 'pernas', 2, 'Calcanhares sobre uma toalha em piso liso, quadril elevado. Puxe os calcanhares em direção ao glúteo e estenda de novo devagar, sempre com o quadril no alto.', 'sliding hamstring curl towel tutorial'],
    ['flexao-joelho-toalha-unilateral', 'Flexão de joelho com toalha em uma perna', 'pernas', 3, 'Como a flexão de joelho com toalha, mas com uma perna só; a outra fica no ar. Quadril alto e reto, sem girar.', 'single leg sliding hamstring curl tutorial'],
    ['ponte-unilateral-elevada', 'Ponte unilateral com pé elevado', 'pernas', 3, 'Um calcanhar no banco, a outra perna no ar. Suba o quadril empurrando o calcanhar e desça devagar sem encostar no chão.', 'single leg elevated hamstring bridge tutorial', ['banco']],
    ['stiff-unilateral-livre', 'Stiff unilateral sem peso', 'pernas', 2, 'Em uma perna, joelho levemente dobrado. Incline o tronco à frente levando a outra perna para trás até o corpo formar um T, coluna reta, e volte. Apoie a mão na parede se precisar.', 'single leg romanian deadlift bodyweight tutorial'],
    ['nordic-assistido', 'Nordic assistido', 'pernas', 3, 'Ajoelhado, pés presos sob um sofá ou seguros por alguém. Desça o tronco reto o mais devagar que conseguir, amorteça com as mãos no chão e empurre para voltar. Com elástico preso atrás fica mais fácil.', 'assisted nordic curl regression tutorial'],

    // ---------- EMPURRAR: etapas preparatórias ----------
    ['flexao-assimetrica', 'Flexão assimétrica', 'empurrar', 3, 'Uma mão no chão e a outra sobre um livro grosso ou degrau baixo. O braço de baixo faz mais força. Troque os lados. Prepara para a flexão archer e de um braço.', 'uneven push up tutorial'],
    ['flexao-um-braco-negativa', 'Flexão de um braço negativa', 'empurrar', 4, 'Pés bem afastados, uma mão sob o ombro. Desça em 3–5 s com um braço só, sem girar o quadril; apoie a outra mão e suba com as duas.', 'one arm push up negative tutorial'],
    ['hspu-negativa', 'Flexão em parada de mão negativa (parede)', 'empurrar', 4, 'Em parada de mão na parede, desça a cabeça até o chão em 3–5 s, cotovelos apontando para a frente. Desça da parede e suba de novo para a próxima.', 'negative wall handstand push up tutorial', ['parede']],
    ['parada-caixa', 'Parada pike com pés no banco', 'habilidade', 2, 'Mãos no chão, pés num banco, quadril bem alto sobre as mãos e braços estendidos junto às orelhas. Empurre o chão e segure. Primeiro passo para a parada de mão.', 'box pike handstand hold tutorial', ['banco']],
    ['caminhada-parede', 'Caminhada na parede (wall walk)', 'habilidade', 2, 'De prancha com os pés encostados na parede, suba caminhando com os pés e aproxime as mãos da parede até onde conseguir com o corpo firme; desça do mesmo jeito.', 'wall walk tutorial', ['parede']],
    ['saida-parada', 'Saída segura da parada de mão', 'habilidade', 2, 'Treine cair: da parada (ou meia parada) tire uma mão do chão e gire o corpo para cair de pé, como uma estrela. Aprenda isto antes de tentar a parada livre.', 'how to bail handstand safely cartwheel', ['colchonete']],
    ['parada-mao-chute', 'Chute para a parada de mão livre', 'habilidade', 4, 'Longe da parede, chute uma perna e depois a outra para a parada e tente parar em cima por 1–2 s. Passou do ponto? Saia girando como na estrela.', 'handstand kick up tutorial', ['colchonete']],
    ['tuck-planche-elevacoes', 'Elevações para tuck planche', 'habilidade', 4, 'Agachado, mãos no chão ao lado dos pés, dedos para fora. Incline os ombros à frente das mãos com os braços retos e tire os pés do chão por 1–2 s; volte e repita.', 'tuck planche progression beginner hops', []],
    ['planche-meia-straddle', 'Planche com uma perna estendida', 'habilidade', 5, 'Do tuck planche avançado, estenda uma perna para trás mantendo o quadril na altura dos ombros. Alterne as pernas.', 'half straddle planche progression'],
    ['straddle-planche-elastico', 'Planche aberta com elástico', 'habilidade', 5, 'Elástico grande preso na barra baixa ou paralela e passado pelo quadril. Faça a planche de pernas abertas com a ajuda do elástico; use elásticos mais finos aos poucos.', 'band assisted straddle planche tutorial', ['superband', 'paralelas']],

    // ---------- PUXAR: etapas preparatórias ----------
    ['barra-elastico', 'Barra com elástico', 'puxar', 2, 'Elástico grande preso na barra com o pé ou joelho apoiado nele. Faça a barra completa; troque por elásticos mais finos conforme ficar fácil.', 'band assisted pull up tutorial', ['barra', 'superband']],
    ['remada-australiana-archer', 'Remada australiana archer', 'puxar', 3, 'Mãos bem abertas na barra baixa; puxe o peito em direção a uma mão enquanto o outro braço fica estendido. Alterne os lados.', 'archer inverted row tutorial', ['barra-baixa']],
    ['remada-um-braco', 'Remada australiana com um braço', 'puxar', 4, 'Uma mão na barra baixa, corpo reto e pés afastados para não girar. Puxe o peito até a mão. Mais fácil: pés mais perto da barra.', 'one arm inverted row tutorial', ['barra-baixa']],
    ['barra-assimetrica', 'Barra assimétrica (com toalha)', 'puxar', 4, 'Uma mão na barra e a outra segurando uma toalha pendurada mais embaixo. O braço da barra faz a maior parte da força. Troque os lados.', 'towel assisted one arm pull up progression', ['barra', 'corda-remada']],
    ['isometria-um-braco', 'Isometria de um braço no topo da barra', 'puxar', 5, 'Suba com os dois braços, solte uma mão no topo e segure com o queixo acima da barra; depois desça o mais devagar possível.', 'one arm flexed hang pull up progression', ['barra']],
    ['barra-um-braco-negativa', 'Barra de um braço negativa', 'puxar', 5, 'Suba com os dois braços, solte uma mão e desça em 3–5 s com um braço só, sem girar o corpo.', 'one arm pull up negative tutorial', ['barra']],
    ['muscle-up-transicao', 'Transição do muscle-up na barra baixa', 'puxar', 4, 'Na barra na altura do peito, com os pés no chão ajudando, puxe e passe o peito por cima da barra virando os punhos, até ficar apoiado em cima. Ensina a parte mais difícil do muscle-up.', 'low bar muscle up transition drill', ['barra-baixa']],
    ['fl-elevacoes-tuck', 'Elevações para tuck front lever', 'habilidade', 3, 'Pendurado com braços retos, leve os joelhos ao peito e gire o corpo para trás até as costas ficarem paralelas ao chão; desça devagar.', 'tuck front lever raises tutorial', ['barra']],
    ['fl-remada-tuck', 'Remada em tuck front lever', 'habilidade', 4, 'Na posição de tuck front lever, puxe a barra em direção ao quadril e volte com os braços retos, sem perder a posição.', 'tuck front lever rows tutorial', ['barra']],
    ['fl-negativa', 'Front lever negativo', 'habilidade', 4, 'Pendurado de cabeça para baixo com o corpo reto, desça devagar até a horizontal mantendo os braços retos. Encolha as pernas se perder a posição.', 'front lever negatives tutorial', ['barra']],
    ['fl-elastico', 'Front lever com elástico', 'habilidade', 4, 'Elástico grande preso na barra e passado pelo quadril ou pelos pés; segure o front lever com o corpo reto. Use elásticos mais finos aos poucos.', 'band assisted front lever tutorial', ['barra', 'superband']],
    ['back-lever-tuck-avancado', 'Back lever tuck avançado', 'habilidade', 3, 'Como o back lever tuck, mas com as costas retas e o quadril aberto (joelhos a 90°).', 'advanced tuck back lever tutorial', ['barra']],
    ['back-lever-straddle', 'Back lever pernas abertas', 'habilidade', 4, 'Corpo reto de barriga para baixo, braços retos atrás e pernas estendidas e abertas.', 'straddle back lever tutorial', ['barra']],

    // ---------- PERNAS unilaterais: etapas preparatórias ----------
    ['agachamento-split', 'Agachamento afundo parado (split squat)', 'pernas', 1, 'Pés afastados, um à frente do outro. Desça o joelho de trás reto para baixo até quase tocar o chão e suba, sem mudar os pés de lugar.', 'split squat tutorial bodyweight'],
    ['step-down', 'Descida do degrau', 'pernas', 2, 'Em pé no degrau sobre uma perna, desça o outro pé devagar até tocar o chão de leve com o calcanhar e suba. Joelho apontando para o pé, sem cair para dentro.', 'step down exercise knee tutorial', ['degrau']],
    ['pistol-negativa', 'Pistol squat negativo', 'pernas', 4, 'Em uma perna, a outra à frente, desça em 3–5 s até sentar no chão ou num banco baixo; levante com as duas pernas.', 'pistol squat negative tutorial'],

    // ---------- MOBILIDADE: quadril ----------
    ['cars-quadril', 'Rotação controlada do quadril (CARs)', 'mobilidade', 1, 'De quatro apoios ou em pé com apoio, faça o maior círculo possível com o joelho, bem devagar, sem mexer a lombar. 5 por lado em cada sentido.', 'hip CARs tutorial'],
    ['rotacao-interna-quadril', 'Rotação interna do quadril deitado', 'mobilidade', 1, 'Deitado de costas, pés bem afastados e joelhos dobrados. Deixe os dois joelhos caírem para um lado e depois para o outro, devagar.', 'hip internal rotation windshield wipers'],
    ['adutor-balanco', 'Balanço de adutor (rockback)', 'mobilidade', 1, 'De quatro apoios com uma perna estendida para o lado, leve o quadril para trás até sentir a parte de dentro da coxa e volte, sem arredondar a coluna.', 'adductor rock back mobility'],
    ['shin-box', 'Shin box com elevação', 'mobilidade', 2, 'Sentado com as pernas em 90/90, suba o quadril até ficar de joelhos, volte a sentar e gire os joelhos para o outro lado. Use as mãos se precisar.', 'shin box get up tutorial'],

    // ---------- MOBILIDADE / FLEXIBILIDADE: ombros ----------
    ['cars-ombro', 'Rotação controlada do ombro (CARs)', 'mobilidade', 1, 'Em pé, punho fechado e braço estendido. Faça o maior círculo possível bem devagar, sem girar o tronco nem arquear a lombar. 3–5 por lado em cada sentido.', 'shoulder CARs tutorial'],
    ['deslizamento-chao', 'Anjo no chão (floor slides)', 'mobilidade', 1, 'Deitado de costas, joelhos dobrados, braços em W no chão. Deslize os braços para cima até formar um Y sem tirar punhos e cotovelos do chão.', 'floor slides shoulder mobility'],
    ['alongamento-dorsal-banco', 'Alongamento de dorsal no banco', 'flexibilidade', 1, 'Ajoelhado, cotovelos apoiados num banco e mãos juntas atrás da cabeça. Leve o peito em direção ao chão e o quadril para trás.', 'bench lat stretch tutorial', ['banco']],
    ['postura-filhote', 'Postura do filhote (puppy pose)', 'flexibilidade', 1, 'De quatro, ande com as mãos à frente e desça o peito em direção ao chão, com o quadril sobre os joelhos e os braços estendidos.', 'puppy pose tutorial'],
    ['sleeper-stretch', 'Alongamento do dorminhoco (rotação interna)', 'flexibilidade', 1, 'Deitado de lado sobre o ombro, cotovelo a 90° à frente. Com a outra mão, empurre o antebraço em direção ao chão devagar. Pare se der dor na frente do ombro.', 'sleeper stretch tutorial'],
    ['extensao-ombro', 'Alongamento de ombro com mãos atrás', 'flexibilidade', 2, 'Sentado, mãos no chão atrás do corpo com os dedos para trás. Deslize o quadril para a frente mantendo o peito aberto e os ombros longe das orelhas.', 'seated shoulder extension stretch'],

    // ---------- MOBILIDADE: tornozelos ----------
    ['tornozelo-circulos', 'Círculos de tornozelo', 'mobilidade', 1, 'Sentado ou em pé com apoio, desenhe círculos lentos e amplos com o pé. 10 em cada sentido.', 'ankle circles mobility'],
    ['tibial-parede', 'Elevação de ponta de pé na parede (tibial)', 'mobilidade', 1, 'Costas na parede e calcanhares um pouco à frente. Levante as pontas dos pés o máximo possível e desça devagar.', 'tibialis raise wall tutorial', ['parede']],
    ['alongamento-soleo', 'Alongamento do sóleo (joelho dobrado)', 'flexibilidade', 1, 'Mãos na parede, perna de trás com o joelho dobrado e o calcanhar no chão. Desça o quadril até sentir a parte baixa da panturrilha.', 'soleus stretch tutorial', ['parede']],
    ['caminhada-ponta-calcanhar', 'Caminhada na ponta dos pés e nos calcanhares', 'mobilidade', 1, 'Caminhe 20 passos na ponta dos pés e 20 apoiado só nos calcanhares, corpo ereto.', 'heel walk toe walk exercise'],
    ['equilibrio-um-pe', 'Equilíbrio em um pé', 'mobilidade', 1, 'Em um pé, joelho levemente dobrado, por 30 s. Mais difícil: olhos fechados ou sobre uma almofada. Fique perto de um apoio.', 'single leg balance exercise ankle'],

    // ---------- MOBILIDADE: coluna ----------
    ['livro-aberto', 'Livro aberto (open book)', 'mobilidade', 1, 'Deitado de lado, joelhos dobrados à frente e braços juntos. Abra o braço de cima até o outro lado, acompanhando com o olhar, e volte. Os joelhos não saem do chão.', 'open book thoracic stretch'],
    ['extensao-toracica', 'Extensão torácica na cadeira', 'mobilidade', 1, 'Sentado, mãos atrás da cabeça, apoie a parte de cima das costas no encosto e arqueie para trás devagar, sem levantar as costelas.', 'thoracic extension chair mobility', ['banco']],
    ['passar-agulha', 'Passar a agulha (thread the needle)', 'mobilidade', 1, 'De quatro, passe um braço por baixo do corpo até apoiar o ombro no chão; depois abra o mesmo braço para o teto.', 'thread the needle stretch'],
    ['inclinacao-lateral', 'Inclinação lateral em pé', 'flexibilidade', 1, 'Em pé, braços acima da cabeça. Incline o tronco para um lado sem girar nem levar o quadril para trás; troque o lado.', 'standing side bend stretch'],

    // ---------- MOBILIDADE: punhos ----------
    ['punho-circulos', 'Círculos de punho', 'mobilidade', 1, 'Dedos entrelaçados à frente do peito, faça círculos amplos com os punhos para os dois lados. Bom aquecimento antes de flexões e paradas.', 'wrist circles warm up'],
    ['elevacao-palmas', 'Elevação das palmas (palm lifts)', 'mobilidade', 2, 'De quatro, mãos com os dedos para trás. Levante as palmas do chão mantendo os dedos apoiados e desça devagar.', 'palm lifts wrist exercise'],
    ['punho-garrafa', 'Fortalecimento de punho com garrafa', 'mobilidade', 1, 'Antebraço apoiado na coxa, palma para cima, segurando uma garrafa de água. Dobre e estenda o punho devagar. Depois repita com a palma para baixo.', 'wrist curl water bottle'],
    ['pronacao-supinacao', 'Rotação do antebraço (pronação e supinação)', 'mobilidade', 1, 'Cotovelo a 90° junto ao corpo, segurando uma garrafa ou martelo pela ponta. Gire a palma para cima e para baixo devagar.', 'forearm pronation supination exercise'],
    ['abertura-dedos', 'Abertura dos dedos com elástico', 'mobilidade', 1, 'Um elástico de dinheiro ou mini elástico em volta dos dedos. Abra a mão contra o elástico e feche devagar.', 'finger extension rubber band exercise'],
  ];
  const known = new Set(EXERCISES.map(x => x.id));
  rows.forEach(r => { if (known.has(r[0])) return; EXERCISES.push({ id: r[0], name: r[1], cat: r[2], level: r[3], how: r[4], q: r[5], w: !!r[7] || undefined, gym: !!r[7] || undefined }); if (r[6] && r[6].length) EQUIP_NEEDS[r[0]] = (EQUIP_NEEDS[r[0]] || []).concat(r[6]); });

  // Descrições revisadas (eram curtas demais para quem nunca fez o exercício)
  const HOW = {
    'flexao-joelhos': 'Joelhos no chão e mãos um pouco mais abertas que os ombros. Corpo reto dos joelhos à cabeça; desça o peito até perto do chão e empurre.',
    'flexao-aberta': 'Mãos bem mais abertas que os ombros. Desça o peito até perto do chão com o corpo reto; trabalha mais o peito.',
    'flexao-declinada': 'Pés num banco e mãos no chão, corpo reto. Desça o peito até perto do chão; quanto mais alto o banco, mais trabalha os ombros.',
    'flexao-palma': 'Desça como numa flexão, empurre forte para as mãos saírem do chão, bata palma e aterrisse com os cotovelos levemente dobrados.',
    'flexao-um-braco': 'Pés bem afastados, uma mão sob o ombro e a outra nas costas. Desça com o corpo reto, sem girar o quadril, e empurre.',
    'pike-pushup-elevado': 'Pés num banco e mãos no chão, quadril alto acima dos ombros. Dobre os cotovelos levando a cabeça à frente das mãos e empurre.',
    'mergulho-banco': 'Mãos na beira de um banco, pernas à frente. Desça dobrando os cotovelos para trás até 90°, ombros longe das orelhas, e suba.',
    'escapula-barra': 'Pendurado com braços retos, puxe os ombros para baixo e para trás (o corpo sobe um pouco) e solte devagar. Não dobre os cotovelos.',
    'barra-negativa': 'Suba com um salto ou banco até o queixo passar a barra e desça o mais devagar possível (3–5 s) até os braços esticarem.',
    'isometria-topo': 'Suba (ou salte) até o queixo passar a barra e segure parado, peito perto da barra e ombros para baixo.',
    'barra-l': 'Pendurado, levante as pernas estendidas até a horizontal (L) e faça a barra sem deixar as pernas caírem.',
    'wall-sit': 'Costas apoiadas na parede, desça até os joelhos ficarem a 90° sobre os tornozelos e segure.',
    'agachamento-salto': 'Agache até a coxa ficar perto da horizontal, salte o mais alto possível e aterrisse macio, já descendo para o próximo.',
    'bulgaro': 'Peito do pé de trás num banco, pé da frente bem à frente. Desça o joelho de trás reto para baixo e suba empurrando com a perna da frente.',
    'panturrilha': 'Pontas dos pés na beira do degrau. Desça os calcanhares abaixo do degrau e suba o máximo na ponta dos pés.',
    'panturrilha-unilateral': 'Na beira do degrau em um pé só, segurando num apoio. Desça o calcanhar em 2 s e suba o máximo.',
    'dead-bug': 'Deitado, braços para o teto e joelhos a 90°. Com a lombar colada no chão, estenda um braço e a perna oposta e volte; alterne.',
    'prancha-lateral': 'Deitado de lado, cotovelo sob o ombro. Suba o quadril até o corpo ficar reto da cabeça aos pés e segure.',
    'elevacao-joelhos': 'Pendurado, sem balançar, leve os joelhos até a altura do quadril ou mais e desça devagar. Ficou fácil: pernas estendidas.',
    'toes-to-bar': 'Pendurado, leve os pés estendidos até tocar a barra, inclinando o tronco para trás, e desça devagar sem balançar.',
    'lsit-tuck-um-pe': 'Mãos no chão ou em apoios ao lado do quadril, braços retos. Tire o quadril do chão com os joelhos dobrados e levante um pé.',
    'lsit-uma-perna': 'Na posição de tuck L-sit, estenda uma perna à frente e mantenha a outra dobrada; alterne entre as séries.',
    'lsit': 'Mãos ao lado do quadril, braços retos e ombros para baixo. Tire o corpo do chão com as pernas estendidas, juntas e paralelas ao chão.',
    'vsit': 'Do L-sit, incline os ombros para trás e levante as pernas acima da horizontal, formando um V.',
    'parada-mao-um-pe': 'Na parada de mão de frente para a parede, afaste um pé da parede e busque o equilíbrio com o corpo reto; alterne.',
    'parada-mao-livre': 'Sem parede: braços estendidos junto às orelhas, corpo reto e glúteo contraído. Corrija o equilíbrio pressionando com os dedos ou a base das mãos.',
    'front-lever-tuck': 'Pendurado com braços retos, leve os joelhos ao peito e gire até as costas ficarem paralelas ao chão. Ombros para baixo.',
    'fl-uma-perna': 'Do tuck front lever avançado, estenda uma perna mantendo o corpo paralelo ao chão; alterne.',
    'fl-straddle': 'Front lever com as pernas estendidas e abertas; quanto mais abertas, mais fácil. Quadril na altura dos ombros.',
    'back-lever': 'Pendurado, passe as pernas entre os braços e desça até o corpo ficar reto de barriga para baixo, paralelo ao chão, braços retos.',
    'tuck-planche-avancado': 'Como o tuck planche, mas com as costas retas e o quadril na altura dos ombros, joelhos afastados do peito.',
    'bandeira': 'Mãos afastadas num poste vertical, braço de cima puxando e o de baixo empurrando; corpo reto na horizontal, de lado.',
    'polichinelo': 'Salte abrindo pernas e braços acima da cabeça e salte de novo fechando. Mais leve: abra uma perna de cada vez, sem saltar.',
    'joelho-alto': 'Corra no lugar levando os joelhos até a altura do quadril, na ponta dos pés, com os braços acompanhando.',
    'burpee': 'Agache e apoie as mãos, jogue os pés para trás em prancha, faça uma flexão, traga os pés de volta e salte. Mais leve: sem flexão e sem salto.',
    'meia-ponte': 'Deitado de costas, joelhos dobrados e pés no chão. Suba o quadril até o corpo ficar reto dos joelhos aos ombros e desça devagar.',
    'espacate-lateral': 'Pernas abertas para os lados, quadril alinhado com os pés e joelhos para cima. Desça aos poucos com apoio das mãos.',
    'rotacao-ombros': 'Braços estendidos para os lados; faça círculos pequenos que vão ficando amplos, para frente e depois para trás.',
    'gato-vaca': 'De quatro apoios, arredonde a coluna olhando para o umbigo e depois arqueie olhando para a frente, devagar, com a respiração.',
    'rodante': 'Como uma estrela, mas com meia volta no meio: junte os pés no ar e aterrisse de frente para onde veio. Aprenda com professor.',
    'estrela-uma-mao': 'Estrela apoiando só a mão do lado para onde você vai. Treine antes a estrela comum nos dois lados.',
  };
  EXERCISES.forEach(x => { if (HOW[x.id]) x.how = HOW[x.id]; });
  // Níveis revistos
  const LVL = { 'barra-archer': 4, 'back-lever-tuck': 3, 'skin-the-cat': 3 };
  EXERCISES.forEach(x => { if (LVL[x.id]) x.level = LVL[x.id]; });
  // Equipamentos que faltavam
  const add = (eq, ids) => ids.split(' ').forEach(id => { const n = EQUIP_NEEDS[id] = EQUIP_NEEDS[id] || []; if (!n.includes(eq)) n.push(eq); });
  add('colchonete', 'parada-rolamento reversao-frente reversao-tras ponte-em-pe kip-up headstand parada-antebraco parada-ponte mortal-tras mortal-frente butterfly-kick estrela-uma-mao');
  add('parede', 'alongamento-peitoral alongamento-panturrilha mobilidade-tornozelo');
  add('degrau', 'jefferson-curl');
  add('corda-remada', 'passagem-ombro');

  Object.assign(NEXT_VARIATION, {
    // posterior de coxa
    'hip-hinge-bastao': 'stiff-unilateral-livre', 'ponte-pes-elevados': 'ponte-caminhada', 'ponte-caminhada': 'flexao-joelho-toalha-excentrica',
    'flexao-joelho-toalha-excentrica': 'flexao-joelho-toalha', 'flexao-joelho-toalha': 'flexao-joelho-toalha-unilateral',
    'flexao-joelho-toalha-unilateral': 'nordic-assistido', 'nordic-assistido': 'nordic', 'ponte-unilateral': 'ponte-unilateral-elevada',
    // empurrar
    'flexao-diamante': 'flexao-assimetrica', 'flexao-assimetrica': 'flexao-archer', 'flexao-um-braco-elevada': 'flexao-um-braco-negativa', 'flexao-um-braco-negativa': 'flexao-um-braco',
    'pike-pushup-elevado': 'hspu-negativa', 'hspu-negativa': 'hspu-parede',
    // parada de mão
    'parada-caixa': 'caminhada-parede', 'caminhada-parede': 'parada-mao-parede', 'parada-mao-toques': 'parada-mao-chute', 'saida-parada': 'parada-mao-chute', 'parada-mao-chute': 'parada-mao-livre',
    // planche
    'planche-lean': 'tuck-planche-elevacoes', 'tuck-planche-elevacoes': 'tuck-planche', 'tuck-planche-avancado': 'planche-meia-straddle', 'planche-meia-straddle': 'straddle-planche', 'straddle-planche-elastico': 'straddle-planche',
    // puxar
    'barra-elastico': 'barra-pronada', 'remada-australiana-elevada': 'remada-australiana-archer', 'remada-australiana-archer': 'remada-um-braco',
    'barra-archer': 'barra-assimetrica', 'barra-assimetrica': 'barra-typewriter', 'barra-typewriter': 'barra-um-braco-assistida', 'barra-um-braco-assistida': 'isometria-um-braco', 'isometria-um-braco': 'barra-um-braco-negativa', 'barra-um-braco-negativa': 'barra-um-braco',
    'barra-cintura': 'muscle-up-transicao', 'muscle-up-transicao': 'muscle-up-negativa',
    // front e back lever
    'fl-elevacoes-tuck': 'front-lever-tuck', 'fl-remada-tuck': 'fl-tuck-avancado', 'fl-negativa': 'front-lever', 'fl-elastico': 'front-lever',
    'german-hang': 'back-lever-tuck', 'back-lever-tuck': 'back-lever-tuck-avancado', 'back-lever-tuck-avancado': 'back-lever-straddle', 'back-lever-straddle': 'back-lever',
    // pernas unilaterais
    'agachamento': 'agachamento-split', 'agachamento-split': 'bulgaro', 'step-down': 'pistol-assistido', 'pistol-banco': 'pistol-negativa', 'pistol-negativa': 'pistol',
    // mobilidade
    'tornozelo-circulos': 'mobilidade-tornozelo', 'punho-circulos': 'alongamento-punho', 'alongamento-punho': 'elevacao-palmas', 'quadril-90-90': 'shin-box', 'cars-ombro': 'deslizamento-chao',
  });

  // Etapas novas nas árvores de habilidade. SKILL_INSERTS diz em que posição antiga entraram etapas,
  // para o app ajustar o passo de quem já estava treinando (store.js → S.migrate).
  const step = (ex, sets, val, unit, label) => Object.assign({ ex, crit: { sets, val, unit } }, label ? { label } : {});
  const sk = id => SKILLS.find(s => s.id === id);
  const put = (id, at, steps) => { const s = sk(id); s.steps.splice(at, 0, ...steps); };
  window.SKILL_INSERTS = {};
  const plan = (id, ins) => { // ins: [[posição antiga, [etapas]], ...] em ordem crescente
    let shift = 0; ins.forEach(([at, steps]) => { put(id, at + shift, steps); shift += steps.length; });
    window.SKILL_INSERTS[id] = ins.map(([at, steps]) => [17, at, steps.length]);
  };
  plan('parada-mao', [[0, [step('parada-caixa', 3, 30, 's', 'Pés no banco 30 s'), step('caminhada-parede', 3, 3, 'reps')]], [3, [step('saida-parada', 1, 10, 'reps', 'Saída segura, 10 vezes'), step('parada-mao-chute', 3, 5, 'reps')]]]);
  plan('planche', [[0, [step('flexao-escapular', 3, 12, 'reps'), step('crow', 3, 20, 's')]], [1, [step('tuck-planche-elevacoes', 3, 8, 'reps')]]]);
  sk('planche').steps.push(step('planche-meia-straddle', 3, 8, 's'), step('straddle-planche', 3, 8, 's'), step('planche-completa', 3, 5, 's'));
  sk('planche').prazo = 'Meta de longo prazo: anos para a completa';
  plan('front-lever', [[0, [step('hollow-body', 3, 30, 's', 'Hollow body 30 s'), step('escapula-barra', 3, 12, 'reps'), step('fl-elevacoes-tuck', 3, 6, 'reps')]]]);
  plan('flexao-um-braco', [[2, [step('flexao-assimetrica', 3, 8, 'reps')]], [4, [step('flexao-um-braco-negativa', 3, 5, 'reps')]]]);
  plan('pistol', [[0, [step('agachamento-split', 3, 12, 'reps'), step('step-down', 3, 10, 'reps')]], [2, [step('pistol-negativa', 3, 5, 'reps')]]]);
  plan('muscle-up', [[3, [step('muscle-up-transicao', 3, 5, 'reps')]]]);
  SKILLS.splice(SKILLS.findIndex(s => s.id === 'acrobacia'), 0,
    { id: 'barra-um-braco', name: 'Barra de um braço', icon: '☝️', prazo: '1–3 anos', start: 0,
      steps: [step('barra-pronada', 1, 15, 'reps', '15 barras limpas'), step('barra-archer', 3, 5, 'reps'), step('barra-assimetrica', 3, 5, 'reps'), step('barra-typewriter', 3, 4, 'reps'),
        step('barra-um-braco-assistida', 3, 4, 'reps'), step('isometria-um-braco', 3, 10, 's'), step('barra-um-braco-negativa', 3, 3, 'reps'), step('barra-um-braco', 3, 1, 'reps')] },
    { id: 'back-lever', name: 'Back lever', icon: '🔙', prazo: '6–12 meses', start: 0,
      note: 'Pressiona bastante a frente dos ombros e os cotovelos: avance devagar e pare se doer.',
      steps: [step('german-hang', 3, 20, 's'), step('skin-the-cat', 3, 3, 'reps'), step('back-lever-tuck', 3, 10, 's'), step('back-lever-tuck-avancado', 3, 10, 's'),
        step('back-lever-straddle', 3, 8, 's'), step('back-lever', 3, 8, 's')] },
    { id: 'posterior', name: 'Posterior de coxa sem academia', icon: '🦵', prazo: '2–6 meses até o nordic', start: 0,
      steps: [step('ponte-pes-elevados', 3, 15, 'reps'), step('ponte-caminhada', 3, 8, 'reps'), step('flexao-joelho-toalha-excentrica', 3, 8, 'reps'), step('flexao-joelho-toalha', 3, 12, 'reps'),
        step('flexao-joelho-toalha-unilateral', 3, 8, 'reps'), step('nordic-assistido', 3, 5, 'reps'), step('nordic', 3, 5, 'reps')] });
})();
