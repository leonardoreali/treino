/* Idiomas: português (original), inglês e espanhol.
   O app é escrito em português; esta camada traduz o que aparece na tela (telas, janelas, avisos, botões,
   textos de ajuda) usando os dicionários de js/i18n/en.js e js/i18n/es.js.
   Como funciona: cada trecho de texto vira uma chave com os números trocados por "#" (ex.: "Volta # de #"),
   e nomes de exercícios trocados por "@" quando a frase inteira não estiver no dicionário.
   Para traduzir um texto novo: acrescente a frase em português (com "#" no lugar dos números) nos dois dicionários. */
(function () {
  const I = window.I18N = {};
  const DICT = window.I18N_DICT = window.I18N_DICT || {};
  I.LANGS = { pt: 'Português', en: 'English', es: 'Español' };
  const guess = () => { const l = (navigator.language || 'pt').toLowerCase(); return l.startsWith('pt') ? 'pt' : l.startsWith('es') ? 'es' : 'en'; };
  I.lang = (S.cfg.lang && I.LANGS[S.cfg.lang]) ? S.cfg.lang : guess();
  I.missing = new Set(); I.collect = false;
  I.locale = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[I.lang];
  const norm = t => t.replace(/\s+/g, ' ').trim();
  const NUM = /\d+(?:[.,]\d+)?/g;
  let exNames = null;
  const exList = () => exNames || (exNames = (window.EXERCISES || []).map(x => x.name).filter(n => n && n.length > 2).sort((a, b) => b.length - a.length));
  const fill = (tpl, nums) => { let k = 0; return tpl.replace(/#/g, () => nums[k++] != null ? nums[k - 1] : '#'); };
  // Traduz um texto solto (chave em português). Devolve o original se não houver tradução.
  I.tr = (text, level) => {
    if (I.lang === 'pt' || text == null) return text;
    level = level || 0;
    const raw = String(text), t = norm(raw); if (!t || !/[A-Za-zÀ-ÖØ-öø-ÿ]{2}/.test(t)) return text;
    const d = DICT[I.lang] || {};
    // procura com e sem o ponto final (frases no meio de um parágrafo perdem o ponto ao serem separadas)
    const look = k => d[k] != null ? d[k] : k.endsWith('.') ? (d[k.slice(0, -1)] != null ? d[k.slice(0, -1)] + '.' : null) : (d[k + '.'] != null ? d[k + '.'].replace(/\.$/, '') : null);
    if (look(t) != null) return keepSpace(raw, look(t));
    const nums = t.match(NUM) || [], key = t.replace(NUM, '#');
    if (look(key) != null) return keepSpace(raw, fill(look(key), nums));
    // nomes de exercícios dentro da frase
    const found = []; let k2 = key;
    for (const n of exList()) { if (k2.includes(n)) { k2 = k2.split(n).join('@'); found.push(n); } if (found.length > 3) break; }
    if (found.length) {
      const order = []; key.replace(new RegExp(found.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g'), m => order.push(m));
      if (look(k2) != null) { let i = 0; return keepSpace(raw, fill(look(k2), nums).replace(/@/g, () => I.tr(order[i++]) || "")); }
    }
    // frases dinâmicas com nomes (regras com expressão regular)
    for (const [re, out] of RULES) { const m = t.match(re); if (m && out[I.lang]) return keepSpace(raw, out[I.lang].replace(/\$(\d)/g, (_, g) => I.tr(m[+g]) || m[+g])); }
    // símbolo no começo (— ● · ⚠ ✓ ✗ ▶ …): traduz o resto
    const pm = t.match(/^([—●·•⚠✓✗▶◀↑↺⬆⬇✔]\s*)(.+)$/);
    if (pm) { const o = I.tr(pm[2], level); if (o !== pm[2]) return keepSpace(raw, pm[1] + o); }
    // frase composta: quebra em níveis (frases → blocos → rótulo: valor → listas) e traduz cada pedaço
    for (let lv = level; lv < SEPS.length; lv++) {
      if (!SEPS[lv].test(t)) continue;
      let changed = false;
      const parts = t.split(SEPS[lv]).map((p, i) => { if (i % 2 || !p) return p; const o = I.tr(p, lv + 1); if (o !== p) changed = true; return o; });
      if (changed) return keepSpace(raw, parts.join(''));
      break;
    }
    if (I.collect && level === 0) I.missing.add(key);
    return text;
  };
  const SEPS = [/(\. (?=[A-ZÀ-Ý#]))/, /( · | — | → |; )/, /(: )/, /(, | \/ | \+ | – )/];
  const RULES = [
    [/^Treino do grupo (.+)$/, { en: '$1 workout', es: 'Entrenamiento de $1' }],
    [/^Bora, (.+)!$/, { en: "Let's go, $1!", es: '¡Vamos, $1!' }],
    [/^Na ficha de (.+)$/, { en: "In $1's file", es: 'En la ficha de $1' }],
    [/^Relatório de (.+)$/, { en: 'Report from $1', es: 'Informe de $1' }],
    [/^Para: (.+)$/, { en: 'For: $1', es: 'Para: $1' }],
    [/^Treino de (Dom|Seg|Ter|Qua|Qui|Sex|Sáb)$/, { en: '$1 workout', es: 'Entrenamiento del $1' }],
    [/^Trocar (.+)$/, { en: 'Replace $1', es: 'Cambiar $1' }],
    [/^Escolher vídeo — (.+)$/, { en: 'Choose video — $1', es: 'Elegir video — $1' }],
  ];
  const keepSpace = (raw, out) => (raw.match(/^\s*/)[0]) + out + (raw.match(/\s*$/)[0]);

  // ---------- tradução da tela ----------
  const ATTRS = ['placeholder', 'aria-label', 'title'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
  const done = new WeakMap(); // nó → texto já traduzido (evita traduzir de novo o que nós mesmos mudamos)
  function trNode(n) {
    if (n.nodeType === 3) {
      const p = n.parentNode; if (!p || SKIP.has(p.nodeName) || p.closest && p.closest('[data-notr]')) return;
      if (done.get(n) === n.nodeValue) return;
      const out = I.tr(n.nodeValue); if (out !== n.nodeValue) n.nodeValue = out; done.set(n, n.nodeValue);
    } else if (n.nodeType === 1) {
      if (SKIP.has(n.nodeName) || n.hasAttribute('data-notr')) return;
      for (const a of ATTRS) { const v = n.getAttribute(a); if (v && n.getAttribute('data-tr-' + a) !== v) { const o = I.tr(v); n.setAttribute(a, o); n.setAttribute('data-tr-' + a, o); } }
      if (n.nodeName === 'INPUT' && (n.type === 'button' || n.type === 'submit') && n.value) n.value = I.tr(n.value);
      for (const c of n.childNodes) trNode(c);
    }
  }
  I.apply = (root) => { if (I.lang === 'pt') return; trNode(root || document.body); document.title = I.tr(document.title.replace(/^.*$/, 'Nina Calisthenics')); };
  let mo = null;
  I.start = () => {
    document.documentElement.lang = I.lang === 'pt' ? 'pt-BR' : I.lang;
    if (mo) mo.disconnect();
    if (I.lang === 'pt') return;
    I.apply();
    mo = new MutationObserver(list => { for (const m of list) { if (m.type === 'characterData') trNode(m.target); else if (m.type === 'attributes') trNode(m.target); else m.addedNodes.forEach(trNode); } });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };
  // janelas do navegador (confirmar, digitar)
  const c0 = window.confirm.bind(window), p0 = window.prompt.bind(window), a0 = window.alert.bind(window);
  window.confirm = m => c0(I.tr(m)); window.prompt = (m, d) => p0(I.tr(m), d); window.alert = m => a0(I.tr(m));
  I.set = lang => { if (!I.LANGS[lang]) return; S.cfg.lang = lang; S.saveCfg(); location.reload(); };
  A['lang'] = d => I.set(d.l);
  // seletor (usado na primeira tela e em Ajustes)
  I.picker = () => '<div class="chips lang-pick" role="group" aria-label="Idioma / Language" data-notr>' + Object.entries(I.LANGS).map(([k, v]) => '<button data-a="lang" data-l="' + k + '" class="' + (I.lang === k ? 'on' : '') + '" aria-pressed="' + (I.lang === k) + '">' + { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' }[k] + ' ' + v + '</button>').join('') + '</div>';
})();
