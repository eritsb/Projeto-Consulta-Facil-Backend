const sql = require("../config/database");

class Clinicas {
  static async listarTodas() {
    return await sql`
      SELECT
        id_clinica,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        horario_funcionamento,
        ativo
      FROM clinicas
      ORDER BY nome
    `;
  }

  static async buscarPorId(id) {
    const resultado = await sql`
      SELECT
        id_clinica,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        horario_funcionamento,
        ativo
      FROM clinicas
      WHERE id_clinica = ${id}
    `;

    return resultado[0];
  }

  static async buscarPorNome(nome) {
  return await sql`
    SELECT
      id_clinica,
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      horario_funcionamento,
      ativo
    FROM clinicas
    WHERE nome ILIKE ${"%" + nome + "%"}
    ORDER BY nome
  `;
}

  static async buscarPorCnpj(cnpj) {
    const resultado = await sql`
      SELECT
        id_clinica,
        nome,
        cnpj
      FROM clinicas
      WHERE cnpj = ${cnpj}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarCnpjDuplicado(
    cnpj,
    idClinica
  ) {
    const resultado = await sql`
      SELECT id_clinica
      FROM clinicas
      WHERE cnpj = ${cnpj}
        AND id_clinica <> ${idClinica}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async cadastrar(dados) {
    const {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      horario_funcionamento,
      ativo
    } = dados;

    const resultado = await sql`
      INSERT INTO clinicas (
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        horario_funcionamento,
        ativo
      )
      VALUES (
        ${nome},
        ${cnpj},
        ${telefone},
        ${email},
        ${endereco},
        ${horario_funcionamento},
        ${ativo}
      )
      RETURNING
        id_clinica,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        horario_funcionamento,
        ativo
    `;

    return resultado[0];
  }

  static async atualizar(id, dados) {
    const {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      horario_funcionamento,
      ativo
    } = dados;

    const resultado = await sql`
      UPDATE clinicas
      SET
        nome = ${nome},
        cnpj = ${cnpj},
        telefone = ${telefone},
        email = ${email},
        endereco = ${endereco},
        horario_funcionamento =
          ${horario_funcionamento},
        ativo = ${ativo}
      WHERE id_clinica = ${id}
      RETURNING
        id_clinica,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        horario_funcionamento,
        ativo
    `;

    return resultado[0];
  }

  static async excluir(id) {
    const resultado = await sql`
      DELETE FROM clinicas
      WHERE id_clinica = ${id}
      RETURNING
        id_clinica,
        nome,
        cnpj
    `;

    return resultado[0];
  }
}

module.exports = Clinicas;