/* Lê o texto de uma foto (ficha impressa/digitada) com o Tesseract, que roda no próprio navegador: sem conta e sem custo.
   Limite conhecido: não lê letra de mão nem cartões pré-impressos com marca-d'água — para esses existe o modo "marcar na lista". */
(function () {
  const O = window.OCR = {};
  const SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  function load() {
    if (window.Tesseract) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = SRC; s.onload = ok;
      s.onerror = () => fail(new Error('não consegui baixar o leitor de imagens (precisa de internet na primeira vez)'));
      document.head.appendChild(s);
    });
  }
  // Gira (0–3 quartos de volta), ajusta o tamanho e deixa em tons de cinza com mais contraste.
  function prepare(img, rot, maxPx) {
    const k = Math.min(2.5, maxPx / Math.max(img.width, img.height)), w = Math.round(img.width * k), h = Math.round(img.height * k);
    const c = document.createElement('canvas'); c.width = rot % 2 ? h : w; c.height = rot % 2 ? w : h;
    const x = c.getContext('2d'); x.filter = 'grayscale(1) contrast(1.6) brightness(1.05)';
    x.translate(c.width / 2, c.height / 2); x.rotate(rot * Math.PI / 2); x.drawImage(img, -w / 2, -h / 2, w, h);
    return c;
  }
  const good = r => r.data.words.filter(w => w.confidence > 70 && /^[A-Za-zÀ-ÿ]{4,}$/.test(w.text)).length;
  // Devolve { text, words }: words = quantas palavras foram lidas com segurança (0–3 = praticamente nada).
  O.read = async (file, onProgress) => {
    await load();
    const say = t => onProgress && onProgress(t);
    const logger = m => say(m.status === 'recognizing text' ? 'Lendo o texto… ' + Math.round(m.progress * 100) + '%' : 'Preparando o leitor… (só demora na primeira vez)');
    const img = await createImageBitmap(file);
    let best = await window.Tesseract.recognize(prepare(img, 0, 2000), 'por', { logger }), rot = 0;
    if (good(best) < 6) { // pouca coisa lida: a foto pode estar deitada ou de cabeça para baixo
      let top = good(best);
      for (const r of [1, 3, 2]) {
        say('Testando a foto em outra posição…');
        const t = await window.Tesseract.recognize(prepare(img, r, 1500), 'por');
        if (good(t) > top + 2) { top = good(t); rot = r; }
      }
      if (rot) best = await window.Tesseract.recognize(prepare(img, rot, 2200), 'por', { logger });
    }
    return { text: best.data.text || '', words: good(best) };
  };
})();
