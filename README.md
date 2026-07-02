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

## Executar

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`.

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

## Estrutura do Projeto

```
app/
├── controllers/      # Controllers (MVC)
│   ├── itens_controller.ts
│   └── compras_controller.ts
├── exceptions/       # Tratamento de erros
│   └── handler.ts
├── middleware/        # Middleware HTTP
├── models/           # Models Lucid ORM
│   ├── item.ts
│   └── compra.ts
├── services/         # Serviços
│   └── github_service.ts
└── validators/       # Validação de requisições
    ├── item.ts
    └── compra.ts
config/               # Configurações
database/
└── migrations/       # Migrations do banco
docs/
└── swagger.yml       # Especificação OpenAPI
start/
└── routes.ts         # Definição de rotas
```

---

Desenvolvido por Fabio
