const Especialidades =
  require("../models/Especialidades");

class EspecialidadesService {
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
        "ID da especialidade inválido",
        400
      );
    }

    return idNumerico;
  }

  static normalizarNome(nome) {
    return String(nome).trim();
  }

  static async listarTodos() {
    return await Especialidades.listarTodos();
  }

  static async buscarPorNome(nome) {
  return await Especialidades.pesquisarPorNome(
    String(nome).trim()
  );
}

  static async buscarPorId(id) {
    const idEspecialidade =
      this.validarId(id);

    const especialidade =
      await Especialidades.buscarPorId(
        idEspecialidade
      );

    if (!especialidade) {
      throw this.criarErro(
        "Especialidade não encontrada",
        404
      );
    }

    return especialidade;
  }

  static async cadastrar(dados) {
    const {
      nome,
      descricao,
      ativo
    } = dados;

    if (!nome || !String(nome).trim()) {
      throw this.criarErro(
        "Nome da especialidade é obrigatório",
        400
      );
    }

    const nomeNormalizado =
      this.normalizarNome(nome);

    if (nomeNormalizado.length > 100) {
      throw this.criarErro(
        "O nome da especialidade deve possuir no máximo 100 caracteres",
        400
      );
    }

    const especialidadeExistente =
      await Especialidades.buscarPorNome(
        nomeNormalizado
      );

    if (especialidadeExistente) {
      throw this.criarErro(
        "Especialidade já cadastrada",
        409
      );
    }

    return await Especialidades.cadastrar({
      nome: nomeNormalizado,

      descricao:
        descricao !== undefined &&
        descricao !== ""
          ? String(descricao).trim()
          : null,

      ativo:
        ativo !== undefined
          ? Boolean(ativo)
          : true
    });
  }

  static async atualizar(id, dados) {
    const idEspecialidade =
      this.validarId(id);

    const especialidadeAtual =
      await Especialidades.buscarPorId(
        idEspecialidade
      );

    if (!especialidadeAtual) {
      throw this.criarErro(
        "Especialidade não encontrada",
        404
      );
    }

    const {
      nome,
      descricao,
      ativo
    } = dados;

    const novoNome =
      nome !== undefined
        ? this.normalizarNome(nome)
        : especialidadeAtual.nome;

    if (!novoNome) {
      throw this.criarErro(
        "Nome da especialidade é obrigatório",
        400
      );
    }

    if (novoNome.length > 100) {
      throw this.criarErro(
        "O nome da especialidade deve possuir no máximo 100 caracteres",
        400
      );
    }

    const nomeDuplicado =
      await Especialidades.buscarNomeDuplicado(
        novoNome,
        idEspecialidade
      );

    if (nomeDuplicado) {
      throw this.criarErro(
        "Já existe outra especialidade com esse nome",
        409
      );
    }

    return await Especialidades.atualizar(
      idEspecialidade,
      {
        nome: novoNome,

        descricao:
          descricao !== undefined
            ? descricao === ""
              ? null
              : String(descricao).trim()
            : especialidadeAtual.descricao,

        ativo:
          ativo !== undefined
            ? Boolean(ativo)
            : especialidadeAtual.ativo
      }
    );
  }

  static async excluir(id) {
    const idEspecialidade =
      this.validarId(id);

    const especialidadeAtual =
      await Especialidades.buscarPorId(
        idEspecialidade
      );

    if (!especialidadeAtual) {
      throw this.criarErro(
        "Especialidade não encontrada",
        404
      );
    }

    return await Especialidades.excluir(
      idEspecialidade
    );
  }
}

module.exports = EspecialidadesService;