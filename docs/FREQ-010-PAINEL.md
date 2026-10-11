# FREQ-010 — Painel em tempo real

## Contrato e origem dos dados

`GET /painel/resumo` requer JWT de professor. O projeto não possui vínculo entre professor e turma; portanto o escopo autorizado atual abrange todas as turmas. Um escopo por turma depende de modelo de vínculo e não é inferido de filtros do cliente.

- `checkinsHoje`: `count` de `Presenca` com `status = presente`, `data >= inicio` e `data < fim`. O período é o dia civil de `America/Manaus` (UTC−04:00). Faltas e justificadas ficam fora da contagem.
- `totalAlunos`: `Aluno.count()`.
- `totalRisco` e `alunosRisco`: últimos três registros de cada aluno, ordenados por `data` e `id` decrescentes, todos com `status = falta`. É a regra já usada por `/checkin/risco`.
- `ranking`: soma de `Aluno.pontos` por turma, como `/turmas/ranking`; inclui `totalAlunos`.
- `feed`: últimas 20 presenças confirmadas, ordenadas por `data` e `id` decrescentes. Uma edição para falta ou justificada remove o registro no próximo snapshot. O feed não representa o total diário.

O DTO do feed contém `id`, `data`, `status`, `alunoId`, `turmaId`, `identificacao` e `turma`. O risco contém `id`, `identificacao` e `turma`. `identificacao` é o apelido, ou as iniciais dos dois primeiros termos do nome. Nenhum DTO do painel contém senha, matrícula, UID NFC ou nome completo.

O Socket exige JWT de professor em `auth.token`, na mesma origem de `VITE_API_URL`. `presenca:nova` e `presenca:editada` contêm `{ id, alunoId, turmaId, status, data }` persistidos, sem pontos. `chamada:encerrada` conserva `{ turmaId, faltasRegistradas, mensagem }`. Os eventos sinalizam uma nova consulta HTTP, agrupada em 100 ms; não são somados a contadores locais. Ao conectar ou reconectar, o painel consulta de novo. Cada montagem possui seus próprios handlers e conexão; requisições anteriores são canceladas para evitar sobrescrita. Uma resposta vazia substitui a anterior; erro exibe aviso e tentativa manual.

## Validação local

1. Use apenas PostgreSQL local de teste. Confira `DATABASE_URL` antes de migração ou seed. Prepare-o conforme `docs/DEVELOPMENT.md`. Nunca rode esses comandos no Render.
2. Em `backend`, execute `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run seed`, `npm run build` e `npm test`. Em `dashboard`, execute `npm ci`, `npm run lint`, `npm run build` e `npm run dev`. Em `mobile`, execute `npm ci` e `npm run typecheck`.
3. Entre como professor no navegador e abra `/dashboard`. Compare cards e feed com `GET /painel/resumo` usando o mesmo JWT. Com banco vazio, confira zeros e listas vazias. Desligue a API, veja erro e use **Tentar novamente** após religá-la.
4. Entre no app do professor com `EXPO_PUBLIC_API_URL` apontando para o backend local. Registre presença com tag de teste cadastrada. Confira atualização do painel sem reload; repita um evento com o mesmo `id` e confirme um único item. O app do aluno permanece somente leitura.
5. Encerre a chamada por `POST /checkin/encerrar` e edite uma presença por `PUT /presencas/:id`; confira risco, ranking e remoção do feed ao mudar `status` para `falta`. Desconecte o navegador, registre outra presença e reconecte: confira recuperação sem duplicatas. Monte/desmonte a tela repetidamente e inspecione handlers/conexões.
6. Confira apelidos/iniciais e ausência de dados sensíveis no Network/Socket. Verifique a tela em 1440, 768, 360 e 320 px, inclusive ausência de rolagem horizontal.

A validação visual e o fluxo com app/tag física exigem execução manual em navegador/dispositivo. Não são cobertos pela suíte automatizada.

## Evidência local de 10/10/2026

Execução em PostgreSQL 17 temporário, com dados em memória e porta local 5433; API desta branch na 3334 e Vite na 5174. As portas 3333 e 5173 pertenciam a outro checkout. O volume persistente do Compose não foi usado.

- `npm run lint` e `npm run build` do dashboard passaram; geração Prisma, build e suíte completa do backend passaram (7 suítes, 30 testes).
- Chrome 155 headless: com seed, painel exibiu 0 check-ins, 0 alunos em risco e 1 aluno; o feed estava vazio. A resposta coincidiu com `GET /painel/resumo`.
- O `POST /checkin` usado em `mobile/src/screens/CheckinScreen.tsx`, com JWT de professor e tag de teste, atualizou card, feed e ranking sem reload. Duas edições do mesmo ID não duplicaram o feed. A correção para `falta` removeu o item e reduziu o total; a volta para `presente` recuperou ambos.
- Após duas faltas anteriores de um segundo aluno, `POST /checkin/encerrar` criou a terceira; risco e total cadastrado atualizaram após o evento. O painel mostrou apenas o apelido `TP`.
- Com o navegador offline, outra presença foi registrada pelo endpoint autorizado. Ao reconectar, card e feed recuperaram o registro sem duplicação. Bloquear a consulta HTTP mostrou erro e o botão **Tentar novamente** recuperou os dados. Três ciclos de sair e voltar ao painel terminaram com um feed consistente e uma conexão ativa por montagem.
- Chrome em 1440, 768, 360 e 320 px: cards legíveis e sem rolagem horizontal após a correção de `body.min-width`. O teste comparou `scrollWidth` com `clientWidth` e as capturas foram inspecionadas visualmente.

Não havia dispositivo ou emulador Android no ADB. O mesmo endpoint usado pelo app do professor foi exercitado por outro cliente autorizado; a interface nativa e a leitura NFC física ainda exigem validação em dispositivo. O banco temporário pode ser descartado sem afetar dados persistentes.
