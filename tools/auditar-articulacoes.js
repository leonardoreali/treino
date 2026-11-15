// Lista as articulações de cada exercício (js/data/joints.js) por categoria, para revisão.
// Uso: node tools/auditar-articulacoes.js [categoria]
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['exercises.js', 'equip.js', 'gym.js', 'more.js', 'program.js', 'more2.js', 'meta.js', 'mobility.js', 'joints.js']) vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data', f), 'utf8'), ctx);
const only = process.argv[2], by = {};
ctx.EXERCISES.forEach(x => { if (!only || x.cat === only) (by[x.cat] = by[x.cat] || []).push(x); });
for (const [cat, xs] of Object.entries(by)) { console.log('\n## ' + cat); xs.forEach(x => console.log(x.id.padEnd(34), (x.pat || x.reg || '').padEnd(12), x.joints.join(' '))); }
