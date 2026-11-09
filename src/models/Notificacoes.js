const sql = require("../config/database");

class Notificacoes {

  static async cadastrar({
    id_paciente,
    id_agendamento = null,
    tipo,
    titulo,
    mensagem
  }) {
    const resultado = await sql`
      INSERT INTO notificacoes (
        id_paciente,
        id_agendamento,
        tipo,
        titulo,
        mensagem
      )
      VALUES (
        ${id_paciente},
        ${id_agendamento},
        ${tipo},
        ${titulo},
        ${mensagem}
      )
      RETURNING
        id_notificacao,
        id_paciente,
        id_agendamento,
        tipo,
        titulo,
        mensagem,
        lida,
        data_criacao
    `;

    return resultado[0];
  }

  static async listarPorPaciente(id_paciente) {
    return await sql`
      SELECT
        id_notificacao,
        id_paciente,
        id_agendamento,
        tipo,
        titulo,
        mensagem,
        lida,
        data_criacao
      FROM notificacoes
      WHERE id_paciente = ${id_paciente}
      ORDER BY data_criacao DESC, id_notificacao DESC
    `;
  }

  static async buscarPorId(id_notificacao) {
    const resultado = await sql`
      SELECT
        id_notificacao,
        id_paciente,
        id_agendamento,
        tipo,
        titulo,
        mensagem,
        lida,
        data_criacao
      FROM notificacoes
      WHERE id_notificacao = ${id_notificacao}
    `;

    return resultado[0];
  }

  static async lembreteExiste(
    id_paciente,
    id_agendamento
  ) {
    const resultado = await sql`
      SELECT id_notificacao
      FROM notificacoes
      WHERE id_paciente = ${id_paciente}
        AND id_agendamento = ${id_agendamento}
        AND tipo = 'LEMBRETE_CONSULTA'
      LIMIT 1
    `;

    return resultado[0];
  }

  static async marcarComoLida(
    id_notificacao,
    id_paciente
  ) {
    const resultado = await sql`
      UPDATE notificacoes
      SET lida = TRUE
      WHERE id_notificacao = ${id_notificacao}
        AND id_paciente = ${id_paciente}
      RETURNING
        id_notificacao,
        id_paciente,
        id_agendamento,
        tipo,
        titulo,
        mensagem,
        lida,
        data_criacao
    `;

    return resultado[0];
  }

  static async marcarTodasComoLidas(id_paciente) {
    return await sql`
      UPDATE notificacoes
      SET lida = TRUE
      WHERE id_paciente = ${id_paciente}
        AND lida = FALSE
      RETURNING id_notificacao
    `;
  }

  static async excluir(
    id_notificacao,
    id_paciente
  ) {
    const resultado = await sql`
      DELETE FROM notificacoes
      WHERE id_notificacao = ${id_notificacao}
        AND id_paciente = ${id_paciente}
      RETURNING id_notificacao
    `;

    return resultado[0];
  }
}

module.exports = Notificacoes;
