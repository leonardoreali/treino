// Teste automático dos dados de exercícios. Falha (código 1) se algo estiver incompleto ou incoerente.
// Uso: node tools/testar-dados.js      (rode antes de publicar)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['exercises.js', 'videos.js', 'equip.js', 'gym.js', 'more.js', 'program.js', 'more2.js', 'meta.js', 'mobility.js', 'joints.js'])
  vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data', f), 'utf8'), ctx);
const E = ctx.EXERCISES, ids = new Map(), fails = [], ex = id => E.find(x => x.id === id);
const fail = (id, msg) => fails.push(id.padEnd(32) + ' ' + msg);
const has = (x, ...js) => js.some(j => x.joints.includes(j));
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
    if (['empurrar', 'puxar'].includes(x.cat) && !has(x, 'ombro', 'cotovelo')) fail(x.id, 'empurrar/puxar sem ombro nem cotovelo');
    if (x.cat === 'pernas' && !has(x, 'quadril', 'joelho', 'tornozelo')) fail(x.id, 'pernas sem quadril, joelho ou tornozelo');
    if (x.cat === 'core' && !has(x, 'coluna')) fail(x.id, 'core sem coluna');
    if (x.pat === 'agachar' && !has(x, 'joelho')) fail(x.id, 'agachar sem joelho');
    if (x.pat === 'quadril' && !has(x, 'quadril')) fail(x.id, 'dobrar o quadril sem quadril');
    if (x.pat === 'joelho' && !has(x, 'joelho')) fail(x.id, 'flexionar o joelho sem joelho');
    if (/^(empurrar|puxar)-/.test(x.pat || '') && !has(x, 'punho')) fail(x.id, 'empurrar/puxar sem punho');
    const eq = ctx.EQUIP_NEEDS[x.id] || [];
    if (eq.some(q => GRIP.includes(q)) && !has(x, 'punho')) fail(x.id, 'segura equipamento mas não tem punho');
    if (x.reg && !has(x, { punho: 'punho', ombro: 'ombro', quadril: 'quadril', posterior: 'quadril', tornozelo: 'tornozelo', coluna: 'coluna' }[x.reg])) fail(x.id, 'região ' + x.reg + ' sem a articulação correspondente');
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
// exercício criado pelo usuário, sem padrão, sem equipamento e sem descrição: precisa sair com articulações
Object.keys(ctx.CATEGORIES).forEach(cat => { const j = ctx.jointsOf({ id: 'c-teste', cat, how: '' }); if (!j.length) fail('c-teste/' + cat, 'exercício personalizado sem articulações'); });
const j = ctx.jointsOf({ id: 'c-teste', cat: 'puxar', how: '', jointsManual: ['pescoco'] }); if (!j.includes('pescoco') || !j.includes('ombro')) fail('c-teste/manual', 'articulações marcadas não foram somadas');

if (fails.length) { console.log(fails.length + ' problema(s):\n' + fails.join('\n')); process.exit(1); }
console.log('OK: ' + E.length + ' exercícios conferidos (ids, instruções, vídeos, articulações, mobilidade, progressões, árvores e exercícios personalizados).');
