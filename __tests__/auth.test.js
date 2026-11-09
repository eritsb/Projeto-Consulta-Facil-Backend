/*
  Unitarios do AuthService (autenticacao).
  Models de usuario sao substituidos; bcrypt e jwt rodam reais.
*/

const { test } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { patchar } = require("./stubs");

const Pacientes =
  require("../src/models/Pacientes");

const Profissionais =
  require("../src/models/Profissionais");

const Administradores =
  require("../src/models/Administradores");

const AuthService =
  require("../src/services/authService");

const HASH_SENHA_OK =
  bcrypt.hashSync("SenhaCorreta123", 4);

function usuarioPaciente(
  sobreposicoes = {}
) {
  return {
    id_paciente: 7,
    nome: "Paciente Teste",
    email: "paciente@teste.com",
    senha_hash: HASH_SENHA_OK,
    ativo: true,
    ...sobreposicoes
  };
}

function substituirBuscas(
  t,
  { paciente = null, profissional = null, admin = null } = {}
) {
  const restauradorPaciente = patchar(
    Pacientes,
    "buscarPorEmailParaLogin",
    async () => paciente
  );

  const restauradorProfissional = patchar(
    Profissionais,
    "buscarPorEmailParaLogin",
    async () => profissional
  );

  const restauradorAdmin = patchar(
    Administradores,
    "buscarPorEmail",
    async () => admin
  );

  t.after(() => {
    restauradorPaciente();
    restauradorProfissional();
    restauradorAdmin();
  });
}

test("login sem e-mail/senha -> 400", async () => {
  await assert.rejects(
    () => AuthService.login({}),
    (e) => e.statusCode === 400
  );
});

test("login com e-mail mal formatado -> 400", async () => {
  await assert.rejects(
    () => AuthService.login({
      email: "sem-arroba",
      senha: "x"
    }),
    (e) => e.statusCode === 400
  );
});

test("login sem cadastro -> 401", async (t) => {
  substituirBuscas(t);

  await assert.rejects(
    () => AuthService.login({
      email: "naoexiste@teste.com",
      senha: "senha"
    }),
    (e) => e.statusCode === 401
  );
});

test("login com e-mail em dois perfis -> 409", async (t) => {
  substituirBuscas(t, {
    paciente: usuarioPaciente(),
    profissional: {
      id_profissional: 3,
      nome: "Profissional Teste",
      email: "paciente@teste.com",
      senha_hash: HASH_SENHA_OK,
      ativo: true
    }
  });

  await assert.rejects(
    () => AuthService.login({
      email: "paciente@teste.com",
      senha: "SenhaCorreta123"
    }),
    (e) => e.statusCode === 409
  );
});

test("login com conta inativa -> 403", async (t) => {
  substituirBuscas(t, {
    paciente: usuarioPaciente({ ativo: false })
  });

  await assert.rejects(
    () => AuthService.login({
      email: "paciente@teste.com",
      senha: "SenhaCorreta123"
    }),
    (e) => e.statusCode === 403
  );
});

test("login com senha errada -> 401", async (t) => {
  substituirBuscas(t, {
    paciente: usuarioPaciente()
  });

  await assert.rejects(
    () => AuthService.login({
      email: "paciente@teste.com",
      senha: "SenhaErrada999"
    }),
    (e) => e.statusCode === 401
  );
});

test("login de paciente correto gera JWT com id e perfil", async (t) => {
  substituirBuscas(t, {
    paciente: usuarioPaciente()
  });

  const resultado = await AuthService.login({
    email: "PACIENTE@teste.com",
    senha: "SenhaCorreta123"
  });

  assert.ok(resultado.token);

  const carga = jwt.decode(resultado.token);
  assert.strictEqual(carga.id, 7);
  assert.strictEqual(carga.perfil, "PACIENTE");

  assert.strictEqual(
    resultado.usuario.email,
    "paciente@teste.com"
  );
  assert.strictEqual(
    resultado.usuario.perfil,
    "PACIENTE"
  );
});

test("obterPerfil com perfil desconhecido -> 403", async () => {
  await assert.rejects(
    () => AuthService.obterPerfil(1, "GHOST"),
    (e) => e.statusCode === 403
  );
});

test("obterPerfil de paciente inexistente -> 404", async (t) => {
  const restaurar = patchar(
    Pacientes,
    "buscarPorId",
    async () => null
  );

  t.after(restaurar);

  await assert.rejects(
    () => AuthService.obterPerfil(999, "PACIENTE"),
    (e) => e.statusCode === 404
  );
});
