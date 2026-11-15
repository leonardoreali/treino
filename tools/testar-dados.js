// Teste automático dos dados de exercícios. Falha (código 1) se algo estiver incompleto ou incoerente.
// Uso: node tools/testar-dados.js      (rode antes de publicar)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['exercises.js', 'videos.js', 'equip.js', 'gym.js', 'more.js', 'program.js', 'more2.js', 'meta.js', 'mobility.js', 'joints.js'])
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data', f), 'utf8'), ctx);
const E = ctx.EXERCISES, ids = new Map(), fails = [], ex = id => E.find(x => x.id === id);
const fail = (id, msg) => fails.push(id.padEnd(32) + ' ' + msg);
// hasAny: pelo menos uma das articulações; hasAll: todas as obrigatórias
const hasAny = (x, ...js) => js.some(j => x.joints.includes(j));
const hasAll = (x, ...js) => js.every(j => x.joints.includes(j));
const missing = (x, ...js) => js.filter(j => !x.joints.includes(j)).join(', ');
const GRIP = ['barra', 'argolas', 'paralelas', 'poste', 'polia', 'corda-remada', 'barra-baixa', 'halteres', 'barra-livre', 'kettlebell', 'roda-abdominal', 'corda-pular', 'saco'];
const equipIds = new Set(ctx.EQUIP.map(q => q.id).concat(ctx.EQUIP_GYM_LIST || []));

E.forEach(x => {
  if (ids.has(x.id)) fail(x.id, 'id repetido'); ids.set(x.id, 1);
  if (!x.name || !ctx.CATEGORIES[x.cat] || !(x.level >= 1 && x.level <= 5)) fail(x.id, 'nome, categoria ou nível inválido');
  if (!x.how || x.how.length < 30) fail(x.id, 'instrução curta demais');
  if (!ctx.VIDEOS[x.id]) fail(x.id, 'sem vídeo');
  // articulações
  if (!x.joints || !x.joints.length) fail(x.id, 'sem articulações');
  else {
    const need = (cond, js, msg) => { if (cond && !hasAll(x, ...js)) fail(x.id, msg + ' — faltam: ' + missing(x, ...js)); };
    // padrões compostos: todas as articulações principais
    need(/^(empurrar|puxar)-/.test(x.pat || ''), ['punho', 'cotovelo', 'ombro'], 'empurrar/puxar');
    need(x.pat === 'agachar', ['quadril', 'joelho', 'tornozelo'], 'agachar');
    need(x.pat === 'quadril', ['quadril', 'coluna'], 'dobrar o quadril');
    need(x.pat === 'joelho', ['joelho', 'quadril'], 'flexionar o joelho');
    need(x.pat === 'locomover', ['quadril', 'joelho', 'tornozelo'], 'locomover');
    need(x.pat === 'estabilizar' || x.cat === 'core', ['coluna'], 'core/estabilizar');
    const eq = ctx.EQUIP_NEEDS[x.id] || [];
    if (eq.some(q => GRIP.includes(q)) && !hasAll(x, 'punho', eq.includes('corda-pular') ? 'ombro' : 'cotovelo', 'ombro')) fail(x.id, 'segura/pendura em equipamento — faltam: ' + missing(x, 'punho', 'cotovelo', 'ombro'));
    // isolados e categorias: pelo menos uma coerente
    if (x.pat === 'isolado' && !hasAny(x, 'ombro', 'cotovelo', 'joelho', 'quadril', 'tornozelo')) fail(x.id, 'isolado sem articulação de membro');
    if (x.cat === 'pernas' && !hasAny(x, 'quadril', 'joelho', 'tornozelo')) fail(x.id, 'pernas sem quadril, joelho ou tornozelo');
    if (x.reg) need(true, [{ punho: 'punho', ombro: 'ombro', quadril: 'quadril', posterior: 'quadril', tornozelo: 'tornozelo', coluna: 'coluna' }[x.reg]], 'região ' + x.reg);
  }
  // mobilidade e flexibilidade
  if (['mobilidade', 'flexibilidade'].includes(x.cat)) {
    if (!x.mod) fail(x.id, 'sem modalidade'); if (!x.dose) fail(x.id, 'sem dose'); if (!x.reg) fail(x.id, 'sem região');
  }
  (ctx.EQUIP_NEEDS[x.id] || []).forEach(q => { if (!equipIds.has(q) && !['maquinas', 'cardio-maq', 'banco-supino', 'halteres', 'barra-livre', 'polia', 'kettlebell'].includes(q)) fail(x.id, 'equipamento desconhecido: ' + q); });
});
// progressões e árvores
Object.entries(ctx.NEXT_VARIATION).forEach(([a, b]) => {
  if (!ex(a) || !ex(b)) return fail(a, 'próxima variação inexistente: ' + b);
  if (ex(b).level < ex(a).level) fail(a, 'próxima variação mais fácil: ' + b);
});
ctx.SKILLS.forEach(s => s.steps.forEach(st => { if (!ex(st.ex)) fail(s.id, 'etapa com exercício inexistente: ' + st.ex); }));
// exercícios criados pelo usuário: casos de risco
const caso = (nome, x, js) => { const got = ctx.jointsOf(Object.assign({ id: 'c-teste', how: '', jointsManual: [] }, x)), falta = js.filter(k => !got.includes(k)); if (falta.length) fail('caso: ' + nome, 'faltam ' + falta.join(', ') + ' (veio: ' + got.join(' ') + ')'); };
Object.keys(ctx.CATEGORIES).forEach(cat => caso('categoria ' + cat + ' vazia', { cat }, [ctx.jointsOf({ id: 'c-teste', cat, how: '', jointsManual: [] })[0] || 'algo']));
caso('core com apoio nas mãos', { cat: 'core', how: 'Apoie as mãos no chão e segure o corpo reto.' }, ['punho', 'cotovelo', 'ombro', 'coluna']);
caso('prancha no core (pelo nome)', { cat: 'core', name: 'Prancha com toque', how: '' }, ['ombro', 'cotovelo', 'coluna']);
caso('prancha nos antebraços', { cat: 'core', how: 'Antebraços no chão, corpo reto.' }, ['ombro', 'cotovelo', 'coluna']);
caso('de quatro (mobilidade)', { cat: 'mobilidade', how: 'De quatro, gire o tronco.' }, ['joelho', 'punho']);
caso('ajoelhado (flexibilidade)', { cat: 'flexibilidade', how: 'Ajoelhado, leve o quadril à frente.' }, ['joelho', 'quadril']);
caso('pendurado (core)', { cat: 'core', how: 'Pendurado, levante as pernas.' }, ['ombro', 'cotovelo', 'punho', 'coluna']);
caso('mini elástico em empurrar', { cat: 'empurrar', equip: ['elastico'] }, ['punho', 'cotovelo', 'ombro']);
caso('barra fixa no core', { cat: 'core', equip: ['barra'] }, ['punho', 'cotovelo', 'ombro', 'coluna']);
caso('equipamento próprio em puxar', { cat: 'puxar', equip: ['q-meu'] }, ['punho', 'cotovelo', 'ombro']);
caso('apoio na cabeça (habilidade)', { cat: 'habilidade', how: 'Cabeça no chão formando um triângulo com as mãos.' }, ['pescoco', 'punho']);
caso('saltos (cardio)', { cat: 'cardio', how: 'Salte no lugar.' }, ['quadril', 'joelho', 'tornozelo']);
caso('articulação marcada à mão', { cat: 'puxar', jointsManual: ['pescoco'] }, ['pescoco', 'ombro']);
caso('exercício antigo sem articulações conferidas', { cat: 'mobilidade', jointsManual: undefined }, ['punho', 'cotovelo', 'ombro', 'coluna', 'quadril', 'joelho', 'tornozelo']);

if (fails.length) { console.log(fails.length + ' problema(s):\n' + fails.join('\n')); process.exit(1); }
console.log('OK: ' + E.length + ' exercícios conferidos (ids, instruções, vídeos, articulações, mobilidade, progressões, árvores e ' + 15 + ' casos de exercícios personalizados).');
