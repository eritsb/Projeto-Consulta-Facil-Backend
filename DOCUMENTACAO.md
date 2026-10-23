# Consulta Fácil — Documentação Técnica do Backend

> **Repositório:** https://github.com/eritsb/Projeto-Consulta-Facil-Backend
> **Branch analisada:** `back-end-ericha`
> **Commit de referência:** `b5f6c7f`
> **Data da análise:** 23/10/2026
> **Idiomas:** Português (Brasil) e English

---

# PARTE 1 — PORTUGUÊS (BR)

## 1. Visão geral

O **Consulta Fácil** é o backend de uma plataforma de gerenciamento e agendamento de consultas médicas, desenvolvido como Projeto Integrador do SENAC. A aplicação expõe uma API REST responsável por cadastros administrativos, autenticação de pacientes e pelo ciclo completo de agendamento de consultas.

O escopo implementado no repositório inclui:

- CRUD de pacientes, especialidades, clínicas, profissionais e disponibilidades;
- autenticação de pacientes com e-mail e senha, retornando JWT;
- consulta do perfil do paciente autenticado;
- criação, listagem, atualização, cancelamento e exclusão de agendamentos;
- reserva e liberação automática de horários;
- persistência em PostgreSQL hospedado no Neon;
- script PowerShell idempotente para popular o banco via API.

Fora do escopo atual: painel administrativo, recuperação de senha, refresh token, upload de arquivos, pré-triagem, notificações, recomendações, testes automatizados e documentação OpenAPI/Swagger.

| Item | Situação |
|---|---|
| Tipo de aplicação | API REST (sem renderização de views) |
| Linguagem | JavaScript (CommonJS) |
| Runtime | Node.js >= 19 |
| Framework HTTP | Express 5 |
| Banco | PostgreSQL no Neon |
| Autenticação | JWT para pacientes |
| Deploy do backend | Render (URL pública verificada) |
| Versão de referência | `1.0.0` (`package.json`) |

---

## 2. Stack tecnológica verificada

A tabela abaixo considera apenas o que está efetivamente importado e utilizado no código.

| Tecnologia | Versão | Uso real no projeto | Evidência |
|---|---|---|---|
| Node.js | `>= 19` | Runtime da API | `engines` de `@neondatabase/serverless` em `package-lock.json` |
| Express | `5.2.1` | Servidor HTTP, rotas e middlewares | `src/server.js`, `src/routes/*` |
| @neondatabase/serverless | `1.1.0` | Cliente SQL sobre HTTP para o Neon | `src/config/database.js` |
| PostgreSQL | Neon | Banco relacional | `DATABASE_URL` e consultas SQL |
| jsonwebtoken | `9.0.3` | Assinatura e verificação do JWT | `src/services/authService.js`, `src/middlewares/autenticacao.js` |
| bcryptjs | `3.0.3` | Hash e comparação de senhas | `src/services/authService.js`, `src/services/pacientesService.js` |
| dotenv | `18.0.3` | Carregamento do `.env` | `src/server.js`, `src/config/database.js` |
| cors | `2.8.6` | Liberação de CORS | `src/server.js` |
| pg | `8.23.0` | **Instalado, porém não utilizado** | Nenhum `require("pg")` no projeto |
| PowerShell | 5.1+ | Script de carga inicial | `popular-banco.ps1` |

**Não existem no repositório:** framework de testes, linter, formatador, Swagger/OpenAPI, ORM, migrations, Docker, CI/CD ou `render.yaml`.

---

## 3. Arquitetura

### 3.1 Estilo arquitetural

O projeto segue uma **arquitetura em camadas** com separação de responsabilidades. A documentação anterior chamava o padrão de "MVC"; na prática, não há camada de views, pois a API apenas retorna JSON. O fluxo real é:

```text
Cliente HTTP
    |
    v
server.js (Express, CORS, JSON, 404)
    |
    v
Routes (mapeamento de URL e método)
    |
    v
Middlewares (somente em rotas autenticadas)
    |
    v
Controllers (HTTP: status code e corpo da resposta)
    |
    v
Services (regras de negócio e validações)
    |
    v
Models (SQL parametrizado)
    |
    v
config/database.js (@neondatabase/serverless)
    |
    v
PostgreSQL (Neon)
```

### 3.2 Responsabilidades das camadas

| Camada | Responsabilidade | Exemplos |
|---|---|---|
| `server.js` | Criar o app Express, habilitar CORS e JSON, montar rotas, tratar 404 e iniciar o servidor | `app.use("/pacientes", pacientesRoutes)` |
| `routes` | Associar método + caminho ao controller | `router.post("/", ...)` |
| `middlewares` | Autenticar JWT e autorizar perfis | `autenticacao`, `autorizarPerfis` |
| `controllers` | Traduzir HTTP para service e devolver status/corpo | `PacientesController.cadastrar` |
| `services` | Validar dados, aplicar regras e lançar erros com `statusCode` | `AgendamentosService.cadastrar` |
| `models` | Executar SQL parametrizado e retornar linhas | `Pacientes.buscarPorEmailParaLogin` |
| `config` | Criar o cliente SQL e validar `DATABASE_URL` | `src/config/database.js` |

### 3.3 Padrões observados

- Classes com **métodos estáticos** em controllers, services e models.
- SQL escrito com **template tags** do `@neondatabase/serverless`, com interpolação parametrizada.
- Services lançam `Error` com a propriedade `statusCode`; controllers convertem em resposta HTTP.
- Alguns controllers tratam códigos do PostgreSQL (`23505` unicidade e `23503` chave estrangeira).
- Não há injeção de dependência, DTOs, biblioteca de validação (Zod/Joi) nem camada de repositório separada dos models.
- Não há middleware global de erros; cada controller trata os próprios erros.

### 3.4 Estrutura real de pastas

```text
Projeto-Consulta-Facil-Backend/
├── .env.example
├── .gitignore
├── DOCUMENTACAO.md
├── README.md
├── package.json
├── package-lock.json
├── popular-banco.ps1
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── agendamentosController.js
    │   ├── authController.js
    │   ├── clinicasController.js
    │   ├── disponibilidadesController.js
    │   ├── especialidadesController.js
    │   ├── pacientesController.js
    │   └── profissionaisController.js
    ├── middlewares/
    │   ├── autenticacao.js
    │   └── autorizarPerfis.js
    ├── models/
    │   ├── Agendamentos.js
    │   ├── Clinicas.js
    │   ├── Disponibilidades.js
    │   ├── Especialidades.js
    │   ├── Pacientes.js
    │   └── Profissionais.js
    ├── routes/
    │   ├── agendamentosRoutes.js
    │   ├── authRoutes.js
    │   ├── clinicasRoutes.js
    │   ├── disponibilidadesRoutes.js
    │   ├── especialidadesRoutes.js
    │   ├── pacientesRoutes.js
    │   └── profissionaisRoutes.js
    ├── services/
    │   ├── agendamentosService.js
    │   ├── authService.js
    │   ├── clinicasService.js
    │   ├── disponibilidadesService.js
    │   ├── especialidadesService.js
    │   ├── pacientesService.js
    │   └── profissionaisService.js
    └── server.js
```

---

## 4. Configuração e execução

### 4.1 Pré-requisitos

- Node.js **19 ou superior** (recomendado: 20 LTS ou mais recente). O pacote `@neondatabase/serverless@1.1.0` declara `node >= 19`.
- npm.
- Uma instância PostgreSQL acessível. O projeto foi pensado para o **Neon**, mas qualquer PostgreSQL compatível com a connection string deve funcionar, desde que o schema exista.
- PowerShell (Windows) apenas para o script de carga `popular-banco.ps1`.

### 4.2 Variáveis de ambiente

Crie um arquivo `.env` na raiz, tomando `.env.example` como base:

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `DATABASE_URL` | Sim | — | Connection string PostgreSQL/Neon com `sslmode=require` |
| `PORT` | Não | `3000` | Porta HTTP do Express |
| `JWT_SECRET` | Sim | — | Chave usada para assinar e verificar os tokens |
| `JWT_EXPIRES_IN` | Não | `8h` | Validade do token aceita pelo `jsonwebtoken` |

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require
PORT=3000
JWT_SECRET=CHAVE_SECRETA_FORTE
JWT_EXPIRES_IN=8h
```

Se `DATABASE_URL` não estiver definida, `src/config/database.js` lança erro na inicialização. Se `JWT_SECRET` não estiver definida, o login falha ao tentar assinar o token.

### 4.3 Instalação e execução

```bash
git clone https://github.com/eritsb/Projeto-Consulta-Facil-Backend.git
cd Projeto-Consulta-Facil-Backend
git checkout back-end-ericha
npm install
npm start
```

Modos disponíveis:

| Comando | Efeito |
|---|---|
| `npm start` | Executa `node src/server.js` |
| `npm run dev` | Executa `node --watch src/server.js` (reinício automático) |

Com o servidor ativo, a rota raiz confirma o funcionamento:

```http
GET http://localhost:3000/
```

```json
{
  "mensagem": "API Consulta Fácil funcionando"
}
```

### 4.4 Carga inicial de dados

O script `popular-banco.ps1` consome a API local e cria dados de demonstração de forma idempotente. O servidor precisa estar rodando em `http://localhost:3000` (a URL está fixa na primeira linha do script).

```powershell
powershell -ExecutionPolicy Bypass -File .\popular-banco.ps1
```

O script verifica cada registro antes de criar e reporta quantos foram criados. Massa criada:

| Entidade | Quantidade |
|---|---|
| Especialidades | 4 |
| Clínicas | 4 |
| Profissionais | 8 |
| Pacientes | 12 |
| Disponibilidades | 16 |
| Agendamentos | 8 |

Todas as senhas dos pacientes da massa são `123456`. As datas de disponibilidade e consulta estão entre `2026-09-27` e `2026-10-04`.

---

## 5. Modelo de dados

### 5.1 Observação importante

O repositório **não contém DDL, migrations ou arquivo de schema**. Estrutura, tipos e restrições abaixo foram **inferidos** das consultas SQL, das validações dos services e do script de carga. Restrições marcadas como "inferida" não podem ser confirmadas sem acesso ao banco.

### 5.2 Diagrama de relacionamentos

```mermaid
erDiagram
    CLINICAS ||--o{ PROFISSIONAIS : "id_clinica"
    ESPECIALIDADES ||--o{ PROFISSIONAIS : "id_especialidade"
    PROFISSIONAIS ||--o{ DISPONIBILIDADES : "id_profissional"
    PACIENTES ||--o{ AGENDAMENTOS : "id_paciente"
    PROFISSIONAIS ||--o{ AGENDAMENTOS : "id_profissional"
    DISPONIBILIDADES ||--o| AGENDAMENTOS : "id_disponibilidade"
```

### 5.3 Tabelas utilizadas pelo código

#### `pacientes`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_paciente` | serial/integer | PK |
| `nome` | varchar/text | Obrigatório na aplicação |
| `cpf` | varchar(11) | Único; armazenado apenas com dígitos |
| `data_nascimento` | date | Obrigatório na criação |
| `telefone` | varchar | Nulo permitido |
| `email` | varchar | Único; normalizado para minúsculas |
| `senha_hash` | varchar/text | Hash bcrypt (custo 10) |
| `endereco` | text | Nulo permitido |
| `ativo` | boolean | Padrão `true` |
| `data_cadastro` | timestamp | Padrão `now()` (inferido) |

#### `clinicas`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_clinica` | serial/integer | PK |
| `nome` | varchar(150) | Obrigatório; máximo validado na aplicação |
| `cnpj` | varchar(14) | Único; armazenado apenas com dígitos |
| `telefone` | varchar | Nulo permitido |
| `email` | varchar | Nulo permitido; validado quando informado |
| `endereco` | text | Obrigatório |
| `horario_funcionamento` | varchar/text | Nulo permitido |
| `ativo` | boolean | Padrão `true` |

#### `especialidades`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_especialidade` | serial/integer | PK |
| `nome` | varchar(100) | Único (comparação sem diferenciar maiúsculas) |
| `descricao` | text | Nulo permitido |
| `ativo` | boolean | Padrão `true` |

#### `profissionais`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_profissional` | serial/integer | PK |
| `id_clinica` | integer | FK → `clinicas` |
| `id_especialidade` | integer | FK → `especialidades` |
| `nome` | varchar/text | Obrigatório |
| `cpf` | varchar(11) | Único |
| `registro_profissional` | varchar | Obrigatório |
| `conselho` | varchar | Obrigatório |
| `telefone` | varchar | Nulo permitido |
| `email` | varchar | Nulo permitido; sem validação no service |
| `ativo` | boolean | Padrão `true` |
| — | — | Unicidade composta `(conselho, registro_profissional)` (inferida) |

#### `disponibilidades`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_disponibilidade` | serial/integer | PK |
| `id_profissional` | integer | FK → `profissionais` |
| `data` | date | Obrigatório |
| `hora_inicio` | time | Obrigatório |
| `hora_fim` | time | Obrigatório |
| `status` | varchar | `DISPONIVEL` ou `RESERVADO`; padrão `DISPONIVEL` |
| — | — | Unicidade composta `(id_profissional, data, hora_inicio, hora_fim)` (inferida) |

#### `agendamentos`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_agendamento` | serial/integer | PK |
| `id_paciente` | integer | FK → `pacientes` |
| `id_profissional` | integer | FK → `profissionais` |
| `id_disponibilidade` | integer | FK → `disponibilidades`; unicidade (inferida) |
| `data_consulta` | date | Copiada da disponibilidade |
| `hora_consulta` | time | Copiada de `hora_inicio` |
| `status` | varchar | `AGENDADO`, `CONFIRMADO`, `CANCELADO` ou `REALIZADO` |
| `observacao` | text | Nulo permitido |
| `data_criacao` | timestamp | Padrão `now()` (inferido) |

### 5.4 Tabelas citadas na documentação antiga e ausentes do código

O README anterior listava como "tabelas implementadas": `clinica_especialidade`, `triagens`, `recomendacoes` e `notificacoes`. **Não existe model, consulta, rota ou regra de negócio no código para essas tabelas.** Elas podem existir no banco por herança de uma versão anterior, mas não fazem parte do backend atual e foram removidas desta documentação como funcionalidades implementadas.

---

## 6. Referência da API

### 6.1 Convenções

| Item | Convenção |
|---|---|
| URL local | `http://localhost:3000` |
| URL pública | `https://back-end-pi-ihs1.onrender.com` |
| Formato | JSON (`Content-Type: application/json`) |
| IDs | Inteiros positivos |
| Datas | `YYYY-MM-DD` |
| Horários | `HH:MM` ou `HH:MM:SS` |
| Autenticação | `Authorization: Bearer <token>` |
| Paginação | Não implementada |
| Versionamento de API | Não implementado |

Os endpoints de listagem retornam **arrays diretamente**, sem envelope. Os endpoints de criação, atualização e exclusão variam entre:

- `{ "mensagem": "...", "<recurso>": {...} }`;
- o objeto do recurso sem envelope (profissionais e disponibilidades).

Erros seguem, em geral, o formato:

```json
{
  "erro": "Descrição do erro"
}
```

### 6.2 Status HTTP utilizados

| Código | Uso |
|---|---|
| `200` | Consulta, atualização, cancelamento ou exclusão bem-sucedidos |
| `201` | Recurso criado |
| `400` | Dados inválidos, campos ausentes ou IDs inválidos |
| `401` | Credenciais inválidas ou token ausente/inválido/expirado |
| `403` | Conta inativa ou perfil sem permissão |
| `404` | Recurso ou rota não encontrados |
| `409` | Duplicidade, conflito de horário ou regra de negócio violada |
| `500` | Falha interna não tratada |

Alguns controllers de profissionais e disponibilidades são mais simples e podem devolver `400`, `404` ou `500` de forma menos precisa que os demais.

### 6.3 Rotas gerais e de autenticação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/` | Verifica se a API está no ar | Não |
| POST | `/auth/login` | Autentica um paciente | Não |
| GET | `/auth/perfil` | Retorna o perfil do paciente autenticado | Sim (PACIENTE) |

#### POST `/auth/login`

```json
{
  "email": "lucas.ferreira@consulta.com.br",
  "senha": "123456"
}
```

Resposta `200`:

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_paciente": 1,
    "nome": "Lucas Ferreira",
    "email": "lucas.ferreira@consulta.com.br",
    "perfil": "PACIENTE"
  }
}
```

Regras: e-mail e senha obrigatórios; e-mail validado por regex e normalizado; paciente deve existir e estar ativo; senha comparada com bcrypt. Credenciais inválidas retornam `401`, conta inativa retorna `403`.

#### GET `/auth/perfil`

```http
Authorization: Bearer <token>
```

Retorna os dados públicos do paciente (sem `senha_hash`) acrescidos de `"perfil": "PACIENTE"`.

### 6.4 Pacientes

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/pacientes` | Lista pacientes; aceita `?nome=` | Não |
| GET | `/pacientes/:id` | Busca por ID | Não |
| POST | `/pacientes` | Cadastra paciente | Não |
| PUT | `/pacientes/:id` | Atualiza paciente | Não |
| DELETE | `/pacientes/:id` | Exclui paciente | Não |

**Filtro:** `GET /pacientes?nome=ana` usa `ILIKE %ana%` e ordena por nome.

**Corpo de criação:**

```json
{
  "nome": "Ana Souza",
  "cpf": "123.456.789-00",
  "data_nascimento": "1994-05-20",
  "telefone": "81999990000",
  "email": "ana.souza@email.com",
  "senha": "123456",
  "endereco": "Rua Exemplo, 100, Recife - PE"
}
```

**Regras:**

- `nome`, `cpf`, `data_nascimento`, `email` e `senha` são obrigatórios.
- CPF é limpo para 11 dígitos e validado apenas por tamanho (não valida dígitos verificadores).
- E-mail é validado por regex e convertido para minúsculas.
- Senha deve ter no mínimo 6 caracteres e é armazenada como hash bcrypt (custo 10).
- CPF e e-mail devem ser únicos (`409`).
- `telefone` e `endereco` aceitam `null`.
- A atualização é parcial: campos omitidos preservam o valor atual.
- Exclusão com registros vinculados retorna `409`.

**Resposta de criação (`201`):**

```json
{
  "mensagem": "Paciente cadastrado com sucesso",
  "paciente": {
    "id_paciente": 13,
    "nome": "Ana Souza",
    "cpf": "12345678900",
    "data_nascimento": "1994-05-20",
    "telefone": "81999990000",
    "email": "ana.souza@email.com",
    "endereco": "Rua Exemplo, 100, Recife - PE",
    "ativo": true,
    "data_cadastro": "2026-10-23T12:00:00.000Z"
  }
}
```

### 6.5 Especialidades

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/especialidades` | Lista especialidades | Não |
| GET | `/especialidades/:id` | Busca por ID | Não |
| POST | `/especialidades` | Cadastra especialidade | Não |
| PUT | `/especialidades/:id` | Atualiza especialidade | Não |
| DELETE | `/especialidades/:id` | Exclui especialidade | Não |

**Corpo:**

```json
{
  "nome": "Cardiologia",
  "descricao": "Diagnóstico e tratamento de doenças do coração.",
  "ativo": true
}
```

**Regras:** nome obrigatório, máximo de 100 caracteres, único sem diferenciar maiúsculas; `descricao` opcional; `ativo` assume `true` quando omitido. Exclusão com vínculos retorna `409`.

### 6.6 Clínicas

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/clinicas` | Lista clínicas | Não |
| GET | `/clinicas/:id` | Busca por ID | Não |
| POST | `/clinicas` | Cadastra clínica | Não |
| PUT | `/clinicas/:id` | Atualiza clínica | Não |
| DELETE | `/clinicas/:id` | Exclui clínica | Não |

**Corpo:**

```json
{
  "nome": "Clínica Vida",
  "cnpj": "12.345.678/0001-90",
  "telefone": "8133334444",
  "email": "contato@clinicavida.com.br",
  "endereco": "Av. Boa Viagem, 500, Recife - PE",
  "horario_funcionamento": "Segunda a sexta, 08:00 às 18:00",
  "ativo": true
}
```

**Regras:** `nome`, `cnpj` e `endereco` obrigatórios; CNPJ limpo para 14 dígitos e validado apenas por tamanho; nome com máximo de 150 caracteres; e-mail validado quando informado; CNPJ único. Atualização parcial. Exclusão com profissionais ou especialidades vinculadas retorna `409`.

### 6.7 Profissionais

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/profissionais` | Lista e filtra profissionais | Não |
| GET | `/profissionais/:id` | Busca por ID | Não |
| POST | `/profissionais` | Cadastra profissional | Não |
| PUT | `/profissionais/:id` | Atualiza profissional | Não |
| DELETE | `/profissionais/:id` | Exclui profissional | Não |

**Filtros (query string):**

| Parâmetro | Comportamento |
|---|---|
| `nome` | Busca `ILIKE %nome%` |
| `clinica` | Filtra por `id_clinica` |
| `especialidade` | Filtra por `id_especialidade` |

A precedência é `nome` > `clinica` > `especialidade`. Sem filtro, lista todos. As listagens fazem `INNER JOIN` com clínicas e especialidades e retornam também `clinica_nome` e `especialidade_nome`.

**Corpo de criação:**

```json
{
  "id_clinica": 1,
  "id_especialidade": 1,
  "nome": "Dra. Mariana Costa",
  "cpf": "22233344455",
  "registro_profissional": "21001",
  "conselho": "CRM",
  "telefone": "81991110001",
  "email": "mariana.costa@consulta.com.br"
}
```

**Regras:** `nome`, `cpf`, `conselho`, `registro_profissional`, `id_clinica` e `id_especialidade` obrigatórios; CPF limpo e validado por tamanho; CPF único; par `(conselho, registro_profissional)` único. O cadastro força `ativo: true`. Diferentemente dos demais módulos, as respostas de criação, atualização e listagem não usam envelope `{ mensagem, ... }`; o recurso é retornado diretamente.

### 6.8 Disponibilidades

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/disponibilidades` | Lista todas, com nome do profissional | Não |
| GET | `/disponibilidades/profissional/:id` | Lista horários de um profissional | Não |
| GET | `/disponibilidades/:id` | Busca por ID | Não |
| POST | `/disponibilidades` | Cadastra horário | Não |
| PUT | `/disponibilidades/:id` | Atualiza horário | Não |
| DELETE | `/disponibilidades/:id` | Exclui horário | Não |

**Corpo de criação:**

```json
{
  "id_profissional": 1,
  "data": "2026-11-10",
  "hora_inicio": "08:00",
  "hora_fim": "10:00"
}
```

**Regras:**

- `id_profissional`, `data`, `hora_inicio` e `hora_fim` obrigatórios.
- O status é sempre criado como `DISPONIVEL`.
- Bloqueia duplicidade exata de profissional + data + início + fim.
- Não valida sobreposição de intervalos, datas passadas, ordem entre início e fim nem existência do profissional (a FK do banco cobre a última).
- A atualização (`PUT`) envia o recurso completo; o model grava todos os campos e não revalida duplicidade.
- As respostas retornam o objeto diretamente, sem envelope.

### 6.9 Agendamentos

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/agendamentos` | Lista todos com dados relacionados | Não |
| GET | `/agendamentos/:id` | Busca por ID | Não |
| GET | `/agendamentos/paciente/:idPaciente` | Lista por paciente | Não |
| POST | `/agendamentos` | Cria agendamento | Não |
| PUT | `/agendamentos/:id` | Atualiza observação/status | Não |
| PATCH | `/agendamentos/:id/cancelar` | Cancela agendamento | Não |
| DELETE | `/agendamentos/:id` | Exclui agendamento | Não |

**Corpo de criação:**

```json
{
  "id_paciente": 1,
  "id_profissional": 1,
  "id_disponibilidade": 1,
  "observacao": "Primeira consulta"
}
```

**Validações na criação:**

1. Paciente, profissional e disponibilidade são obrigatórios e numéricos.
2. Paciente deve existir e estar ativo (`404` ou `409`).
3. Disponibilidade deve existir (`404`).
4. Disponibilidade deve pertencer ao profissional informado (`400`).
5. Profissional deve estar ativo (`409`).
6. Disponibilidade deve estar com status `DISPONIVEL` (`409`).
7. Paciente não pode ter outro agendamento na mesma data e hora, exceto cancelado (`409`).
8. A reserva e o `INSERT` são executados em um único CTE atômico. Se o horário for reservado por outra requisição no intervalo, a operação retorna `409`.

**Regras de atualização:**

- Apenas `observacao` e `status` podem ser alterados.
- Status aceitos: `AGENDADO`, `CONFIRMADO`, `CANCELADO`, `REALIZADO`.
- Alterar para `CANCELADO` delega para a operação de cancelamento.
- Agendamento já cancelado não pode ser alterado.
- Não há operação de reagendamento (mudar data, hora ou profissional).

**Cancelamento:**

- Libera a disponibilidade para `DISPONIVEL`.
- Não cancela agendamento já `CANCELADO` ou `REALIZADO`.
- Executado em CTE atômico.

**Exclusão:**

- Remove o agendamento e libera a disponibilidade, independentemente do status atual.
- Não há bloqueio para exclusão de agendamento `REALIZADO`.

**Resposta de criação (`201`):**

```json
{
  "mensagem": "Agendamento realizado com sucesso",
  "agendamento": {
    "id_agendamento": 9,
    "id_paciente": 1,
    "paciente_nome": "Lucas Ferreira",
    "id_profissional": 1,
    "profissional_nome": "Dra. Mariana Costa",
    "registro_profissional": "21001",
    "conselho": "CRM",
    "id_clinica": 1,
    "clinica_nome": "Clinica Bem Estar",
    "id_especialidade": 1,
    "especialidade_nome": "Dermatologia",
    "id_disponibilidade": 1,
    "data_consulta": "2026-11-10",
    "hora_consulta": "08:00:00",
    "hora_fim": "10:00:00",
    "status": "AGENDADO",
    "observacao": "Primeira consulta",
    "data_criacao": "2026-10-23T12:00:00.000Z"
  }
}
```

---

## 7. Regras de negócio consolidadas

- CPF de paciente e de profissional é armazenado sem pontuação e validado apenas por comprimento (11 dígitos).
- CNPJ é armazenado sem pontuação e validado apenas por comprimento (14 dígitos).
- Senhas de pacientes usam bcrypt com custo 10; nunca são retornadas pela API.
- E-mails de pacientes e clínicas são normalizados para minúsculas.
- Especialidades e clínicas são identificadas por nome/CNPJ únicos.
- Profissionais pertencem obrigatoriamente a uma clínica e a uma especialidade.
- Um horário nasce `DISPONIVEL`; ao agendar, vira `RESERVADO`; ao cancelar ou excluir o agendamento, volta a `DISPONIVEL`.
- Um agendamento copia data e hora da disponibilidade no momento da criação.
- Não é possível agendar horário reservado, de profissional inativo ou para paciente inativo.
- Não é possível ter dois agendamentos ativos para o mesmo paciente na mesma data e hora.
- A reserva do horário é atômica, protegendo contra concorrência.
- O status do agendamento segue o ciclo: `AGENDADO` → `CONFIRMADO`/`REALIZADO`/`CANCELADO`; `CANCELADO` é terminal para novas alterações.
- Não há validação de data futura nem de sobreposição de horários na criação de disponibilidades.
- Não há paginação em nenhuma listagem.

---

## 8. Autenticação e autorização

### 8.1 Fluxo

1. `POST /auth/login` recebe e-mail e senha.
2. O service normaliza o e-mail, valida o formato, busca o paciente e verifica a senha com bcrypt.
3. Um JWT é assinado com `JWT_SECRET` e validade `JWT_EXPIRES_IN` (padrão `8h`).
4. O token é retornado junto com os dados básicos do paciente.
5. Rotas protegidas exigem `Authorization: Bearer <token>`.
6. O middleware verifica a assinatura e popula `req.usuario = { id, perfil }`.
7. `autorizarPerfis("PACIENTE")` restringe o acesso ao perfil esperado.

### 8.2 Payload do token

```json
{
  "id": 1,
  "perfil": "PACIENTE",
  "iat": 1761220800,
  "exp": 1761249600
}
```

### 8.3 Cobertura real da proteção

Apenas `GET /auth/perfil` usa autenticação e autorização. **Todos os endpoints de negócio (pacientes, especialidades, clínicas, profissionais, disponibilidades e agendamentos) estão públicos.** O README anterior não deixava isso explícito; esta documentação registra o comportamento real.

### 8.4 Limitações de segurança

- CORS aberto para qualquer origem (`app.use(cors())`).
- Sem `helmet`, rate limiting, lockout de conta ou revogação de token.
- Sem refresh token, logout server-side ou lista de tokens revogados.
- Sem proteção por perfil nos CRUDs administrativos.
- Sem validação de força de senha além do tamanho mínimo.
- `JWT_SECRET` precisa ser forte e exclusivo do ambiente.

---

## 9. Tratamento de erros

### 9.1 Padrão geral

Controllers com `tratarErro` devolvem:

```json
{
  "erro": "Mensagem"
}
```

Erros de negócio dos services são `Error` com `statusCode`. Códigos do PostgreSQL tratados:

| Código | Significado | Resposta |
|---|---|---|
| `23505` | Violação de unicidade | `409` |
| `23503` | Violação de chave estrangeira | `409` (pacientes, clínicas, especialidades) ou `400` (agendamentos) |

Rota inexistente retorna `404` com `{"erro":"Rota não encontrada"}`.

### 9.2 Inconsistências conhecidas

- `ProfissionaisController` e `DisponibilidadesController` não usam o helper padronizado e podem mapear qualquer falha para `400`, `404` ou `500`, com mensagem crua do banco.
- Não há middleware central de erros.
- Em `src/services/authService.js`, o método `criarErro` constrói `new Error(async (params) => { mensagem })`. O primeiro argumento de `Error` é convertido para string, portanto a mensagem retornada tende a ser o texto da função, e não a mensagem de negócio pretendida. O `statusCode` continua correto, mas o texto de erros de login/perfil pode sair incorreto.
- `package.json` aponta `main` para `index.js`, que não existe; o entrypoint real é `src/server.js`.

---

## 10. Implantação e infraestrutura

| Componente | Situação |
|---|---|
| Código-fonte | GitHub — `eritsb/Projeto-Consulta-Facil-Backend` |
| Backend | Render — `https://back-end-pi-ihs1.onrender.com` |
| Banco | Neon PostgreSQL via `DATABASE_URL` |
| Configuração de deploy no repo | Inexistente (sem `render.yaml`, Dockerfile ou CI) |

A URL pública foi verificada em 23/10/2026 e respondeu `200` com:

```json
{ "mensagem": "API Consulta Fácil funcionando" }
```

O serviço apresentou tempo de resposta superior a 30 segundos na primeira chamada, comportamento compatível com o cold start do plano gratuito do Render.

---

## 11. Análise de aderência entre README e código

| Afirmação do README anterior | Evidência no código | Decisão nesta documentação |
|---|---|---|
| Tabelas `clinica_especialidade`, `triagens`, `recomendacoes` e `notificacoes` implementadas | Nenhum model, query ou rota | Removidas como funcionalidades implementadas |
| "Consulta de profissionais por clínica/especialidade" e "horários por profissional" em próximas melhorias | Já implementadas em `Profissionais` e `GET /disponibilidades/profissional/:id` | Movidas para funcionalidades entregues |
| Estrutura de pastas sem `middlewares` | Existem `autenticacao.js` e `autorizarPerfis.js` | Adicionada à estrutura |
| Endpoints de pacientes sem busca por nome | `GET /pacientes?nome=` implementado | Adicionado |
| Endpoints de profissionais sem filtros | `?nome`, `?clinica` e `?especialidade` implementados | Adicionados |
| Disponibilidades sem rota por profissional | `GET /disponibilidades/profissional/:id` implementado | Adicionado |
| "PostgreSQL" | Driver real é `@neondatabase/serverless`; `pg` está instalado e sem uso | Esclarecido |
| "MVC" | Camadas Routes/Controllers/Services/Models, sem views | Reclassificado como arquitetura em camadas |
| "Validação de CPF" | Apenas comprimento de 11 dígitos | Precisado |
| "Senhas criptografadas" | Hash bcrypt | Terminologia corrigida |
| Deploy no Render | URL respondeu `200` (com cold start) | Verificado |
| "Deploy Banco" e checklist da primeira entrega | Não há schema, migrations ou configuração de deploy no repo | Marcado como não verificável pelo repositório |
| Node.js sem versão | Dependência exige `>= 19` | Adicionado |
| Testes, Swagger, pré-triagem e IA | Não existem no repositório | Mantidos como pendências |

---

## 12. Pendências e próximos passos reais

- Versionar o schema do banco (migrations ou `schema.sql`).
- Criar testes automatizados (unitários de services e integração das rotas).
- Adicionar Swagger/OpenAPI.
- Proteger as rotas administrativas com JWT e autorização por perfil.
- Restringir CORS e adicionar `helmet`, rate limiting e validação de entrada.
- Padronizar respostas e o tratamento de erros.
- Implementar paginação e filtros nas listagens.
- Implementar reagendamento.
- Validar CPF/CNPJ com dígitos verificadores.
- Impedir datas passadas e sobreposição de horários.
- Implementar a associação Clínica × Especialidade.
- Implementar pré-triagem, recomendações/IA e notificações.
- Remover a dependência `pg` não utilizada (ou passá-la a ser usada).
- Corrigir `criarErro` em `authService.js`.
- Atualizar as datas da massa de dados do script de carga.
- Criar endpoint de health check.

---

## 13. Integrantes

Projeto desenvolvido para a disciplina de Projeto Integrador — SENAC.

- Ericha Taina
- Felipe Michell
- Flávio Gonçalves
- Kennedy Veras
- Rejane Mendonça

Professor: Geraldo Gomes.

---

# PART 2 — ENGLISH

## 1. Overview

**Consulta Fácil** is the backend of a medical appointment management and scheduling platform, built as a SENAC Integrative Project. It exposes a REST API that handles administrative records, patient authentication, and the full appointment lifecycle.

The implemented scope includes:

- CRUD for patients, specialties, clinics, professionals, and availability slots;
- patient authentication with e-mail and password, returning a JWT;
- retrieval of the authenticated patient's profile;
- creation, listing, update, cancellation, and deletion of appointments;
- automatic slot reservation and release;
- persistence in PostgreSQL hosted on Neon;
- an idempotent PowerShell script that seeds the database through the API.

Out of the current scope: admin panel, password recovery, refresh tokens, file uploads, pre-triage, notifications, recommendations, automated tests, and OpenAPI/Swagger documentation.

| Item | Status |
|---|---|
| Application type | REST API (no view rendering) |
| Language | JavaScript (CommonJS) |
| Runtime | Node.js >= 19 |
| HTTP framework | Express 5 |
| Database | PostgreSQL on Neon |
| Authentication | JWT for patients |
| Backend deployment | Render (public URL verified) |
| Reference version | `1.0.0` (`package.json`) |

---

## 2. Verified technology stack

The table below only includes what is actually imported and used in the code.

| Technology | Version | Actual use in the project | Evidence |
|---|---|---|---|
| Node.js | `>= 19` | API runtime | `engines` of `@neondatabase/serverless` in `package-lock.json` |
| Express | `5.2.1` | HTTP server, routes, and middlewares | `src/server.js`, `src/routes/*` |
| @neondatabase/serverless | `1.1.0` | HTTP-based SQL client for Neon | `src/config/database.js` |
| PostgreSQL | Neon | Relational database | `DATABASE_URL` and SQL queries |
| jsonwebtoken | `9.0.3` | JWT signing and verification | `src/services/authService.js`, `src/middlewares/autenticacao.js` |
| bcryptjs | `3.0.3` | Password hashing and comparison | `src/services/authService.js`, `src/services/pacientesService.js` |
| dotenv | `18.0.3` | `.env` loading | `src/server.js`, `src/config/database.js` |
| cors | `2.8.6` | CORS handling | `src/server.js` |
| pg | `8.23.0` | **Installed but unused** | No `require("pg")` anywhere |
| PowerShell | 5.1+ | Seed script | `popular-banco.ps1` |

**Not present in the repository:** test framework, linter, formatter, Swagger/OpenAPI, ORM, migrations, Docker, CI/CD, or `render.yaml`.

---

## 3. Architecture

### 3.1 Architectural style

The project follows a **layered architecture** with separated responsibilities. The previous documentation called the pattern "MVC"; in practice there is no view layer, since the API only returns JSON. The actual flow is:

```text
HTTP client
    |
    v
server.js (Express, CORS, JSON, 404)
    |
    v
Routes (URL + method mapping)
    |
    v
Middlewares (authenticated routes only)
    |
    v
Controllers (HTTP: status code and response body)
    |
    v
Services (business rules and validation)
    |
    v
Models (parameterized SQL)
    |
    v
config/database.js (@neondatabase/serverless)
    |
    v
PostgreSQL (Neon)
```

### 3.2 Layer responsibilities

| Layer | Responsibility | Examples |
|---|---|---|
| `server.js` | Create the Express app, enable CORS and JSON, mount routes, handle 404, start the server | `app.use("/pacientes", pacientesRoutes)` |
| `routes` | Map method + path to a controller | `router.post("/", ...)` |
| `middlewares` | Authenticate JWTs and authorize profiles | `autenticacao`, `autorizarPerfis` |
| `controllers` | Translate HTTP into service calls and return status/body | `PacientesController.cadastrar` |
| `services` | Validate input, apply rules, throw errors with `statusCode` | `AgendamentosService.cadastrar` |
| `models` | Run parameterized SQL and return rows | `Pacientes.buscarPorEmailParaLogin` |
| `config` | Create the SQL client and validate `DATABASE_URL` | `src/config/database.js` |

### 3.3 Observed patterns

- Classes with **static methods** in controllers, services, and models.
- SQL written with `@neondatabase/serverless` **template tags**, using parameterized interpolation.
- Services throw `Error` objects with a `statusCode` property; controllers convert them into HTTP responses.
- Some controllers handle PostgreSQL codes (`23505` uniqueness and `23503` foreign key).
- There is no dependency injection, DTOs, validation library (Zod/Joi), or repository layer separate from the models.
- There is no global error middleware; each controller handles its own errors.

### 3.4 Actual folder structure

```text
Projeto-Consulta-Facil-Backend/
├── .env.example
├── .gitignore
├── DOCUMENTACAO.md
├── README.md
├── package.json
├── package-lock.json
├── popular-banco.ps1
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── agendamentosController.js
    │   ├── authController.js
    │   ├── clinicasController.js
    │   ├── disponibilidadesController.js
    │   ├── especialidadesController.js
    │   ├── pacientesController.js
    │   └── profissionaisController.js
    ├── middlewares/
    │   ├── autenticacao.js
    │   └── autorizarPerfis.js
    ├── models/
    │   ├── Agendamentos.js
    │   ├── Clinicas.js
    │   ├── Disponibilidades.js
    │   ├── Especialidades.js
    │   ├── Pacientes.js
    │   └── Profissionais.js
    ├── routes/
    │   ├── agendamentosRoutes.js
    │   ├── authRoutes.js
    │   ├── clinicasRoutes.js
    │   ├── disponibilidadesRoutes.js
    │   ├── especialidadesRoutes.js
    │   ├── pacientesRoutes.js
    │   └── profissionaisRoutes.js
    ├── services/
    │   ├── agendamentosService.js
    │   ├── authService.js
    │   ├── clinicasService.js
    │   ├── disponibilidadesService.js
    │   ├── especialidadesService.js
    │   ├── pacientesService.js
    │   └── profissionaisService.js
    └── server.js
```

---

## 4. Setup and execution

### 4.1 Prerequisites

- Node.js **19 or newer** (20 LTS or later recommended). The `@neondatabase/serverless@1.1.0` package declares `node >= 19`.
- npm.
- A reachable PostgreSQL instance. The project targets **Neon**, but any PostgreSQL compatible with the connection string should work as long as the schema exists.
- PowerShell (Windows) only for the `popular-banco.ps1` seed script.

### 4.2 Environment variables

Create a `.env` file at the repository root, based on `.env.example`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL/Neon connection string with `sslmode=require` |
| `PORT` | No | `3000` | Express HTTP port |
| `JWT_SECRET` | Yes | — | Key used to sign and verify tokens |
| `JWT_EXPIRES_IN` | No | `8h` | Token lifetime accepted by `jsonwebtoken` |

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
PORT=3000
JWT_SECRET=STRONG_SECRET_KEY
JWT_EXPIRES_IN=8h
```

If `DATABASE_URL` is missing, `src/config/database.js` throws during startup. If `JWT_SECRET` is missing, login fails when signing the token.

### 4.3 Installation and execution

```bash
git clone https://github.com/eritsb/Projeto-Consulta-Facil-Backend.git
cd Projeto-Consulta-Facil-Backend
git checkout back-end-ericha
npm install
npm start
```

Available commands:

| Command | Effect |
|---|---|
| `npm start` | Runs `node src/server.js` |
| `npm run dev` | Runs `node --watch src/server.js` (auto restart) |

With the server running, the root route confirms it is up:

```http
GET http://localhost:3000/
```

```json
{
  "mensagem": "API Consulta Fácil funcionando"
}
```

### 4.4 Seed data

The `popular-banco.ps1` script consumes the local API and creates demo data idempotently. The server must be running at `http://localhost:3000` (the URL is hardcoded on the script's first line).

```powershell
powershell -ExecutionPolicy Bypass -File .\popular-banco.ps1
```

The script checks every record before creating it and reports how many were created. Seeded data:

| Entity | Amount |
|---|---|
| Specialties | 4 |
| Clinics | 4 |
| Professionals | 8 |
| Patients | 12 |
| Availability slots | 16 |
| Appointments | 8 |

All seeded patient passwords are `123456`. Availability and appointment dates range from `2026-09-27` to `2026-10-04`.

---

## 5. Data model

### 5.1 Important note

The repository **does not contain DDL, migrations, or a schema file**. The structure, types, and constraints below were **inferred** from the SQL queries, service validations, and the seed script. Constraints marked as "inferred" cannot be confirmed without database access.

### 5.2 Relationship diagram

```mermaid
erDiagram
    CLINICAS ||--o{ PROFISSIONAIS : "id_clinica"
    ESPECIALIDADES ||--o{ PROFISSIONAIS : "id_especialidade"
    PROFISSIONAIS ||--o{ DISPONIBILIDADES : "id_profissional"
    PACIENTES ||--o{ AGENDAMENTOS : "id_paciente"
    PROFISSIONAIS ||--o{ AGENDAMENTOS : "id_profissional"
    DISPONIBILIDADES ||--o| AGENDAMENTOS : "id_disponibilidade"
```

### 5.3 Tables used by the code

#### `pacientes`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_paciente` | serial/integer | PK |
| `nome` | varchar/text | Required by the application |
| `cpf` | varchar(11) | Unique; digits only |
| `data_nascimento` | date | Required on creation |
| `telefone` | varchar | Nullable |
| `email` | varchar | Unique; normalized to lowercase |
| `senha_hash` | varchar/text | bcrypt hash (cost 10) |
| `endereco` | text | Nullable |
| `ativo` | boolean | Defaults to `true` |
| `data_cadastro` | timestamp | Defaults to `now()` (inferred) |

#### `clinicas`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_clinica` | serial/integer | PK |
| `nome` | varchar(150) | Required; max length validated in the app |
| `cnpj` | varchar(14) | Unique; digits only |
| `telefone` | varchar | Nullable |
| `email` | varchar | Nullable; validated when provided |
| `endereco` | text | Required |
| `horario_funcionamento` | varchar/text | Nullable |
| `ativo` | boolean | Defaults to `true` |

#### `especialidades`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_especialidade` | serial/integer | PK |
| `nome` | varchar(100) | Unique (case-insensitive comparison) |
| `descricao` | text | Nullable |
| `ativo` | boolean | Defaults to `true` |

#### `profissionais`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_profissional` | serial/integer | PK |
| `id_clinica` | integer | FK → `clinicas` |
| `id_especialidade` | integer | FK → `especialidades` |
| `nome` | varchar/text | Required |
| `cpf` | varchar(11) | Unique |
| `registro_profissional` | varchar | Required |
| `conselho` | varchar | Required |
| `telefone` | varchar | Nullable |
| `email` | varchar | Nullable; not validated in the service |
| `ativo` | boolean | Defaults to `true` |
| — | — | Composite uniqueness `(conselho, registro_profissional)` (inferred) |

#### `disponibilidades`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_disponibilidade` | serial/integer | PK |
| `id_profissional` | integer | FK → `profissionais` |
| `data` | date | Required |
| `hora_inicio` | time | Required |
| `hora_fim` | time | Required |
| `status` | varchar | `DISPONIVEL` or `RESERVADO`; defaults to `DISPONIVEL` |
| — | — | Composite uniqueness `(id_profissional, data, hora_inicio, hora_fim)` (inferred) |

#### `agendamentos`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_agendamento` | serial/integer | PK |
| `id_paciente` | integer | FK → `pacientes` |
| `id_profissional` | integer | FK → `profissionais` |
| `id_disponibilidade` | integer | FK → `disponibilidades`; uniqueness (inferred) |
| `data_consulta` | date | Copied from the availability slot |
| `hora_consulta` | time | Copied from `hora_inicio` |
| `status` | varchar | `AGENDADO`, `CONFIRMADO`, `CANCELADO`, or `REALIZADO` |
| `observacao` | text | Nullable |
| `data_criacao` | timestamp | Defaults to `now()` (inferred) |

### 5.4 Tables listed in the old documentation but absent from the code

The previous README listed `clinica_especialidade`, `triagens`, `recomendacoes`, and `notificacoes` as "implemented tables". **There is no model, query, route, or business rule for them in the code.** They may exist in the database from an earlier version, but they are not part of the current backend and were removed from this documentation as implemented features.

---

## 6. API reference

### 6.1 Conventions

| Item | Convention |
|---|---|
| Local URL | `http://localhost:3000` |
| Public URL | `https://back-end-pi-ihs1.onrender.com` |
| Format | JSON (`Content-Type: application/json`) |
| IDs | Positive integers |
| Dates | `YYYY-MM-DD` |
| Times | `HH:MM` or `HH:MM:SS` |
| Authentication | `Authorization: Bearer <token>` |
| Pagination | Not implemented |
| API versioning | Not implemented |

List endpoints return **arrays directly**, without an envelope. Create, update, and delete endpoints vary between:

- `{ "mensagem": "...", "<resource>": {...} }`;
- the resource object without an envelope (professionals and availability slots).

Errors generally follow this format:

```json
{
  "erro": "Error description"
}
```

### 6.2 HTTP status codes used

| Code | Usage |
|---|---|
| `200` | Successful read, update, cancellation, or deletion |
| `201` | Resource created |
| `400` | Invalid data, missing fields, or invalid IDs |
| `401` | Invalid credentials or missing/invalid/expired token |
| `403` | Inactive account or unauthorized profile |
| `404` | Resource or route not found |
| `409` | Duplicate, schedule conflict, or violated business rule |
| `500` | Unhandled internal failure |

Some professional and availability controllers are simpler and may return `400`, `404`, or `500` less precisely than the others.

### 6.3 General and authentication routes

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/` | Checks whether the API is running | No |
| POST | `/auth/login` | Authenticates a patient | No |
| GET | `/auth/perfil` | Returns the authenticated patient's profile | Yes (PACIENTE) |

#### POST `/auth/login`

```json
{
  "email": "lucas.ferreira@consulta.com.br",
  "senha": "123456"
}
```

`200` response:

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_paciente": 1,
    "nome": "Lucas Ferreira",
    "email": "lucas.ferreira@consulta.com.br",
    "perfil": "PACIENTE"
  }
}
```

Rules: e-mail and password are required; the e-mail is regex-validated and normalized; the patient must exist and be active; the password is compared with bcrypt. Invalid credentials return `401`, and an inactive account returns `403`.

#### GET `/auth/perfil`

```http
Authorization: Bearer <token>
```

Returns the patient's public data (without `senha_hash`) plus `"perfil": "PACIENTE"`.

### 6.4 Patients

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/pacientes` | Lists patients; accepts `?nome=` | No |
| GET | `/pacientes/:id` | Finds by ID | No |
| POST | `/pacientes` | Creates a patient | No |
| PUT | `/pacientes/:id` | Updates a patient | No |
| DELETE | `/pacientes/:id` | Deletes a patient | No |

**Filter:** `GET /pacientes?nome=ana` uses `ILIKE %ana%` and orders by name.

**Create body:**

```json
{
  "nome": "Ana Souza",
  "cpf": "123.456.789-00",
  "data_nascimento": "1994-05-20",
  "telefone": "81999990000",
  "email": "ana.souza@email.com",
  "senha": "123456",
  "endereco": "Rua Exemplo, 100, Recife - PE"
}
```

**Rules:**

- `nome`, `cpf`, `data_nascimento`, `email`, and `senha` are required.
- CPF is stripped to 11 digits and validated by length only (check digits are not validated).
- E-mail is regex-validated and lowercased.
- Password must have at least 6 characters and is stored as a bcrypt hash (cost 10).
- CPF and e-mail must be unique (`409`).
- `telefone` and `endereco` accept `null`.
- Updates are partial: omitted fields keep their current values.
- Deleting a patient with linked records returns `409`.

**Create response (`201`):**

```json
{
  "mensagem": "Paciente cadastrado com sucesso",
  "paciente": {
    "id_paciente": 13,
    "nome": "Ana Souza",
    "cpf": "12345678900",
    "data_nascimento": "1994-05-20",
    "telefone": "81999990000",
    "email": "ana.souza@email.com",
    "endereco": "Rua Exemplo, 100, Recife - PE",
    "ativo": true,
    "data_cadastro": "2026-10-23T12:00:00.000Z"
  }
}
```

### 6.5 Specialties

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/especialidades` | Lists specialties | No |
| GET | `/especialidades/:id` | Finds by ID | No |
| POST | `/especialidades` | Creates a specialty | No |
| PUT | `/especialidades/:id` | Updates a specialty | No |
| DELETE | `/especialidades/:id` | Deletes a specialty | No |

**Body:**

```json
{
  "nome": "Cardiologia",
  "descricao": "Diagnóstico e tratamento de doenças do coração.",
  "ativo": true
}
```

**Rules:** name is required, up to 100 characters, and unique case-insensitively; `descricao` is optional; `ativo` defaults to `true`. Deleting with links returns `409`.

### 6.6 Clinics

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/clinicas` | Lists clinics | No |
| GET | `/clinicas/:id` | Finds by ID | No |
| POST | `/clinicas` | Creates a clinic | No |
| PUT | `/clinicas/:id` | Updates a clinic | No |
| DELETE | `/clinicas/:id` | Deletes a clinic | No |

**Body:**

```json
{
  "nome": "Clínica Vida",
  "cnpj": "12.345.678/0001-90",
  "telefone": "8133334444",
  "email": "contato@clinicavida.com.br",
  "endereco": "Av. Boa Viagem, 500, Recife - PE",
  "horario_funcionamento": "Segunda a sexta, 08:00 às 18:00",
  "ativo": true
}
```

**Rules:** `nome`, `cnpj`, and `endereco` are required; CNPJ is stripped to 14 digits and validated by length only; name is limited to 150 characters; e-mail is validated when provided; CNPJ must be unique. Updates are partial. Deleting a clinic with linked professionals or specialties returns `409`.

### 6.7 Professionals

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/profissionais` | Lists and filters professionals | No |
| GET | `/profissionais/:id` | Finds by ID | No |
| POST | `/profissionais` | Creates a professional | No |
| PUT | `/profissionais/:id` | Updates a professional | No |
| DELETE | `/profissionais/:id` | Deletes a professional | No |

**Filters (query string):**

| Parameter | Behavior |
|---|---|
| `nome` | `ILIKE %nome%` search |
| `clinica` | Filters by `id_clinica` |
| `especialidade` | Filters by `id_especialidade` |

Precedence is `nome` > `clinica` > `especialidade`. Without a filter, all records are listed. Listings use `INNER JOIN` with clinics and specialties and also return `clinica_nome` and `especialidade_nome`.

**Create body:**

```json
{
  "id_clinica": 1,
  "id_especialidade": 1,
  "nome": "Dra. Mariana Costa",
  "cpf": "22233344455",
  "registro_profissional": "21001",
  "conselho": "CRM",
  "telefone": "81991110001",
  "email": "mariana.costa@consulta.com.br"
}
```

**Rules:** `nome`, `cpf`, `conselho`, `registro_profissional`, `id_clinica`, and `id_especialidade` are required; CPF is stripped and validated by length; CPF must be unique; the pair `(conselho, registro_profissional)` must be unique. Creation forces `ativo: true`. Unlike the other modules, create, update, and list responses do not use the `{ mensagem, ... }` envelope; the resource is returned directly.

### 6.8 Availability slots

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/disponibilidades` | Lists all slots with the professional's name | No |
| GET | `/disponibilidades/profissional/:id` | Lists a professional's slots | No |
| GET | `/disponibilidades/:id` | Finds by ID | No |
| POST | `/disponibilidades` | Creates a slot | No |
| PUT | `/disponibilidades/:id` | Updates a slot | No |
| DELETE | `/disponibilidades/:id` | Deletes a slot | No |

**Create body:**

```json
{
  "id_profissional": 1,
  "data": "2026-11-10",
  "hora_inicio": "08:00",
  "hora_fim": "10:00"
}
```

**Rules:**

- `id_profissional`, `data`, `hora_inicio`, and `hora_fim` are required.
- The status is always created as `DISPONIVEL`.
- Exact duplicates of professional + date + start + end are blocked.
- It does not validate overlapping intervals, past dates, start/end ordering, or professional existence (the database FK covers the last one).
- Updates (`PUT`) send the full resource; the model writes every field and does not revalidate duplicates.
- Responses return the object directly, without an envelope.

### 6.9 Appointments

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/agendamentos` | Lists all with related data | No |
| GET | `/agendamentos/:id` | Finds by ID | No |
| GET | `/agendamentos/paciente/:idPaciente` | Lists by patient | No |
| POST | `/agendamentos` | Creates an appointment | No |
| PUT | `/agendamentos/:id` | Updates notes/status | No |
| PATCH | `/agendamentos/:id/cancelar` | Cancels an appointment | No |
| DELETE | `/agendamentos/:id` | Deletes an appointment | No |

**Create body:**

```json
{
  "id_paciente": 1,
  "id_profissional": 1,
  "id_disponibilidade": 1,
  "observacao": "First visit"
}
```

**Creation validations:**

1. Patient, professional, and availability are required and numeric.
2. The patient must exist and be active (`404` or `409`).
3. The availability slot must exist (`404`).
4. The slot must belong to the given professional (`400`).
5. The professional must be active (`409`).
6. The slot must have status `DISPONIVEL` (`409`).
7. The patient cannot have another appointment at the same date and time, except a canceled one (`409`).
8. Reservation and `INSERT` run in a single atomic CTE. If another request takes the slot in the meantime, the operation returns `409`.

**Update rules:**

- Only `observacao` and `status` can be changed.
- Accepted statuses: `AGENDADO`, `CONFIRMADO`, `CANCELADO`, `REALIZADO`.
- Changing to `CANCELADO` delegates to the cancellation operation.
- An already canceled appointment cannot be changed.
- There is no rescheduling operation (changing date, time, or professional).

**Cancellation:**

- Releases the slot back to `DISPONIVEL`.
- Does not cancel an appointment that is already `CANCELADO` or `REALIZADO`.
- Runs in an atomic CTE.

**Deletion:**

- Removes the appointment and releases the slot, regardless of its current status.
- There is no block on deleting a `REALIZADO` appointment.

**Create response (`201`):**

```json
{
  "mensagem": "Agendamento realizado com sucesso",
  "agendamento": {
    "id_agendamento": 9,
    "id_paciente": 1,
    "paciente_nome": "Lucas Ferreira",
    "id_profissional": 1,
    "profissional_nome": "Dra. Mariana Costa",
    "registro_profissional": "21001",
    "conselho": "CRM",
    "id_clinica": 1,
    "clinica_nome": "Clinica Bem Estar",
    "id_especialidade": 1,
    "especialidade_nome": "Dermatologia",
    "id_disponibilidade": 1,
    "data_consulta": "2026-11-10",
    "hora_consulta": "08:00:00",
    "hora_fim": "10:00:00",
    "status": "AGENDADO",
    "observacao": "First visit",
    "data_criacao": "2026-10-23T12:00:00.000Z"
  }
}
```

---

## 7. Consolidated business rules

- Patient and professional CPFs are stored without punctuation and validated by length only (11 digits).
- CNPJ is stored without punctuation and validated by length only (14 digits).
- Patient passwords use bcrypt with cost 10 and are never returned by the API.
- Patient and clinic e-mails are normalized to lowercase.
- Specialties and clinics are identified by unique name/CNPJ.
- Professionals must belong to a clinic and a specialty.
- A slot starts as `DISPONIVEL`; when booked it becomes `RESERVADO`; when the appointment is canceled or deleted it returns to `DISPONIVEL`.
- An appointment copies the date and time from the slot at creation time.
- It is not possible to book a reserved slot, an inactive professional, or an appointment for an inactive patient.
- A patient cannot have two active appointments at the same date and time.
- Slot reservation is atomic, protecting against concurrency.
- Appointment status follows: `AGENDADO` → `CONFIRMADO`/`REALIZADO`/`CANCELADO`; `CANCELADO` is terminal for further changes.
- There is no validation for future dates or overlapping slots when creating availability.
- There is no pagination in any listing.

---

## 8. Authentication and authorization

### 8.1 Flow

1. `POST /auth/login` receives e-mail and password.
2. The service normalizes the e-mail, validates its format, finds the patient, and verifies the password with bcrypt.
3. A JWT is signed with `JWT_SECRET` and a lifetime from `JWT_EXPIRES_IN` (default `8h`).
4. The token is returned with the patient's basic data.
5. Protected routes require `Authorization: Bearer <token>`.
6. The middleware verifies the signature and populates `req.usuario = { id, perfil }`.
7. `autorizarPerfis("PACIENTE")` restricts access to the expected profile.

### 8.2 Token payload

```json
{
  "id": 1,
  "perfil": "PACIENTE",
  "iat": 1761220800,
  "exp": 1761249600
}
```

### 8.3 Actual protection coverage

Only `GET /auth/perfil` uses authentication and authorization. **All business endpoints (patients, specialties, clinics, professionals, availability, and appointments) are public.** The previous README did not make this explicit; this documentation records the actual behavior.

### 8.4 Security limitations

- CORS is open to every origin (`app.use(cors())`).
- No `helmet`, rate limiting, account lockout, or token revocation.
- No refresh token, server-side logout, or revoked-token list.
- No profile protection on administrative CRUDs.
- No password strength validation beyond minimum length.
- `JWT_SECRET` must be strong and environment-specific.

---

## 9. Error handling

### 9.1 General pattern

Controllers using `tratarErro` return:

```json
{
  "erro": "Message"
}
```

Business errors from services are `Error` objects with `statusCode`. Handled PostgreSQL codes:

| Code | Meaning | Response |
|---|---|---|
| `23505` | Uniqueness violation | `409` |
| `23503` | Foreign key violation | `409` (patients, clinics, specialties) or `400` (appointments) |

An unknown route returns `404` with `{"erro":"Rota não encontrada"}`.

### 9.2 Known inconsistencies

- `ProfissionaisController` and `DisponibilidadesController` do not use the standardized helper and may map any failure to `400`, `404`, or `500`, with the raw database message.
- There is no centralized error middleware.
- In `src/services/authService.js`, the `criarErro` method builds `new Error(async (params) => { mensagem })`. The first argument of `Error` is converted to a string, so the returned message tends to be the function source rather than the intended business message. `statusCode` remains correct, but login/profile error text may be wrong.
- `package.json` points `main` to `index.js`, which does not exist; the real entrypoint is `src/server.js`.

---

## 10. Deployment and infrastructure

| Component | Status |
|---|---|
| Source code | GitHub — `eritsb/Projeto-Consulta-Facil-Backend` |
| Backend | Render — `https://back-end-pi-ihs1.onrender.com` |
| Database | Neon PostgreSQL via `DATABASE_URL` |
| Deployment config in the repo | None (no `render.yaml`, Dockerfile, or CI) |

The public URL was checked on 2026-10-23 and returned `200` with:

```json
{ "mensagem": "API Consulta Fácil funcionando" }
```

The service took more than 30 seconds to respond on the first request, which is consistent with Render's free-tier cold start.

---

## 11. README vs. code adherence analysis

| Previous README claim | Code evidence | Decision in this documentation |
|---|---|---|
| `clinica_especialidade`, `triagens`, `recomendacoes`, and `notificacoes` tables implemented | No model, query, or route | Removed as implemented features |
| "Professionals by clinic/specialty" and "slots by professional" listed as future improvements | Already implemented in `Profissionais` and `GET /disponibilidades/profissional/:id` | Moved to delivered features |
| Folder structure without `middlewares` | `autenticacao.js` and `autorizarPerfis.js` exist | Added to the structure |
| Patient endpoints without name search | `GET /pacientes?nome=` implemented | Added |
| Professional endpoints without filters | `?nome`, `?clinica`, and `?especialidade` implemented | Added |
| Availability without a per-professional route | `GET /disponibilidades/profissional/:id` implemented | Added |
| "PostgreSQL" | Actual driver is `@neondatabase/serverless`; `pg` is installed but unused | Clarified |
| "MVC" | Routes/Controllers/Services/Models layers, no views | Reclassified as layered architecture |
| "CPF validation" | Length of 11 digits only | Clarified |
| "Encrypted passwords" | bcrypt hash | Terminology corrected |
| Render deployment | URL returned `200` (with cold start) | Verified |
| "Database deployment" and first-delivery checklist | No schema, migrations, or deployment config in the repo | Marked as unverifiable from the repository |
| Node.js without a version | Dependency requires `>= 19` | Added |
| Tests, Swagger, pre-triage, and AI | Not present in the repository | Kept as pending items |

---

## 12. Real pending items and next steps

- Version the database schema (migrations or `schema.sql`).
- Add automated tests (service unit tests and route integration tests).
- Add Swagger/OpenAPI.
- Protect administrative routes with JWT and profile-based authorization.
- Restrict CORS and add `helmet`, rate limiting, and input validation.
- Standardize responses and error handling.
- Implement pagination and filters in listings.
- Implement rescheduling.
- Validate CPF/CNPJ check digits.
- Prevent past dates and overlapping slots.
- Implement the Clinic × Specialty association.
- Implement pre-triage, recommendations/AI, and notifications.
- Remove the unused `pg` dependency (or start using it).
- Fix `criarErro` in `authService.js`.
- Update the seed script dates.
- Add a health check endpoint.

---

## 13. Contributors

Project developed for the SENAC Integrative Project course.

- Ericha Taina
- Felipe Michell
- Flávio Gonçalves
- Kennedy Veras
- Rejane Mendonça

Professor: Geraldo Gomes.
