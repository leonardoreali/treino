# Nina Calisthenics — app de treino

O nome é uma homenagem à Nina, a salsicha do criador do app. 🐾

App de treino que roda no navegador (PC e Android), sem servidor e sem mensalidade. Os dados ficam no próprio aparelho e, se você ligar a sincronização, num Gist privado da sua conta do GitHub.

## Abrir no PC

- **Pelo endereço publicado** (GitHub Pages): é o jeito recomendado, igual ao celular.
- **Sem internet / local**: dê dois cliques em `Abrir Treino.bat` (precisa do Node.js, que já está instalado). Ele abre `http://localhost:8642`.

Abrir o `index.html` direto com dois cliques também funciona, mas os vídeos abrem no YouTube em vez de tocar dentro do app.

## Instalar no Android

Abra o endereço publicado no Chrome → menu ⋮ → **Adicionar à tela inicial / Instalar app**. Depois da primeira vez ele abre sem internet (só os vídeos precisam de conexão).

## Sincronizar PC ↔ celular

Em **Ajustes → Sincronização** há o passo a passo: você cria um token do GitHub só com a permissão `gist` e cola o mesmo token nos dois aparelhos. Sem isso, use **Backup manual** para levar os dados de um aparelho ao outro.

## Novo treino por PDF

**Programa → Importar PDF.** O app lê as tabelas "séries × reps" e abre um editor para você revisar antes de salvar. Se o PDF não for lido direito, use **Colar texto/JSON de um chat**: o app mostra um pedido pronto para colar em qualquer chat gratuito junto com o PDF.

## Onde mexer (sem programar muito)

| Quero… | Arquivo |
| --- | --- |
| Adicionar/editar exercícios da biblioteca | `js/data/exercises.js`, `gym.js`, `more.js` e `more2.js` (uma linha por exercício; traduções em `tools/i18n/tr-5.tsv` e `tr-6.tsv`) |
| Trocar o vídeo padrão de um exercício | `js/data/videos.js` (ou, mais fácil, o botão **Trocar vídeo** dentro do app) |
| Editar árvores de habilidade ou o programa inicial | `js/data/program.js` |
| Padrão de movimento, região (mobilidade), unilateral e "exige supervisão" | `js/data/meta.js` (listas de ids no começo; exercícios com supervisão nunca entram em treinos automáticos) |
| Etapas novas nas árvores de habilidade | `js/data/more2.js` (`plan(...)` registra a posição para o app ajustar o passo de quem já treinava) |
| Buscar vídeos que ensinam (tutoriais) para exercícios novos | `node tools/buscar-videos.js` (`--todos` refaz todos) |
| Mudar cores | topo de `css/style.css` |

Depois de alterar arquivos, publique de novo (`git add -A`, `git commit -m "atualiza"`, `git push`) e aumente o `VERSION` em `sw.js`.

## Perfil, gerador, professor e compartilhamento

- **Perfil → Gerar meu treino**: monta um programa por regras (objetivo, nível, dias, tempo, local, equipamentos, limitações). As regras ficam em `js/generator.js`.
- **Academia**: exercícios com carga em `js/data/gym.js`; o treino registra kg por série.
- **Compartilhar**: Programa → Compartilhar gera um link com o treino inteiro dentro (sem servidor) para mandar pelo WhatsApp.
- **Modo profissional**: Perfil → "Sou profissional de educação física" libera fichas de alunos, avaliações físicas, treinos por aluno e relatórios recebidos.

## Visual, PDF, primeira vez e diário alimentar

- **Cores e estilo**: topo de `css/style.css`. Tela Hoje, nível/XP e questionário de primeira vez: `js/theme.js`.
- **PDF do treino**: Programa → Compartilhar → Enviar em PDF (`js/share.js`). O PDF leva um link que importa o treino completo.
- **Diário alimentar**: `js/diet.js` (a tabela de alimentos fica no começo do arquivo; os valores são aproximados).

## Adaptação automática

As regras ficam em `js/adapt.js`: pergunta antes do treino (bem, cansado, dor ou lesão), avaliação depois (fácil, na medida, pesado, dor) e o que muda no treino seguinte. As listas de exercícios evitados por região do corpo ficam em `js/generator.js` (`AVOID`).

## Rastreio de evolução

`js/progress.js`: mede cada exercício por treino (força estimada com carga, média por série sem carga), marca recordes, detecta estagnação (3 treinos sem recorde → recuo de 10% ou ritmo lento), promove sozinho para a próxima variação (topo da faixa em 2 treinos seguidos) e trata tempo parado (7 dias: mais leve; 14 dias: 2 treinos de recondicionamento; 30 dias: exige treino novo).

## Saúde e lesões

`js/health.js`: condições registradas pela pessoa (dor temporária, lesão/fratura/cirurgia com fases de proteção, retorno e fortalecimento, ou condição crônica), com regras gerais por região quando não há diagnóstico e regras específicas quando há. Cada treino é adaptado na hora de começar; a dor é registrada a cada treino; orientações do profissional (texto, exercícios proibidos e carga máxima) valem para todos os treinos. As listas ficam no começo do arquivo (`SPEC`, `CHRONIC`, `FLAG_EX`).

## Sincronização, backup e atualizações (versão 13)

- **Sincronização** (`js/store.js`): mesclagem em três vias (aparelho × nuvem × última versão comum), campo a campo. Mudanças em campos diferentes nos dois aparelhos ficam todas; no mesmo campo, fica a mais recente e o app avisa. Um contador de versão (`rev`) detecta gravações simultâneas e refaz a mesclagem. A fila de treino nunca volta para trás. No primeiro contato de um aparelho novo, a nuvem prevalece.
- **Backup**: formato `treino-backup` versão 2 (o antigo continua sendo aceito). Restaurar valida o arquivo, descarta registros com defeito e guarda uma cópia do estado anterior (dá para voltar em Ajustes). Uma cópia de segurança dos dados válidos é atualizada a cada minuto e usada automaticamente se os dados do aparelho corromperem.
- **Atualizações**: `sw.js` guarda cada versão inteira e só troca quando a pessoa toca em "Atualizar" (nunca durante um treino). **Ao publicar mudanças, aumente `VERSION` em `sw.js`** (a lista de arquivos é a dos `<script>` de `index.html` mais CSS, ícones e manifesto). Em `localhost` o service worker fica desligado; use `?sw=1` para testar.
- **Regras de saúde**: origem, versão e revisão ficam em `HEALTH.RULES_INFO` (`js/health.js`).

## Idiomas (português, inglês, espanhol)

O app é escrito em português; `js/i18n.js` traduz o que aparece na tela usando `js/i18n/en.js` e `js/i18n/es.js`. Esses dois arquivos são **gerados**: edite `tools/i18n/*.tsv` (cada linha: `índice<TAB>inglês<TAB>espanhol`, onde o índice é a posição em `tools/i18n-keys.json`, ou `K:texto em português<TAB>inglês<TAB>espanhol`) e rode `python tools/i18n-build.py`. Números viram `#` nas chaves. Frases compostas são traduzidas por partes (frases, separadores como · — : e listas), então basta traduzir cada pedaço.

Para achar textos sem tradução: abra o app em inglês no navegador, digite no console `I18N.collect = true`, use as telas e depois veja `I18N.missing`. O seletor de idioma fica na primeira tela e em Perfil → Ajustes.

Ainda ficam em português: o PDF de treino gerado para compartilhar e os nomes/observações escritos pelo próprio usuário ou professor.

## Mobilidade e flexibilidade (versão 18)

- **Modalidades** (`js/data/mobility.js`): flexibilidade estática e PNF, mobilidade articular ativa e controlada, e flexibilidade ativa/força em amplitude final. Cada exercício de mobilidade ou flexibilidade tem dose recomendada (`dose`) e, quando há risco, um alerta (`warn`).
- **Gerador** (`js/mobility.js`): o aquecimento usa só mobilidade ativa das articulações que a sessão mais exige (pelos padrões de movimento e habilidades: parada de mão → punhos, ombros e coluna; pistol → tornozelos, quadril e posterior etc.). A volta à calma usa alongamento estático dessas regiões e, em treino de habilidades, um exercício de força em amplitude final. Limitações cadastradas tiram os alongamentos que forçam a região (`AVOID_MOB`).
- **Rotinas avulsas**: tela Hoje → "Mobilidade e alongamento" (ou Biblioteca → Mobilidade/Flexibilidade). Mobilidade (5–10 min), flexibilidade (10–20 min) ou sessão completa (20–30 min), com foco no corpo todo, numa região, nas habilidades ou no treino do dia. Não contam como treino da fila.
- **Saúde × mobilidade** (versão 20, `js/health.js` → `HEALTH.mobReason`): condições da tela Saúde valem também para aquecimento, alongamento e rotinas avulsas. Região em proteção (ou dor ≥ 6): nada de mobilidade nela, só com orientação do profissional. Retorno ou dor moderada: só movimentos leves (`gentle`). Fortalecimento: sem os mais intensos. Sem liberação médica: sem força em amplitude final.
- **Tempo**: o gerador conta aquecimento e alongamento dentro do tempo escolhido no perfil e ajusta descanso, alongamento, exercícios, séries e cardio extra para caber.
- **Articulações** (versão 21, `js/data/joints.js`): cada exercício tem `joints` (punho, cotovelo, ombro, pescoço, coluna, quadril, joelho, tornozelo), calculado pelo padrão de movimento, região, categoria e posição descrita no "como fazer". Exercícios novos (inclusive os criados pelo usuário) já saem classificados. Lesão em proteção tira tudo que exige aquela articulação, inclusive força.
- **Sem liberação médica** (cardiopatia, gestação etc.): rotinas avulsas só na versão leve (nível 1, sem força em amplitude final, ~10 min), com aviso antes de começar.
- **Revisão das regras de saúde**: ainda pendente. `HEALTH.RULES_INFO` diz isso e o aviso aparece em todo treino adaptado. Para revisar, peça a um médico, fisioterapeuta ou profissional de educação física que leia `SPEC`, `CHRONIC`, `FLAG_EX`, `AVOID_MOB`, `MOB_EX` e as fases em `js/health.js`; depois atualize `RULES_INFO.revisao`.
- **Revisar articulações** (versão 22): `node tools/auditar-articulacoes.js [categoria]` lista as articulações de cada exercício. O cálculo soma padrão, região, categoria, texto, **equipamento** (o que se segura ou de onde se pendura carrega punho, cotovelo e ombro) e metadados por exercício (`EXTRA` em `js/data/joints.js`) para o que as regras gerais não representam bem.
- **Teste automático** (versão 23): `node tools/testar-dados.js` confere ids, instruções, vídeos, articulações coerentes com categoria/padrão/equipamento/região, modalidade e dose da mobilidade, progressões (sem cair de nível), árvores de habilidade e se um exercício criado pelo usuário sem nada preenchido ainda sai com articulações. Rode antes de publicar; ele termina com erro se algo falhar.
- **Exercícios criados pelo usuário**: o formulário tem as articulações exigidas; o app soma sempre a reserva conservadora da categoria.
- **Versão 24**: no formulário de exercício próprio as articulações são obrigatórias, já vêm sugeridas (categoria, padrão, equipamento, nome e descrição) e é preciso marcar "Conferi". Exercícios próprios antigos, sem essa escolha, contam como se exigissem todas as articulações. O teste usa `hasAll` (todas as obrigatórias) e `hasAny`, e tem 15 casos de exercícios personalizados (apoio nas mãos, prancha, de quatro, ajoelhado, pendurado, mini elástico, barra, equipamento próprio, cabeça no chão, saltos).
