const Clinicas =
  require("../models/Clinicas");

class ClinicasService {
  static criarErro(mensagem, statusCode) {
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
        "ID da clínica inválido",
        400
      );
    }

    return idNumerico;
  }

  static limparCnpj(cnpj) {
    return String(cnpj).replace(/\D/g, "");
  }

  static normalizarEmail(email) {
    return String(email)
      .trim()
      .toLowerCase();
  }

  static validarCnpj(cnpj) {
    if (cnpj.length !== 14) {
      throw this.criarErro(
        "O CNPJ deve conter 14 números",
        400
      );
    }
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

  static async listarTodas() {
    return await Clinicas.listarTodas();
  }

  static async buscarPorNome(nome) {
  return await Clinicas.buscarPorNome(
    String(nome).trim()
  );
}

  static async buscarPorId(id) {
    const idClinica = this.validarId(id);

    const clinica =
      await Clinicas.buscarPorId(idClinica);

    if (!clinica) {
      throw this.criarErro(
        "Clínica não encontrada",
        404
      );
    }

    return clinica;
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

    if (
      !nome ||
      !String(nome).trim() ||
      !cnpj ||
      !endereco ||
      !String(endereco).trim()
    ) {
      throw this.criarErro(
        "Nome, CNPJ e endereço são obrigatórios",
        400
      );
    }

    const nomeNormalizado =
      String(nome).trim();

    const cnpjLimpo =
      this.limparCnpj(cnpj);

    this.validarCnpj(cnpjLimpo);

    if (nomeNormalizado.length > 150) {
      throw this.criarErro(
        "O nome da clínica deve possuir no máximo 150 caracteres",
        400
      );
    }

    const clinicaExistente =
      await Clinicas.buscarPorCnpj(
        cnpjLimpo
      );

    if (clinicaExistente) {
      throw this.criarErro(
        "CNPJ já cadastrado",
        409
      );
    }

    let emailNormalizado = null;

    if (
      email !== undefined &&
      email !== null &&
      String(email).trim() !== ""
    ) {
      emailNormalizado =
        this.normalizarEmail(email);

      this.validarEmail(emailNormalizado);
    }

    return await Clinicas.cadastrar({
      nome: nomeNormalizado,

      cnpj: cnpjLimpo,

      telefone:
        telefone !== undefined &&
        telefone !== ""
          ? String(telefone).trim()
          : null,

      email: emailNormalizado,

      endereco:
        String(endereco).trim(),

      horario_funcionamento:
        horario_funcionamento !== undefined &&
        horario_funcionamento !== ""
          ? String(
              horario_funcionamento
            ).trim()
          : null,

      ativo:
        ativo !== undefined
          ? Boolean(ativo)
          : true
    });
  }

  static async atualizar(id, dados) {
    const idClinica = this.validarId(id);

    const clinicaAtual =
      await Clinicas.buscarPorId(idClinica);

    if (!clinicaAtual) {
      throw this.criarErro(
        "Clínica não encontrada",
        404
      );
    }

    const {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      horario_funcionamento,
      ativo
    } = dados;

    const novoNome =
      nome !== undefined
        ? String(nome).trim()
        : clinicaAtual.nome;

    if (!novoNome) {
      throw this.criarErro(
        "Nome da clínica é obrigatório",
        400
      );
    }

    if (novoNome.length > 150) {
      throw this.criarErro(
        "O nome da clínica deve possuir no máximo 150 caracteres",
        400
      );
    }

    const novoCnpj =
      cnpj !== undefined
        ? this.limparCnpj(cnpj)
        : clinicaAtual.cnpj;

    this.validarCnpj(novoCnpj);

    const cnpjDuplicado =
      await Clinicas.buscarCnpjDuplicado(
        novoCnpj,
        idClinica
      );

    if (cnpjDuplicado) {
      throw this.criarErro(
        "CNPJ utilizado por outra clínica",
        409
      );
    }

    const novoEndereco =
      endereco !== undefined
        ? String(endereco).trim()
        : clinicaAtual.endereco;

    if (!novoEndereco) {
      throw this.criarErro(
        "Endereço da clínica é obrigatório",
        400
      );
    }

    let novoEmail = clinicaAtual.email;

    if (email !== undefined) {
      if (
        email === null ||
        String(email).trim() === ""
      ) {
        novoEmail = null;
      } else {
        novoEmail =
          this.normalizarEmail(email);

        this.validarEmail(novoEmail);
      }
    }

    return await Clinicas.atualizar(
      idClinica,
      {
        nome: novoNome,

        cnpj: novoCnpj,

        telefone:
          telefone !== undefined
            ? telefone === null ||
              String(telefone).trim() === ""
              ? null
              : String(telefone).trim()
            : clinicaAtual.telefone,

        email: novoEmail,

        endereco: novoEndereco,

        horario_funcionamento:
          horario_funcionamento !== undefined
            ? horario_funcionamento === null ||
              String(
                horario_funcionamento
              ).trim() === ""
              ? null
              : String(
                  horario_funcionamento
                ).trim()
            : clinicaAtual
                .horario_funcionamento,

        ativo:
          ativo !== undefined
            ? Boolean(ativo)
            : clinicaAtual.ativo
      }
    );
  }

  static async excluir(id) {
    const idClinica = this.validarId(id);

    const clinicaAtual =
      await Clinicas.buscarPorId(idClinica);

    if (!clinicaAtual) {
      throw this.criarErro(
        "Clínica não encontrada",
        404
      );
    }

    return await Clinicas.excluir(
      idClinica
    );
  }
}

module.exports = ClinicasService;