# Treino — app de calistenia

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
| Adicionar/editar exercícios da biblioteca | `js/data/exercises.js` (uma linha por exercício) |
| Trocar o vídeo padrão de um exercício | `js/data/videos.js` (ou, mais fácil, o botão **Trocar vídeo** dentro do app) |
| Editar árvores de habilidade ou o programa inicial | `js/data/program.js` |
| Buscar vídeos para exercícios novos | `node tools/buscar-videos.js` |
| Mudar cores | topo de `css/style.css` |

Depois de alterar arquivos, publique de novo (`git add -A`, `git commit -m "atualiza"`, `git push`) e aumente o `VERSION` em `sw.js`.

## Perfil, gerador, professor e compartilhamento

- **Perfil → Gerar meu treino**: monta um programa por regras (objetivo, nível, dias, tempo, local, equipamentos, limitações). As regras ficam em `js/generator.js`.
- **Academia**: exercícios com carga em `js/data/gym.js`; o treino registra kg por série.
- **Compartilhar**: Programa → Compartilhar gera um link com o treino inteiro dentro (sem servidor) para mandar pelo WhatsApp.
- **Modo profissional**: Perfil → "Sou profissional de educação física" libera fichas de alunos, avaliações físicas, treinos por aluno e relatórios recebidos.
