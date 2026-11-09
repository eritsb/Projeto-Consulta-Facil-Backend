/*
  Unitarios do NotificacoesService, incluindo o
  gerador de lembretes (chave no job a cada 60 min).
*/

const { test } = require("node:test");
const assert = require("node:assert");

const { patchar } = require("./stubs");

const Notificacoes =
  require("../src/models/Notificacoes");

const Agendamentos =
  require("../src/models/Agendamentos");

const NotificacoesService =
  require("../src/services/notificacoesService");

test("validarDados tem tipos permitidos", () => {
  const ok = NotificacoesService.validarDados({
    id_paciente: 1,
    tipo: "LEMBRETE_CONSULTA",
    titulo: "T",
    mensagem: "M"
  });

  assert.strictEqual(ok.tipo, "LEMBRETE_CONSULTA");

  assert.throws(
    () =>
      NotificacoesService.validarDados({
        id_paciente: 1,
        tipo: "TIPO_NAO_EXISTE",
        titulo: "T",
        mensagem: "M"
      }),
    (e) => e.statusCode === 400
  );
});

test("validarDados exige titulo e mensagem -> 400", () => {
  assert.throws(
    () =>
      NotificacoesService.validarDados({
        id_paciente: 1,
        tipo: "AGENDAMENTO_CRIADO",
        titulo: "",
        mensagem: "M"
      }),
    (e) => e.statusCode === 400
  );

  assert.throws(
    () =>
      NotificacoesService.validarDados({
        id_paciente: 1,
        tipo: "AGENDAMENTO_CRIADO",
        titulo: "T",
        mensagem: ""
      }),
    (e) => e.statusCode === 400
  );
});

test("notificar engole falha do model e devolve null", async (t) => {
  const restaurar = patchar(
    Notificacoes,
    "cadastrar",
    async () => {
      throw new Error("falta no banco");
    }
  );

  t.after(restaurar);

  const resultado = await NotificacoesService.notificar({
    id_paciente: 1,
    tipo: "AGENDAMENTO_CRIADO",
    titulo: "T",
    mensagem: "M"
  });

  assert.strictEqual(resultado, null);
});

test("gerarLembretes com horas invalidas -> 400", async () => {
  for (const horas of [0, -3, 1.5, "x"]) {
    await assert.rejects(
      () => NotificacoesService.gerarLembretes(horas),
      (e) => e.statusCode === 400
    );
  }
});

test("gerarLembretes sem consultas -> 0 gerados", async (t) => {
  const restaurar = patchar(
    Agendamentos,
    "listarProximos",
    async () => []
  );

  t.after(restaurar);

  const resultado =
    await NotificacoesService.gerarLembretes(24);

  assert.deepStrictEqual(resultado, {
    antecedencia_horas: 24,
    gerados: 0,
    ignorados: 0
  });
});

test("gerarLembretes gera 1 por agendamento na janela", async (t) => {
  const restaurarListar = patchar(
    Agendamentos,
    "listarProximos",
    async () => [
      {
        id_agendamento: 501,
        id_paciente: 7,
        profissional_nome: "Dr. Um",
        especialidade_nome: "Cardiologia",
        data_consulta: "2026-10-05",
        hora_consulta: "08:00:00"
      },
      {
        id_agendamento: 502,
        id_paciente: 8,
        profissional_nome: "Dr. Dois",
        especialidade_nome: "Otorrino",
        data_consulta: "2026-10-06",
        hora_consulta: "14:00:00"
      }
    ]
  );

  const restaurarExiste = patchar(
    Notificacoes,
    "lembreteExiste",
    async () => false
  );

  const cadastradas = [];

  const restaurarCadastrar = patchar(
    Notificacoes,
    "cadastrar",
    async (payload) => {
      cadastradas.push(payload);
      return { id_notificacao: cadastradas.length };
    }
  );

  t.after(() => {
    restaurarListar();
    restaurarExiste();
    restaurarCadastrar();
  });

  const resultado =
    await NotificacoesService.gerarLembretes(24);

  assert.deepStrictEqual(resultado, {
    antecedencia_horas: 24,
    gerados: 2,
    ignorados: 0
  });

  assert.strictEqual(cadastradas.length, 2);
  assert.strictEqual(
    cadastradas[0].tipo,
    "LEMBRETE_CONSULTA"
  );
  assert.strictEqual(
    cadastradas[0].id_paciente,
    7
  );
  assert.strictEqual(
    cadastradas[0].id_agendamento,
    501
  );
  assert.match(
    cadastradas[0].mensagem,
    /Dr\. Um/
  );
});

test("lembrete ja enviado na segunda execucao -> ignorado", async (t) => {
  const restaurarListar = patchar(
    Agendamentos,
    "listarProximos",
    async () => [
      {
        id_agendamento: 501,
        id_paciente: 7,
        profissional_nome: "Dr. Um",
        especialidade_nome: "Cardiologia",
        data_consulta: "2026-10-05",
        hora_consulta: "08:00:00"
      }
    ]
  );

  const restaurarExiste = patchar(
    Notificacoes,
    "lembreteExiste",
    async () => true
  );

  let chamadasCadastro = 0;

  const restaurarCadastrar = patchar(
    Notificacoes,
    "cadastrar",
    async () => {
      chamadasCadastro += 1;
      return { id_notificacao: 1 };
    }
  );

  t.after(() => {
    restaurarListar();
    restaurarExiste();
    restaurarCadastrar();
  });

  const resultado =
    await NotificacoesService.gerarLembretes(24);

  assert.deepStrictEqual(resultado, {
    antecedencia_horas: 24,
    gerados: 0,
    ignorados: 1
  });
  assert.strictEqual(chamadasCadastro, 0);
});

test("falha no cadastro individual conta como ignorado", async (t) => {
  const restaurarListar = patchar(
    Agendamentos,
    "listarProximos",
    async () => [
      {
        id_agendamento: 503,
        id_paciente: 9,
        profissional_nome: "Dr. Tres",
        especialidade_nome: "Dermatologia",
        data_consulta: "2026-10-07",
        hora_consulta: "09:00:00"
      }
    ]
  );

  const restaurarExiste = patchar(
    Notificacoes,
    "lembreteExiste",
    async () => false
  );

  const restaurarCadastrar = patchar(
    Notificacoes,
    "cadastrar",
    async () => null
  );

  t.after(() => {
    restaurarListar();
    restaurarExiste();
    restaurarCadastrar();
  });

  const resultado =
    await NotificacoesService.gerarLembretes(24);

  assert.deepStrictEqual(resultado, {
    antecedencia_horas: 24,
    gerados: 0,
    ignorados: 1
  });
});
