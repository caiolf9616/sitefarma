# SiteFarma

Sistema web de gerenciamento e reserva de medicamentos. Permite que usuários consultem o estoque de uma farmácia, realizem reservas e que administradores gerenciem medicamentos e reservas.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.12 · FastAPI · Uvicorn |
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Infraestrutura | Docker · Docker Compose · Nginx |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- Conta e projeto criados no [Supabase](https://supabase.com/)

---

## Configuração das variáveis de ambiente

> **Atenção:** O projeto depende de chaves do Supabase para funcionar. Sem elas, o backend não consegue conectar ao banco de dados e nenhuma funcionalidade estará disponível.

### 1. Obter as chaves do Supabase

Acesse o [painel do Supabase](https://supabase.com/dashboard), selecione o seu projeto e vá em:

**Settings → API**

Você precisará de duas informações:

| Variável | Onde encontrar |
|----------|---------------|
| `SUPABASE_URL` | Campo **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | Campo **service_role** (secret) — **nunca** use a chave `anon` aqui |

> **Cuidado com a `SUPABASE_SERVICE_ROLE_KEY`:** essa chave concede acesso total ao banco, ignorando as políticas de segurança (RLS). Ela deve ser mantida **apenas no backend**, nunca exposta no frontend ou em repositórios públicos.

### 2. Criar o arquivo `.env` do backend

Copie o arquivo de exemplo e preencha com suas chaves:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env`:

```env
ENVIRONMENT=development
DEBUG=true

SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Migração do banco de dados

Antes de rodar o projeto pela primeira vez (ou após atualizações), execute o seguinte SQL no **SQL Editor** do Supabase:

```sql
-- Colunas para armazenar dados do usuário direto na reserva
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS user_name  TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT;
```

> Reservas criadas antes dessa migração aparecerão sem nome de usuário no painel do administrador.

---

## Como rodar o projeto

Na raiz do repositório, execute:

```bash
docker compose up --build -d
```

Após o build, acesse:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend (API):** [http://localhost:8000](http://localhost:8000)
- **Documentação da API (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Parar os containers

```bash
docker compose down
```

### Reconstruir após mudanças no código

```bash
docker compose up --build -d
```

---

## Estrutura do projeto

```
sitefarma/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── api/      # Rotas (medications, reservations, users)
│   │   ├── core/     # Configurações e conexão com Supabase
│   │   └── schemas/  # Modelos Pydantic
│   ├── .env.example  # Modelo de variáveis de ambiente
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/         # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── types/
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Funcionalidades

- Listagem de medicamentos com estoque, dosagem e preço
- Medicamentos gratuitos identificados com badge especial (sem exibição de preço)
- Reserva de medicamentos com limite de 3 reservas ativas por dia e até 5 unidades por item
- Perfis de acesso: **usuário comum** e **administrador**
- Painel administrativo para criação, edição e conclusão de reservas
- Autenticação via Supabase Auth

---

## Observações importantes

- O arquivo `backend/.env` **não deve ser versionado** (já está listado no `.gitignore`). Nunca faça commit das suas chaves.
- A chave `service_role` do Supabase deve ser a chave **secreta** (secret), não a chave pública `anon`. Usar a chave errada fará com que operações administrativas falhem silenciosamente.
- As políticas de Row Level Security (RLS) do Supabase devem estar configuradas corretamente no projeto para que as operações funcionem como esperado.
