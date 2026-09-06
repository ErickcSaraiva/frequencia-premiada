# Deploy do EduPoints: Render + Vercel

Este guia publica o backend, o PostgreSQL e o dashboard sem versionar senhas.
O aplicativo mobile não faz parte deste deploy web.

## Antes de começar

1. Envie este repositório para o GitHub e mantenha `main` como branch principal.
2. Confirme que os checks do GitHub Actions estão verdes.
3. Não crie nem envie arquivos `.env` com credenciais reais.

## 1. Backend e PostgreSQL no Render

1. Entre no Render e selecione **New > Blueprint**.
2. Conecte o repositório `frequencia-premiada`.
3. O Render localizará o arquivo `render.yaml` na raiz.
4. Quando solicitar `CORS_ORIGINS`, informe temporariamente:

   ```text
   http://localhost:5173
   ```

5. Aplique o Blueprint e aguarde o banco e `frequencia-premiada-api` ficarem ativos.
6. Copie a URL HTTPS exibida pelo Render, por exemplo:

   ```text
   https://frequencia-premiada-api.onrender.com
   ```

7. Valide no navegador ou terminal:

   ```bash
   curl https://SUA-API.onrender.com/health
   ```

   A resposta esperada é `{"status":"ok"}`.

O comando de inicialização executa `prisma migrate deploy` antes de abrir o
servidor. O banco não recebe dados demonstrativos automaticamente.

## 2. Dashboard na Vercel

1. Entre na Vercel e selecione **Add New > Project**.
2. Importe o mesmo repositório do GitHub.
3. Configure **Root Directory** como `dashboard`.
4. Confirme as configurações detectadas:

   | Campo | Valor |
   | --- | --- |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm ci` |

5. Adicione a variável de ambiente em Production, Preview e Development:

   ```dotenv
   VITE_API_URL=https://SUA-API.onrender.com
   ```

6. Clique em **Deploy** e copie a URL final HTTPS da Vercel.

O arquivo `dashboard/vercel.json` redireciona as rotas do React Router para
`index.html`. Assim, abrir diretamente `/login`, `/inicio` ou `/presencas` não
resulta em erro 404.

## 3. Fechar o CORS no Render

1. Abra `frequencia-premiada-api` no Render.
2. Entre em **Environment** e altere `CORS_ORIGINS` para a URL exata da Vercel,
   sem barra no final:

   ```dotenv
   CORS_ORIGINS=https://SEU-PROJETO.vercel.app
   ```

3. Salve e faça o redeploy.
4. Se houver mais de um domínio confiável, separe-os por vírgula:

   ```dotenv
   CORS_ORIGINS=https://app.exemplo.com,https://SEU-PROJETO.vercel.app
   ```

Não use `*` em produção. URLs temporárias de Preview da Vercel também não
são liberadas automaticamente; adicione somente as origens que a equipe deseja
autorizar.

## 4. Dados iniciais

O banco publicado começa vazio. O plano gratuito não oferece Shell e o seed do
projeto usa credenciais demonstrativas conhecidas, por isso ele não é executado
automaticamente. Faça primeiro o deploy e valide a infraestrutura; a criação
segura da primeira conta será uma etapa separada.

## 5. Checklist de aceite

- `GET /health` responde com HTTP 200;
- login do professor funciona pela URL da Vercel;
- atualizar uma rota interna não gera 404;
- dashboard recebe eventos do Socket.IO;
- console do navegador não apresenta erro de CORS;
- nenhum `.env`, token, senha ou URL de banco foi commitado;
- os logs do Render mostram as migrações aplicadas e o servidor iniciado.

## Limites do plano gratuito

O plano gratuito é adequado para demonstração acadêmica, não para uso real
contínuo. O serviço pode adormecer por inatividade e o PostgreSQL gratuito do
Render expira depois de 30 dias, não possui backups e tem limite de 1 GB. Para
uma escola usar o sistema de verdade, escolha instâncias pagas e defina uma
política de backup antes de cadastrar dados pessoais.
