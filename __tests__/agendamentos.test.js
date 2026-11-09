/*
  Unitarios do AgendamentosService, incluindo o
  reagendamento atomico (reserva nova antes de
  atualizar e liberar a antiga) e as transicoes de
  status com seus tipos de notificacao.
*/

const { test } = require("node:test");
const assert = require("node:assert");

const { patchar } = require("./stubs");

const Agendamentos =
  require("../src/models/Agendamentos");

const Triagens =
  require("../src/models/Triagens");

const NotificacoesService =
  require("../src/services/notificacoesService");

const AgendamentosService =
  require("../src/services/agendamentosService");

const PACIENTE = { id: 7, perfil: "PACIENTE" };

function disponibilidade(sobre = {}) {
  return {
    id_disponibilidade: 10,
    id_profissional: 1,
    profissional_ativo: true,
    status: "DISPONIVEL",
    data: "2026-10-05",
    hora_inicio: "08:00:00",
    ...sobre
  };
}

function stubNotificar(t) {
  const recebidas = [];

  const restaurar = patchar(
    NotificacoesService,
    "notificar",
    async (dados) => {
      recebidas.push(dados);
    }
  );

  t.after(restaurar);

  return recebidas;
}

test("cadastrar sem campo obrigatorio -> 400", async () => {
  await assert.rejects(
    () =>
      AgendamentosService.cadastrar(
        { id_profissional: 1 },
        PACIENTE
      ),
    (e) => e.statusCode === 400
  );
});

test("cadastrar em horario nao DISPONIVEL -> 409 e nao grava", async (t) => {
  const restaurarPaciente = patchar(
    Agendamentos,
    "buscarPaciente",
    async () => ({ id_paciente: 7, ativo: true })
  );

  const restaurarDisponibilidade = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () =>
      disponibilidade({ status: "RESERVADO" })
  );

  let gravou = false;

  const restaurarCadastrar = patchar(
    Agendamentos,
    "cadastrar",
    async () => {
      gravou = true;
      return { id_agendamento: 1 };
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarDisponibilidade();
    restaurarCadastrar();
  });

  await assert.rejects(
    () =>
      AgendamentosService.cadastrar(
        {
          id_profissional: 1,
          id_disponibilidade: 10
        },
        PACIENTE
      ),
    (e) => e.statusCode === 409
  );

  assert.strictEqual(gravou, false);
});

test("cadastrar com triagem de outro paciente -> 403", async (t) => {
  const restaurarPaciente = patchar(
    Agendamentos,
    "buscarPaciente",
    async () => ({ id_paciente: 7, ativo: true })
  );

  const restaurarDisponibilidade = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () => disponibilidade()
  );

  const restaurarConflito = patchar(
    Agendamentos,
    "buscarConflitoPaciente",
    async () => null
  );

  const restaurarTriagem = patchar(
    Triagens,
    "buscarPorId",
    async () => ({
      id_triagem: 5,
      id_paciente: 66
    })
  );

  t.after(() => {
    restaurarPaciente();
    restaurarDisponibilidade();
    restaurarConflito();
    restaurarTriagem();
  });

  await assert.rejects(
    () =>
      AgendamentosService.cadastrar(
        {
          id_profissional: 1,
          id_disponibilidade: 10,
          id_triagem: 5
        },
        PACIENTE
      ),
    (e) => e.statusCode === 403
  );
});

test("cadastrar com triagem ja vinculada -> 409", async (t) => {
  const restaurarPaciente = patchar(
    Agendamentos,
    "buscarPaciente",
    async () => ({ id_paciente: 7, ativo: true })
  );

  const restaurarDisponibilidade = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () => disponibilidade()
  );

  const restaurarConflito = patchar(
    Agendamentos,
    "buscarConflitoPaciente",
    async () => null
  );

  const restaurarTriagem = patchar(
    Triagens,
    "buscarPorId",
    async () => ({
      id_triagem: 5,
      id_paciente: 7,
      id_agendamento: 300
    })
  );

  t.after(() => {
    restaurarPaciente();
    restaurarDisponibilidade();
    restaurarConflito();
    restaurarTriagem();
  });

  await assert.rejects(
    () =>
      AgendamentosService.cadastrar(
        {
          id_profissional: 1,
          id_disponibilidade: 10,
          id_triagem: 5
        },
        PACIENTE
      ),
    (e) => e.statusCode === 409
  );
});

test("cadastrar com sucesso reserva, vincula triagem e notifica AGENDAMENTO_CRIADO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarPaciente = patchar(
    Agendamentos,
    "buscarPaciente",
    async () => ({ id_paciente: 7, ativo: true })
  );

  const restaurarDisponibilidade = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () => disponibilidade()
  );

  const restaurarConflito = patchar(
    Agendamentos,
    "buscarConflitoPaciente",
    async () => null
  );

  const restaurarTriagem = patchar(
    Triagens,
    "buscarPorId",
    async () => ({
      id_triagem: 5,
      id_paciente: 7
    })
  );

  let reserva = null;
  let vinculo = null;

  const restaurarCadastrar = patchar(
    Agendamentos,
    "cadastrar",
    async (payload) => {
      reserva = payload;
      return { id_agendamento: 501 };
    }
  );

  const restaurarCompleto = patchar(
    Agendamentos,
    "buscarPorId",
    async (id) => ({
      id_agendamento: id,
      id_paciente: 7,
      profissional_nome: "Dr. Um",
      especialidade_nome: "Cardiologia",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00",
      status: "AGENDADO"
    })
  );

  const restaurarVinculo = patchar(
    Triagens,
    "vincularAgendamento",
    async (idTriagem, idAgendamento) => {
      vinculo = { idTriagem, idAgendamento };
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarDisponibilidade();
    restaurarConflito();
    restaurarTriagem();
    restaurarCadastrar();
    restaurarCompleto();
    restaurarVinculo();
  });

  const agendamento =
    await AgendamentosService.cadastrar(
      {
        id_profissional: 1,
        id_disponibilidade: 10,
        id_triagem: 5
      },
      PACIENTE
    );

  assert.strictEqual(
    agendamento.id_agendamento,
    501
  );
  assert.strictEqual(
    reserva.id_paciente,
    7
  );
  assert.deepStrictEqual(vinculo, {
    idTriagem: 5,
    idAgendamento: 501
  });

  assert.strictEqual(recebidas.length, 1);
  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_CRIADO"
  );
  assert.match(
    recebidas[0].mensagem,
    /agendada para 05\/10\/2026/
  );
});

test("atualizar para CONFIRMADO emiti AGENDAMENTO_CONFIRMADO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "AGENDADO",
      observacao: null,
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  const restaurarDados = patchar(
    Agendamentos,
    "atualizarDados",
    async (id, dados) => {
      assert.strictEqual(dados.status, "CONFIRMADO");
      return { id_agendamento: id };
    }
  );

  const restaurarCompleto = patchar(
    Agendamentos,
    "buscarPorId",
    async (id) => ({
      id_agendamento: id,
      id_paciente: 7,
      status: "CONFIRMADO",
      profissional_nome: "Dr. Um",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  t.after(() => {
    restaurarAtual();
    restaurarDados();
    restaurarCompleto();
  });

  await AgendamentosService.atualizar(
    501,
    { status: "confirmado" },
    PACIENTE
  );

  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_CONFIRMADO"
  );
});

test("atualizar so observacao emiti AGENDAMENTO_ATUALIZADO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "AGENDADO",
      observacao: null,
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  const restaurarDados = patchar(
    Agendamentos,
    "atualizarDados",
    async (id, dados) => {
      assert.strictEqual(
        dados.observacao,
        "Paciente melhorou"
      );
      assert.strictEqual(
        dados.status,
        "AGENDADO"
      );
      return { id_agendamento: id };
    }
  );

  const restaurarCompleto = patchar(
    Agendamentos,
    "buscarPorId",
    async (id) => ({
      id_agendamento: id,
      id_paciente: 7,
      status: "AGENDADO",
      profissional_nome: "Dr. Um",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  t.after(() => {
    restaurarAtual();
    restaurarDados();
    restaurarCompleto();
  });

  await AgendamentosService.atualizar(
    501,
    { observacao: "Paciente melhorou" },
    PACIENTE
  );

  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_ATUALIZADO"
  );
});

test("atualizar para CANCELADO passa pelo cancelar e noti AGENDAMENTO_CANCELADO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "AGENDADO",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  const restaurarCancelar = patchar(
    Agendamentos,
    "cancelar",
    async (id) => ({ id_agendamento: id })
  );

  const restaurarCompleto = patchar(
    Agendamentos,
    "buscarPorId",
    async (id) => ({
      id_agendamento: id,
      id_paciente: 7,
      status: "CANCELADO",
      profissional_nome: "Dr. Um",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  t.after(() => {
    restaurarAtual();
    restaurarCancelar();
    restaurarCompleto();
  });

  await AgendamentosService.atualizar(
    501,
    { status: "CANCELADO" },
    PACIENTE
  );

  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_CANCELADO"
  );
});

test("observacao em agendamento CANCELADO -> 409", async (t) => {
  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "CANCELADO",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  t.after(restaurarAtual);

  await assert.rejects(
    () =>
      AgendamentosService.atualizar(
        501,
        { observacao: "x" },
        PACIENTE
      ),
    (e) => e.statusCode === 409
  );
});

test("reagendar por quem nao é dono -> 403", async (t) => {
  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      id_disponibilidade: 10,
      status: "AGENDADO"
    })
  );

  t.after(restaurarAtual);

  await assert.rejects(
    () =>
      AgendamentosService.reagendar(
        501,
        { id_disponibilidade: 11 },
        { id: 99, perfil: "PACIENTE" }
      ),
    (e) => e.statusCode === 403
  );
});

test("reagendar agendamento CANCELADO ou REALIZADO -> 409", async (t) => {
  for (const status of ["CANCELADO", "REALIZADO"]) {
    const restaurarAtual = patchar(
      Agendamentos,
      "buscarAgendamentoCompleto",
      async () => ({
        id_agendamento: 501,
        id_paciente: 7,
        id_disponibilidade: 10,
        status
      })
    );

    await assert.rejects(
      () =>
        AgendamentosService.reagendar(
          501,
          { id_disponibilidade: 11 },
          PACIENTE
        ),
      (e) => e.statusCode === 409
    );

    restaurarAtual();
  }
});

test("reagendar para o mesmo slot -> 409 com mensagem especifica", async (t) => {
  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      id_disponibilidade: 10,
      status: "AGENDADO"
    })
  );

  const restaurarNova = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () =>
      disponibilidade({ id_disponibilidade: 10 })
  );

  t.after(() => {
    restaurarAtual();
    restaurarNova();
  });

  await assert.rejects(
    () =>
      AgendamentosService.reagendar(
        501,
        { id_disponibilidade: 10 },
        PACIENTE
      ),
    (e) =>
      e.statusCode === 409 &&
      /mesmo do agendamento atual/.test(e.message)
  );
});

test("reagendar com sucesso chama o CTE do model e noti REAGENDADO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      id_disponibilidade: 10,
      status: "AGENDADO",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  const restaurarNova = patchar(
    Agendamentos,
    "buscarDisponibilidade",
    async () =>
      disponibilidade({ id_disponibilidade: 11 })
  );

  const restaurarConflito = patchar(
    Agendamentos,
    "buscarConflitoPaciente",
    async () => null
  );

  let chamadoCom = null;

  const restaurarReagendar = patchar(
    Agendamentos,
    "reagendar",
    async (payload) => {
      chamadoCom = payload;
      return { id_agendamento: 501 };
    }
  );

  const restaurarCompleto = patchar(
    Agendamentos,
    "buscarPorId",
    async (id) => ({
      id_agendamento: id,
      id_paciente: 7,
      profissional_nome: "Dr. Um",
      data_consulta: "2026-10-06",
      hora_consulta: "14:00:00"
    })
  );

  t.after(() => {
    restaurarAtual();
    restaurarNova();
    restaurarConflito();
    restaurarReagendar();
    restaurarCompleto();
  });

  await AgendamentosService.reagendar(
    501,
    { id_disponibilidade: 11 },
    PACIENTE
  );

  assert.deepStrictEqual(chamadoCom, {
    id_agendamento: 501,
    id_disponibilidade_nova: 11,
    id_disponibilidade_antiga: 10
  });

  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_REAGENDADO"
  );
  assert.match(
    recebidas[0].mensagem,
    /reagendada de 05\/10\/2026\s*às 08:00 para 06\/10\/2026\s*às 14:00/
  );
});

test("excluir por outro paciente -> 403", async (t) => {
  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "AGENDADO",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  t.after(restaurarAtual);

  await assert.rejects(
    () =>
      AgendamentosService.excluir(
        501,
        { id: 99, perfil: "PACIENTE" }
      ),
    (e) => e.statusCode === 403
  );
});

test("excluir emiti AGENDAMENTO_EXCLUIDO", async (t) => {
  const recebidas = stubNotificar(t);

  const restaurarAtual = patchar(
    Agendamentos,
    "buscarAgendamentoCompleto",
    async () => ({
      id_agendamento: 501,
      id_paciente: 7,
      status: "AGENDADO",
      data_consulta: "2026-10-05",
      hora_consulta: "08:00:00"
    })
  );

  const restaurarExcluir = patchar(
    Agendamentos,
    "excluir",
    async (id) => ({ id_agendamento: id })
  );

  t.after(() => {
    restaurarAtual();
    restaurarExcluir();
  });

  await AgendamentosService.excluir(
    501,
    PACIENTE
  );

  assert.strictEqual(
    recebidas[0].tipo,
    "AGENDAMENTO_EXCLUIDO"
  );
});
