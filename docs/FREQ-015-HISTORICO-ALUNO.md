# FREQ-015 — Histórico e resumo de frequência do aluno

## Objetivo

Exibir somente o histórico do aluno autenticado, sem dados demonstrativos e
sem permitir que o aplicativo escolha o identificador do aluno consultado.

## Decisões de segurança

- O aplicativo chama `GET /alunos/me/presencas`.
- O backend obtém `alunoId` do token JWT (`req.user.id`).
- A rota não recebe `alunoId` por URL, corpo ou query string.
- Apenas tokens com papel `aluno` acessam a rota.
- Tokens de aluno não podem mais usar `GET /checkin` ou `GET /presencas`, que
  listam dados globais e ficam restritos ao professor.

Essa estratégia evita IDOR: alterar um ID no aplicativo não revela os dados de
outro aluno.

## Contrato da API

```http
GET /alunos/me/presencas?periodo=30
Authorization: Bearer TOKEN_DO_ALUNO
```

Períodos aceitos: `7`, `30`, `90` e `todos`.

Exemplo resumido de resposta:

```json
{
  "periodo": {
    "valor": "30",
    "inicio": "2026-08-22T04:00:00.000Z",
    "fim": "2026-09-20T23:00:00.000Z",
    "fusoHorario": "America/Manaus"
  },
  "resumo": {
    "total": 3,
    "presentes": 1,
    "faltas": 1,
    "justificadas": 1,
    "percentualFrequencia": 67
  },
  "presencas": []
}
```

## Regra do percentual

O backend é a fonte da regra usada na tela:

```text
percentual = arredondar(((presentes + justificadas) / total) * 100)
```

Quando não há registros, o percentual é `0`. Uma falta justificada conta para
a frequência, mas continua identificada como `justificada` no resumo e na
lista.

## Datas e horários

O fuso definido pelo projeto é `America/Manaus` (UTC-04:00). A API devolve esse
identificador e o aplicativo formata data e hora em `pt-BR` usando o mesmo
fuso.

## Estados da tela

- carregando;
- lista preenchida;
- período sem registros;
- filtro de status sem resultados;
- sessão ausente ou expirada;
- API indisponível;
- dispositivo sem conexão;
- tentativa novamente e atualização ao puxar a tela para baixo.

Em erro ou resposta vazia, a tela mantém a lista vazia. Não existe fallback
para dados fictícios.

## Verificações executadas

Na raiz do backend:

```bash
npm ci
npx prisma generate
npm run build
JWT_SECRET="segredo-de-teste" \
DATABASE_URL="postgresql://usuario:senha@localhost:5432/teste" \
npm test -- --runTestsByPath tests/historicoAluno.test.ts
```

Na raiz do mobile:

```bash
npm ci
npm run typecheck
```

O teste automatizado cobre autenticação, papel incorreto, tentativa de enviar
outro `alunoId`, isolamento entre dois alunos, bloqueio das rotas globais,
cálculo do percentual e validação de período.

## Validação manual recomendada

1. Entrar com o Aluno A e registrar os itens exibidos.
2. Sair e entrar com o Aluno B.
3. Confirmar que nenhum item do Aluno A aparece na segunda sessão.
4. Alternar entre 7, 30, 90 dias e todo o histórico.
5. Alternar entre todos, presentes, faltas e justificadas.
6. Desativar a internet e confirmar a mensagem `Sem conexão`.
7. Reativar a internet e tocar em `Tentar novamente`.
8. Testar um período sem registros e confirmar que a lista permanece vazia.
