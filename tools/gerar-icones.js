// Gera icons/icon-192.png e icon-512.png sem dependências: a Nina, salsicha preta e marrom.
// Desenho em grade de 100×100, com suavização (4×4 amostras por pixel). Tudo dentro da área segura (80% central).
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };

// Nina: salsicha preta e marrom (black and tan) sobre o verde-limão do app.
const BG = [200, 245, 60], DOG = [28, 24, 22], BACK = [16, 14, 13], TAN = [181, 112, 47], COLLAR = [224, 69, 58], EYE = [8, 6, 5], SHINE = [245, 240, 230], NOSE = [10, 8, 7], GROUND = [16, 18, 10];
const ell = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const rect = (x0, y0, w, h, r = 0) => (x, y) => { if (x < x0 || y < y0 || x > x0 + w || y > y0 + h) return false; if (!r) return true; const dx = Math.max(x0 + r - x, 0, x - (x0 + w - r)), dy = Math.max(y0 + r - y, 0, y - (y0 + h - r)); return dx * dx + dy * dy <= r * r; };
const seg = (x1, y1, x2, y2, w) => (x, y) => { const vx = x2 - x1, vy = y2 - y1, t = Math.max(0, Math.min(1, ((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy))); return (x - x1 - t * vx) ** 2 + (y - y1 - t * vy) ** 2 <= (w / 2) ** 2; };
const and = (f, g) => (x, y) => f(x, y) && g(x, y);
// camadas, de trás para a frente
const layers = [
  [seg(16, 52, 9, 38, 4.5), DOG],                                   // rabo
  [rect(23, 58, 7, 12, 3), BACK], [rect(62, 58, 7, 12, 3), BACK],    // patas de trás
  [and(rect(23, 66, 7, 4, 2), () => true), TAN], [rect(62, 66, 7, 4, 2), TAN], // pezinhos marrons de trás
  [ell(46, 53, 30, 11.5), DOG],                                     // corpo comprido
  [rect(30, 58, 7, 13, 3), DOG], [rect(69, 58, 7, 13, 3), DOG],     // patas da frente
  [rect(30, 66, 7, 5, 2.5), TAN], [rect(69, 66, 7, 5, 2.5), TAN],   // pezinhos marrons da frente
  [and(ell(70, 55, 7, 6), ell(46, 53, 30, 11.5)), TAN],             // peito marrom
  [seg(70, 48, 76, 38, 11), DOG],                                   // pescoço
  [ell(79, 35, 10, 9), DOG],                                        // cabeça
  [ell(90, 38, 8, 5), TAN],                                         // focinho marrom
  [and(ell(84, 41, 6, 4), ell(79, 35, 10, 9)), TAN],                // bochecha marrom
  [ell(83, 29, 1.8, 1.3), TAN],                                     // "sobrancelha" marrom
  [seg(67, 47, 75, 40, 3.2), COLLAR],                               // coleira
  [ell(73, 41, 4.5, 9), BACK],                                      // orelha caída
  [ell(97, 37.5, 2.2, 2), NOSE],                                    // nariz
  [ell(82, 32.8, 1.7, 1.9), EYE], [ell(82.5, 32.2, 0.55, 0.55), SHINE], // olho com brilho
  [rect(14, 72, 72, 3, 1.5), GROUND],                               // chão
];
function icon(N) {
  const raw = Buffer.alloc(N * (N * 3 + 1)), S = 4;
  for (let j = 0; j < N; j++) {
    raw[j * (N * 3 + 1)] = 0;
    for (let i = 0; i < N; i++) {
      const acc = [0, 0, 0];
      for (let sj = 0; sj < S; sj++) for (let si = 0; si < S; si++) {
        // 0,9 de escala e deslocamento para ficar dentro da área segura dos ícones "maskable"
        const x = ((i + (si + 0.5) / S) / N * 100 - 50) / 0.9 + 52, y = ((j + (sj + 0.5) / S) / N * 100 - 50) / 0.9 + 50;
        let c = BG; for (const [f, col] of layers) if (f(x, y)) c = col;
        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2];
      }
      const o = j * (N * 3 + 1) + 1 + i * 3;
      raw[o] = Math.round(acc[0] / (S * S)); raw[o + 1] = Math.round(acc[1] / (S * S)); raw[o + 2] = Math.round(acc[2] / (S * S));
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });
for (const n of [192, 512]) fs.writeFileSync(path.join(dir, 'icon-' + n + '.png'), icon(n));
console.log('ícones gerados');
