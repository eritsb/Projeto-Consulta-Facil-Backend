const Agendamentos =
  require("../models/Agendamentos");

const NotificacoesService =
  require("./notificacoesService");

const Triagens =
  require("../models/Triagens");

class AgendamentosService {
  static criarErro(
    mensagem,
    statusCode
  ) {
    const erro = new Error(mensagem);

    erro.statusCode = statusCode;

    return erro;
  }

  static formatarData(data) {
    if (!data) {
      return "";
    }

    const texto =
      data instanceof Date
        ? data.toISOString().slice(0, 10)
        : String(data).slice(0, 10);

    const [ano, mes, dia] =
      texto.split("-");

    if (!ano || !mes || !dia) {
      return texto;
    }

    return `${dia}/${mes}/${ano}`;
  }

  static formatarHora(hora) {
    if (!hora) {
      return "";
    }

    return String(hora).slice(0, 5);
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

  static validarStatus(status) {
    const statusPermitidos = [
      "AGENDADO",
      "CONFIRMADO",
      "CANCELADO",
      "REALIZADO"
    ];

    const statusNormalizado =
      String(status).trim().toUpperCase();

    if (
      !statusPermitidos.includes(
        statusNormalizado
      )
    ) {
      throw this.criarErro(
        "Status inválido. Utilize AGENDADO, CONFIRMADO, CANCELADO ou REALIZADO",
        400
      );
    }

    return statusNormalizado;
  }

  static async listarTodos() {
    return await Agendamentos
      .listarTodos();
  }

  static verificarPropriedade(
    agendamento,
    usuario
  ) {
    if (
      !usuario ||
      usuario.perfil !== "PACIENTE"
    ) {
      return;
    }

    if (
      Number(agendamento.id_paciente) !==
      Number(usuario.id)
    ) {
      throw this.criarErro(
        "Você não pode acessar este agendamento",
        403
      );
    }
  }

  static async buscarPorId(id, usuario) {
    const idAgendamento =
      this.validarId(
        id,
        "ID do agendamento"
      );

    const agendamento =
      await Agendamentos.buscarPorId(
        idAgendamento
      );

    if (!agendamento) {
      throw this.criarErro(
        "Agendamento não encontrado",
        404
      );
    }

    this.verificarPropriedade(
      agendamento,
      usuario
    );

    return agendamento;
  }

  static async listarPorPaciente(
    idPaciente,
    usuario
  ) {
    const pacienteId =
      this.validarId(
        idPaciente,
        "ID do paciente"
      );

    if (
      usuario &&
      usuario.perfil === "PACIENTE" &&
      pacienteId !== Number(usuario.id)
    ) {
      throw this.criarErro(
        "Você não pode consultar os agendamentos de outro paciente",
        403
      );
    }

    const paciente =
      await Agendamentos
        .buscarPaciente(pacienteId);

    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado",
        404
      );
    }

    return await Agendamentos
      .listarPorPaciente(pacienteId);
  }

  static async listarMe(usuario) {
    return this.listarPorPaciente(
      usuario.id,
      usuario
    );
  }

  static async cadastrar(dados, usuario) {
    const {
      id_paciente,
      id_profissional,
      id_disponibilidade,
      observacao,
      id_triagem
    } = dados;

    const pacienteInformado =
      usuario &&
      usuario.perfil === "PACIENTE"
        ? usuario.id
        : id_paciente;

    if (
      !pacienteInformado ||
      !id_profissional ||
      !id_disponibilidade
    ) {
      throw this.criarErro(
        "Paciente, profissional e disponibilidade são obrigatórios",
        400
      );
    }

    const pacienteId =
      this.validarId(
        pacienteInformado,
        "ID do paciente"
      );

    const profissionalId =
      this.validarId(
        id_profissional,
        "ID do profissional"
      );

    const disponibilidadeId =
      this.validarId(
        id_disponibilidade,
        "ID da disponibilidade"
      );

    const paciente =
      await Agendamentos
        .buscarPaciente(pacienteId);

    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado",
        404
      );
    }

    if (!paciente.ativo) {
      throw this.criarErro(
        "O paciente está inativo",
        409
      );
    }

    const disponibilidade =
      await Agendamentos
        .buscarDisponibilidade(
          disponibilidadeId
        );

    if (!disponibilidade) {
      throw this.criarErro(
        "Disponibilidade não encontrada",
        404
      );
    }

    if (
      Number(
        disponibilidade.id_profissional
      ) !== profissionalId
    ) {
      throw this.criarErro(
        "A disponibilidade não pertence ao profissional informado",
        400
      );
    }

    if (
      !disponibilidade
        .profissional_ativo
    ) {
      throw this.criarErro(
        "O profissional está inativo",
        409
      );
    }

    if (
      disponibilidade.status !==
      "DISPONIVEL"
    ) {
      throw this.criarErro(
        "O horário selecionado não está disponível",
        409
      );
    }

    const conflito =
      await Agendamentos
        .buscarConflitoPaciente(
          pacienteId,
          disponibilidade.data,
          disponibilidade.hora_inicio
        );

    if (conflito) {
      throw this.criarErro(
        "O paciente já possui um agendamento nesse horário",
        409
      );
    }

    let triagemId = null;

    if (
      id_triagem !== undefined &&
      id_triagem !== null &&
      id_triagem !== ""
    ) {
      triagemId = this.validarId(
        id_triagem,
        "ID da triagem"
      );

      const triagem =
        await Triagens.buscarPorId(
          triagemId
        );

      if (!triagem) {
        throw this.criarErro(
          "Triagem não encontrada",
          404
        );
      }

      if (
        Number(triagem.id_paciente) !==
        Number(pacienteId)
      ) {
        throw this.criarErro(
          "Triagem pertence a outro paciente",
          403
        );
      }

      if (triagem.id_agendamento) {
        throw this.criarErro(
          "Triagem já vinculada a outro agendamento",
          409
        );
      }
    }

    const agendamento =
      await Agendamentos.cadastrar({
        id_paciente: pacienteId,

        id_profissional:
          profissionalId,

        id_disponibilidade:
          disponibilidadeId,

        observacao:
          observacao !== undefined &&
          observacao !== ""
            ? String(observacao).trim()
            : null
      });

    if (!agendamento) {
      throw this.criarErro(
        "O horário acabou de ser reservado por outra pessoa",
        409
      );
    }

    const agendamentoCompleto =
      await Agendamentos
        .buscarPorId(
          agendamento.id_agendamento
        );

    if (triagemId) {
      await Triagens.vincularAgendamento(
        triagemId,
        agendamentoCompleto.id_agendamento
      );
    }

    await NotificacoesService.notificar({
      id_paciente: pacienteId,

      id_agendamento:
        agendamentoCompleto.id_agendamento,

      tipo: "AGENDAMENTO_CRIADO",

      titulo: "Consulta agendada",

      mensagem:
        `Sua consulta com ${agendamentoCompleto.profissional_nome} ` +
        `(${agendamentoCompleto.especialidade_nome}) foi agendada ` +
        `para ${this.formatarData(agendamentoCompleto.data_consulta)} ` +
        `às ${this.formatarHora(agendamentoCompleto.hora_consulta)}.`
    });

    return agendamentoCompleto;
  }

  static async atualizar(
    id,
    dados,
    usuario
  ) {
    const idAgendamento =
      this.validarId(
        id,
        "ID do agendamento"
      );

    const agendamentoAtual =
      await Agendamentos
        .buscarAgendamentoCompleto(
          idAgendamento
        );

    if (!agendamentoAtual) {
      throw this.criarErro(
        "Agendamento não encontrado",
        404
      );
    }

    this.verificarPropriedade(
      agendamentoAtual,
      usuario
    );

    const {
      observacao,
      status
    } = dados;

    /*
      Para mudar profissional, data ou
      horário, utilize futuramente uma
      operação específica de reagendamento.
    */

    let novoStatus =
      agendamentoAtual.status;

    if (status !== undefined) {
      novoStatus =
        this.validarStatus(status);
    }

    if (
      novoStatus === "CANCELADO"
    ) {
      return await this.cancelar(
        idAgendamento,
        usuario
      );
    }

    if (
      agendamentoAtual.status ===
      "CANCELADO"
    ) {
      throw this.criarErro(
        "Um agendamento cancelado não pode ser alterado",
        409
      );
    }

    const agendamento =
      await Agendamentos.atualizarDados(
        idAgendamento,
        {
          observacao:
            observacao !== undefined
              ? observacao === null ||
                String(
                  observacao
                ).trim() === ""
                ? null
                : String(
                    observacao
                  ).trim()
              : agendamentoAtual
                  .observacao,

          status: novoStatus
        }
      );

    const agendamentoAtualizado =
      await Agendamentos
        .buscarPorId(
          agendamento.id_agendamento
        );

    const statusMudou =
      novoStatus !== agendamentoAtual.status;

    const confirmado =
      statusMudou &&
      novoStatus === "CONFIRMADO";

    await NotificacoesService.notificar({
      id_paciente:
        agendamentoAtualizado.id_paciente,

      id_agendamento:
        agendamentoAtualizado.id_agendamento,

      tipo: confirmado
        ? "AGENDAMENTO_CONFIRMADO"
        : "AGENDAMENTO_ATUALIZADO",

      titulo: confirmado
        ? "Consulta confirmada"
        : "Agendamento atualizado",

      mensagem: confirmado
        ? `Sua consulta com ${agendamentoAtualizado.profissional_nome} ` +
          `foi confirmada para ${this.formatarData(agendamentoAtualizado.data_consulta)} ` +
          `às ${this.formatarHora(agendamentoAtualizado.hora_consulta)}.`
        : `Seu agendamento de ${this.formatarData(agendamentoAtualizado.data_consulta)} ` +
          `às ${this.formatarHora(agendamentoAtualizado.hora_consulta)} foi atualizado. ` +
          `Situação atual: ${agendamentoAtualizado.status}.`
    });

    return agendamentoAtualizado;
  }

  /*
    Reagenda o agendamento para outra
    disponibilidade. Somente o paciente dono
    pode utilizar esta operação.
  */
  static async reagendar(id, dados, usuario) {
    const idAgendamento =
      this.validarId(
        id,
        "ID do agendamento"
      );

    const idDisponibilidadeNova =
      this.validarId(
        dados && dados.id_disponibilidade,
        "ID da disponibilidade"
      );

    const agendamentoAtual =
      await Agendamentos
        .buscarAgendamentoCompleto(
          idAgendamento
        );

    if (!agendamentoAtual) {
      throw this.criarErro(
        "Agendamento não encontrado",
        404
      );
    }

    if (
      !usuario ||
      usuario.perfil !== "PACIENTE" ||
      Number(agendamentoAtual.id_paciente) !==
        Number(usuario.id)
    ) {
      throw this.criarErro(
        "Apenas o paciente dono pode reagendar este agendamento",
        403
      );
    }

    if (
      agendamentoAtual.status === "CANCELADO"
    ) {
      throw this.criarErro(
        "Um agendamento cancelado não pode ser reagendado",
        409
      );
    }

    if (
      agendamentoAtual.status === "REALIZADO"
    ) {
      throw this.criarErro(
        "Um agendamento realizado não pode ser reagendado",
        409
      );
    }

    const novaDisponibilidade =
      await Agendamentos
        .buscarDisponibilidade(
          idDisponibilidadeNova
        );

    if (!novaDisponibilidade) {
      throw this.criarErro(
        "Disponibilidade não encontrada",
        404
      );
    }

    if (
      !novaDisponibilidade.profissional_ativo
    ) {
      throw this.criarErro(
        "O profissional está inativo",
        409
      );
    }

    /*
      Reagendamento para o mesmo horário
      atual não faz sentido; respondemos
      antes de chamar o model, com uma
      mensagem específica (o CTE do model
      já devolveria 409 nesse caso).
    */
    if (
      Number(
        novaDisponibilidade.id_disponibilidade
      ) ===
      Number(
        agendamentoAtual.id_disponibilidade
      )
    ) {
      throw this.criarErro(
        "O horário selecionado é o mesmo do agendamento atual",
        409
      );
    }

    const conflito =
      await Agendamentos
        .buscarConflitoPaciente(
          agendamentoAtual.id_paciente,
          novaDisponibilidade.data,
          novaDisponibilidade.hora_inicio,
          idAgendamento
        );

    if (conflito) {
      throw this.criarErro(
        "O paciente já possui um agendamento nesse horário",
        409
      );
    }

    const reagendado =
      await Agendamentos.reagendar({
        id_agendamento: idAgendamento,

        id_disponibilidade_nova:
          idDisponibilidadeNova,

        id_disponibilidade_antiga:
          agendamentoAtual.id_disponibilidade
      });

    if (!reagendado) {
      throw this.criarErro(
        "O horário selecionado não está disponível",
        409
      );
    }

    const agendamentoReagendado =
      await Agendamentos.buscarPorId(
        idAgendamento
      );

    await NotificacoesService.notificar({
      id_paciente:
        agendamentoReagendado.id_paciente,

      id_agendamento:
        agendamentoReagendado.id_agendamento,

      tipo: "AGENDAMENTO_REAGENDADO",

      titulo: "Consulta reagendada",

      mensagem:
        `Sua consulta foi reagendada de ` +
        `${this.formatarData(agendamentoAtual.data_consulta)} ` +
        `às ${this.formatarHora(agendamentoAtual.hora_consulta)} ` +
        `para ${this.formatarData(agendamentoReagendado.data_consulta)} ` +
        `às ${this.formatarHora(agendamentoReagendado.hora_consulta)} ` +
        `com ${agendamentoReagendado.profissional_nome}.`
    });

    return agendamentoReagendado;
  }

  static async cancelar(id, usuario) {
    const idAgendamento =
      this.validarId(
        id,
        "ID do agendamento"
      );

    const agendamentoAtual =
      await Agendamentos
        .buscarAgendamentoCompleto(
          idAgendamento
        );

    if (!agendamentoAtual) {
      throw this.criarErro(
        "Agendamento não encontrado",
        404
      );
    }

    this.verificarPropriedade(
      agendamentoAtual,
      usuario
    );

    if (
      agendamentoAtual.status ===
      "CANCELADO"
    ) {
      throw this.criarErro(
        "O agendamento já está cancelado",
        409
      );
    }

    if (
      agendamentoAtual.status ===
      "REALIZADO"
    ) {
      throw this.criarErro(
        "Um agendamento realizado não pode ser cancelado",
        409
      );
    }

    const agendamento =
      await Agendamentos.cancelar(
        idAgendamento
      );

    if (!agendamento) {
      throw this.criarErro(
        "Não foi possível cancelar o agendamento",
        409
      );
    }

    const agendamentoCancelado =
      await Agendamentos
        .buscarPorId(idAgendamento);

    await NotificacoesService.notificar({
      id_paciente:
        agendamentoCancelado.id_paciente,

      id_agendamento:
        agendamentoCancelado.id_agendamento,

      tipo: "AGENDAMENTO_CANCELADO",

      titulo: "Consulta cancelada",

      mensagem:
        `Seu agendamento de ${this.formatarData(agendamentoCancelado.data_consulta)} ` +
        `às ${this.formatarHora(agendamentoCancelado.hora_consulta)} ` +
        `com ${agendamentoCancelado.profissional_nome} foi cancelado.`
    });

    return agendamentoCancelado;
  }

  static async excluir(id, usuario) {
    const idAgendamento =
      this.validarId(
        id,
        "ID do agendamento"
      );

    const agendamentoAtual =
      await Agendamentos
        .buscarAgendamentoCompleto(
          idAgendamento
        );

    if (!agendamentoAtual) {
      throw this.criarErro(
        "Agendamento não encontrado",
        404
      );
    }

    this.verificarPropriedade(
      agendamentoAtual,
      usuario
    );

    const agendamento =
      await Agendamentos.excluir(
        idAgendamento
      );

    await NotificacoesService.notificar({
      id_paciente: agendamentoAtual.id_paciente,

      tipo: "AGENDAMENTO_EXCLUIDO",

      titulo: "Agendamento excluído",

      mensagem:
        `Seu agendamento de ${this.formatarData(agendamentoAtual.data_consulta)} ` +
        `às ${this.formatarHora(agendamentoAtual.hora_consulta)} foi excluído.`
    });

    return agendamento;
  }
}

module.exports = AgendamentosService;