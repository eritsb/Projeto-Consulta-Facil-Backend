const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Pacientes =
  require("../models/Pacientes");

const Profissionais =
  require("../models/Profissionais");

const Administradores =
  require("../models/Administradores");

class AuthService {
  static criarErro(
    mensagem,
    statusCode
  ) {
    const erro = new Error(mensagem);

    erro.statusCode = statusCode;

    return erro;
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

  static verificarConfiguracao() {
    if (!process.env.JWT_SECRET) {
      throw this.criarErro(
        "JWT_SECRET não configurada no servidor",
        500
      );
    }
  }

  static normalizarUsuario(
    usuario,
    perfil
  ) {
    if (perfil === "PACIENTE") {
      return {
        id: usuario.id_paciente,
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: usuario.senha_hash,
        perfil: "PACIENTE",
        ativo: usuario.ativo
      };
    }

    if (perfil === "PROFISSIONAL") {
      return {
        id: usuario.id_profissional,
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: usuario.senha_hash,
        perfil: "PROFISSIONAL",
        ativo: usuario.ativo
      };
    }

    if (perfil === "ADMIN") {
      return {
        id: usuario.id_administrador,
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: usuario.senha_hash,
        perfil: "ADMIN",
        ativo: usuario.ativo
      };
    }

    return null;
  }

  static async buscarUsuarioPorEmail(
    email
  ) {
    const resultados =
      await Promise.all([
        Pacientes
          .buscarPorEmailParaLogin(email),

        Profissionais
          .buscarPorEmailParaLogin(email),

        Administradores
          .buscarPorEmail(email)
      ]);

    const usuariosEncontrados = [];

    if (resultados[0]) {
      usuariosEncontrados.push(
        this.normalizarUsuario(
          resultados[0],
          "PACIENTE"
        )
      );
    }

    if (resultados[1]) {
      usuariosEncontrados.push(
        this.normalizarUsuario(
          resultados[1],
          "PROFISSIONAL"
        )
      );
    }

    if (resultados[2]) {
      usuariosEncontrados.push(
        this.normalizarUsuario(
          resultados[2],
          "ADMIN"
        )
      );
    }

    if (
      usuariosEncontrados.length > 1
    ) {
      throw this.criarErro(
        "E-mail vinculado a mais de um perfil. Entre em contato com o administrador",
        409
      );
    }

    return usuariosEncontrados[0];
  }

  static gerarToken(usuario) {
    this.verificarConfiguracao();

    return jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN ||
          "8h",

        algorithm: "HS256"
      }
    );
  }

  static async login(dados) {
    const {
      email,
      senha
    } = dados;

    if (!email || !senha) {
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

    const usuario =
      await this.buscarUsuarioPorEmail(
        emailNormalizado
      );

    if (!usuario) {
      throw this.criarErro(
        "E-mail ou senha inválidos",
        401
      );
    }

    if (!usuario.ativo) {
      throw this.criarErro(
        "Conta inativa",
        403
      );
    }

    if (!usuario.senha_hash) {
      throw this.criarErro(
        "Usuário sem senha cadastrada",
        403
      );
    }

    const senhaCorreta =
      await bcrypt.compare(
        String(senha),
        usuario.senha_hash
      );

    if (!senhaCorreta) {
      throw this.criarErro(
        "E-mail ou senha inválidos",
        401
      );
    }

    const token =
      this.gerarToken(usuario);

    return {
      token,

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    };
  }

  static async obterPerfil(
    id,
    perfil
  ) {
    let usuario;

    if (perfil === "PACIENTE") {
      usuario =
        await Pacientes.buscarPorId(id);
    } else if (
      perfil === "PROFISSIONAL"
    ) {
      usuario =
        await Profissionais.buscarPorId(
          id
        );
    } else if (perfil === "ADMIN") {
      usuario =
        await Administradores.buscarPorId(
          id
        );
    } else {
      throw this.criarErro(
        "Perfil de usuário inválido",
        403
      );
    }

    if (!usuario) {
      throw this.criarErro(
        "Usuário não encontrado",
        404
      );
    }

    return {
      ...usuario,
      perfil
    };
  }
}

module.exports = AuthService;
