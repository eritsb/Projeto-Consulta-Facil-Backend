const bcrypt = require("bcryptjs");
const Pacientes = require("../models/Pacientes");

class PacientesService {
  static criarErro(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;

    return erro;
  }

  static validarId(id) {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      throw this.criarErro(
        "ID do paciente inválido",
        400
      );
    }

    return idNumerico;
  }

  static limparCpf(cpf) {
    return String(cpf).replace(/\D/g, "");
  }

  static normalizarEmail(email) {
    return String(email).trim().toLowerCase();
  }

  static validarCpf(cpf) {
    if (cpf.length !== 11) {
      throw this.criarErro(
        "O CPF deve conter 11 números",
        400
      );
    }
  }

  static validarEmail(email) {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
      throw this.criarErro(
        "E-mail inválido",
        400
      );
    }
  }

  static validarSenha(senha) {
    if (String(senha).length < 6) {
      throw this.criarErro(
        "A senha deve possuir pelo menos 6 caracteres",
        400
      );
    }
  }

  static async listarTodos() {
    return await Pacientes.listarTodos();
  }

  static async buscarPorNome(nome) {
    return await Pacientes.buscarPorNome(nome);
  }

  static async buscarPorId(id) {
    const idPaciente = this.validarId(id);

    const paciente =
      await Pacientes.buscarPorId(idPaciente);

    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado",
        404
      );
    }

    return paciente;
  }

  static async cadastrar(dados) {
    const {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
      endereco
    } = dados;

    if (
      !nome ||
      !cpf ||
      !data_nascimento ||
      !email ||
      !senha
    ) {
      throw this.criarErro(
        "Nome, CPF, data de nascimento, e-mail e senha são obrigatórios",
        400
      );
    }

    const cpfLimpo = this.limparCpf(cpf);
    const emailNormalizado =
      this.normalizarEmail(email);

    this.validarCpf(cpfLimpo);
    this.validarEmail(emailNormalizado);
    this.validarSenha(senha);

    const pacienteExistente =
      await Pacientes.buscarPorCpfOuEmail(
        cpfLimpo,
        emailNormalizado
      );

    if (pacienteExistente) {
      throw this.criarErro(
        "CPF ou e-mail já cadastrado",
        409
      );
    }

    const senhaHash = await bcrypt.hash(
      String(senha),
      10
    );

    return await Pacientes.cadastrar({
      nome: String(nome).trim(),
      cpf: cpfLimpo,
      data_nascimento,
      telefone: telefone || null,
      email: emailNormalizado,
      senha_hash: senhaHash,
      endereco: endereco || null
    });
  }

  static async atualizar(id, dados) {
    const idPaciente = this.validarId(id);

    const pacienteAtual =
      await Pacientes.buscarCompletoPorId(
        idPaciente
      );

    if (!pacienteAtual) {
      throw this.criarErro(
        "Paciente não encontrado",
        404
      );
    }

    const {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
      endereco,
      ativo
    } = dados;

    const novoCpf = cpf
      ? this.limparCpf(cpf)
      : pacienteAtual.cpf;

    const novoEmail = email
      ? this.normalizarEmail(email)
      : pacienteAtual.email;

    this.validarCpf(novoCpf);
    this.validarEmail(novoEmail);

    const pacienteDuplicado =
      await Pacientes.buscarDuplicado(
        novoCpf,
        novoEmail,
        idPaciente
      );

    if (pacienteDuplicado) {
      throw this.criarErro(
        "CPF ou e-mail utilizado por outro paciente",
        409
      );
    }

    let senhaHash = pacienteAtual.senha_hash;

    if (senha !== undefined && senha !== "") {
      this.validarSenha(senha);

      senhaHash = await bcrypt.hash(
        String(senha),
        10
      );
    }

    return await Pacientes.atualizar(
      idPaciente,
      {
        nome:
          nome !== undefined
            ? String(nome).trim()
            : pacienteAtual.nome,

        cpf: novoCpf,

        data_nascimento:
          data_nascimento !== undefined
            ? data_nascimento
            : pacienteAtual.data_nascimento,

        telefone:
          telefone !== undefined
            ? telefone
            : pacienteAtual.telefone,

        email: novoEmail,

        senha_hash: senhaHash,

        endereco:
          endereco !== undefined
            ? endereco
            : pacienteAtual.endereco,

        ativo:
          ativo !== undefined
            ? ativo
            : pacienteAtual.ativo
      }
    );
  }

  static async excluir(id) {
    const idPaciente = this.validarId(id);

    const paciente =
      await Pacientes.excluir(idPaciente);

    if (!paciente) {
      throw this.criarErro(
        "Paciente não encontrado",
        404
      );
    }

    return paciente;
  }
}

module.exports = PacientesService;