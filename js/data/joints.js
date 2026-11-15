/* Articulações exigidas por cada exercício (v21).
   Em vez de depender só de listas de exceções, cada exercício ganha x.joints, calculado a partir de:
   padrão de movimento, região de mobilidade, categoria, posição descrita no "como fazer" (ajoelhado, de quatro,
   pendurado...) e uma lista curta para o pescoço. Exercício novo já sai classificado; x.joints definido à mão
   é somado ao cálculo. Usado pela saúde (js/health.js) para proteger a articulação da condição registrada. */
(function () {
  window.JOINTS = { punho: 'Punho', cotovelo: 'Cotovelo', ombro: 'Ombro', pescoco: 'Pescoço', coluna: 'Coluna', quadril: 'Quadril', joelho: 'Joelho', tornozelo: 'Tornozelo' };
  const BY_PAT = {
    'empurrar-h': 'punho cotovelo ombro', 'empurrar-v': 'punho cotovelo ombro', 'puxar-h': 'punho cotovelo ombro', 'puxar-v': 'punho cotovelo ombro',
    agachar: 'quadril joelho tornozelo', quadril: 'quadril coluna', joelho: 'joelho quadril', estabilizar: 'coluna', locomover: 'quadril joelho tornozelo',
  };
  const BY_REG = { punho: 'punho', ombro: 'ombro', quadril: 'quadril', posterior: 'quadril joelho', tornozelo: 'tornozelo', coluna: 'coluna' };
  const BY_CAT = { cardio: 'quadril joelho tornozelo', acrobacia: 'punho cotovelo ombro pescoco coluna quadril joelho tornozelo', pernas: 'quadril joelho' };
  // isolados e golpes, pelo nome
  const BY_ID = [
    [/rosca|triceps|pronacao|punho-garrafa/, 'cotovelo punho'], [/panturrilha|tibial/, 'tornozelo'], [/extensora|flexora|leg-press|hack|sissy/, 'joelho'],
    [/abdutora|adutora|gluteo|clamshell|monster/, 'quadril'], [/elevacao-lateral|elevacao-frontal|encolhimento|remada-alta|rotacao-externa|face-pull/, 'ombro'],
    [/chute|teep|joelhada|defesa-chute|clinch/, 'quadril joelho tornozelo'], [/jab|direto|cruzado|uppercut|combo|cotovelada|saco|sombra|bloqueio|guarda/, 'ombro cotovelo punho'],
    [/esquiva|pendulo|movimentacao/, 'joelho tornozelo coluna'],
    [/german-hang|skin-the-cat|saida-parada/, 'ombro cotovelo punho'],
    // pescoço: apoio na cabeça, rolamentos, pontes e cabeça para baixo com carga
    [/headstand|hspu|parada-ponte|^ponte$|ponte-em-pe|rolamento|kip-up|mortal|reversao|dragon-flag|parada-antebraco|butterfly|^abdominal$|abdominal-bicicleta/, 'pescoco'],
  ];
  // flexão do quadril (elevar pernas, levar joelhos ao peito, correr e saltar)
  BY_ID.push([/elevacao-(joelhos|pernas)|toes-to-bar|lsit|vsit|v-up|hollow|flutter|dragon-flag|windshield|abdominal|mountain-climber|joelho-alto|russian-twist|bicicleta|copenhagen|corda|polichinelo|sprint|double-under|skater|burpee|pike/, 'quadril']);
  // apoio nas mãos com braços estendidos
  BY_ID.push([/lsit|vsit|crow|elbow-lever|prancha-alta|prancha-toque|mountain-climber|burpee|bear-crawl|ab-wheel|parada|planche|press-handstand/, 'punho cotovelo ombro']);
  // apoio no antebraço
  BY_ID.push([/^prancha$|prancha-lateral|copenhagen/, 'ombro cotovelo']);
  // Equipamento que se segura ou de onde se pendura: carrega punho, cotovelo e ombro
  const BY_EQUIP = { barra: 'punho cotovelo ombro', argolas: 'punho cotovelo ombro', paralelas: 'punho cotovelo ombro', poste: 'punho cotovelo ombro', polia: 'punho cotovelo ombro',
    'corda-remada': 'punho cotovelo ombro', 'barra-baixa': 'punho cotovelo ombro', saco: 'punho cotovelo ombro', halteres: 'punho cotovelo ombro', 'barra-livre': 'punho cotovelo ombro',
    kettlebell: 'punho cotovelo ombro', 'roda-abdominal': 'punho cotovelo ombro', 'corda-pular': 'punho ombro', superband: 'ombro' };
  // Metadados por exercício quando nada acima representa bem o movimento (somados ao cálculo)
  const EXTRA = {
    'remo-ergometro': 'ombro cotovelo punho coluna', eliptico: 'ombro cotovelo', polichinelo: 'ombro', superman: 'ombro', pallof: 'ombro cotovelo punho',
    'turkish-getup': 'ombro cotovelo punho quadril joelho', copenhagen: 'joelho', clinch: 'pescoco ombro cotovelo punho coluna', 'espacate-frontal': 'joelho',
    'kettlebell-swing': 'joelho', 'farmer-walk': 'coluna', 'escada-maq': 'quadril', 'sombra': 'quadril joelho tornozelo', 'saco-rounds': 'quadril joelho tornozelo',
    'agachamento-barra': 'coluna', 'agachamento-frontal': 'coluna', 'good-morning': 'ombro', 'hip-thrust': 'joelho', 'dead-bug': 'quadril ombro', 'bird-dog': 'quadril ombro',
    'prancha-lateral-quadril': 'ombro cotovelo quadril', 'pistol': 'coluna', 'nordic': 'quadril', 'kip-up': 'pescoco', 'macaco': 'punho cotovelo ombro',
  };
  // posição descrita no texto
  const BY_TEXT = [
    [/ajoelhad|de joelhos|meio ajoelhado|joelho de trás no chão|joelhos no chão|de quatro|quatro apoios/, 'joelho'],
    [/de quatro|quatro apoios|mãos no chão|apoie as mãos|apoiar as mãos|posição de flexão|prancha alta|parada de mão|peso nas mãos/, 'punho'],
    [/pendurad|segure na barra|na barra com/, 'ombro cotovelo punho'], [/agach/, 'joelho tornozelo'],
  ];
  const add = (set, s) => s.split(' ').forEach(j => set.add(j));
  // também vale para exercícios criados pelo usuário (calculado na hora)
  window.jointsOf = x => {
    if (!x) return [];
    const j = new Set(x.jointsManual || []), how = (x.how || '').toLowerCase();
    if (BY_PAT[x.pat]) add(j, BY_PAT[x.pat]);
    if (BY_REG[x.reg]) add(j, BY_REG[x.reg]);
    if (!x.pat && !x.reg && BY_CAT[x.cat]) add(j, BY_CAT[x.cat]);
    BY_ID.forEach(([re, s]) => { if (re.test(x.id)) add(j, s); });
    BY_TEXT.forEach(([re, s]) => { if (re.test(how)) add(j, s); });
    (x.equip || (window.EQUIP_NEEDS || {})[x.id] || []).forEach(q => { if (BY_EQUIP[q]) add(j, BY_EQUIP[q]); });
    if (EXTRA[x.id]) add(j, EXTRA[x.id]);
    return [...j];
  };
  EXERCISES.forEach(x => { if (x.joints) x.jointsManual = x.joints; x.joints = jointsOf(x); });
})();
