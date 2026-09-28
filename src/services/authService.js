const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Pacientes =
  require("../models/Pacientes");

class AuthService {

  static criarErro(
    mensagem,
    statusCode
  ) {

    const erro =
      new Error(mensagem);

    erro.statusCode =
      statusCode;

    return erro;

  }

  static validarEmail(
    email
  ) {

    const regex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !regex.test(email)
    ) {

      throw this.criarErro(
        "E-mail inválido",
        400
      );

    }

  }

  static gerarToken(
    paciente
  ) {

    return jwt.sign(
      {
        id:
          paciente.id_paciente,

        perfil:
          "PACIENTE"
      },

      process.env.JWT_SECRET,

      {
        expiresIn:
          process.env.JWT_EXPIRES_IN ||
          "8h"
      }
    );

  }

  static async login(
    dados
  ) {

    const {
      email,
      senha
    } = dados;

    if (
      !email ||
      !senha
    ) {

      throw this.criarErro(
        "E-mail e senha são obrigatórios",
        400
      );

    }

    const emailNormalizado =
      String(email)
        .trim()
        .toLowerCase();

    this.validarEmail(
      emailNormalizado
    );

    const paciente =
      await Pacientes
        .buscarPorEmailParaLogin(
          emailNormalizado
        );

    if (!paciente) {

      throw this.criarErro(
        "E-mail ou senha inválidos",
        401
      );

    }

    if (
      !paciente.ativo
    ) {

      throw this.criarErro(
        "Conta inativa",
        403
      );

    }

    const senhaCorreta =
      await bcrypt.compare(
        String(senha),
        paciente.senha_hash
      );

    if (!senhaCorreta) {

      throw this.criarErro(
        "E-mail ou senha inválidos",
        401
      );

    }

    const token =
      this.gerarToken(
        paciente
      );

    return {

      token,

      usuario: {

        id_paciente:
          paciente.id_paciente,

        nome:
          paciente.nome,

        email:
          paciente.email,

        perfil:
          "PACIENTE"

      }

    };

  }

  static async obterPerfil(
    idPaciente
  ) {

    const paciente =
      await Pacientes
        .buscarPorId(
          idPaciente
        );

    if (!paciente) {

      throw this.criarErro(
        "Paciente não encontrado",
        404
      );

    }

    return {

      ...paciente,

      perfil:
        "PACIENTE"

    };

  }

}

module.exports =
  AuthService;
``