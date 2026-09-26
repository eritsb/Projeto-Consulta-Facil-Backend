const PacientesService =
  require("../services/pacientesService");

class PacientesController {
  static tratarErro(
    error,
    res,
    mensagemPadrao
  ) {
    console.error(mensagemPadrao, error);

    if (error.code === "23505") {
      return res.status(409).json({
        erro: "CPF ou e-mail já cadastrado"
      });
    }

    if (error.code === "23503") {
      return res.status(409).json({
        erro:
          "O paciente possui registros vinculados e não pode ser excluído"
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

  // static async listar(req, res) {
  //   try {
  //     const pacientes =
  //       await PacientesService.listarTodos();

  //     return res.status(200).json(pacientes);
  //   } catch (error) {
  //     return PacientesController.tratarErro(
  //       error,
  //       res,
  //       "Erro interno ao listar pacientes"
  //     );
  //   }
  // }

  //modifiquei essa parte paa a api receber o query e devolver o valor = nome. a verõ anterior ta comentada
  
  static async listar(req, res) {
    try {
      const { nome } = req.query;

      let pacientes;

      if (nome) {
        pacientes = await PacientesService.buscarPorNome(nome);
      } else {
        pacientes = await PacientesService.listarTodos();
      }

      return res.status(200).json(pacientes);
    } catch (error) {
      return PacientesController.tratarErro(
      error,
      res,
      "Erro interno ao listar pacientes"
      );
    }
  }

  static async buscarPorId(req, res) {
    try {
      const paciente =
        await PacientesService.buscarPorId(
          req.params.id
        );

      return res.status(200).json(paciente);
    } catch (error) {
      return PacientesController.tratarErro(
        error,
        res,
        "Erro interno ao buscar paciente"
      );
    }
  }

  static async cadastrar(req, res) {
    try {
      const paciente =
        await PacientesService.cadastrar(
          req.body
        );

      return res.status(201).json({
        mensagem:
          "Paciente cadastrado com sucesso",
        paciente
      });
    } catch (error) {
      return PacientesController.tratarErro(
        error,
        res,
        "Erro interno ao cadastrar paciente"
      );
    }
  }

  static async atualizar(req, res) {
    try {
      const paciente =
        await PacientesService.atualizar(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        mensagem:
          "Paciente atualizado com sucesso",
        paciente
      });
    } catch (error) {
      return PacientesController.tratarErro(
        error,
        res,
        "Erro interno ao atualizar paciente"
      );
    }
  }

  static async excluir(req, res) {
    try {
      const paciente =
        await PacientesService.excluir(
          req.params.id
        );

      return res.status(200).json({
        mensagem:
          "Paciente excluído com sucesso",
        paciente
      });
    } catch (error) {
      return PacientesController.tratarErro(
        error,
        res,
        "Erro interno ao excluir paciente"
      );
    }
  }
}

module.exports = PacientesController;