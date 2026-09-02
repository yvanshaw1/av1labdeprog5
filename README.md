# AV01 — Laboratório de Programação V

API REST de agendamento de estética automotiva, com uma interface web para os quatro recursos.

**Stack:** TypeScript · Express 5 · TypeORM · PostgreSQL · React (Vite)

---

## Onde cada requisito do enunciado está no código

| Requisito | Artefato |
|---|---|
| **MVC** | **Model** → `backend/src/models/*.entity.ts` (entidades) + `backend/src/services/` (regras).<br>**View** → `backend/src/dtos/response/` + `backend/src/mappers/` (a representação JSON devolvida) e o app React em `frontend/`.<br>**Controller** → `backend/src/controllers/crud.controller.ts` |
| **Repository** | `backend/src/repositories/*.repository.ts` (interfaces) + `backend/src/repositories/typeorm/` (implementações). Os *services* dependem só da interface. |
| **DTO** | `backend/src/dtos/request/` (entrada, validada com Zod) e `backend/src/dtos/response/` (saída). A entidade nunca cruza a fronteira HTTP. |
| **Mapper** | `backend/src/mappers/*.mapper.ts` — único ponto que converte DTO ↔ entidade. |
| **GET / POST / PUT / DELETE** | Desenho único em `backend/src/routes/crud-routes.ts`, aplicado aos 4 recursos em `backend/src/application.ts` — 20 endpoints (tabela abaixo). |
| **ORM** | TypeORM: entidades com decorators, relações 1:N e N:N, migrations em `backend/src/migrations/`. |
| **Controle de exceção** | `backend/src/exceptions/` (hierarquia) + `backend/src/middlewares/global-exception.handler.ts` (tradução única para HTTP). |

---

## Domínio

```
Client 1──N Vehicle
Client 1──N Appointment N──1 Vehicle
Appointment 1──N AppointmentItem N──1 Service
```

`AppointmentItem` é a junção N:N entre agendamento e serviço, e guarda o **preço e a duração vigentes no momento da marcação** (`bookedPrice`, `bookedDurationInMinutes`). Por isso reajustar o catálogo não altera agendamentos já fechados — e o total de um agendamento é sempre calculado no servidor a partir do catálogo, nunca aceito do corpo da requisição.

## Endpoints

Todos seguem o mesmo contrato. Substitua `<recurso>` por `clients`, `vehicles`, `services` ou `appointments`.

| Verbo | Rota | Sucesso | Erros possíveis |
|---|---|---|---|
| GET | `/api/<recurso>` | `200` + lista | — |
| GET | `/api/<recurso>/:id` | `200` + recurso | `400` id inválido · `404` |
| POST | `/api/<recurso>` | `201` + recurso + header `Location` | `400` · `404` referência inexistente · `409` duplicado · `422` regra de negócio |
| PUT | `/api/<recurso>/:id` | `200` + recurso | `400` · `404` · `409` · `422` |
| DELETE | `/api/<recurso>/:id` | `204` sem corpo | `400` · `404` · `409` em uso |

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

A migration cria a extensão `uuid-ossp` antes das tabelas — é ela que fornece o `uuid_generate_v4()` usado como default das chaves primárias.

Para gerar uma nova migration a partir das entidades: `npm run migration:generate`. O CLI do TypeORM escreve `import { MigrationInterface, QueryRunner }` — troque por `import type`, senão o ESM tenta importar em tempo de execução dois nomes que só existem como tipo.

### 4. Subir a API

```bash
cd backend && npm run dev
```

A API sobe em `http://localhost:3000`. Para rodar a versão compilada: `npm run build && npm start`.

### 5. Subir a interface

```bash
cd frontend && npm install && npm run dev
```

O Vite sobe em `http://localhost:5173` e encaminha `/api` para a porta 3000 — não é preciso configurar CORS.

A interface tem uma aba por recurso, todas com os quatro verbos. Duas se apoiam em outro recurso: a de **veículos** lista os clientes num select e mostra o dono pelo nome; a de **agendamentos** filtra os veículos pelo cliente escolhido, permite marcar vários serviços e exibe o total **calculado pelo servidor** — o formulário não tem campo de preço, de propósito.

### Verificação

```bash
cd backend  && npx tsc --noEmit && npm run lint && npm run build
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

---

## Decisões de projeto

**Interface de repositório separada da implementação.** `CrudRepository` é o contrato e `backend/src/repositories/typeorm/` o implementa. Os services recebem a interface por construtor e nunca importam TypeORM, então a persistência pode ser trocada sem tocar em regra de negócio. A escolha da implementação acontece num único lugar: `backend/src/container.ts`.

**Aplicação separada do servidor.** `createApplication()` monta o Express sem abrir porta, recebendo os repositórios como parâmetro; `server.ts` só inicializa o banco e escuta.

**O que é igual nos quatro recursos é descrito uma vez.** As rotas (`buildCrudRoutes`), a fronteira HTTP (`CrudController`), o `findById`/`findAll`/`delete` dos services (`CrudService`) e as cinco operações de persistência (`TypeOrmCrudRepository`) existem em um lugar só. Isso impede que os recursos divirjam em silêncio — um esquecer de validar o `:id`, outro devolver 500 no lugar de 404. O que é específico continua explícito e visível: cada recurso tem seu service com suas regras, seu mapper e seus schemas de validação.

**No front, a máquina de estado do CRUD é uma só.** As quatro telas se comportam igual — carregar, editar, gravar, recarregar, exibir erro —, então isso vive em `useResourceCrud`, e cada página traz apenas os campos do seu formulário e as colunas da sua tabela. O estado da leitura é uma união discriminada (`AsyncState`), não `items` + `isLoading` + `error` soltos: assim a tela não consegue afirmar "nenhum cadastrado" enquanto a resposta ainda está a caminho. O cliente HTTP segue o mesmo princípio: `createResourceApi` monta os quatro verbos a partir do caminho do recurso.

**PUT substitui o recurso inteiro.** Todos os campos são obrigatórios. Campos que não se editam (o dono de um veículo, o cliente de um agendamento) ficam de fora do DTO de atualização e são recusados se enviados.

**Corpo de requisição é estrito.** Chave desconhecida é rejeitada com `400`. É o que impede o cliente de enviar `totalPrice` num agendamento.

**Violação de restrição do banco vira `409`, não `500`.** Os services checam duplicidade antes de gravar, mas concorrência e chaves estrangeiras ainda podem estourar no banco. Quem traduz é o repositório TypeORM, em `constraint-violation.ts`: `unique_violation` e `foreign_key_violation` viram exceções da aplicação ali mesmo. Assim `QueryFailedError` e os códigos do PostgreSQL não passam da camada de persistência — o handler global só conhece `ApplicationException`.

**O compilador é a primeira linha de defesa.** Além de `strict`, o `tsconfig.json` liga `noUncheckedIndexedAccess` (acesso por índice devolve `T | undefined`), `exactOptionalPropertyTypes` (distingue `campo?: T` de `campo: T | undefined`), `noPropertyAccessFromIndexSignature`, `noImplicitOverride` e `noUnusedLocals`. Não existe um `any` no projeto: onde o tipo é genuinamente desconhecido, o tipo é `unknown`, o que obriga a estreitar antes de usar. Os DTOs de resposta e as estruturas de configuração são `readonly` — o que sai da API não é para ser mutado.

**`emitDecoratorMetadata` fica desligado.** Toda coluna declara seu `type`, então o TypeORM não precisa do metadado. Ligado, o compilador emite uma referência direta à classe alvo de cada relação, e o par `Appointment` ↔ `AppointmentItem` — que se referencia nos dois sentidos — quebra o build compilado com `Cannot access 'Appointment' before initialization`.
