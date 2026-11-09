const Triagens = require("../models/Triagens");

const Recomendacoes = require(
  "../models/Recomendacoes"
);

const Pacientes = require("../models/Pacientes");

const Especialidades = require(
  "../models/Especialidades"
);

const IaService = require("./iaService");

const NotificacoesService = require(
  "./notificacoesService"
);

class TriagensService {

  static criarErro(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;

    return erro;
  }


  static validarId(id, nomeCampo) {
    const idNumerico = Number(id);

    if (
      !Number.isInteger(idNumerico) ||
      idNumerico <= 0
    ) {
      throw this.criarErro(
        `${nomeCampo} inválido`,
        400
      );
    }

    return idNumerico;
  }


  static normalizarSintomas(sintomas) {

    if (Array.isArray(sintomas)) {
      return sintomas
        .map((sintoma) => String(sintoma).trim())
        .filter(Boolean)
        .join(", ");
    }

    if (typeof sintomas === "string") {
      return sintomas.trim();
    }

    return "";
  }


  static validarDados(dados) {

    const sintomas =
      this.normalizarSintomas(dados.sintomas);

    if (!sintomas) {
      throw this.criarErro(
        "Informe pelo menos um sintoma.",
        400
      );
    }


    if (
      !dados.localizacao ||
      !String(dados.localizacao).trim()
    ) {
      throw this.criarErro(
        "Informe a localização do sintoma.",
        400
      );
    }


    if (
      !dados.duracao_sintomas ||
      !String(dados.duracao_sintomas).trim()
    ) {
      throw this.criarErro(
        "Informe a duração dos sintomas.",
        400
      );
    }


    const intensidade =
      Number(dados.intensidade);


    if (
      !Number.isInteger(intensidade) ||
      intensidade < 1 ||
      intensidade > 5
    ) {
      throw this.criarErro(
        "A intensidade deve estar entre 1 e 5.",
        400
      );
    }


    return {

      sintomas,

      localizacao:
        String(dados.localizacao).trim(),

      duracao_sintomas:
        String(dados.duracao_sintomas).trim(),

      intensidade:
        String(intensidade),

      observacoes:
        dados.observacoes
          ? String(dados.observacoes).trim()
          : null
    };
  }


  static validarFaixaEtaria(faixaEtaria) {
    const valor = faixaEtaria
      ? String(faixaEtaria).trim()
      : "";

    if (!valor) {
      throw this.criarErro(
        "Informe a faixa etária.",
        400
      );
    }

    return valor;
  }


  static async buscarEspecialidadesAtivas() {
    const especialidades =
      await Especialidades.listarTodos();

    return especialidades.filter(
      (especialidade) =>
        especialidade.ativo !== false
    );
  }


  // CREATE
  // Fluxo único: valida os dados, chama a IA
  // (Antes de qualquer INSERT: se a IA falhar,
  // nada é salvo) e grava a triagem junto com a
  // recomendação da especialidade sugerida.
  static async cadastrar(idPaciente, dados) {

    const pacienteId = this.validarId(
      idPaciente,
      "ID do paciente"
    );


    const paciente =
      await Pacientes.buscarPorId(pacienteId);


    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado.",
        404
      );
    }


    const dadosValidados =
      this.validarDados(dados);


    const faixaEtaria =
      this.validarFaixaEtaria(
        dados.faixa_etaria
      );

    /*
      faixa_etaria é usado apenas na chamada
      da IA e não é gravado no banco.
    */

    const especialidadesAtivas =
      await this.buscarEspecialidadesAtivas();


    const especialidadesDisponiveis =
      especialidadesAtivas.map(
        (especialidade) => especialidade.nome
      );


    const resultado =
      await IaService.analisarTriagem({
        ...dadosValidados,

        faixa_etaria: faixaEtaria,

        especialidades_disponiveis:
          especialidadesDisponiveis
      });


    const especialidadeEscolhida =
      especialidadesAtivas.find(
        (especialidade) =>
          especialidade.nome.toLowerCase() ===
          String(resultado.especialidade)
            .trim()
            .toLowerCase()
      );


    if (!especialidadeEscolhida) {
      throw this.criarErro(
        "A IA sugeriu uma especialidade não cadastrada ou inativa.",
        422
      );
    }


    const triagem =
      await Triagens.cadastrar({

        id_paciente: pacienteId,

        ...dadosValidados

      });


    try {

      await Recomendacoes.cadastrar({

        id_triagem: triagem.id_triagem,

        id_especialidade:
          especialidadeEscolhida.id_especialidade,

        confianca: resultado.confianca,

        justificativa:
          resultado.justificativa

      });

    } catch (error) {

      // A recomendação falhou: apaga a triagem
      // criada para não deixar o registro
      // incompleto.
      await Triagens.excluir(triagem.id_triagem);

      throw error;

    }


    await NotificacoesService.notificar({
      id_paciente: pacienteId,

      tipo: "PRE_TRIAGEM_IA",

      titulo: "Triagem concluída",

      mensagem:
        `A IA sugeriu a especialidade ` +
        `${resultado.especialidade} ` +
        `(confiança de ${resultado.confianca}%).`
    });


    return Triagens.buscarPorId(
      triagem.id_triagem
    );
  }


  // CHATBOT
  static async conversar(idPaciente, dados) {
    const pacienteId = this.validarId(
      idPaciente,
      "ID do paciente"
    );

    const paciente =
      await Pacientes.buscarPorId(pacienteId);

    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado.",
        404
      );
    }

    const mensagem = dados.mensagem
      ? String(dados.mensagem).trim()
      : "";

    if (!mensagem) {
      throw this.criarErro(
        "Informe a mensagem.",
        400
      );
    }

    const especialidadesAtivas =
      await this.buscarEspecialidadesAtivas();

    return IaService.conversar({
      mensagem,
      historico: dados.historico,
      especialidades_disponiveis:
        especialidadesAtivas.map(
          (especialidade) => especialidade.nome
        )
    });
  }


  // READ ALL
  static async listarTodos() {

    return Triagens.listarTodos();

  }


  // READ ID
  static async buscarPorId(idTriagem, usuario) {

    const triagem =
      await Triagens.buscarPorId(idTriagem);


    if (!triagem) {

      throw this.criarErro(
        "Triagem não encontrada.",
        404
      );

    }


    if (
      usuario &&
      usuario.perfil === "PACIENTE" &&
      Number(triagem.id_paciente) !==
        Number(usuario.id)
    ) {

      throw this.criarErro(
        "Você não pode consultar esta triagem.",
        403
      );

    }


    return triagem;
  }


  // HISTÓRICO DO PACIENTE
  static async buscarPorPaciente(idPaciente) {

    return Triagens.buscarPorPaciente(
      idPaciente
    );
  }


  // UPDATE
  static async atualizar(
    idTriagem,
    idPaciente,
    dados
  ) {

    const triagemAtual =
      await Triagens.buscarPorId(idTriagem);


    if (!triagemAtual) {

      throw this.criarErro(
        "Triagem não encontrada.",
        404
      );

    }


    if (
      Number(triagemAtual.id_paciente) !==
      Number(idPaciente)
    ) {

      throw this.criarErro(
        "Você não pode alterar esta triagem.",
        403
      );

    }


    const dadosCompletos = {

      sintomas:
        dados.sintomas ??
        triagemAtual.sintomas,

      localizacao:
        dados.localizacao ??
        triagemAtual.localizacao,

      duracao_sintomas:
        dados.duracao_sintomas ??
        triagemAtual.duracao_sintomas,

      intensidade:
        dados.intensidade ??
        triagemAtual.intensidade,

      observacoes:
        dados.observacoes ??
        triagemAtual.observacoes
    };


    const dadosValidados =
      this.validarDados(dadosCompletos);


    return Triagens.atualizar(
      idTriagem,
      dadosValidados
    );
  }


  // DELETE
  static async excluir(
    idTriagem,
    idPaciente
  ) {

    const triagem =
      await Triagens.buscarPorId(idTriagem);


    if (!triagem) {

      throw this.criarErro(
        "Triagem não encontrada.",
        404
      );

    }


    if (
      Number(triagem.id_paciente) !==
      Number(idPaciente)
    ) {

      throw this.criarErro(
        "Você não pode excluir esta triagem.",
        403
      );

    }


    /*
      A recomendação deve ser excluída antes
      da triagem, pois a FK não configura
      DELETE CASCADE.
    */
    await Recomendacoes.excluirPorTriagem(
      idTriagem
    );


    await Triagens.excluir(idTriagem);


    return {
      mensagem:
        "Triagem excluída com sucesso."
    };
  }
}

module.exports = TriagensService;
