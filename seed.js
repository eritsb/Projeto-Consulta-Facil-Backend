require("dotenv").config();

const bcrypt = require("bcryptjs");
const sql = require("./src/config/database");

const SENHA_ADMIN = "Admin@123";
const SENHA_PROFISSIONAL = "Profissional@123";
const SENHA_PACIENTE = "123456";

const especialidades = [
  ["Dermatologia", "Diagnóstico e tratamento de doenças da pele."],
  ["Ortopedia", "Atendimento relacionado ao sistema musculoesquelético."],
  ["Pediatria", "Atendimento de crianças e adolescentes."],
  ["Neurologia", "Diagnóstico e tratamento de doenças do sistema nervoso."]
];

const clinicas = [
  ["Clinica Bem Estar", "11222333000101", "8132221001", "contato@clinicabemestar.com.br", "Rua da Aurora, 500, Recife - PE", "Segunda a sexta, 08:00 as 18:00"],
  ["Centro Medico Recife", "22333444000102", "8132221002", "contato@centromedicorecife.com.br", "Av. Agamenon Magalhaes, 1200, Recife - PE", "Segunda a sexta, 07:00 as 19:00"],
  ["Clinica Saude Integral", "33444555000103", "8132221003", "contato@saudeintegral.com.br", "Rua do Espinheiro, 850, Recife - PE", "Segunda a sabado, 08:00 as 17:00"],
  ["Instituto Medico Boa Vista", "44555666000104", "8132221004", "contato@institutoboavista.com.br", "Rua Gervasio Pires, 300, Recife - PE", "Segunda a sexta, 08:00 as 18:00"]
];

const profissionais = [
  ["Dra. Mariana Costa", "22233344455", "21001", "CRM", "81991110001", "mariana.costa@consulta.com.br", "Clinica Bem Estar", "Dermatologia"],
  ["Dr. Rafael Almeida", "33344455566", "21002", "CRM", "81991110002", "rafael.almeida@consulta.com.br", "Centro Medico Recife", "Ortopedia"],
  ["Dra. Juliana Martins", "44455566677", "21003", "CRM", "81991110003", "juliana.martins@consulta.com.br", "Clinica Saude Integral", "Pediatria"],
  ["Dr. Felipe Santos", "55566677788", "21004", "CRM", "81991110004", "felipe.santos@consulta.com.br", "Instituto Medico Boa Vista", "Neurologia"],
  ["Dra. Camila Ferreira", "66677788899", "21005", "CRM", "81991110005", "camila.ferreira@consulta.com.br", "Clinica Bem Estar", "Ortopedia"],
  ["Dr. Bruno Oliveira", "77788899900", "21006", "CRM", "81991110006", "bruno.oliveira@consulta.com.br", "Centro Medico Recife", "Pediatria"],
  ["Dra. Larissa Rodrigues", "88899900011", "21007", "CRM", "81991110007", "larissa.rodrigues@consulta.com.br", "Clinica Saude Integral", "Neurologia"],
  ["Dr. Gustavo Lima", "99900011122", "21008", "CRM", "81991110008", "gustavo.lima@consulta.com.br", "Instituto Medico Boa Vista", "Dermatologia"]
];

const pacientes = [
  ["Lucas Ferreira", "22233344401", "1990-03-15", "81992220001", "lucas.ferreira@consulta.com.br", "Rua do Futuro, 100, Recife - PE"],
  ["Mariana Alves", "22233344402", "1988-07-22", "81992220002", "mariana.alves@consulta.com.br", "Rua Real da Torre, 200, Recife - PE"],
  ["Pedro Henrique", "22233344403", "1995-01-10", "81992220003", "pedro.henrique@consulta.com.br", "Av. Norte, 300, Recife - PE"],
  ["Juliana Oliveira", "22233344404", "1992-11-05", "81992220004", "juliana.oliveira@consulta.com.br", "Rua Benfica, 400, Recife - PE"],
  ["Carlos Eduardo", "22233344405", "1985-06-18", "81992220005", "carlos.eduardo@consulta.com.br", "Rua do Paissandu, 500, Recife - PE"],
  ["Beatriz Souza", "22233344406", "1998-09-27", "81992220006", "beatriz.souza@consulta.com.br", "Rua da Hora, 600, Recife - PE"],
  ["Gabriel Santos", "22233344407", "1991-04-12", "81992220007", "gabriel.santos@consulta.com.br", "Rua Joaquim Nabuco, 700, Recife - PE"],
  ["Amanda Rodrigues", "22233344408", "1996-12-03", "81992220008", "amanda.rodrigues@consulta.com.br", "Av. Rui Barbosa, 800, Recife - PE"]
];

const disponibilidades = [
  ["22233344455", "2026-10-05", "08:00", "10:00"],
  ["22233344455", "2026-10-05", "14:00", "16:00"],
  ["33344455566", "2026-10-06", "08:00", "10:00"],
  ["33344455566", "2026-10-06", "14:00", "16:00"],
  ["44455566677", "2026-10-07", "08:00", "10:00"],
  ["44455566677", "2026-10-07", "14:00", "16:00"],
  ["55566677788", "2026-10-08", "08:00", "10:00"],
  ["55566677788", "2026-10-08", "14:00", "16:00"],
  ["66677788899", "2026-10-09", "08:00", "10:00"],
  ["77788899900", "2026-10-10", "08:00", "10:00"],
  ["88899900011", "2026-10-11", "08:00", "10:00"],
  ["99900011122", "2026-10-12", "08:00", "10:00"]
];

const agendamentos = [
  ["22233344401", "22233344455", "2026-10-05", "08:00", "Consulta de teste - massa de dados"],
  ["22233344402", "33344455566", "2026-10-06", "08:00", "Consulta de teste - massa de dados"],
  ["22233344403", "44455566677", "2026-10-07", "08:00", "Consulta de teste - massa de dados"],
  ["22233344404", "55566677788", "2026-10-08", "08:00", "Consulta de teste - massa de dados"]
];

async function executarSeed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está configurada no arquivo .env");
  }

  const [hashAdmin, hashProfissional, hashPaciente] = await Promise.all([
    bcrypt.hash(SENHA_ADMIN, 10),
    bcrypt.hash(SENHA_PROFISSIONAL, 10),
    bcrypt.hash(SENHA_PACIENTE, 10)
  ]);

    await sql`
      INSERT INTO administradores
        (nome, email, senha_hash, perfil, ativo)
      VALUES
        ('Administrador Sistema', 'admin@consultafacil.com', ${hashAdmin}, 'ADMIN', TRUE)
      ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome,
        senha_hash = EXCLUDED.senha_hash,
        perfil = 'ADMIN',
        ativo = TRUE
    `;

    const idsEspecialidades = new Map();
    for (const [nome, descricao] of especialidades) {
      const [registro] = await sql`
        INSERT INTO especialidades (nome, descricao)
        VALUES (${nome}, ${descricao})
        ON CONFLICT (nome) DO UPDATE SET descricao = EXCLUDED.descricao
        RETURNING id_especialidade
      `;
      idsEspecialidades.set(nome, registro.id_especialidade);
    }

    const idsClinicas = new Map();
    for (const [nome, cnpj, telefone, email, endereco, horario] of clinicas) {
      const existente = await sql`
        SELECT id_clinica
        FROM clinicas
        WHERE cnpj = ${cnpj} OR LOWER(email) = LOWER(${email})
        LIMIT 1
      `;

      let idClinica;
      if (existente[0]) {
        idClinica = existente[0].id_clinica;
        await sql`
          UPDATE clinicas SET
            nome = ${nome}, telefone = ${telefone}, email = ${email},
            endereco = ${endereco}, horario_funcionamento = ${horario}, ativo = TRUE
          WHERE id_clinica = ${idClinica}
        `;
      } else {
        const [registro] = await sql`
          INSERT INTO clinicas
            (nome, cnpj, telefone, email, endereco, horario_funcionamento, ativo)
          VALUES
            (${nome}, ${cnpj}, ${telefone}, ${email}, ${endereco}, ${horario}, TRUE)
          RETURNING id_clinica
        `;
        idClinica = registro.id_clinica;
      }
      idsClinicas.set(nome, idClinica);
    }

    const idsProfissionais = new Map();
    for (const [nome, cpf, registro, conselho, telefone, email, clinica, especialidade] of profissionais) {
      const existente = await sql`
        SELECT id_profissional
        FROM profissionais
        WHERE cpf = ${cpf} OR LOWER(email) = LOWER(${email})
        LIMIT 1
      `;

      let idProfissional;
      if (existente[0]) {
        idProfissional = existente[0].id_profissional;
        await sql`
          UPDATE profissionais SET
            id_clinica = ${idsClinicas.get(clinica)},
            id_especialidade = ${idsEspecialidades.get(especialidade)},
            nome = ${nome}, cpf = ${cpf}, registro_profissional = ${registro},
            conselho = ${conselho}, telefone = ${telefone}, email = ${email},
            senha_hash = ${hashProfissional}, perfil = 'PROFISSIONAL', ativo = TRUE
          WHERE id_profissional = ${idProfissional}
        `;
      } else {
        const [novo] = await sql`
          INSERT INTO profissionais
            (id_clinica, id_especialidade, nome, cpf, registro_profissional,
             conselho, telefone, email, senha_hash, perfil, ativo)
          VALUES
            (${idsClinicas.get(clinica)}, ${idsEspecialidades.get(especialidade)},
             ${nome}, ${cpf}, ${registro}, ${conselho}, ${telefone}, ${email},
             ${hashProfissional}, 'PROFISSIONAL', TRUE)
          RETURNING id_profissional
        `;
        idProfissional = novo.id_profissional;
      }
      idsProfissionais.set(cpf, idProfissional);
    }

    const idsPacientes = new Map();
    for (const [nome, cpf, nascimento, telefone, email, endereco] of pacientes) {
      const existente = await sql`
        SELECT id_paciente
        FROM pacientes
        WHERE cpf = ${cpf} OR LOWER(email) = LOWER(${email})
        LIMIT 1
      `;

      let idPaciente;
      if (existente[0]) {
        idPaciente = existente[0].id_paciente;
        await sql`
          UPDATE pacientes SET
            nome = ${nome}, cpf = ${cpf}, data_nascimento = ${nascimento},
            telefone = ${telefone}, email = ${email}, senha_hash = ${hashPaciente},
            endereco = ${endereco}, perfil = 'PACIENTE', ativo = TRUE
          WHERE id_paciente = ${idPaciente}
        `;
      } else {
        const [novo] = await sql`
          INSERT INTO pacientes
            (nome, cpf, data_nascimento, telefone, email, senha_hash,
             endereco, perfil, ativo)
          VALUES
            (${nome}, ${cpf}, ${nascimento}, ${telefone}, ${email}, ${hashPaciente},
             ${endereco}, 'PACIENTE', TRUE)
          RETURNING id_paciente
        `;
        idPaciente = novo.id_paciente;
      }
      idsPacientes.set(cpf, idPaciente);
    }

    const idsDisponibilidades = new Map();
    for (const [cpfProfissional, data, inicio, fim] of disponibilidades) {
      const idProfissional = idsProfissionais.get(cpfProfissional);
      const existente = await sql`
        SELECT id_disponibilidade
        FROM disponibilidades
        WHERE id_profissional = ${idProfissional}
          AND data = ${data}
          AND hora_inicio = ${inicio}
          AND hora_fim = ${fim}
        LIMIT 1
      `;

      let idDisponibilidade;
      if (existente[0]) {
        idDisponibilidade = existente[0].id_disponibilidade;
      } else {
        const [novo] = await sql`
          INSERT INTO disponibilidades
            (id_profissional, data, hora_inicio, hora_fim, status)
          VALUES
            (${idProfissional}, ${data}, ${inicio}, ${fim}, 'DISPONIVEL')
          RETURNING id_disponibilidade
        `;
        idDisponibilidade = novo.id_disponibilidade;
      }
      idsDisponibilidades.set(`${cpfProfissional}|${data}|${inicio}`, idDisponibilidade);
    }

    for (const [cpfPaciente, cpfProfissional, data, hora, observacao] of agendamentos) {
      const idPaciente = idsPacientes.get(cpfPaciente);
      const idProfissional = idsProfissionais.get(cpfProfissional);
      const idDisponibilidade = idsDisponibilidades.get(`${cpfProfissional}|${data}|${hora}`);

      const existente = await sql`
        SELECT id_agendamento
        FROM agendamentos
        WHERE id_paciente = ${idPaciente}
          AND id_profissional = ${idProfissional}
          AND id_disponibilidade = ${idDisponibilidade}
        LIMIT 1
      `;

      if (!existente[0]) {
        await sql`
          INSERT INTO agendamentos
            (id_paciente, id_profissional, id_disponibilidade,
             data_consulta, hora_consulta, status, observacao)
          VALUES
            (${idPaciente}, ${idProfissional}, ${idDisponibilidade},
             ${data}, ${hora}, 'AGENDADO', ${observacao})
        `;
      }

      await sql`
        UPDATE disponibilidades
        SET status = 'RESERVADO'
        WHERE id_disponibilidade = ${idDisponibilidade}
      `;
    }

  const [totais] = await sql`
    SELECT
      (SELECT COUNT(*) FROM especialidades)::int AS especialidades,
      (SELECT COUNT(*) FROM clinicas)::int AS clinicas,
      (SELECT COUNT(*) FROM profissionais)::int AS profissionais,
      (SELECT COUNT(*) FROM pacientes)::int AS pacientes,
      (SELECT COUNT(*) FROM administradores)::int AS administradores,
      (SELECT COUNT(*) FROM disponibilidades)::int AS disponibilidades,
      (SELECT COUNT(*) FROM agendamentos)::int AS agendamentos
  `;

  console.log("\nSeed concluído com sucesso:");
  console.table(totais);
  console.log("\nCredenciais de teste:");
  console.log("ADMIN: admin@consultafacil.com / Admin@123");
  console.log("PROFISSIONAL: mariana.costa@consulta.com.br / Profissional@123");
  console.log("PACIENTE: lucas.ferreira@consulta.com.br / 123456");
}

executarSeed()
  .catch((erro) => {
    console.error("\nErro ao executar seed:");
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (typeof sql.end === "function") {
      await sql.end({ timeout: 5 });
    }
  });
