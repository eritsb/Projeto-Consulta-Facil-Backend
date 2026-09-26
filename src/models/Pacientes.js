const sql =
  require("../config/database");

class Pacientes {
  static async listarTodos() {
    return await sql`
      SELECT
        id_paciente,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco,
        ativo,
        data_cadastro
      FROM pacientes
      ORDER BY id_paciente
    `;
  }

 static async buscarPorNome(nome) {
    return await sql`
        SELECT
            id_paciente,
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            endereco,
            ativo,
            data_cadastro
        FROM pacientes
        WHERE nome ILIKE ${"%" + nome + "%"}
        ORDER BY nome
    `;
}
  
  static async buscarPorId(id) {
    const resultado = await sql`
      SELECT
        id_paciente,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco,
        ativo,
        data_cadastro
      FROM pacientes
      WHERE id_paciente = ${id}
    `;

    return resultado[0];
  }

  static async buscarCompletoPorId(id) {
    const resultado = await sql`
      SELECT
        id_paciente,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha_hash,
        endereco,
        ativo,
        data_cadastro
      FROM pacientes
      WHERE id_paciente = ${id}
    `;

    return resultado[0];
  }

  static async buscarPorCpfOuEmail(
    cpf,
    email
  ) {
    const resultado = await sql`
      SELECT
        id_paciente,
        cpf,
        email
      FROM pacientes
      WHERE cpf = ${cpf}
         OR LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    return resultado[0];
  }

  static async buscarDuplicado(
    cpf,
    email,
    idPaciente
  ) {
    const resultado = await sql`
      SELECT
        id_paciente
      FROM pacientes
      WHERE (
        cpf = ${cpf}
        OR LOWER(email) = LOWER(${email})
      )
      AND id_paciente <> ${idPaciente}
      LIMIT 1
    `;

    return resultado[0];
  }

  static async cadastrar(dados) {
    const {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha_hash,
      endereco
    } = dados;

    const resultado = await sql`
      INSERT INTO pacientes (
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha_hash,
        endereco
      )
      VALUES (
        ${nome},
        ${cpf},
        ${data_nascimento},
        ${telefone},
        ${email},
        ${senha_hash},
        ${endereco}
      )
      RETURNING
        id_paciente,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco,
        ativo,
        data_cadastro
    `;

    return resultado[0];
  }

  static async atualizar(id, dados) {
    const {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha_hash,
      endereco,
      ativo
    } = dados;

    const resultado = await sql`
      UPDATE pacientes
      SET
        nome = ${nome},
        cpf = ${cpf},
        data_nascimento = ${data_nascimento},
        telefone = ${telefone},
        email = ${email},
        senha_hash = ${senha_hash},
        endereco = ${endereco},
        ativo = ${ativo}
      WHERE id_paciente = ${id}
      RETURNING
        id_paciente,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        endereco,
        ativo,
        data_cadastro
    `;

    return resultado[0];
  }

  static async excluir(id) {
    const resultado = await sql`
      DELETE FROM pacientes
      WHERE id_paciente = ${id}
      RETURNING
        id_paciente,
        nome
    `;

    return resultado[0];
  }

  static async buscarPorEmailParaLogin(email) {
  
    const resultado = await sql`
      SELECT
        id_paciente,
        nome,
        cpf,
        email,
        senha_hash,
        ativo
      FROM pacientes
  
      WHERE LOWER(email) =
            LOWER(${email})
  
      LIMIT 1
    `;
  
    return resultado[0];
  
  }

}

module.exports = Pacientes;