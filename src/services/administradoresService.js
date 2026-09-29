const bcrypt =
  require("bcryptjs");

const Administradores =
  require("../models/Administradores");

class AdministradoresService {

  static async listarTodos() {

    return await Administradores
      .listarTodos();

  }

  static async buscarPorId(id) {

    const administrador =
      await Administradores
        .buscarPorId(id);

    if (!administrador) {

      throw new Error(
        "Administrador não encontrado"
      );

    }

    return administrador;

  }

  static async cadastrar(dados) {

    const {
      nome,
      email,
      senha
    } = dados;

    if (
      !nome ||
      !email ||
      !senha
    ) {

      throw new Error(
        "Nome, e-mail e senha são obrigatórios"
      );

    }

    const existente =
      await Administradores
        .buscarPorEmail(email);

    if (existente) {

      throw new Error(
        "E-mail já cadastrado"
      );

    }

    const senhaHash =
      await bcrypt.hash(
        senha,
        10
      );

    return await Administradores
      .cadastrar({
        nome,
        email:
          email.toLowerCase(),
        senha_hash:
          senhaHash,
        ativo: true
      });

  }

  static async atualizar(id,dados){

    const administrador =
      await Administradores
        .buscarPorId(id);

    if (!administrador){

      throw new Error(
        "Administrador não encontrado"
      );

    }

    return await Administradores
      .atualizar(
        id,
        {
          ...administrador,
          ...dados
        }
      );

  }

  static async excluir(id){

    const administrador =
      await Administradores
        .excluir(id);

    if (!administrador){

      throw new Error(
        "Administrador não encontrado"
      );

    }

    return administrador;

  }

}

module.exports =
  AdministradoresService;