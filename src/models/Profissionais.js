const sql = require("../config/database");

class Profissionais {

  static async listarTodos() {

    return await sql`

      SELECT
        p.*,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome

      FROM profissionais p

      INNER JOIN clinicas c
      ON p.id_clinica = c.id_clinica

      INNER JOIN especialidades e
      ON p.id_especialidade = e.id_especialidade

      ORDER BY p.nome

    `;

  }

  static async buscarPorNome(nome) {

  return await sql`

    SELECT
    p.*,
    c.nome AS clinica_nome,
    e.nome AS especialidade_nome

    FROM profissionais p

    INNER JOIN clinicas c
    ON p.id_clinica = c.id_clinica

    INNER JOIN especialidades e
    ON p.id_especialidade = e.id_especialidade

    WHERE p.nome ILIKE ${"%" + nome + "%"}

    ORDER BY p.nome

  `;

  }

    static async buscarPorClinica(idClinica) {

    return await sql`

      SELECT
        p.*,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome

      FROM profissionais p

      INNER JOIN clinicas c
      ON p.id_clinica = c.id_clinica

      INNER JOIN especialidades e
      ON p.id_especialidade = e.id_especialidade

      WHERE p.id_clinica = ${idClinica}

      ORDER BY p.nome

    `;

  }

  static async buscarPorEspecialidade(idEspecialidade) {

    return await sql`

      SELECT
        p.*,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome

      FROM profissionais p

      INNER JOIN clinicas c
      ON p.id_clinica = c.id_clinica

      INNER JOIN especialidades e
      ON p.id_especialidade = e.id_especialidade

      WHERE p.id_especialidade = ${idEspecialidade}

      ORDER BY p.nome

    `;

  }

  static async buscarPorId(id) {

    const resultado = await sql`

      SELECT *
      FROM profissionais

      WHERE id_profissional = ${id}

    `;

    return resultado[0];

  }

  static async buscarPorCpf(cpf) {

    const resultado = await sql`

      SELECT *
      FROM profissionais

      WHERE cpf = ${cpf}

      LIMIT 1

    `;

    return resultado[0];

  }

  static async buscarRegistro(
    conselho,
    registro
  ) {

    const resultado = await sql`

      SELECT *
      FROM profissionais

      WHERE conselho = ${conselho}
      AND registro_profissional = ${registro}

      LIMIT 1

    `;

    return resultado[0];

  }

  static async cadastrar(dados) {

    const resultado = await sql`

      INSERT INTO profissionais
      (
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_profissional,
        conselho,
        telefone,
        email,
        ativo
      )

      VALUES
      (
        ${dados.id_clinica},
        ${dados.id_especialidade},
        ${dados.nome},
        ${dados.cpf},
        ${dados.registro_profissional},
        ${dados.conselho},
        ${dados.telefone},
        ${dados.email},
        ${dados.ativo}
      )

      RETURNING *

    `;

    return resultado[0];

  }

  static async atualizar(id, dados) {

    const resultado = await sql`

      UPDATE profissionais

      SET
        id_clinica = ${dados.id_clinica},
        id_especialidade = ${dados.id_especialidade},
        nome = ${dados.nome},
        cpf = ${dados.cpf},
        registro_profissional =
          ${dados.registro_profissional},
        conselho = ${dados.conselho},
        telefone = ${dados.telefone},
        email = ${dados.email},
        ativo = ${dados.ativo}

      WHERE id_profissional = ${id}

      RETURNING *

    `;

    return resultado[0];

  }

  static async excluir(id) {

    const resultado = await sql`

      DELETE FROM profissionais

      WHERE id_profissional = ${id}

      RETURNING *

    `;

    return resultado[0];

  }

}

module.exports = Profissionais;
