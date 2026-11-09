/*
  Unitarios do PacientesService.
  Model Pacientes substituido; bcrypt real.
*/

const { test } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");

const { patchar } = require("./stubs");

const Pacientes =
  require("../src/models/Pacientes");

const PacientesService =
  require("../src/services/pacientesService");

test("validarId rejeita nao-inteiro -> 400", () => {
  assert.throws(
    () => PacientesService.validarId("abc"),
    (e) => e.statusCode === 400
  );
});

test("validarCpf exige 11 numeros -> 400", () => {
  assert.throws(
    () => PacientesService.validarCpf("1234567"),
    (e) => e.statusCode === 400
  );
});

test("validarSenha exige 8 caracteres -> 400", () => {
  assert.throws(
    () => PacientesService.validarSenha("curta1"),
    (e) => e.statusCode === 400
  );
});

test("cadastrar sem campos obrigatorios -> 400", async () => {
  await assert.rejects(
    () =>
      PacientesService.cadastrar({
        nome: "So o nome"
      }),
    (e) => e.statusCode === 400
  );
});

test("cadastrar com CPF invalido -> 400", async () => {
  await assert.rejects(
    () =>
      PacientesService.cadastrar({
        nome: "Paciente X",
        cpf: "123abc",
        data_nascimento: "1990-01-01",
        email: "x@teste.com",
        senha: "SenhaGrande123"
      }),
    (e) => e.statusCode === 400
  );
});

test("cadastrar duplicado -> 409", async (t) => {
  const restaurar = patchar(
    Pacientes,
    "buscarPorCpfOuEmail",
    async () => ({ id_paciente: 1 })
  );

  t.after(restaurar);

  await assert.rejects(
    () =>
      PacientesService.cadastrar({
        nome: "Duplicado",
        cpf: "12345678901",
        data_nascimento: "1990-01-01",
        email: "dup@teste.com",
        senha: "SenhaGrande123"
      }),
    (e) => e.statusCode === 409
  );
});

test("cadastrar normaliza cpf e email e gera hash da senha", async (t) => {
  let payloadRecebido = null;

  const restaurarBusca = patchar(
    Pacientes,
    "buscarPorCpfOuEmail",
    async () => null
  );

  const restaurarCadastrar = patchar(
    Pacientes,
    "cadastrar",
    async (payload) => {
      payloadRecebido = payload;
      return { id_paciente: 42, ...payload };
    }
  );

  t.after(() => {
    restaurarBusca();
    restaurarCadastrar();
  });

  const paciente =
    await PacientesService.cadastrar({
      nome: "  Paciente Espacado  ",
      cpf: "123.456.789-01",
      data_nascimento: "1990-01-01",
      email: "  Espaco@teste.com ",
      senha: "SenhaGrande123",
      telefone: ""
    });

  assert.strictEqual(paciente.id_paciente, 42);
  assert.strictEqual(
    payloadRecebido.cpf,
    "12345678901"
  );
  assert.strictEqual(
    payloadRecebido.email,
    "espaco@teste.com"
  );
  assert.strictEqual(
    payloadRecebido.nome,
    "Paciente Espacado"
  );
  assert.strictEqual(payloadRecebido.telefone, null);
  assert.strictEqual(
    payloadRecebido.perfil,
    "PACIENTE"
  );
  assert.strictEqual(payloadRecebido.ativo, true);

  const senhaBate = await bcrypt.compare(
    "SenhaGrande123",
    payloadRecebido.senha_hash
  );
  assert.strictEqual(senhaBate, true);
});

test("paciente dono tenta ler outro paciente -> 403", async (t) => {
  const restaurar = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 5 })
  );

  t.after(restaurar);

  await assert.rejects(
    () =>
      PacientesService.buscarPorId(5, {
        id: 7,
        perfil: "PACIENTE"
      }),
    (e) => e.statusCode === 403
  );
});

test("atualizar com cpf/email de outro paciente -> 409", async (t) => {
  const restaurarBusca = patchar(
    Pacientes,
    "buscarCompletoPorId",
    async () => ({
      id_paciente: 5,
      cpf: "12345678901",
      email: "atual@teste.com"
    })
  );

  const restaurarDuplicado = patchar(
    Pacientes,
    "buscarDuplicado",
    async () => ({ id_paciente: 9 })
  );

  t.after(() => {
    restaurarBusca();
    restaurarDuplicado();
  });

  await assert.rejects(
    () =>
      PacientesService.atualizar(
        5,
        { cpf: "98765432109" },
        { id: 5, perfil: "PACIENTE" }
      ),
    (e) => e.statusCode === 409
  );
});

test("excluir paciente inexistente -> 404", async (t) => {
  const restaurar = patchar(
    Pacientes,
    "excluir",
    async () => null
  );

  t.after(restaurar);

  await assert.rejects(
    () => PacientesService.excluir(1234),
    (e) => e.statusCode === 404
  );
});
