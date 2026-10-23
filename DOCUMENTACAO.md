# Consulta Fácil — Documentação Técnica do Backend

> **Repositório:** https://github.com/eritsb/Projeto-Consulta-Facil-Backend
> **Data da análise:** 23/10/2026
> **Idiomas:** Português (Brasil) e English
---

# PARTE 1 — PORTUGUÊS (BR)

## 1. Visão geral

O **Consulta Fácil** é o backend de uma plataforma de gerenciamento e agendamento de consultas médicas, desenvolvido como Projeto Integrador do SENAC. A aplicação expõe uma API REST responsável por cadastros administrativos, autenticação de usuários e pelo ciclo completo de agendamento de consultas.

O escopo implementado no código inclui:

- CRUD de pacientes, especialidades, clínicas, profissionais, disponibilidades e agendamentos;
- CRUD de administradores protegido por perfil `ADMIN`;
- autenticação de pacientes, profissionais e administradores com e-mail e senha, retornando JWT;
- consulta do perfil do usuário autenticado;
- reserva e liberação automática de horários;
- filtros de busca por nome em pacientes, clínicas, especialidades e profissionais;
- filtros de profissionais por clínica e por especialidade;
- consulta de disponibilidades por profissional;
- documentação Swagger/OpenAPI servida pela própria API;
- script de carga inicial (`seed.js`) executado diretamente no banco;
- persistência em PostgreSQL hospedado no Neon.

Fora do escopo atual: refresh token, recuperação de senha, logout server-side, upload de arquivos, pré-triagem, notificações, recomendações com IA, testes automatizados, migrations, Docker e pipeline de CI/CD.

| Item | Situação |
|---|---|
| Tipo de aplicação | API REST (sem renderização de views) |
| Linguagem | JavaScript (CommonJS) |
| Runtime | Node.js `>= 19` |
| Framework HTTP | Express 5 |
| Banco | PostgreSQL no Neon |
| Autenticação | JWT para `PACIENTE`, `PROFISSIONAL` e `ADMIN` |
| Documentação | Swagger UI em `/api-docs/` |
| Deploy do backend | Render |
| Versão de referência | `1.0.0` (`package.json`) |

---

## 2. Stack tecnológica verificada

A tabela abaixo considera apenas o que está efetivamente importado e utilizado no código.

| Tecnologia | Versão | Uso real no projeto | Evidência |
|---|---|---|---|
| Node.js | `>= 19` | Runtime da API | `engines` de `@neondatabase/serverless` em `package-lock.json` |
| Express | `5.2.1` | Servidor HTTP, rotas e middlewares | `src/server.js`, `src/routes/*` |
| @neondatabase/serverless | `1.1.0` | Cliente SQL sobre HTTP para o Neon | `src/config/database.js`, `seed.js` |
| PostgreSQL | Neon | Banco relacional | `DATABASE_URL` e consultas SQL |
| jsonwebtoken | `9.0.3` | Assinatura e verificação do JWT | `src/services/authService.js`, `src/middlewares/autenticacao.js` |
| bcryptjs | `3.0.3` | Hash e comparação de senhas | `authService`, `pacientesService`, `profissionaisService`, `administradoresService`, `seed.js` |
| dotenv | `18.0.3` | Carregamento do `.env` | `src/server.js`, `src/config/database.js`, `seed.js` |
| cors | `2.8.6` | Liberação de CORS | `src/server.js` |
| helmet | `8.3.0` | Cabeçalhos HTTP de segurança | `src/server.js` |
| morgan | `1.12.1` | Log de requisições HTTP | `src/server.js` |
| swagger-jsdoc | `6.3.0` | Geração da especificação OpenAPI | `src/swagger.js` |
| swagger-ui-express | `5.0.1` | Interface Swagger | `src/server.js` |

**Não existem no repositório:** framework de testes, linter, formatador, ORM, migrations, Docker, pipeline de CI/CD ou `render.yaml`.

> O pacote `pg` aparece no `package.json`, mas não é importado em nenhum arquivo e não faz parte da arquitetura em uso. O acesso ao banco é feito exclusivamente por `@neondatabase/serverless`.

---

## 3. Arquitetura

### 3.1 Estilo arquitetural

O projeto segue uma **arquitetura em camadas** com separação de responsabilidades. Não há camada de views, pois a API apenas retorna JSON. O fluxo real é:

```text
Cliente HTTP
    |
    v
server.js (Express, helmet, morgan, CORS, JSON, Swagger, 404)
    |
    v
Routes (mapeamento de URL e método; comentários Swagger)
    |
    v
Middlewares (apenas nas rotas protegidas)
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
| `server.js` | Criar o app Express, habilitar `helmet`, `morgan`, CORS e JSON, montar Swagger e rotas, tratar 404 e iniciar o servidor | `app.use("/administradores", administradoresRoutes)` |
| `routes` | Associar método + caminho ao controller e documentar no Swagger | `router.post("/", AdministradoresController.cadastrar)` |
| `middlewares` | Autenticar JWT e autorizar perfis | `autenticacao`, `autorizarPerfis` |
| `controllers` | Traduzir HTTP para service e devolver status/corpo | `PacientesController.cadastrar` |
| `services` | Validar dados, aplicar regras e lançar erros com `statusCode` | `AgendamentosService.cadastrar` |
| `models` | Executar SQL parametrizado e retornar linhas | `Pacientes.buscarPorEmailParaLogin` |
| `config` | Criar o cliente SQL e validar `DATABASE_URL` | `src/config/database.js` |
| `swagger.js` | Montar a especificação OpenAPI a partir de `src/routes/*.js` | `src/swagger.js` |

### 3.3 Padrões observados

- Classes com **métodos estáticos** em controllers, services e models.
- SQL escrito com **template tags** do `@neondatabase/serverless`, com interpolação parametrizada.
- Services lançam `Error` com a propriedade `statusCode`; controllers convertem em resposta HTTP.
- Alguns controllers tratam códigos do PostgreSQL (`23505` unicidade e `23503` chave estrangeira).
- Não há injeção de dependência, DTOs, biblioteca de validação (Zod/Joi) nem camada de repositório separada dos models.
- Não há middleware global de erros; cada controller trata os próprios erros.
- A documentação Swagger fica nos comentários JSDoc das rotas.

### 3.4 Estrutura real de pastas

```text
Projeto-Consulta-Facil-Backend/
├── .env.example
├── .gitignore
├── DOCUMENTACAO.md
├── README.md
├── package.json
├── package-lock.json
├── seed.js
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── administradoresController.js
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
    │   ├── Administradores.js
    │   ├── Agendamentos.js
    │   ├── Clinicas.js
    │   ├── Disponibilidades.js
    │   ├── Especialidades.js
    │   ├── Pacientes.js
    │   └── Profissionais.js
    ├── routes/
    │   ├── administradoresRoutes.js
    │   ├── agendamentosRoutes.js
    │   ├── authRoutes.js
    │   ├── clinicasRoutes.js
    │   ├── disponibilidadesRoutes.js
    │   ├── especialidadesRoutes.js
    │   ├── pacientesRoutes.js
    │   └── profissionaisRoutes.js
    ├── services/
    │   ├── administradoresService.js
    │   ├── agendamentosService.js
    │   ├── authService.js
    │   ├── clinicasService.js
    │   ├── disponibilidadesService.js
    │   ├── especialidadesService.js
    │   ├── pacientesService.js
    │   └── profissionaisService.js
    ├── server.js
    └── swagger.js
```

---

## 4. Configuração e execução

### 4.1 Pré-requisitos

- Node.js **19 ou superior** (recomendado: 20 LTS ou mais recente). O pacote `@neondatabase/serverless@1.1.0` declara `node >= 19`.
- npm.
- Uma instância PostgreSQL acessível. O projeto foi pensado para o **Neon**, mas qualquer PostgreSQL compatível com a connection string deve funcionar, desde que o schema exista.
- O schema do banco precisa existir antes de executar a API ou o seed. O repositório não contém DDL nem migrations.

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

Se `DATABASE_URL` não estiver definida, `src/config/database.js` lança erro na inicialização. Se `JWT_SECRET` não estiver definida, o login e a validação de token falham com `500`.

### 4.3 Instalação e execução

```bash
git clone https://github.com/eritsb/Projeto-Consulta-Facil-Backend.git
cd Projeto-Consulta-Facil-Backend
git checkout backend-rejane
npm install
npm start
```

Modos disponíveis:

| Comando | Efeito |
|---|---|
| `npm start` | Executa `node src/server.js` |
| `npm run dev` | Executa `node --watch src/server.js` (reinício automático) |
| `npm run seed` | Executa `node seed.js` (carga inicial direto no banco) |

Com o servidor ativo, a rota raiz confirma o funcionamento:

```http
GET http://localhost:3000/
```

```json
{
  "mensagem": "API Consulta Fácil funcionando"
}
```

### 4.4 Swagger

A documentação interativa é montada em:

```text
http://localhost:3000/api-docs/
```

Em produção, a mesma interface está disponível em:

```text
https://back-end-pi-ihs1.onrender.com/api-docs/
```

A especificação é gerada por `swagger-jsdoc` a partir dos comentários das rotas. Ela declara dois servidores (local e Render) e o esquema de segurança `bearerAuth` (JWT). Nem todas as rotas públicas possuem anotação de segurança, o que reflete o comportamento real da API: apenas `/administradores` e `GET /auth/perfil` exigem token.

### 4.5 Carga inicial de dados (`seed.js`)

O script `seed.js` grava os dados diretamente no PostgreSQL por meio de `@neondatabase/serverless`, sem consumir a API. Ele exige `DATABASE_URL` no `.env` e pressupõe que o schema já exista.

```bash
npm run seed
```

O script é idempotente na prática: verifica registros existentes, usa `ON CONFLICT` para administradores e especialidades e atualiza registros encontrados. Ao final, imprime a contagem das tabelas e as credenciais de teste.

Massa criada:

| Entidade | Quantidade |
|---|---|
| Administradores | 1 |
| Especialidades | 4 |
| Clínicas | 4 |
| Profissionais | 8 |
| Pacientes | 8 |
| Disponibilidades | 12 |
| Agendamentos | 4 |

Credenciais de teste:

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | `admin@consultafacil.com` | `Admin@123` |
| PROFISSIONAL | `mariana.costa@consulta.com.br` | `Profissional@123` |
| PACIENTE | `lucas.ferreira@consulta.com.br` | `123456` |

As disponibilidades e consultas da massa estão entre `2026-10-05` e `2026-10-12`. Os quatro primeiros agendamentos reservam as disponibilidades correspondentes.

---

## 5. Modelo de dados

### 5.1 Observação importante

O repositório **não contém DDL, migrations ou arquivo de schema**. Estrutura, tipos e restrições abaixo foram **inferidos** das consultas SQL, das validações dos services e do script `seed.js`. Restrições marcadas como "inferida" não podem ser confirmadas sem acesso ao banco.

### 5.2 Diagrama de relacionamentos

```mermaid
erDiagram
    CLINICAS ||--o{ PROFISSIONAIS : "id_clinica"
    ESPECIALIDADES ||--o{ PROFISSIONAIS : "id_especialidade"
    PROFISSIONAIS ||--o{ DISPONIBILIDADES : "id_profissional"
    PACIENTES ||--o{ AGENDAMENTOS : "id_paciente"
    PROFISSIONAIS ||--o{ AGENDAMENTOS : "id_profissional"
    DISPONIBILIDADES ||--o| AGENDAMENTOS : "id_disponibilidade"

    ADMINISTRADORES {
        int id_administrador PK
        string nome
        string email
        string senha_hash
        string perfil
        boolean ativo
        timestamp data_cadastro
    }
```

O administrador é uma entidade isolada: não possui vínculo com clínicas, profissionais ou agendamentos. O vínculo entre clínica e especialidade é feito **pelo profissional**, que aponta para uma clínica e para uma especialidade.

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
| `perfil` | varchar | Gravado como `PACIENTE` |
| `ativo` | boolean | Padrão `true` |
| `data_cadastro` | timestamp | Padrão `now()` (inferido) |

#### `profissionais`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_profissional` | serial/integer | PK |
| `id_clinica` | integer | FK → `clinicas` |
| `id_especialidade` | integer | FK → `especialidades` |
| `nome` | varchar/text | Obrigatório |
| `cpf` | varchar(11) | Único; apenas dígitos |
| `registro_profissional` | varchar | Obrigatório |
| `conselho` | varchar | Obrigatório; normalizado para maiúsculas |
| `telefone` | varchar | Nulo permitido |
| `email` | varchar | Obrigatório e único na aplicação |
| `senha_hash` | varchar/text | Hash bcrypt (custo 10) |
| `perfil` | varchar | Gravado como `PROFISSIONAL` |
| `ativo` | boolean | Padrão `true` |
| — | — | Unicidade composta `(conselho, registro_profissional)` (inferida) |

#### `administradores`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_administrador` | serial/integer | PK |
| `nome` | varchar/text | Obrigatório |
| `email` | varchar | Único; comparado sem diferenciar maiúsculas |
| `senha_hash` | varchar/text | Hash bcrypt (custo 10) |
| `perfil` | varchar | Gravado como `ADMIN` |
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

#### `disponibilidades`

| Coluna | Tipo inferido | Restrição/observação |
|---|---|---|
| `id_disponibilidade` | serial/integer | PK |
| `id_profissional` | integer | FK → `profissionais` |
| `data` | date | Obrigatório na aplicação |
| `hora_inicio` | time | Obrigatório na aplicação |
| `hora_fim` | time | Obrigatório na aplicação |
| `status` | varchar | `DISPONIVEL` ou `RESERVADO`; criado como `DISPONIVEL` |
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

### 5.4 Observações sobre o modelo

- Não existe tabela de associação entre clínicas e especialidades; o profissional é o elo entre as duas.
- O campo `perfil` é gravado nas tabelas `pacientes`, `profissionais` e `administradores` e é usado no login e na autorização.
- O schema precisa ser criado manualmente no Neon; o seed apenas popula tabelas existentes.

---

## 6. Referência da API

### 6.1 Convenções

| Item | Convenção |
|---|---|
| URL local | `http://localhost:3000` |
| URL pública | `https://back-end-pi-ihs1.onrender.com` |
| Swagger local | `http://localhost:3000/api-docs/` |
| Swagger público | `https://back-end-pi-ihs1.onrender.com/api-docs/` |
| Formato | JSON (`Content-Type: application/json`) |
| IDs | Inteiros positivos |
| Datas | `YYYY-MM-DD` |
| Horários | `HH:MM` ou `HH:MM:SS` |
| Autenticação | `Authorization: Bearer <token>` |
| Paginação | Não implementada |
| Versionamento de API | Não implementado |

Os endpoints de listagem retornam **arrays diretamente**, sem envelope. Os endpoints de criação, atualização e exclusão variam entre:

- `{ "mensagem": "...", "<recurso>": {...} }`;
- o objeto do recurso sem envelope (profissionais, disponibilidades, administradores e login);
- `{ "mensagem": "...", "administrador": {...} }` na exclusão de administrador.

Erros seguem, em geral, o formato:

```json
{
  "erro": "Descrição do erro"
}
```

### 6.2 Status HTTP utilizados

| Código | Uso |
|---|---|
| `200` | Consulta, atualização, cancelamento, login ou exclusão bem-sucedidos |
| `201` | Recurso criado |
| `400` | Dados inválidos, campos ausentes, IDs inválidos ou conflito em controllers simplificados |
| `401` | Credenciais inválidas ou token ausente/inválido/expirado |
| `403` | Conta inativa ou perfil sem permissão |
| `404` | Recurso ou rota não encontrados |
| `409` | Duplicidade, conflito de horário ou regra de negócio violada |
| `500` | Falha interna não tratada |

Alguns controllers de profissionais, disponibilidades e administradores são mais simples e podem devolver `400`, `404` ou `500` de forma menos precisa que os demais.

### 6.3 Rotas gerais e de autenticação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/` | Verifica se a API está no ar | Não |
| POST | `/auth/login` | Autentica paciente, profissional ou administrador | Não |
| GET | `/auth/perfil` | Retorna o perfil do usuário autenticado | Sim (`PACIENTE`, `PROFISSIONAL` ou `ADMIN`) |

#### POST `/auth/login`

```json
{
  "email": "admin@consultafacil.com",
  "senha": "Admin@123"
}
```

Resposta `200`:

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador Sistema",
    "email": "admin@consultafacil.com",
    "perfil": "ADMIN"
  }
}
```

Regras:

- e-mail e senha são obrigatórios;
- o e-mail é validado por regex, normalizado para minúsculas e comparado sem diferenciar maiúsculas;
- a API procura o e-mail nas tabelas `pacientes`, `profissionais` e `administradores`;
- se o mesmo e-mail existir em mais de um perfil, retorna `409`;
- o usuário precisa existir, ter `senha_hash` e estar ativo;
- a senha é comparada com bcrypt;
- credenciais inválidas retornam `401`; conta inativa retorna `403`.

#### GET `/auth/perfil`

```http
Authorization: Bearer <token>
```

Retorna os dados públicos do usuário autenticado, sem `senha_hash`, acrescidos de `"perfil"`. O formato varia conforme o perfil:

- paciente: dados de `pacientes`;
- profissional: dados de `profissionais` com `clinica_nome` e `especialidade_nome`;
- administrador: dados de `administradores`.

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
  "senha": "12345678",
  "endereco": "Rua Exemplo, 100, Recife - PE"
}
```

**Regras:**

- `nome`, `cpf`, `data_nascimento`, `email` e `senha` são obrigatórios;
- CPF é limpo para 11 dígitos e validado apenas por tamanho (não valida dígitos verificadores);
- e-mail é validado por regex e convertido para minúsculas;
- senha deve ter no mínimo 8 caracteres e é armazenada como hash bcrypt (custo 10);
- CPF e e-mail devem ser únicos (`409`);
- `telefone` e `endereco` aceitam `null`;
- o cadastro força `perfil: "PACIENTE"` e `ativo: true`;
- a atualização é parcial: campos omitidos preservam o valor atual;
- a atualização aceita `ativo` e permite desativar o paciente;
- exclusão com registros vinculados retorna `409`.

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
    "perfil": "PACIENTE",
    "ativo": true,
    "data_cadastro": "2026-10-23T12:00:00.000Z"
  }
}
```

### 6.5 Especialidades

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/especialidades` | Lista especialidades; aceita `?nome=` | Não |
| GET | `/especialidades/:id` | Busca por ID | Não |
| POST | `/especialidades` | Cadastra especialidade | Não |
| PUT | `/especialidades/:id` | Atualiza especialidade | Não |
| DELETE | `/especialidades/:id` | Exclui especialidade | Não |

**Filtro:** `GET /especialidades?nome=cardio` usa `ILIKE %cardio%`. O filtro existe no controller, mas não está documentado no Swagger.

**Corpo:**

```json
{
  "nome": "Cardiologia",
  "descricao": "Diagnóstico e tratamento de doenças do coração.",
  "ativo": true
}
```

**Regras:** nome obrigatório, máximo de 100 caracteres, único sem diferenciar maiúsculas; `descricao` é opcional; `ativo` assume `true` quando omitido. Exclusão com vínculos retorna `409`.

**Resposta de criação (`201`):**

```json
{
  "mensagem": "Especialidade cadastrada com sucesso",
  "especialidade": {
    "id_especialidade": 5,
    "nome": "Cardiologia",
    "descricao": "Diagnóstico e tratamento de doenças do coração.",
    "ativo": true
  }
}
```

### 6.6 Clínicas

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/clinicas` | Lista clínicas; aceita `?nome=` | Não |
| GET | `/clinicas/:id` | Busca por ID | Não |
| POST | `/clinicas` | Cadastra clínica | Não |
| PUT | `/clinicas/:id` | Atualiza clínica | Não |
| DELETE | `/clinicas/:id` | Exclui clínica | Não |

**Filtro:** `GET /clinicas?nome=vida` usa `ILIKE %vida%`. O filtro existe no controller, mas não está documentado no Swagger.

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

**Regras:** `nome`, `cnpj` e `endereco` são obrigatórios; CNPJ é limpo para 14 dígitos e validado apenas por tamanho; nome tem máximo de 150 caracteres; e-mail é validado quando informado; CNPJ é único. Atualização parcial. Exclusão com profissionais vinculados retorna `409`.

**Resposta de criação (`201`):**

```json
{
  "mensagem": "Clínica cadastrada com sucesso",
  "clinica": {
    "id_clinica": 5,
    "nome": "Clínica Vida",
    "cnpj": "12345678000190",
    "telefone": "8133334444",
    "email": "contato@clinicavida.com.br",
    "endereco": "Av. Boa Viagem, 500, Recife - PE",
    "horario_funcionamento": "Segunda a sexta, 08:00 às 18:00",
    "ativo": true
  }
}
```

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
  "email": "mariana.costa@consulta.com.br",
  "senha": "Profissional@123",
  "ativo": true
}
```

**Regras:**

- `nome`, `cpf`, `conselho`, `registro_profissional`, `id_clinica`, `id_especialidade`, `email` e `senha` são obrigatórios;
- `telefone` é opcional;
- CPF é limpo e validado por tamanho (11 dígitos); CPF e e-mail devem ser únicos;
- o par `(conselho, registro_profissional)` deve ser único;
- o conselho é convertido para maiúsculas;
- a senha deve ter no mínimo 8 caracteres e é armazenada como hash bcrypt (custo 10);
- o cadastro grava `perfil: "PROFISSIONAL"`; `ativo` assume `true` quando omitido, mas pode ser enviado como `false`;
- as respostas de criação, atualização e listagem não usam envelope `{ mensagem, ... }`; o recurso é retornado diretamente;
- a criação e a atualização retornam os campos do profissional, sem `clinica_nome` e `especialidade_nome`; a busca por ID e a listagem retornam os nomes via `JOIN`.

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

- `id_profissional`, `data`, `hora_inicio` e `hora_fim` são obrigatórios;
- o status é sempre criado como `DISPONIVEL`;
- bloqueia duplicidade exata de profissional + data + início + fim;
- não valida sobreposição de intervalos, datas passadas, ordem entre início e fim nem existência do profissional (a FK do banco cobre a última);
- a atualização (`PUT`) envia o recurso completo; o model grava todos os campos e **não revalida** duplicidade nem status;
- as respostas retornam o objeto diretamente, sem envelope;
- a listagem geral retorna `profissional_nome`; a listagem por profissional e a busca por ID retornam apenas as colunas da tabela.

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

### 6.10 Administradores

Todas as rotas exigem `Authorization: Bearer <token>` de um usuário com perfil `ADMIN`. Como não há cadastro público de administrador, o primeiro usuário deve ser criado pelo `seed.js` ou diretamente no banco.

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/administradores` | Lista administradores | Sim (`ADMIN`) |
| GET | `/administradores/:id` | Busca por ID | Sim (`ADMIN`) |
| POST | `/administradores` | Cadastra administrador | Sim (`ADMIN`) |
| PUT | `/administradores/:id` | Atualiza administrador | Sim (`ADMIN`) |
| DELETE | `/administradores/:id` | Exclui administrador | Sim (`ADMIN`) |

**Corpo de criação:**

```json
{
  "nome": "Administrador Consulta Fácil",
  "email": "novo.admin@consultafacil.com",
  "senha": "Admin@123"
}
```

**Regras:**

- `nome`, `email` e `senha` são obrigatórios;
- o e-mail é convertido para minúsculas, mas **não é validado por regex**;
- a senha não possui regra mínima neste módulo e é armazenada como hash bcrypt (custo 10);
- o cadastro sempre grava `perfil: "ADMIN"` e `ativo: true`, ignorando `ativo` enviado no corpo;
- `GET /administradores` retorna um array;
- `GET /administradores/:id`, `POST` e `PUT` retornam o objeto do administrador diretamente;
- `DELETE` retorna `{ "mensagem": "Administrador removido", "administrador": {...} }`;
- a atualização altera apenas `nome`, `email` e `ativo`; `senha` enviada no `PUT` é ignorada;
- não há verificação de e-mail duplicado na atualização; se o banco tiver a restrição única, o erro é devolvido como `400`.

---

## 7. Regras de negócio consolidadas

- CPF de paciente e de profissional é armazenado sem pontuação e validado apenas por comprimento (11 dígitos).
- CNPJ é armazenado sem pontuação e validado apenas por comprimento (14 dígitos).
- Senhas de pacientes e profissionais exigem no mínimo 8 caracteres e usam bcrypt com custo 10; nunca são retornadas pela API.
- A senha de administrador não possui validação de tamanho no código atual, mas também usa bcrypt com custo 10.
- E-mails de pacientes, profissionais e clínicas são normalizados para minúsculas; administradores também são gravados em minúsculas no cadastro.
- O login aceita `PACIENTE`, `PROFISSIONAL` e `ADMIN`. Se o mesmo e-mail existir em mais de uma tabela, o login retorna `409`.
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
- Não há operação de reagendamento.
- O cadastro de paciente força `ativo: true`; a atualização pode desativá-lo.
- O cadastro de profissional permite enviar `ativo: false`.
- O cadastro de administrador força `ativo: true`.

---

## 8. Autenticação e autorização

### 8.1 Fluxo

1. `POST /auth/login` recebe e-mail e senha.
2. O service normaliza o e-mail, valida o formato e procura o usuário nas tabelas `pacientes`, `profissionais` e `administradores` em paralelo.
3. Se mais de um perfil usar o mesmo e-mail, a operação falha com `409`.
4. O usuário precisa estar ativo e possuir `senha_hash`; a senha é comparada com bcrypt.
5. Um JWT é assinado com `JWT_SECRET` e validade `JWT_EXPIRES_IN` (padrão `8h`), usando `HS256`.
6. O token é retornado junto com `id`, `nome`, `email` e `perfil`.
7. Rotas protegidas exigem `Authorization: Bearer <token>`.
8. O middleware verifica a assinatura e popula `req.usuario = { id, perfil }`.
9. `autorizarPerfis("ADMIN")` restringe o módulo de administradores; `GET /auth/perfil` aceita os três perfis.

### 8.2 Payload do token

```json
{
  "id": 1,
  "perfil": "ADMIN",
  "iat": 1761220800,
  "exp": 1761249600
}
```

O campo `id` é genérico: representa `id_paciente`, `id_profissional` ou `id_administrador`, conforme o perfil.

### 8.3 Cobertura real da proteção

| Recurso | Proteção |
|---|---|
| `/auth/login` | Pública |
| `GET /auth/perfil` | JWT + `PACIENTE`, `PROFISSIONAL` ou `ADMIN` |
| `/administradores` | JWT + `ADMIN` |
| `/pacientes` | Pública |
| `/especialidades` | Pública |
| `/clinicas` | Pública |
| `/profissionais` | Pública |
| `/disponibilidades` | Pública |
| `/agendamentos` | Pública |

**Todos os endpoints de negócio de pacientes, especialidades, clínicas, profissionais, disponibilidades e agendamentos estão públicos.** Apenas o módulo de administradores e o perfil autenticado exigem token.

### 8.4 Segurança implementada e limitações

Implementado:

- `helmet()` com cabeçalhos HTTP de segurança;
- `morgan("dev")` para log de requisições;
- JWT com algoritmo fixado em `HS256`;
- senhas com hash bcrypt;
- consultas SQL parametrizadas;
- variáveis de ambiente para segredo e banco;
- resposta de perfil sem `senha_hash`.

Limitações:

- CORS aberto para qualquer origem (`app.use(cors())`).
- Sem rate limiting, lockout de conta ou revogação de token.
- Sem refresh token, logout server-side ou lista de tokens revogados.
- Sem proteção por perfil nos CRUDs de negócio.
- O middleware não consulta o banco: um token continua válido mesmo que a conta seja desativada depois da emissão.
- Sem validação de força de senha para administradores.
- `JWT_SECRET` precisa ser forte e exclusivo do ambiente.

---

## 9. Tratamento de erros

### 9.1 Padrão geral

Controllers com helper `tratarErro` devolvem:

```json
{
  "erro": "Mensagem"
}
```

Erros de negócio dos services são `Error` com `statusCode`. Códigos do PostgreSQL tratados:

| Código | Significado | Resposta |
|---|---|---|
| `23505` | Violação de unicidade | `409` nos controllers padronizados; `400` nos simplificados |
| `23503` | Violação de chave estrangeira | `409` (pacientes, clínicas, especialidades) ou `400` (agendamentos) |

Rota inexistente retorna `404` com `{"erro":"Rota não encontrada"}`.

### 9.2 Comportamento por módulo

| Módulo | Tratamento |
|---|---|
| Auth, pacientes, clínicas, especialidades, agendamentos | Usam helper, respeitam `statusCode` e mapeiam alguns códigos do PostgreSQL |
| Profissionais | `GET /:id` devolve `404` para qualquer erro; `POST`, `PUT` e `DELETE` devolvem `400` para qualquer erro; `GET /` devolve `500` |
| Disponibilidades | `GET /` e `GET /profissional/:id` devolvem `500`; `GET /:id` e `DELETE` devolvem `404`; `POST` e `PUT` devolvem `400` |
| Administradores | `GET /` devolve `500`; `GET /:id` devolve `404`; `POST`, `PUT` e `DELETE` devolvem `400` |

### 9.3 Inconsistências conhecidas

- `ProfissionaisController`, `DisponibilidadesController` e `AdministradoresController` não usam o helper padronizado e podem mapear qualquer falha para `400`, `404` ou `500`, com mensagem crua do banco.
- Não há middleware central de erros.
- O Swagger de administradores anuncia `409` para e-mail duplicado, mas o controller devolve `400`.
- O Swagger de profissionais anuncia `409` para duplicidade, mas o controller devolve `400`.
- A exclusão de disponibilidade vinculada a agendamento tende a retornar `404`, embora a causa real seja conflito de FK.
- A atualização de administrador não verifica e-mail duplicado antes de executar o `UPDATE`.
- `package.json` aponta `main` para `index.js`, que não existe; o entrypoint real é `src/server.js`.

---

## 10. Implantação e infraestrutura

| Componente | Situação |
|---|---|
| Código-fonte | GitHub — `eritsb/Projeto-Consulta-Facil-Backend` |
| Backend | Render — `https://back-end-pi-ihs1.onrender.com` |
| Banco | Neon PostgreSQL via `DATABASE_URL` |
| Documentação | Swagger em `/api-docs/` |
| Configuração de deploy no repo | Inexistente (sem `render.yaml`, Dockerfile ou CI) |

A URL pública foi verificada em 23/10/2026 e respondeu `200` com:

```json
{ "mensagem": "API Consulta Fácil funcionando" }
```

O Swagger público também respondeu `200` em `https://back-end-pi-ihs1.onrender.com/api-docs/`.

Configuração de deploy indicada no README:

```text
Build Command: npm install
Start Command: npm start
```

Variáveis necessárias no Render:

```text
DATABASE_URL
PORT
JWT_SECRET
JWT_EXPIRES_IN
```

O schema do banco não é criado automaticamente pelo deploy. É necessário provisioná-lo no Neon e, opcionalmente, executar `npm run seed`.

---

## 11. Aderência entre README e código

| Afirmação do README | Evidência no código | Decisão nesta documentação |
|---|---|---|
| Tabelas listadas como implementadas sem model, query ou rota no código | A estrutura real contém apenas as tabelas usadas pelos models e pelo seed | Removidas da documentação de arquitetura |
| Login apenas de pacientes | Login aceita `PACIENTE`, `PROFISSIONAL` e `ADMIN` | Corrigido para autenticação multi-perfil |
| Swagger disponível | `swagger.js`, `swagger-ui-express` e anotações nas rotas | Confirmado e documentado |
| Script de carga | O script atual é `seed.js`, executado diretamente no banco | Documentado |
| Estrutura sem `administradores` | Existem model, service, controller e rotas de administradores | Adicionado à documentação |
| Tecnologias sem `helmet`, `morgan`, `swagger-jsdoc` e `swagger-ui-express` | Todos estão instalados e em uso | Adicionados à stack |
| Filtros de profissionais | `?nome`, `?clinica` e `?especialidade` implementados | Documentados |
| Busca de pacientes por nome | `GET /pacientes?nome=` implementado | Documentada |
| Busca de clínicas e especialidades por nome | Implementada no controller, mas ausente do Swagger | Documentada |
| Disponibilidades por profissional | `GET /disponibilidades/profissional/:id` implementado | Documentada |
| "PostgreSQL" | Driver real é `@neondatabase/serverless`; `pg` está instalado e sem uso | Esclarecido |
| "MVC" | Camadas Routes/Controllers/Services/Models, sem views | Reclassificado como arquitetura em camadas |
| "Validação de CPF" | Apenas comprimento de 11 dígitos | Precisado |
| "Senhas criptografadas" | Hash bcrypt | Terminologia corrigida |
| Deploy no Render | URL e Swagger responderam `200` | Verificado |
| Deploy do banco e checklist da primeira entrega | Não há schema, migrations ou configuração de deploy no repo | Marcado como não verificável pelo repositório |
| Node.js sem versão | Dependência exige `>= 19` | Adicionado |

---

## 12. Pendências e próximos passos reais

- Versionar o schema do banco (migrations ou `schema.sql`).
- Criar testes automatizados (unitários de services e integração das rotas).
- Proteger os CRUDs de negócio com JWT e autorização por perfil.
- Restringir CORS e adicionar rate limiting e validação de entrada.
- Padronizar respostas e o tratamento de erros, especialmente em profissionais, disponibilidades e administradores.
- Implementar paginação e filtros nas listagens.
- Implementar reagendamento.
- Validar CPF/CNPJ com dígitos verificadores.
- Impedir datas passadas e sobreposição de horários.
- Adicionar troca de senha de administrador e verificação de e-mail duplicado no `PUT`.
- Remover a dependência `pg` não utilizada (ou passá-la a ser usada).
- Corrigir `main` no `package.json` para `src/server.js` ou remover o campo.
- Documentar no Swagger os filtros `?nome` de clínicas e especialidades e os corpos completos de atualização.
- Alinhar o README com a stack e as funcionalidades reais.

---

## 13. Integrantes

Projeto desenvolvido para a disciplina de Projeto Integrador — SENAC.

**Backend**

- Rejane Ferreira de Mendonça
- Ericha Taina

**Frontend**

- Felipe Michell
- Kennedy Veras

---

# PART 2 — ENGLISH

## 1. Overview

**Consulta Fácil** is the backend of a medical appointment management and scheduling platform, built as a SENAC Integrative Project. It exposes a REST API for administrative records, user authentication, and the full appointment lifecycle.

The implemented scope includes:

- CRUD for patients, specialties, clinics, professionals, availability slots, and appointments;
- an admin CRUD protected by the `ADMIN` profile;
- authentication for patients, professionals, and administrators with e-mail and password, returning a JWT;
- retrieval of the authenticated user's profile;
- automatic slot reservation and release;
- name search filters for patients, clinics, specialties, and professionals;
- professional filters by clinic and specialty;
- availability lookup by professional;
- Swagger/OpenAPI documentation served by the API itself;
- a seed script (`seed.js`) that writes directly to the database;
- persistence in PostgreSQL hosted on Neon.

Out of the current scope: refresh tokens, password recovery, server-side logout, file uploads, pre-triage, notifications, AI recommendations, automated tests, migrations, Docker, and CI/CD.

| Item | Status |
|---|---|
| Application type | REST API (no view rendering) |
| Language | JavaScript (CommonJS) |
| Runtime | Node.js `>= 19` |
| HTTP framework | Express 5 |
| Database | PostgreSQL on Neon |
| Authentication | JWT for `PACIENTE`, `PROFISSIONAL`, and `ADMIN` |
| Documentation | Swagger UI at `/api-docs/` |
| Backend deployment | Render |
| Reference version | `1.0.0` (`package.json`) |

---

## 2. Verified technology stack

This table only includes what is actually imported and used by the code.

| Technology | Version | Actual use | Evidence |
|---|---|---|---|
| Node.js | `>= 19` | API runtime | `engines` of `@neondatabase/serverless` in `package-lock.json` |
| Express | `5.2.1` | HTTP server, routes, and middlewares | `src/server.js`, `src/routes/*` |
| @neondatabase/serverless | `1.1.0` | HTTP-based SQL client for Neon | `src/config/database.js`, `seed.js` |
| PostgreSQL | Neon | Relational database | `DATABASE_URL` and SQL queries |
| jsonwebtoken | `9.0.3` | JWT signing and verification | `authService`, `autenticacao` |
| bcryptjs | `3.0.3` | Password hashing and comparison | `authService`, `pacientesService`, `profissionaisService`, `administradoresService`, `seed.js` |
| dotenv | `18.0.3` | `.env` loading | `src/server.js`, `src/config/database.js`, `seed.js` |
| cors | `2.8.6` | CORS handling | `src/server.js` |
| helmet | `8.3.0` | HTTP security headers | `src/server.js` |
| morgan | `1.12.1` | HTTP request logging | `src/server.js` |
| swagger-jsdoc | `6.3.0` | OpenAPI specification generation | `src/swagger.js` |
| swagger-ui-express | `5.0.1` | Swagger interface | `src/server.js` |

**Not present in the repository:** test framework, linter, formatter, ORM, migrations, Docker, CI/CD, or `render.yaml`.

> `pg` appears in `package.json` but is not imported anywhere and is not part of the active architecture. Database access uses `@neondatabase/serverless` exclusively.

---

## 3. Architecture

### 3.1 Architectural style

The project follows a **layered architecture** with separated responsibilities. There is no view layer because the API only returns JSON. The actual flow is:

```text
HTTP client
    |
    v
server.js (Express, helmet, morgan, CORS, JSON, Swagger, 404)
    |
    v
Routes (URL + method mapping; Swagger comments)
    |
    v
Middlewares (protected routes only)
    |
    v
Controllers (HTTP status and response body)
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
| `server.js` | Create the Express app, enable `helmet`, `morgan`, CORS, and JSON, mount Swagger and routes, handle 404, start the server | `app.use("/administradores", administradoresRoutes)` |
| `routes` | Map method + path to a controller and document it in Swagger | `router.post("/", AdministradoresController.cadastrar)` |
| `middlewares` | Authenticate JWTs and authorize profiles | `autenticacao`, `autorizarPerfis` |
| `controllers` | Translate HTTP into service calls and return status/body | `PacientesController.cadastrar` |
| `services` | Validate input, apply rules, throw errors with `statusCode` | `AgendamentosService.cadastrar` |
| `models` | Run parameterized SQL and return rows | `Pacientes.buscarPorEmailParaLogin` |
| `config` | Create the SQL client and validate `DATABASE_URL` | `src/config/database.js` |
| `swagger.js` | Build the OpenAPI spec from `src/routes/*.js` | `src/swagger.js` |

### 3.3 Observed patterns

- Classes with **static methods** in controllers, services, and models.
- SQL written with `@neondatabase/serverless` **template tags**, using parameterized interpolation.
- Services throw `Error` objects with a `statusCode` property; controllers convert them into HTTP responses.
- Some controllers handle PostgreSQL codes (`23505` uniqueness and `23503` foreign key).
- There is no dependency injection, DTOs, validation library (Zod/Joi), or repository layer separate from the models.
- There is no global error middleware; each controller handles its own errors.
- Swagger documentation lives in the JSDoc comments of the routes.

### 3.4 Actual folder structure

```text
Projeto-Consulta-Facil-Backend/
├── .env.example
├── .gitignore
├── DOCUMENTACAO.md
├── README.md
├── package.json
├── package-lock.json
├── seed.js
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── administradoresController.js
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
    │   ├── Administradores.js
    │   ├── Agendamentos.js
    │   ├── Clinicas.js
    │   ├── Disponibilidades.js
    │   ├── Especialidades.js
    │   ├── Pacientes.js
    │   └── Profissionais.js
    ├── routes/
    │   ├── administradoresRoutes.js
    │   ├── agendamentosRoutes.js
    │   ├── authRoutes.js
    │   ├── clinicasRoutes.js
    │   ├── disponibilidadesRoutes.js
    │   ├── especialidadesRoutes.js
    │   ├── pacientesRoutes.js
    │   └── profissionaisRoutes.js
    ├── services/
    │   ├── administradoresService.js
    │   ├── agendamentosService.js
    │   ├── authService.js
    │   ├── clinicasService.js
    │   ├── disponibilidadesService.js
    │   ├── especialidadesService.js
    │   ├── pacientesService.js
    │   └── profissionaisService.js
    ├── server.js
    └── swagger.js
```

---

## 4. Setup and execution

### 4.1 Prerequisites

- Node.js **19 or newer** (20 LTS or later recommended). `@neondatabase/serverless@1.1.0` declares `node >= 19`.
- npm.
- A reachable PostgreSQL instance. The project targets **Neon**, but any PostgreSQL compatible with the connection string should work as long as the schema exists.
- The database schema must exist before running the API or the seed. The repository has no DDL or migrations.

### 4.2 Environment variables

Create a `.env` file at the repository root based on `.env.example`:

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

If `DATABASE_URL` is missing, `src/config/database.js` throws during startup. If `JWT_SECRET` is missing, login and token validation fail with `500`.

### 4.3 Installation and execution

```bash
git clone https://github.com/eritsb/Projeto-Consulta-Facil-Backend.git
cd Projeto-Consulta-Facil-Backend
git checkout backend-rejane
npm install
npm start
```

Available commands:

| Command | Effect |
|---|---|
| `npm start` | Runs `node src/server.js` |
| `npm run dev` | Runs `node --watch src/server.js` (auto restart) |
| `npm run seed` | Runs `node seed.js` (direct database seed) |

With the server running, the root route confirms it is up:

```http
GET http://localhost:3000/
```

```json
{
  "mensagem": "API Consulta Fácil funcionando"
}
```

### 4.4 Swagger

The interactive documentation is available at:

```text
http://localhost:3000/api-docs/
```

In production:

```text
https://back-end-pi-ihs1.onrender.com/api-docs/
```

The specification is generated by `swagger-jsdoc` from route comments. It declares two servers (local and Render) and the `bearerAuth` security scheme (JWT). Not every public route has a security annotation, which reflects the actual behavior: only `/administradores` and `GET /auth/perfil` require a token.

### 4.5 Seed data (`seed.js`)

`seed.js` writes directly to PostgreSQL through `@neondatabase/serverless`; it does not consume the API. It requires `DATABASE_URL` in `.env` and assumes the schema already exists.

```bash
npm run seed
```

The script is effectively idempotent: it checks existing records, uses `ON CONFLICT` for administrators and specialties, and updates records it finds. At the end it prints table counts and test credentials.

Seeded data:

| Entity | Amount |
|---|---|
| Administrators | 1 |
| Specialties | 4 |
| Clinics | 4 |
| Professionals | 8 |
| Patients | 8 |
| Availability slots | 12 |
| Appointments | 4 |

Test credentials:

| Profile | E-mail | Password |
|---|---|---|
| ADMIN | `admin@consultafacil.com` | `Admin@123` |
| PROFISSIONAL | `mariana.costa@consulta.com.br` | `Profissional@123` |
| PACIENTE | `lucas.ferreira@consulta.com.br` | `123456` |

Seeded availability and appointment dates range from `2026-10-05` to `2026-10-12`. The first four appointments reserve their corresponding slots.

---

## 5. Data model

### 5.1 Important note

The repository **does not contain DDL, migrations, or a schema file**. The structure, types, and constraints below were **inferred** from SQL queries, service validations, and `seed.js`. Constraints marked as "inferred" cannot be confirmed without database access.

### 5.2 Relationship diagram

```mermaid
erDiagram
    CLINICAS ||--o{ PROFISSIONAIS : "id_clinica"
    ESPECIALIDADES ||--o{ PROFISSIONAIS : "id_especialidade"
    PROFISSIONAIS ||--o{ DISPONIBILIDADES : "id_profissional"
    PACIENTES ||--o{ AGENDAMENTOS : "id_paciente"
    PROFISSIONAIS ||--o{ AGENDAMENTOS : "id_profissional"
    DISPONIBILIDADES ||--o| AGENDAMENTOS : "id_disponibilidade"

    ADMINISTRADORES {
        int id_administrador PK
        string nome
        string email
        string senha_hash
        string perfil
        boolean ativo
        timestamp data_cadastro
    }
```

Administrators are an isolated entity: they are not linked to clinics, professionals, or appointments. The clinic–specialty relationship is made **through the professional**, who points to one clinic and one specialty.

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
| `perfil` | varchar | Stored as `PACIENTE` |
| `ativo` | boolean | Defaults to `true` |
| `data_cadastro` | timestamp | Defaults to `now()` (inferred) |

#### `profissionais`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_profissional` | serial/integer | PK |
| `id_clinica` | integer | FK → `clinicas` |
| `id_especialidade` | integer | FK → `especialidades` |
| `nome` | varchar/text | Required |
| `cpf` | varchar(11) | Unique; digits only |
| `registro_profissional` | varchar | Required |
| `conselho` | varchar | Required; uppercased |
| `telefone` | varchar | Nullable |
| `email` | varchar | Required and unique in the application |
| `senha_hash` | varchar/text | bcrypt hash (cost 10) |
| `perfil` | varchar | Stored as `PROFISSIONAL` |
| `ativo` | boolean | Defaults to `true` |
| — | — | Composite uniqueness `(conselho, registro_profissional)` (inferred) |

#### `administradores`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_administrador` | serial/integer | PK |
| `nome` | varchar/text | Required |
| `email` | varchar | Unique; compared case-insensitively |
| `senha_hash` | varchar/text | bcrypt hash (cost 10) |
| `perfil` | varchar | Stored as `ADMIN` |
| `ativo` | boolean | Defaults to `true` |
| `data_cadastro` | timestamp | Defaults to `now()` (inferred) |

#### `clinicas`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_clinica` | serial/integer | PK |
| `nome` | varchar(150) | Required; max length validated in the application |
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

#### `disponibilidades`

| Column | Inferred type | Constraint/notes |
|---|---|---|
| `id_disponibilidade` | serial/integer | PK |
| `id_profissional` | integer | FK → `profissionais` |
| `data` | date | Required by the application |
| `hora_inicio` | time | Required by the application |
| `hora_fim` | time | Required by the application |
| `status` | varchar | `DISPONIVEL` or `RESERVADO`; created as `DISPONIVEL` |
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

### 5.4 Model notes

- There is no clinic–specialty association table; the professional links the two.
- The `perfil` column exists in `pacientes`, `profissionais`, and `administradores` and is used for login and authorization.
- The schema must be created manually in Neon; the seed only populates existing tables.

---

## 6. API reference

### 6.1 Conventions

| Item | Convention |
|---|---|
| Local URL | `http://localhost:3000` |
| Public URL | `https://back-end-pi-ihs1.onrender.com` |
| Local Swagger | `http://localhost:3000/api-docs/` |
| Public Swagger | `https://back-end-pi-ihs1.onrender.com/api-docs/` |
| Format | JSON (`Content-Type: application/json`) |
| IDs | Positive integers |
| Dates | `YYYY-MM-DD` |
| Times | `HH:MM` or `HH:MM:SS` |
| Authentication | `Authorization: Bearer <token>` |
| Pagination | Not implemented |
| API versioning | Not implemented |

List endpoints return **arrays directly**, without an envelope. Create, update, and delete endpoints vary between:

- `{ "mensagem": "...", "<resource>": {...} }`;
- the resource object without an envelope (professionals, availability, administrators, and login);
- `{ "mensagem": "...", "administrador": {...} }` on administrator deletion.

Errors generally follow this format:

```json
{
  "erro": "Error description"
}
```

### 6.2 HTTP status codes used

| Code | Usage |
|---|---|
| `200` | Successful read, update, cancellation, login, or deletion |
| `201` | Resource created |
| `400` | Invalid data, missing fields, invalid IDs, or conflicts in simplified controllers |
| `401` | Invalid credentials or missing/invalid/expired token |
| `403` | Inactive account or unauthorized profile |
| `404` | Resource or route not found |
| `409` | Duplicate, schedule conflict, or violated business rule |
| `500` | Unhandled internal failure |

Some professional, availability, and administrator controllers are simpler and may return `400`, `404`, or `500` less precisely than the others.

### 6.3 General and authentication routes

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/` | Checks whether the API is running | No |
| POST | `/auth/login` | Authenticates a patient, professional, or administrator | No |
| GET | `/auth/perfil` | Returns the authenticated user's profile | Yes (`PACIENTE`, `PROFISSIONAL`, or `ADMIN`) |

#### POST `/auth/login`

```json
{
  "email": "admin@consultafacil.com",
  "senha": "Admin@123"
}
```

`200` response:

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Administrador Sistema",
    "email": "admin@consultafacil.com",
    "perfil": "ADMIN"
  }
}
```

Rules:

- e-mail and password are required;
- the e-mail is regex-validated, lowercased, and compared case-insensitively;
- the API searches `pacientes`, `profissionais`, and `administradores`;
- if the same e-mail exists in more than one profile, it returns `409`;
- the user must exist, have a `senha_hash`, and be active;
- the password is compared with bcrypt;
- invalid credentials return `401`; an inactive account returns `403`.

#### GET `/auth/perfil`

```http
Authorization: Bearer <token>
```

Returns the authenticated user's public data, without `senha_hash`, plus `"perfil"`. The shape depends on the profile:

- patient: `pacientes` data;
- professional: `profissionais` data with `clinica_nome` and `especialidade_nome`;
- administrator: `administradores` data.

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
  "senha": "12345678",
  "endereco": "Rua Exemplo, 100, Recife - PE"
}
```

**Rules:**

- `nome`, `cpf`, `data_nascimento`, `email`, and `senha` are required;
- CPF is stripped to 11 digits and validated by length only (check digits are not validated);
- e-mail is regex-validated and lowercased;
- password must have at least 8 characters and is stored as a bcrypt hash (cost 10);
- CPF and e-mail must be unique (`409`);
- `telefone` and `endereco` accept `null`;
- creation forces `perfil: "PACIENTE"` and `ativo: true`;
- updates are partial: omitted fields keep their current values;
- updates accept `ativo` and can deactivate the patient;
- deleting a patient with linked records returns `409`.

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
    "perfil": "PACIENTE",
    "ativo": true,
    "data_cadastro": "2026-10-23T12:00:00.000Z"
  }
}
```

### 6.5 Specialties

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/especialidades` | Lists specialties; accepts `?nome=` | No |
| GET | `/especialidades/:id` | Finds by ID | No |
| POST | `/especialidades` | Creates a specialty | No |
| PUT | `/especialidades/:id` | Updates a specialty | No |
| DELETE | `/especialidades/:id` | Deletes a specialty | No |

**Filter:** `GET /especialidades?nome=cardio` uses `ILIKE %cardio%`. The filter exists in the controller but is not documented in Swagger.

**Body:**

```json
{
  "nome": "Cardiologia",
  "descricao": "Diagnóstico e tratamento de doenças do coração.",
  "ativo": true
}
```

**Rules:** name is required, up to 100 characters, and unique case-insensitively; `descricao` is optional; `ativo` defaults to `true`. Deleting with links returns `409`.

**Create response (`201`):**

```json
{
  "mensagem": "Especialidade cadastrada com sucesso",
  "especialidade": {
    "id_especialidade": 5,
    "nome": "Cardiologia",
    "descricao": "Diagnóstico e tratamento de doenças do coração.",
    "ativo": true
  }
}
```

### 6.6 Clinics

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/clinicas` | Lists clinics; accepts `?nome=` | No |
| GET | `/clinicas/:id` | Finds by ID | No |
| POST | `/clinicas` | Creates a clinic | No |
| PUT | `/clinicas/:id` | Updates a clinic | No |
| DELETE | `/clinicas/:id` | Deletes a clinic | No |

**Filter:** `GET /clinicas?nome=vida` uses `ILIKE %vida%`. The filter exists in the controller but is not documented in Swagger.

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

**Rules:** `nome`, `cnpj`, and `endereco` are required; CNPJ is stripped to 14 digits and validated by length only; name is limited to 150 characters; e-mail is validated when provided; CNPJ must be unique. Updates are partial. Deleting a clinic with linked professionals returns `409`.

**Create response (`201`):**

```json
{
  "mensagem": "Clínica cadastrada com sucesso",
  "clinica": {
    "id_clinica": 5,
    "nome": "Clínica Vida",
    "cnpj": "12345678000190",
    "telefone": "8133334444",
    "email": "contato@clinicavida.com.br",
    "endereco": "Av. Boa Viagem, 500, Recife - PE",
    "horario_funcionamento": "Segunda a sexta, 08:00 às 18:00",
    "ativo": true
  }
}
```

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
  "email": "mariana.costa@consulta.com.br",
  "senha": "Profissional@123",
  "ativo": true
}
```

**Rules:**

- `nome`, `cpf`, `conselho`, `registro_profissional`, `id_clinica`, `id_especialidade`, `email`, and `senha` are required;
- `telefone` is optional;
- CPF is stripped and validated by length (11 digits); CPF and e-mail must be unique;
- the pair `(conselho, registro_profissional)` must be unique;
- `conselho` is uppercased;
- password must have at least 8 characters and is stored as a bcrypt hash (cost 10);
- creation stores `perfil: "PROFISSIONAL"`; `ativo` defaults to `true` but can be sent as `false`;
- create, update, and list responses do not use the `{ mensagem, ... }` envelope; the resource is returned directly;
- create and update return the professional fields without `clinica_nome` and `especialidade_nome`; get-by-ID and listing return the names via `JOIN`.

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

- `id_profissional`, `data`, `hora_inicio`, and `hora_fim` are required;
- status is always created as `DISPONIVEL`;
- exact duplicates of professional + date + start + end are blocked;
- it does not validate overlapping intervals, past dates, start/end ordering, or professional existence (the database FK covers the last one);
- updates (`PUT`) send the full resource; the model writes every field and **does not revalidate** duplicates or status;
- responses return the object directly, without an envelope;
- the general listing returns `profissional_nome`; listing by professional and get-by-ID return only the table columns.

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

### 6.10 Administrators

All routes require `Authorization: Bearer <token>` from a user with the `ADMIN` profile. Since there is no public administrator registration, the first user must be created by `seed.js` or directly in the database.

| Method | Route | Description | Authentication |
|---|---|---|---|
| GET | `/administradores` | Lists administrators | Yes (`ADMIN`) |
| GET | `/administradores/:id` | Finds by ID | Yes (`ADMIN`) |
| POST | `/administradores` | Creates an administrator | Yes (`ADMIN`) |
| PUT | `/administradores/:id` | Updates an administrator | Yes (`ADMIN`) |
| DELETE | `/administradores/:id` | Deletes an administrator | Yes (`ADMIN`) |

**Create body:**

```json
{
  "nome": "Administrador Consulta Fácil",
  "email": "novo.admin@consultafacil.com",
  "senha": "Admin@123"
}
```

**Rules:**

- `nome`, `email`, and `senha` are required;
- e-mail is lowercased but **not regex-validated**;
- this module has no minimum password rule, and the password is stored as a bcrypt hash (cost 10);
- creation always stores `perfil: "ADMIN"` and `ativo: true`, ignoring `ativo` in the body;
- `GET /administradores` returns an array;
- `GET /administradores/:id`, `POST`, and `PUT` return the administrator object directly;
- `DELETE` returns `{ "mensagem": "Administrador removido", "administrador": {...} }`;
- updates only change `nome`, `email`, and `ativo`; `senha` in `PUT` is ignored;
- there is no duplicate e-mail check on update; if the database has a unique constraint, the error is returned as `400`.

---

## 7. Consolidated business rules

- Patient and professional CPFs are stored without punctuation and validated by length only (11 digits).
- CNPJ is stored without punctuation and validated by length only (14 digits).
- Patient and professional passwords require at least 8 characters and use bcrypt with cost 10; they are never returned by the API.
- The administrator password has no length validation in the current code but also uses bcrypt with cost 10.
- Patient, professional, and clinic e-mails are normalized to lowercase; administrators are also stored in lowercase on creation.
- Login accepts `PACIENTE`, `PROFISSIONAL`, and `ADMIN`. If the same e-mail exists in more than one table, login returns `409`.
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
- There is no rescheduling operation.
- Patient creation forces `ativo: true`; updates can deactivate it.
- Professional creation allows `ativo: false`.
- Administrator creation forces `ativo: true`.

---

## 8. Authentication and authorization

### 8.1 Flow

1. `POST /auth/login` receives e-mail and password.
2. The service normalizes the e-mail, validates its format, and searches `pacientes`, `profissionais`, and `administradores` in parallel.
3. If more than one profile uses the same e-mail, the operation fails with `409`.
4. The user must be active and have a `senha_hash`; the password is compared with bcrypt.
5. A JWT is signed with `JWT_SECRET` and a lifetime from `JWT_EXPIRES_IN` (default `8h`), using `HS256`.
6. The token is returned with `id`, `nome`, `email`, and `perfil`.
7. Protected routes require `Authorization: Bearer <token>`.
8. The middleware verifies the signature and populates `req.usuario = { id, perfil }`.
9. `autorizarPerfis("ADMIN")` restricts the administrator module; `GET /auth/perfil` accepts all three profiles.

### 8.2 Token payload

```json
{
  "id": 1,
  "perfil": "ADMIN",
  "iat": 1761220800,
  "exp": 1761249600
}
```

The `id` field is generic: it represents `id_paciente`, `id_profissional`, or `id_administrador`, depending on the profile.

### 8.3 Actual protection coverage

| Resource | Protection |
|---|---|
| `/auth/login` | Public |
| `GET /auth/perfil` | JWT + `PACIENTE`, `PROFISSIONAL`, or `ADMIN` |
| `/administradores` | JWT + `ADMIN` |
| `/pacientes` | Public |
| `/especialidades` | Public |
| `/clinicas` | Public |
| `/profissionais` | Public |
| `/disponibilidades` | Public |
| `/agendamentos` | Public |

**All business endpoints for patients, specialties, clinics, professionals, availability, and appointments are public.** Only the administrator module and the authenticated profile require a token.

### 8.4 Implemented security and limitations

Implemented:

- `helmet()` with HTTP security headers;
- `morgan("dev")` request logging;
- JWT with the algorithm fixed to `HS256`;
- bcrypt password hashing;
- parameterized SQL queries;
- environment variables for the secret and database;
- profile responses without `senha_hash`.

Limitations:

- CORS is open to every origin (`app.use(cors())`).
- No rate limiting, account lockout, or token revocation.
- No refresh token, server-side logout, or revoked-token list.
- No profile protection on business CRUDs.
- The middleware does not query the database: a token remains valid even if the account is deactivated after issuance.
- No password strength validation for administrators.
- `JWT_SECRET` must be strong and environment-specific.

---

## 9. Error handling

### 9.1 General pattern

Controllers using the `tratarErro` helper return:

```json
{
  "erro": "Message"
}
```

Business errors from services are `Error` objects with `statusCode`. Handled PostgreSQL codes:

| Code | Meaning | Response |
|---|---|---|
| `23505` | Uniqueness violation | `409` in standardized controllers; `400` in simplified ones |
| `23503` | Foreign key violation | `409` (patients, clinics, specialties) or `400` (appointments) |

An unknown route returns `404` with `{"erro":"Rota não encontrada"}`.

### 9.2 Behavior by module

| Module | Handling |
|---|---|
| Auth, patients, clinics, specialties, appointments | Use the helper, respect `statusCode`, and map some PostgreSQL codes |
| Professionals | `GET /:id` returns `404` for any error; `POST`, `PUT`, and `DELETE` return `400` for any error; `GET /` returns `500` |
| Availability | `GET /` and `GET /profissional/:id` return `500`; `GET /:id` and `DELETE` return `404`; `POST` and `PUT` return `400` |
| Administrators | `GET /` returns `500`; `GET /:id` returns `404`; `POST`, `PUT`, and `DELETE` return `400` |

### 9.3 Known inconsistencies

- `ProfissionaisController`, `DisponibilidadesController`, and `AdministradoresController` do not use the standardized helper and may map any failure to `400`, `404`, or `500`, with the raw database message.
- There is no centralized error middleware.
- The administrators Swagger announces `409` for duplicate e-mail, but the controller returns `400`.
- The professionals Swagger announces `409` for duplicates, but the controller returns `400`.
- Deleting an availability slot linked to an appointment tends to return `404`, even though the real cause is an FK conflict.
- Administrator updates do not check for duplicate e-mail before running the `UPDATE`.
- `package.json` points `main` to `index.js`, which does not exist; the real entrypoint is `src/server.js`.

---

## 10. Deployment and infrastructure

| Component | Status |
|---|---|
| Source code | GitHub — `eritsb/Projeto-Consulta-Facil-Backend` |
| Backend | Render — `https://back-end-pi-ihs1.onrender.com` |
| Database | Neon PostgreSQL via `DATABASE_URL` |
| Documentation | Swagger at `/api-docs/` |
| Deployment config in the repo | None (no `render.yaml`, Dockerfile, or CI) |

The public URL was checked on 2026-10-23 and returned `200` with:

```json
{ "mensagem": "API Consulta Fácil funcionando" }
```

The public Swagger also returned `200` at `https://back-end-pi-ihs1.onrender.com/api-docs/`.

Deployment settings from the README:

```text
Build Command: npm install
Start Command: npm start
```

Required environment variables on Render:

```text
DATABASE_URL
PORT
JWT_SECRET
JWT_EXPIRES_IN
```

The database schema is not created automatically by the deployment. It must be provisioned in Neon and, optionally, populated with `npm run seed`.

---

## 11. README vs. code adherence

| README claim | Code evidence | Decision in this documentation |
|---|---|---|
| Tables listed as implemented without a model, query, or route in the code | The actual structure only contains tables used by the models and the seed | Removed from the architecture documentation |
| Login only for patients | Login accepts `PACIENTE`, `PROFISSIONAL`, and `ADMIN` | Corrected to multi-profile authentication |
| Swagger available | `swagger.js`, `swagger-ui-express`, and route annotations | Confirmed and documented |
| Seed script | The current script is `seed.js`, executed directly against the database | Documented |
| Structure without `administradores` | Administrator model, service, controller, and routes exist | Added to the documentation |
| Stack without `helmet`, `morgan`, `swagger-jsdoc`, and `swagger-ui-express` | All are installed and used | Added to the stack |
| Professional filters | `?nome`, `?clinica`, and `?especialidade` implemented | Documented |
| Patient name search | `GET /pacientes?nome=` implemented | Documented |
| Clinic and specialty name search | Implemented in the controller but missing from Swagger | Documented |
| Availability by professional | `GET /disponibilidades/profissional/:id` implemented | Documented |
| "PostgreSQL" | Actual driver is `@neondatabase/serverless`; `pg` is installed but unused | Clarified |
| "MVC" | Routes/Controllers/Services/Models layers, no views | Reclassified as layered architecture |
| "CPF validation" | Length of 11 digits only | Clarified |
| "Encrypted passwords" | bcrypt hash | Terminology corrected |
| Render deployment | URL and Swagger returned `200` | Verified |
| Database deployment and first-delivery checklist | No schema, migrations, or deployment config in the repo | Marked as unverifiable from the repository |
| Node.js without a version | Dependency requires `>= 19` | Added |

---

## 12. Real pending items and next steps

- Version the database schema (migrations or `schema.sql`).
- Add automated tests (service unit tests and route integration tests).
- Protect business CRUDs with JWT and profile-based authorization.
- Restrict CORS and add rate limiting and input validation.
- Standardize responses and error handling, especially for professionals, availability, and administrators.
- Implement pagination and filters in listings.
- Implement rescheduling.
- Validate CPF/CNPJ check digits.
- Prevent past dates and overlapping slots.
- Add administrator password change and duplicate e-mail validation on `PUT`.
- Remove the unused `pg` dependency (or start using it).
- Fix `main` in `package.json` to `src/server.js` or remove the field.
- Document the `?nome` filters for clinics and specialties and the full update bodies in Swagger.
- Align the README with the actual stack and features.

---

## 13. Contributors

Project developed for the SENAC Integrative Project course.

**Backend**

- Rejane Ferreira de Mendonça
- Ericha Taina

**Frontend**

- Felipe Michell
- Kennedy Veras
