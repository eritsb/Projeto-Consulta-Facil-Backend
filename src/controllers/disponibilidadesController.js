const DisponibilidadesService =
  require(
    "../services/disponibilidadesService"
  );

class DisponibilidadesController {

  static async listar(req, res) {
    try {
      const dados =
        await DisponibilidadesService
          .listarTodos();

      return res
        .status(200)
        .json(dados);

    } catch (error) {
      return res
        .status(500)
        .json({
          erro: error.message
        });
    }
  }

  static async listarPorProfissional(
    req,
    res
  ) {
    try {
      const dados =
        await DisponibilidadesService
          .listarPorProfissional(
            req.params.id
          );

      return res
        .status(200)
        .json(dados);

    } catch (error) {
      return res
        .status(500)
        .json({
          erro: error.message
        });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const dados =
        await DisponibilidadesService
          .buscarPorId(
            req.params.id
          );

      return res
        .status(200)
        .json(dados);

    } catch (error) {
      return res
        .status(404)
        .json({
          erro: error.message
        });
    }
  }

  static async cadastrar(req, res) {
    try {
      const dados =
        await DisponibilidadesService
          .cadastrar(req.body);

      return res
        .status(201)
        .json(dados);

    } catch (error) {
      return res
        .status(400)
        .json({
          erro: error.message
        });
    }
  }

  static async atualizar(req, res) {
    try {
      const dados =
        await DisponibilidadesService
          .atualizar(
            req.params.id,
            req.body
          );

      return res
        .status(200)
        .json(dados);

    } catch (error) {
      return res
        .status(400)
        .json({
          erro: error.message
        });
    }
  }

  static async excluir(req, res) {
    try {
      const dados =
        await DisponibilidadesService
          .excluir(
            req.params.id
          );

      return res
        .status(200)
        .json(dados);

    } catch (error) {
      return res
        .status(404)
        .json({
          erro: error.message
        });
    }
  }
}

module.exports =
  DisponibilidadesController;