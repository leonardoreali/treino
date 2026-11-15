# Monta js/i18n/en.js e js/i18n/es.js a partir de:
#   tools/i18n-keys.json  (textos em português, números como #)
#   tools/i18n/*.tsv      (linhas "índice<TAB>inglês<TAB>espanhol" ou "K:texto em português<TAB>inglês<TAB>espanhol")
# Uso: python tools/i18n-build.py
import json, glob, re, sys
keys = json.load(open('tools/i18n-keys.json', encoding='utf-8'))
en, es, warn = {}, {}, []
for f in sorted(glob.glob('tools/i18n/*.tsv')):
    for n, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#!'): continue
        parts = line.split('\t')
        if len(parts) != 3: warn.append(f'{f}:{n} colunas={len(parts)}'); continue
        k, a, b = parts
        if k.startswith('K:'): key = k[2:]
        else:
            try: key = keys[int(k)]
            except Exception: warn.append(f'{f}:{n} índice inválido {k}'); continue
        for lang, val in (('en', a), ('es', b)):
            if val.count('#') != key.count('#'): warn.append(f'{f}:{n} [{lang}] quantidade de # diferente: {key!r} -> {val!r}')
        en[key] = a; es[key] = b
for lang, d in (('en', en), ('es', es)):
    name = {'en': 'Dicionário inglês', 'es': 'Diccionario español'}[lang]
    open(f'js/i18n/{lang}.js', 'w', encoding='utf-8', newline='\n').write(
        f'/* {name}: gerado por tools/i18n-build.py — edite os arquivos tools/i18n/*.tsv e rode o script de novo. */\n'
        f'(window.I18N_DICT = window.I18N_DICT || {{}}).{lang} = ' + json.dumps(d, ensure_ascii=False, indent=0) + ';\n')
print('en', len(en), 'es', len(es))
for w in warn: print('AVISO', w)
