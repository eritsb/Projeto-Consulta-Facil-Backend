# Consulta Fácil - Backend

API REST do projeto **Consulta Fácil**, desenvolvida para gerenciar pacientes, clínicas, especialidades, profissionais de saúde, disponibilidades e agendamentos de consultas.

O backend utiliza Node.js, Express e PostgreSQL, com banco de dados hospedado no Neon e API publicada no Render.

---

## Equipe

### Backend

- Rejane Ferreira de Mendonça
- Ericha Taina

### Frontend

- Felipe Michell
- Kennedy Veras
- Flávio Gonçalves 

---

## Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- Neon Database
- JavaScript
- JWT
- bcryptjs
- Swagger
- CORS
- dotenv
- Git
- GitHub
- Render

---

## Arquitetura

O backend utiliza uma arquitetura em camadas:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
PostgreSQL
```

### Responsabilidades

- **Routes:** definem os endpoints da API.
- **Controllers:** recebem as requisições e retornam respostas HTTP.
- **Services:** concentram validações e regras de negócio.
- **Models:** executam consultas e operações no PostgreSQL.
- **Middlewares:** validam autenticação e autorização.
- **Config:** configura a conexão com o banco de dados.
- **Server:** inicializa a aplicação Express e registra as rotas.

---

## Estrutura do projeto

```text
src/
├── config/
│   └── database.js
│
├── controllers/
│   ├── agendamentosController.js
│   ├── authController.js
│   ├── clinicasController.js
│   ├── disponibilidadesController.js
│   ├── especialidadesController.js
│   ├── pacientesController.js
│   └── profissionaisController.js
│
├── middlewares/
│   ├── autenticacao.js
│   └── autorizarPerfis.js
│
├── models/
│   ├── Agendamentos.js
│   ├── Clinicas.js
│   ├── Disponibilidades.js
│   ├── Especialidades.js
│   ├── Pacientes.js
│   └── Profissionais.js
│
├── routes/
│   ├── agendamentosRoutes.js
│   ├── authRoutes.js
│   ├── clinicasRoutes.js
│   ├── disponibilidadesRoutes.js
│   ├── especialidadesRoutes.js
│   ├── pacientesRoutes.js
│   └── profissionaisRoutes.js
│
├── services/
│   ├── agendamentosService.js
│   ├── authService.js
│   ├── clinicasService.js
│   ├── disponibilidadesService.js
│   ├── especialidadesService.js
│   ├── pacientesService.js
│   └── profissionaisService.js
│
├── server.js
└── swagger.js
```

---

## Banco de dados

O projeto utiliza PostgreSQL hospedado no Neon.

Principais tabelas:

```text
pacientes
clinicas
especialidades
clinica_especialidade
profissionais
disponibilidades
agendamentos
triagens
recomendacoes
notificacoes
```

O Neon é utilizado como serviço de hospedagem do banco PostgreSQL na nuvem.

---

## API publicada

A API está publicada no Render:

[API Consulta Fácil](https://back-end-pi-ihs1.onrender.com/)

Resposta esperada:

```json
{
  "mensagem": "API Consulta Fácil funcionando"
}
```

---

## Documentação Swagger

A documentação interativa da API está disponível pelo Swagger.

### Ambiente local

http://localhost:3000/api-docs/

### Ambiente de produção

[Swagger no Render](https://back-end-pi-ihs1.onrender.com/)

O Swagger permite visualizar os endpoints, parâmetros, métodos HTTP e testar requisições diretamente pelo navegador.

---

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js
- npm
- Git

Verifique as instalações:

```bash
node -v
npm -v
git --version
```

---

## Instalação

Clone o repositório:

```bash
git clone https://github.com/eritsb/Projeto-Consulta-Facil-Backend.git
```

Entre na pasta:

```bash
cd Projeto-Consulta-Facil-Backend
```

Instale as dependências:

```bash
npm install
```

---

## Variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do backend:

```env
DATABASE_URL=STRING_DE_CONEXAO_DO_NEON
PORT=3000
JWT_SECRET=CHAVE_SECRETA_FORTE
JWT_EXPIRES_IN=8h
```

### Gerar uma chave JWT

Execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o valor gerado e use como `JWT_SECRET`.

> O arquivo `.env` contém informações privadas e não deve ser enviado ao GitHub.

Exemplo de `.env.example`:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require
PORT=3000
JWT_SECRET=CHAVE_SECRETA_FORTE
JWT_EXPIRES_IN=8h
```

---

## Executar o projeto

Inicie o backend:

```bash
npm start
```

Resultado esperado:

```text
Servidor rodando em http://localhost:3000
```

Para acessar a documentação:

```text
http://localhost:3000/api-docs/
```

---

# Autenticação

Atualmente, a autenticação foi implementada para o perfil:

```text
PACIENTE
```

O login utiliza e-mail e senha.

A senha é armazenada como hash utilizando bcryptjs. A API não retorna a senha nem o hash nas consultas.

---

## Realizar login

```http
POST /auth/login
```

### Exemplo de requisição

```json
{
  "email": "paciente@email.com",
  "senha": "123456"
}
```

### Exemplo de resposta

```json
{
  "mensagem": "Login realizado com sucesso",
  "token": "TOKEN_JWT",
  "usuario": {
    "id_paciente": "2",
    "nome": "Paciente Exemplo",
    "email": "paciente@email.com",
    "perfil": "PACIENTE"
  }
}
```

---

## Consultar o perfil autenticado

```http
GET /auth/perfil
```

A requisição deve conter:

```text
Authorization: Bearer TOKEN_JWT
```

### Exemplo de resposta

```json
{
  "id_paciente": "2",
  "nome": "Paciente Exemplo",
  "cpf": "12345678901",
  "telefone": "81999999999",
  "email": "paciente@email.com",
  "endereco": "Recife - PE",
  "ativo": true,
  "perfil": "PACIENTE"
}
```

---

# Endpoints

## Pacientes

### Listar pacientes

```http
GET /pacientes
```

### Pesquisar pacientes por nome

```http
GET /pacientes?nome=Maria
```

### Buscar paciente por ID

```http
GET /pacientes/:id
```

### Cadastrar paciente

```http
POST /pacientes
```

Exemplo:

```json
{
  "nome": "Maria Silva",
  "cpf": "98765432100",
  "data_nascimento": "1995-02-10",
  "telefone": "81988888888",
  "email": "maria@email.com",
  "senha": "123456",
  "endereco": "Recife - PE"
}
```

### Atualizar paciente

```http
PUT /pacientes/:id
```

Exemplo:

```json
{
  "telefone": "81977777777",
  "endereco": "Olinda - PE"
}
```

### Excluir paciente

```http
DELETE /pacientes/:id
```

---

## Especialidades

### Listar especialidades

```http
GET /especialidades
```

### Buscar especialidade por ID

```http
GET /especialidades/:id
```

### Cadastrar especialidade

```http
POST /especialidades
```

Exemplo:

```json
{
  "nome": "Cardiologia",
  "descricao": "Especialidade relacionada ao sistema cardiovascular",
  "ativo": true
}
```

### Atualizar especialidade

```http
PUT /especialidades/:id
```

### Excluir especialidade

```http
DELETE /especialidades/:id
```

---

## Clínicas

### Listar clínicas

```http
GET /clinicas
```

### Buscar clínica por ID

```http
GET /clinicas/:id
```

### Cadastrar clínica

```http
POST /clinicas
```

Exemplo:

```json
{
  "nome": "Clínica Consulta Fácil",
  "cnpj": "12345678000199",
  "telefone": "8133334444",
  "email": "contato@consultafacil.com",
  "endereco": "Avenida Recife, 1000 - Recife, PE",
  "horario_funcionamento": "Segunda a sexta, das 08:00 às 18:00",
  "ativo": true
}
```

### Atualizar clínica

```http
PUT /clinicas/:id
```

### Excluir clínica

```http
DELETE /clinicas/:id
```

---

## Profissionais

### Listar profissionais

```http
GET /profissionais
```

### Pesquisar por nome

```http
GET /profissionais?nome=Joao
```

### Filtrar por clínica

```http
GET /profissionais?clinica=1
```

### Filtrar por especialidade

```http
GET /profissionais?especialidade=1
```

### Buscar profissional por ID

```http
GET /profissionais/:id
```

### Cadastrar profissional

```http
POST /profissionais
```

Exemplo:

```json
{
  "id_clinica": 1,
  "id_especialidade": 1,
  "nome": "Profissional Exemplo",
  "cpf": "11122233344",
  "registro_profissional": "12345",
  "conselho": "CRM-PE",
  "telefone": "81999999999",
  "email": "profissional@consultafacil.com",
  "ativo": true
}
```

### Atualizar profissional

```http
PUT /profissionais/:id
```

### Excluir profissional

```http
DELETE /profissionais/:id
```

---

## Disponibilidades

### Listar disponibilidades

```http
GET /disponibilidades
```

### Listar disponibilidades por profissional

```http
GET /disponibilidades/profissional/:id
```

### Buscar disponibilidade por ID

```http
GET /disponibilidades/:id
```

### Cadastrar disponibilidade

```http
POST /disponibilidades
```

Exemplo:

```json
{
  "id_profissional": 1,
  "data": "2026-10-20",
  "hora_inicio": "08:00",
  "hora_fim": "09:00"
}
```

### Atualizar disponibilidade

```http
PUT /disponibilidades/:id
```

### Excluir disponibilidade

```http
DELETE /disponibilidades/:id
```

---

## Agendamentos

### Listar agendamentos

```http
GET /agendamentos
```

### Buscar agendamento por ID

```http
GET /agendamentos/:id
```

### Listar agendamentos do paciente

```http
GET /agendamentos/paciente/:idPaciente
```

### Criar agendamento

```http
POST /agendamentos
```

Exemplo:

```json
{
  "id_paciente": 2,
  "id_profissional": 1,
  "id_disponibilidade": 1,
  "observacao": "Primeira consulta"
}
```

A data e o horário são obtidos da disponibilidade selecionada.

### Atualizar agendamento

```http
PUT /agendamentos/:id
```

Exemplo:

```json
{
  "status": "CONFIRMADO",
  "observacao": "Consulta confirmada"
}
```

### Cancelar agendamento

```http
PATCH /agendamentos/:id/cancelar
```

Ao cancelar, o horário associado volta a ficar disponível.

### Excluir agendamento

```http
DELETE /agendamentos/:id
```

Para preservar o histórico, recomenda-se utilizar o cancelamento em vez da exclusão física.

---

# Status HTTP utilizados

```text
200 - Requisição concluída com sucesso
201 - Registro criado com sucesso
400 - Dados inválidos ou incompletos
401 - Usuário não autenticado ou credenciais inválidas
403 - Usuário sem permissão ou conta inativa
404 - Registro não encontrado
409 - Conflito, duplicidade ou registro vinculado
500 - Erro interno do servidor
```

---

# Segurança

O projeto utiliza:

- Criptografia de senha com bcryptjs
- Autenticação com JWT
- Token com prazo de validade
- Middleware de autenticação
- Middleware de autorização por perfil
- Variáveis de ambiente
- Consultas parametrizadas ao PostgreSQL
- Senhas e hashes não expostos nas consultas públicas

---

# Regras de agendamento

O backend verifica:

- Se o paciente existe
- Se o paciente está ativo
- Se o profissional está ativo
- Se a disponibilidade existe
- Se a disponibilidade pertence ao profissional informado
- Se o horário está disponível
- Se o paciente já possui agendamento no mesmo horário

Ao criar um agendamento:

```text
DISPONIVEL → RESERVADO
```

Ao cancelar um agendamento:

```text
RESERVADO → DISPONIVEL
```

---

# Swagger

A documentação Swagger apresenta os principais endpoints da API e permite executar testes diretamente pelo navegador.

Para testar uma rota protegida:

1. Execute `POST /auth/login`.
2. Copie o token retornado.
3. Clique em **Authorize**.
4. Cole apenas o token JWT.
5. Clique em **Authorize**.
6. Execute `GET /auth/perfil`.

---

# Deploy no Render

Configuração utilizada:

```text
Build Command: npm install
Start Command: npm start
```

Variáveis necessárias:

```text
DATABASE_URL
PORT
JWT_SECRET
JWT_EXPIRES_IN
```

Depois de alterar as variáveis ou o código, realize um novo deploy no Render.

---

# Funcionalidades implementadas

- [x] Cadastro de pacientes
- [x] Cadastro de clínicas
- [x] Cadastro de especialidades
- [x] Cadastro de profissionais
- [x] Cadastro de disponibilidades
- [x] Login por e-mail e senha
- [x] Autenticação JWT
- [x] Consulta de perfil autenticado
- [x] Busca de pacientes por nome
- [x] Busca de profissionais por nome
- [x] Filtro de profissionais por clínica
- [x] Filtro de profissionais por especialidade
- [x] Consulta de horários por profissional
- [x] Agendamento de consultas
- [x] Consulta de agendamentos por paciente
- [x] Cancelamento de agendamento
- [x] Controle de conflito de horário
- [x] API REST com JSON
- [x] Persistência em PostgreSQL
- [x] Deploy no Render
- [x] Banco publicado no Neon
- [x] Documentação Swagger

---

# Próximas etapas

- Integração com o frontend PWA
- Área administrativa no frontend
- Testes automatizados
- React Native
- Pré-triagem de pacientes
- Recomendação de especialidade com IA
- Chatbot de orientação
- Notificações e lembretes
- Reagendamento de consultas
- Histórico de triagens

---

# Projeto acadêmico

Projeto desenvolvido para a disciplina de Projeto Integrador.

O sistema utiliza arquitetura Client-Server, API REST, PostgreSQL, autenticação JWT e documentação Swagger.
