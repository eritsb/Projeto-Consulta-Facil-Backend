const Profissionais =
  require("../models/Profissionais");

class ProfissionaisService {

  static async listarTodos() {

    return await Profissionais.listarTodos();

  }

  static async buscarPorNome(nome) {

    return await Profissionais.buscarPorNome(nome);

  }

    static async buscarPorClinica(idClinica) {

    return await Profissionais.buscarPorClinica(
      idClinica
    );

  }

  static async buscarPorEspecialidade(
    idEspecialidade
  ) {

    return await Profissionais.buscarPorEspecialidade(
      idEspecialidade
    );

  }

  static async buscarPorId(id) {

    const profissional =
      await Profissionais.buscarPorId(id);

    if (!profissional) {

      throw new Error(
        "Profissional não encontrado"
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
      id_especialidade
    } = dados;

    if (
      !nome ||
      !cpf ||
      !conselho ||
      !registro_profissional ||
      !id_clinica ||
      !id_especialidade
    ) {

      throw new Error(
        "Campos obrigatórios não informados"
      );

    }

    const cpfLimpo =
      String(cpf).replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {

      throw new Error(
        "CPF inválido"
      );

    }

    const cpfExistente =
      await Profissionais.buscarPorCpf(
        cpfLimpo
      );

    if (cpfExistente) {

      throw new Error(
        "CPF já cadastrado"
      );

    }

    const registroExistente =
      await Profissionais.buscarRegistro(
        conselho,
        registro_profissional
      );

    if (registroExistente) {

      throw new Error(
        "Registro profissional já cadastrado"
      );

    }

    return await Profissionais.cadastrar({
      ...dados,
      cpf: cpfLimpo,
      ativo: true
    });

  }

  static async atualizar(id, dados) {

    const profissional =
      await Profissionais.buscarPorId(id);

    if (!profissional) {

      throw new Error(
        "Profissional não encontrado"
      );

    }

    return await Profissionais.atualizar(
      id,
      {
        ...profissional,
        ...dados
      }
    );

  }

  static async excluir(id) {

    const profissional =
      await Profissionais.excluir(id);

    if (!profissional) {

      throw new Error(
        "Profissional não encontrado"
      );

    }

    return profissional;

  }

}

module.exports =
  ProfissionaisService;
