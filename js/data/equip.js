/* Equipamentos e o que cada exercício precisa. Exercício fora da lista = só o peso do corpo. */
(function () {
  window.EQUIP = [
    ['barra', 'Barra fixa'], ['paralelas', 'Paralelas ou 2 cadeiras firmes'], ['banco', 'Banco ou cadeira'],
    ['corda-pular', 'Corda de pular'], ['elastico', 'Mini elásticos'], ['corda-remada', 'Corda ou toalha para remada'],
    ['degrau', 'Escada ou degrau'], ['parede', 'Parede livre'], ['colchonete', 'Colchonete'],
    ['barra-baixa', 'Barra baixa ou mesa firme'], ['poste', 'Poste vertical'], ['argolas', 'Argolas'], ['saco', 'Saco de pancada'],
  ].map(r => ({ id: r[0], name: r[1] }));
  // O que o PDF inicial indica que já existe em casa.
  window.EQUIP_DEFAULT = ['barra', 'paralelas', 'banco', 'corda-pular', 'elastico', 'corda-remada', 'degrau', 'parede', 'colchonete'];

  const needs = {};
  const add = (eq, ids) => ids.split(' ').forEach(id => { (needs[id] = needs[id] || []).push(eq); });
  add('barra', 'dead-hang escapula-barra barra-negativa barra-pronada chin-up isometria-topo barra-l barra-explosiva barra-cintura muscle-up-negativa muscle-up barra-archer elevacao-joelhos elevacao-pernas toes-to-bar front-lever-tuck fl-tuck-avancado fl-uma-perna fl-straddle front-lever back-lever remada-corda');
  add('corda-remada', 'remada-corda');
  add('barra-baixa', 'remada-australiana');
  add('banco', 'flexao-inclinada flexao-declinada pike-pushup-elevado mergulho-banco bulgaro pistol-banco flexao-um-braco-elevada ytw dragon-flag');
  add('paralelas', 'dips');
  add('parede', 'hspu-parede wall-sit parada-mao-parede parada-mao-um-pe parada-mao-toques couch-stretch wall-slide parada-ponte');
  add('degrau', 'panturrilha panturrilha-unilateral escada');
  add('corda-pular', 'corda');
  add('elastico', 'ponte-gluteo-elastico monster-walk clamshell rotacao-externa wall-slide');
  add('colchonete', 'rolamento-frente rolamento-tras');
  add('poste', 'bandeira');
  window.EQUIP_NEEDS = needs;
})();
