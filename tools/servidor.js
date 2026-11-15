// Servidor local simples para abrir o app no PC:  node tools/servidor.js  → http://localhost:8642
// Também recebe (só de localhost) a lista de textos sem tradução coletada pelo app: POST /__i18n-keys → tools/i18n-keys.json
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), port = process.env.PORT || 8642;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__i18n-keys') {
    let body = ''; req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try { const keys = JSON.parse(body); if (!Array.isArray(keys)) throw 0; fs.writeFileSync(path.join(__dirname, 'i18n-keys.json'), JSON.stringify(keys, null, 0).replace(/","/g, '",\n"')); res.writeHead(200); res.end('ok ' + keys.length); }
      catch (e) { res.writeHead(400); res.end('erro'); }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('não encontrado'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('App em http://localhost:' + port));
