/*
  Unitarios do TriagensService (triagem com IA + chatbot).
  Models substituidos; IaService tambem (a IA real
  nao participa dos unitarios).
*/

const { test } = require("node:test");
const assert = require("node:assert");

const { patchar } = require("./stubs");

const Pacientes = require("../src/models/Pacientes");

const Triagens =
  require("../src/models/Triagens");

const Recomendacoes =
  require("../src/models/Recomendacoes");

const Especialidades =
  require("../src/models/Especialidades");

const IaService =
  require("../src/services/iaService");

const TriagensService =
  require("../src/services/triagensService");

function stubEspecialidades(t, lista) {
  const restaurar = patchar(
    Especialidades,
    "listarTodos",
    async () => lista
  );

  t.after(restaurar);
}

test("validarDados sem sintomas -> 400", () => {
  assert.throws(
    () =>
      TriagensService.validarDados({
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 3
      }),
    (e) => e.statusCode === 400
  );
});

test("validarDados com intensidade fora de 1..5 -> 400", () => {
  assert.throws(
    () =>
      TriagensService.validarDados({
        sintomas: "dor",
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 7
      }),
    (e) => e.statusCode === 400
  );
});

test("validarDados normaliza array de sintomas", () => {
  const dados = TriagensService.validarDados({
    sintomas: [" febres ", "tosse ", ""],
    localizacao: "  torax  ",
    duracao_sintomas: " 2 dias ",
    intensidade: "4"
  });

  assert.strictEqual(
    dados.sintomas,
    "febres, tosse"
  );
  assert.strictEqual(dados.localizacao, "torax");
  assert.strictEqual(dados.intensidade, "4");
});

test("cadastrar de paciente inexistente -> 404", async (t) => {
  const restaurar = patchar(
    Pacientes,
    "buscarPorId",
    async () => null
  );

  t.after(restaurar);

  await assert.rejects(
    () =>
      TriagensService.cadastrar(9, {
        sintomas: "dor",
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 3,
        faixa_etaria: "Adulto"
      }),
    (e) => e.statusCode === 404
  );
});

test("IA falhou -> nada Ã© salvo (nem triagem nem recomendaÃ§Ã£o)", async (t) => {
  stubEspecialidades(t, [
    { id_especialidade: 1, nome: "Cardiologia", ativo: true }
  ]);

  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  const restaurarIa = patchar(
    IaService,
    "analisarTriagem",
    async () => {
      throw IaService.criarErro(
        "Falha na IA",
        502
      );
    }
  );

  let triagemGravada = false;

  const restaurarTriagens = patchar(
    Triagens,
    "cadastrar",
    async () => {
      triagemGravada = true;
      return { id_triagem: 1 };
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarIa();
    restaurarTriagens();
  });

  await assert.rejects(
    () =>
      TriagensService.cadastrar(7, {
        sintomas: "dor",
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 3,
        faixa_etaria: "Adulto"
      }),
    (e) => e.statusCode === 502
  );

  assert.strictEqual(triagemGravada, false);
});

test("IA sugere especialidade fora da lista -> 422 e nada salvo", async (t) => {
  stubEspecialidades(t, [
    { id_especialidade: 1, nome: "Cardiologia", ativo: true }
  ]);

  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  const restaurarIa = patchar(
    IaService,
    "analisarTriagem",
    async () => ({
      especialidade: "Neurologia",
      confianca: 90,
      justificativa: "X"
    })
  );

  const restaurarTriagens = patchar(
    Triagens,
    "cadastrar",
    async () => {
      throw new Error(
        "Nao deveria gravar triagem neste teste"
      );
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarIa();
    restaurarTriagens();
  });

  await assert.rejects(
    () =>
      TriagensService.cadastrar(7, {
        sintomas: "dor",
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 3,
        faixa_etaria: "Adulto"
      }),
    (e) => e.statusCode === 422
  );
});

test("cadastrar com IA ok grava triagem + recomendaÃ§Ã£o e notifica", async (t) => {
  stubEspecialidades(t, [
    { id_especialidade: 1, nome: "Cardiologia", ativo: true }
  ]);

  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  const restaurarIa = patchar(
    IaService,
    "analisarTriagem",
    async (dados) => {
      assert.strictEqual(
        dados.especialidades_disponiveis[0],
        "Cardiologia"
      );
      assert.strictEqual(
        dados.faixa_etaria,
        "Adulto"
      );
      return {
        especialidade: "cardiologia",
        confianca: 87,
        justificativa: "Coracao"
      };
    }
  );

  let triagemGravada = false;

  const restaurarTriagensCadastrar = patchar(
    Triagens,
    "cadastrar",
    async (payload) => {
      triagemGravada = true;
      assert.strictEqual(payload.id_paciente, 7);
      return { id_triagem: 77 };
    }
  );

  let recomendacaoGravada = null;

  const restaurarRecomendacoes = patchar(
    Recomendacoes,
    "cadastrar",
    async (payload) => {
      recomendacaoGravada = payload;
      return { id_recomendacao: 1 };
    }
  );

  const restaurarTriagensBuscar = patchar(
    Triagens,
    "buscarPorId",
    async (id) => ({
      id_triagem: id,
      sintomas: "sinusite"
    })
  );

  let notificacao = null;

  const restaurarNotificar = patchar(
    require("../src/services/notificacoesService"),
    "notificar",
    async (dados) => {
      notificacao = dados;
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarIa();
    restaurarTriagensCadastrar();
    restaurarRecomendacoes();
    restaurarTriagensBuscar();
    restaurarNotificar();
  });

  const triagem = await TriagensService.cadastrar(
    7,
    {
      sintomas: "sinusite",
      localizacao: "rosto",
      duracao_sintomas: "5 dias",
      intensidade: 2,
      faixa_etaria: "Adulto"
    }
  );

  assert.strictEqual(triagemGravada, true);
  assert.strictEqual(triagem.id_triagem, 77);

  assert.strictEqual(
    recomendacaoGravada.id_triagem,
    77
  );
  assert.strictEqual(
    recomendacaoGravada.id_especialidade,
    1
  );
  assert.strictEqual(
    recomendacaoGravada.confianca,
    87
  );

  assert.strictEqual(notificacao.tipo, "PRE_TRIAGEM_IA");
});

test("recomendaÃ§Ã£o falhou -> triagem recÃ©m criada Ã© excluÃ­da", async (t) => {
  stubEspecialidades(t, [
    { id_especialidade: 1, nome: "Cardiologia", ativo: true }
  ]);

  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  const restaurarIa = patchar(
    IaService,
    "analisarTriagem",
    async () => ({
      especialidade: "Cardiologia",
      confianca: 80,
      justificativa: "J"
    })
  );

  const restaurarTriagensCadastrar = patchar(
    Triagens,
    "cadastrar",
    async () => ({ id_triagem: 77 })
  );

  const restaurarRecomendacoes = patchar(
    Recomendacoes,
    "cadastrar",
    async () => {
      throw new Error("Falta na recomendaÃ§Ã£o");
    }
  );

  const idsExcluidos = [];

  const restaurarTriagensExcluir = patchar(
    Triagens,
    "excluir",
    async (id) => {
      idsExcluidos.push(id);
      return { id_triagem: id };
    }
  );

  const restaurarNotificar = patchar(
    require("../src/services/notificacoesService"),
    "notificar",
    async () => null
  );

  t.after(() => {
    restaurarPaciente();
    restaurarIa();
    restaurarTriagensCadastrar();
    restaurarRecomendacoes();
    restaurarTriagensExcluir();
    restaurarNotificar();
  });

  await assert.rejects(
    () =>
      TriagensService.cadastrar(7, {
        sintomas: "dor",
        localizacao: "cabeca",
        duracao_sintomas: "1 dia",
        intensidade: 3,
        faixa_etaria: "Adulto"
      }),
    (e) => /recomendaÃ§Ã£o/i.test(e.message)
  );

  assert.deepStrictEqual(idsExcluidos, [77]);
});

test("conversar sem mensagem -> 400", async (t) => {
  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  t.after(restaurarPaciente);

  await assert.rejects(
    () =>
      TriagensService.conversar(7, {
        mensagem: "   "
      }),
    (e) => e.statusCode === 400
  );
});

test("conversar de paciente inexistente -> 404", async (t) => {
  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => null
  );

  t.after(restaurarPaciente);

  await assert.rejects(
    () =>
      TriagensService.conversar(9, {
        mensagem: "ola"
      }),
    (e) => e.statusCode === 404
  );
});

test("conversar passa historico e especialidades para a IA", async (t) => {
  const restaurarPaciente = patchar(
    Pacientes,
    "buscarPorId",
    async () => ({ id_paciente: 7 })
  );

  stubEspecialidades(t, [
    { id_especialidade: 2, nome: "Otorrino", ativo: true }
  ]);

  const restaurarIa = patchar(
    IaService,
    "conversar",
    async (dados) => {
      assert.strictEqual(
        dados.mensagem,
        "Onde meÃ§o a febre?"
      );
      assert.deepStrictEqual(
        dados.historico,
        [{ papel: "paciente", texto: "ola" }]
      );
      assert.deepStrictEqual(
        dados.especialidades_disponiveis,
        ["Otorrino"]
      );
      return { resposta: "Ok" };
    }
  );

  t.after(() => {
    restaurarPaciente();
    restaurarIa();
  });

  const resposta = await TriagensService.conversar(
    7,
    {
      mensagem: "  Onde meÃ§o a febre? ",
      historico: [
        { papel: "paciente", texto: "ola" }
      ]
    }
  );

  assert.strictEqual(resposta.resposta, "Ok");
});

test("excluir triagem de outro paciente -> 403", async (t) => {
  const restaurar = patchar(
    Triagens,
    "buscarPorId",
    async () => ({
      id_triagem: 5,
      id_paciente: 66
    })
  );

  t.after(restaurar);

  await assert.rejects(
    () => TriagensService.excluir(5, 7),
    (e) => e.statusCode === 403
  );
});
