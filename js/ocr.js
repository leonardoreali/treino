/* Lê o texto de uma foto (ficha de treino) com o Tesseract, que roda no próprio navegador: sem conta e sem custo. */
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
  // Aumenta fotos pequenas e deixa em tons de cinza com mais contraste: ajuda bastante a leitura.
  async function prepare(file) {
    const img = await createImageBitmap(file), k = Math.min(2.5, Math.max(1, 1800 / Math.max(img.width, img.height)));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const x = c.getContext('2d'); x.filter = 'grayscale(1) contrast(1.4)'; x.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  O.read = async (file, onProgress) => {
    await load();
    let src = file; try { src = await prepare(file); } catch (e) {}
    const r = await window.Tesseract.recognize(src, 'por', { logger: m => { if (onProgress && m.status === 'recognizing text') onProgress(Math.round(m.progress * 100)); } });
    return r.data.text || '';
  };
})();
