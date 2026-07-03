# Montree Shop List API

API REST para gerenciamento de catálogo de itens e lista de compras com compradores aleatórios obtidos via GitHub API.

## Sobre

A cada nova compra registrada, a API busca um usuário aleatório da [API pública do GitHub](https://api.github.com/users) e o associa como comprador do item selecionado.

## Requisitos do Desafio

### Obrigatórios

| Requisito | Como foi implementado | Onde |
|---|---|---|
| `POST /itens` | Controller recebe `{ nome, preco, qtd_atual }`, valida com [VineJS](https://vinejs.dev/), cria registro e retorna 201 (ou 422 se inválido) | [`app/controllers/itens_controller.ts`](app/controllers/itens_controller.ts), [`app/validators/item.ts`](app/validators/item.ts) |
| `GET /itens` | Query ordenada por ID, retorna array de itens | [`app/controllers/itens_controller.ts`](app/controllers/itens_controller.ts) |
| `POST /compras` | Valida `item_id`, busca item no banco, consome [GitHub API](https://api.github.com/users), seleciona usuário aleatório, salva compra e decrementa estoque | [`app/controllers/compras_controller.ts`](app/controllers/compras_controller.ts), [`app/services/github_service.ts`](app/services/github_service.ts) |
| `GET /compras` | `preload('item')` do [Lucid ORM](https://lucid.adonisjs.com/) — retorna cada compra com nome, preço e demais campos do item relacionado | [`app/controllers/compras_controller.ts`](app/controllers/compras_controller.ts) |
| Integração GitHub API | Service dedicado com `fetch`, seleção aleatória (`Math.random`), tipagem TypeScript | [`app/services/github_service.ts`](app/services/github_service.ts) |
| SQLite + Migrations | Banco [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3), migrations gerenciadas pelo [Lucid](https://lucid.adonisjs.com/docs/migrations) | [`database/migrations/1758943400000_create_itens_table.ts`](database/migrations/1758943400000_create_itens_table.ts), [`database/migrations/1758943500000_create_compras_table.ts`](database/migrations/1758943500000_create_compras_table.ts) |
| Tabela `itens` | `id` (PK autoincrement), `nome` (string), `preco` (decimal), `qtd_atual` (integer), `created_at`, `updated_at` | [`app/models/item.ts`](app/models/item.ts) |
| Tabela `compras` | `id` (PK), `comprador_github_login` (string), `item_id` (FK → `itens.id` com `ON DELETE CASCADE`), timestamps | [`app/models/compra.ts`](app/models/compra.ts) |
| Relacionamento FK + ORM | Chave estrangeira no banco (`item_id REFERENCES itens.id`) + `@belongsTo` / `@hasMany` no Lucid | [`database/migrations/1758943500000_create_compras_table.ts`](database/migrations/1758943500000_create_compras_table.ts), [`app/models/item.ts`](app/models/item.ts), [`app/models/compra.ts`](app/models/compra.ts) |
| Arquitetura MVC | Controllers, Models, Services e Validators em pastas separadas dentro de `app/` | [`app/`](app/) |
| Coleção Postman/Insomnia | Arquivo JSON de exportação na raiz do projeto, com todas as rotas e exemplos de body | [`montree-shop-list.postman_collection.json`](montree-shop-list.postman_collection.json) |

### Diferenciais

| Diferencial | Como foi implementado | Onde |
|---|---|---|
| **AdonisJS** | Framework full-stack com [Lucid ORM](https://lucid.adonisjs.com/) para relacionamentos, [VineJS](https://vinejs.dev/) para validação e migrations nativas | Projeto inteiro |
| **Swagger/OpenAPI** | Especificação [OpenAPI 3.0](https://swagger.io/specification/) em `docs/swagger.yml` + UI interativa via CDN em `GET /swagger` | [`docs/swagger.yml`](docs/swagger.yml), [`start/routes.ts`](start/routes.ts) |
| **Testes Automatizados** | 3 unitários (GitHubService com mock de fetch) + 8 de integração (Models Item/Compra: CRUD, relações, estoque) | [`tests/unit/github_service.spec.ts`](tests/unit/github_service.spec.ts), [`tests/functional/models.spec.ts`](tests/functional/models.spec.ts) |
| **Variáveis de Ambiente** | 9 variáveis tipadas via `Env.create()` do AdonisJS, `.env` versionado via `.env.example` (sem secrets) | [`start/env.ts`](start/env.ts), [`.env.example`](.env.example) |

### Tratamento de Erros

**P: A API do GitHub estiver fora do ar?**

R: A compra **não é processada**. Tratamos como se os dados do comprador não chegaram — é uma falha de dependência externa, não uma pré-compra. O [`GitHubService`](app/services/github_service.ts) lança exceção quando `fetch` retorna qualquer status de erro. O [`ExceptionHandler`](app/exceptions/handler.ts) captura a mensagem e retorna:

| HTTP | Resposta |
|---|---|
| `502 Bad Gateway` | `{"message": "Serviço externo indisponível. Tente novamente mais tarde."}` |

Nenhum dado é salvo no banco — nem compra, nem alteração de estoque.

**P: For enviado um `item_id` que não existe no banco na rota `POST /compras`?**

R: [`Item.findOrFail()`](https://lucid.adonisjs.com/docs/crud#find-or-fail) do Lucid ORM lança `E_ROW_NOT_FOUND` quando o ID não é localizado. O [`ExceptionHandler`](app/exceptions/handler.ts) captura e retorna:

| HTTP | Resposta |
|---|---|
| `404 Not Found` | `{"message": "Registro não encontrado."}` |

A requisição é barrada antes de qualquer escrita no banco.

**P: O corpo da requisição para criar um item for inválido?**

R: [VineJS](https://vinejs.dev/) valida todos os campos antes de chegar ao controller. As regras aplicadas ([`app/validators/item.ts`](app/validators/item.ts)):

| Campo | Regra |
|---|---|
| `nome` | Obrigatório, string, 1–200 caracteres |
| `preco` | Obrigatório, número, 0 a 99.999.999,99 |
| `qtd_atual` | Obrigatório, número, 0 a 999.999 |

Se qualquer campo violar, retorna com detalhes de cada erro:

| HTTP | Resposta |
|---|---|
| `422 Unprocessable Entity` | `{"message": "Validation failure", "errors": [{"field": "nome", "message": "...", "rule": "required"}, ...]}` |

O mesmo vale para `POST /compras` com body inválido — `item_id` é validado como número obrigatório ≥ 1.

**P: O item existe, mas está sem estoque?**

R: O controller verifica `item.qtd_atual <= 0` antes de consumir a API do GitHub e retorna:

| HTTP | Resposta |
|---|---|
| `400 Bad Request` | `{"message": "Item fora de estoque", "item_id": 1, "qtd_atual": 0}` |

Nenhuma compra é registrada, o estoque não é alterado.

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
git clone https://github.com/fabiojcp/montree-shop-list-api-backend.git
cd montree-shop-list-api-backend
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

## CI/CD

O deploy é automático via GitHub Actions em push na `main`. Basta commitar com a flag `[deploy]`:

```bash
git commit -m "feat: nova feature [deploy]"
```

| Flag | Efeito |
|---|---|
| `[deploy]` | (opcional) Deixa explícito que quer deploy |
| `[skip ci]` | Pula teste e deploy |
| `[no deploy]` | Pula deploy (testa apenas) |

### Setup do token

```bash
flyctl auth token                    # gera o token no terminal
# cole em: GitHub → Settings → Secrets → FLY_API_TOKEN
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `production` | Ambiente (`development`, `production`, `test`) |
| `PORT` | `3333` | Porta HTTP |
| `HOST` | `0.0.0.0` | Endereço de bind |
| `APP_KEY` | — | Chave de criptografia (gere com `node ace generate:key`) |
| `APP_URL` | — | URL pública da API |
| `LOG_LEVEL` | `info` | Nível de log |
| `TZ` | `UTC` | Timezone |
| `GITHUB_API_URL` | `https://api.github.com/users` | Endpoint da API do GitHub |
| `LIMITER_STORE` | `database` | Storage do rate limiter (`database` ou `memory`) |

## Deploy (Fly.io)

```bash
fly deploy
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
| **Security Headers**    | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
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
