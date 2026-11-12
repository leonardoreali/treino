/* Diário alimentar: a pessoa anota o que comeu. Não prescreve dieta.
   Tabela de alimentos: valores APROXIMADOS por porção (referência: tabela TACO e rótulos comuns). [nome, porção, kcal, proteína g] */
(function () {
  const e = U.esc;
  window.FOODS = [
    ['Arroz branco cozido', '4 col. de sopa (100 g)', 128, 2.5], ['Arroz integral cozido', '4 col. de sopa (100 g)', 124, 2.6], ['Feijão cozido', '1 concha (100 g)', 76, 4.8],
    ['Macarrão cozido', '1 pegador (100 g)', 102, 3.4], ['Cuscuz cozido', '100 g', 113, 2.2], ['Batata cozida', '100 g', 52, 1.2], ['Batata-doce cozida', '100 g', 77, 0.6], ['Mandioca cozida', '100 g', 125, 0.6],
    ['Frango grelhado (peito)', '1 filé (100 g)', 159, 32], ['Carne bovina magra grelhada', '1 bife (100 g)', 219, 36], ['Carne moída refogada', '4 col. de sopa (100 g)', 212, 26], ['Lombo de porco assado', '100 g', 210, 36],
    ['Linguiça grelhada', '1 gomo (60 g)', 178, 14], ['Peixe grelhado (tilápia)', '1 filé (100 g)', 128, 26], ['Sardinha em lata', '1 lata drenada (84 g)', 239, 13], ['Atum em lata', '1 lata drenada (100 g)', 166, 26],
    ['Ovo cozido', '1 unidade', 73, 6.6], ['Ovo frito', '1 unidade', 120, 7.8], ['Leite integral', '1 copo (200 ml)', 120, 6.4], ['Iogurte natural', '1 pote (170 g)', 87, 7], ['Queijo mussarela', '1 fatia (20 g)', 66, 4.5],
    ['Queijo minas frescal', '1 fatia (30 g)', 79, 5.2], ['Requeijão', '1 col. de sopa (30 g)', 77, 2.9], ['Presunto', '2 fatias (30 g)', 28, 4.3], ['Whey protein', '1 dose (30 g)', 120, 24],
    ['Pão francês', '1 unidade (50 g)', 150, 4], ['Pão de forma', '2 fatias (50 g)', 127, 6], ['Tapioca', '1 unidade (50 g de goma)', 120, 0], ['Pão de queijo', '1 unidade (40 g)', 145, 2], ['Aveia', '3 col. de sopa (30 g)', 118, 4.2], ['Granola', '3 col. de sopa (30 g)', 130, 3],
    ['Banana', '1 unidade', 69, 0.9], ['Maçã', '1 unidade', 73, 0.4], ['Laranja', '1 unidade', 60, 1.3], ['Mamão', '1 fatia (150 g)', 60, 0.8], ['Abacate', '100 g', 96, 1.2],
    ['Salada de folhas', '1 prato', 15, 1], ['Legumes cozidos', '100 g', 35, 1.5], ['Azeite', '1 col. de sopa', 108, 0], ['Manteiga', '1 col. de chá (5 g)', 36, 0], ['Amendoim', '1 punhado (30 g)', 163, 8], ['Pasta de amendoim', '1 col. de sopa (15 g)', 90, 3.8],
    ['Café sem açúcar', '1 xícara', 2, 0], ['Açúcar', '1 col. de chá', 19, 0], ['Suco de laranja natural', '1 copo (200 ml)', 80, 1.4], ['Refrigerante', '1 lata (350 ml)', 150, 0], ['Cerveja', '1 lata (350 ml)', 144, 2],
    ['Chocolate ao leite', '1 pedaço (25 g)', 135, 1.8], ['Biscoito recheado', '3 unidades', 142, 1.9], ['Pizza de mussarela', '1 fatia', 270, 11], ['Hambúrguer simples', '1 sanduíche', 300, 15], ['Coxinha', '1 unidade (80 g)', 230, 7],
  ].map(r => ({ name: r[0], portion: r[1], kcal: r[2], prot: r[3] }));
  const MEALS = { cafe: 'Café da manhã', almoco: 'Almoço', lanche: 'Lanche', jantar: 'Jantar', outro: 'Outro' };
  let day = null, meal = 'cafe';
  const diet = () => S.state.diet || (S.state.diet = []);
  const shift = (iso, n) => { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const sum = (date, k) => Math.round(diet().filter(x => x.date === date).reduce((a, x) => a + (+x[k] || 0), 0));
  U.dietToday = () => ({ n: diet().filter(x => x.date === S.today()).length, kcal: sum(S.today(), 'kcal'), prot: sum(S.today(), 'prot') });

  V.dieta = () => {
    day = day || S.today();
    const items = diet().filter(x => x.date === day), g = S.state.dietGoal || {}, kc = sum(day, 'kcal'), pr = sum(day, 'prot'), water = (S.state.water || {})[day] || 0;
    const bar = (v, goal) => goal ? '<div class="bar"><i style="width:' + Math.min(100, 100 * v / goal) + '%"></i></div>' : '';
    return '<a href="#hoje" class="muted small">← Hoje</a><h1>Diário alimentar</h1>' +
      '<div class="row between"><button class="ghost" data-a="dt-day" data-n="-1" aria-label="Dia anterior">‹</button><b>' + (day === S.today() ? 'Hoje' : U.fmtDate(day)) + '</b><button class="ghost" data-a="dt-day" data-n="1" aria-label="Próximo dia"' + (day >= S.today() ? ' disabled' : '') + '>›</button></div>' +
      '<div class="stats"><div><b>' + kc + '</b><span>kcal' + (g.kcal ? ' de ' + g.kcal : '') + '</span>' + bar(kc, g.kcal) + '</div><div><b>' + pr + ' g</b><span>proteína' + (g.prot ? ' de ' + g.prot + ' g' : '') + '</span>' + bar(pr, g.prot) + '</div>' +
      '<div><b>' + water + '</b><span>copos de água</span><div class="row" style="justify-content:center;margin-top:6px"><button class="ghost" data-a="dt-water" data-n="-1" aria-label="Menos um copo">−</button><button class="ghost" data-a="dt-water" data-n="1" aria-label="Mais um copo">+</button></div></div></div>' +
      '<div class="card"><h2>Anotar</h2><div class="chips">' + Object.entries(MEALS).map(m => '<button data-a="dt-meal" data-m="' + m[0] + '" class="' + (meal === m[0] ? 'on' : '') + '">' + m[1] + '</button>').join('') + '</div>' +
      '<datalist id="foods">' + FOODS.map(f => '<option value="' + e(f.name) + '">' + e(f.portion) + '</option>').join('') + '</datalist>' +
      '<label>O que você comeu <input id="dt-desc" list="foods" placeholder="Ex.: Arroz branco cozido — ou escreva livremente" autocomplete="off"></label><div class="muted small" id="dt-portion"></div>' +
      '<div class="pf"><label>Porções <input id="dt-qty" type="number" inputmode="decimal" min="0" step="0.5" value="1"></label><label>Calorias (opcional) <input id="dt-kcal" type="number" inputmode="numeric" min="0"></label>' +
      '<label>Proteína em g (opcional) <input id="dt-prot" type="number" inputmode="decimal" min="0" step="0.1"></label><div style="align-self:end"><button class="btn block" data-a="dt-add">Adicionar</button></div></div>' +
      '<p class="muted small">Os alimentos da lista preenchem calorias e proteína com valores aproximados por porção. Você pode corrigir ou escrever qualquer coisa.</p></div>' +
      (items.length ? Object.entries(MEALS).map(m => { const xs = items.filter(x => x.meal === m[0]); return xs.length ? '<h3>' + m[1] + '</h3><div class="list">' + xs.map(x => '<div class="list-item"><span>' + e(x.desc) + (x.qty && x.qty !== 1 ? ' <small class="muted">× ' + x.qty + '</small>' : '') + '</span><span class="row"><span class="muted small">' + (x.kcal ? Math.round(x.kcal) + ' kcal' : '') + (x.prot ? ' · ' + Math.round(x.prot) + ' g prot.' : '') + '</span><button class="link danger" data-a="dt-del" data-id="' + x.id + '" aria-label="Apagar">✕</button></span></div>').join('') + '</div>' : ''; }).join('') : '<div class="empty">Nada anotado neste dia.</div>') +
      (day !== S.today() && items.length ? '<button class="btn ghosty block" data-a="dt-copy">Repetir estas refeições hoje</button>' : '') +
      '<div class="card"><h2>Últimos 7 dias</h2><canvas id="dt-chart" class="chart" style="height:160px"></canvas><div class="legend"><span><i style="background:var(--accent)"></i>Calorias anotadas</span></div></div>' +
      '<div class="card"><h2>Minhas metas (opcional)</h2><p class="muted small">Se você já tem metas definidas por um nutricionista ou por você, anote aqui para acompanhar as barras. O app não calcula nem recomenda dieta.</p>' +
      '<div class="pf"><label>Calorias por dia <input id="dg-kcal" type="number" inputmode="numeric" min="0" value="' + (g.kcal || '') + '"></label><label>Proteína por dia (g) <input id="dg-prot" type="number" inputmode="numeric" min="0" value="' + (g.prot || '') + '"></label></div><div class="row"><button class="btn ghosty" data-a="dg-save">Salvar metas</button></div></div>' +
      '<p class="muted small">Isto é só um diário. Para um plano alimentar, procure um nutricionista — algumas UBS oferecem atendimento gratuito.</p>';
  };
  V.after.dieta = () => {
    const cv = U.$('#dt-chart'); if (!cv) return;
    const pts = []; for (let i = 6; i >= 0; i--) { const d = shift(S.today(), -i); pts.push({ x: U.fmtDate(d), y: sum(d, 'kcal') || null }); }
    U.chart(cv, [{ color: getComputedStyle(document.documentElement).getPropertyValue('--accent'), points: pts }], { zero: true });
  };
  const fill = () => {
    const f = FOODS.find(x => x.name.toLowerCase() === U.$('#dt-desc').value.trim().toLowerCase()), q = +U.$('#dt-qty').value || 1;
    U.$('#dt-portion').textContent = f ? 'Porção: ' + f.portion : '';
    if (f) { U.$('#dt-kcal').value = Math.round(f.kcal * q); U.$('#dt-prot').value = Math.round(f.prot * q * 10) / 10; }
  };
  document.addEventListener('input', ev => { if (ev.target.id === 'dt-desc' || ev.target.id === 'dt-qty') fill(); });
  A['dt-day'] = d => { day = shift(day, +d.n); if (day > S.today()) day = S.today(); APP.render(); };
  A['dt-meal'] = d => { meal = d.m; document.querySelectorAll('[data-a="dt-meal"]').forEach(b => b.classList.toggle('on', b.dataset.m === meal)); };
  A['dt-add'] = () => {
    const desc = U.$('#dt-desc').value.trim(); if (!desc) return U.toast('Escreva o que você comeu.');
    diet().push({ id: S.uid(), t: Date.now(), date: day, meal, desc, qty: +U.$('#dt-qty').value || 1, kcal: +U.$('#dt-kcal').value || 0, prot: +U.$('#dt-prot').value || 0 });
    S.save(); APP.render();
  };
  A['dt-del'] = d => { S.state.diet = diet().filter(x => x.id !== d.id); S.state.deleted.push(d.id); S.save(); APP.render(); };
  A['dt-copy'] = () => { diet().filter(x => x.date === day).forEach(x => diet().push(Object.assign({}, x, { id: S.uid(), t: Date.now(), date: S.today() }))); day = S.today(); S.save(); APP.render(); U.toast('Refeições copiadas para hoje.'); };
  A['dt-water'] = d => { const w = S.state.water = S.state.water || {}; w[day] = Math.max(0, (w[day] || 0) + +d.n); S.save(); APP.render(); };
  A['dg-save'] = () => { S.state.dietGoal = { kcal: +U.$('#dg-kcal').value || 0, prot: +U.$('#dg-prot').value || 0 }; S.save(); APP.render(); U.toast('Metas salvas.'); };
})();
