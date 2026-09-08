# Desenvolvimento do EduPoints

## ⚙️ Como executar o projeto localmente

### Pré-requisitos

- Git;
- Docker Engine;
- Docker Compose;
- Node.js 20 para executar dashboard e mobile.

Não é necessário instalar PostgreSQL diretamente no computador quando o ambiente Docker for utilizado.

### 1. Clonar o repositório

```bash
git clone https://github.com/Uninorte-Extensao/frequencia-premiada.git
cd frequencia-premiada
```

### 2. Preparar as variáveis de ambiente

Copie os arquivos de exemplo:

```bash
cp .env.example .env
cp dashboard/.env.example dashboard/.env
cp mobile/.env.example mobile/.env
```

Os arquivos `.env` reais são ignorados pelo Git. Nunca versione senhas, tokens ou credenciais reais.

Convenção adotada:

| Aplicação | Variável | Finalidade |
|---|---|---|
| Backend | `DATABASE_URL` | Conexão com o PostgreSQL |
| Backend | `JWT_SECRET` | Assinatura dos tokens de autenticação |
| Backend | `PORT` | Porta HTTP da API |
| Backend | `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| Dashboard | `VITE_API_URL` | URL pública do backend |
| Mobile | `EXPO_PUBLIC_API_URL` | URL do backend acessível pelo dispositivo |

### 3. Subir PostgreSQL e backend

Na raiz do projeto, execute:

```bash
docker compose up --build -d
```

Esse comando:

- cria o PostgreSQL em uma rede interna;
- aguarda o banco ficar saudável;
- constrói o backend;
- executa `prisma migrate deploy`;
- disponibiliza a API em `http://localhost:3333`.

Verifique os serviços:

```bash
docker compose ps
```

Teste a API:

```bash
curl http://localhost:3333/
```

### 4. Criar dados exclusivamente demonstrativos

O seed não é executado automaticamente. Para criar as contas de demonstração:

```bash
docker compose exec backend npm run seed
```

Contas criadas:

- Professor: `professor@escola.com` / `123456`
- Aluno: `ALUNO001` / `123456`

Essas credenciais são destinadas somente ao desenvolvimento e às demonstrações locais.

### 5. Executar o dashboard

Em outro terminal:

```bash
cd dashboard
npm ci
npm run dev
```

Por padrão, o dashboard utiliza:

```dotenv
VITE_API_URL=http://localhost:3333
```

Acesse `http://localhost:5173`.

### 6. Executar o mobile

Em outro terminal:

```bash
cd mobile
npm ci
npm start
```

Em emulador ou navegador local:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3333
```

Em celular físico, substitua `localhost` pelo IP local do computador:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.x.x:3333
```

O celular e o computador devem estar conectados à mesma rede.

### Comandos úteis

Acompanhar os logs do backend:

```bash
docker compose logs -f backend
```

Parar os serviços preservando o banco:

```bash
docker compose down
```

Iniciar novamente:

```bash
docker compose up -d
```

As informações do PostgreSQL são preservadas no volume Docker `postgres_data`.

## ✅ Verificações de qualidade

O workflow `.github/workflows/quality.yml` é executado em todo Pull Request direcionado à `main`. Ele cria três checks independentes e usa somente valores temporários no ambiente de CI; nenhum segredo do projeto é versionado.

Antes de abrir um Pull Request, reproduza localmente as mesmas verificações.

### Backend

O banco configurado em `backend/.env` deve estar acessível e preparado com as migrações e o seed de teste.

```bash
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run build
npm test
```

### Dashboard

```bash
cd dashboard
npm ci
npm run lint
npm run build
```

### Mobile

```bash
cd mobile
npm ci
npm run typecheck
```

Todos os três checks precisam ficar verdes antes do merge. Depois que o workflow rodar pelo menos uma vez, um administrador deve configurar a proteção da branch `main` e marcar estes checks como obrigatórios:

- `backend-checks`
- `dashboard-checks`
- `mobile-checks`
