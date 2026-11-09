const sql = require("../config/database");

class Agendamentos {
  static async listarTodos() {
    return await sql`
      SELECT
        a.id_agendamento,
        a.id_paciente,
        pa.nome AS paciente_nome,

        a.id_profissional,
        pr.nome AS profissional_nome,
        pr.registro_profissional,
        pr.conselho,

        pr.id_clinica,
        cl.nome AS clinica_nome,

        pr.id_especialidade,
        es.nome AS especialidade_nome,

        a.id_disponibilidade,
        a.data_consulta,
        a.hora_consulta,
        d.hora_fim,

        a.status,
        a.observacao,
        a.data_criacao

      FROM agendamentos a

      INNER JOIN pacientes pa
        ON pa.id_paciente =
           a.id_paciente

      INNER JOIN profissionais pr
        ON pr.id_profissional =
           a.id_profissional

      INNER JOIN clinicas cl
        ON cl.id_clinica =
           pr.id_clinica

      INNER JOIN especialidades es
        ON es.id_especialidade =
           pr.id_especialidade

      INNER JOIN disponibilidades d
        ON d.id_disponibilidade =
           a.id_disponibilidade

      ORDER BY
        a.data_consulta,
        a.hora_consulta
    `;
  }

  static async buscarPorId(id) {
    const resultado = await sql`
      SELECT
        a.id_agendamento,
        a.id_paciente,
        pa.nome AS paciente_nome,

        a.id_profissional,
        pr.nome AS profissional_nome,
        pr.registro_profissional,
        pr.conselho,

        pr.id_clinica,
        cl.nome AS clinica_nome,

        pr.id_especialidade,
        es.nome AS especialidade_nome,

        a.id_disponibilidade,
        a.data_consulta,
        a.hora_consulta,
        d.hora_fim,

        a.status,
        a.observacao,
        a.data_criacao

      FROM agendamentos a

      INNER JOIN pacientes pa
        ON pa.id_paciente =
           a.id_paciente

      INNER JOIN profissionais pr
        ON pr.id_profissional =
           a.id_profissional

      INNER JOIN clinicas cl
        ON cl.id_clinica =
           pr.id_clinica

      INNER JOIN especialidades es
        ON es.id_especialidade =
           pr.id_especialidade

      INNER JOIN disponibilidades d
        ON d.id_disponibilidade =
           a.id_disponibilidade

      WHERE a.id_agendamento = ${id}
    `;

    return resultado[0];
  }

  static async listarProximos(horas) {
    return await sql`
      SELECT
        a.id_agendamento,
        a.id_paciente,
        pa.nome AS paciente_nome,

        a.id_profissional,
        pr.nome AS profissional_nome,

        cl.id_clinica,
        cl.nome AS clinica_nome,

        es.id_especialidade,
        es.nome AS especialidade_nome,

        a.id_disponibilidade,
        a.data_consulta,
        a.hora_consulta,
        d.hora_fim,

        a.status,
        a.observacao,
        a.data_criacao

      FROM agendamentos a

      INNER JOIN pacientes pa
        ON pa.id_paciente =
           a.id_paciente

      INNER JOIN profissionais pr
        ON pr.id_profissional =
           a.id_profissional

      INNER JOIN clinicas cl
        ON cl.id_clinica =
           pr.id_clinica

      INNER JOIN especialidades es
        ON es.id_especialidade =
           pr.id_especialidade

      INNER JOIN disponibilidades d
        ON d.id_disponibilidade =
           a.id_disponibilidade

      WHERE a.status IN (
        'AGENDADO',
        'CONFIRMADO'
      )

        AND (
          a.data_consulta + a.hora_consulta
        ) BETWEEN LOCALTIMESTAMP
          AND LOCALTIMESTAMP +
              make_interval(hours => ${horas}::int)

      ORDER BY
        a.data_consulta,
        a.hora_consulta
    `;
  }

  static async listarPorPaciente(
    idPaciente
  ) {
    return await sql`
      SELECT
        a.id_agendamento,
        a.id_paciente,
        pa.nome AS paciente_nome,

        a.id_profissional,
        pr.nome AS profissional_nome,

        cl.id_clinica,
        cl.nome AS clinica_nome,

        es.id_especialidade,
        es.nome AS especialidade_nome,

        a.id_disponibilidade,
        a.data_consulta,
        a.hora_consulta,
        d.hora_fim,

        a.status,
        a.observacao,
        a.data_criacao

      FROM agendamentos a

      INNER JOIN pacientes pa
        ON pa.id_paciente =
           a.id_paciente

      INNER JOIN profissionais pr
        ON pr.id_profissional =
           a.id_profissional

      INNER JOIN clinicas cl
        ON cl.id_clinica =
           pr.id_clinica

      INNER JOIN especialidades es
        ON es.id_especialidade =
           pr.id_especialidade

      INNER JOIN disponibilidades d
        ON d.id_disponibilidade =
           a.id_disponibilidade

      WHERE a.id_paciente =
            ${idPaciente}

      ORDER BY
        a.data_consulta,
        a.hora_consulta
    `;
  }

  static async buscarPaciente(id) {
    const resultado = await sql`
      SELECT
        id_paciente,
        nome,
        ativo
      FROM pacientes
      WHERE id_paciente = ${id}
    `;

    return resultado[0];
  }

  static async buscarDisponibilidade(id) {
    const resultado = await sql`
      SELECT
        d.id_disponibilidade,
        d.id_profissional,
        d.data,
        d.hora_inicio,
        d.hora_fim,
        d.status,
        p.nome AS profissional_nome,
        p.ativo AS profissional_ativo

      FROM disponibilidades d

      INNER JOIN profissionais p
        ON p.id_profissional =
           d.id_profissional

      WHERE d.id_disponibilidade = ${id}
    `;

    return resultado[0];
  }

  static async buscarAgendamentoCompleto(
    id
  ) {
    const resultado = await sql`
      SELECT *
      FROM agendamentos
      WHERE id_agendamento = ${id}
    `;

    return resultado[0];
  }

  static async buscarConflitoPaciente(
    idPaciente,
    dataConsulta,
    horaConsulta,
    idIgnorado = 0
  ) {
    const resultado = await sql`
      SELECT id_agendamento
      FROM agendamentos

      WHERE id_paciente =
            ${idPaciente}

        AND data_consulta =
            ${dataConsulta}

        AND hora_consulta =
            ${horaConsulta}

        AND status NOT IN (
          'CANCELADO'
        )

        AND id_agendamento <>
            ${idIgnorado}

      LIMIT 1
    `;

    return resultado[0];
  }

  static async cadastrar(dados) {
    const {
      id_paciente,
      id_profissional,
      id_disponibilidade,
      observacao
    } = dados;

    /*
      A disponibilidade só será reservada
      se ainda estiver como DISPONIVEL.

      O INSERT utiliza a data e o horário
      registrados na disponibilidade.
    */

    const resultado = await sql`
      WITH disponibilidade_reservada AS (
        UPDATE disponibilidades

        SET status = 'RESERVADO'

        WHERE id_disponibilidade =
              ${id_disponibilidade}

          AND id_profissional =
              ${id_profissional}

          AND status = 'DISPONIVEL'

        RETURNING
          id_disponibilidade,
          id_profissional,
          data,
          hora_inicio
      ),

      agendamento_criado AS (
        INSERT INTO agendamentos (
          id_paciente,
          id_profissional,
          id_disponibilidade,
          data_consulta,
          hora_consulta,
          status,
          observacao
        )

        SELECT
          ${id_paciente},
          id_profissional,
          id_disponibilidade,
          data,
          hora_inicio,
          'AGENDADO',
          ${observacao}

        FROM disponibilidade_reservada

        RETURNING *
      )

      SELECT *
      FROM agendamento_criado
    `;

    return resultado[0];
  }

  static async atualizarDados(
    id,
    dados
  ) {
    const {
      observacao,
      status
    } = dados;

    const resultado = await sql`
      UPDATE agendamentos

      SET
        observacao = ${observacao},
        status = ${status}

      WHERE id_agendamento = ${id}

      RETURNING *
    `;

    return resultado[0];
  }

  /*
    Reagenda em um único statement com CTEs,
    seguindo a ordem exigida: reserva a nova
    disponibilidade, atualiza o agendamento
    aproveitando os valores já retornados pela
    reserva e só então libera a antiga.
    Por ser um statement só, o Postgres aplica
    tudo com atomicidade: se a nova
    disponibilidade não estiver DISPONIVEL,
    nenhum passo é aplicado e a consulta
    devolve nenhuma linha (o service responde
    409 sem alterar mais nada).
  */
  static async reagendar(dados) {
    const {
      id_agendamento,
      id_disponibilidade_nova,
      id_disponibilidade_antiga
    } = dados;

    const resultado = await sql`
      WITH disponibilidade_reservada AS (
        UPDATE disponibilidades

        SET status = 'RESERVADO'

        WHERE id_disponibilidade =
              ${id_disponibilidade_nova}

          AND status = 'DISPONIVEL'

        RETURNING
          id_disponibilidade,
          id_profissional,
          data,
          hora_inicio
      ),

      agendamento_atualizado AS (
        UPDATE agendamentos

        SET
          id_profissional = n.id_profissional,
          id_disponibilidade = n.id_disponibilidade,
          data_consulta = n.data,
          hora_consulta = n.hora_inicio

        FROM disponibilidade_reservada n

        WHERE id_agendamento =
              ${id_agendamento}

        RETURNING
          agendamentos.id_agendamento,
          agendamentos.id_disponibilidade
      ),

      disponibilidade_liberada AS (
        UPDATE disponibilidades

        SET status = 'DISPONIVEL'

        FROM agendamento_atualizado r

        WHERE disponibilidades.id_disponibilidade =
              ${id_disponibilidade_antiga}

          AND disponibilidades.id_disponibilidade <>
              r.id_disponibilidade
      )

      SELECT *
      FROM agendamento_atualizado
    `;

    return resultado[0] || null;
  }

  static async cancelar(id) {
    const resultado = await sql`
      WITH agendamento_cancelado AS (
        UPDATE agendamentos

        SET status = 'CANCELADO'

        WHERE id_agendamento = ${id}

          AND status NOT IN (
            'CANCELADO',
            'REALIZADO'
          )

        RETURNING
          id_agendamento,
          id_disponibilidade,
          status
      ),

      disponibilidade_liberada AS (
        UPDATE disponibilidades d

        SET status = 'DISPONIVEL'

        FROM agendamento_cancelado a

        WHERE d.id_disponibilidade =
              a.id_disponibilidade

        RETURNING d.id_disponibilidade
      )

      SELECT *
      FROM agendamento_cancelado
    `;

    return resultado[0];
  }

  static async excluir(id) {
    const resultado = await sql`
      WITH agendamento_excluido AS (
        DELETE FROM agendamentos

        WHERE id_agendamento = ${id}

        RETURNING
          id_agendamento,
          id_disponibilidade,
          id_paciente,
          status
      ),

      disponibilidade_liberada AS (
        UPDATE disponibilidades d

        SET status = 'DISPONIVEL'

        FROM agendamento_excluido a

        WHERE d.id_disponibilidade =
              a.id_disponibilidade

        RETURNING d.id_disponibilidade
      )

      SELECT *
      FROM agendamento_excluido
    `;

    return resultado[0];
  }
}

module.exports = Agendamentos;