# frequencia-premiada

O EduPoints — Frequencia Premiada e uma solucao de tecnologia educacional (EdTech) desenvolvida
individualmente para a disciplina de Topicos Integradores em Ciencia da Computacao na UNINORTE. O projeto
automatiza o controle de presenca em escolas publicas de Manaus por meio de leitura de tags NFC adesivas e
gamificacao, transformando a chamada manual em um evento de engajamento para os alunos.
O problema central e a evasao escolar silenciosa: quando a gestao percebe a ausencia continuada de um aluno, ele
ja abandonou os estudos. A solucao entrega um ecossistema composto por um app mobile Android (React Native +
Expo) para o professor registrar presenca via NFC, um backend Node.js com API REST e eventos em tempo real via
Socket.io, e um Dashboard Web (React + Vite) que exibe check-ins ao vivo, ranking de pontuacao por turma e
alertas vermelhos de risco de evasao (3+ faltas consecutivas — RF05 Busca Ativa).
O MVP foi construido com custo de hardware proximal a zero (tags NFC adesivas entre R$1 e R$3) e funciona em
smartphones Android populares, respeitando as restricoes orcamentarias das escolas publicas. O sistema esta em
conformidade com a LGPD, implementando portabilidade, anonimizacao e auditoria de dados de menores.


## Visao arquitetural

O EduPoints e uma arquitetura orientada a eventos em tres camadas: Mobile (React Native), Backend (Node.js) e
Dashboard (React). O fluxo principal e: professor aproxima tag NFC -> app envia POST /checkin -> backend valida,
salva no PostgreSQL e emite evento Socket.io -> Dashboard atualiza em tempo real sem polling.
O backend e o nucleo do sistema — expoe 19 endpoints REST protegidos por JWT e mantem conexoes WebSocket
persistentes com o Dashboard via Socket.io. O banco PostgreSQL armazena 5 entidades relacionais (Aluno,
Professor, Turma, Disciplina, Presenca) gerenciadas pelo Prisma ORM v5.

## Referencias bibliograficas

• BRASIL. Lei n. 9.394, de 20 de dezembro de 1996. Lei de Diretrizes e Bases da Educacao Nacional (LDB).
Diario Oficial da Uniao, Brasilia, 1996.
• BRASIL. Lei n. 13.709, de 14 de agosto de 2018. Lei Geral de Protecao de Dados Pessoais (LGPD). Diario
Oficial da Uniao, Brasilia, 2018.
• EXPO. Expo Documentation. Disponivel em: https://docs.expo.dev. Acesso em: abr. 2026.
• PRISMA. Prisma ORM Documentation. Disponivel em: https://www.prisma.io/docs. Acesso em: abr. 2026.
• SOCKET.IO. Socket.IO Documentation. Disponivel em: https://socket.io/docs. Acesso em: abr. 2026.
• POSTGRESQL. PostgreSQL 17 Documentation. Disponivel em: https://www.postgresql.org/docs. Acesso em:
abr. 2026.
• REACT. React Documentation. Disponivel em: https://react.dev. Acesso em: abr. 2026.

> [!IMPORTANT]
> ## Licença
>
>Proprietário © Erick da Costa Saraiva — Todos os direitos reservados.
>Proibida a reprodução ou distribuição sem autorização expressa dos autores.
