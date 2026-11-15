# Junta à lista de textos (tools/i18n-keys.json) mensagens que só aparecem em situações raras:
# avisos (U.toast), confirmações, erros de sincronização e as instruções de instalação de cada aparelho.
# Uso: python tools/i18n-extrair.py   (depois traduza as linhas novas em tools/i18n-en.txt e tools/i18n-es.txt)
import json, re, glob
keys = json.load(open('tools/i18n-keys.json', encoding='utf-8'))
have = set(keys)
NUM = re.compile(r'\d+(?:[.,]\d+)?')
def norm(t): return NUM.sub('#', re.sub(r'\s+', ' ', t).strip())
new = []
def add(t):
    for frag in re.split(r'<[^>]+>', t):
        k = norm(frag.replace("\\'", "'"))
        if len(k) > 2 and re.search(r'[A-Za-zÀ-ÿ]{3}', k) and k not in have and not re.match(r'^[a-z0-9_.#-]+$', k):
            have.add(k); new.append(k)
src = {f.replace('\\', '/'): open(f, encoding='utf-8').read() for f in glob.glob('js/*.js')}
STR = r"'((?:[^'\\]|\\.)*)'"
call = re.compile(r"(?:U\.toast|confirm|prompt|setStatus|new Error|msgs\.push|out\.push|notes\.push)\(\s*" + STR)
for f, s in src.items():
    for m in call.finditer(s): add(m.group(1))
for m in re.finditer(STR, src['js/install.js']): add(m.group(1))
keys += new
json.dump(keys, open('tools/i18n-keys.json', 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=0)
print('adicionados', len(new), 'total', len(keys))
