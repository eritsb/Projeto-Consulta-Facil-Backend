const bcrypt = require("bcryptjs");

const Profissionais =
  require("../models/Profissionais");

class ProfissionaisService {
  static criarErro(
    mensagem,
    statusCode
  ) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;

    return erro;
  }

  static validarId(id) {
    const idNumerico = Number(id);

    if (
      !Number.isInteger(idNumerico) ||
      idNumerico <= 0
    ) {
      throw this.criarErro(
        "ID do profissional inválido",
        400
      );
    }

    return idNumerico;
  }

  static limparCpf(cpf) {
    return String(cpf)
      .replace(/\D/g, "");
  }

  static normalizarEmail(email) {
    return String(email)
      .trim()
      .toLowerCase();
  }

  static validarEmail(email) {
    const formatoEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
      throw this.criarErro(
        "E-mail inválido",
        400
      );
    }
  }

  static validarSenha(senha) {
    if (String(senha).length < 8) {
      throw this.criarErro(
        "A senha deve possuir pelo menos 8 caracteres",
        400
      );
    }
  }

  static async listarTodos() {
    return await Profissionais
      .listarTodos();
  }

  static async buscarPorNome(nome) {
    return await Profissionais
      .buscarPorNome(
        String(nome).trim()
      );
  }

  static async buscarPorClinica(
    idClinica
  ) {
    return await Profissionais
      .buscarPorClinica(idClinica);
  }

  static async buscarPorEspecialidade(
    idEspecialidade
  ) {
    return await Profissionais
      .buscarPorEspecialidade(
        idEspecialidade
      );
  }

  static async buscarPorId(id) {
    const idProfissional =
      this.validarId(id);

    const profissional =
      await Profissionais.buscarPorId(
        idProfissional
      );

    if (!profissional) {
      throw this.criarErro(
        "Profissional não encontrado",
        404
      );
    }

    return profissional;
  }

  static async cadastrar(dados) {
    const {
      nome,
      cpf,
      conselho,
      registro_profissional,
      id_clinica,
      id_especialidade,
      telefone,
      email,
      senha,
      ativo
    } = dados;

    if (
      !nome ||
      !cpf ||
      !conselho ||
      !registro_profissional ||
      !id_clinica ||
      !id_especialidade ||
      !email ||
      !senha
    ) {
      throw this.criarErro(
        "Nome, CPF, conselho, registro profissional, clínica, especialidade, e-mail e senha são obrigatórios",
        400
      );
    }

    const cpfLimpo =
      this.limparCpf(cpf);

    if (cpfLimpo.length !== 11) {
      throw this.criarErro(
        "O CPF deve conter 11 números",
        400
      );
    }

    const emailNormalizado =
      this.normalizarEmail(email);

    this.validarEmail(emailNormalizado);
    this.validarSenha(senha);

    const cpfExistente =
      await Profissionais.buscarPorCpf(
        cpfLimpo
      );

    if (cpfExistente) {
      throw this.criarErro(
        "CPF já cadastrado",
        409
      );
    }

    const emailExistente =
      await Profissionais.buscarPorEmail(
        emailNormalizado
      );

    if (emailExistente) {
      throw this.criarErro(
        "E-mail já cadastrado",
        409
      );
    }

    const registroExistente =
      await Profissionais
        .buscarRegistro(
          conselho,
          registro_profissional
        );

    if (registroExistente) {
      throw this.criarErro(
        "Registro profissional já cadastrado",
        409
      );
    }

    const senhaHash =
      await bcrypt.hash(
        String(senha),
        10
      );

    return await Profissionais.cadastrar({
      id_clinica: Number(id_clinica),

      id_especialidade:
        Number(id_especialidade),

      nome: String(nome).trim(),
      cpf: cpfLimpo,

      registro_profissional:
        String(
          registro_profissional
        ).trim(),

      conselho:
        String(conselho)
          .trim()
          .toUpperCase(),

      telefone:
        telefone !== undefined &&
        telefone !== ""
          ? String(telefone).trim()
          : null,

      email: emailNormalizado,
      senha_hash: senhaHash,
      perfil: "PROFISSIONAL",

      ativo:
        ativo !== undefined
          ? Boolean(ativo)
          : true
    });
  }

  static async atualizar(id, dados) {
    const idProfissional =
      this.validarId(id);

    const profissionalAtual =
      await Profissionais
        .buscarCompletoPorId(
          idProfissional
        );

    if (!profissionalAtual) {
      throw this.criarErro(
        "Profissional não encontrado",
        404
      );
    }

    const {
      id_clinica,
      id_especialidade,
      nome,
      cpf,
      registro_profissional,
      conselho,
      telefone,
      email,
      senha,
      ativo
    } = dados;

    const novoCpf =
      cpf !== undefined
        ? this.limparCpf(cpf)
        : profissionalAtual.cpf;

    if (novoCpf.length !== 11) {
      throw this.criarErro(
        "O CPF deve conter 11 números",
        400
      );
    }

    const novoEmail =
      email !== undefined
        ? this.normalizarEmail(email)
        : profissionalAtual.email;

    this.validarEmail(novoEmail);

    const novoConselho =
      conselho !== undefined
        ? String(conselho)
            .trim()
            .toUpperCase()
        : profissionalAtual.conselho;

    const novoRegistro =
      registro_profissional !== undefined
        ? String(
            registro_profissional
          ).trim()
        : profissionalAtual
            .registro_profissional;

    const duplicado =
      await Profissionais
        .buscarDuplicado(
          novoCpf,
          novoEmail,
          idProfissional
        );

    if (duplicado) {
      throw this.criarErro(
        "CPF ou e-mail utilizado por outro profissional",
        409
      );
    }

    const registroDuplicado =
      await Profissionais
        .buscarRegistroDuplicado(
          novoConselho,
          novoRegistro,
          idProfissional
        );

    if (registroDuplicado) {
      throw this.criarErro(
        "Registro profissional utilizado por outro profissional",
        409
      );
    }

    let senhaHash =
      profissionalAtual.senha_hash;

    if (
      senha !== undefined &&
      senha !== ""
    ) {
      this.validarSenha(senha);

      senhaHash =
        await bcrypt.hash(
          String(senha),
          10
        );
    }

    return await Profissionais.atualizar(
      idProfissional,
      {
        id_clinica:
          id_clinica !== undefined
            ? Number(id_clinica)
            : profissionalAtual
                .id_clinica,

        id_especialidade:
          id_especialidade !== undefined
            ? Number(id_especialidade)
            : profissionalAtual
                .id_especialidade,

        nome:
          nome !== undefined
            ? String(nome).trim()
            : profissionalAtual.nome,

        cpf: novoCpf,

        registro_profissional:
          novoRegistro,

        conselho: novoConselho,

        telefone:
          telefone !== undefined
            ? telefone === null ||
              String(telefone).trim() === ""
              ? null
              : String(telefone).trim()
            : profissionalAtual.telefone,

        email: novoEmail,
        senha_hash: senhaHash,
        perfil: "PROFISSIONAL",

        ativo:
          ativo !== undefined
            ? Boolean(ativo)
            : profissionalAtual.ativo
      }
    );
  }

  static async excluir(id) {
    const idProfissional =
      this.validarId(id);

    const profissional =
      await Profissionais.excluir(
        idProfissional
      );

    if (!profissional) {
      throw this.criarErro(
        "Profissional não encontrado",
        404
      );
    }

    return profissional;
  }
}

module.exports = ProfissionaisService;