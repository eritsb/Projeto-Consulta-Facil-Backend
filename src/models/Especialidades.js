const sql = require("../config/database");

class Especialidades {
  static async listarTodos() {
    return await sql`
      SELECT
        id_especialidade,
        nome,
        descricao,
        ativo
      FROM especialidades
      ORDER BY nome
    `;
  }

  static async pesquisarPorNome(nome) {
  return await sql`
    SELECT
      id_especialidade,
      nome,
      descricao,
      ativo
    FROM especialidades
    WHERE nome ILIKE ${"%" + nome + "%"}
    ORDER BY nome
  `;
}

  static async buscarPorId(id) {
    const resultado = await sql`
      SELECT
        id_especialidade,
        nome,
        descricao,
        ativo
      FROM especialidades
      WHERE id_especialidade = ${id}
    `;

    return resultado[0];
  }

  static async buscarPorNome(nome) {
    const resultado = await sql`
      SELECT
        id_especialidade,
        nome,
        descricao,
        ativo
      FROM especialidades
      WHERE LOWER(nome) = LOWER(${nome})
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarNomeDuplicado(
    nome,
    idEspecialidade
  ) {
    const resultado = await sql`
      SELECT id_especialidade
      FROM especialidades
      WHERE LOWER(nome) = LOWER(${nome})
        AND id_especialidade <> ${idEspecialidade}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async cadastrar(dados) {
    const {
      nome,
      descricao,
      ativo
    } = dados;

    const resultado = await sql`
      INSERT INTO especialidades (
        nome,
        descricao,
        ativo
      )
      VALUES (
        ${nome},
        ${descricao},
        ${ativo}
      )
      RETURNING
        id_especialidade,
        nome,
        descricao,
        ativo
    `;

    return resultado[0];
  }

  static async atualizar(id, dados) {
    const {
      nome,
      descricao,
      ativo
    } = dados;

    const resultado = await sql`
      UPDATE especialidades
      SET
        nome = ${nome},
        descricao = ${descricao},
        ativo = ${ativo}
      WHERE id_especialidade = ${id}
      RETURNING
        id_especialidade,
        nome,
        descricao,
        ativo
    `;

    return resultado[0];
  }

  static async excluir(id) {
    const resultado = await sql`
      DELETE FROM especialidades
      WHERE id_especialidade = ${id}
      RETURNING
        id_especialidade,
        nome,
        descricao,
        ativo
    `;

    return resultado[0];
  }
}

module.exports = Especialidades;