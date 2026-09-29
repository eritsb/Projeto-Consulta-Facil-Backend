const sql =
  require("../config/database");

class Administradores {

  static async listarTodos() {

    return await sql`
      SELECT
        id_administrador,
        nome,
        email,
        perfil,
        ativo,
        data_cadastro
      FROM administradores
      ORDER BY nome
    `;

  }

  static async buscarPorId(id) {

    const resultado = await sql`
      SELECT
        id_administrador,
        nome,
        email,
        perfil,
        ativo,
        data_cadastro
      FROM administradores
      WHERE id_administrador = ${id}
    `;

    return resultado[0];

  }

  static async buscarPorEmail(email) {
  const resultado = await sql`
    SELECT
      id_administrador,
      nome,
      email,
      senha_hash,
      perfil,
      ativo,
      data_cadastro
    FROM administradores
    WHERE LOWER(email) =
          LOWER(${email})
    LIMIT 1
  `;

  return resultado[0];
}

  static async cadastrar(dados) {

    const resultado = await sql`
      INSERT INTO administradores
      (
        nome,
        email,
        senha_hash,
        perfil,
        ativo
      )

      VALUES
      (
        ${dados.nome},
        ${dados.email},
        ${dados.senha_hash},
        'ADMIN',
        ${dados.ativo}
      )

      RETURNING
        id_administrador,
        nome,
        email,
        perfil,
        ativo,
        data_cadastro
    `;

    return resultado[0];

  }

  static async atualizar(id, dados) {

    const resultado = await sql`
      UPDATE administradores
      SET
        nome = ${dados.nome},
        email = ${dados.email},
        ativo = ${dados.ativo}

      WHERE id_administrador = ${id}

      RETURNING
        id_administrador,
        nome,
        email,
        perfil,
        ativo,
        data_cadastro
    `;

    return resultado[0];

  }

  static async excluir(id) {

    const resultado = await sql`
      DELETE FROM administradores
      WHERE id_administrador = ${id}

      RETURNING
        id_administrador,
        nome
    `;

    return resultado[0];

  }

}

module.exports =
  Administradores;