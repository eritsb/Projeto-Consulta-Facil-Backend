const sql = require("../config/database");

class Recomendacoes {

  static async cadastrar({
    id_triagem,
    id_especialidade,
    confianca,
    justificativa
  }) {
    const resultado = await sql`
      INSERT INTO recomendacoes (
        id_triagem,
        id_especialidade,
        confianca,
        justificativa
      )
      VALUES (
        ${id_triagem},
        ${id_especialidade},
        ${confianca},
        ${justificativa || null}
      )
      RETURNING
        id_recomendacao,
        id_triagem,
        id_especialidade,
        confianca,
        justificativa
    `;

    return resultado[0];
  }

  static async excluirPorTriagem(id_triagem) {
    return await sql`
      DELETE FROM recomendacoes
      WHERE id_triagem = ${id_triagem}
    `;
  }
}

module.exports = Recomendacoes;
