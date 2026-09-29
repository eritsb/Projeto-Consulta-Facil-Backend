const sql =
  require("../config/database");

class Profissionais {
  static async listarTodos() {
    return await sql`
      SELECT
        p.id_profissional,
        p.id_clinica,
        p.id_especialidade,
        p.nome,
        p.cpf,
        p.registro_profissional,
        p.conselho,
        p.telefone,
        p.email,
        p.perfil,
        p.ativo,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome
      FROM profissionais p
      INNER JOIN clinicas c
        ON p.id_clinica =
           c.id_clinica
      INNER JOIN especialidades e
        ON p.id_especialidade =
           e.id_especialidade
      ORDER BY p.nome
    `;
  }

  static async buscarPorNome(nome) {
    return await sql`
      SELECT
        p.id_profissional,
        p.id_clinica,
        p.id_especialidade,
        p.nome,
        p.cpf,
        p.registro_profissional,
        p.conselho,
        p.telefone,
        p.email,
        p.perfil,
        p.ativo,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome
      FROM profissionais p
      INNER JOIN clinicas c
        ON p.id_clinica =
           c.id_clinica
      INNER JOIN especialidades e
        ON p.id_especialidade =
           e.id_especialidade
      WHERE p.nome ILIKE
            ${"%" + nome + "%"}
      ORDER BY p.nome
    `;
  }

  static async buscarPorClinica(
    idClinica
  ) {
    return await sql`
      SELECT
        p.id_profissional,
        p.id_clinica,
        p.id_especialidade,
        p.nome,
        p.cpf,
        p.registro_profissional,
        p.conselho,
        p.telefone,
        p.email,
        p.perfil,
        p.ativo,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome
      FROM profissionais p
      INNER JOIN clinicas c
        ON p.id_clinica =
           c.id_clinica
      INNER JOIN especialidades e
        ON p.id_especialidade =
           e.id_especialidade
      WHERE p.id_clinica =
            ${idClinica}
      ORDER BY p.nome
    `;
  }

  static async buscarPorEspecialidade(
    idEspecialidade
  ) {
    return await sql`
      SELECT
        p.id_profissional,
        p.id_clinica,
        p.id_especialidade,
        p.nome,
        p.cpf,
        p.registro_profissional,
        p.conselho,
        p.telefone,
        p.email,
        p.perfil,
        p.ativo,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome
      FROM profissionais p
      INNER JOIN clinicas c
        ON p.id_clinica =
           c.id_clinica
      INNER JOIN especialidades e
        ON p.id_especialidade =
           e.id_especialidade
      WHERE p.id_especialidade =
            ${idEspecialidade}
      ORDER BY p.nome
    `;
  }

  static async buscarPorId(id) {
    const resultado = await sql`
      SELECT
        p.id_profissional,
        p.id_clinica,
        p.id_especialidade,
        p.nome,
        p.cpf,
        p.registro_profissional,
        p.conselho,
        p.telefone,
        p.email,
        p.perfil,
        p.ativo,
        c.nome AS clinica_nome,
        e.nome AS especialidade_nome
      FROM profissionais p
      INNER JOIN clinicas c
        ON p.id_clinica =
           c.id_clinica
      INNER JOIN especialidades e
        ON p.id_especialidade =
           e.id_especialidade
      WHERE p.id_profissional = ${id}
    `;

    return resultado[0];
  }

  static async buscarCompletoPorId(id) {
    const resultado = await sql`
      SELECT
        id_profissional,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_profissional,
        conselho,
        telefone,
        email,
        senha_hash,
        perfil,
        ativo
      FROM profissionais
      WHERE id_profissional = ${id}
    `;

    return resultado[0];
  }

  static async buscarPorCpf(cpf) {
    const resultado = await sql`
      SELECT
        id_profissional,
        cpf
      FROM profissionais
      WHERE cpf = ${cpf}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarPorEmail(email) {
    const resultado = await sql`
      SELECT
        id_profissional,
        email
      FROM profissionais
      WHERE LOWER(email) =
            LOWER(${email})
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarDuplicado(
    cpf,
    email,
    idProfissional
  ) {
    const resultado = await sql`
      SELECT id_profissional
      FROM profissionais
      WHERE (
        cpf = ${cpf}
        OR LOWER(email) =
           LOWER(${email})
      )
      AND id_profissional <>
          ${idProfissional}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarRegistro(
    conselho,
    registro
  ) {
    const resultado = await sql`
      SELECT id_profissional
      FROM profissionais
      WHERE UPPER(conselho) =
            UPPER(${conselho})
        AND registro_profissional =
            ${registro}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarRegistroDuplicado(
    conselho,
    registro,
    idProfissional
  ) {
    const resultado = await sql`
      SELECT id_profissional
      FROM profissionais
      WHERE UPPER(conselho) =
            UPPER(${conselho})
        AND registro_profissional =
            ${registro}
        AND id_profissional <>
            ${idProfissional}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarPorEmailParaLogin(
    email
  ) {
    const resultado = await sql`
      SELECT
        id_profissional,
        nome,
        email,
        senha_hash,
        perfil,
        ativo
      FROM profissionais
      WHERE LOWER(email) =
            LOWER(${email})
      LIMIT 1
    `;

    return resultado[0];
  }

  static async cadastrar(dados) {
    const resultado = await sql`
      INSERT INTO profissionais (
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_profissional,
        conselho,
        telefone,
        email,
        senha_hash,
        perfil,
        ativo
      )
      VALUES (
        ${dados.id_clinica},
        ${dados.id_especialidade},
        ${dados.nome},
        ${dados.cpf},
        ${dados.registro_profissional},
        ${dados.conselho},
        ${dados.telefone},
        ${dados.email},
        ${dados.senha_hash},
        ${dados.perfil},
        ${dados.ativo}
      )
      RETURNING
        id_profissional,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_profissional,
        conselho,
        telefone,
        email,
        perfil,
        ativo
    `;

    return resultado[0];
  }

  static async atualizar(id, dados) {
    const resultado = await sql`
      UPDATE profissionais
      SET
        id_clinica =
          ${dados.id_clinica},

        id_especialidade =
          ${dados.id_especialidade},

        nome = ${dados.nome},
        cpf = ${dados.cpf},

        registro_profissional =
          ${dados.registro_profissional},

        conselho = ${dados.conselho},
        telefone = ${dados.telefone},
        email = ${dados.email},

        senha_hash =
          ${dados.senha_hash},

        perfil = 'PROFISSIONAL',
        ativo = ${dados.ativo}

      WHERE id_profissional = ${id}

      RETURNING
        id_profissional,
        id_clinica,
        id_especialidade,
        nome,
        cpf,
        registro_profissional,
        conselho,
        telefone,
        email,
        perfil,
        ativo
    `;

    return resultado[0];
  }

  static async excluir(id) {
    const resultado = await sql`
      DELETE FROM profissionais
      WHERE id_profissional = ${id}
      RETURNING
        id_profissional,
        nome,
        perfil
    `;

    return resultado[0];
  }
}

module.exports = Profissionais;