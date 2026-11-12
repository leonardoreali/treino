// Gera icons/icon-192.png e icon-512.png (barra fixa + boneco) sem dependências.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };

function icon(N) {
  const px = Buffer.alloc(N * N * 3);
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) { const i = (y * N + x) * 3; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; } };
  const BG = [15, 17, 21], OR = [255, 122, 26], WH = [236, 238, 242];
  for (let i = 0; i < N * N; i++) set(i % N, (i / N) | 0, BG);
  const u = N / 100;
  const rect = (x, y, w, h, c) => { for (let j = Math.round(y * u); j < Math.round((y + h) * u); j++) for (let i = Math.round(x * u); i < Math.round((x + w) * u); i++) set(i, j, c); };
  const circ = (cx, cy, r, c) => { for (let j = Math.floor((cy - r) * u); j <= (cy + r) * u; j++) for (let i = Math.floor((cx - r) * u); i <= (cx + r) * u; i++) if ((i - cx * u) ** 2 + (j - cy * u) ** 2 <= (r * u) ** 2) set(i, j, c); };
  rect(22, 26, 56, 5, OR);             // barra
  rect(22, 26, 5, 14, OR); rect(73, 26, 5, 14, OR); // suportes
  rect(36, 31, 5, 18, WH); rect(59, 31, 5, 18, WH); // braços
  circ(50, 40, 7.5, WH);               // cabeça
  rect(38, 48, 24, 20, WH);            // tronco
  rect(40, 68, 8, 12, WH); rect(52, 68, 8, 12, WH); // pernas
  const raw = Buffer.alloc(N * (N * 3 + 1));
  for (let y = 0; y < N; y++) px.copy(raw, y * (N * 3 + 1) + 1, y * N * 3, (y + 1) * N * 3);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });
for (const n of [192, 512]) fs.writeFileSync(path.join(dir, 'icon-' + n + '.png'), icon(n));
console.log('ícones gerados');
