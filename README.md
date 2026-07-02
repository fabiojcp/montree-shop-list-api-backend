# Montree Shop List API

API REST para gerenciamento de catálogo de itens e lista de compras com compradores aleatórios obtidos via GitHub API.

## Sobre

A cada nova compra registrada, a API busca um usuário aleatório da [API pública do GitHub](https://api.github.com/users) e o associa como comprador do item selecionado.

## Tecnologias

- [AdonisJS](https://adonisjs.com/) (Node.js + TypeScript)
- SQLite (better-sqlite3)
- Lucid ORM
- VineJS (validação)
- Swagger/OpenAPI

## Requisitos

- Node.js >= 24.0.0
- npm

## Instalação

```bash
git clone <repo-url>
cd montree-shop-list-api
npm install
```

Configure o arquivo `.env`:

```bash
cp .env.example .env
node ace generate:key
```

Execute as migrations:

```bash
node ace migration:run
```

## Executar (Desenvolvimento)

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`.

## Deploy (Produção)

```bash
npm run build
cd build
npm ci --omit="dev"
node ace migration:run
npm start
```

## Endpoints

### Itens

| Método | Rota     | Descrição                        |
| ------ | -------- | -------------------------------- |
| `POST` | `/itens` | Cria um novo item no catálogo    |
| `GET`  | `/itens` | Lista todos os itens cadastrados |

**POST /itens** — Corpo da requisição:

```json
{
  "nome": "Notebook",
  "preco": 3500.0,
  "qtd_atual": 10
}
```

### Compras

| Método | Rota       | Descrição                                            |
| ------ | ---------- | ---------------------------------------------------- |
| `POST` | `/compras` | Cria uma compra com comprador aleatório do GitHub    |
| `GET`  | `/compras` | Lista todas as compras com dados do item relacionado |

**POST /compras** — Corpo da requisição:

```json
{
  "item_id": 1
}
```

## Documentação Interativa (Swagger)

Com a aplicação rodando, acesse:

```
http://localhost:3333/swagger
```

## Coleção Postman

Importe o arquivo `montree-shop-list.postman_collection.json` no Postman para testar os endpoints.

## Testes

```bash
npm test
```

### Cobertura

| Suite      | Descrição                                         | Testes |
| ---------- | ------------------------------------------------- | ------ |
| `unit`     | GitHubService — mock fetch, erros, lista vazia    | 3      |
| `functional` | Models Item e Compra — CRUD, relações, estoque | 8      |

## Segurança

| Proteção                | Implementação                                                            |
| ----------------------- | ------------------------------------------------------------------------ |
| **Rate Limiting**       | 60 req/min para leitura, 10 req/min para escrita (por IP)                |
| **SQL Injection**       | ORM Lucid usa prepared statements — queries parametrizadas por padrão    |
| **Validação de Input**  | VineJS com limites de caracteres (`nome` ≤ 200, `preco` ≤ 99.999.999,99) |
| **CORS**                | Configurado via `@adonisjs/cors` — permite apenas GET e POST             |
| **Security Headers**    | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP, etc.      |
| **Body Size Limit**     | JSON limitado a 1 MB                                                     |
| **Tratamento de Erros** | Respostas JSON padronizadas, sem vazamento de stack trace em produção    |

## Estrutura do Projeto

```
app/
├── controllers/      # Controllers (MVC)
│   ├── itens_controller.ts
│   └── compras_controller.ts
├── exceptions/       # Tratamento de erros
│   └── handler.ts
├── middleware/        # Middleware HTTP (CORS, security headers, rate limit)
│   ├── container_bindings_middleware.ts
│   └── security_headers_middleware.ts
├── models/           # Models Lucid ORM
│   ├── item.ts
│   └── compra.ts
├── services/         # Serviços
│   └── github_service.ts
└── validators/       # Validação de requisições
    ├── item.ts
    └── compra.ts
config/               # Configurações (database, cors, limiter, bodyparser)
database/
└── migrations/       # Migrations do banco
docs/
└── swagger.yml       # Especificação OpenAPI
start/
├── routes.ts         # Definição de rotas
├── kernel.ts         # Registro de middlewares
├── limiter.ts        # Configuração de rate limiting
└── env.ts            # Variáveis de ambiente tipadas
```

---

Desenvolvido por Fabio
