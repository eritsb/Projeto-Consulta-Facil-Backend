const sql = require("../config/database");

class Triagens {

  static async cadastrar({
    id_paciente,
    sintomas,
    localizacao,
    duracao_sintomas,
    intensidade,
    observacoes
  }) {
    const resultado = await sql`
      INSERT INTO triagens (
        id_paciente,
        sintomas,
        localizacao,
        duracao_sintomas,
        intensidade,
        observacoes
      )
      VALUES (
        ${id_paciente},
        ${sintomas},
        ${localizacao},
        ${duracao_sintomas},
        ${intensidade},
        ${observacoes || null}
      )
      RETURNING *
    `;

    return resultado[0];
  }

  static async listarTodos() {
    return await sql`
      SELECT
        t.*,
        p.nome AS paciente_nome,

        r.id_recomendacao,
        r.id_especialidade,
        e.nome AS especialidade,
        r.confianca,
        r.justificativa

      FROM triagens t

      INNER JOIN pacientes p
        ON p.id_paciente = t.id_paciente

      LEFT JOIN recomendacoes r
        ON r.id_triagem = t.id_triagem

      LEFT JOIN especialidades e
        ON e.id_especialidade = r.id_especialidade

      ORDER BY t.data_triagem DESC, t.id_triagem DESC
    `;
  }

  static async buscarPorId(id_triagem) {
    const resultado = await sql`
      SELECT
        t.*,
        p.nome AS paciente_nome,

        r.id_recomendacao,
        r.id_especialidade,
        e.nome AS especialidade,
        r.confianca,
        r.justificativa

      FROM triagens t

      INNER JOIN pacientes p
        ON p.id_paciente = t.id_paciente

      LEFT JOIN recomendacoes r
        ON r.id_triagem = t.id_triagem

      LEFT JOIN especialidades e
        ON e.id_especialidade = r.id_especialidade

      WHERE t.id_triagem = ${id_triagem}
    `;

    return resultado[0];
  }

  static async buscarPorPaciente(id_paciente) {
    return await sql`
      SELECT
        t.*,

        r.id_recomendacao,
        r.id_especialidade,
        e.nome AS especialidade,
        r.confianca,
        r.justificativa

      FROM triagens t

      LEFT JOIN recomendacoes r
        ON r.id_triagem = t.id_triagem

      LEFT JOIN especialidades e
        ON e.id_especialidade = r.id_especialidade

      WHERE t.id_paciente = ${id_paciente}
      ORDER BY t.data_triagem DESC, t.id_triagem DESC
    `;
  }

  static async atualizar(
    id_triagem,
    {
      sintomas,
      localizacao,
      duracao_sintomas,
      intensidade,
      observacoes
    }
  ) {
    const resultado = await sql`
      UPDATE triagens
      SET
        sintomas = ${sintomas},
        localizacao = ${localizacao},
        duracao_sintomas = ${duracao_sintomas},
        intensidade = ${intensidade},
        observacoes = ${observacoes || null}
      WHERE id_triagem = ${id_triagem}
      RETURNING *
    `;

    return resultado[0];
  }


  static async excluir(id_triagem) {
    const resultado = await sql`
      DELETE FROM triagens
      WHERE id_triagem = ${id_triagem}
      RETURNING *
    `;

    return resultado[0];
  }

  static async vincularAgendamento(
    id_triagem,
    id_agendamento
  ) {
    const resultado = await sql`
      UPDATE triagens
      SET id_agendamento = ${id_agendamento}
      WHERE id_triagem = ${id_triagem}
      RETURNING *
    `;

    return resultado[0];
  }
}

module.exports = Triagens;
