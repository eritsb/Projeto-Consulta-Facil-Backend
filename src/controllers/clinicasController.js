const ClinicasService =
  require("../services/clinicasService");

class ClinicasController {
  static tratarErro(
    error,
    res,
    mensagemPadrao
  ) {
    console.error(mensagemPadrao, error);

    if (error.code === "23505") {
      return res.status(409).json({
        erro: "CNPJ já cadastrado"
      });
    }

    if (error.code === "23503") {
      return res.status(409).json({
        erro:
          "A clínica possui profissionais ou especialidades vinculadas e não pode ser excluída"
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

    const clinicas = nome
      ? await ClinicasService.buscarPorNome(nome)
      : await ClinicasService.listarTodas();

    return res
      .status(200)
      .json(clinicas);

  } catch (error) {

    return ClinicasController.tratarErro(
      error,
      res,
      "Erro interno ao listar clínicas"
    );

  }
}
  static async buscarPorId(req, res) {
    try {
      const clinica =
        await ClinicasService.buscarPorId(
          req.params.id
        );

      return res
        .status(200)
        .json(clinica);
    } catch (error) {
      return ClinicasController.tratarErro(
        error,
        res,
        "Erro interno ao buscar clínica"
      );
    }
  }

  static async cadastrar(req, res) {
    try {
      const clinica =
        await ClinicasService.cadastrar(
          req.body
        );

      return res.status(201).json({
        mensagem:
          "Clínica cadastrada com sucesso",
        clinica
      });
    } catch (error) {
      return ClinicasController.tratarErro(
        error,
        res,
        "Erro interno ao cadastrar clínica"
      );
    }
  }

  static async atualizar(req, res) {
    try {
      const clinica =
        await ClinicasService.atualizar(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        mensagem:
          "Clínica atualizada com sucesso",
        clinica
      });
    } catch (error) {
      return ClinicasController.tratarErro(
        error,
        res,
        "Erro interno ao atualizar clínica"
      );
    }
  }

  static async excluir(req, res) {
    try {
      const clinica =
        await ClinicasService.excluir(
          req.params.id
        );

      return res.status(200).json({
        mensagem:
          "Clínica excluída com sucesso",
        clinica
      });
    } catch (error) {
      return ClinicasController.tratarErro(
        error,
        res,
        "Erro interno ao excluir clínica"
      );
    }
  }
}

module.exports = ClinicasController;