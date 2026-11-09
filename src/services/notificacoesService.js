const Notificacoes = require("../models/Notificacoes");
const Agendamentos = require("../models/Agendamentos");

const TIPOS_PERMITIDOS = [
  "AGENDAMENTO_CRIADO",
  "AGENDAMENTO_ATUALIZADO",
  "AGENDAMENTO_CONFIRMADO",
  "AGENDAMENTO_REAGENDADO",
  "AGENDAMENTO_CANCELADO",
  "AGENDAMENTO_EXCLUIDO",
  "PRE_TRIAGEM_IA",
  "LEMBRETE_CONSULTA"
];

class NotificacoesService {

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


  static validarDados({
    id_paciente,
    id_agendamento = null,
    tipo,
    titulo,
    mensagem
  }) {
    const idPaciente = this.validarId(
      id_paciente,
      "ID do paciente"
    );

    let idAgendamento = null;

    if (
      id_agendamento !== null &&
      id_agendamento !== undefined &&
      id_agendamento !== ""
    ) {
      idAgendamento = this.validarId(
        id_agendamento,
        "ID do agendamento"
      );
    }

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      throw this.criarErro(
        "Tipo de notificação inválido",
        400
      );
    }

    if (!titulo || !String(titulo).trim()) {
      throw this.criarErro(
        "Informe o título da notificação",
        400
      );
    }

    if (!mensagem || !String(mensagem).trim()) {
      throw this.criarErro(
        "Informe a mensagem da notificação",
        400
      );
    }

    return {
      id_paciente: idPaciente,
      id_agendamento: idAgendamento,
      tipo,
      titulo: String(titulo).trim(),
      mensagem: String(mensagem).trim()
    };
  }


  // Uso interno: falha na notificação não interrompe o fluxo principal.
  static async notificar(dados) {
    try {
      return await this.cadastrar(dados);

    } catch (error) {
      console.error(
        "Erro ao criar notificação:",
        error
      );

      return null;
    }
  }


  static async cadastrar(dados) {
    const dadosValidados =
      this.validarDados(dados);

    return Notificacoes.cadastrar(
      dadosValidados
    );
  }


  // Gera lembretes para consultas que acontecerão nas próximas horas.
  static async gerarLembretes(
    horasAntecedencia = 24
  ) {
    const horas = Number(horasAntecedencia);

    if (
      !Number.isInteger(horas) ||
      horas <= 0
    ) {
      throw this.criarErro(
        "A antecedência do lembrete deve ser um número inteiro de horas maior que zero",
        400
      );
    }

    const agendamentos =
      await Agendamentos.listarProximos(horas);

    let gerados = 0;
    let ignorados = 0;

    for (const agendamento of agendamentos) {

      const lembrete =
        await Notificacoes.lembreteExiste(
          agendamento.id_paciente,
          agendamento.id_agendamento
        );

      if (lembrete) {
        ignorados += 1;
        continue;
      }

      const notificacao =
        await this.notificar({
          id_paciente:
            agendamento.id_paciente,

          id_agendamento:
            agendamento.id_agendamento,

          tipo: "LEMBRETE_CONSULTA",

          titulo: "Lembrete de consulta",

          mensagem:
            `Sua consulta com ${agendamento.profissional_nome} ` +
            `(${agendamento.especialidade_nome}) está marcada para ` +
            `${this.formatarData(agendamento.data_consulta)} ` +
            `às ${this.formatarHora(agendamento.hora_consulta)}.`
        });

      if (notificacao) {
        gerados += 1;
      } else {
        ignorados += 1;
      }
    }

    return {
      antecedencia_horas: horas,
      gerados,
      ignorados
    };
  }


  static async listar(idPaciente) {
    const pacienteId = this.validarId(
      idPaciente,
      "ID do paciente"
    );

    return Notificacoes.listarPorPaciente(
      pacienteId
    );
  }


  static async buscarPorId(
    idNotificacao,
    idPaciente
  ) {
    const notificacaoId = this.validarId(
      idNotificacao,
      "ID da notificação"
    );

    const pacienteId = this.validarId(
      idPaciente,
      "ID do paciente"
    );

    const notificacao =
      await Notificacoes.buscarPorId(
        notificacaoId
      );

    if (!notificacao) {
      throw this.criarErro(
        "Notificação não encontrada",
        404
      );
    }

    if (
      Number(notificacao.id_paciente) !==
      pacienteId
    ) {
      throw this.criarErro(
        "Você não pode acessar esta notificação",
        403
      );
    }

    return notificacao;
  }


  static async marcarComoLida(
    idNotificacao,
    idPaciente
  ) {
    const notificacao =
      await this.buscarPorId(
        idNotificacao,
        idPaciente
      );

    return Notificacoes.marcarComoLida(
      notificacao.id_notificacao,
      notificacao.id_paciente
    );
  }


  static async marcarTodasComoLidas(idPaciente) {
    const pacienteId = this.validarId(
      idPaciente,
      "ID do paciente"
    );

    const atualizadas =
      await Notificacoes.marcarTodasComoLidas(
        pacienteId
      );

    return {
      mensagem:
        "Notificações marcadas como lidas",
      atualizadas: atualizadas.length
    };
  }


  static async excluir(
    idNotificacao,
    idPaciente
  ) {
    const notificacao =
      await this.buscarPorId(
        idNotificacao,
        idPaciente
      );

    await Notificacoes.excluir(
      notificacao.id_notificacao,
      notificacao.id_paciente
    );

    return {
      mensagem:
        "Notificação excluída com sucesso"
    };
  }
}

module.exports = NotificacoesService;
