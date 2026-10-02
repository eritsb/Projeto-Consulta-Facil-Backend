const EspecialidadesService =
  require("../services/especialidadesService");

class EspecialidadesController {
  static tratarErro(
    error,
    res,
    mensagemPadrao
  ) {
    console.error(mensagemPadrao, error);

    if (error.code === "23505") {
      return res.status(409).json({
        erro: "Especialidade já cadastrada"
      });
    }

    if (error.code === "23503") {
      return res.status(409).json({
        erro:
          "A especialidade está vinculada a uma clínica, profissional ou recomendação e não pode ser excluída"
      });
    }

    return res
      .status(error.statusCode || 500)
      .json({
        erro:
          error.statusCode
            ? error.message
            : mensagemPadrao
      });
  }

static async listar(req, res) {
  try {

    const { nome } = req.query;

    const especialidades = nome
      ? await EspecialidadesService.buscarPorNome(nome)
      : await EspecialidadesService.listarTodos();

    return res
      .status(200)
      .json(especialidades);

  } catch (error) {

    return EspecialidadesController.tratarErro(
      error,
      res,
      "Erro interno ao listar especialidades"
    );

  }
}

  static async buscarPorId(req, res) {
    try {
      const especialidade =
        await EspecialidadesService
          .buscarPorId(req.params.id);

      return res
        .status(200)
        .json(especialidade);
    } catch (error) {
      return EspecialidadesController
        .tratarErro(
          error,
          res,
          "Erro interno ao buscar especialidade"
        );
    }
  }

  static async cadastrar(req, res) {
    try {
      const especialidade =
        await EspecialidadesService
          .cadastrar(req.body);

      return res.status(201).json({
        mensagem:
          "Especialidade cadastrada com sucesso",
        especialidade
      });
    } catch (error) {
      return EspecialidadesController
        .tratarErro(
          error,
          res,
          "Erro interno ao cadastrar especialidade"
        );
    }
  }

  static async atualizar(req, res) {
    try {
      const especialidade =
        await EspecialidadesService
          .atualizar(
            req.params.id,
            req.body
          );

      return res.status(200).json({
        mensagem:
          "Especialidade atualizada com sucesso",
        especialidade
      });
    } catch (error) {
      return EspecialidadesController
        .tratarErro(
          error,
          res,
          "Erro interno ao atualizar especialidade"
        );
    }
  }

  static async excluir(req, res) {
    try {
      const especialidade =
        await EspecialidadesService
          .excluir(req.params.id);

      return res.status(200).json({
        mensagem:
          "Especialidade excluída com sucesso",
        especialidade
      });
    } catch (error) {
      return EspecialidadesController
        .tratarErro(
          error,
          res,
          "Erro interno ao excluir especialidade"
        );
    }
  }
}

module.exports =
  EspecialidadesController;