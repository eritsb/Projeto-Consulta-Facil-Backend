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
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
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

# Projeto acadêmico

Projeto desenvolvido para a disciplina de Projeto Integrador.

O sistema utiliza arquitetura Client-Server, API REST, PostgreSQL, autenticação JWT e documentação Swagger.
