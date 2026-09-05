# AV01 — Laboratório de Programação V

**Cadastro de Cliente**: API REST em TypeScript com uma interface web que a consome.

**Stack:** TypeScript · Express 5 · TypeORM · PostgreSQL · React (Vite)

---

## Onde cada requisito do enunciado está no código

| Requisito | Artefato |
|---|---|
| **MVC** | **Model** → `backend/src/models/client.entity.ts` (entidade) + `backend/src/services/` (regras).<br>**View** → `backend/src/dtos/response/` + `backend/src/mappers/` (a representação JSON devolvida) e o app React em `frontend/`.<br>**Controller** → `backend/src/controllers/crud.controller.ts` |
| **Repository** | `backend/src/repositories/*.repository.ts` (interfaces) + `backend/src/repositories/typeorm/` (implementações). Os *services* dependem só da interface. |
| **DTO** | `backend/src/dtos/request/` (entrada, validada com Zod) e `backend/src/dtos/response/` (saída). A entidade nunca cruza a fronteira HTTP. |
| **Mapper** | `backend/src/mappers/client.mapper.ts` — único ponto que converte DTO ↔ entidade. |
| **GET / POST / PUT / DELETE** | `backend/src/routes/crud-routes.ts`, montado em `backend/src/application.ts` — 5 rotas (tabela abaixo). |
| **ORM** | TypeORM: entidade com decorators e schema versionado por migration em `backend/src/migrations/`. |
| **Controle de exceção** | `backend/src/exceptions/` (hierarquia) + `backend/src/middlewares/global-exception.handler.ts` (tradução única para HTTP). |

---

## Endpoints

| Verbo | Rota | Sucesso | Erros possíveis |
|---|---|---|---|
| GET | `/api/clients` | `200` + lista | — |
| GET | `/api/clients/:id` | `200` + recurso | `400` id inválido · `404` |
| POST | `/api/clients` | `201` + recurso + header `Location` | `400` · `409` e-mail duplicado |
| PUT | `/api/clients/:id` | `200` + recurso | `400` · `404` · `409` |
| DELETE | `/api/clients/:id` | `204` sem corpo | `400` · `404` · `409` em uso |

Qualquer outro verbo num caminho existente responde `405` com o cabeçalho `Allow`. Corpo que não seja `application/json` responde `415`; JSON malformado, `400`; corpo acima de 100 kb, `413`.

`GET /health` responde `200` sem tocar no banco — serve para conferir que a API subiu.

### Formato de erro

Toda resposta de erro usa **Problem Details (RFC 9457)**, com `Content-Type: application/problem+json`:

```json
{
  "type": "/problems/resource-not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Client not found with identifier 6f1c9d2e-...",
  "instance": "/api/clients/6f1c9d2e-..."
}
```

Falhas de validação acrescentam a lista de campos:

```json
{
  "type": "/problems/request-validation-failed",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/api/clients",
  "errors": [{ "field": "email", "message": "Invalid email address." }]
}
```

Erro inesperado sempre vira `500` com `"An unexpected error occurred."` — mensagem de driver, SQL e stack ficam só no log.

---

## Como rodar

### Pré-requisitos

- Node.js 22 ou superior
- PostgreSQL em execução

### 1. Criar o banco

```bash
psql -U postgres -c "CREATE DATABASE av1labdeprog5;"
```

### 2. Configurar o backend

```bash
cd backend && npm install
```

Copie `.env.example` para `.env`, preenchendo host, porta, usuário e senha do seu PostgreSQL.

### 3. Aplicar o schema

```bash
cd backend && npm run migration:run
```

A migration cria a extensão `uuid-ossp` antes da tabela — é ela que fornece o `uuid_generate_v4()` usado como default da chave primária.

Para gerar uma nova migration a partir das entidades: `npm run migration:generate`. O CLI do TypeORM escreve `import { MigrationInterface, QueryRunner }` — troque por `import type`, senão o ESM tenta importar em tempo de execução dois nomes que só existem como tipo.

### 4. Popular o banco com dados de demonstração

```bash
cd backend && npm run seed
```

**Apaga o que existir antes** — serve tanto para o primeiro uso quanto para resetar entre testes.

### 5. Modo demonstração: tudo numa porta só

```bash
cd backend && npm run demo
```

Compila o front, compila a API e sobe **um único servidor em `http://localhost:3000`**, com o site em `/` e a API em `/api`. Rotas inexistentes da API continuam respondendo Problem Details, e não a página.

### 6. Modo desenvolvimento: dois servidores

```bash
cd backend  && npm run dev     # http://localhost:3000
cd frontend && npm run dev     # http://localhost:5173
```

O Vite recarrega a tela a cada arquivo salvo e encaminha `/api` para a porta 3000 — não é preciso configurar CORS.

A interface mostra o formulário e a lista de clientes de um lado, e do outro um painel que exibe o código-fonte da API, agrupado pelos critérios do enunciado.

### Verificação

```bash
cd backend  && npx tsc --noEmit && npm run lint && npm run build
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

---

## Decisões de projeto

**Interface de repositório separada da implementação.** `CrudRepository` é o contrato e `backend/src/repositories/typeorm/` o implementa. Os services recebem a interface por construtor e nunca importam TypeORM, então a persistência pode ser trocada sem tocar em regra de negócio. A escolha da implementação acontece num único lugar: `backend/src/container.ts`.

**Aplicação separada do servidor.** `createApplication()` monta o Express sem abrir porta, recebendo os repositórios como parâmetro; `server.ts` só inicializa o banco e escuta.

**A base do CRUD é descrita uma vez.** As rotas (`buildCrudRoutes`), a fronteira HTTP (`CrudController`), o `findById`/`findAll`/`delete` do service (`CrudService`) e as cinco operações de persistência (`TypeOrmCrudRepository`) são genéricos. O que é específico do cliente continua explícito: o service com suas regras, o mapper e os schemas de validação.

**No front, a máquina de estado do CRUD é uma só.** `useResourceCrud` cuida de carregar, editar, gravar, recarregar e exibir erro. O estado da leitura é uma união discriminada (`AsyncState`), não `items` + `isLoading` + `error` soltos: assim a tela não consegue afirmar "nenhum cadastrado" enquanto a resposta ainda está a caminho.

**PUT substitui o recurso inteiro.** Todos os campos são obrigatórios; não existe atualização parcial.

**Corpo de requisição é estrito.** Chave desconhecida é rejeitada com `400`, o que impede o cliente de gravar campos que não lhe pertencem.

**Violação de restrição do banco vira `409`, não `500`.** O service checa duplicidade antes de gravar, mas concorrência ainda pode estourar no banco. Quem traduz é o repositório TypeORM, em `constraint-violation.ts` — assim `QueryFailedError` e os códigos do PostgreSQL não passam da camada de persistência.

**O compilador é a primeira linha de defesa.** Além de `strict`, o `tsconfig.json` liga `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride` e `noUnusedLocals`. Não existe um `any` no projeto: onde o tipo é genuinamente desconhecido, o tipo é `unknown`.

**`emitDecoratorMetadata` fica desligado.** Toda coluna declara seu `type`, então o TypeORM não precisa do metadado — e ligado ele emite referências diretas entre classes que se importam mutuamente, o que quebra o build compilado.
