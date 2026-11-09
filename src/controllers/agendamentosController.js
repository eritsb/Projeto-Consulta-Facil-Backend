const AgendamentosService =
  require(
    "../services/agendamentosService"
  );

class AgendamentosController {
  static tratarErro(
    error,
    res,
    mensagemPadrao
  ) {
    console.error(mensagemPadrao, error);

    if (error.code === "23503") {
      return res.status(400).json({
        erro:
          "Paciente, profissional ou disponibilidade informada não existe"
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        erro:
          "Essa disponibilidade já possui um agendamento"
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
      const agendamentos =
        await AgendamentosService
          .listarTodos();

      return res
        .status(200)
        .json(agendamentos);
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao listar agendamentos"
        );
    }
  }

  static async buscarPorId(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .buscarPorId(
            req.params.id,
            req.usuario
          );

      return res
        .status(200)
        .json(agendamento);
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao buscar agendamento"
        );
    }
  }

  static async listarPorPaciente(
    req,
    res
  ) {
    try {
      const agendamentos =
        await AgendamentosService
          .listarPorPaciente(
            req.params.idPaciente,
            req.usuario
          );

      return res
        .status(200)
        .json(agendamentos);
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao listar os agendamentos do paciente"
        );
    }
  }

  static async listarMe(req, res) {
    try {
      const agendamentos =
        await AgendamentosService
          .listarMe(req.usuario);

      return res
        .status(200)
        .json(agendamentos);
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao listar os agendamentos do paciente"
        );
    }
  }

  static async cadastrar(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .cadastrar(
            req.body,
            req.usuario
          );

      return res.status(201).json({
        mensagem:
          "Agendamento realizado com sucesso",
        agendamento
      });
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao realizar agendamento"
        );
    }
  }

  static async atualizar(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .atualizar(
            req.params.id,
            req.body,
            req.usuario
          );

      return res.status(200).json({
        mensagem:
          "Agendamento atualizado com sucesso",
        agendamento
      });
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao atualizar agendamento"
        );
    }
  }

  static async cancelar(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .cancelar(
            req.params.id,
            req.usuario
          );

      return res.status(200).json({
        mensagem:
          "Agendamento cancelado com sucesso",
        agendamento
      });
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao cancelar agendamento"
        );
    }
  }

  static async reagendar(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .reagendar(
            req.params.id,
            req.body,
            req.usuario
          );

      return res.status(200).json({
        mensagem:
          "Agendamento reagendado com sucesso",
        agendamento
      });
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao reagendar agendamento"
        );
    }
  }

  static async excluir(req, res) {
    try {
      const agendamento =
        await AgendamentosService
          .excluir(
            req.params.id,
            req.usuario
          );

      return res.status(200).json({
        mensagem:
          "Agendamento excluído com sucesso",
        agendamento
      });
    } catch (error) {
      return AgendamentosController
        .tratarErro(
          error,
          res,
          "Erro interno ao excluir agendamento"
        );
    }
  }
}

module.exports = AgendamentosController;